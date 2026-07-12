/**
 * Import legacy JSON donations into the new PostgreSQL schema.
 *
 * Usage: npx tsx automation/scripts/import-legacy-donations.ts
 *
 * Reads the legacy .data/donations.json file (configurable via
 * LEGACY_DONATIONS_PATH env) and imports each record into the
 * new schema.
 *
 * Idempotent — safe to re-run. Uses external_reference deduplication.
 *
 * Follow blueprint §17 migration rules:
 *   1. Normalize currency to uppercase
 *   2. Normalize email
 *   3. Upsert contact
 *   4. Derive deterministic legacy key
 *   5. Insert donation with provider = 'legacy' or 'stripe'
 *   6. Append import audit event
 *   7. Write reconciliation report
 */

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import pg from "pg";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of the existing JSON donation records. */
interface LegacyDonationRecord {
  date: string;
  email: string;
  amount: number;
  currency: string;
  type: "onetime" | "monthly" | "recurring_charge";
  stripe_session?: string;
  stripe_customer: string;
  stripe_invoice?: string;
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a deterministic legacy key for deduplication.
 *
 * Format: legacy:{date}:{email}:{amount}:{type}:{stripe_session}:{stripe_invoice}
 */
function deriveLegacyKey(record: LegacyDonationRecord): string {
  const parts = [
    "legacy",
    record.date,
    record.email.toLowerCase().trim(),
    String(record.amount),
    record.type,
    record.stripe_session || "",
    record.stripe_invoice || "",
  ];
  return parts.join(":");
}

/**
 * Determine if a record has a usable Stripe reference for unique indexing.
 */
function hasUsableStripeId(
  record: LegacyDonationRecord,
): boolean {
  return !!(record.stripe_session || record.stripe_invoice);
}

/**
 * Map legacy type to donation_kind.
 */
function mapDonationKind(
  type: LegacyDonationRecord["type"],
): "one_time" | "recurring_payment" {
  return type === "onetime" ? "one_time" : "recurring_payment";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const donationsPath =
    process.env.LEGACY_DONATIONS_PATH ??
    join(process.cwd(), ".data", "donations.json");

  // 1. Read legacy donations file
  console.log(`Reading legacy donations from: ${donationsPath}`);
  let rawData: string;
  try {
    rawData = await readFile(donationsPath, "utf-8");
  } catch (err) {
    console.error(`Failed to read donations file: ${err}`);
    process.exit(1);
  }

  let records: LegacyDonationRecord[];
  try {
    records = JSON.parse(rawData);
  } catch (err) {
    console.error(`Failed to parse donations JSON: ${err}`);
    process.exit(1);
  }

  if (!Array.isArray(records)) {
    console.error("Donations file must contain a JSON array.");
    process.exit(1);
  }

  console.log(`Found ${records.length} legacy donation record(s).`);

  // 2. Connect to database
  const client = new pg.Client({ connectionString });
  await client.connect();

  const stats: ImportStats = {
    total: records.length,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const legacyKey = deriveLegacyKey(record);

      try {
        await client.query("BEGIN");

        // 3. Normalize
        const email = record.email.toLowerCase().trim();
        const currency = (record.currency || "eur").toUpperCase();
        const amountMinor = Math.round(record.amount * 100);
        const donatedAt = new Date(record.date).toISOString();
        const provider = hasUsableStripeId(record) ? "stripe" : "legacy";

        // 4. Upsert contact by email
        const contactResult = await client.query<{ id: string }>(
          `
          INSERT INTO clarvia.contacts (email, preferred_locale)
          VALUES ($1, 'en')
          ON CONFLICT ((email)) WHERE email IS NOT NULL AND state = 'active'
          DO UPDATE SET
            last_donation_at = GREATEST(
              clarvia.contacts.last_donation_at,
              $2::timestamptz
            ),
            first_donation_at = LEAST(
              clarvia.contacts.first_donation_at,
              $2::timestamptz
            )
          RETURNING id
          `,
          [email || null, donatedAt],
        );

        const contactId = contactResult.rows[0]?.id;
        if (!contactId) {
          throw new Error(`Failed to upsert contact for email: ${email}`);
        }

        // 5. Upsert stripe_customer if we have a customer ID
        if (record.stripe_customer) {
          await client.query(
            `
            INSERT INTO clarvia.stripe_customers (
              contact_id,
              stripe_customer_id,
              livemode,
              email_snapshot
            )
            VALUES ($1, $2, true, $3)
            ON CONFLICT (stripe_customer_id)
            DO NOTHING
            `,
            [contactId, record.stripe_customer, email || null],
          );
        }

        // 6. Insert donation with external_reference dedup
        const externalRef = legacyKey;
        const donationResult = await client.query<{ id: string }>(
          `
          INSERT INTO clarvia.donations (
            contact_id,
            provider,
            donation_kind,
            status,
            currency,
            amount_gross_minor,
            donated_at,
            stripe_customer_id,
            stripe_checkout_session_id,
            stripe_invoice_id,
            external_reference,
            metadata
          )
          VALUES (
            $1, $2, $3, 'succeeded', $4, $5, $6, $7, $8, $9, $10,
            $11::jsonb
          )
          ON CONFLICT (provider, external_reference)
            WHERE external_reference IS NOT NULL
          DO NOTHING
          RETURNING id
          `,
          [
            contactId,
            provider,
            mapDonationKind(record.type),
            currency,
            amountMinor,
            donatedAt,
            record.stripe_customer || null,
            record.stripe_session || null,
            record.stripe_invoice || null,
            externalRef,
            JSON.stringify({ legacy_import: true }),
          ],
        );

        if (!donationResult.rows[0]) {
          // Already imported (dedup hit)
          await client.query("ROLLBACK");
          stats.skipped++;
          console.log(
            `  [${i + 1}/${records.length}] Skipped (already imported): ${legacyKey}`,
          );
          continue;
        }

        const donationId = donationResult.rows[0].id;

        // 7. Insert donation attribution
        await client.query(
          `
          INSERT INTO clarvia.donation_attributions (
            donation_id,
            source,
            raw
          )
          VALUES ($1, 'legacy_import', $2::jsonb)
          ON CONFLICT (donation_id) DO NOTHING
          `,
          [donationId, JSON.stringify(record)],
        );

        // 8. Update contact donation timestamps
        await client.query(
          `
          UPDATE clarvia.contacts
          SET first_donation_at = LEAST(first_donation_at, $2::timestamptz),
              last_donation_at = GREATEST(last_donation_at, $2::timestamptz)
          WHERE id = $1
          `,
          [contactId, donatedAt],
        );

        await client.query("COMMIT");
        stats.imported++;
        console.log(
          `  [${i + 1}/${records.length}] Imported: ${currency} ${record.amount} (${record.type}) — ${email}`,
        );
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        stats.errors++;
        console.error(
          `  [${i + 1}/${records.length}] Error importing ${legacyKey}:`,
          err,
        );
      }
    }

    // 9. Print reconciliation report
    console.log("\n--- Import Reconciliation Report ---");
    console.log(`Total records:  ${stats.total}`);
    console.log(`Imported:       ${stats.imported}`);
    console.log(`Skipped (dup):  ${stats.skipped}`);
    console.log(`Errors:         ${stats.errors}`);

    // Verify totals from DB
    const dbCount = await client.query<{ count: string }>(
      `SELECT count(*) AS count FROM clarvia.donations
       WHERE metadata->>'legacy_import' = 'true'`,
    );
    console.log(
      `DB legacy rows: ${dbCount.rows[0]?.count ?? "unknown"}`,
    );

    const dbTotals = await client.query<{
      currency: string;
      total: string;
      count: string;
    }>(
      `SELECT currency,
              sum(amount_gross_minor) AS total,
              count(*) AS count
       FROM clarvia.donations
       WHERE metadata->>'legacy_import' = 'true'
       GROUP BY currency
       ORDER BY currency`,
    );
    for (const row of dbTotals.rows) {
      const totalMajor = (Number(row.total) / 100).toFixed(2);
      console.log(
        `  ${row.currency}: ${row.count} donation(s), total ${row.currency} ${totalMajor}`,
      );
    }
    console.log("------------------------------------\n");

    if (stats.errors > 0) {
      console.error(
        `WARNING: ${stats.errors} record(s) failed to import. Review errors above.`,
      );
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});

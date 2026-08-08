/**
 * Migration runner for the Clarvia donation engine schema.
 *
 * Usage: npx tsx automation/scripts/migrate.ts
 *
 * Connects using DATABASE_URL_MIGRATOR (clarvia_migrator role).
 *
 * Behaviour:
 *   1. Obtains a PostgreSQL advisory lock to prevent concurrent runs.
 *   2. Calculates SHA-256 checksums for every SQL migration file.
 *   3. Rejects a changed checksum for an already-applied migration.
 *   4. Executes each new migration file in its own transaction.
 *   5. Inserts version + checksum into clarvia.schema_migrations.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = join(
  import.meta.dirname ?? new URL(".", import.meta.url).pathname,
  "..",
  "migrations",
);

// Advisory lock key — arbitrary fixed 64-bit integer for migration exclusivity.
const ADVISORY_LOCK_KEY = 839_271_654;

interface AppliedMigration {
  version: string;
  checksum: string;
}

function sha256(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL_MIGRATOR;
  if (!connectionString) {
    console.error("DATABASE_URL_MIGRATOR is not set.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    // 1. Obtain advisory lock
    console.log("Acquiring advisory lock…");
    await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_KEY]);
    console.log("Advisory lock acquired.");

    // 2. Read migration files sorted by filename
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    // 3. Ensure schema_migrations table exists (0001 creates it,
    //    but we need to handle the very first run gracefully).
    //    We check if it exists rather than creating it here,
    //    because 0001 is responsible for the schema and table.
    const appliedMigrations: Map<string, string> = new Map();
    try {
      const result = await client.query<AppliedMigration>(
        "SELECT version, checksum FROM clarvia.schema_migrations",
      );
      for (const row of result.rows) {
        appliedMigrations.set(row.version, row.checksum);
      }
    } catch {
      // Table doesn't exist yet — this is the first run.
      // 0001 will create the schema and table.
      console.log(
        "schema_migrations table not found — assuming first run.",
      );
    }

    // 4. Process each migration
    let applied = 0;
    for (const file of files) {
      const version = basename(file, ".sql");
      const filePath = join(MIGRATIONS_DIR, file);
      const content = await readFile(filePath, "utf-8");
      const checksum = sha256(content);

      const existingChecksum = appliedMigrations.get(version);

      if (existingChecksum) {
        // Already applied — verify checksum hasn't changed
        if (existingChecksum !== checksum) {
          console.error(
            `FATAL: Checksum mismatch for ${version}.\n` +
              `  Applied:  ${existingChecksum}\n` +
              `  Current:  ${checksum}\n` +
              `Migration files must not be modified after they have been applied.`,
          );
          process.exit(1);
        }
        console.log(`  ✓ ${version} (already applied)`);
        continue;
      }

      // New migration — execute in its own transaction
      console.log(`  → Applying ${version}…`);

      // Check if the SQL file wraps itself in BEGIN/COMMIT.
      // If so, execute as-is. If not, wrap in a transaction.
      const trimmed = content.trim().toUpperCase();
      const selfTransacted =
        trimmed.startsWith("BEGIN") &&
        (trimmed.endsWith("COMMIT;") || trimmed.endsWith("COMMIT"));

      if (selfTransacted) {
        // The migration manages its own transaction.
        // Execute it directly, then record it in a separate transaction.
        await client.query(content);
      } else {
        // Wrap in a transaction.
        await client.query("BEGIN");
        try {
          await client.query(content);
          await client.query("COMMIT");
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        }
      }

      // Record the migration (always outside the migration's own transaction).
      await client.query(
        `INSERT INTO clarvia.schema_migrations (version, checksum)
         VALUES ($1, $2)
         ON CONFLICT (version) DO NOTHING`,
        [version, checksum],
      );

      // Refresh the applied map for subsequent migrations
      appliedMigrations.set(version, checksum);
      applied++;
      console.log(`  ✓ ${version} applied.`);
    }

    console.log(
      `\nMigration complete. ${applied} new migration(s) applied, ${files.length - applied} already up to date.`,
    );
  } finally {
    // Release advisory lock and disconnect
    await client
      .query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_KEY])
      .catch(() => {});
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

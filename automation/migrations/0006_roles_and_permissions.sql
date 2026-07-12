-- Roles and permissions for the clarvia schema.
-- Roles are created during bootstrap (§3.2) — this migration
-- only grants privileges to the pre-existing roles.
--
-- This migration does NOT run inside a transaction because
-- GRANT statements on roles that may not exist yet would fail
-- inside a transaction block. The migration runner handles
-- idempotency via schema_migrations.

GRANT USAGE ON SCHEMA clarvia
TO clarvia_app, clarvia_automation;

-- clarvia_app: website application role
-- Can insert raw webhook rows and initial jobs, run domain
-- transactions, read and update all Clarvia domain tables.
-- Cannot mutate raw webhook rows (enforced by trigger).

GRANT SELECT, INSERT ON clarvia.webhook_events
TO clarvia_app;

GRANT SELECT, INSERT, UPDATE ON
  clarvia.webhook_processing,
  clarvia.automation_jobs,
  clarvia.side_effects,
  clarvia.contacts,
  clarvia.stripe_customers,
  clarvia.stripe_checkout_sessions,
  clarvia.recurring_commitments,
  clarvia.donations,
  clarvia.donation_attributions,
  clarvia.donation_events,
  clarvia.consent_records,
  clarvia.email_suppressions,
  clarvia.nurture_enrollments,
  clarvia.email_messages,
  clarvia.automation_state,
  clarvia.reconciliation_runs,
  clarvia.reconciliation_items
TO clarvia_app;

-- clarvia_automation: n8n / automation role
-- Can select pending job metadata and execute job lifecycle functions.
-- Cannot select raw webhook payloads, contact emails, or
-- unrestricted donor tables.

GRANT SELECT ON clarvia.automation_jobs
TO clarvia_automation;

GRANT EXECUTE ON FUNCTION
  clarvia.claim_automation_jobs(text, integer, interval),
  clarvia.complete_automation_job(uuid, text),
  clarvia.fail_automation_job(uuid, text, text, text)
TO clarvia_automation;

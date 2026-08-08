BEGIN;

CREATE TABLE clarvia.reconciliation_runs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider              text NOT NULL CHECK (provider = 'stripe'),
  run_type              text NOT NULL
                          CHECK (run_type IN ('daily', 'manual', 'deep')),
  period_start          timestamptz NOT NULL,
  period_end            timestamptz NOT NULL,
  state                 text NOT NULL DEFAULT 'running'
                          CHECK (
                            state IN (
                              'running',
                              'completed',
                              'completed_with_mismatches',
                              'failed'
                            )
                          ),
  objects_checked       integer NOT NULL DEFAULT 0,
  mismatch_count        integer NOT NULL DEFAULT 0,
  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  last_error_message    text,
  summary               jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX reconciliation_runs_started_idx
  ON clarvia.reconciliation_runs (started_at DESC);

CREATE TABLE clarvia.reconciliation_items (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_run_id  uuid NOT NULL
                           REFERENCES clarvia.reconciliation_runs(id)
                           ON DELETE CASCADE,
  object_type            text NOT NULL
                           CHECK (
                             object_type IN (
                               'checkout_session',
                               'payment_intent',
                               'invoice',
                               'subscription',
                               'refund'
                             )
                           ),
  stripe_object_id       text NOT NULL,
  finding                text NOT NULL
                           CHECK (
                             finding IN (
                               'missing_locally',
                               'amount_mismatch',
                               'currency_mismatch',
                               'status_mismatch',
                               'orphan_local_record'
                             )
                           ),
  severity               text NOT NULL
                           CHECK (severity IN ('info', 'warning', 'critical')),
  expected               jsonb NOT NULL DEFAULT '{}'::jsonb,
  actual                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  repair_job_id          uuid
                           REFERENCES clarvia.automation_jobs(id),
  resolved_at            timestamptz,
  resolution_notes       text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (
    reconciliation_run_id,
    object_type,
    stripe_object_id,
    finding
  )
);

CREATE INDEX reconciliation_items_unresolved_idx
  ON clarvia.reconciliation_items (severity, created_at)
  WHERE resolved_at IS NULL;

COMMIT;

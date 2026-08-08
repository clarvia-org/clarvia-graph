BEGIN;

CREATE TABLE clarvia.webhook_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider            text NOT NULL
                        CHECK (provider IN ('stripe', 'resend')),
  external_event_id   text NOT NULL,
  event_type          text NOT NULL,
  api_version         text,
  livemode            boolean,
  occurred_at         timestamptz,
  received_at         timestamptz NOT NULL DEFAULT now(),
  retention_until     timestamptz NOT NULL
                        DEFAULT (now() + interval '400 days'),
  signature_metadata  jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload             jsonb NOT NULL,
  payload_sha256      text NOT NULL,
  UNIQUE (provider, external_event_id)
);

CREATE INDEX webhook_events_provider_type_received_idx
  ON clarvia.webhook_events (provider, event_type, received_at DESC);

CREATE INDEX webhook_events_retention_idx
  ON clarvia.webhook_events (retention_until);

CREATE TABLE clarvia.webhook_processing (
  webhook_event_id    uuid PRIMARY KEY
                        REFERENCES clarvia.webhook_events(id)
                        ON DELETE CASCADE,
  state               text NOT NULL DEFAULT 'pending'
                        CHECK (
                          state IN (
                            'pending',
                            'leased',
                            'retry',
                            'processed',
                            'ignored',
                            'dead'
                          )
                        ),
  attempt_count       integer NOT NULL DEFAULT 0,
  available_at        timestamptz NOT NULL DEFAULT now(),
  locked_by           text,
  locked_at           timestamptz,
  lease_expires_at    timestamptz,
  processed_at        timestamptz,
  dead_lettered_at    timestamptz,
  last_error_code     text,
  last_error_message  text,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX webhook_processing_ready_idx
  ON clarvia.webhook_processing (available_at, webhook_event_id)
  WHERE state IN ('pending', 'retry');

CREATE TABLE clarvia.automation_jobs (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic                    text NOT NULL,
  dedupe_key               text NOT NULL UNIQUE,
  source_webhook_event_id  uuid
                             REFERENCES clarvia.webhook_events(id),
  payload                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  state                    text NOT NULL DEFAULT 'pending'
                             CHECK (
                               state IN (
                                 'pending',
                                 'leased',
                                 'retry',
                                 'completed',
                                 'cancelled',
                                 'dead'
                               )
                             ),
  attempt_count            integer NOT NULL DEFAULT 0,
  max_attempts             integer NOT NULL DEFAULT 8
                             CHECK (max_attempts BETWEEN 1 AND 20),
  available_at             timestamptz NOT NULL DEFAULT now(),
  locked_by                text,
  locked_at                timestamptz,
  lease_expires_at         timestamptz,
  completed_at             timestamptz,
  dead_lettered_at         timestamptz,
  last_error_code          text,
  last_error_message       text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX automation_jobs_ready_idx
  ON clarvia.automation_jobs (available_at, created_at)
  WHERE state IN ('pending', 'retry');

CREATE INDEX automation_jobs_source_event_idx
  ON clarvia.automation_jobs (source_webhook_event_id);

CREATE TRIGGER automation_jobs_touch_updated_at
BEFORE UPDATE ON clarvia.automation_jobs
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.side_effects (
  idempotency_key          text PRIMARY KEY,
  action_type              text NOT NULL,
  aggregate_type           text,
  aggregate_id             uuid,
  source_webhook_event_id  uuid
                             REFERENCES clarvia.webhook_events(id),
  request_sha256           text,
  state                    text NOT NULL DEFAULT 'started'
                             CHECK (
                               state IN (
                                 'started',
                                 'succeeded',
                                 'retryable_failure',
                                 'permanent_failure'
                               )
                             ),
  attempt_count            integer NOT NULL DEFAULT 1,
  provider_reference       text,
  response_summary         jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error_code          text,
  last_error_message       text,
  started_at               timestamptz NOT NULL DEFAULT now(),
  completed_at             timestamptz,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX side_effects_source_event_idx
  ON clarvia.side_effects (source_webhook_event_id);

CREATE TRIGGER side_effects_touch_updated_at
BEFORE UPDATE ON clarvia.side_effects
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE OR REPLACE FUNCTION clarvia.claim_automation_jobs(
  p_worker text,
  p_limit integer DEFAULT 10,
  p_lease interval DEFAULT interval '5 minutes'
)
RETURNS SETOF clarvia.automation_jobs
LANGUAGE sql
AS $$
  WITH candidates AS (
    SELECT id
    FROM clarvia.automation_jobs
    WHERE state IN ('pending', 'retry')
      AND available_at <= now()
      AND (
        lease_expires_at IS NULL
        OR lease_expires_at <= now()
      )
    ORDER BY available_at, created_at
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  UPDATE clarvia.automation_jobs AS j
  SET state = 'leased',
      attempt_count = j.attempt_count + 1,
      locked_by = p_worker,
      locked_at = now(),
      lease_expires_at = now() + p_lease,
      updated_at = now()
  FROM candidates
  WHERE j.id = candidates.id
  RETURNING j.*;
$$;

CREATE OR REPLACE FUNCTION clarvia.complete_automation_job(
  p_job_id uuid,
  p_worker text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clarvia.automation_jobs
  SET state = 'completed',
      completed_at = now(),
      locked_by = NULL,
      locked_at = NULL,
      lease_expires_at = NULL,
      last_error_code = NULL,
      last_error_message = NULL,
      updated_at = now()
  WHERE id = p_job_id
    AND state = 'leased'
    AND locked_by = p_worker;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job % is not leased by worker %', p_job_id, p_worker;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION clarvia.fail_automation_job(
  p_job_id uuid,
  p_worker text,
  p_error_code text,
  p_error_message text
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_attempt integer;
  v_max integer;
  v_next_state text;
  v_delay interval;
BEGIN
  SELECT attempt_count, max_attempts
  INTO v_attempt, v_max
  FROM clarvia.automation_jobs
  WHERE id = p_job_id
    AND state = 'leased'
    AND locked_by = p_worker
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job % is not leased by worker %', p_job_id, p_worker;
  END IF;

  IF v_attempt >= v_max THEN
    v_next_state := 'dead';
    v_delay := interval '0 seconds';
  ELSE
    v_next_state := 'retry';
    v_delay := CASE
      WHEN v_attempt = 1 THEN interval '1 minute'
      WHEN v_attempt = 2 THEN interval '5 minutes'
      WHEN v_attempt = 3 THEN interval '30 minutes'
      WHEN v_attempt = 4 THEN interval '2 hours'
      ELSE interval '12 hours'
    END;
  END IF;

  UPDATE clarvia.automation_jobs
  SET state = v_next_state,
      available_at = now() + v_delay,
      dead_lettered_at = CASE
        WHEN v_next_state = 'dead' THEN now()
        ELSE NULL
      END,
      locked_by = NULL,
      locked_at = NULL,
      lease_expires_at = NULL,
      last_error_code = left(p_error_code, 120),
      last_error_message = left(p_error_message, 2000),
      updated_at = now()
  WHERE id = p_job_id;

  RETURN v_next_state;
END;
$$;

-- Raw webhook rows cannot be changed in place. A privileged retention
-- process may delete an expired row only after setting:
-- SET LOCAL clarvia.retention_delete = 'on';

CREATE OR REPLACE FUNCTION clarvia.guard_webhook_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'webhook_events rows are immutable';
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF current_setting('clarvia.retention_delete', true) = 'on'
       AND OLD.retention_until <= now() THEN
      RETURN OLD;
    END IF;

    RAISE EXCEPTION 'webhook_events may only be deleted by the retention process';
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER webhook_events_immutable
BEFORE UPDATE OR DELETE ON clarvia.webhook_events
FOR EACH ROW EXECUTE FUNCTION clarvia.guard_webhook_event_mutation();

COMMIT;

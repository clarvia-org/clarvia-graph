BEGIN;

CREATE TABLE clarvia.consent_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          uuid NOT NULL
                        REFERENCES clarvia.contacts(id),
  purpose             text NOT NULL
                        CHECK (purpose IN ('marketing_email')),
  action              text NOT NULL
                        CHECK (action IN ('granted', 'withdrawn')),
  lawful_basis        text NOT NULL DEFAULT 'consent'
                        CHECK (lawful_basis = 'consent'),
  policy_version      text NOT NULL,
  text_version        text NOT NULL,
  locale              text NOT NULL
                        CHECK (locale IN ('en', 'fr', 'de', 'lu')),
  source              text NOT NULL
                        CHECK (
                          source IN (
                            'donation_page',
                            'subscribe_form',
                            'unsubscribe',
                            'resend_complaint',
                            'manual_admin',
                            'legacy_import'
                          )
                        ),
  source_reference    text,
  idempotency_key     text NOT NULL UNIQUE,
  evidence            jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at         timestamptz NOT NULL,
  recorded_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX consent_records_contact_purpose_idx
  ON clarvia.consent_records (
    contact_id,
    purpose,
    occurred_at DESC,
    recorded_at DESC
  );

CREATE VIEW clarvia.current_consents AS
SELECT DISTINCT ON (contact_id, purpose)
  id,
  contact_id,
  purpose,
  action,
  policy_version,
  text_version,
  locale,
  source,
  occurred_at
FROM clarvia.consent_records
ORDER BY
  contact_id,
  purpose,
  occurred_at DESC,
  recorded_at DESC,
  id DESC;

CREATE TABLE clarvia.email_suppressions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    citext NOT NULL,
  reason                   text NOT NULL
                             CHECK (
                               reason IN (
                                 'unsubscribe',
                                 'complaint',
                                 'bounce',
                                 'provider_suppression',
                                 'manual'
                               )
                             ),
  source                   text NOT NULL
                             CHECK (
                               source IN (
                                 'clarvia',
                                 'resend',
                                 'manual'
                               )
                             ),
  source_webhook_event_id  uuid
                             REFERENCES clarvia.webhook_events(id),
  source_reference         text,
  active                   boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  lifted_at                timestamptz,
  notes                    text,
  CHECK (
    (active = true AND lifted_at IS NULL)
    OR
    (active = false AND lifted_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX email_suppressions_active_reason_uidx
  ON clarvia.email_suppressions (email, reason)
  WHERE active = true;

CREATE INDEX email_suppressions_active_email_idx
  ON clarvia.email_suppressions (email)
  WHERE active = true;

CREATE TABLE clarvia.nurture_enrollments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id            uuid NOT NULL
                          REFERENCES clarvia.contacts(id),
  origin_donation_id    uuid NOT NULL
                          REFERENCES clarvia.donations(id),
  sequence_key          text NOT NULL,
  sequence_version      integer NOT NULL,
  audience_variant      text NOT NULL
                          CHECK (
                            audience_variant IN (
                              'one_time_donor',
                              'monthly_donor'
                            )
                          ),
  state                 text NOT NULL DEFAULT 'active'
                          CHECK (
                            state IN (
                              'active',
                              'completed',
                              'cancelled',
                              'suppressed'
                            )
                          ),
  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  cancelled_at          timestamptz,
  cancellation_reason   text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, sequence_key)
);

CREATE TRIGGER nurture_enrollments_touch_updated_at
BEFORE UPDATE ON clarvia.nurture_enrollments
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.email_messages (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id            uuid NOT NULL
                          REFERENCES clarvia.contacts(id),
  enrollment_id         uuid
                          REFERENCES clarvia.nurture_enrollments(id),
  donation_id           uuid
                          REFERENCES clarvia.donations(id),
  consent_record_id     uuid
                          REFERENCES clarvia.consent_records(id),
  sequence_key          text,
  sequence_step         integer,
  template_key          text NOT NULL,
  template_version      integer NOT NULL,
  locale                text NOT NULL
                          CHECK (locale IN ('en', 'fr', 'de')),
  idempotency_key       text NOT NULL UNIQUE,
  status                text NOT NULL DEFAULT 'scheduled'
                          CHECK (
                            status IN (
                              'scheduled',
                              'claimed',
                              'sent',
                              'delivered',
                              'suppressed',
                              'bounced',
                              'complained',
                              'failed',
                              'cancelled'
                            )
                          ),
  scheduled_for         timestamptz NOT NULL,
  resend_email_id       text UNIQUE,
  sent_at               timestamptz,
  delivered_at          timestamptz,
  failed_at             timestamptz,
  last_error_code       text,
  last_error_message    text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_messages_due_idx
  ON clarvia.email_messages (scheduled_for, id)
  WHERE status = 'scheduled';

CREATE INDEX email_messages_contact_idx
  ON clarvia.email_messages (contact_id, created_at DESC);

CREATE TRIGGER email_messages_touch_updated_at
BEFORE UPDATE ON clarvia.email_messages
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.automation_state (
  key           text PRIMARY KEY,
  value         jsonb NOT NULL,
  version       bigint NOT NULL DEFAULT 1,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMIT;

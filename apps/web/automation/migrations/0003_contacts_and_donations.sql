BEGIN;

CREATE TABLE clarvia.contacts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               citext,
  display_name        text,
  preferred_locale    text NOT NULL DEFAULT 'en'
                        CHECK (preferred_locale IN ('en', 'fr', 'de', 'lu')),
  country_code        char(2),
  state               text NOT NULL DEFAULT 'active'
                        CHECK (state IN ('active', 'erased')),
  first_donation_at   timestamptz,
  last_donation_at    timestamptz,
  erased_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (state = 'active' AND erased_at IS NULL)
    OR
    (state = 'erased' AND erased_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX contacts_active_email_uidx
  ON clarvia.contacts (email)
  WHERE email IS NOT NULL AND state = 'active';

CREATE INDEX contacts_last_donation_idx
  ON clarvia.contacts (last_donation_at DESC);

CREATE TRIGGER contacts_touch_updated_at
BEFORE UPDATE ON clarvia.contacts
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.stripe_customers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          uuid NOT NULL
                        REFERENCES clarvia.contacts(id),
  stripe_customer_id  text NOT NULL UNIQUE,
  livemode            boolean NOT NULL,
  email_snapshot      citext,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stripe_customers_contact_idx
  ON clarvia.stripe_customers (contact_id);

CREATE TRIGGER stripe_customers_touch_updated_at
BEFORE UPDATE ON clarvia.stripe_customers
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.stripe_checkout_sessions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id        text NOT NULL UNIQUE,
  contact_id               uuid
                             REFERENCES clarvia.contacts(id),
  stripe_customer_id       text,
  stripe_payment_intent_id text,
  stripe_subscription_id   text,
  mode                     text NOT NULL
                             CHECK (mode IN ('payment', 'subscription', 'setup')),
  donation_type            text
                             CHECK (donation_type IN ('onetime', 'monthly')),
  payment_status           text,
  session_status           text,
  amount_total_minor       bigint,
  currency                 char(3),
  marketing_opt_in         boolean NOT NULL DEFAULT false,
  consent_text_version     text,
  locale                   text
                             CHECK (locale IS NULL OR locale IN ('en', 'fr', 'de', 'lu')),
  landing_variant          text,
  attribution              jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_webhook_event_id  uuid
                             REFERENCES clarvia.webhook_events(id),
  completed_at             timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CHECK (
    currency IS NULL
    OR currency = upper(currency)
  )
);

CREATE INDEX stripe_checkout_sessions_subscription_idx
  ON clarvia.stripe_checkout_sessions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX stripe_checkout_sessions_payment_intent_idx
  ON clarvia.stripe_checkout_sessions (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TRIGGER stripe_checkout_sessions_touch_updated_at
BEFORE UPDATE ON clarvia.stripe_checkout_sessions
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.recurring_commitments (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id               uuid NOT NULL
                             REFERENCES clarvia.contacts(id),
  stripe_customer_id       text NOT NULL,
  stripe_subscription_id   text NOT NULL UNIQUE,
  status                   text NOT NULL
                             CHECK (
                               status IN (
                                 'incomplete',
                                 'incomplete_expired',
                                 'trialing',
                                 'active',
                                 'past_due',
                                 'canceled',
                                 'unpaid',
                                 'paused'
                               )
                             ),
  amount_minor             bigint
                             CHECK (amount_minor IS NULL OR amount_minor >= 0),
  currency                 char(3),
  interval_name            text,
  interval_count           integer,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean NOT NULL DEFAULT false,
  cancel_at                timestamptz,
  canceled_at              timestamptz,
  ended_at                 timestamptz,
  metadata                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_webhook_event_id  uuid
                             REFERENCES clarvia.webhook_events(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CHECK (
    currency IS NULL
    OR currency = upper(currency)
  )
);

CREATE INDEX recurring_commitments_contact_status_idx
  ON clarvia.recurring_commitments (contact_id, status);

CREATE TRIGGER recurring_commitments_touch_updated_at
BEFORE UPDATE ON clarvia.recurring_commitments
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.donations (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id                  uuid
                                REFERENCES clarvia.contacts(id),
  recurring_commitment_id     uuid
                                REFERENCES clarvia.recurring_commitments(id),
  provider                    text NOT NULL
                                CHECK (
                                  provider IN (
                                    'stripe',
                                    'bank_transfer',
                                    'github_sponsors',
                                    'legacy'
                                  )
                                ),
  donation_kind               text NOT NULL
                                CHECK (
                                  donation_kind IN (
                                    'one_time',
                                    'recurring_payment'
                                  )
                                ),
  status                      text NOT NULL
                                CHECK (
                                  status IN (
                                    'pending',
                                    'succeeded',
                                    'partially_refunded',
                                    'refunded',
                                    'disputed',
                                    'failed',
                                    'cancelled'
                                  )
                                ),
  currency                    char(3) NOT NULL,
  amount_gross_minor          bigint NOT NULL
                                CHECK (amount_gross_minor >= 0),
  amount_refunded_minor       bigint NOT NULL DEFAULT 0
                                CHECK (amount_refunded_minor >= 0),
  processor_fee_minor         bigint,
  amount_net_minor            bigint,
  donated_at                  timestamptz NOT NULL,
  stripe_customer_id          text,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  stripe_charge_id            text,
  stripe_invoice_id           text,
  stripe_subscription_id      text,
  external_reference          text,
  source_webhook_event_id     uuid
                                REFERENCES clarvia.webhook_events(id),
  metadata                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CHECK (currency = upper(currency)),
  CHECK (amount_refunded_minor <= amount_gross_minor)
);

CREATE UNIQUE INDEX donations_stripe_checkout_session_uidx
  ON clarvia.donations (stripe_checkout_session_id)
  WHERE provider = 'stripe'
    AND stripe_checkout_session_id IS NOT NULL;

CREATE UNIQUE INDEX donations_stripe_payment_intent_uidx
  ON clarvia.donations (stripe_payment_intent_id)
  WHERE provider = 'stripe'
    AND stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX donations_stripe_charge_uidx
  ON clarvia.donations (stripe_charge_id)
  WHERE provider = 'stripe'
    AND stripe_charge_id IS NOT NULL;

CREATE UNIQUE INDEX donations_stripe_invoice_uidx
  ON clarvia.donations (stripe_invoice_id)
  WHERE provider = 'stripe'
    AND stripe_invoice_id IS NOT NULL;

CREATE UNIQUE INDEX donations_external_reference_uidx
  ON clarvia.donations (provider, external_reference)
  WHERE external_reference IS NOT NULL;

CREATE INDEX donations_contact_date_idx
  ON clarvia.donations (contact_id, donated_at DESC);

CREATE INDEX donations_status_date_idx
  ON clarvia.donations (status, donated_at DESC);

CREATE INDEX donations_subscription_idx
  ON clarvia.donations (stripe_subscription_id, donated_at DESC)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE TRIGGER donations_touch_updated_at
BEFORE UPDATE ON clarvia.donations
FOR EACH ROW EXECUTE FUNCTION clarvia.touch_updated_at();

CREATE TABLE clarvia.donation_attributions (
  donation_id         uuid PRIMARY KEY
                        REFERENCES clarvia.donations(id)
                        ON DELETE CASCADE,
  landing_variant     text,
  source              text,
  medium              text,
  campaign            text,
  term                text,
  content             text,
  gclid               text,
  ga_client_id        text,
  captured_at         timestamptz NOT NULL DEFAULT now(),
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE clarvia.donation_events (
  id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  donation_id              uuid
                             REFERENCES clarvia.donations(id),
  source_webhook_event_id  uuid NOT NULL
                             REFERENCES clarvia.webhook_events(id),
  event_type               text NOT NULL,
  provider_object_type     text,
  provider_object_id       text,
  occurred_at              timestamptz NOT NULL,
  details                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX donation_events_dedupe_uidx
  ON clarvia.donation_events (
    source_webhook_event_id,
    event_type,
    coalesce(provider_object_id, '')
  );

CREATE INDEX donation_events_donation_idx
  ON clarvia.donation_events (donation_id, occurred_at DESC);

COMMIT;

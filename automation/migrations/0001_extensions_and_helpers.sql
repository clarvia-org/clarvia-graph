BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS clarvia;

CREATE TABLE IF NOT EXISTS clarvia.schema_migrations (
  version       text PRIMARY KEY,
  checksum      text NOT NULL,
  applied_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION clarvia.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMIT;

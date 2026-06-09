-- Multiple pending transfers per asset (replaces assets.pending column)

CREATE TABLE IF NOT EXISTS asset_pendings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  asset_id bigint NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL CHECK (amount_usd > 0),
  source text NOT NULL DEFAULT 'From external wallet',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS asset_pendings_asset_id_idx ON asset_pendings(asset_id);

ALTER TABLE assets DROP COLUMN IF EXISTS pending;

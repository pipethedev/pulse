CREATE TABLE IF NOT EXISTS sites (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url        STRING NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checks (
  id             UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id        UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  status         STRING NOT NULL,
  status_code    INT,
  latency_ms     INT,
  screenshot_key STRING,
  checked_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checks_site_id_checked_at_idx
  ON checks (site_id, checked_at DESC);

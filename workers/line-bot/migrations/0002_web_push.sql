CREATE TABLE IF NOT EXISTS web_push_subscription (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_pk INTEGER NOT NULL REFERENCES line_user(id),
  line_uid TEXT NOT NULL,
  line_user_region_subscription_pk INTEGER NOT NULL REFERENCES line_user_region_subscription(id),
  pref_region_id TEXT NOT NULL,
  municipality_region_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  content_encoding TEXT,
  expiration_time INTEGER,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_web_push_subscription_user_status
  ON web_push_subscription(line_user_pk, status);

CREATE INDEX IF NOT EXISTS idx_web_push_subscription_region_status
  ON web_push_subscription(pref_region_id, municipality_region_id, status);

CREATE INDEX IF NOT EXISTS idx_web_push_subscription_region_subscription
  ON web_push_subscription(line_user_region_subscription_pk, status);

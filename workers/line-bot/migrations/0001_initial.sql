CREATE TABLE IF NOT EXISTS line_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_uid TEXT NOT NULL UNIQUE,
  follow_status TEXT NOT NULL CHECK (follow_status IN ('active', 'blocked')),
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('active', 'paused')),
  friendship_confirmed_at TEXT,
  blocked_at TEXT,
  delivery_status_changed_at TEXT,
  last_interaction_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS line_user_region_subscription (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_pk INTEGER NOT NULL REFERENCES line_user(id),
  pref_region_id TEXT NOT NULL,
  municipality_region_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  registration_source TEXT NOT NULL CHECK (registration_source IN ('liff', 'admin')),
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_line_user_region_subscription_one_active
  ON line_user_region_subscription(line_user_pk)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_line_user_region_subscription_pref
  ON line_user_region_subscription(pref_region_id, status);

CREATE INDEX IF NOT EXISTS idx_line_user_region_subscription_municipality
  ON line_user_region_subscription(municipality_region_id, status);

CREATE TABLE IF NOT EXISTS line_user_region_subscription_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_pk INTEGER NOT NULL REFERENCES line_user(id),
  pref_region_id TEXT NOT NULL,
  municipality_region_id TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  changed_by TEXT NOT NULL CHECK (changed_by IN ('user', 'system', 'admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS line_user_delivery_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_pk INTEGER NOT NULL REFERENCES line_user(id),
  from_status TEXT,
  to_status TEXT NOT NULL CHECK (to_status IN ('active', 'paused', 'blocked')),
  change_reason TEXT NOT NULL CHECK (
    change_reason IN ('user_pause', 'user_resume', 'webhook_follow', 'webhook_unfollow', 'admin_change')
  ),
  changed_by TEXT NOT NULL CHECK (changed_by IN ('user', 'system', 'admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS line_webhook_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  line_uid TEXT,
  payload_json TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  processing_status TEXT NOT NULL CHECK (
    processing_status IN ('received', 'processed', 'retry_wait', 'failed', 'dead_letter')
  ),
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  next_retry_at TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS line_notification_campaign (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  election_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  target_scope TEXT NOT NULL CHECK (target_scope IN ('prefecture', 'municipality')),
  target_region_id TEXT NOT NULL,
  message_payload_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'approved', 'sending', 'cancel_requested', 'sent', 'canceled', 'failed')
  ),
  recipient_count_preview INTEGER,
  recipient_count_locked INTEGER,
  recipient_snapshot_hash TEXT,
  created_by TEXT,
  approved_by TEXT,
  approved_at TEXT,
  locked_at TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_line_notification_campaign_status
  ON line_notification_campaign(status, sent_at);

CREATE INDEX IF NOT EXISTS idx_line_notification_campaign_target
  ON line_notification_campaign(target_scope, target_region_id, status);

CREATE TABLE IF NOT EXISTS line_notification_delivery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL REFERENCES line_notification_campaign(id),
  line_user_pk INTEGER NOT NULL REFERENCES line_user(id),
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('queued', 'sending', 'sent', 'failed', 'skipped')),
  skip_reason TEXT,
  provider_request_id TEXT,
  provider_error_code TEXT,
  provider_error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, line_user_pk)
);

CREATE TABLE IF NOT EXISTS line_notification_candidate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  election_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  target_scope TEXT NOT NULL CHECK (target_scope IN ('prefecture', 'municipality')),
  target_region_id TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  generation_reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'approved', 'dismissed')),
  campaign_id INTEGER REFERENCES line_notification_campaign(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

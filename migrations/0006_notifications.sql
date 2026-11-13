-- Notifications: only useful ones (a friend adds you to a workout, changes or moves it, leaves it, asks to be your
-- friend or accepts). No reminders.
-- push_subs: one row per phone or computer that turned notifications on. last: the newest notice that device showed.
CREATE TABLE IF NOT EXISTS push_subs (
  endpoint TEXT PRIMARY KEY,
  profile TEXT NOT NULL,
  last INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS push_subs_profile ON push_subs (profile);

-- What a notification says and where tapping it opens. The push itself carries nothing; the device fetches this.
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS notices_profile ON notices (profile, id);

-- The app's own push sender key (Web Push VAPID), made by the Worker the first time it is needed.
CREATE TABLE IF NOT EXISTS app_keys (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

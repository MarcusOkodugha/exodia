-- What people do in the app, for the admin dashboard: opens, pages and taps. No training data, no text typed.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  profile TEXT NOT NULL,
  kind TEXT NOT NULL,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS events_at ON events (at);
CREATE INDEX IF NOT EXISTS events_profile ON events (profile, at);

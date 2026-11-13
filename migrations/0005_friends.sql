-- Friends and Train together.
-- sharing: what each person lets friends see, and the handle friends know them by (never the profile key).
CREATE TABLE IF NOT EXISTS sharing (
  profile TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  recovery INTEGER NOT NULL DEFAULT 1,
  strength INTEGER NOT NULL DEFAULT 1,
  workouts INTEGER NOT NULL DEFAULT 1,
  bodyweight INTEGER NOT NULL DEFAULT 0,
  gym INTEGER NOT NULL DEFAULT 0,
  findable INTEGER NOT NULL DEFAULT 1,
  updated INTEGER NOT NULL
);

-- One row per pair: a asked b; status 'asked' until b accepts, then 'friends'.
CREATE TABLE IF NOT EXISTS friends (
  a TEXT NOT NULL,
  b TEXT NOT NULL,
  status TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY (a, b)
);
CREATE INDEX IF NOT EXISTS friends_b ON friends (b);

-- Train together: one plan per group and day. members is a JSON array of profile keys.
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  kind TEXT NOT NULL,
  owner TEXT NOT NULL,
  by TEXT NOT NULL,
  members TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS plans_date ON plans (date);

-- Beta and launch: a feature with no launched_at is only for Marcus (and test profiles); Launch in Admin sets it.
CREATE TABLE IF NOT EXISTS features (
  name TEXT PRIMARY KEY,
  launched_at INTEGER
);

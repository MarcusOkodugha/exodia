CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL DEFAULT 0,
  meta TEXT,
  meta_updated INTEGER NOT NULL DEFAULT 0,
  meta_seq INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);

CREATE TABLE sessions (
  profile TEXT NOT NULL,
  date TEXT NOT NULL,
  data TEXT,
  updated INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  PRIMARY KEY (profile, date)
);

CREATE INDEX sessions_seq ON sessions (profile, seq);

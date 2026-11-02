CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  profile TEXT NOT NULL,
  name TEXT,
  kind TEXT,
  title TEXT,
  details TEXT,
  said TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

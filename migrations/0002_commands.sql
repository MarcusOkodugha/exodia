CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  profile TEXT,
  name TEXT,
  said TEXT,
  result TEXT
);

CREATE INDEX commands_at ON commands (at);

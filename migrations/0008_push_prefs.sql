-- Optional notifications per device: hits = also tell me when a friend hits Exodia (off by default).
ALTER TABLE push_subs ADD COLUMN hits INTEGER NOT NULL DEFAULT 0;

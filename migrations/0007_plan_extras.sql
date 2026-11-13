-- Train together extras, both optional: a note everyone in the plan sees, and the muscles you'll train
-- (a JSON array of muscle keys, picked on the figures).
ALTER TABLE plans ADD COLUMN note TEXT NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN note_by TEXT NOT NULL DEFAULT '';
ALTER TABLE plans ADD COLUMN muscles TEXT NOT NULL DEFAULT '[]';

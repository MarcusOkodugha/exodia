-- Train together: a sent plan that changed since everyone was last told (kind, day, note, muscles, people).
-- Nobody is told by itself; the app shows "Notify again", which tells everyone once and clears it.
ALTER TABLE plans ADD COLUMN edited INTEGER NOT NULL DEFAULT 0;

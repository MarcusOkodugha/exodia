-- Train together invites. A new plan is a draft (sent = 0): picking people, the day, muscles and a note tells
-- nobody. "Send invite" sets sent = 1 and tells everyone once. Plans from before this were already sent.
-- rsvp: JSON {profile key: "yes" | "no"}; "yes" = going, anything else = invited (can still say Going).
ALTER TABLE plans ADD COLUMN sent INTEGER NOT NULL DEFAULT 1;
ALTER TABLE plans ADD COLUMN rsvp TEXT NOT NULL DEFAULT '{}';

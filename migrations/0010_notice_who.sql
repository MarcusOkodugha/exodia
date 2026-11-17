-- In-app notifications for everyone (not only phones with push on): who a notice is from, for its avatar.
ALTER TABLE notices ADD COLUMN who TEXT NOT NULL DEFAULT '';

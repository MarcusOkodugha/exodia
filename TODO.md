# Exodia: open list

The shared to-do list for Marcus and every Claude session. Read it at the start, add anything Marcus asks for that isn't done yet, and move items to Done when they're live. Newest first. Keep it short.

## Waiting on Marcus

- [x] **Make sure Cloudflare can never charge the card.** Marcus confirmed billing is off (Nov 3). Check [Workers plans](https://dash.cloudflare.com/379fa967eba06ef21141519c2922cfcc/workers/plans) says Free and [Billing](https://dash.cloudflare.com/379fa967eba06ef21141519c2922cfcc/billing) has no subscriptions; remove the card if one is saved. Keep R2 out of the API token. Also check the Google AI key is on the free tier (no billing).
- [x] **Cloudflare key for this Claude environment.** Added Nov 3; network to api.cloudflare.com and the live site works. Next: a new chat confirms the key with `npx wrangler whoami`. Lets Claude deploy in about 15 seconds instead of 1–3 minutes, check the live site, and set secrets itself. Steps: create an "Edit Cloudflare Workers" API token (+ Account → D1 → Edit), then in claude.ai/code → my-cloud-env → Edit add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, and allow `api.cloudflare.com` and `exodia.marcusokodugha.workers.dev` under Network access.
- [ ] 🔴 **D1 permission on the Cloudflare key.** The key can deploy but can't read the database, so Claude can't look at what Romy and Adam actually sent. Add Account → D1 → Edit to the "Edit Cloudflare Workers" token.
- [ ] **Decide:** a name on a new phone brings your data back. Names aren't unique (two Adams), so it needs name + a short code. Changes the database; waiting for Marcus.
- [ ] **`/marcus` code.** Set `MARCUS_CODE` (Claude can do it once the Cloudflare key is in; otherwise `cd ~/code/exodia && npx wrangler secret put MARCUS_CODE` in Terminal on the Mac).
- [ ] **Old Claude's memory into CLAUDE.md.** In the Mac Terminal Claude: "Add the useful, non-secret parts of your Exodia memory to CLAUDE.md in the repo, then commit and push."
- [ ] **Decide:** keep `/join` for everyone else, or add `/other`.
- [ ] **Decide:** keep Exodia on the Mpya Claude account, or move it to a personal Claude account.

## To do (Claude)

- [ ] UX, not done yet: tapping anywhere on the bottom box opens the panel; Return sends after one line on iPhone; the "Latest top set" tile on Trends jumps to Home.
- [ ] Check iPhone voice with friends again (the phone's own speech-to-text was removed in v187).
- [ ] New Exodia Status page for this account (waiting for Marcus's go-ahead).
- [ ] Check the new fist animation on a real phone once Marcus has seen it.

## Done (recent)

- UX: Home keeps your place, only the exercise name opens Trends, the box goes back to today, Editing ends with Edit mode, Undo on Quick add and + Set, no reload while reading or typing, Edit away from the arrow, old messages don't overwrite typing, long press 0.7 s, result toast starts small (v190)
- Friends only share the plain /join link; name in the link and the private link are Marcus-only (v189)
- Import reads tables on the phone: CSV, TSV, Excel, OpenDocument, JSON, zip, rows pasted from a sheet; Strong, Hevy, FitNotes and Swedish columns; 10+ years in about a second; over 99 days no longer fails; notes go to the AI in parts (v188)
- Private /me/ links ask "This is Romy's Exodia, is it yours?"; Start fresh in the menu; clearer "Your private link" (v188)
- Trends: Squat / Bench / Deadlift buttons on top, More lifts, tap switches the chart (v188)
- Voice: full text kept (was cut at 300 characters), "Voice note" label with the words, "Send as feedback" when not understood, "Understanding…" while working (v188)
- Voice: phone's own speech-to-text removed, only the recording → Whisper + Gemini Flash; mangled numbers handled (v187)
- Feedback only when you say "feedback"/"feature" in the main box; builds only from Admin (v186)
- Admin log: names, other people on the left (v185)
- Quick add: Bench always there, Show all, opens higher (v183–184)
- Add your data in the menu, StrengthLog export steps (v182)
- Admin: Building… → "Exodia update deployed"; no zoom on phone; "Exodia is on it" (v178–180)
- Excel (.xlsx) import, file limit raised to ~320k characters (about 2000+ rows) (v181)
- Phone: weekly volume sits under Big 3, above other lifts (v179)
- Blank start shows empty charts and Big 3 (v176)
- Smoother fist: clean closed fist, whole finger outlines (v175)
- Onboarding: two clear choices, example data without a made-up name (v175)
- Admin and Feedback: typing keeps the page visible, no panel (v174)
- Weekly volume: calendar weeks, week numbers, average line in its own space, top-rounded bars (v171–173)
- Stronger mouse glow on desktop (v171)
- Updates load by themselves; pill above the box only as a fallback (v167)
- Shimmer on the "Adding…" text, varied box examples, quiet hint after 5 days (v167)
- `/marcus` link with one-time code (needs the code set)
- Feedback from any box: users → feedback list, Marcus → Claude builds it
- Admin "Change the app" box, auto-deploy from GitHub
- Day view polish: plus after @, e1RM once per day, quieter exercise names, tighter rows, stronger red lines, darker summary line

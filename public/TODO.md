# Exodia: open list

The shared to-do list for Marcus and every Claude session. Read it at the start, add anything Marcus asks for that isn't done yet, and move items to Done when they're live. Newest first. Keep it short.

## Waiting on Marcus

Shown in the app as the red pill only Marcus sees (newest first). Format: `- [ ] **Title.** Why, in one line.`, then indented steps (`1.`) with links. A title starting with `Decide:` gets Yes / No buttons that send the answer to Claude.

- [ ] 🔴 **Give the Cloudflare key database (D1) access.** The key can deploy but can't read the database, so Claude can't see what Romy and Adam sent or fix their data.
  1. Open [Cloudflare API tokens](https://dash.cloudflare.com/profile/api-tokens)
  2. Next to "Edit Cloudflare Workers", tap ⋯ → Edit
  3. Under Permissions tap + Add more, choose Account → D1 → Edit
  4. Tap Continue to summary → Update token
  5. Tell Claude "D1 is on"
- [ ] **Decide: name + a 4-digit code brings your data to a new phone?** Names aren't unique (two Adams), so a short code makes it safe. Changes the database.
- [ ] **Decide: remove the long press on a day?** Holding a closed day opens Edit mode by accident. Every open day already has an Edit button.
- [ ] **Decide: make an Exodia status page?** One page with what's live, what's left and the latest version.
- [ ] **Decide: keep Exodia on the Mpya Claude account?** No means moving it to a personal Claude account.
- [ ] **Move the old Claude's memory into CLAUDE.md.** Only you can reach the Mac Terminal Claude.
  1. Open Terminal on your Mac and start Claude in the project: `cd ~/code/exodia && claude`
  2. Say: "Add the useful, non-secret parts of your Exodia memory to CLAUDE.md, then commit and push."

## To do (Claude)

- [ ] UX, not done yet: Return sends after one line on iPhone; the "Latest top set" tile on Trends jumps to Home.
- [ ] Check iPhone voice with friends again (the phone's own speech-to-text was removed in v187).
- [ ] Check the new fist animation on a real phone once Marcus has seen it.

## Done (recent)

- Quick add: no "Show all" button; the main picks, then a clear "More exercises" line with the rest in a quieter style (v196)
- Anatomy legend on a computer: stripes follow whole rows again; every change now gets a full screenshot sweep of all pages (`tools/screens.cjs`) (v196)
- Box panel opens as just a bar that bounces twice; drag it to any height, flick up for the usual size, flick down or tap to close it again; + and errors still open it fully (v195)
- Red "N left" pill for Marcus at the top: opens to what's waiting on him, with steps, links and Yes / No for decisions (v194)
- Friends share only `/join` (decided Nov 3); Cloudflare billing off and Cloudflare key added (Nov 3)
- Menu item with your name is now "Settings" (sliders icon); the page says Settings above your name (v193)
- `/marcus` link and its code box removed (v192)
- Undo and Redo several steps back (up to 30 this visit): in the toast, at the bottom of the menu, ⌘Z / ⇧⌘Z on a computer (v191)
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
- Feedback from any box: users → feedback list, Marcus → Claude builds it
- Admin "Change the app" box, auto-deploy from GitHub
- Day view polish: plus after @, e1RM once per day, quieter exercise names, tighter rows, stronger red lines, darker summary line

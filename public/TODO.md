# Exodia: open list

The shared to-do list for Marcus and every Claude session. Read it at the start, add anything Marcus asks for that isn't done yet, and move items to Done when they're live. Newest first. Keep it short.

## Waiting on Marcus

Shown in the app as the red pill only Marcus sees (newest first). Format: `- [ ] **Title.** Why, in one line.`, then indented steps (`1.`) with links. A title starting with `Decide:` gets Yes / No buttons that send the answer to Claude.


## To do (Claude)

- [ ] Once both friends on the shared log have answered "Who's using Exodia on this phone?", delete the SPLIT_PROFILES secret.
- [ ] UX, not done yet: Return sends after one line on iPhone; the "Latest top set" tile on Trends jumps to Home.
- [ ] Check iPhone voice with friends again (the phone's own speech-to-text was removed in v187).
- [ ] Check the new fist animation on a real phone once Marcus has seen it.

## Done (recent)

- Files wait in the box as chips so a note can go with them; a table with dates is added straight away (Undo); a program without dates or with gaps is placed by the AI using the note, missing values filled in, and shown first: "Add 21 days (Sat 7 Mar – Wed 22 Apr), 380 sets? · Add it" (v215)
- "Exodia is on it" banner and toasts no longer blink / replay their entrance when you change page; they animate only the first time (v214)

- Drop or paste a file (Excel, CSV, text) anywhere on the page and the box takes it; the box outlines while you drag; a Google Drive link says how to download the file instead (v213)

- Search bar on desktop is a calmer 40px tall (was 48px like the menu rows) (v212)
- "Exodia is on it" banner sits in the middle of the main column on desktop and stays up (max 8 min) until the change is live; the admin log shows what was built (v210)
- Trends chart: "est. 305 kg" under the chart stays on one line, kg never drops down alone (v211)
- Desktop right panel: your other lifts now sit under Squat, Bench and Deadlift like on the phone, with Show all; the separate Best lifts list is gone (v209)
- Friends' messages in the main box that aren't training go to Marcus as feedback (they see "Sent to Marcus"); new feedback shows in Marcus's red pill with Build it / Not now; when something doesn't go through, the panel opens on the chat with the reason, not Quick add; the sweep also runs as a friend (v208)
- Exodia: 10 days to hit it, and a heavy top set is 80% of your best (was 7 days, 85%) (v207)
- Decided: Return keeps sending (fastest for one-line logs; pasted notes keep their lines)
- Tapping the box opens the panel small, showing Quick add's first rows (Import, Bench, Squat, Deadlift) and a peek of more; an arrow next to "Quick add" grows it to full size and shrinks it back (v206)
- Shared log split switched on (SPLIT_PROFILES set, Nov 4)
- Trends list: "Best lifts" heading with air after the chart, row lines start after the dot, a thin clay line on the lift on the chart, × 1 shown, Show all in plain text (v205)
- New users: the box's + is a paperclip that opens the file picker; with lifts it's + → Quick add (Import from a file first) (v205)
- Two friends on one shared log: each phone asks once "Who's using Exodia on this phone?"; the owner keeps the log, the other gets their own under their name (v205)
- After an update, a quiet "Exodia updated" pill at the top for about a minute; × or a swipe closes it, no tap needed for the update (v204)
- Trends: one list of lifts under the graph, no grey; the lift on the chart gets a clay dot and "On chart"; weights, kg and reps in straight columns; Show all / Show fewer (v203)
- Updates load by themselves again whenever nothing is being typed, and come back to the same page, scroll and lift; if one has to wait, the notice sits at the top in clay (v203)
- Trends: Squat · Bench · Deadlift is a switch inside the chart card right under the graph, in kg, no "× 1"; other lifts listed under it, three shown, "Show all N lifts" opens the rest (v202)
- Cloudflare key has D1 access (Nov 3)
- Trends: one lift card under the chart: Squat · Bench · Deadlift with kg, your other lifts below, a clear "Show all N lifts" row; the waiting pill sits top right in clay, just the dot and number on a phone (v201)
- Decided (Nov 3): no name + code for new phones; Exodia stays on the Mpya Claude account; no status page; old Mac Claude memory dropped
- Lift buttons show the heaviest set you actually lifted (175 × 5), not the estimate; cardio removes like a set (swipe, Edit → minus, × on a computer) with Undo; Edit makes what you can change glow twice; long press no longer starts iPhone text selection; pencil next to your name in Settings; Start blank says you can add old workouts later; red pill moved next to the menu so the dev button is free, dev button top right on a computer too; gap between Try again and Send as feedback (v200)
- Decided: keep the long press (Nov 3)
- Trends: "What you said" next to a lift's name opens the Log with the messages about that lift (v197)
- Quick add: no "Show all" button; the main picks, then a clear "More exercises" line with the rest in a quieter style (v196)
- Anatomy legend on a computer: stripes follow whole rows again; every change now gets a full screenshot sweep of all pages (`tools/screens.cjs`) (v197)
- Squat, Bench, Deadlift buttons sit under the Trends chart, only those three, and now also under the chart on desktop (v197)

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

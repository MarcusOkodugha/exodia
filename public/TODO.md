# Exodia: open list

The shared to-do list for Marcus and every Claude session. Read it at the start, add anything Marcus asks for that isn't done yet, and move items to Done when they're live. Newest first. Keep it short.

## Waiting on Marcus

Shown in the app as the red pill only Marcus sees (newest first). Format: `- [ ] **Title.** Why, in one line.`, then indented steps (`1.`) with links. A title starting with `Decide:` gets Yes / No buttons that send the answer to Claude.

- [ ] **Decide: turn on paid Google AI?** The free tier runs out on the strong models (3.8/3.5/3.7 Flash all answer "429 too many requests"), so notes fall to Flash-Lite, which lost "Football" for Isabella. Paid costs about $0.001 per note.
  1. Open [aistudio.google.com/apikey](https://aistudio.google.com/apikey), find the key Exodia uses, tap **Set up billing** on its project
- [ ] **Admin builds on your second Claude account.** Builder 1's builds haven't landed since 4 Nov; Builder 2 works and is already the default. It only needs its token, all from the phone.
  1. Open [the Exodia change task](https://claude.ai/code/routines/trig_01YTmBu1zKvXCvCHAwZvnYxG) → menu (⋯) next to its name → **Edit** → in the **Trigger** row tap **+** → **API** → **Generate token** → copy it (shown once, no Save needed)
  2. Open [Cloudflare → exodia → Settings](https://dash.cloudflare.com/?to=/:account/workers/services/view/exodia/production/settings) → **Variables and Secrets** → **+ Add** → Type **Secret**, name `CLAUDE_TASK_TOKEN_2`, paste → **Deploy**
  3. Send a small change from /admin to test it
- [ ] **Decide: Claude for imports?** Imports use Gemini (free); Claude Sonnet 5.5 reads hard files better but needs an Anthropic API key with billing (a few cents per file).
## Epics (later, plan before building)

Three big pieces Marcus wants done properly when the time comes. Don't start one without planning it with him first.

- [ ] **Friends.** See a friend from the top of Home without it getting in the way: tap to open their Exodia (recovery, strength, recent days), one tap back to yours. For planning sessions together.
- [ ] **Training program.** Programs inside Exodia (plan days and weeks, follow along, log against them).
- [ ] **Apple Health.** Connect to the Health app (workouts, steps, bodyweight in; training out).

## To do (Claude)

- [ ] **Gym visits (8 Nov):** fill the calendar with days Marcus was at the gym, from Nordic Wellness, then Nordic Performance Center (later Gymet). Start with export or screenshots; waiting on one screenshot of the visit history.
- [ ] **Calendar "Show every year" (8 Nov):** each year looks whole but scrolls sideways. Options sent; recommended half-year rows on phone, whole year in one row on the computer.

- [ ] **Experiment: pill choice on the first screen (Marcus to judge, 8 Nov):** two open hands, blue pill = start fresh, red pill = bring your history. Mockup sent; only goes in if it really nails it.
- [ ] **Vibe-coded audit (8 Nov), still open:** fewer eyebrow labels (#2), first screen shows the product with a specific headline (#6/#9), contrast of small grey text (#15), e1RM column lines (#17).

- [ ] **Computer right panel (Marcus to pick, 8 Nov):** Home = the phone Trends page, narrow, scrolls; Trends = something else (5 options sent in chat).

- [ ] **Three big epics (Marcus, 7 Nov 2026: execute perfectly when the time comes; keep through every session switch):**
  1. **Friends:** see a friend's Exodia from yours without it getting in the way. Tap to see their info (recovery, training, levels) and get back to yourself in one tap, so you can plan sessions together.
  2. **Training programs** in Exodia.
  3. **Health connection:** see the Health + brain item below.
  - With the native app: **clips on sets**: tap a set to see its clip looping, with a small overlay ("Deadlift 290 × 1 @ 8.5 · e1RM 303") and scrubbing. The native app points at the video in Photos (no copy, no extra space, nothing uploaded). Not as a web app: it would double the space and couldn't sync on the free plan (decided 8 Nov 2026).
- [ ] **Health + brain (Marcus's idea, 7 Nov 2026, keep until done).** Behind an **Experimental** switch in Settings, Marcus only at first, nothing loads for others:
  - Apple Health → Exodia: web apps can't read HealthKit, so an iPhone Shortcut sends steps, cardio/workouts and sleep each night to a new `/api/health` (per day, on the profile). Give Marcus tap-by-tap Shortcut steps.
  - Show: movement/cardio volume per week, sleep last nights, sleep before PR days vs other days (correlation).
  - A brain like the anatomy, regions coloured by sleep, energy and training load; later "train the brain".
  - Android (Samsung Health / Health Connect) and full iOS HealthKit need a native app: look at wrapping Exodia (Capacitor or similar) for iOS + Android so Health connects directly.
  - Waiting on Marcus's go-ahead to start (asked 7 Nov).
- [ ] Voice: show the words while it's still working.
- [ ] Share to Exodia: Android share sheet, and the clearest way on iPhone.
- [ ] Smoothness pass: find everything that jumps instead of animating.
- [ ] The "Latest top set" tile on Trends jumps to Home; Return sends after one line on iPhone.
- [ ] First visit: work on the whole landing experience with Marcus.
- [ ] Check iPhone voice with friends again; check the fist animation on a real phone.
- [ ] Once both friends on the shared log have answered "Who's using Exodia on this phone?", delete the SPLIT_PROFILES secret.

## Done (recent)
- ✓ Red pill hidden: invisible 44px spot left of the top-right icon (phone) / right of the name in the sidebar (computer); visible button on Admin (v366)
- ✓ Clay underline for every picked option (chips + switches); toast numbers kept together; inner pills in the box 10px corners (#14 try); red pill is a red dot with the developer menu inside; SBD top right on the computer, est. under (v365)
- ✓ Computer: SBD total at the top of the right panel, scrolls with it, not pinned (v364)
- ✓ Computer: SBD total fixed top right on every page; SBD label small again (v362)
- ✓ Cursor no longer drifts onto letters after /admin, /note (v361)
- ✓ SBD total + estimated total top right on Trends (v359); 4 other placements offered, Marcus to pick
- ✓ Editing a day: notes load and land on that day; one-set changes in plain words handled on the phone (also rescues a voice note the AI missed); failed note back in a lit box; loading rows one soft bar each (v358)
- ✓ "Your log" hint is one thin labeled line, ↑ log above, more below ↓ (v357)
- ✓ Questions: example answer in the box, the note goes along with the answer; weight-only changes keep reps; missing numbers become ? instead of nothing logged; thicker loading bars (v356)
- ✓ No flash on a new note; soft-edged light on what was added (v355)
- ✓ Edit: + Note opens the box with /note on that day (no AI, lands and flashes there); note box inside the day removed (v354)
- ✓ Note on its way waits at the top under no day unless the day was picked or said; Edit: minus pops in fast and solid, Add set closer, no line under the note (v353)
- ✓ + always shows a bit of chat, Import a file and the top two lifts on every screen; Import marked in clay; blurred clay counting rows, one per set written; what lands flashes clay and scrolls into full view, panel folds so nothing covers it (v352)
- ✓ Set % is of your heaviest real single, RPE left out (v351)
- ✓ D1 reads cut: dashboard stats only when Admin opens (cached 1 min), red pill refresh every 5 min, demo cached 10 min (7 Nov, after Cloudflare's 76% warning)
- ✓ Questions show above the box and answers fill the ? sets; Lat Pullover never Lat Pulldown; swipe deletes a whole grouped row; counting numbers while reading (v347)
- ✓ Admin overview + dashboard: people, opens, taps, pages, where they got stuck (v331; opens/taps counted from 6 Nov 2026)
- ✓ Abs and calves strength levels from sit-ups/crunches/calf raises; typing help/feedback offers the command; box examples; more tips and quotes; text stays on cursor; cream not black on open (v330–v332)
- ✓ Form bar = last 4 weeks vs best; session counts in lift list; tapped chart day under the dates; / lists every command (v327–v329)

- Audit fixes: kg→reps keeps focus (no redraw while moving between set boxes); "N sets" parsed as N sets; unclear notes show the AI's question instead of "sent as feedback"; only 429/503/offline wait for later, a 502 is "Not logged" + Try again; Quick add with no log opens at the top; new set focuses kg; set numbers for screen readers, hidden swipe Delete out of Tab order, 44 px hit areas; >10-rep sets never set the all-time estimate; At your best = real kg, now vs all-time over the chart's range (v321)

- Harder variants also draw on the main lift's chart and PR count (one point per day, the best of both); front squat, safety bar and high-bar squat count for squat (v318–v320)

- Demo link (?demo, the portfolio) shows Marcus's real training from /api/demo (dates, labels, lifts, sets and bodyweight only; cached 1 h; made-up example only if it can't load), says "A real training log · Get your own", no Exodia animation over it (v313–v315)

- Home edit: a quiet pencil instead of the word Edit; while editing, the day row stays pinned under the top bar with Done in clay; one Delete day (the top one is gone); the × on "Editing …" in the box ends editing; holding an open day also starts Edit (v314)

- Box on the phone: opens with the latest messages above and Quick add's heading + first rows below, and settles again when the iPhone keyboard shrinks it (the keyboard used to cut Quick add off). Harder variants count for the main lift in charts, bests, PRs, strength web and anatomy: Pause/Close-Grip/Spoto/Larsen/Pin bench → Bench, Pause/Pin/Tempo squat → Squat, Deficit/Pause deadlift → Deadlift; never the other way (v312)

- Portfolio: Exodia is the first project on marcusokodugha.com, live in a MacBook or a silver iPhone 18 Pro Max (toggle on the card, tap around inside), with Visit / Get your own Exodia / GitHub and the self-improving agent story. `/?demo` opens Trends with a year of example data in memory only (never saves over a real log, never syncs), "Example data · Get your own" in the date line (v309–v311)

- Calendar 12-month view scrolls back to the first day again (v290 had limited it to 12 months, wrongly), one empty column between years; Show every year stays. Computer right panel keeps its scroll on every redraw (it jumped to the top on Strength/Recovery and syncs). Opening: index.html shows the hand breathing (pure CSS, fades in after 0.2 s, replaced by the first draw) (v305)

- Failed messages show "Tried by Gemini 3.5 Flash · needs a stronger model" (friends: "Tried by Exodia 3.5 Flash · needs a stronger Exodia, Marcus can turn one on"); the model now travels with a "didn't understand" error into the log; reply buttons wrap flush left (v304)

- Pull-ups (and chin-ups): level = the better of most reps in one set (Strength Level reps table) and most weight added (Strength Level 1RM-weight table, by bodyweight); +50 kg × 2 at 100 kg was "Beginner 1.2" because v285 counted only reps, now Intermediate 3.6 on the actual +50; corner and tiles read "+50 kg × 2", next level "+59 kg"; women's pull-up reps table filled in. Dips aren't scored anywhere (v303)

- Box panel: opens at 360 px (was 286) with the latest messages above a small grey "↑ Your log · scroll up for more" line and Quick add's first rows below; the whole log (last 60) scrolls in the same panel (the old 76 px strip showed the oldest 6 and couldn't scroll), tap a message to fix it (v299)

- Admin: "Exodia is on it" shows the whole request with an orange /admin (long ones scroll inside); your /admin requests sit on the right in the Every command chat the moment you send them, with Building… / Live in vN / Watch Exodia (the separate list at the top is gone); on the computer Admin and its menu item appear straight away (they waited for the focused box to blur) (v298)

- What's new pill: taps were lost because a near miss dismissed it and redraws replaced it mid-tap; now a tap within 16 px opens it, the same element is kept across redraws, a tap elsewhere doesn't dismiss it while closed (it goes after 2 min), and once open a tap outside closes it for good (v297)

- Every year in the calendar = the original 12-month strip (month row, year at January, no sticky year, no fitted mini grid); its line: "61 sessions · +11% stronger than 2024" = average change of the heaviest set per lift done in both years (new lifts don't count). Red pill items: Yes / No / Add context; Add context opens the box with "Replying to …" (× to drop). /feedback for anyone turns red and sends the rest as feedback; /admin stays Marcus-only. Friends see "Handled by Exodia 3.5 Flash-Lite" (Marcus sees "Gemini 3.5 Flash-Lite") (v296)

- Thinking: one look from the start (hand + clay line with "Reading the file…" while there's progress), every new message opens on an Exodia line held 3.2 s before the first quote; 7 quotes from the Resurrection 3 program added ("What we do in life echoes in eternity" credited to Maximus, Gladiator, where it's from) (v295)

- Import check: a set more than 20% and 10 kg above both your heaviest logged set of that lift and the file's next heaviest is held back; one question "… looks far heavier … Add it anyway?" with Leave out / Add it (adds it next to that day's sets); the rest of the file goes in as usual (v294)

- 7-week program Excel is in (Marcus confirmed); its one bad row, bench 190 × 1 on "Day 14", 25 Mar 2024, was removed

- Data fix (Marcus asked): removed the imported Bench Press 190 × 1 on 25 Mar 2024 (after 122 × 2, an import mistake); heaviest bench in his log is now 145 kg. Done through a normal sync on top of the server's version, so his devices pick it up (Nov 6)

- Calendar / strength-corner taps open that exact day (Home draws down to it) and centre it; Home "Show older sessions" (+60 at a time, back to the first day); one rule keeps the tapped thing under the finger (lift list, chart range/lines, Strength/Recovery, web All time/Last 3 months, level key, Show all lifts, Show every year, opening/closing a day, accessories); picking a lift no longer jumps to the chart; each calendar year: "152 sessions · +38% vs 2025 so far"; Start fresh moved from the menu to Settings → Danger zone (it only starts an empty log on this device, nothing deleted) (v293)

- Calendar Exodia days: grey middle, blue outline only; impressive-lift tiles caption first ("Next level" / 170 kg / Elite); What's new pill opens even when the finger moves up to 14 px (was 6) (v292)

- Every session: PRs Exodia blue again, Exodia hit days outlined in blue (white inner line on a PR day), year above the months (sticks to the left edge while scrolling), "Show every year" stacks one fitted block per year back to the first logged day with its session count (v291)
- Strength web corners show the set each level comes from ("300 × 1 · 13 Apr 2024"), tap opens that day; most impressive lift always shows the best other lift under the Big 3 one; "Bulgarian Split Squat" renamed "Split Squat" (barbell table, old logs renamed through a normal save so every device gets it); level numbers centred in their squares (v291)

- Most impressive lift: "1 in 268,000 men on Earth" full size (no small "1 in"), one plain sentence ("15,459 men in the world have deadlifted 300 kg or more in a raw meet. Among people who train it: past Elite, stronger than 95% (Strength Level)."); "who train it" only in that sentence; other lifts get a world number by matching their level to the same-level deadlift at your bodyweight (v290)
- Every session calendar: Exodia hit days in Exodia blue, PRs as a small dark dot on the day; key shows Lighter…Heavier, PR, Exodia. On the computer it sits in the middle of Trends under the anatomy (v290)

- Most impressive lift: leads with "1 in N men/women on Earth" (everyone of your sex, UN WPP 2024, ÷ exact OpenPowerlifting raw meet count; 300 kg deadlift → 1 in 268,000 men), then Strength Level's share of people who train it; past Elite on a lift with no meet data it says "Past Elite, beyond the data" and how far over Elite, never a capped 1 in 20. Bulgarian split squat on Strength Level's barbell table. Level numbers cut, not rounded (4.99 → 4.9). Heading stays singular (v287)
- Trends top tighter: lift name 8 px under the title, tiles right under it; chart and the lift list ~34 px higher, same style (v287)

- Strength = actual weight lifted, all time: each lift's heaviest set (warm-ups out) against Strength Level; reps and RPE never raise it, they only break a tie at the same weight (more reps wins). Same for the web, the anatomy, the head and the most impressive lift; saved "bests" without a set no longer count. Pull-ups: most reps in one set (v285)
- Strength web: all time solid (default), last 3 months dotted, tap "Last 3 months" to swap (v285)
- Most impressive lift: number tiles, no "about"/"estimated": 1 in N people (Elite and up: adults ÷ exact OpenPowerlifting count, e.g. 300 kg deadlift → 15,459 men → 1 in 175,000), exact count who lifted it in a raw meet, your weight class or the next level; sources line (Strength Level, OpenPowerlifting, UN WPP 2024); the lift's first letter lines up with the heading (v285)
- Anatomy starts with the Strength / Recovery switch, no "Anatomy" heading above it (option b; moving the whole section under the strength web instead is a one-line change) (v285)

- Update pill: one small clay pill with the newest change and "+N more"; tap grows the same element in place to show every change, tap outside shrinks it and it goes; soft glow once (v277)
- AI: the three full Flash models were out of their daily free Gemini quota, so notes ran on Flash-Lite; such a model now sits out until the quota resets (09:00 Swedish time), search uses Lite first to save the quota for notes, each note logs its time and the models tried (worker)
- Writing rows land on the day the note is about ("igår", "i fredags" too); Exodia loader (hand + clay line) in the day and the chat; Quick add keeps the latest messages one scroll up (v279, v281)
- Trends opens faster with years of data (1.16 s → 0.84 s on a 4× slowed phone) (v280)
- Strength web and anatomy on all-time bests (a 20 kg squat today no longer drops the level); the web shows one shape, no Now/All time (v283)
- Most impressive lift = a set actually done (290 × 3 beats 300 × 1 when its estimate is higher; a tie goes to the heavier set), best squat/bench/deadlift always shown, plus any other lift that ranks higher (26 more lifts from Strength Level, e.g. hip abduction, hip thrust, leg press) (v283)
- Anatomy: Strength / Recovery switch keeps the same height; the level list fades in only when opened, not on every redraw; "Best lifts" under the chart is now "Your lifts · best set · Tap one to see its trend"; calendar checked: past November days are drawn, only future days are blank like GitHub (v283)

- "Your most impressive lift" at the bottom of Trends (computer: bottom of the right panel): your highest-level lift all time, its level, and how rare it is. Up to Elite from Strength Level's own definitions (Beginner beats 5% of people training the lift … Elite 95%); past Elite from OpenPowerlifting raw meet results per weight class, doubled for people who never compete, against 2.7 bn adults of your sex. 300 kg deadlift: 15,459 men have done it raw in a meet; at 100 kg bodyweight that's about 1 in 73,000 men (not 1 in millions). Sources in the code comment above MEETS (v278)
- Strength level key (web and anatomy): tap a level or the i for what each level means, its share beaten and how long it takes (v278)
- Computer Trends: middle has the lift chart, anatomy and calendar; the right panel has strength level, volume and most impressive lift (it used to repeat the lift chart). Same things as the phone, none twice (v278)

- Notes about 4× faster (low thinking, 1.5–2 s; a slow model gets 7 s, then the next one); slim clay update pill that grows in place (UI/UX-reviewed); a writing skeleton on the set grid where the note lands; new users no longer get a stored bench best; Isabella's Home Screen profile filled in by hand (v275–v276)
- Own private link stays in the address bar once you've started, so Add to Home Screen keeps your log and name (Isabella's name vanished); example data never blocks or mixes into a joined link; football, cycling etc. keep their name and still count for Move; one clay update card that opens in place; set counts only on repeated sets; Brzycki/Epley wording; move-to dates old → new (v274)
- Notes no longer hang when Google's Gemini is overloaded (503s and 2-minute hangs seen on Nov 5): each model gets 15 s (25 s for voice), a failing one sits out a minute; full dates ("26th of July, 2024") are read without AI; replies say "Handled by Gemini 3.8 Flash" for Marcus, "Handled by Exodia" for friends (v267–v268)
- Exodia in rounds: hit it → blue for 10 days → back to orange, counted from zero (days after the hit already count) (v265)
- Anatomy head: the Exodia hand (with the eye in front, without on the back) only when every muscle is at least Advanced (orange) or Elite (blue); otherwise a normal head (v266–v268)
- Strength web: Beginner ring back (1–5), key with squares, centred (v265)
- Admin builder can use more than one Claude account (switch in Admin when a second is set up) (v264)
- "Every session" calendar at the bottom of Trends, GitHub style: orange by tonnage, PR days Exodia blue, scrolls back, tap opens the day (v263)
- Strength level colours decided (F): grey, sage, soft purple, clay, Exodia blue, the same in anatomy, spider web and keys; traps from deadlift 75% / row 25% (v262)
- Strength web: straight lines (decided), ring numbers 2–5, legs top / push right / pull left, coloured rings with a key, "Incline bench" (v260–v262)
- Anatomy: full-width Recovery / Strength switch, traps in the list, full level + number on the computer, stronger recovery colours (v257–v260)
- Bodyweight set on one device shows on all; no bodyweight question before the first sync (v257)
- Strength level spider web (Strength Level standards by bodyweight, now + all time), anatomy Strength view, +kg bodyweight lifts, move-date picker, voice dates any year, no invented sets (v250–v256)
- Busy AI / offline: messages wait and land by themselves; stronger second look; PStack interrogate: 25 problems fixed (v244–v246)
- Fixed: picking a file did nothing (the picker sat inside a button that redrew on click, so the file was lost); now one permanent picker; voice note with a file becomes its note; clear messages for empty files; tested 21 files by clicking the real button with the live AI (v237)
- Opens much faster: Exodia hits and PR checks no longer re-read the whole history for every day and set (6 years of data: 7 s → 1 s on a slow phone) (v236)
- Fixed: changing a past day could change the most recent day with the same weekday, even years away; now only within 7 days of the date you meant (v235)
- Swiping "Exodia updated" away follows the finger and glides off, a short swipe springs back; the red pill re-checks every 30 s and when you come back to the window, and redraws even while typing (v234)
- "Now vs best" under each lift on Trends and in the computer's Progress panel; Settings → What's new lists the latest updates; the update pill opens to the same notes (v233)
- Voice: a recording with no speech in it no longer turns into "Thank you very much." (Whisper makes that up on silence); the app says it couldn't hear you instead (v231)
- Tap the "Exodia updated" pill to see what changed (short bullets from `public/changes.json`, no names or sensitive details) (v230)
- Fade above the box is shorter (30px, was 56px) and the page leaves less empty room under the last session, so less of a session hides behind it (v228)
- Add your data page has "Or let an AI do it": copy the AI message from there too (v227)
- Search bar on desktop is no longer squashed to ~20px by the sidebar, 44px tall (v228)
- The "copy for your AI" message now walks the AI through it: ask for your training if it's missing, send it, or give plain dated lines to paste in the box, and ends with "My training:" for you to fill in (v224)
- Red pill items have a Reply button: opens Admin chat with the item shown, your follow-up goes to Claude with it (v223)
- Admin: what you just sent shows right away in the panel above the box, and on desktop the right side shows "What you sent" with its status (v222)
- Red pill far right with the hidden dev button always on its left; logo bigger in the app; clearer favicon and app icons; `/admin` in any box opens Admin (text after it goes straight to Claude); box bottom no longer fades while typing on a computer (v222)

- The box never cuts the page: a soft fade above it on every screen (the welcome screen too) and room under the page for the box's real height; long pasted text grows the box, then scrolls inside it with a soft edge (v219)
- Est. 1RM counts each day's strongest set of 1–10 reps (12+ rep sets only when nothing heavier); the chart readout says which set it came from; (i) next to "Est. 1RM" in every chart legend explains it, also on the computer's Progress panel (v223)
- Trends: removed "What you said"; picking a lift scrolls the chart up under the header so the list stays in view and you can pick another (v217)
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

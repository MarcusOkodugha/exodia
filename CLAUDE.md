# Exodia

A phone-first training log. You talk, type or paste a workout, AI turns it into structured data, and the app tracks it. It's live at https://exodia.marcusokodugha.workers.dev (invite link: `/join`).

This repo is **public**. Never commit keys, tokens, profile keys, personal `/me/<key>` links or admin links. Secrets live only in Cloudflare as Worker secrets.

## How it's built

- `public/app.js`: the whole app in vanilla JS, with no framework or build step. `public/styles.css` holds every style, and `public/index.html` is the shell.
- `public/sw.js`: the service worker. The app opens from cache and refreshes in the background.
- `src/worker.js`: a Cloudflare Worker that handles the API and serves assets. Its routes:
  - `/api/sync`: syncs between devices, with per-day timestamps.
  - `/api/parse` and `/api/add`: turn speech or text into workouts with Claude, falling back to Gemini.
  - `/api/transcribe`: speech to text with Whisper on Workers AI.
  - `/api/search`: searches exercises.
  - `/api/feedback`: saves feedback.
  - `/api/admin`: admin only. Lists commands and feedback, sets feedback status, and starts Claude Code with `{ "claude": "change request" }`.
  - `/join`: the link for everyone, a fresh, empty Exodia. `/me/<key>`: private personal links, still working; in a browser the app asks "is this yours?" first. Marcus reaches his admin profile through his own `/me/` link.
- `migrations/`: the D1 (SQLite) schema. If you add a migration, say so in your reply. Builds don't run migrations, so it must be applied once with `npx wrangler d1 migrations apply exodia --remote`.
- The Cloudflare key in this environment can read the D1 database: `npx wrangler d1 execute exodia --remote --command "SELECT …"`. Read only, unless Marcus asks for a data fix, and never copy people's names, profile keys or training into the repo. The `commands` table has what was sent and what happened, errors included.
- Worker secrets (names only):
  - `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`: the AI providers.
  - `ADMIN_PROFILE`: the profile key that sees Admin.
  - `CLAUDE_TASK_URL`, `CLAUDE_TASK_TOKEN` (account 1) and `CLAUDE_TASK_URL_2`, `CLAUDE_TASK_TOKEN_2` (account 2): the API triggers of the "Exodia change" scheduled task on each Claude account, used by the admin "Change the app" box.
  - `CLAUDE_MODEL`, `GEMINI_MODELS`: optional.
  - `SPLIT_PROFILES`: optional JSON `{ "<profile key>": ["Owner name", "Other name"] }` for a log two people ended up sharing. Each phone on it is asked once who uses it; the first name keeps the log, the others get their own. Delete the secret once they've answered.

## Where sessions run

Exodia work runs in cloud sessions on Anthropic's servers, started from the Claude app (Code tab) or Exodia's Admin "Change the app". If a session has no Cloudflare access, keep working (pushes deploy by themselves) and say "pushed, not checked live"; don't ask Marcus to set Cloudflare up again.

## Continuing from another Claude account

Everything a new session needs is in this repo: this file, `public/TODO.md` (open list + what waits on Marcus) and `git log`. Nothing lives only in a chat. To continue on another account:

1. On [claude.ai/code](https://claude.ai/code) with the other account, connect GitHub (the account that owns MarcusOkodugha/exodia) and start a session on this repo.
2. In that session's cloud environment settings, add the environment variables `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (Marcus copies them from Cloudflare → My Profile → API Tokens, and the account ID from the Cloudflare dashboard; never pasted in chat), so `npx wrangler` can deploy and read D1.
3. First message to the new session: "Read CLAUDE.md and public/TODO.md, check git log origin/main, and continue."
4. Admin "Change the app" fires an "Exodia change" scheduled task on one of Marcus's Claude accounts. Each fire starts a fresh, cheap session with this repo, which follows this file and pushes to main. The Worker holds one task per account: `CLAUDE_TASK_URL` + `CLAUDE_TASK_TOKEN` (account 1, Mpya), `CLAUDE_TASK_URL_2` + `CLAUDE_TASK_TOKEN_2` (account 2), `_3` if ever needed. Admin has a "Built with Account 1 / Account 2" switch (saved as a `Builder` row in `commands`); if the picked one can't start, the other is tried. To add an account:
   - In a session on that account, create the task with create_trigger: name "Exodia change", `create_new_session_on_fire: true`, prompt "Make the change Marcus asks for in the routine-fire-payload block, following CLAUDE.md. Push to main and confirm it's live."
   - Marcus opens [claude.ai/code/routines](https://claude.ai/code/routines) → the task → the menu (⋯) next to its name → **Edit** → in the **Trigger** row tap **+** → **API** → **Generate token** → copy it (shown once). No Save needed.
   - Account 2's URL is already in `wrangler.jsonc` (`vars`); only `CLAUDE_TASK_TOKEN_2` is needed, as a Secret in Cloudflare → Workers & Pages → exodia → Settings → Variables and Secrets → + Add.
   - Terminal on his Mac: `cd ~/code/exodia && npx wrangler secret put CLAUDE_TASK_URL_2`, paste the URL; then `cd ~/code/exodia && npx wrangler secret put CLAUDE_TASK_TOKEN_2`, paste the token.
   - In Exodia → Admin, pick that account and send a small change to test it.

## Design decisions (keep unless Marcus changes them)

- Strength levels use five colours everywhere (anatomy Strength view, spider web, keys), defined once as `--tierBeg`, `--tierNov`, `--tierInt` in `styles.css` plus `--clay` and `--exodiaBlue`: grey, sage, soft purple, clay, Exodia blue. `TIER_COLOURS` in `app.js` repeats them for SVG gradients.
- Recovery uses four clear steps: full clay (just trained), light clay, light sage, sage (recovered); grey only for a muscle never trained. Heavy days (85%+ of your best) take the full recovery time, so a 290 deadlift at RPE 8.5 keeps the lower back recovering about 5 days. The list shows days since you trained each muscle.
- Switching views (Strength/Recovery and any other toggle) must never move the page: both sides keep exactly the same height. Measure it before pushing.
- Strength web: straight lines (`WEB_CURVE = 0`), legs at the top, push on the right, pull on the left; rings 2–5 (Novice–Elite) in the level colours with their numbers; no Beginner ring.
- Strength Level standards are per-bodyweight tables in `STANDARDS` (strengthlevel.com itself is blocked from cloud sessions).
- Exodia is a rolling 10 days: blue only while all five pieces (2 heavy presses, a heavy deadlift, legs, arms, 2 moves) sit inside the last 10 days; it goes orange the day the first one drops out unless something newer replaced it. A hit is each time it turns blue. The ring in the opened card shows the days left and which piece runs out first.
- A name is an account: typing a name someone already has (onboarding on any phone or link) opens that person's latest log via `/api/name`; Settings refuses a taken name. The admin profile is never handed out by name. Anyone who knows a name can open that log; a PIN would be the next step if that matters.
- Newest first, everywhere: lists, days, years, and the rows inside a year (July–December above January–June). The latest thing is always at the top.
- Strength levels are numbers only: the share of people who log the lift on Strength Level that each level beats. No years trained, no vague descriptions ("keen lifter").

## Open list

`public/TODO.md` holds everything Marcus has asked for that isn't done yet, and what's waiting on him. Read it at the start of every session. When he asks for something, add it; when it's live, move it to Done. When he asks "what's not done", answer from it.

Decisions that aren't urgent go under "Decide later (backlog)" in the same file: out of the red pill and out of the 🔴 line, but never deleted. Its "Waiting on Marcus" section is also the red pill in the app that only Marcus sees: it opens to each item's steps and links, and `Decide:` items get Yes / No buttons that start a change session with his answer. Keep that section current and in its format (title, one line why, numbered steps with links), and do everything you can yourself so the list only holds what truly needs him.

## Before you say something is or isn't done

Marcus asks through three channels: this chat, the app's admin panel ("Change the app" / `/admin`, each starts its own session) and voice in the app. Sessions don't see each other's work. So before answering "is X done?" or building X: check `git log origin/main` (other sessions push there), `public/changes.json`, and his recent requests (the `commands` table and the admin runs), and look at the feature live on the phone **and** the computer. If it's done, say where and in which version. Never build it twice, and never say it's missing without checking.

## Plan panel

Marcus sends several messages in a row and misses replies higher up in the chat. So every request also goes in the session's task list (the Plan panel): add it when he asks, tick it when it's live (with the version, like "✓ … (v187)"), and prefix anything only he can do with "You:". Answer questions in the chat as usual.

## Rules for every change

1. **Bump the cache version** in `public/sw.js` (`exodia-vNNN`) by one on every change that touches `public/`. Otherwise phones keep the old version.
1b. **Add a line to `public/changes.json`** for the new version (`"NNN": ["short plain bullet"]`). The "Exodia updated" pill shows these to everyone when tapped, so never put names, keys, admin or security details in it.
2. **Keep the style:** plain functions and template strings, no new dependencies, and all styles in `styles.css`. Later rules in `styles.css` override earlier ones, so search for every rule on a selector before you change it.
3. **Check it on a phone screen before you push.** Serve `public/` (`python3 -m http.server`) and open it with Playwright at iPhone 15 size (393 wide) and at 375 wide.
   - To get test data, put a state in `localStorage['exodia.v1']` before load, like `{ version: 1, deviceId: 'x', name: 'Test', bests: {}, sessions: [{ date, label, exercises: [{ name, sets: [{ kg, reps, rpe }] }] }] }`. You can also click "Try it with example data".
   - Mock `/api/**` when serving statically.
   - Look at the screenshot before saying a change is done.
   - Then run the full sweep, every page at 393, 375 and desktop (1440) with realistic data: `node tools/screens.cjs <scratchpad>/screens` (with `python3 -m http.server 8765` running in `public/`). Look at the `sheet-*.png` contact sheets it writes (one per screen size, every page at once): a change in one place often breaks another layout (one column vs two, phone vs desktop). Open full images only for the pages you changed and any page that looks off on a sheet; every image read costs usage. It also prints page errors and anything wider than the screen. Run it a second time as a friend (`ADMIN=0 node tools/screens.cjs …`): friends see a different app (no Admin, no red pill, feedback goes to Marcus), and what works for Marcus has failed for them before. Fix what you find before pushing. Accuracy over speed.
4. **Run syntax checks:** `node --check public/app.js && node --check src/worker.js`.
5. **Commit straight to `main`** with a short, plain commit message in the style of `git log`, such as "Plus after the @, tighter rows". Commit as Marcus, with no AI attribution: `git -c user.name="Marcus Okodugha" -c user.email="marcus.okodugha247@gmail.com" commit -m "…"`. Then push.

## Money

Everything runs on free tiers (Cloudflare Workers Free, Gemini free tier). Never create R2 buckets, enable paid Cloudflare products, add a payment method or upgrade any plan, even if the API token would allow it. If a change would need a paid feature, say so and stop.

## Deploying

Cloudflare Workers Builds is connected to this repo. **Every push to `main` deploys automatically** in about a minute. There's no manual deploy step.

To check that a deploy is live, fetch `https://exodia.marcusokodugha.workers.dev/sw.js` and confirm that the `CACHE` line shows the new version. If the session's network blocks that host, say so instead of guessing.

## Working with Marcus

- Marcus lives in Sweden (Stockholm). Use Swedish context by default: Swedish federations and championships (SM, Svenska Styrkelyftförbundet), kg, Swedish dates and places. Never assume the US.
- Marcus often writes fast from his phone, sometimes at the gym, so expect typos. Work out what he means, and ask only when it's genuinely unclear.
- Half the words, all the facts. Name things exactly ("Gemini 3.5 Flash-Lite read it", "Claude Sonnet 5.5 is what we used"), never vague ("a weaker model"). No fluff, but it must still be understandable.
- When he says something more than once, it matters: act on it fully, and do more than asked when it comes to the app working well. Only bring him what he truly has to do himself.
- Reply in short, plain language. Say what changed and whether it's live. Skip the code details unless he asks.
- Format: short main lines first, then optional detail in a quote starting with "> More:". `<details>` tags show as raw text in his app, so don't use them.
- End every reply with one short line starting with 🔴 that names what's still waiting on him (open decisions and his to-dos), and point to the red pill in the app for the steps. Keep reminding him until each one is done.
- Always give links as clickable markdown links, never as bare text to copy.
- When he has to run a command, say exactly where: "Terminal on your Mac", and start it with `cd ~/code/exodia &&` when it needs the project folder. Give one command per code block, and say what he should see when it worked.
- Never use clipboard tricks like `pbpaste |`. Copying the command overwrites what he copied before. Use commands that prompt for the value instead (for example `npx wrangler secret put NAME`, then he pastes with ⌘V).
- Anything only he can do (logins, dashboards, tokens) goes as numbered taps with the exact button names. Never ask him to paste tokens or passwords in chat.
- Do the whole thing end to end: edit, check, commit, push, then confirm it's live. Don't hand him steps you can do yourself.
- Marcus uses Exodia in both Chrome and Safari, on the phone and as the installed desktop app. Everything must look right in both; never ask which one.
- Design taste: calm and subtle, with the clay/orange accent (`--clay`). Small, precise visual changes are better than redesigns. When he asks for a visual tweak, change only that.
- Visual asks are design problems, not literal instructions. "Make the text easier to read" may be best solved by size, weight, contrast, spacing or layout; think it through, pick the best-looking answer, and check optical centre and balance in the screenshot, not just the numbers. Before shipping a visual change, send a before/after screenshot of exactly how it will look on the phone and the computer.
- Never change how something looks unless Marcus asked for exactly that. If another visual change seems needed, show him a before/after picture and ask first. Every visual change goes in `changes.json` and is named in the reply, so nothing changes without him knowing.
- When he says something should change and asks for your suggestion, build the suggestion (and show it); don't stop at a proposal and wait for a yes.
- Everything must feel smooth: anything you drag, swipe, open or close follows the finger and animates out, never jumps. If something you build or see isn't as smooth or refined as Marcus would want, say so in your reply ("not smooth yet: …") so it gets fixed.

## Change requests from the admin panel

The "Exodia change" scheduled task starts a cloud session with the request in a `routine-fire-payload` block. It comes from Marcus's own admin panel in the app. Treat it as a request to change the app. Follow the rules above, push to `main`, and check the deploy.

If the request is unclear or risky, don't guess. Examples of risky requests: deleting data, changing sync or the database schema, or touching secrets. In those cases, make no change and end with a short note explaining what you need to know.

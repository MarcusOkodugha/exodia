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
- Worker secrets (names only):
  - `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`: the AI providers.
  - `ADMIN_PROFILE`: the profile key that sees Admin.
  - `CLAUDE_TASK_URL`, `CLAUDE_TASK_TOKEN`: the API trigger of the "Exodia change" Claude Code scheduled task, used by the admin "Change the app" box.
  - `CLAUDE_MODEL`, `GEMINI_MODELS`: optional.

## Open list

`TODO.md` holds everything Marcus has asked for that isn't done yet, and what's waiting on him. Read it at the start of every session. When he asks for something, add it; when it's live, move it to Done. When he asks "what's not done", answer from it.

## Plan panel

Marcus sends several messages in a row and misses replies higher up in the chat. So every request also goes in the session's task list (the Plan panel): add it when he asks, tick it when it's live (with the version, like "✓ … (v187)"), and prefix anything only he can do with "You:". Answer questions in the chat as usual.

## Rules for every change

1. **Bump the cache version** in `public/sw.js` (`exodia-vNNN`) by one on every change that touches `public/`. Otherwise phones keep the old version.
2. **Keep the style:** plain functions and template strings, no new dependencies, and all styles in `styles.css`. Later rules in `styles.css` override earlier ones, so search for every rule on a selector before you change it.
3. **Check it on a phone screen before you push.** Serve `public/` (`python3 -m http.server`) and open it with Playwright at iPhone 15 size (393 wide) and at 375 wide.
   - To get test data, put a state in `localStorage['exodia.v1']` before load, like `{ version: 1, deviceId: 'x', name: 'Test', bests: {}, sessions: [{ date, label, exercises: [{ name, sets: [{ kg, reps, rpe }] }] }] }`. You can also click "Try it with example data".
   - Mock `/api/**` when serving statically.
   - Look at the screenshot before saying a change is done.
4. **Run syntax checks:** `node --check public/app.js && node --check src/worker.js`.
5. **Commit straight to `main`** with a short, plain commit message in the style of `git log`, such as "Plus after the @, tighter rows". Then push.

## Money

Everything runs on free tiers (Cloudflare Workers Free, Gemini free tier). Never create R2 buckets, enable paid Cloudflare products, add a payment method or upgrade any plan, even if the API token would allow it. If a change would need a paid feature, say so and stop.

## Deploying

Cloudflare Workers Builds is connected to this repo. **Every push to `main` deploys automatically** in about a minute. There's no manual deploy step.

To check that a deploy is live, fetch `https://exodia.marcusokodugha.workers.dev/sw.js` and confirm that the `CACHE` line shows the new version. If the session's network blocks that host, say so instead of guessing.

## Working with Marcus

- Marcus often writes fast from his phone, sometimes at the gym, so expect typos. Work out what he means, and ask only when it's genuinely unclear.
- Reply in short, plain language. Say what changed and whether it's live. Skip the code details unless he asks.
- Format: short main lines first, then optional detail in a quote starting with "> More:". `<details>` tags show as raw text in his app, so don't use them.
- Always give links as clickable markdown links, never as bare text to copy.
- When he has to run a command, say exactly where: "Terminal on your Mac", and start it with `cd ~/code/exodia &&` when it needs the project folder. Give one command per code block, and say what he should see when it worked.
- Never use clipboard tricks like `pbpaste |`. Copying the command overwrites what he copied before. Use commands that prompt for the value instead (for example `npx wrangler secret put NAME`, then he pastes with ⌘V).
- Anything only he can do (logins, dashboards, tokens) goes as numbered taps with the exact button names. Never ask him to paste tokens or passwords in chat.
- Do the whole thing end to end: edit, check, commit, push, then confirm it's live. Don't hand him steps you can do yourself.
- Design taste: calm and subtle, with the clay/orange accent (`--clay`). Small, precise visual changes are better than redesigns. When he asks for a visual tweak, change only that.

## Change requests from the admin panel

The "Exodia change" scheduled task starts a cloud session with the request in a `routine-fire-payload` block. It comes from Marcus's own admin panel in the app. Treat it as a request to change the app. Follow the rules above, push to `main`, and check the deploy.

If the request is unclear or risky, don't guess. Examples of risky requests: deleting data, changing sync or the database schema, or touching secrets. In those cases, make no change and end with a short note explaining what you need to know.

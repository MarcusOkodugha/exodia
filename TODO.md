# Exodia: open list

The shared to-do list for Marcus and every Claude session. Read it at the start, add anything Marcus asks for that isn't done yet, and move items to Done when they're live. Newest first. Keep it short.

## Waiting on Marcus

- [x] **Make sure Cloudflare can never charge the card.** Marcus confirmed billing is off (Nov 3). Check [Workers plans](https://dash.cloudflare.com/379fa967eba06ef21141519c2922cfcc/workers/plans) says Free and [Billing](https://dash.cloudflare.com/379fa967eba06ef21141519c2922cfcc/billing) has no subscriptions; remove the card if one is saved. Keep R2 out of the API token. Also check the Google AI key is on the free tier (no billing).
- [x] **Cloudflare key for this Claude environment.** Added Nov 3; network to api.cloudflare.com and the live site works. Next: a new chat confirms the key with `npx wrangler whoami`. Lets Claude deploy in about 15 seconds instead of 1–3 minutes, check the live site, and set secrets itself. Steps: create an "Edit Cloudflare Workers" API token (+ Account → D1 → Edit), then in claude.ai/code → my-cloud-env → Edit add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, and allow `api.cloudflare.com` and `exodia.marcusokodugha.workers.dev` under Network access.
- [ ] **`/marcus` code.** Set `MARCUS_CODE` (Claude can do it once the Cloudflare key is in; otherwise `cd ~/code/exodia && npx wrangler secret put MARCUS_CODE` in Terminal on the Mac).
- [ ] **Old Claude's memory into CLAUDE.md.** In the Mac Terminal Claude: "Add the useful, non-secret parts of your Exodia memory to CLAUDE.md in the repo, then commit and push."
- [ ] **Decide:** keep `/join` for everyone else, or add `/other`.
- [ ] **Decide:** keep Exodia on the Mpya Claude account, or move it to a personal Claude account.

## To do (Claude)

- [ ] New Exodia Status page for this account (waiting for Marcus's go-ahead).
- [ ] Check the new fist animation on a real phone once Marcus has seen it.

## Done (recent)

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

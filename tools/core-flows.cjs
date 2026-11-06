// Core flows: the few things that must never break. Runs after every push to main (.github/workflows/core-flows.yml);
// a failure reverts that commit. Serves public/ itself and fakes /api/**, so it needs no keys and no network.
// Use: node tools/core-flows.cjs          (needs the playwright npm package with chromium and webkit installed)
//      ONLY=webkit node tools/core-flows.cjs   (one engine)
//      PUBLIC=/some/copy/public node tools/core-flows.cjs   (test another copy of the app)
const { chromium, webkit } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.env.PUBLIC || path.join(__dirname, '../public'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(request.url.split('?')[0]);
  let file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  response.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(response);
});

const iso = (offset) => {
  const day = new Date(Date.now() - offset * 86400000);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
};
const sets = (kg, reps, count) => Array.from({ length: count }, () => ({ kg: String(kg), reps: String(reps) }));
// Ten earlier days of the big three, nothing today: Quick add has lifts to offer and today starts empty.
const past = Array.from({ length: 10 }, (_, index) => ({
  date: iso(2 + index * 2),
  cardio: 0,
  exercises: [['Bench Press', 95], ['Squat', 130], ['Deadlift', 170]].map(([name, kg]) => ({ name, sets: sets(kg - index, 5, 3) }))
}));
const stateWith = (today = []) => JSON.stringify({ version: 1, deviceId: 'core-flows', name: 'Test', started: true, bests: {}, body: { kg: 90, sex: 'male' }, sessions: [...(today.length ? [{ date: iso(0), cardio: 0, exercises: today }] : []), ...past], log: [] });

// Shapes as src/worker.js sends them.
const BENCH = { exercises: [{ name: 'Bench Press', sets: sets(100, 5, 3) }], cardioMinutes: 0, engine: 'claude' };
const api = (options = {}) => async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const reply = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  if (url.pathname === '/api/sync') return reply({ admin: Boolean(options.admin), cursor: 1, sessions: [], meta: null });
  if (url.pathname === '/api/parse') return options.parse ? reply(...options.parse) : reply(BENCH);
  if (url.pathname === '/api/add') return reply({ added: [{ date: iso(0), sets: 3 }], unclear: '', failed: 0, sessions: [{ date: iso(0), cardio: 0, exercises: BENCH.exercises }] });
  if (url.pathname === '/api/admin') {
    if (request.method() === 'POST') {
      options.adminPosts?.push(request.postDataJSON());
      return reply({ ok: true, url: '', account: 1 });
    }
    return reply({ builders: [{ slot: 1, ready: true }], builder: 1, commands: [], feedback: [] });
  }
  return reply({});
};

class Fail extends Error {}
const until = async (page, what, test, timeout = 5000) => {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    last = await test().catch((error) => ({ error: error.message }));
    if (last === true) return;
    await page.waitForTimeout(50);
  }
  throw new Fail(`${what}${last && last !== false ? ` (saw: ${JSON.stringify(last).slice(0, 300)})` : ''}`);
};

// Phone taps with a real touch, the computer clicks; both type with the keyboard.
const press = (setup, locator) => (setup.touch ? locator.tap() : locator.click());
const typeInBox = async (page, setup, text) => {
  const box = page.locator('#draft');
  if (setup.touch) await box.tap({ force: true });
  else await box.click({ force: true });
  await until(page, '#draft did not take focus', () => page.evaluate(() => document.activeElement?.id === 'draft'), 2000);
  await page.keyboard.type(text);
};
const send = async (page, setup) => {
  if (setup.touch) await press(setup, page.locator('.dock [data-action="send"]').first());
  else await page.keyboard.press('Enter');
};
const todaySets = (page, name) => page.evaluate((name) => {
  const session = state.sessions.find((item) => item.date === todayIso());
  return (session?.exercises || []).filter((exercise) => exercise.name === name).flatMap((exercise) => exercise.sets).map((set) => `${set.kg}x${set.reps}`);
}, name);

const checks = [
  ['Typed workout logs 3 sets of Bench Press 100x5', {}, async (page, setup) => {
    await typeInBox(page, setup, 'bench 100 for 5, 3 sets');
    await page.keyboard.press('Enter');
    await until(page, 'today should have Bench Press 100x5 three times', async () => {
      const got = await todaySets(page, 'Bench Press');
      return got.length === 3 && got.every((set) => set === '100x5') ? true : got;
    });
  }],
  ['Typing kg then tapping reps keeps focus on reps, nothing in #draft', { today: [{ name: 'Bench Press', sets: [{ kg: '', reps: '' }] }] }, async (page, setup) => {
    const kg = page.locator('input[data-field="kg"][data-exercise="0"][data-set="0"]').first();
    const reps = page.locator('input[data-field="reps"][data-exercise="0"][data-set="0"]').first();
    await kg.waitFor({ state: 'visible', timeout: 5000 });
    await press(setup, kg);
    await until(page, 'kg box did not take focus', () => kg.evaluate((input) => input === document.activeElement), 2000);
    await page.keyboard.type('100');
    await press(setup, reps);
    await until(page, 'focus should be on the reps box after tapping it', () => page.evaluate(() => document.activeElement?.dataset?.field === 'reps' || `focus on ${document.activeElement?.id || document.activeElement?.dataset?.field || document.activeElement?.tagName}`), 2000);
    await page.keyboard.type('5');
    await page.waitForTimeout(150);
    const seen = await page.evaluate(() => ({ focus: document.activeElement?.dataset?.field || document.activeElement?.id || document.activeElement?.tagName, kg: document.querySelector('input[data-field="kg"][data-exercise="0"][data-set="0"]')?.value, reps: document.querySelector('input[data-field="reps"][data-exercise="0"][data-set="0"]')?.value, draft: document.getElementById('draft')?.value ?? '' }));
    if (/\d/.test(seen.draft)) throw new Fail(`digits went into #draft: "${seen.draft}"`);
    if (seen.focus !== 'reps') throw new Fail(`focus left the reps box while typing (now on ${seen.focus})`);
    if (seen.kg !== '100' || seen.reps !== '5') throw new Fail(`set boxes should read 100 and 5, read "${seen.kg}" and "${seen.reps}"`);
  }],
  ['Quick add shows Bench Press and Import, tapping a lift adds it', {}, async (page, setup) => {
    await press(setup, page.locator('[data-action="open-quick"]').first());
    const quick = page.locator('.quickAdd');
    await until(page, 'Quick add panel did not open', () => quick.first().isVisible());
    const bench = quick.locator('[data-action="pick"][data-name="Bench Press"]').first();
    await until(page, 'Quick add has no visible Bench Press', () => bench.isVisible());
    await until(page, 'Quick add has no visible Import', () => quick.locator('[data-action="pick-file"]', { hasText: 'Import' }).first().isVisible());
    await press(setup, bench);
    await until(page, 'tapping Bench Press in Quick add did not add it to today', async () => (await todaySets(page, 'Bench Press')).length > 0);
  }],
  ['Import opens the file picker', {}, async (page, setup) => {
    await press(setup, page.locator('[data-action="open-quick"]').first());
    const pick = page.locator('.quickAdd [data-action="pick-file"]').first();
    await until(page, 'Import button not visible in Quick add', () => pick.isVisible());
    const chooser = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    await press(setup, pick);
    if (!(await chooser)) throw new Fail('tapping [data-action="pick-file"] did not open a file chooser');
  }],
  ['/admin test sends one request to the builder and shows it', { admin: true }, async (page, setup, options) => {
    await until(page, 'sync with admin:true did not make this device admin', () => page.evaluate(() => view.isAdmin === true));
    await typeInBox(page, setup, '/admin test');
    await send(page, setup);
    await until(page, 'no POST to /api/admin after sending "/admin test"', async () => options.adminPosts.length > 0 || 0);
    await page.waitForTimeout(400);
    if (options.adminPosts.length !== 1) throw new Fail(`expected exactly 1 POST to /api/admin, got ${options.adminPosts.length}: ${JSON.stringify(options.adminPosts)}`);
    if (options.adminPosts[0]?.claude !== 'test') throw new Fail(`POST body should be {"claude":"test"}, was ${JSON.stringify(options.adminPosts[0])}`);
    await until(page, 'the request "test" does not show in the chat', () => page.locator('.bubbleIn', { hasText: /^\s*(\/admin\s+)?test\s*$/ }).first().isVisible());
  }],
  ['A note the server cannot read (502) says Not logged', { parse: [{ error: 'The AI could not read that note. Try again, or type it.', transcript: '' }, 502] }, async (page, setup) => {
    await typeInBox(page, setup, 'did some yoga and stretching after work');
    await send(page, setup);
    await until(page, '"Not logged" did not show after a 502', () => page.locator('.bubbleOut', { hasText: 'Not logged' }).first().isVisible(), 6000);
    const text = await page.evaluate(() => document.body.innerText);
    if (/lands by itself/i.test(text)) throw new Fail('page still says "lands by itself" after the server gave up (502)');
  }]
];

const SETUPS = [
  { name: 'webkit phone 393', engine: webkit, viewport: { width: 393, height: 852 }, touch: true },
  { name: 'chromium desktop 1440', engine: chromium, viewport: { width: 1440, height: 900 }, touch: false }
].filter((setup) => !process.env.ONLY || setup.name.includes(process.env.ONLY));

const runCheck = async (context, base, setup, [name, config, run]) => {
  const options = { ...config, adminPosts: [] };
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/**', api(options));
  await page.addInitScript((saved) => localStorage.setItem('exodia.v1', saved), stateWith(config.today));
  try {
    const crashed = new Promise((resolve) => page.once('pageerror', resolve));
    await page.goto(`${base}/#/`);
    const loaded = await Promise.race([page.locator('#draft').waitFor({ state: 'attached', timeout: 8000 }).then(() => true), crashed.then(() => false)]);
    if (!loaded) return { why: `app did not start: ${errors[0]}`, dead: true };
    await run(page, setup, options);
    return null;
  } catch (error) {
    const why = error instanceof Fail ? error.message : `step failed: ${error.message.split('\n')[0]}`;
    return { why: `${why}${errors.length ? `\n      page errors: ${errors.slice(0, 3).join(' | ')}` : ''}` };
  } finally {
    await page.close();
  }
};

(async () => {
  const started = Date.now();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const failures = [];
  await Promise.all(SETUPS.map(async (setup) => {
    const browser = await setup.engine.launch();
    const context = await browser.newContext({ viewport: setup.viewport, hasTouch: setup.touch, isMobile: false, serviceWorkers: 'block' });
    // Nothing leaves the machine: anything not on the test server is cut off.
    await context.route((url) => !url.href.startsWith(base), (route) => route.abort());
    for (const check of checks) {
      const at = Date.now();
      let failed = await runCheck(context, base, setup, check);
      // One retry on a fresh page, so a slow runner never reverts a good commit.
      if (failed && !failed.dead) failed = await runCheck(context, base, setup, check);
      if (failed?.dead) {
        console.log(`FAIL [${setup.name}] App starts\n      ${failed.why}`);
        failures.push({ check: 'App starts', setup: setup.name, why: failed.why });
        break;
      }
      const line = `${failed ? 'FAIL' : 'ok  '} [${setup.name}] ${check[0]} (${Date.now() - at} ms)`;
      console.log(failed ? `${line}\n      ${failed.why}` : line);
      if (failed) failures.push({ check: check[0], setup: setup.name, why: failed.why });
    }
    await browser.close();
  }));
  server.close();
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (failures.length) {
    console.log(`\n${failures.length} core flow${failures.length === 1 ? '' : 's'} broke (${seconds} s).`);
    console.log(`First failure: ${failures[0].check} [${failures[0].setup}]`);
    process.exit(1);
  }
  console.log(`\nAll ${checks.length * SETUPS.length} core flow checks passed (${seconds} s).`);
})().catch((error) => {
  console.log(`FAIL core-flows itself crashed: ${error.stack || error.message}`);
  console.log('First failure: core-flows script');
  process.exit(1);
});

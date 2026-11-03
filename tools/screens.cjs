// Screenshot every page of Exodia at phone and computer sizes, with realistic data, and flag what's broken.
// Use: cd public && python3 -m http.server 8765   (in another shell)
//      node tools/screens.cjs <out-folder> [only-width]
// Look at every image it writes. It also prints page errors and any page wider than the screen.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'screens';
const only = Number(process.argv[3]) || 0;
const base = process.env.BASE || 'http://localhost:8765';
fs.mkdirSync(out, { recursive: true });

const iso = (offset) => {
  const day = new Date(Date.now() - offset * 86400000);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
};
const lifts = [['Squat', 140, 'legs'], ['Bench Press', 100, 'push'], ['Deadlift', 190, 'pull'], ['Overhead Press', 60, 'push'], ['Barbell Row', 80, 'pull'], ['Lat Pulldown', 65, 'pull'], ['Leg Press', 200, 'legs'], ['Barbell Curl', 35, 'arms'], ['Triceps Pushdown', 30, 'arms'], ['Single Arm Tricep Extension', 12, 'arms']];
const sessions = [];
for (let offset = 0; offset < 180; offset += [2, 2, 3][offset % 3]) {
  const pick = lifts.filter((lift, index) => (index + offset) % 3 !== 0).slice(0, 5);
  sessions.push({
    date: iso(offset),
    ...(offset % 10 === 0 ? { label: 'Heavy day' } : {}),
    cardio: offset % 6 === 0 ? 30 : 0,
    exercises: pick.map(([name, kg]) => ({
      name,
      sets: [{ kg: String(Math.round(kg * 0.6)), reps: '8', warmup: true }, ...[5, 5, 4].map((reps, set) => ({ kg: String(kg + Math.floor((180 - offset) / 12) * 2.5), reps: String(reps), ...(set === 2 ? { rpe: 9 } : {}), edited: true }))]
    }))
  });
}
const log = [
  { at: Date.now() - 600000, said: 'bench 120 for 2, then 110 for 5 and 5', did: ['Added Bench Press 3 sets to Today'] },
  { at: Date.now() - 500000, said: 'You see, on the desktop, when bench press is open, the graph is open, but I cannot switch to deadlift without scrolling down under the anatomy chart. Can you add three buttons for the best lifts next to each other and show the numbers there?', did: ["Not logged: Didn't understand that one. It's saved, so Marcus can run it through a stronger Exodia."], voice: true },
  { at: Date.now() - 400000, said: 'Voice note', did: ['Not logged: no sound recorded (1 KB)'] },
  { at: Date.now() - 300000, said: 'Pasted from a spreadsheet · 412 rows', did: ['Added 118 days, 1904 sets'] }
];
const full = { version: 1, deviceId: 'screens', name: 'Marcus', started: true, bests: {}, sessions, log, feedback: [{ at: Date.now() - 86400000, said: 'Add a rest timer', kind: 'idea', title: 'Rest timer between sets' }], claudeRuns: [{ at: Date.now() - 3600000, said: 'Make the trends buttons bigger', url: '' }] };

const shots = [
  ['home', '#/', null],
  ['home-open-day', '#/', async (page) => page.click('[data-action="toggle-session"] >> nth=1')],
  ['home-menu', '#/', async (page) => page.click('[data-action="open-menu"]'), 'phone'],
  ['home-box-small', '#/', async (page) => page.click('.dock .prompt .hint', { force: true })],
  ['home-quick-add', '#/', async (page) => page.click('[data-action="open-quick"]')],
  ['home-chat-pulled', '#/', async (page) => { await page.click('.dock .prompt .hint', { force: true }); await page.waitForTimeout(300); await page.click('.grabber'); }],
  ['trends', '#/trends', null],
  ['trends-more', '#/trends', async (page) => page.click('[data-action="trend-more"]')],
  ['log', '#/log', null],
  ['import', '#/import', null],
  ['feedback', '#/feedback', null],
  ['settings', '#/you', null],
  ['admin', '#/admin', null],
  ['red-pill-open', '#/', async (page) => { if (!(await page.locator('.leftPill').count())) return; await page.click('.leftPill'); await page.click('[data-action="left-item"] >> nth=0'); }],
  ['onboarding', '#/', null, 'all', 'fresh'],
  ['link-offer', 'me/' + 'a'.repeat(32), null, 'all', 'fresh']
];
const sizes = [['phone', 393, 852], ['small', 375, 812], ['desktop', 1440, 900]].filter(([, width]) => !only || width === only);

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const [kind, width, height] of sizes) {
    for (const [name, hash, act, where = 'all', data = 'full'] of shots) {
      if (where === 'phone' && kind === 'desktop') continue;
      const page = await browser.newPage({ viewport: { width, height }, hasTouch: kind !== 'desktop' });
      await page.route('**/api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cursor: 1, sessions: [], meta: null, admin: true, name: 'Romy', days: 212 }) }));
      await page.route('**/me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8') }));
      await page.addInitScript((state) => { if (state) localStorage.setItem('exodia.v1', state); }, data === 'full' ? JSON.stringify(full) : '');
      page.on('pageerror', (error) => problems.push(`${kind} ${name}: page error ${error.message}`));
      page.on('console', (message) => { if (message.type() === 'error' && !/favicon|Failed to load resource/.test(message.text())) problems.push(`${kind} ${name}: console ${message.text()}`); });
      await page.goto(`${base}/${hash}`);
      await page.waitForTimeout(1500);
      if (act) {
        try {
          await act(page);
          await page.waitForTimeout(600);
        } catch (error) {
          problems.push(`${kind} ${name}: could not do the step (${error.message.split('\n')[0]})`);
        }
      }
      const wide = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      if (wide > 1) problems.push(`${kind} ${name}: page is ${wide}px wider than the screen`);
      const file = path.join(out, `${kind}-${name}.png`);
      await page.screenshot({ path: file, fullPage: kind !== 'desktop' && !act });
      await page.close();
    }
  }
  await browser.close();
  console.log(`Wrote ${fs.readdirSync(out).length} screenshots to ${out}`);
  console.log(problems.length ? `Problems:\n${problems.join('\n')}` : 'No page errors, nothing wider than the screen.');
})();

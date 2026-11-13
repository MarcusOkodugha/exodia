'use strict';

const STORE_KEY = 'exodia.v1';
// Exodia: a heavy set is a top set at least 80% of your best; everything counts over the last 10 days.
const HEAVY_SHARE = 0.8;
// Legs and arms count from half of your best on that lift (a warm-up with the empty bar doesn't).
const WORK_SHARE = 0.5;
const EXODIA_DAYS = 10;

const LIBRARY = [
  { name: 'Bench Press', piece: 'push', heavy: true, aliases: ['bench', 'bench press', 'bp', 'barbell bench press', 'flat bench', 'flat bench press', 'flat barbell bench press', 'bänkpress'] },
  { name: 'Incline Bench Press', piece: 'push', heavy: true, aliases: ['incline', 'incline bench', 'incline bench press'] },
  { name: 'Incline Dumbbell Press', piece: 'push', heavy: true, aliases: ['incline db', 'incline dumbbell', 'incline dumbbell press'] },
  { name: 'Dumbbell Bench Press', piece: 'push', heavy: true, aliases: ['db bench', 'dumbbell bench', 'dumbbell press'] },
  { name: 'Overhead Press', piece: 'push', heavy: true, aliases: ['ohp', 'overhead press', 'press', 'military press'] },
  { name: 'Dips', piece: 'push', heavy: false, aliases: ['dips', 'dip'] },
  { name: 'Pause Bench Press', piece: 'push', heavy: true, aliases: ['pause bench', 'pause bench press', 'paused bench'] },
  { name: 'Close-Grip Bench Press', piece: 'push', heavy: true, aliases: ['close grip', 'close grip bench', 'close-grip bench', 'closegrip'] },
  { name: 'Deadlift', piece: 'pull', heavy: true, aliases: ['deadlift', 'deadlifts', 'dl', 'marklyft', 'barbell deadlift', 'conventional deadlift'] },
  { name: 'Sumo Deadlift', piece: 'pull', heavy: true, aliases: ['sumo', 'sumo deadlift'] },
  { name: 'Barbell Row', piece: 'pull', heavy: false, aliases: ['row', 'rows', 'barbell row'] },
  { name: 'Pull-up', piece: 'pull', heavy: false, aliases: ['pullup', 'pullups', 'pull-up', 'pull-ups', 'chins', 'chin-ups'] },
  { name: 'Lat Pulldown', piece: 'pull', heavy: false, aliases: ['pulldown', 'lat pulldown', 'lat pull'] },
  { name: 'Lat Pullover', piece: 'pull', heavy: false, aliases: ['lat pullover', 'lat pull-over', 'pullover', 'pull-over', 'cable pullover', 'machine pullover'] },
  { name: 'Dumbbell Pullover', piece: 'pull', heavy: false, aliases: ['dumbbell pullover', 'db pullover'] },
  { name: 'Squat', piece: 'legs', heavy: true, aliases: ['squat', 'squats', 'sq', 'knäböj', 'barbell squat', 'back squat', 'barbell back squat'] },
  { name: 'Hack Squat', piece: 'legs', heavy: true, aliases: ['hack', 'hack squat'] },
  { name: 'Front Squat', piece: 'legs', heavy: true, aliases: ['front squat'] },
  { name: 'Romanian Deadlift', piece: 'legs', heavy: false, aliases: ['rdl', 'romanian deadlift'] },
  { name: 'Stiff-Legged Deadlift', piece: 'legs', heavy: false, aliases: ['stiff leg', 'stiff-legged deadlift', 'sldl'] },
  { name: 'Split Squat', piece: 'legs', heavy: false, aliases: ['bulgarian', 'bulgarian split squat', 'split squat', 'barbell split squat', 'barbell bulgarian split squat', 'bss'] },
  { name: 'Hip Thrust', piece: 'legs', heavy: false, aliases: ['hip thrust', 'hip thrusts'] },
  { name: 'Hip Abduction Machine', piece: 'legs', heavy: false, aliases: ['hip abduction', 'abduction'] },
  { name: 'Reverse Hyperextension', piece: 'legs', heavy: false, aliases: ['reverse hyper', 'reverse hyperextension'] },
  { name: 'Leg Press', piece: 'legs', heavy: false, aliases: ['leg press'] },
  { name: 'Leg Curl', piece: 'legs', heavy: false, aliases: ['leg curl', 'leg curls'] },
  { name: 'Leg Extension', piece: 'legs', heavy: false, aliases: ['leg extension', 'leg extensions'] },
  { name: 'Calf Raise', piece: 'legs', heavy: false, aliases: ['calf raise', 'calf raises', 'calves'] },
  { name: 'Barbell Curl', piece: 'arms', heavy: false, aliases: ['curl', 'curls', 'barbell curl', 'bicep curl', 'biceps curl'] },
  { name: 'Dumbbell Curl', piece: 'arms', heavy: false, aliases: ['db curl', 'dumbbell curl', 'dumbbell curls'] },
  { name: 'Hammer Curl', piece: 'arms', heavy: false, aliases: ['hammer', 'hammer curl', 'hammer curls'] },
  { name: 'Triceps Pushdown', piece: 'arms', heavy: false, aliases: ['pushdown', 'pushdowns', 'triceps pushdown', 'tricep pushdown'] },
  { name: 'Skull Crusher', piece: 'arms', heavy: false, aliases: ['skull crusher', 'skull crushers', 'skullcrusher'] },
  { name: 'Overhead Triceps Extension', piece: 'arms', heavy: false, aliases: ['triceps extension', 'overhead extension'] },
  { name: 'Lateral Raise', piece: null, heavy: false, aliases: ['lateral', 'laterals', 'lateral raise', 'lateral raises', 'side raise'] },
  { name: 'Cable Fly', piece: null, heavy: false, aliases: ['fly', 'flys', 'flies', 'cable fly'] },
  { name: 'Face Pull', piece: null, heavy: false, aliases: ['face pull', 'face pulls'] }
];

const PIECES = [
  { id: 'push', name: 'Push', target: 2, rule: 'heavy press, 2 times' },
  { id: 'pull', name: 'Pull', target: 1, rule: 'heavy deadlift' },
  { id: 'legs', name: 'Legs', target: 1, rule: 'a leg lift, 2 working sets: squat, hack squat, leg press, leg extension…' },
  { id: 'arms', name: 'Arms', target: 1, rule: 'arm work, 2 working sets' },
  { id: 'move', name: 'Move', target: 2, rule: 'cardio or a walk, 20 min or more, 2 times' }
];

const ICONS = {
  pencil: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h10"/></svg>',
  trends: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18l5-6 4 3 7-8"/></svg>',
  home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11L12 4.5 20 11v8a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>',
  log: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>',
  idea: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  admin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l7 2.8v5.2c0 4.3-2.9 7.7-7 9-4.1-1.3-7-4.7-7-9V6.3z"/></svg>',
  settings: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  you: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  chevRight: '<svg class="exChev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  stop: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
  mic: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  clip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/></svg>',
  plusThin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 3.5M16 6h2.5a2.5 2.5 0 0 1-2.6 3.5"/><path d="M12 13v4M9 20h6M10 17h4"/></svg>'
};

const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const estimate = (kg, reps) => (reps <= 1 ? kg : reps <= 10 ? (kg * 36) / (37 - reps) : kg * (1 + reps / 30));
const weightFor = (oneRepMax, reps) => (reps <= 1 ? oneRepMax : reps <= 10 ? (oneRepMax * (37 - reps)) / 36 : oneRepMax / (1 + reps / 30));
const ESTIMATE_INFO = `<div class="info" role="note"><p>Estimated 1RM uses the Brzycki formula up to 10 reps: weight × 36 ÷ (37 − reps), and the Epley formula above 10: weight × (1 + reps ÷ 30). Example: 120 × 7 gives about 144 kg.</p><p>Each day counts its strongest set of 1–10 reps; RPE adds the reps you had left. Sets of more than 10 reps only count when there is nothing heavier, because they say little about a one-rep max. A single you actually lifted is never estimated; it counts as it is.</p></div>`;
const infoButton = () => `<button class="infoBtn" data-action="toggle-info" aria-expanded="${Boolean(view.info)}" aria-label="How the estimate works">i</button>`;
const round = (value) => Math.round(value * 10) / 10;
const pad = (number) => String(number).padStart(2, '0');
const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const todayIso = () => isoDate(new Date());
const parseIso = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const addDays = (iso, days) => {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return isoDate(date);
};
// One formatter each, made once: toLocaleDateString builds a new one per call, and the Trends calendar asks thousands of times.
const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const DAY_FORMAT_YEAR = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const dayLabel = (iso) => {
  const today = todayIso();
  if (iso === today) return 'Today';
  if (iso === addDays(today, -1)) return 'Yesterday';
  return (iso.slice(0, 4) === today.slice(0, 4) ? DAY_FORMAT : DAY_FORMAT_YEAR).format(parseIso(iso)).replace(',', '');
};
// A length of time the way a person says it: "45 minutes", "1 hour", "1 hour and 26 minutes".
const humanMinutes = (total) => {
  const minutes = Math.round(Number(total) || 0);
  const [hours, rest] = [Math.floor(minutes / 60), minutes % 60];
  const part = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  return hours ? `${part(hours, 'hour')}${rest ? ` and ${part(rest, 'minute')}` : ''}` : part(rest, 'minute');
};
const tonnes = (kg) => (kg / 1000).toFixed(1) + ' t';
// Weight moved between two days (kg × reps, warm-ups left out), for the calendar's tonnes.
const liftedBetween = (from, to) => state.sessions.filter((session) => session.date >= from && session.date <= to).reduce((sum, session) => sum + session.exercises.reduce((total, exercise) => total + validSets(exercise).filter((set) => !set.warmup).reduce((inner, set) => inner + Number(set.kg) * Number(set.reps), 0), 0), 0);
const setCount = (count) => count + (count === 1 ? ' set' : ' sets');
const titleCase = (text) => text.trim().replace(/\s+/g, ' ').replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

const libraryEntry = (name) => LIBRARY.find((entry) => entry.name.toLowerCase() === name.toLowerCase());

const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.sessions)) return saved;
  } catch (error) {
    console.error('Could not read saved data', error);
  }
  return { version: 1, deviceId: crypto.randomUUID(), sessions: [], bests: {} };
};

let state = loadState();
// From 2 to 5 Nov a new phone started with someone else's bench best (145) saved as its own; it showed as a 145 bench
// on logs that never went near it. It's dropped here, on the phone that still has it (the server drops it too).
const LEAKED_BESTS = '{"Bench Press":145}';
if (JSON.stringify(state.bests || {}) === LEAKED_BESTS) state.bests = {};
const view = { route: 'home', menu: false, composer: false, open: new Set([todayIso()]), exodiaOpen: false, trendOpen: null, range: 0, draft: '', status: '', listening: false, toast: null, pending: [], fresh: null, search: { query: '', local: [], ai: [], loading: false } };

const SYNC_KEY = 'exodia.sync';
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const newProfileKey = () => [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const freshSync = (profile) => ({ profile, cursor: 0, synced: {}, stamps: {}, metaSynced: null, metaStamp: 0 });

// What the server last had for a day is kept as a short fingerprint, not a second copy of the day, so ten years
// of training still fits in the phone's storage.
const fingerprint = (text) => {
  if (text === null || text === undefined) return null;
  let first = 0xdeadbeef;
  let second = 0x41c6ce57;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 2654435761);
    second = Math.imul(second ^ code, 1597334677);
  }
  first = Math.imul(first ^ (first >>> 16), 2246822507) ^ Math.imul(second ^ (second >>> 13), 3266489909);
  second = Math.imul(second ^ (second >>> 16), 2246822507) ^ Math.imul(first ^ (first >>> 13), 3266489909);
  return `#${(4294967296 * (2097151 & second) + (first >>> 0)).toString(36)}`;
};
const loadSync = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SYNC_KEY));
    if (saved && PROFILE_KEY.test(saved.profile)) {
      for (const [date, value] of Object.entries(saved.synced || {})) if (typeof value === 'string' && !value.startsWith('#')) saved.synced[date] = fingerprint(value);
      return saved;
    }
  } catch (error) {
    console.error('Could not read sync state', error);
  }
  return freshSync(newProfileKey());
};

let syncState = loadSync();
// Remembered from the last sync, so Admin and /admin work from the first moment, not only after the server answers.
view.isAdmin = Boolean(syncState?.admin);
try { view.adminTab = localStorage.getItem('exodia.adminTab') || 'chat'; } catch { view.adminTab = 'chat'; }
const localJson = () => Object.fromEntries(state.sessions.map((session) => [session.date, JSON.stringify(session)]));
const metaJson = () => JSON.stringify({ name: state.name || '', bests: state.bests || {}, log: state.log || [], ...(state.body ? { body: state.body } : {}), ...(state.visits && Object.keys(state.visits).length ? { visits: state.visits } : {}) });
let lastSaved = localJson();
let lastMeta = metaJson();

const writeLocal = () => {
  if (view.sandbox || view.preview) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.setItem(SYNC_KEY, JSON.stringify(syncState));
  } catch (error) {
    console.error('Could not save', error);
  }
};

// Undo and redo, several steps back. Each step keeps only the days it changed (as they were before), so even a big
// import is one small step. Kept in memory for this visit; changes that arrive from other devices are not steps.
let undoSteps = [];
let redoSteps = [];
let replaying = false;
const recordStep = (before, now) => {
  const last = undoSteps.at(-1);
  // Typing a number fires many saves; changes within a moment of each other are one step. A step that already has
  // a name (an add, a delete) is finished, so the next change is its own Undo.
  if (last && now - last.at < 1500 && !last.title) {
    for (const [date, json] of Object.entries(before)) if (!(date in last.before)) last.before[date] = json;
    last.at = now;
  } else undoSteps = [...undoSteps, { at: now, title: '', before }].slice(-30);
  redoSteps = [];
};
// Exercises renamed in the library, old name → new. Bulgarian split squat is logged with a barbell, so "Split Squat".
const RENAMED = { 'Bulgarian Split Squat': 'Split Squat' };
const renameOld = () => {
  if (view.sandbox) return false;
  let renamed = false;
  for (const session of state.sessions) for (const exercise of session.exercises || []) {
    if (RENAMED[exercise.name]) {
      exercise.name = RENAMED[exercise.name];
      renamed = true;
    }
  }
  return renamed;
};
const save = () => {
  const now = Date.now();
  const current = localJson();
  const before = {};
  for (const date of new Set([...Object.keys(current), ...Object.keys(lastSaved)])) {
    if ((current[date] ?? null) !== (lastSaved[date] ?? null)) {
      syncState.stamps[date] = now;
      before[date] = lastSaved[date] ?? null;
    }
  }
  if (!replaying && !view.sandbox && Object.keys(before).length) recordStep(before, now);
  lastSaved = current;
  const meta = metaJson();
  if (meta !== lastMeta) syncState.metaStamp = now;
  lastMeta = meta;
  writeLocal();
  scheduleSync();
};

let syncTimer = 0;
let syncing = null;
const scheduleSync = (delay = 800) => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncNow, delay);
};

const applyIncoming = (result) => {
  let changed = false;
  for (const row of result.sessions) {
    const incoming = row.data ? JSON.stringify(row.data) : null;
    const local = lastSaved[row.date] ?? null;
    const dirty = fingerprint(local) !== (syncState.synced[row.date] ?? null);
    // Changed here while the server had another version: keep it; the next sync sends it and the server merges.
    if (dirty) continue;
    // Which server version this device now has: sent along with its next edit of that day.
    syncState.bases = { ...(syncState.bases || {}), [row.date]: row.updated };
    syncState.synced[row.date] = fingerprint(incoming);
    if (local === incoming) continue;
    state.sessions = state.sessions.filter((session) => session.date !== row.date);
    if (row.data) state.sessions.push(row.data);
    changed = true;
  }
  if (result.meta) {
    const { updated, ...incomingMeta } = result.meta;
    if (JSON.stringify(incomingMeta.bests || {}) === LEAKED_BESTS) incomingMeta.bests = {};
    const incoming = JSON.stringify({ name: incomingMeta.name || '', bests: incomingMeta.bests || {}, log: incomingMeta.log || [], ...(incomingMeta.body ? { body: incomingMeta.body } : {}), ...(incomingMeta.visits && Object.keys(incomingMeta.visits).length ? { visits: incomingMeta.visits } : {}) });
    const dirty = lastMeta !== syncState.metaSynced;
    // Bodyweight saved on another device comes through even while this one has unsent log lines (a body just
    // typed here is kept: it goes up with the next sync).
    if (dirty && incomingMeta.body && !state.body?.kg) {
      state.body = incomingMeta.body;
      changed = true;
    }
    if (!dirty) {
      syncState.metaSynced = incoming;
      if (incoming !== lastMeta) {
        state.name = incomingMeta.name || '';
        state.bests = incomingMeta.bests || {};
        state.log = incomingMeta.log || [];
        if (incomingMeta.body) state.body = incomingMeta.body;
        // Visits only ever add up: an older copy without them never wipes the ones here.
        state.visits = { ...(state.visits || {}), ...(incomingMeta.visits || {}) };
        changed = true;
      }
    }
  }
  lastSaved = localJson();
  lastMeta = metaJson();
  return changed;
};

const syncNow = () => {
  if (view.sandbox || state.demo) return Promise.resolve();
  if (syncing) {
    scheduleSync();
    return syncing;
  }
  if (!navigator.onLine) return Promise.resolve(false);
  const current = { ...lastSaved };
  const changes = [...new Set([...Object.keys(current), ...Object.keys(syncState.synced)])]
    .filter((date) => fingerprint(current[date]) !== (syncState.synced[date] ?? null))
    .slice(0, 500)
    .map((date) => ({ date, updated: syncState.stamps[date] || 1, base: syncState.bases?.[date] || 0, data: current[date] ? JSON.parse(current[date]) : null }));
  const sentMeta = lastMeta;
  const meta = sentMeta !== syncState.metaSynced ? { ...JSON.parse(sentMeta), updated: syncState.metaStamp || 1 } : null;
  syncing = fetch('/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile },
    // The first sync after opening, or while the bodyweight is missing, asks for the whole profile: a device that
    // synced past a change on an older version would otherwise never get it (the phone asked for 100 kg again).
    body: JSON.stringify({ since: syncState.cursor, changes, meta, ...(!view.syncedAt || !state.body?.kg ? { wantMeta: true } : {}) })
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Sync failed'))))
    .then((result) => {
      for (const change of changes) syncState.synced[change.date] = fingerprint(current[change.date]);
      if (meta) syncState.metaSynced = sentMeta;
      const changed = applyIncoming(result);
      // Old exercise names the library has since renamed: saved like an edit by hand, so every device gets them.
      if (renameOld()) {
        replaying = true;
        save();
        replaying = false;
        renderSoon();
      }
      syncState.cursor = result.cursor;
      syncState.admin = Boolean(result.admin);
      writeLocal();
      view.syncedAt = Date.now();
      if (Boolean(result.admin) !== Boolean(view.isAdmin)) {
        view.isAdmin = Boolean(result.admin);
        loadLeft();
        // Right away, even with the box focused (the computer focuses it on open): the redraw keeps your words and
        // caret, and waiting for a blur left Admin hidden until you clicked somewhere.
        render();
      }
      view.syncFailed = false;
      if (view.isAdmin) loadLeft();
      if (Array.isArray(result.split) && result.split.length > 1 && !view.splitAsk) {
        let answered = '';
        try {
          answered = localStorage.getItem(SPLIT_KEY) || '';
        } catch {
          answered = '';
        }
        if (answered !== syncState.profile) {
          view.splitAsk = result.split.map((name) => String(name).slice(0, 40));
          render();
        }
      }
      if (changed) renderSoon();
      else if (view.route === 'you') renderSoon();
      if (changes.length === 500) scheduleSync(0);
      return true;
    })
    .catch(() => {
      view.syncFailed = true;
      return false;
    })
    .finally(() => {
      syncing = null;
    });
  return syncing;
};

const clearToast = () => {
  if (view.toast?.pinned) return;
  view.toast = null;
  document.querySelector('.toast')?.remove();
};

const renderSoon = () => {
  if (document.activeElement && document.activeElement.matches('.page input, #draft')) view.renderOnBlur = true;
  else render();
};

const profileLink = () => `${location.origin}/me/${syncState.profile}`;
// The install file is only handed out once it can say whose log this is (start at /me/<key>): a home-screen app on
// iPhone gets its own empty storage, so one that started at / or /join opened a fresh, empty Exodia.
const pointManifest = () => {
  if (!syncState.profile) return;
  let manifest = document.querySelector('link[rel="manifest"]');
  if (!manifest) {
    manifest = document.createElement('link');
    manifest.rel = 'manifest';
    document.head.append(manifest);
  }
  manifest.href = `/manifest.webmanifest?k=${syncState.profile}`;
};
// Everyone gets the same orange app; drop the old blue look some browsers remembered.
const applyFlavor = () => {
  if (!state.flavor) return;
  delete state.flavor;
  writeLocal();
};

const joinProfile = async (key) => {
  if (key === syncState.profile) return true;
  // Example data never joins a real log: drop it first, or the join can't sync and Alex's days would merge in.
  if (state.demo) Object.assign(state, { sessions: [], name: '', bests: {}, demo: false });
  // One lifter's log never pours into another's. A log this phone already synced stays with its own profile (its last
  // edits are sent there first); only days that were never synced anywhere come along to the joined log.
  const ownLog = Boolean(syncState.profile && (syncState.cursor > 0 || Object.keys(syncState.synced || {}).length));
  if (ownLog) await syncNow().catch(() => false);
  const previous = { sessions: state.sessions, name: state.name, bests: state.bests, sync: syncState };
  // What comes along into the joined log: nothing when the old log lives on its own profile.
  const carried = ownLog ? { sessions: [], name: '', bests: {} } : previous;
  syncState = freshSync(key);
  state.sessions = [];
  state.name = '';
  state.bests = {};
  lastSaved = localJson();
  lastMeta = metaJson();
  if (!(await syncNow())) {
    syncState = previous.sync;
    state.sessions = previous.sessions;
    state.name = previous.name;
    state.bests = previous.bests;
    lastSaved = localJson();
    lastMeta = metaJson();
    return false;
  }
  for (const old of carried.sessions) {
    const session = sessionFor(old.date);
    if (!session) {
      state.sessions.push(old);
      continue;
    }
    for (const exercise of old.exercises) {
      if (!session.exercises.some((item) => item.name === exercise.name)) session.exercises.push(exercise);
    }
    session.cardio = Math.max(session.cardio || 0, old.cardio || 0);
  }
  if (!state.name && carried.name) state.name = carried.name;
  state.bests = { ...carried.bests, ...state.bests };
  save();
  pointManifest();
  return true;
};

const sortedSessions = () => [...state.sessions].sort((first, second) => second.date.localeCompare(first.date));
const sessionFor = (date) => state.sessions.find((session) => session.date === date);
const ensureSession = (date) => {
  let session = sessionFor(date);
  if (!session) {
    session = { date, exercises: [], accessories: 30, cardio: 0 };
    state.sessions.push(session);
  }
  return session;
};
const validSets = (exercise) => exercise.sets.filter((set) => Number(set.kg) >= 0 && Number(set.reps) > 0 && set.kg !== '' && set.reps !== '');
const sessionVolume = (session) => session.exercises.reduce((sum, exercise) => sum + validSets(exercise).reduce((total, set) => total + Number(set.kg) * Number(set.reps), 0), 0);
const sessionSets = (session) => session.exercises.reduce((sum, exercise) => sum + validSets(exercise).length, 0);
// Bodyweight lifts (pull-ups, chin-ups, dips, push-ups, muscle-ups): the kg logged is what was added on top of you,
// so with a bodyweight saved, estimates use bodyweight + added, like other apps do.
const BODYWEIGHT_LIFT = /pull-?\s?ups?|chin-?\s?ups?|\bdips?\b|push-?\s?ups?|muscle-?\s?ups?/i;
const isBodyweightLift = (name) => BODYWEIGHT_LIFT.test(String(name || ''));
const bodyLoad = (name, kg) => (isBodyweightLift(name) && Number(state.body?.kg) > 0 ? Number(kg || 0) + Number(state.body.kg) : Number(kg));
const repsInTank = (set) => (Number(set.rpe) >= 1 ? Math.min(5, Math.max(0, 10 - Number(set.rpe))) : 0);
const setEstimate = (set) => (set.warmup ? 0 : estimate(Number(set.kg), Number(set.reps) + repsInTank(set)));
// The day's estimate comes from its sets of 1–10 reps (counting reps left in the tank). Higher-rep sets only count
// when there's nothing heavier, because 12+ reps say little about a one-rep max.
const estimateSets = (exercise) => {
  const sets = validSets(exercise).filter((set) => !set.warmup);
  const heavy = sets.filter((set) => Number(set.reps) + repsInTank(set) <= 10);
  return heavy.length ? heavy : sets;
};
const estimateSet = (exercise) => estimateSets(exercise).reduce((winner, set) => (!winner || setEstimate(set) > setEstimate(winner) ? set : winner), null);
const setValue = (name, set) => estimate(bodyLoad(name, set.kg), Number(set.reps) + repsInTank(set));
const topEstimate = (exercise) => Math.max(0, ...estimateSets(exercise).map((set) => setValue(exercise.name, set)));

// Harder variants count for their main lift (a 140 kg paused bench means you bench at least 140), never the other way.
const HARDER_VARIANTS = {
  'Bench Press': ['Close-Grip Bench Press', 'Pause Bench Press', 'Paused Bench Press', 'Bench Press With Pause', 'Spoto Press', 'Larsen Press', 'Pin Press'],
  Squat: ['Pause Squat', 'Paused Squat', 'Pin Squat', 'Tempo Squat', 'High Bar Squat', 'High-Bar Squat', 'Front Squat', 'Safety Bar Squat', 'SSB Squat'],
  Deadlift: ['Deficit Deadlift', 'Pause Deadlift', 'Paused Deadlift'],
};
const MAIN_LIFT = Object.fromEntries(Object.entries(HARDER_VARIANTS).flatMap(([main, variants]) => variants.map((variant) => [variant.toLowerCase(), main.toLowerCase()])));
const countsFor = (name) => [name, ...(HARDER_VARIANTS[name] || [])];

// Answers about your history ("best before this day", "days before this one") are remembered until your log changes,
// so the screen doesn't re-read every workout for every set it shows.
let memoSaved = null;
let memoBests = null;
let memoCount = -1;
let memo = new Map();
const remember = (key, compute) => {
  if (memoSaved !== lastSaved || memoBests !== state.bests || memoCount !== state.sessions.length) {
    memo = new Map();
    memoSaved = lastSaved;
    memoBests = state.bests;
    memoCount = state.sessions.length;
  }
  if (!memo.has(key)) memo.set(key, compute());
  return memo.get(key);
};
const bestBefore = (name, date, logged = false) => remember(`best|${name}|${date}|${logged}`, () => bestBeforeFresh(name, date, logged));
// Sets over 10 reps say little about a one-rep max (100 × 14 "estimates" 147), so once a lift has any set of 1–10
// reps they never make its all-time best. The day's own point on the chart still uses them when that day has nothing heavier.
const heavySet = (set) => !set.warmup && Number(set.reps) + repsInTank(set) <= 10;
const liftHasHeavy = (name) => remember(`heavy|${name}`, () => state.sessions.some((session) => session.exercises.some((exercise) => countsFor(name).includes(exercise.name) && validSets(exercise).some(heavySet))));
const bestDayEstimate = (name, exercise) => (liftHasHeavy(name) ? Math.max(0, ...validSets(exercise).filter(heavySet).map((set) => setValue(exercise.name, set))) : topEstimate(exercise));
const bestBeforeFresh = (name, date, logged = false) => {
  let best = logged ? 0 : Number(state.bests?.[name]) || 0;
  for (const session of state.sessions) {
    if (session.date >= date) continue;
    for (const exercise of session.exercises) if (countsFor(name).includes(exercise.name)) best = Math.max(best, bestDayEstimate(name, exercise));
  }
  return best;
};
const bestOverall = (name) => bestBefore(name, '9999-12-31');
// Form vs best: your best estimated one-rep max from the last 10 weeks against your best ever (the Est. 1RM tile),
// both from sets of 1–10 reps. The best ever includes these 10 weeks, so it tops out at 100%: "At your best".
const FORM_DAYS = 70;
const nowVsBest = (name) => {
  const best = bestOverall(name);
  if (!best) return null;
  const since = addDays(todayIso(), -FORM_DAYS);
  let now = 0;
  for (const session of state.sessions) {
    if (session.date < since) continue;
    for (const exercise of session.exercises) if (countsFor(name).includes(exercise.name)) now = Math.max(now, bestDayEstimate(name, exercise));
  }
  const pct = Math.min(100, Math.round((now / best) * 100));
  return { pct, now: Math.round(now), best: Math.round(best) };
};
const nowLine = (name) => {
  const form = nowVsBest(name);
  if (!form) return '';
  const head = !form.now ? 'Not lifted in 10 weeks' : form.pct >= 100 ? 'At your best' : `${form.pct}% of your best`;
  const numbers = !form.now ? `best ${form.best} kg` : form.pct >= 100 ? `${form.best} kg est.` : `${form.now} vs ${form.best} kg`;
  return `<div class="nowBest"><p><b>${head}</b><span class="muted num"> · <span class="nw">${numbers}</span></span>${form.now ? '<span class="muted"> · <span class="nw">last 10 weeks</span></span>' : ''}</p><div class="nowBar" aria-hidden="true"><i style="width:${form.pct}%"></i></div></div>`;
};
// How many days a lift (with its harder variants) was logged, shown under its name in the lift list.
const liftDays = (name) => remember(`days|${name}`, () => state.sessions.filter((session) => session.exercises.some((exercise) => countsFor(name).includes(exercise.name) && validSets(exercise).length > 0)).length);
const setsOf = (name) => state.sessions.flatMap((session) => session.exercises.filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets)).map((set) => ({ kg: Number(set.kg), reps: Number(set.reps), rpe: set.rpe }));
const bestSingle = (name) => Math.max(Number(state.bests?.[name]) || 0, ...setsOf(name).filter((set) => set.reps === 1).map((set) => set.kg));
const heaviestLifted = (name) => {
  const record = Number(state.bests?.[name]) > 0 ? [{ kg: Number(state.bests[name]), reps: 1 }] : [];
  return [...record, ...setsOf(name)].reduce((winner, set) => (!winner || set.kg > winner.kg || (set.kg === winner.kg && set.reps > winner.reps) ? set : winner), null);
};
const bestEstimate = (name) => setsOf(name)
  .filter((set) => set.reps > 1 || repsInTank(set) > 0)
  .reduce((winner, set) => {
    const value = setEstimate(set);
    return !winner || value > winner.value ? { ...set, value } : winner;
  }, null);
const loggedLifts = () => [...new Set(state.sessions.flatMap((session) => session.exercises.filter((exercise) => validSets(exercise).length > 0).map((exercise) => exercise.name)))];

const lastSetsFor = (name, skipDate = todayIso()) => {
  for (const session of sortedSessions()) {
    if (session.date === skipDate) continue;
    const exercise = session.exercises.find((item) => item.name === name);
    if (exercise && validSets(exercise).length > 0) {
      // Sets saved without a weight (0 kg on a lift that isn't bodyweight) aren't worth copying: start empty instead.
      if (!isBodyweightLift(name) && validSets(exercise).every((set) => !(Number(set.kg) > 0))) return null;
      return validSets(exercise);
    }
  }
  return null;
};

// Which Exodia pieces each day hit, worked out once in one pass through your history (a heavy press or deadlift is
// judged against your best before that day). Opening the app used to redo this for every day of your history, which
// took seconds with a few years of training. Kept until your log changes.
let hitsCache = null;
const dayHits = () => {
  if (hitsCache && hitsCache.saved === lastSaved && hitsCache.bests === state.bests && hitsCache.sessions === state.sessions.length) return hitsCache.map;
  const map = new Map();
  const bestBy = {};
  const bestOf = (name) => Math.max(Number(state.bests?.[name]) || 0, ...countsFor(name).map((item) => bestBy[item] || 0));
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    const hit = { push: false, pull: false, legs: false, arms: false, move: (session.cardio || 0) >= 20 };
    for (const exercise of session.exercises) {
      const entry = libraryEntry(exercise.name);
      if (!entry || !entry.piece || validSets(exercise).length === 0) continue;
      // Legs and arms need real work, not a warm-up: at least 2 working sets, and when you have a best on that lift,
      // a top set of at least half of it (an empty-bar 20 × 10 squat with a 190 best doesn't count as legs).
      if (entry.piece === 'arms' || entry.piece === 'legs') {
        const working = validSets(exercise).filter((set) => !set.warmup);
        const best = bestOf(exercise.name);
        if (working.length >= 2 && (!best || isBodyweightLift(exercise.name) || topEstimate(exercise) >= best * WORK_SHARE)) hit[entry.piece] = true;
        continue;
      }
      if (!entry.heavy || (entry.piece !== 'pull' && entry.piece !== 'push')) continue;
      if (topEstimate(exercise) >= bestOf(exercise.name) * HEAVY_SHARE) hit[entry.piece] = true;
    }
    for (const exercise of session.exercises) bestBy[exercise.name] = Math.max(bestBy[exercise.name] || 0, topEstimate(exercise));
    map.set(session.date, hit);
  }
  hitsCache = { saved: lastSaved, bests: state.bests, sessions: state.sessions.length, map, history: null };
  return map;
};

// Exodia is a rolling 10 days: it's hit (blue) while everything it needs (2 heavy presses, a heavy deadlift, legs,
// arms, 2 moves of 20 min) all sit inside the last 10 days, and it goes back to orange the day the first of them
// drops out, unless something newer replaced it. So you can hit it with 2 days of the window left and be blue for
// those 2 days. Each time it turns blue counts as one hit. One walk through the days, kept until your log changes.
const exodiaHistory = () => {
  const today = todayIso();
  const empty = { push: 0, pull: 0, legs: 0, arms: 0, move: 0 };
  if (state.sessions.length === 0) return { hits: 0, last: null, counts: { ...empty }, days: [], active: false, left: 0 };
  const hits = dayHits();
  if (hitsCache.history?.today === today) return hitsCache.history.value;
  const first = [...hits.keys()].sort()[0];
  const counts = { ...empty };
  const add = (iso, sign) => {
    const hit = hits.get(iso);
    if (hit) for (const key of Object.keys(counts)) if (hit[key]) counts[key] += sign;
  };
  const complete = () => PIECES.every((piece) => counts[piece.id] >= piece.target);
  let total = 0;
  let last = null;
  let was = false;
  // The days Exodia turned blue, for the calendar.
  const days = [];
  for (let iso = first; iso <= today; iso = addDays(iso, 1)) {
    add(iso, 1);
    add(addDays(iso, -EXODIA_DAYS), -1);
    const now = complete();
    if (now && !was) {
      total += 1;
      last = iso;
      days.push(iso);
    }
    was = now;
  }
  const active = was;
  const window = { ...counts };
  // While blue: how many days until the oldest piece leaves the window, if nothing new is logged, and which one.
  let left = 0;
  let firstOut = '';
  if (active) {
    for (let ahead = 1; ahead <= EXODIA_DAYS; ahead += 1) {
      add(addDays(today, ahead - EXODIA_DAYS), -1);
      if (!complete()) {
        left = ahead;
        firstOut = PIECES.find((piece) => counts[piece.id] < piece.target)?.name || '';
        break;
      }
    }
  }
  const value = { hits: total, last, counts: window, days, active, left, runsOut: firstOut };
  hitsCache.history = { today, value };
  return value;
};
const exodiaActive = () => exodiaHistory().active;
// The bars: what the last 10 days hold, full while Exodia is hit.
const pieceProgress = () => {
  const { counts } = exodiaHistory();
  return PIECES.map((piece) => ({ ...piece, done: counts[piece.id], complete: counts[piece.id] >= piece.target }));
};

const findExerciseName = (rawName) => {
  const clean = rawName.toLowerCase().replace(/[^\p{L}\s-]/gu, '').trim();
  if (!clean) return null;
  for (const entry of LIBRARY) {
    if (entry.name.toLowerCase() === clean || entry.aliases.includes(clean)) return entry.name;
  }
  const known = new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)));
  for (const name of known) if (name.toLowerCase() === clean) return name;
  return null;
};

const parseChunk = (chunk) => {
  const text = chunk.toLowerCase().replace(/kilos?|kg/g, ' ').replace(/×/g, 'x').trim();
  if (!text) return { empty: true };
  const cardio = text.match(/^(cardio|run|ran|running|bike|biked|cycling|walk|walked|walking|hike|hiked|hiking|swim|swam|rowing|elliptical|stairs|löpning|cykel|promenad|vandring)\D*(\d+(?:[.,]\d+)?)\s*(min|minutes?|h|hours?|hrs?|timmar?|tim|km|k|mi|miles?|m|meters?)?\b/);
  if (cardio) {
    const amount = Number(cardio[2].replace(',', '.'));
    const unit = cardio[3] || 'min';
    // Distance is not time: the AI works that out. Hours become minutes.
    if (/^(km|k|mi|miles?|m|meters?)$/.test(unit)) return null;
    const minutes = /^(h|hours?|hrs?|timmar?|tim)$/.test(unit) ? Math.round(amount * 60) : Math.round(amount);
    // Named in English whatever language it was typed in, so a Swedish note reads the same as an English one.
    const word = cardio[1].toLowerCase();
    const name = /^(run|ran|running|löpning)$/.test(word) ? 'Running' : /^(bike|biked|cycling|cykel)$/.test(word) ? 'Cycling' : /^(walk|walked|walking|promenad)$/.test(word) ? 'Walk' : /^(hike|hiked|hiking|vandring)$/.test(word) ? 'Hiking' : /^(swim|swam)$/.test(word) ? 'Swimming' : /^rowing$/.test(word) ? 'Rowing' : '';
    return minutes > 0 && minutes <= 600 ? { cardio: minutes, ...(name ? { cardioName: name } : {}) } : null;
  }
  const match = text.match(/^([\p{L}][\p{L}\s-]*?)\s+(\d.*)$/u);
  if (!match) return null;
  const name = findExerciseName(match[1]);
  if (!name) return null;
  const numbers = match[2].replace(/\s+reps?\b/g, ' ').replace(/\s+/g, ' ').trim();
  // Anything that looks off (dozens of sets, reps over 50, a 2 kg squat) goes to the AI instead of being guessed.
  const sane = (sets) => sets.length > 0 && sets.length <= 15 && sets.every((set) => Number(set.reps) > 0 && Number(set.reps) <= 50 && Number(set.kg) >= 0 && Number(set.kg) <= 500) ? { name, sets } : null;
  // "N sets" means N of the same set: "100 for 5, 3 sets", "3 sets of 5 at 100", "3x5 100".
  const copies = (count, kg, reps) => sane(Array.from({ length: Number(count) }, () => ({ kg: kg.replace(',', '.'), reps })));
  const forSets = numbers.match(/^(\d+(?:[.,]\d+)?)\s*(?:for|x)\s*(\d+)\s*,?\s*(\d+)\s*sets?$/);
  if (forSets) return copies(forSets[3], forSets[1], forSets[2]);
  const setsOf = numbers.match(/^(\d+)\s*sets?\s*(?:of|x)\s*(\d+)\s*(?:at|@|with|x)\s*(\d+(?:[.,]\d+)?)$/);
  if (setsOf) return copies(setsOf[1], setsOf[3], setsOf[2]);
  const setsFirst = numbers.match(/^(\d+)\s*x\s*(\d+)\s+(?:at\s*|@\s*)?(\d+(?:[.,]\d+)?)$/);
  if (setsFirst) return Number(setsFirst[1]) <= 12 && Number(setsFirst[3].replace(',', '.')) > 20 ? copies(setsFirst[1], setsFirst[3], setsFirst[2]) : null;
  // Any other way of saying sets is left to the AI rather than guessed.
  if (/\bsets?\b/.test(numbers)) return null;
  const straight = numbers.match(/^(\d+(?:[.,]\d+)?)\s*x\s*(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*$/);
  if (straight) {
    const [first, second, third] = [straight[1], straight[2], straight[3]].map((value) => Number(value.replace(',', '.')));
    // 5x5x100 is sets × reps × kg; 100x5x3 is kg × reps × sets. The big number is the weight.
    if (third > 20 && first <= 12) return sane(Array.from({ length: first }, () => ({ kg: String(third), reps: String(second) })));
    return sane(Array.from({ length: third }, () => ({ kg: String(first), reps: String(second) })));
  }
  if (/^\d+(?:[.,]\d+)?\s*x\s*\d+(\s+\d+(?:[.,]\d+)?\s*x\s*\d+)*\s*$/.test(numbers)) {
    return sane([...numbers.matchAll(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+)/g)].map((pair) => ({ kg: pair[1].replace(',', '.'), reps: pair[2] })));
  }
  const loose = numbers.match(/^(\d+(?:[.,]\d+)?)\s*(?:for|x)\s+(.+)$/);
  if (loose) {
    const parts = loose[2].split(/,|\band\b|\boch\b|\s+/).map((part) => part.trim()).filter(Boolean);
    const reps = parts.filter((part) => /^\d+$/.test(part));
    if (reps.length > 0 && reps.length === parts.length) return sane(reps.map((count) => ({ kg: loose[1].replace(',', '.'), reps: count })));
  }
  return null;
};

const parseLocally = (text) => {
  const chunks = text.split(/\n|;|\.\s|\bthen\b|\bsen\b/i).map((chunk) => chunk.trim()).filter(Boolean);
  const result = { exercises: [], cardioMinutes: 0 };
  for (const chunk of chunks) {
    const parsed = parseChunk(chunk);
    if (!parsed) return null;
    if (parsed.empty) continue;
    if (parsed.cardio) {
      result.cardioMinutes += parsed.cardio;
      if (parsed.cardioName) result.cardioName = parsed.cardioName;
    }
    else result.exercises.push(parsed);
  }
  return result.exercises.length > 0 || result.cardioMinutes > 0 ? result : null;
};

const recentLog = () => sortedSessions()
  .filter((session) => session.exercises.length || session.cardio)
  .slice(0, 12)
  .map((session) => `${session.date}: ${[...session.exercises.map((exercise) => `${exercise.name} ${validSets(exercise).map((set) => `${set.kg}x${set.reps}${set.rpe ? `@${set.rpe}` : ''}${set.warmup ? ' warm-up' : ''}`).join(', ')}`), session.cardio ? `Cardio ${session.cardio} min` : null].filter(Boolean).join('; ')}`)
  .join('\n');

const laterJobs = () => (state.later || []);
// What a note means depends on when it was written and which day was being edited: a note that waits for the AI
// keeps both, so "yesterday" and "make the last set 105" still land where they were meant to.
// While Exodia waits for an answer, the empty box shows what an answer looks like ("it was 10 reps").
const askedOpen = () => Boolean(view.asked && Date.now() - view.asked.at < 60 * 60000);
const exampleAnswer = (question) => {
  const words = String(question || '');
  if (/which (exercise|lift)|what (exercise|lift)/i.test(words)) return 'Answer, like: Hammer Curl';
  if (/which day|what day|when\b|date/i.test(words)) return 'Answer, like: yesterday';
  if (/rep/i.test(words)) return 'Answer, like: it was 10 reps';
  if (/kg|kilo|weight|heavy/i.test(words)) return 'Answer, like: it was 15 kg';
  if (/sets?\b/i.test(words)) return 'Answer, like: 3 sets';
  return 'Type your answer';
};
const noteContext = () => ({ ...(view.asked && Date.now() - view.asked.at < 60 * 60000 ? { asked: `${view.asked.question}${view.asked.said ? ` (about their note: "${view.asked.said.slice(0, 300)}")` : ''}` } : {}), today: todayIso(), viewing: view.editContext?.date || view.composerDate || todayIso(), focus: view.editContext ? `${view.editContext.names.join(', ') || 'the workout'} on ${view.editContext.date}` : '' });
// No connection at all is a "try again later", same as a busy AI.
// Every request a person waits on gives up after a while with a reason, so "writing…" never hangs forever on bad wifi.
const timedFetch = (url, options = {}, ms = 45000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((error) => {
      throw controller.signal.aborted ? Object.assign(new Error(`No answer in ${Math.round(ms / 1000)} seconds. Try again.`), { timedOut: true }) : error;
    })
    .finally(() => clearTimeout(timer));
};
// A parse that timed out is safe to try again by itself; an import (/api/add, which can save) is not.
const fetchOrLater = (url, options, ms = 45000) => timedFetch(url, options, ms).catch((error) => {
  if (error.timedOut && url !== '/api/parse') throw error;
  throw Object.assign(new Error(error.timedOut ? error.message : 'No connection right now.'), { later: true, busy: true });
});
const parseWithAi = async (text, audio, hint = '', saved = null) => {
  const response = await fetchOrLater('/api/parse', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile },
    body: JSON.stringify({ text, audio, hint, ...(view.sandbox ? { dry: true } : {}), name: state.name || '', ...(state.body?.kg ? { bodyweight: state.body.kg } : {}), ...noteContext(), ...(saved || {}), recent: recentLog(), deviceId: state.deviceId, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) })
  });
  const body = await response.json().catch(() => ({}));
  // Busy, rate-limited or down: worth trying again later by itself. A note the AI read but couldn't use is not.
  if (!response.ok) throw Object.assign(new Error(body.error || 'The AI could not read that.'), { heard: body.transcript || '', later: response.status === 429 || response.status === 503 });
  return body;
};

const announced = new Set();
const priorSets = (name, date) => remember(`prior|${name}|${date}`, () => state.sessions
  .filter((session) => session.date < date)
  .flatMap((session) => session.exercises.filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets))
  .map((set) => ({ kg: Number(set.kg), reps: Number(set.reps) })));
const singleBefore = (name, date, logged = false) => remember(`single|${name}|${date}|${logged}`, () => Math.max(logged ? 0 : Number(state.bests?.[name]) || 0, ...priorSets(name, date).filter((set) => set.reps === 1).map((set) => set.kg)));

const earlierToday = (name, date, set) => {
  const sets = (sessionFor(date)?.exercises || []).filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets);
  return sets.slice(0, Math.max(0, sets.indexOf(set))).filter((other) => !other.warmup);
};

const earlierDays = (name, date) => remember(`days|${name}|${date}`, () => new Set(state.sessions
  .filter((session) => session.date < date && session.exercises.some((exercise) => countsFor(name).includes(exercise.name) && validSets(exercise).length))
  .map((session) => session.date)).size);

const prKind = (name, date, set) => {
  const kg = Number(set.kg);
  const reps = Number(set.reps);
  if (set.warmup || set.kg === '' || set.reps === '' || !(kg > 0) || !(reps > 0)) return null;
  const today = earlierToday(name, date, set);
  // PRs compare against logged history only; imported all-time bests would hide every climb up to them. A single is a
  // PR as soon as it beats every single you logged on earlier days (160, 180, then 200 × 1: the 200 is a PR).
  const before = Math.max(singleBefore(name, date, true), ...today.filter((other) => Number(other.reps) === 1).map((other) => Number(other.kg)));
  if (reps === 1 && singleBefore(name, date, true) > 0 && kg > before) return 'max';
  if (earlierDays(name, date) < 3) return null;
  // A rep PR is a real lift too, never an estimate or RPE: more kg than you've ever lifted for this many reps or more
  // (140 × 2 when your heaviest double was 135). 140 × 1 @8 with a 145 single is not a PR. Light sets of reps you've
  // never done before don't count (nothing to beat), and sets over 10 reps only count when a lift has none of 1–10.
  if (reps > 10 && liftHasHeavy(name)) return null;
  const basis = [...priorSets(name, date), ...today.map((other) => ({ kg: Number(other.kg), reps: Number(other.reps) }))].filter((other) => other.reps >= reps);
  return basis.length && kg > Math.max(...basis.map((other) => other.kg)) ? 'est' : null;
};

const checkPr = (name, date = todayIso()) => {
  const session = sessionFor(date);
  const exercise = session && session.exercises.find((item) => item.name === name);
  if (!exercise) return;
  const prs = validSets(exercise).map((set) => ({ kg: Number(set.kg), reps: Number(set.reps), est: setEstimate(set), kind: prKind(name, date, set) })).filter((set) => set.kind);
  const top = prs.filter((set) => set.kind === 'max').sort((first, second) => second.kg - first.kg)[0] || prs.sort((first, second) => second.kg - first.kg)[0];
  const key = top ? `${name}:${date}:${top.kg}x${top.reps}` : '';
  if (!top || announced.has(key)) return;
  announced.add(key);
  view.toast = top.kind === 'max'
    ? { kind: 'max', name, title: `New 1RM PR · ${name}`, text: `${top.kg} kg, +${round(top.kg - singleBefore(name, date))} kg on your best single` }
    : { kind: 'rep', name, title: `New PR · ${name}`, text: `${top.kg} × ${top.reps}, your heaviest for ${top.reps} reps` };
  const shown = view.toast;
  setTimeout(() => {
    if (view.toast === shown) clearToast();
  }, top.kind === 'max' ? 6000 : 3500);
};

const addEntries = (result, date = todayIso()) => {
  const session = ensureSession(date);
  const names = new Set();
  for (const item of result.exercises || []) {
    const name = findExerciseName(item.name) || titleCase(item.name);
    names.add(name);
    let exercise = session.exercises.find((existing) => existing.name === name);
    if (!exercise) {
      exercise = { name, sets: [] };
      session.exercises.push(exercise);
    }
    for (const set of item.sets) exercise.sets.push({ kg: String(set.kg), reps: Number(set.reps) > 0 ? String(set.reps) : '', ...(set.rpe ? { rpe: Number(set.rpe) } : {}), ...(set.warmup ? { warmup: true } : {}), edited: true });
    checkPr(name, date);
  }
  // "Change the cardio to 50" sets the day's cardio; "30 min cardio" adds to it. A note that says
  // "instead of", "change" or "not" also counts as a correction when the AI forgets to flag it.
  if (result.cardioMinutes) {
    const fixing = result.cardioTotal || (session.cardio && /\b(instead|change|changed|correct|should be|not \d+|was \d+)\b/i.test(`${result.transcript || ''} ${view.lastSaid || ''}`));
    const name = result.cardioName || 'Cardio';
    const parts = cardioParts(session);
    const same = parts.find((part) => part.name.toLowerCase() === name.toLowerCase());
    if (fixing && (same || parts.length <= 1)) {
      // A correction changes the activity it names (or the only one there is).
      if (same) same.minutes = Number(result.cardioMinutes);
      else parts.splice(0, parts.length, { name: result.cardioName || parts[0]?.name || 'Cardio', minutes: Number(result.cardioMinutes) });
    } else if (same) same.minutes += Number(result.cardioMinutes);
    else parts.push({ name, minutes: Number(result.cardioMinutes) });
    setCardioParts(session, parts);
  }
  view.open.add(date);
  save();
  return names;
};

const pickList = () => {
  const query = /\d/.test(view.draft) ? '' : view.draft.trim().toLowerCase();
  const recent = [];
  for (const session of sortedSessions()) {
    for (const exercise of session.exercises) if (!recent.includes(exercise.name)) recent.push(exercise.name);
  }
  const starters = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-up', 'Barbell Row'];
  const library = [...starters, ...LIBRARY.map((entry) => entry.name).filter((name) => !starters.includes(name))];
  const names = [...new Set([...BIG_THREE, ...recent, ...library])];
  // Lifts already logged today stay in the list too, so Bench Press is always one tap away.
  // Typed words match the start of any word in the name or a short name ("incline db" finds Incline Dumbbell Press);
  // names that start with what you typed come first, then the ones you've logged.
  const words = query.split(/\s+/).filter(Boolean);
  const aliasOf = (name) => LIBRARY.find((entry) => entry.name === name)?.aliases || [];
  const fits = (name) => [name.toLowerCase(), ...aliasOf(name)].some((label) => {
    const parts = label.split(/[\s-]+/);
    return words.every((word) => parts.some((part) => part.startsWith(word))) || label.includes(query);
  });
  const rank = (name) => (name.toLowerCase().startsWith(query) ? 0 : 1) * 2 + (recent.includes(name) ? 0 : 1);
  const matches = query ? names.filter(fits).sort((first, second) => rank(first) - rank(second)) : names;
  // Quick add shows the 12 you most likely want; the rest sit below a divider (morePicks).
  return query ? matches : matches.slice(0, 12);
};
const morePicks = () => {
  if (/\S/.test(view.draft)) return [];
  const shown = new Set(pickList());
  const logged = sortedSessions().flatMap((session) => session.exercises.map((exercise) => exercise.name));
  return [...new Set([...logged, ...LIBRARY.map((entry) => entry.name)])].filter((name) => !shown.has(name));
};

const renderBars = (pieces) => pieces.map((piece) => `
  <div>
    <div class="barTop"><span class="barLabel">${piece.name}</span></div>
    <div class="track"><div class="fill" style="width:${Math.min(100, Math.round((piece.done / piece.target) * 100))}%"></div></div>
  </div>`).join('');

const BIG_THREE = ['Bench Press', 'Squat', 'Deadlift'];
const BIG_LIFTS = ['Bench Press', 'Pause Bench Press', 'Close-Grip Bench Press', 'Squat', 'Front Squat', 'Pause Squat', 'Deadlift', 'Sumo Deadlift'];

const topSets = (session) => session.exercises
  .map((exercise) => ({
    name: exercise.name,
    set: validSets(exercise).filter((set) => !set.warmup).reduce((winner, set) => (!winner || Number(set.kg) > Number(winner.kg) || (Number(set.kg) === Number(winner.kg) && Number(set.reps) > Number(winner.reps)) ? set : winner), null)
  }))
  .filter((item) => item.set)
  .sort((first, second) => Number(BIG_LIFTS.includes(second.name)) - Number(BIG_LIFTS.includes(first.name)) || Number(second.set.kg) - Number(first.set.kg));

const e1rmCell = (value) => (value ? `<span class="e1rm">${Math.round(value)}</span>` : '');
const COLUMN_HEAD = '<span class="colHead">e1RM</span>';
const sameSet = (first, second) => first.kg !== '' && first.reps !== '' && ['kg', 'reps', 'rpe'].every((key) => String(first[key] ?? '') === String(second[key] ?? '')) && Boolean(first.warmup) === Boolean(second.warmup);

const renderExercise = (session, exercise, exerciseIndex) => {
  const editing = view.editDay === session.date;
  const best = bestBefore(exercise.name, session.date) || bestOverall(exercise.name);
  // The % is of your heaviest real single (not an estimate, RPE ignored): 290 × 1 against a 300 single is 97%,
  // 290 × 3 counts as 307 (Brzycki), so 102%. Lifts never done for a single fall back to your best estimate.
  const single = singleBefore(exercise.name, session.date) || singleBefore(exercise.name, '9999-12-31');
  const actualMax = single > 0 ? bodyLoad(exercise.name, single) : 0;
  const ofMax = (set) => (set.kg === '' || !(Number(set.reps) > 0) ? 0 : actualMax ? estimate(bodyLoad(exercise.name, set.kg), Number(set.reps)) / actualMax : best ? setValue(exercise.name, set) / best : 0);
  const groups = [];
  exercise.sets.forEach((set, index) => {
    const last = groups.at(-1);
    if (last && !editing && sameSet(exercise.sets[last.start], set)) last.count += 1;
    else groups.push({ start: index, count: 1 });
  });
  const rows = groups.map(({ start, count }, groupIndex) => {
    const set = exercise.sets[start];
    const lastRow = groupIndex === groups.length - 1;
    const value = set.kg !== '' && set.reps !== '' && Number(set.reps) > 0 ? estimate(bodyLoad(exercise.name, set.kg), Number(set.reps) + repsInTank(set)) : 0;
    const pr = prKind(exercise.name, session.date, set);
    // Only repeated sets carry a count ("3×"); a single set has none, so a lone number never reads as a count.
    const numbers = count > 1 ? `${count}×` : '';
    const label = `${esc(exercise.name)}, ${count > 1 ? `sets ${start + 1} to ${start + count}` : `set ${start + 1}`}`;
    const where = `data-date="${session.date}" data-exercise="${exerciseIndex}" data-set="${start}" data-count="${count}"`;
    return `<div class="swipe setSwipe"><button class="swipeDel" tabindex="-1" data-action="delete-set" ${where} aria-label="Delete ${label}">Delete</button><div class="setRow swipeFace">
      ${editing ? `<button class="minus" data-action="delete-set" ${where} aria-label="Delete ${label}"></button>` : `<span class="setNo num">${numbers}</span>`}
      <input class="pill num" inputmode="decimal" aria-label="${label}, kilograms" value="${esc(set.kg)}" placeholder="kg" ${where} data-field="kg">
      <span class="unit">${isBodyweightLift(exercise.name) ? '+kg' : 'kg'}</span><span class="unit" aria-hidden="true" style="text-align:center">×</span>
      <input class="pill num" inputmode="numeric" aria-label="${label}, reps" value="${!Number(set.reps) ? '' : esc(set.reps)}" placeholder="${!Number(set.reps) && set.kg !== '' ? '?' : 'reps'}" ${where} data-field="reps">
      ${editing ? `<input class="pill num rpe" inputmode="decimal" aria-label="${label}, RPE" value="${esc(set.rpe ?? '')}" placeholder="@" ${where} data-field="rpe">` : `<span class="rpeTag num"><span class="rpeText">${set.warmup ? 'W' : set.rpe ? `@${set.rpe}` : ''}</span>${lastRow ? `<button class="rowPlus" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Add a ${esc(exercise.name)} set">${ICONS.plusThin}</button>` : ''}</span>`}
      <span class="pct num">${pr ? `<span class="prPill${pr === 'est' ? ' est' : ''}">PR</span>` : ''}<span class="setPct">${ofMax(set) ? `${Math.round(ofMax(set) * 100)}%` : ''}</span>${e1rmCell(value)}</span>
      <button class="rowX" data-action="delete-set" ${where} aria-label="Delete ${label}">×</button>
    </div></div>`;
  }).join('');
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.names.has(exercise.name);
  return `<div class="exercise${landing ? ' landing' : ''}${glowing(session.date, exercise.name) ? ' glow' : ''}">
    <div class="swipe"><button class="swipeDel" tabindex="-1" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">Delete</button> <div class="exHead swipeFace">${editing ? `<button class="minus" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}"></button>` : ''}<button class="exName" data-action="open-trend" data-name="${esc(exercise.name)}"><span class="exNameText">${esc(exercise.name)}</span>${ICONS.chevRight}</button>${exerciseIndex === 0 ? COLUMN_HEAD : ''}<button class="rowX" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">×</button></div></div>
    ${rows}
    ${editing ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}">Add set</button>` : ''}
  </div>`;
};

// One word while the AI works, whether it is a set, a whole workout or an edit.
// A note on its way: set-shaped rows that build up with a soft shimmer right where the workout will land, and a quiet
// line that it lands by itself, so nobody has to sit and watch it.
// While the AI writes: the Exodia hand breathing softly inside a clay line that runs round it, growing and shrinking.
const exoSpin = '<span class="exoSpin" aria-hidden="true"><svg viewBox="0 0 28 28"><circle class="exoTrack" cx="14" cy="14" r="12.5"/><circle class="exoSnake" cx="14" cy="14" r="12.5" pathLength="100"/></svg><img src="/logo.png" alt="" draggable="false"></span>';
// What Exodia says while it thinks: short lines of its own and Marcus Aurelius (Meditations, George Long's public-domain
// translation), shuffled per visit so it starts somewhere new, fading to the next every few seconds.
const THINKING = ['Pondering…', 'Weighing it up…', 'Counting the plates…', 'Reading between the reps…', 'Writing it down…', 'Checking the numbers…', 'Finding the right day…', 'Thinking it through…', 'Chalking up…', 'Loading the bar…', 'Lining up the sets…', 'Doing the maths…', 'Checking the form…', 'Racking it…'];
const WISDOM = [
  ['The universe is change; our life is what our thoughts make it.', 'Marcus Aurelius'],
  ['No longer talk about the kind of man a good man ought to be, but be such.', 'Marcus Aurelius'],
  ['Look within. Within is the fountain of good.', 'Marcus Aurelius'],
  ['Very little indeed is necessary for living a happy life.', 'Marcus Aurelius'],
  ['Before you start wishing for more, appreciate what you have and imagine life without it.', 'Marcus Aurelius'],
  ['When you arise in the morning, think of what a precious privilege it is to be alive: to breathe, to think, to enjoy, to love.', 'Marcus Aurelius'],
  ['To grow, you must be willing to look foolish and not care what others think.', 'Epictetus'],
  ['Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.', 'Marianne Williamson'],
  ['Den mätta dagen, den är aldrig störst. Den bästa dagen är en dag av törst. Nog finns det mål och mening i vår färd, men det är vägen, som är mödan värd.', 'Karin Boye'],
  ['Den som är väldigt stark måste också vara väldigt snäll.', 'Bamse'],
  ['If it is not right, do not do it; if it is not true, do not say it.', 'Marcus Aurelius'],
  ['Do every act of thy life as if it were the last.', 'Marcus Aurelius'],
  ['Loss is nothing else than change.', 'Marcus Aurelius'],
  ['The soul becomes dyed with the colour of its thoughts.', 'Marcus Aurelius'],
  ['Confine thyself to the present.', 'Marcus Aurelius'],
  ['No great thing is created suddenly.', 'Epictetus'],
  ['Difficulties strengthen the mind, as labour does the body.', 'Seneca'],
  // From Marcus's own training program (Resurrection 3), the lines he put above his weeks.
  ['We choose to go to the Moon… not because they are easy, but because they are hard.', 'John F. Kennedy'],
  ['With the courage to begin and the discipline to endure, victory becomes a matter of time.', ''],
  ['It is not death that a man should fear, but he should fear never beginning to live.', 'Marcus Aurelius'],
  ['They didn’t believe in us. God did.', 'DJ Khaled'],
  ['What we do in life echoes in eternity.', 'Maximus, Gladiator'],
  ['How big would you dream if you knew you couldn’t fail?', ''],
  ['We suffer more often in imagination than in reality.', 'Seneca'],
  ['Luck is what happens when preparation meets opportunity.', 'Seneca'],
  ['He who is brave is free.', 'Seneca'],
  ['You have power over your mind, not outside events. Realise this, and you will find strength.', 'Marcus Aurelius'],
  ['Waste no more time arguing what a good man should be. Be one.', 'Marcus Aurelius'],
  ['First say to yourself what you would be; and then do what you have to do.', 'Epictetus'],
  ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
  ['We are what we repeatedly do.', 'Will Durant, on Aristotle'],
  ['The journey of a thousand miles begins with one step.', 'Lao Tzu'],
  ['Knowing others is intelligence; knowing yourself is true wisdom.', 'Lao Tzu'],
  ['Well done is better than well said.', 'Benjamin Franklin'],
  ['Energy and persistence conquer all things.', 'Benjamin Franklin'],
  ['It always seems impossible until it’s done.', 'Nelson Mandela'],
  ['Strength does not come from winning. Your struggles develop your strengths.', 'Arnold Schwarzenegger'],
  ['The last three or four reps is what makes the muscle grow.', 'Arnold Schwarzenegger'],
  ['Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.', 'Ronnie Coleman'],
  ['Hard work beats talent when talent doesn’t work hard.', 'Tim Notke'],
  ['Discipline is choosing between what you want now and what you want most.', ''],
  ['Small daily improvements are the key to staggering long-term results.', ''],
  ['The best time to plant a tree was 20 years ago. The second best time is now.', ''],
  ['Chop your own wood and it will warm you twice.', 'Henry Ford']
];
// Short true things about Exodia, every third line, so a wait teaches something. Each is checked against the app.
const TIPS = [
  'Say 3 sets and Exodia adds three.',
  'Hold a day to edit it.',
  'Paused and close-grip sets count for your bench too.',
  'Type /feedback to tell Marcus anything.',
  'Tap a lift’s name to open its chart in Trends.',
  'Import a Strong, Hevy or StrengthLog export from Add your data.',
  'Hit push, pull, legs, arms and move in 10 days for Exodia.',
  'Say “last Friday” and it lands on that day.',
  'Say “at 8” after a set and it keeps the RPE.',
  'Heavy means a top set at least 80% of your best.',
  'Any language works. Lifts are saved in English.',
  'Type /help to see what Exodia understands.',
  'Paste a whole week of notes at once. Each day lands on its own date.',
  'Mark warm-ups and they stay out of your bests.',
  'Typing help, feedback or / shows the commands.',
  'Type /note and a few words, or tap the pencil on a day, to add a note.',
  'Est. 1RM uses Brzycki up to 10 reps, Epley above.',
  'The bar under a lift compares your last 10 weeks with your best.',
  'Add your bodyweight in Trends to see your strength level.',
  'Tap a point on a chart to see that day’s top set.',
  'Your log syncs to every device on your link.',
  'Download a backup of everything in Settings.'
].map((tip) => ({ tip }));
const shuffled = (list) => list.map((item) => [Math.random(), item]).sort((first, second) => first[0] - second[0]).map(([, item]) => item);
// In threes: one of its own lines, a tip, a quote.
const THINK_ORDER = (() => {
  const lines = shuffled(THINKING);
  const tips = shuffled(TIPS);
  const quotes = shuffled(WISDOM);
  return tips.flatMap((tip, index) => [lines[index % lines.length], tip, quotes[index % quotes.length]]);
})();
// Every time Exodia starts thinking it opens on one of its own lines ("Pondering…") and holds it a full beat before
// the first tip, instead of picking up wherever the last message left off.
let thinkStep = 0;
let thinkIdle = true;
let thinkSince = 0;
// A short line stays 1.6 s, so even a quick answer gets to its tip; a tip or quote stays long enough to read it
// calmly (5.5–9 s by its length).
const thinkBeat = () => {
  const line = THINK_ORDER[thinkStep % THINK_ORDER.length];
  return typeof line === 'string' ? 1600 : Math.min(9000, Math.max(5500, 2500 + (line.tip || line[0]).length * 55));
};
// sub: the small line under a progress note ("Reading the file…") skips the own lines, which would only repeat it.
const thinkText = (sub = false) => {
  if (thinkIdle) {
    thinkIdle = false;
    thinkStep = Math.ceil(thinkStep / 3) * 3;
    thinkSince = Date.now();
  }
  let line = THINK_ORDER[thinkStep % THINK_ORDER.length];
  if (sub && typeof line === 'string') line = THINK_ORDER[(thinkStep + 1) % THINK_ORDER.length];
  if (typeof line === 'string') return esc(line);
  if (line.tip) return hintHtml(line.tip);
  return `“${esc(line[0])}”${line[1] ? ` <span class="thinkWho">${esc(line[1])}</span>` : ''}`;
};
// One look from the first moment: the hand and its clay line, with what's happening ("Reading the file…") while there
// is something to say and a tip under it, then the thinking lines, in the same place, so nothing swaps style halfway.
const writingLine = (progress = '') => `<span class="ghostHead">${exoSpin}${progress ? `<span class="ghostStack"><span class="ghostText">${esc(progress)}</span><span class="ghostText thinkLine thinkSub">${thinkText(true)}</span></span>` : `<span class="ghostText thinkLine">${thinkText()}</span>`}</span>`;
// While anything is being written, move every thinking line on together, with a soft fade between.
setInterval(() => {
  const shown = [...document.querySelectorAll('.thinkLine')];
  if (!shown.length) {
    thinkIdle = true;
    return;
  }
  if (Date.now() - thinkSince < thinkBeat()) return;
  thinkSince = Date.now();
  thinkStep += 1;
  shown.forEach((line) => {
    const next = thinkText(line.classList.contains('thinkSub'));
    if (line.dataset.said === next) return;
    line.dataset.said = next;
    line.classList.add('swap');
    setTimeout(() => {
      line.innerHTML = next;
      line.classList.remove('swap');
    }, 220);
  });
}, 250);
// How many rows to show while a note is read: "3x5" or "3 sets" is 3, "100x5" one set each, a line per set otherwise.
const guessSets = (text) => {
  const words = String(text || '');
  let count = 0;
  for (const match of words.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:x|×|by)\s*(\d+)/gi)) count += Number(match[1]) <= 10 && !/[.,]/.test(match[1]) ? Number(match[1]) : 1;
  for (const match of words.matchAll(/(\d+)\s*(?:sets?|set of|rounds?)\b/gi)) count += Number(match[1]);
  if (!count) count = words.split(/\n|,|;|\bthen\b/i).filter((part) => /\d/.test(part)).length;
  return Math.max(1, Math.min(6, count || 2));
};
const saidQuote = (item) => (item.text && item.text !== 'Voice note' ? `<span class="ghostSaid">“${esc(item.text.length > 160 ? `${item.text.slice(0, 157)}…` : item.text)}”</span>` : '');
const renderPending = (item = {}) => `<div class="ghost${item.later ? ' later' : ''}" role="status">${saidQuote(item)}${item.later ? '<span class="ghostText">Exodia is on it in the background · lands by itself</span>' : writingLine(item.progress || '')}${item.later ? '' : `<span class="ghostRows" aria-hidden="true"><span class="ghostName" style="--at:0ms"><i></i></span>${Array.from({ length: guessSets(item.text) }, (_, index) => index + 1).map((row) => `<span class="ghostRow setRow" style="--at:${Math.min(row, 4) * 200}ms"><i></i><b class="roll tickKg num" data-max="${row % 2 ? 140 : 100}">0</b><span class="tickX">×</span><b class="roll tickReps num" data-max="${row % 2 ? 8 : 12}">0</b><b class="roll tickE1 num" data-max="${row % 2 ? 180 : 130}">0</b></span>`).join('')}</span><span class="ghostHint">It lands by itself. Keep logging, or look at <a href="#/trends">Trends</a>.</span>`}</div>`;
// What is on its way to a day: being read right now, or waiting in the background for the AI.
// While a note is read, the waiting rows' kg, reps and e1RM count up fast and accelerating, over and over, in the
// real columns; the real row replaces them the moment the answer lands.
setInterval(() => {
  if (reducedMotion.matches) return;
  for (const tick of document.querySelectorAll('.ghostRow .roll')) {
    const max = Number(tick.dataset.max) || 100;
    let value = tick.dataset.v === undefined ? Math.random() * max * 0.6 : Number(tick.dataset.v);
    value = value >= max ? 0 : Math.min(max, value + Math.max(1, value * 0.16));
    tick.dataset.v = value;
    tick.textContent = Math.round(value);
  }
}, 55);
const inFlight = () => [...view.pending, ...laterJobs().map((job) => ({ date: job.date, known: job.known, text: job.heard || job.said, later: true }))];

const accessoriesOf = (session) => session.accessories ?? (session.exercises.length ? 30 : 0);

const glowFor = (items) => {
  view.glow = new Map();
  for (const { date, name } of items) {
    if (!view.glow.has(date)) view.glow.set(date, new Set());
    view.glow.get(date).add(name || '*');
  }
  clearTimeout(view.glowTimer);
  view.glowTimer = setTimeout(() => {
    view.glow = null;
    for (const element of document.querySelectorAll('.glow')) element.classList.remove('glow');
  }, 2800);
};
const glowing = (date, name) => {
  const names = view.glow?.get(date);
  return Boolean(names && (!name || names.has('*') || names.has(name)));
};

const KINDS = { legs: 'Leg day', pull: 'Pull day', push: 'Push day', arms: 'Arm day' };
// What the cardio was (Football, Cycling), or plain Cardio when nobody said.
const cardioLabel = (session) => session.cardioName || 'Cardio';
// Each cardio you name keeps its own row (Bike 20 minutes, Football 1 hour) while session.cardio stays the day's
// total, which is what the Move goal counts. Days from before parts existed, or whose total changed somewhere else,
// are read back into parts that add up to the total.
const cardioParts = (session) => {
  const total = Number(session.cardio) || 0;
  if (!total) return [];
  const parts = (session.cardioParts || []).filter((part) => Number(part.minutes) > 0).map((part) => ({ name: String(part.name || 'Cardio'), minutes: Number(part.minutes) }));
  const sum = parts.reduce((all, part) => all + part.minutes, 0);
  if (!parts.length || sum > total) return [{ name: cardioLabel(session), minutes: total }];
  if (sum < total) parts.push({ name: parts.length ? 'Cardio' : cardioLabel(session), minutes: total - sum });
  return parts;
};
const setCardioParts = (session, parts) => {
  const kept = parts.filter((part) => Number(part.minutes) > 0).map((part) => ({ name: part.name || 'Cardio', minutes: Math.round(Number(part.minutes)) }));
  session.cardio = kept.reduce((all, part) => all + part.minutes, 0);
  if (kept.length > 1) session.cardioParts = kept;
  else delete session.cardioParts;
  if (kept[0] && kept[0].name !== 'Cardio') session.cardioName = kept[0].name;
  else delete session.cardioName;
};
const dayKind = (session) => {
  if (session.label) return session.label[0].toUpperCase() + session.label.slice(1);
  const pieces = [...new Set(session.exercises.filter((exercise) => validSets(exercise).length).map((exercise) => libraryEntry(exercise.name)?.piece).filter(Boolean))];
  if (pieces.length === 1) return KINDS[pieces[0]];
  if (pieces.length > 1) return pieces.slice(0, 2).map((piece) => piece[0].toUpperCase() + piece.slice(1)).join(' + ');
  return session.cardio ? cardioLabel(session) : '';
};

const dayPrKind = (session, name) => {
  const kinds = session.exercises.filter((exercise) => exercise.name === name).flatMap((exercise) => exercise.sets.map((set) => prKind(name, session.date, set)));
  return kinds.includes('max') ? 'max' : kinds.includes('est') ? 'est' : null;
};
const hasPr = (session, name) => Boolean(dayPrKind(session, name));

const dayRow = (lift, pr, kg, reps, e1rm) => `<span class="dayRow"><span class="dayLift">${esc(lift)}</span><span class="dayPr">${pr ? `<span class="prPill${pr === 'est' ? ' est' : ''}">PR</span>` : ''}</span><span class="dayKg">${kg}</span><span class="dayX">${kg && reps !== 'min' ? '×' : ''}</span><span class="dayReps">${reps}</span><span class="dayE1rm">${e1rm}</span></span>`;

const daySummary = (session) => {
  const [first, ...rest] = topSets(session);
  const second = rest.find(({ name }) => hasPr(session, name)) || rest[0];
  const others = [
    ...rest.filter((item) => item !== second).map(({ name }) => name),
    ...cardioParts(session).map((part) => `${part.name} ${humanMinutes(part.minutes)}`),
    ...(accessoriesOf(session) ? [`Accessories ${humanMinutes(accessoriesOf(session))}`] : [])
  ];
  const row = ({ name, set }) => {
    return dayRow(name, dayPrKind(session, name), isBodyweightLift(name) ? (Number(set.kg) > 0 ? `+${set.kg}` : 'BW') : set.kg, set.reps, e1rmCell(estimate(bodyLoad(name, set.kg), Number(set.reps) + repsInTank(set))));
  };
  // A cardio-only day already says what and how long in its header ("Football · 90 min").
  if (!first) return session.cardio ? '' : dayRow('Nothing logged yet', false, '', '', '');
  return `${row(first)}${second ? row(second) : ''}${others.length ? `<span class="dayOthers">+ ${esc(others.join(', '))}</span>` : ''}`;
};

// Days you hit Exodia get the small blue Exodia hand after the date, the same blue as in the Trends calendar.
let exodiaDayCache = { from: null, set: new Set() };
const exodiaDaySet = () => {
  const history = exodiaHistory();
  if (exodiaDayCache.from !== history) exodiaDayCache = { from: history, set: new Set(history.days || []) };
  return exodiaDayCache.set;
};
// A session's note: one quiet line that opens to the whole note when tapped. Editing the day (the pencil) makes it a
// text box; leaving it empty removes the note.
const dayNote = (session, editing) => {
  if (!session.note) return '';
  const open = view.noteOpen === session.date;
  return `<button class="dayNote${open ? ' open' : ''}" data-action="toggle-note" data-date="${session.date}" aria-expanded="${open}"><span class="dayNoteLabel">Note</span><span class="dayNoteText">${esc(session.note)}</span></button>`;
};
// An opened day says where you trained and for how long, when your gym app or Google Maps knows:
// "Gymmet Stockholm · in at 08:32 · 1 hour and 53 minutes".
const dayVisit = (date) => {
  const visit = visitOf(date);
  if (!visit) return '';
  const parts = [visit.place !== 'Gym' ? visit.place : '', visit.time ? `in at ${visit.time}` : '', visit.minutes ? humanMinutes(visit.minutes) : ''].filter(Boolean);
  return parts.length ? `<p class="dayVisit">${esc(parts.join(' · '))}</p>` : '';
};
const renderSession = (session) => {
  const pendings = inFlight().filter((pending) => pending.date === session.date && pending.known !== false);
  const open = view.open.has(session.date) || pendings.length > 0;
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.isNew;
  const editing = view.editDay === session.date;
  // Done pulses warm once something on the day was changed, so the way out is easy to see.
  if (editing && view.editStart?.date !== session.date) view.editStart = { date: session.date, json: JSON.stringify(session) };
  if (!editing && view.editStart?.date === session.date) view.editStart = null;
  const changed = editing && view.editStart.json !== JSON.stringify(session);
  return `<section class="card session${open ? ' open' : ''}${editing ? ' editing' : ''}${landing ? ' landing' : ''}${view.opening === session.date ? ' opening' : ''}${!open && glowing(session.date) ? ' glow' : ''}" id="session-${session.date}">
    <div class="headRow">
      ${editing ? `<div class="head">
        <span class="headName dayDate">${dayLabel(session.date)}${exodiaDaySet().has(session.date) ? '<img class="dayHand" src="/logo-blue.png" alt="Exodia hit" title="You hit Exodia this day" draggable="false">' : ''}</span>
        <label class="sr" for="label-${session.date}">Name this day</label><input id="label-${session.date}" class="dayKindInput" placeholder="${esc(dayKind(session) || 'Name this day')}" value="${esc(session.label || '')}" data-day-label="${session.date}" autocomplete="off">
        <span class="meta num">${tonnes(sessionVolume(session))}</span>
      </div>` : `<button class="head" data-action="toggle-session" data-date="${session.date}" aria-expanded="${open}">
        <span class="headName dayDate">${dayLabel(session.date)}${exodiaDaySet().has(session.date) ? '<img class="dayHand" src="/logo-blue.png" alt="Exodia hit" title="You hit Exodia this day" draggable="false">' : ''}</span>
        <span class="dayKind">${esc(dayKind(session))}</span>
        <span class="meta num">${!sessionSets(session) && session.cardio ? humanMinutes(session.cardio) : open ? tonnes(sessionVolume(session)) : `${tonnes(sessionVolume(session))} · ${setCount(sessionSets(session))}`}</span>
      </button>`}
      ${open ? `<button class="editBtn${editing ? ' done' : ''}${changed ? ' changed' : ''}" data-action="edit-day" data-date="${session.date}"${editing ? '' : ` aria-label="Edit ${dayLabel(session.date)}" title="Edit"`}>${editing ? 'Done' : ICONS.pencil}</button>` : ''}
      <button class="chevBtn" data-action="toggle-session" data-date="${session.date}" aria-label="${open ? 'Collapse' : 'Expand'} ${dayLabel(session.date)}">${ICONS.chev}</button>
    </div>
    ${open && !editing ? dayVisit(session.date) : ''}
    ${open && editing && view.menuEnter ? '<span class="editHint" aria-hidden="true"></span>' : ''}${open && editing ? `<div class="dayMenu${view.menuEnter ? ' enter' : ''}">
      <p class="dayMenuLabel">Move to</p>
      <div class="days scroll moveDays">${Array.from({ length: 21 }, (unused, index) => addDays(todayIso(), index - 20)).filter((iso) => iso !== session.date).map((iso) => `<button class="chip" data-action="move-day" data-date="${session.date}" data-to="${iso}"><span class="chipFace">${dayLabel(iso)}</span></button>`).join('')}<label class="chip pickDate"><span class="chipFace">${ICONS.calendar || ''}Pick a date</span><input type="date" max="${todayIso()}" value="${session.date}" data-move-from="${session.date}" aria-label="Move ${dayLabel(session.date)} to a date"></label></div>
    </div>` : ''}
    ${open ? `
      ${session.exercises.map((exercise, index) => renderExercise(session, exercise, index)).join('')}
      ${pendings.map(renderPending).join('')}
      ${cardioParts(session).map((part, index) => `<div class="swipe"><button class="swipeDel" tabindex="-1" data-action="remove-cardio" data-date="${session.date}" data-index="${index}" aria-label="Delete ${esc(part.name)}">Delete</button><div class="cardio swipeFace">${editing ? `<button class="minus" data-action="remove-cardio" data-date="${session.date}" data-index="${index}" aria-label="Delete ${esc(part.name)}"></button>` : ''}<span>${esc(part.name)}</span>${editing ? `<span class="cardioEdit"><input class="pill num cardioMin" inputmode="numeric" value="${part.minutes}" placeholder="min" data-cardio-date="${session.date}" data-index="${index}" aria-label="${esc(part.name)} minutes"><span class="unit">min</span></span>` : `<button class="meta num cardioTime" data-action="edit-day" data-date="${session.date}" aria-label="Change ${esc(part.name)} time">${humanMinutes(part.minutes)}</button>`}<button class="rowX" data-action="remove-cardio" data-date="${session.date}" data-index="${index}" aria-label="Delete ${esc(part.name)}">×</button></div></div>`).join('')}
      ${dayNote(session, editing)}
      <div class="dayActions">
        <span class="dayAdd">${session.exercises.length && !editing ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${session.exercises.length - 1}">+ Set</button>` : ''}<button class="textBtn" data-action="open-composer" data-date="${session.date}">+ Exercise</button>${editing ? `<button class="textBtn" data-action="add-note" data-date="${session.date}">+ Note</button>` : ''}</span>
        <span class="dayAccLabel">Accessories</span>${[[10, '10 min'], [30, '30 min'], [60, '1 hour']].map(([minutes, label]) => `<button class="chip" data-action="accessories" data-date="${session.date}" data-minutes="${minutes}" aria-pressed="${accessoriesOf(session) === minutes}" aria-label="Accessories ${label}"><span class="chipFace">${label}</span></button>`).join('')}
      </div>
      ${editing ? `<button class="textBtn logDay" data-action="log-day" data-date="${session.date}">Open in Log</button>` : ''}
      ${editing ? `<button class="deleteDay" data-action="delete-day" data-date="${session.date}">Delete this whole day</button>` : ''}` : `<div class="daySummary num" data-action="toggle-session" data-date="${session.date}">${daySummary(session)}${session.note ? '<span class="dayNoteMark">Note</span>' : ''}</div>`}
  </section>`;
};

const listWithGhosts = (sessions) => {
  const known = inFlight().filter((pending) => pending.known !== false);
  const ghostDates = [...new Set(known.map((pending) => pending.date))].filter((date) => !sessions.some((session) => session.date === date));
  const ghosts = ghostDates.map((date) => ({ date, html: `<section class="card session open landing" id="session-${date}"><div class="head"><span class="headName">${dayLabel(date)}</span></div>${known.filter((pending) => pending.date === date).map(renderPending).join('')}</section>` }));
  const unsure = inFlight().filter((pending) => pending.known === false);
  return (unsure.length ? `<section class="card session open landing incoming" id="session-incoming">${unsure.map(renderPending).join('')}</section>` : '') + [...sessions.map((session) => ({ date: session.date, html: renderSession(session) })), ...ghosts]
    .sort((first, second) => second.date.localeCompare(first.date))
    .map((item) => item.html)
    .join('');
};

const quickStart = () => `<p class="empty">Tap a lift to log it, or say or type what you did in the box below.</p>${quickAdd()}`;

const fullExodia = () => exodiaActive();
const exodiaHit = () => Boolean(view.devHit) || fullExodia();

// Exodia assembles like the card: each bar (Push, Pull, Legs, Arms, Move) flies up to become a finger,
// the counter becomes the eye. Entries are [clip of the piece, its centre x %, centre y %].
const HAND = [
  ['0 0, 24% 0, 24% 46%, 27% 64%, 0 64%', 13, 50],
  ['24% 0, 42% 0, 42% 46%, 24% 46%', 33, 24],
  ['42% 0, 59% 0, 59% 46%, 42% 46%', 50, 22],
  ['59% 0, 77% 0, 77% 46%, 59% 46%', 68, 24],
  ['77% 0, 100% 0, 100% 64%, 73% 64%, 77% 46%', 87, 50],
];
const EXODIA_TIMES = { impact: 1750, fly: 2250, done: 2800 };
const preloadHands = () => ['/hamsa-512.png', '/hamsa-512-blue.png', ...['palm', 'thumb-left', 'index', 'middle', 'ring', 'thumb-right'].flatMap((name) => [`/fist/${name}-line.png`, `/fist/${name}-fill.png`])].forEach((src) => { new Image().src = src; });
const centre = (el) => {
  const box = el?.getBoundingClientRect();
  return box && box.width ? { x: box.left + box.width / 2, y: box.top + box.height / 2, w: box.width } : null;
};

const celebrate = () => {
  view.celebrating = 'orange';
  if (reducedMotion.matches) {
    view.celebrating = false;
    return;
  }
  requestAnimationFrame(() => (view.exodiaStyle === 'bars' ? playExodia() : playFist()));
};
// The hand starts as a fist, opens one finger per piece (slow, then faster), then the eye opens.
// Fingers slide out of the palm whole, never squashed; peach rims close the fist's cut edges until they do.
const FIST_LABELS = ['Push', 'Pull', 'Legs', 'Arms', 'Move'];
// Push and Pull open slowly, Legs and Arms speed up, Move lands slow: start of each finger and how long it takes.
const FIST_OPEN = [500, 1350, 2000, 2420, 2900];
const FIST_DURATION = [700, 620, 440, 420, 780];
const FIST_TIMES = { eye: 3600, impact: 4120, fly: 4750, done: 5350 };
// [window the piece shows through, folded offset x %, y %, rim style]
// The real logo cut into pieces, each as an outline layer and a fill layer (/fist/*.png). All outlines sit
// below all fills, so wherever pieces overlap the fills merge and no inner line shows; a moving piece always
// has its real outline. At rest the layers add up to the logo exactly, so the end only opens the eye.
// [piece, how it starts tucked into the palm].
const FIST = [
  ['thumb-left', 'translate(22%, 15%)'],
  ['index', 'translateY(27%)'],
  ['middle', 'translateY(31%)'],
  ['ring', 'translateY(27%)'],
  ['thumb-right', 'translate(-22%, 15%)'],
];
// Each side line runs up the palm's cut edge and curves into the first knuckle, so the closed fist has one clean outline.
const FIST_SIDES = ['M22.3 70.7 C21.6 67.38 22.01 56.64 22.8 49 C23.05 46.7 24.3 44.9 27.73 44.14', 'M77.7 70.7 C78.4 67.38 77.99 56.64 77.2 49 C76.95 46.7 75.7 44.9 72.27 44.14'];
// Wait until every piece is decoded (at most 600 ms) so nothing pops in or stutters on the first frames.
const decoded = (images) => Promise.race([Promise.all(images.map((image) => image.decode().catch(() => {}))), new Promise((done) => setTimeout(done, 600))]);

const playFist = async () => {
  const show = document.createElement('div');
  show.className = 'exodiaShow';
  show.setAttribute('aria-hidden', 'true');
  const layer = (name, kind, index) => `<img class="exLayer" ${index === undefined ? '' : `data-piece="${index}"`} src="/fist/${name}-${kind}.png" alt="" draggable="false">`;
  show.innerHTML = `<div class="exFly"><div class="exHand">
    ${FIST.map(([name], index) => layer(name, 'line', index)).join('')}${layer('palm', 'line')}
    ${layer(FIST[0][0], 'fill', 0)}${layer(FIST[4][0], 'fill', 4)}${layer('palm', 'fill')}
    ${FIST_SIDES.map((side) => `<svg class="exSides" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${side}"/></svg>`).join('')}
    ${[1, 2, 3].map((index) => layer(FIST[index][0], 'fill', index)).join('')}
    <i class="exLid"></i>
    <i class="exBlue"></i><i class="exFlash"></i><i class="exRing"></i><i class="exRing"></i>
  </div>
  <div class="exBars">${FIST_LABELS.map((label) => `<div><span>${label}<em>${label}</em></span><i><b></b></i></div>`).join('')}</div></div>`;
  await decoded([...show.querySelectorAll('img')]);
  document.body.append(show);
  const hand = show.querySelector('.exHand');
  hand.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', fill: 'backwards' });
  // The bars' card comes in with the first bar, so it never sits there empty.
  show.querySelector('.exBars').animate([{ opacity: 0, transform: 'translateX(-50%) translateY(8px)' }, { opacity: 1, transform: 'translateX(-50%)' }], { duration: 420, delay: FIST_OPEN[0] - 120, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' });
  const bars = show.querySelectorAll('.exBars > div');
  show.querySelectorAll('.exLayer[data-piece]').forEach((piece) => {
    const index = Number(piece.dataset.piece);
    // Fingers overshoot a touch; thumbs settle without it, so their outline meets the palm's without a step.
    const easing = index === 0 || index === 4 ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.3, 1.25, 0.45, 1)';
    piece.animate([{ transform: FIST[index][1] }, { transform: 'none' }], { duration: FIST_DURATION[index], delay: FIST_OPEN[index], easing, fill: 'backwards' });
  });
  // The palm's side line stays in front while a thumb slides out from behind it, then fades as the thumb arrives
  // (a finger covers most of its way in the first 45% of its time, then settles).
  show.querySelectorAll('.exSides').forEach((side, index) => {
    const piece = index === 0 ? 0 : 4;
    side.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35, easing: 'ease-in-out' }, { opacity: 0, offset: 0.7 }, { opacity: 0 }], { duration: FIST_DURATION[piece], delay: FIST_OPEN[piece], fill: 'both' });
  });
  bars.forEach((bar, index) => {
    bar.querySelector('b').animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: FIST_DURATION[index], delay: FIST_OPEN[index], easing: 'cubic-bezier(0.3, 0.8, 0.3, 1)', fill: 'both' });
    bar.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: FIST_OPEN[index] - 80, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' });
    const pulse = { duration: Math.max(560, FIST_DURATION[index]), delay: FIST_OPEN[index], easing: 'ease-out' };
    bar.querySelector('span').animate([{ transform: 'none' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'none' }], pulse);
    bar.querySelector('em').animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], pulse);
  });
  show.querySelector('.exLid').animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.9)' }], { duration: 480, delay: FIST_TIMES.eye, easing: 'ease-in-out', fill: 'both' });
  const timers = [];
  const finish = () => {
    timers.forEach(clearTimeout);
    show.remove();
    view.celebrating = false;
    view.reveal = true;
    render();
    document.querySelectorAll('.brand .logo, .sideBrand .logo').forEach((logo) => logo.classList.add('land'));
    if (view.devHit && !fullExodia()) setTimeout(() => {
      view.devHit = false;
      render();
    }, 8000);
  };
  show.addEventListener('click', finish);
  timers.push(setTimeout(() => {
    view.celebrating = 'blue';
    view.blue = true;
    document.querySelector('.exodiaCard')?.classList.add('hit');
    document.querySelectorAll('.logo').forEach((logo) => logo.classList.add('blue'));
    show.classList.add('impact');
    show.querySelector('.exFlash').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease-out' });
    show.querySelectorAll('.exRing').forEach((ring, index) => ring.animate([{ transform: 'scale(0.4)', opacity: 0.9 }, { transform: `scale(${3.2 + index})`, opacity: 0 }], { duration: 720, delay: index * 110, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' }));
  }, FIST_TIMES.impact));
  timers.push(setTimeout(() => {
    const logo = document.querySelector('.brand .logo, .sideBrand .logo');
    const fly = show.querySelector('.exFly');
    show.classList.add('leaving');
    if (!logo || turn) return;
    const start = fly.getBoundingClientRect();
    const end = logo.getBoundingClientRect();
    fly.animate([{ transform: 'none' }, { transform: `translate(${end.left + end.width / 2 - (start.left + start.width / 2)}px, ${end.top + end.height / 2 - (start.top + start.height / 2)}px) scale(${end.width / start.width})` }], { duration: FIST_TIMES.done - FIST_TIMES.fly, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' });
  }, FIST_TIMES.fly));
  timers.push(setTimeout(finish, FIST_TIMES.done));
};

const playExodia = () => {
  const sources = turn ? [] : [...document.querySelectorAll('.homePage .bars .track')].map(centre);
  const badge = turn ? null : centre(document.querySelector('.homePage .exodiaHits'));
  const show = document.createElement('div');
  show.className = 'exodiaShow';
  show.setAttribute('aria-hidden', 'true');
  show.innerHTML = `<div class="exFly"><div class="exHand">
    ${HAND.map(([clip, x, y]) => `<i class="exPiece" style="clip-path:polygon(${clip});transform-origin:${x}% ${y}%"></i>`).join('')}
    <i class="exPiece exPalm"></i><i class="exPiece exEye"></i><i class="exBlue"></i><i class="exRing"></i><i class="exRing"></i>
  </div></div>`;
  document.body.append(show);
  const hand = show.querySelector('.exHand');
  const box = hand.getBoundingClientRect();
  const at = (x, y) => ({ x: box.left + (box.width * x) / 100, y: box.top + (box.height * y) / 100 });
  const ease = 'cubic-bezier(0.45, 0, 0.2, 1)';
  show.querySelectorAll('.exPiece:not(.exPalm):not(.exEye)').forEach((piece, index) => {
    const [, x, y] = HAND[index];
    const to = at(x, y);
    const from = sources[index] || { x: to.x + (index - 2) * 70, y: box.bottom + 160 };
    const dx = from.x - to.x;
    const dy = from.y - to.y;
    piece.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 46}px) scale(1.06) rotate(${(index - 2) * 7}deg)`, offset: 0.62 },
      { transform: 'none', opacity: 1 },
    ], { duration: 720, delay: 120 + index * 110, easing: ease, fill: 'backwards' });
  });
  show.querySelector('.exPalm').animate([{ opacity: 0, transform: 'scale(0.82)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: 760, easing: ease, fill: 'backwards' });
  const eye = at(50, 66);
  const from = badge || { x: eye.x, y: box.top - 140, w: 24 };
  show.querySelector('.exEye').animate([
    { transform: `translate(${from.x - eye.x}px, ${from.y - eye.y}px) scale(${from.w / (box.width * 0.44)}) rotate(-120deg)`, opacity: 0 },
    { opacity: 1, offset: 0.15 },
    { transform: 'none', opacity: 1 },
  ], { duration: 560, delay: EXODIA_TIMES.impact - 560, easing: 'cubic-bezier(0.55, 0, 0.3, 1.15)', fill: 'backwards' });
  const timers = [];
  const finish = () => {
    timers.forEach(clearTimeout);
    show.remove();
    view.celebrating = false;
    view.reveal = true;
    render();
    document.querySelectorAll('.brand .logo, .sideBrand .logo').forEach((logo) => logo.classList.add('land'));
    if (view.devHit && !fullExodia()) setTimeout(() => {
      view.devHit = false;
      render();
    }, 8000);
  };
  show.addEventListener('click', finish);
  timers.push(setTimeout(() => {
    view.celebrating = 'blue';
    view.blue = true;
    document.querySelector('.exodiaCard')?.classList.add('hit');
    document.querySelectorAll('.logo').forEach((logo) => logo.classList.add('blue'));
    show.classList.add('impact');
    hand.animate([{ filter: 'brightness(2.6)' }, { filter: 'brightness(1)' }], { duration: 480, easing: 'ease-out' });
    show.querySelectorAll('.exRing').forEach((ring, index) => ring.animate([{ transform: 'scale(0.4)', opacity: 0.9 }, { transform: `scale(${3.2 + index})`, opacity: 0 }], { duration: 720, delay: index * 110, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' }));
  }, EXODIA_TIMES.impact));
  timers.push(setTimeout(() => {
    const logo = document.querySelector('.brand .logo, .sideBrand .logo');
    const fly = show.querySelector('.exFly');
    show.classList.add('leaving');
    if (!logo || turn) return;
    const start = fly.getBoundingClientRect();
    const end = logo.getBoundingClientRect();
    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);
    fly.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${end.width / start.width})` }], { duration: EXODIA_TIMES.done - EXODIA_TIMES.fly, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' });
  }, EXODIA_TIMES.fly));
  timers.push(setTimeout(finish, EXODIA_TIMES.done));
};

const enterSandbox = () => {
  view.sandbox = { state, sync: structuredClone(syncState) };
  state = { version: 1, deviceId: crypto.randomUUID(), sessions: [], bests: {} };
  lastSaved = localJson();
  lastMeta = metaJson();
  Object.assign(view, { devMenu: false, devHit: false, wasHit: undefined, onboard: null, toast: null, composer: false, draft: '', open: new Set([todayIso()]) });
  location.hash = '#/';
  render();
};
const exitSandbox = () => {
  state = view.sandbox.state;
  syncState = view.sandbox.sync;
  lastSaved = localJson();
  lastMeta = metaJson();
  Object.assign(view, { sandbox: null, devMenu: false, devHit: false, wasHit: undefined, onboard: null, toast: null, composer: false, draft: '' });
  location.hash = '#/';
  render();
};
const devExtras = () => `${view.devMenu ? `<button class="devScrim" data-action="close-dev" aria-label="Close"></button>
  <div class="devMenu" role="menu">
    <button role="menuitem" data-action="dev-exodia" data-style="fist">Play Exodia: fist opens</button>
    <button role="menuitem" data-action="dev-exodia" data-style="bars">Play Exodia: bars fly in</button>
    ${view.devHit ? '<button role="menuitem" data-action="dev-normal">Back to normal colors</button>' : ''}
    ${view.sandbox ? '<button role="menuitem" data-action="dev-exit">Leave test mode</button>' : '<button role="menuitem" data-action="dev-newuser">Simulate new user</button>'}
  </div>` : ''}${view.sandbox ? '<div class="testPill" role="status">Test mode · nothing is saved<button data-action="dev-exit">Exit</button></div>' : ''}`;

// Bottom right of the opened Exodia card, a thin ring like a usage meter: while you're blue it shows the days until
// the oldest piece leaves the 10 days (if nothing new is logged); before that it fills with the pieces you have.
const exodiaRing = (complete) => {
  const { left, runsOut } = exodiaHistory();
  const share = left ? left / EXODIA_DAYS : complete / 5;
  const label = left ? `${left} ${left === 1 ? 'day' : 'days'} left${runsOut ? `<br>${esc(runsOut)} runs out first` : ''}` : `${complete} of 5 in 10 days`;
  return `<div class="exoRingBox" title="${left ? `Blue until ${dayLabel(addDays(todayIso(), left - 1))} unless you train again` : 'Pieces in the last 10 days'}"><svg class="exoRing${left ? ' hit' : ''}" viewBox="0 0 36 36" aria-hidden="true"><circle class="exoRingTrack" cx="18" cy="18" r="15"/><circle class="exoRingArc" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="${(share * 100).toFixed(1)} 100" transform="rotate(-90 18 18)"/><text x="18" y="22.5" text-anchor="middle">${left || complete}</text></svg><span class="exoRingLabel">${label}</span></div>`;
};
// Home draws the newest 30 days (fast to open); "Show older sessions" adds 60 at a time, back to the first.
const HOME_PAGE = 30;
const renderHome = () => {
  const pieces = pieceProgress(todayIso());
  const complete = pieces.filter((piece) => piece.complete).length;
  const hits = exodiaHistory().hits + (view.devHit && complete < 5 ? 1 : 0) - (view.celebrating ? 1 : 0);
  const weekVolume = state.sessions.filter((session) => session.date >= addDays(todayIso(), -(EXODIA_DAYS - 1))).reduce((sum, session) => sum + sessionVolume(session), 0);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Late session?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const sessions = sortedSessions().filter((session) => session.exercises.length > 0 || session.cardio > 0);
  return `<main class="page homePage">
    <p class="eyebrow">${todayLine()}</p>
    <h1 class="title${view.reveal ? ' reveal' : ''}">${exodiaHit() && !view.celebrating ? `${esc(state.name || 'You')} hit Exodia` : state.name ? greeting.replace(/\??$/, (mark) => `, ${esc(state.name)}${mark}`) : greeting}</h1>
    <section class="card exodiaCard${view.exodiaOpen ? ' open' : ''}${view.reveal ? ' reveal' : ''}${view.blue ? ' hit' : ''}" style="margin-top:20px">
      <button class="head" data-action="toggle-exodia" aria-expanded="${view.exodiaOpen}">
        <span class="headName">Exodia</span>
        <span class="exodiaHits num" aria-label="Exodia hit ${hits} times">${hits}</span>
        <span class="meta num">${complete === 5 ? 'Complete' : complete + ' of 5'} · ${tonnes(weekVolume)}</span>
        ${ICONS.chev}
      </button>
      <button class="bars" data-action="toggle-exodia" tabindex="-1" aria-hidden="true">${renderBars(pieces)}</button>
      ${view.exodiaOpen ? `<div class="rules${view.rulesEnter ? ' enter' : ''}">${pieces.map((piece) => `<div class="rule"><span><b>${piece.name}</b> <span class="muted">· ${piece.rule}</span></span><span class="muted num">${piece.complete ? 'Done' : Math.min(piece.done, piece.target) + ' of ' + piece.target}</span></div>`).join('')}<div class="exoFoot"><p class="empty">Heavy means your top set is at least 80% of your best. Last 10 days, any program.</p>${exodiaRing(complete)}</div></div>` : ''}
    </section>
    <p class="section sessionsHead">Sessions${sessions[0] && !view.open.has(sessions[0].date) ? COLUMN_HEAD : ''}</p>
    <div class="list">${sessions.length || inFlight().length ? listWithGhosts(sessions.slice(0, view.homeCount || HOME_PAGE)) : quickStart()}</div>
    ${sessions.length > (view.homeCount || HOME_PAGE) ? `<button class="liftExpand homeMore" data-action="home-more">Show older sessions <span class="muted num">${sessions.length - (view.homeCount || HOME_PAGE)} more</span>${ICONS.chev}</button>` : ''}
  </main>`;
};

const smoothPath = (points) => {
  if (points.length < 2) return '';
  const slopes = points.slice(0, -1).map(([x, y], index) => (points[index + 1][1] - y) / (points[index + 1][0] - x));
  const tangents = points.map((point, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes.at(-1);
    if (slopes[index - 1] * slopes[index] <= 0) return 0;
    const tangent = (slopes[index - 1] + slopes[index]) / 4;
    const limit = 3 * Math.min(Math.abs(slopes[index - 1]), Math.abs(slopes[index]));
    return Math.sign(tangent) * Math.min(Math.abs(tangent), limit);
  });
  return points.slice(0, -1).reduce((path, [x, y], index) => {
    const [nextX, nextY] = points[index + 1];
    const third = (nextX - x) / 3;
    return `${path} C${x + third},${y + tangents[index] * third} ${nextX - third},${nextY - tangents[index + 1] * third} ${nextX},${nextY}`;
  }, `M${points[0][0]},${points[0][1]}`);
};

const niceStep = (span) => [5, 10, 20, 25, 50, 100].find((step) => span / step <= 4) || 200;

const monthlyBest = (points) => {
  const usable = points
    .map((point) => ({ ...point, sets: point.sets.filter((set) => Number(set.reps) <= 20) }))
    .filter((point) => point.sets.length);
  // Every session gets its own dot (the count in the lift list matches what you see); only a long history, too many
  // dots to tap, keeps the best of each month.
  if (usable.length <= 36) return usable;
  const months = new Map();
  for (const point of usable) {
    const key = point.date.slice(0, 7);
    const month = months.get(key) || { date: point.date, value: 0, sets: [], topKg: -1 };
    const top = Math.max(...point.sets.map((set) => Number(set.kg)));
    if (top > month.topKg) Object.assign(month, { date: point.date, topKg: top });
    month.value = Math.max(month.value, point.value);
    month.sets.push(...point.sets);
    months.set(key, month);
  }
  // The latest session always gets its own dot, so the most recent top set can be tapped.
  const latest = usable.at(-1);
  const kept = [...months.values()];
  if (kept.at(-1).date !== latest.date) {
    const month = kept.at(-1);
    if (month.date.slice(0, 7) === latest.date.slice(0, 7)) month.sets = month.sets.filter((set) => !latest.sets.includes(set));
    kept.push(latest);
  }
  return kept;
};

// A range with no sessions keeps the chart's frame (same height, faint grid in this lift's own kg range) with a
// calm line in the middle: when it was last done, and one tap to see all of it.
const emptyChart = (name, all) => {
  const values = all.map((point) => point.value).filter((value) => value > 0);
  const top = Math.max(...values, 20);
  const bottom = Math.min(...values, top);
  const step = niceStep(top - bottom || 10);
  const low = Math.floor(bottom / step) * step;
  const high = Math.max(low + step, Math.ceil(top / step) * step);
  const ticks = Array.from({ length: Math.round((high - low) / step) + 1 }, (unused, index) => high - index * step).filter((tick, index, list) => list.length <= 6 || index % 2 === 0);
  const last = all.at(-1);
  const range = view.range === 90 ? '3 months' : view.range === 180 ? '6 months' : 'year';
  return `<div class="trend trendEmpty" role="img" aria-label="No ${esc(name)} in the last ${range}">
    ${ticks.map((tick) => `<span class="tick" style="top:${(((high - tick) / (high - low)) * 100).toFixed(2)}%"><b class="num">${tick}</b></span>`).join('')}
    <div class="emptyChart"><p class="emptyTitle">No ${esc(name)} in the last ${range}</p>${last ? `<p class="emptySub">Last time ${dayLabel(last.date)}</p>` : ''}<button class="chip" data-action="range" data-days="0"><span class="chipFace">Show all time</span></button></div>
  </div>
  <div class="axis num"><span>${dayLabel(addDays(todayIso(), -view.range))}</span><span>Today</span></div>`;
};
const chartFor = (allPoints) => {
  const points = monthlyBest(allPoints);
  if (points.length === 0) return '';
  const lines = { lift: view.lines?.lift !== false, est: view.lines?.est !== false };
  let bestSingle = 0;
  let bestSoFar = 0;
  const rows = points.map((point) => {
    const top = point.sets.reduce((winner, set) => (!winner || Number(set.kg) > Number(winner.kg) ? set : winner), null);
    const single = Math.max(0, ...point.sets.filter((set) => Number(set.reps) === 1).map((set) => Number(set.kg)));
    const isPr = single > bestSingle && bestSingle > 0;
    bestSingle = Math.max(bestSingle, single);
    bestSoFar = Math.max(bestSoFar, point.value);
    return { date: point.date, lifted: Number(top.kg), top, from: estimateSet({ sets: point.sets }), sessionEstimate: point.value, estimate: bestSoFar, isPr };
  });
  const picked = rows.find((row) => row.date === view.chartPick);
  const values = rows.flatMap((row) => [...(lines.lift ? [row.lifted] : []), ...(lines.est ? [row.estimate] : [])]);
  const all = values.length ? values : rows.map((row) => row.lifted);
  const step = niceStep(Math.max(...all) - Math.min(...all) || 10);
  const low = Math.floor(Math.min(...all) / step) * step;
  const high = Math.max(low + step, Math.ceil(Math.max(...all) / step) * step);
  const first = parseIso(rows[0].date).getTime();
  const span = Math.max(1, parseIso(rows.at(-1).date).getTime() - first);
  // Mostly even spacing so every dot can be tapped, with a little real time mixed in for the shape.
  const order = new Map(rows.map((row, index) => [row.date, index]));
  const x = (date) => (rows.length === 1 ? 500 : 0.8 * (order.get(date) / (rows.length - 1)) * 1000 + 0.2 * ((parseIso(date).getTime() - first) / span) * 1000);
  const y = (value) => ((high - value) / (high - low)) * 1000;
  const ticks = Array.from({ length: Math.round((high - low) / step) + 1 }, (unused, index) => high - index * step);
  const path = (key) => smoothPath(rows.map((row) => [x(row.date), y(row[key])]));
  return `<div class="chips lineChips">${[['lift', 'Weight lifted'], ['est', 'Est. 1RM']].map(([key, label]) => `<button class="lineChip ${key}" data-action="toggle-line" data-line="${key}" aria-pressed="${lines[key]}"><i></i>${label}</button>`).join('')}${infoButton()}</div>
  <div class="trend" role="img" aria-label="Weight lifted and estimated 1RM over time">
    ${ticks.map((tick) => `<span class="tick" style="top:${(y(tick) / 10).toFixed(2)}%"><b class="num">${tick}</b></span>`).join('')}
    <div class="plot">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        ${lines.est ? `<path d="${path('estimate')}" class="lineEst" vector-effect="non-scaling-stroke"/>` : ''}
        ${lines.lift ? `<path d="${path('lifted')}" class="lineLift" vector-effect="non-scaling-stroke"/>` : ''}
      </svg>
      ${lines.lift ? rows.map((row) => `<button class="dot${row.isPr ? ' pr' : ''}${row === picked ? ' on' : ''}" data-action="pick-point" data-date="${row.date}" style="left:${x(row.date) / 10}%;top:${y(row.lifted) / 10}%" aria-label="${dayLabel(row.date)}, ${row.top.kg} × ${row.top.reps}"></button>`).join('') : ''}
    </div>
  </div>
  <div class="axis num"><span>${dayLabel(rows[0].date)}</span><span>${dayLabel(rows.at(-1).date)}</span></div>
  ${picked ? `<button class="pickInfo num" data-action="jump-session" data-date="${picked.date}" aria-label="Open ${dayLabel(picked.date)} on Home"><b>${dayLabel(picked.date)}</b> · <span class="nw">${picked.top.kg} × ${picked.top.reps}</span>${picked.top.rpe ? ` @ RPE ${picked.top.rpe}` : ''} ${picked.sessionEstimate > 0 ? ` · <span class="nw">est. ${Math.round(picked.sessionEstimate)}&nbsp;kg${picked.from && (picked.from.kg !== picked.top.kg || picked.from.reps !== picked.top.reps) ? ` from ${picked.from.kg} × ${picked.from.reps}` : ''}</span>` : ''}${picked.isPr ? ' · 1RM PR' : ''} <span class="pickOpen">Open day${ICONS.chevRight}</span></button>` : ''}`;
};

const MUSCLES = [
  ['chest', 'Chest'], ['traps', 'Traps'], ['upperBack', 'Upper back'], ['lowerBack', 'Lower back'], ['quads', 'Quads'], ['hamstrings', 'Hamstrings'], ['shoulders', 'Shoulders'], ['rearDelts', 'Rear delts'], ['biceps', 'Biceps'],
  ['triceps', 'Triceps'], ['glutes', 'Glutes'], ['abs', 'Abs'], ['calves', 'Calves'], ['forearms', 'Forearms'], ['adductors', 'Adductors'],
];
// First match wins: [name pattern, muscles worked hard, muscles helping (half a set)].
const MUSCLE_RULES = [
  [/leg curl|hamstring curl|nordic/, ['hamstrings']],
  [/leg ext/, ['quads']],
  [/back ext|hyperext|good morning/, ['lowerBack'], ['glutes', 'hamstrings']],
  [/romanian|\brdl\b|stiff/, ['hamstrings'], ['glutes', 'lowerBack']],
  [/deadlift/, ['hamstrings', 'glutes', 'lowerBack'], ['upperBack', 'forearms', 'traps']],
  [/shrug/, ['traps'], ['forearms']],
  [/hack|leg press|squat|lunge|split|step.?up/, ['quads', 'glutes'], ['adductors']],
  [/hip thrust|glute|bridge|kickback|abduct/, ['glutes']],
  [/adduct/, ['adductors']],
  [/calf|calves/, ['calves']],
  [/close.?grip|\bdips?\b/, ['triceps'], ['chest']],
  [/tricep|pushdown|skull|extension|french/, ['triceps']],
  [/hammer/, ['biceps', 'forearms']],
  [/curl/, ['biceps'], ['forearms']],
  [/face pull|rear delt|reverse fl|reverse pec|rear fl|band pull/, ['rearDelts'], ['traps']],
  [/upright/, ['shoulders'], ['traps']],
  [/overhead|ohp|shoulder|military|arnold|lateral|delt|front raise/, ['shoulders'], ['triceps']],
  [/bench|chest|push.?up|fly|flye|pec|incline|decline|press/, ['chest'], ['shoulders', 'triceps']],
  [/row/, ['upperBack'], ['biceps', 'traps', 'rearDelts']],
  [/pull.?up|chin.?up|pulldown|\blat\b/, ['upperBack'], ['biceps']],
  [/crunch|sit.?up|plank|\babs?\b|leg raise|core|oblique/, ['abs']],
  [/wrist|forearm|farmer|grip/, ['forearms']],
];
let anatomy = null;
const loadAnatomy = () => {
  if (anatomy) return;
  anatomy = 'loading';
  fetch('/anatomy.json').then((response) => response.json()).then((data) => { anatomy = data; render(); }).catch(() => { anatomy = null; });
};
// Days until a muscle is recovered. After that it keeps a light tint until it drops out of the 7 days.
const RECOVERY_DAYS = { quads: 6, hamstrings: 6, glutes: 6, adductors: 5, lowerBack: 5, upperBack: 4, traps: 4, chest: 3, shoulders: 3, rearDelts: 3, biceps: 3, triceps: 3, calves: 3, forearms: 4, abs: 4 };
const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00`) - new Date(`${from}T12:00`)) / 86400000);
const muscleLoad = (today = todayIso()) => {
  const since = addDays(today, -6);
  const sets = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const fatigue = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const fresh = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const remaining = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  for (const session of state.sessions) {
    if (session.date < since || session.date > today) continue;
    const ago = Math.max(0, daysBetween(session.date, today) - 0.5);
    for (const exercise of session.exercises) {
      const rule = MUSCLE_RULES.find(([pattern]) => pattern.test(exercise.name.toLowerCase()));
      if (!rule) continue;
      const working = validSets(exercise).filter((set) => !set.warmup);
      const count = working.length;
      // How hard it was: the top set against your best for that lift. Near your max (85%+, like 290 when your best
      // is 300) takes the full time, so a heavy deadlift keeps the lower back recovering for about 5 days; a
      // moderate day three quarters of it, a light one half. A lift with nothing to compare to counts as moderate.
      const best = bestOverall(exercise.name);
      const top = Math.max(0, ...working.map((set) => setValue(exercise.name, set)));
      const hard = best > 0 && top > 0 ? (top / best >= 0.85 ? 1 : top / best >= 0.7 ? 0.75 : 0.5) : 0.75;
      for (const [keys, share] of [[rule[1], 1], [rule[2] ?? [], 0.5]]) {
        for (const key of keys) {
          const needs = RECOVERY_DAYS[key] * hard * (share < 1 ? 0.75 : 1);
          const part = Math.max(0, 1 - ago / needs);
          sets[key] += count * share;
          fatigue[key] += count * share * part;
          if (count * share >= 1) {
            fresh[key] = Math.max(fresh[key], part);
            remaining[key] = Math.max(remaining[key], part * needs);
          }
        }
      }
    }
  }
  return { sets, fatigue, fresh, remaining };
};
// Two states you can tell apart at a glance: clay while a muscle is still recovering (deeper the more is left), and
// the plain body grey once it's ready, the same as a muscle you haven't trained.
// Four clear steps: full red the day you train it, lighter red, lighter green, then our green once it's recovered.
// A muscle you've never trained stays the plain body grey.
const recoveryStep = ({ fresh }, key) => (fresh[key] > 2 / 3 ? 'recov4' : fresh[key] > 1 / 3 ? 'recov3' : fresh[key] > 0 ? 'recov2' : lastTrained()[key] ? 'recov1' : '');
// The last day each muscle got a real working set (a main lift for it, or two sets that hit it on the side).
const lastTrained = () => remember('lastTrained', () => {
  const last = {};
  for (const session of state.sessions) {
    if (session.date > todayIso()) continue;
    for (const exercise of session.exercises) {
      const rule = MUSCLE_RULES.find(([pattern]) => pattern.test(exercise.name.toLowerCase()));
      if (!rule) continue;
      const count = validSets(exercise).filter((set) => !set.warmup).length;
      for (const [keys, share] of [[rule[1], 1], [rule[2] ?? [], 0.5]]) for (const key of keys) if (count * share >= 1 && !(last[key] > session.date)) last[key] = session.date;
    }
  }
  return last;
});
const trainedWhen = (date) => {
  if (!date) return '–';
  const ago = daysBetween(date, todayIso());
  // Narrow rows show only the number of days, so today is 0 there (a long word would cut the muscle's name).
  return ago === 0 ? '<span class="tierShort">Today</span><span class="todayNum">0</span>' : `${ago}<span class="tierLong">d ago</span><span class="tierShort">d</span>`;
};
// Whole days until a muscle is ready again (0 = ready).
const daysLeft = ({ remaining }, key) => (remaining[key] > 0 ? Math.max(1, Math.ceil(remaining[key])) : 0);
// Strength view (like Symmetric Strength): each muscle takes the level of the lifts that train it, weighted, from
// the same Strength Level scores as the spider web (now, or all time when a lift isn't done lately).
try {
  view.muscleMode = localStorage.getItem('exodia.muscleMode') || 'strength';
} catch {
  // private mode: recovery
}
const MUSCLE_LIFTS = {
  chest: { 'bench-press': 0.6, 'incline-bench-press': 0.4 },
  shoulders: { 'shoulder-press': 0.55, 'incline-bench-press': 0.25, 'bench-press': 0.2 },
  triceps: { 'bench-press': 0.5, 'shoulder-press': 0.3, 'incline-bench-press': 0.2 },
  upperBack: { 'bent-over-row': 0.5, 'pull-ups': 0.5 },
  rearDelts: { 'bent-over-row': 0.6, 'face-pull': 0.25, 'pull-ups': 0.15 },
  traps: { deadlift: 0.75, 'bent-over-row': 0.25 },
  biceps: { 'pull-ups': 0.6, 'bent-over-row': 0.4 },
  lowerBack: { deadlift: 0.7, squat: 0.2, 'bent-over-row': 0.1 },
  // Squat leads; front squat, hack squat and barbell split squat count too, each on its own Strength Level table.
  quads: { squat: 0.6, 'hack-squat': 0.15, 'bulgarian-split-squat': 0.15, 'front-squat': 0.1 },
  glutes: { squat: 0.5, deadlift: 0.5 },
  hamstrings: { deadlift: 0.7, squat: 0.3 },
  forearms: { deadlift: 0.5, 'bent-over-row': 0.3, 'pull-ups': 0.2 },
  adductors: { squat: 0.6, deadlift: 0.4 },
  calves: { 'machine-calf-raise': 1 },
  abs: { 'sit-ups': 1 }
};
// The same five colours as --tierBeg … in styles.css (SVG gradients need the values).
const TIER_COLOURS = { tierBeg: '#BDB7AA', tierNov: '#A9C4A6', tierInt: '#A88FB5', tierAdv: '#C96442', tierElite: '#7CA3DD' };
// The level key, the same under the anatomy and under the strength web: the level's number in its colour, then its name.
<<<<<<< Updated upstream
// Tap a level (or the i) for what each level means; it opens under the key that was tapped.
const levelKey = (where) => {
  const open = view.levelInfo?.where === where ? view.levelInfo.level : null;
  const keys = [['tierBeg', 'Beginner'], ['tierNov', 'Novice'], ['tierInt', 'Intermediate'], ['tierAdv', 'Advanced'], ['tierElite', 'Elite']];
  return `<div class="levelKeyBox"><p class="levelKey">${keys.map(([tier, name], index) => `<button class="levelKeyItem" data-action="level-info" data-where="${where}" data-level="${index + 1}" aria-pressed="${open === index + 1}"><b class="${tier}">${index + 1}</b>${name}</button>`).join('')}<button class="infoBtn" data-action="level-info" data-where="${where}" data-level="0" aria-expanded="${open !== null}" aria-label="What the levels mean">i</button></p></div>
    ${open === null ? '' : `<div class="levelInfo${view.levelInfoEnter ? ' enter' : ''}" role="note"><p class="levelInfoIntro">The share of people who log this lift on Strength Level that each level beats, at your bodyweight and sex. They train and track their lifts; it is not everyone at a gym.</p>
      <div class="levelRows">${keys.map(([tier, name], index) => `<p class="levelRow${open === index + 1 ? ' on' : ''}"><b class="${tier}">${index + 1}</b><span class="levelName">${name}</span><span class="levelBeats num">Beats ${Math.round(LEVEL_BEATS[index] * 100)}%</span></p>`).join('')}</div>
      <p class="levelInfoNote">6.4 million checked lifts, 2015–2026. Past Elite, Exodia counts raw meet results instead (OpenPowerlifting).</p></div>`}`;
};
=======
const levelKey = () => `<button class="levelKeyBox" data-action="level-info" aria-expanded="${Boolean(view.levelInfo)}"><span class="levelKey">${[['tierBeg', 'Beginner'], ['tierNov', 'Novice'], ['tierInt', 'Intermediate'], ['tierAdv', 'Advanced'], ['tierElite', 'Elite']].map(([tier, name], index) => `<span><b class="${tier}">${index + 1}</b>${name}</span>`).join('')}<i class="levelKeyInfo" aria-hidden="true">i</i></span></button>${view.levelInfo ? levelInfo() : ''}`;
// Tap the key: what the levels mean, from Strength Level's own definitions.
const levelInfo = () => `<div class="levelInfo">
    <p class="levelInfoLead">Each lift's best one-rep max against Strength Level's standards for ${state.body?.kg ? `${Math.round(state.body.kg)} kg ${state.body.sex === 'female' ? 'women' : 'men'}` : 'your bodyweight and sex'}. Stronger than:</p>
    ${[['tierBeg', 'Beginner', '5% of lifters'], ['tierNov', 'Novice', '20%'], ['tierInt', 'Intermediate', '50%, the middle'], ['tierAdv', 'Advanced', '80%'], ['tierElite', 'Elite', '95%']].map(([tier, name, share], index) => `<p class="levelInfoRow"><b class="${tier}">${index + 1}</b><span>${name}</span><span class="num">${share}</span></p>`).join('')}
    <p class="levelInfoRow"><b class="tierElite">+</b><span>Elite +</span><span class="num">past Elite: ${beatsShare(5.5).toFixed(0)}% at 5.5, ${beatsShare(6.5).toFixed(1)}% at 6.5</span></p>
    <p class="levelInfoNote">The number after a level (like 4.5) is how far you are toward the next one. "Lifters" means people who log lifts on Strength Level, so it's measured against people who train.</p>
  </div>`;
>>>>>>> Stashed changes
const STRENGTH_TIERS = [[5, 'Elite', 'tierElite', 'Elite'], [4, 'Advanced', 'tierAdv', 'Adv.'], [3, 'Intermediate', 'tierInt', 'Int.'], [2, 'Novice', 'tierNov', 'Nov.'], [0.01, 'Beginner', 'tierBeg', 'Beg.']];
const muscleLevels = () => {
  const body = state.body;
  if (!body?.kg || !body?.sex) return null;
  const scores = Object.fromEntries([...WEB_LIFTS, ...MUSCLE_ONLY_LIFTS(), ...OTHER_LIFTS.filter((lift) => Object.values(MUSCLE_LIFTS).some((lifts) => lift.key in lifts))].map((lift) => {
    const result = liftStrength(lift, body);
    return [lift.key, result.everScore || 0];
  }));
  return Object.fromEntries(MUSCLES.map(([key]) => {
    const parts = Object.entries(MUSCLE_LIFTS[key] || {}).filter(([lift]) => scores[lift] > 0);
    const weight = parts.reduce((sum, [, share]) => sum + share, 0);
    return [key, weight ? parts.reduce((sum, [lift, share]) => sum + scores[lift] * share, 0) / weight : 0];
  }));
};
const tierOf = (level) => STRENGTH_TIERS.find(([from]) => level >= from) || null;
// The head turns into Exodia's hand once the whole body is there: orange when every muscle with a level is at least
// Advanced, Exodia blue when every one is at least Elite; until then a normal head. Abs and calves (sit-ups, calf raises) are
// rarely logged, so they don't count. Front shows the hand with its eye, the back the hand alone. Drawn as a colour through
// a mask of the logo, so its lines stay lighter like the real one.
const headTier = () => {
  const levels = muscleLevels();
  if (!levels) return null;
  // Every muscle a standard lift trains counts; one not trained at all keeps the head normal.
  const lowest = Math.min(...Object.keys(MUSCLE_LIFTS).filter((key) => key !== 'abs' && key !== 'calves').map((key) => levels[key] || 0));
  return lowest >= 5 ? 'tierElite' : lowest >= 4 ? 'tierAdv' : null;
};
const headLogo = (side, points, tier) => {
  const values = points.split(/[\s,]+/).map(Number);
  const xs = values.filter((_, index) => index % 2 === 0);
  const ys = values.filter((_, index) => index % 2 === 1);
  const size = 30;
  const [x, y] = [((Math.min(...xs) + Math.max(...xs)) / 2 - size / 2).toFixed(1), (Math.max(...ys) - size + 3).toFixed(1)];
  return `<mask id="hamsa-${side}" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${size}" height="${size}"><image href="/hamsa-mask${side === 'back' ? '-back' : ''}.png" x="${x}" y="${y}" width="${size}" height="${size}"/></mask><rect x="${x}" y="${y}" width="${size}" height="${size}" mask="url(#hamsa-${side})" class="bodyHead ${tier}"/>`;
};
let headTierNow = null;
const bodySvg = (side, load, levels = null) => `<svg class="bodyFig" viewBox="0 -7 100 207" aria-hidden="true">${anatomy[side].map(([key, points]) => {
  if (key === 'head') return headTierNow ? headLogo(side, points, headTierNow).replace('<rect ', '<rect data-head ') : `<polygon data-head points="${points}" class="bodyBone"/>`;
  if (levels) {
    const tier = key ? tierOf(levels[key] || 0) : null;
    return `<polygon points="${points}" class="${!key ? 'bodyBone' : tier ? `bodyTier ${tier[2]}` : 'bodyRest'}${key && view.musclePick === key ? ' picked' : ''}"${key ? ` data-action="pick-muscle" data-muscle="${key}"` : ''}/>`;
  }
  const step = key ? recoveryStep(load, key) : '';
  return `<polygon points="${points}" class="${!key ? 'bodyBone' : step ? `bodyRecov ${step}` : 'bodyRest'}${key && view.musclePick === key ? ' picked' : ''}"${key ? ` data-action="pick-muscle" data-muscle="${key}"` : ''}/>`;
}).join('')}</svg>`;
const renderMuscles = () => {
  loadAnatomy();
  if (!anatomy || anatomy === 'loading') return '';
  headTierNow = headTier();
  const load = muscleLoad();
  const { sets } = load;
  const levels = view.muscleMode === 'strength' ? muscleLevels() : null;
  const toggle = `<div class="segment full anatomySwitch" role="group" aria-label="Anatomy">${[['strength', 'Strength'], ['recovery', 'Recovery']].map(([mode, label]) => `<button class="segmentOption" data-action="muscle-mode" data-mode="${mode}" aria-pressed="${(view.muscleMode || 'strength') === mode}">${label}</button>`).join('')}<i class="segmentKnob${view.muscleMode === 'recovery' ? ' on' : ''}" aria-hidden="true"></i></div>`;
  if (view.muscleMode === 'strength') {
    return `${toggle}
    ${levels ? `<div class="muscles${view.musclePick ? ' picking' : ''}">${bodySvg('front', load, levels)}${bodySvg('back', load, levels)}
      <div class="muscleList">${MUSCLES.map(([key, label]) => {
        const tier = tierOf(levels[key] || 0);
        return `<div class="muscleRow${tier ? '' : ' muted'}${view.musclePick === key ? ' picked' : ''}" data-action="pick-muscle" data-muscle="${key}" role="button" tabindex="0"><i class="muscleSwatch ${tier ? tier[2] : 'tierNone'}"></i><span>${label}</span><span class="num tierWord" title="${tier ? tier[1] : ''}">${tier ? `<span class="tierLong">${tier[1]}</span><span class="tierShort">${tier[3]}</span> <span class="tierNum">${levelNumber(levels[key])}</span>` : '–'}</span></div>`;
      }).join('')}</div>
    </div>
    <div class="anatomyFoot">${levelKey('body')}</div>`
    : `${bodyForm('Add your bodyweight to see your strength across your anatomy')}<div class="muscles emptyLevels">${bodySvg('front', load, {})}${bodySvg('back', load, {})}
      <div class="muscleList">${MUSCLES.map(([, label]) => `<div class="muscleRow muted"><i class="muscleSwatch tierNone"></i><span>${label}</span><span class="num tierWord">–</span></div>`).join('')}</div>
    </div>`}`;
  }
  return `${toggle}
    <div class="muscles${view.musclePick ? ' picking' : ''}">${bodySvg('front', load)}${bodySvg('back', load)}
      <div class="muscleList">${MUSCLES.map(([key, label]) => {
        const left = daysLeft(load, key);
        const last = lastTrained()[key];
        const step = recoveryStep(load, key);
        return `<div class="muscleRow${last ? '' : ' muted'}${view.musclePick === key ? ' picked' : ''}" data-action="pick-muscle" data-muscle="${key}" role="button" tabindex="0" title="${left ? `About ${left} ${left === 1 ? 'day' : 'days'} until recovered` : last ? 'Recovered' : 'Not trained yet'} · ${Math.round(sets[key])} sets in the last 7 days"><i class="muscleSwatch ${step || 'tierNone'}"></i><span>${label}</span><span class="num">${trainedWhen(last)}</span></div>`;
      }).join('')}</div>
    </div>
    <div class="anatomyFoot"><div class="levelKeyBox"><p class="levelKey recovKey"><span>Just trained</span><i class="muscleSwatch recov4"></i><i class="muscleSwatch recov3"></i><i class="muscleSwatch recov2"></i><i class="muscleSwatch recov1"></i><span>Recovered</span></p></div></div>`;
};

// Days in the range where this lift set a PR (a heavier single or a new estimated max).
const prCount = (name, since) => state.sessions.filter((session) => session.date >= since && session.exercises.some((exercise) => countsFor(name).includes(exercise.name) && validSets(exercise).some((set) => prKind(name, session.date, set)))).length;

// A blank start still shows the real charts and lifts, just with nothing in them yet.
const emptyLift = (name) => `<section class="card"><div class="head"><span class="headName">${esc(name)}</span><span class="meta num">–</span></div><p class="summary">No sessions yet</p></section>`;

// Inside the trend card, right under the chart: one list of your lifts. Squat, Bench and Deadlift first, then the rest
// by when you last did them. Tap one and the chart above shows it; that one is marked in clay ("On chart").
// Six show at first, "Show all" opens the rest. Weights are the heaviest you lifted, in kg, with the reps.
const LIFT_ORDER = ['Squat', 'Bench Press', 'Deadlift'];
// Three fixed columns, so weights, "kg" and "× reps" line up from row to row.
const liftKg = (name) => {
  const lifted = heaviestLifted(name);
  return `<span class="liftNum num">${lifted ? lifted.kg : '–'}</span><span class="liftUnit">${lifted ? 'kg' : ''}</span><span class="liftReps num">${lifted ? `× ${lifted.reps}` : ''}</span>`;
};
const liftPicker = (big, rest, history, action = 'pick-trend', current = view.trendOpen) => {
  const all = [...LIFT_ORDER.filter((name) => big.includes(name)), ...rest];
  const first = 6;
  const visible = view.trendMore || all.length <= first ? all : [...all.slice(0, first), ...(all.indexOf(current) >= first ? [current] : [])];
  return `${action === 'pick-trend' ? '<p class="liftHead"><span>Your lifts · best set</span><span class="liftHint">Tap one to see its trend</span></p>' : ''}<div class="liftList">${visible.map((name, index) => `<button class="liftItem" data-action="${action}" data-name="${esc(name)}"${index >= 3 ? ' data-scroll="1"' : ''} aria-pressed="${current === name}"><span class="liftDot" aria-hidden="true"></span><span class="liftItemName"><span class="liftItemText">${esc(name)}</span><small class="liftCount num">${liftDays(name)} ${liftDays(name) === 1 ? "session" : "sessions"}</small></span>${current === name ? '<span class="onChart">On chart</span>' : ''}<span class="liftItemBest">${liftKg(name)}</span></button>`).join('')}</div>
    ${all.length > first ? `<button class="liftExpand" data-action="trend-more" aria-expanded="${Boolean(view.trendMore)}">${view.trendMore ? 'Show fewer' : `Show all ${all.length} lifts`}${ICONS.chev}</button>` : ''}`;
};

// Your SBD total in the empty corner beside the title: heaviest real singles of squat, bench and deadlift added up,
// and the total your best estimated maxes add up to. Shown once all three lifts have numbers.
const SBD = ['Squat', 'Bench Press', 'Deadlift'];
const sbdTotal = () => {
  const singles = SBD.map((name) => singleBefore(name, '9999-12-31'));
  const estimates = SBD.map((name) => bestOverall(name));
  if (estimates.some((value) => !(value > 0))) return '';
  const actual = singles.every((value) => value > 0) ? Math.round(singles.reduce((sum, value) => sum + value, 0)) : 0;
  const expected = Math.round(estimates.reduce((sum, value) => sum + value, 0));
  const detail = SBD.map((name, index) => `${name} ${singles[index] ? round(singles[index]) : '–'} (est. ${Math.round(estimates[index])})`).join(', ');
  return `<p class="sbdTotal num" title="${esc(detail)}"><span class="sbdLabel">SBD total</span><b>${actual ? `${actual} kg` : '–'}</b><span class="sbdEst">est. ${expected} kg</span></p>`;
};
const renderTrends = () => {
  const history = new Map();
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    for (const exercise of session.exercises) {
      if (validSets(exercise).length === 0) continue;
      if (!history.has(exercise.name)) history.set(exercise.name, []);
      history.get(exercise.name).push({ date: session.date, value: topEstimate(exercise), sets: validSets(exercise) });
    }
  }
  // Harder variants also draw on their main lift's chart (a paused 130 × 2 is a bench point); one point per day.
  for (const [main, variants] of Object.entries(HARDER_VARIANTS)) {
    const points = [main, ...variants].flatMap((name) => history.get(name) || []);
    if (!variants.some((name) => history.has(name))) continue;
    const byDate = new Map();
    for (const point of points) {
      const day = byDate.get(point.date);
      byDate.set(point.date, day ? { date: point.date, value: Math.max(day.value, point.value), sets: [...day.sets, ...point.sets] } : point);
    }
    history.set(main, [...byDate.values()].sort((first, second) => first.date.localeCompare(second.date)));
  }
  const names = [...history.keys()].sort((first, second) => history.get(second).at(-1).date.localeCompare(history.get(first).at(-1).date));
  const big = BIG_THREE.filter((name) => history.has(name));
  const rest = names.filter((name) => !big.includes(name));
  if (!history.has(view.trendOpen) && names.length) view.trendOpen = ['Squat', 'Bench Press', 'Deadlift'].find((name) => big.includes(name)) || names[0];
  const card = (name) => {
    const all = history.get(name);
    const open = view.trendOpen === name;
    const best = bestOverall(name);
    const since = addDays(todayIso(), -view.range);
    const points = all.filter((point) => view.range === 0 || point.date >= since);
    const lifted = heaviestLifted(name);
    const last = all.at(-1);
    const lastTop = last.sets.reduce((winner, set) => (!winner || Number(set.kg) > Number(winner.kg) || (Number(set.kg) === Number(winner.kg) && Number(set.reps) > Number(winner.reps)) ? set : winner), null);
    return `<section class="card${open ? ' open' : ''}" data-trend="${esc(name)}">
      <p class="head trendHead"><span class="headName">${esc(name)}</span></p>
      ${open ? `
        <div class="tiles">
          <div class="tile"><p class="tileValue num">${lifted ? lifted.kg : '–'}<small>${lifted ? ` × ${lifted.reps}` : ''}</small></p><p class="tileLabel">Best lifted</p><p class="tileSub">All time</p></div>
          <div class="tile"><p class="tileValue num">${Math.round(best)}<small> kg</small></p><p class="tileLabel">Est. 1RM ${infoButton()}</p><p class="tileSub">All time</p></div>
          <button class="tile" data-action="jump-session" data-date="${last.date}" aria-label="Latest top set ${lastTop.kg} × ${lastTop.reps}, open ${dayLabel(last.date)}"><p class="tileValue num">${lastTop.kg}<small> × ${lastTop.reps}</small></p><p class="tileLabel">Latest top set</p><p class="tileSub">${dayLabel(last.date)}</p></button>
        </div>
        ${nowLine(name)}
        ${view.info ? ESTIMATE_INFO : ''}
        <div class="chartHead">
          <p class="chartTitle">Trend <span class="chartPrs">${prCount(name, view.range ? since : '') || 'No'} ${prCount(name, view.range ? since : '') === 1 ? 'PR' : 'PRs'}</span></p>
          ${[[90, '3M'], [180, '6M'], [365, '1Y'], [0, 'All']].map(([days, label]) => `<button class="chip" data-action="range" data-days="${days}" aria-pressed="${view.range === days}"><span class="chipFace">${label}</span></button>`).join('')}
        </div>
        ${points.length ? chartFor(points) : emptyChart(name, all)}
` : `<p class="summary num">${all.length} ${all.length === 1 ? 'session' : 'sessions'} · last ${dayLabel(last.date)}</p>`}
    </section>`;
  };
  return `<main class="page trendsPage">
    <p class="eyebrow">${todayLine()}</p>
    <div class="titleRow"><h1 class="title">Trends</h1>${sbdTotal()}</div>
    ${names.length ? `<div class="list">${card(view.trendOpen).replace(/<\/section>\s*$/, `${liftPicker(big, rest, history)}</section>`)}</div>` : `<p class="section">Big 3</p><div class="list">${BIG_THREE.map(emptyLift).join('')}</div>`}
    ${renderMuscles()}
    ${desktopQuery.matches ? '' : `${renderStrength()}${renderVolume()}`}
    ${renderCalendar()}
<<<<<<< Updated upstream
    ${desktopQuery.matches ? '' : renderImpressive()}
=======
    ${renderImpressive()}
>>>>>>> Stashed changes
  </main>`;
};

const rawDetails = (raw) => {
  if (!raw) return '';
  let pretty = raw;
  try {
    pretty = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    // keep the raw text as it is
  }
  return `<details class="rawBox"><summary>Raw command</summary><pre class="raw">${esc(pretty)}</pre></details>`;
};

const OFF_LINE = /^(Not logged|Didn't understand)/;
const chatStamp = (at, before) => {
  const time = new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const day = isoDate(new Date(at));
  if (!before || isoDate(new Date(before)) !== day) return `${dayLabel(day)} · ${time}`;
  return at - before > 1800000 ? time : '';
};

// Who read a message (see the note inside).
const engineName = (engine) => {
  if (!engine) return '';
  // Marcus sees the real model ("Gemini 3.5 Flash-Lite"); friends see the same model under Exodia's name ("Exodia 3.5
  // Flash-Lite"), so a friend's screenshot still says which one handled it.
  const brand = (name) => (view.isAdmin ? name : 'Exodia');
  if (engine === 'phone') return view.isAdmin ? 'the phone, no AI' : 'Exodia';
  if (engine === 'claude') return view.isAdmin ? 'Claude' : 'Exodia Sonnet';
  if (engine === 'add') return 'Exodia import';
  const gemini = engine.match(/^gemini-(.+?)(-lite)?$/);
  return gemini ? `${brand('Gemini')} ${gemini[1].split('-').map((part) => (/^\d/.test(part) ? part : part[0].toUpperCase() + part.slice(1))).join(' ')}${gemini[2] ? '-Lite' : ''}` : view.isAdmin ? engine : 'Exodia';
};
const chatEntry = ({ stamp, who, said, heard, voice, did, raw, by, fixIndex: index, voiceId, compact, manual, theirs, laterId, fresh }) => {
  const fixIndex = manual ? undefined : index;
  const handled = engineName(by || (raw && /"engine":"([^"]+)"/.exec(raw)?.[1]) || '');
  const lines = [].concat(did);
  const failed = OFF_LINE.test(lines[0] || '');
  const off = lines.some((line) => OFF_LINE.test(line));
  // A voice note says so on top, with what was heard under it, so a failed one still shows the words.
  const spoken = voice || (heard && heard === said) || (voiceId && said !== 'Voice note');
  const youSaid = `${spoken ? '<span class="bubbleKind">Voice note</span>' : ''}${saidHtml(said)}${heard && heard !== said ? `<span class="bubbleHeard">Heard: ${esc(heard)}</span>` : ''}${off && fixIndex !== undefined ? `<span class="bubbleHint">${failed ? 'Didn’t go through' : 'Partly logged'} · tap to edit</span>` : ''}`;
  // In Admin, other people's messages sit on the left under their own name, so they never look like Marcus's.
  return `<div class="chatItem${off ? ' off' : ''}${theirs ? ' theirs' : ''}${fresh ? ' fresh' : ''}">
  ${theirs ? `${stamp ? `<p class="chatTime">${stamp}</p>` : ''}<p class="chatWho">${esc(who || 'Someone')}</p>` : stamp || who ? `<p class="chatTime">${[stamp, who && esc(who)].filter(Boolean).join(' · ')}</p>` : ''}
  ${fixIndex === undefined ? `<div class="bubbleIn">${youSaid}</div>` : `<button class="bubbleIn" data-action="edit-said" data-index="${fixIndex}">${youSaid}</button>`}
  <div class="bubbleOut"><p>${laterId && laterJobs().some((job) => job.id === laterId) ? `<span class="ghostText">${esc(lines.join(' · '))}</span>` : esc(lines.join(' · '))}</p>${handled ? `<p class="handledBy">${failed ? `Tried by ${esc(handled)}${/Didn.t understand|Nothing to log/.test(lines.join(' ')) && !/phone|import/.test(handled) ? ` · ${view.isAdmin ? 'needs a stronger model' : 'needs a stronger Exodia, Marcus can turn one on'}` : ''}` : `Handled by ${esc(handled)}`}</p>` : ''}${compact ? '' : rawDetails(raw)}${voiceId ? `<button class="textBtn" data-action="retry-voice" data-voice="${voiceId}">Try again</button>` : failed && fixIndex !== undefined && said !== 'Voice note' ? `<button class="textBtn" data-action="retry-said" data-index="${fixIndex}">Try again</button>` : ''}${failed && fixIndex !== undefined && /Didn't understand/.test(lines[0]) && said.split(/\s+/).length >= 8 ? `<button class="textBtn" data-action="said-feedback" data-index="${fixIndex}">Send as feedback</button>` : ''}${failed && fixIndex !== undefined && view.isAdmin && said !== 'Voice note' ? `<button class="textBtn" data-action="said-builder" data-index="${fixIndex}">Ask Exodia builder</button>` : ''}</div>
</div>`;
};

const chatList = (entries, compact) => entries.map(({ entry, index }, position) => chatEntry({ ...entry, stamp: chatStamp(entry.at, entries[position - 1]?.entry.at), fixIndex: index, compact, fresh: !freshShown.has(entry.at) && Date.now() - entry.at < 4000 && freshShown.add(entry.at) })).join('');
// A reply slides in once, the first time it is drawn; redraws after that leave it still.
const freshShown = new Set();

// Messages that added or changed a lift: its name is in what was logged (raw) or in the reply.
const logMatchesLift = (entry, name) => [entry.raw || '', ...entry.did].some((text) => text.toLowerCase().includes(name.toLowerCase()));
const logMatchesDay = (entry, date) => (entry.raw || '').includes(date) || entry.did.some((line) => line.includes(dayLabel(date)));

const renderDayNow = (date) => {
  const session = sessionFor(date);
  return `<section class="card dayNow">
    <p class="dayNowTitle">${dayLabel(date)} right now</p>
    ${session ? `${session.exercises.map((exercise) => `<div class="dayNowRow"><span class="dayNowName">${esc(exercise.name)}</span><span class="dayNowSets num">${exercise.sets.map((set) => `${set.kg}×${set.reps}${set.rpe ? ` @${set.rpe}` : ''}${set.warmup ? ' w' : ''}`).join(' · ')}</span></div>`).join('')}${cardioParts(session).map((part) => `<div class="dayNowRow"><span class="dayNowName">${esc(part.name)}</span><span class="dayNowSets num">${humanMinutes(part.minutes)}</span></div>`).join('')}${accessoriesOf(session) ? `<div class="dayNowRow"><span class="dayNowName">Accessories</span><span class="dayNowSets num">${humanMinutes(accessoriesOf(session))}</span></div>` : ''}${session.label ? `<div class="dayNowRow"><span class="dayNowName">Name</span><span class="dayNowSets">${esc(session.label)}</span></div>` : ''}` : '<p class="empty" style="margin:6px 0">Nothing logged on this day.</p>'}
    <p class="dayNowHint">Say or type what's wrong. Changes go to this day.</p>
  </section>`;
};

const renderLog = () => `<main class="page">
    <p class="eyebrow">What you said, and what Exodia did</p>
    <h1 class="title">Log</h1>
    ${view.logDate || view.logLift ? `<p class="logFilter">Showing ${view.logLift ? `messages about ${esc(view.logLift)}` : dayLabel(view.logDate)}<button class="textBtn" data-action="log-all">Show all</button></p>` : ''}
    <div class="chat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).filter(({ entry }) => (!view.logDate || logMatchesDay(entry, view.logDate)) && (!view.logLift || logMatchesLift(entry, view.logLift))).reverse(), false) || '<p class="empty">Say or type something in the box below and it shows up here.</p>'}</div>
  ${view.logDate ? renderDayNow(view.logDate) : ''}
  </main>`;

// Usage for Marcus's admin dashboard: when the app opens, which page, which button (its action name) and what
// didn't go through. Sent in small batches; never training data or anything typed. Not in the demo or sandbox.
const usage = { queue: [], hiddenAt: 0 };
const sendUse = () => {
  if (!usage.queue.length || !syncState?.profile) return;
  const events = usage.queue.splice(0, 60);
  fetch('/api/event', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ events }) }).catch(() => {});
};
const noteUse = (kind, detail = '') => {
  if (view.preview || view.sandbox) return;
  usage.queue.push({ kind, detail: String(detail).slice(0, 60), at: Date.now() });
  if (usage.queue.length >= 40) sendUse();
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    usage.hiddenAt = Date.now();
    sendUse();
  } else if (usage.hiddenAt && Date.now() - usage.hiddenAt > 30 * 60000) noteUse('open', 'back');
});
setInterval(sendUse, 60000);
const loadAdmin = () => fetch('/api/admin?dashboard=1', { headers: { 'x-exodia-key': syncState.profile } })
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Not allowed'))))
  .then((data) => {
    view.adminRows = Array.isArray(data?.commands) ? data.commands : [];
    view.adminFeedback = data?.feedback || [];
    if (data?.dashboard) view.adminStats = data.dashboard;
    view.adminBuilders = data?.builders || [];
    view.adminBuilder = data?.builder || 1;
    view.adminError = '';
  })
  .catch((error) => {
    view.adminRows = [];
    view.adminError = navigator.onLine === false ? 'No internet, so the list could not load.' : `The list could not load (${error.message}).`;
  })
  .finally(() => {
    // Chat opens at the latest, just above the box; Dashboard at the top.
    if (view.route === 'admin') {
      render();
      if (view.adminTab === 'chat') scrollPage(scroller().scrollHeight);
    }
  });

const FEEDBACK_EXAMPLES = ['The mic stopped after a minute', 'Add a rest timer between sets', 'Let me log my body weight', 'Trends should show my squat first', 'The app froze when I pasted my notes'];

const renderFeedback = () => `<main class="page">
    <p class="eyebrow">Ideas, bugs and how it works</p>
    <h1 class="title">Help &amp; feedback</h1>
    <p class="feedbackLead">Missing something, or did something break? Say it or type it in the box below, any way you like. Exodia writes it up and sends it to Marcus, who reads every one and decides what gets built.</p>
    <div class="chat">${(state.feedback || []).map((item) => `<div class="chatItem"><div class="bubbleIn">${esc(item.said)}</div><div class="bubbleOut"><p>Sent to Marcus · ${item.kind === 'bug' ? 'Bug' : 'Idea'}: ${esc(item.title)}</p></div></div>`).join('')}${view.pending.filter((pending) => pending.feedback).map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div><div class="bubbleOut" role="status"><p>${writingLine()}</p></div></div>`).join('')}</div>
    ${helpSections()}
  </main>`;

const sendFeedback = async (text, voice) => {
  const pending = { feedback: true, date: todayIso(), text: text || 'Voice note' };
  view.pending.push(pending);
  view.sentAt = Date.now();
  view.draft = '';
  if (!desktopQuery.matches) document.activeElement?.blur();
  render();
  closeTray();
  try {
    const audio = voice ? await wavBase64(voice) : undefined;
    const response = await timedFetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, audio, name: state.name || '', ...(view.sandbox ? { dry: true } : {}) }) });
    const body = await response.json().catch(() => ({ error: `The server answered ${response.status}. Try again.` }));
    if (!response.ok) throw new Error(body.error || 'Could not send that. Try again.');
    state.feedback = [...(state.feedback || []), { at: Date.now(), said: body.said, kind: body.kind, title: body.title }].slice(-50);
    addLog(body.said, [`Sent feedback to Marcus: ${body.title}`], { manual: true });
    view.toast = { kind: 'rep', title: 'Sent to Marcus', text: body.title };
    clearTimeout(view.toastTimer);
    view.toastTimer = setTimeout(clearToast, 5000);
  } catch (error) {
    if (!view.draft.trim()) view.draft = text;
    view.status = error.message;
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    render();
  }
};

const CLAUDE_EXAMPLES = ['Make the red lines a bit stronger', 'Show e1RM only once per day', 'Add a rest timer between sets', 'Fix the mic stopping after a minute'];

// Admin only: sends a change request to Claude Code, which edits the app, pushes to main and Cloudflare deploys it.
// Build tracking: remember the live version when a change is sent, then watch /sw.js until a newer version is live.
const liveVersion = () => fetch('/sw.js', { cache: 'no-store' }).then((response) => response.text()).then((text) => Number(text.match(/exodia-v(\d+)/)?.[1]) || 0).catch(() => 0);
const runStatus = (run) => (run.status === 'sending' ? '<span class="ghostText">Sending…</span>' : run.status === 'failed' ? `<span class="runFailed">Didn’t go through: ${esc(run.error || 'unknown error')}</span> <button class="textBtn" data-action="claude-retry" data-at="${run.at}">Try again</button>` : run.status === 'live' ? `Live in v${run.version}${run.built ? ` · ${esc(run.built)}` : ''}` : run.status === 'stalled' ? 'No update came out of this one' : run.from ? '<span class="ghostText">Building…</span>' : 'Sent');
// Asks GitHub (public repo) for the newest commit line, so the admin log can say what was built.
const builtNote = async (run) => {
  try {
    const response = await fetch('https://api.github.com/repos/marcusokodugha/exodia/commits/main');
    const commit = await response.json();
    run.built = String(commit.commit?.message || '').split('\n')[0].slice(0, 120);
    save();
    render();
  } catch {}
};
const BUILD_MAX = 8 * 60000;
const buildingNow = () => (state.claudeRuns || []).find((run) => run.from && !run.status && Date.now() - run.at < BUILD_MAX);
// Words that are still being heard show as a soft writing line instead of "Voice note…".
const VOICE_WAIT = 'Voice note…';
const saidHtml = (said) => (said === VOICE_WAIT ? '<span class="saidGhost" aria-label="Listening to your voice note"><i></i><i></i></span>' : esc(said));
let bannerTimer = 0;
let bannerSeen = 0;
const buildBanner = () => {
  const run = buildingNow();
  clearTimeout(bannerTimer);
  if (!run || view.bannerHidden === run.at) return '';
  bannerTimer = setTimeout(render, run.at + BUILD_MAX - Date.now() + 500);
  const seen = bannerSeen === run.at;
  bannerSeen = run.at;
  // The whole request, as you sent it, with its orange /admin; a long one scrolls inside the banner.
  return `<div class="buildBanner${seen ? ' still' : ''}" role="status"><span class="buildDot"></span><div class="toastWords"><p class="toastTitle">Exodia is on it</p><p class="toastText buildSaid"><span class="slashCmd">/admin</span> ${saidHtml(run.said)}</p><p class="bannerThink"><span class="ghostText thinkLine">${thinkText()}</span></p></div><button class="bannerClose" data-action="hide-banner" data-at="${run.at}" aria-label="Hide. Admin keeps showing how it goes">×</button></div>`;
};
let buildWatch = 0;
const watchBuilds = () => {
  clearTimeout(buildWatch);
  const building = (state.claudeRuns || []).filter((run) => run.from && !run.status);
  if (!building.length) return;
  buildWatch = setTimeout(async () => {
    if (document.hidden) return watchBuilds();
    const version = await liveVersion();
    let landed = false;
    for (const run of building) {
      if (version > run.from) Object.assign(run, { status: 'live', version, doneAt: Date.now() }), (landed = true), builtNote(run);
      else if (Date.now() - run.at > 45 * 60000) run.status = 'stalled';
    }
    save();
    if (landed) {
      announceBuilds();
      navigator.serviceWorker?.getRegistration().then((registration) => registration?.update());
    }
    render();
    watchBuilds();
  }, 20000);
};
// Says "Exodia update deployed" once per finished change, also after the app reloaded itself for the new version.
const announceBuilds = () => {
  const fresh = (state.claudeRuns || []).filter((run) => run.status === 'live' && !run.announced);
  if (!fresh.length) return;
  fresh.forEach((run) => (run.announced = true));
  addLog(fresh[0].said, [`Exodia update deployed · v${fresh[0].version}`], { manual: true });
  view.toast = { kind: 'rep', title: 'Exodia update deployed', text: fresh[0].said.slice(0, 80) };
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 6000);
};

// Marcus only: the red pill with what is still waiting on him, read from the "Waiting on Marcus" part of public/TODO.md.
// Each item opens to its steps and links; a "Decide:" item gets Yes / No, which start a change session with his answer.
const inlineMd = (text) => esc(text)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (all, label, url) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`)
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');
const parseLeft = (markdown) => {
  const start = markdown.indexOf('## Waiting on Marcus');
  if (start < 0) return [];
  const section = markdown.slice(start).split('\n').slice(1);
  const items = [];
  for (const line of section) {
    if (/^## /.test(line)) break;
    const item = line.match(/^- \[ \] (?:🔴 )?\*\*(.+?)\*\*\s*(.*)$/);
    if (item) items.push({ title: item[1].replace(/[.:]$/, ''), why: item[2], steps: [], decide: /^Decide:/i.test(item[1]) });
    else if (/^- \[x\]/i.test(line)) items.push(null);
    else if (items.at(-1) && /^\s+(\d+\.|-)\s+/.test(line)) items.at(-1).steps.push(line.replace(/^\s+(\d+\.|-)\s+/, ''));
  }
  return items.filter(Boolean);
};
const answeredLeft = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('exodia.answered') || '{}');
    return Object.fromEntries(Object.entries(saved).filter(([, at]) => Date.now() - at < 6 * 3600000));
  } catch {
    return {};
  }
};
let leftLoaded = 0;
// Redraw just the pill (and its list, if open), so it updates even while you're typing in the box.
const refreshLeftPill = () => {
  document.querySelectorAll('.leftPill, .leftScrim, .leftPanel').forEach((node) => node.remove());
  if (!onboarding() && !view.linkOffer && !view.splitAsk) document.getElementById('app')?.insertAdjacentHTML('beforeend', renderLeft());
  placeTopRight();
};
// Back on the window (computer) or the app (phone): check the list straight away.
for (const type of ['focus', 'visibilitychange']) window.addEventListener(type, () => {
  if (document.hidden) return;
  // Coming back after a minute away checks at once; otherwise the list refreshes every 5 minutes (each check reads
  // the database, which has a free daily limit).
  if (Date.now() - leftLoaded > 60000) leftLoaded = 0;
  loadLeft();
});
const loadLeft = () => {
  if (!view.isAdmin || document.hidden || Date.now() - leftLoaded < 300000) return;
  leftLoaded = Date.now();
  // Friends' feedback that's still new sits in the same list, with Build it / Not now.
  fetch('/api/admin', { headers: { 'x-exodia-key': syncState.profile } })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data) return;
      view.adminFeedback = data.feedback || [];
      if (!view.adminRows) view.adminRows = data.commands;
      refreshLeftPill();
    })
    .catch(() => null);
  fetch('/TODO.md', { cache: 'no-store' })
    .then((response) => (response.ok ? response.text() : ''))
    .then((markdown) => {
      view.left = parseLeft(markdown);
      refreshLeftPill();
    })
    .catch(() => null);
};
const leftItems = () => {
  const answered = answeredLeft();
  return (view.left || []).filter((item) => !answered[item.title]);
};
const newFeedback = () => (view.adminFeedback || []).filter((item) => item.status === 'new');
// Marcus only: what's waiting on him, and the developer tools below it.
const renderLeft = () => {
  if (!view.isAdmin) return '';
  const items = leftItems();
  const feedback = newFeedback();
  const waiting = items.length + feedback.length;
  // Hidden everywhere: an invisible 44px spot, always in the same place (phone: just left of the Trends/Home icon, top
  // right; computer: right of the name in the sidebar). On Admin it's a visible button under the title instead.
  return `${view.route === 'admin' ? '' : `<button class="leftPill${waiting ? '' : ' calm'}" data-action="toggle-left" aria-expanded="${Boolean(view.leftOpen)}" aria-label="${waiting ? `${waiting} waiting on you` : 'Developer'}"><span class="leftDot" aria-hidden="true"></span></button>`}
    ${view.leftOpen ? `<button class="leftScrim" data-action="toggle-left" aria-label="Close"></button><section class="leftPanel" aria-label="Waiting on you">
      <p class="leftHead">Waiting on you</p>
      ${feedback.map((item) => `<div class="leftItem${view.leftItem === `f${item.id}` ? ' open' : ''}">
        <button class="leftTitle" data-action="left-item" data-index="f${item.id}" aria-expanded="${view.leftItem === `f${item.id}`}">${esc(item.who)}: ${esc(item.title)}<span class="leftTag">${item.kind === 'bug' ? 'Bug' : 'Feedback'}</span></button>
        ${view.leftItem === `f${item.id}` ? `<div class="leftBody"><p>${esc(item.details)}</p><p class="leftWhen">${new Date(item.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p><div class="leftAnswer"><button class="chip" data-action="feedback-claude" data-id="${item.id}"><span class="chipFace">Build it</span></button><button class="chip" data-action="feedback-status" data-id="${item.id}" data-status="declined"><span class="chipFace">Not now</span></button></div></div>` : ''}
      </div>`).join('')}
      ${items.map((item, index) => `<div class="leftItem${view.leftItem === index ? ' open' : ''}">
        <button class="leftTitle" data-action="left-item" data-index="${index}" aria-expanded="${view.leftItem === index}">${inlineMd(item.title.replace(/^Decide:\s*/i, '').replace(/^\p{Ll}/u, (letter) => letter.toUpperCase()))}${item.decide ? '<span class="leftTag">Decide</span>' : ''}</button>
        ${view.leftItem === index ? `<div class="leftBody">${item.why ? `<p>${inlineMd(item.why)}</p>` : ''}${item.steps.length ? `<ol>${item.steps.map((step) => `<li>${inlineMd(step)}</li>`).join('')}</ol>` : ''}<div class="leftAnswer">${item.decide ? `<button class="chip" data-action="left-answer" data-index="${index}" data-answer="yes"><span class="chipFace">Yes</span></button><button class="chip" data-action="left-answer" data-index="${index}" data-answer="no"><span class="chipFace">No</span></button>` : ''}<button class="chip" data-action="left-reply" data-index="${index}"><span class="chipFace">Add context</span></button></div></div>` : ''}
      </div>`).join('')}
      ${waiting ? '' : '<p class="leftEmpty">Nothing waiting on you.</p>'}
      <p class="leftHead">Developer</p>
      <div class="leftDev">
        <button data-action="dev-exodia" data-style="fist">Play Exodia: fist opens</button>
        <button data-action="dev-exodia" data-style="bars">Play Exodia: bars fly in</button>
        ${view.devHit ? '<button data-action="dev-normal">Back to normal colors</button>' : ''}
        ${view.sandbox ? '<button data-action="dev-exit">Leave test mode</button>' : '<button data-action="dev-newuser">Simulate new user</button>'}
      </div>
    </section>` : ''}`;
};

// Every change request shows at once (here, on the Admin page and in the Log) and keeps its state:
// Sending… → Started → Live in vN, or exactly why it didn't go through, with Try again.
const askClaude = async (text, run = null) => {
  if (!run) {
    run = { at: Date.now(), said: text, status: 'sending' };
    state.claudeRuns = [run, ...(state.claudeRuns || [])].slice(0, 20);
    addLog(text, ['Sending to Exodia builder…'], { manual: true, merge: `claude-${run.at}` });
    save();
    render();
  }
  run.said = text;
  run.status = 'sending';
  delete run.error;
  let body = {};
  try {
    const from = await Promise.race([liveVersion(), new Promise((resolve) => setTimeout(() => resolve(0), 5000))]);
    // No answer in 30 s: say so honestly; the request may still have started, so check before sending it again.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const response = await fetch('/api/admin', { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ claude: text }) }).finally(() => clearTimeout(timer));
    body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Exodia builder did not start (${response.status}).`);
    Object.assign(run, { url: body.url, from, at: run.at });
    delete run.status;
  } catch (error) {
    run.status = 'failed';
    run.error = navigator.onLine === false ? 'No internet. Try again when you are online.'
      : error.name === 'AbortError' || error instanceof TypeError ? 'No answer from the server. It may still have started: check Admin in a minute before trying again.'
      : error.message || 'Exodia builder did not start.';
  }
  const entry = (state.log || []).find((item) => item.merge === `claude-${run.at}`);
  if (entry) entry.did = [run.status === 'failed' ? `Not sent to Exodia builder: ${run.error}` : 'Sent to Exodia builder. It goes live in a few minutes.'];
  save();
  render();
  if (run.status === 'failed') throw new Error(run.error);
  watchBuilds();
  return run;
};

// voice is the recording, or the promise of it while the mic is still finishing.
const sendToClaude = async (text, voice) => {
  view.draft = '';
  // What you send shows in Chat, so the Admin page switches there.
  if (view.route === 'admin' && view.adminTab !== 'chat') view.adminTab = 'chat';
  // The request is on screen before anything is sent or awaited; a voice note shows as "Voice note" until its words are in.
  const run = { at: Date.now(), said: text || VOICE_WAIT, status: 'sending' };
  state.claudeRuns = [run, ...(state.claudeRuns || [])].slice(0, 20);
  let ask = text;
  try {
    if (!desktopQuery.matches) document.activeElement?.blur();
    closeTray();
    addLog(run.said, ['Sending to Exodia builder…'], { manual: true, merge: `claude-${run.at}` });
    save();
    render();
    if (view.route === 'admin') scrollPage(scroller().scrollHeight);
    const recorded = await voice;
    voice = recorded?.size > 4000 ? recorded : null;
    if (!text && !voice) throw new Error(recorded ? `no sound recorded (${Math.round(recorded.size / 1024)} KB)` : 'nothing to send');
    if (voice) {
      const response = await timedFetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio: await wavBase64(voice) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.text) throw new Error(body.error || 'Could not hear that. Try again.');
      ask = [text, body.text.replace(/^\s*(slash|\/)\s*(admin|feedback)\b[\s,.:]*/i, '')].filter(Boolean).join(' ');
      run.said = ask;
      const entry = (state.log || []).find((item) => item.merge === `claude-${run.at}`);
      if (entry) entry.said = ask;
      render();
    }
    if (view.replyTo) {
      ask = `Marcus replies to "${view.replyTo.title}" (${view.replyTo.why}): ${ask}. Do what he asks, and update public/TODO.md if the item is settled.`;
      view.replyTo = null;
    }
    await askClaude(ask, run);
    run.said = text || run.said;
  } catch (error) {
    if (run.status !== 'failed') {
      run.status = 'failed';
      run.error = error.message;
      const entry = (state.log || []).find((item) => item.merge === `claude-${run.at}`);
      if (entry) entry.did = [`Not sent to Exodia builder: ${run.error}`];
      else view.status = `Not sent to Exodia builder: ${run.error}`;
    }
  } finally {
    save();
    render();
  }
};

// Feedback said in any box goes to the feedback list. Only the Admin page's box starts a build.
const routeFeedback = async (text, said) => {
  if (view.isAdmin && view.route === 'admin') {
    await askClaude(text);
    return;
  }
  const response = await timedFetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, name: state.name || '', ...(view.sandbox ? { dry: true } : {}) }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Could not send that feedback. Try again.');
  state.feedback = [...(state.feedback || []), { at: Date.now(), said: body.said || text, kind: body.kind, title: body.title }].slice(-50);
  addLog(said, [`Sent feedback to Marcus: ${body.title}`], { manual: true });
  view.toast = { kind: 'rep', title: 'Sent to Marcus', text: body.title };
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 5000);
};

const FEEDBACK_STATUS = [['new', 'New'], ['planned', 'Planned'], ['done', 'Done'], ['declined', 'No']];

// Sharing: the plain invite link, or one with the person's name in it (/Patrik) so it feels made for them.
const inviteLink = (name = '') => {
  const clean = name.trim().replace(/\s+/g, '-').replace(/[^\p{L}-]/gu, '').slice(0, 30);
  return `${location.origin}/${clean ? `${encodeURIComponent(clean.charAt(0).toUpperCase() + clean.slice(1))}` : 'join'}`;
};
// QR code for the invite link, made here (no library): byte mode, medium error correction, versions 1–10.
const qrMatrix = (text) => {
  const data = [...new TextEncoder().encode(text)];
  const ECC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  const BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  const rawModules = (v) => {
    let modules = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const align = Math.floor(v / 7) + 2;
      modules -= (25 * align - 10) * align - 55;
      if (v >= 7) modules -= 36;
    }
    return modules;
  };
  const dataBytes = (v) => Math.floor(rawModules(v) / 8) - ECC[v] * BLOCKS[v];
  let version = 1;
  while (version <= 10 && 12 + (version < 10 ? 0 : 8) + data.length * 8 > dataBytes(version) * 8) version += 1;
  if (version > 10) return null;
  const bits = [];
  const put = (value, length) => { for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1); };
  put(4, 4);
  put(data.length, version < 10 ? 8 : 16);
  data.forEach((byte) => put(byte, 8));
  const capacity = dataBytes(version) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) codewords.push(bits.slice(i, i + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  const mul = (x, y) => {
    let z = 0;
    for (let i = 7; i >= 0; i -= 1) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  };
  const eccLength = ECC[version];
  const divisor = Array(eccLength).fill(0);
  divisor[eccLength - 1] = 1;
  for (let i = 0, root = 1; i < eccLength; i += 1, root = mul(root, 2)) {
    for (let j = 0; j < eccLength; j += 1) {
      divisor[j] = mul(divisor[j], root);
      if (j + 1 < eccLength) divisor[j] ^= divisor[j + 1];
    }
  }
  const remainder = (block) => {
    const result = Array(eccLength).fill(0);
    block.forEach((byte) => {
      const factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach((coef, i) => { result[i] ^= mul(coef, factor); });
    });
    return result;
  };
  const blockCount = BLOCKS[version];
  const rawCodewords = Math.floor(rawModules(version) / 8);
  const shortCount = blockCount - (rawCodewords % blockCount);
  const shortLength = Math.floor(rawCodewords / blockCount);
  const blocks = [];
  for (let i = 0, k = 0; i < blockCount; i += 1) {
    const block = codewords.slice(k, k + shortLength - eccLength + (i < shortCount ? 0 : 1));
    k += block.length;
    const ecc = remainder(block);
    if (i < shortCount) block.push(0);
    blocks.push(block.concat(ecc));
  }
  const stream = [];
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => { if (i !== shortLength - eccLength || j >= shortCount) stream.push(block[i]); });
  }
  const size = version * 4 + 17;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => Array(size).fill(false));
  const set = (x, y, dark) => { grid[y][x] = dark; fixed[y][x] = true; };
  for (let i = 0; i < size; i += 1) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  [[3, 3], [size - 4, 3], [3, size - 4]].forEach(([cx, cy]) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        const ring = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, ring !== 2 && ring !== 4);
      }
    }
  });
  if (version >= 2) {
    const count = Math.floor(version / 7) + 2;
    const step = Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
    const spots = [6];
    for (let pos = size - 7; spots.length < count; pos -= step) spots.splice(1, 0, pos);
    spots.forEach((ay, i) => spots.forEach((ax, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === count - 1) || (i === count - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }));
  }
  const drawFormat = (mask) => {
    const value = mask; // medium error correction is 00
    let rem = value;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const format = ((value << 10) | rem) ^ 0x5412;
    const bit = (i) => ((format >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i += 1) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i += 1) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i += 1) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i += 1) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const info = (version << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const dark = ((info >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!fixed[y][x] && index < stream.length * 8) {
          grid[y][x] = ((stream[index >>> 3] >>> (7 - (index & 7))) & 1) === 1;
          index += 1;
        }
      }
    }
  }
  const MASKS = [
    (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  ];
  const masked = (mask) => {
    drawFormat(mask);
    return grid.map((row, y) => row.map((dark, x) => (fixed[y][x] ? dark : dark !== MASKS[mask](x, y))));
  };
  // Pick the mask with the fewest long runs, 2×2 blocks and dark/light imbalance (enough for any camera).
  const penalty = (matrix) => {
    let score = 0;
    let darkCount = 0;
    for (let y = 0; y < size; y += 1) {
      let rowRun = 1;
      let colRun = 1;
      for (let x = 0; x < size; x += 1) {
        if (matrix[y][x]) darkCount += 1;
        if (x > 0) {
          rowRun = matrix[y][x] === matrix[y][x - 1] ? rowRun + 1 : 1;
          if (rowRun === 5) score += 3; else if (rowRun > 5) score += 1;
          colRun = matrix[x][y] === matrix[x - 1][y] ? colRun + 1 : 1;
          if (colRun === 5) score += 3; else if (colRun > 5) score += 1;
        }
        if (x > 0 && y > 0 && matrix[y][x] === matrix[y][x - 1] && matrix[y][x] === matrix[y - 1][x] && matrix[y][x] === matrix[y - 1][x - 1]) score += 3;
      }
    }
    return score + Math.floor(Math.abs(darkCount * 20 - size * size * 10) / (size * size)) * 10;
  };
  let best = null;
  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = masked(mask);
    const score = penalty(matrix);
    if (!best || score < best.score) best = { matrix, score, mask };
  }
  drawFormat(best.mask);
  return best.matrix;
};
// Drawn as soft rounded dots with clay corner eyes, on the white card so every camera reads it.
const qrSvg = (text) => {
  const matrix = qrMatrix(text);
  if (!matrix) return '';
  const size = matrix.length;
  const inEye = (x, y) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  const dots = matrix.flatMap((row, y) => row.map((dark, x) => (dark && !inEye(x, y) ? `<rect x="${x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.32"/>` : ''))).join('');
  const eyes = [[0, 0], [size - 7, 0], [0, size - 7]].map(([x, y]) => `<rect class="qrEyeRing" x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="1.9"/><rect class="qrEye" x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.9"/>`).join('');
  return `<svg class="qrCode" viewBox="-2 -2 ${size + 4} ${size + 4}" role="img" aria-label="QR code for ${esc(text)}"><g class="qrDots">${dots}</g>${eyes}</svg>`;
};
const SHARE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/></svg>';
// Everyone shares the plain /join link (a fresh, empty Exodia). Only Marcus can put a name in it.
const shareCard = () => {
  const link = inviteLink(view.isAdmin ? view.shareName || '' : '');
  const named = view.isAdmin && Boolean((view.shareName || '').trim());
  return `<section class="card">
    ${view.isAdmin ? `<div class="row"><label class="sr" for="shareName">Their name</label><input id="shareName" class="pill noLine" style="flex:1;width:auto;text-align:left;font-weight:400;font-size:15px" autocomplete="off" placeholder="Their name" value="${esc(view.shareName || '')}" data-share-name></div>` : ''}
    <div class="row"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px">${esc(link)}</span><button class="textBtn" data-action="copy-invite">${view.copiedInvite ? 'Copied' : 'Copy'}</button><button class="textBtn shareBtn" data-action="share-invite" aria-label="Share">${SHARE_ICON}Share</button></div>
    ${view.isAdmin ? `<p class="shareNote">${named ? 'Opens Exodia with their name already in, so you know who it is in the dashboard.' : 'Add their name so the link opens with it and you know who it is. Without it, anyone who opens it gets an empty Exodia with no name.'}</p>` : ''}
    <div class="qrRow">${qrSvg(link)}<p class="qrNote">Point your phone camera here to open Exodia</p></div>
  </section>`;
};

// Every command, oldest at the top: what people sent (theirs on the left under their name), and your own change
// requests on the right with their orange /admin, the moment you send them, with how each is going.
const adminChat = () => {
  const runs = (state.claudeRuns || []).map((run) => ({ at: run.at, run }));
  const rows = (view.adminRows || []).map((row) => ({ at: row.at, row }));
  const items = [...rows, ...runs].sort((first, second) => first.at - second.at);
  if (!items.length) return view.adminRows ? '<p class="empty">No commands yet.</p>' : '<p class="empty">Loading every command…</p>';
  return items.map((item, index) => {
    const stamp = chatStamp(item.at, items[index - 1]?.at);
    if (item.row) return chatEntry({ ...item.row, stamp, theirs: !item.row.mine });
    return `<div class="chatItem">${stamp ? `<p class="chatTime">${stamp}</p>` : ''}<div class="bubbleIn"><span class="slashCmd">/admin</span> ${saidHtml(item.run.said)}</div><div class="bubbleOut"><p>${runStatus(item.run)}${item.run.url ? ` · <a href="${esc(item.run.url)}" target="_blank" rel="noopener">Watch Exodia</a>` : ''}</p></div></div>`;
  }).join('');
};
// Admin overview (always open) and the dashboard behind "Show dashboard": who uses Exodia, how much, what they tap
// and where it goes wrong. Your own profile is left out of the numbers.
const shortDay = (at) => (at ? new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');
const ago = (at) => {
  if (!at) return 'never';
  const days = Math.floor((Date.now() - at) / 86400000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : days < 30 ? `${days} days ago` : shortDay(at);
};
// "Today 14:32", "Yesterday 09:10", "3 Nov 18:20": when someone last used Exodia, to the minute.
const stamp = (at) => {
  if (!at) return 'never';
  const when = new Date(at);
  const time = when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const days = Math.round((new Date(todayIso()) - new Date(when.toISOString().slice(0, 10))) / 86400000);
  return `${days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : shortDay(at)} ${time}`;
};
// Real people: not you, and they did something (have a name, logged a day, or came back after the first open).
const DASH_FILTERS = [['real', 'Real people'], ['all', 'Everyone'], ['me', 'You']];
const isReal = (person) => !person.mine && Boolean(person.name || person.days > 0 || person.opens > 1 || person.sent > 0);
const ACTION_NAMES = { 'open-composer': 'Open the box', 'send': 'Send', 'mic': 'Mic', 'pick-trend': 'Pick a lift in Trends', 'range': 'Chart range', 'toggle-day': 'Open a day', 'edit-day': 'Edit a day', 'menu': 'Menu', 'slash-admin': 'Pick a / command', 'jump-session': 'Jump to a day' };
const actionName = (action) => ACTION_NAMES[action] || String(action || '').replace(/-/g, ' ').replace(/^./, (first) => first.toUpperCase());
const renderAdminStats = () => {
  const data = view.adminStats;
  if (!data) return view.adminLoading ? '<p class="empty">Loading the overview…</p>' : '';
  if (data.error) return `<p class="feedbackMeta"><span class="runFailed">Overview could not load: ${esc(data.error)}</span></p>`;
  const week = Date.now() - 7 * 86400000;
  const people = data.people.filter(isReal);
  const lastSeen = (person) => Math.max(person.lastOpen, person.lastSent, person.last ? new Date(`${person.last}T12:00`).getTime() : 0, person.joined);
  const active = people.filter((person) => person.lastOpen > week || person.lastSent > week || person.changedWeek > 0);
  const logging = people.filter((person) => person.days > 0);
  const sum = (key) => people.reduce((total, person) => total + (person[key] || 0), 0);
  const [sent, missed] = [sum('sent'), sum('missed')];
  const tile = (value, label, sub) => `<div class="tile"><p class="tileValue num">${value}</p><p class="tileLabel">${label}</p><p class="tileSub">${sub}</p></div>`;
  const overview = `<div class="tiles adminTiles">
      ${tile(people.length, 'Real people', `${data.people.filter((person) => !person.mine).length - people.length} empty, never used`)}
      ${tile(active.length, 'Active', 'Last 7 days')}
      ${tile(logging.length, 'Logging', `${people.length - logging.length} never logged`)}
      ${tile(sum('opensWeek'), 'Opens', 'Last 7 days')}
      ${tile(sum('changedWeek'), 'Days logged', 'Last 7 days')}
      ${tile(sent ? `${Math.round(((sent - missed) / sent) * 100)}%` : '–', 'AI understood', `${missed} of ${sent} missed`)}
    </div>`;
  if (!view.adminDashOpen) return `${overview}<button class="liftExpand" data-action="admin-dash" aria-expanded="false">Show dashboard${ICONS.chev}</button>`;
  const filter = view.dashFilter || 'real';
  const shown = data.people.filter((person) => (filter === 'me' ? person.mine : filter === 'real' ? isReal(person) : true));
  const sorted = [...shown].sort((first, second) => lastSeen(second) - lastSeen(first));
  const you = data.people.find((person) => person.mine);
  const list = (rows, label) => rows.length ? rows.map((row) => `<p class="dashRow"><span>${esc(label(row))}</span><span class="muted num">${row.n} · ${row.people} ${row.people === 1 ? 'person' : 'people'}</span></p>`).join('') : '<p class="empty">Nothing yet.</p>';
  return `${overview}<button class="liftExpand" data-action="admin-dash" aria-expanded="true">Hide dashboard${ICONS.chev}</button>
    <p class="section">People · last used first</p>
    <div class="segment full dashFilter" role="group" aria-label="Show">${DASH_FILTERS.map(([value, label]) => `<button class="segmentOption" data-action="dash-filter" data-filter="${value}" aria-pressed="${filter === value}">${label}</button>`).join('')}</div>
    ${you ? `<p class="note">You last used it ${stamp(lastSeen(you))}. Your row says You; it never counts in the numbers above.</p>` : ''}
    <div class="card dashCard">${sorted.map((person) => `<div class="dashPerson">
      <p class="dashRow"><b>${person.mine ? 'You' : esc(person.name || `No name · ${person.id}`)}</b><span class="muted num">${stamp(lastSeen(person))}</span></p>
      <p class="dashSub num">${person.days ? `${person.days} days logged${person.last ? `, last ${shortDay(new Date(`${person.last}T12:00`).getTime())}` : ''}` : 'Never logged'} · opened ${person.opensWeek} this week, ${person.opens} in all${person.sent ? ` · ${person.sent} ${person.sent === 1 ? 'note' : 'notes'}${person.missed ? `, ${person.missed} not understood` : ''}` : ''}${person.joined ? ` · joined ${shortDay(person.joined)}` : ''}</p>
    </div>`).join('')}</div>
    <p class="section">Errors · 30 days</p>
    <div class="card dashCard">${(data.errors || []).length ? data.errors.map((row) => `<p class="dashRow"><span>${esc(row.detail)}</span><span class="muted num">${row.n}× · ${row.people} ${row.people === 1 ? 'person' : 'people'} · ${stamp(row.last)}</span></p>`).join('') : '<p class="empty">No errors.</p>'}</div>
    <p class="section">Most tapped · 30 days</p>
    <div class="card dashCard">${list(data.taps, (row) => actionName(row.detail))}</div>
    <p class="section">Pages · 30 days</p>
    <div class="card dashCard">${list(data.views, (row) => (row.detail || 'home').replace(/^./, (first) => first.toUpperCase()))}</div>
    <p class="section">Where people got stuck</p>
    <div class="card dashCard">${data.stuck.length ? data.stuck.map((row) => `<p class="dashRow"><span>${esc(row.detail)}</span><span class="muted">${esc(row.who)} · ${ago(row.at)}</span></p>`).join('') : '<p class="empty">Nothing yet. Notes the AI didn\'t understand are also in Every command below.</p>'}</div>
    <p class="note">Opens, taps, pages and too-many-requests errors are counted from 6 November 2026. Real people leaves out you and links that were opened once and never used.</p>`;
};
const renderAdmin = () => {
  // Your change requests show straight away; only the server lists below wait for loading.
  if (!view.adminRows && !view.adminLoading) {
    view.adminLoading = true;
    loadAdmin().finally(() => {
      view.adminLoading = false;
    });
  }
  // Two tabs so nothing needs a long scroll: Chat (your requests and how each build goes, newest just above the box)
  // and Dashboard (who uses Exodia, invites, feedback). The box below always builds; sending switches to Chat.
  const tab = view.adminTab || 'chat';
  const tabs = `<div class="segment full adminTabs" role="tablist" aria-label="Admin">${[['chat', 'Chat'], ['dash', 'Dashboard']].map(([value, label]) => `<button class="segmentOption" role="tab" data-action="admin-tab" data-tab="${value}" aria-selected="${tab === value}" aria-pressed="${tab === value}">${label}</button>`).join('')}</div>`;
  return `<main class="page adminPage">
    <p class="eyebrow">Only visible to you</p>
    <div class="titleRow"><h1 class="title">Admin</h1>${(() => { const waiting = leftItems().length + newFeedback().length; return `<button class="adminLeftBtn" data-action="toggle-left" aria-expanded="${Boolean(view.leftOpen)}"><span class="leftDot${waiting ? '' : ' calm'}" aria-hidden="true"></span>${waiting ? `${waiting} waiting` : 'Nothing waiting'} · Developer</button>`; })()}</div>
    ${tabs}
    ${tab === 'chat' ? `
    ${buildingNow() || (state.claudeRuns || [])[0]?.status === 'sending' ? `<p class="adminWorking" role="status">${exoSpin}<span class="ghostText thinkLine">Exodia is on it…</span></p>` : ''}
    ${(state.claudeRuns || []).length || (view.adminRows || []).length ? '' : `<p class="feedbackLead">Say or type a change in the box below. It shows here at once, with how it's going.</p>`}
    ${(view.adminBuilders || []).length > 1 ? `<div class="builderRow"><span class="builderLabel">Built with</span><div class="segment full builderSwitch" role="group" aria-label="Claude account that builds">${view.adminBuilders.map((builder) => `<button class="segmentOption" data-action="pick-builder" data-slot="${builder.slot}" aria-pressed="${view.adminBuilder === builder.slot}"${builder.ready ? '' : ' disabled'}>Account ${builder.slot}${builder.ready ? '' : ' · not set up'}</button>`).join('')}</div></div><p class="feedbackMeta">If that account can't start, the other one is tried.</p>` : ''}
    ${view.adminError ? `<p class="feedbackMeta"><span class="runFailed">${esc(view.adminError)}</span> <button class="textBtn" data-action="admin-reload">Try again</button></p>` : ''}
    <div class="chat">${adminChat()}</div>` : `
    ${(view.beta || []).length ? `<p class="section">Beta</p><div class="betaList">${view.beta.map((feature) => `<div class="betaRow"><span class="betaText"><b>${esc(feature.title)}</b><small>${feature.launched ? 'Everyone has it' : 'Only you (and test profiles) see it'}</small></span><button class="fxBtn${feature.launched ? ' quiet' : ' clay'}" data-action="feature-launch" data-name="${esc(feature.name)}" data-launch="${feature.launched ? '0' : '1'}">${feature.launched ? 'Pull back' : 'Launch for everyone'}</button></div>`).join('')}</div>` : ''}
    <p class="section">Overview</p>
    ${renderAdminStats()}
    <p class="section">Invite someone</p>
    ${shareCard()}
    <p class="section">Feedback</p>
    ${(view.adminFeedback || []).map((item) => `<div class="feedbackRow">
      <p class="feedbackHead"><span class="${item.kind === 'bug' ? 'prPill' : 'prPill est'}">${item.kind === 'bug' ? 'Bug' : 'Idea'}</span><b>${esc(item.title)}</b></p>
      <p class="feedbackDetails">${esc(item.details)}</p>
      <p class="feedbackMeta">${esc(item.who)} · ${new Date(item.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
      <div class="feedbackStatus">${FEEDBACK_STATUS.map(([value, label]) => `<button class="chip" data-action="feedback-status" data-id="${item.id}" data-status="${value}" aria-pressed="${item.status === value}"><span class="chipFace">${label}</span></button>`).join('')}<button class="chip" data-action="feedback-claude" data-id="${item.id}"><span class="chipFace">Build it</span></button></div>
    </div>`).join('') || '<p class="empty">No feedback yet.</p>'}
    `}
  </main>`;
};

const aiInstructions = () => `You are helping me log my gym training in my Exodia app.

First, in one or two friendly sentences, tell me what you are going to do and what I need to give you. Then:

STEP 1. Get my training. It is the workouts I want logged, with dates if I know them (what I did, weights, sets, reps). It can be in any format: a message, a photo of a notebook, a spreadsheet, old notes. If my message below does not contain my training yet, do NOT stop: ask me "What training should I add? Paste it or describe it, any format works, and add the dates if you know them." Then wait for my answer.

STEP 2. Send it to Exodia.
- If you can send web requests: POST ${location.origin}/api/add with the header "x-exodia-key: ${syncState.profile}" and the JSON body {"text": "<my training in plain words, with dates>"}. Exodia reads any format and puts each workout on the right day. Tell me what it answers.
- If you cannot send web requests: rewrite my training as plain lines with a date on each, one workout per line, like these two:
2026-10-31: Bench Press 120x5, 120x5, 120x4
2026-11-02: Squat 160x5x3, Deadlift 200x3
Then tell me: "Copy these lines, open Exodia, paste them in the box at the bottom and send." Exodia adds them.

Keep the key above private; it gives full access to my log.

My training:
`;

const loadChanges = () => {
  if (view.changes || view.changesLoading) return;
  view.changesLoading = true;
  fetch('/changes.json').then((response) => response.json()).then((all) => {
    view.changes = all;
    if (view.route === 'you') renderSoon();
  }).catch(() => {
    view.changes = {};
  }).finally(() => {
    view.changesLoading = false;
  });
};
const renderYou = () => {
  loadChanges();
  return `<main class="page youPage">
    <p class="eyebrow">Settings</p>
    <h1 class="title nameTitle"><label for="name" class="sr">Your name</label><input id="name" class="titleInput" autocomplete="given-name" value="${esc(state.name || '')}" placeholder="Your name" data-name-input><label for="name" class="nameEdit" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg></label></h1>
    <section class="card setLinks">
      ${featureOn('friends') ? `<a class="row setLink" href="#/friends"><span>Friends</span><span class="muted">Add friends, what they see</span>${ICONS.chevRight}</a>` : ''}
      <a class="row setLink" href="#/feedback"><span>Help &amp; feedback</span><span class="muted">How it works, ideas, bugs</span>${ICONS.chevRight}</a>
      <a class="row setLink" href="#/import"><span>Add your data</span><span class="muted">Files from other apps</span>${ICONS.chevRight}</a>
    </section>
    <p class="section">Share Exodia</p>
    ${shareCard()}
    <p class="section">Add from any AI</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;font-size:15px">Let ChatGPT, Gemini or Claude add your training</span><button class="textBtn" data-action="copy-ai">${view.copiedAi ? 'Copied' : 'Copy instructions'}</button></div>
    </section>
    <p class="section">${view.isAdmin ? 'Your private link' : 'Sync'}</p>
    <section class="card">
      ${view.isAdmin ? `<div class="row"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px">${esc(profileLink())}</span><button class="textBtn" data-action="copy-link">${view.copied ? 'Copied' : 'Copy'}</button></div>
      <div class="row"><label class="sr" for="join-link">Link from another device</label><input id="join-link" class="pill noLine" style="flex:1;width:auto;text-align:left;font-weight:400;font-size:15px" placeholder="Paste a link from another device"><button class="textBtn" data-action="join-link">Use</button></div>` : ''}
      ${view.linkNote ? `<div class="row"><span class="muted" role="status" style="font-size:15px">${esc(view.linkNote)}</span></div>` : ''}
      <div class="row"><span style="flex:1">Synced</span><span class="muted">${view.syncFailed ? 'Offline, will retry' : view.syncedAt ? 'Up to date' : 'Connecting…'}</span></div>
    </section>
    <p class="note">${view.isAdmin ? 'Only for your own phone or computer: open it there once and your lifts are there. Don’t send it to anyone, it opens your log.' : 'Your lifts are saved online as you log them.'}</p>
    <p class="section">What's new${installedVersion() ? `<span class="sectionNote num">This device: v${installedVersion()}</span>` : ''}</p>
    <section class="card whatsNew">${view.changes ? Object.keys(view.changes).map(Number).sort((first, second) => second - first).slice(0, 6).map((version) => `<div class="whatsNewItem"><p class="whatsNewVersion num">v${version}</p><ul>${view.changes[version].map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>`).join('') : '<p class="empty">Loading…</p>'}</section>
    <p class="section">Backup</p>
    <section class="card">
      <div class="row"><button class="textBtn" data-action="export">Download a backup</button></div>
      <div class="row"><label class="textBtn" style="display:flex;align-items:center;cursor:pointer">Restore a backup<input type="file" accept="application/json" class="sr" data-action="import"></label></div>
    </section>
    <p class="section">Danger zone</p>
    <section class="card">
      <div class="row"><button class="textBtn dangerBtn" data-action="start-fresh">Start fresh on this device</button></div>
    </section>
    <p class="note">Nothing is deleted: your log stays saved online. This device just starts an empty Exodia; open your own link again to get your log back.</p>
  </main>`;
};

const desktopQuery = window.matchMedia('(min-width: 1024px)');

// Desktop: the prompt glow follows the mouse. Variables live on <html> so they survive re-renders.
// iOS ignores user-scalable=no in Safari, so block pinch zoom directly.
document.addEventListener('gesturestart', (event) => event.preventDefault());
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let glowFrame = 0;
document.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || !desktopQuery.matches || glowFrame) return;
  glowFrame = requestAnimationFrame(() => {
    glowFrame = 0;
    const box = document.querySelector('.dock .prompt')?.getBoundingClientRect();
    if (!box) return;
    const clamp = (value) => Math.max(-1, Math.min(1, value));
    const outside = Math.hypot(Math.max(box.left - event.clientX, 0, event.clientX - box.right), Math.max(box.top - event.clientY, 0, event.clientY - box.bottom));
    const root = document.documentElement.style;
    root.setProperty('--glowX', clamp((event.clientX - (box.left + box.width / 2)) / box.width).toFixed(3));
    root.setProperty('--glowY', clamp((event.clientY - (box.top + box.height / 2)) / box.height).toFixed(3));
    root.setProperty('--glowNear', Math.max(0, 1 - outside / 520).toFixed(3));
  });
}, { passive: true });
document.addEventListener('pointerleave', () => document.documentElement.style.setProperty('--glowNear', '0'));
// On a phone the same warm glow answers your finger: it lights up from where you touched the box, then settles to a
// calm glow while you type, and fades when you leave the box.
let touchGlowTimer = 0;
const setTouchGlow = (value) => document.documentElement.style.setProperty('--touchGlow', value);
document.addEventListener('pointerdown', (event) => {
  if (finePointer.matches && desktopQuery.matches) return;
  const prompt = event.target.closest?.('.dock .prompt');
  if (!prompt) return;
  const box = prompt.getBoundingClientRect();
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const root = document.documentElement.style;
  root.setProperty('--glowX', clamp((event.clientX - (box.left + box.width / 2)) / box.width).toFixed(3));
  root.setProperty('--glowY', clamp((event.clientY - (box.top + box.height / 2)) / box.height).toFixed(3));
  setTouchGlow('1');
  clearTimeout(touchGlowTimer);
  touchGlowTimer = setTimeout(() => setTouchGlow(document.activeElement?.id === 'draft' ? '0.55' : '0'), 900);
}, { passive: true });
document.addEventListener('focusout', (event) => {
  if (event.target.id !== 'draft') return;
  clearTimeout(touchGlowTimer);
  setTouchGlow('0');
});

// ISO week number (weeks start on Monday), shown under the weekly volume bars.
const isoWeek = (iso) => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  return Math.ceil(((date - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
};

// Every training day, GitHub style: one square per day, a column per week (Monday on top), newest on the right.
// Darker orange is a heavier day (tonnage, in four steps by your own days), Exodia blue a day with a PR.
// It scrolls back to your first session; tap a day to open it.
const calendarDays = () => remember('calendar', () => {
  const days = new Map();
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    // The one PR rule (prKind, the same as the badges): real lifts only, never an estimate or RPE.
    const pr = session.exercises.some((exercise) => validSets(exercise).some((set) => prKind(exercise.name, session.date, set)));
    const known = days.get(session.date);
    days.set(session.date, { volume: (known?.volume || 0) + sessionVolume(session), pr: Boolean(known?.pr || pr) });
  }
  // Four shades by your own heavy and light days, so it reads the same for a beginner and for you.
  const volumes = [...days.values()].map((day) => day.volume).filter(Boolean).sort((first, second) => first - second);
  const cut = (share) => volumes[Math.floor((volumes.length - 1) * share)] || 0;
  return { days, steps: [cut(0.25), cut(0.5), cut(0.75)] };
});
// Every session, GitHub style: the last 12 months, or (Show every year) one strip per year back to your first session.
// Clay by the day's tonnage, a PR day in Exodia blue, a day you hit Exodia an empty grey square outlined in blue.
// How much stronger a year made you, by your SBD total: squat + bench + deadlift. Each lift counts its best set of the
// year: a real single as it is, otherwise what the weight and reps add up to (240 × 3 ≈ 254). RPE never counts, so
// 240 at RPE 7 is 240. A lift you didn't test that year keeps last year's number (as do sets under 70% of it, like an
// empty bar), so the total only moves on what you actually lifted. This year counts up to today.
const sbdYears = () => remember('sbdYears', () => {
  const tops = new Map();
  for (const session of state.sessions) {
    if (session.date > todayIso()) continue;
    const year = Number(session.date.slice(0, 4));
    for (const exercise of session.exercises) {
      const lift = SBD.find((name) => countsFor(name).includes(exercise.name));
      if (!lift) continue;
      for (const set of validSets(exercise)) {
        const [kg, reps] = [Number(set.kg), Number(set.reps)];
        if (set.warmup || !(kg > 0) || !(reps > 0) || reps > 10) continue;
        const key = `${year}|${lift}`;
        tops.set(key, Math.max(tops.get(key) || 0, estimate(kg, reps)));
      }
    }
  }
  const years = new Map();
  const carried = {};
  const first = Math.min(...[...tops.keys()].map((key) => Number(key.split('|')[0])));
  for (let year = first; year <= Number(todayIso().slice(0, 4)); year += 1) {
    const tested = SBD.filter((lift) => tops.get(`${year}|${lift}`) >= (carried[lift] || 0) * 0.7);
    for (const lift of tested) carried[lift] = tops.get(`${year}|${lift}`);
    if (!tested.length || SBD.some((lift) => !carried[lift])) continue;
    years.set(year, { total: Math.round(SBD.reduce((sum, lift) => sum + carried[lift], 0)), lifts: SBD.map((lift) => Math.round(carried[lift])), tested });
  }
  return years;
});
const yearStrength = (year) => {
  const now = sbdYears().get(year);
  if (!now) return null;
  let before = null;
  for (let earlier = year - 1; !before && earlier >= year - 50; earlier -= 1) before = sbdYears().get(earlier) ? { ...sbdYears().get(earlier), year: earlier } : null;
  return { ...now, change: before ? Math.round((now.total / before.total - 1) * 100) : null, since: before?.year };
};
// Days with a gym visit; a visit taken out stays as { removed: true } so syncing never brings it back.
const visitDates = () => Object.keys(state.visits || {}).filter((date) => !state.visits[date]?.removed);
const CAL_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const renderCalendar = () => {
  if (!state.sessions.length && !visitDates().length) return '';
  const { days, steps } = calendarDays();
  const today = todayIso();
  const monday = (iso) => addDays(iso, -((parseIso(iso).getDay() + 6) % 7));
  const first = [...days.keys(), ...visitDates()].sort()[0];
  const exodiaDays = new Set(exodiaHistory().days || []);
  const cell = (date, from = '', to = today) => {
    if (date > to || date < from) return '<i class="calDay future"></i>';
    const day = days.get(date);
    const visit = visitOf(date);
    if (!day && visit) return `<button class="calDay shade${visitShade(visit)} visit${view.visitOpen === date ? ' picked' : ''}" data-action="visit-day" data-date="${date}" title="${dayLabel(date)} · ${esc(visitLine(visit))}" aria-label="${dayLabel(date)}, ${esc(visitLine(visit))}, nothing logged"></button>`;
    if (!day) return `<i class="calDay" title="${dayLabel(date)}"></i>`;
    const shade = day.volume > steps[2] ? 4 : day.volume > steps[1] ? 3 : day.volume > steps[0] ? 2 : 1;
    const hit = exodiaDays.has(date);
    const text = `${dayLabel(date)} · ${tonnes(day.volume)}${day.pr ? ' · PR' : ''}${hit ? ' · Exodia' : ''}`;
    return `<button class="calDay ${hit ? 'exodia' : `shade${shade}${day.pr ? ' pr' : ''}`}${view.visitOpen === date ? ' picked' : ''}" data-action="visit-day" data-date="${date}" title="${text}" aria-label="${text}, open"></button>`;
  };
  const baseKey = '<p class="calKey"><span>Lighter</span><i class="calDay shade1"></i><i class="calDay shade2"></i><i class="calDay shade3"></i><i class="calDay shade4"></i><span>Heavier</span><i class="calDay pr calKeyPr"></i><span>PR</span><i class="calDay exodia calKeyPr"></i><span>Exodia</span></p>';
  const key = baseKey;
  const all = Boolean(view.calAll);
  const since = addDays(today, -364);
  // Days at the gym: every logged day plus every gym visit read from your gym app, each day once.
  const gymDays = [...new Set([...days.keys(), ...visitDates()])];
  const lastYear = gymDays.filter((date) => date >= since && date <= today).length;
  const ever = gymDays.filter((date) => date <= today).length;
  const count = all ? `${ever} since ${CAL_MONTHS[parseIso(first).getMonth()]} ${first.slice(0, 4)}` : `${lastYear} in the last 12 months`;
  // One strip of weeks, the original look: a month row (the year where January starts), then Monday to Sunday;
  // it scrolls back from its newest week.
  const strip = (from, to, label, fit = 0) => {
    const weeks = [];
    for (let week = monday(from); week <= to; week = addDays(week, 7)) weeks.push(week);
    // "Show every year": the whole stretch fits the width (no sideways scroll), each week a column of equal share.
    if (fit) {
      const columns = weeks.map((week, index) => {
        // A month is named over the week its first day falls in (the first column always names the half's first month).
        const month = parseIso(index === 0 ? from : addDays(week, 6)).getMonth();
        const newMonth = index === 0 || (index > 1 && addDays(week, 6) <= to && parseIso(addDays(weeks[index - 1], 6)).getMonth() !== month);
        return `<span class="calMonth">${newMonth ? CAL_MONTHS[month] : ''}</span>${[0, 1, 2, 3, 4, 5, 6].map((offset) => cell(addDays(week, offset), from, to < today ? to : today)).join('')}`;
      }).join('');
      return `<div class="calFit" style="--weeks:${fit}"><div class="calGrid" role="group" aria-label="${label}">${columns}</div></div>`;
    }
    const columns = weeks.map((week, index) => {
      const date = parseIso(week);
      const newMonth = index === 0 || parseIso(weeks[index - 1]).getMonth() !== date.getMonth();
      const month = newMonth ? (date.getMonth() === 0 ? week.slice(0, 4) : CAL_MONTHS[date.getMonth()]) : '';
      // A narrow empty column where a new year starts, so you feel the year turn as you scroll back.
      const newYear = index > 0 && parseIso(weeks[index - 1]).getFullYear() !== date.getFullYear();
      return `${newYear ? '<span class="calYearGap" aria-hidden="true"></span>' : ''}<span class="calMonth">${month}</span>${[0, 1, 2, 3, 4, 5, 6].map((offset) => cell(addDays(week, offset), from, to < today ? to : today)).join('')}`;
    }).join('');
    return `<div class="calWrap">
        <div class="calWeekdays" aria-hidden="true"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>
        <div class="calScroll"><div class="calGrid" role="group" aria-label="${label}">${columns}</div></div>
      </div>`;
  };
  let body;
  // The 12-month view still scrolls back to your first session; "Show every year" lays the years out one under another.
  // The day you tap opens right under the calendar (under its own year when every year shows), not on another page.
  const picked = view.visitOpen;
  if (!all) body = `${strip(first < since ? first : since, today, 'Training days, newest on the right; scroll back for earlier years')}${picked ? visitCard() : ''}`;
  else {
    const years = [];
    for (let year = Number(today.slice(0, 4)); year >= Number(first.slice(0, 4)); year -= 1) years.push(year);
    body = `<div class="calYears${view.calEnter ? ' enter' : ''}">${years.map((year) => {
      const [from, to] = [`${year}-01-01`, `${year}-12-31` < today ? `${year}-12-31` : today];
      const sessions = gymDays.filter((date) => date >= from && date <= to).length;
      const lifted = liftedBetween(from, to);
      const stronger = yearStrength(year);
      const sign = (change) => (change > 0 ? '+' : change < 0 ? '−' : '±');
      const versus = stronger ? ` · <span title="${SBD.map((lift, index) => `${lift} ${stronger.lifts[index]}${stronger.tested.includes(lift) ? '' : ' (from before)'}`).join(', ')}${stronger.change === null ? '' : `; against ${stronger.since}`}">SBD ${stronger.total} kg${stronger.change === null ? '' : `, <span class="calChange${stronger.change > 0 ? ' up' : ''}">${sign(stronger.change)}${Math.abs(stronger.change)}%</span>`}</span>` : '';
      // Phone: the year in two rows, newest on top like everything else (July–December, then January–June); computer:
      // one row. Every dot on screen.
      const rows = desktopQuery.matches ? strip(from, `${year}-12-31`, `Training days in ${year}`, 53) : `${strip(`${year}-07-01`, `${year}-12-31`, `Training days in ${year}, July to December`, 27)}${strip(from, `${year}-06-30`, `Training days in ${year}, January to June`, 27)}`;
      return `<div class="calYearBlock"><p class="calYearHead"><span>${year}</span><span class="calCount num">${sessions} ${sessions === 1 ? 'session' : 'sessions'} · ${tonnes(lifted)} lifted${versus}</span></p>${rows}</div>${picked && picked.startsWith(String(year)) ? visitCard() : ''}`;
    }).join('')}</div>`;
  }
  return `<p class="section calHead">Every session <span class="calCount num">${count} · ${tonnes(liftedBetween(`${todayIso().slice(0, 4)}-01-01`, todayIso()))} in ${todayIso().slice(0, 4)}</span></p>
    <section class="card calCard">
      ${(() => {
        const timed = Object.values(state.visits || {}).map((visit) => Number(visit?.minutes) || 0).filter((minutes) => minutes > 0);
        const average = timed.length ? Math.round(timed.reduce((sum, minutes) => sum + minutes, 0) / timed.length) : 0;
        const length = `${Math.floor(average / 60) ? `${Math.floor(average / 60)}h ` : ''}${average % 60}m`;
        return `<div class="calStats"><p><b class="num">${ever}</b> <span>sessions since ${first.slice(0, 4)}</span></p>${average ? `<p><b class="num">${length}</b> <span>avg at the gym</span></p>` : ''}</div>`;
      })()}
      ${body}
      ${key}
      ${first < since || all ? `<button class="liftExpand calMore" data-action="cal-all" aria-expanded="${all}">${all ? 'Show the last 12 months' : 'Show every year'}${ICONS.chev}</button>` : ''}
    </section>`;
};

const renderVolume = () => {
  // Calendar weeks, Monday to Sunday, so each bar matches its week number. The last bar is the current week so far.
  const monday = addDays(todayIso(), -((new Date(`${todayIso()}T12:00:00Z`).getUTCDay() + 6) % 7));
  const weeks = Array.from({ length: 6 }, (unused, index) => {
    const start = addDays(monday, -7 * (5 - index));
    const end = addDays(start, 6);
    const volume = state.sessions.filter((session) => session.date >= start && session.date <= end).reduce((sum, session) => sum + sessionVolume(session), 0);
    return { end, volume };
  });
  const maxVolume = Math.max(1, ...weeks.map((week) => week.volume));
  // Average of the finished weeks that have training; the current week is still filling up.
  const active = weeks.slice(0, 5).filter((week) => week.volume > 0);
  const average = active.length >= 2 ? active.reduce((sum, week) => sum + week.volume, 0) / active.length : 0;
  // Bars fill up to 78% of the chart height (the rest is room for the value labels), so the average line uses the same scale.
  const averageLine = average ? `<i class="avgLine" style="bottom:${((average / maxVolume) * 78).toFixed(1)}%" aria-hidden="true"><span class="num">avg ${(average / 1000).toFixed(1)}</span></i>` : '';
  return `<p class="section">Volume per week · tonnes</p>
    <section class="card weekChart" style="padding:14px 16px">
      <div class="weekBars" role="group" aria-label="Volume for the last 6 weeks">${weeks.map((week, index) => `<button class="weekBar" data-action="pick-week" data-index="${index}" aria-pressed="${(view.volumeWeek ?? 5) === index}" aria-label="Week ${isoWeek(week.end)}, ${tonnes(week.volume)}"><span class="barValue num">${week.volume ? (week.volume / 1000).toFixed(1) : ''}</span><div style="height:${Math.round((week.volume / maxVolume) * 78)}%"></div></button>`).join('')}${averageLine}</div>
      <div class="weekLabels num" aria-hidden="true">${weeks.map((week, index) => `<span${(view.volumeWeek ?? 5) === index ? ' class="on"' : ''}>W${isoWeek(week.end)}</span>`).join('')}</div>
      <div class="axis num" style="margin-top:6px"><span>${(view.volumeWeek ?? 5) === 5 ? `This week · W${isoWeek(weeks[5].end)}` : `Week ${isoWeek(weeks[view.volumeWeek ?? 5].end)}`}</span><span>${tonnes(weeks[view.volumeWeek ?? 5].volume)}</span></div>
    </section>`;
};

// Strength levels (Strength Level standards: one-rep max by bodyweight and sex, Beginner → Elite) as a spider web.
// Each corner is a lift, placed by your best estimated 1RM of the last 12 months. The rings are the levels, the
// outer solid ring is Elite; anyone past Elite reaches into the ring beyond it. STANDARDS holds Strength Level's
// one-rep max tables by bodyweight: [bodyweight, Beginner, Novice, Intermediate, Advanced, Elite] in kg (pull-ups:
// reps; Strength Level lists "under 1" for the lowest levels, here 0.5). Between two rows it is the straight line
// between them. Source: strengthlevel.com/strength-standards (community lifts 2014–2026; women's pull-ups have
// one row for every bodyweight).
const STANDARDS = {
  'squat': {
    male: [[60, 49, 71, 98, 129, 162], [80, 75, 101, 132, 168, 206], [90, 87, 115, 148, 186, 226], [100, 98, 128, 163, 203, 244], [110, 109, 140, 177, 218, 261], [120, 120, 152, 191, 233, 278], [140, 140, 175, 215, 261, 307]],
    female: [[50, 26, 42, 63, 88, 116], [60, 32, 49, 72, 99, 129], [70, 37, 56, 80, 109, 140], [80, 42, 62, 88, 117, 149], [90, 47, 68, 94, 125, 158], [100, 52, 74, 101, 132, 166], [120, 60, 83, 112, 145, 181]]
  },
  'bench-press': {
    male: [[60, 37, 53, 72, 95, 119], [80, 56, 75, 98, 124, 151], [90, 65, 85, 109, 137, 165], [100, 73, 95, 120, 149, 179], [110, 81, 104, 131, 160, 191], [120, 89, 113, 140, 171, 203], [140, 104, 129, 158, 191, 225]],
    female: [[50, 14, 25, 40, 58, 79], [60, 19, 31, 47, 66, 88], [70, 22, 36, 53, 74, 96], [80, 26, 40, 59, 80, 104], [90, 30, 45, 64, 86, 111], [100, 33, 49, 69, 92, 117], [120, 39, 56, 77, 102, 128]]
  },
  'deadlift': {
    male: [[60, 61, 86, 117, 153, 191], [80, 89, 119, 155, 196, 239], [90, 102, 134, 172, 215, 260], [100, 114, 148, 188, 232, 279], [110, 126, 161, 203, 249, 298], [120, 137, 174, 217, 265, 315], [140, 159, 198, 243, 294, 346]],
    female: [[50, 34, 52, 76, 105, 136], [60, 40, 60, 86, 116, 149], [70, 46, 68, 95, 126, 160], [80, 52, 74, 102, 135, 170], [90, 57, 80, 109, 143, 180], [100, 61, 86, 116, 151, 188], [120, 70, 96, 128, 164, 203]]
  },
  'shoulder-press': {
    male: [[60, 21, 32, 45, 62, 79], [80, 33, 46, 62, 81, 101], [90, 38, 53, 70, 90, 111], [100, 44, 59, 77, 98, 120], [110, 49, 65, 84, 105, 128], [120, 54, 71, 90, 113, 136], [140, 63, 81, 102, 126, 151]],
    female: [[50, 10, 17, 27, 38, 51], [60, 12, 20, 31, 43, 57], [70, 15, 23, 34, 47, 62], [80, 17, 26, 37, 51, 66], [90, 19, 28, 40, 54, 70], [100, 21, 31, 43, 58, 74], [120, 24, 35, 48, 64, 80]]
  },
  'bent-over-row': {
    male: [[60, 31, 46, 65, 87, 111], [80, 48, 66, 88, 114, 141], [90, 56, 75, 99, 125, 154], [100, 63, 84, 108, 136, 166], [110, 70, 92, 118, 147, 178], [120, 77, 100, 127, 157, 188], [140, 90, 114, 143, 175, 208]],
    female: [[50, 15, 25, 38, 54, 72], [60, 18, 29, 43, 59, 78], [70, 20, 32, 46, 64, 83], [80, 23, 35, 50, 68, 87], [90, 25, 37, 53, 71, 91], [100, 27, 40, 56, 74, 95], [120, 30, 44, 61, 80, 102]]
  },
  'incline-bench-press': {
    male: [[60, 32, 45, 62, 82, 103], [80, 50, 66, 87, 109, 134], [90, 58, 76, 98, 122, 147], [100, 66, 86, 108, 134, 160], [110, 74, 94, 118, 145, 172], [120, 82, 103, 128, 155, 184], [140, 96, 119, 145, 175, 205]],
    female: [[50, 11, 20, 33, 49, 67], [60, 14, 25, 39, 56, 76], [70, 18, 29, 45, 63, 84], [80, 21, 34, 50, 69, 91], [90, 24, 38, 55, 75, 97], [100, 28, 42, 59, 80, 104], [120, 33, 49, 68, 90, 114]]
  },
  'pull-ups': {
    male: [[60, 0.5, 7, 14, 23, 33], [80, 1, 7, 13, 21, 29], [90, 1, 7, 12, 19, 27], [100, 0.5, 6, 11, 18, 25], [110, 0.5, 6, 10, 17, 23], [120, 0.5, 5, 10, 16, 22], [140, 0.5, 4, 9, 13, 19]],
    female: [[50, 0.5, 0.5, 6, 13, 22], [60, 0.5, 0.5, 6, 12, 20], [70, 0.5, 0.5, 5, 11, 18], [80, 0.5, 0.5, 5, 10, 16], [90, 0.5, 0.5, 4, 9, 14], [100, 0.5, 0.5, 3, 8, 13], [120, 0.5, 0.5, 1, 6, 10]]
  },
  // Weighted pull-ups: the weight added on top of your bodyweight (minus = assisted), Strength Level's "1RM Weight"
  // table on the pull-ups page (read 6 November 2026). A pull-up's level is the better of its reps and its added weight.
  'pull-ups-added': {
    male: [[60, -4, 11, 27, 45, 64], [80, -2, 14, 33, 54, 75], [90, -2, 15, 35, 57, 79], [100, -3, 15, 36, 59, 82], [110, -4, 15, 37, 60, 84], [120, -6, 14, 36, 61, 85], [140, -10, 11, 35, 60, 86]],
    female: [[50, -14, -4, 8, 21, 35], [60, -16, -4, 9, 23, 38], [70, -18, -5, 9, 24, 40], [80, -20, -7, 8, 24, 41], [90, -23, -9, 7, 24, 41], [100, -26, -12, 5, 22, 40], [120, -34, -18, -1, 18, 37]]
  },
  // Other lifts, only to rank "your most impressive lift" (not on the web): the same Strength Level tables, read from
  // strengthlevel.com/strength-standards/<key>/kg on 5 November 2026. Dumbbell lifts are per dumbbell.
  'sumo-deadlift': { male: [[60, 72, 100, 134, 174, 216], [80, 102, 135, 174, 218, 265], [90, 116, 150, 192, 238, 287], [100, 128, 165, 208, 256, 307], [110, 141, 179, 224, 273, 325], [120, 152, 192, 238, 289, 343], [140, 174, 216, 265, 319, 375]], female: [[50, 43, 62, 87, 115, 146], [60, 47, 68, 93, 122, 154], [70, 51, 73, 99, 129, 161], [80, 55, 77, 104, 135, 168], [90, 58, 81, 108, 140, 173], [100, 61, 84, 112, 144, 179], [120, 67, 91, 120, 153, 188]] },
  'front-squat': { male: [[60, 40, 57, 79, 104, 130], [80, 59, 79, 104, 133, 163], [90, 68, 90, 116, 146, 177], [100, 76, 99, 127, 158, 190], [110, 84, 108, 137, 169, 203], [120, 91, 117, 147, 180, 215], [140, 106, 133, 165, 200, 236]], female: [[50, 26, 39, 54, 72, 91], [60, 31, 44, 60, 79, 99], [70, 35, 48, 65, 85, 106], [80, 38, 53, 70, 90, 112], [90, 41, 56, 75, 95, 118], [100, 44, 60, 79, 100, 123], [120, 50, 66, 86, 108, 132]] },
  'romanian-deadlift': { male: [[60, 43, 65, 93, 127, 163], [80, 65, 92, 125, 163, 203], [90, 75, 104, 139, 179, 221], [100, 85, 115, 152, 194, 238], [110, 95, 126, 164, 208, 254], [120, 104, 137, 176, 221, 268], [140, 121, 156, 198, 245, 295]], female: [[50, 27, 42, 61, 84, 109], [60, 31, 47, 67, 90, 116], [70, 34, 51, 71, 96, 122], [80, 37, 54, 75, 100, 128], [90, 40, 57, 79, 105, 132], [100, 42, 60, 83, 109, 137], [120, 46, 65, 89, 116, 145]] },
  'hip-thrust': { male: [[60, 32, 63, 107, 163, 227], [80, 56, 96, 149, 213, 285], [90, 68, 111, 168, 236, 311], [100, 80, 126, 186, 257, 335], [110, 91, 140, 203, 277, 358], [120, 102, 154, 219, 295, 379], [140, 123, 179, 249, 330, 419]], female: [[50, 30, 56, 92, 137, 187], [60, 35, 63, 100, 147, 199], [70, 39, 69, 108, 155, 209], [80, 43, 74, 114, 163, 218], [90, 47, 78, 120, 170, 226], [100, 50, 83, 125, 177, 234], [120, 57, 91, 135, 188, 247]] },
  'hip-abduction': { male: [[60, 28, 50, 79, 115, 156], [80, 38, 63, 95, 135, 179], [90, 43, 69, 103, 143, 188], [100, 47, 74, 109, 151, 197], [110, 51, 79, 115, 158, 205], [120, 55, 84, 121, 165, 213], [140, 62, 92, 131, 177, 227]], female: [[50, 23, 41, 65, 93, 126], [60, 26, 45, 69, 99, 132], [70, 29, 48, 73, 103, 137], [80, 31, 50, 76, 107, 142], [90, 33, 53, 79, 111, 146], [100, 34, 55, 82, 114, 150], [120, 38, 59, 87, 120, 157]] },
  'sled-leg-press': { male: [[60, 71, 115, 173, 242, 319], [80, 109, 162, 230, 309, 395], [90, 127, 184, 255, 338, 429], [100, 144, 205, 280, 366, 460], [110, 160, 224, 302, 392, 489], [120, 176, 243, 324, 417, 516], [140, 206, 278, 364, 462, 567]], female: [[50, 39, 73, 122, 183, 252], [60, 49, 87, 140, 204, 277], [70, 58, 100, 155, 223, 299], [80, 67, 111, 170, 240, 319], [90, 76, 122, 183, 256, 337], [100, 83, 132, 195, 270, 353], [120, 98, 150, 217, 296, 383]] },
  'leg-extension': { male: [[60, 36, 57, 85, 119, 156], [80, 48, 72, 103, 140, 180], [90, 53, 79, 111, 149, 191], [100, 58, 85, 119, 158, 201], [110, 63, 91, 126, 166, 209], [120, 68, 97, 132, 173, 218], [140, 76, 107, 144, 187, 233]], female: [[50, 19, 34, 55, 80, 109], [60, 22, 38, 59, 86, 115], [70, 24, 41, 64, 91, 121], [80, 27, 44, 67, 95, 126], [90, 29, 47, 71, 99, 131], [100, 31, 49, 74, 103, 135], [120, 34, 54, 79, 109, 142]] },
  'seated-leg-curl': { male: [[60, 29, 45, 67, 94, 123], [80, 39, 58, 83, 112, 144], [90, 44, 64, 90, 120, 152], [100, 48, 69, 96, 127, 161], [110, 52, 74, 102, 134, 168], [120, 56, 79, 107, 140, 175], [140, 63, 88, 118, 152, 188]], female: [[50, 17, 28, 43, 62, 83], [60, 19, 31, 47, 67, 88], [70, 21, 34, 51, 70, 93], [80, 23, 36, 53, 74, 97], [90, 25, 39, 56, 77, 100], [100, 26, 41, 59, 80, 103], [120, 29, 44, 63, 85, 109]] },
  'lat-pulldown': { male: [[60, 35, 50, 69, 90, 113], [80, 47, 64, 85, 108, 133], [90, 52, 70, 92, 116, 142], [100, 57, 76, 98, 123, 150], [110, 62, 81, 104, 130, 157], [120, 66, 86, 110, 136, 164], [140, 74, 95, 120, 148, 177]], female: [[50, 20, 30, 42, 56, 72], [60, 23, 33, 46, 60, 76], [70, 25, 36, 49, 64, 81], [80, 27, 38, 52, 68, 85], [90, 29, 41, 55, 71, 88], [100, 31, 43, 57, 74, 91], [120, 34, 47, 62, 79, 97]] },
  'dumbbell-bench-press': { male: [[60, 13, 20, 30, 42, 55], [80, 19, 28, 40, 53, 68], [90, 22, 32, 44, 58, 74], [100, 25, 36, 48, 63, 79], [110, 28, 39, 52, 68, 84], [120, 31, 42, 56, 72, 89], [140, 36, 48, 63, 80, 97]], female: [[50, 5, 10, 16, 25, 34], [60, 7, 12, 19, 28, 38], [70, 8, 14, 21, 30, 41], [80, 9, 15, 23, 33, 44], [90, 10, 17, 25, 35, 46], [100, 12, 18, 27, 37, 48], [120, 14, 21, 30, 41, 53]] },
  'incline-dumbbell-bench-press': { male: [[60, 14, 21, 29, 39, 49], [80, 22, 29, 39, 50, 62], [90, 25, 33, 44, 55, 68], [100, 28, 37, 48, 60, 73], [110, 31, 41, 52, 65, 78], [120, 34, 44, 56, 69, 83], [140, 40, 51, 63, 77, 91]], female: [[50, 6, 10, 16, 23, 31], [60, 7, 12, 19, 26, 35], [70, 9, 14, 21, 29, 38], [80, 10, 16, 23, 31, 41], [90, 12, 18, 25, 34, 43], [100, 13, 19, 27, 36, 46], [120, 15, 22, 30, 40, 50]] },
  'barbell-curl': { male: [[60, 15, 24, 36, 50, 66], [80, 22, 33, 46, 63, 80], [90, 25, 36, 51, 68, 87], [100, 28, 40, 55, 73, 92], [110, 31, 44, 60, 78, 97], [120, 34, 47, 63, 82, 102], [140, 39, 53, 71, 90, 111]], female: [[50, 6, 12, 20, 31, 43], [60, 8, 14, 23, 34, 47], [70, 9, 16, 26, 37, 51], [80, 11, 18, 28, 40, 54], [90, 12, 20, 30, 43, 57], [100, 13, 21, 32, 45, 59], [120, 15, 24, 36, 49, 64]] },
  'dumbbell-curl': { male: [[60, 6, 11, 18, 26, 36], [80, 8, 14, 22, 32, 42], [90, 9, 16, 24, 34, 45], [100, 11, 17, 26, 36, 48], [110, 12, 19, 28, 38, 50], [120, 13, 20, 29, 40, 52], [140, 15, 22, 32, 44, 56]], female: [[50, 3, 6, 11, 16, 22], [60, 4, 7, 12, 18, 24], [70, 4, 8, 13, 19, 26], [80, 5, 9, 14, 20, 27], [90, 6, 10, 15, 22, 29], [100, 6, 10, 16, 23, 30], [120, 7, 12, 18, 25, 32]] },
  'hammer-curl': { male: [[60, 7, 12, 18, 26, 34], [80, 11, 16, 24, 33, 42], [90, 12, 19, 27, 36, 46], [100, 14, 21, 29, 39, 49], [110, 16, 23, 31, 41, 52], [120, 17, 25, 34, 44, 55], [140, 20, 28, 38, 49, 61]], female: [[50, 4, 7, 11, 15, 20], [60, 5, 8, 12, 17, 22], [70, 6, 9, 13, 18, 24], [80, 6, 10, 14, 19, 25], [90, 7, 10, 15, 20, 26], [100, 7, 11, 16, 22, 28], [120, 9, 12, 17, 23, 30]] },
  'tricep-pushdown': { male: [[60, 14, 26, 43, 64, 89], [80, 22, 36, 56, 80, 107], [90, 25, 41, 62, 87, 115], [100, 29, 46, 67, 93, 122], [110, 32, 50, 72, 99, 129], [120, 35, 54, 77, 105, 135], [140, 41, 61, 86, 115, 147]], female: [[50, 7, 14, 24, 38, 53], [60, 9, 17, 28, 42, 59], [70, 11, 19, 31, 46, 63], [80, 12, 22, 34, 50, 67], [90, 14, 24, 37, 53, 71], [100, 16, 26, 40, 56, 75], [120, 19, 30, 44, 62, 81]] },
  'hack-squat': { male: [[60, 41, 73, 117, 171, 231], [80, 63, 102, 152, 213, 280], [90, 74, 115, 168, 232, 302], [100, 84, 127, 183, 249, 321], [110, 93, 139, 197, 265, 340], [120, 102, 150, 210, 281, 357], [140, 119, 171, 235, 309, 389]], female: [[50, 19, 43, 78, 124, 176], [60, 24, 50, 87, 135, 190], [70, 28, 56, 95, 145, 202], [80, 32, 62, 102, 154, 212], [90, 36, 67, 109, 162, 221], [100, 40, 72, 115, 169, 230], [120, 46, 80, 126, 182, 245]] },
  'close-grip-bench-press': { male: [[60, 35, 49, 66, 86, 107], [80, 55, 72, 93, 116, 140], [90, 64, 83, 105, 129, 155], [100, 73, 93, 116, 142, 169], [110, 82, 103, 127, 154, 182], [120, 90, 112, 137, 165, 194], [140, 106, 129, 156, 186, 217]], female: [[50, 16, 26, 39, 55, 72], [60, 20, 31, 46, 63, 82], [70, 24, 37, 52, 70, 90], [80, 28, 41, 58, 77, 97], [90, 32, 46, 63, 83, 104], [100, 36, 50, 68, 88, 110], [120, 42, 58, 77, 99, 122]] },
  'dumbbell-lateral-raise': { male: [[60, 3, 7, 13, 20, 29], [80, 5, 10, 16, 25, 34], [90, 6, 11, 18, 27, 37], [100, 7, 12, 19, 28, 39], [110, 8, 13, 21, 30, 40], [120, 8, 14, 22, 32, 42], [140, 10, 16, 25, 34, 46]], female: [[50, 3, 5, 8, 12, 16], [60, 3, 6, 9, 13, 17], [70, 3, 6, 9, 14, 18], [80, 4, 6, 10, 14, 19], [90, 4, 7, 10, 15, 20], [100, 4, 7, 11, 15, 20], [120, 5, 8, 12, 16, 21]] },
  'machine-calf-raise': { male: [[60, 31, 63, 110, 168, 236], [80, 49, 88, 141, 207, 282], [90, 57, 99, 155, 224, 302], [100, 65, 110, 169, 240, 320], [110, 73, 120, 181, 255, 337], [120, 81, 129, 193, 269, 353], [140, 95, 147, 214, 294, 382]], female: [[50, 16, 40, 75, 121, 176], [60, 21, 47, 84, 133, 190], [70, 25, 53, 93, 144, 203], [80, 30, 59, 101, 154, 215], [90, 33, 65, 108, 163, 225], [100, 37, 70, 115, 171, 234], [120, 44, 79, 126, 185, 251]] },
  'lying-tricep-extension': { male: [[60, 12, 20, 31, 45, 60], [80, 20, 30, 43, 59, 76], [90, 24, 35, 49, 65, 83], [100, 27, 39, 54, 71, 90], [110, 31, 44, 59, 77, 96], [120, 35, 48, 64, 83, 103], [140, 41, 56, 73, 93, 114]], female: [[50, 6, 11, 18, 27, 37], [60, 7, 12, 20, 29, 40], [70, 8, 14, 22, 32, 43], [80, 9, 15, 24, 34, 45], [90, 10, 17, 25, 36, 48], [100, 11, 18, 27, 38, 50], [120, 13, 20, 30, 41, 53]] },
  // Barbell (the total weight on your back), as people log it; the dumbbell table is per dumbbell.
  'bulgarian-split-squat': { male: [[60, 10, 25, 47, 77, 112], [80, 21, 41, 68, 103, 143], [90, 26, 48, 78, 115, 157], [100, 32, 55, 87, 126, 170], [110, 37, 62, 96, 136, 182], [120, 42, 69, 104, 146, 193], [140, 52, 82, 120, 165, 214]], female: [[50, 8, 18, 32, 50, 72], [60, 10, 20, 36, 55, 77], [70, 12, 23, 39, 59, 82], [80, 13, 25, 42, 63, 87], [90, 15, 27, 45, 66, 90], [100, 16, 29, 47, 69, 94], [120, 19, 33, 52, 74, 100]] },
  'stiff-leg-deadlift': { male: [[60, 45, 68, 99, 135, 175], [80, 66, 94, 130, 170, 215], [90, 76, 106, 143, 186, 232], [100, 85, 117, 156, 201, 248], [110, 94, 128, 168, 214, 264], [120, 103, 138, 180, 227, 278], [140, 119, 156, 201, 251, 304]], female: [[50, 24, 39, 59, 84, 111], [60, 29, 45, 67, 93, 121], [70, 33, 51, 74, 100, 130], [80, 37, 56, 80, 108, 138], [90, 41, 61, 85, 114, 145], [100, 45, 65, 91, 120, 152], [120, 51, 73, 100, 131, 164]] },
  'paused-bench-press': { male: [[60, 47, 62, 79, 99, 120], [80, 69, 87, 108, 131, 155], [90, 79, 98, 120, 145, 170], [100, 89, 109, 132, 158, 184], [110, 99, 120, 144, 170, 198], [120, 108, 129, 155, 182, 210], [140, 124, 148, 175, 204, 234]], female: [[50, 22, 32, 46, 62, 79], [60, 28, 40, 54, 71, 90], [70, 33, 46, 62, 80, 100], [80, 38, 52, 69, 88, 109], [90, 43, 58, 76, 96, 117], [100, 48, 63, 82, 103, 124], [120, 57, 73, 93, 115, 138]] },
  'face-pull': { male: [[60, 10, 21, 37, 57, 80], [80, 15, 29, 47, 69, 95], [90, 18, 32, 51, 75, 101], [100, 21, 35, 55, 80, 107], [110, 23, 39, 59, 84, 112], [120, 25, 42, 63, 89, 117], [140, 30, 47, 70, 97, 127]], female: [[50, 9, 17, 28, 43, 60], [60, 10, 19, 32, 47, 65], [70, 12, 22, 35, 51, 69], [80, 14, 24, 38, 54, 73], [90, 15, 26, 40, 57, 77], [100, 17, 28, 43, 60, 80], [120, 20, 31, 47, 65, 86]] },
  'cable-fly': { male: [[60, 4, 12, 26, 46, 69], [80, 8, 19, 36, 58, 84], [90, 10, 23, 41, 64, 91], [100, 13, 26, 45, 69, 98], [110, 15, 29, 49, 74, 104], [120, 17, 32, 53, 79, 109], [140, 21, 38, 60, 88, 119]], female: [[50, 2, 7, 15, 26, 39], [60, 3, 9, 18, 29, 43], [70, 4, 10, 19, 31, 46], [80, 5, 12, 21, 34, 48], [90, 6, 13, 23, 36, 51], [100, 7, 14, 24, 38, 53], [120, 8, 16, 27, 41, 57]] },
  // Abs: sit-ups in one set (reps, Strength Level's Sit Ups table, bodyweight converted from lb), or with weight on
  // (crunch machine, cable crunch, weighted sit-up) against Strength Level's Cable Crunch one-rep max table.
  'sit-ups': { male: [[60, 6, 29, 63, 104, 150], [80, 5, 24, 52, 84, 121], [90, 4, 22, 47, 77, 110], [100, 4, 20, 44, 71, 102], [110, 3, 19, 41, 66, 95], [120, 2, 17, 37, 61, 87], [140, 0.5, 14, 32, 53, 76]], female: [[50, 0.5, 17, 49, 88, 133], [60, 0.5, 16, 44, 79, 118], [70, 0.5, 14, 40, 71, 106], [80, 0.5, 12, 35, 63, 94], [90, 0.5, 11, 32, 57, 85], [100, 0.5, 10, 29, 52, 79], [120, 0.5, 8, 24, 45, 68]] },
  'cable-crunch': { male: [[60, 19, 34, 56, 83, 113], [80, 26, 44, 68, 97, 130], [90, 29, 48, 73, 103, 136], [100, 32, 51, 77, 108, 143], [110, 34, 55, 82, 113, 149], [120, 37, 58, 86, 118, 154], [140, 42, 64, 93, 127, 164]], female: [[50, 13, 25, 43, 64, 89], [60, 15, 29, 47, 70, 95], [70, 17, 31, 50, 74, 101], [80, 19, 34, 54, 78, 105], [90, 21, 36, 57, 81, 109], [100, 23, 39, 59, 85, 113], [120, 26, 42, 64, 90, 120]] },
  'dumbbell-tricep-extension': { male: [[60, 3, 8, 16, 26, 38], [80, 6, 12, 22, 33, 47], [90, 7, 14, 24, 37, 51], [100, 9, 16, 27, 40, 54], [110, 10, 18, 29, 43, 58], [120, 12, 20, 32, 45, 61], [140, 14, 24, 36, 51, 67]], female: [[50, 3, 6, 10, 16, 22], [60, 3, 7, 11, 17, 24], [70, 4, 7, 12, 18, 25], [80, 4, 8, 13, 20, 27], [90, 5, 9, 14, 21, 28], [100, 5, 10, 15, 22, 29], [120, 6, 11, 16, 23, 31]] }
};
// Exercise names (lower case) for those, from the library (Split Squat also matches its old name).
// Only for the anatomy's Strength view: abs and calves have no web lift, so they take these.
const MUSCLE_ONLY_LIFTS = () => [
  { label: 'Calf raise', key: 'machine-calf-raise', names: ['calf raise', 'calf raises', 'calves', 'machine calf raise', 'standing calf raise', 'seated calf raise'] },
  { label: 'Sit-up', key: 'sit-ups', addedKey: 'cable-crunch', reps: true, names: ['sit-up', 'sit-ups', 'sit up', 'sit ups', 'situp', 'situps', 'weighted sit-up', 'decline sit-up', 'crunch', 'crunches', 'cable crunch', 'machine crunch', 'ab crunch', 'ab crunch machine', 'crunch machine', 'ab machine'] },
];
const OTHER_LIFTS = Object.entries({ 'Sumo Deadlift': 'sumo-deadlift', 'Front Squat': 'front-squat', 'Romanian Deadlift': 'romanian-deadlift', 'Hip Thrust': 'hip-thrust', 'Hip Abduction Machine': 'hip-abduction', 'Leg Press': 'sled-leg-press', 'Leg Extension': 'leg-extension', 'Leg Curl': 'seated-leg-curl', 'Lat Pulldown': 'lat-pulldown', 'Dumbbell Bench Press': 'dumbbell-bench-press', 'Incline Dumbbell Press': 'incline-dumbbell-bench-press', 'Barbell Curl': 'barbell-curl', 'Dumbbell Curl': 'dumbbell-curl', 'Hammer Curl': 'hammer-curl', 'Triceps Pushdown': 'tricep-pushdown', 'Hack Squat': 'hack-squat', 'Close-Grip Bench Press': 'close-grip-bench-press', 'Lateral Raise': 'dumbbell-lateral-raise', 'Calf Raise': 'machine-calf-raise', 'Skull Crusher': 'lying-tricep-extension', 'Split Squat': 'bulgarian-split-squat', 'Stiff-Legged Deadlift': 'stiff-leg-deadlift', 'Pause Bench Press': 'paused-bench-press', 'Face Pull': 'face-pull', 'Cable Fly': 'cable-fly', 'Overhead Triceps Extension': 'dumbbell-tricep-extension' })
  .map(([label, key]) => ({ label, key, names: [label.toLowerCase(), ...(libraryEntry(label)?.aliases || []), ...Object.keys(RENAMED).filter((old) => RENAMED[old] === label).map((old) => old.toLowerCase())] }));
const standardAt = (rows, bodyweight) => {
  if (!rows?.length) return null;
  if (bodyweight <= rows[0][0]) return rows[0].slice(1);
  if (bodyweight >= rows.at(-1)[0]) return rows.at(-1).slice(1);
  const upper = rows.findIndex((row) => row[0] >= bodyweight);
  const [low, high] = [rows[upper - 1], rows[upper]];
  const share = (bodyweight - low[0]) / (high[0] - low[0]);
  return low.slice(1).map((value, index) => value + (high[index + 1] - value) * share);
};
const LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
// How much the shape bends between corners: 0 straight, 1 a full smooth curve.
const WEB_CURVE = 0;
// Clockwise from the top: legs at the top, push down the right side, pull down the left.
// The names each web lift counts, in any case and with or without hyphens ("Pull-up" is "pull up"). Barbell versions
// only: dumbbell, Smith and machine presses have their own (lighter) standards, so they don't count here. Harder
// variants (pause, close-grip, deficit…) count for their main lift through HARDER_VARIANTS.
const WEB_LIFTS = [
  { label: 'Squat', key: 'squat', names: ['squat', 'squats', 'back squat', 'barbell squat', 'barbell back squat'] },
  { label: 'Bench', key: 'bench-press', names: ['bench press', 'bench', 'barbell bench press', 'flat bench', 'flat bench press', 'flat barbell bench press'] },
  { label: 'Incline bench', key: 'incline-bench-press', names: ['incline bench press', 'incline bench', 'incline barbell bench press', 'incline barbell bench', 'incline barbell press', 'barbell incline bench press', 'incline press'] },
  { label: 'Overhead', key: 'shoulder-press', names: ['overhead press', 'shoulder press', 'military press', 'ohp', 'standing overhead press', 'barbell overhead press', 'strict press', 'barbell shoulder press'] },
  { label: 'Pull-up', key: 'pull-ups', names: ['pull up', 'pull ups', 'pullup', 'pullups', 'chin up', 'chin ups', 'chinup', 'chinups', 'weighted pull up', 'weighted pull ups', 'weighted chin up', 'weighted chin ups'], reps: true },
  { label: 'Row', key: 'bent-over-row', names: ['barbell row', 'bent over row', 'barbell bent over row', 'bent over barbell row', 'pendlay row'] },
  { label: 'Deadlift', key: 'deadlift', names: ['deadlift', 'deadlifts', 'conventional deadlift', 'barbell deadlift'] }
];
const liftName = (name) => String(name || '').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
// 0 … 5 where 1 is Beginner and 5 Elite; past Elite it keeps going by the Advanced→Elite step.
const levelScore = (value, marks) => {
  if (!(value > 0) || !marks) return 0;
  if (value < marks[0]) return value / marks[0];
  for (let index = 0; index < 4; index += 1) if (value < marks[index + 1]) return index + 1 + (value - marks[index]) / (marks[index + 1] - marks[index]);
  return 5 + (value - marks[4]) / Math.max(1, marks[4] - marks[3]);
};
let measurer;
const textWidth = (text, font) => {
  measurer ||= document.createElement('canvas').getContext('2d');
  measurer.font = `${font} ${getComputedStyle(document.body).fontFamily}`;
  return measurer.measureText(text).width;
};
<<<<<<< Updated upstream
// A level's number cut, not rounded, to one decimal, so 4.99 reads 4.9 next to "Advanced", never 5.0.
const levelNumber = (score) => (Math.floor(Math.min(score, 9.99) * 10) / 10).toFixed(1);
=======
// On the web the level is short (the key under it spells it out in the same colours), so the web itself can be bigger.
const levelShort = (score) => (score >= 5.25 ? 'Elite\u2009+' : score >= 5 ? 'Elite' : score >= 4 ? 'Adv.' : score >= 3 ? 'Int.' : score >= 2 ? 'Nov.' : score >= 1 ? 'Beg.' : score > 0 ? '< Beg.' : '');
// How many lifters a level beats. Strength Level defines its levels this way: Beginner is stronger than 5% of lifters,
// Novice 20%, Intermediate 50%, Advanced 80%, Elite 95%. In between it's read off a straight line; past Elite it carries on
// along the same bell curve (Advanced→Elite is about 0.8 standard deviations per level).
const LEVEL_SHARE = [[0, 0], [1, 5], [2, 20], [3, 50], [4, 80], [5, 95]];
const normal = (z) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const tail = 0.3989423 * Math.exp((-z * z) / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - tail : tail;
};
const beatsShare = (score) => {
  if (score >= 5) return normal(1.645 + 0.82 * (score - 5)) * 100;
  const index = Math.max(0, Math.min(4, Math.floor(score)));
  const [[from, low], [, high]] = [LEVEL_SHARE[index], LEVEL_SHARE[index + 1]];
  return low + (high - low) * (score - from);
};
>>>>>>> Stashed changes
const levelWord = (score) => (score >= 5.25 ? 'Elite\u2009+' : score >= 1 ? LEVELS[Math.min(5, Math.floor(score)) - 1] : score > 0 ? 'Below Beginner' : '');
// The same, short (Int. 3.6), where room is tight; the level key underneath spells each one out.
const levelShort = (score) => (score >= 5.25 ? 'Elite\u2009+' : score >= 1 ? ['Beg.', 'Nov.', 'Int.', 'Adv.', 'Elite'][Math.min(5, Math.floor(score)) - 1] : score > 0 ? 'Below Beg.' : '');
// All time = the heaviest you've ever lifted: the web's solid shape and the anatomy, so one light day never pulls a
// level down. Now = the heaviest of the last 3 months, the web's dotted line (tap "Last 3 months" to swap them).
const STRENGTH_NOW_DAYS = 90;
// Strength is the weight you actually lifted, never an estimate: each lift's heaviest set (warm-ups don't count),
// against Strength Level's one-rep max standards. Reps and RPE never raise it: 290 × 3 at RPE 7 counts as 290, the
// same as a single would. They only break a tie: at the same weight, more reps wins, then the earlier day (the first
// time you did it). Pull-ups count your most reps in one set against Strength Level's reps table.
const liftStrength = (lift, body) => {
  const since = addDays(todayIso(), -STRENGTH_NOW_DAYS);
  // Pull-ups have two ways to count: most reps in one set, and the most weight added for a set (kg on the belt).
  // Each is kept apart and scored on its own Strength Level table; the better level wins.
  const top = { reps: null, added: null, recentReps: null, recentAdded: null };
  const better = (current, value, tie, set, date, name) => (!current || value > current.value || (value === current.value && tie > current.tie) ? { value, tie, set, date, name } : current);
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    for (const exercise of session.exercises) {
      const named = exercise.name.toLowerCase();
      const names = lift.normal || (lift.normal = lift.names.map(liftName));
      if (!names.includes(liftName(named)) && !names.includes(liftName(MAIN_LIFT[named]))) continue;
      for (const set of validSets(exercise)) {
        if (set.warmup) continue;
        const [kg, reps] = [Number(set.kg) || 0, Number(set.reps)];
        const recent = session.date >= since;
        if (lift.reps) {
          if (reps > 0) {
            top.reps = better(top.reps, reps, kg, set, session.date, exercise.name);
            if (recent) top.recentReps = better(top.recentReps, reps, kg, set, session.date, exercise.name);
          }
          if (kg > 0) {
            top.added = better(top.added, kg, reps, set, session.date, exercise.name);
            if (recent) top.recentAdded = better(top.recentAdded, kg, reps, set, session.date, exercise.name);
          }
        } else if (kg > 0) {
          top.added = better(top.added, kg, reps, set, session.date, exercise.name);
          if (recent) top.recentAdded = better(top.recentAdded, kg, reps, set, session.date, exercise.name);
        }
      }
    }
  }
  const marks = standardAt(STANDARDS[lift.key]?.[body.sex], body.kg);
  if (!lift.reps) {
    const best = top.added;
    const recent = top.recentAdded;
    const [ever, now] = [best?.value || 0, recent?.value || 0];
    return { ...lift, value: now, ever, marks, score: levelScore(now, marks), everScore: levelScore(ever, marks), best: best && { ...best, score: levelScore(best.value, marks) }, recent };
  }
  const addedMarks = standardAt(STANDARDS[lift.addedKey || 'pull-ups-added']?.[body.sex], body.kg);
  const pick = (byReps, byAdded) => {
    const repsScore = byReps ? levelScore(byReps.value, marks) : 0;
    const addedScore = byAdded && addedMarks ? levelScore(byAdded.value, addedMarks) : 0;
    return addedScore > repsScore ? { ...byAdded, score: addedScore, weighted: true } : byReps ? { ...byReps, score: repsScore, weighted: false } : null;
  };
  const best = pick(top.reps, top.added);
  const recent = pick(top.recentReps, top.recentAdded);
  // Shown in added kg when the weighted sets are what counts, so the next level reads "+59 kg", not reps.
  return { ...lift, weighted: Boolean(best?.weighted), reps: !best?.weighted, value: recent ? 1 : 0, ever: best ? 1 : 0, marks: best?.weighted ? addedMarks : marks, score: recent?.score || 0, everScore: best?.score || 0, best, recent };
};
// Bodyweight and sex, asked where they're needed (Strength level, and the anatomy's Strength view). Both forms can be
// on screen at once (computer), so each reads its own field.
const bodyForm = (title) => `<div class="bodyForm">
    <p class="bodyTitle">${title}</p>
    <p class="bodyText">Strength Level's standards depend on bodyweight and sex. Saved on your account, on all your devices.</p>
    <div class="bodyRow"><label class="bodyKgWrap"><input class="pill num bodyKg" inputmode="decimal" placeholder="80" aria-label="Bodyweight in kg" value="${esc(state.body?.kg || '')}"><span>kg</span></label>
      ${['male', 'female'].map((sex) => `<button class="chip" data-action="body-sex" data-sex="${sex}" aria-pressed="${(view.bodySex || state.body?.sex) === sex}"><span class="chipFace">${sex === 'male' ? 'Male' : 'Female'}</span></button>`).join('')}
      <button class="chip saveBody" data-action="body-save"><span class="chipFace">Save</span></button></div>
    ${view.bodyError ? `<p class="bodyError">${esc(view.bodyError)}</p>` : ''}
  </div>`;
// Bottom of Trends: the lift that stands out most against its standard, how rare it is, and why.
const renderImpressive = () => {
  const body = state.body;
  if (!body?.kg || !body?.sex || !Object.keys(STANDARDS).length) return '';
  const lifts = WEB_LIFTS.map((lift) => liftStrength(lift, body)).filter((lift) => lift.marks && (lift.value || lift.ever));
  if (!lifts.length) return '';
  const best = lifts.map((lift) => ({ ...lift, top: Math.max(lift.score, lift.everScore), lately: lift.score >= lift.everScore - 0.01 })).sort((first, second) => second.top - first.top)[0];
  if (best.top < 1) return '';
  const share = beatsShare(best.top);
  const oneIn = 100 / Math.max(0.01, 100 - share);
  const rounded = oneIn >= 20 ? Math.round(oneIn / 5) * 5 : Math.round(oneIn);
  const kg = Math.round(best.lately ? best.value : best.ever);
  const elite = best.marks[4];
  const tier = tierOf(best.top)?.[2] || 'tierBeg';
  const shown = best.reps ? `${Math.round(kg - body.kg) >= 0 ? `+${Math.round(kg - body.kg)}` : Math.round(kg - body.kg)} kg on your bodyweight` : `${kg} kg`;
  const versus = elite ? (kg >= elite ? `Elite for ${Math.round(body.kg)} kg starts at ${Math.round(best.reps ? elite - body.kg : elite)} kg${best.reps ? ' added' : ''}; you're ${Math.round(kg - elite)} kg past it.` : `Elite for ${Math.round(body.kg)} kg starts at ${Math.round(best.reps ? elite - body.kg : elite)} kg${best.reps ? ' added' : ''}; ${Math.round(elite - kg)} kg to go.`) : '';
  return `<p class="section">Your most impressive lift</p>
    <section class="card impressiveCard">
      <p class="impressiveLift">${esc(best.label)} <span class="num">${shown}</span><span class="impressiveWhen">${best.lately ? 'est. one-rep max, last 3 months' : 'est. one-rep max, all time'}</span></p>
      <p class="impressiveLevel"><b class="${tier}">${levelWord(best.top)}</b> <span class="num">${best.top.toFixed(1)}</span></p>
      <p class="impressiveRare">Stronger than about <b class="num">${share >= 99 ? share.toFixed(1) : Math.round(share)}%</b> of ${Math.round(body.kg)} kg ${body.sex === 'female' ? 'women' : 'men'} who lift: about <b class="num">1 in ${rounded}</b>.</p>
      ${versus ? `<p class="impressiveWhy">${versus}</p>` : ''}
    </section>`;
};
const renderStrength = () => {
  if (!Object.keys(STANDARDS).length) return '';
  // No bodyweight yet: the web shows empty with the form on it, so it's clear what to fill in (one saved on another
  // device arrives with the first sync and the form goes away by itself).
  const known = Boolean(state.body?.kg && state.body?.sex);
  const body = known ? state.body : { kg: 80, sex: 'male' };
  const askBody = !known || view.bodyEdit;
  const lifts = known ? WEB_LIFTS.map((lift) => liftStrength(lift, body)).filter((lift) => lift.marks) : WEB_LIFTS.map((lift) => ({ ...lift, value: 0, ever: 0, score: 0, everScore: 0, marks: [1] }));
  if (lifts.length < 3) return '';
  const top = Math.max(5, ...lifts.map((lift) => lift.everScore));
  // Elite is the outer coloured ring; the spokes run a little past it, further if you go past Elite.
  const outer = Math.min(8, Math.max(5.6, top + 0.25));
  const size = 320;
  const middle = size / 2;
  const radius = 100;
  const angle = (index) => -Math.PI / 2 + (index / lifts.length) * Math.PI * 2;
  const point = (index, score) => [middle + Math.cos(angle(index)) * radius * (Math.min(score, outer) / outer), middle + Math.sin(angle(index)) * radius * (Math.min(score, outer) / outer)];
  const fixed = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  // Straight edges, or one smooth curve through the corners (Catmull-Rom as cubic Béziers).
  const segment = (points, index) => {
    const [before, from, to, after] = [-1, 0, 1, 2].map((step) => points[(index + step + points.length) % points.length]);
    if (!WEB_CURVE) return `L${fixed(to)}`;
    const control1 = [from[0] + ((to[0] - before[0]) / 6) * WEB_CURVE, from[1] + ((to[1] - before[1]) / 6) * WEB_CURVE];
    const control2 = [to[0] - ((after[0] - from[0]) / 6) * WEB_CURVE, to[1] - ((after[1] - from[1]) / 6) * WEB_CURVE];
    return `C${fixed(control1)} ${fixed(control2)} ${fixed(to)}`;
  };
  const outline = (points) => `M${fixed(points[0])}${points.map((_, index) => segment(points, index)).join('')}Z`;
  const ring = (score) => `<polygon points="${lifts.map((lift, index) => fixed(point(index, score))).join(' ')}"`;
  // The solid shape is all time unless you tap "Last 3 months"; the other one is the dotted line.
  const recent = Boolean(view.webNow);
  const shownScore = (lift) => (recent ? lift.score : lift.everScore);
  const otherScore = (lift) => (recent ? lift.everScore : lift.score);
  const shown = (lift) => (recent ? lift.value : lift.ever);
  const corners = lifts.map((lift, index) => point(index, Math.max(0.15, shownScore(lift))));
  const dotted = lifts.some((lift) => Math.abs(otherScore(lift) - shownScore(lift)) >= 0.05) ? `<path d="${outline(lifts.map((lift, index) => point(index, Math.max(0.15, otherScore(lift)))))}" class="webEverShape"/>` : '';
  // The picture is as wide as its words: long level names on a side corner widen it instead of being cut off.
  let [left, right] = [-6, size + 6];
  const labels = lifts.map((lift, index) => {
    // A corner at the top moves up a line, so its set line never touches the outer ring.
    const [x, y] = [middle + Math.cos(angle(index)) * (radius + 22), middle + Math.sin(angle(index)) * (radius + 22) - (Math.sin(angle(index)) < -0.5 ? 50 : 0)];
    const anchor = Math.abs(x - middle) < 8 ? 'middle' : x > middle ? 'start' : 'end';
<<<<<<< Updated upstream
    // The set the level comes from, under it; tapping the corner opens that day.
    const source = known && shown(lift) ? (recent ? lift.recent : lift.best) : null;
    const setLine = source ? (lift.key === 'pull-ups' ? (Number(source.set.kg) > 0 ? `+${Number(source.set.kg)} kg × ${source.set.reps}` : `${source.set.reps} reps`) : `${Number(source.set.kg)} × ${source.set.reps}`) : '';
    const wide = Math.max(textWidth(lift.label, '600 21px'), textWidth(`■ ${levelShort(shownScore(lift))} 0.0`, '500 18px'), textWidth('00 Sept 0000', '400 16px'), textWidth(setLine, '400 16px'));
    const [from, to] = anchor === 'middle' ? [x - wide / 2, x + wide / 2] : anchor === 'start' ? [x, x + wide] : [x - wide, x];
    [left, right] = [Math.min(left, from - 4), Math.max(right, to + 4)];
    const swatch = shown(lift) ? `<tspan class="webSwatch ${tierOf(shownScore(lift))?.[2] || 'tierBeg'}">■</tspan> ` : '';
    const level = !known ? '<tspan class="webNone">–</tspan>' : shown(lift) ? `${swatch}${levelShort(shownScore(lift))} <tspan class="webNum">${levelNumber(shownScore(lift))}</tspan>` : `<tspan class="webNone">${lift.ever ? 'Not lately' : 'Not logged'}</tspan>`;
    const corner = `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="webLift">${esc(lift.label)}</text><text x="${x.toFixed(1)}" y="${(y + 22).toFixed(1)}" text-anchor="${anchor}" class="webLevel">${level}</text>`;
    if (!source) return corner;
    const when = parseIso(source.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `<g class="webCorner" data-action="jump-session" data-date="${source.date}" role="button" aria-label="${esc(lift.label)}: ${setLine}, ${when}, open the day">${corner}<text x="${x.toFixed(1)}" y="${(y + 41).toFixed(1)}" text-anchor="${anchor}" class="webSet">${setLine}</text><text x="${x.toFixed(1)}" y="${(y + 59).toFixed(1)}" text-anchor="${anchor}" class="webSet">${when}</text></g>`;
=======
    const wide = Math.max(textWidth(lift.label, '600 18px'), textWidth(`■ ${levelShort(shownScore(lift))} 0.0`, '500 15px'));
    const [from, to] = anchor === 'middle' ? [x - wide / 2, x + wide / 2] : anchor === 'start' ? [x, x + wide] : [x - wide, x];
    [left, right] = [Math.min(left, from - 4), Math.max(right, to + 4)];
    // Not done in the last 3 months: the corner shows the all-time level, marked so, instead of looking empty.
    const swatch = lift.value || lift.ever ? `<tspan class="webSwatch ${tierOf(shownScore(lift))?.[2] || 'tierBeg'}">■</tspan> ` : '';
    const level = !known ? '<tspan class="webNone">–</tspan>' : lift.value ? `${swatch}${levelShort(lift.score)} <tspan class="webNum">${lift.score.toFixed(1)}</tspan>` : lift.ever ? `${swatch}<tspan class="webEverWord">${levelShort(lift.everScore)} ${lift.everScore.toFixed(1)}</tspan>` : '<tspan class="webNone">Not logged</tspan>';
    const allTime = !lift.value && lift.ever ? `<text x="${x.toFixed(1)}" y="${(y + 38).toFixed(1)}" text-anchor="${anchor}" class="webEver">all time</text>` : '';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="webLift">${esc(lift.label)}</text><text x="${x.toFixed(1)}" y="${(y + 20).toFixed(1)}" text-anchor="${anchor}" class="webLevel">${level}</text>${allTime}`;
>>>>>>> Stashed changes
  }).join('');
  // Same room on both sides, so the web's centre is the screen's centre whatever the labels say.
  const half = Math.max(middle - left, right - middle) + 4;
  // The outline takes each corner's level colour and blends along each edge, so a lift past Elite shows blue there.
  const colours = lifts.map((lift) => TIER_COLOURS[tierOf(shownScore(lift))?.[2] || 'tierBeg']);
  const edges = `<defs>${corners.map((corner, index) => {
    const next = corners[(index + 1) % corners.length];
    return `<linearGradient id="webEdge${index}" gradientUnits="userSpaceOnUse" x1="${corner[0].toFixed(1)}" y1="${corner[1].toFixed(1)}" x2="${next[0].toFixed(1)}" y2="${next[1].toFixed(1)}"><stop offset="0" stop-color="${colours[index]}"/><stop offset="1" stop-color="${colours[(index + 1) % colours.length]}"/></linearGradient>`;
  }).join('')}</defs>${corners.map((corner, index) => `<path d="M${fixed(corner)}${segment(corners, index)}" stroke="url(#webEdge${index})" class="webEdge"/>`).join('')}`;
  // Rings 1 Beginner to 5 Elite, each in its level's colour.
  // Each ring's number, the same scale as the corners' numbers, on the gap between Squat and Bench.
  const gap = -Math.PI / 2 + Math.PI / lifts.length;
  const ringNumbers = [1, 2, 3, 4, 5].map((level) => {
    const reach = radius * (level / outer) * Math.cos(Math.PI / lifts.length);
    return `<text x="${(middle + Math.cos(gap) * reach).toFixed(1)}" y="${(middle + Math.sin(gap) * reach + 4).toFixed(1)}" text-anchor="middle" class="webRingNumber">${level}</text>`;
  }).join('');
  const rings = [[1, 'tierBeg'], [2, 'tierNov'], [3, 'tierInt'], [4, 'tierAdv'], [5, 'tierElite']].map(([level, tier]) => `${ring(level)} class="webRing ${tier}"/>`).join('');
  return `<p class="section">Strength level ${known ? `<button class="textBtn bodyEdit" data-action="body-edit">${Math.round(body.kg)} kg · ${body.sex === 'male' ? 'Male' : 'Female'}</button>` : ''}</p>
    <section class="card webCard${known ? '' : ' empty'}">
      ${askBody ? bodyForm(known ? 'Change your bodyweight or sex' : 'Add your bodyweight to see your strength level') : ''}
      ${!known ? '' : `<div class="webTop"><p class="webIntro">The heaviest you've lifted in each, against Strength Level's standards for your bodyweight</p><p class="webLegend">${[[false, 'All time', 'solid'], [true, 'Last 3 months', 'dotted']].map(([value, label, look]) => `<button class="webPick" data-action="web-now" data-now="${value ? 1 : 0}" aria-pressed="${recent === value}"><i class="${look}"></i>${label}</button>`).join('')}</p></div>`}
      <svg class="web" viewBox="${(middle - half).toFixed(0)} -40 ${(half * 2).toFixed(0)} 394" style="max-width:${Math.round(((half * 2) / 448) * 380)}px" role="img" aria-label="Strength level per lift, ${recent ? 'last 3 months' : 'all time'}: ${lifts.map((lift) => `${lift.label} ${shown(lift) ? levelWord(shownScore(lift)) : 'not logged'}`).join('; ')}">
        ${lifts.map((lift, index) => `<line x1="${middle}" y1="${middle}" x2="${point(index, outer)[0].toFixed(1)}" y2="${point(index, outer)[1].toFixed(1)}" class="webSpoke"/>`).join('')}
        ${rings}
        ${known ? `<path d="${outline(corners)}" class="webShape"/>
        ${edges}
        ${dotted}` : ''}
        ${lifts.map((lift, index) => shown(lift) ? `<circle cx="${point(index, shownScore(lift))[0].toFixed(1)}" cy="${point(index, shownScore(lift))[1].toFixed(1)}" r="5" class="webDot ${tierOf(shownScore(lift))?.[2] || 'tierBeg'}"/>` : '').join('')}
        ${ringNumbers}
        ${labels}
      </svg>
      ${levelKey('web')}
    </section>`;
};

// How rare a lift is, from counts rather than guesses. Everything here uses the weight you actually lifted.
// - Levels: Strength Level's own definition, the share of people training a lift that each level is stronger than:
//   Beginner 5%, Novice 20%, Intermediate 50%, Advanced 80%, Elite 95% (strengthlevel.com/strength-standards,
//   6,393,746 checked lifts, 16 March 2015 to 10 March 2026). Between two levels the share moves evenly on a log scale.
// - Squat, bench and deadlift: OpenPowerlifting raw meet results, every lifter's best raw lift (openpowerlifting.org
//   rankings, read 5 and 6 November 2026). MEETS_ALL holds, per sex, the exact number of lifters (all bodyweights)
//   who have lifted at least each weight, every 2.5 kg from `from` (the weight 90% of them have lifted) to the
//   record; a weight between two steps counts from the step below it. MEETS holds the same per IPF weight class (999 = the top class): lifters in the class and the kg at
//   the top 50%, 30%, 20%, 10%, 5%, 2%, 1%, 0.5%, 0.2%, 0.1%, 0.05%, 0.02%, then the class record.
// - "1 in N men (women) on Earth": everyone of your sex (UN World Population Prospects 2024: 4.14 bn men and
//   4.09 bn women in 2025) divided by how many have lifted it in a raw meet. A count, not a guess: people who never
//   compete aren't in it. Other lifts have no such count, so they show Strength Level's share of the people who
//   train them; past its Elite there's no recorded share, and the app says so.
//   Example: 15,459 men have deadlifted 300 kg or more raw in a meet (of 330,925): 1 in 268,000 men on Earth.
const LEVEL_BEATS = [0.05, 0.2, 0.5, 0.8, 0.95];
const MEET_SHARES = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002];
const MEETS_ALL = {
  "squat": {
    male: { from: 125, record: 490.5, counts: [259378, 256505, 255081, 251422, 249851, 246644, 244523, 239602, 236299, 231783, 229348, 222646, 219730, 214510, 211792, 203982, 200809, 194162, 191112, 182355, 178575, 171657, 168724, 160618, 154295, 146549, 142696, 133778, 128832, 122225, 119327, 109138, 105605, 98339, 94892, 87270, 84086, 77677, 74803, 68179, 65918, 61334, 56708, 51319, 48743, 44792, 42563, 37894, 35722, 32750, 31268, 27241, 25813, 23387, 22379, 19682, 18596, 16690, 16043, 14457, 12955, 11460, 10859, 9513, 8806, 7840, 7373, 6424, 6060, 5452, 5298, 4327, 4057, 3563, 3343, 2925, 2736, 2527, 2265, 1872, 1754, 1563, 1457, 1226, 1137, 1012, 961, 788, 726, 643, 607, 498, 474, 417, 410, 384, 359, 284, 268, 229, 220, 189, 183, 152, 144, 130, 120, 106, 100, 93, 89, 73, 63, 57, 57, 44, 39, 36, 32, 28, 25, 21, 19, 15, 12, 10, 10, 9, 9, 8, 8, 8, 8, 6, 6, 6, 6, 5, 4, 3, 3, 3, 3, 3, 3, 2, 2] },
    female: { from: 70, record: 320, counts: [122268, 119432, 117332, 114361, 112349, 108658, 105905, 101903, 99111, 94386, 90536, 86039, 82604, 76867, 72998, 68125, 64516, 59043, 55437, 50622, 47379, 42483, 39379, 35407, 32838, 29225, 26828, 24246, 21723, 19030, 16966, 14955, 13630, 11711, 10561, 9164, 8319, 7070, 6356, 5490, 5007, 4243, 3752, 3189, 2891, 2507, 2125, 1798, 1599, 1336, 1173, 1012, 936, 751, 669, 551, 490, 413, 359, 300, 268, 219, 206, 180, 143, 117, 101, 90, 80, 70, 66, 57, 54, 46, 37, 33, 33, 29, 27, 23, 21, 16, 15, 12, 11, 7, 6, 6, 6, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1] },
  },
  "bench-press": {
    male: { from: 85, record: 355, counts: [362508, 356488, 352645, 344805, 339160, 330982, 325488, 313465, 306319, 295501, 287729, 273965, 265491, 252696, 244316, 228485, 219945, 205928, 197416, 183151, 174448, 162762, 154329, 141287, 131994, 120394, 113545, 101792, 95103, 86451, 81370, 71958, 67248, 60233, 56488, 48930, 45400, 40331, 38077, 33422, 29959, 26433, 24644, 20972, 18851, 16552, 15405, 12749, 11596, 9924, 9028, 7580, 6910, 5841, 5259, 4348, 4039, 3492, 2968, 2450, 2178, 1842, 1636, 1324, 1128, 969, 832, 641, 563, 477, 430, 339, 306, 256, 240, 182, 144, 122, 111, 91, 81, 67, 56, 42, 34, 25, 24, 20, 18, 11, 11, 8, 7, 7, 7, 6, 4, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1] },
    female: { from: 40, record: 207.5, counts: [145057, 138962, 133065, 124772, 116630, 106783, 98137, 87834, 79495, 69070, 61003, 52187, 45563, 38134, 32710, 27081, 23178, 19153, 16057, 13106, 11099, 9099, 7551, 6122, 5194, 4160, 3494, 2819, 2382, 1908, 1627, 1315, 1105, 898, 743, 600, 514, 395, 331, 275, 214, 164, 140, 106, 86, 64, 54, 43, 36, 27, 20, 15, 13, 10, 7, 6, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  },
  "deadlift": {
    male: { from: 152.5, record: 492.5, counts: [298200, 296779, 293940, 292413, 287456, 285736, 281746, 280066, 273762, 271353, 266613, 264958, 257848, 252673, 246041, 242998, 234335, 230014, 223596, 220911, 208108, 204094, 195046, 191136, 180486, 176418, 167141, 163209, 152646, 149410, 141363, 133509, 123039, 118666, 111123, 107023, 97055, 92845, 86185, 83223, 73469, 70253, 64685, 62518, 55150, 52687, 47797, 46214, 41822, 37693, 33496, 31846, 27774, 25808, 22935, 21619, 18825, 17614, 15956, 15459, 12285, 11437, 9901, 9279, 8014, 7592, 6933, 6125, 4931, 4531, 3944, 3622, 3004, 2707, 2356, 2197, 1763, 1594, 1390, 1314, 1049, 960, 842, 809, 699, 639, 505, 458, 378, 345, 292, 261, 208, 178, 147, 139, 117, 111, 97, 94, 72, 66, 54, 51, 36, 33, 26, 19, 16, 16, 13, 11, 11, 10, 9, 8, 8, 8, 5, 5, 5, 5, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1] },
    female: { from: 92.5, record: 297.5, counts: [134474, 132386, 129611, 127581, 122835, 120118, 115829, 113055, 107693, 104183, 98694, 95110, 88606, 84730, 78974, 75280, 69235, 65663, 61097, 56557, 50891, 46569, 41819, 38945, 33738, 30889, 27361, 25296, 21558, 19590, 16953, 15481, 13066, 11738, 10043, 9200, 7983, 6674, 5645, 5061, 4172, 3631, 3153, 2867, 2184, 1937, 1581, 1400, 1139, 987, 816, 738, 615, 562, 497, 382, 305, 267, 221, 197, 147, 125, 109, 105, 84, 78, 62, 56, 38, 29, 27, 22, 18, 12, 9, 9, 7, 6, 6, 5, 4, 2, 1] },
  },
};
const MEETS = {
  "squat": {
    male: { all: 287436, classes: [
      [59, 10878, [120, 140, 152.5, 170, 182.5, 195, 202.5, 210, 225.5, 230.5, 245, 250, 270]],
      [66, 24563, [145, 163, 175, 190, 202.5, 215, 225, 235, 247.5, 252.5, 258.5, 263, 278]],
      [74, 52697, [165, 182.5, 192.5, 207.5, 220, 235, 245, 255, 265, 272.5, 280, 290.5, 341]],
      [83, 79867, [180, 200, 210, 227.5, 240, 255, 265, 275, 288, 297.5, 305, 315.5, 353]],
      [93, 77693, [195, 215, 227.5, 242.5, 257.5, 275, 285, 295.5, 310, 317.5, 330, 340.6, 365.5]],
      [105, 62115, [207.5, 230, 242.5, 260, 275, 295, 305, 317.5, 330, 340, 347.5, 367.5, 398]],
      [120, 37194, [220, 244.9, 260, 280, 297.5, 317.5, 330, 340.5, 355, 367.5, 375, 387.5, 411]],
      [999, 21396, [233.6, 260, 280, 305, 325.5, 350, 370, 390, 412.5, 425, 435, 468, 490.5]]
    ] },
    female: { all: 134157, classes: [
      [47, 4776, [77.5, 90, 97.5, 107.5, 117.5, 127.5, 133, 141, 150, 152.5, 155, 165, 170.5]],
      [52, 12894, [87.5, 100, 107.5, 120, 127.5, 140, 145, 152.5, 160, 165, 171.5, 175, 182.5]],
      [57, 20914, [97.5, 110, 117.5, 127.5, 137.5, 150, 157.5, 165, 172.5, 180, 186.5, 190, 220]],
      [63, 30897, [102.5, 115, 125, 137.5, 145.5, 157.5, 167.5, 175, 182.5, 190, 200, 208, 230.5]],
      [69, 30366, [110, 122.5, 132.5, 145, 155, 170, 177.5, 187.5, 197.5, 205, 210, 220, 227.5]],
      [76, 28059, [115, 130, 140, 152.5, 165, 180, 190, 200, 207.5, 215, 225, 232.5, 282.5]],
      [84, 19705, [117.9, 135, 145, 160, 170, 185, 195, 205, 220, 227, 230, 245, 290]],
      [999, 22524, [125, 142.5, 155, 172.5, 187.5, 205, 217.5, 230, 250, 265, 276.5, 282.5, 320]]
    ] },
  },
  "bench-press": {
    male: { all: 403233, classes: [
      [59, 16970, [80, 95, 102.5, 115, 125, 140, 155, 168.5, 180, 187, 192.5, 200, 211]],
      [66, 35435, [95, 107.5, 115, 127.5, 137.5, 150, 158.7, 168, 180, 191, 197.5, 207, 222.5]],
      [74, 73543, [110, 120.2, 130, 140, 150, 160, 170, 177.5, 190, 197.5, 210, 220, 250.5]],
      [83, 111463, [122.5, 135, 142.8, 155, 165, 177.5, 185.9, 195, 205, 212.5, 220, 230, 250]],
      [93, 105881, [132.5, 147.4, 155, 170, 180, 192.5, 200, 208.6, 220, 227.5, 235, 247.5, 280]],
      [105, 88053, [145, 160, 170, 183.7, 195, 210, 218, 227.5, 238.1, 245, 252.5, 261, 290]],
      [120, 55205, [155, 172.5, 185, 200, 210.9, 226.8, 235, 245, 255, 265, 272.1, 280, 310]],
      [999, 32810, [165, 185.9, 200, 217.5, 230, 247.5, 260, 272.1, 285, 294.8, 305, 312.5, 355]]
    ] },
    female: { all: 160003, classes: [
      [47, 6275, [45, 52.1, 57.5, 65, 72.5, 80, 90, 98, 107.5, 112, 118, 127.5, 135]],
      [52, 16974, [50, 57.5, 61, 70, 75, 85, 92.5, 100, 107.5, 114, 126, 130, 141]],
      [57, 25981, [52.5, 60, 65.7, 75, 82.5, 90, 97.5, 105, 113, 120, 125, 133.5, 143]],
      [63, 37111, [57.5, 65, 70, 77.5, 85, 95, 102.5, 110, 117.5, 123, 132.5, 137.5, 145]],
      [69, 35940, [60, 70, 75, 82.5, 92.5, 102.5, 110, 117.5, 127, 135, 142.5, 147.5, 158]],
      [76, 32583, [62.5, 72.5, 77.5, 87.5, 97.5, 110, 117.5, 125, 132.5, 140, 145, 150.5, 170.5]],
      [84, 22858, [65, 74.8, 80, 90, 100, 112.5, 122.5, 131, 140, 147, 152.5, 160, 172.5]],
      [999, 26495, [67.5, 77.5, 85, 95, 105, 117.9, 130, 138.3, 150, 160, 167.5, 177.5, 207.5]]
    ] },
  },
  "deadlift": {
    male: { all: 330925, classes: [
      [59, 12444, [150, 170, 182.5, 200, 215, 227.5, 240, 250, 262.5, 275.5, 283.5, 293, 303]],
      [66, 27769, [175, 195, 205, 222, 235, 250, 260.5, 272.5, 285, 295, 300, 308, 345]],
      [74, 59854, [195, 212.5, 225, 240, 252.5, 270, 280, 290, 302.5, 310.5, 320, 330.5, 365]],
      [83, 91478, [210, 230, 240, 257.5, 272.5, 288, 300, 310, 322.5, 332.5, 342.5, 360, 405]],
      [93, 88527, [225, 245, 255, 272.5, 287.5, 305, 317.5, 327.5, 340, 352.5, 362.5, 375, 413]],
      [105, 72508, [235, 257.5, 270, 287.5, 302.5, 320, 332, 342.5, 360, 370, 380, 390, 447.5]],
      [120, 44528, [245, 270, 280.5, 300, 317.5, 335, 347.5, 362.5, 377.5, 385.5, 400, 415, 472.5]],
      [999, 26210, [250, 277.5, 292.5, 317.5, 332.5, 352.5, 367.5, 380, 400, 410, 418.5, 437.5, 492.5]]
    ] },
    female: { all: 149764, classes: [
      [47, 5333, [100, 112.5, 120, 132.5, 142.5, 152.5, 160, 167.5, 175, 186, 188.5, 197.5, 212.5]],
      [52, 14852, [110, 122.5, 130, 142.5, 152.5, 162.5, 170, 177.5, 185, 190, 200, 207.5, 220.5]],
      [57, 23504, [117.5, 132.5, 140, 152.5, 162.5, 173, 182.5, 190, 200, 205, 212.5, 225, 238]],
      [63, 34508, [125, 140, 147.5, 160, 170, 182.5, 190, 200, 210, 216, 226, 232.5, 241.5]],
      [69, 33976, [130, 145, 155, 167.5, 180, 192.5, 201, 210, 222.5, 230, 240, 242.5, 260]],
      [76, 30995, [137.5, 150, 160, 175, 186, 200, 210, 220, 230, 240, 250, 261.5, 280]],
      [84, 21690, [140, 155, 165, 180, 192.5, 205, 217.5, 227.5, 240, 252.6, 262.5, 270, 282.5]],
      [999, 25347, [142.8, 160, 170, 185, 200, 212.5, 227.5, 237.5, 255, 262.5, 272.5, 289, 297.5]]
    ] },
  },
};
// The share of people training a lift who are at least this strong, from Strength Level's levels (score 1 … 5).
const topShare = (score) => {
  if (score >= 5) return 1 - LEVEL_BEATS[4];
  if (score < 1) return 1 - LEVEL_BEATS[0] * Math.max(0, score);
  const index = Math.floor(score) - 1;
  const [from, to] = [1 - LEVEL_BEATS[index], 1 - LEVEL_BEATS[index + 1]];
  return from * (to / from) ** (score - Math.floor(score));
};
// How many raw meet lifters of your sex have lifted at least this: null below the 90% mark, 0 past the record.
const meetCount = (key, sex, kg) => {
  const meets = MEETS_ALL[key]?.[sex];
  if (!meets || kg < meets.from) return null;
  if (kg > meets.record) return 0;
  return meets.counts[Math.min(meets.counts.length - 1, Math.floor((kg - meets.from) / 2.5 + 1e-9))];
};
const IPF_CLASSES = { male: [59, 66, 74, 83, 93, 105, 120], female: [47, 52, 57, 63, 69, 76, 84] };
// Your share of your weight class in raw meets, or null when you're below its middle.
const meetShare = (key, sex, bodyweight, kg) => {
  const meets = MEETS[key]?.[sex];
  if (!meets) return null;
  const limit = IPF_CLASSES[sex].find((top) => bodyweight <= top) || 999;
  const [, lifters, marks] = meets.classes.find(([top]) => top === limit);
  const shares = [...MEET_SHARES, 1 / lifters];
  if (kg < marks[0]) return null;
  const above = marks.findIndex((mark) => mark > kg);
  if (above === -1) return { share: 1 / lifters, lifters, limit };
  return { share: shares[above - 1] * (shares[above] / shares[above - 1]) ** ((kg - marks[above - 1]) / (marks[above] - marks[above - 1])), lifters, limit };
};
const shareText = (share) => `${Number((share * 100).toPrecision(share < 0.01 ? 1 : 2))}%`;
// Your most impressive lift: the heaviest set you actually did, its level and how rare that weight is. Lifts are
// compared by level (actual kg against Strength Level for your bodyweight). Your best squat, bench or deadlift always
// shows, and under it your best other lift (overhead press, split squat…).
const BIG_KEYS = ['squat', 'bench-press', 'deadlift'];
// Everyone on Earth of your sex (UN World Population Prospects 2024, 2025): men and women.
const ON_EARTH = { male: 4.14e9, female: 4.09e9 };
// The weight for a level (the reverse of levelScore): past Elite it keeps going by the Advanced→Elite step.
const kgAtScore = (marks, score) => {
  if (score < 1) return marks[0] * score;
  if (score >= 5) return marks[4] + (score - 5) * (marks[4] - marks[3]);
  const index = Math.floor(score) - 1;
  return marks[index] + (score - index - 1) * (marks[index + 1] - marks[index]);
};
const plain = (number) => (number >= 1e6 ? `${Number((number / 1e6).toPrecision(2))} million` : Number(number.toPrecision(3)).toLocaleString('en-GB'));
const LIFT_VERB = { squat: 'squatted', 'bench-press': 'benched', deadlift: 'deadlifted' };
// How rare, world first. Squat, bench, deadlift: 1 in how many men (women) on Earth have lifted it in a raw meet.
// Other lifts have no world count, so they're matched by level: the deadlift at the same Strength Level level for
// your bodyweight, and its meet count. Strength Level's share of the people who train the lift goes in the sentence.
// Below the meet tables (light lifts, where most people who can lift it never compete) there is no world number.
const rarityOf = (lift, body) => {
  const { value, score } = lift.best;
  const people = body.sex === 'male' ? 'men' : 'women';
  const big = BIG_KEYS.includes(lift.key);
  const deadlift = !big && standardAt(STANDARDS.deadlift[body.sex], body.kg);
  const matched = deadlift ? Math.round(kgAtScore(deadlift, score) / 2.5) * 2.5 : 0;
  const count = big ? meetCount(lift.key, body.sex, value) : meetCount('deadlift', body.sex, matched);
  const share = topShare(score);
  const trained = `Among people who train it: ${score >= 5 ? 'past Elite, stronger than 95%' : share <= 0.5 ? `1 in ${Math.round(1 / share)} lift this much` : `stronger than ${Math.max(1, Math.round((1 - share) * 100))}%`} (Strength Level).`;
  const level = Math.floor(score);
  const tiles = [];
  if (big && score >= 5) {
    const inClass = meetShare(lift.key, body.sex, body.kg, value);
    if (inClass) tiles.push({ label: 'Your weight class', value: `Top ${shareText(inClass.share)}`, sub: inClass.limit === 999 ? `over ${IPF_CLASSES[body.sex].at(-1)} kg, raw` : `up to ${inClass.limit} kg, raw` });
  }
  const unit = (mark) => (lift.reps ? `${Math.ceil(mark)} reps` : lift.weighted ? `+${Math.round(mark)} kg` : `${Math.round(mark)} kg`);
  if (level < 5) tiles.push({ label: 'Next level', value: unit(lift.marks[level]), sub: LEVELS[level] });
  else if (!big) tiles.push({ label: 'Over Elite', value: `+${Math.round((value / lift.marks[4] - 1) * 100)}%`, sub: `Elite is ${unit(lift.marks[4])}` });
  if (count === 0) return { meet: true, tiles, rare: `No ${body.sex === 'male' ? 'man' : 'woman'} has lifted more`, sentence: `Heavier than every raw meet result on record (OpenPowerlifting). ${trained}` };
  if (count) {
    const sentence = big ? `${count.toLocaleString('en-GB')} ${people} in the world have ${LIFT_VERB[lift.key]} ${value} kg or more in a raw meet. ${trained}` : `Matched by level: as rare as a ${matched} kg deadlift at your bodyweight, which ${count.toLocaleString('en-GB')} ${people} in the world have done in a raw meet. ${trained}`;
    return { meet: true, tiles, rare: `1 in ${plain(ON_EARTH[body.sex] / count)} ${people} on Earth`, sentence };
  }
  return { meet: false, tiles, rare: score >= 5 ? 'Past Elite' : share <= 0.5 ? `1 in ${Math.round(1 / share)} who train it` : `Stronger than ${Math.max(1, Math.round((1 - share) * 100))}% who train it`, sentence: 'Strength Level, for your bodyweight. Most people who can lift this never compete, so there is no world count at this weight.' };
};
const impressiveLifts = () => {
  const body = state.body;
  if (!body?.kg || !body?.sex) return [];
  const ranked = [...WEB_LIFTS, ...OTHER_LIFTS].map((lift) => liftStrength(lift, body)).filter((lift) => lift.marks && lift.best?.score > 0).sort((first, second) => second.best.score - first.best.score);
  const big = ranked.find((lift) => BIG_KEYS.includes(lift.key));
  const other = ranked.find((lift) => !BIG_KEYS.includes(lift.key));
  const shown = [big, other].filter(Boolean);
  return shown.map((lift) => ({ lift, ...rarityOf(lift, body) }));
};
const renderImpressive = () => {
  const found = impressiveLifts();
  if (!found.length) return '';
  const setText = (lift) => {
    const { set } = lift.best;
    const kg = Number(set.kg);
    return lift.key === 'pull-ups' ? (kg > 0 ? `+${kg} kg × ${set.reps}` : `${set.reps} reps`) : `${kg} kg × ${set.reps}`;
  };
  return `<p class="section">Your most impressive lift</p>
    <div class="feat">
      ${found.map(({ lift, tiles, rare, sentence }) => `<div class="featItem">
        <p class="featTop"><span class="featLift">${esc(BIG_KEYS.includes(lift.key) ? lift.best.name : lift.label)} <span class="featKg num">${setText(lift)}</span></span><span class="featLevel"><i class="muscleSwatch ${tierOf(lift.best.score)?.[2] || 'tierBeg'}"></i>${levelWord(lift.best.score)} <span class="num">${levelNumber(lift.best.score)}</span></span></p>
        <p class="featRare num">${rare}</p>
        <p class="featFact">${sentence}</p>
        ${tiles.length ? `<div class="tiles featTiles">${tiles.map((tile) => `<div class="tile"><p class="tileLabel featCaption">${tile.label}</p><p class="tileValue num">${tile.value}</p><p class="tileSub">${tile.sub}</p></div>`).join('')}</div>` : ''}
      </div>`).join('')}
      <p class="featSource">Strength Level: 6.4 million checked lifts, 2015–2026.${found.some((item) => item.meet) ? ` OpenPowerlifting: every raw meet result. UN World Population Prospects 2024: ${state.body.sex === 'male' ? '4.14 bn men' : '4.09 bn women'}.` : ''}</p>
    </div>`;
};
// The computer's right panel. On Trends the middle already has the lift chart, so the panel holds what the phone shows
// under it instead (strength level, volume, most impressive lift); nothing appears twice.
// Computer: your SBD total at the top of the right panel on every page, in its top margin (no room of its own); it
// scrolls away with the panel.
const rightTotal = () => {
  const total = sbdTotal();
  return total ? `<div class="rightTotal">${total}</div>` : '';
};
const renderProgress = () => {
  if (view.route === 'trends') return `<div class="rightTrends">${renderStrength()}${renderVolume()}${renderImpressive()}</div>`;
  const history = new Map();
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    for (const exercise of session.exercises) {
      if (validSets(exercise).length === 0) continue;
      if (!history.has(exercise.name)) history.set(exercise.name, []);
      history.get(exercise.name).push({ date: session.date, value: topEstimate(exercise), sets: validSets(exercise) });
    }
  }
  const lifts = [...history.keys()].sort((first, second) => history.get(second).length - history.get(first).length || bestOverall(second) - bestOverall(first));
  const focus = lifts.includes(view.focusLift) ? view.focusLift : lifts[0];
  return `<p class="eyebrow">Progress</p>
    <h2 class="title" style="font-size:28px;line-height:34px">${focus ? esc(focus) : 'Your lifts'}</h2>
    <section class="card" style="margin-top:16px;padding:12px 16px 4px">
      ${focus ? `<button class="chartLink" data-action="open-trend" data-name="${esc(focus)}"><span class="chartTitle">Est. 1RM · ${Math.round(bestOverall(focus))} kg</span><span class="textBtn" style="min-height:0">Open in Trends</span></button>${nowLine(focus)}${chartFor(history.get(focus))}${view.info && view.route !== 'trends' ? ESTIMATE_INFO : ''}` : '<p class="empty">Your strongest lift shows up here once you log it.</p>'}
    </section>
    ${focus ? liftPicker(BIG_THREE.filter((name) => history.has(name)), lifts.filter((name) => !BIG_THREE.includes(name)), history, 'focus-lift', focus) : ''}
    ${renderStrength()}
    ${renderVolume()}
    ${view.route === 'trends' ? '' : renderMuscles()}`;
};

const SHORT_NAMES = { 'Bench Press': 'Bench', 'Pause Bench Press': 'P.bench', 'Close-Grip Bench Press': 'CG bench', 'Dumbbell Bench Press': 'DB', 'Incline Bench Press': 'Inc', 'Incline Dumbbell Press': 'Inc DB', 'Overhead Press': 'OHP', 'Deadlift': 'DL', 'Stiff-Legged Deadlift': 'SLDL', 'Romanian Deadlift': 'RDL', 'Squat': 'SQ', 'Hack Squat': 'Hack', 'Leg Press': 'Leg press', 'Leg Extension': 'Leg ext', 'Lat Pulldown': 'Lat pull', 'Hip Thrust': 'Thrust', 'Barbell Curl': 'Curl' };

const dayName = (session) => {
  const peaks = topSets(session).map(({ name, set }) => `${SHORT_NAMES[name] || name}${prKind(name, session.date, set) === 'max' ? ' PR' : ''} ${set.kg}×${set.reps}`);
  const text = [...peaks, ...(session.cardio ? [`${cardioLabel(session)} ${session.cardio}m`] : [])].join(', ') || 'Session';
  return session.label ? `${text} · ${session.label}` : text;
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const searchLocal = (query) => {
  const text = query.toLowerCase();
  const names = [...new Set([...LIBRARY.map((entry) => entry.name), ...state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name))])];
  const mentioned = names.filter((name) => [name.toLowerCase(), ...(libraryEntry(name)?.aliases || [])].some((alias) => new RegExp(`(^|[^a-z])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`).test(text)));
  const wanted = mentioned.filter((name) => !mentioned.some((other) => other !== name && other.toLowerCase().includes(name.toLowerCase())));
  const kgs = [];
  const reps = [];
  for (const match of text.replace(/\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/g, ' ').replace(/\b(19|20)\d{2}\b/g, ' ').matchAll(/(for\s+|x\s*|×\s*)?(\d+(?:[.,]\d+)?)\s*(kg|kilos?|reps?)?/g)) {
    const value = Number(match[2].replace(',', '.'));
    if (match[3]?.startsWith('rep') || match[1] || (value < 20 && !match[3])) reps.push(value);
    else kgs.push(value);
  }
  const wantsPr = /\bprs?\b|record|personal best/.test(text);
  const wantsTop = /\btop\b|heaviest/.test(text);
  const dayMonth = text.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/) || text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})\b/);
  const month = MONTHS.findIndex((name) => new RegExp(`\\b${name}`).test(text));
  const year = text.match(/\b(19|20)\d{2}\b/)?.[0];
  const weekday = WEEKDAYS.findIndex((name) => new RegExp(`\\b${name}[a-z]*day\\b|\\b${name}\\b`).test(text));
  const results = [];
  for (const session of sortedSessions()) {
    const date = parseIso(session.date);
    if (year && session.date.slice(0, 4) !== year) continue;
    if (month !== -1 && date.getMonth() !== month) continue;
    if (dayMonth && date.getDate() !== Number(dayMonth[1].match(/\d/) ? dayMonth[1] : dayMonth[2])) continue;
    if (weekday !== -1 && date.getDay() !== weekday) continue;
    let best = null;
    const lifting = wanted.length || kgs.length || reps.length || wantsPr;
    for (const exercise of lifting ? session.exercises : []) {
      if (wanted.length && !wanted.includes(exercise.name)) continue;
      const top = topSets({ exercises: [exercise] })[0]?.set;
      for (const set of validSets(exercise)) {
        let score = (wanted.length ? 3 : 0) + (set === top ? 0.5 : 0);
        if (kgs.length && !kgs.includes(Number(set.kg))) continue;
        if (kgs.length) score += 4;
        if (reps.length && reps.includes(Number(set.reps))) score += 2;
        else if (reps.length && !kgs.length) continue;
        const kind = prKind(exercise.name, session.date, set);
        if (wantsPr && !kind && !kgs.length) continue;
        if (wantsPr && kind) score += 3;
        if (wantsTop && set === top) score += 1;
        if (!best || score > best.score) best = { score, line: `${exercise.name} ${set.kg} × ${set.reps}${kind === 'max' ? ' · 1RM PR' : kind ? ' · PR' : ''}` };
      }
    }
    const dated = year || month !== -1 || dayMonth || weekday !== -1;
    const words = `${session.label || ''} ${dayKind(session)}`.toLowerCase();
    if (!best && !lifting && (dated || words.includes(text.trim()))) best = { score: 1, line: topSets(session).slice(0, 2).map(({ name, set }) => `${name} ${set.kg} × ${set.reps}`).join(' · ') || dayKind(session) };
    if (best) results.push({ date: session.date, ...best });
  }
  return results.sort((first, second) => second.score - first.score || second.date.localeCompare(first.date)).slice(0, 8);
};

const searchIndex = () => sortedSessions()
  .filter((session) => session.exercises.length || session.cardio)
  .map((session) => `${session.date} ${parseIso(session.date).toLocaleDateString('en-GB', { weekday: 'short' })}${session.label ? ` "${session.label}"` : ''}: ${session.exercises.map((exercise) => {
    const sets = validSets(exercise);
    const top = topSets({ exercises: [exercise] })[0]?.set;
    const prs = sets.filter((set) => prKind(exercise.name, session.date, set));
    return `${exercise.name} ${sets.length} sets, top ${top ? `${top.kg}x${top.reps}` : '-'}${prs.length ? `, PR ${prs.map((set) => `${set.kg}x${set.reps}`).join(' ')}` : ''}`;
  }).join('; ')}${session.cardio ? `; cardio ${session.cardio} min` : ''}`)
  .join('\n')
  .slice(0, 16000);

let searchTimer = 0;
let searchSeq = 0;

const searchResults = () => {
  const { local, ai, loading } = view.search;
  const seen = new Set();
  const rows = [...ai.map((item) => ({ date: item.date, line: item.why })), ...local].filter((item) => sessionFor(item.date) && !seen.has(item.date) && seen.add(item.date));
  return `${rows.map((item) => `<button class="searchRow" data-action="jump-session" data-date="${item.date}"><span class="searchTop"><span>${dayLabel(item.date)}</span><span class="searchKind">${esc(dayKind(sessionFor(item.date)))}</span></span><span class="searchLine">${esc(item.line)}</span></button>`).join('')}${loading ? '<p class="searchNote">Searching with AI…</p>' : rows.length ? '' : '<p class="searchNote">Nothing found.</p>'}`;
};

const recentRows = () => sortedSessions().slice(0, 8).map((session) => `<button class="drawerRow" data-action="jump-session" data-date="${session.date}"><span class="dayName" title="${esc(dayName(session))}">${esc(dayName(session))}</span><span class="muted">${['Today', 'Yesterday'].includes(dayLabel(session.date)) ? dayLabel(session.date) : parseIso(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(session.date.slice(0, 4) === todayIso().slice(0, 4) ? {} : { year: '2-digit' }) })}</span></button>`).join('') || '<p class="drawerRow muted">None yet</p>';

const drawerList = () => (view.search.query.trim() ? `<p class="drawerLabel">Results</p>${searchResults()}` : `<p class="drawerLabel">Recent sessions</p>${recentRows()}`);

const paintSearch = () => {
  const list = document.getElementById('drawerList');
  if (list) list.innerHTML = drawerList();
};

const runAiSearch = () => {
  const query = view.search.query.trim();
  if (query.length < 3 || !navigator.onLine) return;
  const seq = ++searchSeq;
  view.search.loading = true;
  paintSearch();
  fetch('/api/search', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ query, index: searchIndex(), today: todayIso() }) })
    .then((response) => response.json())
    .catch(() => ({}))
    .then((body) => {
      if (seq !== searchSeq) return;
      view.search.ai = Array.isArray(body.results) ? body.results : [];
      view.search.loading = false;
      paintSearch();
    });
};

const drawerContent = () => {
  const history = exodiaHistory();
  return `${[['home', 'Home', ICONS.home], ['trends', 'Trends', ICONS.trends.replace('width="24" height="24"', 'width="22" height="22"')], ['log', 'Log', ICONS.log], ['import', 'Add your data', ICONS.clip.replace('width="18" height="18"', 'width="22" height="22"')], ['feedback', 'Help & feedback', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><path d="M12 17h.01"/></svg>'], ...(view.isAdmin ? [['admin', 'Admin', ICONS.admin]] : []), ['you', 'Settings', ICONS.settings]].map(([route, label, icon]) => `<a class="navItem${view.route === route || (route === 'feedback' && view.route === 'help') ? ' on' : ''}" href="#/${route === 'home' ? '' : route}" ${view.route === route ? 'aria-current="page"' : ''}>${icon}${esc(label)}</a>`).join('')}
      ${friendsSide()}
      <label class="searchBox">${ICONS.search}<span class="sr">Search your training</span><input id="search" type="search" placeholder="Search your training" enterkeyhint="search" autocomplete="off" value="${esc(view.search.query)}"></label>
      <div id="drawerList">${drawerList()}</div>
      <div class="drawerTools"><button class="drawerTool" data-action="undo-change" ${undoSteps.length ? '' : 'disabled'}>Undo</button><button class="drawerTool" data-action="redo-change" ${redoSteps.length ? '' : 'disabled'}>Redo</button></div>`;
};

// How to get data out of other apps; used on onboarding and on the "Add your data" page.
const exportHelp = (open) => `<details class="onboardHow"${open ? ' open' : ''}><summary>How to export from your app</summary>
      <ul>
        <li><b>StrengthLog</b><span>Profile → Settings → Export data → save the CSV file</span></li>
        <li><b>Strong</b><span>Profile → Settings → Export Strong Data</span></li>
        <li><b>Hevy</b><span>Profile → Settings → Export & Import Data → Export Workouts</span></li>
        <li><b>Notes</b><span>Copy your notes and paste them in</span></li>
        <li><b>Spreadsheet</b><span>Excel, CSV or rows copied from a sheet, any length</span></li>
      </ul>
      <p>Using something else? Paste whatever it gives you, or tell Exodia about your last weeks with the mic.</p>
    </details>`;

// Help: what to type, how to bring data from another app or an AI, and the commands. /help in any box opens it.
const HELP_EXAMPLES = [
  ['bench 100 for 5, 3 sets', 'three sets of 5 at 100 kg, today'],
  ['squat 140x5x3 yesterday', 'sets × reps, on another day'],
  ['ran 30 min', 'cardio counts for Move'],
  ['/note felt heavy, their benches are worse', 'a note on your latest session, tap it to read'],
  ['bench was 105, not 100', 'fixes the last set'],
  ['last friday deadlift 200 for 2', 'any day, any language'],
];
// How Exodia works, shown under feedback on Help & feedback (one place in the menu for both).
const helpSections = () => renderHelp().replace(/^<main class="page">\s*<p class="eyebrow">How Exodia works<\/p>\s*<h1 class="title">Help<\/h1>/, '').replace(/<\/main>\s*$/, '');
const renderHelp = () => `<main class="page">
    <p class="eyebrow">How Exodia works</p>
    <h1 class="title">Help</h1>
    <p class="section">Log by typing or talking</p>
    <section class="card helpList">${HELP_EXAMPLES.map(([said, means]) => `<div class="row"><span class="helpSaid">${esc(said)}</span><span class="muted">${esc(means)}</span></div>`).join('')}</section>
    <p class="feedbackLead">Tap the mic and just say it. Or use + for Quick add: tap a lift, fill in kg and reps. Hold a day to edit it; Undo is in the menu.</p>
    <p class="section">Bring your history</p>
    <div class="onboardChoices"><button class="onboardChoice" data-action="pick-file"><b>Choose a file</b><span>Excel, CSV, Numbers export, text or notes</span></button></div>
    ${exportHelp(true)}
    <p class="section">Let an AI do it</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;font-size:15px">Copy this, paste it into ChatGPT, Gemini or Claude, and it walks you through adding your training</span><button class="textBtn" data-action="copy-ai">${view.copiedAi ? 'Copied' : 'Copy'}</button></div>
    </section>
    <p class="section">Commands for the box</p>
    <section class="card helpList">
      <div class="row"><span class="helpSaid"><span class="slashCmd">/feedback</span> …</span><span class="muted">an idea or a bug, straight to Marcus</span></div>
      <div class="row"><span class="helpSaid"><span class="slashCmd">/help</span></span><span class="muted">opens this page</span></div>
      ${view.isAdmin ? '<div class="row"><span class="helpSaid"><span class="slashCmd">/admin</span> …</span><span class="muted">Exodia builds the change (only you)</span></div>' : ''}
    </section>
  </main>`;

// Always reachable from the menu: bring in history from another app, a file or notes.
const renderImport = () => `<main class="page">
    <p class="eyebrow">Bring your history</p>
    <h1 class="title">Add your data</h1>
    <p class="feedbackLead">Paste or drop any training history in the box below, in any format. Exodia turns it into days and sets.</p>
    <div class="onboardChoices"><button class="onboardChoice" data-action="pick-file"><b>Choose a file</b><span>Excel, CSV, Numbers export, text or notes</span></button></div>
    <p class="section">Or let an AI do it</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;font-size:15px">Copy this, paste it into ChatGPT, Gemini or Claude, and it walks you through adding your training</span><button class="textBtn" data-action="copy-ai">${view.copiedAi ? 'Copied' : 'Copy'}</button></div>
    </section>
    ${exportHelp(true)}
  </main>`;

// The menu slides in once. Redraws while it's open (sync, friends, the red pill) keep it still, so it never looks like
// it closes and opens again by itself.
const renderDrawer = () => {
  if (!view.menuShown && !view.menuTimer) view.menuTimer = setTimeout(() => { view.menuShown = true; view.menuTimer = null; }, 260);
  return drawerHtml();
};
const drawerHtml = () => `<div class="overlay${view.menuShown ? ' shown' : ''}">
    <button class="scrim" data-action="close-menu" aria-label="Close menu"></button>
    <nav class="drawer" aria-label="Exodia"><a class="drawerBrand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>${drawerContent()}</nav>
  </div>`;

const renderPicks = () => {
  const date = view.composerDate || todayIso();
  const picks = pickList();
  const query = !/\d/.test(view.draft) && view.draft.trim();
  const cardio = !query || 'cardio'.includes(query.toLowerCase()) ? `<button class="pick" data-action="pick-cardio"><span style="flex:1"><span class="pickName">Cardio</span><span class="pickLast">Cardio or a walk, 30 min · counts for Move</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : '';
  const split = picks.filter((name) => BIG_THREE.includes(name)).length;
  const button = nameQuery() ? fillButton : pickButton;
  return `${picks.slice(0, split).map((name) => button(name, date)).join('')}${cardio}${picks.slice(split).map((name) => button(name, date)).join('')}
    ${query && !query.startsWith("/") && !slashOffer().length && picks.length === 0 ? `<button class="pick" data-action="create" data-name="${esc(query)}"><span style="flex:1"><span class="pickName">Create “${esc(titleCase(query))}”</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}`;
};
// Below the main picks: a clear line, then every other lift, quieter, so nobody lands there by accident.
const quickExtras = () => {
  const extras = morePicks();
  const date = view.composerDate || todayIso();
  return extras.length ? `<p class="quickDivider"><span>More exercises · ${extras.length}</span></p><div class="picks quickExtra">${extras.map((name) => pickButton(name, date)).join('')}</div>` : '';
};
const fillButton = (name, date) => {
  const last = lastSetsFor(name, date);
  return `<div class="pick pickFill"><button class="pickMain" data-action="fill-name" data-name="${esc(name)}" aria-label="Write ${esc(name)} in the box"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></button><button class="plusDot pickAdd" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(date)}">${ICONS.plus}</button></div>`;
};
const pickButton = (name, date) => {
  const last = lastSetsFor(name, date);
  return `<button class="pick" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(date)}"><span style="flex:1;min-width:0"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>`;
};
const nameQuery = () => {
  const text = view.draft.trim();
  return text && !/\d/.test(text) && text.split(/\s+/).length <= 3 && !view.fixing && !view.editContext ? text : '';
};

const pendingChat = () => view.pending.map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div><div class="bubbleOut" role="status"><p>${writingLine(pending.progress || '')}</p><p class="ghostHint">It lands by itself. Keep logging, or look at <a href="#/trends">Trends</a>.</p></div></div>`).join('');

// + says "here": Quick add lights up softly, then settles. Import from a file is always marked in clay (styles.css).
const calloutQuick = () => requestAnimationFrame(() => {
  if (reducedMotion.matches) return;
  for (const element of [document.querySelector('.sheet .quickAdd')]) {
    if (!element) continue;
    element.classList.remove('callout');
    void element.offsetWidth;
    element.classList.add('callout');
    element.addEventListener('animationend', () => element.classList.remove('callout'), { once: true });
  }
});
const quickAdd = () => `<div class="quickAdd"><p class="section quickHead">Quick add${view.composer ? sizeButton() : ''}</p><div class="picks"><button class="pick importPick" data-action="pick-file"><span style="flex:1"><span class="pickName">Import a file</span><span class="pickLast">A StrengthLog or Strong export, notes, Excel or CSV</span></span><span class="plusDot" aria-hidden="true">${ICONS.clip}</span></button>${renderPicks()}</div>${quickExtras()}</div>`;

// On Admin and Feedback the panel above the box shows that page's own conversation, never training or exercises.
const typingBubble = () => `<div class="bubbleOut" role="status"><p>${writingLine()}</p></div>`;
const feedbackChat = () => `${(state.feedback || []).map((item) => `<div class="chatItem"><div class="bubbleIn">${esc(item.said)}</div><div class="bubbleOut"><p>Sent to Marcus · ${item.kind === 'bug' ? 'Bug' : 'Idea'}: ${esc(item.title)}</p></div></div>`).join('')}${view.pending.filter((pending) => pending.feedback).map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div>${typingBubble()}</div>`).join('')}` || '<p class="empty">Say or type an idea or a bug.</p>';

// Quick add gets the whole panel when it shows; the log stays on the Log page.
const quickShown = () => !nameQuery() && (view.showQuick || (!view.draft.trim() && !view.quickHidden));

const sheetBody = () => (view.route === 'feedback' ? `<div class="chat">${feedbackChat()}</div>`
  : nameQuery()
  ? `<div class="picks">${renderPicks()}</div>`
  : quickShown()
  // Your log runs above Quick add in the same scroll: the panel opens on Quick add with the latest messages just above
  // it, and you scroll up for older ones (tap one to fix it). A small line says the log is up there.
  ? `${(view.route !== 'admin' && ((state.log || []).length || view.pending.length)) ? `<div class="chat quickLog">${chatList((state.log || []).map((entry, index) => ({ entry, index })).slice(0, 60).reverse(), true)}${pendingChat()}</div><p class="logHint"><span class="logWords">${ICONS.up}Your log<span aria-hidden="true">·</span>more below<span class="logDown">${ICONS.up}</span></span></p>` : ''}${quickAdd()}`
  : `<div class="chat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).reverse(), true)}${pendingChat()}</div>`);

// The panel above the box opens small (a peek), with a bar that bounces once or twice to say "pull me".
// Drag the bar: let go anywhere and it stays that tall; a quick flick up snaps to the usual size, a flick down closes.
const SHEET_PEEK = 30;
// Tapping the box opens the panel this tall: the latest messages, then Quick add's first rows.
let SHEET_SMALL = 360;
const sheetSmall = () => typeof view.sheetH === 'number' && view.sheetH > SHEET_PEEK + 4 && view.sheetH <= SHEET_SMALL + 4;
const sheetStyle = () => (view.route === 'admin' && quickShown() ? ` style="height:auto;max-height:min(${SHEET_SMALL}px,var(--sheet-room, 100vh))"` : typeof view.sheetH === 'number' ? ` style="height:${view.sheetH}px;max-height:var(--sheet-room, none)"` : '');
const sheetPeek = () => typeof view.sheetH === 'number' && view.sheetH <= SHEET_PEEK + 4;
const preferredSheet = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sheet-h')) || window.innerHeight * 0.6;
const setSheet = (height, animate = false) => {
  view.sheetH = height;
  const sheet = document.querySelector('.dock .sheet');
  if (!sheet) return;
  sheet.classList.toggle('peek', sheetPeek());
  sheet.classList.toggle('small', sheetSmall());
  const sizeBtn = sheet.querySelector('[data-action="sheet-size"]');
  if (sizeBtn) sizeBtn.outerHTML = sizeButton();
  sheet.style.transition = animate && !reducedMotion.matches ? 'height 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
  sheet.style.height = typeof height === 'number' ? `${height}px` : '';
  sheet.style.maxHeight = typeof height === 'number' ? 'var(--sheet-room, none)' : '';
  if (!sheetPeek()) scrollChat();
};
// Next to "Quick add": an arrow up makes the panel full size, an arrow down takes it back to the small size.
const sheetFull = () => typeof view.sheetH !== 'number' || view.sheetH > SHEET_SMALL + 4;
const sizeButton = () => `<button class="sizeBtn${sheetFull() ? ' full' : ''}" data-action="sheet-size" aria-label="${sheetFull() ? 'Make smaller' : 'Show more'}">${ICONS.chev}</button>`;
const renderSheet = () => `<div class="sheet${quickShown() ? ' quickMode' : ''}${nameQuery() ? ' nameMode' : ''}${sheetPeek() ? ' peek' : ''}${sheetSmall() ? ' small' : ''}" role="group" aria-label="Chat"${sheetStyle()}>
  <button class="grabber" data-action="sheet-toggle" aria-label="${sheetPeek() ? 'Show more' : 'Show less'}"></button>
  <div class="sheetBody scroll" data-mode="${nameQuery() ? `q:${esc(nameQuery())}` : quickShown() ? 'quick' : 'chat'}">${sheetBody()}</div>
</div>`;

const openChat = () => {
  if (!view.composer) view.trayEnter = true;
  if (!view.composer) SHEET_SMALL = 360;
  view.composer = true;
  if (!view.composerDate) view.composerDate = todayIso();
};

// After sending, the conversation opens small right above the box: the note at once, then the reply sliding in,
// newest at the bottom; scroll up for older ones. A tap outside closes it as usual.
const showChat = () => {
  openChat();
  view.showQuick = false;
  view.quickHidden = true;
  if (typeof view.sheetH !== 'number' || view.sheetH <= SHEET_PEEK + 4) view.sheetH = SHEET_SMALL;
};
// The chat sits at the bottom of the panel (newest last). With Quick add, the latest messages sit in a short strip
// above it (newest showing, scroll it for older) and Quick add stays in full view under it.
// Where the panel rests when it opens: the chat at its newest message; with Quick add, the "Your log" line just under
// the middle, so the latest messages show above it and Quick add's first rows below.
// Quick add always keeps its heading and about two rows in view (150 px), however short the panel is; the log gets the rest.
// With Quick add: the first three picks (Import and your top two lifts) sit fully in view at the bottom, and the
// chat gets what's above them, never less than CHAT_PEEK; a panel too short for both grows (up to the room there is).
const CHAT_PEEK = 64;
// Layout positions (offsets), so it also holds when the phone is turned and the app is drawn rotated.
const offsetY = (element) => {
  let y = 0;
  for (let node = element; node; node = node.offsetParent) y += node.offsetTop;
  return y;
};
const inBody = (body, element, edge) => offsetY(element) - offsetY(body) + (edge === 'bottom' ? element.offsetHeight : 0);
const quickEnd = (body) => {
  const picks = body.querySelectorAll('.quickAdd .picks .pick');
  return picks.length ? inBody(body, picks[Math.min(2, picks.length - 1)], 'bottom') + 10 : 0;
};
const restingScroll = (body) => {
  const hint = body.querySelector('.logHint');
  // Quick add with no log yet opens at its top, so Import and the first lifts show.
  if (!hint) return body.querySelector('.quickAdd') ? 0 : body.scrollHeight;
  const end = quickEnd(body);
  if (!end) return Math.max(0, hint.offsetTop - body.offsetTop - Math.round(Math.max(body.clientHeight * 0.35, body.clientHeight - 150)));
  return Math.max(0, Math.min(Math.round(end - body.clientHeight), Math.round(inBody(body, hint, 'top') - CHAT_PEEK)));
};
const fitQuick = (body) => {
  const hint = body.querySelector('.logHint');
  const sheet = body.closest('.sheet');
  const end = quickEnd(body);
  if (!hint || !sheet || !end || !sheetSmall()) return;
  const short = end - (inBody(body, hint, 'top') - CHAT_PEEK) - body.clientHeight;
  if (short <= 2) return;
  const room = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sheet-room')) || window.innerHeight;
  const height = Math.round(Math.min(room, sheet.offsetHeight + short));
  if (height <= sheet.offsetHeight + 2) return;
  SHEET_SMALL = height;
  view.sheetH = height;
  sheet.style.height = `${height}px`;
};
const scrollChat = (again = true) => {
  const body = document.querySelector('.sheetBody');
  if (!body) return;
  fitQuick(body);
  body.scrollTop = restingScroll(body);
  body.dataset.rest = String(body.scrollTop);
  // The panel's content settles a moment after it opens (fonts, wrapping): settle again then, unless you've scrolled it.
  if (again) for (const wait of [350, 900]) setTimeout(() => {
    const now = document.querySelector('.dock .sheetBody');
    if (now && view.composer && now.dataset.rest && Math.abs(now.scrollTop - Number(now.dataset.rest)) < 4) scrollChat(false);
  }, wait);
};
// The iPhone keyboard shrinks the panel after it opened; settle it again unless you've scrolled it yourself.
const resettle = () => {
  const body = document.querySelector('.dock .sheetBody');
  if (body && view.composer && body.dataset.rest && Math.abs(body.scrollTop - Number(body.dataset.rest)) < 4) scrollChat();
};

const animateChat = (opening) => {
  const dock = document.querySelector('.dock');
  const sheet = dock?.querySelector('.sheet');
  if (!sheet || reducedMotion.matches) return Promise.resolve();
  const hidden = `inset(${sheet.offsetHeight + 8}px 0px 0px 0px round 20px 20px 0px 0px)`;
  const shown = 'inset(0px 0px 0px 0px round 20px 20px 0px 0px)';
  const timing = opening ? { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' } : { duration: 180, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' };
  document.querySelector('.chatScrim')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: timing.duration, direction: opening ? 'normal' : 'reverse', fill: 'forwards' });
  sheet.querySelector('.sheetBody').animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { ...timing, direction: opening ? 'normal' : 'reverse' });
  return dock.animate(opening ? [{ clipPath: hidden }, { clipPath: shown }] : [{ clipPath: shown }, { clipPath: hidden }], timing).finished.catch(() => null);
};

const promptButtons = () => {
  if (view.listening) return `<div class="promptButtons"><button class="roundBtn stopBtn" data-action="stop-mic" aria-label="Stop listening">${ICONS.stop}</button><button class="roundBtn send" data-action="send" aria-label="Log it">${ICONS.up}</button></div>`;
  const hasText = view.draft.trim().length > 0 || Boolean(view.voiceBlob) || Boolean(view.files?.length);
  return `<div class="promptButtons">${hasText
    ? `<button class="roundBtn soft" data-action="mic" aria-label="Speak">${ICONS.mic}</button><button class="roundBtn send" data-action="send" aria-label="Log it">${ICONS.up}</button>`
    : `<button class="roundBtn send" data-action="mic" aria-label="Speak">${ICONS.mic}</button>`}</div>`;
};

const fileChips = () => (view.files || []).map((file, index) => `<div class="contextChip fileChip"><span class="contextKind">${ICONS.clip}</span><span class="contextLabel">${esc(file.name)}</span><button class="contextX" data-action="unfile" data-index="${index}" aria-label="Remove ${esc(file.name)}">${ICONS.close}</button></div>`).join('');
const contextChip = () => {
  const chips = fileChips() + otherChip();
  return chips ? `<div class="promptChips">${chips}</div>` : '';
};
const otherChip = () => {
  const [kind, label, action, aria] = view.replyTo ? ['Replying to', view.replyTo.title, 'clear-reply', 'Stop replying']
    : view.fixing ? ['Fixing', 'an earlier message', 'clear-edit', 'Stop fixing']
    : view.editContext ? ['Editing', `${view.editContext.label || view.editContext.names.join(', ') || 'Workout'} · ${dayLabel(view.editContext.date)}`, 'clear-edit', 'Stop editing']
    : view.composerDate && view.composerDate !== todayIso() ? ['Adding to', dayLabel(view.composerDate), 'clear-day', 'Add to today instead'] : [];
  return kind ? `<div class="contextChip"><span class="contextKind">${kind}</span><span class="contextLabel">${esc(label)}</span><button class="contextX" data-action="${action}" aria-label="${aria}">${ICONS.close}</button></div>` : '';
};

// Admin and Feedback show everything on the page itself, so the box never opens a panel over them.
const showSheet = () => view.composer && ((view.route !== 'admin' && view.route !== 'feedback') || Boolean(view.showQuick));

// /admin typed in any box turns clay (the box can't colour part of its own text, so a copy sits behind it) and is suggested while you type "/".
// Slash commands in the box turn red: /admin (Marcus only) sends the rest to Claude to build; /feedback (anyone)
// sends the rest as feedback to Marcus. Typing "/" or the start of one offers it.
const SLASHES = [['/admin', 'Send this to Exodia', true], ['/note', 'Add a note to a session', false], ['/feedback', 'Send this as feedback', false], ['/help', 'How Exodia works', false]];
const slashCommand = () => SLASHES.find(([cmd, , admin]) => (!admin || view.isAdmin) && new RegExp(`^\\${cmd}(\\s|$)`, 'i').test(view.draft))?.[0] || '';
const slashOn = () => Boolean(slashCommand());
// "/" lists every command; "/h" narrows it; the bare word ("help", "feedback") offers its command too, Tab takes it.
const slashOffer = () => {
  const typed = view.draft.trim().toLowerCase();
  const allowed = SLASHES.filter(([cmd, , admin]) => !admin || view.isAdmin);
  if (/^\/[a-z]*$/.test(view.draft.toLowerCase())) return allowed.filter(([cmd]) => cmd.startsWith(view.draft.toLowerCase()));
  return /^[a-z]{4,}$/.test(typed) ? allowed.filter(([cmd]) => cmd.slice(1).startsWith(typed)) : [];
};
const slashSuggest = () => slashOffer().length > 0;
const slashListHtml = () => slashOffer().map(([cmd, what]) => `<button class="slashSuggest" data-action="slash-admin" data-cmd="${cmd}"><b>${cmd}</b> ${what}</button>`).join('');
const slashHtml = () => {
  const cmd = slashCommand();
  return cmd ? `<span class="slashCmd">${esc(view.draft.slice(0, cmd.length))}</span>${esc(view.draft.slice(cmd.length))}\u200b` : '';
};
const paintSlash = () => {
  const prompt = document.querySelector('.prompt');
  if (!prompt) return;
  prompt.classList.toggle('slashOn', slashOn());
  const mirror = prompt.querySelector('.promptMirror');
  if (mirror) {
    mirror.innerHTML = slashHtml();
    mirror.scrollTop = document.getElementById('draft')?.scrollTop || 0;
  }
  const list = document.querySelector('.slashList');
  if (list) {
    const html = slashListHtml();
    if (list.innerHTML !== html) list.innerHTML = html;
    list.hidden = !html;
  }
};
// Over the Admin box: how your latest request is going (sending, failed with Try again, building, live) for 10
// minutes, so a request never seems to vanish; otherwise what the box does.
const adminDockLine = () => {
  const run = (state.claudeRuns || [])[0];
  if (run?.status === 'sending') return writingLine('Sending to Exodia builder');
  if (buildingNow()) return writingLine('Exodia is building');
  if (run && Date.now() - (run.doneAt || run.at) < 10 * 60000) return runStatus(run);
  return 'Exodia builds whatever you write or say here';
};
const renderDock = () => `<div class="dock${showSheet() ? ' open' : ''}">
  ${showSheet() ? renderSheet() : ''}
  ${view.outlierAsk?.length && !view.importConfirm ? `<div class="confirm" role="alertdialog" aria-label="Check a set"><p>${esc(outlierText())}</p><div class="confirmRow"><button class="textBtn" data-action="outlier-no">Leave out</button><button class="confirmYes" data-action="outlier-yes">Add it</button></div></div>` : ''}
  ${view.importConfirm ? `<div class="confirm" role="alertdialog" aria-label="Confirm import"><p>${esc(importConfirmText())}</p>${view.importConfirm.unclear ? `<p class="confirmNote">${esc(view.importConfirm.unclear)}</p>` : ''}<div class="confirmRow"><button class="textBtn" data-action="import-no">Cancel</button><button class="confirmYes" data-action="import-yes">Add it</button></div></div>` : ''}
  ${view.askGuess && askedOpen() && !view.confirm ? `<div class="confirm askGuess" role="alertdialog" aria-label="Did you mean"><p>Did you mean <b>${esc(view.askGuess)}</b>?</p><div class="confirmRow"><button class="textBtn" data-action="guess-no">No, I'll fill it in</button><button class="confirmYes" data-action="guess-yes">Yes, log it</button></div></div>` : ''}
  ${view.confirm ? `<div class="confirm" role="alertdialog" aria-label="Confirm removal"><p>Remove ${esc(view.confirm.text)}?</p><div class="confirmRow"><button class="textBtn" data-action="confirm-no">Cancel</button><button class="confirmYes" data-action="confirm-yes">Yes, remove</button></div></div>` : ''}
  ${view.status ? `<p class="dockStatus${askedOpen() && view.status === view.asked.question ? ' asking' : ''}" role="status">${esc(view.status)}</p>` : ''}${view.route === 'admin' && view.isAdmin ? `<p class="dockStatus" role="status">${adminDockLine()}</p>` : ''}
  <div class="slashList"${slashSuggest() ? '' : ' hidden'}>${slashListHtml()}</div>
  <div class="prompt${view.promptFlash && Date.now() - view.promptFlash < 2600 ? ' flash' : ''}${slashOn() ? ' slashOn' : ''}${view.draft.trim() ? ' hasText' : ''}${view.listening ? ' listening' : ''}${contextChip() ? ' hasChip' : ''}" style="--flashAt:-${view.promptFlash ? Math.min(2600, Date.now() - view.promptFlash) : 0}ms">
    ${contextChip()}
    <label for="draft" class="sr">Type or say what you did</label>
    <div class="promptMirror" aria-hidden="true">${slashHtml()}</div>
    <textarea id="draft" class="promptInput" rows="1" enterkeyhint="send" autocomplete="off">${esc(view.draft)}</textarea>
    ${view.listening
      ? `<span class="hint live" aria-hidden="true"><span class="liveText">${esc(liveLine())}</span></span>`
      : view.voiceBlob && !view.draft.trim() ? '<span class="hint live" aria-hidden="true"><span class="liveText">Voice note ready · tap ↑ to log it</span></span>'
      : view.files?.length && !view.draft.trim() ? '<span class="hint live" aria-hidden="true"><span class="liveText">Add a note (like when it started) or tap ↑</span></span>'
      : askedOpen() && !view.draft.trim() ? `<span class="hint live" aria-hidden="true"><span class="liveText">${esc(exampleAnswer(view.asked.question))}</span></span>`
      : `<span class="hint${typewriter.fading ? ' fading' : ''}" aria-hidden="true">${hintHtml(typewriter.text)}</span>`}
    <div class="promptBar">${view.listening ? `<button class="roundBtn soft" data-action="cancel-mic" aria-label="Discard what you said">${ICONS.close}</button><span class="wave${view.speaking ? ' speaking' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>` : `${state.sessions.length ? '<button class="roundBtn soft plusBtn" data-action="open-quick" aria-label="Quick add">' + ICONS.plus + '</button>' : `<button class="roundBtn soft plusBtn" data-action="pick-file" aria-label="Add a file with your training">${ICONS.clip}</button>`}<span class="modelTag">Exodia <span class="modelVersion">1.0</span></span>`}${promptButtons()}</div>
  </div>
</div>`;

const fitDraft = (draft) => {
  draft.style.height = 'auto';
  draft.style.height = `${draft.scrollHeight}px`;
  // Taller than the box allows: the text scrolls inside, with a soft fade at the edge instead of a hard cut.
  draft.classList.toggle('overflowing', draft.scrollHeight > draft.clientHeight + 2);
};

const syncDock = () => {
  const dock = document.querySelector('.dock');
  const prompt = dock?.querySelector('.prompt');
  if (!prompt) return;
  prompt.classList.toggle('hasText', view.draft.trim().length > 0);
  prompt.querySelector('.promptButtons').outerHTML = promptButtons();
  const sheet = dock.querySelector('.sheet');
  if (showSheet() && (!sheet || sheet.classList.contains('leaving'))) {
    sheet?.remove();
    document.querySelector('.chatScrim')?.remove();
    dock.getAnimations().forEach((animation) => animation.cancel());
    dock.classList.add('open');
    dock.insertAdjacentHTML('afterbegin', renderSheet());
    dock.insertAdjacentHTML('beforebegin', '<div class="chatScrim"></div>');
    tuckCards();
    scrollChat();
    animateChat(true);
  } else if (showSheet()) {
    sheet.classList.toggle('quickMode', quickShown());
    sheet.classList.toggle('nameMode', Boolean(nameQuery()));
    const body = sheet.querySelector('.sheetBody');
    const mode = nameQuery() ? `q:${nameQuery()}` : quickShown() ? 'quick' : 'chat';
    if (body.dataset.mode !== mode) {
      if (mode.startsWith('q:') && sheetPeek()) setSheet(null);
      body.dataset.mode = mode;
      body.innerHTML = sheetBody();
      scrollChat();
    }
  } else if (sheet && !sheet.classList.contains('leaving')) {
    sheet.classList.add('leaving');
    animateChat(false).then(() => {
      if (view.composer || !sheet.isConnected) return;
      sheet.remove();
      document.querySelector('.chatScrim')?.remove();
      dock.classList.remove('open');
      dock.getAnimations().forEach((animation) => animation.cancel());
      tuckCards();
    });
  }
  tuckCards();
};

// About one in four is a command, its /word typed in clay like a command you type yourself; never the first.
const EXAMPLES = ['Bench 100 kg 3x5, then rows 60 kg 3x10', 'Squat 140 for 5, 5 and 5 at RPE 8', 'Deadlift 200 x 3 yesterday', '/note felt heavy today, try a wider grip next time', 'Pull-ups 3x8, dips 3x12', 'Paste notes from any app, even years of them', 'Incline dumbbell 32 kg 3x10 last Friday', 'Walked 40 min', '/help for tips and exports', 'Type / to see every command'];
// The hint is a span over the box, so the /word in it can take the same clay look as .slashCmd.
const hintHtml = (text) => esc(text).replace(/(^|\s)(\/[a-z]*)/i, '$1<span class="slashCmd">$2</span>');
// After a few logged days people know what the box does, so the typing examples step aside for one quiet line.
const QUIET_HINT = 'Log training, paste notes or give feedback';
const KNOWN_EXAMPLES = [QUIET_HINT, 'Bench 100 kg 3x5, then rows 60 kg 3x10', '/note their benches felt worse than Eleiko', QUIET_HINT, 'Squat 140 for 5, 5 and 5 at RPE 8', '/help for tips and exports', QUIET_HINT, 'Deadlift 200 x 3 yesterday', 'Type / to see every command'];
const knowsTheBox = () => state.sessions.filter((session) => session.exercises?.length).length >= 5;
const typewriter = { text: '', index: 0, length: 0, fading: false };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
(window.requestIdleCallback || setTimeout)(preloadHands);

const tickTypewriter = () => {
  // People who know the box get the quiet line, held still, with a command typed out in orange between.
  const examples = view.route === 'feedback' ? FEEDBACK_EXAMPLES : view.route === 'admin' ? CLAUDE_EXAMPLES : knowsTheBox() ? KNOWN_EXAMPLES : EXAMPLES;
  typewriter.index %= examples.length;
  let delay = 70 + Math.random() * 60;
  if (reducedMotion.matches) {
    typewriter.index = (typewriter.index + 1) % examples.length;
    typewriter.length = examples[typewriter.index].length;
    delay = 4500;
  } else if (typewriter.fading) {
    typewriter.fading = false;
    typewriter.length = 0;
    typewriter.index = (typewriter.index + 1) % examples.length;
    delay = 600;
  } else if (examples[typewriter.index] === QUIET_HINT && typewriter.length < QUIET_HINT.length) {
    typewriter.length = QUIET_HINT.length;
    delay = 9000;
  } else if (typewriter.length < examples[typewriter.index].length) {
    typewriter.length += 1;
    if (typewriter.length === examples[typewriter.index].length) delay = 3400;
  } else {
    typewriter.fading = true;
    delay = 800;
  }
  typewriter.text = examples[typewriter.index].slice(0, typewriter.length);
  const hint = document.querySelector('.dock:not(.onboardDock) .prompt .hint:not(.live)');
  if (hint) {
    hint.classList.toggle('fading', typewriter.fading);
    hint.innerHTML = hintHtml(typewriter.text);
  }
  setTimeout(tickTypewriter, delay);
};

const setVar = (name, value) => {
  if (document.documentElement.style.getPropertyValue(name) !== value) document.documentElement.style.setProperty(name, value);
};

// iOS web apps can't lock rotation, so in phone landscape the whole UI turns back to portrait.
// Only the phone itself being sideways counts: an open keyboard also makes the window wider than tall,
// and turning the app then put the box under the keyboard and moved every tap.
const turnQuery = window.matchMedia('(orientation: landscape) and (pointer: coarse) and (max-height: 520px)');
const coarseQuery = window.matchMedia('(pointer: coarse)');
let turn = 0;
const phoneSideways = () => {
  if (!coarseQuery.matches || Math.min(screen.width, screen.height) > 520) return false;
  const angle = screen.orientation?.angle ?? window.orientation;
  if (typeof angle === 'number') return angle % 180 !== 0;
  return screen.width > screen.height;
};
const turnUi = () => {
  const angle = screen.orientation?.angle ?? window.orientation ?? 0;
  turn = phoneSideways() ? (angle === 90 ? -90 : 90) : 0;
  const root = document.documentElement;
  root.classList.toggle('turned', Boolean(turn));
  root.dataset.turn = turn;
  setVar('--vw', `${window.innerWidth}px`);
  setVar('--vh', `${window.innerHeight}px`);
};
const scroller = () => (turn ? document.getElementById('app') : document.scrollingElement);
const scrollPage = (top) => scroller().scrollTo(0, top);
const uiPoint = (event) => turn === -90 ? { x: -event.clientY, y: event.clientX } : turn === 90 ? { x: event.clientY, y: -event.clientX } : { x: event.clientX, y: event.clientY };
const uiBox = (el) => {
  const box = el.getBoundingClientRect();
  if (turn === -90) return { top: box.left, bottom: box.right, height: box.width };
  if (turn === 90) return { top: window.innerWidth - box.right, bottom: window.innerWidth - box.left, height: box.width };
  return box;
};
turnUi();
turnQuery.addEventListener('change', turnUi);
screen.orientation?.addEventListener('change', turnUi);
window.addEventListener('orientationchange', turnUi);
window.addEventListener('resize', () => { turnUi(); fitNames(); placeTopRight(); });

const SHORTER = [[/\bExtensions?\b/, 'Ext.'], [/\b(Single|One)[ -]Arm\b/i, '1-Arm'], [/\bDumbbell\b/, 'DB'], [/\bBarbell\b/, 'BB'], [/\bOverhead\b/, 'OH'], [/\bMachine\b/, 'Mach.'], [/\bIncline\b/, 'Inc.'], [/\bDecline\b/, 'Dec.'], [/\bAbduction\b/, 'Abd.'], [/\bAdduction\b/, 'Add.'], [/\bRomanian Deadlift\b/, 'RDL']];
const fitNames = () => {
  for (const el of document.querySelectorAll('.dayLift, .exName, .liftName')) {
    if (el.childElementCount) continue;
    if (!el.dataset.full) el.dataset.full = el.textContent;
    let name = el.dataset.full;
    el.textContent = name;
    for (const [pattern, short] of SHORTER) {
      if (el.scrollWidth <= el.clientWidth + 1) break;
      if (pattern.test(name)) el.textContent = name = name.replace(pattern, short);
    }
    if (name !== el.dataset.full) el.title = el.dataset.full;
  }
};

// Top right, right to left: the Trends/Home icon, then the red pill, then the dev button, each tight against the
// next one, measured from where the icon really is (the bar is centred on wider windows, so fixed offsets drifted).
const placeTopRight = () => {
  const pill = document.querySelector('.leftPill');
  const devs = [...document.querySelectorAll('.devBtn')].filter((button) => !button.closest('.side'));
  let edge;
  // Computer: the dot sits in the sidebar beside the name (styles.css), nothing to line up.
  if (desktopQuery.matches) {
    if (pill) pill.style.right = '';
    return;
  } else {
    const icon = document.querySelector('.topbarInner > .iconBtn:last-child');
    if (!icon) return;
    if (turn) return;
    edge = icon.getBoundingClientRect().left;
  }
  if (pill) {
    const width = pill.getBoundingClientRect().width;
    pill.style.right = `${Math.round(window.innerWidth - edge + (desktopQuery.matches ? 0 : 2))}px`;
    edge -= width + (desktopQuery.matches ? 0 : 2);
  }
  for (const dev of devs) {
    const inBar = getComputedStyle(dev).position === 'absolute' && dev.offsetParent;
    const right = inBar ? dev.offsetParent.getBoundingClientRect().right : window.innerWidth;
    dev.style.left = 'auto';
    dev.style.right = `${Math.round(right - edge + 2)}px`;
  }
};
// Phone: the back figure shifts a few pixels so its head sits right under the Exodia logo in the header as you scroll,
// a hint that the head can become Exodia.
// Measured on the drawn page, not worked out from sizes, so it holds in Safari and Chrome alike and after the header's
// font has loaded: the shift needed is the logo's centre minus where the head is now, plus the shift it already has.
const alignBackHead = () => {
  const back = document.querySelectorAll('.page .bodyFig')[1];
  const logo = document.querySelector('.brand .logo') || document.querySelector('.logo');
  if (!back) return;
  if (desktopQuery.matches || !logo) {
    back.style.transform = '';
    return;
  }
  const head = back.querySelector('[data-head]')?.getBoundingClientRect();
  const mark = logo.getBoundingClientRect();
  if (!head?.width || !mark.width) return;
  const now = Number(back.dataset.shift) || 0;
  const shift = now + (mark.x + mark.width / 2) - (head.x + head.width / 2);
  if (Math.abs(shift) > 24 || Math.abs(shift - now) < 0.1) return;
  back.dataset.shift = shift.toFixed(2);
  back.style.transform = `translateX(${shift.toFixed(2)}px)`;
};
// The strength web: its outer ring's centre goes to the screen's centre (phone), measured the same way.
const centreWeb = () => {
  const web = document.querySelector('.page svg.web');
  const ring = web?.querySelector('.webRing.tierElite');
  if (!web || !ring) return;
  if (desktopQuery.matches) {
    web.style.transform = '';
    return;
  }
  const box = ring.getBoundingClientRect();
  if (!box.width) return;
  const now = Number(web.dataset.shift) || 0;
  const shift = now + window.innerWidth / 2 - (box.x + box.width / 2);
  if (Math.abs(shift) > 40 || Math.abs(shift - now) < 0.1) return;
  web.dataset.shift = shift.toFixed(2);
  web.style.transform = `translateX(${shift.toFixed(2)}px)`;
};
let alignFrame = 0;
const alignSoon = () => {
  if (alignFrame) return;
  alignFrame = requestAnimationFrame(() => {
    alignFrame = 0;
    alignBackHead();
    centreWeb();
  });
};
window.addEventListener('scroll', alignSoon, { passive: true });
document.getElementById('app')?.addEventListener('scroll', alignSoon, { passive: true });
// The figure moves a little once the text font has loaded; line it up again then.
document.fonts?.ready.then(alignSoon);
document.fonts?.addEventListener?.('loadingdone', alignSoon);
const tuckCards = () => {
  placeTopRight();
  alignBackHead();
  centreWeb();
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const sheet = dock.querySelector('.sheet');
  const box = dock.offsetHeight - (sheet ? sheet.offsetHeight + 8 : 0);
  setVar('--dock-h', `${box}px`);
  const tall = turn ? window.innerWidth : window.visualViewport?.height || window.innerHeight;
  // Never taller than the room under the top bar: on a small phone with the keyboard up, Import from a file stays in sight.
  const room = tall - box - 64;
  setVar('--sheet-room', `${Math.max(60, Math.round(room))}px`);
  setVar('--sheet-h', `${Math.round(Math.max(Math.min(180, room), Math.min(720, tall - box - (desktopQuery.matches ? 64 : quickShown() ? 80 : Math.max(120, tall * 0.24)))))}px`);
  const line = uiBox(dock).bottom - box;
  // The Exodia card is never tucked: measured at a bad moment (keyboard opening, a turn, a redraw mid-scroll) it was
  // marked as under the box and stayed invisible at the top of Home.
  for (const card of document.querySelectorAll('.page .card:not(.exodiaCard)')) {
    const box = uiBox(card);
    const shown = line - box.top;
    card.classList.toggle('tucked', box.height <= 140 && shown < box.height);
  }
};
document.addEventListener('scroll', () => requestAnimationFrame(tuckCards), { passive: true, capture: true });
window.addEventListener('resize', tuckCards);
// iPhone: the keyboard covers the page instead of shrinking it, so the box is lifted by exactly the part the keyboard
// hides (--kb). Android shrinks the page itself, so --kb stays 0 there.
const fitKeyboard = () => {
  const viewport = window.visualViewport;
  if (!viewport || turn) return;
  const hidden = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
  setVar('--kb', `${hidden}px`);
  document.documentElement.classList.toggle('keyboard', hidden > 80);
};
for (const type of ['resize', 'scroll']) window.visualViewport?.addEventListener(type, () => requestAnimationFrame(() => {
  fitKeyboard();
  tuckCards();
  resettle();
}));
document.addEventListener('focusout', () => setTimeout(fitKeyboard, 60));

const onboarding = () => view.route === 'home' && (Boolean(view.onboard?.busy || view.onboard?.status) || (!state.name && !state.started && state.sessions.length === 0));

const ONBOARD_EXAMPLES = [
  'Mon 28 Oct\nBench 100 × 5, 5, 5\nIncline dumbbell 30s for 10',
  'Date,Exercise,Weight,Reps\n2026-10-28,Squat,140,5\n2026-10-28,Squat,140,5',
  'Last week I deadlifted 220 for 3,\nbench was 100 for 5 paused,\nand I ran 25 minutes on Friday',
  'Leg day 24/10\nHack squat 200×8, 200×8, 200×6\nLeg extension 70×12, 70×12'
];
const onboardExample = { index: 0, fading: false };

// Example data for people who just want to look around: about eight weeks of steady training for "Alex",
// ending at 4 of 5 Exodia pieces so one logged walk or run plays the hit.
const demoSessions = (weeks = 8) => {
  const today = todayIso();
  const sets = (kg, reps, count, rpe) => Array.from({ length: count }, () => ({ kg: String(kg), reps: String(reps), ...(rpe ? { rpe } : {}), edited: true }));
  const round = (kg) => Math.round(kg / 2.5) * 2.5;
  const days = [];
  for (let week = weeks - 1; week >= 0; week -= 1) {
    // Same start and end weights however long the example runs.
    const step = ((weeks - 1 - week) * 7) / (weeks - 1);
    const at = (offset) => addDays(today, -(week * 7 + offset));
    days.push({ date: at(6), label: 'Push day', exercises: [
      { name: 'Bench Press', sets: [...sets(round(80 + step * 2), 5, 3), ...sets(round(85 + step * 2), 3, 1, 8)] },
      { name: 'Overhead Press', sets: sets(round(45 + step), 8, 3) },
      { name: 'Incline Bench Press', sets: sets(round(62.5 + step * 1.5), 8, 3) },
      { name: 'Dumbbell Bench Press', sets: sets(round(26 + step * 0.5), 10, 3) },
    ] });
    days.push({ date: at(4), label: 'Pull day', exercises: [
      { name: 'Deadlift', sets: [...sets(round(140 + step * 3), 5, 2), ...sets(round(150 + step * 3), 3, 1, 8)] },
      { name: 'Barbell Row', sets: sets(round(65 + step * 1.5), 8, 3) },
      { name: 'Pull-up', sets: sets(0, Math.round(7 + step / 2), 3) },
      { name: 'Lat Pulldown', sets: sets(round(55 + step), 10, 3) },
    ] });
    days.push({ date: at(2), label: 'Leg day', exercises: [
      { name: 'Squat', sets: [...sets(round(105 + step * 3), 5, 3), ...sets(round(112.5 + step * 3), 3, 1, 8)] },
      { name: 'Leg Press', sets: sets(round(160 + step * 5), 10, 3) },
      { name: 'Leg Curl', sets: sets(round(45 + step), 12, 3) },
    ] });
    days.push({ date: at(1), label: 'Arm day', exercises: [
      { name: 'Dumbbell Curl', sets: sets(round(12 + step * 0.5), 10, 3) },
      { name: 'Triceps Pushdown', sets: sets(round(25 + step), 12, 3) },
    ], cardio: week % 2 === 0 ? 30 : 0 });
  }
  days.push({ date: addDays(today, -3), label: 'Push day', exercises: [
    { name: 'Bench Press', sets: [...sets(97.5, 5, 3), ...sets(102.5, 2, 1, 9)] },
    { name: 'Overhead Press', sets: sets(52.5, 8, 3) },
  ] });
  const byDate = new Map();
  for (const day of days.filter((day) => day.date <= today)) byDate.set(day.date, { accessories: 30, cardio: 0, ...day, ...(byDate.get(day.date) || {}) });
  return [...byDate.values()];
};
const startDemo = () => {
  // Example workouts, but never a made-up name: use the one they typed, or none.
  state = { version: 1, deviceId: state.deviceId, sessions: demoSessions(), bests: {}, name: (view.onboard?.name || '').trim(), demo: true };
  view.onboard = null;
  view.open = new Set();
  lastSaved = localJson();
  lastMeta = metaJson();
  writeLocal();
  location.hash = '#/';
  render();
};
const endDemo = () => {
  state = { version: 1, deviceId: state.deviceId, sessions: [], bests: {} };
  view.onboard = null;
  view.open = new Set([todayIso()]);
  lastSaved = localJson();
  lastMeta = metaJson();
  writeLocal();
  location.hash = '#/';
  render();
};
// After an update a small pill says so for about a minute. Swipe it away or let it go; the update itself needs no tap.
const VERSION_KEY = 'exodia.version';
const NOTES_KEY = 'exodia.openNotes';
const updatedLines = () => {
  const list = view.updated?.changes || [];
  return list.length ? list : ['Small improvements and fixes'];
};
// "Exodia updated": one small clay pill with the newest change and "+N more". A tap grows the same element in place to
// show the rest, a tap outside shrinks it back and it goes. If the new version is still waiting to load, the tap loads
// it and the pill comes back already open.
const updatedPill = () => {
  if (state.demo || !(view.updated || view.updateReady)) return '';
  const open = Boolean(view.updated?.open);
  const still = view.updatedShown ? ' still' : '';
  view.updatedShown = true;
  const lines = view.updated ? updatedLines() : [];
  const more = !view.updated ? 'Tap to see' : lines.length > 1 ? `Show all ${lines.length}` : 'Show more';
  const version = view.isAdmin && view.updated ? ` · v${view.updated.version}` : '';
  return `<div class="updatedPill${open ? ' open' : ''}${still}" data-sig="${view.updated?.version || 'ready'}-${open}-${lines.length}" role="status"><button class="updatedMain" data-action="toggle-updated" aria-expanded="${open}"><span class="updatedDot" aria-hidden="true"></span><span class="updatedLead">${esc(lines[0] || 'Exodia updated')}</span><span class="updatedTitle">What’s new${version}</span><span class="updatedMore">${more}</span><svg class="updatedChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>${lines.length ? `<ul class="updatedNotes">${lines.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}</div>`;
};
// Grow or shrink the pill between its measured sizes without redrawing it. The content is laid out at the end size
// from the first frame, so no text reflows while the edge moves; closing drops back to one line and the notes fade.
const sizeUpdated = (pill, open, after) => {
  const from = pill.getBoundingClientRect();
  pill.style.transition = 'none';
  pill.style.width = '';
  pill.style.height = '';
  pill.classList.toggle('open', open);
  const to = pill.getBoundingClientRect();
  pill.style.setProperty('--updatedW', `${to.width}px`);
  pill.classList.add('sizing');
  pill.style.width = `${from.width}px`;
  pill.style.height = `${from.height}px`;
  void pill.offsetWidth;
  pill.style.transition = '';
  pill.style.width = `${to.width}px`;
  pill.style.height = `${to.height}px`;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    pill.classList.remove('sizing');
    pill.style.width = '';
    pill.style.height = '';
    after?.();
  };
  pill.addEventListener('transitionend', (event) => { if (event.target === pill && event.propertyName === 'height') finish(); });
  setTimeout(finish, 380);
};
const toggleUpdated = (open = !view.updated?.open, after) => {
  if (!view.updated) return after?.();
  view.updated.open = open;
  const pill = document.querySelector('.updatedPill');
  pill?.querySelector('.updatedMain')?.setAttribute('aria-expanded', String(open));
  if (pill) pill.dataset.sig = `${view.updated.version}-${open}-${updatedLines().length}`;
  if (pill && !reducedMotion.matches) return sizeUpdated(pill, open, after);
  pill?.classList.toggle('open', open);
  after?.();
};
const hideUpdated = () => {
  view.updated = null;
  const pill = document.querySelector('.updatedPill');
  if (!pill) return;
  pill.classList.add('gone');
  setTimeout(() => pill.remove(), 220);
};
const installedVersion = () => {
  try {
    return Number(localStorage.getItem(VERSION_KEY)) || 0;
  } catch {
    return 0;
  }
};
const noteUpdate = async () => {
  if (!window.caches) return;
  const keys = await caches.keys().catch(() => []);
  const version = Math.max(0, ...keys.map((key) => Number(key.match(/^exodia-v(\d+)$/)?.[1]) || 0));
  if (!version) return;
  let seen = 0;
  try {
    seen = Number(localStorage.getItem(VERSION_KEY)) || 0;
    localStorage.setItem(VERSION_KEY, String(version));
  } catch {
    return;
  }
  let openNotes = false;
  try {
    openNotes = sessionStorage.getItem(NOTES_KEY) === '1';
    sessionStorage.removeItem(NOTES_KEY);
  } catch { /* closed */ }
  if (!seen || seen >= version) return;
  // Shown once its notes are in, so the teaser is right from the first frame (never a placeholder that swaps).
  const show = (changes) => {
    if (view.updated?.version === version) return;
    view.updated = { version, from: seen, changes, open: openNotes };
    render();
    setTimeout(() => {
      if (view.updated?.version === version && !view.updated.open) hideUpdated();
    }, 120000);
  };
  setTimeout(() => show([]), 4000);
  fetch('/changes.json').then((response) => response.json()).then((all) => {
    show(Object.keys(all).map(Number).filter((v) => v > seen && v <= version).sort((a, b) => b - a).flatMap((v) => all[v]).slice(0, 40));
  }).catch(() => show([]));
};
// Closed, the pill waits: a tap on it (or within a finger's width of it) opens it, a tap elsewhere leaves it be, and
// it goes by itself after 2 minutes. Open, a tap anywhere outside shrinks it and it goes for good. pointerdown,
// because iPhone Safari sends no click for a tap on plain page.
const UPDATED_SLOP = 16;
document.addEventListener('pointerdown', (event) => {
  if (!view.updated || event.target.closest('.updatedPill')) return;
  const pill = document.querySelector('.updatedPill');
  if (view.updated.open) {
    view.updatedClosedAt = Date.now();
    toggleUpdated(false, hideUpdated);
    return;
  }
  const box = pill?.getBoundingClientRect();
  if (box && event.clientX > box.left - UPDATED_SLOP && event.clientX < box.right + UPDATED_SLOP && event.clientY > box.top - UPDATED_SLOP && event.clientY < box.bottom + UPDATED_SLOP) {
    // A near miss counts as a tap on the pill; the click that follows is swallowed so nothing under it fires.
    view.updatedClosedAt = Date.now();
    toggleUpdated(true);
  }
}, true);
// Any banner (Undo, a PR, what was added, Sent to Marcus, Exodia is on it) swipes away like "Exodia updated": it
// follows the finger sideways or up and fades; let go far or fast enough and it glides off and is gone, otherwise it
// springs back. A tap still does what it did.
let bannerSwipe = null;
let bannerSwipedAt = 0;
document.addEventListener('pointerdown', (event) => {
  const banner = event.target.closest('.toast, .buildBanner');
  bannerSwipe = banner && !event.target.closest('.toastMore') ? { banner, x: event.clientX, y: event.clientY, t: event.timeStamp, dx: 0, dy: 0, moved: false } : null;
});
document.addEventListener('pointermove', (event) => {
  const swipe = bannerSwipe;
  if (!swipe) return;
  swipe.dx = event.clientX - swipe.x;
  swipe.dy = Math.min(0, event.clientY - swipe.y);
  if (!swipe.moved && Math.hypot(swipe.dx, swipe.dy) < 14) return;
  swipe.moved = true;
  swipe.banner.style.transition = 'none';
  swipe.banner.style.transform = `translate(${swipe.dx}px, ${swipe.dy}px)`;
  swipe.banner.style.opacity = String(Math.max(0.2, 1 - Math.max(Math.abs(swipe.dx) / 260, -swipe.dy / 90)));
});
for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, (event) => {
  const swipe = bannerSwipe;
  bannerSwipe = null;
  if (!swipe?.moved) return;
  bannerSwipedAt = Date.now();
  const { banner, dx, dy } = swipe;
  const time = Math.max(1, event.timeStamp - swipe.t);
  const away = Math.abs(dx) > 90 || dy < -40 || Math.abs(dx) / time > 0.5 || -dy / time > 0.4;
  if (!away) {
    banner.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease';
    banner.style.transform = '';
    banner.style.opacity = '';
    return;
  }
  const sideways = Math.abs(dx) > -dy;
  banner.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
  banner.style.transform = sideways ? `translate(${Math.sign(dx) * (innerWidth + 40)}px, ${dy}px)` : `translate(${dx}px, -160px)`;
  banner.style.opacity = '0';
  setTimeout(() => {
    if (banner.classList.contains('toast')) {
      clearTimeout(view.toastTimer);
      view.toast = null;
    } else view.bannerHidden = Number(banner.querySelector('[data-at]')?.dataset.at) || view.bannerHidden;
    render();
  }, 220);
});
document.addEventListener('click', (event) => {
  if (Date.now() - bannerSwipedAt < 350 && event.target.closest('.toast, .buildBanner')) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
// Swiping "Exodia updated" away: it follows the finger and fades as it goes; let go far or fast enough and it glides
// off that way, otherwise it springs back. A plain tap still opens the notes.
let updatedSwipe = null;
document.addEventListener('pointerdown', (event) => {
  const pill = event.target.closest('.updatedPill');
  updatedSwipe = pill && !event.target.closest('.updatedNotes') ? { pill, x: event.clientX, y: event.clientY, t: event.timeStamp, dx: 0, dy: 0, moved: false } : null;
});
document.addEventListener('pointermove', (event) => {
  if (!updatedSwipe) return;
  const swipe = updatedSwipe;
  swipe.dx = event.clientX - swipe.x;
  swipe.dy = Math.min(0, event.clientY - swipe.y);
  // A tap that wobbles a few pixels is still a tap (iPhone fingers move a little); only a real drag swipes it.
  if (!swipe.moved && Math.hypot(swipe.dx, swipe.dy) < 14) return;
  swipe.moved = true;
  swipe.pill.style.transition = 'none';
  swipe.pill.style.transform = `translate(calc(-50% + ${swipe.dx}px), ${swipe.dy}px)`;
  swipe.pill.style.opacity = String(Math.max(0.2, 1 - Math.max(Math.abs(swipe.dx) / 220, -swipe.dy / 90)));
});
for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, (event) => {
  const swipe = updatedSwipe;
  updatedSwipe = null;
  if (!swipe?.moved) return;
  view.updatedSwiped = Date.now();
  const time = Math.max(1, event.timeStamp - swipe.t);
  const fast = Math.abs(swipe.dx) / time > 0.5 || -swipe.dy / time > 0.4;
  const far = Math.abs(swipe.dx) > 90 || swipe.dy < -40;
  swipe.pill.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.28s ease';
  if (fast || far) {
    const up = -swipe.dy > Math.abs(swipe.dx);
    swipe.pill.style.transform = up ? 'translate(-50%, -80px)' : `translate(calc(-50% + ${Math.sign(swipe.dx) * (window.innerWidth / 2 + 200)}px), 0)`;
    swipe.pill.style.opacity = '0';
    view.updated = null;
    setTimeout(() => swipe.pill.remove(), 300);
  } else {
    swipe.pill.style.transform = '';
    swipe.pill.style.opacity = '';
  }
});

// A new version loads by itself as soon as nothing would be lost (no text typed, nothing being sent, recorded or edited).
// The page, scroll position, open days and the lift on the chart are kept, so you land where you were.
const RESUME_KEY = 'exodia.resume';
const reloadInPlace = () => {
  try {
    sessionStorage.setItem(RESUME_KEY, JSON.stringify({ at: Date.now(), scroll: scroller().scrollTop, open: [...view.open], trendOpen: view.trendOpen, trendMore: view.trendMore }));
  } catch {
    // no session storage: reload anyway
  }
  location.reload();
};
const updateQuietly = () => {
  if (!view.updateReady || view.pending.length || recording) return;
  // Never while something is being typed anywhere (search, a name, a number) or a change request is on its way.
  const field = document.activeElement;
  if (field && /^(INPUT|TEXTAREA)$/.test(field.tagName) && field.value) return;
  if ((state.claudeRuns || []).some((run) => run.status === 'sending')) return;
  if (view.draft.trim() || view.files?.length || view.editDay || view.onboard?.busy || view.onboard?.file || view.leftOpen || view.menu) return;
  if (view.composer && !document.hidden && document.activeElement?.id === 'draft') return;
  reloadInPlace();
};
setInterval(updateQuietly, 4000);
document.addEventListener('visibilitychange', updateQuietly);
// The demo link (?demo) says it's example data quietly in the date line instead of a floating pill.
const todayLine = () => (view.preview ? `${view.realDemo ? 'A real training log' : 'Example data'} · <a class="eyebrowLink" href="/join" target="_blank" rel="noopener">Get your own</a>` : new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
const demoPill = () => (state.demo && !view.preview ? `<div class="demoPill" role="status">${`${view.endDemoAsk ? 'Clear the example?' : 'Example data'}<button data-action="end-demo">${view.endDemoAsk ? 'Yes, start mine' : 'Start my own'}</button>`}</div>` : '');

// Two people ended up on one log (a shared private link). The server lists those logs in SPLIT_PROFILES; each phone on
// one is asked once who uses it. The first name keeps the log; anyone else gets their own, empty, with their name.
const SPLIT_KEY = 'exodia.splitAnswered';
const renderSplit = () => `<main class="page onboard">
    <span class="logo onboardLogo" aria-hidden="true"></span>
    <h1 class="title">Who's using Exodia on this phone?</h1>
    <p class="onboardLead">Two of you were on the same log by mistake. Pick your name and you get your own.</p>
    <div class="onboardChoices">${view.splitAsk.map((name) => `<button class="onboardChoice" data-action="split-pick" data-name="${esc(name)}"><b>${esc(name)}</b><span>This is me</span></button>`).join('')}</div>
  </main>`;
const pickSplit = (name) => {
  const [owner] = view.splitAsk;
  const shared = syncState.profile;
  view.splitAsk = null;
  try {
    localStorage.setItem(SPLIT_KEY, shared);
  } catch {
    // asked again next time; harmless
  }
  if (name === owner) state.name = name;
  else {
    syncState = freshSync(newProfileKey());
    state = { version: 1, deviceId: state.deviceId, sessions: [], bests: {}, log: [], name, started: true };
    lastSaved = localJson();
    lastMeta = metaJson();
    pointManifest();
  }
  state.started = true;
  save();
  syncNow();
  render();
};

const renderLinkOffer = () => {
  const { name, days } = view.linkOffer;
  const whose = name ? `${esc(name)}’s` : 'someone’s';
  const own = state.sessions.length > 0 || Boolean(state.name);
  return `<main class="page onboard">
    <span class="logo onboardLogo" aria-hidden="true"></span>
    <h1 class="title">This is ${whose} Exodia</h1>
    <p class="onboardLead">This private link opens ${whose} own log${days ? `, ${days} ${days === 1 ? 'day' : 'days'} of training` : ''}. Open it only if it’s yours.</p>
    <div class="onboardChoices">
      <button class="onboardChoice" data-action="link-own"><b>${own ? 'Keep my own Exodia' : 'Start my own Exodia'}</b><span>${own ? `Stay with ${state.name ? esc(state.name) : 'your'}${state.name ? '’s' : ''} log on this device` : 'A fresh, empty log for you'}</span></button>
      <button class="onboardChoice" data-action="link-open"><b>It’s mine, open it</b><span>${name ? `${esc(name)}’s lifts` : 'These lifts'} on this device${own ? ', together with what is here now' : ''}</span></button>
    </div>
  </main>`;
};

// Start fresh: a new, empty Exodia on this device. The old log stays on the server; its key is remembered here
// (exodia.previous) so it can still be found if this was a mistake.
const startFresh = () => {
  if (!window.confirm('Start a fresh, empty Exodia on this device?\n\nThe log you see now stays saved online, but this device stops showing it.')) return;
  try {
    const previous = JSON.parse(localStorage.getItem('exodia.previous') || '[]');
    localStorage.setItem('exodia.previous', JSON.stringify([{ profile: syncState.profile, name: state.name || '', at: Date.now() }, ...previous].slice(0, 10)));
  } catch {
    // storage blocked; the old log is still on the server
  }
  syncState = freshSync(newProfileKey());
  state = { version: 1, deviceId: state.deviceId, sessions: [], bests: {}, log: [] };
  lastSaved = localJson();
  lastMeta = metaJson();
  Object.assign(view, { onboard: { name: '', data: '' }, invited: '', menu: false, toast: null, isAdmin: false, composer: false, draft: '', open: new Set([todayIso()]) });
  writeLocal();
  pointManifest();
  history.replaceState(null, '', '/');
  location.hash = '#/';
  render();
};

const renderOnboard = () => {
  view.onboard ??= { name: '', data: '' };
  const { busy, status, recording: listening, hearing, file } = view.onboard;
  const filled = view.onboard.data.trim().length > 0 || Boolean(file);
  const locked = busy || listening || hearing;
  return `<main class="page onboard">
    <span class="logo onboardLogo" aria-hidden="true"></span>
    <h1 class="title">Welcome to Exodia${view.invited ? `, ${esc(view.invited)}` : ''}</h1>
    <p class="onboardLead">Log your training by talking or typing. No account, no setup.${view.invited ? ` Not ${esc(view.invited)}? Change the name below.` : ''}</p>
    <label class="sr" for="onboardName">Your name</label>
    <input id="onboardName" class="onboardField" autocomplete="given-name" placeholder="Your name (optional)" value="${esc(view.onboard.name)}" ${busy ? 'disabled' : ''}>
    <p class="onboardMove"><b>Have a history?</b> Paste or drop it in the box below, in any format. Exodia turns it into days, sets and trends in seconds.</p>
    ${exportHelp(false)}
    ${busy ? `<p class="onboardStatus" role="status">${writingLine(status)}</p>` : status ? `<p class="onboardStatus" role="status">${esc(status)}</p>` : ''}
    <div class="onboardChoices">
      <p class="onboardOr">Nothing to bring?</p>
      <button class="onboardChoice" data-action="onboard-blank" ${locked ? 'disabled' : ''}><b>Start blank</b><span>Log as you go. Add or upload old workouts any time from the menu</span></button>
      <button class="onboardChoice" data-action="onboard-demo" ${locked ? 'disabled' : ''}><b>Try it with example data</b><span>Look around with sample workouts first</span></button>
    </div>
  </main>
  <div class="dock onboardDock">
    <div class="prompt onboardPrompt${filled ? ' hasText' : ''}${listening ? ' listening' : ''}${file ? ' hasChip' : ''}">
      ${file ? `<div class="contextChip"><span class="contextKind">File</span><span class="contextLabel">${esc(file.name)}</span><button class="contextX" data-action="onboard-unfile" aria-label="Remove file">${ICONS.close}</button></div>` : ''}
      <label for="onboardData" class="sr">Your training so far</label>
      <textarea id="onboardData" class="promptInput onboardData" rows="3" ${locked ? 'disabled' : ''}>${esc(view.onboard.data)}</textarea>
      ${listening ? '<span class="hint live" aria-hidden="true"><span class="liveText">Listening… tap stop when you are done</span></span>' : hearing ? '<span class="hint live" aria-hidden="true"><span class="liveText">Writing down what you said…</span></span>' : busy ? '<span class="hint live" aria-hidden="true"><span class="liveText">Reading your training…</span></span>' : `<span class="hint onboardHint${onboardExample.fading ? ' fading' : ''}" aria-hidden="true">${esc(ONBOARD_EXAMPLES[onboardExample.index])}</span>`}
      <div class="promptBar"><button class="roundBtn soft onboardFile" data-action="pick-file" aria-label="Add a file" ${locked ? 'disabled' : ''}>${ICONS.plus}</button><span class="modelTag onboardTag">Exodia <span class="modelVersion">1.0</span></span><div class="promptButtons">${listening ? `<button class="roundBtn stopBtn" data-action="onboard-stop" aria-label="Stop">${ICONS.stop}</button>` : `${filled ? `<button class="roundBtn soft" data-action="onboard-mic" aria-label="Talk" ${locked ? 'disabled' : ''}>${ICONS.mic}</button><button class="roundBtn send" data-action="onboard-start" aria-label="Import and start" ${locked ? 'disabled' : ''}>${ICONS.up}</button>` : `<button class="roundBtn send" data-action="onboard-mic" aria-label="Talk" ${locked ? 'disabled' : ''}>${ICONS.mic}</button>`}`}</div></div>
    </div>
  </div>`;
};

setInterval(() => {
  if (!onboarding() || view.onboard?.data?.trim() || reducedMotion.matches) return;
  const hint = document.querySelector('.onboardHint');
  if (!hint) return;
  hint.classList.add('fading');
  setTimeout(() => {
    onboardExample.index = (onboardExample.index + 1) % ONBOARD_EXAMPLES.length;
    hint.textContent = ONBOARD_EXAMPLES[onboardExample.index];
    hint.classList.remove('fading');
  }, 600);
}, 4200);

let onboardRecorder = null;

const startOnboardMic = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    onboardRecorder = { recorder, chunks, stream };
    recorder.start();
    view.onboard.recording = true;
    view.onboard.status = '';
  } catch {
    view.onboard.status = 'Allow the microphone to talk to Exodia.';
  }
  render();
};

const stopOnboardMic = () => {
  if (!onboardRecorder) return;
  const { recorder, chunks, stream } = onboardRecorder;
  onboardRecorder = null;
  recorder.onstop = async () => {
    stream.getTracks().forEach((track) => track.stop());
    view.onboard.recording = false;
    view.onboard.hearing = true;
    render();
    try {
      const audio = await wavBase64(new Blob(chunks, { type: recorder.mimeType }));
      const response = await timedFetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not hear that. Try again.');
      view.onboard.data = [view.onboard.data.trim(), body.text].filter(Boolean).join('\n');
    } catch (error) {
      view.onboard.status = error.message;
    }
    view.onboard.hearing = false;
    render();
  };
  recorder.stop();
};

// --dock-h follows the box's real height (it grows while you type or paste), so every page can scroll its last line
// up above the box instead of hiding it behind it.
let dockObserver = null;
let watchedDock = null;
const watchDock = () => {
  const dock = document.querySelector('.dock');
  if (!dock || !window.ResizeObserver || dock === watchedDock) return;
  dockObserver?.disconnect();
  watchedDock = dock;
  dockObserver = new ResizeObserver(() => {
    const sheet = dock.querySelector('.sheet');
    setVar('--dock-h', `${dock.offsetHeight - (sheet ? sheet.offsetHeight + 8 : 0)}px`);
  });
  dockObserver.observe(dock);
};
// Once someone has started, the address is their own private link, so Add to Home Screen (which on iPhone gets
// its own empty storage) opens their log instead of a blank app.
const keepPrivateUrl = () => {
  if (view.sandbox || state.demo || !(state.started || state.name || state.sessions.length)) return;
  const own = `/me/${syncState.profile}`;
  if (location.pathname !== own) history.replaceState(history.state, '', `${own}${location.search}${location.hash}`);
};

// Beta and launch: a feature Marcus hasn't launched yet is only for him (and test profiles named "Test …").
// The launched list comes from /api/features and is kept, so the app opens with the right pages straight away.
try {
  view.launched = JSON.parse(localStorage.getItem('exodia.launched') || '[]');
} catch {
  view.launched = [];
}
const featureOn = (name) => Boolean(view.isAdmin) || /^test\s/i.test(state.name || '') || (view.launched || []).includes(name);
const loadFeatures = () => fetch('/api/features', { headers: syncState?.profile ? { 'x-exodia-key': syncState.profile } : {} })
  .then((response) => (response.ok ? response.json() : null))
  .then((data) => {
    if (!data) return;
    const before = JSON.stringify([view.launched, view.beta]);
    view.launched = data.launched || [];
    if (data.beta) view.beta = data.beta;
    try {
      localStorage.setItem('exodia.launched', JSON.stringify(view.launched));
    } catch {
      // private mode: asked again next time
    }
    if (JSON.stringify([view.launched, view.beta]) !== before) {
      if (featureOn('friends')) loadSocial();
      render();
    }
  })
  .catch(() => {});

// Friends: what the server says (you, requests, friends with what they share, plans), kept per profile so the
// sidebar has it on the next open even offline.
const socialKey = () => `exodia.social.${syncState?.profile || ''}`;
try {
  view.social = JSON.parse(localStorage.getItem(socialKey()) || 'null');
} catch {
  view.social = null;
}
let socialLoading = null;
const socialPost = (path, body) => timedFetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ ...body, today: todayIso() }) }, 15000)
  .then(async (response) => ({ ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) }));
const keepSocial = (data) => {
  if (!data?.me) return;
  view.social = data;
  view.friendStates = null;
  try {
    localStorage.setItem(socialKey(), JSON.stringify(data));
  } catch {
    // too big or private mode: kept in memory only
  }
};
// Everyone public, for the list on Friends (no typing needed). Refreshed with the rest of Friends.
const loadEveryone = () => {
  if (view.route !== 'friends' || view.everyoneLoading) return;
  view.everyoneLoading = true;
  socialPost('/api/friends', { action: 'search', q: '' })
    .then(({ data }) => {
      view.everyone = data?.people || [];
      if (view.route === 'friends') render();
    })
    .catch(() => {})
    .finally(() => { view.everyoneLoading = false; });
};
// A friend put you on a plan: one banner per plan (tap it to open that day in Train together), never again after.
const planAddedBanner = () => {
  let seen = [];
  try { seen = JSON.parse(localStorage.getItem('exodia.plansSeen') || '[]'); } catch { /* private mode */ }
  const today = todayIso();
  const fresh = (view.social?.plans || []).find((plan) => plan.date >= today && plan.by && plan.by !== 'me' && !seen.includes(`${plan.date}|${plan.kind}|${plan.by}`));
  if (!fresh || view.toast) return;
  seen = [...seen, `${fresh.date}|${fresh.kind}|${fresh.by}`].slice(-40);
  try { localStorage.setItem('exodia.plansSeen', JSON.stringify(seen)); } catch { /* private mode */ }
  const when = fresh.date === today ? 'today' : parseIso(fresh.date).toLocaleDateString('en-GB', { weekday: 'long' });
  view.toast = { kind: 'rep', title: `${fresh.by} added you to ${fresh.kind.toLowerCase() === 'full body' ? 'a full body day' : `${fresh.kind} day`} ${fresh.date === today ? 'today' : `on ${when}`}`, text: 'Tap to see the plan', go: fresh.date };
};
const loadSocial = () => {
  if (!featureOn('friends') || !syncState?.profile || socialLoading) return socialLoading;
  socialLoading = socialPost('/api/friends', { action: 'list' })
    .then(({ ok, data }) => {
      if (ok) {
        keepSocial(data);
        syncTogether();
        planAddedBanner();
      }
      render();
    })
    .catch(() => {})
    .finally(() => {
      socialLoading = null;
    });
  return socialLoading;
};
const friendsList = () => view.social?.friends || [];
const friendByHandle = (handle) => friendsList().find((friend) => friend.handle === handle) || null;
const myName = () => state.name || view.social?.me?.name || 'You';

// Seeing a friend through the same code as yourself: their sessions are swapped in for a moment.
const asPerson = (person, compute) => {
  const [keepState, keepHits] = [state, hitsCache];
  state = person;
  memoSaved = Symbol('friend');
  hitsCache = null;
  try {
    return compute();
  } finally {
    state = keepState;
    memoSaved = null;
    hitsCache = keepHits;
  }
};
// A friend as Exodia sees them: their last 3 weeks of sessions, plus their heaviest set of each lift (for levels).
const friendState = (friend) => {
  view.friendStates ||= new Map();
  if (view.friendStates.has(friend.handle)) return view.friendStates.get(friend.handle);
  const recentFrom = addDays(todayIso(), -21);
  const byDate = new Map();
  for (const top of friend.tops || []) {
    if (top.date >= recentFrom) continue;
    if (!byDate.has(top.date)) byDate.set(top.date, { date: top.date, exercises: [] });
    byDate.get(top.date).exercises.push({ name: top.name, sets: [top.set] });
  }
  const person = { version: 1, deviceId: friend.handle, name: friend.name, body: friend.body || null, bests: {}, visits: {}, log: [], sessions: [...(friend.sessions || []), ...byDate.values()] };
  view.friendStates.set(friend.handle, person);
  return person;
};
const friendHasExodia = (friend) => asPerson(friendState(friend), () => exodiaActive());

// Avatars: a soft two-hue gradient from the name, warm reds and sands, greens, purples and pinks, never blue (blue is
// Exodia). Friends next to each other never get the same hue; two who start with the same letter show two letters.
const nameHash = (name) => {
  let hash = 2166136261;
  for (const character of String(name).toLowerCase()) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return hash;
};
const WARM_HUES = [[0, 50], [85, 150], [275, 345]];
const warmHue = (step) => {
  const total = WARM_HUES.reduce((sum, [from, to]) => sum + to - from, 0);
  let left = ((step % total) + total) % total;
  for (const [from, to] of WARM_HUES) {
    if (left < to - from) return from + left;
    left -= to - from;
  }
  return 0;
};
// One letter, or two when someone else starts with the same one: the first letters of the first and last name
// (Test Ava → TA), or for one name its first and last letter (Isabella → IA, Isak → IK).
const initials = (name, names) => {
  const first = name.trim()[0] || '?';
  if (!names.some((other) => other !== name && other.trim()[0]?.toLowerCase() === first.toLowerCase())) return first.toUpperCase();
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? `${first}${words.at(-1)[0]}` : `${first}${name.trim().at(-1)}`).toUpperCase();
};
const avatarLook = () => {
  // Everyone who can be on screen (you, friends, requests, People on Exodia, search) gets a colour from their name,
  // and the colours are spread evenly round the wheel so no two people look alike.
  const others = [...friendsList(), ...(view.social?.requests || []), ...(view.social?.asked || []), ...(view.everyone || []), ...(view.friendSearch?.people || [])].map((row) => row.name).filter(Boolean);
  const names = [...new Set([myName(), ...others])];
  const sig = names.join('|');
  if (view.avatarLook?.sig === sig) return view.avatarLook.map;
  const map = new Map();
  // The whole colour wheel, blue included: each next person is a golden angle (137.5°) on from the last, so neighbours
  // never look alike, and every other one a little deeper.
  const ordered = [...names].sort((one, two) => nameHash(one) - nameHash(two));
  const start = (nameHash(ordered[0] || '') >>> 4) % 360;
  ordered.forEach((name, index) => {
    const hue = Math.round(start + index * 137.5) % 360;
    const light = index % 2 ? 56 : 64;
    map.set(name, { background: `linear-gradient(135deg, hsl(${hue} 34% ${light}%), hsl(${(hue + 26) % 360} 38% ${light + 10}%))`, letters: initials(name, names) });
  });
  view.avatarLook = { sig, map };
  return map;
};
const avatar = (name, exodia = false) => {
  if (exodia) return '<span class="fav exo" aria-hidden="true"><img src="/hamsa-512-blue.png" alt="" draggable="false"></span>';
  const step = (nameHash(String(name)) >>> 4) % 205;
  const look = avatarLook().get(name) || { background: `linear-gradient(135deg, hsl(${warmHue(step)} 32% 60%), hsl(${warmHue(step + 28)} 36% 71%))`, letters: String(name).trim().slice(0, 1).toUpperCase() };
  return `<span class="fav" style="background:${look.background}" aria-hidden="true"><b>${esc(look.letters)}</b></span>`;
};

// What fits whom: muscles per kind of day, and how fresh they are for each person on a day.
const KIND_MUSCLES = { Push: ['chest', 'shoulders', 'triceps'], Pull: ['upperBack', 'rearDelts', 'biceps', 'traps'], Legs: ['quads', 'hamstrings', 'glutes', 'adductors'] };
KIND_MUSCLES['Full body'] = [...KIND_MUSCLES.Push, ...KIND_MUSCLES.Pull, ...KIND_MUSCLES.Legs];
const KIND_REGION = { Push: 'chest and shoulders', Pull: 'back', Legs: 'legs', 'Full body': 'whole body', Move: 'cardio' };
const PLAN_KINDS = ['Push', 'Pull', 'Legs', 'Full body', 'Move'];
const areOrIs = (region) => (region === 'legs' || region.includes(' and ') ? 'are' : 'is');
const readiness = (load, kind) => {
  const muscles = KIND_MUSCLES[kind];
  if (!muscles) return 1;
  return 1 - muscles.reduce((sum, key) => sum + (load.fresh[key] || 0), 0) / muscles.length;
};
// The people on the page (you first), each with how fresh they are on the day and what they last trained.
const togetherPeople = (date) => {
  const handles = [...(view.together?.people || [])];
  const people = [{ name: myName(), me: true, person: state }];
  for (const handle of handles) {
    const friend = friendByHandle(handle);
    if (friend) people.push({ name: friend.name, handle, friend, person: friendState(friend) });
  }
  for (const entry of people) {
    const [load, last] = entry.me ? [muscleLoad(date), lastTrained()] : asPerson(entry.person, () => [muscleLoad(date), lastTrained()]);
    entry.load = load;
    entry.last = last;
    entry.ready = Object.fromEntries(PLAN_KINDS.map((kind) => [kind, readiness(load, kind)]));
  }
  return people;
};
const whenTrained = (date, day) => {
  if (!date) return '';
  const ago = daysBetween(date, day);
  return ago <= 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`;
};
// Best fit: the kind of day that is freshest for everyone, from fixed rules (no AI): Push, Pull or Legs by how
// recovered everyone's muscles are; Full body only when everyone is fully fresh; Move when nothing is.
const bestFit = (people, date) => {
  const main = ['Pull', 'Push', 'Legs'];
  const average = (kind) => people.reduce((sum, entry) => sum + entry.ready[kind], 0) / people.length;
  const ranked = [...main].sort((one, two) => average(two) - average(one));
  let best = ranked[0];
  let second = ranked[1];
  if (main.every((kind) => average(kind) >= 0.97)) {
    // Everyone fresh everywhere: the muscles trained longest ago go first.
    const since = (kind) => Math.min(...people.map((entry) => Math.min(...KIND_MUSCLES[kind].map((key) => (entry.last[key] ? daysBetween(entry.last[key], date) : 99)))));
    const byRest = [...main].sort((one, two) => since(two) - since(one));
    [best, second] = [byRest[0], byRest[1]];
  } else if (average(best) < 0.35) [best, second] = ['Move', best];
  const solo = people.length === 1;
  const who = solo ? 'Your' : people.length === 2 ? 'Both your' : "Everyone's";
  const region = KIND_REGION[best];
  const lead = best === 'Move' ? `Most muscles are still recovering, so cardio fits ${solo ? 'you' : 'everyone'} well.` : average(best) >= 0.9 ? (solo ? `Your ${region} ${areOrIs(region)} fresh.` : `${region[0].toUpperCase()}${region.slice(1)} ${areOrIs(region)} fresh for ${people.length === 2 ? 'both of you' : 'everyone'}.`) : `${region[0].toUpperCase()}${region.slice(1)} ${areOrIs(region)} the freshest for ${solo ? 'you' : 'everyone'}.`;
  // What the second option needs to know: the one who trained it most recently.
  const tired = second === 'Move' ? null : [...people].sort((one, two) => one.ready[second] - two.ready[second])[0];
  const lastOf = tired && KIND_MUSCLES[second].map((key) => tired.last[key]).filter(Boolean).sort().at(-1);
  const note = tired && tired.ready[second] < 0.7 && lastOf ? `${second} works too, ${tired.me ? 'you' : esc(tired.name)} trained ${KIND_REGION[second]} ${whenTrained(lastOf, date)}.` : `${second} works well too.`;
  return { best, second, why: `${lead} ${note}` };
};
// Recommended until then: for a plan a few days ahead, the order of other sessions that fit, and the last day for a
// heavy session of the same muscles so they're fresh on the day. Works for tomorrow and for two weeks ahead alike,
// and never assumes you train every day.
const leadUp = (date, kind) => {
  const today = todayIso();
  const days = daysBetween(today, date);
  if (days < 1) return '';
  const short = (iso) => parseIso(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const load = muscleLoad();
  const others = ['Legs', 'Pull', 'Push'].filter((other) => other !== kind && kind !== 'Full body').sort((one, two) => readiness(load, two) - readiness(load, one));
  const rows = [];
  if (kind === 'Move') rows.push('<li>Anything works until then. Cardio is easy on the muscles.</li>');
  else if (kind === 'Full body') rows.push(`<li>Lighter sessions until then, so everything is fresh on ${short(date)}.</li>`);
  else {
    const order = days === 1 ? others.slice(0, 2) : others;
    rows.push(`<li><span class="leadOrder">${order.map((other, index) => `<span><b>${index + 1}</b>${other}</span>`).join('')}</span>${days === 1 ? '<span class="leadWhen">or rest</span>' : ''}</li>`);
    const rest = Math.max(...KIND_MUSCLES[kind].map((key) => RECOVERY_DAYS[key] || 3));
    const lastHeavy = addDays(date, -rest);
    rows.push(lastHeavy > today ? `<li>Last heavy ${KIND_REGION[kind]} day by ${short(lastHeavy)}, so your ${KIND_REGION[kind]} ${areOrIs(KIND_REGION[kind])} fresh on the day.</li>` : `<li>Easy on ${KIND_REGION[kind]} until then, so ${areOrIs(KIND_REGION[kind]) === 'are' ? 'they are' : 'it is'} fresh on ${short(date)}.</li>`);
  }
  const still = kind !== 'Move' && readiness(muscleLoad(date), kind) < 0.66 ? `<li>Your ${KIND_REGION[kind]} may still be recovering on ${short(date)}.</li>` : '';
  return `<div class="leadUp"><p class="tgLabel">Recommended until then</p><ul>${rows.join('')}${still}</ul></div>`;
};

// Train together state: the day, who's coming (friend handles) and what you picked. The plan on that day, if there is
// one, decides; the server keeps it, so everyone coming sees the same.
const togetherPlan = (date = view.together?.date) => (view.social?.plans || []).find((plan) => plan.date === date) || null;
const syncTogether = () => {
  if (!view.together || view.together.pending) return;
  const plan = togetherPlan();
  if (plan) {
    view.together.people = new Set(plan.members.filter((member) => !member.me && friendByHandle(member.handle)).map((member) => member.handle));
    if (!view.together.conflict) view.together.kind = plan.kind;
  } else if (view.together.saved) {
    view.together.people = new Set();
    view.together.saved = false;
  }
};
const startTogether = (handle) => {
  view.together = { date: todayIso(), people: new Set(handle ? [handle] : []), kind: null, conflict: null, pending: 0, note: '' };
  syncTogether();
  if (handle && !togetherPlan()?.members.some((member) => member.handle === handle)) togetherSend({ action: 'add', handle });
};
// Every change goes out in order, one at a time; the answer is the plan as the server has it.
let togetherQueue = Promise.resolve();
const togetherSend = (body) => {
  const together = view.together;
  together.pending += 1;
  togetherQueue = togetherQueue.then(() => socialPost('/api/together', { date: together.date, kind: together.kind || together.fit || 'Pull', ...body })
    .then(({ ok, status, data }) => {
      if (data?.plans) view.social = { ...(view.social || {}), plans: data.plans };
      if (status === 409 && data?.conflict && data.plan) together.conflict = { plan: data.plan, wanted: body.kind };
      else if (!ok && status !== 409) together.note = data?.error || 'Exodia could not save that. Try again.';
      else together.note = '';
      together.saved = Boolean(data?.plan);
    })
    .catch(() => {
      together.note = "You're offline. Nothing changed, try again when you're back.";
    })
    .finally(() => {
      together.pending -= 1;
      if (!together.pending) {
        if (view.social) keepSocial(view.social);
        syncTogether();
      }
      render();
    }));
  return togetherQueue;
};

const friendStatus = (friend) => {
  if (view.isAdmin && friend.admin) {
    const at = friend.admin.online;
    const ago = at ? Math.round((Date.now() - at) / 60000) : null;
    const when = ago === null ? 'Not online yet' : ago < 5 ? 'Online now' : ago < 60 ? `Online ${ago} min ago` : ago < 60 * 24 ? `Online ${Math.round(ago / 60)} h ago` : `Online ${Math.round(ago / 1440)} days ago`;
    return `${when}${friend.admin.phone ? ` · ${esc(friend.admin.phone)}` : ''}`;
  }
  if (friendHasExodia(friend)) return 'Exodia';
  const person = friendState(friend);
  if (person.sessions.some((session) => session.date === todayIso() && session.exercises.length)) return 'Trained today';
  if (!friend.shares?.recovery) return '';
  const entry = asPerson(person, () => muscleLoad());
  const best = ['Pull', 'Push', 'Legs'].sort((one, two) => readiness(entry, two) - readiness(entry, one))[0];
  return `Fresh for ${best.toLowerCase()}`;
};
// The Friends part of the sidebar and the phone menu.
const friendsSide = () => {
  if (!featureOn('friends')) return '';
  const requests = (view.social?.requests || []).length;
  const friends = friendsList();
  return `<div class="fxSide"><p class="drawerLabel">Friends</p>
    ${friends.length ? `<a class="fxRow${view.route === 'together' ? ' on' : ''}" href="#/together"><span class="fxStack" aria-hidden="true"><i></i><i></i></span><span class="fxName">Train together</span></a>` : ''}
    ${friends.map((friend) => `<a class="fxRow${view.route === 'friend' && view.friendHandle === friend.handle ? ' on' : ''}" href="#/friend/${friend.handle}">${avatar(friend.name, friendHasExodia(friend))}<span class="fxText"><span class="fxName">${esc(friend.name)}</span>${friendStatus(friend) ? `<span class="fxSub">${friendStatus(friend)}</span>` : ''}</span>${view.isAdmin && friend.admin?.errors ? `<span class="fxErr">${friend.admin.errors} ${friend.admin.errors === 1 ? 'error' : 'errors'}</span>` : ''}</a>`).join('')}
    <a class="fxRow fxAdd${view.route === 'friends' ? ' on' : ''}" href="#/friends"><span class="fav add" aria-hidden="true">${ICONS.plus}</span><span class="fxName">Add friends</span>${requests ? `<span class="fxCount">${requests}</span>` : ''}</a></div>`;
};

// The Friends page: find people by name, answer requests, and choose what friends see.
const SHARE_ROWS = [['recovery', 'Recovery', 'Which muscles are fresh, days since trained'], ['strength', 'Strength levels', 'Anatomy levels and the strength web'], ['workouts', 'Workouts', 'Your recent days, lifts and sets'], ['bodyweight', 'Bodyweight', 'Shown next to your strength levels'], ['findable', 'Public profile', 'In the list everyone sees. Off: only people you already know can add you']];
const renderFriends = () => {
  if (!featureOn('friends')) return renderHome();
  const social = view.social;
  const search = view.friendSearch || { q: '', people: [] };
  if (!view.everyone && !view.everyoneLoading) setTimeout(loadEveryone, 0);
  // Marcus can take someone off People on Exodia (their log stays; they're just not listed or findable).
  const person = (row, button) => `<div class="fxLine">${avatar(row.name)}<span class="fxText"><span class="fxName">${esc(row.name)}</span></span>${view.isAdmin && row.status === 'none' ? `<button class="fxBtn quiet" data-action="friend-hide" data-handle="${row.handle}">Hide</button>` : ''}${button}</div>`;
  const statusButton = (row) => (row.status === 'friends' ? '<span class="fxState">Friends</span>' : row.status === 'asked' ? `<button class="fxBtn quiet" data-action="friend-cancel" data-handle="${row.handle}">Asked</button>` : row.status === 'asks' ? `<button class="fxBtn clay" data-action="friend-accept" data-handle="${row.handle}">Accept</button>` : `<button class="fxBtn clay" data-action="friend-ask" data-handle="${row.handle}">Add</button>`);
  return `<main class="page friendsPage">
    <h1 class="title">Friends</h1>
    <label class="fxSearch">${ICONS.search}<span class="sr">Search names</span><input id="friendSearch" type="search" placeholder="Search names" autocomplete="off" enterkeyhint="search" value="${esc(search.q)}"></label>
    ${search.q.trim().length < 2 && view.everyone?.length ? `<p class="section">People on Exodia</p><div class="fxList">${view.everyone.filter((row) => row.status !== 'friends').map((row) => person(row, statusButton(row))).join('')}</div>` : ''}
    ${search.q.trim().length >= 2 ? `<div class="fxList">${search.people.length ? search.people.map((row) => person(row, statusButton(row))).join('') : `<p class="fxEmpty">${search.loading ? 'Looking…' : 'Nobody with that name yet.'}</p>`}</div>` : ''}
    ${social?.requests?.length ? `<p class="section">Wants to be your friend</p><div class="fxList">${social.requests.map((row) => person(row, `<button class="fxBtn quiet" data-action="friend-decline" data-handle="${row.handle}">No</button><button class="fxBtn clay" data-action="friend-accept" data-handle="${row.handle}">Accept</button>`)).join('')}</div>` : ''}
    ${social?.friends?.length ? `<p class="section">Your friends</p><div class="fxList">${social.friends.map((friend) => `<div class="fxLine"><a class="fxLink" href="#/friend/${friend.handle}">${avatar(friend.name, friendHasExodia(friend))}<span class="fxText"><span class="fxName">${esc(friend.name)}</span></span></a><button class="fxBtn quiet" data-action="friend-remove" data-handle="${friend.handle}">Remove</button></div>`).join('')}</div>` : ''}
    ${social?.asked?.length ? `<p class="section">Waiting for them</p><div class="fxList">${social.asked.map((row) => person(row, `<button class="fxBtn quiet" data-action="friend-cancel" data-handle="${row.handle}">Cancel</button>`)).join('')}</div>` : ''}
    ${!social ? `<p class="fxEmpty">${navigator.onLine ? 'Loading…' : "You're offline. Friends show up when you're back."}</p>` : ''}
    ${social?.me ? `<p class="section">What friends see</p><div class="fxSettings">${SHARE_ROWS.map(([key, title, note]) => `<button class="fxSet" role="switch" aria-checked="${Boolean(social.me.shares?.[key])}" data-action="friend-share" data-key="${key}"><span class="fxSetText"><b>${title}</b><small>${note}</small></span><i class="fxSwitch" aria-hidden="true"></i></button>`).join('')}<div class="fxSet still"><span class="fxSetText"><b>What you said</b><small>Voice notes, messages and feedback</small></span><span class="fxNever">Never shared</span></div></div>` : ''}
    ${view.friendNote ? `<p class="fxNote" role="status">${esc(view.friendNote)}</p>` : ''}
  </main>`;
};

// A friend's Exodia: their name as the title, everything read only, and the way back where your box sits.
const renderFriend = () => {
  const friend = friendByHandle(view.friendHandle);
  if (!featureOn('friends')) return renderHome();
  if (!friend) return `<main class="page"><h1 class="title">Not found</h1><p class="empty">${view.social ? 'This person is not on your friends list.' : 'Loading…'}</p></main>`;
  const person = friendState(friend);
  const days = [...person.sessions].filter((session) => session.exercises.length || session.cardio).sort((one, two) => two.date.localeCompare(one.date)).slice(0, 7);
  const readOnly = (html) => html.replace(/ data-action="(jump-session|body-edit|body-save|body-sex|level-info)"[^>]*?(?=>)/g, '');
  const body = asPerson(person, () => `
    ${friend.shares?.recovery || friend.shares?.strength ? `<section class="friendAnatomy">${renderMuscles()}</section>` : ''}
    ${friend.shares?.strength && friend.body ? readOnly(renderStrength()).replace("The heaviest you've lifted in each", `The heaviest ${esc(friend.name)} has lifted in each`).replace(/<button class="textBtn bodyEdit"[^>]*>([^<]*)<\/button>/, friend.body.exact ? '<span class="muted">$1</span>' : '') : ''}
    ${friend.shares?.strength && friend.body ? renderImpressive().replace('Your most impressive lift', `${esc(friend.name)}&#39;s most impressive lift`) : ''}
    ${friend.shares?.workouts ? `<p class="section">Recent days</p><div class="fxDays">${days.map((session) => `<div class="fxDay"><span class="fxDayName">${esc(dayName(session))}</span><span class="muted">${dayLabel(session.date)}</span></div>`).join('') || '<p class="empty">Nothing in the last 3 weeks.</p>'}</div>` : ''}`);
  return `<main class="page friendPage">
    <p class="eyebrow">${friendHasExodia(friend) ? 'Has Exodia' : 'Friend'}</p>
    <div class="titleRow"><h1 class="title">${esc(friend.name)}</h1></div>
    <a class="fxTogether" href="#/together" data-action="together-with" data-handle="${friend.handle}">Train together with ${esc(friend.name)}${ICONS.chevRight}</a>
    ${body}
  </main>`;
};
const backDock = () => `<div class="backDock"><a class="backHome" href="#/">${ICONS.chevRight.replace('class="exChev"', 'class="exChev back"')}Back to ${esc(myName())}</a></div>`;

// Train together.
const renderTogether = () => {
  if (!featureOn('friends')) return renderHome();
  if (!view.together) startTogether();
  const together = view.together;
  const today = todayIso();
  if (together.date < today) together.date = today;
  const plan = togetherPlan();
  const people = togetherPeople(together.date);
  const fit = bestFit(people, together.date);
  together.fit = fit.best;
  const picked = together.kind || fit.best;
  const friends = friendsList();
  const short = (iso) => parseIso(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const coming = (handle) => together.people.has(handle);
  const row = `<div class="tgWho" role="group" aria-label="Who's coming">
    <span class="tgP on me">${avatar(myName(), view.blue)}<span class="tgName">${esc(myName())}</span></span>
    ${friends.map((friend) => `<button class="tgP${coming(friend.handle) ? ' on' : ''}" data-action="together-person" data-handle="${friend.handle}" aria-pressed="${coming(friend.handle)}">${avatar(friend.name, friendHasExodia(friend))}<span class="tgName">${esc(friend.name)}</span></button>`).join('')}
    <a class="tgP add" href="#/friends"><span class="fav add" aria-hidden="true">${ICONS.plus}</span><span class="tgName">Add</span></a></div>`;
  loadAnatomy();
  const drawn = anatomy && anatomy !== 'loading';
  // The figures turn to fit what you train: Pull shows the back, Push, Legs and Move the front, Full body both.
  const sides = picked === 'Pull' ? ['back'] : picked === 'Full body' ? ['front', 'back'] : ['front'];
  const bodies = !drawn ? '<div class="tgBodies"></div>' : `<p class="tgLabel">Squad recovery</p><div class="tgBodies${people.length > 3 ? ' many' : ''}">${people.map((entry) => { const draw = () => sides.map((side) => bodySvg(side, entry.load)).join(''); return `<figure>${sides.length > 1 ? '<div class="tgPair">' : ''}${entry.me ? draw() : asPerson(entry.person, draw)}${sides.length > 1 ? '</div>' : ''}<figcaption>${esc(entry.name)}</figcaption></figure>`; }).join('')}</div>`;
  const conflict = together.conflict;
  const what = `<p class="tgLabel">What to train</p>
    <div class="segment full tgWhat" role="group" aria-label="What to train">${PLAN_KINDS.map((kind) => `<button class="segmentOption" data-action="together-kind" data-kind="${kind}" aria-pressed="${picked === kind}">${kind}</button>`).join('')}</div>
    <div class="tgMarks" aria-hidden="true">${PLAN_KINDS.map((kind) => `<span class="${kind === fit.best ? 'best' : ''}">${kind === fit.best ? 'Best fit' : kind === fit.second ? 'Also good' : ''}</span>`).join('')}</div>
    ${conflict ? `<p class="tgWhy">${esc(conflict.plan.by === 'me' ? 'You' : conflict.plan.by)} picked <b>${esc(conflict.plan.kind)}</b> for ${short(conflict.plan.date)}.<span class="tgAsk"><button class="textBtn clay" data-action="together-confirm" data-kind="${esc(conflict.wanted)}">Change to ${esc(conflict.wanted)}</button><button class="textBtn" data-action="together-keep">Keep ${esc(conflict.plan.kind)}</button></span></p>`
      : `<p class="tgWhy">${picked === fit.best || people.length === 1 ? fit.why : `${fit.best} is the best fit${together.date === today ? ' today' : ' that day'}. ${picked} works too.`}</p>`}`;
  const planLine = plan ? `<p class="tgPlan"><b class="tgPlanDay">${esc(plan.kind)} day ${together.date === today ? 'today' : `on ${parseIso(together.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}`}</b><br>${(() => { const names = (list) => esc(list.map((member) => member.name).join(', ').replace(/, ([^,]*)$/, ' and $1')); const others = plan.members.filter((member) => !member.me); if (plan.by === 'me') return `With ${names(others)}.`; const rest = others.filter((member) => member.name !== plan.by); return `${esc(plan.by)} picked it${rest.length ? `, with ${names(rest)}` : ''}.`; })()}</p><button class="fxBtn tgLeave" data-action="together-leave">Leave this plan</button>` : '';
  return `<main class="page togetherPage">
    <div class="titleRow"><h1 class="title">Train together</h1></div>
    ${row}
    ${friends.length ? '' : '<p class="tgWhy">Add a friend to train together. Their recovery shows next to yours.</p>'}
    ${bodies}
    ${what}
    ${planLine}
    ${together.note ? `<p class="tgNote" role="status">${esc(together.note)}</p>` : ''}
    <p class="tgLabel">When</p>
    ${whenCalendar()}
    ${view.visitOpen && view.visitOpen < today ? visitCard() : ''}
    ${together.date > today ? leadUp(together.date, picked) : ''}
  </main>`;
};
// When: weeks back through your history and ahead, Monday first, a month's name where it starts. Logged days are
// dots in the same shades as the Every session calendar (PR blue, Exodia outlined); a past day opens like there.
const whenCalendar = () => {
  const today = todayIso();
  const { days, steps } = calendarDays();
  const exodiaDays = new Set(exodiaHistory().days || []);
  const monday = (iso) => addDays(iso, -((parseIso(iso).getDay() + 6) % 7));
  const first = [...days.keys()].sort()[0] || today;
  const start = monday(addDays(today, -26 * 7) > first ? addDays(today, -26 * 7) : first);
  const end = addDays(monday(today), 7 * 9 - 1);
  const planned = new Set((view.social?.plans || []).map((plan) => plan.date));
  const weeks = [];
  for (let week = start; week <= end; week = addDays(week, 7)) {
    const cells = Array.from({ length: 7 }, (_, index) => addDays(week, index));
    const opens = cells.find((iso) => iso.endsWith('-01'));
    if (opens || week === start) weeks.push(`<p class="wnMonth">${parseIso(opens || week).toLocaleDateString('en-GB', { month: 'long', ...(String(opens || week).slice(0, 4) === today.slice(0, 4) ? {} : { year: 'numeric' }) })}</p>`);
    weeks.push(`<div class="wnWeek${week === monday(today) ? ' now' : ''}">${cells.map((iso) => {
      const day = days.get(iso);
      const shade = day ? (day.volume > steps[2] ? 4 : day.volume > steps[1] ? 3 : day.volume > steps[0] ? 2 : 1) : 0;
      const mark = day ? `<i class="calDay ${exodiaDays.has(iso) ? 'exodia' : `shade${shade}${day.pr ? ' pr' : ''}`}"></i>` : '';
      const classes = `wnDay${iso === today ? ' today' : ''}${iso === view.together.date ? ' picked' : ''}${planned.has(iso) ? ' planned' : ''}${iso < today ? ' past' : ''}`;
      const number = parseIso(iso).getDate();
      if (iso < today) return day ? `<button class="${classes}" data-action="visit-day" data-date="${iso}" aria-label="${dayLabel(iso)}, open"><span>${number}</span>${mark}</button>` : `<span class="${classes}"><span>${number}</span></span>`;
      return `<button class="${classes}" data-action="together-date" data-date="${iso}" aria-label="${dayLabel(iso)}" aria-pressed="${iso === view.together.date}"><span>${number}</span>${mark}</button>`;
    }).join('')}</div>`);
  }
  return `<div class="wnHead" aria-hidden="true">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, index) => `<span${index > 4 ? ' class="we"' : ''}>${letter}</span>`).join('')}</div><div class="wnScroll" tabindex="-1">${weeks.join('')}</div>`;
};
// The When calendar keeps its place across redraws, and opens with this week in view (no jump: set before paint).
const placeWhen = () => {
  const box = document.querySelector('.wnScroll');
  if (!box) return;
  if (view.whenScroll !== undefined && view.whenScroll !== null) box.scrollTop = view.whenScroll;
  else {
    const now = box.querySelector('.wnWeek.now');
    if (now) box.scrollTop = now.offsetTop - box.clientHeight / 3;
  }
  box.addEventListener('scroll', () => {
    view.whenScroll = box.scrollTop;
  }, { passive: true });
};

// The last Exodia hit this device has shown the animation for.
let hitSeen = null;
const seenHit = (date) => {
  if (date) hitSeen = date;
  try {
    if (date) localStorage.setItem('exodia.hitSeen', date);
    hitSeen = localStorage.getItem('exodia.hitSeen') || hitSeen;
  } catch {
    // private mode: remembered until the app closes
  }
  return hitSeen;
};

const render = () => {
  keepPrivateUrl();
  const app = document.getElementById('app');
  const hit = exodiaHit();
  // Each Exodia hit plays its animation once on this device, the next time Home is on screen, so a hit that landed
  // while you were on another page, on another device or with the app closed is never missed.
  const lastHit = hit && !view.devHit && !state.demo && !view.sandbox ? exodiaHistory().last : null;
  if (lastHit && view.route === 'home' && !view.celebrating && !document.hidden && seenHit() !== lastHit) {
    seenHit(lastHit);
    celebrate();
  } else if (view.wasHit === false && hit && view.devHit && !view.celebrating) celebrate();
  view.wasHit = hit;
  view.blue = hit && view.celebrating !== 'orange';
  document.documentElement.classList.toggle('demo', Boolean(state.demo && !view.preview));
  if (view.splitAsk) {
    app.innerHTML = renderSplit();
    return;
  }
  if (view.linkOffer) {
    app.innerHTML = renderLinkOffer();
    return;
  }
  if (onboarding()) {
    const focusedId = document.activeElement?.id;
    app.innerHTML = renderOnboard() + devExtras();
    if (focusedId) document.getElementById(focusedId)?.focus();
    const onboardData = document.getElementById('onboardData');
    if (onboardData) fitDraft(onboardData);
    watchDock();
    return;
  }
  const focused = document.activeElement;
  const draftFocused = focused && focused.id === 'draft';
  const caret = draftFocused ? [focused.selectionStart, focused.selectionEnd] : null;
  const searchFocused = focused && focused.id === 'search';
  const friendSearchFocused = focused && focused.id === 'friendSearch';
  // A set's kg / reps / @ box has no id, so it is found again by what it edits, and keeps its caret.
  const setFocus = focused && focused.dataset?.field && focused.matches('input') ? { ...focused.dataset, caret: [focused.selectionStart, focused.selectionEnd] } : null;
  const oldBody = document.querySelector('.sheetBody');
  const chatScroll = oldBody && (view.showQuick || oldBody.scrollHeight - oldBody.scrollTop - oldBody.clientHeight > 40) ? oldBody.scrollTop : null;
  const page = view.route === 'feedback' ? renderFeedback() : view.route === 'trends' ? renderTrends() : view.route === 'you' ? renderYou() : view.route === 'log' ? renderLog() : view.route === 'admin' && view.isAdmin ? renderAdmin() : view.route === 'import' ? renderImport() : view.route === 'help' ? renderHelp() : view.route === 'friends' ? renderFriends() : view.route === 'together' ? renderTogether() : view.route === 'friend' ? renderFriend() : renderHome();
  const dock = view.route === 'friend' && featureOn('friends') ? backDock() : `${showSheet() ? '<div class="chatScrim"></div>' : ''}${renderDock()}`;
  const layout = desktopQuery.matches
    ? `<div class="desk">
        <nav class="side" aria-label="Exodia"><a class="sideBrand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>${drawerContent()}</nav>
        <div class="center">${page}${dock}</div>
        <aside class="right" aria-label="Progress">${rightTotal()}${renderProgress()}</aside>
      </div>`
    : `<header class="topbar"><div class="topbarInner">
        <button class="iconBtn" data-action="open-menu" aria-label="Open menu">${ICONS.menu}</button>
        <a class="brand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>
        ${view.route === 'home' ? `<a class="iconBtn" href="#/trends" aria-label="Trends">${ICONS.trends}</a>` : `<a class="iconBtn" href="#/" aria-label="Home">${ICONS.home}</a>`}
      </div></header>
      ${page}${dock}${view.menu ? renderDrawer() : ''}`;
    if (!view.menu) { view.menuShown = false; clearTimeout(view.menuTimer); view.menuTimer = null; }
  // The update pill keeps its own element across redraws (sync and checks redraw often), so a tap that is under way
  // on it is never lost to a fresh copy.
  const keptPill = document.querySelector('.updatedPill');
  // The computer's right panel scrolls on its own; a redraw builds it new, so its place is carried over (it used to
  // jump to the top whenever anything redrew, like Strength / Recovery or a sync).
  const rightTop = document.querySelector('.right')?.scrollTop || 0;
  app.innerHTML = `
    ${layout}
    ${buildBanner()}${view.toast ? `<div class="toast ${view.toast.kind}${view.toast.open ? ' open' : ''}${view.toast.shown ? ' still' : ''}" role="status">
      <div class="toastMain"><button class="toastBody" data-action="${view.toast.go ? 'toast-go' : view.toast.detail ? 'toggle-toast' : 'dismiss-toast'}" ${view.toast.detail ? `aria-expanded="${Boolean(view.toast.open)}"` : 'aria-label="Dismiss"'}>${view.toast.kind === 'max' ? `<span class="trophy">${ICONS.trophy}</span>` : ''}<div class="toastWords"><p class="toastTitle">${esc(view.toast.title)}</p><p class="toastText num">${esc(view.toast.text)}</p></div>${view.toast.detail ? `<span class="toastChev">${ICONS.chev}</span>` : ''}</button>${view.toast.undo || view.toast.redo ? `${view.toast.redo ? '<button class="toastEdit" data-action="redo-change">Redo</button>' : ''}${view.toast.undo ? '<button class="toastEdit" data-action="undo-change">Undo</button>' : ''}` : view.toast.edit ? '<button class="toastEdit" data-action="edit-added">Edit</button>' : ''}</div>
      ${view.toast.detail ? `<div class="toastMore"><div><div class="toastDetail">${view.toast.detail}${view.toast.edit && view.toast.undo ? '<button class="textBtn toastEditLink" data-action="edit-added">Change something</button>' : ''}</div></div></div>` : ''}
    </div>` : ''}${renderLeft()}${updatedPill()}${devExtras()}${demoPill()}`;
  const freshRight = document.querySelector('.right');
  if (freshRight && rightTop) freshRight.scrollTop = rightTop;
  placeWhen();
  const freshPill = document.querySelector('.updatedPill');
  if (keptPill && freshPill && keptPill !== freshPill && keptPill.dataset.sig === freshPill.dataset.sig && !keptPill.classList.contains('gone')) freshPill.replaceWith(keptPill);
  if (view.toast) view.toast.shown = true;
  watchDock();
  const draft = document.getElementById('draft');
  if (draft) {
    fitDraft(draft);
    if (draftFocused || view.focusDraft) {
      draft.focus();
      // A pre-filled answer has ___ where a number is missing: the first one is selected, so typing replaces it.
      const blank = view.selectBlank ? draft.value.indexOf('___') : -1;
      const [start, end] = blank >= 0 ? [blank, blank + 3] : view.selectDraft ? [0, draft.value.length] : caret || [draft.value.length, draft.value.length];
      draft.setSelectionRange(start, end);
    }
  }
  if (friendSearchFocused) {
    const box = document.getElementById('friendSearch');
    box?.focus();
    box?.setSelectionRange(box.value.length, box.value.length);
  }
  if (searchFocused) {
    const search = document.getElementById('search');
    search?.focus();
    search?.setSelectionRange(search.value.length, search.value.length);
  }
  // A lift just added with an empty set: its first empty kg box gets the caret. On a phone only when the box already
  // sits above where the keyboard will open (about 360 px with its bar), so the page never moves.
  if (view.focusSet) {
    const index = (sessionFor(view.focusSet.date)?.exercises || []).findIndex((exercise) => exercise.name === view.focusSet.name);
    const box = [...document.querySelectorAll(`input[data-field="kg"][data-date="${view.focusSet.date}"][data-exercise="${index}"]`)].find((input) => !input.value);
    const spot = box?.getBoundingClientRect();
    const screenH = window.visualViewport?.height || window.innerHeight;
    if (box && (desktopQuery.matches || (spot.top > 60 && spot.bottom < screenH - 360))) box.focus({ preventScroll: true });
    view.focusSet = null;
  }
  if (setFocus) {
    const box = document.querySelector(`input[data-field="${setFocus.field}"][data-date="${setFocus.date}"][data-exercise="${setFocus.exercise}"][data-set="${setFocus.set}"]`);
    if (box) {
      box.focus({ preventScroll: true });
      box.setSelectionRange(...setFocus.caret);
    }
  }
  view.focusDraft = false;
  view.selectDraft = false;
  view.selectBlank = false;
  view.opening = null;
  view.menuEnter = false;
  view.rulesEnter = false;
  view.levelInfoEnter = false;
  view.calEnter = false;
  view.reveal = false;
  tuckCards();
  fitNames();
  const body = document.querySelector('.sheetBody');
  if (body) body.scrollTop = chatScroll ?? restingScroll(body);
  if (view.trayEnter) animateChat(true);
  view.trayEnter = false;
  document.querySelectorAll('.moveDays').forEach((row) => { row.scrollLeft = row.scrollWidth; });
  if (view.trendScroll && view.route === 'trends') {
    const card = [...document.querySelectorAll('[data-trend]')].find((item) => item.dataset.trend === view.trendScroll);
    view.trendScroll = null;
    const chart = view.trendScrollChart && card ? card.querySelector('.chartHead') : null;
    view.trendScrollChart = false;
    if (card) requestAnimationFrame(() => (chart || card).scrollIntoView({ block: 'start' }));
  }
  if (view.scrollTarget) {
    const date = view.scrollTarget;
    view.scrollTarget = null;
    const landed = view.focusLanded;
    view.focusLanded = false;
    requestAnimationFrame(() => (landed ? focusLanded(date, landed) : centreDay(date)));
  }
};

const closeComposer = () => {
  view.composer = false;
  view.composerDate = null;
  view.dayPicked = false;
  view.draft = '';
  view.voiceBlob = null;
  view.status = '';
  view.focusDraft = desktopQuery.matches;
  stopRecording();
};

let recording = null;

const voiceStore = (mode, run) => new Promise((resolve, reject) => {
  const open = indexedDB.open('exodia-voice', 1);
  open.onupgradeneeded = () => open.result.createObjectStore('notes');
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const request = run(open.result.transaction('notes', mode).objectStore('notes'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  };
});
const keepVoice = (id, blob) => voiceStore('readwrite', (store) => store.put(blob, id)).catch(() => null);
const loadVoice = (id) => voiceStore('readonly', (store) => store.get(id)).catch(() => null);
const dropVoice = (id) => voiceStore('readwrite', (store) => store.delete(id)).catch(() => null);
const liveLine = () => view.live || (view.speaking ? 'Hearing you…' : 'Listening…');

// The phone's own speech-to-text is not used at all: it garbles gym talk, and it used to land in the box as if it were
// the user's own correction. Only the recording counts; Whisper and Gemini listen to it on the server.
const startLiveText = () => {};

const stopRecording = async () => {
  if (!recording) return null;
  const { recorder, context, frame, timer, done, chunks, recognizer } = recording;
  recording = null;
  try {
    recognizer?.stop();
  } catch {
    // already stopped
  }
  clearTimeout(timer);
  cancelAnimationFrame(frame);
  try {
    if (recorder.state !== 'inactive') recorder.stop();
  } catch {
    // the phone already ended it
  }
  context.close().catch(() => null);
  view.listening = false;
  view.speaking = false;
  // If the phone never says the recording stopped, go on after 3 s with what came in, instead of waiting for ever.
  return Promise.race([done, new Promise((resolve) => setTimeout(() => resolve(new Blob(chunks, { type: recorder.mimeType })), 3000))]);
};

const watchLevel = (stream, context) => {
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  let lastLoud = 0;
  const tick = () => {
    if (!recording) return;
    analyser.getFloatTimeDomainData(samples);
    const level = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    if (level > 0.03) lastLoud = performance.now();
    const speaking = performance.now() - lastLoud < 500;
    if (speaking !== view.speaking) {
      view.speaking = speaking;
      document.querySelector('.prompt .wave')?.classList.toggle('speaking', speaking);
      const line = document.querySelector('.prompt .liveText');
      if (line) line.textContent = liveLine();
    }
    recording.frame = requestAnimationFrame(tick);
  };
  tick();
};

const startListening = async () => {
  if (!desktopQuery.matches) document.activeElement?.blur();
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    view.status = 'Use the mic on your keyboard.';
    view.focusDraft = true;
    render();
    return;
  }
  const context = new AudioContext();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    context.close();
    view.status = 'Allow the microphone to talk to Exodia.';
    render();
    return;
  }
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType }));
    };
  });
  recorder.start();
  recording = { recorder, context, done, chunks, frame: 0, timer: setTimeout(send, 360000) };
  watchLevel(stream, context);
  view.live = '';
  startLiveText();
  view.listening = true;
  view.status = '';
  openChat();
  render();
};

const wavBase64 = async (blob) => {
  const decoder = new AudioContext();
  const audio = await decoder.decodeAudioData(await blob.arrayBuffer());
  decoder.close();
  const rate = 16000;
  const offline = new OfflineAudioContext(1, Math.ceil(audio.duration * rate), rate);
  const source = offline.createBufferSource();
  source.buffer = audio;
  source.connect(offline.destination);
  source.start();
  const samples = (await offline.startRendering()).getChannelData(0);
  const wav = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const write = (offset, text) => [...text].forEach((character, index) => wav.setUint8(offset + index, character.charCodeAt(0)));
  write(0, 'RIFF');
  wav.setUint32(4, 36 + samples.length * 2, true);
  write(8, 'WAVEfmt ');
  wav.setUint32(16, 16, true);
  wav.setUint16(20, 1, true);
  wav.setUint16(22, 1, true);
  wav.setUint32(24, rate, true);
  wav.setUint32(28, rate * 2, true);
  wav.setUint16(32, 2, true);
  wav.setUint16(34, 16, true);
  write(36, 'data');
  wav.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => wav.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(new Blob([wav], { type: 'audio/wav' }));
  });
  return dataUrl.split(',')[1];
};

const DAY_WORDS = /\b(yesterday|today|mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\b(last|ago|on the)\b|\d{1,2}(st|nd|rd|th)\b|\d{1,2}\/\d{1,2}/i;

// Where the writing skeleton goes until the AI answers: English and Swedish day words ("igår", "i fredags").
const SWEDISH_DAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
// "October 21", "21st of Oct", "21 oktober 2025": that day (last year's when it would be in the future).
const MONTH_WORDS = ['jan(?:uary|uari)?', 'feb(?:ruary|ruari)?', 'mar(?:ch|s)?', 'apr(?:il)?', 'ma[jy]', 'jun[ei]?', 'jul[yi]?', 'aug(?:ust|usti)?', 'sept?(?:ember)?', 'o[ck]t(?:ober)?', 'nov(?:ember)?', 'dec(?:ember)?'];
const monthDate = (text) => {
  const words = MONTH_WORDS.join('|');
  const match = String(text || '').toLowerCase().match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th|e|:e)?(?:\\s+of)?\\s+(${words})\\b\\.?(?:\\s+(\\d{4}))?\\b|\\b(${words})\\b\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(\\d{4}))?`));
  if (!match) return null;
  const [day, month, year] = match[1] ? [match[1], match[2], match[3]] : [match[5], match[4], match[6]];
  const index = MONTH_WORDS.findIndex((word) => new RegExp(`^(?:${word})$`).test(month));
  if (index === -1 || Number(day) < 1 || Number(day) > 31) return null;
  const pad = (value) => String(value).padStart(2, '0');
  let iso = `${year || todayIso().slice(0, 4)}-${pad(index + 1)}-${pad(day)}`;
  if (!year && iso > todayIso()) iso = `${Number(iso.slice(0, 4)) - 1}${iso.slice(4)}`;
  return isoDate(parseIso(iso)) === iso ? iso : null;
};
const guessDate = (text, fallback) => {
  text = String(text || '');
  const named = monthDate(text);
  if (named) return named;
  if (/\b(day before yesterday|förrgår)/i.test(text)) return addDays(todayIso(), -2);
  if (/\byesterday\b|\bi\s?går(?![a-zåäö])/i.test(text)) return addDays(todayIso(), -1);
  const swedish = SWEDISH_DAYS.findIndex((day) => text.toLowerCase().includes(day));
  const weekday = swedish !== -1 ? swedish : ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].findIndex((day) => new RegExp(`\\b${day}[a-z]*\\b`, 'i').test(text));
  if (weekday === -1) return fallback;
  const back = (new Date().getDay() - weekday + 7) % 7 || 7;
  return addDays(todayIso(), -back);
};

const EDIT_WORDS = /\b(remove|delete|undo|change|edit|fix|wrong|instead|ta bort|radera|ändra|byt)\b/i;

// Put the days of one step back the way it stored them, and return how they look now (for the opposite step).
const replay = (step) => {
  const now = {};
  for (const [date, json] of Object.entries(step.before)) {
    now[date] = lastSaved[date] ?? null;
    state.sessions = state.sessions.filter((item) => item.date !== date);
    if (json) state.sessions.push(JSON.parse(json));
  }
  replaying = true;
  save();
  replaying = false;
  glowFor(Object.keys(step.before).filter((date) => view.open.has(date)).map((date) => ({ date, name: null })));
  return { at: Date.now(), title: step.title, before: now };
};
const stepToast = (title, text) => {
  view.toast = { kind: 'rep', title, text, undo: undoSteps.length > 0, redo: redoSteps.length > 0 };
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 8000);
};
const undoStep = () => {
  const step = undoSteps.pop();
  if (!step) return stepToast('Nothing to undo', 'Changes from this visit can be undone');
  redoSteps.push(replay(step));
  stepToast(`Undid${step.title ? `: ${step.title}` : ' the last change'}`, undoSteps.length ? 'Undo again to go further back' : 'That was the oldest change');
};
const redoStep = () => {
  const step = redoSteps.pop();
  if (!step) return stepToast('Nothing to redo', '');
  undoSteps.push(replay(step));
  stepToast(`Redid${step.title ? `: ${step.title}` : ' the change'}`, redoSteps.length ? 'Redo again for the next one' : 'Back to the latest');
};

// "change the last set of hammer curls to 15 kg instead of 17.5", "make set 2 of deadlift 100 kg", "the first set of
// squat was 8 reps": one set of one lift on a known day. Only when the lift, the set and the new number are all plain;
// anything else goes to the AI.
const ORDINAL_SET = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8 };
const localSetEdit = (text, date) => {
  const session = date && sessionFor(date);
  const words = ` ${String(text || '').toLowerCase().replace(/[’']s\b/g, '')} `;
  if (!session || !/\bset\b/.test(words) || !/\b(change|make|should be|was|instead|fix|correct)\b/.test(words)) return null;
  const named = session.exercises.filter((exercise) => {
    const name = exercise.name.toLowerCase();
    return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}(e?s)?\\b`).test(words);
  });
  if (named.length !== 1) return null;
  const exercise = named[0];
  const count = exercise.sets.length;
  const nth = words.match(/\bset (\d+)\b/) || words.match(/\b(\d+)(?:st|nd|rd|th) set\b/);
  const word = words.match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth) set\b/);
  const index = /\blast set\b/.test(words) ? count - 1 : nth ? Number(nth[1]) - 1 : word ? ORDINAL_SET[word[1]] - 1 : -1;
  if (index < 0 || index >= count) return null;
  const kgMatch = words.match(/\b(?:to|make it|be|was|is)\s+(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilos?)\b/) || words.match(/\b(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilos?)\s+instead\b/);
  const repsMatch = words.match(/\b(?:to|be|was|is|did|for)\s+(\d+)\s*reps?\b/);
  // A single weight named, not as the old one ("from 17.5", "instead of 17.5"): that's the new weight.
  const weights = [...words.matchAll(/(\bfrom |\binstead of )?\b(\d+(?:[.,]\d+)?)\s*(?:kg|kgs|kilos?)\b/g)].filter((match) => !match[1]);
  const kg = kgMatch ? kgMatch[1] : weights.length === 1 ? weights[0][2] : null;
  if (!kg && !repsMatch) return null;
  return { date, exercise, index, kg: kg ? kg.replace(',', '.') : null, reps: repsMatch ? repsMatch[1] : null };
};
const applySetEdit = (edit, said) => {
  const set = edit.exercise.sets[edit.index];
  const was = `${set.kg} × ${set.reps || '?'}`;
  const kg = edit.kg ?? set.kg;
  const reps = edit.reps ?? set.reps;
  changeWithUndo(`${edit.exercise.name} set ${edit.index + 1}: ${was.replace(' × ', '\u00a0×\u00a0')}\u00a0→ ${kg}\u00a0×\u00a0${reps || '?'}`, () => {
    set.kg = String(kg);
    set.reps = String(reps ?? '');
    set.edited = true;
  }, said);
  save();
  view.open.add(edit.date);
  glowFor([{ date: edit.date, name: edit.exercise.name }]);
  view.scrollTarget = edit.date;
  view.focusLanded = '.exercise.glow';
};
const changeWithUndo = (title, change, tapped = title) => {
  const before = JSON.stringify(state.sessions);
  change();
  state.sessions = state.sessions.filter((session) => session.exercises.length || session.cardio);
  addLog(tapped, [title], { manual: true });
  view.toast = { kind: 'rep', title, text: 'Undo puts it back', undo: before };
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(() => {
    clearToast();
  }, 12000);
};

const moveSession = (source, to) => {
  const target = sessionFor(to);
  if (!target) {
    source.date = to;
    return;
  }
  for (const exercise of source.exercises) {
    const same = target.exercises.find((item) => item.name === exercise.name);
    if (same) same.sets.push(...exercise.sets);
    else target.exercises.push(exercise);
  }
  target.cardio = (target.cardio || 0) + (source.cardio || 0);
  source.exercises = [];
  source.cardio = 0;
};

const condenseSets = (sets) => {
  const parts = [];
  for (const set of sets.filter((item) => item.kg !== '' && item.reps !== '')) {
    const text = `${set.kg} × ${set.reps}${set.rpe ? ` @${set.rpe}` : ''}${set.warmup ? ' w' : ''}`;
    const last = parts.at(-1);
    if (last && last.text === text) last.count += 1;
    else parts.push({ text, count: 1 });
  }
  return parts.map(({ text, count }) => (count > 1 ? `${text} ×${count}` : text)).join(' · ');
};

const resultDetail = (touched) => {
  const days = new Map();
  for (const { date, name } of touched) {
    if (!days.has(date)) days.set(date, new Set());
    if (name) days.get(date).add(name);
  }
  return [...days].map(([date, names]) => {
    const session = sessionFor(date);
    if (!session) return '';
    const rows = session.exercises.filter((exercise) => !names.size || names.has(exercise.name)).map((exercise) => [exercise.name, condenseSets(exercise.sets)]);
    if (!names.size && session.cardio) rows.push([cardioLabel(session), humanMinutes(session.cardio)]);
    return `<p class="toastDay">${dayLabel(date)}</p>${rows.map(([name, sets]) => `<div class="toastRow"><span class="toastLift">${esc(name)}</span><span class="toastSets num">${esc(sets)}</span></div>`).join('')}`;
  }).join('');
};

const showResult = (did, touched, before = null) => {
  glowFor(touched);
  const detail = resultDetail(touched);
  const named = touched.filter((item) => item.name);
  const edit = named.length ? { date: named[0].date, names: [...new Set(named.filter((item) => item.date === named[0].date).map((item) => item.name))] } : null;
  if (view.toast?.name && ['max', 'rep'].includes(view.toast.kind)) Object.assign(view.toast, { detail, edit });
  else view.toast = { kind: 'result', title: did[0], text: did.length > 1 ? `and ${did.length - 1} more` : navigator.onLine === false ? 'Saved on this phone · syncs when you’re online' : 'Synced to all your devices', detail, edit, undo: before, open: false };
  if (before && view.toast) view.toast.undo = before;
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 12000);
};

const note = (title, text) => {
  view.toast = { kind: 'rep', title, text };
  requestAnimationFrame(render);
  setTimeout(() => {
    clearToast();
  }, 3500);
};

const loggedDay = (date, exercise) => {
  const has = (session) => session.exercises.length && (!exercise || session.exercises.some((item) => item.name === exercise));
  if (sessionFor(date) && has(sessionFor(date))) return date;
  // Only when the AI seems to have picked the wrong week ("on Monday" → last week's Monday): look for the same weekday
  // within 7 days of the date. Never further: that used to change a day months or years away.
  const weekday = parseIso(date).getDay();
  const near = (session) => Math.abs(parseIso(session.date) - parseIso(date)) <= 7 * 86400000;
  return sortedSessions().find((session) => session.date <= todayIso() && parseIso(session.date).getDay() === weekday && near(session) && has(session))?.date || date;
};

const applyEdits = (result) => {
  const done = [];
  for (const target of result.remove || []) {
    const exerciseName = target.exercise ? findExerciseName(target.exercise) || titleCase(target.exercise) : null;
    const item = { ...target, date: loggedDay(target.date, exerciseName) };
    const session = sessionFor(item.date);
    if (!session) continue;
    if (item.exercise) {
      const name = findExerciseName(item.exercise) || titleCase(item.exercise);
      if (!session.exercises.some((exercise) => exercise.name === name)) continue;
      session.exercises = session.exercises.filter((exercise) => exercise.name !== name);
      done.push(`Removed ${name} from ${dayLabel(item.date)}`);
    } else {
      session.exercises = [];
      session.cardio = 0;
      delete session.cardioName;
      done.push(`Removed ${dayLabel(item.date)}`);
    }
    if (session.exercises.length === 0 && !session.cardio) state.sessions = state.sessions.filter((other) => other !== session);
  }
  for (const target of result.replace || []) {
    const name = findExerciseName(target.exercise) || titleCase(target.exercise);
    const item = { ...target, date: loggedDay(target.date, name) };
    const session = ensureSession(item.date);
    const sets = item.sets.map((set) => ({ kg: String(set.kg), reps: Number(set.reps) > 0 ? String(set.reps) : '', ...(set.rpe ? { rpe: Number(set.rpe) } : {}), ...(set.warmup ? { warmup: true } : {}), edited: true }));
    const exercise = session.exercises.find((other) => other.name === name);
    if (exercise) exercise.sets = sets;
    else session.exercises.push({ name, sets });
    view.open.add(item.date);
    done.push(`Updated ${name} on ${dayLabel(item.date)}`);
  }
  const moving = (result.move || []).map((target) => {
    const name = target.exercise ? findExerciseName(target.exercise) || titleCase(target.exercise) : null;
    const from = loggedDay(target.from, name);
    const session = sessionFor(from);
    if (!session) return null;
    const exercises = name ? session.exercises.filter((exercise) => exercise.name === name) : [...session.exercises];
    const cardio = name ? 0 : session.cardio || 0;
    if (exercises.length === 0 && !cardio) return null;
    return { from, to: target.to, name, session, exercises, cardio };
  }).filter(Boolean);
  for (const item of moving) {
    item.session.exercises = item.session.exercises.filter((exercise) => !item.exercises.includes(exercise));
    if (!item.name) item.session.cardio = 0;
  }
  for (const item of moving) {
    const target = ensureSession(item.to);
    for (const exercise of item.exercises) {
      const same = target.exercises.find((other) => other.name === exercise.name);
      if (same) same.sets.push(...exercise.sets);
      else target.exercises.push(exercise);
    }
    target.cardio = (target.cardio || 0) + item.cardio;
    view.open.add(item.to);
    done.push(`Moved ${item.name || 'workout'} from ${dayLabel(item.from)} to ${dayLabel(item.to)}`);
  }
  state.sessions = state.sessions.filter((session) => session.exercises.length || session.cardio);
  if (done.length) save();
  return done;
};

const describeRemoval = (result) => (result.remove || []).map((target) => {
  const name = target.exercise ? findExerciseName(target.exercise) || titleCase(target.exercise) : null;
  const day = loggedDay(target.date, name);
  return name ? `${name} from ${dayLabel(day)}` : dayLabel(day);
}).join(', ');

const addLog = (said, did, extra = {}) => {
  const replaced = view.replacing;
  view.replacing = null;
  const previous = (state.log || [])[0];
  const merged = extra.merge && previous?.merge === extra.merge && Date.now() - previous.at < 120000 ? previous.at : null;
  const words = String(said || '').slice(0, 2000);
  // Something didn't go through: open the panel on the chat (not Quick add) so the reason is right there.
  if (OFF_LINE.test(did?.[0] || '')) {
    noteUse('stuck', did[0]);
    view.quickHidden = true;
    view.showQuick = false;
    if (typeof view.sheetH === 'number' && view.sheetH <= SHEET_SMALL + 4) view.sheetH = null;
  }
  // A voice note's words are the "said"; keep a flag instead of a second copy.
  const { heard, ...rest } = extra;
  const voice = heard && heard === words ? { voice: true } : heard ? { heard } : {};
  state.log = [{ at: Date.now(), said: words, did, ...rest, ...voice }, ...(state.log || []).filter((entry) => entry.at !== replaced && entry.at !== merged)].slice(0, 80);
  // The log syncs as one record; keep it well under the server's size limit by dropping the oldest entries.
  while (state.log.length > 10 && JSON.stringify(state.log).length > 200000) state.log.pop();
  save();
  // The log line names the undo step that was just made ("Added Squat to Today").
  const step = undoSteps.at(-1);
  if (step && !replaying && Date.now() - step.at < 1500 && !OFF_LINE.test(did?.[0] || '')) step.title = String(did?.[0] || said || '').slice(0, 80);
};

const describeAdd = (result, day) => result.cardioTotal && !result.exercises?.length ? `${result.cardioName || 'Cardio'} is now ${humanMinutes(result.cardioMinutes)} on ${dayLabel(day)}` : `Added ${[...(result.exercises || []).map((exercise) => `${findExerciseName(exercise.name) || titleCase(exercise.name)} ${setCount(exercise.sets.length)}`), ...(result.cardioMinutes ? [`${result.cardioName || 'cardio'} ${humanMinutes(result.cardioMinutes)}`] : [])].join(', ')} to ${dayLabel(day)}`;

// Your words win over the AI's guess: when the note spells out a more specific lift ("incline dumbbell press") than the
// one the AI returned ("Incline Bench Press", whose only word in the note is "incline"), use the one you spelled out.
// A note that names both ("incline bench 80, incline dumbbell 30") keeps both.
const sharpenNames = (result, words) => {
  const said = ` ${String(words || '').toLowerCase().replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ')} `;
  const spelled = LIBRARY.flatMap((entry) => [entry.name.toLowerCase(), ...entry.aliases].filter((alias) => said.includes(` ${alias} `)).map((alias) => ({ entry, alias })));
  const sharpen = (raw) => {
    const name = findExerciseName(raw) || raw;
    const entry = LIBRARY.find((item) => item.name === name);
    const own = entry ? [entry.name.toLowerCase(), ...entry.aliases] : [name.toLowerCase()];
    const better = spelled.filter((item) => item.entry.name !== name && own.some((word) => item.alias.includes(word) && item.alias.length > word.length)).sort((first, second) => second.alias.length - first.alias.length)[0];
    if (!better) return raw;
    const ownSpelled = spelled.filter((item) => item.entry.name === name).map((item) => item.alias);
    return ownSpelled.some((alias) => !better.alias.includes(alias)) ? raw : better.entry.name;
  };
  for (const exercise of result.exercises || []) exercise.name = sharpen(exercise.name);
  for (const target of result.replace || []) target.exercise = sharpen(target.exercise);
};
const applyResult = (result, date, said, heard = '') => {
  sharpenNames(result, `${said} ${heard}`);
  // Safety net while editing a day: sets said plainly ("75 kg T-bar 10 reps") are new sets. If the AI wants to
  // replace sets but nothing asked for a change, add them instead, so earlier sets are never overwritten.
  if (view.editContext && result.replace?.length && !EDIT_WORDS.test(`${said} ${heard}`) && !/\b(should be|make it|was|not|actually|set \d|ska vara|var|inte|egentligen)\b/i.test(`${said} ${heard}`)) {
    result.exercises = [...(result.exercises || []), ...result.replace.filter((item) => item.sets?.length).map((item) => ({ name: item.exercise, sets: item.sets }))];
    if (!result.date) result.date = result.replace[0].date;
    result.replace = [];
  }
  const before = JSON.stringify(state.sessions);
  // Sets logged with unknown reps (the "?" sets) are completed by the answer, not kept beside it.
  for (const exercise of result.exercises || []) {
    const session = sessionFor(result.date || date);
    const waiting = session?.exercises.find((item) => item.name === (findExerciseName(exercise.name) || exercise.name) && item.sets.length && item.sets.every((set) => !Number(set.reps)));
    if (waiting && exercise.sets.every((set) => Number(set.reps) > 0)) session.exercises = session.exercises.filter((item) => item !== waiting);
  }
  const did = applyEdits(result);
  if (result.label) {
    const day = sessionFor(result.date || date) || result.exercises?.length ? result.date || date : loggedDay(result.date || date, null);
    const target = sessionFor(day) || (result.exercises?.length || result.cardioMinutes ? ensureSession(day) : null);
    if (target) {
      target.label = result.label;
      save();
      did.push(`Named ${dayLabel(day)} “${result.label}”`);
    }
  }
  if (result.exercises?.length || result.cardioMinutes) {
    const day = result.date || date;
    land(result, day);
    did.push(describeAdd(result, day));
  } else view.scrollTarget = null;
  // A note goes on the day it's about; with no training that day, on the latest day logged before it.
  if (result.note?.trim()) {
    const day = result.date || date;
    const target = sessionFor(day) || sortedSessions().find((session) => session.date <= day && session.exercises.length) || null;
    if (target) {
      const note = result.note.trim().slice(0, 600);
      target.note = target.note ? `${target.note}\n${note}` : note;
      view.open.add(target.date);
      save();
      did.push(`Note on ${dayLabel(target.date)}: ${note.length > 60 ? `${note.slice(0, 60)}…` : note}`);
    } else did.push('Not logged: no session to put the note on yet. Log the training first, then add the note.');
  }
  if (result.accessoriesMinutes) {
    const day = result.date || date;
    const session = sessionFor(day) || ensureSession(day);
    session.accessories = result.accessoriesMinutes;
    save();
    did.push(`Accessories ${humanMinutes(result.accessoriesMinutes)} on ${dayLabel(day)}`);
  }
  // When the AI only echoes the whole note back, say it plainly instead of repeating it: the words are already in the bubble.
  // Nothing to log plus a question: it is a question back to them, never feedback (feedback comes as result.feedback).
  if (did.length === 0) throw Object.assign(new Error(result.unclear && result.unclear.length <= 80 ? `Didn't understand: ${result.unclear}.` : result.unclear ? "Didn't understand that one. It's saved, so Marcus can run it through a stronger Exodia." : 'Nothing to log in that. Fix it and send again.'), { unclear: true, question: result.unclear || '', fill: result.fill || '', guess: result.guess || '', engine: result.engine || '', raw: JSON.stringify(result).slice(0, 1500) });
  if (result.unclear) {
    did.push(`Didn't understand: ${result.unclear}`);
  }
  showResult(did, [
    ...(result.exercises || []).map((exercise) => ({ date: result.date || date, name: findExerciseName(exercise.name) || titleCase(exercise.name) })),
    ...(result.replace || []).map((target) => {
      const name = findExerciseName(target.exercise) || titleCase(target.exercise);
      return { date: loggedDay(target.date, name), name };
    }),
    ...(result.move || []).map((target) => ({ date: target.to, name: target.exercise ? findExerciseName(target.exercise) || titleCase(target.exercise) : null }))
  ], before);
  addLog(said, did, { heard: heard.slice(0, 2000), raw: JSON.stringify(result).slice(0, 1500), ...(result.engine ? { by: result.engine } : {}) });
};

const YES = /^(yes|yeah|yep|ja|japp|sure|do it|confirm|ok)\b/i;
const NO = /^(no|nope|nej|cancel|stop|don't)\b/i;

const answerConfirm = (yes) => {
  const pending = view.confirm;
  view.confirm = null;
  if (!pending) return;
  if (!yes) {
    addLog(pending.said, ['Cancelled, nothing removed']);
    return;
  }
  try {
    applyResult(pending.result, pending.date, pending.said, pending.heard);
  } catch (error) {
    view.status = error.message;
  }
};

const land = (result, date) => {
  const existing = sessionFor(date);
  const isNew = !existing || (existing.exercises.length === 0 && !existing.cardio);
  const names = addEntries(result, date);
  view.fresh = { date, isNew, names };
  view.scrollTarget = date;
  view.focusLanded = '.exercise.glow';
  setTimeout(() => {
    if (view.fresh && view.fresh.names === names) view.fresh = null;
  }, 1800);
};

// Import. Tables (CSV, TSV, Excel, OpenDocument, JSON, rows pasted from a spreadsheet, zips of those) are read right here
// on the phone: no AI and no size worries. Only free text (notes, messages) goes to the AI, in parts.
const FILE_BYTES = 50 * 1024 * 1024;
const AI_TEXT_LIMIT = 400000;
const unzip = async (buffer, wanted) => {
  const bytes = new Uint8Array(buffer);
  const view32 = new DataView(buffer);
  let end = bytes.length - 22;
  while (end >= 0 && view32.getUint32(end, true) !== 0x06054b50) end -= 1;
  if (end < 0) throw new Error('Could not open that file. Try CSV or Excel.');
  const count = view32.getUint16(end + 10, true);
  let at = view32.getUint32(end + 16, true);
  const files = {};
  const decoder = new TextDecoder();
  for (let index = 0; index < count; index += 1) {
    const method = view32.getUint16(at + 10, true);
    const size = view32.getUint32(at + 20, true);
    const nameLength = view32.getUint16(at + 28, true);
    const extra = view32.getUint16(at + 30, true);
    const comment = view32.getUint16(at + 32, true);
    const local = view32.getUint32(at + 42, true);
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extra + comment;
    if (!wanted(name)) continue;
    const start = local + 30 + view32.getUint16(local + 26, true) + view32.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    files[name] = method === 0 ? decoder.decode(data) : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
  }
  return files;
};
const xmlText = (xml) => xml.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const xlsxToText = (files) => {
  const strings = [...(files['xl/sharedStrings.xml'] || '').matchAll(/<si[ >][\s\S]*?<\/si>/g)].map((match) => xmlText([...match[0].matchAll(/<t[^>]*>[\s\S]*?<\/t>/g)].map((part) => part[0]).join('')));
  const styles = files['xl/styles.xml'] || '';
  const custom = {};
  for (const match of styles.matchAll(/<numFmt [^>]*numFmtId="(\d+)"[^>]*formatCode="([^"]*)"/g)) custom[match[1]] = match[2];
  // Mac Excel can count dates from 1904: those serials are 1462 days smaller.
  const epoch = /date1904="(1|true)"/.test(files['xl/workbook.xml'] || '') ? 24107 : 25569;
  const isDateFormat = (id) => (id >= 14 && id <= 22) || (id >= 45 && id <= 47) || (custom[id] !== undefined && /[dmy]/i.test(custom[id].replace(/"[^"]*"|\[[^\]]*\]|\\./g, '')));
  const xfs = (styles.match(/<cellXfs[\s\S]*?<\/cellXfs>/) || [''])[0];
  const dateStyle = [...xfs.matchAll(/<xf [^>]*numFmtId="(\d+)"/g)].map((match) => isDateFormat(Number(match[1])));
  const out = [];
  // Sheets in the workbook's own order, each under its name ("### Sheet 2 of 7: Day 6-10"): programs often keep a week or a block per sheet.
  const rels = {};
  for (const match of (files['xl/_rels/workbook.xml.rels'] || '').matchAll(/<Relationship [^>]*>/g)) {
    const id = (match[0].match(/Id="([^"]+)"/) || [])[1];
    const target = (match[0].match(/Target="([^"]+)"/) || [])[1];
    if (id && target) rels[id] = `xl/${target.replace(/^\/?xl\//, '').replace(/^\//, '')}`;
  }
  const named = [...(files['xl/workbook.xml'] || '').matchAll(/<sheet [^>]*>/g)].map((match) => ({ title: xmlText((match[0].match(/name="([^"]*)"/) || [])[1] || ''), path: rels[(match[0].match(/r:id="([^"]+)"/) || [])[1]] })).filter((sheet) => files[sheet.path]);
  const sheets = named.length ? named : Object.keys(files).filter((key) => key.startsWith('xl/worksheets/') && key.endsWith('.xml')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((path, index) => ({ title: `Sheet${index + 1}`, path }));
  for (const [index, sheet] of sheets.entries()) {
    const name = sheet.path;
    const before = out.length;
    if (sheets.length > 1) out.push(`### Sheet ${index + 1} of ${sheets.length}: ${sheet.title}`);
    for (const row of files[name].matchAll(/<row[ >][\s\S]*?<\/row>/g)) {
      const cells = [];
      for (const cell of row[0].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = cell[1];
        const ref = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
        const type = (attrs.match(/t="(\w+)"/) || [])[1];
        const style = Number((attrs.match(/s="(\d+)"/) || [])[1] || 0);
        const raw = (cell[2]?.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let value = '';
        if (type === 's') value = strings[Number(raw)] ?? '';
        else if (type === 'inlineStr') value = xmlText(cell[2] || '');
        else if (raw !== undefined) value = type === 'str' || type === 'e' ? xmlText(raw) : dateStyle[style] && Number(raw) > 1 ? new Date(Math.round((Number(raw) - epoch) * 86400000)).toISOString().slice(0, 10) : raw;
        if (ref) {
          const column = [...ref].reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
          while (cells.length < column) cells.push('');
        }
        cells.push(String(value).replace(/[\t\r\n]+/g, ' ').trim());
      }
      if (cells.some(Boolean)) out.push(cells.join('\t').replace(/\t+$/, ''));
    }
    if (out.length === before + 1) out.pop();
  }
  return out.join('\n');
};
// OpenDocument (.ods, from LibreOffice or Google Sheets): one content.xml with the rows.
const odsToText = (xml) => {
  const out = [];
  for (const row of xml.matchAll(/<table:table-row[^>]*>([\s\S]*?)<\/table:table-row>/g)) {
    const cells = [];
    for (const cell of row[1].matchAll(/<table:(?:covered-)?table-cell([^>]*?)(?:\/>|>([\s\S]*?)<\/table:(?:covered-)?table-cell>)/g)) {
      const attrs = cell[1];
      const date = (attrs.match(/office:date-value="(\d{4}-\d{2}-\d{2})/) || [])[1];
      const number = (attrs.match(/office:value="([^"]*)"/) || [])[1];
      const value = date || number || xmlText((cell[2] || '').replace(/<\/text:p>/g, ' ')).trim();
      const repeat = Math.min(Number((attrs.match(/table:number-columns-repeated="(\d+)"/) || [])[1] || 1), value ? 50 : 1);
      for (let index = 0; index < repeat; index += 1) cells.push(value.replace(/[\t\r\n]+/g, ' '));
    }
    if (cells.some(Boolean)) out.push(cells.join('\t').replace(/\t+$/, ''));
  }
  return out.join('\n');
};
// Text files can be UTF-8, UTF-16 (Excel's "Unicode text") or old Windows text.
const decodeText = (buffer) => {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  if (bytes.length > 3 && bytes[1] === 0 && bytes[3] === 0) return new TextDecoder('utf-16le').decode(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
};
// Every file comes back with plain \n line endings (old Mac files use \r only, Windows \r\n).
const readFileText = async (file) => (await readFileRaw(file)).replace(/\r\n?/g, '\n');
const readFileRaw = async (file) => {
  const name = file.name.toLowerCase();
  if (file.size > FILE_BYTES) throw new Error(`That file is ${Math.round(file.size / 1048576)} MB. Exodia takes files up to 50 MB.`);
  if (/\.numbers$/.test(name)) throw new Error('Numbers files can’t be opened here. In Numbers, tap ··· → Export → Excel, then add that file.');
  if (/\.xls$/.test(name)) throw new Error('That is an old Excel file. Save it as .xlsx or CSV, then add it.');
  if (/\.(pdf|heic|jpe?g|png|gif|mov|mp4)$/.test(name) || /^(image|video)\//.test(file.type)) throw new Error('Exodia can’t read PDFs or pictures yet. Export CSV or Excel from your app.');
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) return decodeText(buffer);
  const files = await unzip(buffer, (entry) => /^xl\/(workbook\.xml|styles\.xml|sharedStrings\.xml|worksheets\/[^/]+\.xml)$/.test(entry) || entry === 'content.xml' || (/\.(csv|tsv|txt|json)$/i.test(entry) && !entry.startsWith('__MACOSX')));
  if (Object.keys(files).some((entry) => entry.startsWith('xl/worksheets/'))) return xlsxToText(files);
  if (files['content.xml']) return odsToText(files['content.xml']);
  const inner = Object.entries(files).filter(([entry]) => /\.(csv|tsv|txt|json)$/i.test(entry));
  if (inner.length) return inner.map(([, text]) => text).join('\n');
  throw new Error('Could not find training in that file. Try CSV or Excel.');
};

// Which character splits the columns: the one that shows up the same number of times on most lines.
const tableDelimiter = (text) => {
  const lines = text.slice(0, 40000).split(/\r?\n/).filter((line) => line.trim()).slice(0, 60);
  if (lines.length < 2) return '';
  let best = { delimiter: '', score: 0 };
  for (const delimiter of ['\t', ';', ',', '|']) {
    const counts = lines.map((line) => line.split(delimiter).length - 1).filter((count) => count > 0);
    const tally = {};
    for (const count of counts) tally[count] = (tally[count] || 0) + 1;
    const score = Math.max(0, ...Object.values(tally));
    if (score > best.score) best = { delimiter, score };
  }
  return best.score >= Math.min(3, lines.length - 1) ? best.delimiter : '';
};
const parseDelimited = (text, delimiter) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character !== '"') cell += character;
      else if (text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = false;
    } else if (character === '"' && !cell.trim()) {
      quoted = true;
      cell = '';
    } else if (character === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += character;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};
// JSON exports: every innermost list item becomes a row that also carries its parents' fields (workout date, exercise name).
const jsonRows = (root) => {
  const rows = [];
  const visit = (node, fields, label) => {
    if (rows.length > 300000) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, fields, label);
      return;
    }
    if (!node || typeof node !== 'object') return;
    const own = { ...fields };
    const lists = [];
    const take = (object, prefix) => {
      for (const [key, value] of Object.entries(object)) {
        const name = `${prefix}${key}`;
        if (Array.isArray(value)) {
          if (value.some((item) => item && typeof item === 'object')) lists.push([value, key]);
          else own[name] = value.join(' ');
        } else if (value && typeof value === 'object') take(value, `${name} `);
        else own[name] = value ?? '';
      }
    };
    take(node, label ? `${label} ` : '');
    if (!lists.length) rows.push(own);
    for (const [list, key] of lists) visit(list, own, key);
  };
  visit(root, {}, '');
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [keys, ...rows.map((row) => keys.map((key) => String(row[key] ?? '')))];
};

const headName = (value) => String(value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/[_\-./()[\]:#]+/g, ' ').replace(/\s+/g, ' ').trim();
const COLUMN_RULES = [
  ['exercise', /^(exercise|exercise name|exercise title|exercises name|exercises title|exercise names|övning|ovning|övningar|movement|lift)$/],
  ['exercise', /\b(exercises?|övning|movement)\b/, /\b(notes?|id|type|category|superset|order|count|number|index|group|muscle|template)\b/],
  ['date', /^(date|datum|workout date|session date|date time|datetime|workouts date|start date)$/],
  ['date', /\b(date|datum|start time|start|started|performed|timestamp|time)\b/, /\b(end|ended|finish|duration|update|updated|modified|birth|created|rest)\b/],
  ['date', /\bcreated\b|^(day|dag)$/],
  ['weight', /^(weight|weight kg|weight kgs|weight lbs|weight lb|kg|kgs|lbs|lb|load|vikt|vikt kg|sets weight|sets weight kg)$/],
  ['weight', /\b(weight|kg|kgs|lbs?|load|vikt)\b/, /\b(body|bodyweight|unit|bw|total|volume|distance)\b/],
  ['reps', /^(reps|rep|repetitions|repetitioner|reps count|antal reps|reps done|sets reps)$/],
  ['reps', /\b(reps?|repetitions?|repetitioner)\b/, /\b(in reserve|rir|target|goal|planned|min|max)\b/],
  ['sets', /^(sets|set count|number of sets|antal set|num sets|set)$/],
  ['rpe', /\brpe\b/],
  ['rir', /\brir\b|reps in reserve/],
  ['warmup', /warm ?up|uppvärmning|set type|sets type|^type$/],
  ['warmup', /set order|set index|sets index/],
  ['label', /^(workout name|workout title|workout|title|routine|routine name|session|session name|pass|program day|workouts name|workouts title|name)$/],
  ['unit', /\bunit\b/, /distance|time/]
];
const findColumns = (row) => {
  const heads = row.map(headName);
  if (heads.filter(Boolean).length < 2) return null;
  const columns = { date: -1, exercise: -1, weight: -1, reps: -1, sets: -1, rpe: -1, rir: -1, warmup: -1, label: -1, unit: -1 };
  const used = new Set();
  for (const [field, test, skip] of COLUMN_RULES) {
    if (columns[field] >= 0) continue;
    const index = heads.findIndex((head, at) => head && !used.has(at) && test.test(head) && !(skip && skip.test(head)));
    if (index < 0) continue;
    columns[field] = index;
    used.add(index);
  }
  // A "set" column that counts 1, 2, 3 is the set number, not how many sets the row stands for.
  if (columns.sets >= 0 && heads[columns.sets] === 'set') columns.sets = -1;
  if (columns.exercise < 0 || (columns.weight < 0 && columns.reps < 0 && columns.date < 0)) return null;
  columns.lb = columns.weight >= 0 && /\blbs?\b/.test(heads[columns.weight]);
  columns.warmHeader = columns.warmup >= 0 && /warm|uppv/.test(heads[columns.warmup]);
  return columns;
};
const IMPORT_MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, maj: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12 };
const readDate = (raw, order = 'dmy') => {
  const value = String(raw ?? '').trim().toLowerCase();
  if (!value) return '';
  let year;
  let month;
  let day;
  let match;
  if ((match = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) [, year, month, day] = match;
  else if ((match = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})\b/))) {
    [month, day] = order === 'mdy' ? [match[1], match[2]] : [match[2], match[1]];
    year = match[3].length === 2 ? `20${match[3]}` : match[3];
  } else if ((match = value.match(/^(?:[a-zåäö]+,?\s+)?(\d{1,2})(?:st|nd|rd|th)?\.?\s+([a-zåäö]{3})[a-zåäö]*\.?,?\s+(\d{4})/))) [, day, month, year] = [match[0], match[1], IMPORT_MONTHS[match[2]], match[3]];
  else if ((match = value.match(/^(?:[a-z]+,?\s+)?([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/))) [, month, day, year] = [match[0], IMPORT_MONTHS[match[1]], match[2], match[3]];
  else if (/^\d{5}(\.\d+)?$/.test(value) && Number(value) > 32000 && Number(value) < 80000) return new Date(Math.round((Number(value) - 25569) * 86400000)).toISOString().slice(0, 10);
  else if (/^\d{10}(\.\d+)?$|^\d{13}$/.test(value)) return isoDate(new Date(value.length === 13 ? Number(value) : Number(value) * 1000));
  else return '';
  [year, month, day] = [Number(year), Number(month), Number(day)];
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1990 && year <= 2100)) return '';
  return `${year}-${pad(month)}-${pad(day)}`;
};
// 05/06/2024: day first unless the file shows otherwise (a second number above 12 means month first).
const dateOrderFor = (rows, start, column) => {
  if (column < 0) return 'dmy';
  let order = 'dmy';
  for (const row of rows.slice(start, start + 3000)) {
    const match = String(row[column] ?? '').match(/^(\d{1,2})[-/.](\d{1,2})[-/.]\d{2,4}/);
    if (!match) continue;
    if (Number(match[1]) > 12) return 'dmy';
    if (Number(match[2]) > 12) order = 'mdy';
  }
  return order;
};
const readNumber = (raw) => {
  let value = String(raw ?? '').replace(/\s/g, '');
  value = value.includes(',') && value.includes('.') ? value.replace(/,/g, '') : value.replace(',', '.');
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : NaN;
};
const SAFE_ALIASES = new Set(['squat', 'squats', 'deadlift', 'deadlifts', 'bench', 'dips', 'dip', 'pullup', 'pullups', 'chins', 'marklyft', 'knäböj']);
const importNames = new Map();
const importName = (raw) => {
  const name = String(raw).replace(/\s+/g, ' ').trim().slice(0, 60);
  if (importNames.has(name)) return importNames.get(name);
  const plain = name.match(/^(.*?)\s*\((barbell|skivstång|stång)\)$/i);
  const base = (plain ? plain[1] : name).toLowerCase().replace(/[^\p{L}\s-]/gu, '').trim();
  const entry = LIBRARY.find((item) => item.name.toLowerCase() === base || item.aliases.some((alias) => alias === base && (alias.includes(' ') || SAFE_ALIASES.has(alias))));
  const known = state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)).find((item) => item.toLowerCase() === name.toLowerCase());
  const result = entry?.name || (/^bänk(press)?$/.test(base) ? 'Bench Press' : known || (name === name.toLowerCase() ? titleCase(name) : name));
  importNames.set(name, result);
  return result;
};
const SET_PATTERN = /(\d+(?:[.,]\d+)?)\s*(kg|kgs|kilo|lbs?)?\s*[x×*]\s*(\d+)(?:\s*[x×*]\s*(\d+))?/gi;
// Turn table rows into days. Headers are found by their names; a new header row (another sheet) switches the columns.
const tableDays = (rows, given = null) => {
  const today = todayIso();
  const days = new Map();
  let columns = given;
  let order = given?.dateOrder || (given ? dateOrderFor(rows, given.headerRow + 1, given.date) : 'dmy');
  let date = '';
  let exercise = '';
  let label = '';
  for (let index = given ? given.headerRow + 1 : 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!given && row.filter((value) => /^[\d\s.,:/-]+$/.test(value)).length <= 1) {
      const found = findColumns(row);
      if (found && [found.weight, found.reps].every((column) => column < 0 || Number.isNaN(readNumber(row[column])))) {
        columns = found;
        order = dateOrderFor(rows, index + 1, found.date);
        if (found.date >= 0) date = '';
        exercise = '';
        continue;
      }
    }
    // A row that is only a date ("1 Oct 2025") starts that day, for logs written as blocks.
    const filled = row.filter(Boolean);
    const dayRow = filled.length <= 2 && (!columns || columns.date < 0) ? readDate(filled[0], order) : '';
    if (dayRow) {
      date = dayRow;
      label = '';
      continue;
    }
    if (!columns) {
      if (index > 60) return [];
      continue;
    }
    const cell = (field) => (columns[field] >= 0 ? String(row[columns[field]] ?? '').trim() : '');
    if (columns.date >= 0) {
      const raw = cell('date');
      if (raw) {
        const parsed = readDate(raw, order);
        if (!parsed) continue;
        if (parsed !== date) label = '';
        date = parsed;
      }
    }
    const named = cell('exercise');
    if (/\p{L}/u.test(named)) exercise = importName(named);
    if (cell('label')) label = cell('label').slice(0, 40);
    if (!date || !exercise || date > today) continue;
    const pounds = columns.lb || /^lbs?$/i.test(cell('unit'));
    const found = [];
    if (columns.weight >= 0 || columns.reps >= 0) {
      const kg = columns.weight >= 0 ? readNumber(cell('weight')) : 0;
      const reps = Math.round(readNumber(cell('reps')));
      const count = columns.sets >= 0 ? Math.round(readNumber(cell('sets'))) : 1;
      if (reps > 0) for (let set = 0; set < Math.min(20, count > 0 ? count : 1); set += 1) found.push({ kg: Number.isNaN(kg) ? 0 : kg, reps });
    } else {
      row.forEach((value, at) => {
        if ([columns.date, columns.exercise, columns.label].includes(at)) return;
        for (const match of String(value).matchAll(SET_PATTERN)) {
          for (let set = 0; set < Math.min(20, Number(match[4]) || 1); set += 1) found.push({ kg: readNumber(match[1]), reps: Number(match[3]), pounds: /lb/i.test(match[2] || '') });
        }
      });
    }
    if (!found.length) continue;
    const rpe = readNumber(cell('rpe'));
    const rir = readNumber(cell('rir'));
    const effort = rpe >= 1 && rpe <= 10 ? rpe : rir >= 0 && rir <= 10 ? 10 - rir : 0;
    const marker = cell('warmup');
    const warmup = /warm|uppv|^w$/i.test(marker) || (columns.warmHeader && /^(1|true|yes|ja|x)$/i.test(marker));
    if (!days.has(date)) days.set(date, { date, label, exercises: new Map() });
    const day = days.get(date);
    if (label && !day.label) day.label = label;
    if (!day.exercises.has(exercise)) day.exercises.set(exercise, []);
    for (const set of found) {
      const kg = Math.min(1000, Math.max(0, pounds || set.pounds ? Math.round(set.kg * 0.45359237 * 2) / 2 : set.kg));
      day.exercises.get(exercise).push({ kg: String(Math.round(kg * 100) / 100), reps: String(Math.min(100, set.reps)), ...(effort ? { rpe: effort } : {}), ...(warmup ? { warmup: true } : {}), edited: true });
    }
  }
  return [...days.values()].map((day) => ({ date: day.date, label: day.label, exercises: [...day.exercises].map(([name, sets]) => ({ name, sets })) }));
};
const tableRows = (text) => {
  const trimmed = text.trim();
  if (/^[[{]/.test(trimmed)) {
    try {
      return jsonRows(JSON.parse(trimmed));
    } catch {
      // not JSON after all
    }
  }
  const delimiter = tableDelimiter(trimmed);
  return delimiter ? parseDelimited(trimmed, delimiter) : null;
};
// Are all of these sets (kg × reps, counted) in that list?
const containsSets = (have, want) => {
  const left = have.map((set) => `${Number(set.kg)}x${Number(set.reps)}`);
  return want.every((set) => {
    const index = left.indexOf(`${Number(set.kg)}x${Number(set.reps)}`);
    if (index < 0) return false;
    left.splice(index, 1);
    return true;
  });
};
const sameImportSets = (first, second) => first.length === second.length && first.every((set, index) => Number(set.kg) === Number(second[index].kg) && Number(set.reps) === Number(second[index].reps));
// Adding a file again never doubles a day: a lift that is already on that day with the same sets is left alone,
// with other sets the file's version replaces it (the newest file wins). Within one file, sets of the same lift on
// the same day are kept together. Lifts on that day that the file doesn't mention stay as they are.
// A set far heavier than anything else of that lift (your log and the rest of the file) is most likely a typo in
// the file, like a bench 190 × 1 among 110s and 122s when your heaviest is 145. Such a set is held back and Exodia
// asks once: more than 20% and 10 kg above both your heaviest logged set and the file's next heaviest set.
const OUTLIER_SHARE = 1.2;
const holdOutliers = (days) => {
  const byLift = new Map();
  for (const day of days) for (const exercise of day.exercises) for (const set of exercise.sets) {
    const name = exercise.name.toLowerCase();
    if (!byLift.has(name)) byLift.set(name, []);
    byLift.get(name).push(Number(set.kg) || 0);
  }
  const limit = new Map();
  for (const [name, kgs] of byLift) {
    const logged = Math.max(0, ...state.sessions.flatMap((session) => session.exercises.filter((exercise) => exercise.name.toLowerCase() === name).flatMap((exercise) => exercise.sets.map((set) => Number(set.kg) || 0))));
    const sorted = [...kgs].sort((first, second) => second - first);
    const base = Math.max(logged, sorted[1] || 0);
    if (base > 0) limit.set(name, Math.max(base * OUTLIER_SHARE, base + 10));
  }
  const held = [];
  const kept = days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => {
    const cap = limit.get(exercise.name.toLowerCase());
    if (!cap) return exercise;
    const sets = exercise.sets.filter((set) => {
      if ((Number(set.kg) || 0) <= cap) return true;
      held.push({ date: day.date, name: exercise.name, set, best: Math.round(cap / OUTLIER_SHARE) });
      return false;
    });
    return { ...exercise, sets };
  }).filter((exercise) => exercise.sets.length) }));
  return { kept, held };
};
const mergeImported = (days) => {
  const { kept, held } = holdOutliers(days);
  days = kept;
  if (held.length) view.outlierAsk = [...(view.outlierAsk || []), ...held];
  const touched = [];
  let sets = 0;
  const fromThisFile = new Set();
  for (const day of days) {
    const session = sessionFor(day.date) || { date: day.date, exercises: [], cardio: 0 };
    let added = 0;
    for (const exercise of day.exercises) {
      const key = `${day.date}|${exercise.name.toLowerCase()}`;
      const same = session.exercises.find((item) => item.name.toLowerCase() === exercise.name.toLowerCase());
      const incoming = exercise.sets.map((set) => ({ ...set, imported: true }));
      // Every set of the file is already there (maybe with sets added by hand since): nothing to do.
      if (same && !fromThisFile.has(key) && containsSets(same.sets, exercise.sets)) {
        fromThisFile.add(key);
        continue;
      }
      if (same && fromThisFile.has(key)) same.sets.push(...incoming);
      // A changed file replaces what an earlier file put there; sets added by hand stay.
      else if (same) same.sets = [...incoming, ...same.sets.filter((set) => !set.imported && !exercise.sets.some((other) => sameImportSets([set], [other])))];
      else session.exercises.push({ name: exercise.name, sets: incoming });
      fromThisFile.add(key);
      added += exercise.sets.length;
    }
    if (day.cardio && !session.cardio) {
      session.cardio = day.cardio;
      added += 1;
    }
    if (!added) continue;
    if (day.label && !session.label) session.label = day.label;
    if (!sessionFor(day.date)) state.sessions.push(session);
    sets += added;
    touched.push(day.date);
  }
  return { touched, sets };
};
const importSummary = (count, sets) => (count ? `Added ${count} ${count === 1 ? 'day' : 'days'}, ${sets} sets` : 'Nothing new to add, it was all in already');
const askColumns = (rows) => fetch('/api/columns', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ rows }) })
  .then((response) => (response.ok ? response.json() : null))
  .then((body) => (body && body.exercise >= 0 && (body.weight >= 0 || body.reps >= 0) ? { ...body, headerRow: Math.max(-1, Number(body.headerRow) || 0), lb: body.weightUnit === 'lb', warmHeader: true } : null))
  .catch(() => null);
// A busy AI during an import: wait and go again by itself (about 7 minutes in all), saying so calmly.
const IMPORT_WAIT = [10, 20, 30, 60, 60, 120, 120];
const importPause = async (attempt, progress, index, total) => {
  for (let left = IMPORT_WAIT[attempt]; left > 0; left -= 5) {
    progress(index, total, `Exodia's AI is busy, going again in ${left} s. Keep using the app, this finishes by itself.`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(5, left) * 1000));
  }
  progress(index, total, total > 1 ? `Reading part ${index + 1} of ${total}…` : 'Reading the file…');
};
const sendImportPart = async (text, extra = {}) => {
  const response = await fetchOrLater('/api/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, today: todayIso(), ...(view.sandbox ? { dry: true } : {}), ...extra, name: state.name || '', ...(state.body?.kg ? { bodyweight: state.body.kg } : {}), known: [...new Set([...state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)), ...LIBRARY.map((entry) => entry.name)])].slice(0, 100) }) }, 150000);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || 'Could not read that. Try again.'), { busy: response.status === 429 || response.status >= 500 });
  return body;
};
// Free text goes to the AI in parts of about 24,000 characters, one after the other, so a long history never times out.
const aiImport = async (text, progress) => {
  const pieces = splitPieces(text);
  const added = new Map();
  const unclear = [];
  let failed = 0;
  let lastError = null;
  for (const [index, part] of pieces.entries()) {
    progress(index, pieces.length);
    for (let attempt = 0; attempt <= IMPORT_WAIT.length; attempt += 1) {
      try {
        const body = await sendImportPart(part);
        for (const session of body.sessions || []) {
          state.sessions = state.sessions.filter((item) => item.date !== session.date);
          state.sessions.push(session);
        }
        for (const day of body.added || []) if (day.sets > 0) added.set(day.date, (added.get(day.date) || 0) + day.sets);
        if (body.unclear) unclear.push(body.unclear);
        if (body.failed) failed += 1;
        break;
      } catch (error) {
        lastError = error;
        if (attempt === IMPORT_WAIT.length || !error.busy) {
          failed += 1;
          break;
        }
        await importPause(attempt, progress, index, pieces.length);
      }
    }
  }
  if (!added.size && lastError && failed >= pieces.length) throw lastError;
  await syncNow();
  const did = [importSummary(added.size, [...added.values()].reduce((sum, sets) => sum + sets, 0)), ...(failed ? ['Some parts could not be read. Send them again to fill the gaps.'] : []), ...(text.length > AI_TEXT_LIMIT ? ['Only the first 400,000 characters were read. A CSV or Excel export brings everything.'] : []), ...(unclear.length ? [`Didn't understand: ${unclear.join(' ').slice(0, 300)}`] : [])];
  showResult(did, [...added.keys()].slice(-30).map((date) => ({ date, name: null })));
  return did;
};
const importText = async (text, progress = () => {}) => {
  const rows = tableRows(text);
  if (rows && rows.length >= 2) {
    let days = tableDays(rows);
    if (!days.length && rows.length >= 3 && navigator.onLine) {
      progress(0, 1, 'Reading the columns…');
      const mapping = await askColumns(rows.slice(0, 15));
      if (mapping) days = tableDays(rows, mapping);
    }
    if (days.length) {
      const before = JSON.stringify(state.sessions);
      const { touched, sets } = mergeImported(days);
      save();
      syncNow();
      const did = [importSummary(touched.length, sets)];
      showResult(did, touched.slice(-30).map((date) => ({ date, name: null })), touched.length ? before : null);
      return did;
    }
  }
  return aiImport(text.trim(), progress);
};

// Files: dropped, pasted or picked files wait in the box as chips, so a note can go with them ("this program started
// on March 7, 7 weeks"). On send: a table with its own dates is added straight away (Undo is there). Anything the AI
// had to place or fill in (no dates, missing values) is shown first and only added after "Add it".
// One file picker for the whole app. It lives outside the part of the page that redraws, so a file you pick can never
// get lost (a picker inside a redrawn button used to vanish the moment you clicked it, so nothing happened).
const filePicker = (() => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.className = 'sr';
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  document.body.appendChild(input);
  input.addEventListener('change', () => {
    const files = [...input.files];
    input.value = '';
    takeFiles(files);
  });
  return input;
})();
// Up to 10 files wait in the box at once; more than that says so instead of quietly dropping one.
const FILE_MAX = 10;
// Gym visits from another app (Nordic Wellness, Nordic Performance Center, Gymet): a screen recording of its visit
// list, or screenshots. The phone takes still frames (every 0.7 s of a video, a long screenshot cut into pieces), the AI
// reads the date and club off each, and every visit lands on its day in the calendar. Days you logged stay as they are.
// A visit is the club's name, or { place, time, minutes } when the gym app showed when and for how long.
const visitOf = (date) => {
  const visit = state.visits?.[date];
  if (!visit || visit.removed) return null;
  // A day from your photos also says what you did (title) and how hard it looked (level: light, medium, heavy).
  return typeof visit === 'string' ? { place: visit } : { place: String(visit.place || 'Gym'), time: visit.time || '', minutes: Number(visit.minutes) || 0, title: String(visit.title || ''), level: ['light', 'medium', 'heavy'].includes(visit.level) ? visit.level : '', from: visit.from || '' };
};
const visitShade = (visit) => (visit.level ? { light: 1, medium: 2, heavy: 4 }[visit.level] : visit.minutes > 90 ? 3 : visit.minutes > 60 ? 2 : 1);
const visitLine = (visit) => [visit.title, visit.place === 'Gym' && visit.title ? '' : visit.place, visit.time, visit.minutes ? humanMinutes(visit.minutes) : ''].filter(Boolean).join(' · ');
const visitCard = () => {
  // A day you logged opens as the full day, the same card as on Home: sets, edit, gym and time.
  const logged = view.visitOpen && sessionFor(view.visitOpen);
  if (logged && (logged.exercises.length || logged.cardio)) {
    view.open.add(logged.date);
    return `<div class="calDayCard">${renderSession(logged)}</div>`;
  }
  const visit = view.visitOpen && visitOf(view.visitOpen);
  if (!visit) return '';
  const date = view.visitOpen;
  const facts = [visit.time ? `In at ${visit.time}` : '', visit.minutes ? humanMinutes(visit.minutes) : ''].filter(Boolean).join(' · ');
  return `<div class="visitCard" role="group" aria-label="Gym visit ${dayLabel(date)}">
    <div class="visitHead"><span class="visitDate">${dayLabel(date)}</span><button class="visitClose" data-action="visit-close" aria-label="Close">×</button></div>
    <p class="visitPlace">${esc(visit.title ? `${visit.title}${visit.place !== 'Gym' ? ` · ${visit.place}` : ''}` : visit.place)}</p>
    <p class="visitFacts">${[facts, visit.level ? `${visit.level[0].toUpperCase()}${visit.level.slice(1)}` : '', visit.from === 'photos' ? 'from your photos' : visit.minutes ? 'from Google Maps' : 'from your gym app', 'no sets logged'].filter(Boolean).map(esc).join(' · ')}</p>
    <button class="textBtn visitAdd" data-action="visit-add" data-date="${date}">+ Add what you did</button>
  </div>`;
};
const isPicture = (file) => /^(image|video)\//.test(file.type) || /\.(mov|mp4|m4v|png|jpe?g|heic|webp)$/i.test(file.name);
const frameOf = (source, width, height, top = 0, part = height) => {
  const scale = Math.min(1, 720 / width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(part * scale);
  canvas.getContext('2d').drawImage(source, 0, top, width, part, 0, 0, canvas.width, canvas.height);
  return canvas;
};
const signature = (canvas) => {
  const tiny = document.createElement('canvas');
  tiny.width = 36;
  tiny.height = 72;
  const context = tiny.getContext('2d');
  context.drawImage(canvas, 0, 0, 36, 72);
  return [...context.getImageData(0, 0, 36, 72).data].filter((value, index) => index % 4 === 0);
};
const sameFrame = (first, second) => first && second && first.reduce((sum, value, index) => sum + Math.abs(value - second[index]), 0) / first.length < 1.2;
const framesOf = async (file) => {
  const url = URL.createObjectURL(file);
  const frames = [];
  try {
    if (file.type.startsWith('video') || /\.(mov|mp4|m4v)$/i.test(file.name)) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      // On the page (out of sight): some phones only draw a video's pictures when it's part of the page.
      video.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none';
      document.body.append(video);
      video.src = url;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('This phone could not open that video. Try screenshots of the list instead.'));
        setTimeout(() => reject(new Error('The video didn’t open in 15 seconds. Try again, or use screenshots of the list.')), 15000);
      });
      // Played, not jumped through: the video plays muted at double speed and a picture is taken every 0.3 s
      // (0.6 s of video). Jumping to times (seeking) is unreliable on iPhone Safari; playing isn't.
      video.playbackRate = 2;
      let last = null;
      const take = () => {
        if (!video.videoWidth || frames.length >= 120) return;
        const canvas = frameOf(video, video.videoWidth, video.videoHeight);
        const sign = signature(canvas);
        if (sameFrame(sign, last)) return;
        last = sign;
        frames.push(canvas.toDataURL('image/jpeg', 0.72).split(',')[1]);
      };
      await new Promise((resolve, reject) => {
        const timer = setInterval(take, 300);
        const done = () => {
          clearInterval(timer);
          take();
          resolve();
        };
        video.onended = done;
        // Never longer than the video takes at double speed, plus a little.
        setTimeout(done, (video.duration / 2 + 5) * 1000);
        video.play().catch(() => {
          clearInterval(timer);
          reject(new Error('This phone wouldn’t play that video here. Try screenshots of the list instead.'));
        });
      });
      video.pause();
      video.remove();
    } else {
      const image = new Image();
      image.src = url;
      await image.decode().catch(() => { throw new Error('Could not open that picture.'); });
      // A long screenshot is read in pieces about a phone screen tall, overlapping a little so no row is cut.
      const piece = Math.round(image.naturalWidth * 2);
      for (let top = 0; top < image.naturalHeight && frames.length < 120; top += Math.round(piece * 0.85)) {
        frames.push(frameOf(image, image.naturalWidth, image.naturalHeight, top, Math.min(piece, image.naturalHeight - top)).toDataURL('image/jpeg', 0.72).split(',')[1]);
      }
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return frames;
};
const readVisits = async (files) => {
  view.status = 'Opening your video…';
  if (!view.composer) openChat();
  view.sheetH = SHEET_PEEK;
  render();
  try {
    const frames = [];
    for (const file of files) frames.push(...await framesOf(file));
    if (!frames.length) throw new Error('Couldn’t take any pictures out of that video. Try screenshots of the list instead.');
    view.status = `Reading your gym visits from ${frames.length} pictures…`;
    render();
    const found = {};
    // The pictures go in parts of 6, three parts at a time; the line counts parts as they come back, and a part that
    // fails is tried once more and then skipped, so one busy moment never stops the rest.
    const parts = [];
    for (let start = 0; start < frames.length; start += 6) parts.push(frames.slice(start, start + 6));
    let doneParts = 0;
    let failed = 0;
    let lastError = '';
    const show = () => {
      view.status = `Reading your gym visits… ${doneParts} of ${parts.length} parts`;
      render();
    };
    show();
    const readPart = async (images) => {
      const send = () => timedFetch('/api/visits', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ images, today: todayIso(), name: state.name || '' }) }, 130000);
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await send();
          const body = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(body.error || 'Could not read that part.');
          for (const visit of body.visits || []) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(visit.date) || visit.date > todayIso()) continue;
            const place = String(visit.place || 'Gym').slice(0, 60);
            const time = /^\d{1,2}:\d{2}$/.test(visit.time || '') ? visit.time : '';
            const minutes = Number(visit.minutes) > 0 && Number(visit.minutes) < 600 ? Math.round(Number(visit.minutes)) : 0;
            found[visit.date] = time || minutes ? { place, ...(time ? { time } : {}), ...(minutes ? { minutes } : {}) } : place;
          }
          return;
        } catch (error) {
          lastError = error.message;
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
      failed += 1;
    };
    let next = 0;
    await Promise.all([0, 1, 2].map(async () => {
      while (next < parts.length) {
        const images = parts[next];
        next += 1;
        await readPart(images);
        doneParts += 1;
        show();
      }
    }));
    if (failed === parts.length) throw new Error(lastError || 'The AI couldn’t read the pictures.');
    const dates = Object.keys(found).sort();
    if (!dates.length) throw new Error('No gym visits found in that. Scroll the visit list slowly while recording.');
    const fresh = dates.filter((date) => !state.visits?.[date]);
    state.visits = { ...(state.visits || {}), ...found };
    save();
    view.status = '';
    addLog(`${files.length === 1 ? files[0].name : `${files.length} files`}`, [`Added ${fresh.length} gym ${fresh.length === 1 ? 'visit' : 'visits'} (${dayLabel(dates[0])} – ${dayLabel(dates.at(-1))}). They show in Every session on Trends.${failed ? ` ${failed} of ${parts.length} parts couldn’t be read: import the video again to fill any gaps.` : ''}`], { by: 'gym visits' });
    view.toast = { kind: 'result', title: `Added ${fresh.length} gym ${fresh.length === 1 ? 'visit' : 'visits'}`, text: `${dayLabel(dates[0])} – ${dayLabel(dates.at(-1))} · see Every session on Trends` };
    clearTimeout(view.toastTimer);
    view.toastTimer = setTimeout(clearToast, 8000);
  } catch (error) {
    view.status = `Gym visits not added: ${error.message}`;
    addLog('Gym visits', [`Not logged: ${error.message}`], { by: 'gym visits' });
  }
  render();
};
const takeFiles = (files) => {
  const pictures = files.filter(isPicture);
  if (pictures.length) {
    readVisits(pictures);
    files = files.filter((file) => !pictures.includes(file));
    if (!files.length) return;
  }
  const room = FILE_MAX - (view.files || []).length;
  files.slice(0, Math.max(0, room)).forEach((file) => takeFile(file));
  if (files.length > room) {
    view.status = `${files.length - Math.max(0, room)} ${files.length - room === 1 ? 'file wasn’t' : 'files weren’t'} added: up to ${FILE_MAX} at a time. Send these first, then add the rest.`;
    render();
  }
};
const attachFile = (picked) => readFileText(picked).then((text) => {
  if ((view.files || []).length >= FILE_MAX) throw new Error(`Up to ${FILE_MAX} files at a time. Send these first, then add ${picked.name}.`);
  view.files = [...(view.files || []), { name: picked.name, text }];
  view.showQuick = false;
  view.quickHidden = true;
  // Just the chip in the box and the cursor there; the panel stays out of the way.
  if (!view.composer) openChat();
  view.sheetH = SHEET_PEEK;
  view.focusDraft = true;
  render();
}).catch((error) => {
  openChat();
  addLog(`File: ${picked.name}`, [`Not logged: ${error.message || 'Could not read that file. Try saving it as CSV.'}`]);
  render();
});
const splitPieces = (text) => {
  const pieces = [];
  let piece = '';
  let sheet = '';
  for (const line of text.slice(0, AI_TEXT_LIMIT).split('\n')) {
    if (/^### Sheet \d+ of \d+: /.test(line)) sheet = line;
    if (piece.length + line.length > 24000 && piece.trim()) {
      pieces.push(piece);
      piece = sheet && line !== sheet ? `${sheet} (continued)\n` : '';
    }
    // A single huge line (a file with odd line endings) is cut into pieces, never dropped.
    for (let start = 0; start < Math.max(1, line.length); start += 24000) {
      if (start && piece.trim()) {
        pieces.push(piece);
        piece = '';
      }
      piece += `${line.slice(start, start + 24000)}\n`;
    }
  }
  if (piece.trim()) pieces.push(piece);
  return pieces;
};
// Your estimated maxes go along, so a program written in % of max turns into real kilos.
const maxesNote = () => {
  const lifts = [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].map((name) => [name, Math.round(bestOverall(name))]).filter(([, best]) => best > 0).sort((first, second) => second[1] - first[1]).slice(0, 20);
  return lifts.length ? `Known bests (estimated 1RM, kg), use them for percentages: ${lifts.map(([name, best]) => `${name} ${best}`).join(', ')}` : '';
};
// The AI reads the file with the note and sends back days without saving them (dry), so they can be shown first.
const shiftDate = (iso, count) => new Date(Date.parse(`${iso}T12:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
const aiPreview = async (text, note, progress) => {
  const days = new Map();
  const program = { perWeek: 0, days: [] };
  const unclear = [];
  let lastError = null;
  const pieces = splitPieces(text);
  for (const [index, part] of pieces.entries()) {
    progress(index, pieces.length);
    for (let attempt = 0; attempt <= IMPORT_WAIT.length; attempt += 1) {
      try {
        const body = await sendImportPart(part, { dry: true, defer: true, context: [note, maxesNote()].filter(Boolean).join('\n') });
        if (body.program) {
          program.perWeek = program.perWeek || body.program.perWeek;
          program.days.push(...body.program.days);
        }
        for (const session of body.sessions || []) {
          const day = days.get(session.date);
          if (day) day.exercises.push(...session.exercises);
          else days.set(session.date, { ...session, exercises: [...session.exercises] });
        }
        if (body.unclear) unclear.push(body.unclear);
        break;
      } catch (error) {
        lastError = error;
        if (attempt === IMPORT_WAIT.length || !error.busy) break;
        await importPause(attempt, progress, index, pieces.length);
      }
    }
  }
  // A program without a start date: date it here, once, over all its days, so it ends yesterday and no two
  // program days share a date (each part used to be dated on its own and they overlapped).
  if (program.days.length) {
    const perWeek = Math.min(7, Math.max(1, program.perWeek || 4));
    const offset = (programDay) => 7 * Math.floor((programDay - 1) / perWeek) + Math.round(((programDay - 1) % perWeek) * 7 / perWeek);
    const lastDay = Math.max(...program.days.map((day) => day.programDay));
    const start = shiftDate(todayIso(), -1 - offset(lastDay));
    for (const day of program.days) {
      const date = shiftDate(start, offset(day.programDay));
      const session = days.get(date) || { date, exercises: [], cardio: 0 };
      for (const exercise of day.exercises || []) session.exercises.push({ name: exercise.name, sets: exercise.sets.map((set) => ({ kg: String(set.kg), reps: Number(set.reps) > 0 ? String(set.reps) : '', ...(set.rpe ? { rpe: set.rpe } : {}), ...(set.warmup ? { warmup: true } : {}), edited: true })) });
      if (day.cardioMinutes && !session.cardio) session.cardio = day.cardioMinutes;
      if (day.label && !session.label) session.label = day.label;
      days.set(date, session);
    }
    unclear.unshift(`No start date was given, so the program ends yesterday. Add a note like "started 7 March 2024" to place it right.`);
  }
  if (!days.size && lastError) throw lastError;
  return { days: [...days.values()].sort((first, second) => first.date.localeCompare(second.date)), unclear: unclear.join(' ').slice(0, 300) };
};
const countSets = (days) => days.reduce((sum, day) => sum + day.exercises.reduce((total, exercise) => total + exercise.sets.length, 0), 0);
const addImported = (days, name) => {
  const before = JSON.stringify(state.sessions);
  const { touched, sets } = mergeImported(days);
  save();
  syncNow();
  const did = [touched.length ? `Added from ${name}: ${touched.length} ${touched.length === 1 ? 'day' : 'days'}, ${sets} sets` : `Nothing new in ${name}, it was all in already`];
  showResult(did, touched.slice(-30).map((date) => ({ date, name: null })), touched.length ? before : null);
  return did;
};
const runFiles = async (files, note) => {
  const said = `${files.map((file) => `📎 ${file.name}`).join(' ')}${note ? `\n${note}` : ''}`;
  const pending = { date: todayIso(), label: 'your training', text: said };
  view.pending.push(pending);
  render();
  closeTray();
  const progress = (index, total, text) => {
    pending.progress = text || (total > 1 ? `Reading part ${index + 1} of ${total}…` : 'Reading the file…');
    render();
  };
  const did = [];
  const guessed = [];
  try {
    for (const file of files) {
      progress(0, 1);
      if (!file.text.trim()) {
        did.push(`Not logged: ${file.name} is empty. Export it again from your app and add the new file.`);
        continue;
      }
      let rows = tableRows(file.text);
      // One "row" from a file with several lines is not a table (a note starting with a quote mark reads like one).
      if (rows && rows.length < 2 && file.text.trim().split('\n').filter((line) => line.trim()).length > 2) rows = null;
      if (rows && rows.length < 2) {
        did.push(`Not logged: ${file.name} only has column names, no training rows. Export it again with your workouts in it.`);
        continue;
      }
      let days = rows && rows.length >= 2 ? tableDays(rows) : [];
      if (!days.length && rows && rows.length >= 3 && navigator.onLine) {
        progress(0, 1, 'Reading the columns…');
        const mapping = await askColumns(rows.slice(0, 15));
        if (mapping) days = tableDays(rows, mapping);
      }
      if (days.length) {
        did.push(...addImported(days, file.name));
        continue;
      }
      const preview = await aiPreview(file.text.trim(), note, progress);
      if (preview.days.length) guessed.push({ name: file.name, ...preview });
      else did.push(`Not logged: Couldn't find training in ${file.name}. If it's a program without dates, add a note like "from March 7, 3 days a week" and send it again.`);
    }
  } catch (error) {
    did.push(`Not logged: ${error.message}`);
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
  }
  if (guessed.length) {
    const days = guessed.flatMap((item) => item.days);
    view.importConfirm = { said, note, files: guessed, days, did };
  } else {
    if (did.some((line) => OFF_LINE.test(line)) && !did.some((line) => !OFF_LINE.test(line))) {
      view.files = files;
      view.draft = note;
    }
    addLog(said, did.length ? did : ['Nothing to add']);
  }
  render();
};
const answerImport = (yes) => {
  const ask = view.importConfirm;
  view.importConfirm = null;
  if (!ask) return;
  const did = [...ask.did];
  if (yes) for (const file of ask.files) did.push(...addImported(file.days, file.name));
  else did.push('Not added: you cancelled it');
  addLog(ask.said, did);
  closeTray();
};
const outlierText = () => {
  const held = view.outlierAsk;
  const one = held[0];
  const line = `${one.name} ${Number(one.set.kg)} × ${one.set.reps} on ${dayLabel(one.date)}`;
  return held.length === 1 ? `${line} looks far heavier than your other ${one.name} sets (around ${one.best} kg), so it was left out. Add it anyway?` : `${held.length} sets look far heavier than the rest, like ${line}, so they were left out. Add them anyway?`;
};
const answerOutliers = (yes) => {
  const held = view.outlierAsk || [];
  view.outlierAsk = null;
  if (!held.length) return;
  if (yes) {
    // Put back next to the rest of that day's sets (a merge would treat it as a new version of the file).
    for (const item of held) {
      let session = sessionFor(item.date);
      if (!session) {
        session = { date: item.date, exercises: [], cardio: 0 };
        state.sessions.push(session);
      }
      const exercise = session.exercises.find((other) => other.name.toLowerCase() === item.name.toLowerCase());
      if (exercise) exercise.sets.push({ ...item.set, imported: true });
      else session.exercises.push({ name: item.name, sets: [{ ...item.set, imported: true }] });
    }
    save();
    syncNow();
  }
  addLog(yes ? 'Add it anyway' : 'Leave it out', [yes ? `Added ${held.length === 1 ? 'the set' : `${held.length} sets`}: ${held.map((item) => `${item.name} ${Number(item.set.kg)} × ${item.set.reps}`).join(', ')}` : `Left out ${held.length === 1 ? 'the set' : `${held.length} sets`}: ${held.map((item) => `${item.name} ${Number(item.set.kg)} × ${item.set.reps}`).join(', ')}`], { manual: true });
};
const importConfirmText = () => {
  const ask = view.importConfirm;
  const first = ask.days[0].date;
  const last = ask.days.at(-1).date;
  const range = first === last ? dayLabel(first) : `${dayLabel(first)} – ${dayLabel(last)}`;
  return `Add ${ask.days.length} ${ask.days.length === 1 ? 'day' : 'days'} (${range}), ${countSets(ask.days)} sets from ${ask.files.map((file) => file.name).join(', ')}?`;
};

// One import at a time, with a bubble that says how far it got.
const runImport = async (text, said, onFail = () => {}) => {
  const pending = { date: todayIso(), label: 'your training', text: said };
  view.pending.push(pending);
  render();
  closeTray();
  try {
    const did = await importText(text, (index, total, note) => {
      pending.progress = note || (total > 1 ? `Reading part ${index + 1} of ${total}…` : '');
      render();
    });
    addLog(said.slice(0, 300), did);
  } catch (error) {
    onFail();
    openChat();
    addLog(said.slice(0, 300), [`Not logged: ${error.message}`]);
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    render();
  }
};

// Messages that couldn't reach the AI (busy, or no internet) wait here and are sent again by themselves:
// soon at first, then less often, for up to a day. The log shows them as "on it" until they land.
const LATER_WAIT = [15, 30, 60, 120, 300, 600, 900];
const queueLater = async ({ prompt, said, date, known = true, live = '', voice = null, heard = '', context = noteContext() }) => {
  const id = `later-${Date.now()}`;
  if (voice?.size) await keepVoice(id, voice);
  const at = Date.now();
  state.later = [...laterJobs(), { id, prompt, said, date, known, live, heard, context, voice: Boolean(voice?.size), at, tries: 0, next: at + LATER_WAIT[0] * 1000 }];
  addLog(said, ['Exodia is on it in the background. It lands by itself, keep going.'], { laterId: id, manual: true });
  save();
  render();
  setTimeout(runLater, LATER_WAIT[0] * 1000);
};
let laterRunning = false;
const runLater = async (force = false) => {
  if (laterRunning || !laterJobs().length || !navigator.onLine) return;
  laterRunning = true;
  try {
    for (const job of laterJobs().slice()) {
      if (!force && job.next > Date.now()) continue;
      let audio;
      if (job.voice) {
        const blob = await loadVoice(job.id);
        audio = blob ? await wavBase64(blob).catch(() => undefined) : undefined;
      }
      try {
        const result = await parseWithAi(job.prompt, audio, job.live, job.context || null);
        state.later = laterJobs().filter((item) => item.id !== job.id);
        state.log = (state.log || []).filter((entry) => entry.laterId !== job.id);
        const said = result.transcript || job.said;
        if (result.feedback && !/\b(feedback|feature)\b/i.test(`${job.prompt} ${result.transcript || ''}`)) delete result.feedback;
        const logsSomething = Boolean(result.exercises?.length || result.cardioMinutes || result.remove?.length || result.replace?.length || result.move?.length || result.accessoriesMinutes || result.label || result.note);
        try {
          if (result.feedback && !logsSomething) await routeFeedback(result.feedback, said);
          else if (result.remove?.length && job.voice) view.confirm = { result, date: job.date, said, heard: result.transcript || '', text: describeRemoval(result) };
          else applyResult(result, job.date, said, job.voice ? result.transcript || '' : '');
        } catch (error) {
          addLog(said, [`Not logged: ${error.message}`], error.engine ? { by: error.engine, raw: error.raw } : {});
        }
        if (job.voice) dropVoice(job.id);
      } catch (error) {
        job.tries += 1;
        const tooOld = Date.now() - job.at > 24 * 3600000;
        if (!error.later && !(error instanceof TypeError) || tooOld) {
          state.later = laterJobs().filter((item) => item.id !== job.id);
          const entry = (state.log || []).find((item) => item.laterId === job.id);
          if (entry) {
            delete entry.laterId;
            entry.did = [`Not logged: ${tooOld ? 'Exodia couldn\'t reach the AI for a day.' : error.message}${job.voice ? ' Your recording is saved, tap Try again.' : ''}`];
            if (job.voice) entry.voiceId = job.id;
          }
        } else job.next = Date.now() + LATER_WAIT[Math.min(job.tries, LATER_WAIT.length - 1)] * 1000;
      }
      save();
      render();
    }
  } finally {
    laterRunning = false;
  }
  const next = Math.min(...laterJobs().map((job) => job.next));
  if (Number.isFinite(next)) setTimeout(runLater, Math.max(1000, next - Date.now()));
};
window.addEventListener('online', () => runLater(true));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) runLater();
});
setTimeout(() => runLater(true), 3000);
// A request that was still "Sending…" when the app closed never got its answer: show that, with Try again.
for (const run of state.claudeRuns || []) {
  if (run.status === 'sending' && Date.now() - run.at > 60000) Object.assign(run, { status: 'failed', error: 'The app closed before the answer came. Check Admin in a minute before trying again.' });
}

// A question back comes up where you'll see it, with the answer half written: the box holds everything that was
// caught with ___ where a number is missing (the first one selected, so you just type it), and when Exodia has a
// likely full reading it asks "Did you mean …?" so one tap on Yes logs it.
const askFor = (fill, guess) => {
  if (fill && /___/.test(fill)) {
    view.draft = fill;
    view.selectBlank = true;
  }
  view.askGuess = guess || null;
  view.focusDraft = true;
  view.promptFlash = Date.now();
};
// Meanwhile a stronger model takes a slower, closer look at the same note. If it works the note out before you've
// answered, it's logged and the question goes away; once you've answered (or asked something else), it's dropped.
const secondTry = ({ text, audio, live, heard, date, asked }) => {
  if (!text && !audio) return;
  parseWithAi(text, audio, live || '', { ...(heard ? { heard } : {}), strong: true }).then((result) => {
    const logs = Boolean(result.exercises?.length || result.cardioMinutes || result.accessoriesMinutes);
    if (!logs || result.unclear || view.asked !== asked) return;
    view.asked = null;
    view.askGuess = null;
    view.status = '';
    if (view.draft === asked.fill) view.draft = '';
    applyResult(result, result.date || date, result.transcript || heard || text, heard || '');
    view.toast = { kind: 'rep', title: 'Worked it out', text: describeAdd(result, result.date || date) };
    save();
    render();
  }).catch(() => {});
};
let nameWatch = null;
// Their own log, on this phone: joined, the start screen gone, and a "Welcome back, Romi".
const welcomeBack = async (key, name) => {
  if (view.onboard) Object.assign(view.onboard, { busy: true, status: 'Opening your log…' });
  render();
  if (await joinProfile(key)) {
    view.onboard = null;
    state.started = true;
    save();
    view.toast = { kind: 'rep', title: `Welcome back, ${state.name || name}`, text: 'Your log is here, the same as on your other phone.' };
    location.hash = '#/';
    return render();
  }
  if (view.onboard) Object.assign(view.onboard, { busy: false, status: 'Could not reach Exodia. Check your internet and try again.' });
  return render();
};
// Who has a name: { key } for someone's log, { taken } for one that can't be handed out, { free } otherwise.
// No connection counts as free, so starting never gets stuck.
const nameOwner = (name) => timedFetch('/api/name', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) }, 10000)
  .then((response) => (response.ok ? response.json() : { free: true }))
  .catch(() => ({ free: true }));
let sentContext = null;
const send = async () => {
  view.askGuess = null;
  // /admin from any box, and anything in the Admin page's box, goes to the builder before anything is awaited: the
  // request is on screen at once, and a recording that is still finishing goes along as a promise.
  const typed = view.draft.trim();
  const toAdmin = view.isAdmin && !view.files?.length && view.route !== 'admin' && /^\/admin(\s|$)/i.test(typed);
  if (toAdmin || (view.isAdmin && !view.files?.length && view.route === 'admin' && !/^\/(feedback|note)(\s|$)/i.test(typed))) {
    const rest = typed.replace(/^\/admin\s*/i, '');
    const voice = recording ? stopRecording() : view.voiceBlob;
    view.voiceBlob = null;
    view.live = '';
    view.draft = '';
    if (toAdmin) {
      if (location.hash !== '#/admin') location.hash = '#/admin';
      view.route = 'admin';
    }
    if (rest || voice) return sendToClaude(rest, voice);
    if (!desktopQuery.matches) document.activeElement?.blur();
    render();
    return;
  }
  const recorded = recording ? await stopRecording() : view.voiceBlob;
  view.voiceBlob = null;
  const live = (view.live || '').trim();
  view.live = '';
  const voice = recorded?.size > 4000 ? recorded : null;
  let text = [view.draft.trim(), voice ? '' : live].filter(Boolean).join(' ');
  // A file waiting in the box goes with whatever you typed or said: a voice note becomes the file's note.
  if (view.files?.length) {
    // Files import into your log, so they go from Home, where the result shows (Admin and Feedback have no chat).
    if (view.route === 'admin' || view.route === 'feedback') location.hash = '#/';
    const files = view.files;
    view.files = [];
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    let note = text;
    if (voice) {
      view.status = 'Listening to your note…';
      render();
      try {
        const response = await timedFetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio: await wavBase64(voice) }) });
        const body = await response.json().catch(() => ({}));
        if (response.ok && body.text) note = [text, body.text].filter(Boolean).join(' ');
      } catch {
        // no note from the recording; the file still goes in
      }
      view.status = '';
    }
    return runFiles(files, note);
  }
  if (!text && !voice?.size) {
    if (recorded) {
      openChat();
      addLog('Voice note', [`Not logged: no sound recorded (${Math.round(recorded.size / 1024)} KB)`]);
    }
    render();
    return;
  }
  // /help from any box opens Help.
  if (/^\/help(\s|$)/i.test(text) || /^help\??$/i.test(text)) {
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    closeTray();
    location.hash = '#/help';
    return;
  }
  // /feedback from any box, for anyone: the rest goes to Marcus as feedback.
  if (/^\/feedback(\s|$)/i.test(text)) {
    const rest = text.replace(/^\/feedback\s*/i, '');
    if (!rest && !voice) {
      view.draft = '';
      render();
      return;
    }
    return sendFeedback(rest, voice);
  }
  if (view.route === 'feedback') return sendFeedback(text, voice);
  // /note: the rest is a note for a session (the AI finds which), never sets.
  if (/^\/note(\s|$)/i.test(text)) {
    const rest = text.replace(/^\/note\s*/i, '');
    if (!rest && !voice) {
      view.draft = '';
      render();
      return;
    }
    const day = view.editContext?.date || (view.dayPicked ? view.composerDate : null);
    const target = day && sessionFor(day);
    if (target && rest && !voice) {
      const note = rest.trim().slice(0, 600);
      view.sentAt = Date.now();
      target.note = target.note ? `${target.note}\n${note}` : note;
      view.open.add(day);
      view.noteOpen = day;
      view.draft = '';
      save();
      const did = [`Note on ${dayLabel(day)}: ${note.length > 60 ? `${note.slice(0, 60)}…` : note}`];
      view.scrollTarget = day;
      view.focusLanded = '.dayNote';
      addLog(text, did, { by: 'phone' });
      if (!desktopQuery.matches) document.activeElement?.blur();
      render();
      return;
    }
    text = `Note: ${rest}`;
    if (view.route === 'admin') location.hash = '#/';
  }
  const date = view.editContext?.date || view.composerDate || todayIso();
  // One set changed in plain words ("change the last set of hammer curls to 15 kg"): done right here, no AI.
  const setEdit = !voice && !view.fixing ? localSetEdit(text, view.editContext?.date || guessDate(text, null)) : null;
  if (setEdit) {
    view.draft = '';
    view.status = '';
    view.sentAt = Date.now();
    if (!desktopQuery.matches) document.activeElement?.blur();
    applySetEdit(setEdit, text);
    render();
    return;
  }
  // Long text, or rows pasted from a spreadsheet (they come with tabs), is a history to import.
  if (!voice && (text.length > 600 || (/\t/.test(view.draft) && view.draft.trim().includes('\n'))) && !view.fixing && !view.editContext) {
    const pasted = view.draft;
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    const rows = pasted.trim().split('\n').length;
    return runImport(pasted.trim(), /\t/.test(pasted) ? `Pasted from a spreadsheet · ${rows} rows` : `${text.slice(0, 120)}${text.length > 120 ? '…' : ''}`, () => {
      view.draft = pasted;
    });
  }
  if (!voice && view.confirm && (YES.test(text) || NO.test(text))) {
    answerConfirm(YES.test(text));
    closeComposer();
    render();
    return;
  }
  const local = !view.fixing && !view.editContext && !voice && !DAY_WORDS.test(text) && !EDIT_WORDS.test(text) && !/rpe|@/i.test(text) ? parseLocally(text) : null;
  if (local) {
    const before = JSON.stringify(state.sessions);
    view.draft = '';
    view.status = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    view.sentAt = Date.now();
    land(local, date);
    showResult([describeAdd(local, date)], local.exercises.map(({ name }) => ({ date, name })), before);
    addLog(text, [describeAdd(local, date)], { raw: JSON.stringify(local).slice(0, 1500), by: 'phone' });
    showChat();
    if (view.route === 'home') view.sheetH = SHEET_PEEK;
    render();
    scrollChat();
    return;
  }
  if (!navigator.onLine && !view.fixing) {
    view.draft = '';
    view.status = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    await queueLater({ prompt: text, said: text || live || 'Voice note', date: guessDate(text || live, date), known: Boolean(guessDate(text || live, null) || view.dayPicked || view.editContext || view.editDay), live, voice });
    render();
    closeTray();
    return;
  }
  // The day is only certain when you picked it (a day's + Exercise, the day chips, editing a day) or named it ("yesterday");
  // otherwise what's on its way waits at the top, under no day, until the answer says where it goes.
  // The iPhone's live dictation is often wrong, so it's never shown: a voice note shows Whisper's words as soon as
  // they're back (a second or two), and only those.
  const named = guessDate(text, null);
  const known = Boolean(view.dayPicked || view.editContext || view.editDay || named);
  const pending = { date: named || date, known, label: text || 'your voice note', text: text || 'Voice note' };
  view.pending.push(pending);
  view.sentAt = Date.now();
  view.draft = '';
  view.status = '';
  view.scrollTarget = known ? pending.date : 'incoming';
  view.focusLanded = '.ghost';
  if (!desktopQuery.matches) document.activeElement?.blur();
  showChat();
  if (view.route === 'home') view.sheetH = SHEET_PEEK;
  render();
  scrollChat();
  let heard = '';
  let done = false;
  let audio;
  let early = '';
  try {
    audio = voice?.size ? await wavBase64(voice).catch(() => Promise.reject(new Error('Could not read the recording. Try again.'))) : undefined;
    const fixing = view.fixing;
    view.lastSaid = text;
    sentContext = noteContext();
    // Whisper first, on its own: your words show in the bubble and on the day right away, then go along to the AI.
    if (audio) {
      try {
        const response = await timedFetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) }) }, 20000);
        const body = await response.json().catch(() => ({}));
        if (response.ok && body.text) {
          early = body.text;
          pending.text = [text, early].filter(Boolean).join(' ');
          const when = guessDate(early, null);
          if (when && !pending.known) Object.assign(pending, { date: when, known: true });
          render();
          scrollChat();
        }
      } catch {
        // no words yet: the AI still gets the recording and hears it itself
      }
    }
    const result = await parseWithAi(fixing ? `Correct an earlier note. Earlier note: "${fixing.said}". It was logged as: ${fixing.did}. Corrected note: ${text ? `"${text}"` : 'in the audio'}. Change what was logged so it matches the corrected note: use replace for changed sets, remove for things that should not be there, move for a wrong day, and exercises only for things that were not logged at all before.` : text, audio, voice ? live : '', early ? { heard: early } : null);
    heard = result.transcript || '';
    const said = fixing ? `Fix: ${text}` : heard || text;
    // Feedback only when they say "feedback" or "feature"; everything else in this box is training.
    if (result.feedback && !/\b(feedback|feature)\b/i.test(`${text} ${result.transcript || ''}`)) delete result.feedback;
    const logsSomething = Boolean(result.exercises?.length || result.cardioMinutes || result.remove?.length || result.replace?.length || result.move?.length || result.accessoriesMinutes || result.label || result.note);
    if (result.feedback && !logsSomething) await routeFeedback(result.feedback, said);
    else if (view.confirm && (YES.test(said) || NO.test(said))) answerConfirm(YES.test(said));
    else if (result.remove?.length && voice) {
      view.confirm = { result, date, said, heard, text: describeRemoval(result) };
      view.scrollTarget = null;
    } else applyResult(result, date, said, voice ? heard : '');
    // A question about part of the note (missing reps): above the box where it's seen, and sent with the next note so
    // the answer completes it.
    if (result.unclear && logsSomething) {
      view.asked = { question: result.unclear, said, at: Date.now(), fill: result.fill || '' };
      view.status = result.unclear;
      askFor(result.fill, '');
    } else if (logsSomething) view.asked = null;
    if (result.feedback && logsSomething) routeFeedback(result.feedback, said).catch((error) => addLog(said, [`Feedback not sent: ${error.message}`]));
    if (view.editDay !== view.editContext?.date) view.editContext = null;
    view.fixing = null;
    if (view.retryVoice) dropVoice(view.retryVoice);
    view.retryVoice = null;
    done = !view.confirm && !result.unclear && !view.draft.trim() && !view.listening && view.pending.length === 1;
  } catch (error) {
    // A friend's note the AI has a question about: the question shows above the box with an example answer in it, nothing
    // is logged, and the note goes along with their answer.
    if (error.question && (text || heard) && !view.isAdmin && !view.sandbox && !view.fixing) {
      view.asked = { question: error.question, said: text || heard, at: Date.now(), fill: error.fill || '' };
      view.draft = '';
      view.status = error.question;
      openChat();
      view.sheetH = SHEET_PEEK;
      askFor(error.fill, error.guess);
      secondTry({ text, audio, live, heard: heard || early, date, asked: view.asked });
      return;
    }
    // Busy or offline: it waits and tries again by itself; nothing for the person to do.
    if (error.later && !view.fixing) {
      await queueLater({ prompt: text, said: text || heard || error.heard || live || 'Voice note', date: pending.date, known: pending.known, live, voice, heard: heard || error.heard || '', context: sentContext || noteContext() });
      return;
    }
    const spoken = heard || error.heard || '';
    const rescue = error.unclear && spoken && !view.fixing ? localSetEdit(spoken, view.editContext?.date || guessDate(spoken, null)) : null;
    if (rescue) {
      applySetEdit(rescue, spoken);
      return;
    }
    view.composerDate = date === todayIso() ? null : date;
    openChat();
    const voiceId = voice ? `voice-${Date.now()}` : null;
    if (voiceId) keepVoice(voiceId, voice);
    const words = text || heard || error.heard || live || 'Voice note';
    // A question back (nothing could be logged without it): above the box, with an example answer in the box, and the
    // note goes along with the answer so "10" is enough.
    if (error.question) {
      view.asked = { question: error.question, said: words, at: Date.now(), fill: error.fill || '' };
      view.status = error.question;
      askFor(error.fill, error.guess);
      secondTry({ text, audio, live, heard: heard || early || error.heard || '', date, asked: view.asked });
    } else if (!view.draft.trim() && words !== 'Voice note') view.draft = words;
    view.promptFlash = Date.now();
    view.focusDraft = true;
    const kept = voice && !error.unclear ? (words !== 'Voice note' ? ' Your words are saved, tap Try again.' : ' Your recording is saved, tap Try again.') : '';
    addLog(words, [`Not logged: ${error.message}${kept}`], { ...(voiceId ? { voiceId } : {}), ...(voice && !text && words !== 'Voice note' ? { heard: words } : {}), ...(error.engine ? { by: error.engine, raw: error.raw } : {}) });
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    if (done && !desktopQuery.matches) document.activeElement?.blur();
    if (view.composer && !view.showQuick) showChat();
    render();
    scrollChat();
  }
};

// Taps that change what's shown keep the thing you tapped under your finger: its place on screen is noted before the
// redraw and the page (or the panel it sits in) is shifted back by however much it moved.
const KEEP_STILL = new Set(['pick-trend', 'trend-more', 'cal-all', 'range', 'toggle-line', 'muscle-mode', 'web-now', 'level-info', 'pick-week', 'focus-lift', 'toggle-exodia', 'accessories', 'toggle-info', 'pick-point', 'toggle-session', 'home-more']);
const scrollerOf = (element) => {
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
};
const anchorOf = (target) => {
  const keys = ['action', 'name', 'date', 'index', 'mode', 'days', 'now', 'level', 'where', 'line'];
  const selector = keys.filter((key) => target.dataset[key] !== undefined).map((key) => `[data-${key}="${CSS.escape(target.dataset[key])}"]`).join('');
  return { selector, right: Boolean(target.closest('.right')), top: target.getBoundingClientRect().top };
};
// A "show more" button sits under what it opens, so keeping the button still would carry you to the bottom of
// everything it just opened (Show every year landed on 2021). Opening one keeps the top of that list still instead,
// so you read on from where you were; more days on Home simply appear under the ones you've seen.
const OPENS_ABOVE = { 'cal-all': '.calCard .calStats', 'trend-more': '.liftList', 'home-more': null };
const stillPoint = (action, target) => {
  const opening = (action === 'cal-all' && !view.calAll) || (action === 'trend-more' && !view.trendMore) || action === 'home-more';
  if (!opening || !(action in OPENS_ABOVE)) return anchorOf(target);
  const top = OPENS_ABOVE[action] && document.querySelector(OPENS_ABOVE[action]);
  return top ? { selector: OPENS_ABOVE[action], right: Boolean(top.closest('.right')), top: top.getBoundingClientRect().top } : null;
};
const keepAnchor = (anchor) => {
  const found = [...document.querySelectorAll(anchor.selector)].find((element) => Boolean(element.closest('.right')) === anchor.right);
  if (!found) return;
  const moved = found.getBoundingClientRect().top - anchor.top;
  if (Math.abs(moved) < 1) return;
  const scroller = scrollerOf(found);
  if (scroller) scroller.scrollTop += moved;
  else window.scrollBy(0, moved);
};
// An opened day glides to the middle of the screen (or, if it's taller than the screen, its top just under the bar).
// Your last own touch, scroll or key: a result that lands while you're doing something else never moves the page.
let lastUserAt = 0;
for (const type of ['pointerdown', 'wheel', 'touchmove', 'keydown']) document.addEventListener(type, () => { lastUserAt = Date.now(); }, { capture: true, passive: true });
const userBusy = () => Date.now() - lastUserAt < 1500 && lastUserAt > (view.sentAt || 0) + 400;
// What's on its way (the counting rows) and then what landed (the glowing lifts, or the day) is brought fully into
// view between the top bar or toast and the box. The open panel (and its dimming) folds to its peek first,
// unless you're typing in it. Anything taller than the room shows from its top.
const focusLanded = (date, selector = '.exercise.glow', again = true) => {
  const card = document.getElementById(`session-${date}`);
  if (!card || userBusy() || view.route !== 'home') return;
  if (again && view.composer && !sheetPeek() && !view.draft.trim()) {
    setSheet(SHEET_PEEK, true);
    setTimeout(() => focusLanded(date, selector, false), 320);
    return;
  }
  const parts = [...card.querySelectorAll(selector)];
  const boxes = (parts.length ? parts : [card]).map((element) => element.getBoundingClientRect());
  const target = { top: Math.min(...boxes.map((box) => box.top)), bottom: Math.max(...boxes.map((box) => box.bottom)) };
  const topBar = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0;
  const toast = document.querySelector('.toast')?.getBoundingClientRect().bottom || 0;
  const top = Math.max(topBar, toast, desktopQuery.matches ? 12 : 0) + 12;
  const dock = document.querySelector('.dock');
  const bottom = (dock ? dock.getBoundingClientRect().top : window.innerHeight) - 16;
  const need = target.bottom - target.top;
  const shift = need > bottom - top || target.top < top ? target.top - top : target.bottom > bottom ? target.bottom - bottom : 0;
  if (Math.abs(shift) < 4) return;
  const scroller = scrollerOf(card);
  (scroller || window).scrollBy({ top: shift, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
};
const centreDay = (date) => {
  const card = document.getElementById(`session-${date}`);
  if (!card) return;
  const box = card.getBoundingClientRect();
  const top = desktopQuery.matches ? 24 : 72;
  const room = window.innerHeight - top - 120;
  const shift = box.height < room ? box.top + box.height / 2 - (top + room / 2) : box.top - top;
  const scroller = scrollerOf(card);
  if (scroller) scroller.scrollBy({ top: shift, behavior: 'smooth' });
  else window.scrollBy({ top: shift, behavior: 'smooth' });
};

// Tapping a lift's name while typing keeps the keyboard up (the name goes into the box).
document.addEventListener('mousedown', (event) => {
  if (event.target.closest('[data-action="fill-name"]')) event.preventDefault();
});
// A tapped muscle lights up on the body and in the list, the rest fades back. Tap it again, or anywhere else, to clear.
function pickMuscle(key) {
  view.musclePick = key;
  for (const box of document.querySelectorAll('.muscles')) box.classList.toggle('picking', Boolean(key));
  for (const item of document.querySelectorAll('[data-action="pick-muscle"]')) item.classList.toggle('picked', item.dataset.muscle === key);
}

document.addEventListener('click', (event) => {
  if (view.musclePick && !event.target.closest('[data-action="pick-muscle"]')) pickMuscle(null);
  // The touch outside that closed "What's new" (see pointerdown below) does nothing else.
  if (Date.now() - (view.updatedClosedAt || 0) < 700 && !event.target.closest('.updatedPill')) return;
  if (view.editDay && !event.target.closest(`#session-${view.editDay}`) && !event.target.closest('.dock')) {
    if (view.editContext?.date === view.editDay) view.editContext = null;
    view.editDay = null;
    if (!event.target.closest('[data-action]')) {
      render();
      return;
    }
  }
  const insideDock = Boolean(event.target.closest('.dock'));
  if (view.composer && !insideDock && !event.target.closest('[data-action]')) {
    closeTray();
    return;
  }
  if (view.composer && !insideDock) view.composer = false;
  if (insideDock && !event.target.closest('[data-action]') && !view.composer) {
    view.composer = true;
    view.sheetH = SHEET_SMALL;
    if (!view.composerDate) view.composerDate = todayIso();
    syncDock();
    document.getElementById('draft')?.focus();
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  noteUse('tap', action);
  if (action === 'toggle-note') {
    view.noteOpen = view.noteOpen === target.dataset.date ? null : target.dataset.date;
    render();
    return;
  }
  // + Note: the box opens with /note, on this day ("Editing … · day"), so the note lands right here.
  if (action === 'add-note') {
    const day = target.dataset.date;
    const session = sessionFor(day);
    openChat();
    view.composerDate = day;
    view.dayPicked = true;
    if (session) view.editContext = { date: day, names: session.exercises.map((exercise) => exercise.name), label: dayKind(session) };
    if (!/^\/note(\s|$)/i.test(view.draft)) view.draft = `/note ${view.draft.trim()}`.trimEnd() + ' ';
    view.focusDraft = true;
    view.sheetH = SHEET_PEEK;
    view.open.add(day);
    render();
    return;
  }
  if (action === 'dash-filter') {
    view.dashFilter = target.dataset.filter;
    render();
    return;
  }
  if (action === 'admin-tab') {
    view.adminTab = target.dataset.tab;
    try { localStorage.setItem('exodia.adminTab', view.adminTab); } catch { /* private mode */ }
    render();
    scrollPage(view.adminTab === 'chat' ? scroller().scrollHeight : 0);
    return;
  }
  if (action === 'admin-dash') {
    view.adminDashOpen = !view.adminDashOpen;
    render();
    return;
  }
  const date = target.dataset.date;
  const session = date ? sessionFor(date) : null;
  const anchor = KEEP_STILL.has(action) ? stillPoint(action, target) : null;
  if (action === 'import') return;
  // A day in the calendar opens right under it: a logged day as its full card (sets, edit), a gym visit as a small
  // card with the gym, time and how long. Tap it again (or the ×) to close it.
  if (action === 'visit-day') {
    view.visitOpen = view.visitOpen === target.dataset.date ? null : target.dataset.date;
    render();
    // Fully in view, above the box at the bottom (scrollIntoView doesn't know about the box).
    requestAnimationFrame(() => {
      const card = document.querySelector('.visitCard, .calDayCard');
      if (!card) return;
      const box = card.getBoundingClientRect();
      const floor = (document.querySelector('.dock')?.getBoundingClientRect().top || window.innerHeight) - 16;
      // Its bottom comes into view, but never so far that its own top (the date) goes under the bar.
      const shift = box.bottom > floor ? Math.min(box.bottom - floor, box.top - 110) : 0;
      if (shift > 0) (scrollerOf(card) || window).scrollBy({ top: shift, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
    return;
  }
  if (action === 'visit-close') {
    view.visitOpen = null;
    render();
    return;
  }
  if (action === 'visit-add') {
    const date = target.dataset.date;
    view.visitOpen = null;
    openChat();
    view.composerDate = date;
    view.dayPicked = true;
    view.sheetH = SHEET_PEEK;
    view.focusDraft = true;
    render();
    return;
  }
  if (action === 'pick-file') {
    filePicker.click();
    return;
  }
  if (action === 'onboard-mic' && view.onboard) return startOnboardMic();
  if (action === 'onboard-stop' && view.onboard) return stopOnboardMic();
  if (action === 'onboard-unfile' && view.onboard) {
    view.onboard.file = null;
    render();
    return;
  }
  if (action === 'link-own' && view.linkOffer) {
    view.linkOffer = null;
    history.replaceState(null, '', `/${location.hash}`);
    pointManifest();
    render();
    return;
  }
  if (action === 'link-open' && view.linkOffer) {
    const { key } = view.linkOffer;
    view.linkOffer = null;
    render();
    joinProfile(key).then(render);
    return;
  }
  if (action === 'start-fresh') return startFresh();
  if (action === 'split-pick' && view.splitAsk) return pickSplit(target.dataset.name);
  if (action === 'slash-admin') {
    const box = document.getElementById('draft');
    view.draft = `${target.dataset.cmd || '/admin'} `;
    if (box) {
      box.value = view.draft;
      fitDraft(box);
      box.focus();
      box.setSelectionRange(view.draft.length, view.draft.length);
    }
    paintSlash();
    return;
  }
  if (action === 'toggle-left') {
    view.leftOpen = !view.leftOpen;
    render();
    return;
  }
  if (action === 'left-item') {
    const index = /^f/.test(target.dataset.index) ? target.dataset.index : Number(target.dataset.index);
    view.leftItem = view.leftItem === index ? null : index;
    render();
    return;
  }
  if (action === 'left-reply') {
    const item = leftItems()[Number(target.dataset.index)];
    if (!item) return;
    // The item shows up in the chat, then your reply goes to Claude together with it.
    view.replyTo = { title: item.title.replace(/^Decide:\s*/i, ''), why: item.why };
    addLog(`Exodia asked: ${view.replyTo.title}. ${item.why}`, ['Reply below with your follow-up.'], { manual: true });
    view.leftOpen = false;
    view.leftItem = null;
    view.draft = '';
    view.focusDraft = true;
    // The box opens with "Replying to …" in it, so it's clear what the words go with.
    view.composer = true;
    view.sheetH = SHEET_SMALL;
    if (location.hash !== '#/admin') location.hash = '#/admin';
    view.route = 'admin';
    render();
    return;
  }
  if (action === 'left-answer') {
    const item = leftItems()[Number(target.dataset.index)];
    if (!item) return;
    const answer = target.dataset.answer === 'yes' ? 'Yes' : 'No';
    askClaude(`Marcus decided: ${answer} to "${item.title.replace(/^Decide:\s*/i, '')}" (${item.why}). Do what that answer means, and update public/TODO.md: take this item off "Waiting on Marcus".`)
      .then(() => {
        try {
          localStorage.setItem('exodia.answered', JSON.stringify({ ...answeredLeft(), [item.title]: Date.now() }));
        } catch {
          // storage blocked: the item stays until TODO.md drops it
        }
        view.leftItem = null;
        render();
      })
      .catch((error) => note('Answer not sent', error.message));
    return;
  }
  if (action === 'onboard-demo') return startDemo();
  // Two taps, so a tap that lands on the pill by mistake never throws the example away.
  if (action === 'end-demo') {
    if (!view.endDemoAsk) {
      view.endDemoAsk = true;
      setTimeout(() => {
        view.endDemoAsk = false;
        render();
      }, 4000);
      return render();
    }
    view.endDemoAsk = false;
    return endDemo();
  }
  if (action === 'reload-app') return reloadInPlace();
  if (action === 'toggle-updated' && Date.now() - (view.updatedSwiped || 0) < 400) return;
  if (action === 'toggle-updated') {
    if (view.updateReady && !view.updated) {
      try { sessionStorage.setItem(NOTES_KEY, '1'); } catch { /* opens closed instead */ }
      return reloadInPlace();
    }
    // Closed: a tap opens every change. Open: a tap on the top row closes it and it goes.
    if (view.updated?.open) return toggleUpdated(false, hideUpdated);
    return toggleUpdated(true);
  }
  if ((action === 'onboard-start' || action === 'onboard-blank') && view.onboard) {
    const name = view.onboard.name.trim();
    // A name someone already has opens their log: same person, new phone, deleted app or a fresh link.
    if (name && !view.onboard.nameChecked) {
      view.onboard.busy = true;
      view.onboard.status = 'Checking your name…';
      render();
      nameOwner(name).then(async (owner) => {
        view.onboard.busy = false;
        view.onboard.status = '';
        if (owner.taken) {
          view.onboard.status = `${name} is taken. Use another name, or open your own link.`;
          return render();
        }
        if (owner.key) return welcomeBack(owner.key, name);
        view.onboard.nameChecked = true;
        render();
        document.querySelector(`[data-action="${action}"]`)?.click();
      });
      return;
    }
    if (name) state.name = name.slice(0, 40);
    state.started = true;
    save();
    // A file and typed notes are read on their own: a table is read on the phone, notes go to the AI.
    const parts = action === 'onboard-blank' ? [] : [view.onboard.file?.text, view.onboard.data.trim()].filter((part) => part?.trim());
    if (!parts.length) {
      view.onboard = null;
      render();
      return;
    }
    view.onboard.busy = true;
    view.onboard.status = '';
    render();
    parts.reduce((done, part) => done.then(() => importText(part, (index, total, note) => {
      view.onboard.status = note || (total > 1 ? `Reading part ${index + 1} of ${total}…` : '');
      render();
    })), Promise.resolve())
      .then(() => {
        view.onboard = null;
      })
      .catch((error) => {
        view.onboard.busy = false;
        view.onboard.status = `${error.message} Your text is still here.`;
      })
      .finally(render);
    return;
  }
  if (action === 'copy-ai') {
    navigator.clipboard.writeText(aiInstructions()).then(() => {
      view.copiedAi = true;
      render();
      setTimeout(() => {
        view.copiedAi = false;
        render();
      }, 1600);
    });
    return;
  }
  if (action === 'feedback-claude') {
    const item = view.adminFeedback?.find((entry) => entry.id === Number(target.dataset.id));
    if (!item) return;
    askClaude(`${item.kind === 'bug' ? 'Fix this bug' : 'Build this idea'} from Exodia feedback: ${item.title}. ${item.details}`)
      .then(() => {
        item.status = 'planned';
        fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ id: item.id, status: 'planned' }) });
      })
      .catch(() => {});
    return;
  }
  if (action === 'admin-reload') {
    view.adminRows = null;
    view.adminError = '';
    render();
    return;
  }
  // Tap a muscle (on the body or in the list): it lights up in both, the rest fades back. Tap it again to clear.
  if (action === 'feature-launch') {
    const launch = target.dataset.launch === '1';
    fetch('/api/features', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ name: target.dataset.name, launch }) })
      .then((response) => response.json())
      .then((data) => {
        if (data.beta) view.beta = data.beta;
        view.launched = data.launched || view.launched;
        render();
      })
      .catch(() => {});
    return;
  }
  if (['friend-ask', 'friend-accept', 'friend-decline', 'friend-cancel', 'friend-remove', 'friend-share', 'friend-hide'].includes(action)) {
    if (target.disabled) return;
    const step = { 'friend-ask': 'ask', 'friend-accept': 'accept', 'friend-decline': 'decline', 'friend-cancel': 'decline', 'friend-remove': 'remove', 'friend-share': 'sharing', 'friend-hide': 'hide' }[action];
    if (step === 'hide') {
      if (view.everyone) view.everyone = view.everyone.filter((row) => row.handle !== target.dataset.handle);
      if (view.friendSearch?.people) view.friendSearch.people = view.friendSearch.people.filter((row) => row.handle !== target.dataset.handle);
    }
    const body = { action: step, handle: target.dataset.handle };
    if (step === 'sharing') {
      const key = target.dataset.key;
      const on = !view.social?.me?.shares?.[key];
      body.settings = { [key]: on };
      if (view.social?.me) view.social.me.shares = { ...view.social.me.shares, [key]: on };
    }
    // Shown at once; the server's answer replaces it.
    for (const row of [...(view.friendSearch?.people || []), ...(view.everyone || [])]) if (row.handle === target.dataset.handle) row.status = step === 'ask' ? (row.status === 'asks' ? 'friends' : 'asked') : step === 'accept' ? 'friends' : 'none';
    target.disabled = true;
    view.friendNote = '';
    render();
    socialPost('/api/friends', body)
      .then(({ ok, data }) => {
        if (ok) keepSocial(data);
        else view.friendNote = data?.error === 'Not found' ? 'That person is not findable any more.' : data?.error || 'Exodia could not do that. Try again.';
        if (view.together) syncTogether();
      })
      .catch(() => {
        view.friendNote = "You're offline. Nothing changed, try again when you're back.";
        loadSocial();
      })
      .finally(render);
    return;
  }
  if (action === 'together-with') {
    view.togetherWith = target.dataset.handle;
    startTogether(target.dataset.handle);
    return;
  }
  if (action === 'together-person') {
    const together = view.together;
    const handle = target.dataset.handle;
    const adding = !together.people.has(handle);
    if (adding) together.people.add(handle);
    else together.people.delete(handle);
    together.conflict = null;
    render();
    togetherSend({ action: adding ? 'add' : 'remove', handle });
    return;
  }
  if (action === 'together-kind') {
    const together = view.together;
    const kind = target.dataset.kind;
    const plan = togetherPlan();
    together.conflict = null;
    if (plan && plan.kind !== kind) {
      // Someone else picked it: ask first. Your own plan just changes.
      if (plan.by !== 'me') together.conflict = { plan, wanted: kind };
      else {
        together.kind = kind;
        togetherSend({ action: 'kind', kind, version: plan.version });
      }
    } else together.kind = kind;
    render();
    return;
  }
  if (action === 'together-confirm') {
    const together = view.together;
    const plan = togetherPlan() || together.conflict?.plan;
    together.kind = target.dataset.kind;
    together.conflict = null;
    render();
    if (plan) togetherSend({ action: 'kind', kind: target.dataset.kind, version: plan.version, confirm: true });
    return;
  }
  if (action === 'together-keep') {
    const together = view.together;
    together.kind = together.conflict?.plan.kind || together.kind;
    together.conflict = null;
    render();
    return;
  }
  if (action === 'toast-go') {
    const date = view.toast?.go;
    view.toast = null;
    startTogether();
    if (date) view.together.date = date;
    syncTogether();
    // Opening Train together normally starts on today; this one opens on the planned day.
    view.togetherWith = true;
    location.hash = '#/together';
    render();
    return;
  }
  if (action === 'together-leave') {
    view.together.people = new Set();
    view.together.kind = null;
    render();
    togetherSend({ action: 'leave' });
    return;
  }
  if (action === 'together-date') {
    const together = view.together;
    if (together.date === target.dataset.date) return;
    const plan = togetherPlan();
    together.date = target.dataset.date;
    together.conflict = null;
    together.note = '';
    view.visitOpen = null;
    const there = togetherPlan();
    // Your plan moves with the day you pick; a day that already has a plan just opens it.
    if (plan && !there) {
      together.kind = plan.kind;
      togetherSend({ action: 'move', date: plan.date, to: together.date });
    } else {
      together.people = new Set();
      together.kind = null;
      syncTogether();
    }
    render();
    return;
  }
  if (action === 'pick-muscle') {
    const key = target.dataset.muscle;
    pickMuscle(view.musclePick === key ? null : key);
    return;
  }
  if (action === 'muscle-mode') {
    if (view.muscleMode === target.dataset.mode) return;
    view.muscleMode = target.dataset.mode;
    // The knob slides over first, then the body recolours.
    const segment = target.closest('.segment');
    segment?.querySelector('.segmentKnob')?.classList.toggle('on', view.muscleMode === 'recovery');
    segment?.querySelectorAll('.segmentOption').forEach((option) => option.setAttribute('aria-pressed', String(option === target)));
    try {
      localStorage.setItem('exodia.muscleMode', view.muscleMode);
    } catch {
      // not remembered: fine
    }
    const anchor = anchorOf(target);
    return setTimeout(() => {
      render();
      keepAnchor(anchor);
    }, 230);
  }
  if (action === 'level-info') {
    view.levelInfo = !view.levelInfo;
    return render();
  }
  if (action === 'body-sex') {
    view.bodySex = target.dataset.sex;
    document.querySelectorAll('[data-action="body-sex"]').forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.sex === target.dataset.sex)));
    return;
  }
  if (action === 'body-edit') {
    view.bodyEdit = true;
    return render();
  }
  if (action === 'body-save') {
    const kg = Number(String(target.closest('.bodyForm')?.querySelector('.bodyKg')?.value || '').replace(',', '.'));
    const sex = view.bodySex || state.body?.sex;
    if (!(kg >= 30 && kg <= 250) || !sex) {
      view.bodyError = !(kg >= 30 && kg <= 250) ? 'Type your bodyweight in kg, like 85.' : 'Pick Male or Female.';
      return render();
    }
    state.body = { kg: Math.round(kg * 10) / 10, sex };
    view.bodyEdit = false;
    view.bodyError = '';
    save();
    syncNow();
    return render();
  }
  if (action === 'claude-retry') {
    const run = (state.claudeRuns || []).find((entry) => String(entry.at) === target.dataset.at);
    if (run && run.status === 'failed' && run.said && !/^Voice note/.test(run.said)) askClaude(run.said, run).catch(() => {});
    return;
  }
  if (action === 'feedback-status') {
    const item = view.adminFeedback?.find((entry) => entry.id === Number(target.dataset.id));
    if (!item) return;
    item.status = target.dataset.status;
    render();
    fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ id: item.id, status: item.status }) });
    return;
  }
  if (action === 'toggle-toast' && view.toast) {
    view.toast.open = !view.toast.open;
    view.toast.pinned = view.toast.open;
    target.closest('.toast').classList.toggle('open', view.toast.open);
    target.setAttribute('aria-expanded', String(view.toast.open));
    clearTimeout(view.toastTimer);
    if (!view.toast.open) view.toastTimer = setTimeout(clearToast, 4000);
    return;
  }
  if (action === 'dismiss-toast') {
    view.toast = null;
  } else if (action === 'undo-change') {
    view.menu = false;
    undoStep();
  } else if (action === 'redo-change') {
    view.menu = false;
    redoStep();
  } else if (action === 'delete-set' && session) {
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const set = exercise.sets[Number(target.dataset.set)];
    // A row can stand for several identical sets ("3× 30 × 10"); deleting the row deletes all of them.
    const count = Number(target.dataset.count) || 1;
    changeWithUndo(`Deleted ${exercise.name} ${count > 1 ? `${count}× ` : ''}${set.kg} × ${set.reps} on ${dayLabel(date)}`, () => {
      exercise.sets.splice(Number(target.dataset.set), count);
      if (exercise.sets.length === 0) session.exercises.splice(Number(target.dataset.exercise), 1);
    }, 'Delete set');
  } else if (action === 'delete-exercise' && session) {
    changeWithUndo(`Deleted ${session.exercises[Number(target.dataset.exercise)].name} on ${dayLabel(date)}`, () => session.exercises.splice(Number(target.dataset.exercise), 1), 'Delete exercise');
  } else if (action === 'delete-day' && session) {
    view.editDay = null;
    changeWithUndo(`Deleted ${dayLabel(date)}`, () => {
      session.exercises = [];
      session.cardio = 0;
    }, 'Delete day');
  } else if (action === 'edit-day') {
    view.editDay = view.editDay === date ? null : date;
    view.menuEnter = Boolean(view.editDay);
    view.fixing = null;
    if (view.editDay && session) view.editContext = { date, names: session.exercises.map((exercise) => exercise.name), label: dayKind(session) };
    else if (view.editContext?.date === date) view.editContext = null;
  } else if (action === 'log-day') {
    view.logDate = date;
    view.editDay = null;
    if (session) view.editContext = { date, names: session.exercises.map((exercise) => exercise.name), label: dayKind(session) };
    location.hash = '#/log';
    return;
  } else if (action === 'log-lift') {
    view.logLift = target.dataset.name;
    view.logDate = null;
    location.hash = '#/log';
    return;
  } else if (action === 'log-all') {
    view.logDate = null;
    view.logLift = null;
  } else if (action === 'move-day' && session) {
    const to = target.dataset.to;
    view.editDay = null;
    changeWithUndo(`Moved ${dayLabel(date)} to ${dayLabel(to)}`, () => moveSession(session, to), `Move to ${dayLabel(to)}`);
    glowFor([{ date: to, name: null }]);
    view.open.add(to);
    view.scrollTarget = to;
  }
  if (action === 'dev-menu') view.devMenu = !view.devMenu;
  else if (action === 'close-dev') view.devMenu = false;
  else if (action === 'dev-exodia') {
    view.leftOpen = false;
    view.exodiaStyle = target.dataset.style;
    view.devMenu = false;
    view.devHit = true;
    view.wasHit = false;
    if (view.route !== 'home') location.hash = '#/';
    scrollPage(0);
  } else if (action === 'dev-normal') {
    view.leftOpen = false;
    view.devMenu = false;
    view.devHit = false;
    view.celebrating = false;
    document.querySelectorAll('.exodiaShow').forEach((show) => show.click());
    document.documentElement.classList.remove('exodiaBlue');
  } else if (action === 'dev-newuser') return enterSandbox();
  else if (action === 'dev-exit') return exitSandbox();
  else if (action === 'open-menu') view.menu = true;
  else if (action === 'close-menu') view.menu = false;
  else if (action === 'open-composer') {
    view.trayEnter = !view.composer;
    view.composer = true;
    view.composerDate = target.dataset.date || todayIso();
    view.dayPicked = Boolean(target.dataset.date);
    view.focusDraft = true;
  } else if (action === 'composer-day') {
    view.composerDate = date;
    view.dayPicked = true;
    view.focusDraft = true;
  }
  else if (action === 'toggle-exodia') {
    view.exodiaOpen = !view.exodiaOpen;
    view.rulesEnter = view.exodiaOpen;
  }
  else if (action === 'toggle-info') view.info = !view.info;
  else if (action === 'web-now') view.webNow = target.dataset.now === '1';
  else if (action === 'level-info') {
    const level = Number(target.dataset.level);
    const where = target.dataset.where;
    const wasOpen = view.levelInfo?.where === where;
    view.levelInfo = wasOpen && (view.levelInfo.level === level || !level) ? null : { where, level };
    view.levelInfoEnter = Boolean(view.levelInfo) && !wasOpen;
  }
  else if (action === 'confirm-yes') answerConfirm(true);
  else if (action === 'guess-yes' && view.askGuess) {
    view.draft = view.askGuess;
    view.askGuess = null;
    view.asked = null;
    view.status = '';
    send();
    return;
  } else if (action === 'guess-no') {
    view.askGuess = null;
    view.focusDraft = true;
    view.selectBlank = true;
  }
  else if (action === 'import-yes') answerImport(true);
  else if (action === 'outlier-yes') answerOutliers(true);
  else if (action === 'outlier-no') answerOutliers(false);
  else if (action === 'import-no') answerImport(false);
  else if (action === 'clear-reply') view.replyTo = null;
  else if (action === 'unfile') view.files = (view.files || []).filter((file, index) => index !== Number(target.dataset.index));
  else if (action === 'retry-said') {
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
    if (view.draft.trim() && view.draft !== entry.said) {
      view.status = 'Send or clear what you are typing first.';
      render();
      return;
    }
    view.replacing = entry.at;
    view.draft = entry.said;
    return send();
  }
  else if (action === 'said-builder') {
    // The same builder that changes the app fixes the log: it reads what was said and writes it into the database.
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
    askClaude(`Data fix, not an app change. Marcus said this in the app and it didn't go through: "${entry.said}" (on ${new Date(entry.at).toISOString().slice(0, 10)}, the app replied: ${entry.did.join(' ')}). Make his log match what he meant, in D1 with wrangler: find his profile with SELECT id FROM profiles WHERE json_extract(meta,'$.name')='Marcus'; read the days involved first; then bump profiles.seq by one and write each changed day with updated = now in ms and seq = the new profiles.seq (a removed day has data NULL). Keep sets he didn't mention. Never put his data in the repo. Reply with exactly what changed. If it's not clear what he meant, change nothing and say what you need.`).catch(() => {});
    return;
  }
  else if (action === 'said-feedback') {
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
    view.replacing = entry.at;
    return routeFeedback(entry.said, entry.said).catch((error) => addLog(entry.said, [`Feedback not sent: ${error.message}`])).finally(render);
  }
  else if (action === 'retry-voice') {
    const voiceId = target.dataset.voice;
    return loadVoice(voiceId).then((blob) => {
      if (!blob) {
        view.status = 'That recording is on another device, or was already sent.';
        render();
        return;
      }
      view.voiceBlob = blob;
      view.retryVoice = voiceId;
      view.replacing = state.log?.find((entry) => entry.voiceId === voiceId)?.at ?? null;
      return send();
    });
  }
  else if (action === 'edit-added' && view.toast?.edit) {
    view.editContext = view.toast.edit;
    view.composerDate = view.toast.edit.date;
    view.focusDraft = desktopQuery.matches;
    view.toast = null;
  } else if (action === 'clear-day') {
    view.composerDate = todayIso();
  } else if (action === 'clear-edit') {
    if (view.editContext && view.editContext.date === view.editDay) view.editDay = null;
    view.editContext = null;
    view.fixing = null;
    view.replacing = null;
  }
  else if (action === 'edit-said') {
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
    const failed = OFF_LINE.test(entry.did[0] || '');
    if (failed && entry.voiceId && entry.said === 'Voice note') {
      target.closest('.chatItem').querySelector('[data-action="retry-voice"]')?.click();
      return;
    }
    if (view.draft.trim() && view.draft !== entry.said) {
      view.status = 'Send or clear what you are typing first.';
      render();
      return;
    }
    view.fixing = failed ? null : { said: entry.said, did: entry.did.join('; ') };
    view.replacing = failed ? entry.at : null;
    view.editContext = null;
    view.draft = entry.said === 'Voice note' ? '' : entry.said;
    openChat();
    view.focusDraft = true;
    view.selectDraft = true;
  }
  else if (action === 'close-chat') {
    closeTray();
    return;
  } else if (action === 'sheet-toggle') {
    if (Date.now() - (view.sheetDragged || 0) < 400) return;
    setSheet(sheetFull() ? SHEET_SMALL : Math.round(preferredSheet()), true);
    return;
  } else if (action === 'sheet-size') {
    setSheet(sheetFull() ? SHEET_SMALL : Math.round(preferredSheet()), true);
    return;
  }
  else if (action === 'confirm-no') answerConfirm(false);
  else if (action === 'pick-point') view.chartPick = view.chartPick === date ? null : date;
  else if (action === 'toggle-line') view.lines = { lift: view.lines?.lift !== false, est: view.lines?.est !== false, [target.dataset.line]: view.lines?.[target.dataset.line] === false };
  else if (action === 'toggle-session') {
    if (view.open.has(date)) view.open.delete(date);
    else {
      view.open.add(date);
      view.opening = date;
    }
  }
  else if (action === 'focus-lift') view.focusLift = target.dataset.name;
  else if (action === 'pick-week') view.volumeWeek = Number(target.dataset.index);
  else if (action === 'open-trend') {
    view.trendOpen = target.dataset.name;
    view.trendScroll = target.dataset.name;
    view.menu = false;
    if (view.route !== 'trends') {
      location.hash = '#/trends';
      return;
    }
  } else if (action === 'show-exodia') {
    view.exodiaOpen = true;
    view.menu = false;
    if (view.route !== 'home') {
      location.hash = '#/';
      return;
    }
  } else if (action === 'prefill') {
    if (view.draft.trim() && view.draft !== target.dataset.text) {
      view.status = 'Send or clear what you are typing first.';
      render();
      return;
    }
    view.composer = true;
    view.composerDate = todayIso();
    view.draft = target.dataset.text;
    view.status = '';
    view.focusDraft = true;
  } else if (action === 'pick-builder') {
    view.adminBuilder = Number(target.dataset.slot);
    fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ builder: view.adminBuilder }) }).catch(() => {});
  } else if (action === 'jump-session') {
    view.open.add(date);
    view.menu = false;
    view.scrollTarget = date;
    // Home draws the newest days first; an older day asks it to draw down to that day.
    const index = sortedSessions().filter((item) => item.exercises.length > 0 || item.cardio > 0).findIndex((item) => item.date === date);
    if (index >= 0) view.homeCount = Math.max(view.homeCount || HOME_PAGE, index + 5);
    if (view.route !== 'home') {
      location.hash = '#/';
      return;
    }
  } else if (action === 'toggle-trend') view.trendOpen = view.trendOpen === target.dataset.name ? '' : target.dataset.name;
  else if (action === 'pick-trend') view.trendOpen = target.dataset.name;
  else if (action === 'trend-more') view.trendMore = !view.trendMore;
  else if (action === 'home-more') view.homeCount = (view.homeCount || HOME_PAGE) + 60;
  else if (action === 'cal-all') {
    view.calAll = !view.calAll;
    view.calEnter = view.calAll;
  }
  else if (action === 'range') view.range = Number(target.dataset.days);
  else if (action === 'accessories' && session) {
    session.accessories = accessoriesOf(session) === Number(target.dataset.minutes) ? 0 : Number(target.dataset.minutes);
    addLog(`Accessories ${target.textContent.trim()}`, [session.accessories ? `Accessories ${session.accessories} min on ${dayLabel(date)}` : `No accessories on ${dayLabel(date)}`], { manual: true, merge: `acc:${date}` });
  } else if (action === 'add-set' && session) {
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const last = exercise.sets.at(-1) || { kg: '', reps: '' };
    changeWithUndo(`Added a ${exercise.name} set on ${dayLabel(date)}`, () => exercise.sets.push({ kg: last.kg, reps: last.reps, edited: true }), 'Add set');
    if (last.kg === '') view.focusSet = { date, name: exercise.name };
  } else if (action === 'remove-cardio' && session) {
    const parts = cardioParts(session);
    const index = target.dataset.index === undefined ? -1 : Number(target.dataset.index);
    const gone = parts[index]?.name || 'cardio';
    changeWithUndo(`Removed ${gone === 'Cardio' ? 'cardio' : gone} on ${dayLabel(date)}`, () => setCardioParts(session, index >= 0 ? parts.filter((part, at) => at !== index) : []), 'Remove cardio');
  } else if (action === 'quick-all') {
    view.quickAll = !view.quickAll;
    const body = document.querySelector('.sheetBody');
    if (body) {
      body.innerHTML = sheetBody();
      // Showing every lift brings Quick add's top into view; showing fewer goes back to the bottom.
      const quick = body.querySelector('.quickAdd');
      body.scrollTop = view.quickAll && quick ? quick.offsetTop - body.offsetTop - 8 : restingScroll(body);
    } else render();
    return;
  } else if (action === 'hide-quick') {
    view.showQuick = false;
    view.quickHidden = true;
    render();
    return;
  } else if (action === 'open-quick') {
    // Opens calm, like tapping the box: the latest message, then Import and the first lifts; the arrow shows them all.
    openChat();
    view.sheetH = SHEET_SMALL;
    view.showQuick = true;
    view.quickHidden = false;
    if (!desktopQuery.matches) document.activeElement?.blur();
    render();
    scrollChat();
    calloutQuick();
    return;
  } else if (action === 'fill-name') {
    // The lift's name goes in the box with a space after it, so you just keep writing ("… 30 3x10").
    view.draft = `${target.dataset.name} `;
    view.focusDraft = true;
    render();
    const draft = document.getElementById('draft');
    draft?.focus();
    draft?.setSelectionRange(draft.value.length, draft.value.length);
    return;
  } else if (action === 'pick' || action === 'create') {
    const name = action === 'create' ? titleCase(target.dataset.name) : target.dataset.name;
    const day = view.composerDate || todayIso();
    const last = lastSetsFor(name, day);
    changeWithUndo(`Added ${name} to ${dayLabel(day)}`, () => addEntries({ exercises: [{ name, sets: last ? last.map((set) => ({ kg: set.kg, reps: set.reps })) : [{ kg: '', reps: '' }] }] }, day), `Add ${name}`);
    closeComposer();
    if (!last) view.focusSet = { date: day, name };
  } else if (action === 'pick-cardio') {
    const day = view.composerDate || todayIso();
    changeWithUndo(`Added cardio 30 min to ${dayLabel(day)}`, () => addEntries({ exercises: [], cardioMinutes: 30 }, day), 'Add cardio');
    closeComposer();
  } else if (action === 'mic') {
    return view.listening ? send() : startListening();
  } else if (action === 'stop-mic') {
    return stopRecording().then((blob) => {
      view.voiceBlob = blob?.size > 4000 ? blob : null;
      if (!view.voiceBlob) view.status = 'Didn’t catch anything. Hold the mic a little longer and try again.';
      view.live = '';
      view.focusDraft = desktopQuery.matches;
      render();
    });
  } else if (action === 'cancel-mic') {
    return stopRecording().then(() => {
      view.live = '';
      view.voiceBlob = null;
      render();
    });
  } else if (action === 'send') return send();
  else if (action === 'hide-banner') {
    view.bannerHidden = Number(target.dataset.at);
    return render();
  }
  else if (action === 'copy-invite') {
    navigator.clipboard.writeText(inviteLink(view.isAdmin ? view.shareName || '' : '')).then(() => {
      view.copiedInvite = true;
      render();
      setTimeout(() => {
        view.copiedInvite = false;
        render();
      }, 1600);
    });
    return;
  } else if (action === 'share-invite') {
    const link = inviteLink(view.isAdmin ? view.shareName || '' : '');
    if (navigator.share) navigator.share({ title: 'Exodia', text: 'Try Exodia, a training log you talk to.', url: link }).catch(() => {});
    else navigator.clipboard.writeText(link).then(() => {
      view.copiedInvite = true;
      render();
      setTimeout(() => {
        view.copiedInvite = false;
        render();
      }, 1600);
    });
    return;
  } else if (action === 'copy-link') {
    navigator.clipboard.writeText(profileLink()).then(() => {
      view.copied = true;
      render();
      setTimeout(() => {
        view.copied = false;
        render();
      }, 1600);
    });
    return;
  } else if (action === 'join-link') {
    const key = (document.getElementById('join-link')?.value || '').match(/[a-f0-9]{32}/);
    if (!key) {
      view.linkNote = 'That link does not look right.';
    } else {
      view.linkNote = 'Joining…';
      render();
      return joinProfile(key[0]).then((joined) => {
        view.linkNote = joined ? 'Done. This device now shows the same lifts.' : 'Could not reach Exodia. Check your internet and try again.';
        render();
      });
    }
  } else if (action === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exodia-backup-${todayIso()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }
  render();
  if (anchor) keepAnchor(anchor);
  if (action === 'toggle-session' && view.open.has(date)) requestAnimationFrame(() => centreDay(date));
});

let friendSearchTimer = null;
document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'friendSearch') {
    const q = target.value;
    view.friendSearch = { q, people: view.friendSearch?.people || [], loading: true };
    clearTimeout(friendSearchTimer);
    friendSearchTimer = setTimeout(() => {
      if (q.trim().length < 2) {
        view.friendSearch = { q, people: [] };
        render();
        return;
      }
      socialPost('/api/friends', { action: 'search', q })
        .then(({ data }) => {
          if (view.friendSearch?.q !== q) return;
          view.friendSearch = { q, people: data.people || [] };
          render();
        })
        .catch(() => {
          view.friendSearch = { q, people: [] };
          view.friendNote = "You're offline. Search works when you're back.";
          render();
        });
    }, 250);
    render();
    return;
  }
  if (target.hasAttribute('data-share-name')) {
    view.shareName = target.value.slice(0, 30);
    const linkText = target.closest('.card').querySelector('.muted');
    if (linkText) linkText.textContent = inviteLink(view.shareName);
    const qr = target.closest('.card').querySelector('.qrCode');
    if (qr) qr.outerHTML = qrSvg(inviteLink(view.shareName));
    return;
  }
  if (target.id === 'onboardName' || target.id === 'onboardData') {
    view.onboard[target.id === 'onboardName' ? 'name' : 'data'] = target.value;
    if (target.id === 'onboardName') {
      view.onboard.nameChecked = false;
      // A name someone already has opens their log by itself, a moment after typing stops; no Enter needed.
      clearTimeout(nameWatch);
      const typed = target.value.trim();
      if (typed.length >= 2) nameWatch = setTimeout(() => nameOwner(typed).then((owner) => {
        if (owner.key && view.onboard && !view.onboard.busy && view.onboard.name.trim() === typed) welcomeBack(owner.key, typed);
      }), 700);
    }
    if (target.id === 'onboardData') fitDraft(target);
    const prompt = document.querySelector('.onboardPrompt');
    const filled = view.onboard.data.trim().length > 0 || Boolean(view.onboard.file);
    if (target.id === 'onboardData' && prompt && prompt.classList.contains('hasText') !== filled) {
      render();
      document.getElementById('onboardData')?.setSelectionRange(target.value.length, target.value.length);
    }
    return;
  }
  if (target.id === 'search') {
    view.search.query = target.value;
    view.search.local = target.value.trim() ? searchLocal(target.value) : [];
    view.search.ai = [];
    view.search.loading = false;
    searchSeq += 1;
    clearTimeout(searchTimer);
    if (target.value.trim().length >= 3) searchTimer = setTimeout(runAiSearch, 700);
    paintSearch();
    return;
  }
  if (target.id === 'draft') {
    view.draft = target.value;
    if (!view.composer) {
      view.composer = true;
      view.sheetH = SHEET_SMALL;
      if (!view.composerDate) view.composerDate = todayIso();
    }
    fitDraft(target);
    syncDock();
    paintSlash();
    return;
  }
  if (target.dataset.field) {
    const session = sessionFor(target.dataset.date);
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const index = Number(target.dataset.set);
    const group = exercise.sets.slice(index, index + (Number(target.dataset.count) || 1));
    const field = target.dataset.field;
    if (field === 'rpe') {
      const rpe = parseFloat(target.value.replace(',', '.'));
      for (const set of group) {
        if (rpe >= 1 && rpe <= 10) set.rpe = rpe;
        else delete set.rpe;
      }
      save();
      return;
    }
    const previous = exercise.sets[index][field];
    for (const set of group) set[field] = target.value.replace(',', '.');
    // Later sets that still have the old weight follow a new one (filling in sets copied from last time), but never
    // while the box is empty mid-typing, and never sets you added or typed yourself.
    if (field === 'kg' && target.value.trim() === '') {
      save();
      return;
    }
    if (field === 'kg') {
      for (const set of group) set.edited = true;
      for (let next = index + group.length; next < exercise.sets.length; next += 1) {
        if (!exercise.sets[next].edited && exercise.sets[next].kg === previous) {
          exercise.sets[next].kg = exercise.sets[index].kg;
          const box = document.querySelector(`input[data-field="kg"][data-date="${target.dataset.date}"][data-exercise="${target.dataset.exercise}"][data-set="${next}"]`);
          if (box) box.value = exercise.sets[next].kg;
        }
      }
    }
    save();
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.dataset.dayNote) {
    const session = sessionFor(target.dataset.dayNote);
    if (session) {
      const note = target.value.trim().slice(0, 600);
      if (note === (session.note || '')) return;
      if (note) session.note = note;
      else delete session.note;
      view.noteEdit = null;
      addLog('Note', [note ? `Note on ${dayLabel(session.date)}` : `Removed the note on ${dayLabel(session.date)}`], { manual: true });
      save();
      render();
    }
    return;
  }
  if (target.dataset.cardioDate) {
    const session = sessionFor(target.dataset.cardioDate);
    const minutes = Math.round(Number(target.value));
    if (session && minutes > 0 && minutes <= 600) {
      const parts = cardioParts(session);
      const part = parts[Number(target.dataset.index)];
      if (part && part.minutes !== minutes) {
        changeWithUndo(`${part.name} ${humanMinutes(minutes)} on ${dayLabel(session.date)}`, () => setCardioParts(session, parts.map((item) => (item === part ? { ...item, minutes } : item))), 'Change cardio time');
        save();
      }
    }
    render();
    return;
  }
  if (target.dataset.dayLabel) {
    const session = sessionFor(target.dataset.dayLabel);
    if (session) {
      if (target.value.trim()) session.label = target.value.trim().slice(0, 40);
      else delete session.label;
      addLog('Name day', [session.label ? `Named ${dayLabel(session.date)} “${session.label}”` : `Removed the name of ${dayLabel(session.date)}`], { manual: true });
      save();
      render();
    }
    return;
  }
  if (target.hasAttribute('data-name-input')) {
    const name = target.value.trim().slice(0, 40);
    const before = state.name || '';
    if (!name || name.toLowerCase() === before.toLowerCase()) {
      state.name = name || before;
      save();
      render();
      return;
    }
    // A name is an account, so someone else's can't be taken.
    nameOwner(name).then((owner) => {
      if (owner.taken || (owner.key && owner.key !== syncState.profile)) {
        view.toast = { kind: 'rep', title: `${name} is taken`, text: 'Names are accounts here. Pick another one.' };
        render();
        return;
      }
      state.name = name;
      save();
      render();
    });
    return;
  }
  if (target.dataset.field) {
    const session = sessionFor(target.dataset.date);
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const set = exercise.sets[Number(target.dataset.set)];
    const removed = set && set.kg === '' && set.reps === '';
    if (removed) exercise.sets.splice(Number(target.dataset.set), Number(target.dataset.count) || 1);
    if (exercise.sets.length === 0) session.exercises.splice(Number(target.dataset.exercise), 1);
    if (session.exercises.length === 0 && !session.cardio) state.sessions = state.sessions.filter((item) => item !== session);
    const changed = exercise.sets[Number(target.dataset.set)];
    if (changed && changed.kg !== '' && changed.reps !== '') addLog('Edit numbers', [`${exercise.name} set ${Number(target.dataset.set) + 1} is now ${changed.kg} × ${changed.reps}${changed.rpe ? ` @${changed.rpe}` : ''} on ${dayLabel(session.date)}`], { manual: true, merge: `set:${session.date}:${exercise.name}:${target.dataset.set}` });
    checkPr(exercise.name, session.date);
    save();
    // Going from kg to reps (a tap or Tab) fires this first. Redrawing then would swap the box being typed in and drop
    // the phone's keyboard, so while the next box is another set's, the redraw waits until you leave the numbers.
    if (removed) render();
    else setTimeout(() => {
      if (document.activeElement?.matches?.('.page input[data-field]')) view.renderOnBlur = true;
      else render();
    });
  } else if (target.dataset.action === 'import-file' && target.files[0]) {
    const picked = target.files[0];
    target.value = '';
    view.showQuick = false;
    attachFile(picked);
  } else if (target.dataset.action === 'onboard-file' && target.files[0] && view.onboard) {
    const picked = target.files[0];
    target.value = '';
    readFileText(picked).then((text) => {
      view.onboard.file = { name: picked.name, text };
      view.onboard.status = '';
      render();
    }).catch((error) => {
      view.onboard.status = error.message || 'Could not read that file. Try saving it as CSV.';
      render();
    });
  } else if (target.dataset.action === 'import' && target.files[0]) {
    target.files[0].text().then((text) => {
      const restored = JSON.parse(text);
      if (!Array.isArray(restored.sessions)) throw new Error('Not an Exodia backup');
      state = { ...restored, deviceId: state.deviceId };
      save();
      render();
    }).catch((error) => alert(error.message));
  }
});

// Drop or paste a file anywhere on the page: it goes through the same reader as the paperclip.
const takeFile = (picked) => {
  if (view.onboard) {
    readFileText(picked).then((text) => {
      view.onboard.file = { name: picked.name, text };
      view.onboard.status = '';
      render();
    }).catch((error) => {
      view.onboard.status = error.message || 'Could not read that file. Try saving it as CSV.';
      render();
    });
    return;
  }
  attachFile(picked);
};
// Move to a date from the picker (any past day, not just the last three weeks).
document.addEventListener('change', (event) => {
  const input = event.target.closest?.('input[data-move-from]');
  if (!input || !input.value || input.value === input.dataset.moveFrom || input.value > todayIso()) return;
  const session = sessionFor(input.dataset.moveFrom);
  if (!session) return;
  const to = input.value;
  view.editDay = null;
  changeWithUndo(`Moved ${dayLabel(session.date)} to ${dayLabel(to)}`, () => moveSession(session, to), `Move to ${dayLabel(to)}`);
  glowFor([{ date: to, name: null }]);
  view.open.add(to);
  view.scrollTarget = to;
  render();
});
const hasFiles = (event) => [...(event.dataTransfer?.types || [])].includes('Files');
let dragDepth = 0;
document.addEventListener('dragenter', (event) => {
  if (!hasFiles(event)) return;
  dragDepth += 1;
  document.body.classList.add('dropping');
});
document.addEventListener('dragleave', (event) => {
  if (!hasFiles(event)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) document.body.classList.remove('dropping');
});
document.addEventListener('dragover', (event) => {
  if (hasFiles(event)) event.preventDefault();
});
document.addEventListener('drop', (event) => {
  dragDepth = 0;
  document.body.classList.remove('dropping');
  const files = [...(event.dataTransfer?.files || [])];
  if (!files.length) {
    // A link dragged out of Google Drive or Sheets: the app can't open it, so say how to get the file.
    const link = event.dataTransfer?.getData('text/uri-list') || '';
    if (/docs\.google\.com|drive\.google\.com/.test(link)) {
      event.preventDefault();
      openChat();
      addLog('Google link', ['Not logged: Exodia can’t open Google Drive links. In Sheets choose File → Download → Excel (.xlsx) or CSV, then drop that file here.']);
      render();
    }
    return;
  }
  event.preventDefault();
  takeFiles(files);
});
document.addEventListener('paste', (event) => {
  const files = [...(event.clipboardData?.files || [])];
  if (!files.length) return;
  event.preventDefault();
  takeFiles(files);
});

// The orange copy of the text scrolls with the box, so a long message never drifts from the cursor.
document.addEventListener('scroll', (event) => {
  if (event.target.id !== 'draft') return;
  const mirror = document.querySelector('.promptMirror');
  if (mirror) mirror.scrollTop = event.target.scrollTop;
}, true);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && view.musclePick) pickMuscle(null);
  if (event.target.id === 'search' && event.key === 'Enter') {
    event.preventDefault();
    clearTimeout(searchTimer);
    runAiSearch();
    return;
  }
  if (event.target.id === 'draft' && event.key === 'Tab' && slashOffer().length) {
    event.preventDefault();
    document.querySelector('.slashList .slashSuggest')?.click();
    return;
  }
  if (event.target.id === 'draft' && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
  // ⌘Z / Ctrl+Z undoes, with Shift it redoes, when you are not typing in a field.
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.target.closest('input, textarea, [contenteditable]')) {
    event.preventDefault();
    if (event.shiftKey) redoStep();
    else undoStep();
    render();
    return;
  }
  if (event.key === 'Escape' && (view.menu || view.composer)) {
    view.menu = false;
    view.composer = false;
    document.activeElement?.blur();
    render();
    return;
  }
  const typing = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;
  if (typing && !event.target.closest('input, textarea, select, [contenteditable]')) document.getElementById('draft')?.focus();
});

const route = () => {
  const name = location.hash.replace(/^#\/?/, '');
  const profile = name.match(/^me\/([a-f0-9]{32})$/);
  if (profile) {
    history.replaceState(null, '', '#/');
    joinProfile(profile[1]).then(render);
    view.route = 'home';
    render();
    return;
  }
  // Leaving Home remembers how far down you were; coming back puts you there again, not at the top.
  if (view.route === 'home') view.homeScroll = scroller().scrollTop;
  const friendPage = name.match(/^friend\/([a-f0-9]{16})$/);
  const wasRoute = view.route;
  view.route = friendPage ? 'friend' : ['trends', 'you', 'log', 'admin', 'feedback', 'import', 'help', 'friends', 'together'].includes(name) ? name : 'home';
  view.friendHandle = friendPage ? friendPage[1] : null;
  if (['friends', 'together', 'friend'].includes(view.route)) loadSocial();
  if (view.route === 'friends') loadEveryone();
  if (view.route === 'together' && wasRoute !== 'together') {
    view.whenScroll = null;
    view.visitOpen = null;
    if (!view.togetherWith) startTogether();
    view.togetherWith = null;
  }
  noteUse('view', view.route);
  if (view.route !== 'log') {
    view.logDate = null;
    view.logLift = null;
  }
  if (view.route === 'admin') view.adminRows = null;
  view.menu = false;
  scrollPage(0);
  render();
  // Arrived by a swipe: the new page slides in from that side.
  if (view.pageEnter) {
    document.querySelector('main.page')?.classList.add(`enter-${view.pageEnter}`);
    view.pageEnter = null;
  }
  if (view.route === 'home' && view.homeScroll && !view.trendScroll) scrollPage(view.homeScroll);
  if (view.route === 'log' || (view.route === 'admin' && view.adminTab === 'chat')) scrollPage(scroller().scrollHeight);
};
window.addEventListener('hashchange', route);
desktopQuery.addEventListener('change', render);
view.focusDraft = desktopQuery.matches;
// /Patrik: an invite with a name. Fill it in on a fresh device and say hello by name.
const invitedName = (() => {
  let name = '';
  try { name = decodeURIComponent(location.pathname.slice(1)).replace(/\/$/, ''); } catch { return ''; }
  return /^\p{L}[\p{L}\- ]{0,29}$/u.test(name) && !['join', 'marcus', 'api', 'me'].includes(name.toLowerCase()) ? name.replace(/-/g, ' ') : '';
})();
if (invitedName) {
  history.replaceState(null, '', `/${location.hash}`);
  if (!state.name && !state.started && state.sessions.length === 0) {
    view.invited = invitedName;
    view.onboard = { name: invitedName, data: '' };
  }
}
announceBuilds();
watchBuilds();
// A private /me/ link. From the home screen it is the owner's own app, so it opens straight away. In a browser it may
// be a link someone passed on (Romy's link sent to Adam), so ask first and say whose it is.
const linkedProfile = location.pathname.match(/^\/me\/([a-f0-9]{32})\/?$/);
const standalone = navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
if (linkedProfile && linkedProfile[1] !== syncState.profile) {
  if (standalone) joinProfile(linkedProfile[1]).then(render);
  else {
    view.linkOffer = { key: linkedProfile[1], name: '', days: 0 };
    fetch('/api/sync', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': linkedProfile[1] }, body: JSON.stringify({ peek: true }) })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body && view.linkOffer) Object.assign(view.linkOffer, { name: body.name || '', days: body.days || 0 });
        render();
      })
      .catch(() => null);
  }
}
// ?demo (the portfolio's iframe): example data held in memory only, so it never saves over a real log or syncs.
if (new URLSearchParams(location.search).has('demo')) {
  view.preview = true;
  // Marcus's real training (from /api/demo), opening on Trends; made-up example data only if that can't load.
  state = { version: 1, deviceId: state.deviceId, sessions: [], bests: {}, name: '', started: true, demo: true };
  if (!location.hash) history.replaceState(null, '', '#/trends');
  fetch('/api/demo').then((response) => (response.ok ? response.json() : Promise.reject(new Error('no demo'))))
    .then((data) => {
      if (!data.sessions?.length) throw new Error('no demo');
      Object.assign(state, { sessions: data.sessions, ...(data.body ? { body: data.body } : {}) });
      view.realDemo = true;
      // Opens on the deadlift chart: the lift that shows the most (the latest squat can be a light 20 × 10).
      if (!view.trendOpen) view.trendOpen = 'Deadlift';
    })
    .catch(() => Object.assign(state, { sessions: demoSessions(52), body: { kg: 85, sex: 'male' } }))
    .finally(() => {
      lastSaved = localJson();
      lastMeta = metaJson();
      // The log arriving isn't a new Exodia hit: no celebration over the demo.
      view.wasHit = undefined;
      render();
    });
  Object.assign(view, { onboard: null, linkOffer: null, open: new Set() });
  lastSaved = localJson();
  lastMeta = metaJson();
}
applyFlavor();
const resume = (() => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RESUME_KEY) || 'null');
    sessionStorage.removeItem(RESUME_KEY);
    return saved && Date.now() - saved.at < 60000 ? saved : null;
  } catch {
    return null;
  }
})();
if (resume) Object.assign(view, { open: new Set(resume.open || []), trendOpen: resume.trendOpen ?? view.trendOpen, trendMore: Boolean(resume.trendMore) });
route();
if (resume) requestAnimationFrame(() => scrollPage(resume.scroll || 0));
noteUpdate();
pointManifest();
syncNow();
setInterval(() => {
  if (!document.hidden) syncNow();
}, 15000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncNow();
});
window.addEventListener('online', () => syncNow());
document.addEventListener('focusin', (event) => {
  const input = event.target.closest?.('input.pill');
  if (!input) return;
  setTimeout(() => {
    if (document.activeElement === input) input.setSelectionRange(input.value.length, input.value.length);
  }, 60);
});

let sheetDrag = null;
document.addEventListener('pointerdown', (event) => {
  const grab = event.target.closest('.dock .grabber');
  if (!grab) return;
  sheetDrag = { y: event.clientY, h: grab.closest('.sheet').offsetHeight, moved: false, samples: [[event.timeStamp, event.clientY]] };
  grab.setPointerCapture?.(event.pointerId);
});
document.addEventListener('pointermove', (event) => {
  if (!sheetDrag) return;
  const pulled = sheetDrag.y - event.clientY;
  if (Math.abs(pulled) > 5) sheetDrag.moved = true;
  if (!sheetDrag.moved) return;
  const dockBox = document.querySelector('.dock .prompt')?.getBoundingClientRect();
  const most = Math.max(SHEET_PEEK, (dockBox ? dockBox.top : window.innerHeight) - 72);
  setSheet(Math.round(Math.max(SHEET_PEEK, Math.min(most, sheetDrag.h + pulled))));
  sheetDrag.samples = [...sheetDrag.samples.slice(-5), [event.timeStamp, event.clientY]];
});
for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, () => {
  const drag = sheetDrag;
  sheetDrag = null;
  if (!drag?.moved) return;
  view.sheetDragged = Date.now();
  const [first, last] = [drag.samples[0], drag.samples.at(-1)];
  const speed = (first[1] - last[1]) / Math.max(1, last[0] - first[0]);
  const now = document.querySelector('.dock .sheet')?.offsetHeight || SHEET_PEEK;
  const usual = Math.round(preferredSheet());
  if (speed > 0.5) setSheet(Math.max(now, usual), true);
  else if (speed < -0.5) {
    if (now > usual + 24) setSheet(usual, true);
    else if (drag.h <= SHEET_SMALL + 4) closeTray();
    else setSheet(SHEET_SMALL, true);
  }
});

let hold = null;
let held = false;
document.addEventListener('pointerdown', (event) => {
  held = false;
  const section = event.target.closest('.homePage .session:not(.editing)');
  if (!section || event.target.closest('.dayLift, input, .dayActions, .swipeDel')) return;
  const date = section.id.replace('session-', '');
  hold = { ...uiPoint(event), timer: setTimeout(() => {
    hold = null;
    const session = sessionFor(date);
    if (!session) return;
    if (!view.open.has(date)) view.opening = date;
    view.open.add(date);
    view.editDay = date;
    view.menuEnter = true;
    view.fixing = null;
    view.editContext = { date, names: session.exercises.map((exercise) => exercise.name), label: dayKind(session) };
    held = true;
    render();
  }, 700) };
});
for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, () => {
  if (hold) clearTimeout(hold.timer);
  hold = null;
});
document.addEventListener('pointermove', (event) => {
  const point = uiPoint(event);
  if (hold && Math.hypot(point.x - hold.x, point.y - hold.y) > 10) {
    clearTimeout(hold.timer);
    hold = null;
  }
});

document.addEventListener('mousedown', (event) => {
  if (event.target.closest('.dock .promptBar button, .dock .contextX')) event.preventDefault();
});
let swipe = null;
let lastSwipe = 0;
// The Delete behind a row is out of the Tab order until a swipe shows it.
const openSwipe = (row, open) => {
  row.classList.toggle('open', open);
  row.querySelector('.swipeDel')?.setAttribute('tabindex', open ? '0' : '-1');
};
document.addEventListener('pointerdown', (event) => {
  const face = event.target.closest('.swipeFace');
  // A tap on the Delete a swipe showed must reach it: closing its row first slid the row back over the button.
  const shown = event.target.closest('.swipe.open .swipeDel')?.closest('.swipe');
  for (const open of document.querySelectorAll('.swipe.open')) if (open !== face?.parentElement && open !== shown) openSwipe(open, false);
  if (shown) {
    swipe = null;
    lastSwipe = 0;
    return;
  }
  swipe = face && event.pointerType !== 'mouse' ? { face, ...uiPoint(event), dx: 0, active: false } : null;
});
document.addEventListener('pointermove', (event) => {
  if (!swipe) return;
  const point = uiPoint(event);
  const dx = point.x - swipe.x;
  const dy = point.y - swipe.y;
  if (!swipe.active) {
    if (Math.abs(dy) > 10) swipe = null;
    if (!swipe || Math.abs(dx) < 10) return;
    swipe.active = true;
    swipe.face.style.transition = 'none';
  }
  swipe.dx = Math.min(0, Math.max(-swipe.face.offsetWidth, dx + (swipe.face.parentElement.classList.contains('open') ? -76 : 0)));
  swipe.face.style.transform = `translateX(${swipe.dx}px)`;
});
const endSwipe = () => {
  if (!swipe) return;
  const { face, dx, active } = swipe;
  swipe = null;
  face.style.transition = '';
  face.style.transform = '';
  if (!active) return;
  if (dx < -face.offsetWidth * 0.55) {
    face.parentElement.querySelector('.swipeDel').click();
    lastSwipe = Date.now();
    return;
  }
  lastSwipe = Date.now();
  openSwipe(face.parentElement, dx < -40);
};
document.addEventListener('pointerup', endSwipe);
document.addEventListener('pointercancel', endSwipe);
document.addEventListener('click', (event) => {
  if (held) {
    held = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (Date.now() - lastSwipe < 350) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

const closeTray = () => {
  if (!view.composer) return;
  view.composer = false;
  // Nothing typed: the next log goes to today again, not to the old day the box was pointed at.
  if (!view.draft.trim() && !view.editDay) view.composerDate = null;
  view.showQuick = false;
  view.quickHidden = false;
  if (!desktopQuery.matches && document.activeElement?.closest?.('.dock')) document.activeElement.blur();
  syncDock();
};
for (const type of ['wheel', 'touchmove']) {
  document.addEventListener(type, (event) => {
    if (!event.target.closest('.dock')) closeTray();
  }, { passive: true });
}
document.addEventListener('focusout', (event) => {
  if (event.target.closest?.('.dock') && event.relatedTarget && !event.relatedTarget.closest('.dock')) closeTray();
});
document.addEventListener('focusout', () => {
  if (!view.renderOnBlur) return;
  setTimeout(() => {
    if (document.activeElement && document.activeElement.matches('.page input, #draft')) return;
    view.renderOnBlur = false;
    render();
  });
});
tickTypewriter();

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // New versions install quietly in the background and are used from the next open, never by reloading the page.
  // Looks for a new version when the app opens, when you come back to it, and every 2 minutes while it's on screen.
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) registration.update();
    });
    setInterval(() => {
      if (!document.hidden) registration.update();
    }, 120000);
  });
  // When a new version takes over in the background, offer a quiet tap to load it now.
  const hadVersion = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadVersion || view.updateReady) return;
    view.updateReady = true;
    render();
    updateQuietly();
  });
}

// A warm, quiet sign of life: a soft clay bloom where a finger lands, and a faint glow along the edge the page is
// being scrolled toward, fading as it slows. Nothing to tap, never in the way; off with reduced motion.
(() => {
  if (reducedMotion.matches) return;
  const bloom = document.createElement('div');
  bloom.className = 'touchBloom';
  bloom.setAttribute('aria-hidden', 'true');
  const edge = document.createElement('div');
  edge.className = 'scrollGlow';
  edge.setAttribute('aria-hidden', 'true');
  document.body.append(bloom, edge);
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    bloom.style.left = `${event.clientX}px`;
    bloom.style.top = `${event.clientY}px`;
    bloom.getAnimations().forEach((animation) => animation.cancel());
    bloom.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(0.9)', offset: 0.25 },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(1.25)' }
    ], { duration: 720, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  }, { passive: true });
  let lastY = 0;
  let lastT = 0;
  const onScroll = () => {
    const y = scroller().scrollTop;
    const now = performance.now();
    const speed = Math.abs(y - lastY) / Math.max(16, now - lastT);
    const down = y > lastY;
    lastY = y;
    lastT = now;
    if (speed < 0.4) return;
    edge.classList.toggle('up', !down);
    edge.getAnimations().forEach((animation) => animation.cancel());
    edge.animate([{ opacity: Math.min(0.9, speed / 4) }, { opacity: 0 }], { duration: 650, easing: 'ease-out' });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  document.getElementById('app')?.addEventListener('scroll', onScroll, { passive: true });
})();

// Phone: swipe between the three screens like an app. On Home, swipe left for Trends and right for the sidebar; on
// Trends, swipe right back to Home. The page follows the finger and glides out; a short or slow swipe springs back.
let pageSwipe = null;
let pageSwipedAt = 0;
const PAGE_SWIPE_SKIP = '.dock, .sheet, .swipeFace, .calScroll, .days, .dayActions, input, textarea, select, .grabber, .updatedPill, .drawer, .scrim, .segment, .toast, .buildBanner, .confirm';
document.addEventListener('pointerdown', (event) => {
  pageSwipe = null;
  if (event.pointerType !== 'touch' || desktopQuery.matches || turn || view.menu || view.composer || !['home', 'trends'].includes(view.route)) return;
  if (event.target.closest(PAGE_SWIPE_SKIP)) return;
  const page = document.querySelector('main.page');
  if (page) pageSwipe = { page, x: event.clientX, y: event.clientY, t: event.timeStamp, dx: 0, active: false };
});
document.addEventListener('pointermove', (event) => {
  if (!pageSwipe) return;
  const dx = event.clientX - pageSwipe.x;
  const dy = event.clientY - pageSwipe.y;
  if (!pageSwipe.active) {
    // Mostly up or down is scrolling: let it be.
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
      pageSwipe = null;
      return;
    }
    if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    pageSwipe.active = true;
    pageSwipe.page.style.transition = 'none';
  }
  // Trends has nothing further right: that way only gives a little.
  const allowed = view.route === 'home' || dx > 0;
  pageSwipe.dx = allowed ? dx : dx * 0.18;
  pageSwipe.page.style.transform = `translateX(${pageSwipe.dx.toFixed(1)}px)`;
  pageSwipe.page.style.opacity = String(1 - Math.min(0.35, Math.abs(pageSwipe.dx) / window.innerWidth * 0.5));
});
const endPageSwipe = (event) => {
  const swipe = pageSwipe;
  pageSwipe = null;
  if (!swipe?.active) return;
  pageSwipedAt = Date.now();
  const width = window.innerWidth;
  const speed = swipe.dx / Math.max(1, event.timeStamp - swipe.t);
  const far = Math.abs(swipe.dx) > width * 0.28 || Math.abs(speed) > 0.45;
  const target = swipe.dx < 0 ? (view.route === 'home' ? 'trends' : null) : view.route === 'trends' ? 'home' : 'menu';
  const page = swipe.page;
  page.style.transition = 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.24s ease';
  if (!far || !target || event.type === 'pointercancel') {
    page.style.transform = '';
    page.style.opacity = '';
    return;
  }
  if (target === 'menu') {
    page.style.transform = '';
    page.style.opacity = '';
    view.menu = true;
    render();
    return;
  }
  page.style.transform = `translateX(${swipe.dx < 0 ? -width : width}px)`;
  page.style.opacity = '0';
  setTimeout(() => {
    view.pageEnter = swipe.dx < 0 ? 'right' : 'left';
    location.hash = target === 'trends' ? '#/trends' : '#/';
  }, 200);
};
document.addEventListener('pointerup', endPageSwipe);
document.addEventListener('pointercancel', endPageSwipe);
// A swipe that ends on a button is not a tap on it.
document.addEventListener('click', (event) => {
  if (Date.now() - pageSwipedAt < 400) {
    event.stopPropagation();
    event.preventDefault();
  }
}, true);
const phoneKind = /iPhone|iPod/.test(navigator.userAgent) ? 'iPhone' : /iPad/.test(navigator.userAgent) ? 'iPad' : /Android/.test(navigator.userAgent) ? 'Android' : /Mac/.test(navigator.userAgent) ? 'Mac' : /Windows/.test(navigator.userAgent) ? 'Windows' : '';
noteUse('open', `${window.matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'app' : 'browser'}${phoneKind ? ` · ${phoneKind}` : ''}`);
loadFeatures();
if (featureOn('friends')) loadSocial();
// Friends' changes (a new request, a plan someone changed) show up while Exodia is open, without a reload.
setInterval(() => {
  if (!document.hidden && featureOn('friends') && ['friends', 'together', 'friend'].includes(view.route)) loadSocial();
}, 20000);
for (const type of ['focus', 'visibilitychange']) window.addEventListener(type, () => {
  if (document.hidden) return;
  loadFeatures();
  if (featureOn('friends')) loadSocial();
});
setTimeout(sendUse, 4000);

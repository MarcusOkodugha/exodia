'use strict';

const STORE_KEY = 'exodia.v1';
// Exodia: a heavy set is a top set at least 80% of your best; everything counts over the last 10 days.
const HEAVY_SHARE = 0.8;
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
  { name: 'Squat', piece: 'legs', heavy: true, aliases: ['squat', 'squats', 'sq', 'knäböj', 'barbell squat', 'back squat', 'barbell back squat'] },
  { name: 'Hack Squat', piece: 'legs', heavy: true, aliases: ['hack', 'hack squat'] },
  { name: 'Front Squat', piece: 'legs', heavy: true, aliases: ['front squat'] },
  { name: 'Romanian Deadlift', piece: 'legs', heavy: false, aliases: ['rdl', 'romanian deadlift'] },
  { name: 'Stiff-Legged Deadlift', piece: 'legs', heavy: false, aliases: ['stiff leg', 'stiff-legged deadlift', 'sldl'] },
  { name: 'Bulgarian Split Squat', piece: 'legs', heavy: false, aliases: ['bulgarian', 'bulgarian split squat', 'split squat'] },
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
  { id: 'legs', name: 'Legs', target: 1, rule: 'any leg lift: squat, hack squat, leg press, leg extension…' },
  { id: 'arms', name: 'Arms', target: 1, rule: 'arm work' },
  { id: 'move', name: 'Move', target: 2, rule: 'cardio or a walk, 20 min or more, 2 times' }
];

const ICONS = {
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
const tonnes = (kg) => (kg / 1000).toFixed(1) + ' t';
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
const localJson = () => Object.fromEntries(state.sessions.map((session) => [session.date, JSON.stringify(session)]));
const metaJson = () => JSON.stringify({ name: state.name || '', bests: state.bests || {}, log: state.log || [], ...(state.body ? { body: state.body } : {}) });
let lastSaved = localJson();
let lastMeta = metaJson();

const writeLocal = () => {
  if (view.sandbox) return;
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
    const incoming = JSON.stringify({ name: incomingMeta.name || '', bests: incomingMeta.bests || {}, log: incomingMeta.log || [], ...(incomingMeta.body ? { body: incomingMeta.body } : {}) });
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
      syncState.cursor = result.cursor;
      writeLocal();
      view.syncedAt = Date.now();
      if (Boolean(result.admin) !== Boolean(view.isAdmin)) {
        view.isAdmin = Boolean(result.admin);
        loadLeft();
        renderSoon();
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
const pointManifest = () => {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.href = `/manifest.webmanifest?k=${syncState.profile}`;
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
  const previous = { sessions: state.sessions, name: state.name, bests: state.bests, sync: syncState };
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
  for (const old of previous.sessions) {
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
  if (!state.name && previous.name) state.name = previous.name;
  state.bests = { ...previous.bests, ...state.bests };
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
const topEstimate = (exercise) => Math.max(0, ...estimateSets(exercise).map((set) => (isBodyweightLift(exercise.name) ? estimate(bodyLoad(exercise.name, set.kg), Number(set.reps) + repsInTank(set)) : setEstimate(set))));

const HARDER_VARIANTS = { 'Bench Press': ['Close-Grip Bench Press', 'Pause Bench Press'] };
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
const bestBeforeFresh = (name, date, logged = false) => {
  let best = logged ? 0 : Number(state.bests?.[name]) || 0;
  for (const session of state.sessions) {
    if (session.date >= date) continue;
    for (const exercise of session.exercises) if (countsFor(name).includes(exercise.name)) best = Math.max(best, topEstimate(exercise));
  }
  return best;
};
const bestOverall = (name) => bestBefore(name, '9999-12-31');
// Now vs best: the best estimated 1RM of the last 4 weeks against the all-time best, so you see if you're at your
// peak, coming back, or slipping.
const NOW_DAYS = 28;
const nowVsBest = (name) => {
  const best = bestOverall(name);
  if (!best) return null;
  const since = addDays(todayIso(), -(NOW_DAYS - 1));
  let now = 0;
  for (const session of state.sessions) {
    if (session.date < since) continue;
    for (const exercise of session.exercises) if (countsFor(name).includes(exercise.name)) now = Math.max(now, topEstimate(exercise));
  }
  const pct = now ? Math.min(100, Math.round((now / best) * 100)) : 0;
  return { pct, now: Math.round(now), best: Math.round(best), text: !now ? 'No heavy set in the last 4 weeks' : pct >= 100 ? 'At your best' : `Now ${pct}% of your best` };
};
const nowLine = (name) => {
  const now = nowVsBest(name);
  if (!now) return '';
  return `<div class="nowBest"><p><b>${now.text}</b>${now.pct && now.pct < 100 ? `<span class="muted num"> · ${now.now} vs ${now.best} kg</span>` : ''}<span class="muted"> · last 4 weeks</span></p><div class="nowBar" aria-hidden="true"><i style="width:${now.pct}%"></i></div></div>`;
};
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
    if (exercise && validSets(exercise).length > 0) return validSets(exercise);
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
      if (entry.piece === 'arms' || entry.piece === 'legs') {
        hit[entry.piece] = true;
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

// Exodia works in rounds: when all five pieces land within 10 days you hit it, it stays hit (blue) for 10 days, then
// goes back to orange. Each round counts only days after the last hit, so it resets, and training during the blue
// days already counts toward the next one. One walk through the days, kept until your log changes.
const exodiaHistory = () => {
  const today = todayIso();
  const empty = { push: 0, pull: 0, legs: 0, arms: 0, move: 0 };
  if (state.sessions.length === 0) return { hits: 0, last: null, counts: { ...empty } };
  const hits = dayHits();
  if (hitsCache.history?.today === today) return hitsCache.history.value;
  const first = [...hits.keys()].sort()[0];
  let counts = { ...empty };
  let total = 0;
  let last = null;
  const add = (iso, sign) => {
    const hit = hits.get(iso);
    if (hit) for (const key of Object.keys(counts)) if (hit[key]) counts[key] += sign;
  };
  for (let iso = first; iso <= today; iso = addDays(iso, 1)) {
    add(iso, 1);
    const leaving = addDays(iso, -EXODIA_DAYS);
    if (!last || leaving > last) add(leaving, -1);
    if (PIECES.every((piece) => counts[piece.id] >= piece.target)) {
      total += 1;
      last = iso;
      counts = { ...empty };
    }
  }
  const value = { hits: total, last, counts };
  hitsCache.history = { today, value };
  return value;
};
const exodiaActive = () => {
  const { last } = exodiaHistory();
  return Boolean(last) && last > addDays(todayIso(), -EXODIA_DAYS);
};
// The bars: full while Exodia is hit, otherwise this round's days (since the last hit, within the last 10 days).
const pieceProgress = () => {
  const active = exodiaActive();
  const { counts } = exodiaHistory();
  return PIECES.map((piece) => (active ? { ...piece, done: piece.target, complete: true } : { ...piece, done: counts[piece.id], complete: counts[piece.id] >= piece.target }));
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
    return minutes > 0 && minutes <= 600 ? { cardio: minutes } : null;
  }
  const match = text.match(/^([\p{L}][\p{L}\s-]*?)\s+(\d.*)$/u);
  if (!match) return null;
  const name = findExerciseName(match[1]);
  if (!name) return null;
  const numbers = match[2].replace(/\s+(reps?|sets?)\b/g, ' ');
  // Anything that looks off (dozens of sets, reps over 50, a 2 kg squat) goes to the AI instead of being guessed.
  const sane = (sets) => sets.length > 0 && sets.length <= 15 && sets.every((set) => Number(set.reps) > 0 && Number(set.reps) <= 50 && Number(set.kg) >= 0 && Number(set.kg) <= 500) ? { name, sets } : null;
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
    if (parsed.cardio) result.cardioMinutes += parsed.cardio;
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
const noteContext = () => ({ today: todayIso(), viewing: view.editContext?.date || view.composerDate || todayIso(), focus: view.editContext ? `${view.editContext.names.join(', ') || 'the workout'} on ${view.editContext.date}` : '' });
// No connection at all is a "try again later", same as a busy AI.
const fetchOrLater = (url, options) => fetch(url, options).catch(() => {
  throw Object.assign(new Error('No connection right now.'), { later: true, busy: true });
});
const parseWithAi = async (text, audio, hint = '', saved = null) => {
  const response = await fetchOrLater('/api/parse', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile },
    body: JSON.stringify({ text, audio, hint, ...(view.sandbox ? { dry: true } : {}), name: state.name || '', ...noteContext(), ...(saved || {}), recent: recentLog(), deviceId: state.deviceId, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) })
  });
  const body = await response.json().catch(() => ({}));
  // Busy, rate-limited or down: worth trying again later by itself. A note the AI read but couldn't use is not.
  if (!response.ok) throw Object.assign(new Error(body.error || 'The AI could not read that.'), { heard: body.transcript || '', later: response.status === 429 || response.status >= 500 });
  return body;
};

const announced = new Set();
const priorSets = (name, date) => state.sessions
  .filter((session) => session.date < date)
  .flatMap((session) => session.exercises.filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets))
  .map((set) => ({ kg: Number(set.kg), reps: Number(set.reps) }));
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
  if (earlierDays(name, date) < 3) return null;
  const today = earlierToday(name, date, set);
  // PRs compare against logged history only; imported all-time bests would hide every climb up to them.
  if (reps === 1 && kg > Math.max(singleBefore(name, date, true), ...today.filter((other) => Number(other.reps) === 1).map((other) => Number(other.kg)))) return 'max';
  return setEstimate(set) > Math.max(bestBefore(name, date, true), ...today.map(setEstimate)) + 0.01 ? 'est' : null;
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
    : { kind: 'rep', name, title: `New PR · ${name}`, text: `${top.kg} × ${top.reps}, estimated 1RM ${Math.round(top.est)} kg, +${round(top.est - bestBefore(name, date))} kg` };
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
  if (result.cardioMinutes) session.cardio = result.cardioTotal || (session.cardio && /\b(instead|change|changed|correct|should be|not \d+|was \d+)\b/i.test(`${result.transcript || ''} ${view.lastSaid || ''}`)) ? Number(result.cardioMinutes) : (session.cardio || 0) + Number(result.cardioMinutes);
  if (result.cardioMinutes && result.cardioName) session.cardioName = result.cardioName;
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
  const matches = names.filter((name) => !query || name.toLowerCase().includes(query));
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
    const label = `${esc(exercise.name)}, ${count > 1 ? `${count} sets` : `set ${numbers}`}`;
    const where = `data-date="${session.date}" data-exercise="${exerciseIndex}" data-set="${start}" data-count="${count}"`;
    return `<div class="swipe setSwipe"><button class="swipeDel" data-action="delete-set" ${where} aria-label="Delete ${label}">Delete</button><div class="setRow swipeFace">
      ${editing ? `<button class="minus" data-action="delete-set" ${where} aria-label="Delete ${label}"></button>` : `<span class="setNo num">${numbers}</span>`}
      <input class="pill num" inputmode="decimal" aria-label="${label}, kilograms" value="${esc(set.kg)}" placeholder="kg" ${where} data-field="kg">
      <span class="unit">${isBodyweightLift(exercise.name) ? '+kg' : 'kg'}</span><span class="unit" aria-hidden="true" style="text-align:center">×</span>
      <input class="pill num" inputmode="numeric" aria-label="${label}, reps" value="${esc(set.reps)}" placeholder="reps" ${where} data-field="reps">
      ${editing ? `<input class="pill num rpe" inputmode="decimal" aria-label="${label}, RPE" value="${esc(set.rpe ?? '')}" placeholder="@" ${where} data-field="rpe">` : `<span class="rpeTag num"><span class="rpeText">${set.warmup ? 'W' : set.rpe ? `@${set.rpe}` : ''}</span>${lastRow ? `<button class="rowPlus" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Add a ${esc(exercise.name)} set">${ICONS.plusThin}</button>` : ''}</span>`}
      <span class="pct num">${pr ? `<span class="prPill${pr === 'est' ? ' est' : ''}">PR</span>` : ''}<span class="setPct">${best && value ? `${Math.round((value / best) * 100)}%` : ''}</span>${e1rmCell(value)}</span>
      <button class="rowX" data-action="delete-set" ${where} aria-label="Delete ${label}">×</button>
    </div></div>`;
  }).join('');
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.names.has(exercise.name);
  return `<div class="exercise${landing ? ' landing' : ''}${glowing(session.date, exercise.name) ? ' glow' : ''}">
    <div class="swipe"><button class="swipeDel" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">Delete</button> <div class="exHead swipeFace">${editing ? `<button class="minus" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}"></button>` : ''}<button class="exName" data-action="open-trend" data-name="${esc(exercise.name)}"><span class="exNameText">${esc(exercise.name)}</span>${ICONS.chevRight}</button>${exerciseIndex === 0 ? COLUMN_HEAD : ''}<button class="rowX" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">×</button></div></div>
    ${rows}
    ${editing ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}">Add set</button>` : ''}
  </div>`;
};

// One word while the AI works, whether it is a set, a whole workout or an edit.
// A note on its way: set-shaped rows that build up with a soft shimmer right where the workout will land, and a quiet
// line that it lands by itself, so nobody has to sit and watch it.
// While the AI writes: the Exodia hand breathing softly inside a clay line that runs round it, growing and shrinking.
const exoSpin = '<span class="exoSpin" aria-hidden="true"><svg viewBox="0 0 28 28"><circle class="exoTrack" cx="14" cy="14" r="12.5"/><circle class="exoSnake" cx="14" cy="14" r="12.5" pathLength="100"/></svg><img src="/logo.png" alt="" draggable="false"></span>';
const writingLine = () => `<span class="ghostHead">${exoSpin}<span class="ghostText">Writing it down…</span></span>`;
const renderPending = (item = {}) => `<div class="ghost${item.later ? ' later' : ''}" role="status">${item.later ? '<span class="ghostText">Exodia is on it in the background · lands by itself</span>' : writingLine()}${item.later ? '' : `<span class="ghostRows" aria-hidden="true"><span class="ghostName" style="--at:0ms"><i></i></span>${[1, 2].map((row) => `<span class="ghostRow setRow" style="--at:${row * 260}ms"><i></i><i class="kg"></i><i class="reps"></i><i class="e1"></i></span>`).join('')}</span><span class="ghostHint">It lands by itself. Keep logging, or look at <a href="#/trends">Trends</a>.</span>`}</div>`;
// What is on its way to a day: being read right now, or waiting in the background for the AI.
const inFlight = () => [...view.pending, ...laterJobs().map((job) => ({ date: job.date, later: true }))];

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
    ...(session.cardio ? [`${cardioLabel(session)} ${session.cardio} min`] : []),
    ...(accessoriesOf(session) ? [`Accessories ${accessoriesOf(session)} min`] : [])
  ];
  const row = ({ name, set }) => {
    return dayRow(name, dayPrKind(session, name), isBodyweightLift(name) ? (Number(set.kg) > 0 ? `+${set.kg}` : 'BW') : set.kg, set.reps, e1rmCell(estimate(bodyLoad(name, set.kg), Number(set.reps) + repsInTank(set))));
  };
  // A cardio-only day already says what and how long in its header ("Football · 90 min").
  if (!first) return session.cardio ? '' : dayRow('Nothing logged yet', false, '', '', '');
  return `${row(first)}${second ? row(second) : ''}${others.length ? `<span class="dayOthers">+ ${esc(others.join(', '))}</span>` : ''}`;
};

const renderSession = (session) => {
  const pendings = inFlight().filter((pending) => pending.date === session.date);
  const open = view.open.has(session.date) || pendings.length > 0;
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.isNew;
  const editing = view.editDay === session.date;
  return `<section class="card session${open ? ' open' : ''}${landing ? ' landing' : ''}${view.opening === session.date ? ' opening' : ''}${!open && glowing(session.date) ? ' glow' : ''}" id="session-${session.date}">
    <div class="headRow">
      ${editing ? `<div class="head">
        <span class="headName dayDate">${dayLabel(session.date)}</span>
        <label class="sr" for="label-${session.date}">Name this day</label><input id="label-${session.date}" class="dayKindInput" placeholder="${esc(dayKind(session) || 'Name this day')}" value="${esc(session.label || '')}" data-day-label="${session.date}" autocomplete="off">
        <span class="meta num">${tonnes(sessionVolume(session))}</span>
      </div>` : `<button class="head" data-action="toggle-session" data-date="${session.date}" aria-expanded="${open}">
        <span class="headName dayDate">${dayLabel(session.date)}</span>
        <span class="dayKind">${esc(dayKind(session))}</span>
        <span class="meta num">${!sessionSets(session) && session.cardio ? `${session.cardio} min` : open ? tonnes(sessionVolume(session)) : `${tonnes(sessionVolume(session))} · ${setCount(sessionSets(session))}`}</span>
      </button>`}
      ${open ? `<button class="editBtn" data-action="edit-day" data-date="${session.date}">${editing ? 'Done' : 'Edit'}</button>` : ''}
      <button class="chevBtn" data-action="toggle-session" data-date="${session.date}" aria-label="${open ? 'Collapse' : 'Expand'} ${dayLabel(session.date)}">${ICONS.chev}</button>
    </div>
    ${open && editing && view.menuEnter ? '<span class="editHint" aria-hidden="true"></span>' : ''}${open && editing ? `<div class="dayMenu${view.menuEnter ? ' enter' : ''}">
      <p class="dayMenuLabel">Move to</p>
      <div class="days scroll moveDays">${Array.from({ length: 21 }, (unused, index) => addDays(todayIso(), index - 20)).filter((iso) => iso !== session.date).map((iso) => `<button class="chip" data-action="move-day" data-date="${session.date}" data-to="${iso}"><span class="chipFace">${dayLabel(iso)}</span></button>`).join('')}<label class="chip pickDate"><span class="chipFace">${ICONS.calendar || ''}Pick a date</span><input type="date" max="${todayIso()}" value="${session.date}" data-move-from="${session.date}" aria-label="Move ${dayLabel(session.date)} to a date"></label></div>
      <button class="textBtn danger" data-action="delete-day" data-date="${session.date}">Delete day</button>
    </div>` : ''}
    ${open ? `
      ${session.exercises.map((exercise, index) => renderExercise(session, exercise, index)).join('')}
      ${pendings.map(renderPending).join('')}
      ${session.cardio ? `<div class="swipe"><button class="swipeDel" data-action="remove-cardio" data-date="${session.date}" aria-label="Delete cardio">Delete</button><div class="cardio swipeFace">${editing ? `<button class="minus" data-action="remove-cardio" data-date="${session.date}" aria-label="Delete cardio"></button>` : ''}<span>${esc(cardioLabel(session))}</span><span class="meta num">${session.cardio} min</span><button class="rowX" data-action="remove-cardio" data-date="${session.date}" aria-label="Delete cardio">×</button></div></div>` : ''}
      <div class="dayActions">
        <span class="dayAdd">${session.exercises.length ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${session.exercises.length - 1}">+ Set</button>` : ''}<button class="textBtn" data-action="open-composer" data-date="${session.date}">+ Exercise</button></span>
        <span class="dayAccLabel">Accessories</span>${[[10, '10 min'], [30, '30 min'], [60, '1 h']].map(([minutes, label]) => `<button class="chip" data-action="accessories" data-date="${session.date}" data-minutes="${minutes}" aria-pressed="${accessoriesOf(session) === minutes}" aria-label="Accessories ${label}"><span class="chipFace">${label}</span></button>`).join('')}
      </div>
      ${editing ? `<button class="textBtn logDay" data-action="log-day" data-date="${session.date}">Open in Log</button>` : ''}
      ${editing ? `<button class="deleteDay" data-action="delete-day" data-date="${session.date}">Delete this whole day</button>` : ''}` : `<div class="daySummary num" data-action="toggle-session" data-date="${session.date}">${daySummary(session)}</div>`}
  </section>`;
};

const listWithGhosts = (sessions) => {
  const ghostDates = [...new Set(inFlight().map((pending) => pending.date))].filter((date) => !sessions.some((session) => session.date === date));
  const ghosts = ghostDates.map((date) => ({ date, html: `<section class="card session open landing" id="session-${date}"><div class="head"><span class="headName">${dayLabel(date)}</span></div>${inFlight().filter((pending) => pending.date === date).map(renderPending).join('')}</section>` }));
  return [...sessions.map((session) => ({ date: session.date, html: renderSession(session) })), ...ghosts]
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

const renderHome = () => {
  const pieces = pieceProgress(todayIso());
  const complete = pieces.filter((piece) => piece.complete).length;
  const hits = exodiaHistory().hits + (view.devHit && complete < 5 ? 1 : 0) - (view.celebrating ? 1 : 0);
  const weekVolume = state.sessions.filter((session) => session.date >= addDays(todayIso(), -(EXODIA_DAYS - 1))).reduce((sum, session) => sum + sessionVolume(session), 0);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Late session?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const sessions = sortedSessions().filter((session) => session.exercises.length > 0 || session.cardio > 0);
  return `<main class="page homePage">
    <p class="eyebrow">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1 class="title${view.reveal ? ' reveal' : ''}">${exodiaHit() && !view.celebrating ? `${esc(state.name || 'You')} hit Exodia` : state.name ? greeting.replace(/\??$/, (mark) => `, ${esc(state.name)}${mark}`) : greeting}</h1>
    <section class="card exodiaCard${view.exodiaOpen ? ' open' : ''}${view.reveal ? ' reveal' : ''}${view.blue ? ' hit' : ''}" style="margin-top:20px">
      <button class="head" data-action="toggle-exodia" aria-expanded="${view.exodiaOpen}">
        <span class="headName">Exodia</span>
        <span class="exodiaHits num" aria-label="Exodia hit ${hits} times">${hits}</span>
        <span class="meta num">${complete === 5 ? 'Complete' : complete + ' of 5'} · ${tonnes(weekVolume)}</span>
        ${ICONS.chev}
      </button>
      <button class="bars" data-action="toggle-exodia" tabindex="-1" aria-hidden="true">${renderBars(pieces)}</button>
      ${view.exodiaOpen ? `<div class="rules${view.rulesEnter ? ' enter' : ''}">${pieces.map((piece) => `<div class="rule"><span><b>${piece.name}</b> <span class="muted">· ${piece.rule}</span></span><span class="muted num">${piece.complete ? 'Done' : Math.min(piece.done, piece.target) + ' of ' + piece.target}</span></div>`).join('')}<p class="empty" style="margin:8px 0 0">Heavy means your top set is at least 80% of your best. Last 10 days, any program.</p></div>` : ''}
    </section>
    <p class="section sessionsHead">Sessions${sessions[0] && !view.open.has(sessions[0].date) ? COLUMN_HEAD : ''}</p>
    <div class="list">${sessions.length || inFlight().length ? listWithGhosts(sessions.slice(0, 30)) : quickStart()}</div>
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
  if (usable.length < 2 || parseIso(usable.at(-1).date) - parseIso(usable[0].date) < 183 * 86400000) return usable;
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
  ${picked ? `<p class="pickInfo num"><b>${dayLabel(picked.date)}</b> · <span class="nw">${picked.top.kg} × ${picked.top.reps}</span>${picked.top.rpe ? ` @ RPE ${picked.top.rpe}` : ''} · <span class="nw">est. ${Math.round(picked.sessionEstimate)}&nbsp;kg${picked.from && (picked.from.kg !== picked.top.kg || picked.from.reps !== picked.top.reps) ? ` from ${picked.from.kg} × ${picked.from.reps}` : ''}</span>${picked.isPr ? ' · 1RM PR' : ''}</p>` : ''}
  <div class="axis num"><span>${dayLabel(rows[0].date)}</span><span>${dayLabel(rows.at(-1).date)}</span></div>`;
};

const MUSCLES = [
  ['chest', 'Chest'], ['traps', 'Traps'], ['upperBack', 'Upper back'], ['lowerBack', 'Lower back'], ['quads', 'Quads'], ['hamstrings', 'Hamstrings'], ['shoulders', 'Shoulders'], ['biceps', 'Biceps'],
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
  [/upright|face pull/, ['shoulders'], ['traps']],
  [/overhead|ohp|shoulder|military|arnold|lateral|delt|front raise/, ['shoulders'], ['triceps']],
  [/bench|chest|push.?up|fly|flye|pec|incline|decline|press/, ['chest'], ['shoulders', 'triceps']],
  [/row/, ['upperBack'], ['biceps', 'traps']],
  [/pull.?up|chin.?up|pulldown|\blat\b/, ['upperBack'], ['biceps']],
  [/crunch|sit.?up|plank|\babs?\b|leg raise|core|oblique/, ['abs']],
  [/wrist|forearm|farmer|grip/, ['forearms']],
];
let anatomy = null;
const loadAnatomy = () => {
  if (anatomy) return;
  anatomy = 'loading';
  fetch('/anatomy.json').then((response) => response.json()).then((data) => { anatomy = data; if (view.route === 'trends') render(); }).catch(() => { anatomy = null; });
};
// Days until a muscle is recovered. After that it keeps a light tint until it drops out of the 7 days.
const RECOVERY_DAYS = { quads: 6, hamstrings: 6, glutes: 6, adductors: 5, lowerBack: 5, upperBack: 4, traps: 4, chest: 3, shoulders: 3, biceps: 3, triceps: 3, calves: 3, forearms: 4, abs: 4 };
const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00`) - new Date(`${from}T12:00`)) / 86400000);
const muscleLoad = () => {
  const today = todayIso();
  const since = addDays(today, -6);
  const sets = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const fatigue = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const fresh = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  for (const session of state.sessions) {
    if (session.date < since || session.date > today) continue;
    const left = (key) => Math.max(0, 1 - Math.max(0, daysBetween(session.date, today) - 0.5) / RECOVERY_DAYS[key]);
    for (const exercise of session.exercises) {
      const rule = MUSCLE_RULES.find(([pattern]) => pattern.test(exercise.name.toLowerCase()));
      if (!rule) continue;
      const count = validSets(exercise).filter((set) => !set.warmup).length;
      for (const [keys, share] of [[rule[1], 1], [rule[2] ?? [], 0.5]]) {
        for (const key of keys) {
          sets[key] += count * share;
          fatigue[key] += count * share * left(key);
          if (count * share >= 1) fresh[key] = Math.max(fresh[key], left(key) * (share < 1 ? 0.75 : 1));
        }
      }
    }
  }
  return { sets, fatigue, fresh };
};
// Strong while a muscle recovers and only fading near the end, then a light tint until 7 days have passed.
const muscleStrength = ({ sets, fresh }, key) => (!sets[key] ? 0 : fresh[key] > 0 ? 0.38 + 0.62 * fresh[key] : 0.24);
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
  traps: { deadlift: 0.75, 'bent-over-row': 0.25 },
  biceps: { 'pull-ups': 0.6, 'bent-over-row': 0.4 },
  lowerBack: { deadlift: 0.7, squat: 0.2, 'bent-over-row': 0.1 },
  quads: { squat: 1 },
  glutes: { squat: 0.5, deadlift: 0.5 },
  hamstrings: { deadlift: 0.7, squat: 0.3 },
  forearms: { deadlift: 0.5, 'bent-over-row': 0.3, 'pull-ups': 0.2 },
  adductors: { squat: 0.6, deadlift: 0.4 }
};
// The same five colours as --tierBeg … in styles.css (SVG gradients need the values).
const TIER_COLOURS = { tierBeg: '#BDB7AA', tierNov: '#A9C4A6', tierInt: '#A88FB5', tierAdv: '#C96442', tierElite: '#7CA3DD' };
// The level key, the same under the anatomy and under the strength web: the level's number in its colour, then its name.
// Tap a level (or the i) for what each level means; it opens under the key that was tapped.
const LEVEL_WHAT = ['Does the movement right, about a month in', 'Has trained it regularly for 6 months', 'Has trained it regularly for 2 years', 'More than 5 years of steady progress', 'Years spent competing in strength sport'];
const levelKey = (where) => {
  const open = view.levelInfo?.where === where ? view.levelInfo.level : null;
  const keys = [['tierBeg', 'Beginner'], ['tierNov', 'Novice'], ['tierInt', 'Intermediate'], ['tierAdv', 'Advanced'], ['tierElite', 'Elite']];
  return `<div class="levelKeyBox"><p class="levelKey">${keys.map(([tier, name], index) => `<button class="levelKeyItem" data-action="level-info" data-where="${where}" data-level="${index + 1}" aria-pressed="${open === index + 1}"><b class="${tier}">${index + 1}</b>${name}</button>`).join('')}<button class="infoBtn" data-action="level-info" data-where="${where}" data-level="0" aria-expanded="${open !== null}" aria-label="What the levels mean">i</button></p></div>
    ${open === null ? '' : `<div class="levelInfo" role="note"><p class="levelInfoIntro">The share of people training each lift that a level is stronger than, for your bodyweight and sex.</p>
      <div class="levelRows">${keys.map(([tier, name], index) => `<p class="levelRow${open === index + 1 ? ' on' : ''}"><b class="${tier}">${index + 1}</b><span class="levelName">${name}</span><span class="levelBeats num">Beats ${Math.round(LEVEL_BEATS[index] * 100)}%</span><span class="levelWhat">${LEVEL_WHAT[index]}</span></p>`).join('')}</div>
      <p class="levelInfoNote">Strength Level, 6.4 million checked lifts, 2015–2026. Past Elite, Exodia counts raw meet results instead (OpenPowerlifting).</p></div>`}`;
};
const STRENGTH_TIERS = [[5, 'Elite', 'tierElite', 'Elite'], [4, 'Advanced', 'tierAdv', 'Adv.'], [3, 'Intermediate', 'tierInt', 'Int.'], [2, 'Novice', 'tierNov', 'Nov.'], [0.01, 'Beginner', 'tierBeg', 'Beg.']];
const muscleLevels = () => {
  const body = state.body;
  if (!body?.kg || !body?.sex) return null;
  const scores = Object.fromEntries(WEB_LIFTS.map((lift) => {
    const result = liftStrength(lift, body);
    return [lift.key, result.score || result.everScore || 0];
  }));
  return Object.fromEntries(MUSCLES.map(([key]) => {
    const parts = Object.entries(MUSCLE_LIFTS[key] || {}).filter(([lift]) => scores[lift] > 0);
    const weight = parts.reduce((sum, [, share]) => sum + share, 0);
    return [key, weight ? parts.reduce((sum, [lift, share]) => sum + scores[lift] * share, 0) / weight : 0];
  }));
};
const tierOf = (level) => STRENGTH_TIERS.find(([from]) => level >= from) || null;
// The head turns into Exodia's hand once the whole body is there: orange when every muscle with a level is at least
// Advanced, Exodia blue when every one is at least Elite; until then a normal head. Abs and calves have no standard
// lift, so they don't count. Front shows the hand with its eye, the back the hand alone. Drawn as a colour through
// a mask of the logo, so its lines stay lighter like the real one.
const headTier = () => {
  const levels = muscleLevels();
  if (!levels) return null;
  // Every muscle a standard lift trains counts; one not trained at all keeps the head normal.
  const lowest = Math.min(...Object.keys(MUSCLE_LIFTS).map((key) => levels[key] || 0));
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
    return `<polygon points="${points}" class="${!key ? 'bodyBone' : tier ? `bodyTier ${tier[2]}` : 'bodyRest'}"/>`;
  }
  const strength = key ? muscleStrength(load, key) : 0;
  return `<polygon points="${points}" class="${!key ? 'bodyBone' : strength ? 'bodyHit' : 'bodyRest'}"${strength ? ` style="fill-opacity:${strength.toFixed(2)}"` : ''}/>`;
}).join('')}</svg>`;
const renderMuscles = () => {
  loadAnatomy();
  if (!anatomy || anatomy === 'loading') return '';
  headTierNow = headTier();
  const load = muscleLoad();
  const { sets } = load;
  const levels = view.muscleMode === 'strength' ? muscleLevels() : null;
  const toggle = `<div class="segment full" role="group" aria-label="Show">${[['strength', 'Strength'], ['recovery', 'Recovery']].map(([mode, label]) => `<button class="segmentOption" data-action="muscle-mode" data-mode="${mode}" aria-pressed="${(view.muscleMode || 'strength') === mode}">${label}</button>`).join('')}<i class="segmentKnob${view.muscleMode === 'recovery' ? ' on' : ''}" aria-hidden="true"></i></div>`;
  if (view.muscleMode === 'strength') {
    return `<p class="section">Anatomy</p>${toggle}
    ${levels ? `<div class="muscles">${bodySvg('front', load, levels)}${bodySvg('back', load, levels)}
      <div class="muscleList">${MUSCLES.map(([key, label]) => {
        const tier = tierOf(levels[key] || 0);
        return `<div class="muscleRow${tier ? '' : ' muted'}"><i class="muscleSwatch ${tier ? tier[2] : 'tierNone'}"></i><span>${label}</span><span class="num tierWord" title="${tier ? tier[1] : ''}">${tier ? `<span class="tierLong">${tier[1]}</span><span class="tierShort">${tier[3]}</span> <span class="tierNum">${Math.min(levels[key], 9.9).toFixed(1)}</span>` : '–'}</span></div>`;
      }).join('')}</div>
    </div>
    ${levelKey('body')}`
    : `${bodyForm('Add your bodyweight to see your strength across your anatomy')}<div class="muscles emptyLevels">${bodySvg('front', load, {})}${bodySvg('back', load, {})}
      <div class="muscleList">${MUSCLES.map(([, label]) => `<div class="muscleRow muted"><i class="muscleSwatch tierNone"></i><span>${label}</span><span class="num tierWord">–</span></div>`).join('')}</div>
    </div>`}`;
  }
  return `<p class="section">Anatomy</p>${toggle}
    <div class="muscles">${bodySvg('front', load)}${bodySvg('back', load)}
      <div class="muscleList">${MUSCLES.map(([key, label]) => `<div class="muscleRow${sets[key] ? '' : ' muted'}"><i class="muscleSwatch" style="opacity:${muscleStrength(load, key) || 1}"></i><span>${label}</span><span class="num">${Math.round(sets[key])}</span></div>`).join('')}</div>
    </div>
    <p class="muscleNote">Sets in the last 7 days. Red means still recovering.</p>`;
};

// Days in the range where this lift set a PR (a heavier single or a new estimated max).
const prCount = (name, since) => state.sessions.filter((session) => session.date >= since && session.exercises.some((exercise) => exercise.name === name && validSets(exercise).some((set) => prKind(name, session.date, set)))).length;

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
  return `${action === 'pick-trend' ? '<p class="liftHead"><span>Best lifts</span><span class="liftHint">Tap one to show it on the chart</span></p>' : ''}<div class="liftList">${visible.map((name, index) => `<button class="liftItem" data-action="${action}" data-name="${esc(name)}"${index >= 3 ? ' data-scroll="1"' : ''} aria-pressed="${current === name}"><span class="liftDot" aria-hidden="true"></span><span class="liftItemName">${esc(name)}</span>${current === name ? '<span class="onChart">On chart</span>' : ''}<span class="liftItemBest">${liftKg(name)}</span></button>`).join('')}</div>
    ${all.length > first ? `<button class="liftExpand" data-action="trend-more" aria-expanded="${Boolean(view.trendMore)}">${view.trendMore ? 'Show fewer' : `Show all ${all.length} lifts`}${ICONS.chev}</button>` : ''}`;
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
    <p class="eyebrow">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1 class="title">Trends</h1>
    ${names.length ? `<div class="list">${card(view.trendOpen).replace(/<\/section>\s*$/, `${liftPicker(big, rest, history)}</section>`)}</div>` : `<p class="section">Big 3</p><div class="list">${BIG_THREE.map(emptyLift).join('')}</div>`}
    ${renderMuscles()}
    ${desktopQuery.matches ? '' : `${renderStrength()}${renderVolume()}`}
    ${renderCalendar()}
    ${desktopQuery.matches ? '' : renderImpressive()}
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

// Who read a message: Marcus sees the exact model ("Gemini 3.8 Flash"), everyone else just "Exodia".
const engineName = (engine) => {
  if (!engine) return '';
  if (!view.isAdmin) return 'Exodia';
  if (engine === 'phone') return 'the phone, no AI';
  if (engine === 'claude') return 'Claude';
  if (engine === 'add') return 'Exodia import';
  const gemini = engine.match(/^gemini-(.+?)(-lite)?$/);
  return gemini ? `Gemini ${gemini[1].split('-').map((part) => (/^\d/.test(part) ? part : part[0].toUpperCase() + part.slice(1))).join(' ')}${gemini[2] ? '-Lite' : ''}` : engine;
};
const chatEntry = ({ stamp, who, said, heard, voice, did, raw, by, fixIndex: index, voiceId, compact, manual, theirs, laterId, fresh }) => {
  const fixIndex = manual ? undefined : index;
  const handled = engineName(by || (raw && /"engine":"([^"]+)"/.exec(raw)?.[1]) || '');
  const lines = [].concat(did);
  const failed = OFF_LINE.test(lines[0] || '');
  const off = lines.some((line) => OFF_LINE.test(line));
  // A voice note says so on top, with what was heard under it, so a failed one still shows the words.
  const spoken = voice || (heard && heard === said) || (voiceId && said !== 'Voice note');
  const youSaid = `${spoken ? '<span class="bubbleKind">Voice note</span>' : ''}${esc(said)}${heard && heard !== said ? `<span class="bubbleHeard">Heard: ${esc(heard)}</span>` : ''}${off && fixIndex !== undefined ? `<span class="bubbleHint">${failed ? 'Didn’t go through' : 'Partly logged'} · tap to edit</span>` : ''}`;
  // In Admin, other people's messages sit on the left under their own name, so they never look like Marcus's.
  return `<div class="chatItem${off ? ' off' : ''}${theirs ? ' theirs' : ''}${fresh ? ' fresh' : ''}">
  ${theirs ? `${stamp ? `<p class="chatTime">${stamp}</p>` : ''}<p class="chatWho">${esc(who || 'Someone')}</p>` : stamp || who ? `<p class="chatTime">${[stamp, who && esc(who)].filter(Boolean).join(' · ')}</p>` : ''}
  ${fixIndex === undefined ? `<div class="bubbleIn">${youSaid}</div>` : `<button class="bubbleIn" data-action="edit-said" data-index="${fixIndex}">${youSaid}</button>`}
  <div class="bubbleOut"><p>${laterId && laterJobs().some((job) => job.id === laterId) ? `<span class="ghostText">${esc(lines.join(' · '))}</span>` : esc(lines.join(' · '))}</p>${handled && !failed ? `<p class="handledBy">Handled by ${esc(handled)}</p>` : ''}${compact ? '' : rawDetails(raw)}${voiceId ? `<button class="textBtn" data-action="retry-voice" data-voice="${voiceId}">Try again</button>` : failed && fixIndex !== undefined && said !== 'Voice note' ? `<button class="textBtn" data-action="retry-said" data-index="${fixIndex}">Try again</button>` : ''}${failed && fixIndex !== undefined && /Didn't understand/.test(lines[0]) && said.split(/\s+/).length >= 8 ? `<button class="textBtn" data-action="said-feedback" data-index="${fixIndex}">Send as feedback</button>` : ''}${failed && fixIndex !== undefined && view.isAdmin && said !== 'Voice note' ? `<button class="textBtn" data-action="said-builder" data-index="${fixIndex}">Ask Exodia builder</button>` : ''}</div>
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
    ${session ? `${session.exercises.map((exercise) => `<div class="dayNowRow"><span class="dayNowName">${esc(exercise.name)}</span><span class="dayNowSets num">${exercise.sets.map((set) => `${set.kg}×${set.reps}${set.rpe ? ` @${set.rpe}` : ''}${set.warmup ? ' w' : ''}`).join(' · ')}</span></div>`).join('')}${session.cardio ? `<div class="dayNowRow"><span class="dayNowName">${esc(cardioLabel(session))}</span><span class="dayNowSets num">${session.cardio} min</span></div>` : ''}${accessoriesOf(session) ? `<div class="dayNowRow"><span class="dayNowName">Accessories</span><span class="dayNowSets num">${accessoriesOf(session)} min</span></div>` : ''}${session.label ? `<div class="dayNowRow"><span class="dayNowName">Name</span><span class="dayNowSets">${esc(session.label)}</span></div>` : ''}` : '<p class="empty" style="margin:6px 0">Nothing logged on this day.</p>'}
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

const loadAdmin = () => fetch('/api/admin', { headers: { 'x-exodia-key': syncState.profile } })
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Not allowed'))))
  .then((data) => {
    view.adminRows = Array.isArray(data?.commands) ? data.commands : [];
    view.adminFeedback = data?.feedback || [];
    view.adminBuilders = data?.builders || [];
    view.adminBuilder = data?.builder || 1;
    view.adminError = '';
  })
  .catch((error) => {
    view.adminRows = [];
    view.adminError = navigator.onLine === false ? 'No internet, so the list could not load.' : `The list could not load (${error.message}).`;
  })
  .finally(() => {
    if (view.route === 'admin') {
      render();
      scrollPage(scroller().scrollHeight);
    }
  });

const FEEDBACK_EXAMPLES = ['The mic stopped after a minute', 'Add a rest timer between sets', 'Let me log my body weight', 'Trends should show my squat first', 'The app froze when I pasted my notes'];

const renderFeedback = () => `<main class="page">
    <p class="eyebrow">Ideas and bugs</p>
    <h1 class="title">Feedback</h1>
    <p class="feedbackLead">Missing something, or did something break? Say it or type it in the box below, any way you like. Exodia writes it up and sends it to Marcus, who reads every one and decides what gets built.</p>
    <div class="chat">${(state.feedback || []).map((item) => `<div class="chatItem"><div class="bubbleIn">${esc(item.said)}</div><div class="bubbleOut"><p>Sent to Marcus · ${item.kind === 'bug' ? 'Bug' : 'Idea'}: ${esc(item.title)}</p></div></div>`).join('')}${view.pending.filter((pending) => pending.feedback).map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div><div class="bubbleOut typing" role="status" aria-label="Sending"><i></i><i></i><i></i></div></div>`).join('')}</div>
  </main>`;

const sendFeedback = async (text, voice) => {
  const pending = { feedback: true, date: todayIso(), text: text || 'Voice note' };
  view.pending.push(pending);
  view.draft = '';
  if (!desktopQuery.matches) document.activeElement?.blur();
  render();
  closeTray();
  try {
    const audio = voice ? await wavBase64(voice) : undefined;
    const response = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, audio, name: state.name || '', ...(view.sandbox ? { dry: true } : {}) }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Could not send that. Try again.');
    state.feedback = [...(state.feedback || []), { at: Date.now(), said: body.said, kind: body.kind, title: body.title }].slice(-50);
    addLog(body.said, [`Sent feedback to Marcus: ${body.title}`], { manual: true });
    view.toast = { kind: 'rep', title: 'Sent to Marcus', text: body.title };
    clearTimeout(view.toastTimer);
    view.toastTimer = setTimeout(clearToast, 5000);
  } catch (error) {
    view.draft = text;
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
let bannerTimer = 0;
let bannerSeen = 0;
const buildBanner = () => {
  const run = buildingNow();
  clearTimeout(bannerTimer);
  if (!run) return '';
  bannerTimer = setTimeout(render, run.at + BUILD_MAX - Date.now() + 500);
  const seen = bannerSeen === run.at;
  bannerSeen = run.at;
  return `<div class="buildBanner${seen ? ' still' : ''}" role="status"><span class="buildDot"></span><div class="toastWords"><p class="toastTitle">Exodia is on it</p><p class="toastText">${esc(run.said.slice(0, 80))}</p></div></div>`;
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
  leftLoaded = 0;
  loadLeft();
});
const loadLeft = () => {
  if (!view.isAdmin || Date.now() - leftLoaded < 30000) return;
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
const renderLeft = () => {
  const items = view.isAdmin ? leftItems() : [];
  const feedback = view.isAdmin ? newFeedback() : [];
  if (!items.length && !feedback.length) return '';
  return `<button class="leftPill" data-action="toggle-left" aria-expanded="${Boolean(view.leftOpen)}"><span class="leftDot" aria-hidden="true"></span>${items.length + feedback.length}<span class="leftWord"> left</span></button>
    ${view.leftOpen ? `<button class="leftScrim" data-action="toggle-left" aria-label="Close"></button><section class="leftPanel" aria-label="Waiting on you">
      <p class="leftHead">Waiting on you</p>
      ${feedback.map((item) => `<div class="leftItem${view.leftItem === `f${item.id}` ? ' open' : ''}">
        <button class="leftTitle" data-action="left-item" data-index="f${item.id}" aria-expanded="${view.leftItem === `f${item.id}`}">${esc(item.who)}: ${esc(item.title)}<span class="leftTag">${item.kind === 'bug' ? 'Bug' : 'Feedback'}</span></button>
        ${view.leftItem === `f${item.id}` ? `<div class="leftBody"><p>${esc(item.details)}</p><p class="leftWhen">${new Date(item.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p><div class="leftAnswer"><button class="chip" data-action="feedback-claude" data-id="${item.id}"><span class="chipFace">Build it</span></button><button class="chip" data-action="feedback-status" data-id="${item.id}" data-status="declined"><span class="chipFace">Not now</span></button></div></div>` : ''}
      </div>`).join('')}
      ${items.map((item, index) => `<div class="leftItem${view.leftItem === index ? ' open' : ''}">
        <button class="leftTitle" data-action="left-item" data-index="${index}" aria-expanded="${view.leftItem === index}">${inlineMd(item.title.replace(/^Decide:\s*/i, '').replace(/^\p{Ll}/u, (letter) => letter.toUpperCase()))}${item.decide ? '<span class="leftTag">Decide</span>' : ''}</button>
        ${view.leftItem === index ? `<div class="leftBody">${item.why ? `<p>${inlineMd(item.why)}</p>` : ''}${item.steps.length ? `<ol>${item.steps.map((step) => `<li>${inlineMd(step)}</li>`).join('')}</ol>` : ''}<div class="leftAnswer">${item.decide ? `<button class="chip" data-action="left-answer" data-index="${index}" data-answer="yes"><span class="chipFace">Yes</span></button><button class="chip" data-action="left-answer" data-index="${index}" data-answer="no"><span class="chipFace">No</span></button>` : ''}<button class="chip" data-action="left-reply" data-index="${index}"><span class="chipFace">Reply</span></button></div></div>` : ''}
      </div>`).join('')}
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
  view.toast = { kind: 'rep', title: 'Exodia is on it', text: text.slice(0, 80) };
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 5000);
  return run;
};

const sendToClaude = async (text, voice) => {
  view.draft = '';
  if (!desktopQuery.matches) document.activeElement?.blur();
  closeTray();
  // The request is on screen before anything is sent; a voice note shows as "Voice note" until its words are in.
  const run = { at: Date.now(), said: text || 'Voice note…', status: 'sending' };
  state.claudeRuns = [run, ...(state.claudeRuns || [])].slice(0, 20);
  addLog(run.said, ['Sending to Exodia builder…'], { manual: true, merge: `claude-${run.at}` });
  save();
  render();
  let ask = text;
  try {
    if (voice) {
      const response = await fetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio: await wavBase64(voice) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.text) throw new Error(body.error || 'Could not hear that. Try again.');
      ask = [text, body.text].filter(Boolean).join(' ');
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
  const response = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, name: state.name || '', ...(view.sandbox ? { dry: true } : {}) }) });
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
const SHARE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/></svg>';
// Everyone shares the plain /join link (a fresh, empty Exodia). Only Marcus can put a name in it.
const shareCard = () => {
  const link = inviteLink(view.isAdmin ? view.shareName || '' : '');
  const named = view.isAdmin && Boolean((view.shareName || '').trim());
  return `<section class="card">
    ${view.isAdmin ? `<div class="row"><label class="sr" for="shareName">Their name</label><input id="shareName" class="pill" style="flex:1;width:auto;text-align:left;font-weight:400;font-size:15px" autocomplete="off" placeholder="Their name (optional)" value="${esc(view.shareName || '')}" data-share-name></div>` : ''}
    <div class="row"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px">${esc(link)}</span><button class="textBtn" data-action="copy-invite">${view.copiedInvite ? 'Copied' : 'Copy'}</button><button class="textBtn shareBtn" data-action="share-invite" aria-label="Share">${SHARE_ICON}Share</button></div>
  </section>
  <p class="note">${named ? 'Opens Exodia with their name already in.' : 'Anyone who opens it gets their own empty Exodia.'}</p>`;
};

const renderAdmin = () => {
  // Your change requests show straight away; only the server lists below wait for loading.
  if (!view.adminRows && !view.adminLoading) {
    view.adminLoading = true;
    loadAdmin().finally(() => {
      view.adminLoading = false;
    });
  }
  return `<main class="page">
    <p class="eyebrow">Only visible to you</p>
    <h1 class="title">Admin</h1>
    <p class="section">Change the app</p>
    <p class="feedbackLead">Say or type a change in the box below. It shows here at once, with how it's going.</p>
    ${(view.adminBuilders || []).length > 1 ? `<div class="builderRow"><span class="builderLabel">Built with</span><div class="segment full builderSwitch" role="group" aria-label="Claude account that builds">${view.adminBuilders.map((builder) => `<button class="segmentOption" data-action="pick-builder" data-slot="${builder.slot}" aria-pressed="${view.adminBuilder === builder.slot}"${builder.ready ? '' : ' disabled'}>Account ${builder.slot}${builder.ready ? '' : ' · not set up'}</button>`).join('')}</div></div><p class="feedbackMeta">If that account can't start, the other one is tried.</p>` : ''}
    ${view.adminError ? `<p class="feedbackMeta"><span class="runFailed">${esc(view.adminError)}</span> <button class="textBtn" data-action="admin-reload">Try again</button></p>` : ''}
    ${(state.claudeRuns || []).slice(0, 20).map((run) => `<div class="feedbackRow"><p class="feedbackDetails">${esc(run.said)}</p><p class="feedbackMeta">${runStatus(run)} · ${new Date(run.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${run.url ? ` · <a href="${esc(run.url)}" target="_blank" rel="noopener">Watch Exodia</a>` : ''}</p></div>`).join('')}
    <p class="section">Invite someone</p>
    ${shareCard()}
    <p class="section">Feedback</p>
    ${(view.adminFeedback || []).map((item) => `<div class="feedbackRow">
      <p class="feedbackHead"><span class="${item.kind === 'bug' ? 'prPill' : 'prPill est'}">${item.kind === 'bug' ? 'Bug' : 'Idea'}</span><b>${esc(item.title)}</b></p>
      <p class="feedbackDetails">${esc(item.details)}</p>
      <p class="feedbackMeta">${esc(item.who)} · ${new Date(item.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
      <div class="feedbackStatus">${FEEDBACK_STATUS.map(([value, label]) => `<button class="chip" data-action="feedback-status" data-id="${item.id}" data-status="${value}" aria-pressed="${item.status === value}"><span class="chipFace">${label}</span></button>`).join('')}<button class="chip" data-action="feedback-claude" data-id="${item.id}"><span class="chipFace">Build it</span></button></div>
    </div>`).join('') || '<p class="empty">No feedback yet.</p>'}
    <p class="section">Every command</p>
    <div class="chat">${!view.adminRows ? '<p class="empty">Loading every command…</p>' : view.adminRows.slice().reverse().map((row, index, rows) => chatEntry({ ...row, stamp: chatStamp(row.at, rows[index - 1]?.at), theirs: !row.mine })).join('') || '<p class="empty">No commands yet.</p>'}</div>
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
    <p class="section">Share Exodia</p>
    ${shareCard()}
    <p class="section">Add from any AI</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;font-size:15px">Let ChatGPT, Gemini or Claude add your training</span><button class="textBtn" data-action="copy-ai">${view.copiedAi ? 'Copied' : 'Copy instructions'}</button></div>
    </section>
    <p class="section">${view.isAdmin ? 'Your private link' : 'Sync'}</p>
    <section class="card">
      ${view.isAdmin ? `<div class="row"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px">${esc(profileLink())}</span><button class="textBtn" data-action="copy-link">${view.copied ? 'Copied' : 'Copy'}</button></div>
      <div class="row"><label class="sr" for="join-link">Link from another device</label><input id="join-link" class="pill" style="flex:1;width:auto;text-align:left;font-weight:400;font-size:15px" placeholder="Paste a link from another device"><button class="textBtn" data-action="join-link">Use</button></div>` : ''}
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
  const best = new Map();
  const single = new Map();
  const seen = new Map();
  const before = (map, name) => Math.max(0, ...countsFor(name).map((other) => map.get(other) || 0));
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    let pr = false;
    const today = [];
    for (const exercise of session.exercises) {
      const sets = validSets(exercise).filter((set) => !set.warmup);
      if (!sets.length) continue;
      const topEstimate = Math.max(...sets.map(setEstimate));
      const topSingle = Math.max(0, ...sets.filter((set) => Number(set.reps) === 1).map((set) => Number(set.kg)));
      // Same rule as the PR badges: only after three earlier days of the lift, and only against logged sets.
      if (before(seen, exercise.name) >= 3 && (topSingle > before(single, exercise.name) || topEstimate > before(best, exercise.name) + 0.01)) pr = true;
      today.push([exercise.name, topEstimate, topSingle]);
    }
    for (const [name, topEstimate, topSingle] of today) {
      best.set(name, Math.max(best.get(name) || 0, topEstimate));
      single.set(name, Math.max(single.get(name) || 0, topSingle));
      seen.set(name, (seen.get(name) || 0) + 1);
    }
    const known = days.get(session.date);
    days.set(session.date, { volume: (known?.volume || 0) + sessionVolume(session), pr: Boolean(known?.pr || pr) });
  }
  // Four shades by your own heavy and light days, so it reads the same for a beginner and for you.
  const volumes = [...days.values()].map((day) => day.volume).filter(Boolean).sort((first, second) => first - second);
  const cut = (share) => volumes[Math.floor((volumes.length - 1) * share)] || 0;
  return { days, steps: [cut(0.25), cut(0.5), cut(0.75)] };
});
const renderCalendar = () => {
  if (!state.sessions.length) return '';
  const { days, steps } = calendarDays();
  const today = todayIso();
  const monday = (iso) => addDays(iso, -((parseIso(iso).getDay() + 6) % 7));
  const first = [...days.keys()].sort()[0];
  const start = monday([first, addDays(today, -364)].sort()[0]);
  const weeks = [];
  for (let week = start; week <= today; week = addDays(week, 7)) weeks.push(week);
  const since = addDays(today, -364);
  const lastYear = [...days.keys()].filter((date) => date >= since && date <= today).length;
  const cells = weeks.map((week, index) => {
    const month = parseIso(week).getMonth();
    const newMonth = index === 0 || parseIso(weeks[index - 1]).getMonth() !== month;
    const label = newMonth ? (month === 0 ? week.slice(0, 4) : 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[month]) : '';
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const date = addDays(week, offset);
      if (date > today) return '<i class="calDay future"></i>';
      const day = days.get(date);
      if (!day) return `<i class="calDay" title="${dayLabel(date)}"></i>`;
      const shade = day.volume > steps[2] ? 4 : day.volume > steps[1] ? 3 : day.volume > steps[0] ? 2 : 1;
      const text = `${dayLabel(date)} · ${tonnes(day.volume)}${day.pr ? ' · PR' : ''}`;
      return `<button class="calDay ${day.pr ? 'pr' : `shade${shade}`}" data-action="jump-session" data-date="${date}" title="${text}" aria-label="${text}, open"></button>`;
    }).join('');
    return `<span class="calMonth">${label}</span>${daysOfWeek}`;
  }).join('');
  return `<p class="section calHead">Every session <span class="calCount num">${lastYear} in the last 12 months</span></p>
    <section class="card calCard">
      <div class="calWrap">
        <div class="calWeekdays" aria-hidden="true"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>
        <div class="calScroll"><div class="calGrid" role="group" aria-label="Training days, newest on the right">${cells}</div></div>
      </div>
      <p class="calKey"><span>Lighter</span><i class="calDay shade1"></i><i class="calDay shade2"></i><i class="calDay shade3"></i><i class="calDay shade4"></i><span>Heavier</span><i class="calDay pr calKeyPr"></i><span>PR</span></p>
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
    female: [[60, 0.5, 1, 6, 12, 19]]
  }
};
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
const WEB_LIFTS = [
  { label: 'Squat', key: 'squat', names: ['squat', 'back squat'] },
  { label: 'Bench', key: 'bench-press', names: ['bench press'] },
  { label: 'Incline bench', key: 'incline-bench-press', names: ['incline bench press', 'incline bench'] },
  { label: 'Overhead', key: 'shoulder-press', names: ['overhead press', 'shoulder press', 'military press', 'ohp'] },
  { label: 'Pull-up', key: 'pull-ups', names: ['pull-up', 'pull up', 'pullup', 'chin-up', 'chin up', 'weighted pull-up', 'weighted pull up', 'weighted chin-up'], reps: true },
  { label: 'Row', key: 'bent-over-row', names: ['barbell row', 'bent over row', 'pendlay row'] },
  { label: 'Deadlift', key: 'deadlift', names: ['deadlift'] }
];
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
const levelWord = (score) => (score >= 5.25 ? 'Elite\u2009+' : score >= 1 ? LEVELS[Math.min(5, Math.floor(score)) - 1] : score > 0 ? 'Below Beginner' : '');
// Now = best estimated 1RM of the last 3 months; all time = the best ever (logged sets and saved bests).
const STRENGTH_NOW_DAYS = 90;
const liftStrength = (lift, body) => {
  const since = addDays(todayIso(), -STRENGTH_NOW_DAYS);
  let now = 0;
  let ever = 0;
  for (const session of state.sessions) {
    for (const exercise of session.exercises) {
      if (!lift.names.includes(exercise.name.toLowerCase())) continue;
      for (const set of validSets(exercise)) {
        // Pull-ups: bodyweight + added kg, as a one-rep max, against the reps table turned into the same kind of number.
        const value = lift.reps ? (set.warmup ? 0 : estimate(body.kg + Number(set.kg || 0), Number(set.reps) + repsInTank(set))) : setEstimate(set);
        if (value > ever) ever = value;
        if (session.date >= since && value > now) now = value;
      }
    }
  }
  if (!lift.reps) for (const [name, kg] of Object.entries(state.bests || {})) if (lift.names.includes(name.toLowerCase()) && Number(kg) > ever) ever = Number(kg);
  const table = standardAt(STANDARDS[lift.key]?.[body.sex], body.kg);
  const marks = table && lift.reps ? table.map((reps) => (reps >= 1 ? estimate(body.kg, reps) : body.kg * 0.95)) : table;
  return { ...lift, value: now, ever, marks, score: levelScore(now, marks), everScore: levelScore(ever, marks) };
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
const renderStrength = () => {
  if (!Object.keys(STANDARDS).length) return '';
  // No bodyweight yet: the web shows empty with the form on it, so it's clear what to fill in (one saved on another
  // device arrives with the first sync and the form goes away by itself).
  const known = Boolean(state.body?.kg && state.body?.sex);
  const body = known ? state.body : { kg: 80, sex: 'male' };
  const askBody = !known || view.bodyEdit;
  const lifts = known ? WEB_LIFTS.map((lift) => liftStrength(lift, body)).filter((lift) => lift.marks) : WEB_LIFTS.map((lift) => ({ ...lift, value: 0, ever: 0, score: 0, everScore: 0, marks: [1] }));
  if (lifts.length < 3) return '';
  const top = Math.max(5, ...lifts.map((lift) => Math.max(lift.score, lift.everScore)));
  // Elite is the outer coloured ring; the spokes run a little past it, further if you go past Elite.
  const outer = Math.min(8, Math.max(5.6, top + 0.25));
  const size = 320;
  const middle = size / 2;
  const radius = 118;
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
  // A lift not done lately keeps its all-time place in the shape (its corner says "all time"), rather than falling to zero.
  const shownScore = (lift) => (lift.value ? lift.score : lift.everScore);
  const corners = lifts.map((lift, index) => point(index, Math.max(0.15, shownScore(lift))));
  const everCorners = lifts.map((lift, index) => point(index, Math.max(0.15, lift.everScore)));
  // The picture is as wide as its words: long level names on a side corner widen it instead of being cut off.
  let [left, right] = [-6, size + 6];
  const labels = lifts.map((lift, index) => {
    const [x, y] = [middle + Math.cos(angle(index)) * (radius + 28), middle + Math.sin(angle(index)) * (radius + 28)];
    const anchor = Math.abs(x - middle) < 8 ? 'middle' : x > middle ? 'start' : 'end';
    const wide = Math.max(textWidth(lift.label, '600 18px'), textWidth(`■ ${levelWord(shownScore(lift))} 0.0`, '500 15px'));
    const [from, to] = anchor === 'middle' ? [x - wide / 2, x + wide / 2] : anchor === 'start' ? [x, x + wide] : [x - wide, x];
    [left, right] = [Math.min(left, from - 4), Math.max(right, to + 4)];
    // Not done in the last 3 months: the corner shows the all-time level, marked so, instead of looking empty.
    const swatch = lift.value || lift.ever ? `<tspan class="webSwatch ${tierOf(shownScore(lift))?.[2] || 'tierBeg'}">■</tspan> ` : '';
    const level = !known ? '<tspan class="webNone">–</tspan>' : lift.value ? `${swatch}${levelWord(lift.score)} <tspan class="webNum">${lift.score.toFixed(1)}</tspan>` : lift.ever ? `${swatch}<tspan class="webEverWord">${levelWord(lift.everScore)} ${lift.everScore.toFixed(1)}</tspan>` : '<tspan class="webNone">Not logged</tspan>';
    const allTime = !lift.value && lift.ever ? `<text x="${x.toFixed(1)}" y="${(y + 38).toFixed(1)}" text-anchor="${anchor}" class="webEver">all time</text>` : '';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="webLift">${esc(lift.label)}</text><text x="${x.toFixed(1)}" y="${(y + 20).toFixed(1)}" text-anchor="${anchor}" class="webLevel">${level}</text>${allTime}`;
  }).join('');
  // Same room on both sides, so the web's centre is the screen's centre whatever the labels say.
  const half = Math.max(middle - left, right - middle) + 4;
  // The outline takes each corner's level colour and blends along each edge, so a lift past Elite shows blue there.
  const colours = lifts.map((lift) => TIER_COLOURS[tierOf(shownScore(lift))?.[2] || 'tierBeg']);
  const edges = `<defs>${corners.map((corner, index) => {
    const next = corners[(index + 1) % corners.length];
    return `<linearGradient id="webEdge${index}" gradientUnits="userSpaceOnUse" x1="${corner[0].toFixed(1)}" y1="${corner[1].toFixed(1)}" x2="${next[0].toFixed(1)}" y2="${next[1].toFixed(1)}"><stop offset="0" stop-color="${colours[index]}"/><stop offset="1" stop-color="${colours[(index + 1) % colours.length]}"/></linearGradient>`;
  }).join('')}</defs>${corners.map((corner, index) => `<path d="M${fixed(corner)}${segment(corners, index)}" stroke="url(#webEdge${index})" class="webEdge"/>`).join('')}`;
  const everDots = lifts.map((lift, index) => lift.ever && lift.everScore - lift.score >= 0.1 ? `<circle cx="${point(index, lift.everScore)[0].toFixed(1)}" cy="${point(index, lift.everScore)[1].toFixed(1)}" r="2.6" class="webEverDot"/>` : '').join('');
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
      ${!known ? '' : `<div class="webTop"><p class="webIntro">Each lift against Strength Level for your bodyweight</p><p class="webLegend"><span><i class="now"></i>Now</span><span><i class="ever"></i>All time</span></p></div>`}
      <svg class="web" viewBox="${(middle - half).toFixed(0)} -12 ${(half * 2).toFixed(0)} 362" style="max-width:${Math.round(((half * 2) / 448) * 380)}px" role="img" aria-label="Strength level per lift, now and all time: ${lifts.map((lift) => `${lift.label} ${lift.value ? levelWord(lift.score) : 'not lately'}, best ${lift.ever ? levelWord(lift.everScore) : 'not logged'}`).join('; ')}">
        ${lifts.map((lift, index) => `<line x1="${middle}" y1="${middle}" x2="${point(index, outer)[0].toFixed(1)}" y2="${point(index, outer)[1].toFixed(1)}" class="webSpoke"/>`).join('')}
        ${rings}
        ${known ? `<path d="${outline(everCorners)}" class="webEverShape"/>
        <path d="${outline(corners)}" class="webShape"/>
        ${edges}
        ${everDots}` : ''}
        ${lifts.map((lift, index) => lift.value ? `<circle cx="${point(index, lift.score)[0].toFixed(1)}" cy="${point(index, lift.score)[1].toFixed(1)}" r="5" class="webDot ${tierOf(lift.score)?.[2] || 'tierBeg'}"/>` : '').join('')}
        ${ringNumbers}
        ${labels}
      </svg>
      ${levelKey('web')}
    </section>`;
};

// How rare a lift is. Two sources, each where it holds up:
// 1. Up to Elite: Strength Level's own definition of its levels, the share of people training the lift that each
//    level is stronger than: Beginner 5%, Novice 20%, Intermediate 50%, Advanced 80%, Elite 95%
//    (strengthlevel.com/strength-standards, 6,393,746 checked lifts from 16 March 2015 to 10 March 2026). Between two
//    levels the share moves evenly on a log scale.
// 2. Past Elite, for squat, bench and deadlift: OpenPowerlifting raw meet results (openpowerlifting.org rankings, every
//    lifter's best raw lift, read 5 November 2026). MEETS holds, per sex and IPF weight class (999 = the top class),
//    the number of lifters in that class and the kg at the top 50%, 30%, 20%, 10%, 5%, 2%, 1%, 0.5%, 0.2%, 0.1%,
//    0.05%, 0.02% and the class record (top 1 lifter). Your kg gives your share of your class; that share of all raw
//    meet lifters of your sex (`all`) is how many people "at your bodyweight" have done it in a meet. We assume as many
//    again do it without ever competing (no source counts them; this is our assumption, so we double it). Against
//    about 2.7 billion adults of each sex (UN World Population Prospects 2024: 4.14 bn men and 4.09 bn women in 2025,
//    about two thirds of them 20 or older), that gives "about 1 in N".
//    Example, men's deadlift: 15,459 men have pulled 300 kg or more raw in a meet (of 330,925). At 100 kg bodyweight
//    300 kg is the top 5.6% of the up-to-105 kg class (72,508 men): 5.6% of 330,925, doubled, is about 37,000 people,
//    so about 1 in 73,000 men.
// Below Elite meet results would overstate it (most people who train never compete), so they're only used past Elite.
const LEVEL_BEATS = [0.05, 0.2, 0.5, 0.8, 0.95];
const MEET_SHARES = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002];
const ADULTS = 2.7e9;
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
const IPF_CLASSES = { male: [59, 66, 74, 83, 93, 105, 120], female: [47, 52, 57, 63, 69, 76, 84] };
// Your share of your weight class in raw meets, or null when the lift has no meet data or you're below its middle.
const meetShare = (key, sex, bodyweight, kg) => {
  const meets = MEETS[key]?.[sex];
  if (!meets) return null;
  const limit = IPF_CLASSES[sex].find((top) => bodyweight <= top) || 999;
  const [, lifters, marks] = meets.classes.find(([top]) => top === limit);
  const shares = [...MEET_SHARES, 1 / lifters];
  if (kg < marks[0]) return null;
  const above = marks.findIndex((mark) => mark > kg);
  if (above === -1) return { share: 1 / lifters, lifters, limit, all: meets.all, record: true };
  const share = shares[above - 1] * (shares[above] / shares[above - 1]) ** ((kg - marks[above - 1]) / (marks[above] - marks[above - 1]));
  return { share, lifters, limit, all: meets.all };
};
const roughly = (number) => {
  if (number >= 1e6) return `${Number((number / 1e6).toPrecision(2))} million`;
  return Number(number.toPrecision(2)).toLocaleString('en-GB');
};
const shareText = (share) => `${Number((share * 100).toPrecision(share < 0.01 ? 1 : 2))}%`;
const classText = (limit, sex) => (limit === 999 ? `over ${IPF_CLASSES[sex].at(-1)} kg` : `up to ${limit} kg`);
// The lift with the highest level, all time, and how rare it is.
const impressiveLift = () => {
  const body = state.body;
  if (!body?.kg || !body?.sex) return null;
  const lifts = WEB_LIFTS.map((lift) => liftStrength(lift, body)).filter((lift) => lift.marks && lift.ever > 0);
  const best = lifts.sort((first, second) => second.everScore - first.everScore)[0];
  if (!best || best.everScore < 1) return null;
  const people = body.sex === 'male' ? 'men' : 'women';
  const meet = best.everScore >= 5 && !best.reps ? meetShare(best.key, body.sex, body.kg, best.ever) : null;
  if (meet) {
    const odds = ADULTS / (meet.share * meet.all * 2);
    return { lift: best, rare: `About 1 in ${roughly(odds)} ${people}`, fact: meet.record ? `Heavier than every raw meet result at ${classText(meet.limit, body.sex)} (${meet.lifters.toLocaleString('en-GB')} ${people})` : `Top ${shareText(meet.share)} of ${meet.lifters.toLocaleString('en-GB')} ${people} in raw meets at ${classText(meet.limit, body.sex)}`, source: `OpenPowerlifting raw meet results, doubled for people who never compete, against 2.7 billion adult ${people}.` };
  }
  const share = topShare(best.everScore);
  const next = best.everScore < 5 ? `${LEVELS[Math.floor(best.everScore)]} from ${best.reps ? `${Math.max(0, Math.round(best.marks[Math.floor(best.everScore)] - body.kg))} kg added` : `${Math.round(best.marks[Math.floor(best.everScore)])} kg`}` : '';
  return { lift: best, rare: best.everScore >= 5 ? `Rarer than 1 in 20 people who train it` : share > 0.5 ? `Stronger than ${Math.round((1 - share) * 100)}% of people who train it` : `About 1 in ${Math.round(1 / share)} people who train it`, fact: next, source: 'Strength Level: 6.4 million checked lifts, 2015–2026.' };
};
const renderImpressive = () => {
  const found = impressiveLift();
  if (!found) return '';
  const { lift, rare, fact, source } = found;
  const tier = tierOf(lift.everScore)?.[2] || 'tierBeg';
  const kg = lift.reps ? `${Math.max(0, Math.round(lift.ever - state.body.kg))} kg added` : `${Math.round(lift.ever)} kg`;
  return `<p class="section">Your most impressive lift</p>
    <div class="feat">
      <p class="featTop"><span class="featLift">${esc(lift.label === 'Overhead' ? 'Overhead press' : lift.label)} <span class="featKg num">${kg}</span></span><span class="featLevel"><i class="muscleSwatch ${tier}"></i>${levelWord(lift.everScore)} <span class="num">${Math.min(lift.everScore, 9.9).toFixed(1)}</span></span></p>
      <p class="featRare num">${rare}</p>
      ${fact ? `<p class="featFact num">${fact}</p>` : ''}
      <p class="featSource">Best estimated one-rep max, all time. ${source}</p>
    </div>`;
};

// The computer's right panel. On Trends the middle already has the lift chart, so the panel holds what the phone shows
// under it instead (strength level, volume, most impressive lift); nothing appears twice.
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
  return `${[['home', 'Home', ICONS.home], ['trends', 'Trends', ICONS.trends.replace('width="24" height="24"', 'width="22" height="22"')], ['log', 'Log', ICONS.log], ['import', 'Add your data', ICONS.clip.replace('width="18" height="18"', 'width="22" height="22"')], ['feedback', 'Feedback', ICONS.idea], ...(view.isAdmin ? [['admin', 'Admin', ICONS.admin]] : []), ['you', 'Settings', ICONS.settings]].map(([route, label, icon]) => `<a class="navItem${view.route === route ? ' on' : ''}" href="#/${route === 'home' ? '' : route}" ${view.route === route ? 'aria-current="page"' : ''}>${icon}${esc(label)}</a>`).join('')}
      <label class="searchBox">${ICONS.search}<span class="sr">Search your training</span><input id="search" type="search" placeholder="Search your training" enterkeyhint="search" autocomplete="off" value="${esc(view.search.query)}"></label>
      <div id="drawerList">${drawerList()}</div>
      <div class="drawerTools"><button class="drawerTool" data-action="undo-change" ${undoSteps.length ? '' : 'disabled'}>Undo</button><button class="drawerTool" data-action="redo-change" ${redoSteps.length ? '' : 'disabled'}>Redo</button><button class="drawerTool fresh" data-action="start-fresh">Start fresh</button></div>`;
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

const renderDrawer = () => `<div class="overlay">
    <button class="scrim" data-action="close-menu" aria-label="Close menu"></button>
    <nav class="drawer" aria-label="Exodia"><a class="drawerBrand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>${drawerContent()}</nav>
  </div>`;

const renderPicks = () => {
  const date = view.composerDate || todayIso();
  const picks = pickList();
  const query = !/\d/.test(view.draft) && view.draft.trim();
  const cardio = !query || 'cardio'.includes(query.toLowerCase()) ? `<button class="pick" data-action="pick-cardio"><span style="flex:1"><span class="pickName">Cardio</span><span class="pickLast">Cardio or a walk, 30 min · counts for Move</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : '';
  const split = picks.filter((name) => BIG_THREE.includes(name)).length;
  return `${picks.slice(0, split).map((name) => pickButton(name, date)).join('')}${cardio}${picks.slice(split).map((name) => pickButton(name, date)).join('')}
    ${query && picks.length === 0 ? `<button class="pick" data-action="create" data-name="${esc(query)}"><span style="flex:1"><span class="pickName">Create “${esc(titleCase(query))}”</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}`;
};
// Below the main picks: a clear line, then every other lift, quieter, so nobody lands there by accident.
const quickExtras = () => {
  const extras = morePicks();
  const date = view.composerDate || todayIso();
  return extras.length ? `<p class="quickDivider"><span>More exercises · ${extras.length}</span></p><div class="picks quickExtra">${extras.map((name) => pickButton(name, date)).join('')}</div>` : '';
};
const pickButton = (name, date) => {
  const last = lastSetsFor(name, date);
  return `<button class="pick" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(date)}"><span style="flex:1;min-width:0"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>`;
};
const nameQuery = () => {
  const text = view.draft.trim();
  return text && !/\d/.test(text) && text.split(/\s+/).length <= 3 && !view.fixing && !view.editContext ? text : '';
};

const pendingChat = () => view.pending.map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div>${pending.progress ? `<div class="bubbleOut" role="status"><p><span class="ghostText">${esc(pending.progress)}</span></p></div>` : `<div class="bubbleOut" role="status"><p>${writingLine()}</p></div>`}</div>`).join('');

const quickAdd = () => `<div class="quickAdd"><p class="section quickHead">Quick add${view.composer ? sizeButton() : ''}</p><div class="picks"><button class="pick" data-action="pick-file"><span style="flex:1"><span class="pickName">Import from a file</span><span class="pickLast">A StrengthLog or Strong export, notes, Excel or CSV</span></span><span class="plusDot" aria-hidden="true">${ICONS.clip}</span></button>${renderPicks()}</div>${quickExtras()}</div>`;

// On Admin and Feedback the panel above the box shows that page's own conversation, never training or exercises.
const typingBubble = '<div class="bubbleOut typing" role="status" aria-label="Working on it"><i></i><i></i><i></i></div>';
const feedbackChat = () => `${(state.feedback || []).map((item) => `<div class="chatItem"><div class="bubbleIn">${esc(item.said)}</div><div class="bubbleOut"><p>Sent to Marcus · ${item.kind === 'bug' ? 'Bug' : 'Idea'}: ${esc(item.title)}</p></div></div>`).join('')}${view.pending.filter((pending) => pending.feedback).map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div>${typingBubble}</div>`).join('')}` || '<p class="empty">Say or type an idea or a bug.</p>';

// Quick add gets the whole panel when it shows; the log stays on the Log page.
const quickShown = () => !nameQuery() && (view.showQuick || (!view.draft.trim() && !view.quickHidden));

const sheetBody = () => (view.route === 'feedback' ? `<div class="chat">${feedbackChat()}</div>`
  : nameQuery()
  ? `<div class="picks">${renderPicks()}</div>`
  : quickShown()
  ? `${(state.log || []).length || view.pending.length ? `<div class="chat recentChat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).slice(-12).reverse(), true)}${pendingChat()}</div>` : ''}${quickAdd()}`
  : `<div class="chat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).reverse(), true)}${pendingChat()}</div>`);

// The panel above the box opens small (a peek), with a bar that bounces once or twice to say "pull me".
// Drag the bar: let go anywhere and it stays that tall; a quick flick up snaps to the usual size, a flick down closes.
const SHEET_PEEK = 30;
// Tapping the box opens the panel this tall: Quick add's first rows (Import, Bench, Squat, Deadlift) and a peek of more.
const SHEET_SMALL = 214;
const sheetSmall = () => typeof view.sheetH === 'number' && view.sheetH > SHEET_PEEK + 4 && view.sheetH <= SHEET_SMALL + 4;
const sheetStyle = () => (typeof view.sheetH === 'number' ? ` style="height:${view.sheetH}px;max-height:var(--sheet-room, none)"` : '');
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
const renderSheet = () => `<div class="sheet${quickShown() ? ' quickMode' : ''}${sheetPeek() ? ' peek' : ''}${sheetSmall() ? ' small' : ''}" role="group" aria-label="Chat"${sheetStyle()}>
  <button class="grabber" data-action="sheet-toggle" aria-label="${sheetPeek() ? 'Show more' : 'Show less'}"></button>
  <div class="sheetBody scroll" data-mode="${nameQuery() ? `q:${esc(nameQuery())}` : quickShown() ? 'quick' : 'chat'}">${sheetBody()}</div>
</div>`;

const openChat = () => {
  if (!view.composer) view.trayEnter = true;
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
// The chat sits at the bottom of the panel (newest last). Quick add opens at its top with the newest message just
// peeking above it, so it's clear the conversation is one scroll up.
const QUICK_PEEK = 62;
const scrollChat = () => {
  const body = document.querySelector('.sheetBody');
  if (!body) return;
  const quick = body.dataset.mode === 'quick' && body.querySelector('.quickAdd');
  body.scrollTop = quick ? Math.max(0, quick.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - QUICK_PEEK) : body.scrollHeight;
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
  const [kind, label, action, aria] = view.fixing ? ['Fixing', 'an earlier message', 'clear-edit', 'Stop fixing']
    : view.editContext ? ['Editing', `${view.editContext.label || view.editContext.names.join(', ') || 'Workout'} · ${dayLabel(view.editContext.date)}`, 'clear-edit', 'Stop editing']
    : view.composerDate && view.composerDate !== todayIso() ? ['Adding to', dayLabel(view.composerDate), 'clear-day', 'Add to today instead'] : [];
  return kind ? `<div class="contextChip"><span class="contextKind">${kind}</span><span class="contextLabel">${esc(label)}</span><button class="contextX" data-action="${action}" aria-label="${aria}">${ICONS.close}</button></div>` : '';
};

// Admin and Feedback show everything on the page itself, so the box never opens a panel over them.
const showSheet = () => view.composer && view.route !== 'admin' && view.route !== 'feedback';

// /admin typed in any box turns clay (the box can't colour part of its own text, so a copy sits behind it) and is suggested while you type "/".
const slashOn = () => Boolean(view.isAdmin && /^\/admin(\s|$)/i.test(view.draft));
const slashSuggest = () => Boolean(view.isAdmin && view.route !== 'admin' && /^\/(a(d(m(i(n)?)?)?)?)?$/i.test(view.draft));
const slashHtml = () => (slashOn() ? `<span class="slashCmd">${esc(view.draft.slice(0, 6))}</span>${esc(view.draft.slice(6))}\u200b` : '');
const paintSlash = () => {
  const prompt = document.querySelector('.prompt');
  if (!prompt) return;
  prompt.classList.toggle('slashOn', slashOn());
  const mirror = prompt.querySelector('.promptMirror');
  if (mirror) mirror.innerHTML = slashHtml();
  const hint = document.querySelector('.slashSuggest');
  if (hint) hint.hidden = !slashSuggest();
};
const renderDock = () => `<div class="dock${showSheet() ? ' open' : ''}">
  ${showSheet() ? renderSheet() : ''}
  ${view.importConfirm ? `<div class="confirm" role="alertdialog" aria-label="Confirm import"><p>${esc(importConfirmText())}</p>${view.importConfirm.unclear ? `<p class="confirmNote">${esc(view.importConfirm.unclear)}</p>` : ''}<div class="confirmRow"><button class="textBtn" data-action="import-no">Cancel</button><button class="confirmYes" data-action="import-yes">Add it</button></div></div>` : ''}
  ${view.confirm ? `<div class="confirm" role="alertdialog" aria-label="Confirm removal"><p>Remove ${esc(view.confirm.text)}?</p><div class="confirmRow"><button class="textBtn" data-action="confirm-no">Cancel</button><button class="confirmYes" data-action="confirm-yes">Yes, remove</button></div></div>` : ''}
  ${view.status ? `<p class="dockStatus" role="status">${esc(view.status)}</p>` : ''}${view.route === 'admin' && view.isAdmin ? `<p class="dockStatus" role="status">${(state.claudeRuns || []).some((run) => run.status === 'sending') ? '<span class="ghostText">Sending to Exodia builder…</span>' : 'Exodia builds whatever you write or say here'}</p>` : ''}
  <button class="slashSuggest" data-action="slash-admin"${slashSuggest() ? '' : ' hidden'}><b>/admin</b> Send this to Exodia</button>
  <div class="prompt${slashOn() ? ' slashOn' : ''}${view.draft.trim() ? ' hasText' : ''}${view.listening ? ' listening' : ''}${contextChip() ? ' hasChip' : ''}">
    ${contextChip()}
    <label for="draft" class="sr">Type or say what you did</label>
    <div class="promptMirror" aria-hidden="true">${slashHtml()}</div>
    <textarea id="draft" class="promptInput" rows="1" enterkeyhint="send" autocomplete="off">${esc(view.draft)}</textarea>
    ${view.listening
      ? `<span class="hint live" aria-hidden="true"><span class="liveText">${esc(liveLine())}</span></span>`
      : view.voiceBlob && !view.draft.trim() ? '<span class="hint live" aria-hidden="true"><span class="liveText">Voice note ready · tap ↑ to log it</span></span>'
      : view.files?.length && !view.draft.trim() ? '<span class="hint live" aria-hidden="true"><span class="liveText">Add a note (like when it started) or tap ↑</span></span>'
      : `<span class="hint${typewriter.fading ? ' fading' : ''}" aria-hidden="true">${esc(typewriter.text)}</span>`}
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

const EXAMPLES = ['120 for 3 bench press', 'Paste any workout notes, even old ones', 'Squat 140 for 5, 5 and 5, felt easy', 'Walked 40 min', 'Hack squat 200 for 8 last Friday', 'Feedback: add a rest timer between sets', 'Bench 100 for 5 at RPE 8, then dips 3x10', 'Move today’s workout to Monday', 'Curls 20 for 12, 10, 8'];
// After a few logged days people know what the box does, so the typing examples step aside for one quiet line.
const QUIET_HINT = 'Log training, paste notes or give feedback';
const knowsTheBox = () => state.sessions.filter((session) => session.exercises?.length).length >= 5;
const typewriter = { text: '', index: 0, length: 0, fading: false };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
(window.requestIdleCallback || setTimeout)(preloadHands);

const tickTypewriter = () => {
  const examples = view.route === 'feedback' ? FEEDBACK_EXAMPLES : view.route === 'admin' ? CLAUDE_EXAMPLES : EXAMPLES;
  if (examples === EXAMPLES && knowsTheBox()) {
    typewriter.text = QUIET_HINT;
    typewriter.fading = false;
    const quiet = document.querySelector('.dock:not(.onboardDock) .prompt .hint:not(.live)');
    if (quiet && quiet.textContent !== QUIET_HINT) {
      quiet.classList.remove('fading');
      quiet.textContent = QUIET_HINT;
    }
    setTimeout(tickTypewriter, 1500);
    return;
  }
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
    hint.textContent = typewriter.text;
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
  if (desktopQuery.matches) {
    edge = window.innerWidth - 14;
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
  for (const card of document.querySelectorAll('.page .card')) {
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
const demoSessions = () => {
  const today = todayIso();
  const sets = (kg, reps, count, rpe) => Array.from({ length: count }, () => ({ kg: String(kg), reps: String(reps), ...(rpe ? { rpe } : {}), edited: true }));
  const round = (kg) => Math.round(kg / 2.5) * 2.5;
  const days = [];
  for (let week = 7; week >= 0; week -= 1) {
    const step = 7 - week;
    const at = (offset) => addDays(today, -(week * 7 + offset));
    days.push({ date: at(6), label: 'Push day', exercises: [
      { name: 'Bench Press', sets: [...sets(round(80 + step * 2), 5, 3), ...sets(round(85 + step * 2), 3, 1, 8)] },
      { name: 'Overhead Press', sets: sets(round(45 + step), 8, 3) },
      { name: 'Dumbbell Bench Press', sets: sets(round(26 + step * 0.5), 10, 3) },
    ] });
    days.push({ date: at(4), label: 'Pull day', exercises: [
      { name: 'Deadlift', sets: [...sets(round(140 + step * 3), 5, 2), ...sets(round(150 + step * 3), 3, 1, 8)] },
      { name: 'Barbell Row', sets: sets(round(65 + step * 1.5), 8, 3) },
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
  const [lead, ...rest] = view.updated ? updatedLines() : ['Exodia updated'];
  const more = !view.updated ? '· Tap to see' : rest.length ? `· +${rest.length} more` : '';
  const version = view.isAdmin && view.updated ? ` title="v${view.updated.version}"` : '';
  return `<div class="updatedPill${open ? ' open' : ''}${still}" role="status"${version}><button class="updatedMain" data-action="toggle-updated" aria-expanded="${open}"><span class="updatedDot" aria-hidden="true"></span><span class="updatedLead">${esc(lead)}</span>${more ? `<span class="updatedMore">${more}</span>` : ''}</button>${rest.length ? `<ul class="updatedNotes">${rest.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}</div>`;
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
    }, 60000);
  };
  setTimeout(() => show([]), 4000);
  fetch('/changes.json').then((response) => response.json()).then((all) => {
    show(Object.keys(all).map(Number).filter((v) => v > seen && v <= version).sort((a, b) => b - a).flatMap((v) => all[v]).slice(0, 8));
  }).catch(() => show([]));
};
// A touch anywhere outside the pill puts it away (open or not). pointerdown, because iPhone Safari sends no click for a
// tap on plain page, so a click listener alone never saw those taps.
document.addEventListener('pointerdown', (event) => {
  if (!view.updated || event.target.closest('.updatedPill')) return;
  if (view.updated.open) {
    view.updatedClosedAt = Date.now();
    toggleUpdated(false, hideUpdated);
  } else hideUpdated();
}, true);
// Swiping "Exodia updated" away: it follows the finger and fades as it goes; let go far or fast enough and it glides
// off that way, otherwise it springs back. A plain tap still opens the notes.
let updatedSwipe = null;
document.addEventListener('pointerdown', (event) => {
  const pill = event.target.closest('.updatedPill');
  updatedSwipe = pill ? { pill, x: event.clientX, y: event.clientY, t: event.timeStamp, dx: 0, dy: 0, moved: false } : null;
});
document.addEventListener('pointermove', (event) => {
  if (!updatedSwipe) return;
  const swipe = updatedSwipe;
  swipe.dx = event.clientX - swipe.x;
  swipe.dy = Math.min(0, event.clientY - swipe.y);
  if (!swipe.moved && Math.hypot(swipe.dx, swipe.dy) < 6) return;
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
const demoPill = () => (state.demo ? `<div class="demoPill" role="status">${view.endDemoAsk ? 'Clear the example?' : 'Example data'}<button data-action="end-demo">${view.endDemoAsk ? 'Yes, start mine' : 'Start my own'}</button></div>` : '');

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
    ${status ? `<p class="onboardStatus" role="status">${esc(status)}</p>` : ''}
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
      const response = await fetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio }) });
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

const render = () => {
  keepPrivateUrl();
  const app = document.getElementById('app');
  const hit = exodiaHit();
  if (view.wasHit === false && hit && !view.celebrating) celebrate();
  view.wasHit = hit;
  view.blue = hit && view.celebrating !== 'orange';
  document.documentElement.classList.toggle('demo', Boolean(state.demo));
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
  const oldBody = document.querySelector('.sheetBody');
  const chatScroll = oldBody && (view.showQuick || oldBody.scrollHeight - oldBody.scrollTop - oldBody.clientHeight > 40) ? oldBody.scrollTop : null;
  const page = view.route === 'feedback' ? renderFeedback() : view.route === 'trends' ? renderTrends() : view.route === 'you' ? renderYou() : view.route === 'log' ? renderLog() : view.route === 'admin' && view.isAdmin ? renderAdmin() : view.route === 'import' ? renderImport() : renderHome();
  const dock = `${showSheet() ? '<div class="chatScrim"></div>' : ''}${renderDock()}`;
  const layout = desktopQuery.matches
    ? `<div class="desk">
        <nav class="side" aria-label="Exodia"><a class="sideBrand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>${view.isAdmin ? '<button class="devBtn" data-action="dev-menu" aria-label="Developer menu"></button>' : ''}${drawerContent()}</nav>
        <div class="center">${page}${dock}</div>
        <aside class="right" aria-label="Progress">${renderProgress()}</aside>
        ${view.isAdmin ? '<button class="devBtn deskDev" data-action="dev-menu" aria-label="Developer menu"></button>' : ''}
      </div>`
    : `<header class="topbar"><div class="topbarInner">
        <button class="iconBtn" data-action="open-menu" aria-label="Open menu">${ICONS.menu}</button>
        <a class="brand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>
        ${view.isAdmin ? '<button class="devBtn" data-action="dev-menu" aria-label="Developer menu"></button>' : ''}
        ${view.route === 'home' ? `<a class="iconBtn" href="#/trends" aria-label="Trends">${ICONS.trends}</a>` : `<a class="iconBtn" href="#/" aria-label="Home">${ICONS.home}</a>`}
      </div></header>
      ${page}${dock}${view.menu ? renderDrawer() : ''}`;
  app.innerHTML = `
    ${layout}
    ${buildBanner()}${view.toast ? `<div class="toast ${view.toast.kind}${view.toast.open ? ' open' : ''}${view.toast.shown ? ' still' : ''}" role="status">
      <div class="toastMain"><button class="toastBody" data-action="${view.toast.detail ? 'toggle-toast' : 'dismiss-toast'}" ${view.toast.detail ? `aria-expanded="${Boolean(view.toast.open)}"` : 'aria-label="Dismiss"'}>${view.toast.kind === 'max' ? `<span class="trophy">${ICONS.trophy}</span>` : ''}<div class="toastWords"><p class="toastTitle">${esc(view.toast.title)}</p><p class="toastText num">${esc(view.toast.text)}</p></div>${view.toast.detail ? `<span class="toastChev">${ICONS.chev}</span>` : ''}</button>${view.toast.undo || view.toast.redo ? `${view.toast.redo ? '<button class="toastEdit" data-action="redo-change">Redo</button>' : ''}${view.toast.undo ? '<button class="toastEdit" data-action="undo-change">Undo</button>' : ''}` : view.toast.edit ? '<button class="toastEdit" data-action="edit-added">Edit</button>' : ''}</div>
      ${view.toast.detail ? `<div class="toastMore"><div><div class="toastDetail">${view.toast.detail}${view.toast.edit && view.toast.undo ? '<button class="textBtn toastEditLink" data-action="edit-added">Change something</button>' : ''}</div></div></div>` : ''}
    </div>` : ''}${renderLeft()}${updatedPill()}${devExtras()}${demoPill()}`;
  if (view.toast) view.toast.shown = true;
  watchDock();
  const draft = document.getElementById('draft');
  if (draft) {
    fitDraft(draft);
    if (draftFocused || view.focusDraft) {
      draft.focus();
      const [start, end] = view.selectDraft ? [0, draft.value.length] : caret || [draft.value.length, draft.value.length];
      draft.setSelectionRange(start, end);
    }
  }
  if (searchFocused) {
    const search = document.getElementById('search');
    search?.focus();
    search?.setSelectionRange(search.value.length, search.value.length);
  }
  view.focusDraft = false;
  view.selectDraft = false;
  view.opening = null;
  view.menuEnter = false;
  view.rulesEnter = false;
  view.reveal = false;
  tuckCards();
  fitNames();
  const body = document.querySelector('.sheetBody');
  if (body) body.scrollTop = chatScroll ?? body.scrollHeight;
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
    const card = document.getElementById(`session-${view.scrollTarget}`);
    view.scrollTarget = null;
    if (card) requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
};

const closeComposer = () => {
  view.composer = false;
  view.composerDate = null;
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
  const { recorder, context, frame, timer, done, recognizer } = recording;
  recording = null;
  try {
    recognizer?.stop();
  } catch {
    // already stopped
  }
  clearTimeout(timer);
  cancelAnimationFrame(frame);
  recorder.stop();
  context.close();
  view.listening = false;
  view.speaking = false;
  return done;
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
  recording = { recorder, context, done, frame: 0, timer: setTimeout(send, 360000) };
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
const guessDate = (text, fallback) => {
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
    if (!names.size && session.cardio) rows.push([cardioLabel(session), `${session.cardio} min`]);
    return `<p class="toastDay">${dayLabel(date)}</p>${rows.map(([name, sets]) => `<div class="toastRow"><span class="toastLift">${esc(name)}</span><span class="toastSets num">${esc(sets)}</span></div>`).join('')}`;
  }).join('');
};

const showResult = (did, touched, before = null) => {
  glowFor(touched);
  const detail = resultDetail(touched);
  const named = touched.filter((item) => item.name);
  const edit = named.length ? { date: named[0].date, names: [...new Set(named.filter((item) => item.date === named[0].date).map((item) => item.name))] } : null;
  if (view.toast?.name && ['max', 'rep'].includes(view.toast.kind)) Object.assign(view.toast, { detail, edit });
  else view.toast = { kind: 'result', title: did[0], text: did.length > 1 ? `and ${did.length - 1} more` : 'Synced to all your devices', detail, edit, undo: before, open: false };
  if (before && view.toast) view.toast.undo = before;
  clearTimeout(view.toastTimer);
  view.toastTimer = setTimeout(clearToast, 12000);
};

const note = (title, text) => {
  view.toast = { kind: 'rep', title, text };
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

const describeAdd = (result, day) => result.cardioTotal && !result.exercises?.length ? `Cardio is now ${result.cardioMinutes} min on ${dayLabel(day)}` : `Added ${[...(result.exercises || []).map((exercise) => `${findExerciseName(exercise.name) || titleCase(exercise.name)} ${setCount(exercise.sets.length)}`), ...(result.cardioMinutes ? [`${result.cardioName || 'cardio'} ${result.cardioMinutes} min`] : [])].join(', ')} to ${dayLabel(day)}`;

const applyResult = (result, date, said, heard = '') => {
  const before = JSON.stringify(state.sessions);
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
  if (result.accessoriesMinutes) {
    const day = result.date || date;
    const session = sessionFor(day) || ensureSession(day);
    session.accessories = result.accessoriesMinutes;
    save();
    did.push(`Accessories ${result.accessoriesMinutes} min on ${dayLabel(day)}`);
  }
  // When the AI only echoes the whole note back, say it plainly instead of repeating it: the words are already in the bubble.
  // A friend's message that isn't training went to Marcus as feedback on the server; say so, and keep it in their
  // Feedback list. Marcus's own messages stay "didn't understand".
  if (did.length === 0 && result.unclear && !view.isAdmin && !view.sandbox) {
    state.feedback = [...(state.feedback || []), { at: Date.now(), said, kind: 'idea', title: said.slice(0, 80) }].slice(-50);
    throw Object.assign(new Error('Not training, so it went to Marcus as feedback.'), { unclear: true, feedback: true });
  }
  if (did.length === 0) throw Object.assign(new Error(result.unclear && result.unclear.length <= 80 ? `Didn't understand: ${result.unclear}.` : result.unclear ? "Didn't understand that one. It's saved, so Marcus can run it through a stronger Exodia." : 'Nothing to log in that. Fix it and send again.'), { unclear: true });
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
const mergeImported = (days) => {
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
  const response = await fetchOrLater('/api/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, today: todayIso(), ...(view.sandbox ? { dry: true } : {}), ...extra, name: state.name || '', known: [...new Set([...state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)), ...LIBRARY.map((entry) => entry.name)])].slice(0, 100) }) });
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
const takeFiles = (files) => {
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
const queueLater = async ({ prompt, said, date, live = '', voice = null, heard = '', context = noteContext() }) => {
  const id = `later-${Date.now()}`;
  if (voice?.size) await keepVoice(id, voice);
  const at = Date.now();
  state.later = [...laterJobs(), { id, prompt, said, date, live, heard, context, voice: Boolean(voice?.size), at, tries: 0, next: at + LATER_WAIT[0] * 1000 }];
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
        const logsSomething = Boolean(result.exercises?.length || result.cardioMinutes || result.remove?.length || result.replace?.length || result.move?.length || result.accessoriesMinutes || result.label);
        try {
          if (result.feedback && !logsSomething) await routeFeedback(result.feedback, said);
          else if (result.remove?.length && job.voice) view.confirm = { result, date: job.date, said, heard: result.transcript || '', text: describeRemoval(result) };
          else applyResult(result, job.date, said, job.voice ? result.transcript || '' : '');
        } catch (error) {
          addLog(said, error.feedback ? ['Sent to Marcus as feedback'] : [`Not logged: ${error.message}`], error.feedback ? { manual: true } : {});
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

let sentContext = null;
const send = async () => {
  const recorded = recording ? await stopRecording() : view.voiceBlob;
  view.voiceBlob = null;
  const live = (view.live || '').trim();
  view.live = '';
  const voice = recorded?.size > 4000 ? recorded : null;
  const text = [view.draft.trim(), voice ? '' : live].filter(Boolean).join(' ');
  // A file waiting in the box goes with whatever you typed or said: a voice note becomes the file's note.
  if (view.files?.length) {
    const files = view.files;
    view.files = [];
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    let note = text;
    if (voice) {
      view.status = 'Listening to your note…';
      render();
      try {
        const response = await fetch('/api/transcribe', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ audio: await wavBase64(voice) }) });
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
  // Admin shortcut: /admin from any box opens Admin; anything after it goes straight to Claude there.
  // A voice note recorded after /admin goes to the builder too, never into the training log.
  if (view.isAdmin && view.route !== 'admin' && /^\/admin(\s|$)/i.test(text)) {
    const rest = text.replace(/^\/admin\s*/i, '');
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    if (location.hash !== '#/admin') location.hash = '#/admin';
    view.route = 'admin';
    if (rest || voice) return sendToClaude(rest, voice);
    render();
    return;
  }
  if (view.route === 'feedback') return sendFeedback(text, voice);
  if (view.route === 'admin' && view.isAdmin) return sendToClaude(text, voice);
  const date = view.composerDate || todayIso();
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
    land(local, date);
    showResult([describeAdd(local, date)], local.exercises.map(({ name }) => ({ date, name })), before);
    addLog(text, [describeAdd(local, date)], { raw: JSON.stringify(local).slice(0, 1500), by: 'phone' });
    showChat();
    render();
    scrollChat();
    return;
  }
  if (!navigator.onLine && !view.fixing) {
    view.draft = '';
    view.status = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    await queueLater({ prompt: text, said: text || live || 'Voice note', date: guessDate(text, date), live, voice });
    render();
    closeTray();
    return;
  }
  const pending = { date: guessDate(text, date), label: text || 'your voice note', text: text || live || 'Voice note' };
  view.pending.push(pending);
  view.draft = '';
  view.status = '';
  view.scrollTarget = pending.date;
  if (!desktopQuery.matches) document.activeElement?.blur();
  showChat();
  render();
  scrollChat();
  let heard = '';
  let done = false;
  try {
    const audio = voice?.size ? await wavBase64(voice).catch(() => Promise.reject(new Error('Could not read the recording. Try again.'))) : undefined;
    const fixing = view.fixing;
    view.lastSaid = text;
    sentContext = noteContext();
    const result = await parseWithAi(fixing ? `Correct an earlier note. Earlier note: "${fixing.said}". It was logged as: ${fixing.did}. Corrected note: ${text ? `"${text}"` : 'in the audio'}. Change what was logged so it matches the corrected note: use replace for changed sets, remove for things that should not be there, move for a wrong day, and exercises only for things that were not logged at all before.` : text, audio, voice ? live : '');
    heard = result.transcript || '';
    const said = fixing ? `Fix: ${text}` : heard || text;
    // Feedback only when they say "feedback" or "feature"; everything else in this box is training.
    if (result.feedback && !/\b(feedback|feature)\b/i.test(`${text} ${result.transcript || ''}`)) delete result.feedback;
    const logsSomething = Boolean(result.exercises?.length || result.cardioMinutes || result.remove?.length || result.replace?.length || result.move?.length || result.accessoriesMinutes || result.label);
    if (result.feedback && !logsSomething) await routeFeedback(result.feedback, said);
    else if (view.confirm && (YES.test(said) || NO.test(said))) answerConfirm(YES.test(said));
    else if (result.remove?.length && voice) {
      view.confirm = { result, date, said, heard, text: describeRemoval(result) };
      view.scrollTarget = null;
    } else applyResult(result, date, said, voice ? heard : '');
    if (result.feedback && logsSomething) routeFeedback(result.feedback, said).catch((error) => addLog(said, [`Feedback not sent: ${error.message}`]));
    if (view.editDay !== view.editContext?.date) view.editContext = null;
    view.fixing = null;
    if (view.retryVoice) dropVoice(view.retryVoice);
    view.retryVoice = null;
    done = !view.confirm && !result.unclear && !view.draft.trim() && !view.listening && view.pending.length === 1;
  } catch (error) {
    if (error.feedback) {
      addLog(text || heard || error.heard || live || 'Voice note', ['Sent to Marcus as feedback'], { manual: true });
      note('Sent to Marcus', 'As feedback');
      return;
    }
    // Busy or offline: it waits and tries again by itself; nothing for the person to do.
    if (error.later && !view.fixing) {
      await queueLater({ prompt: text, said: text || heard || error.heard || live || 'Voice note', date: pending.date, live, voice, heard: heard || error.heard || '', context: sentContext || noteContext() });
      return;
    }
    view.composerDate = date === todayIso() ? null : date;
    openChat();
    const voiceId = voice ? `voice-${Date.now()}` : null;
    if (voiceId) keepVoice(voiceId, voice);
    const words = text || heard || error.heard || live || 'Voice note';
    const kept = voice && !error.unclear ? (words !== 'Voice note' ? ' Your words are saved, tap Try again.' : ' Your recording is saved, tap Try again.') : '';
    addLog(words, [`Not logged: ${error.message}${kept}`], { ...(voiceId ? { voiceId } : {}), ...(voice && !text && words !== 'Voice note' ? { heard: words } : {}) });
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    if (done && !desktopQuery.matches) document.activeElement?.blur();
    if (view.composer && !view.showQuick) showChat();
    render();
    scrollChat();
  }
};

document.addEventListener('click', (event) => {
  // "What's new" open: a tap anywhere else closes it all, like any dialog, and does nothing else.
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
  const date = target.dataset.date;
  const session = date ? sessionFor(date) : null;
  if (action === 'import') return;
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
    view.draft = '/admin ';
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
    // Open: a tap closes it and it goes. Nothing more to show (one change that already fits): a tap clears it.
    const lead = document.querySelector('.updatedLead');
    if (view.updated?.open) return toggleUpdated(false, hideUpdated);
    if (!document.querySelector('.updatedNotes') && lead && lead.scrollWidth <= lead.clientWidth) return hideUpdated();
    return toggleUpdated(true);
  }
  if ((action === 'onboard-start' || action === 'onboard-blank') && view.onboard) {
    const name = view.onboard.name.trim();
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
    return setTimeout(render, 230);
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
    changeWithUndo(`Deleted ${exercise.name} ${set.kg} × ${set.reps} on ${dayLabel(date)}`, () => {
      exercise.sets.splice(Number(target.dataset.set), 1);
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
    view.exodiaStyle = target.dataset.style;
    view.devMenu = false;
    view.devHit = true;
    view.wasHit = false;
    if (view.route !== 'home') location.hash = '#/';
    scrollPage(0);
  } else if (action === 'dev-normal') {
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
    view.focusDraft = true;
  } else if (action === 'composer-day') {
    view.composerDate = date;
    view.focusDraft = true;
  }
  else if (action === 'toggle-exodia') {
    view.exodiaOpen = !view.exodiaOpen;
    view.rulesEnter = view.exodiaOpen;
  }
  else if (action === 'toggle-info') view.info = !view.info;
  else if (action === 'level-info') {
    const level = Number(target.dataset.level);
    const where = target.dataset.where;
    view.levelInfo = view.levelInfo?.where === where && (view.levelInfo.level === level || !level) ? null : { where, level };
  }
  else if (action === 'confirm-yes') answerConfirm(true);
  else if (action === 'import-yes') answerImport(true);
  else if (action === 'import-no') answerImport(false);
  else if (action === 'unfile') view.files = (view.files || []).filter((file, index) => index !== Number(target.dataset.index));
  else if (action === 'retry-said') {
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
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
    if (view.route !== 'home') {
      location.hash = '#/';
      return;
    }
  } else if (action === 'toggle-trend') view.trendOpen = view.trendOpen === target.dataset.name ? '' : target.dataset.name;
  else if (action === 'pick-trend') {
    view.trendOpen = target.dataset.name;
    // Picked from the list further down: bring the chart into view so you see it switch.
    view.trendScroll = target.dataset.name;
    view.trendScrollChart = true;
  } else if (action === 'trend-more') view.trendMore = !view.trendMore;
  else if (action === 'range') view.range = Number(target.dataset.days);
  else if (action === 'accessories' && session) {
    session.accessories = accessoriesOf(session) === Number(target.dataset.minutes) ? 0 : Number(target.dataset.minutes);
    addLog(`Accessories ${target.textContent.trim()}`, [session.accessories ? `Accessories ${session.accessories} min on ${dayLabel(date)}` : `No accessories on ${dayLabel(date)}`], { manual: true, merge: `acc:${date}` });
  } else if (action === 'add-set' && session) {
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const last = exercise.sets.at(-1) || { kg: '', reps: '' };
    changeWithUndo(`Added a ${exercise.name} set on ${dayLabel(date)}`, () => exercise.sets.push({ kg: last.kg, reps: last.reps, edited: false }), 'Add set');
  } else if (action === 'remove-cardio' && session) {
    changeWithUndo(`Removed cardio on ${dayLabel(date)}`, () => {
      session.cardio = 0;
      delete session.cardioName;
    }, 'Remove cardio');
  } else if (action === 'quick-all') {
    view.quickAll = !view.quickAll;
    const body = document.querySelector('.sheetBody');
    if (body) {
      body.innerHTML = sheetBody();
      if (!view.quickAll) body.scrollTop = 0;
    } else render();
    return;
  } else if (action === 'hide-quick') {
    view.showQuick = false;
    view.quickHidden = true;
    render();
    return;
  } else if (action === 'open-quick') {
    openChat();
    view.sheetH = null;
    view.showQuick = true;
    view.quickHidden = false;
    if (!desktopQuery.matches) document.activeElement?.blur();
    render();
    const body = document.querySelector('.sheetBody');
    const list = document.querySelector('.sheet .quickAdd');
    if (body) body.scrollTop = 0;
    return;
  } else if (action === 'pick' || action === 'create') {
    const name = action === 'create' ? titleCase(target.dataset.name) : target.dataset.name;
    const day = view.composerDate || todayIso();
    const last = lastSetsFor(name, day);
    changeWithUndo(`Added ${name} to ${dayLabel(day)}`, () => addEntries({ exercises: [{ name, sets: last ? last.map((set) => ({ kg: set.kg, reps: set.reps })) : [{ kg: '', reps: '' }] }] }, day), `Add ${name}`);
    closeComposer();
  } else if (action === 'pick-cardio') {
    const day = view.composerDate || todayIso();
    changeWithUndo(`Added cardio 30 min to ${dayLabel(day)}`, () => addEntries({ exercises: [], cardioMinutes: 30 }, day), 'Add cardio');
    closeComposer();
  } else if (action === 'mic') {
    return view.listening ? send() : startListening();
  } else if (action === 'stop-mic') {
    return stopRecording().then((blob) => {
      view.voiceBlob = blob?.size > 4000 ? blob : null;
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
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.hasAttribute('data-share-name')) {
    view.shareName = target.value.slice(0, 30);
    const linkText = target.closest('.card').querySelector('.muted');
    if (linkText) linkText.textContent = inviteLink(view.shareName);
    return;
  }
  if (target.id === 'onboardName' || target.id === 'onboardData') {
    view.onboard[target.id === 'onboardName' ? 'name' : 'data'] = target.value;
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
    if (field === 'kg') {
      for (const set of group) set.edited = true;
      for (let next = index + group.length; next < exercise.sets.length; next += 1) {
        if (!exercise.sets[next].edited && exercise.sets[next].kg === previous) exercise.sets[next].kg = exercise.sets[index].kg;
      }
    }
    save();
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
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
    state.name = target.value.trim().slice(0, 40);
    save();
    render();
    return;
  }
  if (target.dataset.field) {
    const session = sessionFor(target.dataset.date);
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const set = exercise.sets[Number(target.dataset.set)];
    if (set && set.kg === '' && set.reps === '') exercise.sets.splice(Number(target.dataset.set), Number(target.dataset.count) || 1);
    if (exercise.sets.length === 0) session.exercises.splice(Number(target.dataset.exercise), 1);
    if (session.exercises.length === 0 && !session.cardio) state.sessions = state.sessions.filter((item) => item !== session);
    const changed = exercise.sets[Number(target.dataset.set)];
    if (changed && changed.kg !== '' && changed.reps !== '') addLog('Edit numbers', [`${exercise.name} set ${Number(target.dataset.set) + 1} is now ${changed.kg} × ${changed.reps}${changed.rpe ? ` @${changed.rpe}` : ''} on ${dayLabel(session.date)}`], { manual: true, merge: `set:${session.date}:${exercise.name}:${target.dataset.set}` });
    checkPr(exercise.name, session.date);
    save();
    render();
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

document.addEventListener('keydown', (event) => {
  if (event.target.id === 'search' && event.key === 'Enter') {
    event.preventDefault();
    clearTimeout(searchTimer);
    runAiSearch();
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
  view.route = ['trends', 'you', 'log', 'admin', 'feedback', 'import'].includes(name) ? name : 'home';
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
  if (view.route === 'log') scrollPage(scroller().scrollHeight);
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
  const section = event.target.closest('.homePage .session:not(.open)');
  if (!section || event.target.closest('.dayLift')) return;
  const date = section.id.replace('session-', '');
  hold = { ...uiPoint(event), timer: setTimeout(() => {
    hold = null;
    const session = sessionFor(date);
    if (!session) return;
    view.open.add(date);
    view.opening = date;
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
document.addEventListener('pointerdown', (event) => {
  const face = event.target.closest('.swipeFace');
  for (const open of document.querySelectorAll('.swipe.open')) if (open !== face?.parentElement) open.classList.remove('open');
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
  face.parentElement.classList.toggle('open', dx < -40);
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
const PAGE_SWIPE_SKIP = '.dock, .sheet, .swipeFace, .calScroll, .days, .dayActions, input, textarea, select, .grabber, .updatedPill, .drawer, .scrim, .segment, .toast, .confirm';
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

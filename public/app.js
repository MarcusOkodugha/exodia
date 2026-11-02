'use strict';

const STORE_KEY = 'exodia.v1';
const HEAVY_SHARE = 0.85;

const LIBRARY = [
  { name: 'Bench Press', piece: 'push', heavy: true, aliases: ['bench', 'bench press', 'bp'] },
  { name: 'Incline Bench Press', piece: 'push', heavy: true, aliases: ['incline', 'incline bench', 'incline bench press'] },
  { name: 'Incline Dumbbell Press', piece: 'push', heavy: true, aliases: ['incline db', 'incline dumbbell', 'incline dumbbell press'] },
  { name: 'Dumbbell Bench Press', piece: 'push', heavy: true, aliases: ['db bench', 'dumbbell bench', 'dumbbell press'] },
  { name: 'Overhead Press', piece: 'push', heavy: true, aliases: ['ohp', 'overhead press', 'press', 'military press'] },
  { name: 'Dips', piece: 'push', heavy: false, aliases: ['dips', 'dip'] },
  { name: 'Pause Bench Press', piece: 'push', heavy: true, aliases: ['pause bench', 'pause bench press', 'paused bench'] },
  { name: 'Close-Grip Bench Press', piece: 'push', heavy: true, aliases: ['close grip', 'close grip bench', 'close-grip bench', 'closegrip'] },
  { name: 'Deadlift', piece: 'pull', heavy: true, aliases: ['deadlift', 'deadlifts', 'dl', 'marklyft'] },
  { name: 'Sumo Deadlift', piece: 'pull', heavy: true, aliases: ['sumo', 'sumo deadlift'] },
  { name: 'Barbell Row', piece: 'pull', heavy: false, aliases: ['row', 'rows', 'barbell row'] },
  { name: 'Pull-up', piece: 'pull', heavy: false, aliases: ['pullup', 'pullups', 'pull-up', 'pull-ups', 'chins', 'chin-ups'] },
  { name: 'Lat Pulldown', piece: 'pull', heavy: false, aliases: ['pulldown', 'lat pulldown', 'lat pull'] },
  { name: 'Squat', piece: 'legs', heavy: true, aliases: ['squat', 'squats', 'sq', 'knäböj'] },
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
  you: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
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
const ESTIMATE_INFO = `<div class="info" role="note"><p>Estimated 1RM uses the same math as the Strength Level one rep max calculator.</p><p>Up to 10 reps it is the Brzycki formula: weight × 36 ÷ (37 − reps). Above 10 reps it is the Epley formula: weight × (1 + reps ÷ 30). Example: 120 × 7 gives about 144 kg.</p><p>Exodia uses your strongest rep set. A single you actually lifted is never estimated; it counts as it is, and it is your real best.</p><p><a href="https://strengthlevel.com/one-rep-max-calculator" target="_blank" rel="noopener">Strength Level calculator</a></p></div>`;
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
const dayLabel = (iso) => {
  if (iso === todayIso()) return 'Today';
  if (iso === addDays(todayIso(), -1)) return 'Yesterday';
  const sameYear = iso.slice(0, 4) === todayIso().slice(0, 4);
  return parseIso(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).replace(',', '');
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
  return { version: 1, deviceId: crypto.randomUUID(), sessions: [], bests: { 'Bench Press': 145 } };
};

let state = loadState();
const view = { route: 'home', menu: false, composer: false, open: new Set([todayIso()]), exodiaOpen: false, trendOpen: null, range: 0, draft: '', status: '', listening: false, toast: null, pending: [], fresh: null, search: { query: '', local: [], ai: [], loading: false } };

const SYNC_KEY = 'exodia.sync';
const PROFILE_KEY = /^[a-f0-9]{32}$/;
const newProfileKey = () => [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const freshSync = (profile) => ({ profile, cursor: 0, synced: {}, stamps: {}, metaSynced: null, metaStamp: 0 });

const loadSync = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SYNC_KEY));
    if (saved && PROFILE_KEY.test(saved.profile)) return saved;
  } catch (error) {
    console.error('Could not read sync state', error);
  }
  return freshSync(newProfileKey());
};

let syncState = loadSync();
const localJson = () => Object.fromEntries(state.sessions.map((session) => [session.date, JSON.stringify(session)]));
const metaJson = () => JSON.stringify({ name: state.name || '', bests: state.bests || {}, log: state.log || [] });
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

const save = () => {
  const now = Date.now();
  const current = localJson();
  for (const date of new Set([...Object.keys(current), ...Object.keys(lastSaved)])) {
    if ((current[date] ?? null) !== (lastSaved[date] ?? null)) syncState.stamps[date] = now;
  }
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
    const dirty = local !== (syncState.synced[row.date] ?? null);
    if (dirty && (syncState.stamps[row.date] || 0) > row.updated) continue;
    syncState.synced[row.date] = incoming;
    if (local === incoming) continue;
    state.sessions = state.sessions.filter((session) => session.date !== row.date);
    if (row.data) state.sessions.push(row.data);
    changed = true;
  }
  if (result.meta) {
    const { updated, ...incomingMeta } = result.meta;
    const incoming = JSON.stringify({ name: incomingMeta.name || '', bests: incomingMeta.bests || {}, log: incomingMeta.log || [] });
    const dirty = lastMeta !== syncState.metaSynced;
    if (!dirty || syncState.metaStamp <= updated) {
      syncState.metaSynced = incoming;
      if (incoming !== lastMeta) {
        state.name = incomingMeta.name || '';
        state.bests = incomingMeta.bests || {};
        state.log = incomingMeta.log || [];
        changed = true;
      }
    }
  }
  lastSaved = localJson();
  lastMeta = metaJson();
  return changed;
};

const syncNow = () => {
  if (view.sandbox) return Promise.resolve();
  if (syncing) {
    scheduleSync();
    return syncing;
  }
  if (!navigator.onLine) return Promise.resolve(false);
  const current = { ...lastSaved };
  const changes = [...new Set([...Object.keys(current), ...Object.keys(syncState.synced)])]
    .filter((date) => (current[date] ?? null) !== (syncState.synced[date] ?? null))
    .slice(0, 500)
    .map((date) => ({ date, updated: syncState.stamps[date] || 1, data: current[date] ? JSON.parse(current[date]) : null }));
  const sentMeta = lastMeta;
  const meta = sentMeta !== syncState.metaSynced ? { ...JSON.parse(sentMeta), updated: syncState.metaStamp || 1 } : null;
  syncing = fetch('/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile },
    body: JSON.stringify({ since: syncState.cursor, changes, meta })
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Sync failed'))))
    .then((result) => {
      for (const change of changes) syncState.synced[change.date] = current[change.date] ?? null;
      if (meta) syncState.metaSynced = sentMeta;
      const changed = applyIncoming(result);
      syncState.cursor = result.cursor;
      writeLocal();
      view.syncedAt = Date.now();
      if (Boolean(result.admin) !== Boolean(view.isAdmin)) {
        view.isAdmin = Boolean(result.admin);
        renderSoon();
      }
      view.syncFailed = false;
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
const repsInTank = (set) => (Number(set.rpe) >= 1 ? Math.min(5, Math.max(0, 10 - Number(set.rpe))) : 0);
const setEstimate = (set) => (set.warmup ? 0 : estimate(Number(set.kg), Number(set.reps) + repsInTank(set)));
const topEstimate = (exercise) => Math.max(0, ...validSets(exercise).map(setEstimate));

const HARDER_VARIANTS = { 'Bench Press': ['Close-Grip Bench Press', 'Pause Bench Press'] };
const countsFor = (name) => [name, ...(HARDER_VARIANTS[name] || [])];

const bestBefore = (name, date) => {
  let best = Number(state.bests?.[name]) || 0;
  for (const session of state.sessions) {
    if (session.date >= date) continue;
    for (const exercise of session.exercises) if (countsFor(name).includes(exercise.name)) best = Math.max(best, topEstimate(exercise));
  }
  return best;
};
const bestOverall = (name) => bestBefore(name, '9999-12-31');
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

const pieceProgress = (endIso) => {
  const startIso = addDays(endIso, -6);
  const inWindow = state.sessions.filter((session) => session.date >= startIso && session.date <= endIso);
  const counts = { push: 0, pull: 0, legs: 0, arms: 0, move: 0 };
  for (const session of inWindow) {
    const hit = { push: false, pull: false, legs: false, arms: false };
    for (const exercise of session.exercises) {
      const entry = libraryEntry(exercise.name);
      if (!entry || !entry.piece || validSets(exercise).length === 0) continue;
      if (entry.piece === 'arms' || entry.piece === 'legs') {
        hit[entry.piece] = true;
        continue;
      }
      const isPullLift = entry.piece === 'pull' && entry.heavy;
      const isPushLift = entry.piece === 'push' && entry.heavy;
      if (!isPullLift && !isPushLift) continue;
      const best = bestBefore(exercise.name, session.date);
      if (topEstimate(exercise) >= best * HEAVY_SHARE) hit[entry.piece] = true;
    }
    for (const key of Object.keys(hit)) if (hit[key]) counts[key] += 1;
    if ((session.cardio || 0) >= 20) counts.move += 1;
  }
  return PIECES.map((piece) => ({ ...piece, done: counts[piece.id], complete: counts[piece.id] >= piece.target }));
};

const exodiaHistory = () => {
  if (state.sessions.length === 0) return { hits: 0, last: null };
  const first = sortedSessions().at(-1).date;
  let hits = 0;
  let last = null;
  let previous = false;
  for (let iso = first; iso <= todayIso(); iso = addDays(iso, 1)) {
    const complete = pieceProgress(iso).every((piece) => piece.complete);
    if (complete && !previous) {
      hits += 1;
      last = iso;
    }
    previous = complete;
  }
  return { hits, last };
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
  const cardio = text.match(/^(cardio|run|ran|running|bike|biked|cycling|walk|walked|walking|hike|hiked|hiking|swim|swam|rowing|elliptical|stairs|löpning|cykel|promenad|vandring)\D*(\d+)/);
  if (cardio) return { cardio: Number(cardio[2]) };
  const match = text.match(/^([\p{L}][\p{L}\s-]*?)\s+(\d.*)$/u);
  if (!match) return null;
  const name = findExerciseName(match[1]);
  if (!name) return null;
  const numbers = match[2].replace(/\s+(reps?|sets?)\b/g, ' ');
  const straight = numbers.match(/^(\d+(?:[.,]\d+)?)\s*x\s*(\d+)\s*x\s*(\d+)\s*$/);
  if (straight) {
    const kg = straight[1].replace(',', '.');
    return { name, sets: Array.from({ length: Number(straight[3]) }, () => ({ kg, reps: straight[2] })) };
  }
  if (/^\d+(?:[.,]\d+)?\s*x\s*\d+(\s+\d+(?:[.,]\d+)?\s*x\s*\d+)*\s*$/.test(numbers)) {
    return { name, sets: numbers.trim().split(/\s+(?=\d)/).map((pair) => {
      const [kg, reps] = pair.split(/\s*x\s*/);
      return { kg: kg.replace(',', '.'), reps };
    }) };
  }
  const loose = numbers.match(/^(\d+(?:[.,]\d+)?)\s*(?:for|x)\s+(.+)$/);
  if (loose) {
    const parts = loose[2].split(/,|\band\b|\boch\b|\s+/).map((part) => part.trim()).filter(Boolean);
    const reps = parts.filter((part) => /^\d+$/.test(part));
    if (reps.length > 0 && reps.length === parts.length) return { name, sets: reps.map((count) => ({ kg: loose[1].replace(',', '.'), reps: count })) };
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

const parseWithAi = async (text, audio, hint = '') => {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile },
    body: JSON.stringify({ text, audio, hint, ...(view.sandbox ? { dry: true } : {}), name: state.name || '', today: todayIso(), viewing: view.editContext?.date || view.composerDate || todayIso(), focus: view.editContext ? `${view.editContext.names.join(', ') || 'the workout'} on ${view.editContext.date}` : '', recent: recentLog(), deviceId: state.deviceId, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The AI could not read that.');
  return body;
};

const announced = new Set();
const priorSets = (name, date) => state.sessions
  .filter((session) => session.date < date)
  .flatMap((session) => session.exercises.filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets))
  .map((set) => ({ kg: Number(set.kg), reps: Number(set.reps) }));
const singleBefore = (name, date) => Math.max(Number(state.bests?.[name]) || 0, ...priorSets(name, date).filter((set) => set.reps === 1).map((set) => set.kg));

const earlierToday = (name, date, set) => {
  const sets = (sessionFor(date)?.exercises || []).filter((exercise) => countsFor(name).includes(exercise.name)).flatMap(validSets);
  return sets.slice(0, Math.max(0, sets.indexOf(set))).filter((other) => !other.warmup);
};

const earlierDays = (name, date) => new Set(state.sessions
  .filter((session) => session.date < date && session.exercises.some((exercise) => countsFor(name).includes(exercise.name) && validSets(exercise).length))
  .map((session) => session.date)).size;

const prKind = (name, date, set) => {
  const kg = Number(set.kg);
  const reps = Number(set.reps);
  if (set.warmup || set.kg === '' || set.reps === '' || !(kg > 0) || !(reps > 0)) return null;
  if (earlierDays(name, date) < 3) return null;
  const today = earlierToday(name, date, set);
  if (reps === 1 && kg > Math.max(singleBefore(name, date), ...today.filter((other) => Number(other.reps) === 1).map((other) => Number(other.kg)))) return 'max';
  return setEstimate(set) > Math.max(bestBefore(name, date), ...today.map(setEstimate)) + 0.01 ? 'est' : null;
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
  setTimeout(() => {
    clearToast();
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
  if (result.cardioMinutes) session.cardio = (session.cardio || 0) + Number(result.cardioMinutes);
  view.open.add(date);
  save();
  return names;
};

const pickList = () => {
  const query = /\d/.test(view.draft) ? '' : view.draft.trim().toLowerCase();
  const today = sessionFor(view.composerDate || todayIso());
  const inToday = new Set(today ? today.exercises.map((exercise) => exercise.name) : []);
  const recent = [];
  for (const session of sortedSessions()) {
    for (const exercise of session.exercises) if (!recent.includes(exercise.name)) recent.push(exercise.name);
  }
  const starters = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-up', 'Barbell Row'];
  const library = [...starters, ...LIBRARY.map((entry) => entry.name).filter((name) => !starters.includes(name))];
  const names = [...new Set([...BIG_THREE, ...recent, ...library])];
  return names.filter((name) => (query ? name.toLowerCase().includes(query) : !inToday.has(name))).slice(0, 12);
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
    const value = set.kg !== '' && set.reps !== '' && Number(set.reps) > 0 ? estimate(Number(set.kg), Number(set.reps) + repsInTank(set)) : 0;
    const pr = prKind(exercise.name, session.date, set);
    const numbers = count > 1 ? `${count}×` : `${start + 1}`;
    const label = `${esc(exercise.name)}, ${count > 1 ? `${count} sets` : `set ${numbers}`}`;
    const where = `data-date="${session.date}" data-exercise="${exerciseIndex}" data-set="${start}" data-count="${count}"`;
    return `<div class="swipe setSwipe"><button class="swipeDel" data-action="delete-set" ${where} aria-label="Delete ${label}">Delete</button><div class="setRow swipeFace">
      ${editing ? `<button class="minus" data-action="delete-set" ${where} aria-label="Delete ${label}"></button>` : `<span class="setNo num">${numbers}</span>`}
      <input class="pill num" inputmode="decimal" aria-label="${label}, kilograms" value="${esc(set.kg)}" placeholder="kg" ${where} data-field="kg">
      <span class="unit">kg</span><span class="unit" aria-hidden="true" style="text-align:center">×</span>
      <input class="pill num" inputmode="numeric" aria-label="${label}, reps" value="${esc(set.reps)}" placeholder="reps" ${where} data-field="reps">
      ${editing ? `<input class="pill num rpe" inputmode="decimal" aria-label="${label}, RPE" value="${esc(set.rpe ?? '')}" placeholder="@" ${where} data-field="rpe">` : `<span class="rpeTag num">${lastRow ? `<button class="rowPlus" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Add a ${esc(exercise.name)} set">${ICONS.plusThin}</button>` : ''}${set.warmup ? 'W' : set.rpe ? `@${set.rpe}` : ''}</span>`}
      <span class="pct num">${pr ? `<span class="prPill${pr === 'est' ? ' est' : ''}">PR</span>` : ''}<span class="setPct">${best && value ? `${Math.round((value / best) * 100)}%` : ''}</span>${e1rmCell(value)}</span>
      <button class="rowX" data-action="delete-set" ${where} aria-label="Delete ${label}">×</button>
    </div></div>`;
  }).join('');
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.names.has(exercise.name);
  return `<div class="exercise${landing ? ' landing' : ''}${glowing(session.date, exercise.name) ? ' glow' : ''}">
    <div class="swipe"><button class="swipeDel" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">Delete</button> <div class="exHead swipeFace">${editing ? `<button class="minus" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}"></button>` : ''}<button class="exName" data-action="open-trend" data-name="${esc(exercise.name)}">${esc(exercise.name)}</button>${COLUMN_HEAD}<button class="rowX" data-action="delete-exercise" data-date="${session.date}" data-exercise="${exerciseIndex}" aria-label="Delete ${esc(exercise.name)}">×</button></div></div>
    ${rows}
    ${editing ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}">Add set</button>` : ''}
  </div>`;
};

const renderPending = (pending) => `<div class="ghost" role="status"><span class="ghostText">Adding “${esc(pending.label)}”</span><span class="shimmer"></span><span class="shimmer short"></span></div>`;

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
const dayKind = (session) => {
  if (session.label) return session.label[0].toUpperCase() + session.label.slice(1);
  const pieces = [...new Set(session.exercises.filter((exercise) => validSets(exercise).length).map((exercise) => libraryEntry(exercise.name)?.piece).filter(Boolean))];
  if (pieces.length === 1) return KINDS[pieces[0]];
  if (pieces.length > 1) return pieces.slice(0, 2).map((piece) => piece[0].toUpperCase() + piece.slice(1)).join(' + ');
  return session.cardio ? 'Cardio' : '';
};

const dayPrKind = (session, name) => {
  const kinds = session.exercises.filter((exercise) => exercise.name === name).flatMap((exercise) => exercise.sets.map((set) => prKind(name, session.date, set)));
  return kinds.includes('max') ? 'max' : kinds.includes('est') ? 'est' : null;
};
const hasPr = (session, name) => Boolean(dayPrKind(session, name));

const dayRow = (lift, pr, kg, reps, e1rm) => `<span class="dayRow">${kg && reps !== 'min' ? `<button class="dayLift" data-action="open-trend" data-name="${esc(lift)}">${esc(lift)}</button>` : `<span class="dayLift">${esc(lift)}</span>`}<span class="dayPr">${pr ? `<span class="prPill${pr === 'est' ? ' est' : ''}">PR</span>` : ''}</span><span class="dayKg">${kg}</span><span class="dayX">${kg && reps !== 'min' ? '×' : ''}</span><span class="dayReps">${reps}</span><span class="dayE1rm">${e1rm}</span></span>`;

const daySummary = (session) => {
  const [first, ...rest] = topSets(session);
  const second = rest.find(({ name }) => hasPr(session, name)) || rest[0];
  const others = [
    ...rest.filter((item) => item !== second).map(({ name }) => name),
    ...(session.cardio ? [`Cardio ${session.cardio} min`] : []),
    ...(accessoriesOf(session) ? [`Accessories ${accessoriesOf(session)} min`] : [])
  ];
  const row = ({ name, set }) => {
    return dayRow(name, dayPrKind(session, name), set.kg, set.reps, e1rmCell(estimate(Number(set.kg), Number(set.reps) + repsInTank(set))));
  };
  if (!first) return session.cardio ? dayRow('Cardio', false, session.cardio, 'min', '') : dayRow('Nothing logged yet', false, '', '', '');
  return `${row(first)}${second ? row(second) : ''}${others.length ? `<span class="dayOthers">+ ${esc(others.join(', '))}</span>` : ''}`;
};

const renderSession = (session) => {
  const pendings = view.pending.filter((pending) => pending.date === session.date);
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
        <span class="meta num">${open ? tonnes(sessionVolume(session)) : `${tonnes(sessionVolume(session))} · ${setCount(sessionSets(session))}`}</span>
      </button>`}
      ${open ? `<button class="editBtn" data-action="edit-day" data-date="${session.date}">${editing ? 'Done' : 'Edit'}</button>` : ''}
      <button class="chevBtn" data-action="toggle-session" data-date="${session.date}" aria-label="${open ? 'Collapse' : 'Expand'} ${dayLabel(session.date)}">${ICONS.chev}</button>
    </div>
    ${open && editing ? `<div class="dayMenu${view.menuEnter ? ' enter' : ''}">
      <p class="dayMenuLabel">Move to</p>
      <div class="days scroll">${Array.from({ length: 21 }, (unused, index) => addDays(todayIso(), -index)).filter((iso) => iso !== session.date).map((iso) => `<button class="chip" data-action="move-day" data-date="${session.date}" data-to="${iso}"><span class="chipFace">${dayLabel(iso)}</span></button>`).join('')}</div>
      <button class="textBtn danger" data-action="delete-day" data-date="${session.date}">Delete day</button>
    </div>` : ''}
    ${open ? `
      ${session.exercises.map((exercise, index) => renderExercise(session, exercise, index)).join('')}
      ${pendings.map(renderPending).join('')}
      ${session.cardio ? `<div class="cardio"><span>Cardio</span><span class="meta num">${session.cardio} min</span><button class="textBtn" data-action="remove-cardio" data-date="${session.date}">Remove</button></div>` : ''}
      <div class="dayActions">
        <span class="dayAdd">${session.exercises.length ? `<button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${session.exercises.length - 1}">+ Set</button>` : ''}<button class="textBtn" data-action="open-composer" data-date="${session.date}">+ Exercise</button></span>
        ${[[10, '10 min'], [30, '30 min'], [60, '1 h']].map(([minutes, label]) => `<button class="chip" data-action="accessories" data-date="${session.date}" data-minutes="${minutes}" aria-pressed="${accessoriesOf(session) === minutes}" aria-label="Accessories ${label}"><span class="chipFace">${label}</span></button>`).join('')}
      </div>
      ${editing ? `<button class="textBtn logDay" data-action="log-day" data-date="${session.date}">Open in Log</button>` : ''}
      ${editing ? `<button class="deleteDay" data-action="delete-day" data-date="${session.date}">Delete this whole day</button>` : ''}` : `<div class="daySummary num" data-action="toggle-session" data-date="${session.date}">${daySummary(session)}</div>`}
  </section>`;
};

const listWithGhosts = (sessions) => {
  const ghostDates = [...new Set(view.pending.map((pending) => pending.date))].filter((date) => !sessions.some((session) => session.date === date));
  const ghosts = ghostDates.map((date) => ({ date, html: `<section class="card session open landing" id="session-${date}"><div class="head"><span class="headName">${dayLabel(date)}</span></div>${view.pending.filter((pending) => pending.date === date).map(renderPending).join('')}</section>` }));
  return [...sessions.map((session) => ({ date: session.date, html: renderSession(session) })), ...ghosts]
    .sort((first, second) => second.date.localeCompare(first.date))
    .map((item) => item.html)
    .join('');
};

const quickStart = () => `<p class="empty">Tap a lift to log it, or say or type what you did in the box below.</p>${quickAdd()}`;

const fullExodia = () => pieceProgress(todayIso()).every((piece) => piece.complete);
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
const preloadHands = () => ['/hamsa-512.png', '/hamsa-512-blue.png'].forEach((src) => { new Image().src = src; });
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
const FIST_OPEN = [480, 1000, 1400, 1700, 1920];
const FIST_TIMES = { eye: 2200, impact: 2480, fly: 3050, done: 3600 };
// [window the piece shows through, folded offset x %, y %, rim style]
// Windows each finger slides through, and how far it is tucked into the fist when closed (x %, y %).
const FIST = [
  ['0 39%, 25.8% 39%, 25.8% 47%, 28.5% 66%, 0 66%', 22, 4],
  ['25.8% 0, 38% 0, 42.25% 13%, 42.25% 47.5%, 25.8% 47.5%', 0, 35],
  ['42.25% 0, 57.45% 0, 57.45% 47.5%, 42.25% 47.5%', 0, 43],
  ['57.45% 13%, 62% 0, 74.2% 0, 74.2% 47.5%, 57.45% 47.5%', 0, 35],
  ['74.2% 39%, 100% 39%, 100% 66%, 71.5% 66%, 74.2% 47%', -22, 4],
];
// The closed fist: one smooth shape that follows the hand's own bowl, drawn in the hand's colours.
const FIST_PATH = 'M28.00 42.20 C35.83 41.97 64.17 41.97 72.00 42.20 C79.83 42.43 74.33 42.80 75.00 43.60 C75.67 44.40 75.73 45.10 76.00 47.00 C76.27 48.90 76.40 52.17 76.60 55.00 C76.80 57.83 77.08 61.50 77.20 64.00 C77.32 66.50 77.35 68.67 77.30 70.00 C77.25 71.33 77.03 71.33 76.90 72.00 C76.77 72.67 76.67 73.33 76.50 74.00 C76.33 74.67 76.10 75.33 75.90 76.00 C75.70 76.67 75.50 77.33 75.30 78.00 C75.10 78.67 74.88 79.33 74.70 80.00 C74.52 80.67 74.42 81.33 74.20 82.00 C73.98 82.67 73.70 83.33 73.40 84.00 C73.10 84.67 72.77 85.33 72.40 86.00 C72.03 86.67 71.65 87.33 71.20 88.00 C70.75 88.67 70.32 89.33 69.70 90.00 C69.08 90.67 68.25 91.33 67.50 92.00 C66.75 92.67 66.17 93.33 65.20 94.00 C64.23 94.67 62.80 95.50 61.70 96.00 C60.60 96.50 60.55 96.73 58.60 97.00 C56.65 97.27 52.87 97.60 50.00 97.60 C47.13 97.60 43.42 97.27 41.40 97.00 C39.38 96.73 39.03 96.50 37.90 96.00 C36.77 95.50 35.57 94.67 34.60 94.00 C33.63 93.33 32.88 92.67 32.10 92.00 C31.32 91.33 30.48 90.67 29.90 90.00 C29.32 89.33 29.02 88.67 28.60 88.00 C28.18 87.33 27.77 86.67 27.40 86.00 C27.03 85.33 26.73 84.67 26.40 84.00 C26.07 83.33 25.65 82.67 25.40 82.00 C25.15 81.33 25.08 80.67 24.90 80.00 C24.72 79.33 24.47 78.67 24.30 78.00 C24.13 77.33 24.07 76.67 23.90 76.00 C23.73 75.33 23.47 74.67 23.30 74.00 C23.13 73.33 23.07 72.67 22.90 72.00 C22.73 71.33 22.32 71.33 22.30 70.00 C22.28 68.67 22.62 66.50 22.80 64.00 C22.98 61.50 23.20 57.83 23.40 55.00 C23.60 52.17 23.73 48.90 24.00 47.00 C24.27 45.10 24.33 44.40 25.00 43.60 C25.67 42.80 20.17 42.43 28.00 42.20 Z';
const playFist = () => {
  const show = document.createElement('div');
  show.className = 'exodiaShow';
  show.setAttribute('aria-hidden', 'true');
  show.innerHTML = `<div class="exFly"><div class="exHand">
    ${FIST.map(([clip]) => `<i class="exWin" style="clip-path:polygon(${clip})"><i class="exImg"></i></i>`).join('')}
    <svg class="exFist" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${FIST_PATH}"/></svg>
    <i class="exFull"></i>
    ${FIST_LABELS.map((label) => `<b class="exLabel">${label}</b>`).join('')}
    <i class="exBlue"></i><i class="exRing"></i><i class="exRing"></i>
  </div></div>`;
  document.body.append(show);
  const hand = show.querySelector('.exHand');
  hand.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', fill: 'backwards' });
  show.querySelectorAll('.exImg').forEach((image, index) => {
    const [, x, y] = FIST[index];
    const thumb = index === 0 || index === 4;
    image.animate([
      { transform: `translate(${x}%, ${y}%)${thumb ? ` rotate(${index === 0 ? 12 : -12}deg)` : ''}` },
      { transform: 'none' },
    ], { duration: 520, delay: FIST_OPEN[index], easing: 'cubic-bezier(0.3, 1.35, 0.45, 1)', fill: 'backwards' });
  });
  show.querySelectorAll('.exLabel').forEach((label, index) => {
    const next = FIST_OPEN[index + 1] ?? FIST_TIMES.eye;
    label.animate([
      { opacity: 0, transform: 'translate(-50%, 10px)' },
      { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.35 },
      { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.75 },
      { opacity: 0, transform: 'translate(-50%, -10px)' },
    ], { duration: next - FIST_OPEN[index] + 80, delay: FIST_OPEN[index], easing: 'ease-out', fill: 'both' });
  });
  show.querySelector('.exFull').animate([{ clipPath: 'circle(0% at 50% 66%)' }, { clipPath: 'circle(80% at 50% 66%)' }], { duration: 480, delay: FIST_TIMES.eye, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'both' });
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
    hand.animate([{ filter: 'brightness(2.4)' }, { filter: 'brightness(1)' }], { duration: 480, easing: 'ease-out' });
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
  const weekVolume = state.sessions.filter((session) => session.date >= addDays(todayIso(), -6)).reduce((sum, session) => sum + sessionVolume(session), 0);
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
      ${view.exodiaOpen ? `<div class="rules${view.rulesEnter ? ' enter' : ''}">${pieces.map((piece) => `<div class="rule"><span><b>${piece.name}</b> <span class="muted">· ${piece.rule}</span></span><span class="muted num">${piece.complete ? 'Done' : Math.min(piece.done, piece.target) + ' of ' + piece.target}</span></div>`).join('')}<p class="empty" style="margin:8px 0 0">Heavy means your top set is at least 85% of your best. Last 7 days, any program.</p></div>` : ''}
    </section>
    <p class="section sessionsHead">Sessions${sessions[0] && !view.open.has(sessions[0].date) ? COLUMN_HEAD : ''}</p>
    <div class="list">${sessions.length || view.pending.length ? listWithGhosts(sessions.slice(0, 30)) : quickStart()}</div>
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
  return [...months.values()];
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
    return { date: point.date, lifted: Number(top.kg), top, sessionEstimate: point.value, estimate: bestSoFar, isPr };
  });
  const picked = rows.find((row) => row.date === view.chartPick);
  const values = rows.flatMap((row) => [...(lines.lift ? [row.lifted] : []), ...(lines.est ? [row.estimate] : [])]);
  const all = values.length ? values : rows.map((row) => row.lifted);
  const step = niceStep(Math.max(...all) - Math.min(...all) || 10);
  const low = Math.floor(Math.min(...all) / step) * step;
  const high = Math.max(low + step, Math.ceil(Math.max(...all) / step) * step);
  const first = parseIso(rows[0].date).getTime();
  const span = Math.max(1, parseIso(rows.at(-1).date).getTime() - first);
  const x = (date) => (rows.length === 1 ? 500 : ((parseIso(date).getTime() - first) / span) * 1000);
  const y = (value) => ((high - value) / (high - low)) * 1000;
  const ticks = Array.from({ length: Math.round((high - low) / step) + 1 }, (unused, index) => high - index * step);
  const path = (key) => smoothPath(rows.map((row) => [x(row.date), y(row[key])]));
  return `<div class="chips lineChips">${[['lift', 'Weight lifted'], ['est', 'Est. 1RM']].map(([key, label]) => `<button class="lineChip ${key}" data-action="toggle-line" data-line="${key}" aria-pressed="${lines[key]}"><i></i>${label}</button>`).join('')}</div>
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
  ${picked ? `<p class="pickInfo num"><b>${dayLabel(picked.date)}</b> · ${picked.top.kg} × ${picked.top.reps}${picked.top.rpe ? ` @ RPE ${picked.top.rpe}` : ''} · est. ${Math.round(picked.sessionEstimate)} kg${picked.isPr ? ' · 1RM PR' : ''}</p>` : ''}
  <div class="axis num"><span>${dayLabel(rows[0].date)}</span><span>${dayLabel(rows.at(-1).date)}</span></div>`;
};

const MUSCLES = [
  ['chest', 'Chest'], ['upperBack', 'Upper back'], ['lowerBack', 'Lower back'], ['quads', 'Quads'], ['hamstrings', 'Hamstrings'], ['shoulders', 'Shoulders'], ['biceps', 'Biceps'],
  ['triceps', 'Triceps'], ['glutes', 'Glutes'], ['abs', 'Abs'], ['calves', 'Calves'], ['forearms', 'Forearms'], ['adductors', 'Adductors'],
];
// First match wins: [name pattern, muscles worked hard, muscles helping (half a set)].
const MUSCLE_RULES = [
  [/leg curl|hamstring curl|nordic/, ['hamstrings']],
  [/leg ext/, ['quads']],
  [/back ext|hyperext|good morning/, ['lowerBack'], ['glutes', 'hamstrings']],
  [/romanian|\brdl\b|stiff/, ['hamstrings'], ['glutes', 'lowerBack']],
  [/deadlift/, ['hamstrings', 'glutes', 'lowerBack'], ['upperBack', 'forearms']],
  [/hack|leg press|squat|lunge|split|step.?up/, ['quads', 'glutes'], ['adductors']],
  [/hip thrust|glute|bridge|kickback|abduct/, ['glutes']],
  [/adduct/, ['adductors']],
  [/calf|calves/, ['calves']],
  [/close.?grip|\bdips?\b/, ['triceps'], ['chest']],
  [/tricep|pushdown|skull|extension|french/, ['triceps']],
  [/hammer/, ['biceps', 'forearms']],
  [/curl/, ['biceps'], ['forearms']],
  [/overhead|ohp|shoulder|military|arnold|lateral|delt|face pull|front raise|upright/, ['shoulders'], ['triceps']],
  [/bench|chest|push.?up|fly|flye|pec|incline|decline|press/, ['chest'], ['shoulders', 'triceps']],
  [/pull.?up|chin.?up|pulldown|\blat\b|row|shrug/, ['upperBack'], ['biceps']],
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
const RECOVERY_DAYS = { quads: 6, hamstrings: 6, glutes: 6, adductors: 5, lowerBack: 5, upperBack: 4, chest: 3, shoulders: 3, biceps: 3, triceps: 3, calves: 3, forearms: 4, abs: 4 };
const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00`) - new Date(`${from}T12:00`)) / 86400000);
const muscleLoad = () => {
  const today = todayIso();
  const since = addDays(today, -6);
  const sets = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  const fatigue = Object.fromEntries(MUSCLES.map(([key]) => [key, 0]));
  for (const session of state.sessions) {
    if (session.date < since || session.date > today) continue;
    const fresh = (key) => Math.max(0, 1 - daysBetween(session.date, today) / RECOVERY_DAYS[key]);
    for (const exercise of session.exercises) {
      const rule = MUSCLE_RULES.find(([pattern]) => pattern.test(exercise.name.toLowerCase()));
      if (!rule) continue;
      const count = validSets(exercise).filter((set) => !set.warmup).length;
      for (const [keys, share] of [[rule[1], 1], [rule[2] ?? [], 0.5]]) {
        for (const key of keys) {
          sets[key] += count * share;
          fatigue[key] += count * share * fresh(key);
        }
      }
    }
  }
  return { sets, fatigue };
};
const bodySvg = (side, { sets, fatigue }) => `<svg class="bodyFig" viewBox="0 0 100 200" aria-hidden="true">${anatomy[side].map(([key, points]) => {
  const trained = key && sets[key] > 0;
  return `<polygon points="${points}" class="${!key ? 'bodyBone' : trained ? 'bodyHit' : 'bodyRest'}"${trained ? ` style="fill-opacity:${(0.16 + 0.84 * Math.min(1, fatigue[key] / 6)).toFixed(2)}"` : ''}/>`;
}).join('')}</svg>`;
const renderMuscles = () => {
  loadAnatomy();
  if (!anatomy || anatomy === 'loading' || state.sessions.length === 0) return '';
  const load = muscleLoad();
  const { sets } = load;
  return `<p class="section muscleHead">Anatomy<span>Sets · 7 days</span></p>
    <div class="muscles">${bodySvg('front', load)}${bodySvg('back', load)}
      <div class="muscleList">${MUSCLES.map(([key, label]) => `<div class="muscleRow${sets[key] ? '' : ' muted'}"><span>${label}</span><span class="num">${Math.round(sets[key])}</span></div>`).join('')}</div>
    </div>
    <p class="muscleNote">Red is still recovering: about 6 days for legs, 4 for abs and forearms, 3 for chest and arms. Recovered muscles keep a light tint until 7 days have passed.</p>`;
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
  if (view.trendOpen === null && names.length) view.trendOpen = big[0] || names[0];
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
      <button class="head" data-action="toggle-trend" data-name="${esc(name)}" aria-expanded="${open}">
        <span class="headName">${esc(name)}</span>
        <span class="meta num">${Math.round(best)} kg</span>
        ${ICONS.chev}
      </button>
      ${open ? `
        <div class="tiles">
          <div class="tile"><p class="tileValue num">${lifted ? lifted.kg : '–'}<small>${lifted ? ` × ${lifted.reps}` : ''}</small></p><p class="tileLabel">Best lifted</p><p class="tileSub">All time</p></div>
          <div class="tile"><p class="tileValue num">${Math.round(best)}<small> kg</small></p><p class="tileLabel">Est. 1RM ${infoButton()}</p><p class="tileSub">All time</p></div>
          <button class="tile" data-action="jump-session" data-date="${last.date}" aria-label="Latest top set ${lastTop.kg} × ${lastTop.reps}, open ${dayLabel(last.date)}"><p class="tileValue num">${lastTop.kg}<small> × ${lastTop.reps}</small></p><p class="tileLabel">Latest top set</p><p class="tileSub">${dayLabel(last.date)}</p></button>
        </div>
        ${view.info ? ESTIMATE_INFO : ''}
        <div class="chartHead">
          <p class="chartTitle">Trend</p>
          ${[[90, '3M'], [180, '6M'], [365, '1Y'], [0, 'All']].map(([days, label]) => `<button class="chip" data-action="range" data-days="${days}" aria-pressed="${view.range === days}"><span class="chipFace">${label}</span></button>`).join('')}
        </div>
        ${points.length ? chartFor(points) : '<p class="empty">No sessions in this range.</p>'}
` : `<p class="summary num">${all.length} ${all.length === 1 ? 'session' : 'sessions'} · last ${dayLabel(last.date)}</p>`}
    </section>`;
  };
  return `<main class="page trendsPage">
    <p class="eyebrow">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1 class="title">Trends</h1>
    ${renderMuscles()}
    ${names.length ? '' : '<p class="empty" style="margin-top:20px">Log a few sessions and your trends show up here.</p>'}
    ${big.length ? `<p class="section">Big 3</p><div class="list">${big.map(card).join('')}</div>` : ''}
    ${rest.length ? `<p class="section">${big.length ? 'Other lifts' : 'Lifts'}</p><div class="list">${rest.map(card).join('')}</div>` : ''}
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

const chatEntry = ({ stamp, who, said, heard, did, raw, fixIndex: index, voiceId, compact, manual }) => {
  const fixIndex = manual ? undefined : index;
  const lines = [].concat(did);
  const failed = OFF_LINE.test(lines[0] || '');
  const off = lines.some((line) => OFF_LINE.test(line));
  const youSaid = `${esc(said)}${heard && heard !== said ? `<span class="bubbleHeard">Heard: ${esc(heard)}</span>` : ''}${off && fixIndex !== undefined ? `<span class="bubbleHint">${failed ? 'Didn’t go through' : 'Partly logged'} · tap to edit</span>` : ''}`;
  return `<div class="chatItem${off ? ' off' : ''}">
  ${stamp || who ? `<p class="chatTime">${[stamp, who && esc(who)].filter(Boolean).join(' · ')}</p>` : ''}
  ${fixIndex === undefined ? `<div class="bubbleIn">${youSaid}</div>` : `<button class="bubbleIn" data-action="edit-said" data-index="${fixIndex}">${youSaid}</button>`}
  <div class="bubbleOut"><p>${esc(lines.join(' · '))}</p>${compact ? '' : rawDetails(raw)}${voiceId ? `<button class="textBtn" data-action="retry-voice" data-voice="${voiceId}">Try again</button>` : failed && fixIndex !== undefined && said !== 'Voice note' ? `<button class="textBtn" data-action="retry-said" data-index="${fixIndex}">Try again</button>` : ''}</div>
</div>`;
};

const chatList = (entries, compact) => entries.map(({ entry, index }, position) => chatEntry({ ...entry, stamp: chatStamp(entry.at, entries[position - 1]?.entry.at), fixIndex: index, compact })).join('');

const logMatchesDay = (entry, date) => (entry.raw || '').includes(date) || entry.did.some((line) => line.includes(dayLabel(date)));

const renderDayNow = (date) => {
  const session = sessionFor(date);
  return `<section class="card dayNow">
    <p class="dayNowTitle">${dayLabel(date)} right now</p>
    ${session ? `${session.exercises.map((exercise) => `<div class="dayNowRow"><span class="dayNowName">${esc(exercise.name)}</span><span class="dayNowSets num">${exercise.sets.map((set) => `${set.kg}×${set.reps}${set.rpe ? ` @${set.rpe}` : ''}${set.warmup ? ' w' : ''}`).join(' · ')}</span></div>`).join('')}${session.cardio ? `<div class="dayNowRow"><span class="dayNowName">Cardio</span><span class="dayNowSets num">${session.cardio} min</span></div>` : ''}${accessoriesOf(session) ? `<div class="dayNowRow"><span class="dayNowName">Accessories</span><span class="dayNowSets num">${accessoriesOf(session)} min</span></div>` : ''}${session.label ? `<div class="dayNowRow"><span class="dayNowName">Name</span><span class="dayNowSets">${esc(session.label)}</span></div>` : ''}` : '<p class="empty" style="margin:6px 0">Nothing logged on this day.</p>'}
    <p class="dayNowHint">Say or type what's wrong. Changes go to this day.</p>
  </section>`;
};

const renderLog = () => `<main class="page">
    <p class="eyebrow">What you said, and what Exodia did</p>
    <h1 class="title">Log</h1>
    ${view.logDate ? `<p class="logFilter">Showing ${dayLabel(view.logDate)}<button class="textBtn" data-action="log-all">Show all</button></p>` : ''}
    <div class="chat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).filter(({ entry }) => !view.logDate || logMatchesDay(entry, view.logDate)).reverse(), false) || '<p class="empty">Say or type something in the box below and it shows up here.</p>'}</div>
  ${view.logDate ? renderDayNow(view.logDate) : ''}
  </main>`;

const loadAdmin = () => fetch('/api/admin', { headers: { 'x-exodia-key': syncState.profile } })
  .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Not allowed'))))
  .then((data) => {
    view.adminRows = data.commands;
    view.adminFeedback = data.feedback || [];
  })
  .catch(() => {
    view.adminRows = [];
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

const FEEDBACK_STATUS = [['new', 'New'], ['planned', 'Planned'], ['done', 'Done'], ['declined', 'No']];

const renderAdmin = () => {
  if (!view.adminRows) {
    if (!view.adminLoading) {
      view.adminLoading = true;
      loadAdmin().finally(() => {
        view.adminLoading = false;
      });
    }
    return '<main class="page"><h1 class="title">Admin</h1><p class="empty">Loading every command…</p></main>';
  }
  return `<main class="page">
    <p class="eyebrow">Only visible to you</p>
    <h1 class="title">Admin</h1>
    <p class="section">Feedback</p>
    ${(view.adminFeedback || []).map((item) => `<div class="feedbackRow">
      <p class="feedbackHead"><span class="${item.kind === 'bug' ? 'prPill' : 'prPill est'}">${item.kind === 'bug' ? 'Bug' : 'Idea'}</span><b>${esc(item.title)}</b></p>
      <p class="feedbackDetails">${esc(item.details)}</p>
      <p class="feedbackMeta">${esc(item.who)} · ${new Date(item.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
      <div class="feedbackStatus">${FEEDBACK_STATUS.map(([value, label]) => `<button class="chip" data-action="feedback-status" data-id="${item.id}" data-status="${value}" aria-pressed="${item.status === value}"><span class="chipFace">${label}</span></button>`).join('')}</div>
    </div>`).join('') || '<p class="empty">No feedback yet.</p>'}
    <p class="section">Every command</p>
    <div class="chat">${view.adminRows.slice().reverse().map((row, index, rows) => chatEntry({ ...row, stamp: chatStamp(row.at, rows[index - 1]?.at) })).join('') || '<p class="empty">No commands yet.</p>'}</div>
  </main>`;
};

const aiInstructions = () => `Add my training to my Exodia app.
If you can send web requests: POST ${location.origin}/api/add with the header "x-exodia-key: ${syncState.profile}" and the JSON body {"text": "<my training in plain words, with dates>"}. It reads any format and adds it to the right days.
If you cannot send web requests: write my training as plain lines with dates, like "2026-10-31: Bench Press 120x5, 120x5, 120x4", and I will paste them into Exodia's box.
Keep the key private; it gives full access to my log.`;

const renderYou = () => {
  const big = ['Deadlift', 'Squat', 'Bench Press'];
  const lifts = [...big, ...loggedLifts().filter((name) => !big.includes(name)).sort((first, second) => bestOverall(second) - bestOverall(first)).slice(0, 7)];
  return `<main class="page youPage">
    <p class="eyebrow">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1 class="title"><label for="name" class="sr">Your name</label><input id="name" class="titleInput" autocomplete="given-name" value="${esc(state.name || '')}" placeholder="You" data-name-input></h1>
    <p class="section liftHead"><span>Best lifts</span><span class="colHead liftCol">Best lifted</span><span class="colHead e1Col">e1RM ${infoButton()}</span></p>
    ${view.info ? ESTIMATE_INFO : ''}
    <section class="card">
      ${lifts.map((name) => {
        const lifted = heaviestLifted(name);
        return `<button class="row liftRow" data-action="open-trend" data-name="${esc(name)}"><span class="liftName">${esc(name)}</span><span class="liftCol liftSet num">${lifted ? `<span>${lifted.kg}</span><span class="liftX">×</span><span>${lifted.reps}</span>` : '<span></span><span></span><span>–</span>'}</span><span class="e1Col e1rm">${lifted ? Math.round(bestOverall(name)) : ''}</span></button>`;
      }).join('')}
    </section>
    <p class="note">Best lifted is the heaviest set you have done. e1RM is your estimated one-rep max. Paused and other variations count as their own lift.</p>
    <p class="section">Add from any AI</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;font-size:15px">Let ChatGPT, Gemini or Claude add your training</span><button class="textBtn" data-action="copy-ai">${view.copiedAi ? 'Copied' : 'Copy instructions'}</button></div>
    </section>
    <p class="section">Your link</p>
    <section class="card">
      <div class="row"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px">${esc(profileLink())}</span><button class="textBtn" data-action="copy-link">${view.copied ? 'Copied' : 'Copy'}</button></div>
      <div class="row"><label class="sr" for="join-link">Link from another device</label><input id="join-link" class="pill" style="flex:1;width:auto;text-align:left;font-weight:400;font-size:15px" placeholder="Paste a link from another device"><button class="textBtn" data-action="join-link">Use</button></div>
      ${view.linkNote ? `<div class="row"><span class="muted" role="status" style="font-size:15px">${esc(view.linkNote)}</span></div>` : ''}
      <div class="row"><span style="flex:1">Synced</span><span class="muted">${view.syncFailed ? 'Offline, will retry' : view.syncedAt ? 'Up to date' : 'Connecting…'}</span></div>
    </section>
    <p class="note">Open your link once on a new phone or computer and your lifts are there. Anyone with the link can see and change your lifts, so keep it to yourself.</p>
    <p class="section">Backup</p>
    <section class="card">
      <div class="row"><button class="textBtn" data-action="export">Download a backup</button></div>
      <div class="row"><label class="textBtn" style="display:flex;align-items:center;cursor:pointer">Restore a backup<input type="file" accept="application/json" class="sr" data-action="import"></label></div>
    </section>
  </main>`;
};

const desktopQuery = window.matchMedia('(min-width: 1024px)');

const renderProgress = () => {
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
  const weeks = Array.from({ length: 6 }, (unused, index) => {
    const end = addDays(todayIso(), -7 * (5 - index));
    const volume = state.sessions.filter((session) => session.date > addDays(end, -7) && session.date <= end).reduce((sum, session) => sum + sessionVolume(session), 0);
    return { end, volume };
  });
  const maxVolume = Math.max(1, ...weeks.map((week) => week.volume));
  return `<p class="eyebrow">Progress</p>
    <h2 class="title" style="font-size:28px;line-height:34px">${focus ? esc(focus) : 'Your lifts'}</h2>
    <section class="card" style="margin-top:16px;padding:12px 16px 4px">
      ${focus ? `<button class="chartLink" data-action="open-trend" data-name="${esc(focus)}"><span class="chartTitle">Est. 1RM · ${Math.round(bestOverall(focus))} kg</span><span class="textBtn" style="min-height:0">Open in Trends</span></button>${chartFor(history.get(focus))}` : '<p class="empty">Your strongest lift shows up here once you log it.</p>'}
    </section>
    <p class="section">Volume per week · tonnes</p>
    <section class="card" style="padding:14px 16px">
      <div class="weekBars" role="group" aria-label="Volume for the last 6 weeks">${weeks.map((week, index) => `<button class="weekBar" data-action="pick-week" data-index="${index}" aria-pressed="${(view.volumeWeek ?? 5) === index}" aria-label="Week ending ${dayLabel(week.end)}, ${tonnes(week.volume)}"><span class="barValue num">${week.volume ? (week.volume / 1000).toFixed(1) : ''}</span><div style="height:${Math.round((week.volume / maxVolume) * 78)}%"></div></button>`).join('')}</div>
      <div class="axis num" style="margin:6px 0 0"><span>${(view.volumeWeek ?? 5) === 5 ? 'This week' : 'Week ending ' + dayLabel(weeks[view.volumeWeek ?? 5].end)}</span><span>${tonnes(weeks[view.volumeWeek ?? 5].volume)}</span></div>
    </section>
    <p class="section">Best lifts</p>
    <section class="card">
      ${lifts.slice(0, 10).map((name) => `<button class="row liftRow" data-action="focus-lift" data-name="${esc(name)}" aria-pressed="${name === focus}"><span style="flex:1">${esc(name)}</span><span class="num" style="${bestSingle(name) ? 'font-weight:600' : 'color:var(--text2)'}">${bestSingle(name) ? `${bestSingle(name)} kg` : `est. ${Math.round(bestOverall(name))}`}</span></button>`).join('') || '<p class="empty" style="margin:14px 0">Nothing yet.</p>'}
    </section>`;
};

const SHORT_NAMES = { 'Bench Press': 'Bench', 'Pause Bench Press': 'P.bench', 'Close-Grip Bench Press': 'CG bench', 'Dumbbell Bench Press': 'DB', 'Incline Bench Press': 'Inc', 'Incline Dumbbell Press': 'Inc DB', 'Overhead Press': 'OHP', 'Deadlift': 'DL', 'Stiff-Legged Deadlift': 'SLDL', 'Romanian Deadlift': 'RDL', 'Squat': 'SQ', 'Hack Squat': 'Hack', 'Leg Press': 'Leg press', 'Leg Extension': 'Leg ext', 'Lat Pulldown': 'Lat pull', 'Hip Thrust': 'Thrust', 'Barbell Curl': 'Curl' };

const dayName = (session) => {
  const peaks = topSets(session).map(({ name, set }) => `${SHORT_NAMES[name] || name}${prKind(name, session.date, set) === 'max' ? ' PR' : ''} ${set.kg}×${set.reps}`);
  const text = [...peaks, ...(session.cardio ? [`Cardio ${session.cardio}m`] : [])].join(', ') || 'Session';
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
  return `${[['home', 'Home', ICONS.home], ['trends', 'Trends', ICONS.trends.replace('width="24" height="24"', 'width="22" height="22"')], ['log', 'Log', ICONS.log], ['feedback', 'Feedback', ICONS.idea], ...(view.isAdmin ? [['admin', 'Admin', ICONS.admin]] : []), ['you', state.name || 'You', ICONS.you]].map(([route, label, icon]) => `<a class="navItem${view.route === route ? ' on' : ''}" href="#/${route === 'home' ? '' : route}" ${view.route === route ? 'aria-current="page"' : ''}>${icon}${esc(label)}</a>`).join('')}
      <label class="searchBox">${ICONS.search}<span class="sr">Search your training</span><input id="search" type="search" placeholder="Search your training" enterkeyhint="search" autocomplete="off" value="${esc(view.search.query)}"></label>
      <div id="drawerList">${drawerList()}</div>`;
};

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
const pickButton = (name, date) => {
  const last = lastSetsFor(name, date);
  return `<button class="pick" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(date)}"><span style="flex:1;min-width:0"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>`;
};
const nameQuery = () => {
  const text = view.draft.trim();
  return text && !/\d/.test(text) && text.split(/\s+/).length <= 3 && !view.fixing && !view.editContext ? text : '';
};

const pendingChat = () => view.pending.map((pending) => `<div class="chatItem"><div class="bubbleIn">${esc(pending.text)}</div><div class="bubbleOut typing" role="status" aria-label="Working on it"><i></i><i></i><i></i></div></div>`).join('');

const quickAdd = () => `<div class="quickAdd"><p class="section quickHead">Quick add${view.composer ? '<button class="textBtn" data-action="hide-quick">Hide</button>' : ''}</p><div class="picks"><label class="pick"><span style="flex:1"><span class="pickName">Import from a file</span><span class="pickLast">A StrengthLog or Strong export, notes, a spreadsheet</span></span><span class="plusDot" aria-hidden="true">${ICONS.clip}</span><input type="file" class="sr" accept=".csv,.txt,.tsv,.json,.md,text/*" data-action="import-file"></label>${renderPicks()}</div></div>`;

const sheetBody = () => (nameQuery()
  ? `<div class="picks">${renderPicks()}</div>`
  : `${view.showQuick ? '' : `<div class="chat">${chatList((state.log || []).map((entry, index) => ({ entry, index })).reverse(), true)}${pendingChat()}</div>`}${view.showQuick || (!view.draft.trim() && !view.quickHidden) ? quickAdd() : ''}`);

const renderSheet = () => `<div class="sheet${view.showQuick && !nameQuery() ? ' quickMode' : ''}" role="group" aria-label="Chat">
  <button class="grabber" data-action="close-chat" aria-label="Close chat"></button>
  <div class="sheetBody scroll" data-mode="${nameQuery() ? `q:${esc(nameQuery())}` : 'chat'}">${sheetBody()}</div>
</div>`;

const openChat = () => {
  if (!view.composer) view.trayEnter = true;
  view.composer = true;
  if (!view.composerDate) view.composerDate = todayIso();
};

const scrollChat = () => {
  const body = document.querySelector('.sheetBody');
  if (body) body.scrollTop = body.scrollHeight;
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
  const hasText = view.draft.trim().length > 0 || Boolean(view.voiceBlob);
  return `<div class="promptButtons">${hasText
    ? `<button class="roundBtn soft" data-action="mic" aria-label="Speak">${ICONS.mic}</button><button class="roundBtn send" data-action="send" aria-label="Log it">${ICONS.up}</button>`
    : `<button class="roundBtn send" data-action="mic" aria-label="Speak">${ICONS.mic}</button>`}</div>`;
};

const contextChip = () => {
  const [kind, label, action, aria] = view.fixing ? ['Fixing', 'an earlier message', 'clear-edit', 'Stop fixing']
    : view.editContext ? ['Editing', `${view.editContext.label || view.editContext.names.join(', ') || 'Workout'} · ${dayLabel(view.editContext.date)}`, 'clear-edit', 'Stop editing']
    : view.composerDate && view.composerDate !== todayIso() ? ['Adding to', dayLabel(view.composerDate), 'clear-day', 'Add to today instead'] : [];
  return kind ? `<div class="contextChip"><span class="contextKind">${kind}</span><span class="contextLabel">${esc(label)}</span><button class="contextX" data-action="${action}" aria-label="${aria}">${ICONS.close}</button></div>` : '';
};

const renderDock = () => `<div class="dock${view.composer ? ' open' : ''}">
  ${view.composer ? renderSheet() : ''}
  ${view.confirm ? `<div class="confirm" role="alertdialog" aria-label="Confirm removal"><p>Remove ${esc(view.confirm.text)}?</p><div class="confirmRow"><button class="textBtn" data-action="confirm-no">Cancel</button><button class="confirmYes" data-action="confirm-yes">Yes, remove</button></div></div>` : ''}
  ${view.status ? `<p class="dockStatus" role="status">${esc(view.status)}</p>` : ''}
  <div class="prompt${view.draft.trim() ? ' hasText' : ''}${view.listening ? ' listening' : ''}${contextChip() ? ' hasChip' : ''}">
    ${contextChip()}
    <label for="draft" class="sr">Type or say what you did</label>
    <textarea id="draft" class="promptInput" rows="1" enterkeyhint="send" autocomplete="off">${esc(view.draft)}</textarea>
    ${view.listening
      ? `<span class="hint live" aria-hidden="true"><span class="liveText">${esc(liveLine())}</span></span>`
      : `<span class="hint${typewriter.fading ? ' fading' : ''}" aria-hidden="true">${esc(typewriter.text)}</span>`}
    <div class="promptBar">${view.listening ? `<button class="roundBtn soft" data-action="cancel-mic" aria-label="Discard what you said">${ICONS.close}</button><span class="wave${view.speaking ? ' speaking' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>` : `<button class="roundBtn soft plusBtn" data-action="open-quick" aria-label="Quick add">${ICONS.plus}</button><span class="modelTag">Exodia <span class="modelVersion">1.0</span></span>`}${promptButtons()}</div>
  </div>
</div>`;

const fitDraft = (draft) => {
  draft.style.height = 'auto';
  draft.style.height = `${draft.scrollHeight}px`;
};

const syncDock = () => {
  const dock = document.querySelector('.dock');
  const prompt = dock?.querySelector('.prompt');
  if (!prompt) return;
  prompt.classList.toggle('hasText', view.draft.trim().length > 0);
  prompt.querySelector('.promptButtons').outerHTML = promptButtons();
  const sheet = dock.querySelector('.sheet');
  if (view.composer && (!sheet || sheet.classList.contains('leaving'))) {
    sheet?.remove();
    document.querySelector('.chatScrim')?.remove();
    dock.getAnimations().forEach((animation) => animation.cancel());
    dock.classList.add('open');
    dock.insertAdjacentHTML('afterbegin', renderSheet());
    dock.insertAdjacentHTML('beforebegin', '<div class="chatScrim"></div>');
    tuckCards();
    scrollChat();
    animateChat(true);
  } else if (view.composer) {
    sheet.classList.toggle('quickMode', Boolean(view.showQuick && !nameQuery()));
    const body = sheet.querySelector('.sheetBody');
    const mode = nameQuery() ? `q:${nameQuery()}` : 'chat';
    if (body.dataset.mode !== mode) {
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

const EXAMPLES = ['120 for 3 bench press', '240 deadlift, reps 4-2', 'Squat 140 for 5, 5 and 5', 'Ran 25 min', 'Hack squat 200 for 8 last Friday', 'Curls 20 for 12, 10, 8', 'Walked 40 min'];
const typewriter = { text: '', index: 0, length: 0, fading: false };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
(window.requestIdleCallback || setTimeout)(preloadHands);

const tickTypewriter = () => {
  const examples = view.route === 'feedback' ? FEEDBACK_EXAMPLES : EXAMPLES;
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
const turnQuery = window.matchMedia('(orientation: landscape) and (pointer: coarse) and (max-height: 520px)');
let turn = 0;
const turnUi = () => {
  const angle = screen.orientation?.angle ?? window.orientation ?? 0;
  turn = turnQuery.matches ? (angle === 90 ? -90 : 90) : 0;
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
window.addEventListener('resize', () => { turnUi(); fitNames(); });

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

const tuckCards = () => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const sheet = dock.querySelector('.sheet');
  const box = dock.offsetHeight - (sheet ? sheet.offsetHeight + 8 : 0);
  setVar('--dock-h', `${box}px`);
  const tall = turn ? window.innerWidth : window.visualViewport?.height || window.innerHeight;
  setVar('--sheet-h', `${Math.round(Math.max(180, Math.min(720, tall - box - (desktopQuery.matches ? 64 : view.showQuick ? 110 : Math.max(120, tall * 0.24)))))}px`);
  const line = uiBox(dock).bottom - box;
  for (const card of document.querySelectorAll('.page .card')) {
    const box = uiBox(card);
    const shown = line - box.top;
    card.classList.toggle('tucked', box.height <= 140 && shown < box.height);
  }
};
document.addEventListener('scroll', () => requestAnimationFrame(tuckCards), { passive: true, capture: true });
window.addEventListener('resize', tuckCards);
window.visualViewport?.addEventListener('resize', () => requestAnimationFrame(tuckCards));

const onboarding = () => view.route === 'home' && (Boolean(view.onboard?.busy || view.onboard?.status) || (!state.name && state.sessions.length === 0));

const ONBOARD_EXAMPLES = [
  'Mon 28 Oct\nBench 100 × 5, 5, 5\nIncline dumbbell 30s for 10',
  'Date,Exercise,Weight,Reps\n2026-10-28,Squat,140,5\n2026-10-28,Squat,140,5',
  'Last week I deadlifted 220 for 3,\nbench was 100 for 5 paused,\nand I ran 25 minutes on Friday',
  'Leg day 24/10\nHack squat 200×8, 200×8, 200×6\nLeg extension 70×12, 70×12'
];
const onboardExample = { index: 0, fading: false };

const renderOnboard = () => {
  view.onboard ??= { name: '', data: '' };
  const { busy, status, recording: listening, hearing, file } = view.onboard;
  const filled = view.onboard.data.trim().length > 0 || Boolean(file);
  const locked = busy || listening || hearing;
  return `<main class="page onboard">
    <span class="logo onboardLogo" aria-hidden="true"></span>
    <h1 class="title">Welcome to Exodia</h1>
    <p class="onboardLead">Log your training by talking or typing. No account, no setup.</p>
    <label class="sr" for="onboardName">Your name</label>
    <input id="onboardName" class="onboardField" autocomplete="given-name" placeholder="Your name" value="${esc(view.onboard.name)}" ${busy ? 'disabled' : ''}>
    <p class="onboardMove"><b>Coming from another app?</b> Drop your StrengthLog or Strong export, your notes or a spreadsheet in the box below, or just tell it about your last weeks. Exodia sorts everything into days and your history and trends are ready in seconds.</p>
    ${status ? `<p class="onboardStatus" role="status">${esc(status)}</p>` : ''}
    <button class="textBtn onboardBlank" data-action="onboard-blank" ${locked ? 'disabled' : ''}>Nothing to bring? Start blank</button>
  </main>
  <div class="dock onboardDock">
    <div class="prompt onboardPrompt${filled ? ' hasText' : ''}${listening ? ' listening' : ''}${file ? ' hasChip' : ''}">
      ${file ? `<div class="contextChip"><span class="contextKind">File</span><span class="contextLabel">${esc(file.name)}</span><button class="contextX" data-action="onboard-unfile" aria-label="Remove file">${ICONS.close}</button></div>` : ''}
      <label for="onboardData" class="sr">Your training so far</label>
      <textarea id="onboardData" class="promptInput onboardData" rows="3" ${locked ? 'disabled' : ''}>${esc(view.onboard.data)}</textarea>
      ${listening ? '<span class="hint live" aria-hidden="true"><span class="liveText">Listening… tap stop when you are done</span></span>' : hearing ? '<span class="hint live" aria-hidden="true"><span class="liveText">Writing down what you said…</span></span>' : busy ? '<span class="hint live" aria-hidden="true"><span class="liveText">Reading your training…</span></span>' : `<span class="hint onboardHint${onboardExample.fading ? ' fading' : ''}" aria-hidden="true">${esc(ONBOARD_EXAMPLES[onboardExample.index])}</span>`}
      <div class="promptBar"><label class="roundBtn soft onboardFile" aria-label="Add a file">${ICONS.plus}<input type="file" class="sr" accept=".csv,.txt,.tsv,.json,.md,text/*" data-action="onboard-file" ${locked ? 'disabled' : ''}></label><span class="modelTag onboardTag">Exodia <span class="modelVersion">1.0</span></span><div class="promptButtons">${listening ? `<button class="roundBtn stopBtn" data-action="onboard-stop" aria-label="Stop">${ICONS.stop}</button>` : `${filled ? `<button class="roundBtn soft" data-action="onboard-mic" aria-label="Talk" ${locked ? 'disabled' : ''}>${ICONS.mic}</button><button class="roundBtn send" data-action="onboard-start" aria-label="Import and start" ${locked ? 'disabled' : ''}>${ICONS.up}</button>` : `<button class="roundBtn send" data-action="onboard-mic" aria-label="Talk" ${locked ? 'disabled' : ''}>${ICONS.mic}</button>`}`}</div></div>
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

const render = () => {
  const app = document.getElementById('app');
  const hit = exodiaHit();
  if (view.wasHit === false && hit && !view.celebrating) celebrate();
  view.wasHit = hit;
  view.blue = hit && view.celebrating !== 'orange';
  if (onboarding()) {
    const focusedId = document.activeElement?.id;
    app.innerHTML = renderOnboard() + devExtras();
    if (focusedId) document.getElementById(focusedId)?.focus();
    return;
  }
  const focused = document.activeElement;
  const draftFocused = focused && focused.id === 'draft';
  const caret = draftFocused ? [focused.selectionStart, focused.selectionEnd] : null;
  const searchFocused = focused && focused.id === 'search';
  const oldBody = document.querySelector('.sheetBody');
  const chatScroll = oldBody && (view.showQuick || oldBody.scrollHeight - oldBody.scrollTop - oldBody.clientHeight > 40) ? oldBody.scrollTop : null;
  const page = view.route === 'feedback' ? renderFeedback() : view.route === 'trends' ? renderTrends() : view.route === 'you' ? renderYou() : view.route === 'log' ? renderLog() : view.route === 'admin' ? renderAdmin() : renderHome();
  const dock = `${view.composer ? '<div class="chatScrim"></div>' : ''}${renderDock()}`;
  const layout = desktopQuery.matches
    ? `<div class="desk">
        <nav class="side" aria-label="Exodia"><a class="sideBrand" href="#/"><span class="logo${view.blue ? ' blue' : ''}" aria-hidden="true"></span>Exodia</a>${view.isAdmin ? '<button class="devBtn" data-action="dev-menu" aria-label="Developer menu"></button>' : ''}${drawerContent()}</nav>
        <div class="center">${page}${dock}</div>
        <aside class="right" aria-label="Progress">${renderProgress()}</aside>
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
    ${view.toast ? `<div class="toast ${view.toast.kind}${view.toast.open ? ' open' : ''}" role="status">
      <div class="toastMain"><button class="toastBody" data-action="${view.toast.detail ? 'toggle-toast' : 'dismiss-toast'}" ${view.toast.detail ? `aria-expanded="${Boolean(view.toast.open)}"` : 'aria-label="Dismiss"'}>${view.toast.kind === 'max' ? `<span class="trophy">${ICONS.trophy}</span>` : ''}<div class="toastWords"><p class="toastTitle">${esc(view.toast.title)}</p><p class="toastText num">${esc(view.toast.text)}</p></div>${view.toast.detail ? `<span class="toastChev">${ICONS.chev}</span>` : ''}</button>${view.toast.undo ? '<button class="toastEdit" data-action="undo-change">Undo</button>' : view.toast.edit ? '<button class="toastEdit" data-action="edit-added">Edit</button>' : ''}</div>
      ${view.toast.detail ? `<div class="toastMore"><div><div class="toastDetail">${view.toast.detail}${view.toast.edit && view.toast.undo ? '<button class="textBtn toastEditLink" data-action="edit-added">Change something</button>' : ''}</div></div></div>` : ''}
    </div>` : ''}${devExtras()}`;
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
  if (view.trendScroll && view.route === 'trends') {
    const card = [...document.querySelectorAll('[data-trend]')].find((item) => item.dataset.trend === view.trendScroll);
    view.trendScroll = null;
    if (card) requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
  }
  if (view.scrollTarget) {
    const card = document.getElementById(`session-${view.scrollTarget}`);
    view.scrollTarget = null;
    if (card) requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
};

const closeComposer = () => {
  view.composer = false;
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

const startLiveText = () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition || !recording) return;
  const recognizer = new Recognition();
  recognizer.lang = navigator.language || 'en-US';
  recognizer.continuous = true;
  recognizer.interimResults = true;
  const before = view.live ? `${view.live} ` : '';
  recognizer.onresult = (event) => {
    view.live = before + [...event.results].map((result) => result[0].transcript).join(' ').trim();
    const line = document.querySelector('.prompt .liveText');
    if (line) line.textContent = liveLine();
  };
  recognizer.onerror = () => {};
  recognizer.onend = () => {
    if (recording && recording.recognizer === recognizer) startLiveText();
  };
  recording.recognizer = recognizer;
  try {
    recognizer.start();
  } catch {
    recording.recognizer = null;
  }
};

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

const guessDate = (text, fallback) => {
  if (/\byesterday\b/i.test(text)) return addDays(todayIso(), -1);
  const weekday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].findIndex((day) => new RegExp(`\\b${day}[a-z]*\\b`, 'i').test(text));
  if (weekday === -1) return fallback;
  const back = (new Date().getDay() - weekday + 7) % 7 || 7;
  return addDays(todayIso(), -back);
};

const EDIT_WORDS = /\b(remove|delete|undo|change|edit|fix|wrong|instead|ta bort|radera|ändra|byt)\b/i;

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
    if (!names.size && session.cardio) rows.push(['Cardio', `${session.cardio} min`]);
    return `<p class="toastDay">${dayLabel(date)}</p>${rows.map(([name, sets]) => `<div class="toastRow"><span class="toastLift">${esc(name)}</span><span class="toastSets num">${esc(sets)}</span></div>`).join('')}`;
  }).join('');
};

const showResult = (did, touched, before = null) => {
  glowFor(touched);
  const detail = resultDetail(touched);
  const named = touched.filter((item) => item.name);
  const edit = named.length ? { date: named[0].date, names: [...new Set(named.filter((item) => item.date === named[0].date).map((item) => item.name))] } : null;
  if (view.toast?.name && ['max', 'rep'].includes(view.toast.kind)) Object.assign(view.toast, { detail, edit });
  else view.toast = { kind: 'result', title: did[0], text: did.length > 1 ? `and ${did.length - 1} more` : 'Synced to all your devices', detail, edit, undo: before, open: Boolean(detail) };
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
  const weekday = parseIso(date).getDay();
  return sortedSessions().find((session) => session.date <= todayIso() && parseIso(session.date).getDay() === weekday && has(session))?.date || date;
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
  state.log = [{ at: Date.now(), said: String(said || '').slice(0, 300), did, ...extra }, ...(state.log || []).filter((entry) => entry.at !== replaced && entry.at !== merged)].slice(0, 80);
  save();
};

const describeAdd = (result, day) => `Added ${[...(result.exercises || []).map((exercise) => `${findExerciseName(exercise.name) || titleCase(exercise.name)} ${setCount(exercise.sets.length)}`), ...(result.cardioMinutes ? [`cardio ${result.cardioMinutes} min`] : [])].join(', ')} to ${dayLabel(day)}`;

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
  if (did.length === 0) throw new Error(result.unclear ? `Didn't understand: ${result.unclear}.` : 'Nothing to log in that. Fix it and send again.');
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
  addLog(said, did, { heard: heard.slice(0, 300), raw: JSON.stringify(result).slice(0, 1500) });
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

const importText = (text) => fetch('/api/add', { method: 'POST', headers: { 'content-type': 'application/json', 'x-exodia-key': syncState.profile }, body: JSON.stringify({ text, today: todayIso(), ...(view.sandbox ? { dry: true } : {}), name: state.name || '', known: [...new Set([...state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)), ...LIBRARY.map((entry) => entry.name)])].slice(0, 80) }) })
  .then((response) => response.json().then((body) => (response.ok ? body : Promise.reject(new Error(body.error || 'Could not read that. Try again.')))))
  .then(async (body) => {
    for (const session of body.sessions || []) {
      state.sessions = state.sessions.filter((item) => item.date !== session.date);
      state.sessions.push(session);
    }
    await syncNow();
    const days = (body.added || []).filter((day) => day.sets > 0);
    const did = [days.length ? `Added ${days.length} ${days.length === 1 ? 'day' : 'days'}, ${days.reduce((sum, day) => sum + day.sets, 0)} sets` : 'Nothing new to add', ...(body.unclear ? [`Didn't understand: ${body.unclear}`] : [])];
    showResult(did, days.map((day) => ({ date: day.date, name: null })));
    return did;
  });

const send = async () => {
  const recorded = recording ? await stopRecording() : view.voiceBlob;
  view.voiceBlob = null;
  const live = (view.live || '').trim();
  view.live = '';
  const voice = recorded?.size > 4000 ? recorded : null;
  const text = [view.draft.trim(), voice ? '' : live].filter(Boolean).join(' ');
  if (!text && !voice?.size) {
    if (recorded) {
      openChat();
      addLog('Voice note', [`Not logged: no sound recorded (${Math.round(recorded.size / 1024)} KB)`]);
    }
    render();
    return;
  }
  if (view.route === 'feedback') return sendFeedback(text, voice);
  const date = view.composerDate || todayIso();
  if (!voice && text.length > 600 && !view.fixing && !view.editContext) {
    const pending = { date, label: 'your training', text: text.slice(0, 120) + '…' };
    view.pending.push(pending);
    view.draft = '';
    if (!desktopQuery.matches) document.activeElement?.blur();
    render();
    closeTray();
    try {
      addLog(text.slice(0, 300), await importText(text));
    } catch (error) {
      view.draft = text;
      openChat();
      addLog(text.slice(0, 300), [`Not logged: ${error.message}`]);
    } finally {
      view.pending = view.pending.filter((item) => item !== pending);
      render();
    }
    return;
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
    addLog(text, [describeAdd(local, date)], { raw: JSON.stringify(local).slice(0, 1500) });
    render();
    closeTray();
    return;
  }
  if (!navigator.onLine) {
    view.status = 'Offline. Try “bench 120x4x3”.';
    render();
    return;
  }
  const pending = { date: guessDate(text, date), label: text || 'your voice note', text: text || live || 'Voice note' };
  view.pending.push(pending);
  view.draft = '';
  view.status = '';
  view.scrollTarget = pending.date;
  if (!desktopQuery.matches) document.activeElement?.blur();
  render();
  closeTray();
  let heard = '';
  let done = false;
  try {
    const audio = voice?.size ? await wavBase64(voice).catch(() => Promise.reject(new Error('Could not read the recording. Try again.'))) : undefined;
    const fixing = view.fixing;
    const result = await parseWithAi(fixing ? `Correct an earlier note. Earlier note: "${fixing.said}". It was logged as: ${fixing.did}. Corrected note: ${text ? `"${text}"` : 'in the audio'}. Change what was logged so it matches the corrected note: use replace for changed sets, remove for things that should not be there, move for a wrong day, and exercises only for things that were not logged at all before.` : text, audio, voice ? live : '');
    heard = result.transcript || '';
    const said = fixing ? `Fix: ${text}` : heard || text;
    if (view.confirm && (YES.test(said) || NO.test(said))) answerConfirm(YES.test(said));
    else if (result.remove?.length && voice) {
      view.confirm = { result, date, said, heard, text: describeRemoval(result) };
      view.scrollTarget = null;
    } else applyResult(result, date, said, voice ? heard : '');
    if (view.editDay !== view.editContext?.date) view.editContext = null;
    view.fixing = null;
    if (view.retryVoice) dropVoice(view.retryVoice);
    view.retryVoice = null;
    done = !view.confirm && !result.unclear && !view.draft.trim() && !view.listening && view.pending.length === 1;
  } catch (error) {
    view.composerDate = date === todayIso() ? null : date;
    openChat();
    const voiceId = voice ? `voice-${Date.now()}` : null;
    if (voiceId) keepVoice(voiceId, voice);
    addLog(text || heard || live || 'Voice note', [`Not logged: ${error.message}${voice ? ' The recording is kept.' : ''}`], voiceId ? { voiceId } : {});
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    if (done && !desktopQuery.matches) document.activeElement?.blur();
    render();
    if (done) closeTray();
  }
};

document.addEventListener('click', (event) => {
  if (view.editDay && !event.target.closest(`#session-${view.editDay}`) && !event.target.closest('.dock')) {
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
  if (action === 'onboard-mic' && view.onboard) return startOnboardMic();
  if (action === 'onboard-stop' && view.onboard) return stopOnboardMic();
  if (action === 'onboard-unfile' && view.onboard) {
    view.onboard.file = null;
    render();
    return;
  }
  if ((action === 'onboard-start' || action === 'onboard-blank') && view.onboard) {
    const name = view.onboard.name.trim();
    if (!name) {
      view.onboard.status = 'Add your name first.';
      render();
      document.getElementById('onboardName')?.focus();
      return;
    }
    state.name = name.slice(0, 40);
    save();
    const text = action === 'onboard-blank' ? '' : [view.onboard.data.trim(), view.onboard.file?.text].filter(Boolean).join('\n\n');
    if (!text) {
      view.onboard = null;
      render();
      return;
    }
    view.onboard.busy = true;
    view.onboard.status = '';
    render();
    importText(text)
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
  } else if (action === 'undo-change' && view.toast?.undo) {
    state.sessions = JSON.parse(view.toast.undo);
    glowFor(state.sessions.map((item) => ({ date: item.date, name: null })).filter((item) => view.open.has(item.date)));
    addLog('Undo', [`Undid: ${view.toast.title}`], { manual: true });
    view.toast = { kind: 'rep', title: 'Undone', text: view.toast.title };
    clearTimeout(view.toastTimer);
    view.toastTimer = setTimeout(clearToast, 3500);
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
  } else if (action === 'log-all') {
    view.logDate = null;
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
  else if (action === 'confirm-yes') answerConfirm(true);
  else if (action === 'retry-said') {
    const entry = state.log?.[Number(target.dataset.index)];
    if (!entry) return;
    view.replacing = entry.at;
    view.draft = entry.said;
    return send();
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
  } else if (action === 'jump-session') {
    view.open.add(date);
    view.menu = false;
    view.scrollTarget = date;
    if (view.route !== 'home') {
      location.hash = '#/';
      return;
    }
  } else if (action === 'toggle-trend') view.trendOpen = view.trendOpen === target.dataset.name ? '' : target.dataset.name;
  else if (action === 'range') view.range = Number(target.dataset.days);
  else if (action === 'accessories' && session) {
    session.accessories = accessoriesOf(session) === Number(target.dataset.minutes) ? 0 : Number(target.dataset.minutes);
    addLog(`Accessories ${target.textContent.trim()}`, [session.accessories ? `Accessories ${session.accessories} min on ${dayLabel(date)}` : `No accessories on ${dayLabel(date)}`], { manual: true, merge: `acc:${date}` });
  } else if (action === 'add-set' && session) {
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const last = exercise.sets.at(-1) || { kg: '', reps: '' };
    exercise.sets.push({ kg: last.kg, reps: last.reps, edited: false });
    addLog('Add set', [`Added a ${exercise.name} set on ${dayLabel(date)}`], { manual: true });
  } else if (action === 'remove-cardio' && session) {
    session.cardio = 0;
    addLog('Remove cardio', [`Removed cardio on ${dayLabel(date)}`], { manual: true });
  } else if (action === 'hide-quick') {
    view.showQuick = false;
    view.quickHidden = true;
    render();
    return;
  } else if (action === 'open-quick') {
    openChat();
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
    const last = lastSetsFor(name, view.composerDate || todayIso());
    addEntries({ exercises: [{ name, sets: last ? last.map((set) => ({ kg: set.kg, reps: set.reps })) : [{ kg: '', reps: '' }] }] }, view.composerDate || todayIso());
    addLog(`Add ${name}`, [`Added ${name} to ${dayLabel(view.composerDate || todayIso())}`], { manual: true });
    closeComposer();
  } else if (action === 'pick-cardio') {
    addEntries({ exercises: [], cardioMinutes: 30 }, view.composerDate || todayIso());
    addLog('Add cardio', [`Added cardio 30 min to ${dayLabel(view.composerDate || todayIso())}`], { manual: true });
    closeComposer();
  } else if (action === 'mic') {
    return view.listening ? send() : startListening();
  } else if (action === 'stop-mic') {
    return stopRecording().then((blob) => {
      view.voiceBlob = blob?.size > 4000 ? blob : null;
      if (view.live) view.draft = [view.draft.trim(), view.live].filter(Boolean).join(' ');
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
  else if (action === 'copy-link') {
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
  if (target.id === 'onboardName' || target.id === 'onboardData') {
    view.onboard[target.id === 'onboardName' ? 'name' : 'data'] = target.value;
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
      if (!view.composerDate) view.composerDate = todayIso();
    }
    fitDraft(target);
    syncDock();
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
    target.files[0].text().then((text) => {
      view.draft = text.slice(0, 150000);
      view.showQuick = false;
      send();
    });
  } else if (target.dataset.action === 'onboard-file' && target.files[0] && view.onboard) {
    const picked = target.files[0];
    picked.text().then((text) => {
      view.onboard.file = { name: picked.name, text: text.slice(0, 150000) };
      view.onboard.status = text.length > 150000 ? 'That file is very long; the first part is used.' : '';
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
  view.route = ['trends', 'you', 'log', 'admin', 'feedback'].includes(name) ? name : 'home';
  if (view.route !== 'log') view.logDate = null;
  if (view.route === 'admin') view.adminRows = null;
  view.menu = false;
  scrollPage(0);
  render();
  if (view.route === 'log') scrollPage(scroller().scrollHeight);
};
window.addEventListener('hashchange', route);
desktopQuery.addEventListener('change', render);
view.focusDraft = desktopQuery.matches;
const linkedProfile = location.pathname.match(/^\/me\/([a-f0-9]{32})\/?$/);
if (linkedProfile && linkedProfile[1] !== syncState.profile) joinProfile(linkedProfile[1]).then(render);
applyFlavor();
route();
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
  }, 450) };
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
  const hadWorker = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('/sw.js').then((registration) => document.addEventListener('visibilitychange', () => {
    if (!document.hidden) registration.update();
  }));
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadWorker && !view.listening && !view.draft.trim() && !view.pending.length) location.reload();
  });
}

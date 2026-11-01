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
  { id: 'legs', name: 'Legs', target: 1, rule: 'heavy squat or hack squat' },
  { id: 'arms', name: 'Arms', target: 1, rule: 'arm work' },
  { id: 'move', name: 'Move', target: 2, rule: 'cardio or a walk, 20 min or more, 2 times' }
];

const ICONS = {
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h10"/></svg>',
  trends: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18l5-6 4 3 7-8"/></svg>',
  home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11L12 4.5 20 11v8a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>',
  you: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mic: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 3.5M16 6h2.5a2.5 2.5 0 0 1-2.6 3.5"/><path d="M12 13v4M9 20h6M10 17h4"/></svg>'
};

const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const estimate = (kg, reps) => (reps === 1 ? kg : kg * (1 + reps / 30));
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
  return parseIso(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
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
const view = { route: 'home', menu: false, composer: false, open: new Set([todayIso()]), exodiaOpen: false, trendOpen: null, range: 180, draft: '', status: '', listening: false, toast: null, pending: [], fresh: null };

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
const metaJson = () => JSON.stringify({ name: state.name || '', bests: state.bests || {} });
let lastSaved = localJson();
let lastMeta = metaJson();

const writeLocal = () => {
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
    const incoming = JSON.stringify({ name: incomingMeta.name || '', bests: incomingMeta.bests || {} });
    const dirty = lastMeta !== syncState.metaSynced;
    if (!dirty || syncState.metaStamp <= updated) {
      syncState.metaSynced = incoming;
      if (incoming !== lastMeta) {
        state.name = incomingMeta.name || '';
        state.bests = incomingMeta.bests || {};
        changed = true;
      }
    }
  }
  lastSaved = localJson();
  lastMeta = metaJson();
  return changed;
};

const syncNow = () => {
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
      view.syncFailed = false;
      if (changed) renderSoon();
      else if (view.route === 'you') render();
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

const renderSoon = () => {
  if (document.activeElement && document.activeElement.matches('.page input')) view.renderOnBlur = true;
  else render();
};

const profileLink = () => `${location.origin}/#/me/${syncState.profile}`;
const pointManifest = () => {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.href = `/manifest.webmanifest?k=${syncState.profile}`;
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
const topEstimate = (exercise) => Math.max(0, ...validSets(exercise).map((set) => estimate(Number(set.kg), Number(set.reps))));

const bestBefore = (name, date) => {
  let best = 0;
  for (const session of state.sessions) {
    if (session.date >= date) continue;
    for (const exercise of session.exercises) if (exercise.name === name) best = Math.max(best, topEstimate(exercise));
  }
  return best;
};
const bestOverall = (name) => bestBefore(name, '9999-12-31');
const heaviestSet = (name) => {
  let heaviest = null;
  for (const session of state.sessions) {
    for (const exercise of session.exercises) {
      if (exercise.name !== name) continue;
      for (const set of validSets(exercise)) {
        const kg = Number(set.kg);
        const reps = Number(set.reps);
        if (!heaviest || kg > heaviest.kg || (kg === heaviest.kg && reps > heaviest.reps)) heaviest = { kg, reps };
      }
    }
  }
  return heaviest;
};
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
      if (entry.piece === 'arms') {
        hit.arms = true;
        continue;
      }
      const isLegsLift = entry.piece === 'legs' && entry.heavy;
      const isPullLift = entry.piece === 'pull' && entry.heavy;
      const isPushLift = entry.piece === 'push' && entry.heavy;
      if (!isLegsLift && !isPullLift && !isPushLift) continue;
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
    const reps = loose[2].split(/,|\band\b|\boch\b|\s+/).map((part) => part.trim()).filter((part) => /^\d+$/.test(part));
    if (reps.length > 0) return { name, sets: reps.map((count) => ({ kg: loose[1].replace(',', '.'), reps: count })) };
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

const parseWithAi = async (text, audio) => {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, audio, today: todayIso(), deviceId: state.deviceId, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The AI could not read that.');
  return body;
};

const announced = new Set();
const checkPr = (name, date = todayIso()) => {
  const session = sessionFor(date);
  const exercise = session && session.exercises.find((item) => item.name === name);
  if (!exercise) return;
  const best = bestBefore(name, date);
  const top = validSets(exercise).reduce((winner, set) => {
    const value = estimate(Number(set.kg), Number(set.reps));
    return !winner || value > winner.value ? { value, set } : winner;
  }, null);
  const key = top ? `${name}:${round(top.value)}` : '';
  if (top && best && top.value > best && !announced.has(key)) {
    announced.add(key);
    view.toast = { name, value: Math.round(top.value), set: `${top.set.kg} × ${top.set.reps}`, gain: Math.round(top.value - best) };
    setTimeout(() => {
      view.toast = null;
      render();
    }, 5000);
  }
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
    for (const set of item.sets) exercise.sets.push({ kg: String(set.kg), reps: String(set.reps), edited: true });
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
  const names = [...recent, ...LIBRARY.map((entry) => entry.name).filter((name) => !recent.includes(name))];
  return names.filter((name) => (query ? name.toLowerCase().includes(query) : !inToday.has(name))).slice(0, query ? 12 : 10);
};

const renderBars = (pieces) => pieces.map((piece) => `
  <div>
    <div class="barTop"><span class="barLabel">${piece.name}</span></div>
    <div class="track"><div class="fill" style="width:${Math.min(100, Math.round((piece.done / piece.target) * 100))}%"></div></div>
  </div>`).join('');

const renderExercise = (session, exercise, exerciseIndex) => {
  const best = bestBefore(exercise.name, session.date);
  const rows = exercise.sets.map((set, setIndex) => {
    const kg = Number(set.kg);
    const reps = Number(set.reps);
    const value = set.kg !== '' && set.reps !== '' && reps > 0 ? estimate(kg, reps) : 0;
    const percent = best && value ? Math.round((value / best) * 100) : 0;
    const label = `${esc(exercise.name)}, set ${setIndex + 1}`;
    return `<div class="setRow">
      <span class="setNo num">${setIndex + 1}</span>
      <input class="pill num" inputmode="decimal" aria-label="${label}, kilograms" value="${esc(set.kg)}" placeholder="kg" data-date="${session.date}" data-exercise="${exerciseIndex}" data-set="${setIndex}" data-field="kg">
      <span class="unit">kg</span><span class="unit" aria-hidden="true" style="text-align:center">×</span>
      <input class="pill num" inputmode="numeric" aria-label="${label}, reps" value="${esc(set.reps)}" placeholder="reps" data-date="${session.date}" data-exercise="${exerciseIndex}" data-set="${setIndex}" data-field="reps">
      <span class="pct num${percent > 100 ? ' pr' : ''}">${percent ? (percent > 100 ? 'PR ' : '') + percent + '%' : ''}</span>
    </div>`;
  }).join('');
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.names.has(exercise.name);
  return `<div class="exercise${landing ? ' landing' : ''}">
    <button class="exName" data-action="open-trend" data-name="${esc(exercise.name)}">${esc(exercise.name)}</button>
    ${rows}
    <button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}">Add set</button>
  </div>`;
};

const renderPending = (pending) => `<div class="ghost" role="status"><span class="ghostText">Adding “${esc(pending.label)}”</span><span class="shimmer"></span><span class="shimmer short"></span></div>`;

const renderSession = (session) => {
  const pendings = view.pending.filter((pending) => pending.date === session.date);
  const open = view.open.has(session.date) || pendings.length > 0;
  const landing = view.fresh && view.fresh.date === session.date && view.fresh.isNew;
  const summary = [...session.exercises.filter((exercise) => validSets(exercise).length > 0).map((exercise) => `${exercise.name} ${validSets(exercise)[0].kg} × ${validSets(exercise)[0].reps}`), session.cardio ? `Cardio ${session.cardio} min` : null].filter(Boolean).join(' · ');
  return `<section class="card session${open ? ' open' : ''}${landing ? ' landing' : ''}" id="session-${session.date}">
    <button class="head" data-action="toggle-session" data-date="${session.date}" aria-expanded="${open}">
      <span class="headName">${dayLabel(session.date)}</span>
      <span class="meta num">${tonnes(sessionVolume(session))} · ${setCount(sessionSets(session))}</span>
      ${ICONS.chev}
    </button>
    ${open ? `
      ${session.exercises.map((exercise, index) => renderExercise(session, exercise, index)).join('')}
      ${pendings.map(renderPending).join('')}
      ${session.cardio ? `<div class="cardio"><span>Cardio</span><span class="meta num">${session.cardio} min</span><button class="textBtn" data-action="remove-cardio" data-date="${session.date}">Remove</button></div>` : ''}
      <button class="textBtn" style="display:block;border-top:1px solid var(--sep);width:100%;text-align:left" data-action="open-composer" data-date="${session.date}">Add exercise</button>
      <div class="foot">
        <span class="unit" style="margin-right:auto">Accessories</span>
        ${[[10, '10 min'], [30, '30 min'], [60, '1 h']].map(([minutes, label]) => `<button class="chip" data-action="accessories" data-date="${session.date}" data-minutes="${minutes}" aria-pressed="${session.accessories === minutes}"><span class="chipFace">${label}</span></button>`).join('')}
      </div>` : `<button class="summary num" data-action="toggle-session" data-date="${session.date}" tabindex="-1" aria-hidden="true">${esc(summary || 'Nothing logged yet')}</button>`}
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

const renderHome = () => {
  const pieces = pieceProgress(todayIso());
  const complete = pieces.filter((piece) => piece.complete).length;
  const weekVolume = state.sessions.filter((session) => session.date >= addDays(todayIso(), -6)).reduce((sum, session) => sum + sessionVolume(session), 0);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Late session?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const sessions = sortedSessions().filter((session) => session.exercises.length > 0 || session.cardio > 0);
  return `<main class="page">
    <p class="eyebrow">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h1 class="title">${greeting}${state.name ? `, ${esc(state.name)}` : ''}</h1>
    <section class="card${view.exodiaOpen ? ' open' : ''}" style="margin-top:20px">
      <button class="head" data-action="toggle-exodia" aria-expanded="${view.exodiaOpen}">
        <span class="headName">Exodia</span>
        <span class="meta num">${complete === 5 ? 'Complete' : complete + ' of 5'} · ${tonnes(weekVolume)}</span>
        ${ICONS.chev}
      </button>
      <button class="bars" data-action="toggle-exodia" tabindex="-1" aria-hidden="true">${renderBars(pieces)}</button>
      ${view.exodiaOpen ? `<div class="rules">${pieces.map((piece) => `<div class="rule"><span><b>${piece.name}</b> <span class="muted">· ${piece.rule}</span></span><span class="muted num">${piece.complete ? 'Done' : Math.min(piece.done, piece.target) + ' of ' + piece.target}</span></div>`).join('')}<p class="empty" style="margin:8px 0 0">Heavy means your top set is at least 85% of your best. Last 7 days, any program.</p></div>` : ''}
    </section>
    <p class="section">Sessions</p>
    <div class="list">${sessions.length || view.pending.length ? listWithGhosts(sessions.slice(0, 30)) : '<p class="empty">Nothing logged yet. Type or say a set in the box below.</p>'}</div>
  </main>`;
};

const chartFor = (points) => {
  if (points.length === 0) return '';
  const width = 320;
  const height = 150;
  const values = points.map((point) => point.value);
  const low = Math.floor((Math.min(...values) - 2) / 5) * 5;
  const high = Math.ceil((Math.max(...values) + 2) / 5) * 5;
  const first = parseIso(points[0].date).getTime();
  const span = Math.max(1, parseIso(points.at(-1).date).getTime() - first);
  const x = (date) => (points.length === 1 ? width / 2 : ((parseIso(date).getTime() - first) / span) * (width - 12) + 6);
  const y = (value) => height - 10 - ((value - low) / Math.max(1, high - low)) * (height - 20);
  let running = 0;
  const steps = points.map((point) => {
    const isBest = point.value > running;
    running = Math.max(running, point.value);
    return { date: point.date, value: running, session: point.value, isBest };
  });
  const dots = steps.map((step) => `<circle cx="${x(step.date).toFixed(1)}" cy="${y(step.session).toFixed(1)}" r="${step.isBest ? 3.5 : 2.5}" fill="${step.isBest ? '#C96442' : '#E2B49C'}"/>`).join('');
  const path = steps.map((step, index) => `${index ? 'L' : 'M'}${x(step.date).toFixed(1)} ${y(step.value).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Best expected 1RM, now ${Math.round(running)} kg">
    <line x1="0" x2="${width}" y1="${y(high)}" y2="${y(high)}" stroke="#ECE9E0"/><line x1="0" x2="${width}" y1="${y(low)}" y2="${y(low)}" stroke="#ECE9E0"/>
    <path d="${path}" fill="none" stroke="#141413" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${dots}
  </svg>
  <div class="axis num"><span>${high} kg</span><span>${low} kg</span></div>`;
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
  if (view.trendOpen === null && names.length) view.trendOpen = names[0];
  const cards = names.map((name) => {
    const all = history.get(name);
    const open = view.trendOpen === name;
    const best = bestOverall(name);
    const since = addDays(todayIso(), -view.range);
    const points = all.filter((point) => view.range === 0 || point.date >= since);
    const heaviest = heaviestSet(name);
    const last = all.at(-1);
    return `<section class="card${open ? ' open' : ''}">
      <button class="head" data-action="toggle-trend" data-name="${esc(name)}" aria-expanded="${open}">
        <span class="headName">${esc(name)}</span>
        <span class="meta num">${Math.round(best)} kg</span>
        ${ICONS.chev}
      </button>
      ${open ? `
        <div class="tiles">
          <div class="tile"><p class="tileValue num" style="color:var(--clayText)">${Math.round(best)}<small> kg</small></p><p class="tileLabel">Expected</p></div>
          <div class="tile"><p class="tileValue num">${heaviest ? heaviest.kg : '–'}<small>${heaviest ? ` × ${heaviest.reps}` : ''}</small></p><p class="tileLabel">Heaviest set</p></div>
          <button class="tile" data-action="jump-session" data-date="${last.date}" aria-label="Last set ${last.sets[0].kg} × ${last.sets[0].reps}, open ${dayLabel(last.date)}"><p class="tileValue num">${last.sets[0].kg}<small> × ${last.sets[0].reps}</small></p><p class="tileLabel">Last set · ${dayLabel(last.date)}</p></button>
        </div>
        <div class="chartHead">
          <p class="chartTitle">Expected 1RM</p>
          ${[[90, '3M'], [180, '6M'], [365, '1Y'], [0, 'All']].map(([days, label]) => `<button class="chip" data-action="range" data-days="${days}" aria-pressed="${view.range === days}"><span class="chipFace">${label}</span></button>`).join('')}
        </div>
        ${points.length ? chartFor(points) : '<p class="empty">No sessions in this range.</p>'}
        <div class="repTable num">${[1, 3, 5, 8, 10].map((reps) => { const kg = Math.round(reps === 1 ? best : best / (1 + reps / 30)); return `<button data-action="prefill" data-text="${esc(name)} ${kg}x${reps}" aria-label="Log ${esc(name)} ${kg} kg for ${reps}"><b>${kg}</b><span>${reps} ${reps === 1 ? 'rep' : 'reps'}</span></button>`; }).join('')}</div>` : `<p class="summary num">${all.length} ${all.length === 1 ? 'session' : 'sessions'} · last ${dayLabel(last.date)}</p>`}
    </section>`;
  }).join('');
  return `<main class="page">
    <p class="eyebrow">Expected 1RM, heaviest sets and rep targets</p>
    <h1 class="title">Trends</h1>
    <div class="list" style="margin-top:20px">${cards || '<p class="empty">Log a few sessions and your trends show up here.</p>'}</div>
  </main>`;
};

const renderYou = () => {
  const lifts = loggedLifts().sort((first, second) => bestOverall(second) - bestOverall(first)).slice(0, 10);
  return `<main class="page">
    <h1 class="title">${esc(state.name || 'You')}</h1>
    <section class="card" style="margin-top:20px"><div class="row"><label for="name" style="flex:1">Name</label><input id="name" class="pill" style="width:160px;text-align:left" autocomplete="given-name" value="${esc(state.name || '')}" placeholder="Your name" data-name-input></div></section>
    <p class="section">Best lifts</p>
    <section class="card">
      ${lifts.map((name) => {
        const heaviest = heaviestSet(name);
        return `<button class="row liftRow" data-action="open-trend" data-name="${esc(name)}"><span style="flex:1;min-width:0">${esc(name)}</span><span class="num" style="font-weight:600">${heaviest.kg} × ${heaviest.reps}</span><span class="muted num" style="width:92px;text-align:right">≈ ${Math.round(bestOverall(name))} 1RM</span></button>`;
      }).join('') || '<p class="empty" style="margin:14px 0">Your best sets show up here once you log them.</p>'}
    </section>
    <p class="note">The heaviest set you have actually lifted, and the one-rep max it predicts. Paused and other variations count as their own lift.</p>
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
    <p class="note">App icon from the Twemoji hamsa by Twitter, CC-BY 4.0, recolored.</p>
  </main>`;
};

const desktopQuery = window.matchMedia('(min-width: 1024px)');

const renderProgress = () => {
  const history = new Map();
  for (const session of [...state.sessions].sort((first, second) => first.date.localeCompare(second.date))) {
    for (const exercise of session.exercises) {
      if (validSets(exercise).length === 0) continue;
      if (!history.has(exercise.name)) history.set(exercise.name, []);
      history.get(exercise.name).push({ date: session.date, value: topEstimate(exercise) });
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
      ${focus ? `<button class="chartLink" data-action="open-trend" data-name="${esc(focus)}"><span class="chartTitle">Expected 1RM · ${Math.round(bestOverall(focus))} kg</span><span class="textBtn" style="min-height:0">Open in Trends</span></button>${chartFor(history.get(focus))}` : '<p class="empty">Your strongest lift shows up here once you log it.</p>'}
    </section>
    <p class="section">Volume per week</p>
    <section class="card" style="padding:14px 16px">
      <div class="weekBars" role="group" aria-label="Volume for the last 6 weeks">${weeks.map((week, index) => `<button class="weekBar" data-action="pick-week" data-index="${index}" aria-pressed="${(view.volumeWeek ?? 5) === index}" aria-label="Week ending ${dayLabel(week.end)}, ${tonnes(week.volume)}"><div style="height:${Math.round((week.volume / maxVolume) * 100)}%"></div></button>`).join('')}</div>
      <div class="axis num" style="margin:6px 0 0"><span>${(view.volumeWeek ?? 5) === 5 ? 'This week' : 'Week ending ' + dayLabel(weeks[view.volumeWeek ?? 5].end)}</span><span>${tonnes(weeks[view.volumeWeek ?? 5].volume)}</span></div>
    </section>
    <p class="section">Best lifts</p>
    <section class="card">
      ${lifts.slice(0, 10).map((name) => `<button class="row liftRow" data-action="focus-lift" data-name="${esc(name)}" aria-pressed="${name === focus}"><span style="flex:1">${esc(name)}</span><span class="muted num">${Math.round(bestOverall(name))} kg</span></button>`).join('') || '<p class="empty" style="margin:14px 0">Nothing yet.</p>'}
    </section>`;
};

const drawerContent = () => {
  const history = exodiaHistory();
  return `${[['home', 'Home', ICONS.home], ['trends', 'Trends', ICONS.trends.replace('width="24" height="24"', 'width="22" height="22"')], ['you', state.name || 'You', ICONS.you]].map(([route, label, icon]) => `<a class="navItem${view.route === route ? ' on' : ''}" href="#/${route === 'home' ? '' : route}" ${view.route === route ? 'aria-current="page"' : ''}>${icon}${esc(label)}</a>`).join('')}
      <p class="drawerLabel">Exodia</p>
      <button class="drawerRow" data-action="show-exodia"><span>Hit ${history.hits} ${history.hits === 1 ? 'time' : 'times'}</span><span class="muted">Rules</span></button>
      ${history.last ? `<button class="drawerRow" data-action="jump-session" data-date="${history.last}"><span>Last hit</span><span class="muted">${dayLabel(history.last)}</span></button>` : '<div class="drawerRow"><span>Last hit</span><span class="muted">Not yet</span></div>'}
      <p class="drawerLabel">Recent sessions</p>
      ${sortedSessions().slice(0, 8).map((session) => `<button class="drawerRow" data-action="jump-session" data-date="${session.date}"><span>${dayLabel(session.date)}</span><span class="muted num">${tonnes(sessionVolume(session))}</span></button>`).join('') || '<p class="drawerRow muted">None yet</p>'}`;
};

const renderDrawer = () => `<div class="overlay">
    <button class="scrim" data-action="close-menu" aria-label="Close menu"></button>
    <nav class="drawer" aria-label="Exodia">${drawerContent()}</nav>
  </div>`;

const renderPicks = () => {
  const date = view.composerDate || todayIso();
  const picks = pickList();
  const query = !/\d/.test(view.draft) && view.draft.trim();
  return `${!query || 'cardio'.includes(query.toLowerCase()) ? `<button class="pick" data-action="pick-cardio"><span style="flex:1"><span class="pickName">Cardio</span><span class="pickLast">Cardio or a walk, 30 min · counts for Move</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}
    ${picks.map((name) => {
      const last = lastSetsFor(name, date);
      return `<button class="pick" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(date)}"><span style="flex:1;min-width:0"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>`;
    }).join('')}
    ${query && picks.length === 0 ? `<button class="pick" data-action="create" data-name="${esc(query)}"><span style="flex:1"><span class="pickName">Create “${esc(titleCase(query))}”</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}`;
};

const renderTray = () => `<div class="tray" role="group" aria-label="Add an exercise">
  <div class="days scroll" role="group" aria-label="Day">${Array.from({ length: 14 }, (unused, index) => addDays(todayIso(), -index)).map((iso) => `<button class="chip" data-action="composer-day" data-date="${iso}" aria-pressed="${(view.composerDate || todayIso()) === iso}"><span class="chipFace">${dayLabel(iso)}</span></button>`).join('')}</div>
  <div class="picks scroll">${renderPicks()}</div>
</div>`;

const goButton = () => {
  const sending = view.listening || view.draft.trim().length > 0;
  return `<button class="go" data-action="${sending ? 'send' : 'mic'}" aria-label="${view.listening ? 'Stop and log' : sending ? 'Log it' : 'Speak instead'}">${sending ? ICONS.up : ICONS.mic}</button>`;
};

const renderDock = () => `<div class="dock">
  ${view.composer ? renderTray() : ''}
  ${view.status ? `<p class="dockStatus" role="status">${esc(view.status)}</p>` : ''}
  <div class="prompt${view.draft.trim() ? ' hasText' : ''}${view.listening ? ' listening' : ''}">
    <label for="draft" class="sr">Type or say what you did</label>
    <textarea id="draft" class="promptInput" rows="1" enterkeyhint="send" autocomplete="off">${esc(view.draft)}</textarea>
    ${view.listening
      ? `<span class="hint listeningRow" aria-hidden="true"><span class="wave${view.speaking ? ' speaking' : ''}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>${view.speaking ? 'Hearing you…' : 'Listening…'}</span>`
      : `<span class="hint${typewriter.fading ? ' fading' : ''}" aria-hidden="true">${esc(typewriter.text)}</span>`}
    ${goButton()}
  </div>
</div>`;

const fitDraft = (draft) => {
  draft.style.height = 'auto';
  draft.style.height = `${draft.scrollHeight}px`;
};

const syncDock = () => {
  const prompt = document.querySelector('.dock .prompt');
  if (!prompt) return;
  prompt.classList.toggle('hasText', view.draft.trim().length > 0);
  prompt.querySelector('.go').outerHTML = goButton();
  const tray = document.querySelector('.dock .tray');
  if (view.composer && !tray) prompt.parentElement.insertAdjacentHTML('afterbegin', renderTray());
  else if (view.composer) tray.querySelector('.picks').innerHTML = renderPicks();
  else if (tray) tray.remove();
  tuckCards();
};

const EXAMPLES = ['120 for 3 bench press', '240 deadlift, reps 4-2', 'Squat 140 for 5, 5 and 5', 'Ran 25 min', 'Hack squat 200 for 8 last Friday', 'Curls 20 for 12, 10, 8', 'Walked 40 min'];
const typewriter = { text: '', index: 0, length: 0, fading: false };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const tickTypewriter = () => {
  let delay = 70 + Math.random() * 60;
  if (reducedMotion.matches) {
    typewriter.index = (typewriter.index + 1) % EXAMPLES.length;
    typewriter.length = EXAMPLES[typewriter.index].length;
    delay = 4500;
  } else if (typewriter.fading) {
    typewriter.fading = false;
    typewriter.length = 0;
    typewriter.index = (typewriter.index + 1) % EXAMPLES.length;
    delay = 600;
  } else if (typewriter.length < EXAMPLES[typewriter.index].length) {
    typewriter.length += 1;
    if (typewriter.length === EXAMPLES[typewriter.index].length) delay = 3400;
  } else {
    typewriter.fading = true;
    delay = 800;
  }
  typewriter.text = EXAMPLES[typewriter.index].slice(0, typewriter.length);
  const hint = document.querySelector('.prompt .hint:not(.listeningRow)');
  if (hint) {
    hint.classList.toggle('fading', typewriter.fading);
    hint.textContent = typewriter.text;
  }
  setTimeout(tickTypewriter, delay);
};

const tuckCards = () => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const line = dock.getBoundingClientRect().top;
  for (const card of document.querySelectorAll('.page .card')) {
    const box = card.getBoundingClientRect();
    const shown = line - box.top;
    card.classList.toggle('tucked', shown < box.height && shown < Math.min(box.height, 96));
  }
};
window.addEventListener('scroll', () => requestAnimationFrame(tuckCards), { passive: true });
window.addEventListener('resize', tuckCards);

const render = () => {
  const app = document.getElementById('app');
  const focused = document.activeElement;
  const draftFocused = focused && focused.id === 'draft';
  const caret = draftFocused ? [focused.selectionStart, focused.selectionEnd] : null;
  const page = view.route === 'trends' ? renderTrends() : view.route === 'you' ? renderYou() : renderHome();
  const dock = renderDock();
  const layout = desktopQuery.matches
    ? `<div class="desk">
        <nav class="side" aria-label="Exodia"><a class="sideBrand" href="#/"><span class="logo" aria-hidden="true">🪬</span>Exodia</a>${drawerContent()}</nav>
        <div class="center">${page}${dock}</div>
        <aside class="right" aria-label="Progress">${renderProgress()}</aside>
      </div>`
    : `<header class="topbar"><div class="topbarInner">
        <button class="iconBtn" data-action="open-menu" aria-label="Open menu">${ICONS.menu}</button>
        <a class="brand" href="#/"><span class="logo" aria-hidden="true">🪬</span>Exodia</a>
        <a class="iconBtn" href="#/trends" aria-label="Trends">${ICONS.trends}</a>
      </div></header>
      ${page}${dock}${view.menu ? renderDrawer() : ''}`;
  app.innerHTML = `
    <svg width="0" height="0" aria-hidden="true" style="position:absolute"><filter id="duo" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="discrete" tableValues="0.788 0.949"/><feFuncG type="discrete" tableValues="0.392 0.690"/><feFuncB type="discrete" tableValues="0.259 0.557"/></feComponentTransfer></filter></svg>
    ${layout}
    ${view.toast ? `<button class="toast" role="status" data-action="dismiss-toast" aria-label="Dismiss"><span class="trophy">${ICONS.trophy}</span><div><p class="toastTitle">New PR · ${esc(view.toast.name)}</p><p class="toastText num">${view.toast.set} · expected ${view.toast.value} kg, +${view.toast.gain} kg</p></div></button>` : ''}`;
  const draft = document.getElementById('draft');
  if (draft) {
    fitDraft(draft);
    if (draftFocused || view.focusDraft) {
      draft.focus();
      const [start, end] = caret || [draft.value.length, draft.value.length];
      draft.setSelectionRange(start, end);
    }
  }
  view.focusDraft = false;
  tuckCards();
  if (view.scrollTarget) {
    const card = document.getElementById(`session-${view.scrollTarget}`);
    view.scrollTarget = null;
    if (card) requestAnimationFrame(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
};

const closeComposer = () => {
  view.composer = false;
  view.draft = '';
  view.status = '';
  view.focusDraft = desktopQuery.matches;
  stopRecording();
};

let recording = null;

const stopRecording = async () => {
  if (!recording) return null;
  const { recorder, context, frame, timer, done } = recording;
  recording = null;
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
      render();
    }
    recording.frame = requestAnimationFrame(tick);
  };
  tick();
};

const startListening = async () => {
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
  recording = { recorder, context, done, frame: 0, timer: setTimeout(send, 60000) };
  watchLevel(stream, context);
  view.listening = true;
  view.status = '';
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

const showHome = () => {
  if (view.route === 'home') return;
  history.pushState(null, '', '#/');
  view.route = 'home';
};

const send = async () => {
  const voice = await stopRecording();
  const text = view.draft.trim();
  if (!text && !voice?.size) {
    render();
    return;
  }
  const date = view.composerDate || todayIso();
  const local = !voice && !DAY_WORDS.test(text) ? parseLocally(text) : null;
  if (local) {
    closeComposer();
    showHome();
    land(local, date);
    render();
    return;
  }
  if (!navigator.onLine) {
    view.status = 'Offline. Try “bench 120x4x3”.';
    render();
    return;
  }
  const pending = { date: guessDate(text, date), label: text || 'your voice note' };
  view.pending.push(pending);
  closeComposer();
  showHome();
  view.scrollTarget = pending.date;
  render();
  let heard = '';
  try {
    const audio = voice?.size ? await wavBase64(voice).catch(() => Promise.reject(new Error('Could not read the recording. Try again.'))) : undefined;
    const result = await parseWithAi(text, audio);
    heard = result.transcript || '';
    if (!result.exercises?.length && !result.cardioMinutes) throw new Error(heard ? 'No sets in that. Fix it and send again.' : 'Could not find any sets in that.');
    land(result, result.date || date);
  } catch (error) {
    view.composer = true;
    view.composerDate = date === todayIso() ? null : date;
    view.draft = text || heard;
    view.status = error.message;
  } finally {
    view.pending = view.pending.filter((item) => item !== pending);
    render();
  }
};

document.addEventListener('click', (event) => {
  const insideDock = Boolean(event.target.closest('.dock'));
  if (view.composer && !insideDock && !event.target.closest('[data-action]')) {
    view.composer = false;
    render();
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
  if (action === 'dismiss-toast') view.toast = null;
  if (action === 'open-menu') view.menu = true;
  else if (action === 'close-menu') view.menu = false;
  else if (action === 'open-composer') {
    view.composer = true;
    view.composerDate = target.dataset.date || todayIso();
    view.focusDraft = true;
  } else if (action === 'composer-day') {
    view.composerDate = date;
    view.focusDraft = true;
  }
  else if (action === 'toggle-exodia') view.exodiaOpen = !view.exodiaOpen;
  else if (action === 'toggle-session') view.open.has(date) ? view.open.delete(date) : view.open.add(date);
  else if (action === 'focus-lift') view.focusLift = target.dataset.name;
  else if (action === 'pick-week') view.volumeWeek = Number(target.dataset.index);
  else if (action === 'open-trend') {
    view.trendOpen = target.dataset.name;
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
    session.accessories = Number(target.dataset.minutes);
    save();
  } else if (action === 'add-set' && session) {
    const exercise = session.exercises[Number(target.dataset.exercise)];
    const last = exercise.sets.at(-1) || { kg: '', reps: '' };
    exercise.sets.push({ kg: last.kg, reps: last.reps, edited: false });
    save();
  } else if (action === 'remove-cardio' && session) {
    session.cardio = 0;
    save();
  } else if (action === 'pick' || action === 'create') {
    const name = action === 'create' ? titleCase(target.dataset.name) : target.dataset.name;
    const last = lastSetsFor(name, view.composerDate || todayIso());
    addEntries({ exercises: [{ name, sets: last ? last.map((set) => ({ kg: set.kg, reps: set.reps })) : [{ kg: '', reps: '' }] }] }, view.composerDate || todayIso());
    closeComposer();
  } else if (action === 'pick-cardio') {
    addEntries({ exercises: [], cardioMinutes: 30 }, view.composerDate || todayIso());
    closeComposer();
  } else if (action === 'mic') {
    return view.listening ? send() : startListening();
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
    const field = target.dataset.field;
    const previous = exercise.sets[index][field];
    exercise.sets[index][field] = target.value.replace(',', '.');
    if (field === 'kg') {
      exercise.sets[index].edited = true;
      for (let next = index + 1; next < exercise.sets.length; next += 1) {
        if (!exercise.sets[next].edited && exercise.sets[next].kg === previous) exercise.sets[next].kg = exercise.sets[index].kg;
      }
    }
    save();
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
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
    if (set && set.kg === '' && set.reps === '') exercise.sets.splice(Number(target.dataset.set), 1);
    if (exercise.sets.length === 0) session.exercises.splice(Number(target.dataset.exercise), 1);
    if (session.exercises.length === 0 && !session.cardio) state.sessions = state.sessions.filter((item) => item !== session);
    checkPr(exercise.name, session.date);
    save();
    render();
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
  view.route = ['trends', 'you'].includes(name) ? name : 'home';
  view.menu = false;
  window.scrollTo(0, 0);
  render();
};
window.addEventListener('hashchange', route);
desktopQuery.addEventListener('change', render);
view.focusDraft = desktopQuery.matches;
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
document.addEventListener('focusout', () => {
  if (!view.renderOnBlur) return;
  setTimeout(() => {
    if (document.activeElement && document.activeElement.matches('.page input')) return;
    view.renderOnBlur = false;
    render();
  });
});
tickTypewriter();

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js');

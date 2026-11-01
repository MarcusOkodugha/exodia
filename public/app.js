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
const view = { route: 'home', menu: false, composer: false, open: new Set([todayIso()]), exodiaOpen: false, trendOpen: null, range: 180, draft: '', status: '', busy: false, listening: false, toast: null };

const save = () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Could not save', error);
  }
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
  let best = Number(state.bests[name]) || 0;
  for (const session of state.sessions) {
    if (session.date >= date) continue;
    for (const exercise of session.exercises) if (exercise.name === name) best = Math.max(best, topEstimate(exercise));
  }
  return best;
};
const bestOverall = (name) => bestBefore(name, '9999-12-31');

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

const parseWithAi = async (text) => {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, deviceId: state.deviceId, known: [...new Set(state.sessions.flatMap((session) => session.exercises.map((exercise) => exercise.name)))].slice(0, 40) })
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
  for (const item of result.exercises || []) {
    const name = findExerciseName(item.name) || titleCase(item.name);
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
};

const mergeImported = (result) => {
  let added = 0;
  let sets = 0;
  const days = new Set();
  for (const imported of result.sessions) {
    const existed = Boolean(sessionFor(imported.date));
    const session = ensureSession(imported.date);
    if (!existed) session.accessories = 0;
    for (const exercise of imported.exercises) {
      if (session.exercises.some((item) => item.name === exercise.name)) continue;
      session.exercises.push(exercise);
      sets += exercise.sets.length;
      added += 1;
      days.add(imported.date);
    }
  }
  save();
  view.importNote = added ? `Imported ${days.size} ${days.size === 1 ? 'session' : 'sessions'}, ${setCount(sets)}. Warm-ups left out.` : 'Already imported. Nothing new.';
};

const importFromLink = async (token) => {
  try {
    const response = await fetch(`/api/seed/${token}`);
    if (!response.ok) throw new Error('This import link has expired or is wrong.');
    mergeImported(await response.json());
  } catch (error) {
    view.importNote = error.message;
  }
  location.hash = '#/you';
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
  return `<div class="exercise">
    <p class="exName">${esc(exercise.name)}</p>
    ${rows}
    <button class="textBtn" data-action="add-set" data-date="${session.date}" data-exercise="${exerciseIndex}">Add set</button>
  </div>`;
};

const renderSession = (session) => {
  const open = view.open.has(session.date);
  const summary = [...session.exercises.filter((exercise) => validSets(exercise).length > 0).map((exercise) => `${exercise.name} ${validSets(exercise)[0].kg} × ${validSets(exercise)[0].reps}`), session.cardio ? `Cardio ${session.cardio} min` : null].filter(Boolean).join(' · ');
  return `<section class="card${open ? ' open' : ''}">
    <button class="head" data-action="toggle-session" data-date="${session.date}" aria-expanded="${open}">
      <span class="headName">${dayLabel(session.date)}</span>
      <span class="meta num">${tonnes(sessionVolume(session))} · ${setCount(sessionSets(session))}</span>
      ${ICONS.chev}
    </button>
    ${open ? `
      ${session.exercises.map((exercise, index) => renderExercise(session, exercise, index)).join('')}
      ${session.cardio ? `<div class="cardio"><span>Cardio</span><span class="meta num">${session.cardio} min</span><button class="textBtn" data-action="remove-cardio" data-date="${session.date}">Remove</button></div>` : ''}
      <button class="textBtn" style="display:block;border-top:1px solid var(--sep);width:100%;text-align:left" data-action="open-composer" data-date="${session.date}">Add exercise</button>
      <div class="foot">
        <span class="unit" style="margin-right:auto">Accessories</span>
        ${[[10, '10 min'], [30, '30 min'], [60, '1 h']].map(([minutes, label]) => `<button class="chip" data-action="accessories" data-date="${session.date}" data-minutes="${minutes}" aria-pressed="${session.accessories === minutes}"><span class="chipFace">${label}</span></button>`).join('')}
      </div>` : `<p class="summary num">${esc(summary || 'Nothing logged yet')}</p>`}
  </section>`;
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
    <h1 class="title">${greeting}</h1>
    <section class="card${view.exodiaOpen ? ' open' : ''}" style="margin-top:20px">
      <button class="head" data-action="toggle-exodia" aria-expanded="${view.exodiaOpen}">
        <span class="headName">Exodia</span>
        <span class="meta num">${complete === 5 ? 'Complete' : complete + ' of 5'} · ${tonnes(weekVolume)}</span>
        ${ICONS.chev}
      </button>
      <div class="bars" role="img" aria-label="Exodia, last 7 days, ${complete} of 5 pieces">${renderBars(pieces)}</div>
      ${view.exodiaOpen ? `<div class="rules">${pieces.map((piece) => `<div class="rule"><span><b>${piece.name}</b> <span class="muted">· ${piece.rule}</span></span><span class="muted num">${piece.complete ? 'Done' : Math.min(piece.done, piece.target) + ' of ' + piece.target}</span></div>`).join('')}<p class="empty" style="margin:8px 0 0">Heavy means your top set is at least 85% of your best. Last 7 days, any program.</p></div>` : ''}
    </section>
    <p class="section">Sessions</p>
    <div class="list">${sessions.length ? sessions.slice(0, 30).map(renderSession).join('') : '<p class="empty">Nothing logged yet. Tap “Log a set” to start.</p>'}</div>
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
  const dots = points.map((point) => {
    const isBest = point.value > running;
    running = Math.max(running, point.value);
    return isBest ? `<circle cx="${x(point.date).toFixed(1)}" cy="${y(point.value).toFixed(1)}" r="3.5" fill="#C96442"/>` : '';
  }).join('');
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(point.date).toFixed(1)} ${y(point.value).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Expected 1RM from ${Math.round(values[0])} to ${Math.round(values.at(-1))} kg">
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
      history.get(exercise.name).push({ date: session.date, value: topEstimate(exercise), heaviest: Math.max(...validSets(exercise).filter((set) => Number(set.reps) === 1).map((set) => Number(set.kg)), 0), sets: validSets(exercise) });
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
    const heaviest = Math.max(0, ...all.map((point) => point.heaviest));
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
          <div class="tile"><p class="tileValue num">${heaviest ? heaviest : '–'}<small>${heaviest ? ' kg' : ''}</small></p><p class="tileLabel">Best single</p></div>
          <div class="tile"><p class="tileValue num">${last.sets[0].kg}<small> × ${last.sets[0].reps}</small></p><p class="tileLabel">Last set</p></div>
        </div>
        <div class="chartHead">
          <p class="chartTitle">Expected 1RM</p>
          ${[[90, '3M'], [180, '6M'], [365, '1Y'], [0, 'All']].map(([days, label]) => `<button class="chip" data-action="range" data-days="${days}" aria-pressed="${view.range === days}"><span class="chipFace">${label}</span></button>`).join('')}
        </div>
        ${points.length ? chartFor(points) : '<p class="empty">No sessions in this range.</p>'}
        <div class="repTable num">${[1, 3, 5, 8, 10].map((reps) => `<div><b>${Math.round(reps === 1 ? best : best / (1 + reps / 30))}</b><span>${reps} ${reps === 1 ? 'rep' : 'reps'}</span></div>`).join('')}</div>` : `<p class="summary num">${all.length} ${all.length === 1 ? 'session' : 'sessions'} · last ${dayLabel(last.date)}</p>`}
    </section>`;
  }).join('');
  return `<main class="page">
    <p class="eyebrow">Expected 1RM, heaviest sets and rep targets</p>
    <h1 class="title">Trends</h1>
    <div class="list" style="margin-top:20px">${cards || '<p class="empty">Log a few sessions and your trends show up here.</p>'}</div>
  </main>`;
};

const renderYou = () => {
  const bestNames = [...new Set([...Object.keys(state.bests), ...LIBRARY.filter((entry) => entry.heavy).map((entry) => entry.name).slice(0, 4)])];
  return `<main class="page">
    <p class="eyebrow">No account needed</p>
    <h1 class="title">You</h1>
    <p class="section">Best lifts</p>
    <section class="card">
      ${bestNames.map((name) => `<div class="row"><span style="flex:1">${esc(name)}</span><label class="sr" for="best-${esc(name)}">${esc(name)} best, kg</label><input id="best-${esc(name)}" class="pill num" inputmode="decimal" value="${bestOverall(name) ? Math.round(bestOverall(name)) : ''}" placeholder="kg" data-best="${esc(name)}"><span class="unit">kg</span></div>`).join('')}
    </section>
    <p class="note">Your expected one-rep max. Every set shows its % of this, and Exodia updates it when you beat it.</p>
    <p class="section">Your data</p>
    <section class="card">
      <div class="row"><span style="flex:1">Saved on this device</span><span class="muted num">${state.sessions.length} ${state.sessions.length === 1 ? 'session' : 'sessions'}</span></div>
      <div class="row"><button class="textBtn" data-action="export">Download a backup</button></div>
      <div class="row"><label class="textBtn" style="display:flex;align-items:center;cursor:pointer">Import from StrengthLog<input type="file" accept=".csv,text/csv" class="sr" data-action="import-strengthlog"></label></div>
      ${view.importNote ? `<div class="row"><span class="muted" role="status" style="font-size:15px">${esc(view.importNote)}</span></div>` : ''}
      <div class="row"><label class="textBtn" style="display:flex;align-items:center;cursor:pointer">Restore a backup<input type="file" accept="application/json" class="sr" data-action="import"></label></div>
    </section>
    <p class="note">On iPhone, add Exodia to your Home Screen so Safari keeps your data. Sync between devices with Face ID comes next.</p>
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
  const focus = lifts[0];
  const weeks = Array.from({ length: 6 }, (unused, index) => {
    const end = addDays(todayIso(), -7 * (5 - index));
    const volume = state.sessions.filter((session) => session.date > addDays(end, -7) && session.date <= end).reduce((sum, session) => sum + sessionVolume(session), 0);
    return { end, volume };
  });
  const maxVolume = Math.max(1, ...weeks.map((week) => week.volume));
  return `<p class="eyebrow">Progress</p>
    <h2 class="title" style="font-size:28px;line-height:34px">${focus ? esc(focus) : 'Your lifts'}</h2>
    <section class="card" style="margin-top:16px;padding:12px 16px 4px">
      ${focus ? `<p class="chartTitle" style="margin:0">Expected 1RM · ${Math.round(bestOverall(focus))} kg</p>${chartFor(history.get(focus))}` : '<p class="empty">Your strongest lift shows up here once you log it.</p>'}
    </section>
    <p class="section">Volume per week</p>
    <section class="card" style="padding:14px 16px">
      <div class="weekBars" role="img" aria-label="Volume for the last 6 weeks">${weeks.map((week) => `<div class="weekBar"><div style="height:${Math.round((week.volume / maxVolume) * 100)}%"></div></div>`).join('')}</div>
      <div class="axis num" style="margin:6px 0 0"><span>6 weeks ago</span><span>${tonnes(weeks.at(-1).volume)} this week</span></div>
    </section>
    <p class="section">Best lifts</p>
    <section class="card">
      ${lifts.slice(0, 6).map((name) => `<div class="row"><span style="flex:1">${esc(name)}</span><span class="muted num">${Math.round(bestOverall(name))} kg</span></div>`).join('') || '<p class="empty" style="margin:14px 0">Nothing yet.</p>'}
    </section>`;
};

const drawerContent = () => {
  const history = exodiaHistory();
  return `${[['home', 'Home', ICONS.home], ['trends', 'Trends', ICONS.trends.replace('width="24" height="24"', 'width="22" height="22"')], ['you', 'You', ICONS.you]].map(([route, label, icon]) => `<a class="navItem${view.route === route ? ' on' : ''}" href="#/${route === 'home' ? '' : route}" ${view.route === route ? 'aria-current="page"' : ''}>${icon}${label}</a>`).join('')}
      <p class="drawerLabel">Exodia</p>
      <div class="drawerRow"><span>Hit ${history.hits} ${history.hits === 1 ? 'time' : 'times'}</span></div>
      <div class="drawerRow"><span>Last hit</span><span class="muted">${history.last ? dayLabel(history.last) : 'Not yet'}</span></div>
      <p class="drawerLabel">Recent sessions</p>
      ${sortedSessions().slice(0, 8).map((session) => `<button class="drawerRow" data-action="jump-session" data-date="${session.date}"><span>${dayLabel(session.date)}</span><span class="muted num">${tonnes(sessionVolume(session))}</span></button>`).join('') || '<p class="drawerRow muted">None yet</p>'}`;
};

const renderDrawer = () => `<div class="overlay">
    <button class="scrim" data-action="close-menu" aria-label="Close menu"></button>
    <nav class="drawer" aria-label="Exodia">${drawerContent()}</nav>
  </div>`;

const renderComposer = () => {
  const picks = pickList();
  const query = !/\d/.test(view.draft) && view.draft.trim();
  return `<div class="overlay">
    <button class="scrim" data-action="close-composer" aria-label="Close"></button>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="composer-title">
      <div class="grab" aria-hidden="true"></div>
      <div class="sheetHead"><h2 id="composer-title" class="sheetTitle">Add to ${dayLabel(view.composerDate || todayIso()).replace(/^(Today|Yesterday)$/, (word) => word.toLowerCase())}</h2><button class="iconBtn" style="margin-left:auto" data-action="close-composer" aria-label="Close">${ICONS.close}</button></div>
      <div class="days scroll" role="group" aria-label="Day">${Array.from({ length: 14 }, (unused, index) => addDays(todayIso(), -index)).map((iso) => `<button class="chip" data-action="composer-day" data-date="${iso}" aria-pressed="${(view.composerDate || todayIso()) === iso}"><span class="chipFace">${dayLabel(iso)}</span></button>`).join('')}</div>
      <div class="prompt">
        <label for="draft" class="sr">Type or say what you did</label>
        <textarea id="draft" class="promptInput" rows="2" placeholder="Bench 120 for 4, 4 and 7">${esc(view.draft)}</textarea>
        <div class="promptBar">
          <button class="iconBtn mic${view.listening ? ' listening' : ''}" style="margin-left:-10px" data-action="mic" aria-label="${view.listening ? 'Stop listening' : 'Speak instead'}">${ICONS.mic}</button>
          <span class="status" role="status">${esc(view.status)}</span>
          <button class="send" data-action="send" aria-label="Log it" ${/\d/.test(view.draft) && !view.busy ? '' : 'disabled'}>${ICONS.up}</button>
        </div>
      </div>
      <div class="scroll" style="flex:1;overflow-y:auto;margin:0 -16px;padding:0 16px">
        <p class="section">${query ? 'Matches' : 'Recent exercises'}</p>
        <div class="picks">
          ${!query || 'cardio'.includes(query.toLowerCase()) ? `<button class="pick" data-action="pick-cardio"><span style="flex:1"><span class="pickName">Cardio</span><span class="pickLast">Cardio or a walk, 30 min · counts for Move</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}
          ${picks.map((name) => {
            const last = lastSetsFor(name, view.composerDate || todayIso());
            return `<button class="pick" data-action="pick" data-name="${esc(name)}" aria-label="Add ${esc(name)} to ${dayLabel(view.composerDate || todayIso())}"><span style="flex:1;min-width:0"><span class="pickName">${esc(name)}</span><span class="pickLast num">${last ? `Last ${last[0].kg} × ${last[0].reps} · ${setCount(last.length)}` : 'New'}</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>`;
          }).join('')}
          ${query && picks.length === 0 ? `<button class="pick" data-action="create" data-name="${esc(query)}"><span style="flex:1"><span class="pickName">Create “${esc(titleCase(query))}”</span></span><span class="plusDot" aria-hidden="true">${ICONS.plus}</span></button>` : ''}
        </div>
      </div>
    </div>
  </div>`;
};

const render = () => {
  const app = document.getElementById('app');
  const focused = document.activeElement;
  const focusKey = focused && focused.id === 'draft' ? 'draft' : null;
  const page = view.route === 'trends' ? renderTrends() : view.route === 'you' ? renderYou() : renderHome();
  const dock = `<div class="dock"><button class="dockBtn" data-action="open-composer" aria-label="Log a set, type or speak"><span class="dockText">Log a set…</span><span class="iconBtn" aria-hidden="true">${ICONS.mic}</span></button></div>`;
  const layout = desktopQuery.matches
    ? `<div class="desk">
        <nav class="side" aria-label="Exodia"><a class="sideBrand" href="#/">Exodia</a>${drawerContent()}</nav>
        <div class="center">${page}${dock}</div>
        <aside class="right" aria-label="Progress">${renderProgress()}</aside>
      </div>`
    : `<header class="topbar"><div class="topbarInner">
        <button class="iconBtn" data-action="open-menu" aria-label="Open menu">${ICONS.menu}</button>
        <a class="brand" href="#/">Exodia</a>
        <a class="iconBtn" href="#/trends" aria-label="Trends">${ICONS.trends}</a>
      </div></header>
      ${page}${dock}${view.menu ? renderDrawer() : ''}`;
  app.innerHTML = `
    ${layout}
    ${view.composer ? renderComposer() : ''}
    ${view.toast ? `<button class="toast" role="status" data-action="dismiss-toast" aria-label="Dismiss"><span class="trophy">${ICONS.trophy}</span><div><p class="toastTitle">New PR · ${esc(view.toast.name)}</p><p class="toastText num">${view.toast.set} · expected ${view.toast.value} kg, +${view.toast.gain} kg</p></div></button>` : ''}`;
  if (focusKey === 'draft' || (view.composer && view.focusDraft)) {
    const draft = document.getElementById('draft');
    if (draft) {
      draft.focus();
      draft.setSelectionRange(draft.value.length, draft.value.length);
    }
    view.focusDraft = false;
  }
};

const closeComposer = () => {
  view.composer = false;
  view.draft = '';
  view.status = '';
  stopListening();
};

let recognition = null;
const stopListening = () => {
  if (recognition) recognition.stop();
  recognition = null;
  view.listening = false;
};

const startListening = () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    view.status = 'Use the mic on your keyboard.';
    view.focusDraft = true;
    render();
    return;
  }
  recognition = new Recognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  const before = view.draft ? view.draft + ' ' : '';
  recognition.onresult = (event) => {
    view.draft = before + [...event.results].map((result) => result[0].transcript).join(' ');
    render();
  };
  recognition.onerror = () => {
    view.status = 'Voice did not work here. Use the mic on your keyboard.';
    stopListening();
    render();
  };
  recognition.onend = () => {
    view.listening = false;
    recognition = null;
    render();
  };
  recognition.start();
  view.listening = true;
  view.status = 'Listening…';
  render();
};

const send = async () => {
  const text = view.draft.trim();
  if (!text || view.busy) return;
  const local = parseLocally(text);
  if (local) {
    addEntries(local, view.composerDate || todayIso());
    closeComposer();
    render();
    return;
  }
  if (!navigator.onLine) {
    view.status = 'Offline. Try “bench 120x4x3”.';
    render();
    return;
  }
  view.busy = true;
  view.status = 'Reading…';
  render();
  try {
    const result = await parseWithAi(text);
    if (!result.exercises?.length && !result.cardioMinutes) throw new Error('Could not find any sets in that.');
    addEntries(result, view.composerDate || todayIso());
    closeComposer();
  } catch (error) {
    view.status = error.message;
  } finally {
    view.busy = false;
    render();
  }
};

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const date = target.dataset.date;
  const session = date ? sessionFor(date) : null;
  if (action === 'import' || action === 'import-strengthlog') return;
  if (action === 'dismiss-toast') view.toast = null;
  if (action === 'open-menu') view.menu = true;
  else if (action === 'close-menu') view.menu = false;
  else if (action === 'open-composer') {
    view.composer = true;
    view.composerDate = target.dataset.date || todayIso();
    view.focusDraft = false;
  } else if (action === 'close-composer') closeComposer();
  else if (action === 'composer-day') view.composerDate = date;
  else if (action === 'toggle-exodia') view.exodiaOpen = !view.exodiaOpen;
  else if (action === 'toggle-session') view.open.has(date) ? view.open.delete(date) : view.open.add(date);
  else if (action === 'jump-session') {
    view.open.add(date);
    view.menu = false;
    location.hash = '#/';
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
    if (view.listening) stopListening();
    else return startListening();
  } else if (action === 'send') return send();
  else if (action === 'export') {
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
    const send = document.querySelector('[data-action="send"]');
    if (send) send.disabled = !/\d/.test(view.draft) || view.busy;
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
  } else if (target.dataset.best) {
    const value = parseFloat(target.value.replace(',', '.'));
    if (value > 0) state.bests[target.dataset.best] = value;
    else delete state.bests[target.dataset.best];
    save();
    render();
  } else if (target.dataset.action === 'import-strengthlog' && target.files[0]) {
    target.files[0].text().then((text) => {
      mergeImported(parseStrengthLog(text));
      render();
    }).catch((error) => {
      view.importNote = error.message;
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
  if (event.target.id === 'draft' && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
  if (event.key === 'Escape' && (view.menu || view.composer)) {
    view.menu = false;
    closeComposer();
    render();
  }
});

const route = () => {
  const name = location.hash.replace(/^#\/?/, '');
  const importToken = name.match(/^import\/([a-f0-9]{48})$/);
  if (importToken) {
    importFromLink(importToken[1]);
    return;
  }
  view.route = ['trends', 'you'].includes(name) ? name : 'home';
  view.menu = false;
  window.scrollTo(0, 0);
  render();
};
window.addEventListener('hashchange', route);
desktopQuery.addEventListener('change', render);
route();

if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js');

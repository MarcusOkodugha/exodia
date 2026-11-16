// Playground sections by Fable 5.2 T (15 Nov): proposals for the 3D body, each "In the app now" next to
// "Proposed". "In the app now" is drawn by the app's own /body3d.js; "Proposed" by /lab/body3d-lab.js (the same file
// with the proposed change switched on). Nothing here is loaded by the app. A stage only holds its WebGL views
// while it is near the screen, so the page never keeps more than a few alive.

const C = { beg: '#BDB7AA', nov: '#A9C4A6', int: '#A88FB5', adv: '#C96442', eli: '#7CA3DD' };
const NAMES = { chest: 'Chest', shoulders: 'Shoulders', rearDelts: 'Rear delts', traps: 'Traps', upperBack: 'Upper back', lowerBack: 'Lower back', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', abs: 'Abs', glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Adductors', calves: 'Calves' };
const GROUPS = Object.keys(NAMES);
const tier = (l) => (l >= 5 ? ['Elite', C.eli] : l >= 4 ? ['Advanced', C.adv] : l >= 3 ? ['Intermediate', C.int] : l >= 2 ? ['Novice', C.nov] : ['Beginner', C.beg]);
const person = (name, cm, kg, sex, levels, tag = '') => ({ id: name, name: tag ? `${name}, ${tag}` : name, heightCm: cm, kg, sex,
  muscles: Object.fromEntries(Object.entries(levels).map(([k, l]) => [k, { color: tier(l)[1], level: l, label: `${NAMES[k]} · ${tier(l)[0]} ${l.toFixed(1)}` }])) });
const every = (l) => Object.fromEntries(GROUPS.map((g) => [g, l]));
// The five people. Marcus and Benjamin from their real numbers; Adam and Romi are guesses (their own numbers are in
// the app's database, which this session could not read); the tall Beginner is made up as the hard test.
const WHO = [
  { key: 'Marcus', cm: 194, kg: 92, sex: 'male', note: '194 cm, 92 kg', levels: { traps: 5.4, lowerBack: 5.0, hamstrings: 4.9, glutes: 4.5, chest: 3.7, quads: 3.7, upperBack: 3.6, rearDelts: 3.6, biceps: 3.6, triceps: 3.6, shoulders: 3.4, abs: 3.7, forearms: 5.4 } },
  { key: 'Benjamin', cm: 195, kg: 110, sex: 'male', note: '195 cm, 110 kg', levels: { traps: 2.3, shoulders: 2.9, rearDelts: 2.3, chest: 2.9, upperBack: 2.3, biceps: 2.3, triceps: 2.9, forearms: 2.3, lowerBack: 2.3 } },
  { key: 'Adam', cm: 180, kg: 80, sex: 'male', note: '180 cm, 80 kg', levels: every(3.0) },
  { key: 'Romi', cm: 178, kg: 75, sex: 'male', note: '178 cm, 75 kg', levels: every(2.5) },
  { key: 'Beginner', cm: 203, kg: 95, sex: 'male', note: '203 cm, 95 kg', levels: every(1.0) },
];
const who = (key, tag) => { const w = WHO.find((x) => x.key === key); return person(w.key, w.cm, w.kg, w.sex, w.levels, tag); };
// The width rule, as both files have it, to print the numbers under the figures.
const avgOf = (w) => { const l = Object.values(w.levels); return l.reduce((a, b) => a + b, 0) / l.length; };
const cap = (lv) => (lv >= 4 ? 1.12 : lv >= 3.5 ? 1.03 + (lv - 3.5) * 0.18 : 1.03);
const widthNow = (w) => Math.max(0.9, Math.min(1.12, Math.sqrt(w.kg / (w.cm / 100) ** 2 / 23)));
const widthNew = (w) => Math.max(0.9, Math.min(cap(avgOf(w)), Math.sqrt(w.kg / (w.cm / 100) ** 2 / 23)));
const frameOf = (w) => (avgOf(w) < 2 ? 'Slim frame' : `Width ${pct(widthNew(w))}`);
const pct = (x) => { const p = Math.round((x - 1) * 100); return `${p < 0 ? '−' : '+'}${Math.abs(p)}%`; };

const root = document.getElementById('fable');
const seg = (name, options, picked, cols = options.length) => `<div class="fxSeg" role="group" data-seg="${name}" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${options.map(([key, label]) => `<button type="button" data-key="${key}" aria-pressed="${key === picked}">${label}</button>`).join('')}</div>`;
const head = (n, title, lead) => `<p class="fxBy">Fable 5.2 T</p><h2>${n}. ${title}</h2><p class="fxLead">${lead}</p><p class="fxLead fxSign">Not in the app. It goes in only when you sign it off.</p>`;
const pair = (a = 'In the app now', b = 'Proposed', extra = '') => `<div class="fxPair${extra}"><div class="fxCol"><div class="fxCell" data-host="now"></div><p class="fxCap">${a}</p></div><div class="fxCol"><div class="fxCell" data-host="new"></div><p class="fxCap">${b}</p></div></div>`;
const VIEWS = [['0', 'Front'], ['3.1416', 'Back'], ['turn', 'Turning']];
// The same key as under the recovery figure on Trends.
const recovKey = '<p class="fxKey"><b>Recovery</b><span>Just trained</span><i style="background:#C96442"></i><i style="background:#E2AF9C"></i><i style="background:#D2DECE"></i><i style="background:#6F9B6A"></i><span>Recovered</span></p>';
const SOUND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path class="on" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="off" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';

root.innerHTML = `
<p class="fxIntro"><b>Fable 5.2 T</b>. Now in the app, so no longer shown here: the feet fix and the level-up animation (v496), strength only on the strong, the clean abs edges and the wrist fade (v499), and Aura mode in Train together (v501). Still to look at: the picking prototype below.</p>







<section class="fx" id="fx-pick">${head(1, 'Picking muscles for a planned day', 'Train together. The figures here show Recovery colours, as in the app. Taps that land just beside a muscle (the shoulder at the outline) now count, here and in the app.')}
  <div class="fxStage fxPhone" data-stage="pickNow">
    <p class="fxCap top">In the app now</p>
    <p class="fxWhy">All three stand still and you tap the muscle on the small figures. No list; a muscle on the other side means turning the figure.</p>
    <div class="fxSquad" data-host="now"></div>
    <div class="fxNames3" data-names></div>
    ${recovKey}
    <p class="fxWhy" data-hint></p>
    <p class="fxPlanned"><span>Planned</span><b data-planned></b></p>
    <p class="fxLinks"><button type="button" class="fxText" data-toggle>Change muscles</button></p>
  </div>
  <div class="fxStage fxPhone" data-stage="pickNew">
    <p class="fxCap top">Proposed</p>
    <p class="fxWhy">Tap Custom: your own figure opens big with every muscle in a list beside it. Tap a name or the figure, then Done. A cross takes a planned muscle off.</p>
    <div class="fxSquad" data-host="new"></div>
    <div class="fxNames3"><span>Marcus</span><span>Benjamin</span><span>Romi</span></div>
    ${recovKey}
    <p class="fxLabel">What to train</p>
    ${seg('kind', [['Push', 'Push'], ['Pull', 'Pull'], ['Legs', 'Legs'], ['Full body', 'Full body'], ['Move', 'Move']], 'Pull')}
    <div class="fxRowLine"><span class="fxLabel">Muscles</span>${seg('custom', [['day', 'Whole day'], ['custom', 'Custom']], 'day')}</div>
    <p class="fxPlanned"><span>Planned</span><b data-planned></b></p>
  </div>
</section>

`;

// ---------- the two renderers, loaded once ----------
let mods = null;
const load = () => mods || (mods = Promise.all([import('/body3d.js'), import('/lab/body3d-lab.js')]).then(([app, lab]) => ({ app: app.createBodyView, lab: lab.createBodyView })));

// A group of views that turn together: Front / Back glide there, Turning keeps going at the app's own idle speed.
const turner = (views, start) => {
  let a = 0.5, target = null, turning = false, raf = 0, last = 0, dead = false;
  const step = (now) => { raf = 0; if (dead) return; const dt = Math.min(50, now - (last || now)) / 16.7; last = now;
    if (turning) a += 0.006 * dt; else if (target !== null) { const d = Math.atan2(Math.sin(target - a), Math.cos(target - a)); if (Math.abs(d) < 0.003) { a = target; target = null; } else a += d * Math.min(1, 0.16 * dt); }
    for (const v of views) v.debug.setAngle(a);
    if (turning || target !== null) raf = requestAnimationFrame(step); else last = 0; };
  const go = () => { if (!raf) raf = requestAnimationFrame(step); };
  const set = (key, jump) => { turning = key === 'turn'; target = turning ? null : Number(key); if (jump && !turning) { a = target; target = null; for (const v of views) v.debug.setAngle(a); } else go(); };
  set(start, true);
  return { set, pause: () => { turning = false; target = null; }, stop: () => { dead = true; cancelAnimationFrame(raf); } };
};
const onSeg = (stage, name, fn) => { const el = stage.querySelector(`[data-seg="${name}"]`); if (!el) return () => {};
  const h = (e) => { const b = e.target.closest('button'); if (!b) return; for (const x of el.children) x.setAttribute('aria-pressed', String(x === b)); fn(b.dataset.key); };
  el.addEventListener('click', h); return () => el.removeEventListener('click', h); };
const segKey = (stage, name) => stage.querySelector(`[data-seg="${name}"] [aria-pressed="true"]`)?.dataset.key;
const unpress = (stage, name) => { for (const x of stage.querySelectorAll(`[data-seg="${name}"] button`)) x.setAttribute('aria-pressed', 'false'); };

// A pair: the app's view and the lab's view, same people, same angle, same picked muscle.
const makePair = async (stage, { people, lab, viewSeg, selected = null, zoom = null }) => {
  const m = await load(); let sel = selected; const views = [];
  const pick = (key) => { sel = key && key !== sel ? key : null; for (const v of views) v.setSelected(sel); };
  const hosts = [stage.querySelector('[data-host="now"]'), stage.querySelector('[data-host="new"]')];
  views.push(await m.app({ onPick: pick }), await m.lab({ onPick: pick, lab }));
  // Close up: the same view in a host three times the size (594 x 1140), moved so the point x, y in it sits in the
  // middle of the cell (bottom: its lower edge on the slot's lower edge).
  const place = () => views.forEach((v, i) => { let host = hosts[i]; const close = zoom && segKey(stage, zoom.seg) === 'close';
    if (zoom) { let inner = host.querySelector('.fxInner'); if (!inner) { inner = document.createElement('div'); inner.className = 'fxInner'; host.appendChild(inner); }
      inner.classList.toggle('close', close); inner.style.left = close ? Math.round(host.clientWidth / 2 - zoom.x) + 'px' : ''; inner.style.top = close ? Math.round(zoom.bottom ? 380 - 1140 : 190 - zoom.y) + 'px' : ''; host = inner; }
    v.attach(host); });
  const setPeople = (list) => views.forEach((v, i) => v.setPeople(list(i === 0 ? 'in the app now' : 'proposed')));
  place(); setPeople(people); for (const v of views) v.setSelected(sel);
  const turn = turner(views, viewSeg ? segKey(stage, viewSeg) : '0');
  const offs = viewSeg ? [onSeg(stage, viewSeg, (key) => turn.set(key))] : [];
  if (zoom) offs.push(onSeg(stage, zoom.seg, () => { place(); turn.set(segKey(stage, viewSeg) || '0', true); }));
  // Dragging a figure yourself takes over from the switch.
  const grab = () => { turn.pause(); if (viewSeg) unpress(stage, viewSeg); };
  hosts.forEach((h) => h.addEventListener('pointerdown', grab));
  return { setPeople, views, turn, select: (key) => { sel = key; for (const v of views) v.setSelected(sel); }, destroy: () => { turn.stop(); offs.forEach((f) => f()); hosts.forEach((h) => h.removeEventListener('pointerdown', grab)); views.forEach((v) => v.destroy()); } };
};

// ---------- 4: picking muscles ----------
const RC = { 4: '#C96442', 3: '#E2AF9C', 2: '#D2DECE', 1: '#6F9B6A' };
const RECOV = {
  Marcus: { chest: 4, shoulders: 4, triceps: 3, rearDelts: 1, quads: 3, glutes: 2, hamstrings: 2, adductors: 1, calves: 1, lowerBack: 2, upperBack: 1, traps: 1, biceps: 1, forearms: 1, abs: 2 },
  Benjamin: { chest: 3, shoulders: 3, triceps: 3, rearDelts: 2, upperBack: 2, traps: 1, biceps: 2, forearms: 1, lowerBack: 1 },
  Romi: { chest: 1, shoulders: 1, triceps: 1, rearDelts: 1, quads: 4, glutes: 4, hamstrings: 3, adductors: 3, calves: 2, lowerBack: 2, upperBack: 1, traps: 1, biceps: 1, forearms: 1, abs: 1 },
};
const KIND = { Push: ['chest', 'shoulders', 'triceps'], Pull: ['upperBack', 'rearDelts', 'biceps', 'traps'], Legs: ['quads', 'hamstrings', 'glutes', 'adductors'], 'Full body': [...GROUPS], Move: [] };
const BACK = new Set(['rearDelts', 'traps', 'upperBack', 'lowerBack', 'triceps', 'glutes', 'hamstrings', 'calves']);
const squad = (extra) => ['Marcus', 'Benjamin', 'Romi'].map((n, i) => { const w = WHO.find((x) => x.key === n);
  return { id: n, name: n, heightCm: w.cm, kg: w.kg, sex: w.sex, muscles: Object.fromEntries(GROUPS.map((g) => [g, { color: RC[RECOV[n][g]] || null, level: w.levels[g] || null, label: NAMES[g] }])), ...extra(i) }; });
const CROSS = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
// The planned muscles, each with a small cross that takes it off (as the app has from v492).
const listOf = (keys) => (keys.length ? GROUPS.filter((g) => keys.includes(g)).map((g) => `<span class="fxMus">${NAMES[g]}<button type="button" data-off="${g}" aria-label="Remove ${NAMES[g]}">${CROSS}</button></span>`).join('') : 'Nothing yet');

// In the app now: all three stand still, turned to the day's side, you 1.6 times as wide; tap a muscle on a figure.
const makePickNow = async (stage) => {
  const m = await load(); let picking = true, muscles = [...KIND.Pull];
  const names = stage.querySelector('[data-names]'), hint = stage.querySelector('[data-hint]'), planned = stage.querySelector('[data-planned]'), btn = stage.querySelector('[data-toggle]');
  const view = await m.app({ onPick: (key) => { if (!picking || !key) return; muscles = muscles.includes(key) ? muscles.filter((x) => x !== key) : [...muscles, key]; draw(); } });
  const draw = () => {
    view.setPeople(squad((i) => (picking ? { picks: muscles, zoom: i === 0 ? 1.6 : 1 } : {})));
    view.setMode(picking ? { pick: true, face: Math.PI } : {});
    names.style.gridTemplateColumns = picking ? '1.6fr 1fr 1fr' : '1fr 1fr 1fr'; names.innerHTML = '<span>Marcus</span><span>Benjamin</span><span>Romi</span>';
    hint.textContent = picking ? 'Tap a muscle to add it to the workout.' : 'Pull day on Sunday.'; planned.innerHTML = listOf(muscles); btn.textContent = picking ? 'Done' : 'Change muscles';
  };
  const toggle = () => { picking = !picking; draw(); };
  const off = (e) => { const b = e.target.closest('[data-off]'); if (b) { muscles = muscles.filter((x) => x !== b.dataset.off); draw(); } };
  btn.addEventListener('click', toggle); planned.addEventListener('click', off); view.attach(stage.querySelector('[data-host]')); draw();
  return { destroy: () => { btn.removeEventListener('click', toggle); planned.removeEventListener('click', off); view.destroy(); } };
};

// Proposed: Custom opens your own figure over the screen with a list beside it.
const makePickNew = async (stage) => {
  const m = await load(); let kind = 'Pull', custom = null, picking = false, face = Math.PI; // custom: null = the whole day
  const planned = stage.querySelector('[data-planned]');
  const chosen = () => custom || KIND[kind];
  const back = document.createElement('div'); back.className = 'fxPickBack';
  const ui = document.createElement('div'); ui.className = 'fxPick';
  ui.innerHTML = '<p class="fxPickTitle">Select the muscles you want to train</p><p class="fxPickSub"></p><div class="fxPickList"></div><button type="button" class="fxDone">Done</button>';
  const list = ui.querySelector('.fxPickList'), sub = ui.querySelector('.fxPickSub');
  const view = await m.lab({ lab: { stay: true }, onPick: (key) => { if (picking && key) flip(key, false); }, onCollapse: () => { if (picking) done(true); } });
  const people = () => squad((i) => (picking ? { picks: i === 0 ? chosen() : [] } : {}));
  const draw = () => {
    view.setPeople(people()); view.setMode(picking ? { pick: true, face } : {});
    planned.innerHTML = listOf(chosen());
    sub.textContent = `${kind} day · ${chosen().length} picked`;
    list.innerHTML = GROUPS.map((g) => `<button type="button" class="fxPickRow" data-key="${g}" aria-pressed="${chosen().includes(g)}"><i style="background:${RC[RECOV.Marcus[g]] || '#E9E5DC'}"></i><span>${NAMES[g]}</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg></button>`).join('');
  };
  // From the list the figure turns to the side that muscle is on; from a tap on the figure it stays as you hold it.
  const flip = (key, turn) => { const now = chosen(); custom = now.includes(key) ? now.filter((x) => x !== key) : [...now, key]; if (turn) face = BACK.has(key) ? Math.PI : 0; draw(); };
  const open = () => { if (picking) return; picking = true; if (!custom) custom = [...KIND[kind]]; face = kind === 'Pull' ? Math.PI : 0;
    document.body.append(back, ui); document.body.classList.add('fxPicking'); draw(); view.expand(0);
    requestAnimationFrame(() => requestAnimationFrame(() => { back.classList.add('on'); ui.classList.add('on'); })); };
  const done = (closed) => { if (!picking) return; picking = false; back.classList.remove('on'); ui.classList.remove('on'); if (!closed) view.collapse(); draw();
    setTimeout(() => { if (!picking) { back.remove(); ui.remove(); document.body.classList.remove('fxPicking'); } }, 520); };
  const onList = (e) => { const b = e.target.closest('[data-key]'); if (b) flip(b.dataset.key, true); };
  const offOne = (e) => { const b = e.target.closest('[data-off]'); if (!b) return; custom = chosen().filter((x) => x !== b.dataset.off); for (const x of stage.querySelectorAll('[data-seg="custom"] button')) x.setAttribute('aria-pressed', String(x.dataset.key === 'custom')); draw(); };
  planned.addEventListener('click', offOne);
  list.addEventListener('click', onList); ui.querySelector('.fxDone').addEventListener('click', () => done(false));
  const offs = [
    onSeg(stage, 'kind', (key) => { kind = key; custom = null; for (const x of stage.querySelectorAll('[data-seg="custom"] button')) x.setAttribute('aria-pressed', String(x.dataset.key === 'day')); draw(); }),
    onSeg(stage, 'custom', (key) => { if (key === 'custom') open(); else { custom = null; draw(); } }),
  ];
  view.attach(stage.querySelector('[data-host]')); draw();
  return { destroy: () => { offs.forEach((f) => f()); back.remove(); ui.remove(); document.body.classList.remove('fxPicking'); view.destroy(); } };
};

// ---------- 5: Aura ----------
// The song's own clock drives everything: the drop and the tempo, measured from the file Marcus sent.
const AURA = { drop: 40.5, bpm: 99, bars: 4 };
const BEAT = 60 / AURA.bpm, SCENE = BEAT * 4 * AURA.bars; // one scene is four bars, about 9.7 s
// Placeholder song until the real one is on the Worker: a soft beat and four chords made with Web Audio at the same
// tempo, quiet for the first two bars and "dropping" after them, so the scenes can be judged without the file.
const synthSong = (ac) => { const out = ac.createGain(); out.gain.value = 0.4; out.connect(ac.destination);
  const chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]; const t0 = ac.currentTime + 0.08; let n = 0, next = t0;
  const note = (type, f0, f1, at, len, vol, attack) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, at + len * 0.6);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + len); o.connect(g).connect(out); o.start(at); o.stop(at + len + 0.05); };
  const fill = () => { while (next < ac.currentTime + 0.4) { const dropped = n >= 8;
    if (dropped) note('sine', 105, 44, next, 0.34, 0.6, 0.01);
    if (dropped && n % 2 === 1) note('triangle', chords[Math.floor(n / 8) % 4][2] * 2, 0, next, 0.5, 0.05, 0.02);
    if (n % 8 === 0) for (const f of chords[(n / 8) % 4]) note('triangle', f, 0, next, BEAT * 8, dropped ? 0.11 : 0.07, 0.5);
    n++; next += BEAT; } };
  const id = setInterval(fill, 120); fill();
  return { drop: BEAT * 8, time: () => ac.currentTime - t0, mute: (m) => out.gain.setTargetAtTime(m ? 0.0001 : 0.4, ac.currentTime, 0.05), seek: () => {}, stop: () => { clearInterval(id); out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.1); } }; };
// The real song: asked for only now, from the Worker; then the local test file; else the placeholder. Everything is
// started inside the tap, so the phone lets it play.
const startSong = (say) => { const AC = window.AudioContext || window.webkitAudioContext, ac = AC ? new AC() : null; if (ac && ac.state === 'suspended') ac.resume();
  const audio = new Audio(), urls = ['/api/aura-song', '/lab/aura.mp3']; let synth = null, muted = false, dead = false, at = 0;
  audio.loop = true; audio.preload = 'auto';
  const fall = () => { if (dead) return; if (at < urls.length) { audio.src = urls[at++]; audio.play().then(() => say(''), fall); } else if (ac) { synth = synthSong(ac); synth.mute(muted); say('Placeholder music: the song is not on the Worker yet.'); } };
  audio.addEventListener('error', () => { if (!synth) fall(); }); fall();
  return { drop: () => (synth ? synth.drop : AURA.drop), time: () => (synth ? synth.time() : audio.currentTime), playing: () => Boolean(synth) || (!audio.paused && audio.readyState > 2),
    mute: (m) => { muted = m; audio.muted = m; if (synth) synth.mute(m); }, seek: (t) => { if (!synth) audio.currentTime = t; },
    stop: () => { dead = true; audio.pause(); audio.removeAttribute('src'); audio.load(); if (synth) synth.stop(); if (ac) setTimeout(() => ac.close(), 600); } }; };
const makeAura = async (stage) => {
  const m = await load(); const day = KIND.Pull, btn = stage.querySelector('[data-aura]'), muteBtn = stage.querySelector('[data-mute]'), skip = stage.querySelector('[data-skip]'), note = stage.querySelector('[data-song]');
  let on = false, song = null, raf = 0, scene = '', timers = [];
  const now = await m.app({}), view = await m.lab({ lab: { fade: 600 } });
  const recov = (n) => (g) => RC[RECOV[n][g]] || null, strength = (n) => (g) => { const l = WHO.find((w) => w.key === n).levels[g]; return l ? tier(l)[1] : null; }, trained = () => (g) => (day.includes(g) ? '#C96442' : null);
  const people = (colour, picks) => ['Marcus', 'Benjamin', 'Romi'].map((n) => { const w = WHO.find((x) => x.key === n);
    return { id: n, name: n, heightCm: w.cm, kg: w.kg, sex: w.sex, picks: picks || [], muscles: Object.fromEntries(GROUPS.map((g) => [g, { color: colour(n)(g), level: w.levels[g] || null, label: NAMES[g] }])) }; });
  const later = (ms, f) => timers.push(setTimeout(() => { if (on) f(); }, ms));
  const ghost = (colour) => { view.setPeople(people(colour, [])); view.setMode({ pick: true, spin: true }); }; // everyone fully see-through
  // From see-through, the whole body builds from the feet up over two bars while it turns, then stands complete.
  const build = (colour, wait) => { later(wait, () => { view.setPeople(people(colour, GROUPS)); view.throwSpin(0.07); view.buildIn(GROUPS, 'feet', BEAT * 8 * 1000).then(() => { if (on && scene.includes('|build')) view.setMode({}); }); }); };
  const SCENES = [
    ['build-strength', () => { ghost(strength); build(strength, 0); }], // the drop
    ['focus', () => { view.setPeople(people(trained, day)); view.setMode({ pick: true, spin: true }); }],
    ['recovery', () => { view.setPeople(people(recov)); view.setMode({}); view.throwSpin(0.05); }],
    ['build-recovery', () => { ghost(recov); build(recov, BEAT * 2 * 1000); }],
    ['focus-build', () => { view.setPeople(people(recov, day)); view.setMode({ pick: true, spin: true }); view.buildIn(day, null, BEAT * 4 * 1000); }],
    ['strength', () => { view.setPeople(people(strength)); view.setMode({}); view.throwSpin(0.09); }],
    ['build-strength', () => { ghost(strength); build(strength, BEAT * 2 * 1000); }],
  ];
  // Which scene the song is in right now; a change of scene is the only thing that does any work.
  const tick = () => { raf = requestAnimationFrame(tick); if (!song || !song.playing()) return; const t = song.time(), d = song.drop();
    const name = t < d ? 'intro' : 's' + Math.floor((t - d) / SCENE); if (name === scene.split('|')[0]) return;
    for (const id of timers) clearTimeout(id); timers = [];
    if (name === 'intro') { scene = 'intro|intro'; ghost(strength); return; }
    const i = Number(name.slice(1)), [kind, go] = i === 0 ? SCENES[0] : SCENES[1 + (i - 1) % (SCENES.length - 1)]; scene = name + '|' + kind; go(); };
  const stop = () => { on = false; cancelAnimationFrame(raf); for (const id of timers) clearTimeout(id); timers = []; if (song) song.stop(); song = null; scene = '';
    btn.setAttribute('aria-checked', 'false'); muteBtn.hidden = true; skip.hidden = true; note.textContent = ''; view.setMode({}); view.setPeople(people(recov)); };
  const toggle = () => { if (on) return stop(); on = true; btn.setAttribute('aria-checked', 'true'); muteBtn.hidden = false; skip.hidden = false; muteBtn.setAttribute('aria-pressed', 'false'); muteBtn.setAttribute('aria-label', 'Sound off');
    song = startSong((text) => { note.textContent = text; }); scene = ''; ghost(strength); scene = 'intro|intro'; tick(); };
  const mute = () => { const m = muteBtn.getAttribute('aria-pressed') !== 'true'; muteBtn.setAttribute('aria-pressed', String(m)); muteBtn.setAttribute('aria-label', m ? 'Sound on' : 'Sound off'); if (song) song.mute(m); };
  const jump = () => { if (song) song.seek(AURA.drop - 3); };
  btn.addEventListener('click', toggle); muteBtn.addEventListener('click', mute); skip.addEventListener('click', jump);
  now.attach(stage.querySelector('[data-host="now"]')); now.setPeople(people(recov)); view.attach(stage.querySelector('[data-host="new"]')); view.setPeople(people(recov));
  return { destroy: () => { if (on) stop(); btn.removeEventListener('click', toggle); muteBtn.removeEventListener('click', mute); skip.removeEventListener('click', jump); now.destroy(); view.destroy(); } };
};

// ---------- stages: built when near the screen, taken down when far away ----------
const MAKE = {
  row: (s) => makePair(s, { people: (tag) => WHO.map((w) => who(w.key, tag)), lab: { relax: true }, viewSeg: 'rowView' }),
  one: async (s) => { const p = await makePair(s, { people: (tag) => [who(segKey(s, 'onePerson'), tag)], lab: { relax: true }, viewSeg: 'oneView' });
    const off = onSeg(s, 'onePerson', (key) => p.setPeople((tag) => [who(key, tag)])); return { destroy: () => { off(); p.destroy(); } }; },
  abs: async (s) => { const p = await makePair(s, { people: (tag) => [who('Marcus', tag)], lab: { abs: true }, viewSeg: 'absView', selected: 'abs', zoom: { seg: 'absZoom', x: 297, y: 440 } });
    const off = onSeg(s, 'absPick', (key) => p.select(key === 'abs' ? 'abs' : null)); return { destroy: () => { off(); p.destroy(); } }; },
  fingers: (s) => makePair(s, { people: (tag) => [who('Marcus', tag)], lab: { wrist: true }, viewSeg: 'fingersView', zoom: { seg: 'fingersZoom', x: 128, y: 630 } }),
  pickNow: makePickNow, pickNew: makePickNew, aura: makeAura,
};
const KEEP = new URLSearchParams(location.search).has('shots'); // for full-page pictures: every stage stays up
const live = new Map();
const io = new IntersectionObserver((entries) => { for (const e of entries) { const s = e.target, name = s.dataset.stage;
  if (e.isIntersecting && !live.has(s)) { const made = MAKE[name](s).catch((err) => { s.classList.add('fxFail'); s.dataset.fail = 'Could not draw: ' + err.message; return null; }); live.set(s, made); }
  else if (!KEEP && !e.isIntersecting && live.has(s) && !document.querySelector('.body3dOver.on')) { const made = live.get(s); live.delete(s); made.then((x) => x && x.destroy()); } } }, { rootMargin: '250px 0px' });
for (const s of root.querySelectorAll('[data-stage]')) { io.observe(s); if (KEEP && !live.has(s)) live.set(s, MAKE[s.dataset.stage](s).catch(() => null)); }
window.__fable = { live, ready: async () => { await Promise.all([...live.values()]); return live.size; } };

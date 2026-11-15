// Playground sections by Fable 5.2 T (15 Nov): five proposals for the 3D body, each "In the app now" next to
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
// The five people. Marcus and Benjamin from their real numbers; Adam, Romi and the tall Beginner are assumptions.
const WHO = [
  { key: 'Marcus', cm: 194, kg: 92, sex: 'male', note: '194 cm, 92 kg', levels: { traps: 5.4, lowerBack: 5.0, hamstrings: 4.9, glutes: 4.5, chest: 3.7, quads: 3.7, upperBack: 3.6, rearDelts: 3.6, biceps: 3.6, triceps: 3.6, shoulders: 3.4, abs: 3.7, forearms: 5.4 } },
  { key: 'Benjamin', cm: 195, kg: 110, sex: 'male', note: '195 cm, 110 kg', levels: { traps: 2.3, shoulders: 2.9, rearDelts: 2.3, chest: 2.9, upperBack: 2.3, biceps: 2.3, triceps: 2.9, forearms: 2.3, lowerBack: 2.3 } },
  { key: 'Adam', cm: 180, kg: 80, sex: 'male', note: '180 cm, 80 kg', levels: every(3.0) },
  { key: 'Romi', cm: 165, kg: 60, sex: 'female', note: '165 cm, 60 kg', levels: every(2.5) },
  { key: 'Beginner', cm: 203, kg: 95, sex: 'male', note: '203 cm, 95 kg', levels: every(1.0) },
];
const who = (key, tag) => { const w = WHO.find((x) => x.key === key); return person(w.key, w.cm, w.kg, w.sex, w.levels, tag); };
// The width rule, as both files have it, to print the numbers under the figures.
const avgOf = (w) => { const l = Object.values(w.levels); return l.reduce((a, b) => a + b, 0) / l.length; };
const cap = (lv) => (lv >= 5 ? 1.12 : lv >= 4 ? 1.08 + (lv - 4) * 0.04 : lv >= 3 ? 1.04 + (lv - 3) * 0.04 : lv >= 2 ? 1.02 + (lv - 2) * 0.02 : 1.02);
const slim = (lv) => (lv >= 3 ? 1 : 1 - 0.02 * (3 - Math.max(1, lv)));
const widthNow = (w) => Math.max(0.9, Math.min(1.12, Math.sqrt(w.kg / (w.cm / 100) ** 2 / 23)));
const widthNew = (w) => Math.max(0.9, Math.min(cap(avgOf(w)), Math.sqrt(w.kg / (w.cm / 100) ** 2 / 23)) * slim(avgOf(w)));
const pct = (x) => { const p = Math.round((x - 1) * 100); return `${p < 0 ? '−' : '+'}${Math.abs(p)}%`; };

const root = document.getElementById('fable');
const seg = (name, options, picked, cols = options.length) => `<div class="fxSeg" role="group" data-seg="${name}" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${options.map(([key, label]) => `<button type="button" data-key="${key}" aria-pressed="${key === picked}">${label}</button>`).join('')}</div>`;
const head = (n, title, lead) => `<p class="fxBy">Fable 5.2 T</p><h2>${n}. ${title}</h2><p class="fxLead">${lead}</p><p class="fxLead fxSign">Not in the app. It goes in only when you sign it off.</p>`;
const pair = (a = 'In the app now', b = 'Proposed', extra = '') => `<div class="fxPair${extra}"><div class="fxCol"><div class="fxCell" data-host="now"></div><p class="fxCap">${a}</p></div><div class="fxCol"><div class="fxCell" data-host="new"></div><p class="fxCap">${b}</p></div></div>`;
const VIEWS = [['0', 'Front'], ['3.1416', 'Back'], ['turn', 'Turning']];

root.innerHTML = `
<p class="fxIntro"><b>Fable 5.2 T</b>: seven proposals for the 3D body. Every figure can be dragged round and tapped open, as in the app.</p>

<section class="fx" id="fx-strength">${head(1, 'Strength shows only on the strong', 'Today a weak body is drawn almost as big as a strong one, and width comes from body weight alone, so Benjamin (110 kg, Novice) is the broadest of all. Proposed: Advanced and Elite muscles exactly as now; below that a muscle is let down (a Novice’s shoulders and arms lie flat instead of pushed out, a Beginner’s a little more); extra width from weight only as far as the strength level backs it; a weak frame a little slimmer.')}
  <div class="fxStage" data-stage="row">
    ${seg('rowView', VIEWS, '0')}
    <p class="fxCap top">In the app now</p><div class="fxRow5" data-host="now"></div>
    <div class="fxNames">${WHO.map((w) => `<span><b>${w.key}</b><small>${w.cm} cm</small><small>${w.kg} kg</small><small>Width ${pct(widthNow(w))}</small></span>`).join('')}</div>
    <p class="fxCap top">Proposed</p><div class="fxRow5" data-host="new"></div>
    <div class="fxNames">${WHO.map((w) => `<span><b>${w.key}</b><small>${tier(avgOf(w))[0]}</small><small>average ${avgOf(w).toFixed(1)}</small><small>Width ${pct(widthNew(w))}</small></span>`).join('')}</div>
  </div>
  <p class="fxNote">The tall Beginner (203 cm, 95 kg, Beginner on every muscle) is the key test: today he stands there as big as anyone; proposed he is flatter and slimmer than the strong ones and never the strongest-looking.</p>
  <p class="fxNote">Assumptions: Adam about 180 cm, 80 kg, Intermediate 3.0 everywhere; Romi about 165 cm, 60 kg, Novice 2.5 everywhere; Marcus’s forearms Elite. Benjamin’s legs have no lifts logged. Short but very strong people are left as they are for now.</p>
  <div class="fxStage" data-stage="one">
    <p class="fxSub">One at a time, at phone size (the 198 × 380 slot on Trends)</p>
    ${seg('onePerson', WHO.map((w) => [w.key, w.key]), 'Benjamin')}
    ${seg('oneView', VIEWS, '0')}
    ${pair()}
  </div>
</section>

<section class="fx" id="fx-abs">${head(2, 'Abs: the pale specks beside the six-pack', 'With Abs picked, pale specks come and go beside the abs as the body turns. The earlier fix has not regressed (the deep belly muscle is still tucked 4 mm in, the camera depth range is still tight). This is another cause: the abs are thin sheets, and in the gaps where two sheets meet you look at the inside of a sheet, which was painted pale like tendon. Proposed: the inside of an abs sheet is abs colour.')}
  <div class="fxStage" data-stage="abs">
    ${seg('absView', [['0.5', 'Quarter'], ['0', 'Front'], ['turn', 'Turning']], '0.5')}
    ${seg('absZoom', [['phone', 'Phone size'], ['close', 'Close up']], 'phone')}
    ${pair()}
  </div>
</section>

<section class="fx" id="fx-fingers">${head(3, 'Fingers: the blue on the hands', 'The forearm muscles in the model run on as tendons over the back of the hand and into the fingers, and they carry the forearm colour with them. Marcus’s forearms are Elite, so his fingers get blue streaks. Proposed: the forearm colour stops at the wrist; hand and fingers stay plain.')}
  <div class="fxStage" data-stage="fingers">
    ${seg('fingersView', [['3.1416', 'Back'], ['0', 'Front'], ['turn', 'Turning']], '3.1416')}
    ${seg('fingersZoom', [['phone', 'Phone size'], ['close', 'Close up']], 'close')}
    ${pair()}
  </div>
</section>

<section class="fx" id="fx-feet">${head(4, 'Feet cut off', 'The figure fills its slot to within 2%. Toes that point towards you are nearer the eye, so they are drawn a few pixels lower than the slot ends and get cut flat. Proposed: the figure is the same size in the same place, but the picture is allowed to go on below the slot, on top of what lies there (taps there still reach what is underneath).')}
  <div class="fxStage" data-stage="feet">
    ${seg('feetView', [['0.9', 'Quarter'], ['0', 'Front'], ['turn', 'Turning']], '0.9')}
    ${seg('feetZoom', [['phone', 'Phone size'], ['close', 'Close up']], 'close')}
    ${pair('In the app now', 'Proposed', ' feet')}
  </div>
</section>

<section class="fx" id="fx-pick">${head(5, 'Picking muscles for a planned day', 'Train together. Today the three figures stand still, yours a bit bigger, and you tap small muscles. Proposed: choose Custom and your own figure opens over the screen, stands still, and you pick from a list beside it or by tapping the figure; Done closes it. Tap a row for a muscle on the other side and the figure turns to it.')}
  <div class="fxStage fxPhone" data-stage="pickNow">
    <p class="fxCap top">In the app now</p>
    <div class="fxSquad" data-host="now"></div>
    <div class="fxNames3" data-names></div>
    <p class="fxWhy" data-hint></p>
    <p class="fxPlanned"><span>Planned</span><b data-planned></b></p>
    <p class="fxLinks"><button type="button" class="fxText" data-toggle>Change muscles</button></p>
  </div>
  <div class="fxStage fxPhone" data-stage="pickNew">
    <p class="fxCap top">Proposed</p>
    <div class="fxSquad" data-host="new"></div>
    <div class="fxNames3"><span>Marcus</span><span>Benjamin</span><span>Romi</span></div>
    <p class="fxLabel">What to train</p>
    ${seg('kind', [['Push', 'Push'], ['Pull', 'Pull'], ['Legs', 'Legs'], ['Full body', 'Full body'], ['Move', 'Move']], 'Pull')}
    <p class="fxLabel">Muscles</p>
    ${seg('custom', [['day', 'Whole day'], ['custom', 'Custom']], 'day')}
    <p class="fxPlanned"><span>Planned</span><b data-planned></b></p>
  </div>
</section>

<section class="fx" id="fx-levelup">${head(6, 'Level-up: a muscle moves up a colour', 'When a muscle reaches a new level colour you get a notice, like “Rear delts just moved to Advanced”. Tap it and that muscle drains away, then builds back bigger in the new colour from the bottom up, slice by slice, with a lit edge and one shimmer that settles. Today the colour just changes the next time you look.')}
  <div class="fxStage" data-stage="levelup">
    ${seg('luMuscle', GROUPS.map((g) => [g, NAMES[g]]), 'rearDelts', 3)}
    ${seg('luLevel', [['2', 'Novice'], ['3', 'Intermediate'], ['4', 'Advanced'], ['5', 'Elite']], '4')}
    <button type="button" class="fxNotice" data-play><i></i><span><b data-text></b><small>Tap to see it</small></span></button>
    ${pair('In the app now', 'Proposed')}
  </div>
</section>

<section class="fx" id="fx-aura">${head(7, 'Aura mode (Train together)', 'One button under the squad. It starts a song and the figures loop through scenes: a spin, see-through, the muscles you’ll train building in, recovery colours, the trained muscles, everyone’s strength colours, and round again. Tap again to stop.')}
  <div class="fxStage fxPhone" data-stage="aura">
    <p class="fxCap top">In the app now</p>
    <div class="fxSquad" data-host="now"></div>
    <div class="fxNames3"><span>Marcus</span><span>Benjamin</span><span>Romi</span></div>
    <p class="fxCap top">Proposed</p>
    <div class="fxSquad" data-host="new"></div>
    <div class="fxNames3"><span>Marcus</span><span>Benjamin</span><span>Romi</span></div>
    <p class="fxScene" data-scene>Pull day</p>
    <button type="button" class="fxAura" data-aura aria-pressed="false">Aura</button>
  </div>
  <p class="fxNote">The song here is a placeholder made in the page (a soft beat and four chords), until you send the real one. To keep the app light: one small file (a 60 to 90 second loop, AAC or Opus at about 64 kbit/s, roughly 0.5 MB), served by the Worker like any other file, left out of the offline cache, and fetched only when Aura is tapped. It plays from that tap, so the phone never asks for permission; on silent mode the scenes run without sound.</p>
</section>`;

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
  return { setPeople, views, turn, destroy: () => { turn.stop(); offs.forEach((f) => f()); hosts.forEach((h) => h.removeEventListener('pointerdown', grab)); views.forEach((v) => v.destroy()); } };
};

// ---------- 5: picking muscles ----------
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
const listOf = (keys) => (keys.length ? GROUPS.filter((g) => keys.includes(g)).map((g) => NAMES[g]).join(', ') : 'Nothing yet');

// In the app now: all three stand still, turned to the day's side, you 1.6 times as wide; tap a muscle on a figure.
const makePickNow = async (stage) => {
  const m = await load(); let picking = true, muscles = [...KIND.Pull];
  const names = stage.querySelector('[data-names]'), hint = stage.querySelector('[data-hint]'), planned = stage.querySelector('[data-planned]'), btn = stage.querySelector('[data-toggle]');
  const view = await m.app({ onPick: (key) => { if (!picking || !key) return; muscles = muscles.includes(key) ? muscles.filter((x) => x !== key) : [...muscles, key]; draw(); } });
  const draw = () => {
    view.setPeople(squad((i) => (picking ? { picks: muscles, zoom: i === 0 ? 1.6 : 1 } : {})));
    view.setMode(picking ? { pick: true, face: Math.PI } : {});
    names.style.gridTemplateColumns = picking ? '1.6fr 1fr 1fr' : '1fr 1fr 1fr'; names.innerHTML = '<span>Marcus</span><span>Benjamin</span><span>Romi</span>';
    hint.textContent = picking ? 'Tap a muscle to add it to the workout.' : 'Pull day on Sunday.'; planned.textContent = listOf(muscles); btn.textContent = picking ? 'Done' : 'Change muscles';
  };
  const toggle = () => { picking = !picking; draw(); };
  btn.addEventListener('click', toggle); view.attach(stage.querySelector('[data-host]')); draw();
  return { destroy: () => { btn.removeEventListener('click', toggle); view.destroy(); } };
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
    planned.textContent = listOf(chosen());
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
  list.addEventListener('click', onList); ui.querySelector('.fxDone').addEventListener('click', () => done(false));
  const offs = [
    onSeg(stage, 'kind', (key) => { kind = key; custom = null; for (const x of stage.querySelectorAll('[data-seg="custom"] button')) x.setAttribute('aria-pressed', String(x.dataset.key === 'day')); draw(); }),
    onSeg(stage, 'custom', (key) => { if (key === 'custom') open(); else { custom = null; draw(); } }),
  ];
  view.attach(stage.querySelector('[data-host]')); draw();
  return { destroy: () => { offs.forEach((f) => f()); back.remove(); ui.remove(); document.body.classList.remove('fxPicking'); view.destroy(); } };
};

// ---------- 6: level-up ----------
const makeLevelUp = async (stage) => {
  const p = await makePair(stage, { people: () => [], lab: {}, viewSeg: null }); const [app, lab] = p.views;
  const btn = stage.querySelector('[data-play]'), text = btn.querySelector('[data-text]'), dot = btn.querySelector('i'); let busy = false, played = false;
  const key = () => segKey(stage, 'luMuscle'), to = () => Number(segKey(stage, 'luLevel'));
  const marcus = (level) => { const w = WHO[0]; return [person(w.key, w.cm, w.kg, w.sex, { ...w.levels, [key()]: level })]; };
  // Before: the muscle one colour lower, turned so it faces you.
  const reset = () => { played = false; app.setPeople(marcus(to() - 0.4)); lab.setPeople(marcus(to() - 0.4)); p.turn.set(BACK.has(key()) ? '3.1416' : '0');
    text.textContent = `${NAMES[key()]} just moved to ${tier(to())[0]}`; dot.style.background = tier(to())[1]; };
  const play = async () => { if (busy) return; busy = true; btn.classList.add('busy'); if (played) { reset(); await new Promise((r) => setTimeout(r, 700)); }
    played = true; setTimeout(() => app.setPeople(marcus(to())), 560); // the app: the colour simply changes
    await lab.levelUp(0, key(), tier(to())[1], to()); busy = false; btn.classList.remove('busy'); };
  btn.addEventListener('click', play);
  const offs = [onSeg(stage, 'luMuscle', () => { if (!busy) reset(); }), onSeg(stage, 'luLevel', () => { if (!busy) reset(); })];
  reset();
  return { destroy: () => { btn.removeEventListener('click', play); offs.forEach((f) => f()); p.destroy(); } };
};

// ---------- 7: Aura ----------
// Placeholder song: a soft beat and four chords made with Web Audio, started from the tap. 100 beats a minute.
const BEAT = 0.6;
const startSong = () => { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return () => {};
  const ac = new AC(), out = ac.createGain(); out.gain.value = 0.0001; out.connect(ac.destination); out.gain.exponentialRampToValueAtTime(0.4, ac.currentTime + 1.5);
  const chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]; let n = 0, next = ac.currentTime + 0.08;
  const note = (type, f0, f1, at, len, vol, attack) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, at + len * 0.6);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + len); o.connect(g).connect(out); o.start(at); o.stop(at + len + 0.05); };
  const fill = () => { while (next < ac.currentTime + 0.4) { note('sine', 105, 44, next, 0.34, 0.6, 0.01);
    if (n % 2 === 1) note('triangle', chords[Math.floor(n / 8) % 4][2] * 2, 0, next, 0.5, 0.05, 0.02);
    if (n % 8 === 0) for (const f of chords[(n / 8) % 4]) note('triangle', f, 0, next, BEAT * 8, 0.11, 0.5);
    n++; next += BEAT; } };
  const id = setInterval(fill, 120); fill();
  return () => { clearInterval(id); out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.12); setTimeout(() => ac.close(), 800); };
};
const makeAura = async (stage) => {
  const m = await load(); const day = KIND.Pull, btn = stage.querySelector('[data-aura]'), label = stage.querySelector('[data-scene]'); let on = false, stopSong = null, timer = 0, at = 0;
  const now = await m.app({}), view = await m.lab({ lab: { fade: 700 } });
  const recov = (n) => (g) => RC[RECOV[n][g]] || null, strength = (n) => (g) => { const l = WHO.find((w) => w.key === n).levels[g]; return l ? tier(l)[1] : null; }, trained = () => (g) => (day.includes(g) ? '#C96442' : null);
  const people = (colour, picks) => ['Marcus', 'Benjamin', 'Romi'].map((n) => { const w = WHO.find((x) => x.key === n);
    return { id: n, name: n, heightCm: w.cm, kg: w.kg, sex: w.sex, picks: picks || [], muscles: Object.fromEntries(GROUPS.map((g) => [g, { color: colour(n)(g), level: w.levels[g] || null, label: NAMES[g] }])) }; });
  const SCENES = [
    ['Spin', () => { view.setMode({}); view.setPeople(people(recov)); view.throwSpin(0.11); }],
    ['See-through', () => { view.setPeople(people(recov, [])); view.setMode({ pick: true, spin: true }); }],
    ['What you’ll train', () => { view.setPeople(people(recov, day)); view.buildIn(day); }],
    ['Recovery', () => { view.setMode({}); }],
    ['Trained', () => { view.setPeople(people(trained, day)); view.setMode({ pick: true, spin: true }); }],
    ['Strength', () => { view.setMode({}); view.setPeople(people(strength)); }],
  ];
  const say = (t) => { label.classList.add('out'); setTimeout(() => { label.textContent = t; label.classList.remove('out'); }, 180); };
  const next = () => { const [name, go] = SCENES[at % SCENES.length]; at++; say(name); go(); timer = setTimeout(next, BEAT * 8 * 1000); };
  const stop = () => { on = false; clearTimeout(timer); if (stopSong) stopSong(); stopSong = null; btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Aura'; say('Pull day'); view.setMode({}); view.setPeople(people(recov)); };
  const toggle = () => { if (on) return stop(); on = true; at = 0; btn.setAttribute('aria-pressed', 'true'); btn.textContent = 'Stop'; try { stopSong = startSong(); } catch { stopSong = null; } next(); };
  btn.addEventListener('click', toggle);
  now.attach(stage.querySelector('[data-host="now"]')); now.setPeople(people(recov)); view.attach(stage.querySelector('[data-host="new"]')); view.setPeople(people(recov));
  return { destroy: () => { if (on) stop(); btn.removeEventListener('click', toggle); now.destroy(); view.destroy(); } };
};

// ---------- stages: built when near the screen, taken down when far away ----------
const MAKE = {
  row: (s) => makePair(s, { people: (tag) => WHO.map((w) => who(w.key, tag)), lab: { relax: true }, viewSeg: 'rowView' }),
  one: async (s) => { const p = await makePair(s, { people: (tag) => [who(segKey(s, 'onePerson'), tag)], lab: { relax: true }, viewSeg: 'oneView' });
    const off = onSeg(s, 'onePerson', (key) => p.setPeople((tag) => [who(key, tag)])); return { destroy: () => { off(); p.destroy(); } }; },
  abs: (s) => makePair(s, { people: (tag) => [who('Marcus', tag)], lab: { abs: true }, viewSeg: 'absView', selected: 'abs', zoom: { seg: 'absZoom', x: 297, y: 440 } }),
  fingers: (s) => makePair(s, { people: (tag) => [who('Marcus', tag)], lab: { wrist: true }, viewSeg: 'fingersView', zoom: { seg: 'fingersZoom', x: 128, y: 630 } }),
  feet: (s) => makePair(s, { people: (tag) => [who('Marcus', tag)], lab: { feet: true }, viewSeg: 'feetView', zoom: { seg: 'feetZoom', x: 297, bottom: true } }),
  pickNow: makePickNow, pickNew: makePickNew, levelup: makeLevelUp, aura: makeAura,
};
const live = new Map();
const io = new IntersectionObserver((entries) => { for (const e of entries) { const s = e.target, name = s.dataset.stage;
  if (e.isIntersecting && !live.has(s)) { const made = MAKE[name](s).catch((err) => { s.classList.add('fxFail'); s.dataset.fail = 'Could not draw: ' + err.message; return null; }); live.set(s, made); }
  else if (!e.isIntersecting && live.has(s) && !document.querySelector('.body3dOver.on')) { const made = live.get(s); live.delete(s); made.then((x) => x && x.destroy()); } } }, { rootMargin: '250px 0px' });
for (const s of root.querySelectorAll('[data-stage]')) io.observe(s);
window.__fable = { live, ready: async () => { await Promise.all([...live.values()]); return live.size; } };

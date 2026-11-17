// Playground: the Aura build at the drop, as the app does it today next to a smoother version (Opus 5.5, 17 Nov).
// Both squads are drawn by the app's own /body3d.js, with the same people, the same see-through start, the same spin and
// the same order (plan maker first, a beat apart). The only difference is the one buildIn call:
//   now:      buildIn(null, 'feet', 6 beats, { stagger: 1 beat })  one sweep over the whole body, soles to crown
//   smoother: buildIn(null, null,   4 beats, { stagger: 1 beat })  every muscle builds from its own lower edge, the
//             same per-muscle path, edge, swell and shimmer as levelUp
// Nothing here changes how the figure is drawn; no shader or look is touched. Nothing here is loaded by the app.

const C = { beg: '#BDB7AA', nov: '#A9C4A6', int: '#A88FB5', adv: '#C96442', eli: '#7CA3DD' };
const NAMES = { chest: 'Chest', shoulders: 'Shoulders', rearDelts: 'Rear delts', traps: 'Traps', upperBack: 'Upper back', lowerBack: 'Lower back', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', abs: 'Abs', glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Adductors', calves: 'Calves' };
const GROUPS = Object.keys(NAMES);
const tier = (l) => (l >= 5 ? C.eli : l >= 4 ? C.adv : l >= 3 ? C.int : l >= 2 ? C.nov : C.beg);
const every = (l) => Object.fromEntries(GROUPS.map((g) => [g, l]));
// Marcus and Benjamin from their real numbers, Romi a guess (as on the earlier playground).
const SQUAD = [
  { name: 'Marcus', cm: 194, kg: 92, levels: { traps: 5.4, lowerBack: 5.0, hamstrings: 4.9, glutes: 4.5, chest: 3.7, quads: 3.7, upperBack: 3.6, rearDelts: 3.6, biceps: 3.6, triceps: 3.6, shoulders: 3.4, abs: 3.7, forearms: 5.0, adductors: 3.7, calves: 3.0 } },
  { name: 'Benjamin', cm: 195, kg: 110, levels: { traps: 2.3, shoulders: 2.9, rearDelts: 2.3, chest: 2.9, upperBack: 2.3, biceps: 2.3, triceps: 2.9, forearms: 2.3, lowerBack: 2.3 } },
  { name: 'Romi', cm: 178, kg: 75, levels: every(2.5) },
];
// Aura mode in Train together: the strength colours, every muscle picked while it builds (app.js auraBuild).
const people = (picks) => SQUAD.map((w) => ({ id: w.name, name: w.name, heightCm: w.cm, kg: w.kg, sex: 'male', picks,
  muscles: Object.fromEntries(GROUPS.map((g) => [g, { color: w.levels[g] ? tier(w.levels[g]) : null, level: w.levels[g] || null, label: NAMES[g] }])) }));

const BEAT = 60 / 99 * 1000; // the song's tempo, as in the app (AURA.bpm)
const WAYS = {
  now: (view) => view.buildIn(null, 'feet', BEAT * 6, { stagger: BEAT, first: 0 }),
  smooth: (view) => view.buildIn(null, null, BEAT * 4, { stagger: BEAT, first: 0 }),
};

const root = document.getElementById('auraBuild');
const col = (way, title, line) => `<div class="abCol" data-way="${way}"><div class="abHead"><p class="abTitle">${title}</p><button type="button" class="abReplay" data-replay="${way}">Replay</button></div>
  <div class="abSquad" data-host></div><div class="abNames">${SQUAD.map((w) => `<span>${w.name}</span>`).join('')}</div><p class="abLine">${line}</p></div>`;
root.innerHTML = `<p class="abBy">Opus 5.5</p><h2>Aura build: now vs smoother</h2>
<p class="abLead">The drop in Aura mode: everyone stands see-through, then builds up in strength colours, plan maker first, a beat apart, while they turn.</p>
<p class="abLead abSign">Not in the app. It goes in only when you sign it off.</p>
<div class="abPair">
${col('now', 'In the app now', 'One sweep over the whole body from the soles to the crown, cut in 24 slices of about 8 cm, so it climbs in visible steps. 3.6 s per person.')}
${col('smooth', 'Smoother, with the level-up build', 'The level-up build on every muscle at once: each fills from its own lower edge in 24 thin slices, with the lit edge, swell and shimmer. Not one climb from the feet any more. 2.4 s per person, done within the same two bars.')}
</div>
<p class="abAll"><button type="button" class="abReplay" data-replay="both">Replay both together</button></p>
<p class="abNote">Same figures, colours, spin and order on both sides; only the build differs. The figure's look is untouched.</p>`;

let make = null;
const load = () => make || (make = import('/body3d.js').then((m) => m.createBodyView));
const views = {};
const busy = {};
const play = async (way) => {
  const view = views[way]; if (!view) return; const turn = (busy[way] = (busy[way] || 0) + 1);
  // Before the drop: everyone see-through and turning (in the app they have faded in like this during the intro).
  view.setPeople(people([])); view.setMode({ pick: true, spin: true });
  await new Promise((r) => setTimeout(r, 700)); if (busy[way] !== turn) return;
  // The drop, in the app's order: the build is set up first, then the redraw with every muscle picked glides in.
  view.throwSpin(0.07);
  const done = WAYS[way](view);
  view.setPeople(people(GROUPS), { fade: 600 }); view.setMode({ pick: true, spin: true });
  await done; if (busy[way] !== turn) return;
  view.setPeople(people([]), { fade: 600 }); view.setMode({});
};
const start = async () => {
  try {
    const create = await load();
    for (const way of Object.keys(WAYS)) { const v = views[way] = await create({}); v.attach(root.querySelector(`[data-way="${way}"] [data-host]`)); v.setPeople(people([])); }
    play('now'); play('smooth');
  } catch (err) { root.querySelector('.abPair').insertAdjacentHTML('afterend', `<p class="abNote">Could not draw: ${err.message}</p>`); }
};
root.addEventListener('click', (e) => { const b = e.target.closest('[data-replay]'); if (!b) return; const w = b.dataset.replay; if (w === 'both') { play('now'); play('smooth'); } else play(w); });
// Built when it comes near the screen, so the page opens light.
const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '200px 0px' });
io.observe(root);
window.__auraBuild = { views, play, people, GROUPS };

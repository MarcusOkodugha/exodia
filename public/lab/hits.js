// Exodia hit animations for the Playground (lab only; the app does not load this file).
//   const stop = await play('relief' | 'arcs' | 'fist' | 'bars', stageEl)   // stop() ends it and empties the stage
// relief: the hand as a 3D relief that rises, turns and washes from clay to Exodia blue.
// arcs:   flat. Five arcs (Push, Pull, Legs, Arms, Move) close into a ring, the ring becomes the hand, clay turns blue.
// fist, bars: today's two, played by the app itself inside a frame.

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
const CLAY = '#C96442', BLUE = '#7CA3DD', INK = '#23508F';
const PIECES = ['Push', 'Pull', 'Legs', 'Arms', 'Move'];
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const img = (src) => new Promise((done, fail) => { const i = new Image(); i.onload = () => done(i); i.onerror = () => fail(new Error('hits: ' + src)); i.src = src; });
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const caption = (stage, delay) => { const c = document.createElement('div'); c.className = 'hitWord'; c.textContent = 'Exodia'; stage.append(c);
  c.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' }); return c; };
const halo = (stage, delay, n = 2) => { for (let k = 0; k < n; k++) { const r = document.createElement('i'); r.className = 'hitHalo'; stage.append(r);
  r.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.55)' }, { opacity: 0.55, offset: 0.2 }, { opacity: 0, transform: 'translate(-50%, -50%) scale(1.9)' }], { duration: 1500, delay: delay + k * 260, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'both' }); } };

// ---------- relief: the 3D hand ----------

// The logo as a height field: the silhouette swells like a pressed coin, the outline and the eye stand a little
// proud of the fill. Built from the logo picture itself, so it is the real mark, not a redrawn one.
const N = 256;
const blur = (src, r) => { // box blur, three passes: close to a gaussian
  let a = src, b = new Float32Array(N * N);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < N; y++) { let s = 0; for (let x = -r; x <= r; x++) s += a[y * N + Math.max(0, Math.min(N - 1, x))];
      for (let x = 0; x < N; x++) { b[y * N + x] = s / (2 * r + 1); s += a[y * N + Math.min(N - 1, x + r + 1)] - a[y * N + Math.max(0, x - r)]; } }
    const c = new Float32Array(N * N);
    for (let x = 0; x < N; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[Math.max(0, Math.min(N - 1, y)) * N + x];
      for (let y = 0; y < N; y++) { c[y * N + x] = s / (2 * r + 1); s += b[Math.min(N - 1, y + r + 1) * N + x] - b[Math.max(0, y - r) * N + x]; } }
    a = c; }
  return a; };
const heights = (picture) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(picture, 0, 0, N, N);
  const d = g.getImageData(0, 0, N, N).data, alpha = new Float32Array(N * N), line = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) { const a = d[i * 4 + 3] / 255, lum = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    alpha[i] = a; line[i] = a * clamp01((lum - 0.56) / 0.12); } // the outline and the eye are the light parts of the logo
  const body = blur(alpha, 7), rim = blur(line, 2), h = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) h[i] = Math.sqrt(clamp01((body[i] - 0.5) * 2)) * 0.8 + rim[i] * 0.2;
  return h; };

const playRelief = async (stage) => {
  const [THREE, clay, blue] = await Promise.all([import(THREE_URL), img('/hamsa-512.png'), img('/hamsa-512-blue.png')]);
  const h = heights(clay), DEPTH = 0.075;
  const geo = new THREE.PlaneGeometry(1, 1, N - 1, N - 1), pos = geo.attributes.position;
  for (let i = 0; i < N * N; i++) pos.setZ(i, h[i] * DEPTH); // plane rows run top to bottom, like the picture
  geo.computeVertexNormals();
  const tex = (p) => { const t = new THREE.Texture(p); t.anisotropy = 8; t.needsUpdate = true; return t; }; // colours used as they are in the logo
  const U = { tClay: { value: tex(clay) }, tBlue: { value: tex(blue) }, uWash: { value: -0.2 }, uSide: { value: 1 }, uLight: { value: new THREE.Vector3(-0.5, 0.7, 0.8).normalize() }, uFade: { value: 0 } };
  const mat = (side) => new THREE.ShaderMaterial({ transparent: true, uniforms: { ...U, uSide: { value: side } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uSide; void main(){ vUv = uv; vec3 p = position; p.z *= uSide; vec3 n = normal; n.z *= uSide; vN = normalize(normalMatrix * n); vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform sampler2D tClay; uniform sampler2D tBlue; uniform float uWash; uniform float uFade; uniform vec3 uLight; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vec4 a = texture2D(tClay, vUv), b = texture2D(tBlue, vUv); if (a.a < 0.03) discard;
        float w = smoothstep(uWash + 0.035, uWash - 0.035, vUv.y);                 // the blue rises from the wrist to the fingertips
        float band = exp(-pow((vUv.y - uWash) / 0.05, 2.0));                       // a line of light on its front edge
        vec3 base = mix(a.rgb, b.rgb, w);
        vec3 n = normalize(vN); float d = max(dot(n, uLight), 0.0);
        vec3 hv = normalize(uLight + vV); float s = pow(max(dot(n, hv), 0.0), 48.0);
        float rim = pow(1.0 - max(dot(n, vV), 0.0), 3.0);
        vec3 c = base * (0.78 + 0.36 * d) + vec3(1.0, 0.98, 0.95) * (s * 0.38 + rim * 0.12) + vec3(1.0) * band * 0.55;
        gl_FragColor = vec4(c, 1.0) * smoothstep(0.03, 0.6, a.a) * uFade; }`,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const hand = new THREE.Group(); hand.add(new THREE.Mesh(geo, mat(1)));
  const back = new THREE.Mesh(geo, mat(-1)); back.material.side = THREE.BackSide; hand.add(back);
  const scene = new THREE.Scene(); scene.add(hand);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 20); cam.position.set(0, 0, 3.4);
  const canvas = document.createElement('canvas'); canvas.className = 'hitCanvas';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(3, window.devicePixelRatio || 1)); renderer.setClearColor(0x000000, 0);
  const shade = document.createElement('i'); shade.className = 'hitShade'; stage.append(shade, canvas);
  const size = () => { const w = stage.clientWidth, hh = stage.clientHeight; renderer.setSize(w, hh, false); cam.aspect = w / hh;
    cam.position.z = 3.4 * Math.max(1, 0.62 / cam.aspect); cam.updateProjectionMatrix(); };
  size(); window.addEventListener('resize', size);
  halo(stage, 2350); caption(stage, 2700);
  shade.animate([{ opacity: 0, transform: 'translate(-50%, 0) scale(0.6)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }], { duration: 1300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' });
  let raf = 0, t0 = 0, dead = false;
  const frame = (now) => { if (dead) return; t0 = t0 || now; const t = window.__hitT != null ? window.__hitT : reduced() ? 9 : (now - t0) / 1000; // __hitT: a fixed moment, for checking frames
    const rise = outCubic(span(t, 0, 1.25)), wash = inOut(span(t, 1.55, 2.6)), settle = inOut(span(t, 1.2, 3.2));
    U.uFade.value = span(t, 0, 0.45);
    hand.rotation.x = -1.15 * (1 - rise);                                    // lies back, then stands up
    hand.rotation.y = -0.95 * (1 - rise) + 0.3 * rise * (1 - settle) + Math.sin(Math.max(0, t - 3.2) * 0.9) * 0.07;
    const beat = Math.sin(span(t, 2.3, 3.0) * Math.PI) * 0.05;               // one soft swell as it turns blue
    hand.scale.setScalar((0.62 + 0.38 * rise) * (1 + beat)); hand.position.y = 0.06 - 0.12 * (1 - rise) + Math.sin(Math.max(0, t - 3.2) * 1.1) * 0.008;
    U.uWash.value = -0.2 + 1.35 * wash;                                      // uv.y runs up the picture, so the wash goes wrist to fingertips
    U.uLight.value.set(-0.6 + 1.0 * settle, 0.7, 0.8).normalize();
    renderer.render(scene, cam); raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);
  return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', size); geo.dispose(); U.tClay.value.dispose(); U.tBlue.value.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
};

// ---------- arcs: flat ----------

const playArcs = async (stage) => {
  await Promise.all([img('/hamsa-512.png'), img('/hamsa-512-blue.png')]);
  const R = 118, C = 2 * Math.PI * R, SEG = C / 5, GAP = 16, wrap = document.createElement('div'); wrap.className = 'hitArcs';
  const at = (k, r) => { const a = (-90 + 72 * k + 36) * Math.PI / 180; return [150 + Math.cos(a) * r, 150 + Math.sin(a) * r]; };
  wrap.innerHTML = `<svg viewBox="0 0 300 300" aria-hidden="true"><g class="ring">${PIECES.map((_, k) => `<circle cx="150" cy="150" r="${R}" fill="none" stroke="${CLAY}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${SEG - GAP} ${C}" transform="rotate(${-90 + 72 * k + GAP / 2 / R * 180 / Math.PI} 150 150)"/>`).join('')}</g>
    ${PIECES.map((name, k) => { const [x, y] = at(k, R + 20); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${name}</text>`; }).join('')}</svg>
    <img class="hand clay" src="/hamsa-512.png" alt=""><img class="hand blue" src="/hamsa-512-blue.png" alt="">`;
  stage.append(wrap);
  const fast = reduced(), ms = (x) => (fast ? 0 : x), arcs = [...wrap.querySelectorAll('circle')], words = [...wrap.querySelectorAll('text')];
  const ease = 'cubic-bezier(0.3, 0.7, 0.2, 1)';
  arcs.forEach((arc, k) => arc.animate([{ strokeDashoffset: SEG - GAP, opacity: 0 }, { opacity: 1, offset: 0.15 }, { strokeDashoffset: 0, opacity: 1 }], { duration: ms(520), delay: ms(250 + k * 300), easing: ease, fill: 'both' }));
  words.forEach((word, k) => word.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: ms(2300 - k * 300), delay: ms(300 + k * 300), easing: 'ease-out', fill: 'both' }));
  // The five close into one ring, which turns a quarter and tightens around the hand as the hand appears in it.
  const T = 2150;
  arcs.forEach((arc) => arc.animate([{ strokeDasharray: `${SEG - GAP} ${C}` }, { strokeDasharray: `${SEG + 1} ${C}` }], { duration: ms(420), delay: ms(T - 250), easing: 'ease-in-out', fill: 'forwards' }));
  wrap.querySelector('.ring').animate([{ transform: 'none', opacity: 1 }, { transform: 'rotate(90deg) scale(0.86)', opacity: 1, offset: 0.6 }, { transform: 'rotate(120deg) scale(1.25)', opacity: 0 }], { duration: ms(1500), delay: ms(T), easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
  wrap.querySelector('.hand.clay').animate([{ opacity: 0, transform: 'scale(0.82)' }, { opacity: 1, transform: 'scale(1)' }], { duration: ms(700), delay: ms(T + 150), easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'both' });
  // Blue rises through the hand from the wrist; the ring leaves as a halo.
  wrap.querySelector('.hand.blue').animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: ms(900), delay: ms(T + 750), easing: 'cubic-bezier(0.5, 0, 0.2, 1)', fill: 'both' });
  arcs.forEach((arc) => arc.animate([{ stroke: CLAY }, { stroke: BLUE }], { duration: ms(500), delay: ms(T + 750), fill: 'forwards' }));
  wrap.querySelectorAll('.hand').forEach((hand) => hand.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.045)' }, { transform: 'scale(1)' }], { duration: ms(900), delay: ms(T + 1250), easing: 'ease-in-out' }));
  halo(stage, ms(T + 1300), 1); caption(stage, ms(T + 1500));
  return () => {};
};

// ---------- today's two, played by the app in a frame ----------

const playApp = (style) => (stage) => new Promise((done) => {
  const f = document.createElement('iframe'); f.className = 'hitFrame'; f.src = '/'; f.title = 'Exodia'; stage.append(f);
  const t0 = Date.now(); const go = () => { let ok = false;
    try { ok = f.contentWindow.eval(`typeof render === 'function' && typeof view === 'object' && document.querySelector('.exodiaCard') ? (view.leftOpen = false, view.exodiaStyle = ${JSON.stringify(style)}, view.devMenu = false, view.devHit = true, view.wasHit = false, render(), true) : false`); } catch {}
    if (ok || Date.now() - t0 > 8000) done(() => {}); else setTimeout(go, 200); };
  f.addEventListener('load', go);
});

const PLAYERS = { relief: playRelief, arcs: playArcs, fist: playApp('fist'), bars: playApp('bars') };
export const HITS = [['fist', 'Fist opens', 'Today'], ['bars', 'Bars fly in', 'Today'], ['relief', '3D hand', 'New'], ['arcs', 'Five arcs', 'New, flat']];
export async function play(name, stage) {
  stage.replaceChildren(); stage.dataset.hit = name;
  const stop = await PLAYERS[name](stage);
  return () => { try { stop(); } finally { stage.replaceChildren(); } };
}
export const COLOURS = { CLAY, BLUE, INK };

// Exodia hit animations for the Playground (lab only; the app does not load this file).
//   const stop = await play('fist3d' | 'relief' | 'arcs' | 'fist' | 'bars', stageEl)   // stop() ends it and empties the stage
// fist3d: a 3D fist that opens one finger per piece, each named beside its finger, then the eye opens and it turns blue.
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
const N = 224;
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
  // A flat face with a tight bevel at the edge, the lines standing slightly proud: an enamel pin, not a cushion.
  const body = blur(alpha, 3), rim = blur(line, 1), h = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) { const e = clamp01((body[i] - 0.5) * 2.2); h[i] = (1 - Math.pow(1 - e, 2.4)) * 0.72 + rim[i] * 0.28; }
  return h; };
// One surface shader for every hand: satin light, colour taken clean to the edge (the picture's colour is divided
// by its own alpha, so no dark fringe), edges smoothed by the screen's multisampling instead of blending.
const HAND_VERT = 'uniform vec3 uOff; uniform float uSide; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec3 p = position; p.z *= uSide; p += uOff; vec3 n = normal; n.z *= uSide; vN = normalize(normalMatrix * n); vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
const HAND_FRAG = `uniform sampler2D tClay; uniform sampler2D tBlue; uniform float uWash; uniform float uEye; uniform float uPalm; uniform float uFill; uniform vec3 uLight; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vec4 a = texture2D(tClay, vUv), b = texture2D(tBlue, vUv);
    float al = smoothstep(0.25 - 0.2 * uFill, 0.75 - 0.4 * uFill, a.a); // a piece's fill reaches a hair further, so two pieces meet without a gap
    vec3 ca = a.rgb / max(a.a, 0.001), cb = b.rgb / max(b.a, 0.001);
    float lid = uPalm * (1.0 - uEye) * (1.0 - smoothstep(0.9, 1.0, length((vUv - vec2(0.502, 0.298)) / vec2(0.232, 0.182)))); // the eye stays shut until the end
    ca = mix(ca, vec3(0.788, 0.392, 0.259), lid); al = max(al, lid); if (al < 0.01) discard;
    float w = smoothstep(uWash + 0.03, uWash - 0.03, vUv.y) * step(0.5, b.a);   // the blue rises from the wrist to the fingertips
    float band = exp(-pow((vUv.y - uWash) / 0.04, 2.0));                         // a line of light on its front edge
    vec3 base = mix(ca, cb, w);
    vec3 n = normalize(vN); float d = max(dot(n, uLight), 0.0);
    vec3 hv = normalize(uLight + vV); float s = pow(max(dot(n, hv), 0.0), 90.0);
    float rim = pow(1.0 - max(dot(n, vV), 0.0), 4.0);
    vec3 c = base * (0.86 + 0.2 * d) + vec3(1.0, 0.98, 0.95) * (s * 0.3 + rim * 0.06) + vec3(1.0) * band * 0.4;
    gl_FragColor = vec4(c, al); }`;
const handGeo = (THREE, h, depth) => { const geo = new THREE.PlaneGeometry(1, 1, N - 1, N - 1), pos = geo.attributes.position;
  for (let i = 0; i < N * N; i++) pos.setZ(i, h[i] * depth); // plane rows run top to bottom, like the picture
  geo.computeVertexNormals(); return geo; };
const handTex = (THREE, p) => { const t = new THREE.Texture(p); t.anisotropy = 8; t.needsUpdate = true; return t; }; // colours used as they are in the logo
const handStage = (THREE, stage) => { const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 20), canvas = document.createElement('canvas'); canvas.className = 'hitCanvas';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(3, window.devicePixelRatio || 1)); renderer.setClearColor(0x000000, 0);
  const shade = document.createElement('i'); shade.className = 'hitShade'; stage.append(shade, canvas);
  const size = () => { const w = stage.clientWidth, hh = stage.clientHeight; renderer.setSize(w, hh, false); cam.aspect = w / hh; cam.position.set(0, 0, 3.4 * Math.max(1, 0.62 / cam.aspect)); cam.updateProjectionMatrix(); };
  size(); window.addEventListener('resize', size);
  return { cam, canvas, renderer, shade, off: () => window.removeEventListener('resize', size) }; };

const playRelief = async (stage) => {
  const [THREE, clay, blue] = await Promise.all([import(THREE_URL), img('/hamsa-512.png'), img('/hamsa-512-blue.png')]);
  const geo = handGeo(THREE, heights(clay), 0.05);
  const U = { tClay: { value: handTex(THREE, clay) }, tBlue: { value: handTex(THREE, blue) }, uWash: { value: -0.2 }, uEye: { value: 1 }, uPalm: { value: 0 }, uFill: { value: 0 }, uOff: { value: new THREE.Vector3() }, uLight: { value: new THREE.Vector3(-0.5, 0.7, 0.8).normalize() } };
  const mat = (side) => new THREE.ShaderMaterial({ uniforms: { ...U, uSide: { value: side } }, vertexShader: HAND_VERT, fragmentShader: HAND_FRAG, alphaToCoverage: true });
  const hand = new THREE.Group(); hand.add(new THREE.Mesh(geo, mat(1)));
  const back = new THREE.Mesh(geo, mat(-1)); back.material.side = THREE.BackSide; hand.add(back);
  const scene = new THREE.Scene(); scene.add(hand);
  const { cam, canvas, renderer, shade, off } = handStage(THREE, stage);
  halo(stage, 2350); caption(stage, 2700);
  shade.animate([{ opacity: 0, transform: 'translate(-50%, 0) scale(0.6)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }], { duration: 1300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' });
  let raf = 0, t0 = 0, dead = false;
  const frame = (now) => { if (dead) return; t0 = t0 || now; const t = window.__hitT != null ? window.__hitT : reduced() ? 9 : (now - t0) / 1000; // __hitT: a fixed moment, for checking frames
    const rise = outCubic(span(t, 0, 1.25)), wash = inOut(span(t, 1.55, 2.6)), settle = inOut(span(t, 1.2, 3.2));
    canvas.style.opacity = span(t, 0, 0.45);
    hand.rotation.x = -1.15 * (1 - rise);                                    // lies back, then stands up
    hand.rotation.y = -0.95 * (1 - rise) + 0.3 * rise * (1 - settle) + Math.sin(Math.max(0, t - 3.2) * 0.9) * 0.07;
    const beat = Math.sin(span(t, 2.3, 3.0) * Math.PI) * 0.05;               // one soft swell as it turns blue
    hand.scale.setScalar((0.62 + 0.38 * rise) * (1 + beat)); hand.position.y = 0.06 - 0.12 * (1 - rise) + Math.sin(Math.max(0, t - 3.2) * 1.1) * 0.008;
    U.uWash.value = -0.2 + 1.35 * wash;                                      // uv.y runs up the picture, so the wash goes wrist to fingertips
    U.uLight.value.set(-0.6 + 1.0 * settle, 0.7, 0.8).normalize();
    renderer.render(scene, cam); raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);
  return () => { dead = true; cancelAnimationFrame(raf); off(); geo.dispose(); U.tClay.value.dispose(); U.tBlue.value.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
};

// ---------- fist3d: the fist opens, one finger per piece ----------

// One relief of the whole logo, drawn six times with a different part showing each time: the palm, three fingers
// and two thumbs. Nothing is cut loose. A finger bends at its knuckle and at a joint halfway up, like a real one:
// in the fist it points out at you and curls back down over the palm, and it opens by uncurling. A thumb is tucked
// flat behind the palm (in front it would run into the curled fingers) and swings out sideways. Because every part is the same surface, the open hand is the logo
// with no seam anywhere. Measures are in the logo's own picture (512 px): fingers meet the palm at y 228, thumbs at
// x 130.5 and 381.5, a finger's middle joint is at y 135.
const PX = (x) => x / 512, KNUCKLE = 0.5 - PX(228), JOINT = 0.5 - PX(135), THUMB = 0.5 - PX(130.5);
// [word, kind (1 finger, 2 thumb), the part of the picture it owns as u0, u1, v0, v1, where its word sits]
const FIST3D = [
  ['Push', 2, [0, PX(130.5), 0, 1], [-0.345, 0.15]],
  ['Pull', 1, [PX(130.5), PX(216.5), 1 - PX(228), 1], [-0.152, 0.475]],
  ['Legs', 1, [PX(216.5), PX(294.5), 1 - PX(228), 1], [-0.002, 0.537]],
  ['Arms', 1, [PX(294.5), PX(381.5), 1 - PX(228), 1], [0.15, 0.475]],
  ['Move', 2, [PX(381.5), 1, 0, 1], [0.345, 0.15]],
];
const F3_OPEN = [600, 1400, 2050, 2550, 3100], F3_TAKES = [820, 760, 620, 600, 860], F3 = { wash: 4250, word: 5100 };
const FIST_VERT = `uniform float uKind; uniform vec4 uH; uniform vec2 uA; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void bendX(inout vec3 p, inout vec3 n, float y0, float z0, float a){ float c = cos(a), s = sin(a), dy = p.y - y0, dz = p.z - z0; p = vec3(p.x, y0 + c * dy - s * dz, z0 + s * dy + c * dz); n = vec3(n.x, c * n.y - s * n.z, s * n.y + c * n.z); }
  void bendY(inout vec3 p, inout vec3 n, float x0, float z0, float a){ float c = cos(a), s = sin(a), dx = p.x - x0, dz = p.z - z0; p = vec3(x0 + c * dx + s * dz, p.y, z0 - s * dx + c * dz); n = vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z); }
  void main(){ vUv = uv; vec3 p = position, n = normal;
    // Each joint bends over a short stretch, in six small steps from the far end inwards, so a knuckle is round, not a fold.
    if (uKind > 0.5 && uKind < 1.5) {
      for (int i = 5; i >= 0; i--) { float y = uH.z + float(i) * 0.011; if (position.y > y) bendX(p, n, y, uH.w, uA.y / 6.0); }
      for (int i = 5; i >= 0; i--) { float y = uH.x + float(i) * 0.011; if (position.y > y) bendX(p, n, y, uH.y, uA.x / 6.0); } }
    else if (uKind > 1.5) { for (int i = 5; i >= 0; i--) { float x = uH.x + sign(uH.x) * float(i) * 0.011; if (position.x * sign(uH.x) > abs(x)) bendY(p, n, x, uH.y, uA.x / 6.0); } }
    vN = normalize(normalMatrix * n); vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FIST_FRAG = `uniform sampler2D tClay; uniform sampler2D tBlue; uniform float uWash; uniform float uKind; uniform vec4 uClip; uniform vec4 uRects[5]; uniform vec3 uLight; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  bool within(vec4 r){ return vUv.x >= r.x && vUv.x < r.y && vUv.y >= r.z && vUv.y < r.w; }
  void main(){
    if (uKind > 0.5) { if (!within(uClip)) discard; } else { for (int i = 0; i < 5; i++) if (within(uRects[i])) discard; } // each point of the hand belongs to exactly one part
    vec4 a = texture2D(tClay, vUv), b = texture2D(tBlue, vUv); float al = smoothstep(0.25, 0.75, a.a); if (al < 0.01) discard;
    vec3 ca = a.rgb / max(a.a, 0.001), cb = b.rgb / max(b.a, 0.001);
    float w = smoothstep(uWash + 0.03, uWash - 0.03, vUv.y) * step(0.5, b.a);
    float band = exp(-pow((vUv.y - uWash) / 0.04, 2.0));
    vec3 base = mix(ca, cb, w);
    vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;                         // the back of a curled finger is lit too
    float d = max(dot(n, uLight), 0.0); vec3 hv = normalize(uLight + vV); float s = pow(max(dot(n, hv), 0.0), 90.0);
    float rim = pow(1.0 - max(dot(n, vV), 0.0), 4.0);
    vec3 c = base * (0.86 + 0.2 * d) * (gl_FrontFacing ? 1.0 : 0.93) + vec3(1.0, 0.98, 0.95) * (s * 0.3 + rim * 0.06) + vec3(1.0) * band * 0.4;
    gl_FragColor = vec4(c, al); }`;
// A finger eases open and settles with the smallest give past straight, like a hand that has just opened.
const openEase = (x) => { const e = 1 - Math.pow(1 - x, 3); return e + Math.sin(x * Math.PI) * 0.035 * x; };

const playFist3d = async (stage) => {
  const [THREE, clay, blue] = await Promise.all([import(THREE_URL), img('/hamsa-512.png'), img('/hamsa-512-blue.png')]);
  const geo = handGeo(THREE, heights(clay), 0.05), tClay = handTex(THREE, clay), tBlue = handTex(THREE, blue), light = new THREE.Vector3(-0.5, 0.7, 0.8).normalize();
  const rects = FIST3D.map((f) => new THREE.Vector4(f[2][0], f[2][1], f[2][2], f[2][3])), wash = { value: -0.2 };
  const part = (kind, clip, hinge) => { const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: FIST_VERT, fragmentShader: FIST_FRAG, alphaToCoverage: true, side: THREE.DoubleSide,
    uniforms: { tClay: { value: tClay }, tBlue: { value: tBlue }, uWash: wash, uKind: { value: kind }, uClip: { value: clip || new THREE.Vector4() }, uRects: { value: rects }, uH: { value: hinge || new THREE.Vector4() }, uA: { value: new THREE.Vector2() }, uLight: { value: light } } }));
    m.frustumCulled = false; return m; };
  const hand = new THREE.Group(); hand.add(part(0));
  const parts = FIST3D.map(([, kind], k) => { const m = part(kind, rects[k], kind === 1 ? new THREE.Vector4(KNUCKLE + 0.008, 0.03, JOINT, 0.03) : new THREE.Vector4((k === 0 ? -1 : 1) * (THUMB + 0.012), -0.012, 0, 0)); hand.add(m); return m; }); // each bend starts just inside its part, so the edge stays joined to the palm
  const scene = new THREE.Scene(); scene.add(hand);
  const { cam, canvas, renderer, shade, off } = handStage(THREE, stage);
  // The words, one by each finger, in the page over the canvas so they stay sharp.
  const words = FIST3D.map(([word, , , at]) => { const el = document.createElement('span'); el.className = 'hitTag'; el.textContent = word; stage.append(el); return { el, at: new THREE.Vector3(at[0], at[1], 0.05) }; });
  halo(stage, F3.wash + 750); caption(stage, F3.word);
  shade.animate([{ opacity: 0, transform: 'translate(-50%, 0) scale(0.6)' }, { opacity: 1, transform: 'translate(-50%, 0) scale(1)' }], { duration: 900, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' });
  let raf = 0, t0 = 0, dead = false; const v = new THREE.Vector3();
  const frame = (now) => { if (dead) return; t0 = t0 || now; const ms = window.__hitT != null ? window.__hitT * 1000 : reduced() ? 9000 : now - t0, t = ms / 1000;
    const come = outCubic(span(t, 0, 0.9)), settle = inOut(span(t, 0.4, 4.1)), w = inOut(span(ms, F3.wash, F3.wash + 1000));
    canvas.style.opacity = span(t, 0, 0.4);
    // The fist is seen a little from above and the side, so its depth reads; it turns to face you as it opens.
    hand.rotation.set(0.42 * (1 - settle), -0.5 * (1 - settle) + Math.sin(Math.max(0, t - 5.2) * 0.9) * 0.06, 0);
    const beat = Math.sin(span(ms, F3.wash + 650, F3.wash + 1350) * Math.PI) * 0.045;
    hand.scale.setScalar((0.86 + 0.14 * come) * (1 + beat)); hand.position.y = 0.05 - 0.07 * (1 - settle);
    light.set(-0.6 + 1.0 * settle, 0.7, 0.8).normalize(); wash.value = -0.2 + 1.35 * w;
    parts.forEach((m, k) => { const shut = 1 - openEase(span(ms, F3_OPEN[k], F3_OPEN[k] + F3_TAKES[k])), A = m.material.uniforms.uA.value;
      if (FIST3D[k][1] === 1) A.set(1.72 * shut, 1.4 * Math.min(1, shut * 1.25)); // the knuckle opens all the way; the end joint straightens a little sooner
      else A.set((k === 0 ? -1 : 1) * 3.09 * shut, 0); }); // a thumb is tucked flat behind the palm and swings out sideways
    hand.updateMatrixWorld(true);
    words.forEach((word, k) => { v.copy(word.at).applyMatrix4(hand.matrixWorld).project(cam);
      const on = span(ms, F3_OPEN[k] + F3_TAKES[k] * 0.55, F3_OPEN[k] + F3_TAKES[k] + 120) * (1 - span(ms, F3.wash - 250, F3.wash + 250));
      word.el.style.opacity = on; word.el.style.transform = `translate(${((v.x + 1) / 2 * stage.clientWidth).toFixed(1)}px, ${((1 - v.y) / 2 * stage.clientHeight + (1 - on) * 6).toFixed(1)}px) translate(-50%, -100%)`; });
    renderer.render(scene, cam); raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);
  return () => { dead = true; cancelAnimationFrame(raf); off(); geo.dispose(); tClay.dispose(); tBlue.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
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

const PLAYERS = { fist3d: playFist3d, relief: playRelief, arcs: playArcs, fist: playApp('fist'), bars: playApp('bars') };
export const HITS = [['fist3d', '3D fist opens', 'New, counts the fingers'], ['relief', '3D hand', 'New'], ['arcs', 'Five arcs', 'New, flat'], ['fist', 'Fist opens', 'Today'], ['bars', 'Bars fly in', 'Today']];
export async function play(name, stage) {
  stage.replaceChildren(); stage.dataset.hit = name;
  const stop = await PLAYERS[name](stage);
  return () => { try { stop(); } finally { stage.replaceChildren(); } };
}
export const COLOURS = { CLAY, BLUE, INK };

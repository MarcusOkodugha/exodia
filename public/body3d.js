// Exodia 3D body. One WebGL canvas that draws one or several people from the same anatomy model: muscles in the
// colours the app passes in, each muscle as bulky as its strength level, drag to spin, tap a muscle, open one
// person full screen. Nothing here runs until createBodyView() is called; three.js and the model load then.
//
//   const view = await createBodyView({ onPick, onExpand, onCollapse, onLost, names })   // rejects without WebGL
//   view.attach(hostEl)        the host needs a size of its own; call again with the new element after every render
//   view.setPeople([{ id, name, heightCm, sex, muscles: { chest: { color: '#C96442', level: 3.6 }, ... } }])
//   view.setSelected('chest' | null)
//   view.expand(index) / view.collapse()
//   view.destroy()
//
// Who does what:
// - A tap on a muscle calls onPick(key, personIndex). The view never changes the selection itself: the app calls
//   setSelected(). In the open view, a tap beside the body while a muscle is selected calls onPick(null, index).
// - A tap on a figure but not on a muscle (head, hands), or a double tap, opens that person: the view expands
//   itself and then calls onExpand(index). A tap on the background, the cross or Esc closes it and calls
//   onCollapse(). expand() and collapse() called by the app do not call back.
//
// Model: Z-Anatomy (Gauthier Kervyn), BodyParts3D (DBCLS), CC BY-SA 4.0. See lab/README.md.

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
const MODEL_URL = '/models/anatomy.glb';

const NAMES = { chest: 'Chest', shoulders: 'Shoulders', rearDelts: 'Rear delts', traps: 'Traps', upperBack: 'Upper back', lowerBack: 'Lower back', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', abs: 'Abs', glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Adductors', calves: 'Calves' };
const GROUPS = Object.keys(NAMES);
// Muscle group from the model's own part name (anterior_delt, vastus_group, ...). The hip flexors show at the
// groin between the quads and take their colour; the neck extensors lie under the traps. Neck flexors, hands and
// feet are not trained as a group and stay plain.
const GROUP = (n) => /hamstring/.test(n) ? 'hamstrings' : /pec/.test(n) ? 'chest' : /posterior_delt/.test(n) ? 'rearDelts' : /delt/.test(n) ? 'shoulders' : /trap|neck_ext/.test(n) ? 'traps' : /triceps/.test(n) ? 'triceps' : /biceps|brachialis/.test(n) ? 'biceps' : /forearm|brachiorad/.test(n) ? 'forearms' : /hip_rotator/.test(n) ? 'glutes' : /lats|rhomboid|teres|rotator|serratus/.test(n) ? 'upperBack' : /erector/.test(n) ? 'lowerBack' : /abdom|oblique/.test(n) ? 'abs' : /glute/.test(n) ? 'glutes' : /rectus_femoris|vastus|hip_flex/.test(n) ? 'quads' : /adductor/.test(n) ? 'adductors' : /gastro|soleus|fibularis|tibialis/.test(n) ? 'calves' : null;
const PLAIN = '#E9E5DC', SKIN = '#F1EEE7', CLAY = '#C96442';
const DEFAULT_CM = 178;

// Size by strength (look R, "Recommended" in the lab). Every muscle starts from G's build (BASE, pushed out along
// its normals). Strength adds size only where it shows: shoulders, arms, chest, quads and back grow by up to GROW
// times BASE; calves, abs, adductors and hamstrings stay as they are. STEP is how much of that growth each level
// gets: Beginner is a little slimmer than G, Novice about G, Elite the most. Between levels it's a straight line
// (3.6 sits between Intermediate and Advanced). No level: G as it is. A woman's figure starts 20% leaner and grows
// 60% as much.
const BASE = 0.0035;
// The woman's figure: Marcus picked no separate chest form (only the body's shape). true brings the soft form back.
const WOMAN_CHEST = false;
const GROW = { shoulders: 2.6, rearDelts: 2.4, biceps: 2.4, triceps: 2.4, chest: 2, quads: 2.2, forearms: 1.5, traps: 1.6, upperBack: 1.5, lowerBack: 1.2, glutes: 1.2 };
const STEP = [[1, -0.3], [2, 0.25], [3, 0.65], [4, 1], [5, 1.35], [6, 1.5]];
const stepOf = (lv) => {
  if (lv == null || !isFinite(lv)) return 0;
  const l = Math.max(1, Math.min(6, lv));
  for (let i = 1; i < STEP.length; i++) if (l <= STEP[i][0]) { const [a, x] = STEP[i - 1], [b, y] = STEP[i]; return x + (y - x) * (l - a) / (b - a); }
  return STEP[STEP.length - 1][1];
};
const bulkOf = (g, lv, fem) => (fem ? 0.8 : 1) * BASE * (1 + ((GROW[g] || 1) - 1) * stepOf(lv) * (fem ? 0.6 : 1));
// Looks. R: G's real light and deep creases, colour to every muscle's edge (no pale tendon ends). F: the earlier
// look with fibre lines you can see. D: no fibre lines.
const LOOKS = {
  R: { groove: 0.05, bump: 0.55, crease: 0.8, sheen: 0.13, warm: 0.75, tendon: 0 },
  F: { groove: 0.2, bump: 1, crease: 0.6, sheen: 0.05, warm: 0.35, tendon: 0.45 },
  D: { groove: 0, bump: 0, crease: 0, sheen: 0, warm: 0, tendon: 0 },
};

// ---------- loading (once per page, shared by every view) ----------

// The model is a plain .glb (positions, normals, baked shade as vertex colour, no extensions), so it is read here
// directly. three's GLTFLoader imports the bare name 'three', which only resolves with an import map in the page.
const parseGlb = (THREE, buf) => {
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('body3d: not a glb');
  const jl = dv.getUint32(12, true), json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl))), bin = 20 + jl + 8;
  const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }, BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }, NORM = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };
  const read = (ai) => {
    const a = json.accessors[ai], bv = json.bufferViews[a.bufferView], n = SIZE[a.type], ct = a.componentType, by = BYTES[ct];
    const stride = bv.byteStride || n * by, off = bin + (bv.byteOffset || 0) + (a.byteOffset || 0), k = a.normalized ? NORM[ct] : 1;
    const out = new Float32Array(a.count * n);
    for (let i = 0; i < a.count; i++) for (let c = 0; c < n; c++) { const o = off + i * stride + c * by;
      out[i * n + c] = (ct === 5126 ? dv.getFloat32(o, true) : ct === 5123 ? dv.getUint16(o, true) : ct === 5125 ? dv.getUint32(o, true) : ct === 5121 ? dv.getUint8(o) : ct === 5122 ? dv.getInt16(o, true) : dv.getInt8(o)) / k; }
    return { a: out, n, count: a.count };
  };
  const parts = [], v = new THREE.Vector3(), nm = new THREE.Matrix3();
  const walk = (ni, parent, top) => {
    const nd = json.nodes[ni], local = new THREE.Matrix4();
    if (nd.matrix) local.fromArray(nd.matrix);
    else local.compose(new THREE.Vector3(...(nd.translation || [0, 0, 0])), new THREE.Quaternion(...(nd.rotation || [0, 0, 0, 1])), new THREE.Vector3(...(nd.scale || [1, 1, 1])));
    const world = parent.clone().multiply(local), name = top || nd.name || '';
    if (nd.mesh !== undefined) for (const pr of json.meshes[nd.mesh].primitives) {
      if (pr.attributes.POSITION === undefined || pr.attributes.NORMAL === undefined) continue;
      const p = read(pr.attributes.POSITION), n = read(pr.attributes.NORMAL), c = pr.attributes.COLOR_0 !== undefined ? read(pr.attributes.COLOR_0) : null;
      nm.getNormalMatrix(world);
      for (let i = 0; i < p.count; i++) {
        v.fromArray(p.a, i * 3).applyMatrix4(world).toArray(p.a, i * 3);
        v.fromArray(n.a, i * 3).applyMatrix3(nm).normalize().toArray(n.a, i * 3);
      }
      let idx; if (pr.indices !== undefined) idx = read(pr.indices).a; else { idx = new Float32Array(p.count); for (let i = 0; i < p.count; i++) idx[i] = i; }
      let ao = null; if (c) { ao = new Float32Array(p.count); for (let i = 0; i < p.count; i++) ao[i] = c.a[i * c.n]; }
      parts.push({ name, pos: p.a, nor: n.a, ao, idx, count: p.count });
    }
    for (const ch of nd.children || []) walk(ch, world, name);
  };
  for (const r of json.scenes[json.scene || 0].nodes) walk(r, new THREE.Matrix4(), null);
  return parts;
};

// One geometry for all muscles and one for everything else (head, bones, hands, feet): two draw calls a figure.
// Each vertex carries its group, baked shade, where its muscle's fibres run to and how near it is to the muscle's
// ends, so one shader can colour, bulk, draw the fibres and pale the tendon ends.
const merge = (THREE, parts, R = 0) => {
  let nv = 0, ni = 0; for (const o of parts) { nv += o.count; ni += o.idx.length; }
  let pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), axis = new Float32Array(nv * 3), col = new Float32Array(nv * 3), apex = new Float32Array(nv * 4);
  let ao = new Float32Array(nv), end = new Float32Array(nv), grp = new Float32Array(nv), pid = new Float32Array(nv), kind = new Uint8Array(nv), idx = new Uint32Array(ni);
  const plain = new THREE.Color(PLAIN), skinC = new THREE.Color(SKIN);
  let vo = 0, io = 0, headI = null, np = 0;
  for (const o of parts) {
    const cnt = o.count, ctx = /context/.test(o.name), skin = /skin/.test(o.name), head = /body_context/.test(o.name);
    const gi = ctx ? 0 : GROUPS.indexOf(GROUP(o.name)) + 1;
    pos.set(o.pos, vo * 3); nor.set(o.nor, vo * 3); pid.fill(np++, vo, vo + cnt);
    if (/lower_lats/.test(o.name)) kind.fill(1, vo, vo + cnt); if (/erector/.test(o.name)) kind.fill(2, vo, vo + cnt); if (/hip_flex/.test(o.name)) kind.fill(3, vo, vo + cnt);
    // The deep belly muscle sits a millimetre or two under the obliques; tucked a little further in, the two never
    // fight for the same pixel (a flicker beside the abs while the body turns).
    if (/transverse_abdominis/.test(o.name)) for (let i = vo * 3; i < (vo + cnt) * 3; i++) pos[i] -= nor[i] * 0.004;
    const cc = skin ? skinC : plain;
    for (let i = 0; i < cnt; i++) { ao[vo + i] = o.ao && !skin && !head ? o.ao[i] : 1; grp[vo + i] = gi; col.set([cc.r, cc.g, cc.b], (vo + i) * 3); }
    // Fibre direction. Real fibres fan: a pec runs from the sternum and collarbone to one spot on the upper arm,
    // glutes, lats and delts converge the same way. So each muscle (left and right apart, both live in one mesh)
    // gets a point its fibres run towards: find the long axis, compare how wide the muscle is at its two ends, and
    // put the point beyond the narrow end where the two widths would meet. Equal ends put it far away, which
    // gives straight parallel fibres.
    if (!ctx) for (const s of [1, -1]) {
      const ids = []; for (let i = 0; i < cnt; i++) if (pos[(vo + i) * 3] * s >= 0) ids.push(vo + i);
      if (ids.length < 4) { for (const i of ids) { axis.set([0, 1, 0], i * 3); apex.set([0, -100, 0, 100], i * 4); } continue; }
      const P = (i, t = new THREE.Vector3()) => t.fromArray(pos, i * 3);
      const m = new THREE.Vector3(); for (const i of ids) m.add(P(i)); m.divideScalar(ids.length);
      const k = [0, 0, 0, 0, 0, 0];
      for (const i of ids) { const x = pos[i * 3] - m.x, y = pos[i * 3 + 1] - m.y, z = pos[i * 3 + 2] - m.z; k[0] += x * x; k[1] += x * y; k[2] += x * z; k[3] += y * y; k[4] += y * z; k[5] += z * z; }
      const a = new THREE.Vector3(0.1, 1, 0.1);
      for (let q = 0; q < 24; q++) a.set(k[0] * a.x + k[1] * a.y + k[2] * a.z, k[1] * a.x + k[3] * a.y + k[4] * a.z, k[2] * a.x + k[4] * a.y + k[5] * a.z).normalize();
      let lo = Infinity, hi = -Infinity; const t0 = new THREE.Vector3(); const pr = (i) => P(i, t0).sub(m).dot(a);
      for (const i of ids) { const d = pr(i); lo = Math.min(lo, d); hi = Math.max(hi, d); }
      const slice = (f) => { const part = ids.filter((i) => f(pr(i))); const c = new THREE.Vector3(); for (const i of part) c.add(P(i)); c.divideScalar(Math.max(1, part.length));
        let w = 0; for (const i of part) { P(i, t0).sub(c); const d = t0.dot(a); w += t0.lengthSq() - d * d; } return { c, w: Math.sqrt(w / Math.max(1, part.length)) }; };
      const sl = slice((d) => d < lo + (hi - lo) * 0.3), sh = slice((d) => d > hi - (hi - lo) * 0.3);
      const [nar, wide] = sl.w <= sh.w ? [sl, sh] : [sh, sl];
      const A2 = wide.c.clone().sub(nar.c); const L = Math.max(1e-5, A2.length()); A2.divideScalar(L);
      let tmin = Infinity; for (const i of ids) tmin = Math.min(tmin, P(i, t0).sub(nar.c).dot(A2));
      const meet = wide.w - nar.w > 1e-6 ? L * nar.w / (wide.w - nar.w) : 1e9;
      const ad = Math.min(Math.max(meet * 0.8, -tmin + 0.15 * L), 40 * L);
      const ap = nar.c.clone().addScaledVector(A2, -ad);
      let rmin = Infinity, rmax = -Infinity; for (const i of ids) { const r = P(i, t0).sub(ap).dot(A2); rmin = Math.min(rmin, r); rmax = Math.max(rmax, r); }
      for (const i of ids) { axis.set([A2.x, A2.y, A2.z], i * 3); apex.set([ap.x, ap.y, ap.z, rmax], i * 4); end[i] = Math.abs(P(i, t0).sub(ap).dot(A2) - (rmin + rmax) / 2) / Math.max(1e-6, (rmax - rmin) / 2); }
    } else for (let i = 0; i < cnt; i++) { axis.set([0, 1, 0], (vo + i) * 3); apex.set([0, -100, 0, 100], (vo + i) * 4); }
    for (let i = 0; i < o.idx.length; i++) idx[io + i] = o.idx[i] + vo;
    if (head) headI = [io, io + o.idx.length, vo, vo + cnt];
    vo += cnt; io += o.idx.length;
  }
  // Some parts (the head above all) have triangles wound the wrong way, which is why the head showed as a hollow
  // mask. Turn every triangle to face the way its normals point.
  const A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3(), fn = new THREE.Vector3();
  for (let i = 0; i < ni; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    A.fromArray(pos, a * 3); B.fromArray(pos, b * 3); Cc.fromArray(pos, c * 3); fn.crossVectors(B.sub(A), Cc.sub(A));
    const d = fn.x * (nor[a * 3] + nor[b * 3] + nor[c * 3]) + fn.y * (nor[a * 3 + 1] + nor[b * 3 + 1] + nor[c * 3 + 1]) + fn.z * (nor[a * 3 + 2] + nor[b * 3 + 2] + nor[c * 3 + 2]);
    if (d < 0) { idx[i + 1] = c; idx[i + 2] = b; } }
  // The head is worse: whole patches of it face inwards, normals and all. Rebuild it: walk from triangle to
  // triangle over shared edges so they all face the same way, turn the lot outwards, then smooth new normals.
  if (headI) { const [i0, i1, v0, v1] = headI; const nt = (i1 - i0) / 3;
    const weld = new Int32Array(v1 - v0), seen = new Map();
    for (let i = v0; i < v1; i++) { const key = Math.round(pos[i * 3] * 2e4) + ',' + Math.round(pos[i * 3 + 1] * 2e4) + ',' + Math.round(pos[i * 3 + 2] * 2e4); let w = seen.get(key); if (w === undefined) { w = seen.size; seen.set(key, w); } weld[i - v0] = w; }
    const wv = (t, k) => weld[idx[i0 + t * 3 + k] - v0];
    const edges = new Map();
    for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) { const a = wv(t, k), b = wv(t, (k + 1) % 3); if (a === b) continue; const key = a < b ? a * 65536 + b : b * 65536 + a; let e = edges.get(key); if (!e) edges.set(key, e = []); e.push(t); }
    const dirOf = (t, a, b) => { for (let k = 0; k < 3; k++) if (wv(t, k) === a && wv(t, (k + 1) % 3) === b) return 1; return -1; };
    const done = new Uint8Array(nt), part = new Int32Array(nt); let np = 0;
    for (let s = 0; s < nt; s++) { if (done[s]) continue; done[s] = 1; part[s] = np; const q = [s];
      while (q.length) { const t = q.pop();
        for (let k = 0; k < 3; k++) { const a = wv(t, k), b = wv(t, (k + 1) % 3); if (a === b) continue; const e = edges.get(a < b ? a * 65536 + b : b * 65536 + a);
          for (const u of e) { if (done[u]) continue; done[u] = 1; part[u] = np; if (dirOf(u, a, b) === 1) { const j = i0 + u * 3, x = idx[j + 1]; idx[j + 1] = idx[j + 2]; idx[j + 2] = x; } q.push(u); } } }
      np++; }
    const hc = new THREE.Vector3(); for (let i = v0; i < v1; i++) hc.add(A.fromArray(pos, i * 3)); hc.divideScalar(v1 - v0);
    const vol = new Float64Array(np);
    for (let t = 0; t < nt; t++) { const j = i0 + t * 3; A.fromArray(pos, idx[j] * 3).sub(hc); B.fromArray(pos, idx[j + 1] * 3).sub(hc); Cc.fromArray(pos, idx[j + 2] * 3).sub(hc); vol[part[t]] += A.dot(fn.crossVectors(B, Cc)); }
    const wn = new Float32Array(seen.size * 3);
    for (let t = 0; t < nt; t++) { const j = i0 + t * 3; if (vol[part[t]] < 0) { const x = idx[j + 1]; idx[j + 1] = idx[j + 2]; idx[j + 2] = x; }
      A.fromArray(pos, idx[j] * 3); B.fromArray(pos, idx[j + 1] * 3); Cc.fromArray(pos, idx[j + 2] * 3); fn.crossVectors(B.sub(A), Cc.sub(A));
      for (let k = 0; k < 3; k++) { const w = weld[idx[j + k] - v0] * 3; wn[w] += fn.x; wn[w + 1] += fn.y; wn[w + 2] += fn.z; } }
    for (let i = v0; i < v1; i++) { const w = weld[i - v0] * 3; fn.set(wn[w], wn[w + 1], wn[w + 2]).normalize(); nor.set([fn.x, fn.y, fn.z], i * 3); } }
  // The low back. In the model the erectors lie under the lower lats, so from behind the lumbar area showed lat
  // colour. What covers them there is the lats' flat tendon sheet, so the whole lower lats count as lower back, up
  // to their natural seam with the upper lats just under the ribs, and out to their own edge; the erectors above
  // that line (they run on up to the skull) are not the low back and stay plain. The hip flexors are cut the same
  // way at the hip bone: the part on the thigh shows with the quads, the part inside the belly (psoas) does not.
  // Every triangle a line crosses is cut along it, so colour ends on a clean edge, not a fade across a triangle.
  const gLow = GROUPS.indexOf('lowerBack') + 1, gUp = GROUPS.indexOf('upperBack') + 1, gQ = GROUPS.indexOf('quads') + 1;
  if (R > 0) for (const K of [1, 3]) {
    const f = (i) => pos[i * 3 + 1] - (K === 3 ? 0.1 : 0.32), ok = (k) => (K === 3 ? k === 3 : k === 1 || k === 2);
    const gOf = (i, inn) => (K === 3 ? (inn ? gQ : 0) : inn ? gLow : kind[i] === 1 ? gUp : 0);
    // Typed arrays with room for the new corners (a cut adds at most four per triangle it crosses, and few cross).
    const cap = nv + 24000, grow = (A, n) => { const B = new A.constructor(cap * n); B.set(A); return B; };
    const P = grow(pos, 3), N = grow(nor, 3), AX = grow(axis, 3), CO = grow(col, 3), AP = grow(apex, 4), O = grow(ao, 1), E = grow(end, 1), G = grow(grp, 1), PI = grow(pid, 1), KI = grow(kind, 1);
    const I = new Uint32Array(idx.length * 3); let ni2 = 0, nv2 = nv;
    for (let i = 0; i < nv; i++) if (ok(kind[i])) G[i] = gOf(i, f(i) < 0);
    const cache = new Map();
    const at = (a, b, inn) => { const key = (a * 2 + (inn ? 1 : 0)) * 4194304 + b; let v = cache.get(key); if (v !== undefined) return v;
      const t = f(a) / (f(a) - f(b)); v = nv2++;
      const mix = (arr, n) => { for (let k = 0; k < n; k++) arr[v * n + k] = arr[a * n + k] + (arr[b * n + k] - arr[a * n + k]) * t; };
      mix(P, 3); mix(N, 3); const l = Math.hypot(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]) || 1; for (let k = 0; k < 3; k++) N[v * 3 + k] /= l;
      mix(AX, 3); mix(CO, 3); mix(AP, 4); mix(O, 1); mix(E, 1); PI[v] = PI[a]; KI[v] = KI[a]; G[v] = gOf(a, inn); cache.set(key, v); return v; };
    const put = (...v) => { for (const x of v) I[ni2++] = x; };
    for (let t = 0; t < idx.length; t += 3) { const v0 = idx[t], v1 = idx[t + 1], v2 = idx[t + 2];
      if (!ok(kind[v0]) || kind[v0] !== kind[v1] || kind[v0] !== kind[v2]) { put(v0, v1, v2); continue; }
      const v = [v0, v1, v2], s3 = [f(v0) < 0, f(v1) < 0, f(v2) < 0]; if (s3[0] === s3[1] && s3[1] === s3[2]) { put(v0, v1, v2); continue; }
      const k = s3[0] === s3[1] ? 2 : s3[0] === s3[2] ? 1 : 0, L = v[k], p = v[(k + 1) % 3], q = v[(k + 2) % 3], li = s3[k]; // the corner alone on its side
      put(L, at(L, p, li), at(L, q, li), at(L, p, !li), p, q, at(L, p, !li), q, at(L, q, !li)); }
    nv = nv2; pos = P.slice(0, nv * 3); nor = N.slice(0, nv * 3); axis = AX.slice(0, nv * 3); col = CO.slice(0, nv * 3); apex = AP.slice(0, nv * 4);
    ao = O.slice(0, nv); end = E.slice(0, nv); grp = G.slice(0, nv); pid = PI.slice(0, nv); kind = KI.slice(0, nv); idx = I.slice(0, ni2); }
  // Bulk per vertex. A muscle's ends stay near the bone, but where an end lies under or against another muscle's
  // belly (the middle traps under the upper traps at the base of the neck) it rises with that neighbour, so the
  // two meet without a step and no dark pit opens between them.
  const lift = new Float32Array(nv); for (let i = 0; i < nv; i++) { const t = Math.min(1, Math.max(0, (end[i] - 0.5) / 0.5)); lift[i] = 1 - 0.85 * t * t * (3 - 2 * t); }
  if (R > 0) { const L = 0.03, cells = new Map(), cf = (i, k) => Math.floor(pos[i * 3 + k] / L), ck = (x, y, z) => (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512);
    // Only bellies can lift an end, and every second point is plenty to find them (the result is smooth anyway).
    for (let i = 0; i < nv; i += 2) { if (!grp[i] || lift[i] < 0.6) continue; const k = ck(cf(i, 0), cf(i, 1), cf(i, 2)); let c = cells.get(k); if (!c) cells.set(k, c = []); c.push(i); }
    const base = lift.slice();
    for (let i = 0; i < nv; i++) { if (!grp[i] || base[i] > 0.99) continue; const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], cx = cf(i, 0), cy = cf(i, 1), cz = cf(i, 2); let m = base[i];
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const cell = cells.get(ck(cx + a, cy + b, cz + c)); if (!cell) continue;
        for (const j of cell) { if (base[j] <= m || pid[j] === pid[i]) continue; const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz; if (d2 >= L * L) continue; const d = Math.sqrt(d2) / L; m = Math.max(m, base[j] * (1 - d * d * (3 - 2 * d)) + base[i] * d * d * (3 - 2 * d)); } }
      lift[i] = m; } }
  // Neighbours. For every muscle vertex: the nearest vertex of another muscle group within R, and how near it is.
  // The shader moves the two towards the same bulk where they meet (see V_BODY). A grid keeps the search short.
  const near = new Float32Array(nv * 2);
  if (R > 0) { const cells = new Map(), ck = (x, y, z) => (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512), cf = (i, k) => Math.floor(pos[i * 3 + k] / R);
    // Every second point: the nearest one is still found to within a few mm.
    for (let i = 0; i < nv; i += 2) { if (!grp[i]) continue; const k = ck(cf(i, 0), cf(i, 1), cf(i, 2)); let c = cells.get(k); if (!c) cells.set(k, c = []); c.push(i); }
    for (let i = 0; i < nv; i++) { const g = grp[i]; if (!g) continue; const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], cx = cf(i, 0), cy = cf(i, 1), cz = cf(i, 2); let best = R * R, bg = 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const cell = cells.get(ck(cx + a, cy + b, cz + c)); if (!cell) continue;
        for (const j of cell) { if (grp[j] === g) continue; const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz; if (d2 < best) { best = d2; bg = grp[j]; } } }
      if (bg) { const d = Math.sqrt(best) / R; near[i * 2] = bg; near[i * 2 + 1] = 0.5 * (1 - d * d * (3 - 2 * d)); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('aNear', new THREE.BufferAttribute(near, 2)); geo.setAttribute('aLift', new THREE.BufferAttribute(lift, 1));
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aAxis', new THREE.BufferAttribute(axis, 3)); geo.setAttribute('aApex', new THREE.BufferAttribute(apex, 4));
  geo.setAttribute('aO', new THREE.BufferAttribute(ao, 1)); geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1)); geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingBox(); geo.computeBoundingSphere(); geo.userData.grp = grp;
  return geo;
};

// A woman's shape from the same model: narrower shoulders, ribcage and waist, wider hips, fuller glutes, arms moved
// in with the shoulders. The pec keeps its own flat fan shape; the breast lies on it as a separate soft form (see
// the view). Normals follow the same bend (inverse transpose of the local stretch), so light sits right.
// Width (x) and depth (z) by height: an hourglass. Neck, shoulders and ribcage narrower, waist much narrower,
// hips and the top of the thighs wider, glutes fuller; arms slimmer and moved in with the shoulders; head a little
// smaller. Heights are the model's (feet -0.9, crown 0.9). Same shape as the lab's woman.
const SX = [[0.86, 0.93], [0.74, 0.84], [0.66, 0.83], [0.56, 0.84], [0.45, 0.86], [0.33, 0.84], [0.22, 0.78], [0.12, 0.92], [0.02, 1.1], [-0.08, 1.13], [-0.2, 1.08], [-0.36, 1.03], [-0.55, 1.0]];
const SZ = [[0.3, 1], [0.2, 0.93], [0.1, 1]];
const ARM = [[0.55, 0.215], [0.3, 0.24], [0.05, 0.28], [-0.15, 0.3]];
const keyAt = (keys, y) => { if (y >= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (y >= keys[i][0]) { const [a, x] = keys[i - 1], [b, w] = keys[i], t = (y - b) / (a - b); return w + (x - w) * t * t * (3 - 2 * t); } return keys[keys.length - 1][1]; };
const female = (x, y, z) => {
  const ax = Math.abs(x), sg = Math.sign(x) || 1, arm = Math.min(1, Math.max(0, (ax - 0.17) / 0.04)), sm = arm * arm * (3 - 2 * arm);
  const tX = x * keyAt(SX, y), tZ = z * keyAt(SZ, y) * (z < 0 ? 1 + 0.14 * Math.exp(-(((y + 0.03) / 0.1) ** 2)) : 1);
  const cx = keyAt(ARM, y), aX = sg * (cx + (ax - cx) * 0.86 - 0.036), aZ = -0.02 + (z + 0.02) * 0.86;
  let X = tX + (aX - tX) * sm, Y = y, Z = tZ + (aZ - tZ) * sm;
  if (y > 0.7) { Y = 0.7 + (y - 0.7) * 0.94; Z *= 0.94; } // a smaller head
  return [X, Y, Z]; };
const femalePart = (THREE, o) => {
  const pos = new Float32Array(o.pos.length), nor = new Float32Array(o.nor.length), m = new THREE.Matrix3(), n = new THREE.Vector3(), e = 0.002;
  for (let q = 0; q < o.pos.length; q += 3) { const x = o.pos[q], y = o.pos[q + 1], z = o.pos[q + 2];
    const d = (k) => { const a = [x, y, z], b = [x, y, z]; a[k] += e; b[k] -= e; const fa = female(...a), fb = female(...b); return [(fa[0] - fb[0]) / (2 * e), (fa[1] - fb[1]) / (2 * e), (fa[2] - fb[2]) / (2 * e)]; };
    const J = [d(0), d(1), d(2)]; m.set(J[0][0], J[1][0], J[2][0], J[0][1], J[1][1], J[2][1], J[0][2], J[1][2], J[2][2]).invert().transpose();
    pos.set(female(x, y, z), q); n.set(o.nor[q], o.nor[q + 1], o.nor[q + 2]).applyMatrix3(m).normalize(); nor.set([n.x, n.y, n.z], q); }
  return { ...o, pos, nor }; };

let assets = null;
const loadAssets = () => assets || (assets = (async () => {
  const [THREE, buf] = await Promise.all([
    import(THREE_URL),
    fetch(MODEL_URL).then((r) => { if (!r.ok) throw new Error('body3d: model ' + r.status); return r.arrayBuffer(); }),
  ]);
  const parts = parseGlb(THREE, buf);
  const ctxGeo = merge(THREE, parts.filter((o) => /context/.test(o.name))), tall = ctxGeo.boundingBox.max.y - ctxGeo.boundingBox.min.y; // the skin runs head to feet
  const muscleGeo = merge(THREE, parts.filter((o) => !/context/.test(o.name)), tall * 0.022);
  const box = muscleGeo.boundingBox.clone().union(ctxGeo.boundingBox);
  // The woman's figure is built the first time someone female is shown, not before.
  let fem = null; const femaleGeo = () => fem || (fem = (() => { const fp = parts.map((o) => femalePart(THREE, o));
    return { muscleGeo: merge(THREE, fp.filter((o) => !/context/.test(o.name)), tall * 0.022), ctxGeo: merge(THREE, fp.filter((o) => /context/.test(o.name))) }; })());
  return { THREE, muscleGeo, ctxGeo, femaleGeo, box, center: box.getCenter(new THREE.Vector3()), height: box.max.y - box.min.y };
})().catch((e) => { assets = null; throw e; }));

// ---------- shaders (look F from the lab, bulk per muscle group) ----------

const NOISE = `
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }`;
const VARY = 'varying vec3 vP; varying vec3 vON; varying vec4 vApex; varying vec3 vA; varying vec3 vE1; varying vec3 vE2; varying vec3 vCol; varying vec3 vShade; varying vec2 vDef; varying float vFade;';
const V_PARS = `
  attribute vec4 aApex; attribute vec3 aAxis; attribute vec2 aNear; attribute float aGroup; attribute float aO; attribute float aEnd;
  uniform vec3 uPal[16]; uniform float uBulk[16]; uniform vec4 uSel; uniform vec3 uClay; uniform vec3 uPlain; uniform float uBook; uniform float uPick[16]; uniform float uPickOn; attribute float aLift;
  ${VARY}`;
// Bulk. A muscle moves out along its normals by its own amount. Where it meets or lies over a muscle of another
// group, both move by the average of the two, so neighbours of different sizes meet without a step. The belly
// moves most and the creases between muscles (dark in the baked shade) least, so growing never fills them in and
// the detail stays. The ends stay near the bone unless they lie under another muscle's belly (aLift).
const V_BODY = `
  float sa = (1.0 - step(0.5, abs(aGroup - uSel.x))) * uSel.y, sb = (1.0 - step(0.5, abs(aGroup - uSel.z))) * uSel.w;
  int gi = int(aGroup + 0.5); float sel = max(max(sa, sb), uPick[gi] * uPickOn), anySel = max(max(uSel.y, uSel.w), uPickOn);
  // The picked muscle keeps the colour it has (its level, its recovery). With the drawing on (uBook) the rest of
  // the body fades out and the drawing shows instead; without it (a row of many) the rest fades towards plain.
  // A muscle with no colour is picked in clay.
  vec3 own = uPal[gi]; vec3 picked = distance(own, uPlain) < 0.02 ? uClay : own;
  vCol = mix(mix(own, uPlain, 0.82 * anySel * (1.0 - uBook)), picked, sel);
  vP = position; vON = normal; vApex = aApex; vA = aAxis; vShade = vec3(aO, aEnd, sel); vFade = anySel * (1.0 - sel);
  vDef = vec2(1.0, step(0.5, abs(aGroup - 1.0)));
  vec3 fr = abs(aAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0); vE1 = normalize(cross(aAxis, fr)); vE2 = cross(aAxis, vE1);
  float bulk = mix(uBulk[gi], uBulk[int(aNear.x + 0.5)], aNear.y);
  transformed += normal * bulk * aLift * mix(0.15, 1.15, smoothstep(0.3, 0.85, aO)) * step(0.5, aGroup);`;
// Fibre lines: where planes through the muscle's fan point cut its surface, so they run towards that point; two
// plane families, each used where it crosses the surface cleanly. As the fan widens new lines fade in between the
// old ones. Where lines would sit closer than the screen can draw they melt into their own average (no moire).
const F_PARS = `
  uniform float uFreq; uniform vec4 uP; uniform vec4 uQ; uniform vec3 uPlain; uniform float uBook; uniform float uXr;
  ${VARY}
  ${NOISE}
  float fibreFam(float u, float sc, float kf){
    float x = u * sc; float aa = fwidth(u) * sc + 1e-4; float melt = smoothstep(0.3, 0.62, aa);
    return mix(mix(cos(6.2832 * x), cos(12.5664 * x), kf) * 0.5 + 0.5, 0.5, melt); }
  float fibre(vec3 on){
    vec3 q = vP - vApex.xyz; float ra = max(dot(q, vA), 1e-4);
    float k = log2(ra / vApex.w), k0 = floor(k), sc = uFreq * vApex.w * exp2(k0);
    float wob = ((n3(vP * 30.0) - 0.5) * 0.5 + (n3(vP * 7.0) - 0.5) * 1.1) / (uFreq * vApex.w);
    float a1 = dot(on, normalize(cross(q, vE2))), a2 = dot(on, normalize(cross(q, vE1)));
    a1 = 1.0 - a1 * a1; a2 = 1.0 - a2 * a2; a1 *= a1; a2 *= a2; a1 *= a1; a2 *= a2;
    return (a1 * fibreFam(dot(q, vE1) / ra + wob, sc, k - k0) + a2 * fibreFam(dot(q, vE2) / ra + wob, sc, k - k0)) / (a1 + a2 + 1e-5); }`;

// The Book drawing (lab look H), shown while a muscle is picked: nothing filled in, every muscle only fine ink lines
// along its fibres, thicker in the shade, plus a contour, so you look through the body. The nearest surface is
// drawn at full strength; the surfaces behind show through between the lines, fainter the further back. Muscles
// with a colour take it as line colour and a light wash. The picked muscle is left out (it is drawn solid on top).
const L_VARY = 'varying vec3 vP; varying vec3 vON; varying vec4 vApex; varying vec3 vA; varying vec3 vE1; varying vec3 vE2; varying vec4 vTint; varying vec3 vShade;';
const L_V = `
  attribute vec4 aApex; attribute vec3 aAxis; attribute float aGroup; attribute float aO; attribute float aEnd;
  uniform vec3 uPal[16]; uniform float uHas[16]; uniform vec4 uSel; uniform vec3 uClay; uniform vec3 uPlain; uniform float uPick[16]; uniform float uPickOn;
  ${L_VARY} varying vec3 vN; varying float vZ;
  void main(){
    float sa = (1.0 - step(0.5, abs(aGroup - uSel.x))) * uSel.y, sb = (1.0 - step(0.5, abs(aGroup - uSel.z))) * uSel.w;
    int gi = int(aGroup + 0.5); float sel = max(max(sa, sb), uPick[gi] * uPickOn), anySel = max(max(uSel.y, uSel.w), uPickOn);
    vec3 own = uPal[gi], picked = uHas[gi] > 0.5 ? own : uClay;
    vTint = vec4(mix(own, picked, sel), mix(uHas[gi] * (1.0 - 0.6 * anySel), 1.0, sel));
    vP = position; vON = normal; vApex = aApex; vA = aAxis; vShade = vec3(aO, aEnd * step(0.5, abs(aGroup - 1.0)), sel);
    vec3 fr = abs(aAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0); vE1 = normalize(cross(aAxis, fr)); vE2 = cross(aAxis, vE1);
    vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }`;
const L_F = `
  uniform float uFreq; uniform float uFade; uniform float uFibre; uniform float uGhost; uniform vec2 uDepth; uniform vec3 uInk;
  ${L_VARY} varying vec3 vN; varying float vZ;
  ${NOISE}
  vec2 fibreFam(float u, float sc, float kf, float w){
    float x = u * sc; float aa = fwidth(u) * sc + 1e-4; float melt = smoothstep(0.3, 0.62, aa);
    float soft = mix(cos(6.2832 * x), cos(12.5664 * x), kf) * 0.5 + 0.5;
    float t0 = abs(fract(x + 0.5) - 0.5), t1 = abs(fract(x) - 0.5), w1 = w * kf;
    float crisp = max(1.0 - smoothstep(w - aa, w + aa, t0), (1.0 - smoothstep(w1 - aa, w1 + aa, t1)) * smoothstep(0.0, 0.2, kf));
    return vec2(mix(soft, 0.5, melt), mix(crisp, min(1.0, 2.0 * w * (1.0 + kf)), melt)); }
  vec2 fibre(vec3 on, float w){
    vec3 q = vP - vApex.xyz; float ra = max(dot(q, vA), 1e-4);
    float k = log2(ra / vApex.w), k0 = floor(k), sc = uFreq * vApex.w * exp2(k0);
    float wob = ((n3(vP * 30.0) - 0.5) * 0.5 + (n3(vP * 7.0) - 0.5) * 1.1) / (uFreq * vApex.w);
    float a1 = dot(on, normalize(cross(q, vE2))), a2 = dot(on, normalize(cross(q, vE1)));
    a1 = 1.0 - a1 * a1; a2 = 1.0 - a2 * a2; a1 *= a1; a2 *= a2; a1 *= a1; a2 *= a2;
    return (a1 * fibreFam(dot(q, vE1) / ra + wob, sc, k - k0, w) + a2 * fibreFam(dot(q, vE2) / ra + wob, sc, k - k0, w)) / (a1 + a2 + 1e-5); }
  void main(){
    vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
    float lit = dot(n, normalize(vec3(-0.42, 0.55, 0.72))) * 0.5 + 0.5;
    float dark = 1.0 - clamp(lit * mix(1.0, vShade.x, 0.85) * 1.12 - pow(1.0 - clamp(n.z, 0.0, 1.0), 2.6) * 0.3, 0.0, 1.0);
    float tend = smoothstep(0.62, 0.98, vShade.y) * uFibre; float tint = vTint.a * (1.0 - 0.6 * tend);
    vec3 ink = mix(uInk, vTint.rgb * mix(0.62, 0.8, vShade.z), tint);
    float l = 0.0;
    if (uFibre > 0.0) { float wid = (0.045 + 0.13 * smoothstep(0.15, 0.95, dark)) * (0.6 + 0.8 * n3(vP * vec3(90.0, 26.0, 90.0)));
      l = fibre(normalize(vON), wid).y * (1.0 - 0.75 * tend); }
    vec3 col; float a;
    if (uGhost > 0.0) {
      float edge = 1.0 - smoothstep(0.6, 1.6, n.z / (fwidth(n.z) + 1e-4));
      float far = clamp((vZ - uDepth.x + uDepth.y) / (2.0 * uDepth.y), 0.0, 1.0);
      col = ink; a = (l * 0.6 + edge * 0.8 * (1.0 - l * 0.6)) * mix(0.17, 0.035, far);
    } else {
      float wash = tint * (0.2 + 0.2 * dark + 0.3 * vShade.z) + (1.0 - uFibre) * 0.1 * smoothstep(0.25, 0.9, dark);
      float la = l * (0.42 + 0.22 * tint + 0.3 * dark);
      a = la + wash * (1.0 - la); col = mix(mix(uInk, vTint.rgb, min(1.0, tint * 3.0 + uFibre)), ink, la / max(a, 1e-4));
    }
    gl_FragColor = vec4(col, a * uFade * (1.0 - vShade.z));
    #include <colorspace_fragment>
  }`;
// The breast lies on the pec as a separate soft form in skin colour (the pec keeps its own shape), see-through
// in the middle and a little clearer at its edge, so the chest's colour still shows, as anatomy books draw it.
const breastGeo = (THREE) => { const g = new THREE.SphereGeometry(1, 40, 28), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0) { p.setZ(i, p.getZ(i) * (1 - 0.55 * y)); p.setY(i, y * 1.35); } } // teardrop: the top slopes into the chest
  g.computeVertexNormals(); return g; };

// ---------- the view ----------

export async function createBodyView({ onPick, onExpand, onCollapse, onLost, names, look } = {}) {
  // Fail before downloading anything when the browser has no WebGL 2 (three 0.170 needs it).
  { const probe = document.createElement('canvas'); const gl = probe.getContext('webgl2'); if (!gl) throw new Error('body3d: no WebGL'); const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); }
  const { THREE, muscleGeo, ctxGeo, femaleGeo, center, height } = await loadAssets();
  const LABEL = { ...NAMES, ...(names || {}) }, LOOK = LOOKS[look] || LOOKS.R;

  const canvas = document.createElement('canvas'); canvas.className = 'body3dCanvas'; canvas.setAttribute('aria-hidden', 'true');
  const ua = navigator.userAgent || '';
  const weak = /Android/i.test(ua) && ((navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4);
  const DPR = Math.min(weak ? 1.5 : 2, window.devicePixelRatio || 1);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { throw new Error('body3d: no WebGL'); }
  // Opened, a figure is drawn at the screen's full sharpness (up to 3); in the page it stays at 2 to save work.
  const DPR_OPEN = weak ? DPR : Math.min(3, window.devicePixelRatio || 1); let pr = DPR;
  renderer.setPixelRatio(DPR); renderer.setScissorTest(true); renderer.autoClear = false; renderer.info.autoReset = false; renderer.setClearColor(0x000000, 0);

  // Overlay for the open view: the same canvas moves in here and covers the screen.
  const over = document.createElement('div'); over.className = 'body3dOver';
  over.innerHTML = '<div class="body3dWho"></div><button type="button" class="body3dClose" aria-label="Close"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l12 12M15 3L3 15"/></svg></button><div class="body3dName"></div>';
  const whoEl = over.querySelector('.body3dWho'), nameEl = over.querySelector('.body3dName'), closeEl = over.querySelector('.body3dClose');

  // One scene, drawn once per person with that person's colours and bulk as uniforms.
  const plainC = new THREE.Color(PLAIN);
  const U = { uPal: { value: Array.from({ length: 16 }, () => plainC) }, uBulk: { value: new Array(16).fill(0) }, uBook: { value: 0 }, uXr: { value: 0 }, uPick: { value: new Array(16).fill(0) }, uPickOn: { value: 0 }, uSel: { value: new THREE.Vector4(-1, 0, -1, 0) },
    uClay: { value: new THREE.Color(CLAY) }, uPlain: { value: plainC }, uFreq: { value: 300 },
    uP: { value: new THREE.Vector4(LOOK.groove, LOOK.bump, LOOK.crease, LOOK.sheen) }, uQ: { value: new THREE.Vector4(1, LOOK.warm, LOOK.tendon, 0) } };
  // Transparent so that, with the drawing on, every muscle but the picked one can fade away (one pass, not two).
  // The x-ray copy draws the picked muscle where other muscles cover it, clearly, over the drawing, so turning the
  // body you still see all of it through the front (a back muscle from the front); only a touch lighter than where
  // it's in plain view, so you can tell which side it's on.
  const mkMuscle = (xray) => { const m = new THREE.MeshLambertMaterial({ transparent: true }); m.forceSinglePass = true;
    if (xray) { m.defines = { XRAY: '' }; m.depthFunc = THREE.GreaterDepth; m.depthWrite = false; m.side = THREE.FrontSide; } // only the side facing you: both sides broke into grey and colour patches
    m.onBeforeCompile = (s) => { Object.assign(s.uniforms, U);
    s.vertexShader = V_PARS + '\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + V_BODY);
    s.fragmentShader = F_PARS + '\n' + s.fragmentShader
      .replace('#include <color_fragment>', `diffuseColor.rgb = vCol;
        #ifdef XRAY
          diffuseColor.a = 0.82 * uXr * step(0.5, vShade.z); if (diffuseColor.a < 0.01) discard;
        #else
          diffuseColor.a = 1.0 - uBook * vFade; if (diffuseColor.a < 0.01) discard;
        #endif
        // Where the model has a gap (the tendon diamond between the traps), the inside shows as pale tendon.
        #ifndef XRAY
          if (!gl_FrontFacing) diffuseColor.rgb = uPlain * 0.97;
        #endif
        float tend = smoothstep(0.45, 0.95, vShade.y) * vDef.y; float fAmt = (1.0 - 0.85 * tend) * uQ.x * vDef.x * (1.0 - 0.6 * vFade); float fG = fibre(normalize(vON));
        diffuseColor.rgb = mix(diffuseColor.rgb, uPlain * 1.04, tend * uQ.z);
        diffuseColor.rgb *= 1.0 - uP.x * fG * fAmt;`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float hgt = -fG * fAmt * uP.y * 0.0007; vec2 dH = vec2(dFdx(hgt), dFdy(hgt));
          vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition); vec3 r1 = cross(sy, normal), r2 = cross(normal, sx); float det = dot(sx, r1);
          normal = normalize(abs(det) * normal - sign(det) * (dH.x * r1 + dH.y * r2)); }`)
      .replace('#include <opaque_fragment>', `
        outgoingLight *= mix(vec3(1.0), mix(vec3(0.5), vec3(0.66, 0.42, 0.37), uQ.y), clamp((1.0 - vShade.x) * 1.5 * vDef.x, 0.0, 1.0) * uP.z * (1.0 - 0.85 * tend));
        vec3 hv = normalize(normalize(vec3(2.0, 3.0, 4.0)) + normalize(vViewPosition));
        outgoingLight += vec3(1.0, 0.97, 0.93) * pow(max(dot(normal, hv), 0.0), 26.0) * uP.w;
        #include <opaque_fragment>`); };
    m.customProgramCacheKey = () => 'body3dMuscle' + Boolean(xray); return m; };
  const muscleMat = mkMuscle(false);
  const ctxMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true }); ctxMat.forceSinglePass = true;
  const scene = new THREE.Scene(), pivot = new THREE.Group(), fig = new THREE.Group();
  fig.position.copy(center).negate(); pivot.add(fig); scene.add(pivot);
  const muscle = new THREE.Mesh(muscleGeo, muscleMat), ctx = new THREE.Mesh(ctxGeo, ctxMat); fig.add(muscle, ctx);
  const breastMat = new THREE.MeshLambertMaterial({ color: '#EEE3D8', transparent: true, opacity: 0.85, depthWrite: false });
  // A soft, lit form that fades out at its edge and melts into the chest along its upper slope (no sticker line).
  breastMat.onBeforeCompile = (s) => { s.vertexShader = 'varying float vUp;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvUp = position.y;');
    s.fragmentShader = 'varying float vUp;\n' + s.fragmentShader.replace('#include <opaque_fragment>', 'float rim = 1.0 - abs(dot(normal, normalize(vViewPosition))); diffuseColor.a *= (1.0 - 0.75 * rim * rim) * (1.0 - smoothstep(-0.1, 0.9, vUp));\n#include <opaque_fragment>'); };
  const bGeo = breastGeo(THREE), breasts = [1, -1].map((x) => { const b = new THREE.Mesh(bGeo, breastMat); b.scale.set(0.072, 0.066, 0.066); b.position.set(x * 0.076, 0.372, 0.1); b.rotation.set(0.35, x * 0.45, 0); b.renderOrder = 1; fig.add(b); return b; });
  // The Book drawing: its own scene, drawn first while a muscle is picked; the solid scene (now only the picked
  // muscle) goes on top. Depth of the nearest surface, the faint layers behind, contours, then the near surface.
  const LU = { uPal: U.uPal, uHas: { value: new Array(16).fill(0) }, uSel: U.uSel, uPick: U.uPick, uPickOn: U.uPickOn, uClay: U.uClay, uPlain: U.uPlain, uFreq: { value: 300 }, uFade: { value: 0 }, uInk: { value: new THREE.Color('#3A3633') } };
  const lineMat = (fibre, ghost) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: !ghost, side: fibre ? THREE.FrontSide : THREE.DoubleSide,
    uniforms: { ...LU, uFibre: { value: fibre }, uGhost: { value: ghost }, uDepth: { value: new THREE.Vector2(6, 0.2) } }, vertexShader: L_V, fragmentShader: L_F });
  const HPX = { value: new THREE.Vector2() };
  const hullMat = new THREE.ShaderMaterial({ side: THREE.BackSide, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 0.5, polygonOffsetUnits: 1, uniforms: { uPx: HPX, uFade: LU.uFade, uInk: { value: new THREE.Color('#4F4A45') } },
    vertexShader: 'uniform vec2 uPx; varying float vZ; void main(){ vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vec3 nv = normalize(normalMatrix * normal); vZ = nv.z; c.xy += nv.xy * uPx * c.w; gl_Position = c; }',
    fragmentShader: 'uniform vec3 uInk; uniform float uFade; varying float vZ; void main(){ gl_FragColor = vec4(uInk, uFade * mix(1.0, 0.14, smoothstep(0.35, 0.85, -vZ)));\n#include <colorspace_fragment>\n}' });
  // Depth of every muscle but the picked one, so the picked one can be found behind them (x-ray) and in front.
  const depthM = new THREE.ShaderMaterial({ colorWrite: false, uniforms: { uSel: U.uSel, uPick: U.uPick, uPickOn: U.uPickOn },
    vertexShader: 'uniform vec4 uSel; uniform float uPick[16]; uniform float uPickOn; attribute float aGroup; varying float vS; void main(){ vS = max(max((1.0 - step(0.5, abs(aGroup - uSel.x))) * uSel.y, (1.0 - step(0.5, abs(aGroup - uSel.z))) * uSel.w), uPick[int(aGroup + 0.5)] * uPickOn); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying float vS; void main(){ if (vS > 0.5) discard; gl_FragColor = vec4(0.0); }' }), depthC = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const dScene = new THREE.Scene(), dPivot = new THREE.Group(), dFig = new THREE.Group(); dFig.position.copy(center).negate(); dPivot.add(dFig); dScene.add(dPivot);
  const dMesh = (isCtx, mat, order) => { const x = new THREE.Mesh(isCtx ? ctxGeo : muscleGeo, mat); x.renderOrder = order; x.userData.ctx = isCtx; dFig.add(x); return x; };
  const ghosts = [dMesh(false, lineMat(1, 1), 1), dMesh(true, lineMat(0, 1), 1)];
  const xrayMat = mkMuscle(true);
  dScene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 2.2)); { const sun2 = new THREE.DirectionalLight(0xffffff, 1.1); sun2.position.set(2, 3, 4); dScene.add(sun2); }
  const dMeshes = [dMesh(false, depthM, -1), dMesh(true, depthC, -1), ...ghosts, dMesh(false, xrayMat, 4), dMesh(false, hullMat, 2), dMesh(true, hullMat, 2), dMesh(false, lineMat(1, 0), 3), dMesh(true, lineMat(0, 0), 3)];
  const useGeo = (p) => { const g = p.fem ? femaleGeo() : { muscleGeo, ctxGeo }; muscle.geometry = g.muscleGeo; ctx.geometry = g.ctxGeo; for (const m of dMeshes) m.geometry = m.userData.ctx ? g.ctxGeo : g.muscleGeo; for (const b of breasts) b.visible = p.fem && WOMAN_CHEST; };
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 2.2)); const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(2, 3, 4); scene.add(sun);
  // The sheet that covers the page while a figure is open.
  const veilMat = new THREE.MeshBasicMaterial({ color: '#FAF9F5', transparent: true, depthTest: false, depthWrite: false });
  const veilScene = new THREE.Scene(); veilScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), veilMat)); const veilCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const FOV = 30, TAN = Math.tan(FOV * Math.PI / 360), WIDE = 0.406; // WIDE: the body's width over its height, arms included
  const cam = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  let hostEl = null, hostW = 0, hostH = 0, W = 0, H = 0, inOver = false;
  let people = [], slots = [], ts = [];
  let angle = 0.5, speed = reduced.matches ? 0 : 0.05, hold = false, drag = null, open = -1;
  let selGroup = 0; const sel = U.uSel.value;
  // Picking muscles for a plan (Train together): pickOn eases to pickTo; face turns everyone to one side and holds.
  let pickOn = 0, pickTo = 0, face = null;
  let raf = 0, lastT = 0, lastDraw = 0, dirty = true, onScreen = false, dead = false, lastTap = null;

  // Where each person stands in the host: one row, feet on one line, the tallest as big as the host allows.
  const layout = () => {
    const n = people.length; slots = [];
    if (!n || hostW < 2 || hostH < 2) return;
    // Columns by weight: everyone 1, except someone set bigger (you, while picking muscles).
    const maxCm = Math.max(...people.map((p) => p.cm)), total = people.reduce((sum, p) => sum + (p.zoom || 1), 0);
    let x = 0;
    slots = people.map((p) => { const colW = hostW * (p.zoom || 1) / total;
      const ppuMax = Math.min(hostH / (height * 1.04), colW / (height * WIDE * (n > 1 ? 1 : 1.04))), foot = (hostH - height * ppuMax) / 2; // px from the bottom to the soles
      const ppu = ppuMax * p.cm / maxCm, slot = { x, y: 0, w: colW, h: hostH, ppu, cy: -height / 2 + (hostH / 2 - foot) / ppu }; x += colW; return slot; });
  };
  const size = () => {
    if (hostEl) { const w = hostEl.clientWidth, h = hostEl.clientHeight; if (w !== hostW || h !== hostH) { hostW = w; hostH = h; layout(); dirty = true; } }
    const w = inOver ? over.clientWidth : hostW, h = inOver ? over.clientHeight : hostH;
    if (w > 0 && h > 0 && (w !== W || h !== H)) { W = w; H = h; renderer.setSize(W, H, false); dirty = true; }
  };
  // The rectangle, zoom and camera height of person i right now, between their place in the row and the whole screen.
  const place = (i) => {
    const s = slots[i]; if (!s) return null;
    let ox = 0, oy = 0; if (inOver && hostEl) { const r = hostEl.getBoundingClientRect(); ox = r.left; oy = r.top; }
    const e = ease(ts[i] || 0);
    if (e <= 0) return { x: ox + s.x, y: oy + s.y, w: s.w, h: s.h, ppu: s.ppu, cy: s.cy, e };
    const ppu1 = Math.min(H / (height * 1.18), W / (height * WIDE * 1.18));
    return { x: (ox + s.x) * (1 - e), y: (oy + s.y) * (1 - e), w: s.w + (W - s.w) * e, h: s.h + (H - s.h) * e, ppu: s.ppu * Math.pow(ppu1 / s.ppu, e), cy: s.cy + (-height * 0.012 - s.cy) * e, e };
  };
  const aim = (r) => { const d = r.h / 2 / (r.ppu * TAN);
    cam.aspect = r.w / r.h; cam.near = Math.max(0.01, d - height); cam.far = d + height; cam.position.set(0, r.cy, d); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); };
  const show = (i) => {
    const r = place(i); if (!r || r.w < 1 || r.h < 1 || r.x > W || r.y > H || r.x + r.w < 0 || r.y + r.h < 0) return;
    const p = people[i], s = slots[i];
    aim(r); pivot.rotation.y = angle; pivot.scale.set(p.wx, 1, p.wx); useGeo(p);
    U.uPal.value = p.pal; U.uBulk.value = p.bulk; LU.uHas.value = p.has;
    // The drawing replaces the rest of the body only for one or two people; a row of many fades to plain instead.
    // Picking muscles for a plan: each person shows the muscles they'll train, solid, the rest as the drawing.
    U.uPick.value = p.pick; U.uPickOn.value = pickOn;
    const book = people.length <= (pickOn > 0 ? 4 : 2) ? 1 : 0, f = book * Math.max(sel.y, sel.w, pickOn); U.uBook.value = book;
    ctxMat.opacity = 1 - f; ctx.visible = f < 0.998; breastMat.opacity = 0.85 * (1 - f);
    // Both sides only where it's seen up close (one person, or opened); a row of many keeps the cheaper front side.
    muscleMat.side = people.length <= 3 || r.e > 0 ? THREE.DoubleSide : THREE.FrontSide;
    // Fibre spacing is fixed on the body (about 2.4 px on a figure in the row), so opening a figure zooms into it.
    // Small figures (a row of seven) get the spacing of a 380 px one: finer than the screen, so it melts to a tone.
    // Opened, the spacing follows the zoom most of the way, so a figure that fills the screen shows about twice
    // as many fibres as in the row instead of the same ones drawn thicker.
    U.uFreq.value = Math.max(s.ppu * Math.pow(r.ppu / s.ppu, 0.75), 380 / height) / Math.max(2.4, 3.4 / pr);
    U.uQ.value.x = Math.max(0.45, Math.min(1, (r.ppu * height - 90) / 200));
    const y = H - r.y - r.h; renderer.setViewport(r.x, y, r.w, r.h); renderer.setScissor(r.x, y, r.w, r.h);
    if (f > 0.002) { LU.uFade.value = f; U.uXr.value = f; LU.uFreq.value = U.uFreq.value * 0.78; dPivot.rotation.y = angle; dPivot.scale.copy(pivot.scale);
      const px = Math.max(0.8, Math.min(1.5, r.h * 0.0021)); HPX.value.set(2 * px / r.w, 2 * px / r.h);
      for (const g of ghosts) g.material.uniforms.uDepth.value.set(cam.position.z, height * 0.11);
      renderer.render(dScene, cam); }
    renderer.render(scene, cam);
  };
  const render = () => {
    if (W < 1 || H < 1) return;
    renderer.info.reset();
    renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.clear();
    let top = -1; for (let i = 0; i < people.length; i++) if (ts[i] > 0 && (top < 0 || ts[i] >= ts[top])) top = i;
    const covered = top >= 0 && ts[top] >= 1;
    if (!covered) for (let i = 0; i < people.length; i++) if (i !== top) show(i);
    if (top >= 0) { renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); veilMat.opacity = Math.min(1, ease(ts[top]) * 1.6); renderer.render(veilScene, veilCam); renderer.clearDepth(); show(top); }
    dirty = false;
  };

  // The loop only runs while there is something to draw: on screen, page visible, and something moving.
  const live = () => !dead && !document.hidden && (onScreen || inOver);
  const idleSpeed = () => (reduced.matches || selGroup || hold ? 0 : 0.006 * Math.sign(speed || 1));
  const settle = () => { // back in the row after closing
    inOver = false; pr = DPR; renderer.setPixelRatio(pr); W = H = 0; over.classList.remove('on', 'in'); document.removeEventListener('keydown', onKey);
    if (hostEl) hostEl.appendChild(canvas);
    size(); render();
  };
  const tick = (now) => {
    raf = 0; if (!live()) return;
    const ms = Math.min(50, now - (lastT || now)), dt = ms / 16.7; lastT = now;
    let moving = dirty;
    if (!drag) { const idle = idleSpeed(); if (Math.abs(speed - idle) > 1e-5 || idle) { speed += (idle - speed) * Math.min(1, 0.04 * dt); angle += speed * dt; moving = true; } else speed = idle; }
    else moving = true;
    let anim = false;
    for (let i = 0; i < people.length; i++) { const to = open === i ? 1 : 0, t = ts[i] || 0; if (t !== to) { ts[i] = Math.max(0, Math.min(1, t + Math.sign(to - t) * ms / (reduced.matches ? 1 : 480))); anim = true; } }
    if (Math.abs(pickTo - pickOn) > 0.002) { pickOn += (pickTo - pickOn) * Math.min(1, 0.2 * dt); anim = true; } else pickOn = pickTo;
    if (face !== null && !drag) { const d = Math.atan2(Math.sin(face - angle), Math.cos(face - angle)); if (Math.abs(d) > 0.002) { angle += d * Math.min(1, 0.15 * dt); speed = 0; anim = true; } }
    const sy = selGroup === sel.x ? 1 : 0;
    if (Math.abs(sy - sel.y) > 0.002 || sel.w > 0.002) { sel.y += (sy - sel.y) * Math.min(1, 0.2 * dt); sel.w += (0 - sel.w) * Math.min(1, 0.2 * dt); anim = true; } else { sel.y = sy; sel.w = 0; }
    if (inOver && open < 0 && !anim && ts.every((t) => !t)) { settle(); moving = false; }
    else if (moving || anim) {
      // Idle spin alone is drawn at about 30 frames a second; anything the finger does gets every frame.
      const calm = !drag && !anim && !dirty && Math.abs(speed) < 0.008;
      if (!calm || now - lastDraw >= 30) { size(); render(); lastDraw = now; }
    }
    if (moving || anim || idleSpeed()) raf = requestAnimationFrame(tick); else lastT = 0;
  };
  const kick = () => { if (!raf && live()) raf = requestAnimationFrame(tick); };

  // Tapping.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const personAt = (x, y) => { // x, y in canvas pixels
    if (open >= 0) return open;
    for (let i = 0; i < people.length; i++) { const r = place(i); if (r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i; }
    return -1;
  };
  const pick = (i, x, y) => { // null: beside the body; 0: on the body, not a muscle; else the group number
    const r = place(i); if (!r) return null;
    aim(r); pivot.rotation.y = angle; pivot.scale.set(people[i]?.wx || 1, 1, people[i]?.wx || 1); if (people[i]) useGeo(people[i]); scene.updateMatrixWorld(true);
    ndc.set((x - r.x) / r.w * 2 - 1, -((y - r.y) / r.h * 2 - 1)); ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects([muscle, ctx], false)[0];
    return hit ? (hit.object === muscle ? muscle.geometry.userData.grp[hit.face.a] : 0) : null;
  };
  // The line under the open figure: the picked muscle with what the app says about it ("Traps · Elite 5.4",
  // "Quads · 2 days ago") when it passes a label, else just its name.
  const showName = () => { const key = GROUPS[selGroup - 1];
    if (key) { const p = people[open >= 0 ? open : 0], c = p?.pal[selGroup], hex = c && c !== plainC ? '#' + c.getHexString() : CLAY;
      const sw = document.createElement('i'), text = document.createElement('span'); sw.style.background = hex; text.textContent = p?.labels[key] || LABEL[key];
      nameEl.replaceChildren(sw, text); nameEl.classList.add('on'); } else nameEl.classList.remove('on'); };
  const doExpand = (i) => {
    if (dead || i === open || !people[i]) return false;
    open = i; whoEl.textContent = people[i].name || ''; showName();
    if (!inOver) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if (/^#[0-9a-f]{6}$/i.test(bg)) veilMat.color.set(bg);
      inOver = true; pr = DPR_OPEN; renderer.setPixelRatio(pr); W = H = 0; if (!over.parentNode) document.body.appendChild(over);
      over.insertBefore(canvas, over.firstChild); over.classList.add('on'); document.addEventListener('keydown', onKey);
      size(); render(); requestAnimationFrame(() => { if (open >= 0) over.classList.add('in'); });
    }
    dirty = true; kick(); return true;
  };
  const doCollapse = () => { if (open < 0) return false; open = -1; over.classList.remove('in'); dirty = true; kick(); return true; };
  const userCollapse = () => { if (doCollapse() && onCollapse) onCollapse(); };
  const onKey = (e) => { if (e.key === 'Escape' && open >= 0) userCollapse(); };
  const tap = (e) => {
    const b = canvas.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    if (open >= 0) {
      if ((ts[open] || 0) < 0.5) return;
      const g = pick(open, x, y);
      if (g) { if (onPick) onPick(GROUPS[g - 1], open); } else if (g === null) { if (selGroup) { if (onPick) onPick(null, open); } else userCollapse(); }
      return;
    }
    const i = personAt(x, y); if (i < 0) return;
    const twice = lastTap && lastTap.i === i && e.timeStamp - lastTap.t < 320 && Math.hypot(x - lastTap.x, y - lastTap.y) < 30;
    lastTap = twice ? null : { i, t: e.timeStamp, x, y };
    const g = twice ? 0 : pick(i, x, y);
    if (g) { if (onPick) onPick(GROUPS[g - 1], i); } else if (g === 0) { if (doExpand(i) && onExpand) onExpand(i); }
  };
  // Drag sideways to spin (with a little throw); a touch that moved less than 6 px is a tap. Up and down is left
  // to the page (touch-action: pan-y), which then cancels the pointer.
  const down = (e) => { if (e.button) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, a: angle, last: e.clientX, lt: e.timeStamp, far: 0 }; speed = 0; hold = pickTo > 0; try { canvas.setPointerCapture(e.pointerId); } catch {} kick(); };
  const move = (e) => { if (!drag || drag.id !== e.pointerId) return; drag.far = Math.max(drag.far, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    if (drag.far < 6) return; face = null; const k = 0.012 * Math.min(1, 393 / Math.max(393, window.innerWidth * 0.6));
    angle = drag.a + (e.clientX - drag.x) * k; speed = Math.max(-0.3, Math.min(0.3, (e.clientX - drag.last) * k / Math.max(1, e.timeStamp - drag.lt) * 16.7)); drag.last = e.clientX; drag.lt = e.timeStamp; kick(); };
  const up = (e) => { if (!drag || drag.id !== e.pointerId) return; const d = drag; drag = null;
    if (d.far < 6) { speed = 0.0001 * Math.sign(d.a - angle || 1); tap(e); } else if (e.timeStamp - d.lt > 80 || reduced.matches) speed = 0; kick(); };
  const cancel = () => { drag = null; kick(); };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  // A lost GPU context usually comes back; if it hasn't after 3 s (iOS after the app was in the background), the app
  // is told so it can build a new view instead of leaving an empty frame.
  let lostTimer = 0;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); clearTimeout(lostTimer); lostTimer = setTimeout(() => { if (!dead && onLost) onLost(); }, 3000); });
  canvas.addEventListener('webglcontextrestored', () => { clearTimeout(lostTimer); dirty = true; kick(); });
  closeEl.addEventListener('click', userCollapse);

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((en) => { onScreen = en[en.length - 1].isIntersecting; if (onScreen) { dirty = true; kick(); } }) : null;
  if (io) io.observe(canvas); else onScreen = true;
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { size(); if (dirty) render(); kick(); }) : null;
  const onVis = () => { if (!document.hidden) { dirty = true; kick(); } };
  const onWin = () => { size(); if (dirty) { render(); kick(); } };
  document.addEventListener('visibilitychange', onVis); window.addEventListener('resize', onWin);

  const handle = {
    attach(host) {
      if (dead || !host) return;
      if (host !== hostEl) { if (hostEl) hostEl.classList.remove('body3dHost'); if (ro) { ro.disconnect(); ro.observe(host); } hostEl = host; host.classList.add('body3dHost'); hostW = hostH = 0; }
      if (!inOver && canvas.parentNode !== host) host.appendChild(canvas);
      // Draw before the browser paints, so a moved or resized canvas never shows empty.
      onScreen = true; size(); render(); kick();
    },
    setPeople(list) {
      people = (list || []).map((p) => {
        const pal = [plainC], bulk = [0], has = [0], labels = {}, fem = p.sex === 'female';
        for (const g of GROUPS) { const m = (p.muscles || {})[g] || {}; pal.push(m.color ? new THREE.Color(m.color) : plainC); has.push(m.color ? 1 : 0); if (m.label) labels[g] = String(m.label); bulk.push(bulkOf(g, m.level, fem)); }
        // Build: wider for more weight at the same height (BMI), within a calm range.
        const cm = p.heightCm > 0 ? p.heightCm : DEFAULT_CM, bmi = p.kg > 0 ? p.kg / (cm / 100) ** 2 : 23;
        const pick = [0, ...GROUPS.map((g) => ((p.picks || []).includes(g) ? 1 : 0))];
        return { id: p.id, name: p.name || '', cm, pal, bulk, has, fem, labels, pick, zoom: p.zoom || 1, wx: Math.max(0.9, Math.min(1.12, Math.sqrt(bmi / 23))) };
      });
      ts = people.map((_, i) => ts[i] || 0);
      if (open >= people.length) { open = -1; ts = ts.map(() => 0); if (inOver) settle(); }
      if (open >= 0) whoEl.textContent = people[open].name;
      showName();
      layout(); dirty = true; kick();
    },
    // { pick: true, face: 0 | Math.PI }: picking muscles; everyone stands still facing that side. { pick: false }: back to normal.
    setMode({ pick = false, face: to = null } = {}) {
      const next = pick ? 1 : 0; if (next === pickTo && to === face) return;
      pickTo = next; face = pick ? to : null; hold = Boolean(pick); if (!pick) speed = reduced.matches ? 0 : 0.0001;
      dirty = true; kick();
    },
    setSelected(key) {
      const g = GROUPS.indexOf(key) + 1; if (g === selGroup) return;
      if (sel.y > 0.01) { sel.z = sel.x; sel.w = sel.y; } sel.y = 0; if (g) sel.x = g; selGroup = g;
      showName();
      dirty = true; kick();
    },
    expand(index) { doExpand(index); },
    collapse() { doCollapse(); },
    destroy() {
      if (dead) return; dead = true; clearTimeout(lostTimer); cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect();
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onWin); document.removeEventListener('keydown', onKey);
      if (hostEl) hostEl.classList.remove('body3dHost'); canvas.remove(); over.remove();
      muscleMat.dispose(); xrayMat.dispose(); ctxMat.dispose(); breastMat.dispose(); bGeo.dispose(); hullMat.dispose(); depthM.dispose(); depthC.dispose(); for (const m of dMeshes) if (m.material.isShaderMaterial) m.material.dispose(); veilMat.dispose(); renderer.dispose(); renderer.forceContextLoss(); // the geometry is shared with other views and stays
    },
    // For tests and tuning only.
    debug: {
      setAngle(a) { angle = a; speed = 0; hold = true; dirty = true; size(); render(); },
      state: () => ({ angle, open, inOver, W, H, hostW, hostH, running: Boolean(raf), dpr: DPR, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lost: renderer.getContext().isContextLost(), canvas }),
      pick: (i, x, y) => { const g = pick(i, x, y); return g ? GROUPS[g - 1] : g; },
    },
  };
  return handle;
}

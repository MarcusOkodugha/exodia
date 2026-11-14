// Exodia 3D body. One WebGL canvas that draws one or several people from the same anatomy model: muscles in the
// colours the app passes in, each muscle as bulky as its strength level, drag to spin, tap a muscle, open one
// person full screen. Nothing here runs until createBodyView() is called; three.js and the model load then.
//
//   const view = await createBodyView({ onPick, onExpand, onCollapse, names })   // rejects without WebGL
//   view.attach(hostEl)        the host needs a size of its own; call again with the new element after every render
//   view.setPeople([{ id, name, heightCm, muscles: { chest: { color: '#C96442', level: 3.6 }, ... } }])
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
// Muscle group from the model's own part name (anterior_delt, vastus_group, ...).
const GROUP = (n) => /hamstring/.test(n) ? 'hamstrings' : /pec/.test(n) ? 'chest' : /posterior_delt/.test(n) ? 'rearDelts' : /delt/.test(n) ? 'shoulders' : /trap/.test(n) ? 'traps' : /triceps/.test(n) ? 'triceps' : /biceps|brachialis/.test(n) ? 'biceps' : /forearm|brachiorad/.test(n) ? 'forearms' : /hip_rotator/.test(n) ? 'glutes' : /lats|rhomboid|teres|rotator|serratus/.test(n) ? 'upperBack' : /erector/.test(n) ? 'lowerBack' : /abdom|oblique/.test(n) ? 'abs' : /glute/.test(n) ? 'glutes' : /rectus_femoris|vastus/.test(n) ? 'quads' : /adductor/.test(n) ? 'adductors' : /gastro|soleus|fibularis|tibialis/.test(n) ? 'calves' : null;
const PLAIN = '#E9E5DC', SKIN = '#F1EEE7', CLAY = '#C96442';
const DEFAULT_CM = 178;

// Bulk: how far a muscle's belly is pushed out along its normals, in model units, by strength level. Elite (5)
// is look F from the lab, the build that looked best; nothing grows far past it. Below 1 the belly is drawn in a
// little, so a Beginner is slimmer than the plain model. In between it is a straight line from one level to the
// next. No level: 0, the plain model.
const BULK = [[1, -0.004], [2, 0.003], [3, 0.007], [4, 0.01], [5, 0.0125], [6, 0.014]];
// Where the size goes. Shoulders, chest, back and arms carry it; glutes, calves, inner thighs and the waist grow
// much less, so every level up reads as a better shape (wider on top, tight in the middle), not just bigger.
const SHAPE = { glutes: 0.4, calves: 0.5, adductors: 0.5, abs: 0.3, lowerBack: 0.6, hamstrings: 0.75, quads: 0.9, forearms: 0.8, traps: 0.8, shoulders: 1.1, upperBack: 1.05 };
// Definition: how deep the fibres and the creases between muscles are drawn. It rises with the level, so a strong
// muscle shows more detail, not only more size. No level: 1, as drawn before.
const defOf = (lv) => (lv == null || !isFinite(lv) ? 1 : 0.75 + 0.45 * (Math.max(1, Math.min(5, lv)) - 1) / 4);
// Looks. F: fibres you can see. G: smoother and warmer, deep creases, more sheen ("looks real"). D: no fibre lines.
const LOOKS = {
  F: { groove: 0.2, bump: 1, crease: 0.6, sheen: 0.05, warm: 0.35, tendon: 0.45 },
  G: { groove: 0.05, bump: 0.55, crease: 0.8, sheen: 0.13, warm: 0.75, tendon: 0.2 },
  D: { groove: 0, bump: 0, crease: 0, sheen: 0, warm: 0, tendon: 0 },
};
const bulkOf = (lv) => {
  if (lv == null || !isFinite(lv)) return 0;
  const l = Math.max(1, Math.min(6, lv));
  for (let i = 1; i < BULK.length; i++) if (l <= BULK[i][0]) { const [a, x] = BULK[i - 1], [b, y] = BULK[i]; return x + (y - x) * (l - a) / (b - a); }
  return BULK[BULK.length - 1][1];
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
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), axis = new Float32Array(nv * 3), col = new Float32Array(nv * 3), apex = new Float32Array(nv * 4);
  const ao = new Float32Array(nv), end = new Float32Array(nv), grp = new Float32Array(nv), idx = new Uint32Array(ni);
  const plain = new THREE.Color(PLAIN), skinC = new THREE.Color(SKIN);
  let vo = 0, io = 0, headI = null; const lats = new Uint8Array(nv);
  for (const o of parts) {
    const cnt = o.count, ctx = /context/.test(o.name), skin = /skin/.test(o.name), head = /body_context/.test(o.name);
    const gi = ctx ? 0 : GROUPS.indexOf(GROUP(o.name)) + 1;
    pos.set(o.pos, vo * 3); nor.set(o.nor, vo * 3); if (/lats/.test(o.name)) lats.fill(1, vo, vo + cnt);
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
  // The low back. In the model the erectors lie under the lower lats, so from behind the lumbar area took the
  // upper-back colour and the lower back never showed. What covers the erectors there is a flat tendon sheet, not
  // lat muscle, so the part of the lats lying right over an erector counts as lower back: colour, size and tap.
  const gLow = GROUPS.indexOf('lowerBack') + 1;
  if (R > 0 && gLow) { let y0 = Infinity, y1 = -Infinity; for (let i = 0; i < nv; i++) if (grp[i] === gLow) { y0 = Math.min(y0, pos[i * 3 + 1]); y1 = Math.max(y1, pos[i * 3 + 1]); }
    const top = y0 + (y1 - y0) * 0.4; // the erectors run up to the neck; the low back is their lower part, below the ribs
    const r = R * 0.45, cells = new Map(), ck = (x, y) => Math.floor(x / r) * 8192 + Math.floor(y / r);
    for (let i = 0; i < nv; i++) if (grp[i] === gLow) { const k = ck(pos[i * 3], pos[i * 3 + 1]); let c = cells.get(k); if (!c) cells.set(k, c = []); c.push(i); }
    for (let i = 0; i < nv; i++) { if (!lats[i] || pos[i * 3 + 1] > top) continue; const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]; let over = false;
      for (let a = -1; a <= 1 && !over; a++) for (let b = -1; b <= 1 && !over; b++) { const cell = cells.get(ck(x + a * r, y + b * r)); if (!cell) continue;
        for (const j of cell) { const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y; if (dx * dx + dy * dy < r * r && Math.abs(pos[j * 3 + 2] - z) < R * 3) { over = true; break; } } }
      if (over) grp[i] = gLow; } }
  // Neighbours. For every muscle vertex: the nearest vertex of another muscle group within R, and how near it is.
  // The shader moves the two towards the same bulk where they meet (see V_BODY). A grid keeps the search short.
  const near = new Float32Array(nv * 2);
  if (R > 0) { const cells = new Map(), ck = (x, y, z) => (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512), cf = (i, k) => Math.floor(pos[i * 3 + k] / R);
    for (let i = 0; i < nv; i++) { if (!grp[i]) continue; const k = ck(cf(i, 0), cf(i, 1), cf(i, 2)); let c = cells.get(k); if (!c) cells.set(k, c = []); c.push(i); }
    for (let i = 0; i < nv; i++) { const g = grp[i]; if (!g) continue; const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], cx = cf(i, 0), cy = cf(i, 1), cz = cf(i, 2); let best = R * R, bg = 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const cell = cells.get(ck(cx + a, cy + b, cz + c)); if (!cell) continue;
        for (const j of cell) { if (grp[j] === g) continue; const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz; if (d2 < best) { best = d2; bg = grp[j]; } } }
      if (bg) { const d = Math.sqrt(best) / R; near[i * 2] = bg; near[i * 2 + 1] = 0.5 * (1 - d * d * (3 - 2 * d)); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('aNear', new THREE.BufferAttribute(near, 2));
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aAxis', new THREE.BufferAttribute(axis, 3)); geo.setAttribute('aApex', new THREE.BufferAttribute(apex, 4));
  geo.setAttribute('aO', new THREE.BufferAttribute(ao, 1)); geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1)); geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingBox(); geo.computeBoundingSphere(); geo.userData.grp = grp;
  return geo;
};

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
  return { THREE, muscleGeo, ctxGeo, box, center: box.getCenter(new THREE.Vector3()), height: box.max.y - box.min.y };
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
  uniform vec3 uPal[16]; uniform float uBulk[16]; uniform float uDef[16]; uniform vec4 uSel; uniform vec3 uClay; uniform vec3 uPlain;
  ${VARY}`;
// Bulk. A muscle moves out along its normals by its own level's amount. Where it meets or lies over a muscle of
// another group, both move by the average of the two, so neighbours with different levels meet without a step
// and a thin muscle never sinks through the one under it. A muscle drawn in (below Novice) only gives at its
// belly, not in the creases (dark in the baked shade), so no gaps open. The ends stay near the bone.
const V_BODY = `
  float sa = (1.0 - step(0.5, abs(aGroup - uSel.x))) * uSel.y, sb = (1.0 - step(0.5, abs(aGroup - uSel.z))) * uSel.w;
  float sel = max(sa, sb), anySel = max(uSel.y, uSel.w); int gi = int(aGroup + 0.5);
  // The picked muscle keeps the colour it has (its level, its recovery) and the rest of the body fades towards
  // plain, so it stands out by being the only one left in colour. A muscle with no colour is picked in clay.
  vec3 own = uPal[gi]; vec3 picked = distance(own, uPlain) < 0.02 ? uClay : own;
  vCol = mix(mix(own, uPlain, 0.82 * anySel), picked, sel);
  vP = position; vON = normal; vApex = aApex; vA = aAxis; vShade = vec3(aO, aEnd, sel); vFade = anySel * (1.0 - sel);
  // x: definition by level. y: how much the ends pale to tendon; not the chest, which read as a white patch on the breastbone.
  vDef = vec2(uDef[gi], step(0.5, abs(aGroup - 1.0)));
  vec3 fr = abs(aAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0); vE1 = normalize(cross(aAxis, fr)); vE2 = cross(aAxis, vE1);
  float bulk = mix(uBulk[gi], uBulk[int(aNear.x + 0.5)], aNear.y); if (bulk < 0.0) bulk *= smoothstep(0.4, 0.72, aO);
  transformed += normal * bulk * (1.0 - 0.85 * smoothstep(0.5, 1.0, aEnd)) * step(0.5, aGroup);`;
// Fibre lines: where planes through the muscle's fan point cut its surface, so they run towards that point; two
// plane families, each used where it crosses the surface cleanly. As the fan widens new lines fade in between the
// old ones. Where lines would sit closer than the screen can draw they melt into their own average (no moire).
const F_PARS = `
  uniform float uFreq; uniform vec4 uP; uniform vec4 uQ; uniform vec3 uPlain;
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

// ---------- the view ----------

export async function createBodyView({ onPick, onExpand, onCollapse, names, look } = {}) {
  // Fail before downloading anything when the browser has no WebGL 2 (three 0.170 needs it).
  { const probe = document.createElement('canvas'); const gl = probe.getContext('webgl2'); if (!gl) throw new Error('body3d: no WebGL'); const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); }
  const { THREE, muscleGeo, ctxGeo, center, height } = await loadAssets();
  const LABEL = { ...NAMES, ...(names || {}) }, LOOK = LOOKS[look] || LOOKS.F;

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
  const U = { uPal: { value: Array.from({ length: 16 }, () => plainC) }, uBulk: { value: new Array(16).fill(0) }, uDef: { value: new Array(16).fill(1) }, uSel: { value: new THREE.Vector4(-1, 0, -1, 0) },
    uClay: { value: new THREE.Color(CLAY) }, uPlain: { value: plainC }, uFreq: { value: 300 },
    uP: { value: new THREE.Vector4(LOOK.groove, LOOK.bump, LOOK.crease, LOOK.sheen) }, uQ: { value: new THREE.Vector4(1, LOOK.warm, LOOK.tendon, 0) } };
  const muscleMat = new THREE.MeshLambertMaterial();
  muscleMat.onBeforeCompile = (s) => { Object.assign(s.uniforms, U);
    s.vertexShader = V_PARS + '\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + V_BODY);
    s.fragmentShader = F_PARS + '\n' + s.fragmentShader
      .replace('#include <color_fragment>', `diffuseColor.rgb = vCol;
        // Where the model has a gap (the tendon diamond between the traps), the inside shows as pale tendon.
        if (!gl_FrontFacing) diffuseColor.rgb = uPlain * 0.97;
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
  muscleMat.customProgramCacheKey = () => 'body3dMuscle';
  const ctxMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const scene = new THREE.Scene(), pivot = new THREE.Group(), fig = new THREE.Group();
  fig.position.copy(center).negate(); pivot.add(fig); scene.add(pivot);
  const muscle = new THREE.Mesh(muscleGeo, muscleMat), ctx = new THREE.Mesh(ctxGeo, ctxMat); fig.add(muscle, ctx);
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
  let raf = 0, lastT = 0, lastDraw = 0, dirty = true, onScreen = false, dead = false, lastTap = null;

  // Where each person stands in the host: one row, feet on one line, the tallest as big as the host allows.
  const layout = () => {
    const n = people.length; slots = [];
    if (!n || hostW < 2 || hostH < 2) return;
    const maxCm = Math.max(...people.map((p) => p.cm)), colW = hostW / n;
    const ppuMax = Math.min(hostH / (height * 1.04), colW / (height * WIDE * (n > 1 ? 1 : 1.04)));
    const foot = (hostH - height * ppuMax) / 2; // px from the bottom of the host to the soles
    slots = people.map((p, i) => { const ppu = ppuMax * p.cm / maxCm; return { x: i * colW, y: 0, w: colW, h: hostH, ppu, cy: -height / 2 + (hostH / 2 - foot) / ppu }; });
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
    aim(r); pivot.rotation.y = angle; pivot.scale.set(p.wx, 1, p.wx);
    U.uPal.value = p.pal; U.uBulk.value = p.bulk; U.uDef.value = p.def;
    // Both sides only where it's seen up close (one person, or opened); a row of many keeps the cheaper front side.
    muscleMat.side = people.length <= 3 || r.e > 0 ? THREE.DoubleSide : THREE.FrontSide;
    // Fibre spacing is fixed on the body (about 2.4 px on a figure in the row), so opening a figure zooms into it.
    // Small figures (a row of seven) get the spacing of a 380 px one: finer than the screen, so it melts to a tone.
    // Opened, the spacing follows the zoom most of the way, so a figure that fills the screen shows about twice
    // as many fibres as in the row instead of the same ones drawn thicker.
    U.uFreq.value = Math.max(s.ppu * Math.pow(r.ppu / s.ppu, 0.75), 380 / height) / Math.max(2.4, 3.4 / pr);
    U.uQ.value.x = Math.max(0.45, Math.min(1, (r.ppu * height - 90) / 200));
    const y = H - r.y - r.h; renderer.setViewport(r.x, y, r.w, r.h); renderer.setScissor(r.x, y, r.w, r.h); renderer.render(scene, cam);
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
    aim(r); pivot.rotation.y = angle; pivot.scale.set(people[i]?.wx || 1, 1, people[i]?.wx || 1); scene.updateMatrixWorld(true);
    ndc.set((x - r.x) / r.w * 2 - 1, -((y - r.y) / r.h * 2 - 1)); ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects([muscle, ctx], false)[0];
    return hit ? (hit.object === muscle ? muscleGeo.userData.grp[hit.face.a] : 0) : null;
  };
  // The line under the open figure: the picked muscle with what the app says about it ("Traps · Elite 5.4",
  // "Quads · 2 days ago") when it passes a label, else just its name.
  const showName = () => { const key = GROUPS[selGroup - 1];
    if (key) { nameEl.textContent = people[open >= 0 ? open : 0]?.labels[key] || LABEL[key]; nameEl.classList.add('on'); } else nameEl.classList.remove('on'); };
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
  const down = (e) => { if (e.button) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, a: angle, last: e.clientX, lt: e.timeStamp, far: 0 }; speed = 0; hold = false; try { canvas.setPointerCapture(e.pointerId); } catch {} kick(); };
  const move = (e) => { if (!drag || drag.id !== e.pointerId) return; drag.far = Math.max(drag.far, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    if (drag.far < 6) return; const k = 0.012 * Math.min(1, 393 / Math.max(393, window.innerWidth * 0.6));
    angle = drag.a + (e.clientX - drag.x) * k; speed = Math.max(-0.3, Math.min(0.3, (e.clientX - drag.last) * k / Math.max(1, e.timeStamp - drag.lt) * 16.7)); drag.last = e.clientX; drag.lt = e.timeStamp; kick(); };
  const up = (e) => { if (!drag || drag.id !== e.pointerId) return; const d = drag; drag = null;
    if (d.far < 6) { speed = 0.0001 * Math.sign(d.a - angle || 1); tap(e); } else if (e.timeStamp - d.lt > 80 || reduced.matches) speed = 0; kick(); };
  const cancel = () => { drag = null; kick(); };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault()); canvas.addEventListener('webglcontextrestored', () => { dirty = true; kick(); });
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
        const pal = [plainC], bulk = [0], def = [1], labels = {};
        for (const g of GROUPS) { const m = (p.muscles || {})[g] || {}, b = bulkOf(m.level); pal.push(m.color ? new THREE.Color(m.color) : plainC); if (m.label) labels[g] = String(m.label); bulk.push(b > 0 ? b * (SHAPE[g] || 1) : b); def.push(defOf(m.level)); }
        // Build: wider for more weight at the same height (BMI), within a calm range.
        const cm = p.heightCm > 0 ? p.heightCm : DEFAULT_CM, bmi = p.kg > 0 ? p.kg / (cm / 100) ** 2 : 23;
        return { id: p.id, name: p.name || '', cm, pal, bulk, def, labels, wx: Math.max(0.9, Math.min(1.12, Math.sqrt(bmi / 23))) };
      });
      ts = people.map((_, i) => ts[i] || 0);
      if (open >= people.length) { open = -1; ts = ts.map(() => 0); if (inOver) settle(); }
      if (open >= 0) whoEl.textContent = people[open].name;
      showName();
      layout(); dirty = true; kick();
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
      if (dead) return; dead = true; cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect();
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onWin); document.removeEventListener('keydown', onKey);
      if (hostEl) hostEl.classList.remove('body3dHost'); canvas.remove(); over.remove();
      muscleMat.dispose(); ctxMat.dispose(); veilMat.dispose(); renderer.dispose(); renderer.forceContextLoss(); // the geometry is shared with other views and stays
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

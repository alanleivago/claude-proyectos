// =====================================================================
//  pieces/airtag/src/people-hd.js — a more detailed pov3d clay person. Redefines buildPerson(o) from
//  styles/scroll3d/people.js (same rig contract: hips = children[0..1] with thigh + knee, userData { torso, head, arms[el],
//  eyes, mouth }). Adds a sculpted head (jaw, nose, ears, lids, eyes with whites, brows, lips), styled hair, a neck,
//  a shaped torso, garments by seed (tee, sweater, shirt, hoodie, jacket), cuffs, a belt, creased trousers,
//  sneakers with soles and laces, hands with a thumb, and per-seed glasses / beard / watch / bag.
//  Geometries are cached per variant and merged per bone + material; materials are shared per colour.
// =====================================================================
const PHD_C = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const PHD_SS = (a, b, x) => { const t = PHD_C((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// vertex colour for a whole geometry (multiplied with a white vertexColors material: one draw call for several colours)
function phdTint(g, c) { const col = Array.isArray(c) ? c : [lin(c).r, lin(c).g, lin(c).b], n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set(col, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function phdMerge(list) {
  const parts = list.map((g) => { g = g.index ? g.toNonIndexed() : g; if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); return g; });
  const out = new THREE.BufferGeometry(), keys = [['position', 3], ['normal', 3], ['uv', 2]];
  if (parts.some((g) => g.attributes.color)) { parts.forEach((g) => g.attributes.color || phdTint(g, [1, 1, 1])); keys.push(['color', 3]); }
  for (const [k, n] of keys) {
    const arr = new Float32Array(parts.reduce((s, g) => s + g.attributes[k].count * n, 0)); let o = 0;
    for (const g of parts) { arr.set(g.attributes[k].array, o); o += g.attributes[k].count * n; }
    out.setAttribute(k, new THREE.BufferAttribute(arr, n));
  }
  return out;
}
const phdLathe = (pts, seg = 16, p0 = 0, pl = TAU) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, p0, pl);
const phdMap = (geo, f) => { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); f(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
// a ray from far out along -dir hits geo: the surface coordinate (z for a front ray, x for a side ray)
function phdHit(geo, from, dir) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), rc = new THREE.Raycaster(from, dir.normalize());
  const h = rc.intersectObject(m)[0]; return h ? h.point : from.clone();
}

// ---- textures (greyscale, multiplied by the material colour)
let PHD_TX = null;
function phdTex() {
  if (PHD_TX) return PHD_TX;
  const mk = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, w, h); draw(x, w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };
  const folds = (x, w, h, R, n = 22) => { for (let i = 0; i < n; i++) { const px = R.r(0, w), ww = R.r(3, 12), g = x.createLinearGradient(px - ww, 0, px + ww, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(0,0,0,${R.r(0.05, 0.14)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - ww, 0, ww * 2, h); }
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(0,0,0,${R.r(0.02, 0.05)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } };
  const line = (x, pts, wd, c) => { x.strokeStyle = c; x.lineWidth = wd; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke(); };
  const seam = (x, pts) => { line(x, pts, 3, 'rgba(0,0,0,0.32)'); line(x, pts.map(([a, b]) => [a + 1.5, b + 1.5]), 1.2, 'rgba(255,255,255,0.35)'); };
  // torso canvas: 512 x 416, x = 256 is the front centre, row = (0.5 - y) / 0.65 * 416 (y in torso space, -0.15 .. 0.5)
  const Y = (y) => ((0.5 - y) / 0.65) * 416, F = 256, S = 470;   // S px per metre across the front
  const band = (x, y0, y1, rib) => { x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, Y(y1), 512, Y(y0) - Y(y1)); seam(x, [[0, Y(y1)], [512, Y(y1)]]);
    if (rib) for (let i = 0; i < 512; i += 5) { x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(i, Y(y1), 2, Y(y0) - Y(y1)); } };
  const sides = (x) => { for (const sx of [128, 384]) line(x, [[sx, 0], [sx, 416]], 2, 'rgba(0,0,0,0.18)'); };
  PHD_TX = {
    tee: mk(512, 416, (x, w, h) => { folds(x, w, h, RNG('phd-tee')); sides(x); band(x, -0.13, -0.105, false); }),
    sweater: mk(512, 416, (x, w, h) => { folds(x, w, h, RNG('phd-sw')); sides(x); band(x, -0.13, -0.08, true); for (let i = 0; i < 512; i += 7) { x.fillStyle = 'rgba(0,0,0,0.05)'; x.fillRect(i, 0, 3, Y(-0.08)); } }),
    shirt: mk(512, 416, (x, w, h) => { folds(x, w, h, RNG('phd-sh')); sides(x);
      seam(x, [[F - 7, Y(0.47)], [F - 7, h]]); seam(x, [[F + 7, Y(0.47)], [F + 7, h]]);
      for (let yy = 0.43; yy > -0.02; yy -= 0.085) { x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.arc(F, Y(yy), 3.6, 0, TAU); x.fill(); x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.arc(F, Y(yy) + 1, 1.4, 0, TAU); x.fill(); }
      const px = F + 0.075 * S; seam(x, [[px - 22, Y(0.355)], [px - 22, Y(0.27)], [px + 22, Y(0.27)], [px + 22, Y(0.355)]]); seam(x, [[px - 22, Y(0.355)], [px + 22, Y(0.355)]]);
      seam(x, [[0, Y(0.4)], [140, Y(0.4)]]); seam(x, [[372, Y(0.4)], [512, Y(0.4)]]); }),
    hoodie: mk(512, 416, (x, w, h) => { folds(x, w, h, RNG('phd-ho')); sides(x); band(x, -0.13, -0.075, true);
      const a = 0.065 * S, b = 0.1 * S; seam(x, [[F - b, Y(-0.06)], [F - a, Y(0.1)], [F + a, Y(0.1)], [F + b, Y(-0.06)]]);
      seam(x, [[F - b, Y(-0.06)], [F - b + 18, Y(0.06)]]); seam(x, [[F + b, Y(-0.06)], [F + b - 18, Y(0.06)]]);
      x.fillStyle = 'rgba(0,0,0,0.16)'; x.beginPath(); x.moveTo(F - b, Y(-0.06)); x.lineTo(F - b + 18, Y(0.06)); x.lineTo(F - b + 26, Y(0.06)); x.lineTo(F - b + 8, Y(-0.06)); x.fill();
      x.beginPath(); x.moveTo(F + b, Y(-0.06)); x.lineTo(F + b - 18, Y(0.06)); x.lineTo(F + b - 26, Y(0.06)); x.lineTo(F + b - 8, Y(-0.06)); x.fill(); }),
    jacket: mk(512, 416, (x, w, h) => { folds(x, w, h, RNG('phd-ja'), 16); sides(x); band(x, -0.13, -0.09, true);
      x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(F - 2.5, 0, 5, h); for (let r = 0; r < h; r += 4) { x.fillStyle = 'rgba(255,255,255,0.45)'; x.fillRect(F - 3.5, r, 7, 1.4); }
      seam(x, [[F - 9, 0], [F - 9, h]]); seam(x, [[F + 9, 0], [F + 9, h]]);
      seam(x, [[0, Y(0.31)], [F - 9, Y(0.31)]]); seam(x, [[F + 9, Y(0.31)], [512, Y(0.31)]]);
      for (const s of [-1, 1]) { const cx = F + s * 0.085 * S; x.fillStyle = 'rgba(0,0,0,0.4)'; x.save(); x.translate(cx, Y(0.06)); x.rotate(s * 0.35); x.fillRect(-3, -24, 6, 48); x.restore(); } }),
    pants: mk(256, 256, (x, w, h) => { folds(x, w, h, RNG('phd-pa'), 18);
      for (const cx of [0, w]) { const g = x.createLinearGradient(cx - 14, 0, cx + 14, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.42, 'rgba(0,0,0,0.12)'); g.addColorStop(0.5, 'rgba(255,255,255,0.4)'); g.addColorStop(0.58, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - 14, 0, 28, h); }
      for (const sx of [64, 192]) line(x, [[sx, 0], [sx, h]], 2, 'rgba(0,0,0,0.2)'); }),
    sleeve: mk(256, 256, (x, w, h) => { folds(x, w, h, RNG('phd-sl'), 14); line(x, [[128, 0], [128, h]], 2, 'rgba(0,0,0,0.18)'); }),
  };
  return PHD_TX;
}

// ---- materials, shared per colour / kind
const PHD_M = new Map();
function phdMat(key, mkm) { let m = PHD_M.get(key); if (!m) { m = mkm(); PHD_M.set(key, m); } return m; }
const phdCloth = (c, tex, dbl = false, k = 1) => phdMat(`c|${c}|${tex}|${dbl}|${k}`, () => new THREE.MeshStandardMaterial({ color: lin(c).multiplyScalar(k), map: phdTex()[tex], roughness: 0.88, side: dbl ? THREE.DoubleSide : THREE.FrontSide }));
const phdPlain = (c, r = 0.85, m = 0) => phdMat(`p|${c}|${r}|${m}`, () => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m }));
const phdSkin = (c) => phdMat(`s|${c}`, () => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.62 }));
const phdHairM = (c) => phdMat(`h|${c}`, () => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.72, }));

// ---- torso: a lathe with a waist, a chest, a flat back, a z-depth that widens to the hips; uv = (around + 0.5, height)
const phdTorsoProf = (fem) => fem
  ? [[0.15, 0.0], [0.142, 0.06], [0.128, 0.13], [0.138, 0.21], [0.158, 0.29], [0.172, 0.36], [0.172, 0.4], [0.158, 0.435], [0.12, 0.46], [0.07, 0.476], [0.001, 0.48]]
  : [[0.15, 0.0], [0.146, 0.06], [0.142, 0.12], [0.155, 0.22], [0.18, 0.32], [0.19, 0.37], [0.184, 0.41], [0.16, 0.44], [0.12, 0.462], [0.07, 0.476], [0.001, 0.48]];
const PHD_HEM = [[0.172, -0.135], [0.171, -0.1], [0.167, -0.03], [0.162, 0.04]];
const phdZF = (y) => 0.62 + 0.13 * PHD_SS(0.14, -0.06, y) + 0.08 * PHD_SS(-0.03, -0.12, y);
function phdTorsoShape(v, fem) {
  const y = v.y, front = v.z > 0 ? 1 : 0; v.z *= phdZF(y); v.x *= (1 + (fem ? 0.08 : 0.11) * PHD_SS(0.24, 0.42, y)) * (1 + 0.06 * PHD_SS(-0.02, -0.11, y));
  if (front) { const ch = Math.exp(-(((y - (fem ? 0.3 : 0.31)) / (fem ? 0.055 : 0.07)) ** 2));
    v.z += fem ? 0.034 * ch * (Math.exp(-(((Math.abs(v.x) - 0.072) / 0.05) ** 2))) * (v.z / 0.11) : 0.012 * ch * PHD_C(v.z / 0.1); }
  else v.z *= lerp(0.94, 1.02, PHD_SS(0.14, 0.04, y));
  return v;
}
function phdUV(geo, wrapFront = true) {   // around: front centre = 0.5; height: torso space -0.15..0.5
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) { const a = wrapFront ? uv.getX(i) + 0.5 : Math.atan2(p.getX(i), p.getZ(i)) / TAU + 0.5; uv.setXY(i, a, (p.getY(i) + 0.15) / 0.65); }
  return geo;
}
let PHD_G = null;
function phdGeo() {
  if (PHD_G) return PHD_G;
  const G = (PHD_G = { torso: {}, head: {}, hair: {}, hand: {}, extra: {} });
  // legs: thigh (+ hip ball), shin (+ knee ball, trouser hem), shoe upper, sole + laces
  G.thigh = phdMerge([pplLathe([[0.001, 0.04], [0.07, 0.03], [0.086, -0.03], [0.085, -0.12], [0.072, -0.3], [0.061, -0.44], [0.001, -0.47]], 16), new THREE.SphereGeometry(0.077, 10, 6)]);
  G.shin = phdMerge([pplLathe([[0.001, 0.02], [0.059, 0.01], [0.058, -0.1], [0.05, -0.26], [0.049, -0.34], [0.055, -0.4], [0.056, -0.405], [0.001, -0.41]], 16), new THREE.SphereGeometry(0.055, 10, 6)]);
  G.upper = phdMap(new THREE.CapsuleGeometry(0.048, 0.125, 3, 10).rotateX(Math.PI / 2), (v) => { v.x *= 1.05; v.y *= 0.72; if (v.z > 0.02) v.y -= 0.18 * (v.z - 0.02) * (v.y > 0 ? 1 : 0); if (v.z < -0.03 && v.y > 0) v.y += 0.012; }).translate(0, -0.41, 0.048);
  G.sole = phdMerge([phdMap(new THREE.CapsuleGeometry(0.053, 0.135, 2, 10).rotateX(Math.PI / 2), (v) => { v.x *= 1.07; v.y = v.y * 0.24; }).translate(0, -0.437, 0.048),
    new THREE.BoxGeometry(0.034, 0.008, 0.07).rotateX(0.32).translate(0, -0.376, 0.075),
    ...[0.058, 0.074, 0.09].map((z) => new THREE.BoxGeometry(0.044, 0.006, 0.007).rotateX(0.32).translate(0, -0.372 - (z - 0.075) * 0.33, z))]);
  G.hips = new THREE.CylinderGeometry(0.155, 0.165, 0.2, 18).scale(1, 1, 0.7);
  G.belt = new THREE.CylinderGeometry(0.159, 0.161, 0.036, 20, 1, true).scale(1, 1, 0.74);
  G.buckle = new THREE.BoxGeometry(0.038, 0.03, 0.008);
  // arms: shoulder ball + upper arm (sleeve), short sleeve shell, forearm (+ elbow ball, cuff), hand (palm, fingers, thumb)
  G.deltoid = new THREE.SphereGeometry(0.053, 12, 8).scale(1, 1.15, 0.95).translate(0, -0.042, 0);
  G.uarm = pplLathe([[0.001, 0.0], [0.05, -0.01], [0.056, -0.06], [0.055, -0.12], [0.046, -0.27], [0.001, -0.3]], 14);
  G.sleeveL = phdMerge([G.deltoid, G.uarm]);
  G.sleeveS = phdMerge([G.deltoid, phdLathe([[0.001, 0.02], [0.06, 0.0], [0.066, -0.06], [0.064, -0.14], [0.058, -0.148], [0.001, -0.15]].reverse(), 14)]);
  G.farmBare = phdMerge([pplLathe([[0.001, 0.012], [0.036, 0.004], [0.043, -0.03], [0.04, -0.12], [0.031, -0.24], [0.029, -0.26], [0.001, -0.262]], 12), new THREE.SphereGeometry(0.04, 8, 6)]);
  G.farmL = phdMerge([pplLathe([[0.001, 0.012], [0.038, 0.004], [0.046, -0.03], [0.043, -0.12], [0.038, -0.2], [0.001, -0.21]], 12), new THREE.SphereGeometry(0.043, 8, 6),
    phdLathe([[0.0, -0.245], [0.037, -0.245], [0.041, -0.24], [0.041, -0.205], [0.039, -0.195]], 12)]);
  G.watch = phdMerge([new THREE.CylinderGeometry(0.034, 0.034, 0.016, 14, 1, true).translate(0, -0.232, 0), new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12).rotateZ(Math.PI / 2).translate(-0.034, -0.232, 0)]);
  for (const s of [-1, 1]) G.hand[s] = phdMerge([
    new THREE.SphereGeometry(0.034, 10, 7).scale(0.62, 1.05, 1.12).translate(0, -0.283, 0),
    phdMap(new THREE.CapsuleGeometry(0.019, 0.045, 3, 8), (v) => { v.z *= 1.85; v.x *= 0.85; const t = PHD_C(-v.y / 0.04 + 0.5); v.x += -s * 0.012 * t * t; }).translate(-s * 0.002, -0.338, -0.004),
    new THREE.CapsuleGeometry(0.0105, 0.032, 2, 6).rotateX(-0.55).rotateZ(-s * 0.35).translate(-s * 0.012, -0.292, 0.036)]);
  // the neck
  G.neck = pplLathe([[0.056, 0.43], [0.05, 0.47], [0.046, 0.53], [0.045, 0.59], [0.001, 0.6]], 14);
  return G;
}
function phdTorsoGeo(fem, untuck) {
  const G = phdGeo(), k = `${fem}|${untuck}`; if (G.torso[k]) return G.torso[k];
  const prof = phdTorsoProf(fem).filter(([, y]) => !untuck || y > 0.05); prof.unshift(...(untuck ? [[0.001, -0.135], ...PHD_HEM] : [[0.001, -0.02]]));
  const geo = phdUV(phdMap(pplLathe(prof, 22), (v) => phdTorsoShape(v, fem)));
  return (G.torso[k] = geo);
}
// a panel that hugs the torso: same profile, offset dr, between y0..y1 and around phi in [-ph, ph] (front centred)
function phdPanel(fem, y0, y1, ph, dr) {
  const prof = phdTorsoProf(fem), rAt = (y) => { const p = [...PHD_HEM, ...prof.filter(([, y]) => y > 0.05)]; for (let i = 0; i < p.length - 1; i++) if (y >= p[i][1] && y <= p[i + 1][1]) return lerp(p[i][0], p[i + 1][0], (y - p[i][1]) / (p[i + 1][1] - p[i][1])); return 0.15; };
  const pts = []; for (let i = 0; i <= 6; i++) { const y = lerp(y0, y1, i / 6); pts.push([rAt(y) + dr, y]); }
  return phdUV(phdMap(phdLathe(pts, 10, -ph, 2 * ph), (v) => phdTorsoShape(v, fem)), false);
}
// collars and hoods (torso space)
function phdExtra(kind, fem) {
  const G = phdGeo(), k = `${kind}|${fem}`; if (G.extra[k]) return G.extra[k];
  const tg = phdTorsoGeo(fem, true), fz = (x, y) => phdHit(tg, V3(x, y, 1), V3(0, 0, -1)).z;
  let geo;
  if (kind === 'tee') geo = new THREE.TorusGeometry(0.061, 0.0115, 6, 22).rotateX(Math.PI / 2).scale(1, 1, 0.9).translate(0, 0.474, 0.004);
  else if (kind === 'sweater') geo = new THREE.TorusGeometry(0.062, 0.016, 6, 22).rotateX(Math.PI / 2).scale(1, 1.1, 0.9).translate(0, 0.474, 0.004);
  else if (kind === 'shirt') geo = phdLathe([[0.054, 0.462], [0.057, 0.52], [0.064, 0.528], [0.1, 0.474], [0.112, 0.462]], 18, 0.42, TAU - 0.84).scale(1, 1, 0.86);
  else if (kind === 'jacket') geo = phdMerge([phdLathe([[0.06, 0.45], [0.062, 0.535], [0.07, 0.54], [0.08, 0.52], [0.082, 0.455]], 18, 0.1, TAU - 0.2).scale(1, 1, 0.86)]);
  else if (kind === 'hoodie') geo = phdMerge([
    new THREE.TorusGeometry(0.09, 0.03, 8, 20, Math.PI * 1.0).rotateZ(-Math.PI * 0.5 - Math.PI / 2).scale(1, 0.8, 1).rotateX(Math.PI / 2).scale(1, 1, 0.92).translate(0, 0.478, 0),
    new THREE.SphereGeometry(0.1, 14, 10).scale(1.05, 0.72, 0.5).translate(0, 0.43, -0.105)]);
  G.extra[k] = geo;
  // small hardware: hoodie strings, jacket zip pull, belt buckle position
  G.extra[k + '|hw'] = kind === 'hoodie' ? phdMerge([-1, 1].map((s) => new THREE.CylinderGeometry(0.0042, 0.0042, 0.12, 5).translate(0, -0.06, 0).rotateZ(s * 0.05).translate(s * 0.032, 0.452, fz(s * 0.032, 0.39) + 0.006)))
    : kind === 'jacket' ? new THREE.BoxGeometry(0.009, 0.026, 0.005).translate(0, 0.43, fz(0, 0.43) + 0.004) : null;
  if (kind === 'hoodie') G.extra[k + '|pocket'] = phdPanel(fem, -0.065, 0.105, 0.52, 0.007);
  return geo;
}
// a cross-body strap: a tube that hugs the torso along a ring tilted from the left shoulder to the right hip
function phdStrap(fem) {
  const G = phdGeo(), k = `strap|${fem}`; if (G.extra[k]) return G.extra[k];
  const tg = phdTorsoGeo(fem, true), c = V3(0, 0.2, 0), e1 = V3(Math.cos(0.72), -Math.sin(0.72), 0), e2 = V3(0, 0, 1), pts = [];
  for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU, d = e1.clone().multiplyScalar(Math.cos(a)).add(e2.clone().multiplyScalar(Math.sin(a))).normalize();
    pts.push(phdHit(tg, c.clone().addScaledVector(d, 1), d.clone().negate()).addScaledVector(d, 0.01)); }
  return (G.extra[k] = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 56, 0.0085, 4, true));
}
// ---- head: sculpted skull (jaw, cheeks, sockets, brow ridge), features placed by raycast
function phdSkull(v, fem) {
  const r = 0.11, yn = v.y / r;
  v.x *= 0.9; v.y *= 1.08; if (v.z < 0) v.z *= 1.07;
  const jaw = PHD_SS(-0.05, -0.95, yn); v.x *= 1 - (fem ? 0.3 : 0.24) * jaw;
  if (v.z > 0) { v.z += (fem ? 0.008 : 0.013) * jaw * PHD_C(v.z / 0.09) * (1 - PHD_SS(0.0, 0.05, Math.abs(v.x)) * 0.4); v.x *= 1 + 0.035 * Math.exp(-(((yn + 0.05) / 0.25) ** 2)); }
  if (yn < -0.75) v.y += (-0.75 - yn) * r * 0.25;   // flatter under the chin
  if (v.z > 0.05) { const d = Math.hypot(Math.abs(v.x) - 0.037, v.y - 0.012); v.z -= 0.007 * Math.exp(-((d / 0.017) ** 2)); v.z += 0.004 * Math.exp(-(((v.y - 0.036) / 0.011) ** 2)) * PHD_SS(0.075, 0.03, Math.abs(v.x)); }
  return v;
}
function phdHead(fem) {
  const G = phdGeo(), k = `${fem}`; if (G.head[k]) return G.head[k];
  const skull = phdMap(new THREE.SphereGeometry(0.11, 26, 18), (v) => phdSkull(v, fem));
  const fz = (x, y) => phdHit(skull, V3(x, y, 1), V3(0, 0, -1)).z, fx = (y, z) => phdHit(skull, V3(1, y, z), V3(-1, 0, 0)).x;
  const eY = 0.012, eX = 0.037, eZ = fz(eX, eY) - 0.0035, mY = -0.05, mZ = fz(0, mY);
  const H = { eY, eZ, mY, mZ, skullRaw: skull };
  const lid = (s) => new THREE.SphereGeometry(0.0168, 10, 4, 0, TAU, 0, Math.PI * 0.4).scale(1.22, 0.92, 0.66).rotateX(-0.1).translate(s * eX, eY + 0.001, eZ + 0.001);
  const ear = (s) => phdMerge([new THREE.SphereGeometry(0.027, 8, 6).scale(0.34, 1, 0.66), new THREE.TorusGeometry(0.017, 0.0045, 3, 8).rotateY(Math.PI / 2).scale(1, 1.25, 0.8).translate(s * 0.005, 0.002, 0)])
    .rotateY(s * 0.3).translate(s * (fx(0.0, -0.012) - 0.003), 0.004, -0.012);
  const nose = phdMerge([new THREE.SphereGeometry(0.0115, 8, 6).scale(0.95, 2.5, 1.1).rotateX(-0.3).translate(0, -0.006, fz(0, -0.006) + 0.001),
    new THREE.SphereGeometry(0.0138, 8, 6).scale(1.1, 0.88, 1).translate(0, -0.026, fz(0, -0.026) + 0.009),
    ...[-1, 1].map((s) => new THREE.SphereGeometry(0.0088, 6, 4).translate(s * 0.0125, -0.029, fz(s * 0.0125, -0.029) + 0.002))]);
  H.lips = phdMerge([new THREE.CapsuleGeometry(0.0052, 0.024, 2, 6).rotateZ(Math.PI / 2).scale(1, 0.85, 0.7).translate(0, mY + 0.0068, mZ + 0.0015),
    new THREE.CapsuleGeometry(0.0062, 0.019, 2, 6).rotateZ(Math.PI / 2).scale(1, 0.85, 0.75).translate(0, mY - 0.0078, mZ + 0.0005)]);
  H.skin = phdMerge([skull, nose, lid(-1), lid(1), ...(fem ? [] : [ear(-1), ear(1)]), phdTint(H.lips, [1.0, 0.6, 0.56])].map((g) => g.clone().translate(0, 0.1, 0)));
  const whites = phdMerge([-1, 1].flatMap((s) => [new THREE.SphereGeometry(0.0155, 10, 7).scale(1.2, 0.9, 0.55).translate(s * eX, 0, eZ), new THREE.SphereGeometry(0.0021, 5, 3).translate(s * eX + 0.003, 0.003, eZ + 0.0117)]));
  const iris = phdMerge([-1, 1].map((s) => new THREE.SphereGeometry(0.0102, 10, 6).scale(1, 1.04, 0.42).translate(s * eX + s * 0.0012, -0.0005, eZ + 0.0072)));
  H.eyeG = {}; H.eyes = (c) => H.eyeG[c] ?? (H.eyeG[c] = phdMerge([phdTint(whites.clone(), '#f4f1ec'), phdTint(iris.clone(), c)]));
  H.mouth = new THREE.SphereGeometry(0.0125, 12, 6).scale(1.45, 0.34, 0.5);
  H.browG = {}; H.brows = (lift) => H.browG[lift] ?? (H.browG[lift] = phdMerge([-1, 1].map((s) => new THREE.CapsuleGeometry(0.0046, 0.03, 2, 5).rotateZ(Math.PI / 2 - s * 0.12).scale(1, 0.8, 0.75).translate(s * 0.038, eY + 0.027 + lift, fz(s * 0.038, eY + 0.027 + lift) + 0.0015))));
  const gx = fx(eY, 0.035) + 0.006, gz = eZ + 0.016;
  H.glasses = phdMerge([...[-1, 1].map((s) => new THREE.TorusGeometry(0.0195, 0.0028, 3, 14).scale(1.18, 0.88, 1).translate(s * (eX + 0.003), eY - 0.001, gz)),
    new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 4).rotateZ(Math.PI / 2).translate(0, eY + 0.004, gz + 0.002),
    ...[-1, 1].map((s) => new THREE.BoxGeometry(0.003, 0.004, gz + 0.025).translate(s * gx, eY + 0.003, (gz - 0.025) / 2))].map((g) => g.translate(0, 0.1, 0)));
  return (G.head[k] = H);
}
// hair: the skull pushed out where the mask says hair, sunk inside it where not (soft hairline); + drapes / ponytail
function phdHairGeo(style, fem) {
  const G = phdGeo(), k = `${style}|${fem}`; if (G.hair[k]) return G.hair[k];
  const long = ['bob', 'long', 'pony', 'bun'].includes(style);
  const hl = style === 'fringe' ? () => 0.2 : style === 'part' ? (nx) => 0.42 - 0.2 * nx : style === 'buzz' ? () => 0.44 : style === 'curly' ? () => 0.4 : long ? (nx) => 0.36 - 0.12 * Math.abs(nx) : () => 0.4;
  const geo = new THREE.SphereGeometry(0.11, 30, 20), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize(), ax = Math.abs(n.x);
    const face = PHD_SS(0.0, 0.32, n.z) * PHD_SS(hl(n.x) + 0.05, hl(n.x) - 0.06, n.y);
    const ear = long ? 0 : PHD_SS(0.52, 0.72, ax) * PHD_SS(0.12, -0.02, n.y) * PHD_SS(-0.55, -0.3, n.z);
    const nape = PHD_SS(long ? -0.82 : -0.5, long ? -0.68 : -0.36, n.y);
    const m = (1 - face) * (1 - ear) * nape;
    let out = style === 'buzz' ? 1.03 : 1.065 + 0.035 * PHD_C(n.y) * (style === 'curly' ? 1.6 : 1) + (style === 'part' ? 0.012 * PHD_C(n.x + 0.3) * PHD_C(n.y) : 0);
    if (style === 'curly') out += 0.022 * (Math.sin(n.x * 23) * Math.sin(n.y * 21 + 1) * Math.sin(n.z * 19 + 2));
    if (style === 'fringe' && n.z > 0.3 && n.y > 0.1) out += 0.012;
    v.multiplyScalar(lerp(0.9, out, m)); phdSkull(v, fem); if (style === 'fringe' || style === 'part') v.z += 0.004 * m * PHD_C(n.z);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const parts = [geo];
  if (style === 'bob' || style === 'long') { const L = style === 'long';
    parts.push(phdLathe(L ? [[0.108, 0.07], [0.121, 0.0], [0.122, -0.08], [0.118, -0.2], [0.11, -0.27], [0.1, -0.275], [0.1, -0.2], [0.1, -0.06]].reverse() : [[0.108, 0.07], [0.123, 0.0], [0.126, -0.06], [0.124, -0.1], [0.11, -0.112], [0.104, -0.09], [0.1, -0.02]].reverse(),
      20, L ? Math.PI * 0.55 : Math.PI * 0.32, L ? Math.PI * 0.9 : Math.PI * 1.36).scale(0.93, 1, 1.02).translate(0, 0, -0.008)); }
  if (style === 'pony') parts.push(new THREE.SphereGeometry(0.036, 12, 10).scale(1, 2.6, 1).rotateX(0.5).translate(0, -0.035, -0.152), new THREE.TorusGeometry(0.018, 0.007, 5, 12).rotateX(Math.PI / 2 + 0.5).translate(0, 0.045, -0.128));
  if (style === 'bun') parts.push(new THREE.SphereGeometry(0.046, 14, 10).scale(1, 0.9, 1).translate(0, 0.075, -0.115));
  return (G.hair[k] = phdMerge(parts.map((g) => g.translate(0, 0.1, 0))));
}
function phdBeard(fem) {
  const G = phdGeo(), k = `beard|${fem}`; if (G.hair[k]) return G.hair[k];
  const geo = new THREE.SphereGeometry(0.11, 24, 18), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize(), ax = Math.abs(n.x), yb = -0.33 + 0.36 * PHD_SS(0.3, 0.92, ax);
    let m = PHD_SS(yb + 0.04, yb - 0.04, n.y) * PHD_SS(-0.4, -0.15, n.z);
    m = Math.max(m, PHD_SS(0.32, 0.22, ax) * PHD_SS(-0.36, -0.31, n.y) * PHD_SS(-0.2, -0.25, n.y) * PHD_SS(0.4, 0.6, n.z));   // moustache
    m *= 1 - PHD_SS(0.3, 0.2, ax) * PHD_SS(-0.36, -0.4, n.y) * PHD_SS(-0.58, -0.53, n.y) * PHD_SS(0.3, 0.5, n.z);           // mouth hole
    v.multiplyScalar(lerp(0.9, 1.045, m)); phdSkull(v, fem); p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return (G.hair[k] = geo.translate(0, 0.1, 0));
}

function buildPerson(o = {}) {
  const G = phdGeo(), R = RNG('ppl-hd', o.shirt, o.pants, o.skin, o.hair, !!o.longHair, !!o.short, o.shoe, !!o.kid);
  const fem = !!o.longHair, shirtC = o.shirt ?? '#2f6fd1', pantsC = o.pants ?? '#2b3a55', skinC = o.skin ?? '#d4a07a', hairC = o.hair ?? '#2a1d16';
  const kind = o.short ? (R.f() < 0.75 ? 'tee' : 'shirt') : R.pick(['hoodie', 'hoodie', 'jacket', 'jacket', 'shirt', 'sweater']), untuck = kind !== 'shirt';
  const style = fem ? R.pick(['bob', 'long', 'pony', 'bun', 'long']) : R.pick(['part', 'fringe', 'buzz', 'curly', 'part']);
  const glasses = R.f() < 0.22, beard = !fem && style !== 'curly' && R.f() < 0.3, watch = R.f() < 0.4, bag = R.f(), shoeC = o.shoe ?? R.pick(['#1e1e22', '#f1f1ee', '#2c3e66', '#6b4a32', '#1e1e22', '#9a9fa8']);
  const skin = phdSkin(skinC), hairM = phdHairM(hairC), pants = phdCloth(pantsC, 'pants'), shirt = phdCloth(shirtC, kind === 'tee' || kind === 'sweater' || kind === 'shirt' || kind === 'hoodie' || kind === 'jacket' ? kind : 'tee');
  const sleeve = phdCloth(shirtC, 'sleeve'), trim = phdCloth(shirtC, 'sleeve', false, 0.82), white = phdPlain('#f1f0ea', 0.7), dark = phdPlain('#1b1a1d', 0.5);
  const soleC = shoeC === '#f1f1ee' ? '#d9d6cf' : shoeC === '#6b4a32' ? '#2a2220' : '#f1f0ea', shoeM = phdMat('shoe', () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, vertexColors: true }));
  const shoeG = (G.shoeG ??= {})[shoeC] ??= phdMerge([phdTint(G.upper.clone(), shoeC), phdTint(G.sole.clone(), soleC)]);
  const P = (geo, m, x = 0, y = 0, z = 0, sh = true) => { const q = new THREE.Mesh(geo, m); q.position.set(x, y, z); q.castShadow = sh; q.receiveShadow = true; return q; };
  const g = new THREE.Group(), hipY = 0.9, sit = !!o.seated;
  for (const s of [-1, 1]) {   // legs: hip → knee → foot (seated: thighs forward, shins down)
    const hip = new THREE.Group(); hip.position.set(s * 0.09, hipY, 0); if (sit) hip.rotation.x = -Math.PI / 2; g.add(hip); hip.add(P(G.thigh, pants));
    const knee = new THREE.Group(); knee.position.y = -0.45; if (sit) knee.rotation.x = Math.PI / 2; hip.add(knee);
    knee.add(P(G.shin, pants)); knee.add(P(shoeG, shoeM, 0, 0, 0, false));
  }
  g.add(P(G.hips, pants, 0, hipY + 0.02, 0));
  const torso = new THREE.Group(); torso.position.y = hipY + 0.08; torso.userData.y0 = hipY + 0.08; g.add(torso);
  torso.add(P(phdTorsoGeo(fem, untuck), shirt)); torso.add(P(G.neck, skin, 0, 0, 0, false));
  torso.add(P(phdExtra(kind, fem), kind === 'shirt' || kind === 'jacket' ? phdCloth(shirtC, 'sleeve', true) : trim, 0, 0, 0, kind === 'hoodie'));
  const hw = G.extra[`${kind}|${fem}|hw`]; if (hw) torso.add(P(hw, kind === 'hoodie' ? white : phdPlain('#c9ccd2', 0.35, 0.8), 0, 0, 0, false));
  const pocket = G.extra[`${kind}|${fem}|pocket`]; if (pocket) torso.add(P(pocket, shirt, 0, 0, 0, false));
  if (!untuck) { const bz = phdHit(G.belt, V3(0, 0, 1), V3(0, 0, -1)).z; torso.add(P(G.belt, phdPlain(R.pick(['#2a1f1a', '#1c1c1e', '#5a3a24']), 0.6), 0, 0.005, 0, false)); torso.add(P(G.buckle, phdPlain('#c9ccd2', 0.35, 0.8), 0, 0.005, bz + 0.003, false)); }
  if (bag < 0.22) {   // cross-body bag: strap from the left shoulder to a pouch on the right hip
    const bm = phdPlain(R.pick(['#2a2622', '#3a2c22', '#20242c']), 0.75);
    torso.add(P(phdStrap(fem), bm, 0, 0, 0, false)); torso.add(P(new THREE.BoxGeometry(0.15, 0.11, 0.05), bm, 0.15, 0.0, 0.1));
  } else if (bag < 0.4) {   // backpack
    const bm = phdPlain(R.pick(['#2a2622', '#20242c', '#3c4a3a', '#5a2a2a']), 0.8);
    torso.add(P(new THREE.CapsuleGeometry(0.11, 0.18, 4, 10).scale(1.15, 1, 0.58), bm, 0, 0.22, -0.16));
    for (const s of [-1, 1]) torso.add(P(new THREE.TorusGeometry(0.1, 0.012, 4, 14, Math.PI * 1.1).rotateY(Math.PI / 2).scale(1, 1.6, 1.25).translate(s * 0.115, 0.3, -0.01), bm, 0, 0, 0, false));
  }
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.2, 0.42, 0); torso.add(sh);
    if (o.short) { sh.add(P(G.uarm, skin, 0, 0, 0, false)); sh.add(P(G.sleeveS, sleeve)); } else sh.add(P(G.sleeveL, sleeve));
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el); sh.userData.el = el;
    el.add(P(o.short ? G.farmBare : G.farmL, o.short ? skin : sleeve)); el.add(P(G.hand[s], skin, 0, 0, 0, false));
    if (watch && s === -1 && o.short) el.add(P(G.watch, dark, 0, 0, 0, false));
    return sh;
  });
  const head = new THREE.Group(); head.position.set(0, 0.56, 0); torso.add(head);
  const H = phdHead(fem);
  head.add(P(H.skin, phdMat(`sv|${skinC}`, () => new THREE.MeshStandardMaterial({ color: lin(skinC), roughness: 0.62, vertexColors: true }))));
  const hk = `all|${style}|${fem}|${beard}`; G.hair[hk] ??= phdMerge([phdHairGeo(style, fem), H.brows(fem ? 0.003 : 0).clone().translate(0, 0.1, 0), ...(beard ? [phdBeard(fem)] : [])]);
  head.add(P(G.hair[hk], hairM));
  if (glasses) head.add(P(H.glasses, dark, 0, 0, 0, false));
  const eyes = [P(H.eyes(R.pick(['#3a2516', '#2a1a10', '#4a6a7a', '#3e5a2e', '#1a1210'])), phdMat('eyes', () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, vertexColors: true })), 0, 0.1 + H.eY, 0, false)];
  eyes.forEach((e) => head.add(e));
  const mouth = P(H.mouth, phdPlain('#3e1714', 0.6), 0, 0.1 + H.mY, H.mZ - 0.003, false); head.add(mouth);
  if (sit) g.position.y = -0.45 + 0.02;   // seated: the hips sit at the chair height (feet on the floor)
  g.userData = { torso, head, arms, eyes, mouth };
  if (o.kid) g.scale.setScalar(0.7);
  return g;
}

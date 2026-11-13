// =====================================================================
//  SHARED SHOT HELPERS (lost-luggage, from guinea-rent): snap camera keys measured once per shot, toon people + the
//  rattlesnake (styles/cartoon3d/toon.js + toon-pets.js), 3D suitcases + grips, pop-up labels, redraw-on-change canvases.
// =====================================================================
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const spanOf = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// the first time word w is spoken at or after t0 (common words repeat)
const wAfter = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 - 0.01 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
// camera: SNAPS (hold, then snap to what the voice names) or the plain framing while the snap keys are being measured
// v2 (Ricks study, fuentes/cartoon3d/ricks-documentos-camara.md): the camera never holds — the framings change on the words
// with a 0.45 s eased move (not a 5-frame snap), and on top every shot pushes in (~10-20 %/s), orbits and cranes a little.
// CAMF[id] = { push (1/s), orbit (rad/s), crane (units/s), roll (deg/s) } overrides the defaults.
const CAMF = {}, CAM_EASE = 0.34;
function camMove(K, lt, id) {
  const free = SNAPS[id] === 'free';   // no framings: the shot's own camera + the drift
  if (!free && !(C3_SNAP && SNAPS[id] && !SNAP_BUILD)) { const c = c3CamAt(K, lt); return { p: c.p, l: c.l, fov: c.fov }; }
  const c = free ? c3CamAt(K, lt) : c3SnapCam(snapKeys(id, K), lt, CAM_EASE), i = SHOT_LIST.findIndex((r) => r[0] === id), F = Object.assign({ push: 0.13, orbit: (i % 2 ? 1 : -1) * 0.05, crane: 0.12, roll: 0 }, CAMF[id] || {});
  const P = V3(...c.p), L = V3(...c.l), off = P.clone().sub(L).applyAxisAngle(V3(0, 1, 0), F.orbit * lt).multiplyScalar(Math.exp(-F.push * lt));
  const p = L.clone().add(off); p.y += F.crane * lt; return { p: p.toArray(), l: c.l, fov: c.fov, roll: F.roll * lt * Math.PI / 180 };
}
// the snap keys of a shot, measured ONCE with the shot posed at each key's own time (a dry run): no jitter from moving arms.
// A mid-hold punch-in (+18 %, same subject) only where the hold is > 1.2 s.
let SNAP_BUILD = false; const SNAP_KEYS = {};
function snapKeys(id, K) {
  if (SNAP_KEYS[id]) return SNAP_KEYS[id];
  const c = c3CamAt(K, 0), dir = V3(...c.l).sub(V3(...c.p)), i = SHOT_LIST.findIndex((r) => r[0] === id), [t0, end] = shotSpan(i), S = SNAPS[id], keys = [];
  const boxAt = (t, tg) => { const keep = [C3_DRY, CUR_SHOT, TT]; SNAP_BUILD = true; C3_DRY = true; CUR_SHOT = id; TT = t;
    try { SHOT_FN[id](t, clamp((t - t0) / (end - t0)), t - t0); return snapBox(id, tg); } finally { SNAP_BUILD = false; [C3_DRY, CUR_SHOT, TT] = keep; } };
  S.forEach(([t, tg, fill], j) => { const t1 = j + 1 < S.length ? S[j + 1][0] : end, box = boxAt(Math.min(t + 0.25, t1 - 0.05), tg);
    keys.push([Math.max(0, t - t0), ...c3FrameBox(box, dir, fill, c.fov)]);
  });
  return (SNAP_KEYS[id] = keys);
}
// the world box of a snap target: [x, y, z, w, h, d] boxes, 'p:who' (a person / pet, whole), 'u:who' (head + torso),
// 'o:name' (a set mesh). Toon cards are mostly empty canvas, so people and pets get their drawn size, not the card's.
function snapBox(id, tg) {
  const set = SHOT_LIST.find((r) => r[0] === id)[2], s = SETS[set] && SETS[set](), B = new THREE.Box3();
  for (const x of tg) {
    if (Array.isArray(x)) { B.union(new THREE.Box3().setFromCenterAndSize(V3(x[0], x[1], x[2]), V3(x[3], x[4], x[5] ?? 0.5))); continue; }
    const [k, n] = x.split(':');
    if (k === 'o') { const o = s && s[n]; if (!o) continue; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); if (!b.isEmpty()) B.union(b); continue; }
    const p = s && s.p && s.p[n]; if (!p || !p.g.visible) continue; const w = p.g.getWorldPosition(V3(0, 0, 0)), b = new THREE.Box3();
    if (p.pet) { const sz = p.petSize ?? 1; b.setFromCenterAndSize(V3(w.x, w.y + 0.85 * sz + (p.lift || 0), w.z), V3(2.6 * sz, 1.9 * sz, 1)); }
    else { const h = (p.sitting ? 0.78 : 1) * c3ToonDims(p).height + 0.5; b.setFromCenterAndSize(V3(w.x, h / 2, w.z), V3(4.6, h, 1)); if (k === 'u') b.min.y = b.max.y - h * 0.48; }
    B.union(b);
  }
  return B.isEmpty() ? new THREE.Box3().setFromCenterAndSize(V3(0, 8, 20), V3(10, 10, 1)) : B;
}
const SETS = {};   // set name -> getter (registered by each set file)
// ---- people + pets
// facing from a world-space motion direction, seen from the camera: front 0, 3/4 ±1, profile ±2, 'back'; + = screen right
function toonFacing(cam, x, z, vx, vz) {
  const c = new THREE.Vector3(cam.position.x - x, 0, cam.position.z - z).normalize(), r = new THREE.Vector3(c.z, 0, -c.x), l = Math.hypot(vx, vz) || 1;
  const toward = (vx * c.x + vz * c.z) / l, across = (vx * r.x + vz * r.z) / l, th = Math.atan2(Math.abs(across), toward);
  return th > 2.5 ? 'back' : Math.sign(across || 1) * Math.min(2, th * 4 / Math.PI);
}
// the facing that looks from (x, z) toward the world point (tx, tz)
const faceTo = (cam, x, z, tx, tz) => toonFacing(cam, x, z, tx - x, tz - z);
// the cast: role costumes, hair + colours not used in earlier pieces (guinea-rent, lost-luggage)
// v3 piece-local hairstyles (review: the bald inmate's side tufts read as earmuffs; the ponytail's ink part read as a dark
// mark on the kid's brow): a clean shaved head and the ponytail without the part line
T3_HSTYLE.bald2 = Object.assign({}, T3_HSTYLE.bald, { cres: [[176, 184], [-4, 4]] });
T3_HSTYLE.ponytail2 = Object.assign({}, T3_HSTYLE.ponytail); for (const k of ['part', 'whorl', 'tie', 'fly']) delete T3_HSTYLE.ponytail2[k];
T3_HSTYLE.topknot2 = Object.assign({}, T3_HSTYLE.topknot); delete T3_HSTYLE.topknot2.pin;   // v3: the hair pin read as a floating antenna on the village kid
// nvidia-huang: a black LEATHER JACKET outfit (piece-local; the kit has none): biker collar, asymmetric silver zip, black tee,
// zip pockets, seams and soft specular streaks so it reads as leather in every shot (the closing gag hangs it on the mic stand)
T3_OUTFIT.leather = { main: '#1c1c24', shirt: '#2c2c34', zip: '#c8ccd4' };
{ const base = t3Clothes;
  t3Clothes = function (g, kind, C, x0, top, bot, tw, o, back) {
    if (kind !== 'leather') return base(g, kind, C, x0, top, bot, tw, o, back);
    const h = bot - top, R = (pts, fill, w = 2.2) => { t3Path(g, pts); g.fillStyle = fill; g.fill(); if (w) { g.lineWidth = w; g.strokeStyle = T3.ink; g.stroke(); } };
    g.fillStyle = C.main; g.fillRect(x0 - tw * 2, top - 20, tw * 4, h + 40);
    if (!back) {
      R([[x0 - 0.3 * tw, top - 6], [x0 + 0.3 * tw, top - 6], [x0 + 0.06 * tw, top + 0.62 * h], [x0 - 0.12 * tw, top + 0.6 * h]], C.shirt, 0);   // the black tee in the open front
      for (const sd of [-1, 1]) R([[x0 + sd * 0.3 * tw, top - 8], [x0 + sd * 0.74 * tw, top - 2], [x0 + sd * 0.62 * tw, top + 0.2 * h], [x0 + sd * 0.12 * tw, top + 0.5 * h], [x0 + sd * 0.22 * tw, top + 0.12 * h]], '#3e3e4c', 1.8);   // wide biker lapels
      t3Stroke(g, [[x0 + 0.18 * tw, top + 0.08 * h], [x0 + 0.1 * tw, top + 0.5 * h], [x0 + 0.06 * tw, bot + 10]], 2.6, C.zip);   // the off-centre zip
      for (let i = 0; i < 9; i++) { const y = top + (0.52 + i * 0.06) * h; t3Stroke(g, [[x0 + 0.03 * tw, y], [x0 + 0.1 * tw, y]], 1.2, t3Mul(C.zip, 0.7)); }
      for (const sd of [-1, 1]) { t3Stroke(g, [[x0 + sd * 0.34 * tw, top + 0.58 * h], [x0 + sd * 0.62 * tw, top + 0.52 * h]], 2.2, C.zip); g.beginPath(); g.arc(x0 + sd * 0.64 * tw, top + 0.52 * h, 2.4, 0, TAU); g.fillStyle = C.zip; g.fill(); }   // zip pockets
      for (const sd of [-1, 1]) { g.save(); g.globalAlpha = 0.5; t3Stroke(g, [[x0 + sd * 0.5 * tw, top + 0.2 * h], [x0 + sd * 0.46 * tw, bot + 10]], 1.4, t3Mul(C.main, 0.5)); g.restore(); }   // seams
      R([[x0 - 0.9 * tw, bot - 0.08 * h], [x0 + 0.9 * tw, bot - 0.08 * h], [x0 + 0.9 * tw, bot + 12], [x0 - 0.9 * tw, bot + 12]], t3Mul(C.main, 1.25), 1.6);   // waistband
    } else { t3Stroke(g, [[x0, top], [x0, bot + 10]], 1.4, t3Mul(C.main, 0.5)); R([[x0 - 0.9 * tw, bot - 0.08 * h], [x0 + 0.9 * tw, bot - 0.08 * h], [x0 + 0.9 * tw, bot + 12], [x0 - 0.9 * tw, bot + 12]], t3Mul(C.main, 1.25), 1.6); }
    g.save(); g.globalAlpha = 0; g.lineCap = 'round';   // leather shine OFF (reviews read the streaks as a glass quad; the stage glint on 'jacket' does the shine) (v1 review: 0.22 read as a milky veil): soft vertical streaks catching the light
    for (const [dx, a0, a1, wd] of [[-0.62, 0.18, 0.7, 9], [-0.44, 0.3, 0.55, 4], [0.5, 0.25, 0.62, 7]]) { g.strokeStyle = '#d8e0ff'; g.lineWidth = wd; g.beginPath(); g.moveTo(x0 + dx * tw, top + a0 * h); g.lineTo(x0 + (dx + 0.04) * tw, top + a1 * h); g.stroke(); }
    g.restore();
  }; }
const CAST = {   // nvidia-huang. Real person caricatured: ONLY Huang. Every other face is invented and distinct (set files add their extras).
  huang: { key: 'huang', hair: 'side', hairColor: '#b8b6b4', outfit: 'leather', colors: { main: '#1c1c24', shirt: '#2c2c34', zip: '#c8ccd4' }, glasses: true, skin: 'white', body: 'avg' },   // grey swept hair, glasses, black leather jacket
  intern: { key: 'intern', hair: 'messy', hairColor: 'chestnut', outfit: 'hoodie', colors: { main: '#f2a83a', cord: '#ffffff' }, skin: 'tan', body: 'thin' },   // deadpan intern, oversized mustard hoodie
};
const PETS = { snake: { key: 'snake', fur: '#c8a060', patch: '#6a4a2a', belly: '#f0dca8' } };
function toonPerson(s, who) { const p = c3ToonChar(CAST[who]); s.scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.p[who] = p; p.g.visible = false; return p; }
function toonPet(s, name, o) { const p = o.key === 'snake' ? c3ToonSnake(o) : c3ToonPet(o); p.petSize = o.size ?? 1; s.scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.p[name] = p; p.g.visible = false; return p; }
// pose a person at (x, z) on the floor (o.y lifts the root, e.g. a seat)
// v2 (user review: "rigid, frozen flat cards"; "paper-flat on the crane"; "shadows flicker"):
//  o.look = [x, z] world point -> facing computed from the camera every frame, so the body turns as the camera orbits
//    (clamped to ±1.7: never the back, never a hard profile flip); o.heading = world yaw (rad) does the same for a direction.
//  alive: a slow weight shift (lean) on top of the held pose, off with o.alive = 0 (walks never get it).
//  the card pitches toward a high camera (crane / top-down) so it never reads edge-on (feet stay on the floor).
//  the cast shadow comes from a twin of the card that always faces the KEY LIGHT (the card itself faces the camera, so
//  its shadow swung and flickered on every orbit); the twin is invisible in the colour passes.
function toonLookFacing(cam, x, z, vx, vz) { const c = V3(cam.position.x - x, 0, cam.position.z - z).normalize(), r = V3(c.z, 0, -c.x), l = Math.hypot(vx, vz) || 1;
  const toward = (vx * c.x + vz * c.z) / l, across = (vx * r.x + vz * r.z) / l; return Math.max(-1.7, Math.min(1.7, Math.atan2(across, Math.max(toward, -0.2)) * 4 / Math.PI)); }
function pose(s, who, t, x, z, o = {}) { const p = s.p[who]; p.g.visible = true; p.g.position.set(x, o.y ?? 0, z); p.sitting = !!o.sit;
  if (o.look) o = Object.assign({}, o, { facing: toonLookFacing(s.cam, x, z, o.look[0] - x, o.look[1] - z) });
  else if (o.heading != null) o = Object.assign({}, o, { facing: toonLookFacing(s.cam, x, z, Math.sin(o.heading), Math.cos(o.heading)) });
  if (o.alive !== 0 && o.mode !== 'walk') { const sd = t3Seed(who) * 0.013; o = Object.assign({}, o, { lean: (o.lean ?? 0) + 0.018 * Math.sin(t * 1.35 + sd) + 0.008 * Math.sin(t * 2.9 + sd * 3) }); }
  p.root.rotation.order = 'YXZ'; p.root.rotation.x = 0;
  const r = c3ToonPose(p, s.cam, t, o);
  { const wp = p.g.getWorldPosition(V3(0, 0, 0)), h = c3ToonDims(p).height * 0.5, v = s.cam.position.clone().sub(wp.setY(wp.y + h)), el = Math.atan2(v.y, Math.hypot(v.x, v.z));
    const tilt = o.noTilt ? 0 : Math.min(1.0, Math.max(0, el - 0.3) * 0.85); p.root.rotation.x = -tilt; p.sh.rotation.x = -Math.PI / 2 + tilt; p.root.updateMatrixWorld(true); }
  toonShadowTwin(s, p); return r; }
function toonShadowTwin(s, p) {
  if (!p.shTwin) { const m = new THREE.Mesh(p.card.geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false, depthWrite: false, map: p.mat.map, alphaTest: 0.5 }));
    m.customDepthMaterial = p.card.customDepthMaterial; m.castShadow = true; m.receiveShadow = false; m.userData.noInk2 = true; m.userData.noCast = false; m.frustumCulled = false; m.renderOrder = -5;
    c3Layer(m, C3.L_FOCUS); p.g.add(m); p.shTwin = m; }
  p.card.castShadow = false; p.shTwin.castShadow = true; p.shTwin.material.map = p.mat.map; p.shTwin.customDepthMaterial.map = p.mat.map;   // three's VSM depth-variant cache copies map/alphaTest from the OBJECT's material: keep the twin's in sync (else it cast a full rectangle)
  let key = s.scene.userData.t3L && s.scene.userData.t3L.key; if (!key) return;
  const d = key.position.clone().sub(key.target.position); let ry = 0; for (let q = p.g.parent; q; q = q.parent) ry += q.rotation.y;
  p.shTwin.rotation.set(0, Math.atan2(d.x, d.z) - ry, 0); p.shTwin.position.set(0, 0, 0);
}
// shadow camera stabiliser (called every frame before the render): the key light's target snaps to whole shadow-map texels
// in light space, so a shadow frustum that follows the camera never swims / shimmers (stShadowAt moves it every frame)
function stableShadow(scene) {
  let key = scene.userData.stabKey; if (key === undefined) { key = null; scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow && (!key || o.intensity > key.intensity)) key = o; }); if (key) scene.userData.stabKey = key; else return; }
  if (!key) return; const sc = key.shadow.camera, tx = (sc.right - sc.left) / key.shadow.mapSize.x, d = key.position.clone().sub(key.target.position), z = d.clone().normalize();
  const up = Math.abs(z.y) > 0.99 ? V3(1, 0, 0) : V3(0, 1, 0), xa = V3(0, 0, 0).crossVectors(up, z).normalize(), ya = V3(0, 0, 0).crossVectors(z, xa), T = key.target.position;
  const a = T.dot(xa), b = T.dot(ya); T.addScaledVector(xa, Math.round(a / tx) * tx - a).addScaledVector(ya, Math.round(b / tx) * tx - b);
  key.position.copy(T).add(d); key.target.updateMatrixWorld(); key.updateMatrixWorld();
}
// pose a pet at (x, y, z) (y = the surface it stands on)
function petAt(s, name, t, x, y, z, o = {}) { const p = s.p[name]; if (o.facing === 'back') o = Object.assign({}, o, { facing: 1.6 }); p.g.visible = true; p.g.position.set(x, y, z); p.lift = (o.hop || 0) * 150 * T3P.scale * T3.U * (p.petSize ?? 1); return p.o.key === 'snake' ? c3ToonSnakePose(p, s.cam, t, o) : c3ToonPetPose(p, s.cam, t, o); }
const hideAll = (s) => { for (const k in s.p) s.p[k].g.visible = false; };
// keyframe value helper: [[t, v], ...] -> the value in force at t
const keyAt = (K, t) => { let v = K[0][1]; for (const [k, x] of K) if (k <= t) v = x; return v; };
// a hop that snaps up and lands (0..1..0 over d s), for 'popcorning'
const hopAt = (t, t0, d = 0.32) => { const x = (t - t0) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
// ---- labels, canvases
function canvasTex(w, h) { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, key: null }; }
function redraw(C, key, draw) { if (C.key === key) return; C.key = key; draw(C.cv.getContext('2d'), C.cv.width, C.cv.height); C.t.needsUpdate = true; }
const facing = (m, cam) => { m.quaternion.copy(cam.quaternion); };
const pop = (t, t0, d = 0.25) => t < t0 ? 0 : EZ.back(clamp((t - t0) / d));
const popAt = (m, k, pos, cam, sc = 1) => { m.visible = k > 0.01; if (!m.visible) return; m.position.set(...pos); facing(m, cam); m.scale.setScalar(k * sc); };
// a camera-facing sprite plane (FOCUS layer, drawn over the set)
function spritePlane(scene, map, w, h, ro = 9) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = ro; scene.add(m); c3Layer(m, C3.L_FOCUS); m.visible = false; return m; }
// a comic burst with a word: yellow star with a red rim
function texBurst(word, c1 = '#ffe23a', c2 = '#e8282a') { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.save(); x.translate(w / 2, h / 2);
  const star = () => { x.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 0.34 : 0.48) * w; x.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); } x.closePath(); };
  star(); x.fillStyle = c2; x.fill(); x.lineWidth = 10; x.strokeStyle = '#2a1208'; x.stroke(); x.scale(0.82, 0.82); star(); x.fillStyle = c1; x.fill(); x.restore();
  inked(x, word, w / 2, h / 2 + 4, h * 0.2, '#e8282a', { stroke: '#2a1208', sw: h * 0.03, maxW: w * 0.6 }); }, 512, 512); }
// a stamp: a rotated rounded box with a word
function texStamp(word, c = '#d8282a', rot = -0.18) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(rot);
  g.lineWidth = 22; g.strokeStyle = '#2a1208'; g.beginPath(); g.roundRect(-w * 0.44, -h * 0.3, w * 0.88, h * 0.6, 24); g.stroke(); g.lineWidth = 14; g.strokeStyle = c; g.stroke();
  inked(g, word, 0, 6, h * 0.3, c, { stroke: '#2a1208', sw: h * 0.025, maxW: w * 0.78 }); g.restore(); }, 768, 384); }
// a speech bubble with one or two lines
function texSay(l1, l2 = '', tailR = false) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.46, h * 0.36, 0, 0, TAU);
  const tx = tailR ? w * 0.68 : w * 0.32; g.moveTo(tx - 30, h * 0.72); g.lineTo(tx + (tailR ? 50 : -50), h * 0.97); g.lineTo(tx + 34, h * 0.75);
  g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, l1, w / 2, h * (l2 ? 0.33 : 0.42), h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); if (l2) inked(g, l2, w / 2, h * 0.53, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.78 }); }, 640, 400); }
// a heart sprite
function texHeart(c = '#e8344a') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, h * 0.86); g.bezierCurveTo(w * 0.04, h * 0.5, w * 0.2, h * 0.08, w / 2, h * 0.32); g.bezierCurveTo(w * 0.8, h * 0.08, w * 0.96, h * 0.5, w / 2, h * 0.86);
  g.fillStyle = c; g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1208'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(w * 0.33, h * 0.3, w * 0.07, h * 0.05, -0.6, 0, TAU); g.fill(); }, 256, 256); }
// floating dust motes (Ricks: particles in the air), a BG-layer Points cloud drifting slowly; seeded, stateless
function dustCloud(scene, box, n = 160, col = '#fff2d0') {
  const R = RNG('dust', n), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([box[0] + R.f() * box[3], box[1] + R.f() * box[4], box[2] + R.f() * box[5], R.f() * TAU]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32);
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, map: dot, size: 0.22, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.userData.noInk2 = true; m.userData.noCast = true; m.userData.noShade = true; scene.add(m);
  m.visible = false;   // v2: off (the ink pass drew them as black specks)
  m.userData.tick = (t) => { base.forEach(([x, y, z, ph], i) => { pos[i * 3] = x + 0.6 * Math.sin(t * 0.3 + ph); pos[i * 3 + 1] = y + 0.5 * Math.sin(t * 0.21 + ph * 2); pos[i * 3 + 2] = z + 0.6 * Math.cos(t * 0.25 + ph); }); geo.attributes.position.needsUpdate = true; };
  return m;
}
// haze: exponential fog on the set; people, labels and sprites (alpha-tested / transparent) stay crisp over it
function haze(scene, col, d) { scene.fog = new THREE.FogExp2(col, d); }
function noFogOnCards(scene) { scene.traverse((m) => { if (m.isMesh && m.material && (m.material.alphaTest > 0 || m.material.transparent)) m.material.fog = false; }); }
// ---- a 3D hard-shell suitcase: two shells hinged on the back long edge (open(k) 0..1 lifts the lid), a carry handle on
// the front long edge, corner caps, ribs, a sticker, an optional luggage tag. Origin = the bottom centre; it lies flat
// (lid up). o: { color, w, h, d, sticker, tag (text), lining, inside (a THREE.Group placed in the bottom shell), scale }.
// g.userData.handle = the handle bar's local point (to put a gripping hand on it), g.userData.open(k).
function suitcase3D(o = {}) {
  const w = o.w ?? 3.6, d = o.d ?? 2.4, h = o.h ?? 1.3, c = o.color ?? '#2f6fb8', M = { shell: c3Prop(c, { rough: 0.35 }), rib: c3Prop(t3Mul(c, 0.78), { rough: 0.4 }), in: c3Prop(o.lining ?? '#7a3a5a', { rough: 0.95 }),
    metal: c3Prop('#c8c4bc', { metal: 0.6, rough: 0.3 }), handle: c3Prop('#2a2224', { rough: 0.5 }) };
  const g = new THREE.Group(), hb = h * 0.55, hl = h - hb, th = 0.07;
  // bottom shell: a floor + 4 walls (open top), so its contents can be seen when the lid is up
  g.add(rb(w, th, d, M.shell, 0, th / 2, 0, 0.02));
  for (const [x, z, ww, dd] of [[0, d / 2 - th / 2, w, th], [0, -d / 2 + th / 2, w, th], [w / 2 - th / 2, 0, th, d], [-w / 2 + th / 2, 0, th, d]]) g.add(rb(ww, hb, dd, M.shell, x, hb / 2, z, 0.02));
  g.add(rb(w - 2 * th, 0.02, d - 2 * th, M.in, 0, th + 0.01, 0, 0));
  for (const fx of [-0.22, 0.22]) g.add(rb(0.12, hb * 0.9, d + 0.04, M.rib, fx * w, hb / 2, 0, 0.01));
  // lid, hinged on the back edge (z = -d/2)
  const hinge = new THREE.Group(); hinge.position.set(0, hb, -d / 2); g.add(hinge);
  const lid = new THREE.Group(); hinge.add(lid);
  lid.add(rb(w, th, d, M.shell, 0, hl - th / 2, d / 2, 0.02));
  for (const [x, z, ww, dd] of [[0, d - th / 2, w, th], [0, th / 2, w, th], [w / 2 - th / 2, d / 2, th, d], [-w / 2 + th / 2, d / 2, th, d]]) lid.add(rb(ww, hl, dd, M.shell, x, hl / 2, z, 0.02));
  lid.add(rb(w - 2 * th, 0.02, d - 2 * th, M.in, 0, hl - th - 0.01, d / 2, 0));
  for (const fx of [-0.22, 0.22]) lid.add(rb(0.12, 0.06, d + 0.04, M.rib, fx * w, hl + 0.01, d / 2, 0.01));
  if (o.sticker !== false) { const st = c3Mesh(new THREE.CircleGeometry(0.42, 20), c3Prop(o.sticker ?? '#f2c23a', { rough: 0.6 }), 0.01); st.rotation.x = -Math.PI / 2; st.position.set(w * 0.3, hl + 0.012, d * 0.62); lid.add(st); }
  // handle on the front edge (+z): two posts + a bar
  const H = new THREE.Group(); H.position.set(0, hb, d / 2 + 0.02); g.add(H);
  for (const sx of [-1, 1]) H.add(rb(0.12, 0.12, 0.3, M.handle, sx * 0.45, 0, 0.15, 0.01));
  H.add(rb(1.1, 0.16, 0.16, M.handle, 0, 0, 0.32, 0.012));
  for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) { const k = c3Mesh(new THREE.SphereGeometry(0.16, 10, 8), M.metal, 0.01); k.position.set(x * 0.97, 0.12, z * 0.97); g.add(k); }
  if (o.tag) { const tg = pl(0.7, 1.0, c3Flat('#ffffff', { map: tex((x, ww, hh) => { x.fillStyle = '#f6efe0'; x.fillRect(0, 0, ww, hh); x.strokeStyle = '#2a1a14'; x.lineWidth = 8; x.strokeRect(4, 4, ww - 8, hh - 8); inked(x, o.tag, ww / 2, hh * 0.55, hh * 0.16, '#2a1a14', { stroke: false, maxW: ww * 0.8 }); }, 160, 220) }), 0.7, -0.45, 0.42); tg.rotation.set(-0.2, 0.3, 0.1); H.add(tg); }
  if (o.inside) { o.inside.position.y = th + 0.02; g.add(o.inside); }
  g.userData.lid = hinge; g.userData.handle = new THREE.Vector3(0, hb, d / 2 + 0.34);
  g.userData.open = (k) => { hinge.rotation.x = -k * 1.95; };
  g.userData.open(0); if (o.scale) g.scale.setScalar(o.scale); return g;
}
// a dot hand drawn OVER a 3D prop at a person's hand (after c3ToonPose): the card's own dot can be hidden behind the
// prop's depth; this camera-facing disc in the person's skin tone (inked) keeps the grip readable. gripDot(s, who, 'R')
function gripDot(s, who, nm = 'R', o = {}) {   // v3: the card's own hand pixels (toon.js c3ToonGripDot) — the old unlit skin disc read as a white fist
  const p = s.p[who], key = 'gd_' + who + nm; s.gd ||= {};
  const m = c3ToonGripDot(p, nm, s.cam, o.show !== false); if (!s.gd[key]) { s.scene.add(m); c3Layer(m, C3.L_FOCUS); s.gd[key] = m; }
  return m.visible ? c3ToonHandWorld(p, nm) : null;
}
const hideGrips = (s) => { if (s.gd) for (const k in s.gd) s.gd[k].visible = false; };
// put a 3D prop so that its local grip point sits in a person's hand (after c3ToonPose); o.behind pushes it away from the
// camera so the card's hand reads on top; o.dot draws gripDot over it (for props in front of the card)
function gripProp(s, obj, who, nm, local, o = {}) {
  const h = c3ToonHandWorld(s.p[who], nm); if (!h) return; obj.visible = true; obj.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0); obj.updateMatrixWorld(true);
  const off = local.clone().multiply(obj.scale).applyEuler(obj.rotation), d = s.cam.position.clone().sub(h).normalize();
  obj.position.copy(h).sub(off).addScaledVector(d, -(o.behind ?? 0.05)); if (o.dot) gripDot(s, who, nm);
}
// generic room textures (a wall clock, a shelf of books, a month calendar page)
function texClock() { return tex((g, w, h) => { g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, TAU); g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1a14'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = '#2a1a14'; g.fillRect(w / 2 + Math.cos(a) * w * 0.38 - 4, h / 2 + Math.sin(a) * h * 0.38 - 4, 8, 8); }
  g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + w * 0.2, h / 2 - h * 0.12); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 - w * 0.05, h / 2 - h * 0.32); g.stroke(); }, 256, 256); }
function texBooks(seed) { return tex((g, w, h) => { const R = RNG('bk', seed); g.fillStyle = '#3a2214'; g.fillRect(0, 0, w, h); let x = 6; const C = ['#c8402e', '#2f6aa8', '#e2a23a', '#3f8a5a', '#8a4aa8', '#e8e0cc', '#2a2a3a'];
  while (x < w - 10) { const bw = R.r(14, 30), bh = R.r(h * 0.7, h * 0.96); g.fillStyle = C[Math.floor(R.f() * C.length)]; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 3, h - bh + 10, bw - 6, 4); x += bw + 2; } }, 512, 160); }
function texMonth(name, n = 30) { return tex((x, w, h) => { x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8321e'; x.fillRect(0, 0, w, h * 0.26);
  inked(x, name, w / 2, h * 0.13, h * 0.13, '#ffffff', { stroke: false }); x.fillStyle = '#5a3a22'; x.font = `700 ${h * 0.05}px Arial`; x.textAlign = 'center';
  for (let d = 0; d < n; d++) { const c = (d + 2) % 7, r = Math.floor((d + 2) / 7); x.fillText(String(d + 1), w * (0.1 + c * 0.13), h * (0.38 + r * 0.12)); } }, 384, 480); }
function texTiles(c1, c2, rep) { const t = tex((g, w, h) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 2 ? c1 : c2; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); }
  g.strokeStyle = 'rgba(60,40,20,0.35)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; }

// =====================================================================
//  SEQUENTIAL CAMERA (user rule 2026-11-11, fuentes/cartoon3d/camara-secuencial-ricks.md): each set is ONE continuous take.
//  CAMSEQ[set] = [[t, [px,py,pz], [lx,ly,lz], fov, rollDeg], ...] keyed in ABSOLUTE time (the same path runs through every
//  shot of the set, so shot changes inside a set are invisible). A key every 1.2-1.8 s; each leg moves on a DIFFERENT axis
//  (push / whip to the next subject on its word / orbit with parallax / crane / dutch roll in-out) and the C1 spline
//  (c3Knots) keeps the speed from ever reaching zero between legs. 3-4 axes move at once most of the time.
//  No c3CamFx creep (it restarts at every shot = a jump); impacts shake through C3_CAMFX.kicks.
// =====================================================================
const CAMSEQ = {};
function seqCam(s, set, t, o = {}) {
  const K = CAMSEQ[set], c = c3CamAt(K, t), roll = c3Knots(K.map((k) => [k[0], k[4] || 0]), t), hb = o.hand ?? 1, n = (f, ph) => Math.sin(t * f + ph);
  let sh = 0; for (const [tk, a] of (C3_CAMFX.kicks || [])) { const d = t - tk; if (d >= 0 && d < 0.4) sh += a * Math.exp(-d * 11) * Math.sin(d * 66); }
  const cam = s.cam; cam.fov = c.fov;
  cam.position.set(c.p[0] + hb * 0.05 * (n(1.3, 0) + 0.5 * n(2.9, 1)), c.p[1] + hb * 0.04 * n(1.7, 2) + sh * 0.12, c.p[2]);
  cam.lookAt(c.l[0], c.l[1] + sh * 0.08, c.l[2]); cam.rotateZ((roll + hb * 0.35 * n(0.9, 3) + sh * 0.8) * Math.PI / 180); cam.updateProjectionMatrix();
  C3_DRY_CAM = null; return cam;
}

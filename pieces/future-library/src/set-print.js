// =====================================================================
//  SET print — the paper mill + print shop, the writer's study and his front yard: s26 s27 s28 s29 s30 s31 s32.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed prn.
//  Three small worlds, each built once:
//    prnMill   a warm timber print shop: a rounded teal paper machine (logs slide down a chute past a circular saw into
//              its hopper, paper sheets fly out of its slot) and an old platen press that stamps a "2114 EDITION" book
//    prnStudy  the writer's cosy cabin study: desk, lamp, window on the pine forest, a corkboard with a review card,
//              a laptop; the writer sits behind the desk (the desk front hides his legs)
//    prnYard   his red Norwegian cabin with a grass roof, a picket fence and the mailbox on its post
//  Every random number is drawn once at build time (never per frame), so nothing jumps between frames.
// =====================================================================
const PRN = {};
const PRN_K = 1.35, PRN_FOOT = 2.55 * PRN_K, PRN_SEAT = 2.9, PRN_DESK = 4.4;
const prnW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const prnV = (x, y, z) => new THREE.Vector3(x, y, z);
const prnSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function prnCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = prnSpan(id), dur = b - a;
  const P = prnV(...c.p), L = prnV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(prnV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const prnRack = (lt, id, a, b) => { const [t0, t1] = prnSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function prnFg(s, list, K, id, lt, o = {}) {
  const c = PRN.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
  c3SetCam(c, prnCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = prnV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(prnV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const PRN_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const PRN_SIT = { foot: { legL: [0.75, -PRN_SEAT / PRN_K + 0.05], legR: [-0.7, -PRN_SEAT / PRN_K + 0.05] } };
const prnWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
// a person's real fist, in its billboard root's space (the arm can stop short of the target)
function prnFist(p, arm) { p.g.updateMatrixWorld(true); return p.root.worldToLocal(p.limbs[arm].e.getWorldPosition(prnV(0, 0, 0))); }
const prnSph = () => PRN.sph ||= new THREE.SphereGeometry(1, 22, 16);
// a canvas texture that is redrawn only when its state key changes (export workers draw any frame first)
function prnCanvas(w, h) { const cv = Object.assign(document.createElement('canvas'), { width: w, height: h }), t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { cv, t, key: null }; }
function prnRedraw(C, key, draw) { if (C.key === key) return; C.key = key; draw(C.cv.getContext('2d'), C.cv.width, C.cv.height); C.t.needsUpdate = true; }

// ---- textures
function prnTexBrick() {
  const t = tex((x, w, h) => { x.fillStyle = '#e8d8c0'; x.fillRect(0, 0, w, h); const R = RNG('brick'), bw = w / 4, bh = h / 10;
    for (let j = 0; j < 10; j++) for (let i = -1; i < 5; i++) { const ox = (j % 2) * bw / 2; x.fillStyle = `hsl(${12 + R.r(-4, 6)},${34 + R.r(-6, 6)}%,${54 + R.r(-6, 6)}%)`;
      x.fillRect(i * bw + ox + 3, j * bh + 3, bw - 6, bh - 6); x.fillStyle = 'rgba(255,220,180,0.15)'; x.fillRect(i * bw + ox + 3, j * bh + 3, bw - 6, 4); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 5); return t;
}
function prnTexPlanks(base, n = 10, rep = [4, 1]) {
  const t = tex((x, w, h) => { const R = RNG('plank', base); for (let i = 0; i < n; i++) { x.fillStyle = `hsl(${30 + R.r(-3, 3)},${28 + R.r(-5, 5)}%,${base + R.r(-4, 4)}%)`; x.fillRect(0, i * h / n, w, h / n);
    x.fillStyle = 'rgba(40,18,6,0.45)'; x.fillRect(0, i * h / n, w, 3); x.strokeStyle = 'rgba(60,28,8,0.22)'; x.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const y = i * h / n + R.r(6, h / n - 6); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(5), w * 2 / 3, y + R.n(5), w, y + R.n(3)); x.stroke(); } } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t;
}
function prnTexWindow(mode) {   // the view through a window: sky and a pine forest (bright, it glows a little)
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, mode === 'mill' ? '#bfe4ff' : '#9fd0f4'); g.addColorStop(0.7, '#fff2d6'); g.addColorStop(1, '#f6e2b8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('winv', mode); x.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 5; i++) { const cx = R.r(0, w), cy = R.r(h * 0.08, h * 0.35); for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(cx + k * 22, cy + R.n(5), R.r(16, 26), 0, TAU); x.fill(); } }
    for (const [col, base, n] of [['#5f8a6a', 0.62, 16], ['#3e6a4e', 0.72, 13], ['#2a4e3a', 0.84, 10]]) { x.fillStyle = col;
      for (let i = 0; i < n; i++) { const cx = R.r(-20, w + 20), th = R.r(h * 0.18, h * 0.32), bw = th * 0.42, by = h * base + R.r(0, 12);
        x.beginPath(); x.moveTo(cx, by - th); x.lineTo(cx + bw, by); x.lineTo(cx - bw, by); x.closePath(); x.fill(); } }
    x.fillStyle = '#6aa04a'; x.fillRect(0, h * 0.92, w, h * 0.08); }, 512, 640);
}
function prnTexCork() {
  const t = tex((x, w, h) => { x.fillStyle = '#c8955c'; x.fillRect(0, 0, w, h); const R = RNG('cork');
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '90,52,24' : '240,200,150'},${R.r(0.15, 0.4)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 4), R.r(1, 4)); } }, 512, 512);
  return t;
}
function prnTexSiding() {   // falu-red vertical boards with white trim lines
  const t = tex((x, w, h) => { const R = RNG('siding'); for (let i = 0; i < 12; i++) { x.fillStyle = `hsl(${4 + R.r(-2, 2)},${58 + R.r(-5, 5)}%,${36 + R.r(-3, 3)}%)`; x.fillRect(i * w / 12, 0, w / 12, h); x.fillStyle = 'rgba(30,8,4,0.45)'; x.fillRect(i * w / 12, 0, 4, h); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); return t;
}
function prnTexGrass() {
  const t = tex((x, w, h) => { x.fillStyle = '#6aa848'; x.fillRect(0, 0, w, h); const R = RNG('grass');
    for (let i = 0; i < 3200; i++) { const c = R.f(); x.strokeStyle = c < 0.4 ? 'rgba(60,120,40,0.7)' : c < 0.8 ? 'rgba(140,200,90,0.6)' : 'rgba(250,230,120,0.6)'; x.lineWidth = R.r(1, 2.5);
      const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(3), py - R.r(5, 12)); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(20, 20); return t;
}
function prnTexRings() {   // a log's sawn end
  return tex((x, w, h) => { x.fillStyle = '#f2c98a'; x.fillRect(0, 0, w, h); for (let r = 8; r < w / 2; r += 9) { x.strokeStyle = `rgba(150,92,40,${0.35 + 0.25 * Math.sin(r)})`; x.lineWidth = 3; x.beginPath(); x.arc(w / 2, h / 2, r, 0, TAU); x.stroke(); }
    x.strokeStyle = '#7a4a22'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 7, 0, TAU); x.stroke(); }, 256, 256);
}
function prnTexBark() {
  const t = tex((x, w, h) => { x.fillStyle = '#8a5a32'; x.fillRect(0, 0, w, h); const R = RNG('bark'); x.strokeStyle = 'rgba(50,24,8,0.6)'; x.lineWidth = 4;
    for (let i = 0; i < 40; i++) { const px = R.r(0, w); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R.n(14), h / 3, px + R.n(14), h * 2 / 3, px + R.n(8), h); x.stroke(); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
}
function prnTexBookCover() {
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1f6a7e'); g.addColorStop(1, '#16485a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#e8c060'; x.lineWidth = 10; x.strokeRect(22, 22, w - 44, h - 44);
    inked(x, 'FUTURE', w / 2, h * 0.17, h * 0.085, '#ffe6a0', { stroke: '#2a1a08', sw: 6, maxW: w * 0.8 });
    inked(x, 'LIBRARY', w / 2, h * 0.27, h * 0.085, '#ffe6a0', { stroke: '#2a1a08', sw: 6, maxW: w * 0.8 });
    // a little tree emblem
    x.fillStyle = '#7a4a22'; x.fillRect(w / 2 - 9, h * 0.52, 18, h * 0.08); x.fillStyle = '#5fbf6a';
    for (const [dy, r] of [[0.36, 0.11], [0.44, 0.14], [0.5, 0.12]]) { x.beginPath(); x.moveTo(w / 2, h * (dy - r * 0.8)); x.lineTo(w / 2 + w * r, h * (dy + r * 0.5)); x.lineTo(w / 2 - w * r, h * (dy + r * 0.5)); x.closePath(); x.fill(); } }, 512, 720);
}
function prnTexBand() {
  return tex((x, w, h) => { x.fillStyle = '#d8322a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd23c'; x.fillRect(0, 6, w, 6); x.fillRect(0, h - 12, w, 6);
    inked(x, '2114 EDITION', w / 2, h / 2 + 2, h * 0.5, '#ffffff', { stroke: '#5a0a08', sw: 6, maxW: w * 0.88 }); }, 1024, 200);
}

// ---- props
function prnLog(len, s) {   // a log lying along x: bark + sawn ends
  const g = new THREE.Group(), ends = c3Prop('#ffffff', { map: s.ringTex, rough: 0.8 });
  const m = c3Mesh(new THREE.CylinderGeometry(0.55, 0.55, len, 22), [c3Prop('#ffffff', { map: s.barkTex, rough: 0.9 }), ends, ends], 0.04); m.rotation.z = Math.PI / 2; g.add(m);
  return g;
}
function prnBook(s) {
  const g = new THREE.Group(), cov = c3Prop('#16485a', { rough: 0.45 });
  g.add(rb(2.1, 2.9, 0.12, cov, 0, 0, 0.3, 0.025)); g.add(rb(2.1, 2.9, 0.12, cov, 0, 0, -0.3, 0.025)); g.add(rb(0.18, 2.9, 0.72, cov, -1.0, 0, 0, 0.025));
  g.add(rb(1.92, 2.72, 0.5, c3Prop('#fbf3e0', { rough: 0.9 }), 0.06, 0, 0, 0.015));
  g.add(pl(1.98, 2.78, c3Prop('#ffffff', { map: s.coverTex, rough: 0.5 }), 0, 0, 0.365));
  const band = rb(2.18, 0.62, 0.78, c3Prop('#d8322a', { rough: 0.5 }), 0.02, -0.82, 0, 0.02); g.add(band);
  g.add(pl(2.1, 0.56, c3Prop('#ffffff', { map: s.bandTex, rough: 0.5 }), 0.02, -0.82, 0.4));
  return g;
}
function prnPen() {   // a fountain pen pointing down-left from the fist, tip at the end
  const g = new THREE.Group(), body = c3Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 14), c3Prop('#1a2a5a', { rough: 0.25, metal: 0.3 }), 0.02); body.position.y = 0.2; g.add(body);
  const band = cyl(0.095, 0.095, 0.1, c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), 0, -0.35, 0, 0.0, 12); g.add(band);
  const nib = c3Mesh(new THREE.ConeGeometry(0.075, 0.32, 12), c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), 0.015); nib.rotation.z = Math.PI; nib.position.y = -0.56; g.add(nib);
  return g;
}

// =====================================================================
//  WORLD 1 — the mill / print shop
// =====================================================================
function prnMill() {
  if (PRN.mill) return PRN.mill;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 600), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.45, sky: '#ffe8c8', ground: '#5a3220', key: '#fff0d8', keyI: 1.1, keyP: [8, 22, 18], rim: '#ffc890', rimI: 0.6, rimP: [-12, 14, -10] });
  s.ringTex = prnTexRings(); s.barkTex = prnTexBark(); s.coverTex = prnTexBookCover(); s.bandTex = prnTexBand();
  // floor, brick back wall with a wainscot, two tall windows on the forest, pendant lamps, shelves of paper
  scene.add(pl(120, 80, c3Prop('#ffffff', { map: prnTexPlanks(46, 12, [10, 8]), rough: 0.45, metal: 0.05 }), 0, 0, 20, 0, -Math.PI / 2));
  scene.add(pl(120, 50, c3Prop('#ffffff', { map: prnTexBrick(), rough: 0.85 }), 0, 25, -9));
  scene.add(rb(120, 3.2, 0.5, c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), 0, 1.6, -8.7, 0.03));
  const winM = c3Flat('#ffffff', { map: prnTexWindow('mill'), glow: '#3a3020' }), frameM = c3Toon('#5a3a22');
  for (const x of [-13, 0, 13]) { const g = new THREE.Group(); g.position.set(x, 12.5, -8.75); scene.add(g);
    g.add(pl(6.4, 9.6, winM, 0, 0, 0)); g.add(rb(7.2, 0.5, 0.4, frameM, 0, 5.0, 0.1, 0.03)); g.add(rb(7.2, 0.5, 0.4, frameM, 0, -5.0, 0.1, 0.03));
    for (const dx of [-3.4, 0, 3.4]) g.add(rb(0.35, 10, 0.4, frameM, dx, 0, 0.1, 0.03)); g.add(rb(6.8, 0.25, 0.3, frameM, 0, 1.2, 0.12, 0.02)); }
  s.pendants = [-9, -1.5, 6.5].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 21, -2 + i * 0.7); scene.add(g);
    g.add(cyl(0.04, 0.04, 6, c3Toon('#2a1a12'), 0, 3, 0, 0, 6));
    const sh = c3Mesh(new THREE.ConeGeometry(1.4, 1.2, 20, 1, true), c3Prop('#d8322a', { rough: 0.35, side: THREE.DoubleSide }), 0.04); sh.position.y = -0.2; g.add(sh);
    const b = c3Mesh(prnSph(), c3Flat('#fff4c8', { glow: '#ffd890' }), 0); b.scale.setScalar(0.45); b.position.y = -0.75; g.add(b); return g; });
  { const pL = new THREE.PointLight('#ffd890', 0.9, 40, 1.4); pL.position.set(0, 16, 2); pL.layers.enableAll(); scene.add(pL); }
  for (const [x, z, n] of [[-12.5, -6, 6], [12.5, -6.5, 7], [-10, -3.5, 3]]) for (let k = 0; k < n; k++) { const R = RNG('ream', x, k);
    scene.add(rb(2.4, 0.42, 1.7, c3Prop(k % 3 === 2 ? '#fbe8c0' : '#fbf6ea', { rough: 0.9 }), x + R.n(0.08), 0.22 + k * 0.44, z + R.n(0.08), 0.02)); }
  // ---- the paper machine (x -4.5): a rounded teal body on little feet, a funnel hopper on top, gauges, rollers, a slot
  const mach = new THREE.Group(); mach.position.set(-4.5, 0, -2.5); scene.add(mach); s.mach = mach;
  const teal = c3Prop('#2aa39a', { rough: 0.3, metal: 0.15 }), cream = c3Prop('#f8ecd0', { rough: 0.5 }), red = c3Prop('#d8322a', { rough: 0.35 }), dark = c3Prop('#2a2422', { rough: 0.5 });
  s.machBody = new THREE.Group(); mach.add(s.machBody);
  s.machBody.add(rb(7, 5.4, 5, teal, 0, 3.4, 0, 0.06));
  for (const [x, z] of [[-2.9, -1.9], [2.9, -1.9], [-2.9, 1.9], [2.9, 1.9]]) mach.add(cyl(0.45, 0.6, 0.7, dark, x, 0.35, z, 0.03, 16));
  s.machBody.add(rb(5.6, 2.2, 0.3, cream, 0, 4.5, 2.5, 0.03));   // front panel
  s.machBody.add(rb(7.2, 0.4, 5.2, red, 0, 6.2, 0, 0.04));   // top trim
  s.gauges = [-1.6, 0, 1.6].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 4.6, 2.72); s.machBody.add(g);
    g.add(c3Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 24), c3Prop('#e8c060', { rough: 0.2, metal: 0.85 }), 0.03).rotateX(Math.PI / 2));
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), c3Flat('#fffaf0')); face.position.z = 0.1; g.add(face);
    const nd = new THREE.Group(); nd.position.z = 0.13; g.add(nd); const bar = c3Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.02), c3Flat('#d8322a'), 0); bar.position.y = 0.18; nd.add(bar); g.userData.needle = nd; return g; });
  // the output slot (dark mouth) with a lip, and two big rollers just above it
  s.machBody.add(rb(4.6, 0.55, 0.3, dark, 0, 1.75, 2.55, 0.03)); s.machBody.add(rb(5.0, 0.18, 1.0, cream, 0, 1.4, 2.9, 0.02));
  s.rollers = [-1.2, 1.2].map((x) => { const r = cyl(0.42, 0.42, 2.0, c3Prop('#e8e2d6', { rough: 0.25, metal: 0.4 }), x, 2.6, 2.75, 0.03, 20); r.rotation.z = Math.PI / 2; s.machBody.add(r);
    const st = c3Mesh(new THREE.BoxGeometry(0.1, 0.84, 0.1), dark, 0); r.add(st); return r; });
  // hopper: an open funnel; a dark bottom so it reads deep; rim
  const hop = new THREE.Group(); hop.position.set(0, 6.4, 0); mach.add(hop); s.hop = hop;
  hop.add(c3Mesh(new THREE.CylinderGeometry(2.3, 1.15, 2.0, 28, 1, true), c3Prop('#e8c060', { rough: 0.25, metal: 0.8, side: THREE.DoubleSide }), 0.05).translateY(1.0));
  hop.add(c3Mesh(new THREE.TorusGeometry(2.3, 0.14, 10, 40), c3Prop('#e8c060', { rough: 0.25, metal: 0.8 }), 0.03).rotateX(Math.PI / 2).translateZ(-2.0));
  { const bot = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24), c3Flat('#140c08')); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.05; hop.add(bot); }
  // chimney + steam puffs
  s.machBody.add(cyl(0.45, 0.55, 3.0, dark, 2.6, 7.6, -1.6, 0.04, 16)); s.machBody.add(cyl(0.65, 0.65, 0.35, red, 2.6, 9.2, -1.6, 0.03, 16));
  s.puffs = [...Array(6)].map(() => { const m = c3Mesh(prnSph(), c3Toon('#ffffff', { transparent: true }), 0); scene.add(m); return m; });
  // the chute from the upper left down into the hopper, and the circular saw over it
  const A = prnV(-10.6, 11.6, -2.5), B = prnV(-5.8, 9.0, -2.5); s.chA = A; s.chB = B; s.chDir = B.clone().sub(A).normalize(); s.chLen = A.distanceTo(B);
  const chute = new THREE.Group(); chute.position.copy(A).lerp(B, 0.5); chute.rotation.z = Math.atan2(B.y - A.y, B.x - A.x); scene.add(chute);
  const wood = c3Prop('#ffffff', { map: texWood(), rough: 0.5 });
  chute.add(rb(s.chLen + 0.6, 0.25, 1.6, wood, 0, -0.68, 0, 0.03)); for (const z of [-0.85, 0.85]) chute.add(rb(s.chLen + 0.6, 0.7, 0.18, wood, 0, -0.35, z, 0.025));
  for (const u of [0.2, 0.8]) { const p = prnV().copy(A).lerp(B, u); scene.add(cyl(0.2, 0.2, p.y - 0.8, c3Toon('#5a3a22'), p.x, (p.y - 0.8) / 2, p.z - 0.6, 0.02, 8)); }
  s.sawAt = 0.42; const sp = A.clone().lerp(B, s.sawAt);
  s.saw = new THREE.Group(); s.saw.position.copy(sp).add(prnV(0, 2.2, 0)); scene.add(s.saw);
  s.bladeOr = new THREE.Group(); s.saw.add(s.bladeOr); s.bladeOr.quaternion.setFromUnitVectors(prnV(0, 0, 1), s.chDir);   // its plane is across the log
  s.blade = new THREE.Group(); s.bladeOr.add(s.blade);
  // the axle sticks out uphill from the hub; a tall arm hangs it from above (out of frame), never through the blade
  s.bladeOr.add(cyl(0.12, 0.12, 0.7, dark, 0, 0, 0, 0.02, 10).rotateX(Math.PI / 2).translateY(-0.35));
  { const e = s.chDir.clone().multiplyScalar(-0.7); s.saw.add(rb(0.38, 7, 0.38, dark, e.x, e.y + 3.5, e.z, 0.03)); s.saw.add(rb(0.7, 0.5, 0.7, red, e.x, e.y, e.z, 0.03)); }
  { const sh = new THREE.Shape(); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, r = i % 2 ? 1.1 : 1.25; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(r, 0); }
    const bl = c3Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), c3Chrome(), 0.02); bl.position.z = -0.04; s.blade.add(bl);
    s.blade.add(cyl(0.3, 0.3, 0.3, red, 0, 0, 0, 0.02, 16).rotateX(Math.PI / 2)); }
  // the log: two pieces that read as one until the cut
  s.logBack = prnLog(3.4, s); s.logFront = prnLog(2.4, s); scene.add(s.logBack); scene.add(s.logFront);
  s.dust = [...Array(26)].map((_, i) => { const m = c3Mesh(prnSph(), c3Toon(i % 3 ? '#f2c98a' : '#d8a060'), 0); m.scale.setScalar(0.09); scene.add(m); const R = RNG('dust', i); m.userData.v = [R.n(2.2), R.r(1.5, 4.5), R.n(2.2)]; m.userData.d = R.r(0, 0.12); return m; });
  // paper sheets: start params drawn once
  const sheetM = c3Prop('#fffaf0', { rough: 0.85, side: THREE.DoubleSide });
  s.sheets = [...Array(16)].map((_, i) => { const R = RNG('sheet', i), m = c3Mesh(new THREE.PlaneGeometry(1.5, 2.0, 4, 1), sheetM, 0); scene.add(m);
    m.userData = { t0: 0.0 + i * 0.06, vx: (i % 2 ? 1 : -1) * R.r(2.0, 6.0), vy: R.r(10, 14), vz: R.r(8, 12), sx: R.r(2, 5), sy: R.r(1, 4), sz: R.r(2, 6), ph: R.r(0, 6) };
    { const pos = m.geometry.attributes.position; for (let k = 0; k < pos.count; k++) pos.setZ(k, 0.12 * Math.sin(pos.getX(k) * 1.6 + R.r(0, 1))); m.geometry.computeVertexNormals(); }
    return m; });
  // ---- the press (x 5.5): cabinet, two columns, a crossbar, a screw with a spoked wheel, the platen, the bed
  const press = new THREE.Group(); press.position.set(5.6, 0, -2.4); scene.add(press); s.press = press;
  const iron = c3Prop('#2e4a3a', { rough: 0.35, metal: 0.4 }), brass = c3Prop('#e8c060', { rough: 0.22, metal: 0.85 });
  press.add(rb(4.6, 3.0, 3.4, iron, 0, 1.5, 0, 0.05)); press.add(rb(4.0, 0.3, 3.0, c3Prop('#c8c0b0', { rough: 0.4, metal: 0.3 }), 0, 3.15, 0.1, 0.03));
  for (const x of [-1.95, 1.95]) press.add(rb(0.55, 6.4, 0.7, iron, x, 6.2, -0.4, 0.04));
  press.add(rb(4.7, 0.9, 1.0, iron, 0, 9.5, -0.4, 0.05)); press.add(rb(4.9, 0.18, 1.1, brass, 0, 10.0, -0.4, 0.02));
  s.screw = cyl(0.26, 0.26, 3.2, brass, 0, 8.0, -0.4, 0.02, 14); press.add(s.screw);
  s.wheel = new THREE.Group(); s.wheel.position.set(0, 10.6, 0.25); press.add(s.wheel);
  s.wheel.add(c3Mesh(new THREE.TorusGeometry(1.5, 0.12, 10, 40), c3Prop('#d8322a', { rough: 0.3 }), 0.03));
  for (let k = 0; k < 6; k++) { const sp2 = c3Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), brass, 0.015); sp2.rotation.z = k * Math.PI / 6; s.wheel.add(sp2); }
  { const hub = c3Mesh(prnSph(), brass, 0.02); hub.scale.setScalar(0.32); s.wheel.add(hub); }
  s.platen = rb(3.6, 0.55, 2.6, c3Prop('#4a5a62', { rough: 0.3, metal: 0.6 }), 0, 6.4, 0.1, 0.04); press.add(s.platen);
  s.bedSheet = pl(2.2, 1.6, c3Prop('#fffaf0', { rough: 0.9 }), 0, 3.32, 0.2, 0, -Math.PI / 2); press.add(s.bedSheet);
  // the feed board with a little stack, a stack of finished books at the front
  press.add(rb(2.2, 0.15, 1.6, wood, -3.2, 3.0, 0.4, 0.02)); for (let k = 0; k < 5; k++) press.add(rb(1.6, 0.06, 1.2, c3Prop('#fffaf0', { rough: 0.9 }), -3.2, 3.12 + k * 0.07, 0.4, 0.008));
  s.book = prnBook(s); scene.add(s.book);
  s.stack = new THREE.Group(); s.stack.position.set(8.9, 0, 0.6); scene.add(s.stack);
  for (let k = 0; k < 4; k++) { const b = prnBook(s); b.rotation.set(-Math.PI / 2, 0, 0.1 * (k % 2 ? 1 : -1)); b.position.set(0, 0.42 + k * 0.78, 0); s.stack.add(b); }
  s.sparks = [...Array(10)].map(() => { const m = c3Mesh(new THREE.OctahedronGeometry(0.22, 0), c3Flat('#fff4b0', { glow: '#ffe060' }), 0); scene.add(m); return m; });
  s.glowB = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,236,170,0.75)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(s.glowB);
  [mach, press, chute, s.saw, s.logBack, s.logFront, s.book, s.stack, ...s.sheets, ...s.dust, ...s.sparks, ...s.puffs, s.glowB].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = {
    reams: (() => { const g = new THREE.Group(); for (let k = 0; k < 4; k++) g.add(rb(3.4, 0.6, 2.4, c3Prop('#fbf6ea', { rough: 0.9 }), 0.1 * (k % 2), k * 0.62, 0, 0.03)); return g; })(),
    gear: (() => { const g = new THREE.Group(), sh = new THREE.Shape(); for (let i = 0; i <= 32; i++) { const a = i / 32 * TAU, r = (i % 4 < 2) ? 2.2 : 1.8; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(r, 0); }
      g.add(c3Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false }), c3Prop('#b88a40', { rough: 0.3, metal: 0.8 }), 0.04)); return g; })(),
    log: (() => { const l = prnLog(5, s); l.scale.setScalar(1.6); return l; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffe8c8', mid: '#c89070', bot: '#3a2014', cards: [[0, 30, -10, 40, 8, '#fff6e8'], [-20, 12, -20, 12, 14, '#cfe6ff'], [20, 10, 10, 10, 16, '#ffd8a8']] });
  c3ShadeScene(scene, { dark: 0.34 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 22);
  return (PRN.mill = s);
}
// per-frame: steam, gauges, rollers; everything shot-specific hidden
function prnMillWorld(s, t) {
  s.puffs.forEach((m, i) => { const k = mod(t * 0.7 + i / 6, 1); m.position.set(-4.5 + 2.6 + Math.sin(i * 2.1 + k * 3) * 0.4 * k, 9.6 + k * 4.5, -2.5 - 1.6); m.scale.setScalar(0.4 + k * 1.1); m.material.opacity = 0.85 * Math.sin(Math.PI * k); });
  s.gauges.forEach((g, i) => { g.userData.needle.rotation.z = 0.8 * Math.sin(t * (1.3 + i * 0.4) + i); });
  s.rollers.forEach((r, i) => { r.rotation.x = t * 6 * (i ? -1 : 1); });
  [s.logBack, s.logFront, ...s.sheets, ...s.dust, ...s.sparks, s.glowB, s.book].forEach((o) => { o.visible = false; });
  s.machBody.position.set(0, 0, 0); s.machBody.scale.set(1, 1, 1);
}
const prnRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#3a2418', bgBlur: 2.2, nearBlur: 10, glow: 0.65, glowBlur: 16, bloom: 0.22 }, o));

// =====================================================================
//  s26 — "get cut down to make the paper": a big log rides down the chute, the circular saw drops and cuts it on "cut",
//  the front piece slides on and drops into the hopper on "down", the machine shudders and on "paper" sheets fly out
// =====================================================================
const PRN_K26 = [[0, [-3.6, 10.2, 27], [-6.6, 8.0, -2.5], 46], [1.6, [-2.0, 8.0, 24], [-4.8, 5.6, -1.0], 46]];
SHOT_FN['s26'] = (t, u, lt) => {
  const s = prnMill(); prnMillWorld(s, t);
  const cut = prnW('cut', 1, 42.5), down = prnW('down', 1, 42.8), paper = prnW('paper', 1, 43.5);
  c3SetCam(s.cam, prnCam(PRN_K26, lt, 's26', { orbit: 0.03 }));
  // the log: slides down to the saw, stops, gets cut, then the front piece slides on and drops into the hopper
  const A = s.chA, D = s.chDir, ang = Math.atan2(D.y, D.x), lift = 0.55;   // log axis along the chute, resting in it
  const arrive = EZ.o2(clamp((t - 42.0) / 0.35)), split = clamp((t - cut) / 0.15);
  const sawU = s.sawAt * s.chLen;   // the cut point along the chute
  const backC = sawU - 1.7 - 0.12 * split, frontC0 = sawU + 1.2;
  const place = (o, uAlong, extraY = 0) => { o.position.copy(A).addScaledVector(D, uAlong).add(prnV(0, lift + extraY, 0)); o.rotation.set(0, 0, ang); };
  s.logBack.visible = true; place(s.logBack, lerp(backC - 3, backC, arrive));
  const slide = EZ.i2(clamp((t - (cut + 0.12)) / (down - cut - 0.02)));
  const fu = lerp(lerp(frontC0 - 3, frontC0, arrive), s.chLen + 1.4, slide);
  if (t < down + 0.02) { s.logFront.visible = true; place(s.logFront, fu); }
  else {   // past the chute's end: it tips upright over the hopper's centre and sinks in (hidden once below the rim)
    const k = clamp((t - down) / 0.32), hp = prnV(-4.5, 8.4 + 0.6 * (1 - k) - 3.4 * k * k, -2.5);
    s.logFront.visible = hp.y > 6.1; s.logFront.position.copy(hp); s.logFront.rotation.set(0, 0, lerp(ang, Math.PI / 2, EZ.o2(clamp(k * 2))));
  }
  // the saw: spins; drops through the gap on "cut" and lifts back
  s.blade.rotation.z = t * 30; const drop = Math.sin(Math.PI * clamp((t - (cut - 0.12)) / 0.36));
  s.saw.position.copy(A).addScaledVector(D, sawU).add(prnV(0, 2.2 - 1.15 * drop, 0));
  // sawdust burst at the cut
  s.dust.forEach((m) => { const dt = t - cut - m.userData.d; m.visible = dt > 0 && dt < 0.9; if (!m.visible) return; const [vx, vy, vz] = m.userData.v;
    m.position.copy(A).addScaledVector(D, sawU).add(prnV(vx * dt, 0.9 + vy * dt - 6 * dt * dt, vz * dt)); });
  // the machine gulps the log: a squash and shudder, then it spits paper on "paper"
  const gulp = clamp((t - (down + 0.25)) / 0.5), shake = gulp > 0 && gulp < 1 ? Math.sin(t * 60) * 0.06 * (1 - gulp) : 0;
  s.machBody.position.x = shake; s.machBody.scale.set(1 + 0.04 * Math.sin(Math.PI * gulp), 1 - 0.05 * Math.sin(Math.PI * gulp), 1);
  s.gauges.forEach((g, i) => { g.userData.needle.rotation.z = gulp > 0 ? lerp(-1.2, 1.4, EZ.o2(gulp)) + 0.1 * Math.sin(t * 20 + i) : g.userData.needle.rotation.z; });
  prnSheets(s, t, paper - 0.3);
  prnFg(s, [['reams', [3.6, -6.4, -11], -1.2], ['gear', [-4.2, 5.6, -10], 0.8]], PRN_K26, 's26', lt, { orbit: 0.03 });
  prnRender(s, { bgBlur: prnRack(lt, 's26', 1.6, 2.6) });
};
// the sheets: shot out of the slot in a fan, fluttering, landing flat on the floor (params fixed at build)
function prnSheets(s, t, t0) {
  const slot = prnV(-4.5, 1.8, 0.6);
  s.sheets.forEach((m) => { const d = m.userData, dt = t - t0 - d.t0; m.visible = dt > 0; if (!m.visible) return;
    const drag = 1 - Math.exp(-dt * 2.2), x = slot.x + d.vx * drag / 2.2, z = slot.z + d.vz * drag / 2.2;
    let y = slot.y + d.vy * drag / 2.2 - 3.0 * dt * dt + 0.25 * Math.sin(dt * d.sy * 2 + d.ph); const landed = y < 0.06; if (landed) y = 0.06;
    m.position.set(x, y, z);
    if (landed) m.rotation.set(-Math.PI / 2, 0, d.ph); else m.rotation.set(-0.6 + Math.sin(dt * d.sx + d.ph) * 0.9, Math.sin(dt * d.sz) * 0.8, Math.sin(dt * d.sy + d.ph) * 0.7);
  });
}

// =====================================================================
//  s27 — "the books will finally be printed on.": the press wheel spins, the platen slams down on "printed", lifts, and a
//  finished book pops out and hovers toward us with its "2114 EDITION" band, glowing; a stack of copies beside the press
// =====================================================================
const PRN_K27 = [[0, [2.0, 8.8, 19.5], [5.2, 6.4, -2.0], 46], [1.7, [3.6, 7.6, 16.5], [5.2, 6.0, -0.5], 44]];
SHOT_FN['s27'] = (t, u, lt) => {
  const s = prnMill(); prnMillWorld(s, t);
  const fin0 = prnW('finally', 1, 44.3), fin = 43.95, printed = fin0 + 0.12, on = prnW('on', 1, 45.1);   // slam on 'finally' so the book is out and readable by mid-shot
  c3SetCam(s.cam, prnCam(PRN_K27, lt, 's27', { orbit: -0.03 }));
  prnSheets(s, t, prnW('paper', 1, 43.5) - 0.3);   // the last sheets still settling on the floor, left of frame
  // the platen: creeps down from "finally", slams on "printed", lifts
  const creep = EZ.io(clamp((t - fin) / (printed - 0.12 - fin))), slam = EZ.i2(clamp((t - (printed - 0.12)) / 0.12)), up = EZ.o2(clamp((t - (printed + 0.06)) / 0.22));
  const py = lerp(lerp(6.4, 5.4, creep), 3.6, slam);
  s.platen.position.y = lerp(py, 6.4, up); s.screw.position.y = 8.0 + (s.platen.position.y - 6.4) * 0.5;
  s.wheel.rotation.z = -(t - 43.8) * 1.2 - (6.4 - s.platen.position.y) * 1.4;
  const hit = t > printed && t < printed + 0.2 ? Math.sin((t - printed) * 60) * 0.05 * (1 - (t - printed) / 0.2) : 0;
  s.press.position.set(5.6 + hit, 0, -2.4);
  s.bedSheet.visible = t < printed + 0.05;
  // the book: pops out from under the platen as it lifts, flips up and hovers facing us
  const pop = clamp((t - (printed + 0.08)) / 0.45), k = EZ.o2(clamp((pop - 0.3) / 0.7));
  s.book.visible = pop > 0;
  if (pop > 0) {   // first it slides out from under the platen (flat, low), only then it flips up and rises toward us
    const k1 = EZ.o2(clamp(pop / 0.35)), k2 = EZ.o2(clamp((pop - 0.3) / 0.7)), low = prnV(5.6, 3.68, lerp(-2.0, 0.6, k1)), p1 = prnV(4.9, 6.6, 1.8);
    s.book.position.copy(low).lerp(p1, k2).add(prnV(0, Math.sin(Math.PI * k2) * 1.2 + 0.12 * Math.sin(t * 3) * k2, 0));
    s.book.rotation.set(lerp(-Math.PI / 2, 0.08, EZ.back(clamp((pop - 0.3) / 0.7))), lerp(0, -0.25, k2) + 0.05 * Math.sin(t * 2) * k2, 0.04 * Math.sin(t * 2.6) * k2);
    s.book.scale.setScalar(lerp(0.8, 1.05, k2));
    s.glowB.visible = true; s.glowB.position.copy(s.book.position).add(prnV(0, 0, -0.5)); s.glowB.quaternion.copy(s.cam.quaternion); s.glowB.scale.setScalar(5.5 * k * (0.9 + 0.1 * Math.sin(t * 7)));
    s.sparks.forEach((m, i) => { const R = RNG('bsp', i), a = R.r(0, TAU) + t * 0.8, r = 2.0 + 0.3 * Math.sin(t * 4 + i); m.visible = true;
      m.position.copy(s.book.position).add(prnV(Math.cos(a) * r, Math.sin(a) * r * 1.2, 0.4)); m.scale.setScalar(k * (0.5 + 0.5 * Math.abs(Math.sin(t * 6 + i)))); m.rotation.z = t * 3 + i; }); }
  prnFg(s, [['log', [-3.6, -5.6, -10], 1.2], ['gear', [3.8, 5.6, -9], -0.9]], PRN_K27, 's27', lt, { orbit: -0.03 });
  prnRender(s, { bgBlur: prnRack(lt, 's27', 1.8, 2.8), glow: 0.85 });
};

// =====================================================================
//  WORLD 2 — the writer's study
// =====================================================================
function prnStudy() {
  if (PRN.study) return PRN.study;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffe8d0', ambI: 0.5, sky: '#ffe0b8', ground: '#4a2a1a', key: '#ffe8c8', keyI: 1.0, keyP: [-10, 18, 16], rim: '#ffb070', rimI: 0.55, rimP: [12, 12, -8] });
  const wallM = c3Prop('#ffffff', { map: prnTexPlanks(64, 9, [6, 2]), rough: 0.7 }), wood = c3Prop('#ffffff', { map: texWood(), rough: 0.45 }), frameM = c3Toon('#5a3a22');
  scene.add(pl(90, 40, wallM, 0, 20, -6.5));
  scene.add(pl(90, 60, c3Prop('#ffffff', { map: prnTexPlanks(40, 12, [8, 6]), rough: 0.4, metal: 0.05 }), 0, 0, 20, 0, -Math.PI / 2));
  // a round rug under the desk
  { const rug = new THREE.Mesh(new THREE.CircleGeometry(8, 40), c3Prop('#ffffff', { map: tex((x, w, h) => { const c = ['#c84a3a', '#f2c060', '#3a6a8a', '#f6ead0']; for (let i = 0; i < 8; i++) { x.fillStyle = c[i % 4]; x.beginPath(); x.arc(w / 2, h / 2, w / 2 * (1 - i / 8), 0, TAU); x.fill(); } }, 256, 256), rough: 0.95 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 1); scene.add(rug); }
  // window on the pine forest (left), glowing a little; curtains
  const win = new THREE.Group(); win.position.set(-4.4, 10.2, -6.35); scene.add(win);
  win.add(pl(6, 7, c3Flat('#ffffff', { map: prnTexWindow('study'), glow: '#3a3020' }), 0, 0, 0));
  for (const [w2, h2, x, y] of [[6.8, 0.45, 0, 3.6], [6.8, 0.6, 0, -3.6], [0.45, 7.4, -3.2, 0], [0.45, 7.4, 3.2, 0], [0.25, 7, 0, 0], [6.4, 0.22, 0, 0.6]]) win.add(rb(w2, h2, 0.4, frameM, x, y, 0.1, 0.025));
  for (const x of [-4.1, 4.1]) { const c = rb(1.6, 9, 0.4, c3Prop('#c84a3a', { rough: 0.9 }), x, -0.3, 0.3, 0.03); win.add(c); }
  // corkboard (right) with notes and the review card
  s.cork = new THREE.Group(); s.cork.position.set(4.7, 9.4, -6.3); scene.add(s.cork);
  s.cork.add(rb(5.4, 4.2, 0.3, frameM, 0, 0, 0, 0.04)); s.cork.add(pl(5.0, 3.8, c3Prop('#ffffff', { map: prnTexCork(), rough: 0.95 }), 0, 0, 0.17));
  const note = (w2, h2, c, x, y, rz) => { const n = pl(w2, h2, c3Prop(c, { rough: 0.9 }), x, y, 0.2); n.rotation.z = rz; s.cork.add(n);
    const pin = c3Mesh(prnSph(), c3Prop('#d8322a', { rough: 0.25 }), 0.01); pin.scale.setScalar(0.12); pin.position.set(x, y + h2 / 2 - 0.15, 0.3); s.cork.add(pin); };
  note(1.1, 1.1, '#ffe680', -1.8, 1.0, 0.1); note(1.0, 1.3, '#bfe8ff', -1.9, -0.8, -0.08); note(1.2, 0.9, '#ffd0e0', 1.8, -1.1, 0.12);
  s.revC = prnCanvas(768, 560); s.card = pl(2.4, 1.75, c3Prop('#ffffff', { map: s.revC.t, rough: 0.85 }), 0.25, 0.25, 0.24); s.card.rotation.z = -0.04; s.cork.add(s.card);
  { const pin = c3Mesh(prnSph(), c3Prop('#2a8ad8', { rough: 0.25 }), 0.01); pin.scale.setScalar(0.13); pin.position.set(0.25, 1.06, 0.36); s.cork.add(pin); }
  // bookshelf far right, framed picture far left
  const shelf = new THREE.Group(); shelf.position.set(10.5, 0, -5.6); scene.add(shelf); shelf.add(rb(5, 16, 1.6, wood, 0, 8, 0, 0.04));
  for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) { const R = RNG('sbook', i, j), bh = R.r(1.6, 2.4); shelf.add(rb(0.62, bh, 1.3, c3Toon(['#a8322a', '#2a5a8a', '#d8a030', '#3a7a4a', '#6a3a7a'][(i + j) % 5]), -1.9 + i * 0.75, 1.0 + j * 3 + bh / 2, 0.25, 0.02)); }
  // the desk: top, a front panel (hides his legs), drawers; on it: lamp, mug, ink pot, manuscript stack, paper, laptop
  const desk = new THREE.Group(); desk.position.set(0, 0, 0); scene.add(desk); s.desk = desk;
  desk.add(rb(10, 0.5, 3.6, wood, 0, PRN_DESK - 0.25, 0, 0.05));
  desk.add(rb(9.6, PRN_DESK - 0.5, 0.3, c3Prop('#ffffff', { map: texWood(), rough: 0.5 }), 0, (PRN_DESK - 0.5) / 2, 1.55, 0.04));
  for (const x of [-3.2, 3.2]) { desk.add(rb(2.6, 1.0, 0.12, c3Prop('#8a5228', { rough: 0.5 }), x, PRN_DESK - 1.3, 1.72, 0.02)); desk.add(cyl(0.12, 0.12, 0.16, c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), x, PRN_DESK - 1.3, 1.82, 0.01, 10).rotateX(Math.PI / 2)); }
  s.lamp = new THREE.Group(); s.lamp.position.set(-3.6, PRN_DESK, -0.6); desk.add(s.lamp);
  s.lamp.add(cyl(0.7, 0.85, 0.25, c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), 0, 0.12, 0, 0.02, 18)); s.lamp.add(cyl(0.08, 0.08, 2.0, c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), 0, 1.1, 0, 0, 8));
  { const sh = c3Mesh(new THREE.CylinderGeometry(0.5, 1.0, 0.8, 20, 1, true), c3Prop('#2a7a4a', { rough: 0.3, metal: 0.4, side: THREE.DoubleSide }), 0.04); sh.position.y = 2.2; s.lamp.add(sh);
    const b = c3Mesh(prnSph(), c3Flat('#fff4c8', { glow: '#ffd890' }), 0); b.scale.setScalar(0.32); b.position.y = 2.0; s.lamp.add(b); }
  { const pL = new THREE.PointLight('#ffd890', 1.1, 26, 1.5); pL.position.set(-3.4, PRN_DESK + 2, 0.4); pL.layers.enableAll(); scene.add(pL); }
  desk.add(mug('#d8322a', -3.9, PRN_DESK, 1.2));
  desk.add(cyl(0.32, 0.36, 0.45, c3Prop('#1a2a3a', { rough: 0.15, metal: 0.2 }), 0.6, PRN_DESK + 0.22, 1.2, 0.02, 16));   // ink pot
  s.paper = pl(2.2, 2.9, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(40,40,90,0.55)'; x.lineWidth = 3; const R = RNG('scrib');
    for (let j = 0; j < 12; j++) { const y = 40 + j * 36; x.beginPath(); x.moveTo(30, y); for (let k = 0; k < 18; k++) x.lineTo(30 + k * 11, y + R.n(4)); x.stroke(); } }, 256, 512), rough: 0.9 }), -2.0, PRN_DESK + 0.03, 0.75, 0, -Math.PI / 2);
  s.paper.rotation.z = 0.12; desk.add(s.paper);
  // the laptop (s31): base on the desk, lid turned toward the camera and toward him
  s.lap = new THREE.Group(); s.lap.position.set(2.7, PRN_DESK, 0.3); s.lap.rotation.y = -0.55; desk.add(s.lap);
  s.lap.add(rb(2.8, 0.14, 1.9, c3Prop('#c8ccd4', { rough: 0.25, metal: 0.6 }), 0, 0.07, 0, 0.02));
  s.lid = new THREE.Group(); s.lid.position.set(0, 0.14, -0.9); s.lap.add(s.lid);
  s.lid.add(rb(2.8, 1.9, 0.1, c3Prop('#c8ccd4', { rough: 0.25, metal: 0.6 }), 0, 0.95, 0, 0.02)); s.lid.rotation.x = -0.25;
  s.scrC = prnCanvas(640, 420); s.scr = pl(2.55, 1.68, c3Flat('#ffffff', { map: s.scrC.t }), 0, 0.95, 0.06); s.lid.add(s.scr);
  // the envelope + wax seal (s32), and the wax stick
  s.env = new THREE.Group(); s.env.position.set(0.3, PRN_DESK + 0.06, -1.0); desk.add(s.env);   // just in front of him, clear of the paper
  s.env.add(rb(2.4, 0.06, 1.6, c3Prop('#f2dcb0', { rough: 0.85 }), 0, 0, 0, 0.012));
  { const flap = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([prnV(-1.18, 0.05, -0.78), prnV(1.18, 0.05, -0.78), prnV(0, 0.05, 0.25)]), c3Prop('#e6cc9a', { rough: 0.85, side: THREE.DoubleSide })); flap.geometry.computeVertexNormals(); s.env.add(flap); }
  s.seal = new THREE.Group(); s.seal.position.set(0, 0.08, 0.2); s.env.add(s.seal);
  { const blob = c3Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.1, 20), c3Prop('#c81e1e', { rough: 0.3 }), 0.012); s.seal.add(blob);
    const mark = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#a81414'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8463a'; x.beginPath(); x.moveTo(w / 2, h * 0.15); x.lineTo(w * 0.8, h * 0.7); x.lineTo(w * 0.2, h * 0.7); x.closePath(); x.fill(); x.fillRect(w * 0.45, h * 0.7, w * 0.1, h * 0.15); }, 128, 128) }));
    mark.rotation.x = -Math.PI / 2; mark.position.y = 0.06; s.seal.add(mark); }
  s.sealGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,120,90,0.6)'); gr.addColorStop(1, 'rgba(255,120,90,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(s.sealGlow);
  // chair back behind him
  s.chairB = new THREE.Group(); s.chairB.position.set(0, 0, -2.8); scene.add(s.chairB);
  s.chairB.add(rb(3.6, 0.35, 0.35, wood, 0, PRN_SEAT + 5.0, 0, 0.03)); for (const x of [-1.6, 1.6]) s.chairB.add(rb(0.35, PRN_SEAT + 5.2, 0.35, wood, x, (PRN_SEAT + 5.2) / 2, 0, 0.03));
  for (const x of [-0.8, 0, 0.8]) s.chairB.add(rb(0.22, 3.6, 0.15, wood, x, PRN_SEAT + 3.0, 0, 0.02));
  // the writer, his pen, the stamp in his hand, the thought bubbles (all billboard-local on his root)
  s.writer = c3Person({ key: 'writer', outfit: 'sweater', hairStyle: 'rk_genius' }); s.writer.g.scale.setScalar(PRN_K); scene.add(s.writer.g);
  s.pen = prnPen(); s.pen.renderOrder = 6; s.writer.root.add(s.pen);
  s.stamp = new THREE.Group(); s.stamp.add(cyl(0.18, 0.22, 0.9, c3Prop('#5a3420', { rough: 0.4 }), 0, 0.3, 0, 0.02, 12)); s.stamp.add(cyl(0.3, 0.3, 0.2, c3Prop('#e8c060', { rough: 0.2, metal: 0.9 }), 0, -0.25, 0, 0.02, 16)); s.stamp.renderOrder = 6; s.stamp.scale.setScalar(0.75); s.writer.root.add(s.stamp);
  s.bubC = [0, 1, 2].map(() => prnCanvas(512, 512));
  s.bubbles = s.bubC.map((C, i) => { const b = pl(2.6, 2.6, c3Flat('#ffffff', { map: C.t, transparent: true, depthWrite: false, glow: '#2a3a5a' }), 0, 0, 0.3); b.renderOrder = 8; s.writer.root.add(b); return b; });
  s.dots = [0.32, 0.45, 0.6].map((r) => { const d = c3Mesh(prnSph(), c3Flat('#ffffff'), 0.02); d.scale.setScalar(r); d.renderOrder = 8; s.writer.root.add(d); return d; });
  [s.writer.g, desk, s.chairB, s.cork, s.sealGlow].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = {
    books: (() => { const g = new THREE.Group(); for (let k = 0; k < 4; k++) g.add(rb(3.2 - k * 0.2, 0.7, 2.2, c3Toon(['#a8322a', '#2a5a8a', '#d8a030', '#3a7a4a'][k]), 0.15 * (k % 2), k * 0.72, 0, 0.03)); return g; })(),
    plant: (() => { const g = new THREE.Group(); g.add(cyl(0.9, 0.7, 1.6, c3Prop('#c8643a', { rough: 0.7 }), 0, -1.6, 0, 0.04, 16));
      for (let i = 0; i < 9; i++) { const R = RNG('leaf', i), l = c3Mesh(prnSph(), c3Toon(i % 2 ? '#3a8a4a' : '#5aaa5a'), 0.03); l.scale.set(0.5, 1.6, 0.18); l.position.set(R.n(0.8), R.r(0, 1.2), R.n(0.3)); l.rotation.z = R.n(0.9); g.add(l); } return g; })(),
    shade: (() => { const g = new THREE.Group(); g.add(c3Mesh(new THREE.CylinderGeometry(1.1, 2.2, 1.8, 20, 1, true), c3Prop('#2a7a4a', { rough: 0.3, metal: 0.4, side: THREE.DoubleSide }), 0.05)); return g; })(),
    quill: (() => { const g = new THREE.Group(); const f = c3Mesh(prnSph(), c3Toon('#fff6e8'), 0.03); f.scale.set(0.5, 3.0, 0.08); g.add(f); g.add(cyl(0.06, 0.06, 2, c3Toon('#3a2a1a'), 0, -2.6, 0, 0.01, 6)); return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffe0b8', mid: '#8a5a3a', bot: '#2a1408', cards: [[0, 30, 10, 30, 6, '#fff0d0'], [-20, 12, 0, 8, 14, '#cfe6ff'], [20, 10, -10, 8, 14, '#ffd8a8']] });
  c3ShadeScene(scene, { dark: 0.34 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 18);
  return (PRN.study = s);
}
function prnStudyWorld(s, t) {
  [s.pen, s.stamp, ...s.bubbles, ...s.dots, s.sealGlow].forEach((o) => { o.visible = false; });
  s.env.visible = false; s.lap.visible = true; s.writer.g.visible = true;
  prnDrawReview(s, 0); prnDrawScreen(s, 0, 0);
}
// the review card: REVIEWS, five empty grey stars that try to light (k = 0..1 flicker), "0 reviews"
function prnDrawReview(s, flick) {
  prnRedraw(s.revC, 'r' + Math.round(flick * 4), (x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8c8a8'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    inked(x, 'REVIEWS', w / 2, h * 0.17, h * 0.13, '#3b2417', { stroke: false, font: 'Georgia, serif', weight: 700 });
    x.strokeStyle = '#3b2417'; x.lineWidth = 3; x.beginPath(); x.moveTo(w * 0.2, h * 0.28); x.lineTo(w * 0.8, h * 0.28); x.stroke();
    for (let i = 0; i < 5; i++) { const cx = w * (0.16 + i * 0.17), cy = h * 0.52, r = h * 0.11; x.beginPath();
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath();
      const lit = Math.round(flick * 4) > 0 && i === 0 ? 0.35 : 0; x.fillStyle = lit ? 'rgba(255,210,60,0.35)' : '#e4e0d8'; x.fill(); x.lineWidth = 5; x.strokeStyle = '#a8a29a'; x.stroke(); }
    inked(x, '0 REVIEWS', w / 2, h * 0.8, h * 0.1, '#8a8278', { stroke: false }); });
}
// the laptop screen: a post with his manuscript, a heart and "0 likes"; k = refresh spinner (0..1), pulse = heart pulse
function prnDrawScreen(s, k, pulse) {
  prnRedraw(s.scrC, 's' + Math.round(k * 12) + '_' + Math.round(pulse * 3), (x, w, h) => { x.fillStyle = '#f4f6fa'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#2a5a8a'; x.fillRect(0, 0, w, 54); inked(x, 'MY NEW BOOK', w * 0.3, 28, 26, '#ffffff', { stroke: false, maxW: w * 0.5 });
    x.fillStyle = '#ffffff'; x.fillRect(24, 70, w - 48, h - 92); x.fillStyle = '#c8955c'; x.beginPath(); x.arc(64, 108, 24, 0, TAU); x.fill();
    x.fillStyle = '#e8dcc0'; x.fillRect(110, 92, 180, 14); x.fillRect(110, 114, 120, 10);
    x.fillStyle = '#f2dcb0'; x.fillRect(150, 150, 340, 150); x.strokeStyle = '#c8a870'; x.lineWidth = 4; x.strokeRect(150, 150, 340, 150);
    x.beginPath(); x.moveTo(150, 150); x.lineTo(320, 240); x.lineTo(490, 150); x.stroke(); x.fillStyle = '#c81e1e'; x.beginPath(); x.arc(320, 238, 22, 0, TAU); x.fill();
    const hs = 1 + 0.12 * pulse; x.save(); x.translate(70, 350); x.scale(hs, hs); x.beginPath(); x.moveTo(0, 12); x.bezierCurveTo(-30, -10, -16, -34, 0, -16); x.bezierCurveTo(16, -34, 30, -10, 0, 12); x.lineWidth = 5; x.strokeStyle = '#9a9aa8'; x.stroke(); x.restore();
    inked(x, '0 likes', 170, 350, 40, '#5a5a68', { stroke: false });
    if (k > 0 && k < 1) { x.lineWidth = 8; x.strokeStyle = '#2a8ad8'; x.beginPath(); x.arc(w - 80, 350, 26, k * TAU * 2, k * TAU * 2 + 4.2); x.stroke(); } });
}
// a thought bubble: a soft cloud with a futuristic cradle and a sleeping baby inside (i varies the pod colour)
function prnDrawBubble(C, i) {
  prnRedraw(C, 'b2', (x, w, h) => { x.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, L = [...Array(10)].map((_, k) => { const a = k / 10 * TAU; return [cx + Math.cos(a) * 178, cy + Math.sin(a) * 172, 62]; });
    const cloud = () => { x.beginPath(); for (const [lx, ly, r] of L) { x.moveTo(lx + r, ly); x.arc(lx, ly, r, 0, TAU); } x.moveTo(cx + 190, cy); x.arc(cx, cy, 190, 0, TAU); };
    x.lineWidth = 16; x.strokeStyle = '#3b2417'; cloud(); x.stroke(); x.fillStyle = '#ffffff'; cloud(); x.fill();
    x.save(); x.beginPath(); x.arc(cx, cy, 182, 0, TAU); x.clip(); const g = x.createLinearGradient(0, cy - 190, 0, cy + 190); g.addColorStop(0, ['#a8ccff', '#d4c0ff', '#a8f0d8'][i]); g.addColorStop(1, '#ffffff'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 16; k++) { const R = RNG('bst', i, k); x.fillStyle = 'rgba(255,255,255,0.95)'; x.beginPath(); x.arc(R.r(cx - 160, cx + 160), R.r(cy - 170, cy - 70), R.r(3, 6), 0, TAU); x.fill(); }
    // the hover cradle: a capsule pod with a glowing rim, floating over a ring of light
    x.fillStyle = 'rgba(90,220,255,0.55)'; x.beginPath(); x.ellipse(cx, cy + 135, 125, 22, 0, 0, TAU); x.fill();
    // the baby: a big round white head, closed eyes, a tuft, peeking over the blanket
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy - 20, 78, 0, TAU); x.fill(); x.lineWidth = 9; x.strokeStyle = '#3b2417'; x.stroke();
    x.lineWidth = 7; for (const dx of [-28, 28]) { x.beginPath(); x.arc(cx + dx, cy - 22, 12, 0.25, Math.PI - 0.25); x.stroke(); }
    x.fillStyle = 'rgba(255,140,160,0.5)'; for (const dx of [-46, 46]) { x.beginPath(); x.arc(cx + dx, cy + 2, 11, 0, TAU); x.fill(); }
    x.beginPath(); x.moveTo(cx - 6, cy - 98); x.quadraticCurveTo(cx + 14, cy - 128, cx + 22, cy - 94); x.stroke();
    const pg = x.createLinearGradient(0, cy + 10, 0, cy + 120); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, ['#7a9ad8', '#a088e0', '#5ac0a0'][i]); x.fillStyle = pg;
    x.beginPath(); x.moveTo(cx - 160, cy + 22); x.quadraticCurveTo(cx, cy + 175, cx + 160, cy + 22); x.closePath(); x.fill(); x.lineWidth = 9; x.strokeStyle = '#3b2417'; x.stroke();
    x.strokeStyle = '#4af0ff'; x.lineWidth = 7; x.beginPath(); x.moveTo(cx - 146, cy + 36); x.quadraticCurveTo(cx, cy + 150, cx + 146, cy + 36); x.stroke();
    x.fillStyle = ['#ffd0e0', '#d0e8ff', '#fff0b0'][i]; x.beginPath(); x.moveTo(cx - 150, cy + 26); x.quadraticCurveTo(cx, cy - 6, cx + 150, cy + 26); x.quadraticCurveTo(cx, cy + 60, cx - 150, cy + 26); x.fill(); x.lineWidth = 8; x.strokeStyle = '#3b2417'; x.stroke();
    inked(x, 'z', cx + 100, cy - 92, 52, '#3a6ab8', { stroke: false }); inked(x, 'z', cx + 134, cy - 132, 38, '#3a6ab8', { stroke: false });
    x.restore(); });
}
const prnStudyRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a1810', bgBlur: 2.0, nearBlur: 10, glow: 0.6, glowBlur: 16, bloom: 0.22 }, o));
// the writer seated behind the desk; the pen in his real right fist (screen left), tip on the paper
function prnSeat(s, x = 0) { s.writer.g.position.set(x, PRN_SEAT, -1.7); }
function prnPenInFist(s, writing) {
  const f = prnFist(s.writer, 'armR'); s.pen.visible = true;
  s.pen.position.set(f.x + 0.12, f.y - 0.05, f.z + 0.12); s.pen.rotation.set(0, 0, 0.55 + 0.12 * writing);
}

// =====================================================================
//  s28 — "So every writer is writing for readers who haven't even been born yet.": he scribbles away at his desk; on
//  "readers" thought bubbles pop up one by one over his head — babies asleep in futuristic hover-cradles
// =====================================================================
const PRN_K28 = [[0, [-1.4, 8.8, 15.5], [0.1, 8.4, -1.2], 44], [3.4, [0.4, 9.4, 16.5], [0.3, 9.4, -1.2], 44]];
SHOT_FN['s28'] = (t, u, lt) => {
  const s = prnStudy(); prnStudyWorld(s, t);
  const writing = prnW('writing', 1, 46.5), readers = prnW('readers', 1, 47.0), born = prnW('born', 1, 48.1), yet = prnW('yet', 1, 48.4);
  c3SetCam(s.cam, prnCam(PRN_K28, lt, 's28', { orbit: 0.03 }));
  prnSeat(s, -1.2);
  const scrib = Math.sin(t * 16), zig = [-1.1 + 0.18 * Math.sin(t * 5.2) + 0.08 * scrib, 1.05 + 0.05 * Math.abs(scrib)];
  const look = t > readers + 0.3 ? 1 : 0;
  c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'determined'], [writing, 'thinking'], [readers + 0.3, 'hopeful'], [born, 'smile']], t, 'writer'),
    gaze: look ? [0.6, 0.8] : [-0.3, -0.7], head: look ? [-0.06, 0, 0.05] : [0.08, 0, -0.1], hand: { armR: zig, armL: [1.3, 1.1] }, shadow: 0, ...PRN_SIT });
  prnPenInFist(s, scrib);
  // thought bubbles: a trail of dots, then three bubbles pop in on "readers", "haven't" and "born"
  const T = [readers, readers + 0.45, born - 0.05], P = [[2.2, 4.9], [0.2, 7.1], [2.4, 8.3]];
  s.dots.forEach((d, i) => { const k = EZ.back(clamp((t - (readers - 0.25 + i * 0.08)) / 0.2)); d.visible = k > 0; d.position.set(0.9 + i * 0.28, 5.4 + i * 0.35, 0.3); d.scale.setScalar([0.16, 0.22, 0.3][i] * k + 1e-3); });
  s.bubbles.forEach((b, i) => { prnDrawBubble(s.bubC[i], i); const k = EZ.back(clamp((t - T[i]) / 0.3)); b.visible = k > 0;
    b.position.set(P[i][0] + 0.12 * Math.sin(t * 1.4 + i), P[i][1] + 0.15 * Math.sin(t * 1.7 + i * 2), 0.3 + i * 0.01); b.scale.setScalar(k * 0.7 + 1e-3); b.rotation.z = 0.05 * Math.sin(t + i); });
  prnFg(s, [['plant', [-3.6, -5.6, -9], 1.0], ['books', [3.4, -6.4, -10], -1.1]], PRN_K28, 's28', lt, { orbit: 0.03 });
  prnStudyRender(s, { bgBlur: prnRack(lt, 's28', 1.6, 2.6), glow: 0.75 });
};

// =====================================================================
//  s29 — "No reviews.": close on the corkboard: the review card, five grey stars that flicker as if to light, and don't
// =====================================================================
const PRN_K29 = [[0, [3.9, 10.0, 1.6], [4.9, 9.6, -6.3], 40], [0.9, [4.4, 9.8, 0.9], [4.95, 9.62, -6.3], 39]];
SHOT_FN['s29'] = (t, u, lt) => {
  const s = prnStudy(); prnStudyWorld(s, t);
  const rev = prnW('reviews', 1, 49.1);
  c3SetCam(s.cam, prnCam(PRN_K29, lt, 's29', { orbit: 0.02, creep: 0.03 }));
  s.writer.g.visible = false;
  const fl = t > rev - 0.15 && t < rev + 0.25 ? (Math.floor((t - rev) * 20) % 2 ? 1 : 0) : 0;
  prnDrawReview(s, fl);
  s.card.rotation.z = -0.04 + (t > rev ? 0.06 * Math.exp(-(t - rev) * 5) * Math.sin((t - rev) * 30) : 0);
  prnFg(s, [['quill', [-1.9, -2.6, -4.2], 0.5, 0.5]], PRN_K29, 's29', lt, { orbit: 0.02, creep: 0.03 });
  prnStudyRender(s, { bgBlur: 1.2, nearBlur: 8, glow: 0.4 });
};

// =====================================================================
//  s31 — "They'll never know if anyone liked it.": he stares at the laptop: his post, a grey heart, "0 likes"; he leans
//  in and hits refresh on "liked" — the spinner turns... still 0
// =====================================================================
const PRN_K31 = [[0, [5.0, 8.4, 14.5], [1.6, 6.9, -0.6], 44], [1.8, [4.0, 7.8, 12.5], [1.8, 6.5, -0.4], 42]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = prnStudy(); prnStudyWorld(s, t);
  const never = prnW('never', 1, 51.1), anyone = prnW('anyone', 2, 51.8), liked = prnW('liked', 1, 51.9), it = 52.3;
  c3SetCam(s.cam, prnCam(PRN_K31, lt, 's31', { orbit: -0.03 }));
  prnSeat(s, -0.6);
  const lean = EZ.io(clamp((t - anyone) / 0.3)), tap = t > liked && t < liked + 0.15;
  c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [never, 'worried'], [liked + 0.6, 'sad']], t, 'writer'), gaze: [0.85, -0.55], head: [-0.06 - 0.06 * lean, 0.1 * lean, -0.05],
    hand: { armL: tap ? [2.2, 1.25] : [lerp(1.5, 2.1, lean), lerp(1.1, 1.3, lean)], armR: [-1.2, 1.05] }, lean: -0.05 * lean, x: t > liked + 0.6 ? ['sweat'] : [], shadow: 0, ...PRN_SIT });
  const k = clamp((t - liked) / 0.55);
  prnDrawScreen(s, k, t > liked + 0.55 ? Math.abs(Math.sin((t - liked) * 6)) * Math.exp(-(t - liked - 0.55) * 3) : 0);
  s.lid.rotation.x = -0.25;
  prnFg(s, [['shade', [-3.2, 4.6, -7], 0.8], ['books', [3.2, -5.0, -8.5], -1.0]], PRN_K31, 's31', lt, { orbit: -0.03 });
  prnStudyRender(s, { bgBlur: prnRack(lt, 's31', 1.8, 2.6), glow: 0.8 });
};

// =====================================================================
//  s32 — "They just write it, seal it, and walk away.": a last scribble on "write", the envelope on the desk, he presses
//  the brass stamp into red wax on "seal" — a glowing seal — then stands up and strides off to the right on "walk away"
// =====================================================================
const PRN_K32 = [[0, [0.6, 8.6, 15.5], [-0.2, 6.6, -0.8], 46], [1.9, [-0.4, 7.4, 12.5], [-0.4, 5.6, -0.2], 44]];
SHOT_FN['s32'] = (t, u, lt) => {
  const s = prnStudy(); prnStudyWorld(s, t);
  const write = prnW('write', 1, 52.9), seal = prnW('seal', 1, 53.4), walk = prnW('walk', 2, 54.1), away = prnW('away', 2, 54.3);
  c3SetCam(s.cam, prnCam(PRN_K32, lt, 's32', { orbit: 0.03 }));
  // envelope appears (he slides it over) after the scribble; the seal on "seal"
  s.env.visible = t > write + 0.3; s.env.position.set(lerp(1.6, 0.3, EZ.o2(clamp((t - (write + 0.3)) / 0.2))), PRN_DESK + 0.06, -1.0);
  const press = clamp((t - (seal - 0.12)) / 0.2), sealed = t > seal + 0.05;
  s.seal.visible = sealed; s.seal.scale.set(sealed ? EZ.back(clamp((t - seal - 0.05) / 0.2)) + 1e-3 : 1e-3, 1, sealed ? EZ.back(clamp((t - seal - 0.05) / 0.2)) + 1e-3 : 1e-3);
  if (sealed) { s.sealGlow.visible = true; s.env.updateMatrixWorld(true); s.sealGlow.position.copy(s.seal.getWorldPosition(prnV(0, 0, 0))).add(prnV(0, 0.3, 0)); s.sealGlow.quaternion.copy(s.cam.quaternion); s.sealGlow.scale.setScalar(2.2 * (0.85 + 0.15 * Math.sin(t * 8))); }
  // him: writes, stamps, stands, walks off right (behind the desk, then past its end)
  const stand = EZ.o2(clamp((t - (walk - 0.15)) / 0.2)), go = clamp((t - walk) / 0.55), k = t * 11;
  const wx = lerp(-0.6, 9.5, EZ.i2(go));
  s.writer.g.position.set(wx, lerp(PRN_SEAT, PRN_FOOT, stand), -1.7);
  let hand;
  if (t < seal - 0.25) hand = { armR: [-1.0 + 0.15 * Math.sin(t * 16), 1.05], armL: [1.3, 1.1] };   // writing
  else if (t < walk - 0.15) hand = { armR: [0.67, lerp(2.5, 1.91, EZ.i2(press) * (1 - EZ.o2(clamp((t - seal - 0.1) / 0.2))))], armL: [1.3, 1.1] };   // over the seal: up, press down, lift
  else hand = { armR: [-1.4, 0.4 + 0.15 * Math.sin(k)], armL: [1.35, 0.5 - 0.15 * Math.sin(k)] };
  c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'determined'], [seal + 0.1, 'proud'], [walk - 0.1, 'whistling']], t, 'writer'), gaze: t < walk ? [0.1, -0.8] : [0.9, 0],
    head: t < walk ? [0.08, 0, -0.08] : [0, 0, 0], hand, lift: (q) => 0.12 * EZ.back(seg(q, seal - 0.02, seal + 0.08)) * Math.exp(-Math.max(0, q - seal - 0.08) * 5),
    shadow: stand > 0.5 ? 0.7 : 0, ...(stand < 1 ? PRN_SIT : go > 0 && go < 1 ? prnWalkFeet(k) : PRN_STAND) });
  if (t < seal - 0.25) prnPenInFist(s, Math.sin(t * 16));
  else if (t < walk - 0.15) { const f = prnFist(s.writer, 'armR'); s.stamp.visible = true; s.stamp.position.set(f.x, f.y - 0.42, f.z + 0.14); s.stamp.rotation.set(0, 0, 0); }
  prnFg(s, [['plant', [-3.6, -4.8, -8.5], 1.0], ['quill', [3.4, 3.6, -8], -0.8, -0.4]], PRN_K32, 's32', lt, { orbit: 0.03 });
  prnStudyRender(s, { bgBlur: prnRack(lt, 's32', 1.6, 2.4), glow: 0.75 });
};

// =====================================================================
//  WORLD 3 — the yard: his red cabin with a grass roof, a picket fence, the mailbox on its post, pines, sky
// =====================================================================
function prnYard() {
  if (PRN.yard) return PRN.yard;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff4e4', ambI: 0.5, sky: '#cfe6ff', ground: '#6a8a4a', key: '#fff2d8', keyI: 1.15, keyP: [-14, 26, 18], rim: '#ffd8b0', rimI: 0.5, rimP: [14, 12, -20] });
  s.sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 21, band: [0.12, 0.46], clouds: 80, scale: 0.6, midAt: 0.44 }), side: THREE.BackSide }));   // Ricks sky (kit)
  scene.add(s.sky);
  scene.add(pl(1200, 1200, c3Prop('#ffffff', { map: prnTexGrass(), rough: 0.95 }), 0, 0, 0, 0, -Math.PI / 2));
  // a stone path to the gate
  for (let i = 0; i < 9; i++) { const R = RNG('path', i), st = c3Mesh(prnSph(), c3Toon('#b8b0a4'), 0.03); st.scale.set(R.r(0.9, 1.3), 0.12, R.r(0.7, 1.0)); st.position.set(-5.6 + R.n(0.3), 0.06, -2 - i * 1.6); scene.add(st); }
  // the cabin: falu-red boards, white trims, a lit window, a door, a sod roof with flowers
  const cab = new THREE.Group(); cab.position.set(-3, 0, -20); scene.add(cab);
  cab.add(rb(18, 9, 10, c3Prop('#ffffff', { map: prnTexSiding(), rough: 0.8 }), 0, 4.5, 0, 0.06));
  const trim = c3Toon('#f8f4ec');
  for (const x of [-9, 9]) cab.add(rb(0.5, 9.2, 0.5, trim, x, 4.6, 5.0, 0.03));
  cab.add(pl(3, 2.6, c3Flat('#ffe8a8', { glow: '#ffcc66' }), -4.2, 5.2, 5.05)); cab.add(pl(3, 2.6, c3Flat('#ffe8a8', { glow: '#ffcc66' }), 4.4, 5.2, 5.05));
  for (const x of [-4.2, 4.4]) { cab.add(rb(3.6, 0.35, 0.3, trim, x, 6.6, 5.1, 0.02)); cab.add(rb(3.6, 0.35, 0.3, trim, x, 3.8, 5.1, 0.02)); cab.add(rb(0.3, 2.9, 0.3, trim, x - 1.65, 5.2, 5.1, 0.02)); cab.add(rb(0.3, 2.9, 0.3, trim, x + 1.65, 5.2, 5.1, 0.02)); cab.add(rb(0.18, 2.6, 0.2, trim, x, 5.2, 5.12, 0.01)); }
  cab.add(rb(2.6, 5.2, 0.3, c3Prop('#2a5a7a', { rough: 0.5 }), 0, 2.6, 5.05, 0.03)); cab.add(cyl(0.14, 0.14, 0.2, c3Prop('#e8c060', { metal: 0.9, rough: 0.2 }), 0.8, 2.6, 5.25, 0.01, 10).rotateX(Math.PI / 2));
  for (const sd of [1, -1]) { const roof = rb(20, 0.8, 7.6, c3Prop('#5a3a22', { rough: 0.8 }), 0, 0, 0, 0.04), sod = rb(20.4, 1.0, 7.8, c3Toon('#6aa848'), 0, 0.7, 0, 0.05); const g = new THREE.Group(); g.add(roof); g.add(sod);
    g.position.set(0, 10.6, sd * 2.9); g.rotation.x = -sd * 0.62; cab.add(g);
    for (let i = 0; i < 10; i++) { const R = RNG('flow', sd, i), f = c3Mesh(prnSph(), c3Toon(['#ffe066', '#ffffff', '#ff8ab0'][i % 3]), 0.015); f.scale.setScalar(0.22); f.position.set(R.r(-9, 9), 1.25, R.r(-3.4, 3.4)); g.add(f); } }
  // cabin detail (Ricks exteriors): shutters, cross mullions and flower boxes on both windows, a chimney, a porch lamp, a stone path
  for (const x of [-4.2, 4.4]) {
    for (const sx of [-1, 1]) cab.add(rb(1.1, 2.9, 0.18, c3Prop('#ffffff', { map: c3TexWall('siding', '#2a5a7a', { rep: [1, 2] }), rough: 0.6 }), x + sx * 2.35, 5.2, 5.12, 0.02));
    cab.add(rb(0.14, 2.6, 0.12, trim, x, 5.2, 5.16, 0)); cab.add(rb(3, 0.14, 0.12, trim, x, 5.4, 5.16, 0));
    cab.add(rb(3.4, 0.7, 0.8, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a') }), x, 3.35, 5.45, 0.02));
    for (let k = 0; k < 6; k++) { const f = c3Mesh(prnSph(), c3Prop(['#e84a6a', '#ffd040', '#ffffff', '#f080b0'][k % 4]), 0.012); f.scale.setScalar(0.3); f.position.set(x - 1.3 + k * 0.52, 3.85, 5.5); cab.add(f); } }
  cab.add(rb(1.6, 5, 1.6, c3Prop('#ffffff', { map: c3TexWall('brick', '#9a4a3a') }), 5.5, 12.5, -1.5, 0.04)); cab.add(rb(2, 0.35, 2, trim, 5.5, 15.1, -1.5, 0.03));   // chimney
  { const lp = c3Mesh(c3RBox(0.5, 0.7, 0.5, 0.08), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.02); lp.position.set(2, 5.9, 5.4); cab.add(lp); }   // porch lamp
  for (let i = 0; i < 6; i++) { const R = RNG('path', i), st = c3Mesh(c3RBox(1.6, 0.18, 1.1, 0.08), c3Prop('#b8b0a4', { rough: 0.9 }), 0.02); st.position.set(-3 + R.n(0.3), 0.09, -13.5 + i * 1.6); st.rotation.y = R.n(0.15); scene.add(st); }   // stone path to the door
  // the picket fence and gate
  const pick = c3Toon('#f8f4ec');
  for (let i = 0; i < 30; i++) { const x = -26 + i * 1.4; if (x > -7 && x < -4.2) continue; const p = rb(0.42, 2.6, 0.18, pick, x, 1.3, -4, 0.02); scene.add(p); const tip = c3Mesh(new THREE.ConeGeometry(0.3, 0.45, 4), pick, 0.02); tip.position.set(x, 2.8, -4); tip.rotation.y = Math.PI / 4; scene.add(tip); }
  for (const y of [0.8, 2.0]) scene.add(rb(42, 0.22, 0.12, pick, -5, y, -4.12, 0.015));
  // pines behind
  const pineM = [c3Toon('#2e5a3e'), c3Toon('#3e6e4a'), c3Toon('#244a34')];
  for (let i = 0; i < 26; i++) { const R = RNG('pine', i), g = new THREE.Group(), hgt = R.r(14, 26); g.position.set(R.r(-60, 60), 0, R.r(-60, -32)); scene.add(g);
    g.add(cyl(0.5, 0.7, 3, c3Toon('#6a4a2a'), 0, 1.5, 0, 0.04, 8)); for (let k = 0; k < 4; k++) { const c = c3Mesh(new THREE.ConeGeometry(hgt * (0.3 - k * 0.05), hgt * 0.38, 9), pineM[(i + k) % 3], 0.06); c.position.y = 3 + k * hgt * 0.2 + hgt * 0.19; g.add(c); } }
  // bushes and a birch near the fence
  for (let i = 0; i < 8; i++) { const R = RNG('bush', i), b = c3Mesh(prnSph(), c3Toon(i % 2 ? '#4a8a3a' : '#5aa04a'), 0.05); b.scale.set(R.r(1.4, 2.4), R.r(1.0, 1.6), R.r(1.2, 2)); b.position.set(R.r(-20, 18), 0.8, R.r(-6.5, -5)); scene.add(b); }
  // the mailbox on its post (x 0): a rounded-top box, a door hinged at the bottom of its front, a red flag DOWN
  const mb = new THREE.Group(); mb.position.set(0.6, 0, 0); mb.scale.setScalar(1.3); scene.add(mb); s.mb = mb;
  mb.add(rb(0.45, 4.3, 0.45, c3Prop('#ffffff', { map: texWood(), rough: 0.6 }), 0, 2.15, 0, 0.03));
  mb.add(rb(1.4, 0.2, 2.4, c3Prop('#ffffff', { map: texWood(), rough: 0.6 }), 0, 4.3, 0.1, 0.02));
  const blue = c3Prop('#2a7ad8', { rough: 0.3, metal: 0.35 }), MW = 1.6, MH = 0.9, ML = 2.6, MR = MW / 2, MY = 4.4, MF = 1.3 + 0.1;
  mb.add(rb(MW, MH, ML, blue, 0, MY + MH / 2, 0.1, 0.04));
  { const top = c3Mesh(new THREE.CylinderGeometry(MR, MR, ML, 28, 1, false, -Math.PI / 2, Math.PI), blue, 0.04); top.rotation.x = Math.PI / 2; top.position.set(0, MY + MH, 0.1); mb.add(top); }
  // the dark mouth (seen when the door opens): a rect + half disc, slightly inside the front; the cobweb in front of it
  const mouthShape = new THREE.Shape(); mouthShape.moveTo(-MR + 0.08, MY + 0.06); mouthShape.lineTo(MR - 0.08, MY + 0.06); mouthShape.lineTo(MR - 0.08, MY + MH); mouthShape.absarc(0, MY + MH, MR - 0.08, 0, Math.PI, false); mouthShape.closePath();
  s.mouth = new THREE.Mesh(new THREE.ShapeGeometry(mouthShape, 24), c3Flat('#ffffff', { map: tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h * 0.6, 4, w / 2, h * 0.6, w * 0.7); g.addColorStop(0, '#05030a'); g.addColorStop(1, '#2a3a5a'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 128, 128) }));
  { const uv = s.mouth.geometry.attributes.uv, pos = s.mouth.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + MR) / MW, (pos.getY(i) - MY) / (MH + MR)); }
  s.mouth.position.z = MF + 0.005; mb.add(s.mouth);
  s.web = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.2, MH + MR - 0.15), new THREE.MeshBasicMaterial({ map: tex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(240,244,255,0.9)'; x.lineWidth = 2.5;
    const cx = w * 0.72, cy = h * 0.22; for (let k = 0; k < 9; k++) { const a = Math.PI * 0.45 + k / 8 * Math.PI * 0.75; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * h); x.stroke(); }
    for (let r = 18; r < w; r += 22) { x.beginPath(); for (let k = 0; k <= 8; k++) { const a = Math.PI * 0.45 + k / 8 * Math.PI * 0.75; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9); } x.stroke(); } }, 256, 256), transparent: true, depthWrite: false, toneMapped: false }));
  s.web.position.set(0, MY + (MH + MR) / 2 + 0.05, MF + 0.02); mb.add(s.web);
  // the door: hinged on the bottom front edge (pivot), its face = rect + half disc, slightly larger than the mouth
  s.doorPivot = new THREE.Group(); s.doorPivot.position.set(0, MY, MF + 0.04); mb.add(s.doorPivot);
  const doorShape = new THREE.Shape(); doorShape.moveTo(-MR, 0); doorShape.lineTo(MR, 0); doorShape.lineTo(MR, MH); doorShape.absarc(0, MH, MR, 0, Math.PI, false); doorShape.closePath();
  const door = c3Mesh(new THREE.ExtrudeGeometry(doorShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), c3Prop('#3a8ae8', { rough: 0.3, metal: 0.35 }), 0.03); s.doorPivot.add(door);
  { const kn = c3Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 6, 10), c3Prop('#e8c060', { metal: 0.9, rough: 0.2 }), 0.015); kn.rotation.z = Math.PI / 2; kn.position.set(0, MH + 0.25, 0.16); s.doorPivot.add(kn); }
  // the red flag, DOWN (no mail)
  s.flag = new THREE.Group(); s.flag.position.set(MR + 0.08, MY + 0.6, -0.2); mb.add(s.flag);
  s.flag.add(rb(0.08, 1.4, 0.12, c3Prop('#d8322a', { rough: 0.35 }), 0, 0, -0.55, 0.012).rotateX(Math.PI / 2)); s.flag.add(rb(0.08, 0.5, 0.6, c3Prop('#d8322a', { rough: 0.35 }), 0, 0, -1.3, 0.012));
  // the spider on its thread (inside the mouth, drops on "mail")
  s.spider = new THREE.Group(); mb.add(s.spider);
  { const bk = c3Toon('#1a1418'), b = c3Mesh(prnSph(), bk, 0.012); b.scale.set(0.16, 0.16, 0.12); s.spider.add(b); const hd = c3Mesh(prnSph(), bk, 0.01); hd.scale.setScalar(0.09); hd.position.y = -0.17; s.spider.add(hd);
    for (const sd of [1, -1]) for (let k = 0; k < 4; k++) { const l = c3Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 5), bk, 0); l.position.set(sd * 0.2, 0.06 - k * 0.07, 0); l.rotation.z = sd * (1.0 + k * 0.2); s.spider.add(l); }
    const ey = c3Mesh(prnSph(), c3Flat('#ffffff'), 0); ey.scale.setScalar(0.035); ey.position.set(0.04, -0.17, 0.08); s.spider.add(ey); const ey2 = ey.clone(); ey2.position.x = -0.04; s.spider.add(ey2); }
  s.thread = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4), c3Flat('#f0f4ff')); mb.add(s.thread);
  // falling birch leaves (params fixed at build)
  s.leaves = [...Array(12)].map((_, i) => { const R = RNG('yleaf', i), m = new THREE.Mesh(new THREE.CircleGeometry(0.16, 8), c3Toon(['#f2c030', '#e88a2a', '#d8b040'][i % 3], { side: THREE.DoubleSide })); m.scale.set(1, 1.5, 1); scene.add(m);
    m.userData = { x: R.r(-4, 5), z: R.r(-2, 3), y0: R.r(9, 14), sp: R.r(0.8, 1.4), ph: R.r(0, 6), sw: R.r(0.5, 1.2) }; return m; });
  s.writer = c3Person({ key: 'writer', outfit: 'sweater', hairStyle: 'rk_genius' }); s.writer.g.scale.setScalar(PRN_K); scene.add(s.writer.g);
  [mb, s.writer.g, ...s.leaves].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = {
    grass: (() => { const g = new THREE.Group(); for (let i = 0; i < 26; i++) { const R = RNG('ygr', i), c = c3Mesh(new THREE.ConeGeometry(0.1, R.r(3, 5.5), 5), c3Toon(i % 2 ? '#5a9a3a' : '#8ab84a'), 0.0); c.position.set(R.n(1.8), 0, 0); c.rotation.z = R.n(0.3); g.add(c); } return g; })(),
    flower: (() => { const g = new THREE.Group(); g.add(cyl(0.06, 0.06, 3, c3Toon('#4a8a3a'), 0, -1.5, 0, 0, 6)); for (let k = 0; k < 6; k++) { const p = c3Mesh(prnSph(), c3Toon('#ffffff'), 0.02); p.scale.set(0.3, 0.6, 0.1); p.position.set(Math.cos(k) * 0.45, Math.sin(k) * 0.45, 0); p.rotation.z = k + Math.PI / 2; g.add(p); } const c = c3Mesh(prnSph(), c3Toon('#ffd23c'), 0.02); c.scale.setScalar(0.3); g.add(c); return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#a8d0f0', mid: '#f0e4c8', bot: '#4a6a3a', cards: [[0, 30, -20, 40, 8, '#ffffff'], [-30, 10, 10, 10, 18, '#cfe6ff'], [30, 12, -10, 10, 18, '#ffe8c8']] });
  c3ShadeScene(scene, { dark: 0.34 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 16);
  return (PRN.yard = s);
}

// =====================================================================
//  s30 — "No fan mail.": in front of his red cabin he opens the mailbox on "fan" — empty: a cobweb, and on "mail" a
//  little spider drops down on its thread and waves; the flag stays down; a few birch leaves fall
// =====================================================================
const PRN_K30 = [[0, [4.6, 7.4, 19.5], [-0.8, 5.8, 0.0], 44], [1.0, [3.8, 7.0, 17.5], [-0.6, 5.6, 0.3], 42]];
SHOT_FN['s30'] = (t, u, lt) => {
  const s = prnYard();
  const fan = prnW('fan', 1, 50.1), mail = prnW('mail', 1, 50.3);
  c3SetCam(s.cam, prnCam(PRN_K30, lt, 's30', { orbit: -0.03 }));
  // him: standing at the left of the post, his near hand reaching the knob and pulling the door down
  s.writer.g.position.set(-2.9, PRN_FOOT, 0.2);
  const open = EZ.back(clamp((t - (fan - 0.1)) / 0.3)), ang = -1.75 * open;
  s.doorPivot.rotation.x = -ang;   // positive x-rotation tips the top of the door toward us and down
  // the knob in world space -> his hand target in his billboard space (so the fist really holds the knob)
  s.mb.updateMatrixWorld(true); const knob = s.doorPivot.localToWorld(prnV(0, 0.9 + 0.25, 0.2));
  s.writer.g.updateMatrixWorld(true); const kl = s.writer.root.worldToLocal(knob.clone());
  const reach = clamp((t - 49.85) / 0.25), letGo = clamp((t - (fan + 0.35)) / 0.2);
  const hR = [lerp(1.2, kl.x, reach * (1 - letGo)), lerp(1.0, kl.y, reach * (1 - letGo))];
  c3PersonPose(s.writer, s.cam, t, { expr: c3FaceAt([[0, 'hopeful'], [fan + 0.15, 'sad'], [mail + 0.2, 'crying']], t, 'writer'), gaze: [0.85, -0.2], head: [0.06, 0, -0.05],
    hand: { armL: hR, armR: [-1.3, 0.6] }, x: t > mail + 0.3 ? ['tears'] : [], ...PRN_STAND });
  // the spider drops from the roof of the mouth on "mail", bobbing on its thread
  const drop = EZ.o2(clamp((t - mail) / 0.3)), MY = 4.4, top = MY + 0.9 + 0.65, sy = top - 0.15 - drop * 0.95 + 0.06 * Math.sin((t - mail) * 9) * drop;
  s.spider.visible = open > 0.5; s.spider.position.set(-0.25, sy, 1.48); s.spider.scale.setScalar(1.5); s.spider.rotation.z = 0.15 * Math.sin(t * 4);
  s.thread.visible = s.spider.visible; s.thread.position.set(-0.25, (top + sy) / 2, 1.48); s.thread.scale.set(1, Math.max(0.01, top - sy), 1);
  s.leaves.forEach((m) => { const d = m.userData, y = d.y0 - mod((t - 49) * d.sp, 14); m.position.set(d.x + Math.sin(t * 1.3 + d.ph) * d.sw, Math.max(0.05, y), d.z); m.rotation.set(Math.sin(t * 2 + d.ph), t + d.ph, Math.cos(t * 1.5 + d.ph)); });
  prnFg(s, [['grass', [-2.6, -4.2, -7], 1.2], ['flower', [2.6, -3.6, -6.5], -0.9]], PRN_K30, 's30', lt, { orbit: -0.03 });
  c3Render(s.scene, s.cam, { bg: '#bfe2ff', bgBlur: prnRack(lt, 's30', 1.8, 2.8), nearBlur: 10, glow: 0.5, glowBlur: 16, bloom: 0.18 });
};

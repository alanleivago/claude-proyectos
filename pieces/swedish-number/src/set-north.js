// =====================================================================
//  SET north — a snowy Swedish village on a bright winter day: s04 (Just… Sweden: wide), s06 (somewhere up north: the
//  camera flies in over the hills), s07 (a random person picks up: phones ring all over the village, the farmer
//  answers — CONTINUOUS from s06), s08 (a farmer, with his cow), s09 (a student, with her bike), s23 (the voice of the
//  whole country: aerial, speech bubbles pop from every house and person), s27 (a poet reciting by the frozen lake).
//  Registers SHOT_FN[id]. Helpers are prefixed nth. Everything random is drawn once at build (RNG).
//  Layout (units: a person ~11 tall): snow ground y 0; falu-red cottages (c3Building x3.6, snowy roofs) at the back,
//  a red barn x 52 z -26, the farmer x 30 z 10 with a cow x 41 z 4; the student x -16 z 14 with a bike; the
//  frozen lake x -72 z -8 with the poet on a bench (x -66, z 14); a flagpole x -2 z -12; a moose far right.
// =====================================================================
const NTH = {}, NTH_BENCH = 2.4;
function nthTexSnow() { const t = tex((x, w, h) => { x.fillStyle = '#cfe0f4'; x.fillRect(0, 0, w, h); const R = RNG('nthsnow');
  for (let i = 0; i < 320; i++) { x.fillStyle = R.f() < 0.6 ? 'rgba(110,140,220,0.45)' : 'rgba(255,255,255,0.95)'; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(6, 30), R.r(3, 10), R.r(0, 3), 0, TAU); x.fill(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 30); return t; }
function nthTexIce() { return tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, '#bfe8ff'); g.addColorStop(1, '#7ac0e8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('nthice'); x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 3; for (let i = 0; i < 30; i++) { const a = R.r(0, TAU), r = R.r(40, w * 0.45); x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); x.lineTo(w / 2 + Math.cos(a + 0.2) * (r + 30), h / 2 + Math.sin(a + 0.2) * (r + 30)); x.stroke(); } }, 512, 512); }
function nthTexBurst(txt) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 0.34 : 0.48) * w; x.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r * 0.7); } x.closePath();
  x.fillStyle = '#ffe23a'; x.fill(); x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.stroke(); inked(x, txt, w / 2, h / 2, h * 0.2, '#e8282a', { stroke: '#3b2417', sw: h * 0.025, maxW: w * 0.56 }); }, 512, 512); }
function nthTexBubble(kind) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.fillStyle = '#fffaf0';
  x.beginPath(); x.ellipse(w / 2, h * 0.42, w * 0.44, h * 0.34, 0, 0, TAU); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(w * 0.34, h * 0.7); x.lineTo(w * 0.24, h * 0.94); x.lineTo(w * 0.5, h * 0.74); x.closePath(); x.fill(); x.stroke(); x.fillRect(w * 0.32, h * 0.66, w * 0.2, h * 0.07);
  if (kind === 0) inked(x, 'HEJ', w / 2, h * 0.43, h * 0.24, '#1a5aa8', { stroke: false });
  else if (kind === 1) { x.fillStyle = '#1a5aa8'; x.fillRect(w * 0.26, h * 0.26, w * 0.48, h * 0.32); x.fillStyle = '#ffcc1a'; x.fillRect(w * 0.4, h * 0.26, w * 0.07, h * 0.32); x.fillRect(w * 0.26, h * 0.38, w * 0.48, h * 0.08); }
  else if (kind === 2) inked(x, 'HA HA', w / 2, h * 0.43, h * 0.2, '#e8483a', { stroke: false });
  else { x.fillStyle = '#e8304a'; const cx = w / 2, cy = h * 0.44, r = w * 0.09; x.beginPath(); x.moveTo(cx, cy + r * 1.5); x.bezierCurveTo(cx - r * 2.4, cy - r * 0.1, cx - r, cy - r * 2, cx, cy - r * 0.6); x.bezierCurveTo(cx + r, cy - r * 2, cx + r * 2.4, cy - r * 0.1, cx, cy + r * 1.5); x.fill(); } }, 256, 256); }
function nthTexNotes() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#3b2417'; x.strokeStyle = '#3b2417'; x.lineWidth = 10;
  for (const [cx, cy] of [[0.3, 0.7], [0.7, 0.6]]) { x.beginPath(); x.ellipse(cx * w, cy * h, w * 0.1, h * 0.07, -0.4, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx * w + w * 0.09, cy * h); x.lineTo(cx * w + w * 0.09, cy * h - h * 0.45); x.stroke(); }
  x.lineWidth = 16; x.beginPath(); x.moveTo(0.39 * w, 0.25 * h); x.lineTo(0.79 * w, 0.15 * h); x.stroke(); }, 256, 256); }
// small props
function nthPine(s, seed) { const g = new THREE.Group(), R = RNG('nthpine', seed), G = c3Prop(R.f() < 0.5 ? '#1f6a46' : '#2a7a4e', { rough: 0.8 }), Wt = c3Prop('#f4f8fc', { rough: 0.7 });
  g.add(cyl(0.4 * s, 0.55 * s, 2.4 * s, c3Prop('#6a3e22'), 0, 1.2 * s, 0, 0.03, 8));
  for (let k = 0; k < 4; k++) { const r = (2.8 - k * 0.6) * s, h = 3.2 * s, y = (2.2 + k * 2.0) * s; const c = c3Mesh(new THREE.ConeGeometry(r, h, 10), G, 0.05); c.position.y = y + h / 2; g.add(c);
    const cap = c3Mesh(new THREE.ConeGeometry(r * 0.62, h * 0.42, 10), Wt, 0.03); cap.position.y = y + h * 0.82; g.add(cap); }
  return g; }
function nthCow() {   // a cartoon dairy cow: round white body with black patches, pink snout, horns, a bell; head along +x
  const g = new THREE.Group(), Wh = c3Prop('#fbf8f2', { rough: 0.6 }), Bk = c3Prop('#2a2420', { rough: 0.6 }), sph = new THREE.SphereGeometry(1, 20, 14);
  const body = c3Mesh(new THREE.CapsuleGeometry(2.0, 3.6, 8, 16), Wh, 0.06); body.rotation.z = Math.PI / 2; body.position.y = 5.4; g.add(body);
  const R = RNG('cowspots'); for (let i = 0; i < 6; i++) { const a = R.r(0.4, 2.7), x = R.r(-2.2, 2.0), sp = c3Mesh(sph, Bk, 0); sp.scale.set(R.r(0.7, 1.2), R.r(0.6, 1.0), 0.25);
    sp.position.set(x, 5.4 + Math.cos(a) * 1.95, Math.sin(a) * 1.95 * (i % 2 ? 1 : -1)); sp.lookAt(x, 5.4, 0); sp.rotateY(Math.PI); g.add(sp); }
  for (const [lx, lz] of [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]]) { g.add(cyl(0.45, 0.4, 3.6, Wh, lx, 1.8, lz, 0.04, 12)); g.add(cyl(0.48, 0.48, 0.5, Bk, lx, 0.25, lz, 0.02, 12)); }
  const hd = new THREE.Group(); hd.position.set(4.2, 7.0, 0); g.add(hd);
  const sk = c3Mesh(sph, Wh, 0.05); sk.scale.set(1.5, 1.4, 1.3); hd.add(sk); const sn = c3Mesh(sph, c3Prop('#f2a8b0', { rough: 0.5 }), 0.04); sn.scale.set(0.9, 0.75, 1.05); sn.position.set(1.15, -0.6, 0); hd.add(sn);
  for (const sz of [-1, 1]) { const hn = c3Mesh(new THREE.ConeGeometry(0.22, 1.0, 10), c3Prop('#f6eed8'), 0.02); hn.position.set(-0.2, 1.4, sz * 0.8); hn.rotation.x = -sz * 0.5; hd.add(hn);
    const ear = c3Mesh(sph, Wh, 0.03); ear.scale.set(0.3, 0.25, 0.7); ear.position.set(-0.3, 0.7, sz * 1.5); hd.add(ear);
    const e = c3Mesh(new THREE.SphereGeometry(0.2, 10, 8), c3Toon('#1a1210'), 0); e.position.set(1.2, 0.45, sz * 0.55); hd.add(e);
    const n = c3Mesh(new THREE.SphereGeometry(0.12, 8, 6), c3Toon('#7a3a3a'), 0); n.position.set(1.98, -0.55, sz * 0.3); hd.add(n); }
  const tail = rb(0.25, 3.0, 0.25, Wh, -4.0, 4.4, 0, 0.02); tail.rotation.z = -0.25; g.add(tail);
  const bell = c3Mesh(new THREE.SphereGeometry(0.5, 12, 8), c3Prop('#f0c040', { metal: 0.8, rough: 0.25 }), 0.02); bell.position.set(3.6, 4.6, 0); g.add(bell); g.userData.head = hd; return g; }
function nthMoose() { const g = new THREE.Group(), B = c3Prop('#6a3e22', { rough: 0.7 }), A = c3Prop('#d8c09a', { rough: 0.6 });
  g.add(rb(8, 4.4, 3.4, B, 0, 7.4, 0, 0.06)); for (const [lx, lz] of [[-3, -1.1], [3, -1.1], [-3, 1.1], [3, 1.1]]) g.add(rb(0.8, 5.4, 0.8, B, lx, 2.7, lz, 0.04));
  const hd = new THREE.Group(); hd.position.set(5, 9.4, 0); g.add(hd); hd.add(rb(3.4, 2.2, 2.0, B, 0.8, 0, 0, 0.05));
  for (const sz of [-1, 1]) { const an = rb(3.0, 0.4, 1.8, A, -0.2, 1.8, sz * 1.6, 0.03); an.rotation.x = sz * 0.5; hd.add(an); for (let k = 0; k < 3; k++) hd.add(rb(0.3, 0.9, 0.3, A, -1.2 + k * 0.9, 2.4, sz * (2.1 + k * 0.1), 0.02)); }
  return g; }
function nthBike(color) { const g = new THREE.Group(), fr = c3Prop(color, { metal: 0.3, rough: 0.4 }), blk = c3Toon('#2a2a30');
  for (const wx of [-1.15, 1.15]) { const w = c3Mesh(new THREE.TorusGeometry(0.75, 0.09, 8, 24), blk, 0.012); w.position.set(wx, 0.85, 0); g.add(w); }
  const tb = c3Mesh(c3RBox(2.2, 0.14, 0.14, 0.05), fr, 0.012); tb.position.set(0.05, 1.45, 0); tb.rotation.z = -0.2; g.add(tb);
  const st = c3Mesh(c3RBox(0.14, 1.2, 0.14, 0.05), fr, 0.012); st.position.set(-0.55, 1.35, 0); st.rotation.z = 0.2; g.add(st);
  const fk = c3Mesh(c3RBox(0.12, 1.2, 0.12, 0.05), fr, 0.012); fk.position.set(1.0, 1.35, 0); fk.rotation.z = -0.25; g.add(fk);
  g.add(rb(0.7, 0.16, 0.32, c3Toon('#3a2a20'), -0.7, 2.0, 0, 0.01)); g.add(rb(0.12, 0.12, 1.1, blk, 0.85, 2.05, 0, 0.01));
  g.add(rb(0.8, 0.5, 0.7, c3Prop('#a87a48', { rough: 0.7 }), 1.45, 1.7, 0, 0.012)); g.add(rb(0.6, 0.3, 0.5, c3Prop('#e8483a'), 1.45, 2.05, 0, 0.01));   // basket + books
  return g; }

function nthBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.5, 5000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.6, sky: '#cfe6ff', ground: '#c8d8e8', key: '#fff2dc', keyI: 1.2, keyP: [-60, 80, 60], rim: '#ffe0c0', rimI: 0.5, rimP: [60, 30, -60] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 46, band: [0.14, 0.46], clouds: 60, scale: 0.7, midAt: 0.42, sun: [0.3, 0.3, 30], pal: { mid: '#7ab4ea', hor: '#a8d4f4' } }), side: THREE.BackSide })));
  const snow = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), c3Prop('#ffffff', { map: nthTexSnow(), rough: 0.6, env: 0.6 })); snow.rotation.x = -Math.PI / 2; scene.add(snow);
  // rolling snowy hills and dark forest ridges far away
  for (let i = 0; i < 16; i++) { const R = RNG('nthhill', i), a = -1.3 + i / 15 * 2.6, d = R.r(260, 420), r = R.r(80, 150);
    const h = c3Mesh(new THREE.SphereGeometry(r, 32, 16), c3Prop(i % 3 ? '#f2f6fb' : '#dfe9f4', { rough: 0.8 }), 0); h.scale.y = R.r(0.22, 0.4); h.position.set(Math.sin(a) * d, -r * 0.05, -Math.cos(a) * d); scene.add(h); }
  // the frozen lake
  const lake = new THREE.Mesh(new THREE.CircleGeometry(30, 48), c3Prop('#ffffff', { map: nthTexIce(), rough: 0.15, metal: 0.1, env: 1.0 })); lake.rotation.x = -Math.PI / 2; lake.scale.y = 0.6; lake.position.set(-72, 0.05, -8); scene.add(lake);
  // cottages (falu red, white trim, snowy roofs), the barn
  const C = [['#b8322a', -30, -34, 0.3], ['#c8402e', 12, -46, -0.1], ['#ffcc3a', -58, -50, 0.5], ['#b8322a', 30, -80, 0], ['#3a7ac8', -10, -96, 0.2]];
  s.houses = [];
  C.forEach(([col, x, z, ry], i) => { const b = c3Building({ w: 7, h: 6, d: 6, floors: 2, cols: 3, wall: 'siding', color: col, trim: '#ffffff', roof: 'gable', roofH: 3.4, roofColor: '#eef4fb', door: '#2a5a8a', lit: 0.4, chimney: true, seed: 460 + i, ink: 0.035 });
    b.scale.setScalar(3.4); b.position.set(x, 0, z); b.rotation.y = ry; scene.add(b); s.houses.push(b); });
  s.barn = c3Building({ w: 10, h: 7, d: 8, floors: 1, cols: 2, wall: 'wood', color: '#a82a22', trim: '#ffffff', roof: 'gable', roofH: 4.4, roofColor: '#eef4fb', door: '#7a2a20', lit: 0, chimney: false, seed: 470, ink: 0.035 }); s.barn.scale.setScalar(3.6); s.barn.position.set(54, 0, -28); s.barn.rotation.y = -0.4; scene.add(s.barn);
  // pines everywhere except the stage spots
  const keep = [[30, 10, 18], [41, -4, 12], [-16, 14, 16], [-72, -8, 34], [-66, 14, 10], [-2, -12, 8], [0, 20, 30]];
  for (let i = 0; i < 70; i++) { const R = RNG('nthp', i); let x, z, ok; let k = 0; do { x = R.r(-160, 160); z = R.r(-200, 30); ok = keep.every(([a, b, r]) => Math.hypot(x - a, z - b) > r) && s.houses.every((h) => Math.hypot(x - h.position.x, z - h.position.z) > 22) && Math.hypot(x - 54, z + 28) > 26; } while (!ok && ++k < 20);
    if (!ok) continue; const p = nthPine(R.r(1.4, 2.4), i); p.position.set(x, 0, z); scene.add(p); }
  // flagpole with the Swedish flag
  s.flagG = new THREE.Group(); s.flagG.position.set(-2, 0, -12); scene.add(s.flagG); s.flagG.add(cyl(0.25, 0.3, 26, c3Prop('#ffffff', { rough: 0.4 }), 0, 13, 0, 0.03, 10));
  const fb = c3Mesh(new THREE.SphereGeometry(0.6, 12, 8), c3Prop('#f0c040', { metal: 0.7, rough: 0.3 }), 0.02); fb.position.y = 26.3; s.flagG.add(fb);
  s.flag = pl(8, 5, c3Flat('#ffffff', { map: texFlagSE(), side: THREE.DoubleSide }), 4.2, 23, 0); s.flagG.add(s.flag);
  // the moose (far right, comic)
  s.moose = nthMoose(); s.moose.position.set(78, 0, -70); s.moose.rotation.y = -2.4; scene.add(s.moose);
  // the cow, the bike, the lake bench, snowmen
  s.cow = nthCow(); s.cow.position.set(41, 0, -4); s.cow.rotation.y = -2.2;   // head toward the farmer's camera side scene.add(s.cow);
  s.bike = nthBike('#2a8ae8'); s.bike.scale.setScalar(3.4); s.bike.position.set(-23, 0, 12); s.bike.rotation.y = 0.3; scene.add(s.bike);
  s.bench = new THREE.Group(); s.bench.position.set(-66, 0, 12.4); scene.add(s.bench);
  s.bench.add(rb(7, 0.4, 2.2, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a') }), 0, NTH_BENCH - 0.2, 0, 0.03)); s.bench.add(rb(7, 2.2, 0.35, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a') }), 0, NTH_BENCH + 1.3, -1.0, 0.03));
  for (const x of [-3, 3]) s.bench.add(rb(0.35, NTH_BENCH - 0.4, 1.8, c3Toon('#2a2a30'), x, (NTH_BENCH - 0.4) / 2, 0, 0.02));
  const snowman = new THREE.Group(); snowman.position.set(-36, 0, 2); scene.add(snowman); const sw = c3Prop('#ffffff', { rough: 0.6 });
  [[3.0, 2.8], [2.2, 7.2], [1.5, 10.4]].forEach(([r, y]) => { const b = c3Mesh(new THREE.SphereGeometry(r, 20, 14), sw, 0.05); b.position.y = y; snowman.add(b); });
  const nose = c3Mesh(new THREE.ConeGeometry(0.3, 1.6, 10), c3Prop('#f28a2a'), 0.02); nose.rotation.x = Math.PI / 2; nose.position.set(0, 10.4, 2.0); snowman.add(nose);
  for (const ex of [-0.5, 0.5]) { const e = c3Mesh(new THREE.SphereGeometry(0.2, 8, 6), c3Toon('#1a1210'), 0); e.position.set(ex, 10.9, 1.35); snowman.add(e); }
  snowman.add(rb(2.6, 0.5, 2.6, c3Prop('#1a5aa8'), 0, 9.2, 0, 0.02));   // scarf
  // street lamps along the village path
  for (let i = 0; i < 5; i++) { const lp = c3Lamp(4.5); lp.scale.setScalar(2.8); lp.position.set(-50 + i * 24, 0, -6 + (i % 2) * 2); scene.add(lp); }
  // ---- people (FOCUS)
  s.farmer = person(scene, 'farmer'); s.farmer.g.position.set(30, FOOT, 10);
  s.student = person(scene, 'student'); s.student.g.position.set(-16, FOOT, 14);
  s.poet = person(scene, 'poet'); s.poet.g.position.set(-66, NTH_BENCH, 13);
  [s.cow, s.bike, s.bench].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // RING bursts over the houses / people, speech bubbles (s23), music notes (s27)
  const ring = nthTexBurst('RING RING'); s.rings = [];
  const ringAt = [...s.houses.map((h) => V3(h.position.x, 32, h.position.z + 4)), V3(54, 36, -24), V3(30, 18, 10), V3(-16, 18, 14), V3(-66, 16, 13)];
  ringAt.forEach((p, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: ring, transparent: true, depthWrite: false, toneMapped: false })); m.userData.at = p; m.userData.t0 = RNG('nthring', i).r(0, 0.6); m.renderOrder = 9; scene.add(m); c3Layer(m, C3.L_FOCUS); s.rings.push(m); });
  const bub = [0, 1, 2, 3].map(nthTexBubble); s.bubbles = [];
  for (let i = 0; i < 6; i++) { const R = RNG('nthbub', i), m = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: bub[i % 4], transparent: true, depthWrite: false, toneMapped: false }));
    const h = s.houses[[0, 1, 2][i % 3]].position; m.userData.at = i < 3 ? V3(h.x, 30, h.z + 6) : null; m.userData.t0 = R.r(0, 1.2); m.renderOrder = 9; scene.add(m); c3Layer(m, C3.L_FOCUS); s.bubbles.push(m); }
  s.notes = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: nthTexNotes(), transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = 9; scene.add(m); c3Layer(m, C3.L_FOCUS); return m; });
  s.fgBy = { pine: (() => { const p = nthPine(0.9, 99); return p; })(), snowball: (() => { const m = c3Mesh(new THREE.SphereGeometry(1.4, 16, 12), c3Prop('#ffffff', { rough: 0.6 }), 0.04); return m; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#e8f4ff', mid: '#c8dcf0', bot: '#e8eef6' });
  c3ShadeScene(scene, { dark: 0.22 });
  c3Shadows(scene, s.key, 120);
  return s;
}
const nthGet = () => NTH.s ||= nthBuild();
function nthWorld(s, t, o = {}) {
  s.flag.rotation.y = 0.18 * Math.sin(t * 3.2); s.flag.scale.x = 1 + 0.05 * Math.sin(t * 6.1);
  s.cow.userData.head.rotation.z = 0.08 * Math.sin(t * 1.6); s.moose.rotation.y = -2.4 + 0.05 * Math.sin(t * 0.8);
  s.rings.forEach((m) => { m.visible = false; }); s.bubbles.forEach((m) => { m.visible = false; }); s.notes.forEach((m) => { m.visible = false; });
  [s.farmer, s.student, s.poet].forEach((p) => { if (p.phone) p.phone.visible = false; p.g.visible = !o.noPeople; });
  s.farmer.g.position.set(30, FOOT, 10); s.student.g.position.set(-16, FOOT, 14);
  c3PersonPose(s.farmer, s.cam, t, { expr: 'neutral', gaze: [0.5, 0], hand: { armL: [1.3, -0.4], armR: [-1.3, -0.5] }, ...STAND });
  c3PersonPose(s.student, s.cam, t, { expr: 'smile', gaze: [-0.3, 0], hand: { armL: [1.4, 0.2], armR: [-1.3, -0.5] }, ...STAND });
  c3PersonPose(s.poet, s.cam, t, { expr: 'thinking', gaze: [0.4, 0.3], hand: { armL: [1.2, -0.6], armR: [-1.2, -0.6] }, ...sitFeet(NTH_BENCH) });
}
function nthRings(s, t, t0, list) { list.forEach((i) => { const m = s.rings[i], ts = t0 + m.userData.t0, k = pop(t, ts, 0.2); m.visible = k > 0.01; if (!m.visible) return;
  m.position.copy(m.userData.at); m.position.y += 0.6 * Math.sin((t - ts) * 30) * Math.exp(-(t - ts) * 2); facing(m, s.cam); m.rotateZ(0.12 * Math.sin((t - ts) * 26)); m.scale.setScalar(k * Math.min(1.8, Math.max(0.8, m.position.distanceTo(s.cam.position) / 75))); }); }   // far bursts grow so they stay readable

// =====================================================================
//  s04 — "Just… Sweden.": wide establishing over the snowy village: red cottages, pines, the flag waving, the moose
// =====================================================================
const NTH_K04 = [[0, [-30, 34, 92], [8, 10, -40], 44], [1.2, [-18, 31, 84], [10, 10, -40], 44]];
SHOT_FN['s04'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t, { noPeople: true }); c3SetCam(s.cam, camMove(NTH_K04, lt, 's04', { orbit: 0.03, rush: 0.04 }));
  fgPlace(s, [['pine', [-9, -10, -24], 1.2, 0]], NTH_K04, 's04', lt, { orbit: 0.03, rush: 0.04 });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.0, nearBlur: 9, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s06 — "and somewhere up north": the camera flies in low over the hills toward the village; RING bursts pop over the
//  houses one after another
//  s07 — "a random person picks up.": (CONTINUOUS) down to the farmer by his barn; his phone rings in his overalls, he
//  grabs it and answers on "picks"
// =====================================================================
const NTH_K06 = [[0, [40, 70, 230], [0, 10, -40], 44], [0.92, [34, 48, 140], [4, 12, -30], 44]];
SHOT_FN['s06'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K06, lt, 's06', { orbit: 0.0, creep: 0.0, rush: 0.0 }));
  nthRings(s, t, wAfter('somewhere', 7.6, 7.8) - 0.1, [0, 1, 3, 5]);
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.0, glow: 0.4, glowBlur: 12 });
};
const NTH_K07 = [[0, [37, 13, 40], [31, 8.5, 9], 44], [1.48, [35, 12, 32], [31, 8.6, 9], 44]];   // closer: the farmer's head ~10 % of the frame
SHOT_FN['s07'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K07, lt, 's07', { orbit: 0.02, rush: 0.0 }));
  const pk = wAfter('picks', 9, 9.44);
  nthRings(s, t, wAfter('somewhere', 7.6, 7.8) - 0.1, [1, 5]); if (t < pk) nthRings(s, t, 8.7, [6]);
  const up = clamp((t - (pk - 0.25)) / 0.3);
  c3PersonPose(s.farmer, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [pk, 'happy']], t, 'farmer'), gaze: [0.2, 0], head: [up * -0.08, 0, 0], hand: { armL: [1.3, -0.4], armR: [lerp(-1.0, EAR_R[0], up), lerp(0.4, EAR_R[1], up)] }, ...STAND });
  holdPhone(s.farmer, 'armR', { color: '#3a3a42', screen: t < pk ? '#8ae8a0' : '#8ad8ff' });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.4, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s08 — "A farmer.": medium on the farmer at his barn with the cow nudging him, phone at his ear, a hearty laugh
// =====================================================================
const NTH_K08 = [[0, [26, 11.5, 36], [35, 8, 6], 42], [0.64, [24, 11.5, 33], [35, 8, 6], 42]];
SHOT_FN['s08'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K08, lt, 's08', { orbit: -0.03, rush: 0.05 }));
  c3PersonPose(s.farmer, s.cam, t, { expr: 'laugh', gaze: [0.4, 0.1], head: [-0.06, 0, 0], hand: { armL: [1.5, 0.6], armR: EAR_R }, ...STAND });
  holdPhone(s.farmer, 'armR', { color: '#3a3a42' });
  s.cow.userData.head.rotation.z = 0.15 + 0.1 * Math.sin(t * 4);
  fgPlace(s, [['snowball', [3.5, -5.5, -10], -1.0]], NTH_K08, 's08', lt, { orbit: -0.03, rush: 0.05 });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.6, nearBlur: 10, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s09 — "A student.": the student in her parka next to her bike, phone at her ear, chatting
// =====================================================================
const NTH_K09 = [[0, [-6, 11.5, 42], [-18, 8, 12], 42], [0.76, [-8, 11.5, 39], [-18, 8, 12], 42]];
SHOT_FN['s09'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K09, lt, 's09', { orbit: 0.03, rush: 0.05 }));
  c3PersonPose(s.student, s.cam, t, { expr: mod(t, 0.5) < 0.3 ? 'talking' : 'happy', gaze: [-0.2, 0.1], head: [0.06, 0, 0], hand: { armL: EAR_L, armR: [-1.4, -0.3] }, ...STAND });
  holdPhone(s.student, 'armL', { color: '#e85aa0' });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.6, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s23 — "become the voice of the whole country.": aerial over the village; on "voice" speech bubbles pop up from every
//  house and all over the land (HEJ, a flag, HA HA, a heart); the three villagers hold their phones up
// =====================================================================
const NTH_K23 = [[0, [3, 25, 64], [1, 10, -4], 44], [2.0, [0, 23, 58], [1, 10, -4], 44]];   // tighter: the two villagers read, three houses behind
SHOT_FN['s23'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K23, lt, 's23', { orbit: 0.02, creep: 0.0, rush: 0.0 }));
  const tv = wAfter('voice', 38, 38.68) - 0.35;
  s.farmer.g.position.set(6.5, FOOT, 14); s.student.g.position.set(-5, FOOT, 16); s.poet.g.visible = false;
  [[s.farmer, 'armR'], [s.student, 'armL']].forEach(([p, arm]) => { const up = arm === 'armR' ? [-1.5, 3.9] : [1.5, 3.9];
    c3PersonPose(p, s.cam, t, { expr: 'happy', gaze: [0, 0.4], hand: arm === 'armR' ? { armR: up, armL: [1.3, -0.4] } : { armL: up, armR: [-1.3, -0.4] }, ...STAND }); holdPhone(p, arm, { dy: 0.5 }); });
  // the bubbles: three over the houses, one from each villager's phone, one from the flagpole crowd
  const at = [null, null, null, s.farmer.root.localToWorld(V3(0.4, 10.4, 0)), s.student.root.localToWorld(V3(0.4, 10.4, 0)), V3(-2, 24, -12)];   // right above each villager's head
  s.bubbles.forEach((m, i) => { const ts = tv + m.userData.t0 * 0.6, k = pop(t, ts, 0.25); m.visible = k > 0.01; if (!m.visible) return; m.position.copy(m.userData.at || at[i]); m.position.y += 1.2 * (t - ts); facing(m, s.cam); m.scale.setScalar(k); });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 0.8, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s27 — "One call could get you a poet,": the poet on the bench by the frozen lake, phone in one fist, the other arm
//  raised dramatically, music notes drifting up; on "poet" his eyes close in rapture
// =====================================================================
const NTH_K27 = [[0, [-54, 11, 38], [-68, 8.5, 10], 42], [1.5, [-57, 10.5, 34], [-67, 8.5, 10], 42]];
SHOT_FN['s27'] = (t, u, lt) => {
  const s = nthGet(); nthWorld(s, t); c3SetCam(s.cam, camMove(NTH_K27, lt, 's27', { orbit: -0.03, rush: 0.06 }));
  const tp = wAfter('poet', 44.5, 45.2);
  c3PersonPose(s.poet, s.cam, t, { expr: c3FaceAt([[0, 'talking'], [tp - 0.1, 'closed']], t, 'poet'), gaze: [0.3, 0.4], head: [0.1 + 0.04 * Math.sin(t * 3), 0, 0], hand: { armR: EAR_R, armL: [1.9, 3.4 + 0.3 * Math.sin(t * 4)] }, ...sitFeet(NTH_BENCH) });
  holdPhone(s.poet, 'armR', { color: '#1a1a20' });
  s.notes.forEach((m, i) => { const q = mod(t * 0.6 + i / 3, 1); m.visible = true; m.position.set(-63.5 + Math.sin(q * 5 + i) * 1.2, 14 + q * 6, 13.5); facing(m, s.cam); m.scale.setScalar(Math.sin(Math.PI * q)); });
  fgPlace(s, [['pine', [5.5, -9, -16], -1.0, 0]], NTH_K27, 's27', lt, { orbit: -0.03, rush: 0.06 });
  c3Render(s.scene, s.cam, { bg: '#8ec0ec', bgBlur: 1.6, nearBlur: 9, glow: 0.4, glowBlur: 12 });
};

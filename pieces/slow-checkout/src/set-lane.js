// =====================================================================
//  SET lane — the cozy chat checkout: s24 s25 s26.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed lan.
//  One world, built once: a bright supermarket corner. The lane runs along x: a rounded teal counter (front face z -1.2,
//  top y 5.0) with a moving rubber belt, a scanner window, a card terminal, a coffee mug and a cookie jar; the cashier
//  stands behind it (z -4.2, the counter hides her legs). A warm floor lamp (x 7.5) and a big potted plant (x -8.5) frame
//  it; a little wooden bench with cushions (x 6.5, z 3) holds an older lady; an older man chats at the counter (x -2.2,
//  z 1.4). The CHAT CHECKOUT sign hangs over the lane (y 15.5). Back wall z -13 with shelves of colourful products.
//  The queue zone in front of the lane (x 2..9, z 4..9) has floor stickers; in s26 a ghost line of tapping shoes fades
//  out under a big red "no" mark.
// =====================================================================
const LAN = {};
const LAN_K = 1.35, LAN_FOOT = 2.55 * LAN_K, LAN_SEAT = 2.35;
const lanW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
// the first time word w is spoken after t0 (common words repeat)
const lanWA = (w, t0, fb) => { const x = WORDS.find((q) => q.s >= t0 && q.w.replace(/[^\w]/g, '').toLowerCase() === w.toLowerCase()); return x ? x.s : fb; };
const lanV = (x, y, z) => new THREE.Vector3(x, y, z);
const lanSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function lanCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = lanSpan(id), dur = b - a;
  const P = lanV(...c.p), L = lanV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(lanV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const lanRack = (lt, id, a, b) => { const [t0, t1] = lanSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function lanFg(s, list, K, id, lt, o = {}) {
  const c = LAN.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
  c3SetCam(c, lanCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = lanV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(lanV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const lanRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#d88a2a', bgBlur: 1.8, nearBlur: 10, glow: 0.7, glowBlur: 16, bloom: 0.24 }, o));

// ---- textures
function lanTexTiles() {   // warm cream supermarket floor tiles with soft grout and a little wear
  const t = tex((x, w, h) => { const R = RNG('lantile'), n = 4, c = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? '#62b6cc' : '#a4dce8'; x.fillRect(i * c, j * c, c, c);
      x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(i * c + 6, j * c + 6, c * 0.4, 4); }
    x.strokeStyle = 'rgba(150,120,80,0.45)'; x.lineWidth = 3; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * c, 0); x.lineTo(i * c, h); x.stroke(); x.beginPath(); x.moveTo(0, i * c); x.lineTo(w, i * c); x.stroke(); }
    x.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 120; i++) x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 9), R.r(1, 3)); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 5); return t;
}
function lanTexWall() {   // soft butter-yellow wall with a wainscot stripe
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf3a'); g.addColorStop(0.7, '#ffbe1a'); g.addColorStop(1, '#f0a810'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#3c8a7a'; x.fillRect(0, h * 0.86, w, h * 0.14); x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(0, h * 0.86, w, 4); }, 256, 512);
}
function lanTexBelt() {   // dark rubber belt with ridges (scrolled by offset each frame)
  const t = tex((x, w, h) => { x.fillStyle = '#2c2e34'; x.fillRect(0, 0, w, h); x.fillStyle = '#3c3f47'; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8, 0, w / 16, h); }, 256, 64);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 1); return t;
}
function lanTexSign() {   // the hanging sign: deep green board, a cream speech bubble, CHAT CHECKOUT, take your time
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2f8f6e'); g.addColorStop(1, '#1f6a50'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#f6e8c8'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
    // bubble icon on the left
    x.fillStyle = '#fff6e0'; x.beginPath(); x.ellipse(w * 0.14, h * 0.46, w * 0.085, h * 0.26, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(w * 0.1, h * 0.66); x.lineTo(w * 0.08, h * 0.84); x.lineTo(w * 0.15, h * 0.7); x.fill();
    for (const k of [-1, 0, 1]) { x.fillStyle = '#2f8f6e'; x.beginPath(); x.arc(w * 0.14 + k * w * 0.032, h * 0.46, h * 0.045, 0, TAU); x.fill(); }
    inked(x, 'CHAT CHECKOUT', w * 0.6, h * 0.42, h * 0.3, '#fff6e0', { stroke: '#173f30', sw: h * 0.035, maxW: w * 0.68, font: '"Arial Rounded MT Bold", "Segoe UI", sans-serif' });
    inked(x, 'take your time ♥', w * 0.6, h * 0.76, h * 0.15, '#ffd27a', { stroke: false, maxW: w * 0.6, font: '"Segoe Print", "Comic Sans MS", sans-serif', weight: 700 }); }, 1024, 320);
}
function lanTexBox(seed) {   // a product box face: bold colour block, a stripe and a little logo dot
  return tex((x, w, h) => { const R = RNG('lanbox', seed), c = ['#e8483a', '#f2a23a', '#3a8ee8', '#4ab86a', '#e85aa0', '#8a5ae8', '#f6d24a'][seed % 7];
    x.fillStyle = c; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(0, h * R.r(0.2, 0.35), w, h * 0.16);
    x.fillStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.arc(w * 0.5, h * 0.7, w * 0.18, 0, TAU); x.fill(); }, 64, 96);
}
function lanTexIcon(kind) {   // little speech-bubble icons for s25 (heart, coffee, laugh)
  return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineWidth = 9; x.strokeStyle = '#1a1210'; x.fillStyle = '#fffaf0';
    x.beginPath(); x.ellipse(w / 2, h * 0.44, w * 0.42, h * 0.36, 0, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(w * 0.36, h * 0.74); x.lineTo(w * 0.28, h * 0.94); x.lineTo(w * 0.5, h * 0.78); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#fffaf0'; x.fillRect(w * 0.34, h * 0.7, w * 0.18, h * 0.08);
    if (kind === 'heart') { x.fillStyle = '#e83a4a'; x.beginPath(); const cx = w / 2, cy = h * 0.46, r = w * 0.12; x.moveTo(cx, cy + r * 1.3); x.bezierCurveTo(cx - r * 2.2, cy - r * 0.2, cx - r * 0.9, cy - r * 1.8, cx, cy - r * 0.5); x.bezierCurveTo(cx + r * 0.9, cy - r * 1.8, cx + r * 2.2, cy - r * 0.2, cx, cy + r * 1.3); x.fill(); }
    else if (kind === 'coffee') { x.fillStyle = '#8a5a3a'; x.fillRect(w * 0.36, h * 0.38, w * 0.24, h * 0.22); x.strokeStyle = '#8a5a3a'; x.lineWidth = 7; x.beginPath(); x.arc(w * 0.62, h * 0.49, w * 0.06, -1.4, 1.4); x.stroke();
      x.strokeStyle = '#b8a090'; x.lineWidth = 5; for (const k of [0, 1]) { x.beginPath(); x.moveTo(w * (0.42 + k * 0.1), h * 0.34); x.quadraticCurveTo(w * (0.38 + k * 0.1), h * 0.28, w * (0.43 + k * 0.1), h * 0.22); x.stroke(); } }
    else inked(x, 'HA HA', w / 2, h * 0.45, h * 0.2, '#e8483a', { stroke: false, maxW: w * 0.7, font: '"Comic Sans MS", sans-serif', weight: 700 }); }, 256, 256);
}
function lanTexClock() {   // a friendly wall clock face (hands are meshes)
  return tex((x, w, h) => { x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.48, 0, TAU); x.fill(); x.strokeStyle = '#2a8a6e'; x.lineWidth = 18; x.stroke();
    x.fillStyle = '#2a1a10'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.fillRect(w / 2 + Math.sin(a) * w * 0.38 - 4, h / 2 - Math.cos(a) * h * 0.38 - 10, 8, 20); }
    inked(x, 'NO RUSH', w / 2, h * 0.7, h * 0.08, '#2a8a6e', { stroke: false, font: '"Arial Rounded MT Bold", sans-serif' }); }, 256, 256);
}

// ---- the world
function lanBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 400), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0d8', ambI: 0.55, sky: '#fff2d0', ground: '#6a4a2a', key: '#fff0d8', keyI: 1.0, keyP: [8, 18, 16], rim: '#ffc890', rimI: 0.45, rimP: [-10, 12, -8] });
  s.M = { teal: c3Prop('#3aa08a', { rough: 0.35, env: 0.9 }), tealDk: c3Prop('#2a7a68', { rough: 0.4 }), wood: c3Prop('#b07a48', { rough: 0.55 }), woodDk: c3Prop('#7a4e2a', { rough: 0.6 }),
    steel: c3Prop('#c8ccd4', { rough: 0.25, metal: 0.8, env: 1.3 }), dark: c3Prop('#2a2c32', { rough: 0.4 }), cream: c3Prop('#fff4dc', { rough: 0.5 }) };
  // floor and walls
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 44), c3Prop('#ffffff', { map: lanTexTiles(), rough: 0.35, metal: 0.05, env: 0.7 })); fl.rotation.x = -Math.PI / 2; fl.position.z = 0; scene.add(fl);
  const wallM = c3Prop('#ffffff', { map: lanTexWall(), rough: 0.8 });
  scene.add(pl(60, 26, wallM, 0, 13, -13));
  scene.add(pl(44, 26, wallM, -22, 13, 6, Math.PI / 2));
  // shelves of products along the back wall (seeded once)
  const R = RNG('lanshelf'), boxMs = [...Array(7)].map((_, i) => c3Prop('#ffffff', { map: lanTexBox(i), rough: 0.6 }));
  for (const sx of [-15, -5, 5, 15]) { const sh = new THREE.Group(); sh.position.set(sx, 0, -11.6); scene.add(sh);
    sh.add(rb(9.4, 12, 0.4, s.M.woodDk, 0, 6, -0.9, 0.03));
    for (let k = 0; k < 4; k++) { const y = 1.4 + k * 2.9; sh.add(rb(9.6, 0.25, 2.2, s.M.wood, 0, y, 0, 0.02));
      for (let x = -4.3; x < 4.3;) { const bw = R.r(0.7, 1.2), bh = R.r(1.2, 2.2); sh.add(rb(bw, bh, 1.2, boxMs[R.i(0, 6)], x + bw / 2, y + 0.13 + bh / 2, 0.1, 0.02)); x += bw + 0.12; } } }
  // the counter: a rounded teal body, wood top, the belt, the scanner, the terminal, the mug and the cookie jar
  s.counter = new THREE.Group(); scene.add(s.counter);
  s.counter.add(rb(13, 4.7, 3.2, s.M.teal, 0, 2.35, -2.8, 0.05));
  s.counter.add(rb(13.4, 0.35, 3.6, s.M.wood, 0, 4.88, -2.8, 0.03));
  for (let i = 0; i < 6; i++) s.counter.add(rb(1.8, 0.12, 0.05, s.M.tealDk, -5.2 + i * 2.1, 3.2, -1.18, 0.0));   // little panel lines
  s.beltTex = lanTexBelt();
  s.counter.add(rb(8.2, 0.12, 2.2, c3Prop('#ffffff', { map: s.beltTex, rough: 0.7 }), -2.0, 5.1, -2.7, 0.02));
  s.counter.add(rb(0.3, 0.5, 2.4, s.M.steel, 2.25, 5.25, -2.7, 0.02));   // the end rail of the belt
  s.counter.add(rb(2.0, 0.08, 1.6, c3Flat('#9ad8ff', { glow: '#7ac8ff' }), 3.6, 5.1, -2.8, 0.0));   // scanner window
  const term = new THREE.Group(); term.position.set(5.3, 5.05, -1.9); s.counter.add(term);
  term.add(cyl(0.12, 0.2, 0.9, s.M.dark, 0, 0.45, 0, 0.02, 10)); const tb = rb(1.0, 1.5, 0.35, s.M.dark, 0, 1.4, 0, 0.02); tb.rotation.x = -0.35; term.add(tb);
  const ts = pl(0.75, 0.55, c3Flat('#8ae8b8', { glow: '#6ad8a0' }), 0, 1.62, 0.13, 0, -0.35); term.add(ts);
  const mug = new THREE.Group(); mug.position.set(-5.4, 5.05, -2.0); s.counter.add(mug);
  mug.add(cyl(0.38, 0.33, 0.8, c3Prop('#e8483a', { rough: 0.3 }), 0, 0.4, 0, 0.02, 20));
  const hdl = c3Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16, Math.PI), c3Prop('#e8483a', { rough: 0.3 }), 0.015); hdl.position.set(0.42, 0.42, 0); hdl.rotation.z = -Math.PI / 2; mug.add(hdl);
  s.steam = [0, 1, 2].map((k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false })); mug.add(m); return m; });
  const jar = new THREE.Group(); jar.position.set(-3.9, 5.05, -3.4); s.counter.add(jar);
  const jg = cyl(0.6, 0.6, 1.3, new THREE.MeshPhysicalMaterial({ color: '#e8f4ff', roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }), 0, 0.65, 0, 0, 20); jg.renderOrder = 7; jar.add(jg);
  jar.add(cyl(0.64, 0.64, 0.22, c3Prop('#d84a3a', { rough: 0.4 }), 0, 1.4, 0, 0.02, 20));
  for (let k = 0; k < 5; k++) { const c = cyl(0.3, 0.3, 0.1, c3Prop('#c88a4a', { rough: 0.8 }), Math.sin(k * 2.1) * 0.22, 0.15 + k * 0.2, Math.cos(k * 2.1) * 0.22, 0.01, 14); c.rotation.x = 0.5 * Math.sin(k); jar.add(c); }
  // the cashier's stool back and a little name sign on the counter front
  s.counter.add(rb(3.0, 1.0, 0.12, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fff4dc'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a7a68'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12);
    inked(x, 'HI! TAKE A SEAT', w / 2, h / 2, h * 0.38, '#2a7a68', { stroke: false, maxW: w * 0.86, font: '"Arial Rounded MT Bold", sans-serif' }); }, 512, 160), rough: 0.6 }), 3.6, 2.6, -1.14, 0.0));
  // the hanging sign over the lane: two thin cables from the ceiling
  s.sign = new THREE.Group(); s.sign.position.set(-0.5, 15.6, -3.6); scene.add(s.sign);
  s.sign.add(rb(9.6, 3.0, 0.3, s.M.woodDk, 0, 0, -0.02, 0.03));
  const signTex = lanTexSign(); s.signFace = pl(9.2, 2.8, c3Prop('#ffffff', { map: signTex, rough: 0.5, emissive: '#ffffff', ei: 0, emissiveMap: signTex }), 0, 0, 0.14); s.sign.add(s.signFace);
  for (const sx of [-4, 4]) s.sign.add(cyl(0.03, 0.03, 8, s.M.dark, sx, 5.4, 0, 0, 6));
  s.signBulbs = [];
  for (let i = 0; i < 9; i++) { const b = c3Mesh(new THREE.SphereGeometry(0.13, 10, 8), c3Flat('#fff2c0', { glow: '#ffd27a' }), 0); b.position.set(-4.3 + i * 1.075, -1.65, 0.2); s.sign.add(b); s.signBulbs.push(b); }
  // the floor lamp (warm cone of light) and the potted plant
  s.lamp = new THREE.Group(); s.lamp.position.set(8.2, 0, -3.4); scene.add(s.lamp);
  s.lamp.add(cyl(1.0, 1.2, 0.3, s.M.woodDk, 0, 0.15, 0, 0.03, 24)); s.lamp.add(cyl(0.12, 0.12, 10, s.M.woodDk, 0, 5.2, 0, 0.02, 10));
  const shade = c3Mesh(new THREE.CylinderGeometry(1.1, 1.8, 2.0, 28, 1, true), (() => { const m = c3Prop('#f6dca0', { rough: 0.7, emissive: '#ffcf80', ei: 0.35 }); m.side = THREE.DoubleSide; return m; })(), 0.03); shade.position.y = 10.6; s.lamp.add(shade);
  s.bulb = c3Mesh(new THREE.SphereGeometry(0.5, 14, 10), c3Flat('#fff4c8', { glow: '#ffcf80' }), 0); s.bulb.position.y = 10.1; s.lamp.add(s.bulb);
  const lp = new THREE.PointLight('#ffcf90', 0.9, 26, 1.6); lp.position.set(8.2, 9.6, -3.4); scene.add(lp);
  s.plant = new THREE.Group(); s.plant.position.set(-8.6, 0, -2.2); scene.add(s.plant);
  s.plant.add(cyl(1.4, 1.1, 2.6, c3Prop('#d86a3a', { rough: 0.6 }), 0, 1.3, 0, 0.03, 24)); s.plant.add(cyl(1.5, 1.5, 0.3, c3Prop('#c25a2e', { rough: 0.6 }), 0, 2.6, 0, 0.02, 24));
  s.leaves = [];
  for (let i = 0; i < 9; i++) { const R2 = RNG('lanleaf', i), lf = new THREE.Group(), a = i / 9 * TAU, len = R2.r(2.6, 4.2);
    const leaf = c3Mesh(new THREE.SphereGeometry(1, 14, 10), c3Prop(i % 2 ? '#3f9a4a' : '#4fb05a', { rough: 0.6 }), 0.03); leaf.scale.set(0.55, len * 0.5, 0.12); leaf.position.y = len * 0.5; lf.add(leaf);
    lf.position.set(0, 2.7, 0); lf.rotation.set(R2.r(0.35, 0.8) * Math.cos(a), a, R2.r(0.35, 0.8) * Math.sin(a)); s.plant.add(lf); s.leaves.push({ lf, a, ph: R2.r(0, TAU), rx: lf.rotation.x, rz: lf.rotation.z }); }
  // the bench with cushions
  s.bench = new THREE.Group(); s.bench.position.set(8.6, 0, 0.4); scene.add(s.bench);
  s.bench.add(rb(5.4, 0.4, 2.0, s.M.wood, 0, LAN_SEAT - 0.2, 0, 0.03)); s.bench.add(rb(5.4, 1.8, 0.35, s.M.wood, 0, LAN_SEAT + 1.2, -0.9, 0.03));
  for (const x of [-2.3, 2.3]) for (const z of [-0.7, 0.7]) s.bench.add(rb(0.3, LAN_SEAT - 0.4, 0.3, s.M.woodDk, x, (LAN_SEAT - 0.4) / 2, z, 0.02));
  s.bench.add(rb(2.2, 0.4, 1.6, c3Prop('#e8738a', { rough: 0.9 }), -1.2, LAN_SEAT + 0.15, 0.1, 0.03)); s.bench.add(rb(2.2, 0.4, 1.6, c3Prop('#f2b24a', { rough: 0.9 }), 1.3, LAN_SEAT + 0.15, 0.1, 0.03));
  // the friendly wall clock (s26), hands are meshes
  s.clock = new THREE.Group(); s.clock.position.set(6.2, 13.2, -12.8); scene.add(s.clock);
  s.clock.add(cyl(1.9, 1.9, 0.3, c3Prop('#2a8a6e', { rough: 0.4 }), 0, 0, -0.1, 0.03, 32)); s.clock.children[0].rotation.x = Math.PI / 2;
  s.clock.add(pl(3.6, 3.6, c3Flat('#ffffff', { map: lanTexClock(), transparent: true }), 0, 0, 0.08));
  s.hHour = rb(0.18, 1.0, 0.06, s.M.dark, 0, 0, 0.14, 0); s.hMin = rb(0.12, 1.45, 0.06, s.M.dark, 0, 0, 0.16, 0); s.clock.add(s.hHour); s.clock.add(s.hMin);
  // the queue zone: floor stickers (footprints + WAIT HERE) and the big red "no" mark that draws itself in s26
  s.stickers = new THREE.Group(); scene.add(s.stickers);
  const stM = c3Flat('#ffffff', { map: tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(42,122,104,0.85)';
    for (const sx of [0.32, 0.68]) { x.beginPath(); x.ellipse(w * sx, h * 0.6, w * 0.11, h * 0.24, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(w * sx, h * 0.25, w * 0.09, h * 0.09, 0, 0, TAU); x.fill(); } }, 128, 128), transparent: true, depthWrite: false });
  for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), stM); m.rotation.x = -Math.PI / 2; m.position.set(4.6, 0.03, 5.2 + k * 2.4); s.stickers.add(m); }
  s.markCv = Object.assign(document.createElement('canvas'), { width: 512, height: 512 }); s.markTex = new THREE.CanvasTexture(s.markCv); s.markTex.encoding = THREE.sRGBEncoding; s.markKey = null;
  s.mark = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: s.markTex, transparent: true, depthWrite: false, toneMapped: false })); s.mark.rotation.x = -Math.PI / 2; s.mark.position.set(4.6, 0.06, 7.6); s.mark.renderOrder = 6; scene.add(s.mark);
  // the ghost queue: three pairs of shoes that tap impatiently (s26), translucent
  s.ghostM = new THREE.MeshBasicMaterial({ color: '#4a3a5a', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
  s.shoes = [];
  for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const g = new THREE.Group(), sole = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.75, 6, 12), s.ghostM);   // a rounded cartoon shoe
    sole.rotation.x = Math.PI / 2; sole.scale.set(1, 1, 0.62); sole.position.set(0, 0.2, -0.62); g.add(sole);
    const piv = new THREE.Group(); piv.position.set(4.6 + sd * 0.42, 0.04, 5.8 + k * 2.4); piv.add(g); g.position.z = 0.62; piv.scale.setScalar(1.35); scene.add(piv); s.shoes.push({ piv, k, sd }); }
  // the s25 speech icons (billboards)
  s.icons = ['heart', 'coffee', 'laugh'].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: lanTexIcon(k), transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = 9; scene.add(m); return m; });
  // ---- people (FOCUS)
  s.cashier = c3Person({ key: 'cashier', outfit: 'polo', hairStyle: 'ponytail' }); s.cashier.g.scale.setScalar(LAN_K); scene.add(s.cashier.g);
  s.man = c3Person({ key: 'oldman', outfit: 'blazer', hairStyle: 'baldsides' }); s.man.g.scale.setScalar(LAN_K); scene.add(s.man.g);
  s.lady = c3Person({ key: 'oldlady2', outfit: 'blouse', hairStyle: 'rk_curly', fx: ['glasses_round'] }); s.lady.g.scale.setScalar(LAN_K); scene.add(s.lady.g);
  [s.counter, s.sign, s.lamp, s.plant, s.bench, s.clock, s.stickers, s.mark, s.cashier.g, s.man.g, s.lady.g, ...s.shoes.map((q) => q.piv), ...s.icons].forEach((o) => c3Layer(o, C3.L_FOCUS));
  // ---- blurred foreground pieces (NEAR layer)
  s.fgBy = {
    leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const lf = c3Mesh(new THREE.SphereGeometry(1, 14, 10), c3Prop('#3f9a4a', { rough: 0.6 }), 0.03); lf.scale.set(0.9, 2.6, 0.15); lf.rotation.z = -0.5 + i * 0.45; lf.position.x = i * 0.9; g.add(lf); } return g; })(),
    basket: (() => { const g = new THREE.Group(); g.add(rb(3.4, 1.8, 2.2, c3Prop('#e8483a', { rough: 0.4 }), 0, 0, 0, 0.04)); g.add(rb(3.0, 0.4, 1.8, boxMs[3], 0, 1.0, 0, 0.02));
      const h = c3Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 20, Math.PI), c3Prop('#2a2c32', { rough: 0.4 }), 0.01); h.position.y = 0.9; g.add(h); return g; })(),
    bulbs: (() => { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const b = c3Mesh(new THREE.SphereGeometry(0.35, 12, 8), c3Flat('#fff2c0', { glow: '#ffd27a' }), 0); b.position.set(i * 1.5, -Math.sin(i * 0.9) * 0.4, 0); g.add(b); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff2d8', mid: '#e8c890', bot: '#6a4a2a', cards: [[0, 30, 10, 30, 6, '#fff6e0'], [-20, 10, 10, 8, 14, '#ffe6b8'], [20, 10, -10, 8, 14, '#fff0d0']] });
  c3ShadeScene(scene, { dark: 0.3 });   // Ricks soft shading (kit): lit tops, cooler darker bases
  c3Shadows(scene, s.key, 26);
  return s;
}
const lanGet = () => LAN.s ||= lanBuild();
const LAN_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const LAN_SITF = { foot: { legL: [0.8, -LAN_SEAT / LAN_K + 0.05], legR: [-0.75, -LAN_SEAT / LAN_K + 0.05] } };
// per-frame world: the moving parts at time t, everything shot-specific hidden
function lanWorld(s, t) {
  s.beltTex.offset.x = -t * 0.35;   // the belt creeps slowly (it's the slow lane)
  s.steam.forEach((m, k) => { const q = mod(t * 0.45 + k / 3, 1); m.position.set(0.1 * Math.sin(q * 6 + k), 0.9 + q * 1.4, 0); m.scale.setScalar(0.6 + q); m.material.opacity = 0.45 * Math.sin(Math.PI * q); });
  s.leaves.forEach(({ lf, ph, rx, rz }) => { lf.rotation.x = rx + 0.04 * Math.sin(t * 1.3 + ph); lf.rotation.z = rz + 0.04 * Math.cos(t * 1.1 + ph); });
  const mins = 14 * 60 + 20 + (t - 46) * 0.5;   // the clock barely moves: 20 past two, half a minute per second
  s.hMin.rotation.z = -(mins % 60) / 60 * TAU; s.hMin.position.set(Math.sin(-s.hMin.rotation.z) * 0.62, Math.cos(s.hMin.rotation.z) * 0.62, 0.16);
  s.hHour.rotation.z = -((mins / 60) % 12) / 12 * TAU; s.hHour.position.set(Math.sin(-s.hHour.rotation.z) * 0.42, Math.cos(s.hHour.rotation.z) * 0.42, 0.14);
  s.shoes.forEach((q) => { q.piv.visible = false; });
  s.icons.forEach((m) => { m.visible = false; });
  s.mark.visible = false;
  s.signFace.material.emissiveIntensity = 0.18; s.signBulbs.forEach((b) => { b.visible = true; });
  s.cashier.g.position.set(1.2, LAN_FOOT, -4.6);
  s.man.g.position.set(-2.4, LAN_FOOT, 1.0);
  s.lady.g.position.set(9.6, LAN_SEAT, 0.5);
}
// the red "no" mark on the queue zone: k 0..1 draws the circle then the slash (redrawn only when k's step changes)
function lanMark(s, k) {
  const key = Math.round(k * 40); if (key === s.markKey) return; s.markKey = key;
  const x = s.markCv.getContext('2d'), w = s.markCv.width, h = s.markCv.height; x.clearRect(0, 0, w, h);
  x.lineCap = 'round'; x.strokeStyle = '#e8303a'; x.lineWidth = 34;
  const kc = clamp(k / 0.7), ks = clamp((k - 0.7) / 0.3);
  if (kc > 0) { x.beginPath(); x.arc(w / 2, h / 2, w * 0.4, -Math.PI / 2, -Math.PI / 2 + kc * TAU); x.stroke(); }
  if (ks > 0) { const a = w * 0.5 - w * 0.28, b = w * 0.5 + w * 0.28; x.beginPath(); x.moveTo(a, a); x.lineTo(lerp(a, b, ks), lerp(a, b, ks)); x.stroke(); }
  s.markTex.needsUpdate = true;
}
// the cashier and the man chatting: mouth on alternate beats, laughs
function lanChat(s, t, o = {}) {
  const ph = mod(t - 44, 2.4);
  c3PersonPose(s.cashier, s.cam, t, { expr: o.cashierExpr ?? (ph < 1.2 ? 'talking' : 'laugh'), gaze: [-0.8, 0.0], head: [0.06 * Math.sin(t * 2.4), 0, -0.05],
    hand: { armL: [1.1, 0.4 + 0.25 * Math.max(0, Math.sin(t * 5))], armR: [-1.0, -0.4] }, ...LAN_STAND });
  c3PersonPose(s.man, s.cam, t, { expr: o.manExpr ?? (ph < 1.2 ? 'happy' : 'talking'), gaze: [0.8, 0.05], head: [-0.05, 0, 0.04 * Math.sin(t * 2)],
    hand: { armL: [1.2, -0.6], armR: [-1.3, 0.2 + 0.2 * Math.max(0, Math.sin(t * 4.2 + 1))] }, ...LAN_STAND });
  c3PersonPose(s.lady, s.cam, t, { expr: o.ladyExpr ?? 'smile', gaze: [-0.9, 0.1], head: [0, 0, 0.05], hand: { armL: [0.9, -1.1], armR: [-0.9, -1.1] }, ...LAN_SITF });
}

// =====================================================================
//  s24 — "they built one that's allowed to be slow.": the reveal of the cozy lane; the sign's bulbs light up one by
//  one on "built", the camera rises from behind the plant's leaves
// =====================================================================
const LAN_K24 = [[0, [-1.5, 7.2, 23], [0.2, 9.0, -3], 46], [2.0, [0.2, 8.6, 20.5], [0.4, 9.6, -3], 46]];
SHOT_FN['s24'] = (t, u, lt) => {
  const s = lanGet(); lanWorld(s, t);
  const built = lanW('built', 1, 46.3), slow = lanWA('slow', 46.0, 47.4);
  c3SetCam(s.cam, lanCam(LAN_K24, lt, 's24', { orbit: 0.025 }));
  const on = clamp((t - (built - 0.05)) / 0.6); s.signFace.material.emissiveIntensity = lerp(0.0, 0.22, on);
  s.signBulbs.forEach((b, i) => { b.visible = on * 9 > i; });
  s.sign.rotation.z = 0.025 * Math.sin((t - built) * 5) * Math.exp(-Math.max(0, t - built) * 1.8) * (t > built ? 1 : 0);
  lanChat(s, t, { cashierExpr: t < slow ? 'talking' : 'laugh' });
  lanFg(s, [['leaf', [-4.2, -3.6, -9], 1.4, 0.2], ['bulbs', [1.4, 7.2, -12], -0.6]], LAN_K24, 's24', lt, { orbit: 0.025 });
  lanRender(s, { bgBlur: lanRack(lt, 's24', 2.2, 1.4) });
};

// =====================================================================
//  s25 — "Cashiers who love to talk,": close on the cashier and the man chatting; little speech icons pop up
//  (heart, coffee, HA HA) as they laugh
// =====================================================================
const LAN_K25 = [[0, [0.6, 10.4, 18.2], [-0.9, 10.0, -2.2], 40], [1.4, [-0.2, 10.2, 16.8], [-0.9, 10.0, -2.2], 40]];
SHOT_FN['s25'] = (t, u, lt) => {
  const s = lanGet(); lanWorld(s, t);
  const love = lanWA('love', 48.0, 48.7), talk = lanWA('talk', 48.0, 49.1);
  c3SetCam(s.cam, lanCam(LAN_K25, lt, 's25', { orbit: -0.03 }));
  lanChat(s, t, { cashierExpr: c3FaceAt([[0, 'talking'], [love, 'laugh'], [talk, 'talking']], t, 'cashier'), manExpr: c3FaceAt([[0, 'happy'], [love + 0.1, 'laugh']], t, 'oldman') });
  s.cashier.g.updateMatrixWorld(true); s.man.g.updateMatrixWorld(true);
  const pops = [[s.icons[0], s.cashier, 48.25, [0.2, 7.4, 0.5]], [s.icons[1], s.man, love - 0.05, [0.9, 6.6, 0.5]], [s.icons[2], s.cashier, talk - 0.1, [-1.6, 7.0, 0.5]]];
  pops.forEach(([m, p, t0, at]) => { if (t < t0) return; m.visible = true; const k = EZ.back(clamp((t - t0) / 0.25));
    m.position.copy(p.root.localToWorld(lanV(...at))); m.position.y += 0.4 * (t - t0); m.scale.setScalar(Math.max(1e-3, k)); m.quaternion.copy(s.cam.quaternion); });
  lanFg(s, [['basket', [-3.6, -4.6, -7], 1.1]], LAN_K25, 's25', lt, { orbit: -0.03 });
  lanRender(s, { bgBlur: lanRack(lt, 's25', 2.4, 2.0) });
};

// =====================================================================
//  s26 — "no rush, no line of people tapping their feet.": the queue zone in front of the lane. A ghost line of shoes
//  taps impatiently on the floor stickers; on "no" a big red "no" mark draws itself over them and the shoes fade away;
//  the slow friendly clock (NO RUSH) and the lady relaxing on the bench
// =====================================================================
const LAN_K26 = [[0, [4.4, 13.6, 27.0], [5.4, 3.0, 5.4], 46], [2.2, [5.4, 13.0, 25.2], [5.8, 3.6, 5.0], 46]];
SHOT_FN['s26'] = (t, u, lt) => {
  const s = lanGet(); lanWorld(s, t);
  const rush = lanWA('rush', 49.4, 49.7), line = lanWA('line', 50.0, 50.2), tap = lanWA('tapping', 50.3, 50.7), feet = lanWA('feet', 50.9, 51.3);
  c3SetCam(s.cam, lanCam(LAN_K26, lt, 's26', { orbit: 0.02, rush: 0.06 }));
  // the shoes appear on "line", tap on "tapping", fade under the mark that starts on "tapping" and closes on "feet"
  const showK = clamp((t - (line - 0.1)) / 0.3), fade = 1 - clamp((t - (feet - 0.05)) / 0.45), op = 0.5 * showK * fade;
  s.ghostM.opacity = op;
  s.shoes.forEach((q) => { q.piv.visible = op > 0.01; const ph = t * 11 + q.k * 1.7 + (q.sd > 0 ? 0 : Math.PI);
    q.piv.rotation.x = t > tap - 0.1 ? -0.32 * Math.max(0, Math.sin(ph)) : 0; });
  const mk = clamp((t - (tap - 0.05)) / (feet + 0.1 - (tap - 0.05)));
  s.mark.visible = mk > 0; if (mk > 0) lanMark(s, mk);
  lanChat(s, t, { ladyExpr: c3FaceAt([[0, 'relieved'], [feet, 'happy']], t, 'oldlady2') });
  lanFg(s, [['leaf', [3.6, -2.6, -6], 1.2, -0.3]], LAN_K26, 's26', lt, { orbit: 0.02, rush: 0.06 });
  lanRender(s, { bgBlur: lanRack(lt, 's26', 1.8, 1.2) });
};

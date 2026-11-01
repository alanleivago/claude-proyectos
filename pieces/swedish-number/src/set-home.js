// =====================================================================
//  SET home — your living room (anywhere in the world): s05 (you dial the number from your couch, it rings) and s11
//  (you can ask them anything: you sit up, question marks pop around you). Registers SHOT_FN[id]. Prefix hme.
//  World: floor y 0 (warm wood + round rug), back wall z -12 (mint green) with a big window (evening city), a framed
//  world-map poster (Flow image), shelves; side wall x -20 (mustard). An orange couch along x (seat y 2.6, front z 1.2),
//  you sit in the middle (x 0, z 0.4); a coffee table (z 5) with a pizza box and a soda; a floor lamp (x 9) and a
//  plant (x -10). Lit warm: lamp + ceiling light + window fill.
// =====================================================================
const HME = {}, HME_SEAT = 2.7;
function hmeTexView() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a3a96'); g.addColorStop(0.55, '#c86aa8'); g.addColorStop(1, '#ffb070'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('hmeview'); for (let i = 0; i < 12; i++) { const bw = R.r(30, 70), bh = R.r(h * 0.2, h * 0.55), bx = i * w / 11 - 12; x.fillStyle = ['#2a2456', '#3a2a66', '#24305a'][i % 3]; x.fillRect(bx, h - bh, bw, bh);
    for (let j = 0; j < 9; j++) for (let k = 0; k < 2; k++) if (R.f() < 0.55) { x.fillStyle = '#ffd890'; x.fillRect(bx + 6 + k * bw / 2, h - bh + 10 + j * 18, bw / 2 - 12, 8); } }
  x.fillStyle = '#fff6d0'; x.beginPath(); x.arc(w * 0.78, h * 0.18, 26, 0, TAU); x.fill(); }, 512, 512); }
function hmeTexRug() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); for (const [r, c] of [[0.5, '#e8483a'], [0.42, '#ffcc3a'], [0.33, '#3aa8c8'], [0.22, '#e8483a'], [0.1, '#ffcc3a']]) { x.fillStyle = c; x.beginPath(); x.arc(w / 2, h / 2, w * r, 0, TAU); x.fill(); } }, 512, 512); }
function hmeTexPizza() { return tex((x, w, h) => { x.fillStyle = '#d8b07a'; x.fillRect(0, 0, w, h); inked(x, 'PIZZA', w / 2, h * 0.5, h * 0.3, '#e8483a', { stroke: false }); x.strokeStyle = '#a8804a'; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20); }, 256, 256); }
function hmeTexQ(c) { return tex((x, w, h) => { x.clearRect(0, 0, w, h); inked(x, '?', w / 2, h / 2 + 8, h * 0.9, c, { stroke: '#3b2417', sw: h * 0.06 }); }, 256, 256); }
function hmeDrawDial(x, w, h, n) {   // the phone screen while dialing: the number typed so far, a keypad, a green call button
  x.fillStyle = '#10182e'; x.fillRect(0, 0, w, h); const num = '+46 771 793 336'.slice(0, n);
  inked(x, num || ' ', w / 2, h * 0.14, h * 0.07, '#ffffff', { stroke: false, maxW: w * 0.9, font: 'Arial' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { x.fillStyle = '#2a3a6a'; x.beginPath(); x.arc(w * (0.25 + c * 0.25), h * (0.32 + r * 0.13), w * 0.09, 0, TAU); x.fill();
    inked(x, '123456789*0#'[r * 3 + c], w * (0.25 + c * 0.25), h * (0.32 + r * 0.13), h * 0.045, '#ffffff', { stroke: false, font: 'Arial' }); }
  x.fillStyle = '#3ad86a'; x.beginPath(); x.arc(w / 2, h * 0.88, w * 0.11, 0, TAU); x.fill();
}
function hmeDrawCall(x, w, h, k) {   // ringing: SWEDEN with a flag and pulsing rings
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a5aa8'); g.addColorStop(1, '#0a2a5a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1a5aa8'; x.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.16); x.fillStyle = '#ffcc1a'; x.fillRect(w * 0.42, h * 0.2, w * 0.06, h * 0.16); x.fillRect(w * 0.3, h * 0.26, w * 0.4, h * 0.04);
  x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.strokeRect(w * 0.3, h * 0.2, w * 0.4, h * 0.16);
  inked(x, 'SWEDEN', w / 2, h * 0.47, h * 0.08, '#ffffff', { stroke: false }); inked(x, 'calling...', w / 2, h * 0.56, h * 0.05, '#a8c8f0', { stroke: false, weight: 700 });
  x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(w / 2, h * 0.78, w * (0.1 + ((k + i / 3) % 1) * 0.25), 0, TAU); x.stroke(); }
}

function hmeBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.6, sky: '#fff0dc', ground: '#6a4a3a', key: '#fff0d8', keyI: 1.05, keyP: [8, 20, 18], rim: '#c8a8ff', rimI: 0.5, rimP: [-12, 12, -8] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), c3Prop('#ffffff', { map: c3TexWall('wood', '#b8763e', { rep: [8, 5] }), rough: 0.5, env: 0.7 })); fl.rotation.x = -Math.PI / 2; fl.position.z = 6; scene.add(fl);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(9, 48), c3Prop('#ffffff', { map: hmeTexRug(), rough: 0.9 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.03, 5); scene.add(rug);
  scene.add(pl(60, 28, c3Prop('#ffffff', { map: c3TexWall('plaster', '#5ac8a0', { rep: [4, 2] }), rough: 0.85 }), 0, 14, -12));
  scene.add(pl(40, 28, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ffbe3a', { rep: [3, 2] }), rough: 0.85 }), -20, 14, 8, Math.PI / 2));
  scene.add(rb(60, 1.0, 0.3, c3Prop('#fbf6ea'), 0, 0.5, -11.8, 0.02));
  // window with the evening city, curtains
  scene.add(rb(13, 10, 0.4, c3Prop('#fbf6ea', { rough: 0.5 }), 9, 14, -11.9, 0.03)); scene.add(pl(12, 9, c3Flat('#ffffff', { map: hmeTexView() }), 9, 14, -11.6));
  scene.add(rb(0.3, 9, 0.2, c3Prop('#fbf6ea'), 9, 14, -11.5, 0.01)); scene.add(rb(12, 0.3, 0.2, c3Prop('#fbf6ea'), 9, 14, -11.5, 0.01));
  for (const sx of [-1, 1]) scene.add(rb(2.6, 12, 0.5, c3Prop('#ffffff', { map: c3TexWall('wood', '#e8483a', { rep: [1, 1] }), rough: 0.9 }), 9 + sx * 7.4, 13.5, -11.3, 0.03));
  // framed world map poster (Flow image) over the couch, a small shelf with books
  scene.add(rb(11.6, 6.6, 0.3, c3Prop('#3a2a1a'), -6, 15, -11.85, 0.03));
  const mt = tex((x, w, h) => { cover(x, asset('img_earth.jpg'), 0, 0, w, h); }, 1024, 576); scene.add(pl(11, 6.1, c3Prop('#ffffff', { map: mt, rough: 0.5 }), -6, 15, -11.65));
  scene.add(rb(8, 0.3, 1.6, c3Prop('#8a5a3a'), -14, 9, -11.2, 0.02));
  for (let i = 0; i < 7; i++) scene.add(rb(0.5, 1.4 + (i % 3) * 0.3, 1.2, c3Prop(['#e8483a', '#3a8ee8', '#ffcc1a', '#3aa86a', '#e85aa0', '#8a5ae8', '#f28a2a'][i]), -17 + i * 0.7, 9.85 + (i % 3) * 0.15, -11.2, 0.012));
  // the couch
  s.couch = new THREE.Group(); scene.add(s.couch); const cm = c3Prop('#f28a2a', { rough: 0.85 }), cm2 = c3Prop('#e0701e', { rough: 0.85 });
  s.couch.add(rb(14, 1.6, 4.2, cm, 0, HME_SEAT - 0.8, -0.8, 0.05)); s.couch.add(rb(14, 4.4, 1.6, cm2, 0, HME_SEAT + 1.6, -3.0, 0.05));
  for (const sx of [-1, 1]) s.couch.add(rb(1.6, 3.0, 4.6, cm2, sx * 7.4, HME_SEAT + 0.2, -0.8, 0.05));
  for (const sx of [-1, 1]) s.couch.add(rb(5.6, 0.6, 3.6, c3Prop('#ffa84a', { rough: 0.85 }), sx * 3.2, HME_SEAT + 0.1, -0.6, 0.04));
  const pil = rb(2.4, 2.2, 0.8, c3Prop('#3aa8c8', { rough: 0.9 }), -5.2, HME_SEAT + 1.6, -1.8, 0.04); pil.rotation.z = 0.2; s.couch.add(pil);
  for (const sx of [-1, 1]) s.couch.add(cyl(0.25, 0.2, 0.9, c3Toon('#4a2a1a'), sx * 6.6, 0.45, 0.8, 0.01, 8));
  // coffee table with a pizza box and a soda
  s.table = new THREE.Group(); s.table.position.set(0.5, 0, 6); scene.add(s.table); s.table.add(rb(8, 0.5, 3.6, c3Prop('#ffffff', { map: c3TexWall('wood', '#9a5a2a') }), 0, 2.4, 0, 0.04));
  for (const [a, b] of [[-3.5, -1.5], [3.5, -1.5], [-3.5, 1.5], [3.5, 1.5]]) s.table.add(rb(0.4, 2.2, 0.4, c3Prop('#6a3a1a'), a, 1.1, b, 0.02));
  s.table.add(rb(3.2, 0.4, 3.0, c3Prop('#ffffff', { map: hmeTexPizza(), rough: 0.8 }), -1.4, 2.85, 0, 0.02)); s.table.add(cyl(0.38, 0.38, 1.3, c3Prop('#e8283a', { rough: 0.3, metal: 0.4 }), 2.2, 3.3, 0.2, 0.02, 16));
  // floor lamp and plant
  const lamp = new THREE.Group(); lamp.position.set(10, 0, -3); scene.add(lamp); lamp.add(cyl(1.0, 1.2, 0.3, c3Toon('#2a2a30'), 0, 0.15, 0, 0.02, 20)); lamp.add(cyl(0.12, 0.12, 11, c3Toon('#2a2a30'), 0, 5.5, 0, 0.02, 8));
  const shade = c3Mesh(new THREE.CylinderGeometry(1.2, 2.0, 2.2, 24, 1, true), (() => { const m = c3Prop('#ffe8a8', { rough: 0.7, emissive: '#ffcf80', ei: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.03); shade.position.y = 11.6; lamp.add(shade);
  const lp = new THREE.PointLight('#ffcf90', 1.1, 34, 1.4); lp.position.set(10, 10.5, -3); scene.add(lp);
  const cl = new THREE.PointLight('#fff0d8', 0.6, 40, 1.4); cl.position.set(-2, 22, 8); scene.add(cl);
  const pot = new THREE.Group(); pot.position.set(-11, 0, -4); scene.add(pot); pot.add(cyl(1.3, 1.0, 2.6, c3Prop('#3a8ee8'), 0, 1.3, 0, 0.03, 20));
  for (let i = 0; i < 8; i++) { const R = RNG('hmeleaf', i), l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop(i % 2 ? '#3f9a4a' : '#5ab85a', { rough: 0.6 }), 0.03); l.scale.set(0.5, 2.4, 0.18); l.position.set(R.n(0.8), 4.8 + R.r(0, 1), R.n(0.5)); l.rotation.set(R.n(0.3), 0, R.n(0.8)); pot.add(l); }
  // you
  s.you = person(scene, 'you'); s.you.g.position.set(0, HME_SEAT, 1.45);   // in front of the seat's front edge: the legs hang over it
  s.dial = canvasTex(256, 480);
  s.qs = ['#ffcc1a', '#e8483a', '#3ad8a8', '#8a6aff', '#3a9ae8'].map((c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: hmeTexQ(c), transparent: true, depthWrite: false, toneMapped: false })); m.renderOrder = 9; scene.add(m); c3Layer(m, C3.L_FOCUS); return m; });
  s.rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.95, 24, 1, -0.9, 1.8), new THREE.MeshBasicMaterial({ color: '#ffe23a', transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); m.renderOrder = 9; s.you.root.add(m); c3Layer(m, C3.L_FOCUS); return m; });
  [s.couch, s.table].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = { soda: (() => { const g = new THREE.Group(); g.add(cyl(0.5, 0.5, 1.7, c3Prop('#3a8ee8', { rough: 0.3, metal: 0.4 }), 0, 0, 0, 0.03, 16)); return g; })(), leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop('#3f9a4a', { rough: 0.6 }), 0.03); l.scale.set(0.8, 2.4, 0.15); l.rotation.z = -0.5 + i * 0.45; l.position.x = i * 0.9; g.add(l); } return g; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff0d8', mid: '#e8c890', bot: '#5a3a2a' });
  c3ShadeScene(scene, { dark: 0.25 });
  return s;
}
const hmeGet = () => HME.s ||= hmeBuild();
function hmeScreen(s) { const m = s.you.phone.userData.screen.material; if (m.map !== s.dial.t) { m.map = s.dial.t; m.color.set('#ffffff'); m.needsUpdate = true; } }
function hmeWorld(s, t) { s.qs.forEach((m) => { m.visible = false; }); s.rings.forEach((m) => { m.visible = false; }); if (s.you.phone) s.you.phone.visible = false; }

// =====================================================================
//  s05 — "You dial it from your couch, it rings,": you slouched on the couch, phone held out in front, thumb dialling
//  +46 771 793 336 digit by digit; on "rings" the phone goes to your ear, the screen turns to SWEDEN calling…, yellow
//  ring arcs pulse beside your head
// =====================================================================
const HME_K05 = [[0, [4, 9.5, 24], [0, 6.5, 0], 42], [1.52, [1, 9.0, 21.5], [0, 6.8, 0], 42]];
SHOT_FN['s05'] = (t, u, lt) => {
  const s = hmeGet(); hmeWorld(s, t); c3SetCam(s.cam, camMove(HME_K05, lt, 's05', { orbit: -0.03, rush: 0.05 }));
  const tr = wAfter('rings', 7, 7.40), td = wAfter('dial', 6, 6.32), up = clamp((t - (tr - 0.2)) / 0.25);
  const n = t < tr ? Math.min(15, Math.floor((t - td + 0.1) * 13)) : 15;
  c3PersonPose(s.you, s.cam, t, { expr: t < tr ? c3FaceAt([[0, 'smirk'], [td, 'determined']], t, 'you') : 'excited', gaze: t < tr ? [0.2, -0.5] : [0.4, 0.1], head: [t < tr ? -0.06 : 0.06, 0, 0],
    hand: { armR: [lerp(-0.6, EAR_R[0], up), lerp(1.6 + 0.08 * Math.max(0, Math.sin(t * 22)), EAR_R[1], up)], armL: [1.4, 0.2] }, ...sitFeet(HME_SEAT) });
  if (t < tr) redraw(s.dial, 'd' + n, (x, w, h) => hmeDrawDial(x, w, h, n)); else { const k = Math.floor(mod(t * 2, 1) * 6); redraw(s.dial, 'c' + k, (x, w, h) => hmeDrawCall(x, w, h, k / 6)); }
  holdPhone(s.you, 'armR', { dy: up < 0.5 ? 0.55 : 0.35, s: lerp(1.5, 1, up) }); hmeScreen(s); s.you.phone.rotation.z = (t > tr ? 0.15 * Math.sin(t * 40) * Math.exp(-(t - tr) * 3) : 0);
  if (t > tr) { const f = fistLocal(s.you, 'armR'); s.rings.forEach((m, i) => { const q = mod((t - tr) * 2.2 + i / 3, 1); m.visible = true; m.position.set(f.x - 0.4, f.y + 0.4, 0.2); m.rotation.set(0, 0, Math.PI); m.scale.setScalar(1 + q * 1.6); m.material.opacity = 1 - q; }); }
  fgPlace(s, [['soda', [3.4, -5.2, -9], -0.8]], HME_K05, 's05', lt, { orbit: -0.03, rush: 0.05 });
  c3Render(s.scene, s.cam, { bg: '#5ac8a0', bgBlur: 1.4, nearBlur: 10, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s11 — "And you can ask them anything.": you sit up on the edge of the couch, eyes wide, phone at your ear, coloured
//  question marks pop around your head one by one
// =====================================================================
const HME_K11 = [[0, [-5, 10, 22], [0, 7.2, 0], 42], [1.54, [-3, 9.5, 19.5], [0, 7.4, 0], 42]];
SHOT_FN['s11'] = (t, u, lt) => {
  const s = hmeGet(); hmeWorld(s, t); c3SetCam(s.cam, camMove(HME_K11, lt, 's11', { orbit: 0.03, rush: 0.05 }));
  const ta = wAfter('anything', 14, 14.68);
  c3PersonPose(s.you, s.cam, t, { expr: c3FaceAt([[0, 'excited'], [ta, 'starstruck']], t, 'you'), gaze: [0, 0.2], head: [0.05 * Math.sin(t * 5), 0, 0], lean: -0.05, hand: { armR: EAR_R, armL: [1.9, 1.4 + 0.3 * Math.sin(t * 8)] }, ...sitFeet(HME_SEAT) });
  redraw(s.dial, 'live', (x, w, h) => { hmeDrawCall(x, w, h, 0.3); inked(x, '00:07', w / 2, h * 0.65, h * 0.06, '#ffffff', { stroke: false }); });
  holdPhone(s.you, 'armR'); hmeScreen(s);
  const t0 = wAfter('ask', 14, 14.3) - 0.1;
  s.qs.forEach((m, i) => { const ts = t0 + i * 0.16, k = pop(t, ts, 0.25); m.visible = k > 0.01; if (!m.visible) return; const a = -0.9 + i * 0.45;
    m.position.set(Math.sin(a) * 6.5, 13.0 + Math.cos(a) * 2.0 + 0.3 * Math.sin((t - ts) * 4 + i), 1.2); facing(m, s.cam); m.rotateZ(0.2 * Math.sin((t - ts) * 5 + i)); m.scale.setScalar(k * 1.3); });
  fgPlace(s, [['leaf', [-3.8, -4.8, -9], 1.0, 0.3]], HME_K11, 's11', lt, { orbit: 0.03, rush: 0.05 });
  c3Render(s.scene, s.cam, { bg: '#5ac8a0', bgBlur: 1.4, nearBlur: 10, glow: 0.4, glowBlur: 12 });
};

// =====================================================================
//  SET nope — "Not a call center. Not a tourist office.": s02 s03 (one long take: the camera glides from the call
//  center on the left to the tourist office on the right of the same bright floor). On each "center"/"office" a big
//  red X slams over the view. Registers SHOT_FN[id]. Helpers are prefixed npe.
//  World: floor y 0, back wall z -14 (teal), side walls x -40 / +44. Call center x -30..-4: two rows of desks with
//  headset operators (seated, the desks hide their legs), a CALL CENTER sign. Tourist office x 8..32: a counter
//  (front z 1.0, top 5.0) with a clerk behind it, brochure racks, posters, a TOURIST INFO sign and an "i" disc.
// =====================================================================
const NPE = {}, NPE_SEAT = 2.6;
function npeTexSign(txt, bg, fg) { return tex((x, w, h) => { x.fillStyle = bg; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 30); x.fill(); x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.stroke();
  inked(x, txt, w / 2, h / 2 + 4, h * 0.5, fg, { stroke: '#3b2417', sw: h * 0.05, maxW: w * 0.86 }); }, 1024, 220); }
function npeTexScreen(seed) { return tex((x, w, h) => { const R = RNG('npescr', seed); x.fillStyle = '#16243e'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a7ad8'; x.fillRect(0, 0, w, h * 0.14);
  for (let i = 0; i < 7; i++) { x.fillStyle = ['#7ad8ff', '#ffd23a', '#8ae8a0'][i % 3]; x.fillRect(w * 0.08, h * (0.22 + i * 0.1), w * R.r(0.3, 0.8), h * 0.05); } }, 256, 192); }
function npeTexPoster(i) { return tex((x, w, h) => { const C = [['#ffcc1a', '#1a5aa8'], ['#e8483a', '#fff4dc'], ['#3aa86a', '#fff4dc']][i];
  x.fillStyle = C[0]; x.fillRect(0, 0, w, h); x.fillStyle = C[1];
  if (i === 0) { x.beginPath(); x.moveTo(w * 0.1, h * 0.8); x.lineTo(w * 0.4, h * 0.35); x.lineTo(w * 0.6, h * 0.6); x.lineTo(w * 0.75, h * 0.45); x.lineTo(w * 0.95, h * 0.8); x.fill(); inked(x, 'VISIT', w / 2, h * 0.15, h * 0.1, C[1], { stroke: false }); }
  else if (i === 1) { x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.28, 0, TAU); x.fill(); inked(x, 'TOURS', w / 2, h * 0.86, h * 0.1, C[1], { stroke: false }); }
  else { for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(w * (0.2 + k * 0.3), h * 0.75); x.lineTo(w * (0.08 + k * 0.3), h * 0.75); x.lineTo(w * (0.2 + k * 0.3) - w * 0.06, h * 0.3); x.fill(); } inked(x, 'MAPS', w / 2, h * 0.15, h * 0.1, C[1], { stroke: false }); }
  x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.strokeRect(5, 5, w - 10, h - 10); }, 256, 360); }
function npeTexInfo() { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2a8a4a'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, TAU); x.fill(); x.lineWidth = 14; x.strokeStyle = '#3b2417'; x.stroke();
  inked(x, 'i', w / 2, h / 2 + 6, h * 0.62, '#ffffff', { stroke: false, font: 'Georgia, serif' }); }, 256, 256); }
function nldTexClockFace() { return tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.48, 0, TAU); x.fill(); x.fillStyle = '#3a2a1a';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.arc(w / 2 + Math.sin(a) * w * 0.38, h / 2 - Math.cos(a) * h * 0.38, i % 3 ? 5 : 9, 0, TAU); x.fill(); }
  x.lineCap = 'round'; x.strokeStyle = '#3a2a1a'; x.lineWidth = 12; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + w * 0.2, h / 2 - h * 0.05); x.stroke(); x.lineWidth = 8; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 - w * 0.04, h / 2 - h * 0.32); x.stroke(); }, 256, 256); }
// a headset on a person's head (band over the top, two cups, a mic)
function npeHeadset(p) { const g = new THREE.Group(), M = c3Toon('#2a2c34'), band = c3Mesh(new THREE.TorusGeometry(1.42, 0.1, 8, 24, Math.PI), M, 0); g.add(band);
  for (const sx of [-1, 1]) { const c = cyl(0.32, 0.32, 0.3, M, sx * 1.42, 0, 0, 0, 14); c.rotation.z = Math.PI / 2; g.add(c); }
  const mic = rb(0.08, 0.08, 0.9, M, -1.15, -0.6, 0.35, 0); mic.rotation.set(0, 0.9, 0.5); g.add(mic); const tip = c3Mesh(new THREE.SphereGeometry(0.14, 8, 6), c3Toon('#e8483a'), 0); tip.position.set(-0.75, -0.85, 0.65); g.add(tip);
  g.position.set(0, 0.05, 0.06); g.traverse((m) => { m.renderOrder = 5; }); p.headG.add(g); c3Layer(g, C3.L_FOCUS); return g; }

function npeBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 600), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff6ea', ambI: 0.6, sky: '#fff4e0', ground: '#5a4a3a', key: '#fff2e0', keyI: 1.1, keyP: [10, 22, 20], rim: '#c8e8ff', rimI: 0.45, rimP: [-14, 14, -10] });
  const wood = c3Prop('#ffffff', { map: c3TexWall('wood', '#c88a4a', { rep: [10, 6] }), rough: 0.5, env: 0.7 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), wood); fl.rotation.x = -Math.PI / 2; fl.position.set(2, 0, 4); scene.add(fl);
  scene.add(pl(90, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#2fb0b8', { rep: [6, 2] }), rough: 0.85 }), 2, 15, -14));   // teal back wall
  scene.add(pl(50, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ffc93a', { rep: [3, 2] }), rough: 0.85 }), -40, 15, 6, Math.PI / 2));
  scene.add(pl(50, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ff8a5a', { rep: [3, 2] }), rough: 0.85 }), 44, 15, 6, -Math.PI / 2));
  scene.add(rb(90, 1.2, 0.4, c3Prop('#ffffff', { rough: 0.6 }), 2, 0.6, -13.8, 0.02));   // skirting
  // ceiling light panels (glowing) and their light
  for (let i = 0; i < 6; i++) { const m = rb(7, 0.3, 3, c3Flat('#fffbe8', { glow: '#fff2c8' }), -28 + i * 13, 26, -4, 0.02); scene.add(m); }
  for (const x of [-18, 18]) { const lp = new THREE.PointLight('#fff0d8', 0.8, 50, 1.4); lp.position.set(x, 20, 2); scene.add(lp); }
  // ---- call center: two rows of desks with screens, seated operators with headsets
  const deskM = c3Prop('#f6f2ea', { rough: 0.5 }), legM = c3Toon('#4a4a52'), partM = c3Prop('#5a6ab8', { rough: 0.8 });
  s.ops = []; s.screens = []; s.focus = [];
  const opsAt = [[-24, -1.5, 'op1'], [-14, -1.5, 'op2'], [-27.5, -8, 'op2'], [-17.5, -8, 'op1'], [-7.5, -8, 'op1']];
  opsAt.forEach(([x, z, who], i) => {
    const d = new THREE.Group(); d.position.set(x, 0, z + 2.2); scene.add(d); s.focus.push(d);
    d.add(rb(8.4, 0.3, 3.2, deskM, 0, 4.6, 0, 0.03)); d.add(rb(8.4, 4.4, 0.25, partM, 0, 2.3, 1.45, 0.03));   // top + modesty panel (hides legs)
    const mon = new THREE.Group(); mon.position.set(2.4, 4.75, -0.5); mon.rotation.y = -0.5; d.add(mon);
    mon.add(rb(0.3, 1.2, 0.3, legM, 0, 0.6, 0, 0.01)); mon.add(rb(3.0, 2.0, 0.25, c3Toon('#2a2c34'), 0, 2.0, 0, 0.02));
    const scr = pl(2.7, 1.75, c3Flat('#ffffff', { map: npeTexScreen(i), glow: '#3a6ab8' }), 0, 2.0, 0.14); mon.add(scr); s.screens.push(scr);
    d.add(mug('#e8483a', -2.8, 4.75, 0.4));
    const p = person(scene, who, { key: 'op' + i }); p.g.position.set(x - 0.5, NPE_SEAT, z); s.ops.push(p); npeHeadset(p);
    const ch = new THREE.Group(); ch.position.set(x - 0.5, 0, z - 1.4); scene.add(ch); s.focus.push(ch); ch.add(rb(2.6, 0.4, 2.4, c3Prop('#2a2c34'), 0, NPE_SEAT - 0.2, 0, 0.02)); ch.add(rb(2.6, 3.2, 0.35, c3Prop('#2a2c34'), 0, NPE_SEAT + 1.6, -1.1, 0.02)); ch.add(cyl(0.12, 0.12, NPE_SEAT - 0.4, legM, 0, (NPE_SEAT - 0.4) / 2, 0, 0.01, 8));
  });
  s.ccSign = new THREE.Group(); s.ccSign.position.set(-17, 19, -13.4); scene.add(s.ccSign); s.ccSign.add(pl(20, 4.3, c3Flat('#ffffff', { map: npeTexSign('CALL CENTER', '#e8483a', '#ffffff') }), 0, 0, 0));
  scene.add(pl(14, 8, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, w, h); inked(x, 'CALLS TODAY', w / 2, h * 0.14, h * 0.09, '#2a2e38', { stroke: false });
    x.strokeStyle = '#e8483a'; x.lineWidth = 10; x.beginPath(); for (let i = 0; i < 8; i++) x.lineTo(w * (0.1 + i * 0.11), h * (0.85 - (i * 0.08) - (i % 2) * 0.06)); x.stroke(); }, 512, 300), rough: 0.6 }), -33, 10, -13.85));
  // two big windows onto a sunny city and a wall clock between the halves
  const view = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa8e8'); g.addColorStop(0.7, '#bfe4fa'); x.fillStyle = g; x.fillRect(0, 0, w, h); const R = RNG('npeview');
    for (let i = 0; i < 9; i++) { const bw = R.r(40, 80), bh = R.r(h * 0.25, h * 0.6), bx = i * w / 8 - 10; x.fillStyle = ['#e8a05a', '#d86a4a', '#f2d29a', '#8ab0c8'][i % 4]; x.fillRect(bx, h - bh, bw, bh);
      x.fillStyle = 'rgba(255,255,255,0.6)'; for (let j = 0; j < 6; j++) for (let k = 0; k < 2; k++) x.fillRect(bx + 8 + k * bw / 2, h - bh + 12 + j * 22, bw / 2 - 16, 10); }
    x.fillStyle = '#fff'; for (let i = 0; i < 4; i++) c3PaintCloud(x, R.r(0, w), R.r(h * 0.15, h * 0.35), R.r(90, 150), R, C3_SKY.day); }, 512, 512);
  for (const wx of [-6, 34]) { scene.add(rb(9, 9, 0.4, c3Prop('#fbf6ea', { rough: 0.5 }), wx, 12.5, -13.85, 0.03)); scene.add(pl(8, 8, c3Flat('#ffffff', { map: view }), wx, 12.5, -13.6));
    scene.add(rb(0.25, 8, 0.2, c3Prop('#fbf6ea'), wx, 12.5, -13.5, 0.01)); scene.add(rb(8, 0.25, 0.2, c3Prop('#fbf6ea'), wx, 12.5, -13.5, 0.01)); }
  scene.add(cyl(1.6, 1.6, 0.3, c3Prop('#e8483a'), 3, 21, -13.7, 0.04, 28).rotateX(Math.PI / 2)); scene.add(pl(2.8, 2.8, c3Flat('#ffffff', { map: nldTexClockFace(), transparent: true }), 3, 21, -13.5));
  // ---- tourist office: counter, clerk, brochure racks, posters, signs
  s.counter = new THREE.Group(); s.counter.position.set(20, 0, -1.6); scene.add(s.counter);
  s.counter.add(rb(15, 5.0, 3.0, c3Prop('#ffffff', { map: c3TexWall('wood', '#3a8a5a', { rep: [3, 1] }), rough: 0.6 }), 0, 2.5, 0, 0.05)); s.counter.add(rb(15.6, 0.4, 3.6, c3Prop('#fbf3e0', { rough: 0.4 }), 0, 5.1, 0, 0.03));
  s.counter.add(pl(4.0, 4.0, c3Flat('#ffffff', { map: npeTexInfo(), transparent: true }), 0, 2.6, 1.52));
  for (let i = 0; i < 5; i++) { const b = rb(1.1, 1.5, 0.12, c3Prop(['#ffcc1a', '#e8483a', '#3a8ee8', '#3aa86a', '#e85aa0'][i], { rough: 0.6 }), -5.5 + i * 0.8, 5.95, 0.6 + (i % 2) * 0.3, 0.012); b.rotation.x = -0.25; s.counter.add(b); }
  const bell = c3Mesh(new THREE.SphereGeometry(0.5, 14, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#f0c040', { metal: 0.8, rough: 0.25 }), 0.02); bell.position.set(4.5, 5.3, 0.6); s.counter.add(bell);
  for (const [rx, rz] of [[33, -4], [8, -9]]) { const r = new THREE.Group(); r.position.set(rx, 0, rz); scene.add(r); r.add(rb(4.2, 11, 0.4, c3Prop('#7a4e2a', { rough: 0.6 }), 0, 5.5, -0.6, 0.03));
    for (let k = 0; k < 5; k++) { r.add(rb(4.2, 0.2, 0.9, c3Prop('#a87a48'), 0, 1.6 + k * 2.1, 0, 0.02)); for (let j = 0; j < 3; j++) { const b = rb(1.1, 1.6, 0.12, c3Prop(['#ffcc1a', '#e8483a', '#3a8ee8', '#3aa86a', '#e85aa0'][(k + j) % 5], { rough: 0.6 }), -1.3 + j * 1.3, 2.5 + k * 2.1, 0.1, 0.012); b.rotation.x = -0.18; r.add(b); } } }
  for (let i = 0; i < 3; i++) scene.add(pl(4.2, 5.9, c3Prop('#ffffff', { map: npeTexPoster(i), rough: 0.6 }), 13 + i * 6, 11.5, -13.85));
  s.tiSign = new THREE.Group(); s.tiSign.position.set(20, 19, -13.4); scene.add(s.tiSign); s.tiSign.add(pl(19, 4.2, c3Flat('#ffffff', { map: npeTexSign('TOURIST INFO', '#2a8a4a', '#ffffff') }), 0, 0, 0));
  s.clerk = person(scene, 'clerk'); s.clerk.g.position.set(20, FOOT, -4.4);
  // a big potted plant between the two halves and a water cooler
  const pot = new THREE.Group(); pot.position.set(2, 0, -8); scene.add(pot); pot.add(cyl(1.6, 1.2, 3, c3Prop('#d86a3a'), 0, 1.5, 0, 0.03, 20));
  for (let i = 0; i < 9; i++) { const R = RNG('npeleaf', i), l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop(i % 2 ? '#3f9a4a' : '#5ab85a', { rough: 0.6 }), 0.03); l.scale.set(0.6, 2.6, 0.2); l.position.set(R.n(1.0), 5.6 + R.r(0, 1.2), R.n(0.6)); l.rotation.set(R.n(0.3), 0, R.n(0.8)); pot.add(l); }
  // the X stamp (FOCUS, in front of the camera)
  s.x = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texXStamp(), transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); s.x.renderOrder = 20; scene.add(s.x);
  [s.counter, s.clerk.g, s.x, ...s.focus].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = { leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop('#3f9a4a', { rough: 0.6 }), 0.03); l.scale.set(0.9, 2.6, 0.15); l.rotation.z = -0.5 + i * 0.45; l.position.x = i * 0.9; g.add(l); } return g; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff6e0', mid: '#c8e8e8', bot: '#5a4a3a' });
  c3ShadeScene(scene, { dark: 0.25 });
  return s;
}
const npeGet = () => NPE.s ||= npeBuild();
function npeWorld(s, t) {
  s.ops.forEach((p, i) => { const ph = mod(t * 0.9 + i * 0.37, 2);
    c3PersonPose(p, s.cam, t, { expr: ph < 1.1 ? 'talking' : 'smile', gaze: [i % 2 ? -0.4 : 0.4, 0.1], head: [0.05 * Math.sin(t * 2 + i), 0, 0],
      hand: { armL: [1.4, 1.1 + 0.3 * Math.max(0, Math.sin(t * 6 + i))], armR: [-1.3, 0.2] }, ...sitFeet(NPE_SEAT) }); });
  c3PersonPose(s.clerk, s.cam, t, { expr: 'smile', gaze: [0, 0], hand: { armL: [1.6, 0.8 + 0.4 * Math.max(0, Math.sin(t * 3))], armR: [-1.5, -0.2] }, ...STAND });
  s.x.visible = false;
}
// the X slam: big and turned at t0, settling to size over 0.18 s, a little shake after
function npeX(s, t, t0) { if (t < t0) return; const k = clamp((t - t0) / 0.18), cam = s.cam;
  s.x.visible = true; s.x.position.copy(cam.position).add(V3(1.0, 2.4, -14).applyQuaternion(cam.quaternion)); s.x.quaternion.copy(cam.quaternion);
  s.x.rotateZ(0.35 * (1 - k)); s.x.scale.setScalar(lerp(8, 4.4, EZ.o3(k)) * (1 + 0.03 * Math.sin((t - t0) * 40) * Math.exp(-(t - t0) * 8))); }

// =====================================================================
//  s02 — "Not a call center.": the call center, operators chatting into headsets; on "center" the X slams
//  s03 — "Not a tourist office.": the camera glides right to the tourist office (CONTINUOUS); on "office" the X slams
// =====================================================================
const NPE_K02 = [[0, [-20, 11.5, 30], [-17, 8.5, -4], 44], [0.94, [-16, 11.5, 28], [-15, 8.5, -4], 44]];
SHOT_FN['s02'] = (t, u, lt) => {
  const s = npeGet(); npeWorld(s, t); c3SetCam(s.cam, camMove(NPE_K02, lt, 's02', { orbit: 0.02, rush: 0.0 }));
  npeX(s, t, wAfter('center', 2.6, 3.16) - 0.05);
  c3Render(s.scene, s.cam, { bg: '#2fb0b8', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
const NPE_K03 = [[0, [14, 11.5, 28], [18, 8.5, -4], 44], [1.36, [18, 11.0, 25], [20, 8.0, -4], 44]];
SHOT_FN['s03'] = (t, u, lt) => {
  const s = npeGet(); npeWorld(s, t); c3SetCam(s.cam, camMove(NPE_K03, lt, 's03', { orbit: -0.02, rush: 0.0 }));
  npeX(s, t, wAfter('office', 3.6, 4.40) - 0.05);
  s.fg.forEach((f) => { f.visible = false; });   // no foreground prop: the long-take glide would sweep it across the lens
  c3Render(s.scene, s.cam, { bg: '#2fb0b8', bgBlur: 1.2, nearBlur: 10, glow: 0.4, glowBlur: 12 });
};

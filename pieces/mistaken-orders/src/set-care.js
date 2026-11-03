// =====================================================================
//  SET care — the care-home day room (the TV director's visit): sunflower-yellow walls over a mint wainscot with a
//  wooden handrail all round (the care-home cue), the SUNFLOWER CARE HOME banner, a big window onto a garden with pink
//  curtains, framed photos, a TV on a cabinet, armchairs with two residents, a round table with a polka-dot cloth.
//  Registers SHOT_FN s14-s17. Prefix cr. Back wall z = 0, x -28..28.
// =====================================================================
const CR = {};
const CR_X = 28, CR_Z = 50, CR_H = 24, CR_TAB = [0, 22], CR_SEAT = [3.6, 22];
function crTexWall() { const t = tex((g, w, h) => { const wain = h * 0.7; g.fillStyle = '#f2a81e'; g.fillRect(0, 0, w, h); const r = RNG('crw');
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${r.f() > 0.5 ? '255,255,255' : '180,110,20'},0.08)`; g.beginPath(); g.ellipse(r.f() * w, r.f() * wain, 40, 26, 0, 0, 7); g.fill(); }
  g.fillStyle = '#4fb8a0'; g.fillRect(0, wain, w, h - wain); for (let x = 0; x < w; x += 64) { g.strokeStyle = '#2f8a78'; g.lineWidth = 5; g.strokeRect(x + 8, wain + 14, 48, h - wain - 26); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function crTexGarden() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5ea8f0'); gr.addColorStop(0.55, '#cfe8ff'); gr.addColorStop(0.56, '#6ac04f'); gr.addColorStop(1, '#4f9a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; for (const [x, y] of [[100, 60], [380, 40]]) { g.beginPath(); g.ellipse(x, y, 60, 22, 0, 0, 7); g.ellipse(x + 40, y - 12, 40, 20, 0, 0, 7); g.fill(); }
  for (const [x, s] of [[60, 1], [190, 1.3], [440, 1.1]]) { g.fillStyle = '#7a4a2a'; g.fillRect(x - 8 * s, h * 0.42, 16 * s, 70 * s); g.fillStyle = '#3f9a3a'; g.beginPath(); g.arc(x, h * 0.4, 46 * s, 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { const x = 30 + i * 56, y = h * 0.8; g.strokeStyle = '#2f7a2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 60); g.stroke(); g.fillStyle = '#ffd21a'; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); g.fillStyle = '#7a4a1a'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.fillStyle = '#ffffff'; g.fillRect(w / 2 - 6, 0, 12, h); g.fillRect(0, h / 2 - 6, w, 12); g.strokeStyle = '#140e10'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 512, 384); }
function crTexBanner() { return tex((g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2f8a78'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = '#ffc21a'; g.beginPath(); g.ellipse(110 + Math.cos(a) * 40, h / 2 + Math.sin(a) * 40, 24, 12, a, 0, 7); g.fill(); } g.fillStyle = '#7a4a1a'; g.beginPath(); g.arc(110, h / 2, 28, 0, 7); g.fill();
  inked(g, 'SUNFLOWER', 560, h * 0.36, 70, '#2f8a78', { stroke: false, maxW: 680 }); inked(g, 'CARE HOME', 560, h * 0.68, 64, '#e8484a', { stroke: false, maxW: 680 }); }, 1024, 260); }
function crTexPhoto(i) { return tex((g, w, h) => { g.fillStyle = '#c9a040'; g.fillRect(0, 0, w, h); g.fillStyle = ['#9ad0ff', '#ffd0a0', '#c8f0c0'][i]; g.fillRect(16, 16, w - 32, h - 32);
  g.fillStyle = '#ffe2c2'; g.beginPath(); g.arc(w / 2, h * 0.42, 34, 0, 7); g.fill(); g.fillStyle = ['#3f6fb5', '#e8484a', '#2f8a6a'][i]; g.beginPath(); g.ellipse(w / 2, h * 0.86, 56, 44, 0, Math.PI, 0); g.fill(); }, 200, 240); }
function crTexTV() { return tex((g, w, h) => { g.fillStyle = '#2a2a30'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ac8ff'); gr.addColorStop(1, '#3a8ad8'); g.fillStyle = gr; g.fillRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#ffe23a'; g.beginPath(); g.arc(w * 0.3, h * 0.45, 30, 0, 7); g.fill(); g.fillStyle = '#5ac04f'; g.fillRect(14, h * 0.62, w - 28, h * 0.38 - 14); }, 320, 200); }
function crTexCard(txt) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 34); g.fillStyle = '#ffe23a'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, txt, w / 2, h / 2 + 4, h * 0.42, '#2a1208', { stroke: false, maxW: w - 70 }); }, 760, 200); }

function crBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff6e8', ambI: 0.6, sky: '#fff0c8', ground: '#5a4a3a', key: '#fff4e0', keyI: 1.1, keyP: [-40, 50, 40], rim: '#c8f0ff', rimI: 0.4, rimP: [40, 30, -20] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = crTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  const fl = pl(2 * CR_X, CR_Z, c3Prop('#ffffff', { map: texTiles('#e89a50', '#c8743a', [7, 6]), rough: 0.5, env: 0.5 }), 0, 0, CR_Z / 2, 0, -Math.PI / 2); scene.add(fl);
  scene.add(plNC(2 * CR_X, CR_H, wallM(5), 0, CR_H / 2, 0)); scene.add(plNC(CR_Z, CR_H, wallM(4), -CR_X, CR_H / 2, CR_Z / 2, Math.PI / 2)); scene.add(plNC(CR_Z, CR_H, wallM(4), CR_X, CR_H / 2, CR_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * CR_X, CR_H, wallM(5), 0, CR_H / 2, CR_Z, Math.PI)); scene.add(plNC(2 * CR_X, CR_Z, c3Prop('#f2c890', { rough: 0.9 }), 0, CR_H, CR_Z / 2, 0, Math.PI / 2));
  const wood = c3Prop('#a8683a', { rough: 0.5 });
  scene.add(rb(2 * CR_X, 0.5, 0.6, wood, 0, 6.2, 0.5, 0.015)); for (const sx of [-1, 1]) scene.add(rb(0.6, 0.5, CR_Z, wood, sx * (CR_X - 0.5), 6.2, CR_Z / 2, 0.015));   // the handrail
  // window + curtains, banner, photos, TV on a cabinet
  scene.add(pl(18, 11, c3Flat('#ffffff', { map: crTexGarden() }), -6, 12.5, 0.15)); scene.add(rb(19, 0.6, 1.4, c3Prop('#ffffff'), -6, 6.8, 0.7, 0.015));
  for (const sx of [-1, 1]) { const c = c3Mesh(new THREE.BoxGeometry(3.2, 13, 0.6, 6, 1, 1), c3Prop('#f28aa8', { rough: 0.8 }), 0.02); c.position.set(-6 + sx * 10.2, 12.8, 0.6); scene.add(c); }
  scene.add(rb(28, 0.4, 0.4, wood, -6, 19.6, 0.6, 0.01));
  scene.add(pl(14, 3.55, c3Flat('#ffffff', { map: crTexBanner() }), 15, 17, 0.2));
  [[11, 10], [15, 10.6], [19, 10]].forEach(([x, y], i) => scene.add(pl(2.4, 2.9, c3Flat('#ffffff', { map: crTexPhoto(i) }), x, y, 0.2)));
  scene.add(rb(8, 4, 3, wood, 22, 2, 3, 0.02)); scene.add(rb(7, 4.4, 0.8, c3Prop('#2a2a30'), 22, 6.4, 2.5, 0.02)); scene.add(pl(6.2, 3.8, c3Flat('#ffffff', { map: crTexTV(), glow: '#9ad0ff' }), 22, 6.4, 2.95));
  for (const [x, z] of [[-24, 6], [25, 30]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.2, 0.9, 2.2, c3Prop('#e8484a'), 0, 1.1, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.ConeGeometry(0.4, 5, 6), c3Prop(i % 2 ? '#5ea64a' : '#4f9a44', { rough: 0.8 }), 0.01); lf.position.set(Math.sin(a) * 0.7, 4.4, Math.cos(a) * 0.7); lf.rotation.set(0.4 * Math.cos(a), 0, -0.4 * Math.sin(a)); g.add(lf); } }
  scene.add(pl(22, 14, c3Prop('#ffffff', { map: rsTexRugCare(), rough: 0.9 }), 0, 0.05, 22, 0, -Math.PI / 2));
  // FOCUS: armchairs (residents), the round table + chairs, the director's chair
  const F = new THREE.Group(); scene.add(F);
  const chairM = c3Prop('#8a4a9a', { rough: 0.7 }), cloth = c3Prop('#ffffff', { map: texDots('#f28aa8', 4), rough: 0.7 });
  for (const [x, z] of [[-17, 14], [-10.5, 13]]) { F.add(rb(4.4, 2.6, 4.0, chairM, x, 1.3, z, 0.03)); F.add(rb(4.4, 4.2, 1.0, chairM, x, 3.6, z - 1.7, 0.03)); for (const sx of [-1, 1]) F.add(rb(0.9, 1.6, 4, chairM, x + sx * 2.1, 3.0, z, 0.02)); }
  F.add(cyl(3.2, 3.2, 0.3, wood, CR_TAB[0], 3.75, CR_TAB[1], 0.02, 32)); F.add(cyl(3.35, 3.35, 0.9, cloth, CR_TAB[0], 3.5, CR_TAB[1], 0.01, 32)); F.add(cyl(0.4, 0.6, 3.6, wood, CR_TAB[0], 1.8, CR_TAB[1], 0.015, 12));
  F.add(rb(2.3, 0.3, 2.3, c3Prop('#3a6a8a'), CR_SEAT[0], 2.25, CR_SEAT[1], 0.015)); for (const lx of [-1, 1]) for (const lz of [-1, 1]) F.add(rb(0.28, 2.1, 0.28, c3Prop('#5a2a14'), CR_SEAT[0] + lx * 0.95, 1.05, CR_SEAT[1] + lz * 0.95, 0.005)); F.add(rb(2.3, 2.6, 0.3, c3Prop('#3a6a8a'), CR_SEAT[0], 3.6, CR_SEAT[1] - 1.1, 0.015));
  { const v = cyl(0.35, 0.25, 1.0, c3Prop('#3f6fb5', { rough: 0.3 }), -1.6, 4.4, CR_TAB[1] - 1.2, 0.01, 12); F.add(v); for (let i = 0; i < 3; i++) { const fl0 = c3Mesh(new THREE.SphereGeometry(0.35, 10, 8), c3Prop('#ffd21a'), 0.01); fl0.position.set(-1.6 + (i - 1) * 0.35, 5.4 + (i % 2) * 0.3, CR_TAB[1] - 1.2); F.add(fl0); } }
  s.plate = gyozaPlate(6); F.add(s.plate);
  c3Layer(F, C3.L_FOCUS);
  s.p = {}; for (const w of ['dir', 'gran', 'c1', 'c2']) s.p[w] = person(scene, w);
  s.p.c1.g.position.set(-17, 2.9, 14.5); s.p.c2.g.position.set(-10.5, 2.9, 13.5);
  s.card = spritePlane(scene, crTexCard('TV DIRECTOR'), 7.6, 2.0); s.cloudB = spritePlane(scene, texCloud('img_burger.jpg'), 5, 5);
  s.hearts = [0, 1, 2].map(() => spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ff4a6a'; g.strokeStyle = '#2a1208'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h * 0.85);
    g.bezierCurveTo(w * 0.05, h * 0.5, w * 0.2, h * 0.08, w / 2, h * 0.32); g.bezierCurveTo(w * 0.8, h * 0.08, w * 0.95, h * 0.5, w / 2, h * 0.85); g.fill(); g.stroke(); }, 256, 256), 1.2, 1.2));
  c3Env(scene, { top: '#fff0c8', mid: '#f0c060', bot: '#4a3a2a' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
function rsTexRugCare() { return tex((g, w, h) => { g.fillStyle = '#3f8ab8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffd21a'; g.lineWidth = 12; g.strokeRect(20, 20, w - 40, h - 40); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.strokeRect(44, 44, w - 88, h - 88); }, 512, 320); }
const crGet = () => CR.s ||= crBuild();
const crRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#f6c63a', bgBlur: 1.0, glow: 0.45, glowBlur: 12 }, o));
function crReset(s, t) { [s.card, s.cloudB, ...s.hearts].forEach((m) => { m.visible = false; }); hideHeld(s.p.dir); hideHeld(s.p.gran);
  s.plate.visible = t >= 32.9; s.plate.position.set(2.0, 3.95, CR_TAB[1] + 0.8);
  for (const [w, i] of [['c1', 0], ['c2', 1]]) c3PersonPose(s.p[w], s.cam, t, { expr: Math.sin(t * 1.7 + i * 2) > 0.3 ? 'talking' : 'happy', gaze: [i ? -0.6 : 0.6, 0], hand: { armL: [1.4, 1.8], armR: [-1.4, 1.8] }, ...sitFeet(2.9) }); }
const crDirSeated = (s, t, o = {}) => { const d = s.p.dir; d.g.position.set(CR_SEAT[0], RS_SIT, CR_SEAT[1]); c3PersonPose(d, s.cam, t, Object.assign({ expr: 'happy', gaze: [-0.7, 0], hand: { armL: [1.4, 1.8], armR: [-1.4, 1.8] } }, sitFeet(RS_SIT), o)); return d; };
const crGran = (s, t, x, z, o = {}) => { const g = s.p.gran; g.g.position.set(x, FOOT, z); c3PersonPose(g, s.cam, t, Object.assign({ expr: 'happy', gaze: [0.7, -0.1], hand: { armL: [1.4, 1.6], armR: [-1.4, 1.6] } }, o.walk ? walkFeet(t * 9) : STAND, o.pose || {})); return g; };
// ---- s14: the TV director walks into the day room; TV DIRECTOR card on "director"; residents wave
SHOT_FN['s14'] = (t, u, lt) => { const s = crGet(); crReset(s, t);
  c3SetCam(s.cam, camMove([[0, [6, 10.5, 52], [4, 8, 16], 46], [9, [6, 10.5, 52], [4, 8, 16], 46]], lt, 's14', RS_CM));
  const k = EZ.io(clamp((t - 28.85) / 1.6)), d = s.p.dir; d.g.position.set(lerp(20, 7, k), FOOT, lerp(34, 26, k));
  c3PersonPose(d, s.cam, t, { expr: 'happy', gaze: [-0.6, 0], hand: k >= 1 ? { armL: [2.0, 4.2 + 0.3 * Math.sin(t * 10)], armR: [-1.4, 1.6] } : { armL: [1.4, 1.2], armR: [-1.4, 1.2] }, ...(k < 1 ? walkFeet(t * 10) : STAND) });
  crGran(s, t, -3, 18, { pose: { expr: 'excited', gaze: [0.7, 0], hand: { armL: [1.4, 1.6], armR: [-2.0, 4.2 + 0.3 * Math.sin(t * 10)] } } });
  const kc = pop(t, 30.08, 0.25); s.card.visible = kc > 0.01; if (s.card.visible) { s.card.position.set(d.g.position.x, 13.6, d.g.position.z); facing(s.card, s.cam); s.card.scale.setScalar(kc * 0.6); }
  crRender(s); };
// ---- s15: at the table: the burger cloud on "burger", she sets the dumplings down on "dumplings" (kick)
SHOT_FN['s15'] = (t, u, lt) => { const s = crGet(); crReset(s, t);
  c3SetCam(s.cam, camMove([[0, [1.5, 8.8, 42], [1.2, 6.6, 22], 40], [9, [1.5, 8.8, 42], [1.2, 6.6, 22], 40]], lt, 's15', RS_CM));
  crDirSeated(s, t, { expr: t > 32.9 ? 'confused' : 'excited' });
  const k = EZ.o3(clamp((t - 32.55) / 0.35)), g = crGran(s, t, -4.4, 25.5, { pose: { hand: { armL: [lerp(1.6, 2.6, k), lerp(3.0, 1.9, k)], armR: [-1.4, 1.6] } } });
  if (t < 32.9) { s.plate.visible = true; s.plate.position.set(lerp(-0.6, 2.0, k), lerp(6.2, 3.95, k), CR_TAB[1] + 0.8); }
  popAt(s.cloudB, pop(t, 32.04, 0.25) * (t > 32.9 ? 1 - clamp((t - 32.9) / 0.2) : 1), [5.6, 12.6, 22.4], s.cam);
  crRender(s); };
// ---- s16: (long take from s15) finger up to say something... then down, and a smile
SHOT_FN['s16'] = (t, u, lt) => { const s = crGet(); crReset(s, t);
  c3SetCam(s.cam, camMove([[0, [4.4, 8.6, 35], [3.4, 7.3, 22], 36], [9, [4.4, 8.6, 35], [3.4, 7.3, 22], 36]], lt, 's16', RS_CM));
  const up = t > 33.9 && t < 34.92;
  crDirSeated(s, t, { expr: c3FaceAt([[0, 'confused'], [33.9, 'talking'], [34.92, 'thinking'], [35.78, 'smile']], t, 'dir'), hand: { armL: [1.4, 1.8], armR: up ? [-1.6, 4.6] : [-1.4, 1.8] } });
  crGran(s, t, -4.4, 25.5, { pose: { expr: 'happy', gaze: [0.7, -0.1] } });
  crRender(s); };
// ---- s17: he bites — love face, hearts pop; she beams
SHOT_FN['s17'] = (t, u, lt) => { const s = crGet(); crReset(s, t);
  c3SetCam(s.cam, camMove([[0, [2.0, 8.8, 37], [1.8, 7.0, 22], 38], [9, [2.0, 8.8, 37], [1.8, 7.0, 22], 38]], lt, 's17', RS_CM));
  const d = crDirSeated(s, t, { expr: t > 36.9 ? 'love' : 'happy', hand: { armL: [1.4, 1.8], armR: [-0.5, 3.2] } });
  holdProp(d, 'dump', 'armR', () => gyoza(), { dy: 0.15, s: 0.8 });
  crGran(s, t, -4.4, 25.5, { pose: { expr: t > 37.0 ? 'proud' : 'happy', hand: { armL: [1.0, 2.6], armR: [-1.0, 2.6] } } });
  s.hearts.forEach((m, i) => popAt(m, pop(t, 36.98 + i * 0.12, 0.2), [CR_SEAT[0] - 1.6 + i * 1.6, 11.4 + (i % 2) * 0.6, CR_SEAT[1] + 0.5], s.cam));
  crRender(s); };

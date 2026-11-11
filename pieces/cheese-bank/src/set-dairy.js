// =====================================================================
//  SET dairy — your cheese cellar near Parma: ochre plaster with brick arches, terracotta floor, wooden racks packed with
//  Parmigiano wheels (painted far racks + a front rack of real wheels), a window onto green hills with cows, the wall
//  calendar (12 -> 24 months), the work table where the bills land, a little map card of Italy with the PARMA pin.
//  Registers SHOT_FN s06-s11. Prefix dy. Back wall z = 0, x -30..30, z 0..60.
// =====================================================================
const DY = {};
const DY_X = 30, DY_Z = 60, DY_H = 24, DY_TAB = [9, 30];
function dyTexWall() { const t = tex((g, w, h) => { g.fillStyle = '#e8a040'; g.fillRect(0, 0, w, h); const r = RNG('dyw');
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r.f() > 0.5 ? '255,240,200' : '150,80,20'},0.1)`; g.beginPath(); g.ellipse(r.f() * w, r.f() * h, 40, 26, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#a8502a'; g.lineWidth = 26; g.beginPath(); g.arc(w / 2, h * 0.75, w * 0.38, Math.PI, 0); g.stroke(); g.strokeStyle = '#140e10'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h * 0.75, w * 0.38 + 13, Math.PI, 0); g.stroke();
  g.fillStyle = '#a8502a'; g.fillRect(0, h * 0.9, w, h * 0.1); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function dyTexWindow() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5ea8f0'); gr.addColorStop(0.5, '#cfe8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#6ac04f'; g.beginPath(); g.moveTo(0, h * 0.55); g.quadraticCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.55); g.quadraticCurveTo(w * 0.85, h * 0.45, w, h * 0.52); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  for (const [x, y, s] of [[120, 190, 1], [330, 210, 1.2]]) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, 34 * s, 20 * s, 0, 0, TAU); g.fill(); g.lineWidth = 5; g.strokeStyle = '#140e10'; g.stroke();
    g.fillStyle = '#140e10'; g.beginPath(); g.ellipse(x - 8 * s, y - 4 * s, 10 * s, 7 * s, 0.4, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + 34 * s, y - 10 * s, 12 * s, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = '#140e10'; g.lineWidth = 5; for (const dx of [-20, -6, 10, 22]) { g.beginPath(); g.moveTo(x + dx * s, y + 18 * s); g.lineTo(x + dx * s, y + 34 * s); g.stroke(); } }
  g.fillStyle = '#ffffff'; g.fillRect(w / 2 - 6, 0, 12, h); g.fillRect(0, h / 2 - 6, w, 12); g.strokeStyle = '#140e10'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 512, 320); }
// the wall calendar: months aged (0..24) with the big number
function dyDrawCal(g, w, h, m) { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#c8323a'; g.fillRect(12, 12, w - 24, h * 0.22);
  inked(g, 'AGEING', w / 2, h * 0.13, h * 0.1, '#ffffff', { stroke: false }); inked(g, String(m), w / 2, h * 0.5, h * 0.3, '#2a1208', { stroke: false });
  inked(g, m === 1 ? 'MONTH' : 'MONTHS', w / 2, h * 0.72, h * 0.08, '#2a1208', { stroke: false });
  if (m === 12 || m === 24) { g.save(); g.translate(w / 2, h * 0.87); g.rotate(-0.1); inked(g, m >= 24 ? 'USUALLY 2 YEARS' : 'AT LEAST 1 YEAR', 0, 0, h * 0.065, '#c8323a', { stroke: false, maxW: w * 0.86 }); g.restore(); } }
function dyTexMap() { return tex((g, w, h) => { g.fillStyle = '#9ad0ff'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#6ac04f'; g.beginPath(); g.moveTo(w * 0.22, h * 0.12); g.lineTo(w * 0.62, h * 0.1); g.lineTo(w * 0.6, h * 0.26); g.lineTo(w * 0.72, h * 0.46); g.lineTo(w * 0.86, h * 0.62); g.lineTo(w * 0.78, h * 0.66); g.lineTo(w * 0.7, h * 0.86); g.lineTo(w * 0.6, h * 0.8); g.lineTo(w * 0.62, h * 0.62); g.lineTo(w * 0.42, h * 0.44); g.lineTo(w * 0.3, h * 0.28); g.closePath(); g.fill(); g.lineWidth = 6; g.stroke();
  g.fillStyle = '#e2453c'; g.beginPath(); g.arc(w * 0.44, h * 0.24, 16, 0, TAU); g.fill(); g.stroke(); inked(g, 'PARMA', w * 0.44, h * 0.34, h * 0.08, '#2a1208', { stroke: '#ffffff', sw: 8 });
  inked(g, 'ITALY', w * 0.5, h * 0.92, h * 0.07, '#23356a', { stroke: false }); }, 400, 560); }

function dyBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.6, sky: '#ffe8c8', ground: '#5a3a2a', key: '#fff0d8', keyI: 1.1, keyP: [60, 50, 60], rim: '#ffc890', rimI: 0.45, rimP: [-60, 30, -20] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = dyTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  scene.add(pl(2 * DY_X, DY_Z, c3Prop('#ffffff', { map: texTiles('#c8643a', '#b8542e', [8, 8]), rough: 0.6 }), 0, 0, DY_Z / 2, 0, -Math.PI / 2));
  scene.add(plNC(2 * DY_X, DY_H, wallM(4), 0, DY_H / 2, 0)); scene.add(plNC(DY_Z, DY_H, wallM(4), -DY_X, DY_H / 2, DY_Z / 2, Math.PI / 2)); scene.add(plNC(DY_Z, DY_H, wallM(4), DY_X, DY_H / 2, DY_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * DY_X, DY_H, wallM(4), 0, DY_H / 2, DY_Z, Math.PI)); scene.add(plNC(2 * DY_X, DY_Z, c3Prop('#c89060', { rough: 0.9 }), 0, DY_H, DY_Z / 2, 0, Math.PI / 2));
  const wood = c3Prop('#7a4a2a', { rough: 0.6 }), dk = c3Prop('#4a2a14');
  for (let z = 8; z < DY_Z; z += 12) scene.add(rbNC(2 * DY_X, 1.2, 1.2, dk, 0, DY_H - 0.6, z, 0.02));
  // painted racks on the back and left walls
  const rm = [0, 1].map((k) => { const t = texWheelRack(5, 6, 10 + k); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return c3Prop('#ffffff', { map: t, rough: 0.7 }); });
  scene.add(rb(52, 20, 2.4, rm[0], 0, 10, 1.4, 0.03)); { const r = c3Mesh(new THREE.BoxGeometry(2.4, 20, 40), [rm[1], rm[1], wood, wood, wood, wood], 0.03); r.position.set(-DY_X + 1.4, 10, 24); scene.add(r); }
  scene.add(pl(14, 8.75, c3Flat('#ffffff', { map: dyTexWindow() }), DY_X - 0.1, 12, 30, -Math.PI / 2)); scene.add(rb(0.8, 0.4, 15, wood, DY_X - 0.5, 7.4, 30, 0.01));
  s.cal = canvasTex(400, 560); s.calM = pl(4.4, 6.16, c3Flat('#ffffff', { map: s.cal.t }), 22, 13, 2.8); scene.add(s.calM);
  for (const [x, z] of [[26, 6], [26, 56], [-26, 56]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.2, 0.9, 2.2, c3Prop('#c96a3f'), 0, 1.1, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.ConeGeometry(0.4, 5, 6), c3Prop(i % 2 ? '#5ea64a' : '#4f9a44', { rough: 0.8 }), 0.01); lf.position.set(Math.sin(a) * 0.7, 4.4, Math.cos(a) * 0.7); lf.rotation.set(0.4 * Math.cos(a), 0, -0.4 * Math.sin(a)); g.add(lf); } }
  for (const [x, z] of [[-16, 12], [14, 10]]) { const l = c3Mesh(new THREE.SphereGeometry(1.0, 12, 10), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.01); l.position.set(x, DY_H - 3.5, z); scene.add(l);
    const pt = new THREE.PointLight('#ffd090', 0.35, 30, 1.6); pt.position.set(x, DY_H - 5, z); scene.add(pt); }
  // FOCUS: the front rack of real wheels, the work table with its own wheel
  const F = new THREE.Group(); scene.add(F);
  for (let r = 0; r < 4; r++) { F.add(rb(24, 0.4, 3.6, wood, -6, 0.8 + r * 3.4, 9, 0.015)); for (let i = 0; i < 7; i++) { const m = wheelMesh(1); m.position.set(-16.5 + i * 3.5, 1.0 + 0.58 + r * 3.4, 9); F.add(m); } }
  for (const x of [-18, 6]) F.add(rb(0.5, 14, 3.6, wood, x, 7, 9, 0.01));
  const [tx, tz] = DY_TAB; F.add(rb(9, 0.35, 5, c3Prop('#a8683a'), tx, 3.75, tz, 0.02)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.add(rb(0.45, 3.6, 0.45, dk, tx + sx * 4, 1.8, tz + sz * 2.1, 0.01));
  s.tableWheel = wheelMesh(1); s.tableWheel.position.set(tx - 2.2, 3.95 + 0.58, tz - 0.6); F.add(s.tableWheel);
  c3Layer(F, C3.L_FOCUS);
  s.p = {}; for (const w of ['you', 'p1']) s.p[w] = person(scene, w);
  s.map = spritePlane(scene, dyTexMap(), 3.4, 4.76);
  s.notReady = spritePlane(scene, bkTexTag('NOT READY'), 4.4, 1.15);
  s.notYet = spritePlane(scene, texBurst('NOT YET!', '#ffe23a', '#e8282a'), 4, 4);
  s.bills = [['COWS', '€ 3,200', '🐄'], ['WORKERS', '€ 8,500', '👷'], ['ELECTRICITY', '€ 1,900', '⚡']].map(([a, b, ic], i) => spritePlane(scene, texBill2(a, b, { icon: ic, band: ['#c8323a', '#3f6fb5', '#e0a020'][i] }), 2.4, 3.1));
  s.wallet = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#7a4a2a'; g.beginPath(); g.roundRect(40, 120, w - 80, h - 200, 30); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
    g.fillStyle = '#3a2010'; g.fillRect(60, 120, w - 120, 30); inked(g, '€ 0', w / 2, h * 0.62, h * 0.18, '#ffe23a', { stroke: '#2a1208', sw: 10 });
    g.fillStyle = '#d8d0c0'; g.beginPath(); g.ellipse(w * 0.7, 80, 30, 18, -0.3, 0, TAU); g.ellipse(w * 0.8, 70, 30, 18, 0.3, 0, TAU); g.fill(); g.lineWidth = 5; g.stroke(); }, 400, 400), 3, 3);
  c3Env(scene, { top: '#ffe8c8', mid: '#e0a050', bot: '#3a2418' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const dyGet = () => DY.s ||= dyBuild();
function dyReset(s, t) { for (const k in s.p) { s.p[k].g.visible = false; hideHeld(s.p[k]); }
  [s.map, s.notReady, s.notYet, s.wallet, ...s.bills].forEach((m) => { m.visible = false; });
  const m = t < 14.9 ? 0 : t < 15.56 ? Math.round(clamp((t - 14.9) / 0.6) * 12) : t < 16.2 ? 12 : Math.min(24, 12 + Math.round(clamp((t - 16.2) / 0.4) * 12));
  redraw(s.cal, 'm' + m, (g, w, h) => dyDrawCal(g, w, h, m)); }
const dyRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#e8a040', bgBlur: 1.0, glow: 0.45, glowBlur: 12 }, o));
const dyCam = (s, id, lt, p, l, fov = 42) => c3SetCam(s.cam, camMove([[0, p, l, fov], [9, p, l, fov]], lt, id, { orbit: 0, creep: 0, rush: 0 }));
const dyYou = (s, t, x, z, o = {}) => { const p = s.p.you; p.g.visible = true; p.g.position.set(x, FOOT, z); c3PersonPose(p, s.cam, t, Object.assign({ expr: 'happy', gaze: [0, 0], hand: { armL: [1.4, 1.6], armR: [-1.4, 1.6] } }, o.walk ? walkFeet(t * 10) : STAND, o.pose || {})); return p; };

// ---- s06: you in your cellar near Parma: the map card with the PARMA pin on "Parma"
SHOT_FN['s06'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's06', lt, [0, 9, 46], [-1, 8, 22], 42);
  dyYou(s, t, -1, 22, { pose: { expr: 'proud', hand: { armL: [1.4, 1.6], armR: [-2.0, 3.6] } } }); popAt(s.map, pop(t, 9.84, 0.22), [3.4, 11.4, 22.4], s.cam); dyRender(s); };
// ---- s07: wide: hundreds of giant wheels (the racks fill the frame)
SHOT_FN['s07'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's07', lt, [6, 14, 58], [-4, 8, 8], 50);
  dyYou(s, t, 2, 20, { pose: { expr: 'excited', hand: { armL: [2.4, 3.6], armR: [-2.4, 3.6] } } }); dyRender(s); };
// ---- s08: none of them are ready: the NOT READY tag on the table wheel
SHOT_FN['s08'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's08', lt, [8, 9, 44], [7.5, 6, 30], 40);
  dyYou(s, t, 11.5, 31.5, { pose: { expr: t > 13.4 ? 'sad' : 'neutral', gaze: [-0.6, -0.3], hand: { armL: [1.4, 1.6], armR: [-2.0, 2.6] } } });
  popAt(s.notReady, pop(t, 13.54, 0.22), [DY_TAB[0] - 2.2, 6.6, DY_TAB[1]], s.cam); dyRender(s); };
// ---- s09: the calendar: 12 months on "year", 24 on "two"
SHOT_FN['s09'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's09', lt, [22, 12.4, 16], [22, 12.6, 2.8], 42); dyRender(s, { bgBlur: 0.6 }); };
// ---- s10: before anyone can sell it: a buyer reaches with cash; NOT YET!
SHOT_FN['s10'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's10', lt, [8, 9, 50], [8, 7, 30], 44);
  dyYou(s, t, 4, 30, { pose: { expr: t > 17.5 ? 'determined' : 'nervous', gaze: [0.6, 0], hand: t > 17.5 ? { armL: [2.4, 3.4], armR: [-1.4, 1.6] } : undefined } });
  const p = s.p.p1, k = EZ.io(clamp((t - 16.8) / 0.8)); p.g.visible = true; p.g.position.set(lerp(20, 14, k), FOOT, 31); c3PersonPose(p, s.cam, t, { expr: 'excited', gaze: [-0.6, 0], hand: { armL: [1.4, 1.6], armR: [-2.4, 2.8] }, ...(k < 1 ? walkFeet(t * 10) : STAND) });
  holdProp(p, 'cash', 'armR', () => rb(1.2, 0.6, 0.1, c3Prop('#7ac86a'), 0, 0, 0, 0.01), { dy: 0.1 });
  popAt(s.notYet, pop(t, 17.56, 0.2), [8, 12.4, 30.5], s.cam, 0.8); dyRender(s); };
// ---- s11: the bills land: COWS, WORKERS, ELECTRICITY; then the empty wallet on "no money"
SHOT_FN['s11'] = (t, u, lt) => { const s = dyGet(); dyReset(s, t); dyCam(s, 's11', lt, [9, 9, 46], [9, 7, 30], 42);
  dyYou(s, t, 12.6, 31.4, { pose: { expr: t > 21.4 ? 'crying' : t > 19.3 ? 'nervous' : 'neutral', gaze: [-0.6, -0.2] } });
  [19.36, 19.98, 20.6].forEach((t0, i) => popAt(s.bills[i], pop(t, t0, 0.2), [5.6 + i * 2.6, 9.4 + (i % 2) * 0.6, 31], s.cam));
  popAt(s.wallet, pop(t, 21.48, 0.22), [9, 13.6, 31], s.cam); dyRender(s); };

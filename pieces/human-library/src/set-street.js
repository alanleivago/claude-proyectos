// =====================================================================
//  SET street — Copenhagen: the Human Library's sandstone facade closing a cobbled street that runs to the canal,
//  ported from the approved mromidev test (app/ library.ts streetDress + world.ts town/canal): arched windows, columns,
//  pediment, the red HUMAN LIBRARY banner, Danish flags, bunting over the steps, flower boxes; colourful gabled canal
//  houses on both quays, lamp posts, benches, coloured bikes, café parasols, a poster kiosk, moored boats, storybook trees.
//  Registers SHOT_FN s01, s13, s14, s15. Prefix st.
//  Coordinates: the test's metres mapped with S(x, h, z) = [5x, 5h, 5(z + 50)] (facade front z = 0, near quay edge
//  z = 100, far quay z = 400).
// =====================================================================
const ST = {};
const STP = (x, h, z) => [5 * x, 5 * h, 5 * (z + 50)];
function stTexFacade() { return tex((g, w, h) => { const m = w / 13, R0 = RNG('stfac'); g.fillStyle = '#e8b46a'; g.fillRect(0, 0, w, h);
  for (let y = 0, row = 0; y < h; y += m * 0.5, row++) { g.strokeStyle = 'rgba(120,85,45,0.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (row % 2) * m * 0.6; x < w; x += m * 1.2) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + m * 0.5); g.stroke(); } }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${R0.f() > 0.5 ? '255,255,255' : '140,100,60'},0.07)`; g.beginPath(); g.ellipse(R0.f() * w, R0.f() * h, 40 + R0.f() * 60, 30 + R0.f() * 40, 0, 0, 7); g.fill(); }
  const arch = (cx, top, aw, ah, fill) => { g.beginPath(); g.moveTo(cx - aw / 2, top + ah); g.lineTo(cx - aw / 2, top + aw / 2); g.arc(cx, top + aw / 2, aw / 2, Math.PI, 0); g.lineTo(cx + aw / 2, top + ah); g.closePath();
    g.fillStyle = fill; g.fill(); g.strokeStyle = '#140e10'; g.lineWidth = 5; g.stroke(); };
  for (const cx of [1.6, 3.9, 9.1, 11.4]) { arch(cx * m, 1.4 * m, 1.3 * m, 3.0 * m, '#3f6f9a'); arch(cx * m, 5.6 * m, 1.3 * m, 2.6 * m, '#3f6f9a');
    for (const tp of [1.4, 5.6]) { g.strokeStyle = '#f3ead8'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx * m, (tp + 0.65) * m); g.lineTo(cx * m, (tp + (tp < 3 ? 3.0 : 2.6)) * m); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(cx * m - 0.45 * m, 2.4 * m, 0.18 * m, 1.6 * m); }
  arch(6.5 * m, 6.6 * m, 2.6 * m, 5.4 * m, '#5a3424'); g.strokeStyle = '#e0b03c'; g.lineWidth = 4; g.beginPath(); g.moveTo(6.5 * m, 8.0 * m); g.lineTo(6.5 * m, 12 * m); g.stroke();
  g.fillStyle = '#c9a36a'; g.fillRect(0, 0.2 * m, w, 0.5 * m); g.fillStyle = '#140e10'; g.fillRect(0, 0.7 * m, w, 4); g.fillStyle = '#c9a36a'; g.fillRect(0, 5.0 * m, w, 0.3 * m); g.fillStyle = '#140e10'; g.fillRect(0, 5.3 * m, w, 3); }, 1024, 960); }
function stTexBanner() { return tex((g, w, h) => { g.fillStyle = '#b8433a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0b03c'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
  inked(g, 'HUMAN LIBRARY', w / 2, h / 2 + 6, 120, '#fff3d6', { stroke: '#241726', sw: 14, maxW: w * 0.86 }); }, 1024, 300); }
function stTexDK() { return tex((g, w, h) => { g.fillStyle = '#c8102e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(w * 0.28, 0, w * 0.11, h); g.fillRect(0, h * 0.43, w, h * 0.15); }, 128, 96); }
function stTexParasol(c) { const t = tex((g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#fff8e8' : c; g.fillRect(i * w / 8, 0, w / 8, h); } }, 256, 64); return t; }
function stTexKiosk() { const t = tex((g, w, h) => { const cols = ['#e0b03c', '#c25a7a', '#3f6fb5', '#2f8a6a']; g.fillStyle = '#2f6a52'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.fillRect(i * 64 + 4, 30, 56, 190); g.fillStyle = '#140e10'; g.fillRect(i * 64 + 4, 30, 56, 6); } }, 512, 256); return t; }
function stTexWater() { const t = tex((g, w, h) => { g.fillStyle = '#3fa0cf'; g.fillRect(0, 0, w, h); const R0 = RNG('stwater');
  for (let i = 0; i < 70; i++) { g.strokeStyle = R0.f() < 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(20,70,120,0.35)'; g.lineWidth = 3; const x = R0.f() * w, y = R0.f() * h, l = 20 + R0.f() * 50;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6); return t; }
function stBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.5, 9000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.55, sky: '#cfe8ff', ground: '#6a5a4a', key: '#fff2d8', keyI: 1.15, keyP: [260, 420, 300], rim: '#ffd8a0', rimI: 0.4, rimP: [-300, 200, -300] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 61, band: [0.38, 0.5], clouds: 40, scale: 1.1, midAt: 0.42, pal: { mid: '#6aaaf0' } }) })));
  { const sky = scene.children[scene.children.length - 1]; sky.material.side = THREE.BackSide; sky.material.fog = false; }   // the sky never takes the fog
  c3Fog(scene, 'day', 600, 4200);   // exteriors: pushed far back (the test's verifier: the street and aerial read grey)
  const pave = (w, d, x, z, col = '#c8b8a0', rep = [w / 12, d / 12]) => { const m = pl(w, d, c3Prop('#ffffff', { map: c3TexWall('paving', col, { rep }), rough: 0.85 }), x, 0.02, z, 0, -Math.PI / 2); scene.add(m); return m; };
  pave(1400, 100, 0, 50, '#b8805a');            // the street + near quay
  pave(1400, 260, 0, -130, '#a89070');           // behind the facade (seen from the aerial)
  pave(1400, 300, 0, 590, '#ab9474');            // the far quay and beyond
  const grass = pl(4000, 2000, c3Prop('#6aab4f', { rough: 0.9 }), 0, -0.2, -1260, 0, -Math.PI / 2); scene.add(grass);
  // the canal: water below the quays, stone embankment walls, a continuous parapet
  const water = pl(1400, 300, c3Prop('#ffffff', { map: stTexWater(), rough: 0.15, env: 1.3 }), 0, -6, 250, 0, -Math.PI / 2); scene.add(water);
  const stone = c3Prop('#ffffff', { map: c3TexWall('brick', '#bfb19f', { rep: [60, 1] }), rough: 0.8 });
  scene.add(pl(1400, 6, stone, 0, -3, 100)); scene.add(pl(1400, 6, stone, 0, -3, 400, Math.PI));
  scene.add(rb(1400, 3.75, 2.5, c3Prop('#e6dccd', { rough: 0.7 }), 0, 1.9, 98.5, 0.03)); scene.add(rb(1400, 3.75, 2.5, c3Prop('#e6dccd', { rough: 0.7 }), 0, 1.9, 401.5, 0.03));
  // canal houses: colourful gables on both quays (Nyhavn colours), street-side rows along the road to the library
  const COLS = ['#e0b03c', '#c96a3f', '#3f6fb5', '#c25a7a', '#2f8a6a', '#e8483a', '#7ec8e3', '#f4ecd8'];
  const house = (x, z, ry, i, sc = 1) => { const R0 = RNG('sthouse', i), w = R0.f() < 0.5 ? 7 : 9, h = [7, 8.4, 9.8][i % 3];
    const b = c3Building({ w, h, d: 8, floors: h > 8 ? 3 : 2, cols: w > 8 ? 3 : 2, wall: 'plaster', color: COLS[i % COLS.length], trim: '#ffffff', roof: 'gable', roofH: 3, roofColor: ['#3a3a40', '#8a3a2a', '#2f4f5a'][i % 3], door: '#2a3a5a', seed: i });
    b.scale.setScalar(5 * sc); b.position.set(x, 0, z); b.rotation.y = ry; scene.add(b); return w * 5 * sc; };
  for (const sx of [-1, 1]) { let x = 40; for (let i = 0; i < 16; i++) { const w = house(sx * (x + 20), 47.5, 0, i * 2 + (sx > 0 ? 1 : 0)); x += w + 1; } }
  { let x = -600; for (let i = 0; i < 30; i++) { const w = house(x + 20, 452.5, Math.PI, 40 + i); x += w + 1; } }
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) house(sx * 50, -20 - i * 45, -sx * Math.PI / 2, 80 + i * 2 + (sx > 0 ? 1 : 0));
  // the library: sandstone block, painted front, cornice, pediment, roof, columns, steps, banner, flags, bunting, flower boxes
  const sand = c3Prop('#ffffff', { map: c3TexWall('brick', '#e3c590', { rep: [6, 6] }), rough: 0.8 });
  scene.add(rb(65, 60, 60, sand, 0, 30, -30, 0.05));
  scene.add(pl(65, 60, c3Prop('#ffffff', { map: stTexFacade(), rough: 0.8 }), 0, 30, 0.12));
  scene.add(rb(70, 3, 65, c3Prop('#e8cc98'), 0, 61.5, -30, 0.05));
  { const sh = new THREE.Shape([new THREE.Vector2(-34, 0), new THREE.Vector2(34, 0), new THREE.Vector2(0, 15)]), pg = new THREE.ExtrudeGeometry(sh, { depth: 4.5, bevelEnabled: false });
    const ped = c3Mesh(pg, c3Prop('#e8cc98'), 0.05); ped.position.set(0, 63, -2.5); scene.add(ped); }
  scene.add(rb(63, 10, 55, c3Prop('#4f6f7a', { rough: 0.6 }), 0, 68, -33, 0.05));
  for (let k = 0; k < 3; k++) scene.add(rb(32 + k * 5, 0.9 * (3 - k), 3 + k * 3, c3Prop('#e6dccd'), 0, 0.45 * (3 - k), 1.5 + k * 3, 0.03));
  for (const x of [-14.5, 14.5]) { scene.add(cyl(1.9, 2.1, 31, c3Prop('#efd9a8'), x, 18.2, 3, 0.04, 18)); scene.add(rb(5.5, 2, 5.5, c3Prop('#e8cc98'), x, 34.5, 3, 0.03)); }
  scene.add(pl(32, 9.5, c3Flat('#ffffff', { map: stTexBanner() }), 0, 43, 0.4));
  const dk = c3Flat('#ffffff', { map: stTexDK() }); dk.side = THREE.DoubleSide;
  s.flags = [-24, 24].map((x) => { scene.add(cyl(0.2, 0.2, 16, c3Prop('#2f3542'), x, 48, 3, 0.01, 8)); const f = pl(7.5, 5.5, dk, x + Math.sign(x) * 3.9, 53, 3); scene.add(f); return f; });
  const BUNT = ['#c0353a', '#e0b03c', '#3f6fb5', '#2f8a6a', '#fff8e8'];
  for (let i = 0; i < 18; i++) { const u = i / 17, x = -27 + 54 * u, y = 27 - 22 * u * (1 - u), tri = c3Mesh(new THREE.ConeGeometry(0.8, 1.8, 3), c3Prop(BUNT[i % 5]), 0.01); tri.rotation.x = Math.PI; tri.position.set(x, y - 1, 16); scene.add(tri); }
  const FL = ['#e2453c', '#e0b03c', '#c25a7a', '#ffffff'];
  for (const x of [-28, 28]) for (let i = 0; i < 2; i++) { const z = 7.5 + i * 11; scene.add(rb(5, 2.5, 3, c3Prop('#c96a3f'), x, 1.25, z, 0.02));
    for (let k = 0; k < 6; k++) { const f = c3Mesh(new THREE.SphereGeometry(0.65, 8, 6), c3Prop(FL[k % 4]), 0.01); f.position.set(x - 1.75 + k * 0.7, 3.1 + (k % 2) * 0.3, z + (k % 3 - 1) * 0.6); scene.add(f); } }
  // trees, lamp posts, benches, bikes, parasols, kiosk, boats
  for (const [x, z, h] of [[-9, 37.6, 6], [-18, 37.5, 6.4], [-32, 37.6, 6.2], [32, 37.4, 6.5]]) {
    const tr = c3Tree(1, '#5ea64a', Math.round(x * 3 + z)); tr.scale.setScalar(h * 0.95); const [X, , Z] = STP(x, 0, z); tr.position.set(X, 0, Z); scene.add(tr); }
  for (const x of [-12, -4.5, 4.5, 12, -22, 22]) { const l = c3Lamp(4.5); l.scale.setScalar(5); const [X, , Z] = STP(x, 0, -32.2); l.position.set(X, 0, Z); scene.add(l); }
  for (const x of [-8.2, 8.2]) { const [X, , Z] = STP(x, 0, -33); scene.add(rb(9, 0.4, 2, c3Prop('#6e4530'), X, 2.3, Z, 0.01)); scene.add(rb(9, 2.4, 0.4, c3Prop('#6e4530'), X, 3.6, Z - 1, 0.01)); }
  ['#c0353a', '#3f6fb5', '#e0b03c', '#2f8a6a'].forEach((c, i) => { const [X, , Z] = STP([-16, -15.2, 15.4, 16.2][i], 0, -40.5), g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
    for (const dz of [-2.25, 2.25]) { const w = c3Mesh(new THREE.TorusGeometry(1.6, 0.18, 6, 20), c3Toon('#2a2a30'), 0.01); w.rotation.y = Math.PI / 2; w.position.set(0, 1.7, dz); g.add(w); }
    g.add(rb(0.3, 0.3, 4.5, c3Prop(c), 0, 1.9, 0, 0.01)); g.add(rb(0.3, 2.5, 0.3, c3Prop(c), 0, 3.0, 1.0, 0.01)); g.add(rb(2, 0.2, 0.4, c3Toon('#2a2a30'), 0, 4.3, 1.0, 0.005)); });
  [[-20, -33.6, '#c0353a'], [-23.5, -34.2, '#2f8a6a'], [20.5, -33.8, '#3f6fb5'], [24, -34.3, '#e0b03c'], [-21, 33.6, '#e0b03c'], [21, 33.8, '#c0353a'], [-30, 34, '#3f6fb5']].forEach(([x, z, c]) => {
    const [X, , Z] = STP(x, 0, z), m = c3Prop('#ffffff', { map: stTexParasol(c) }); m.side = THREE.DoubleSide;
    scene.add(cyl(0.18, 0.18, 11.5, c3Toon('#2f3542'), X, 5.75, Z, 0.01, 8)); const pc = c3Mesh(new THREE.ConeGeometry(6, 2.5, 16, 1, true), m, 0.02); pc.position.set(X, 12.25, Z); scene.add(pc);
    scene.add(cyl(1.9, 1.9, 0.25, c3Prop('#f4ecd8'), X, 3.7, Z, 0.01, 16)); scene.add(cyl(0.25, 0.25, 3.6, c3Toon('#2f3542'), X, 1.8, Z, 0.005, 8));
    for (const dx of [-3.5, 3.5]) scene.add(rb(1.8, 0.25, 1.8, c3Prop('#b8433a'), X + dx, 2.2, Z, 0.01)); });
  { const [X, , Z] = STP(-12.5, 0, -37.6); scene.add(cyl(4.5, 4.5, 13, c3Prop('#ffffff', { map: stTexKiosk() }), X, 6.5, Z, 0.03, 16)); const rf = c3Mesh(new THREE.ConeGeometry(5.75, 4, 16), c3Prop('#2f6a52'), 0.03); rf.position.set(X, 15, Z); scene.add(rf); }
  for (const [x, z, c] of [[-14, -26.5, '#c0353a'], [10, -27, '#2f8a6a'], [26, 27, '#e0b03c'], [-30, 26, '#3f6fb5']]) { const [X, , Z] = STP(x, 0, z), g = new THREE.Group(); g.position.set(X, -6, Z); scene.add(g);
    g.add(rb(26, 3.25, 8, c3Prop(c), 0, 1.6, 0, 0.04)); g.add(rb(20, 0.5, 6, c3Prop('#8a5a3c'), 0, 3.5, 0, 0.02)); g.add(rb(6, 3.5, 5, c3Prop('#f4ecd8'), -3, 5.5, 0, 0.03)); }
  // people: walkers going in (s01), volunteers on the far quay under their titles (s15)
  s.walk = ['r4', 'w2', 'w1', 'w3', 'w5', 'w4'].map((who) => person(scene, who));
  s.far = ['refu', 'man', 'cop', 'tatt', 'fire'].map((who) => person(scene, who));
  s.farT = ['REFUGEE', 'FORMER PRISONER', 'POLICE OFFICER', 'COVERED IN TATTOOS', 'FIREFIGHTER'].map((txt) => spritePlane(scene, rmTexTitle(txt), 7.6, 2.0));
  c3Env(scene, { top: '#cfe8ff', mid: '#a8c8d8', bot: '#4a4a3a' });
  c3ShadeScene(scene, { dark: 0.18, maxSize: 200 });
  return s;
}
const stGet = () => ST.s ||= stBuild();
const ST_CM = { orbit: 0.004, creep: 0, rush: 0.03 };
function stWorld(s, t) { s.flags.forEach((f, i) => { f.rotation.y = 0.18 * Math.sin(t * 3 + i); });
  s.walk.forEach((p) => { p.g.visible = false; }); s.far.forEach((p) => { p.g.visible = false; }); s.farT.forEach((m) => { m.visible = false; }); }
const stRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#8ec8f0', bgBlur: 0, glow: 0.3, glowBlur: 10 }, o));
// ---- s01: the hook — the library at the end of the street, people walking in, nobody carries a book
SHOT_FN['s01'] = (t, u, lt) => { const s = stGet(); stWorld(s, t);
  c3SetCam(s.cam, camMove([[0, [15, 23, 140], [0, 18, 0], 44], [0.75, [15, 23, 140], [0, 18, 0], 44], [1.9, [8, 11.5, 75], [0, 17, 0], 42], [9, [8, 11.5, 75], [0, 17, 0], 42]], lt, 's01', ST_CM));
  [[-1.6, -39.5, 0], [1.2, -41, 0.35], [2.6, -43, 0.7], [-2.4, -44.5, 0.2], [0.4, -46.5, 0.55], [3.4, -42.2, 0.85]].forEach(([x0, z0, ph], i) => {
    const z = z0 - 0.85 * t, x = x0 * Math.max(0.25, Math.min(1, (z + 49.1) / 14)), p = s.walk[i]; if (z < -48.7) return;
    const up = z < -47.6 ? 0.54 * clamp((-47.6 - z) / 1.8) : 0; const [X, Y, Z] = STP(x, up, z); p.g.visible = true; p.g.position.set(X, FOOT + Y, Z);
    c3PersonPose(p, s.cam, t, { expr: i % 2 ? 'happy' : 'smile', gaze: [0, 0.1], ...walkFeet(t * 9 + ph * 6), hand: { armL: [1.4, 1.0 + 0.3 * Math.sin(t * 9 + ph * 6)], armR: [-1.4, 1.0 - 0.3 * Math.sin(t * 9 + ph * 6)] } }); });
  stRender(s); };
// ---- s13: the aerial over the canal town ("this started in Denmark")
SHOT_FN['s13'] = (t, u, lt) => { const s = stGet(); stWorld(s, t);
  c3SetCam(s.cam, camMove(K1([140, 150, 250], [0, 16, 20], 42), lt, 's13', ST_CM)); stRender(s); };   // higher: the horizon (cloud edge) stays out of frame
// ---- s14: the HUMAN LIBRARY banner over the door, on "Human Library"
SHOT_FN['s14'] = (t, u, lt) => { const s = stGet(); stWorld(s, t);
  c3SetCam(s.cam, camMove(K1([0, 11, 72.5], [0, 38, 0], 44), lt, 's14', ST_CM)); stRender(s); };
// ---- s15: telephoto across the canal — volunteers on the far quay, judged from far away under their titles
SHOT_FN['s15'] = (t, u, lt) => { const s = stGet(); stWorld(s, t);
  c3SetCam(s.cam, camMove(K1([90.5, 13.5, 95], [90.5, 11.5, 420], 8.4), lt, 's15', ST_CM));
  [[16.5, 34.0], [17.3, 33.4], [18.1, 34.5], [18.9, 33.6], [19.7, 34.3]].forEach(([x, z], i) => { const p = s.far[i], [X, , Z] = STP(x, 0, z); p.g.visible = true; p.g.position.set(X, FOOT, Z);
    c3PersonPose(p, s.cam, t, { expr: ['happy', 'neutral', 'smile', 'happy', 'smile'][i], gaze: [0, 0], ...STAND });
    const k = pop(t, 42.76 + i * 0.14, 0.22), m = s.farT[i]; m.visible = k > 0.01; if (m.visible) { m.position.set(X, 13.5 + (i % 2) * 2.4, Z - 0.5); facing(m, s.cam); m.scale.setScalar(k * 0.85); } });
  stRender(s, { bgBlur: 1.2 }); };

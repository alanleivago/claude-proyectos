// =====================================================================
//  SET street — a narrow Tokyo alley at dusk: two-storey wooden houses on both sides, strings of red lanterns across
//  the lane, a lit drink vending machine, poles + overhead wires, potted plants, bikes; the little restaurant closes the
//  alley (dark wood front, blue noren, two red lanterns, the signboard RESTAURANT OF MISTAKEN ORDERS that lights up).
//  Registers SHOT_FN s01, s12. Prefix sx. Facade front z = 0, the alley runs to +z.
// =====================================================================
const SX = {};
function sxTexFront() { return tex((g, w, h) => { g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 24) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, 0, 3, h); }
  g.fillStyle = '#ffd890'; for (const x of [70, 760]) { g.fillRect(x, 300, 190, 250); g.strokeStyle = '#3a1a0a'; g.lineWidth = 10; g.strokeRect(x, 300, 190, 250); g.fillStyle = '#3a1a0a'; g.fillRect(x + 92, 300, 8, 250); g.fillRect(x, 420, 190, 8); g.fillStyle = '#ffd890'; }
  const gr = g.createLinearGradient(0, 380, 0, h); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#ffb860'); g.fillStyle = gr; g.fillRect(330, 380, 360, h - 380);
  g.fillStyle = '#3a1a0a'; for (let x = 330; x <= 690; x += 90) g.fillRect(x, 380, 8, h - 380); g.strokeStyle = '#140e10'; g.lineWidth = 12; g.strokeRect(330, 380, 360, h - 380); }, 1024, 1024); }
function sxTexTitle(on) { return tex((g, w, h) => { g.fillStyle = on ? '#fff3c8' : '#d8c8a0'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = '#3a1a0a'; g.stroke();
  inked(g, 'RESTAURANT OF', w / 2, h * 0.34, h * 0.24, '#c8323a', { stroke: false, maxW: w * 0.84 }); inked(g, 'MISTAKEN ORDERS', w / 2, h * 0.68, h * 0.27, '#c8323a', { stroke: false, maxW: w * 0.9 }); }, 1024, 300); }
function sxTexVend() { return tex((g, w, h) => { g.fillStyle = '#e8f4ff'; g.fillRect(0, 0, w, h); const C = ['#e8322a', '#3f6fb5', '#2f8a6a', '#e0b03c', '#c25a7a', '#7a4a2a'];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { g.fillStyle = C[(i + r * 2) % 6]; g.fillRect(14 + i * 40, 30 + r * 92, 28, 64); g.fillStyle = '#ffffff'; g.fillRect(18 + i * 40, 46 + r * 92, 20, 10); g.fillStyle = '#e8322a'; g.fillRect(18 + i * 40, 100 + r * 92, 20, 8); }
  g.fillStyle = '#2a2a30'; g.fillRect(14, h - 110, w - 28, 90); g.strokeStyle = '#140e10'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }, 256, 512); }
function sxTexVsign(txt, bg) { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = '#140e10'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  [...txt].forEach((c, i) => inked(g, c, w / 2, (i + 0.6) * h / (txt.length + 0.2), w * 0.62, '#fff3d6', { stroke: false })); }, 128, 512); }

function sxBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.5, 4000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffe0d0', ambI: 0.6, sky: '#ffb890', ground: '#4a3050', key: '#ffd0a0', keyI: 1.0, keyP: [-120, 90, 160], rim: '#a890ff', rimI: 0.45, rimP: [120, 80, -100] });
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'dusk', seed: 7, band: [0.38, 0.5], clouds: 26, scale: 1.1, midAt: 0.45 }) })); sky.material.side = THREE.BackSide; sky.material.fog = false; scene.add(sky); }
  c3Fog(scene, 'dusk', 160, 900);
  const lane = pl(30, 420, c3Prop('#ffffff', { map: c3TexWall('paving', '#8a7a8a', { rep: [3, 40] }), rough: 0.5, env: 0.8 }), 0, 0.02, 200, 0, -Math.PI / 2); scene.add(lane);   // wet-looking lane
  scene.add(pl(800, 800, c3Prop('#5a4a5a', { rough: 0.9 }), 0, -0.1, 200, 0, -Math.PI / 2));
  // houses on both sides, facing the lane
  const COLS = ['#c8884a', '#a8603a', '#e0c8a0', '#7a5a4a', '#d8a070', '#b87050'];
  for (const sx of [-1, 1]) { let z = 2; for (let i = 0; i < 12; i++) { const R0 = RNG('sxh', i * 2 + (sx > 0 ? 1 : 0)), w = R0.f() < 0.5 ? 4 : 5;
    const b = c3Building({ w, h: [4.6, 5.2, 5.8][i % 3], d: 3, floors: 2, cols: 2, wall: 'siding', color: COLS[(i + (sx > 0 ? 3 : 0)) % COLS.length], trim: '#f0e0c8', roof: 'gable', roofH: 1.4, roofColor: ['#3a3a48', '#5a3a2a'][i % 2], door: '#3a2418', lit: 0.6, seed: i + (sx > 0 ? 50 : 0) });
    b.scale.setScalar(5); b.position.set(sx * 22.5, 0, z + w * 2.5); b.rotation.y = -sx * Math.PI / 2; scene.add(b);
    if (i % 2 === 0) { const vs = pl(2.4, 9.6, c3Flat('#ffffff', { map: sxTexVsign(['RAMEN', 'SUSHI', 'SODA', 'BAR', 'TEA', 'UDON', 'SAKE'][i % 7], ['#c8323a', '#23356a', '#2f8a6a'][i % 3]), glow: '#ffffff' }), sx * 14.4, 15, z + 4, -sx * Math.PI / 2); scene.add(vs); }
    z += w * 5 + 1; } }
  // the restaurant closing the alley
  scene.add(rb(30, 22, 14, c3Prop('#6a3a1e', { rough: 0.7 }), 0, 11, -7, 0.04));
  scene.add(pl(30, 22, c3Prop('#ffffff', { map: sxTexFront(), rough: 0.7 }), 0, 11, 0.1));
  scene.add(rb(34, 1.2, 6, c3Prop('#3a3a48', { rough: 0.6 }), 0, 22.4, -2, 0.03));   // eave
  scene.add(pl(10.5, 4.5, new THREE.MeshBasicMaterial({ map: rsTexNoren(), transparent: true, side: THREE.DoubleSide }), 0, 11.8, 0.6));
  s.signOff = c3Flat('#ffffff', { map: sxTexTitle(false) }); s.signOn = c3Flat('#ffffff', { map: sxTexTitle(true), glow: '#fff0b0' });
  s.sign = pl(20, 5.86, s.signOff, 0, 17.2, 0.6); scene.add(s.sign);
  const lantM = c3Prop('#ffffff', { map: rsTexLantern(), emissive: '#ff6a3a', ei: 0.7, glow: '#ff8a5a', rough: 0.6 });
  for (const x of [-8.5, 8.5]) { const l = c3Mesh(new THREE.SphereGeometry(1.5, 16, 12), lantM, 0.02); l.scale.y = 1.3; l.position.set(x, 13.5, 1.6); scene.add(l); const pt = new THREE.PointLight('#ffb070', 0.6, 30, 1.6); pt.position.set(x, 12, 4); scene.add(pt); }
  // lantern strings across the lane, vending machine, poles + wires, plants, bikes
  for (const z of [26, 58, 94, 132]) { const n = 7; for (let i = 0; i < n; i++) { const x = -13 + i * 26 / (n - 1), y = 19 - Math.sin(i / (n - 1) * Math.PI) * 2.4;
      const l = c3Mesh(new THREE.SphereGeometry(0.9, 12, 10), lantM, 0.015); l.scale.y = 1.25; l.position.set(x, y, z); scene.add(l); }
    const wire = cyl(0.05, 0.05, 28, c3Toon('#140e10'), 0, 20, z, 0, 4); wire.rotation.z = Math.PI / 2; scene.add(wire); }
  scene.add(rb(4.4, 8.6, 3.2, c3Prop('#d8e4f0', { rough: 0.3 }), 11.2, 4.3, 12, 0.03)); scene.add(pl(3.6, 7, c3Flat('#ffffff', { map: sxTexVend(), glow: '#ffffff' }), 11.2, 4.6, 13.65));
  { const pt = new THREE.PointLight('#d0f0ff', 0.5, 18, 1.6); pt.position.set(11, 5, 17); scene.add(pt); }
  for (const z of [40, 110]) for (const sx of [-1, 1]) { scene.add(cyl(0.4, 0.45, 34, c3Prop('#8a8a90'), sx * 13.5, 17, z, 0.02, 10)); }
  for (const z of [40, 110]) { const w0 = cyl(0.04, 0.04, 70, c3Toon('#140e10'), 13.5, 32, z + 35, 0, 4); w0.rotation.x = Math.PI / 2; scene.add(w0); const w1 = w0.clone(); w1.position.x = -13.5; scene.add(w1); }
  for (const [x, z] of [[-12, 8], [-11.5, 22], [12.5, 32], [-12, 60]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.1, 0.8, 2, c3Prop('#c96a3f'), 0, 1, 0, 0.02, 14));
    const bush = c3Mesh(new THREE.SphereGeometry(1.8, 12, 10), c3Prop('#4f9a44', { rough: 0.8 }), 0.02); bush.position.y = 3.3; g.add(bush); }
  for (const [x, z, c] of [[-11, 34, '#e8322a'], [-11, 40, '#3f9adf']]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = 0.2; scene.add(g);
    for (const dz of [-1.7, 1.7]) { const wh = c3Mesh(new THREE.TorusGeometry(1.15, 0.12, 6, 20), c3Toon('#2a2a30'), 0.01); wh.position.set(0, 1.2, dz); wh.rotation.y = Math.PI / 2; g.add(wh); }
    const fr = cyl(0.12, 0.12, 3.6, c3Prop(c), 0, 2.2, 0, 0.01, 6); fr.rotation.x = Math.PI / 2; g.add(fr); g.add(cyl(0.1, 0.1, 1.6, c3Prop(c), 0, 2.2, -1.2, 0.01, 6)); }
  // people
  s.p = {}; for (const w of ['you', 'd7', 'd8', 'd5', 'wait', 'coffee', 'wait2', 'wait3', 'd1', 'd2']) s.p[w] = person(scene, w);
  if (ALT_BOOM) sxBoomBuild(s);
  c3Env(scene, { top: '#a890d0', mid: '#e89a7a', bot: '#3a2840' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const sxGet = () => SX.s ||= sxBuild();
const sxRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#c8709a', bgBlur: 1.0, glow: 0.5, glowBlur: 12 }, o));
function sxWalker(s, who, t, x0, z0, x1, z1, t0, dur, o = {}) { const p = s.p[who], k = clamp((t - t0) / dur); p.g.visible = true; p.g.position.set(lerp(x0, x1, k), FOOT, lerp(z0, z1, k));
  c3PersonPose(p, s.cam, t, { expr: o.expr || 'happy', gaze: o.gaze || [0, 0], hand: o.hand || { armL: [1.4, 1.2], armR: [-1.4, 1.2] }, ...(k > 0 && k < 1 ? walkFeet(t * 10 + x0) : STAND) }); }
// ---- s01: you walk up the alley and in through the noren (people shot first)
SHOT_FN['s01'] = (t, u, lt) => { const s = sxGet(); for (const k in s.p) s.p[k].g.visible = false; s.sign.material = s.signOff;
  c3SetCam(s.cam, camMove([[0, [4, 6.5, 84], [1, 10, 30], 50], [1.94, [3, 7.5, 66], [0, 10, 10], 50]], lt, 's01', { orbit: 0, creep: 0, rush: 0.05 }));
  sxWalker(s, 'you', t, 3, 46, -3.2, 6, 0, 1.94, { expr: 'happy' });
  sxWalker(s, 'd7', t, -8, 70, -6, 52, 0, 4, { expr: 'talking', gaze: [0.6, 0] }); sxWalker(s, 'd8', t, -5, 72, -3.5, 54, 0, 4, { expr: 'happy', gaze: [-0.6, 0] });
  sxRender(s); };
// ---- s12: the facade; the signboard lights up on "Restaurant" (kick on "Mistaken"), a couple walks in
SHOT_FN['s12'] = (t, u, lt) => { const s = sxGet(); for (const k in s.p) s.p[k].g.visible = false;
  s.sign.material = t >= 24.98 ? s.signOn : s.signOff;
  c3SetCam(s.cam, camMove([[0, [1, 9, 46], [0, 14, 0], 44], [3.5, [0, 12, 34], [0, 15.4, 0], 44]], lt, 's12', { orbit: 0, creep: 0, rush: 0.03 }));
  sxWalker(s, 'd7', t, -6, 24, -1.2, 6, 23.4, 3.2, { expr: 'happy', gaze: [0.5, 0] }); sxWalker(s, 'd5', t, 6, 28, 1.6, 7, 23.6, 3.0, { expr: 'talking', gaze: [-0.5, 0] });
  sxRender(s); };

// =====================================================================
//  ALT_BOOM — the alternate ending: the facade at dusk, calm; at 60.0 s the restaurant blows up (cartoon fireball,
//  smoke, the door planks, lanterns, the signboard, plates, gyoza, the burger and everybody fly out at the lens);
//  the film cuts dead at 61.0 s mid-blast. Built only when ALT_BOOM is on.
// =====================================================================
const SX_BOOM = 60.0;
function sxBoomBuild(s) {
  const B = s.boom = { fire: [], smoke: [], junk: [] }, R0 = RNG('boom');
  const fireM = ['#fff2a0', '#ffc21a', '#ff7a1a', '#e8322a'].map((c) => c3Flat(c, { glow: c }));
  for (let i = 0; i < 14; i++) { const m = c3Mesh(new THREE.SphereGeometry(1, 16, 12), fireM[i % 4], 0.02); m.userData.o = [R0.r(-6, 6), R0.r(4, 14), R0.r(-1, 5)]; m.userData.r = R0.r(2.5, 6.5); m.userData.d = R0.r(0, 0.12); m.visible = false; s.scene.add(m); B.fire.push(m); }
  const smokeM = ['#4a4048', '#6a5a60', '#2e2830'].map((c) => c3Prop(c, { rough: 1 }));
  for (let i = 0; i < 10; i++) { const m = c3Mesh(new THREE.SphereGeometry(1, 14, 10), smokeM[i % 3], 0.02); m.userData.o = [R0.r(-12, 12), R0.r(10, 24), R0.r(-4, 2)]; m.userData.r = R0.r(4, 8); m.userData.d = R0.r(0.08, 0.3); m.visible = false; s.scene.add(m); B.smoke.push(m); }
  const wood = c3Prop('#6a3a1e'), lantM = c3Prop('#ffffff', { map: rsTexLantern(), emissive: '#ff6a3a', ei: 0.7, glow: '#ff8a5a' });
  const mk = [() => rb(2.6, 7, 0.5, wood, 0, 0, 0), () => rb(2.6, 7, 0.5, wood, 0, 0, 0), () => rb(2.6, 7, 0.5, wood, 0, 0, 0), () => rb(4, 0.4, 1.2, wood, 0, 0, 0),
    () => { const l = c3Mesh(new THREE.SphereGeometry(1.4, 14, 10), lantM, 0.02); l.scale.y = 1.25; return l; }, () => { const l = c3Mesh(new THREE.SphereGeometry(1.4, 14, 10), lantM, 0.02); l.scale.y = 1.25; return l; },
    () => gyozaPlate(3), () => gyozaPlate(3), () => burgerPlate(), () => burgerMesh(1.2), () => cupMesh(), () => gyoza(), () => gyoza(), () => gyoza(), () => spoonMesh(),
    () => { const g = new THREE.Group(); g.add(rb(2.3, 0.3, 2.3, c3Prop('#3a6a8a'), 0, 0, 0)); g.add(rb(2.3, 2.6, 0.3, c3Prop('#3a6a8a'), 0, 1.3, -1.1)); return g; },
    () => pl(10.5, 4.5, new THREE.MeshBasicMaterial({ map: rsTexNoren(), transparent: true, side: THREE.DoubleSide }), 0, 0, 0)];
  mk.forEach((f, i) => { const m = f(); m.scale.multiplyScalar(i >= 6 && i <= 14 ? 2.2 : 1); m.userData.v = [R0.r(-16, 16), R0.r(8, 26), R0.r(14, 34)]; m.userData.w = [R0.r(-9, 9), R0.r(-9, 9), R0.r(-9, 9)]; m.userData.d = R0.r(0, 0.1); m.visible = false; s.scene.add(m); B.junk.push(m); });
  B.burst = spritePlane(s.scene, texBurst('BOOM!', '#ffe23a', '#ff5a1a'), 14, 14);
  B.flyers = [['wait', -9, 'screaming'], ['you', 7, 'shocked'], ['coffee', 13, 'screaming'], ['wait2', -14, 'shocked'], ['wait3', 2, 'screaming'], ['d1', -4, 'panic'], ['d2', 10, 'scared']];
}
const sxPop = (k) => k <= 0 ? 0 : k < 1 ? EZ.o3(k) : 1;
SHOT_FN['s26boom'] = (t, u, lt) => { const s = sxGet(), B = s.boom; for (const k in s.p) s.p[k].g.visible = false; s.sign.material = s.signOn;
  c3SetCam(s.cam, camMove([[0, [0, 10.4, 27.4], [0, 12.2, 0], 46], [3.2, [0, 10.8, 24.5], [0, 12.6, 0], 46]], lt, 's26', { orbit: 0, creep: 0, rush: 0 }));
  const b = t - SX_BOOM;
  // before: a calm evening, two passers-by stroll past the door
  if (b < 0.05) { sxWalker(s, 'd7', t, -10, 8, 4, 7, 58.0, 3.0, { expr: 'happy', gaze: [0.6, 0] }); sxWalker(s, 'd5', t, 9, 9, -2, 8, 58.2, 3.0, { expr: 'talking', gaze: [-0.6, 0] }); }
  B.fire.forEach((m) => { const k = sxPop((b - m.userData.d) / 0.28); m.visible = k > 0; if (!k) return; const [x, y, z] = m.userData.o; m.position.set(x * (0.4 + 0.6 * k), y, z + 4 * k); m.scale.setScalar(m.userData.r * k * (1 + 0.15 * Math.sin(t * 30 + x))); });
  B.smoke.forEach((m) => { const k = sxPop((b - m.userData.d) / 0.6); m.visible = k > 0; if (!k) return; const [x, y, z] = m.userData.o; m.position.set(x * k, y * (0.5 + 0.5 * k), z); m.scale.setScalar(m.userData.r * k); });
  B.junk.forEach((m) => { const d = b - m.userData.d; m.visible = d > 0; if (!m.visible) return; const [vx, vy, vz] = m.userData.v, [wx, wy, wz] = m.userData.w;
    m.position.set(vx * d, 8 + vy * d - 14 * d * d, 3 + vz * d); m.rotation.set(wx * d, wy * d, wz * d); });
  if (b >= 0) { s.sign.position.set(-4 * b, 17.2 + 16 * b, 0.6 + 22 * b); s.sign.rotation.set(-3 * b, 0.6 * b, 2.4 * b); } else { s.sign.position.set(0, 17.2, 0.6); s.sign.rotation.set(0, 0, 0); }
  B.flyers.forEach(([w, vx, ex], i) => { const p = s.p[w], d = b - 0.04 - i * 0.05; if (d <= 0) return; p.g.visible = true;
    p.g.position.set(vx * d * 1.4, FOOT + 3 + 20 * d - 12 * d * d, 3 + 26 * d); c3PersonPose(p, s.cam, t, { expr: ex, hand: { armL: [2.4, 4.6], armR: [-2.4, 4.6] }, foot: { legL: [1.4, -2.0], legR: [-1.4, -2.2] } }); p.g.rotation.z = (i % 2 ? 1 : -1) * d * 7; });
  { const k = b < 0 ? 0 : EZ.back(clamp(b / 0.15)) * (1 - clamp((b - 0.3) / 0.15)); B.burst.visible = k > 0.01; if (B.burst.visible) { B.burst.position.set(-3, 18, 6); facing(B.burst, s.cam); B.burst.scale.setScalar(0.6 * k); } }
  sxRender(s);
  for (const k in s.p) s.p[k].g.rotation.z = 0; s.sign.position.set(0, 17.2, 0.6); s.sign.rotation.set(0, 0, 0); };

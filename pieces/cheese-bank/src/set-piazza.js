// =====================================================================
//  SET piazza — an Italian town square by day: cobbles, ochre/terracotta/pink houses with green shutters, a fountain,
//  café parasols, a red scooter, and closing the square the bank: a classical cream facade (columns, pediment, steps),
//  the signboard CREDITO EMILIANO (lights up on its name) and a brass plaque SINCE 1953. Your rounded cartoon truck,
//  loaded with wheels, drives in (s12). Registers SHOT_FN s12, s15. Prefix pz. Facade front z = 0, the square to +z.
// =====================================================================
const PZ = {};
function pzTexFacade() { return tex((g, w, h) => { g.fillStyle = '#f0dcb0'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 48) { g.fillStyle = 'rgba(150,110,60,0.25)'; g.fillRect(0, y, w, 3); }
  for (const x of [120, 360, 664, 904]) { g.fillStyle = '#3f6f9a'; g.fillRect(x - 60, 380, 120, 260); g.strokeStyle = '#140e10'; g.lineWidth = 8; g.strokeRect(x - 60, 380, 120, 260); g.fillStyle = '#f6ecd2'; g.fillRect(x - 4, 380, 8, 260); g.fillRect(x - 60, 500, 120, 8);
    g.fillStyle = '#2f6a52'; g.fillRect(x - 96, 380, 32, 260); g.fillRect(x + 64, 380, 32, 260); }
  g.fillStyle = '#5a3424'; g.beginPath(); g.roundRect(432, 520, 160, 504, [80, 80, 0, 0]); g.fill(); g.lineWidth = 8; g.stroke(); }, 1024, 1024); }
function pzTexSign(on) { return tex((g, w, h) => { g.fillStyle = on ? '#2f6a52' : '#244a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a040'; g.lineWidth = 16; g.strokeRect(12, 12, w - 24, h - 24);
  inked(g, 'CREDITO EMILIANO', w / 2, h / 2 + 4, h * 0.46, on ? '#ffe9a0' : '#c8b88a', { stroke: false, maxW: w * 0.88 }); }, 1024, 200); }
function pzTexPlaque(on) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, on ? '#ffe08a' : '#c9a040'); gr.addColorStop(1, '#a87a20'); g.fillStyle = gr; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 24); g.fill(); g.lineWidth = 10; g.strokeStyle = '#3a2410'; g.stroke();
  inked(g, 'SINCE', w / 2, h * 0.34, h * 0.2, '#3a2410', { stroke: false }); inked(g, '1953', w / 2, h * 0.68, h * 0.36, '#3a2410', { stroke: false }); }, 400, 300); }
function pzTruck() { const g = new THREE.Group(), red = c3Prop('#e8322a', { rough: 0.4 }), dk = c3Prop('#2a2a30');
  const cab = c3Mesh(new THREE.SphereGeometry(3.2, 24, 16), red, 0.03); cab.scale.set(0.98, 0.78, 0.78); cab.position.set(0, 4.0, 5.2); g.add(cab);   // a round bubble cab (review: no boxy cars)
  { const hood = c3Mesh(new THREE.SphereGeometry(2.6, 20, 12), red, 0.03); hood.scale.set(1.05, 0.55, 0.7); hood.position.set(0, 2.6, 7.2); g.add(hood); }   // rounded cartoon cab (review: no boxy cars)
  const win = c3Mesh(c3RBox(5.2, 2.2, 0.3, 0.4), c3Prop('#bfe4ff', { rough: 0.1, env: 1.4 }), 0.02); win.position.set(0, 5.4, 7.75); win.rotation.x = -0.35; g.add(win);
  { const bed = c3Mesh(c3RBox(6.6, 1.4, 10.4, 0.6), c3Prop('#f0dcb0'), 0.03); bed.position.set(0, 2.1, -2.4); g.add(bed); } for (const sx of [-1, 1]) { const sd = c3Mesh(c3RBox(0.5, 2.0, 10.4, 0.24), red, 0.02); sd.position.set(sx * 3.1, 3.3, -2.4); g.add(sd);
    for (const z of [5.6, -5]) { const fd = c3Mesh(new THREE.SphereGeometry(1.7, 16, 8, 0, TAU, 0, Math.PI / 2), red, 0.02); fd.scale.set(0.45, 0.8, 1); fd.position.set(sx * 2.9, 1.3, z); g.add(fd); } }
  for (const [x, z] of [[-2.9, 5.6], [2.9, 5.6], [-2.9, -5], [2.9, -5]]) { const w = c3Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.0, 20), dk, 0.03); w.rotation.z = Math.PI / 2; w.position.set(x, 1.25, z); g.add(w); }
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const m = wheelMesh(0.85); m.position.set(-1.5 + j * 3, 2.9 + r * 1.0, -6 + i * 2.8); g.add(m); }
  for (const sx of [-1, 1]) { const hl = c3Mesh(new THREE.SphereGeometry(0.45, 10, 8), c3Prop('#fff6c0', { emissive: '#fff0a0', ei: 0.8 }), 0.01); hl.position.set(sx * 2.2, 2.4, 8.1); g.add(hl); }
  return g; }

function pzBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.5, 4000), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.55, sky: '#cfe8ff', ground: '#6a5a4a', key: '#fff2d8', keyI: 1.1, keyP: [160, 220, 200], rim: '#ffd8a0', rimI: 0.4, rimP: [-200, 120, -200] });
  { const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 23, band: [0.38, 0.5], clouds: 30, scale: 1.1, midAt: 0.42, pal: { mid: '#6aaaf0' } }) })); sky.material.side = THREE.BackSide; sky.material.fog = false; scene.add(sky); }
  c3Fog(scene, 'day', 300, 1600);
  scene.add(pl(400, 400, c3Prop('#ffffff', { map: c3TexWall('paving', '#c8a078', { rep: [30, 30] }), rough: 0.8 }), 0, 0.02, 120, 0, -Math.PI / 2));
  // the bank facade: block, painted front, columns, pediment, steps, sign, plaque
  const cream = c3Prop('#f0dcb0', { rough: 0.7 });
  scene.add(rb(44, 34, 30, cream, 0, 17, -15, 0.05)); scene.add(pl(44, 34, c3Prop('#ffffff', { map: pzTexFacade(), rough: 0.8 }), 0, 17, 0.12));
  for (const x of [-15, -7, 7, 15]) { scene.add(cyl(1.3, 1.3, 22, cream, x, 13, 3, 0.03, 18)); scene.add(rb(3.4, 1.2, 3.4, cream, x, 24.6, 3, 0.02)); }
  { const sh = new THREE.Shape(); sh.moveTo(-23, 0); sh.lineTo(23, 0); sh.lineTo(0, 7); sh.lineTo(-23, 0); const pd = c3Mesh(new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }), cream, 0.04); pd.position.set(0, 34, 1.6); scene.add(pd); }
  scene.add(rb(46, 1.4, 6, cream, 0, 34, 2.6, 0.03));
  for (let i = 0; i < 3; i++) scene.add(rb(30 - i * 2, 0.8, 4 - i, c3Prop('#e6dccd'), 0, 0.4 + i * 0.8, 6 - i * 1.0, 0.02));
  s.signOff = c3Flat('#ffffff', { map: pzTexSign(false) }); s.signOn = c3Flat('#ffffff', { map: pzTexSign(true), glow: '#fff0b0' });
  s.sign = pl(26, 5.08, s.signOff, 0, 28.6, 4.4); scene.add(s.sign);
  s.plqOff = c3Flat('#ffffff', { map: pzTexPlaque(false) }); s.plqOn = c3Flat('#ffffff', { map: pzTexPlaque(true) }); for (const m of [s.plqOff, s.plqOn]) { m.transparent = true; m.alphaTest = 0.5; }   // (review: dark quad corners)
  s.plaque = pl(4, 3, s.plqOff, 11, 8, 0.4); scene.add(s.plaque);
  // the square: houses on both sides + behind the camera, fountain, parasols, scooter
  const COLS = ['#e0a040', '#c8643a', '#e88aa0', '#f0c860', '#d8744a', '#e8b878'];
  for (const sx of [-1, 1]) { let z = 4; for (let i = 0; i < 6; i++) { const w = 5;
    const b = c3Building({ w, h: [5.6, 6.2, 5.2][i % 3], d: 4, floors: 3, cols: 2, wall: 'plaster', color: COLS[(i + (sx > 0 ? 2 : 0)) % 6], trim: '#fff6e0', roof: 'gable', roofH: 1.2, roofColor: '#b8542e', shutters: '#2f8a5a', door: '#5a3424', planters: i % 2 === 0, seed: i + (sx > 0 ? 30 : 0) });
    b.scale.setScalar(5); b.position.set(sx * 38, 0, z + 12.5); b.rotation.y = -sx * Math.PI / 2; scene.add(b); z += 26; } }
  { const g = new THREE.Group(); g.position.set(-10, 0, 46); scene.add(g); g.add(cyl(6, 6.4, 1.6, cream, 0, 0.8, 0, 0.03, 28)); g.add(cyl(5.2, 5.2, 0.2, c3Prop('#5ea8e0', { rough: 0.1, env: 1.3 }), 0, 1.5, 0, 0, 28)); g.add(cyl(0.8, 1.0, 5, cream, 0, 3.5, 0, 0.02, 12)); g.add(cyl(2.2, 1.4, 0.8, cream, 0, 6.2, 0, 0.02, 18)); }
  for (const [x, z, c] of [[22, 30, '#c8323a'], [27, 40, '#2f8a5a']]) { scene.add(cyl(0.15, 0.15, 7, c3Prop('#8a8a90'), x, 3.5, z, 0.01, 6)); const p = c3Mesh(new THREE.ConeGeometry(4.2, 1.6, 12), c3Prop(c), 0.02); p.position.set(x, 7.4, z); scene.add(p);
    scene.add(cyl(1.6, 1.6, 0.25, c3Prop('#fff6e0'), x, 3.6, z, 0.01, 16)); scene.add(cyl(0.12, 0.12, 3.6, c3Prop('#8a8a90'), x, 1.8, z, 0, 6)); }
  { const g = new THREE.Group(); g.position.set(-22, 0, 22); g.rotation.y = 0.5; scene.add(g); const red = c3Prop('#e8322a'); g.add(rb(1.4, 1.6, 5, red, 0, 1.8, 0, 0.02));
    for (const z of [-2, 2]) { const w = c3Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 16), c3Prop('#2a2a30'), 0.02); w.rotation.z = Math.PI / 2; w.position.set(0, 0.9, z); g.add(w); } g.add(rb(1.6, 0.4, 2.2, c3Prop('#5a3424'), 0, 2.8, -0.8, 0.01)); }
  s.truck = pzTruck(); scene.add(s.truck); c3Layer(s.truck, C3.L_FOCUS);
  s.p = {}; for (const w of ['you', 'p1', 'p2', 'c3']) s.p[w] = person(scene, w);
  c3Env(scene, { top: '#cfe8ff', mid: '#e0b080', bot: '#5a4a3a' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const pzGet = () => PZ.s ||= pzBuild();
const pzRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#6aaaf0', bgBlur: 1.0, glow: 0.45, glowBlur: 12 }, o));
function pzWalker(s, who, t, x0, z0, x1, z1, t0, dur, o = {}) { const p = s.p[who], k = clamp((t - t0) / dur); p.g.visible = true; p.g.position.set(lerp(x0, x1, k), FOOT, lerp(z0, z1, k));
  c3PersonPose(p, s.cam, t, { expr: o.expr || 'happy', gaze: o.gaze || [0, 0], hand: o.hand || { armL: [1.4, 1.2], armR: [-1.4, 1.2] }, ...(k > 0 && k < 1 ? walkFeet(t * 10 + x0) : STAND) }); }
// ---- s12: you drive the truck (loaded with wheels) across the square to the bank
SHOT_FN['s12'] = (t, u, lt) => { const s = pzGet(); for (const k in s.p) s.p[k].g.visible = false; s.sign.material = s.signOff; s.plaque.material = s.plqOff;
  c3SetCam(s.cam, camMove([[0, [18, 9, 100], [4, 7, 40], 46], [9, [18, 9, 100], [4, 7, 40], 46]], lt, 's12', { orbit: 0, creep: 0, rush: 0 }));
  const k = EZ.io(clamp((t - 23.2) / 1.9)); s.truck.position.set(lerp(12, 4, k), 0, lerp(80, 22, k)); s.truck.rotation.y = Math.PI + 0.1 * (1 - k);
  pzWalker(s, 'p1', t, -16, 34, -8, 30, 22.8, 2.4, { expr: 'surprised', gaze: [0.6, 0] }); pzWalker(s, 'p2', t, 20, 50, 16, 46, 22.8, 2.4, { expr: 'happy', gaze: [-0.6, 0] }); pzRender(s); };
// ---- s15: the facade: the signboard lights up on "Credito", the plaque on "since"
SHOT_FN['s15'] = (t, u, lt) => { const s = pzGet(); for (const k in s.p) s.p[k].g.visible = false; s.truck.position.set(4, 0, 22); s.truck.rotation.y = Math.PI;
  s.sign.material = t >= 35.05 ? s.signOn : s.signOff; s.plaque.material = t >= 37.19 ? s.plqOn : s.plqOff;
  c3SetCam(s.cam, camMove([[0, [2, 14, 70], [0, 18, 0], 46], [9, [2, 14, 70], [0, 18, 0], 46]], lt, 's15', { orbit: 0, creep: 0, rush: 0 }));
  pzWalker(s, 'p1', t, -10, 20, -4, 12, 33.6, 3, { expr: 'happy', gaze: [0.4, 0] }); pzWalker(s, 'p2', t, 12, 26, 8, 14, 33.8, 3, { expr: 'talking', gaze: [-0.4, 0] }); pzRender(s); };   // the same passers-by as s12 (review: continuity)

// =====================================================================
//  SET date — s31 "So the roses you buy for a date": a cosy café at dusk (warm lamps, a window with the evening
//  street, a candle on a little round table); the guy in the yellow raincoat holds out a bouquet of red roses, his
//  date in the yellow sundress lights up (heart eyes). Registers SHOT_FN['s31']. Prefix dat.
// =====================================================================
const DAT = {};
function datTexView() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a3a8a'); g.addColorStop(0.6, '#c86aa8'); g.addColorStop(1, '#ffa860'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('datview'); for (let i = 0; i < 9; i++) { const bw = R.r(50, 90), bh = R.r(h * 0.25, h * 0.6), bx = i * w / 8 - 20; x.fillStyle = ['#3a2a5a', '#4a2a4a', '#2a2a5a'][i % 3]; x.fillRect(bx, h - bh, bw, bh);
    for (let j = 0; j < 8; j++) for (let k = 0; k < 2; k++) if (R.f() < 0.6) { x.fillStyle = '#ffd890'; x.fillRect(bx + 8 + k * bw / 2, h - bh + 12 + j * 22, bw / 2 - 16, 10); } } }, 512, 512); }
function datBouquet() { const g = new THREE.Group();
  const cone = c3Mesh(new THREE.ConeGeometry(0.9, 2.6, 16, 1, true), (() => { const m = c3Prop('#ffe8f0', { rough: 0.7 }); m.side = THREE.DoubleSide; return m; })(), 0.03); cone.rotation.x = Math.PI; cone.position.y = 1.1; g.add(cone);
  const b = roseBunch(9, 0.7, 41, { h: 2.3, r: 0.3 }); b.position.y = 0; g.add(b);
  return g; }
function datBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 400), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.65, sky: '#ffe0c0', ground: '#4a2a2a', key: '#ffe0b0', keyI: 1.0, keyP: [8, 20, 16], rim: '#ff9ac0', rimI: 0.6, rimP: [-10, 12, -10] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), c3Prop('#ffffff', { map: c3TexWall('wood', '#a8602a', { rep: [6, 4] }), rough: 0.5, env: 0.7 })); fl.rotation.x = -Math.PI / 2; fl.position.z = 4; scene.add(fl);
  scene.add(pl(60, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#3ab89a', { rep: [4, 2] }), rough: 0.85 }), 0, 15, -10));
  scene.add(rb(18, 11, 0.4, c3Prop('#fbf0dc'), 2, 13, -9.8, 0.03)); scene.add(pl(17, 10, c3Flat('#ffffff', { map: datTexView() }), 2, 13, -9.5));
  scene.add(rb(0.3, 10, 0.2, c3Prop('#fbf0dc'), 2, 13, -9.4, 0.01)); scene.add(rb(17, 0.3, 0.2, c3Prop('#fbf0dc'), 2, 13, -9.4, 0.01));
  scene.add(rb(60, 4, 0.3, c3Prop('#ffffff', { map: c3TexWall('wood', '#7a3a1a') }), 0, 2, -9.7, 0.02));
  // string lights over the window, two pendant lamps
  for (let i = 0; i < 12; i++) { const b = c3Mesh(new THREE.SphereGeometry(0.25, 8, 6), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.01); b.position.set(-8 + i * 1.8, 19 - Math.sin(i / 11 * Math.PI) * 1.2, -9.2); scene.add(b); }
  for (const x of [-6, 6]) { scene.add(cyl(0.05, 0.05, 8, c3Toon('#2a2a2a'), x, 26, -1, 0.005, 4)); const sh = c3Mesh(new THREE.ConeGeometry(1.4, 1.4, 16, 1, true), (() => { const m = c3Prop('#ffcc3a', { emissive: '#ffb030', ei: 0.4 }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.set(x, 21.6, -1); scene.add(sh);
    const lp = new THREE.PointLight('#ffc880', 0.9, 30, 1.4); lp.position.set(x, 20, -1); scene.add(lp); }
  // round table, candle, chairs
  s.table = new THREE.Group(); scene.add(s.table); c3Layer(s.table, C3.L_FOCUS);
  s.table.add(cyl(3.2, 3.2, 0.3, c3Prop('#ffffff', { rough: 0.5 }), 0, 4.6, 1, 0.03, 32)); s.table.add(cyl(0.3, 0.4, 4.5, c3Toon('#3a2a2a'), 0, 2.25, 1, 0.02, 10));
  s.table.add(cyl(0.25, 0.25, 0.9, c3Prop('#fff6e0'), 0.8, 5.2, 1.6, 0.01, 10)); const fl2 = c3Mesh(new THREE.SphereGeometry(0.16, 8, 6), c3Flat('#ffcc3a', { glow: '#ffb030' }), 0); fl2.scale.y = 1.8; fl2.position.set(0.8, 5.9, 1.6); s.table.add(fl2);
  const cl = new THREE.PointLight('#ffb060', 0.6, 14, 1.6); cl.position.set(0.8, 6.4, 2); scene.add(cl);
  s.him = person(scene, 'dateM'); s.him.g.position.set(-4.6, 2.7, 1.2); s.her = person(scene, 'dateF'); s.her.g.position.set(4.6, 2.7, 1.2);
  for (const x of [-4.6, 4.6]) { const c = rb(3, 0.4, 2.6, c3Prop('#e8483a'), x, 2.5, 1.6, 0.02); scene.add(c); c3Layer(c, C3.L_FOCUS); const bk = rb(3, 4.4, 0.4, c3Prop('#e8483a'), x, 4.6, 0.0, 0.02); scene.add(bk); c3Layer(bk, C3.L_FOCUS); }
  s.bq = datBouquet(); s.him.root.add(s.bq); c3Layer(s.bq, C3.L_FOCUS);
  s.hearts = [0, 1, 2].map(() => spritePlane(scene, tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ff3a6a'; x.strokeStyle = '#2a1208'; x.lineWidth = 10; x.beginPath(); x.moveTo(w / 2, h * 0.85);
    x.bezierCurveTo(w * 0.05, h * 0.5, w * 0.2, h * 0.08, w / 2, h * 0.32); x.bezierCurveTo(w * 0.8, h * 0.08, w * 0.95, h * 0.5, w / 2, h * 0.85); x.fill(); x.stroke(); }, 256, 256), 1.6, 1.6));
  c3Env(scene, { top: '#ffe0c0', mid: '#c87a5a', bot: '#3a1a1a' });
  c3ShadeScene(scene, { dark: 0.22 });
  return s;
}
const datGet = () => DAT.s ||= datBuild();
const DAT_K31 = [[0, [6, 12, 22], [0, 8, 1], 44], [1.66, [3, 11, 19], [0, 8.4, 1], 44]];
SHOT_FN['s31'] = (t, u, lt) => {
  const s = datGet(); c3SetCam(s.cam, camMove(DAT_K31, lt, 's31', { orbit: -0.02 }));
  const out = EZ.o3(clamp((lt - 0.2) / 0.5)), td = wAfter('date', 57, 57.14);
  c3PersonPose(s.him, s.cam, t, { expr: 'shy', gaze: [0.9, 0.1], hand: { armL: [lerp(1.4, 3.4, out), lerp(1.4, 2.6, out)], armR: [-1.4, 1.0] }, ...sitFeet(2.7) });
  c3PersonPose(s.her, s.cam, t, { expr: c3FaceAt([[0, 'surprised'], [td - 0.3, 'love']], t, 'dateF'), gaze: [-0.9, 0.1], hand: { armL: [1.2, 2.4], armR: [-1.2, 2.4] }, x: t > td - 0.3 ? ['blush'] : [], ...sitFeet(2.7) });
  const f = fistLocal(s.him, 'armL'); s.bq.position.set(f.x + 0.12, f.y + 0.1, f.z - 0.06); s.bq.rotation.z = -0.5;   // the cone's tip sits inside the fist (fist drawn in front)
  s.hearts.forEach((m, i) => { const t0 = td - 0.2 + i * 0.15, k = pop(t, t0, 0.25); m.visible = k > 0.01; if (!m.visible) return; m.position.copy(s.her.g.position).add(V3(-1 + i * 1.2, 10 + (t - t0) * 1.6, 0.6)); facing(m, s.cam); m.scale.setScalar(k); });
  c3Render(s.scene, s.cam, { bg: '#3ab89a', bgBlur: 1.6, glow: 0.5, glowBlur: 12 });
};

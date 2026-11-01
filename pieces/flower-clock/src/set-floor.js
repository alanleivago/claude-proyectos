// =====================================================================
//  SET floor — the distribution floor behind the auction: a vast hall where trains of rose trolleys, pulled by little
//  electric tugs, criss-cross on painted lanes. s27: CLICK, and a whole train of trolleys lurches off behind the
//  cargo worker's tug. s28: high wide shot, trains everywhere, a big LED board MILLIONS OF FLOWERS · EVERY DAY.
//  Registers SHOT_FN[id]. Prefix flr.
// =====================================================================
const FLR = {};
function flrDrawBoard(x, w, h, n) { x.fillStyle = '#10141e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffd23a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  inked(x, 'FLOWERS SOLD TODAY', w / 2, h * 0.22, h * 0.13, '#ffd23a', { stroke: false, maxW: w * 0.86 });
  inked(x, n.toLocaleString('en-US'), w / 2, h * 0.55, h * 0.3, '#3aff8a', { stroke: false, font: 'Arial', maxW: w * 0.86 });
  inked(x, 'AND EVERY DAY', w / 2, h * 0.85, h * 0.12, '#ffffff', { stroke: false, maxW: w * 0.86 }); }
function flrTug(seed) { const g = new THREE.Group(), o = c3Prop('#ff8a1a', { rough: 0.5 }); g.add(rb(3.6, 2.2, 4.6, o, 0, 1.6, 0, 0.04));
  for (const sx of [-1, 1]) g.add(rb(0.35, 2.8, 4.6, o, sx * 1.65, 4.1, 0, 0.03));   // the tub's side walls hide the driver's legs
  g.add(rb(3.6, 2.8, 0.4, o, 0, 4.1, 2.1, 0.03)); g.add(rb(3.2, 3.6, 0.5, c3Prop('#2a2a30'), 0, 4.5, -1.6, 0.03));   // cowl in front, seat back behind
  { const wh = cyl(0.7, 0.7, 0.15, c3Toon('#2a2a30'), 0, 5.8, 1.5, 0.01, 16); wh.rotation.x = 1.1; g.add(wh); }
  for (const [x, z] of [[-1.6, -1.4], [1.6, -1.4], [-1.6, 1.4], [1.6, 1.4]]) { const wh = cyl(0.55, 0.55, 0.4, c3Toon('#1a1a1e'), x, 0.55, z, 0.01, 12); wh.rotation.z = Math.PI / 2; g.add(wh); } return g; }
// a far trolley: steel frame + three shelves of roses as one painted block each (few edges: the ink stays clean)
function flrTexRoses() { return tex((x, w, h) => { x.fillStyle = '#4a9a3a'; x.fillRect(0, 0, w, h); const R = RNG('frose');
  for (let i = 0; i < 90; i++) { x.fillStyle = R.f() < 0.8 ? '#ff2a3a' : '#ff8aa8'; x.beginPath(); x.arc(R.r(0, w), R.r(0, h * 0.75), R.r(10, 16), 0, TAU); x.fill(); } }, 256, 128); }
function flrCartLite(M) { const g = new THREE.Group(), W0 = 5.4, D0 = 2.6;
  for (const [x, z] of [[-W0 / 2, -D0 / 2], [W0 / 2, -D0 / 2], [-W0 / 2, D0 / 2], [W0 / 2, D0 / 2]]) g.add(cyl(0.08, 0.08, 6.6, M.st, x, 3.6, z, 0, 5));
  for (let k = 0; k < 3; k++) { const y = 0.6 + k * 2.2; g.add(rb(W0 + 0.2, 0.12, D0 + 0.2, M.st, 0, y, 0, 0)); g.add(rb(W0 - 0.2, 1.3, D0 - 0.3, M.ro, 0, y + 0.72, 0, 0.02)); }
  return g; }
function flrBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48, W / H, 0.5, 1500), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffffff', ambI: 0.75, sky: '#fff6e0', ground: '#5a5a5a', key: '#fff4e0', keyI: 1.0, keyP: [60, 120, 60], rim: '#a8d0ff', rimI: 0.4, rimP: [-60, 80, -60] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), c3Prop('#3f6f94', { rough: 0.45, env: 0.7 })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  // painted lanes (yellow) in a grid
  for (let i = -4; i <= 4; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(400, 1.2), c3Flat('#f2d878')); a.rotation.x = -Math.PI / 2; a.position.set(0, 0.05, i * 24); scene.add(a);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 400), c3Flat('#f2d878')); b.rotation.x = -Math.PI / 2; b.position.set(i * 36, 0.05, 0); scene.add(b); }
  // walls (blue), skylights (ceiling strips), the LED board
  scene.add(pl(400, 60, c3Prop('#2a7ae8', { rough: 0.8 }), 0, 30, -110)); scene.add(rb(400, 3, 0.6, c3Prop('#ffcc1a'), 0, 1.5, -109.6, 0.02));
  for (let i = 0; i < 12; i++) scene.add(pl(14, 6, c3Flat('#cfe8ff', { glow: '#cfe8ff' }), -165 + i * 30, 48, -109.5));   // a yellow kick rail and a row of high windows
  s.board = canvasTex(1024, 512); s.boardM = pl(48, 24, c3Flat('#ffffff', { map: s.board.t }), -30, 30, -109); scene.add(s.boardM);
  // stacks of empty buckets and pallets along the wall, warm lamps hanging over the lanes, three workers walking
  for (let i = 0; i < 14; i++) { const R = RNG('stack', i), st = new THREE.Group(); st.position.set(-90 + i * 14, 0, -100 + R.r(0, 6)); scene.add(st);
    st.add(rb(8, 1.2, 6, c3Prop('#c8904a'), 0, 0.6, 0, 0.02)); for (let k = 0; k < 4; k++) st.add(cyl(1.0, 0.8, 1.4, c3Prop(['#2a2a30', '#3a8ee8', '#ffcc1a'][i % 3]), -2 + (k % 2) * 4, 1.9 + Math.floor(k / 2) * 1.5, 0, 0.02, 12)); }
  for (let i = 0; i < 6; i++) { const lp = c3Mesh(new THREE.ConeGeometry(2.4, 2, 16, 1, true), c3Prop('#ffcc3a', { emissive: '#ffb030', ei: 0.4 }), 0.02); lp.material.side = THREE.DoubleSide; lp.position.set(-50 + i * 20, 40, -30 + (i % 2) * 20); scene.add(lp); scene.add(cyl(0.08, 0.08, 18, c3Toon('#2a2a30'), lp.position.x, 50, lp.position.z, 0, 4)); }   // hung on cables
  s.walkers = [0, 1, 2].map((i) => { const p = person(scene, 'cargo', { key: 'walk' + i }); return p; });
  // the trains: each a tug + 6 trolleys, on a lane; s.trains[i] = { g, axis, lane, v, x0 }
  s.trains = [];
  for (let i = 0; i < 9; i++) { const R = RNG('train', i), g = new THREE.Group(); scene.add(g); c3Layer(g, C3.L_FOCUS);
    const tug = flrTug(i); tug.position.z = 4; g.add(tug);
    const M = { st: c3Prop('#b8c0cc', { metal: 0.6, rough: 0.3 }), ro: c3Prop('#ffffff', { map: flrTexRoses(), rough: 0.7 }) };
    for (let k = 0; k < 6; k++) { const c = i === 0 ? roseCart(60 + k, { shelves: 3 }) : flrCartLite(M); c.rotation.y = Math.PI / 2; c.position.z = -2 - k * 6.2; g.add(c); }
    c3Layer(g, C3.L_FOCUS);   // after the children exist: tug walls and driver share one layer
    const ax = i % 2; s.trains.push({ g, ax, lane: [0, -60, -40, -30, -70, 50, 40, 80, 70][i], v: R.r(6, 10) * (R.f() < 0.5 ? 1 : -1), x0: R.r(-100, 100) }); }   // no lane near the s27 camera
  // the hero train (s27): on lane z = 0 along x, the cargo worker riding the tug
  s.hero = s.trains[0]; s.hero.ax = 0; s.hero.lane = 0; s.hero.x0 = 0; s.hero.v = 0;
  s.cargo = person(scene, 'cargo'); s.hero.g.add(s.cargo.g); s.cargo.g.position.set(0, 2.7 + 2.7, 3.6);   // seated in the tug: feet on its floor (y 2.7)
  s.click = spritePlane(scene, texBurst('CLICK'), 6, 6);
  c3Env(scene, { top: '#fff6e0', mid: '#c8d0dc', bot: '#4a4a50' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const flrGet = () => FLR.s ||= flrBuild();
// trains move along their lanes; the hero train's position comes from the shot
function flrWorld(s, t, heroX) {
  s.trains.forEach((tr, i) => { const d = tr === s.hero ? heroX : ((tr.x0 + tr.v * t + 100) % 200 + 200) % 200 - 100;
    if (tr.ax === 0) { tr.g.position.set(d, 0, tr.lane); tr.g.rotation.y = tr.v < 0 ? -Math.PI / 2 : Math.PI / 2; }
    else { tr.g.position.set(tr.lane, 0, d); tr.g.rotation.y = tr.v < 0 ? Math.PI : 0; } });
  s.hero.g.rotation.y = -Math.PI / 2;
  s.walkers.forEach((p, i) => { p.g.position.set(-40 + i * 30 + ((t * 3 + i * 7) % 20), FOOT, -55 - i * 8); p.walkT = t * 8 + i; });   // the hero train heads to -x, its trolleys trail into the frame
  const n = Math.floor(clamp((t - 46.68) / 4.4) * 4271938 + 8000000); const nn = Math.floor(n / 9973) * 9973; redraw(s.board, String(nn), (x, w, h) => flrDrawBoard(x, w, h, nn));
  s.click.visible = false;
}
// =====================================================================
//  s27 — "And because one click sells a whole batch,": low beside the hero train: CLICK burst over the tug, the
//  cargo worker grins and the whole train of trolleys lurches off past the camera
// =====================================================================
const flrHeroX = (t) => { const tc = wAfter('click', 47.2, 47.38), go = Math.max(0, t - tc); return 2 - 7 * Math.min(go, 1.3) ** 2 - Math.max(0, go - 1.3) * 18.2; };
const FLR_K27 = [[0, [-2, 7, 24], [4, 3.5, 0], 48], [2.0, [-8, 7.5, 26], [-2, 3.5, 0], 48]];
SHOT_FN['s27'] = (t, u, lt) => {
  const s = flrGet(); const tc = wAfter('click', 47.2, 47.38), go = Math.max(0, t - tc);
  flrWorld(s, t, flrHeroX(t));   // close shot: only the hero train
  c3SetCam(s.cam, camMove(FLR_K27, lt, 's27', { orbit: 0.01 }));
  c3PersonPose(s.cargo, s.cam, t, { expr: t > tc ? 'grin' : 'smile', gaze: [0.4, 0.2], hand: { armL: [1.2, 1.9], armR: [-1.2, 1.9] }, lean: t > tc ? -0.1 * Math.exp(-go * 3) : 0, ...sitFeet(2.7) });
  const bk = pop(t, tc - 0.05, 0.16) * (1 - clamp((t - tc - 0.7) / 0.2)); s.click.visible = bk > 0.01; if (s.click.visible) { s.click.position.copy(s.hero.g.position).add(V3(-2.5, 4, 5)); facing(s.click, s.cam); s.click.scale.setScalar(bk); }
  s.walkers.forEach((p) => c3PersonPose(p, s.cam, t, { expr: 'happy', gaze: [0.6, 0], ...walkFeet(p.walkT) }));
  c3Render(s.scene, s.cam, { bg: '#2a7ae8', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s28 — "they can sell millions of flowers every single day,": high wide over the floor, trains everywhere, the LED
//  board's count racing up
// =====================================================================
const FLR_K28 = [[0, [-10, 26, 44], [-26, 8, -16], 56], [2.4, [-18, 30, 46], [-30, 10, -24], 56]];
SHOT_FN['s28'] = (t, u, lt) => {
  const s = flrGet(); flrWorld(s, t, flrHeroX(t)); c3SetCam(s.cam, camMove(FLR_K28, lt, 's28', { orbit: 0.01, creep: 0.03 }));
  c3PersonPose(s.cargo, s.cam, t, { expr: 'happy', gaze: [0, 0], ...sitFeet(2.7) });
  s.walkers.forEach((p) => c3PersonPose(p, s.cam, t, { expr: 'happy', gaze: [0.6, 0], ...walkFeet(p.walkT) }));
  c3Render(s.scene, s.cam, { bg: '#2a7ae8', bgBlur: 0.8, glow: 0.4, glowBlur: 12 });
};

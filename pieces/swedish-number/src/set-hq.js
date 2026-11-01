// =====================================================================
//  SET hq — the Swedish tourism group's office: s17 (the campaign poster: THE SWEDISH NUMBER), s18 (the exec switches
//  it ON), s19 (a 250 YEARS cake, confetti), s20 (the 1766 press-freedom decree — Flow photo — black CENSORED bars tear
//  away), s21 (the planned TV ad storyboard and script: he crumples the script), s22 (the app downloads on a phone —
//  Flow screen), s24/s25 (CONTINUOUS: the training manual, then the rule book go into the bin), s26 (the risky part:
//  he sweats as the phone rings). Registers SHOT_FN[id]. Prefix hqx.
//  World: floor y 0 (blue-grey carpet), back wall z -14 (royal blue, yellow trim) with the poster (x -12), the big ON
//  switch (x -3.5), the storyboard board (x 22); a window wall on the left (x -26) onto a sunny Stockholm waterfront;
//  the meeting table (x 6, top y 4.6, z 0, 14 x 6); the decree on an easel (x 20, z -4); a bin (x -4, z 3).
// =====================================================================
const HQX = {};
function hqxTexPoster(lit) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a5aa8'); g.addColorStop(1, '#0e3a7a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#ffcc1a'; x.fillRect(w * 0.3, 0, w * 0.1, h * 0.72); x.fillRect(0, h * 0.36, w, h * 0.07);
  inked(x, 'THE', w / 2, h * 0.08, h * 0.05, '#ffffff', { stroke: false }); inked(x, 'SWEDISH', w / 2, h * 0.15, h * 0.09, '#ffffff', { stroke: '#0a2a5a', sw: 8 }); inked(x, 'NUMBER', w / 2, h * 0.25, h * 0.09, '#ffffff', { stroke: '#0a2a5a', sw: 8 });
  // a classic desk telephone: body with a rotary dial, the handset resting on top, the curly cord
  x.save(); x.translate(w / 2, h * 0.6); x.fillStyle = lit ? '#ffe23a' : '#ffcc1a'; x.strokeStyle = '#3b2417'; x.lineWidth = 10; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(-w * 0.26, h * 0.1); x.lineTo(-w * 0.18, -h * 0.03); x.lineTo(w * 0.18, -h * 0.03); x.lineTo(w * 0.26, h * 0.1); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(0, h * 0.045, w * 0.085, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#3b2417'; for (let i = 0; i < 8; i++) { const a = -2.4 + i * 0.6; x.beginPath(); x.arc(Math.cos(a) * w * 0.058, h * 0.045 + Math.sin(a) * w * 0.058, w * 0.012, 0, TAU); x.fill(); }
  x.fillStyle = lit ? '#ffe23a' : '#ffcc1a'; x.beginPath(); x.moveTo(-w * 0.3, -h * 0.05); x.quadraticCurveTo(0, -h * 0.12, w * 0.3, -h * 0.05); x.lineTo(w * 0.3, -h * 0.085); x.quadraticCurveTo(0, -h * 0.155, -w * 0.3, -h * 0.085); x.closePath(); x.fill(); x.stroke();
  for (const sx of [-1, 1]) { x.beginPath(); x.roundRect(sx * w * 0.3 - w * 0.07, -h * 0.1, w * 0.14, h * 0.06, 14); x.fill(); x.stroke(); } x.restore();
  if (lit) { x.strokeStyle = '#ffe23a'; x.lineWidth = 8; for (const r of [0.3, 0.36]) { x.beginPath(); x.arc(w / 2, h * 0.58, w * r, -2.4, -0.7); x.stroke(); } }
  x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(w * 0.08, h * 0.75, w * 0.84, h * 0.09, 20); x.fill();
  inked(x, '+46 771 793 336', w / 2, h * 0.795, h * 0.055, '#0e3a7a', { stroke: false, maxW: w * 0.78, font: 'Arial' }); inked(x, 'CALL A RANDOM SWEDE', w / 2, h * 0.91, h * 0.045, '#ffcc1a', { stroke: false, maxW: w * 0.86 }); }, 768, 1024); }
function hqxTexView() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa8e8'); g.addColorStop(0.6, '#bfe4fa'); x.fillStyle = g; x.fillRect(0, 0, w, h); const R = RNG('hqxview');
  for (let i = 0; i < 4; i++) c3PaintCloud(x, R.r(0, w), R.r(h * 0.12, h * 0.3), R.r(120, 200), R, C3_SKY.day);
  let px = -10; while (px < w) { const bw = R.r(50, 80), bh = R.r(h * 0.25, h * 0.42), c = ['#e8a05a', '#d8582e', '#f2d29a', '#c8402e', '#f6e2b0'][R.i(0, 4)]; x.fillStyle = c; x.fillRect(px, h * 0.72 - bh, bw, bh);
    x.beginPath(); x.moveTo(px, h * 0.72 - bh); x.lineTo(px + bw / 2, h * 0.72 - bh - bw * 0.4); x.lineTo(px + bw, h * 0.72 - bh); x.fill(); x.fillStyle = 'rgba(40,60,90,0.55)';
    for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) x.fillRect(px + 8 + k * bw / 2, h * 0.72 - bh + 12 + j * bh / 4.5, bw / 2 - 16, bh / 9); px += bw + 3; }
  x.fillStyle = '#2a6aa8'; x.fillRect(0, h * 0.72, w, h * 0.28); x.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 30; i++) x.fillRect(R.r(0, w), R.r(h * 0.74, h), R.r(20, 60), 3); }, 1024, 768); }
function hqxTexBoard() { return tex((x, w, h) => { x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, w, h); inked(x, 'TV AD - PLAN A', w / 2, h * 0.09, h * 0.07, '#2a2e38', { stroke: false });
  for (let i = 0; i < 6; i++) { const cx = w * (0.08 + (i % 3) * 0.3), cy = h * (0.2 + Math.floor(i / 3) * 0.38); x.strokeStyle = '#2a2e38'; x.lineWidth = 5; x.strokeRect(cx, cy, w * 0.26, h * 0.26);
    x.fillStyle = '#ffe0b0'; x.beginPath(); x.arc(cx + w * 0.13, cy + h * 0.1, h * 0.05, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.moveTo(cx + w * 0.13, cy + h * 0.15); x.lineTo(cx + w * 0.13, cy + h * 0.22); x.stroke();
    x.fillStyle = '#e8483a'; x.font = `700 ${h * 0.03}px Arial`; x.fillText(['ACTOR', 'SMILE', 'ELK', 'ACTOR 2', 'SLOGAN', 'END'][i], cx + 8, cy + h * 0.25); } }, 768, 576); }
function hqxTexLabel(txt, bg, fg) { return tex((x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); inked(x, txt, w / 2, h / 2, h * 0.34, fg, { stroke: false, maxW: w * 0.86 }); }, 512, 256); }
function hqxDrawPhone(x, w, h, k) {   // the downloading app: a progress ring/bar, then the Flow app screen
  if (k < 1) { x.fillStyle = '#f2f4f8'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a5aa8'; x.beginPath(); x.roundRect(w * 0.3, h * 0.25, w * 0.4, w * 0.4, 40); x.fill();
    x.fillStyle = '#ffcc1a'; x.fillRect(w * 0.43, h * 0.25, w * 0.06, w * 0.4); x.fillRect(w * 0.3, h * 0.25 + w * 0.17, w * 0.4, w * 0.06);
    inked(x, 'The Swedish Number', w / 2, h * 0.53, h * 0.04, '#2a2e38', { stroke: false }); x.fillStyle = '#d8dce6'; x.beginPath(); x.roundRect(w * 0.15, h * 0.62, w * 0.7, h * 0.03, 12); x.fill();
    x.fillStyle = '#3ad86a'; x.beginPath(); x.roundRect(w * 0.15, h * 0.62, w * 0.7 * k, h * 0.03, 12); x.fill(); inked(x, `DOWNLOADING ${Math.round(k * 100)}%`, w / 2, h * 0.7, h * 0.035, '#5a6070', { stroke: false }); }
  else cover(x, asset('img_app.jpg'), 0, 0, w, h);
}

function hqxBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff6ea', ambI: 0.62, sky: '#fff2e0', ground: '#3a4a6a', key: '#fff2e0', keyI: 1.1, keyP: [-14, 24, 20], rim: '#ffe0b0', rimI: 0.45, rimP: [14, 14, -10] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), c3Prop('#ffffff', { map: c3TexWall('paving', '#5a7ab8', { rep: [12, 8] }), rough: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(4, 0, 6); scene.add(fl);
  scene.add(pl(80, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#2a62c8', { rep: [5, 2] }), rough: 0.85 }), 4, 15, -14));
  scene.add(rb(80, 0.8, 0.4, c3Prop('#ffcc1a'), 4, 21, -13.8, 0.02)); scene.add(rb(80, 1.0, 0.4, c3Prop('#ffcc1a'), 4, 0.5, -13.8, 0.02));
  scene.add(pl(50, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#ffcc3a', { rep: [3, 2] }), rough: 0.85 }), 36, 15, 6, -Math.PI / 2));
  // window wall (left) onto a sunny waterfront
  scene.add(pl(50, 30, c3Flat('#ffffff', { map: hqxTexView() }), -26, 15, 6, Math.PI / 2));
  for (let i = 0; i < 6; i++) scene.add(rb(0.6, 30, 0.6, c3Prop('#fbf6ea'), -25.7, 15, -14 + i * 8, 0.02)); scene.add(rb(0.6, 0.6, 50, c3Prop('#fbf6ea'), -25.7, 6, 6, 0.02));
  const sun = new THREE.DirectionalLight('#fff0d0', 0.5); sun.position.set(-40, 20, 0); scene.add(sun);
  for (const x of [-6, 14]) { const p = new THREE.PointLight('#fff2e0', 0.6, 40, 1.4); p.position.set(x, 22, 4); scene.add(p); }
  // the poster (redrawn lit/unlit) and the big switch
  s.posterUn = hqxTexPoster(false); s.posterLit = hqxTexPoster(true);
  scene.add(rb(8.2, 10.8, 0.1, c3Prop('#fbf6ea'), -12, 12.5, -13.9, 0.03)); s.poster = pl(7.6, 10.2, c3Flat('#ffffff', { map: s.posterUn, glow: '#2a4a8a' }), -12, 12.5, -13.55); s.poster.userData.c3catch = true; scene.add(s.poster);   // no shadow catcher on the poster face
  s.sw = new THREE.Group(); s.sw.position.set(-6.0, 9.5, -13.6); scene.add(s.sw); s.sw.add(rb(3.0, 4.2, 0.6, c3Prop('#e8e2d6', { rough: 0.4 }), 0, 0, 0, 0.03));
  s.sw.add(pl(2.6, 1.0, c3Flat('#ffffff', { map: hqxTexLabel('ON / OFF', '#e8483a', '#ffffff') }), 0, 1.6, 0.32)); s.lever = new THREE.Group(); s.lever.position.set(0, -0.2, 0.35); s.sw.add(s.lever);
  s.lever.add(rb(0.35, 2.0, 0.35, c3Toon('#2a2c34'), 0, 1.0, 0, 0.02)); const knob = c3Mesh(new THREE.SphereGeometry(0.45, 12, 8), c3Prop('#e8483a', { rough: 0.3 }), 0.02); knob.position.y = 2.0; s.lever.add(knob);
  // the 250 YEARS party banner over the meeting table (shown with the cake)
  s.banner = new THREE.Group(); s.banner.position.set(6, 15.4, -13.4); scene.add(s.banner);
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.6, 3), c3Flat(['#ffcc1a', '#ffffff', '#e8483a'][i % 3], { side: THREE.DoubleSide })); f.rotation.z = -Math.PI / 2; f.position.set(-4 + i * 1, 1.6 - 0.2 * Math.sin(i / 8 * Math.PI), 0); s.banner.add(f); }
  s.banner.add(pl(7, 1.8, c3Flat('#ffffff', { map: hqxTexLabel('250 YEARS', '#e8483a', '#ffffff') }), 0, 0, 0.05));
  // the storyboard board (right) and a plant
  scene.add(rb(13, 9.8, 0.4, c3Prop('#c8ccd4', { metal: 0.4 }), 15, 12, -13.7, 0.03)); scene.add(pl(12.4, 9.3, c3Prop('#ffffff', { map: hqxTexBoard(), rough: 0.5 }), 15, 12, -13.45));
  const pot = new THREE.Group(); pot.position.set(31, 0, -9); scene.add(pot); pot.add(cyl(1.5, 1.1, 3, c3Prop('#e8483a'), 0, 1.5, 0, 0.03, 20));
  for (let i = 0; i < 9; i++) { const R = RNG('hqxleaf', i), l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop(i % 2 ? '#3f9a4a' : '#5ab85a', { rough: 0.6 }), 0.03); l.scale.set(0.55, 2.6, 0.2); l.position.set(R.n(0.9), 5.4 + R.r(0, 1.2), R.n(0.5)); l.rotation.set(R.n(0.3), 0, R.n(0.8)); pot.add(l); }
  // the meeting table, the cake (s19), the script (s21), the phone on its stand (s22), the desk phone (s26)
  s.table = new THREE.Group(); s.table.position.set(6, 0, 0); scene.add(s.table);
  s.table.add(rb(14, 0.5, 6, c3Prop('#ffffff', { map: c3TexWall('wood', '#c88a4a', { rep: [3, 1] }), rough: 0.4, env: 0.8 }), 0, 4.4, 0, 0.04)); s.table.add(rb(13, 3.6, 0.3, c3Prop('#ffcc1a', { rough: 0.5 }), 0, 2.2, 2.6, 0.03));
  for (const sx of [-1, 1]) s.table.add(rb(0.6, 4.2, 5, c3Toon('#2a2c34'), sx * 6.2, 2.1, 0, 0.02));
  s.cake = new THREE.Group(); s.cake.position.set(-2.4, 4.65, 1.0); s.table.add(s.cake);
  s.cake.add(cyl(2.6, 2.6, 1.8, c3Prop('#fbf6ea', { rough: 0.6 }), 0, 0.9, 0, 0.04, 32)); s.cake.add(cyl(1.9, 1.9, 1.4, c3Prop('#ffcc1a', { rough: 0.6 }), 0, 2.5, 0, 0.04, 32));
  s.cake.add(cyl(2.7, 2.7, 0.3, c3Prop('#1a5aa8', { rough: 0.5 }), 0, 1.75, 0, 0.02, 32)); for (let i = 0; i < 10; i++) { const b = c3Mesh(new THREE.SphereGeometry(0.28, 10, 8), c3Prop('#e8283a', { rough: 0.3 }), 0.01); b.position.set(Math.cos(i / 10 * TAU) * 1.6, 3.3, Math.sin(i / 10 * TAU) * 1.6); s.cake.add(b); }
  s.cake.add(pl(3.2, 1.2, c3Flat('#ffffff', { map: hqxTexLabel('250', '#1a5aa8', '#ffcc1a') }), 0, 0.9, 2.62));
  s.flames = []; for (let i = 0; i < 3; i++) { const c = cyl(0.12, 0.12, 1.0, c3Prop('#ffffff'), -0.7 + i * 0.7, 3.7, 0.2, 0.01, 8); s.cake.add(c); const f = c3Mesh(new THREE.SphereGeometry(0.2, 10, 8), c3Flat('#ffd27a', { glow: '#ffb84a' }), 0); f.scale.y = 1.6; f.position.set(-0.7 + i * 0.7, 4.4, 0.2); s.cake.add(f); s.flames.push(f); }
  s.cake.add(pl(2.4, 1.1, c3Flat('#ffffff', { map: hqxTexLabel('250', '#ffffff', '#e8483a'), side: THREE.DoubleSide }), -0.6, 5.3, 0.3)); s.cake.add(cyl(0.04, 0.04, 1.6, c3Toon('#3b2417'), -0.6, 4.2, 0.28, 0, 6));
  const flagC = pl(1.4, 0.9, c3Flat('#ffffff', { map: texFlagSE(), side: THREE.DoubleSide }), 0.9, 5.0, -0.4); s.cake.add(flagC); s.cake.add(cyl(0.04, 0.04, 2.0, c3Toon('#3b2417'), 0.2, 4.4, -0.4, 0, 6));
  s.script = new THREE.Group(); s.table.add(s.script); s.script.add(rb(2.4, 0.5, 3.2, c3Prop('#fbfbf6', { rough: 0.7 }), 0, 0, 0, 0.02)); s.script.add(pl(2.0, 1.0, c3Flat('#ffffff', { map: hqxTexLabel('SCRIPT', '#fbfbf6', '#2a2e38') }), 0, 0.27, 0, 0, -Math.PI / 2));
  s.ball = c3Mesh((() => { const g = new THREE.IcosahedronGeometry(0.9, 3), P = g.attributes.position, R = RNG('crumple'); for (let i = 0; i < P.count; i++) { const k = 0.82 + 0.3 * Math.abs(Math.sin(P.getX(i) * 7 + P.getY(i) * 5) * Math.cos(P.getZ(i) * 6)); P.setXYZ(i, P.getX(i) * k, P.getY(i) * k, P.getZ(i) * k); } g.computeVertexNormals(); return g; })(), c3Prop('#fbfbf6', { rough: 0.8 }), 0.03);   // crumpled paper scene.add(s.ball);
  s.phoneC = canvasTex(360, 640); s.stand = new THREE.Group(); s.stand.position.set(-3.2, 4.65, 1.4); s.table.add(s.stand);
  s.stand.add(rb(1.8, 0.3, 1.4, c3Toon('#2a2c34'), 0, 0.15, 0, 0.02)); const ph = rb(3.0, 5.4, 0.3, c3Prop('#1a1e2a', { rough: 0.3 }), 0, 2.9, 0, 0.03); ph.rotation.x = -0.12; s.stand.add(ph);
  s.screen = pl(2.7, 4.9, new THREE.MeshBasicMaterial({ map: s.phoneC.t, toneMapped: false }), 0, 2.92, 0.18, 0, -0.12); s.stand.add(s.screen);
  s.desk = new THREE.Group(); s.desk.position.set(4.5, 4.65, -1.4); s.table.add(s.desk); s.desk.add(rb(2.4, 0.9, 1.8, c3Prop('#e8483a', { rough: 0.3 }), 0, 0.45, 0, 0.03));
  s.handset = rb(2.8, 0.6, 0.8, c3Prop('#e8483a', { rough: 0.3 }), 0, 1.2, 0, 0.03); s.desk.add(s.handset);
  // the decree on an easel (Flow photo) with three black CENSORED bars that tear away
  s.easel = new THREE.Group(); s.easel.position.set(28, 0, -3); s.easel.rotation.y = -0.45; scene.add(s.easel); const ew = c3Prop('#8a5a3a');
  for (const sx of [-1, 1]) { const l = rb(0.4, 15, 0.4, ew, sx * 2.6, 7.5, 0, 0.02); l.rotation.z = -sx * 0.1; s.easel.add(l); } const bk = rb(0.4, 13, 0.4, ew, 0, 6.5, -1.6, 0.02); bk.rotation.x = 0.2; s.easel.add(bk);
  s.easel.add(rb(7.8, 10.2, 0.4, c3Prop('#5a3a1a'), 0, 10, 0.2, 0.03)); const dt = tex((x, w, h) => { x.fillStyle = '#e8d8b0'; x.fillRect(0, 0, w, h); cover(x, asset('img_decree.jpg'), 0, 0, w, h); }, 576, 768);
  s.easel.add(pl(7.0, 9.4, c3Prop('#ffffff', { map: dt, rough: 0.8 }), 0, 10, 0.42)); s.easel.add(rb(8, 0.4, 1.2, ew, 0, 4.7, 0.6, 0.02));
  s.bars = [[-0.2, 13.4, 0.1], [0.1, 12.0, -0.07], [-0.1, 10.6, 0.05]].map(([bx, by, rz]) => { const m = pl(5.6, 1.0,   // upper half: clear of the subtitle band
 c3Flat('#ffffff', { map: hqxTexLabel('CENSORED', '#14141a', '#ffffff'), side: THREE.DoubleSide }), bx, by, 0.6); m.rotation.z = rz; m.userData.base = [bx, by, rz]; s.easel.add(m); return m; });
  s.yr = pl(3.4, 1.4, c3Flat('#ffffff', { map: hqxTexLabel('1766', '#ffcc1a', '#1a3a7a') }), 2.6, 15.4, 0.7); s.yr.rotation.z = 0.12; s.easel.add(s.yr);
  // the bin, the training manual, the rule book
  s.bin = new THREE.Group(); s.bin.position.set(0.6, 0, 5.2); scene.add(s.bin); s.bin.add(cyl(1.7, 1.3, 3.6, c3Prop('#3a3a42', { rough: 0.5, metal: 0.3 }), 0, 1.8, 0, 0.04, 24)); s.bin.add(cyl(1.75, 1.75, 0.2, c3Prop('#5a5a62'), 0, 3.6, 0, 0.02, 24));
  s.manual = new THREE.Group(); scene.add(s.manual); s.manual.add(rb(2.6, 3.4, 0.7, c3Prop('#e8483a', { rough: 0.5 }), 0, 0, 0, 0.03)); s.manual.add(pl(2.2, 1.2, c3Flat('#ffffff', { map: hqxTexLabel('TRAINING', '#fbfbf6', '#e8483a') }), 0, 0.4, 0.37));
  s.rules = new THREE.Group(); scene.add(s.rules); s.rules.add(rb(3.0, 3.8, 1.3, c3Prop('#2a5ad8', { rough: 0.5 }), 0, 0, 0, 0.03)); s.rules.add(pl(2.6, 1.3, c3Flat('#ffffff', { map: hqxTexLabel('RULES', '#fbfbf6', '#2a5ad8') }), 0, 0.4, 0.67));
  // confetti (s19) — fixed random flights
  const cm = ['#e8483a', '#ffcc1a', '#3a9ae8', '#3ad86a', '#e85aa0'].map((c) => c3Flat(c, { side: THREE.DoubleSide })); s.conf = [];
  for (let i = 0; i < 60; i++) { const R = RNG('hqxconf', i), m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), cm[i % 5]); m.userData = { v: [R.n(7), R.r(8, 16), R.r(-2, 5)], spin: [R.n(9), R.n(9)], t0: R.r(0, 0.15) }; scene.add(m); c3Layer(m, C3.L_FOCUS); s.conf.push(m); }
  // the exec
  s.exec = person(scene, 'exec');
  [s.table, s.easel, s.bin, s.manual, s.rules, s.ball, s.sw].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = { leaf: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const l = c3Mesh(new THREE.SphereGeometry(1, 12, 8), c3Prop('#3f9a4a', { rough: 0.6 }), 0.03); l.scale.set(0.8, 2.4, 0.15); l.rotation.z = -0.5 + i * 0.45; l.position.x = i * 0.9; g.add(l); } return g; })(),
    mug: mug('#ffcc1a', 0, 0, 0) };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#fff6e8', mid: '#a8c0e8', bot: '#2a3a5a' });
  c3ShadeScene(scene, { dark: 0.25 });
  return s;
}
const hqxGet = () => HQX.s ||= hqxBuild();
function hqxWorld(s, t, o = {}) {
  s.poster.material.map = o.lit ? s.posterLit : s.posterUn; s.lever.rotation.z = o.lit ? -0.9 : 0.9;
  s.cake.visible = !!o.cake; s.banner.visible = !!o.cake; s.script.visible = !!o.script; s.ball.visible = false; s.manual.visible = false; s.rules.visible = false; s.conf.forEach((m) => { m.visible = false; });
  s.stand.visible = !!o.stand; s.bars.forEach((m) => { m.visible = true; const [bx, by, rz] = m.userData.base; m.position.set(bx, by, 0.6); m.rotation.set(0, 0, rz); }); s.yr.visible = false;
  s.flames.forEach((f, i) => { f.scale.set(1 + 0.15 * Math.sin(t * 17 + i), 1.6 + 0.3 * Math.sin(t * 13 + i * 2), 1); });
  s.handset.position.y = 1.2; s.handset.rotation.z = 0; s.exec.x = [];
  s.exec.g.visible = true; s.exec.g.position.set(...(o.at ?? [6, FOOT, -4.2]));
}
const hqxPose = (s, t, o) => c3PersonPose(s.exec, s.cam, t, Object.assign({ expr: 'smile', gaze: [0, 0], hand: { armL: [1.4, -0.5], armR: [-1.4, -0.5] } }, STAND, o));
// a held prop placed at a fist (world space, from the person's root)
function hqxAtFist(s, obj, arm, d = [0, 0.4, 0.2]) { const f = fistLocal(s.exec, arm); obj.position.copy(s.exec.root.localToWorld(V3(f.x + d[0], f.y + d[1], f.z + d[2]))); obj.quaternion.copy(s.cam.quaternion); }

// =====================================================================
//  s17 — "You see, this was the Swedish Number.": the campaign poster on the blue wall; the camera glides in; the exec
//  beside it gestures proudly at it
// =====================================================================
const HQX_K17 = [[0, [-11.2, 12.4, 20], [-10.6, 11.8, -12.5], 40], [1.64, [-10.6, 12.2, 17.5], [-10.5, 11.9, -12.5], 40]];   // the whole poster in frame
SHOT_FN['s17'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, at: [-7.0, FOOT, -10.0] }); c3SetCam(s.cam, camMove(HQX_K17, lt, 's17', { orbit: 0.01, creep: 0.0, rush: 0.0 }));
  hqxPose(s, t, { expr: 'proud', gaze: [-0.8, 0.3], hand: { armR: [-2.0, 2.6 + 0.2 * Math.sin(t * 3)], armL: [1.3, -0.4] } });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.0, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s18 — "A Swedish tourism group set it up": the exec throws the big ON switch on "set"; the poster lights up
// =====================================================================
const HQX_K18 = [[0, [-8.6, 11, 25], [-9.4, 11, -12], 40], [2.32, [-9.8, 11, 23.5], [-9.6, 11.2, -12], 40]];   // poster, switch and the exec all in frame
SHOT_FN['s18'] = (t, u, lt) => {
  const st = wAfter('set', 27.5, 28.0), on = t > st + 0.1;
  const s = hqxGet(); hqxWorld(s, t, { lit: on, at: [-3.5, FOOT, -10.2] }); c3SetCam(s.cam, camMove(HQX_K18, lt, 's18', { orbit: -0.01, creep: 0.0, rush: 0.0 }));
  const k = EZ.io(clamp((t - (st - 0.3)) / 0.4)); s.lever.rotation.z = lerp(0.9, -0.9, k);
  hqxPose(s, t, { expr: on ? 'excited' : 'determined', gaze: [-0.8, 0.2], hand: { armR: [lerp(-1.9, -2.2, k), lerp(4.2, 2.4, k)], armL: [1.6, on ? 3.0 : -0.3] } });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.0, glow: on ? 0.8 : 0.4, glowBlur: 12 });
};
// =====================================================================
//  s19 — "to celebrate two hundred and fifty years": the 250 cake on the table, the exec clapping behind it; confetti
//  bursts on "fifty"
// =====================================================================
const HQX_K19 = [[0, [6.5, 14.5, 23], [4.6, 8.6, -1], 40], [1.76, [5.5, 14, 20.5], [4.6, 8.8, -1], 40]];   // the whole cake in frame
SHOT_FN['s19'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, cake: true, at: [6, FOOT, -4.4] }); c3SetCam(s.cam, camMove(HQX_K19, lt, 's19', { orbit: 0.02, rush: 0.0 }));
  const tf = wAfter('fifty', 29.2, 29.41) - 0.05, clap = Math.abs(Math.sin(t * 9));
  hqxPose(s, t, { expr: 'laugh', gaze: [0, 0.1], hand: { armL: [0.3 + 0.5 * clap, 2.4], armR: [-0.3 - 0.5 * clap, 2.4] } });
  s.conf.forEach((m) => { const u2 = t - tf - m.userData.t0; m.visible = u2 > 0; if (!m.visible) return; const [vx, vy, vz] = m.userData.v;
    m.position.set(3.6 + vx * u2, 9.5 + vy * u2 - 9 * u2 * u2, 0.8 + vz * u2); m.rotation.set(m.userData.spin[0] * u2, m.userData.spin[1] * u2, 0); if (m.position.y < 4.7) m.position.y = 4.7; });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.2, glow: 0.6, glowBlur: 12 });
};
// =====================================================================
//  s20 — "since Sweden became one of the first countries to get rid of censorship.": the 1766 decree on its easel; the
//  1766 tag pops on "first"; on "rid" the three CENSORED bars tear off and fly away, one after another
// =====================================================================
const HQX_K20 = [[0, [21.2, 10.0, 11], [28, 9.6, -3], 40], [3.44, [22.2, 10.0, 8.8], [28, 9.7, -3], 40]];
SHOT_FN['s20'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true }); s.exec.g.visible = false; c3SetCam(s.cam, camMove(HQX_K20, lt, 's20', { orbit: 0.01, creep: 0.02, rush: 0.0 }));
  const tf = wAfter('first', 31.5, 31.68), tr = wAfter('rid', 32.5, 32.78);
  s.yr.visible = t > tf - 0.05; s.yr.scale.setScalar(Math.max(0.01, pop(t, tf - 0.05, 0.25)));
  s.bars.forEach((m, i) => { const t0 = tr + i * 0.18, u2 = t - t0; if (u2 <= 0) return; const [bx, by, rz] = m.userData.base, sx = i % 2 ? -1 : 1;
    m.position.set(bx + sx * 9 * u2, by + 5 * u2 - 4 * u2 * u2, 0.6 + 6 * u2); m.rotation.set(0.8 * u2, sx * 2.2 * u2, rz + sx * 3 * u2); m.visible = u2 < 1.2; });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.4, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s21 — "So instead of an ad with actors and a script,": the TV ad storyboard (PLAN A) behind; the exec holds up the
//  SCRIPT, frowns, crumples it on "script" and lobs the ball away
// =====================================================================
const HQX_K21 = [[0, [9, 10.8, 17], [13.5, 9.8, -8], 42], [2.16, [8.5, 10.6, 14.5], [13.5, 10.0, -8], 42]];
SHOT_FN['s21'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, at: [12, FOOT, -8.5] }); c3SetCam(s.cam, camMove(HQX_K21, lt, 's21', { orbit: 0.02, rush: 0.0 }));
  const tsc = wAfter('script', 35.2, 35.44), cr = clamp((t - (tsc - 0.15)) / 0.2), th = t - (tsc + 0.15);
  hqxPose(s, t, { expr: t < tsc - 0.2 ? 'skeptical' : 'smirk', gaze: [0.4, 0.2], hand: { armL: th > 0 ? [2.2, 3.9] : [2.0, 1.3], armR: [-1.4, -0.4] } });   // the ball stays out beside him, never over his face
  s.exec.g.updateMatrixWorld(true);
  if (cr < 1) { s.script.visible = true; hqxAtFist(s, s.script, 'armL', [0.2, 0.6, 0.3]); s.script.rotateX(Math.PI / 2 - 0.3); s.script.scale.set(1 - 0.6 * cr, 1, 1 - 0.6 * cr); }
  else { s.ball.visible = true; if (th < 0) hqxAtFist(s, s.ball, 'armL', [0, 0.5, 0.3]); else { const f = fistLocal(s.exec, 'armL'), p0 = s.exec.root.localToWorld(V3(f.x, f.y + 0.5, f.z + 0.3)); s.ball.position.set(p0.x - 8 * th, p0.y + 7 * th - 12 * th * th, p0.z + 3 * th); s.ball.rotation.set(th * 9, th * 7, 0); } }
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s22 — "they let any Swede who downloaded an app": the phone on its stand; on "downloaded" the bar fills, then the
//  app (Flow screen: THE SWEDISH NUMBER, ANSWER, incoming call from Brazil) appears
// =====================================================================
const HQX_K22 = [[0, [3.4, 8.8, 12.5], [2.8, 6.4, 1.4], 40], [2.26, [2.9, 8.5, 10.6], [2.8, 6.5, 1.4], 40]];   // phone in the upper frame: ANSWER clear of the subtitle
SHOT_FN['s22'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, stand: true, at: [8, FOOT, -4.4] }); c3SetCam(s.cam, camMove(HQX_K22, lt, 's22', { orbit: 0.015, creep: 0.03, rush: 0.0 }));
  const td = wAfter('downloaded', 37, 37.16), k = clamp((t - (td - 0.3)) / 0.8), q = k >= 1 ? 1 : Math.floor(k * 20) / 20;
  redraw(s.phoneC, 'p' + q, (x, w, h) => hqxDrawPhone(x, w, h, q));
  s.stand.scale.setScalar(1 + 0.05 * pop(t, td + 0.5, 0.2) * Math.exp(-Math.max(0, t - td - 0.5) * 4));
  hqxPose(s, t, { expr: 'excited', gaze: [-0.6, -0.4], hand: { armL: [1.5, 2.6], armR: [-1.4, -0.3] } });
  fgPlace(s, [['mug', [2.2, -3.2, -6], -0.6]], HQX_K22, 's22', lt, { orbit: 0.015, creep: 0.03, rush: 0.0 });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.6, nearBlur: 10, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s24 — "No training.": the TRAINING manual lies on the table; the exec reaches over, grabs it and drops it into the
//  bin in front of the table on "training"
//  s25 — "No rules about what to say.": (CONTINUOUS) the thick RULES book lies next to it; both hands reach, heave it
//  up and drop it in after the manual on "rules"
// =====================================================================
const HQX_EX = [-2.6, FOOT, 0.4], HQX_MAN = V3(0.1, 5.05, 1.2), HQX_RUL = V3(0.8, 5.25, -0.4), HQX_BIN = V3(0.6, 3.4, 5.2);
// a book's life: on the table until tg (the hand reaches for it from tr), in the fist from tg to td (lifted), then a
// short arc into the bin. hqxReach -> the reaching fist's target (root units); hqxBookAt places the book after the pose.
function hqxReach(s, rest, t, tr, tg, td, lift) {
  const r = s.exec.root.worldToLocal(rest.clone()), reach = [r.x, r.y + 0.1];
  if (t < tg) { const k = EZ.io(clamp((t - tr) / (tg - tr))); return [lerp(1.3, reach[0], k), lerp(-0.4, reach[1], k)]; }
  const k = EZ.io(clamp((t - tg) / (td - tg))); return [lerp(reach[0], lift[0], k), lerp(reach[1], lift[1], k)];
}
function hqxBookAt(s, obj, rest, arm, t, tg, td, o = {}) {
  obj.visible = true;
  if (t < tg) { obj.position.copy(rest); obj.rotation.set(-Math.PI / 2 + 0.05, 0, o.rz ?? 0.2); return; }
  const f = fistLocal(s.exec, arm), p0 = s.exec.root.localToWorld(V3(f.x, f.y + 0.6, f.z + 0.3));
  if (t < td) { obj.position.copy(p0); obj.quaternion.copy(s.cam.quaternion); obj.rotateZ(0.3 * (1 - EZ.io(clamp((t - tg) / 0.2)))); return; }
  const k = clamp((t - td) / 0.4); obj.position.lerpVectors(p0, HQX_BIN, k); obj.position.y += 2.4 * Math.sin(Math.PI * k); obj.quaternion.copy(s.cam.quaternion); obj.rotateZ(k * 2.2 * (o.spin ?? 1)); obj.visible = k < 1;
}
const HQX_K24 = [[0, [-7, 10.4, 22], [-1.2, 6.6, 1.5], 42], [0.84, [-7.4, 10.3, 21], [-1.2, 6.6, 1.5], 42]];
SHOT_FN['s24'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, at: HQX_EX }); c3SetCam(s.cam, camMove(HQX_K24, lt, 's24', { orbit: 0.015, rush: 0.0 }));
  const [a] = spanOf('s24'), tn = wAfter('training', 40.2, 40.36), tg = tn - 0.05, td = tn + 0.22;
  s.rules.visible = true; s.rules.position.copy(HQX_RUL); s.rules.rotation.set(-Math.PI / 2 + 0.05, 0, -0.15);
  hqxPose(s, t, {}); const armL = hqxReach(s, HQX_MAN, t, a - 0.1, tg, td, [1.6, 3.0]);
  hqxPose(s, t, { expr: 'smug', gaze: [0.6, -0.4], hand: { armL, armR: [-1.4, -0.4] } }); hqxBookAt(s, s.manual, HQX_MAN, 'armL', t, tg, td);
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
const HQX_K25 = [[0, [-7.4, 10.3, 21], [-1.0, 6.8, 1.2], 42], [1.76, [-7.8, 10.2, 19.6], [-0.8, 6.9, 1.2], 42]];
SHOT_FN['s25'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, at: HQX_EX }); c3SetCam(s.cam, camMove(HQX_K25, lt, 's25', { orbit: 0.015, rush: 0.0 }));
  const [a] = spanOf('s25'), tr = wAfter('rules', 41.3, 41.46), tg = tr - 0.12, td = tr + 0.3;
  hqxPose(s, t, {}); const armL = hqxReach(s, HQX_RUL, t, a + 0.05, tg, td, [1.5, 3.3]), held = t > tg && t < td;
  const armR = held ? [armL[0] - 1.1, armL[1] - 0.1] : [-1.4, -0.4];   // the heavy book: both fists on it while it's held
  hqxPose(s, t, { expr: t < tr ? 'determined' : 'grin', gaze: [0.6, -0.3], hand: { armL, armR } }); hqxBookAt(s, s.rules, HQX_RUL, 'armL', t, tg, td, { spin: -1, rz: -0.15 });
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.2, glow: 0.4, glowBlur: 12 });
};
// =====================================================================
//  s26 — "And that's the risky part.": close on the exec, a nervous grin, a sweat drop; the red desk phone rattles in
//  its cradle beside him
// =====================================================================
const HQX_K26 = [[0, [12, 10.8, 17], [8, 8.6, -3], 42], [1.3, [11, 10.4, 14.5], [8, 8.8, -3], 42]];
SHOT_FN['s26'] = (t, u, lt) => {
  const s = hqxGet(); hqxWorld(s, t, { lit: true, at: [7.5, FOOT, -4.4] }); c3SetCam(s.cam, camMove(HQX_K26, lt, 's26', { orbit: -0.02, creep: 0.06, rush: 0.0 }));
  const tr = wAfter('risky', 43, 43.24);
  c3PersonPose(s.exec, s.cam, t, Object.assign({ expr: t < tr ? 'nervous' : 'grimace', gaze: [0.6, -0.3], head: [0.04 * Math.sin(t * 20) * (t > tr ? 1 : 0), 0, 0], x: ['sweat'], hand: { armL: [1.3, 0.6], armR: [-1.1, 1.4] } }, STAND));
  s.handset.position.y = 1.2 + 0.12 * Math.max(0, Math.sin(t * 38)); s.handset.rotation.z = 0.06 * Math.sin(t * 31);
  c3Render(s.scene, s.cam, { bg: '#2a62c8', bgBlur: 1.4, glow: 0.4, glowBlur: 12 });
};

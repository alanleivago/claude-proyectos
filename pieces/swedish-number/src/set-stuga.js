// =====================================================================
//  SET stuga — a cosy Swedish cottage on a dark winter evening: the kitchen table where the meatball guy eats (s10,
//  s12 stands up and bumps the lamp, s13 the clock at 5:00, s14 the dark window — CONTINUOUS, s15 chews and swallows,
//  s16 "Wait. Who gave you this number?" — CONTINUOUS), and the box-bed alcove on the right where the pajama Swede
//  just woke up (s28); s32 the pajama Swede at the same table finishing his meatballs. Registers SHOT_FN[id]. Prefix stg.
//  World: floor y 0 (wood), back wall z -12 (yellow planks), left wall x -24 (blue), right wall x 38 (green).
//  Table: centre (0, 4.4, 3), 11 x 5.4, check cloth; the eater sits behind it (x 0, z 0.6, seat 2.8; the table hides
//  his legs); the lamp hangs over him (shade bottom y 11.0). Clock on the back wall (-1, 17.2); window x 12; stove and
//  blue cabinets x -20..-8; box bed x 26 (mattress top 3.4), a blanket in front hides the sleeper's legs.
// =====================================================================
const STG = {}, STG_SEAT = 2.8, STG_BED = 3.4;
function stgTexCloth() { const t = tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(214,30,40,0.7)';
  for (let i = 0; i < 4; i++) { x.fillRect(i * w / 4, 0, w / 8, h); x.fillRect(0, i * h / 4, w, h / 8); } }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; }   // big bold checks (fine ones shimmered)
function stgTexNight() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e1440'); g.addColorStop(0.7, '#2a3a8a'); g.addColorStop(1, '#3a4a9a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('stgnight'); x.fillStyle = '#ffffff'; for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(0, h * 0.6), R.r(1, 2.5), 0, TAU); x.fill(); }
  x.fillStyle = '#fff6d0'; x.beginPath(); x.arc(w * 0.75, h * 0.2, 30, 0, TAU); x.fill(); x.fillStyle = '#0e1440'; x.beginPath(); x.arc(w * 0.75 + 12, h * 0.2 - 6, 26, 0, TAU); x.fill();
  // snowy ground, a red cottage with a lit window, pines, a street lamp with its glow
  x.fillStyle = '#c8d8f0'; x.beginPath(); x.moveTo(0, h * 0.78); x.quadraticCurveTo(w / 2, h * 0.7, w, h * 0.8); x.lineTo(w, h); x.lineTo(0, h); x.fill();
  x.fillStyle = '#7a1e1a'; x.fillRect(w * 0.1, h * 0.58, w * 0.3, h * 0.2); x.fillStyle = '#e8eef8'; x.beginPath(); x.moveTo(w * 0.07, h * 0.6); x.lineTo(w * 0.25, h * 0.47); x.lineTo(w * 0.43, h * 0.6); x.fill();
  x.fillStyle = '#ffd27a'; x.fillRect(w * 0.16, h * 0.63, w * 0.06, h * 0.06); x.fillRect(w * 0.28, h * 0.63, w * 0.06, h * 0.06);
  for (const px of [0.55, 0.92]) { x.fillStyle = '#123a2a'; x.beginPath(); x.moveTo(w * px, h * 0.48); x.lineTo(w * (px - 0.07), h * 0.8); x.lineTo(w * (px + 0.07), h * 0.8); x.fill(); }
  const lg = x.createRadialGradient(w * 0.72, h * 0.55, 0, w * 0.72, h * 0.55, w * 0.2); lg.addColorStop(0, 'rgba(255,220,140,0.8)'); lg.addColorStop(1, 'rgba(255,220,140,0)'); x.fillStyle = lg; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1a1a2a'; x.fillRect(w * 0.715, h * 0.55, 6, h * 0.27); x.fillStyle = '#fff2c0'; x.beginPath(); x.arc(w * 0.72, h * 0.55, 10, 0, TAU); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 80; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(1.5, 3.5), 0, TAU); x.fill(); } }, 512, 512); }
function stgDrawClock(x, w, h, hh, mm) { x.clearRect(0, 0, w, h); x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.47, 0, TAU); x.fill(); x.lineWidth = 16; x.strokeStyle = '#1a5aa8'; x.stroke();
  x.fillStyle = '#3b2417'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; inked(x, String(i || 12), w / 2 + Math.sin(a) * w * 0.35, h / 2 - Math.cos(a) * h * 0.35, h * 0.09, '#3b2417', { stroke: false, font: 'Arial' }); }
  x.lineCap = 'round'; x.strokeStyle = '#3b2417'; const ah = ((hh % 12) + mm / 60) / 12 * TAU, am = mm / 60 * TAU;
  x.lineWidth = 14; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.sin(ah) * w * 0.2, h / 2 - Math.cos(ah) * h * 0.2); x.stroke();
  x.lineWidth = 9; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.sin(am) * w * 0.32, h / 2 - Math.cos(am) * h * 0.32); x.stroke();
  x.fillStyle = '#e8483a'; x.beginPath(); x.arc(w / 2, h / 2, 10, 0, TAU); x.fill(); inked(x, 'MIDDAG', w / 2, h * 0.68, h * 0.06, '#1a5aa8', { stroke: false }); }
function stgTexBubble(txt, c = '#3b2417') { return tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineWidth = 10; x.strokeStyle = '#3b2417'; x.fillStyle = '#fffaf0';
  x.beginPath(); x.roundRect(w * 0.06, h * 0.08, w * 0.88, h * 0.62, 40); x.fill(); x.stroke(); x.beginPath(); x.moveTo(w * 0.3, h * 0.68); x.lineTo(w * 0.22, h * 0.94); x.lineTo(w * 0.46, h * 0.7); x.closePath(); x.fill(); x.stroke();
  x.fillRect(w * 0.28, h * 0.64, w * 0.2, h * 0.07); const L = txt.split('|'); L.forEach((ln, i) => inked(x, ln, w / 2, h * (0.39 + (i - (L.length - 1) / 2) * 0.2), h * (L.length > 1 ? 0.16 : 0.22), c, { stroke: false, maxW: w * 0.8 })); }, 512, 320); }

function stgBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 500), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffeedd', ambI: 0.62, sky: '#ffe8c8', ground: '#5a3a2a', key: '#ffe6c8', keyI: 1.0, keyP: [10, 22, 18], rim: '#a8b8ff', rimI: 0.45, rimP: [-14, 14, -10] });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 44), c3Prop('#ffffff', { map: c3TexWall('wood', '#a8642e', { rep: [10, 6] }), rough: 0.5, env: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(7, 0, 8); scene.add(fl);
  scene.add(pl(80, 30, c3Prop('#ffffff', { map: c3TexWall('wood', '#ffc23a', { rep: [10, 2] }), rough: 0.75 }), 7, 15, -12));
  scene.add(pl(44, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#3a8ee8', { rep: [3, 2] }), rough: 0.85 }), -24, 15, 8, Math.PI / 2));
  scene.add(pl(44, 30, c3Prop('#ffffff', { map: c3TexWall('plaster', '#4ab86a', { rep: [3, 2] }), rough: 0.85 }), 38, 15, 8, -Math.PI / 2));
  scene.add(rb(80, 1.0, 0.3, c3Prop('#fbf6ea'), 7, 0.5, -11.8, 0.02));
  // window onto the dark winter evening, gingham curtains
  scene.add(rb(11, 10, 0.4, c3Prop('#fbf6ea', { rough: 0.5 }), 12, 13, -11.9, 0.03)); scene.add(pl(10, 9, c3Flat('#ffffff', { map: stgTexNight() }), 12, 13, -11.6));
  s.snowTex = tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('stgsnow'); x.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(0, h), R.r(2, 4.5), 0, TAU); x.fill(); } }, 256, 256);
  s.snowTex.wrapS = s.snowTex.wrapT = THREE.RepeatWrapping; s.snowTex.repeat.set(2, 2); scene.add(pl(10, 9, new THREE.MeshBasicMaterial({ map: s.snowTex, transparent: true, depthWrite: false, toneMapped: false }), 12, 13, -11.55));   // snow falling outside
  scene.add(rb(0.3, 9, 0.2, c3Prop('#fbf6ea'), 12, 13, -11.5, 0.01)); scene.add(rb(10, 0.3, 0.2, c3Prop('#fbf6ea'), 12, 13, -11.5, 0.01));
  for (const sx of [-1, 1]) scene.add(rb(2.4, 7, 0.5, c3Prop('#ffffff', { map: stgTexCloth(), rough: 0.9 }), 12 + sx * 6.2, 14.5, -11.3, 0.03));
  // the kitchen: blue cabinets, counter, stove with a steaming pot, shelf of plates
  const blue = c3Prop('#2f6ac8', { rough: 0.5 }), top = c3Prop('#e8e2d6', { rough: 0.4 });
  for (let i = 0; i < 4; i++) { scene.add(rb(3.4, 4.6, 3.4, blue, -20 + i * 3.6, 2.3, -10, 0.04)); scene.add(rb(0.8, 0.25, 0.2, c3Prop('#f0c040', { metal: 0.7 }), -20 + i * 3.6, 3.8, -8.2, 0.01)); }
  scene.add(rb(14.6, 0.4, 3.8, top, -14.6, 4.8, -10, 0.03));
  for (let i = 0; i < 3; i++) scene.add(rb(3.4, 3.6, 2.4, blue, -20 + i * 3.6, 12.5, -10.6, 0.04));
  const pot = cyl(1.2, 1.1, 1.6, c3Prop('#e8483a', { rough: 0.3 }), -9.8, 5.8, -10, 0.03, 20); scene.add(pot);
  s.steam = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false })); scene.add(m); return m; });
  scene.add(rb(8, 0.3, 1.4, c3Prop('#8a5a3a'), 2, 15.5, -11.2, 0.02)); for (let i = 0; i < 5; i++) { const p = cyl(0.9, 0.9, 0.12, c3Prop(['#fbf6ea', '#3a8ee8', '#fbf6ea', '#e8483a', '#fbf6ea'][i], { rough: 0.3 }), -1 + i * 1.5, 16.6, -11.2, 0.012, 20); p.rotation.x = Math.PI / 2 - 0.2; scene.add(p); }
  // the clock (redrawn on change)
  s.clockC = canvasTex(256, 256); s.clock = new THREE.Group(); s.clock.position.set(-7.5, 17.8, -11.7); scene.add(s.clock);
  s.clock.add(cyl(2.3, 2.3, 0.4, c3Prop('#1a5aa8'), 0, 0, -0.1, 0.04, 32).rotateX(Math.PI / 2)); s.clock.add(pl(4.2, 4.2, new THREE.MeshBasicMaterial({ map: s.clockC.t, transparent: true, toneMapped: false }), 0, 0, 0.14));
  // the table with the check cloth, the plate, a glass of milk, a candle
  s.table = new THREE.Group(); s.table.position.set(0, 0, 3); scene.add(s.table);
  s.table.add(rb(11, 0.4, 5.4, c3Prop('#ffffff', { map: stgTexCloth(), rough: 0.8 }), 0, 4.4, 0, 0.04)); s.table.add(rb(11.2, 1.6, 0.2, c3Prop('#ffffff', { map: stgTexCloth(), rough: 0.8 }), 0, 3.6, 2.72, 0.02));
  for (const [a, b] of [[-4.8, -2.2], [4.8, -2.2], [-4.8, 2.2], [4.8, 2.2]]) s.table.add(rb(0.45, 4.2, 0.45, c3Prop('#7a4a2a'), a, 2.1, b, 0.02));
  s.plate = meatPlate(3, 11); s.plate.position.set(0.4, 4.6, 0.6); s.table.add(s.plate);
  s.table.add(cyl(0.45, 0.4, 1.5, c3Prop('#f6fbff', { rough: 0.2 }), 3.4, 5.35, 0.2, 0.02, 16));
  s.table.add(cyl(0.25, 0.25, 1.4, c3Prop('#fbf3e0'), -3.6, 5.3, -0.6, 0.015, 12)); const fl2 = c3Mesh(new THREE.SphereGeometry(0.22, 10, 8), c3Flat('#ffd27a', { glow: '#ffb84a' }), 0); fl2.scale.y = 1.6; fl2.position.set(-3.6, 6.25, -0.6); s.table.add(fl2);
  const cp = new THREE.PointLight('#ffcf90', 0.4, 14, 1.6); cp.position.set(-3.6, 6.8, 2.4); scene.add(cp);
  // the chair behind the eater
  s.chair = new THREE.Group(); s.chair.position.set(0, 0, -1.2); scene.add(s.chair); const cw = c3Prop('#c8502e', { rough: 0.6 });
  s.chair.add(rb(3.0, 0.35, 2.6, cw, 0, STG_SEAT - 0.2, 0, 0.03)); s.chair.add(rb(3.0, 4.6, 0.3, cw, 0, STG_SEAT + 2.1, -1.2, 0.03)); for (const [a, b] of [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]]) s.chair.add(rb(0.3, STG_SEAT - 0.4, 0.3, cw, a, (STG_SEAT - 0.4) / 2, b, 0.02));
  // the hanging lamp over the table (swings when bumped)
  s.lampP = new THREE.Group(); s.lampP.position.set(0, 27.2, 0.6); scene.add(s.lampP);
  s.lampP.add(cyl(0.05, 0.05, 13.6, c3Toon('#2a2a30'), 0, -6.8, 0, 0, 6));
  const sh = c3Mesh(new THREE.ConeGeometry(2.4, 1.8, 28, 1, true), (() => { const m = c3Prop('#e8483a', { rough: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.04); sh.position.y = -14.2; s.lampP.add(sh);
  const bulb = c3Mesh(new THREE.SphereGeometry(0.55, 12, 8), c3Flat('#fff4c8', { glow: '#ffcf80' }), 0); bulb.position.y = -14.9; s.lampP.add(bulb);
  s.lampL = new THREE.PointLight('#ffd8a0', 1.1, 34, 1.4); scene.add(s.lampL);
  // the box-bed alcove (right), a nightstand with a lamp and the old phone, a rag rug
  s.bed = new THREE.Group(); s.bed.position.set(26, 0, -6.4); scene.add(s.bed); const bw = c3Prop('#ffffff', { map: c3TexWall('wood', '#5a8ad8', { rep: [2, 1] }), rough: 0.6 });
  s.bed.add(rb(14, 2.6, 6, bw, 0, 1.3, 0, 0.05)); s.bed.add(rb(13.4, 0.8, 5.4, c3Prop('#fbf6ea', { rough: 0.8 }), 0, STG_BED - 0.4, 0, 0.03));
  s.bed.add(rb(14.4, 13, 0.6, bw, 0, 6.5, -3.2, 0.04)); for (const sx of [-1, 1]) s.bed.add(rb(0.8, 15, 6.4, bw, sx * 7.4, 7.5, 0, 0.05)); s.bed.add(rb(15.6, 1.4, 6.6, bw, 0, 15.4, 0, 0.05));
  for (const sx of [-1, 1]) s.bed.add(rb(1.1, 12, 0.4, c3Prop('#ffffff', { map: stgTexCloth(), rough: 0.9 }), sx * 7.1, 8.2, 3.3, 0.03));   // narrow, pulled wide open
  s.bed.add(rb(3.6, 1.6, 2.4, c3Prop('#ffffff', { rough: 0.8 }), -4.8, STG_BED + 0.6, -1.6, 0.04));   // pillow
  s.blanket = rb(10.6, 1.6, 4.2, c3Prop('#ffffff', { map: tex((x, w, h) => { const C = ['#e8483a', '#ffcc3a', '#3a8ee8', '#fbf6ea', '#4ab86a', '#e85aa0']; for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { x.fillStyle = C[(i * 3 + j * 5) % 6]; x.fillRect(i * w / 8, j * h / 4, w / 8, h / 4); }
    x.strokeStyle = 'rgba(60,30,20,0.45)'; x.lineWidth = 3; x.setLineDash([8, 6]); for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.stroke(); } for (let j = 1; j < 4; j++) { x.beginPath(); x.moveTo(0, j * h / 4); x.lineTo(w, j * h / 4); x.stroke(); } }, 512, 256), rough: 0.9 }), 2.0, STG_BED + 0.55, 1.2, 0.05); s.bed.add(s.blanket);   // a patchwork quilt
  s.bed.add(rb(0.6, 4.2, 5.6, c3Prop('#ffffff', { map: c3TexWall('wood', '#c8502e') }), -6.6, STG_BED + 1.6, 0, 0.04));   // headboard
  const al = new THREE.PointLight('#ffd8a0', 1.0, 22, 1.4); al.position.set(26, 11, -3.6); scene.add(al);   // a warm light inside the alcove
  s.stand = new THREE.Group(); s.stand.position.set(36, 0, -5); scene.add(s.stand); s.stand.add(rb(3.4, 4.6, 3.0, c3Prop('#c8502e'), 0, 2.3, 0, 0.04));
  s.stand.add(cyl(0.3, 0.5, 1.6, c3Prop('#f0c040'), -0.8, 5.4, 0, 0.02, 12)); const ls = c3Mesh(new THREE.CylinderGeometry(0.7, 1.1, 1.2, 18, 1, true), (() => { const m = c3Prop('#ffe8a8', { emissive: '#ffcf80', ei: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.02); ls.position.set(-0.8, 6.6, 0); s.stand.add(ls);
  const bl = new THREE.PointLight('#ffcf90', 0.9, 26, 1.5); bl.position.set(33, 8, -2); scene.add(bl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(12, 7), c3Prop('#ffffff', { map: tex((x, w, h) => { const C = ['#e8483a', '#fbf6ea', '#3a8ee8', '#ffcc3a', '#4ab86a']; for (let i = 0; i < 14; i++) { x.fillStyle = C[i % 5]; x.fillRect(0, i * h / 14, w, h / 14); } x.strokeStyle = 'rgba(60,30,20,0.35)'; x.lineWidth = 3; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(i * w / 40, 0); x.lineTo(i * w / 40, h); x.stroke(); } }, 512, 256), rough: 0.9 }));   // a striped rag rug rug.rotation.x = -Math.PI / 2; rug.position.set(24, 0.03, 2.5); scene.add(rug);
  // people
  s.meat = person(scene, 'meat'); s.meat.g.position.set(0, STG_SEAT, 0.6);
  s.sleepy = person(scene, 'sleepy');
  s.fork = forkMeat(); s.fork.scale.setScalar(1.1); s.meat.root.add(s.fork); c3Layer(s.fork, C3.L_FOCUS);
  s.fork2 = forkMeat(); s.fork2.scale.setScalar(1.1); s.sleepy.root.add(s.fork2); c3Layer(s.fork2, C3.L_FOCUS);
  s.bubWait = stgTexBubble('WAIT.'); s.bubWho = stgTexBubble('WHO GAVE YOU|THIS NUMBER?', '#e8483a');
  s.bub = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.6), new THREE.MeshBasicMaterial({ map: s.bubWait, transparent: true, depthWrite: false, toneMapped: false })); s.bub.renderOrder = 9; scene.add(s.bub);
  s.zz = stgTexBubble('Zzz', '#5a6ab8'); s.zb = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.1), new THREE.MeshBasicMaterial({ map: s.zz, transparent: true, depthWrite: false, toneMapped: false })); s.zb.renderOrder = 9; scene.add(s.zb);
  [s.table, s.chair, s.bed, s.stand, s.bub, s.zb, s.clock].forEach((o) => c3Layer(o, C3.L_FOCUS));
  s.fgBy = { glass: (() => { const g = new THREE.Group(); g.add(cyl(0.6, 0.55, 1.8, c3Prop('#f6fbff', { rough: 0.2 }), 0, 0, 0, 0.03, 16)); return g; })(), candle: (() => { const g = new THREE.Group(); g.add(cyl(0.35, 0.35, 2.2, c3Prop('#fbf3e0'), 0, 0, 0, 0.02, 12)); const f = c3Mesh(new THREE.SphereGeometry(0.3, 10, 8), c3Flat('#ffd27a', { glow: '#ffb84a' }), 0); f.scale.y = 1.6; f.position.y = 1.5; g.add(f); return g; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffeedd', mid: '#e8b880', bot: '#4a2a1a' });
  c3ShadeScene(scene, { dark: 0.25 });
  return s;
}
const stgGet = () => STG.s ||= stgBuild();
function stgWorld(s, t, o = {}) {
  s.steam.forEach((m, k) => { const q = mod(t * 0.45 + k / 3, 1); m.position.set(-9.8 + 0.2 * Math.sin(q * 6 + k), 7.0 + q * 2.4, -10); m.scale.setScalar(0.6 + q * 1.2); m.material.opacity = 0.45 * Math.sin(Math.PI * q); });
  s.lampP.rotation.set(0, 0, 0); s.lampP.position.y = o.sleepy ? 28 : 27.2; s.lampP.updateMatrixWorld(true); s.lampL.position.set(0, o.sleepy ? 12.6 : 11.8, 0.6);   // the lamp hangs higher over the pajama Swede's tall quiff
  s.snowTex.offset.set(0.05 * Math.sin(t * 0.7), t * 0.18);
  redraw(s.clockC, 'k' + (o.clock ?? '5:00'), (x, w, h) => { const [hh, mm] = (o.clock ?? '5:00').split(':').map(Number); stgDrawClock(x, w, h, hh, mm); });
  s.bub.visible = false; s.zb.visible = false; s.fork.visible = false; s.fork2.visible = false;
  [s.meat, s.sleepy].forEach((p) => { p.g.visible = true; if (p.phone) p.phone.visible = false; });
  s.sleepy.g.visible = !!o.sleepy; s.meat.g.visible = !o.sleepy;
  s.plate.userData.balls.forEach((b, i) => { b.visible = i < (o.balls ?? 11); });
}
// chewing: cheeks puffed (smug) and closed eyes alternate on a quick beat
const stgChew = (t) => (mod(t * 5, 1) < 0.5 ? 'smug' : 'closed');
// the eater's fork at his mouth or down at the plate (k 0 = plate, 1 = mouth)
function stgFork(s, p, fork, k, ball = true) { const f = fistLocal(p, 'armL'); fork.visible = true; fork.position.set(f.x - 0.1, f.y - 0.4, f.z + 0.1); fork.rotation.set(0, 0, lerp(0.15, 0.9, k)); fork.userData.ball.visible = ball; }
function stgMeatPose(s, t, o = {}) {
  c3PersonPose(s.meat, s.cam, t, Object.assign({ expr: o.expr ?? stgChew(t), gaze: o.gaze ?? [0, 0], head: o.head ?? [0, 0, 0], hand: { armR: EAR_R, armL: o.armL ?? [1.4, 1.8] } }, sitFeet(STG_SEAT), o.extra || {}));
  holdPhone(s.meat, 'armR', { color: '#e8e2d6', screen: '#8ad8ff' });
}

// =====================================================================
//  s10 — "A guy who's literally in the middle of eating meatballs.": the meatball guy at his kitchen table, phone at his
//  ear, fork with a meatball half way to his mouth, cheeks full; the camera pushes in on "literally"
// =====================================================================
const STG_K10 = [[0, [6, 11.5, 30], [0, 7.6, 1], 42], [2.28, [3, 10.5, 25], [0, 7.8, 1], 42]];
SHOT_FN['s10'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 10 }); c3SetCam(s.cam, camMove(STG_K10, lt, 's10', { orbit: -0.025, rush: 0.05 }));
  const tm = wAfter('meatballs', 12.9, 13.08), k = EZ.io(clamp((t - (tm - 0.5)) / 0.4));
  stgMeatPose(s, t, { expr: t < tm ? stgChew(t) : 'grin', gaze: [0.2, 0.1], armL: [lerp(1.6, 0.9, k), lerp(1.4, 2.6, k)] }); stgFork(s, s.meat, s.fork, k, t < tm + 0.1);
  fgPlace(s, [['glass', [-3.4, -5.4, -9], 1.0]], STG_K10, 's10', lt, { orbit: -0.025, rush: 0.05 });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.4, nearBlur: 10, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s12 — "'Why are you all so tall?'": he stands up proudly — and keeps rising onto his toes; his head bonks the hanging
//  lamp on "tall", the lamp swings, little stars spin
// =====================================================================
const STG_K12 = [[0, [7, 10, 27], [0, 8.6, 0], 44], [1.32, [5, 10.5, 25], [0, 9.2, 0], 44]];
SHOT_FN['s12'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 9 }); c3SetCam(s.cam, camMove(STG_K12, lt, 's12', { orbit: 0.03, rush: 0.04 }));
  const [a] = spanOf('s12'), tt = wAfter('tall', 15.5, 16.14), up = EZ.io(clamp((t - a) / 0.5)), toe = EZ.back(clamp((t - (tt - 0.3)) / 0.3)), hit = t > tt;
  const sw = hit ? 0.35 * Math.sin((t - tt) * 7) * Math.exp(-(t - tt) * 1.2) : 0; s.lampP.rotation.z = sw; s.lampP.updateMatrixWorld(true);
  s.meat.g.position.y = lerp(STG_SEAT, FOOT, up) + toe * 1.6;   // up on his toes, all the way to the lamp
  c3PersonPose(s.meat, s.cam, t, { expr: hit ? 'pained' : 'proud', gaze: [0, 0.6], head: [hit ? -0.12 : 0, 0, hit ? -0.15 : 0], x: hit ? ['stars'] : [],
    hand: { armR: EAR_R, armL: hit ? [0.9, 4.6] : [1.6, 0.4] }, foot: { legL: [0.5, lerp(-STG_SEAT / PK + 0.05, -2.55, up) - toe * 1.15], legR: [-0.5, lerp(-STG_SEAT / PK + 0.05, -2.55, up) - toe * 1.15] } });
  holdPhone(s.meat, 'armR', { color: '#e8e2d6' });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.4, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s13 — "'Do you really eat dinner at five?'": the clock (MIDDAG, 5:00) over the table; he points up at it, proud
//  s14 — "'Is it actually dark all winter?'": (CONTINUOUS) the camera drifts to the window: pitch-dark evening, snow,
//  a street lamp — he shrugs happily
// =====================================================================
const STG_K13 = [[0, [-5, 12.5, 31], [-3.8, 12.2, -4], 42], [1.7, [-4.4, 12.0, 28], [-3.6, 12.0, -4], 42]];
SHOT_FN['s13'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 8, clock: '5:00' }); c3SetCam(s.cam, camMove(STG_K13, lt, 's13', { orbit: 0.015, creep: 0.02, rush: 0.0 }));
  const tf = wAfter('five', 17.5, 17.76);
  s.clock.scale.setScalar(1 + 0.12 * pop(t, tf - 0.05, 0.2) * Math.exp(-Math.max(0, t - tf) * 3));
  stgMeatPose(s, t, { expr: t < tf ? stgChew(t) : 'proud', gaze: [0, 0.8], head: [0.05, 0, 0], armL: [1.4, 5.0] });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.2, glow: 0.5, glowBlur: 12 });
};
const STG_K14 = [[0, [-1, 12, 28], [7.5, 11.5, -12], 40], [1.92, [0, 11.8, 25.5], [7.8, 11.6, -12], 40]];   // far back (the glide from s13 never passes his head); he stays in frame pointing at the window
SHOT_FN['s14'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 8, clock: '5:00' }); c3SetCam(s.cam, camMove(STG_K14, lt, 's14', { orbit: -0.02, creep: 0.03, rush: 0.0 }));
  stgMeatPose(s, t, { expr: 'happy', gaze: [0.8, 0.3], head: [0.06 * Math.sin(t * 4), 0, 0], armL: [2.0, 2.4 + 0.3 * Math.sin(t * 5)] });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.2, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s15 — "Then the guy on the other end chews, swallows, and says,": he chews on "chews", a big gulp on "swallows" (the
//  meatball goes down: a bulge), and leans into the phone on "says"
//  s16 — "'Wait. Who gave you this number?'": (CONTINUOUS) push in; WAIT. pops in a bubble, then WHO GAVE YOU THIS
//  NUMBER? — suspicious squint
// =====================================================================
const STG_K15 = [[0, [-4, 11.5, 28], [0, 7.8, 1], 42], [2.52, [-2, 10.8, 24], [0, 8.0, 1], 42]];
SHOT_FN['s15'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 7 }); c3SetCam(s.cam, camMove(STG_K15, lt, 's15', { orbit: 0.02, rush: 0.0 }));
  const tc = wAfter('chews', 21, 21.38), ts = wAfter('swallows', 21.5, 21.82), ty = wAfter('says', 22.3, 22.50);
  const expr = t < tc ? 'neutral' : t < ts ? stgChew(t) : t < ty ? 'relieved' : 'thinking';
  stgMeatPose(s, t, { expr, gaze: [0, 0], head: [t > ty ? 0.1 : 0, 0, t > ts && t < ts + 0.3 ? -0.15 * Math.sin((t - ts) / 0.3 * Math.PI) : 0], armL: [1.5, 0.9] });
  fgPlace(s, [['candle', [3.4, -5.2, -9], -1.0]], STG_K15, 's15', lt, { orbit: 0.02, rush: 0.0 });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.4, nearBlur: 10, glow: 0.5, glowBlur: 12 });
};
const STG_K16 = [[0, [-2, 10.4, 20], [0, 8.4, 1], 42], [1.82, [-1, 9.8, 16], [0, 8.6, 1], 42]];
SHOT_FN['s16'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { balls: 7 }); c3SetCam(s.cam, camMove(STG_K16, lt, 's16', { orbit: 0.0, creep: 0.03, rush: 0.0 }));
  const tw = wAfter('Wait', 22.7, 22.78), th = wAfter('Who', 23, 23.20);
  stgMeatPose(s, t, { expr: t < th ? 'suspicious' : 'skeptical', gaze: [0, 0], head: [t < th ? 0.08 : -0.08, 0, 0], armL: [1.6, 0.6], extra: { x: t > th ? ['question'] : [] } });
  s.meat.g.updateMatrixWorld(true);
  const b = t < th ? s.bubWait : s.bubWho; if (s.bub.material.map !== b) { s.bub.material.map = b; s.bub.material.needsUpdate = true; }
  const k = pop(t, t < th ? tw - 0.05 : th - 0.05, 0.22); s.bub.visible = k > 0.01; s.bub.position.copy(s.meat.root.localToWorld(V3(1.7, 6.5, 0.4))); facing(s.bub, s.cam); s.bub.scale.setScalar(k * 0.52);
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.6, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s28 — "the next could get you someone who just woke up.": the box bed; the phone on the nightstand rings, the pajama
//  Swede sits up groggy (Zzz fading), nightcap askew, and answers half asleep
// =====================================================================
const STG_K28 = [[0, [20, 10, 22], [27, 7.5, -4], 42], [2.46, [22, 9.6, 18.5], [27, 7.6, -4], 42]];
SHOT_FN['s28'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { sleepy: true }); c3SetCam(s.cam, camMove(STG_K28, lt, 's28', { orbit: -0.02, rush: 0.05 }));
  const tw = wAfter('woke', 47, 47.28), sit = EZ.io(clamp((t - (tw - 0.9)) / 0.5));
  s.sleepy.g.position.set(27, STG_BED - 1.2 + 1.2 * sit, -6.2); s.sleepy.g.rotation.z = 0;
  c3PersonPose(s.sleepy, s.cam, t, { expr: t < tw - 0.9 ? 'sleepy' : t < tw ? 'tired' : 'half', gaze: [0.2, -0.1], head: [0.18 - 0.1 * sit, 0, -0.1], lean: 0.25 * (1 - sit),
    hand: { armR: EAR_R, armL: [1.5, -0.2] }, foot: { legL: [0.9, -0.6], legR: [-0.9, -0.6] } });
  holdPhone(s.sleepy, 'armR', { color: '#2a2e3a' });
  s.zb.visible = t < tw + 0.3; if (s.zb.visible) { s.zb.position.set(30.5, 12 + 0.4 * Math.sin(t * 2), -5.6); facing(s.zb, s.cam); s.zb.scale.setScalar(clamp(1 - (t - (tw - 0.4)) / 0.6)); }
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.4, glow: 0.5, glowBlur: 12 });
};
// =====================================================================
//  s32 — "came from someone in pajamas who just wanted to finish their meatballs.": the pajama Swede at the kitchen
//  table, phone at his ear, staring at the last meatballs; on "finish" he stabs one, on "meatballs" it goes in — a
//  happy, full-cheeked grin; the camera eases out (the last frame leads back into the globe of s01)
// =====================================================================
const STG_K32 = [[0, [-3, 10.2, 21], [0, 8.0, 1], 42], [3.96, [3, 11.5, 29], [0, 7.6, 1], 42]];
SHOT_FN['s32'] = (t, u, lt) => {
  const s = stgGet(); stgWorld(s, t, { sleepy: true, balls: 3 }); c3SetCam(s.cam, camMove(STG_K32, lt, 's32', { orbit: -0.015, creep: 0.0, rush: 0.0 }));
  s.sleepy.g.position.set(0, STG_SEAT, 0.6);
  const tf = wAfter('finish', 59.8, 59.98), tm = wAfter('meatballs', 60, 60.48), k = EZ.io(clamp((t - tf) / 0.35)) * (1 - EZ.io(clamp((t - tm) / 0.3))) + EZ.io(clamp((t - (tm - 0.2)) / 0.25)) * (t > tm - 0.2 ? 1 : 0);
  const m = clamp(k);
  c3PersonPose(s.sleepy, s.cam, t, { expr: t < tf ? 'tired' : t < tm + 0.05 ? 'determined' : stgChew(t * 0.7) === 'smug' ? 'happy' : 'smug', gaze: t < tf ? [0, -0.6] : [0, 0], head: [0, 0, 0],
    hand: { armR: EAR_R, armL: [lerp(1.6, 0.9, m), lerp(1.3, 2.6, m)] }, ...sitFeet(STG_SEAT) });
  holdPhone(s.sleepy, 'armR', { color: '#2a2e3a' }); stgFork(s, s.sleepy, s.fork2, m, t > tf && t < tm + 0.15);
  s.plate.userData.balls.forEach((b, i) => { b.visible = i < (t > tf ? 2 : 3); });
  fgPlace(s, [['candle', [-3.6, -4.2, -10], 0.8]], STG_K32, 's32', lt, { orbit: -0.015, creep: 0.0, rush: 0.0 });
  c3Render(s.scene, s.cam, { bg: '#ffc23a', bgBlur: 1.4, nearBlur: 10, glow: 0.5, glowBlur: 12 });
};

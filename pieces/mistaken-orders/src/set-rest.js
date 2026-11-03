// =====================================================================
//  SET rest — the little Tokyo restaurant (the 2017 pop-up): warm orange plaster over a dark wood wainscot, ceiling
//  beams with red paper lanterns, the kitchen pass on the back wall (lit kitchen, ticket rail above), the big sign
//  WE MIGHT GET YOUR ORDER WRONG, the wall clock + chalk menu, windows onto the dusk alley (left wall), the sliding
//  door with a noren + the HAPPY? smiley board (right wall), six two-seat tables. Registers SHOT_FN s02-s11, s13,
//  s18-s26. Prefix rs. Back wall z = 0, front z = 64, x -36..36.
// =====================================================================
const RS = {};
const RS_X = 36, RS_Z = 64, RS_H = 26, RS_SIT = 2.7, RS_SEAT = 3.5;
const RS_TABLE = { T1: [0, 28], T2: [16, 28], T3: [-16, 28], T4: [-25, 46], T5: [25, 14], T6: [-20, 12] };
// who sits where: [table, side (+1 = screen-right seat), cast key]
const RS_SITTERS = [['T1', 1, 'you'], ['T2', -1, 'coffee'], ['T3', 1, 'd1'], ['T3', -1, 'd2'], ['T4', 1, 'd3'], ['T4', -1, 'd4'], ['T5', 1, 'd5'], ['T5', -1, 'd6'], ['T6', 1, 'd7'], ['T6', -1, 'd8']];
const rsSeat = (tk, side) => { const [cx, cz] = RS_TABLE[tk]; return [cx + side * RS_SEAT, cz]; };
const RS_STOOL = [7.8, 28.6];   // the waitress's stool, next to you (s11)

function rsTexWall() { const t = tex((g, w, h) => { const r = RNG('rswall'), wain = h * 0.62; g.fillStyle = '#ec8f3a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r.f() > 0.5 ? '255,240,200' : '160,70,20'},0.08)`; g.beginPath(); g.ellipse(r.f() * w, r.f() * wain, 30 + r.f() * 60, 20 + r.f() * 40, 0, 0, 7); g.fill(); }
  g.fillStyle = '#7a3f22'; g.fillRect(0, wain, w, h - wain); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, wain, 3, h - wain); }
  g.fillStyle = '#5a2a14'; g.fillRect(0, wain - 12, w, 16); g.fillStyle = '#140e10'; g.fillRect(0, wain + 3, w, 3); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function rsTexKitchen() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(1, '#f0b860'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8dee6'; for (let i = 0; i < 8; i++) g.fillRect(i * w / 8 + 4, 10, w / 8 - 8, 46);   // tiles
  g.fillStyle = '#9aa4ae'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#5a6068'; g.fillRect(0, h * 0.62, w, 8);
  for (const [x, c] of [[80, '#c8323a'], [200, '#3a3a40'], [330, '#c8323a'], [450, '#3a3a40']]) { g.fillStyle = c; g.beginPath(); g.roundRect(x - 40, h * 0.42, 80, 50, 10); g.fill(); g.fillStyle = '#140e10'; g.fillRect(x - 46, h * 0.42, 92, 8); }
  g.fillStyle = 'rgba(255,255,255,0.6)'; for (const x of [80, 330]) { g.beginPath(); g.ellipse(x, h * 0.3, 22, 30, 0, 0, 7); g.ellipse(x + 14, h * 0.18, 16, 22, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#140e10'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 512, 256); }
function rsTexSign() { return tex((g, w, h) => { g.fillStyle = '#5a2a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff3d6'; g.beginPath(); g.roundRect(18, 18, w - 36, h - 36, 24); g.fill();
  g.lineWidth = 8; g.strokeStyle = '#140e10'; g.stroke();
  g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(120, h / 2, 74, 0, TAU); g.fill(); g.lineWidth = 7; g.stroke();   // our own logo: a winking plate-face with its tongue out
  g.fillStyle = '#140e10'; g.beginPath(); g.arc(96, h / 2 - 16, 9, 0, TAU); g.fill(); g.lineWidth = 7; g.beginPath(); g.moveTo(132, h / 2 - 16); g.lineTo(156, h / 2 - 18); g.stroke();
  g.beginPath(); g.arc(120, h / 2 + 8, 34, 0.15, Math.PI - 0.15); g.stroke(); g.fillStyle = '#e8484a'; g.beginPath(); g.ellipse(132, h / 2 + 46, 15, 19, 0, 0, TAU); g.fill(); g.stroke();
  inked(g, 'WE MIGHT GET', 590, h * 0.36, 66, '#c8323a', { stroke: false, maxW: 640 }); inked(g, 'YOUR ORDER WRONG', 590, h * 0.66, 66, '#c8323a', { stroke: false, maxW: 680 }); }, 1024, 340); }
function rsTexWindow() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a3a8a'); gr.addColorStop(0.6, '#c8709a'); gr.addColorStop(1, '#f6a070'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a40'; g.fillRect(0, h * 0.45, w * 0.4, h); g.fillRect(w * 0.55, h * 0.35, w * 0.45, h); g.fillStyle = '#ffd890'; for (const [x, y] of [[40, 150], [90, 150], [330, 130], [400, 170], [450, 130]]) g.fillRect(x, y, 26, 30);
  for (const x of [120, 230, 350]) { g.fillStyle = '#e8322a'; g.beginPath(); g.ellipse(x, 70, 18, 24, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#5a2a14'; for (let x = 0; x < w; x += w / 4) g.fillRect(x, 0, 10, h); g.fillRect(0, h / 2 - 5, w, 10); g.strokeStyle = '#140e10'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, 512, 256); }
function rsTexNoren(txt = '食') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = '#23356a'; g.fillRect(i * w / 4 + 3, 0, w / 4 - 6, h); }
  g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(w / 2, h * 0.45, h * 0.22, 0, TAU); g.fill(); if (txt) inked(g, txt, w / 2, h * 0.47, h * 0.18, '#23356a', { stroke: false }); }, 512, 320); }
function rsTexLantern() { return tex((g, w, h) => { g.fillStyle = '#e8322a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,10,10,0.45)'; g.lineWidth = 3; for (let y = 6; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#140e10'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); }, 128, 128); }
// the wall clock (minute hand angle in turns, 0 = 12 o'clock)
function rsDrawClock(g, w, h, m) { g.clearRect(0, 0, w, h); g.fillStyle = '#fff8e8'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, TAU); g.fill(); g.lineWidth = 16; g.strokeStyle = '#5a2a14'; g.stroke();
  g.fillStyle = '#140e10'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.save(); g.translate(w / 2 + Math.sin(a) * w * 0.36, h / 2 - Math.cos(a) * w * 0.36); g.rotate(a); g.fillRect(-4, -12, 8, 24); g.restore(); }
  const hand = (a, len, lw) => { g.lineCap = 'round'; g.lineWidth = lw; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.sin(a) * len, h / 2 - Math.cos(a) * len); g.stroke(); };
  g.strokeStyle = '#140e10'; hand((7 + m / 12) / 12 * TAU, w * 0.22, 14); g.strokeStyle = '#c8323a'; hand(m * TAU, w * 0.34, 9); g.fillStyle = '#140e10'; g.beginPath(); g.arc(w / 2, h / 2, 12, 0, TAU); g.fill(); }
// the chalk menu (the 'MISTAKES' line is chalked in letter by letter, k 0..1)
function rsDrawMenu(g, w, h, k) { g.fillStyle = '#5a2a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#24382e'; g.fillRect(22, 22, w - 44, h - 44);
  inked(g, 'MENU', w / 2, 96, 84, '#fff3d6', { stroke: false });
  [['BURGER', '¥800'], ['CURRY', '¥700'], ['GYOZA', '¥500'], ['COFFEE', '¥300']].forEach(([a, b], i) => { inked(g, a, 70, 210 + i * 92, 54, '#f6ecd2', { stroke: false, align: 'left' }); inked(g, b, w - 70, 210 + i * 92, 54, '#ffd890', { stroke: false, align: 'right' }); });
  if (k > 0) { const txt = 'MISTAKES', n = Math.ceil(txt.length * Math.min(1, k)); inked(g, txt.slice(0, n), 70, 590, 64, '#ff9ab0', { stroke: false, align: 'left' });
    if (k >= 1) inked(g, 'FREE!', w - 70, 590, 64, '#ffe23a', { stroke: false, align: 'right' }); if (k >= 1) { g.strokeStyle = '#ff9ab0'; g.lineWidth = 6; g.beginPath(); g.ellipse(w / 2, 590, w * 0.44, 50, 0, 0, TAU); g.stroke(); } } }
// the ticket rail: 8 order tickets, n of them stamped OOPS, the 37% tag when tag is true
function rsDrawTickets(g, w, h, n, tag) { g.clearRect(0, 0, w, h); g.fillStyle = '#c8d0d8'; g.fillRect(0, 26, w, 22); g.fillStyle = '#140e10'; g.fillRect(0, 46, w, 4);
  const R0 = RNG('rstk'), dish = ['BURGER', 'COFFEE', 'GYOZA', 'CURRY', 'BURGER', 'TEA', 'GYOZA', 'COFFEE'], oops = [1, 4, 6];
  for (let i = 0; i < 8; i++) { const x = 20 + i * (w - 40) / 8, tw = (w - 40) / 8 - 16; g.save(); g.translate(x + tw / 2, 40); g.rotate(R0.r(-0.05, 0.05));
    g.fillStyle = '#fffaf0'; g.fillRect(-tw / 2, 0, tw, h * 0.78); g.lineWidth = 5; g.strokeStyle = '#2a1208'; g.strokeRect(-tw / 2, 0, tw, h * 0.78);
    g.fillStyle = '#e0b03c'; g.fillRect(-14, -6, 28, 22); inked(g, '#' + (11 + i), 0, 60, 34, '#2a1208', { stroke: false }); inked(g, dish[i], 0, 120, 30, '#2a1208', { stroke: false, maxW: tw - 16 });
    g.fillStyle = 'rgba(40,30,20,0.4)'; for (let k = 0; k < 4; k++) g.fillRect(-tw / 2 + 14, 160 + k * 30, tw * R0.r(0.4, 0.8), 5);
    const j = oops.indexOf(i); if (j >= 0 && j < n) { g.rotate(-0.3); g.strokeStyle = '#d23b3b'; g.lineWidth = 8; g.strokeRect(-tw * 0.46, 170, tw * 0.92, 66); inked(g, 'OOPS', 0, 204, 44, '#d23b3b', { stroke: false, maxW: tw * 0.8 }); }
    g.restore(); }
  if (tag) { g.save(); g.translate(w / 2, h * 0.62); g.rotate(-0.08); g.fillStyle = '#ffe23a'; g.beginPath(); g.roundRect(-190, -70, 380, 140, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
    inked(g, '37% WRONG', 0, 4, 74, '#d23b3b', { stroke: false, maxW: 340 }); g.restore(); } }
// the HAPPY? board by the door: smileys tallied, 99% at the end
function rsDrawHappy(g, w, h, n, pct) { g.fillStyle = '#5a2a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#24382e'; g.fillRect(18, 18, w - 36, h - 36); inked(g, 'HAPPY?', w / 2, 80, 70, '#fff3d6', { stroke: false });
  for (let i = 0; i < n; i++) { const x = 70 + (i % 5) * 86, y = 180 + Math.floor(i / 5) * 90, sad = i === 13; g.strokeStyle = sad ? '#9ad0ff' : '#ffe23a'; g.lineWidth = 6;
    g.beginPath(); g.arc(x, y, 30, 0, TAU); g.stroke(); g.beginPath(); sad ? g.arc(x, y + 20, 14, Math.PI + 0.4, -0.4) : g.arc(x, y + 2, 16, 0.3, Math.PI - 0.3); g.stroke();
    g.fillStyle = g.strokeStyle; g.fillRect(x - 12, y - 10, 6, 8); g.fillRect(x + 6, y - 10, 6, 8); }
  if (pct) inked(g, '99%', w / 2, h - 90, 110, '#ffe23a', { stroke: '#140e10', sw: 10 }); }

function rsBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.6, sky: '#ffe8c8', ground: '#5a3a2a', key: '#fff0d8', keyI: 1.1, keyP: [-60, 50, 60], rim: '#ffc890', rimI: 0.45, rimP: [60, 30, -20] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = rsTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * RS_X, RS_Z), c3Prop('#ffffff', { map: c3TexWall('wood', '#b8683a', { rep: [8, 7] }), rough: 0.55, env: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.z = RS_Z / 2; scene.add(fl);
  scene.add(plNC(2 * RS_X, RS_H, wallM(6), 0, RS_H / 2, 0));
  scene.add(plNC(RS_Z, RS_H, wallM(5), -RS_X, RS_H / 2, RS_Z / 2, Math.PI / 2)); scene.add(plNC(RS_Z, RS_H, wallM(5), RS_X, RS_H / 2, RS_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * RS_X, RS_H, wallM(6), 0, RS_H / 2, RS_Z, Math.PI));
  scene.add(plNC(2 * RS_X, RS_Z, c3Prop('#c8884a', { rough: 0.9 }), 0, RS_H, RS_Z / 2, 0, Math.PI / 2));
  const dk = c3Prop('#5a2a14', { rough: 0.7 }), wood = c3Prop('#9a5a30', { rough: 0.6 }), red = c3Prop('#e8322a', { rough: 0.5 });
  for (let z = 8; z < RS_Z; z += 12) scene.add(rbNC(2 * RS_X, 1.4, 1.2, dk, 0, RS_H - 0.7, z, 0.02));   // ceiling beams
  // the kitchen pass (back wall): lit kitchen, a counter ledge with a bell + plates waiting, the ticket rail above
  scene.add(pl(14, 6, c3Flat('#ffffff', { map: rsTexKitchen() }), -8, 9, 0.15));
  scene.add(rb(15.5, 0.6, 2.4, wood, -8, 6.1, 1.1, 0.02)); scene.add(rb(15.5, 0.8, 0.6, dk, -8, 12.2, 0.4, 0.02));
  for (const x of [-15.6, -0.4]) scene.add(rb(0.8, 7, 0.8, dk, x, 9, 0.4, 0.02));
  { const b = c3Mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, TAU, 0, 1.6), c3Prop('#c9a040', { metal: 0.6, rough: 0.3 }), 0.01); b.position.set(-2.4, 6.4, 1.4); scene.add(b); }
  for (const x of [-12, -9.5]) { const p = gyozaPlate(5); p.position.set(x, 6.4, 1.3); scene.add(p); }
  { const p = burgerPlate(); p.position.set(-6, 6.4, 1.3); scene.add(p); }
  s.tk = canvasTex(1600, 420); s.tkM = pl(15, 3.94, new THREE.MeshBasicMaterial({ map: s.tk.t, transparent: true, toneMapped: false }), -8, 15.0, 0.35); scene.add(s.tkM);
  redraw(s.tk, '0|0', (g, w, h) => rsDrawTickets(g, w, h, 0, false));
  // the big sign, clock + chalk menu, shelves of teapots and sake bottles
  scene.add(rb(19, 6.6, 0.5, dk, 14, 16.5, 0.25, 0.02)); s.signM = pl(18, 6, c3Flat('#ffffff', { map: rsTexSign() }), 14, 16.5, 0.55); scene.add(s.signM);
  s.clk = canvasTex(512, 512); s.clkM = pl(6, 6, new THREE.MeshBasicMaterial({ map: s.clk.t, transparent: true, toneMapped: false }), -26, 19.5, 0.3); scene.add(s.clkM);
  s.menu = canvasTex(700, 700); s.menuM = pl(8, 8, c3Flat('#ffffff', { map: s.menu.t }), -26, 10, 0.3); scene.add(s.menuM);
  for (const [x, y] of [[26, 9.5], [26, 6.5]]) { scene.add(rb(14, 0.35, 1.6, wood, x, y, 0.8, 0.01));
    for (let i = 0; i < 6; i++) { const c = ['#2f8a6a', '#3f6fb5', '#fff3d6', '#c8323a', '#e0b03c', '#2a2a30'][(i + y) % 6];
      if (i % 2) { scene.add(cyl(0.45, 0.55, 1.1, c3Prop(c), x - 5.5 + i * 2.2, y + 0.75, 0.8, 0.01, 12)); } else { scene.add(cyl(0.3, 0.38, 1.9, c3Prop(c, { rough: 0.25 }), x - 5.5 + i * 2.2, y + 1.1, 0.8, 0.01, 10)); scene.add(cyl(0.12, 0.12, 0.6, c3Prop(c), x - 5.5 + i * 2.2, y + 2.3, 0.8, 0.005, 6)); } } }
  // left wall: dusk windows onto the alley; right wall: the sliding door + noren, the HAPPY? board
  const win = c3Flat('#ffffff', { map: rsTexWindow() });
  for (const z of [16, 34, 52]) { scene.add(pl(12, 6, win, -RS_X + 0.1, 12, z, Math.PI / 2)); scene.add(rb(0.8, 0.4, 13, wood, -RS_X + 0.5, 8.8, z, 0.01)); }
  scene.add(rb(0.5, 12, 9, c3Prop('#c89a60', { rough: 0.6 }), RS_X - 0.3, 6, 50, 0.02)); scene.add(pl(8.6, 11, c3Flat('#ffffff', { map: rsTexWindow() }), RS_X - 0.6, 6.5, 50, -Math.PI / 2));
  scene.add(pl(9, 4.2, new THREE.MeshBasicMaterial({ map: rsTexNoren(), transparent: true, side: THREE.DoubleSide }), RS_X - 0.9, 10.3, 50, -Math.PI / 2));
  s.hap = canvasTex(512, 640); s.hapM = pl(6, 7.5, c3Flat('#ffffff', { map: s.hap.t }), RS_X - 0.3, 9.5, 42, -Math.PI / 2); scene.add(s.hapM);
  redraw(s.hap, '0|0', (g, w, h) => rsDrawHappy(g, w, h, 0, false));
  // red paper lanterns under the beams (each lights the room a little)
  const lantM = c3Prop('#ffffff', { map: rsTexLantern(), emissive: '#ff6a3a', ei: 0.55, glow: '#ff8a5a', rough: 0.6 });
  for (const [x, z] of [[-24, 20], [-8, 20], [8, 20], [24, 20], [-16, 40], [0, 40], [16, 40]]) { scene.add(cyl(0.05, 0.05, 4, dk, x, RS_H - 2.5, z, 0, 4));
    const l = c3Mesh(new THREE.SphereGeometry(1.3, 16, 12), lantM, 0.02); l.scale.y = 1.25; l.position.set(x, RS_H - 5.5, z); scene.add(l);
    const pt = new THREE.PointLight('#ffb070', 0.3, 26, 1.6); pt.position.set(x, RS_H - 7, z); scene.add(pt); }
  for (const [x, z] of [[-33, 4], [33, 60], [-33, 60]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.2, 0.9, 2.2, c3Prop('#2f3f6a'), 0, 1.1, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.ConeGeometry(0.4, 5, 6), c3Prop(i % 2 ? '#5ea64a' : '#4f9a44', { rough: 0.8 }), 0.01); lf.position.set(Math.sin(a) * 0.7, 4.4, Math.cos(a) * 0.7); lf.rotation.set(0.4 * Math.cos(a), 0, -0.4 * Math.sin(a)); g.add(lf); } }
  // ---- the FOCUS layer: tables + chairs (so they occlude the people behind them), the waitress's stool, food
  const F = new THREE.Group(); scene.add(F);
  const top = c3Prop('#c8884a', { rough: 0.45 }), cloth = c3Prop('#ffffff', { map: texCheck('#e8484a', 2), rough: 0.7 }), chairM = c3Prop('#3a6a8a', { rough: 0.6 });
  s.food = {};
  for (const [tk, [cx, cz]] of Object.entries(RS_TABLE)) {
    F.add(rb(4.5, 0.3, 5, top, cx, 3.75, cz, 0.02)); F.add(rb(3.6, 0.04, 4.2, cloth, cx, 3.92, cz, 0.004)); F.add(rb(4, 0.7, 4.5, wood, cx, 3.25, cz, 0.015));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.add(rb(0.45, 3.6, 0.45, dk, cx + sx * 1.85, 1.8, cz + sz * 2, 0.01));
    for (const side of [-1, 1]) { const x = cx + side * RS_SEAT; F.add(rb(2.3, 0.3, 2.3, chairM, x, 2.25, cz, 0.015)); F.add(rb(2.3, 2.6, 0.3, chairM, x, 3.6, cz - 1.1, 0.015));
      for (const lx of [-1, 1]) for (const lz of [-1, 1]) F.add(rb(0.28, 2.1, 0.28, dk, x + lx * 0.95, 1.05, cz + lz * 0.95, 0.005)); }
    F.add(cyl(0.18, 0.18, 0.5, c3Prop('#c8323a'), cx - 1.2, 4.2, cz - 1.5, 0.005, 8)); F.add(cyl(0.18, 0.18, 0.5, c3Prop('#fff3d6'), cx - 0.7, 4.2, cz - 1.6, 0.005, 8));   // soy + salt
    if (tk !== 'T1' && tk !== 'T2') { const p = [gyozaPlate(6), burgerPlate(), gyozaPlate(4)][Object.keys(RS_TABLE).indexOf(tk) % 3]; p.position.set(cx + 1.2, 3.95, cz + 0.6); F.add(p); const c = cupMesh(); c.position.set(cx - 1.3, 3.95, cz + 0.8); F.add(c); } }
  F.add(cyl(1.1, 1.0, 0.3, c3Prop('#e0b03c'), RS_STOOL[0], 2.25, RS_STOOL[1], 0.015, 16)); for (const a of [0, 2.1, 4.2]) F.add(rb(0.25, 2.1, 0.25, dk, RS_STOOL[0] + Math.cos(a) * 0.7, 1.05, RS_STOOL[1] + Math.sin(a) * 0.7, 0.005));
  s.food.plate = gyozaPlate(6); F.add(s.food.plate);                         // YOUR dumplings (s05 on)
  s.food.saucer = cupMesh(false); s.food.saucer.position.set(14.6, 3.95, 28.8); F.add(s.food.saucer);   // the coffee guy's empty saucer
  s.food.straws = [strawMesh('#e8322a'), strawMesh('#3f9adf')]; s.food.straws.forEach((m) => F.add(m));
  s.food.spoon = spoonMesh(); F.add(s.food.spoon);
  s.food.burger = burgerPlate(); F.add(s.food.burger);                       // the tag: the burger lands on HIS table
  c3Layer(F, C3.L_FOCUS);
  // ---- people + overlays
  s.p = {};
  for (const [tk, side, who] of RS_SITTERS) { const [x, z] = rsSeat(tk, side); const p = person(scene, who); p.g.position.set(x, RS_SIT, z); s.p[who] = p; }
  for (const w of ['wait', 'wait2', 'wait3']) s.p[w] = person(scene, w);
  s.cloudB = spritePlane(scene, texCloud('img_burger.jpg'), 5, 5); s.cloudC = spritePlane(scene, texCloud('img_coffee.jpg'), 5, 5);
  s.say1 = spritePlane(scene, texSay('WHERE ARE', 'YOU FROM?'), 5.6, 3.5); s.say2 = spritePlane(scene, texSay('WHERE ARE', 'YOU FROM?', true), 5.6, 3.5);   // tails point down at her
  s.thanks = [0, 1, 2, 3, 4, 5].map((i) => spritePlane(scene, texSay(['THANK YOU!', 'THANKS!', 'ARIGATO!'][i % 3]), 4.4, 2.75));
  s.noX = spritePlane(scene, texXStamp(), 1.6, 1.6); s.burst = spritePlane(scene, texBurst('OOPS'), 4, 4);
  s.steam = [0, 1, 2].map(() => spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2, h - 10); g.bezierCurveTo(w * 0.1, h * 0.65, w * 0.9, h * 0.35, w / 2, 10); g.stroke(); }, 128, 256), 0.6, 1.2));
  c3Env(scene, { top: '#ffe8c8', mid: '#e0884a', bot: '#3a2418' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const rsGet = () => RS.s ||= rsBuild();
function rsReset(s, t) {
  for (const [, , who] of RS_SITTERS) s.p[who].g.visible = true;
  for (const w of ['wait', 'wait2', 'wait3']) { s.p[w].g.visible = false; hideHeld(s.p[w]); }
  hideHeld(s.p.you); hideHeld(s.p.coffee);
  [s.cloudB, s.cloudC, s.say1, s.say2, s.noX, s.burst, ...s.thanks, ...s.steam].forEach((m) => { m.visible = false; });
  // your plate is on the table from the moment it lands (s05, 6.84 s); the coffee guy's straws + spoon from s09
  const pl0 = t >= 6.84; s.food.plate.visible = pl0; if (pl0) s.food.plate.position.set(1.4, 3.95, 28.6);
  const st = [15.4, 15.62], sp = 16.22;
  s.food.straws.forEach((m, i) => { const k = t < st[i] ? 0 : EZ.o3(clamp((t - st[i]) / 0.18)); m.visible = k > 0; m.position.set(15.0 + i * 0.25, lerp(7, 4.0, k), 27.6 + i * 0.5); m.rotation.set(0, 0.2 + i * 0.5, Math.PI / 2); });
  { const k = t < sp ? 0 : EZ.o3(clamp((t - sp) / 0.18)); s.food.spoon.visible = k > 0; s.food.spoon.position.set(15.8, lerp(7, 4.0, k), 29.4); s.food.spoon.rotation.y = -0.6; }
  s.food.burger.visible = false;
  redraw(s.clk, 'm' + Math.round(clamp((t - 5.3) / 0.9) * 40), (g, w, h) => rsDrawClock(g, w, h, Math.round(clamp((t - 5.3) / 0.9) * 40) / 40 * (10 / 60) + 0.05));
  redraw(s.menu, 'k' + Math.round(clamp((t - 38.9) / 0.9) * 8) / 8, (g, w, h) => rsDrawMenu(g, w, h, Math.round(clamp((t - 38.9) / 0.9) * 8) / 8));
  { const n = [41.08, 41.56, 41.9].filter((x) => t >= x).length, tag = t >= 42.26; redraw(s.tk, `${n}|${tag}`, (g, w, h) => rsDrawTickets(g, w, h, n, tag)); }
  { const n = Math.round(clamp((t - 42.8) / 1.0) * 15), pct = t >= 43.82; redraw(s.hap, `${n}|${pct}`, (g, w, h) => rsDrawHappy(g, w, h, n, pct)); }
}
// everybody at the tables: chatting pairs; o.expr / o.hand / o.lean override per person
const RS_EXPR = { you: 'happy', coffee: 'happy', d1: 'talking', d2: 'happy', d3: 'happy', d4: 'talking', d5: 'talking', d6: 'happy', d7: 'happy', d8: 'talking' };
function rsSitters(s, t, o = {}) {
  for (const [tk, side, who] of RS_SITTERS) { const p = s.p[who]; if (!p.g.visible) continue;
    const talk = Math.sin(t * 2.1 + who.length * 1.3 + side) > 0.25;
    c3PersonPose(p, s.cam, t, { expr: (o.expr && o.expr[who]) || (who.length < 3 && talk ? 'talking' : RS_EXPR[who]), gaze: [-side * 0.8, 0.05], lean: (o.lean && o.lean[who]) || 0,
      hand: (o.hand && o.hand[who]) || { armL: [1.5, 1.6], armR: [-1.5, 1.6] }, ...sitFeet(RS_SIT) }); }
}
const rsRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#ec8f3a', bgBlur: 1.0, glow: 0.45, glowBlur: 12 }, o));
const RS_CM = { orbit: 0.006, creep: 0, rush: 0.03 };
const K1r = (p, l, fov) => [[0, p, l, fov], [9, p, l, fov]];
// every shot pushes in (review: no static holds): the second key is `push` of the way toward the look point
const rsCam = (s, id, lt, p, l, fov, o = {}) => { const q = p.map((v, j) => v + (l[j] - v) * (o.push ?? 0.14));
  c3SetCam(s.cam, camMove([[0, p, l, fov], [spanOf(id)[1] - spanOf(id)[0] + 0.4, q, l, fov]], lt, id, Object.assign({}, RS_CM, o))); };
// the waitress standing at (x, z), notepad in her left fist, pencil in her right
function rsWaitress(s, t, x, z, o = {}) { const w = s.p.wait; w.g.visible = true; w.g.position.set(x, o.y ?? FOOT, z);
  c3PersonPose(w, s.cam, t, Object.assign({ expr: 'happy', gaze: [-0.6, -0.1], hand: { armL: [1.1, 2.3], armR: [-1.3, 2.1] } }, o.sit ? sitFeet(RS_SIT) : o.walk ? walkFeet(t * 10) : STAND, o.pose || {}));
  if (o.pad) { holdProp(w, 'pad', 'armL', () => rb(1.0, 1.3, 0.06, moM('pad', '#fffaf0'), 0, 0, 0, 0.01), { dy: 0.4, rz: 0.15 });
    holdProp(w, 'pen', 'armR', () => cyl(0.06, 0.06, 1.2, moM('pen', '#e0b03c'), 0, 0, 0, 0.008, 6), { dy: 0.45, rz: -0.6 + (o.write ? 0.25 * Math.sin(t * 30) : 0) }); }
  return w; }
const popAt = (m, k, pos, cam, sc = 1) => { m.visible = k > 0.01; if (!m.visible) return; m.position.set(...pos); facing(m, cam); m.scale.setScalar(k * sc); };

// ---- s02: you at your table, the waitress takes the order; the burger photo pops in your thought cloud on "burger"
SHOT_FN['s02'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's02', lt, [5.5, 9, 47], [4.8, 6.8, 28], 42);
  rsSitters(s, t, { expr: { you: t > 2.6 ? 'excited' : 'talking' }, hand: { you: { armL: [1.4, 2.2], armR: [-1.6, 2.6] } } });
  rsWaitress(s, t, 7.8, 31.5, { pad: true, write: t > 2.6 });
  popAt(s.cloudB, pop(t, 2.6, 0.25), [2.0, 12.6, 28.4], s.cam);
  rsRender(s); };
// ---- s03: her smile, the pencil scribbling ("writes it down")
SHOT_FN['s03'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's03', lt, [8.6, 9.4, 42], [7.6, 8.4, 31.5], 34);
  rsSitters(s, t); rsWaitress(s, t, 7.8, 31.5, { pad: true, write: t > 4.26, pose: { expr: t < 4.2 ? 'smile' : 'happy', gaze: [0, -0.35] } }); rsRender(s); };
// ---- s04: the wall clock — the minute hand sweeps ten minutes
SHOT_FN['s04'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's04', lt, [-25, 17, 11], [-26, 18.4, 0], 38, { creep: 0.02 }); rsSitters(s, t); rsRender(s, { bgBlur: 0.6 }); };
// ---- s05: the plate of dumplings lands in front of you (kick on "plate"), steam curls up
SHOT_FN['s05'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's05', lt, [3.6, 9.4, 36], [1.4, 4.4, 28.6], 40);
  rsSitters(s, t, { expr: { you: t > 6.9 ? 'confused' : 'happy' } });
  const k = EZ.o3(clamp((t - 6.5) / 0.34)); s.food.plate.visible = true; s.food.plate.position.set(lerp(5, 1.4, k), lerp(6.5, 3.95, k), 28.6);
  const w = rsWaitress(s, t, 6.6, 30.5, { pose: { gaze: [-0.7, -0.4], hand: { armL: [1.4, 1.6], armR: [lerp(-1.6, -2.6, k), lerp(3.0, 1.9, k)] } } });
  s.steam.forEach((m, i) => { const a = t * 0.8 + i / 3, ph = a % 1; m.visible = t > 6.9; if (!m.visible) return; m.position.set(1.4 - 0.4 + i * 0.4, 4.6 + ph * 1.4, 28.6); facing(m, s.cam); m.material.opacity = Math.sin(ph * Math.PI) * 0.9; });
  rsRender(s); };
// ---- s06: you look up to complain: finger up, mouth open
SHOT_FN['s06'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's06', lt, [5.2, 8.6, 41], [3.6, 7.4, 28], 38);
  const up = t > 8.9; rsSitters(s, t, { expr: { you: up ? 'angry' : 'confused' }, hand: { you: up ? { armL: [1.4, 1.8], armR: [-1.6, 4.6] } : { armL: [1.4, 1.8], armR: [-1.4, 1.8] } } });
  rsRender(s); };
// ---- s07: (long take from s06) the camera follows your look up to the sign; it wobbles on "wrong"
SHOT_FN['s07'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's07', lt, [7.5, 11, 42], [13, 15.4, 0], 44);
  rsSitters(s, t, { expr: { you: 'shocked' } });
  const wob = t > 12.4 && t < 12.9 ? Math.sin((t - 12.4) * 40) * 0.03 * (1 - (t - 12.4) / 0.5) : 0; s.signM.rotation.z = wob;
  rsRender(s); s.signM.rotation.z = 0; };
// ---- s08: the coffee guy at the next table; the coffee photo pops in his cloud on "coffee"
SHOT_FN['s08'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's08', lt, [14.5, 9, 45], [13.6, 7, 28], 40);
  rsSitters(s, t, { expr: { coffee: t > 14.3 ? 'excited' : 'happy' }, hand: { coffee: { armL: [1.6, 2.6], armR: [-1.4, 1.8] } } });
  const w = s.p.wait2; w.g.visible = true; w.g.position.set(18, FOOT, 31); c3PersonPose(w, s.cam, t, { expr: 'happy', gaze: [-0.6, 0], ...STAND });
  popAt(s.cloudC, pop(t, 14.42, 0.25), [11.0, 12.6, 28.4], s.cam);
  rsRender(s); };
// ---- s09: his table top: straw, straw, spoon drop in; on "no coffee" a red X over the empty saucer
SHOT_FN['s09'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's09', lt, [16.4, 10.4, 34.5], [15.2, 4.1, 28.4], 38, { creep: 0.02 }); rsSitters(s, t);
  popAt(s.noX, pop(t, 16.76, 0.2), [14.6, 5.0, 29.2], s.cam);
  rsRender(s, { bgBlur: 0.6 }); };
// ---- s10: he laughs, then the whole room ("So is everyone")
SHOT_FN['s10'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's10', lt, [2, 13.5, 63], [2, 6.5, 24], 50);
  const all = t > 18.6, ex = {}; for (const [, , who] of RS_SITTERS) ex[who] = all || who === 'coffee' ? 'laugh' : RS_EXPR[who]; ex.you = all ? 'grin' : 'confused';
  rsSitters(s, t, { expr: ex, hand: { coffee: { armL: [1.6, 2.4 + 0.3 * Math.sin(t * 14)], armR: [-1.6, 2.4 + 0.3 * Math.sin(t * 14 + 1)] } } });
  for (const [w, x, z] of [['wait2', 20, 36], ['wait3', -4, 38]]) { const p = s.p[w]; p.g.visible = true; p.g.position.set(x, FOOT, z); c3PersonPose(p, s.cam, t, { expr: all ? 'laugh' : 'happy', ...STAND }); }
  rsRender(s); };
// ---- s11: she comes back, sits on the stool next to you, asks twice — the same bubble pops twice
SHOT_FN['s11'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's11', lt, [6.4, 9.6, 45], [6.2, 8.4, 28.4], 40);
  const sit = t >= 21.06, k = EZ.io(clamp((t - 19.7) / 1.3));
  rsSitters(s, t, { expr: { you: t > 23.0 ? 'confused' : 'happy' }, hand: { you: { armL: [0.9, 2.4], armR: [-1.5, 1.8] } } });   // (review: fists touched in a row)
  if (sit) rsWaitress(s, t, RS_STOOL[0], RS_STOOL[1], { sit: true, y: RS_SIT, pose: { expr: t > 22.1 ? 'talking' : 'happy', gaze: [-0.8, 0], hand: { armL: [0.7, 1.3], armR: [-0.7, 1.3] } } });
  else rsWaitress(s, t, lerp(14, RS_STOOL[0], k), lerp(38, RS_STOOL[1] + 0.5, k), { walk: k < 1, pose: { gaze: [-0.8, 0] } });
  popAt(s.say1, pop(t, 22.12, 0.22), [8.4, 13.2, 28.8], s.cam, 0.85); popAt(s.say2, pop(t, 23.0, 0.22), [5.6, 14.9, 29.0], s.cam, 0.85);
  rsRender(s); };
// ---- s13: the three waiters in their aprons, a row by the kitchen pass, smiling and waving
SHOT_FN['s13'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's13', lt, [-8, 9.6, 36], [-8, 7.6, 12], 44);
  [['wait', -13, 12.5], ['wait2', -8, 13.5], ['wait3', -3, 12.5]].forEach(([w, x, z], i) => { const p = s.p[w]; p.g.visible = true; p.g.position.set(x, FOOT, z);
    const wave = t > 27.1 + i * 0.25; c3PersonPose(p, s.cam, t, { expr: wave ? 'happy' : 'smile', gaze: [0, 0], hand: wave && i !== 1 ? { armL: [1.4, 1.6], armR: [-2.0, 4.2 + 0.4 * Math.sin(t * 11 + i)] } : { armL: [1.4, 1.6], armR: [-1.4, 1.6] }, ...STAND });
    if (i === 1) holdProp(p, 'tray', 'armL', () => { const g = trayMesh(); const c = cupMesh(); c.position.set(-0.6, 0.06, 0); g.add(c); const d = gyozaPlate(4); d.position.set(0.7, 0.06, 0); d.scale.setScalar(0.7); g.add(d); return g; }, { dy: 0.3, dx: 0.6, s: 0.8 }); });
  rsRender(s); };
// ---- s18: the chalk menu — MISTAKES ... FREE! chalked in on "mistakes"
SHOT_FN['s18'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t); s.p.d7.g.visible = s.p.d8.g.visible = false;   // (their heads crossed the menu)
  rsCam(s, 's18', lt, [-26, 9.4, 12], [-26, 8.6, 0], 40, { creep: 0.02, push: 0.05 }); rsSitters(s, t); rsRender(s, { bgBlur: 0.6 }); };
// ---- s19: the ticket rail — OOPS on 3 of 8 tickets, then the 37% WRONG tag (kick)
SHOT_FN['s19'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's19', lt, [-8, 13.2, 12], [-8, 13.6, 0], 50, { creep: 0.02 }); rsSitters(s, t);
  const w = s.p.wait3; w.g.visible = true; w.g.position.set(-17.5, FOOT, 5); c3PersonPose(w, s.cam, t, { expr: t > 41.1 ? 'embarrassed' : 'happy', gaze: [0, 0.3], ...STAND });
  rsRender(s, { bgBlur: 0.6 }); };
// ---- s20: diners leave by the door, waving back; the HAPPY? board fills with smileys, 99% on "happy"
SHOT_FN['s20'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's20', lt, [-4, 11, 54], [30, 8, 45], 44);
  s.p.d3.g.visible = s.p.d4.g.visible = false; rsSitters(s, t);
  [['d3', 0, 27, 37, 31.5, 50.5], ['d4', 0.45, 24, 35, 29, 48.5]].forEach(([who, dt, x0, z0, x1, z1]) => { const p = s.p[who], k = clamp((t - 43.95 - dt) / 1.6); p.g.visible = true; p.g.position.set(lerp(x0, x1, k), FOOT, lerp(z0, z1, k));
    c3PersonPose(p, s.cam, t, { expr: 'laugh', gaze: [-0.6, 0], hand: { armL: [1.4, 1.6], armR: [-2.0, 4.0 + 0.4 * Math.sin(t * 10 + dt * 3)] }, ...(k < 1 ? walkFeet(t * 10 + dt) : STAND) }); });
  const w = s.p.wait2; w.g.visible = true; w.g.position.set(26, FOOT, 36); c3PersonPose(w, s.cam, t, { expr: 'happy', hand: { armL: [2.0, 4.2 + 0.3 * Math.sin(t * 9)], armR: [-1.4, 1.6] }, ...STAND });
  rsRender(s); };
// ---- s21: past the food (blurred, near) to the people at the table, laughing with a waiter: the food was never the point
SHOT_FN['s21'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  c3SetCam(s.cam, camMove([[0, [-14.8, 5.6, 33], [-15, 4.6, 28], 40], [1.0, [-14.8, 5.6, 33], [-15, 4.6, 28], 40], [2.0, [-15.5, 9, 45], [-16, 7.2, 28], 42], [9, [-15.5, 9, 45], [-16, 7.2, 28], 42]], lt, 's21', RS_CM));
  rsSitters(s, t, { expr: { d1: 'laugh', d2: 'talking' } });
  const w = s.p.wait2; w.g.visible = true; w.g.position.set(-12.5, FOOT, 31.5); c3PersonPose(w, s.cam, t, { expr: t > 46.0 ? 'laugh' : 'talking', gaze: [-0.6, 0], ...STAND });
  rsRender(s); };
// ---- s22: at the kitchen pass, the waitress ties her apron (hands behind her back), proud
SHOT_FN['s22'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's22', lt, [-7, 9.6, 27], [-8, 8.4, 9], 40); rsSitters(s, t);
  const tie = t < 50.6; rsWaitress(s, t, -8, 8.5, { pose: { expr: tie ? 'determined' : 'proud', gaze: [0, 0], hand: tie ? { armL: [0.6 + 0.15 * Math.sin(t * 16), 1.1], armR: [-0.6 - 0.15 * Math.sin(t * 16), 1.1] } : { armL: [1.8, 2.0], armR: [-1.8, 2.0] } } });
  const w3 = s.p.wait3; w3.g.visible = true; w3.g.position.set(-13, FOOT, 7); c3PersonPose(w3, s.cam, t, { expr: 'happy', gaze: [0.6, 0], ...STAND });
  rsRender(s); };
// ---- s23: (long take from s22) she carries a full tray across the room
SHOT_FN['s23'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  const k = EZ.io(clamp((t - 51.2) / 1.0)); rsCam(s, 's23', lt, [-3, 10, 40], [lerp(-7, -3, k), 7.6, 18], 44); rsSitters(s, t);
  const w = rsWaitress(s, t, lerp(-8, -3.5, k), lerp(8.5, 19, k), { walk: k < 1, pose: { expr: 'proud', gaze: [0, 0], hand: { armL: [1.5, 2.1], armR: [-1.5, 2.1] } } });
  holdProp(w, 'tray', 'armL', () => { const g = trayMesh(); const c = cupMesh(); c.position.set(-0.7, 0.06, 0); g.add(c); const b = burgerPlate(); b.position.set(0.7, 0.06, 0); b.scale.setScalar(0.7); g.add(b); return g; }, { dx: -1.4, dy: 0.3 });
  rsRender(s); };
// ---- s24: the whole room claps, THANK YOU bubbles pop over the tables on "thank you"
SHOT_FN['s24'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's24', lt, [0, 14.5, 64], [0, 7, 22], 52);
  const clap = (i) => ({ armL: [0.6 + 0.35 * Math.abs(Math.sin(t * 12 + i)), 3.0], armR: [-0.6 - 0.35 * Math.abs(Math.sin(t * 12 + i)), 3.0] }), hd = {}, ex = {};
  RS_SITTERS.forEach(([, , who], i) => { hd[who] = clap(i); ex[who] = 'happy'; });
  rsSitters(s, t, { hand: hd, expr: ex });
  rsWaitress(s, t, -1.5, 36, { pose: { expr: t > 53.9 ? 'love' : 'proud', gaze: [0, 0], hand: { armL: [1.2, 3.0], armR: [-1.2, 3.0] } } });
  [['T2', -1], ['T3', 1], ['T4', 1], ['T5', -1], ['T6', 1], ['T1', 1]].forEach(([tk, side], i) => { const [x, z] = rsSeat(tk, side); popAt(s.thanks[i], pop(t, 53.96 + i * 0.09, 0.2), [x, 13.2, z + 0.5], s.cam); });
  rsRender(s); };
// ---- s25: you eat a dumpling, happy (love face on "dumplings")
SHOT_FN['s25'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's25', lt, [4.6, 8.8, 41], [3.4, 7.2, 28], 36);
  const bite = t > 57.4; rsSitters(s, t, { expr: { you: bite ? 'love' : 'happy' }, hand: { you: { armL: [1.4, 1.8], armR: bite ? [-0.5, 3.2] : [-1.4, 2.6] } } });
  holdProp(s.p.you, 'dump', 'armR', () => gyoza(), { dy: 0.15, s: 0.8 });
  rsRender(s); };
// ---- s26: (no voice) the tag: she proudly brings THE BURGER — to the coffee guy. He shrugs (kick) and bites.
SHOT_FN['s26'] = (t, u, lt) => { const s = rsGet(); rsReset(s, t);
  rsCam(s, 's26', lt, [12, 9.4, 44], [12, 6.8, 28.5], 46);
  const k = EZ.io(clamp((t - 58.0) / 1.0)), land = t >= 59.0, shrug = t > 59.4 && t < 60.2, bite = t >= 60.2;
  rsSitters(s, t, { expr: { you: t > 59.2 ? 'laugh' : 'happy', coffee: bite ? 'love' : shrug ? 'grin' : 'surprised' },
    hand: { coffee: shrug ? { armL: [2.2, 3.0], armR: [-2.2, 3.0] } : bite ? { armL: [1.4, 1.8], armR: [-0.5, 3.2] } : null, you: { armL: [1.4, 1.8], armR: [-1.4, 2.6] } } });
  holdProp(s.p.you, 'dump', 'armR', () => gyoza(), { dy: 0.15, s: 0.8 });
  const w = rsWaitress(s, t, lerp(24, 18.2, k), lerp(36, 30.8, k), { walk: k < 1, pose: { expr: 'proud', gaze: [-0.6, 0], hand: land ? { armL: [1.4, 1.6], armR: [-1.4, 1.6] } : { armL: [1.0, 3.6], armR: [-1.0, 3.6] } } });
  if (!land) holdProp(w, 'bp', 'armL', () => burgerPlate(), { dx: -1.0, dy: 0.4 });
  else { s.food.burger.visible = true; s.food.burger.position.set(15.0, 3.95, 28.6); }
  if (bite) holdProp(s.p.coffee, 'bun', 'armR', () => burgerMesh(0.6), { dy: 0.1 });
  rsRender(s); };

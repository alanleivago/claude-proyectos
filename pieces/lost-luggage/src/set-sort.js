// =====================================================================
//  SET sort — the store's back-room sorting floor (x -60..60, z 0..84, h 40): deep green walls with an orange dado,
//  yellow safety lanes on a grey-green concrete floor, steel trusses + hanging lamps. Back wall (z 0): industrial washers
//  (x -56..-26, drums spin), the ITEMS TODAY counter board, labelled bins (SHOES, BOOKS, ELECTRONICS, TOYS), the pricing
//  station (price guns, tag rolls), metal shelving racks being stocked (x 26..56). Left wall: the MOUNTAIN of suitcases
//  feeding a roller conveyor (z 26). Three rows of long steel tables (z 34, 48, 62); the worker's spot is table B
//  (x -4, z 44.5), the DONATE gaylord box at the left end of table B (x -33, z 48). Safety posters, a clock, pallets, a hand truck.
//  Registers s09, s10, s26, s27, s28, s29, s31. Prefix so. Exposed: s.board, s.gun, s.bag1, s.bag2, s.bag3, s.donate, s.wash.
// =====================================================================
const SO = {};
const SO_POOL = 2.6, SO_SUNI = 2.2;   // v4: fixture pool + skylight sun intensities
const SO_X = 60, SO_Z = 84, SO_H = 40, SO_TOP = 4.4, SO_TB = [34, 48, 62];
const SO_ME = [-3, 44.5], SO_BAG1 = [-8.2, 47.4], SO_BAG2 = [1.6, 47.4], SO_DON = [-33, 48], SO_PRICE = [4, 9], SO_SHELF = [26, 56];
// the sorter extras (s26): own costumes, all in the store's green apron
Object.assign(CAST, {
  soA: { key: 'soA', hair: 'bun', hairColor: 'chestnut', outfit: 'apron', colors: { main: '#e8762a', apron: '#2f7a46', collar: '#ffffff' }, skin: 'brown', body: 'avg' },     // pricer
  soB: { key: 'soB', hair: 'bowl', hairColor: 'black', outfit: 'apron', colors: { main: '#f2c23a', apron: '#2f7a46', collar: '#ffffff' }, skin: 'peach', body: 'thin' },      // opens the glowing bag
  soC: { key: 'soC', hair: 'topknot', hairColor: 'auburn', outfit: 'apron', colors: { main: '#8a4aa8', apron: '#2f7a46', collar: '#ffffff' }, body: 'short' },               // stocks the shelves
  soD: { key: 'soD', hair: 'bald', hairColor: 'dark', moustache: true, outfit: 'apron', colors: { main: '#d8343a', apron: '#2f7a46', collar: '#ffffff' }, skin: 'tan', body: 'tall' },   // sorter
});
const SO_EXTRA = { soA: [SO_PRICE[0], SO_PRICE[1] - 3.2], soB: [-14, 30.6], soC: [52.5, 6.8], soD: [15, 30.6] };
// v3: painted cinder block (mortar joints, pores, roller marks, chips) over a scuffed orange dado and a rubber cove base
function soTexWall() { const t = tex((g, w, h) => { const R = RNG('sowall'), dado = h * 0.78, rows = 30, rh = dado / rows, cols = 8, cw = w / cols;
  g.fillStyle = '#1a3a80'; g.fillRect(0, 0, w, dado);   // v5: ultramarine block (ref 4 factory)
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const x = (i + (j % 2) * 0.5) * cw, y = j * rh; g.fillStyle = c3Shd('#3366cc', R.r(0.88, 1.08)); g.fillRect(x + 2, y + 2, cw - 3, rh - 3);
    g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + 2, y + 2, cw - 3, 2); g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(x + 2, y + rh - 3, cw - 3, 2);
    for (let k = 0; k < 7; k++) { g.fillStyle = R.f() < 0.6 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.06)'; g.fillRect(x + R.r(3, cw - 4), y + R.r(3, rh - 4), 2, 2); } }
  for (let x = 0; x < w; x += R.r(16, 40)) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'; g.fillRect(x, 0, R.r(12, 30), dado); }   // roller marks
  for (let k = 0; k < 30; k++) { g.fillStyle = R.f() < 0.5 ? '#7e847e' : '#4a5a52'; g.beginPath(); g.ellipse(R.r(0, w), R.r(dado * 0.35, dado - 12), R.r(1.5, 4.5), R.r(1, 3), R.f() * 3, 0, TAU); g.fill(); }   // chips
  g.fillStyle = '#1e8482'; g.fillRect(0, dado, w, h - dado);   // v5: teal dado
  for (let k = 0; k < 50; k++) { g.fillStyle = `rgba(40,20,10,${R.r(0.05, 0.18)})`; g.fillRect(R.r(-20, w), R.r(dado + 14, h - 22), R.r(10, 70), R.r(1, 3)); }   // cart scuffs
  for (let k = 0; k < 18; k++) { g.fillStyle = '#9a968c'; g.fillRect(R.r(0, w), R.r(dado + 12, h - 18), R.r(2, 7), R.r(2, 4)); }
  for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(0,0,0,0.1)'; g.fillRect(x, dado, 2, h - dado); }
  g.fillStyle = '#e8b632'; g.fillRect(0, dado - 10, w, 10); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, dado, w, 3);
  g.fillStyle = '#1a1c1e'; g.fillRect(0, h - 18, w, 18); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, h - 18, w, 2); }, 512, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function soTexFloor() { return tex((g, w, h) => { const k = w / 120, X = (x) => (x + 60) * k, Z = (z) => z * k, R = RNG('sofl'); g.fillStyle = '#a2552c'; g.fillRect(0, 0, w, h);   // v5: warm terracotta epoxy floor
  for (let i = 0; i < 160; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(30, 170), gr = g.createRadialGradient(x, y, 0, x, y, r), d = R.f() < 0.55; gr.addColorStop(0, d ? 'rgba(18,26,22,0.14)' : 'rgba(255,255,248,0.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 12000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.06)'; const z = R.r(1, 3.5); g.fillRect(R.r(0, w), R.r(0, h), z, z); }
  g.lineWidth = 16; for (let i = 0; i < 70; i++) { g.strokeStyle = 'rgba(255,255,255,0.025)'; const x = R.r(0, w), y = R.r(0, h); g.beginPath(); g.arc(x, y, R.r(40, 100), R.r(0, 3), R.r(3, 6)); g.stroke(); }   // mop arcs on the sealer
  for (let x = -48; x < 60; x += 12) { g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(X(x) - 1.5, 0, 3, h); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(X(x) + 1.5, 0, 2, h); }   // saw-cut joints
  for (let z = 12; z < 84; z += 12) { g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(0, Z(z) - 1.5, w, 3); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, Z(z) + 1.5, w, 2); }
  g.strokeStyle = 'rgba(12,18,16,0.5)'; g.lineWidth = 1.6; for (let i = 0; i < 26; i++) { let x = R.r(0, w), y = R.r(0, h); g.beginPath(); g.moveTo(x, y); for (let q = 0; q < R.i(4, 10); q++) { x += R.n(40); y += R.n(40); g.lineTo(x, y); } g.stroke(); }   // hairline cracks
  for (let i = 0; i < 18; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(140, 460), a0 = R.r(0, TAU), a1 = a0 + R.r(0.4, 1.2), al = R.r(0.05, 0.13), wd = R.r(7, 11);   // forklift tyre marks
    for (const dr of [0, 52]) { g.strokeStyle = `rgba(12,14,14,${al})`; g.lineWidth = wd; g.beginPath(); g.arc(cx, cy, r + dr, a0, a1); g.stroke(); } }
  for (let i = 0; i < 30; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(8, 50); g.fillStyle = `rgba(18,20,16,${R.r(0.08, 0.2)})`; g.beginPath(); g.ellipse(x, y, r, r * R.r(0.45, 1), R.f() * 3, 0, TAU); g.fill(); }   // oil / water stains
  const LN = [];
  g.fillStyle = '#f2c23a'; const ln = (x0, z0, x1, z1) => { const r = [X(Math.min(x0, x1)) - 6, Z(Math.min(z0, z1)) - 6, Math.abs(X(x1) - X(x0)) + 12, Math.abs(Z(z1) - Z(z0)) + 12]; g.fillStyle = '#e2b434'; g.fillRect(...r); LN.push(r); };
  ln(-34, 29, 34, 29); ln(-34, 70, 34, 70); ln(-34, 29, -34, 70); ln(34, 29, 34, 70); ln(-58, 14, 58, 14); ln(-58, 76, 58, 76);
  for (const [x0, x1] of [[-58, -24], [24, 58]]) for (let x = x0; x < x1; x += 3) { g.save(); g.beginPath(); g.rect(X(x0), Z(0.5), X(x1) - X(x0), Z(11)); g.clip(); g.fillStyle = '#f2c23a'; g.beginPath(); g.moveTo(X(x), Z(11.5)); g.lineTo(X(x + 1.4), Z(11.5)); g.lineTo(X(x + 1.4 + 10), Z(0)); g.lineTo(X(x + 10), Z(0)); g.fill(); g.restore(); }
  LN.push([X(-58), Z(0.5), X(-24) - X(-58), Z(11)], [X(24), Z(0.5), X(58) - X(24), Z(11)]);
  g.fillStyle = '#e4e4dc'; for (const x of [-46, -16, 16, 46]) { g.save(); g.translate(X(x), Z(80)); g.beginPath(); g.moveTo(-50, -24); g.lineTo(20, -24); g.lineTo(20, -50); g.lineTo(60, 0); g.lineTo(20, 50); g.lineTo(20, 24); g.lineTo(-50, 24); g.fill(); g.restore(); }
  g.globalAlpha = 0.82; inked(g, 'SORTING ZONE', X(0), Z(73.5), Z(3.2), '#e2b434', { stroke: false, maxW: X(30) - X(-30) }); g.globalAlpha = 1;
  // worn paint: chips down to the concrete + dirt ground into the lanes where carts run
  for (const r of LN) { g.save(); g.beginPath(); g.rect(...r); g.clip(); const n = Math.ceil(r[2] * r[3] / 300);
    for (let i = 0; i < n; i++) { g.fillStyle = R.f() < 0.7 ? 'rgba(94,104,98,0.9)' : 'rgba(30,30,24,0.25)'; g.beginPath(); g.ellipse(r[0] + R.f() * r[2], r[1] + R.f() * r[3], R.r(1.5, 7), R.r(1, 4), R.f() * 3, 0, TAU); g.fill(); } g.restore(); } }, 2048, 1434); }
function soTexBoard(n) { return (g, w, h) => { g.fillStyle = '#16181e'; g.beginPath(); g.roundRect(0, 0, w, h, 30); g.fill(); g.lineWidth = 16; g.strokeStyle = '#e8762a'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 24); g.stroke();
  inked(g, 'ITEMS TODAY', w / 2, h * 0.22, h * 0.13, '#f2c23a', { stroke: false, maxW: w * 0.8 });
  const s = n.toLocaleString('en-US'); g.fillStyle = '#0a2a1e'; g.fillRect(w * 0.08, h * 0.36, w * 0.84, h * 0.52);
  g.save(); g.shadowColor = '#7aff9a'; g.shadowBlur = 30; inked(g, s, w / 2, h * 0.63, h * 0.42, '#9affb0', { stroke: false, font: '"Consolas", "Courier New", monospace', weight: 700, maxW: w * 0.78 }); g.restore(); }; }
function soTexBin(word, c) { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, 0, w, h * 0.12); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a2a30'; g.stroke();
  inked(g, word, w / 2, h * 0.5, h * 0.2, '#2a2a30', { stroke: false, maxW: w * 0.72 }); }, 512, 384); }
// paper wear for posters/notices: sun fade, grime, creases, tape on the corners, a dog-eared corner (wall colour behind)
function soWear(g, w, h, seed, wall = '#1d5644') { const R = RNG('sowear', seed);
  g.fillStyle = 'rgba(255,248,225,0.13)'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(70,50,20,0.14)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) { const y = R.r(0.2, 0.8) * h; g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, y + 2, w, 2); }
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(60,40,20,${R.r(0.03, 0.08)})`; g.beginPath(); g.arc(R.r(0, w), R.r(0, h), R.r(3, 14), 0, TAU); g.fill(); }
  const c = R.i(0, 3), cx = c % 2 ? w : 0, cy = c > 1 ? h : 0, sx = cx ? -1 : 1, sy = cy ? -1 : 1, f = Math.min(w, h) * R.r(0.1, 0.15);
  g.fillStyle = wall; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * f, cy); g.lineTo(cx, cy + sy * f); g.fill();
  g.fillStyle = '#d8ceb4'; g.beginPath(); g.moveTo(cx + sx * f, cy); g.lineTo(cx, cy + sy * f); g.lineTo(cx + sx * f * 0.85, cy + sy * f * 0.85); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; g.stroke();
  for (let q = 0; q < 4; q++) { if (q === c) continue; const tx = q % 2 ? w - 18 : 18, ty = q > 1 ? h - 18 : 18; g.save(); g.translate(tx, ty); g.rotate(R.n(0.5) + (q % 2 ? 0.8 : -0.8)); g.fillStyle = 'rgba(236,226,190,0.75)'; g.fillRect(-26, -9, 52, 18); g.restore(); } }
function soTexPoster(k) { return tex((g, w, h) => { g.fillStyle = '#fff6e2'; g.fillRect(0, 0, w, h); g.lineWidth = 14; g.strokeStyle = '#2a1a14';
  if (k === 0) { g.fillStyle = '#2f8a4a'; g.fillRect(0, 0, w, h * 0.22); inked(g, 'SAFETY FIRST', w / 2, h * 0.11, h * 0.09, '#ffffff', { stroke: false, maxW: w * 0.86 });
    g.fillStyle = '#f2c23a'; g.beginPath(); g.ellipse(w / 2, h * 0.52, w * 0.3, h * 0.17, 0, Math.PI, 0); g.fill(); g.fillRect(w * 0.14, h * 0.5, w * 0.72, h * 0.05); g.stroke(); inked(g, 'Wear gloves when', w / 2, h * 0.72, h * 0.055, '#2a1a14', { stroke: false }); inked(g, 'opening bags', w / 2, h * 0.8, h * 0.055, '#2a1a14', { stroke: false }); }
  else if (k === 1) { g.fillStyle = '#e8762a'; g.fillRect(0, 0, w, h * 0.22); inked(g, 'LIFT WITH', w / 2, h * 0.08, h * 0.07, '#ffffff', { stroke: false }); inked(g, 'YOUR LEGS', w / 2, h * 0.16, h * 0.07, '#ffffff', { stroke: false });
    g.fillStyle = '#2f6fb8'; g.beginPath(); g.roundRect(w * 0.3, h * 0.4, w * 0.4, h * 0.26, 16); g.fill(); g.stroke(); g.strokeStyle = '#2a1a14'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.32, h * 0.86); g.lineTo(w * 0.38, h * 0.72); g.lineTo(w * 0.32, h * 0.66); g.moveTo(w * 0.68, h * 0.86); g.lineTo(w * 0.62, h * 0.72); g.lineTo(w * 0.68, h * 0.66); g.stroke(); }
  else { g.fillStyle = '#d8282a'; g.fillRect(0, 0, w, h * 0.3); inked(g, 'DAYS WITHOUT', w / 2, h * 0.1, h * 0.075, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'A WEIRD FIND', w / 2, h * 0.2, h * 0.075, '#ffffff', { stroke: false, maxW: w * 0.86 });
    g.fillStyle = '#ffffff'; g.fillRect(w * 0.25, h * 0.38, w * 0.5, h * 0.42); g.lineWidth = 10; g.strokeRect(w * 0.25, h * 0.38, w * 0.5, h * 0.42); inked(g, '0', w / 2, h * 0.6, h * 0.34, '#d8282a', { stroke: false, font: 'Impact, Arial Black, sans-serif' }); }
  g.lineWidth = 14; g.strokeStyle = '#2a1a14'; g.strokeRect(0, 0, w, h); soWear(g, w, h, 'post' + k); }, 400, 560); }
function soTexShelf(seed) { return tex((g, w, h) => { const R = RNG('soshelf', seed); g.fillStyle = '#2a2e34'; g.fillRect(0, 0, w, h); let x = 6; const C = ['#e84a3a', '#2f6fb8', '#f2c23a', '#3a9a5a', '#8a4aa8', '#e8eef6', '#e8762a', '#4ac0c8', '#d84a8a'];
  while (x < w - 20) { const kind = R.f(), bw = R.r(30, 70), c = C[Math.floor(R.f() * C.length)];
    if (kind < 0.45) { for (let i = 0; i < R.i(2, 4); i++) { g.fillStyle = C[Math.floor(R.f() * C.length)]; g.fillRect(x, h - 18 - i * 16, bw, 15); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, h - 4 - i * 16, bw, 2); } }   // folded clothes
    else if (kind < 0.7) { const bh = R.r(h * 0.4, h * 0.8); g.fillStyle = c; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 4, h - bh + 6, bw - 8, 6); }   // boxes
    else { const bh = R.r(h * 0.5, h * 0.85); g.fillStyle = c; g.beginPath(); g.roundRect(x, h - bh, bw, bh, 10); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#2a2a30'; g.fillRect(x + bw * 0.3, h - bh - 8, bw * 0.4, 8); }   // bags
    g.fillStyle = '#f6efe0'; g.fillRect(x + bw * 0.3, h - 8, 14, 8); x += bw + R.r(4, 12); } }, 512, 96); }
function soTexDonate() { return tex((g, w, h) => { g.fillStyle = '#c89a5a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,50,20,0.35)'; g.lineWidth = 4; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#2f7a46'; g.fillRect(w * 0.06, h * 0.12, w * 0.88, h * 0.5); g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.strokeRect(w * 0.09, h * 0.16, w * 0.82, h * 0.42);
  inked(g, 'DONATE', w / 2, h * 0.37, h * 0.26, '#ffffff', { stroke: false, maxW: w * 0.76 }); inked(g, 'to local charities', w / 2, h * 0.76, h * 0.09, '#2a1a10', { stroke: false, maxW: w * 0.8 });
  g.fillStyle = '#d8342a'; g.beginPath(); g.moveTo(w * 0.5, h * 0.93); g.bezierCurveTo(w * 0.42, h * 0.86, w * 0.44, h * 0.8, w * 0.5, h * 0.84); g.bezierCurveTo(w * 0.56, h * 0.8, w * 0.58, h * 0.86, w * 0.5, h * 0.93); g.fill(); }, 512, 448); }
function soTexDrum() { return tex((g, w, h) => { g.fillStyle = '#2a3a4a'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, TAU); g.fill(); const C = ['#e84a3a', '#f2c23a', '#2f6fb8', '#3a9a5a', '#e8eef6', '#d84a8a'];
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, r = w * 0.27; g.fillStyle = C[i % 6]; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, w * 0.13, w * 0.08, a, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(180,220,255,0.35)'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.47, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(w * 0.36, h * 0.3, w * 0.12, w * 0.05, -0.7, 0, TAU); g.fill();
  g.lineWidth = 18; g.strokeStyle = '#c8d0d8'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 10, 0, TAU); g.stroke(); }, 256, 256); }
function soTexTag(price) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#e8762a'; g.beginPath(); g.moveTo(w * 0.22, 4); g.lineTo(w - 4, 4); g.lineTo(w - 4, h - 4); g.lineTo(w * 0.22, h - 4); g.lineTo(4, h / 2); g.closePath(); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w * 0.18, h / 2, 9, 0, TAU); g.fill(); g.stroke(); inked(g, price, w * 0.6, h / 2 + 2, h * 0.5, '#ffffff', { stroke: '#2a1208', sw: 6, maxW: w * 0.66 }); }, 256, 128); }

// ---- v3 detail: bake static clutter into a few vertex-coloured meshes (one per material kind / map) to keep draw calls low
function soBake(root, o = {}) { root.updateMatrixWorld(true); const B = new Map();
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '');
    if (!B.has(key)) B.set(key, { mt, em, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); B.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const { mt, em, L } of B.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.62 + 0.38 * clamp((y - (o.floor ?? 0)) / (o.aoH ?? 2.5));
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        C[k * 3] = c.r * ao; C[k * 3 + 1] = c.g * ao; C[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast || em) mesh.userData.noCast = true; out.add(mesh); }
  return out; }
const soAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
// brushed, scratched stainless (UVs of rb are in world units: repeat ~0.08 = one tile per 12 units)
function soTexSteel() { const t = tex((g, w, h) => { const R = RNG('sosteel'); g.fillStyle = '#aab2b9'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'; g.fillRect(R.r(-60, w), R.r(0, h), R.r(40, 280), 1); }
  g.lineWidth = 1; for (let i = 0; i < 160; i++) { g.strokeStyle = R.f() < 0.6 ? 'rgba(40,44,50,0.35)' : 'rgba(255,255,255,0.3)'; const x = R.r(0, w), y = R.r(0, h), a = R.n(0.8), l = R.r(5, 46); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(70,60,40,' + R.r(0.05, 0.12) + ')'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(8, 30), R.r(5, 18), R.f() * 3, 0, TAU); g.fill(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.08, 0.08); return t; }
// corrugated cardboard: flutes, tape strip, scuffs and water stains
function soTexCard() { const t = tex((g, w, h) => { const R = RNG('socard'); g.fillStyle = '#b88a52'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 6) { g.fillStyle = x % 12 ? 'rgba(255,240,210,0.05)' : 'rgba(60,35,10,0.07)'; g.fillRect(x, 0, 3, h); }
  for (let i = 0; i < 400; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(80,50,20,0.08)' : 'rgba(255,240,210,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(2, 10), R.r(1, 3)); }
  for (let i = 0; i < 8; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 60), gr = g.createRadialGradient(x, y, r * 0.6, x, y, r); gr.addColorStop(0, 'rgba(90,55,20,0.1)'); gr.addColorStop(0.92, 'rgba(70,40,15,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.fillStyle = 'rgba(214,190,140,0.75)'; g.fillRect(0, h * 0.44, w, h * 0.1); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, h * 0.44, w, 3); }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.16, 0.16); return t; }
// rough pine pallet wood
function soTexWood() { const t = tex((g, w, h) => { const R = RNG('sowood'); g.fillStyle = '#a8804c'; g.fillRect(0, 0, w, h);
  g.lineWidth = 1.5; for (let i = 0; i < 70; i++) { g.strokeStyle = R.f() < 0.6 ? 'rgba(90,60,30,0.3)' : 'rgba(255,230,180,0.15)'; const y = R.r(0, h); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + R.n(6), w * 0.6, y + R.n(6), w, y + R.n(4)); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(70,45,20,0.4)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(3, 6), R.r(2, 3), 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(40,30,20,' + R.r(0.06, 0.16) + ')'; g.fillRect(R.r(0, w), R.r(0, h), R.r(10, 60), R.r(4, 16)); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.25, 0.25); return t; }
// a cork notice board with pinned sheets (one dog-eared), its title fully inside the frame
function soTexNotice() { return tex((g, w, h) => { const R = RNG('sonote'); g.fillStyle = '#5a3a20'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8895a'; g.fillRect(14, 14, w - 28, h - 28);
  for (let i = 0; i < 2500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,55,25,0.35)' : 'rgba(230,190,140,0.3)'; g.fillRect(R.r(14, w - 14), R.r(14, h - 14), 2, 2); }
  g.fillStyle = '#2f7a46'; g.fillRect(w * 0.2, 22, w * 0.6, h * 0.12); inked(g, 'BREAK NOTICES', w / 2, 22 + h * 0.06, h * 0.07, '#ffffff', { stroke: false, maxW: w * 0.55 });
  const S = [[0.08, 0.24, 0.26, 0.42, '#fbf7ea'], [0.38, 0.22, 0.24, 0.3, '#fff2a0'], [0.66, 0.24, 0.26, 0.38, '#fbf7ea'], [0.4, 0.58, 0.22, 0.32, '#ffd0d8'], [0.1, 0.7, 0.2, 0.22, '#d8ecff'], [0.68, 0.66, 0.24, 0.27, '#fbf7ea']];
  S.forEach(([x, y, sw, sh, c], i) => { g.save(); g.translate(w * (x + sw / 2), h * (y + sh / 2)); g.rotate(R.n(0.06)); const W2 = w * sw, H2 = h * sh;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-W2 / 2 + 4, -H2 / 2 + 5, W2, H2); g.fillStyle = c; g.fillRect(-W2 / 2, -H2 / 2, W2, H2);
    g.fillStyle = 'rgba(40,40,50,0.7)'; g.fillRect(-W2 * 0.38, -H2 * 0.38, W2 * 0.76, H2 * 0.08); g.fillStyle = 'rgba(60,60,70,0.4)'; for (let l = 0; l < 6; l++) g.fillRect(-W2 * 0.38, -H2 * 0.2 + l * H2 * 0.1, W2 * R.r(0.4, 0.76), 3);
    if (i === 2) { g.fillStyle = '#d0c6ac'; g.beginPath(); g.moveTo(W2 / 2, H2 / 2 - 30); g.lineTo(W2 / 2 - 30, H2 / 2); g.lineTo(W2 / 2 - 10, H2 / 2 - 10); g.fill(); }
    g.fillStyle = ['#d8282a', '#2f6fb8', '#f2c23a'][i % 3]; g.beginPath(); g.arc(0, -H2 / 2 + 8, 6, 0, TAU); g.fill(); g.restore(); }); }, 512, 384); }
// a wall sign with a title and smaller sub-text, slightly faded
function soTexSign(t1, t2, bg, fg, seed) { return tex((g, w, h) => { g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(10, 10, w - 20, h * 0.52); g.lineWidth = 8; g.strokeStyle = '#2a2a30'; g.strokeRect(4, 4, w - 8, h - 8);
  inked(g, t1, w / 2, 10 + h * 0.26, h * 0.26, fg, { stroke: false, maxW: w * 0.82 }); inked(g, t2, w / 2, h * 0.78, h * 0.13, '#2a2a30', { stroke: false, maxW: w * 0.84 }); soWear(g, w, h, seed); }, 512, 256); }
// a mixed luggage piece for the mountain / conveyor / pallets: hard shell (ribs, zip band, wheels), duffel (straps, end caps,
// handle arc) or soft case (front pocket, buckle straps); often a luggage tag. Origin = bottom centre, length along x.
function soBag(R, w, h, d, c, kind = R.f()) { const g = new THREE.Group(), M = SO.M, dk = t3Mul(c, 0.68), strapC = R.f() < 0.5 ? '#26262c' : (R.f() < 0.5 ? '#d8c8a0' : '#b8282a');
  const strap = c3Prop(strapC, { rough: 0.85 });
  if (kind < 0.42) { const sh = c3Prop(c, { rough: 0.26 }); g.add(rb(w, h, d, sh, 0, h / 2, 0, 0)); for (const f of [-0.3, -0.1, 0.1, 0.3]) g.add(rb(w * 0.05, 0.14, d * 0.9, sh, f * w, h + 0.02, 0, 0));
    g.add(rb(w + 0.08, h * 0.08, d + 0.08, c3Prop(dk, { rough: 0.6 }), 0, h * 0.5, 0, 0)); for (const z of [-d * 0.36, d * 0.36]) { const wh = cyl(0.32, 0.32, 0.3, M.dark, -w / 2 + 0.3, 0.25, z, 0, 8); wh.rotation.x = Math.PI / 2; g.add(wh); }
    g.add(rb(w * 0.3, 0.32, 0.4, M.dark, 0, h + 0.2, 0, 0)); g.add(rb(0.3, 0.6, d * 0.4, M.dark, w / 2 + 0.1, h * 0.6, 0, 0)); }
  else if (kind < 0.66) { const r = Math.min(h, d) / 2, sm = c3Prop(c, { rough: 0.8 }), L = Math.max(0.5, w - 2 * r * 0.6), body = cyl(r, r, L, sm, 0, r, 0, 0, 14); body.rotation.z = Math.PI / 2; g.add(body);
    for (const s of [-1, 1]) { const e = c3Mesh(new THREE.SphereGeometry(r, 14, 8), c3Prop(dk, { rough: 0.8 }), 0); e.scale.set(0.6, 1, 1); e.position.set(s * L / 2, r, 0); g.add(e);
      const st = c3Mesh(new THREE.TorusGeometry(r + 0.04, 0.1, 5, 18), strap, 0); st.rotation.y = Math.PI / 2; st.position.set(s * L * 0.28, r, 0); g.add(st); }
    const hd = c3Mesh(new THREE.TorusGeometry(L * 0.18, 0.14, 5, 12, Math.PI), strap, 0); hd.position.set(0, 2 * r - 0.05, 0); g.add(hd); g.add(rb(L * 0.9, 0.1, 0.12, M.dark, 0, 2 * r - 0.02, r * 0.5, 0)); }
  else { const sm = c3Prop(c, { rough: 0.85 }), b = c3Mesh(c3RBox(w, h, d, Math.min(0.55, h * 0.28)), sm, 0); b.position.y = h / 2; g.add(b);
    g.add(rb(w * 0.66, h * 0.62, 0.32, c3Prop(dk, { rough: 0.85 }), 0, h * 0.48, d / 2 + 0.08, 0)); for (const x of [-w * 0.28, w * 0.28]) { g.add(rb(0.36, h + 0.12, d + 0.14, strap, x, h / 2, 0, 0)); g.add(rb(0.5, 0.36, 0.1, M.steelD, x, h * 0.62, d / 2 + 0.1, 0)); }
    g.add(rb(w * 0.3, 0.3, 0.4, M.dark, 0, h + 0.15, 0, 0)); }
  if (R.f() < 0.55) { const tg = rb(0.9, 0.06, 0.6, c3Prop(['#f2e8c8', '#f2c23a', '#e8762a', '#ffffff'][R.i(0, 3)], { rough: 0.7 }), R.r(-0.3, 0.6), h + 0.12, R.r(0.4, 0.9), 0); tg.rotation.y = R.n(0.8); g.add(tg); }
  return g; }
function soPallet(K, x, y, z, ry = 0, w = 8, d = 8) { const g = soAt(new THREE.Group(), x, y, z, ry), W0 = SO.M.wood;
  for (const sz of [-d / 2 + 0.5, 0, d / 2 - 0.5]) g.add(rb(w, 0.7, 0.9, W0, 0, 0.35, sz, 0));
  for (let i = 0; i < 7; i++) g.add(rb(w * 0.125, 0.22, d, W0, -w / 2 + w * 0.0625 + i * w / 7 + 0.05, 0.81, 0, 0)); K.add(g); return g; }
const SO_MOUNTC = ['#2f6fb8', '#b8343a', '#e0b23a', '#3a8a5a', '#6a3a8a', '#d86a2a', '#26262e', '#c84a7a', '#3aa0aa', '#8a4a24', '#d8d4cc', '#4a5a6a', '#7a2a2a', '#5a6a3a', '#1f3a6a'];
// ---- props
function soTable(x, z, len) { const g = new THREE.Group(), M = SO.M; g.position.set(x, 0, z); g.add(rb(len, 0.5, 5.6, M.steel, 0, SO_TOP - 0.25, 0, 0.03)); g.add(rb(len - 1, 0.25, 4.8, M.steelD, 0, 1.4, 0, 0.02));
  for (const lx of [-len / 2 + 0.8, 0, len / 2 - 0.8]) for (const lz of [-2.3, 2.3]) g.add(cyl(0.18, 0.18, SO_TOP - 0.4, M.steelD, lx, (SO_TOP - 0.4) / 2, lz, 0.01, 6)); return g; }
function soCaseBox(w, h, d, c, ink = 0.04) { const g = new THREE.Group(); g.add(rb(w, h, d, c3Prop(c, { rough: 0.35 }), 0, h / 2, 0, ink)); g.add(rb(w * 0.34, 0.45, 0.45, SO.M.dark, 0, h + 0.15, 0, 0)); g.add(rb(0.35, h * 0.9, d + 0.06, c3Prop(t3Mul(c, 0.74)), -w * 0.22, h / 2, 0, 0)); return g; }
const SO_CASEC = ['#2f6fb8', '#e84a3a', '#f2c23a', '#3a9a5a', '#8a4aa8', '#e8762a', '#2a2a34', '#d84a8a', '#4ac0c8', '#a85a2a', '#f0f0f0'];
function soFolded(c, w = 1.5, d = 1.1) { const g = new THREE.Group(); g.add(rb(w, 0.32, d, c3Prop(c, { rough: 0.9 }), 0, 0.16, 0, 0.012)); g.add(rb(w * 0.9, 0.06, 0.12, c3Prop(t3Mul(c, 0.8)), 0, 0.33, d * 0.25, 0)); return g; }
// the price gun: body + nose + grip + the orange tag roll; grip point = the bottom of the handle (local 0, 0, 0)
function soGun() { const g = new THREE.Group(), M = SO.M; g.add(rb(0.45, 1.3, 0.4, c3Prop('#2a2a30'), 0, 0.65, 0, 0.02)); g.add(rb(2.0, 0.75, 0.5, c3Prop('#e8762a', { rough: 0.35 }), 0.6, 1.5, 0, 0.025));
  g.add(rb(0.6, 0.3, 0.3, M.steel, 1.85, 1.35, 0, 0.01)); const r = cyl(0.45, 0.45, 0.45, c3Prop('#f6efe0'), 0.3, 2.15, 0, 0.015, 14); r.rotation.x = Math.PI / 2; g.add(r); g.add(rb(0.2, 0.6, 0.2, M.dark, 0.35, 0.9, 0, 0)); return g; }
function soChicken() { const g = new THREE.Group(), y = c3Prop('#f6e04a', { rough: 0.4 }); const b = c3Mesh(new THREE.SphereGeometry(0.9, 14, 10), y, 0.03); b.scale.set(1, 1.45, 0.8); g.add(b);
  const nk = cyl(0.25, 0.35, 1.5, y, 0, 1.7, 0, 0.02, 8); g.add(nk); const hd = c3Mesh(new THREE.SphereGeometry(0.45, 12, 8), y, 0.02); hd.position.y = 2.5; g.add(hd);
  const cm = c3Mesh(new THREE.ConeGeometry(0.22, 0.6, 6), c3Prop('#e8402e'), 0.01); cm.position.set(0, 3.0, 0); g.add(cm); const bk = c3Mesh(new THREE.ConeGeometry(0.15, 0.5, 6), c3Prop('#f29a2a'), 0.01); bk.rotation.z = -Math.PI / 2; bk.position.set(0.55, 2.45, 0); g.add(bk);
  for (const s of [-1, 1]) { const e = c3Mesh(new THREE.SphereGeometry(0.08, 6, 6), SO.M.dark, 0); e.position.set(0.32, 2.62, s * 0.22); g.add(e); g.add(cyl(0.07, 0.07, 1.0, c3Prop('#f29a2a'), s * 0.3, -1.6, 0, 0.01, 6)); } return g; }
function soBall() { const g = new THREE.Group(); g.add(c3Mesh(new THREE.SphereGeometry(1.15, 20, 14), c3Prop('#5a2a8a', { rough: 0.15, env: 1.4 }), 0.03));
  for (const [a, b] of [[0.25, 0.2], [-0.05, 0.42], [0.35, 0.5]]) { const hle = c3Mesh(new THREE.CircleGeometry(0.17, 10), c3Flat('#1a1020'), 0); const v = new THREE.Vector3(Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b)).normalize(); hle.position.copy(v.clone().multiplyScalar(1.16)); hle.lookAt(v.clone().multiplyScalar(3)); g.add(hle); } return g; }
function soSock(c) { const g = new THREE.Group(), m = c3Prop(c, { rough: 0.9 }); g.add(rb(0.5, 1.4, 0.3, m, 0, 0.7, 0, 0.012)); g.add(rb(0.95, 0.5, 0.3, m, 0.24, 0.05, 0, 0.012)); g.add(rb(0.52, 0.18, 0.32, c3Prop('#ffffff'), 0, 1.15, 0, 0)); return g; }
function soGnome() { const g = new THREE.Group(); g.add(cyl(0.7, 0.9, 1.4, c3Prop('#2f6fb8'), 0, 0.8, 0, 0.025, 12)); const f = c3Mesh(new THREE.SphereGeometry(0.5, 12, 10), c3Prop('#f6d0b0'), 0.02); f.position.y = 1.9; g.add(f);
  const bd = c3Mesh(new THREE.ConeGeometry(0.55, 1.2, 12), c3Prop('#ffffff'), 0.02); bd.rotation.x = Math.PI; bd.position.set(0, 1.35, 0.25); g.add(bd); const nz = c3Mesh(new THREE.SphereGeometry(0.16, 8, 6), c3Prop('#e88a7a'), 0.01); nz.position.set(0, 1.9, 0.5); g.add(nz);
  const hat = c3Mesh(new THREE.ConeGeometry(0.62, 1.7, 12), c3Prop('#e8342a'), 0.025); hat.position.y = 2.95; hat.rotation.z = 0.15; g.add(hat); for (const s of [-1, 1]) { const e = c3Mesh(new THREE.SphereGeometry(0.07, 6, 6), SO.M.dark, 0); e.position.set(s * 0.18, 2.05, 0.45); g.add(e); g.add(rb(0.4, 0.3, 0.6, c3Prop('#5a3a20'), s * 0.32, 0.15, 0.1, 0.01)); } return g; }
function soTeddy() { const g = new THREE.Group(), b = c3Prop('#b8783e', { rough: 0.9 }); for (const [x, y, z, r] of [[0, 0.9, 0, 0.85], [0, 2.0, 0, 0.62], [-0.48, 2.5, 0, 0.24], [0.48, 2.5, 0, 0.24], [-0.7, 1.1, 0.2, 0.28], [0.7, 1.1, 0.2, 0.28], [-0.4, 0.2, 0.3, 0.3], [0.4, 0.2, 0.3, 0.3]]) { const m = c3Mesh(new THREE.SphereGeometry(r, 12, 8), b, 0.02); m.position.set(x, y, z); g.add(m); }
  const mz = c3Mesh(new THREE.SphereGeometry(0.24, 10, 8), c3Prop('#f0d0a8'), 0.01); mz.position.set(0, 1.9, 0.52); g.add(mz); return g; }

// small work items for the table gaps: tape gun, spray bottle, glove box, clipboard, box cutter + tag roll, coffee mug
function soItem(R, k) { const g = new THREE.Group(), M = SO.M;
  if (k === 0) { g.add(rb(1.6, 0.25, 0.5, c3Prop('#d8342a', { rough: 0.4 }), 0, 0.9, 0, 0)); const r = cyl(0.55, 0.55, 0.45, c3Prop('#c8a868', { rough: 0.3 }), -0.2, 0.75, 0, 0, 14); r.rotation.x = Math.PI / 2; g.add(r); g.add(rb(0.3, 0.9, 0.35, M.dark, 0.5, 0.45, 0, 0)); g.rotation.z = 0; }
  else if (k === 1) { g.add(cyl(0.38, 0.42, 1.5, c3Prop('#4ac0c8', { rough: 0.2 }), 0, 0.75, 0, 0, 12)); g.add(rb(0.35, 0.6, 0.35, c3Prop('#f2f0ea'), 0, 1.75, 0, 0)); g.add(rb(0.5, 0.2, 0.25, c3Prop('#f2f0ea'), 0.25, 1.95, 0, 0)); }
  else if (k === 2) { g.add(rb(1.8, 0.9, 1.0, c3Prop('#2f6fb8', { rough: 0.7 }), 0, 0.45, 0, 0)); g.add(rb(0.9, 0.08, 0.4, c3Prop('#f2f0ea'), 0, 0.92, 0, 0)); g.add(rb(0.5, 0.25, 0.3, c3Prop('#8ac0f0', { rough: 0.6 }), 0.1, 1.0, 0.05, 0)); }
  else if (k === 3) { g.add(rb(1.5, 0.08, 2.0, c3Prop('#8a5a2a', { rough: 0.6 }), 0, 0.04, 0, 0)); g.add(rb(1.3, 0.04, 1.7, c3Prop('#f6f2e6', { rough: 0.9 }), 0, 0.1, 0.1, 0)); g.add(rb(0.8, 0.14, 0.2, M.galv, 0, 0.14, -0.85, 0)); for (let l = 0; l < 5; l++) g.add(rb(0.9 - (l % 2) * 0.3, 0.02, 0.06, c3Prop('#7a7a84'), -0.1, 0.13, -0.4 + l * 0.28, 0)); }
  else if (k === 4) { g.add(rb(1.1, 0.2, 0.3, c3Prop('#f2c23a', { rough: 0.4 }), 0, 0.1, 0, 0)); g.add(rb(0.3, 0.06, 0.12, M.galv, 0.68, 0.1, 0, 0)); const r = cyl(0.45, 0.45, 0.4, c3Prop('#e8762a', { rough: 0.6 }), -0.2, 0.2, 1.0, 0, 14); g.add(r); g.add(cyl(0.18, 0.18, 0.42, c3Prop('#c8a868'), -0.2, 0.2, 1.0, 0, 10)); }
  else { g.add(cyl(0.36, 0.32, 0.8, c3Prop(['#f2f0ea', '#2f7a46', '#d8342a'][R.i(0, 2)], { rough: 0.3 }), 0, 0.4, 0, 0, 14)); const h = c3Mesh(new THREE.TorusGeometry(0.2, 0.06, 5, 10), c3Prop('#f2f0ea', { rough: 0.3 }), 0); h.position.set(0.38, 0.42, 0); g.add(h); g.add(cyl(0.3, 0.3, 0.02, c3Prop('#3a2010', { rough: 0.2 }), 0, 0.74, 0, 0, 12)); }
  return g; }
function soBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#6a7ad0', ambI: 0.3, sky: '#8a9ae8', ground: '#a06038', key: '#ffd8a0', keyI: 0.7, keyP: [30, 60, 70], rim: '#ffc890', rimI: 0.4, rimP: [-40, 30, -30] });
  const steelT = soTexSteel(), cardT = soTexCard(), woodT = soTexWood();
  SO.M = { steel: c3Prop('#a8aeb4', { map: steelT, metal: 0.6, rough: 0.34 }), steelD: c3Prop('#7a848e', { metal: 0.5, rough: 0.45 }), dark: c3Prop('#2a2a30', { rough: 0.5 }), yellow: c3Prop('#f2c23a', { rough: 0.5 }), orange: c3Prop('#e8762a', { rough: 0.45 }),
    lamp: c3Prop('#ffffff', { emissive: '#fff4dc', ei: 1.2, glow: '#fff6e0' }), white: c3Prop('#e6e8e6', { rough: 0.38 }), card: c3Prop('#ffffff', { map: cardT, rough: 0.92 }), wood: c3Prop('#ffffff', { map: woodT, rough: 0.9 }),
    galv: c3Prop('#9aa2a8', { metal: 0.6, rough: 0.42 }), red: c3Prop('#b8262a', { rough: 0.4 }), rubber: c3Prop('#1e1e22', { rough: 0.9 }), enamel: c3Prop('#e4e6e2', { rough: 0.5 }),
    tube: c3Prop('#ffffff', { emissive: '#fff6e8', ei: 1.5, glow: '#fff6e0' }), cord: c3Prop('#e8762a', { rough: 0.6 }), cordK: c3Prop('#1e1e22', { rough: 0.6 }), beige: c3Prop('#d8cfb8', { rough: 0.6 }) };
  const F = new THREE.Group(); scene.add(F);
  const KM = new THREE.Group(), KW = new THREE.Group(), KC = new THREE.Group(), KCeil = new THREE.Group(), KF = new THREE.Group();   // v3 bake roots (left/mountain, back wall, floor+right, ceiling, tables)
  const M = SO.M, wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = soTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  scene.add(pl(2 * SO_X, SO_Z, c3Prop('#ffffff', { map: soTexFloor(), rough: 0.6, env: 0.6 }), 0, 0, SO_Z / 2, 0, -Math.PI / 2));
  scene.add(plNC(2 * SO_X, SO_H, wallM(8), 0, SO_H / 2, 0)); scene.add(plNC(SO_Z, SO_H, wallM(6), -SO_X, SO_H / 2, SO_Z / 2, Math.PI / 2)); scene.add(plNC(SO_Z, SO_H, wallM(6), SO_X, SO_H / 2, SO_Z / 2, -Math.PI / 2));
  // ceiling: corrugated metal deck
  scene.add(plNC(2 * SO_X, SO_Z, c3Prop('#ffffff', { map: (() => { const t = tex((g, w, h) => { g.fillStyle = '#262a2d'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, 0, 10, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 16, 0, 6, h); } }, 256, 64); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 24); t.rotation = Math.PI / 2; return t; })(), rough: 0.7, metal: 0.3 }), 0, SO_H, SO_Z / 2, 0, Math.PI / 2));
  for (const z of [12, 32, 52, 72]) { KCeil.add(rb(2 * SO_X, 0.3, 1.0, M.steelD, 0, SO_H - 0.55, z, 0)); KCeil.add(rb(2 * SO_X, 0.3, 1.0, M.steelD, 0, SO_H - 1.85, z, 0)); KCeil.add(rb(2 * SO_X, 1.0, 0.18, M.steelD, 0, SO_H - 1.2, z, 0)); }   // I-beam trusses
  // ceiling services: a round supply duct with seams, hangers and diffusers; red sprinkler mains with heads; fluorescent fixtures on chains
  { const d = cyl(1.7, 1.7, 2 * SO_X, M.galv, 0, 35, 40, 0, 20); d.rotation.z = Math.PI / 2; KCeil.add(d);
    for (let x = -57; x < 60; x += 6) { const r = c3Mesh(new THREE.TorusGeometry(1.74, 0.09, 4, 20), M.galv, 0); r.rotation.y = Math.PI / 2; r.position.set(x, 35, 40); KCeil.add(r); }
    for (let x = -54; x < 60; x += 12) KCeil.add(cyl(0.06, 0.06, 3.4, M.dark, x, 38.3, 40, 0, 4));
    for (const x of [-30, 0, 30]) { KCeil.add(cyl(0.8, 0.8, 1.6, M.galv, x, 32.8, 40, 0, 12)); KCeil.add(rb(3.2, 0.4, 3.2, M.enamel, x, 31.9, 40, 0)); for (const k of [-0.9, 0, 0.9]) KCeil.add(rb(2.6, 0.08, 0.14, M.dark, x, 31.68, 40 + k, 0)); }
    for (const z of [22, 60]) { const p = cyl(0.25, 0.25, 2 * SO_X, M.red, 0, 37.4, z, 0, 8); p.rotation.z = Math.PI / 2; KCeil.add(p);
      for (let x = -55; x < 60; x += 10) { KCeil.add(cyl(0.09, 0.09, 0.9, M.red, x, 36.8, z, 0, 5)); KCeil.add(cyl(0.3, 0.3, 0.07, M.galv, x, 36.3, z, 0, 8)); } }
    for (const z of [22, 44, 66]) for (const x of [-42, -14, 14, 42]) { for (const cx of [-3.6, 3.6]) KCeil.add(cyl(0.05, 0.05, 6.6, M.dark, x + cx, SO_H - 3.3, z, 0, 4));
      KCeil.add(rb(9, 0.5, 1.9, M.enamel, x, SO_H - 6.85, z, 0)); for (const tz of [-0.45, 0.45]) { const tb = cyl(0.19, 0.19, 8.4, M.tube, x, SO_H - 7.25, z + tz, 0, 8); tb.rotation.z = Math.PI / 2; KCeil.add(tb); } } }
  // ---- back wall: washers, the counter board, bins, the pricing station, shelving racks, posters, a clock
  s.wash = []; for (let i = 0; i < 4; i++) { const x = -52 + i * 7.6, g = new THREE.Group(); g.position.set(x, 0, 3.6); scene.add(g);
    g.add(rb(7, 9.6, 6.4, M.white, 0, 4.8, 0, 0.035)); g.add(rb(7.2, 0.8, 6.6, M.steelD, 0, 0.4, 0, 0.02)); g.add(rb(6.2, 1.6, 0.3, c3Prop('#3a4a5a'), 0, 8.4, 3.25, 0.01));
    for (let k = 0; k < 3; k++) { const kn = c3Mesh(new THREE.SphereGeometry(0.22, 8, 6), c3Prop(['#e84a3a', '#f2c23a', '#3a9a5a'][k], { emissive: ['#e84a3a', '#f2c23a', '#3a9a5a'][k], ei: 0.5 }), 0); kn.position.set(-1.6 + k * 1.1, 8.4, 3.45); g.add(kn); }
    const ring = c3Mesh(new THREE.TorusGeometry(2.3, 0.35, 10, 28), M.steel, 0.025); ring.position.set(0, 4.4, 3.3); g.add(ring);
    const dr = new THREE.Mesh(new THREE.CircleGeometry(2.25, 32), c3Flat('#ffffff', { map: soTexDrum() })); dr.position.set(0, 4.4, 3.25); g.add(dr); s.wash.push(dr);
    // v3: vent elbow into the wall, water hoses, detergent jugs on top
    KW.add(cyl(0.55, 0.55, 1.6, M.galv, x + 2.4, 10.3, 1.4, 0, 10)); { const e = cyl(0.55, 0.55, 1.4, M.galv, x + 2.4, 11.1, 0.7, 0, 10); e.rotation.x = Math.PI / 2; KW.add(e); } KW.add(rb(1.6, 1.6, 0.15, M.galv, x + 2.4, 11.1, 0.08, 0));
    for (const [hx, c] of [[-2.2, '#c8282a'], [-1.4, '#2f6fb8']]) { KW.add(cyl(0.12, 0.12, 6, c3Prop(c, { rough: 0.5 }), x + hx, 6.5, 0.3, 0, 6)); KW.add(rb(0.5, 0.5, 0.3, M.galv, x + hx, 9.6 + 0.3, 0.2, 0)); }
    for (let k = 0; k < 2; k++) { const c = ['#e8762a', '#2f6fb8', '#f2f0ea', '#3a9a5a'][(i + k * 2) % 4], jx = x - 1.8 + k * 2.6 + (i % 2) * 0.4; KW.add(rb(1.1, 1.6, 0.8, c3Prop(c, { rough: 0.4 }), jx, 10.4, 1.8, 0)); KW.add(cyl(0.22, 0.22, 0.3, M.dark, jx + 0.3, 11.35, 1.8, 0, 8)); } }
  scene.add(pl(9, 6, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#2a2a30'; g.strokeRect(6, 6, w - 12, h - 12); inked(g, 'LAUNDRY', w / 2, h * 0.38, h * 0.22, '#2a2a30', { stroke: false }); inked(g, 'wash  dry  fold', w / 2, h * 0.7, h * 0.13, '#2a2a30', { stroke: false }); soWear(g, w, h, 'laun'); }, 384, 256) }), -41, 17.8, 0.12));   // v3: raised so s28's frame top never cuts its words
  s.board = canvasTex(1024, 400); s.boardM = new THREE.Mesh(new THREE.PlaneGeometry(28, 10.9), c3Flat('#ffffff', { map: s.board.t })); s.boardM.material.toneMapped = false; s.boardM.position.set(0, 29, 0.5); scene.add(s.boardM); scene.add(rb(29.4, 12.2, 0.6, M.dark, 0, 29, 0.1, 0.03));
  KW.add(rb(29.8, 0.4, 1.0, M.galv, 0, 22.6, 0.5, 0)); for (const x of [-12, 12]) KW.add(cyl(0.06, 0.06, 4.4, M.dark, x, 37.4, 0.4, 0, 4));   // board shelf + hangers
  { const bx = [['SHOES', '#2f6fb8'], ['BOOKS', '#d8342a'], ['ELECTRONICS', '#3a9a5a'], ['TOYS', '#8a4aa8']]; bx.forEach(([wd, c], i) => { const x = -22.6 + i * 5.9, g = new THREE.Group(); g.position.set(x, 0, 3.4); scene.add(g);
      g.add(rb(5.6, 5.2, 5.0, c3Prop(c, { rough: 0.5 }), 0, 2.6, 0, 0.03)); g.add(pl(5.0, 3.75, c3Flat('#ffffff', { map: soTexBin(wd, c) }), 0, 2.8, 2.52));
      for (let k = 0; k < 4; k++) { const it = rb(1.2 + (k % 2) * 0.6, 0.8, 1.0, c3Prop(SO_CASEC[(i * 3 + k) % 11]), -1.5 + k * 1.0, 5.4, -0.8 + (k % 2) * 1.2, 0.012); it.rotation.y = k; g.add(it); } }); }
  { const [px, pz] = SO_PRICE, g = new THREE.Group(); g.position.set(px, 0, pz); F.add(g); g.add(rb(9, 0.5, 4.2, M.steel, 0, SO_TOP, 0, 0.03)); g.add(rb(8.6, SO_TOP - 0.25, 4, c3Prop('#e8762a', { rough: 0.5 }), 0, (SO_TOP - 0.25) / 2, 0, 0.03));
    for (let k = 0; k < 4; k++) { const r = cyl(0.55, 0.55, 0.5, c3Prop('#f6efe0'), -3.2 + k * 1.2, SO_TOP + 0.55, -1.1, 0.012, 14); r.rotation.x = Math.PI / 2; g.add(r); }
    const g2 = soGun(); g2.position.set(2.6, SO_TOP + 0.25, -0.8); g2.rotation.set(0, 0, -Math.PI / 2); g.add(g2);
    g.add(pl(7, 2.2, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#2a2a30'; x.fillRect(0, 0, w, h); inked(x, 'PRICING', w / 2, h / 2, h * 0.6, '#f2c23a', { stroke: false }); }, 512, 160) }), 0, SO_TOP - 1.2, 2.05));
    // v3: a warm gooseneck lamp (a practical you can see) + its pool of light
    g.add(cyl(0.55, 0.65, 0.25, M.dark, -3.9, SO_TOP + 0.38, 1.3, 0, 12)); { const a = cyl(0.08, 0.08, 2.6, M.dark, -3.9, SO_TOP + 1.6, 1.0, 0, 6); a.rotation.x = -0.25; g.add(a); }
    { const sh = c3Mesh(new THREE.ConeGeometry(0.7, 1.0, 14, 1, true), c3Prop('#2f7a46', { rough: 0.45 }), 0); sh.material.side = THREE.DoubleSide; sh.position.set(-3.9, SO_TOP + 2.8, 0.55); sh.rotation.x = 0.5; g.add(sh);
      const bl = c3Mesh(new THREE.SphereGeometry(0.3, 10, 8), c3Prop('#ffffff', { emissive: '#ffd8a0', ei: 2, glow: '#ffd8a0' }), 0); bl.position.set(-3.9, SO_TOP + 2.45, 0.45); g.add(bl); }
    const pl0 = new THREE.PointLight('#ffc888', 0.9, 14, 2); pl0.position.set(px - 3.9, SO_TOP + 2.2, pz + 0.8); pl0.layers.enableAll(); scene.add(pl0); }
  s.racks = []; for (let i = 0; i < 3; i++) { const x = SO_SHELF[0] + 5 + i * 10.4, g = new THREE.Group(); g.position.set(x, 0, 3.0); KW.add(g); s.racks.push(g);
    for (const sx of [-4.9, 4.9]) for (const sz of [-1.9, 1.9]) g.add(rb(0.35, 21, 0.35, c3Prop('#e8762a'), sx, 10.5, sz, 0));
    for (const sx of [-4.9, 4.9]) for (let y = 3; y < 20; y += 4.6) { const b = rb(0.12, 4.6, 0.12, c3Prop('#e8762a'), sx, y + 1.6, 0, 0); b.rotation.x = 0.85; g.add(b); }   // cross bracing
    for (let k = 0; k < 5; k++) { const y = 1 + k * 4.6; g.add(rb(10, 0.3, 4.2, M.steelD, 0, y, 0, 0)); if (k < 4) scene.add(pl(9.6, 3.8, c3Flat('#ffffff', { map: soTexShelf(i * 5 + k) }), x, y + 2.05, 4.6)); } }
  { const P = [[0, -50, 22], [1, 50, 15], [2, 20, 16]]; for (const [k, x, y] of P) scene.add(pl(5, 7, c3Flat('#ffffff', { map: soTexPoster(k) }), x, y, 0.15)); }
  scene.add(pl(5, 7, c3Flat('#ffffff', { map: soTexPoster(0) }), SO_X - 0.15, 16, 30, -Math.PI / 2)); scene.add(pl(5, 7, c3Flat('#ffffff', { map: soTexPoster(1) }), -SO_X + 0.15, 16, 70, Math.PI / 2));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.3, 28), [M.dark, c3Flat('#ffffff', { map: texClock() }), M.dark], 0.02); c.rotation.x = Math.PI / 2; c.position.set(-28, 26, 0.2); scene.add(c); }
  // ---- v3 back-wall services: conduit run + drops, outlets, the break notice board, the time clock + card racks, a forklift
  // warning sign, a fire extinguisher, an electrical panel, flattened boxes, a hand truck, an extension cord to the pricing station
  { const cnd = cyl(0.16, 0.16, 106, M.galv, 5, 21, 0.35, 0, 6); cnd.rotation.z = Math.PI / 2; KW.add(cnd);
    for (const x of [-47.6, -24.5, 23.5, 58]) KW.add(cyl(0.16, 0.16, x === 23.5 ? 10.7 : 17.6, M.galv, x + (x === 23.5 ? 0 : 0.6), x === 23.5 ? 15.65 : 12.2, 0.35, 0, 6));
    for (const x of [-47.6, -24.5, 58]) KW.add(rb(0.9, 0.9, 0.45, M.galv, x + 0.6, 3.4, 0.3, 0));
    KW.add(rb(0.55, 0.85, 0.12, M.beige, 12.6, 2.4, 0.1, 0));
    scene.add(pl(7, 5.25, c3Prop('#ffffff', { map: soTexNotice(), rough: 0.9 }), -15, 13, 0.18)); KW.add(rb(7.3, 5.5, 0.2, M.dark, -15, 13, 0.06, 0));
    KW.add(rb(2, 2.6, 1.1, M.beige, -7, 10, 0.6, 0)); { const f = new THREE.Mesh(new THREE.CircleGeometry(0.65, 20), c3Flat('#ffffff', { map: texClock() })); f.position.set(-7, 10.5, 1.17); scene.add(f); } KW.add(rb(1.2, 0.3, 0.3, M.dark, -7, 9.1, 1.2, 0));
    for (const rx of [-9.3, -4.7]) { KW.add(rb(1.5, 3.6, 0.5, c3Prop('#5a6068', { metal: 0.4, rough: 0.5 }), rx, 10, 0.3, 0)); for (let k = 0; k < 7; k++) KW.add(rb(0.9, 0.6, 0.06, c3Prop(k % 3 ? '#efe6cc' : '#d8c890', { rough: 0.8 }), rx + ((k * 37) % 5 - 2) * 0.04, 8.6 + k * 0.45, 0.6, 0)); }
    scene.add(pl(4.8, 2.4, c3Flat('#ffffff', { map: soTexSign('FORKLIFTS', 'Look both ways before crossing', '#f2c23a', '#2a2a30', 'fork') }), 14.6, 13.5, 0.15));
    KW.add(rb(0.9, 0.3, 0.5, M.dark, 10.5, 5.1, 0.35, 0)); KW.add(cyl(0.55, 0.55, 2.4, M.red, 10.5, 3.6, 0.85, 0, 14)); KW.add(cyl(0.2, 0.25, 0.5, M.dark, 10.5, 5.05, 0.85, 0, 8)); KW.add(rb(0.6, 0.15, 0.2, M.dark, 10.8, 5.3, 0.85, 0));
    { const h = cyl(0.07, 0.07, 1.8, M.dark, 10.0, 3.9, 1.25, 0, 5); h.rotation.z = 0.3; KW.add(h); } scene.add(pl(2.4, 1.2, c3Flat('#ffffff', { map: soTexSign('FIRE', 'EXTINGUISHER', '#c8282a', '#ffffff', 'fire') }), 10.5, 6.6, 0.15));
    KW.add(rb(3.2, 4.6, 0.6, c3Prop('#8a9098', { metal: 0.45, rough: 0.45 }), 23.5, 8, 0.35, 0)); KW.add(rb(0.1, 4.2, 0.08, M.dark, 23.5, 8, 0.67, 0)); KW.add(rb(0.2, 0.6, 0.15, M.dark, 24.1, 8.2, 0.7, 0));
    scene.add(pl(1.6, 0.8, c3Flat('#ffffff', { map: soTexSign('DANGER', '480 V', '#c8282a', '#ffffff', 'volt') }), 23.5, 9.4, 0.71));
    for (let k = 0; k < 3; k++) { const b = rb(4.4, 4.2, 0.14, M.card, 15.4 + k * 0.4, 2.1, 0.5 + k * 0.22, 0); b.rotation.x = -0.12 - k * 0.04; KW.add(b); }
    { const g = soAt(new THREE.Group(), 19.6, 0, 1.6, 0, -0.18); for (const sx of [-0.9, 0.9]) g.add(cyl(0.12, 0.12, 6, M.red, sx, 3.4, 0, 0, 6)); for (const y of [2, 4, 6]) g.add(rb(1.9, 0.14, 0.14, M.red, 0, y, 0, 0));
      g.add(rb(2.2, 0.15, 1.3, M.galv, 0, 0.4, 0.6, 0)); for (const sx of [-1.3, 1.3]) { const w = cyl(0.55, 0.55, 0.35, M.rubber, sx, 0.55, -0.2, 0, 12); w.rotation.z = Math.PI / 2; g.add(w); } KW.add(g); }
    const cord = (pts, m, r = 0.09) => { const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 5), m); KW.add(c); };
    cord([[12.6, 2.4, 0.2], [12.4, 0.8, 0.5], [12, 0.1, 1.4], [10.6, 0.1, 3.4], [9.4, 0.1, 5.0], [8.6, 0.12, 5.6]], M.cord); KW.add(rb(2.2, 0.32, 0.6, M.beige, 7.6, 0.16, 5.6, 0));
    cord([[7.0, 0.2, 5.7], [6.4, 0.1, 6.2], [6.6, 0.15, 6.9], [7.2, 1.2, 7.0], [7.4, 3.6, 7.0]], M.cordK, 0.07); }
  // ---- the MOUNTAIN of suitcases (left wall): hard shells, duffels, soft cases with straps and tags, all different
  { const R = RNG('somount'), RB = RNG('sobagv'); for (let L = 0; L < 7; L++) { const n = Math.max(1, 12 - L * 2), rad = (6.5 - L) * 2.3; for (let i = 0; i < n; i++) { const a = (i + R.f() * 0.6) / n * Math.PI - Math.PI / 2, w = R.r(4.4, 6.6), h = R.r(2.6, 3.6);
      const cs = soBag(RB, w, h, R.r(3.4, 4.6), SO_MOUNTC[Math.floor(RB.f() * SO_MOUNTC.length)]); cs.position.set(-60 + 4 + Math.cos(a) * rad * 0.9, L * 3.1, 46 + Math.sin(a) * rad * 1.3); cs.rotation.set(R.n(0.18), R.f() * TAU, R.n(0.18)); KM.add(cs); } } }
  { const x0 = -42, x1 = 22, len = x1 - x0, cz = 26;
    for (const sz of [-2.1, 2.1]) KM.add(rb(len, 0.8, 0.35, c3Prop('#e8762a'), (x0 + x1) / 2, 4.2, cz + sz, 0));
    scene.add(pl(len, 4, c3Prop('#ffffff', { map: (() => { const t = tex((x, w, h) => { x.fillStyle = '#5a646e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const gr = x.createLinearGradient(i * w / 16, 0, (i + 1) * w / 16, 0); gr.addColorStop(0, '#9aa4ae'); gr.addColorStop(0.5, '#e8eef4'); gr.addColorStop(1, '#6a747e'); x.fillStyle = gr; x.fillRect(i * w / 16 + 2, 0, w / 16 - 4, h); } }, 512, 64); t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 4, 1); return t; })(), metal: 0.4, rough: 0.35 }), (x0 + x1) / 2, 4.1, cz, 0, -Math.PI / 2));
    for (let x = x0 + 2; x < x1; x += 8) { for (const sz of [-1.9, 1.9]) KM.add(cyl(0.18, 0.18, 4, M.steelD, x, 2, cz + sz, 0, 6)); KM.add(rb(0.3, 0.3, 3.8, M.steelD, x, 1.0, cz, 0)); for (const sz of [-1.9, 1.9]) KM.add(cyl(0.35, 0.35, 0.15, M.dark, x, 0.08, cz + sz, 0, 8)); }
    const R = RNG('soconv'), RB = RNG('soconvb'); for (let x = x0 + 4; x < x1 - 4; x += R.r(6, 9)) { const cs = soBag(RB, R.r(3.6, 4.6), R.r(1.4, 1.8), R.r(2.6, 3.2), SO_MOUNTC[Math.floor(R.f() * SO_MOUNTC.length)]); cs.position.set(x, 4.2, cz); cs.rotation.y = R.n(0.3); KM.add(cs); } }
  // left wall: conduit, a return-air grille, a KEEP CLEAR sign over the mountain
  { const c = cyl(0.16, 0.16, 82, M.galv, -59.6, 21, 42, 0, 6); c.rotation.x = Math.PI / 2; KM.add(c); KM.add(rb(0.3, 4, 6, M.galv, -59.8, 30, 16, 0)); for (let k = 0; k < 7; k++) KM.add(rb(0.35, 0.12, 5.6, M.dark, -59.65, 28.4 + k * 0.5, 16, 0));
    scene.add(pl(8, 4, c3Flat('#ffffff', { map: soTexSign('KEEP CLEAR', 'Do not stack bags above this line', '#f2c23a', '#2a2a30', 'keep') }), -SO_X + 0.15, 28, 46, Math.PI / 2)); }
  // ---- tables: rows A, B, C with bags and clothes piles (+ v3 small work items in the gaps)
  { const R = RNG('sotab'), RI = RNG('soitem'); SO_TB.forEach((z, j) => { KF.add(soTable(0, z, 56)); const occ = [];
      for (let x = -24; x < 26; x += R.r(7, 11)) { if (j === 1 && x > -16 && x < 9) continue; if (j === 0 && (Math.abs(x + 14) < 4 || Math.abs(x - 15) < 4)) continue; occ.push(x);
        if (R.f() < 0.5) { const bg = suitcase3D({ color: SO_CASEC[Math.floor(R.f() * 11)], sticker: R.f() < 0.5 ? false : '#f2c23a', scale: 1.2 }); bg.userData.open(R.f() < 0.5 ? 1 : 0); bg.position.set(x, SO_TOP, z + R.n(0.6)); bg.rotation.y = R.n(0.2); F.add(bg); }
        else for (let k = 0; k < R.i(2, 4); k++) { const f = soFolded(SO_CASEC[Math.floor(R.f() * 11)]); f.position.set(x, SO_TOP + k * 0.34, z + R.n(0.8)); f.rotation.y = R.n(0.3); F.add(f); } }
      const busy = j === 1 ? [-8.2, 1.6, -4] : j === 0 ? [-13.4, 14.4] : [];
      let kk = j; for (let x = -26; x <= 26; x += 1) { if (occ.concat(busy).some((o) => Math.abs(o - x) < 5)) continue; const it = soItem(RI, kk++ % 6); it.position.set(x, SO_TOP, z + (j === 1 ? -1.6 : 1.4) + RI.n(0.4)); it.rotation.y = RI.n(1.2); KF.add(it); occ.push(x); } }); }
  // ---- right wall: pallets with shrink-wrapped bag stacks, a steel exit door with its glowing EXIT sign, an extinguisher
  { const RB = RNG('sopal'); for (const z of [36, 52, 68]) { soPallet(KC, 54, 0, z, 0, 8, 8);
      for (let L = 0; L < 3; L++) for (let q = 0; q < 2; q++) { const b = soBag(RB, 7.0, RB.r(2.0, 2.4), 3.3, SO_MOUNTC[RB.i(0, SO_MOUNTC.length - 1)], L === 1 ? 0.7 : RB.f()); b.position.set(54, 0.95 + L * 2.5, z - 1.75 + q * 3.5); b.rotation.y = RB.n(0.04); KC.add(b); }
      const wr = rb(7.4, 7.8, 7.4, (() => { const m = c3Prop('#e8f2f8', { rough: 0.12, env: 1.4, transparent: true }); m.opacity = 0.3; m.depthWrite = false; return m; })(), 54, 4.95, z, 0); wr.userData.noCast = true; scene.add(wr);
      scene.add(pl(5, 3, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.lineWidth = 8; x.strokeStyle = '#2a2a30'; x.strokeRect(4, 4, w - 8, h - 8); inked(x, 'LOT ' + (4400 + z), w / 2, h * 0.5, h * 0.3, '#2a2a30', { stroke: false }); }, 320, 192) }), 50.25, 6, z, -Math.PI / 2)); } }
  { const X = SO_X; KC.add(rb(0.3, 13.6, 7, c3Prop('#6a7480', { metal: 0.35, rough: 0.5 }), X - 0.25, 6.8, 14, 0)); for (const z of [10.2, 17.8]) KC.add(rb(0.6, 14.4, 0.6, M.dark, X - 0.3, 7.2, z, 0)); KC.add(rb(0.6, 0.6, 8.2, M.dark, X - 0.3, 14.1, 14, 0));
    KC.add(rb(0.4, 0.35, 5, M.galv, X - 0.6, 6.4, 14, 0)); KC.add(rb(0.1, 2.4, 1.6, c3Prop('#2a3440', { rough: 0.1, env: 1.4 }), X - 0.42, 10.6, 15.6, 0)); KC.add(rb(0.6, 1.4, 3.2, M.dark, X - 0.35, 16.2, 14, 0));
    { const e = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.1), c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#1a0806'; g.fillRect(0, 0, w, h); inked(g, 'EXIT', w / 2, h * 0.52, h * 0.7, '#ff3a2a', { stroke: false }); }, 256, 100), glow: '#ff3a2a' })); e.material.userData.glow = '#ff3a2a'; e.position.set(X - 0.67, 16.2, 14); e.rotation.y = -Math.PI / 2; scene.add(e); }
    scene.add(pl(4, 2, c3Flat('#ffffff', { map: soTexSign('STAFF ONLY', 'Keep this door closed', '#2f7a46', '#ffffff', 'staff') }), X - 0.15, 9.5, 21.5, -Math.PI / 2));
    KC.add(rb(0.3, 0.9, 0.5, M.dark, X - 0.35, 5.1, 26, 0)); KC.add(cyl(0.55, 0.55, 2.4, M.red, X - 0.85, 3.6, 26, 0, 14)); KC.add(cyl(0.2, 0.25, 0.5, M.dark, X - 0.85, 5.05, 26, 0, 8));
    { const c = cyl(0.16, 0.16, 70, M.galv, X - 0.4, 21, 47, 0, 6); c.rotation.x = Math.PI / 2; KC.add(c); } KC.add(rb(0.45, 0.85, 0.55, M.beige, X - 0.1, 2.6, 44, 0)); }
  // ---- v3 floor clutter: a gaylord of bags on a pallet, a canvas laundry cart, grey trash cans, a pallet jack, stretch-wrap rolls
  { const gay = (x, z, ry, seed) => { const RB = RNG('sogay', seed); soPallet(KC, x, 0, z, ry, 7, 7); const g = soAt(new THREE.Group(), x, 0.92, z, ry);
      for (const [a, b, w, d] of [[0, 3.2, 6.6, 0.25], [0, -3.2, 6.6, 0.25], [3.2, 0, 0.25, 6.6], [-3.2, 0, 0.25, 6.6]]) g.add(rb(w, 5.0, d, M.card, a, 2.5, b, 0)); g.add(rb(6.4, 0.2, 6.4, M.card, 0, 3.6, 0, 0));
      for (let k = 0; k < 5; k++) { const b = soBag(RB, RB.r(2.6, 3.4), RB.r(1.4, 1.9), RB.r(1.8, 2.4), SO_MOUNTC[RB.i(0, SO_MOUNTC.length - 1)]); b.position.set(RB.n(1.4), 3.7 + (k > 2 ? 1.4 : 0), RB.n(1.4)); b.rotation.set(RB.n(0.3), RB.f() * TAU, RB.n(0.3)); g.add(b); }
      KC.add(g); };
    gay(25, 18, 0.1, 1);
    { const g = soAt(new THREE.Group(), -20, 0, 16, 0.25); g.add(rb(5, 3.6, 3.4, c3Prop('#34507a', { rough: 0.92 }), 0, 2.7, 0, 0)); g.add(rb(5.2, 0.25, 3.6, M.galv, 0, 4.55, 0, 0)); g.add(rb(5.2, 0.4, 3.6, M.galv, 0, 0.8, 0, 0));
      for (const [a, b] of [[-2.2, -1.4], [2.2, -1.4], [-2.2, 1.4], [2.2, 1.4]]) { g.add(cyl(0.08, 0.08, 0.5, M.galv, a, 0.45, b, 0, 5)); const w = cyl(0.3, 0.3, 0.25, M.rubber, a, 0.3, b, 0, 10); w.rotation.x = Math.PI / 2; g.add(w); }
      const RB = RNG('socart'); for (let k = 0; k < 5; k++) { const f = soFolded(SO_CASEC[RB.i(0, 10)], 1.6, 1.2); f.position.set(-1.4 + (k % 3) * 1.4, 4.2 + Math.floor(k / 3) * 0.32, RB.n(0.8)); f.rotation.y = RB.n(0.5); g.add(f); } KM.add(g); }
    for (const [x, z] of [[33, 42], [33, 63], [-2.6, 12.4]]) { const g = soAt(new THREE.Group(), x, 0, z); g.add(cyl(1.3, 1.15, 3.8, c3Prop('#5a6066', { rough: 0.6 }), 0, 1.9, 0, 0, 18)); g.add(cyl(1.42, 1.42, 0.25, c3Prop('#4a5056', { rough: 0.6 }), 0, 3.8, 0, 0, 18));
      g.add(cyl(1.3, 1.3, 0.05, c3Prop('#1a1a1e', { rough: 0.3 }), 0, 3.93, 0, 0, 18)); for (const a of [0, Math.PI]) g.add(rb(0.8, 0.3, 0.3, c3Prop('#4a5056'), Math.cos(a) * 1.35, 3.2, Math.sin(a) * 1.35, 0)); (x < 0 ? KW : KC).add(g); }
    { const g = soAt(new THREE.Group(), 15, 0, 9.5); for (const sx of [-1.3, 1.3]) { g.add(rb(1.0, 0.45, 9, c3Prop('#d8b020', { rough: 0.5 }), sx, 0.35, 5.4, 0)); const w = cyl(0.2, 0.2, 0.8, M.dark, sx, 0.2, 9.6, 0, 8); w.rotation.z = Math.PI / 2; g.add(w); }
      g.add(rb(3.6, 1.3, 1.4, c3Prop('#d8b020', { rough: 0.5 }), 0, 0.9, 0.5, 0)); { const hd = cyl(0.13, 0.13, 4.6, M.dark, 0, 3.4, -0.4, 0, 6); hd.rotation.x = -0.35; g.add(hd); } { const t = cyl(0.12, 0.12, 1.6, M.dark, 0, 5.55, -1.2, 0, 6); t.rotation.z = Math.PI / 2; g.add(t); }
      { const w = cyl(0.6, 0.6, 0.5, M.rubber, 0, 0.6, 0.4, 0, 12); w.rotation.z = Math.PI / 2; g.add(w); } KC.add(g); }
    { const r1 = cyl(0.55, 0.55, 3.2, c3Prop('#e6eef2', { rough: 0.15, env: 1.4 }), 47, 0.55, 29, 0, 14); r1.rotation.z = Math.PI / 2; r1.rotation.y = 0.4; KC.add(r1); KC.add(cyl(0.55, 0.55, 3.2, c3Prop('#e6eef2', { rough: 0.15, env: 1.4 }), 49.5, 1.6, 30.5, 0, 14)); KC.add(cyl(0.2, 0.2, 3.3, M.card, 49.5, 1.6, 30.5, 0, 8)); } }
  // ---- FOCUS: the worker's bags, the DONATE gaylord, the price gun, the burst items, the snake, the tag
  { const g = new THREE.Group(); g.position.set(SO_DON[0], 0, SO_DON[1]); F.add(g); soPallet(g, 0, 0, 0, 0, 9, 9);
    const bm = SO.M.card; for (const [x, z, w, d] of [[0, 4.2, 8.4, 0.3], [0, -4.2, 8.4, 0.3], [4.2, 0, 0.3, 8.4], [-4.2, 0, 0.3, 8.4]]) g.add(rb(w, 5.4, d, bm, x, 3.7, z, 0.03));
    g.add(pl(6.6, 4.9, c3Flat('#ffffff', { map: soTexDonate() }), 0, 3.7, 4.37)); g.add(rb(8.2, 0.3, 8.2, c3Prop('#8a6a3a'), 0, 3.2, 0, 0));
    for (let k = 0; k < 6; k++) { const f = soFolded(SO_CASEC[k * 2 % 11], 2, 1.6); f.position.set(-2 + (k % 3) * 2, 3.4 + Math.floor(k / 3) * 0.4 + 1.2, -1.5 + (k % 2) * 2.4); f.rotation.y = k; g.add(f); }
    s.donate = g; }
  const inside1 = new THREE.Group(); [['#3a9a5a', -0.9, 0.2], ['#f2c23a', 0.9, -0.2], ['#e84a3a', 0.9, 0.4]].forEach(([c, x, z]) => { const f = soFolded(c); f.position.set(x, 0, z); inside1.add(f); }); s.shirtIn = soFolded('#e8eef6', 1.7, 1.2); s.shirtIn.position.set(-0.6, 0.34, 0.3); inside1.add(s.shirtIn);
  s.bag1 = suitcase3D({ color: '#2f6fb8', tag: 'LAX', inside: inside1, scale: 1.4 }); s.bag1.position.set(SO_BAG1[0], SO_TOP, SO_BAG1[1]); F.add(s.bag1);
  s.bag2 = suitcase3D({ color: '#e84a3a', sticker: '#4ac0c8', tag: 'MIA', scale: 1.4 }); s.bag2.position.set(SO_BAG2[0], SO_TOP, SO_BAG2[1]); F.add(s.bag2);
  const inside3 = new THREE.Group(); { const f = soFolded('#a85a2a', 2.6, 1.8); f.position.set(0.3, 0, -0.3); inside3.add(f); }
  s.bag3 = suitcase3D({ color: '#3a9a5a', sticker: '#e8762a', tag: 'PHX', inside: inside3, scale: 1.4 }); s.bag3.position.set(SO_BAG2[0], SO_TOP, SO_BAG2[1]); F.add(s.bag3);
  // soB's strange bag: a purple case with a glowing inside
  const inside4 = new THREE.Group(); s.glow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), c3Flat('#ffffff', { map: tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, '#b8ffe8'); gr.addColorStop(1, '#2ad8a8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 256, 160) }));
  s.glow.material.toneMapped = false; s.glow.material.userData.glow = '#7affd8'; s.glow.rotation.x = -Math.PI / 2; s.glow.position.y = 0.12; inside4.add(s.glow);
  s.bag4 = suitcase3D({ color: '#6a3a8a', sticker: '#f2c23a', tag: '???', inside: inside4, scale: 1.3, lining: '#1a1a2a' }); s.bag4.position.set(SO_EXTRA.soB[0] + 0.6, SO_TOP, 34.4); F.add(s.bag4);
  s.glowL = new THREE.PointLight('#7affd8', 0, 14, 2); s.glowL.position.set(SO_EXTRA.soB[0] + 0.6, SO_TOP + 2.5, 34.6); scene.add(s.glowL);
  // the sorters' own bags (s26) in front of soB/soD/soA
  s.bagsX = [[SO_EXTRA.soD[0] - 0.6, 34.4, '#f2c23a']].map(([x, z, c]) => { const b = suitcase3D({ color: c, sticker: false, scale: 1.3 }); b.position.set(x, SO_TOP, z); F.add(b); return b; });
  s.gun = soGun(); F.add(s.gun); s.gun2 = soGun(); F.add(s.gun2);
  s.tag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: soTexTag('$4.99'), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); s.tag.renderOrder = 6; F.add(s.tag);
  s.tag2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: soTexTag('$7.99'), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); s.tag2.renderOrder = 6; F.add(s.tag2);
  s.shelfItem = soCaseBox(3.2, 2.2, 2.4, '#4ac0c8', 0.02); F.add(s.shelfItem);
  s.priceBag = soCaseBox(3.2, 1.6, 2.4, '#e84a8a', 0.02); s.priceBag.position.set(SO_PRICE[0] + 0.6, SO_TOP + 0.25, SO_PRICE[1] + 0.4); F.add(s.priceBag);
  s.chicken = soChicken(); s.ball = soBall(); s.gnome = soGnome(); s.teddy = soTeddy(); [s.chicken, s.ball, s.gnome, s.teddy].forEach((m) => F.add(m));
  s.socks = []; for (let i = 0; i < 14; i++) { const k = soSock(['#e84a3a', '#f2c23a', '#2f6fb8', '#3a9a5a', '#d84a8a', '#e8762a', '#8a4aa8'][i % 7]); F.add(k); s.socks.push(k); }
  s.burst = spritePlane(scene, texBurst(''), 6, 6, 4);
  for (const K of [KM, KW, KC]) scene.add(soBake(K)); scene.add(soBake(KCeil, { noCast: true, ao: false })); F.add(soBake(KF));   // v3: static clutter baked (draw calls)
  c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'worker'); for (const k of Object.keys(SO_EXTRA)) toonPerson(s, k);
  toonPet(s, 'snake', Object.assign({}, PETS.snake, { size: 2.4 }));
  haze(scene, '#3a4c8c', 0.0035);   // v5: blue air
  c3Env(scene, { top: '#c8ccf0', mid: '#4a5aa0', bot: '#5a3020' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 1.1, scale: 0.5, inkSet: false, bounce: ['#c8d0ff', '#a05a30', 0.08], lights: [], shafts: [[[-22, 40, 30], [-28, 0, 44], 3, 8, '#ffe6b0', 0.09], [[18, 40, 24], [12, 0, 38], 3, 8, '#ffe6b0', 0.09]] });   // v3: Ricks-like set (setlook.js)
  // v4 lighting (Ricks): a cool-white pool on the floor under every fluorescent fixture (falloff between them, darker
  // ceiling and upper walls), two skylights whose warm sun patches match the light shafts
  for (const z of [22, 44, 66]) for (const x of [-42, -14, 14, 42]) { const l = new THREE.SpotLight('#ffe2a8', SO_POOL, 46, 0.78, 1.0, 1.6); l.position.set(x, SO_H - 7.6, z); l.target.position.set(x, 0, z + 1.5); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  for (const [a, b] of [[[-22, 40, 30], [-28, 0, 44]], [[18, 40, 24], [12, 0, 38]]]) { const sky = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), c3Flat('#fff8e8', { glow: '#fff4dc' })); sky.material.userData.glow = '#fff4dc'; sky.material.toneMapped = false; sky.rotation.x = Math.PI / 2; sky.position.set(a[0], SO_H - 0.05, a[2]); c3Layer(sky, C3.L_BG); scene.add(sky);
    for (const [w, d, dx, dz] of [[10, 0.6, 0, 3.8], [10, 0.6, 0, -3.8], [0.6, 8, 4.8, 0], [0.6, 8, -4.8, 0], [0.3, 7, 0, 0]]) { const fr = rb(w, 0.9, d, M.steelD, a[0] + dx, SO_H - 0.45, a[2] + dz, 0); fr.userData.noCast = true; c3Layer(fr, C3.L_BG); scene.add(fr); }
    const l = new THREE.SpotLight('#ffe2b0', SO_SUNI, 70, 0.2, 0.55, 1.0); l.position.set(...a); l.target.position.set(...b); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  return s;
}
const soGet = () => SO.s ||= soBuild();
SETS.sort = soGet;
const soCount = (t) => t < 40.32 ? 7214 : t < 43.36 ? 7214 + Math.floor(26 * EZ.io(clamp((t - 40.5) / 2.6))) : 7240 + Math.floor((t - 43.36) * 3);
function soReset(s, t) { hideAll(s); hideGrips(s); [s.gun, s.gun2, s.tag, s.tag2, s.shelfItem, s.chicken, s.ball, s.gnome, s.teddy, s.burst, ...s.socks].forEach((m) => { m.visible = false; });
  s.bag1.userData.open(0); s.bag2.userData.open(0); s.bag3.userData.open(0); s.bag4.userData.open(0); s.bag2.visible = true; s.bag3.visible = false; s.shirtIn.visible = true; s.glowL.intensity = 0; s.glow.visible = true;
  s.bag2.position.set(SO_BAG2[0], SO_TOP, SO_BAG2[1]); s.bag2.rotation.set(0, 0, 0); s.bag2.scale.setScalar(1.4); s.bagsX.forEach((b) => b.userData.open(0));
  const n = soCount(t); redraw(s.board, 'n' + n, soTexBoard(n)); s.wash.forEach((d, i) => { d.rotation.z = -t * (1.2 + i * 0.15); }); }
const soCam = (s, id, lt, K) => c3SetCam(s.cam, camMove(K, lt, id));
const soRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#1a2a24', bgBlur: 2.0, glow: 0.4, glowBlur: 12, grade: 'saturate(1.04) contrast(1.16) brightness(0.94)' }, o));
// the worker at his spot behind table B
function soMe(s, t, o = {}) { const [x, z] = o.at || SO_ME; return pose(s, 'worker', t, x, z, Object.assign({ facing: 0, expr: 'neutral', hand: { L: 'desk', R: 'desk' } }, o)); }
// the extras at their places (s26 + background of other shots): opening bags in a loop
function soExtras(s, t, skip = []) { const E = SO_EXTRA;
  if (!skip.includes('soB')) pose(s, 'soB', t, ...E.soB, { facing: 0.3, expr: 'neutral', hand: { L: 'desk', R: 'desk' } });
  if (!skip.includes('soD')) { const ph = (t * 0.9) % 1; pose(s, 'soD', t, ...E.soD, { facing: -0.4, expr: ph > 0.5 ? 'happy' : 'neutral', hand: { L: 'desk', R: ph > 0.5 ? 'up' : 'desk' } }); s.bagsX[0].userData.open(ph > 0.5 ? 1 : 0.15); }
  if (!skip.includes('soA')) { pose(s, 'soA', t, ...E.soA, { facing: 0.5, expr: 'smile', hand: { L: 'desk', R: { h: [0.3, 0.3], pole: [1, 0.4], hand: 'grip', front: true } } }); gripProp(s, s.gun2, 'soA', 'R', V3(0, 0.2, 0), { behind: -0.05, rz: 0.1 }); gripDot(s, 'soA', 'R'); }
  if (!skip.includes('soC')) pose(s, 'soC', t, ...E.soC, { facing: -0.6, expr: 'neutral', hand: { L: 'down', R: 'hold' }, prop: { R: { kind: 'shirt', color: '#d84a8a' } } });
}

// ---- s09: opens it, and sells everything inside — he snaps the bag open, lifts out a shirt, the price gun tags it on "sells"
SHOT_FN.s09 = (t, u, lt) => { const s = soGet(); soReset(s, t);
  soCam(s, 's09', lt, [[0, [-1.5, 14.2, 73], [-4, 7.0, 46], 40], [1.9, [-3, 13.6, 69], [-4.5, 7.2, 46], 40]]);
  const op = EZ.o3(clamp((t - 10.94) / 0.14)); s.bag1.userData.open(op); const lift = t >= 11.46; s.shirtIn.visible = !lift;
  soMe(s, t, { expr: [[0, 'determined'], [10.94, 'happy'], [11.52, 'grin']], hand: { L: [[0, 'desk'], [10.94, 'up'], [11.3, 'desk'], [11.46, { h: [0.42, -0.42], pole: [1, 0.7], hand: 'grip' }]], R: [[0, 'desk'], [10.94, 'up'], [11.3, { h: [0.32, 0.3], pole: [1, 0.4], hand: 'grip', front: true }], [11.52, { h: [0.05, 0.22], pole: [1, 0.6], hand: 'grip', front: true }]] },
    prop: lift ? { L: { kind: 'shirt', color: '#e8eef6' } } : undefined, gaze: lift ? [-0.4, -0.5] : [0, 0.6] });
  if (t >= 11.3) { gripProp(s, s.gun, 'worker', 'R', V3(0, 0.2, 0), { behind: -0.08, rz: 0.25 }); gripDot(s, 'worker', 'R'); }
  if (t >= 11.56) { const h = c3ToonHandWorld(s.p.worker, 'L'), k = pop(t, 11.56, 0.18); s.tag.visible = true; s.tag.position.copy(h).add(V3(0.25, -1.0, 0.3)); facing(s.tag, s.cam); s.tag.rotateZ(-0.25); s.tag.scale.setScalar(Math.max(0.01, k)); }
  soExtras(s, t); soRender(s, { bgBlur: 3.5 }); };
SNAPS.s09 = 'free'; CAMF.s09 = { push: 0.08, orbit: 0.03, crane: 0.05 };
// ---- s10: G1 GAG — the next bag shakes, bulges and BURSTS (13.25): rubber chicken, bowling ball, a storm of socks, a gnome
const SO_BURST = 13.25;
function soFly(m, t, p0, v, spin, land) { const d = t - SO_BURST; if (d < 0) { m.visible = false; return; } m.visible = true; const g = 46;
  let x = p0[0] + v[0] * d, y = p0[1] + v[1] * d - 0.5 * g * d * d, z = p0[2] + v[2] * d, r = d;
  if (land != null && y < land) { const tl = (v[1] + Math.sqrt(v[1] * v[1] + 2 * g * (p0[1] - land))) / g; x = p0[0] + v[0] * tl; z = p0[2] + v[2] * tl; y = land; r = tl; }
  m.position.set(x, y, z); m.rotation.set(spin[0] * r, spin[1] * r, spin[2] * r); }
SHOT_FN.s10 = (t, u, lt) => { const s = soGet(); soReset(s, t); s.bag1.userData.open(1); s.shirtIn.visible = false;
  soCam(s, 's10', lt, [[0, [1.0, 13.6, 72], [-1.4, 7.2, 46], 43], [1.2, [0.6, 13.8, 69.5], [-1.4, 7.6, 46], 43]]);
  const [bx, bz] = SO_BAG2, pre = t < SO_BURST, d = t - SO_BURST;
  if (pre) { const k = clamp((t - 12.87) / (SO_BURST - 12.87)), sh = Math.sin(t * 90) * 0.12 * k; s.bag2.rotation.set(Math.sin(t * 71) * 0.06 * k, 0, sh); s.bag2.position.set(bx + Math.sin(t * 83) * 0.18 * k, SO_TOP + Math.abs(Math.sin(t * 40)) * 0.3 * k, bz);
    s.bag2.scale.set(1.4 * (1 + 0.12 * k), 1.4 * (1 + 0.45 * k * k), 1.4 * (1 + 0.12 * k)); s.bag2.userData.open(0.06 * k * Math.abs(Math.sin(t * 50))); }
  else { s.bag2.userData.open(Math.min(1.45, 1.45 * EZ.o3(d / 0.12))); s.bag2.scale.set(1.4, 1.4 * (1 + 0.3 * Math.exp(-d * 14) * Math.cos(d * 50)), 1.4); }
  const P0 = [bx, SO_TOP + 1.6, bz];
  // v4: each item leaves the bag from its own spot and lands in a free place (nothing passes through another prop): the
  // chicken flat between the two bags (head over the table's front edge), the ball right of the bag, the gnome sits IN the
  // burst bag, the socks fly up over the front edge and out of frame onto the floor
  soFly(s.chicken, t, [bx - 2.0, SO_TOP + 1.9, bz + 0.5], [-3.45, 18, 0.6], [0, 7, 9], SO_TOP + 0.75); if (d > 0 && s.chicken.position.y <= SO_TOP + 0.751) s.chicken.rotation.set(Math.PI / 2, 0, 0);
  soFly(s.ball, t, [bx + 1.8, SO_TOP + 1.5, bz - 0.2], [3.5, 14, 3.34], [0, 0, -6], SO_TOP + 1.2);
  soFly(s.gnome, t, [bx - 0.2, SO_TOP + 1.2, bz + 0.2], [1.67, 15, 0], [0, 0, 0], SO_TOP + 0.1); if (d > 0) { const tl = d < 0.68; s.gnome.rotation.set(0, tl ? d * 9 : 0, tl ? -d * 10 : 0); }
  s.socks.forEach((k, i) => { const vy = 15 + (i % 5) * 2.6, y0 = SO_TOP + 1.6, tl = (vy + Math.sqrt(vy * vy + 92 * y0)) / 46, lx = -14 + ((i * 37) % 30), lz = 52.5 + ((i * 13) % 5);
    soFly(k, t, [bx, y0, bz], [(lx - bx) / tl, vy, (lz - bz) / tl], [3 + i, 5 - i * 0.7, 4 + i * 0.5], 0.17); if (d >= tl) k.rotation.set(Math.PI / 2, 0, i * 0.7); });
  // the worker ducks behind the table
  const duck = d > 0 ? EZ.o3(d / 0.12) * 2.6 : 0;
  soMe(s, t, { y: -duck, expr: [[0, 'thinking'], [13.05, 'worried'], [SO_BURST, 'shock']], hand: { L: [[0, 'desk'], [SO_BURST, 'up']], R: [[0, 'desk'], [SO_BURST, 'up']] }, gaze: pre ? [0.8, 0.5] : [0.4, -0.6], fx: d > 0.4 ? 'sweat' : undefined });
  if (d >= 0 && d < 0.32) { const k = d / 0.32; s.burst.visible = true; popAt(s.burst, EZ.back(Math.min(1, k * 2.5)) * (1 - Math.max(0, (k - 0.6) / 0.4)), [bx, SO_TOP + 2.6, bz - 0.8], s.cam, 1); }
  soExtras(s, t); soRender(s, { bgBlur: 3.5 }); };
SNAPS.s10 = 'free'; CAMF.s10 = { push: 0.14, orbit: -0.03, crane: 0 };
// ---- s26: Workers open thousands of new items every single day — the wide over the floor, the ITEMS TODAY board ticks
SHOT_FN.s26 = (t, u, lt) => { const s = soGet(); soReset(s, t);
  soCam(s, 's26', lt, [[0, [-26, 20, 96], [-52, 11, 44], 44], [1.25, [-24, 23, 94], [-46, 11, 42], 44], [2.3, [0, 31, 99], [0, 17, 16], 43], [3.04, [4, 33, 98], [0, 18, 14], 42]]);   // v2: holds on the suitcase mountain 1.25 s, then sweeps to the board
  const ph = (t * 1.1) % 1; s.bag1.userData.open(ph > 0.45 ? 1 : 0); s.bag4.userData.open(((t + 0.4) * 0.9) % 1 > 0.5 ? 1 : 0); s.glow.visible = false;
  soMe(s, t, { facing: 0.2, expr: ph > 0.45 ? 'happy' : 'neutral', hand: { L: 'desk', R: ph > 0.45 ? 'up' : 'desk' } }); soExtras(s, t);
  soRender(s, { bgBlur: 1.2 }); };
SNAPS.s26 = 'free'; CAMF.s26 = { push: 0.03, orbit: 0, crane: 0 };
// ---- s27: Most of it gets washed, priced and put on a shelf — ONE travelling along the back wall: the washers spin
// (washed), the pricer clicks her gun on a bag (priced), the stocker slides a bag onto the rack (shelf)
SHOT_FN.s27 = (t, u, lt) => { const s = soGet(); soReset(s, t);
  const spin = t > 44.1 ? 1 + 5 * EZ.o2((t - 44.1) / 0.3) : 1; s.wash.forEach((d, i) => { d.rotation.z = -(t * (1.2 + i * 0.15)) - (t > 44.1 ? (t - 44.1) * 14 * spin : 0); });
  soCam(s, 's27', lt, [[0, [-42, 21, 58], [-40, 6, 3.6], 44], [0.7, [-34, 21, 58], [-32, 6, 3.6], 44], [1.3, [3, 21, 57], [4, 6.5, 7], 44], [2.1, [44, 21, 56], [48, 7.5, 5], 44], [2.48, [47, 21, 56], [50, 8, 5], 44]]);   // v2: farther back + an even travelling (the dashes between stations read slower)
  // the pricer tags a bag on her station on "priced"
  const [px, pz] = SO_PRICE, tg = t >= 44.62; pose(s, 'soA', t, ...SO_EXTRA.soA, { facing: 0.3, expr: [[0, 'neutral'], [44.62, 'smile']], hand: { L: 'desk', R: [[0, { h: [0.42, 0.36], pole: [1, 0.4], hand: 'grip' }], [44.62, { h: [0.34, 0.5], pole: [1, 0.4], hand: 'grip' }]] } });
  gripProp(s, s.gun2, 'soA', 'R', V3(0, 0.2, 0), { behind: -0.05, rz: tg ? -1.0 : -0.35 }); gripDot(s, 'soA', 'R');
  s.shelfItem.visible = true;
  { const b = s.bagsX[0]; } // (soD's bag stays at its table)
  if (tg) { s.tag2.visible = true; s.tag2.position.set(px + 0.9, SO_TOP + 1.95, pz + 0.6); s.tag2.rotation.set(-Math.PI / 2 + 0.5, 0, 0.25); s.tag2.scale.setScalar(1.6); s.tag2.scale.setScalar(Math.max(0.01, 1.6 * pop(t, 44.62, 0.15))); }
  // a teal bag waits on the pricing table, then rides into the stocker's hands for the shelf
  const [cx, cz] = SO_EXTRA.soC, out = { h: [0.85, 0.22], pole: [1, 0.5], hand: 'grip' };
  pose(s, 'soC', t, cx, cz, { facing: -1.4, expr: [[0, 'determined'], [45.44, 'happy']], hand: { L: [[0, { h: [0.5, 0.28], pole: [1, 0.5], hand: 'grip' }], [45.44, out]], R: [[0, { h: [0.42, 0.34], pole: [1, 0.5], hand: 'grip' }], [45.44, out]] } });
  { const a = c3ToonHandWorld(s.p.soC, 'L'), b = c3ToonHandWorld(s.p.soC, 'R'), m = a.clone().add(b).multiplyScalar(0.5).add(V3(0, -0.9, 0)), rest = V3(48.2, 5.75, 4.6), k = EZ.o3(clamp((t - 45.62) / 0.22));
    s.shelfItem.position.copy(m.lerp(rest, k)); s.shelfItem.rotation.set(0, 0, 0); if (k < 0.5) { gripDot(s, 'soC', 'L'); gripDot(s, 'soC', 'R'); } }
  pose(s, 'soD', t, ...SO_EXTRA.soD, { facing: -0.4, expr: 'neutral', hand: { L: 'desk', R: 'desk' } }); pose(s, 'soB', t, ...SO_EXTRA.soB, { facing: 0.3, expr: 'neutral', hand: { L: 'desk', R: 'desk' } });
  soRender(s, { bgBlur: 2.5 }); };
SNAPS.s27 = 'free'; CAMF.s27 = { push: 0.02, orbit: 0, crane: 0 };
// ---- s28: Some gets donated — he drops a teddy bear into the big DONATE box
SHOT_FN.s28 = (t, u, lt) => { const s = soGet(); soReset(s, t);
  soCam(s, 's28', lt, [[0, [-27, 15, 79], [-32, 3.0, 47], 40], [0.9, [-28.5, 14.6, 76], [-32.4, 3.2, 47], 40]]);
  const at = [SO_DON[0] + 1.4, SO_DON[1] - 6.4], drop = 46.12;
  soMe(s, t, { at, facing: -0.3, expr: [[0, 'sad'], [drop, 'smile']], hand: { R: 'hip', L: [[0, { h: [0.3, -0.42], pole: [1, 0.6], hand: 'grip' }], [drop, { h: [0.34, -0.46], pole: [1, 0.6], hand: 'open' }]] },
    prop: t < drop ? { L: { kind: 'teddy' } } : undefined, gaze: [-0.8, 0.5] });
  if (t >= drop) { const h = c3ToonHandWorld(s.p.worker, 'L'), d = t - drop, k = Math.min(1, d * 4), y = Math.max(5.45, h.y - 2.2 - 0.5 * 46 * d * d); s.teddy.visible = true; s.teddy.position.set(h.x + (SO_DON[0] - h.x) * k, y, h.z + (SO_DON[1] - 1.2 - h.z) * k);   /* v4: lands ON the folded clothes (top 5.3), no z pop */ s.teddy.rotation.set(0, 0.4, Math.min(1, d * 6) * 0.5); s.teddy.scale.setScalar(0.85); }
  soExtras(s, t); soRender(s, { bgBlur: 3.5 }); };
SNAPS.s28 = 'free'; CAMF.s28 = { push: 0.1, orbit: 0.04, crane: 0 };
// ---- s29: And some is just strange — soB opens a bag: a green glow inside, one eyebrow goes up
SHOT_FN.s29 = (t, u, lt) => { const s = soGet(); soReset(s, t);
  const [x, z] = SO_EXTRA.soB; soCam(s, 's29', lt, [[0, [x + 1.5, 13, z + 22], [x + 0.4, 8.3, z + 2], 38], [1.18, [x + 0.8, 12.6, z + 19.5], [x + 0.4, 8.4, z + 2], 38]]);
  const op = EZ.o3(clamp((t - 46.88) / 0.25)); s.bag4.userData.open(op); s.glowL.intensity = 3.2 * op;
  pose(s, 'soB', t, x, z, { facing: 0.2, expr: [[0, 'neutral'], [47.08, 'surprised'], [47.38, 'skeptical']], hand: { L: [[0, 'desk'], [46.88, 'up']], R: [[0, 'desk'], [47.38, 'chin']] }, gaze: [0.2, 0.7], bright: 1.1 });
  pose(s, 'soD', t, ...SO_EXTRA.soD, { facing: -0.4, expr: 'neutral', hand: { L: 'desk', R: 'desk' } }); soMe(s, t, { expr: 'neutral' });
  soRender(s, { bgBlur: 4 }); };
SNAPS.s29 = 'free'; CAMF.s29 = { push: 0.12, orbit: 0.04, crane: 0 };
// ---- s31: a live rattlesnake — an open bag on his table, the rattlesnake rears up rattling; he jumps back
SHOT_FN.s31 = (t, u, lt) => { const s = soGet(); soReset(s, t); s.bag2.visible = false; s.bag3.visible = true; s.bag3.userData.open(1);
  soCam(s, 's31', lt, [[0, [1.0, 12.2, 70], [-0.8, 7.6, 46], 40], [0.92, [0.8, 11.8, 67], [-0.8, 7.8, 46], 40]]);
  const rise = EZ.o3(clamp((t - 49.2) / 0.22)), jump = t > 49.32 ? EZ.o3((t - 49.32) / 0.16) : 0;
  petAt(s, 'snake', t, SO_BAG2[0] + 0.2, SO_TOP + 0.2, SO_BAG2[1] - 0.1, { expr: t > 49.32 ? 'angry' : 'smug', rattle: 1, rise: 0.15 + 0.85 * rise, tongue: (Math.floor(t * 7) % 2) ? 1 : 0.3, facing: -0.6 });
  soMe(s, t, { at: [SO_ME[0] - 0.6 * jump, SO_ME[1] - 3.2 * jump], y: 1.4 * Math.sin(Math.PI * clamp((t - 49.32) / 0.3)), expr: [[0, 'neutral'], [49.32, 'shock']], hand: { L: [[0, 'desk'], [49.32, 'up']], R: [[0, 'desk'], [49.32, 'up']] }, gaze: [0.8, 0.4], fx: t > 49.5 ? 'sweat' : undefined });
  soExtras(s, t); soRender(s, { bgBlur: 3.5 }); };
SNAPS.s31 = 'free'; CAMF.s31 = { push: 0.12, orbit: 0.03, crane: 0 };

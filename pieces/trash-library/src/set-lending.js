// =====================================================================
//  SET lending — three small sets in one file (prefix LE). Each is its own scene + getter, colour key and CAMSEQ path.
//   bay     (s19, 46.14-49.06): the library's loading bay in the sun. Brick wall z 0 (x -80..80) with three ultramarine
//           roller doors (the left one rolled up on a warm shelf room), LIBRARY sign, lamps, a downpipe; asphalt yard with
//           yellow bay lines. Crate stacks on pallets at z 20: SCHOOL x -10, VILLAGE x -2, PRISON x 6 (+ spare crates).
//           The yellow library van parked at 45 deg (x ~36, z 17), its open back toward the camera; the hero carries a
//           crate to it, the coworker pushes one into the cargo bed.
//   village (s20, 49.06-49.70): a village classroom — mint walls, blackboard, two tall windows on green hills, wooden
//           desks; the teacher lifts the crate lid on her desk, two kids lean in amazed.
//   prison  (s21 + g3, 49.70-52.82): a slate-blue cell — bars on the left wall, bunk bed, a barred window with ONE warm
//           sun shaft; a book slides in through the bars on 'prisons' to the tough inmate; g3 he reads and sobs (tears
//           drawn in code, shoulders shake), his cellmate hands him a tissue.
//  Camera = seqCam only (CAMSEQ.bay / .village / .prison). Whips: pan right in at the start of each set, pan right out at the end.
// =====================================================================
const LE = {};
Object.assign(CAST, {   // the two village kids: own hair + outfits (not in STYLE's used list or the main CAST)
  LEkidA: { key: 'LEkidA', hair: 'topknot2', hairColor: 'blond', outfit: 'polo', colors: { main: '#f29a2a', collar: '#ffffff' }, skin: 'peach', body: 'kid' },
  LEkidB: { key: 'LEkidB', hair: 'messy', hairColor: 'chestnut', outfit: 'apron', colors: { main: '#ffffff', apron: '#2f5ec8', collar: '#ffffff' }, skin: 'brown', body: 'kid' },   // Turkish school smock
});
// ---- textures
function leTexBrick(base = '#c4583a') { const t = tex((g, w, h) => { const R = RNG('lebrick', base), rows = 16, rh = h / rows, cw = w / 4;
  g.fillStyle = '#d8c8b0'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i < 5; i++) { const x = (i + (j % 2) * 0.5) * cw; g.fillStyle = c3Shd(base, R.r(0.82, 1.1)); g.fillRect(x + 3, j * rh + 3, cw - 5, rh - 5);
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 3, j * rh + 3, cw - 5, 3); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 3, j * rh + rh - 5, cw - 5, 3);
    for (let k = 0; k < 5; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,240,220,0.1)'; g.fillRect(x + R.r(4, cw - 6), j * rh + R.r(4, rh - 6), 3, 3); } } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function leTexRoller(c) { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(0, y, w, 4); g.fillStyle = 'rgba(0,0,30,0.22)'; g.fillRect(0, y + 11, w, 4); }
  g.fillStyle = '#c8ccd4'; g.fillRect(0, h - 22, w, 22); g.fillStyle = '#2a2a30'; g.fillRect(w * 0.45, h - 18, w * 0.1, 8); }, 256, 512); }
function leTexAsphalt() { const t = tex((g, w, h) => { const R = RNG('leasph'); g.fillStyle = '#76717e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,250,240,0.1)'; const z = R.r(1, 3); g.fillRect(R.r(0, w), R.r(0, h), z, z); }
  for (let i = 0; i < 14; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 80), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,30,40,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6); return t; }
function leTexSlats(c = '#c8935a') { return tex((g, w, h) => { const R = RNG('leslat', c); g.fillStyle = c3Shd(c, 0.7); g.fillRect(0, 0, w, h);
  for (let j = 0; j < 4; j++) { const y = j * h / 4; g.fillStyle = c3Shd(c, R.r(0.92, 1.08)); g.fillRect(4, y + 4, w - 8, h / 4 - 8);
    g.strokeStyle = 'rgba(90,50,20,0.3)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const yy = y + R.r(8, h / 4 - 8); g.beginPath(); g.moveTo(4, yy); g.bezierCurveTo(w * 0.3, yy + R.n(5), w * 0.7, yy + R.n(5), w - 4, yy + R.n(3)); g.stroke(); } }
  g.fillStyle = c3Shd(c, 0.8); g.fillRect(0, 0, 18, h); g.fillRect(w - 18, 0, 18, h); }, 256, 192); }
// a crate face: slats + a stencilled word (shrinks to fit, never leaves the face)
function leTexCrate(word, c = '#c8935a') { return tex((g, w, h) => { const R = RNG('lecr', word); g.fillStyle = c3Shd(c, 0.7); g.fillRect(0, 0, w, h);
  for (let j = 0; j < 4; j++) { const y = j * h / 4; g.fillStyle = c3Shd(c, R.r(0.92, 1.08)); g.fillRect(6, y + 5, w - 12, h / 4 - 10);
    g.strokeStyle = 'rgba(90,50,20,0.28)'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { const yy = y + R.r(10, h / 4 - 10); g.beginPath(); g.moveTo(6, yy); g.bezierCurveTo(w * 0.3, yy + R.n(5), w * 0.7, yy + R.n(5), w - 6, yy + R.n(3)); g.stroke(); } }
  g.fillStyle = c3Shd(c, 0.78); g.fillRect(0, 0, 24, h); g.fillRect(w - 24, 0, 24, h);
  if (word) { g.save(); g.globalAlpha = 0.92; inked(g, word, w / 2, h * 0.47, h * 0.34, '#1e2a5a', { stroke: false, font: 'Impact, "Arial Black", sans-serif', weight: 400, maxW: w * 0.8 }); g.restore();
    g.fillStyle = 'rgba(30,42,90,0.85)'; g.fillRect(w * 0.3, h * 0.74, w * 0.4, 8); g.font = `700 ${h * 0.09}px Arial`; g.textAlign = 'center'; g.fillText('ÇANKAYA KÜTÜPHANE', w / 2, h * 0.88); } }, 512, 384); }
function leTexSign(t1, t2, bg, fg) { return tex((g, w, h) => { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, 26); g.fill(); g.lineWidth = 12; g.strokeStyle = '#ffffff'; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 18); g.stroke();
  inked(g, t1, w / 2, h * (t2 ? 0.42 : 0.52), h * 0.4, fg, { stroke: false, maxW: w * 0.84 }); if (t2) inked(g, t2, w / 2, h * 0.78, h * 0.16, '#ffffff', { stroke: false, maxW: w * 0.8 }); }, 1024, 320); }
function leTexHills(seed) { return tex((g, w, h) => { const R = RNG('lehill', seed), sk = g.createLinearGradient(0, 0, 0, h * 0.6); sk.addColorStop(0, '#7ab4ec'); sk.addColorStop(1, '#e8f2ff'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { const cx = R.r(0, w), cy = R.r(h * 0.06, h * 0.3); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(cx + R.n(60), cy + R.n(10), R.r(26, 50), R.r(14, 22), 0, 0, TAU); g.fill(); } }
  const layers = [['#a8cca0', 0.42], ['#7ab46a', 0.52], ['#5a9a4a', 0.64], ['#4a8a3a', 0.78]];
  layers.forEach(([c, y0], li) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * y0 + Math.sin(x * 0.006 * (li + 1) + li * 2) * h * 0.05 + Math.sin(x * 0.019 + li) * h * 0.015); g.lineTo(w, h); g.fill();
    if (li === 1) { for (let k = 0; k < 7; k++) { const x = R.r(0, w), y = h * (y0 + 0.05); g.fillStyle = '#f4ece0'; g.fillRect(x, y - 14, 22, 14); g.fillStyle = '#c8502e'; g.beginPath(); g.moveTo(x - 3, y - 14); g.lineTo(x + 11, y - 24); g.lineTo(x + 25, y - 14); g.fill(); } }
    if (li === 2) { const x = w * 0.62, y = h * (y0 + 0.02); g.fillStyle = '#f4f0e8'; g.fillRect(x, y - 70, 8, 70); g.beginPath(); g.moveTo(x - 2, y - 70); g.lineTo(x + 4, y - 92); g.lineTo(x + 10, y - 70); g.fill(); g.beginPath(); g.arc(x + 30, y - 10, 18, Math.PI, 0); g.fill(); }
    if (li >= 2) for (let k = 0; k < 9; k++) { const x = R.r(0, w), y = h * (y0 + 0.04) + R.r(0, 30); g.fillStyle = c3Shd('#3a7a2e', R.r(0.8, 1.1)); g.beginPath(); g.ellipse(x, y - 26, 8, 30, 0, 0, TAU); g.fill(); } }); }, 1024, 768); }
function leTexBoard() { return tex((g, w, h) => { g.fillStyle = '#7a4a24'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2e5a44'); gr.addColorStop(1, '#244a38'); g.fillStyle = gr; g.fillRect(16, 16, w - 32, h - 32);
  const R = RNG('lebd'); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(R.r(16, w - 80), R.r(16, h - 40), R.r(40, 160), R.r(6, 20)); }
  inked(g, 'KİTAP GÜNÜ!', w * 0.5, h * 0.24, h * 0.17, '#f4f4ea', { stroke: false, font: '"Comic Sans MS", "Chalkboard", sans-serif', weight: 700, maxW: w * 0.7 });
  inked(g, 'BOOK DAY', w * 0.5, h * 0.42, h * 0.1, '#ffe08a', { stroke: false, font: '"Comic Sans MS", sans-serif', weight: 700, maxW: w * 0.5 });
  g.strokeStyle = '#f4f4ea'; g.lineWidth = 5; g.beginPath(); g.arc(w * 0.16, h * 0.68, 34, 0, TAU); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(w * 0.16 + Math.cos(a) * 44, h * 0.68 + Math.sin(a) * 44); g.lineTo(w * 0.16 + Math.cos(a) * 60, h * 0.68 + Math.sin(a) * 60); g.stroke(); }
  g.font = `700 ${h * 0.1}px "Comic Sans MS", sans-serif`; g.fillStyle = '#f4f4ea'; g.textAlign = 'center'; g.fillText('2 + 3 = 5', w * 0.72, h * 0.72);
  g.strokeStyle = '#ffb0c8'; g.beginPath(); g.moveTo(w * 0.36, h * 0.84); g.lineTo(w * 0.36, h * 0.62); g.lineTo(w * 0.44, h * 0.54); g.lineTo(w * 0.52, h * 0.62); g.lineTo(w * 0.52, h * 0.84); g.closePath(); g.stroke();
  g.fillStyle = '#e8e4d8'; g.fillRect(16, h - 30, w - 32, 14); }, 1024, 512); }
function leTexBlock(c, top, seed) { const t = tex((g, w, h) => { const R = RNG('leblk', seed), rows = 12, rh = h / rows; g.fillStyle = c3Shd(c, 0.8); g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i < 3; i++) { const x = (i + (j % 2) * 0.5) * w / 2; g.fillStyle = c3Shd(t3Mix(c, top, j / rows * 0), R.r(0.92, 1.06)); g.fillRect(x + 2, j * rh + 2, w / 2 - 3, rh - 3);
    for (let k = 0; k < 6; k++) { g.fillStyle = R.f() < 0.6 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'; g.fillRect(x + R.r(3, w / 2 - 4), j * rh + R.r(3, rh - 4), 2, 2); } } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function leTexTally() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(240,240,250,0.85)'; g.lineWidth = 5; g.lineCap = 'round';
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const x0 = 20 + k * 120, y0 = 20 + r * 60; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0 + i * 20, y0); g.lineTo(x0 + i * 20 + 3, y0 + 44); g.stroke(); } g.beginPath(); g.moveTo(x0 - 8, y0 + 34); g.lineTo(x0 + 72, y0 + 8); g.stroke(); } }, 512, 256); }
function leTexDrop() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 6); g.bezierCurveTo(w * 0.9, h * 0.5, w * 0.9, h * 0.94, w / 2, h * 0.94); g.bezierCurveTo(w * 0.1, h * 0.94, w * 0.1, h * 0.5, w / 2, 6);
  g.fillStyle = '#7ad0ff'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#2a3a6a'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(w * 0.4, h * 0.6, w * 0.08, h * 0.12, -0.3, 0, TAU); g.fill(); }, 64, 96); }
function leTexStream() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(122,208,255,0.95)'); gr.addColorStop(1, 'rgba(122,208,255,0.55)');
  g.beginPath(); g.moveTo(w * 0.3, 0); g.quadraticCurveTo(w * 0.15, h * 0.5, w * 0.35, h); g.lineTo(w * 0.7, h); g.quadraticCurveTo(w * 0.55, h * 0.5, w * 0.7, 0); g.closePath(); g.fillStyle = gr; g.fill(); g.lineWidth = 4; g.strokeStyle = '#2a3a6a'; g.stroke(); }, 32, 128); }
// ---- props
const leAt = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
function leBooksRow(R, w, d, hMin = 1.2, hMax = 2.0) { const g = new THREE.Group(), C = ['#d8402e', '#2f6ab8', '#f2c23a', '#3a9a5a', '#8a4aa8', '#f0ece0', '#e8762a', '#2a8a9a', '#c84a7a'];
  let x = -w / 2 + 0.15; while (x < w / 2 - 0.4) { const bw = R.r(0.3, 0.55), bh = R.r(hMin, hMax); const b = rb(bw, bh, d * R.r(0.7, 0.92), c3Prop(C[R.i(0, C.length - 1)], { rough: 0.6 }), x + bw / 2, bh / 2, 0, 0); b.rotation.z = R.n(0.08); g.add(b); x += bw + 0.04; } return g; }
// a wooden crate (w x h x d) with a stencilled front (+z) and an optional open top full of books
function leCrate(word, o = {}) { const w = o.w ?? 5, h = o.h ?? 3.4, d = o.d ?? 3.6, g = new THREE.Group(), side = c3Prop('#ffffff', { map: leTexSlats(), rough: 0.85 }), R = RNG('lecrate', word + (o.seed ?? 0));
  g.add(rb(w, h, d, side, 0, h / 2, 0, 0));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, h * 0.98), c3Prop('#ffffff', { map: leTexCrate(word), rough: 0.85 })); f.position.set(0, h / 2, d / 2 + 0.03); g.add(f);
  if (o.books) { const b = leBooksRow(R, w - 0.6, d - 0.6, 1.0, 1.9); b.position.y = h - 0.6; g.add(b); const b2 = leBooksRow(R, w - 0.8, d - 0.8, 0.8, 1.5); b2.position.set(0, h - 0.6, -0.6); g.add(b2); }
  for (const x of [-w / 2 + 0.25, w / 2 - 0.25]) g.add(rb(0.5, h + 0.05, d + 0.08, c3Prop('#a8743e', { rough: 0.85 }), x, h / 2, 0, 0));
  g.userData.h = h; g.userData.w = w; g.userData.d = d; return g; }
function lePallet(w = 6.4, d = 4.6) { const g = new THREE.Group(), m = c3Prop('#b8925a', { rough: 0.9 });
  for (const z of [-d / 2 + 0.4, 0, d / 2 - 0.4]) g.add(rb(w, 0.5, 0.7, m, 0, 0.25, z, 0)); for (let i = 0; i < 6; i++) g.add(rb(w / 7, 0.18, d, m, -w / 2 + w / 12 + i * w / 6, 0.6, 0, 0)); return g; }
// a closed hardback (origin = centre); o.open = a spread open book instead
function leBook(c, o = {}) { const g = new THREE.Group(), cov = c3Prop(c, { rough: 0.5 }), pg = c3Prop('#f6efdc', { rough: 0.9 });
  if (o.open) { for (const s of [-1, 1]) { const half = new THREE.Group(); half.rotation.z = -s * 0.22; g.add(half); half.add(rb(1.25, 0.08, 1.7, cov, s * 0.66, 0, 0, 0)); half.add(rb(1.15, 0.16, 1.6, pg, s * 0.62, 0.11, 0, 0));
      const lines = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#f6efdc'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,40,30,0.55)'; for (let i = 0; i < 10; i++) x.fillRect(10, 14 + i * 22, w - (i % 3 ? 20 : 50), 5); }, 128, 240) }));
      lines.rotation.x = -Math.PI / 2; lines.position.set(s * 0.62, 0.2, 0); half.add(lines); } return g; }
  g.add(rb(1.5, 0.42, 2.0, cov, 0, 0, 0, 0)); g.add(rb(1.4, 0.3, 1.9, pg, 0.06, 0, 0, 0)); g.add(rb(1.2, 0.03, 0.3, c3Prop('#f2c23a', { rough: 0.4 }), 0, 0.22, -0.5, 0)); return g; }

// =====================================================================
//  BAY
// =====================================================================
const LE_VAN = [36, 17], LE_VANR = Math.PI / 4, LE_CR = { SCHOOL: -10, VILLAGE: -2, PRISON: 6 }, LE_CRZ = 20;
const LE_HERO0 = 9.5, LE_HERO1 = 15.5, LE_HEROZ = 25.5, LE_CW = [21.6, 24.4];
// the yellow mobile-library van (v2: real shape — rounded body + cab, sloped windscreen, wheel arches, mirrors, grille,
// door seams, bumpers, plate, roof sign; the open back shows a bookmobile inside: shelves of books + a warm light)
function leVan() { const g = new THREE.Group(), y = c3Prop('#f2c028', { rough: 0.3, metal: 0.15, env: 1.3 }), dk = c3Prop('#2a2a30', { rough: 0.6 }), gl = c3Prop('#4a76b0', { rough: 0.08, env: 1.5 }), inn = c3Prop('#e8dcc4', { rough: 0.8 }), chrome = c3Prop('#dfe3ea', { metal: 0.7, rough: 0.25 }), wood = c3Prop('#a0683a', { rough: 0.7 });
  const L = 19, X0 = -13, Wd = 11, Hc = 11.5, fl = 3.2, RB = (w, h, d, r, m, px, py, pz) => { const o = c3Mesh(c3RBox(w, h, d, r), m, 0); o.position.set(px, py, pz); g.add(o); return o; };
  // cargo box: floor, rounded side walls + roof, front bulkhead, inner lining
  RB(L, 0.5, Wd, 0.15, inn, X0 + L / 2, fl, 0);
  for (const s of [-1, 1]) { RB(L, Hc, 0.5, 0.22, y, X0 + L / 2, fl + Hc / 2, s * (Wd / 2 - 0.25)); RB(L - 0.4, 1.1, 0.62, 0.2, dk, X0 + L / 2, fl + 0.9, s * (Wd / 2 - 0.22)); }   // + the dark rubbing strip
  RB(L + 0.2, 1.0, Wd + 0.1, 0.48, y, X0 + L / 2, fl + Hc, 0); RB(0.4, Hc, Wd, 0.1, inn, X0 + L - 0.2, fl + Hc / 2, 0);
  for (const s of [-1, 1]) g.add(rb(L - 0.8, Hc - 0.8, 0.05, inn, X0 + L / 2, fl + Hc / 2, s * (Wd / 2 - 0.55), 0));
  // the bookmobile inside: shelves of books on both walls + a ceiling light
  for (const s of [-1, 1]) for (let r = 0; r < 4; r++) { g.add(rb(L - 1.2, 0.25, 1.4, wood, X0 + L / 2, fl + 1.6 + r * 2.6, s * (Wd / 2 - 1.2), 0));
    const b = new THREE.Mesh(new THREE.PlaneGeometry(L - 1.6, 2.2), c3Prop('#ffffff', { map: texBooks(31 + r + (s > 0 ? 7 : 0)), rough: 0.8 })); b.position.set(X0 + L / 2, fl + 2.85 + r * 2.6, s * (Wd / 2 - 0.62)); b.rotation.y = s > 0 ? Math.PI : 0; g.add(b); }
  g.add(rb(6, 0.3, 1.2, c3Prop('#ffffff', { emissive: '#fff0c8', ei: 1.2, glow: '#fff0c8' }), X0 + 6, fl + Hc - 0.7, 0, 0));
  { const l = new THREE.PointLight('#ffd8a0', 1.2, 22, 1.6); l.position.set(X0 + 5, fl + Hc - 2, 0); l.layers.enableAll(); g.add(l); }
  RB(0.9, 0.9, Wd + 0.4, 0.3, dk, X0 + 0.2, fl - 0.45, 0); RB(1.4, 0.3, 4, 0.1, chrome, X0 - 0.3, fl - 0.7, 0);   // rear bumper + step
  // the cab: lower block, upper cab with a raked windscreen, hood, grille, lights, mirrors, door seams + handle
  RB(7.6, 6.4, Wd, 0.9, y, 9.8, fl + 3.0, 0); RB(5.0, 5.0, Wd - 0.3, 1.1, y, 8.0, fl + 8.0, 0);
  { const ws = RB(0.3, 5.0, Wd - 1.4, 0.12, gl, 10.7, fl + 8.0, 0); ws.rotation.z = 0.38; }
  for (const s of [-1, 1]) { const sw = RB(3.4, 3.2, 0.12, 0.3, gl, 8.0, fl + 8.3, s * (Wd / 2 - 0.08)); sw.position.z = s * (Wd / 2 - 0.1);
    g.add(rb(0.12, 9.6, 0.1, dk, 5.6, fl + 4.8, s * (Wd / 2 + 0.01), 0)); g.add(rb(0.9, 0.25, 0.2, chrome, 7.0, fl + 5.8, s * (Wd / 2 + 0.05), 0));   // door seam + handle
    const arm = rb(0.25, 0.25, 1.4, dk, 10.2, fl + 7.4, s * (Wd / 2 + 0.6), 0); g.add(arm); RB(0.5, 1.9, 1.1, 0.2, dk, 10.2, fl + 7.6, s * (Wd / 2 + 1.3));   // mirror
    RB(0.3, 1.0, 2.0, 0.25, c3Prop('#fff6d0', { emissive: '#fff0c0', ei: 0.6 }), 13.6, fl + 3.2, s * 3.8);   // headlight
    RB(0.3, 2.4, 0.9, 0.2, c3Prop('#d8282a', { emissive: '#d8282a', ei: 0.35 }), X0 - 0.05, fl + 3.0, s * 4.9);   // tail light
    RB(0.3, 0.6, 1.0, 0.15, c3Prop('#f29a2a', { emissive: '#f29a2a', ei: 0.3 }), 13.6, fl + 1.9, s * 4.4); }
  RB(0.4, 2.2, 5.6, 0.25, dk, 13.65, fl + 2.6, 0); for (let k = 0; k < 4; k++) g.add(rb(0.45, 0.14, 5.2, chrome, 13.7, fl + 1.8 + k * 0.5, 0, 0));
  RB(1.0, 1.3, Wd + 0.5, 0.45, dk, 13.6, fl + 0.4, 0);   // front bumper
  { const pt = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a4ad0'; x.fillRect(0, 0, w * 0.1, h); inked(x, '06 KTP 01', w * 0.55, h * 0.55, h * 0.62, '#1a1a22', { stroke: false, maxW: w * 0.82 }); x.lineWidth = 6; x.strokeStyle = '#1a1a22'; x.strokeRect(3, 3, w - 6, h - 6); }, 256, 64) }));
    pt.position.set(X0 - 0.3, fl - 0.45, 0); pt.rotation.y = -Math.PI / 2; g.add(pt); }
  // wheels: tyre + rim + hub + bolts under real arches
  for (const x of [-8.5, 8.5]) for (const s of [-1, 1]) { const wh = cyl(2.2, 2.2, 1.4, dk, x, 2.2, s * (Wd / 2 - 0.4), 0, 24); wh.rotation.x = Math.PI / 2; g.add(wh);
    const rim = cyl(1.2, 1.2, 1.5, chrome, x, 2.2, s * (Wd / 2 - 0.4), 0, 16); rim.rotation.x = Math.PI / 2; g.add(rim); const hub = cyl(0.45, 0.45, 1.62, dk, x, 2.2, s * (Wd / 2 - 0.4), 0, 10); hub.rotation.x = Math.PI / 2; g.add(hub);
    const arch = c3Mesh(new THREE.CylinderGeometry(2.75, 2.75, 0.7, 20, 1, true, -Math.PI / 2, Math.PI), dk, 0); arch.rotation.x = Math.PI / 2; arch.position.set(x, 2.4, s * (Wd / 2 - 0.1)); g.add(arch); }
  // side livery (+z side faces the yard) + a roof sign
  const liv = new THREE.Mesh(new THREE.PlaneGeometry(16, 5.6), c3Prop('#ffffff', { map: tex((x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2a4ad0'; x.beginPath(); x.roundRect(0, h * 0.5, w, h * 0.5, 30); x.fill();
    inked(x, 'MOBILE LIBRARY', w / 2, h * 0.27, h * 0.24, '#2a4ad0', { stroke: false, maxW: w * 0.9 }); inked(x, 'ÇANKAYA KÜTÜPHANE', w / 2, h * 0.75, h * 0.2, '#ffffff', { stroke: false, maxW: w * 0.84 }); }, 1024, 360), transparent: true, rough: 0.5 }));
  liv.position.set(X0 + L / 2, fl + 6.6, Wd / 2 + 0.03); g.add(liv);
  { RB(7, 1.8, 0.5, 0.2, c3Prop('#2a4ad0', { rough: 0.4 }), X0 + 8, fl + Hc + 1.4, 0); const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.4), c3Flat('#ffffff', { map: leTexSign('KİTAP', '', '#2a4ad0', '#ffd23a') })); sg.position.set(X0 + 8, fl + Hc + 1.4, 0.27); g.add(sg);
    for (const x of [X0 + 5.5, X0 + 10.5]) g.add(rb(0.3, 1.0, 0.3, dk, x, fl + Hc + 0.5, 0, 0)); }
  // the barn doors at the back, swung wide open (window + inner panel + hinges)
  for (const s of [-1, 1]) { const hg = new THREE.Group(); hg.position.set(X0 - 0.1, fl, s * Wd / 2); g.add(hg); const d = c3Mesh(c3RBox(0.4, Hc - 0.4, Wd / 2 - 0.1, 0.15), y, 0); d.position.set(0, Hc / 2, -s * (Wd / 4)); hg.add(d);
    const pn = rb(0.1, Hc - 2.4, Wd / 2 - 1.2, inn, 0.25, Hc / 2 - 0.6, -s * (Wd / 4), 0); hg.add(pn);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.8), gl); win.position.set(-0.22, Hc * 0.74, -s * (Wd / 4)); win.rotation.y = -Math.PI / 2; hg.add(win);
    for (const yy of [1.5, Hc - 1.8]) hg.add(rb(0.5, 0.6, 0.5, dk, 0, yy, -s * 0.2, 0)); hg.rotation.y = s * 2.3; }
  // cargo already loaded
  const R = RNG('levan'); for (let i = 0; i < 5; i++) { const c = leCrate(['SCHOOL', 'VILLAGE', 'PRISON', 'SCHOOL', 'VILLAGE'][i], { books: i > 2, seed: i }); c.scale.setScalar(0.62); c.rotation.y = Math.PI / 2 + R.n(0.1);
    c.position.set(X0 + 12 + (i % 3) * 0.2 - (i > 2 ? 3.2 : 0), fl + 0.25 + (i === 2 ? 2.2 : 0), -1.8 + (i % 2) * 3.6); g.add(c); }
  g.userData.fl = fl; g.userData.X0 = X0; return g; }
function leBayBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.3, 6000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#8a9ae8', ambI: 0.16, sky: '#a8c4f0', ground: '#a08060', key: '#ffd8a4', keyI: 2.05, keyP: [140, 220, 260], rim: '#ffd8b0', rimI: 0.3, rimP: [-200, 120, -120] });
  c3SkyDome(scene, { paint: true, zenith: '#5e96e0', mid: '#9cc4ee', midH: 0.3, horizon: '#e6eefa', glow: '#fff2d8', glowK: 0.3, ground: '#a09a8a', sun: [0.4, 0.7, 0.6], clouds: 34, cloudScale: 1.0, seed: 8, cloudLit: '#ffffff', cloudShade: '#a8b0dc', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#e6eefa', 500, 4000);
  const M = { conc: c3Prop('#c8c0b4', { rough: 0.9 }), dark: c3Prop('#2a2a30', { rough: 0.6 }), steel: c3Prop('#9aa2aa', { metal: 0.5, rough: 0.4 }), yel: c3Prop('#f2c23a', { rough: 0.5 }), blue: c3Prop('#2a4ad0', { rough: 0.45 }), orange: c3Prop('#f07a1e', { rough: 0.45 }) };
  scene.add(pl(600, 400, c3Prop('#ffffff', { map: leTexAsphalt(), rough: 0.85 }), 0, 0, 120, 0, -Math.PI / 2));
  // bay lines + a hatched no-park box + the kerb under the wall
  for (const x of [-46, -32, -12, 18]) scene.add(pl(0.7, 34, c3Prop('#f2c23a', { rough: 0.7 }), x, 0.04, 20, 0, -Math.PI / 2));
  scene.add(pl(160, 0.7, c3Prop('#f2c23a', { rough: 0.7 }), 0, 0.04, 37, 0, -Math.PI / 2));
  scene.add(rb(160, 0.6, 2.4, M.conc, 0, 0.3, 1.2, 0));
  // the brick wall with three roller doors (the left one up on a warm shelf room)
  const brick = leTexBrick(); brick.repeat.set(40, 9);
  const DOORS = [[-24, 18, 22, true], [4, 16, 20, false], [-52, 16, 20, false]], wallH = 36;
  { const xs = [-80, ...DOORS.flatMap(([x, w]) => [x - w / 2, x + w / 2]).sort((a, b) => a - b), 80];
    for (let i = 0; i < xs.length; i += 2) { const a = xs[i], b = xs[i + 1]; const t = brick.clone(); t.needsUpdate = true; t.repeat.set((b - a) / 4, wallH / 4); scene.add(plNC(b - a, wallH, c3Prop('#ffffff', { map: t, rough: 0.9 }), (a + b) / 2, wallH / 2, 0)); }
    for (const [x, w, h] of DOORS) { const t = brick.clone(); t.needsUpdate = true; t.repeat.set(w / 4, (wallH - h) / 4); scene.add(plNC(w, wallH - h, c3Prop('#ffffff', { map: t, rough: 0.9 }), x, h + (wallH - h) / 2, 0)); } }
  scene.add(rb(162, 1.4, 1.6, c3Prop('#e8dcc8', { rough: 0.8 }), 0, wallH + 0.4, 0.4, 0));   // coping
  for (const [x, w, h, open] of DOORS) {
    scene.add(rb(w + 1.6, 1.2, 1.2, M.steel, x, h + 0.6, 0.6, 0)); for (const s of [-1, 1]) scene.add(rb(0.8, h, 0.9, c3Prop('#f2c23a', { rough: 0.5 }), x + s * (w / 2 + 0.4), h / 2, 0.45, 0));   // yellow guard posts
    scene.add(rb(w + 1.2, 2.6, 2.4, M.steel, x, h + 2.2, 0.4, 0));   // roll housing
    for (const s of [-1, 1]) { const bx = x + s * (w / 2 + 1.7); scene.add(rb(2.0, 3.4, 0.4, M.steel, bx, 2.4, 0.2, 0)); const bp = c3Mesh(c3RBox(1.5, 2.8, 1.3, 0.3), M.dark, 0); bp.position.set(bx, 2.4, 0.95); scene.add(bp);
      for (const yy of [1.4, 3.4]) { const bo = cyl(0.16, 0.16, 0.2, M.steel, bx, yy, 1.65, 0, 8); bo.rotation.x = Math.PI / 2; scene.add(bo); } }   // dock bumpers: rubber blocks on steel plates
    for (const s of [-1, 1]) { scene.add(rb(0.7, h, 0.7, M.steel, x + s * (w / 2 - 0.1), h / 2, 0.35, 0)); scene.add(rb(0.25, h, 0.9, M.dark, x + s * (w / 2 - 0.45), h / 2, 0.3, 0)); }   // door guide channels
    if (open) { // the shelf room behind
      const D = 16; scene.add(pl(w, D, c3Prop('#b08a5a', { rough: 0.8 }), x, 0.02, -D / 2, 0, -Math.PI / 2)); scene.add(plNC(w, h, c3Prop('#e88a3a', { rough: 0.9 }), x, h / 2, -D));
      for (const s of [-1, 1]) scene.add(plNC(D, h, c3Prop('#e88a3a', { rough: 0.9 }), x + s * w / 2, h / 2, -D / 2, -s * Math.PI / 2)); scene.add(plNC(w, D, c3Prop('#d8c8b0', { rough: 0.9 }), x, h, -D / 2, 0, Math.PI / 2));
      for (let k = 0; k < 3; k++) { const sx = x - w / 2 + 3.2 + k * 5.8, sh = new THREE.Group(); sh.position.set(sx, 0, -D + 2); scene.add(sh); sh.add(rb(5, 16, 2.6, c3Prop('#7a4a2a', { rough: 0.8 }), 0, 8, 0, 0));
        for (let r = 0; r < 5; r++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.6), c3Prop('#ffffff', { map: texBooks(k * 7 + r), rough: 0.8 })); b.position.set(0, 1.9 + r * 3.0, 1.33); sh.add(b); } }
      const ip = new THREE.PointLight('#ffc888', 1.6, 40, 1.5); ip.position.set(x, h - 3, -8); ip.layers.enableAll(); scene.add(ip);
      scene.add(rb(w - 0.4, 2.2, 1.0, c3Prop('#ffffff', { map: leTexRoller('#2a4ad0'), rough: 0.5 }), x, h - 1.2, -0.3, 0));   // the rolled-up door edge
    } else { const dr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), c3Prop('#ffffff', { map: leTexRoller('#2a4ad0'), rough: 0.45, metal: 0.2 })); dr.position.set(x, h / 2, 0.08); scene.add(dr);
      const sl = c3Prop('#3456d8', { rough: 0.4, metal: 0.25 }); for (let k = 0; k < Math.floor(h / 1.25); k++) { const m = rb(w - 1.2, 0.5, 0.22, sl, x, 1.3 + k * 1.25, 0.2, 0); m.userData.noCast = true; scene.add(m); }   // 3D slats
      scene.add(rb(w - 1.0, 0.6, 0.5, M.steel, x, 0.3, 0.3, 0)); scene.add(rb(1.6, 0.3, 0.4, M.dark, x, 1.3, 0.55, 0)); for (const s of [-1, 1]) scene.add(rb(0.3, 0.3, 0.5, M.yel, x + s * 3, 1.0, 0.55, 0)); }
    // a wall lamp over the door + its pool
    scene.add(rb(2.4, 0.8, 1.6, M.dark, x, h + 5.2, 1.0, 0)); scene.add(rb(2.0, 0.3, 1.2, c3Prop('#ffffff', { emissive: '#fff2cc', ei: 1.2, glow: '#fff2cc' }), x, h + 4.75, 1.1, 0));
  }
  // signs
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(22, 6.9), c3Flat('#ffffff', { map: leTexSign('LIBRARY', 'ÇANKAYA KÜTÜPHANESİ', '#2a4ad0', '#ffd23a') })); sg.position.set(-24, 30.5, 0.6); scene.add(sg); }
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.8), c3Flat('#ffffff', { map: leTexSign('BAY 2', '', '#f2c23a', '#1e2a5a') })); sg.position.set(4, 25.4, 0.5); scene.add(sg); }
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.6), c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8282a'; g.fillRect(0, 0, w, h * 0.34); inked(g, 'NO PARKING', w / 2, h * 0.17, h * 0.2, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'books loading', w / 2, h * 0.6, h * 0.16, '#2a2a30', { stroke: false, maxW: w * 0.8 }); inked(g, 'all day', w / 2, h * 0.8, h * 0.14, '#2a2a30', { stroke: false, maxW: w * 0.8 }); g.lineWidth = 10; g.strokeStyle = '#2a2a30'; g.strokeRect(5, 5, w - 10, h - 10); }, 384, 256) })); sg.position.set(-40, 9, 0.3); scene.add(sg); }
  // downpipe, a vent, a hose reel, bins, plants, stacked pallets, a hand truck
  scene.add(cyl(0.55, 0.55, wallH, M.steel, 20, wallH / 2, 0.8, 0, 10)); scene.add(rb(3.2, 3.2, 0.6, M.steel, 30, 28, 0.4, 0));
  for (let k = 0; k < 4; k++) scene.add(rb(2.8, 0.2, 0.3, M.dark, 30, 26.9 + k * 0.7, 0.75, 0));
  for (const [x, c] of [[-36, '#f07a1e'], [-33, '#2f8a4a']]) { scene.add(rb(2.8, 4.4, 3.2, c3Prop(c, { rough: 0.5 }), x, 2.2, 2.8, 0)); scene.add(rb(3.0, 0.5, 3.4, c3Prop(c3Shd(c, 0.8), { rough: 0.5 }), x, 4.6, 2.8, 0)); }
  for (const x of [-15, 13]) { scene.add(cyl(1.4, 1.1, 2.4, c3Prop('#c8602e', { rough: 0.7 }), x, 1.2, 2.8, 0, 14)); for (let k = 0; k < 7; k++) { const lf = c3Mesh(new THREE.SphereGeometry(1.2, 10, 8), c3Prop(k % 2 ? '#3a9a4a' : '#2f8040', { rough: 0.7 }), 0); lf.scale.set(0.6, 1.4, 0.6); lf.position.set(x + Math.cos(k) * 0.9, 3.6 + (k % 3) * 0.6, 2.8 + Math.sin(k) * 0.9); lf.rotation.z = Math.cos(k * 2) * 0.5; scene.add(lf); } }
  for (let k = 0; k < 6; k++) { const p = lePallet(6.4, 6.4); p.position.set(-44, k * 0.8, 6); p.rotation.y = 0.05 * (k % 2); scene.add(p); }
  { const ht = new THREE.Group(); ht.position.set(-5.5, 0, 6.5); ht.rotation.y = 0.35; scene.add(ht); const red = c3Prop('#d8282a', { rough: 0.35, metal: 0.2 });   // a hand truck with a crate on it
    for (const s2 of [-1, 1]) { ht.add(leTube(0.16, [s2 * 1.2, 0.4, 0], [s2 * 1.1, 7.6, -0.9], red)); ht.add(leTube(0.12, [s2 * 1.1, 7.6, -0.9], [s2 * 0.9, 8.4, -1.6], red)); }
    ht.add(leTube(0.14, [-0.9, 8.4, -1.6], [0.9, 8.4, -1.6], c3Prop('#2a2a30', { rough: 0.6 }))); for (const yy of [2.5, 5.0]) ht.add(leTube(0.1, [-1.18, yy, -0.3 * yy / 2.5], [1.18, yy, -0.3 * yy / 2.5], red));
    ht.add(rb(2.8, 0.2, 1.6, M.steel, 0, 0.25, 0.75, 0)); for (const s2 of [-1, 1]) { const wl = cyl(0.8, 0.8, 0.45, M.dark, s2 * 1.5, 0.8, -0.35, 0, 14); wl.rotation.z = Math.PI / 2; ht.add(wl); const hb = cyl(0.35, 0.35, 0.5, M.steel, s2 * 1.5, 0.8, -0.35, 0, 10); hb.rotation.z = Math.PI / 2; ht.add(hb); }
    const c = leCrate('SCHOOL', { seed: 11, w: 2.6, h: 2.2, d: 1.8 }); c.position.set(0, 0.35, 0.4); c.rotation.x = -0.05; ht.add(c); }
  { const cone = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(rb(1.8, 0.25, 1.8, M.dark, 0, 0.12, 0, 0)); g.add(cyl(0.18, 0.75, 2.6, M.orange, 0, 1.5, 0, 0, 14)); g.add(cyl(0.4, 0.55, 0.5, c3Prop('#ffffff', { rough: 0.4 }), 0, 1.7, 0, 0, 14)); };
    cone(-30, 30); cone(-27, 31.5); cone(27, 36);
    for (const x of [-60, -42, 30]) { scene.add(cyl(0.55, 0.55, 3.6, M.yel, x, 1.8, 6.5, 0, 12)); for (const yy of [1.0, 2.6]) scene.add(cyl(0.58, 0.58, 0.35, M.dark, x, yy, 6.5, 0, 12)); { const bt = c3Mesh(new THREE.SphereGeometry(0.56, 12, 8), M.yel, 0); bt.position.set(x, 3.6, 6.5); scene.add(bt); } }
    scene.add(rb(4.0, 5.4, 1.4, c3Prop('#c8ccd0', { rough: 0.5 }), 34, 5.0, 0.8, 0)); scene.add(rb(3.6, 0.3, 0.2, M.yel, 34, 6.2, 1.55, 0)); scene.add(rb(0.6, 0.6, 0.2, c3Prop('#d8282a'), 35.2, 3.8, 1.55, 0));   // electric box
    const cc = new THREE.Group(); cc.position.set(-24, 33.5, 1.2); scene.add(cc); cc.add(rb(0.4, 0.4, 1.2, M.dark, 0, 0, 0, 0)); const cb = c3Mesh(c3RBox(1.0, 1.0, 2.2, 0.3), c3Prop('#e8e8ec', { rough: 0.4 }), 0); cb.position.set(0, -0.5, 1.4); cb.rotation.x = 0.3; cc.add(cb);   // CCTV
    for (const [x, t] of [[-52, 'BAY 1'], [-24, 'BAY 3']]) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.0), c3Flat('#ffffff', { map: leTexSign(t, '', '#f2c23a', '#1e2a5a') })); sg.position.set(x, t === 'BAY 3' ? 25.6 : 23.5, 0.5); if (t === 'BAY 1') scene.add(sg); }
    const hz = tex((g, w, h) => { g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#22222a'; for (let x = -h; x < w; x += 2 * h) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.lineTo(x + 2 * h, 0); g.lineTo(x + h, h); g.fill(); } }, 512, 32); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(20, 1);
    scene.add(pl(160, 0.5, c3Prop('#ffffff', { map: hz, rough: 0.6 }), 0, 0.62, 2.42));   // hazard stripe on the dock kerb
    const st = tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, 'LOADING ZONE', w / 2, h / 2, h * 0.6, 'rgba(242,194,58,0.9)', { stroke: false, maxW: w * 0.92 }); }, 1024, 160);
    const zs = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), c3Flat('#ffffff', { map: st, transparent: true })); zs.rotation.x = -Math.PI / 2; zs.position.set(-36, 0.06, 32); scene.add(zs); }
  // ---- FOCUS: crate stacks (labels stay sharp), the van, the carried crates
  const F = new THREE.Group(); scene.add(F);
  for (const [word, x] of Object.entries(LE_CR)) { const p = lePallet(); p.position.set(x, 0, LE_CRZ); F.add(p); const a = leCrate('', { seed: 1 }); a.position.set(x, 0.7, LE_CRZ); F.add(a); const b = leCrate(word, { books: true, seed: 2 }); b.position.set(x, 0.7 + 3.4, LE_CRZ); F.add(b); }
  for (const [x, z, ry] of [[-18, 19, 0.1], [-24, 22, -0.2]]) { const p = lePallet(); p.position.set(x, 0, z); p.rotation.y = ry; F.add(p); const a = leCrate('', { seed: x }); a.position.set(x, 0.7, z); a.rotation.y = ry; F.add(a); }
  s.van = leVan(); s.van.position.set(LE_VAN[0], 0, LE_VAN[1]); s.van.rotation.y = LE_VANR; F.add(s.van);
  s.carry = leCrate('SCHOOL', { books: true, seed: 5 }); s.carry.scale.setScalar(0.72); F.add(s.carry);
  s.push = leCrate('VILLAGE', { books: true, seed: 6 }); s.push.scale.setScalar(0.72); F.add(s.push);
  c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'hero'); toonPerson(s, 'cowork');
  c3Env(scene, { top: '#9ac0f0', mid: '#c8b8a8', bot: '#5a5050' }); c3ShadeScene(scene, { dark: 0.16, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.7, scale: 0.35, inkSet: false, grimeH: 4, bounce: ['#a8c4f0', '#a08868', 0.1] });
  return s;
}
const leBayGet = () => LE.bay ||= leBayBuild();
SETS.bay = leBayGet;
// camera: whip in (decelerating pan right) -> low wide of the bay on 'big' -> crane up + orbit right onto the van and the
// workers on 'lending' -> drop low and track LEFT along the crates landing on SCHOOL on 'schools' -> push + dutch roll -> whip out right
CAMSEQ.bay = [
  [46.14, [0, 9, 59], [-34, 9, 14], 44, -4],
  [46.42, [1, 8.5, 58], [4, 10, 14], 44, -2.5],
  [47.55, [6, 17, 58], [18, 6.5, 22], 42, 4],
  [47.95, [7.5, 16, 55], [17, 6.8, 22], 41, 2.5],
  [48.30, [-8, 6.8, 40], [-10, 3.9, 20], 36, -2],
  [48.42, [-8.3, 7.0, 38.6], [-10, 4.0, 20], 35.5, -4.5],   // v3: the bay ends at 48.60 (the classroom starts right after 'schools')
  [48.60, [-8.5, 7.05, 38.0], [26, 4.0, 26], 35, -3],
];
// a carried crate IN FRONT of the carrier: its back face just in front of the card plane, hands on its sides (gripDots
// drawn over it), label turned to the camera; o = crate origin is its bottom centre
function leCarry(s, who, crate, dy = 0) { const a = c3ToonHandWorld(s.p[who], 'L'), b = c3ToonHandWorld(s.p[who], 'R'), m = a.clone().add(b).multiplyScalar(0.5), sc = crate.scale.x;
  const fwd = s.cam.position.clone().sub(m).setY(0).normalize(), u = crate.userData; crate.visible = true; crate.rotation.set(0, Math.atan2(fwd.x, fwd.z), 0);
  crate.position.copy(m).add(V3(0, -u.h * sc * 0.5 + dy, 0)).addScaledVector(fwd, u.d * sc * 0.5 + 0.3); gripDot(s, who, 'L'); gripDot(s, who, 'R'); return crate.position.clone(); }
function leBayFrame(t) { const s = leBayGet(); hideAll(s); hideGrips(s); seqCam(s, 'bay', t);
  // the hero walks a crate from the stacks toward the van, stops, dips (anticipation) and swings it up to his chest on 'books'
  const wk = clamp((t - 46.3) / 1.2), x = lerp(LE_HERO0, LE_HERO1, EZ.o2(wk)), walking = t > 46.3 && t < 47.5, lift = 47.78;
  const hold = { h: [0.3, 0.56], pole: [1, 0.4], front: true, hand: 'grip' }, dip = { h: [0.3, 0.64], pole: [1, 0.4], front: true, hand: 'grip' }, up = { h: [0.3, 0.38], pole: [1, 0.7], front: true, hand: 'grip' };
  const lean = leK([[0, 0.04], [47.5, -0.02], [lift - 0.16, 0.08], [lift, -0.07], [lift + 0.22, 0.02]], t, 0.1);
  pose(s, 'hero', t, x, LE_HEROZ, Object.assign({ mode: walking ? 'walk' : 'stand', phase: (x - LE_HERO0) / 3.3, stride: 3.3, stop: clamp((t - 47.2) / 0.3), lean, expr: [[0, 'determined'], [47.5, 'happy'], [48.32, 'grin']],
    hand: { L: [[0, hold], [lift - 0.16, dip], [lift, up]], R: [[0, hold], [lift - 0.16, dip], [lift, up]] }, gaze: [0.6, 0] }, t < 47.45 ? { heading: Math.PI / 2 } : { facing: leK([[0, 1.1], [47.45, 0.9], [lift, 0.35]], t, 0.18) }));
  leCarry(s, 'hero', s.carry, walking ? 0.08 * Math.sin((x - LE_HERO0) / 3.3 * TAU) : 0);
  // the coworker by the van's open back: strains under his crate, dips (anticipation) and heaves it up on 'lending',
  // turns to the van to load it, then to the hero on 'schools' — the crate stays in his hands, in front of him
  const vb = s.van.userData, backW = V3(vb.X0 - 0.4, 0, 0).applyAxisAngle(V3(0, 1, 0), LE_VANR).add(V3(LE_VAN[0], 0, LE_VAN[1])), heave = 47.5;
  const out = { h: [0.3, 0.6], pole: [1, 0.6], front: true, hand: 'grip' }, low = { h: [0.3, 0.7], pole: [1, 0.6], front: true, hand: 'grip' }, hi = { h: [0.3, 0.36], pole: [1, 0.6], front: true, hand: 'grip' };
  pose(s, 'cowork', t, LE_CW[0], LE_CW[1], Object.assign({ expr: [[0, 'strain'], [47.62, 'smile'], [48.2, 'happy']], lean: leK([[0, 0.05], [heave - 0.14, 0.1], [heave, -0.08], [heave + 0.3, 0]], t, 0.1),
    hand: { L: [[0, out], [heave - 0.14, low], [heave, hi]], R: [[0, out], [heave - 0.14, low], [heave, hi]] }, gaze: [0.7, 0.2], y: t < heave ? 0.04 * Math.sin(t * 9) : 0 }, t < 48.25 ? { look: [backW.x, backW.z] } : { look: [x, LE_HEROZ] }));
  leCarry(s, 'cowork', s.push);
  c3Render(s.scene, s.cam, { bg: '#9cc4ee', bgBlur: 1.0, glow: 0.3, glowBlur: 12 });
}
SHOT_FN.s19 = (t) => leBayFrame(t); SNAPS.s19 = 'free';

// =====================================================================
//  VILLAGE classroom
// =====================================================================
const LE_VX = 30, LE_VZ = 50, LE_VH = 26, LE_DESK = [1.5, 16], LE_TOP = 4.6;
function leVillageBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.3, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#5a80c0', ambI: 0.16, sky: '#b8e0d0', ground: '#a07848', key: '#fff0d0', keyI: 1.2, keyP: [-30, 60, 70], rim: '#ffe0b0', rimI: 0.5, rimP: [20, 40, -60] });
  const wood = c3Prop('#ffffff', { map: texWood(), rough: 0.7 }), woodL = c3Prop('#c88a4a', { rough: 0.6 }), metal = c3Prop('#3a6a5a', { rough: 0.5 }), cream = c3Prop('#f4ecd8', { rough: 0.7 });
  const mint = (rep) => c3Prop('#ffffff', { map: (() => { const t = tex((g, w, h) => { const dado = h * 0.72; g.fillStyle = '#62c49c'; g.fillRect(0, 0, w, dado); g.fillStyle = '#2f8a6a'; g.fillRect(0, dado, w, h - dado); g.fillStyle = '#f4ecd8'; g.fillRect(0, dado - 8, w, 8);
    const R = RNG('lemint'); for (let i = 0; i < 300; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,40,20,0.04)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(4, 30), R.r(2, 10)); } g.fillStyle = '#7a4a2a'; g.fillRect(0, h - 14, w, 14); }, 256, 512); t.wrapS = THREE.RepeatWrapping; t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  { const t = texWood(); t.repeat.set(8, 10); scene.add(pl(2 * LE_VX, LE_VZ, c3Prop('#ffffff', { map: t, rough: 0.7 }), 0, 0, LE_VZ / 2, 0, -Math.PI / 2)); }
  // back wall with two tall window holes (x -19 and 19, w 9, y 6..21) on painted hills
  const WX = [-19, 19], ww = 9, wy0 = 6, wy1 = 21;
  { const xs = [-LE_VX, WX[0] - ww / 2, WX[0] + ww / 2, WX[1] - ww / 2, WX[1] + ww / 2, LE_VX]; for (let i = 0; i < xs.length; i += 2) { const a = xs[i], b = xs[i + 1]; scene.add(plNC(b - a, LE_VH, mint((b - a) / 14), (a + b) / 2, LE_VH / 2, 0)); }
    for (const x of WX) { scene.add(plNC(ww, wy0, mint(ww / 14), x, wy0 / 2, 0)); scene.add(plNC(ww, LE_VH - wy1, c3Prop('#62c49c', { rough: 0.85 }), x, (wy1 + LE_VH) / 2, 0));
      const v = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), c3Flat('#ffffff', { map: leTexHills(x) })); v.position.set(x, 14, -14); v.userData.noCast = true; scene.add(v);
      scene.add(rb(ww + 1, 0.8, 1.6, cream, x, wy0 - 0.2, 0.6, 0)); for (const s2 of [-1, 1]) scene.add(rb(0.6, wy1 - wy0, 0.8, cream, x + s2 * ww / 2, (wy0 + wy1) / 2, 0.2, 0)); scene.add(rb(ww + 0.6, 0.6, 0.8, cream, x, wy1, 0.2, 0));
      scene.add(rb(0.3, wy1 - wy0, 0.3, cream, x, (wy0 + wy1) / 2, 0.1, 0)); scene.add(rb(ww, 0.3, 0.3, cream, x, (wy0 + wy1) / 2 + 2, 0.1, 0));
      for (const k of [-2.6, 2.6]) { scene.add(cyl(0.7, 0.55, 1.1, c3Prop('#c8602e', { rough: 0.7 }), x + k, wy0 + 0.75, 0.8, 0, 10)); const lf = c3Mesh(new THREE.SphereGeometry(0.9, 10, 8), c3Prop('#3a9a4a', { rough: 0.7 }), 0); lf.position.set(x + k, wy0 + 2.0, 0.8); scene.add(lf); }
      const sun = new THREE.SpotLight('#fff0c8', 1.6, 90, 0.42, 0.6, 1.0); sun.position.set(x, 24, -10); sun.target.position.set(x * 0.6, 0, 26); sun.layers.enableAll(); scene.add(sun); scene.add(sun.target); } }
  for (const sx of [-1, 1]) scene.add(plNC(LE_VZ, LE_VH, mint(LE_VZ / 14), sx * LE_VX, LE_VH / 2, LE_VZ / 2, -sx * Math.PI / 2));
  scene.add(plNC(2 * LE_VX, LE_VZ, c3Prop('#f0f4e8', { rough: 0.9 }), 0, LE_VH, LE_VZ / 2, 0, Math.PI / 2));
  for (const z of [14, 32]) for (const x of [-12, 12]) { scene.add(rb(8, 0.5, 2.2, c3Prop('#ffffff', { emissive: '#fff6e0', ei: 1.0, glow: '#fff6e0' }), x, LE_VH - 1.2, z, 0)); scene.add(cyl(0.05, 0.05, 1, c3Prop('#2a2a30'), x, LE_VH - 0.5, z, 0, 4)); }
  // blackboard, alphabet strip, map, clock, kids' drawings, coat hooks with school bags
  { const b = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), c3Prop('#ffffff', { map: leTexBoard(), rough: 0.9 })); b.position.set(0, 13, 0.25); scene.add(b); scene.add(rb(22, 0.5, 1.0, woodL, 0, 7.3, 0.6, 0));
    for (const [x, c] of [[-4, '#ffffff'], [-3, '#ffd0e0'], [5, '#ffe08a']]) scene.add(rb(0.7, 0.25, 0.25, c3Prop(c), x, 7.7, 0.6, 0)); }
  scene.add(plNC(2 * LE_VX - 2, 1.6, c3Flat('#ffffff', { map: tex((g, w, h) => { const L = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'; g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h); for (let i = 0; i < L.length; i++) { g.fillStyle = ['#e8402e', '#2f6ab8', '#f29a2a', '#3a9a5a'][i % 4]; g.font = `900 ${h * 0.7}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L[i] + L[i].toLowerCase(), (i + 0.5) * w / L.length, h / 2); } }, 2048, 64) }), 0, 23.4, 0.15));
  { const ck = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), c3Flat('#ffffff', { map: texClock() })); ck.position.set(13.5, 18.5, 0.2); scene.add(ck); }
  for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), c3Prop('#ffffff', { map: tex((g, w, h) => { const R = RNG('ledraw', i); g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.lineWidth = 6; g.lineCap = 'round';
      g.fillStyle = ['#f2c23a', '#e8402e', '#3a9a5a', '#2f6ab8'][i]; g.beginPath(); g.arc(w * 0.75, h * 0.25, 18, 0, TAU); g.fill(); g.strokeStyle = '#3a9a5a'; g.beginPath(); g.moveTo(0, h * 0.8); g.quadraticCurveTo(w / 2, h * 0.55, w, h * 0.8); g.stroke();
      g.strokeStyle = '#2a2a30'; const cx = R.r(w * 0.25, w * 0.5); g.beginPath(); g.arc(cx, h * 0.45, 10, 0, TAU); g.moveTo(cx, h * 0.52); g.lineTo(cx, h * 0.75); g.moveTo(cx - 12, h * 0.6); g.lineTo(cx + 12, h * 0.6); g.stroke(); }, 128, 100), rough: 0.9 }));
    d.position.set(-LE_VX + 0.1, 14 - (i % 2) * 3, 10 + i * 4); d.rotation.y = Math.PI / 2; d.rotation.z = (i % 2 ? 0.06 : -0.05); scene.add(d); }
  for (let i = 0; i < 5; i++) { const z = 8 + i * 3.6; scene.add(rb(0.4, 0.4, 0.8, metal, LE_VX - 0.4, 10, z, 0)); const bag = rb(1.6, 2.2, 0.9, c3Prop(['#e8402e', '#2f6ab8', '#f29a2a', '#8a4aa8', '#3a9a5a'][i], { rough: 0.6 }), LE_VX - 0.8, 8.6, z, 0); scene.add(bag); }
  { const mp = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.6), c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#9ad0f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c070'; g.beginPath(); g.moveTo(w * 0.08, h * 0.5); for (let k = 0; k <= 20; k++) g.lineTo(w * (0.08 + k * 0.042), h * (0.42 + Math.sin(k * 1.3) * 0.05)); g.lineTo(w * 0.92, h * 0.66); for (let k = 20; k >= 0; k--) g.lineTo(w * (0.08 + k * 0.042), h * (0.66 + Math.cos(k * 1.1) * 0.04)); g.fill();
      g.fillStyle = '#d8282a'; g.beginPath(); g.arc(w * 0.42, h * 0.52, 8, 0, TAU); g.fill(); inked(g, 'TÜRKİYE', w / 2, h * 0.18, h * 0.12, '#1e3a6a', { stroke: false, maxW: w * 0.6 }); g.lineWidth = 10; g.strokeStyle = '#7a4a2a'; g.strokeRect(0, 0, w, h); }, 512, 320), rough: 0.8 }));
    mp.position.set(LE_VX - 0.1, 15, 28); mp.rotation.y = -Math.PI / 2; scene.add(mp); }
  { const bc = new THREE.Group(); bc.position.set(LE_VX - 1.5, 0, 10); bc.rotation.y = -Math.PI / 2; scene.add(bc); bc.add(rb(9, 12, 2.6, woodL, 0, 6, 0, 0));
    for (let r = 0; r < 4; r++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.5), c3Prop('#ffffff', { map: texBooks(50 + r), rough: 0.8 })); b.position.set(0, 1.6 + r * 2.9, 1.32); bc.add(b); bc.add(rb(8.8, 0.3, 2.5, wood, 0, 0.3 + r * 2.9, 0.1, 0)); } }
  for (const x of [-19, 19]) { for (const s2 of [-1, 1]) { const cu = c3Mesh(c3RBox(1.6, 16, 0.5, 0.25), c3Prop('#f2a23a', { rough: 0.9 }), 0); cu.position.set(x + s2 * 5.6, 13.6, 0.9); scene.add(cu); for (let k = 0; k < 3; k++) scene.add(rb(0.12, 16, 0.6, c3Prop('#d8822a', { rough: 0.9 }), x + s2 * 5.6 - 0.5 + k * 0.5, 13.6, 1.0, 0)); }
    scene.add(rb(10.4, 0.5, 0.5, c3Prop('#7a4a2a'), x, 22.0, 0.8, 0));
    const rd = new THREE.Group(); rd.position.set(x, 0, 0.8); scene.add(rd); for (let k = 0; k < 10; k++) rd.add(rb(0.6, 3.6, 0.7, c3Prop('#f4ecd8', { rough: 0.5 }), -3.6 + k * 0.8, 2.6, 0, 0)); rd.add(leTube(0.12, [-4, 0.6, 0.2], [-4, 0, 0.2], c3Prop('#c8c8c8'))); }
  { const ps = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.6), c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#fff2c8'; g.fillRect(0, 0, w, h); inked(g, 'OKU!', w / 2, h * 0.16, h * 0.13, '#e8402e', { stroke: false }); g.fillStyle = '#2f6ab8'; g.fillRect(w * 0.2, h * 0.36, w * 0.6, h * 0.42); g.fillStyle = '#f6efdc'; g.fillRect(w * 0.24, h * 0.39, w * 0.25, h * 0.36); g.fillRect(w * 0.51, h * 0.39, w * 0.25, h * 0.36); g.fillStyle = '#3a9a5a'; g.font = `700 ${h * 0.07}px Arial`; g.textAlign = 'center'; g.fillText('read every day', w / 2, h * 0.9); g.lineWidth = 8; g.strokeStyle = '#e8402e'; g.strokeRect(0, 0, w, h); }, 256, 340), rough: 0.9 }));
    ps.position.set(-LE_VX + 0.12, 15, 31); ps.rotation.y = Math.PI / 2; scene.add(ps); }
  { const fan = new THREE.Group(); fan.position.set(0, LE_VH - 1.6, 24); scene.add(fan); fan.add(cyl(0.1, 0.1, 1.4, c3Prop('#2a2a30'), 0, 0.7, 0, 0, 6)); fan.add(cyl(0.6, 0.6, 0.5, c3Prop('#f4ecd8'), 0, 0, 0, 0, 12)); for (let k = 0; k < 4; k++) { const bl = rb(4.6, 0.12, 0.9, woodL, 2.5, 0, 0, 0); const p = new THREE.Group(); p.rotation.y = k * Math.PI / 2 + 0.3; p.add(bl); fan.add(p); } }
  // pupils' desks (two rows) + the teacher's desk
  const desk = (x, z, k = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(rb(6.4 * k, 0.4, 3.2, wood, 0, 4.2, 0, 0)); g.add(rb(6.0 * k, 2.0, 0.2, woodL, 0, 3.0, 1.4, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.14, 0.14, 4.0, metal, sx * (3.0 * k - 0.3), 2.0, sz * 1.3, 0, 6));
    g.add(rb(6.0 * k, 0.4, 1.6, woodL, 0, 2.6, 3.0, 0)); return g; };
  for (const [x, z] of [[-14, 30], [12, 30], [-14, 40], [12, 40]]) { const d = desk(x, z); const R = RNG('ledsk', x + z); for (let k = 0; k < 2; k++) { const bk = leBook(['#e8402e', '#2f6ab8', '#f29a2a', '#3a9a5a'][R.i(0, 3)]); bk.position.set(R.r(-2, 2), 4.65, R.r(-0.6, 0.6)); bk.rotation.y = R.n(0.5); d.add(bk); } }
  const F = new THREE.Group(); scene.add(F);
  { const g = new THREE.Group(); g.position.set(LE_DESK[0], 0, LE_DESK[1]); F.add(g); g.add(rb(11, 0.5, 5, c3Prop('#a8642e', { rough: 0.5 }), 0, LE_TOP - 0.25, 0, 0)); { const dw = c3Prop('#c88a4a', { rough: 0.6 }), dd = c3Prop('#9a5a2a', { rough: 0.6 }), kn = c3Prop('#e8c060', { metal: 0.6, rough: 0.3 }), H0 = LE_TOP - 0.5;
      for (const sx of [-1, 1]) { g.add(rb(3.0, H0, 4.2, dw, sx * 3.7, H0 / 2, -0.2, 0)); for (let k = 0; k < 3; k++) { g.add(rb(2.6, H0 / 3 - 0.3, 0.12, dd, sx * 3.7, 0.35 + (k + 0.5) * H0 / 3, 1.95, 0)); g.add(rb(0.7, 0.18, 0.2, kn, sx * 3.7, 0.35 + (k + 0.5) * H0 / 3 + 0.2, 2.06, 0)); } g.add(rb(3.1, 0.3, 4.3, dd, sx * 3.7, 0.15, -0.2, 0)); }
      g.add(rb(4.4, H0 - 1.2, 0.2, dw, 0, H0 / 2 + 0.6, 0.9, 0)); g.add(rb(4.0, H0 - 2.0, 0.08, dd, 0, H0 / 2 + 0.6, 1.02, 0)); g.add(rb(11.2, 0.25, 0.3, dd, 0, LE_TOP - 0.55, 2.45, 0)); }
    { const gb = new THREE.Group(); gb.position.set(-4.3, LE_TOP, -1.0); g.add(gb); gb.add(cyl(0.6, 0.8, 0.25, c3Prop('#3a3a44'), 0, 0.12, 0, 0, 14)); gb.add(cyl(0.08, 0.08, 1.0, c3Prop('#e8c060', { metal: 0.6 }), 0, 0.6, 0, 0, 6));
      const sp = c3Mesh(new THREE.SphereGeometry(1.0, 20, 14), c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#3a8ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#6ac05a'; const R2 = RNG('leglobe'); for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(R2.r(0, w), R2.r(h * 0.2, h * 0.8), R2.r(14, 40), R2.r(10, 30), R2.r(0, 3), 0, TAU); x.fill(); } }, 256, 128), rough: 0.4 }), 0); sp.position.y = 2.0; sp.rotation.z = 0.4; gb.add(sp); }
    for (let k = 0; k < 4; k++) g.add(rb(2.2, 0.18, 1.6, c3Prop(['#e8402e', '#2f6ab8', '#f2c23a', '#3a9a5a'][k], { rough: 0.6 }), 3.6, LE_TOP + 0.1 + k * 0.19, 1.3, 0));
    for (let k = 0; k < 4; k++) { const pc = rb(0.1, 1.3, 0.1, c3Prop(['#f2c23a', '#e8402e', '#2f6ab8', '#3a9a5a'][k]), 4.0 + (k % 2) * 0.12 - 0.06, LE_TOP + 1.0, -0.8 + (k > 1 ? 0.1 : -0.1), 0); pc.rotation.z = (k - 1.5) * 0.12; g.add(pc); }
    g.add(rb(3, 0.12, 2.2, cream, -3.6, LE_TOP + 0.06, 0.6, 0)); g.add(cyl(0.4, 0.35, 1.0, c3Prop('#2f6ab8'), 4.0, LE_TOP + 0.5, -0.8, 0, 10));
    const ap = c3Mesh(new THREE.SphereGeometry(0.55, 12, 10), c3Prop('#d8282a', { rough: 0.3 }), 0); ap.position.set(4.2, LE_TOP + 0.5, 1.2); g.add(ap);
    // the crate: box + a lid hinged on its far edge
    const cr = leCrate('VILLAGE', { books: true, w: 4.6, h: 2.8, d: 3.2, seed: 9 }); cr.position.set(0, LE_TOP, 0.4); g.add(cr);
    s.lid = new THREE.Group(); s.lid.position.set(0, LE_TOP + 2.8, 0.4 - 1.6); g.add(s.lid); s.lid.add(rb(4.8, 0.3, 3.3, c3Prop('#ffffff', { map: leTexSlats(), rough: 0.85 }), 0, 0.15, 1.65, 0));
    s.glow = new THREE.PointLight('#fff0b0', 0, 14, 2); s.glow.position.set(LE_DESK[0], LE_TOP + 4.5, LE_DESK[1] + 0.4); s.glow.layers.enableAll(); scene.add(s.glow); }
  c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'teacher'); toonPerson(s, 'LEkidA'); toonPerson(s, 'LEkidB');
  c3Env(scene, { top: '#e8fff0', mid: '#8ac8a8', bot: '#6a4a2a' }); c3ShadeScene(scene, { dark: 0.16 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.6, scale: 0.5, inkSet: false, bounce: ['#d8f0e0', '#c8a070', 0.1], shafts: [[[-19, 21, -2], [-12, 0, 24], 3, 7, '#fff2c8', 0.08], [[19, 21, -2], [12, 0, 24], 3, 7, '#fff2c8', 0.08]] });
  return s;
}
const leVillageGet = () => LE.village ||= leVillageBuild();
SETS.village = leVillageGet;
// 0.64 s, ONE strong move: decelerating pan right in -> crane down + push onto the opening crate with a roll -> whip out right
CAMSEQ.village = [   // v3: 1.7 s on screen (video clock 48.60-50.30): whip in, land wide on the class, push in as the lid opens on 'villages', settle with a slow orbit, whip out
  [48.60, [10, 16, 52], [-30, 10, 10], 42, -4],
  [48.84, [8, 15, 50], [0.5, 8.6, 15], 42, -2],
  [49.10, [6, 13.5, 46.5], [0.8, 8.2, 15.5], 42, 1.5],
  [49.58, [2.8, 11.4, 43.5], [1.0, 7.6, 16], 45, 3.5],
  [50.06, [-1.8, 11, 42.2], [1.2, 7.4, 16], 45, 1.5],
  [50.30, [-1.8, 11, 42.2], [36, 7.4, 20], 45, 1.5],
];
function leVillageFrame(t) { const s = leVillageGet(); hideAll(s); hideGrips(s); seqCam(s, 'village', t);
  const op = EZ.o3(clamp((t - 49.08) / 0.16)); s.lid.rotation.x = -op * 1.9; s.glow.intensity = 2.2 * op;
  const [dx, dz] = LE_DESK;
  pose(s, 'teacher', t, dx - 2.6, dz - 0.8, { look: t < 49.64 ? [dx, dz + 4] : [dx + 4, dz + 6], lean: leK([[0, 0], [49.08, -0.06], [49.16, 0.08], [49.4, 0.03], [49.6, -0.04], [49.7, 0.05], [49.95, 0.02]], t, 0.06), expr: [[0, 'smile'], [49.1, 'happy'], [49.66, 'laugh']], hand: { L: [[0, 'desk'], [49.66, 'talk']], R: [[0, { h: [0.4, 0.3], pole: [1, 0.6], hand: 'grip', front: true }], [49.08, { h: [0.42, -0.32], pole: [1, 0.7], hand: 'grip', front: true }]] }, gaze: t < 49.64 ? [0.6, 0.4] : [0.7, 0.1] });   // v3: a second beat in the longer hold: she turns to the kids, laughing
  pose(s, 'LEkidA', t, dx + 3.6, dz + 3.5, { y: 0.9 * hopAt(t, 49.72, 0.3), squash: 0.5 * Math.max(0, 1 - Math.abs(t - 50.03) / 0.06), look: [dx, dz], lean: 0.12, expr: [[0, 'surprised'], [49.16, 'excited']], hand: { L: [[0, 'down'], [49.16, 'up']], R: [[0, 'down'], [49.16, 'up']] }, gaze: [-0.7, 0.4], fx: t > 49.2 ? 'sparkle' : undefined });
  pose(s, 'LEkidB', t, dx - 4.6, dz + 3.4, { look: [dx, dz], lean: leK([[0, 0.1], [49.78, 0.02], [49.86, 0.16], [50.0, 0.12]], t, 0.06), expr: [[0, 'neutral'], [49.2, 'shock'], [49.8, 'excited']], hand: { L: [[0, 'down'], [49.2, 'chin'], [49.8, 'up']], R: [[0, 'down'], [49.2, 'up']] }, gaze: [0.8, 0.4] });
  c3Render(s.scene, s.cam, { bg: '#62c49c', bgBlur: 2.0, glow: 0.35, glowBlur: 12 });
}
SHOT_FN.s20 = (t) => leVillageFrame(t); SNAPS.s20 = 'free';

// =====================================================================
//  PRISON cell  (v2: Ricks prison look = cyan / slate block walls with a deep-teal dado + an orange stripe, warm key from
//  the corridor side (bar shadows stripe the floor), ONE warm sun shaft through the barred window, pink/orange accents)
// =====================================================================
const LE_PX = 14, LE_PZ = 60, LE_PH = 24, LE_BARX = -LE_PX, LE_BUNK = [2, 4.4], LE_SEAT = 3.35, LE_INM = [-1.2, 6.8], LE_CEL = [6.6, 11.4], LE_SLIDE = 50.14;
// block wall: light cyan blocks over a deep-teal dado, an orange stripe, drip stains (one texture = the full wall height)
function leTexCell(seed) { const t = tex((g, w, h) => { const R = RNG('lecell', seed), rows = 24, rh = h / rows, dado = 15;
  g.fillStyle = '#1e4658'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) { const c = j >= dado ? '#2f6e88' : t3Mix('#5aa4bc', '#4a90ac', j / dado); for (let i = -1; i < 3; i++) { const x = (i + (j % 2) * 0.5) * w / 2;
    g.fillStyle = c3Shd(c, R.r(0.93, 1.05)); g.fillRect(x + 2, j * rh + 2, w / 2 - 4, rh - 4);
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 2, j * rh + 2, w / 2 - 4, 2); g.fillStyle = 'rgba(0,20,40,0.16)'; g.fillRect(x + 2, j * rh + rh - 6, w / 2 - 4, 4);
    for (let k = 0; k < 6; k++) { g.fillStyle = R.f() < 0.6 ? 'rgba(0,20,40,0.14)' : 'rgba(255,255,255,0.09)'; g.fillRect(x + R.r(4, w / 2 - 6), j * rh + R.r(3, rh - 5), 2, 2); } } }
  g.fillStyle = '#e8743a'; g.fillRect(0, dado * rh - 4, w, 8); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, dado * rh + 4, w, 3);
  for (let i = 0; i < 7; i++) { const x = R.r(0, w), y = R.r(h * 0.3, h * 0.8), gr = g.createLinearGradient(0, y, 0, y + 90); gr.addColorStop(0, 'rgba(10,30,40,0.22)'); gr.addColorStop(1, 'rgba(10,30,40,0)'); g.fillStyle = gr; g.fillRect(x, y, R.r(2, 5), 90); }
  g.fillStyle = '#1a2a34'; g.fillRect(0, h - 10, w, 10); }, 256, 1024); t.wrapS = THREE.RepeatWrapping; return t; }
function leTexTicking(c = '#e8e2d2', s = '#6a8ac0') { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 24) { g.fillStyle = s; g.fillRect(x, 0, 6, h); g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(x + 10, 0, 2, h); }
  const R = RNG('letick'); for (let i = 0; i < 6; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(10, 30), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(120,90,50,0.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 256, 128); }
function leTexPoster() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff8ab4'); gr.addColorStop(0.55, '#ffc08a'); gr.addColorStop(0.56, '#3ab0c8'); gr.addColorStop(1, '#2a8aa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(w * 0.5, h * 0.5, w * 0.18, Math.PI, 0); g.fill(); g.fillStyle = '#f2d8a0'; g.beginPath(); g.ellipse(w * 0.3, h * 0.98, w * 0.5, h * 0.16, 0, 0, TAU); g.fill();
  g.strokeStyle = '#5a3a24'; g.lineWidth = 9; g.beginPath(); g.moveTo(w * 0.22, h * 0.9); g.quadraticCurveTo(w * 0.2, h * 0.55, w * 0.34, h * 0.3); g.stroke(); g.fillStyle = '#2f8a4a';
  for (let k = 0; k < 5; k++) { g.save(); g.translate(w * 0.34, h * 0.3); g.rotate(-2.6 + k * 0.85); g.beginPath(); g.ellipse(w * 0.14, 0, w * 0.15, w * 0.04, 0, 0, TAU); g.fill(); g.restore(); }
  inked(g, 'ANTALYA', w * 0.5, h * 0.14, h * 0.1, '#ffffff', { stroke: '#c8326a', maxW: w * 0.8 }); g.lineWidth = 10; g.strokeStyle = '#f6efe0'; g.strokeRect(0, 0, w, h);
  g.fillStyle = 'rgba(240,230,200,0.9)'; for (const [x, y] of [[0, 0], [w - 34, 0], [0, h - 20], [w - 34, h - 20]]) g.fillRect(x + 4, y + 4, 30, 16); }, 256, 360); }
function leTexPhoto() { return tex((g, w, h) => { g.fillStyle = '#f6f0e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#8ac8e8'; g.fillRect(10, 10, w - 20, h - 40); g.fillStyle = '#6ab45a'; g.fillRect(10, h * 0.55, w - 20, h * 0.45 - 30);
  for (const [x, r, c] of [[0.3, 16, '#e8402e'], [0.55, 13, '#f2c23a'], [0.75, 10, '#2f6ab8']]) { g.fillStyle = '#f0c8a0'; g.beginPath(); g.arc(w * x, h * 0.42, r * 0.7, 0, TAU); g.fill(); g.fillStyle = c; g.fillRect(w * x - r * 0.6, h * 0.42 + r * 0.6, r * 1.2, r * 2); }
  g.font = '700 16px "Comic Sans MS", sans-serif'; g.fillStyle = '#3a2a2a'; g.textAlign = 'center'; g.fillText('baba ♥', w / 2, h - 12); }, 160, 140); }
function leTexFloorP() { const t = tex((g, w, h) => { const R = RNG('lepfl'); g.fillStyle = '#6e8592'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,10,30,0.09)' : 'rgba(255,255,255,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let i = 0; i < 10; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(30, 90), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(20,30,50,0.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.strokeStyle = 'rgba(20,30,50,0.35)'; g.lineWidth = 3; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 6); return t; }
// a horizontal tube between two points (bunk rails, ladder rungs, pipes)
function leTube(r, a, b, mat) { const A = V3(...a), B = V3(...b), m = cyl(r, r, A.distanceTo(B), mat, 0, 0, 0, 0, 10); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), B.clone().sub(A).normalize()); return m; }
// the bunk bed: tube frame with caps, rails, slats, ticking mattresses, pillows, blankets, a ladder, a towel, shoes under it
function leBunk(steel, dark) { const g = new THREE.Group(), X = 6.6, Z = 1.9, Hp = 16.4, cap = c3Prop('#3a4a5a', { rough: 0.5 });
  for (const sx of [-X, X]) for (const sz of [-Z, Z]) { g.add(cyl(0.24, 0.24, Hp, steel, sx, Hp / 2, sz, 0, 12)); const c = c3Mesh(new THREE.SphereGeometry(0.33, 12, 8), cap, 0); c.position.set(sx, Hp, sz); g.add(c); g.add(cyl(0.34, 0.38, 0.3, dark, sx, 0.15, sz, 0, 12)); }
  for (const y of [2.4, 11.6]) { for (const sz of [-Z, Z]) g.add(leTube(0.2, [-X, y, sz], [X, y, sz], steel)); for (const sx of [-X, X]) { g.add(leTube(0.2, [sx, y, -Z], [sx, y, Z], steel)); g.add(leTube(0.16, [sx, y + 1.8, -Z], [sx, y + 1.8, Z], steel)); }
    for (let k = 0; k < 9; k++) g.add(rb(0.5, 0.12, 3.6, steel, -X + 0.9 + k * 1.48, y + 0.1, 0, 0));
    const mt = c3Mesh(c3RBox(12.9, 0.95, 3.7, 0.32), c3Prop('#ffffff', { map: leTexTicking(), rough: 0.9 }), 0); mt.position.set(0, y + 0.66, 0); g.add(mt);
    const pw = c3Mesh(c3RBox(2.7, 0.85, 2.5, 0.38), c3Prop('#f6f2e8', { rough: 0.95 }), 0); pw.position.set(-5.0, y + 1.5, -0.2); pw.rotation.set(0.05, 0.12, -0.08); g.add(pw); }
  { const bl = c3Mesh(c3RBox(3.2, 0.9, 3.75, 0.25), c3Prop('#e8743a', { rough: 0.95 }), 0); bl.position.set(4.6, 3.55, -0.1); g.add(bl); const b2 = c3Mesh(c3RBox(2.9, 0.45, 3.4, 0.2), c3Prop('#c85a2a', { rough: 0.95 }), 0); b2.position.set(4.7, 4.2, -0.15); b2.rotation.y = 0.06; g.add(b2); }   // lower: folded blankets at the foot (he sits on the front edge, away from them)
  { const bm = c3Prop('#d8603a', { rough: 0.95 }); for (const [x, w, h, ry] of [[3.6, 5.2, 0.42, 0.02], [0.4, 2.6, 0.62, -0.08], [-1.4, 1.6, 0.5, 0.1]]) { const bl = c3Mesh(c3RBox(w, h, 3.8, 0.2), bm, 0); bl.position.set(x, 12.5 + h / 2, 0.0); bl.rotation.y = ry; g.add(bl); }
    const fold = c3Mesh(c3RBox(4.6, 1.3, 0.16, 0.07), bm, 0); fold.position.set(3.4, 12.05, Z + 0.12); fold.rotation.set(0.1, 0, 0.03); g.add(fold);   // the upper blanket hangs over the front edge
    for (let k = 0; k < 3; k++) { const b = leBook(['#f2c23a', '#3a9a5a', '#c84a7a'][k]); b.scale.setScalar(0.7); b.position.set(-2.2, 12.5 + k * 0.32, -0.4); b.rotation.y = 0.3 * k - 0.2; g.add(b); } }
  { const tw = c3Mesh(c3RBox(1.6, 3.2, 0.18, 0.08), c3Prop('#ff9ab8', { rough: 0.95 }), 0); tw.position.set(-X - 0.25, 10.2, 0.4); tw.rotation.y = Math.PI / 2; g.add(tw); for (let k = 0; k < 3; k++) g.add(rb(1.62, 0.12, 0.2, c3Prop('#ffffff'), -X - 0.27, 9.0 + k * 0.25, 0.4, 0)); }   // pink towel on the head rail (accent)
  for (const sz of [Z + 0.35]) { g.add(cyl(0.12, 0.12, 9.6, steel, X + 0.3, 7.4, sz + 0.6, 0, 8)); g.add(cyl(0.12, 0.12, 9.6, steel, X + 1.6, 7.4, sz + 0.6, 0, 8)); for (let k = 0; k < 5; k++) g.add(leTube(0.1, [X + 0.3, 4.2 + k * 1.7, sz + 0.6], [X + 1.6, 4.2 + k * 1.7, sz + 0.6], steel)); }
  for (const [x, ry] of [[1.5, 0.2], [2.6, -0.1]]) { const sh = c3Mesh(c3RBox(0.75, 0.5, 1.5, 0.22), c3Prop('#2a2a34', { rough: 0.6 }), 0); sh.position.set(x, 0.25, 0.3); sh.rotation.y = ry; g.add(sh); }
  g.add(rb(3.2, 1.6, 2.4, c3Prop('#b88a5a', { map: leTexSlats('#b88a5a'), rough: 0.85 }), 4.6, 0.8, -0.6, 0));   // a box under the bunk
  return g; }
function lePrisonBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.3, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#3e5c96', ambI: 0.14, sky: '#78b0cc', ground: '#5a4448', key: '#ffd296', keyI: 1.75, keyP: [-60, 75, 45], rim: '#ffb070', rimI: 0.3, rimP: [20, 30, -50] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.2; });
  const steel = c3Prop('#6f8a9c', { metal: 0.55, rough: 0.35 }), dark = c3Prop('#22303c', { rough: 0.5 }), chrome = c3Prop('#c8d4dc', { metal: 0.8, rough: 0.2 });
  const cell = leTexCell(1), wall = (w, y0, y1, x0 = 0) => { const t = cell.clone(); t.needsUpdate = true; t.repeat.set(w / 6, (y1 - y0) / LE_PH); t.offset.set(x0 / 6, y0 / LE_PH); return c3Prop('#ffffff', { map: t, rough: 0.85 }); };
  scene.add(pl(2 * LE_PX + 40, LE_PZ, c3Prop('#ffffff', { map: leTexFloorP(), rough: 0.7 }), -20, 0, LE_PZ / 2, 0, -Math.PI / 2));
  // back wall with a deep barred window (x -1..5, y 14..19)
  const WX0 = -1, WX1 = 5, WY0 = 14, WY1 = 19;
  scene.add(plNC(WX0 + LE_PX, LE_PH, wall(WX0 + LE_PX, 0, LE_PH), (WX0 - LE_PX) / 2, LE_PH / 2, 0)); scene.add(plNC(LE_PX - WX1, LE_PH, wall(LE_PX - WX1, 0, LE_PH, 3), (WX1 + LE_PX) / 2, LE_PH / 2, 0));
  scene.add(plNC(WX1 - WX0, WY0, wall(WX1 - WX0, 0, WY0, 1), (WX0 + WX1) / 2, WY0 / 2, 0)); scene.add(plNC(WX1 - WX0, LE_PH - WY1, wall(WX1 - WX0, WY1, LE_PH, 1), (WX0 + WX1) / 2, (WY1 + LE_PH) / 2, 0));
  { const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), c3Flat('#fff2d4', { glow: '#ffeccc' })); sky.material.userData.glow = '#ffeccc'; sky.position.set(2, 16.5, -3.2); sky.userData.noCast = true; scene.add(sky);
    const rev = c3Prop('#4a8aa4', { rough: 0.85 }); for (const x of [WX0, WX1]) scene.add(rbNC(0.3, WY1 - WY0, 3, rev, x + (x === WX0 ? -0.15 : 0.15), (WY0 + WY1) / 2, -1.5, 0)); scene.add(rbNC(WX1 - WX0, 0.3, 3, rev, 2, WY1 + 0.15, -1.5, 0));
    for (let k = 0; k < 4; k++) scene.add(cyl(0.17, 0.17, WY1 - WY0, steel, WX0 + 1.2 + k * 1.2, (WY0 + WY1) / 2, -0.6, 0, 8)); scene.add(rb(WX1 - WX0, 0.3, 0.3, steel, 2, 16.6, -0.6, 0));
    scene.add(rb(WX1 - WX0 + 1.2, 0.5, 1.6, c3Prop('#6ab0c4', { rough: 0.8 }), 2, WY0 - 0.25, 0.3, 0)); scene.add(rb(WX1 - WX0 + 1.4, 0.4, 0.5, c3Prop('#6ab0c4', { rough: 0.8 }), 2, WY1 + 0.2, 0.15, 0));
    const cup = cyl(0.3, 0.25, 0.6, c3Prop('#f2c23a', { rough: 0.4 }), 4.0, WY0 + 0.3, 0.4, 0, 10); scene.add(cup); }   // a cup on the sill
  // right wall (solid); left wall = bars z 2..30 with a door (z 8..18, a gap under it), solid beyond; the corridor behind
  scene.add(plNC(LE_PZ, LE_PH, wall(LE_PZ, 0, LE_PH, 2), LE_PX, LE_PH / 2, LE_PZ / 2, -Math.PI / 2));
  scene.add(plNC(LE_PZ - 30, LE_PH, wall(LE_PZ - 30, 0, LE_PH, 4), LE_BARX, LE_PH / 2, 30 + (LE_PZ - 30) / 2, Math.PI / 2));
  scene.add(plNC(2, LE_PH, wall(2, 0, LE_PH, 5), LE_BARX, LE_PH / 2, 1, Math.PI / 2));
  for (let z = 2.75; z < 30; z += 1.5) { const door = z > 8 && z < 18, y0 = door ? 1.1 : 0; scene.add(cyl(0.2, 0.2, LE_PH - y0, steel, LE_BARX, y0 + (LE_PH - y0) / 2, z, 0, 8)); }
  for (const [y, z0, z1] of [[1.1, 8, 18], [0.3, 2, 8], [0.3, 18, 30], [10, 2, 30], [LE_PH - 1.2, 2, 30], [16.5, 8, 18]]) scene.add(rb(0.55, 0.6, z1 - z0, steel, LE_BARX, y, (z0 + z1) / 2, 0));
  for (const z of [8, 18]) scene.add(rb(0.8, LE_PH, 0.8, steel, LE_BARX, LE_PH / 2, z, 0));
  scene.add(rb(0.9, 2.2, 1.6, dark, LE_BARX + 0.45, 10, 16.8, 0)); scene.add(rb(0.2, 0.5, 0.3, chrome, LE_BARX + 0.95, 10.3, 16.8, 0));   // the lock + keyhole
  for (const y of [3, 20]) scene.add(cyl(0.35, 0.35, 1.4, dark, LE_BARX + 0.1, y, 8.4, 0, 10));   // hinges
  { scene.add(rb(0.5, 1.6, 3.6, steel, LE_BARX, 8, 13, 0)); scene.add(rb(0.3, 0.9, 3.0, dark, LE_BARX + 0.1, 8, 13, 0)); }   // the food slot
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.5), c3Flat('#ffffff', { map: leTexSign('C-14', '', '#22303c', '#ffd23a') })); sg.position.set(LE_BARX + 0.5, 20.6, 13); sg.rotation.y = Math.PI / 2; scene.add(sg); }
  // corridor: wall, railing, a far cell door, a lamp
  scene.add(plNC(LE_PZ, LE_PH, wall(LE_PZ, 0, LE_PH, 6), -LE_PX - 14, LE_PH / 2, LE_PZ / 2, Math.PI / 2));
  for (const z of [6, 20]) { scene.add(rb(0.4, 12, 7, c3Prop('#2f6e88', { rough: 0.6 }), -LE_PX - 13.7, 6, z, 0)); scene.add(rb(0.3, 1.6, 2.2, c3Prop('#c8dce4', { rough: 0.3 }), -LE_PX - 13.4, 9, z, 0)); }
  scene.add(leTube(0.18, [-LE_PX - 13, 4, 0], [-LE_PX - 13, 4, 40], steel));
  { const lp = new THREE.PointLight('#ffe0b0', 0.9, 40, 1.5); lp.position.set(-21, 18, 14); lp.layers.enableAll(); scene.add(lp); scene.add(rb(4, 0.4, 1.2, c3Prop('#ffffff', { emissive: '#fff0d0', ei: 1, glow: '#fff0d0' }), -21, LE_PH - 0.5, 14, 0)); }
  scene.add(plNC(2 * LE_PX + 30, LE_PZ, c3Prop('#3e6e84', { rough: 0.9 }), -15, LE_PH, LE_PZ / 2, 0, Math.PI / 2));
  // ceiling pipes + a caged lamp + a vent
  for (const [y, z, r] of [[LE_PH - 0.7, 0.8, 0.35], [LE_PH - 1.5, 0.9, 0.22]]) scene.add(leTube(r, [-LE_PX, y, z], [LE_PX, y, z], c3Prop('#8a9aa6', { metal: 0.4, rough: 0.4 })));
  scene.add(leTube(0.3, [LE_PX - 0.6, 0, 1.2], [LE_PX - 0.6, LE_PH, 1.2], c3Prop('#8a9aa6', { metal: 0.4, rough: 0.4 })));
  { scene.add(cyl(1.4, 1.4, 0.4, dark, 0, LE_PH - 0.3, 20, 0, 14)); const b = c3Mesh(new THREE.SphereGeometry(1.0, 12, 8), c3Prop('#ffffff', { emissive: '#fff0d0', ei: 1.4, glow: '#fff0d0' }), 0); b.position.set(0, LE_PH - 1.2, 20); scene.add(b);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; scene.add(leTube(0.06, [Math.cos(a) * 1.3, LE_PH - 0.4, 20 + Math.sin(a) * 1.3], [Math.cos(a) * 1.0, LE_PH - 2.3, 20 + Math.sin(a) * 1.0], dark)); }
    const l = new THREE.PointLight('#ffe2b8', 0.7, 50, 1.6); l.position.set(0, LE_PH - 2.5, 20); l.layers.enableAll(); scene.add(l); }
  { scene.add(rb(3.4, 2.0, 0.3, steel, -9.5, 20.5, 0.15, 0)); for (let k = 0; k < 5; k++) scene.add(rb(3.0, 0.14, 0.2, dark, -9.5, 19.8 + k * 0.35, 0.32, 0)); }
  // the bunk (BG; he sits IN FRONT of the mattress edge, so it never needs to hide him)
  { const g = leBunk(steel, dark); g.position.set(LE_BUNK[0], 0, LE_BUNK[1]); scene.add(g); }
  // sink + mirror, toilet + paper, a shelf with things, a small steel table + stool
  scene.add(rb(0.4, 6.4, 4.2, steel, LE_PX - 0.2, 5.6, 22, 0));
  { const bs = c3Mesh(c3RBox(2.6, 1.1, 3.4, 0.4), chrome, 0); bs.position.set(LE_PX - 1.5, 6.6, 22); scene.add(bs); scene.add(rb(1.8, 0.15, 2.6, dark, LE_PX - 1.5, 7.12, 22, 0));
    scene.add(cyl(0.16, 0.16, 1.2, chrome, LE_PX - 0.7, 7.6, 22, 0, 8)); scene.add(leTube(0.12, [LE_PX - 0.7, 8.1, 22], [LE_PX - 1.6, 8.1, 22], chrome)); scene.add(rb(0.25, 0.5, 0.5, chrome, LE_PX - 0.6, 7.4, 23.2, 0));
    scene.add(rb(0.2, 3.4, 2.6, c3Prop('#dfeef4', { metal: 0.9, rough: 0.1 }), LE_PX - 0.15, 11.2, 22, 0)); scene.add(rb(0.6, 0.6, 1.0, c3Prop('#f6efe0', { rough: 0.6 }), LE_PX - 1.0, 7.4, 20.8, 0)); }
  { const z = 28.2; scene.add(cyl(0.95, 1.15, 2.4, chrome, LE_PX - 1.8, 1.2, z, 0, 16)); scene.add(cyl(1.45, 1.1, 0.9, chrome, LE_PX - 1.9, 2.75, z, 0, 18)); const ring = c3Mesh(new THREE.TorusGeometry(1.2, 0.18, 8, 20), c3Prop('#2a3a44', { rough: 0.6 }), 0); ring.rotation.x = Math.PI / 2; ring.position.set(LE_PX - 1.9, 3.25, z); scene.add(ring);
    const tk = c3Mesh(c3RBox(1.2, 2.6, 3.0, 0.3), chrome, 0); tk.position.set(LE_PX - 0.6, 4.2, z); scene.add(tk);
    const roll = cyl(0.45, 0.45, 1.0, c3Prop('#ffffff', { rough: 0.9 }), LE_PX - 0.6, 5.0, z + 2.4, 0, 12); roll.rotation.x = Math.PI / 2; scene.add(roll); }
  { scene.add(rb(1.8, 0.3, 7.5, c3Prop('#a0703a', { rough: 0.7 }), LE_PX - 0.95, 12.5, 15.8, 0)); for (const z of [12.8, 18.8]) scene.add(rb(0.3, 1.2, 0.3, dark, LE_PX - 0.3, 11.8, z, 0));
    scene.add(mug('#d8402e', LE_PX - 1.0, 12.65, 13.2)); scene.add(cyl(0.25, 0.25, 0.8, c3Prop('#3a9ad0', { rough: 0.4 }), LE_PX - 1.0, 13.05, 14.2, 0, 10)); scene.add(rb(0.12, 1.3, 0.12, c3Prop('#ff6aa0'), LE_PX - 1.0, 13.5, 14.15, 0));
    scene.add(rb(0.7, 0.35, 1.0, c3Prop('#f6efe0'), LE_PX - 1.0, 12.85, 15.2, 0)); for (let k = 0; k < 4; k++) { const b = leBook(['#2f6ab8', '#3a9a5a', '#f2c23a', '#e8743a'][k]); b.rotation.set(0, Math.PI / 2, Math.PI / 2); b.position.set(LE_PX - 1.1, 13.4, 16.4 + k * 0.48); scene.add(b); }
    const rd = c3Mesh(c3RBox(1.2, 1.4, 2.2, 0.2), c3Prop('#3a4a5a', { rough: 0.5 }), 0); rd.position.set(LE_PX - 1.0, 13.35, 18.6); scene.add(rd); { const dl = cyl(0.35, 0.35, 0.1, c3Prop('#c8d4dc'), LE_PX - 1.62, 13.4, 18.6, 0, 12); dl.rotation.z = Math.PI / 2; scene.add(dl); } scene.add(leTube(0.04, [LE_PX - 1.0, 14.0, 19.4], [LE_PX - 1.4, 16.4, 20.2], chrome)); }
  { scene.add(rb(5, 0.3, 3, steel, LE_PX - 2.6, 5.0, 36, 0)); scene.add(rb(0.4, 5, 0.4, steel, LE_PX - 4.6, 2.5, 36, 0)); scene.add(cyl(0.9, 0.9, 0.3, steel, LE_PX - 4.0, 3.2, 39.5, 0, 14)); scene.add(cyl(0.2, 0.2, 3.1, steel, LE_PX - 4.0, 1.55, 39.5, 0, 8));
    const nb = rb(1.6, 0.15, 2.1, c3Prop('#f6efe0'), LE_PX - 2.6, 5.25, 35.6, 0); nb.rotation.y = 0.2; scene.add(nb); }
  // walls: pink beach poster (accent), tally marks, a family photo, a calendar, a crack
  { const pc = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.9), c3Prop('#ffffff', { map: leTexPoster(), rough: 0.9 })); pc.position.set(-8.6, 13.4, 0.12); pc.rotation.z = 0.04; scene.add(pc); }
  { const tl = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.7), c3Flat('#ffffff', { map: leTexTally(), transparent: true })); tl.position.set(-8.8, 7.4, 0.12); scene.add(tl); }
  { const ph = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.9), c3Prop('#ffffff', { map: leTexPhoto(), rough: 0.9 })); ph.position.set(10.6, 14.2, 0.12); ph.rotation.z = -0.07; scene.add(ph); }
  { const cl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.5), c3Prop('#ffffff', { map: texMonth('MAYIS'), rough: 0.9 })); cl.position.set(LE_PX - 0.1, 9, 33); cl.rotation.y = -Math.PI / 2; scene.add(cl); }
  { const ck = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), c3Flat('#ffffff', { transparent: true, map: tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,40,50,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.5, 0); g.lineTo(w * 0.42, h * 0.3); g.lineTo(w * 0.6, h * 0.5); g.lineTo(w * 0.44, h * 0.8); g.lineTo(w * 0.52, h); g.moveTo(w * 0.6, h * 0.5); g.lineTo(w * 0.85, h * 0.62); g.stroke(); }, 64, 96) })); ck.position.set(-12.2, 18, 0.12); scene.add(ck); }
  // the sun: a warm spot through the window onto the floor at his feet + the visible shaft; a cool fill from the front
  const sunTo = [-2.0, 0, 12.5];
  { const l = new THREE.SpotLight('#ffcf8a', 3.4, 80, 0.2, 0.5, 1.0); l.position.set(2, 18, -10); l.target.position.set(...sunTo); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  { const f = new THREE.PointLight('#7aa8e0', 0.35, 80, 1.2); f.position.set(6, 12, 44); f.layers.enableAll(); scene.add(f); }
  // FOCUS: the book (closed / open), the tissue
  const F = new THREE.Group(); scene.add(F);
  s.book = leBook('#d8402e'); s.book.scale.setScalar(1.25); F.add(s.book); s.bookO = leBook('#d8402e', { open: true }); s.bookO.scale.setScalar(1.15); F.add(s.bookO);
  s.tissue = new THREE.Group(); { const wh = c3Prop('#ffffff', { rough: 0.95 }); for (const [x, y, z, r] of [[0, 0, 0, 0.42], [0.3, 0.28, 0.08, 0.3], [-0.26, 0.3, -0.06, 0.32], [0.05, 0.5, 0.04, 0.26]]) { const m = c3Mesh(new THREE.SphereGeometry(r, 10, 8), wh, 0); m.position.set(x, y, z); m.scale.set(1, 0.8, 1); s.tissue.add(m); }
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), c3Prop('#ffffff', { rough: 0.95, side: THREE.DoubleSide })); fl.position.set(0.15, 0.95, 0); fl.rotation.z = -0.25; s.tissue.add(fl); }
  F.add(s.tissue);
  c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'inmate'); toonPerson(s, 'cellmate'); leTearCard(s.p.inmate);
  c3Env(scene, { top: '#a8d0e0', mid: '#4a7a96', bot: '#4a3a3a' }); c3ShadeScene(scene, { dark: 0.12 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.9, scale: 0.5, inkSet: false, bounce: ['#6aa0c8', '#a07858', 0.06], shafts: [[[2, 16.5, -1], sunTo, 2.2, 5.2, '#ffd08a', 0.2]] });
  return s;
}
const lePrisonGet = () => LE.prison ||= lePrisonBuild();
SETS.prison = lePrisonGet;
// tears drawn INTO the inmate's card (the card is redrawn every frame): t3Draw is wrapped, the transform the head canvas is
// drawn with is captured, and two streams start exactly at each eye (t3Face's eye layout for the current facing), run down
// the cheeks and drip — so they follow every head bob / tilt / turn of the sob. p.leTears = 0..1 (set before pose).
function leTearCard(p) {
  p.drawFn = (g, pp, st) => { let M = null; const di = g.drawImage;
    g.drawImage = function (img, ...a) { if (a.length === 4 && a[0] === -T3_HEADBOX.cx && a[1] === -T3_HEADBOX.cy && a[2] === T3_HEADBOX.w) M = this.getTransform(); return di.call(this, img, ...a); };
    try { t3Draw(g, pp, st); } finally { delete g.drawImage; }
    const k = pp.leTears || 0; if (!M || k <= 0.001 || st.f.back) return;
    g.save(); g.setTransform(M); leTearPaint(g, pp, st, k); g.restore(); };
}
function leTearPaint(g, p, st, k) {
  const A = T3.a * (p.o.headK ?? 1), u = 2 * A / 100, m = st.f.m, dir = st.f.dir, shift = dir * 24 * Math.max(0, Math.min(m, 2) - 1.0) * u;
  const sp = 13 * u * (1 - 0.06 * Math.min(m, 1)) * (1 - 0.18 * Math.max(0, m - 1.0)), ey = 2.5 * u + 3.2 * u, L = (20 + 22 * k) * u, t = st.t;
  for (const s of [-1, 1]) { const ex = shift + s * sp, far = s === -dir && m > 0.15, w0 = (far ? 2.2 : 2.8) * u, wob = Math.sin(t * 19 + s) * 0.8 * u;
    const pts = [[ex, ey], [ex + s * 2.2 * u + wob, ey + L * 0.35], [ex + s * 3.6 * u, ey + L * 0.7], [ex + s * 3.2 * u - wob, ey + L]];
    g.beginPath(); g.moveTo(pts[0][0] - w0 * 0.6, pts[0][1]); g.bezierCurveTo(pts[1][0] - w0, pts[1][1], pts[2][0] - w0 * 1.1, pts[2][1], pts[3][0] - w0 * 1.15, pts[3][1]);
    g.quadraticCurveTo(pts[3][0], pts[3][1] + w0 * 1.6, pts[3][0] + w0 * 1.15, pts[3][1]); g.bezierCurveTo(pts[2][0] + w0 * 1.1, pts[2][1], pts[1][0] + w0, pts[1][1], pts[0][0] + w0 * 0.6, pts[0][1]); g.closePath();
    const gr = g.createLinearGradient(0, ey, 0, ey + L); gr.addColorStop(0, 'rgba(150,220,255,0.98)'); gr.addColorStop(1, 'rgba(110,196,255,0.92)'); g.fillStyle = gr; g.fill(); g.lineWidth = 1.5 * u; g.strokeStyle = T3.ink; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 0.9 * u; g.beginPath(); g.moveTo(ex - w0 * 0.2, ey + 3 * u); g.quadraticCurveTo(pts[1][0] - w0 * 0.3, pts[1][1], pts[2][0] - w0 * 0.4, pts[2][1]); g.stroke();
    g.fillStyle = 'rgba(150,220,255,0.98)'; g.beginPath(); g.ellipse(ex, ey - 0.4 * u, 4.2 * u, 2.0 * u, 0, 0, TAU); g.fill(); g.lineWidth = 1.2 * u; g.strokeStyle = T3.ink; g.stroke();   // the welling pool on the lower lid
    for (let i = 0; i < 2; i++) { const ph = (t * 2.1 + i * 0.5 + (s > 0 ? 0.25 : 0)) % 1, x = pts[3][0] + s * ph * 6 * u, y = pts[3][1] + 4 * u + ph * ph * 60 * u, r = (3.0 - ph * 0.8) * u * k;
      g.beginPath(); g.moveTo(x, y - r * 1.9); g.bezierCurveTo(x + r * 1.2, y - r * 0.2, x + r, y + r, x, y + r); g.bezierCurveTo(x - r, y + r, x - r * 1.2, y - r * 0.2, x, y - r * 1.9);
      g.fillStyle = '#8ad4ff'; g.fill(); g.lineWidth = 1.1 * u; g.strokeStyle = T3.ink; g.stroke(); } }
}
// eased keyframes for numbers (Ricks: a quick ease into each held value)
const leK = (K, t, d = 0.14) => { let v = K[0][1]; for (let i = 1; i < K.length; i++) { const [k, x] = K[i]; if (t >= k) { const e = EZ.io(clamp((t - k) / d)); v = v + (x - v) * e; } } return v; };
// camera: whip in (decelerating pan right) on the cell -> dive LOW to the bars as the book slides in on 'prisons' ->
// crane up + orbit right onto the inmate reading -> slow orbit wider for g3 (sob + tissue) with a breathing roll -> whip out right
CAMSEQ.prison = [
  [49.70, [10, 13, 46], [-30, 9, 8], 42, -3],
  [49.92, [9, 12.5, 44], [-5, 7.6, 10], 42, -2],
  [50.36, [3, 6.2, 39], [-4.5, 4.6, 10], 38, -6],
  [51.62, [8, 10, 33], [-1, 7.2, 9], 38, 3],
  [52.62, [11, 11.5, 41], [2, 8.0, 10], 42, -2.5],
  [52.82, [11, 11.5, 41], [36, 8.0, 12], 42, -1],
];
function lePrisonFrame(t) { const s = lePrisonGet(); hideAll(s); hideGrips(s); seqCam(s, 'prison', t);
  [s.book, s.bookO, s.tissue].forEach((m) => { m.visible = false; });
  const grab = 50.92, read = 51.3, sob = 51.8, give = 52.06, [ix, iz] = LE_INM, [cx, cz] = LE_CEL;
  // the book slides along the floor UNDER the cell door (gap below its bottom rail) on 'prisons' and stops at his feet
  const sl = EZ.o3(clamp((t - LE_SLIDE) / 0.42)), bookFloor = V3(lerp(LE_BARX - 7, ix - 1.6, sl), 0.27, lerp(12.6, iz + 1.9, sl));
  // he sits on the FRONT edge of the lower bunk (card plane in front of the mattress, seat = the mattress top, feet on
  // the floor); looks at the book as it arrives, anticipates (sits back), leans down and grabs it on 'over', sits up with
  // a little overshoot, opens it and reads; g3: tears from his eyes + the sob (shoulders shake, head bobs)
  const sobbing = t > sob, shake = sobbing ? Math.sin(t * 46) * 0.1 * (1 - 0.3 * Math.sin(t * 3)) : 0, bob = sobbing ? Math.abs(Math.sin(t * 23)) * 0.06 : 0;
  const lean = leK([[0, 0], [grab - 0.2, 0.07], [grab - 0.1, -0.32], [grab + 0.16, 0.06], [grab + 0.32, -0.02], [sob, 0.12], [sob + 0.5, 0.07]], t, 0.1);   // lean is screen-space: - = toward the book (screen left)
  const tilt = sobbing ? 0.1 + 0.06 * Math.sin(t * 5.5) : leK([[0, 0], [50.36, -0.06], [read, 0.05]], t);
  const reach = { h: [0.6, 1.0], pole: [1, 0.2], hand: 'grip', front: true }, rd = { h: [0.3, 0.46], pole: [1, 0.5], hand: 'grip', front: true };
  s.p.inmate.leTears = sobbing ? clamp((t - sob) / 0.18) : 0;
  const lookBook = t < read ? { look: [bookFloor.x, bookFloor.z] } : { facing: leK([[0, 0.25], [sob, 0.1]], t) };
  pose(s, 'inmate', t, ix + shake, iz, Object.assign({ y: bob, sit: 1, seat: LE_SEAT, lean, tilt,
    expr: [[0, 'deadpan'], [LE_SLIDE + 0.3, 'skeptical'], [read, 'thinking'], [read + 0.28, 'surprised'], [sob, 'sad']], gaze: t < read ? [-0.4, 0.9] : [0, 0.7], blink: sobbing ? 0.5 : undefined,
    hand: { R: [[0, 'lap'], [read, rd]], L: [[0, 'lap'], [grab - 0.1, reach], [grab + 0.16, { h: [0.32, 0.56], pole: [1, 0.4], hand: 'grip', front: true }], [read, rd]] }, bright: 1.08 }, t < 50.3 ? { facing: -0.5 } : lookBook));
  const g0 = grab - 0.04, gk = EZ.io(clamp((t - g0) / 0.16));   // the scoop: the book travels from the floor into his (left) hand, no pop
  if (t < g0) { s.book.visible = true; s.book.position.copy(bookFloor); s.book.rotation.set(0, -0.6 + sl * 0.9, 0); }
  else if (t < read) { s.book.visible = true; gripProp(s, s.book, 'inmate', 'L', V3(0.55, 0, 0), { behind: 0.12, rx: 0.2, rz: -1.2 }); if (gk < 1) { s.book.position.lerpVectors(bookFloor, s.book.position.clone(), gk); s.book.quaternion.slerpQuaternions(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.3, 0)), s.book.quaternion.clone(), gk); } gripDot(s, 'inmate', 'L'); }
  else { // open, in BOTH hands in front of the torso: the cover faces the camera, the pages face him, the whole book in front of the card plane
    const a = c3ToonHandWorld(s.p.inmate, 'L'), b = c3ToonHandWorld(s.p.inmate, 'R'), m = a.clone().add(b).multiplyScalar(0.5), fwd = s.cam.position.clone().sub(m).normalize();
    const right = V3(1, 0, 0).applyQuaternion(s.cam.quaternion), Y = fwd.clone().negate().multiplyScalar(Math.cos(0.55)).addScaledVector(V3(0, 1, 0), Math.sin(0.55)).normalize();
    const X = right.clone().addScaledVector(Y, -right.dot(Y)).normalize(), Z = V3(0, 0, 0).crossVectors(X, Y);
    s.bookO.visible = true; s.bookO.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); s.bookO.position.copy(m).addScaledVector(fwd, 1.15).add(V3(0, 0.25, 0));
    s.bookO.scale.setScalar(1.15 * clamp(a.distanceTo(b) / 3.2, 0.85, 1.15)); gripDot(s, 'inmate', 'L'); gripDot(s, 'inmate', 'R'); }
  // the cellmate: by the ladder, watches the book arrive, smiles; on the sob turns to him (worried), digs in his pocket,
  // anticipates and holds out a tissue in front of him
  const cLook = t < 50.3 ? null : t < sob ? [bookFloor.x * 0.5 + ix * 0.5, iz] : [ix, iz];
  pose(s, 'cellmate', t, cx, cz, Object.assign({ expr: [[0, 'bored'], [50.5, 'smile'], [sob + 0.08, 'worried'], [give + 0.3, 'sad']], lean: leK([[0, 0], [give - 0.14, -0.06], [give, 0.1], [give + 0.3, 0.05]], t, 0.1),
    hand: { R: [[0, 'pocket'], [give, 'hip']], L: [[0, 'down'], [sob + 0.08, 'pocket'], [give, { h: [0.9, 0.18], pole: [0.3, 1], hand: 'grip', front: true }]] }, gaze: [-0.8, 0.4] }, cLook ? { look: cLook } : { facing: -0.6 }));
  if (t > give - 0.04) { gripProp(s, s.tissue, 'cellmate', 'L', V3(0, 0.15, 0), { behind: -0.35 }); s.tissue.scale.setScalar(Math.max(0.01, pop(t, give - 0.04, 0.2))); gripDot(s, 'cellmate', 'L'); }
  c3Render(s.scene, s.cam, { bg: '#2f6e88', bgBlur: 2.2, glow: 0.4, glowBlur: 12 });
}
for (const id of ['s21', 'g3']) { SHOT_FN[id] = (t) => lePrisonFrame(t); SNAPS[id] = 'free'; }

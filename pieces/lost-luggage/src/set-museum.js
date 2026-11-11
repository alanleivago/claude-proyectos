// =====================================================================
//  SET museum — the entrance hall + museum corner of the Unclaimed Baggage store: a two-storey atrium (x -55..55,
//  z 0..80, ceiling 45), deep teal walls over dark wood wainscot, a dark plank floor, gold accents. Back wall: the glass
//  entrance doors under the huge UNCLAIMED BAGGAGE logo sign (x -24); left wall under the mezzanine: the HISTORY WALL
//  (OUR STORY, the sepia photo of the first shop + pickup, the 1970 newspaper clipping, the brass EST. 1970 plaque);
//  back-right: the deep red MUSEUM corner with spotlit glass cases on plinths: the SUIT OF ARMOR (hinged visor), the gold
//  BURIAL MASK, a violin, a moon rock, a vintage camera, each with its FOUND IN A SUITCASE plaque; velvet ropes, benches,
//  palms. Registers s20, s21, s30, s32, s33. Prefix mu.
// =====================================================================
const MU = {};
const MU_AR = [24, 16], MU_PL = 2.4, MU_HY = MU_PL + 12.4;   // the armor case (x, z), its plinth height, the helmet centre y
const MU_MK = [40, 12];                                       // the burial mask case
CAST.muGuard = { key: 'muGuard', hair: 'bald', hairColor: 'dark', outfit: 'shirt', colors: { main: '#34466e', tie: '#1a1a22', pocket: true }, skin: 'brown', body: 'fat' };   // museum guard
CAST.muTour = { key: 'muTour', hair: 'bun', hairColor: 'chestnut', outfit: 'hoodie', colors: { main: '#8a4aa8', cord: '#ffffff' }, skin: 'pale', body: 'short' };   // tourist
CAST.muVis = { key: 'muVis', hair: 'ponytail', hairColor: 'auburn', outfit: 'dress', colors: { main: '#e85a8a', belt: '#5a2a3a' }, skin: 'tan', body: 'thin' };   // visitor

// ---- textures
// v3 DETAIL helpers (prefix mu): canvas noise + wood grain
function muSpeck(g, w, h, R, n, sz, rgb, a0, a1, x0 = 0, y0 = 0) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${rgb},${R.r(a0, a1)})`; const s = R.r(1, sz); g.fillRect(x0 + R.r(0, w), y0 + R.r(0, h), s, s * R.r(0.6, 1.4)); } }
function muGrain(g, R, x, y, w, h, n, a0 = 0.06, a1 = 0.18) { for (let k = 0; k < n; k++) { const yy = y + R.r(0, h), amp = R.r(1, 4), f = R.r(0.005, 0.02), ph = R.r(0, 9); g.strokeStyle = `rgba(30,12,4,${R.r(a0, a1)})`; g.lineWidth = R.r(0.6, 2.2); g.beginPath();
  for (let xx = 0; xx <= w; xx += 8) { const yv = yy + Math.sin(xx * f + ph) * amp; xx ? g.lineTo(x + xx, yv) : g.moveTo(x, yv); } g.stroke(); } }
// panelled wall: painted (teal) or damask (red) field with raised moulded panels, a picture rail, a wood chair rail and a raised-panel wood dado
function muTexWall(base, hi, kind = 'paint') { const R = RNG('muwall2', kind); const t = tex((g, w, h) => { const Y = (v) => (1 - v / 45) * h, wain = Y(5);
  const gr = g.createLinearGradient(0, 0, 0, wain); gr.addColorStop(0, t3Mul(base, 0.72)); gr.addColorStop(0.5, base); gr.addColorStop(1, t3Mul(base, 0.9)); g.fillStyle = gr; g.fillRect(0, 0, w, wain);
  if (kind === 'damask') { for (let y = 0; y < wain; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < w + 32; x += 64) { g.fillStyle = hi; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 16, y, x, y + 22); g.quadraticCurveTo(x - 16, y, x, y - 22); g.fill();
      g.beginPath(); g.arc(x, y - 26, 4, 0, TAU); g.arc(x, y + 26, 4, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x - 12, y, 7, 3, 0.6, 0, TAU); g.ellipse(x + 12, y, 7, 3, -0.6, 0, TAU); g.fill(); g.globalAlpha = 1; } }
  else { for (let x = 0; x < w;) { const bw = R.r(14, 46); g.fillStyle = R.f() < 0.5 ? `rgba(255,255,255,${R.r(0.015, 0.04)})` : `rgba(0,0,0,${R.r(0.02, 0.05)})`; g.fillRect(x, 0, bw, wain); x += bw; } }
  muSpeck(g, w, wain, R, 2600, 2, '0,0,0', 0.04, 0.12); muSpeck(g, w, wain, R, 800, 2, '255,255,255', 0.02, 0.06);
  // picture rail
  const pr = Y(30); g.fillStyle = '#3a200e'; g.fillRect(0, pr - 6, w, 12); g.fillStyle = 'rgba(255,220,160,0.35)'; g.fillRect(0, pr - 6, w, 3); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, pr + 6, w, 5);
  // raised moulded panel (one per tile)
  { const x0 = 44, x1 = w - 44, y0 = Y(27.5), y1 = Y(7.5); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20);
    g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,0.38)'; g.strokeRect(x0 + 3, y0 + 3, x1 - x0, y1 - y0); g.strokeStyle = t3Mul(hi, 1.25); g.globalAlpha = 0.8; g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.globalAlpha = 1;
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,240,210,0.25)'; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 10); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.strokeRect(x0 + 9, y0 + 9, x1 - x0 - 18, y1 - y0 - 18); }
  // wood dado with raised panels + chair rail + base
  g.fillStyle = '#4a2814'; g.fillRect(0, wain, w, h - wain); muGrain(g, R, 0, wain, w, h - wain, 40);
  for (let x = 0; x < w; x += w / 2) { const px = x + 16, pw = w / 2 - 32, py = wain + 18, ph = h - wain - 40; g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(px, py, pw, ph); g.fillStyle = '#5a3218'; g.fillRect(px + 5, py + 5, pw - 10, ph - 10); muGrain(g, R, px + 5, py + 5, pw - 10, ph - 10, 14);
    g.fillStyle = 'rgba(255,210,160,0.18)'; g.fillRect(px + 5, py + 5, pw - 10, 3); g.fillRect(px + 5, py + 5, 3, ph - 10); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(px + 5, py + ph - 8, pw - 10, 3); g.fillRect(px + pw - 8, py + 5, 3, ph - 10); }
  g.fillStyle = '#c8962e'; g.fillRect(0, wain - 9, w, 4); g.fillStyle = '#3a200e'; g.fillRect(0, wain - 5, w, 12); g.fillStyle = 'rgba(255,220,160,0.3)'; g.fillRect(0, wain - 5, w, 3);
  g.fillStyle = '#24140a'; g.fillRect(0, h - 12, w, 12); g.fillStyle = '#c8962e'; g.fillRect(0, h - 13, w, 2); }, 512, 1024); t.wrapS = THREE.RepeatWrapping; return t; }
// long varnished planks: per-plank tone, wavy grain, knots, end joints, gaps; worn traffic patches
function muTexFloor() { const R = RNG('muflr2'); const t = tex((g, w, h) => { const rows = 10, rh = h / rows; g.fillStyle = '#1a0c06'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) { let x = -R.r(0, 300); while (x < w) { const bw = R.r(260, 520); g.fillStyle = `hsl(${23 + R.r(-4, 5)},${48 + R.r(-8, 8)}%,${33 + R.r(-5, 6)}%)`; g.fillRect(x + 1, j * rh + 2, bw - 2, rh - 3);
      g.save(); g.beginPath(); g.rect(x + 1, j * rh + 2, bw - 2, rh - 3); g.clip(); muGrain(g, R, x, j * rh, bw, rh, 16, 0.08, 0.22);
      if (R.f() < 0.35) { const kx = x + R.r(30, bw - 30), ky = j * rh + R.r(20, rh - 20); for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(30,10,2,${0.35 - k * 0.07})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(kx, ky, 5 + k * 5, 3 + k * 2.5, 0, 0, TAU); g.stroke(); } }
      const hl = g.createLinearGradient(0, j * rh, 0, (j + 1) * rh); hl.addColorStop(0, 'rgba(255,220,180,0.10)'); hl.addColorStop(0.5, 'rgba(255,220,180,0)'); hl.addColorStop(1, 'rgba(0,0,0,0.16)'); g.fillStyle = hl; g.fillRect(x, j * rh, bw, rh); g.restore();
      g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(x, j * rh, 2, rh); x += bw; } }
  for (let k = 0; k < 12; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(80, 200)); gr.addColorStop(0, `rgba(170,120,80,${R.r(0.05, 0.12)})`); gr.addColorStop(1, 'rgba(170,120,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  muSpeck(g, w, h, R, 1800, 2, '0,0,0', 0.06, 0.18); for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(255,220,180,${R.r(0.04, 0.12)})`; g.lineWidth = 1; g.beginPath(); const x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); g.lineTo(x + R.r(-50, 50), y + R.r(-8, 8)); g.stroke(); } }, 1024, 1024);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(110 / 16, 80 / 16); return t; }
function muTexFloorR() { const R = RNG('muflr2r'); const t = c3Tex((g, w, h) => { g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, w, h); for (let j = 0; j < 10; j++) { let x = -R.r(0, 150); while (x < w) { const bw = R.r(130, 260), v = Math.round(R.r(80, 130)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x + 1, j * h / 10 + 1, bw - 2, h / 10 - 2); x += bw; } }
  for (let k = 0; k < 14; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(40, 110)); gr.addColorStop(0, 'rgba(210,210,210,0.6)'); gr.addColorStop(1, 'rgba(210,210,210,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }, 512, 512, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(110 / 16, 80 / 16); return t; }
function muTexGrain(c) { const R = RNG('mugrain', c); const t = tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); muGrain(g, R, 0, 0, w, h, 60, 0.1, 0.3); muSpeck(g, w, h, R, 500, 2, '0,0,0', 0.05, 0.15); }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.25, 0.25); return t; }
// museum carpet: deep red nap with a gold-and-black border, a small repeating motif, wear in the walk lanes
function muTexCarpet(base, border, rep) { const R = RNG('mucarp', base); const t = tex((g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); muSpeck(g, w, h, R, 9000, 2, '0,0,0', 0.08, 0.25); muSpeck(g, w, h, R, 3000, 2, '255,160,140', 0.04, 0.12);
  if (border) { g.fillStyle = 'rgba(232,184,58,0.22)'; for (let y = 40; y < h - 40; y += 48) for (let x = (y / 48) % 2 ? 64 : 40; x < w - 40; x += 48) { g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 7, y); g.lineTo(x, y + 7); g.lineTo(x - 7, y); g.fill(); }
    g.lineWidth = 16; g.strokeStyle = '#1a0a0a'; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 6; g.strokeStyle = '#c8962e'; g.strokeRect(28, 28, w - 56, h - 56); g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); }
  for (let k = 0; k < 10; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(40, 140)); gr.addColorStop(0, `rgba(40,20,20,${R.r(0.08, 0.2)})`); gr.addColorStop(1, 'rgba(40,20,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }, 1024, 1024); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; }
// an old travel poster (no lettering): sky, mountains, a lake, a little steamer
function muTexTravel(seed) { const R = RNG('mutrav', seed); return tex((g, w, h) => { const sk = g.createLinearGradient(0, 0, 0, h * 0.6); const hue = R.r(10, 210); sk.addColorStop(0, `hsl(${hue},45%,62%)`); sk.addColorStop(1, `hsl(${hue + 30},55%,82%)`); g.fillStyle = sk; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6e8c0'; g.beginPath(); g.arc(w * R.r(0.25, 0.75), h * 0.24, w * 0.1, 0, TAU); g.fill(); for (let k = 0; k < 3; k++) { g.fillStyle = `hsl(${hue + 180 + k * 10},${25 + k * 8}%,${40 - k * 8}%)`; g.beginPath(); g.moveTo(0, h * 0.62); for (let x = 0; x <= w; x += w / 6) g.lineTo(x, h * (0.36 + k * 0.08 + R.r(-0.06, 0.06))); g.lineTo(w, h * 0.62); g.fill(); }
  g.fillStyle = `hsl(${hue},40%,45%)`; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = 'rgba(255,255,255,0.3)'; for (let k = 0; k < 6; k++) g.fillRect(R.r(0, w), h * R.r(0.65, 0.95), R.r(20, 70), 3); g.fillStyle = '#2a1a14'; g.fillRect(w * 0.3, h * 0.74, w * 0.36, h * 0.05); g.fillStyle = '#c8322a'; g.fillRect(w * 0.42, h * 0.69, w * 0.06, h * 0.05);
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(80,50,20,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, w, h); muSpeck(g, w, h, R, 300, 3, '90,60,20', 0.05, 0.15); }, 256, 352); }
function muSconce(par, x, y, z, ry) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); g.add(rbNC(0.9, 1.6, 0.18, MU.M.gold, 0, 0, 0.09, 0.006)); const a = cyl(0.08, 0.08, 0.9, MU.M.gold, 0, 0.1, 0.55, 0.004, 8); a.rotation.x = Math.PI / 2; g.add(a);
  g.add(cyl(0.45, 0.65, 0.9, MU.M.shade, 0, 0.55, 1.0, 0.006, 14)); g.add(cyl(0.12, 0.12, 0.3, MU.M.bulb, 0, 0.2, 1.0, 0, 8)); g.traverse((m) => { m.userData.noCast = true; }); return g; }
function muPicLight(par, x, y, z, len, scene) { if (scene) { const sp = new THREE.SpotLight('#ffd49a', 1.1, 9, 0.85, 0.85, 1.4); sp.position.set(x + 0.9, y + 0.2, z); sp.target.position.set(x, y - 4, z); scene.add(sp, sp.target); sp.layers.enableAll(); } par.add(rbNC(0.3, 0.3, 0.3, MU.M.gold, x + 0.15, y, z, 0.004)); const arm = cyl(0.05, 0.05, 0.6, MU.M.gold, x + 0.35, y + 0.15, z, 0.003, 6); arm.rotation.z = -0.9; par.add(arm);
  const bar = cyl(0.16, 0.16, len, MU.M.gold, x + 0.62, y + 0.32, z, 0.004, 10); bar.rotation.x = Math.PI / 2; par.add(bar); const lit = rbNC(0.1, 0.06, len - 0.2, MU.M.bulb, x + 0.62, y + 0.17, z, 0); par.add(lit);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(len * 1.1, 3.6), new THREE.MeshBasicMaterial({ map: MU.T.pool, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); g.position.set(x + 0.04, y - 1.75, z); g.rotation.y = Math.PI / 2; g.userData.noCast = g.userData.noInk2 = g.userData.noShade = true; par.add(g); }
function muSuitcaseIcon(g, x, y, s, c = '#d8322a') { g.save(); g.translate(x, y); g.lineWidth = 10 * s; g.strokeStyle = '#f2c848'; g.beginPath(); g.roundRect(-34 * s, -78 * s, 68 * s, 40 * s, 14 * s); g.stroke();
  g.fillStyle = c; g.beginPath(); g.roundRect(-110 * s, -50 * s, 220 * s, 140 * s, 22 * s); g.fill(); g.lineWidth = 9 * s; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#f2c848'; g.fillRect(-60 * s, -50 * s, 16 * s, 140 * s); g.fillRect(44 * s, -50 * s, 16 * s, 140 * s); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-96 * s, -38 * s, 190 * s, 14 * s); g.restore(); }
function muTexLogo() { return tex((g, w, h) => { g.fillStyle = '#12305a'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.4, w * 0.7); gr.addColorStop(0, 'rgba(80,140,220,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.lineWidth = 22; g.strokeStyle = '#e8b83a'; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 4; g.strokeStyle = '#f6e2a0'; g.strokeRect(36, 36, w - 72, h - 72);
  muSuitcaseIcon(g, w / 2, h * 0.2, 0.95);
  inked(g, 'UNCLAIMED', w / 2, h * 0.47, h * 0.17, '#fff2d0', { stroke: '#0a1a30', sw: 12, maxW: w * 0.86, font: 'Impact, Arial Black, sans-serif' });   // v6: dark outline (the gold one dissolved under the spot)
  inked(g, 'BAGGAGE', w / 2, h * 0.66, h * 0.17, '#f2c848', { stroke: '#0a1a30', sw: 10, maxW: w * 0.78, font: 'Impact, Arial Black, sans-serif' });
  g.fillStyle = '#e8b83a'; g.fillRect(w * 0.2, h * 0.775, w * 0.6, 5);
  inked(g, 'Scottsboro, Alabama', w / 2, h * 0.86, h * 0.075, '#f6ecd0', { stroke: false, font: 'Georgia, serif', weight: 'italic 700', maxW: w * 0.7 }); }, 1024, 768); }
function muTexPhoto() { return tex((g, w, h) => { g.fillStyle = '#c9a878'; g.fillRect(0, 0, w, h); const sp = (c) => c;
  g.fillStyle = '#e2cca2'; g.fillRect(0, 0, w, h * 0.5); g.fillStyle = '#a8865a'; g.fillRect(0, h * 0.72, w, h * 0.28);   // sky, road
  g.fillStyle = '#8a6a44'; g.fillRect(w * 0.12, h * 0.3, w * 0.5, h * 0.42); g.fillStyle = '#6a4a2c'; g.beginPath(); g.moveTo(w * 0.08, h * 0.32); g.lineTo(w * 0.37, h * 0.14); g.lineTo(w * 0.66, h * 0.32); g.fill();   // the little shop
  g.fillStyle = '#efe0c0'; g.fillRect(w * 0.18, h * 0.34, w * 0.38, h * 0.08); inked(g, 'BAGGAGE', w * 0.37, h * 0.38, h * 0.055, '#4a3018', { stroke: false });
  g.fillStyle = '#3a2814'; g.fillRect(w * 0.31, h * 0.5, w * 0.1, h * 0.22); g.fillStyle = '#d8c49a'; g.fillRect(w * 0.16, h * 0.5, w * 0.11, h * 0.1); g.fillRect(w * 0.45, h * 0.5, w * 0.11, h * 0.1);
  g.fillStyle = '#5a3e22'; g.beginPath(); g.roundRect(w * 0.56, h * 0.6, w * 0.36, h * 0.12, 8); g.fill(); g.beginPath(); g.roundRect(w * 0.6, h * 0.5, w * 0.14, h * 0.12, 8); g.fill();   // the old pickup
  g.fillStyle = '#d8c49a'; g.fillRect(w * 0.62, h * 0.52, w * 0.1, h * 0.06); g.fillStyle = '#7a5a3a'; for (const [x, y, ww, hh] of [[0.76, 0.54, 0.06, 0.06], [0.83, 0.55, 0.07, 0.05]]) g.fillRect(w * x, h * y, w * ww, h * hh);
  g.fillStyle = '#2a1a0c'; for (const x of [0.64, 0.86]) { g.beginPath(); g.arc(w * x, h * 0.73, h * 0.05, 0, TAU); g.fill(); }
  g.fillStyle = '#4a3420'; g.beginPath(); g.arc(w * 0.86, h * 0.2, h * 0.11, 0, TAU); g.fill(); g.fillRect(w * 0.85, h * 0.2, w * 0.02, h * 0.3);   // a tree
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,30,10,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  g.lineWidth = 26; g.strokeStyle = '#f2e8d2'; g.strokeRect(0, 0, w, h); }, 640, 480); }
function muTexClip() { return tex((g, w, h) => { g.fillStyle = '#ece0c2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(150,110,50,0.15)'; g.fillRect(0, 0, w, h);
  inked(g, 'THE JACKSON COUNTY SENTINEL', w / 2, h * 0.06, h * 0.035, '#2a2016', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.9 });
  g.fillStyle = '#2a2016'; g.fillRect(w * 0.05, h * 0.09, w * 0.9, 4); inked(g, 'Scottsboro, Ala. · 1970', w / 2, h * 0.115, h * 0.025, '#4a3a2a', { stroke: false }); g.fillRect(w * 0.05, h * 0.135, w * 0.9, 2);
  inked(g, 'LOCAL MAN', w / 2, h * 0.2, h * 0.075, '#1a120c', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.88 });
  inked(g, 'SELLS LOST', w / 2, h * 0.285, h * 0.075, '#1a120c', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.88 });
  inked(g, 'LUGGAGE', w / 2, h * 0.37, h * 0.075, '#1a120c', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.88 });
  g.fillStyle = '#8a7a64'; g.fillRect(w * 0.08, h * 0.43, w * 0.48, h * 0.26); g.fillStyle = '#5a4a3a'; g.fillRect(w * 0.14, h * 0.5, w * 0.18, h * 0.15); g.beginPath(); g.arc(w * 0.42, h * 0.52, h * 0.04, 0, TAU); g.fill(); g.fillRect(w * 0.38, h * 0.56, w * 0.08, h * 0.12);
  g.fillStyle = 'rgba(40,30,20,0.55)'; for (let k = 0; k < 11; k++) g.fillRect(w * 0.6, h * (0.44 + k * 0.024), w * 0.32, 4); for (let k = 0; k < 10; k++) g.fillRect(w * 0.08, h * (0.73 + k * 0.024), w * (k % 3 ? 0.84 : 0.6), 4);
  g.lineWidth = 6; g.strokeStyle = 'rgba(90,60,30,0.4)'; g.strokeRect(3, 3, w - 6, h - 6); }, 480, 640); }
function muTexBrass(l1, l2, big) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2d27a'); gr.addColorStop(0.5, '#c8962e'); gr.addColorStop(1, '#e8c060'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.lineWidth = 10; g.strokeStyle = '#7a5214'; g.strokeRect(14, 14, w - 28, h - 28); for (const [x, y] of [[30, 30], [w - 30, 30], [30, h - 30], [w - 30, h - 30]]) { g.fillStyle = '#7a5214'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); }
  if (l2) { inked(g, l1, w / 2, h * 0.37, h * (big ? 0.3 : 0.24), '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.82 }); inked(g, l2, w / 2, h * 0.7, h * 0.2, '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.84 }); }
  else inked(g, l1, w / 2, h * 0.53, h * 0.48, '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.82 }); }, 768, 256); }
function muTexTitle() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, 'OUR', w / 2, h * 0.22, h * 0.26, '#f2c848', { stroke: '#2a1208', sw: 10, font: 'Georgia, serif', maxW: w * 0.9 });
  inked(g, 'STORY', w / 2, h * 0.5, h * 0.26, '#f2c848', { stroke: '#2a1208', sw: 10, font: 'Georgia, serif', maxW: w * 0.92 }); g.fillStyle = '#c8962e'; g.fillRect(w * 0.2, h * 0.68, w * 0.6, 5);
  inked(g, 'Since 1970', w / 2, h * 0.83, h * 0.13, '#f6ecd0', { stroke: false, font: 'Georgia, serif', weight: 'italic 700', maxW: w * 0.8 }); }, 512, 384); }
function muTexMuseum() { return tex((g, w, h) => { g.fillStyle = '#1a0c10'; g.fillRect(0, 0, w, h); g.lineWidth = 14; g.strokeStyle = '#e8b83a'; g.strokeRect(10, 10, w - 20, h - 20);
  inked(g, 'THE MUSEUM', w / 2, h * 0.4, h * 0.4, '#f2c848', { stroke: false, font: 'Georgia, serif', maxW: w * 0.84 });
  inked(g, 'Treasures found in lost luggage', w / 2, h * 0.78, h * 0.15, '#f6ecd0', { stroke: false, font: 'Georgia, serif', weight: 'italic 700', maxW: w * 0.8 }); }, 1024, 320); }
function muTexOutside() { const R = RNG('muout'); return tex((g, w, h) => { const hz = h * 0.5, gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#4a86d4'); gr.addColorStop(1, '#cfe4f8'); g.fillStyle = gr; g.fillRect(0, 0, w, hz);
  for (let k = 0; k < 10; k++) { const x = R.r(0, w), y = R.r(10, hz * 0.7), r = R.r(14, 34); const c = g.createRadialGradient(x, y, 1, x, y, r); c.addColorStop(0, 'rgba(255,255,255,0.7)'); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.fillRect(0, 0, w, h); }
  for (const [y0, col, n, rr] of [[hz - 6, '#7a9a8a', 26, 16], [hz + 4, '#4a7a4a', 22, 22], [hz + 12, '#2f5a32', 18, 26]]) { g.fillStyle = col; for (let i = 0; i < n; i++) { const x = (i + R.r(-0.3, 0.3)) * w / (n - 1); g.beginPath(); g.arc(x, y0 - R.r(0, rr * 0.6), rr * R.r(0.7, 1.1), 0, TAU); g.fill(); } g.fillRect(0, y0, w, 14); }
  g.fillStyle = '#5a5c60'; g.fillRect(0, hz + 22, w, h); const ag = g.createLinearGradient(0, hz + 22, 0, h); ag.addColorStop(0, 'rgba(160,170,185,0.4)'); ag.addColorStop(1, 'rgba(0,0,0,0.2)'); g.fillStyle = ag; g.fillRect(0, hz + 22, w, h);
  g.fillStyle = 'rgba(240,240,230,0.8)'; for (let i = 0; i < 9; i++) { g.save(); g.translate(i * w / 8, hz + 30); g.transform(1, 0, (i - 4) * 0.6, 1, 0, 0); g.fillRect(-2, 0, 4, h * 0.25); g.restore(); }
  for (const [x, c] of [[0.2, '#c8322a'], [0.62, '#e8e4dc'], [0.86, '#2a4a7a']]) { const cx = w * x, cy = hz + 52; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(cx, cy + 18, 46, 7, 0, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.roundRect(cx - 44, cy - 6, 88, 22, 7); g.fill(); g.beginPath(); g.roundRect(cx - 26, cy - 22, 52, 20, 8); g.fill(); g.fillStyle = '#8ab0d0'; g.fillRect(cx - 21, cy - 18, 42, 12); g.fillStyle = '#1a1a1e'; for (const d of [-26, 26]) { g.beginPath(); g.arc(cx + d, cy + 16, 8, 0, TAU); g.fill(); } }
  muSpeck(g, w, h * 0.5, R, 900, 2, '0,0,0', 0.05, 0.12, 0, hz + 22); }, 512, 360); }
function muTexShelves() { const t = tex((g, w, h) => { g.fillStyle = '#3a2418'; g.fillRect(0, 0, w, h); const R = RNG('mushelf'), C = ['#2f6fb8', '#d8402e', '#f2c23a', '#3f8a5a', '#8a4aa8', '#e8e0cc', '#2a2a3a', '#e8803a'];
  for (let j = 0; j < 3; j++) { const y0 = h * (0.08 + j * 0.31); let x = 6; while (x < w - 30) { const bw = R.r(40, 80), bh = R.r(50, 80); g.fillStyle = C[Math.floor(R.f() * C.length)]; g.beginPath(); g.roundRect(x, y0 + 86 - bh, bw, bh, 8); g.fill(); g.strokeStyle = '#1a0c08'; g.lineWidth = 3; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 6, y0 + 92 - bh, bw - 12, 4); x += bw + R.r(4, 12); }
    g.fillStyle = '#c8962e'; g.fillRect(0, y0 + 86, w, 10); } }, 512, 320); t.wrapS = THREE.RepeatWrapping; return t; }
function muTexBanner(l1, l2, c) { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#e8b83a'; g.fillRect(0, 0, w, 18); g.fillRect(0, h - 18, w, 18);
  inked(g, l1, w / 2, h * 0.38, h * 0.13, '#ffffff', { stroke: '#2a1208', sw: 8, maxW: w * 0.84 }); inked(g, l2, w / 2, h * 0.62, h * 0.08, '#f6ecd0', { stroke: false, maxW: w * 0.84 }); }, 384, 768); }
function muTexGlass() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(200,240,255,0.10)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.38)';
  g.beginPath(); g.moveTo(w * 0.1, 0); g.lineTo(w * 0.28, 0); g.lineTo(w * 0.02, h * 0.5); g.lineTo(0, h * 0.5); g.lineTo(0, h * 0.2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(w * 0.36, 0); g.lineTo(w * 0.42, 0); g.lineTo(w * 0.04, h * 0.76); g.lineTo(0, h * 0.76); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(w, h * 0.5); g.lineTo(w, h * 0.62); g.lineTo(w * 0.74, h); g.lineTo(w * 0.66, h); g.fill(); }, 256, 512); }
function muTexMask() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const G = '#f0bf3a', B = '#1f3f9a', cx = w / 2;
  const nem = () => { g.beginPath(); g.moveTo(cx, h * 0.03); g.bezierCurveTo(w * 0.82, h * 0.03, w * 0.86, h * 0.2, w * 0.86, h * 0.3); g.lineTo(w * 0.97, h * 0.7); g.lineTo(w * 0.72, h * 0.72); g.lineTo(w * 0.28, h * 0.72); g.lineTo(w * 0.03, h * 0.7); g.lineTo(w * 0.14, h * 0.3); g.bezierCurveTo(w * 0.14, h * 0.2, w * 0.18, h * 0.03, cx, h * 0.03); g.closePath(); };
  nem(); g.fillStyle = G; g.fill(); g.save(); nem(); g.clip(); g.fillStyle = B; for (let k = 0; k < 16; k++) { g.beginPath(); g.ellipse(cx, h * (0.0 + k * 0.05), w * 0.7, h * 0.06, 0, 0, Math.PI); g.lineTo(cx - w * 0.7, h * (0.022 + k * 0.05)); g.ellipse(cx, h * (0.022 + k * 0.05), w * 0.7, h * 0.06, 0, Math.PI, 0, true); g.fill(); } g.restore();
  nem(); g.lineWidth = 8; g.strokeStyle = '#3a2208'; g.stroke();
  // collar
  for (const [r, c] of [[0.5, '#c8322a'], [0.45, G], [0.4, '#2aa8b8'], [0.35, G], [0.3, B], [0.25, G]]) { g.beginPath(); g.ellipse(cx, h * 0.7, w * r, h * r * 0.62, 0, 0, Math.PI); g.fillStyle = c; g.fill(); }
  g.beginPath(); g.ellipse(cx, h * 0.7, w * 0.5, h * 0.31, 0, 0, Math.PI); g.lineWidth = 7; g.strokeStyle = '#3a2208'; g.stroke();
  // the face
  g.beginPath(); g.ellipse(cx, h * 0.4, w * 0.25, h * 0.25, 0, 0, TAU); g.fillStyle = '#f6c84a'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#3a2208'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(cx - w * 0.1, h * 0.3, w * 0.06, h * 0.08, -0.3, 0, TAU); g.fill();
  g.fillStyle = B; g.fillRect(cx - w * 0.22, h * 0.135, w * 0.44, h * 0.035);   // headband
  g.fillStyle = '#c8322a'; g.beginPath(); g.moveTo(cx, h * 0.07); g.lineTo(cx + w * 0.035, h * 0.15); g.lineTo(cx - w * 0.035, h * 0.15); g.fill(); g.lineWidth = 4; g.stroke();   // uraeus
  for (const sx of [-1, 1]) { const ex = cx + sx * w * 0.1, ey = h * 0.33;
    g.fillStyle = B; g.beginPath(); g.moveTo(ex - w * 0.08, ey - h * 0.05); g.quadraticCurveTo(ex, ey - h * 0.085, ex + w * 0.08, ey - h * 0.05); g.lineTo(ex + w * 0.08, ey - h * 0.035); g.quadraticCurveTo(ex, ey - h * 0.07, ex - w * 0.08, ey - h * 0.035); g.fill();   // brow
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(ex - w * 0.07, ey); g.quadraticCurveTo(ex, ey - h * 0.035, ex + w * 0.07, ey); g.quadraticCurveTo(ex, ey + h * 0.03, ex - w * 0.07, ey); g.fill();
    g.lineWidth = 7; g.strokeStyle = '#141428'; g.stroke(); g.beginPath(); g.moveTo(ex + sx * w * 0.07, ey); g.lineTo(ex + sx * w * 0.13, ey + h * 0.012); g.stroke();
    g.fillStyle = '#141428'; g.beginPath(); g.arc(ex, ey, h * 0.018, 0, TAU); g.fill(); }
  g.strokeStyle = '#a8761c'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, h * 0.36); g.lineTo(cx - w * 0.02, h * 0.45); g.lineTo(cx + w * 0.025, h * 0.46); g.stroke();
  g.fillStyle = '#c8822a'; g.beginPath(); g.ellipse(cx, h * 0.52, w * 0.07, h * 0.018, 0, 0, TAU); g.fill(); g.strokeStyle = '#6a3a10'; g.lineWidth = 4; g.stroke();
  // the braided beard
  g.fillStyle = B; g.beginPath(); g.roundRect(cx - w * 0.035, h * 0.63, w * 0.07, h * 0.16, 10); g.fill(); g.fillStyle = G; for (let k = 0; k < 4; k++) g.fillRect(cx - w * 0.035, h * (0.655 + k * 0.035), w * 0.07, h * 0.012); g.lineWidth = 5; g.strokeStyle = '#3a2208'; g.beginPath(); g.roundRect(cx - w * 0.035, h * 0.63, w * 0.07, h * 0.16, 10); g.stroke(); }, 512, 704); }
function muTexVisor() { return tex((g, w, h) => { g.fillStyle = '#6c747e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, h * 0.15, w, h * 0.08);
  g.fillStyle = '#16141a'; for (const y of [0.42, 0.56]) { g.beginPath(); g.roundRect(w * 0.3, h * y, w * 0.4, h * 0.07, 6); g.fill(); }
  g.fillStyle = '#16141a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (0.43 + (i % 3) * 0.07), h * (0.76 + Math.floor(i / 3) * 0.08), 5, 0, TAU); g.fill(); }
  g.fillStyle = '#4a5058'; g.fillRect(w * 0.495, 0, w * 0.01, h); g.fillStyle = '#b08a3a'; for (const x of [0.08, 0.92]) for (const y of [0.2, 0.5, 0.8]) { g.beginPath(); g.arc(w * x, h * y, 5, 0, TAU); g.fill(); } }, 256, 256); }
function muTexClock() { return tex((g, w, h) => { g.fillStyle = '#f6ecd0'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 8, 0, TAU); g.fill(); g.lineWidth = 16; g.strokeStyle = '#c8962e'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = '#2a1a14'; g.fillRect(w / 2 + Math.cos(a) * w * 0.36 - 5, h / 2 + Math.sin(a) * h * 0.36 - 5, 10, 10); }
  g.lineCap = 'round'; g.strokeStyle = '#2a1a14'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + w * 0.18, h / 2 + h * 0.1); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 - w * 0.02, h / 2 - h * 0.32); g.stroke(); }, 256, 256); }

// v4 (realism pass): a blue sky with soft clouds for the clerestory windows and the doors
function muTexSky(seed) { const R = RNG('musky', seed); return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a78cc'); gr.addColorStop(0.55, '#7fb4ea'); gr.addColorStop(1, '#d6eaff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 7; k++) { const cx = R.r(0, w), cy = R.r(h * 0.15, h * 0.85), s = R.r(18, 40); for (let j = 0; j < 6; j++) { const x = cx + R.r(-s, s) * 1.4, y = cy + R.r(-s, s) * 0.35, r = s * R.r(0.5, 1); const c = g.createRadialGradient(x, y, 1, x, y, r); c.addColorStop(0, 'rgba(255,255,255,0.75)'); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.fillRect(0, 0, w, h); } } }, 256, 256); }
// a soft window-shaped light patch (with the muntin bars' shadows) for the floor under the clerestory shafts
function muTexPatch() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.filter = 'blur(10px)'; g.fillStyle = 'rgba(255,255,255,1)'; g.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.8); g.fillStyle = 'rgba(0,0,0,1)'; g.globalCompositeOperation = 'destination-out';
  for (const x of [1 / 3, 2 / 3]) g.fillRect(w * (0.12 + 0.76 * x) - 5, 0, 10, h); g.fillRect(0, h * 0.5 - 6, w, 12); g.globalCompositeOperation = 'source-over'; g.filter = 'none'; }, 256, 256); }
// a glass glint: one soft diagonal streak (additive)
function muTexGlint() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.filter = 'blur(6px)'; g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.78, 0); g.lineTo(w * 0.3, h); g.lineTo(w * 0.07, h); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(w * 0.86, 0); g.lineTo(w * 0.92, 0); g.lineTo(w * 0.44, h); g.lineTo(w * 0.38, h); g.fill(); g.filter = 'none'; }, 256, 256); }
// a matted frame board: cream mat with the bevelled window cut around the picture
function muTexMat(iw, ih, W2, H2) { return tex((g, w, h) => { g.fillStyle = '#ece3cf'; g.fillRect(0, 0, w, h); const x0 = (W2 - iw) / 2 / W2 * w, y0 = (H2 - ih) / 2 / H2 * h, x1 = w - x0, y1 = h - y0;
  g.fillStyle = '#fbf6ea'; g.fillRect(x0 - 7, y0 - 7, x1 - x0 + 14, 7); g.fillRect(x0 - 7, y0, 7, y1 - y0); g.fillStyle = '#c9bea4'; g.fillRect(x0 - 7, y1, x1 - x0 + 14, 7); g.fillRect(x1, y0 - 7, 7, y1 - y0 + 14);
  const R = RNG('mumat', w + h); muSpeck(g, w, h, R, 600, 2, '120,100,70', 0.04, 0.1); }, 512, Math.round(512 * H2 / W2)); }
// a real picture frame on a wall (group faces +z before ry): backing, moulded frame bars with depth, a bevel-cut mat, the
// picture (a Flow image or a drawn canvas), glass that reflects the room + a glint. iw/ih = picture size.
function muFrame(par, pic, x, y, z, ry, iw, ih, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g);
  const m = o.mat ?? 0.5, f = o.bar ?? 0.5, fd = o.depth ?? 0.5, W2 = iw + 2 * m, H2 = ih + 2 * m, FM = o.fm || MU.M.frame;
  g.add(rbNC(W2 + 2 * f, H2 + 2 * f, 0.14, MU.M.black, 0, 0, 0.07, 0));
  for (const sy of [-1, 1]) g.add(rbNC(W2 + 2 * f, f, fd, FM, 0, sy * (H2 / 2 + f / 2), fd / 2, 0));
  for (const sx of [-1, 1]) g.add(rbNC(f, H2 + 0.02, fd, FM, sx * (W2 / 2 + f / 2), 0, fd / 2, 0));
  for (const sy of [-1, 1]) g.add(rbNC(W2 + 0.1, 0.09, 0.09, MU.M.gold, 0, sy * (H2 / 2 - 0.02), 0.2, 0));   // the gilt inner lip
  for (const sx of [-1, 1]) g.add(rbNC(0.09, H2, 0.09, MU.M.gold, sx * (W2 / 2 - 0.02), 0, 0.2, 0));
  const keep = (mt) => { mt.userData.c3sl = true; return mt; }, nc = (o) => { o.userData.c3catch = true; return o; };
  if (m > 0.05) g.add(nc(plNC(W2, H2, keep(c3Prop('#ffffff', { map: muTexMat(iw, ih, W2, H2), rough: 0.9 })), 0, 0, 0.15)));
  const pt = typeof pic === 'string' ? tex((c, w, h) => { c.drawImage(ASSETS[pic], 0, 0, w, h); }, ASSETS[pic].naturalWidth || 640, ASSETS[pic].naturalHeight || 480) : pic;
  g.add(nc(plNC(iw, ih, keep(c3Prop('#ffffff', { map: pt, rough: 0.75 })), 0, 0, 0.16)));
  const gl = pl(W2, H2, MU.M.glassF, 0, 0, fd - 0.08); gl.renderOrder = 7; g.add(gl);
  const gt = pl(W2, H2, MU.M.glint, 0, 0, fd - 0.07); gt.renderOrder = 7; g.add(gt);
  for (const q of [gl, gt]) q.userData.noCast = q.userData.noInk2 = q.userData.noShade = true;
  return g;
}
// a clerestory window opening in the deep upper wall band (the glass sits at the back of a 1.3-deep reveal)
function muWindow(par, x, y, w, h, D) { const g = new THREE.Group(); g.position.set(x, y, 0); par.add(g);
  g.add(pl(w, h, MU.M.sky, 0, 0, 0.04));
  const bar = (bw, bh, X, Y) => g.add(rbNC(bw, bh, 0.22, MU.M.muntin, X, Y, 0.2, 0));
  for (const k of [-1, 1]) bar(0.2, h, k * w / 6, 0); bar(w, 0.2, 0, h * 0.08); for (const k of [-1, 1]) bar(0.34, h, k * (w / 2 - 0.17), 0); bar(w, 0.34, 0, h / 2 - 0.17); bar(w, 0.34, 0, -h / 2 + 0.17);
  for (const sx of [-1, 1]) g.add(rbNC(0.55, h + 1.0, 0.3, MU.M.trim, sx * (w / 2 + 0.27), 0.25, D + 0.15, 0));   // the architrave proud of the band
  g.add(rbNC(w + 1.6, 0.55, 0.32, MU.M.trim, 0, h / 2 + 0.27, D + 0.16, 0)); g.add(rbNC(0.9, 1.0, 0.45, MU.M.trim, 0, h / 2 + 0.35, D + 0.25, 0));   // head + keystone
  return g; }

// ---- builders
function muPalm(par, x, z, k = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(k); par.add(g);
  g.add(cyl(1.5, 1.1, 2.6, MU.M.pot, 0, 1.3, 0, 0.03, 16)); g.add(cyl(1.55, 1.55, 0.3, MU.M.gold, 0, 2.55, 0, 0.01, 16)); g.add(cyl(0.22, 0.32, 5.5, MU.M.trunk, 0, 5.2, 0, 0.02, 8));
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + 0.3, lf = c3Mesh(new THREE.SphereGeometry(1, 10, 6), i % 2 ? MU.M.leaf : MU.M.leaf2, 0.015); lf.scale.set(0.5, 0.12, 2.6); lf.position.set(Math.sin(a) * 1.9, 8.0 - (i % 3) * 0.3, Math.cos(a) * 1.9); lf.rotation.set(0.45, a, 0); lf.rotation.order = 'YXZ'; g.add(lf); }
  return g; }
function muBench(par, x, z, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; par.add(g); g.add(rb(7, 0.6, 2.2, MU.M.wood, 0, 2.2, 0)); g.add(rb(6.6, 0.4, 1.9, MU.M.velvet, 0, 2.7, 0, 0.02));
  for (const sx of [-1, 1]) g.add(rb(0.5, 2.0, 1.8, MU.M.wood, sx * 3, 1.0, 0, 0.02)); return g; }
function muPost(par, x, z) { par.add(cyl(0.5, 0.6, 0.25, MU.M.gold, x, 0.12, z, 0.01, 12)); par.add(cyl(0.13, 0.13, 3.4, MU.M.gold, x, 1.8, z, 0.01, 8)); const k = c3Mesh(new THREE.SphereGeometry(0.26, 10, 8), MU.M.gold, 0.01); k.position.set(x, 3.6, z); par.add(k); }
function muRope(par, a, b) { const c = new THREE.CatmullRomCurve3([V3(a[0], 3.25, a[1]), V3((a[0] + b[0]) / 2, 2.2, (a[1] + b[1]) / 2), V3(b[0], 3.25, b[1])]); par.add(c3Mesh(new THREE.TubeGeometry(c, 16, 0.16, 8), MU.M.velvet, 0.015)); }
// a museum display: a plinth (with its brass plaque on the front) and a glass box with brass edges; returns the top y
function muCase(par, F, x, z, w, ph, gh, title) {
  par.add(rb(w + 0.4, 0.3, w + 0.4, MU.M.gold, x, 0.15, z, 0.01)); par.add(rb(w, ph, w, MU.M.plinth, x, ph / 2, z, 0.03)); par.add(rb(w + 0.2, 0.25, w + 0.2, MU.M.gold, x, ph - 0.1, z, 0.01));
  const pq = pl(Math.min(w * 0.82, 4.6), Math.min(w * 0.82, 4.6) * 0.34, c3Prop('#ffffff', { map: muTexBrass(title, 'FOUND IN A SUITCASE'), metal: 0.3, rough: 0.35 }), x, Math.min(ph * 0.55, ph - 0.95), z + w / 2 + 0.03); F.add(pq);
  const y0 = ph, glass = new THREE.MeshBasicMaterial({ map: MU.T.glass, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  for (const [px, pz, ry] of [[0, w / 2, 0], [w / 2, 0, Math.PI / 2], [-w / 2, 0, -Math.PI / 2], [0, -w / 2, Math.PI]]) { const p = pl(w, gh, glass, x + px, y0 + gh / 2, z + pz, ry); p.renderOrder = 6; p.userData.noInk2 = true; F.add(p);
    const q = pl(w, gh, MU.M.glassR, x + px * 1.004, y0 + gh / 2, z + pz * 1.004, ry); q.renderOrder = 7; q.userData.noInk2 = q.userData.noCast = q.userData.noShade = true; F.add(q); }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.add(rbNC(0.16, gh, 0.16, MU.M.gold, x + sx * w / 2, y0 + gh / 2, z + sz * w / 2, 0.008));
  F.add(rbNC(w + 0.3, 0.35, w + 0.3, MU.M.plinth, x, y0 + gh + 0.17, z, 0.015)); F.add(rbNC(w + 0.1, 0.12, w + 0.1, MU.M.gold, x, y0 + 0.06, z, 0.006));
  return y0;
}
// a cone of warm light from a ceiling spot (additive, BG layer) + the real spot light
function muSpot(scene, x, z, ty, tx = x, tz = z, I = 1.4) {
  const sp = new THREE.SpotLight('#ffd9a0', I, 0, 0.32, 0.6, 0); sp.position.set(x, 44, z); sp.target.position.set(tx, ty, tz); scene.add(sp); scene.add(sp.target); sp.layers.enableAll();
  const h = 44 - ty, cone = new THREE.Mesh(new THREE.CylinderGeometry(0.6, h * 0.24, h, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  cone.position.set((x + tx) / 2, (44 + ty) / 2, (z + tz) / 2); cone.lookAt(tx, ty, tz); cone.rotateX(Math.PI / 2); cone.userData.noInk2 = cone.userData.noCast = cone.userData.noShade = true; scene.add(cone);
  scene.add(cyl(0.7, 0.5, 1.2, MU.M.black, x, 44.2, z, 0.01, 10));
}
// the suit of armor on its stand (local origin = the plinth top, faces +z); returns { g, visor, helmet }
function muArmor() {
  const g = new THREE.Group(), st = MU.M.steel, st2 = MU.M.steel2, R = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = c3Mesh(geo, m, 0.02); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
  // v4: a real medieval harness (not a robot): dark blued steel with specular, articulated plates, brass rivets, a sword
  const sD = (m) => { const q = m.clone(); q.side = THREE.DoubleSide; return q; }, stD = sD(st), st2D = sD(st2);
  const riv = (x, y, z) => { const r = c3Mesh(new THREE.SphereGeometry(0.045, 8, 6), MU.M.rivet, 0); r.position.set(x, y, z); g.add(r); };
  const ring = (r0, r1, h, m, x, y, z, th0 = 0, thL = TAU) => { const o = c3Mesh(new THREE.CylinderGeometry(r0, r1, h, 22, 1, true, th0, thL), m, 0.012); o.position.set(x, y, z); g.add(o); return o; };
  g.add(cyl(2.2, 2.3, 0.35, MU.M.plinth, 0, 0.17, 0, 0.015, 24));   // the stand
  for (const sx of [-1, 1]) { const lx = sx * 0.72;
    // sabatons: an ankle cuff + four overlapping lames stepping down to a pointed toe cap
    g.add(cyl(0.5, 0.54, 0.55, st2, lx, 0.62, 0, 0.012, 16));
    for (let i = 0; i < 4; i++) g.add(rb(0.84 - i * 0.06, 0.34 - i * 0.03, 0.42, i % 2 ? st2 : st, lx, 0.53 - i * 0.025, 0.32 + i * 0.3, 0.01));
    R(new THREE.SphereGeometry(1, 14, 10), st, lx, 0.5, 1.28, 0.34, 0.16, 0.4);
    // greave (tapered, with a front ridge) + its ankle flare
    g.add(cyl(0.52, 0.42, 3.1, st, lx, 2.5, 0, 0.015, 18)); g.add(cyl(0.47, 0.53, 0.22, st2, lx, 1.05, 0, 0.01, 18));
    g.add(rb(0.07, 2.8, 0.08, st2, lx, 2.55, 0.5, 0)); for (const y of [1.3, 3.8]) for (const a of [-0.9, 0.9]) riv(lx + Math.sin(a) * 0.5, y, Math.cos(a) * 0.5);
    // poleyn: knee cop with its side fan and the lames above and below
    R(new THREE.SphereGeometry(0.58, 14, 10), st2, lx, 4.42, 0.1, 1, 0.92, 0.88);
    { const fan = R(new THREE.CylinderGeometry(0.46, 0.46, 0.07, 16), st, lx + sx * 0.6, 4.42, 0.04, 1, 1, 1.15); fan.rotation.z = Math.PI / 2; } riv(lx + sx * 0.64, 4.42, 0.04);
    ring(0.55, 0.58, 0.2, st2D, lx, 3.98, 0); ring(0.58, 0.56, 0.2, st2D, lx, 4.88, 0);
    // cuisse (thigh)
    g.add(cyl(0.6, 0.52, 2.0, st, lx, 6.0, 0, 0.015, 18));
    // tassets: four overlapping lames hanging over the front of the thigh, from the fauld
    for (let i = 0; i < 4; i++) { const o = ring(0.8 + i * 0.03, 0.86 + i * 0.03, 0.42, i % 2 ? st2D : stD, lx, 6.92 - i * 0.33, 0, sx * 0.35 - 1.15, 2.3); for (const a of [-0.8, 0, 0.8]) riv(lx + Math.sin(sx * 0.35 + a) * (0.85 + i * 0.03), 6.98 - i * 0.33, Math.cos(sx * 0.35 + a) * (0.85 + i * 0.03)); } }
  // fauld (waist lames) with rivet rows
  for (let i = 0; i < 3; i++) { ring(1.42 + i * 0.08, 1.5 + i * 0.08, 0.42, i % 2 ? st2D : stD, 0, 8.05 - i * 0.35, 0); for (let k = 0; k < 7; k++) { const a = -1.3 + k * 0.43, r = 1.47 + i * 0.08; riv(Math.sin(a) * r, 8.2 - i * 0.35, Math.cos(a) * r); } }
  R(new THREE.SphereGeometry(1, 24, 18), st, 0, 9.3, 0, 1.45, 1.72, 1.08);   // the breastplate (globose)
  { const rd = cyl(0.06, 0.06, 2.6, st2, 0, 9.55, 1.12, 0.008, 6); rd.rotation.x = -0.1; g.add(rd); }   // the medial ridge
  ring(1.36, 1.3, 0.22, st2D, 0, 10.75, 0, -1.2, 2.4);   // the turned neck edge
  for (let k = 0; k < 6; k++) { const a = -1.1 + k * 0.44; riv(Math.sin(a) * 1.35, 10.62, Math.cos(a) * 1.0); }
  for (const sx of [-1, 1]) {
    // pauldron: a domed cop + three lames over the upper arm
    { const d = c3Mesh(new THREE.SphereGeometry(0.9, 18, 10, 0, TAU, 0, Math.PI / 2), stD, 0.015); d.scale.set(1.0, 0.62, 0.95); d.position.set(sx * 1.74, 10.25, 0); d.rotation.z = -sx * 0.25; g.add(d); }
    for (let i = 0; i < 3; i++) ring(0.86 - i * 0.04, 0.9 - i * 0.04, 0.34, i % 2 ? st2D : stD, sx * 1.9, 9.98 - i * 0.3, 0);
    riv(sx * 1.74, 10.86, 0.35); riv(sx * 2.45, 10.2, 0.3);
    g.add(cyl(0.38, 0.36, 1.5, st, sx * 1.95, 9.0, 0, 0.02, 14));   // rerebrace
    R(new THREE.SphereGeometry(0.46, 12, 8), st2, sx * 1.98, 8.22, 0.05);   // couter
    { const fan = R(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 14), st, sx * 2.0, 8.22, -0.42, 1, 1, 1.1); fan.rotation.x = Math.PI / 2; riv(sx * 2.0, 8.22, -0.47); }   // its fan behind the elbow
    g.add(cyl(0.36, 0.42, 1.4, st, sx * 2.0, 7.4, 0.05, 0.02, 14));   // vambrace
    g.add(cyl(0.54, 0.4, 0.45, st2, sx * 2.0, 6.55, 0.05, 0.015, 14));   // the flared gauntlet cuff
    g.add(rb(0.62, 0.7, 0.55, st, sx * 2.0, 5.98, 0.1, 0.015));   // back of the hand
    for (let i = 0; i < 3; i++) g.add(rb(0.58, 0.17, 0.5, i % 2 ? st : st2, sx * 2.0, 5.66 - i * 0.15, 0.2 + i * 0.04, 0.008));   // finger lames
    g.add(rb(0.22, 0.5, 0.26, st2, sx * 1.72, 5.95, 0.36, 0.01)); }
  // the sword in the right gauntlet, point down on the stand: pommel, leather grip through the fist, crossguard, fullered blade
  { const sw = MU.M.blade, x = 0, z = 0, g0 = g, SG2 = new THREE.Group(); SG2.position.set(2.0, 0, 0.12); SG2.rotation.y = 0.8; g0.add(SG2); { const g = SG2, R = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = c3Mesh(geo, m, 0.02); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; }; g.add(cyl(0.09, 0.09, 1.45, MU.M.leather, x, 5.95, z, 0.006, 8));
    R(new THREE.SphereGeometry(0.17, 12, 8), MU.M.gold, x, 6.8, z, 1, 1, 0.7);
    g.add(rb(0.14, 0.14, 1.5, MU.M.gold, x, 5.15, z, 0.006)); for (const sz of [-1, 1]) R(new THREE.SphereGeometry(0.1, 8, 6), MU.M.gold, x, 5.15, z + sz * 0.76);
    g.add(rb(0.07, 4.2, 0.3, sw, x, 2.95, z, 0.004)); g.add(rbNC(0.08, 3.9, 0.06, MU.M.dark, x, 3.0, z, 0));
    { const tip = c3Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), sw, 0.004); tip.rotation.x = Math.PI; tip.scale.set(0.35, 1, 1); tip.position.set(x, 0.6, z); g.add(tip); } } }
  // gorget: three stacked lames
  for (let i = 0; i < 3; i++) g.add(cyl(0.95 - i * 0.08, 1.1 - i * 0.1, 0.3, i % 2 ? st : st2, 0, 11.05 + i * 0.26, 0, 0.012, 20));
  const hm = new THREE.Group(); hm.position.set(0, 12.4, 0); g.add(hm);
  // v2: a MEDIEVAL great helm (no astronaut dome): a straight bucket skull with a low ridged crown, a fixed chin guard
  // (bevor) and a pointed 'pig-face' visor with an eye slit and breathing holes, hinged on the side rivets (rotation.x opens it)
  const half = (r0, r1, h, th0, m, y, side) => { const mm = side ? (() => { const q = m.clone(); q.side = side; return q; })() : m; const o = c3Mesh(new THREE.CylinderGeometry(r0, r1, h, 24, 1, true, th0, Math.PI), mm, side === THREE.BackSide ? 0 : 0.02); o.position.y = y; return o; };
  hm.add(half(1.15, 1.2, 2.3, Math.PI / 2, st, 0.05, THREE.DoubleSide));   // back half of the skull
  { const cap = c3Mesh(new THREE.SphereGeometry(1.15, 24, 10, 0, TAU, 0, Math.PI / 2), st, 0.02); cap.scale.y = 0.42; cap.position.y = 1.2; hm.add(cap); }
  hm.add(rb(0.14, 0.5, 2.3, st2, 0, 1.55, 0, 0.01));   // the crown ridge
  hm.add(half(1.24, 1.3, 0.7, -Math.PI / 2, st2, -0.75, THREE.DoubleSide));   // the bevor (chin guard), fixed
  for (let i = 0; i < 5; i++) { const rv = c3Mesh(new THREE.SphereGeometry(0.07, 8, 6), MU.M.gold, 0.004); const a = -0.9 + i * 0.45; rv.position.set(Math.sin(a) * 1.3, -0.5, Math.cos(a) * 1.3); hm.add(rv); }
  { const inner = c3Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 20, 1, true), (() => { const q = MU.M.void.clone(); q.side = THREE.BackSide; return q; })(), 0); inner.position.y = 0.05; hm.add(inner); }
  const visor = new THREE.Group(); hm.add(visor);
  { const vm = c3Prop('#ffffff', { map: muTexVisor(), metal: 0.55, rough: 0.28, env: 1.3 }); vm.side = THREE.DoubleSide;
    const v = c3Mesh(new THREE.CylinderGeometry(1.27, 1.25, 1.3, 24, 1, true, -Math.PI / 2, Math.PI), vm, 0.02); v.position.y = 0.0; visor.add(v);
    const snout = c3Mesh(new THREE.ConeGeometry(0.62, 1.0, 4), st2, 0.02); snout.rotation.x = Math.PI / 2; snout.rotation.y = Math.PI / 4; snout.scale.set(1, 1, 0.9); snout.position.set(0, -0.05, 1.55); visor.add(snout);
    visor.add(rb(2.0, 0.12, 0.2, MU.M.void, 0, 0.32, 1.22, 0));   // the eye slit
    for (let i = 0; i < 6; i++) { const hole = c3Mesh(new THREE.CircleGeometry(0.05, 8), MU.M.void, 0); hole.position.set(-0.35 + (i % 3) * 0.35, -0.18 - Math.floor(i / 3) * 0.2, 1.62 - Math.floor(i / 3) * 0.05); visor.add(hole); }
    visor.add(rb(0.12, 0.1, 0.5, st2, 0.0, 0.62, 1.12, 0.01)); }   // the lift tab
  for (const sx of [-1, 1]) { const rv = cyl(0.17, 0.17, 0.14, MU.M.gold, sx * 1.3, 0, 0, 0.006, 10); rv.rotation.z = Math.PI / 2; hm.add(rv); }   // the visor pivots
  for (let i = 1; i < 5; i++) { const pf = c3Mesh(new THREE.SphereGeometry(0.42, 10, 8), MU.M.plume, 0.012); pf.scale.set(0.7, 1.5, 0.9); pf.position.set(0, 1.4 + i * 0.12, -0.35 - i * 0.32); pf.rotation.x = -0.5 - i * 0.18; hm.add(pf); }
  hm.traverse((m) => { m.userData.noCast = true; });
  return { g, visor, helmet: hm };
}
function muViolin() { const g = new THREE.Group(), b = c3Prop('#b8601e', { rough: 0.3 }), d = c3Prop('#2a1a12', { rough: 0.4 });
  const lo = c3Mesh(new THREE.SphereGeometry(1, 18, 10), b, 0.015); lo.scale.set(0.9, 0.22, 1.1); lo.position.z = 0.6; g.add(lo); const up = c3Mesh(new THREE.SphereGeometry(1, 18, 10), b, 0.015); up.scale.set(0.75, 0.22, 0.85); up.position.z = -0.9; g.add(up);
  g.add(rb(0.3, 0.2, 2.6, d, 0, 0.18, -2.4, 0.01)); const sc = c3Mesh(new THREE.TorusGeometry(0.2, 0.08, 8, 14), d, 0.008); sc.position.set(0, 0.18, -3.8); sc.rotation.y = Math.PI / 2; g.add(sc);
  g.add(rb(0.5, 0.12, 1.2, d, 0, 0.24, 0.9, 0.006)); return g; }
function muRock() { const geo = new THREE.IcosahedronGeometry(1.1, 2), P = geo.attributes.position, R = RNG('murock'); const seen = {};
  for (let i = 0; i < P.count; i++) { const k = [P.getX(i), P.getY(i), P.getZ(i)].map((v) => v.toFixed(3)).join(','); seen[k] ||= 0.85 + R.f() * 0.3; P.setXYZ(i, P.getX(i) * seen[k], P.getY(i) * seen[k] * 0.8, P.getZ(i) * seen[k]); }
  geo.computeVertexNormals(); return c3Mesh(geo, c3Prop('#8a8a92', { rough: 0.95 }), 0.02); }
function muCamera() { const g = new THREE.Group(), blk = c3Prop('#1a1a1e', { rough: 0.6 }), sil = c3Prop('#d8dce2', { metal: 0.7, rough: 0.25 });
  g.add(rb(2.2, 1.3, 0.9, blk, 0, 0.65, 0, 0.015)); g.add(rb(2.2, 0.35, 0.92, sil, 0, 1.45, 0, 0.01)); g.add(rb(0.7, 0.4, 0.6, sil, 0, 1.75, 0, 0.01));
  const ln = cyl(0.42, 0.48, 0.8, sil, 0, 0.7, 0.75, 0.012, 16); ln.rotation.x = Math.PI / 2; g.add(ln); const gl = cyl(0.3, 0.3, 0.05, c3Prop('#3a5a8a', { rough: 0.05, env: 2 }), 0, 0.7, 1.16, 0.004, 16); gl.rotation.x = Math.PI / 2; g.add(gl);
  const fl = cyl(0.55, 0.15, 0.3, sil, 1.2, 2.1, 0, 0.008, 14); fl.rotation.x = Math.PI / 2; g.add(fl); return g; }
function muMask() { const g = new THREE.Group(), m = c3Prop('#ffffff', { map: muTexMask(), metal: 0.3, rough: 0.3, env: 1.4 }); m.alphaTest = 0.5; m.transparent = true; m.side = THREE.DoubleSide;
  const front = c3Mesh(new THREE.CylinderGeometry(1.7, 1.7, 3.2, 28, 1, true, -0.62, 1.24), m, 0); front.position.z = -1.42; g.add(front);
  const back = c3Mesh(new THREE.SphereGeometry(1, 18, 12), c3Prop('#e8b83a', { metal: 0.5, rough: 0.3 }), 0.015); back.scale.set(0.95, 1.05, 0.7); back.position.set(0, 0.55, -0.45); back.visible = false; g.add(back);   // v6: hidden (it read as a second head behind the mask)
  g.add(cyl(0.25, 0.5, 0.9, MU.M.plinth, 0, -1.9, -0.35, 0.01, 12)); return g; }

function muBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#6c7cc0', ambI: 0.42, sky: '#8494d8', ground: '#9a5a3c', key: '#ffc890', keyI: 1.9, keyP: [-40, 58, 78], rim: '#ff9a50', rimI: 0.4, rimP: [-40, 40, -20] });
  MU.T = { glass: muTexGlass(), pool: tex((g, w, h) => { const gr = g.createRadialGradient(w / 2, 0, 4, w / 2, h * 0.1, h * 0.95); gr.addColorStop(0, 'rgba(255,214,150,0.42)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 128, 128) };
  MU.M = { gold: c3Prop('#e0aa38', { metal: 0.65, rough: 0.28 }), wood: c3Prop('#5a3018', { rough: 0.5 }), velvet: c3Prop('#b0182a', { rough: 0.85 }), plinth: c3Prop('#22140f', { rough: 0.4 }),
    pot: c3Prop('#1a5a5e', { rough: 0.4 }), trunk: c3Prop('#7a5230', { rough: 0.9 }), leaf: c3Prop('#3f9a44', { rough: 0.8 }), leaf2: c3Prop('#2f8a3a', { rough: 0.8 }), black: c3Prop('#1a1418'),
    steel: c3Prop('#6a727c', { metal: 0.9, rough: 0.2, env: 1.7 }), steel2: c3Prop('#4c535c', { metal: 0.9, rough: 0.28, env: 1.5 }), void: c3Prop('#100c0e', { rough: 1 }), rivet: c3Prop('#8a7444', { metal: 0.8, rough: 0.35 }), blade: c3Prop('#c8ced6', { metal: 0.95, rough: 0.12, env: 2 }), leather: c3Prop('#3a2014', { rough: 0.7 }), dark: c3Prop('#3a1e20', { rough: 1 }), plume: c3Prop('#8a1216', { rough: 0.9 }), shade: c3Prop('#f2dcb0', { rough: 0.8, emissive: '#ffcf8a', ei: 0.55 }), bulb: c3Prop('#fff4d8', { emissive: '#fff0c8', ei: 1.4, glow: '#ffe0a0' }) };
  Object.assign(MU.M, { frame: c3Prop('#ffffff', { map: muTexGrain('#3a2010'), rough: 0.4, env: 1.2 }), trim: c3Prop('#d6ccb2', { rough: 0.6 }), muntin: c3Prop('#2e2a26', { metal: 0.4, rough: 0.45 }),
    sky: (() => { const m = c3Flat('#ffffff', { map: muTexSky(1), glow: '#7aa8e0' }); m.userData.c3keep = true; return m; })(),
    glassR: (() => { const m = new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.05, metalness: 0, envMapIntensity: 1.6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); m.userData.c3sl = true; return m; })(),
    glassF: new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w * 0.4, h); gr.addColorStop(0, 'rgba(255,244,224,0.16)'); gr.addColorStop(0.5, 'rgba(255,244,224,0.03)'); gr.addColorStop(1, 'rgba(255,244,224,0.08)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 64, 64), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    glint: new THREE.MeshBasicMaterial({ map: muTexGlint(), transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }) });
  MU.M.wood.map = muTexGrain('#7a4a2a'); MU.M.wood.color.set('#b88a6a'); MU.M.plinth.map = muTexGrain('#5a3a2a'); MU.M.plinth.color.set('#5a4038');
  const TW = muTexWall('#22727c', '#3a98a0', 'paint'), RW = muTexWall('#8e1e2c', '#b03440', 'damask');   // v6: lighter values (Ricks-level), same hues
  const teal = (rep) => c3Prop('#ffffff', { map: (() => { const t = TW.clone(); t.needsUpdate = true; t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  const red = (rep) => c3Prop('#ffffff', { map: (() => { const t = RW.clone(); t.needsUpdate = true; t.repeat.set(rep, 1); return t; })(), rough: 0.9 });
  const HH = 45;
  { const fm = c3Prop('#ffffff', { map: muTexFloor(), rough: 1, env: 0.8 }); fm.roughnessMap = muTexFloorR(); scene.add(pl(110, 80, fm, 0, 0, 40, 0, -Math.PI / 2)); }
  { const M = c3Prop('#ffffff', { map: muTexGrain('#4a2814'), rough: 0.45 }), run = (x0, z0, x1, z1, rail = true, pic = true) => { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0), nx = (z1 - z0) / L, nz = -(x1 - x0) / L, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const B = (h, d, y, m = M) => { const b = rbNC(L, h, d, m, mx + nx * d / 2, y, mz + nz * d / 2, 0); b.rotation.y = ry; scene.add(b); };
      B(0.8, 0.3, 0.4); if (rail) { B(0.45, 0.4, 5.0); B(0.12, 0.46, 4.72, MU.M.gold); } if (pic) B(0.3, 0.25, 30); B(1.0, 0.7, 44.4); };
    run(-55, 0, -34.4, 0); run(-13.6, 0, 55, 0); run(55, 0, 55, 80); run(55, 80, -55, 80); run(-55, 80, -55, 0, true, false); }
  scene.add(plNC(60, HH, teal(8), -25, HH / 2, 0)); scene.add(plNC(50, HH, red(7), 30, HH / 2, 0));
  scene.add(plNC(80, HH, teal(10), -55, HH / 2, 40, Math.PI / 2)); scene.add(plNC(80, HH, red(10), 55, HH / 2, 40, -Math.PI / 2)); scene.add(plNC(110, HH, teal(14), 0, HH / 2, 80, Math.PI));
  scene.add(plNC(110, 80, c3Prop('#2a1c1a', { rough: 0.9 }), 0, HH, 40, 0, Math.PI / 2));
  { const lm = c3Flat('#fff2dc', { glow: '#fff0d8' }); lm.userData.c3keep = true; for (let i = 0; i < 4; i++) for (const x of [-20, 20]) { { const tb = rbNC(14.6, 0.3, 8.6, MU.M.trim, x, HH - 0.15, 12 + i * 18, 0); tb.userData.c3catch = true; scene.add(tb); } const lp = plNC(14, 8, lm, x, HH - 0.32, 12 + i * 18, 0, Math.PI / 2); lp.userData.c3catch = true; scene.add(lp); } }
  for (let i = 0; i < 6; i++) scene.add(rbNC(110, 1.2, 0.8, MU.M.wood, 0, HH - 0.8, 4 + i * 14, 0.01));   // ceiling beams
  // v4: the CLERESTORY: the upper back wall is a deep band (1.3 thick) with real recessed windows (blue sky, muntins,
  // architraves, keystones) on a projecting string course, a crown moulding at the ceiling; sun shafts + floor patches
  { const D = 1.3, WX = [-46, -35, -24, -13, -2, 12, 23, 34, 45], ww = 7, wh = 5.6, wy = 40.2, band = { t: c3Prop('#1a5c62', { rough: 0.85 }), r: c3Prop('#7a1824', { rough: 0.9 }) };
    const pier = (x0, x1) => { for (const [a, b, m] of [[x0, Math.min(x1, 5), band.t], [Math.max(x0, 5), x1, band.r]]) if (b - a > 0.01) scene.add(rbNC(b - a, wh, D, m, (a + b) / 2, wy, D / 2, 0)); };
    let e = -55; for (const x of WX) { pier(e, x - ww / 2); e = x + ww / 2; muWindow(scene, x, wy, ww, wh, D); } pier(e, 55);
    for (const [a, b, m] of [[-55, 5, band.t], [5, 55, band.r]]) scene.add(rbNC(b - a, 1.4, D, m, (a + b) / 2, wy + wh / 2 + 0.7, D / 2, 0));   // the head band
    scene.add(rbNC(110, 0.7, 2.1, MU.M.trim, 0, wy - wh / 2 - 0.35, 1.05, 0)); scene.add(rbNC(110, 0.3, 1.7, MU.M.wood, 0, wy - wh / 2 - 0.85, 0.85, 0));   // string course
    scene.add(rbNC(110, 0.9, 2.0, MU.M.trim, 0, 44.55, 1.0, 0));   // crown moulding
    const pm = new THREE.MeshBasicMaterial({ map: muTexPatch(), color: '#bcd0ff', transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    for (const x of WX) { c3Shaft(scene, [x, wy, 0.8], [x + 5, 1, 27], 2.4, 5.6, '#d4e4ff', 0.05);
      const pt = pl(8.5, 12, pm, x + 5, 0.05, 28, 0, -Math.PI / 2); pt.userData.noCast = pt.userData.noInk2 = pt.userData.noShade = true; pt.renderOrder = 2; scene.add(pt); } }
  // entrance pilasters framing the door bay + the logo (base, shaft with a sunk panel, capital)
  for (const x of [-36, -12]) { scene.add(rbNC(2.3, 1.2, 1.7, MU.M.trim, x, 0.6, 0.85, 0)); scene.add(rbNC(1.7, 35.3, 1.1, MU.M.trim, x, 18.4, 0.55, 0)); scene.add(rbNC(1.0, 31, 0.1, c3Prop('#bcb098', { rough: 0.7 }), x, 18.2, 1.13, 0));
    scene.add(rbNC(2.4, 0.5, 1.8, MU.M.trim, x, 35.95, 0.9, 0)); scene.add(rbNC(2.1, 0.4, 1.5, MU.M.trim, x, 35.5, 0.75, 0)); }
  // ---- ENTRANCE + the LOGO WALL (x -24)
  scene.add(rbNC(20, 14, 0.2, c3Prop('#ffffff', { map: muTexOutside(), emissive: '#ffffff', ei: 0.5, emissiveMap: muTexOutside() }), -24, 7, 0.05, 0));
  for (const x of [-34, -24, -14]) scene.add(rb(0.8, 14, 0.8, MU.M.gold, x, 7, 0.4, 0.015));
  scene.add(rb(21.4, 1.0, 1.0, MU.M.gold, -24, 14.3, 0.5, 0.015)); for (const x of [-26, -22]) scene.add(rb(0.3, 3.4, 0.4, MU.M.gold, x, 6.5, 0.9, 0.01));
  scene.add(pl(14, 8, c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#7a1622'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8b83a'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); inked(g, 'WELCOME', w / 2, h / 2, h * 0.3, '#f2c848', { stroke: false, font: 'Georgia, serif' }); }, 512, 300), rough: 0.9 }), -24, 0.03, 6, 0, -Math.PI / 2));
  scene.add(pl(8, 48, c3Prop('#ffffff', { map: muTexCarpet('#9a1626', false, [1, 6]), rough: 0.95, env: 0.3 }), -24, 0.02, 34, 0, -Math.PI / 2));   // the red runner from the doors
  const SG = new THREE.Group(); scene.add(SG);   // the logo sign (focus layer: s20's subject)
  SG.add(rbNC(22.6, 17.2, 0.5, MU.M.frame, -24, 27.4, 0.25, 0)); SG.add(rb(21, 15.6, 1.0, MU.M.gold, -24, 27.4, 0.5, 0.03));
  { const sp = new THREE.SpotLight('#ffe2b0', 1.0, 30, 0.75, 0.8, 1.2); sp.position.set(-24, 36.2, 7); sp.target.position.set(-24, 25, 0.5); scene.add(sp, sp.target); sp.layers.enableAll(); } SG.add(pl(20, 14.6, c3Flat('#ffffff', { map: muTexLogo() }), -24, 27.4, 1.02));
  for (const x of [-31, -24, -17]) { const a = cyl(0.12, 0.12, 2.4, MU.M.black, x, 35.6, 1.6, 0.01, 6); a.rotation.x = 0.8; SG.add(a); const b = cyl(0.5, 0.35, 1.0, MU.M.black, x, 36.1, 2.6, 0.01, 10); b.rotation.x = -0.6; SG.add(b); }
  c3Layer(SG, C3.L_FOCUS); s.sign = SG;
  scene.add(pl(5, 10, c3Flat('#ffffff', { map: muTexBanner('SHOP', 'Thousands of new finds daily', '#17585e') }), -42, 22, 0.15)); scene.add(pl(5, 10, c3Flat('#ffffff', { map: muTexBanner('OPEN', '7 days a week', '#7a1622') }), -6, 22, 0.15));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 28), [MU.M.gold, c3Flat('#ffffff', { map: muTexClock() }), MU.M.gold], 0.02); c.rotation.x = Math.PI / 2; c.position.set(-42, 11, 0.2); scene.add(c); }
  scene.add(pl(3.2, 1.2, c3Flat('#ffffff', { map: texSign('EXIT', '#5aff8a', '#0a3a1a', 0.6) }), -6, 12, 0.15));
  muPalm(scene, -38, 4); muPalm(scene, -10, 4); muBench(scene, -44, 10, Math.PI / 2);
  // ---- the mezzanine along the left wall (x -55..-43, y 24) with the upper shop shelves
  scene.add(rbNC(12, 1.2, 80, MU.M.wood, -49, 24, 40, 0.02)); scene.add(rbNC(0.6, 0.5, 80, MU.M.gold, -43, 27.6, 40, 0.01));
  scene.add(pl(80, 3, (() => { const m = c3Flat('#ffffff', { map: tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(190,230,240,0.25)'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8962e'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 4, h); }, 512, 64), transparent: true, side: THREE.DoubleSide }); m.map.wrapS = THREE.RepeatWrapping; m.map.repeat.set(10, 1); return m; })(), -43, 26.1, 40, Math.PI / 2));
  { const t = muTexShelves(); t.repeat.set(6, 1); scene.add(plNC(80, 14, c3Flat('#ffffff', { map: t }), -54.8, 32, 40, Math.PI / 2)); }
  for (const z of [8, 54, 72]) { scene.add(cyl(0.9, 0.9, 23.4, MU.M.wood, -43.6, 11.7, z, 0.02, 14)); scene.add(cyl(1.3, 1.1, 0.8, MU.M.gold, -43.6, 23.0, z, 0.01, 14)); }
  scene.add(pl(9, 3, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#17585e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8b83a'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); inked(g, 'SHOP 2ND FLOOR', w / 2, h / 2, h * 0.4, '#ffffff', { stroke: false, maxW: w * 0.85 }); }, 768, 256) }), -42.9, 25.2, 62, Math.PI / 2));
  // ---- the HISTORY WALL (left wall, x -55, z 22..46)
  const HG = new THREE.Group(); scene.add(HG);
  // v4: real frames with the Flow photos: the big 1970 shop photo (+ the brass EST. 1970 plaque under it), the clipping and
  // the founders above it, OUR STORY between them; brass picture lights with real light pools
  HG.add(pl(4.6, 3.45, c3Flat('#ffffff', { map: muTexTitle(), transparent: true }), -54.9, 17.7, 33, Math.PI / 2));
  muFrame(HG, 'shop1970.jpg', -54.98, 11.4, 33, Math.PI / 2, 7.0, 7.0 * 478 / 640, { mat: 0.5, bar: 0.6, depth: 0.55 });
  muFrame(HG, 'clipping.jpg', -54.98, 17.7, 28.4, Math.PI / 2, 2.5, 2.5 * 640 / 478, { mat: 0.32, bar: 0.32, depth: 0.4 });
  muFrame(HG, 'founders.jpg', -54.98, 17.7, 37.6, Math.PI / 2, 2.5, 2.5 * 640 / 478, { mat: 0.32, bar: 0.32, depth: 0.4 });
  HG.add(rb(0.3, 1.5, 4.0, MU.M.wood, -54.85, 6.75, 33, 0.01)); HG.add(pl(3.7, 1.25, c3Prop('#ffffff', { map: muTexBrass('EST. 1970', '', true), metal: 0.35, rough: 0.3 }), -54.66, 6.75, 33, Math.PI / 2));
  muPicLight(HG, -55, 15.4, 33, 4.0, scene); muPicLight(HG, -55, 20.45, 28.4, 2.2, scene); muPicLight(HG, -55, 20.45, 37.6, 2.2, scene);
  for (const z of [23, 30, 37, 44]) muPost(scene, -50.8, z); muRope(scene, [-50.8, 23], [-50.8, 30]); muRope(scene, [-50.8, 30], [-50.8, 37]); muRope(scene, [-50.8, 37], [-50.8, 44]);
  { const leather = c3Prop('#ffffff', { map: muTexGrain('#7a4422'), rough: 0.6 }), strap = c3Prop('#2a1a10', { rough: 0.7 });
    scene.add(rb(2.2, 0.4, 5.2, MU.M.plinth, -53.4, 0.2, 42.4, 0.01)); scene.add(rb(2.0, 2.4, 4.4, leather, -53.4, 1.6, 42.4, 0.015)); scene.add(rb(2.06, 0.5, 4.46, c3Prop('#5a3018', { rough: 0.6 }), -53.4, 2.6, 42.4, 0.01));
    for (const dz of [-1.2, 1.2]) scene.add(rbNC(2.1, 2.5, 0.25, strap, -53.4, 1.6, 42.4 + dz, 0.006)); for (const [dy, dz] of [[0.45, -2.15], [0.45, 2.15], [2.75, -2.15], [2.75, 2.15]]) scene.add(rbNC(2.12, 0.35, 0.35, MU.M.gold, -53.4, dy, 42.4 + dz, 0.004));
    for (const [y, w, d, c] of [[0.9, 1.6, 3.4, '#2f4a6a'], [2.25, 1.4, 2.9, '#8a5a2a'], [3.35, 1.2, 2.3, '#5a6a3a']]) { scene.add(rb(w, y === 0.9 ? 1.8 : y === 2.25 ? 0.9 : 1.3 - 0.6, d, c3Prop(c, { rough: 0.55 }), -53.6, y, 37.6, 0.012)); }
    scene.add(rbNC(0.3, 0.2, 1.0, strap, -53.6, 3.85, 37.6, 0.004)); }
  c3Layer(HG, C3.L_FOCUS); s.history = HG;
  muBench(scene, -46, 33, Math.PI / 2); muPalm(scene, -51, 49, 0.9); muPalm(scene, -51, 18, 0.9);
  // ---- the MUSEUM corner (back right)
  scene.add(pl(22, 6.9, c3Flat('#ffffff', { map: muTexMuseum() }), 30, 25, 0.15)); scene.add(rbNC(22.6, 0.5, 0.6, MU.M.gold, 30, 21.3, 0.3, 0.01));
  scene.add(pl(5, 10, c3Flat('#ffffff', { map: muTexBanner('SINCE 1970', 'over a million finds', '#7a1622') }), 1.5, 13, 0.15));
  scene.add(pl(5, 10, c3Flat('#ffffff', { map: muTexBanner('ODD FINDS', 'all from lost suitcases', '#17585e') }), 54.8, 13, 12, -Math.PI / 2));
  scene.add(pl(1, 1, c3Prop('#7a1622'), 54.8, 10, 40, -Math.PI / 2));
  scene.add(pl(9, 12, c3Flat('#ffffff', { map: muTexBanner('FOUND IT!', 'Ask our staff about the museum', '#17585e') }), 54.8, 14, 30, -Math.PI / 2));
  scene.add(pl(40, 36, c3Prop('#ffffff', { map: muTexCarpet('#6a1220', true), rough: 0.95, env: 0.3 }), 30, 0.01, 20, 0, -Math.PI / 2));   // a dark red carpet under the museum
  const F = new THREE.Group(); scene.add(F);   // focus: the cases and their contents
  { const y0 = muCase(scene, F, MU_AR[0], MU_AR[1], 6, MU_PL, 16.2, 'SUIT OF ARMOR'); const A = muArmor(); A.g.position.set(MU_AR[0], y0, MU_AR[1]); F.add(A.g); s.visor = A.visor; s.helmet = A.helmet; }
  { const y0 = muCase(scene, F, MU_MK[0], MU_MK[1], 3.4, 6.4, 4.4, 'BURIAL MASK'); s.mask = muMask(); s.mask.position.set(MU_MK[0], y0 + 2.35, MU_MK[1]); F.add(s.mask); }
  { const y0 = muCase(scene, F, 8, 10, 3.2, 4.4, 4.0, 'VIOLIN'); const v = muViolin(); v.scale.setScalar(0.62); v.position.set(8, y0 + 1.4, 10); v.rotation.set(-1.0, 0.5, 0); F.add(v); F.add(cyl(0.12, 0.2, 1.0, MU.M.plinth, 8, y0 + 0.5, 10, 0.01, 8)); }
  { const y0 = muCase(scene, F, 48, 30, 3.0, 4.6, 3.6, 'MOON ROCK?'); const r = muRock(); r.position.set(48, y0 + 1.3, 30); F.add(r); }
  { const y0 = muCase(scene, F, 31, 31, 3.0, 4.4, 3.6, 'VINTAGE CAMERA'); const c = muCamera(); c.position.set(31, y0 + 0.2, 31); c.rotation.y = -0.35; F.add(c); }
  { const g = new THREE.Group(); g.position.set(28.4, 0, 23.4); g.rotation.y = -0.42; F.add(g); g.add(cyl(0.5, 0.6, 0.25, MU.M.gold, 0, 0.12, 0, 0.01, 12)); g.add(cyl(0.1, 0.1, 4.2, MU.M.gold, 0, 2.2, 0, 0.008, 8));
    const b = new THREE.Group(); b.position.set(0, 4.6, 0.15); b.rotation.x = -0.35; g.add(b); b.add(rb(4.8, 3.2, 0.25, MU.M.plinth, 0, 0, -0.14, 0.012));
    b.add(pl(4.5, 2.9, c3Prop('#ffffff', { map: tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2d27a'); gr.addColorStop(0.5, '#c8962e'); gr.addColorStop(1, '#e8c060'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.lineWidth = 12; x.strokeStyle = '#7a5214'; x.strokeRect(16, 16, w - 32, h - 32);
      inked(x, 'SUIT OF ARMOR', w / 2, h * 0.22, h * 0.12, '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.8 }); x.fillStyle = '#7a5214'; x.fillRect(w * 0.25, h * 0.32, w * 0.5, 4);
      inked(x, 'FOUND IN A', w / 2, h * 0.5, h * 0.2, '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.84 }); inked(x, 'SUITCASE', w / 2, h * 0.76, h * 0.2, '#3a2208', { stroke: false, font: 'Georgia, serif', weight: 900, maxW: w * 0.84 }); }, 640, 412), metal: 0.3, rough: 0.35 }), 0, 0, 0.0)); }
  c3Layer(F, C3.L_FOCUS);
  // ropes, benches, palms, spots
  for (const x of [19, 24, 29]) muPost(scene, x, 21.8); muRope(scene, [19, 21.8], [24, 21.8]); muRope(scene, [24, 21.8], [29, 21.8]);
  for (const x of [36.5, 43.5]) muPost(scene, x, 17); muRope(scene, [36.5, 17], [43.5, 17]);
  muSconce(scene, 15, 14.5, 0, 0); muSconce(scene, 45, 14.5, 0, 0); muSconce(scene, -37.5, 9.5, 0, 0); muSconce(scene, -10.5, 9.5, 0, 0); muSconce(scene, 55, 14.5, 22, -Math.PI / 2);
  for (const [x, z, ry, sd] of [[12.5, 0.02, 0, 1], [47.5, 0.02, 0, 2], [54.98, 40, -Math.PI / 2, 3]]) muFrame(scene, sd === 1 ? 'poster_air.jpg' : muTexTravel(sd), x, 22.5, z, ry, 3.9, 3.9 / 0.747 * (sd === 1 ? 1 : 0.95), { mat: 0, bar: 0.36, depth: 0.4, fm: MU.M.gold });
  muBench(scene, 22, 40, 0); muBench(scene, 42, 42, 0); muPalm(scene, 52, 6); muPalm(scene, 16, 4, 0.9); muPalm(scene, 52, 44, 0.9);
  muSpot(scene, MU_AR[0], MU_AR[1] + 6, 9, MU_AR[0], MU_AR[1], 2.0); muSpot(scene, MU_MK[0], MU_MK[1] + 5, 8, MU_MK[0], MU_MK[1], 1.8); muSpot(scene, 8, 14, 6, 8, 10, 1.1); muSpot(scene, 48, 34, 6, 48, 30, 1.1); muSpot(scene, 31, 35, 6, 31, 31, 1.1);
  muSpot(scene, -46, 33, 12, -55, 33, 0.9);
  toonPerson(s, 'muGuard'); toonPerson(s, 'muTour'); toonPerson(s, 'muVis');
  toonPet(s, 'snake', Object.assign({}, PETS.snake, { size: 1.3 }));
  haze(scene, '#3a3458', 0.0035);   // v5: deep blue-violet air
  c3Env(scene, { top: '#9aa4d8', mid: '#a07050', bot: '#2a1620' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.85, scale: 0.5, inkSet: false, bounce: ['#b8c0f0', '#6a3020', 0.08], lights: [[0, 30, 30, '#ffd8a8', 0.3, 60], [30, 26, 18, '#ffcf98', 0.3, 45], [-52.5, 15.5, 34, '#ffcf90', 0.4, 14], [15, 15, 1.6, '#ffc078', 0.7, 13], [45, 15, 1.6, '#ffc078', 0.7, 13], [-37.5, 10, 1.6, '#ffc078', 0.7, 12], [-10.5, 10, 1.6, '#ffc078', 0.7, 12], [53.4, 15, 22, '#ffc078', 0.7, 13]] });   // v3: Ricks-like set (setlook.js)
  return s;
}
const muGet = () => MU.s ||= muBuild();
SETS.museum = muGet;
function muReset(s, t) { hideAll(s); hideGrips(s); s.visor.rotation.x = 0; }
const muCam = (s, id, lt, K) => c3SetCam(s.cam, camMove(K, lt, id));
const muRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#1a1012', bgBlur: 2.0, glow: 0.4, glowBlur: 12, grade: 'saturate(1.18) contrast(1.16) brightness(0.97)' }, o));
const muStill = (p, l, fov = 42) => [[0, p, l, fov], [9, p, l, fov]];
// the guard by the armor case, the same spot in s30 and s33
const muGuardAt = (s, t, o = {}) => pose(s, 'muGuard', t, 31.5, 21, Object.assign({ facing: faceTo(s.cam, 31.5, 21, 10, 50), expr: 'bored', hand: { L: 'cross', R: 'cross2' } }, o));

// ---- s20: "You see, this place is called Unclaimed Baggage" — crane up from the entrance doors to the huge logo sign
SHOT_FN.s20 = (t, u, lt) => { const s = muGet(); muReset(s, t);
  muCam(s, 's20', lt, [[0, [-24, 5.5, 46], [-24, 8, 0], 50], [1.63, [-24, 23, 64], [-24, 24, 0], 50], [2.73, [-24, 23.4, 62], [-24, 24.2, 0], 50]]);
  const x = -35 + (t - 27.85) * 4.6; pose(s, 'muTour', t, x, 15, { facing: faceTo(s.cam, x, 15, x + 5, 15), mode: 'walk', phase: (x + 35) / 3.3, stride: 3.3, expr: 'happy', gaze: [0.5, -0.4], hand: { L: 'down', R: 'down' } });
  pose(s, 'muVis', t, -16, 9, { facing: -0.6, expr: [[0, 'smile'], [29.48, 'excited']], gaze: [0, -1], hand: { L: 'down', R: [[0, 'down'], [29.6, 'point']] } });
  muRender(s, { bgBlur: 1.5 }); };
SNAPS.s20 = 'free'; CAMF.s20 = { push: 0.03, orbit: 0, crane: 0, roll: 0 };
// ---- s21: "and it's been doing this since 1970" — the history wall; push in to the photo + the EST. 1970 plaque
SHOT_FN.s21 = (t, u, lt) => { const s = muGet(); muReset(s, t); muCam(s, 's21', lt, muStill([-24, 12, 46], [-55, 11.5, 34], 42)); muRender(s, { bgBlur: 2.5 }); };
SNAPS.s21 = [[30.58, [[-54.7, 12.6, 34.6, 0.5, 12.2, 19.6]], 0.66], [31.60, [[-54.7, 10.9, 33, 0.5, 8.6, 9.4]], 0.58]];
CAMF.s21 = { push: 0.05, orbit: 0.04, crane: 0.1, roll: 0 };
// ---- s30: "They've found a suit of armor" — the museum corner; orbit in and land on the armor in its case + plaque
SHOT_FN.s30 = (t, u, lt) => { const s = muGet(); muReset(s, t); muCam(s, 's30', lt, muStill([10, 13, 50], [24, 8, 16], 42));
  muGuardAt(s, t);
  pose(s, 'muTour', t, 17.2, 23.4, { facing: faceTo(s.cam, 17.2, 23.4, 26, 18), expr: [[0, 'surprised'], [48.66, 'excited']], gaze: [0.6, -0.6], hand: { L: 'down', R: [[0, 'down'], [48.7, 'point']] } });
  muRender(s, { bgBlur: 2.5 }); };
SNAPS.s30 = [[47.92, [[25, 9, 19, 22, 18, 10]], 0.92], [48.66, [[MU_AR[0] + 1.6, 9.3, MU_AR[1] + 2.5, 9.4, 18.6, 11]], 0.62]];
CAMF.s30 = { push: 0.06, orbit: 0.14, crane: 0.3, roll: 0 };
// ---- s32: "and even an ancient Egyptian burial mask" — the gold mask in its spotlit case, crane down to its plaque
SHOT_FN.s32 = (t, u, lt) => { const s = muGet(); muReset(s, t); muCam(s, 's32', lt, muStill([36, 9.5, 34], [40, 8, 12], 40)); muRender(s, { bgBlur: 3 }); };
SNAPS.s32 = [[49.96, [[MU_MK[0], 5.6, MU_MK[1], 3.8, 11.2, 3.8]], 0.66], [50.78, [[MU_MK[0], 8.7, MU_MK[1] + 0.4, 2.8, 3.4, 1]], 0.6], [51.48, [[MU_MK[0], 7.0, MU_MK[1] + 1.2, 3.2, 6.6, 1.2]], 0.62]];
CAMF.s32 = { push: 0.05, orbit: -0.08, crane: -0.4, roll: 0 };
// ---- s33: G3 GAG (wordless) — back on the armor: the visor creaks open and the rattlesnake peeks out of the helmet
SHOT_FN.s33 = (t, u, lt) => { const s = muGet(); muReset(s, t); muCam(s, 's33', lt, muStill([17, 19.4, 30], [24, 14.6, 16], 42));
  const ko = clamp((t - 52.35) / 0.22), jit = t > 52.35 && t < 52.6 ? Math.sin(t * 90) * 0.04 : 0; s.visor.rotation.x = -EZ.o3(ko) * 1.4 + jit;
  muGuardAt(s, t, { expr: t > 52.6 ? 'shock' : 'bored', hand: t > 52.6 ? { L: 'up', R: 'up' } : { L: 'cross', R: 'cross2' } });
  if (t >= 52.42) { const r = EZ.o3(clamp((t - 52.42) / 0.25)); petAt(s, 'snake', t, MU_AR[0], MU_HY - 1.3, MU_AR[1] + 0.45, { expr: t < 52.62 ? 'surprised' : 'angry', rattle: 1, rise: 0.4 + 0.6 * r, tongue: Math.floor(t / 0.12) % 2 ? 1 : 0.3, facing: 0.5, gaze: [-0.3, 0.1], bright: 1.15 }); }
  muRender(s, { bgBlur: 3.5 }); };
SNAPS.s33 = [[52.12, [[MU_AR[0], MU_HY - 0.6, MU_AR[1] + 0.3, 3.8, 4.2, 2]], 0.66], [52.40, [[MU_AR[0], MU_HY + 0.35, MU_AR[1] + 0.6, 2.6, 2.6, 1.2]], 0.72]];
CAMF.s33 = { push: 0.08, orbit: 0.06, crane: 0, roll: 0 };

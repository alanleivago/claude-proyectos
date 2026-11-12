// =====================================================================
//  SET factory — the old brick factory turned library (s12-s18, 26.19-46.14, ONE continuous take).
//  Twin terracotta barrel vaults (naves centred x -16 / +16, spring y 16, crown y 32, z 0..100) on teal iron columns
//  (x 0, every 12 z), open skylight strips along both crowns (cool blue shafts + dust). Left nave: tall shelves in the
//  wall arches, reading tables with green banker lamps (x -20..-8, z 34..48), the LIBRARY sign hanging from the tie at
//  z 48, the collectors' crate pile (z 78). Right nave: kids' corner (rug at 16,40: beanbags, low shelves, star garland),
//  the hero shelf of real 3D spines on the right wall (z 20..46) ending at the book cart with the dented book (28.5, 20),
//  the librarian desk (z 12) with the BOOKS flip counter. Outside: the brick kiln + chimney (-56, 50), roofs, Ankara.
//  Registers s12..s18. Prefix fa / FA. Camera = seqCam(s, 'factory', t) (CAMSEQ.factory below).
// =====================================================================
const FA = {};
const FA_X = 32, FA_Z = 100, FA_SPR = 16, FA_R = 16, FA_RIBS = [12, 24, 36, 48, 60, 72, 84], FA_GAP = 0.16;   // FA_GAP: half-angle of the open crown strip
const FA_CHIM = [-56, 50], FA_SIGN = [16, 72], FA_RUG = [16, 40], FA_DESK = [16, 12], FA_CNT = [9.5, 11.2], FA_CART = [28.5, 20];
const FA_HERO = [14.6, 40.6], FA_KID = [18.4, 41.2], FA_MUM = [23.8, 35.8], FA_CO = [21.2, 35.4], FA_LIB = [20.5, 8.6];
const FA_ARRIVE = 26.19, FA_HOME = 40.7;   // the walk starts with the whip; hero + coworker move to the kids' corner off camera at 40.7
Object.assign(CAST, {
  FAa: { key: 'FAa', hair: 'spiky', hairColor: 'blond', outfit: 'hivis', colors: { main: '#4a3a8a', vest: '#ff9a2a', band: '#e8eef2' }, skin: 'brown', body: 'tall' },   // collector with a crate
  FAb: { key: 'FAb', hair: 'bald2', hairColor: 'white', moustache: true, outfit: 'hivis', colors: { main: '#7a2a3a', vest: '#f2e23a', band: '#e8eef2' }, skin: 'peach', body: 'short' },   // retired collector at the desk
  FAmum: { key: 'FAmum', hair: 'side', hairColor: 'black',   // v3: was auburn bob = the passer-by's hair
    outfit: 'polo', colors: { main: '#2a9a8a' }, skin: 'peach', body: 'thin' },   // the coworker's wife
});

// ---- textures
function faRep(t, x, y) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.needsUpdate = true; return t; }
// terracotta brick, 8 x 8 world units per tile (8 bricks across, 24 courses), mortar, burnt headers, soot near the top
function faTexBrick(seed = 'b', base = '#c4623a') { return tex((g, w, h) => { const R = RNG('fabrick', seed), rows = 24, cols = 8, rh = h / rows, cw = w / cols;
  g.fillStyle = '#e6c49a'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const x = (i + (j % 2) * 0.5) * cw, y = j * rh, k = R.r(0.84, 1.12), burnt = R.f() < 0.1;
    g.fillStyle = burnt ? c3Shd(base, 0.62) : (R.f() < 0.12 ? c3Shd('#d8843e', k) : c3Shd(base, k)); g.fillRect(x + 2.5, y + 2.5, cw - 4, rh - 4);
    g.fillStyle = 'rgba(255,230,200,0.12)'; g.fillRect(x + 3, y + 3, cw - 6, 2); g.fillStyle = 'rgba(60,20,10,0.16)'; g.fillRect(x + 3, y + rh - 4, cw - 6, 2);
    for (let q = 0; q < 6; q++) { g.fillStyle = R.f() < 0.6 ? 'rgba(70,25,10,0.18)' : 'rgba(255,220,190,0.14)'; g.fillRect(x + R.r(3, cw - 5), y + R.r(3, rh - 5), 2, 2); } }
  for (let i = 0; i < 10; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(30, 90), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(255,236,210,0.12)' : 'rgba(80,30,20,0.1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 512, 512); }
function faTexFloor() { return tex((g, w, h) => { const R = RNG('fafloor'), n = 12, pw = w / n;   // honey oak planks, 16 x 16 units per tile
  for (let i = 0; i < n; i++) { let y = -R.r(0, 200); while (y < h) { const L = R.r(160, 360), k = R.r(0.86, 1.1); g.fillStyle = c3Shd('#c8843a', k); g.fillRect(i * pw, y, pw, L);
      g.strokeStyle = 'rgba(90,50,20,0.22)'; g.lineWidth = 1.4; for (let q = 0; q < 5; q++) { const x = i * pw + R.r(4, pw - 4); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + R.n(6), y + L / 3, x + R.n(6), y + 2 * L / 3, x + R.n(3), y + L); g.stroke(); }
      g.fillStyle = 'rgba(50,25,10,0.5)'; g.fillRect(i * pw, y, pw, 2.5); y += L; }
    g.fillStyle = 'rgba(50,25,10,0.45)'; g.fillRect(i * pw, 0, 2.5, h); g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(i * pw + 2.5, 0, 2, h); }
  for (let i = 0; i < 40; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(40, 140), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(255,240,210,0.1)' : 'rgba(60,30,10,0.1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 1024, 1024); }
const FA_SPINE = ['#c8402e', '#2f6aa8', '#e2a23a', '#3f8a5a', '#8a4aa8', '#e8dcc4', '#2a3a5a', '#d86a2a', '#1f7a7a', '#a83a5a', '#f0c860', '#5a7a2a'];
function faTexBooks(seed) { return tex((g, w, h) => { const R = RNG('fabk', seed); g.fillStyle = '#3a2214'; g.fillRect(0, 0, w, h); let x = 4;
  while (x < w - 8) { const bw = R.r(9, 22), bh = R.r(h * 0.66, h * 0.97), c = FA_SPINE[Math.floor(R.f() * FA_SPINE.length)];
    if (R.f() < 0.06) { const n = R.i(3, 5); for (let k = 0; k < n; k++) { g.fillStyle = FA_SPINE[Math.floor(R.f() * FA_SPINE.length)]; g.fillRect(x, h - (k + 1) * 11, 60, 10); } x += 64; continue; }   // a lying stack
    g.fillStyle = c; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 1, h - bh, 2, bh);
    g.fillStyle = 'rgba(255,224,150,0.55)'; g.fillRect(x + 2, h - bh + 8, bw - 4, 2.5); g.fillRect(x + 2, h - 12, bw - 4, 2.5); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + bw - 2, h - bh, 2, bh); x += bw + 1; } }, 512, 96); }
function faTexRug() { return tex((g, w, h) => { const C = ['#e84a5a', '#f2a23a', '#f6d84a', '#5ac06a', '#3a9ad8', '#8a5ad8', '#f2efe6'];
  for (let i = 0; i < 7; i++) { g.fillStyle = C[i]; g.beginPath(); g.arc(w / 2, h / 2, (w / 2 - 4) * (1 - i / 7.4), 0, TAU); g.fill(); }
  const R = RNG('farug'); for (let i = 0; i < 4000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.fillStyle = '#f2efe6'; g.beginPath(); g.arc(w / 2 + Math.cos(a) * w * 0.37, h / 2 + Math.sin(a) * h * 0.37, 7, 0, TAU); g.fill(); } }, 512, 512); }
function faTexCover(o) { return tex((g, w, h) => { g.fillStyle = o.c; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, w * 0.08, h);
  g.fillStyle = o.band || '#f2e2b0'; g.fillRect(w * 0.14, h * 0.12, w * 0.76, h * 0.2); inked(g, o.title, w * 0.52, h * 0.22, h * 0.09, '#3a1a10', { stroke: false, maxW: w * 0.68, font: 'Georgia, serif', weight: 700 });
  if (o.pic === 'moon') { g.fillStyle = '#f6e6a0'; g.beginPath(); g.arc(w * 0.52, h * 0.58, w * 0.2, 0, TAU); g.fill(); g.fillStyle = o.c; g.beginPath(); g.arc(w * 0.6, h * 0.53, w * 0.17, 0, TAU); g.fill(); }
  if (o.ring) { g.strokeStyle = 'rgba(110,62,26,0.55)'; g.lineWidth = 7; g.beginPath(); g.arc(w * 0.6, h * 0.66, w * 0.17, 0.3, TAU - 0.4); g.stroke(); g.strokeStyle = 'rgba(110,62,26,0.25)'; g.lineWidth = 16; g.beginPath(); g.arc(w * 0.6, h * 0.66, w * 0.155, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(110,62,26,0.3)'; g.beginPath(); g.arc(w * 0.38, h * 0.8, 6, 0, TAU); g.fill(); }
  if (o.dent) { g.fillStyle = 'rgba(40,20,10,0.35)'; g.beginPath(); g.moveTo(w, h * 0.78); g.lineTo(w * 0.8, h); g.lineTo(w, h); g.fill();   // crushed corner: shadowed fold + crease lines
    g.fillStyle = t3Mix(o.c, '#ffffff', 0.35); g.beginPath(); g.moveTo(w * 0.995, h * 0.8); g.lineTo(w * 0.82, h * 0.995); g.lineTo(w * 0.93, h * 0.93); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(30,15,8,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w, h * 0.74); g.lineTo(w * 0.9, h * 0.86); g.lineTo(w * 0.76, h); g.moveTo(w * 0.92, h * 0.8); g.lineTo(w * 0.86, h * 0.9); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }, 256, 340); }
function faTexPages(pic) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#f2e6cc'); gr.addColorStop(0.47, '#fbf3e2'); gr.addColorStop(0.5, '#d8c8a8'); gr.addColorStop(0.53, '#fbf3e2'); gr.addColorStop(1, '#f2e6cc'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (pic) { g.fillStyle = '#7ac0f0'; g.fillRect(w * 0.06, h * 0.1, w * 0.38, h * 0.55); g.fillStyle = '#5ab04a'; g.fillRect(w * 0.06, h * 0.5, w * 0.38, h * 0.15); g.fillStyle = '#f6d23a'; g.beginPath(); g.arc(w * 0.32, h * 0.24, w * 0.06, 0, TAU); g.fill();
    g.fillStyle = '#2a2226'; g.beginPath(); g.ellipse(w * 0.2, h * 0.5, w * 0.06, h * 0.06, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(w * 0.25, h * 0.42, w * 0.035, 0, TAU); g.fill();   // a black cat
    g.fillStyle = 'rgba(60,40,30,0.55)'; for (let i = 0; i < 6; i++) g.fillRect(w * 0.56, h * (0.18 + i * 0.1), w * (0.3 + 0.08 * (i % 2)), 5); g.fillStyle = '#e84a5a'; g.beginPath(); g.arc(w * 0.72, h * 0.82, w * 0.06, 0, TAU); g.fill(); }
  else { g.fillStyle = 'rgba(60,40,30,0.45)'; for (const x0 of [0.06, 0.56]) for (let i = 0; i < 12; i++) g.fillRect(w * x0, h * (0.1 + i * 0.07), w * 0.36, 3); } }, 512, 320); }
function faTexPoster(k) { return tex((g, w, h) => { g.fillStyle = ['#2a6aa8', '#e8762a', '#1f7a6a'][k]; g.fillRect(0, 0, w, h); g.lineWidth = 14; g.strokeStyle = '#f6ecd8'; g.strokeRect(16, 16, w - 32, h - 32);
  if (k === 0) { inked(g, 'READ', w / 2, h * 0.22, h * 0.13, '#f6d84a', { stroke: false }); g.fillStyle = '#f6ecd8'; g.beginPath(); g.moveTo(w * 0.2, h * 0.68); g.quadraticCurveTo(w * 0.35, h * 0.58, w * 0.5, h * 0.66); g.quadraticCurveTo(w * 0.65, h * 0.58, w * 0.8, h * 0.68); g.lineTo(w * 0.8, h * 0.78); g.quadraticCurveTo(w * 0.65, h * 0.7, w * 0.5, h * 0.78); g.quadraticCurveTo(w * 0.35, h * 0.7, w * 0.2, h * 0.78); g.fill(); inked(g, 'every day', w / 2, h * 0.88, h * 0.06, '#f6ecd8', { stroke: false }); }
  else if (k === 1) { inked(g, 'QUIET', w / 2, h * 0.2, h * 0.12, '#ffffff', { stroke: false }); inked(g, 'please', w / 2, h * 0.31, h * 0.07, '#ffffff', { stroke: false }); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, h * 0.62, w * 0.18, 0, TAU); g.fill(); g.fillStyle = '#e8762a'; g.fillRect(w * 0.47, h * 0.5, w * 0.06, h * 0.24); }
  else { inked(g, 'OPEN', w / 2, h * 0.2, h * 0.12, '#f6d84a', { stroke: false }); inked(g, 'Mon - Sat', w / 2, h * 0.4, h * 0.07, '#ffffff', { stroke: false }); inked(g, '9 - 19', w / 2, h * 0.52, h * 0.09, '#ffffff', { stroke: false }); inked(g, 'free for all', w / 2, h * 0.78, h * 0.06, '#f6ecd8', { stroke: false }); } }, 360, 500); }
// the split-flap BOOKS counter: cells = [[from, to, p], ...] (p 0..1 = flap progress)
function faDrawCounter(cells) { return (g, w, h) => {
  g.fillStyle = '#123a32'; g.beginPath(); g.roundRect(0, 0, w, h, 34); g.fill(); g.lineWidth = 14; g.strokeStyle = '#d8a84a'; g.beginPath(); g.roundRect(9, 9, w - 18, h - 18, 28); g.stroke();
  inked(g, 'BOOKS', w / 2, h * 0.17, h * 0.13, '#f6e6b8', { stroke: false, maxW: w * 0.6 });
  const n = cells.length, cw = w * 0.15, gap = w * 0.02, comma = w * 0.05, tot = n * cw + (n - 1) * gap + comma, y0 = h * 0.32, ch = h * 0.58; let x = (w - tot) / 2;
  const showComma = cells[1][1] !== ' ' || cells[1][0] !== ' ';
  const glyph = (d, cx, top, half) => { g.save(); g.beginPath(); half === 'top' ? g.rect(cx, y0, cw, ch / 2) : g.rect(cx, y0 + ch / 2, cw, ch / 2); g.clip();
    g.fillStyle = '#1c1c22'; g.beginPath(); g.roundRect(cx, y0, cw, ch, 10); g.fill(); if (d !== ' ') inked(g, d, cx + cw / 2, y0 + ch / 2 + 4, ch * 0.78, '#f4f0e6', { stroke: false, font: '"Arial Black", Arial, sans-serif', weight: 900 }); g.restore(); };
  cells.forEach(([a, b, p], i) => {
    glyph(p < 1 ? b : b, x, y0, 'top'); glyph(p < 0.5 ? a : b, x, y0, 'bot');
    if (p > 0 && p < 1) { g.save(); if (p < 0.5) { const k = Math.cos(p * Math.PI); g.translate(0, y0 + ch / 2); g.scale(1, k); g.translate(0, -(y0 + ch / 2)); glyph(a, x, y0, 'top'); }
      else { const k = -Math.cos(p * Math.PI); g.translate(0, y0 + ch / 2); g.scale(1, k); g.translate(0, -(y0 + ch / 2)); glyph(b, x, y0, 'bot'); } g.restore(); }
    g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(x, y0 + ch / 2 - 2, cw, 4); g.fillStyle = '#d8a84a'; g.fillRect(x - 3, y0 + ch / 2 - 6, 6, 12); g.fillRect(x + cw - 3, y0 + ch / 2 - 6, 6, 12);
    x += cw + gap; if (i === 1) { if (showComma) inked(g, ',', x + comma / 2 - gap / 2, y0 + ch * 0.82, ch * 0.5, '#f6e6b8', { stroke: false }); x += comma; } });
}; }
// ---- the flip counter timeline: blank -> 6,000 on "few", -> 25,000 on "tens"; each flap 0.07 s, cells roll digit by digit
const FA_FLIP = 0.07;
const FA_CSEQ = (() => { const ev = [[], [], [], [], []], str = (k) => (k ? k + '000' : '0').padStart(5, ' ');   // an odometer: every thousand passes, so it never shows more than 25,000
  const run = (k0, k1, t0, dt) => { for (let k = k0 + 1, t = t0; k <= k1; k++, t += dt) { const a = str(k - 1), b = str(k); for (let i = 0; i < 5; i++) if (a[i] !== b[i]) ev[i].push([t, a[i], b[i]]); } };
  run(0, 6, wAfter('few', 41, 41.5), FA_FLIP); run(6, 25, wAfter('tens', 42, 42.66), 0.042); return ev; })();
function faFlipD(i, t0) { return t0 >= 42.5 ? 0.042 : FA_FLIP; }
function faCells(t) { return FA_CSEQ.map((E, i) => { let st = [i === 4 ? '0' : ' ', i === 4 ? '0' : ' ', 1]; for (const [t0, a, b] of E) { if (t < t0) break; st = [a, b, Math.min(1, (t - t0) / faFlipD(i, t0))]; } return st; }); }

// ---- geometry helpers
// a barrel-vault shell: arc of radius R about (cx, y0) from angle a0 to a1 (0 = +x, PI/2 = up), along z0..z1; uv in world units
function faArc(R, cx, y0, z0, z1, a0, a1, inward = true, seg = 28) { const P = [], N = [], U = [], I = [], nz = 2;
  for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
    for (let j = 0; j <= nz; j++) { const z = z0 + (z1 - z0) * j / nz; P.push(cx + R * c, y0 + R * s, z); N.push(inward ? -c : c, inward ? -s : s, 0); U.push(R * a, z); } }
  for (let i = 0; i < seg; i++) for (let j = 0; j < nz; j++) { const a = i * (nz + 1) + j, b = a + nz + 1; inward ? I.push(a, a + 1, b, b, a + 1, b + 1) : I.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return g; }
// the gable end: two humps over a rectangle (x -32..32), optional arched window holes
function faGable() { const s = new THREE.Shape(); s.moveTo(-FA_X, 0); s.lineTo(FA_X, 0); s.lineTo(FA_X, FA_SPR); s.absarc(16, FA_SPR, FA_R, 0, Math.PI, false); s.absarc(-16, FA_SPR, FA_R, 0, Math.PI, false); s.lineTo(-FA_X, 0); return new THREE.ShapeGeometry(s, 24); }
// static clutter baked into a few vertex-coloured meshes (same as lost-luggage soBake)
function faBake(root, o = {}) { root.updateMatrixWorld(true); const B = new Map();
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '') + (mt.side === THREE.DoubleSide ? 'D' : '');
    if (!B.has(key)) B.set(key, { mt, em, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); B.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const { mt, em, L } of B.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.66 + 0.34 * clamp((y - (o.floor ?? 0)) / (o.aoH ?? 2.5));
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        C[k * 3] = c.r * ao; C[k * 3 + 1] = c.g * ao; C[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast || em) mesh.userData.noCast = true; out.add(mesh); }
  return out; }
const faBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
// a wooden crate full of books (origin = bottom centre, long side along x)
function faCrate(seed, w = 3.4, h = 1.9, d = 2.3) { const g = new THREE.Group(), M = FA.M, R = RNG('facrate', seed);
  for (const [x, z, ww, dd] of [[0, d / 2 - 0.08, w, 0.16], [0, -d / 2 + 0.08, w, 0.16], [w / 2 - 0.08, 0, 0.16, d], [-w / 2 + 0.08, 0, 0.16, d]]) for (const y of [0.17, 0.5, 0.83]) g.add(faBox(ww, 0.26 * h, dd, M.crate, x, y * h, z));
  g.add(faBox(w, 0.12, d, M.crateD, 0, 0.06, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(faBox(0.22, h, 0.22, M.crateD, sx * (w / 2 - 0.11), h / 2, sz * (d / 2 - 0.11)));
  let x = -w / 2 + 0.3; while (x < w / 2 - 0.35) { const bw = R.r(0.22, 0.42), bh = R.r(0.7, 1.05) * h; const b = faBox(bw, bh, d * 0.7, c3Prop(FA_SPINE[R.i(0, FA_SPINE.length - 1)], { rough: 0.7 }), x + bw / 2, 0.12 + bh / 2, R.n(0.15)); b.rotation.z = R.n(0.12); g.add(b); x += bw + 0.03; }
  const lb = pl(1.5, 0.5, c3Flat('#ffffff', { map: FA.T.crateLbl }), 0, 0.5 * h, d / 2 + 0.01); g.add(lb); return g; }
// an open picture book (spine along y local, pages facing +z), grip point = its right edge
function faOpenBook(c, pic, s = 1) { const g = new THREE.Group(), cov = c3Prop(c, { rough: 0.6 });
  for (const sx of [-1, 1]) { const half = new THREE.Group(); half.rotation.y = -sx * 0.32; g.add(half); half.add(faBox(1.25 * s, 1.6 * s, 0.08 * s, cov, sx * 0.62 * s, 0, -0.03 * s)); }
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(2.4 * s, 1.5 * s), c3Flat('#ffffff', { map: faTexPages(pic) })); pg.position.z = 0.04 * s; g.add(pg);
  g.userData.grip = V3(1.2 * s, -0.2 * s, 0); return g; }

const sz0 = (R) => R.r(-0.9, 0.9);
// a spindle-back library chair (origin = floor centre, back toward -z)
function faChair() { const g = new THREE.Group(), M = FA.M; g.add(rb(1.6, 0.22, 1.5, M.woodL, 0, 2.2, 0, 0));
  for (const a of [-0.62, 0.62]) for (const b of [-0.58, 0.58]) g.add(cyl(0.1, 0.075, 2.1, M.woodD, a, 1.05, b, 0, 8));
  for (const a of [-0.62, 0.62]) g.add(cyl(0.09, 0.09, 2.3, M.woodD, a, 3.4, -0.6, 0, 8)); g.add(rb(1.55, 0.42, 0.18, M.woodL, 0, 4.45, -0.6, 0));
  for (const a of [-0.3, 0, 0.3]) g.add(cyl(0.05, 0.05, 1.9, M.woodD, a, 3.3, -0.6, 0, 6)); g.add(faBox(1.2, 0.1, 0.1, M.woodD, 0, 0.7, 0.58)); return g; }
// an open book lying flat (pages up)
function faFlatBook(c) { const g = new THREE.Group(); for (const sx of [-1, 1]) { const h = rb(0.95, 0.08, 1.3, c3Prop(c, { rough: 0.6 }), sx * 0.5, 0.04, 0, 0); h.rotation.z = sx * 0.06; g.add(h); const pg = rb(0.88, 0.1, 1.2, FA.M.paper, sx * 0.48, 0.12, 0, 0); pg.rotation.z = sx * 0.08; g.add(pg); } return g; }
// v2 density pass (user: "dense and detailed, never box primitives"): shelf labels + bookends + loose 3D books, back-wall
// arched windows with frames/sills + radiators, rugs, carts, globe, card catalogue, notice board, column brackets,
// tent + toys in the kids' corner, chimney iron hoops + lightning rod, kiln arches. All static -> baked into KW / KS.
function faDetail(s, KW, KS) { const M = FA.M, R = RNG('fadetail');
  const plaque = (txt, c) => c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#2a1a12'; g.beginPath(); g.roundRect(0, 0, w, h, 18); g.fill(); g.fillStyle = c; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 12); g.fill();
    inked(g, txt, w / 2, h * 0.56, h * 0.5, '#fff4dc', { stroke: false, maxW: w * 0.84, font: 'Georgia, serif', weight: 700 }); }, 512, 128) });
  const SECT = ['HISTORY', 'NOVELS', 'SCIENCE', 'POETRY', 'TRAVEL', 'ART', 'COOKING', 'MYSTERY', 'NATURE', 'COMICS', 'MUSIC', 'SPORT'];
  for (const sx of [-1, 1]) for (let b = 0; b < 8; b++) { const zc = b * 12 + 6, x = sx * (FA_X - 1.05); if (sx < 0 && b === 7) continue;
    const g = new THREE.Group(); g.position.set(x, 0, zc); g.rotation.y = -sx * Math.PI / 2; KS.add(g);
    g.add(pl(4.2, 1.05, plaque(SECT[(b * 2 + (sx > 0 ? 1 : 0)) % SECT.length], ['#1f6a5a', '#8a2a3a', '#2a4a8a', '#7a5a1a'][(b + (sx > 0 ? 2 : 0)) % 4]), 0, 12.0, -0.4));   // section plaque above the unit
    g.add(rb(10.8, 0.35, 2.1, M.woodD, 0, 11.15, 0.05, 0)); g.add(rb(11.0, 0.18, 2.2, M.shelf, 0, 11.4, 0.05, 0));   // crown moulding
    if (sx > 0 && zc > 18 && zc < 48) continue;
    for (let r = 0; r < 6; r++) { const y = 0.6 + r * (10 / 6) + 0.09; const n = R.i(1, 3);
      for (let k = 0; k < n; k++) { const lx = R.r(-4.4, 4.4); if (R.f() < 0.5) { let yy = y; for (let q = 0; q < R.i(2, 4); q++) { const bk = rb(R.r(1.0, 1.3), 0.24, R.r(0.9, 1.2), c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), lx, yy + 0.12, 0.45, 0); bk.rotation.y = R.n(0.15); g.add(bk); yy += 0.24; } }
        else { const bk = rb(0.28, 1.15, 1.2, c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), lx, y + 0.62, 0.45, 0); bk.rotation.z = (R.f() < 0.5 ? 1 : -1) * 0.32; g.add(bk); } }
      if (R.f() < 0.5) { const be = new THREE.Group(); be.position.set(R.r(-4.6, 4.6), y, 0.75); be.add(faBox(0.5, 0.06, 0.6, M.brass, 0, 0.03, 0)); be.add(faBox(0.06, 0.8, 0.6, M.brass, 0.22, 0.4, 0)); g.add(be); }
      g.add(faBox(0.7, 0.18, 0.03, M.paper, R.r(-4, 4), y - 0.1, 0.92)); } }   // shelf label tag
  // back wall (z 0): tall arched windows with frames, mullions, sill, radiator below; a notice board; card catalogue
  for (const cx of [-16, 16]) { const g = new THREE.Group(); g.position.set(cx, 0, 0.1); KW.add(g); const w = 5.2, y0 = 4.2, y1 = 11.2;
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, y1 - y0), M.glass); gl.position.set(0, (y0 + y1) / 2, 0.02); g.add(gl); const ar = new THREE.Mesh(new THREE.CircleGeometry(w / 2, 20, 0, Math.PI), M.glass); ar.position.set(0, y1, 0.02); g.add(ar);
    for (const sxx of [-1, 1]) g.add(rb(0.4, y1 - y0 + 0.2, 0.4, M.ironD, sxx * (w / 2 + 0.1), (y0 + y1) / 2, 0.2, 0)); const at = c3Mesh(new THREE.TorusGeometry(w / 2 + 0.1, 0.22, 6, 20, Math.PI), M.ironD, 0); at.position.set(0, y1, 0.2); g.add(at);
    g.add(faBox(0.14, y1 - y0 + w / 2, 0.14, M.ironD, 0, (y0 + y1 + w / 2) / 2, 0.15)); for (let k = 1; k < 4; k++) g.add(faBox(w, 0.14, 0.14, M.ironD, 0, y0 + k * (y1 - y0) / 4, 0.15));
    g.add(rb(w + 1.2, 0.35, 0.9, M.white, 0, y0 - 0.2, 0.4, 0)); const brick = c3Mesh(new THREE.TorusGeometry(w / 2 + 0.55, 0.32, 5, 20, Math.PI), M.rib, 0); brick.position.set(0, y1, 0.15); g.add(brick);
    for (let k = 0; k < 9; k++) g.add(cyl(0.16, 0.16, 2.6, M.iron, -2.0 + k * 0.5, 2.2, 0.5, 0, 8)); g.add(faBox(4.6, 0.14, 0.3, M.iron, 0, 1.0, 0.5)); g.add(faBox(4.6, 0.14, 0.3, M.iron, 0, 3.4, 0.5)); }
  { const g = new THREE.Group(); g.position.set(-6.5, 5.6, 0.15); KW.add(g); g.add(rb(5.4, 3.6, 0.2, M.woodD, 0, 0, 0, 0)); g.add(pl(5.0, 3.2, c3Prop('#c89a62', { rough: 0.95 }), 0, 0, 0.12));
    for (let k = 0; k < 9; k++) { const n = pl(R.r(0.8, 1.3), R.r(0.8, 1.2), c3Prop(['#f6ecd8', '#f6d84a', '#9ad8e8', '#f2a2b8', '#ffffff'][k % 5], { rough: 0.8 }), R.r(-2, 2), R.r(-1.1, 1.1), 0.14 + k * 0.004); n.rotation.z = R.n(0.15); g.add(n); g.add(cyl(0.07, 0.07, 0.06, M.red, n.position.x, n.position.y + 0.38, 0.17 + k * 0.004, 0, 6).rotateX(Math.PI / 2)); } }
  { const g = new THREE.Group(); g.position.set(-1.0, 0, 1.4); KS.add(g); g.add(rb(5.0, 4.4, 2.4, M.wood, 0, 2.4, 0, 0)); g.add(rb(5.3, 0.3, 2.6, M.woodD, 0, 4.7, 0, 0)); g.add(faBox(5.0, 0.4, 2.2, M.woodD, 0, 0.2, 0));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.add(rb(1.05, 0.85, 0.12, M.woodL, -1.8 + c * 1.2, 1.0 + r * 1.0, 1.22, 0)); g.add(faBox(0.4, 0.14, 0.06, M.brass, -1.8 + c * 1.2, 1.15 + r * 1.0, 1.3)); g.add(faBox(0.5, 0.2, 0.03, M.paper, -1.8 + c * 1.2, 0.85 + r * 1.0, 1.3)); }
    const gb = new THREE.Group(); gb.position.set(1.4, 4.85, 0); g.add(gb); gb.add(cyl(0.4, 0.5, 0.2, M.brass, 0, 0.1, 0, 0, 12)); gb.add(cyl(0.06, 0.06, 0.6, M.brass, 0, 0.45, 0, 0, 6)); }
  // rugs under the reading tables (bordered), a globe, two book carts, column brackets
  const rugT = (c1, c2) => tex((g, w, h) => { g.fillStyle = c2; g.fillRect(0, 0, w, h); g.fillStyle = c1; g.fillRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88); g.strokeStyle = c2; g.lineWidth = 8; g.strokeRect(w * 0.11, h * 0.11, w * 0.78, h * 0.78);
    g.fillStyle = c2; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(w / 2, h * (0.22 + k * 0.112), w * 0.2, h * 0.03, 0, 0, TAU); g.fill(); } const RR = RNG('farugt', c1); for (let i = 0; i < 3000; i++) { g.fillStyle = RR.f() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'; g.fillRect(RR.r(0, w), RR.r(0, h), 2, 2); } }, 512, 512);
  for (const [x, z, w, d, c1, c2] of [[-14, 41, 21, 17, '#2a5a8a', '#e8b84a'], [22, 62.5, 11, 17, '#1f6a6a', '#e8c86a']]) { const r = pl(w, d, c3Prop('#ffffff', { map: rugT(c1, c2), rough: 0.95 }), x, 0.025, z, 0, -Math.PI / 2); KS.add(r); }
  { const g = new THREE.Group(); g.position.set(-3.5, 0, 31); KS.add(g); for (const a of [0, 2.1, 4.2]) { const l = cyl(0.12, 0.08, 3.2, M.woodD, Math.cos(a) * 0.7, 1.5, Math.sin(a) * 0.7, 0, 6); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); g.add(l); }
    const gm = c3Mesh(new THREE.SphereGeometry(1.15, 20, 14), c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#3a8ac8'; x.fillRect(0, 0, w, h); x.fillStyle = '#7ab04a'; const RR = RNG('faglobe'); for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(RR.r(0, w), RR.r(h * 0.15, h * 0.85), RR.r(14, 46), RR.r(10, 34), RR.f() * 3, 0, TAU); x.fill(); } }, 256, 128), rough: 0.4 }), 0); gm.position.y = 4.3; gm.rotation.z = 0.4; g.add(gm);
    const mr = c3Mesh(new THREE.TorusGeometry(1.3, 0.07, 6, 30, Math.PI * 1.4), M.brass, 0); mr.position.y = 4.3; mr.rotation.set(0, Math.PI / 2, 0.4 - 0.7); g.add(mr); }
  for (const [x, z, ry] of [[-25, 58, 0.5], [7, 54, -0.3]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; KS.add(g); g.add(rb(3.4, 0.22, 1.6, M.woodL, 0, 3.6, 0, 0)); g.add(rb(3.4, 0.22, 1.6, M.woodL, 0, 1.8, 0, 0)); g.add(faBox(0.1, 1.2, 1.6, M.woodD, -1.7, 4.3, 0));
    for (const a of [-1.55, 1.55]) for (const b of [-0.7, 0.7]) { g.add(faBox(0.14, 3.5, 0.14, M.woodD, a, 1.95, b)); const w = cyl(0.26, 0.26, 0.16, M.dark, a, 0.26, b, 0, 10); w.rotation.x = Math.PI / 2; g.add(w); }
    for (const yb of [1.91, 3.71]) { let lx = -1.4; while (lx < 1.3) { const bw = R.r(0.2, 0.34), bh = R.r(0.9, 1.3), b = rb(bw, bh, 1.1, c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), lx + bw / 2, yb + bh / 2, 0, 0); b.rotation.z = R.f() < 0.15 ? 0.3 : 0; g.add(b); lx += bw + 0.04; } } }
  for (const z of [12, 24, 36, 48]) for (const sx of [-1, 1]) { const br = c3Mesh(new THREE.TorusGeometry(2.2, 0.16, 5, 14, Math.PI / 2), M.iron, 0); br.position.set(sx * 2.2, FA_SPR - 2.2, z); br.rotation.z = sx > 0 ? Math.PI / 2 : 0; KW.add(br); }
  // posters on the columns (z 24, 36) facing +z, and a 'SILENCE' hanging plate
  [[24, 0], [36, 2]].forEach(([z, k]) => { KW.add(pl(1.6, 2.2, c3Flat('#ffffff', { map: faTexPoster(k) }), 0, 6.5, z + 0.56)); });
  // kids' corner: a little striped tent, toy blocks, a low table with crayons + paper
  { const [rx, rz] = FA_RUG; const tent = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.2, 4, 1, true), c3Prop('#ffffff', { map: tex((g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f2efe6' : '#e84a5a'; g.fillRect(i * w / 8, 0, w / 8, h); } }, 256, 64), rough: 0.8, side: THREE.DoubleSide }));
    tent.position.set(rx + 6.6, 2.1, rz - 5.2); tent.rotation.y = 0.4; KS.add(tent); KS.add(cyl(0.12, 0.12, 0.8, M.woodL, rx + 6.6, 4.5, rz - 5.2, 0, 6));
    for (let k = 0; k < 7; k++) { const b = rb(0.55, 0.55, 0.55, c3Prop(['#e84a5a', '#f6d84a', '#3a9ad8', '#5ac06a'][k % 4], { rough: 0.5 }), rx - 4.6 + (k % 3) * 0.62 + R.n(0.1), 0.28 + (k > 4 ? 0.55 : 0), rz + 3.2 + Math.floor(k / 3) * 0.1, 0); b.rotation.y = R.n(0.5); KS.add(b); }
    const tb = new THREE.Group(); tb.position.set(rx - 4.4, 0, rz - 4.2); KS.add(tb); tb.add(cyl(1.5, 1.5, 0.2, M.woodL, 0, 1.6, 0, 0, 20)); for (const a of [0.6, 2.7, 4.8]) tb.add(cyl(0.1, 0.1, 1.5, M.woodD, Math.cos(a) * 1.1, 0.75, Math.sin(a) * 1.1, 0, 6));
    tb.add(pl(1.2, 0.9, M.paper, 0.2, 1.72, 0.1, 0.3, -Math.PI / 2)); for (let k = 0; k < 5; k++) { const c = cyl(0.05, 0.05, 0.7, c3Prop(['#e84a5a', '#3a9ad8', '#f6d84a', '#5ac06a', '#8a5ad8'][k], { rough: 0.5 }), -0.5 + k * 0.15, 1.75, -0.5, 0, 6); c.rotation.set(Math.PI / 2, 0, R.n(0.4)); tb.add(c); } }
  // chimney: iron hoops every 6 units + a lightning rod; kiln house arched firing doors
  { const [cx, cz] = FA_CHIM; for (let y = 18; y < 96; y += 6) { const r = 4.0 - (y / 100) * 1.6 + 0.08; const h = c3Mesh(new THREE.TorusGeometry(r, 0.12, 5, 32), M.ironD, 0); h.rotation.x = Math.PI / 2; h.position.set(cx, y, cz); KW.add(h); }
    KW.add(cyl(0.08, 0.08, 6, M.ironD, cx + 1.8, 104.5, cz, 0, 6)); KW.add(cyl(0.2, 0.05, 0.6, M.brass, cx + 1.8, 107.6, cz, 0, 6));
    for (let k = 0; k < 4; k++) { const a = c3Mesh(new THREE.CircleGeometry(1.6, 16, 0, Math.PI), M.dark, 0); a.position.set(cx - 7 + k * 4.6, 4.3, cz + 11.2); KW.add(a); const t = c3Mesh(new THREE.TorusGeometry(1.75, 0.22, 5, 16, Math.PI), M.rib, 0); t.position.set(cx - 7 + k * 4.6, 4.3, cz + 11.25); KW.add(t); } }
}
// ---- build
function faBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 3000), s = { scene, cam, p: {} }; FA.s0 = s;
  s.key = lights(scene, { amb: '#6a8ee0', ambI: 0.34, sky: '#a4caff', ground: '#a04a30', key: '#ffd6a8', keyI: 0.85, keyP: [30, 120, 60], rim: '#8ab0ff', rimI: 0.45, rimP: [-40, 40, -30] });   // v2 Ricks: warm key, cool blue fill + skylight rim
  scene.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.75; });
  FA.T = { brick: faTexBrick('a'), brickV: faTexBrick('v', '#d8783e'), floor: faTexFloor(), rug: faTexRug(), books: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => faTexBooks(i)),
    crateLbl: tex((g, w, h) => { g.fillStyle = '#c89a5a'; g.fillRect(0, 0, w, h); inked(g, 'ÇANKAYA', w / 2, h / 2 + 2, h * 0.6, '#2a4a7a', { stroke: false, maxW: w * 0.9 }); }, 256, 84) };
  const wood = texWood(); FA.M = { brick: c3Prop('#ffffff', { map: faRep(FA.T.brick, 1 / 8, 1 / 8), rough: 0.88 }), vault: c3Prop('#ffffff', { map: faRep(FA.T.brickV, 1 / 8, 1 / 8), rough: 0.9 }),
    rib: c3Prop('#c2683e', { rough: 0.85 }), iron: c3Prop('#2a7a78', { rough: 0.4, metal: 0.35 }), ironD: c3Prop('#1e4a4a', { rough: 0.45, metal: 0.4 }), brass: c3Prop('#d8a84a', { metal: 0.7, rough: 0.3 }),
    wood: c3Prop('#ffffff', { map: faRep(wood, 0.3, 0.3), rough: 0.7 }), woodD: c3Prop('#6a3a1e', { rough: 0.65 }), woodL: c3Prop('#c88a52', { rough: 0.6 }), shelf: c3Prop('#7a4524', { rough: 0.62 }),
    green: c3Prop('#1f7a4a', { rough: 0.25, env: 1.3 }), lampIn: c3Prop('#ffffff', { emissive: '#fff0c8', ei: 1.6, glow: '#ffe6a8' }), crate: c3Prop('#c8945a', { rough: 0.85 }), crateD: c3Prop('#9a6a3a', { rough: 0.85 }),
    roof: c3Prop("#ffffff", { map: faRep(faTexRoof(), 1 / 8, 1 / 8), rough: 0.85 }), white: c3Prop('#f0e8dc', { rough: 0.6 }), dark: c3Prop('#2a2226', { rough: 0.6 }), red: c3Prop('#c8323a', { rough: 0.5 }), teal: c3Prop('#2a9a9a', { rough: 0.5 }),
    leaf: c3Prop('#3a9a4a', { rough: 0.7 }), pot: c3Prop('#c86a3a', { rough: 0.7 }), glass: c3Prop('#bcd8ff', { emissive: '#a8c8ff', ei: 0.75, glow: '#cfe2ff' }), paper: c3Prop('#f2e8d4', { rough: 0.8 }) };
  const M = FA.M, KW = new THREE.Group(), KS = new THREE.Group(), KB = new THREE.Group(), KO = new THREE.Group(), F = new THREE.Group(), B = new THREE.Group(); scene.add(F); s.F = F; scene.add(B);   // v2: F (FOCUS) = people + held props + depth-only occluders only; static set pieces live on the BG layer (KW/KS baked, B dynamic)
  const brickPl = (w, h, x, y, z, ry = 0) => { const t = FA.T.brick.clone(); t.needsUpdate = true; faRep(t, w / 8, h / 8); const m = plNC(w, h, c3Prop('#ffffff', { map: t, rough: 0.88, side: THREE.DoubleSide }), x, y, z, ry); m.material.side = THREE.DoubleSide; return m; };
  // ---- sky + outside ground + backdrop (Ankara hills, low blocks)
  c3SkyDome(scene, { paint: true, zenith: '#6a9ae0', mid: '#a8c4f0', midH: 0.3, horizon: '#9cc6f2', glow: '#ffe2b0', glowK: 0.35, ground: '#7a9a50',   // v3: saturated horizon (review: milky band at 32 s)
    sun: [0.4, 0.5, 0.7], clouds: 40, cloudScale: 1.1, seed: 9, cloudLit: '#ffffff', cloudShade: '#a8a8d8', layer: C3.L_BG });
  { const gt = tex((g, w, h) => { const R = RNG('fagrass'); g.fillStyle = '#5a8a34'; g.fillRect(0, 0, w, h);   // v3: textured fields (was one flat green)
    for (let i = 0; i < 60; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 90), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, ['rgba(140,170,60,0.5)', 'rgba(60,110,40,0.5)', 'rgba(190,170,90,0.4)'][i % 3]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(30,60,20,0.18)' : 'rgba(220,240,150,0.12)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 3); }
    g.strokeStyle = 'rgba(200,170,120,0.55)'; g.lineWidth = 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(R.r(0, w), 0); g.bezierCurveTo(R.r(0, w), h * 0.3, R.r(0, w), h * 0.7, R.r(0, w), h); g.stroke(); } }, 512, 512);
  faRep(gt, 24, 24); scene.add(pl(4000, 4000, c3Prop('#ffffff', { map: gt, rough: 0.95 }), 0, -0.06, 0, 0, -Math.PI / 2)); }
  { const t = tex((g, w, h) => { const R = RNG('fayard'); g.fillStyle = "#3e3630"; g.fillRect(0, 0, w, h); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { g.fillStyle = c3Shd("#6a5a4c", R.r(0.8, 1.15)); g.beginPath(); g.roundRect(i * w / 16 + 2, j * h / 16 + 2, w / 16 - 4, h / 16 - 4, 5); g.fill(); } }, 512, 512); faRep(t, 30, 30);
    scene.add(pl(240, 240, c3Prop('#ffffff', { map: t, rough: 0.9 }), -10, -0.03, 50, 0, -Math.PI / 2)); }   // cobbled yard
  for (const [x, z, ry] of [[0, -260, 0], [-330, 50, Math.PI / 2], [330, 50, -Math.PI / 2], [0, 360, Math.PI]]) { const bd = c3Backdrop(scene, { origin: [0, 0, 0], dir: [0, -1], width: 200, near: 24, far: 420, rows: 4, horizon: '#8ab4e4', ground: '#6a8a48', cars: 0, lot: false, seed: 31 + x + z });
    scene.remove(bd); bd.traverse((m) => { const t = m.isMesh && m.material.map; if (t && t.encoding !== THREE.sRGBEncoding) { t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; } });
    bd.scale.setScalar(4.2); bd.position.set(x, 0.1, z); bd.rotation.y = ry; scene.add(faBake(bd, { ao: false, noCast: true })); }
  { const R = RNG('fahood'), cols = ['#f2a86a', '#e8806a', '#f0c048', '#8ac0d8', '#e89aa8', '#9ac87a'];   // v3: saturated (they read as blank white boxes)   // low Ankara blocks + trees around the yard (context for the roof shots)
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + R.n(0.1), r = R.r(95, 130), x = -10 + Math.cos(a) * r, z = 50 + Math.sin(a) * r, w = R.r(16, 26), h = R.r(14, 30), d = R.r(14, 22), c = cols[i % 6];
      const wt = tex((g, ww, hh) => { g.fillStyle = c; g.fillRect(0, 0, ww, hh); for (let j = 0; j < 6; j++) for (let k = 0; k < 5; k++) { g.fillStyle = '#6a8ab8'; g.fillRect(k * ww / 5 + 10, j * hh / 6 + 10, ww / 5 - 20, hh / 6 - 22); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(k * ww / 5 + 6, j * hh / 6 + hh / 6 - 12, ww / 5 - 12, 4); } }, 256, 256);
      const b = rb(w, h, d, c3Prop('#ffffff', { map: wt, rough: 0.8 }), x, h / 2, z, 0); b.rotation.y = -a; KO.add(b); const rf = rb(w + 1, 1.2, d + 1, c3Prop('#b84a32', { rough: 0.8 }), x, h + 0.6, z, 0); rf.rotation.y = -a; KO.add(rf); }
    for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), r = R.r(62, 140), x = -10 + Math.cos(a) * r, z = 50 + Math.sin(a) * r, sz = R.r(3.5, 6);
      KO.add(cyl(0.6, 0.8, sz * 1.2, c3Prop('#6a4a2a'), x, sz * 0.6, z, 0, 6)); const cr = c3Mesh(new THREE.SphereGeometry(sz, 10, 8), c3Prop(['#4a9a3a', '#3a8a4a', '#6aaa3a'][i % 3], { rough: 0.8 }), 0); cr.position.set(x, sz * 1.9, z); cr.scale.y = 0.85; KO.add(cr); } }
  // ---- the shell: floor, side walls, gables, twin vaults (inner brick, outer roof), ribs, crown skylight strips
  { const t = FA.T.floor; faRep(t, 64 / 16, 100 / 16); const f = pl(2 * FA_X, FA_Z, c3Prop('#ffffff', { map: t, rough: 0.55, env: 0.7 }), 0, 0, FA_Z / 2, 0, -Math.PI / 2); scene.add(f); }
  for (const sx of [-1, 1]) { scene.add(brickPl(FA_Z, FA_SPR + 0.5, sx * FA_X, (FA_SPR + 0.5) / 2, FA_Z / 2, -sx * Math.PI / 2)); }
  for (const z of [0, FA_Z]) { const t = FA.T.brick.clone(); t.needsUpdate = true; faRep(t, 1 / 8, 1 / 8); const m = new THREE.Mesh(faGable(), c3Prop('#ffffff', { map: t, rough: 0.88, side: THREE.DoubleSide })); m.position.z = z; m.userData.noCast = true; scene.add(m); }
  for (const cx of [-16, 16]) for (const [a0, a1] of [[0, Math.PI / 2 - FA_GAP], [Math.PI / 2 + FA_GAP, Math.PI]]) {
    const v = new THREE.Mesh(faArc(FA_R, cx, FA_SPR, 0, FA_Z, a0, a1, true), M.vault); v.userData.noCast = true; scene.add(v);
    const o = new THREE.Mesh(faArc(FA_R + 0.7, cx, FA_SPR, -0.6, FA_Z + 0.6, a0, a1, false), M.roof); o.userData.noCast = true; scene.add(o);
    for (const a of [a0, a1]) if (Math.abs(a - Math.PI / 2) < 0.5) { const c = Math.cos(a), sn = Math.sin(a); const lip = faBox(0.9, 1.2, FA_Z + 1.2, M.rib, cx + (FA_R + 0.35) * c, FA_SPR + (FA_R + 0.35) * sn + 0.3, FA_Z / 2); lip.userData.noCast = true; KO.add(lip); } }
  for (const cx of [-16, 16]) { for (let z = 2; z < FA_Z; z += 4) { const b = faBox(5.4, 0.3, 0.28, M.ironD, cx, FA_SPR + FA_R * Math.cos(FA_GAP) + 0.4, z); b.userData.noCast = true; KO.add(b); }   // skylight glazing bars (open strip between)
    for (const dx of [-2.6, 2.6]) { const b = faBox(0.3, 0.6, FA_Z, M.ironD, cx + dx, FA_SPR + FA_R * Math.cos(FA_GAP) + 0.4, FA_Z / 2); b.userData.noCast = true; KO.add(b); } }
  for (const z of [0, ...FA_RIBS, FA_Z]) for (const cx of [-16, 16]) { const r = c3Mesh(new THREE.TorusGeometry(FA_R - 0.55, 0.7, 6, 40, Math.PI), M.rib, 0); r.position.set(cx, FA_SPR, Math.min(FA_Z - 0.7, Math.max(0.7, z))); r.userData.noCast = true; KW.add(r);
    if (z > 0 && z < 70) { const tie = cyl(0.18, 0.18, 2 * FA_R, M.ironD, cx, FA_SPR - 0.2, z, 0, 8); tie.rotation.z = Math.PI / 2; tie.userData.noCast = true; KW.add(tie); for (const dx of [-8, 0, 8]) { const ro = cyl(0.45, 0.45, 0.2, M.brass, cx + dx, FA_SPR - 0.2, z, 0, 12); ro.rotation.x = Math.PI / 2; KW.add(ro); } } }
  // (v3: no tie-rods in the two bays by the entrance gable: the whip-in and the sign dive saw them as beams across the lens)
  // iron columns down the middle + pilasters on the walls
  for (const z of FA_RIBS) { if (z === 84 || z === 72 || z === 60) { for (const sx of [-1, 1]) KW.add(rb(1.4, FA_SPR, 1.6, M.rib, sx * (FA_X - 0.6), FA_SPR / 2, z, 0)); continue; } const c = new THREE.Group(); c.position.set(0, 0, z); KW.add(c);
    c.add(cyl(0.5, 0.5, FA_SPR - 1.2, M.iron, 0, (FA_SPR - 1.2) / 2 + 0.6, 0, 0, 16)); c.add(cyl(0.95, 1.05, 0.9, M.iron, 0, 0.45, 0, 0, 16)); c.add(cyl(1.2, 0.6, 1.0, M.iron, 0, FA_SPR - 0.4, 0, 0, 16)); c.add(cyl(0.62, 0.62, 0.25, M.brass, 0, 1.0, 0, 0, 16));
    for (const sx of [-1, 1]) { KW.add(rb(1.4, FA_SPR, 1.6, M.rib, sx * (FA_X - 0.6), FA_SPR / 2, z, 0)); } }
  // wall arches (recesses) holding the tall shelves: arch band + shelf unit in every bay of both walls
  const shelfUnit = (len, h, seed, rows = 6) => { const g = new THREE.Group(); g.add(faBox(len, h, 0.3, M.woodD, 0, h / 2, -0.75)); for (const sx of [-1, 1]) g.add(faBox(0.35, h, 1.8, M.shelf, sx * (len / 2 - 0.17), h / 2, 0));
    g.add(faBox(len, 0.4, 1.9, M.shelf, 0, h - 0.2, 0)); g.add(faBox(len, 0.6, 1.9, M.shelf, 0, 0.3, 0)); const rh = (h - 1.0) / rows;
    for (let r = 0; r < rows; r++) { const y = 0.6 + r * rh; if (r) g.add(faBox(len - 0.4, 0.18, 1.8, M.shelf, 0, y, 0)); const bk = pl(len - 0.7, rh - 0.25, c3Prop('#ffffff', { map: FA.T.books[(seed + r) % 8], rough: 0.7 }), 0, y + (rh - 0.25) / 2 + 0.1, 0.05); g.add(bk); }
    return g; };
  for (const sx of [-1, 1]) for (let b = 0; b < 8; b++) { const z0 = b * 12, zc = z0 + 6, x = sx * (FA_X - 1.05);
    const arch = c3Mesh(new THREE.TorusGeometry(5.0, 0.38, 5, 20, Math.PI), M.rib, 0); arch.position.set(sx * (FA_X - 0.15), 11, zc); arch.rotation.y = Math.PI / 2; KW.add(arch);
    if (sx > 0 && zc > 18 && zc < 48) continue;   // the hero shelf (3D spines) is built below
    if (sx < 0 && b === 7) continue;   // left front bay: crate pile
    const u = shelfUnit(10.4, 11, b * 3 + (sx > 0 ? 1 : 0)); u.position.set(x, 0, zc); u.rotation.y = -sx * Math.PI / 2; KS.add(u);
    if (b % 2 === 0) { const lad = new THREE.Group(); lad.position.set(x - sx * 1.1, 0, zc + 3.2); lad.rotation.z = sx * 0.16; for (const dz of [-0.6, 0.6]) lad.add(faBox(0.18, 11.6, 0.18, M.woodL, 0, 5.8, dz)); for (let k = 1; k < 11; k++) lad.add(faBox(0.12, 0.12, 1.2, M.woodL, 0, k * 1.05, 0)); KS.add(lad); } }
  // the hero shelf: right wall z 20..46, real 3D books (baked), 6 rows
  { const g = new THREE.Group(), len = 26, zc = 33, x = FA_X - 1.05, R = RNG('fahero'); g.position.set(x, 0, zc); g.rotation.y = -Math.PI / 2; KB.add(g);
    g.add(faBox(len, 11, 0.3, M.woodD, 0, 5.5, -0.75)); for (const lx of [-len / 2, -len / 6, len / 6, len / 2]) g.add(faBox(0.35, 11, 1.8, M.shelf, lx, 5.5, 0)); g.add(faBox(len, 0.4, 1.9, M.shelf, 0, 10.8, 0)); g.add(faBox(len, 0.6, 1.9, M.shelf, 0, 0.3, 0));
    for (let r = 0; r < 6; r++) { const y = 0.6 + r * 1.66; if (r) g.add(faBox(len - 0.3, 0.18, 1.8, M.shelf, 0, y, 0));
      let lx = -len / 2 + 0.3; while (lx < len / 2 - 0.4) { if (Math.abs(lx + len / 6) < 0.3 || Math.abs(lx - len / 6) < 0.3) { lx += 0.4; continue; }
        const bw = R.r(0.16, 0.36), bh = R.r(1.0, 1.45), bd = R.r(1.1, 1.5), c = FA_SPINE[R.i(0, FA_SPINE.length - 1)], b = faBox(bw, bh, bd, c3Prop(c, { rough: 0.6 }), lx + bw / 2, y + 0.09 + bh / 2, -0.55 + bd / 2);
        if (R.f() < 0.05) b.rotation.z = 0.25 * (R.f() < 0.5 ? 1 : -1); g.add(b);
        for (const yy of [0.18, bh - 0.22]) g.add(faBox(bw + 0.01, 0.06, 0.02, c3Prop(R.f() < 0.5 ? '#f2d27a' : '#f4ecd8', { rough: 0.4 }), lx + bw / 2, y + 0.09 + yy, -0.55 + bd + 0.005));
        if (R.f() < 0.45) g.add(faBox(bw * 0.7, 0.32, 0.02, c3Prop('#f4ecd8', { rough: 0.6 }), lx + bw / 2, y + 0.09 + bh * 0.55, -0.55 + bd + 0.006));
        lx += bw + 0.02; } } }
  // ---- back wall: lunette windows (cool sky glass with a fan of bars), clock, posters
  for (const cx of [-16, 16]) { const win = new THREE.Mesh(new THREE.CircleGeometry(9, 32, 0, Math.PI), M.glass); win.position.set(cx, FA_SPR + 2, 0.08); scene.add(win);
    for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI, bar = faBox(0.3, 9, 0.2, M.ironD, cx + Math.cos(a) * 4.5, FA_SPR + 2 + Math.sin(a) * 4.5, 0.2); bar.rotation.z = a - Math.PI / 2; KW.add(bar); }
    const ar = c3Mesh(new THREE.TorusGeometry(9.1, 0.4, 6, 30, Math.PI), M.ironD, 0); ar.position.set(cx, FA_SPR + 2, 0.2); KW.add(ar); KW.add(faBox(18.6, 0.5, 0.4, M.ironD, cx, FA_SPR + 2, 0.2)); }
  { const ck = pl(4, 4, c3Flat('#ffffff', { map: texClock() }), 0, 12.5, 0.12); scene.add(ck); KW.add(cyl(2.2, 2.2, 0.3, M.brass, 0, 12.5, 0.02, 0, 24).rotateX(Math.PI / 2)); }
  [[-26, 7, 0], [6, 9.5, 1], [26, 7, 2]].forEach(([x, y, k]) => { scene.add(pl(3.6, 5, c3Flat('#ffffff', { map: faTexPoster(k) }), x, y, 0.12)); });
  // ---- front wall: the big doors (closed, a warm transom)
  KW.add(rb(14, 12, 0.8, M.woodD, 16, 6, FA_Z - 0.3, 0)); KW.add(rb(14, 12, 0.8, M.woodD, -16, 6, FA_Z - 0.3, 0));
  // ---- reading tables (left nave) with green banker lamps
  s.lampL = [];
  for (const [tx, tz] of [[-19, 36], [-19, 46], [-9, 36], [-9, 46], [22, 58], [22, 67]]) { const g = new THREE.Group(); g.position.set(tx, 0, tz); KS.add(g);
    g.add(rb(7.5, 0.35, 3.6, M.wood, 0, 3.6, 0, 0)); g.add(rb(7.1, 0.12, 3.2, M.woodD, 0, 3.37, 0, 0)); for (const sz of [-1, 1]) g.add(faBox(6.6, 0.42, 0.12, M.woodD, 0, 3.2, sz * 1.45));   // top + edge band + aprons
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { g.add(cyl(0.2, 0.14, 3.0, M.woodD, sx * 3.25, 1.7, sz * 1.38, 0, 10)); g.add(cyl(0.24, 0.24, 0.3, M.woodD, sx * 3.25, 2.9, sz * 1.38, 0, 10)); g.add(cyl(0.17, 0.12, 0.2, M.brass, sx * 3.25, 0.1, sz * 1.38, 0, 8)); }
    g.add(faBox(6.4, 0.16, 0.16, M.woodD, 0, 0.9, 0)); for (const sx of [-1, 1]) g.add(faBox(0.16, 0.16, 2.6, M.woodD, sx * 3.25, 0.9, 0));
    for (const sx of [-1.8, 1.8]) { const l = new THREE.Group(); l.position.set(sx, 3.78, 0); g.add(l); l.add(cyl(0.45, 0.5, 0.18, M.brass, 0, 0.09, 0, 0, 12)); l.add(cyl(0.07, 0.07, 1.1, M.brass, 0, 0.7, 0, 0, 6));
      const sh = c3Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.7, 14, 1, false, 0, Math.PI), M.green, 0); sh.rotation.z = Math.PI / 2; sh.rotation.y = 0; sh.position.set(0, 1.3, 0); sh.scale.set(1, 1, 0.8); l.add(sh);
      const bulb = faBox(1.4, 0.06, 0.6, M.lampIn, 0, 1.08, 0); l.add(bulb); }
    const R = RNG('fatbl', tx * 7 + tz);
    for (const sz of [-1, 1]) for (const sx of [-2.2, 2.2]) { const ch = faChair(); ch.position.set(sx + R.n(0.25), 0, sz * (2.55 + R.r(0, 0.5))); ch.rotation.y = (sz > 0 ? Math.PI : 0) + R.n(0.25); g.add(ch); }
    for (let k = 0; k < 2; k++) { let y = 3.78; const bx = (k ? 1 : -1) * R.r(0.4, 1.0), bz = R.n(0.8); for (let q = 0; q < R.i(1, 4); q++) { const b = rb(1.3, 0.26, 1.0, c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), bx, y + 0.13, bz, 0); b.rotation.y = R.n(0.4); g.add(b); y += 0.26; } }   // stacks
    { const ob = faFlatBook(FA_SPINE[R.i(0, 11)]); ob.position.set(R.r(-1.6, 1.6), 3.78, sz0(R)); ob.rotation.y = R.n(0.5); g.add(ob); }
    if (R.f() < 0.6) { const m = mug(['#f0e8dc', '#e84a5a', '#3a9ad8'][R.i(0, 2)], R.r(-3, 3), 3.78, R.n(1.1)); m.scale.setScalar(0.65); g.add(m); }
    if (tz > 50 && tx > 15) continue; const pl2 = new THREE.PointLight('#ffd890', 1.3, 16, 2); pl2.position.set(tx, 5.2, tz); pl2.layers.enableAll(); scene.add(pl2); s.lampL.push(pl2); }
  // ---- the LIBRARY sign: hinged on the tie at z 48 (left nave), swings down into place on "library"
  s.signPiv = new THREE.Group(); s.signPiv.position.set(FA_SIGN[0], FA_SPR - 0.4, FA_SIGN[1]); B.add(s.signPiv);
  { const bd = new THREE.Group(); bd.position.y = -2.6; s.signPiv.add(bd);
    bd.add(rb(12.6, 3.9, 0.5, M.woodD, 0, 0, 0, 0)); const face = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), c3Flat('#ffffff', { map: tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8343a'); gr.addColorStop(1, '#a82230'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.lineWidth = 10; g.strokeStyle = '#f2c860'; g.strokeRect(14, 14, w - 28, h - 28); inked(g, 'LIBRARY', w / 2, h * 0.53, h * 0.62, '#fff4dc', { stroke: '#5a1418', sw: h * 0.05, maxW: w * 0.86 }); }, 1024, 290) }));
    face.position.z = 0.27; face.material.toneMapped = false; bd.add(face); const bk = face.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.27; bd.add(bk);
    for (const sx of [-1, 1]) { bd.add(cyl(0.06, 0.06, 1.9, M.brass, sx * 5.2, 2.9, 0, 0, 6)); bd.add(cyl(0.25, 0.25, 0.2, M.brass, sx * 5.2, 1.95, 0, 0, 10)); } }
  // ---- the crate pile (left front bay) where the collectors set their crates down
  { const R = RNG('fapile'); [[-27.5, 0, 82], [-27.5, 1.9, 82.4], [-24, 0, 84], [-27.2, 0, 87.5], [-23.5, 1.9, 84.2], [-27.4, 3.8, 82.2]].forEach(([x, y, z], i) => { const c = faCrate('p' + i); c.position.set(x, y, z); c.rotation.y = R.n(0.2) + Math.PI / 2; KS.add(c); });
    for (let k = 0; k < 5; k++) { let y = 0; const st = new THREE.Group(); st.position.set(-21 + R.n(1.2), 0, 89 + k * 1.6); for (let q = 0; q < R.i(4, 9); q++) { const b = faBox(R.r(1.1, 1.5), 0.3, R.r(0.8, 1.1), c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), R.n(0.1), y + 0.15, 0); b.rotation.y = R.n(0.25); st.add(b); y += 0.3; } KB.add(st); } }
  s.crates = ['hero', 'cowork', 'FAa'].map((w, i) => { const c = faCrate('c' + i, FA_CR.w, FA_CR.h, FA_CR.d); F.add(c); return c; });
  // ---- kids' corner (right nave): round rug, beanbags, low curved shelves of picture books, a paper-star garland, banner
  { const [rx, rz] = FA_RUG; const rug = new THREE.Mesh(new THREE.CircleGeometry(7.2, 48), c3Prop('#ffffff', { map: FA.T.rug, rough: 0.95 })); rug.rotation.x = -Math.PI / 2; rug.position.set(rx, 0.03, rz); scene.add(rug);
    const bean = (x, z, c, r = 1.6) => { const b = c3Mesh(new THREE.SphereGeometry(r, 20, 14), c3Prop(c, { rough: 0.55 }), 0); b.scale.set(1.15, 0.62, 1.05); b.position.set(x, r * 0.6, z); KS.add(b); const d = c3Mesh(new THREE.SphereGeometry(r * 0.55, 14, 10), c3Prop(c3Shd(c, 0.85), { rough: 0.55 }), 0); d.scale.set(1.3, 0.9, 0.6); d.position.set(x, r * 1.0, z - r * 0.62); KS.add(d); return b; };
    bean(FA_HERO[0], FA_HERO[1] - 0.3, '#3a6ad8', 1.9); bean(FA_KID[0], FA_KID[1] - 0.2, '#f2a23a', 1.35); bean(21.5, 44.5, '#5ac06a', 1.3); bean(9.6, 44.2, '#e84a8a', 1.3);
    // a low bench for the coworker's family
    KS.add(rb(5.4, 0.45, 1.8, M.woodL, (FA_MUM[0] + FA_CO[0]) / 2, 2.3, FA_MUM[1] - 0.2, 0)); for (const sx of [-2.3, 2.3]) for (const sz of [-0.6, 0.6]) KS.add(faBox(0.25, 2.1, 0.25, M.woodD, (FA_MUM[0] + FA_CO[0]) / 2 + sx, 1.05, FA_MUM[1] - 0.2 + sz));
    for (let k = 0; k < 5; k++) { const a = -0.75 + k * 0.375, x = rx + Math.sin(a) * 9.4, z = rz - Math.cos(a) * 9.4, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -a; KS.add(g);
      g.add(faBox(3.6, 3.4, 1.2, M.woodL, 0, 1.7, 0)); g.add(faBox(3.4, 0.14, 1.1, M.woodD, 0, 1.7, 0.08));
      for (let q = 0; q < 2; q++) for (let r = 0; r < 2; r++) { const cv = pl(1.0, 1.3, c3Prop('#ffffff', { map: faTexCover({ c: FA_SPINE[(k * 4 + q * 2 + r) % 12], title: ['ABC', 'MOON', 'CATS', 'STARS', 'BOATS', 'TREES', 'BEARS', 'RAIN'][(k + q * 2 + r) % 8], pic: 'moon' }), rough: 0.6 }), -0.8 + q * 1.6, 0.95 + r * 1.65, 0.62); cv.rotation.x = -0.12; g.add(cv); } }
    { const bn = pl(10, 1.6, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f6d84a'; g.beginPath(); g.roundRect(0, 0, w, h, 40); g.fill(); g.lineWidth = 10; g.strokeStyle = '#e84a5a'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 34); g.stroke(); inked(g, "KIDS' CORNER", w / 2, h * 0.54, h * 0.56, '#3a6ad8', { stroke: '#ffffff', sw: h * 0.06, maxW: w * 0.86 }); }, 1024, 164) }), rx, 10.2, rz - 9.8); KS.add(bn);
      for (const sx of [-5.6, 5.6]) KS.add(faBox(0.3, 11, 0.3, M.woodL, rx + sx, 5.5, rz - 9.9)); }
    // the paper-star garland: two strings hanging in catenaries between the poles, coloured stars
    s.stars = []; for (const [y0, dz, sag] of [[9.2, -9.6, 1.6], [8.3, -9.0, 2.0]]) { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, x = rx - 5.6 + 11.2 * u, y = y0 - sag * 4 * u * (1 - u); pts.push(V3(x, y, rz + dz)); }
      const str = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.04, 4), M.white); KS.add(str);
      for (let i = 1; i < 12; i++) { const p = pts[i * 2], st = new THREE.Mesh(new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + Math.PI / 2, r = k % 2 ? 0.2 : 0.48; k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return sh; })()), c3Prop(['#f6d84a', '#e84a5a', '#3a9ad8', '#5ac06a', '#f2a23a', '#ffffff'][(i + (dz > -9.3 ? 3 : 0)) % 6], { rough: 0.7, side: THREE.DoubleSide }));
        st.position.set(p.x, p.y - 0.55, p.z); B.add(st); s.stars.push([st, i]); } }
    // a big potted plant + a little tent
    for (const [x, z] of [[24.8, 46.5], [7.2, 35]]) { KS.add(cyl(0.9, 0.7, 1.6, M.pot, x, 0.8, z, 0, 12)); const R = RNG('faplant', x); for (let k = 0; k < 9; k++) { const lf = c3Mesh(new THREE.SphereGeometry(0.9, 8, 6), M.leaf, 0); lf.scale.set(0.45, 0.16, 1.2); const a = k / 9 * TAU; lf.position.set(x + Math.cos(a) * 0.8, 2.4 + R.r(0, 1.6), z + Math.sin(a) * 0.8); lf.rotation.set(R.n(0.5), -a, 0.6); KS.add(lf); } } }
  // ---- the book cart with the dented, coffee-ringed book (end of the hero shelf)
  { const [cx, cz] = FA_CART, g = new THREE.Group(); g.position.set(cx, 0, cz); KS.add(g);
    g.add(rb(3.2, 0.25, 2.0, M.woodL, 0, 4.0, 0, 0)); g.add(rb(3.2, 0.25, 2.0, M.woodL, 0, 2.2, 0, 0)); for (const sx of [-1.45, 1.45]) for (const sz of [-0.85, 0.85]) g.add(faBox(0.16, 3.9, 0.16, M.woodD, sx, 2.15, sz));
    for (const sx of [-1.45, 1.45]) for (const sz of [-0.85, 0.85]) { const w = cyl(0.25, 0.25, 0.2, M.dark, sx, 0.25, sz, 0, 10); w.rotation.z = Math.PI / 2; g.add(w); }
    const R = RNG('facart'); let x = -1.3; while (x < 1.2) { const bw = R.r(0.22, 0.36), bh = R.r(1.1, 1.5); const b = faBox(bw, bh, 1.3, c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), x + bw / 2, 2.32 + bh / 2, 0); g.add(b); x += bw + 0.03; }
    s.dent = new THREE.Group(); s.dent.position.set(0.1, 4.13, 0.05); s.dent.rotation.y = -0.35; g.add(s.dent);
    s.dent.add(faBox(1.5, 0.12, 1.95, c3Prop('#f4ecd8', { rough: 0.8 }), 0, 0.12, 0)); s.dent.add(faBox(1.6, 0.06, 2.05, c3Prop('#2a5a8a', { rough: 0.6 }), 0, 0.03, 0));
    const cv = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.05), c3Flat('#ffffff', { map: faTexCover({ c: '#2a5a8a', title: 'POEMS', ring: true, dent: true, band: '#f2e2b0' }) })); cv.rotation.x = -Math.PI / 2; cv.position.y = 0.19; s.dent.add(cv);
    const mugM = mug('#f0e8dc', 1.0, 4.13, 0.6); mugM.scale.setScalar(0.7); g.add(mugM); }
  // ---- the librarian desk + the BOOKS flip counter
  { const [dx, dz] = FA_DESK, g = new THREE.Group(); g.position.set(dx, 0, dz); KS.add(g);
    g.add(rb(20, 0.4, 4.0, M.woodL, 0, 4.2, 0, 0)); g.add(rb(20, 4.0, 0.4, M.wood, 0, 2.0, 1.8, 0)); for (const sx of [-1, 1]) g.add(rb(0.4, 4.0, 4.0, M.wood, sx * 9.8, 2.0, 0, 0));
    for (let k = 0; k < 6; k++) g.add(faBox(2.6, 2.6, 0.08, M.woodD, -8 + k * 3.2, 2.2, 2.02));
    const st = rb(1.8, 0.3, 1.4, M.dark, 4.5, 4.55, 0.4, 0); g.add(st); g.add(cyl(0.3, 0.3, 1.0, M.red, 4.5, 5.2, 0.4, 0, 10));   // stamp
    const R = RNG('fadesk'); for (let k = 0; k < 2; k++) { let y = 4.4; for (let q = 0; q < 5; q++) { const b = faBox(1.4, 0.32, 1.0, c3Prop(FA_SPINE[R.i(0, 11)], { rough: 0.6 }), 7.2 + k * 1.6 + R.n(0.08), y + 0.16, 0.2); b.rotation.y = R.n(0.2); g.add(b); y += 0.32; } }
    g.add(cyl(0.55, 0.45, 0.9, M.pot, -1.0, 4.85, -0.6, 0, 10)); for (let k = 0; k < 6; k++) { const lf = c3Mesh(new THREE.SphereGeometry(0.5, 8, 6), M.leaf, 0); lf.scale.set(0.4, 0.15, 1.1); const a = k / 6 * TAU; lf.position.set(-1.0 + Math.cos(a) * 0.4, 5.6, -0.6 + Math.sin(a) * 0.4); lf.rotation.set(0.3, -a, 0.6); g.add(lf); }
    const bell = c3Mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, TAU, 0, Math.PI / 2), M.brass, 0); bell.position.set(2.6, 4.4, 1.0); g.add(bell); }
  { const [cx, cz] = FA_CNT; s.cnt = canvasTex(1024, 470); s.cntM = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 3.76), c3Flat('#ffffff', { map: s.cnt.t })); s.cntM.material.toneMapped = false; s.cntM.position.set(cx, 6.75, cz + 0.36); B.add(s.cntM);
    KS.add(rb(8.6, 4.1, 0.6, M.ironD, cx, 6.75, cz, 0)); KS.add(rb(2.4, 0.4, 1.4, M.ironD, cx, 4.6, cz, 0)); KS.add(faBox(0.5, 0.6, 0.5, M.ironD, cx, 4.5, cz)); }
  // ---- pendant lamps (enamel shades on rods) over the naves + floor lamps
  s.pend = []; for (const [x, z] of [[-14, 30], [-14, 54], [-24, 66], [16, 28], [22, 20], [-8, 66], [8, 66]]) { const g = new THREE.Group(); g.position.set(x, 0, z); KO.add(g); g.add(cyl(0.05, 0.05, 12, M.ironD, 0, 19.5, 0, 0, 4));
    const sh = c3Mesh(new THREE.ConeGeometry(1.3, 1.1, 18, 1, true), c3Prop('#1f6a5a', { rough: 0.35, side: THREE.DoubleSide }), 0); sh.position.y = 13.4; g.add(sh); const bl = c3Mesh(new THREE.SphereGeometry(0.42, 10, 8), M.lampIn, 0); bl.position.y = 13.0; g.add(bl); }
  for (const [x, z] of [[-16, 30], [16, 62.5], [22, 18], [-20, 64]]) { const l = new THREE.SpotLight('#ffd8a0', 1.6, 34, 0.9, 0.9, 1.4); l.position.set(x, 12.8, z); l.target.position.set(x, 0, z); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  // ---- outside: kiln house + the chimney (tapered brick, bands, crown, iron ladder), ridge of the factory roofs
  { const [cx, cz] = FA_CHIM; KO.add(brickPl(22, 12, cx, 6, cz + 11)); KO.add(brickPl(22, 12, cx, 6, cz - 11)); KO.add(brickPl(22, 12, cx - 11, 6, cz, Math.PI / 2)); KO.add(brickPl(22, 12, cx + 11, 6, cz, Math.PI / 2));
    { const r = rb(23, 0.8, 23, M.roof, cx, 12.2, cz, 0); KO.add(r); for (let k = 0; k < 4; k++) { const a = rb(3.2, 3.4, 0.3, M.dark, cx - 7 + k * 4.6, 2.6, cz + 11.1, 0); KO.add(a); } }
    const t = FA.T.brick.clone(); t.needsUpdate = true; faRep(t, 3, 12); const ch = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 4.0, 100, 24, 1, true), c3Prop('#ffffff', { map: t, rough: 0.9, side: THREE.DoubleSide })); ch.position.set(cx, 50, cz); ch.userData.noCast = true; scene.add(ch);
    for (const y of [70, 88, 97]) { const b = cyl(3.25 - (y - 70) * 0.0, 3.25, 1.1, M.rib, cx, y, cz, 0, 24); b.scale.setScalar(1 - y * 0.0028); KO.add(b); }
    KO.add(cyl(3.0, 2.6, 2.4, M.rib, cx, 100.5, cz, 0, 24)); const top = new THREE.Mesh(new THREE.CircleGeometry(2.3, 20), c3Prop('#2a2226')); top.rotation.x = -Math.PI / 2; top.position.set(cx, 101.6, cz); KO.add(top);
    for (let y = 14; y < 98; y += 1.4) { const k = 4.0 - (y / 100) * 1.6; KO.add(faBox(1.0, 0.1, 0.1, M.ironD, cx + 0.0, y, cz + k + 0.35)); } for (const dx of [-0.5, 0.5]) { const r = faBox(0.12, 86, 0.12, M.ironD, cx + dx, 56, cz + 3.25); r.rotation.x = -0.016; KO.add(r); }
    // a white painted date band near the top
    const date = new THREE.Mesh(new THREE.CylinderGeometry(2.86, 2.9, 4.2, 32, 1, true, -0.15, 1.8), c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#efe4cf'; g.fillRect(0, 0, w, h); inked(g, 'TUĞLA', w / 2, h / 2 + 4, h * 0.8, '#a83a2a', { stroke: false, maxW: w * 0.8 }); }, 512, 128), rough: 0.8 })); date.position.set(cx, 80, cz); KO.add(date); }
  // ---- cool skylight shafts with dust + a few floor plants
  s.dust = (() => { const n = 260, R = RNG('fadust'), pos = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { const cx = R.f() < 0.5 ? -16 : 16; base.push([cx + R.n(3.5), R.r(2, 28), R.r(6, 96), R.f() * TAU]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dot = c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32);
    const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#e4ecff', map: dot, size: 0.2, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    m.userData.noInk2 = true; m.userData.noCast = true; m.userData.noShade = true; scene.add(m);
    m.userData.tick = (t) => { base.forEach(([x, y, z, ph], i) => { pos[i * 3] = x + 0.5 * Math.sin(t * 0.35 + ph); pos[i * 3 + 1] = y + 0.6 * Math.sin(t * 0.22 + ph * 2); pos[i * 3 + 2] = z + 0.5 * Math.cos(t * 0.27 + ph); }); geo.attributes.position.needsUpdate = true; }; return m; })();
  for (const [x, z] of [[-30, 30], [-30, 66], [29.6, 60], [-6, 22]]) { KS.add(cyl(1.0, 0.8, 1.8, M.pot, x, 0.9, z, 0, 12)); const R = RNG('fapl', x * 3 + z); for (let k = 0; k < 10; k++) { const lf = c3Mesh(new THREE.SphereGeometry(1.0, 8, 6), M.leaf, 0); lf.scale.set(0.45, 0.16, 1.4); const a = k / 10 * TAU; lf.position.set(x + Math.cos(a) * 0.9, 2.6 + R.r(0, 2.2), z + Math.sin(a) * 0.9); lf.rotation.set(R.n(0.5), -a, 0.7); KS.add(lf); } }
  // the open picture books (hero reads to the kid; the kid's own book; the mum's book)
  s.book1 = faOpenBook('#e84a5a', true, 0.95); F.add(s.book1); s.book2 = faOpenBook('#3a9ad8', true, 0.62); F.add(s.book2); s.book3 = faOpenBook('#5ac06a', false, 0.62); F.add(s.book3);
  faDetail(s, KW, KS);
  for (const K of [KW, KS, KB]) scene.add(faBake(K)); scene.add(faBake(KO, { noCast: true, ao: false }));
  c3Layer(F, C3.L_FOCUS);
  for (const k of ['hero', 'cowork', 'kid', 'FAa', 'FAb', 'FAmum']) toonPerson(s, k);
  haze(scene, "#86b4ea", 0.0008);   // v3: thinner, bluer haze (the field read milky at 32 s)
  c3Env(scene, { top: '#cfe0ff', mid: '#b87a5a', bot: '#4a2a20' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  const shafts = []; for (const cx of [-16, 16]) for (const z of [18, 42, 66, 88]) shafts.push([[cx, 32, z - 4], [cx + 3, 0, z + 6], 2.2, 5, '#bcd4ff', 0.1]);
  c3SetLook(scene, { grime: 0.9, scale: 0.5, inkSet: false, bounce: ['#a8c0ff', '#c86a3a', 0.12], lights: [[0, 10, 40, '#ffc890', 1.0, 50], [16, 9, 40, '#ffd0a0', 1.1, 26], [12, 9, 14, '#ffd8a8', 1.0, 24]], shafts });
  for (const cx of [-16, 16]) for (const z of [24, 60, 84]) { const l = new THREE.SpotLight('#b8d0ff', 1.5, 60, 0.32, 0.7, 1.0); l.position.set(cx, 34, z - 4); l.target.position.set(cx + 3, 0, z + 6); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  for (const cx of [-16, 16]) for (const z of [18, 50, 82]) { const l = new THREE.PointLight('#9ccaff', 0.7, 44, 1.6); l.position.set(cx, 27, z); l.layers.enableAll(); scene.add(l); }   // v2: cool skylight bounce inside the vaults (cool shadows on the terracotta)
  faOccluders(scene);   // after c3SetLook / c3ShadeScene (they would re-material the depth-only stand-ins)
  return s;
}
// depth-only stand-ins on the FOCUS layer (BRIEF_v2 render layers): the vault shells, side walls and gables hide the
// people from outside (the crane over the roofs sees them only through the open skylight strips), the desk hides the
// librarian's legs, the columns hide whoever walks behind them. The BG copies show through where a card is hidden.
function faOccluders(scene) { const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }), L = [];
  for (const cx of [-16, 16]) for (const [a0, a1] of [[0, Math.PI / 2 - FA_GAP], [Math.PI / 2 + FA_GAP, Math.PI]]) L.push(new THREE.Mesh(faArc(FA_R, cx, FA_SPR, 0, FA_Z, a0, a1, true), M));
  for (const z of [0, FA_Z]) { const g = new THREE.Mesh(faGable(), M); g.position.z = z; L.push(g); }
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(FA_Z, FA_SPR + 0.5), M); w.position.set(sx * FA_X, (FA_SPR + 0.5) / 2, FA_Z / 2); w.rotation.y = Math.PI / 2; L.push(w); }
  { const d = new THREE.Mesh(new THREE.BoxGeometry(20, 4.4, 4.0), M); d.position.set(FA_DESK[0], 2.2, FA_DESK[1]); L.push(d); }
  for (const [tx, tz] of [[-19, 36], [-19, 46], [-9, 36], [-9, 46], [22, 58], [22, 67]]) { const top = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.8, 3.5), M); top.position.set(tx, 3.4, tz); L.push(top);   // reading tables (people behind them)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.0, 0.3), M); lg.position.set(tx + sx * 3.25, 1.5, tz + sz * 1.38); L.push(lg); } }
  for (const z of [12, 24, 36, 48]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, FA_SPR, 10), M); c.position.set(0, FA_SPR / 2, z); L.push(c); }
  for (const z of [0, ...FA_RIBS, FA_Z]) for (const cx of [-16, 16]) { const r = new THREE.Mesh(new THREE.TorusGeometry(FA_R - 0.55, 0.7, 6, 40, Math.PI), M); r.position.set(cx, FA_SPR, Math.min(FA_Z - 0.7, Math.max(0.7, z))); L.push(r);
    if (z > 0 && z < 70) { const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2 * FA_R, 8), M); tie.rotation.z = Math.PI / 2; tie.position.set(cx, FA_SPR - 0.2, z); L.push(tie); } }
  for (const cx of [-16, 16]) { for (let z = 2; z < FA_Z; z += 4) { const b = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 0.28), M); b.position.set(cx, FA_SPR + FA_R * Math.cos(FA_GAP) + 0.4, z); L.push(b); } }
  for (const m of L) { Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); scene.add(m); }
  for (const [st] of FA.s0.stars) { const o = new THREE.Mesh(st.geometry, M); Object.assign(o.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); o.renderOrder = -5; c3Layer(o, C3.L_FOCUS); st.add(o); }
  { const o = new THREE.Mesh(new THREE.BoxGeometry(12.6, 3.9, 0.5), M); Object.assign(o.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); o.renderOrder = -5; c3Layer(o, C3.L_FOCUS); FA.s0.signPiv.children[0].add(o); } }
const FA_get = () => FA.s ||= faBuild();
SETS.factory = FA_get;

// ---- people
// the collectors' walk: x(t) for one walker (v units/s, decelerates over the last 2 units)
function faWalkD(t, t0, L, v) { const T1 = (L - 2) / v, tt = t - t0; if (tt <= 0) return 0; if (tt <= T1) return v * tt; const T2 = 4 / v, u = Math.min(1, (tt - T1) / T2); return L - 2 + 2 * (1 - (1 - u) * (1 - u)); }
const FA_WALK = { hero: { x0: 17, x1: -7, z: 77.6, v: 5.0 }, cowork: { x0: 23, x1: -1.6, z: 80.6, v: 5.0 }, FAa: { x0: 29, x1: 4.2, z: 75.2, v: 5.0 } };
// v2 carry (user: "the crates pass through their bodies, glitchy"): the crate is held IN FRONT of the torso, hands on its
// sides. Every frame: crate yawed toward the camera (+ a 3/4 turn), scaled so its sides land on the two hands, pushed toward
// the camera by its own half-depth so the card plane never cuts it, hands drawn over it (gripDot). It rides the hands, so it
// shares the walk bob and lean. On arrival it is dropped in front (short fall + tiny bounce), arms release -> hands on hips.
const FA_CR = { w: 2.3, h: 1.45, d: 1.4, del: 0.22 };
function faCollectors(s, t) {
  ['hero', 'cowork', 'FAa'].forEach((who, i) => { const W2 = FA_WALK[who], L = W2.x0 - W2.x1, d = faWalkD(t, FA_ARRIVE, L, W2.v), x = W2.x0 - d, arr = FA_ARRIVE + (L - 2) / W2.v + 4 / W2.v, c = s.crates[i];
    const fl = V3(W2.x1 - 2.1, 0, W2.z + 0.5), ry0 = Math.PI / 2 + 0.3 - 0.25 * i, tD = arr - 0.12 + 0.07 * i, walking = d < L - 0.02;
    if (who !== 'FAa' && t >= FA_HOME) { c.visible = true; c.scale.set(1, 1, 1); c.position.copy(fl); c.rotation.set(0, ry0, 0); return; }
    const carry = { h: [0.3, 0.5], pole: [1, 0.55], hand: 'grip', front: true }, rel = { h: [0.42, 0.46], pole: [1, 0.4], hand: 'open', front: true };
    const hk = [[0, carry], [tD, rel], [tD + 0.42, 'hip'], [tD + 2.2 + 0.4 * i, 'down']];
    const moveDir = faceTo(s.cam, x, W2.z, x - 5, W2.z), ex = [['hero', 'happy', 'grin'], ['cowork', 'strain', 'laugh'], ['FAa', 'determined', 'happy']][i];
    const o = { mode: walking ? 'walk' : 'stand', phase: d / 4.2, stride: 4.2, stop: clamp((d - (L - 2)) / 2), hand: { L: hk, R: hk },
      expr: [[0, ex[1]], [tD + 0.05, ex[2]], [tD + 1.1, 'smile']], gaze: [walking ? (moveDir > 0 ? 0.4 : -0.4) : 0.2, 0.15] };
    if (walking) o.facing = moveDir; else o.look = [fl.x - 3 + 2 * i, fl.z + 5];   // stopped: turned toward the camera side, follows the orbit
    if (!walking && t > tD + 0.3 && t < tD + 0.75) o.lean = -0.06 * Math.sin(Math.PI * (t - tD - 0.3) / 0.45);   // follow-through after the drop
    pose(s, who, t, x, W2.z, o);
    const p = s.p[who], a = c3ToonHandWorld(p, 'L'), b = c3ToonHandWorld(p, 'R'); c.visible = true;
    if (!a || !b) { c.scale.set(1, 1, 1); c.position.copy(fl); c.rotation.set(0, ry0, 0); return; }
    const mid = a.clone().add(b).multiplyScalar(0.5), dc = s.cam.position.clone().sub(mid).normalize(), del = FA_CR.del * (i % 2 ? 1 : -1);
    const sx = clamp((a.distanceTo(b) * 0.9 - FA_CR.d * Math.abs(Math.sin(del))) / (FA_CR.w * Math.cos(del)), 0.8, 1.2);
    const ext = (FA_CR.w * sx / 2) * Math.abs(Math.sin(del)) + (FA_CR.d / 2) * Math.cos(del) + 0.14;
    const held = mid.clone().addScaledVector(dc, ext); held.y = mid.y - FA_CR.h * 0.55; const ryH = Math.atan2(dc.x, dc.z) + del;
    const u = clamp((t - tD) / 0.24);
    if (u <= 0) { c.scale.set(sx, 1, 1); c.position.copy(held); c.rotation.set(0, ryH, 0); gripDot(s, who, 'L'); gripDot(s, who, 'R'); return; }
    const e = u * u, bounce = 0.16 * hopAt(t, tD + 0.24, 0.16); c.scale.set(sx + (1 - sx) * e, 1, 1);
    c.position.set(held.x + (fl.x - held.x) * e, held.y * (1 - e) + bounce, held.z + (fl.z - held.z) * e); c.rotation.set(0, ryH + (ry0 - ryH) * e, 0); });
}
function faKidsCorner(s, t) {
  const home = t >= FA_HOME, tw = (w) => wAfter(w, 43.7, 45), talk = t > 43.78 && t < 46.0 ? 0.6 : 0;
  // the kid on her beanbag: her own book before the hero arrives, then she leans on his reading
  const toCam = (P) => [P[0] - 3, P[1] + 7];   // v2: 'look' points (bodies turn with the orbit): toward the open side where the camera is
  pose(s, 'kid', t, ...FA_KID, { sit: 1, seat: 1.45, look: home ? (t > tw('only') && t < tw('families') ? toCam(FA_KID) : FA_HERO) : toCam(FA_KID), squash: home ? 0.35 * hopAt(t, tw('workers'), 0.3) : 0, expr: home ? [[0, 'happy'], [tw('workers'), 'laugh'], [tw('families'), 'happy']] : 'happy', gaze: home ? [-0.7, 0.3] : [-0.2, 0.2], browK: 0.6,   // v3: lifted brows merged into a dark blob under the ponytail hairline
    hand: home ? { L: 'lap', R: [[0, 'lap'], [tw('only'), { h: [-0.45, 0.25], pole: [1, 0.5], hand: 'point' }], [tw('families'), 'lap']] } : { L: 'lap', R: { h: [0.3, -0.05], pole: [1, 0.5], hand: 'grip', front: true } } });   // v3: the L 'grip' hand was drawn on her forehead (the review's 'dark mark')
  if (!home) { gripProp(s, s.book2, 'kid', 'R', s.book2.userData.grip, { behind: -0.15, ry: Math.atan2(s.cam.position.x - FA_KID[0], s.cam.position.z - FA_KID[1]), rx: -0.4 }); gripDot(s, 'kid', 'R'); }
  else { s.book2.visible = true; s.book2.position.set(FA_KID[0] + 1.6, 0.25, FA_KID[1] + 1.2); s.book2.rotation.set(-Math.PI / 2, 0, 0.4); }
  // the coworker's wife on the bench, her book open on her lap (and the coworker beside her once home)
  pose(s, 'FAmum', t, ...FA_MUM, { sit: 1, seat: 2.5, look: home && t > tw('families') ? FA_CO : (home ? FA_HERO : toCam(FA_MUM)), expr: home ? [[0, 'smile'], [tw('families'), 'happy']] : 'neutral', gaze: home ? [0.6, 0.2] : [0.3, 0.7], hand: { L: { h: [0.32, 0.02], pole: [1, 0.5], hand: 'grip', front: true }, R: 'lap' } });
  gripProp(s, s.book3, 'FAmum', 'L', V3(-1.0 * 0.62, -0.2 * 0.62, 0), { behind: -0.15, ry: Math.atan2(s.cam.position.x - FA_MUM[0], s.cam.position.z - FA_MUM[1]) + 0.4, rx: -0.6 }); { const c = s.cam.position, dm = Math.hypot(c.x - FA_MUM[0], c.z - FA_MUM[1]), dk = Math.hypot(c.x - FA_KID[0], c.z - FA_KID[1]); if (home || dm < dk) gripDot(s, 'FAmum', 'L'); }   // v3: the grip dot ignores depth: not while she sits behind the kid (it read as a dark mark on the kid's brow)
  if (home) {
    pose(s, 'cowork', t, ...FA_CO, { sit: 1, seat: 2.5, look: t > tw('families') ? toCam(FA_CO) : FA_MUM, expr: [[0, 'smile'], [tw('families'), 'grin']], gaze: [-0.6, 0.3], hand: { L: 'lap', R: [[0, 'lap'], [tw('families'), 'wave']] } });
    pose(s, 'hero', t, ...FA_HERO, { sit: 1, seat: 1.75, look: t > tw('workers') && t < tw('families') ? toCam(FA_HERO) : FA_KID, expr: [[0, 'talk'], [tw('first'), 'smile'], [tw('workers'), 'talkO'], [tw('families'), 'happy']], talk, gaze: [0.6, 0.1],
      hand: { L: { h: [0.55, 0.12], pole: [1, 0.5], hand: 'grip', front: true }, R: [[0, { h: [0.62, 0.2], pole: [1, 0.4], hand: 'point', front: true }], [tw('families'), { h: [0.5, 0.1], pole: [1, 0.4], hand: 'grip', front: true }]] } });
    gripProp(s, s.book1, 'hero', 'L', V3(-1.2 * 0.95, -0.2 * 0.95, 0), { behind: -0.2, ry: Math.atan2(s.cam.position.x - FA_HERO[0], s.cam.position.z - FA_HERO[1]) + 0.3, rx: -0.1 }); gripDot(s, 'hero', 'L');
  }
}
function faLibrarian(s, t) { const tf = wAfter('few', 41, 41.5), tt = wAfter('tens', 42, 42.66);
  // v2: reads the counter, turns to us on "few" (surprised), anticipation dip before "tens", jump-shock with arms up, grin
  const lk = t < tf ? FA_CNT : t < tf + 0.9 ? [FA_LIB[0] - 4, FA_LIB[1] + 12] : t < tt ? FA_CNT : [FA_LIB[0] - 4, FA_LIB[1] + 12];
  const dip = t > tt - 0.2 && t < tt ? -Math.sin(Math.PI * (t - tt + 0.2) / 0.2) : 0;
  pose(s, 'FAb', t, ...FA_LIB, { look: lk, y: 0.5 * hopAt(t, tt, 0.34), squash: 0.3 * dip, lean: 0.05 * dip, expr: [[0, 'smile'], [tf, 'surprised'], [tf + 0.5, 'happy'], [tt - 0.2, 'nervous'], [tt, 'shock'], [tt + 0.7, 'grin']], gaze: [-0.6, 0.2],
    hand: { L: [[0, 'desk'], [tt, 'up'], [tt + 1.4, 'hip']], R: [[0, 'desk'], [tf, 'point'], [tf + 0.6, 'desk'], [tt, 'up'], [tt + 1.4, 'talk']] } }); }
function faSign(s, t) { const t0 = wAfter('library', 34, 35.12) - 0.4, d = t - t0;
  if (d < 0) { s.signPiv.visible = false; return; } s.signPiv.visible = true; s.signPiv.rotation.x = -1.45 * Math.exp(-d * 5.2) * Math.cos(d * 8.5); }

// ---- camera: one take, 26.19-46.14 (whip in from the depot panning right; whip out to the bay panning right)
CAMSEQ.factory = [
  [26.19, [-1, 19, 97], [-16, 11, 50], 52, -5],      // whip lands: still panning right, decelerating
  [26.70, [8, 20, 96], [-6, 14, 30], 52, -2],        // "You see" — the twin vaults reveal
  [27.35, [9, 13, 95], [4, 8, 56], 50, 3],         // crane down toward the collectors coming in (v2: under the tie-rods, not at their height)
  [27.98, [-5, 9.5, 93], [10, 6, 78], 46, 0],        // "Garbage collectors" — the file walking in with crates
  [29.00, [-11, 7.6, 87.5], [4, 5.8, 78], 44, -4],   // orbit ahead of them ("Ankara")
  [30.15, [-17, 12.5, 97], [-3, 5.5, 78], 46, 3],     // push onto the crates of books ("saving the books")
  [31.15, [-16, 13.5, 95], [-5, 3.5, 78], 48, -2], // "and they" — crane starts up over the crates set down (v2: moderate angle on the cards)
  [31.62, [-15, 23, 91], [-13, 30, 72], 50, 1],      // v2: tilt UP to the skylight while craning: the people leave frame at the bottom
  [31.95, [-15.6, 35, 88], [-16, 46, 70], 50, 0],      // up through the open skylight strip
  [32.55, [-19, 44, 85], [-56, 46, 50], 52, 4],      // turn to the kiln chimney ("so fast")
  [33.25, [-32, 78, 76], [-56, 86, 50], 50, -3],     // crane up the chimney
  [33.62, [-44, 103, 66], [-56, 97, 50], 52, 2],     // the chimney crown, close
  [33.95, [-60, 116, 70], [-20, 30, 52], 56, 4],     // "brick factory" — over the crown, the twin roofs below
  [34.55, [14, 60, 100], [16, 6, 80], 54, 0],         // fly over the roofs, dive toward the right skylight
  [34.88, [16, 30, 96], [16, 12, 76], 50, 0],      // through the strip
  [35.15, [16, 12.6, 96], [16, 13.2, 72], 52, 0],  // "library" — the sign swings into place
  [35.55, [17.2, 12.2, 95.5], [15.5, 12.8, 72], 52, -3],
  [35.95, [21, 10, 93], [31.5, 7, 79], 50, 2],       // "Shelves" (right wall)
  [36.45, [6, 6.5, 84], [21, 2.5, 62], 46, -2],        // "reading tables" (under the sign, left of it)
  [37.25, [5, 9, 64], [16, 6, 37], 46, 3],           // "a kid's corner"
  [37.80, [11, 9, 62], [18, 6, 37], 46, -1],
  [38.30, [25.6, 8, 47], [32, 6.8, 39], 44, -3],     // "All of it" — onto the spines
  [39.05, [26.4, 7.2, 37.5], [32, 6.4, 31], 42, 2],  // dolly along ("books somebody")
  [39.75, [26.8, 7.6, 28], [30, 5, 21.5], 42, -1],   // "decided"
  [40.40, [28.4, 9.4, 23.6], [28.5, 4.4, 20.2], 40, 3],   // push in to the dented, coffee-ringed book
  [40.95, [15, 9.5, 28], [10, 6.6, 11], 56, -3],       // swing to the desk + counter ("It started")
  [41.62, [11.5, 7.8, 27.5], [9.5, 6.7, 11], 56, 2],   // "few thousand" — push on 6,000
  [42.25, [5, 7.4, 26.5], [9.5, 6.7, 11], 56, -3],     // orbit
  [42.80, [9, 7.8, 26], [9.5, 6.8, 11], 54, 4],    // "tens of thousands" — push + roll
  [43.55, [9.5, 8, 27], [9.5, 6.8, 11], 56, 1],
  [44.0, [2, 11.5, 52], [14, 5, 39], 46, 0],         // crane up over the kids' corner
  [44.40, [22, 11.5, 62], [16, 5, 39], 46, -3],    // down in front of the reading group ("At first")
  [44.95, [15, 11, 63], [16, 5, 39], 44, 2],    // orbit ("workers")
  [45.60, [7, 11.5, 61], [17, 5, 38.5], 44, -2], // "families" — the coworker's family behind
  [45.94, [6.5, 11.5, 60.5], [17.5, 5, 38.5], 44, -1],
  [46.14, [6.5, 11.5, 60], [40, 7, 48], 44, 4],    // whip out: fast pan right
];

// ---- the one render function (absolute t)
const FA_BLUR = [[26.19, 1.2], [27.9, 2.0], [31.1, 2.0], [32, 0.6], [34.9, 0.6], [35.5, 0.5], [36.2, 1.2], [38.3, 0.8], [40.3, 0.4], [41.4, 0.4], [43.5, 0.6], [44.2, 2.6]];   // v2: the sign, spines, dented book and counter are BG now -> sharp while they are the subject
function faFrame(t) { const s = FA_get(); hideAll(s); hideGrips(s);
  const cam = seqCam(s, 'factory', t);   // v2: no 'out' switch (people vanished in frame): the FOCUS occluders hide them from outside
  [s.book1, s.book2, s.book3].forEach((b) => { b.visible = false; });
  redraw(s.cnt, faCells(t).map((c) => c[0] + c[1] + c[2].toFixed(2)).join('|'), faDrawCounter(faCells(t)));
  faSign(s, t); s.stars.forEach(([m, i]) => { m.rotation.y = 0.35 * Math.sin(t * 1.3 + i * 0.9); });
  faCollectors(s, t); faKidsCorner(s, t); faLibrarian(s, t);
  c3Render(s.scene, cam, { bg: '#2a2030', bgBlur: c3Knots(FA_BLUR, t), glow: 0.45, glowBlur: 12 }); }
for (const id of ['s12', 's13', 's14', 's15', 's16', 's17', 's18']) { SHOT_FN[id] = (t) => faFrame(t); SNAPS[id] = 'free'; }
// weathered terracotta roof tiles (8 x 8 units per tile), moss + soot streaks
function faTexRoof() { return tex((g, w, h) => { const R = RNG('faroof'), rows = 16, cols = 10, rh = h / rows, cw = w / cols; g.fillStyle = '#5a2a1a'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const x = (i + (j % 2) * 0.5) * cw, y = j * rh, gr = g.createLinearGradient(0, y, 0, y + rh); const c = c3Shd(R.f() < 0.15 ? '#8a5a3a' : '#a8482c', R.r(0.8, 1.1));
    gr.addColorStop(0, c3Shd(c, 0.7)); gr.addColorStop(0.7, c); gr.addColorStop(1, c3Shd(c, 1.15)); g.fillStyle = gr; g.beginPath(); g.roundRect(x + 2, y + 1, cw - 4, rh - 2, 8); g.fill(); }
  for (let i = 0; i < 18; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,110,50,0.25)' : 'rgba(40,20,15,0.18)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(10, 40), R.r(6, 20), R.f() * 3, 0, TAU); g.fill(); } }, 512, 512); }

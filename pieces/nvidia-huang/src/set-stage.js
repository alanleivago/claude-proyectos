// =====================================================================
//  SET stage — the keynote stage (A, s01-s04, 0-11.12) and the same stage after the show (A', s21 + s22 closing gag,
//  58.46-64.20). One set, one continuous camera per range (seqCam 'stage').
//  Layout (units: a toon person ~11.4 tall): stage floor y 0, x -48..48, z -18..16 (front edge, fascia down to the house
//  floor y -5). Curved LED wall: arc R 70, 100 wide x 36 tall (y 2..38), centre at z -18, 5 tiles + header ("NVIDIA" as
//  plain text). Giant chip on a lift from a floor hatch at z -8 behind Huang (0, 2). Two LED totems at x ±11 (the right
//  one = the janitor's dark "mirror" in A'). Mic stand at (5.4, 4.6). Front + rear truss (y 44) with moving heads and
//  beams; follow spot from the front truss; line arrays; side curtains; raked house with red seats and front-row
//  silhouettes (A only). A': house lights half on, screens dark, one spotlight; the jacket hangs on the mic stand;
//  the janitor (invented: blue cap, denim overalls, mop + bucket) tries it on, checks his reflection, hangs it back.
//  Prefix SG / sg.
// =====================================================================
const SG = {};
// ---- the janitor: invented, distinct (blue cap, denim overalls over a grey shirt, pear body). The same key for all
// three cards so the face, blinks and idle are identical when the leather card is swapped in (and in the reflection).
T3_HSTYLE.SGcap = { mass: { top: 0.13, side: 0.045 }, raise: 0, line: [[-1.3, 0.02], [-1.04, -0.04], [-0.94, -0.3], [-0.6, -0.42], [0, -0.44], [0.6, -0.42], [0.94, -0.3], [1.04, -0.04], [1.3, 0.02]],
  ell: [[0, -0.4, 1.16, 0.11], [0, -1.08, 0.1, 0.07]], gloss: 'none' };
Object.assign(CAST, {
  SGjan: { key: 'SGjan', hair: 'SGcap', hairColor: '#2c64c8', outfit: 'apron', colors: { main: '#8a96a2', apron: '#3a5ea8', collar: '#8a96a2' }, skin: 'peach', body: 'pear' },
  SGjanL: { key: 'SGjan', hair: 'SGcap', hairColor: '#2c64c8', outfit: 'leather', colors: { main: '#1c1c24', shirt: '#2c2c34', zip: '#c8ccd4' }, skin: 'peach', body: 'pear' },
  SGjanR: { key: 'SGjan', hair: 'SGcap', hairColor: '#2c64c8', outfit: 'leather', colors: { main: '#1c1c24', shirt: '#2c2c34', zip: '#c8ccd4' }, skin: 'peach', body: 'pear' },
});
const SG_SW = 100, SG_SH = 36, SG_SR = 70, SG_SY0 = 2, SG_SZ = -18, SG_CW = 2500, SG_CH = 900, SG_HD = 90;   // LED wall + its canvas (5 tiles of 500 x 810 + a 90 px header)
const SG_HU = [0, 2], SG_MS = [6.6, -3.4], SG_MSH = 8.7, SG_CHIP = [0, -8], SG_TOT = [[-12.5, -3.5, 1.31], [12.5, -3.5, -1.31]];   // Huang, mic stand (+ top height), chip lift, totems [x, z, yaw]
const SG_GW = 3.5, SG_GH = 4.6, SG_GY = 4.7;   // the jacket shine sprite: torso size + centre height
const SG_A1 = 11.12, SG_B0 = 58.46, SG_SPOT = 60.56;
const sgE = (a, b, t) => clamp((t - a) / (b - a));
const sgFloorY = (z) => z < 17 ? -5 : -5 + (z - 17) * 0.2;   // the raked house floor
// facing keys toward world points (or numbers), snapped over 0.16 s: [[t, [x, z] | facing], ...]
function sgFace(cam, x, z, K, t) { const f = (v) => typeof v === 'number' ? v : toonLookFacing(cam, x, z, v[0] - x, v[1] - z); let i = 0; while (i + 1 < K.length && K[i + 1][0] <= t) i++;
  if (i === 0) return f(K[0][1]); return lerp(f(K[i - 1][1]), f(K[i][1]), EZ.o3(sgE(K[i][0], K[i][0] + 0.16, t))); }

// =====================================================================
//  textures
// =====================================================================
function sgTexFloor() { const t = tex((g, w, h) => { const R = RNG('sgfloor');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5656b4'); gr.addColorStop(1, '#6a62c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(10,10,40,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(4, 40), R.r(1, 3)); }   // scuffs
  g.strokeStyle = 'rgba(20,18,60,0.55)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }   // deck panels
  g.strokeStyle = 'rgba(140,150,255,0.12)'; g.lineWidth = 1; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8 + 2, 0); g.lineTo(i * w / 8 + 2, h); g.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 4.5); return t; }
function sgTexWall() { const t = tex((g, w, h) => { const R = RNG('sgwall'); g.fillStyle = '#3a2a86'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { const x = i * w / 4; const gr = g.createLinearGradient(x, 0, x + w / 4, 0); gr.addColorStop(0, '#2c2070'); gr.addColorStop(0.5, '#4a38a0'); gr.addColorStop(1, '#2c2070'); g.fillStyle = gr; g.fillRect(x + 6, 0, w / 4 - 12, h); }   // acoustic panels
  for (let k = 0; k < 300; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,30,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, R.r(2, 10)); }
  g.fillStyle = '#1e1650'; g.fillRect(0, h - 40, w, 40); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 1); return t; }
function sgTexCurtain(c1, c2) { const t = tex((g, w, h) => { for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(i * w / 16, 0, (i + 1) * w / 16, 0); gr.addColorStop(0, c2); gr.addColorStop(0.5, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(i * w / 16, 0, w / 16 + 1, h); }
  const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0.35)'); v.addColorStop(0.3, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.15)'); g.fillStyle = v; g.fillRect(0, 0, w, h); }, 512, 256); t.wrapS = THREE.RepeatWrapping; return t; }
function sgTexGrille() { return tex((g, w, h) => { g.fillStyle = '#1c1c26'; g.fillRect(0, 0, w, h); g.fillStyle = '#2e2e3c'; for (let y = 6; y < h; y += 8) for (let x = 6; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); } }, 128, 128); }
function sgTexChipFace() { return tex((g, w, h) => { const R = RNG('sgchip'); g.fillStyle = '#1f4a34'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,220,140,0.35)'; g.lineWidth = 3; for (let i = 0; i < 70; i++) { let x = R.r(0, w), y = R.r(0, h); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (R.f() < 0.5) x += R.n(90); else y += R.n(90); g.lineTo(x, y); } g.stroke(); }   // traces
  g.fillStyle = '#e8b84a'; for (let i = 0; i < 26; i++) { const p = 30 + i * (w - 60) / 25; for (const [x, y] of [[p, 14], [p, h - 14], [14, p], [w - 14, p]]) { g.fillRect(x - 5, y - 9, 10, 18); } }   // gold contacts
  g.fillStyle = '#c8ccd4'; for (let i = 0; i < 14; i++) { const a = R.r(80, w - 120), b = R.r(80, h - 120); if (Math.abs(a - w / 2) < 170 && Math.abs(b - h / 2) < 170) continue; g.fillRect(a, b, 18, 9); g.fillStyle = '#6a5a3a'; g.fillRect(a + 6, b, 6, 9); g.fillStyle = '#c8ccd4'; } }, 512, 512); }
function sgTexDie() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a3038'); gr.addColorStop(0.5, '#4a525e'); gr.addColorStop(1, '#262c34'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(30,34,44,0.7)'; g.lineWidth = 5; g.strokeRect(14, 14, w - 28, h - 28); }, 256, 256); }
function sgTexDieGlow() { return tex((g, w, h) => { const R = RNG('sgdie'); g.fillStyle = '#000000'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7cff9a'; g.lineCap = 'round';
  for (let i = 0; i < 46; i++) { let x = 40 + R.f() * (w - 80), y = 40 + R.f() * (h - 80); g.lineWidth = R.r(2, 6); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { if (k % 2) x = clamp(x + R.n(120), 30, w - 30); else y = clamp(y + R.n(120), 30, h - 30); g.lineTo(x, y); } g.stroke(); g.fillStyle = '#c8ffd8'; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
  g.lineWidth = 8; g.strokeRect(24, 24, w - 48, h - 48); }, 512, 512); }
function sgTexPool(c) { return tex((g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, c); gr.addColorStop(0.62, c); gr.addColorStop(0.8, 'rgba(255,200,140,0.35)'); gr.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 256, 256); }
function sgTexSheet() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6f2ec'); gr.addColorStop(1, '#e4dcd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a1a14'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  inked(g, 'RESIGNATION', w / 2, h * 0.13, h * 0.085, '#c8281e', { stroke: false, maxW: w * 0.84, font: 'Georgia, serif', weight: 700 });
  g.fillStyle = 'rgba(40,30,30,0.55)'; const R = RNG('sgsheet'); for (let i = 0; i < 9; i++) g.fillRect(w * 0.12, h * (0.26 + i * 0.058), w * R.r(0.52, 0.76), 5);
  g.strokeStyle = '#1a2a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.14, h * 0.88); for (let i = 0; i < 14; i++) g.lineTo(w * (0.14 + i * 0.03), h * 0.88 + Math.sin(i * 1.9) * 12); g.stroke(); }, 300, 400); }
function sgTexLeaf() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f8f2e6'); gr.addColorStop(1, '#e8ddcc'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8321e'; g.fillRect(0, 0, w, h * 0.22); inked(g, '2026', w / 2, h * 0.11, h * 0.12, '#fff2d8', { stroke: false });
  inked(g, 'OCT', w / 2, h * 0.6, h * 0.36, '#2a1a14', { stroke: false, maxW: w * 0.86 });
  g.strokeStyle = 'rgba(60,40,30,0.4)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = 'rgba(60,40,30,0.35)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(w * (0.1 + i * 0.1), h * 0.03, 5, 0, TAU); g.fill(); } }, 480, 400); }
// an audience member from behind (dark navy with a stage-light rim): 0 arms down, 1 arms up, 2 phone up, 3 clapping
function sgTexFan(v, seed) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('sgfan', seed), cx = w / 2, hy = h * 0.2, hr = w * R.r(0.13, 0.16), sw = w * R.r(0.3, 0.36);
  const body = () => { g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.moveTo(cx - sw, h); g.lineTo(cx - sw, hy + hr * 2.1); g.quadraticCurveTo(cx - sw, hy + hr * 1.2, cx - hr * 0.7, hy + hr * 1.15); g.lineTo(cx + hr * 0.7, hy + hr * 1.15); g.quadraticCurveTo(cx + sw, hy + hr * 1.2, cx + sw, hy + hr * 2.1); g.lineTo(cx + sw, h); g.closePath(); };
  const arm = (sd, ex, ey) => { g.beginPath(); g.moveTo(cx + sd * sw * 0.86, hy + hr * 1.6); g.quadraticCurveTo(cx + sd * (sw + hr * 0.4), (hy + ey) / 2 + hr, ex, ey); g.lineWidth = hr * 0.62; g.lineCap = 'round'; g.stroke(); };
  const draw = (fill, rim) => { g.fillStyle = fill; g.strokeStyle = fill; body(); g.fill();
    if (v === 1) { arm(-1, cx - sw * 1.25, hy - hr * 2.2); arm(1, cx + sw * 1.25, hy - hr * 2.3); }
    if (v === 2) { arm(1, cx + sw * 0.7, hy - hr * 2.4); arm(-1, cx - sw * 1.15, hy + hr * 3.4); }
    if (v === 3) { arm(-1, cx - hr * 0.2, hy - hr * 1.8); arm(1, cx + hr * 0.2, hy - hr * 1.8); }
    if (v === 0) { arm(-1, cx - sw * 1.0, hy + hr * 4.2); arm(1, cx + sw * 1.0, hy + hr * 4.2); }
    if (R.f() < 0.4) { g.beginPath(); g.ellipse(cx, hy - hr * 0.5, hr * 1.12, hr * 0.7, 0, Math.PI, TAU); g.fill(); } };   // hair volume
  g.save(); g.translate(0, 3); draw('rgba(120,200,255,0.9)'); g.restore(); g.save(); g.translate(3, 0); draw('rgba(255,110,200,0.8)'); g.restore();   // the rim: cyan + magenta stage light
  R.f(); draw('#0e1030');
  if (v === 2) { g.fillStyle = '#bfe6ff'; g.fillRect(cx + sw * 0.7 - hr * 0.4, hy - hr * 3.3, hr * 0.8, hr * 1.2); } }, 128, 240); }

// ---- the LED wall: 5 tiles (500 x 810) + header. st = { m: mode, k, t, ... }
const SG_CS = 0.62;   // tile content scale: everything readable sits in the middle 62 % of a tile (a 9:16 frame sees ~14 of its 20 units)
const SG_YEARS = [2008, 2010, 2012, 2014, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
function sgLED(g, x0, y0, w, h, a = 0.16) { g.fillStyle = `rgba(0,0,10,${a})`; for (let x = x0; x < x0 + w; x += 5) g.fillRect(x, y0, 1.2, h); for (let y = y0; y < y0 + h; y += 5) g.fillRect(x0, y, w, 1.2);
  g.fillStyle = 'rgba(0,0,12,0.45)'; for (let x = x0; x < x0 + w; x += 125) g.fillRect(x, y0, 2, h); for (let y = y0; y < y0 + h; y += 135) g.fillRect(x0, y, w, 2); }
function sgGrad(g, x0, y0, w, h, c1, c2) { const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(x0, y0, w, h); }
function sgChipIcon(g, cx, cy, s, glow) { g.save(); g.translate(cx, cy); g.fillStyle = '#123a26'; g.strokeStyle = '#8cffaa'; g.lineWidth = s * 0.05;
  for (let i = -3; i <= 3; i++) for (const [dx, dy] of [[i * s * 0.12, -s * 0.62], [i * s * 0.12, s * 0.62], [-s * 0.62, i * s * 0.12], [s * 0.62, i * s * 0.12]]) { g.fillStyle = '#e8b84a'; g.fillRect(dx - s * 0.03, dy - s * 0.08, s * 0.06, s * 0.16); }
  g.fillStyle = '#1e5a3a'; g.beginPath(); g.roundRect(-s * 0.5, -s * 0.5, s, s, s * 0.08); g.fill(); g.stroke();
  g.fillStyle = glow ? '#7cff9a' : '#8a92a4'; g.beginPath(); g.roundRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56, s * 0.04); g.fill(); g.restore(); }
// a little cartoon of him in the jacket on a mini stage (no photo): white head, grey swept hair, glasses, black jacket
function sgMini(g, cx, cy, s, pose) { g.save(); g.translate(cx, cy); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = '#2a3a6a'; g.fillRect(-s * 0.36, s * 0.38, s * 0.12, s * 0.42); g.fillRect(s * 0.06, s * 0.38, s * 0.12, s * 0.42);   // jeans
  g.strokeStyle = '#16161e'; g.lineWidth = s * 0.11; const ar = [[-0.3, -0.05, -0.62, pose % 2 ? -0.5 : 0.2], [0.3, -0.05, 0.62, pose % 3 ? 0.25 : -0.55]];
  for (const [a, b, c, d] of ar) { g.beginPath(); g.moveTo(a * s, b * s); g.quadraticCurveTo((a + c) * 0.6 * s, (b + d) * 0.5 * s + s * 0.08, c * s, d * s); g.stroke(); }
  g.fillStyle = '#1c1c24'; g.beginPath(); g.moveTo(-s * 0.32, -s * 0.16); g.lineTo(s * 0.32, -s * 0.16); g.lineTo(s * 0.36, s * 0.42); g.lineTo(-s * 0.36, s * 0.42); g.closePath(); g.fill();
  g.fillStyle = '#c8ccd4'; g.fillRect(s * 0.02, -s * 0.12, s * 0.025, s * 0.52); g.fillStyle = '#3e3e4c'; g.beginPath(); g.moveTo(-s * 0.1, -s * 0.16); g.lineTo(-s * 0.26, -s * 0.16); g.lineTo(-s * 0.04, s * 0.12); g.fill(); g.beginPath(); g.moveTo(s * 0.1, -s * 0.16); g.lineTo(s * 0.26, -s * 0.16); g.lineTo(s * 0.06, s * 0.12); g.fill();
  g.fillStyle = '#f6f2ee'; g.beginPath(); g.arc(0, -s * 0.42, s * 0.25, 0, TAU); g.fill();
  g.fillStyle = '#b8b6b4'; g.beginPath(); g.ellipse(-s * 0.02, -s * 0.58, s * 0.27, s * 0.13, -0.15, Math.PI, TAU); g.fill();
  g.strokeStyle = '#1a1a1a'; g.lineWidth = s * 0.025; g.strokeRect(-s * 0.15, -s * 0.46, s * 0.12, s * 0.07); g.strokeRect(s * 0.03, -s * 0.46, s * 0.12, s * 0.07); g.beginPath(); g.arc(0, -s * 0.33, s * 0.08, 0.2, Math.PI - 0.2); g.stroke();
  g.restore(); }
function sgGarage(g, cx, cy, s, k) { g.save(); g.translate(cx, cy); g.scale(k, k);
  g.fillStyle = '#5a9a4a'; g.fillRect(-s * 0.9, s * 0.42, s * 1.8, s * 0.2); g.fillStyle = '#b8b0a0'; g.beginPath(); g.moveTo(-s * 0.32, s * 0.42); g.lineTo(s * 0.32, s * 0.42); g.lineTo(s * 0.5, s * 0.62); g.lineTo(-s * 0.5, s * 0.62); g.fill();   // lawn + driveway
  g.fillStyle = '#e8c890'; g.fillRect(-s * 0.5, -s * 0.12, s, s * 0.54); g.fillStyle = '#b8402a'; g.beginPath(); g.moveTo(-s * 0.6, -s * 0.1); g.lineTo(0, -s * 0.5); g.lineTo(s * 0.6, -s * 0.1); g.closePath(); g.fill();
  g.fillStyle = '#ffd88a'; g.fillRect(-s * 0.36, s * 0.02, s * 0.72, s * 0.4);   // lit interior
  g.fillStyle = '#6a4a2a'; g.fillRect(-s * 0.26, s * 0.22, s * 0.36, s * 0.05); g.fillStyle = '#d8d4c8'; g.fillRect(-s * 0.2, s * 0.08, s * 0.18, s * 0.14); g.fillStyle = '#4a8ad8'; g.fillRect(-s * 0.18, s * 0.1, s * 0.14, s * 0.1);   // desk + boxy computer
  g.fillStyle = '#c8ccd4'; for (let i = 0; i < 4; i++) g.fillRect(-s * 0.36, s * 0.02 + i * s * 0.035, s * 0.72, s * 0.028);   // half-open roll-up door
  g.strokeStyle = '#2a1a14'; g.lineWidth = s * 0.02; g.strokeRect(-s * 0.5, -s * 0.12, s, s * 0.54); g.strokeRect(-s * 0.36, s * 0.02, s * 0.72, s * 0.4);
  g.fillStyle = '#3a7a3a'; g.beginPath(); g.arc(s * 0.72, s * 0.12, s * 0.17, 0, TAU); g.fill(); g.fillStyle = '#6a4a2a'; g.fillRect(s * 0.69, s * 0.22, s * 0.06, s * 0.2);
  g.restore(); }
function sgCal(g, cx, cy, w, k, X) {   // the 14-day calendar: red header "TWO WEEKS", 7 x 2 day cells that pop in (k 0..1), X = crossed off
  const cw = w / 7.4, ch = cw * 1.35, gx = cw * 0.06, x0 = cx - (7 * cw + 6 * gx) / 2, y0 = cy - ch * 0.6;
  g.fillStyle = '#f2ece0'; g.beginPath(); g.roundRect(x0 - 16, y0 - cw * 1.25, 7 * cw + 6 * gx + 32, ch * 2 + gx + cw * 1.25 + 18, 14); g.fill();
  g.fillStyle = '#d8321e'; g.beginPath(); g.roundRect(x0 - 16, y0 - cw * 1.25, 7 * cw + 6 * gx + 32, cw * 1.0, [14, 14, 0, 0]); g.fill();
  inked(g, 'TWO WEEKS', cx, y0 - cw * 0.75, cw * 0.62, '#fff2d8', { stroke: false, maxW: 7 * cw });
  for (let j = 0; j < 14; j++) { const c = j % 7, r = Math.floor(j / 7), a = clamp(k * 16 - j * 0.9), x = x0 + c * (cw + gx) + cw / 2, y = y0 + r * (ch + gx) + ch / 2; if (a <= 0) continue;
    g.save(); g.translate(x, y); g.scale(EZ.back(a), EZ.back(a)); g.fillStyle = r ? '#ffe6a8' : '#fff6e0'; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.strokeStyle = '#8a5a3a'; g.lineWidth = 3; g.strokeRect(-cw / 2, -ch / 2, cw, ch);
    inked(g, String(j + 1), 0, 4, ch * 0.42, '#3a2216', { stroke: false });
    if (X) { g.strokeStyle = '#e8281e'; g.lineWidth = cw * 0.12; g.lineCap = 'round'; g.beginPath(); g.moveTo(-cw * 0.3, -ch * 0.3); g.lineTo(cw * 0.3, ch * 0.3); g.moveTo(cw * 0.3, -ch * 0.3); g.lineTo(-cw * 0.3, ch * 0.3); g.stroke(); }
    g.restore(); } }
function sgDrawTile(g, i, x0, y0, w, h, st) {
  const cx = x0 + w / 2, t = st.t, m = st.m, CS = (px = cx) => { g.save(); g.translate(px, y0 + h * 0.38); g.scale(SG_CS, SG_CS); g.translate(-px, -(y0 + h * 0.38)); };
  if (m === 'intro') { sgGrad(g, x0, y0, w, h, '#2a9ab8', '#4a5ad0');
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.translate(cx, y0 + h * 0.4);
    for (let r = 0; r < 18; r++) { const a = r / 18 * TAU + t * 0.6 * (i % 2 ? 1 : -1); g.fillStyle = r % 2 ? 'rgba(120,255,180,0.18)' : 'rgba(80,200,255,0.12)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 700, a, a + 0.12); g.fill(); }
    for (let r = 1; r < 6; r++) { const rr = ((r * 80 + t * 160) % 420); g.strokeStyle = `rgba(160,255,200,${0.5 * (1 - rr / 420)})`; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke(); }
    g.restore(); sgChipIcon(g, cx, y0 + h * 0.4, 170, true);
    g.strokeStyle = 'rgba(120,255,170,0.6)'; g.lineWidth = 5; for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x <= w; x += 10) g.lineTo(x0 + x, y0 + h * (0.72 + k * 0.06) + Math.sin(x * 0.02 + t * 4 + k + i) * 16); g.stroke(); } }
  else if (m === 'cal') { sgGrad(g, x0, y0, w, h, '#22a0aa', '#3a64c8'); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(120,255,220,0.07)'; g.fillRect(x0, y0 + ((k * 140 + t * 90) % h), w, 30); }
    CS(); sgCal(g, cx, y0 + h * 0.36, w * 0.9, st.k, false); g.restore(); }
  else if (m === 'boom' || m === 'dim') { const k = st.k; sgGrad(g, x0, y0, w, h, '#d8287a', '#ff8a2a');
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.translate(cx, y0 + h * 0.7); for (let r = 0; r < 14; r++) { const a = -Math.PI / 2 + (r - 7) * 0.16; g.fillStyle = 'rgba(255,240,140,0.13)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 900, a, a + 0.07); g.fill(); } g.restore();
    CS(); const bx = x0 + w * 0.12, by = y0 + h * 0.62, bw = w * 0.11; for (let b = 0; b < 6; b++) { const hh = h * (0.08 + 0.065 * b) * EZ.o3(clamp(k * 2.2 - b * 0.18)); g.fillStyle = b % 2 ? '#3ad8ff' : '#7cff9a'; g.fillRect(bx + b * bw * 1.3, by - hh, bw, hh); g.strokeStyle = '#2a0a3a'; g.lineWidth = 4; g.strokeRect(bx + b * bw * 1.3, by - hh, bw, hh); }
    { const n = Math.floor(clamp(k * 1.6) * 10); g.strokeStyle = '#fff36a'; g.lineWidth = 14; g.lineJoin = 'round'; g.beginPath(); const P = []; for (let j = 0; j <= n; j++) { const u = j / 10; P.push([x0 + w * (0.1 + 0.78 * u), by - h * (0.04 + 0.42 * u ** 2.2) + (j % 2 ? 14 : -10)]); }
      P.forEach(([x, y], j) => j ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); if (n > 0) { const [x, y] = P[P.length - 1], [px, py] = P[Math.max(0, P.length - 2)], a = Math.atan2(y - py, x - px); g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#fff36a'; g.beginPath(); g.moveTo(28, 0); g.lineTo(-18, -24); g.lineTo(-18, 24); g.fill(); g.restore(); } }
    for (let c = 0; c < 4; c++) { const a = clamp(k * 3 - c * 0.5); if (a <= 0) continue; sgChipIcon(g, x0 + w * (0.2 + 0.2 * c), y0 + h * (0.82 - 0.04 * (c % 2)) - 20 * Math.sin(t * 5 + c), 70 * EZ.back(a), true); }
    inked(g, 'AI BOOM', cx, y0 + h * 0.12, h * 0.1 * EZ.back(clamp(k * 3)), '#ffe23a', { stroke: '#4a0a3a', sw: 10, maxW: w * 0.9 });
    g.restore(); if (m === 'dim') { g.fillStyle = `rgba(14,16,50,${0.72 * EZ.o2(st.d)})`; g.fillRect(x0, y0, w, h); } }
  else if (m === 'y1993') { sgGrad(g, x0, y0, w, h, '#f29a3a', '#c8463a'); g.fillStyle = 'rgba(255,240,200,0.12)'; for (let k = 0; k < 12; k++) g.fillRect(x0, y0 + k * 70, w, 26);
    CS(); const k = EZ.back(clamp(st.k * 4)); inked(g, 'NVIDIA · 1993', cx, y0 + h * 0.12, h * 0.07, '#fff2d8', { stroke: '#5a1a0a', sw: 9, maxW: w * 0.9, font: 'Arial Black, Arial, sans-serif' });
    { const S = w * 0.42 * Math.max(0.01, k), yc = y0 + h * 0.42; g.save(); g.translate(cx, yc);   // v-lead: a first chip (facts.md has no garage story)
      g.fillStyle = '#d8dce6'; for (let i = -4; i <= 4; i++) for (const sd of [-1, 1]) { g.fillRect(i * S * 0.1 - S * 0.025, sd * S * 0.5 - (sd > 0 ? 0 : S * 0.12), S * 0.05, S * 0.12); g.fillRect(sd * S * 0.5 - (sd > 0 ? 0 : S * 0.12), i * S * 0.1 - S * 0.025, S * 0.12, S * 0.05); }
      g.fillStyle = '#2a2a38'; g.beginPath(); g.roundRect(-S * 0.42, -S * 0.42, S * 0.84, S * 0.84, S * 0.08); g.fill(); g.lineWidth = Math.max(2, S * 0.02); g.strokeStyle = '#1a1020'; g.stroke();
      g.fillStyle = '#7cff9a'; g.beginPath(); g.roundRect(-S * 0.26, -S * 0.26, S * 0.52, S * 0.52, S * 0.04); g.fill(); g.restore(); }
    g.restore(); }
  else if (m === 'years') { const u = (t - 8.4) / 0.17, n = Math.floor(u), fr = u - n, PAL = [['#3a92e8', '#2a5ac0'], ['#a05ae0', '#5a3aa8'], ['#2ab8a0', '#1a7aa0'], ['#e8609a', '#a03a8a']];
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    for (const d of [0, 1]) { const idx = n + i + d, ox = x0 + (d - fr) * w, [c1, c2] = PAL[((idx % 4) + 4) % 4], yr = SG_YEARS[clamp(idx, 0, SG_YEARS.length - 1)];
      sgGrad(g, ox, y0, w, h, c1, c2); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(ox + w * 0.12, y0 + h * 0.08, w * 0.76, h * 0.3);   // the mini screen behind him
      g.fillStyle = '#1a1438'; g.fillRect(ox, y0 + h * 0.56, w, h * 0.1); CS(ox + w / 2); sgMini(g, ox + w / 2, y0 + h * 0.38, w * 0.42, idx);
      inked(g, String(yr), ox + w / 2, y0 + h * 0.62, h * 0.08, '#ffe23a', { stroke: '#1a1030', sw: 9 }); g.restore(); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(ox + w - 4, y0, 8, h); }
    g.restore(); }
  else if (m === 'oct') { sgGrad(g, x0, y0, w, h, '#4a7ae8', '#2a3ab0'); for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(160,190,255,0.06)'; g.fillRect(x0 + ((k * 90 + t * 40) % w), y0, 24, h); }
    CS(); const pw = w * 0.74, ph = h * 0.44, px = cx - pw / 2, py = y0 + h * 0.16; g.fillStyle = '#5a3420'; g.beginPath(); g.roundRect(px - 14, py - 20, pw + 28, ph + 40, 12); g.fill();
    g.fillStyle = '#f2ead8'; g.fillRect(px, py, pw, ph); g.fillStyle = '#d8321e'; g.fillRect(px, py, pw, ph * 0.2); inked(g, 'OCT', cx, py + ph * 0.1, ph * 0.13, '#fff2d8', { stroke: false });
    inked(g, '29', cx, py + ph * 0.6, ph * 0.5, '#2a1a14', { stroke: false });
    if (i !== 2 || st.leafOn) { g.save(); g.translate(px, py); const lw = pw, lh = ph; g.fillStyle = '#f8f2e6'; g.fillRect(0, 0, lw, lh); g.fillStyle = '#d8321e'; g.fillRect(0, 0, lw, lh * 0.22); inked(g, '2026', lw / 2, lh * 0.11, lh * 0.12, '#fff2d8', { stroke: false }); inked(g, 'OCT', lw / 2, lh * 0.6, lh * 0.36, '#2a1a14', { stroke: false, maxW: lw * 0.86 }); g.restore(); }
    g.fillStyle = '#c8ccd4'; for (const sx of [-0.28, 0.28]) { g.beginPath(); g.arc(cx + sx * pw, py - 4, 13, 0, TAU); g.fill(); g.strokeStyle = '#4a4a5a'; g.lineWidth = 4; g.stroke(); } g.restore(); }
  else {   // 'off' (A'): dark glossy panels with a faint sheen
    sgGrad(g, x0, y0, w, h, '#7a66e0', '#5a52c4'); const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0.3, 'rgba(150,170,240,0)'); gr.addColorStop(0.45, 'rgba(150,170,240,0.16)'); gr.addColorStop(0.55, 'rgba(150,170,240,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h);   // FIX3: lighter (house lights half on reflect in the dark glass)
    { const wr = g.createLinearGradient(0, y0 + h * 0.4, 0, y0 + h); wr.addColorStop(0, 'rgba(255,170,120,0)'); wr.addColorStop(1, 'rgba(255,170,120,0.48)'); g.fillStyle = wr; g.fillRect(x0, y0 + h * 0.4, w, h * 0.6); }
    if (i === 2 && st.ov) { const o = st.ov;
      if (o.k === 'yr' && o.on) { g.fillStyle = 'rgba(60,90,170,0.3)'; g.fillRect(x0, y0, w, h); inked(g, '1993 → 2026', cx + (o.j || 0), y0 + h * 0.36, h * 0.085, '#bff6d0', { stroke: '#0a1a2a', sw: 9, maxW: w * 0.66 }); g.fillStyle = 'rgba(200,255,220,0.12)'; for (let y = y0; y < y0 + h; y += 9) g.fillRect(x0, y, w, 3); }
      if (o.k === 'cal' && o.on) { g.fillStyle = 'rgba(60,120,170,0.28)'; g.fillRect(x0, y0, w, h); CS(); sgCal(g, cx + (o.j || 0), y0 + h * 0.36, w * 0.9, 1, true); g.restore(); g.fillStyle = 'rgba(0,10,20,0.18)'; for (let y = y0; y < y0 + h; y += 9) g.fillRect(x0, y, w, 3); }
      if (o.k === 'line') { const a = o.a; g.fillStyle = `rgba(220,255,240,${0.9 * (1 - a)})`; g.fillRect(cx - w * 0.45 * (1 - a), y0 + h * 0.36 - 4, w * 0.9 * (1 - a), 8); } } }
}
function sgDrawScreen(g, w, h, st) {
  g.fillStyle = '#0a0c1e'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) sgDrawTile(g, i, i * 500, SG_HD, 500, h - SG_HD, st);
  const lit = st.m !== 'off', dim = st.m === 'dim' ? 1 - 0.8 * EZ.o2(st.d) : 1;   // the header band: "NVIDIA" (plain text) + a live bug
  g.fillStyle = lit ? '#14183a' : '#2a2a5a'; g.fillRect(0, 0, w, SG_HD); g.fillStyle = lit ? `rgba(118,255,150,${0.85 * dim})` : 'rgba(60,80,90,0.25)'; g.fillRect(0, SG_HD - 6, w, 4);
  if (lit) { g.globalAlpha = dim; for (let i = 0; i < 5; i++) { const cx = i * 500 + 250; inked(g, 'NVIDIA', cx, SG_HD * 0.48, SG_HD * 0.5, '#e8fff0', { stroke: false, font: 'Arial, Helvetica, sans-serif', weight: 800 });
      g.fillStyle = '#ff3a5a'; g.beginPath(); g.arc(i * 500 + 40, SG_HD * 0.48, 9, 0, TAU); g.fill(); inked(g, 'LIVE', i * 500 + 82, SG_HD * 0.5, SG_HD * 0.26, '#ffd0d8', { stroke: false, align: 'center' }); } g.globalAlpha = 1; }
  sgLED(g, 0, 0, w, h, lit ? 0.1 : 0.22);
}
function sgScreenState(t) {
  if (t < SG_B0 - 1) {
    if (t < 1.72) return { m: 'intro', t: Math.round(t * 30) / 30 };
    if (t < 3.74) return { m: 'cal', k: Math.round(clamp((t - 1.72) / 0.5) * 30) / 30, t: Math.round(t * 30) / 30 };
    if (t < 5.12) return { m: 'boom', k: Math.round(clamp((t - 3.74) / 0.9) * 60) / 60, t: Math.round(t * 30) / 30 };
    if (t < 5.86) return { m: 'dim', k: 1, d: Math.round(sgE(5.12, 5.42, t) * 30) / 30, t: 5.12 };
    if (t < 8.4) return { m: 'y1993', k: Math.round(clamp((t - 5.92) / 1) * 30) / 30, t: 0 };
    if (t < 9.66) return { m: 'years', t: Math.round(t * 30) / 30 };
    return { m: 'oct', t: Math.round(t * 30) / 30, leafOn: false };
  }
  const st = { m: 'off', t: 0 }, f = Math.floor(t * 30), fl = ((f * 7919) % 11) > 2;
  if (t < 59.48) st.ov = { k: 'yr', on: t > SG_B0 + 0.05 && fl && !(t > 59.3 && f % 2), j: (f % 5 === 0) ? 6 : 0 };
  else if (t < 60.3) st.ov = { k: 'cal', on: t > 59.52 && (fl || t > 59.7) && !(t > 60.14 && f % 3 === 0), j: (f % 7 === 0) ? -5 : 0 };
  else if (t < 60.44) st.ov = { k: 'line', a: sgE(60.3, 60.44, t) };
  return st;
}
function sgTotemTex(C, t) {   // the LED totems: A = flowing colour bars in the screen palette, A' = dark glass
  const st = sgScreenState(t), q = Math.round(t * 15) / 15, key = st.m === 'off' ? 'off' : st.m + q;
  redraw(C, key, (g, w, h) => { if (st.m === 'off') { sgGrad(g, 0, 0, w, h, '#8088d4', '#5c66b8'); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0.35, 'rgba(140,160,230,0)'); gr.addColorStop(0.5, 'rgba(140,160,230,0.12)'); gr.addColorStop(0.62, 'rgba(140,160,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); sgLED(g, 0, 0, w, h, 0.3); return; }
    const P = { intro: ['#1a7a9a', '#2a2a8a', '#7cff9a'], cal: ['#0e6a7a', '#183c8a', '#7cffd8'], boom: ['#d8287a', '#ff8a2a', '#fff36a'], dim: ['#20183a', '#100c24', '#3a3060'], y1993: ['#f29a3a', '#c8463a', '#fff2d8'], years: ['#2a7ad8', '#8a3ac8', '#ffe23a'], oct: ['#2a4ab8', '#141e6a', '#a8c0ff'] }[st.m];
    sgGrad(g, 0, 0, w, h, P[0], P[1]); for (let k = 0; k < 9; k++) { const y = ((k * 90 - q * 260) % h + h) % h; g.fillStyle = P[2]; g.globalAlpha = st.m === 'dim' ? 0.15 : 0.45; g.fillRect(0, y, w, 18); g.globalAlpha = 1; }
    sgLED(g, 0, 0, w, h, 0.16); }); }

// =====================================================================
//  geometry helpers
// =====================================================================
// a plane bent onto an arc (radius R, centre of the arc at z0 + R): concave toward the audience, uv kept
function sgArcPlane(w, h, R, z0, y0, seg = 72) { const g = new THREE.PlaneGeometry(w, h, seg, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), a = x / R; p.setXYZ(i, R * Math.sin(a), p.getY(i) + y0 + h / 2, z0 + R * (1 - Math.cos(a))); } g.computeVertexNormals(); return g; }
// many thin tubes as ONE instanced mesh: segs = [[ax, ay, az, bx, by, bz, r], ...]
function sgTubes(segs, mat, sides = 6) { const geo = new THREE.CylinderGeometry(1, 1, 1, sides), m = new THREE.InstancedMesh(geo, mat, segs.length), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), up = V3(0, 1, 0);
  segs.forEach(([ax, ay, az, bx, by, bz, r], i) => { const A = V3(ax, ay, az), B = V3(bx, by, bz), d = B.clone().sub(A), L = d.length(); Q.setFromUnitVectors(up, d.normalize()); M4.compose(A.add(B).multiplyScalar(0.5), Q, V3(r, L, r)); m.setMatrixAt(i, M4); });
  m.instanceMatrix.needsUpdate = true; m.userData.noCast = false; return m; }
// a box truss (4 chords + zig-zag lacing) between A and B, width wd, as tube segments
function sgTruss(A, B, wd = 1.6) { const S = [], d = V3(B[0] - A[0], B[1] - A[1], B[2] - A[2]), L = d.length(), u = d.clone().normalize(), up = Math.abs(u.y) > 0.9 ? V3(1, 0, 0) : V3(0, 1, 0), s1 = V3(0, 0, 0).crossVectors(u, up).normalize(), s2 = V3(0, 0, 0).crossVectors(u, s1).normalize();
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => s1.clone().multiplyScalar(a * wd / 2).add(s2.clone().multiplyScalar(b * wd / 2))), P = (k, j) => V3(...A).addScaledVector(u, k).add(C[j]);
  for (let j = 0; j < 4; j++) { const a = P(0, j), b = P(L, j); S.push([a.x, a.y, a.z, b.x, b.y, b.z, 0.12]); }
  const n = Math.max(2, Math.round(L / wd)); for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { const a = P(i * L / n, j), b = P((i + 1) * L / n, (j + 1) % 4), c = P((i + 1) * L / n, j); S.push([a.x, a.y, a.z, b.x, b.y, b.z, 0.06]); if (i % 2 === 0) S.push([a.x, a.y, a.z, P(i * L / n, (j + 1) % 4).x, P(i * L / n, (j + 1) % 4).y, P(i * L / n, (j + 1) % 4).z, 0.05]); void c; }
  return S; }
// an additive light beam whose apex sits at the origin and points down -Y (orient with quaternion each frame)
function sgBeam(col, L, r0, r1, op) { const geo = new THREE.CylinderGeometry(r0, r1, L, 24, 1, true); geo.translate(0, -L / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { col: { value: new THREE.Color(col) }, op: { value: op } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 col; uniform float op; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float f = smoothstep(0.0, 0.2, vUv.y) * (0.3 + 0.7 * vUv.y); gl_FragColor = vec4(col * op * rim * f, 1.0); }' }));
  Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); m.renderOrder = 8; return m; }
const SG_DOWN = V3(0, -1, 0);
const sgAim = (m, from, to) => { m.position.set(...from); m.quaternion.setFromUnitVectors(SG_DOWN, V3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize()); };
// a moving head: base + yoke + head with a glowing lens; returns { g, head (pan/tilt pivots), lens material }
function sgMover(M, hang) { const g = new THREE.Group(), pan = new THREE.Group(), tilt = new THREE.Group(); g.add(pan); pan.add(tilt);
  g.add(rb(1.4, 0.6, 1.1, M.black, 0, hang ? 0.3 : -0.3, 0)); const yk = hang ? -1 : 1;
  pan.add(rb(1.5, 0.22, 0.5, M.black, 0, yk * 0.75, 0)); for (const sx of [-0.7, 0.7]) pan.add(rb(0.2, 1.3, 0.5, M.black, sx, yk * 1.3, 0));
  tilt.position.y = yk * 1.6; const body = cyl(0.55, 0.42, 1.5, M.black, 0, 0, 0, 0, 16); tilt.add(body);
  const lensM = c3Prop('#ffffff', { emissive: '#ffffff', ei: 1.0, glow: '#ffffff' }); const lens = c3Mesh(new THREE.CircleGeometry(0.46, 20), lensM, 0); lens.rotation.x = Math.PI / 2; lens.position.y = -0.76; tilt.add(lens);
  return { g, pan, tilt, lensM }; }
// the leather jacket as a 3D prop (matches CAST.huang 'leather': black leather, wide biker lapels, off-centre silver zip,
// zip pockets, waistband). Origin = the middle of the collar top; it hangs down -Y; front = +Z.
function sgJacket(M) { const g = new THREE.Group(), L = M.leather, Ld = M.leatherD, Z = M.zip, V2 = (x, y) => new THREE.Vector2(x, y);
  const ext = (pts, depth, bev, mat) => { const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => V2(x, y))), { depth, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 3, curveSegments: 4 }); geo.translate(0, 0, -depth / 2); geo.computeVertexNormals(); return new THREE.Mesh(geo, mat); };
  const flat = (pts, mat, z) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => V2(x, y)))), mat); m.position.z = z; return m; };
  g.add(ext([[-0.5, 0], [-1.35, -0.28], [-1.62, -0.7], [-1.55, -4.2], [1.55, -4.2], [1.62, -0.7], [1.35, -0.28], [0.5, 0]], 0.7, 0.2, L));   // body: sloped shoulders, straight hem
  for (const sx of [-1, 1]) { const sl = ext([[-0.42, 0], [0.42, 0], [0.36, -3.7], [-0.36, -3.7]], 0.62, 0.16, L); sl.position.set(sx * 1.78, -0.5, -0.02); sl.rotation.z = sx * 0.07; g.add(sl);   // sleeves hanging
    const cf = rb(0.86, 0.32, 0.92, Ld, sx * 1.78 + sx * 0.26, -4.25, -0.02, 0); cf.rotation.z = sx * 0.07; g.add(cf); }
  const zf = 0.56;   // front surface
  g.add(flat([[-0.48, -0.02], [0.48, -0.02], [0.12, -2.3], [-0.12, -2.3]], M.lining, zf));   // the open V (lining / dark tee)
  for (const sx of [-1, 1]) g.add(flat([[sx * 0.46, -0.02], [sx * 1.3, -0.36], [sx * 1.06, -1.35], [sx * 0.16, -2.25]].map(([x, y]) => [x, y]), Ld, zf + 0.012));   // wide biker lapels
  g.children.slice(-2).forEach((m) => { m.material = Ld; m.material.side = THREE.DoubleSide; });
  { const z = rb(0.09, 3.4, 0.05, Z, 0.42, -2.45, zf + 0.03, 0); z.rotation.z = -0.1; g.add(z); }   // off-centre silver zip
  for (const sx of [-1, 1]) { const zp = rb(0.85, 0.07, 0.05, Z, sx * 0.95, -3.1, zf + 0.03, 0); zp.rotation.z = sx * 0.22; g.add(zp); }   // zip pockets
  g.add(rb(3.3, 0.36, 1.2, Ld, 0, -4.1, 0, 0));   // waistband
  g.add(rb(1.2, 0.36, 0.7, Ld, 0, -0.08, -0.15, 0));   // collar band
  g.traverse((o) => { if (o.isMesh) o.userData.noCast = false; });
  return g; }
// the mic stand: round base, pole, a short boom-less clip and a ball mic (FOCUS layer, so people sort with it)
function sgMicStand(M) { const g = new THREE.Group(); g.add(cyl(1.1, 1.2, 0.22, M.black, 0, 0.11, 0, 0, 24)); g.add(cyl(0.11, 0.11, SG_MSH - 0.6, M.chrome, 0, (SG_MSH - 0.6) / 2 + 0.2, 0, 0, 10));
  g.add(cyl(0.16, 0.16, 0.5, M.black, 0, SG_MSH - 0.6, 0, 0, 10)); const mic = new THREE.Group(); mic.position.set(0, SG_MSH - 0.3, 0.1); mic.rotation.x = 0.5; g.add(mic);
  mic.add(cyl(0.16, 0.12, 0.9, M.black, 0, 0.2, 0, 0, 12)); const ball = c3Mesh(new THREE.SphereGeometry(0.28, 16, 12), M.grille, 0); ball.position.y = 0.75; mic.add(ball); return g; }

// ---- FIX3 opening: the arena from OUTSIDE (Elon ref: hold on a glass facade, then dolly through it onto the hero).
// Night plaza at the back of the house (y 7.4, z 80+), the back facade at z 80 with a cyan-neon glass curtain wall
// (x -20..20, y 9..42; the centre bay x -4..4, y 18..34 is OPEN = the camera's way in), canopy + doors, roof sign,
// banners, lamp posts, planters, a queue, people walking in; a painted night sky; the whole house filled with a crowd.
const SG_FZ = 80, SG_PY = 7.4;
function sgTexFacade() { const t = tex((g, w, h) => { const R = RNG('sgfac'); g.fillStyle = '#34287a'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 128) { const gr = g.createLinearGradient(x, y, x + 128, y + 64); gr.addColorStop(0, '#3e3290'); gr.addColorStop(1, '#2c2268'); g.fillStyle = gr; g.fillRect(x + 3, y + 3, 122, 58);
    g.fillStyle = 'rgba(200,210,255,0.18)'; for (const [a, b] of [[x + 8, y + 8], [x + 118, y + 8], [x + 8, y + 56], [x + 118, y + 56]]) { g.beginPath(); g.arc(a, b, 2, 0, TAU); g.fill(); } }
  for (let k = 0; k < 400; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,30,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(2, 12), 2); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function sgTexPlaza() { const t = tex((g, w, h) => { const R = RNG('sgplz'); g.fillStyle = '#4a4688'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 64) { g.fillStyle = `rgb(${70 + R.r(0, 14)},${66 + R.r(0, 12)},${130 + R.r(0, 16)})`; g.fillRect(x + 1, y + 1, 62, 30); }
  g.strokeStyle = 'rgba(20,16,50,0.5)'; g.lineWidth = 2; for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); return t; }
function sgTexSky() { return tex((g, w, h) => { const R = RNG('sgsky'), gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#1a1652'); gr.addColorStop(0.45, '#3c2c96'); gr.addColorStop(0.78, '#a04ab0'); gr.addColorStop(1, '#ff8ab8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { const y = R.r(0, h * 0.7); g.fillStyle = `rgba(255,248,230,${R.r(0.3, 0.9) * (1 - y / h)})`; g.beginPath(); g.arc(R.r(0, w), y, R.r(0.8, 2.2), 0, TAU); g.fill(); }
  const mx = w * 0.72, my = h * 0.2, mr = w * 0.035; const gl = g.createRadialGradient(mx, my, mr, mx, my, mr * 4); gl.addColorStop(0, 'rgba(255,240,220,0.35)'); gl.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = gl; g.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
  g.fillStyle = '#fff4e0'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,190,220,0.5)'; for (const [a, b, r] of [[-0.3, -0.2, 0.22], [0.25, 0.3, 0.16], [0.1, -0.45, 0.1]]) { g.beginPath(); g.arc(mx + a * mr, my + b * mr, r * mr, 0, TAU); g.fill(); }
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,170,210,0.16)'; g.beginPath(); g.ellipse(R.r(0, w), h * R.r(0.55, 0.85), R.r(80, 200), R.r(8, 18), 0, 0, TAU); g.fill(); } }, 1024, 512); }
function sgTexGlassP() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,200,255,0.22)'); gr.addColorStop(1, 'rgba(90,140,230,0.12)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h / 2); g.rotate(-0.7); for (const [o, ww, a] of [[-60, 26, 0.22], [-18, 8, 0.16], [70, 40, 0.12]]) { g.fillStyle = `rgba(230,245,255,${a})`; g.fillRect(-w, o, 2 * w, ww); } g.restore(); }, 128, 128); }
function sgTexSign() { return tex((g, w, h) => { g.fillStyle = '#0e1030'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7cff9a'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
  sgChipIcon(g, h * 0.55, h / 2, h * 0.46, true); inked(g, 'KEYNOTE', w * 0.57, h * 0.4, h * 0.36, '#f2fff6', { stroke: false, font: 'Arial Black, Arial, sans-serif', maxW: w * 0.66 });
  g.fillStyle = '#ff3a5a'; g.beginPath(); g.arc(w * 0.33, h * 0.76, h * 0.05, 0, TAU); g.fill(); inked(g, 'LIVE TONIGHT', w * 0.59, h * 0.76, h * 0.15, '#7cff9a', { stroke: false, font: 'Arial, sans-serif', weight: 800, maxW: w * 0.5 }); }, 1024, 320); }
function sgTexBanner(c1, c2) { return tex((g, w, h) => { sgGrad(g, 0, 0, w, h, c1, c2); g.fillStyle = 'rgba(255,255,255,0.1)'; for (let y = 0; y < h; y += 40) g.fillRect(0, y, w, 14);
  sgChipIcon(g, w / 2, h * 0.3, w * 0.5, true); inked(g, '2026', w / 2, h * 0.62, w * 0.3, '#fff6e0', { stroke: '#1a1040', sw: 6, font: 'Arial Black, Arial, sans-serif' });
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h - 26, w, 26); }, 128, 512); }
function sgExterior(s, M, scene) {
  const nc = (m) => { m.traverse((o) => { if (o.isMesh) o.userData.noCast = true; }); scene.add(m); return m; }, Z = SG_FZ, PY = SG_PY;
  const fac = c3Prop('#ffffff', { map: sgTexFacade(), rough: 0.7 }), trim = c3Prop('#5a4ab0', { rough: 0.45, metal: 0.2 }), mull = c3Prop('#c8cce0', { metal: 0.7, rough: 0.3 }), conc = c3Prop('#6a5aa8', { rough: 0.85 });
  const neonC = c3Prop('#7ae0ff', { emissive: '#5ad8ff', ei: 2.0, glow: '#5ad8ff' }), neonP = c3Prop('#ff8ad8', { emissive: '#ff5ad8', ei: 1.8, glow: '#ff5ad8' });
  // the facade: slabs around the glass (texture repeat scaled to size), plinth, pilasters, cornice + parapet
  const slab = (w, h, x, y) => { const m = rb(w, h, 1.2, fac.clone(), x, y, Z, 0); m.material.map = fac.map.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(w / 12, h / 8); nc(m); };
  slab(38, 70, -39, 27); slab(38, 70, 39, 27); slab(40, 20, 0, 52); slab(40, 6, 0, PY - 1.4 + 3 - 3);
  for (const x of [-58, -40, -22, 22, 40, 58]) nc(rb(2.2, 56, 2.2, trim, x, PY + 27, Z + 0.9, 0));   // pilasters
  nc(rb(120, 1.6, 3.4, trim, 0, 62.2, Z + 1.0, 0)); nc(rb(120, 2.6, 1.6, conc, 0, 64.1, Z + 0.2, 0)); nc(rb(120, 1.2, 4, conc, 0, PY + 0.6, Z + 1.8, 0));   // cornice, parapet, plinth
  nc(rb(120, 0.35, 0.3, neonC, 0, 61.1, Z + 1.0, 0)); nc(rb(120, 0.3, 0.3, neonP, 0, 63.0, Z + 2.8, 0));   // neon under the cornice (ref: cyan roof line)
  // the glass curtain wall: frame + mullions + transoms (centre bay open), panes, cyan neon around it
  for (const x of [-20, -12, -4, 4, 12, 20]) nc(rb(0.6, 33, 0.9, mull, x, 25.5, Z + 0.2, 0));
  for (const y of [9, 18, 34, 42]) for (const [a, b] of (y === 18 || y === 34 ? [[-20, -4], [4, 20]] : [[-20, 20]])) nc(rb(b - a + 0.6, 0.5, 0.9, mull, (a + b) / 2, y, Z + 0.2, 0));
  nc(rb(0.5, 1.0, 0.9, mull, 0, 18, Z + 0.2, 0));   // the open bay's door header stub (below the camera's way in)
  const gm = new THREE.MeshBasicMaterial({ map: sgTexGlassP(), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }); gm.userData.c3keep = true;
  for (const [a, b] of [[-20, -12], [-12, -4], [-4, 4], [4, 12], [12, 20]]) for (const [c, d] of [[9, 18], [18, 34], [34, 42]]) { if (a === -4 && c === 18) continue;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(b - a - 0.6, d - c - 0.5), gm); p.position.set((a + b) / 2, (c + d) / 2, Z); p.renderOrder = 6; Object.assign(p.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(p); }
  for (const [w, h, x, y] of [[41.4, 0.35, 0, 42.7], [41.4, 0.35, 0, 8.4], [0.35, 34.6, -20.7, 25.5], [0.35, 34.6, 20.7, 25.5]]) nc(rb(w, h, 0.3, neonC, x, y, Z + 0.75, 0));
  for (const x of [-2, 2]) nc(rb(0.18, 2.4, 0.3, mull, x, PY + 6, Z + 0.4, 0));   // door pulls
  // entrance canopy with an underlight, two columns
  nc(rb(9.4, 0.6, 3.2, trim, 0, 16.6, Z + 1.8, 0)); nc(rb(9.4, 0.22, 0.22, neonC, 0, 16.25, Z + 3.4, 0));   // a small door awning (below the view of the stage)
  // upper band: a row of lit booth windows, magenta uplights washing the pilasters
  for (let i = 0; i < 9; i++) { const x = -16 + i * 4; nc(rb(3.0, 3.6, 0.5, trim, x, 52, Z + 0.7, 0)); const wq = pl(2.5, 3.0, c3Prop('#ffe2b0', { emissive: '#ffcf90', ei: i % 3 === 1 ? 0.5 : 1.1, glow: '#ffc880' }), x, 52, Z + 0.98); nc(wq); }
  nc(rb(40, 0.5, 1.4, trim, 0, 49.4, Z + 0.9, 0)); nc(rb(40, 0.25, 0.25, neonP, 0, 49.0, Z + 1.6, 0));
  { const up = tex((g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,110,210,0.75)'); gr.addColorStop(1, 'rgba(255,110,210,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(w * 0.42, h); g.lineTo(w * 0.58, h); g.lineTo(w, 0); g.lineTo(0, 0); g.fill(); }, 128, 256);
    for (const x of [-22, 22, -40, 40]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 30), new THREE.MeshBasicMaterial({ map: up, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.position.set(x, PY + 15, Z + 2.1); m.renderOrder = 7; Object.assign(m.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(m); } }
  // roof sign on a truss frame + rooftop clutter against the sky
  { const sg = pl(30, 9.4, c3Flat('#ffffff', { map: sgTexSign() }), 0, 70.4, Z + 0.3); sg.material.userData.c3keep = true; Object.assign(sg.userData, { noCast: true, noShade: true }); scene.add(sg);
    nc(rb(31, 10.4, 0.8, M.black, 0, 70.4, Z - 0.2, 0)); scene.add(sgTubes([...sgTruss([-14, 65, Z - 1.4], [-14, 76, Z - 1.4], 1.0), ...sgTruss([14, 65, Z - 1.4], [14, 76, Z - 1.4], 1.0)], M.truss));
    for (const [x, w] of [[-30, 7], [26, 5], [38, 8]]) { nc(rb(w, 3.4, 4, M.dark, x, 67.1, Z - 4, 0)); nc(cyl(1.2, 1.2, 0.4, M.black, x, 69, Z - 4, 0, 16)); }
    nc(cyl(0.18, 0.25, 18, M.truss, -22, 74, Z - 3, 0, 6)); const bl = cyl(0.5, 0.5, 0.5, neonP, -22, 83.2, Z - 3, 0, 10); nc(bl); }
  // banners on the slabs, the plaza, lamp posts with glowing globes (+2 lights), planters, queue posts + ropes, people walking in
  for (const [x, c1, c2] of [[-30, '#2a9a8a', '#1a5a7a'], [30, '#c8287a', '#7a1a6a'], [-48, '#c8287a', '#7a1a6a'], [48, '#2a9a8a', '#1a5a7a']]) { const b = pl(6, 22, c3Prop('#ffffff', { map: sgTexBanner(c1, c2), rough: 0.8 }), x, 44, Z + 1.0); nc(b); nc(cyl(0.12, 0.12, 7, mull, x, 55.2, Z + 1.1, 0, 6)).rotation.z = Math.PI / 2; }
  { const m = pl(200, 130, c3Prop('#ffffff', { map: sgTexPlaza(), rough: 0.35, env: 0.9 }), 0, PY, Z + 65, 0, -Math.PI / 2); m.userData.noCast = true; scene.add(m); }
  s.extL = []; for (const sx of [-1, 1]) for (const z of [Z + 12, Z + 34]) { const x = sx * 17; nc(cyl(0.3, 0.42, 15, M.black, x, PY + 7.5, z, 0, 10)); nc(rb(3.4, 0.3, 0.3, M.black, x - sx * 1.4, PY + 15, z, 0));
    const gl = c3Mesh(new THREE.SphereGeometry(0.9, 16, 12), M.warm, 0); gl.position.set(x - sx * 2.8, PY + 14.2, z); nc(gl);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ map: sgTexPool('rgba(255,210,150,0.32)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x - sx * 2.8, PY + 0.05, z); Object.assign(pool.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(pool); }
  for (const sx of [-1, 1]) { const l = new THREE.PointLight('#ffcf98', 0, 46, 1.5); l.position.set(sx * 15, PY + 13, Z + 20); l.layers.enableAll(); scene.add(l); s.extL.push(l); }
  const bush = c3Prop('#3a9a5a', { rough: 0.8 }), bush2 = c3Prop('#2a7a4a', { rough: 0.8 }), R = RNG('sgext');
  for (const [x, z] of [[-9, Z + 9], [9, Z + 9], [-26, Z + 16], [26, Z + 16], [-26, Z + 40], [26, Z + 40]]) { nc(rb(6, 2.2, 3.2, conc, x, PY + 1.1, z, 0)); nc(rb(6.3, 0.3, 3.5, trim, x, PY + 2.3, z, 0));
    for (let k = 0; k < 6; k++) { const b = c3Mesh(new THREE.SphereGeometry(R.r(0.9, 1.4), 12, 10), k % 2 ? bush : bush2, 0); b.position.set(x + R.r(-2.2, 2.2), PY + 2.9 + R.r(0, 0.8), z + R.r(-0.8, 0.8)); nc(b); } }
  { const P = []; for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) P.push([sx * 3.2, Z + 4 + i * 3.4]); for (const [x, z] of P) { nc(cyl(0.12, 0.12, 3, mull, x, PY + 1.5, z, 0, 8)); nc(cyl(0.4, 0.45, 0.2, M.black, x, PY + 0.1, z, 0, 12)); }
    const segs = []; for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) segs.push([sx * 3.2, PY + 2.7, Z + 4 + i * 3.4, sx * 3.2, PY + 2.7, Z + 7.4 + i * 3.4, 0.07]); scene.add(sgTubes(segs, c3Prop('#c8283e', { rough: 0.5 }))); }
  s.walkers = []; for (let i = 0; i < 9; i++) { const sc = R.r(0.9, 1.05), mat = new THREE.MeshBasicMaterial({ map: s.fanT[i % 3 ? 0 : 2][i % 3], alphaTest: 0.5, side: THREE.DoubleSide }); mat.toneMapped = false; mat.userData.c3keep = true;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.0 * sc, 9.4 * sc), mat); m.geometry.translate(0, 4.7 * sc, 0); Object.assign(m.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(m);
    s.walkers.push({ m, x: i < 4 ? R.r(-2.2, 2.2) : R.r(-24, 24), z: Z + (i < 4 ? 5 + i * 4 : R.r(8, 40)), ph: R.f() * TAU }); }
  // the sky (behind the hall; the hall's walls + ceiling hide it from inside)
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(520, 260), new THREE.MeshBasicMaterial({ map: sgTexSky(), fog: false, toneMapped: false })); m.material.userData.c3keep = true; m.position.set(0, 150, -150); Object.assign(m.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(m); s.sky = m; }
  // close the hall to the facade (side walls + ceiling ran to z 75)
  for (const sx of [-1, 1]) { const w = pl(6, 64, M.wall, sx * 58, 26, 77.5, -sx * Math.PI / 2); w.userData.noCast = true; scene.add(w); }
  scene.add(plNC(120, 6, c3Prop('#16142e', { rough: 0.9 }), 0, 60, 77.5, 0, Math.PI / 2));
  // the full house: a standing crowd in every row behind the front two (instanced billboards facing the back, seen only on the way in)
  s.crowd = []; { const byV = {}; for (let z = 30; z < 75; z += 4.5) for (let x = -46; x <= 46; x += 3.4) { if (Math.abs(x) < 4.5 || R.f() < 0.12) continue; const v = R.f() < 0.25 ? 2 : (R.f() < 0.55 ? 1 : 3), k = Math.floor(R.f() * 3); (byV[v + '_' + k] ||= []).push([x + R.n(0.4), z - 0.4, R.r(0.84, 0.98), R.f() * TAU, R.r(5, 8)]); }
    for (const key in byV) { const [v, k] = key.split('_').map(Number), P = byV[key], mat = new THREE.MeshBasicMaterial({ map: s.fanT[v][k], alphaTest: 0.5, side: THREE.DoubleSide }); mat.toneMapped = false; mat.userData.c3keep = true;
      const geo = new THREE.PlaneGeometry(5.6, 10.5); geo.translate(0, 5.25, 0); const m = new THREE.InstancedMesh(geo, mat, P.length); Object.assign(m.userData, { noCast: true, noShade: true, noInk2: true }); m.frustumCulled = false; scene.add(m); s.crowd.push({ m, P }); } }
}
function sgExtFrame(s, t, on) {
  for (const l of s.extL) l.intensity = on ? 1.6 : 0;
  for (const w of s.walkers) { w.m.visible = on; if (!on) continue; const z = w.z - t * 2.2, x = w.x; w.m.position.set(x, SG_PY + 0.18 * Math.abs(Math.sin(t * 7 + w.ph)), z); w.m.rotation.y = Math.atan2(s.cam.position.x - x, s.cam.position.z - z); }
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = V3(1, 1, 1), P = V3(0, 0, 0);
  for (const c of s.crowd) { c.m.visible = on; if (!on) continue; c.P.forEach(([x, z, sc, ph, sp], i) => { const b = Math.max(0, Math.sin(t * sp + ph)); P.set(x, sgFloorY(z) + 0.3 * b, z); S.set(sc, sc * (1 + 0.03 * b), sc); Q.setFromAxisAngle(V3(0, 0, 1), 0.05 * Math.sin(t * sp * 0.5 + ph)); M4.compose(P, Q, S); c.m.setMatrixAt(i, M4); }); c.m.instanceMatrix.needsUpdate = true; }
}
// zoom blur on the dolly-in (the ref smears the fast fly-through): scaled copies of the frame about Huang, strength from camera speed
function sgZoomBlur(s, t) { if (t < 0.25 || t > 1.05) return; const a = c3CamAt(CAMSEQ.stage, t - 1 / 60), b = c3CamAt(CAMSEQ.stage, t + 1 / 60), sp = Math.hypot(...a.p.map((v, i) => v - b.p[i])) * 30;
  const k = clamp((sp - 70) / 260); if (k <= 0.01) return; const c = V3(SG_HU[0], 8, SG_HU[1]).project(s.cam), cx = (c.x + 1) / 2 * W, cy = (1 - c.y) / 2 * H;
  const L = sgZoomBlur.L ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), lx = L.getContext('2d'); lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const n = 9; for (let i = 1; i < n; i++) { const z = 1 + 0.07 * k * i / (n - 1); ctx.globalAlpha = 1 / (i + 1); ctx.setTransform(z, 0, 0, z, cx * (1 - z), cy * (1 - z)); ctx.drawImage(L, 0, 0); } ctx.restore(); }

// =====================================================================
//  build
// =====================================================================
function sgBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 700), s = { scene, cam, p: {} };
  c3Renderer().r.localClippingEnabled = true;   // the janitor's reflection is clipped to the dark totem (portal planes)
  s.key = lights(scene, { amb: '#6a78d8', ambI: 0.3, sky: '#a8b8ff', ground: '#6a3a6a', key: '#ffe2c0', keyI: 0.9, keyP: [20, 40, 40], rim: '#ff8ad8', rimI: 0.5, rimP: [-30, 30, -30] });
  scene.traverse((o) => { if (o.isAmbientLight) s.amb = o; if (o.isHemisphereLight) s.hemi = o; if (o.isDirectionalLight && o !== s.key) s.rim = o; });
  const M = SG.M = { black: c3Prop('#1e2030', { rough: 0.55 }), dark: c3Prop('#2c2e42', { rough: 0.5 }), truss: c3Prop('#c8ccd8', { metal: 0.7, rough: 0.3 }), chrome: c3Prop('#e6eaf2', { metal: 0.85, rough: 0.2 }),
    floor: c3Prop('#ffffff', { map: sgTexFloor(), rough: 0.22, env: 1.3 }), fascia: c3Prop('#2a2a5a', { rough: 0.45 }), wall: c3Prop('#ffffff', { map: sgTexWall(), rough: 0.85 }),
    curtain: c3Prop('#ffffff', { map: sgTexCurtain('#7a2a8a', '#3a1048'), rough: 0.9 }), seat: c3Prop('#c8283e', { rough: 0.7 }), seatB: c3Prop('#2a2236', { rough: 0.6 }), houseF: c3Prop('#4a2c5a', { rough: 0.8 }),
    grille: c3Prop('#ffffff', { map: sgTexGrille(), rough: 0.6 }), leather: c3Prop('#1c1c24', { rough: 0.3, env: 0.9 }), leatherD: c3Prop('#30303c', { rough: 0.32, env: 0.8 }), zip: c3Prop('#d8dce4', { metal: 0.8, rough: 0.25 }), lining: c3Prop('#2a1c24', { rough: 0.8 }),
    green: c3Prop('#7cff9a', { emissive: '#5aff88', ei: 1.4, glow: '#5aff88' }), cyan: c3Prop('#7ae0ff', { emissive: '#5ad8ff', ei: 1.3, glow: '#5ad8ff' }), warm: c3Prop('#fff0d0', { emissive: '#ffe0b0', ei: 1.0, glow: '#ffd8a0' }),
    house: c3Prop('#fff0d0', { emissive: '#ffd8a0', ei: 0.2, glow: '#ffc880' }), yellow: c3Prop('#f2c21a', { rough: 0.4 }), mopH: c3Prop('#e8e0cc', { rough: 0.95 }), wood: c3Prop('#c8904a', { rough: 0.6 }) };
  const F = new THREE.Group(); scene.add(F);   // FOCUS: the mic stand + jacket, props in hands, the glass over the totem
  // ---- stage deck, front fascia with an LED strip, the house floor (raked), side walls, ceiling
  scene.add(pl(96, 34, M.floor, 0, 0, -1, 0, -Math.PI / 2));
  scene.add(rb(96, 5, 0.6, M.fascia, 0, -2.5, 16.3, 0)); { const st = rb(96, 0.35, 0.3, M.cyan, 0, -0.3, 16.65, 0); st.userData.noCast = true; scene.add(st); }
  for (let x = -44; x <= 44; x += 4) scene.add(rb(2.6, 1.8, 0.1, M.grille, x, -2.8, 16.66, 0));   // vents
  { const g = new THREE.PlaneGeometry(120, 64, 1, 24), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const zz = 48 - p.getY(i); p.setXYZ(i, p.getX(i), sgFloorY(zz) - 0.02, zz); } g.computeVertexNormals(); const m = new THREE.Mesh(g, M.houseF); m.userData.noCast = true; scene.add(m); }
  for (const sx of [-1, 1]) { const w = pl(110, 64, M.wall, sx * 58, 26, 20, -sx * Math.PI / 2); w.userData.noCast = true; scene.add(w);
    for (let z = 22; z < 70; z += 12) { const sc = rb(0.6, 1.6, 1.0, M.warm, sx * 57.6, 14, z, 0); sc.userData.noCast = true; scene.add(sc); } }   // wall sconces
  scene.add(plNC(120, 110, c3Prop('#16142e', { rough: 0.9 }), 0, 60, 20, 0, Math.PI / 2));   // ceiling
  s.houseL = []; for (let z = 24; z <= 72; z += 12) for (let x = -40; x <= 40; x += 16) { const d = c3Mesh(new THREE.CircleGeometry(1.0, 16), M.house, 0); d.rotation.x = Math.PI / 2; d.position.set(x, 59.8, z); d.userData.noCast = true; scene.add(d); }
  for (const z of [30, 52]) for (const x of [-26, 0, 26]) { const l = new THREE.PointLight('#ffd6a0', 0, 70, 1.4); l.position.set(x, 40, z); l.layers.enableAll(); scene.add(l); s.houseL.push(l); }
  // black masking above and behind the LED wall, purple velvet side curtains
  scene.add(plNC(150, 40, c3Prop('#0e0e1c', { rough: 0.9 }), 0, 50, SG_SZ - 2, 0));
  for (const sx of [-1, 1]) { const g = new THREE.PlaneGeometry(14, 52, 40, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 2.2) * 0.6); g.computeVertexNormals();
    const c = new THREE.Mesh(g, M.curtain); c.position.set(sx * 54, 26, -12); c.rotation.y = -sx * 0.5; c.userData.noCast = true; scene.add(c); }
  // ---- the curved LED wall + trims + its canvas
  s.scr = canvasTex(SG_CW, SG_CH); s.scr.t.anisotropy = 8;
  { const m = new THREE.Mesh(sgArcPlane(SG_SW, SG_SH, SG_SR, SG_SZ, SG_SY0), c3Flat('#ffffff', { map: s.scr.t })); m.material.userData.c3keep = true; m.userData.noCast = true; m.userData.noShade = true; scene.add(m); s.screen = m;
    const back = new THREE.Mesh(sgArcPlane(SG_SW + 2, SG_SH + 2, SG_SR, SG_SZ - 0.6, SG_SY0 - 1), M.black); back.userData.noCast = true; scene.add(back);
    for (const y of [SG_SY0 - 0.35, SG_SY0 + SG_SH + 0.35]) { const P = []; for (let i = 0; i <= 48; i++) { const a = (i / 48 - 0.5) * (SG_SW + 1) / SG_SR; P.push(V3(SG_SR * Math.sin(a), y, SG_SZ + SG_SR * (1 - Math.cos(a)))); }
      const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 64, 0.42, 8), M.dark); tb.userData.noCast = true; scene.add(tb); }
    for (let i = 0; i <= 5; i++) { const a = (i / 5 - 0.5) * SG_SW / SG_SR, x = SG_SR * Math.sin(a), z = SG_SZ + SG_SR * (1 - Math.cos(a)); scene.add(rb(1.2, SG_SY0, 1.2, M.dark, x, SG_SY0 / 2, z + 0.2, 0)); } }   // feet
  // ---- the chip lift: a floor hatch with a glowing rim, the deck + piston, the giant chip (package, gold contacts, glowing die)
  { const [hx, hz] = SG_CHIP; for (const [w, d, x, z] of [[17, 0.3, 0, -3.4], [17, 0.3, 0, 3.4], [0.3, 7, -8.5, 0], [0.3, 7, 8.5, 0]]) { const r = rb(w, 0.12, d, M.green, hx + x, 0.06, hz + z, 0); r.userData.noCast = true; scene.add(r); }
    s.lift = new THREE.Group(); scene.add(s.lift); s.lift.add(rb(16.4, 0.6, 6.4, M.dark, 0, -0.3, 0, 0)); s.lift.add(cyl(1.2, 1.2, 24, M.chrome, 0, -12.6, 0, 0, 16));
    const chip = new THREE.Group(); chip.position.set(0, 0, 0); chip.rotation.x = -0.18; s.lift.add(chip); s.chip = chip;
    chip.add(rb(14.5, 14.5, 1.3, c3Prop('#1f4a34', { rough: 0.5 }), 0, 7.35, 0, 0));
    const face = pl(14.2, 14.2, c3Prop('#ffffff', { map: sgTexChipFace(), rough: 0.45 }), 0, 7.35, 0.66); chip.add(face);
    SG.dieM = c3Prop('#ffffff', { map: sgTexDie(), rough: 0.4, metal: 0.2, env: 0.35, emissive: '#5aff88', ei: 1.2, emissiveMap: sgTexDieGlow(), glow: '#5aff88' });
    chip.add(rb(8.2, 8.2, 0.9, c3Prop('#343a46', { rough: 0.4, metal: 0.3, env: 0.4 }), 0, 7.35, 0.95, 0)); chip.add(pl(7.9, 7.9, SG.dieM, 0, 7.35, 1.41)); chip.add(rb(14.5, 0.5, 1.6, c3Prop('#e8b84a', { metal: 0.7, rough: 0.3 }), 0, 0.25, 0, 0));
    for (const sx of [-1, 1]) chip.add(rb(0.5, 14.5, 1.6, c3Prop('#e8b84a', { metal: 0.7, rough: 0.3 }), sx * 7.25, 7.35, 0, 0));
    s.lift.position.set(hx, -16, hz); }
  // ---- totems (LED pillars): frame + screen face; the right one is the janitor's mirror in A'
  s.tot = []; s.totC = canvasTex(256, 720);
  for (const [x, z, ry] of SG_TOT) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    SG.totM ||= c3Prop('#1e2030', { rough: 0.5 }); g.add(rb(7.6, 18.2, 1.1, SG.totM, 0, 9.3, 0, 0)); g.add(rb(8.4, 0.5, 2.4, M.dark, 0, 0.25, 0, 0));
    const f = pl(6.8, 17.2, c3Flat('#ffffff', { map: s.totC.t }), 0, 9.4, 0.57); f.material.userData.c3keep = true; f.userData.noCast = true; g.add(f); s.tot.push(g); }
  // ---- truss: front (z 8) + rear (z -13) spans at y 44, towers at x ±48; line arrays; moving heads
  { const S = [...sgTruss([-48, 44, 8], [48, 44, 8], 1.8), ...sgTruss([-48, 44, -13], [48, 44, -13], 1.8), ...sgTruss([-48, 0, 8], [-48, 44, 8], 1.8), ...sgTruss([48, 0, 8], [48, 44, 8], 1.8), ...sgTruss([-48, 44, 8], [-48, 44, -13], 1.8), ...sgTruss([48, 44, 8], [48, 44, -13], 1.8)];
    scene.add(sgTubes(S, M.truss)); for (const sx of [-1, 1]) scene.add(rb(3.4, 0.4, 3.4, M.dark, sx * 48, 0.2, 8, 0)); }
  for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 38, 42, 12); scene.add(g); g.add(cyl(0.08, 0.08, 4, M.black, 0, 2, 0, 0, 6));
    for (let i = 0; i < 9; i++) { const b = rb(4.2, 1.5, 2.4, M.black, 0, -i * 1.55, i * i * 0.04, 0); b.rotation.x = -i * 0.05; g.add(b); const gr = pl(3.8, 1.1, M.grille, 0, -i * 1.55, 1.22 + i * i * 0.04, 0, -i * 0.05); g.add(gr); } }
  s.movers = []; s.beams = [];
  const BC = ['#ff5ad8', '#5ad8ff', '#fff0c8', '#7cff9a', '#ff5ad8', '#5ad8ff'];
  [-36, -24, -12, 12, 24, 36].forEach((x, i) => { const mv = sgMover(M, true); mv.g.position.set(x, 43, 8); scene.add(mv.g); mv.col = BC[i]; mv.i = i; s.movers.push(mv);
    const b = sgBeam(BC[i], 60, 0.4, 5.5, 0.1); scene.add(b); c3Layer(b, C3.L_BG); mv.beam = b; s.beams.push(b); });
  s.floorMovers = []; [-34, -20, 20, 34].forEach((x, i) => { const mv = sgMover(M, false); mv.g.position.set(x, 0, -14.5); scene.add(mv.g); mv.col = i % 2 ? '#7cff9a' : '#c87aff'; mv.i = i;
    const b = sgBeam(mv.col, 70, 0.4, 6, 0.09); scene.add(b); c3Layer(b, C3.L_BG); mv.beam = b; s.floorMovers.push(mv); });
  // the follow spot: a fixture on the front truss, its beam, a real SpotLight and a warm pool on the deck
  s.fsPos = [16, 42.5, 9]; { const mv = sgMover(M, true); mv.g.position.set(16, 43, 8); scene.add(mv.g); s.fsMover = mv; }
  s.fsBeam = sgBeam('#ffe6b8', 1, 0.3, 1, 0.12); scene.add(s.fsBeam); c3Layer(s.fsBeam, C3.L_BG);
  s.fs = new THREE.SpotLight('#ffe2b8', 2.6, 140, 0.12, 0.45, 1.0); s.fs.position.set(...s.fsPos); s.fs.layers.enableAll(); scene.add(s.fs); scene.add(s.fs.target);
  s.pool = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ map: sgTexPool('rgba(255,224,170,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  s.pool.rotation.x = -Math.PI / 2; s.pool.renderOrder = 3; Object.assign(s.pool.userData, { noCast: true, noShade: true, noInk2: true }); scene.add(s.pool);
  // ---- stage dressing: monitor wedges, a stool + water bottle, gaffer X marks, taped cable run to the mic, stairs
  for (const x of [-7, 7]) { const g = new THREE.Group(); g.position.set(x, 0, 13.4); g.rotation.y = x < 0 ? 0.25 : -0.25; scene.add(g); const w = rb(4.2, 1.6, 2.2, M.black, 0, 0.8, 0, 0); w.rotation.x = -0.45; g.add(w); const gr = pl(3.8, 1.3, M.grille, 0, 1.1, 0.95, 0, -0.45 - Math.PI / 2 + Math.PI / 2); gr.rotation.x = -0.45 - 0.0; g.add(gr); }
  { const g = new THREE.Group(); g.position.set(-15, 0, 4); scene.add(g); g.add(cyl(1.2, 1.2, 0.3, M.black, 0, 5.4, 0, 0, 20)); for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.4, lg = cyl(0.1, 0.12, 5.4, M.chrome, Math.cos(a) * 0.9, 2.7, Math.sin(a) * 0.9, 0, 6); lg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); g.add(lg); }
    g.add(cyl(0.95, 0.95, 0.1, M.chrome, 0, 2.2, 0, 0, 16)); g.add(cyl(0.32, 0.32, 1.5, c3Prop('#8ad0ff', { rough: 0.1, transparent: false }), 0.2, 6.3, 0.1, 0, 12)); g.add(cyl(0.2, 0.2, 0.3, c3Prop('#2a6ad8'), 0.2, 7.2, 0.1, 0, 12)); }
  for (const [x, z] of [[0, 2], [-6, 6], [6, -1], [SG_MS[0], SG_MS[1]]]) for (const r of [0.6, -0.6]) { const tp = pl(1.6, 0.25, c3Prop('#f2c21a', { rough: 0.7 }), x, 0.02, z, r, -Math.PI / 2); tp.rotation.set(-Math.PI / 2, 0, r + 0.2); tp.userData.noCast = true; scene.add(tp); }
  { const P = [V3(30, 0.15, 10), V3(18, 0.15, 9), V3(10, 0.15, 6.5), V3(SG_MS[0] + 0.8, 0.15, SG_MS[1] + 0.2)]; const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 40, 0.12, 6), M.black); c.userData.noCast = true; scene.add(c);
    for (let i = 1; i < 6; i++) { const q = new THREE.CatmullRomCurve3(P).getPoint(i / 6), tp = pl(0.5, 0.9, c3Prop('#3a3a4a'), q.x, 0.2, q.z, 0, -Math.PI / 2); tp.userData.noCast = true; scene.add(tp); } }
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) scene.add(rb(6, 1.25, 1.6, M.fascia, sx * 30, -0.62 - k * 1.25, 17.2 + k * 1.6, 0));
  // ---- the house: rows of red seats (instanced), aisle in the middle
  { const geo = c3RBox(3.0, 3.0, 0.6, 0.2), geoS = c3RBox(3.0, 0.5, 2.2, 0.15), P = []; for (let z = 21; z < 75; z += 4.5) for (let x = -46; x <= 46; x += 3.4) { if (Math.abs(x) < 4.5) continue; P.push([x, z]); }
    const back = new THREE.InstancedMesh(geo, M.seat, P.length), seat = new THREE.InstancedMesh(geoS, M.seat, P.length), M4 = new THREE.Matrix4();
    P.forEach(([x, z], i) => { const y = sgFloorY(z); M4.makeTranslation(x, y + 2.6, z + 1.0); back.setMatrixAt(i, M4); M4.makeTranslation(x, y + 1.5, z); seat.setMatrixAt(i, M4); });
    back.userData.noCast = true; seat.userData.noCast = true; scene.add(back); scene.add(seat); }
  // ---- front-row fans (A only): billboards from behind, cheering
  s.fans = []; { const R = RNG('sgfans'); const T = [0, 1, 2, 3].map((v) => [0, 1, 2].map((k) => sgTexFan(v, k)));
    for (const [z, x0, n] of [[20.6, -34, 16], [25.1, -36, 17]]) for (let i = 0; i < n; i++) { const x = x0 + i * 4.4 + R.n(0.5); if (Math.abs(x) < 4.6) continue; const sc = R.r(0.92, 1.08);
      const mat = new THREE.MeshBasicMaterial({ map: T[0][i % 3], alphaTest: 0.5, transparent: false, side: THREE.DoubleSide }); mat.toneMapped = false; mat.userData.c3keep = true;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5.6 * sc, 10.5 * sc), mat); m.geometry.translate(0, 5.25 * sc, 0); m.position.set(x, sgFloorY(z), z); Object.assign(m.userData, { c3catch: true, noCast: true, noShade: true, noInk2: true });
      scene.add(m); s.fans.push({ m, T, k: i % 3, ph: R.f() * TAU, sp: R.r(5, 8), kind: R.f() < 0.22 ? 2 : (R.f() < 0.5 ? 1 : 3) }); }
    s.fanT = T; }
  sgExterior(s, M, scene);
  // ---- FOCUS: mic stand + the leather jacket prop, Huang's sheet, the flying OCT leaf, the jacket glint, janitor props
  s.mic = sgMicStand(M); s.mic.position.set(SG_MS[0], 0, SG_MS[1]); s.mic.rotation.y = -0.3; F.add(s.mic);
  s.jacket = sgJacket(M); F.add(s.jacket);
  s.sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), c3Prop('#ffffff', { map: sgTexSheet(), rough: 0.7 })); s.sheet.geometry.translate(0, -1.6, 0); s.sheet.material.side = THREE.DoubleSide; F.add(s.sheet);
  s.leaf = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 16, 1), c3Prop('#ffffff', { map: sgTexLeaf(), rough: 0.7 })); s.leaf.material.side = THREE.DoubleSide; s.leaf.geometry.translate(0, -0.5, 0); s.leafP0 = Float32Array.from(s.leaf.geometry.attributes.position.array); F.add(s.leaf);
  s.glintC = canvasTex(360, 520); s.glint = spritePlane(scene, s.glintC.t, SG_GW, SG_GH, 12); s.glint.material.blending = THREE.AdditiveBlending;   // FIX3: the jacket shine (redrawn: a torso mask + a travelling diagonal streak)
  s.glintStar = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.translate(w / 2, h / 2); const gl = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.3); gl.addColorStop(0, 'rgba(255,255,255,0.9)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = '#ffffff'; for (const [r0, r1, rot] of [[0.5, 0.05, 0], [0.3, 0.035, Math.PI / 4]]) { g.save(); g.rotate(rot); g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? w * r1 : w * r0; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.restore(); } }, 128, 128), 1.4, 1.4, 13);
  s.glintStar.material.blending = THREE.AdditiveBlending;
  { s.bucket = new THREE.Group(); F.add(s.bucket); const b = cyl(1.0, 0.85, 1.7, M.yellow, 0, 1.15, 0, 0, 18); s.bucket.add(b); s.bucket.add(cyl(0.88, 0.88, 0.05, c3Prop('#7a8aa8', { rough: 0.2 }), 0, 1.9, 0, 0, 18));
    s.bucket.add(rb(1.6, 0.9, 0.5, c3Prop('#2a2a34'), 0, 2.2, -0.75, 0)); for (const [x, z] of [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.6], [0.7, 0.6]]) s.bucket.add(cyl(0.18, 0.18, 0.2, M.black, x, 0.14, z, 0, 8)); s.bucket.add(rb(2.4, 0.16, 1.9, c3Prop('#2a2a34'), 0, 0.3, 0, 0)); }
  { s.mop = new THREE.Group(); F.add(s.mop); s.mop.add(cyl(0.09, 0.09, 8.4, M.wood, 0, 4.4, 0, 0, 8)); s.mop.add(cyl(0.28, 0.28, 0.35, M.black, 0, 0.35, 0, 0, 10));
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, st = cyl(0.09, 0.06, 1.1, M.mopH, Math.cos(a) * 0.22, -0.05, Math.sin(a) * 0.22, 0, 5); st.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); s.mop.add(st); } }
  // the dark glass over the right totem (A'): a tinted sheen in front of the reflection
  { const [x, z, ry] = SG_TOT[1]; s.glass = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 17.2), new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(10,14,34,0.3)'); gr.addColorStop(0.42, 'rgba(10,14,34,0.18)'); gr.addColorStop(0.5, 'rgba(170,190,255,0.26)'); gr.addColorStop(0.56, 'rgba(10,14,34,0.18)'); gr.addColorStop(1, 'rgba(10,14,34,0.34)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 128, 320), transparent: true, depthWrite: false, toneMapped: false }));
    s.glass.position.set(x + Math.sin(ry) * 0.62, 9.4, z + Math.cos(ry) * 0.62); s.glass.rotation.y = ry; s.glass.renderOrder = 25; Object.assign(s.glass.userData, { noCast: true, noShade: true, noInk2: true }); F.add(s.glass);
    const n = V3(Math.sin(ry), 0, Math.cos(ry)), tg = V3(Math.cos(ry), 0, -Math.sin(ry)), c = V3(x, 9.4, z).addScaledVector(n, 0.6); s.mirror = { n, tg, c, hw: 3.4, hh: 8.6 }; }
  c3Layer(F, C3.L_FOCUS);
  for (const k of ['huang', 'SGjan', 'SGjanL', 'SGjanR']) toonPerson(s, k);
  { const p = s.p.SGjanR; p.card.userData.noInk2 = true; s.mirPlanes = [0, 1, 2, 3].map(() => new THREE.Plane()); p.mat.clippingPlanes = s.mirPlanes; }
  haze(scene, '#2a2a6a', 0.0032);
  c3Env(scene, { top: '#c8d0ff', mid: '#6a4ab8', bot: '#1a1430', cards: [[0, 20, -30, 60, 20, '#7cffb8'], [-30, 10, 10, 10, 18, '#ff8ad8'], [30, 12, -10, 10, 18, '#8ad8ff'], [0, 30, 20, 30, 6, '#fff0d8']] });
  c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  // coloured practicals (modulated per frame): magenta/cyan washes on the sides, green from the screen, warm front fill
  s.wash = []; for (const [x, y, z, c, I, d] of [[-30, 14, 6, '#ff5ad8', 1.4, 60], [30, 14, 6, '#5ad8ff', 1.4, 60], [0, 18, -10, '#7cffc8', 1.2, 50], [0, 12, 26, '#ffd8b0', 0.9, 50], [-46, 20, 34, '#7a5aff', 1.0, 60], [46, 20, 34, '#ff6ab8', 1.0, 60]]) {
    const l = new THREE.PointLight(c, I, d, 1.6); l.position.set(x, y, z); l.layers.enableAll(); scene.add(l); s.wash.push([l, I]); }
  c3SetLook(scene, { grime: 0.6, scale: 0.5, inkSet: false, focusK: 0.8, bounce: ['#8ab0ff', '#7a3a7a', 0.12] });
  return s;
}
const SG_get = () => SG.s ||= sgBuild();
SETS.stage = SG_get;

// =====================================================================
//  the continuous camera (absolute seconds). REV4 (user: "the settle makes people dizzy"): the travelling moves between
//  subjects stay (fly-in, orbits, cranes, tilt-ups, the leaf whip), but every HOLD is ONE gentle one-directional drift
//  (each component monotone, distance-to-target monotone, roll easing to one side and staying); the distance reverses
//  only where a new leg departs. A: fly-in onto Huang (drifts on left + in) -> orbit right + pull back to the calendar
//  (slow orbit right + pull) -> drop to the low hero on "AI boom" (slow push) -> rise + orbit right onto the sheet (push,
//  dutch eases in) -> pull back + tilt up to "NVIDIA 1993" (slow orbit left + crane up) -> crane down + push to the jacket
//  (slow push) -> pull back over the year snapshots (drift back) -> crane up to the OCT pad (drift) -> follow the leaf,
//  whip out right. A': whip in onto "1993 -> 2026" -> one slow crane back + up over the calendar -> push to the stand as
//  the spot finds the jacket (slow push + orbit) -> orbit left to the mirror (drift) -> the jacket back on the stand,
//  centred, then one slow push-in + orbit right to the end (64.2; the lead's meme explosion sits over 62.45-64.2).
//  Front row fans (z 20.6 / 25.1) avoided (camera low only at z < 19.5 or between rows above their heads).
// =====================================================================
CAMSEQ.stage = [
  [0.00, [0, 46, 168], [0, 34, 0], 60, 0],   // outside the arena (night plaza, glass facade), barely creeping...
  [0.30, [-0.2, 44, 157], [0, 30, 0], 57, -0.5],
  [0.52, [-0.2, 35, 114], [0.3, 11.4, 0], 52, -1.5],   // ...then a fast dolly through the open bay of the glass (z 80) and down over the crowd...
  [0.70, [-1.8, 20.5, 56], [0.7, 9.6, 0], 47, -3],
  [0.88, [-5.6, 11.2, 26.4], [1.3, 8.7, 0], 45, -2],   // ...landing on "Huang" (0.88), him whole, arms spreading
  [1.20, [-8.24, 9.6, 22.4], [2.36, 8.88, 0], 44, -0.5],   // HOLD on Huang: the fly-in keeps drifting left + in, decelerating
  [1.34, [-8.86, 9.58, 21.26], [2.36, 8.88, 0], 44, -0.2],
  [1.98, [7.44, 14, 27.95], [-3.36, 10.7, -9], 48, 3],   // "weeks": orbit right + crane up + pull back, the calendar on the screen
  [3.35, [11.46, 14, 29.02], [-3.36, 10.7, -9], 48, 4],   // HOLD: one slow orbit right + gentle pull back (no in/out), roll eases to 4
  [3.85, [3.53, 6, 18.63], [-0.48, 16.4, -6], 54, -1],   // "AI boom": dropped to the low hero, pushed in
  [4.50, [2.07, 6.62, 17.32], [-0.48, 16.4, -6], 54, -1.5],   // HOLD: slow push-in
  [5.12, [3.87, 8.2, 17.52], [0, 10.4, 0.5], 45, -4],   // "resignation": rise + orbit right onto him and the sheet
  [5.86, [5.92, 9, 16.65], [0.6, 9.6, 1.2], 45, -7],   // HOLD: slow orbit right + push in, dutch eases IN to -7 and stays
  [6.50, [1.78, 6, 18.91], [-0.5, 17.6, -12], 52, 2],   // "Nvidia": pull back + tilt up to "NVIDIA 1993", his head whole at the bottom
  [7.35, [-1.53, 6.39, 21.15], [-0.5, 18.2, -12], 52, 3],   // HOLD: slow orbit left + crane up, drifting back
  [8.10, [-2.39, 7.6, 13.25], [0.51, 9.48, -1], 44, -2],   // "jacket": crane down + push in (orbit keeps going left)
  [8.62, [-2.24, 7.69, 12.54], [0.51, 9.48, -1], 44, -2.5],   // HOLD: slow push-in on the shine
  [9.05, [-5.44, 9.5, 23.83], [1.86, 10.85, -6], 46, 1],   // "for years": pull back over the year snapshots
  [9.62, [-7.43, 9.43, 24.88], [1.86, 10.85, -6], 46, 1.5],   // HOLD: keeps drifting back + left
  [9.90, [4.04, 12.5, 30.72], [0, 16.3, -8], 46, -2],   // "Then": orbit right + crane up to the OCT pad
  [10.45, [5.55, 12.39, 31.71], [0, 16.3, -8], 46, -2.5],   // HOLD: slow drift right/back as the leaf peels
  [10.88, [-0.8, 15, 24.99], [5, 16.8, -6], 44, 3],   // follow the leaf right...
  [11.12, [1.2, 15.5, 23], [13, 17.2, 1], 46, 4],   // ...whip out right
  [11.40, [1.4, 15.5, 22.5], [18, 16.5, 8], 46, 5],
  [58.30, [1.2, 12.4, 31.5], [-24, 13.5, -30], 48, -4],
  [58.46, [1.4, 12.4, 31.5], [-12, 14, -36], 48, -3],   // whip in...
  [58.86, [2, 12, 30], [7.2, 15, -18], 56, 0],   // ..."1993 -> 2026" (janitor whole on the right)
  [60.25, [8, 15, 36], [4, 17, -18], 54, -2],   // HOLD 58.86-60.25: one slow crane back + up + orbit right (the calendar), no reversal
  [60.75, [5, 10.6, 26], [8.4, 6.9, -5], 41, 1.5],   // the spot finds the jacket: pushed in on the stand + janitor
  [61.20, [6.72, 10.42, 24.58], [8.4, 6.9, -5], 41, 2],   // HOLD: slow push + orbit right through the grab
  [61.58, [-2.5, 14, 21], [12, 5.5, -6], 46, 3],   // the mirror: orbit left + up, him + his reflection
  [61.90, [-3.74, 14.17, 21.01], [12, 5.5, -6], 46, 3.5],   // HOLD: keeps drifting left + up
  [62.40, [-0.8, 10.4, 21.35], [6.3, 6.8, -3.4], 46, 1.5],   // the jacket back on the stand, centred (janitor whole on the right)
  [63.30, [0.42, 10.2, 21.07], [6.3, 6.8, -3.4], 46, 1],   // END HOLD 62.40-64.20: one slow push-in (~5 %) + orbit right from the left side (janitor clear on the right), jacket centred for the meme
  [64.20, [1.61, 10, 20.74], [6.3, 6.8, -3.4], 46, 0.8],
];

// =====================================================================
//  the frame
// =====================================================================
const SG_HEXPR = [[0, 'smile'], [0.86, 'grin'], [1.72, 'smug'], [2.58, 'talk'], [3.74, 'laugh'], [4.56, 'grin'], [5.12, 'nervous'], [5.48, 'sad'], [6.02, 'smug'], [7.84, 'smug'], [8.1, 'grin'], [9.12, 'happy'], [9.78, 'surprised'], [10.4, 'shock'], [10.7, 'worried']];
const SG_SPREAD = { h: [0.74, -0.1], pole: [0.3, 1], hand: 'open' }, SG_LAPEL = { h: [-0.06, 0.27], pole: [1, 0.6], front: true, hand: 'grip' };
const SG_HR = [[0, 'down'], [0.8, SG_SPREAD], [1.72, { h: [0.62, -0.62], pole: [1, 0.5], hand: 'point' }], [2.58, 'talk'], [3.74, 'up'], [4.56, { h: [-0.12, 0.3], pole: [1, 0.5], front: true, hand: 'grip' }],
  [5.0, { h: [0.32, -0.28], pole: [1, 0.6], hand: 'grip' }], [5.9, 'pocket'], [6.58, { h: [0.6, -0.6], pole: [1, 0.5], hand: 'point' }], [7.32, SG_LAPEL], [8.44, 'talk'], [8.86, { h: [0.62, -0.38], pole: [0.6, 1], hand: 'open' }], [9.78, { h: [0.6, -0.64], pole: [1, 0.5], hand: 'point' }], [10.4, 'shrug']];
const SG_HL = [[0, 'down'], [0.8, SG_SPREAD], [1.72, 'hip'], [3.74, 'up'], [4.56, 'down'], [7.32, SG_LAPEL], [8.44, 'hip'], [8.86, { h: [0.6, -0.3], pole: [0.6, 1], hand: 'open' }], [9.78, 'hip'], [10.4, 'up']];
const SG_HLOOK = [[0, [0, 40]], [1.72, [-2, -18]], [2.58, [5, 40]], [3.74, [0, 40]], [5.12, [8, 30]], [5.9, [0, -18]], [7.32, [-2, 40]], [8.44, [-8, 40]], [8.86, [-3, -18]], [9.42, [2, 40]], [9.78, [0, -18]], [10.62, [16, 10]]];
function sgHuang(s, t, cam) {
  const [x, z] = SG_HU, dip = (a, b, k) => t > a && t < b ? k * Math.sin(Math.PI * sgE(a, b, t)) : 0;
  const squash = dip(0.58, 0.8, 0.35) + dip(0.8, 1.02, -0.15) + dip(3.6, 3.76, 0.3) + dip(3.76, 4.0, -0.2) + dip(5.08, 5.3, 0.2) + dip(10.4, 10.62, 0.35);
  const lean = dip(0.8, 1.14, -0.05) + dip(5.12, 5.8, 0.06) + dip(8.1, 8.5, -0.06) + dip(10.4, 10.9, -0.08);
  const gaze = t >= 7.32 && t < 8.44 ? [0.1, 0.75] : t >= 1.72 && t < 2.58 ? [0, -0.6] : t >= 9.78 && t < 10.62 ? [0, -0.6] : t >= 10.62 ? [0.6, -0.2] : [0, 0];
  pose(s, 'huang', t, x, z, { facing: sgFace(cam, x, z, SG_HLOOK, t), expr: SG_HEXPR, hand: { R: SG_HR, L: SG_HL }, gaze, squash, lean, fx: t > 8.1 && t < 8.7 ? 'sparkle' : undefined, talk: 0 });
  // the resignation sheet: out of the jacket on "handing in", unfolds as it rises, held up on "resignation", tucked away on "You"
  if (t >= 4.84 && t < 6.05) { const unf = EZ.o3(sgE(4.86, 5.08, t)), tuck = EZ.i2(sgE(5.9, 6.05, t)); s.sheet.scale.set(0.3 + 0.7 * unf, Math.max(0.05, (0.2 + 0.8 * unf) * (1 - tuck)), 1);
    gripProp(s, s.sheet, 'huang', 'R', V3(0, -0.15, 0), { behind: -0.35, ry: Math.atan2(cam.position.x - x, cam.position.z - z), rz: 0.08 }); sgDot(s, 'huang', 'R'); }
  // the jacket shine on "jacket" (8.10), Ricks-style: a bright diagonal specular streak travels over the leather (upper left ->
  // lower right) inside a torso-shaped mask, a thin second streak trails it, then a big sparkle pops on the lapel
  const gk = sgE(8.06, 8.56, t), d = cam.position.clone().sub(V3(x, SG_GY, z)).setY(0).normalize(), rt = V3(d.z, 0, -d.x);
  if (gk > 0 && gk < 1) { const e = EZ.io(gk), env = Math.min(1, 4 * Math.sin(Math.PI * gk)); s.glint.visible = true; s.glint.position.set(x, SG_GY, z).addScaledVector(d, 0.7); s.glint.quaternion.copy(cam.quaternion);
    s.glint.material.opacity = env; redraw(s.glintC, 'g' + Math.round(e * 90), (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.beginPath(); g.moveTo(w * 0.2, 0); g.lineTo(w * 0.8, 0); g.quadraticCurveTo(w * 1.0, h * 0.08, w * 0.98, h * 0.4); g.quadraticCurveTo(w * 0.98, h * 0.95, w * 0.7, h); g.lineTo(w * 0.3, h); g.quadraticCurveTo(w * 0.02, h * 0.95, w * 0.02, h * 0.4); g.quadraticCurveTo(0, h * 0.08, w * 0.2, 0); g.closePath(); g.clip();
      const c = -0.85 + 1.7 * e, L = Math.hypot(w, h); g.translate(w / 2, h / 2); g.rotate(-0.62); const band = (o, bw, a) => { const y = (c + o) * L * 0.5, gr = g.createLinearGradient(0, y - bw, 0, y + bw); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(235,245,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-L, y - bw, 2 * L, 2 * bw); };
      band(0, 70, 0.55); band(0, 18, 1); band(-0.2, 9, 0.8); g.restore(); }); }
  const sk = sgE(8.3, 8.8, t); if (sk > 0 && sk < 1) { s.glintStar.visible = true; s.glintStar.position.set(x, SG_GY + SG_GH * 0.3, z).addScaledVector(d, 0.9).addScaledVector(rt, SG_GW * 0.22); s.glintStar.quaternion.copy(cam.quaternion); s.glintStar.rotateZ(sk * 2.4); s.glintStar.scale.setScalar(EZ.back(Math.min(1, sk * 3)) * (1 - EZ.i2(sgE(0.6, 1, sk))) * 1.3); }
}
// the OCT leaf: sits on the screen pad until 10.4, peels about its top edge (curl), tears free and flies right toward the camera
function sgLeaf(s, t, cam) {
  const Py = SG_HD + 810 * 0.38, pw = 20 * 0.74 * SG_CS, ph = SG_SH * (810 / SG_CH) * 0.44 * SG_CS, py = SG_SY0 + SG_SH * (1 - (Py + (SG_HD + 810 * 0.16 - Py) * SG_CS) / SG_CH);   // pad leaf size / top edge (world)
  const T0 = 10.4, T1 = 10.6, m = s.leaf, P = m.geometry.attributes.position, P0 = s.leafP0; m.visible = t >= 9.66 && t < 11.3;
  if (!m.visible) return; m.scale.set(pw, ph, 1);
  const peel = EZ.i2(sgE(T0, T1, t)), fly = Math.max(0, t - T1);
  for (let i = 0; i < P.count; i++) { const x = P0[i * 3], y = P0[i * 3 + 1], v = -y; P.setXYZ(i, x, y + 0.02 * Math.sin(v * Math.PI) * peel, (peel * 0.5 + fly * 0.8) * v * v * 0.6 + 0.1 * Math.sin(x * 6 + t * 9) * Math.min(1, fly * 3)); }
  P.needsUpdate = true; m.geometry.computeVertexNormals();
  const base = V3(0, py, SG_SZ + 0.35); if (t < T1) { m.position.copy(base); m.rotation.set(-1.2 * peel, 0, 0); return; }
  const u = fly / 0.7, target = V3(13, 13, 2); m.position.set(lerp(base.x, target.x, EZ.o2(u)), lerp(base.y, target.y, u) + 2.5 * Math.sin(Math.PI * Math.min(1, u)), lerp(base.z, target.z, EZ.o2(u)));
  m.rotation.set(-1.2 - fly * 3.5, fly * 4.2, fly * 2.4); m.scale.multiplyScalar(1 - 0.25 * clamp(u));
}
// the janitor + reflection; who = 'SGjan' (overalls) or 'SGjanL' (in the jacket)
function sgJanitor(s, t, cam) {
  const J0 = [10.2, 0.8], J1 = [8.9, -2.0], BK = [13.0, 2.6], [mx, mz] = SG_MS;
  const inL = t >= 61.12 && t < 62.12, who = inL ? 'SGjanL' : 'SGjan';
  // position: mops at J0 (small sweeps), steps to J1 next to the stand at 60.68, a half step toward the mirror at 61.28, back at 61.96
  let x = J0[0], z = J0[1], moving = false, dist = 0;
  const walk = (a, b, P, Q) => { const u = sgE(a, b, t); if (u > 0 && u < 1) moving = true; x = lerp(P[0], Q[0], EZ.io(u)); z = lerp(P[1], Q[1], EZ.io(u)); dist += Math.hypot(Q[0] - P[0], Q[1] - P[1]) * u; };
  const J2 = [10.2, -1.6];
  if (t < 58.46 + 1.6) { x = J0[0] + 0.5 * Math.sin((t - 58.46) * 2.4); z = J0[1] + 0.25 * Math.sin((t - 58.46) * 1.2); }
  else { walk(60.62, 60.9, J0, J1); if (t >= 60.92) { x = J1[0]; z = J1[1]; } if (t >= 61.26) walk(61.26, 61.42, J1, J2); if (t >= 61.94) walk(61.94, 62.1, J2, J1); if (t >= 62.1) { x = J1[0]; z = J1[1]; } }
  if (t >= 62.56) { const u = sgE(62.56, 62.8, t); x = lerp(J1[0], J1[0] + 0.7, EZ.io(u)); z = lerp(J1[1], J1[1] + 0.6, EZ.io(u)); moving = u > 0 && u < 1; }
  const mir = s.mirror, Pm = V3(x, 0, z), d = Pm.clone().sub(mir.c).dot(mir.n), RP = Pm.clone().addScaledVector(mir.n, -2 * d);   // reflection point
  // facing: toward the stand / the mirror / the camera; the two outfit swaps hide inside a quick spin through 'back'
  const look = t < 60.56 ? [x - 4, z + 2] : t < 60.68 ? [mx, mz] : t < 61.0 ? [mx, mz] : t < 61.26 ? [x, z + 20] : t < 61.94 ? [RP.x, RP.z] : t < 62.2 ? [x, z + 20] : t < 62.5 ? [mx, mz] : [x - 2, z + 20];
  let facing = toonLookFacing(cam, x, z, look[0] - x, look[1] - z);
  if ((t > 61.02 && t < 61.2) || (t > 62.02 && t < 62.2)) { const a = t < 61.5 ? 61.02 : 62.02, u = (t - a) / 0.18; facing = u > 0.3 && u < 0.72 ? 'back' : (u <= 0.3 ? facing * (1 + u) : facing); }
  const ex = [[0, 'bored'], [60.56, 'surprised'], [60.8, 'thinking'], [60.98, 'excited'], [61.22, 'smug'], [61.5, 'grin'], [61.86, 'nervous'], [62.24, 'sad'], [62.5, 'deadpan']];
  const grabbing = t >= 60.86 && t < 61.12, handing = t >= 62.12 && t < 62.4;
  const reach = { h: [0.5, 0.05], pole: [1, 0.4], hand: 'grip' }, hold = { h: [0.18, -0.02], pole: [1, 0.6], front: true, hand: 'grip' };
  const mopping = t < 60.2, mopIn = t >= 60.2 && t < 60.42;
  const hand = mopping ? { R: { h: [0.06, 0.34], pole: [1, 0.4], front: true, hand: 'grip' }, L: { h: [-0.02, 0.56], pole: [1, 0.3], front: true, hand: 'grip' } }
    : mopIn ? { R: { h: [0.4, 0.2], pole: [1, 0.4], hand: 'grip' }, L: 'down' }
    : t < 60.86 ? { R: [[0, 'down'], [60.56, 'chin']], L: [[0, 'down'], [60.56, 'down']] }
    : grabbing ? { R: [[0, reach], [61.0, hold]], L: [[0, reach], [61.0, hold]] }
    : inL && t < 61.94 ? { R: [[0, SG_LAPEL], [61.5, 'hip']], L: [[0, SG_LAPEL], [61.5, SG_LAPEL]] }
    : inL ? { R: [[0, 'down'], [61.94, { h: [-0.06, 0.2], pole: [1, 0.6], front: true, hand: 'grip' }]], L: [[0, 'down'], [61.94, { h: [-0.06, 0.2], pole: [1, 0.6], front: true, hand: 'grip' }]] }
    : handing ? { R: [[0, hold], [62.24, reach]], L: [[0, hold], [62.24, reach]] }
    : { R: [[0, 'down'], [62.42, { h: [0.42, 0.2], pole: [1, 0.4], hand: 'open' }], [62.56, 'down']], L: [[0, 'down'], [62.56, 'front']] };
  const dip = (a, b, k) => t > a && t < b ? k * Math.sin(Math.PI * sgE(a, b, t)) : 0, squash = dip(60.56, 60.72, 0.35) + dip(61.12, 61.3, 0.3) + dip(61.5, 61.66, 0.2) + dip(62.12, 62.28, 0.25);
  const shimmy = t > 61.5 && t < 61.86 ? 0.05 * Math.sin((t - 61.5) * 26) : 0;
  const o = { facing, mode: moving ? 'walk' : 'stand', phase: dist / 3.2, stride: 3.2, expr: ex, hand, squash, lean: shimmy + (mopping ? 0.04 * Math.sin((t - 58.46) * 4.8) : 0), gaze: t >= 60.56 && t < 60.86 ? [0.3, -0.2] : [0, 0], fx: t > 61.22 && t < 61.6 ? 'sparkle' : (t > 61.86 && t < 62.3 ? 'sweat' : undefined) };
  pose(s, who, t, x, z, o);
  // the reflection (leather only, while he is near the mirror): mirrored position + look, swapped hands, darker; clipped to the glass
  if (inL) { const rl = toonLookFacing(cam, RP.x, RP.z, x - RP.x, z - RP.z), oh = o.hand, ro = Object.assign({}, o, { facing: o.facing === 'back' ? 0 : rl, hand: { R: oh.L, L: oh.R }, fx: undefined, alive: 0 });
    pose(s, 'SGjanR', t, RP.x, RP.z, ro); const p = s.p.SGjanR; p.mat.color.multiply(new THREE.Color('#5a6898')); p.sh.visible = false; if (p.shTwin) p.shTwin.castShadow = false;
    const E = cam.position, C = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => mir.c.clone().addScaledVector(mir.tg, a * mir.hw).add(V3(0, b * mir.hh, 0)));
    for (let k = 0; k < 4; k++) { const pk = s.mirPlanes[k]; pk.setFromCoplanarPoints(E, C[k], C[(k + 1) % 4]); if (pk.distanceToPoint(mir.c) < 0) pk.negate(); } }
  // props: the mop (sweeping / standing in the bucket), the bucket, the jacket (stand -> hands -> his back -> swap; reverse)
  const [bx, bz] = BK; s.bucket.visible = true; s.bucket.position.set(bx, 0, bz); s.bucket.rotation.y = 0.4; s.mop.visible = true;
  if (mopping) { const p = s.p[who], hR = c3ToonHandWorld(p, 'R'), hL = c3ToonHandWorld(p, 'L'); if (hR && hL) { const sw = 0.9 * Math.sin((t - 58.46) * 4.8), foot = V3(x + sw - 0.8, 0.3, z + 1.4), dir = hR.clone().sub(foot).normalize();
      s.mop.position.copy(foot).addScaledVector(V3(0, -1, 0), 0.3); s.mop.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); sgDot(s, who, 'R'); sgDot(s, who, 'L'); } }
  else { const u = EZ.io(sgE(60.2, 60.42, t)); s.mop.position.set(lerp(x - 0.5, bx + 0.2, u), 0.3 + 1.4 * u, lerp(z + 1.4, bz, u)); s.mop.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(-0.15 * u + 0.5 * (1 - u), 1, 0.1).normalize()); }
  const J = s.jacket, standP = V3(mx, SG_MSH + 0.1, mz), standRY = -0.3, yaw = Math.atan2(cam.position.x - x, cam.position.z - z);
  const handsAt = () => { const p = s.p[who], a = c3ToonHandWorld(p, 'L'), b = c3ToonHandWorld(p, 'R'); return a && b ? a.add(b).multiplyScalar(0.5) : V3(x, 7, z); };
  const toCam = cam.position.clone().sub(V3(x, 6, z)).setY(0).normalize();
  J.visible = !inL; J.scale.setScalar(1);
  // the swaps hide inside the spin: while his back is to the camera the jacket lies ON his back (its back panel to the
  // camera), so the leather card's back view takes over in the same place; no edge-on turns (the yaw flips with him)
  const isBack = facing === 'back', onBack = V3(x, 8.6, z).addScaledVector(toCam, 0.55);
  if (!inL) {
    if (t < 60.92 || t >= 62.4) { const settle = t >= 62.4 ? 0.06 * Math.sin((t - 62.4) * 18) * Math.exp(-(t - 62.4) * 6) : 0; J.position.copy(standP); J.rotation.set(settle, standRY, settle * 0.5); }
    else if (t < 61.12) { if (isBack) { J.position.copy(onBack); J.rotation.set(0, yaw + Math.PI, 0); }
      else { const u = EZ.io(sgE(60.92, 61.04, t)), up = EZ.o2(sgE(61.03, 61.08, t)), H = handsAt().addScaledVector(toCam, 0.9).add(V3(0, 0.15 + 0.9 * up, 0));
        J.position.copy(standP).lerp(H, u); J.rotation.set(0, lerp(standRY, yaw, u), 0); sgDot(s, who, 'R'); sgDot(s, who, 'L'); } }
    else { const u = EZ.io(sgE(62.24, 62.4, t)), H = handsAt().addScaledVector(toCam, 0.9).add(V3(0, 0.15, 0));
      if (isBack) { J.position.copy(onBack); J.rotation.set(0, yaw + Math.PI, 0); }
      else { J.position.copy(H).lerp(standP, u); J.rotation.set(0, lerp(yaw, standRY, u), 0); if (u < 0.6) { sgDot(s, who, 'R'); sgDot(s, who, 'L'); } } } }
}
// a dot hand OVER a held prop (the kit's gripDot pastes a square of the card, which showed the overalls over the jacket):
// a disc in the card's limb colour and light, the kit's grip size, always on top (trash-library dpDot)
function sgDot(s, who, nm) { const p = s.p[who], h = c3ToonHandWorld(p, nm); s.sgd ||= {}; const key = who + nm;
  let m = s.sgd[key]; if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: T3.limb, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 30; Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); c3Layer(m, C3.L_FOCUS); s.scene.add(m); s.sgd[key] = m; }
  if (!h || !p.g.visible) { m.visible = false; return; }
  const a = V3(0, 0, 0), b = V3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(s.cam); b.project(s.cam); const px = Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50;
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - px) / 1000 * 0.8)), r = 6.6 * (2 * T3.a * (p.o.headK ?? 1) / 100) * lk ** 0.8 * p.U;
  m.visible = true; m.scale.setScalar(r); m.position.copy(h).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.05); m.quaternion.copy(s.cam.quaternion); m.material.color.set(T3.limb).multiply(p.mat.color); }
function sgFrame(t) {
  const s = SG_get(); hideAll(s); hideGrips(s); if (s.sgd) for (const k in s.sgd) s.sgd[k].visible = false; const cam = seqCam(s, 'stage', t), A = t < 30;
  for (const k of ['sheet', 'glint', 'glintStar', 'leaf', 'bucket', 'mop', 'jacket']) s[k].visible = false;
  s.glass.visible = !A;
  // ---- LED wall + totems
  const st = sgScreenState(t); redraw(s.scr, JSON.stringify(st), (g, w, h) => sgDrawScreen(g, w, h, st)); sgTotemTex(s.totC, t);
  // ---- light levels: A = show (beams, washes; the spot narrows and the rest dims on "resignation"), A' = house half on, one spot
  const resig = A ? EZ.o2(sgE(5.12, 5.42, t)) * (1 - EZ.o2(sgE(5.86, 6.1, t))) : 0, show = A ? 1 - 0.6 * resig : 0;
  const kitK = s.scene.userData.c3shadow ? C3_SHADOW.key : 1, kitD = s.scene.userData.c3shadow ? C3_SHADOW.dark : 1;
  s.key.intensity = (A ? 0.9 - 0.3 * resig : 1.25) * kitK; s.amb.intensity = (A ? 0.3 - 0.05 * resig : 0.72) * kitD; s.hemi.intensity = (A ? 0.45 : 0.95) * kitD;   // FIX3: A' brighter (after-show house lights)
  s.rim.intensity = A ? 0.5 * show : 0.2;
  s.wash.forEach(([l, I], i) => { l.intensity = A ? I * show * (1 + 0.25 * Math.sin(t * 3 + i)) : (i === 3 ? 1.7 : i >= 4 ? 1.4 : i === 2 ? 1.1 : 0.95); });
  s.houseL.forEach((l) => { l.intensity = A ? 0 : 3.0; }); SG.totM.color.set(A ? '#1e2030' : '#44467a'); SG.M.house.emissiveIntensity = A ? 0.15 : 1.1;
  SG.dieM.emissiveIntensity = A ? (1.2 + 1.4 * EZ.o2(sgE(0.6, 1.2, t)) * (1 - 0.4 * EZ.o2(sgE(1.3, 1.9, t))) + 1.2 * Math.max(0, 1 - Math.abs(t - 3.95) / 0.5)) * (1 - 0.6 * resig) : 0.2;
  SG.M.green.emissiveIntensity = A ? 1.4 * (1 - 0.5 * resig) : 0.25; SG.M.cyan.emissiveIntensity = A ? 1.3 * (1 - 0.5 * resig) : 0.3;
  // chip lift: rises as the camera dives in (0.42-1.24, FIX3: visible when we land on "Huang"), stays; gone (lowered) in A'
  s.lift.position.y = A ? lerp(-16, 0.3, EZ.o3(sgE(0.42, 1.24, t))) - 0.08 * Math.sin(Math.max(0, t - 1.24) * 14) * Math.exp(-Math.max(0, t - 1.24) * 5) : -16;
  // moving heads: sweeping beams (A), off in A'
  for (const mv of s.movers) { const ph = t * (0.9 + 0.13 * mv.i) + mv.i * 1.7, boom = A && t > 3.74 && t < 5.12 ? 1 : 0;
    const tgt = [mv.g.position.x * 0.4 + 14 * Math.sin(ph), 0, 2 + 10 * Math.cos(ph * 0.8)]; mv.pan.rotation.y = Math.atan2(tgt[0] - mv.g.position.x, tgt[2] - mv.g.position.z);
    sgAim(mv.beam, [mv.g.position.x, 41.4, mv.g.position.z], tgt); mv.beam.visible = A && show > 0.3; mv.beam.material.uniforms.op.value = (0.08 + 0.06 * boom) * show; mv.lensM.emissiveIntensity = A ? 1.6 * show : 0.05; mv.lensM.emissive.set(A ? mv.col : '#202030'); }
  for (const mv of s.floorMovers) { const ph = t * 1.1 + mv.i * 2.1, tgt = [mv.g.position.x + 18 * Math.sin(ph), 60, -6 + 14 * Math.cos(ph * 0.7)]; sgAim(mv.beam, [mv.g.position.x, 1.8, mv.g.position.z], tgt);
    mv.beam.visible = A && show > 0.3; mv.beam.material.uniforms.op.value = 0.07 * show; mv.lensM.emissiveIntensity = A ? 1.4 * show : 0.05; mv.lensM.emissive.set(A ? mv.col : '#202030'); }
  // the follow spot: on Huang (A), narrows on "resignation"; A': parked on the empty centre, then swings and finds the jacket at 60.56
  { let tg, r; if (A) { tg = [SG_HU[0], 0, SG_HU[1] + 0.3]; r = 5.6 - 2.8 * resig; }
    else { const u = EZ.o3(sgE(SG_SPOT - 0.12, SG_SPOT + 0.06, t)), over = t > SG_SPOT + 0.06 ? 0.25 * Math.sin((t - SG_SPOT - 0.06) * 16) * Math.exp(-(t - SG_SPOT - 0.06) * 7) : 0;
      tg = [lerp(-3, SG_MS[0] + over, u), 0, lerp(3, SG_MS[1] + 0.4, u)]; r = lerp(5.2, 3.6, u); }
    const L = Math.hypot(tg[0] - s.fsPos[0], tg[1] - s.fsPos[1], tg[2] - s.fsPos[2]); s.fsBeam.scale.set(r * 0.9, L, r * 0.9); sgAim(s.fsBeam, s.fsPos, tg); s.fsBeam.visible = true; s.fsBeam.material.uniforms.op.value = A ? 0.1 + 0.06 * resig : 0.16;
    s.fs.target.position.set(...tg); s.fs.target.updateMatrixWorld(); s.fs.angle = Math.atan2(r * 1.15, L); s.fs.intensity = A ? 2.6 : 2.8;
    s.pool.position.set(tg[0], 0.04, tg[2]); s.pool.scale.setScalar(r * 1.25); s.pool.material.opacity = A ? 0.9 : 0.85; s.pool.visible = true;
    s.fsMover.pan.rotation.y = Math.atan2(tg[0] - s.fsPos[0], tg[2] - s.fsPos[2]); s.fsMover.lensM.emissive.set('#ffe6b8'); s.fsMover.lensM.emissiveIntensity = 1.8; }
  // fans: cheering in A (arms up on "Imagine" and "AI boom", hush on "resignation", clapping for the years), gone in A'
  for (const f of s.fans) { f.m.visible = A; if (!A) continue; f.m.rotation.y = Math.atan2(cam.position.x - f.m.position.x, cam.position.z - f.m.position.z);
    const hype = t < 1.6 || (t > 3.74 && t < 5.1) ? 1 : t > 5.12 && t < 5.86 ? -1 : 0, beat = Math.sin(t * f.sp + f.ph) > 0;
    const v = hype < 0 ? 0 : hype > 0 ? (f.kind === 2 ? 2 : beat ? 1 : 3) : (t > 8.4 && t < 9.6 ? (beat ? 3 : 0) : (f.kind === 2 ? 2 : 0)); f.m.material.map = f.T[v][f.k];
    f.m.position.y = sgFloorY(f.m.position.z) + (hype > 0 && beat ? 0.25 : 0); }
  // ---- people + props
  if (A) { sgHuang(s, t, cam); sgLeaf(s, t, cam); { const [mx, mz] = SG_MS; s.jacket.visible = false; void mx; void mz; } }
  else sgJanitor(s, t, cam);
  sgExtFrame(s, t, A && t < 1.5);
  c3Render(s.scene, cam, { bg: '#0c0c22', bgBlur: 1.4, glow: 0.4, glowBlur: 14 });
  sgZoomBlur(s, t);
}
for (const id of ['s01', 's02', 's03', 's04', 's21', 's22']) { SHOT_FN[id] = (t) => sgFrame(t); SNAPS[id] = 'free'; }

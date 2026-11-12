// =====================================================================
//  SET depot — the Çankaya sanitation depot break room (x -24..24, z 0..40, h 24). Teal walls with a dark-teal dado and
//  an orange rail. Back wall (z 0): the tea counter with the stainless tea urn, a red teapot and a tray of tulip glasses
//  (x -23.5..-14.5), the big window onto the yard with orange garbage trucks (x -13..-1), the notice board (SHIFT ROTA)
//  + clock (x 0..9), the safety poster, the door the coworker and the boss come through (x 14..20, hinge on the right).
//  Left wall: orange lockers (z 7.5..22) and hi-vis vests on hooks. Right wall: fridge, calendar, radiator, plant.
//  Centre-left: the table (tavla board, glasses, newspaper) with blue chairs.
//  Books: towers of merged book boxes (vertex-coloured, one draw call per tower, drawRange grows them bottom-up),
//  the coworker's two armloads and the tower T* that avalanches on the boss are single book meshes on simple
//  deterministic ballistic paths. Registers s08 s09 s10 s11 g2 (17.06-26.19) as ONE continuous take (seqCam 'depot').
//  Prefix DP / dp.
// =====================================================================
const DP = {};
const DP_X = 24, DP_Z = 40, DP_H = 24;
const DP_HEAP = [14.9, 7.2], DP_HERO = [3.0, 20.0], DP_CO = [5.5, 18.0], DP_BOSS = [14.5, 6.8], DP_TS = [18.0, 4.6], DP_D1 = [11.6, 3.2], DP_URN = [-19.5, 5.2, 1.7];
const DP_BOOKC = ['#d4321e', '#1f5cb8', '#f09a12', '#24904a', '#7a34b0', '#e8406e', '#0e98a8', '#e8601a', '#3440a8', '#b01e34', '#f2c41a', '#3a98e8', '#1e7a50', '#c8501a', '#8a2a8a', '#2a6a9a'];   // v2: saturated (v1's cream books read milky)
const DP_PAGE = '#ecc888';
const dpE = (a, b, t) => clamp((t - a) / (b - a));
// ---- textures
function dpTexWall() { const t = tex((g, w, h) => { const R = RNG('dpwall'), dado = h * (1 - 5.6 / DP_H);
  g.fillStyle = '#2aa0a0'; g.fillRect(0, 0, w, dado);
  for (let x = 0; x < w; x += R.r(10, 30)) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,40,40,0.05)'; g.fillRect(x, 0, R.r(8, 24), dado); }   // roller marks
  for (let k = 0; k < 220; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,30,30,0.07)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, dado), R.r(1, 3), R.r(1, 3)); }
  g.fillStyle = '#166e74'; g.fillRect(0, dado, w, h - dado);   // dark teal dado (oil paint)
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(20,10,5,${R.r(0.05, 0.15)})`; g.fillRect(R.r(-20, w), R.r(dado + 10, h - 16), R.r(10, 60), R.r(1, 3)); }   // chair scuffs
  g.fillStyle = '#f07a1a'; g.fillRect(0, dado - 9, w, 9); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, dado, w, 3);
  g.fillStyle = '#20302e'; g.fillRect(0, h - 14, w, 14); }, 512, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// a wall/plane piece whose UVs follow world coordinates (u = along / 12, v = y / DP_H) so the dado lines up on every piece
function dpWall(a0, a1, y0, y1, axis, at, mat) { const g = new THREE.PlaneGeometry(a1 - a0, y1 - y0), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + (a0 + a1) / 2) / 12, (p.getY(i) + (y0 + y1) / 2) / DP_H);
  const m = new THREE.Mesh(g, mat); m.userData.noCast = true;
  if (axis === 'z') m.position.set((a0 + a1) / 2, (y0 + y1) / 2, at);
  else { m.position.set(at, (y0 + y1) / 2, (a0 + a1) / 2); m.rotation.y = at < 0 ? Math.PI / 2 : -Math.PI / 2; if (at > 0) for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i)); }
  return m; }
function dpTexYard() { return tex((g, w, h) => { const R = RNG('dpyard');
  const sky = g.createLinearGradient(0, 0, 0, h * 0.5); sky.addColorStop(0, '#3a8ee0'); sky.addColorStop(0.6, '#86c4ec'); sky.addColorStop(1, '#ffc890'); g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.55);
  for (let i = 0; i < 6; i++) { const cx = R.r(0, w), cy = R.r(h * 0.06, h * 0.28), r = R.r(40, 90); g.fillStyle = 'rgba(255,246,234,0.92)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + (k - 2) * r * 0.55, cy + Math.abs(k - 2) * r * 0.12, r * (0.6 + 0.12 * (2 - Math.abs(k - 2))), 0, TAU); g.fill(); } g.fillStyle = 'rgba(150,140,210,0.45)'; g.fillRect(cx - r * 1.6, cy + r * 0.2, r * 3.2, r * 0.3); }
  // far hills, apartment blocks with balconies, a minaret
  g.fillStyle = '#8a7ac0'; g.beginPath(); g.moveTo(0, h * 0.5); for (let x = 0; x <= w; x += 40) g.lineTo(x, h * 0.44 + Math.sin(x * 0.01) * 18 + Math.sin(x * 0.027) * 10); g.lineTo(w, h * 0.55); g.lineTo(0, h * 0.55); g.fill();
  for (let i = 0; i < 9; i++) { const x = i * w / 9 + R.r(-10, 10), bw = R.r(70, 110), bh = R.r(90, 170), c = ['#f0a860', '#e07a5a', '#f2c45a', '#c8789a'][i % 4]; g.fillStyle = c; g.fillRect(x, h * 0.55 - bh, bw, bh);
    g.fillStyle = 'rgba(40,40,90,0.55)'; for (let y = h * 0.55 - bh + 12; y < h * 0.55 - 14; y += 26) for (let xx = x + 8; xx < x + bw - 14; xx += 22) g.fillRect(xx, y, 12, 14);
    g.fillStyle = '#b8402a'; g.beginPath(); g.moveTo(x - 4, h * 0.55 - bh); g.lineTo(x + bw / 2, h * 0.55 - bh - 22); g.lineTo(x + bw + 4, h * 0.55 - bh); g.fill(); }
  g.fillStyle = '#e8d8c0'; g.fillRect(w * 0.78, h * 0.18, 12, h * 0.36); g.beginPath(); g.moveTo(w * 0.78 - 2, h * 0.18); g.lineTo(w * 0.78 + 6, h * 0.1); g.lineTo(w * 0.78 + 14, h * 0.18); g.fill(); g.fillRect(w * 0.78 - 5, h * 0.3, 22, 6);
  // the depot yard: asphalt with parking lines, a fence, three orange garbage trucks
  const as = g.createLinearGradient(0, h * 0.55, 0, h); as.addColorStop(0, '#5a5e7c'); as.addColorStop(1, '#3e4260'); g.fillStyle = as; g.fillRect(0, h * 0.55, w, h * 0.45);
  g.strokeStyle = '#2e8a6a'; g.lineWidth = 3; for (let x = 0; x < w; x += 10) { g.beginPath(); g.moveTo(x, h * 0.5); g.lineTo(x, h * 0.565); g.stroke(); } g.beginPath(); g.moveTo(0, h * 0.51); g.lineTo(w, h * 0.51); g.stroke();
  g.fillStyle = '#f2d24a'; for (let x = 30; x < w; x += 170) { g.save(); g.translate(x, h * 0.72); g.transform(1, 0, -0.5, 1, 0, 0); g.fillRect(0, 0, 8, h * 0.26); g.restore(); }
  const truck = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = 'rgba(30,30,50,0.35)'; g.beginPath(); g.ellipse(120, 112, 140, 14, 0, 0, TAU); g.fill();
    g.fillStyle = '#f07a1a'; g.beginPath(); g.roundRect(0, 0, 175, 96, 14); g.fill(); g.fillStyle = '#d8601a'; g.fillRect(0, 70, 175, 10);
    g.fillStyle = '#f48a28'; g.beginPath(); g.roundRect(178, 22, 62, 74, [16, 26, 6, 6]); g.fill(); g.fillStyle = '#bfe2f2'; g.beginPath(); g.roundRect(196, 30, 36, 30, 6); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(14, 44, 148, 14); g.font = '900 22px Arial'; g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.fillText('ÇANKAYA', 88, 34);
    for (const wx of [40, 140, 210]) { g.fillStyle = '#26262e'; g.beginPath(); g.arc(wx, 98, 18, 0, TAU); g.fill(); g.fillStyle = '#b8bcc4'; g.beginPath(); g.arc(wx, 98, 7, 0, TAU); g.fill(); }
    g.restore(); };
  truck(20, h * 0.6, 0.95); truck(330, h * 0.63, 1.05); truck(660, h * 0.6, 0.95);
  for (let i = 0; i < 5; i++) { const x = R.r(0, w), y = R.r(h * 0.82, h * 0.95); g.fillStyle = ['#3a8a3a', '#2a6aa8', '#f2c23a'][i % 3]; g.beginPath(); g.roundRect(x, y - 40, 34, 40, 6); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y - 40, 34, 6); }   // wheelie bins
}, 1024, 600); }
function dpTexLocker(n) { return tex((g, w, h) => { g.fillStyle = '#f07a1a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, 6, h); g.fillStyle = 'rgba(80,20,0,0.35)'; g.fillRect(w - 6, 0, 6, h);
  for (const y0 of [0.07, 0.8]) for (let k = 0; k < 6; k++) { g.fillStyle = '#7a3208'; g.beginPath(); g.roundRect(w * 0.22, h * (y0 + k * 0.018), w * 0.56, h * 0.008, 3); g.fill(); }
  g.fillStyle = '#fbf3e0'; g.fillRect(w * 0.25, h * 0.22, w * 0.5, h * 0.05); g.fillStyle = '#2a1a10'; g.font = `900 ${h * 0.035}px Arial`; g.textAlign = 'center'; g.fillText(['MEHMET', 'AYŞE', 'HASAN', 'ALİ', 'EMRE', 'FATMA'][n % 6], w / 2, h * 0.258);
  g.fillStyle = '#c8ccd2'; g.beginPath(); g.roundRect(w * 0.72, h * 0.44, w * 0.12, h * 0.1, 6); g.fill(); g.fillStyle = '#5a5e66'; g.fillRect(w * 0.76, h * 0.47, w * 0.04, h * 0.04);
  const R = RNG('dplk', n); for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(90,30,0,${R.r(0.05, 0.2)})`; g.fillRect(R.r(0, w), R.r(h * 0.5, h), R.r(4, 20), R.r(1, 3)); }
  if (n % 3 === 1) { g.save(); g.translate(w * 0.4, h * 0.36); g.rotate(-0.12); g.fillStyle = '#e8283a'; g.beginPath(); g.arc(0, 0, w * 0.13, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-w * 0.02, 0, w * 0.08, 0, TAU); g.fill(); g.fillStyle = '#e8283a'; g.beginPath(); g.arc(w * 0.01, 0, w * 0.065, 0, TAU); g.fill(); g.restore(); }   // a sticker
}, 128, 512); }
function dpTexVest(c) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#7a7a7a'; g.fillRect(w * 0.46, 0, w * 0.08, h * 0.08);
  g.fillStyle = c; g.beginPath(); g.moveTo(w * 0.2, h * 0.1); g.lineTo(w * 0.38, h * 0.06); g.lineTo(w * 0.5, h * 0.3); g.lineTo(w * 0.62, h * 0.06); g.lineTo(w * 0.8, h * 0.1); g.lineTo(w * 0.94, h * 0.32); g.lineTo(w * 0.9, h * 0.97); g.lineTo(w * 0.1, h * 0.97); g.lineTo(w * 0.06, h * 0.32); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#e8eef2'; for (const y of [0.55, 0.76]) g.fillRect(w * 0.08, h * y, w * 0.84, h * 0.065);
  g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(w * 0.49, h * 0.3, w * 0.02, h * 0.67); }, 256, 320); }
function dpTexBoard() { return tex((g, w, h) => { const R = RNG('dpboard'); g.fillStyle = '#6a4224'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0915e'; g.fillRect(16, 16, w - 32, h - 32);
  for (let i = 0; i < 3000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,55,25,0.3)' : 'rgba(230,190,140,0.3)'; g.fillRect(R.r(16, w - 16), R.r(16, h - 16), 2, 2); }
  // the shift rota: a grid sheet
  g.save(); g.translate(w * 0.27, h * 0.5); g.rotate(-0.025); const sw = w * 0.42, sh = h * 0.8; g.fillStyle = '#f6f0e2'; g.fillRect(-sw / 2, -sh / 2, sw, sh);
  g.fillStyle = '#1e7a7a'; g.fillRect(-sw / 2, -sh / 2, sw, sh * 0.15); inked(g, 'SHIFT ROTA', 0, -sh / 2 + sh * 0.075, sh * 0.085, '#ffffff', { stroke: false, maxW: sw * 0.9 });
  const days = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM'], names = ['MEHMET', 'AYŞE', 'HASAN', 'ALİ', 'EMRE', 'FATMA'];
  g.font = `700 ${sh * 0.028}px Arial`; g.textAlign = 'center'; g.fillStyle = '#2a1a10'; days.forEach((d, i) => g.fillText(d, -sw / 2 + sw * (0.36 + i * 0.13), -sh / 2 + sh * 0.22));
  names.forEach((n, j) => { const y = -sh / 2 + sh * (0.3 + j * 0.11); g.textAlign = 'left'; g.fillStyle = '#2a1a10'; g.fillText(n, -sw / 2 + sw * 0.04, y + sh * 0.015);
    for (let i = 0; i < 5; i++) { const on = (i + j) % 3; g.fillStyle = on === 0 ? '#f07a1a' : on === 1 ? '#7ac8c8' : '#e8e0cc'; g.fillRect(-sw / 2 + sw * (0.3 + i * 0.13), y - sh * 0.03, sw * 0.11, sh * 0.06); } });
  g.strokeStyle = 'rgba(40,30,20,0.4)'; g.lineWidth = 2; g.strokeRect(-sw / 2 + 4, -sh / 2 + 4, sw - 8, sh - 8); g.restore();
  // pinned notes
  const notes = [[0.6, 0.24, 0.2, 0.28, '#fff2a0', 'ÇAY 10:00'], [0.82, 0.3, 0.18, 0.3, '#ffd0d8', 'MAAŞ'], [0.62, 0.66, 0.2, 0.26, '#d8ecff', 'NO BOOKS'], [0.84, 0.72, 0.16, 0.24, '#fbf7ea', '']];
  notes.forEach(([x, y, nw, nh, c, txt], i) => { g.save(); g.translate(w * x, h * y); g.rotate(R.n(0.08)); g.fillStyle = 'rgba(40,20,10,0.25)'; g.fillRect(-w * nw / 2 + 5, -h * nh / 2 + 6, w * nw, h * nh); g.fillStyle = c; g.fillRect(-w * nw / 2, -h * nh / 2, w * nw, h * nh);
    if (txt) inked(g, txt, 0, -h * nh * 0.1, h * 0.06, '#2a1a10', { stroke: false, maxW: w * nw * 0.85 }); g.fillStyle = 'rgba(40,30,20,0.5)'; for (let k = 0; k < 3; k++) g.fillRect(-w * nw * 0.35, h * nh * (0.1 + k * 0.1), w * nw * R.r(0.4, 0.7), 2);
    g.fillStyle = ['#e8283a', '#2a6ad8', '#2aa04a', '#f2c23a'][i]; g.beginPath(); g.arc(0, -h * nh / 2 + 10, 7, 0, TAU); g.fill(); g.restore(); });
}, 768, 640); }
function dpTexPoster(k) { return tex((g, w, h) => { g.fillStyle = '#fff6e2'; g.fillRect(0, 0, w, h);
  if (k === 0) { g.fillStyle = '#2f8a4a'; g.fillRect(0, 0, w, h * 0.24); inked(g, 'SAFETY FIRST', w / 2, h * 0.12, h * 0.09, '#ffffff', { stroke: false, maxW: w * 0.86 });
    g.fillStyle = '#f2c23a'; g.beginPath(); g.ellipse(w / 2, h * 0.56, w * 0.28, h * 0.17, 0, Math.PI, 0); g.fill(); g.fillRect(w * 0.16, h * 0.54, w * 0.68, h * 0.05); g.lineWidth = 10; g.strokeStyle = '#2a1a14'; g.stroke();
    inked(g, 'İŞ GÜVENLİĞİ', w / 2, h * 0.74, h * 0.07, '#2a1a14', { stroke: false, maxW: w * 0.84 }); inked(g, 'wear your vest', w / 2, h * 0.86, h * 0.05, '#2a1a14', { stroke: false, maxW: w * 0.84 }); }
  else { g.fillStyle = '#c8321e'; g.fillRect(0, 0, w, h * 0.3); inked(g, 'ÇAY OCAĞI', w / 2, h * 0.15, h * 0.13, '#ffffff', { stroke: false, maxW: w * 0.86 });
    g.fillStyle = '#b8401a'; g.beginPath(); g.moveTo(w * 0.4, h * 0.42); g.quadraticCurveTo(w * 0.36, h * 0.6, w * 0.44, h * 0.78); g.lineTo(w * 0.56, h * 0.78); g.quadraticCurveTo(w * 0.64, h * 0.6, w * 0.6, h * 0.42); g.fill(); g.lineWidth = 6; g.strokeStyle = '#2a1a14'; g.stroke();
    g.fillStyle = '#c8321e'; g.fillRect(w * 0.3, h * 0.8, w * 0.4, h * 0.04); inked(g, 'tea station', w / 2, h * 0.92, h * 0.06, '#2a1a14', { stroke: false }); }
  g.lineWidth = 10; g.strokeStyle = '#2a1a14'; g.strokeRect(0, 0, w, h); }, 400, 520); }
function dpTexCal() { return tex((x, w, h) => { x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#f07a1a'; x.fillRect(0, 0, w, h * 0.42);
  x.fillStyle = '#3a8ac8'; x.fillRect(w * 0.08, h * 0.05, w * 0.84, h * 0.3); x.fillStyle = '#f2c23a'; x.beginPath(); x.arc(w * 0.7, h * 0.14, w * 0.08, 0, TAU); x.fill(); x.fillStyle = '#e8f0f8'; x.beginPath(); x.moveTo(w * 0.08, h * 0.35); x.lineTo(w * 0.35, h * 0.16); x.lineTo(w * 0.6, h * 0.35); x.fill();
  inked(x, 'KASIM', w / 2, h * 0.385, h * 0.05, '#ffffff', { stroke: false }); x.fillStyle = '#5a3a22'; x.font = `700 ${h * 0.04}px Arial`; x.textAlign = 'center';
  for (let d = 0; d < 30; d++) { const c = (d + 5) % 7, r = Math.floor((d + 5) / 7); x.fillText(String(d + 1), w * (0.1 + c * 0.13), h * (0.5 + r * 0.09)); } }, 320, 480); }
function dpTexDoor() { return tex((g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,90,50,0.35)'; g.lineWidth = 4;
  g.strokeRect(w * 0.12, h * 0.52, w * 0.76, h * 0.4); g.fillStyle = '#bfe2f2'; g.fillRect(w * 0.18, h * 0.1, w * 0.64, h * 0.3); g.lineWidth = 10; g.strokeStyle = '#8a7a5a'; g.strokeRect(w * 0.18, h * 0.1, w * 0.64, h * 0.3);
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.moveTo(w * 0.24, h * 0.36); g.lineTo(w * 0.4, h * 0.12); g.lineTo(w * 0.48, h * 0.12); g.lineTo(w * 0.32, h * 0.36); g.fill();
  g.fillStyle = '#1e7a7a'; g.beginPath(); g.roundRect(w * 0.22, h * 0.43, w * 0.56, h * 0.06, 8); g.fill(); inked(g, 'PERSONEL', w / 2, h * 0.462, h * 0.035, '#ffffff', { stroke: false, maxW: w * 0.5 });
  g.fillStyle = '#b8bcc4'; g.fillRect(w * 0.1, h * 0.5, w * 0.08, h * 0.12); }, 256, 640); }
function dpTexPuff() { return tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 64, 64); }
function dpTexTavla() { return tex((g, w, h) => { g.fillStyle = '#7a3a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c890'; g.fillRect(10, 10, w / 2 - 16, h - 20); g.fillRect(w / 2 + 6, 10, w / 2 - 16, h - 20);
  for (let i = 0; i < 12; i++) { const x = (i < 6 ? 14 : w / 2 + 10) + (i % 6) * (w / 2 - 24) / 6, c = i % 2 ? '#c8402e' : '#2a2a2a'; g.fillStyle = c; g.beginPath(); g.moveTo(x, 12); g.lineTo(x + (w / 2 - 24) / 12, h * 0.42); g.lineTo(x + (w / 2 - 24) / 6, 12); g.fill(); g.beginPath(); g.moveTo(x, h - 12); g.lineTo(x + (w / 2 - 24) / 12, h * 0.58); g.lineTo(x + (w / 2 - 24) / 6, h - 12); g.fill(); }
  for (const [x, y, c] of [[0.2, 0.2, '#fbf3e0'], [0.24, 0.2, '#fbf3e0'], [0.7, 0.8, '#2a2a2a'], [0.66, 0.8, '#2a2a2a'], [0.4, 0.5, '#fbf3e0']]) { g.fillStyle = c; g.beginPath(); g.arc(w * x, h * y, h * 0.06, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 2; g.stroke(); } }, 512, 320); }
function dpTexPaper() { return tex((g, w, h) => { g.fillStyle = '#ece6d8'; g.fillRect(0, 0, w, h); inked(g, 'HÜRRİYET', w / 2, h * 0.1, h * 0.08, '#c8282a', { stroke: false, font: 'Georgia, serif' });
  g.fillStyle = '#7a8a9a'; g.fillRect(w * 0.08, h * 0.2, w * 0.5, h * 0.3); g.fillStyle = 'rgba(40,30,20,0.5)'; for (let i = 0; i < 14; i++) g.fillRect(i < 6 ? w * 0.62 : w * 0.08, h * (i < 6 ? 0.21 + i * 0.05 : 0.56 + (i - 6) * 0.05), i < 6 ? w * 0.3 : w * 0.84, 3); }, 256, 320); }

// ---- books: vertex-coloured boxes merged into one geometry (covers = colour, spine = darker colour + optional band, pages = cream)
// b = { w, h, d, x, y, z, ry, rz, rx, c, sp (+1 spine on +z, -1 on -z), band }
function dpBookGeo(list) { const P = [], N = [], C = [], col = new THREE.Color(), pg = new THREE.Color(DP_PAGE), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  const add = (geo, b, faceCol) => { const g = geo.toNonIndexed(); E.set(b.rx || 0, b.ry || 0, b.rz || 0); Q.setFromEuler(E); M.compose(V3(b.x, b.y, b.z), Q, V3(1, 1, 1)); g.applyMatrix4(M);
    const p = g.attributes.position, n = g.attributes.normal; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); const c = faceCol(Math.floor(i / 6)); C.push(c.r, c.g, c.b); } };
  for (const b of list) { const base = new THREE.Color(b.c), sp = base.clone().multiplyScalar(0.8), sf = b.sp > 0 ? 4 : 5, ct = Math.min(0.075, b.h * 0.17), pgc = pg.clone().lerp(base, 0.32);
    // v2: a real book = an inset page block (pages tinted by the cover), two overhanging covers and a spine (never one box)
    { const g = new THREE.BoxGeometry(b.w * 0.95, b.h - 1.6 * ct, b.d * 0.9); g.translate(0, 0, -b.sp * b.d * 0.03); add(g, b, () => pgc); }
    for (const sy of [-1, 1]) { const g = new THREE.BoxGeometry(b.w, ct, b.d); g.translate(0, sy * (b.h - ct) / 2, 0); add(g, b, () => base); }
    { const g = new THREE.BoxGeometry(b.w, b.h, ct * 1.2); g.translate(0, 0, b.sp * (b.d / 2 - ct * 0.6)); add(g, b, (f) => f === sf ? sp : base); }
    if (b.band) { const bc = new THREE.Color(b.band), off = b.sp * (b.d / 2 + 0.012); const geo = new THREE.BoxGeometry(b.w * 0.18, b.h * 1.02, 0.03); geo.translate(b.w * (b.bx ?? 0.28), 0, off); add(geo, b, () => bc); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  geo.computeBoundingBox(); geo.computeBoundingSphere(); return geo; }
const dpVerts = (b) => 36 * (b.band ? 5 : 4);
function dpBook(R, o = {}) { const big = o.big ?? 1; return { w: R.r(2.0, 2.9) * big, h: R.r(0.32, 0.62) * (o.hk ?? 1), d: R.r(1.4, 1.95) * big, c: DP_BOOKC[R.i(0, DP_BOOKC.length - 1)], sp: R.f() < 0.62 ? 1 : -1, band: R.f() < 0.45 ? (R.f() < 0.6 ? '#e8c860' : '#f4ecd8') : null, bx: R.r(-0.35, 0.35) }; }
// a stack from y0 up to y1: books in order (bottom first), top heights in b.top
function dpStack(seed, x, z, y0, y1, o = {}) { const R = RNG('dpst', seed), L = []; let y = y0, ry0 = o.ry ?? R.r(-0.4, 0.4);
  while (true) { const b = dpBook(R, o); if (y + b.h > y1) break; b.x = x + R.n(o.jit ?? 0.14); b.z = z + R.n(o.jit ?? 0.14); b.y = y + b.h / 2; b.ry = ry0 + R.n(0.16); b.rz = R.n(0.02); y += b.h; b.top = y; L.push(b); }
  return L; }
// a heap of books (filled cone) centred at (x, z): bottom layers first
function dpHeap(seed, x, z, rad, hgt, o = {}) { const R = RNG('dphp', seed), L = []; let y = o.y0 ?? 0;
  while (y < hgt) { const r = rad * (1 - y / hgt) + 0.2, n = Math.max(1, Math.round(r * r * 0.9)); let lh = 0;
    for (let i = 0; i < n; i++) { const b = dpBook(R, o), a = R.f() * TAU, rr = r * Math.sqrt(R.f()); b.x = x + Math.cos(a) * rr; b.z = z + Math.sin(a) * rr; b.y = y + b.h / 2 + R.r(0, 0.15); b.ry = R.f() * TAU; b.rx = R.n(0.18); b.rz = R.n(0.18); lh = Math.max(lh, b.h); b.top = y + lh; L.push(b); }
    y += lh * 0.8; }
  return L; }
// rest spots on the surface of a heap (for books landing on it)
function dpHeapSurf(seed, x, z, rad, hgt, n) { const R = RNG('dphs', seed), L = []; for (let i = 0; i < n; i++) { const a = R.f() * TAU, rr = rad * Math.sqrt(R.r(0.02, 1)); L.push({ x: x + Math.cos(a) * rr, z: z + Math.sin(a) * rr, y: hgt * (1 - rr / rad) + 0.25, ry: R.f() * TAU, rx: R.n(0.25) + (rr / rad) * 0.25 * Math.sin(a), rz: R.n(0.25) - (rr / rad) * 0.25 * Math.cos(a) }); } return L; }
// a single book as its own mesh (origin at its centre)
function dpBookMesh(b, mat) { const c = Object.assign({}, b, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }), m = new THREE.Mesh(dpBookGeo([c]), mat); m.userData.noShade = true; m.userData.b = b; return m; }
// deterministic flight from P0 (rotation E0) to P1 (rotation E1) starting at t0, under gravity g; a little bounce on landing
function dpFly(m, t, t0, P0, E0, P1, E1, o = {}) { const g = o.g ?? 70, up = o.up ?? 4, dy = P0[1] - P1[1], T = o.T ?? Math.max(0.22, (up + Math.sqrt(up * up + 2 * g * Math.max(0, dy))) / g);
  const d = t - t0; if (d <= 0) return false; const u = Math.min(1, d / T), tt = Math.min(d, T);
  let y = P0[1] + up * tt - 0.5 * g * tt * tt; if (u >= 1) y = P1[1]; else y = Math.max(y, P1[1]);
  const bo = d > T ? 0.35 * Math.max(0, Math.sin(Math.PI * Math.min(1, (d - T) / 0.16))) * Math.exp(-(d - T) * 6) : 0;
  m.position.set(lerp(P0[0], P1[0], u), y + bo, lerp(P0[2], P1[2], u)); const s = o.spin || [0, 0, 0], e = EZ.o2(u);
  m.rotation.set(lerp(E0[0], E1[0] + s[0] * TAU, e), lerp(E0[1], E1[1] + s[1] * TAU, e), lerp(E0[2], E1[2] + s[2] * TAU, e)); return true; }

// ---- small builders
function dpTulip(tea = true) { const g = new THREE.Group(), prof = [[0, 0], [0.22, 0.02], [0.3, 0.2], [0.24, 0.55], [0.22, 0.75], [0.3, 1.05], [0.32, 1.12]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = c3Mesh(new THREE.LatheGeometry(prof, 14), c3Prop(tea ? '#c8461a' : '#e8eef2', { rough: 0.12, env: 1.6, emissive: tea ? '#5a1404' : '#000000', ei: tea ? 0.3 : 0 }), 0); glass.material.side = THREE.DoubleSide; glass.position.y = 0.06; g.add(glass);
  const rim = c3Mesh(new THREE.TorusGeometry(0.31, 0.025, 6, 14), c3Prop('#f4f4f0', { rough: 0.1 }), 0); rim.rotation.x = Math.PI / 2; rim.position.y = 1.17; g.add(rim);
  g.add(cyl(0.48, 0.42, 0.06, c3Prop('#c8321e', { rough: 0.3 }), 0, 0.03, 0, 0, 16)); return g; }
function dpChair(x, z, ry, c) { const g = new THREE.Group(), m = c3Prop(c, { rough: 0.4 }), k = c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }); g.position.set(x, 0, z); g.rotation.y = ry;
  g.add(rb(2.6, 0.3, 2.5, m, 0, 3.2, 0)); g.add(rb(2.6, 2.4, 0.25, m, 0, 4.7, -1.15));
  for (const [a, b] of [[-1.1, -1.05], [1.1, -1.05], [-1.1, 1.05], [1.1, 1.05]]) g.add(cyl(0.08, 0.08, 3.1, k, a, 1.55, b, 0, 8)); return g; }
function dpTruckSign() { return tex((g, w, h) => { g.fillStyle = '#1e7a7a'; g.beginPath(); g.roundRect(0, 0, w, h, 20); g.fill(); g.lineWidth = 10; g.strokeStyle = '#f07a1a'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 14); g.stroke();
  inked(g, 'ÇANKAYA TEMİZLİK', w / 2, h * 0.38, h * 0.2, '#ffffff', { stroke: false, maxW: w * 0.86 }); inked(g, 'sanitation depot · break room', w / 2, h * 0.7, h * 0.12, '#ffe2b0', { stroke: false, maxW: w * 0.86 }); }, 1024, 256); }

// ---- v2 set dressing (user: "dense and detailed, never box primitives"): trims, pipes, AC units, radiators, signs, clutter
function dpTexSign(txt, bg, fg, sub) { return tex((g, w, h) => { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, h * 0.12); g.fill(); g.lineWidth = h * 0.06; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.roundRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16, h * 0.08); g.stroke();
  inked(g, txt, w / 2, sub ? h * 0.42 : h * 0.52, h * (sub ? 0.32 : 0.42), fg, { stroke: false, maxW: w * 0.84 }); if (sub) inked(g, sub, w / 2, h * 0.74, h * 0.16, fg, { stroke: false, maxW: w * 0.84 }); }, 512, 512 * 0.4 | 0); }
function dpTexRecycle() { return tex((g, w, h) => { g.fillStyle = '#fff2d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e8a5a'; g.fillRect(0, 0, w, h * 0.22); inked(g, 'GERİ DÖNÜŞÜM', w / 2, h * 0.11, h * 0.08, '#ffffff', { stroke: false, maxW: w * 0.88 });
  g.save(); g.translate(w / 2, h * 0.52); for (let i = 0; i < 3; i++) { g.rotate(TAU / 3); g.fillStyle = ['#1e8a5a', '#2ab07a', '#14704a'][i]; g.beginPath(); g.moveTo(-w * 0.06, -h * 0.2); g.lineTo(w * 0.12, -h * 0.2); g.lineTo(w * 0.2, -h * 0.07); g.lineTo(w * 0.26, -h * 0.12); g.lineTo(w * 0.22, h * 0.03); g.lineTo(w * 0.08, h * 0.0); g.lineTo(w * 0.13, -h * 0.04); g.lineTo(w * 0.08, -h * 0.12); g.lineTo(-w * 0.02, -h * 0.12); g.closePath(); g.fill(); } g.restore();
  inked(g, 'kağıt · plastik · cam', w / 2, h * 0.86, h * 0.05, '#2a1a14', { stroke: false, maxW: w * 0.84 }); g.lineWidth = 10; g.strokeStyle = '#2a1a14'; g.strokeRect(0, 0, w, h); }, 400, 520); }
function dpTexPhoto() { return tex((g, w, h) => { g.fillStyle = '#f4e8cc'; g.fillRect(0, 0, w, h); const sk = g.createLinearGradient(0, 0, 0, h * 0.6); sk.addColorStop(0, '#4a9ae0'); sk.addColorStop(1, '#ffd8a0'); g.fillStyle = sk; g.fillRect(w * 0.06, h * 0.08, w * 0.88, h * 0.6);
  g.fillStyle = '#6a6a7a'; g.fillRect(w * 0.06, h * 0.6, w * 0.88, h * 0.24); g.fillStyle = '#f07a1a'; g.beginPath(); g.roundRect(w * 0.12, h * 0.32, w * 0.5, h * 0.3, 10); g.fill(); g.beginPath(); g.roundRect(w * 0.62, h * 0.4, w * 0.2, h * 0.22, [10, 18, 4, 4]); g.fill(); g.fillStyle = '#bfe2f2'; g.fillRect(w * 0.66, h * 0.43, w * 0.12, h * 0.08);
  for (const x of [0.22, 0.5, 0.74]) { g.fillStyle = '#26262e'; g.beginPath(); g.arc(w * x, h * 0.63, h * 0.05, 0, TAU); g.fill(); }
  for (let i = 0; i < 5; i++) { const x = w * (0.16 + i * 0.16); g.fillStyle = ['#ff7a1a', '#c8e02a'][i % 2]; g.beginPath(); g.roundRect(x - w * 0.045, h * 0.62, w * 0.09, h * 0.18, 8); g.fill(); g.fillStyle = '#f8eee4'; g.beginPath(); g.arc(x, h * 0.58, w * 0.045, 0, TAU); g.fill(); g.strokeStyle = '#2a1a14'; g.lineWidth = 3; g.stroke(); }
  inked(g, '2016 · EKİP', w / 2, h * 0.92, h * 0.06, '#2a1a14', { stroke: false }); }, 400, 300); }
function dpTexGrille() { return tex((g, w, h) => { g.fillStyle = '#dfe6e4'; g.fillRect(0, 0, w, h); for (let y = 10; y < h - 6; y += 12) { g.fillStyle = '#6a7a7a'; g.fillRect(8, y, w - 16, 5); g.fillStyle = '#ffffff'; g.fillRect(8, y + 5, w - 16, 2); } g.strokeStyle = '#8a9696'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }, 128, 128); }
// a panel radiator: rounded fins, top + bottom manifolds, feet, a valve (origin = floor, centre; runs along local x)
function dpRadiator(n, hgt, mat, valve) { const g = new THREE.Group(), w = n * 0.42;
  for (let i = 0; i < n; i++) { const x = -w / 2 + 0.21 + i * 0.42; g.add(rb(0.3, hgt, 0.5, mat, x, 1.0 + hgt / 2, 0, 0.012)); for (const y of [1.0, 1.0 + hgt]) { const c = cyl(0.15, 0.15, 0.5, mat, x, y, 0, 0.01, 10); c.rotation.x = Math.PI / 2; g.add(c); } }
  for (const y of [1.25, 0.75 + hgt]) { const c = cyl(0.12, 0.12, w + 0.3, mat, 0, y, 0, 0.01, 10); c.rotation.z = Math.PI / 2; g.add(c); }
  for (const x of [-w / 2 + 0.4, w / 2 - 0.4]) g.add(rb(0.2, 1.0, 0.3, mat, x, 0.5, 0, 0.01));
  const v = cyl(0.12, 0.12, 1.0, valve, w / 2 + 0.3, 0.6, 0, 0.01, 8); g.add(v); g.add(cyl(0.3, 0.3, 0.25, valve, w / 2 + 0.3, 1.25, 0, 0.012, 12)); return g; }
// a split AC unit (rounded body, front panel line, louvre slot, LED, the pipe down the wall); faces +z (local)
function dpAC(M) { const g = new THREE.Group(), body = c3Prop('#f2f4f0', { rough: 0.35 });
  g.add(c3Put(c3Mesh(c3RBox(7.2, 2.4, 1.9, 0.5, 4), body, 0.02), 0, 0, 0.95)); g.add(rb(6.8, 0.08, 0.06, M.steelD, 0, 0.55, 1.92, 0)); g.add(rb(6.4, 0.42, 0.2, M.dark, 0, -0.85, 1.75, 0));
  const fl = rb(6.2, 0.1, 0.5, c3Prop('#d8dcd8', { rough: 0.4 }), 0, -0.98, 1.9, 0); fl.rotation.x = 0.5; g.add(fl);
  g.add(cyl(0.07, 0.07, 0.05, c3Prop('#40ff80', { emissive: '#30ff70', ei: 2 }), 2.9, -0.35, 1.92, 0, 8)).children.at(-1).rotation.x = Math.PI / 2;
  const pp = cyl(0.16, 0.16, 7, c3Prop('#ecece4', { rough: 0.5 }), 3.3, -4.6, 0.3, 0.01, 8); g.add(pp); return g; }
function dpPipe(a, b, r, mat) { const A = V3(...a), B = V3(...b), L = A.distanceTo(B), m = cyl(r, r, L, mat, 0, 0, 0, 0.012, 12); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), B.clone().sub(A).normalize()); m.userData.noCast = true; return m; }
function dpBigPlant(seed, s = 1) { const g = new THREE.Group(), R = RNG('dpplant', seed), lf = c3Prop('#2e9a44', { rough: 0.55, side: THREE.DoubleSide }), lf2 = c3Prop('#4ab84a', { rough: 0.55 });
  g.add(cyl(1.2 * s, 0.85 * s, 2.2 * s, c3Prop('#d8603a', { rough: 0.7 }), 0, 1.1 * s, 0, 0.02, 16)); g.add(cyl(1.3 * s, 1.3 * s, 0.3 * s, c3Prop('#b8482a', { rough: 0.7 }), 0, 2.15 * s, 0, 0.02, 16)); g.add(cyl(1.1 * s, 1.1 * s, 0.1, c3Prop('#4a2a1a'), 0, 2.25 * s, 0, 0, 14));
  for (let k = 0; k < 11; k++) { const a = k * 2.4 + R.n(0.3), ht = (3.2 + R.r(0, 3.2)) * s, st = cyl(0.06 * s, 0.08 * s, ht, c3Prop('#3a7a2a'), 0, 0, 0, 0.01, 6); const ang = 0.25 + R.r(0, 0.45);
    st.position.set(Math.sin(ang) * Math.cos(a) * ht / 2, 2.2 * s + Math.cos(ang) * ht / 2, Math.sin(ang) * Math.sin(a) * ht / 2); st.rotation.set(Math.sin(a) * ang, 0, -Math.cos(a) * ang); g.add(st);
    const L = c3Mesh(new THREE.SphereGeometry(1.0 * s, 12, 8), k % 3 ? lf : lf2, 0.02); L.scale.set(1.0, 0.14, 0.62); L.position.set(Math.sin(ang) * Math.cos(a) * ht, 2.2 * s + Math.cos(ang) * ht, Math.sin(ang) * Math.sin(a) * ht); L.rotation.set(0, -a, -0.5 - ang); g.add(L); }
  return g; }
function dpDress(s, scene, F, M) {
  const trim = c3Prop('#12545a', { rough: 0.5 }), crown = c3Prop('#e8e2d2', { rough: 0.45 }), pipeR = c3Prop('#d84a24', { rough: 0.35 }), pipeG = c3Prop('#9aa6ac', { metal: 0.5, rough: 0.35 }), brass = c3Prop('#d8a840', { metal: 0.7, rough: 0.3 });
  // skirting + crown moulding + a chair rail ledge on every wall (the door gap stays open)
  for (const [x0, x1] of [[-DP_X, 13.4], [20.6, DP_X]]) { scene.add(rbNC(x1 - x0, 0.7, 0.3, trim, (x0 + x1) / 2, 0.35, 0.15, 0.01)); }
  scene.add(rbNC(2 * DP_X, 0.6, 0.5, crown, 0, DP_H - 0.3, 0.25, 0.01)); scene.add(rbNC(2 * DP_X, 0.25, 0.7, crown, 0, DP_H - 0.7, 0.35, 0.01));
  for (const sx of [-1, 1]) { scene.add(rbNC(0.3, 0.7, DP_Z, trim, sx * (DP_X - 0.15), 0.35, DP_Z / 2, 0.01)); scene.add(rbNC(0.5, 0.6, DP_Z, crown, sx * (DP_X - 0.25), DP_H - 0.3, DP_Z / 2, 0.01)); }
  for (const [x0, x1] of [[-DP_X, -13.2], [-0.8, 13.4], [20.6, DP_X]]) scene.add(rbNC(x1 - x0, 0.32, 0.36, c3Prop('#f07a1a', { rough: 0.4 }), (x0 + x1) / 2, 5.45, 0.18, 0.01));   // the orange rail as a real ledge
  // pipes along the top of the back wall (sprinkler red + grey water), brackets, a drop to the radiator under the window
  scene.add(dpPipe([-DP_X, 22.3, 0.9], [DP_X, 22.3, 0.9], 0.3, pipeR)); scene.add(dpPipe([-DP_X, 21.4, 0.7], [DP_X, 21.4, 0.7], 0.2, pipeG));
  for (let x = -22; x <= 22; x += 4) { scene.add(rbNC(0.22, 1.9, 0.5, pipeG, x, 22.0, 0.35, 0.01)); }
  for (const x of [-15, 3, 21]) { const sp = cyl(0.12, 0.25, 0.45, brass, x, 21.85, 0.9, 0.01, 10); sp.userData.noCast = true; scene.add(sp); }   // sprinkler heads
  scene.add(dpPipe([-0.4, 21.4, 0.7], [-0.4, 2.0, 0.7], 0.2, pipeG)); scene.add(dpPipe([-0.4, 2.0, 0.7], [-4.0, 2.0, 0.7], 0.2, pipeG));
  // left + right wall: a cable tray with cables near the ceiling
  for (const sx of [-1, 1]) { const x = sx * (DP_X - 0.7); scene.add(rbNC(0.9, 0.25, DP_Z, pipeG, x, 21.2, DP_Z / 2, 0.01)); ['#2a2a30', '#d8402a', '#2a6ad0'].forEach((c, i) => scene.add(dpPipe([x + (i - 1) * 0.25, 21.42, 0], [x + (i - 1) * 0.25, 21.42, DP_Z], 0.07, c3Prop(c, { rough: 0.5 })))); }
  // AC units: above the tea counter (back wall) and on the right wall
  { const a = dpAC(M); a.position.set(-19, 19.2, 0); scene.add(a); const b = dpAC(M); b.position.set(DP_X, 19.2, 12); b.rotation.y = -Math.PI / 2; scene.add(b); }
  // the radiator under the window (with a valve) + the right-wall radiator rebuilt
  { const r = dpRadiator(12, 3.4, M.white, brass); r.position.set(-6.6, 0, 0.55); scene.add(r); }
  // a window reveal (wall thickness) and a rolled blind with its cord, tape + a sticker on the glass
  { const rv = c3Prop('#1e8a8a', { rough: 0.7 }); scene.add(rbNC(0.2, 11, 1.4, rv, -13.2, 11.5, -0.6, 0)); scene.add(rbNC(0.2, 11, 1.4, rv, -0.8, 11.5, -0.6, 0)); scene.add(rbNC(12.6, 0.2, 1.4, rv, -7, 17.2, -0.6, 0));
    const roll = cyl(0.45, 0.45, 12.4, c3Prop('#f2d48a', { rough: 0.6 }), -7, 16.5, 0.65, 0.02, 14); roll.rotation.z = Math.PI / 2; scene.add(roll); scene.add(rb(12.2, 0.9, 0.12, c3Prop('#f2d48a', { rough: 0.6 }), -7, 15.8, 0.75, 0.01));
    scene.add(dpPipe([-1.8, 15.6, 0.85], [-1.8, 11.6, 0.85], 0.04, c3Prop('#f4f0e6'))); const kn = cyl(0.14, 0.1, 0.5, c3Prop('#f4f0e6'), -1.8, 11.4, 0.85, 0.01, 8); scene.add(kn);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 10.6), new THREE.MeshBasicMaterial({ map: tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.58, 0); g.lineTo(w * 0.23, h); g.fill(); g.fillStyle = 'rgba(255,255,255,0.07)'; g.beginPath(); g.moveTo(w * 0.62, h); g.lineTo(w * 0.86, 0); g.lineTo(w * 0.9, 0); g.lineTo(w * 0.66, h); g.fill();
      g.fillStyle = 'rgba(80,140,170,0.16)'; g.fillRect(0, 0, w, h); }, 256, 256), transparent: true, depthWrite: false, toneMapped: false })); gl.position.set(-7, 11.5, 0.02); gl.userData.noCast = true; gl.userData.noShade = true; scene.add(gl); }
  // signs: exit over the door, extinguisher + its sign, a switch + socket, a framed team photo, a recycling poster, a certificate
  scene.add(pl(3.4, 1.36, c3Flat('#ffffff', { map: dpTexSign('ÇIKIŞ', '#1e9a4a', '#ffffff') }), 17, 16.4, 0.08)); scene.add(rb(3.6, 1.5, 0.2, M.white, 17, 16.4, -0.05, 0));
  { const ex = new THREE.Group(); ex.position.set(22.2, 0, 0.9); scene.add(ex); ex.add(cyl(0.6, 0.6, 3.0, c3Prop('#d81e1e', { rough: 0.3 }), 0, 3.4, 0, 0.02, 16)); const dm = c3Mesh(new THREE.SphereGeometry(0.6, 16, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#d81e1e', { rough: 0.3 }), 0.02); dm.position.y = 4.9; ex.add(dm);
    ex.add(cyl(0.2, 0.25, 0.5, M.dark, 0, 5.6, 0, 0.01, 8)); ex.add(rb(0.9, 0.18, 0.3, M.dark, 0.3, 5.9, 0, 0.01)); const hs = dpPipe([0.2, 5.6, 0.1], [0.65, 2.6, 0.5], 0.08, M.dark); hs.position.x -= 0; ex.add(hs); ex.add(rb(1.0, 0.8, 0.12, c3Prop('#f4f0e6'), 0, 3.6, 0.6, 0.01)); ex.add(rb(1.6, 0.3, 0.6, M.steelD, 0, 2.0, -0.3, 0.01));
    scene.add(pl(1.8, 2.2, c3Flat('#ffffff', { map: dpTexSign('YANGIN', '#d81e1e', '#ffffff', 'tüpü') }), 22.2, 7.6, 0.08)); }
  for (const [x, y] of [[12.6, 8.4], [12.6, 2.2]]) { scene.add(rb(0.9, 0.9, 0.15, M.white, x, y, 0.1, 0.01)); scene.add(rb(0.3, 0.42, 0.12, c3Prop('#d8dcd8'), x, y, 0.2, 0.005)); }
  scene.add(dpPipe([12.6, 8.85, 0.12], [12.6, 21.3, 0.12], 0.09, M.white));
  { const fr = rb(4.2, 3.3, 0.25, c3Prop('#5a3a22', { rough: 0.5 }), 9.8, 16.2, 0.12, 0.015); scene.add(fr); scene.add(pl(3.7, 2.8, c3Flat('#ffffff', { map: dpTexPhoto() }), 9.8, 16.2, 0.26)); }
  scene.add(rb(3.6, 4.6, 0.15, c3Prop('#2a2a30'), -23.9, 15.6, 28.5, 0)); scene.add(pl(3.2, 4.2, c3Flat('#ffffff', { map: dpTexRecycle() }), -23.78, 15.6, 28.5, Math.PI / 2));
  // lockers: 3D handles, padlocks, number plates, a seam between doors; a cardboard box + a rolled mat on top; boots below
  for (let i = 0; i < 6; i++) { const z = 8.7 + i * 2.4; scene.add(rb(0.18, 1.3, 0.22, M.steelD, -20.75, 6.6, z + 0.55, 0.01)); if (i % 2 === 0) { scene.add(rb(0.22, 0.5, 0.4, c3Prop('#e8b830', { metal: 0.6, rough: 0.3 }), -20.7, 5.9, z + 0.55, 0.01)); }
    scene.add(rbNC(0.08, 12.6, 0.12, c3Prop('#7a3208'), -20.86, 6.8, z + 1.2, 0)); }
  { const bx = rb(2.6, 1.4, 2.2, c3Prop('#c89a5a', { rough: 0.9 }), -22.3, 13.9, 16.0, 0.02); bx.rotation.y = 0.15; scene.add(bx); const rl = cyl(0.5, 0.5, 2.6, c3Prop('#2a6ad0', { rough: 0.7 }), -22.3, 13.8, 11.2, 0.02, 12); rl.rotation.x = Math.PI / 2; scene.add(rl); }
  for (const [z, ry] of [[22.4, 0.2], [23.4, -0.1]]) { const b = new THREE.Group(); b.position.set(-22.6, 0, z); b.rotation.y = ry; b.add(c3Put(c3Mesh(c3RBox(1.2, 1.5, 0.7, 0.25, 3), c3Prop('#2a2420', { rough: 0.6 }), 0.02), 0, 0.75, 0)); b.add(c3Put(c3Mesh(c3RBox(1.9, 0.6, 0.75, 0.25, 3), c3Prop('#2a2420', { rough: 0.6 }), 0.02), 0.4, 0.3, 0)); b.add(rb(1.95, 0.15, 0.8, c3Prop('#c8a030'), 0.4, 0.08, 0, 0.01)); scene.add(b); }
  // tea corner: a wall shelf of tea tins + a sugar jar + a radio, a kettle, a trash bin + a yellow mop bucket with a mop
  { const sh = rb(6.0, 0.25, 1.2, M.wood, -19, 15.4, 0.6, 0.015); scene.add(sh); for (const x of [-21.6, -16.4]) scene.add(rb(0.15, 0.8, 1.0, M.steelD, x, 15.0, 0.5, 0.01));
    [['#c8321e', -21.2], ['#2a8a4a', -20.2], ['#f2c23a', -19.2]].forEach(([c, x]) => { scene.add(cyl(0.38, 0.38, 1.0, c3Prop(c, { metal: 0.3, rough: 0.35 }), x, 16.05, 0.6, 0.015, 14)); scene.add(cyl(0.4, 0.4, 0.14, c3Prop('#d8d8d0', { metal: 0.6 }), x, 16.6, 0.6, 0.01, 14)); });
    const rd = c3Put(c3Mesh(c3RBox(2.0, 1.1, 0.8, 0.2, 3), c3Prop('#2a8a9a', { rough: 0.4 }), 0.02), -17.2, 16.1, 0.65); scene.add(rd); { const kb = cyl(0.3, 0.3, 0.12, M.dark, -17.6, 16.1, 1.07, 0, 14); kb.rotation.x = Math.PI / 2; scene.add(kb); } scene.add(dpPipe([-16.6, 16.6, 0.5], [-15.6, 18.4, 0.5], 0.03, M.steel));
    const bin = new THREE.Group(); bin.position.set(-13.4, 0, 5.4); scene.add(bin); bin.add(cyl(0.95, 0.75, 2.6, c3Prop('#2a6ad0', { rough: 0.45 }), 0, 1.3, 0, 0.02, 16)); bin.add(cyl(1.02, 1.02, 0.2, c3Prop('#1e4aa8', { rough: 0.45 }), 0, 2.6, 0, 0.015, 16));
    const bk = new THREE.Group(); bk.position.set(-15.6, 0, 6.6); scene.add(bk); bk.add(cyl(1.0, 0.85, 1.6, c3Prop('#f2c21a', { rough: 0.4 }), 0, 0.8, 0, 0.02, 16)); bk.add(c3Put(c3Mesh(new THREE.TorusGeometry(0.85, 0.06, 6, 20, Math.PI), M.steelD, 0.01), 0, 1.6, 0)); bk.add(dpPipe([0.2, 0.9, 0], [1.4, 9.5, -1.0], 0.1, c3Prop('#c88a4a', { rough: 0.6 }))); bk.add(cyl(0.6, 0.4, 0.8, c3Prop('#e8e0cc', { rough: 0.9 }), 0.15, 1.2, 0, 0.01, 10)); }
  // big plants: one in the back-left corner by the counter, one by the right wall (the old sphere plant stays at z 33)
  { const p1 = dpBigPlant(1, 1.1); p1.position.set(-23.0, 0, 6.0); scene.add(p1); const p2 = dpBigPlant(2, 1.0); p2.position.set(21.8, 0, 22.8); scene.add(p2); }
  // ceiling: an air grille, a smoke detector
  for (const [x, z] of [[6, 14], [-6, 26]]) { const gr = plNC(2.8, 2.8, c3Flat('#ffffff', { map: dpTexGrille() }), x, DP_H - 0.05, z, 0, Math.PI / 2); scene.add(gr); }
  { const sd = cyl(0.55, 0.6, 0.3, M.white, -3, DP_H - 0.2, 14, 0.01, 16); scene.add(sd); }
  // the door: a closer arm, a kick plate, a rubber mat in front
  { s.door.add(rb(1.6, 0.35, 0.4, M.steelD, -1.2, 13.6, 0.35, 0.01)); s.door.add(rb(5.6, 1.2, 0.06, M.steel, -2.95, 0.7, 0.18, 0.005)); s.door.add(rb(5.6, 1.2, 0.06, M.steel, -2.95, 0.7, -0.18, 0.005));
    const mat = rb(6.4, 0.08, 3.6, c3Prop('#2a2e3a', { rough: 0.95 }), 16.6, 0.04, 2.6, 0); mat.userData.noCast = true; scene.add(mat); }
}
// ---- the tower layout: [x, z, baseY, topY, startH (at 17 s), growStart, growDur]
const DP_TOWERS = [
  [-19.5, 3.7, 5.2, 24, 0, 18.95, 0.55],   // in front of the tea urn (buries it by 19.5)
  [-22.2, 2.2, 5.2, 24, 1.2, 18.9, 0.6], [-16.6, 2.4, 5.2, 21, 0, 19.0, 0.55],
  [-11.6, 2.8, 0, 24, 3.0, 19.0, 0.8], [-2.4, 3.0, 0, 24, 2.0, 19.2, 0.8], [-7.0, 5.6, 0, 9.5, 2.2, 19.4, 0.6],
  [2.2, 2.8, 0, 15, 0, 19.3, 0.7], [7.6, 3.2, 0, 24, 1.5, 19.1, 0.9],
  [22.0, 7.0, 0, 24, 2.6, 18.95, 0.9], [21.6, 12.5, 0, 24, 0, 19.2, 0.8], [21.2, 20, 0, 16, 1.0, 19.5, 0.6], [18.0, 26.4, 0, 7, 3.5, 19.6, 0.5],
  [-18.6, 10, 0, 24, 1.8, 19.15, 0.8], [-18.4, 17, 0, 24, 0, 19.35, 0.8], [-13.5, 11.5, 0, 18, 2.0, 19.25, 0.7],
  [-3.0, 8.0, 0, 24, 4.0, 19.3, 0.85],     // TC: the tower the camera cranes up
  [-14.5, 15.5, 0, 24, 0, 19.45, 0.7], [1.2, 11.5, 0, 14, 0, 19.5, 0.6], [5.0, 8.4, 0, 20, 1.0, 19.4, 0.7],
  [-10.0, 20.4, 5.0, 8.0, 1.2, 19.5, 0.5], [-6.0, 21.6, 5.0, 7.5, 0, 19.55, 0.5],   // on the table
  [-3.5, 28, 0, 2.4, 2.4, 99, 1], [-14, 27, 0, 5, 0, 19.6, 0.5], [18.5, 30, 0, 3.0, 3.0, 99, 1],
];

function dpBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 600), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#7ab0c8', ambI: 0.32, sky: '#c8f0f0', ground: '#a87040', key: '#fff0d8', keyI: 0.75, keyP: [-30, 50, 60], rim: '#ffc890', rimI: 0.35, rimP: [30, 30, -20] });
  const M = DP.M = { steel: c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }), steelD: c3Prop('#8a929a', { metal: 0.5, rough: 0.4 }), dark: c3Prop('#2a2a30', { rough: 0.5 }), orange: c3Prop('#f07a1a', { rough: 0.45 }), orangeD: c3Prop('#c85a10', { rough: 0.5 }),
    white: c3Prop('#eef0ee', { rough: 0.4 }), enamel: c3Prop('#e8eae6', { rough: 0.45 }), tube: c3Prop('#ffffff', { emissive: '#fff6e8', ei: 1.5, glow: '#fff6e0' }), wood: c3Prop('#ffffff', { map: texWood(), rough: 0.6 }),
    teal: c3Prop('#1e7a7a', { rough: 0.5 }), red: c3Prop('#c8321e', { rough: 0.35 }), frame: c3Prop('#e8e4dc', { rough: 0.4 }), cream: c3Prop('#f2e8d0', { rough: 0.6 }), leaf: c3Prop('#3a9a4a', { rough: 0.6 }), pot: c3Prop('#c8603a', { rough: 0.7 }),
    book: (() => { const m = c3Prop('#ffffff', { rough: 0.55 }); m.vertexColors = true; return m; })() };
  const F = new THREE.Group(); scene.add(F);   // FOCUS layer: everything people stand behind / beside (towers, table, door frame, piles)
  const wallM = c3Prop('#ffffff', { map: dpTexWall(), rough: 0.85 });
  // floor: warm terrazzo-ish tiles
  { const t = texTiles('#c87644', '#a85a32', [12, 10]); scene.add(pl(2 * DP_X, DP_Z, c3Prop('#ffffff', { map: t, rough: 0.5, env: 0.6 }), 0, 0, DP_Z / 2, 0, -Math.PI / 2)); }
  // walls: the back wall in pieces round the window (x -13..-1, y 6..17) and the door (x 14..20, y 0..14.5; FOCUS so people go behind its frame)
  scene.add(dpWall(-DP_X, -13, 0, DP_H, 'z', 0, wallM)); scene.add(dpWall(-13, -1, 0, 6, 'z', 0, wallM)); scene.add(dpWall(-13, -1, 17, DP_H, 'z', 0, wallM)); scene.add(dpWall(-1, 12, 0, DP_H, 'z', 0, wallM));
  for (const w of [dpWall(12, 14, 0, DP_H, 'z', 0, wallM), dpWall(20, DP_X, 0, DP_H, 'z', 0, wallM), dpWall(14, 20, 14.5, DP_H, 'z', 0, wallM)]) F.add(w);
  scene.add(dpWall(0, DP_Z, 0, DP_H, 'x', -DP_X, wallM)); scene.add(dpWall(0, DP_Z, 0, DP_H, 'x', DP_X, wallM));
  scene.add(plNC(2 * DP_X, DP_Z, c3Prop('#a8ccc8', { rough: 0.8 }), 0, DP_H, DP_Z / 2, 0, Math.PI / 2));
  // ceiling grid + fluorescent fixtures
  const KC = new THREE.Group(); scene.add(KC);
  for (let x = -24; x <= 24; x += 6) KC.add(rbNC(0.18, 0.12, DP_Z, M.frame, x, DP_H - 0.06, DP_Z / 2, 0)); for (let z = 0; z <= DP_Z; z += 6) KC.add(rbNC(2 * DP_X, 0.12, 0.18, M.frame, 0, DP_H - 0.06, z, 0));
  for (const z of [8, 20, 32]) for (const x of [-12, 0, 12]) { KC.add(rbNC(7.4, 0.35, 1.8, M.enamel, x, DP_H - 0.25, z, 0)); for (const dz of [-0.4, 0.4]) { const tb = cyl(0.17, 0.17, 6.8, M.tube, x, DP_H - 0.5, z + dz, 0, 8); tb.rotation.z = Math.PI / 2; tb.userData.noCast = true; KC.add(tb); }
    const l = new THREE.SpotLight('#fff0d8', 1.5, 40, 0.95, 1.0, 1.4); l.position.set(x, DP_H - 0.8, z); l.target.position.set(x, 0, z + 1); l.layers.enableAll(); scene.add(l); scene.add(l.target); }
  // ---- the window onto the yard
  { const yard = new THREE.Mesh(new THREE.PlaneGeometry(56, 33), c3Flat('#ffffff', { map: dpTexYard() })); yard.material.userData.c3keep = true; yard.position.set(-7, 10, -16); yard.userData.noCast = true; scene.add(yard);
    for (const [w, h, x, y] of [[12.6, 0.6, -7, 6], [12.6, 0.6, -7, 17], [0.6, 11.6, -13, 11.5], [0.6, 11.6, -1, 11.5], [0.3, 11, -7, 11.5], [12, 0.3, -7, 11.5]]) scene.add(rb(w, h, 0.7, M.frame, x, y, 0.1, 0));
    scene.add(rb(13.6, 0.4, 1.6, M.frame, -7, 5.8, 0.7, 0));   // sill
    for (let i = 0; i < 3; i++) { const p = dpBigPlant(10 + i, 0.36 + 0.06 * (i % 2)); p.position.set(-11.5 + i * 2.2, 6.0, 0.85); scene.add(p); }   // sill plants (v2: real leaves on stems)
    const wl = new THREE.SpotLight('#ffe6c0', 1.6, 70, 0.55, 0.8, 1.0); wl.position.set(-7, 16, -12); wl.target.position.set(-4, 0, 16); wl.layers.enableAll(); scene.add(wl); scene.add(wl.target); }
  // ---- tea counter (x -23.5..-14.5, top 5.2) + the urn, teapot, tulip glasses, sugar bowl
  { const g = new THREE.Group(); scene.add(g); g.add(rb(9, 5.0, 3.6, c3Prop('#d8843a', { rough: 0.5 }), -19, 2.5, 1.8)); g.add(rb(9.3, 0.25, 3.9, M.steel, -19, 5.1, 1.9));
    for (let i = 0; i < 3; i++) { g.add(rb(2.8, 4.2, 0.08, c3Prop('#c8742a', { rough: 0.5 }), -22 + i * 3, 2.4, 3.62)); g.add(rb(0.8, 0.18, 0.18, M.steelD, -22 + i * 3, 4.0, 3.72)); }
    const [ux, uy, uz] = DP_URN; s.urn = new THREE.Group(); s.urn.position.set(ux, uy, uz); g.add(s.urn);
    s.urn.add(cyl(1.25, 1.25, 3.4, M.steel, 0, 1.9, 0, 0, 24)); s.urn.add(cyl(1.35, 1.35, 0.25, M.steelD, 0, 0.12, 0, 0, 24)); const dome = c3Mesh(new THREE.SphereGeometry(1.25, 20, 10, 0, TAU, 0, Math.PI / 2), M.steel, 0); dome.position.y = 3.6; s.urn.add(dome);
    s.urn.add(cyl(0.18, 0.18, 0.4, M.dark, 0, 4.9, 0, 0, 8)); for (const sx of [-1, 1]) s.urn.add(rb(0.3, 0.7, 0.3, M.dark, sx * 1.35, 2.6, 0)); { const tap = cyl(0.12, 0.12, 0.7, M.steelD, 0, 1.0, 1.4, 0, 8); tap.rotation.x = Math.PI / 2; s.urn.add(tap); s.urn.add(rb(0.5, 0.18, 0.18, M.dark, 0, 1.2, 1.6)); }
    s.urn.add(cyl(0.6, 0.55, 0.9, M.red, 0, 4.25 + 0.6, 0, 0, 16));   // the small brewing pot on top (çaydanlık)
    const pot = new THREE.Group(); pot.position.set(-16.2, 5.2, 1.8); g.add(pot); pot.add(cyl(0.9, 0.8, 1.6, M.red, 0, 0.8, 0, 0, 16)); pot.add(cyl(0.6, 0.55, 1.0, M.red, 0, 2.1, 0, 0, 14)); { const sp = cyl(0.12, 0.08, 1.0, M.red, 0.95, 1.1, 0, 0, 8); sp.rotation.z = -0.9; pot.add(sp); }
    for (let i = 0; i < 6; i++) { const tg = dpTulip(i % 3 !== 2); tg.position.set(-23 + (i % 3) * 0.95, 5.25, 1.4 + Math.floor(i / 3) * 1.0); g.add(tg); }
    g.add(cyl(1.6, 1.6, 0.08, M.steel, -22.05, 5.25, 1.9, 0, 20)); g.add(cyl(0.45, 0.4, 0.6, c3Prop('#f4f0e6', { rough: 0.3 }), -17.2, 5.5, 3.0, 0, 12));
    scene.add(pl(3.4, 4.4, c3Flat('#ffffff', { map: dpTexPoster(1) }), -19, 13.5, 0.06));
    g.add(rb(9, 0.3, 1.4, M.wood, -19, 10.4, 0.7)); for (let i = 0; i < 6; i++) { const mg = mug(['#f07a1a', '#2a8a9a', '#f4f0e6', '#c8321e'][i % 4], -22.6 + i * 1.3, 10.55, 0.7); mg.scale.setScalar(0.9); g.add(mg); } }
  // ---- notice board + clock + safety poster + a sign
  scene.add(rb(8.2, 6.9, 0.4, M.wood, 4.6, 11, 0.2, 0)); scene.add(pl(7.8, 6.5, c3Flat('#ffffff', { map: dpTexBoard() }), 4.6, 11, 0.42));
  { const ck = new THREE.Group(); ck.position.set(4.6, 17.6, 0.3); scene.add(ck); ck.add(cyl(1.3, 1.3, 0.3, M.dark, 0, 0, 0, 0, 24)); ck.children[0].rotation.x = Math.PI / 2; const f = new THREE.Mesh(new THREE.CircleGeometry(1.15, 28), c3Flat('#ffffff', { map: texClock() })); f.position.z = 0.17; ck.add(f); }
  scene.add(pl(3.2, 4.2, c3Flat('#ffffff', { map: dpTexPoster(0) }), 10.4, 10.8, 0.06));
  scene.add(pl(11, 2.75, c3Flat('#ffffff', { map: dpTruckSign() }), -7, 20.3, 0.06));
  // ---- the door (hinge on the right, x 20) + a lit corridor behind it
  { const fr = c3Prop('#c8ccd2', { metal: 0.4, rough: 0.35 }); for (const [w, h, x, y] of [[0.6, 14.8, 13.7, 7.4], [0.6, 14.8, 20.3, 7.4], [7.2, 0.6, 17, 14.8]]) F.add(rb(w, h, 0.9, fr, x, y, 0.2, 0));
    s.door = new THREE.Group(); s.door.position.set(19.95, 0, 0.15); F.add(s.door); const leaf = rb(5.9, 14.2, 0.3, c3Prop('#ffffff', { map: dpTexDoor(), rough: 0.5 }), -2.95, 7.1, 0, 0); s.door.add(leaf);
    s.door.add(rb(0.25, 0.25, 0.9, M.steelD, -5.3, 6.6, 0.3, 0)); s.door.add(rb(0.9, 0.25, 0.25, M.steelD, -5.0, 6.6, 0.62, 0));
    const hm = c3Prop('#e8dca0', { rough: 0.8 }); scene.add(rb(0.3, 14.5, 12, hm, 13.6, 7.25, -6, 0)); scene.add(rb(0.3, 14.5, 12, hm, 20.4, 7.25, -6, 0)); scene.add(rb(7, 14.5, 0.3, c3Prop('#d8c890'), 17, 7.25, -12, 0)); scene.add(rb(7, 0.3, 12, c3Prop('#fff4d8'), 17, 14.5, -6, 0));
    scene.add(pl(7, 12, c3Prop('#b8a888', { rough: 0.6 }), 17, 0.02, -6, 0, -Math.PI / 2)); scene.add(pl(2.2, 2.8, c3Flat('#ffffff', { map: dpTexPoster(0) }), 17, 8, -11.8));
    const cl = new THREE.PointLight('#fff0d0', 1.4, 20, 2); cl.position.set(17, 12.5, -6); cl.layers.enableAll(); scene.add(cl); }
  // ---- left wall: orange lockers (z 7.5..22) + helmets, hi-vis vests on hooks (z 24..33)
  { for (let i = 0; i < 6; i++) { const z = 8.7 + i * 2.4, g = new THREE.Group(); g.position.set(-22.4, 0, z); scene.add(g); g.add(rb(3.0, 13, 2.35, M.orange, 0, 6.8, 0, 0)); g.add(rb(3.1, 0.4, 2.4, M.orangeD, 0, 0.2, 0, 0));
      const fp = pl(2.2, 12.4, c3Flat('#ffffff', { map: dpTexLocker(i) }), 1.52, 6.8, 0, Math.PI / 2); g.add(fp); }
    for (const [z, c] of [[9.5, '#f4f4f0'], [13.6, '#f07a1a'], [18.2, '#f4f4f0']]) { const hh = c3Mesh(new THREE.SphereGeometry(1.0, 16, 10, 0, TAU, 0, Math.PI / 2), c3Prop(c, { rough: 0.35 }), 0); hh.position.set(-22.4, 13.3, z); scene.add(hh); scene.add(cyl(1.2, 1.2, 0.12, c3Prop(c, { rough: 0.35 }), -22.4, 13.32, z, 0, 16)); }
    scene.add(rb(2.4, 1.6, 2.0, c3Prop('#b88a52', { rough: 0.9 }), -22.4, 14.1, 20.6, 0));
    scene.add(rb(0.3, 0.4, 10, M.wood, -23.8, 10.5, 28.5, 0)); ['#f07a1a', '#c8e02a', '#f07a1a', '#c8e02a'].forEach((c, i) => { const z = 24.8 + i * 2.4; const hk = cyl(0.1, 0.1, 0.8, M.steelD, -23.4, 10.6, z, 0, 6); hk.rotation.z = Math.PI / 2; scene.add(hk);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), c3Prop('#ffffff', { map: dpTexVest(c), rough: 0.7 })); v.material.alphaTest = 0.5; v.material.side = THREE.DoubleSide; v.position.set(-23.55 + i * 0.04, 9.0, z); v.rotation.set(0, Math.PI / 2, 0.05 * (i % 2 ? 1 : -1)); scene.add(v); }); }
  // ---- right wall: fridge, calendar, radiator, plant, a coat rack
  { const fz = 26; scene.add(rb(3.4, 11, 3.6, M.white, 22.2, 5.5, fz, 0)); scene.add(rb(0.12, 0.2, 2.8, M.steelD, 20.45, 7.5, fz)); scene.add(rb(0.12, 3.5, 0.2, M.steelD, 20.45, 6.0, fz - 1.3));
    for (const [z, c] of [[fz - 0.8, '#f2c23a'], [fz + 0.6, '#e8283a'], [fz, '#2a6ad8']]) scene.add(rb(0.1, 0.6, 0.6, c3Prop(c), 20.45, 9.2 + (z - fz) * 0.5, z, 0));
    scene.add(pl(3.0, 4.5, c3Flat('#ffffff', { map: dpTexCal() }), 23.94, 11.5, 15, -Math.PI / 2));
    const rad = dpRadiator(10, 3.4, M.white, c3Prop('#d8a840', { metal: 0.7, rough: 0.3 })); rad.position.set(23.5, 0, 19); rad.rotation.y = -Math.PI / 2; scene.add(rad);
    const pt = new THREE.Group(); pt.position.set(21.5, 0, 33); scene.add(pt); pt.add(cyl(1.2, 0.9, 2.4, M.pot, 0, 1.2, 0, 0, 14)); for (let k = 0; k < 9; k++) { const lf = c3Mesh(new THREE.SphereGeometry(1.0, 10, 8), M.leaf, 0); lf.scale.set(0.45, 1.8, 0.2); const a = k * 0.7; lf.position.set(Math.cos(a) * 0.9, 4 + (k % 3) * 0.8, Math.sin(a) * 0.9); lf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); pt.add(lf); } }
  dpDress(s, scene, F, M);
  // ---- the table (-8, 21) + chairs + tavla, glasses, newspaper, simit plate
  { const g = new THREE.Group(); F.add(g); g.add(rb(10, 0.4, 5, c3Prop('#f2c86a', { rough: 0.35 }), -8, 4.8, 21)); for (const [x, z] of [[-12.5, 19], [-3.5, 19], [-12.5, 23], [-3.5, 23]]) g.add(cyl(0.14, 0.14, 4.6, M.steelD, x, 2.3, z, 0, 8));
    for (const [x, z, ry] of [[-11, 17.6, 0], [-6, 17.4, 0.1], [-10.6, 24.8, Math.PI], [-5.4, 24.6, Math.PI - 0.15]]) g.add(dpChair(x, z, ry, '#2f6ad0'));
    const tv = pl(3.2, 2.0, c3Flat('#ffffff', { map: dpTexTavla() }), -8.2, 5.03, 22.2, 0, -Math.PI / 2); tv.rotation.z = 0.2; g.add(tv);
    const np = pl(2.2, 2.8, c3Flat('#ffffff', { map: dpTexPaper() }), -4.6, 5.02, 20.0, 0, -Math.PI / 2); np.rotation.z = -0.3; g.add(np);
    for (const [x, z] of [[-11.8, 19.8], [-7.6, 19.7], [-4.2, 22.6]]) { const tg = dpTulip(true); tg.position.set(x, 5.0, z); g.add(tg); }
    g.add(cyl(1.0, 0.9, 0.12, c3Prop('#f4f0e6', { rough: 0.3 }), -12, 5.06, 22.6, 0, 16)); { const sm = c3Mesh(new THREE.TorusGeometry(0.6, 0.22, 8, 16), c3Prop('#c87a3a', { rough: 0.7 }), 0); sm.rotation.x = Math.PI / 2; sm.position.set(-12, 5.3, 22.6); g.add(sm); } }
  // ---- books
  s.towers = DP_TOWERS.map((T, i) => { const [x, z, y0, y1] = T, L = dpStack('tw' + i, x, z, y0, y1), m = new THREE.Mesh(dpBookGeo(L), M.book); m.userData.noShade = true; m.userData.L = L; m.userData.T = T;
    m.userData.cum = []; let v = 0; for (const b of L) { v += dpVerts(b); m.userData.cum.push(v); } F.add(m); return m; });
  // T*: the tower the boss pulls a book from; its own meshes so it can lean and avalanche
  { const L = dpStack('tstar', DP_TS[0], DP_TS[1], 0, 23.6, { big: 1.15, hk: 1.25, jit: 0.1, ry: 0.15 }); s.tsK = L.findIndex((b) => b.top > 6.6);   // the book at the boss's hand height: red with a gold band
    Object.assign(L[s.tsK], { c: '#d8342a', band: '#f2d04a', sp: 1 }); s.ts = L.map((b) => { const m = dpBookMesh(b, M.book); F.add(m); return m; }); }
  s.bossBook = dpBookMesh(s.ts[s.tsK].userData.b, M.book); F.add(s.bossBook);
  // v2 G2: the heap the avalanche makes ON the boss (books in bottom-up order, per-book drawRange), its dark core filler (hides
  // the boss card sinking into it + the gaps), a depth-only floor patch on FOCUS (the sinking card never shows under the floor)
  { const R = s.ts.map((m, i) => i), spots = dpHeapSurf('tsr', DP_HEAP[0], DP_HEAP[1], 4.5, 8.2, s.ts.length).sort((a, b) => a.y - b.y); R.sort((a, b) => s.ts[a].userData.b.y - s.ts[b].userData.b.y); s.tsRest = []; R.forEach((i, j) => { s.tsRest[i] = spots[j]; }); }
  s.core = (() => { const L = dpHeap('core', DP_HEAP[0], DP_HEAP[1], 4.5, 8.0), m = new THREE.Mesh(dpBookGeo(L), M.book); m.userData.noShade = true; m.userData.cum = []; let v = 0; for (const b of L) { v += dpVerts(b); m.userData.cum.push(v); } F.add(m); return m; })();
  s.coreFill = c3Mesh(new THREE.ConeGeometry(3.7, 7.0, 20), c3Prop('#6a3428', { rough: 0.8 }), 0); s.coreFill.userData.noShade = true; F.add(s.coreFill);
  s.cover = (b) => { const c = pl(b.w * 0.62, b.d * 0.42, c3Prop('#ffffff', { map: DP.coverT ||= tex((g, w, h) => { g.fillStyle = '#f6e6c0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8a830'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3a2418'; g.fillRect(w * 0.18, h * 0.3, w * 0.64, h * 0.12); for (let i = 0; i < 2; i++) g.fillRect(w * 0.26, h * (0.56 + i * 0.14), w * 0.48, h * 0.06); }, 256, 160), rough: 0.6 }), 0, b.h / 2 + 0.012, 0, 0, -Math.PI / 2); c.userData.noCast = true; return c; };
  // the buried boss's hand: a toon rubber arm + grip dot drawn with the kit's own strokes (t3TaperPath / t3Hand, limb colour)
  // on a card that turns to the camera, holding a copy of his book; its lower end is hidden inside the heap
  { const cw = 1.2, ch = 4.4, px = 160, ppu = px / cw, T = tex((g, w, h) => { g.clearRect(0, 0, w, h); const P = []; for (let i = 0; i <= 18; i++) { const q = i / 18; P.push([w * 0.5 + Math.sin(q * Math.PI) * w * 0.16 - q * w * 0.05, h - q * (h - 0.62 * ppu)]); }
      t3TaperPath(g, P, 0.22 * ppu, 0.2 * ppu, T3.limb); t3Hand(g, P[18][0], P[18][1], 'grip', 1, -Math.PI / 2, 0.33 * ppu / 6.6, T3.limb); }, px, Math.round(ch * ppu));
    s.hand = new THREE.Group(); s.handPiv = new THREE.Group(); s.hand.add(s.handPiv); F.add(s.hand);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), new THREE.MeshBasicMaterial({ map: T, transparent: true, alphaTest: 0.5, toneMapped: false })); card.position.y = ch / 2; Object.assign(card.userData, { noCast: true, noShade: true, noInk2: true }); s.handPiv.add(card);
    s.handTip = [cw * (0.5 - 0.05) - cw / 2, ch - 0.62]; s.handBook = dpBookMesh(Object.assign({}, s.ts[s.tsK].userData.b), M.book); s.handPiv.add(s.handBook); s.handBook.add(s.cover(s.handBook.userData.b)); s.bossBook.add(s.cover(s.bossBook.userData.b)); }
  s.dust = []; { const pt = dpTexPuff(); for (let i = 0; i < 10; i++) { const m = spritePlane(scene, pt, 1, 1, 7); m.material.color.set('#f6e2c4'); s.dust.push(m); } }
  // the coworker's two armloads (one column of 5; then three columns of 6) and the D1 pile they make
  const R = RNG('dparm'); s.arm1 = []; s.arm2 = [];
  // v2: armload 1 = one column of 5 between his hands; armload 2 = two columns of 6 side by side (hands on the outer sides), up to his chin
  { let y = 0; for (let j = 0; j < 5; j++) { const b = dpBook(R, { big: 0.85 }); b.w = R.r(2.1, 2.4); b.ox = R.n(0.06); b.oy = y + b.h / 2; b.col = 0; b.ncol = 1; y += b.h; s.arm1.push(b); } }
  for (let c = 0; c < 2; c++) { let y = 0; for (let j = 0; j < 6; j++) { const b = dpBook(R, { big: 0.85, hk: 0.85 }); b.w = R.r(2.0, 2.3); b.ox = R.n(0.06); b.oy = y + b.h / 2; b.col = c; b.ncol = 2; y += b.h; s.arm2.push(b); } }
  s.arm1M = s.arm1.map((b) => { const m = dpBookMesh(b, M.book); F.add(m); return m; }); s.arm2M = s.arm2.map((b) => { const m = dpBookMesh(b, M.book); F.add(m); return m; });
  s.d1Rest = dpHeapSurf('d1', DP_D1[0], DP_D1[1], 2.8, 2.2, 5).concat(dpHeapSurf('d1b', DP_D1[0], DP_D1[1] + 0.4, 3.4, 3.4, 18));
  s.d1Core = (() => { const L = dpHeap('d1c', DP_D1[0], DP_D1[1] + 0.3, 3.0, 2.6), m = new THREE.Mesh(dpBookGeo(L), M.book); m.userData.noShade = true; m.userData.n = L.reduce((a, b) => a + dpVerts(b), 0); F.add(m); return m; })();
  // the hero's tulip glass (in hand)
  s.glass = dpTulip(true); s.glass.scale.setScalar(1.25); F.add(s.glass);
  // steam over the urn
  const puffT = dpTexPuff(); s.steam = []; for (let i = 0; i < 6; i++) { const m = spritePlane(scene, puffT, 1.4, 1.4, 7); m.material.opacity = 0.7; s.steam.push(m); }
  c3Layer(F, C3.L_FOCUS);
  for (const k of ['hero', 'cowork', 'boss']) toonPerson(s, k);
  haze(scene, '#9ac8d0', 0.0028);
  c3Env(scene, { top: '#e8f8f8', mid: '#4a9aa0', bot: '#6a4a30' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.9, scale: 0.5, inkSet: false, focusK: 1, bounce: ['#d0f0f0', '#c08050', 0.1], lights: [[-19, 12, 6, '#ffd8a0', 1.2, 26], [17, 12, 4, '#fff0d8', 0.8, 24], [10, 9, 24, '#ffe8c8', 0.7, 34]],
    shafts: [[[-7, 16.5, -2], [-3, 0, 14], 3.5, 7, '#fff0d0', 0.08]] });
  return s;
}
const DP_get = () => DP.s ||= dpBuild();
SETS.depot = DP_get;

// ---- the continuous camera (absolute seconds). Legs: whip-in pan right decelerating onto the door -> push in + dutch on
// the dump -> orbit left round the giant armload -> whip left to the buried urn -> drop low to tower TC -> crane up it to
// the ceiling -> whip down to the door (boss) -> orbit + push to his face -> orbit right on "library" -> pull back + roll
// as the tower leans -> wide on the pile + the two reacting -> whip out right.
CAMSEQ.depot = [
  [17.06, [2.0, 9.5, 37], [-8, 8.5, 6], 46, -3],
  [17.62, [5.0, 9.2, 33], [14.5, 7.2, 2], 44, 0],
  [18.2, [9.0, 9.0, 26], [13.4, 7.4, 3], 42, 4],
  [18.86, [9.0, 8.6, 18.5], [15.5, 7.4, 2], 46, -2],
  [19.62, [-6.0, 11, 17], [-17.8, 8.6, 3], 50, -4],
  [20.12, [-2.4, 4.2, 18.5], [-3.0, 8.2, 6], 52, 2],
  [20.86, [-2.4, 15.5, 19.5], [-3.0, 20.5, 5], 52, -2],
  [21.42, [3.0, 13.0, 14.5], [15.5, 7.2, 1], 46, 3],
  [22.42, [12.5, 9.0, 16.8], [14.6, 7.8, 6], 42, -2],
  [23.42, [13.2, 9.2, 17.5], [14.6, 8.6, 6.8], 38, 2],
  [24.46, [16.2, 9.6, 18.8], [14.4, 8.4, 7], 42, -3],
  [25.25, [12.2, 10.6, 27], [15.0, 8.8, 7], 48, 4],
  [25.66, [6.5, 11.0, 39.3], [9.5, 7.0, 10], 58, -2],
  [25.99, [11.0, 10.8, 21.5], [13.9, 9.0, 7.8], 44, 2],
  [26.19, [11.1, 10.8, 21.4], [27.0, 10.0, 8.6], 44, 1],
];

// ---- the take
const DP_DOOR = (t) => { const a = EZ.o3(dpE(17.56, 17.7, t)) - 0.85 * EZ.io(dpE(19.3, 19.9, t)), b = EZ.o3(dpE(21.05, 21.22, t)); return Math.max(a, b * 1.0) + 0.04 * Math.sin(Math.max(0, t - 17.7) * 22) * Math.exp(-Math.max(0, t - 17.7) * 6) * (t < 19 ? 1 : 0); };
// a walk between key points [[t, x, z], ...] -> { x, z, vx, vz, moving, dist }
function dpPath(K, t) { if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], vx: 0, vz: 0, moving: false, dist: 0 }; let dist = 0;
  for (let i = 0; i + 1 < K.length; i++) { const [t0, x0, z0] = K[i], [t1, x1, z1] = K[i + 1], L = Math.hypot(x1 - x0, z1 - z0);
    if (t < t1) { const u = (t - t0) / (t1 - t0); return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), vx: (x1 - x0), vz: (z1 - z0), moving: L > 0.01, dist: dist + L * u }; } dist += L; }
  const l = K[K.length - 1]; return { x: l[1], z: l[2], vx: 0, vz: 0, moving: false, dist }; }
const DP_COP = [[17.6, 17.2, -1.6], [18.0, 14.8, 3.2], [18.12, 14.8, 3.2], [18.4, 17.2, -1.4], [18.5, 17.2, -1.4], [18.9, 14.4, 4.2], [19.06, 14.4, 4.2], [20.7, DP_CO[0], DP_CO[1]]];
const DP_BOP = [[21.25, 17.0, -1.2], [21.85, 15.6, 2.6], [22.4, DP_BOSS[0], DP_BOSS[1]]];
const DP_TALK = [[22.54, 22.8], [23.06, 24.66]];
const DP_LEAN0 = 24.92, DP_HIT = 25.35, DP_SINK = 25.33, DP_POP = 25.5;
// v2 G2 lean: a creak back (anticipation), forward, then the fall accelerates (monotone after 25.02 for the break solve)
function dpLean(t) { if (t < DP_LEAN0) return 0; if (t < 25.02) return -0.035 * EZ.o2(dpE(DP_LEAN0, 25.02, t)); if (t < 25.12) return lerp(-0.035, 0.03, EZ.io(dpE(25.02, 25.12, t))); const d = t - 25.12; return 0.03 + 0.5 * d + 10 * d * d; }
// the tower tips TOWARD the boss: pivot on its base edge on his side, axis = up x D
const DP_TD = (() => { const dx = DP_HEAP[0] - DP_TS[0], dz = DP_HEAP[1] - DP_TS[1], l = Math.hypot(dx, dz); return [dx / l, dz / l]; })();
function dpTsPos(b, th, sag) { const [Dx, Dz] = DP_TD, ox = b.x - DP_TS[0], oz = b.z - DP_TS[1], a = ox * Dx + oz * Dz - 1.3, px = ox - (a + 1.3) * Dx, pz = oz - (a + 1.3) * Dz, y = b.y - sag;
  const al = a * Math.cos(th) + y * Math.sin(th), ny = -a * Math.sin(th) + y * Math.cos(th); return [DP_TS[0] + px + (1.3 + al) * Dx, ny, DP_TS[1] + pz + (1.3 + al) * Dz]; }
const dpTsQ = (() => { const q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), ax = V3(DP_TD[1], 0, -DP_TD[0]), e = new THREE.Euler();
  return (b, th) => { q.setFromAxisAngle(ax, th); q2.setFromEuler(e.set(0, b.ry, b.rz || 0)); return q.multiply(q2); }; })();
// facing keys toward world points (or numbers), snapped over 0.16 s: [[t, [x, z] | facing], ...]
function dpFace(cam, x, z, K, t) { const f = (v) => typeof v === 'number' ? v : toonLookFacing(cam, x, z, v[0] - x, v[1] - z); let i = 0; while (i + 1 < K.length && K[i + 1][0] <= t) i++;
  if (i === 0) return f(K[0][1]); return lerp(f(K[i - 1][1]), f(K[i][1]), EZ.o3(dpE(K[i][0], K[i][0] + 0.16, t))); }
// v2: the gripping hand OVER a prop held in front of the torso. The kit's gripDot draws a square of the card around the hand
// (torso/vest pixels too), which pasted vest squares over the books and hid the tea glass; this is just the dot hand itself:
// a disc in the card's limb colour and light, the kit's size (t3Hand 'grip' 6.6 u, wide-shot boost lkh), always on top.
function dpDot(s, who, nm) { const p = s.p[who], h = c3ToonHandWorld(p, nm); s.dpd ||= {}; const key = who + nm;
  let m = s.dpd[key]; if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: T3.limb, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 30; Object.assign(m.userData, { noInk2: true, noCast: true, noShade: true }); c3Layer(m, C3.L_FOCUS); s.scene.add(m); s.dpd[key] = m; }
  if (!h || !p.g.visible) { m.visible = false; return; }
  const a = V3(0, 0, 0), b = V3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(s.cam); b.project(s.cam); const px = Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50;
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - px) / 1000 * 0.8)), r = 6.6 * (2 * T3.a * (p.o.headK ?? 1) / 100) * lk ** 0.8 * p.U;
  m.visible = true; m.scale.setScalar(r); m.position.copy(h).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.05); m.quaternion.copy(s.cam.quaternion);
  m.material.color.set(T3.limb).multiply(p.mat.color); }
function dpFrame(t) {
  const s = DP_get(); hideAll(s); hideGrips(s); if (s.dpd) for (const k in s.dpd) s.dpd[k].visible = false; const cam = seqCam(s, 'depot', t);
  s.door.rotation.y = DP_DOOR(t) * 1.55;
  // ---- towers grow (drawRange bottom-up); the urn steams until it is buried
  for (const m of s.towers) { const [, , y0, y1, h0, ts, td] = m.userData.T, hgt = y0 + h0 + (y1 - y0 - h0) * EZ.io(dpE(ts, ts + td, t)); let n = 0; while (n < m.userData.L.length && m.userData.L[n].top <= hgt + 1e-3) n++;
    m.visible = n > 0; m.geometry.setDrawRange(0, n ? m.userData.cum[n - 1] : 0); }
  s.steam.forEach((m, i) => { const ph = ((t * 0.55 + i / s.steam.length) % 1), puff = t > 19.55 && t < 20.3; m.visible = t < 19.3 || puff;
    if (!m.visible) return; const y0 = puff ? 9 : DP_URN[1] + 5.0, x0 = puff ? DP_URN[0] + 1.6 + i * 0.25 : DP_URN[0] + Math.sin(i * 2.1 + t) * 0.3, z0 = puff ? 5.2 : DP_URN[2];
    const k = puff ? EZ.o3(dpE(19.55 + i * 0.04, 19.9, t)) : ph; popAt(m, 1, [x0 + (puff ? k * 1.5 : Math.sin(ph * 5 + i) * 0.4), y0 + k * (puff ? 1.2 : 3.2), z0], cam, (0.6 + k * 1.2) * (puff ? 1.2 : 1)); m.material.opacity = (puff ? 0.8 * (1 - dpE(19.9, 20.3, t)) : 0.55) * (1 - k * 0.8); });
  // ---- the coworker: bursts in with armload 1, dumps it on D1 ("more"), dashes out, bursts back with the giant armload 2 ("and more"), dumps, joins the hero
  const coVis = t >= 17.6, dump1 = 18.04, dump2 = 19.0, C = dpPath(DP_COP, t);
  const coPose = (tq) => { const C = dpPath(DP_COP, tq), carrying = (tq < dump1) || (tq >= 18.5 && tq < dump2);
    const fac = C.moving ? faceTo(cam, C.x, C.z, C.x + C.vx, C.z + C.vz) : dpFace(cam, C.x, C.z, [[0, -0.6], [19.06, [-3.0, 8.0]], [19.9, [-19.5, 4]], [20.5, [3.0, 20.0]], [21.2, [17.0, 1.0]], [22.5, [14.5, 6.8]], [24.95, [18.0, 4.6]], [25.4, [14.9, 7.2]], [25.8, [3.0, 20.0]]], tq);
    const ex = [[0, 'excited'], [18.04, 'happy'], [18.12, 'determined'], [18.5, 'strain'], [19.0, 'grin'], [20.2, 'happy'], [21.3, 'nervous'], [22.6, 'worried'], [25.0, 'surprised'], [DP_HIT, 'shock'], [25.75, 'laugh'], [25.95, 'grin']];
    const grip = (x) => ({ h: [x, 0.56], pole: [1, 0.35], front: true, hand: 'grip' });
    const hd = carrying ? { L: grip(tq < dump1 ? -0.22 : 0.06), R: grip(tq < dump1 ? -0.22 : 0.06) } : tq < 18.5 ? { L: [[0, 'up'], [18.2, 'down']], R: [[0, 'up'], [18.2, 'down']] }
      : tq < 21.3 ? { L: [[0, 'up'], [19.12, 'hip'], [20.5, 'hip']], R: [[0, 'up'], [19.12, 'hip'], [20.5, 'point'], [20.9, 'hip']] } : { L: [[0, 'down'], [22.6, 'cross'], [DP_HIT, 'up'], [25.75, { h: [-0.04, -0.12], pole: [0.5, 1], front: true, over: true }]], R: [[0, 'down'], [22.6, 'cross2'], [DP_HIT, 'up'], [25.75, { h: [0.04, -0.1], pole: [0.5, 1], front: true, over: true }]] };
    const wob = tq >= 18.5 && tq < dump2 ? -0.05 * Math.sin(tq * 9) : 0, set1 = tq > dump2 ? -0.07 * Math.sin((tq - dump2) * 12) * Math.exp(-(tq - dump2) * 6) : 0, set0 = tq > dump1 ? -0.06 * Math.sin((tq - dump1) * 12) * Math.exp(-(tq - dump1) * 6) : 0;
    pose(s, 'cowork', tq, C.x, C.z, { facing: fac, mode: C.moving ? 'walk' : 'stand', phase: C.dist / 4.2, stride: 4.2, expr: ex, hand: hd, gaze: tq > 19.2 && tq < 19.9 ? [0.1, -0.85] : tq > 24.95 && tq < DP_HIT ? [0.6, -0.7] : tq > DP_HIT && tq < 25.75 ? [0.3, 0.2] : [0.3, 0],
      fx: tq > 25.75 ? 'sweat' : undefined, lean: wob + set0 + set1, squash: tq > DP_HIT && tq < 25.6 ? 0.3 * Math.sin(Math.PI * dpE(DP_HIT, 25.6, tq)) : 0 });
    return carrying; };
  // the two hands -> the held stack's frame: mid point, camera-right along the hands, the span between them
  const handInfo = () => { const L = c3ToonHandWorld(s.p.cowork, 'L'), Rr = c3ToonHandWorld(s.p.cowork, 'R'); if (!L || !Rr) return null; const rt = Rr.clone().sub(L); rt.y = 0; const w = Math.max(1.6, rt.length()); rt.normalize(); return { mid: L.clone().add(Rr).multiplyScalar(0.5), rt, w }; };
  const yaw = Math.atan2(cam.position.x - C.x, cam.position.z - C.z), toCam = V3(cam.position.x - C.x, 0, cam.position.z - C.z).normalize();
  const H1 = coVis && t >= dump1 ? (coPose(dump1 - 0.01), handInfo()) : null, H2 = coVis && t >= dump2 ? (coPose(dump2 - 0.01), handInfo()) : null;
  let Hn = null; if (coVis) { const carrying = coPose(t); Hn = handInfo(); if (carrying) { dpDot(s, 'cowork', 'L'); dpDot(s, 'cowork', 'R'); } }
  // held IN FRONT of the card (between it and the camera), bottom books between the hands, the stack sways with his steps
  const held = (list, meshes, sway, t0, dump, Hd, restOff) => meshes.forEach((m, j) => { const b = list[j]; if (t < t0 || !Hn && t < dump) { m.visible = false; return; }
    const at = (H, tt) => { const sw = sway * Math.sin(tt * 9 + b.col) * (b.oy / 3), cw = H.w / b.ncol, ox = (b.col - (b.ncol - 1) / 2) * cw + b.ox + sw, P = H.mid.clone().addScaledVector(toCam, b.d / 2 + 0.15).addScaledVector(H.rt, ox); P.y += b.oy - 0.35; return [P, sw, (cw + 0.3) / b.w]; };
    m.visible = true; m.rotation.order = 'YXZ'; if (t < dump) { const [P, sw, k] = at(Hn, t); m.scale.x = k; m.position.copy(P); m.rotation.set(0, Math.atan2(-Hn.rt.z, Hn.rt.x), sw * 0.05); return; }
    const r = s.d1Rest[restOff + j]; if (!r) { m.visible = false; return; } const [P, , k] = at(Hd, dump), tj = dump + j * 0.015, ry = Math.atan2(-Hd.rt.z, Hd.rt.x); m.scale.x = k;
    if (!dpFly(m, t, tj, [P.x, P.y, P.z], [0, ry, 0], [r.x, r.y, r.z], [r.rx, r.ry, r.rz], { up: 3, spin: [0, 0, j % 2 ? 1 : 0] })) { m.position.copy(P); m.rotation.set(0, ry, 0); } });
  held(s.arm1, s.arm1M, 0, 17.6, dump1, H1, 0); held(s.arm2, s.arm2M, 0.25, 18.5, dump2, H2, 5);
  s.d1Core.visible = t > dump2 + 0.08; s.d1Core.geometry.setDrawRange(0, Math.floor(s.d1Core.userData.n * EZ.o3(dpE(dump2 + 0.08, dump2 + 0.3, t)) / 36) * 36);
  // ---- the hero (YOU): tea break, glass in hand; watches the books pile up; reacts to the avalanche
  { const [x, z] = DP_HERO, ex = [[0, 'smile'], [17.72, 'surprised'], [18.5, 'shock'], [19.12, 'worried'], [20.04, 'nervous'], [21.3, 'nervous'], [22.6, 'skeptical'], [DP_HIT, 'shock'], [25.8, 'smug']];
    const fac = dpFace(cam, x, z, [[0, 0.2], [17.62, [17.0, 1.0]], [18.04, [11.6, 3.2]], [18.5, [16.0, 1.5]], [19.12, [-3.0, 8.0]], [19.6, [-19.5, 4.0]], [20.3, 0.1], [21.05, [17.0, 1.0]], [22.3, [14.5, 6.8]], [24.92, [18.0, 4.6]], [25.3, [14.9, 7.2]], [25.8, 0.25]], t);
    const jolt = (t0, k) => t > t0 && t < t0 + 0.5 ? k * Math.sin(Math.PI * dpE(t0, t0 + 0.5, t)) * Math.exp(-(t - t0) * 3) : 0;
    pose(s, 'hero', t, x, z, { facing: fac, expr: ex, squash: jolt(17.62, 0.35) + jolt(18.5, 0.3) + jolt(DP_HIT, 0.5), lean: -jolt(17.62, 0.12) - jolt(DP_HIT, 0.14) + jolt(25.8, 0.08),
      gaze: t < 17.62 ? [0, 0.3] : t < 19.12 ? [0.6, 0] : t < 20.3 ? [-0.2, -0.85] : t > 24.92 && t < 25.3 ? [0.6, -0.8] : [0.5, -0.1],
      hand: { R: [[0, 'sip'], [17.72, 'hold'], [DP_HIT, { h: [0.32, -0.3], pole: [1, 0.7], hand: 'grip' }], [25.8, 'hold']], L: [[0, 'down'], [DP_HIT, 'up'], [25.8, { h: [0.0, -0.12], pole: [0.5, 1], front: true, over: true }]] }, fx: t > 25.8 ? 'blush' : undefined });
    gripProp(s, s.glass, 'hero', 'R', V3(0, 0.75, 0), { behind: -0.35 }); dpDot(s, 'hero', 'R'); }
  // ---- the boss: door on "and", steps in on "boss walks in", deadpan "Guys," / pulls a book on "is" / holds it up on "library"; the tower avalanches on him
  const B = dpPath(DP_BOP, t), sag = (t >= 23.3 ? s.ts[s.tsK].userData.b.h * EZ.o3(dpE(23.3, 23.42, t)) : 0), th = dpLean(t) + (t > 23.3 && t < 23.9 ? 0.012 * Math.sin((t - 23.3) * 30) * Math.exp(-(t - 23.3) * 5) : 0);
  s.p.boss.g.scale.set(1, 1, 1);
  s.bossBook.rotation.order = 'YXZ'; s.hand.visible = false; s.handBook.visible = false; s.bossBook.visible = false;
  if (t >= 21.25 && t < DP_SINK + 0.24) { const speaking = DP_TALK.some(([a, b]) => t >= a && t < b), pulled = t >= 23.18, x = B.x, z = B.z;
    const ex = t < 22.54 ? 'bored' : t < 24.95 ? (speaking ? 'talk' : t < 23.3 ? 'skeptical' : t < 24.34 ? 'deadpan' : 'smug') : t < 25.16 ? 'worried' : 'shock';
    const R = [[0, 'down'], [23.0, { h: [0.66, 0.1], pole: [1, 0.3], hand: 'grip' }], [23.18, { h: [0.3, 0.4], pole: [1, 0.5], hand: 'grip' }], [23.36, { h: [0.12, 0.5], pole: [1, 0.5], front: true, hand: 'grip' }],
      [24.24, { h: [0.16, 0.6], pole: [1, 0.5], front: true, hand: 'grip' }], [24.36, { h: [0.6, -0.1], pole: [1, 0.7], hand: 'grip' }], [25.18, { h: [0.22, -0.9], pole: [1, 0.45], hand: 'grip' }]];
    const L = [[0, 'down'], [22.54, 'talk'], [22.86, 'hip'], [23.4, 'down'], [25.18, 'up']];
    const settle = t > 22.4 ? 0.06 * Math.sin((t - 22.4) * 14) * Math.exp(-(t - 22.4) * 7) : 0, dip = t > 24.2 && t < 24.5 ? -0.25 * Math.sin(Math.PI * dpE(24.2, 24.5, t)) : 0;
    const flinch = EZ.o3(dpE(25.16, 25.26, t)), flat = EZ.i2(dpE(DP_SINK, DP_SINK + 0.22, t));
    const fac = B.moving ? faceTo(cam, x, z, x + B.vx, z + B.vz) : dpFace(cam, x, z, [[0, 0], [22.36, [5.0, 8.4]], [22.54, [3.6, 19.5]], [22.98, [18.0, 4.6]], [23.3, [3.6, 19.5]], [24.0, 0.15], [24.94, [18.0, 4.6]], [25.16, 0]], t);
    pose(s, 'boss', t, x, z, { facing: fac, mode: B.moving ? 'walk' : 'stand', phase: B.dist / 3.4, stride: 3.4, stop: dpE(21.95, 22.4, t), expr: ex, talk: speaking ? 0.8 : 0,
      gaze: t > 24.94 && t < 25.16 ? [0.75, -0.85] : t > 25.16 ? [0, -0.3] : t > 22.98 && t < 23.25 ? [0.8, 0] : t > 23.3 && t < 24.0 ? [0.3, 0.45] : [0, 0],
      hand: { L, R }, lean: settle - 0.1 * flinch, squash: Math.max(-dip, 0.55 * flinch + 0.5 * dpE(DP_SINK, DP_SINK + 0.2, t)), noTilt: t > DP_SINK, alive: t > 24.9 ? 0 : 1 });
    s.p.boss.g.scale.set(1 + 0.25 * flat, 1 - 0.9 * flat, 1); s.p.boss.g.updateMatrixWorld(true);   // squashed flat under the avalanche (cartoon pancake), hidden by the heap
    if (pulled) { const up = EZ.o3(dpE(23.18, 23.36, t)), bb = s.bossBook.userData.b; gripProp(s, s.bossBook, 'boss', 'R', V3(0, 0, bb.d / 2 - 0.12), { behind: -(bb.h / 2 + 0.25), rx: up * Math.PI / 2, rz: t >= 24.36 ? -0.12 : 0.06, ry: Math.atan2(cam.position.x - x, cam.position.z - z) }); dpDot(s, 'boss', 'R'); } }
  if (t >= DP_POP) {   // buried: his rubber arm pops out of the top of the heap, still holding the book up; a weak little wave
    const k = EZ.back(dpE(DP_POP, DP_POP + 0.16, t)), d = Math.max(0, t - DP_POP - 0.16), hx = DP_HEAP[0] - 0.2, hz = DP_HEAP[1] + 0.5;
    s.hand.visible = true; s.handBook.visible = true; s.hand.position.set(hx, 2.4 + 4.4 * k, hz); s.hand.rotation.set(0, Math.atan2(cam.position.x - hx, cam.position.z - hz), 0);
    s.handPiv.rotation.z = 0.05 + 0.12 * Math.sin(d * 11) * Math.exp(-d * 2.5) + 0.03 * Math.sin(t * 17); s.handPiv.position.set(0, 0, 0);
    const bb = s.handBook.userData.b; s.handBook.rotation.order = 'YXZ'; s.handBook.rotation.set(Math.PI / 2 - 0.25, 0.55, -0.1); s.handBook.position.set(s.handTip[0], s.handTip[1] + bb.d / 2 - 0.2, -(bb.h / 2 + 0.06)); }
  // ---- T*: grows with the room, loses its pulled book (the books above sag), leans and avalanches; the core heap fills in under the flying books
  { const h0 = 6.0, ts = 19.0, td = 1.1, hgt = h0 + (23.6 - h0) * EZ.io(dpE(ts, ts + td, t)), K = s.tsK;
    s.ts.forEach((m, i) => { const b = m.userData.b; if (b.top > hgt + 1e-3) { m.visible = false; return; } m.visible = true;
      if (i === K) { if (t >= 23.18) { m.visible = false; return; } const out = 1.1 * EZ.o3(dpE(23.06, 23.18, t)); m.position.set(b.x - out * 0.6, b.y, b.z + out * 0.8); m.rotation.set(0, b.ry, 0); return; }
      const sg = i > K ? sag : 0, stub = b.y < 2.2, brk = stub ? 9 : 0.12 + 0.34 * (1 - b.top / 24) + 0.05 * ((i * 7919) % 97) / 97, tq = stub ? Math.min(th, 0.04) : Math.min(th, brk), P = dpTsPos(b, tq, sg);
      if (th < brk) { m.position.set(...P); m.quaternion.copy(dpTsQ(b, tq)); return; }
      // the break moment: solve the time the lean reached brk (dpLean is monotone after 25.02); then a tumbling arc onto the heap
      let lo = 25.02, hi = t; for (let q = 0; q < 18; q++) { const mid = (lo + hi) / 2; if (dpLean(mid) < brk) lo = mid; else hi = mid; }
      const r = s.tsRest[i], Pb = dpTsPos(b, brk, sg), E0 = new THREE.Euler().setFromQuaternion(dpTsQ(b, brk));
      dpFly(m, t, hi, Pb, [E0.x, E0.y, E0.z], [r.x, r.y, r.z], [r.rx, r.ry, r.rz], { up: -3, g: 190, spin: [i % 3 === 0 ? 1 : 0, i % 4 === 1 ? 0.5 : 0, i % 2 ? 1 : -1] }); });
    // the heap fills in under the falling books (whole books, bottom-up), the dark core grows with it; a dust puff on the impact
    { const c = s.core, u = EZ.o2(dpE(DP_SINK, DP_SINK + 0.3, t)), L = c.userData.cum, n = Math.floor(u * L.length); c.visible = n > 0; c.geometry.setDrawRange(0, n ? L[n - 1] : 0);
      const f = EZ.o2(dpE(DP_SINK, DP_SINK + 0.26, t)); s.coreFill.visible = f > 0.02; s.coreFill.scale.set(0.5 + 0.5 * f, Math.max(0.01, f), 0.5 + 0.5 * f); s.coreFill.position.set(DP_HEAP[0], 3.5 * f - 0.1, DP_HEAP[1]); }
    s.dust.forEach((m, i) => { const a = i * 2.39 + 0.4, k = dpE(DP_HIT + 0.02 * (i % 4), DP_HIT + 0.7, t), r = 3.2 + 2.8 * EZ.o3(k) + (i % 3) * 0.4;
      popAt(m, k > 0 && k < 1 ? 1 : 0, [DP_HEAP[0] + Math.cos(a) * r, 0.9 + (i % 4) * 0.9 + 1.6 * EZ.o3(k), DP_HEAP[1] + Math.sin(a) * r * 0.7], cam, 2.2 + 3.4 * EZ.o3(k)); m.material.opacity = 0.75 * (1 - k) * Math.min(1, k * 8); }); }
  c3Render(s.scene, cam, { bg: '#1a3a3a', bgBlur: 1.6, glow: 0.35, glowBlur: 12 });
}
for (const id of ['s08', 's09', 's10', 's11', 'g2']) { SHOT_FN[id] = (t) => dpFrame(t); SNAPS[id] = 'free'; }

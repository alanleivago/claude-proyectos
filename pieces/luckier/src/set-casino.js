// =====================================================================
//  SET casino — "your number comes up 40 times in a row; the casino bans you".
//  A glamorous casino floor at night: a roulette table (detailed wheel, printed felt layout, a tower of chips), an astonished
//  crowd in evening clothes (smooth SDF-sculpted people, meshed with the character kit's surface nets), croupier, pit boss,
//  security; banks of glowing slot machines, crystal chandeliers, patterned carpet, haze.
//  Own WebGL renderer (alpha) so the frame can get a depth-of-field composite: sharp focus band (depth mask pass) over a
//  pull-push blurred background, a blurred near foreground and 2D bokeh discs, then the core bloom.
//  Shots: t<3 hero (look frame) · t<5 top-down wheel · t<7 face close-up · else wide floor (security walks him out).
// =====================================================================
const CA_WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const CA_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const CA_NUM = 17;
const CA_TBL = { x0: -1.6, x1: 1.5, z0: -0.66, z1: 0.66, y: 0.8, r: 0.34 };
const CA_WC = [-1.06, 0.8, 0];
const CA_LAY = { x0: -0.36, cw: 0.11, z0: -0.42, rh: 0.135 };   // layout: number grid origin, column width, row height
const CA_HC = [0, 1.635, 0.012];   // crowd head centre (body frame)
let CA = null;

// ---------- small helpers
const caCol = (h) => { const c = lin(h); return [c.r, c.g, c.b]; };
const caStd = (o) => new THREE.MeshStandardMaterial(o);
function caRep(t, rx = 1, ry = 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function caEllD(x, y, z, rx, ry, rz) { const ax = x / rx, ay = y / ry, az = z / rz, k0 = Math.sqrt(ax * ax + ay * ay + az * az), bx = ax / rx, by = ay / ry, bz = az / rz, k1 = Math.sqrt(bx * bx + by * by + bz * bz); return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1; }
function caRRect(x0, x1, z0, z1, r, n = 10) {   // rounded rectangle outline in xz (angles from +x toward +z)
  const P = [];
  [[x1 - r, z1 - r], [x0 + r, z1 - r], [x0 + r, z0 + r], [x1 - r, z0 + r]].forEach(([cx, cz], q) => { for (let i = 0; i <= n; i++) { const a = (q * 90 + i / n * 90) * DEG; P.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } });
  return P;
}
function caRingGeo(r0, y0, r1, y1, seg, rs = 2) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= rs; j++) for (let i = 0; i <= seg; i++) { const u = i / seg, v = j / rs, a = u * TAU, r = lerp(r0, r1, v), y = lerp(y0, y1, v); pos.push(Math.sin(a) * r, y, Math.cos(a) * r); uv.push(u, v); }
  for (let j = 0; j < rs; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const caLathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

// ---------- code textures
function caTexWood(key, base, dark, light, w = 512, h = 512) {
  return caRep(g3Tex((x) => {
    const R = RNG('ca-wood', key); x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const y0 = R.r(0, h), a = R.r(0.04, 0.22), amp = R.r(1, 6), fr = R.r(0.004, 0.02), ph = R.r(0, TAU);
      x.strokeStyle = R.f() < 0.6 ? `rgba(${dark},${a})` : `rgba(${light},${a * 0.6})`; x.lineWidth = R.r(0.6, 3.2); x.beginPath();
      for (let X = 0; X <= w; X += 8) { const Y = y0 + Math.sin(X * fr + ph) * amp + Math.sin(X * fr * 3.1 + ph * 2) * amp * 0.3; X ? x.lineTo(X, Y) : x.moveTo(X, Y); }
      x.stroke();
    }
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${dark},${R.r(0.08, 0.3)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 7), 1); }
    const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, `rgba(${light},0.05)`); gr.addColorStop(0.5, `rgba(${dark},0.08)`); gr.addColorStop(1, `rgba(${light},0.05)`); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  }, w, h));
}
function caTexNoise(key, base, amt, w = 256, sz = 2) {
  return caRep(g3Tex((x) => { const R = RNG('ca-noise', key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let i = 0; i < w * w / 3; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(255,255,255,${R.r(0, amt)})` : `rgba(0,0,0,${R.r(0, amt)})`; x.fillRect(R.r(0, w), R.r(0, w), sz, sz); } }, w, w));
}
function caTexLayout() {
  const T = CA_TBL, L = CA_LAY, w = 2048, h = Math.round(w * (T.z1 - T.z0) / (T.x1 - T.x0)), k = w / (T.x1 - T.x0);
  const px = (X) => (X - T.x0) * k, pz = (Z) => (Z - T.z0) * k;
  const t = g3Tex((x) => {
    const R = RNG('ca-felt');
    x.fillStyle = '#145a3a'; x.fillRect(0, 0, w, h);
    const gr = x.createRadialGradient(w * 0.62, h * 0.5, 30, w * 0.62, h * 0.5, w * 0.62); gr.addColorStop(0, 'rgba(70,160,105,0.32)'); gr.addColorStop(1, 'rgba(0,25,12,0.4)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90000; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(190,255,215,${R.r(0.015, 0.05)})` : `rgba(0,0,0,${R.r(0.03, 0.08)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3.5), R.r(0.6, 1.4)); }
    const line = 'rgba(240,228,196,0.92)', lw = 4;
    x.lineJoin = 'round'; x.strokeStyle = line; x.lineWidth = lw;
    const cell = (X0, Z0, X1, Z1) => { x.strokeRect(px(X0), pz(Z0), px(X1) - px(X0), pz(Z1) - pz(Z0)); };
    const txt = (s, X, Z, size, col, rot = 0, font = 'bold') => { x.save(); x.translate(px(X), pz(Z)); x.rotate(rot); x.fillStyle = col; x.font = `${font} ${size}px Georgia, "Times New Roman", serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 0, 0); x.restore(); };
    const xe = L.x0 + 12 * L.cw, zb = L.z0 + 3 * L.rh;
    // zero
    x.beginPath(); [[L.x0, L.z0], [L.x0 - 0.08, L.z0], [L.x0 - 0.135, L.z0 + 1.5 * L.rh], [L.x0 - 0.08, zb], [L.x0, zb]].forEach(([X, Z], i) => (i ? x.lineTo(px(X), pz(Z)) : x.moveTo(px(X), pz(Z)))); x.closePath();
    x.fillStyle = '#0f6b3c'; x.fill(); x.stroke(); txt('0', L.x0 - 0.06, L.z0 + 1.5 * L.rh, 64, '#f4ead2');
    for (let c = 0; c < 12; c++) for (let r = 0; r < 3; r++) {
      const n = 3 * c + 3 - r, X0 = L.x0 + c * L.cw, Z0 = L.z0 + r * L.rh, red = CA_RED.has(n);
      x.fillStyle = red ? '#b3141f' : '#121212'; x.beginPath(); x.ellipse(px(X0 + L.cw / 2), pz(Z0 + L.rh / 2), L.cw * k * 0.36, L.rh * k * 0.36, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(240,215,150,0.55)'; x.lineWidth = 2; x.stroke(); x.strokeStyle = line; x.lineWidth = lw;
      cell(X0, Z0, X0 + L.cw, Z0 + L.rh); txt(String(n), X0 + L.cw / 2, Z0 + L.rh / 2 + 0.003, 50, '#f6efe0');
    }
    for (let r = 0; r < 3; r++) { cell(xe, L.z0 + r * L.rh, xe + 0.13, L.z0 + (r + 1) * L.rh); txt('2 to 1', xe + 0.065, L.z0 + (r + 0.5) * L.rh, 30, '#f4ead2', 0, 'italic bold'); }
    const zd = zb + 0.11, zo = zd + 0.11;
    ['1st 12', '2nd 12', '3rd 12'].forEach((s, i) => { cell(L.x0 + i * 4 * L.cw, zb, L.x0 + (i + 1) * 4 * L.cw, zd); txt(s, L.x0 + (i * 4 + 2) * L.cw, zb + 0.055, 40, '#f4ead2', 0, 'italic bold'); });
    ['1-18', 'EVEN', 'R', 'B', 'ODD', '19-36'].forEach((s, i) => {
      const X0 = L.x0 + i * 2 * L.cw; cell(X0, zd, X0 + 2 * L.cw, zo);
      if (s === 'R' || s === 'B') { x.fillStyle = s === 'R' ? '#b3141f' : '#121212'; const cx = px(X0 + L.cw), cz = pz(zd + 0.055); x.beginPath(); x.moveTo(cx - 52, cz); x.lineTo(cx, cz - 26); x.lineTo(cx + 52, cz); x.lineTo(cx, cz + 26); x.closePath(); x.fill(); x.strokeStyle = 'rgba(240,215,150,0.7)'; x.lineWidth = 2; x.stroke(); x.strokeStyle = line; x.lineWidth = lw; }
      else txt(s, X0 + L.cw, zd + 0.055, 36, '#f4ead2');
    });
    // gold emblem near the rail
    x.save(); x.globalAlpha = 0.75; txt('★  GRAND ROYAL  ★', 0.3, zo + 0.17, 46, '#d9b25f', 0, 'italic'); x.restore();
    x.strokeStyle = 'rgba(217,178,95,0.6)'; x.lineWidth = 3; x.beginPath(); x.ellipse(px(T.x0 + 0.54), pz(0), 0.5 * k, 0.5 * k, 0, 0, TAU); x.stroke();
  }, w, h);
  t.anisotropy = 8;
  return t;
}
function caTexNumbers() {   // number ring of the wheel: u = pocket angle, v = outer (0) → inner (1)
  const w = 2048, h = 128, n = 37, sw = w / n;
  const t = g3Tex((x) => {
    for (let i = -1; i <= n; i++) {
      const num = CA_WHEEL[(i + n) % n], X = (i - 0.5) * sw;
      x.fillStyle = num === 0 ? '#11803f' : CA_RED.has(num) ? '#b5121c' : '#141212'; x.fillRect(X, 0, sw + 1, h);
      x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(X, 0, sw, h * 0.18);
      x.save(); x.translate(i * sw, h * 0.52); x.scale(1, 2.2); x.fillStyle = '#f7f1e3'; x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,0.5)'; x.strokeText(String(num), 0, 0); x.fillText(String(num), 0, 0); x.restore();
      x.fillStyle = '#d8b46a'; x.fillRect(X - 1, 0, 2.5, h);
    }
  }, w, h);
  t.anisotropy = 8; return t;
}
function caTexPockets() {
  const w = 1024, h = 32, n = 37, sw = w / n;
  return g3Tex((x) => { for (let i = -1; i <= n; i++) { const num = CA_WHEEL[(i + n) % n], X = (i - 0.5) * sw; const gr = x.createLinearGradient(X, 0, X + sw, 0); const c = num === 0 ? ['#0b5e2e', '#159a4c'] : CA_RED.has(num) ? ['#7d0b12', '#c8202a'] : ['#0b0b0b', '#2a2626']; gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[0]); x.fillStyle = gr; x.fillRect(X, 0, sw + 1, h); } }, w, h);
}
const CA_CHIPC = [['#c41d27', '#ffffff'], ['#18181a', '#e9e2cf'], ['#16784a', '#ffffff'], ['#1d4ea6', '#ffffff'], ['#6b2a95', '#f3d27a'], ['#e3b23c', '#7a1a12'], ['#ece6d6', '#c41d27']];
function caTexChipSide(ci) {   // a stack side: one chip per 8 px row, edge spots at a random phase per chip
  const [c, s] = CA_CHIPC[ci], w = 256, h = 1024;
  return g3Tex((x) => {
    const R = RNG('ca-chip-side', ci); x.fillStyle = c; x.fillRect(0, 0, w, h);
    for (let r = 0; r < h / 8; r++) {
      const ph = R.r(0, w / 6), sh = R.r(-0.08, 0.08);
      x.fillStyle = sh > 0 ? `rgba(255,255,255,${sh})` : `rgba(0,0,0,${-sh})`; x.fillRect(0, r * 8, w, 8);
      x.fillStyle = s; for (let k = -1; k < 7; k++) x.fillRect(ph + k * w / 6, r * 8 + 1.4, w / 22, 5.2);
      x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, r * 8 + 7, w, 1); x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(0, r * 8, w, 0.8);
    }
  }, w, h);
}
function caTexChipTop(ci) {
  const [c, s] = CA_CHIPC[ci], w = 128;
  return g3Tex((x) => {
    x.fillStyle = c; x.fillRect(0, 0, w, w); const m = w / 2;
    x.fillStyle = s; for (let k = 0; k < 6; k++) { x.save(); x.translate(m, m); x.rotate(k * TAU / 6); x.fillRect(-5, -m, 10, 16); x.restore(); }
    x.strokeStyle = s; x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.arc(m, m, m * 0.66, 0, TAU); x.stroke(); x.setLineDash([]);
    const gr = x.createRadialGradient(m, m, 0, m, m, m * 0.56); gr.addColorStop(0, 'rgba(255,255,255,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0.12)'); x.fillStyle = gr; x.beginPath(); x.arc(m, m, m * 0.56, 0, TAU); x.fill();
    x.fillStyle = s; x.font = 'bold 22px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(['5', '100', '25', '10', '500', '1K', '1'][ci], m, m + 1);
  }, w, w);
}
function caTexCarpet() {
  const w = 1024;
  return caRep(g3Tex((x) => {
    const R = RNG('ca-carpet');
    x.fillStyle = '#4a0d16'; x.fillRect(0, 0, w, w);
    const q = w / 4;
    // diamond lattice
    x.strokeStyle = '#b8873a'; x.lineWidth = 7;
    for (let i = -4; i <= 8; i++) { x.beginPath(); x.moveTo(i * q, 0); x.lineTo(i * q + w, w); x.stroke(); x.beginPath(); x.moveTo(i * q, 0); x.lineTo(i * q - w, w); x.stroke(); }
    x.strokeStyle = '#2a0710'; x.lineWidth = 2.5;
    for (let i = -4; i <= 8; i++) { x.beginPath(); x.moveTo(i * q + 9, 0); x.lineTo(i * q + 9 + w, w); x.stroke(); x.beginPath(); x.moveTo(i * q - 9, 0); x.lineTo(i * q - 9 - w, w); x.stroke(); }
    const medal = (cx, cy, s) => {
      x.save(); x.translate(cx, cy);
      x.fillStyle = '#1d5656'; x.beginPath(); x.arc(0, 0, 46 * s, 0, TAU); x.fill();
      for (let k = 0; k < 8; k++) { x.save(); x.rotate(k * TAU / 8); x.fillStyle = k % 2 ? '#d29a3c' : '#e8bf63'; x.beginPath(); x.ellipse(0, -40 * s, 11 * s, 24 * s, 0, 0, TAU); x.fill(); x.restore(); }
      x.fillStyle = '#7a1420'; x.beginPath(); x.arc(0, 0, 22 * s, 0, TAU); x.fill(); x.fillStyle = '#e8bf63'; x.beginPath(); x.arc(0, 0, 9 * s, 0, TAU); x.fill();
      x.restore();
    };
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) { medal(i * q, j * q, 1); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {   // small fleurons inside the diamonds
      x.save(); x.translate((i + 0.5) * q, (j + 0.5) * q); x.fillStyle = '#9b2a1c';
      for (let k = 0; k < 4; k++) { x.rotate(TAU / 4); x.beginPath(); x.ellipse(0, -16, 6, 14, 0, 0, TAU); x.fill(); }
      x.fillStyle = '#d29a3c'; x.beginPath(); x.arc(0, 0, 5, 0, TAU); x.fill(); x.restore();
    }
    for (let i = 0; i < 160000; i++) { x.fillStyle = R.f() < 0.5 ? `rgba(255,220,180,${R.r(0, 0.07)})` : `rgba(0,0,0,${R.r(0, 0.16)})`; x.fillRect(R.r(0, w), R.r(0, w), 2, 2); }
  }, w, w), 1, 1);
}
function caTexCoffer() {
  const w = 256;
  return caRep(g3Tex((x) => {
    x.fillStyle = '#1a0f0b'; x.fillRect(0, 0, w, w);
    const gr = x.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w * 0.5); gr.addColorStop(0, '#5a3a22'); gr.addColorStop(1, '#22140d'); x.fillStyle = gr; x.fillRect(22, 22, w - 44, w - 44);
    x.strokeStyle = '#a8803e'; x.lineWidth = 4; x.strokeRect(22, 22, w - 44, w - 44); x.lineWidth = 1.5; x.strokeRect(32, 32, w - 64, w - 64);
  }, w, w), 1, 1);
}
function caTexWall() {
  const w = 512;
  return caRep(g3Tex((x) => {
    const R = RNG('ca-wall'); x.fillStyle = '#2a0f0c'; x.fillRect(0, 0, w, w);
    for (let i = 0; i < 300; i++) { x.strokeStyle = `rgba(0,0,0,${R.r(0.05, 0.2)})`; x.lineWidth = R.r(0.5, 2); const X = R.r(0, w); x.beginPath(); x.moveTo(X, 0); x.lineTo(X + R.n(6), w); x.stroke(); }
    x.strokeStyle = '#a8803e'; x.lineWidth = 5; x.strokeRect(40, 60, w - 80, w * 0.55); x.strokeRect(40, w * 0.72, w - 80, w * 0.22);
    x.fillStyle = 'rgba(255,200,140,0.05)'; x.fillRect(46, 66, w - 92, w * 0.55 - 12);
  }, w, w), 1, 1);
}
function caTexSlot(k) {   // a slot screen: title band, three reels, credits
  const pal = [['#ff2f5e', '#ffd34d', '#3a0618'], ['#33d6ff', '#c58bff', '#071a3a'], ['#ffb02a', '#ff4a3a', '#2e0d02'], ['#ffd34d', '#ff7a2a', '#2a1600'], ['#7cff8a', '#33d6ff', '#032a1e']][k % 5];
  const name = ['LUCKY 7', 'DIAMOND', 'JACKPOT', 'GOLD BAR', 'STAR CASH'][k % 5], w = 256, h = 384;
  return g3Tex((x) => {
    const R = RNG('ca-slot', k);
    const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, pal[2]); bg.addColorStop(0.5, '#000'); bg.addColorStop(1, pal[2]); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    const sb = x.createRadialGradient(w / 2, 50, 4, w / 2, 50, 150); sb.addColorStop(0, pal[0]); sb.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sb; x.fillRect(0, 0, w, 120);
    x.font = 'bold 44px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = '#2a0a00'; x.strokeText(name, w / 2, 56); x.fillStyle = pal[1]; x.fillText(name, w / 2, 56);
    const sym = (s, cx, cy) => {
      if (s === 0) { x.fillStyle = '#e0142c'; x.font = 'bold 54px Georgia, serif'; x.fillText('7', cx, cy + 3); }
      if (s === 1) { x.fillStyle = '#111'; x.fillRect(cx - 28, cy - 13, 56, 26); x.fillStyle = '#fff'; x.font = 'bold 18px Arial, sans-serif'; x.fillText('BAR', cx, cy + 1); }
      if (s === 2) { x.strokeStyle = '#2a7a1a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 10, cy + 6); x.quadraticCurveTo(cx, cy - 26, cx + 12, cy - 22); x.moveTo(cx + 10, cy + 6); x.lineTo(cx + 12, cy - 22); x.stroke(); x.fillStyle = '#d5102a'; x.beginPath(); x.arc(cx - 11, cy + 10, 11, 0, TAU); x.arc(cx + 11, cy + 10, 11, 0, TAU); x.fill(); }
      if (s === 3) { x.fillStyle = '#4ad4ff'; x.beginPath(); x.moveTo(cx, cy - 24); x.lineTo(cx + 20, cy); x.lineTo(cx, cy + 24); x.lineTo(cx - 20, cy); x.closePath(); x.fill(); }
      if (s === 4) { x.fillStyle = '#ffc928'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * TAU / 10 - Math.PI / 2, r = i % 2 ? 10 : 24; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); }
    };
    for (let c = 0; c < 3; c++) {
      const X = 18 + c * 76; const rg = x.createLinearGradient(0, 110, 0, 290); rg.addColorStop(0, '#8a8580'); rg.addColorStop(0.5, '#fbf8f0'); rg.addColorStop(1, '#8a8580'); x.fillStyle = rg; x.fillRect(X, 110, 68, 180);
      for (let r = 0; r < 3; r++) sym(R.i(0, 4), X + 34, 140 + r * 60);
    }
    x.strokeStyle = pal[1]; x.lineWidth = 4; x.strokeRect(14, 106, w - 28, 188);
    x.fillStyle = '#100'; x.fillRect(20, 312, w - 40, 46); x.fillStyle = '#ff3a2a'; x.font = 'bold 26px Menlo, monospace'; x.fillText(String(R.i(1000, 99999)).padStart(6, '0'), w / 2, 336);
  }, w, h);
}

// ---------- the crowd: smooth SDF people (body + head + hair + face features), static poses
const CA_ARMS = {   // left arm targets in the body frame: [elbow, wrist, hand tip | null]; the right arm mirrors x
  down: [[0.25, 1.14, 0.0], [0.26, 0.9, 0.04], null],
  cheek: [[0.27, 1.25, 0.15], [0.12, 1.5, 0.13], [0.086, 1.6, 0.1]],
  mouth: [[0.2, 1.2, 0.2], [0.05, 1.47, 0.19], [0.0, 1.56, 0.17]],
  head: [[0.35, 1.58, 0.06], [0.2, 1.79, 0.02], [0.08, 1.83, -0.01]],
  point: [[0.27, 1.25, 0.22], [0.3, 1.24, 0.47], [0.31, 1.23, 0.57]],
  rail: [[0.27, 1.08, 0.17], [0.24, 0.92, 0.35], [0.22, 0.88, 0.44]],
  glass: [[0.27, 1.12, 0.1], [0.19, 1.24, 0.26], [0.17, 1.33, 0.29]],
  ear: [[0.29, 1.31, 0.06], [0.16, 1.52, 0.03], [0.115, 1.61, 0.0]],
  chest: [[0.25, 1.15, 0.12], [0.09, 1.29, 0.17], [0.02, 1.35, 0.16]],
  open: [[0.31, 1.17, 0.1], [0.3, 1.37, 0.2], [0.29, 1.46, 0.22]],
  swingF: [[0.24, 1.13, 0.09], [0.23, 0.92, 0.2], null],
  swingB: [[0.24, 1.13, -0.07], [0.24, 0.91, -0.16], null],
  reach: [[0.28, 1.14, 0.15], [0.32, 1.07, 0.38], [0.33, 1.05, 0.46]],
  grab: [[0.31, 1.13, 0.06], [0.38, 1.13, 0.13], [0.45, 1.14, 0.16]],
  hip: [[0.36, 1.12, -0.04], [0.22, 0.99, 0.04], [0.14, 0.97, 0.08]],
  clasp: [[0.25, 1.1, 0.12], [0.05, 1.04, 0.17], [-0.03, 1.03, 0.17]],
  up: [[0.31, 1.62, 0.04], [0.32, 1.88, 0.07], null],
  wave: [[0.36, 1.5, 0.08], [0.42, 1.74, 0.1], null],
  face: [[0.22, 1.28, 0.21], [0.07, 1.53, 0.19], [0.03, 1.63, 0.14]],
  lap: [[0.24, 1.12, 0.12], [0.13, 0.99, 0.32], [0.07, 0.97, 0.4]],
  tray: [[0.24, 1.1, 0.1], [0.16, 1.12, 0.33], [0.1, 1.13, 0.4]],
  armrest: [[0.25, 1.1, 0.06], [0.27, 1.0, 0.28], null],
};
function caPerson(o) {
  const f = o.kind === 'f', lean = (o.lean ?? 0) * DEG, tw = (o.twist ?? 0) * DEG, st = o.stride ?? 0;
  const MU = new THREE.Matrix4().makeTranslation(0, o.sit ? 0.5 : 0.95, 0).multiply(new THREE.Matrix4().makeRotationX(lean)).multiply(new THREE.Matrix4().makeRotationY(tw)).multiply(new THREE.Matrix4().makeTranslation(0, -0.95, 0));
  const I4 = new THREE.Matrix4(), P = [], U = (d) => P.push(chPrim(d, MU)), L = (d) => P.push(chPrim(d, I4));
  const C = {}; Object.entries(o.c).forEach(([k, v]) => { C[k] = caCol(v); }); C.shirt = C.shirt ?? caCol('#f2efe8');
  const gown = f && !o.pants && !o.sit;
  // legs + shoes
  if (!gown) [[1, st], [-1, -st]].forEach(([s, sd]) => {
    const hip = [s * 0.095, o.sit ? 0.5 : 0.95, 0], kn = o.sit ? [s * 0.1, 0.52, 0.44] : [s * 0.1, 0.5, 0.03 + sd * 0.1], an = o.sit ? [s * 0.1, 0.1, 0.5] : [s * 0.1, 0.1, sd * 0.24];
    L({ t: 'cone', a: hip, b: kn, r1: f ? 0.075 : 0.085, r2: f ? 0.052 : 0.062, k: 0.03, tag: 'pants' }); L({ t: 'cone', a: kn, b: an, r1: f ? 0.052 : 0.062, r2: f ? 0.04 : 0.05, k: 0.02, tag: 'pants' });
    L({ t: 'ell', c: [s * 0.1, 0.045, an[2] + 0.05], r: [0.05, 0.045, 0.12], k: 0.025, tag: 'shoe' });
  });
  if (f) {
    U({ t: 'ell', c: [0, 1.06, 0], r: [0.125, 0.13, 0.095], k: 0.05, tag: 'torso' });
    U({ t: 'ell', c: [0, 1.265, 0], r: [0.148, 0.125, 0.098], k: 0.06, tag: 'torso' });
    [1, -1].forEach((s) => U({ t: 'ell', c: [s * 0.054, 1.252, 0.052], r: [0.06, 0.056, 0.054], k: 0.03, tag: 'torso' }));
    U({ t: 'ell', c: [0, 1.37, -0.012], r: [0.168, 0.055, 0.084], k: 0.05, tag: 'torso' });
    U({ t: 'cone', a: [0, 1.37, -0.006], b: [0, 1.53, 0.012], r1: 0.05, r2: 0.043, k: 0.035, tag: 'neck' });
    if (gown) { L({ t: 'ell', c: [0, 0.94, 0], r: [0.175, 0.14, 0.135], k: 0.08, tag: 'dress' }); L({ t: 'cone', a: [0, 0.95, 0], b: [0, 0.05, 0.02], r1: 0.165, r2: o.flare ?? 0.26, sc: [1, 0.82], k: 0.06, tag: 'dress' }); }
    else if (!o.sit) L({ t: 'ell', c: [0, 0.96, 0], r: [0.165, 0.13, 0.12], k: 0.06, tag: 'pants' });
  } else {
    const bw = o.big ? 1.12 : 1;
    U({ t: 'ell', c: [0, 0.98, 0], r: [0.175 * bw, 0.12, 0.12 * bw], k: 0.04, tag: 'pants' });
    U({ t: 'ell', c: [0, 1.17, 0.0], r: [0.185 * bw, 0.25, (o.belly ? 0.15 : 0.125) * bw], k: 0.06, tag: 'torso' });
    U({ t: 'ell', c: [0, 1.33, 0.005], r: [0.215 * bw, 0.12, 0.132 * bw], k: 0.06, tag: 'torso' });
    U({ t: 'ell', c: [0, 1.405, -0.012], r: [0.235 * bw, 0.06, 0.105 * bw], k: 0.05, tag: 'torso' });
    U({ t: 'cone', a: [0, 1.39, -0.006], b: [0, 1.535, 0.012], r1: 0.064, r2: 0.054, k: 0.03, tag: 'neck' });
  }
  const sh = f ? 0.165 : (o.big ? 0.225 : 0.2), shY = f ? 1.37 : 1.4, tips = {};
  [['L', 1], ['R', -1]].forEach(([k, s]) => {
    const A = CA_ARMS[o.arms[k]], m = (p) => [s * p[0], p[1], p[2]], S = [s * sh, shY, -0.012], E = m(A[0]), Wr = m(A[1]);
    let tip = A[2] && m(A[2]); if (!tip) { const d = V3(Wr[0] - E[0], Wr[1] - E[1], Wr[2] - E[2]).normalize(); tip = [Wr[0] + d.x * 0.095, Wr[1] + d.y * 0.095, Wr[2] + d.z * 0.095]; }
    U({ t: 'cone', a: S, b: E, r1: f ? 0.043 : 0.06, r2: f ? 0.035 : 0.05, k: 0.03, tag: 'sleeve' });
    U({ t: 'cone', a: E, b: Wr, r1: f ? 0.034 : 0.049, r2: f ? 0.027 : 0.038, k: 0.02, tag: 'fore' });
    U({ t: 'cone', a: Wr, b: tip, r1: f ? 0.028 : 0.034, r2: f ? 0.022 : 0.026, k: 0.018, tag: 'hand' });
    { const d = [tip[0] - Wr[0], tip[1] - Wr[1], tip[2] - Wr[2]], b0 = [Wr[0] + d[0] * 0.15, Wr[1] + d[1] * 0.15, Wr[2] + d[2] * 0.15], b1 = [Wr[0] + d[0] * 0.5 - s * 0.022, Wr[1] + d[1] * 0.5, Wr[2] + d[2] * 0.5 + 0.02]; U({ t: 'cone', a: b0, b: b1, r1: f ? 0.012 : 0.014, r2: f ? 0.009 : 0.011, k: 0.012, tag: 'hand' }); }
    tips[k] = V3(...tip).applyMatrix4(MU);
  });
  const Mi = MU.clone().invert(), q = V3(), out = o.outfit;
  const col = (x, y, z, nx, ny, nz, tag) => {
    q.set(x, y, z).applyMatrix4(Mi); const lx = q.x, ly = q.y, lz = q.z, ax = Math.abs(lx);
    if (tag === 'hand') return o.gloves ? C.gloves : C.skin;
    if (tag === 'shoe') return C.shoe;
    if (tag === 'pants') return C.pants;
    if (tag === 'dress') return o.apron ? chMix(C.dress, C.shirt, ss(0.0, 0.03, q.z) * ss(0.15, 0.12, Math.abs(q.x)) * ss(0.3, 0.36, q.y)) : C.dress;
    if (tag === 'neck') return f ? (o.highNeck ? chMix(C.skin, C.shirt, ss(1.47, 1.45, ly)) : C.skin) : out === 'jersey' ? C.skin : chMix(C.skin, C.shirt, ss(1.47, 1.455, ly) * ss(-0.06, -0.03, lz));
    if (tag === 'sleeve' || tag === 'fore') { if (f) return o.gloves && tag === 'fore' ? C.gloves : o.sleeves ? C.dress : C.skin; return out === 'vest' ? C.shirt : C.suit; }
    if (out === 'jersey') return chMix(C.suit, C.shirt, ss(0.035, 0.025, Math.abs(ly - 1.27)));
    if (f) {   // dress bodice: bare shoulders above a sweetheart neckline, thin straps (soft edges)
      const neck = 1.285 + (lz < 0 ? -0.03 : 0) - 0.02 * Math.exp(-lx * lx / 0.0012) * (lz > 0 ? 1 : 0);
      let w = o.highNeck ? 0 : ss(neck - 0.007, neck + 0.007, ly); if (o.straps) w *= ss(0.009, 0.016, Math.abs(ax - 0.09));
      let c0 = chMix(C.dress, C.skin, w);
      if (o.apron) c0 = chMix(c0, C.shirt, ss(0.0, 0.03, lz) * ss(0.08, 0.06, ax) * ss(1.3, 1.27, ly));
      return c0;
    }
    const aa = 0.0075, front = ss(0.0, 0.03, lz), vy = clamp((ly - 1.09) / (1.4 - 1.09)), half = 0.006 + 0.085 * vy;
    let c = C.suit;
    if (out !== 'vest') c = chMix(c, C.lapel ?? chMul(C.suit, 0.7), front * ss(half + 0.034 + aa, half + 0.034 - aa, ax) * ss(1.09, 1.11, ly));
    const sw = front * ss(half + aa, half - aa, ax) * ss(1.07, 1.095, ly);
    c = chMix(c, C.shirt, sw);
    if (out === 'suit') { const tw = 0.016 + 0.006 * vy; c = chMix(c, C.tie, sw * ss(tw + 0.005, tw - 0.005, ax) * ss(1.4, 1.385, ly)); }
    if (out !== 'vest') c = chMix(c, chMul(C.suit, 0.45), (1 - sw) * front * ss(0.013, 0.007, ax) * ss(0.008, 0.004, Math.abs(((ly - 0.98) % 0.055) - 0.027)) * ss(1.1, 1.08, ly));   // buttons
    return c;
  };
  const body = chSculpt(P, { h: o.res ?? 0.012, ao: [0.012, 0.55], col, uv: 0.05 });
  const root = new THREE.Group();
  const mat = caStd({ vertexColors: true, roughness: o.rough ?? 0.62, metalness: o.metal ?? 0, map: CA.tex.fab, envMapIntensity: 0.6 });
  const bm = new THREE.Mesh(body, mat); bm.castShadow = true; bm.receiveShadow = true; root.add(bm);
  // head
  const hd = caHead(o), hp = V3(...CA_HC).applyMatrix4(MU);
  hd.position.copy(hp); root.caHead = hd; hd.userData.r0 = [lean + (o.look?.[1] ?? 0) * DEG, tw + (o.look?.[0] ?? 0) * DEG, (o.tilt ?? 0) * DEG]; hd.rotation.set(lean + (o.look?.[1] ?? 0) * DEG, tw + (o.look?.[0] ?? 0) * DEG, (o.tilt ?? 0) * DEG, 'YXZ'); root.add(hd);
  // props
  if (o.prop === 'glass') { const gl = caMartini(); gl.position.copy(tips[o.propHand ?? 'R']).add(V3(0, 0.0, 0.0)); root.add(gl); }
  if (o.earpiece) { const a = hp.clone().add(V3(-0.095, -0.02, -0.0)), b = V3(-0.11, 1.42, -0.07).applyMatrix4(MU); const cv = new THREE.CatmullRomCurve3([a, a.clone().add(V3(-0.01, -0.06, -0.02)), b]); const tb = new THREE.Mesh(new THREE.TubeGeometry(cv, 16, 0.0028, 5), caStd({ color: lin('#d8d2c8'), roughness: 0.3 })); root.add(tb); }
  if (o.outfit === 'tux' || o.outfit === 'vest') {   // a satin bow tie on the collar
    const bf = body.userData.f, p0 = V3(0, 1.383, 0).applyMatrix4(MU), dz = V3(0, 0, 1).transformDirection(MU);
    for (let i = 0; i < 40 && bf(p0.x, p0.y, p0.z) < 0; i++) p0.addScaledVector(dz, 0.003);
    const bow = new THREE.Group(); bow.position.copy(p0); bow.rotation.x = lean; root.add(bow);
    [1, -1].forEach((s2) => { const w = new THREE.Mesh(CA.geo.sph, CA.mat.bow); w.scale.set(0.028, 0.017, 0.01); w.position.set(s2 * 0.024, 0, 0.004); w.rotation.z = s2 * 0.12; bow.add(w); });
    const kn = new THREE.Mesh(CA.geo.sph, CA.mat.bow); kn.scale.set(0.011, 0.012, 0.011); kn.position.z = 0.008; bow.add(kn);
  }
  root.userData.tips = tips;
  return root;
}
function caHead(o) {
  const f = o.kind === 'f', I4 = new THREE.Matrix4(), P = [], A = (d) => P.push(chPrim(d, I4)), C = {};
  Object.entries(o.c).forEach(([k, v]) => { C[k] = caCol(v); });
  A({ t: 'ell', c: [0, 0.012, -0.004], r: [f ? 0.087 : 0.092, 0.104, 0.099], k: 0, tag: 'skin' });
  A({ t: 'ell', c: [0, -0.046, 0.024], r: [f ? 0.066 : (o.big ? 0.08 : 0.074), f ? 0.062 : 0.068, 0.072], k: 0.05, tag: 'skin' });
  A({ t: 'ell', c: [0, -0.01, 0.097], r: [0.0125, 0.021, 0.016], k: 0.014, tag: 'skin' });
  [1, -1].forEach((s) => A({ t: 'ell', c: [s * 0.089, -0.008, 0.0], r: [0.013, 0.026, 0.018], k: 0.01, tag: 'skin' }));
  const g = new THREE.Group();
  const geo = chSculpt(P, { h: 0.0048, ao: [0.004, 0.35], uv: 0.04, col: (x, y, z) => { const b = chGauss(Math.abs(x), y, z, 0.05, -0.03, 0.075, 0.022); return chMix(C.skin, C.blush ?? chMix(C.skin, [0.8, 0.25, 0.2], 0.4), b * 0.6); } });
  const hm = new THREE.Mesh(geo, caStd({ vertexColors: true, roughness: 0.55, envMapIntensity: 0.5 })); hm.castShadow = true; g.add(hm);
  // hair: a cap clipped by a hairline, plus a style volume
  const hs = o.hair ?? 'short';
  if (hs !== 'bald') {
    const hl = (x, z) => { const fr = (hs === 'grey' ? 0.07 : f ? 0.04 : 0.056) + 0.03 * Math.min(1, (x / 0.075) ** 2); let y = lerp(-0.075, fr, ss(-0.07, 0.085, z)); if (Math.abs(x) > 0.065 && z > -0.03 && z < 0.05) y = Math.min(y, f ? -0.02 : -0.028); return y; };
    const thick = hs === 'buzz' ? 0.003 : hs === 'slick' ? 0.008 : 0.012;
    const capF = (x, y, z) => {
      const tt = f || hs === 'long' || hs === 'bob' ? thick : thick * 1.5, ts = f ? thick : thick * 0.45;
      let d = caEllD(x, y - 0.014 - tt * 0.6, z + 0.0, 0.093 + ts, 0.106 + tt, 0.1 + ts);
      if (hs === 'side' || hs === 'short' || hs === 'slick') d = chSmin(d, caEllD(x - 0.022, y - 0.09, z - 0.05, 0.07, hs === 'slick' ? 0.026 : 0.036, 0.05), 0.035);
      if (hs === 'side' || hs === 'slick') d = chSmax(d, -caEllD(x + 0.03, y - 0.13, z - 0.02, 0.006, 0.05, 0.09), 0.006);   // part line
      if (hs === 'bun') d = chSmin(d, caEllD(x, y - 0.08, z + 0.1, 0.048, 0.044, 0.044), 0.02);
      if (hs === 'long' || hs === 'bob') {
        const ln = hs === 'long' ? 0.17 : 0.085;
        d = chSmin(d, caEllD(x, y + ln * 0.55, z + 0.035, 0.108, ln, 0.08), 0.04);
        d = chSmax(d, -caEllD(x, y + 0.03, z - 0.09, 0.07, 0.1, 0.06), 0.02);   // clear the face
      }
      if (hs === 'long' || hs === 'bob') { const lim = hs === 'long' ? -0.26 : -0.1, w = Math.max(ss(0.055, 0.08, Math.abs(x)), ss(0.03, -0.01, z)); return chSmax(d, lerp(hl(x, z), lim, w) - y, 0.01); }
      const e = hl(x, z); return chSmax(d + thick * 0.85 * (1 - ss(0.0, 0.04, y - e)), e - y, 0.012);
    };
    const HP = [chPrim({ t: 'fn', fn: capF, bc: [0, -0.03, -0.01], br: 0.28 }, I4)];
    const hc = C.hair, hi = chMix(C.hair, [1, 0.9, 0.75], hs === 'grey' ? 0.15 : 0.22);
    const hg = chSculpt(HP, { h: 0.0048, ao: [0.004, 0.3], uv: 0.04, col: (x, y, z, nx, ny, nz) => { const a = Math.atan2(x, z); const st = 0.82 + 0.18 * Math.sin(a * 46 + y * 30); const band = Math.exp(-((ny * 0.8 + nz * 0.4 - 0.62) ** 2) / 0.02); return chMul(chMix(hc, hi, band * 0.55), st); } });
    const hmat = caStd({ vertexColors: true, roughness: 0.42, envMapIntensity: 0.7 });
    const hh = new THREE.Mesh(hg, hmat); hh.castShadow = true; g.add(hh);
  }
  caFace(g, geo.userData.f, o);
  const hat = o.hat, HM = (c, r = 0.5, m = 0) => caStd({ color: lin(c), roughness: r, metalness: m });
  if (hat === 'top' || hat === 'bowler') {
    const hc = HM('#141416', 0.35);
    const cr = new THREE.Mesh(hat === 'top' ? new THREE.CylinderGeometry(0.084, 0.09, 0.17, 28) : new THREE.SphereGeometry(0.098, 24, 12, 0, TAU, 0, Math.PI / 2), hc); cr.position.y = hat === 'top' ? 0.19 : 0.085; g.add(cr);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.008, 32), hc); br.scale.z = 0.88; br.position.y = 0.103; g.add(br);
    if (hat === 'top') { const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.091, 0.091, 0.03, 28), HM('#2a2224', 0.6)); bd.position.y = 0.125; g.add(bd); }
    g.children.slice(-3).forEach((m) => { m.rotation.x = -0.12; m.castShadow = true; });
  }
  if (hat === 'lady') {
    const br = new THREE.Mesh(CA.geo.sph, HM(o.c.hatc ?? '#2a2030', 0.6)); br.scale.set(0.24, 0.018, 0.21); br.position.set(0, 0.095, 0.01); br.rotation.set(-0.15, 0, 0.12); g.add(br);
    const cr = new THREE.Mesh(CA.geo.sph, HM(o.c.hatc ?? '#2a2030', 0.6)); cr.scale.set(0.1, 0.06, 0.1); cr.position.set(0, 0.12, 0); g.add(cr);
    const fe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(0.05, 0.13, -0.02), V3(0.14, 0.26, -0.05), V3(0.2, 0.2, -0.14)), 12, 0.012, 6), HM(o.c.feather ?? '#efe6d8', 0.8)); g.add(fe);
  }
  if (hat === 'cap') { const cp = new THREE.Mesh(CA.geo.sph, HM('#f4f1ea', 0.6)); cp.scale.set(0.08, 0.028, 0.065); cp.position.set(0, 0.112, 0.0); cp.rotation.x = -0.25; g.add(cp); }
  if (hat === 'beanie') { const bn = new THREE.Mesh(new THREE.SphereGeometry(0.104, 24, 12, 0, TAU, 0, Math.PI * 0.55), HM(o.c.hatc ?? '#2a4fd0', 0.85)); bn.position.y = 0.02; bn.rotation.x = -0.2; g.add(bn); }
  return g;
}
function caFace(g, F, o) {
  const fz = (x, y) => { let z = 0.14; for (let i = 0; i < 80 && F(x, y, z) > 0; i++) z -= 0.0015; return z; };
  const M = CA.mat, ex = o.face ?? 'o', wide = ex === 'o' || ex === 'gasp' ? 1.15 : 1;
  [1, -1].forEach((s) => {
    const x = s * 0.034, y = 0.006, z = fz(x, y);
    const sc = new THREE.Mesh(CA.geo.sph, M.sclera); sc.scale.set(0.0158, 0.0175 * wide, 0.0105); sc.position.set(x, y, z - 0.0035); g.add(sc);
    const lk = o.look2 ?? [0, 0];
    const pu = new THREE.Mesh(CA.geo.sph, M.pupil); pu.scale.set(0.0092, 0.0098, 0.005); pu.position.set(x + lk[0] * 0.005, y + lk[1] * 0.005, z + 0.0058); g.add(pu);
    const br = new THREE.Mesh(CA.geo.cap, M.brow(o.c.hair)); const by = 0.04 + (ex === 'smile' ? 0 : 0.008);
    br.scale.set(1, 1, 1); br.rotation.set(0, 0, Math.PI / 2 + s * (ex === 'smile' ? 0.05 : -0.18)); br.position.set(s * 0.036, by, fz(s * 0.036, by) + 0.0015); g.add(br);
  });
  const my = -0.058, mz = fz(0, my);
  if (ex === 'smile') { const m = new THREE.Mesh(CA.geo.smile, M.mouth); m.position.set(0, my + 0.008, mz - 0.002); m.rotation.set(-0.15, 0, Math.PI); g.add(m); }
  else if (ex === 'sad') { const m = new THREE.Mesh(CA.geo.smile, M.mouth); m.position.set(0, my - 0.012, mz - 0.002); m.rotation.set(0.1, 0, 0); g.add(m); }
  else { const m = new THREE.Mesh(CA.geo.sph, M.mouth); const w = ex === 'gasp' ? 0.02 : 0.0135, h = ex === 'gasp' ? 0.017 : ex === 'talk' ? 0.008 : 0.019; m.scale.set(w, h, 0.007); m.position.set(0, my - 0.003, mz - 0.003); g.add(m); g.caMouth = m; }
  if (o.stache) [1, -1].forEach((s) => { const st = new THREE.Mesh(CA.geo.sph, M.brow(o.c.hair)); st.scale.set(0.026, 0.008, 0.009); st.position.set(s * 0.02, -0.036, fz(s * 0.02, -0.036) - 0.001); st.rotation.z = s * 0.25; g.add(st); });
}
function caMartini() {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(caLathe([[0.0, -0.11], [0.032, -0.108], [0.004, -0.1], [0.003, -0.04], [0.006, -0.032], [0.05, 0.02], [0.052, 0.021]], 24), CA.mat.glass);
  const liq = new THREE.Mesh(caLathe([[0.0, -0.03], [0.042, 0.008], [0, 0.008]], 24), caStd({ color: lin('#f3dfa0'), roughness: 0.1, transparent: true, opacity: 0.7 }));
  const ol = new THREE.Mesh(CA.geo.sph, caStd({ color: lin('#5d7a1e'), roughness: 0.4 })); ol.scale.setScalar(0.009); ol.position.set(0.01, -0.012, 0);
  g.add(glass, liq, ol); g.position.y = 0.06;
  return g;
}

// ---------- the roulette table
function caTable() {
  const T = CA_TBL, g = new THREE.Group(), M = CA.mat;
  const pts = caRRect(T.x0, T.x1, T.z0, T.z1, T.r, 12);
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  // felt
  const fg = new THREE.ShapeGeometry(shape, 24); fg.rotateX(-Math.PI / 2);
  { const p = fg.attributes.position, uv = fg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - T.x0) / (T.x1 - T.x0), (T.z1 - p.getZ(i)) / (T.z1 - T.z0)); }
  const felt = new THREE.Mesh(fg, M.felt); felt.position.y = T.y; felt.receiveShadow = true; g.add(felt);
  // body (wood apron) and base
  const bg = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.035, bevelSegments: 4, curveSegments: 24 }); bg.rotateX(-Math.PI / 2);
  const body = new THREE.Mesh(bg, M.wood); body.position.y = T.y - 0.235; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const base = new THREE.Mesh(new THREE.BoxGeometry(T.x1 - T.x0 - 0.7, T.y - 0.25, 0.7), M.woodDark); base.position.set((T.x0 + T.x1) / 2, (T.y - 0.25) / 2, 0); g.add(base);
  // padded leather armrest + brass and wood lips
  const ring = (off, y) => new THREE.CatmullRomCurve3(caRRect(T.x0 - off, T.x1 + off, T.z0 - off, T.z1 + off, T.r + off, 14).map(([x, z]) => V3(x, y, z)), true, 'centripetal');
  const rail = new THREE.Mesh(new THREE.TubeGeometry(ring(0.035, T.y + 0.03), 360, 0.058, 14, true), M.leather); rail.scale.set(1, 1, 1); rail.castShadow = true; rail.receiveShadow = true; g.add(rail);
  const lip = new THREE.Mesh(new THREE.TubeGeometry(ring(-0.03, T.y + 0.006), 360, 0.014, 8, true), M.wood); g.add(lip);
  const brass = new THREE.Mesh(new THREE.TubeGeometry(ring(0.035, T.y - 0.035), 360, 0.008, 6, true), M.brass); g.add(brass);
  // chip rack + drink ledge are implied by the rail; the wheel
  g.add(caWheel());
  return g;
}
function caWheel() {
  const g = new THREE.Group(), M = CA.mat; g.position.set(...CA_WC);
  const bowl = new THREE.Mesh(caLathe([[0.47, -0.002], [0.475, 0.012], [0.472, 0.05], [0.462, 0.07], [0.448, 0.078], [0.432, 0.076], [0.42, 0.066], [0.413, 0.052], [0.404, 0.047], [0.37, 0.039], [0.335, 0.03], [0.322, 0.026]], 128), M.wheelWood);
  bowl.castShadow = true; bowl.receiveShadow = true; g.add(bowl);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.452, 0.0045, 8, 128), M.brass); trim.rotation.x = Math.PI / 2; trim.position.y = 0.077; g.add(trim);
  const trim2 = new THREE.Mesh(new THREE.TorusGeometry(0.408, 0.003, 6, 128), M.brass); trim2.rotation.x = Math.PI / 2; trim2.position.y = 0.05; g.add(trim2);
  for (let i = 0; i < 8; i++) {   // deflector diamonds on the ball track
    const a = (i + 0.5) / 8 * TAU, d = new THREE.Mesh(CA.geo.oct, M.chrome); d.position.set(Math.sin(a) * 0.37, 0.043, Math.cos(a) * 0.37);
    d.rotation.set(0, a + (i % 2 ? Math.PI / 2 : 0), 0); d.scale.set(0.006, 0.009, 0.02); g.add(d);
  }
  const rot = new THREE.Group(); g.add(rot);
  const nr = new THREE.Mesh(caRingGeo(0.322, 0.026, 0.274, 0.018, 37 * 6, 1), M.numbers); nr.receiveShadow = true; rot.add(nr);
  const pk = new THREE.Mesh(caRingGeo(0.274, 0.006, 0.206, 0.012, 37 * 4, 1), M.pockets); pk.receiveShadow = true; rot.add(pk);
  const fr = new THREE.InstancedMesh(CA.geo.box, M.chrome, 37), m4 = new THREE.Matrix4();
  for (let i = 0; i < 37; i++) { const a = (i + 0.5) / 37 * TAU; m4.compose(V3(Math.sin(a) * 0.24, 0.016, Math.cos(a) * 0.24), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)), V3(0.0028, 0.018, 0.07)); fr.setMatrixAt(i, m4); }
  rot.add(fr);
  const cone = new THREE.Mesh(caLathe([[0.207, 0.012], [0.205, 0.026], [0.185, 0.034], [0.14, 0.048], [0.09, 0.062], [0.062, 0.068]], 96), M.wheelWood2); cone.castShadow = true; cone.receiveShadow = true; rot.add(cone);
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.206, 0.004, 6, 96), M.chrome); cr.rotation.x = Math.PI / 2; cr.position.y = 0.026; rot.add(cr);
  const tur = new THREE.Mesh(caLathe([[0.062, 0.066], [0.05, 0.074], [0.026, 0.08], [0.013, 0.09], [0.0095, 0.1], [0.0095, 0.128], [0.017, 0.134], [0.011, 0.144], [0.0001, 0.152]], 48), M.chrome); tur.castShadow = true; rot.add(tur);
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * TAU, arm = new THREE.Mesh(CA.geo.cyl, M.chrome); arm.scale.set(0.0042, 0.075, 0.0042); arm.position.set(Math.sin(a) * 0.04, 0.118, Math.cos(a) * 0.04); arm.rotation.set(Math.PI / 2, a, 0, 'YXZ'); rot.add(arm);
    const b = new THREE.Mesh(CA.geo.sph, M.chrome); b.scale.setScalar(0.0085); b.position.set(Math.sin(a) * 0.078, 0.118, Math.cos(a) * 0.078); rot.add(b);
  }
  const k = CA_WHEEL.indexOf(CA_NUM), ka = k / 37 * TAU;
  const ball = new THREE.Mesh(CA.geo.sph, M.ball); ball.scale.setScalar(0.0118); ball.position.set(Math.sin(ka) * 0.236, 0.0205, Math.cos(ka) * 0.236); ball.castShadow = true; rot.add(ball);
  const gl = new THREE.Sprite(M.glint); gl.scale.set(0.15, 0.15, 1); gl.position.copy(ball.position).add(V3(0, 0.012, 0)); rot.add(gl); CA.noMask.push(gl);
  CA.rotor = rot; CA.ballA = ka; CA.ball = ball; CA.glint = gl;
  return g;
}
function caStack(n, ci, key) {   // a chip stack: one textured cylinder (a chip per texture row) with a slight organic wobble
  const R = RNG('ca-stack', key), h = 0.0034, rr = 0.0195, segH = Math.max(1, Math.round(n / 3));
  const geo = new THREE.CylinderGeometry(rr, rr, n * h, 28, segH, false);
  const p = geo.attributes.position, uv = geo.attributes.uv, v0 = R.r(0, 0.5), wob = [];
  for (let j = 0; j <= segH; j++) wob.push([R.n(0.0007), R.n(0.0007)]);
  let acc = [0, 0]; const off = wob.map(([a, b]) => { acc = [acc[0] + a * 0.5, acc[1] + b * 0.5]; return [...acc]; });
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), j = Math.round((y / (n * h) + 0.5) * segH); const o = off[clamp(j, 0, segH)];
    p.setX(i, p.getX(i) + o[0]); p.setZ(i, p.getZ(i) + o[1]);
  }
  // side uv: v spans n chips of the 128-chip texture
  const ng = geo.groups[0]; for (let i = ng.start; i < ng.start + ng.count; i++) { const vi = geo.index.getX(i); uv.setY(vi, v0 + (p.getY(vi) / (n * h) + 0.5) * n / 128); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, [CA.mat.chipSide[ci], CA.mat.chipTop[ci], CA.mat.chipTop[ci]]); m.castShadow = true; m.receiveShadow = true;
  m.position.y = n * h / 2; m.userData.top = off[segH];
  return m;
}
function caChips() {
  const g = new THREE.Group(), R = RNG('ca-tower'), T = CA_TBL;
  const cx = 0.1, cz = -0.34, cols = [4, 1, 4, 5, 1, 0, 3, 4, 2, 6];
  for (let i = -5; i <= 5; i++) for (let j = -3; j <= 3; j++) {
    const x = cx + i * 0.0405 + (j % 2 ? 0.02 : 0), z = cz + j * 0.037, d = Math.hypot((x - cx) / 0.21, (z - cz) / 0.125);
    if (d > 1.05 + R.n(0.08)) continue;
    const n = Math.max(10, Math.round((1 - d * d * 0.72) * 175 + R.n(22)));
    const s = caStack(n, R.pick(cols), `${i},${j}`); s.position.x = x + R.n(0.002); s.position.z = z + R.n(0.002); s.position.y += T.y; s.rotation.y = R.r(0, TAU); g.add(s);
  }
  // a few loose stacks + the winning bet on 17 with the dolly
  const L = CA_LAY, c17 = [L.x0 + 5.5 * L.cw, L.z0 + 1.5 * L.rh];
  [[0.35, -0.5, 22, 4], [0.38, -0.46, 14, 5], [0.86, -0.5, 30, 1], [0.9, -0.45, 18, 4], [0.33, -0.25, 9, 0], [0.92, -0.28, 12, 3]].forEach(([x, z, n, ci], i) => { const s = caStack(n, ci, 'l' + i); s.position.set(x, s.position.y + T.y, z); g.add(s); });
  [[c17[0] - 0.012, c17[1] + 0.006, 12, 4], [c17[0] + 0.016, c17[1] - 0.01, 7, 0]].forEach(([x, z, n, ci], i) => { const s = caStack(n, ci, 'b' + i); s.position.set(x, s.position.y + T.y, z); g.add(s); });
  const dolly = new THREE.Group(); dolly.position.set(c17[0] + 0.03, T.y, c17[1] + 0.035);
  const dg = new THREE.Mesh(caLathe([[0.0, 0], [0.016, 0], [0.017, 0.004], [0.011, 0.012], [0.009, 0.045], [0.013, 0.05], [0.0, 0.054]], 24), CA.mat.crystal); dolly.add(dg);
  const dc = new THREE.Mesh(CA.geo.sph, CA.mat.gold); dc.scale.setScalar(0.009); dc.position.y = 0.058; dolly.add(dc); g.add(dolly);
  // high-value plaques, stacked loosely in front of the tower
  { const sh = new THREE.Shape(); const w = 0.042, d = 0.028, r = 0.008; sh.moveTo(-w + r, -d); sh.lineTo(w - r, -d); sh.quadraticCurveTo(w, -d, w, -d + r); sh.lineTo(w, d - r); sh.quadraticCurveTo(w, d, w - r, d); sh.lineTo(-w + r, d); sh.quadraticCurveTo(-w, d, -w, d - r); sh.lineTo(-w, -d + r); sh.quadraticCurveTo(-w, -d, -w + r, -d);
    const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 1, curveSegments: 4 }); pg.rotateX(-Math.PI / 2);
    [[cx - 0.06, cz + 0.2, 7, 0.3, 0], [cx + 0.07, cz + 0.21, 5, -0.25, 1], [cx + 0.2, cz + 0.16, 4, 0.6, 0]].forEach(([x, z, n, ry, k]) => { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(pg, k ? CA.mat.plaqueG : CA.mat.plaque); m.position.set(x + R.n(0.003), T.y + i * 0.0058, z + R.n(0.003)); m.rotation.y = ry + R.n(0.12); m.castShadow = true; g.add(m); } }); }
  // scattered single chips lying flat
  for (let i = 0; i < 14; i++) { const s = caStack(1, R.i(0, 6), 's' + i); s.position.set(cx + R.n(0.32), T.y + 0.0017, cz + 0.12 + R.r(0, 0.2)); s.rotation.set(R.n(0.05), R.r(0, TAU), R.n(0.05)); g.add(s); }
  return g;
}
function caLamp() {   // the long brass-trimmed lamp over the table
  const g = new THREE.Group(), M = CA.mat; g.position.set(-0.05, 2.75, 0);
  const sh = new THREE.Shape([[-0.13, 0.15], [0.13, 0.15], [0.27, 0], [-0.27, 0]].map(([a, b]) => new THREE.Vector2(a, b)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.3, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 }); geo.translate(0, 0, -1.15); geo.rotateY(Math.PI / 2);
  const shade = new THREE.Mesh(geo, M.lampShade); g.add(shade);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 0.5), M.lampGlow); under.rotation.x = Math.PI / 2; under.position.y = -0.006; g.add(under);
  [-0.9, 0.9].forEach((x) => { const rod = new THREE.Mesh(CA.geo.cyl, M.brass); rod.scale.set(0.008, 3, 0.008); rod.position.set(x, 1.6, 0); g.add(rod); });
  const tb = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.018, 0.02), M.brass); tb.position.set(0, 0.006, 0.27); g.add(tb); const tb2 = tb.clone(); tb2.position.z = -0.27; g.add(tb2);
  return g;
}
// ---------- chandeliers, slots, room
function caChandelier(key) {
  const g = new THREE.Group(), M = CA.mat, R = RNG('ca-chand', key), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const stem = new THREE.Mesh(CA.geo.cyl, M.brass); stem.scale.set(0.02, 2.4, 0.02); stem.position.y = 1.2; g.add(stem);
  const bowl = new THREE.Mesh(caLathe([[0, -0.32], [0.07, -0.3], [0.16, -0.18], [0.2, -0.06], [0.16, 0.0], [0.04, 0.05], [0.02, 0.2]], 32), M.brass); g.add(bowl);
  const bulbs = [], drops = [];
  [[0.62, -0.05, 10], [0.4, 0.28, 8], [0.2, 0.55, 6]].forEach(([r, y, n], ti) => {
    const ringT = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 64), M.brass); ringT.rotation.x = Math.PI / 2; ringT.position.y = y - 0.04; g.add(ringT);
    for (let i = 0; i < n; i++) {
      const a = (i + ti * 0.5) / n * TAU, x = Math.sin(a) * r, z = Math.cos(a) * r;
      const arm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(0, y - 0.18, 0), V3(x * 0.6, y - 0.2, z * 0.6), V3(x, y, z)), 10, 0.009, 6), M.brass); g.add(arm);
      const cup = new THREE.Mesh(CA.geo.cyl, M.brass); cup.scale.set(0.03, 0.02, 0.03); cup.position.set(x, y + 0.01, z); g.add(cup);
      const cnd = new THREE.Mesh(CA.geo.cyl, M.candle); cnd.scale.set(0.014, 0.09, 0.014); cnd.position.set(x, y + 0.065, z); g.add(cnd);
      bulbs.push([x, y + 0.13, z]);
      for (let k = 1; k <= 5; k++) drops.push([x, y - 0.02 - k * 0.045, z, k === 5 ? 1.8 : 1]);
      // festoon to the next arm
      const a2 = (i + 1 + ti * 0.5) / n * TAU, x2 = Math.sin(a2) * r, z2 = Math.cos(a2) * r;
      for (let k = 1; k < 9; k++) { const u = k / 9; drops.push([lerp(x, x2, u) * 1.02, y - 0.02 - Math.sin(u * Math.PI) * 0.13, lerp(z, z2, u) * 1.02, 0.7]); }
    }
  });
  for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; drops.push([Math.sin(a) * 0.17, -0.2 - (k % 2) * 0.04, Math.cos(a) * 0.17, 1]); }
  for (let k = 0; k < 12; k++) drops.push([0, -0.34 - k * 0.04, 0, 1 + k * 0.08]);
  const cr = new THREE.InstancedMesh(CA.geo.oct, M.crystal, drops.length);
  drops.forEach(([x, y, z, s], i) => { q.setFromEuler(new THREE.Euler(0, R.r(0, TAU), 0)); m4.compose(V3(x, y, z), q, V3(0.012 * s, 0.022 * s, 0.012 * s)); cr.setMatrixAt(i, m4); });
  g.add(cr);
  const bl = new THREE.InstancedMesh(CA.geo.sph, M.bulb, bulbs.length);
  bulbs.forEach(([x, y, z], i) => { m4.compose(V3(x, y, z), q.identity(), V3(0.016, 0.026, 0.016)); bl.setMatrixAt(i, m4); });
  g.add(bl);
  const glow = new THREE.Sprite(M.glowWarm); glow.scale.set(2.6, 2.0, 1); glow.position.y = 0.15; g.add(glow); CA.noMask.push(glow);
  g.userData.bulbs = bulbs;
  return g;
}
function caSlotProto() {   // shared cabinet geometry
  const prof = [[-0.32, 0], [0.3, 0], [0.3, 0.72], [0.4, 0.78], [0.4, 0.82], [0.17, 0.86], [0.11, 1.46], [0.15, 1.5], [0.15, 1.88], [0.1, 1.95], [-0.32, 1.95]];
  const sh = new THREE.Shape(prof.map(([s, y]) => new THREE.Vector2(s, y)));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  geo.rotateY(-Math.PI / 2); geo.translate(0.3, 0, 0);
  return { cab: geo, screen: new THREE.PlaneGeometry(0.5, 0.6), top: new THREE.PlaneGeometry(0.54, 0.34), strip: new THREE.BoxGeometry(0.018, 1.1, 0.018), crown: new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32, 1, false, -Math.PI / 2, Math.PI) };
}
function caSlot(k, P) {
  const g = new THREE.Group(), M = CA.mat;
  const cab = new THREE.Mesh(P.cab, M.cabinet[k % 3]); cab.castShadow = false; cab.receiveShadow = true; g.add(cab);
  const sc = new THREE.Mesh(P.screen, M.slot[k % 5]); sc.position.set(0, 1.16, 0.176); sc.rotation.x = -0.1; g.add(sc);
  const tp = new THREE.Mesh(P.top, M.slotTop[k % 5]); tp.position.set(0, 1.71, 0.182); g.add(tp);
  const cw = new THREE.Mesh(P.crown, M.crown[k % 5]); cw.rotation.set(-Math.PI / 2, 0, 0); cw.scale.set(1, 1, 0.5); cw.position.set(0, 1.95, -0.08); g.add(cw);
  [-0.3, 0.3].forEach((x) => { const s = new THREE.Mesh(P.strip, M.led[k % 5]); s.position.set(x, 1.38, 0.13); s.rotation.x = -0.05; g.add(s); });
  const deck = new THREE.Mesh(CA.geo.box, M.led[(k + 2) % 5]); deck.scale.set(0.45, 0.012, 0.05); deck.position.set(0, 0.81, 0.32); g.add(deck);
  return g;
}
function caStool() {
  const g = new THREE.Group(), M = CA.mat;
  const seat = new THREE.Mesh(caLathe([[0, 0.66], [0.19, 0.66], [0.205, 0.69], [0.19, 0.74], [0.12, 0.755], [0, 0.757]], 28), M.stoolSeat); g.add(seat);
  const pole = new THREE.Mesh(CA.geo.cyl, M.chrome); pole.scale.set(0.025, 0.66, 0.025); pole.position.y = 0.33; g.add(pole);
  const base = new THREE.Mesh(caLathe([[0, 0], [0.2, 0], [0.19, 0.02], [0.03, 0.05], [0, 0.05]], 28), M.chrome); g.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 6, 32), M.chrome); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3; g.add(ring);
  return g;
}
function caEnv(r) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(30, 12, 30), new THREE.MeshBasicMaterial({ color: lin('#1c100b'), side: THREE.BackSide })));
  const pan = (col, k, x, y, z, w, h, rx = 0, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
  pan('#ffd9a8', 6, 0, 2.3, 0, 2.3, 0.5, Math.PI / 2);   // the table lamp
  for (let i = 0; i < 6; i++) pan('#ffcf90', 3.5, -6 + i * 2.4, 4.5, -3 + (i % 2) * 4, 0.6, 0.6, Math.PI / 2);
  pan('#ff3a7a', 0.45, -5, 1.4, -9, 4, 1.2); pan('#3ad0ff', 0.45, 4, 1.4, -9, 4, 1.2); pan('#ffb02a', 0.8, 0, 1.6, -10, 4, 1.4); pan('#c060ff', 0.3, -10, 1.5, 0, 4, 1.2, 0, Math.PI / 2); pan('#ffd27a', 0.6, 10, 2, 2, 4, 2, 0, Math.PI / 2);
  pan('#5a1a10', 1, 0, 0.05, 0, 30, 30, Math.PI / 2);
  const pm = new THREE.PMREMGenerator(r); const rt = pm.fromScene(s, 0.03); pm.dispose();
  return rt.texture;
}
function caMats() {
  const t = CA.tex, M = {};
  M.felt = new THREE.MeshPhysicalMaterial({ map: t.layout, roughness: 0.93, sheen: 0.7, sheenRoughness: 0.45, sheenColor: lin('#5fbf8a'), envMapIntensity: 0.35 });
  M.wood = new THREE.MeshPhysicalMaterial({ map: t.wood, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 0.9 });
  M.woodDark = caStd({ color: lin('#1a0b07'), roughness: 0.6 });
  M.wheelWood = new THREE.MeshPhysicalMaterial({ map: t.woodWheel, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.1, envMapIntensity: 0.65 });
  M.wheelWood2 = new THREE.MeshPhysicalMaterial({ map: t.woodWheel2, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.1, envMapIntensity: 0.65 });
  M.leather = new THREE.MeshPhysicalMaterial({ color: lin('#4a1210'), map: t.leather, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.7 });
  M.brass = caStd({ color: lin('#d8ae62'), metalness: 1, roughness: 0.26 });
  M.gold = caStd({ color: lin('#f0c45a'), metalness: 1, roughness: 0.18 });
  M.chrome = caStd({ color: lin('#f4f4f4'), metalness: 1, roughness: 0.07 });
  M.ball = caStd({ color: lin('#fbfaf6'), roughness: 0.12, emissive: lin('#6a6660') });
  M.numbers = caStd({ map: t.numbers, roughness: 0.42, side: THREE.DoubleSide, envMapIntensity: 0.35 });
  M.pockets = caStd({ map: t.pockets, roughness: 0.45, side: THREE.DoubleSide });
  M.chipSide = CA_CHIPC.map((c, i) => caStd({ map: t.chipSide[i], roughness: 0.38, envMapIntensity: 0.6 }));
  M.chipTop = CA_CHIPC.map((c, i) => caStd({ map: t.chipTop[i], roughness: 0.32, envMapIntensity: 0.6 }));
  M.crystal = caStd({ color: lin('#fff8ec'), metalness: 1, roughness: 0.02, emissive: lin('#ffd9a0'), emissiveIntensity: 0.35, flatShading: true });
  M.bulb = new THREE.MeshBasicMaterial({ color: lin('#fff1d0').multiplyScalar(3) });
  M.candle = caStd({ color: lin('#f3ead8'), roughness: 0.5, emissive: lin('#3a2a18') });
  M.glowWarm = new THREE.SpriteMaterial({ map: t.glow, color: lin('#ffb46a'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 });
  M.glint = new THREE.SpriteMaterial({ map: t.glint, color: lin('#ffffff').multiplyScalar(1.8), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0.9 });
  M.glowSmall = new THREE.SpriteMaterial({ map: t.glow, color: lin('#ffc888'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 });
  M.lampShade = caStd({ color: lin('#1d3a2c'), roughness: 0.35, metalness: 0.3, envMapIntensity: 1.2 });
  M.lampGlow = new THREE.MeshBasicMaterial({ color: lin('#fff0d8').multiplyScalar(2.2), side: THREE.DoubleSide });
  M.carpet = caStd({ map: t.carpet, color: lin('#a88a7c'), roughness: 1, envMapIntensity: 0.2 });
  M.ceiling = caStd({ map: t.coffer, roughness: 0.8, envMapIntensity: 0.3 });
  M.wall = caStd({ map: t.wall, roughness: 0.6, envMapIntensity: 0.4 });
  M.column = new THREE.MeshPhysicalMaterial({ map: t.marble, roughness: 0.22, clearcoat: 0.5, envMapIntensity: 0.6 });
  M.cabinet = ['#1a0f18', '#0e1424', '#22120a'].map((c) => caStd({ color: lin(c), metalness: 0.6, roughness: 0.28 }));
  const pal = ['#ff2f5e', '#33d6ff', '#ffb02a', '#ffd34d', '#7cff8a'];
  M.slot = t.slot.map((s) => new THREE.MeshBasicMaterial({ map: s, color: lin('#ffffff').multiplyScalar(1.8) }));
  M.slotTop = t.slotTop.map((s) => new THREE.MeshBasicMaterial({ map: s, color: lin('#ffffff').multiplyScalar(2.2) }));
  M.crown = pal.map((c) => new THREE.MeshBasicMaterial({ color: lin(c).multiplyScalar(1.4) }));
  M.led = pal.map((c) => new THREE.MeshBasicMaterial({ color: lin(c).multiplyScalar(2.2) }));
  M.stoolSeat = new THREE.MeshPhysicalMaterial({ color: lin('#7a0f18'), roughness: 0.35, clearcoat: 0.5 });
  M.plaque = caStd({ color: lin('#f1ece0'), roughness: 0.18, metalness: 0.05, emissive: lin('#1a1814') });
  M.plaqueG = caStd({ color: lin('#e8c068'), roughness: 0.2, metalness: 0.6 });
  M.champ = caStd({ color: lin('#f0d27a'), roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.8, emissive: lin('#3a2a08') });
  M.slotWin = new THREE.MeshBasicMaterial({ map: t.slotWin, color: lin('#ffffff').multiplyScalar(2.2) });
  M.bow = caStd({ color: lin('#0d0d10'), roughness: 0.28, metalness: 0.1 });
  M.sclera = caStd({ color: lin('#f3eee6'), roughness: 0.2 });
  M.pupil = caStd({ color: lin('#1c120c'), roughness: 0.1 });
  M.mouth = caStd({ color: lin('#4a1814'), roughness: 0.6 });
  const brows = {}; M.brow = (h) => brows[h] ?? (brows[h] = caStd({ color: lin(h).multiplyScalar(0.8), roughness: 0.8 }));
  M.glass = caStd({ color: lin('#dfe8ee'), metalness: 0.2, roughness: 0.04, transparent: true, opacity: 0.32, envMapIntensity: 2 });
  M.sconce = new THREE.MeshBasicMaterial({ color: lin('#ffd9a0').multiplyScalar(1.3) });
  M.downlight = new THREE.MeshBasicMaterial({ color: lin('#fff0d0').multiplyScalar(2.5) });
  M.sign = new THREE.MeshBasicMaterial({ map: t.sign, color: lin('#ffffff').multiplyScalar(1.4), transparent: true });
  return M;
}
function caTexSign() {
  const w = 1024, h = 160;
  return g3Tex((x) => {
    x.fillStyle = '#120404'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#d9b25f'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
    for (let i = 0; i < 46; i++) { x.fillStyle = i % 2 ? '#ffd27a' : '#ff9a3a'; x.beginPath(); x.arc(30 + i * 21.6, 22, 5, 0, TAU); x.arc(30 + i * 21.6, h - 22, 5, 0, TAU); x.fill(); }
    x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffd27a'; x.fillText('★  MEGA JACKPOT  ★', w / 2, 52);
    x.font = 'bold 54px Menlo, monospace'; x.fillStyle = '#ff2a1a'; x.fillText('$ 4,812,377.21', w / 2, 106);
  }, w, h);
}
function caTexMarble() {
  const w = 256;
  return caRep(g3Tex((x) => { const R = RNG('ca-marble'); x.fillStyle = '#e9dccb'; x.fillRect(0, 0, w, w); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(120,90,70,${R.r(0.05, 0.25)})`; x.lineWidth = R.r(0.5, 2.5); x.beginPath(); let X = R.r(0, w), Y = 0; x.moveTo(X, Y); while (Y < w) { X += R.n(12); Y += R.r(6, 16); x.lineTo(X, Y); } x.stroke(); } }, w, w), 2, 3);
}

// ---------- build
function caBuild() {
  if (CA) return CA;
  CA = { tex: {}, geo: {}, noMask: [], bokeh: [], people: {} };
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  CA.R = { cv, r };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, x: c.getContext('2d') }; };
  CA.c2 = { sharp: mk(W, H), mask: mk(W, H), near: mk(W, H), b4: mk(W / 4, H / 4), b8: mk(W / 8, H / 8), b16: mk(W / 16, H / 16), nb: mk(W / 4, H / 4) };
  const T = CA.tex;
  T.layout = caTexLayout(); T.numbers = caTexNumbers(); T.pockets = caTexPockets();
  T.wood = caTexWood('rail', '#5a1d10', '30,8,4', '170,80,40'); T.wood.repeat.set(3, 3);
  T.woodWheel = caTexWood('wheel', '#6a2614', '30,8,4', '190,100,50'); T.woodWheel.repeat.set(6, 1);
  T.woodWheel2 = caTexWood('rotor', '#8a4a22', '40,15,5', '220,150,80'); T.woodWheel2.repeat.set(4, 1);
  T.leather = caTexNoise('leather', '#ffffff', 0.12, 256, 2); T.leather.repeat.set(40, 2);
  T.fab = caTexNoise('fab', '#f2f2f2', 0.1, 128, 1);
  T.chipSide = CA_CHIPC.map((c, i) => caRep(caTexChipSide(i)));
  T.chipTop = CA_CHIPC.map((c, i) => caTexChipTop(i));
  T.carpet = caTexCarpet(); T.carpet.repeat.set(22, 22);
  T.coffer = caTexCoffer(); T.coffer.repeat.set(12, 10);
  T.wall = caTexWall(); T.wall.repeat.set(12, 1);
  T.marble = caTexMarble();
  T.glow = g3Radial([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,0.45)'], [0.5, 'rgba(255,255,255,0.1)'], [1, 'rgba(255,255,255,0)']], 128);
  T.glint = g3Tex((x, w) => { const m = w / 2; const gr = x.createRadialGradient(m, m, 0, m, m, m * 0.35); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); x.globalCompositeOperation = 'lighter'; [[1, 0.06], [0.55, 0.035]].forEach(([l, th], k) => { x.save(); x.translate(m, m); x.rotate(k * Math.PI / 4); for (let i = 0; i < 2; i++) { x.rotate(Math.PI / 2 * i); const g2 = x.createLinearGradient(-m * l, 0, m * l, 0); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.fillRect(-m * l, -w * th / 2, 2 * m * l, w * th); } x.restore(); }); }, 128, 128);
  T.slot = [0, 1, 2, 3, 4].map((k) => caTexSlot(k));
  T.slotTop = [0, 1, 2, 3, 4].map((k) => g3Tex((x, w, h) => { const pal = ['#ff2f5e', '#33d6ff', '#ffb02a', '#ffd34d', '#7cff8a'][k]; const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#000'); gr.addColorStop(0.5, pal); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.font = 'bold 54px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 8; x.strokeStyle = '#1a0500'; x.strokeText(['7 7 7', '◆ ◆ ◆', '$ $ $', 'BAR', '★ ★ ★'][k], w / 2, h / 2); x.fillStyle = '#fff6d8'; x.fillText(['7 7 7', '◆ ◆ ◆', '$ $ $', 'BAR', '★ ★ ★'][k], w / 2, h / 2); }, 256, 160));
  T.sign = caTexSign();
  T.slotWin = g3Tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.7); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(0.4, '#ff8a1a'); gr.addColorStop(1, '#3a0610'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 92px Georgia, serif'; x.lineWidth = 10; x.strokeStyle = '#5a0a00'; x.strokeText('WIN!', w / 2, h * 0.32); x.fillStyle = '#fffbe8'; x.fillText('WIN!', w / 2, h * 0.32); x.font = 'bold 64px Georgia, serif'; x.fillStyle = '#e0142c'; x.strokeText('7 7 7', w / 2, h * 0.62); x.fillText('7 7 7', w / 2, h * 0.62); x.font = 'bold 28px Menlo, monospace'; x.fillStyle = '#fff'; x.fillText('$ 2,500', w / 2, h * 0.86); }, 256, 384);
  CA.geo = { sph: new THREE.SphereGeometry(1, 20, 14), oct: new THREE.OctahedronGeometry(1, 0), box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 16), cap: new THREE.CapsuleGeometry(0.0034, 0.022, 3, 8), smile: new THREE.TorusGeometry(0.016, 0.0035, 6, 16, Math.PI) };
  CA.mat = caMats();
  const M = CA.mat, scene = new THREE.Scene(); CA.scene = scene;
  scene.environment = caEnv(r);
  scene.fog = new THREE.FogExp2(lin('#1c100c'), 0.032);
  // room
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M.carpet); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 26), M.ceiling); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 5.4, -3); scene.add(ceil);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 5.4), M.wall); wall.position.set(0, 2.7, -13); scene.add(wall);
  [-12, 12].forEach((x) => { const w2 = wall.clone(); w2.position.set(x, 2.7, -1); w2.rotation.y = -Math.sign(x) * Math.PI / 2; scene.add(w2); });
  // downlights in the ceiling
  { const R = RNG('ca-down'), dl = []; for (let i = -5; i <= 5; i++) for (let j = 0; j < 7; j++) dl.push([i * 2.2 + (j % 2) * 1.1, 5.39, 3 - j * 2.2]);
    const im = new THREE.InstancedMesh(new THREE.CircleGeometry(0.07, 16), M.downlight, dl.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    dl.forEach(([x, y, z], i) => { m4.compose(V3(x, y, z), q, V3(1, 1, 1)); im.setMatrixAt(i, m4); CA.bokeh.push([x, y - 0.02, z, '#ffe2b8', 0.5]); }); scene.add(im); }
  // columns
  [[-3.6, -3.4], [3.9, -3.2], [-4.2, -9.2], [4.5, -9.0]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 5.4, 40), M.column); c.position.set(x, 2.7, z); c.receiveShadow = true; scene.add(c);
    [0.15, 5.1].forEach((y) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.46, 0.3, 40), M.brass); b.position.set(x, y, z); scene.add(b); });
    [2.4].forEach((y) => { const sc = new THREE.Mesh(CA.geo.sph, M.sconce); sc.scale.set(0.09, 0.14, 0.09); sc.position.set(x, y, z + 0.4); scene.add(sc); const gl = new THREE.Sprite(M.glowSmall); gl.scale.set(1.1, 1.1, 1); gl.position.set(x, y, z + 0.45); scene.add(gl); CA.noMask.push(gl); CA.bokeh.push([x, y, z + 0.42, '#ffc888', 1.2]); });
  });
  // jackpot sign
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.66), M.sign); sign.position.set(0.6, 2.9, -11.0); scene.add(sign); CA.modern = [sign]; CA.stools = [];
  // slot banks
  const SP = caSlotProto(), st = caStool();
  const slots = [];
  const bank = (x0, z, n, ry, k0) => { for (let i = 0; i < n; i++) { const s = caSlot(k0 + i, SP), dx = (i - (n - 1) / 2) * 0.66; s.position.set(x0 + Math.cos(ry) * dx, 0, z - Math.sin(ry) * dx); s.rotation.y = ry; scene.add(s); slots.push(s); CA.modern.push(s); const sl = st.clone(); sl.position.set(s.position.x + Math.sin(ry) * 0.75, 0, s.position.z + Math.cos(ry) * 0.75); scene.add(sl); CA.modern.push(sl); CA.stools.push(sl); CA.bokeh.push([s.position.x - Math.sin(ry) * 0.08, 1.95, s.position.z + Math.cos(ry) * 0.0, ['#ff2f5e', '#33d6ff', '#ffb02a', '#ffd34d', '#7cff8a'][(k0 + i) % 5], 1.0]); } };
  bank(-4.6, -6.4, 6, 0, 0); bank(4.4, -6.4, 6, 0, 3); bank(-0.2, -9.6, 9, 0, 1); bank(-8.2, -2.5, 6, Math.PI / 2, 2); bank(8.4, -2.0, 6, -Math.PI / 2, 4); CA.slots = slots;
  // chandeliers
  const ch0 = caChandelier('a');
  [[1.1, 3.25, -6.2], [3.0, 3.8, -4.4], [-5.2, 3.9, -6.8], [-1.6, 3.6, -2.6], [6.4, 3.9, -8.0], [-7.6, 3.9, -1.0]].forEach(([x, y, z], i) => {
    const c = i ? ch0.clone() : ch0; c.position.set(x, y, z); c.rotation.y = i * 0.7; scene.add(c);
    if (i) CA.noMask.push(c.children.find((o) => o.isSprite));
    ch0.userData.bulbs.forEach(([bx, by, bz], j) => { if (j % 3 === 0) { const v = V3(bx, by, bz).applyEuler(new THREE.Euler(0, i * 0.7, 0)); CA.bokeh.push([x + v.x, y + v.y, z + v.z, '#ffd8a0', 0.7]); } });
    if (i < 3) { const pl = new THREE.PointLight(lin('#ffc890'), 1.6, 9, 2); pl.position.set(x, y - 0.1, z); scene.add(pl); }
  });
  // the roulette table, lamp, chips
  const tbl = caTable(); scene.add(tbl); CA.table = tbl;
  CA.chipsG = caChips(); scene.add(CA.chipsG);
  const lamp = caLamp(); scene.add(lamp); CA.lamp = lamp;
  // background tables (clones without the wheel rotor life) with their own lamps
  [[-5.8, -3.8, 0.3], [5.6, -4.6, -0.25]].forEach(([x, z, ry]) => { const b = tbl.clone(); b.position.set(x + 1.06, 0, z); b.rotation.y = ry; scene.add(b); const l = lamp.clone(); l.position.set(x + 1.0, 2.32, z); l.rotation.y = ry; scene.add(l); (CA.bgT = CA.bgT || []).push(b, l); const sp = new THREE.SpotLight(lin('#ffdcb0'), 1.6, 6, 0.9, 0.7, 1.5); sp.position.set(x + 1, 2.25, z); sp.target.position.set(x + 1, 0, z); scene.add(sp, sp.target); });
  // lights
  const key = new THREE.SpotLight(lin('#ffe1b8'), 5.0, 7, 0.92, 0.55, 1.2); key.position.set(-0.05, 2.7, 0.05); key.target.position.set(-0.05, 0.6, -0.05);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5; key.shadow.blurSamples = 12; key.shadow.bias = -0.0003; key.shadow.camera.near = 0.3; key.shadow.camera.far = 5;
  scene.add(key, key.target); CA.key = key;
  const fill = new THREE.DirectionalLight(lin('#ffd2a8'), 0.36); fill.position.set(1.5, 2.2, 5); scene.add(fill); CA.fill = fill;
  const rim = new THREE.DirectionalLight(lin('#a98cff'), 1.6); rim.position.set(-2, 0.7, -6); scene.add(rim); CA.rim = rim;
  const rim2 = new THREE.DirectionalLight(lin('#ffb070'), 1.1); rim2.position.set(4, 0.8, -5); scene.add(rim2);
  const hemi = new THREE.HemisphereLight(lin('#5a3a30'), lin('#2a0c0c'), 0.3); scene.add(hemi); CA.hemi = hemi;
  const bounce = new THREE.PointLight(lin('#ffcf9a'), 0, 1.6, 2); scene.add(bounce); CA.bounce = bounce;
  const fk = new THREE.SpotLight(lin('#ffd9a8'), 0, 4, 0.35, 0.8, 1); fk.position.set(-0.5, 2.3, -0.2); fk.target.position.set(0.56, 1.5, -0.98); scene.add(fk, fk.target); CA.faceKey = fk;
  { const R = RNG('ca-motes'), n = 160, pos = new Float32Array(n * 3); CA.motes0 = []; for (let i = 0; i < n; i++) CA.motes0.push([R.r(-1.6, 1.6), R.r(0.95, 2.5), R.r(-1.1, 1.0), R.r(0, TAU), R.r(0.02, 0.06)]);
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const mo = new THREE.Points(mg, new THREE.PointsMaterial({ map: CA.tex.glow, color: lin('#ffe2b0'), size: 0.012, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(mo); CA.motes = mo; CA.noMask.push(mo); }
  // haze: a soft cone of light under the lamp
  const hz = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.5, 1.5, 32, 1, true), new THREE.ShaderMaterial({
    uniforms: { col: { value: lin('#ffd9a8') }, a: { value: 0.07 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vY = uv.y; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 col; uniform float a; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = pow(abs(dot(vN, vV)), 2.0); gl_FragColor = vec4(col * a * f * (0.3 + 0.7 * vY), 1.0); }' }));
  hz.position.set(-0.05, 1.55, 0); scene.add(hz); CA.noMask.push(hz);
  // haze: big soft warm glows hanging in the far air
  { const R = RNG('ca-haze'); for (let i = 0; i < 14; i++) { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: CA.tex.glow, color: lin(R.pick(['#ffb070', '#ff8a5a', '#d0a0ff', '#ffd090'])), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: R.r(0.05, 0.11), fog: false })); const sc = R.r(2.5, 5); h.scale.set(sc * 1.6, sc, 1); h.position.set(R.r(-8, 8), R.r(1.6, 3.6), R.r(-11, -4.5)); scene.add(h); CA.noMask.push(h); } }
  // champagne flutes on the rail
  [[1.38, -0.42], [-0.98, -0.66], [0.95, -0.7]].forEach(([x, z], i) => { const fl = new THREE.Group(); fl.add(new THREE.Mesh(caLathe([[0, 0], [0.032, 0], [0.004, 0.006], [0.003, 0.09], [0.018, 0.12], [0.022, 0.2], [0.021, 0.205]], 20), CA.mat.glass)); const lq = new THREE.Mesh(caLathe([[0, 0.1], [0.016, 0.125], [0.019, 0.17], [0, 0.17]], 20), CA.mat.champ); fl.add(lq); fl.position.set(x, CA_TBL.y + 0.085, z); scene.add(fl); });
  // people
  caCrowd(scene);
  // the character
  scene.add(chBuild().root); scene.userData.noMask = CA.noMask; scene.userData.bokeh = CA.bokeh; scene.userData.exposure = 1.0;
  // the depth mask material (alpha = in focus)
  CA.maskMat = new THREE.ShaderMaterial({
    uniforms: { n0: { value: 0 }, n1: { value: 0 }, f0: { value: 1 }, f1: { value: 2 }, mode: { value: 0 } },
    vertexShader: '#include <common>\n#include <skinning_pars_vertex>\nvarying float vZ;\nvoid main(){\n#include <skinbase_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvZ = -mvPosition.z;\n}',
    fragmentShader: 'uniform float n0, n1, f0, f1, mode; varying float vZ; void main(){ float a = mode < 0.5 ? smoothstep(n0, n1, vZ) * (1.0 - smoothstep(f0, f1, vZ)) : 1.0 - smoothstep(n0, n1, vZ); gl_FragColor = vec4(0.0, 0.0, 0.0, a); }',
  });
  return CA;
}
function caCrowd(scene) {
  const P = CA.people;
  const skinA = '#e8b48e', skinB = '#c98c63', skinC = '#8d5a3b', skinD = '#f0c4a4';
  const def = [
    ['croupier', { kind: 'm', outfit: 'vest', c: { skin: skinD, hair: '#2a1a12', suit: '#2a0c10', shirt: '#f1ede4', tie: '#111', pants: '#141418', shoe: '#0b0b0b' }, arms: { L: 'open', R: 'open' }, lean: 6, face: 'o', hair: 'slick', look: [4, -10] }],
    ['red', { kind: 'f', c: { skin: skinA, hair: '#5a1e10', dress: '#b3121f', shoe: '#000' }, arms: { L: 'cheek', R: 'cheek' }, lean: 14, face: 'o', hair: 'long', straps: true, rough: 0.35, look: [0, -8] }],
    ['tux', { kind: 'm', outfit: 'tux', c: { skin: skinB, hair: '#1b120c', suit: '#111114', lapel: '#26262c', shirt: '#f4f1ea', tie: '#0a0a0a', pants: '#101012', shoe: '#090909' }, arms: { L: 'rail', R: 'point' }, lean: 18, face: 'gasp', hair: 'side', look: [-14, -12] }],
    ['gold', { kind: 'f', c: { skin: skinC, hair: '#120c08', dress: '#d9a640', shoe: '#000' }, arms: { L: 'mouth', R: 'chest' }, lean: 6, face: 'o', hair: 'bun', straps: false, rough: 0.3, metal: 0.45, look: [-6, -8] }],
    ['old', { kind: 'm', outfit: 'suit', belly: true, c: { skin: skinD, hair: '#c9c4bc', suit: '#1d2b4a', shirt: '#eef0f2', tie: '#8a1420', pants: '#1a2440', shoe: '#2a1508' }, arms: { L: 'rail', R: 'glass' }, lean: 14, face: 'o', hair: 'grey', prop: 'glass', look: [0, -12] }],
    ['velvet', { kind: 'm', outfit: 'tux', c: { skin: skinA, hair: '#3a2416', suit: '#5a0f22', lapel: '#1a0a0e', shirt: '#f2efe8', tie: '#0a0a0a', pants: '#121214', shoe: '#0a0a0a' }, arms: { L: 'head', R: 'head' }, lean: 4, face: 'gasp', hair: 'short', rough: 0.75, look: [-6, -6] }],
    ['emerald', { kind: 'f', c: { skin: skinB, hair: '#2a160c', dress: '#0f5a3e', gloves: '#111', shoe: '#000' }, arms: { L: 'mouth', R: 'chest' }, lean: 10, face: 'o', hair: 'bob', straps: true, rough: 0.32, look: [-20, -10] }],
    ['boss', { kind: 'm', outfit: 'suit', c: { skin: skinB, hair: '#1a1a1a', suit: '#16171c', shirt: '#dfe3ea', tie: '#3a3d48', pants: '#15161b', shoe: '#0a0a0a' }, arms: { L: 'down', R: 'ear' }, lean: 0, face: 'o', hair: 'bald', earpiece: true, look: [-10, -4] }],
    ['guard', { kind: 'm', big: true, outfit: 'suit', c: { skin: skinC, hair: '#0d0b0a', suit: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f', pants: '#0c0c0f', shoe: '#050505' }, arms: { L: 'swingF', R: 'swingB' }, stride: 0.7, lean: 4, face: 'o', hair: 'buzz', earpiece: true, look: [0, 0] }],
    ['guard2', { kind: 'm', big: true, outfit: 'suit', c: { skin: skinD, hair: '#3a2a1a', suit: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f', pants: '#0c0c0f', shoe: '#050505' }, arms: { L: 'swingF', R: 'grab' }, stride: -0.6, lean: 3, face: 'o', hair: 'buzz', earpiece: true, look: [-15, 0] }],
    ['guard3', { kind: 'm', big: true, outfit: 'suit', c: { skin: skinB, hair: '#0d0b0a', suit: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f', pants: '#0c0c0f', shoe: '#050505' }, arms: { L: 'grab', R: 'swingB' }, stride: 0.6, lean: 3, face: 'o', hair: 'bald', earpiece: true, look: [15, 0] }],
    ['blonde', { kind: 'f', c: { skin: skinD, hair: '#d8b06a', dress: '#1b1b3a', shoe: '#000' }, arms: { L: 'down', R: 'mouth' }, lean: 8, face: 'o', hair: 'long', straps: true, rough: 0.3, look: [10, -6] }],
  ];
  CA.defs = Object.fromEntries(def); def.forEach(([k, o]) => { P[k] = caPerson(o); });
  const place = (k, x, z, ry, s = 1, clone = false) => { const p = clone ? P[k].clone() : P[k]; p.position.set(x, 0, z); p.rotation.y = ry * DEG; p.scale.setScalar(s); scene.add(p); return p; };
  CA.place = {
    croupier: place('croupier', -1.42, -0.98, 18, 1.0),
    red: place('red', 1.12, -1.02, -18, 0.95),
    tux: place('tux', -0.5, -1.06, 4, 1.0),
    gold: place('gold', 0.98, -1.6, -12, 0.96),
    old: place('old', 1.9, -0.22, -96, 0.98),
    velvet: place('velvet', 0.05, -1.58, -6, 1.02),
    emerald: place('emerald', -0.92, -1.32, -20, 0.95),
    boss: place('boss', 2.7, -2.5, -55, 1.02),
    guard: place('guard', -2.7, -4.3, 32, 1.06),
    guard2: place('guard2', 0, 0, 0, 1.06),
    guard3: place('guard3', 0, 0, 0, 1.06),
    blonde: place('blonde', 1.75, 1.15, 200, 0.96),
    fgMan: place('old', -2.35, 1.0, 140, 1.0, true),
  };
  // extras at the background tables
  [['tux', -5.2, -2.9, 160], ['red', -4.1, -4.4, -110], ['emerald', -5.6, -5.0, 10], ['velvet', 6.6, -3.6, 200], ['gold', 5.2, -5.6, 20], ['old', 7.4, -4.9, -60], ['blonde', 3.0, -7.4, 0], ['tux', -1.6, -7.6, 10], ['boss', -6.8, -7.2, 60]].forEach(([k, x, z, ry]) => { const p = place(k, x, z, ry, 0.98, true); CA.modern.push(p); (CA.extras = CA.extras || []).push(p); });
}

// ---------- compositing: depth of field + bokeh + bloom + grade (any of the set's scenes)
function caMaskRender(g, sc, n0, n1, f0, f1, mode) {
  const r = CA.R.r, u = CA.maskMat.uniforms, nm = sc.userData.noMask || [];
  u.n0.value = n0; u.n1.value = n1; u.f0.value = f0; u.f1.value = f1; u.mode.value = mode;
  const fog = sc.fog, bg = sc.background; sc.fog = null; sc.background = null;
  const vis = nm.map((o) => o.visible); nm.forEach((o) => { o.visible = false; });
  sc.overrideMaterial = CA.maskMat; r.shadowMap.autoUpdate = false;
  r.setClearColor(0x000000, 0); r.clear(); r.render(sc, g.cam);
  sc.overrideMaterial = null; r.shadowMap.autoUpdate = true; sc.fog = fog; sc.background = bg;
  nm.forEach((o, i) => { o.visible = vis[i]; });
}
function caPresent(g, sc, dof, bl, grade) {
  const r = CA.R.r, cv = CA.R.cv, C2 = CA.c2, clear = sc.userData.clear ?? '#0c0706';
  r.toneMappingExposure = sc.userData.exposure ?? 1.0;
  r.setClearColor(lin(clear), 1); r.clear(); r.render(sc, g.cam);
  if (!dof) { ctx.save(); screen(); ctx.drawImage(cv, 0, 0, W, H); ctx.restore(); bloom(bl); caGrade(grade); caVignette(grade?.vig ?? 0.55); return; }
  const sh = C2.sharp.x; sh.globalCompositeOperation = 'copy'; sh.drawImage(cv, 0, 0); sh.globalCompositeOperation = 'source-over';
  const hasNear = dof.near != null;
  if (hasNear) {
    caMaskRender(g, sc, dof.near[0], dof.near[1], 0, 0, 1);
    const nx = C2.near.x; nx.globalCompositeOperation = 'copy'; nx.drawImage(C2.sharp.c, 0, 0); nx.globalCompositeOperation = 'destination-in'; nx.drawImage(cv, 0, 0); nx.globalCompositeOperation = 'source-over';
  }
  caMaskRender(g, sc, hasNear ? dof.near[0] : 0, hasNear ? dof.near[1] : 0.01, dof.far[0], dof.far[1], 0);
  const mx = C2.mask.x; mx.globalCompositeOperation = 'copy'; mx.drawImage(cv, 0, 0);
  [[C2.b16, dof.r / 16 * 2.2], [C2.b8, dof.r / 8 * 1.4], [C2.b4, dof.r / 4]].forEach(([L, rad]) => {   // pull-push: focus band cut out, then blurred
    const x = L.x, w = L.c.width, h = L.c.height; x.globalCompositeOperation = 'copy'; x.filter = 'none'; x.drawImage(C2.sharp.c, 0, 0, w, h);
    x.globalCompositeOperation = 'destination-out'; x.drawImage(C2.mask.c, 0, 0, w, h); x.globalCompositeOperation = 'copy'; x.filter = `blur(${rad.toFixed(2)}px)`; x.drawImage(L.c, 0, 0); x.filter = 'none'; x.globalCompositeOperation = 'source-over';
  });
  ctx.save(); screen(); ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = clear; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) ctx.drawImage(C2.b16.c, 0, 0, W, H);
  ctx.drawImage(C2.b8.c, 0, 0, W, H); ctx.drawImage(C2.b8.c, 0, 0, W, H); ctx.drawImage(C2.b4.c, 0, 0, W, H);
  caBokeh(g, dof, sc.userData.bokeh || []);
  sh.globalCompositeOperation = 'destination-in'; sh.drawImage(C2.mask.c, 0, 0); sh.globalCompositeOperation = 'source-over';
  ctx.drawImage(C2.sharp.c, 0, 0);
  if (hasNear) { const nb = C2.nb.x; nb.globalCompositeOperation = 'copy'; nb.filter = `blur(${(dof.nr ?? dof.r) / 4}px)`; nb.drawImage(C2.near.c, 0, 0, W / 4, H / 4); nb.filter = 'none'; nb.globalCompositeOperation = 'source-over'; ctx.drawImage(C2.nb.c, 0, 0, W, H); }
  ctx.restore();
  bloom(bl); caGrade(grade); caVignette(grade?.vig ?? 0.55);
}
function caGrade(gr) {
  if (!gr) return;
  const t = TT;
  ctx.save(); screen();
  if (gr.sepia || gr.sat != null || gr.con || gr.br) { ctx.globalCompositeOperation = 'copy'; ctx.filter = `sepia(${gr.sepia ?? 0}) saturate(${gr.sat ?? 1}) contrast(${gr.con ?? 1}) brightness(${(gr.br ?? 1) * (gr.flicker ? 1 + gr.flicker * Math.sin(t * 37) * Math.sin(t * 23.3) : 1)})`; ctx.drawImage(ctx.canvas, 0, 0); ctx.filter = 'none'; }
  if (gr.tint) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gr.tint[1]; ctx.fillStyle = gr.tint[0]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (gr.grain) {
    if (!CA.grainC) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), R = RNG('ca-grain'), im = x.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + R.n(1) * 110; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); CA.grainC = c; }
    const R = RNG('ca-grain-f', Math.floor(t * 24)); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = gr.grain;
    ctx.translate(-R.r(0, 256), -R.r(0, 256)); ctx.fillStyle = ctx.createPattern(CA.grainC, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (gr.scratch) { ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 3; i++) { if (R.f() < 0.5) continue; ctx.strokeStyle = `rgba(250,240,220,${R.r(0.08, 0.25)})`; ctx.lineWidth = R.r(0.8, 2); const X = R.r(0, W); ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X + R.n(20), H); ctx.stroke(); } }
  }
  ctx.restore();
}
function caVignette(a = 0.55) {
  ctx.save(); screen(); const gr = ctx.createRadialGradient(W / 2, H * 0.52, H * 0.42, W / 2, H * 0.52, H * 1.05); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(10,4,2,${a})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function caBokeh(g, dof, list) {
  const cam = g.cam, v = V3(0, 0, 0), fd = dof.fd, kb = dof.bk ?? 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  list.forEach(([x, y, z, col, s], i) => {
    v.set(x, y, z).applyMatrix4(cam.matrixWorldInverse); const d = -v.z; if (d < 0.3) return;
    v.set(x, y, z).project(cam); if (Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) return;
    const coc = Math.abs(1 / fd - 1 / d) * fd * dof.r * 2.2 * kb; if (coc < 4) return;
    const sx = (v.x * 0.5 + 0.5) * W, sy = (0.5 - v.y * 0.5) * H, rad = Math.min(coc, 60) * Math.sqrt(s), fogA = Math.exp(-0.03 * d);
    const c = lin(col); const rr = Math.round(Math.min(255, Math.pow(c.r, 1 / 2.2) * 255)), gg = Math.round(Math.min(255, Math.pow(c.g, 1 / 2.2) * 255)), bb = Math.round(Math.min(255, Math.pow(c.b, 1 / 2.2) * 255));
    const a = 0.2 * fogA * s * (0.8 + 0.4 * Math.sin(i * 12.9898));
    const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad); gr.addColorStop(0, `rgba(${rr},${gg},${bb},${a * 0.6})`); gr.addColorStop(0.82, `rgba(${rr},${gg},${bb},${a})`); gr.addColorStop(0.93, `rgba(${rr},${gg},${bb},${a * 1.4})`); gr.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(sx, sy, rad, 0, TAU); ctx.fill();
  });
  ctx.restore();
}
// shared helpers for the new sets
function caScene(o = {}) { const sc = new THREE.Scene(); sc.userData.noMask = []; sc.userData.bokeh = []; sc.environment = CA.scene.environment; Object.assign(sc.userData, o); return sc; }
const caBasic = (c, k = 1, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: lin(c).multiplyScalar(k) }, o));
function caGlowSprite(sc, col, x, y, z, w, h, a = 0.5) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: CA.tex.glow, color: lin(col), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: a })); s.scale.set(w, h, 1); s.position.set(x, y, z); sc.add(s); sc.userData.noMask.push(s); return s; }
function caTexSky(top, mid, bot, stars = 0) {
  return g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot); x.fillStyle = gr; x.fillRect(0, 0, w, h); const R = RNG('ca-sky', top); for (let i = 0; i < stars; i++) { x.fillStyle = `rgba(255,255,255,${R.r(0.2, 0.9)})`; x.fillRect(R.r(0, w), R.r(0, h * 0.5), R.r(0.6, 1.6), R.r(0.6, 1.6)); } }, 512, 512);
}
function caSkyDome(sc, tex, r = 400) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })); sc.add(m); return m; }
function caCharIn(sc) { const c = chBuild(); if (c.root.parent !== sc) sc.add(c.root); c.root.visible = true; c.root.scale.set(1, 1, 1); return c; }
function caFollowBone(obj, bone, off) { chBuild().root.updateMatrixWorld(true); obj.matrixAutoUpdate = false; obj.matrix.copy(bone.matrixWorld); if (off) obj.matrix.multiply(off); obj.matrixWorldNeedsUpdate = true; }
// a two-tone striped scarf around his neck (positioned from the neck bone every frame)
function caScarf(sc, c1, c2) {
  const tex = caRep(g3Tex((x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c2 : c1; x.fillRect(0, i * h / 8, w, h / 8); } x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < w; i += 4) x.fillRect(i, 0, 1, h); }, 64, 128));
  const m = caStd({ map: tex, roughness: 0.9, side: THREE.DoubleSide }), g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.03, 10, 28), m); ring.rotation.x = Math.PI / 2 - 0.25; ring.scale.set(1, 1.15, 1); ring.position.set(0, 0.02, 0.004); g.add(ring);
  [[0.04, 0.0], [-0.03, 0.06]].forEach(([x, rz]) => { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.36, 0.016), m); tl.position.set(x, -0.15, 0.1); tl.rotation.set(0.12, 0, rz); g.add(tl); });
  sc.add(g); return g;
}

// ---------- the floor beats: crowd variants (wild 40, Monte Carlo 1913), coins, flying chips, confetti
function caWild() {
  if (CA.wild) return CA.wild;
  const D = CA.defs, P = CA.place, W0 = {};
  const v = { croupier: { arms: { L: 'head', R: 'open' }, face: 'gasp' }, red: { arms: { L: 'up', R: 'wave' }, face: 'gasp' }, tux: { arms: { L: 'up', R: 'up' }, face: 'gasp', lean: 8 }, gold: { arms: { L: 'wave', R: 'up' }, face: 'smile' }, old: { arms: { L: 'wave', R: 'glass' }, face: 'gasp' }, velvet: { arms: { L: 'up', R: 'up' }, face: 'smile', lean: -4 }, emerald: { arms: { L: 'up', R: 'mouth' }, face: 'gasp' } };
  Object.entries(v).forEach(([k, o]) => { const p = caPerson(Object.assign({}, D[k], o)); p.position.copy(P[k].position); p.rotation.copy(P[k].rotation); p.scale.copy(P[k].scale); p.visible = false; CA.scene.add(p); W0[k] = p; });
  CA.wild = W0; return W0;
}
function caPeriod() {
  if (CA.period) return CA.period;
  const sk = '#ecc4a0', T = {};
  const d = [
    ['top', { kind: 'm', outfit: 'tux', c: { skin: sk, hair: '#2a1d14', suit: '#141416', lapel: '#232328', shirt: '#f2eee4', tie: '#efe9dc', pants: '#141416', shoe: '#0b0b0b' }, arms: { L: 'rail', R: 'point' }, lean: 16, face: 'gasp', hair: 'slick', hat: 'top', stache: true, look: [-18, -14] }, [-0.55, -1.05, 6]],
    ['bowler', { kind: 'm', outfit: 'suit', belly: true, c: { skin: sk, hair: '#5a4a3a', suit: '#56524c', shirt: '#efe9dc', tie: '#3a2a20', pants: '#4a4640', shoe: '#2a1a10' }, arms: { L: 'chest', R: 'rail' }, lean: 12, face: 'o', hair: 'grey', hat: 'bowler', stache: true, look: [-24, -10] }, [-0.05, -1.08, -6]],
    ['lady1', { kind: 'f', c: { skin: sk, hair: '#3a2416', dress: '#3a2832', shirt: '#efe6d8', hatc: '#2a1e26', feather: '#efe6d8' }, arms: { L: 'mouth', R: 'chest' }, lean: 8, face: 'o', hair: 'bun', hat: 'lady', sleeves: true, highNeck: true, flare: 0.3, rough: 0.5, look: [-22, -10] }, [-1.05, -1.28, 14]],
    ['lady2', { kind: 'f', c: { skin: sk, hair: '#8a5a32', dress: '#d8ccb6', shirt: '#f2ece0', hatc: '#e8dcc4', feather: '#2a2420' }, arms: { L: 'cheek', R: 'cheek' }, lean: 10, face: 'o', hair: 'bun', hat: 'lady', sleeves: true, highNeck: true, flare: 0.3, rough: 0.5, look: [-30, -8] }, [0.5, -1.12, -16]],
    ['crou', { kind: 'm', outfit: 'tux', c: { skin: sk, hair: '#1a1410', suit: '#101012', lapel: '#1e1e22', shirt: '#f2eee4', tie: '#101012', pants: '#101012', shoe: '#0b0b0b' }, arms: { L: 'rail', R: 'rail' }, lean: 14, face: 'o', hair: 'slick', stache: true, look: [-20, -16] }, [0.95, -1.02, -12]],
    ['top2', { kind: 'm', outfit: 'tux', c: { skin: sk, hair: '#2a1d14', suit: '#1a1a1e', lapel: '#2a2a30', shirt: '#f2eee4', tie: '#efe9dc', pants: '#1a1a1e', shoe: '#0b0b0b' }, arms: { L: 'down', R: 'chest' }, lean: 4, face: 'o', hair: 'short', hat: 'top', stache: true, look: [-30, -8] }, [0.35, -1.75, -20]],
  ];
  d.forEach(([k, o, [x, z, ry]]) => { const p = caPerson(o); p.position.set(x, 0, z); p.rotation.y = ry * DEG; p.visible = false; CA.scene.add(p); T[k] = p; });
  // the 1913 stakes: gold louis stacks, ivory plaques, banknotes
  const tg = new THREE.Group(), R = RNG('ca-1913'), y0 = CA_TBL.y, gold = caStd({ color: lin('#e8b850'), metalness: 1, roughness: 0.25 }), ivory = caStd({ color: lin('#efe6d0'), roughness: 0.3 }), note = caStd({ map: g3Tex((x, w, h) => { x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#6a5a3a'; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#6a5a3a'; x.font = 'bold 30px Georgia, serif'; x.textAlign = 'center'; x.fillText('1000', w / 2, h / 2 + 10); x.beginPath(); x.arc(40, h / 2, 18, 0, TAU); x.stroke(); }, 256, 128), roughness: 0.8 });
  [[0.05, -0.3], [0.12, -0.36], [0.2, -0.3], [0.42, -0.42], [0.6, -0.28], [-0.12, -0.42], [0.85, -0.4], [0.3, -0.2], [0.72, -0.48]].forEach(([x, z], i) => { const n = R.i(6, 22), c = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, n * 0.0016, 18), gold); c.position.set(x + R.n(0.01), y0 + n * 0.0008, z + R.n(0.01)); c.castShadow = true; tg.add(c); });
  [[0.0, -0.18, 6, 0.3], [0.5, -0.36, 4, -0.2], [0.95, -0.22, 5, 0.5]].forEach(([x, z, n, ry]) => { for (let i = 0; i < n; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.005, 0.048), ivory); pl.position.set(x + R.n(0.004), y0 + 0.0025 + i * 0.0052, z + R.n(0.004)); pl.rotation.y = ry + R.n(0.1); pl.castShadow = true; tg.add(pl); } });
  [[0.25, -0.5, 0.2], [0.68, -0.15, -0.5], [-0.2, -0.26, 0.9]].forEach(([x, z, ry]) => { for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.0015, 0.07), note); b.position.set(x + i * 0.012, y0 + 0.001 + i * 0.0016, z + i * 0.006); b.rotation.y = ry + i * 0.12; tg.add(b); } });
  tg.visible = false; CA.scene.add(tg); T._stakes = tg;
  CA.period = T; return T;
}
function caCoinsBuild() {
  if (CA.coins) return CA.coins;
  const geo = new THREE.CylinderGeometry(0.019, 0.019, 0.0035, 18), m = caStd({ color: lin('#f2c45a'), metalness: 1, roughness: 0.22, emissive: lin('#6a4400') });
  const im = new THREE.InstancedMesh(geo, m, 540); im.castShadow = false; im.frustumCulled = false; CA.scene.add(im);
  const R = RNG('ca-coins'), data = []; for (let i = 0; i < 540; i++) data.push({ m: i % 3, ts: R.r(0, 1), x: R.n(0.07), vx: R.n(0.35), vy: R.r(0.2, 1.3), vz: R.r(0.6, 1.6), rx: R.r(0, TAU), ry: R.r(0, TAU), sp: R.r(4, 14), px: R.n(0.5), pz: R.r(0.1, 0.9) });
  const pile = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.12, 40, 1), caStd({ map: caRep(g3Tex((x, w, h) => { const R2 = RNG('ca-pile'); x.fillStyle = '#9a6a1a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${R2.i(220, 255)},${R2.i(170, 210)},${R2.i(60, 110)},1)`; x.beginPath(); x.ellipse(R2.r(0, w), R2.r(0, h), R2.r(4, 7), R2.r(2, 5), R2.r(0, 3), 0, TAU); x.fill(); } }, 256, 256), 3, 1), metalness: 0.9, roughness: 0.3 }));
  CA.scene.add(pile);
  CA.coins = { im, data, pile }; return CA.coins;
}
function caFlyBuild() {
  if (CA.fly) return CA.fly;
  const chips = [0, 4, 5, 1].map((ci) => { const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0195, 0.0195, 0.0034, 20), CA.mat.chipTop[ci], 40); im.frustumCulled = false; CA.scene.add(im); return im; });
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.03, 0.018), caStd({ side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4 }), 420); conf.frustumCulled = false;
  const R = RNG('ca-conf'), cols = ['#f2c45a', '#e8e2d2', '#c41d27', '#f2c45a', '#ffd9a0'];
  for (let i = 0; i < 420; i++) conf.setColorAt(i, lin(R.pick(cols)));
  CA.scene.add(conf); CA.noMask.push(conf);
  CA.fly = { chips, conf }; return CA.fly;
}

// ---------- chExtra people (the character agent's kit, hero quality) for everyone in modern dress
const CA_XF = {   // [seed, chExtra options] for the floor crowd
  croupier: [101, { sex: 'm', age: 'adult', outfit: 'uniform', beard: 'none', colors: { top: '#2a0c10', shirt: '#f1ede4', tie: '#141414', bottom: '#141418' } }],
  red: [102, { sex: 'f', age: 'adult', outfit: 'dress', makeup: true, colors: { top: '#b3121f', lips: 'red' } }],
  tux: [103, { sex: 'm', age: 'adult', outfit: 'suit', colors: { top: '#121216', shirt: '#f4f1ea', tie: '#0a0a0a' } }],
  gold: [104, { sex: 'f', age: 'adult', outfit: 'dress', skin: 0.8, makeup: true, colors: { top: '#d9a640' } }],
  old: [105, { sex: 'm', age: 'old', build: 'heavy', outfit: 'suit', glasses: true, colors: { top: '#1d2b4a', shirt: '#eef0f2', tie: '#8a1420' } }],
  velvet: [106, { sex: 'm', age: 'young', outfit: 'suit', colors: { top: '#5a0f22', shirt: '#f2efe8', tie: '#0a0a0a' } }],
  emerald: [107, { sex: 'f', age: 'young', outfit: 'dress', skin: 0.45, makeup: true, colors: { top: '#0f5a3e' } }],
  boss: [108, { sex: 'm', age: 'adult', build: 'heavy', outfit: 'suit', hair: 'bald', beard: 'none', skin: 0.55, colors: { top: '#16171c', shirt: '#dfe3ea', tie: '#3a3d48' } }],
  guard: [109, { sex: 'm', age: 'adult', build: 'heavy', outfit: 'suit', skin: 0.85, beard: 'none', colors: { top: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f' } }],
  guard2: [110, { sex: 'm', age: 'adult', build: 'heavy', outfit: 'suit', skin: 0.2, colors: { top: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f' } }],
  guard3: [111, { sex: 'm', age: 'adult', build: 'heavy', outfit: 'suit', skin: 0.6, hair: 'bald', colors: { top: '#0c0c0f', shirt: '#e9ecf1', tie: '#0c0c0f' } }],
  blonde: [112, { sex: 'f', age: 'adult', outfit: 'dress', hairColor: 'blonde', makeup: true, colors: { top: '#1b1b3a' } }],
  fgMan: [113, { sex: 'm', age: 'adult', outfit: 'suit', colors: { top: '#2e3b52', shirt: '#f2efe8', tie: '#7a6a2a' } }],
};
const CA_XMOOD = {   // per person: astonished at the table
  croupier: { pose: 'shock', expr: 'surprised', add: { spine: [8, 0, 0] } }, red: { pose: 'shock', expr: 'amazed', add: { spine: [10, 0, 0] } },
  tux: { pose: 'point', expr: 'amazed', add: { spine: [14, -10, 0] } }, gold: { pose: 'hold', expr: 'surprised', add: { spine: [6, 0, 0] } },
  old: { pose: 'hold', expr: 'surprised', add: { spine: [12, 0, 0] } }, velvet: { pose: 'shock', expr: 'amazed' }, emerald: { pose: 'hold', expr: 'amazed', add: { spine: [8, 0, 0] } },
  boss: { pose: 'stand', expr: 'worried', add: { shR: [-82, -6, -34], elR: [-140, 0, 0], wrR: [0, 0, -28], neck: [0, 0, -6], head: [0, -8, -14] }, hand: { R: 'point' } },
  blonde: { pose: 'stand', expr: 'surprised', add: { head: [4, 0, 0] } }, fgMan: { pose: 'stand', expr: 'surprised' },
  guard: { pose: 'stand', expr: 'neutral' }, guard2: { pose: 'stand', expr: 'neutral', add: { shR: [-28, 0, -38], elR: [-35, 0, 0] }, hand: { R: 'hold' } }, guard3: { pose: 'stand', expr: 'neutral', add: { shL: [-28, 0, 38], elL: [-35, 0, 0] }, hand: { L: 'hold' } },
};
function caX(key, seed, o, sc) { CA.X = CA.X || {}; if (!CA.X[key]) { CA.X[key] = chExtra(seed, o); (sc || CA.scene).add(CA.X[key].root); } return CA.X[key]; }
const caHasX = () => typeof chExtra === 'function';
// mirror my placed people with extras: same spot/visibility, posed by mood
function caFloorExtras(t, shot, hero) {
  const P = CA.place;
  Object.entries(CA_XF).forEach(([n, [seed, o]], i) => {
    const p = P[n], X = caX('f-' + n, seed, Object.assign({ height: (o.sex === 'f' ? 0.97 : 1.0) * p.scale.x }, o));
    X.root.visible = p.visible; p.visible = false; if (!X.root.visible) return;
    let m = CA_XMOOD[n], walk = null, look = [0, -6], jump = 0;
    if (shot === 'forty' && !/guard|boss|fgMan/.test(n)) { m = { pose: i % 3 === 1 ? [['cheer', 0.7], ['shock', 0.3]] : 'cheer', expr: i % 2 ? 'joy' : 'amazed', hand: { L: 'fist', R: i % 2 ? 'open' : 'fist' } }; jump = 0.06 * Math.max(0, Math.sin(t * 6.5 + i * 1.3)); }
    if (/^guard/.test(n)) walk = t * 0.9 + i * 0.3;
    if (shot === 'banned' && !/guard/.test(n)) { const yaw = Math.atan2(hero[0] - p.position.x, hero[2] - p.position.z) - p.rotation.y, wy = Math.atan2(Math.sin(yaw), Math.cos(yaw)) / DEG; m = { pose: n === 'boss' ? 'point' : 'stand', expr: n === 'boss' ? 'neutral' : 'surprised', add: { neck: [0, clamp(wy * 0.4, -35, 35), 0], head: [0, clamp(wy * 0.5, -40, 40), 0] } }; }
    if (shot === 'pitboss' && n === 'boss') { const ph = Math.floor(t * 7.5), R = RNG('ca-talk', ph), syl = ['neutral', 'surprised', 'amazed', 'worried', 'happy', 'surprised'][R.i(0, 5)], w = 0.55 + 0.45 * Math.sin((t * 7.5 % 1) * Math.PI); m = Object.assign({}, m, { expr: [[syl, w], ['worried', 1 - w + 0.01]] }); }
    X.pose(Object.assign({ t: t + i * 0.37, look }, m, { walk, pos: [p.position.x, jump, p.position.z], rot: p.rotation.y / DEG }));
  });
}
function caFloor(g, t, shot, k, b) {
  const S = caBuild(), P = S.place, sc = S.scene, c = caCharIn(sc), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const u = b ? t - b.t0 : t;
  // reset
  S.rotor.rotation.y = 0.8 - S.ballA + 0.35 * (t - 2);
  { const ka = S.ballA; S.ball.position.set(Math.sin(ka) * 0.236, 0.0205, Math.cos(ka) * 0.236); S.glint.position.copy(S.ball.position).add(V3(0, 0.012, 0)); }
  P.guard2.visible = P.guard3.visible = false; P.guard.visible = true; S.glint.visible = true; S.lamp.visible = true; P.fgMan.visible = true;
  P.blonde.position.set(1.75, 0, 1.15); P.blonde.rotation.y = 200 * DEG; P.boss.rotation.y = -55 * DEG;
  S.bounce.intensity = 0; S.fill.intensity = 0.3; S.fill.color.set(lin('#ffc496')); S.faceKey.intensity = 0; S.hemi.intensity = 0.3; S.key.intensity = 4.6;
  Object.values(P).forEach((p) => { const h = p.caHead; if (h) h.rotation.set(...h.userData.r0, 'YXZ'); });
  S.faceKey.target.position.set(0.56, 1.5, -0.98); S.faceKey.target.updateMatrixWorld(); if (P.boss.caHead.caMouth) P.boss.caHead.caMouth.scale.y = 0.019;
  const modern = shot !== 'montecarlo'; S.modern.forEach((o) => { o.visible = modern; });
  ['croupier', 'red', 'tux', 'gold', 'old', 'velvet', 'emerald', 'boss', 'guard', 'blonde', 'fgMan'].forEach((n) => { P[n].visible = modern; });
  if (CA.wild) Object.values(CA.wild).forEach((p) => { p.visible = false; });
  if (CA.period) Object.values(CA.period).forEach((p) => { p.visible = false; }); S.chipsG.visible = true;
  if (CA.coins) { CA.coins.im.visible = false; CA.coins.pile.visible = false; }
  if (CA.fly) { CA.fly.chips.forEach((m) => { m.visible = false; }); CA.fly.conf.visible = false; }
  S.slots.forEach((s) => { s.children[1].material = CA.mat.slot[S.slots.indexOf(s) % 5]; });
  S.stools.forEach((s) => { s.visible = modern; }); S.bgT.forEach((o) => { o.visible = shot !== 'slots'; });
  if (shot === 'slots') S.extras.forEach((o) => { o.visible = false; });
  { const a = S.motes.geometry.attributes.position; S.motes0.forEach(([x, y, z, ph, sp], i) => a.setXYZ(i, x + 0.05 * Math.sin(t * 0.3 + ph), y + ((t * sp + ph) % 0.6) - 0.3, z + 0.05 * Math.cos(t * 0.23 + ph * 1.7))); a.needsUpdate = true; }
  if (!sc.children.includes(c.root)) sc.add(c.root);
  let dof = null, bl = 0.24, grade = null;
  const hero = [0.56, 0, -0.98];
  if (shot === 'roulette') {   // the ball runs the track, drops into 17; he goes from held breath to a roar
    const kL = 0.4, w = ss(kL, kL + 0.06, k);
    if (k < kL + 0.04) {
      const dk = Math.max(0, kL - k), landA = S.rotor.rotation.y + S.ballA, wa = landA - 9 * dk - 26 * dk * dk, rr = lerp(0.236, 0.372, ss(0.0, 0.07, dk)), hop = 0.012 * Math.abs(Math.sin(dk * 160)) * ss(0.07, 0.0, dk) * ss(0, 0.01, dk);
      const la = wa - S.rotor.rotation.y; S.ball.position.set(Math.sin(la) * rr, lerp(0.0205, 0.046, ss(0.0, 0.07, dk)) + hop, Math.cos(la) * rr); S.glint.position.copy(S.ball.position).add(V3(0, 0.012, 0));
      S.glint.visible = dk < 0.01;
    }
    chPose({ pose: [['stand', 1 - w], ['cheer', w]], expr: w < 0.5 ? [['worried', 0.6], ['surprised', 0.4]] : 'joy', pos: [hero[0], 0.05 * w * Math.abs(Math.sin(t * 7)), hero[2]], rot: -6, look: w < 0.5 ? [-30, -18] : [-6, 4], add: { spine: [8 * (1 - w), 0, 0], neck: [6 * (1 - w), -10 * (1 - w), 0] }, t });
    S.faceKey.intensity = 1.1; S.faceKey.position.set(0.0, 2.2, 0.4);
    P.guard.position.set(-1.1 + 0.1 * (t - 2), 0, -4.4 + 0.3 * (t - 2)); P.guard.rotation.y = 14 * DEG;
    const pk = EZ.io(k);
    shotCam(g, [lerp(-0.42, -0.3, pk), lerp(2.02, 1.9, pk), lerp(2.3, 1.95, pk)], [0.12, 1.06, -0.62], 24, 1, t);
    dof = { fd: 3.0, near: [0.9, 1.5], far: [4.4, 8.0], r: 12, nr: 18 };
  } else if (shot === 'forty') {   // 40: the table erupts, chips and confetti in the air
    const F = caFlyBuild(); if (!caHasX()) { const W0 = caWild(); Object.entries(W0).forEach(([n, p]) => { p.visible = true; P[n].visible = false; }); }
    chPose({ pose: 'cheer', expr: 'joy', pos: [hero[0], 0.1 * Math.abs(Math.sin(t * 6.5)), hero[2]], rot: 12, look: [8, 10], t });
    const R = RNG('ca-fly');
    F.chips.forEach((im, ci) => { im.visible = true; for (let i = 0; i < 40; i++) { const ts = R.r(0, 1.6), tau = ((u - ts) % 1.6 + 1.6) % 1.6, x0 = R.r(-0.6, 1.2), z0 = R.r(-0.8, 0.2), vy = R.r(2.2, 3.4); const y = 1.3 + vy * tau - 4.9 * tau * tau; e.set(R.r(0, TAU) + tau * R.r(5, 12), 0, R.r(0, TAU) + tau * 6); m4.compose(V3(x0 + R.n(0.6) * tau, Math.max(0.81, y), z0 + R.n(0.5) * tau), q.setFromEuler(e), V3(1, 1, 1)); im.setMatrixAt(i, m4); } im.instanceMatrix.needsUpdate = true; });
    F.conf.visible = true; for (let i = 0; i < 420; i++) { const ts = R.r(0, 4), tau = ((u + ts) % 4), y = 3.2 - 0.75 * tau; e.set(tau * R.r(3, 8), tau * R.r(2, 6), R.r(0, TAU)); m4.compose(V3(R.r(-2.2, 2.6) + 0.12 * Math.sin(tau * 3 + i), y, R.r(-2.2, 1.6)), q.setFromEuler(e), V3(1, 1, 1)); F.conf.setMatrixAt(i, m4); } F.conf.instanceMatrix.needsUpdate = true;
    S.faceKey.intensity = 1.3; S.faceKey.position.set(1.4, 2.1, 0.6);
    const pk = EZ.io(k);
    shotCam(g, [lerp(1.05, 0.95, pk), lerp(1.5, 1.45, pk), lerp(1.9, 1.6, pk)], [0.42, 1.48, -0.9], 30, 1.4, t);
    dof = { fd: 2.6, near: [0.7, 1.3], far: [4.0, 8.0], r: 12, nr: 16 }; bl = 0.3;
  } else if (shot === 'pitboss') {   // the pit boss on the earpiece; behind him, the kid still celebrating
    chPose({ pose: 'cheer', expr: 'joy', pos: hero, rot: 20, look: [10, 6], t });
    P.boss.rotation.y = 150 * DEG; const bh = P.boss.caHead; bh.rotation.set(0.05, 0.55 + 0.08 * Math.sin(t * 0.7), 0.04, 'YXZ'); if (bh.caMouth) bh.caMouth.scale.y = 0.006 + 0.012 * Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3));
    P.guard.position.set(lerp(-1.4, -0.4, k), 0, lerp(-4.6, -3.0, k)); P.guard.rotation.y = 30 * DEG;
    const pk = EZ.io(k);
    shotCam(g, [lerp(3.38, 3.28, pk), 1.64, lerp(-3.95, -3.8, pk)], [2.21, 1.47, -2.22], 34, 1, t);
    dof = { fd: 1.5, far: [2.1, 3.6], r: 16 };
  } else if (shot === 'banned') {   // security walks him out, toward us; the table turns to watch
    const x = -0.42, z = 1.15 + 0.42 * u;
    chPose({ pose: [['shrug', 0.85], ['stand', 0.15]], walk: u * 0.72, expr: 'smug', pos: [x, 0, z], rot: 0, look: [0, 4], t });
    P.guard2.visible = P.guard3.visible = true; P.guard.visible = false; S.glint.visible = false; S.lamp.visible = false; P.fgMan.visible = false;
    P.guard2.position.set(x + 0.56, 0, z - 0.05); P.guard3.position.set(x - 0.56, 0, z - 0.05); P.guard2.rotation.y = P.guard3.rotation.y = 0;
    P.blonde.position.set(1.25, 0, 1.05); P.blonde.rotation.y = -110 * DEG;
    ['croupier', 'red', 'tux', 'gold', 'old', 'velvet', 'emerald', 'boss', 'blonde'].forEach((n) => { const p = P[n], h = p.caHead, hp = h.getWorldPosition(V3(0, 0, 0)), yaw = Math.atan2(x - hp.x, z - hp.z) - p.rotation.y; h.rotation.set(h.userData.r0[0] * 0.4, clamp(Math.atan2(Math.sin(yaw), Math.cos(yaw)), -1.3, 1.3), 0, 'YXZ'); });
    const pk = EZ.io(k);
    shotCam(g, [0.2 + 0.4 * pk, 0.95, 4.95 + 0.42 * u], [0.32, 1.22, 1.2 + 0.42 * u], 30, 1, t);
    dof = { fd: 3.4 + 0.1 * pk, far: [5.6, 10], r: 9 };
  } else if (shot === 'slots') {   // every machine he touches pays out
    const C0 = caCoinsBuild(), pays = [7, 8, 9], kx = 4.4;
    S.stools.slice(6, 12).forEach((st) => { st.visible = false; });
    pays.forEach((i, j) => { const on = k > 0.08 + j * 0.12; S.slots[i].children[1].material = on && Math.sin(t * 9 + j) > -0.2 ? CA.mat.slotWin : CA.mat.slot[i % 5]; });
    const w = ss(0.3, 0.42, k);
    chPose({ pose: [['shock', 1 - w], ['cheer', w]], expr: w < 0.5 ? 'amazed' : 'joy', pos: [kx, 0, -5.42], rot: 18, look: [-20 * (1 - w), 6], t });
    C0.im.visible = true; C0.pile.visible = true;
    C0.data.forEach((d, i) => {
      const s0 = S.slots[pays[d.m]], j = d.m, start = 0.9 + j * 1.1, span = 2.4, tau = u - start - d.ts * span * 3;
      const mx = s0.position.x + d.x, my = 0.77, mz = s0.position.z + 0.43;
      let px, py, pz, sc0 = 1;
      if (tau < 0) { sc0 = 0; px = mx; py = my; pz = mz; }
      else { const tf = tau % 2.6, yy = my + d.vy * tf - 4.9 * tf * tf; if (yy > 0.01) { px = mx + d.vx * tf; py = yy; pz = mz + d.vz * tf * 0.5; e.set(d.rx + tf * d.sp, d.ry, 0); } else { px = kx - 0.33 + (j - 1) * 0.66 + d.px * 0.5; py = 0.004 + 0.002 * (i % 4); pz = mz + d.pz * 0.6; e.set(Math.PI / 2 + (i % 5) * 0.03, d.ry, 0); } }
      m4.compose(V3(px, py, pz), q.setFromEuler(e), V3(sc0, sc0, sc0)); C0.im.setMatrixAt(i, m4);
    });
    C0.im.instanceMatrix.needsUpdate = true;
    const pg = ss(0.1, 1, k); C0.pile.scale.set(0.4 + 0.6 * pg, 0.2 + 0.8 * pg, 0.4 + 0.6 * pg); C0.pile.position.set(kx - 0.15, 0.06 * C0.pile.scale.y, -5.85);
    S.faceKey.intensity = 0.9; S.faceKey.position.set(5.2, 2.3, -3.6); S.faceKey.target.position.set(kx, 1.5, -5.55); S.faceKey.target.updateMatrixWorld();
    const pk = EZ.io(k);
    shotCam(g, [lerp(5.5, 5.3, pk), lerp(1.5, 1.42, pk), lerp(-3.1, -3.45, pk)], [4.35, 1.18, -6.0], 28, 1, t);
    dof = { fd: 2.35, near: [0.6, 1.2], far: [3.6, 7], r: 11 }; bl = 0.32;
  } else if (shot === 'montecarlo') {   // 18 August 1913: black, again
    const T0 = caPeriod(); Object.values(T0).forEach((p) => { p.visible = true; }); S.chipsG.visible = false;
    sc.remove(c.root);
    S.lamp.visible = true; S.rotor.rotation.y = 2.2 - S.ballA + 0.25 * u; S.ball.position.set(Math.sin(S.ballA) * 0.236, 0.0205, Math.cos(S.ballA) * 0.236); S.glint.position.copy(S.ball.position).add(V3(0, 0.012, 0));
    const pk = EZ.io(k);
    shotCam(g, [lerp(-2.25, -2.05, pk), lerp(1.62, 1.55, pk), lerp(1.45, 1.25, pk)], [-0.78, 0.98, -0.5], 30, 0.8, t);
    dof = { fd: 2.4, near: [0.9, 1.4], far: [3.6, 6.5], r: 13 };
    grade = { sepia: 0.92, sat: 0.85, con: 1.12, br: 0.96, grain: 0.22, scratch: true, flicker: 0.035, vig: 0.8 }; bl = 0.18;
  } else if (shot === 'top') {
    chPose({ pose: 'cheer', expr: 'joy', pos: hero, rot: -6, look: [-6, 4], t });
    const [wx, wy, wz] = CA_WC; shotCam(g, [wx + 0.18, 2.05, wz + 0.42], [wx + 0.1, wy, wz - 0.02], 32, 0.5, t);
    dof = { fd: 1.35, far: [1.6, 2.4], r: 7 };
  }
  if (caHasX()) { const cr = chBuild().root.position; caFloorExtras(t, shot, [cr.x, 0, cr.z]); }
  caPresent(g, sc, dof, bl, grade);
}

// ---------- ARRIVE: the casino at night, neon, he walks in
function caArrive() {
  if (CA.arr) return CA.arr;
  const sc = caScene({ clear: '#05060c', exposure: 1.0 }), M = CA.mat, A = { sc };
  sc.fog = new THREE.FogExp2(lin('#0b0d1a'), 0.018);
  caSkyDome(sc, caTexSky('#03040c', '#121433', '#3a1e3e', 260));
  // wet asphalt + plaza stones
  const asph = caRep(g3Tex((x, w) => { const R = RNG('ca-asph'); x.fillStyle = '#26262a'; x.fillRect(0, 0, w, w); for (let i = 0; i < 26000; i++) { const v = R.i(10, 90); x.fillStyle = `rgba(${v},${v},${v + 5},${R.r(0.2, 0.6)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 3), R.r(1, 3)); } for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(10,10,14,${R.r(0.2, 0.5)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(20, 70), R.r(8, 30), R.r(0, 3), 0, TAU); x.fill(); } }, 512, 512), 14, 14);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshPhysicalMaterial({ map: asph, roughness: 0.32, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1.2 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; sc.add(ground);
  const pav = caRep(g3Tex((x, w) => { const R = RNG('ca-pav'); x.fillStyle = '#6a625a'; x.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const v = R.i(-14, 14); x.fillStyle = `rgb(${150 + v},${140 + v},${128 + v})`; x.fillRect(i * 32 + 1.5, j * 32 + 1.5, 29, 29); } }, 256, 256), 6, 4);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshPhysicalMaterial({ map: pav, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.005, -4.5); plaza.receiveShadow = true; sc.add(plaza);
  // facade: cream stone with lit arched windows
  const fac = g3Tex((x, w, h) => {
    x.fillStyle = '#c9b48e'; x.fillRect(0, 0, w, h); const R = RNG('ca-fac');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 16; c++) {
      const X = 18 + c * 62, Y = 40 + r * 112, lit = R.f() < 0.8;
      x.fillStyle = '#7a6448'; x.fillRect(X - 3, Y - 3, 38, 80);
      const gr = x.createLinearGradient(0, Y, 0, Y + 74); gr.addColorStop(0, lit ? '#ffd890' : '#2a2030'); gr.addColorStop(1, lit ? '#ff9a40' : '#151018'); x.fillStyle = gr;
      x.beginPath(); x.moveTo(X, Y + 74); x.lineTo(X, Y + 16); x.arc(X + 16, Y + 16, 16, Math.PI, 0); x.lineTo(X + 32, Y + 74); x.closePath(); x.fill();
      x.fillStyle = 'rgba(60,40,20,0.6)'; x.fillRect(X + 15, Y, 2, 74);
    }
    x.fillStyle = '#e8d8b4'; for (let r = 0; r < 5; r++) x.fillRect(0, 22 + r * 112, w, 8);
  }, 1024, 512);
  fac.anisotropy = 8;
  const facM = caStd({ map: fac, roughness: 0.7, emissive: lin('#ffffff'), emissiveMap: fac, emissiveIntensity: 0.12, color: lin('#9a8a7a') });
  const body = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 5), [facM, facM, caStd({ color: lin('#2a2420') }), caStd({ color: lin('#2a2420') }), facM, facM]); body.position.set(0, 7, -12); sc.add(body);
  // grand entrance: glowing doors under an arch
  const doorT = g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe2a8'); gr.addColorStop(1, '#ff9a3a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = '#6a4a20'; x.lineWidth = 6; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } x.strokeRect(3, 3, w - 6, h - 6); }, 256, 256);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.6), new THREE.MeshBasicMaterial({ map: doorT, color: lin('#ffffff').multiplyScalar(1.6) })); door.position.set(0, 1.8, -9.48); sc.add(door);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.22, 12, 48, Math.PI), M.brass); arch.position.set(0, 3.7, -9.4); sc.add(arch);
  [-2.9, 2.9].forEach((x) => { const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 3.7, 20), M.brass); pil.position.set(x, 1.85, -9.4); sc.add(pil); });
  // canopy with a bulb grid underneath
  const can = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 5), caStd({ color: lin('#1a1214'), metalness: 0.5, roughness: 0.4 })); can.position.set(0, 4.5, -7.2); sc.add(can);
  const canEdge = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.14, 5.1), M.gold); canEdge.position.set(0, 4.22, -7.2); sc.add(canEdge);
  const bulbs = []; for (let i = 0; i < 22; i++) for (let j = 0; j < 9; j++) bulbs.push([-4.2 + i * 0.4, 4.18, -9.4 + j * 0.5]);
  for (let i = 0; i < 46; i++) { bulbs.push([-4.5 + i * 0.2, 4.36, -4.62]); }
  const bm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbs.length); const m4 = new THREE.Matrix4();
  bulbs.forEach(([x, y, z], i) => { m4.makeTranslation(x, y, z); bm.setMatrixAt(i, m4); bm.setColorAt(i, lin('#fff0c8').multiplyScalar(2.2)); if (i % 9 === 0) sc.userData.bokeh.push([x, y, z, '#ffe0a0', 0.5]); });
  sc.add(bm); A.bulbs = bm; A.nb = bulbs.length;
  // the neon sign on the canopy + a tall vertical marquee
  const signT = g3Tex((x, w, h) => {
    x.fillStyle = '#0a0408'; x.fillRect(0, 0, w, h);
    x.font = 'italic bold 150px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = '#ff2a7a'; x.shadowBlur = 40; x.fillStyle = '#ffd0e6'; x.fillText('Grand Royal', w / 2, h * 0.44);
    x.shadowColor = '#ffb030'; x.shadowBlur = 24; x.font = 'bold 64px Georgia, serif'; x.fillStyle = '#fff0c0'; x.fillText('★  C A S I N O  ★', w / 2, h * 0.82);
  }, 1024, 320);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), new THREE.MeshBasicMaterial({ map: signT, color: lin('#ffffff').multiplyScalar(2.0), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sign.position.set(0, 6.0, -4.75); sc.add(sign); sc.userData.noMask.push(sign);
  const signBack = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.6, 0.2), caStd({ color: lin('#0d080c'), roughness: 0.5 })); signBack.position.set(0, 6.0, -4.95); sc.add(signBack);
  const vT = g3Tex((x, w, h) => { x.fillStyle = '#12060c'; x.fillRect(0, 0, w, h); x.font = 'bold 110px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#30d8ff'; x.shadowBlur = 30; x.fillStyle = '#d8f8ff'; 'LUCKY'.split('').forEach((ch, i) => x.fillText(ch, w / 2, 90 + i * 150)); }, 256, 840);
  const vs = new THREE.Mesh(new THREE.BoxGeometry(1.3, 4.3, 0.4), [caStd({ color: lin('#120a10') }), caStd({ color: lin('#120a10') }), caStd({ color: lin('#120a10') }), caStd({ color: lin('#120a10') }), new THREE.MeshBasicMaterial({ map: vT, color: lin('#ffffff').multiplyScalar(2) }), caStd({ color: lin('#120a10') })]); vs.position.set(-6.2, 8.2, -9.2); sc.add(vs);
  const vs2 = vs.clone(); vs2.position.x = 6.2; sc.add(vs2);
  // red carpet, rope stanchions, palms with uplights
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 7), caStd({ color: lin('#8a0e18'), roughness: 0.9 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.012, -6.0); sc.add(carpet);
  [-1.4, 1.4].forEach((x) => { for (let i = 0; i < 5; i++) { const z = -8.6 + i * 1.3, post = new THREE.Mesh(caLathe([[0, 0], [0.14, 0], [0.13, 0.03], [0.03, 0.06], [0.025, 0.9], [0.05, 0.95], [0, 1.0]], 18), M.brass); post.position.set(x, 0, z); sc.add(post); if (i < 4) { const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(x, 0.92, z), V3(x, 0.7, z + 0.65), V3(x, 0.92, z + 1.3)), 10, 0.022, 6), caStd({ color: lin('#8a0e18'), roughness: 0.6 })); sc.add(rope); } } });
  const frondT = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#1e3a1a'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke(); for (let i = 0; i < 40; i++) { const X = i / 40 * w, L = h * 0.48 * Math.sin(Math.PI * (0.15 + 0.85 * i / 40)); x.strokeStyle = i % 2 ? '#2f5a26' : '#24481e'; x.lineWidth = 5; x.beginPath(); x.moveTo(X, h / 2); x.lineTo(X + 18, h / 2 - L); x.moveTo(X, h / 2); x.lineTo(X + 18, h / 2 + L); x.stroke(); } }, 512, 128);
  const frondM = caStd({ map: frondT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 });
  const trunkT = caRep(g3Tex((x, w, h) => { x.fillStyle = '#5a4430'; x.fillRect(0, 0, w, h); for (let i = 0; i < h; i += 10) { x.fillStyle = 'rgba(30,20,10,0.6)'; x.fillRect(0, i, w, 3); } }, 64, 256), 1, 4);
  const palm = (px, pz, hgt, key) => {
    const g = new THREE.Group(), R = RNG('ca-palm', key); g.position.set(px, 0, pz);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, hgt, 12, 8), caStd({ map: trunkT, roughness: 0.9 })); const p = tr.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / hgt + 0.5; p.setX(i, p.getX(i) + 0.5 * y * y); } tr.geometry.computeVertexNormals(); tr.position.y = hgt / 2; g.add(tr);
    for (let i = 0; i < 11; i++) { const fr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65, 8, 1), frondM); const fp = fr.geometry.attributes.position; for (let j = 0; j < fp.count; j++) { const xx = fp.getX(j) + 1.3; fp.setY(j, fp.getY(j)); fp.setZ(j, -0.25 * xx * xx); } fr.geometry.computeVertexNormals(); fr.geometry.translate(1.3, 0, 0); fr.rotation.set(R.r(-0.2, 0.3), i / 11 * TAU + R.n(0.2), -0.25); const fg = new THREE.Group(); fg.add(fr); fg.rotation.y = i / 11 * TAU; fr.rotation.set(Math.PI / 2 - 0.3, 0, 0); fg.position.set(0.5, hgt, 0); g.add(fg); }
    sc.add(g); const up = new THREE.SpotLight(lin('#ffd09a'), 2.2, 9, 0.35, 0.6, 1.5); up.position.set(px + 0.4, 0.2, pz + 0.6); up.target.position.set(px + 0.5, hgt, pz); sc.add(up, up.target); sc.userData.bokeh.push([px + 0.4, 0.25, pz + 0.6, '#ffd09a', 0.6]);
  };
  [[-5.2, -5.0, 7], [5.2, -5.0, 7.5], [-8.2, -2.0, 8], [8.4, -2.4, 6.8], [-11.5, 0.5, 7.6], [11.5, 0.0, 8]].forEach(([x, z, h], i) => palm(x, z, h, i));
  // city behind, lit windows
  const winT = caRep(g3Tex((x, w, h) => { const R = RNG('ca-win'); x.fillStyle = '#0c0e18'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) for (let j = 0; j < 32; j++) if (R.f() < 0.45) { x.fillStyle = R.pick(['#ffd890', '#ffe8c0', '#a8d8ff', '#ffc070']); x.fillRect(i * 16 + 3, j * 16 + 4, 9, 8); } }, 256, 512), 2, 2);
  const towM = caStd({ map: winT, emissiveMap: winT, emissive: lin('#ffffff'), emissiveIntensity: 0.9, roughness: 0.6 });
  [[-22, -35, 10, 42], [-8, -40, 12, 58], [9, -38, 10, 50], [24, -33, 12, 38], [-34, -28, 9, 30], [36, -30, 10, 46]].forEach(([x, z, w, h]) => { const t0 = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), towM); t0.position.set(x, h / 2, z); sc.add(t0); });
  // a doorman and two guests heading in
  if (caHasX()) A.xs = [[401, { sex: 'm', outfit: 'uniform', colors: { top: '#5a0f18', shirt: '#f2ece0', tie: '#d8b060' } }, 1.6, -8.6, -20, null], [402, { sex: 'f', outfit: 'dress', makeup: true, colors: { top: '#b3121f' } }, -0.35, -7.4, 180, 0], [403, { sex: 'm', outfit: 'suit', colors: { top: '#121216', shirt: '#f4f1ea', tie: '#0a0a0a' } }, 0.3, -7.5, 180, 0.4]].map(([seed, o, x, z, ry, w]) => ({ X: caX('ar' + seed, seed, o, sc), x, z, ry, w }));
  else { const P = CA.people; [['croupier', 1.6, -8.6, -20], ['red', -0.35, -7.9, 180], ['tux', 0.25, -8.0, 180]].forEach(([k, x, z, ry]) => { const p = P[k].clone(); p.position.set(x, 0, z); p.rotation.y = ry * DEG; sc.add(p); }); }
  // lights
  const moon = new THREE.DirectionalLight(lin('#8aa0ff'), 0.45); moon.position.set(-8, 12, 6); sc.add(moon);
  const hemi = new THREE.HemisphereLight(lin('#2a2c55'), lin('#1a0c10'), 0.45); sc.add(hemi);
  const cl = new THREE.SpotLight(lin('#ffd9a0'), 4, 14, 0.9, 0.6, 1.2); cl.position.set(0, 4.1, -6.5); cl.target.position.set(0, 0, -5); cl.castShadow = true; cl.shadow.mapSize.set(1024, 1024); cl.shadow.radius = 4; cl.shadow.bias = -0.0005; sc.add(cl, cl.target);
  const pink = new THREE.PointLight(lin('#ff3a8a'), 2.2, 14, 1.6); pink.position.set(0, 5.6, -3.5); sc.add(pink);
  const cyan = new THREE.PointLight(lin('#30d0ff'), 1.6, 12, 1.6); cyan.position.set(-6, 7, -7); sc.add(cyan);
  const cyan2 = cyan.clone(); cyan2.position.x = 6; sc.add(cyan2);
  // reflection streaks on the wet ground
  [['#ff4a9a', 0, 2.2, 0.5], ['#ffd080', -2.5, 1.4, 0.4], ['#ffd080', 2.5, 1.4, 0.4], ['#40d8ff', -6.2, 1.2, 0.5], ['#40d8ff', 6.2, 1.2, 0.5]].forEach(([c, x, wd, a]) => { const st = new THREE.Mesh(new THREE.PlaneGeometry(wd, 9), new THREE.MeshBasicMaterial({ map: CA.tex.glow, color: lin(c), transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false })); st.rotation.x = -Math.PI / 2; st.position.set(x, 0.02, -2.5); sc.add(st); sc.userData.noMask.push(st); });
  caGlowSprite(sc, '#ff4a9a', 0, 6, -4.6, 12, 5, 0.25); caGlowSprite(sc, '#ffcf80', 0, 3.8, -7, 10, 4, 0.2);
  sc.userData.bokeh.push([0, 6, -4.7, '#ff7ab8', 1.5], [-6.2, 8.2, -9, '#7ae0ff', 1.4], [6.2, 8.2, -9, '#7ae0ff', 1.4]);
  CA.arr = A; return A;
}
function caArriveShot(g, t, k, u) {
  const A = caArrive(), sc = A.sc; caCharIn(sc);
  const tt = clamp(u, 0, 9), x = 1.9 - 0.22 * tt, z = 2.4 - 0.78 * tt;
  chPose({ pose: 'stand', walk: tt * 0.85, expr: [['amazed', 0.6], ['happy', 0.4]], pos: [x, 0, z], rot: 196, look: [0, -24], add: { neck: [-10, 0, 0], head: [-8, 10, 0] }, t });
  if (A.xs) A.xs.forEach(({ X, x, z, ry, w }, i) => X.pose({ pose: 'stand', expr: 'happy', walk: w == null ? null : t * 0.85 + w, pos: [x, 0, z - (w == null ? 0 : 0.5 * Math.min(u, 6))], rot: ry, t: t + i }));
  const c = new THREE.Color(); for (let i = 0; i < A.nb; i++) { const on = (Math.floor(t * 8) + i) % 3 !== 0 || i < 198; c.copy(lin(on ? '#fff0c8' : '#7a5020')).multiplyScalar(on ? 2.2 : 1); A.bulbs.setColorAt(i, c); } A.bulbs.instanceColor.needsUpdate = true;
  const pk = EZ.io(k);
  shotCam(g, [lerp(5.2, 4.4, pk), lerp(0.7, 1.3, pk), lerp(10.5, 9.0, pk)], [lerp(0.6, 0.2, pk), lerp(3.6, 4.0, pk), -6], 22, 0.8, t);
  caPresent(g, sc, { fd: Math.hypot(x - 4.8, z - 9.7), far: [14, 30], r: 6 }, 0.32, null);
}

// ---------- PHOTOS: the security office, a wall of monitors and his photo on every flyer
function caOffice() {
  if (CA.off) return CA.off;
  const S = caBuild(), r = CA.R.r, g = g3(), c = chBuild(), sc0 = S.scene, Pp = S.place;
  // render the feeds and his photo from the casino floor itself (once)
  caCharIn(sc0); Object.values(Pp).forEach((p) => { p.visible = true; }); P_reset();
  function P_reset() { Pp.guard2.visible = Pp.guard3.visible = false; }
  const shots = [[[-0.36, 1.96, 2.12], [0.12, 1.06, -0.62], 24], [[3.6, 3.6, 3.4], [0.2, 1, -0.8], 22], [[-3.4, 3.8, -4.5], [0.4, 1, -0.6], 26], [[0.56, 1.72, 0.3], [0.56, 1.55, -0.98], 40], [[6.5, 3.6, -1.5], [4, 1, -6], 20], [[-5, 3.4, 2.5], [-1, 1, -2], 20], [[0.8, 3.3, -3.6], [0.4, 1.0, -0.6], 24], [[-2.6, 3.4, 1.8], [-1.06, 0.8, 0], 28]];
  const feeds = shots.map(([p, tg, mm], i) => {
    chPose({ pose: i === 3 ? 'stand' : 'cheer', expr: i === 3 ? 'smug' : 'joy', pos: [0.56, 0, -0.98], rot: -6, look: [0, 0], t: 2 + i, blink: false });
    shotCam(g, p, tg, mm, 0, 2); r.toneMappingExposure = 1; r.setClearColor(lin('#0c0706'), 1); r.clear(); r.render(sc0, g.cam);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288; const x = cv.getContext('2d');
    x.filter = i === 3 ? 'none' : 'grayscale(0.75) sepia(0.25) hue-rotate(60deg) contrast(1.2) brightness(1.05)'; x.drawImage(CA.R.cv, 0, 0, 512, 288); x.filter = 'none';
    if (i !== 3) { x.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < 288; y += 3) x.fillRect(0, y, 512, 1); x.font = 'bold 16px Menlo, monospace'; x.fillStyle = '#e8ffe8'; x.fillText(`CAM ${String(i + 3).padStart(2, '0')}  FLOOR ${'ABCD'[i % 4]}`, 12, 24); x.fillText(`23:4${i}:${String(10 + i * 7).padStart(2, '0')}`, 400, 24); x.fillStyle = '#ff3030'; x.beginPath(); x.arc(20, 270, 6, 0, TAU); x.fill(); x.fillStyle = '#e8ffe8'; x.fillText('REC', 32, 276); }
    return cv;
  });
  const face = feeds[3];
  const sc = caScene({ clear: '#05070a', exposure: 1.0 }), O = { sc }; sc.fog = new THREE.FogExp2(lin('#05070a'), 0.03);
  const wallT = caRep(caTexNoise('offwall', '#2a2e36', 0.08, 256, 2), 6, 3);
  const room = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 7), caStd({ map: wallT, roughness: 0.85, side: THREE.BackSide })); room.position.set(0, 1.7, 0.5); room.receiveShadow = true; sc.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), caStd({ map: caRep(caTexNoise('offfloor', '#1a1c22', 0.1, 256, 2), 8, 8), roughness: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.002, 0.5); floor.receiveShadow = true; sc.add(floor);
  // monitor wall
  const bez = caStd({ color: lin('#0c0d10'), roughness: 0.4, metalness: 0.4 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const fi = [0, 1, 2, 4, 5, 6, 7, 0, 2, 1, 6, 4][i * 3 + j], tx = new THREE.CanvasTexture(feeds[fi]); tx.encoding = THREE.sRGBEncoding;
    const x = -3.5 + i * 0.98, y = 1.25 + j * 0.6;
    const b0 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.57, 0.06), bez); b0.position.set(x, y, -2.94); sc.add(b0);
    const s0 = new THREE.Mesh(new THREE.PlaneGeometry(0.89, 0.5), new THREE.MeshBasicMaterial({ map: tx, color: lin('#ffffff').multiplyScalar(1.15) })); s0.position.set(x, y, -2.905); sc.add(s0);
    sc.userData.bokeh.push([x, y, -2.9, '#a8ffc8', 0.5]);
  }
  // the board: flyers from every casino in town, his face on each
  const cork = caRep(g3Tex((x, w) => { const R = RNG('ca-cork'); x.fillStyle = '#9a6a3c'; x.fillRect(0, 0, w, w); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${R.i(60, 200)},${R.i(40, 140)},${R.i(20, 80)},${R.r(0.2, 0.6)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 3), R.r(1, 3)); } }, 256, 256), 3, 2);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 0.04), caStd({ map: cork, roughness: 0.95 })); board.position.set(1.85, 1.75, -2.95); board.receiveShadow = true; sc.add(board);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.8, 0.03), caStd({ color: lin('#3a2a1a'), roughness: 0.6 })); frame.position.set(1.85, 1.75, -2.975); sc.add(frame);
  const names = ['GRAND ROYAL', 'GOLDEN SANDS', 'LUCKY STAR', 'THE MONARCH', 'SILVER MESA', 'CROWN JEWEL', 'EMERALD PALACE', 'DESERT ROSE', 'THE ORACLE'];
  const R = RNG('ca-flyers');
  names.forEach((nm, i) => {
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 400; const x = cv.getContext('2d');
    x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 300, 400); x.fillStyle = '#141414'; x.fillRect(0, 0, 300, 52); x.fillStyle = '#e8c068'; x.font = 'bold 26px Georgia, serif'; x.textAlign = 'center'; x.fillText(nm, 150, 36);
    x.drawImage(face, 512 * 0.3, 0, 512 * 0.4, 288 * 0.62, 30, 64, 240, 220);
    x.strokeStyle = '#141414'; x.lineWidth = 2; x.strokeRect(30, 64, 240, 220);
    x.fillStyle = '#141414'; x.font = 'bold 18px Arial, sans-serif'; x.fillText('SECURITY ALERT', 150, 312); x.font = '13px Arial, sans-serif'; x.fillText('Advantage player · 40 in a row', 150, 334);
    x.save(); x.translate(150, 190); x.rotate(-0.32 + R.n(0.1)); x.strokeStyle = '#d0141e'; x.lineWidth = 6; x.strokeRect(-128, -30, 256, 60); x.fillStyle = '#d0141e'; x.font = 'bold 34px Arial, sans-serif'; x.fillText('DO NOT ADMIT', 0, 12); x.restore();
    x.fillStyle = 'rgba(120,90,40,0.12)'; x.fillRect(0, 360, 300, 40);
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8;
    const col = i % 3, row = Math.floor(i / 3), big = i === 4;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(big ? 0.62 : 0.5, big ? 0.83 : 0.66), caStd({ map: tx, roughness: 0.8 }));
    fl.position.set(1.05 + col * 0.8 + R.n(0.05), 2.28 - row * 0.52 + R.n(0.04), -2.92 + (big ? 0.012 : 0.004 * i)); fl.rotation.z = R.n(0.07); fl.castShadow = true; sc.add(fl);
    const pin = new THREE.Mesh(CA.geo.sph, caStd({ color: lin('#c8141e'), roughness: 0.3 })); pin.scale.setScalar(0.014); pin.position.set(fl.position.x, fl.position.y + (big ? 0.37 : 0.29), fl.position.z + 0.012); sc.add(pin);
  });
  // desk, keyboards, coffee, a guard watching
  const desk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 0.9), caStd({ color: lin('#2a2c32'), roughness: 0.5, metalness: 0.3 })); desk.position.set(-1.6, 0.76, -2.3); desk.castShadow = desk.receiveShadow = true; sc.add(desk);
  const dk2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.72, 0.1), caStd({ color: lin('#1a1c20') })); dk2.position.set(-1.6, 0.38, -2.7); sc.add(dk2);
  for (let i = 0; i < 4; i++) { const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.15), caStd({ color: lin('#16171a'), roughness: 0.6 })); kb.position.set(-3.4 + i * 1.1, 0.8, -2.1); sc.add(kb); }
  const cup = new THREE.Mesh(caLathe([[0, 0], [0.04, 0], [0.045, 0.1], [0.04, 0.1], [0.036, 0.008], [0, 0.008]], 20), caStd({ color: lin('#f2ede2'), roughness: 0.3 })); cup.position.set(-0.4, 0.79, -2.05); sc.add(cup);
  if (caHasX()) { O.gd = caX('of-gd', 501, { sex: 'm', build: 'heavy', outfit: 'uniform', colors: { top: '#1a2030', shirt: '#dfe3ea', tie: '#1a1a1a' } }, sc); } else { const gd = CA.people.guard.clone(); gd.position.set(-1.9, 0, -1.55); gd.rotation.y = 180 * DEG; sc.add(gd); }
  const lampL = new THREE.SpotLight(lin('#ffcf90'), 2.6, 5, 0.6, 0.7, 1.4); lampL.position.set(1.85, 3.2, -1.6); lampL.target.position.set(1.85, 1.6, -2.9); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.radius = 4; sc.add(lampL, lampL.target);
  const mon = new THREE.PointLight(lin('#7affc0'), 1.4, 6, 1.6); mon.position.set(-2.1, 1.7, -1.8); sc.add(mon);
  const hemi = new THREE.HemisphereLight(lin('#30384a'), lin('#0a0a0c'), 0.35); sc.add(hemi);
  const fill = new THREE.DirectionalLight(lin('#9ab0d0'), 0.25); fill.position.set(2, 2, 4); sc.add(fill);
  caGlowSprite(sc, '#7affc0', -2.0, 1.85, -2.6, 5, 2.4, 0.12);
  CA.off = O; return O;
}
function caPhotosShot(g, t, k) {
  const O = caOffice(), pk = EZ.io(k); if (O.gd) O.gd.pose({ pose: 'hold', expr: 'neutral', pos: [-1.9, 0, -1.55], rot: 180, t });
  shotCam(g, [lerp(0.2, 1.3, pk), lerp(1.65, 1.78, pk), lerp(2.6, 0.9, pk)], [lerp(0.4, 1.75, pk), lerp(1.65, 1.82, pk), -2.9], 28, 0.7, t);
  caPresent(g, O.sc, { fd: lerp(5.4, 3.8, pk), far: [lerp(7, 4.8, pk), 9], near: [0.4, 0.9], r: 8 }, 0.28, { sat: 0.9, con: 1.06, grain: 0.06, vig: 0.7 });
}

// ---------- STADIUM: home stand (him, scarf, the crowd erupting) and the away stand (empty, devastated)
function caFanGeo(up) {
  const parts = [];
  const add = (g, x, y, z, rx = 0, rz = 0) => { g.rotateX(rx); g.rotateZ(rz); g.translate(x, y, z); if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]); g.deleteAttribute && g.attributes.uv && 0; parts.push(g); };
  add(new THREE.CapsuleGeometry(0.14, 0.36, 4, 10), 0, 0.8, 0); add(new THREE.CapsuleGeometry(0.06, 0.06, 3, 8), 0, 1.2, 0);
  [1, -1].forEach((s) => add(new THREE.CapsuleGeometry(0.04, 0.4, 3, 6), s * 0.2, up ? 1.42 : 0.86, up ? 0.04 : 0.05, 0, up ? s * -0.22 : s * 0.1));
  parts.forEach((p) => { if (p.attributes.color) p.deleteAttribute('color'); });
  return chMerge(parts.map((p) => { p.deleteAttribute('uv'); p.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.attributes.position.count * 2), 2)); return p; }));
}
function caStadium() {
  if (CA.std) return CA.std;
  const sc = caScene({ clear: '#05070e', exposure: 1.0 }), D = { sc }, M = CA.mat;
  sc.fog = new THREE.FogExp2(lin('#0b1020'), 0.012);
  caSkyDome(sc, caTexSky('#02030a', '#0a1028', '#1a2240', 120));
  const concrete = caStd({ map: caRep(caTexNoise('conc', '#7a7a7e', 0.12, 256, 2), 20, 8), roughness: 0.9 });
  const stand = (ox, seatCol, key) => {
    const g = new THREE.Group(); g.position.x = ox; sc.add(g);
    const prof = new THREE.Shape(); prof.moveTo(0.6, 0); prof.lineTo(0.6, 1.2);
    for (let i = 0; i < 24; i++) { prof.lineTo(-i * 0.85, 1.2 + i * 0.42); prof.lineTo(-(i + 1) * 0.85, 1.2 + i * 0.42); }
    prof.lineTo(-24 * 0.85, 0); prof.lineTo(0.6, 0);
    const geo = new THREE.ExtrudeGeometry(prof, { depth: 44, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(22, 0, 0);
    const st = new THREE.Mesh(geo, concrete); st.receiveShadow = true; g.add(st);
    // seats
    const seatG = new THREE.BoxGeometry(0.46, 0.42, 0.08); seatG.translate(0, 0.32, -0.18);
    const seat2 = new THREE.BoxGeometry(0.46, 0.06, 0.38); seat2.translate(0, 0.42, 0.0);
    const sg = chMerge([seatG, seat2].map((p) => p));
    const n = 24 * 72, seats = new THREE.InstancedMesh(sg, caStd({ color: lin(seatCol), roughness: 0.5 }), n), m4 = new THREE.Matrix4(); let i = 0;
    for (let rI = 0; rI < 24; rI++) for (let cI = 0; cI < 72; cI++) { m4.makeTranslation(-19.6 + cI * 0.55, 1.2 + rI * 0.42, -rI * 0.85 - 0.45); seats.setMatrixAt(i++, m4); }
    g.add(seats);
    // roof + floodlight bank
    const roof = new THREE.Mesh(new THREE.BoxGeometry(46, 0.6, 16), caStd({ color: lin('#1a1c22'), roughness: 0.7, metalness: 0.4 })); roof.position.set(0, 14.4, -9); g.add(roof);
    for (let f = 0; f < 18; f++) { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), caBasic('#eef4ff', 3)); fl.rotation.x = Math.PI / 2 + 0.5; fl.position.set(-19 + f * 2.25, 14.0, -1.2); g.add(fl); sc.userData.bokeh.push([ox - 19 + f * 2.25, 14.0, -1.2, '#e8f0ff', 1.6]); }
    // LED advertising board along the front
    const led = g3Tex((x, w, h) => { x.fillStyle = '#05060a'; x.fillRect(0, 0, w, h); const ads = key === 'home' ? ['GRAND ROYAL', '★ LUCKY BET ★', 'ROYAL AIR', 'GO REDS!'] : ['VISITORS', 'AWAY END', 'BLUE ARMY', 'NEVER GIVE UP']; ads.forEach((a, j) => { x.fillStyle = ['#ff3a3a', '#ffd34d', '#33d6ff', '#ffffff'][j]; x.font = 'bold 54px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(a, (j + 0.5) * w / 4, h / 2); }); x.fillStyle = 'rgba(0,0,0,0.35)'; for (let X = 0; X < w; X += 4) x.fillRect(X, 0, 1, h); for (let Y = 0; Y < h; Y += 4) x.fillRect(0, Y, w, 1); }, 2048, 128);
    led.wrapS = THREE.RepeatWrapping; led.repeat.set(2, 1);
    const ledM = new THREE.MeshBasicMaterial({ map: led, color: lin('#ffffff').multiplyScalar(1.6) }); const lb = new THREE.Mesh(new THREE.PlaneGeometry(44, 0.9), ledM); lb.position.set(0, 0.75, 1.2); g.add(lb);
    const lbk = new THREE.Mesh(new THREE.BoxGeometry(44, 0.95, 0.15), caStd({ color: lin('#0a0a0c') })); lbk.position.set(0, 0.75, 1.1); g.add(lbk);
    return { g, seats, ledM };
  };
  D.home = stand(0, '#b0141e', 'home'); D.away = stand(80, '#1f3f9a', 'away');
  // pitch in front
  const pitchT = caRep(g3Tex((x, w, h) => { const R = RNG('ca-pitch'); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2f7a32' : '#378a3a'; x.fillRect(0, i * h / 8, w, h / 8); } for (let i = 0; i < 20000; i++) { x.fillStyle = `rgba(${R.i(0, 60)},${R.i(60, 140)},${R.i(0, 50)},0.25)`; x.fillRect(R.r(0, w), R.r(0, h), 1, 3); } }, 256, 256), 30, 6);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), caStd({ map: pitchT, roughness: 0.9 })); pitch.rotation.x = -Math.PI / 2; pitch.position.set(40, 0, 32); pitch.receiveShadow = true; sc.add(pitch);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.12), caBasic('#e8eef0', 1)); line.rotation.x = -Math.PI / 2; line.position.set(40, 0.01, 4.2); sc.add(line);
  // fans (instanced): home = red, cheering; away = few, blue, slumped
  const gUp = caFanGeo(true), gDn = caFanGeo(false), R = RNG('ca-fans');
  const fanM = caStd({ roughness: 0.75 }), headM = caStd({ roughness: 0.6 });
  const mk = (geo, n) => { const b = new THREE.InstancedMesh(geo, fanM.clone(), n); b.frustumCulled = false; sc.add(b); return b; };
  D.homeFans = []; D.homeBody = mk(gUp, 24 * 72); D.homeBody.castShadow = false;
  const headG = new THREE.SphereGeometry(0.1, 14, 10); D.homeHead = new THREE.InstancedMesh(headG, headM, 24 * 72); D.homeHead.frustumCulled = false; sc.add(D.homeHead); D.awayHead = new THREE.InstancedMesh(headG, headM, 560); D.awayHead.frustumCulled = false; sc.add(D.awayHead);
  for (let rI = 0; rI < 24; rI++) for (let cI = 0; cI < 72; cI++) { if (R.f() < 0.06) continue; if (rI < 3 && Math.abs(cI - 36) < 7) continue; D.homeFans.push([-19.6 + cI * 0.55 + R.n(0.05), 1.2 + rI * 0.42, -rI * 0.85 - 0.55, R.r(0, TAU), R.r(0.9, 1.08), R.f() < 0.75]); }
  D.homeFans.forEach((f, i) => { D.homeBody.setColorAt(i, lin(R.f() < 0.62 ? R.pick(['#a8121a', '#c41820', '#8e1016']) : R.pick(['#e8e4da', '#1a1a1e', '#3a3a44']))); D.homeHead.setColorAt(i, lin(R.pick(['#e8b48e', '#c98c63', '#8d5a3b', '#f0c4a4', '#5a3a2a']))); });
  D.homeBody.count = D.homeHead.count = D.homeFans.length;
  D.awayFans = []; D.awayBody = mk(gDn, 560);
  for (let i = 0; i < 560; i++) { const rI = Math.min(23, Math.floor(Math.pow(R.f(), 1.4) * 24)), cI = R.i(2, 70); D.awayFans.push([80 - 19.6 + cI * 0.55, 1.2 + rI * 0.42, -rI * 0.85 - 0.55, R.r(0, TAU), R.r(0.9, 1.05), false]); D.awayBody.setColorAt(i, lin(R.pick(['#1f3fa0', '#2a4fd0', '#d8d8dc']))); D.awayHead.setColorAt(i, lin(R.pick(['#e8b48e', '#c98c63', '#8d5a3b', '#f0c4a4']))); }
  // flares and smoke in the home end
  [[-6, 4], [7, 6], [-12, 9], [3, 12]].forEach(([x, rI], i) => { const y = 1.2 + rI * 0.42 + 1.5, z = -rI * 0.85 - 0.5; const fl = new THREE.Mesh(CA.geo.sph, caBasic('#ff5a3a', 4)); fl.scale.setScalar(0.06); fl.position.set(x, y, z); sc.add(fl); caGlowSprite(sc, '#ff4a2a', x, y + 0.5, z, 4, 4, 0.45); caGlowSprite(sc, '#ff8a6a', x + 0.8, y + 2.2, z - 0.5, 7, 5, 0.12); sc.userData.bokeh.push([x, y, z, '#ff6a3a', 1.4]); const pl = new THREE.PointLight(lin('#ff4a20'), 1.2, 8, 1.6); pl.position.set(x, y + 0.3, z + 0.3); sc.add(pl); });
  // giant screen
  const scrT = g3Tex((x, w, h) => { x.fillStyle = '#05060a'; x.fillRect(0, 0, w, h); const gr = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6); gr.addColorStop(0, '#c8141e'); gr.addColorStop(1, '#2a0408'); x.fillStyle = gr; x.fillRect(8, 8, w - 16, h - 16); x.font = 'italic bold 150px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff6d8'; x.fillText('GOAL!', w / 2, h * 0.42); x.font = 'bold 56px Arial, sans-serif'; x.fillText('REDS 1 – 0 BLUES', w / 2, h * 0.8); }, 1024, 400);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.9), new THREE.MeshBasicMaterial({ map: scrT, color: lin('#ffffff').multiplyScalar(1.6) })); scr.position.set(3, 11.6, -6); sc.add(scr); sc.userData.bokeh.push([3, 11.6, -6, '#ff5050', 2]); D.scr = scr;
  // lights
  const flood = new THREE.DirectionalLight(lin('#e8f0ff'), 1.4); flood.position.set(10, 30, 30); flood.castShadow = true; flood.shadow.mapSize.set(2048, 2048); Object.assign(flood.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 90 }); flood.shadow.radius = 3; flood.target.position.set(0, 2, -3); sc.add(flood, flood.target); D.flood = flood;
  const hemi = new THREE.HemisphereLight(lin('#7080b0'), lin('#2a3a20'), 0.55); sc.add(hemi); D.hemi = hemi;
  const warm = new THREE.SpotLight(lin('#ffd2a0'), 1.6, 16, 0.4, 0.6, 1.2); warm.position.set(3, 6, 8); warm.target.position.set(0, 2.5, -0.4); sc.add(warm, warm.target); D.warm = warm;
  D.scarf = caScarf(sc, '#c8141e', '#f2f0ea');
  const red = { suit: '#b8141c', shirt: '#f2f0ea', pants: '#20242c', shoe: '#101010', hatc: '#c8141e' };
  const hf = [
    [{ kind: 'm', outfit: 'jersey', c: { ...red, skin: '#e8b48e', hair: '#3a2416' }, arms: { L: 'up', R: 'up' }, face: 'gasp', hair: 'short', look: [0, 8] }, [-1.2, 0]],
    [{ kind: 'f', pants: true, c: { ...red, skin: '#c98c63', hair: '#1a100a', dress: '#b8141c' }, arms: { L: 'wave', R: 'up' }, face: 'smile', hair: 'long', sleeves: true, highNeck: true, look: [10, 8] }, [1.15, 0]],
    [{ kind: 'm', outfit: 'jersey', belly: true, c: { ...red, skin: '#f0c4a4', hair: '#c9c4bc' }, arms: { L: 'up', R: 'wave' }, face: 'gasp', hair: 'grey', hat: 'beanie', look: [-6, 10] }, [-0.55, 1]],
    [{ kind: 'm', outfit: 'jersey', c: { ...red, suit: '#f2f0ea', shirt: '#b8141c', skin: '#8d5a3b', hair: '#111' }, arms: { L: 'up', R: 'up' }, face: 'smile', hair: 'buzz', look: [6, 10] }, [0.6, 1]],
    [{ kind: 'f', pants: true, c: { ...red, skin: '#f0c4a4', hair: '#d8b06a', dress: '#b8141c' }, arms: { L: 'mouth', R: 'up' }, face: 'gasp', hair: 'bob', sleeves: true, highNeck: true, look: [0, 8] }, [-2.3, 1]],
    [{ kind: 'm', outfit: 'jersey', c: { ...red, skin: '#e8b48e', hair: '#5a2a14' }, arms: { L: 'wave', R: 'up' }, face: 'smile', hair: 'side', hat: 'beanie', look: [0, 10] }, [2.2, 1]],
  ];
  D.hf = [];
  if (caHasX()) { D.xs = [[-1.2, 0], [1.15, 0], [-0.55, 1], [0.6, 1], [-2.3, 1], [2.2, 1], [-1.7, 2], [1.7, 2], [0.0, 2], [-2.9, 0], [3.0, 0], [-3.4, 2], [3.4, 2]].map(([x, rI], i) => ({ X: caX('sh' + i, 300 + i, { outfit: 'jersey', colors: { top: i % 4 === 3 ? '#f2f0ea' : '#c8102e', top2: i % 4 === 3 ? '#c8102e' : '#ffffff' } }, sc), x, rI })); }
  else hf.forEach(([o, [x, rI]]) => { const p = caPerson(o); D.hf.push(p); });
  D.hfAll = []; if (!D.xs) [[-1.2, 0], [1.15, 0], [-0.55, 1], [0.6, 1], [-2.3, 1], [2.2, 1], [-1.7, 2], [1.7, 2], [0.0, 2], [-2.9, 0], [3.0, 0], [-3.4, 2], [3.4, 2]].forEach(([x, rI], i) => { const p = i < 6 ? D.hf[i] : D.hf[i % 6].clone(); p.position.set(x + (i < 6 ? 0 : 0.2), 1.2 + rI * 0.42, -rI * 0.85 - 0.5); p.rotation.y = (i * 37 % 20 - 10) * DEG; p.userData.bob = i * 1.7; if (i >= 6) sc.add(p); else sc.add(p); (D.hfAll = D.hfAll || []).push(p); }); sc.userData.noMask.push();
  // devastated away fans in front rows (sculpted)
  const blue = { skin: '#e8b48e', hair: '#3a2416', suit: '#1f3fa0', shirt: '#f2f0ea', pants: '#20242c', shoe: '#101010', hatc: '#1f3fa0' };
  D.sad = [
    [{ kind: 'm', outfit: 'jersey', c: blue, arms: { L: 'head', R: 'head' }, lean: 14, face: 'sad', hair: 'short', look: [0, 24] }, [80 - 1.6, 1, 8]],
    [{ kind: 'm', outfit: 'jersey', c: { ...blue, skin: '#8d5a3b', hair: '#111' }, arms: { L: 'face', R: 'face' }, lean: 22, face: 'sad', hair: 'buzz', hat: 'beanie', look: [0, 30] }, [80 + 0.9, 0, -6]],
    [{ kind: 'f', c: { ...blue, skin: '#f0c4a4', hair: '#c89a5a', dress: '#1f3fa0' }, pants: true, arms: { L: 'chest', R: 'mouth' }, lean: 6, face: 'sad', hair: 'long', sleeves: true, highNeck: true, look: [10, 14] }, [80 + 2.6, 2, 4]],
    [{ kind: 'm', outfit: 'jersey', belly: true, c: { ...blue, skin: '#f0c4a4', hair: '#c9c4bc' }, arms: { L: 'down', R: 'down' }, lean: 8, face: 'sad', hair: 'grey', look: [-6, 26] }, [80 - 3.8, 3, -10]],
    ...(caHasX() ? [[null, [80 - 0.4, 3, 4]], [null, [80 + 4.2, 1, -8]], [null, [80 - 2.6, 5, 6]], [null, [80 + 1.8, 4, -4]], [null, [80 - 5.4, 1, 10]], [null, [80 + 5.6, 4, 2]]] : []),
  ].map(([o, [x, rI, ry]], i) => { if (caHasX()) { const X = caX('sad' + i, 320 + i, { outfit: i % 3 === 2 ? 'casual' : 'jersey', sex: i % 3 === 2 ? 'f' : undefined, colors: i % 3 === 2 ? { top: '#2a4fd0' } : { top: '#1d428a', top2: '#ffffff' } }, sc); (D.sadX = D.sadX || []).push({ X, x, y: 1.2 + rI * 0.42, z: -rI * 0.85 - 0.55, ry, i }); return X.root; } const p = caPerson(o); p.position.set(x, 1.2 + rI * 0.42, -rI * 0.85 - 0.55); p.rotation.y = ry * DEG; sc.add(p); return p; });
  const rainG = new THREE.BufferGeometry(), rp = new Float32Array(900 * 6), RR = RNG('ca-rain'); D.rain0 = []; for (let i = 0; i < 900; i++) D.rain0.push([RR.r(70, 92), RR.r(0, 16), RR.r(-14, 6), RR.r(0, 1)]);
  rainG.setAttribute('position', new THREE.BufferAttribute(rp, 3)); D.rain = new THREE.LineSegments(rainG, new THREE.LineBasicMaterial({ color: lin('#9ab0d0'), transparent: true, opacity: 0.35 })); D.rain.frustumCulled = false; sc.add(D.rain); sc.userData.noMask.push(D.rain);
  CA.std = D; return D;
}
function caStadiumShot(g, t, k, u, away) {
  const D = caStadium(), sc = D.sc, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const cel = away ? 0 : ss(0.12, 0.2, k);
  D.homeFans.forEach(([x, y, z, ph, s, up], i) => { const j = cel * Math.max(0, Math.sin(t * 7 + ph)) * 0.22; e.set(0, 0.12 * Math.sin(ph), 0); m4.compose(V3(x, y + j, z), q.setFromEuler(e), V3(s, s, s)); D.homeBody.setMatrixAt(i, m4); m4.compose(V3(x, y + j + 1.36 * s, z + 0.01), q, V3(s, s * 1.1, s)); D.homeHead.setMatrixAt(i, m4); });
  D.homeBody.instanceMatrix.needsUpdate = true; D.homeHead.instanceMatrix.needsUpdate = true;
  D.awayFans.forEach(([x, y, z, ph, s], i) => { e.set(0.35, 0.2 * Math.sin(ph), 0); m4.compose(V3(x, y, z), q.setFromEuler(e), V3(s, s * 0.92, s)); D.awayBody.setMatrixAt(i, m4); m4.compose(V3(x, y + 1.18 * s, z + 0.4 * s), q, V3(s, s * 1.1, s)); D.awayHead.setMatrixAt(i, m4); });
  D.awayBody.instanceMatrix.needsUpdate = true; D.awayHead.instanceMatrix.needsUpdate = true;
  D.homeFans.forEach((f, i) => {});
  D.home.ledM.map.offset.x = t * 0.03; D.away.ledM.map.offset.x = -t * 0.01;
  D.rain.visible = !!away; D.scarf.visible = !away;
  if (D.sadX) D.sadX.forEach(({ X }) => { X.root.visible = !!away; }); if (D.xs) D.xs.forEach(({ X }) => { X.root.visible = !away; });
  if (!away) {
    const c = caCharIn(sc);
    chPose({ pose: cel > 0.5 ? 'cheer' : [['stand', 0.6], ['hold', 0.4]], expr: cel > 0.5 ? 'joy' : 'happy', pos: [0, 1.2, -0.5], rot: 0, look: [0, 6], t });
    D.scarf.matrixAutoUpdate = false; c.root.updateMatrixWorld(true); D.scarf.matrix.copy(c.neck.matrixWorld).multiply(new THREE.Matrix4().makeTranslation(0, 0.0, 0.0)); D.scarf.matrixWorldNeedsUpdate = true;
    if (D.xs) D.xs.forEach(({ X, x, rI }, i) => X.pose({ pose: cel > 0.5 ? (i % 3 === 2 ? [['cheer', 0.6], ['shock', 0.4]] : 'cheer') : 'stand', expr: cel > 0.5 ? (i % 2 ? 'joy' : 'amazed') : 'happy', hand: { L: 'fist', R: i % 2 ? 'open' : 'fist' }, pos: [x, 1.2 + rI * 0.42 + cel * 0.12 * Math.max(0, Math.sin(t * 7 + i * 1.7)), -rI * 0.85 - 0.5], rot: (i * 37 % 20 - 10), look: [0, 8], t: t + i }));
    D.hfAll.forEach((p) => { p.position.y = 1.2 + Math.round((-p.position.z - 0.5) / 0.85) * 0.42 + cel * 0.14 * Math.max(0, Math.sin(t * 7 + p.userData.bob)); });
    D.scr.visible = cel > 0.3 && Math.sin(t * 6) > -0.6; D.flood.intensity = 1.4; D.hemi.intensity = 0.55; D.warm.intensity = 1.6;
    const pk = EZ.io(k);
    shotCam(g, [lerp(1.5, 1.0, pk), lerp(2.55, 2.65, pk), lerp(9.0, 8.2, pk)], [0, 2.75, -1.2], 52, 1.2, t);
    caPresent(g, sc, { fd: 8.8, far: [10.2, 16], near: [5, 7.5], r: 13 }, 0.34, { sat: 1.05, con: 1.04, vig: 0.5 });
  } else {
    const c = chBuild(); if (c.root.parent === sc) sc.remove(c.root);
    if (D.sadX) D.sadX.forEach(({ X, x, y, z, ry, i }) => X.pose({ pose: 'sad', expr: 'sad', pos: [x, y, z], rot: ry, t: t + i, add: i % 4 === 1 ? { shL: [-60, 0, 30], elL: [-120, 40, 0], shR: [-60, 0, -30], elR: [-120, -40, 0], head: [20, 0, 0] } : { head: [12 + (i % 3) * 4, (i % 5 - 2) * 6, 0] }, sitY: i % 4 === 3 ? 0 : undefined, pose2: 0 }));
    D.scr.visible = false; D.flood.intensity = 0.8; D.hemi.intensity = 0.4; D.warm.intensity = 0;
    const a = D.rain.geometry.attributes.position; D.rain0.forEach(([x, y0, z, ph], i) => { const y = 16 - ((y0 + t * 9 + ph * 16) % 16); a.setXYZ(i * 2, x, y, z); a.setXYZ(i * 2 + 1, x - 0.05, y - 0.35, z + 0.02); }); a.needsUpdate = true;
    const pk = EZ.io(k);
    shotCam(g, [lerp(80.9, 80.4, pk), lerp(2.9, 3.0, pk), lerp(7.6, 6.8, pk)], [80, 3.15, -2.2], 36, 0.8, t);
    caPresent(g, sc, { fd: 8.6, far: [12, 22], near: [4, 7], r: 10 }, 0.22, { sat: 0.6, con: 1.05, br: 0.95, tint: ['#203050', 0.35], vig: 0.7 });
  }
}

// ---------- PLANE: a cabin in a storm, everyone calm, him relaxed
function caPlane() {
  if (CA.pl) return CA.pl;
  const sc = caScene({ clear: '#0a0c12', exposure: 1.0 }), L = { sc }, M = CA.mat;
  const sec = [[-1.75, 0], [1.75, 0], [1.95, 0.6], [1.92, 1.3], [1.62, 1.86], [1.1, 2.16], [0, 2.26], [-1.1, 2.16], [-1.62, 1.86], [-1.92, 1.3], [-1.95, 0.6]];
  const shell = new THREE.ExtrudeGeometry(new THREE.Shape(sec.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 16, bevelEnabled: false, curveSegments: 6 }); shell.translate(0, 0, -12);
  const wallT = caRep(g3Tex((x, w, h) => { x.fillStyle = '#e8e2d6'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,110,95,0.35)'; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } const R = RNG('ca-cab'); for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(0,0,0,${R.r(0, 0.04)})`; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 256, 256), 0.6, 0.6);
  const cab = new THREE.Mesh(shell, caStd({ map: wallT, roughness: 0.6, side: THREE.BackSide })); cab.receiveShadow = true; sc.add(cab);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 16), caStd({ map: caRep(g3Tex((x, w) => { const R = RNG('ca-ccarp'); x.fillStyle = '#2a2f4a'; x.fillRect(0, 0, w, w); for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(${R.i(60, 140)},${R.i(60, 140)},${R.i(120, 200)},0.25)`; x.fillRect(R.r(0, w), R.r(0, w), 2, 2); } }, 128, 128), 6, 30), roughness: 1 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.005, -4); sc.add(carpet);
  // overhead bins + LED strip
  [1, -1].forEach((s) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 16), caStd({ color: lin('#efeae0'), roughness: 0.45 })); b.position.set(s * 1.28, 1.76, -4); b.rotation.z = s * 0.25; b.castShadow = true; sc.add(b); const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 16), caBasic('#9aa8ff', 2.2)); st.position.set(s * 0.9, 1.55, -4); sc.add(st); });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 16), caBasic('#b8b0ff', 0.7)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 2.2, -4); sc.add(ceil);
  // windows with the storm outside
  const stormT = g3Tex((x, w, h) => { const R = RNG('ca-storm'); const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a2234'); gr.addColorStop(1, '#3a4252'); x.fillStyle = gr; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${R.i(20, 90)},${R.i(30, 100)},${R.i(50, 120)},${R.r(0.2, 0.5)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, h), R.r(20, 70), R.r(10, 30), 0, 0, TAU); x.fill(); } x.strokeStyle = 'rgba(220,230,255,0.9)'; x.lineWidth = 2; x.beginPath(); let X = w * 0.6, Y = 0; x.moveTo(X, Y); while (Y < h * 0.8) { X += R.n(14); Y += R.r(8, 20); x.lineTo(X, Y); } x.stroke(); }, 256, 256);
  L.winM = new THREE.MeshBasicMaterial({ map: stormT, color: lin('#ffffff') });
  const frameG = new THREE.TorusGeometry(0.16, 0.035, 8, 24);
  for (let i = 0; i < 18; i++) [1, -1].forEach((s) => { const z = 3 - i * 0.82, w0 = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), L.winM); w0.scale.y = 1.4; w0.position.set(s * 1.9, 1.15, z); w0.rotation.y = -s * Math.PI / 2; sc.add(w0); const fr = new THREE.Mesh(frameG, caStd({ color: lin('#d8d2c6'), roughness: 0.4 })); fr.scale.y = 1.4; fr.position.set(s * 1.88, 1.15, z); fr.rotation.y = -s * Math.PI / 2; sc.add(fr); });
  // seats (instanced) + headrest covers
  const sp = new THREE.Shape([[-0.25, 0.42], [0.22, 0.42], [0.24, 0.5], [-0.2, 0.52], [-0.28, 1.15], [-0.2, 1.2], [-0.14, 1.18], [-0.08, 0.6], [0.22, 0.56], [0.26, 0.42]].map(([a, b]) => new THREE.Vector2(a, b)));
  const seatG = new THREE.ExtrudeGeometry(new THREE.Shape([[-0.06, 0.4], [0.42, 0.4], [0.44, 0.52], [0.0, 0.54], [-0.02, 1.16], [-0.1, 1.2], [-0.16, 1.14], [-0.14, 0.42]].map(([a, b]) => new THREE.Vector2(a, b))), { depth: 0.46, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 });
  seatG.rotateY(Math.PI / 2); seatG.translate(-0.23, 0, 0);
  const fabric = caRep(g3Tex((x, w) => { const R = RNG('ca-seatfab'); x.fillStyle = '#1c2a52'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 3) for (let j = 0; j < w; j += 3) { x.fillStyle = `rgba(255,255,255,${R.r(0, 0.06)})`; x.fillRect(i, j, 2, 2); } }, 64, 64), 6, 6);
  const rows = 14, cols = [-1.52, -1.06, -0.6, 0.6, 1.06, 1.52];
  const seats = new THREE.InstancedMesh(seatG, caStd({ map: fabric, roughness: 0.85 }), rows * 6), covers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.22, 0.03), caStd({ color: lin('#f2f0ea'), roughness: 0.7 }), rows * 6), m4 = new THREE.Matrix4(); let n = 0;
  for (let r = 0; r < rows; r++) cols.forEach((x) => { const z = 2.0 - r * 0.86; m4.makeTranslation(x, 0, z); seats.setMatrixAt(n, m4); m4.makeTranslation(x, 1.07, z + 0.135); covers.setMatrixAt(n, m4); n++; });
  seats.castShadow = seats.receiveShadow = true; sc.add(seats, covers);
  // calm passengers (seated sculpts)
  const pas = [
    [{ kind: 'm', outfit: 'suit', sit: true, c: { skin: '#e8b48e', hair: '#3a2416', suit: '#3a3e48', shirt: '#eef0f2', tie: '#6a1a20', pants: '#2a2c32', shoe: '#101010' }, arms: { L: 'lap', R: 'lap' }, face: 'smile', hair: 'side', look: [10, 6] }, [-1.06, 1]],
    [{ kind: 'f', sit: true, c: { skin: '#f0c4a4', hair: '#5a2a14', dress: '#7a3a5a', pants: '#2a2030', shoe: '#101010' }, arms: { L: 'lap', R: 'armrest' }, face: 'smile', hair: 'bob', sleeves: true, highNeck: true, look: [0, 4], tilt: 10 }, [0.6, 1]],
    [{ kind: 'm', outfit: 'jersey', sit: true, c: { skin: '#8d5a3b', hair: '#111', suit: '#2a6a4a', shirt: '#e8e2d2', pants: '#2a2c32', shoe: '#101010' }, arms: { L: 'armrest', R: 'lap' }, face: 'smile', hair: 'buzz', look: [-14, 0] }, [1.06, 2]],
    [{ kind: 'f', sit: true, c: { skin: '#c98c63', hair: '#1a100a', dress: '#c8a040', pants: '#2a2030', shoe: '#101010' }, arms: { L: 'lap', R: 'lap' }, face: 'smile', hair: 'long', sleeves: true, highNeck: true, look: [20, 10] }, [-1.52, 2]],
    [{ kind: 'm', outfit: 'suit', sit: true, belly: true, c: { skin: '#f0c4a4', hair: '#c9c4bc', suit: '#5a4a3a', shirt: '#eef0f2', tie: '#2a3a6a', pants: '#3a3020', shoe: '#101010' }, arms: { L: 'lap', R: 'lap' }, face: 'smile', hair: 'grey', look: [0, 14], tilt: -8 }, [-0.6, 3]],
    [{ kind: 'f', sit: true, c: { skin: '#e8b48e', hair: '#d8b06a', dress: '#3a5a8a', pants: '#2a2030', shoe: '#101010' }, arms: { L: 'armrest', R: 'lap' }, face: 'smile', hair: 'long', sleeves: true, highNeck: true, look: [-10, 0] }, [1.52, 0]],
  ];
  if (caHasX()) { L.xs = [[201, { sex: 'm', outfit: 'suit' }, -1.06, 1, 'happy', [14, 4]], [202, { sex: 'f', outfit: 'casual' }, 0.6, 1, 'neutral', [-8, 10]], [203, { sex: 'm', outfit: 'casual', age: 'old' }, 1.06, 2, 'happy', [-16, 0]], [204, { sex: 'f', outfit: 'casual' }, -1.52, 2, 'neutral', [20, 14]], [205, { sex: 'm', outfit: 'tee', age: 'young' }, -0.6, 3, 'happy', [0, 16]], [206, { sex: 'f', outfit: 'suit' }, 1.52, 0, 'neutral', [-10, 0]], [207, { sex: 'm', outfit: 'casual' }, 0.6, 2, 'neutral', [6, 20]], [208, { sex: 'f', outfit: 'tee', age: 'old' }, -1.06, 3, 'happy', [0, 6]]].map(([seed, o, x, r, ex, lk]) => ({ X: caX('pl' + seed, seed, o, sc), x, z: 2.0 - r * 0.86 + 0.06, ex, lk })); L.att = caX('pl-att', 209, { sex: 'f', outfit: 'uniform', makeup: true, colors: { top: '#16224a', shirt: '#f2ece0', tie: '#b01828' } }, sc); }
  else pas.forEach(([o, [x, r]]) => { const p = caPerson(o); p.position.set(x, 0.0, 2.0 - r * 0.86 + 0.06); p.rotation.y = Math.PI; sc.add(p); });
  // flight attendant walking the aisle
  const fa = caHasX() ? new THREE.Group() : caPerson({ kind: 'f', c: { skin: '#e8b48e', hair: '#2a160c', dress: '#16224a', shirt: '#f2ece0', shoe: '#101010' }, arms: { L: 'down', R: 'tray' }, face: 'smile', hair: 'bun', sleeves: true, highNeck: true, flare: 0.17, look: [0, 4] }); fa.position.set(0.05, 0, 3.7); fa.rotation.y = Math.PI; sc.add(fa);
  // lights
  const hemi = new THREE.HemisphereLight(lin('#c8c0ff'), lin('#2a2840'), 0.6); sc.add(hemi);
  const key = new THREE.SpotLight(lin('#ffe2c0'), 2.4, 6, 0.7, 0.7, 1.2); key.position.set(-0.3, 2.1, 1.0); key.target.position.set(-0.6, 0.9, 0.3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; sc.add(key, key.target);
  for (let i = 0; i < 5; i++) { const pl = new THREE.PointLight(lin('#b8b0ff'), 0.6, 4, 1.6); pl.position.set(0, 2.0, 2 - i * 3); sc.add(pl); }
  L.flash = new THREE.PointLight(lin('#c8d8ff'), 0, 7, 1.4); L.flash.position.set(-2.4, 1.3, 0); sc.add(L.flash);
  L.flash2 = new THREE.PointLight(lin('#c8d8ff'), 0, 7, 1.4); L.flash2.position.set(2.4, 1.3, -3); sc.add(L.flash2);
  for (let i = 0; i < 6; i++) sc.userData.bokeh.push([0, 2.18, 2 - i * 2.5, '#c8c0ff', 0.6]);
  CA.pl = L; return L;
}
function caPlaneShot(g, t, k) {
  const L = caPlane(), sc = L.sc; caCharIn(sc);
  const fl = (s) => { const p = (t * 0.7 + s) % 2.3; return p < 0.06 ? 1 : p < 0.14 ? 0.35 : p < 0.18 ? 0.8 : 0; };
  L.flash.intensity = 3 * fl(0); L.flash2.intensity = 3 * fl(0.9); L.winM.color.copy(lin('#ffffff')).multiplyScalar(1 + 3 * Math.max(fl(0), fl(0.9)));
  if (L.xs) { L.xs.forEach(({ X, x, z, ex, lk }, i) => X.pose({ pose: 'sit', sitY: -0.36, expr: ex, look: lk, pos: [x, 0, z], rot: 180, t: t + i, add: { head: [6, (i % 3 - 1) * 8, 0] } })); L.att.pose({ pose: 'hold', expr: 'happy', pos: [0.05, 0, 3.7 - 0.12 * k], rot: 180, t }); }
  chPose({ pose: 'sit', sitY: -0.36, expr: [['happy', 0.6], ['smug', 0.4]], pos: [-0.6, 0, 1.18], rot: 180, look: [12, 6], add: { head: [-4, 10, 6], spine: [-4, 0, 0] }, t });
  const sh = 0.004 * Math.sin(t * 31) * Math.sin(t * 7);
  const pk = EZ.io(k);
  shotCam(g, [lerp(0.24, 0.16, pk) + sh, lerp(1.72, 1.66, pk), lerp(-0.15, 0.1, pk)], [-0.55, 1.12, 1.22], 30, 1, t);
  caPresent(g, sc, { fd: 1.45, near: [0.35, 0.8], far: [2.3, 5], r: 12 }, 0.28, { sat: 0.95, vig: 0.6 });
}

// ---------- SHIP: a 1912 liner's promenade deck, a stewardess in period uniform
function caShip() {
  if (CA.sh) return CA.sh;
  const sc = caScene({ clear: '#a8b8c8', exposure: 1.05 }), Sh = { sc }, M = CA.mat;
  sc.fog = new THREE.FogExp2(lin('#c8ccc8'), 0.006);
  caSkyDome(sc, caTexSky('#6a8ab0', '#b8c4cc', '#e8dcc0'));
  const seaT = caRep(g3Tex((x, w) => { const R = RNG('ca-sea'); x.fillStyle = '#2a4a5e'; x.fillRect(0, 0, w, w); for (let i = 0; i < 2600; i++) { x.strokeStyle = `rgba(${R.i(150, 230)},${R.i(180, 240)},${R.i(200, 255)},${R.r(0.08, 0.35)})`; x.lineWidth = R.r(0.5, 2); const X = R.r(0, w), Y = R.r(0, w); x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + 6, Y - 2, X + R.r(8, 20), Y); x.stroke(); } }, 512, 512), 40, 40);
  Sh.sea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshPhysicalMaterial({ map: seaT, roughness: 0.25, clearcoat: 0.6, envMapIntensity: 0.8 })); Sh.sea.rotation.x = -Math.PI / 2; Sh.sea.position.y = -12; sc.add(Sh.sea);
  const plank = caRep(g3Tex((x, w, h) => { const R = RNG('ca-plank'); x.fillStyle = '#b89a72'; x.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) { const v = R.i(-16, 16); x.fillStyle = `rgb(${184 + v},${154 + v},${114 + v})`; x.fillRect(0, j * h / 8, w, h / 8 - 2); x.fillStyle = '#3a2a1a'; x.fillRect(0, (j + 1) * h / 8 - 2, w, 2); for (let k2 = 0; k2 < 30; k2++) { x.fillStyle = `rgba(90,60,30,${R.r(0.05, 0.2)})`; x.fillRect(R.r(0, w), j * h / 8 + R.r(0, h / 8), R.r(10, 60), 1); } } }, 512, 256), 8, 4);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(60, 7), caStd({ map: plank, roughness: 0.7 })); deck.rotation.x = -Math.PI / 2; deck.position.set(0, 0, 0); deck.receiveShadow = true; sc.add(deck);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(60, 12, 0.3), caStd({ color: lin('#141414'), roughness: 0.6 })); hull.position.set(0, -6, 3.6); sc.add(hull);
  // railing on the sea side
  const white = caStd({ color: lin('#f2efe6'), roughness: 0.5 }), teak = caStd({ map: caTexWood('teak', '#8a5a2a', '40,20,8', '200,150,90'), roughness: 0.4 });
  for (let i = 0; i < 50; i++) { const p = new THREE.Mesh(CA.geo.cyl, white); p.scale.set(0.028, 1.05, 0.028); p.position.set(-30 + i * 1.2, 0.52, 3.3); sc.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(60, 0.08, 0.14), teak); rail.position.set(0, 1.08, 3.3); sc.add(rail);
  [0.4, 0.75].forEach((y) => { const w0 = new THREE.Mesh(CA.geo.cyl, white); w0.scale.set(0.012, 60, 0.012); w0.rotation.z = Math.PI / 2; w0.position.set(0, y, 3.3); sc.add(w0); });
  // deckhouse wall with windows, deck chairs, lifeboats, funnels
  const houseT = g3Tex((x, w, h) => { x.fillStyle = '#f0ece2'; x.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const X = 20 + i * 84; x.fillStyle = '#4a4438'; x.fillRect(X - 3, 50, 56, 106); x.fillStyle = '#9ab0b8'; x.fillRect(X, 53, 50, 100); x.strokeStyle = '#f0ece2'; x.lineWidth = 4; x.beginPath(); x.moveTo(X + 25, 53); x.lineTo(X + 25, 153); x.moveTo(X, 103); x.lineTo(X + 50, 103); x.stroke(); } x.fillStyle = '#c8c0b0'; x.fillRect(0, h - 20, w, 20); }, 512, 256);
  houseT.wrapS = THREE.RepeatWrapping; houseT.repeat.set(10, 1);
  const house = new THREE.Mesh(new THREE.BoxGeometry(60, 3.2, 0.3), caStd({ map: houseT, roughness: 0.55 })); house.position.set(0, 1.6, -3.4); house.receiveShadow = true; sc.add(house);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(60, 0.15, 7.4), white); roof.position.set(0, 3.25, 0); roof.castShadow = true; sc.add(roof);
  const posts = []; for (let i = 0; i < 20; i++) { const p = new THREE.Mesh(CA.geo.cyl, white); p.scale.set(0.06, 3.2, 0.06); p.position.set(-30 + i * 3, 1.6, 3.15); sc.add(p); }
  const chairG = (() => { const s0 = new THREE.Shape([[0, 0.3], [1.1, 0.3], [1.1, 0.36], [0.55, 0.42], [0.1, 0.42], [-0.15, 0.95], [-0.22, 0.92], [0.0, 0.36]].map(([a, b]) => new THREE.Vector2(a, b))); const gg = new THREE.ExtrudeGeometry(s0, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }); gg.rotateY(Math.PI / 2); return gg; })();
  for (let i = 0; i < 9; i++) { const c0 = new THREE.Mesh(chairG, teak); c0.position.set(-14 + i * 2.2, 0, -3.1); c0.castShadow = true; sc.add(c0); }
  const boat = (x) => { const g = new THREE.Group(); const hb = new THREE.Mesh(CA.geo.sph, white); hb.scale.set(4, 0.6, 0.95); g.add(hb); const tr = new THREE.Mesh(CA.geo.sph, teak); tr.scale.set(3.9, 0.12, 0.9); tr.position.y = 0.35; g.add(tr); g.position.set(x, 4.6, -1.8); sc.add(g); [-2.6, 2.6].forEach((dx) => { const dv = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(x + dx, 3.3, -3.0), V3(x + dx, 5.8, -3.0), V3(x + dx, 5.6, -1.8)), 10, 0.06, 6), white); sc.add(dv); }); };
  [-18, -8, 4, 14].forEach(boat);
  const buff = caStd({ color: lin('#c88a3a'), roughness: 0.6 }), blk = caStd({ color: lin('#141414'), roughness: 0.6 });
  [-22, -8, 6, 20].forEach((x, i) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 15, 32), buff); f.scale.z = 0.7; f.position.set(x, 10.5, -9); f.rotation.z = 0.09; sc.add(f); const tp = new THREE.Mesh(new THREE.CylinderGeometry(2.02, 2.02, 3, 32), blk); tp.scale.z = 0.7; tp.position.set(x + 0.6, 17.5, -9); tp.rotation.z = 0.09; sc.add(tp); for (let s2 = 0; s2 < 4; s2++) caGlowSprite(sc, '#3a3632', x + 1.2 + s2 * 2.5, 20 + s2 * 1.5, -9 - s2, 6 + s2 * 2, 5 + s2 * 2, 0.0).material.blending = THREE.NormalBlending; });
  sc.children.filter((o) => o.isSprite).forEach((s2) => { s2.material.opacity = 0.35; });
  [[-10, -2.6], [8, -2.6]].forEach(([x, z]) => { const v = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(x, 3.2, z), V3(x, 4.4, z), V3(x, 4.5, z + 0.6)), 10, 0.25, 12), buff); sc.add(v); });
  // the stewardess with a tea tray, and two passengers strolling
  Sh.stew = caPerson({ kind: 'f', apron: true, c: { skin: '#f0c4a4', hair: '#3a2416', dress: '#1c2236', shirt: '#f4f1ea', shoe: '#101010' }, arms: { L: 'tray', R: 'tray' }, face: 'smile', hair: 'bun', hat: 'cap', sleeves: true, highNeck: true, flare: 0.24, look: [-10, 4] });
  const tray = new THREE.Group(); const tp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.015, 0.3), caStd({ color: lin('#d8d0c0'), metalness: 0.8, roughness: 0.25 })); tray.add(tp);
  [[-0.1, 0], [0.1, 0.05], [0.0, -0.08]].forEach(([x, z]) => { const cu = new THREE.Mesh(caLathe([[0, 0], [0.035, 0], [0.042, 0.055], [0.038, 0.055], [0.03, 0.005], [0, 0.005]], 16), caStd({ color: lin('#f4f1ea'), roughness: 0.3 })); cu.position.set(x, 0.008, z); tray.add(cu); });
  const tip = Sh.stew.userData.tips; tray.position.set(0, (tip.L.y + tip.R.y) / 2 + 0.01, (tip.L.z + tip.R.z) / 2 - 0.06); Sh.stew.add(tray); sc.add(Sh.stew);
  const per = caPeriod(); [['lady2', -6, 0.4, 90], ['top2', -6.6, -0.2, 90], ['lady1', -12, 1.2, 80]].forEach(([n, x, z, ry]) => { const p = per[n].clone(); p.visible = true; p.position.set(x, 0, z); p.rotation.y = ry * DEG; sc.add(p); });
  const sun = new THREE.DirectionalLight(lin('#fff0d8'), 2.0); sun.position.set(14, 18, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8, near: 1, far: 60 }); sun.shadow.radius = 4; sun.target.position.set(2, 0, 0); sc.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(lin('#c8d8ff'), lin('#8a7a5a'), 0.7); sc.add(hemi);
  CA.sh = Sh; return Sh;
}
function caShipShot(g, t, k, u) {
  const Sh = caShip(), sc = Sh.sc, c = chBuild(); if (c.root.parent === sc) sc.remove(c.root);
  Sh.stew.position.set(1.3 + 0.3 * u, 0.0, 0.2); Sh.stew.rotation.y = 90 * DEG;
  Sh.sea.material.map.offset.set(t * 0.004, t * 0.002);
  const pk = EZ.io(k);
  shotCam(g, [lerp(7.4, 6.8, pk), lerp(1.5, 1.55, pk), lerp(-1.4, -1.0, pk)], [lerp(0.5, 0.0, pk), 1.35, 0.9], 30, 0.8, t);
  caPresent(g, sc, { fd: Math.hypot(Sh.stew.position.x - 7.1, 1.4), far: [7, 18], r: 7 }, 0.2, { sepia: 0.45, sat: 0.72, con: 1.06, grain: 0.14, scratch: true, flicker: 0.02, vig: 0.7 });
}

// ---------- the set function: one staging per beat
function setCasino(g, t, b) {
  const shot = b ? b.shot : (t < 3 ? 'roulette' : t < 5 ? 'top' : t < 7 ? 'forty' : 'banned');
  const k = b ? b.k : clamp(t / 9), u = b ? t - b.t0 : t;
  caBuild();
  if (shot === 'arrive') return caArriveShot(g, t, k, u);
  if (shot === 'photos') return caPhotosShot(g, t, k);
  if (shot === 'stadium') return caStadiumShot(g, t, k, u, false);
  if (shot === 'otherteam') return caStadiumShot(g, t, k, u, true);
  if (shot === 'plane') return caPlaneShot(g, t, k);
  if (shot === 'ship') return caShipShot(g, t, k, u);
  caFloor(g, t, shot, k, b ?? { t0: 0 });
}

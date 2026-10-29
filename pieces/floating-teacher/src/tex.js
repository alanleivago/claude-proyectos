// =====================================================================
//  TEXTURES — all drawn in code, seeded: floor planks, wainscot boards, stained plaster, ceiling boards, desk tops,
//  the uniforms (gakuran wool, sailor navy), her rust cardigan and pleated skirt, posters and calligraphy sheets with
//  kanji-like brush marks, book spines, the cedar forest in the rain outside, the clock face.
// =====================================================================
const TX = {};
function txCanvas(key, w, h, draw, rep = [1, 1], srgb = true) {
  if (TX[key]) return TX[key];
  const t = g3Tex((x) => draw(x, w, h, RNG('tx', key)), w, h, srgb); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.magFilter = THREE.LinearFilter; t.anisotropy = 4; return (TX[key] = t);
}
const blob = (x, cx, cy, r, R, k = 7) => { x.beginPath(); for (let i = 0; i <= k; i++) { const a = (i / k) * TAU, rr = r * (0.75 + R.f() * 0.4); i ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } x.closePath(); };
const tile = (x, w, h, f) => { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.save(); x.translate(ox, oy); f(); x.restore(); } };
function texCloth(key, base, line, rep = [2, 2]) {
  return txCanvas(key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { x.fillStyle = line; x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(2, 6)); } }, rep);
}
// wood grain lines across a rectangle (horizontal grain)
function grain(x, R, x0, y0, w, h, n, col) { for (let k = 0; k < n; k++) { x.strokeStyle = col; x.lineWidth = R.r(0.6, 1.6); x.beginPath(); let yy = y0 + R.r(2, h - 2); x.moveTo(x0, yy); for (let px = x0; px <= x0 + w; px += 16) { yy += R.n(1.2); x.lineTo(px, Math.min(y0 + h - 1, Math.max(y0 + 1, yy))); } x.stroke(); } }
// floor: long planks running along the room, worn paths, nail heads, dark joints
function texFloor() {
  return txCanvas('floor', 512, 512, (x, w, h, R) => {
    const pw = 32;
    for (let i = 0; i < w / pw; i++) { let y0 = -R.r(0, 300);
      while (y0 < h) { const L = R.r(180, 420); x.fillStyle = R.pick(['#8a6a48', '#7a5a3c', '#946f4a', '#6e5236', '#85664a', '#7f6042']); x.fillRect(i * pw, y0, pw, L);
        x.save(); x.translate(i * pw, y0); x.rotate(Math.PI / 2); grain(x, R, 0, -pw, L, pw, 7, 'rgba(40,26,14,0.35)'); x.restore();
        x.fillStyle = 'rgba(20,12,6,0.85)'; x.fillRect(i * pw, y0, pw, 2); x.fillStyle = '#2a1c10'; x.fillRect(i * pw + 4, y0 + 6, 2, 2); x.fillRect(i * pw + pw - 6, y0 + 6, 2, 2); y0 += L; }
      x.fillStyle = 'rgba(16,10,6,0.9)'; x.fillRect(i * pw, 0, 2, h); }
    for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(230,220,200,0.08)', 'rgba(30,20,10,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), RNG('fl', i)); x.fill(); }
  }, [3, 3]);
}
// wainscot: vertical boards, darker, with a scuffed lower edge
function texWainscot() {
  return txCanvas('wains', 256, 128, (x, w, h, R) => {
    for (let i = 0; i < 16; i++) { x.fillStyle = R.pick(['#5a4430', '#4e3a28', '#634a34', '#54402c']); x.fillRect(i * 16, 0, 16, h); x.fillStyle = 'rgba(14,9,5,0.9)'; x.fillRect(i * 16, 0, 2, h);
      for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(30,20,12,0.4)'; x.lineWidth = 1; x.beginPath(); const xx = i * 16 + R.r(4, 14); x.moveTo(xx, 0); x.lineTo(xx + R.n(2), h); x.stroke(); } }
    x.fillStyle = 'rgba(14,9,5,0.6)'; x.fillRect(0, h - 10, w, 10);
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,190,170,0.12)'; x.fillRect(R.r(0, w), R.r(h - 30, h), R.r(4, 20), 2); }
  }, [6, 1]);
}
// plaster: pale teal-grey with water stains running down from the ceiling and a few cracks
function texPlaster() {
  return txCanvas('plaster', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#b6bcb2'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { x.fillStyle = R.pick(['rgba(120,130,120,0.12)', 'rgba(230,232,220,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 20), RNG('pl', i)); x.fill(); }
    for (let i = 0; i < 9; i++) { const cx = R.r(0, w), ww = R.r(8, 30); const g = x.createLinearGradient(0, 0, 0, h * R.r(0.3, 0.8)); g.addColorStop(0, 'rgba(90,80,60,0.45)'); g.addColorStop(1, 'rgba(90,80,60,0)'); x.fillStyle = g; x.fillRect(cx, 0, ww, h); }
    for (let i = 0; i < 6; i++) { let px = R.r(0, w), py = R.r(0, h); x.strokeStyle = 'rgba(50,50,46,0.55)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += R.n(12); py += R.r(4, 12); x.lineTo(px, py); } x.stroke(); }
  }, [3, 1]);
}
function texCeiling() {
  return txCanvas('ceil', 256, 256, (x, w, h, R) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = R.pick(['#6a5038', '#5e4632', '#735a40', '#634a34']); x.fillRect(0, i * 32, w, 32); grain(x, R, 0, i * 32, w, 32, 6, 'rgba(30,20,12,0.35)'); x.fillStyle = 'rgba(14,9,5,0.85)'; x.fillRect(0, i * 32, w, 2); }
    for (let i = 0; i < 5; i++) { const cx = R.r(0, w), cy = R.r(0, h); x.fillStyle = 'rgba(30,24,16,0.4)'; blob(x, cx, cy, R.r(12, 30), RNG('cs', i)); x.fill(); }
  }, [4, 4]);
}
function texDesk() {
  return txCanvas('desk', 128, 128, (x, w, h, R) => {
    x.fillStyle = '#a07c50'; x.fillRect(0, 0, w, h); grain(x, R, 0, 0, w, h, 26, 'rgba(60,40,20,0.35)');
    for (let i = 0; i < 18; i++) { x.strokeStyle = R.pick(['rgba(40,26,14,0.55)', 'rgba(240,230,200,0.25)']); x.lineWidth = 1; x.beginPath(); const px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); x.lineTo(px + R.n(20), py + R.n(8)); x.stroke(); }
    x.fillStyle = 'rgba(40,26,14,0.5)'; x.beginPath(); x.arc(R.r(20, 100), R.r(20, 100), 5, 0, TAU); x.fill();
  }, [1, 1]);
}
// school-uniform wool: near black with a faint twill
function texWool(key, base, line) {
  return txCanvas(key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = -h; i < w; i += 4) { x.strokeStyle = line; x.lineWidth = 1; x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); }
    for (let i = 0; i < 120; i++) { x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(R.r(0, w), R.r(0, h), 1, 2); } }, [2, 2]);
}
// her cardigan: rust knit ribs with a few pulled loops
function texKnit() {
  return txCanvas('knit', 64, 64, (x, w, h, R) => { x.fillStyle = '#8e3a24'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 4) { x.fillStyle = 'rgba(40,10,4,0.35)'; x.fillRect(i, 0, 1, h); x.fillStyle = 'rgba(255,200,170,0.1)'; x.fillRect(i + 2, 0, 1, h); }
    for (let j = 0; j < h; j += 3) { x.fillStyle = 'rgba(40,10,4,0.15)'; x.fillRect(0, j, w, 1); } }, [3, 3]);
}
function texPleat(key, base) {
  return txCanvas(key, 128, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(i, 0, 2, h); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(i + 2, 0, 2, h); } }, [3, 1]);
}
// kanji-like brush marks: a few strokes per cell (horizontal, vertical, sweeps, dots), never real words
function kanjiMarks(x, R, cx, cy, s, col, lw) {
  x.strokeStyle = col; x.fillStyle = col; x.lineWidth = lw; x.lineCap = 'round';
  const n = R.i(3, 7);
  for (let k = 0; k < n; k++) { const t = R.f(), ax = cx + R.r(-0.4, 0.4) * s, ay = cy + R.r(-0.4, 0.4) * s; x.beginPath();
    if (t < 0.35) { x.moveTo(cx - R.r(0.2, 0.45) * s, ay); x.lineTo(cx + R.r(0.2, 0.45) * s, ay + R.n(0.04) * s); }
    else if (t < 0.65) { x.moveTo(ax, cy - R.r(0.2, 0.45) * s); x.lineTo(ax + R.n(0.04) * s, cy + R.r(0.2, 0.45) * s); }
    else if (t < 0.85) { x.moveTo(ax, ay); x.quadraticCurveTo(ax + R.n(0.2) * s, ay + 0.3 * s, ax + R.r(-0.35, 0.35) * s, ay + R.r(0.2, 0.4) * s); }
    else { x.arc(ax, ay, lw * 0.6, 0, TAU); x.fill(); continue; }
    x.stroke(); }
}
// a poster: off-white paper, a title row of marks, a coloured band, smaller rows (a timetable / class rules)
function texPoster(i) {
  return txCanvas('poster' + i, 96, 128, (x, w, h, R) => {
    x.fillStyle = R.pick(['#e4dcc4', '#d8d0b4', '#e8e2cc']); x.fillRect(0, 0, w, h);
    x.fillStyle = R.pick(['#8e3a24', '#346c76', '#26304a']); x.fillRect(6, 6, w - 12, 18);
    for (let k = 0; k < 3; k++) kanjiMarks(x, R, 22 + k * 26, 15, 14, '#f0e8d4', 2);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) kanjiMarks(x, R, 14 + c * 17, 38 + r * 14, 10, '#2a2420', 1.2);
    if (i % 2) { x.strokeStyle = '#2a2420'; x.lineWidth = 1; for (let r = 0; r < 7; r++) { x.beginPath(); x.moveTo(6, 31 + r * 14); x.lineTo(w - 6, 31 + r * 14); x.stroke(); } }
    x.fillStyle = 'rgba(120,100,60,0.25)'; x.fillRect(0, 0, w, 3); x.fillRect(0, h - 4, w, 4);
  }, [1, 1]);
}
// a calligraphy sheet (shūji): white paper, two big brush characters, a name column, slightly wavy
function texShuji(i) {
  return txCanvas('shuji' + i, 48, 96, (x, w, h, R) => {
    x.fillStyle = '#ece6d4'; x.fillRect(0, 0, w, h); kanjiMarks(x, R, 24, 26, 30, '#14110e', 4.5); kanjiMarks(x, R, 24, 62, 30, '#14110e', 4.5);
    for (let k = 0; k < 3; k++) kanjiMarks(x, R, 40, 76 + k * 7, 6, '#14110e', 1); if (R.f() < 0.5) { x.strokeStyle = '#b3271c'; x.lineWidth = 2; x.beginPath(); x.arc(12, 14, 6, 0, TAU); x.stroke(); }
  }, [1, 1]);
}
function texBooks() {
  return txCanvas('books', 256, 64, (x, w, h, R) => {
    x.fillStyle = '#1a140c'; x.fillRect(0, 0, w, h); let px = 0;
    while (px < w) { const bw = R.r(5, 12), bh = R.r(h * 0.6, h); x.fillStyle = R.pick(['#5a2418', '#26304a', '#3f4542', '#8e3a24', '#5a4430', '#1f3c44', '#a07c50', '#d3d6cc']); x.fillRect(px, h - bh, bw - 1, bh);
      x.fillStyle = 'rgba(255,240,210,0.35)'; x.fillRect(px + 1, h - bh + 4, bw - 3, 2); x.fillRect(px + 1, h - 8, bw - 3, 2); px += bw; }
  }, [1, 1]);
}
// the cedar forest outside in the rain: layers of dark conical trees in fog, the nearest the darkest
function texForest() {
  return txCanvas('forest', 512, 256, (x, w, h, R) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fa8a6'); g.addColorStop(0.6, '#6f8c8c'); g.addColorStop(1, '#4e6a6c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    [['#5f7c7c', 0.42, 22], ['#3f5a5c', 0.5, 30], ['#24383a', 0.62, 40], ['#142224', 0.78, 54]].forEach(([c, y0, s], L) => {
      x.fillStyle = c; for (let px = -20; px < w + 20; px += s * R.r(0.45, 0.8)) { const ty = h * y0 - R.r(0, s * 1.6); x.beginPath(); x.moveTo(px, ty); x.lineTo(px - s * 0.45, h); x.lineTo(px + s * 0.45, h); x.closePath(); x.fill(); }
      x.fillRect(0, h * (y0 + 0.12), w, h); });
    for (let i = 0; i < 200; i++) { x.strokeStyle = 'rgba(210,225,225,0.25)'; x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px - 2, py + R.r(8, 20)); x.stroke(); }
  }, [1, 1]);
}
function texClock() {
  return txCanvas('clock', 128, 128, (x, w, h) => {
    x.fillStyle = '#2b2219'; x.beginPath(); x.arc(64, 64, 63, 0, TAU); x.fill(); x.fillStyle = '#e8e2cc'; x.beginPath(); x.arc(64, 64, 54, 0, TAU); x.fill();
    x.fillStyle = '#14110e'; for (let k = 0; k < 60; k++) { const a = (k / 60) * TAU, r0 = k % 5 ? 49 : 42; x.save(); x.translate(64, 64); x.rotate(a); x.fillRect(-1 - (k % 5 ? 0 : 1), -52, k % 5 ? 2 : 4, 52 - r0 + 2); x.restore(); }
    x.font = 'bold 13px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) { const a = (k / 12) * TAU; x.fillText(String(k), 64 + Math.sin(a) * 33, 64 - Math.cos(a) * 33); }
  }, [1, 1]);
}
function texPaper() {
  return txCanvas('paper', 64, 64, (x, w, h, R) => { x.fillStyle = '#e6e0cc'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(70,110,130,0.5)'; x.lineWidth = 1; for (let j = 8; j < h; j += 6) { x.beginPath(); x.moveTo(4, j); x.lineTo(w - 4, j); x.stroke(); }
    for (let j = 10; j < h - 8; j += 6) { const L = R.r(10, 50); x.fillStyle = 'rgba(30,30,40,0.6)'; x.fillRect(6, j - 2, L, 1); } }, [1, 1]);
}
const TXM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));

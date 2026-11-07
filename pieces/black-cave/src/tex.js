// =====================================================================
//  TEXTURES — all drawn in code, seeded: the red-ochre dirt road with wheel ruts and a grass strip, dry sertão soil,
//  silver dead bark and fence posts, the Corpo-Seco's leather skin (wrinkles, cracks, darker creases), adobe (taipa)
//  plaster with exposed wattle, chapel limewash, clay roof tiles, planks, cotton, a faded print dress, zebu hide,
//  the straw hat, faces, the night/dusk sky and the low hills.
// =====================================================================
const TX = {};
function txCanvas(key, w, h, draw, rep = [1, 1], srgb = true) {
  if (TX[key]) return TX[key];
  const t = g3Tex((x) => draw(x, w, h, RNG('tx', key)), w, h, srgb); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.magFilter = THREE.LinearFilter; t.anisotropy = 4; return (TX[key] = t);
}
const blob = (x, cx, cy, r, R, k = 7) => { x.beginPath(); for (let i = 0; i <= k; i++) { const a = (i / k) * TAU, rr = r * (0.75 + R.f() * 0.4); i ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } x.closePath(); };
function crack(x, R, px, py, n, dx, dy, col = 'rgba(14,12,10,0.8)', lw = 1.2) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < n; k++) { px += dx + R.n(5); py += dy + R.n(5); x.lineTo(px, py); if (R.f() < 0.2) { x.moveTo(px, py); } } x.stroke(); }
function speckle(x, R, w, h, n, cols, s = [1, 2]) { for (let i = 0; i < n; i++) { x.fillStyle = R.pick(cols); const q = R.r(s[0], s[1]); x.fillRect(R.r(0, w), R.r(0, h), q, q); } }
function vlines(x, R, w, h, n, cols, lw = [1, 3], wob = 2) { for (let i = 0; i < n; i++) { x.strokeStyle = R.pick(cols); x.lineWidth = R.r(lw[0], lw[1]); x.beginPath(); let px = R.r(0, w); x.moveTo(px, 0); for (let y = 0; y <= h; y += 12) { px += R.n(wob); x.lineTo(px, y); } x.stroke(); } }

// the dirt road: u across (5 m), v along (10 m per repeat). Red-ochre dust, two dark wheel ruts with ridges, a grass strip
function texDirt() {
  return txCanvas('dirt', 256, 512, (x, w, h, R) => {
    x.fillStyle = '#8a6440'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { x.fillStyle = R.pick(['rgba(110,70,40,0.35)', 'rgba(150,110,70,0.3)', 'rgba(90,60,36,0.35)', 'rgba(170,130,90,0.2)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), R); x.fill(); }
    speckle(x, R, w, h, w * h * 0.06, ['#6a4a30', '#a07c50', '#5a3c26', '#b08a5c', '#7a5636'], [1, 2]);
    [0.36, 0.64].forEach((u) => { const cx = u * w; for (let y = 0; y < h; y += 2) { const off = 3 * Math.sin(y * 0.02 + u * 9); x.fillStyle = 'rgba(52,34,20,0.55)'; x.fillRect(cx - 13 + off, y, 26, 2); x.fillStyle = 'rgba(40,26,14,0.5)'; x.fillRect(cx - 6 + off, y, 12, 2); x.fillStyle = 'rgba(190,150,100,0.25)'; x.fillRect(cx - 17 + off, y, 3, 2); x.fillRect(cx + 14 + off, y, 3, 2); }
      for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(30,20,12,0.5)'; x.fillRect(cx + R.n(10), R.r(0, h), R.r(2, 6), 1); } });
    for (let y = 0; y < h; y += 3) { if (R.f() < 0.75) { x.fillStyle = R.pick(['rgba(120,110,60,0.6)', 'rgba(150,130,70,0.5)', 'rgba(90,80,44,0.55)']); x.fillRect(w * 0.5 + R.n(12), y, R.r(2, 6), R.r(3, 8)); } }   // the dry grass strip in the middle
    for (let i = 0; i < 40; i++) crack(x, R, R.r(0, w), R.r(0, h), 5, R.n(5), R.r(3, 8), 'rgba(50,32,18,0.6)', R.r(0.8, 1.6));
    for (let i = 0; i < 160; i++) { x.fillStyle = R.pick(['#c0a070', '#6a5a48', '#9a8a70']); const s = R.r(2, 4); x.fillRect(R.r(0, w), R.r(0, h), s, s * 0.8); }   // pebbles
  }, [1, 1]);
}
function texSoil() {   // dry sertão ground: ochre dust, dead grass tufts, stones, cracked clay
  return txCanvas('soil', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#6a5034'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(130,96,60,0.35)', 'rgba(80,58,36,0.4)', 'rgba(150,120,70,0.3)', 'rgba(96,90,60,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(8, 34), R); x.fill(); }
    speckle(x, R, w, h, w * h * 0.08, ['#5a4430', '#a07c50', '#4a3424', '#8a7048', '#6a6040'], [1, 2]);
    for (let i = 0; i < 260; i++) { x.strokeStyle = R.pick(['#a08850', '#7a6438', '#c0a060', '#5a4a2a']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(6), py - R.r(3, 9)); x.stroke(); }
    for (let i = 0; i < 30; i++) crack(x, R, R.r(0, w), R.r(0, h), 4, R.n(8), R.n(8), 'rgba(40,26,14,0.5)', 1);
  }, [1, 1]);
}
// sun-bleached sertão dead wood: warm grey-brown, long fine fibres, deep dry cracks along the grain, lighter bleached
// ridges, a few dark knots; low contrast so the dither reads it as dry wood, not birch bark
function texDeadBark(key = 'dbark', base = '#8a7a64') {
  return txCanvas(key, 128, 512, (x, w, h, R) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) { x.fillStyle = R.pick(['rgba(160,140,110,0.28)', 'rgba(110,92,70,0.3)', 'rgba(176,160,132,0.22)', 'rgba(96,80,60,0.25)']); const cx = R.r(0, w), cy = R.r(0, h); x.beginPath(); x.ellipse(cx, cy, R.r(6, 22), R.r(40, 140), 0, 0, TAU); x.fill(); }   // long weathered streaks
    vlines(x, R, w, h, 220, ['rgba(120,102,80,0.55)', 'rgba(150,132,104,0.5)', 'rgba(100,84,64,0.5)', 'rgba(168,150,120,0.45)', 'rgba(84,70,54,0.45)'], [0.6, 1.6], 1.2);   // fibres
    for (let i = 0; i < 22; i++) { const px0 = R.r(0, w), py0 = R.r(0, h), L = R.r(60, 260); x.strokeStyle = 'rgba(44,32,22,0.85)'; x.lineWidth = R.r(1.2, 2.6); x.beginPath(); let px = px0; x.moveTo(px, py0); for (let y = py0; y < py0 + L; y += 10) { px += R.n(1.2); x.lineTo(px, y); } x.stroke();   // dry cracks along the grain
      x.strokeStyle = 'rgba(190,172,140,0.4)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px0 + 2, py0); x.lineTo(px + 2, py0 + L); x.stroke(); }   // a bleached lip beside each crack
    for (let i = 0; i < 6; i++) { const cx = R.r(0, w), cy = R.r(0, h); x.fillStyle = 'rgba(58,44,30,0.8)'; x.beginPath(); x.ellipse(cx, cy, R.r(3, 6), R.r(5, 10), 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(120,100,76,0.6)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy, R.r(7, 10), R.r(10, 16), 0, 0, TAU); x.stroke(); }   // knots
    speckle(x, R, w, h, 900, ['rgba(70,56,42,0.25)', 'rgba(190,176,150,0.2)'], [1, 2]);
  }, [1, 1.5]);
}
function texBark() { return texDeadBark('bark2', '#6a5a46'); }
function texPlank(key = 'plank', base = '#6a5038') {
  return txCanvas(key, 128, 128, (x, w, h, R) => {
    for (let i = 0; i < 6; i++) { x.fillStyle = R.pick([base, '#5a4430', '#7a5a3c', '#4a3828']); x.fillRect(0, i * 22, w, 22); x.fillStyle = 'rgba(14,10,6,0.85)'; x.fillRect(0, i * 22, w, 2);
      for (let k = 0; k < 10; k++) { x.strokeStyle = 'rgba(30,20,12,0.35)'; x.lineWidth = 1; x.beginPath(); let yy = i * 22 + R.r(3, 20); x.moveTo(0, yy); for (let px = 0; px <= w; px += 16) { yy += R.n(0.8); x.lineTo(px, yy); } x.stroke(); }
      x.fillStyle = '#16110c'; x.fillRect(R.r(4, 20), i * 22 + 9, 3, 3); x.fillRect(R.r(100, 120), i * 22 + 9, 3, 3); }
    speckle(x, R, w, h, 400, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.12)']);
  }, [1, 1]);
}
// the Corpo-Seco's skin: dark leather shrunk onto the bone, wrinkles across, cracks, darker creases, pale dust in the folds
function texLeather(key = 'leather', base = '#5a4430') {
  return txCanvas(key, 256, 256, (x, w, h, R) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(40,28,18,0.35)', 'rgba(110,80,50,0.3)', 'rgba(70,50,32,0.4)', 'rgba(30,20,14,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(8, 30), R); x.fill(); }
    for (let i = 0; i < 140; i++) { x.strokeStyle = R.pick(['rgba(22,14,8,0.75)', 'rgba(30,20,12,0.6)', 'rgba(150,118,80,0.35)']); x.lineWidth = R.r(0.8, 2.2); x.beginPath(); let px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += R.r(5, 14); py += R.n(3); x.lineTo(px, py); } x.stroke(); }   // wrinkles
    for (let i = 0; i < 26; i++) crack(x, R, R.r(0, w), R.r(0, h), 5, R.n(6), R.n(6), 'rgba(16,10,6,0.9)', R.r(1, 2));
    speckle(x, R, w, h, 1600, ['rgba(160,130,90,0.25)', 'rgba(20,12,8,0.3)', 'rgba(120,60,40,0.2)'], [1, 2]);
  }, [1, 1]);
}
// adobe (taipa) plaster: ochre clay, cracks, chunks fallen to the wattle, soot near the top
function texAdobe() {
  return txCanvas('adobe', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#9a7650'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(160,124,80,0.35)', 'rgba(110,80,50,0.35)', 'rgba(180,150,104,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), R); x.fill(); }
    for (let i = 0; i < 6; i++) { const cx = R.r(0, w), cy = R.r(0, h), rw = R.r(16, 44), rh = R.r(12, 30); x.fillStyle = '#4a3424'; blob(x, cx, cy, rw * 0.5, R, 9); x.fill();
      x.strokeStyle = '#2b2219'; x.lineWidth = 3; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(cx - rw * 0.4, cy + k * 6); x.lineTo(cx + rw * 0.4, cy + k * 6 + R.n(2)); x.stroke(); } x.lineWidth = 2; for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(cx + k * 10, cy - rh * 0.4); x.lineTo(cx + k * 10 + R.n(2), cy + rh * 0.4); x.stroke(); } }
    for (let i = 0; i < 30; i++) crack(x, R, R.r(0, w), R.r(0, h), 6, R.n(6), R.r(3, 8), 'rgba(40,26,14,0.7)', R.r(0.8, 1.8));
    const g = x.createLinearGradient(0, 0, 0, h * 0.4); g.addColorStop(0, 'rgba(20,14,10,0.6)'); g.addColorStop(1, 'rgba(20,14,10,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h * 0.4);
  }, [1, 1]);
}
// chapel limewash: white with grey-green damp stains and peeling patches showing brick
function texLime() {
  return txCanvas('lime', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#e2ddd0'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(170,170,150,0.25)', 'rgba(200,196,180,0.3)', 'rgba(140,150,130,0.18)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), R); x.fill(); }
    const g = x.createLinearGradient(0, h * 0.7, 0, h); g.addColorStop(0, 'rgba(120,96,70,0)'); g.addColorStop(1, 'rgba(120,96,70,0.55)'); x.fillStyle = g; x.fillRect(0, 0, w, h);   // red dust splashed at the foot
    for (let i = 0; i < 5; i++) { const cx = R.r(0, w), cy = R.r(0, h); x.fillStyle = '#8e3a24'; blob(x, cx, cy, R.r(6, 16), R, 9); x.fill(); x.strokeStyle = 'rgba(40,20,14,0.6)'; x.lineWidth = 1; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(cx - 14, cy + k * 5); x.lineTo(cx + 14, cy + k * 5); x.stroke(); } }
    for (let i = 0; i < 18; i++) { x.strokeStyle = 'rgba(90,90,80,0.25)'; x.lineWidth = R.r(2, 5); const px = R.r(0, w); x.beginPath(); x.moveTo(px, R.r(0, h * 0.3)); x.lineTo(px + R.n(3), R.r(h * 0.4, h)); x.stroke(); }   // rain streaks
    for (let i = 0; i < 14; i++) crack(x, R, R.r(0, w), R.r(0, h), 4, R.n(5), R.r(3, 8), 'rgba(80,76,66,0.5)', 1);
  }, [1, 1]);
}
function texTile() {   // colonial clay roof tiles (capa e canal), sun-bleached, a few dark
  return txCanvas('tile', 128, 128, (x, w, h, R) => {
    for (let c = 0; c < 8; c++) for (let r = 0; r < 6; r++) { x.fillStyle = R.pick(['#8e3a24', '#a0583a', '#7a3020', '#b0704a', '#5a2418']); x.fillRect(c * 16, r * 22 + (c % 2) * 11, 16, 22);
      x.fillStyle = 'rgba(255,220,180,0.18)'; x.fillRect(c * 16 + 4, r * 22 + (c % 2) * 11, 5, 22); x.fillStyle = 'rgba(10,6,4,0.6)'; x.fillRect(c * 16, r * 22 + (c % 2) * 11, 2, 22); x.fillRect(c * 16, r * 22 + (c % 2) * 11 + 20, 16, 2); }
    speckle(x, R, w, h, 300, ['rgba(40,30,20,0.4)', 'rgba(200,190,160,0.2)']);
  }, [2, 2]);
}
function texCloth(key, base, o = {}) {   // plain cotton (weave + wear), o.check: a faded checked shirt, o.flower: a faded print dress
  return txCanvas('cl' + key, 64, 64, (x, w, h, R) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    if (o.check) { x.fillStyle = o.check; for (let i = 0; i < w; i += 16) { x.globalAlpha = 0.35; x.fillRect(i, 0, 5, h); x.fillRect(0, i, w, 5); } x.globalAlpha = 1; }
    if (o.flower) { for (let i = 0; i < 26; i++) { x.fillStyle = R.pick(o.flower); const cx = R.r(0, w), cy = R.r(0, h); for (let k = 0; k < 5; k++) { x.fillRect(cx + Math.cos(k * 1.26) * 2.5, cy + Math.sin(k * 1.26) * 2.5, 2, 2); } } }
    for (let i = 0; i < w; i += 2) { x.fillStyle = 'rgba(0,0,0,0.07)'; x.fillRect(i, 0, 1, h); }
    speckle(x, R, w, h, 260, ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.14)', 'rgba(90,60,30,0.15)']);
    for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(60,40,20,0.25)'; blob(x, R.r(0, w), R.r(0, h), R.r(4, 10), R); x.fill(); }   // dust and sweat stains
  }, o.rep || [2, 2]);
}
function texRag(key) {   // ragged hem alpha (white = keep)
  return txCanvas('rag' + key, 64, 64, (x, w, h, R) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000'; for (let i = 0; i < w; i += 2) { const d = R.r(0, 20) + (R.f() < 0.15 ? R.r(10, 26) : 0); x.fillRect(i, h - d, 2, d); } for (let i = 0; i < 9; i++) { blob(x, R.r(0, w), R.r(h * 0.15, h * 0.7), R.r(2, 5), R); x.fill(); } }, [1, 1], false);
}
function texStraw() { return txCanvas('straw', 64, 64, (x, w, h, R) => { x.fillStyle = '#a08850'; x.fillRect(0, 0, w, h); for (let r = 0; r < h; r += 4) { x.fillStyle = r % 8 ? 'rgba(80,60,30,0.35)' : 'rgba(200,170,110,0.3)'; x.fillRect(0, r, w, 2); } for (let i = 0; i < 260; i++) { x.strokeStyle = R.pick(['#b49a5e', '#6a5432', '#c8b070']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.r(4, 10), py + R.n(1)); x.stroke(); } x.fillStyle = 'rgba(40,26,14,0.3)'; for (let i = 0; i < 6; i++) { blob(x, R.r(0, w), R.r(0, h), R.r(3, 8), R); x.fill(); } }, [3, 1]); }
function texHide() {   // zebu hide: off-white grey, darker on the hump and neck (vertical gradient in v), a few scars
  return txCanvas('hide', 128, 128, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3c2c1e'); g.addColorStop(0.35, '#7a5236'); g.addColorStop(1, '#9a7050'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(60,40,26,0.25)', 'rgba(200,170,130,0.15)', 'rgba(120,80,50,0.2)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 22), R); x.fill(); }
    for (let i = 0; i < 400; i++) { x.strokeStyle = 'rgba(60,54,46,0.18)'; x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(2), py + R.r(2, 5)); x.stroke(); }
    for (let i = 0; i < 5; i++) crack(x, R, R.r(0, w), R.r(0, h), 3, R.n(6), R.n(6), 'rgba(80,50,40,0.5)', 1); }, [1, 1]);
}
function texMetal(key, base) { return txCanvas('met' + key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(110,60,30,0.5)', 'rgba(80,40,20,0.5)', 'rgba(255,255,255,0.08)']); blob(x, R.r(0, w), R.r(0, h), R.r(2, 9), R); x.fill(); } }, [1, 1]); }
// a weathered face texture (u wraps round the head with u = 0.5 at the front, v = 1 at the crown). k: 'old' | 'woman' | 'tiao'
function texFaceOf(k) {
  return txCanvas('face' + k, 256, 128, (x, w, h, R) => {
    const skin = k === 'woman' ? '#9a6a48' : k === 'oldfear' ? '#8a5c3a' : k === 'tiao' ? '#5a3c28' : '#8a5c3a'; x.fillStyle = skin; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(60,36,20,0.25)', 'rgba(160,110,80,0.2)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 14), R); x.fill(); }
    const fx = w * 0.5;
    // brows, eyes, nose shadow, mouth; wrinkles for the old. 'oldfear': eyes wide, brows up, the mouth open
    const fear = k === 'oldfear' || k === 'fear', old = k === 'old' || k === 'oldfear';
    x.fillStyle = old ? '#b8b4a8' : '#1e140c'; [-1, 1].forEach((sd) => { x.save(); x.translate(fx + sd * 13, fear ? 49 : 53); x.rotate(sd * (fear ? -0.25 : 0.08)); x.fillRect(-7, -1.5, 14, 3); x.restore(); });
    [-1, 1].forEach((sd) => { const ex = fx + sd * 12; x.fillStyle = 'rgba(40,24,14,0.55)'; x.fillRect(ex - 6, 56, 12, 9); x.fillStyle = '#d8cfbc'; x.fillRect(ex - 4, 58, 8, fear ? 6 : 4); x.fillStyle = '#140c08'; x.fillRect(ex - 1.5, fear ? 59 : 58, 3, fear ? 3 : 4); });
    x.fillStyle = 'rgba(40,24,14,0.55)'; x.fillRect(fx - 2, 62, 4, 14); x.fillStyle = 'rgba(30,18,10,0.6)'; x.fillRect(fx - 5, 75, 10, 3);
    if (old) { x.fillStyle = '#9a968a'; x.fillRect(fx - 13, 80, 26, 5); x.fillRect(fx - 15, 84, 5, 4); x.fillRect(fx + 10, 84, 5, 4); x.fillStyle = 'rgba(40,24,14,0.55)'; for (let i = 0; i < 4; i++) x.fillRect(fx - 30, 44 - i * 4, 60, 1); x.fillRect(fx - 24, 62, 4, 1); x.fillRect(fx + 20, 62, 4, 1); x.fillRect(fx - 18, 74, 1, 10); x.fillRect(fx + 17, 74, 1, 10);
      x.fillStyle = '#1a0c08'; if (fear) x.fillRect(fx - 6, 86, 12, 9); else x.fillRect(fx - 7, 87, 14, 2); }
    else if (k === 'tiao') { x.fillStyle = '#1a120c'; x.fillRect(fx - 16, 80, 32, 5); x.fillRect(fx - 20, 85, 40, 14); }
    else if (fear) { x.fillStyle = '#1a0c08'; x.fillRect(fx - 7, 84, 14, 11); x.fillStyle = '#d8cfbc'; x.fillRect(fx - 6, 84, 12, 2); x.fillStyle = 'rgba(40,24,14,0.5)'; for (let i = 0; i < 3; i++) x.fillRect(fx - 26, 46 - i * 4, 52, 1); }
    else { x.fillStyle = '#5a2418'; x.fillRect(fx - 6, 86, 12, 3); x.fillStyle = 'rgba(40,24,14,0.5)'; for (let i = 0; i < 3; i++) x.fillRect(fx - 26, 46 - i * 4, 52, 1); }
    x.fillStyle = 'rgba(20,12,8,0.35)'; x.fillRect(0, 0, w * 0.18, h); x.fillRect(w * 0.82, 0, w * 0.18, h);
  }, [1, 1]);
}
function texSky() {   // night: deep teal to a lighter haze at the horizon, thin cloud bands (dithers into dot screens); the moon is its own mesh
  return txCanvas('sky', 512, 256, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#06090f'); g.addColorStop(0.5, '#0b1a22'); g.addColorStop(0.78, '#1f3c44'); g.addColorStop(0.92, '#346c76'); g.addColorStop(1, '#2a3a3a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(52,108,118,0.16)', 'rgba(20,40,46,0.3)', 'rgba(120,150,150,0.1)']); const cy = R.r(h * 0.3, h * 0.85); x.beginPath(); x.ellipse(R.r(0, w), cy, R.r(30, 110), R.r(3, 9), 0, 0, TAU); x.fill(); }
    for (let i = 0; i < 160; i++) { x.fillStyle = 'rgba(220,230,230,' + R.r(0.2, 0.7) + ')'; x.fillRect(R.r(0, w), R.r(0, h * 0.55), 1, 1); } }, [1, 1]);
}
function texMoon() { return txCanvas('moon', 128, 128, (x, w, h, R) => { x.clearRect(0, 0, w, h); x.fillStyle = '#eeeadb'; x.beginPath(); x.arc(64, 64, 60, 0, TAU); x.fill(); for (let i = 0; i < 16; i++) { x.fillStyle = R.pick(['rgba(160,170,160,0.45)', 'rgba(190,196,186,0.4)']); const a = R.r(0, TAU), r = R.r(0, 45); blob(x, 64 + Math.cos(a) * r, 64 + Math.sin(a) * r, R.r(5, 16), R); x.fill(); } }, [1, 1]); }
function texLabel() { return txCanvas('label', 64, 32, (x, w, h) => { x.fillStyle = '#d4c8a0'; x.fillRect(0, 0, w, h); x.fillStyle = '#8e3a24'; x.fillRect(0, 10, w, 12); }, [1, 1]); }

// an old man's weathered skin (u = 0.25 is the front of the face, v = 0 the crown): sun-dark brown, forehead and
// crow's-feet creases, deep nasolabial folds, grey stubble on the jaw, age spots. Features themselves are geometry.
function texOldSkin(key = 'oldskin', base = '#8a5c3a') {
  return txCanvas(key, 256, 256, (x, w, h, R) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(70,40,22,0.25)', 'rgba(160,110,76,0.2)', 'rgba(110,64,40,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 16), R); x.fill(); }
    const fx = w * 0.25, A = (ang) => fx + ang * w / TAU, Y = (yn) => Math.acos(clamp(yn, -1, 1)) / Math.PI * h;   // head-local angle / height → canvas
    x.strokeStyle = 'rgba(50,28,16,0.7)'; x.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const yy = Y(0.66 - i * 0.07); x.beginPath(); x.moveTo(A(-0.45), yy + 2); x.quadraticCurveTo(fx, yy - 1 + R.n(1), A(0.45), yy + 2); x.stroke(); }   // forehead
    [-1, 1].forEach((sd) => { for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(A(sd * 0.55), Y(0.16) - 3 + i * 3); x.lineTo(A(sd * 0.72), Y(0.16) - 6 + i * 5); x.stroke(); }   // crow's feet
      x.lineWidth = 1.8; x.beginPath(); x.moveTo(A(sd * 0.16), Y(-0.2)); x.quadraticCurveTo(A(sd * 0.3), Y(-0.38), A(sd * 0.3), Y(-0.6)); x.stroke(); x.lineWidth = 1.2;   // nasolabial folds
      x.beginPath(); x.moveTo(A(sd * 0.5), Y(-0.15)); x.quadraticCurveTo(A(sd * 0.58), Y(-0.35), A(sd * 0.52), Y(-0.55)); x.stroke(); });   // the hollow under the cheekbone
    for (let i = 0; i < 700; i++) { const ang = R.n(0.75), yn = R.r(-0.95, -0.42); if (Math.abs(ang) < 0.2 && yn > -0.62) continue; x.fillStyle = R.pick(['rgba(196,190,178,0.55)', 'rgba(150,144,134,0.5)', 'rgba(90,70,56,0.35)']); x.fillRect(A(ang), Y(yn), 1, 1); }   // grey stubble on the jaw and chin
    for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(70,40,24,0.4)'; blob(x, A(R.n(0.6)), Y(R.r(0.25, 0.8)), R.r(1.2, 2.6), R); x.fill(); }   // age spots
  }, [1, 1]);
}

// ---- from inunaki: cedars, kimono, chochin paper, thatch, stone, the cedar ridge line
const JPM = "'Hiragino Mincho ProN', 'Hiragino Mincho Pro', serif", JPG = "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif", JPR = "'Hiragino Maru Gothic ProN', sans-serif";   // macOS system fonts (no web fonts)
function moss(x, R, cx, cy, r, a = 0.8) { for (let i = 0; i < 26; i++) { x.fillStyle = R.pick(['rgba(52,78,52,' + a + ')', 'rgba(70,96,60,' + a + ')', 'rgba(36,56,40,' + a + ')', 'rgba(96,112,70,' + a * 0.8 + ')']); blob(x, cx + R.n(r), cy + R.n(r * 0.6), R.r(r * 0.12, r * 0.4), R); x.fill(); } }
function texCedarBark() {
  return txCanvas('cbark', 64, 256, (x, w, h, R) => {
    x.fillStyle = '#4a3020'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.strokeStyle = R.pick(['#5a3c26', '#3a2416', '#6a4a30', '#2e1c12']); x.lineWidth = R.r(1, 4); x.beginPath(); let px = R.r(0, w); x.moveTo(px, 0); for (let y = 0; y < h; y += 16) { px += R.n(2); x.lineTo(px, y); } x.stroke(); }
    for (let i = 0; i < 8; i++) moss(x, R, R.r(0, w), R.r(h * 0.6, h), 10, 0.5);
  }, [1, 3]);
}
function texNeedles() {
  return txCanvas('needles', 128, 128, (x, w, h, R) => {
    x.fillStyle = '#16241e'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.strokeStyle = R.pick(['#22382c', '#2c4434', '#1a2c24', '#36503c', '#0e1814']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h), a = R.r(0.3, 1.2); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6); x.stroke(); }
  }, [2, 2]);
}
function texKimono(key, base, patch) {
  return txCanvas('kim' + key, 128, 128, (x, w, h, R) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { x.fillStyle = R.pick(['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.12)', 'rgba(60,40,20,0.1)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 12), R); x.fill(); }
    for (let i = 0; i < 5; i++) { const px = R.r(0, w - 30), py = R.r(0, h - 30), pw = R.r(16, 34), ph = R.r(14, 30); x.fillStyle = R.pick(patch); x.fillRect(px, py, pw, ph);
      x.strokeStyle = 'rgba(220,210,180,0.7)'; x.setLineDash([2, 2]); x.lineWidth = 1; x.strokeRect(px + 2, py + 2, pw - 4, ph - 4); x.setLineDash([]); }
    for (let r = 0; r < 2; r++) { x.strokeStyle = 'rgba(220,210,180,0.25)'; x.setLineDash([3, 3]); x.beginPath(); const yy = R.r(0, h); x.moveTo(0, yy); x.lineTo(w, yy + R.n(4)); x.stroke(); } x.setLineDash([]);
    for (let i = 0; i < 14; i++) { x.fillStyle = R.pick(['rgba(50,36,22,0.35)', 'rgba(30,22,14,0.4)', 'rgba(90,60,30,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(5, 18), R); x.fill(); }
    for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(8,6,4,0.9)'; blob(x, R.r(0, w), R.r(0, h), R.r(2, 5), R); x.fill(); }   // holes
  }, [2, 2]);
}
function texLantern() {
  return txCanvas('lant', 128, 128, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c8803a'); g.addColorStop(0.5, '#f2c87a'); g.addColorStop(1, '#c8803a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(90,40,10,0.35)'; for (let y = 4; y < h; y += 7) x.fillRect(0, y, w, 1.5);
    x.fillStyle = '#9a1e12'; x.font = "900 26px " + JPM; x.textAlign = 'center'; [['御', 30], ['神', 64], ['燈', 98]].forEach(([c, yy]) => { x.fillText(c, w * 0.25, yy); x.fillText(c, w * 0.75, yy); });
    x.fillStyle = 'rgba(30,14,6,0.4)'; x.fillRect(0, 0, w, 8); }, [1, 1]);
}
function texThatch() {
  return txCanvas('thatch', 128, 128, (x, w, h, R) => { x.fillStyle = '#4a3a24'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { x.strokeStyle = R.pick(['#6a5434', '#3a2c1a', '#7a6440', '#2e2414', '#56462c']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(1), py + R.r(5, 12)); x.stroke(); }
    for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(20,16,10,0.6)'; x.fillRect(0, k * 32 + 28, w, 3); }
    for (let i = 0; i < 10; i++) moss(x, R, R.r(0, w), R.r(0, h), R.r(8, 20), 0.5); }, [2, 2]);
}
function texStone(key = 'stone', mossK = 1) {
  return txCanvas(key, 512, 512, (x, w, h, R) => {
    x.fillStyle = '#2b2d29'; x.fillRect(0, 0, w, h);
    const ch = 42; for (let r = 0; r * ch < h; r++) { let px = -R.r(0, 60); while (px < w) { const bw = R.r(56, 110); x.fillStyle = R.pick(['#6a6c64', '#5e615a', '#73746a', '#585a54', '#7c7a6c', '#646058']); x.fillRect(px + 2, r * ch + 2, bw - 4, ch - 4);
      for (let k = 0; k < 6; k++) { x.fillStyle = R.pick(['rgba(255,255,240,0.07)', 'rgba(0,0,0,0.12)']); blob(x, px + R.r(4, bw - 4), r * ch + R.r(4, ch - 4), R.r(3, 12), R); x.fill(); }
      x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px + 2, r * ch + ch - 7, bw - 4, 5); x.fillStyle = 'rgba(255,255,240,0.08)'; x.fillRect(px + 2, r * ch + 2, bw - 4, 3); px += bw; } }
    speckle(x, R, w, h, 9000, ['rgba(30,30,28,0.5)', 'rgba(140,140,128,0.35)'], [1, 2]);
    for (let i = 0; i < 16; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(70,46,26,0.55)'); g.addColorStop(R.r(0.4, 0.9), 'rgba(70,46,26,0)'); x.fillStyle = g; x.fillRect(cx, R.r(0, h * 0.4), R.r(4, 18), h); }
    for (let i = 0; i < 10; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(10,14,14,0.5)'); g.addColorStop(1, 'rgba(10,14,14,0)'); x.fillStyle = g; x.fillRect(cx, 0, R.r(10, 30), h * R.r(0.3, 1)); }
    for (let i = 0; i < 26 * mossK; i++) moss(x, R, R.r(0, w), R.f() < 0.6 ? R.r(0, h * 0.35) : R.r(0, h), R.r(14, 50), 0.75);
    for (let i = 0; i < 8; i++) crack(x, R, R.r(0, w), R.r(0, h), 8, R.n(4), R.r(6, 12));
  }, [1, 1]);
}
function texRidge(k) {   // a mountain ridge silhouette with cedar tips along its top (alpha)
  return txCanvas('ridge' + k, 512, 128, (x, w, h, R) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, h);
    let y = h * R.r(0.3, 0.6); for (let px = 0; px <= w; px += 4) { y += R.n(3) + (h * 0.45 - y) * 0.02; x.lineTo(px, y - (R.f() < 0.5 ? R.r(0, 8) : 0)); } x.lineTo(w, h); x.closePath(); x.fill();
    for (let px = 0; px < w; px += R.r(3, 7)) { const ty = h * 0.42 + R.n(h * 0.15); x.beginPath(); x.moveTo(px, ty - R.r(6, 16)); x.lineTo(px - 3, ty + 6); x.lineTo(px + 3, ty + 6); x.fill(); } }, [1, 1], false);
}

// a woven straw mat (mushiro): rows of plaited straw, a darker bound edge, wear and frost
function texMat() { return txCanvas('mat', 128, 128, (x, w, h, R) => { x.fillStyle = '#8a7444'; x.fillRect(0, 0, w, h);
  for (let r = 0; r < h; r += 4) for (let c = 0; c < w; c += 6) { x.fillStyle = R.pick(['#a08850', '#b49a5e', '#8e7646', '#c0a66a']); x.fillRect(c + ((r / 4) % 2) * 3, r, 5, 3); }
  x.fillStyle = 'rgba(40,28,14,0.55)'; for (let r = 0; r < h; r += 4) x.fillRect(0, r + 3, w, 1);
  x.fillStyle = '#4a3a22'; x.fillRect(0, 0, 4, h); x.fillRect(w - 4, 0, 4, h);
  for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(226,232,232,0.45)'; blob(x, R.r(0, w), R.r(0, h), R.r(3, 10), R); x.fill(); }
  for (let i = 0; i < 10; i++) { x.fillStyle = 'rgba(30,20,10,0.35)'; blob(x, R.r(0, w), R.r(0, h), R.r(2, 7), R); x.fill(); } }, [1, 2]); }
// frozen mountain ground: dark soil, gravel, dead grass, frost and snow crumbs (fine, so it never reads as camouflage)
function texFrost() { return txCanvas('frost', 256, 256, (x, w, h, R) => { x.fillStyle = '#4a3e2e'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(70,58,40,0.4)', 'rgba(50,42,30,0.4)', 'rgba(90,80,60,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 20), R); x.fill(); }
  speckle(x, R, w, h, 5000, ['#6a5c48', '#3a3024', '#7a7064', '#2c241a', '#8a8070'], [1, 3]);
  for (let i = 0; i < 400; i++) { x.strokeStyle = R.pick(['#7a6a48', '#5a4c34', '#8a7a58']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(5), py - R.r(3, 8)); x.stroke(); }
  speckle(x, R, w, h, 1600, ['rgba(220,228,228,0.8)', 'rgba(200,210,210,0.6)'], [1, 2]); }, [1, 1]); }

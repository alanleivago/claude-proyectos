// =====================================================================
//  TEXTURES — all drawn in code, seeded: old asphalt with faded lines and tar patches, the portal's masonry with moss
//  and water streaks, the concrete blocks with graffiti, the tunnel lining, cedar bark and needles, forest floor,
//  the hand-painted sign (system Japanese fonts), the plaque, the car's plates, kimono cloth with patches, filthy
//  bandages, the sukajan with its embroidered tiger, denim, thatch, shoji, paper lanterns, the night sky.
// =====================================================================
const TX = {};
function txCanvas(key, w, h, draw, rep = [1, 1], srgb = true) {
  if (TX[key]) return TX[key];
  const t = g3Tex((x) => draw(x, w, h, RNG('tx', key)), w, h, srgb); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.magFilter = THREE.LinearFilter; t.anisotropy = 4; return (TX[key] = t);
}
const blob = (x, cx, cy, r, R, k = 7) => { x.beginPath(); for (let i = 0; i <= k; i++) { const a = (i / k) * TAU, rr = r * (0.75 + R.f() * 0.4); i ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } x.closePath(); };
function grain(x, R, x0, y0, w, h, n, col) { for (let k = 0; k < n; k++) { x.strokeStyle = col; x.lineWidth = R.r(0.6, 1.6); x.beginPath(); let yy = y0 + R.r(2, h - 2); x.moveTo(x0, yy); for (let px = x0; px <= x0 + w; px += 16) { yy += R.n(1.2); x.lineTo(px, Math.min(y0 + h - 1, Math.max(y0 + 1, yy))); } x.stroke(); } }
const JPM = "'Hiragino Mincho ProN', 'Hiragino Mincho Pro', serif", JPG = "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif", JPR = "'Hiragino Maru Gothic ProN', sans-serif";   // macOS system fonts (no web fonts)
function crack(x, R, px, py, n, dx, dy, col = 'rgba(14,12,10,0.8)', lw = 1.2) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < n; k++) { px += dx + R.n(5); py += dy + R.n(5); x.lineTo(px, py); if (R.f() < 0.2) { x.moveTo(px, py); } } x.stroke(); }
function speckle(x, R, w, h, n, cols, s = [1, 2]) { for (let i = 0; i < n; i++) { x.fillStyle = R.pick(cols); const q = R.r(s[0], s[1]); x.fillRect(R.r(0, w), R.r(0, h), q, q); } }
function moss(x, R, cx, cy, r, a = 0.8) { for (let i = 0; i < 26; i++) { x.fillStyle = R.pick(['rgba(52,78,52,' + a + ')', 'rgba(70,96,60,' + a + ')', 'rgba(36,56,40,' + a + ')', 'rgba(96,112,70,' + a * 0.8 + ')']); blob(x, cx + R.n(r), cy + R.n(r * 0.6), R.r(r * 0.12, r * 0.4), R); x.fill(); } }

// old asphalt: aggregate, tar-sealed cracks, patches, oil; the road texture adds faded edge lines and a centre line
function asphaltBase(x, w, h, R, k = 1) {
  x.fillStyle = '#34373a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(20,22,24,0.35)', 'rgba(70,72,72,0.25)', 'rgba(44,40,36,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 50), R); x.fill(); }
  speckle(x, R, w, h, w * h * 0.05, ['#2a2c2e', '#4a4c4c', '#575a58', '#222426', '#3e3a34'], [1, 2]);
  for (let i = 0; i < 4 * k; i++) { x.fillStyle = 'rgba(16,17,18,0.75)'; x.fillRect(R.r(0, w - 60), R.r(0, h - 60), R.r(30, 90), R.r(30, 90)); }   // patches
  for (let i = 0; i < 14 * k; i++) crack(x, R, R.r(0, w), R.r(0, h), 7, R.n(6), R.r(4, 10), 'rgba(12,12,12,0.9)', R.r(1, 2.2));
  for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(30,40,50,0.25)'; blob(x, R.r(0, w), R.r(0, h), R.r(6, 18), R); x.fill(); }   // oil
}
function texRoad() {   // u across the road (6.2 m), v along it (12.4 m per repeat)
  return txCanvas('road', 256, 512, (x, w, h, R) => {
    asphaltBase(x, w, h, R, 1.4);
    const line = (u0, u1, y0, y1, c) => { x.fillStyle = c; x.fillRect(u0 * w, y0, (u1 - u0) * w, y1 - y0); };
    for (const u of [0.07, 0.93]) { line(u - 0.012, u + 0.012, 0, h, 'rgba(214,216,204,0.55)'); }
    for (let y = 0; y < h; y += 128) line(0.488, 0.512, y, y + 70, 'rgba(206,170,80,0.5)');   // faded yellow dashes
    speckle(x, R, w, h, 3000, ['rgba(52,54,56,0.9)', 'rgba(40,42,44,0.9)'], [1, 3]);   // wear over the paint
    for (let i = 0; i < 18; i++) crack(x, R, R.r(0, w), R.r(0, h), 6, R.n(8), R.r(4, 10), 'rgba(10,10,10,0.9)', 1.4);
    for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(70,50,30,0.6)', 'rgba(110,70,40,0.5)', 'rgba(40,60,40,0.5)']); x.fillRect(R.f() < 0.5 ? R.r(0, 16) : R.r(w - 16, w), R.r(0, h), R.r(3, 8), R.r(2, 5)); }   // needles and leaves at the edges
  }, [1, 1]);
}
function texAsphalt(key = 'asph', rep = [2, 2]) { return txCanvas(key, 256, 256, (x, w, h, R) => asphaltBase(x, w, h, R), rep); }
// coursed stone masonry: blocks with mortar, chipped corners, moss in the joints, rust-brown water streaks
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
// rough concrete: formwork seams, pits, chips, stains
function concreteBase(x, w, h, R, base = '#7a7c74') {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(40,42,40,0.18)', 'rgba(200,200,190,0.12)', 'rgba(90,70,50,0.15)']); blob(x, R.r(0, w), R.r(0, h), R.r(8, 50), R); x.fill(); }
  speckle(x, R, w, h, w * h * 0.04, ['rgba(30,30,30,0.6)', 'rgba(170,170,160,0.4)', 'rgba(60,60,58,0.5)'], [1, 2]);
  for (let i = 0; i < 6; i++) { const yy = R.r(0, h); x.fillStyle = 'rgba(30,30,30,0.35)'; x.fillRect(0, yy, w, 2); }
  for (let i = 0; i < 6; i++) crack(x, R, R.r(0, w), R.r(0, h), 6, R.n(8), R.r(4, 9), 'rgba(20,20,20,0.85)', 1.3);
  for (let i = 0; i < 8; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(40,30,20,0.45)'); g.addColorStop(1, 'rgba(40,30,20,0)'); x.fillStyle = g; x.fillRect(cx, 0, R.r(6, 20), h); }
}
// graffiti: spray tags, a big painted 立入禁止 (no entry), 犬鳴, arrows, hearts and dates (the kind left by dare-visitors)
function graffiti(x, R, w, h, k = 1) {
  const sprays = ['rgba(232,232,222,0.85)', 'rgba(190,40,30,0.85)', 'rgba(40,60,120,0.8)', 'rgba(230,200,60,0.75)', 'rgba(20,20,20,0.85)'];
  for (let i = 0; i < 5 * k; i++) { x.strokeStyle = R.pick(sprays); x.lineWidth = R.r(3, 7); x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); let px = R.r(0, w * 0.8), py = R.r(h * 0.2, h * 0.9); x.moveTo(px, py);
    for (let s = 0; s < 9; s++) { px += R.r(4, 18); py += R.n(16); x.lineTo(px, py); } x.stroke(); }
  const words = ['犬鳴', '危険', '呪', '出る', '1993', '来るな', 'R.I.P', 'YOU DIE', '←'];
  for (let i = 0; i < 3 * k; i++) { x.save(); x.translate(R.r(10, w - 80), R.r(30, h - 20)); x.rotate(R.n(0.2)); x.fillStyle = R.pick(sprays); x.font = '700 ' + Math.round(R.r(22, 46)) + 'px ' + JPG; x.fillText(R.pick(words), 0, 0); x.restore(); }
}
function texBlock(i) {
  return txCanvas('block' + i, 256, 256, (x, w, h, R) => {
    concreteBase(x, w, h, R, R.pick(['#7a7c74', '#727468', '#84847a']));
    graffiti(x, R, w, h, i % 3 === 0 ? 1.4 : 0.8);
    if (i === 1) { x.save(); x.translate(18, 150); x.fillStyle = 'rgba(180,36,26,0.9)'; x.font = '900 52px ' + JPG; x.fillText('立入禁止', 0, 0); x.restore(); }
    if (i === 4) { x.save(); x.translate(40, 120); x.rotate(-0.08); x.fillStyle = 'rgba(232,232,222,0.9)'; x.font = '900 70px ' + JPM; x.fillText('犬鳴', 0, 0); x.restore(); }
    for (let k = 0; k < 4; k++) moss(x, R, R.r(0, w), R.r(h * 0.7, h), R.r(10, 30), 0.6);
  }, [1, 1]);
}
// the tunnel lining: concrete in rings (1.5 m), soot from old traffic, wet streaks, white efflorescence at the joints
function texLining() {
  return txCanvas('lining', 256, 512, (x, w, h, R) => {
    concreteBase(x, w, h, R, '#5e605a');
    for (let k = 0; k < 4; k++) { const yy = k * 128; x.fillStyle = 'rgba(16,16,16,0.75)'; x.fillRect(0, yy, w, 3); x.fillStyle = 'rgba(220,226,220,0.25)'; for (let i = 0; i < 30; i++) { const xx = R.r(0, w); x.fillRect(xx, yy + 3, R.r(2, 8), R.r(6, 40)); } }
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, 'rgba(10,10,10,0.35)'); g.addColorStop(0.5, 'rgba(10,10,10,0.5)'); g.addColorStop(0.65, 'rgba(10,10,10,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);   // soot on the crown
    for (let i = 0; i < 26; i++) { const cx = R.r(0, w), g2 = x.createLinearGradient(0, 0, 0, 1); x.fillStyle = 'rgba(20,24,24,0.4)'; x.fillRect(cx, R.r(0, h), R.r(2, 6), R.r(30, 160)); void g2; }
  }, [1, 1]);
}
function texGraffitiWall(i) {   // transparent decal for the tunnel walls near the entrance
  return txCanvas('gw' + i, 256, 128, (x, w, h, R) => { graffiti(x, R, w, h, 1.2); }, [1, 1]);
}
function texBark() {
  return txCanvas('bark', 64, 256, (x, w, h, R) => {
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
function texGround() {   // forest floor: soil, needles, moss, stones
  return txCanvas('ground', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#2a2a1e'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(40,58,40,0.6)', 'rgba(60,46,30,0.5)', 'rgba(30,40,32,0.6)', 'rgba(80,90,60,0.4)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), R); x.fill(); }
    for (let i = 0; i < 1500; i++) { x.strokeStyle = R.pick(['#5a4430', '#3c2c1e', '#6a5038', '#2c3a2c']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h), a = R.r(0, TAU); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 4, py + Math.sin(a) * 4); x.stroke(); }
    speckle(x, R, w, h, 300, ['#6a6a5e', '#4a4a42'], [2, 4]);
  }, [12, 12]);
}
// the hand-painted sign: three weathered boards, brush Japanese in black, the English in red capitals, drips and moss
function texSign() {
  return txCanvas('sign', 520, 400, (x, w, h, R) => {
    for (let b = 0; b < 3; b++) { x.fillStyle = R.pick(['#bdb39a', '#b3aa90', '#c4bba2']); x.fillRect(0, b * (h / 3), w, h / 3); grain(x, R, 0, b * (h / 3), w, h / 3, 14, 'rgba(70,56,40,0.35)'); x.fillStyle = 'rgba(30,22,14,0.85)'; x.fillRect(0, b * (h / 3), w, 3); }
    for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(80,70,50,0.18)', 'rgba(40,60,40,0.16)', 'rgba(255,250,235,0.1)']); blob(x, R.r(0, w), R.r(0, h), R.r(10, 40), R); x.fill(); }
    // brush text: stamped a few times with small offsets so the strokes have ragged edges; drips under the strokes
    const brush = (str, font, px, py, col, n = 4) => { x.font = font; x.fillStyle = col; for (let k = 0; k < n; k++) x.fillText(str, px + R.n(1.2), py + R.n(1.2)); const m = x.measureText(str).width;
      for (let k = 0; k < Math.round(m / 40); k++) { const dx = px + R.r(0, m), dl = R.r(6, 26); x.fillRect(dx, py + 2, R.r(1.5, 3), dl); x.beginPath(); x.arc(dx + 1, py + 2 + dl, 2.2, 0, TAU); x.fill(); } };
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    brush('この先、日本国憲法', "900 50px " + JPM, 22, 72, '#16110c');
    brush('通用せず', "900 64px " + JPM, 120, 150, '#16110c');
    x.fillStyle = '#7a1c14'; x.fillRect(24, 172, w - 48, 6);
    brush('BEYOND THIS POINT,', "900 40px 'Arial Black', 'Helvetica Neue', sans-serif", 22, 232, '#8a1e14');
    brush('THE LAW OF JAPAN', "900 40px 'Arial Black', 'Helvetica Neue', sans-serif", 22, 298, '#8a1e14');
    brush('DOES NOT APPLY', "900 40px 'Arial Black', 'Helvetica Neue', sans-serif", 22, 364, '#8a1e14');
    // weathering: scrapes through the paint, rain streaks, moss at the bottom edge
    x.save(); x.globalCompositeOperation = 'destination-over'; x.restore();
    for (let i = 0; i < 220; i++) { x.fillStyle = R.pick(['rgba(189,179,154,0.7)', 'rgba(170,160,135,0.6)']); x.fillRect(R.r(0, w), R.r(0, h), R.r(3, 18), R.r(1, 2)); }
    for (let i = 0; i < 12; i++) { const cx = R.r(0, w), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(60,44,30,0.35)'); g.addColorStop(1, 'rgba(60,44,30,0)'); x.fillStyle = g; x.fillRect(cx, 0, R.r(3, 9), h); }
    for (let i = 0; i < 6; i++) moss(x, R, R.r(0, w), R.r(h - 30, h), R.r(10, 24), 0.7);
    for (let i = 0; i < 3; i++) moss(x, R, R.r(0, w), R.r(0, 20), R.r(8, 16), 0.6);
  }, [1, 1]);
}
function texPlaque() {
  return txCanvas('plaque', 256, 96, (x, w, h, R) => { x.fillStyle = '#4a4a42'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b2d29'; x.fillRect(6, 6, w - 12, h - 12); x.fillStyle = '#9a9a8a';
    x.font = "700 56px " + JPM; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('犬鳴隧道', w / 2, h / 2 + 3);
    for (let i = 0; i < 6; i++) moss(x, R, R.r(0, w), R.r(0, h), 12, 0.5); speckle(x, R, w, h, 900, ['rgba(20,20,20,0.5)', 'rgba(150,150,140,0.3)']); }, [1, 1]);
}
function texPlate(rear) {   // a Japanese private plate: white, green lettering
  return txCanvas('plate' + (rear ? 'r' : 'f'), 128, 64, (x, w, h) => { x.fillStyle = '#e8e6da'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2c5a3a'; x.lineWidth = 3; x.strokeRect(2, 2, w - 4, h - 4);
    x.fillStyle = '#245236'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = "600 16px " + JPG; x.fillText('福岡 52', w / 2, 15); x.font = "600 15px " + JPG; x.fillText('ね', 16, 44); x.font = "700 32px 'Helvetica Neue', sans-serif"; x.fillText('18-07', w / 2 + 10, 44); }, [1, 1]);
}
// kimono cloth (noragi): base dye, faded, patches sewn on with sashiko running stitches, mud, rot, dark stains at the hem
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
// the ragged hem: an alpha mask (white cloth, torn strips at the bottom = v near 0)
function texRag(key) {
  return txCanvas('rag' + key, 128, 64, (x, w, h, R) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000';
    let px = 0; while (px < w) { const sw = R.r(3, 9), d = R.f() < 0.35 ? R.r(h * 0.3, h * 0.75) : R.r(0, h * 0.18); x.fillRect(px, h - d, R.r(1, 3), d); x.beginPath(); x.moveTo(px, h); x.lineTo(px + sw * 0.5, h - d * R.r(0.2, 0.9)); x.lineTo(px + sw, h); x.fill(); px += sw; }
    for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(R.r(0, w), R.r(h * 0.3, h * 0.9), R.r(1.5, 4), 0, TAU); x.fill(); } }, [2, 1], false);
}
// filthy bandages: overlapping diagonal strips of yellowed cotton, frayed edges, rust and brown seepage, grime
function bandage(x, w, h, R, ang = 0.25) {
  x.fillStyle = '#9a8c6a'; x.fillRect(0, 0, w, h);
  x.save(); x.translate(w / 2, h / 2); x.rotate(ang);
  const D = Math.hypot(w, h); for (let y = -D / 2; y < D / 2; y += R.r(7, 12)) { const bh = R.r(9, 14); x.fillStyle = R.pick(['#a89a78', '#9c8e6c', '#b0a282', '#8e8062', '#a49470']); x.fillRect(-D / 2, y, D, bh);
    x.fillStyle = 'rgba(60,46,28,0.45)'; x.fillRect(-D / 2, y + bh - 1.5, D, 1.5); x.fillStyle = 'rgba(255,250,230,0.25)'; x.fillRect(-D / 2, y, D, 1);
    for (let k = 0; k < 6; k++) { x.fillStyle = 'rgba(80,64,40,0.4)'; x.fillRect(R.r(-D / 2, D / 2), y + bh - 1, R.r(1, 2), R.r(1, 3)); } }
  x.restore();
  for (let i = 0; i < 26; i++) { const c = R.pick(['rgba(110,60,30,0.4)', 'rgba(70,40,20,0.35)', 'rgba(130,90,40,0.28)', 'rgba(60,70,50,0.3)', 'rgba(90,30,20,0.32)']), g = x.createLinearGradient(0, 0, 0, h); const px = R.r(0, w), py = R.r(0, h), L = R.r(10, 50); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.save(); x.translate(px, py); x.fillRect(-R.r(2, 7), 0, R.r(4, 14), L); x.restore(); }
  speckle(x, R, w, h, w * h * 0.03, ['rgba(40,30,20,0.4)', 'rgba(255,250,230,0.15)'], [1, 2]);
}
function texBandage(key = 'band', rep = [1, 1]) { return txCanvas('bnd' + key, 128, 128, (x, w, h, R) => bandage(x, w, h, R, 0.35), rep); }
// the wrapped head (u around, face at u = 0.25 on a three.js sphere): bandages + the gap at one eye, dark and wet
function texHead(seed, eyeSide) {
  return txCanvas('head' + seed, 256, 128, (x, w, h, R) => {
    bandage(x, w, h, R, 0.12 + R.n(0.1));
    for (let i = 0; i < 4; i++) { x.save(); x.translate(R.r(0, w), h / 2); x.rotate(R.n(0.6)); x.fillStyle = R.pick(['#c8b894', '#b8a882']); x.fillRect(-60, R.n(30), 120, 11); x.fillStyle = 'rgba(60,46,28,0.5)'; x.fillRect(-60, R.n(30) + 10, 120, 1.5); x.restore(); }
    const ex = w * 0.25 + eyeSide * 13, ey = h * 0.44;
    // the gap: a dark wet slit around the eye, grime and old blood around it
    { const g = x.createRadialGradient(ex, ey, 1, ex, ey, 20); g.addColorStop(0, 'rgba(14,6,5,1)'); g.addColorStop(0.5, 'rgba(40,16,10,0.95)'); g.addColorStop(1, 'rgba(90,50,30,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(ex, ey, 20, 11, 0.12, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(30,14,8,0.9)'; x.lineWidth = 2; x.beginPath(); x.moveTo(ex - 22, ey - 7); x.lineTo(ex + 20, ey - 10); x.stroke(); x.beginPath(); x.moveTo(ex - 20, ey + 8); x.lineTo(ex + 18, ey + 6); x.stroke(); }
    for (let i = 0; i < 6; i++) { x.fillStyle = R.pick(['rgba(70,24,14,0.6)', 'rgba(40,20,10,0.55)']); blob(x, w * 0.25 + R.n(26), h * R.r(0.5, 0.85), R.r(4, 11), R); x.fill(); }
    x.fillStyle = 'rgba(100,30,20,0.55)'; x.fillRect(ex - 3, ey + 6, 3, 18); x.fillRect(ex + 6, ey + 5, 2, 10);
    // a dark seep where the mouth would be, nothing more
    x.fillStyle = 'rgba(60,30,20,0.55)'; blob(x, w * 0.25 + R.n(4), h * 0.7, 9, R); x.fill();
    x.strokeStyle = 'rgba(40,22,14,0.6)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(w * 0.25 - 10, h * 0.7); x.lineTo(w * 0.25 + 12, h * 0.7 + 1); x.stroke();
  }, [1, 1]);
}
// the eyeball: bloodshot white, a dark red iris, a pin-prick pupil (iris centred at u = 0.25 on the sphere)
function texEye() {
  return txCanvas('eye', 64, 32, (x, w, h, R) => { x.fillStyle = '#b8ae90'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { x.strokeStyle = 'rgba(150,40,30,0.7)'; x.lineWidth = 0.7; x.beginPath(); let px = R.f() < 0.5 ? 0 : w * 0.5, py = R.r(0, h); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += R.r(2, 5) * (px < w * 0.25 ? 1 : -1); py += R.n(2); x.lineTo(px, py); } x.stroke(); }
    x.fillStyle = '#8e1e12'; x.beginPath(); x.arc(w * 0.25, h / 2, 5, 0, TAU); x.fill(); x.fillStyle = '#4a0a06'; x.beginPath(); x.arc(w * 0.25, h / 2, 3.4, 0, TAU); x.fill(); x.fillStyle = '#050202'; x.beginPath(); x.arc(w * 0.25, h / 2, 1.2, 0, TAU); x.fill(); x.fillStyle = 'rgba(120,30,20,0.6)'; x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3); }, [1, 1]);
}
// the brother: navy satin sukajan with an embroidered tiger on the back, ribbed orange-black knit, denim, a painted face
function texSukajan() {
  return txCanvas('suka', 256, 128, (x, w, h, R) => {
    x.fillStyle = '#1c2236'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const g = x.createLinearGradient(0, 0, w, 0); x.fillStyle = 'rgba(160,180,210,0.06)'; x.fillRect(R.r(0, w), 0, R.r(4, 16), h); void g; }
    // back (u 0.75 on a three.js capsule = −z): a tiger in gold and orange thread, a few bold shapes
    const bx = w * 0.5, by = h * 0.45; x.save(); x.translate(bx, by);
    x.fillStyle = '#c8a050'; x.beginPath(); x.ellipse(0, 0, 26, 20, 0, 0, TAU); x.fill(); x.fillStyle = '#b8603a'; x.beginPath(); x.ellipse(0, 6, 16, 10, 0, 0, TAU); x.fill();
    x.fillStyle = '#16110c'; for (let k = -2; k <= 2; k++) x.fillRect(k * 9 - 2, -18, 3, 12); x.fillRect(-14, -2, 6, 4); x.fillRect(8, -2, 6, 4);
    x.fillStyle = '#eeeadb'; x.fillRect(-12, -3, 3, 2); x.fillRect(10, -3, 3, 2); x.restore();
    x.strokeStyle = '#8e3a24'; x.lineWidth = 2; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(bx + R.n(30), by + R.n(20), R.r(30, 40), R.r(0, 3), R.r(3, 6)); x.stroke(); }
    // chest: a small embroidered crane on the left breast (u 0.25 is the front)
    x.fillStyle = '#d3d6cc'; x.beginPath(); x.ellipse(w * 0.08, h * 0.32, 7, 4, 0.4, 0, TAU); x.fill(); x.fillStyle = '#b3271c'; x.fillRect(w * 0.08 + 5, h * 0.32 - 6, 3, 3);
    x.fillStyle = 'rgba(10,10,14,0.9)'; x.fillRect(0, 0, 2, h); x.fillRect(w - 2, 0, 2, h);   // the zip (front = u 0 on a lathe)
    x.fillStyle = '#9aa0a8'; x.fillRect(0, 0, 1, h);
  }, [1, 1]);
}
function texRib() { return txCanvas('rib', 64, 16, (x, w, h) => { for (let i = 0; i < w; i += 4) { x.fillStyle = '#16110c'; x.fillRect(i, 0, 2, h); x.fillStyle = '#b8603a'; x.fillRect(i + 2, 0, 2, h); } x.fillStyle = '#16110c'; x.fillRect(0, 6, w, 4); }, [4, 1]); }
function texDenim() { return txCanvas('denim', 64, 64, (x, w, h, R) => { x.fillStyle = '#34465e'; x.fillRect(0, 0, w, h); for (let i = -h; i < w; i += 3) { x.strokeStyle = 'rgba(200,210,230,0.12)'; x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); } speckle(x, R, w, h, 200, ['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.15)']); }, [3, 3]); }
// the brother's face (u 0.25 front): eyes, brows, nose shadow, a mouth (laugh 0/1)
const _bface = {};
function texFace(laugh) {
  if (_bface[laugh]) return _bface[laugh];
  const t = g3Tex((x, w, h) => { const R = RNG('bface'), cx = w * 0.25, ey = h * 0.47;
    x.fillStyle = '#a87a56'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(140,90,60,0.12)', 'rgba(200,150,110,0.1)']); blob(x, R.r(0, w), R.r(0, h), R.r(4, 14), R); x.fill(); }
    [-1, 1].forEach((sd) => { const ex = cx + sd * 22; x.fillStyle = '#e6dcc8'; x.beginPath(); x.ellipse(ex, ey, 8, laugh ? 2.5 : 4, 0, 0, TAU); x.fill(); x.fillStyle = '#1a120c'; x.beginPath(); x.arc(ex + sd * 0.5, ey, laugh ? 2.4 : 3.4, 0, TAU); x.fill();
      x.strokeStyle = '#16110c'; x.lineWidth = 3.5; x.beginPath(); x.moveTo(ex - 10, ey - 11 + (laugh ? -2 : 0)); x.quadraticCurveTo(ex, ey - 15, ex + 10, ey - 11 + sd * 1); x.stroke(); });
    x.fillStyle = 'rgba(90,56,36,0.6)'; x.fillRect(cx - 2, ey + 6, 5, 16); x.fillRect(cx - 6, ey + 21, 12, 3);
    if (laugh) { x.fillStyle = '#3a1410'; x.beginPath(); x.moveTo(cx - 18, ey + 32); x.quadraticCurveTo(cx, ey + 30, cx + 18, ey + 32); x.quadraticCurveTo(cx, ey + 50, cx - 18, ey + 32); x.fill(); x.fillStyle = '#e6dcc8'; x.fillRect(cx - 13, ey + 32, 26, 4); }
    else { x.strokeStyle = '#5a2a1e'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(cx - 12, ey + 34); x.quadraticCurveTo(cx, ey + 36, cx + 12, ey + 33); x.stroke(); }
  }, 256, 128); t.magFilter = THREE.LinearFilter; return (_bface[laugh] = t);
}
function texThatch() {
  return txCanvas('thatch', 128, 128, (x, w, h, R) => { x.fillStyle = '#4a3a24'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { x.strokeStyle = R.pick(['#6a5434', '#3a2c1a', '#7a6440', '#2e2414', '#56462c']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(1), py + R.r(5, 12)); x.stroke(); }
    for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(20,16,10,0.6)'; x.fillRect(0, k * 32 + 28, w, 3); }
    for (let i = 0; i < 10; i++) moss(x, R, R.r(0, w), R.r(0, h), R.r(8, 20), 0.5); }, [2, 2]);
}
function texShoji() {
  return txCanvas('shoji', 64, 64, (x, w, h) => { x.fillStyle = '#e8c890'; x.fillRect(0, 0, w, h); x.fillStyle = '#3c2c1e'; for (let i = 0; i <= 4; i++) { x.fillRect(i * 16 - 1, 0, 2, h); x.fillRect(0, i * 16 - 1, w, 2); } x.fillStyle = 'rgba(80,40,20,0.25)'; x.fillRect(20, 30, 10, 18); }, [1, 1]);
}
function texPlank() { return txCanvas('plank', 128, 128, (x, w, h, R) => { for (let i = 0; i < 8; i++) { x.fillStyle = R.pick(['#3c2c1e', '#4a3a28', '#33261a', '#2b2219']); x.fillRect(i * 16, 0, 16, h); x.fillStyle = 'rgba(10,6,4,0.8)'; x.fillRect(i * 16, 0, 2, h); } for (let i = 0; i < 4; i++) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,30,30,0.5)'); x.fillStyle = g; x.fillRect(0, h * 0.5, w, h * 0.5); } }, [1, 1]); }
// a paper lantern (chōchin): warm paper with ribs, 御神燈 in red, soot at the top
function texLantern() {
  return txCanvas('lant', 128, 128, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c8803a'); g.addColorStop(0.5, '#f2c87a'); g.addColorStop(1, '#c8803a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(90,40,10,0.35)'; for (let y = 4; y < h; y += 7) x.fillRect(0, y, w, 1.5);
    x.fillStyle = '#9a1e12'; x.font = "900 26px " + JPM; x.textAlign = 'center'; [['御', 30], ['神', 64], ['燈', 98]].forEach(([c, yy]) => { x.fillText(c, w * 0.25, yy); x.fillText(c, w * 0.75, yy); });
    x.fillStyle = 'rgba(30,14,6,0.4)'; x.fillRect(0, 0, w, 8); }, [1, 1]);
}
function texSky() {   // overcast night: a teal gradient with drifting cloud masses (dithers into dot screens)
  return txCanvas('sky', 512, 256, (x, w, h, R) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#06090f'); g.addColorStop(0.55, '#0b1a22'); g.addColorStop(0.8, '#1f3c44'); g.addColorStop(1, '#2a3a3a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(52,108,118,0.18)', 'rgba(20,40,46,0.3)', 'rgba(80,120,124,0.12)']); blob(x, R.r(0, w), R.r(h * 0.25, h * 0.85), R.r(20, 70), R, 9); x.fill(); } }, [1, 1]);
}
function texRidge(k) {   // a mountain ridge silhouette with cedar tips along its top (alpha)
  return txCanvas('ridge' + k, 512, 128, (x, w, h, R) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, h);
    let y = h * R.r(0.3, 0.6); for (let px = 0; px <= w; px += 4) { y += R.n(3) + (h * 0.45 - y) * 0.02; x.lineTo(px, y - (R.f() < 0.5 ? R.r(0, 8) : 0)); } x.lineTo(w, h); x.closePath(); x.fill();
    for (let px = 0; px < w; px += R.r(3, 7)) { const ty = h * 0.42 + R.n(h * 0.15); x.beginPath(); x.moveTo(px, ty - R.r(6, 16)); x.lineTo(px - 3, ty + 6); x.lineTo(px + 3, ty + 6); x.fill(); } }, [1, 1], false);
}
function texMetal(key, base) { return txCanvas('met' + key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { x.fillStyle = R.pick(['rgba(110,60,30,0.5)', 'rgba(80,40,20,0.5)', 'rgba(255,255,255,0.08)']); blob(x, R.r(0, w), R.r(0, h), R.r(2, 9), R); x.fill(); } }, [1, 1]); }
function texStraw() { return txCanvas('straw', 64, 64, (x, w, h, R) => { x.fillStyle = '#8a7444'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.strokeStyle = R.pick(['#a08850', '#6a5432', '#b49a5e']); x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.r(4, 10), py + R.n(1)); x.stroke(); } }, [1, 1]); }
const TXM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));

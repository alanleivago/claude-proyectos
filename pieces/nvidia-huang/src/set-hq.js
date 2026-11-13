// =====================================================================
//  SET hq — the HQ open-plan floor on a Sunday evening (x -36..36, z 0..54, h 24). Back wall (z 0) = tall windows onto a
//  dusk city, except a solid section (x -9..1) with the wall calendar "SUN · NOV 8", a clock and the plain-text floor sign.
//  Huang's glass corner office in the back-right corner (x 10..36, z 0..14): glass walls 14.4 high with an OPEN top (the
//  camera cranes in and out over the header), blinds on the front glass (z 14) that he lowers with the cord, his walnut desk
//  facing the window (monitor readable over his shoulder), exec chair, shelves, plants. Open floor: two pods of desks right in
//  front of the office (the staff sit with their backs to it), more desks on the left, a coffee bar, columns, plants, ducts.
//  Registers s10 g1 s11 (27.28-33.46) as ONE continuous take (seqCam 'hq'). Prefix HQ / hq.
// =====================================================================
// headwear (FIX3: every head unique in the piece): hat styles = a base hair style + an HQhat drawn over it in its own colours
T3_HSTYLE.HQbeanie = Object.assign({}, T3_HSTYLE.ponytail, { HQhat: { k: 'beanie', c: '#e8902a', c2: '#fff2dc' } }); delete T3_HSTYLE.HQbeanie.tie;
T3_HSTYLE.HQguard = Object.assign({}, T3_HSTYLE.short, { HQhat: { k: 'guard', c: '#27345e', c2: '#16161e', c3: '#e6b93a' } });
T3_HSTYLE.HQband = Object.assign({}, T3_HSTYLE.curly, { HQhat: { k: 'band', c: '#ff5a5a', c2: '#ffffff' } });
function hqHat(h, H, f, cx, cy, A, Bh, light) {   // drawn on the hair layer (the card's ink outlines the union); u across, v down, 0 = head centre
  const back = f.back, P = (u, v) => [cx + (u + (back ? 0 : -f.dir * 0.1 * Math.max(0, f.m - 1))) * A, cy + v * Bh], S = (q, n = 8) => t3Spline(q.map(([u, v]) => P(u, v)), n);
  const band = (top, bot) => S(top).concat(S(bot).reverse()), gs = Math.cos(light) > 0.12 ? -1 : 1, lw = 0.034 * Bh;
  h.save(); h.setTransform(f.k, 0, 0, f.k, 0, 0); h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.filter = 'none'; h.lineJoin = 'round'; h.lineCap = 'round';
  const fill = (q, col, stroke = true) => { t3Path(h, q); const [x0, y0] = P(gs * 0.7, -1.3), [x1, y1] = P(-gs * 0.9, -0.3), g = h.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, t3Mix(col, '#ffffff', 0.25)); g.addColorStop(0.45, col); g.addColorStop(1, t3Mul(col, 0.66)); h.fillStyle = g; h.fill(); if (stroke) { h.lineWidth = lw; h.strokeStyle = T3.ink; h.stroke(); } };
  const line = (q, col, w, al) => { h.save(); h.globalAlpha = al; t3Stroke(h, S(q, 6), w * Bh, col); h.restore(); };
  if (H.k === 'beanie') {   // knit beanie: ribbed dome, a turned-up cuff, a pompom
    const dome = band([[-1.13, -0.58], [-1.08, -0.98], [-0.7, -1.3], [0, -1.42], [0.7, -1.3], [1.08, -0.98], [1.13, -0.58]], [[-1.13, -0.58], [0, -0.66], [1.13, -0.58]]); fill(dome, H.c);
    for (let i = -3; i <= 3; i++) line([[i * 0.29, -0.66], [i * 0.3, -1.0], [i * 0.14, -1.34]], t3Mul(H.c, 0.6), 0.022, 0.5);
    const tv = (u) => -0.62 - 0.14 * (1 - (u / 1.2) ** 2), bv = (u) => -0.34 - 0.12 * (1 - (u / 1.2) ** 2), us = [-1.18, -0.6, 0, 0.6, 1.18];
    fill(band(us.map((u) => [u, tv(u)]), us.map((u) => [u, bv(u)])), t3Mul(H.c, 0.92));
    for (let u = -1.02; u <= 1.03; u += 0.17) line([[u, tv(u) + 0.04], [u, (tv(u) + bv(u)) / 2], [u, bv(u) - 0.04]], t3Mul(H.c, 0.55), 0.02, 0.55);
    const [px, py] = P(0, -1.47); t3Path(h, t3Blob(px, py, 0.21 * A, 0.19 * Bh, 2, 2, 0, 28)); h.fillStyle = H.c2; h.fill(); h.lineWidth = lw; h.strokeStyle = T3.ink; h.stroke();
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; line([[Math.cos(a) * 0.06, -1.47 + Math.sin(a) * 0.05], [Math.cos(a) * 0.13, -1.47 + Math.sin(a) * 0.11]], '#c8b8a0', 0.016, 0.6); } }
  else if (H.k === 'guard') {   // security guard's peaked cap: wide flat crown, black band, gold badge, black visor
    fill(band([[-1.06, -0.62], [-1.2, -0.92], [-1.38, -1.12], [-0.9, -1.38], [0, -1.44], [0.9, -1.38], [1.38, -1.12], [1.2, -0.92], [1.06, -0.62]], [[-1.06, -0.62], [0, -0.66], [1.06, -0.62]]), H.c);
    line([[-1.3, -1.1], [-0.6, -1.2], [0, -1.22], [0.6, -1.2], [1.3, -1.1]], t3Mul(H.c, 0.55), 0.024, 0.6);
    fill(band([[-1.08, -0.74], [0, -0.8], [1.08, -0.74]], [[-1.08, -0.5], [0, -0.55], [1.08, -0.5]]), H.c2);
    if (!back) { const [bx, by] = P(0, -0.98); t3Path(h, t3Blob(bx, by, 0.15 * A, 0.17 * Bh, 2, 1.4, 0, 28)); h.fillStyle = H.c3; h.fill(); h.lineWidth = lw * 0.8; h.strokeStyle = T3.ink; h.stroke();
      fill(band([[-0.96, -0.54], [0, -0.56], [0.96, -0.54]], [[-0.96, -0.54], [-0.5, -0.42], [0, -0.38], [0.5, -0.42], [0.96, -0.54]]), '#202028');
      line([[gs * 0.62, -0.5], [gs * 0.3, -0.44], [0, -0.42]], '#ffffff', 0.02, 0.45); } }
  else if (H.k === 'band') {   // a wide sporty headband with a white stripe across the curls
    const us = [-1.2, -0.6, 0, 0.6, 1.2], tv = (u) => -0.52 - 0.28 * (1 - (u / 1.2) ** 2), bv = (u) => -0.32 - 0.26 * (1 - (u / 1.2) ** 2);
    fill(band(us.map((u) => [u, tv(u)]), us.map((u) => [u, bv(u)])), H.c); line(us.map((u) => [u * 0.98, (tv(u) + bv(u)) / 2]), H.c2, 0.04, 0.95); }
  h.restore(); }
const hqHairBase = t3HairLayers;
t3HairLayers = function (o, f, cx, cy, A, Bh, light, env, hp) { const r = hqHairBase(o, f, cx, cy, A, Bh, light, env, hp), S = t3Style(o.hair);
  if (r && S && S.HQhat) hqHat(r.hc.getContext('2d'), S.HQhat, f, cx, cy, A, Bh, light); return r; };
Object.assign(CAST, {   // invented staff, distinct faces (Sunday: a handful at their desks); heads: bob, mop, bowl, topknot2 + three hats
  HQa: { key: 'HQa', hair: 'bob', hairColor: 'black', outfit: 'sweater', colors: { main: '#2a9aa0', rib: '#1e767c' }, skin: 'peach', body: 'avg' },
  HQb: { key: 'HQb', hair: 'mop', hairColor: 'auburn', outfit: 'shirt', colors: { main: '#f2c24a', tie: '#3a4ab8', pocket: true }, skin: 'brown', body: 'fat' },
  HQc: { key: 'HQc', hair: 'HQband', hairColor: 'blond', outfit: 'dress', colors: { main: '#e2508a', belt: '#5a2440' }, skin: 'white', body: 'thin' },
  HQd: { key: 'HQd', hair: 'bowl', hairColor: 'ginger', outfit: 'polo', colors: { main: '#3f74d8', collar: '#2f5cb8' }, skin: 'pale', body: 'short' },
  HQe: { key: 'HQe', hair: 'HQbeanie', hairColor: 'chestnut', outfit: 'vest', colors: { main: '#7a3a9a', shirt: '#f4eee2', tie: '#e8a23a' }, skin: 'tan', body: 'pear' },
  HQf: { key: 'HQf', hair: 'HQguard', hairColor: 'dark', outfit: 'guard', colors: { main: '#8ea5bd', tie: '#273042', badge: '#e6b93a', belt: '#24201f' }, skin: 'brown', body: 'tall' },
  HQg: { key: 'HQg', hair: 'topknot2', hairColor: 'brown', outfit: 'apron', colors: { main: '#5ab07a', apron: '#c9692c', collar: '#ffffff' }, skin: 'tan', body: 'avg' },
});
const HQ = {};
const HQ_X = 36, HQ_Z = 54, HQ_H = 24, HQ_GH = 14.4;   // room half-width, depth, height; glass office wall height
const HQ_OX = 10, HQ_OZ = 14;                           // the glass office: x HQ_OX..HQ_X, z 0..HQ_OZ
const HQ_HU = [22, 11.4], HQ_SEAT = 3.2;                // Huang's chair spot (he faces -z, the window), seat height
const HQ_MON = [21.2, 8.4, 8.5];                          // his monitor (centre of the email text)
const HQ_CORD = [20.2, 13.86];                          // the blind cord (x, z) on the front glass
const HQ_SEND = 32.06, HQ_BUZZ = 32.12;
const HQ_BL = { z0: 13.84, x0: 14.2, x1: 30.6, top: 13.7, bot: 1.0, n: 30 };   // the blinds on the front glass in front of him
// staff: [key, x, z, heading (world yaw they face at the desk), turn start, end expression]
const HQ_STAFF = [
  ['HQa', 19.4, 17.6, 0, 32.26, 'shock'], ['HQb', 25.2, 18.8, 0, 32.34, 'deadpan'],   // a staggered pair right in front of the office (they frame
  ['HQc', 16.4, 24.8, 0, 32.40, 'deadpan'], ['HQd', 27.6, 28.0, 0, 32.46, 'surprised'],     // his face in 9:16); the next two wider apart, out of that frame
  ['HQe', 6.0, 30.0, Math.PI / 2, 32.5, 'skeptical'], ['HQg', 34.0, 31.0, -Math.PI / 2, 32.46, 'shock'],
];
const hqE = (a, b, t) => clamp((t - a) / (b - a));
const hqK = (K, t, d = 0.14) => { let v = K[0][1]; for (let i = 1; i < K.length; i++) { const [k, x] = K[i]; if (t >= k) { const e = EZ.io(clamp((t - k) / d)); v = v + (x - v) * e; } } return v; };
const hqRep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

// ---- textures
function hqTexWall() { return tex((g, w, h) => { const R = RNG('hqwall'); g.fillStyle = '#3e9a5a'; g.fillRect(0, 0, w, h);   // saturated leaf-green paint, roller marks, a darker band low
  for (let x = 0; x < w; x += R.r(8, 26)) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,40,20,0.05)'; g.fillRect(x, 0, R.r(6, 20), h); }
  for (let k = 0; k < 260; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,30,10,0.06)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
  g.fillStyle = '#2c7a46'; g.fillRect(0, h * 0.82, w, h * 0.18); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h * 0.82, w, 3); }, 512, 512); }
function hqTexFloor() { return hqRep(tex((g, w, h) => { const R = RNG('hqfl'); g.fillStyle = '#b8783e'; g.fillRect(0, 0, w, h);   // honey oak planks
  for (let j = 0; j < 8; j++) { const off = R.r(0, w); for (let i = -1; i < 3; i++) { const x = off + i * w * 0.5, c = c3Shd('#c4844a', R.r(0.86, 1.1)), y = j * h / 8; g.fillStyle = c; g.fillRect(x % w, y + 1, w * 0.5 - 3, h / 8 - 2); g.fillRect(x % w - w, y + 1, w * 0.5 - 3, h / 8 - 2);
    g.strokeStyle = 'rgba(90,45,15,0.22)'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const yy = y + R.r(6, h / 8 - 6); g.beginPath(); g.moveTo(x % w, yy); g.bezierCurveTo(x % w + w * 0.15, yy + R.n(4), x % w + w * 0.3, yy + R.n(4), x % w + w * 0.48, yy); g.stroke(); } }
    g.fillStyle = 'rgba(60,30,10,0.35)'; g.fillRect(0, j * h / 8, w, 2); } }, 512, 512), 9, 9); }
function hqTexRug() { return tex((g, w, h) => { const R = RNG('hqrug'); g.fillStyle = '#2f5cb0'; g.fillRect(0, 0, w, h);   // cobalt carpet tiles with an orange border
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.fillStyle = c3Shd((i + j) % 2 ? '#3466bc' : '#2a54a4', R.r(0.94, 1.06)); g.fillRect(i * w / 8 + 1, j * h / 8 + 1, w / 8 - 2, h / 8 - 2);
    g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { const y = j * h / 8 + 4 + k * h / 56; g.beginPath(); g.moveTo(i * w / 8 + 3, y); g.lineTo((i + 1) * w / 8 - 3, y); g.stroke(); } }
  g.strokeStyle = '#f0902a'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); g.strokeStyle = '#1e3a78'; g.lineWidth = 4; g.strokeRect(24, 24, w - 48, h - 48); }, 512, 512); }
function hqTexCity() { return tex((g, w, h) => { const R = RNG('hqcity');   // a dusk skyline: deep blue -> violet -> tangerine horizon, lit towers, a bridge
  const sky = g.createLinearGradient(0, 0, 0, h * 0.72); sky.addColorStop(0, '#2a4ab8'); sky.addColorStop(0.42, '#7a5ac8'); sky.addColorStop(0.72, '#f0789a'); sky.addColorStop(1, '#ffb45a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const cx = R.r(0, w), cy = R.r(h * 0.06, h * 0.34), r = R.r(30, 70); g.fillStyle = 'rgba(255,170,190,0.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + (k - 2) * r * 0.7, cy + Math.abs(k - 2) * r * 0.1, r * 1.1, r * 0.32, 0, 0, TAU); g.fill(); } }
  g.fillStyle = '#ffe6a0'; g.beginPath(); g.arc(w * 0.18, h * 0.66, 34, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,220,150,0.35)'; g.beginPath(); g.arc(w * 0.18, h * 0.66, 60, 0, TAU); g.fill();
  g.fillStyle = '#8a6ab8'; g.beginPath(); g.moveTo(0, h * 0.74); for (let x = 0; x <= w; x += 30) g.lineTo(x, h * 0.66 + Math.sin(x * 0.008) * 16 + Math.sin(x * 0.023) * 8); g.lineTo(w, h); g.lineTo(0, h); g.fill();   // far hills
  const tower = (x, bw, bh, c, lit) => { const y0 = h * 0.8 - bh; g.fillStyle = c; g.fillRect(x, y0, bw, bh + h * 0.2); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x, y0, bw * 0.18, bh + h * 0.2);
    for (let y = y0 + 8; y < h * 0.98; y += 14) for (let xx = x + 5; xx < x + bw - 8; xx += 11) { const on = R.f() < lit; g.fillStyle = on ? (R.f() < 0.6 ? '#ffd27a' : '#fff0c0') : 'rgba(30,30,80,0.5)'; g.fillRect(xx, y, 6, 8); }
    if (R.f() < 0.4) { g.fillStyle = '#ff5a4a'; g.beginPath(); g.arc(x + bw / 2, y0 - 6, 4, 0, TAU); g.fill(); g.fillStyle = c; g.fillRect(x + bw / 2 - 1.5, y0 - 6, 3, 6); } };
  for (let i = 0; i < 26; i++) tower(i * w / 26 + R.r(-8, 8), R.r(34, 70), R.r(120, 260), ['#3a3a8a', '#4a3a90', '#2e4a98', '#5a4aa0'][i % 4], 0.35);
  for (let i = 0; i < 16; i++) tower(i * w / 16 + R.r(-10, 10), R.r(50, 96), R.r(70, 170), ['#2a2a66', '#342a6e', '#22386e'][i % 3], 0.5);
  g.strokeStyle = '#ffb45a'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.55, h * 0.86); g.quadraticCurveTo(w * 0.72, h * 0.74, w * 0.9, h * 0.86); g.stroke();   // a lit suspension bridge
  g.lineWidth = 2; for (let k = 0; k <= 12; k++) { const x = w * (0.55 + 0.35 * k / 12), y = h * 0.86 - Math.sin(Math.PI * k / 12) * h * 0.075; g.beginPath(); g.moveTo(x, y); g.lineTo(x, h * 0.86); g.stroke(); }
  g.fillStyle = '#22285a'; g.fillRect(0, h * 0.86, w, h * 0.14); for (let i = 0; i < 70; i++) { g.fillStyle = R.f() < 0.5 ? '#ffd27a' : '#ff8a6a'; g.fillRect(R.r(0, w), R.r(h * 0.87, h * 0.99), 4, 3); }
}, 2048, 768); }
function hqTexCal() { return tex((g, w, h) => { g.fillStyle = '#2a2a34'; g.fillRect(0, 0, w, h);   // the wall calendar: a big day page "SUN · NOV 8" over a month grid
  g.fillStyle = '#f4ecdc'; g.beginPath(); g.roundRect(w * 0.04, h * 0.03, w * 0.92, h * 0.94, 14); g.fill();
  g.fillStyle = '#d8342a'; g.beginPath(); g.roundRect(w * 0.04, h * 0.03, w * 0.92, h * 0.22, [14, 14, 0, 0]); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = '#9a9aa4'; g.beginPath(); g.arc(w * (0.13 + i * 0.093), h * 0.03, 9, 0, TAU); g.fill(); }
  inked(g, 'SUN · NOV 8', w / 2, h * 0.14, h * 0.11, '#ffffff', { stroke: '#7a1610', sw: h * 0.012, maxW: w * 0.84 });
  inked(g, '8', w * 0.5, h * 0.42, h * 0.27, '#d8342a', { stroke: '#5a120c', sw: h * 0.016, font: 'Georgia, serif' });
  inked(g, 'SUNDAY', w / 2, h * 0.585, h * 0.06, '#2a2a34', { stroke: false, maxW: w * 0.7 });
  g.strokeStyle = 'rgba(42,42,52,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.1, h * 0.635); g.lineTo(w * 0.9, h * 0.635); g.stroke();
  g.font = `700 ${h * 0.032}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => { g.fillStyle = i === 0 ? '#d8342a' : '#5a5a66'; g.fillText(d, w * (0.14 + i * 0.12), h * 0.67); });
  for (let d = 1; d <= 30; d++) { const c = (d - 1) % 7, r = Math.floor((d - 1) / 7), x = w * (0.14 + c * 0.12), y = h * (0.71 + r * 0.05);   // Nov 2026 starts on a Sunday
    if (d === 8) { g.strokeStyle = '#d8342a'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, h * 0.024, 0, TAU); g.stroke(); }
    g.fillStyle = d < 8 ? 'rgba(90,90,102,0.5)' : '#3a3a44'; g.fillText(String(d), x, y); if (d < 8) { g.strokeStyle = 'rgba(216,52,42,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 12, y + 8); g.lineTo(x + 12, y - 8); g.stroke(); } } }, 640, 820); }
function hqTexSign() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, 'NVIDIA', w * 0.5, h * 0.4, h * 0.46, '#f4f4ec', { stroke: false, font: 'Arial, sans-serif', maxW: w * 0.9 });
  inked(g, 'FLOOR 5 · ENGINEERING', w * 0.5, h * 0.82, h * 0.15, '#cfe8c0', { stroke: false, weight: 700, maxW: w * 0.8 }); }, 1024, 320); }
function hqTexSlat() { const t = tex((g, w, h) => { const R = RNG('hqslat');   // one blind slat (u along it, v across): lit curved top edge, warm mid, a dark shadow lip, linen grain
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff0c8'); gr.addColorStop(0.16, '#f2cf86'); gr.addColorStop(0.55, '#ddb064'); gr.addColorStop(0.82, '#b88a44'); gr.addColorStop(0.9, '#7a5428'); gr.addColorStop(1, '#5a3a1c');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 900; k++) { g.fillStyle = R.f() < 0.5 ? 'rgba(120,80,30,0.10)' : 'rgba(255,245,220,0.10)'; g.fillRect(R.r(0, w), R.r(0, h * 0.85), R.r(6, 40), 1); }
  for (let x = R.r(20, 80); x < w; x += R.r(60, 200)) { g.fillStyle = 'rgba(90,60,20,0.10)'; g.fillRect(x, 0, R.r(2, 6), h * 0.86); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, h * 0.06, w, h * 0.05); }, 1024, 64);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(1 / 8, 1 / 0.46); t.offset.set(0, 0.5); return t; }   // the extruded slat cap UVs are its shape coords (x, y in units): y -0.23..0.23 -> v 0..1 (lit edge on top)
// staff monitors: code / charts / a chip layout (static, a few looks)
function hqTexScreen(k) { return tex((g, w, h) => { const R = RNG('hqscr', k);
  if (k % 3 === 0) { g.fillStyle = '#1e2440'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { let x = 14 + R.i(0, 3) * 18; const y = 16 + i * 14; for (let j = 0; j < R.i(2, 5); j++) { const ww = R.r(20, 70); g.fillStyle = ['#7ad0ff', '#ffd06a', '#ff7aa8', '#9aff9a', '#e0e0f0'][R.i(0, 4)]; g.fillRect(x, y, ww, 7); x += ww + 8; } } }
  else if (k % 3 === 1) { g.fillStyle = '#eef2f8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a6ad8'; g.fillRect(0, 0, w, 22); for (let i = 0; i < 7; i++) { const bh = R.r(30, h * 0.6); g.fillStyle = ['#3a8ae8', '#2ab07a', '#f2a03a'][i % 3]; g.fillRect(24 + i * 32, h - 20 - bh, 22, bh); }
    g.strokeStyle = '#e8384a'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i < 8; i++) g.lineTo(20 + i * 32, h * 0.3 + R.r(-20, 30)); g.stroke(); }
  else { g.fillStyle = '#16301e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5ae07a'; g.lineWidth = 2; g.strokeRect(w * 0.2, h * 0.15, w * 0.6, h * 0.7); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 3 ? '#2a8a4a' : '#7ae09a'; g.fillRect(w * 0.24 + i * w * 0.09, h * 0.2 + j * h * 0.15, w * 0.07, h * 0.11); }
    for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(122,224,154,0.6)'; g.beginPath(); g.moveTo(0, h * (0.1 + i * 0.07)); g.lineTo(w * 0.2, h * (0.1 + i * 0.07)); g.stroke(); } }
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.4, 0); g.lineTo(0, h * 0.6); g.fill(); }, 320, 220); }
function hqTexPoster(k) { return tex((g, w, h) => { g.fillStyle = ['#f2c23a', '#2a8ad8', '#e85a3a'][k]; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1a14'; g.lineWidth = 12; g.strokeRect(0, 0, w, h);
  if (k === 0) { g.fillStyle = '#2a1a14'; g.beginPath(); g.roundRect(w * 0.25, h * 0.2, w * 0.5, h * 0.36, 14); g.fill(); g.fillStyle = '#5ae07a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.fillRect(w * 0.3 + i * w * 0.11, h * 0.25 + j * h * 0.1, w * 0.07, h * 0.06);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#c8c8c8'; g.fillRect(w * (0.27 + i * 0.08), h * 0.16, 6, h * 0.04); g.fillRect(w * (0.27 + i * 0.08), h * 0.56, 6, h * 0.04); } inked(g, 'THINK FAST', w / 2, h * 0.75, h * 0.09, '#2a1a14', { stroke: false, maxW: w * 0.8 }); inked(g, 'ship faster', w / 2, h * 0.87, h * 0.055, '#2a1a14', { stroke: false }); }
  else if (k === 1) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.2, h * 0.65); g.lineTo(w * 0.42, h * 0.38); g.lineTo(w * 0.58, h * 0.5); g.lineTo(w * 0.8, h * 0.22); g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.stroke(); inked(g, 'GROWTH', w / 2, h * 0.8, h * 0.1, '#ffffff', { stroke: '#1a3a6a', sw: 6 }); }
  else { g.fillStyle = '#fff2d8'; g.beginPath(); g.arc(w / 2, h * 0.4, w * 0.24, 0, TAU); g.fill(); g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(w * 0.42, h * 0.36, 10, 0, TAU); g.arc(w * 0.58, h * 0.36, 10, 0, TAU); g.fill(); g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.12, 0.2, Math.PI - 0.2); g.stroke(); inked(g, 'TEAM SPIRIT', w / 2, h * 0.8, h * 0.085, '#ffffff', { stroke: '#7a2010', sw: 6, maxW: w * 0.84 }); } }, 360, 480); }
function hqTexWhite() { return tex((g, w, h) => { g.fillStyle = '#f2f4f2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a9aa0'; g.lineWidth = 10; g.strokeRect(0, 0, w, h);
  g.strokeStyle = '#2a6ad8'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.strokeRect(w * (0.08 + i * 0.22), h * 0.2, w * 0.16, h * 0.18); } g.beginPath(); for (let i = 0; i < 3; i++) { g.moveTo(w * (0.24 + i * 0.22), h * 0.29); g.lineTo(w * (0.3 + i * 0.22), h * 0.29); } g.stroke();
  g.strokeStyle = '#e8384a'; g.beginPath(); g.moveTo(w * 0.1, h * 0.8); g.bezierCurveTo(w * 0.3, h * 0.5, w * 0.5, h * 0.9, w * 0.88, h * 0.55); g.stroke();
  inked(g, 'Q4 ROADMAP', w * 0.5, h * 0.1, h * 0.08, '#2a3a4a', { stroke: false }); g.fillStyle = '#ffd84a'; g.save(); g.translate(w * 0.8, h * 0.75); g.rotate(0.1); g.fillRect(-30, -30, 60, 60); g.restore(); }, 640, 360); }
function hqTexBuzz() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.lineCap = 'round';   // little vibration arcs either side of a phone
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.strokeStyle = '#2a1a14'; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, h / 2, w * (0.22 + k * 0.1), sd > 0 ? -0.55 : Math.PI - 0.55, sd > 0 ? 0.55 : Math.PI + 0.55); g.stroke();
    g.strokeStyle = k === 1 ? '#ffd23a' : '#ffffff'; g.lineWidth = 8; g.stroke(); } }, 256, 128); }
function hqTexNote() { return tex((g, w, h) => { g.fillStyle = '#e8eef6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a6ad8'; g.fillRect(0, 0, w, h * 0.16);   // a phone's lock screen with the new-email banner
  inked(g, '9:41', w / 2, h * 0.3, h * 0.12, '#2a3a5a', { stroke: false }); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(w * 0.08, h * 0.46, w * 0.84, h * 0.26, 18); g.fill(); g.strokeStyle = '#2a6ad8'; g.lineWidth = 6; g.stroke();
  g.fillStyle = '#e8384a'; g.beginPath(); g.arc(w * 0.22, h * 0.59, w * 0.07, 0, TAU); g.fill(); inked(g, '1', w * 0.22, h * 0.59, h * 0.06, '#ffffff', { stroke: false });
  g.fillStyle = '#3a4a6a'; g.fillRect(w * 0.36, h * 0.54, w * 0.46, h * 0.035); g.fillRect(w * 0.36, h * 0.62, w * 0.34, h * 0.03); }, 160, 300); }
// Huang's monitor: a mail window, "To: All employees", the line typed as it is spoken, SEND, then SENT
const HQ_TO = 'All employees', HQ_L1 = 'I was', HQ_L2 = 'unfaithful', HQ_L3 = 'to my wife.';
function hqTyped(t) {   // [chars of the To field, chars of the body]
  const toN = Math.round(HQ_TO.length * hqE(29.5, 30.1, t)); let n = 0;
  for (const [w, s, e] of [['I ', 30.36, 30.48], ['was ', 30.48, 30.66], ['unfaithful ', 30.66, 31.3], ['to ', 31.3, 31.42], ['my ', 31.42, 31.54], ['wife.', 31.54, 31.8]]) n += Math.round(w.length * hqE(s, e, t));
  return [toN, n]; }
function hqTypedC(t) { let n = 0; for (const [w, s, e] of [['I ', 30.36, 30.48], ['was ', 30.48, 30.66], ['unfaithful ', 30.66, 31.3], ['to ', 31.3, 31.42], ['my ', 31.42, 31.54], ['wife.', 31.54, 31.8]]) n += w.length * hqE(s, e, t); return n; }   // continuous body letters (the tapping hands)
function hqDrawMail(t) { const [toN, bn] = hqTyped(t), cur = Math.floor(t * 3.2) % 2 === 0, sent = t >= HQ_SEND, press = t >= HQ_SEND - 0.04 && t < HQ_SEND + 0.12;
  const key = [toN, bn, cur && !sent ? 1 : 0, sent ? 1 : 0, press ? 1 : 0].join('|');
  return [key, (g, w, h) => { g.fillStyle = '#24305a'; g.fillRect(0, 0, w, h);   // desktop
    const x0 = w * 0.07, y0 = h * 0.06, ww = w * 0.86, hh = h * 0.88;
    g.fillStyle = '#c6d0e2'; g.beginPath(); g.roundRect(x0, y0, ww, hh, 18); g.fill();
    g.fillStyle = '#3a4a78'; g.beginPath(); g.roundRect(x0, y0, ww, h * 0.1, [18, 18, 0, 0]); g.fill();
    for (const [i, c] of [[0, '#ff6a5a'], [1, '#ffc23a'], [2, '#5ad06a']]) { g.fillStyle = c; g.beginPath(); g.arc(x0 + 28 + i * 30, y0 + h * 0.05, 9, 0, TAU); g.fill(); }
    inked(g, 'New message', x0 + ww / 2, y0 + h * 0.05, h * 0.045, '#e8eef8', { stroke: false, weight: 700 });
    const fy = y0 + h * 0.17; g.textBaseline = 'middle'; g.font = `700 ${h * 0.06}px Arial`; g.textAlign = 'left'; g.fillStyle = '#5a6a8a'; g.fillText('To:', x0 + 26, fy);
    g.fillStyle = '#1e2a4a'; g.fillText(HQ_TO.slice(0, toN), x0 + 26 + g.measureText('To: ').width, fy);
    g.fillStyle = 'rgba(60,80,120,0.35)'; g.fillRect(x0 + 18, fy + h * 0.05, ww - 36, 3);
    // the body: three big lines (portrait-friendly), typed on
    const full = HQ_L1 + ' ' + HQ_L2 + ' ' + HQ_L3, shown = full.slice(0, bn), parts = [HQ_L1, HQ_L2, HQ_L3]; let k = 0, lastX = x0 + 30, lastY = y0 + h * 0.34;
    g.font = `900 ${h * 0.115}px Arial`; parts.forEach((p, i) => { const y = y0 + h * (0.34 + i * 0.15), take = Math.max(0, Math.min(p.length, shown.length - k)); const s = p.slice(0, take), lx = x0 + ww / 2 - g.measureText(p).width / 2;   // centred lines (each line keeps its final place)
      g.fillStyle = '#141c34'; g.fillText(s, lx, y); if (take > 0 || i === 0) { lastX = lx + g.measureText(s).width; lastY = y; } k += p.length + 1; });
    if (cur && !sent && t >= 30.1) { g.fillStyle = '#2a6ad8'; g.fillRect(lastX + 4, lastY - h * 0.055, 6, h * 0.11); }
    // SEND
    const bx = x0 + 26, by = y0 + hh - h * 0.13, bw = w * 0.28, bh = h * 0.09; g.fillStyle = sent && !press ? '#2aa05a' : press ? '#1a4aa8' : '#2a6ad8'; g.beginPath(); g.roundRect(bx, by + (press ? 4 : 0), bw, bh, 12); g.fill();
    inked(g, sent && !press ? 'SENT ✓' : 'SEND', bx + bw / 2, by + bh / 2 + (press ? 4 : 0), bh * 0.5, '#ffffff', { stroke: false });
    if (sent && !press) { g.fillStyle = '#2aa05a'; g.beginPath(); g.roundRect(x0 + ww - w * 0.36, by, w * 0.32, bh, 12); g.fill(); inked(g, 'to ALL', x0 + ww - w * 0.2, by + bh / 2, bh * 0.42, '#ffffff', { stroke: false, maxW: w * 0.28 }); } }]; }

// ---- builders
function hqPlant(seed, s = 1, potC = '#d8603a') { const g = new THREE.Group(), R = RNG('hqplant', seed), lf = c3Prop('#2e9a44', { rough: 0.55, side: THREE.DoubleSide }), lf2 = c3Prop('#5ac04a', { rough: 0.55 });
  g.add(cyl(1.2 * s, 0.85 * s, 2.2 * s, c3Prop(potC, { rough: 0.6 }), 0, 1.1 * s, 0, 0.02, 16)); g.add(cyl(1.3 * s, 1.3 * s, 0.3 * s, c3Prop(t3Mul(potC, 0.85), { rough: 0.6 }), 0, 2.15 * s, 0, 0.02, 16)); g.add(cyl(1.1 * s, 1.1 * s, 0.1, c3Prop('#4a2a1a'), 0, 2.25 * s, 0, 0, 14));
  for (let k = 0; k < 12; k++) { const a = k * 2.4 + R.n(0.3), ht = (3.0 + R.r(0, 3.4)) * s, ang = 0.22 + R.r(0, 0.5), st = cyl(0.06 * s, 0.08 * s, ht, c3Prop('#3a7a2a'), 0, 0, 0, 0.01, 6);
    st.position.set(Math.sin(ang) * Math.cos(a) * ht / 2, 2.2 * s + Math.cos(ang) * ht / 2, Math.sin(ang) * Math.sin(a) * ht / 2); st.rotation.set(Math.sin(a) * ang, 0, -Math.cos(a) * ang); g.add(st);
    const L = c3Mesh(new THREE.SphereGeometry(1.0 * s, 12, 8), k % 3 ? lf : lf2, 0.02); L.scale.set(1.0, 0.14, 0.6); L.position.set(Math.sin(ang) * Math.cos(a) * ht, 2.2 * s + Math.cos(ang) * ht, Math.sin(ang) * Math.sin(a) * ht); L.rotation.set(0, -a, -0.5 - ang); g.add(L); }
  return g; }
function hqTall(seed, s = 1) { const g = new THREE.Group(), R = RNG('hqtall', seed), lf = c3Prop('#2a8a3e', { rough: 0.6 });   // a tall snake plant / fig column
  g.add(cyl(1.0 * s, 0.8 * s, 2.0 * s, c3Prop('#f2f0e8', { rough: 0.4 }), 0, 1.0 * s, 0, 0.02, 16));
  for (let k = 0; k < 9; k++) { const a = k * 0.7 + R.n(0.2), L = c3Mesh(new THREE.SphereGeometry(1, 10, 8), lf, 0.02); L.scale.set(0.35 * s, (2.2 + R.r(0, 1.6)) * s, 0.12 * s); L.position.set(Math.cos(a) * 0.45 * s, 2.0 * s + L.scale.y * 0.9, Math.sin(a) * 0.45 * s); L.rotation.set(Math.sin(a) * 0.25, a, Math.cos(a) * 0.25); g.add(L); }
  return g; }
function hqLamp(M, on = true) { const g = new THREE.Group();   // an articulated desk lamp (base, two arms, cone shade with a warm bulb); faces +z locally
  g.add(cyl(0.55, 0.62, 0.18, M.black, 0, 0.09, 0, 0.01, 16)); const a1 = cyl(0.07, 0.07, 2.4, M.orange, 0, 1.25, -0.25, 0.01, 8); a1.rotation.x = -0.25; g.add(a1);
  const a2 = cyl(0.07, 0.07, 2.0, M.orange, 0, 2.6, 0.45, 0.01, 8); a2.rotation.x = 1.0; g.add(a2); g.add(cyl(0.14, 0.14, 0.2, M.black, 0, 2.38, -0.55, 0.01, 8)).children;
  const sh = c3Mesh(new THREE.ConeGeometry(0.6, 0.9, 18, 1, true), M.orange, 0.015); sh.material = M.orange; sh.position.set(0, 3.1, 1.3); sh.rotation.x = 0.9; g.add(sh);
  const b = c3Mesh(new THREE.SphereGeometry(0.24, 12, 8), on ? M.bulb : M.white, 0); b.position.set(0, 2.92, 1.5); g.add(b); return g; }
function hqMonitor(M, map, w = 3.4, h = 2.2) { const g = new THREE.Group();   // a slim monitor on a stand, screen facing +z locally, origin = desk top
  g.add(c3Put(c3Mesh(c3RBox(1.4, 0.12, 1.0, 0.05, 2), M.black, 0.01), 0, 0.06, -0.2)); g.add(rb(0.22, 1.4, 0.18, M.black, 0, 0.75, -0.35, 0.01));
  g.add(c3Put(c3Mesh(c3RBox(w + 0.24, h + 0.24, 0.22, 0.08, 2), M.black, 0.015), 0, 1.3 + h / 2, -0.2));
  const sc = pl(w, h, c3Flat('#ffffff', { map, glow: '#cfe0ff' }), 0, 1.3 + h / 2, -0.08); sc.userData.noCast = true; g.add(sc); g.userData.screen = sc; return g; }
function hqKeyboard(M) { const g = new THREE.Group(); g.add(c3Put(c3Mesh(c3RBox(2.6, 0.14, 0.9, 0.05, 2), M.white, 0.01), 0, 0.07, 0));
  const k = pl(2.4, 0.74, c3Prop('#ffffff', { map: HQ.keyT ||= tex((x, w, h) => { x.fillStyle = '#c8ccd4'; x.fillRect(0, 0, w, h); for (let j = 0; j < 4; j++) for (let i = 0; i < 14; i++) { x.fillStyle = '#f4f4f0'; x.fillRect(i * w / 14 + 2, j * h / 4 + 2, w / 14 - 4, h / 4 - 4); } x.fillStyle = '#f4f4f0'; x.fillRect(w * 0.3, h * 0.76, w * 0.4, h * 0.22); }, 256, 80), rough: 0.5 }), 0, 0.15, 0, 0, -Math.PI / 2); k.userData.noCast = true; g.add(k);
  g.add(c3Put(c3Mesh(c3RBox(0.36, 0.14, 0.56, 0.06, 2), M.white, 0.01), 1.8, 0.07, 0.1)); return g; }
function hqPhone(M, col) { const g = new THREE.Group(); g.add(c3Put(c3Mesh(c3RBox(0.62, 0.08, 1.2, 0.08, 2), c3Prop(col, { rough: 0.35 }), 0.01), 0, 0.04, 0));
  const sc = pl(0.54, 1.1, M.phoneOff, 0, 0.085, 0, 0, -Math.PI / 2); sc.userData.noCast = true; g.add(sc); g.userData.screen = sc; return g; }
// a task chair (5-star base, gas lift, seat, back) facing +z locally (the sitter's back to -z)
function hqChair(M, col, exec = false) { const g = new THREE.Group(), seat = c3Prop(col, { rough: exec ? 0.35 : 0.6 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, leg = rb(0.25, 0.16, 1.5, M.black, Math.sin(a) * 0.75, 0.42, Math.cos(a) * 0.75, 0.01); leg.rotation.y = a; g.add(leg); const w = c3Mesh(new THREE.SphereGeometry(0.17, 10, 8), M.black, 0.01); w.position.set(Math.sin(a) * 1.45, 0.17, Math.cos(a) * 1.45); g.add(w); }
  g.add(cyl(0.16, 0.16, 2.2, M.steel, 0, 1.5, 0, 0.01, 10)); g.add(c3Put(c3Mesh(c3RBox(2.6, 0.5, 2.5, 0.22, 3), seat, 0.02), 0, HQ_SEAT - 0.25, 0.1));
  const bh = exec ? 4.6 : 3.4; g.add(c3Put(c3Mesh(c3RBox(2.5, bh, 0.45, 0.3, 3), seat, 0.02), 0, HQ_SEAT + 0.5 + bh / 2, -1.15)); g.add(rb(0.3, 1.2, 0.3, M.black, 0, HQ_SEAT + 0.2, -1.0, 0.01));
  if (exec) for (const sx of [-1, 1]) { g.add(rb(0.3, 1.1, 1.8, M.black, sx * 1.3, HQ_SEAT + 0.5, 0.1, 0.01)); g.add(c3Put(c3Mesh(c3RBox(0.45, 0.25, 1.9, 0.1, 2), seat, 0.01), sx * 1.3, HQ_SEAT + 1.1, 0.1)); }
  g.userData.backH = HQ_SEAT + 0.5 + bh; return g; }
// a staff desk: top 6.0 x 3.4 at y 4.6 (rounded, white with an oak edge), a drawer pedestal, legs, a modesty panel on the
// far side, the monitor facing the sitter (+z local is the sitter side), keyboard, mouse, phone, mug, a lamp or a plant
function hqDesk(s, M, k, o = {}) { const g = new THREE.Group(), R = RNG('hqdesk', k);
  g.add(c3Put(c3Mesh(c3RBox(4.4, 0.28, 3.4, 0.1, 2), M.deskTop, 0.02), 0, 4.46, 0)); g.add(rb(4.4, 0.12, 0.1, M.oak, 0, 4.4, 1.72, 0.005));
  g.add(rb(1.4, 3.9, 3.0, M.deskBody, 1.35, 1.95, -0.1, 0.02)); for (let i = 0; i < 3; i++) g.add(rb(0.8, 0.12, 0.08, M.steel, 1.35, 1.0 + i * 1.2, 1.42, 0.005));
  for (const [x, z] of [[-2.0, -1.5], [-2.0, 1.5]]) g.add(cyl(0.12, 0.12, 4.3, M.steel, x, 2.15, z, 0.01, 8)); g.add(rb(3.8, 2.4, 0.12, M.deskBody, -0.2, 2.8, -1.55, 0.01));
  const mon = hqMonitor(M, o.screen || hqTexScreen(k), 3.0, 2.0); mon.position.set(-0.2, 4.6, -0.8); g.add(mon);
  const kb = hqKeyboard(M); kb.position.set(-0.35, 4.6, 0.55); kb.scale.setScalar(0.85); g.add(kb);
  const ph = hqPhone(M, ['#2a2a34', '#e8e4dc', '#e85a5a', '#3a6ad8'][k % 4]); ph.position.set(1.6, 4.6, -0.4); ph.rotation.y = R.n(0.3); g.add(ph); g.userData.phone = ph;
  const mg = mug(['#f07a1a', '#2a8a9a', '#f4f0e6', '#c8321e', '#5ac04a'][k % 5], -1.85, 4.6, 0.75); g.add(mg);
  if (k % 2) { const l = hqLamp(M, true); l.position.set(-1.7, 4.6, -1.0); l.rotation.y = 2.6; l.scale.setScalar(0.7); g.add(l); } else { const p = hqPlant(40 + k, 0.28); p.position.set(-1.7, 4.6, -1.0); g.add(p); }
  g.add(cyl(0.12, 0.12, 2.0, M.cable, -0.4, 3.6, -1.4, 0, 6));   // cable drop
  return g; }

// ---- the room
function hqBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 800), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#8ab0e0', ambI: 0.34, sky: '#c8dcff', ground: '#b87a48', key: '#ffe8cc', keyI: 0.78, keyP: [-34, 52, 64], rim: '#ff9a6a', rimI: 0.4, rimP: [10, 20, -60] });
  const M = HQ.M = { black: c3Prop('#2a2a32', { rough: 0.45 }), steel: c3Prop('#c8ccd2', { metal: 0.6, rough: 0.3 }), white: c3Prop('#eef0ee', { rough: 0.4 }), orange: c3Prop('#f2782a', { rough: 0.4 }),
    bulb: c3Prop('#ffffff', { emissive: '#ffe2a0', ei: 2.0, glow: '#ffd890' }), oak: c3Prop('#c8884a', { rough: 0.5 }), deskTop: c3Prop('#f4f2ec', { rough: 0.35 }), deskBody: c3Prop('#e2ddd2', { rough: 0.55 }),
    cable: c3Prop('#3a3a44', { rough: 0.6 }), walnut: c3Prop('#ffffff', { map: hqRep(texWood(), 1, 1), rough: 0.4 }), walnutD: c3Prop('#5a3420', { rough: 0.45 }),
    frame: c3Prop('#2a2c34', { metal: 0.4, rough: 0.35 }), green: c3Prop('#3e9a5a', { rough: 0.6 }), tube: c3Prop('#ffffff', { emissive: '#fff4e0', ei: 1.4, glow: '#fff0d0' }),
    phoneOff: c3Prop('#16182a', { rough: 0.15, env: 1.5 }), phoneOn: c3Flat('#ffffff', { map: hqTexNote(), glow: '#cfe0ff' }), duct: c3Prop('#d8dce2', { metal: 0.5, rough: 0.35 }), ceil: c3Prop('#e8e4ee', { rough: 0.85 }),
    blind: c3Prop('#ffffff', { map: hqTexSlat(), rough: 0.5 }), blindD: c3Prop('#b8904a', { rough: 0.5 }), sofa: c3Prop('#d8502a', { rough: 0.7 }), cushion: c3Prop('#f2c23a', { rough: 0.7 }) };
  M.phoneOn.userData.c3keep = true;
  const F = new THREE.Group(); scene.add(F); s.F = F;   // FOCUS: people + held props + depth-only occluders (made after c3SetLook)
  // ---- floor: oak planks, a cobalt rug under the front pods and one on the left
  scene.add(pl(2 * HQ_X, HQ_Z, c3Prop('#ffffff', { map: hqTexFloor(), rough: 0.45, env: 0.6 }), 0, 0, HQ_Z / 2, 0, -Math.PI / 2));
  for (const [x, z, w, d] of [[22.5, 22, 24, 9], [-14, 18, 26, 22]]) { const r = plNC(w, d, c3Prop('#ffffff', { map: hqTexRug(), rough: 0.95 }), x, 0.03, z, 0, -Math.PI / 2); scene.add(r); }
  { const r = plNC(14, 8, c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#d8402a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2c23a'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); g.strokeStyle = '#a82a1e'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30, 30 + i * (h - 60) / 8); g.lineTo(w - 30, 30 + i * (h - 60) / 8); g.stroke(); } }, 512, 300), rough: 0.95 }), 24, 0.035, 5.6, 0, -Math.PI / 2); scene.add(r); }   // the office rug
  // ---- walls: left green, right (office) warm walnut slats, front wall far behind the camera; the ceiling (exposed, lavender-white)
  const wallM = c3Prop('#ffffff', { map: hqTexWall(), rough: 0.85 });
  { const w = plNC(HQ_Z, HQ_H, wallM, -HQ_X, HQ_H / 2, HQ_Z / 2, Math.PI / 2); scene.add(w); const w2 = plNC(HQ_Z, HQ_H, wallM, HQ_X, HQ_H / 2, HQ_Z / 2, -Math.PI / 2); scene.add(w2); const w3 = plNC(2 * HQ_X, HQ_H, wallM, 0, HQ_H / 2, HQ_Z, Math.PI); scene.add(w3); }
  scene.add(plNC(2 * HQ_X, HQ_Z, M.ceil, 0, HQ_H, HQ_Z / 2, 0, Math.PI / 2));
  // vertical oak slat panelling on the left wall (z 26..50) + the plain-text sign on it
  for (let z = 26; z < 50; z += 0.9) scene.add(rbNC(0.3, 15, 0.5, M.oak, -HQ_X + 0.2, 7.5, z, 0.005));
  // ---- back wall (z 0): windows in bays (x -36..-9 and 1..36), a solid section (x -9..1) with the calendar, clock, sign
  { const city = new THREE.Mesh(new THREE.PlaneGeometry(260, 98), c3Flat('#ffffff', { map: hqTexCity() })); city.material.userData.c3keep = true; city.position.set(0, 14, -48); city.userData.noCast = true; city.userData.noShade = true; scene.add(city);
    const wy0 = 2.2, wy1 = 21.6;   // window opening height
    scene.add(plNC(10, HQ_H, wallM, -4, HQ_H / 2, 0)); scene.add(plNC(2 * HQ_X, wy0, wallM, 0, wy0 / 2, 0.01)); scene.add(plNC(2 * HQ_X, HQ_H - wy1, wallM, 0, (HQ_H + wy1) / 2, 0.01));
    const bays = []; for (let x = -36; x < -9; x += 6.75) bays.push(x); for (let x = 1; x < 36; x += 7) bays.push(x);
    for (const x of [-36, -9, 1, 36]) scene.add(rb(1.0, wy1 - wy0, 1.2, M.frame, x + (x === 36 ? -0.5 : x === -36 ? 0.5 : 0), (wy0 + wy1) / 2, 0.3, 0));
    for (const x of bays) { scene.add(rb(0.35, wy1 - wy0, 0.6, M.frame, x, (wy0 + wy1) / 2, 0.2, 0)); }
    for (const [x0, x1] of [[-36, -9], [1, 36]]) { for (const y of [wy0, 8.4, wy1]) scene.add(rb(x1 - x0, 0.35, 0.6, M.frame, (x0 + x1) / 2, y, 0.2, 0)); scene.add(rb(x1 - x0, 0.3, 1.4, M.white, (x0 + x1) / 2, wy0 + 0.1, 0.7, 0));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, wy1 - wy0), new THREE.MeshBasicMaterial({ map: HQ.glT ||= tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(w * (0.05 + i * 0.25), h); g.lineTo(w * (0.15 + i * 0.25), 0); g.lineTo(w * (0.19 + i * 0.25), 0); g.lineTo(w * (0.09 + i * 0.25), h); g.fill(); } g.fillStyle = 'rgba(120,150,220,0.10)'; g.fillRect(0, 0, w, h); }, 512, 256), transparent: true, depthWrite: false, toneMapped: false }));
      gl.position.set((x0 + x1) / 2, (wy0 + wy1) / 2, 0.05); gl.userData.noCast = true; gl.userData.noShade = true; scene.add(gl); }
    // the calendar on the solid section, a wall clock above, a credenza with plants below
    s.cal = new THREE.Group(); s.cal.position.set(-4, 11.2, 0.12); scene.add(s.cal); s.cal.add(rb(4.8, 6.1, 0.24, M.black, 0, 0, 0, 0.01)); s.cal.add(pl(4.5, 5.8, c3Flat('#ffffff', { map: hqTexCal() }), 0, 0, 0.14));
    { const ck = new THREE.Group(); ck.position.set(-4, 17.6, 0.3); scene.add(ck); const r = cyl(1.3, 1.3, 0.3, M.black, 0, 0, 0, 0, 24); r.rotation.x = Math.PI / 2; ck.add(r); const f = new THREE.Mesh(new THREE.CircleGeometry(1.15, 28), c3Flat('#ffffff', { map: texClock() })); f.position.z = 0.17; ck.add(f); }
    scene.add(rb(8.6, 3.6, 2.4, M.walnut, -4, 1.8, 1.3, 0.02)); scene.add(rb(8.8, 0.2, 2.6, M.walnutD, -4, 3.7, 1.3, 0.01));
    { const p = hqPlant(3, 0.55, '#f2f0e8'); p.position.set(-7.0, 3.8, 1.3); scene.add(p); const p2 = hqPlant(4, 0.42, '#3a6ad8'); p2.position.set(-1.2, 3.8, 1.2); scene.add(p2); }
    for (let i = 0; i < 5; i++) scene.add(rb(0.5, 1.2 + (i % 2) * 0.4, 1.0, c3Prop(['#d8342a', '#2a6ad8', '#f2c23a', '#3e9a5a', '#7a3a9a'][i], { rough: 0.6 }), -4.6 + i * 0.55, 4.4 + (i % 2) * 0.2, 1.2, 0.01)); }
  // ---- exposed ceiling: round ducts, cable trays, linear pendant lights (half of them off: Sunday evening)
  { const KC = new THREE.Group(); scene.add(KC);
    for (const x of [-20, 4]) { const d = cyl(1.3, 1.3, HQ_Z, M.duct, x, 21.6, HQ_Z / 2, 0, 18); d.rotation.x = Math.PI / 2; d.userData.noCast = true; KC.add(d); for (let z = 3; z < HQ_Z; z += 6) { const r = cyl(1.38, 1.38, 0.3, M.steel, x, 21.6, z, 0, 18); r.rotation.x = Math.PI / 2; r.userData.noCast = true; KC.add(r); } }
    for (const z of [10, 22, 34, 46]) { KC.add(rbNC(2 * HQ_X, 0.25, 0.8, M.frame, 0, 22.6, z, 0)); }
    let li = 0; for (const z of [16, 26, 38]) for (const x of [-26, -12, 2, 18, 30]) { const on = (li++ % 3) !== 1; KC.add(rbNC(0.08, 3.4, 0.08, M.frame, x - 2.5, 21.0, z, 0)); KC.add(rbNC(0.08, 3.4, 0.08, M.frame, x + 2.5, 21.0, z, 0));
      KC.add(rbNC(7.2, 0.45, 0.9, M.black, x, 19.2, z, 0)); const tb = rbNC(6.9, 0.12, 0.6, on ? M.tube : M.white, x, 18.95, z, 0); KC.add(tb);
      if (on) { const l = new THREE.SpotLight('#ffeacc', 1.1, 36, 0.95, 1.0, 1.4); l.position.set(x, 18.6, z); l.target.position.set(x, 0, z + 0.5); l.layers.enableAll(); scene.add(l); scene.add(l.target); } } }
  // ---- columns (round, with a planter ring) on the open floor
  for (const [x, z] of [[-4, 38], [-18, 30], [4, 46]]) { scene.add(cyl(1.2, 1.2, HQ_H, M.white, x, HQ_H / 2, z, 0.02, 20)); scene.add(cyl(1.5, 1.5, 0.6, M.oak, x, 0.3, z, 0.01, 20)); scene.add(cyl(1.35, 1.35, 0.3, M.frame, x, 20.4, z, 0, 20)); }
  { const sg = pl(14, 4.4, c3Flat('#ffffff', { map: hqTexSign(), transparent: true }), -HQ_X + 0.6, 13.5, 38, Math.PI / 2); sg.userData.noCast = true; scene.add(sg); scene.add(rb(0.3, 5.6, 15.4, c3Prop('#1e5a32', { rough: 0.5 }), -HQ_X + 0.25, 13.5, 38, 0)); }
  for (const [z, k] of [[8, 0], [15, 2]]) { scene.add(rb(0.2, 5.1, 3.9, M.black, -HQ_X + 0.15, 11, z, 0)); scene.add(pl(3.6, 4.8, c3Flat('#ffffff', { map: hqTexPoster(k) }), -HQ_X + 0.3, 11, z, Math.PI / 2)); }
  { scene.add(rb(0.3, 6.2, 10.4, M.steel, HQ_X - 0.25, 10, 30, 0)); scene.add(pl(10, 5.8, c3Flat('#ffffff', { map: hqTexWhite() }), HQ_X - 0.42, 10, 30, -Math.PI / 2)); scene.add(rb(0.6, 0.2, 10, M.steel, HQ_X - 0.5, 6.8, 30, 0)); }
  { scene.add(rb(0.2, 5.1, 3.9, M.black, HQ_X - 0.15, 11, 41, 0)); scene.add(pl(3.6, 4.8, c3Flat('#ffffff', { map: hqTexPoster(1) }), HQ_X - 0.3, 11, 41, -Math.PI / 2)); }
  // ---- the coffee bar on the right wall (z 44..52): counter, espresso machine, cups, stools, a pendant
  { const g = new THREE.Group(); scene.add(g); g.add(rb(3.6, 4.6, 9, M.oak, HQ_X - 2, 2.3, 48)); g.add(rb(4.0, 0.3, 9.4, M.white, HQ_X - 2, 4.7, 48)); const em = c3Put(c3Mesh(c3RBox(2.0, 2.2, 1.8, 0.2, 2), M.steel, 0.02), HQ_X - 2.2, 5.95, 46.2); g.add(em);
    g.add(rb(1.8, 0.5, 1.6, M.black, HQ_X - 2.2, 7.3, 46.2)); for (let i = 0; i < 5; i++) { const m = mug(['#f2f0e8', '#3e9a5a', '#f2782a'][i % 3], HQ_X - 2.6, 4.85, 48.4 + i * 0.8); g.add(m); }
    for (const z of [45.5, 49.5]) { g.add(cyl(0.9, 0.9, 0.3, M.orange, HQ_X - 5.2, 4.2, z, 0.01, 16)); g.add(cyl(0.12, 0.12, 4.0, M.steel, HQ_X - 5.2, 2.0, z, 0.01, 8)); g.add(cyl(0.8, 0.8, 0.12, M.steel, HQ_X - 5.2, 0.06, z, 0, 16)); } }
  // ---- left-floor desks (two clusters) and the front pods (staff with their backs to the office)
  s.desks = []; s.staffDesk = {};
  const addDesk = (x, z, ry, k, who) => { const d = hqDesk(s, M, k); d.position.set(x, 0, z); d.rotation.y = ry; scene.add(d); s.desks.push(d); const ch = hqChair(M, ['#f2782a', '#3a6ad8', '#e2508a', '#3e9a5a'][k % 4]); scene.add(ch);
    const off = V3(0, 0, 2.5).applyAxisAngle(V3(0, 1, 0), ry); ch.position.set(x + off.x, 0, z + off.z); ch.rotation.y = ry + Math.PI; d.userData.chair = ch; if (who) s.staffDesk[who] = d; return d; };
  // the front pods: the sitter at (x, z) faces +z, so the desk sits 2.5 in front of him
  for (const [who, x, z, h] of HQ_STAFF) { const ry = h, off = V3(0, 0, 2.5).applyAxisAngle(V3(0, 1, 0), ry); addDesk(x + off.x, z + off.z, ry + Math.PI, HQ_STAFF.findIndex((r) => r[0] === who), who).userData.sitter = who; }
  // empty desks (Sunday): the rest of the pods + the left clusters
  for (const [x, z, ry, k] of [[12.4, 22, 0, 7], [30.2, 22, 0, 8], [-6, 10, Math.PI / 2, 11], [-6, 16.4, Math.PI / 2, 12], [-22, 10, -Math.PI / 2, 13], [-22, 16.4, -Math.PI / 2, 14], [-6, 30, Math.PI / 2, 15], [-22, 30, -Math.PI / 2, 16]]) addDesk(x, z, ry, k, null);
  for (const [x, z, s0, k] of [[9.0, 23.2, 0.5, 21], [35, 19, 0.6, 22], [-34, 4, 0.7, 23], [-10, 4.2, 0.5, 24], [-30, 46, 0.7, 25], [24, 36, 0.55, 26]]) { const p = hqPlant(k, s0 * 1.6, ['#d8603a', '#f2f0e8', '#3a6ad8', '#f2c23a'][k % 4]); p.position.set(x, 0, z); scene.add(p); }
  for (const [x, z] of [[-34.5, 22], [-34.5, 26], [8.6, 16.2]]) { const p = hqTall(x * 3 + z, 1.1); p.position.set(x, 0, z); scene.add(p); }
  // a lounge corner on the left (sofa, coffee table) for the wide crane
  { const g = new THREE.Group(); g.position.set(-26, 0, 44); g.rotation.y = Math.PI / 2; scene.add(g); g.add(c3Put(c3Mesh(c3RBox(10, 2.2, 3.6, 0.5, 3), M.sofa, 0.02), 0, 1.6, 0)); g.add(c3Put(c3Mesh(c3RBox(10, 3.0, 1.0, 0.45, 3), M.sofa, 0.02), 0, 3.6, -1.4));
    for (const x of [-3.2, 0, 3.2]) g.add(c3Put(c3Mesh(c3RBox(2.8, 1.2, 1.0, 0.4, 3), M.cushion, 0.02), x, 3.4, -0.6)); g.add(c3Put(c3Mesh(c3RBox(6, 0.4, 2.6, 0.15, 2), M.walnut, 0.02), 0, 2.0, 4.2)); g.add(rb(5.4, 1.8, 2.0, M.walnutD, 0, 0.9, 4.2)); }
  // ---- Huang's glass office
  hqOffice(s, scene, M, F);
  c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'huang'); for (const r of HQ_STAFF) toonPerson(s, r[0]); toonPerson(s, 'HQf');
  // phones buzzing: the staff phones + Huang's own; little buzz arcs per phone
  s.phones = []; for (const d of s.desks) if (d.userData.sitter) s.phones.push(d.userData.phone); s.phones.push(s.hPhone);
  s.buzz = s.phones.map(() => { const m = spritePlane(scene, HQ.buzzT ||= hqTexBuzz(), 2.0, 1.0, 8); m.userData.noInk2 = true; return m; });
  haze(scene, '#b0b8e8', 0.0022);
  c3Env(scene, { top: '#f0f0ff', mid: '#8a9ad8', bot: '#8a5a38' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.6, scale: 0.5, inkSet: false, focusK: 1, bounce: ['#b8d0ff', '#c8804a', 0.12],
    lights: [[22, 10, 9, '#ffd8a0', 1.0, 20], [-4, 12, 6, '#ffe0b0', 0.8, 22], [22, 9, 24, '#ffe8c8', 0.9, 30], [-14, 9, 16, '#ffe8c8', 0.7, 30]],
    shafts: [[[12, 18, -2], [20, 0, 18], 3.5, 8, '#ffc8a0', 0.07], [[-20, 18, -2], [-14, 0, 18], 3.5, 8, '#ffc8a0', 0.06]] });
  hqOccluders(s);
  return s;
}
// Huang's corner office: glass walls (mullions, top + base rails, a door), blinds + cord, the walnut L-desk facing the
// window, monitor, keyboard, his phone, exec chair, shelves with books, a lounge chair, plants, a framed photo
function hqOffice(s, scene, M, F) {
  const glassM = new THREE.MeshBasicMaterial({ map: HQ.ogT ||= tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(200,230,255,0.10)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.42, 0); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.18, h); g.fill(); g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.moveTo(w * 0.6, h); g.lineTo(w * 0.82, 0); g.lineTo(w * 0.86, 0); g.lineTo(w * 0.64, h); g.fill(); }, 256, 256), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const GH = HQ_GH; s.mull = [];
  // front glass (z = HQ_OZ) x 10..36 and left glass (x = HQ_OX) z 0..14: panes, mullions every ~4.3, rails
  const fx = [10, 14.2, 18.4, 25.6, 31.4, 36], lz = [0, 4.7, 9.4, 14];
  fx.slice(0, -1).forEach((x, i) => { if (i === 4) return; /* 31.4..36 = the door */ const p = new THREE.Mesh(new THREE.PlaneGeometry(fx[i + 1] - x, GH - 0.9), glassM); p.position.set((x + fx[i + 1]) / 2, 0.5 + (GH - 0.9) / 2, HQ_OZ); p.userData.noCast = true; p.userData.noShade = true; scene.add(p); });
  lz.slice(0, -1).forEach((z, i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(lz[i + 1] - z, GH - 0.9), glassM); p.position.set(HQ_OX, 0.5 + (GH - 0.9) / 2, (z + lz[i + 1]) / 2); p.rotation.y = Math.PI / 2; p.userData.noCast = true; p.userData.noShade = true; scene.add(p); });
  for (const x of fx) { const m = rb(0.28, GH, 0.34, M.frame, x, GH / 2, HQ_OZ, 0.005); scene.add(m); s.mull.push([x, HQ_OZ, 0.28, 0.34]); }
  for (const z of lz.slice(0, -1)) { const m = rb(0.34, GH, 0.28, M.frame, HQ_OX, GH / 2, z, 0.005); scene.add(m); s.mull.push([HQ_OX, z, 0.34, 0.28]); }
  s.hdr = [rb(26.3, 0.5, 0.42, M.frame, 23, GH - 0.2, HQ_OZ, 0.005)]; scene.add(s.hdr[0]);   // the front header rail (hidden during the swoop, see hqFrame)
  scene.add(rb(26.3, 0.5, 0.42, M.frame, 23, 0.25, HQ_OZ, 0.005));
  scene.add(rb(0.42, 0.5, 14, M.frame, HQ_OX, GH - 0.2, 7, 0.005)); scene.add(rb(0.42, 0.5, 14, M.frame, HQ_OX, 0.25, 7, 0.005));
  // the glass door (open a little, swung inward) with "CEO" frosted on it
  { const dg = new THREE.Group(); dg.position.set(31.4, 0, HQ_OZ); dg.rotation.y = 0.35; scene.add(dg); const p = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 11.5), glassM); p.position.set(2.2, 6.25, 0); p.userData.noCast = true; p.userData.noShade = true; dg.add(p);
    for (const [w, h, x, y] of [[4.4, 0.25, 2.2, 0.5], [4.4, 0.25, 2.2, 12.0], [0.2, 11.5, 0.1, 6.25], [0.2, 11.5, 4.3, 6.25]]) dg.add(rb(w, h, 0.18, M.frame, x, y, 0, 0.005));
    dg.add(rb(0.18, 3.2, 0.3, M.steel, 3.8, 6.0, 0.25, 0.005)); const l = pl(2.4, 0.9, c3Flat('#ffffff', { map: tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, 'CEO', w / 2, h / 2, h * 0.7, 'rgba(255,255,255,0.85)', { stroke: false }); }, 256, 96), transparent: true }), 2.2, 9.0, 0.02); l.userData.noCast = true; dg.add(l);
    scene.add(rb(4.6, 1.2, 0.4, M.frame, 33.6, GH - 0.9, HQ_OZ, 0.005)); }
  // blinds on the front glass, raised (a stack under the header) — slats repositioned each frame
  s.slats = []; for (let i = 0; i < HQ_BL.n; i++) { const m = rb(HQ_BL.x1 - HQ_BL.x0, 0.46, 0.06, i === 0 ? M.blindD : M.blind, (HQ_BL.x0 + HQ_BL.x1) / 2, 0, HQ_BL.z0, 0.004); m.userData.noCast = true; m.rotation.x = 0.18; scene.add(m); s.slats.push(m); }
  { const hr = rb(HQ_BL.x1 - HQ_BL.x0 + 0.4, 0.4, 0.4, M.white, (HQ_BL.x0 + HQ_BL.x1) / 2, HQ_BL.top + 0.15, HQ_BL.z0 - 0.05, 0.005); scene.add(hr); s.hdr.push(hr); }   // the blinds' headrail
  s.cord = cyl(0.045, 0.045, 1, c3Prop('#f4f0e6', { rough: 0.6 }), 0, 0, 0, 0, 6); s.cord.userData.noCast = true; F.add(s.cord);   // FOCUS: it reaches his hand
  s.tassel = cyl(0.12, 0.2, 0.5, M.blindD, 0, 0, 0, 0.005, 10); F.add(s.tassel);
  // the L-desk (walnut top on a dark base) facing the window: main desk z 7..10.6, return on his left (x 15.6..17.2)
  const [hx, hz] = HQ_HU;
  { const g = new THREE.Group(); scene.add(g); s.hDesk = g; g.add(c3Put(c3Mesh(c3RBox(10.4, 0.36, 3.8, 0.14, 2), M.walnut, 0.02), hx, 4.62, 8.8)); g.add(rb(10.0, 4.4, 0.25, M.walnutD, hx, 2.25, 7.05, 0.01));
    for (const sx of [-1, 1]) g.add(rb(0.3, 4.4, 3.6, M.walnutD, hx + sx * 4.9, 2.25, 8.8, 0.01));
    g.add(c3Put(c3Mesh(c3RBox(1.8, 0.36, 5.0, 0.14, 2), M.walnut, 0.02), hx - 6.0, 4.62, 9.5)); g.add(rb(1.6, 4.4, 4.8, M.walnutD, hx - 6.0, 2.25, 9.6, 0.01));
    const mon = hqMonitor(M, null, 5.0, 3.3); mon.position.set(HQ_MON[0], 4.8, 8.35); mon.rotation.set(-0.3, 0.42, 0, 'YXZ'); /* angled toward his right (the OTS camera side) so the typed line reads */ g.add(mon); s.hMonC = canvasTex(1024, 676); mon.userData.screen.material = c3Flat('#ffffff', { map: s.hMonC.t, glow: '#d8e4ff' }); mon.userData.screen.material.userData.c3keep = true;
    s.hMon = mon; const kb = hqKeyboard(M); kb.position.set(hx, 4.8, 9.7); g.add(kb); s.hKb = kb;
    s.hPhone = hqPhone(M, '#2a2a34'); s.hPhone.position.set(hx + 3.4, 4.8, 9.6); s.hPhone.rotation.y = 0.3; g.add(s.hPhone);
    const mg = mug('#3e9a5a', hx - 3.4, 4.8, 9.4); g.add(mg); const lp = hqLamp(M, true); lp.position.set(hx + 4.2, 4.8, 7.6); lp.rotation.y = Math.PI - 0.6; g.add(lp);
    { const fr = rb(1.6, 1.3, 0.12, M.oak, hx - 3.6, 5.5, 7.6, 0.01); fr.rotation.x = -0.2; g.add(fr); }
    for (let i = 0; i < 4; i++) g.add(rb(1.5, 0.22, 2.0, c3Prop(['#d8342a', '#2a6ad8', '#f2c23a', '#3e9a5a'][i], { rough: 0.6 }), hx - 6.0, 4.9 + i * 0.22, 10.6, 0.005)); }
  { const ch = hqChair(M, '#2a2228', true); ch.position.set(hx, 0, hz + 0.7); ch.rotation.y = Math.PI; scene.add(ch); s.hChair = ch; }
  // the right wall of the office: walnut shelves with books, trophies, a plant; a lounge chair + side table by the window
  { const g = new THREE.Group(); scene.add(g); g.add(rb(1.6, 14, 11, M.walnutD, HQ_X - 0.8, 7, 7, 0.02));
    for (let r = 0; r < 5; r++) { g.add(rb(1.4, 0.25, 10.6, M.walnut, HQ_X - 0.9, 1.6 + r * 2.9, 7, 0.005)); const b = pl(10, 2.4, c3Prop('#ffffff', { map: texBooks(70 + r), rough: 0.8 }), HQ_X - 1.65, 3.0 + r * 2.9, 7, -Math.PI / 2); b.userData.noCast = true; if (r !== 2) g.add(b); }
    for (const [z, c] of [[4.0, '#f2c23a'], [7.0, '#c8ccd2'], [10.0, '#f2c23a']]) { g.add(cyl(0.35, 0.5, 0.4, M.black, HQ_X - 1.2, 7.55, z, 0.005, 12)); g.add(cyl(0.12, 0.12, 0.9, c3Prop(c, { metal: 0.7, rough: 0.25 }), HQ_X - 1.2, 8.2, z, 0.005, 8)); const cup = c3Mesh(new THREE.SphereGeometry(0.42, 14, 8, 0, TAU, 0, Math.PI / 2), c3Prop(c, { metal: 0.7, rough: 0.25 }), 0.005); cup.rotation.x = Math.PI; cup.position.set(HQ_X - 1.2, 9.05, z); g.add(cup); } }
  { const p = hqPlant(31, 0.9, '#f2f0e8'); p.position.set(33.4, 0, 12.2); scene.add(p); const p2 = hqTall(32, 1.2); p2.position.set(11.6, 0, 1.6); scene.add(p2); }
  { const g = new THREE.Group(); g.position.set(31, 0, 3.4); g.rotation.y = -0.7; scene.add(g); g.add(c3Put(c3Mesh(c3RBox(3.6, 1.6, 3.4, 0.4, 3), M.cushion, 0.02), 0, 2.0, 0)); g.add(c3Put(c3Mesh(c3RBox(3.6, 3.0, 0.8, 0.35, 3), M.cushion, 0.02), 0, 3.6, -1.4)); for (const sx of [-1, 1]) g.add(c3Put(c3Mesh(c3RBox(0.6, 2.0, 3.4, 0.25, 3), M.cushion, 0.02), sx * 1.9, 2.4, 0)); g.add(rb(3.2, 1.2, 3.0, M.black, 0, 0.6, 0)); }
}
// depth-only stand-ins on FOCUS (after c3SetLook): the desks + chair backs hide the sitters' legs/backs, the office mullions,
// rails and desk hide Huang where they are in front of him, the blinds hide him as they come down
function hqOccluders(s) { const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); M.userData.c3keep = true;
  const box = (par, w, h, d, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M); m.position.set(x, y, z); m.rotation.y = ry; Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); par.add(m); return m; };
  for (const d of s.desks) { box(d, 4.4, 4.6, 3.4, 0, 2.3, 0); box(d, 3.0, 2.1, 0.4, -0.2, 5.9, -0.85); const ch = d.userData.chair, bh = ch.userData.backH; box(ch, 2.5, bh - HQ_SEAT - 0.5, 0.45, 0, HQ_SEAT + 0.5 + (bh - HQ_SEAT - 0.5) / 2, -1.15); }
  const [hx] = HQ_HU; box(s.scene, 10.4, 4.8, 3.8, hx, 2.4, 8.8); box(s.scene, 1.8, 4.8, 5.0, hx - 6.0, 2.4, 9.5);
  { const ch = s.hChair; box(ch, 2.5, 4.6, 0.45, 0, HQ_SEAT + 0.5 + 2.3, -1.15); }
  for (const [x, z, w, d] of s.mull) box(s.scene, w, HQ_GH, d, x, HQ_GH / 2, z);
  s.hdr.push(box(s.scene, 26.3, 0.5, 0.42, 23, HQ_GH - 0.2, HQ_OZ)); box(s.scene, 26.3, 0.5, 0.42, 23, 0.25, HQ_OZ); box(s.scene, 0.42, 0.5, 14, HQ_OX, HQ_GH - 0.2, 7);
  s.blOcc = box(s.scene, HQ_BL.x1 - HQ_BL.x0, 1, 0.2, (HQ_BL.x0 + HQ_BL.x1) / 2, 0, HQ_BL.z0);
  s.blOcc.visible = false; }
const HQ_get = () => HQ.s ||= hqBuild();
SETS.hq = HQ_get;

// ---- the continuous camera (absolute seconds). REV4: every hold is one gentle one-directional drift (calendar push,
//      office OTS = one slow push + crane down + orbit left, the staring staff = one push); look targets slid along their
//      rays (same framings) so the distance to target never ping-pongs.
CAMSEQ.hq = [
  [27.28, [-9.5, 10.6, 17.5], [-11.08, 10.39, -0.93], 42, -4],   // whip in: panning right onto the calendar
  [27.60, [-8.6, 10.8, 17], [-4.6, 11, 0], 40, -2],
  [27.94, [-7.4, 11, 15.2], [-4, 11.4, 0], 38, 2],   // "Sunday": the calendar whole
  [28.42, [-5.6, 11.2, 12.4], [-4, 11.6, 0], 36, 4],   // "November": pushed in
  [28.70, [-5.2, 11.4, 11.8], [-3.9, 11.6, 0], 35.5, 4.5],   // HOLD 27.94-28.70: one slow push-in, roll eases to 4.5 (no pull-back)
  [29.25, [-1, 17, 24], [2.5, 6, 7], 44, -1],   // crane up + back over the left floor
  [29.64, [27, 20, 35], [22.5, 3, 22], 44, -3],   // "whole company": high, tilted down onto the staff pod
  [30.00, [25, 18.6, 15.6], [20.99, 3.62, 8.64], 44, 1],   // swoop down over the glass corner between the pendants onto him (header + blinds stack hidden 29.75-31.0, see hqFrame)
  [30.36, [30.2, 15.6, 13.2], [20.7, 6, 9.8], 46, 3],   // "I": dropped into the open-topped office (z < 13.6, header behind the lens): high OTS, his profile low-left, the screen up-right
  [31.82, [29.4, 14.6, 13.3], [20.9, 6.3, 9.5], 43, 1],   // HOLD 30.36-31.82 ("I was unfaithful to my wife"): ONE slow push-in + crane down + orbit left, roll eases 3 -> 1
  [32.00, [29.2, 15.2, 13.3], [21.47, 6.7, 9.82], 43, -3],   // SEND: crane up + right so the finger jab reads (no pull-out)
  [32.40, [24.7, 11.4, 13.4], [22.23, 6.08, 7.96], 44, -5],   // crane down behind his right shoulder (below the blinds stack) onto SENT + his own phone buzzing ...
  [32.70, [24.9, 15.2, 25.5], [22.2, 8.7, 12], 42, -3],   // ... and pull back out through the front glass, up over the staff turning round
  [32.94, [22, 21.5, 36.5], [22.2, 8, 12.5], 50, -2],   // "You don't": high wide lens between the pendant rows: the two staring heads frame his face through the glass
  [33.20, [22.3, 20.6, 35.4], [22.1, 8.3, 12.5], 50, 2],   // HOLD: push in + crane down as the blinds swallow his face
  [33.46, [21.7, 21.7, 36.4], [23.33, 8.73, 14.39], 52, 4],   // "who": crane up + pan out right (into the whip): the staff staring at the shut blinds
];

// ---- the take
const HQ_TURN = 32.53;   // Huang turns round to the floor
const HQ_SIDE = 29.5;    // from here the camera is on his right: profile instead of the back view
const hqBlind = (t) => EZ.io(hqE(33.02, 33.52, t));   // 0 raised .. 1 down (eyes covered ~33.28, on "who")
function hqFrame(t) {
  const s = HQ_get(); hideAll(s); hideGrips(s); const cam = seqCam(s, 'hq', t);
  // ---- Huang's screen
  { const [key, draw] = hqDrawMail(t); redraw(s.hMonC, key, draw); }
  // ---- blinds: the bottom rail B comes down; slat i rests at min(stack_i, B + i*gap)
  { const k = hqBlind(t), stack0 = HQ_BL.top - 0.25, gap = (HQ_BL.top - 0.6 - HQ_BL.bot) / (HQ_BL.n - 1), B = lerp(stack0 - (HQ_BL.n - 1) * 0.03, HQ_BL.bot, k);
    const hdrOn = !(t > 29.75 && t < 31.0); s.hdr.forEach((m) => { m.visible = hdrOn; });   // FIX3: the swoop's lens crosses the header plane ~29.9; header + stack are out of frame at 29.75 and 31.0
    s.slats.forEach((m, i) => { m.visible = hdrOn; const st = stack0 - (HQ_BL.n - 1 - i) * 0.03, y = Math.min(st, B + i * gap); m.position.y = y; m.rotation.x = lerp(0.5, 0.26, k) * (y < st - 0.01 ? 1 : 0.2); });
    s.blB = B; s.blOcc.visible = k > 0.001; s.blOcc.scale.y = Math.max(0.01, HQ_BL.top - B); s.blOcc.position.y = (HQ_BL.top + B) / 2; }
  // ---- phones: dark until the email lands, then all light up and buzz (two pulses), jitter, buzz arcs
  s.phones.forEach((ph, i) => { const d = t - HQ_BUZZ - (i % 3) * 0.02, on = d > 0, pulse = on && ((d < 0.34) || (d > 0.46 && d < 0.8)); const sc = ph.userData.screen; sc.material = on ? HQ.M.phoneOn : HQ.M.phoneOff;
    ph.userData.p0 ||= ph.position.clone(); ph.userData.r0 ??= ph.rotation.y; const j = pulse ? 1 : 0, f = Math.floor(t * 30);
    ph.position.set(ph.userData.p0.x + j * 0.07 * Math.sin(f * 2.3 + i), ph.userData.p0.y + j * 0.03 * Math.abs(Math.sin(f * 1.7 + i)), ph.userData.p0.z + j * 0.06 * Math.cos(f * 3.1 + i)); ph.rotation.y = ph.userData.r0 + j * 0.12 * Math.sin(f * 2.9 + i * 2);
    const bz = s.buzz[i], w = ph.getWorldPosition(V3(0, 0, 0)); popAt(bz, pulse ? 1 : 0, [w.x, w.y + 0.45, w.z], cam, 1.15 + 0.12 * Math.sin(f * 2.1)); });
  // ---- the staff: working, the buzz, then they slowly turn round to stare at the glass office
  HQ_STAFF.forEach(([who, x, z, h, t0, exEnd], i) => { const office = [HQ_HU[0], HQ_HU[1]], ho = Math.atan2(office[0] - x, office[1] - z);
    let dh = ho - h; while (dh > Math.PI) dh -= TAU; while (dh < -Math.PI) dh += TAU;   // the short way round = over the shoulder nearer the office
    const u = EZ.io(hqE(t0, t0 + 0.42, t)), head = h + dh * u, jolt = t > HQ_BUZZ + 0.03 * i && t < HQ_BUZZ + 0.03 * i + 0.3 ? 0.25 * Math.sin(Math.PI * hqE(HQ_BUZZ + 0.03 * i, HQ_BUZZ + 0.03 * i + 0.3, t)) : 0;
    const typing = t < HQ_BUZZ ? 1 : 0, ex = [[0, ['neutral', 'bored', 'thinking', 'smile', 'neutral', 'bored'][i]], [HQ_BUZZ + 0.04 * i, 'surprised'], [t0 + 0.2, exEnd]];
    pose(s, who, t, x, z, { heading: head, mode: 'sit', seat: HQ_SEAT, expr: ex, squash: jolt, lean: -0.06 * u,
      gaze: t < HQ_BUZZ ? [0, 0.35] : t < t0 ? [0, 0.6] : [0.5 * Math.sign(dh), 0.05],
      hand: { L: typing ? [[0, 'desk']] : [[0, 'desk'], [t0 + 0.1, 'lap']], R: typing ? [[0, 'desk']] : [[0, 'desk'], [t0 + 0.1, 'lap']] }, idle: typing ? 1 : 0.6 }); });
  // the guard by the column: stops mid-sip, turns too
  { const x = 6.6, z = 26.4, u = EZ.io(hqE(32.5, 32.9, t)); pose(s, 'HQf', t, x, z, { heading: lerp(-0.6, Math.atan2(HQ_HU[0] - x, HQ_HU[1] - z), u), expr: [[0, 'bored'], [32.2, 'surprised'], [32.7, 'deadpan']], gaze: t > 32.6 ? [0.4, 0] : [0, 0], hand: { L: 'down', R: 'hip' } }); }
  // ---- Huang: types with his back to the floor; SEND jab; his own phone buzzes; turns round, sees the floor staring, pulls the blinds
  s.hChair.rotation.y = Math.PI * (1 - EZ.io(hqE(HQ_TURN - 0.05, HQ_TURN + 0.17, t)));   // the exec chair swivels round with him
  { const [x, z] = HQ_HU, turned = t >= HQ_TURN, typing = (t > 29.5 && t < 30.1) || (t > 30.36 && t < 31.82);
    const fac = turned ? toonLookFacing(cam, x, z, 22.3 - x, 30 - z) : t >= HQ_SIDE ? toonLookFacing(cam, x, z, HQ_MON[0] - x, HQ_MON[2] - z) : 'back';   // side OTS: his profile toward the screen, never the bald-looking back dome
    // typing (FIX3): both dot hands on the keys, tapping in turn as the letters appear (one tap per 2 letters, alternating hands);
    // in his near-profile toward the screen the forward reach is +x on the card: R (behind the torso) out +, L (front arm) out -
    const fw = typeof fac === 'number' ? Math.sign(fac) || 1 : 1, nC = hqTypedC(t) + HQ_TO.length * hqE(29.5, 30.1, t), kb = (s, ox, dip) => ({ h: [s * fw * ox, 0.56 - dip], pole: [-s * fw, 0.8], hand: 'dot', front: s === -fw });
    const tapOf = (hand) => { const q = nC / 2, k = Math.floor(q); return k % 2 === hand ? 0.11 * Math.sin(Math.PI * (q - k)) : 0; };   // lift between letters, strike as each pair lands
    const deskL = kb(-1, 0.8, 0.56 - 0.7), deskR = kb(1, 0.3, 0.56 - 0.48), jabUp = { h: [-fw * 0.62, 0.04], pole: [fw, 0.9], hand: 'point', front: true }, jabDn = { h: [-fw * 0.86, 0.5], pole: [fw, 0.9], hand: 'point', front: true };
    const R = t < 31.84 ? kb(1, 0.3, 0.56 - 0.48 + tapOf(1)) : [[0, deskR], [HQ_TURN + 0.18, { h: [0.42, -0.5], pole: [1, 0.7], hand: 'grip' }], [33.0, { h: [0.42, -0.42], pole: [1, 0.7], hand: 'grip' }], [33.15, { h: [0.4, -0.02], pole: [1, 0.6], hand: 'grip' }], [33.4, { h: [0.36, 0.3], pole: [1, 0.5], hand: 'grip' }]];
    const L = t < 31.84 ? kb(-1, 0.8, 0.56 - 0.7 + tapOf(0)) : [[0, deskL], [31.86, jabUp], [HQ_SEND - 0.04, jabDn], [32.3, deskL], [HQ_TURN, 'lap']];
    const ex = [[0, 'thinking'], [30.36, 'determined'], [31.9, 'smug'], [HQ_TURN, 'surprised'], [32.62, 'nervous']];
    const tap = typing ? 0.015 * Math.sin(t * 38) : 0, sink = t > HQ_SEND && t < HQ_SEND + 0.25 ? 0.25 * Math.sin(Math.PI * hqE(HQ_SEND, HQ_SEND + 0.25, t)) : 0;
    pose(s, 'huang', t, x, z, { facing: fac, mode: 'sit', seat: HQ_SEAT, expr: ex, hand: { L, R }, lean: tap + (t > 32.1 && t < HQ_TURN ? -0.05 : 0) + (turned ? -0.04 * hqE(32.9, 33.3, t) : 0), squash: sink + (t > HQ_TURN && t < HQ_TURN + 0.2 ? 0.18 * Math.sin(Math.PI * hqE(HQ_TURN, HQ_TURN + 0.2, t)) : 0),
      gaze: turned ? (t < 32.9 ? [-0.3, 0] : t < 33.12 ? [0.5, 0.1] : [-0.15, 0.05]) : [0, 0], fx: t > 32.62 ? 'sweat' : undefined, alive: turned ? 1 : 0, noTilt: true });   // never pitched toward the high cameras: seated back view (pushed his head into the screen) and turned (his top leaned back behind the exec chair back)
    // the cord: from the headrail to his hand once he has it, otherwise hanging straight
    const top = V3(HQ_CORD[0], HQ_BL.top, HQ_CORD[1]); let end = V3(HQ_CORD[0], 6.6, HQ_CORD[1]);
    const hR = turned && t > HQ_TURN + 0.3 ? c3ToonHandWorld(s.p.huang, 'R') : null; if (hR) end = hR.clone();
    const L2 = top.distanceTo(end); s.cord.visible = true; s.cord.scale.set(1, L2, 1); s.cord.position.copy(top).add(end).multiplyScalar(0.5); s.cord.quaternion.setFromUnitVectors(V3(0, 1, 0), end.clone().sub(top).normalize());
    s.tassel.visible = true; s.tassel.position.copy(end).add(V3(0, hR ? 0 : -0.25, 0)); s.tassel.quaternion.copy(s.cord.quaternion);
    if (hR && hR.y < s.blB - 0.15) gripDot(s, 'huang', 'R'); }   // gripDot ignores depth: only while the hand is still below the blinds' bottom rail
  // background blur: low while the calendar / screen are the subject, more on the wides
  c3Render(s.scene, cam, { bg: '#20284a', bgBlur: c3Knots([[27.28, 0.9], [27.8, 0.4], [28.66, 0.4], [29.3, 1.0], [30.2, 1.0], [30.5, 0.35], [31.9, 0.35], [32.3, 0.9], [33.46, 0.9]], t), glow: 0.35, glowBlur: 12 });
}
for (const id of ['s10', 'g1', 's11']) { SHOT_FN[id] = (t) => hqFrame(t); SNAPS[id] = 'free'; }

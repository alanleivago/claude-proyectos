// =====================================================================
//  SCENES — zelda-kakariko (night tapestry, Flow layers, 9:16). Same method as the approved zelda-fairy v4:
//  the frame (assets/bg.jpg: night wool + the Shadow frieze bands) stays put; inside it one long strip slides right,
//  panel to panel, and the camera never stops (slow push + drift). Background layers lag the slide (parallax) and sway.
//  Link is one actor on the strip: when two panels in a row show him he is drawn once, walks across the seam and his
//  pose crossfades; otherwise he leaves or arrives with his own panel.
// =====================================================================
const FX0 = 0, FX1 = 1080, FY0 = 173, FY1 = 1747, FL = 1700, SLIDE = 0.9;
const at = (t, d = 0.6) => EZ.io(clamp((TT - t) / d));
const LT = (id) => VL(id).t0, LE = (id) => VL(id).t1;
function stripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - SLIDE / 2)) / SLIDE)); return p; }
const IMG = (n) => asset(n + '.webp');
const nat = (n) => { const im = IMG(n); return im ? [im.naturalWidth, im.naturalHeight] : [100, 100]; };
const wOf = (n, h) => { const [w, hh] = nat(n); return h * w / hh; };
const hOf = (n, w) => { const [ww, h] = nat(n); return w * h / ww; };
let PX = 0;                                    // this panel's offset from rest (local slide), for parallax
const par = (d) => -PX * 0.28 * d;             // a layer at depth d (1 = far) lags the slide

function fig(n, x, y, h, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return;
  const w = h * im.naturalWidth / im.naturalHeight, br = o.breathe === false ? 0 : 0.01 * Math.sin(TT * 1.8 + x * 0.013);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha *= (o.a ?? 1) * 0.4; ctx.fillStyle = '#120c18'; ctx.beginPath(); ctx.ellipse(x, y - 4, w * 0.34, 15, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate((o.rot ?? 0) + (o.sway ?? 0.007) * Math.sin(TT * 1.3 + x * 0.01));
  ctx.scale((o.flip ? -1 : 1) * (1 - br * 0.5), 1 + br); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
}
// a layer anchored at its bottom centre (x, y), width w; o.sway rocks it from the base
function base(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return; const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate((o.rot ?? 0) + (o.sway ?? 0) * Math.sin(TT * (o.rate ?? 1.1) + x * 0.01)); ctx.scale(o.flip ? -1 : 1, o.sy ?? 1); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
}
function prop(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return; const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.flip ? -1 : 1, o.sy ?? 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
function pose(a, b, t, x, y, h, o = {}) {
  const k = EZ.io(clamp((TT - t) / (o.d ?? 0.35)));
  if (k < 1) fig(a, x, y, h, { ...o, a: (o.a ?? 1) * Math.min(1, 2 * (1 - k)) });
  if (k > 0) fig(b, x, y, h, { ...o, a: (o.a ?? 1) * Math.min(1, 2 * k), shadow: k > 0.5 });
}
function walk(x0, x1, t0, d, rate = 7, bob = 14) { const u = EZ.io(clamp((TT - t0) / d)), mv = TT > t0 && TT < t0 + d ? Math.sin(Math.PI * clamp((TT - t0) / d)) : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * rate)) * bob * mv, rot: 0.03 * Math.sin(TT * rate) * mv }; }
function glow(x, y, r, c, a, op = 'lighter') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
function wash(c, a, op = 'multiply') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0); ctx.restore(); }

// ---- woven details drawn in code (thick thread + a dashed lighter stitch on top)
function stitch(P, c, w, c2, w2 = 3, closed = false) { ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (closed) ctx.closePath(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); if (c2) { ctx.strokeStyle = c2; ctx.lineWidth = w2; ctx.setLineDash([10, 8]); ctx.stroke(); } ctx.restore(); }
// falling woven leaves (rust, ochre, olive)
const LEAF_C = ['#b4542a', '#c98a2b', '#7d8a34', '#9a3f24'];
function leaves(x0, x1, y0, y1, n, key, k = 1, sp = 110) {
  for (let i = 0; i < n; i++) { const R = RNG('lf' + key, i), span = y1 - y0, y = y0 + mod(R.r(0, span) + TT * sp * R.r(0.7, 1.2), span), x = R.r(x0, x1) + 40 * Math.sin(TT * R.r(1, 2) + i), a = Math.min(1, (y - y0) / 80, (y1 - y) / 120) * k; if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.sin(TT * 2.2 + i) * 0.9 + i); ctx.fillStyle = LEAF_C[i % 4]; ctx.strokeStyle = '#2a160a'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 8, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); ctx.restore(); }
}
// rising embers / drifting dust
function motes(x0, x1, y0, y1, n, key, col, k = 1, sp = -60) {
  for (let i = 0; i < n; i++) { const R = RNG('mt' + key, i), span = y1 - y0, y = y0 + mod(R.r(0, span) + TT * sp * R.r(0.6, 1.3), span), x = R.r(x0, x1) + 24 * Math.sin(TT * R.r(0.8, 1.8) + i), a = Math.min(1, (y - y0) / 120, (y1 - y) / 120) * k * (0.6 + 0.4 * Math.sin(TT * 5 + i)); if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, R.r(3, 6.5), 0, TAU); ctx.fill(); ctx.restore(); }
}
function grass(x0, x1, y, key, n = 24) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const R = RNG('gr' + key, i), x = R.r(x0, x1), h = R.r(24, 50), sw = 7 * Math.sin(TT * 1.6 + x * 0.02); ctx.strokeStyle = ['#4d5a22', '#6c7a2c', '#3a4418'][i % 3]; ctx.lineWidth = 6;
  for (const d of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x + d, y); ctx.quadraticCurveTo(x + d * 1.4, y - h * 0.6, x + d * 1.8 + sw, y - h); ctx.stroke(); } } ctx.restore(); }
// woven stars and a crescent moon
function stars(k, key = 0, y0 = 300, y1 = 900) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = '#f0dfae'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const R = RNG('st' + key, i), x = R.r(90, 990), y = R.r(y0, y1), s = R.r(7, 13) * (0.75 + 0.25 * Math.sin(TT * 3 + i)); ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); } ctx.restore(); }
function moon(x, y, r) { ctx.save(); ctx.fillStyle = '#efdcaa'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.42, y - r * 0.18, r * 0.86, 0, TAU, true); ctx.fill('evenodd'); ctx.restore(); glow(x, y, r * 3, 'rgba(240,220,170,A)', 0.16); }
// a woven Sheikah eye: crimson almond eye, three rays above, one tear below (k grows it in)
function sheikahEye(x, y, s, k = 1, col = '#a8203a') {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 1.4); ctx.translate(x, y); ctx.scale(s * EZ.o2(clamp(k)), s * EZ.o2(clamp(k)));
  const eye = () => { ctx.beginPath(); ctx.moveTo(-110, 0); ctx.quadraticCurveTo(0, -95, 110, 0); ctx.quadraticCurveTo(0, 95, -110, 0); ctx.closePath(); };
  ctx.fillStyle = col; eye(); ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = '#f0dfb4'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#5a1020'; ctx.setLineDash([9, 7]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#f0dfb4'; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a0a10'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
  for (const [ax, ay, r] of [[-80, -112, -0.5], [0, -140, 0], [80, -112, 0.5]]) { ctx.save(); ctx.translate(ax, ay); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-22, -34); ctx.lineTo(22, -34); ctx.lineTo(0, 16); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#f0dfb4'; ctx.stroke(); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(0, 82); ctx.quadraticCurveTo(26, 128, 0, 146); ctx.quadraticCurveTo(-26, 128, 0, 82); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#f0dfb4'; ctx.stroke();
  ctx.restore();
}
// the Lens of Truth: a round lens with a gold rim, the eye inside, a purple glow
function lens(x, y, r, k = 1, rot = 0) {
  if (k <= 0) return; glow(x, y, r * 3.2, 'rgba(190,120,255,A)', 0.45 * k);
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#6a3a8a'; ctx.beginPath(); ctx.roundRect(-r * 0.18, r * 0.9, r * 0.36, r * 0.9, 8); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#2a1430'; ctx.stroke();
  ctx.fillStyle = '#c9a0e8'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.lineWidth = r * 0.22; ctx.strokeStyle = '#c99a3a'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#6b3a14'; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore(); sheikahEye(x, y + r * 0.05, r / 260, k, '#7a2a6a');
}
// a torch: iron bracket, a woven flame that flickers, warm glow
function flame(x, y, s, key = 0) {
  const f = 1 + 0.12 * Math.sin(TT * 13 + key) + 0.08 * Math.sin(TT * 21 + key * 2), lean = 0.12 * Math.sin(TT * 3.3 + key);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * f); ctx.rotate(lean);
  for (const [c, sc] of [['#9a3f24', 1], ['#d9862f', 0.72], ['#f3d27a', 0.42]]) { ctx.beginPath(); ctx.moveTo(0, -78 * sc); ctx.bezierCurveTo(34 * sc, -36 * sc, 30 * sc, 6 * sc, 0, 10 * sc); ctx.bezierCurveTo(-30 * sc, 6 * sc, -34 * sc, -36 * sc, 0, -78 * sc); ctx.fillStyle = c; ctx.fill(); }
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#5a2010'; ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(34, -36, 30, 6, 0, 10); ctx.bezierCurveTo(-30, 6, -34, -36, 0, -78); ctx.stroke(); ctx.restore();
}
function torch(x, y, s = 1, key = 0) { ctx.save(); ctx.fillStyle = '#2a2026'; ctx.strokeStyle = '#7a3a14'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 16 * s, y); ctx.lineTo(x + 16 * s, y); ctx.lineTo(x + 8 * s, y + 60 * s); ctx.lineTo(x - 8 * s, y + 60 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); flame(x, y, s, key); glow(x, y - 30 * s, 260 * s, 'rgba(255,170,90,A)', 0.32 + 0.06 * Math.sin(TT * 9 + key)); }
// a woven stone wall: rows of blocks in slate/plum, dark outlines, a dashed light stitch
// a woven stone wall: the Flow wall layer (assets/wall.webp) cut to the rect; 'bh' scales the blocks
function stoneWall(x0, y0, x1, y1, key, bh = 92) {
  const im = IMG('wall'); if (!im) return; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  const w = 1240 * bh / 92, h = w * im.naturalHeight / im.naturalWidth, ox = x0 - 30 - ((key.length * 97) % 160);
  for (let y = y0, r = 0; y < y1; y += h, r++) { ctx.save(); ctx.translate(ox + w / 2, y + h / 2); if (r % 2) ctx.scale(1, -1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); }
  ctx.restore();
}
// carved inscription: red-brown woven capitals that stitch in word by word from t (one word every dt)
const QUOTE = [['HERE', 'IS', 'GATHERED'], ["HYRULE'S", 'BLOODY'], ['HISTORY', 'OF', 'GREED'], ['AND', 'HATRED']];
function inscription(cx, y0, size, k0, wordsAt) {
  ctx.save(); ctx.font = `bold ${size}px Georgia, "Times New Roman", serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  let n = 0;
  QUOTE.forEach((row, r) => { const sw = ctx.measureText(' ').width, ws = row.map((w) => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sw * (row.length - 1); let x = cx - tot / 2; const y = y0 + r * size * 1.22;
    row.forEach((w, j) => { const k = wordsAt(n++); if (k > 0) { ctx.globalAlpha = k * k0; const l = 8 * (1 - EZ.o2(k)); ctx.strokeStyle = 'rgba(10,6,12,0.45)'; ctx.lineWidth = 14; ctx.strokeText(w, x + 2, y + l + 6); ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 12; ctx.strokeText(w, x, y + l); ctx.fillStyle = '#fbf0d2'; ctx.fillText(w, x, y + l); } x += ws[j] + sw; }); });
  ctx.restore();
}
// iron bars and hanging chains (the cells)
function bars(x0, x1, y0, y1, n = 6) { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + 0.5) / n); stitch([[x, y0], [x, y1]], '#141016', 30); stitch([[x, y0], [x, y1]], '#4a4452', 20, '#9a92a8', 4); } for (const y of [y0 + 40, (y0 + y1) / 2, y1 - 40]) { stitch([[x0, y], [x1, y]], '#141016', 28); stitch([[x0, y], [x1, y]], '#4a4452', 18, '#9a92a8', 4); } }
function chain(x, y0, len, sw = 0) { ctx.save(); ctx.translate(x, y0); ctx.rotate(sw); ctx.lineWidth = 6; ctx.strokeStyle = '#6a6478'; for (let y = 0; y < len; y += 26) { ctx.beginPath(); ctx.ellipse(0, y + 13, (y / 26) % 2 ? 4 : 9, 14, 0, 0, TAU); ctx.stroke(); } ctx.restore(); }
// a spiked wall sliding in from one side (side -1 = left edge, +1 = right edge), k = how far in
function spikeWall(side, k, y0, y1) {
  const w = 130, inX = 150 * EZ.io(clamp(k)), x = side < 0 ? -w + inX : 1080 - inX; ctx.save();
  stoneWall(x, y0, x + w, y1, side < 0 ? 'spk' : 'spikes', 50); ctx.fillStyle = 'rgba(60,30,20,0.35)'; ctx.fillRect(x, y0, w, y1 - y0); ctx.strokeStyle = '#120a08'; ctx.lineWidth = 6; ctx.strokeRect(x, y0, w, y1 - y0);
  const tip = side < 0 ? x + w : x; for (let y = y0 + 30; y < y1 - 20; y += 70) { ctx.beginPath(); ctx.moveTo(tip, y - 24); ctx.lineTo(tip - side * -70, y); ctx.lineTo(tip, y + 24); ctx.closePath(); ctx.fillStyle = '#d8ccb0'; ctx.fill(); ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.restore();
}
// the woven "FAN THEORY" tag: a cream plaque on two cords that swings down from the top
function theoryTag(x, y, k) {
  if (k <= 0) return; const drop = (1 - EZ.o3(clamp(k))) * -420, sw = 0.08 * Math.sin(TT * 2.4) * (1 - 0.5 * clamp(k));
  ctx.save(); ctx.translate(x, y + drop); ctx.rotate(sw); ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-150, -48); ctx.lineTo(0, -150); ctx.lineTo(150, -48); ctx.stroke();
  ctx.fillStyle = '#efe0b8'; ctx.strokeStyle = '#7a3a14'; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(-210, -50, 420, 100, 22); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 3; ctx.setLineDash([9, 7]); ctx.beginPath(); ctx.roundRect(-196, -38, 392, 76, 16); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = 'bold 52px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9a2a20'; ctx.fillText('FAN THEORY', 0, 4); ctx.restore();
}
// dark plum shadow ribbons (the evil shadow leaving the well)
function shadowRibbons(x, y0, y1, k, key = 0) {
  if (k <= 0) return; for (let s = 0; s < 4; s++) { const P = [], n = 30; for (let i = 0; i <= n * clamp(k); i++) { const u = i / n; P.push([x + (s - 1.5) * 26 + 70 * Math.sin(u * 7 + TT * 4 + s * 1.7 + key) * u, lerp(y0, y1, u)]); }
    if (P.length > 1) stitch(P, '#24142c', 22 - s * 3, '#7a3a7a', 4); }
}
// a woven earth cross-section (the ground cut open): brown with stones
// a woven earth cross-section (the ground cut open): the Flow soil layer (assets/soil.webp), wavy top edge stitched
function earth(x0, y0, x1, y1, key) {
  const im = IMG('soil'); ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); for (let x = x0; x <= x1; x += 40) ctx.lineTo(x, y0 + 10 * Math.sin(x * 0.05 + key)); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.clip();
  if (im) { const w = 1240, h = w * im.naturalHeight / im.naturalWidth, ox = x0 - 40 - (key * 137) % 200; for (let y = y0 - 20, r = 0; y < y1; y += h, r++) { ctx.save(); ctx.translate(ox + w / 2, y + h / 2); if (r % 2) ctx.scale(1, -1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); } }
  ctx.restore();
  ctx.save(); ctx.beginPath(); for (let x = x0; x <= x1; x += 40) { const y = y0 + 10 * Math.sin(x * 0.05 + key); x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.lineCap = 'round'; ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.stroke(); ctx.restore();
}

// ---- captions: cream serif with a stitched brown edge, word by word; they ride with the cloth.
// Lower than zelda-fairy: each panel puts them just above its figures (CAP_Y), not at the top of the field.
const CAP_Y = { p01: 800, p02: 640, p03: 790, p04: 820, p05: 900, p06: 700, p07: 330, p08: 800, p09: 690, p10: 880, p11: 640, p12: 700, p13: 900 };
function chunks(L) {
  const ws = L.text.split(/\s+/).map((w, j) => ({ w, t: L.words[j] ? L.words[j].t0 : L.t0 })), parts = [[]];
  ws.forEach((it, j) => { parts[parts.length - 1].push(it); if (/[,.?:]"?$/.test(it.w) && j < ws.length - 1) parts.push([]); });
  const merged = []; for (const pt of parts) { const last = merged[merged.length - 1]; if (last && (pt.length < 3 || last.length < 3) && last.length + pt.length <= 8) last.push(...pt); else merged.push([...pt]); }
  return merged.flatMap((pt) => { const n = Math.ceil(pt.length / 7), size = Math.ceil(pt.length / n), out = []; for (let i = 0; i < pt.length; i += size) out.push(pt.slice(i, i + size)); return out; });
}
const CAPS = {};
function panelCaption(i) {
  const id = IDS[i], panelAt = (t) => { let k = 0; for (let j = 0; j < TB.length; j++) if (t >= TB[j] - 0.3) k = j; return k; };
  const list = CAPS[id] || (CAPS[id] = VOICE.lines.flatMap((L) => chunks(L)).filter((ch) => panelAt(ch[0].t) === i && !(id === 'p05' && ch[0].t >= VL('l05').words[4].t0 - 0.01)));
  for (let c = 0; c < list.length; c++) {
    const ch = list[c], t0 = ch[0].t - 0.12; let t1 = c + 1 < list.length ? list[c + 1][0].t - 0.12 : 1e9; const last = c + 1 >= list.length && id !== 'p05';
    if (id === 'p05') t1 = Math.min(t1, VL('l05').words[4].t0 - 0.05); if (TT < t0 || TT >= t1) continue;
    const fo = last ? 1 : 1 - clamp((TT - (t1 - 0.15)) / 0.15);
    ctx.save(); ctx.font = 'bold 64px Georgia, "Times New Roman", serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const lines = [[]]; let lw = 0; const sw = ctx.measureText(' ').width;
    for (const it of ch) { const ww = ctx.measureText(it.w).width; if (lw + ww > 790 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...it, ww }); lw += ww + sw; }
    lines.forEach((ln, r) => { const tot = ln.reduce((s, it) => s + it.ww, 0) + sw * (ln.length - 1); let x = 540 - tot / 2; const y = (CAP_Y[id] ?? 640) + r * 80;
      for (const it of ln) { const k = clamp((TT - it.t + 0.08) / 0.16) * fo; if (k > 0) { ctx.globalAlpha = k; const lift = 10 * (1 - EZ.o2(k));
        ctx.strokeStyle = 'rgba(10,6,12,0.45)'; ctx.lineWidth = 14; ctx.strokeText(it.w, x + 2, y + lift + 6);
        ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 12; ctx.strokeText(it.w, x, y + lift); ctx.fillStyle = '#fbf0d2'; ctx.fillText(it.w, x, y + lift); }
        x += it.ww + sw; } });
    ctx.restore();
  }
}

// =====================================================================
//  Link on the strip, as a mesh puppet (src/puppet.js). Each panel gives his place and pose (world angles);
//  across a seam the two poses blend and he walks over it, so he is one actor, never drawn twice.
// =====================================================================
const LH = 620;
const LK = (over) => stance('link', over);
// a walk that starts at x0 (t0, d seconds) with no foot sliding; the front arm swings against the legs
function linkWalk(t0, d, x0, over = {}, rate = 1) {
  const P = pup('link'), v = P.speed * LH / P.D.figH * rate, k = walkK(TT, t0, d), ph = (TT - t0) * rate;
  const a = walkLegs(P, LK({ uarmF: 76 + 12 * Math.sin(PTAU * ph + Math.PI) * k, farmF: 62, handF: 58, chest: -86, ...over }), ph, k);
  return { x: x0 + v * walkDist(TT, t0, d), y: FL, h: LH, abs: a };
}
const linkWalkEnd = (t0, d, x0) => x0 + pup('link').speed * LH / pup('link').D.figH * (d - 0.45);
const LINK = {
  p01: () => { const t0 = SUB('p01') + 0.05, d = 2.2, P = pup('link'), v = P.speed * LH / P.D.figH; return linkWalk(t0, d, 300 - v * (d - 0.45)); },
  p03: () => ({ x: 300, y: FL, h: LH, abs: LK({ head: -80, uarmF: 64, farmF: 24, handF: 14 }) }),
  p04: () => ({ ...linkWalk(SUB('p04') + 0.45, 2.0, -170, {}, 0.9), a: TT < SUB('p04') + SLIDE / 2 ? 0 : 1 }),
  p05: () => ({ x: 180, y: FL, h: LH, abs: LK({ head: -72, uarmF: 80, farmF: 74 }) }),
  p06: () => linkWalk(SUB('p06') + 0.4, 3.0, 180, { head: -82 }, 0.45),
  p08: () => ({ x: 230, y: FL, h: LH, abs: LK({ uarmF: 22, farmF: 2, handF: -4, head: -84 }), lens: at(SUB('p08') + 0.1, 0.5) }),
  p10: () => ({ x: 230, y: FL, h: LH, abs: LK({ uarmF: 44, farmF: -12, handF: -18, head: -80, chest: -84 }) }),
  p11: () => { const tb = VW('l11', 'bongo') - 0.25, k = at(tb, 0.6); return { x: 230, y: FL, h: LH, abs: mixAbs(LK({ head: -80 }), LK({ uarmF: -18, farmF: -48, handF: -50, head: -78, chest: -92 }), k), sword: k }; },
  p12: () => ({ x: 220, y: FL, h: LH, abs: LK({ head: -80, uarmF: 70, farmF: 34, handF: 26 }) }),
  p13: () => ({ x: 180, y: FL, h: LH, abs: LK({ head: -70, uarmF: 80, farmF: 74 }) }),
};
function linkState(i) { const f = LINK[IDS[i]]; return f ? f() : null; }
function drawLink(s, a = s ? s.a ?? 1 : 1) {
  if (!s || a <= 0) return;
  const split = s.sword > 0, g = puppet('link', s.x, s.y, s.h, s.abs, { a, hide: split ? ['armF'] : null });
  if (s.lens > 0) { const p = g.bone('handF', 0.55); lens(p.x + 10, p.y - 40, 40, a * s.lens, 0.2); }
  if (split) { const p = g.bone('handF', 0.45), im = asset('link_sword.png'), sc = s.h / pup('link').D.figH;
    glow(p.x, p.y - 160, 160, 'rgba(200,220,255,A)', 0.25 * s.sword);
    if (im) { ctx.save(); ctx.globalAlpha *= a * clamp(s.sword * 1.5); ctx.translate(p.x, p.y); ctx.rotate(p.ang + (-50) * Math.PI / 180 + Math.PI / 2); ctx.scale(sc, sc); ctx.drawImage(im, -89.4, -481.6); ctx.restore(); }
    puppet('link', s.x, s.y, s.h, s.abs, { a, shadow: false, hide: ['armB', 'legB', 'legF', 'body'] }); }
}

// =====================================================================
//  the panels (local coords; panel i sits at strip x = i * W). Everything ~22% smaller than the first board.
// =====================================================================
const WT = FY0 - 4;   // walls start at the top of the field
function p01() {   // "You walked through Kakariko a hundred times": the village asleep under the moon, the windmill, lit windows
  stars(1, 1, 240, 620); moon(860 + par(1.2), 400, 46);
  base('windmill', 920 + par(0.8), FL - 250, 190, { sway: 0.006 });
  const hw = 900, hx = 560 + par(0.5); base('houses', hx, FL - 30, hw);
  const hh = hOf('houses', hw); for (const [fx, fy, kk] of [[0.6, 0.39, 1], [0.71, 0.43, 2]]) glow(hx + (fx - 0.5) * hw, FL - 30 - hh + fy * hh, 70, 'rgba(255,190,90,A)', 0.4 + 0.15 * Math.sin(TT * 3 + kk * 2));
  grass(-60, 1140, FL + 30, 'p1');
  leaves(FX0, FX1, 250, FL - 40, 7, 'p1', 0.9, 80);
}
function p02() {   // "…its dead are buried on top of a temple full of guillotines": graves above, the ground cut open, blades below
  stars(1, 2, 230, 480);
  const gy = 1060;
  base('gtree_l', 130 + par(0.6), gy + 18, 290, { sway: 0.01 });
  base('graves', 600 + par(0.3), gy + 35, 680);
  earth(-80, gy, 1160, FL + 60, 2);
  const tO = VW('l02', 'temple') - 0.3, o = at(tO, 0.7), cx0 = 150, cw = 780, ch = 500, cy = gy + 80;
  if (o > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(cx0, cy, cw, ch * EZ.o2(o), 30); ctx.clip(); stoneWall(cx0, cy, cx0 + cw, cy + ch, 'p2', 72); ctx.fillStyle = 'rgba(10,6,14,0.35)'; ctx.fillRect(cx0, cy, cw, ch);
    const tG = VW('l02', 'guillotines') - 0.25;
    [[310, 0], [540, 0.35], [770, 0.7]].forEach(([bx, dl]) => { const ph = mod(TT - tG - dl, 1.6), d = TT < tG + dl ? 0 : ph < 0.25 ? EZ.i2(ph / 0.25) : ph < 0.7 ? 1 : 1 - EZ.io((ph - 0.7) / 0.9);
      chain(bx, cy, 50 + 150 * d); prop('blade', bx, cy + 100 + 150 * d, 135); });
    torch(190, cy + 270, 0.65, 2); torch(890, cy + 270, 0.65, 3); ctx.restore();
    ctx.save(); ctx.globalAlpha = o; ctx.lineWidth = 9; ctx.strokeStyle = '#1e140c'; ctx.beginPath(); ctx.roundRect(cx0, cy, cw, ch * EZ.o2(o), 30); ctx.stroke(); ctx.restore(); }
  leaves(FX0, FX1, 250, gy - 10, 5, 'p2', 0.8, 70);
}
function p03() {   // "a village of the Sheikah, the shadows who guarded Hyrule's royal family": the eye, Impa, the Sheikah walks in
  const tE = VW('l03', 'sheikah') - 0.4;
  glow(560, 560, 280, 'rgba(160,40,70,A)', 0.25 * at(tE, 0.8));
  sheikahEye(560 + par(0.6), 560, 0.62, at(tE, 0.8));
  puppet('impa', 640, FL, 640, stance('impa', { uarmF: 62, farmF: 26, handF: 16, head: -84 }, 1), { flip: true });
  const tS = VW('l03', 'shadows') - 0.5, d = 2.0, rt = 0.8, P = pup('sheik'), v = P.speed * 620 / P.D.figH * rt, k = walkK(TT, tS, d);
  const x = 900 + v * (d - 0.45) - v * walkDist(TT, tS, d);
  puppet('sheik', x, FL, 620, walkLegs(P, stance('sheik', { uarmF: 76 + 12 * Math.sin(PTAU * (TT - tS) * rt + Math.PI) * k, farmF: 62, handF: 58 }, 2), (TT - tS) * rt, k), { flip: true });
  motes(FX0, FX1, 600, FL - 60, 12, 'p3', 'rgba(230,200,150,0.8)', 0.7, -30);
}
function p04() {   // "Under the graveyard sits the Shadow Temple": the graves high up, the eye doorway below, torches lit
  stars(1, 4, 230, 330);
  base('graves', 540 + par(0.5), 560, 480, { a: 0.95 });
  earth(-80, 530, 1160, 600, 4);
  const dw = 520, dx = 680, tD = SUB('p04') + 0.2, rise = EZ.o3(clamp((TT - tD) / 1.2));
  base('door', dx, FL + 25 + 120 * (1 - rise), dw, { a: clamp(rise * 1.6) });
  const dh = hOf('door', dw), top = FL + 25 + 120 * (1 - rise) - dh;
  for (const fx of [0.2, 0.8]) glow(dx + (fx - 0.5) * dw, top + 0.4 * dh, 170, 'rgba(255,170,90,A)', 0.3 * rise + 0.06 * Math.sin(TT * 9 + fx * 9));
  motes(FX0, FX1, 700, FL - 40, 10, 'p4', 'rgba(230,200,150,0.8)', 0.6, -25);
}
function wallPanel(key, k0) {   // the inscription wall (p05 and p13)
  stoneWall(-40, WT, 1120, FL + 60, 'p5');
  ctx.save(); ctx.fillStyle = 'rgba(20,10,20,0.25)'; ctx.fillRect(-40, WT, 1160, FL); ctx.restore();
  torch(110, 470, 0.85, key); torch(970, 470, 0.85, key + 1);
}
function p05() {   // "A wall inside reads: 'Here is gathered Hyrule's bloody history of greed and hatred.'": the words stitch in
  wallPanel(1);
  const qw = VL('l05').words.slice(4);
  inscription(560, 520, 68, 1, (n) => { const w = qw[n]; return w ? clamp((TT - w.t0 + 0.05) / 0.25) : 1; });
  motes(FX0, FX1, 600, FL - 40, 8, 'p5', 'rgba(230,200,150,0.7)', 0.6, -20);
}
function p06() {   // "Blades drop from the ceiling, spiked walls close in, and some floors are invisible."
  stoneWall(-40, WT, 1120, FL - 100, 'p6', 90);
  ctx.save(); ctx.fillStyle = 'rgba(12,6,14,0.3)'; ctx.fillRect(-40, WT, 1160, FL); ctx.restore();
  const tI = VW('l06', 'invisible') - 0.3;
  for (let i = 0; i < 9; i++) { const x = -40 + i * 130, gone = (i === 2 || i === 6) ? at(tI + (i === 6 ? 0.3 : 0), 0.6) : 0; ctx.save(); ctx.globalAlpha = 1 - gone * 0.92; stoneWall(x + 4, FL - 90, x + 126, FL + 60, 'floor' + 'x'.repeat(i), 60); ctx.strokeStyle = '#140c12'; ctx.lineWidth = 6; ctx.strokeRect(x + 4, FL - 90, 122, 150); ctx.restore(); }
  const tB = LT('l06') - 0.1; [[660, 0], [880, 0.45]].forEach(([bx, dl]) => { const ph = mod(TT - tB - dl, 1.8), d = TT < tB + dl ? 0 : ph < 0.22 ? EZ.i2(ph / 0.22) : ph < 0.8 ? 1 : 1 - EZ.io((ph - 0.8) / 1.0);
    chain(bx, WT, 70 + 300 * d); prop('blade', bx, WT + 150 + 300 * d, 165); });
  const tW = VW('l06', 'spiked') - 0.2, kw = clamp((TT - tW) / 1.4) * (1 - 0.35 * at(VW('l06', 'invisible'), 1));
  spikeWall(-1, kw, 900, FL - 90); spikeWall(1, kw, 900, FL - 90);
  torch(540, 260, 0.7, 5);
}
function p07() {   // "the Lens of Truth, hidden under the village well": the well on the ground, its shaft cut open, the lens below
  stars(1, 7, 230, 420);
  const gy = 1270; earth(-80, gy, 1160, FL + 60, 7);
  ctx.save(); ctx.fillStyle = '#140c14'; ctx.fillRect(400, gy - 10, 280, FL - gy + 70); ctx.restore();
  for (const [sx, k] of [[385, 'sha'], [695, 'shaft']]) { stoneWall(sx - 26, gy, sx + 26, FL + 60, k, 46); stitch([[sx - 26, gy], [sx - 26, FL + 60]], '#1e1418', 5); stitch([[sx + 26, gy], [sx + 26, FL + 60]], '#1e1418', 5); }
  const tR = LT('l07') + 0.2, r = clamp((TT - tR) / 2.2); stitch([[560, gy - 300], [560, gy - 300 + 560 * EZ.io(r)]], '#c9a36a', 6);
  grass(-60, 330, gy + 12, 'p7a', 8); grass(760, 1140, gy + 12, 'p7b', 8);
  base('well', 540, gy + 40, 560);
  const tL = VW('l07', 'lens') - 0.3, k = at(tL, 0.7);
  lens(540, 1585 + 8 * Math.sin(TT * 1.6), 56, k, 0.1 * Math.sin(TT));
  leaves(FX0, FX1, 250, gy - 10, 5, 'p7', 0.8, 70);
}
function p08() {   // "where a pale thing called Dead Hand waits": hands rise from the dirt, the creature leans out of the dark
  stoneWall(-40, WT, 1120, FL - 50, 'p8', 90);
  ctx.save(); ctx.fillStyle = 'rgba(10,4,12,0.45)'; ctx.fillRect(-40, WT, 1160, FL); ctx.restore();
  earth(-80, FL - 50, 1160, FL + 60, 8);
  const tP = VW('l08', 'pale') - 0.3, tD = VW('l08', 'dead') - 0.3;
  [[490, 0, 300, 0], [1000, 0.25, 270, -8], [610, 0.5, 230, 6]].forEach(([hx, dl, hh, ln], j) => { const u = EZ.o3(clamp((TT - tP - dl) / 0.8)); if (u > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-100, 0, 1300, FL - 8); ctx.clip(); deadArm(hx, FL + 26 + hh * (1 - u), hh, j * 1.7, { lean: ln, rate: 1.2 + j * 0.25 }); ctx.restore(); } });
  const u = EZ.o3(clamp((TT - tD) / 1.0)); if (u > 0) fig('deadhand', 800, FL + 16 + 220 * (1 - u), 760, { a: clamp(u * 1.5), sway: 0.02, shadow: false });
  glow(240, 1150, 340, 'rgba(190,120,255,A)', 0.12);
}
function p09() {   // "Impa sealed an evil shadow in that well": she raises her hand, a woven Sheikah seal closes over the well
  stars(1, 9, 230, 600);
  base('well', 330, FL + 30, 580);
  const tS = VW('l09', 'sealed') - 0.3, k = at(tS, 0.8), wy = FL + 30 - hOf('well', 580) * 0.22;
  shadowRibbons(330, wy, wy - 420, 0.55 * (1 - k) + 0.25, 9);
  if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.translate(330, wy - 60); ctx.rotate(TT * 0.4); ctx.strokeStyle = '#e9c46a'; ctx.lineWidth = 9; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); ctx.stroke(); ctx.restore(); sheikahEye(330, wy - 60, 0.6, k); glow(330, wy - 60, 340, 'rgba(240,200,120,A)', 0.3 * k); }
  const r = at(tS - 0.25, 0.7);
  puppet('impa', 840, FL, 640, mixAbs(stance('impa', { head: -86 }, 3), stance('impa', { uarmF: 10, farmF: 4, handF: 0, head: -88, chest: -86 }, 3), r), { flip: true });
  leaves(FX0, FX1, 250, FL - 40, 6, 'p9', 0.8, 70);
}
function p10() {   // "When it broke loose, Kakariko burned": the roofs on fire, embers, the shadow bursting out of the well
  const tB = VW('l10', 'broke') - 0.2, tF = SUB('p10') + 0.1, f = at(tF, 0.6);
  glow(540, 1300, 620, 'rgba(255,110,50,A)', 0.28 * f + 0.05 * Math.sin(TT * 7) * f);
  base('windmill', 960 + par(0.8), FL - 260, 200, { sway: 0.006 });
  const hw = 860, hx = 620 + par(0.5); base('houses', hx, FL - 50, hw); const hh = hOf('houses', hw);
  [['fire0', 0.18, 0.12, 235], ['fire2', 0.5, 0.0, 220], ['fire1', 0.84, 0.1, 160]].forEach(([n, fx, fy, w], j) => { const g = at(tF + j * 0.25, 0.6); if (g > 0) base(n, hx + (fx - 0.5) * hw, FL - 50 - hh + fy * hh + 50, w * (0.9 + 0.1 * Math.sin(TT * 9 + j)), { a: g, sway: 0.03, rate: 5 + j, sy: 0.6 + 0.4 * g }); });
  motes(FX0, FX1, 400, FL - 100, 26, 'p10', 'rgba(255,170,80,0.95)', f, -150);
  base('well', 830, FL + 30, 470);
  const k = clamp((TT - tB) / 0.9); shadowRibbons(830, FL - 290, FL - 290 - 700 * EZ.o2(k), k * (1 - 0.6 * at(tB + 2.2, 1)), 10);
  grass(-60, 1140, FL + 30, 'p10');
}
function p11() {   // "and Bongo Bongo waited in the temple below": two giant hands over a drum, the drum booms
  stoneWall(-40, WT, 1120, FL + 60, 'p11', 100);
  ctx.save(); ctx.fillStyle = 'rgba(10,4,12,0.5)'; ctx.fillRect(-40, WT, 1160, FL); ctx.restore();
  const tA = SUB('p11') + 0.1, a = EZ.o3(clamp((TT - tA) / 1.0)), beat = Math.max(0, Math.sin(TT * 2 * Math.PI * 1.1)) ** 6;
  for (let i = 0; i < 3; i++) { const ph = mod(TT * 1.1 + i / 3, 1); ctx.save(); ctx.globalAlpha = (1 - ph) * 0.5 * a; ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.ellipse(620, 1340, 240 + ph * 340, 56 + ph * 80, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  const hw = 800, hy = 1120 + 100 * (1 - a) - 12 * beat; prop('drumming-hands', 630, hy, hw * (1 + 0.02 * beat), { a: clamp(a * 1.5) });
  glow(630, hy - 0.42 * hOf('drumming-hands', hw), 180, 'rgba(220,40,60,A)', (0.25 + 0.2 * beat) * a);
}
function p12() {   // "The game never says who suffered down there." / "Many fans think…": empty cells, chains; the FAN THEORY tag
  stoneWall(-40, WT, 1120, FL + 60, 'p12', 90);
  ctx.save(); ctx.fillStyle = 'rgba(10,4,12,0.4)'; ctx.fillRect(-40, WT, 1160, FL); ctx.restore();
  const tE = LT('l13') - 0.2; sheikahEye(720, 560, 0.6, at(tE, 1.0) * 0.6);
  for (const [cx, sw] of [[500, 0.05], [720, -0.04], [940, 0.06]]) chain(cx, WT, 300, sw * Math.sin(TT * 1.2 + cx));
  bars(420, 1060, 900, FL - 20, 5);
  theoryTag(730, 1130, clamp((TT - (VW('l13', 'fans') - 0.15)) / 0.9));
  motes(FX0, FX1, 600, FL - 40, 10, 'p12', 'rgba(230,200,150,0.7)', 0.6, -20);
}
function p13() {   // "That part is theory. The words on that wall come from the game itself.": the inscription again, whole
  wallPanel(3);
  const tW = VW('l14', 'words') - 0.2; glow(560, 700, 480, 'rgba(255,170,90,A)', 0.18 * at(tW, 0.8));
  inscription(560, 520, 68, 1, () => 1);
  motes(FX0, FX1, 600, FL - 40, 8, 'p13', 'rgba(230,200,150,0.7)', 0.6, -20);
}
function p14() {   // the sign-off (standing rule): the apple a little lower, AMPHORUS in gold with no box behind it, a small line under
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), sz = 400 * k, bob = 8 * Math.sin((TT - SIGN_T) * 1.6);
  leaves(FX0, FX1, 250, FL - 40, 8, 'p14', 0.7, 60);
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 860 + bob); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); tpLogo('AMPHORUS', 540, 1170, 88, SIGN_T); ctx.restore();
  const s = EZ.o2(clamp((TT - SIGN_T - 1.0) / 0.8)); if (s > 0) { const line = 'What the shadows buried stays buried'; ctx.save(); ctx.globalAlpha = s; ctx.font = 'italic 40px Georgia, serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 8; ctx.strokeText(line, 540, 1260); ctx.fillStyle = '#fbf0d2'; ctx.fillText(line, 540, 1260); ctx.restore(); }
}
const PANELS = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14];

let WEAVE_PAT = null;
function weaveOver() {   // the cloth's own thread texture over the whole panel (code-drawn details read as woven thread)
  const im = asset('weave_tile.png'); if (!im) return; WEAVE_PAT ??= ctx.createPattern(im, 'repeat');
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.6; ctx.fillStyle = WEAVE_PAT; ctx.fillRect(-60, FY0 - 80, W + 120, FY1 - FY0 + 160); ctx.restore();
}
const NOSHARE = new Set(['p04']);   // seams where Link exits with his panel and walks into the next one
function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);
  const p = stripPos(), off = p * W, i0 = Math.min(PANELS.length - 1, Math.floor(p)), i1 = Math.min(PANELS.length - 1, i0 + 1), u = p - i0, sliding = i0 !== i1 && u > 0, show = sliding ? [i0, i1] : [i0];
  ctx.save(); ctx.beginPath(); ctx.rect(FX0, FY0, FX1 - FX0, FY1 - FY0); ctx.clip();
  const z = 1.035 + 0.025 * Math.sin(TT * 0.45), dx = 14 * Math.sin(TT * 0.37), dy = 10 * Math.sin(TT * 0.29 + 1);
  ctx.translate(540 + dx, 1180 + dy); ctx.scale(z, z); ctx.translate(-540, -1180);
  for (const i of show) { const x = i * W - off; ctx.save(); ctx.translate(x, 0); PX = x; ctx.beginPath(); ctx.rect(-2, -200, W + 4, H + 400); ctx.clip(); PANELS[i](); weaveOver(); ctx.restore(); }
  PX = 0;
  // Link: one puppet. Across a seam the two poses blend and he walks over it (gait amplitude peaks mid-slide)
  const s0 = linkState(i0), s1 = sliding ? linkState(i1) : null;
  if (sliding && s0 && s1 && !NOSHARE.has(IDS[i1])) { const k = EZ.io(u), mv = Math.sin(Math.PI * u), P = pup('link');
    const abs = walkLegs(P, mixAbs(s0.abs, s1.abs, k), TT * 1.2, mv);
    drawLink({ x: lerp(s0.x, s1.x, k), y: FL, h: LH, abs, lens: lerp(s0.lens || 0, s1.lens || 0, k), sword: lerp(s0.sword || 0, s1.sword || 0, k) }); }
  else for (const i of show) { const s = i === i0 ? s0 : linkState(i1); if (s) { ctx.save(); ctx.translate(i * W - off, 0); drawLink(s); ctx.restore(); } }
  for (const i of show) { ctx.save(); ctx.translate(i * W - off, 0); panelCaption(i); ctx.restore(); }
  ctx.restore();
}
TIMELINE.gpu = true;

// storyboard frames: each panel at its key word
const BOARD_AT = { p01: ['l01', 'times'], p02: ['l02', 'guillotines'], p03: ['l03', 'family'], p04: ['l04', 'temple'], p05: ['l05', 'hatred'], p06: ['l06', 'invisible'], p07: ['l07', 'well'], p08: ['l08', 'waits'], p09: ['l09', 'well'], p10: ['l10', 'burned'], p11: ['l11', 'below'], p12: ['l13', 'rooms'], p13: ['l14', 'itself'] };
TIMELINE.board = IDS.map((id, i) => { if (id === 'p14') return { t: Math.round((DURATION - 1.0) * FPS) / FPS, title: id, sound: '', next: '' }; const [l, w] = BOARD_AT[id]; const t = Math.min(VW(l, w) + 0.45, SUBEND(id) - 0.55); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });

// =====================================================================
//  styles/tapestry/kit.js — an embroidered linen tapestry (Bayeux style), as in the Game of Thrones / House of
//  the Dragon tapestries (local refs: Ref amphora mitologia/house of the dragon*.{jpg,webp}).
//  Woven linen ground (#d7cab6) with visible weave; every shape is laid-work embroidery: parallel threads in
//  three shades of its colour, couching ties across them, and a stem-stitch outline in dark thread (#291817).
//  Border bands top and bottom: two stitched rules, compartments split by diagonal striped bars, a small
//  embroidered emblem in each. Lettering is stitched capitals, words alternating red and navy.
//  The tapestry is one long strip: scenes sit side by side and the camera slides right from one to the next.
//  The whole frame wiggles on 3s (turbulence displacement) like the amphora styles.
//  Needs from the piece head: W, H.
// =====================================================================
const TP = {
  linen: '#d7cab6', linenL: '#e5d9c6', linenD: '#c6b59b', ink: '#291817', ink2: '#4a3a33',
  red: '#c8242b', redD: '#8e1418', wine: '#6a2a2a', navy: '#2c3554', blue: '#62789a', blueL: '#9aaed0',
  gold: '#e2ca8b', goldD: '#b9974e', ochre: '#c9a24a', brown: '#6b4a35', grey: '#6d6a6a', greyL: '#a8a49c',
  cream: '#efe6c8', white: '#f2ece0', green: '#4f6b3a', greenL: '#7d9460', skin: '#e6cfb2', black: '#2a2526',
  fire: '#e8a23a', fireL: '#f5db70', silver: '#e9e6df',
};
const TP_FONT = 'Herculanum, Trattatello, "Luminari", Papyrus, "Times New Roman", serif';
const TP_TOP = 250, TP_BOT = 1680;            // the main band; the borders hug the top and bottom edges
const TP_FLOOR = 1440;                        // feet stand here (in panel units; panels are scaled into the band)

// ---- colour helpers
function tpHex(h) { if (h[0] !== '#') { const m = h.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; } const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function tpShade(h, k) { const [r, g, b] = tpHex(h); const f = (v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(r)},${f(g)},${f(b)})`; }

// ---- caches
const TP_CACHE = {};
function tpCanvas(key, w, h, fn) {
  if (TP_CACHE[key]) return TP_CACHE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const keep = ctx; ctx = c.getContext('2d'); fn(ctx); ctx = keep;
  return (TP_CACHE[key] = c);
}
// the linen: a tabby weave with uneven threads, slubs, soft folds; tiled (it scrolls with the strip)
const TP_TILE = 1080;
function tpLinenTile() {
  return tpCanvas('linen', TP_TILE, H, (g) => {
    const w = TP_TILE, im = g.createImageData(w, H), d = im.data, R = RNG('linen');
    const [r0, g0, b0] = tpHex(TP.linen), rowN = new Float32Array(H), colN = new Float32Array(w);
    for (let y = 0; y < H; y++) rowN[y] = R.n(9) + (R.f() < 0.03 ? R.r(10, 22) * (R.f() < 0.5 ? 1 : -1) : 0);
    for (let x = 0; x < w; x++) colN[x] = R.n(8) + (R.f() < 0.03 ? R.r(9, 20) * (R.f() < 0.5 ? 1 : -1) : 0);
    for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, cell = ((x >> 1) + (y >> 1)) & 1, wv = cell ? rowN[y] : colN[x];
      const fold = 7 * Math.sin(x * 0.006 + Math.sin(y * 0.002) * 2) + 5 * Math.sin(y * 0.004 + 1.3) + 4 * Math.sin((x + y) * 0.011);
      const gap = ((x % 3) === 0 || (y % 3) === 0) ? -9 : 0, v = wv + fold + (cell ? 6 : -6) + gap + R.n(4);
      d[i] = r0 + v; d[i + 1] = g0 + v * 0.98; d[i + 2] = b0 + v * 0.95; d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    // imperfections: thick slubs along single threads, knots, loose fibres, a few worn spots
    g.lineCap = 'round';
    for (let i = 0; i < 520; i++) { const hor = R.f() < 0.55, x = R.r(0, w), y = R.r(0, H), L = R.r(10, 70), dk = R.f() < 0.5; g.strokeStyle = dk ? `rgba(110,90,60,${R.r(0.12, 0.3)})` : `rgba(245,236,215,${R.r(0.2, 0.45)})`; g.lineWidth = R.r(1.2, 2.6); g.beginPath(); g.moveTo(x, y); hor ? g.lineTo(x + L, y + R.n(0.6)) : g.lineTo(x + R.n(0.6), y + L); g.stroke(); }
    for (let i = 0; i < 140; i++) { const x = R.r(0, w), y = R.r(0, H); g.fillStyle = `rgba(${R.f() < 0.5 ? '120,98,66' : '238,228,206'},${R.r(0.25, 0.5)})`; g.beginPath(); g.ellipse(x, y, R.r(1.5, 3.5), R.r(1.2, 2.8), R.r(0, 3), 0, TAU); g.fill(); }
    for (let i = 0; i < 40; i++) { const x = R.r(0, w), y = R.r(0, H), L = R.r(20, 60), a0 = R.r(0, TAU); g.strokeStyle = `rgba(90,72,48,${R.r(0.18, 0.35)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + Math.cos(a0) * L, y + Math.sin(a0) * L, x + Math.cos(a0 + 1.5) * L, y + Math.sin(a0 + 1.5) * L, x + R.r(-L, L), y + R.r(-L, L)); g.stroke(); }
    for (let i = 0; i < 10; i++) { const x = R.r(0, w), y = R.r(0, H), r = R.r(14, 40); g.strokeStyle = 'rgba(200,186,160,0.5)'; g.lineWidth = 1.4; for (let j = -r; j < r; j += 3) { g.beginPath(); g.moveTo(x - r, y + j); g.lineTo(x + r, y + j + R.n(1)); g.stroke(); } }
    for (let i = 0; i < 60; i++) { const x = R.r(0, w), y = R.r(0, H), r = R.r(60, 220), s = g.createRadialGradient(x, y, 0, x, y, r); s.addColorStop(0, `rgba(120,95,60,${R.r(0.02, 0.05)})`); s.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = s; g.fillRect(x - r, y - r, r * 2, r * 2); }
  });
}
// draw the linen for a strip offset (world x of the screen's left edge)
function tpLinen(off) {
  const t = tpLinenTile(), x0 = -mod(off, TP_TILE);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let x = x0; x < W; x += TP_TILE) ctx.drawImage(t, x, 0);
  ctx.restore();
}

// ---- stitches
// stem stitch: short overlapping stitches along a path, each a tiny thread with a highlight
function tpStem(P, c = TP.ink, o = {}) {
  const Q = resample(P, !!o.closed, o.step ?? 9), w = o.w ?? 3.2, n = Q.length + (o.closed ? 1 : 0), R = RNG('stem', o.key ?? (P[0][0] | 0), B);
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.lineCap = 'round';
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
  for (let i = 0; i < n - 1; i++) { const a = Q[i % Q.length], b = Q[(i + 1) % Q.length], j = (i % 2 ? 1 : -1) * w * 0.25; const nx = a[1] - b[1], ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
    ctx.moveTo(a[0] + nx / l * j + R.n(0.4), a[1] + ny / l * j + R.n(0.4)); ctx.lineTo(b[0] + (b[0] - a[0]) * 0.25 - nx / l * j, b[1] + (b[1] - a[1]) * 0.25 - ny / l * j); }
  ctx.stroke();
  if (o.hl !== false) { ctx.strokeStyle = 'rgba(255,245,225,0.22)'; ctx.lineWidth = w * 0.35; ctx.beginPath(); for (let i = 0; i < n - 1; i += 1) { const a = Q[i % Q.length], b = Q[(i + 1) % Q.length]; ctx.moveTo(a[0] - 0.8, a[1] - 0.8); ctx.lineTo((a[0] + b[0]) / 2 - 0.8, (a[1] + b[1]) / 2 - 0.8); } ctx.stroke(); }
  ctx.restore();
}
const tpLine = (x1, y1, x2, y2, c, o = {}) => tpStem([[x1, y1], [x2, y2]], c, o);
// laid work: fill a shape with parallel threads in three shades, tie them with couching, outline with stem stitch
function tpFill(P, c, o = {}) {
  const key = o.key ?? 'tf' + (P[0][0] | 0) + '_' + (P[0][1] | 0);
  const Q = o.raw ? P : wobble(P, true, o.amt ?? 0.8, key, 10);
  const bb = bbox(Q, 2), a = o.ang ?? 1.45, sp = o.sp ?? 3.6, ca = Math.cos(a), sa = Math.sin(a);
  const cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2, rad = Math.hypot(bb.x1 - bb.x0, bb.y1 - bb.y0) / 2 + 4;
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; trace(Q, true); ctx.clip();
  ctx.fillStyle = tpShade(c, -0.08); ctx.fillRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
  const shades = [tpShade(c, -0.16), c, tpShade(c, 0.12)], R = RNG('tfs', key);
  ctx.lineCap = 'butt';
  for (let s = 0; s < 3; s++) {
    ctx.strokeStyle = shades[s]; ctx.lineWidth = sp * 0.95; ctx.beginPath();
    for (let d = -rad, i = 0; d <= rad; d += sp, i++) { if (Math.floor(R.f() * 3) !== s) continue; const wv = Math.sin(i * 0.7) * 0.6;
      ctx.moveTo(cx - ca * rad - sa * (d + wv), cy - sa * rad + ca * (d + wv)); ctx.lineTo(cx + ca * rad - sa * (d - wv), cy + sa * rad + ca * (d - wv)); }
    ctx.stroke();
  }
  // a thread sheen and the dark gaps between threads
  ctx.strokeStyle = 'rgba(255,248,230,0.18)'; ctx.lineWidth = sp * 0.25; ctx.beginPath();
  for (let d = -rad; d <= rad; d += sp) { ctx.moveTo(cx - ca * rad - sa * (d - sp * 0.2), cy - sa * rad + ca * (d - sp * 0.2)); ctx.lineTo(cx + ca * rad - sa * (d - sp * 0.2), cy + sa * rad + ca * (d - sp * 0.2)); }
  ctx.stroke();
  // couching: short ties across the laid threads
  if (o.couch !== false) {
    const step = o.couchStep ?? 26, pa = a + Math.PI / 2, pc = Math.cos(pa), ps = Math.sin(pa);
    ctx.strokeStyle = tpShade(c, -0.32); ctx.lineWidth = 1.6; ctx.setLineDash([5, 7]); ctx.beginPath();
    for (let d = -rad; d <= rad; d += step) { ctx.moveTo(cx - pc * rad - ps * d, cy - ps * rad + pc * d); ctx.lineTo(cx + pc * rad - ps * d, cy + ps * rad + pc * d); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  if (o.line !== false) tpStem(Q, o.lc ?? TP.ink, { closed: true, w: o.lw ?? 3.0, key: key + 'o' });
  return Q;
}
function tpDot(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

// ---- stitched lettering: the text as a mask, filled with threads, outlined with a dashed dark stitch
function tpText(str, x, y, size, c = TP.red, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = `${size}px ${TP_FONT}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  const w = ctx.measureText(str).width, x0 = o.align === 'left' ? x : x - w / 2;
  if (o.reveal != null && o.reveal < 1) { ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (w + 20) * Math.max(0, o.reveal), size * 1.6); ctx.clip(); }
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(41,24,23,0.25)'; ctx.lineWidth = size * 0.11; ctx.strokeText(str, x + 1.5, y + 2);
  ctx.fillStyle = c; ctx.fillText(str, x, y);
  // thread texture inside the letters
  ctx.globalCompositeOperation = 'source-atop';
  ctx.strokeStyle = 'rgba(255,245,225,0.16)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let yy = y - size; yy < y + size * 0.3; yy += 3.2) { ctx.moveTo(x0 - 4, yy); ctx.lineTo(x0 + w + 4, yy + 2); }
  ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  ctx.setLineDash([6, 3]); ctx.lineWidth = Math.max(1.4, size * 0.03); ctx.strokeStyle = tpShade(c, -0.4); ctx.strokeText(str, x, y); ctx.setLineDash([]);
  ctx.restore();
  return w;
}
// a caption: words laid out in centred lines, alternating red and navy like the reference's lettering;
// each word is stitched in (revealed left to right) at its spoken time
function tpCaption(words, cx, y0, o = {}) {
  const size = o.size ?? 64, maxW = o.maxW ?? 820, lh = size * 1.25;
  ctx.save(); ctx.font = `${size}px ${TP_FONT}`;
  const sp = ctx.measureText(' ').width, lines = [[]]; let lw = 0;
  for (const w of words) { const ww = ctx.measureText(w.w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp; }
  ctx.restore();
  let k = 0;
  lines.forEach((L, i) => {
    const tw = L.reduce((s, w) => s + w.ww, 0) + sp * (L.length - 1); let x = cx - tw / 2; const y = y0 + i * lh;
    for (const w of L) { const u = clamp((TT - w.t + 0.05) / 0.28); if (u > 0) tpText(w.w, x, y, size, w.c ?? (k % 2 ? TP.navy : TP.red), { align: 'left', reveal: EZ.o2(u), a: o.a ?? 1 }); x += w.ww + sp; k++; }
  });
  return lines.length;
}

// ---- the border bands: two stitched rules, diagonal striped bars, an emblem per compartment (scrolls with the strip)
const TP_BAR = 210;   // one compartment every 210px
function tpBand(off, y0, y1, emblems, key) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  tpLine(-20, y0, W + 20, y0, TP.ink2, { w: 4, key: key + 'r0' }); tpLine(-20, y0 + 10, W + 20, y0 + 10, TP.ink2, { w: 2.4, key: key + 'r1' });
  tpLine(-20, y1, W + 20, y1, TP.ink2, { w: 4, key: key + 'r2' }); tpLine(-20, y1 - 10, W + 20, y1 - 10, TP.ink2, { w: 2.4, key: key + 'r3' });
  const i0 = Math.floor(off / TP_BAR) - 1;
  for (let i = i0; i < i0 + Math.ceil(W / TP_BAR) + 3; i++) {
    const x = i * TP_BAR - off, R = RNG('bar', key, i), cols = [[TP.red, TP.cream], [TP.navy, TP.cream], [TP.wine, TP.gold], [TP.blue, TP.white]][mod(i, 4)];
    // a slanted bar with stripes
    const slant = 40, bw = 22, by0 = y0 + 14, by1 = y1 - 14;
    const bar = [[x - bw / 2, by1], [x + bw / 2, by1], [x + bw / 2 + slant, by0], [x - bw / 2 + slant, by0]];
    ctx.save(); trace(bar, true); ctx.clip(); ctx.fillStyle = cols[1]; ctx.fillRect(x - 40, by0, slant + 80, by1 - by0);
    ctx.strokeStyle = cols[0]; ctx.lineWidth = 9; ctx.beginPath(); for (let s = by0 - 40; s < by1 + 40; s += 22) { ctx.moveTo(x - 40, s + 30); ctx.lineTo(x + slant + 40, s - 10); } ctx.stroke(); ctx.restore();
    tpStem(bar, TP.ink2, { closed: true, w: 2.2, key: key + 'bo' + i });
    const e = emblems[mod(i, emblems.length)];
    if (e) { const ex = x + TP_BAR / 2 + slant / 2, ey = (y0 + y1) / 2; ctx.save(); ctx.translate(ex, ey); e(R, i); ctx.restore(); }
  }
  ctx.restore();
}
// ---- the cloth's hem below the bottom band
function tpHem(y) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, 'rgba(60,45,30,0)'); g.addColorStop(1, 'rgba(60,45,30,0.25)'); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  ctx.restore();
}

// =====================================================================
//  figures and things, embroidered
// =====================================================================
// a standing figure in the tapestry manner: a long gown, a shorter surcoat with patterned borders, a belt,
// an optional cloak with a clasp, sleeves with cuffs and hands with fingers, a 3/4 face with lidded eyes,
// brows, a nose, lips and an ear, and hair stitched in strands. o.face: -1..1 turns the face; armL/armR angles.
const PI = Math.PI;
function tpFigure(x, y, s, o = {}) {
  const k = o.key ?? 'tfg' + (x | 0), f = o.face ?? 0, robe = o.robe ?? TP.wine, trim = o.trim ?? TP.gold, over = o.over ?? tpShade(robe, -0.18);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sway = (o.still ? 0 : 1) * 3 * Math.sin(TT * 1.4 + x * 0.01), kv = o.kneel === true ? 1 : (o.kneel || 0), kn = kv > 0.5, top = lerp(-620, -440, kv);
  const band = (P, c2, kk) => { tpFill(P, c2, { key: k + kk, ang: 0, sp: 3, couch: false, lw: 2.2 }); const bb = bbox(P); for (let xx = bb.x0 + 10; xx < bb.x1 - 6; xx += 18) tpDot(xx, (bb.y0 + bb.y1) / 2, 3.2, (c2 === TP.red || c2 === TP.redD || c2 === TP.black) ? TP.gold : TP.redD); };
  // the cloak behind, from the shoulders to near the hem
  if (o.cloak) { tpFill([[-96, top + 24], [96, top + 24], [140, top + 300], [176 + sway, -20], [-176 + sway, -20], [-140, top + 300]], o.cloak, { key: k + 'clk', ang: 1.5 }); for (let i = 0; i < 5; i++) tpStem([[-150 + i * 70, top + 120], [-160 + i * 80 + sway, -30]], tpShade(o.cloak, -0.45), { w: 2.2, key: k + 'clf' + i, hl: false }); }
  // shoes peeking under the hem
  if (kv < 0.6) for (const d of [-1, 1]) tpFill(ellipsePts(d * 46 + sway, -6, 34, 12, 0, 12), TP.black, { key: k + 'sh' + d, couch: false, lw: 2 });
  // the gown
  const GK = [[-70, top + 20], [70, top + 20], [104, top + 120], [130, -150], [190, -12], [190, 0], [-130, 0], [-130, -12], [-120, -170], [-104, top + 120]];
  const GS = [[-72, top + 20], [72, top + 20], [108, top + 120], [126, -280], [150 + sway, -16], [150 + sway, -4], [-150 + sway, -4], [-150 + sway, -16], [-126, -280], [-108, top + 120]];
  const G = GS.map((p, i) => [lerp(p[0], GK[i][0], kv), lerp(p[1], GK[i][1], kv)]);   // kneeling blends smoothly into standing
  tpFill(G, robe, { key: k + 'gown', ang: 1.52 });
  for (let i = 0; i < 6; i++) tpStem([[-60 + i * 24, top + 260], [-84 + i * 34 + sway * 0.6, -30]], tpShade(robe, -0.42), { w: 2, key: k + 'gf' + i, hl: false });
  band([[-150 + sway, -46], [150 + sway, -46], [150 + sway, -16], [-150 + sway, -16]], trim, 'hem');
  // the surcoat: shoulders to the thigh, with a bordered edge and a centre panel
  if (kv < 1) { ctx.save(); ctx.globalAlpha *= 1 - kv; const S = [[-74, top + 16], [74, top + 16], [112, top + 120], [118, top + 380], [60, top + 400], [0, top + 370], [-60, top + 400], [-118, top + 380], [-112, top + 120]];
    tpFill(S, over, { key: k + 'sur', ang: 1.5 }); band([[-118, top + 368], [-60, top + 388], [0, top + 358], [60, top + 388], [118, top + 368], [118, top + 392], [60, top + 412], [0, top + 382], [-60, top + 412], [-118, top + 392]], trim, 'surh'); ctx.restore(); }
  tpFill([[-74, top + 16], [74, top + 16], [52, top + 66], [0, top + 84], [-52, top + 66]], trim, { key: k + 'col', ang: 0, sp: 3, lw: 2.2 });
  tpFill([[-14, top + 84], [14, top + 84], [12, top + 230], [-12, top + 230]], trim, { key: k + 'plk', ang: 1.57, sp: 3, couch: false, lw: 2 });
  if (o.belt !== false) { tpFill([[-110, top + 226], [110, top + 226], [112, top + 250], [-112, top + 250]], o.belt ?? TP.brown, { key: k + 'blt', ang: 0, sp: 3, lw: 2 }); tpFill([[-16, top + 222], [16, top + 222], [16, top + 254], [-16, top + 254]], TP.gold, { key: k + 'bkl', couch: false, lw: 2 }); }
  // the cloak's clasp
  if (o.cloak) { tpDot(-70, top + 40, 14, TP.gold); tpDot(70, top + 40, 14, TP.gold); tpStem([[-70, top + 40], [0, top + 60], [70, top + 40]], TP.goldD, { w: 3, key: k + 'chn', hl: false }); }
  // arms: a sleeve with a cuff, a hand with fingers
  const arm = (side, ang) => {
    const sx = side * 90, sy = top + 36, L = 250, dx = Math.sin(ang) * side, dy = Math.cos(ang), hx = sx + dx * L, hy = sy + dy * L, nx = -dy * 32, ny = dx * 32;
    tpFill([[sx - nx, sy - ny], [sx + nx, sy + ny], [hx + nx * 0.75, hy + ny * 0.75], [hx - nx * 0.75, hy - ny * 0.75]], robe, { key: k + 'arm' + side, ang: Math.atan2(dy, dx) });
    tpStem([[sx + dx * L * 0.3, sy + dy * L * 0.3], [sx + dx * L * 0.9, sy + dy * L * 0.9]], tpShade(robe, -0.42), { w: 2, key: k + 'af' + side, hl: false });
    tpFill([[hx - nx * 0.85 - dx * 26, hy - ny * 0.85 - dy * 26], [hx + nx * 0.85 - dx * 26, hy + ny * 0.85 - dy * 26], [hx + nx * 0.85, hy + ny * 0.85], [hx - nx * 0.85, hy - ny * 0.85]], trim, { key: k + 'cuf' + side, ang: Math.atan2(-dx, dy), sp: 3, couch: false, lw: 2 });
    const px = hx + dx * 22, py = hy + dy * 22;
    tpFill(ellipsePts(px, py, 20, 22, 0, 14), TP.skin, { key: k + 'plm' + side, couch: false, lw: 2 });
    for (let i = 0; i < 4; i++) { const a2 = Math.atan2(dy, dx) + (i - 1.5) * 0.28; tpStem([[px + Math.cos(a2) * 14, py + Math.sin(a2) * 14], [px + Math.cos(a2) * 36, py + Math.sin(a2) * 36]], tpShade(TP.skin, -0.35), { w: 6, key: k + 'fg' + side + i, hl: false }); }
    return [px + dx * 20, py + dy * 20];
  };
  const hL = arm(-1, o.armL ?? (o.raiseL ? 2.6 : 0.14)), hR = arm(1, o.armR ?? (o.raiseR ? 2.6 : 0.14));
  if (o.hold) o.hold(hR, hL);
  // the head
  ctx.save(); ctx.translate(0, top - 92 + (o.nod ? 2 * Math.sin(TT * 1.2) : 0));
  const hc = o.hair ?? TP.brown, hs = o.hairStyle ?? 'short';
  const lock = (x0, y0, x1, y1, bend, sh, w, kk) => { const P = []; for (let j = 0; j <= 10; j++) { const u = j / 10, sw = (o.still ? 0 : 3) * Math.sin(TT * 1.3 + u * 2 + x0 * 0.05) * u; P.push([lerp(x0, x1, u) + bend * Math.sin(u * PI * 1.4) + sw, lerp(y0, y1, u)]); } tpStem(P, tpShade(hc, sh), { w, key: k + kk, hl: false }); };
  if (hs === 'long') {   // the hair falls behind the shoulders in wavy locks of stitched strands
    tpFill([[-60, -50], [-74, 40], [-90, 180], [-70, 236], [70, 236], [90, 180], [74, 40], [60, -50]], tpShade(hc, -0.12), { key: k + 'hb', ang: 1.57, sp: 3.4, couch: false, lw: 2 });
    const Rh = RNG('hairL', k);
    for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, xi = side * Rh.r(40, 84), yb = Rh.r(150, 236); lock(side * Rh.r(36, 60), -40, xi, yb, side * Rh.r(6, 18), [-0.32, -0.12, 0.18, 0.3][i % 4], Rh.r(2.6, 4.2), 'hl' + i); }
  }
  tpFill([[-20, 42], [20, 42], [22, 96], [-22, 96]], TP.skin, { key: k + 'nk', couch: false, lw: 2, ang: 0 });
  const FC = [[-54, -40], [-50, 10], [-36, 50], [-12, 72], [12, 72], [36, 50], [50, 10], [54, -40], [40, -76], [0, -88], [-40, -76]].map(([a, b]) => [a + f * 4, b]);
  tpFill(FC, TP.skin, { key: k + 'face', couch: false, ang: 0.05, sp: 3.2 });
  if (hs !== 'long') tpFill(ellipsePts(f >= 0 ? -54 : 54, -2, 10, 18, 0, 10), TP.skin, { key: k + 'ear', couch: false, lw: 2 });
  // eyes: whites, irises, upper lids, heavy brows
  const ex = 21, ey = -10, fx = f * 12;
  for (const d of [-1, 1]) {
    const cx = fx + d * ex * (1 - 0.25 * f * d);
    if (o.patch && d === (o.patchSide ?? -1)) { tpFill(ellipsePts(cx, ey, 15, 12, 0, 12), TP.black, { key: k + 'ptc', couch: false, lw: 1.8 }); continue; }
    tpFill(ellipsePts(cx, ey, 12, 6.5, 0, 12), TP.white, { key: k + 'ew' + d, couch: false, lw: 1.8, ang: 0 });
    tpDot(cx + f * 3, ey + 0.5, 4.4, o.eye ?? TP.navy); tpDot(cx + f * 3, ey + 0.5, 1.8, TP.ink);
    tpStem([[cx - 14, ey - 1], [cx, ey - 8], [cx + 14, ey - 2]], TP.ink, { w: 2.6, key: k + 'lid' + d, hl: false });
    tpStem([[cx - 15, ey - 18 + (o.sad ? d * 3 : 0)], [cx, ey - 23], [cx + 15, ey - 19 - (o.sad ? d * 3 : 0)]], tpShade(hc, -0.25), { w: 4, key: k + 'brw' + d, hl: false });
  }
  if (o.patch) tpLine(-52, -30, 52, -16, TP.black, { w: 2.6, key: k + 'pst', hl: false });
  tpStem([[fx + f * 4, ey - 4], [fx + f * 14 + 4, ey + 26], [fx + f * 6 - 6, ey + 32]], tpShade(TP.skin, -0.45), { w: 2.4, key: k + 'nose', hl: false });
  tpDot(fx - 18, ey + 26, 5, '#e3a99a'); tpDot(fx + 18, ey + 26, 5, '#e3a99a');
  const my = ey + 46;
  if (!o.male) tpFill([[fx - 14, my], [fx, my - 4], [fx + 14, my], [fx, my + 6 + (o.sad ? -2 : 0)]], TP.red, { key: k + 'lip', couch: false, lw: 1.4, lc: TP.redD });
  tpStem([[fx - 14, my + (o.sad ? 3 : 0)], [fx + 14, my + (o.sad ? 3 : 0)]], o.male ? tpShade(TP.skin, -0.5) : TP.redD, { w: 1.8, key: k + 'mth', hl: false });
  if (o.beard) { tpFill([[-50, 6], [-40, 52], [-14, 80], [14, 80], [40, 52], [50, 6], [30, 40], [14, 52], [-14, 52], [-30, 40]], o.beard, { key: k + 'brd', ang: 1.57, sp: 3 }); for (let i = 0; i < 5; i++) tpStem([[-30 + i * 15, 40], [-24 + i * 12, 76]], tpShade(o.beard, -0.3), { w: 1.8, key: k + 'brs' + i, hl: false }); tpFill([[fx - 26, my - 8], [fx, my - 14], [fx + 26, my - 8], [fx + 20, my - 2], [fx - 20, my - 2]], o.beard, { key: k + 'mst', couch: false, lw: 1.6 }); }
  // hair on the crown of the head, with strands
  if (hs !== 'bald') {
    const HP = hs === 'long' ? [[-64, -10], [-62, -66], [-34, -98], [0, -106], [34, -98], [62, -66], [64, -10], [50, -48], [20, -70], [-20, -70], [-50, -48]]
                             : [[-60, -20], [-58, -70], [-30, -98], [0, -104], [30, -98], [58, -70], [60, -20], [46, -52], [10, -72], [-30, -66], [-48, -48]];
    tpFill(HP, tpShade(hc, -0.08), { key: k + 'hr', ang: 0.6, sp: 3.2, couch: false });
    const Rc = RNG('hairC', k), px = hs === 'long' ? 0 : -10;   // strands from a parting, curving to each temple
    for (let i = 0; i < 22; i++) { const side = i % 2 ? 1 : -1, u = Rc.r(0.1, 1), ex2 = side * lerp(20, 64, u), ey2 = lerp(-94, -18, u * u);
      const P = []; for (let j = 0; j <= 8; j++) { const v = j / 8; P.push([lerp(px, ex2, v) + side * 8 * Math.sin(v * PI), lerp(-102, ey2, v) - 6 * Math.sin(v * PI)]); }
      tpStem(P, tpShade(hc, [-0.35, -0.15, 0.2, 0.35][i % 4]), { w: Rc.r(2.2, 3.4), key: k + 'hs' + i, hl: false }); }
    if (hs !== 'long') for (let i = 0; i < 6; i++) { const a0 = PI * (1.05 + i * 0.18); tpStem(arcPts(Math.cos(a0) * 50, -40 + Math.sin(a0) * 54, 8, 0, 4, 6), tpShade(hc, -0.3), { w: 2.2, key: k + 'cu' + i, hl: false }); }
  }
  if (o.crown) { tpFill([[-50, -76], [-56, -130], [-32, -100], [-14, -144], [6, -102], [28, -140], [50, -100], [56, -128], [52, -76]], o.crownC ?? TP.gold, { key: k + 'crn', ang: 1.57, sp: 3 }); for (const gx of [-30, 0, 30]) tpDot(gx, -90, 5, TP.red); }
  ctx.restore();
  ctx.restore();
}
// the Iron Throne: a chair built of swords — steps, a seat, sword legs and sword armrests, and a tall back of
// upright blades with crossguards and grips, fanning out toward the top
function tpSword(x, y, ang, L, k, o = {}) {   // a sword from its pommel (x, y) along ang (radians), blade length L
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, g = 26, bw = o.bw ?? 9;
  tpFill([[x - nx * 5, y - ny * 5], [x + nx * 5, y + ny * 5], [x + ca * g + nx * 5, y + sa * g + ny * 5], [x + ca * g - nx * 5, y + sa * g - ny * 5]], TP.brown, { key: k + 'g', couch: false, lw: 1.6, ang });
  const cx = x + ca * g, cy = y + sa * g;
  tpFill([[cx - nx * 22, cy - ny * 22], [cx + nx * 22, cy + ny * 22], [cx + nx * 22 + ca * 8, cy + ny * 22 + sa * 8], [cx - nx * 22 + ca * 8, cy - ny * 22 + sa * 8]], o.guard ?? TP.goldD, { key: k + 'x', couch: false, lw: 1.6, ang: ang + PI / 2 });
  const bx = cx + ca * 8, by = cy + sa * 8;
  tpFill([[bx - nx * bw, by - ny * bw], [bx + nx * bw, by + ny * bw], [bx + ca * L + nx * 3, by + sa * L + ny * 3], [bx + ca * (L + 26), by + sa * (L + 26)], [bx + ca * L - nx * 3, by + sa * L - ny * 3]], o.c ?? TP.greyL, { key: k + 'b', couch: false, lw: 2, ang });
  tpStem([[bx + ca * 6, by + sa * 6], [bx + ca * L * 0.92, by + sa * L * 0.92]], TP.grey, { w: 2, key: k + 'f', hl: false });
}
function tpThrone(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // the back: a dark mass, then upright blades fanning out
  tpFill([[-150, -200], [150, -200], [190, -520], [0, -640], [-190, -520]], TP.black, { key: 'thbk' + x, ang: 1.57 });
  for (let i = 0; i < 17; i++) { const u = i / 16 - 0.5, ang = -PI / 2 + u * 1.25, L = 330 + 170 * (1 - Math.abs(u) * 1.8) + (i % 2) * 30; tpSword(u * 260, -190, ang, L, 'thb' + i + x, { c: i % 3 ? TP.greyL : TP.silver }); }
  // the seat and its front, made of crossed blades
  tpFill([[-170, -190], [170, -190], [176, -150], [-176, -150]], TP.grey, { key: 'tht' + x, ang: 0 });
  tpFill([[-160, -150], [160, -150], [150, -60], [-150, -60]], TP.black, { key: 'thf' + x, ang: 1.57 });
  for (let i = 0; i < 7; i++) tpSword(-150 + i * 50, -150, PI / 2 - 0.2 + (i % 2) * 0.4, 60, 'thfs' + i + x, { bw: 6 });
  // armrests: swords lying flat, hilts toward us
  for (const d of [-1, 1]) { tpFill([[d * 150, -290], [d * 210, -290], [d * 210, -200], [d * 150, -200]], TP.grey, { key: 'tha' + d + x, ang: 0 }); tpSword(d * 220, -300, d > 0 ? PI : 0, 90, 'thar' + d + x, { bw: 8 }); }
  // legs: blades pointing down
  for (const d of [-1, 1]) tpSword(d * 150, -70, PI / 2, 40, 'thl' + d + x, { bw: 7 });
  // steps
  for (let i = 0; i < 3; i++) tpFill([[-220 - i * 34, -40 + i * 20], [220 + i * 34, -40 + i * 20], [220 + i * 34, -20 + i * 20], [-220 - i * 34, -20 + i * 20]], i % 2 ? TP.greyL : TP.grey, { key: 'thst' + i + x, ang: 0, couch: false });
  ctx.restore();
}
// a dragon in flight, facing dir: the body is a tube drawn along an S-shaped spine (neck, chest, belly, a long
// tail), with scale stitches, a pale plated belly and back spines; bat wings with an arm bone and four fingers,
// a scalloped membrane, flapping on ph; a horned head with a jaw that opens; tucked clawed legs; rider and fire.
function tpDragon(x, y, s, dir, o = {}) {
  const k = o.key ?? 'drg' + (x | 0), c = o.c ?? TP.red, cw = o.cw ?? tpShade(c, 0.12), ph = o.ph ?? TT * 4, flap = Math.sin(ph);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.rotate(o.rot ?? 0);
  const N = 56, wave = (u) => 26 * Math.sin(u * 7 - TT * 2.4) * u;
  // the spine from the head (u=0) to the tail tip (u=1)
  const sp = (u) => { if (u < 0.22) { const v = u / 0.22; return [250 - 230 * v, -190 + 190 * v * v * (3 - 2 * v) + 30 * Math.sin(v * PI)]; }
    const v = (u - 0.22) / 0.78; return [20 - 680 * v, 10 * Math.sin(v * PI) * 3 - 40 * v * v + wave(v)]; };
  const wd = (u) => (u < 0.22 ? lerp(30, 64, u / 0.22) : u < 0.45 ? 64 + 6 * Math.sin((u - 0.22) / 0.23 * PI) : lerp(60, 5, (u - 0.45) / 0.55));
  const S = [], up = [], dn = [];
  for (let i = 0; i <= N; i++) { const u = i / N, p = sp(u), q = sp(Math.min(1, u + 0.01)), a = Math.atan2(q[1] - p[1], q[0] - p[0]), nx = -Math.sin(a), ny = Math.cos(a), w = wd(u); S.push(p); up.push([p[0] - nx * w, p[1] - ny * w]); dn.push([p[0] + nx * w, p[1] + ny * w]); }
  const wingRoot = sp(0.27), hip = sp(0.47);
  const wing = (dx, kk, sc, back) => {
    const fold = 0.55 + 0.45 * flap, rx = wingRoot[0] + dx, ry = wingRoot[1] - 30;
    const wrist = [rx + 60 * sc, ry - 300 * sc * fold], tips = [[-260, -520], [-80, -600], [120, -560], [260, -380]].map(([a, b]) => [rx + a * sc, ry + b * sc * fold]);
    const P = [[rx, ry], wrist, tips[0]];
    for (let i = 0; i < tips.length; i++) { const t = tips[i], n2 = i + 1 < tips.length ? tips[i + 1] : [hip[0] + 40, hip[1] - 40]; P.push(t); P.push([(t[0] + n2[0]) / 2 + 30 * sc, (t[1] + n2[1]) / 2 + 70 * sc * fold]); }
    P.push([hip[0] + 40, hip[1] - 40]);
    const PP = [P[0], P[1], tips[3], P[P.length - 2], P[P.length - 1]];   // membrane order: root → wrist → fingers → back to the hip
    const M = [[rx, ry], wrist]; for (let i = tips.length - 1; i >= 0; i--) { const t = tips[i], n2 = i > 0 ? tips[i - 1] : [rx - 80 * sc, ry - 40]; M.push(t); M.push([(t[0] + n2[0]) / 2 - 20 * sc, (t[1] + n2[1]) / 2 + 60 * sc * fold]); }
    // simpler, robust membrane: root, wrist, the four tips with scallops, then down to the hip along the back
    const Q = [[rx, ry]]; tips.slice().reverse().forEach((t, i, arr) => { Q.push(t); const n2 = i + 1 < arr.length ? arr[i + 1] : null; if (n2) Q.push([(t[0] + n2[0]) / 2 + 30 * sc, (t[1] + n2[1]) / 2 + 80 * sc * fold]); });
    const back2 = [hip[0] + 20, hip[1] - 50]; Q.push([(tips[0][0] + back2[0]) / 2, (tips[0][1] + back2[1]) / 2 + 60 * sc]); Q.push(back2);
    tpFill(Q, back ? tpShade(cw, -0.22) : cw, { key: k + kk, ang: 1.25, sp: 3.4 });
    tpStem([[rx, ry], wrist], tpShade(c, -0.3), { w: 9, key: k + kk + 'arm', hl: false });
    for (const t of tips) tpStem([wrist, [(wrist[0] + t[0]) / 2, (wrist[1] + t[1]) / 2 - 12 * sc], t], tpShade(c, -0.3), { w: 5, key: k + kk + t[0], hl: false });
    tpFill([[wrist[0] - 8, wrist[1]], [wrist[0] + 10, wrist[1] - 30], [wrist[0] + 18, wrist[1] + 4]], TP.cream, { key: k + kk + 'clw', couch: false, lw: 1.6 });
  };
  wing(-30, 'wf', 0.85, true);
  // hind and fore legs, tucked
  const leg = (p, kk) => { tpFill([[p[0] - 30, p[1] + 20], [p[0] + 26, p[1] + 20], [p[0] - 4, p[1] + 96], [p[0] - 34, p[1] + 90]], c, { key: k + kk, ang: 1.1 }); tpFill([[p[0] - 34, p[1] + 86], [p[0] - 4, p[1] + 96], [p[0] + 40, p[1] + 120], [p[0] + 30, p[1] + 132]], c, { key: k + kk + 's', ang: 0.4 }); for (let j = 0; j < 3; j++) tpStem([[p[0] + 28 + j * 6, p[1] + 124 + j * 3], [p[0] + 48 + j * 6, p[1] + 136 + j * 4]], TP.cream, { w: 3.4, key: k + kk + j, hl: false }); };
  leg(sp(0.3), 'lf'); leg(hip, 'lh');
  // the body tube, the belly plates, scales, spines
  tpFill([...up, ...dn.slice().reverse()], c, { key: k + 'bd', ang: 0.2, sp: 3.4 });
  const bel = []; for (let i = 6; i <= 34; i++) { const u = i / N, p = S[i], w = wd(u); bel.push([dn[i][0] * 0.55 + p[0] * 0.45, dn[i][1] * 0.55 + p[1] * 0.45]); }
  const bel2 = []; for (let i = 34; i >= 6; i--) bel2.push(dn[i]);
  tpFill([...bel, ...bel2], o.belly ?? TP.cream, { key: k + 'bel', ang: 1.4, sp: 3, couch: false, lw: 2 });
  for (let i = 8; i <= 34; i += 3) tpStem([bel[i - 6], dn[i]], tpShade(o.belly ?? TP.cream, -0.4), { w: 2, key: k + 'pl' + i, hl: false });
  for (let i = 4; i < N - 6; i += 2) { const u = i / N, p = S[i], q = up[i], m = [(p[0] * 0.6 + q[0] * 0.4), (p[1] * 0.6 + q[1] * 0.4)], r = Math.max(4, wd(u) * 0.22); tpStem(arcPts(m[0], m[1], r, 0.2, 2.9, 5), tpShade(c, -0.4), { w: 2, key: k + 'sc' + i, hl: false }); }
  for (let i = 3; i < N - 4; i += 3) { const p = up[i], q = up[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]), h = Math.max(8, wd(i / N) * 0.5); tpFill([p, [p[0] + Math.cos(a) * 14 + Math.sin(a) * h, p[1] + Math.sin(a) * 14 - Math.cos(a) * h], [p[0] + Math.cos(a) * 26, p[1] + Math.sin(a) * 26]], o.spike ?? TP.cream, { key: k + 'spk' + i, couch: false, lw: 1.6 }); }
  const tt = S[N]; tpFill([[tt[0] + 16, tt[1] - 26], [tt[0] - 60, tt[1]], [tt[0] + 16, tt[1] + 26], [tt[0], tt[1]]], o.spike ?? TP.cream, { key: k + 'tip', couch: false, lw: 2 });
  // the head, along the direction of the neck's end
  const h0 = S[0], h1 = S[2], ha = Math.atan2(h0[1] - h1[1], h0[0] - h1[0]), jaw = o.jaw ?? 0;
  ctx.save(); ctx.translate(h0[0], h0[1]); ctx.rotate(ha);
  tpFill([[-30, -30], [40, -40], [110, -22], [128, -6], [70, 0], [-20, 22]], c, { key: k + 'hd', ang: 0.05 });
  tpFill([[-14, 8], [118, 0], [104, 18 + jaw * 50], [-6, 30]], tpShade(c, -0.18), { key: k + 'jw', ang: 0.1 });
  if (jaw > 0.15) for (let j = 0; j < 5; j++) tpStem([[22 + j * 20, 0], [26 + j * 20, 12]], TP.cream, { w: 3, key: k + 'tth' + j, hl: false });
  for (const [ax, ay, bx, by] of [[-24, -26, -96, -70], [0, -34, -60, -104]]) tpFill([[ax, ay], [bx, by], [ax + 24, ay - 2]], o.horn ?? TP.cream, { key: k + 'hn' + bx, couch: false, lw: 2 });
  tpFill(ellipsePts(46, -22, 10, 6, 0, 10), TP.fireL, { key: k + 'eye', couch: false, lw: 1.6 }); tpDot(48, -22, 3, TP.ink);
  tpDot(116, -14, 3, TP.ink);
  if (o.fire > 0) { const L = 520 * o.fire; for (let j = 0; j < 3; j++) { const R = RNG('brt', k, j, B), P2 = [[124, -6], [124 + L * 0.5, -50 - j * 20 + R.r(-20, 20)], [124 + L, -30 + R.r(-40, 40)], [124 + L * 0.9, 40 + R.r(-30, 30)], [124 + L * 0.5, 50 + j * 16], [124, 12]]; tpFill(P2, [TP.red, TP.fire, TP.fireL][j], { key: k + 'fb' + j + B, ang: 0, couch: false, lw: 2 }); } }
  ctx.restore();
  // the rider, sitting where the neck meets the back
  if (o.rider) { const r = sp(0.24); ctx.save(); ctx.translate(r[0], r[1] - 40); ctx.scale(0.22, 0.22); tpFigure(0, 0, 1, { ...o.rider, still: true, key: k + 'rdr', armR: 1.25 }); ctx.restore(); }
  wing(10, 'wn', 1.0, false);
  ctx.restore();
}
// a castle on a hill: walls, towers with crenels and a banner
function tpCastle(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  tpFill([[-220, 0], [220, 0], [190, -60], [-190, -60]], TP.greenL, { key: 'chl' + x, ang: 0.1 });
  tpFill([[-160, -60], [160, -60], [160, -230], [-160, -230]], o.c ?? TP.grey, { key: 'cw' + x, ang: 0 });
  for (const tx of [-160, 0, 160]) { tpFill([[tx - 44, -60], [tx + 44, -60], [tx + 44, -330 - (tx ? 0 : 60)], [tx - 44, -330 - (tx ? 0 : 60)]], o.c2 ?? TP.greyL, { key: 'ct' + tx + x, ang: 0 }); for (let i = 0; i < 3; i++) tpFill([[tx - 44 + i * 34, -330 - (tx ? 0 : 60)], [tx - 26 + i * 34, -330 - (tx ? 0 : 60)], [tx - 26 + i * 34, -356 - (tx ? 0 : 60)], [tx - 44 + i * 34, -356 - (tx ? 0 : 60)]], o.c2 ?? TP.greyL, { key: 'cc' + tx + i + x, couch: false, lw: 2 }); }
  tpFill([[-30, -60], [30, -60], [30, -150], [0, -180], [-30, -150]], TP.black, { key: 'cg' + x, ang: 1.57 });
  for (const tx of [-160, 160]) tpFill([[tx - 12, -250], [tx + 12, -250], [tx + 12, -280], [tx - 12, -280]], TP.black, { key: 'cwn' + tx + x, couch: false, lw: 1.8 });
  if (o.banner) { const fl = 8 * Math.sin(TT * 4 + x); tpLine(0, -390, 0, -520, TP.ink, { w: 3, key: 'cbp' + x }); tpFill([[0, -520], [90, -510 + fl], [80, -470 + fl], [0, -470]], o.banner, { key: 'cbn' + x, ang: 0, lw: 2 }); }
  if (o.burn > 0) tpFlames(0, -230, 360, 260 * o.burn, 'cf' + x);
  ctx.restore();
}
// embroidered flames: tongues in red, orange and yellow thread, flickering on the boil
function tpFlames(x, y, w, h, key) {
  if (h <= 1) return;
  const n = Math.max(3, Math.round(w / 60));
  for (const [c, sc] of [[TP.red, 1], [TP.fire, 0.72], [TP.fireL, 0.45]]) for (let i = 0; i < n; i++) {
    const R = RNG('tfl', key, i, B), bx = x - w / 2 + (i + 0.5) * w / n, hh = h * sc * R.r(0.6, 1.1), ww = w / n * 0.8 * sc, lean = R.r(-0.3, 0.3) * hh;
    tpFill([[bx - ww, y], [bx - ww * 0.7, y - hh * 0.4], [bx - ww * 0.1 + lean * 0.4, y - hh * 0.6], [bx - ww * 0.4 + lean * 0.7, y - hh * 0.85], [bx + lean, y - hh], [bx + ww * 0.4 + lean * 0.5, y - hh * 0.55], [bx + ww, y]], c, { key: 'tflm' + key + i + sc + B, couch: false, ang: 1.57, lw: 2.2, lc: tpShade(c, -0.5) });
  }
}
// clouds, rain, lightning, in thread
function tpCloud(x, y, s, c = TP.greyL, key = 'cl') {   // a row of scallops on a flat base, like the tapestry's clouds
  const P = [[x - 230 * s, y]], n = 5;
  for (let i = 0; i < n; i++) { const cx = x - 230 * s + (i + 0.5) * 460 * s / n, r = 46 * s * (1 + 0.35 * Math.sin(i * 2.1 + 1)); for (let j = 0; j <= 8; j++) { const a = Math.PI + j / 8 * Math.PI; P.push([cx + Math.cos(a) * 460 * s / n / 2, y - 10 * s + Math.sin(a) * r]); } }
  P.push([x + 230 * s, y]);
  tpFill(P, c, { key: key + (x | 0), ang: 0, lw: 2.4 });
  for (let i = 1; i < n; i++) tpStem([[x - 230 * s + i * 460 * s / n, y - 6 * s], [x - 230 * s + i * 460 * s / n, y - 30 * s]], tpShade(c, -0.4), { w: 2, key: key + 'cs' + i, hl: false });
}
function tpRain(x0, x1, y0, y1, key, n = 60) { ctx.save(); ctx.strokeStyle = TP.blue; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < n; i++) { const R = RNG('rn', key, i), x = R.r(x0, x1), y = y0 + mod(R.r(0, y1 - y0) + TT * 500, y1 - y0); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 30); } ctx.stroke(); ctx.restore(); }
function tpBolt(x, y, h, a, key) { if (a <= 0) return; const R = RNG('bolt', key), P = [[x, y]]; let cx = x; for (let i = 1; i <= 7; i++) { cx += R.r(-40, 40); P.push([cx, y + h * i / 7]); } ctx.save(); ctx.globalAlpha *= a; tpStem(P, TP.fireL, { w: 6, key: key + 'b', hl: false }); tpStem(P, TP.white, { w: 2.4, key: key + 'c', hl: false }); ctx.restore(); }
function tpWaves(x0, x1, y, key, rows = 3) { for (let r = 0; r < rows; r++) { const P = []; for (let x = x0; x <= x1; x += 12) P.push([x, y + r * 34 + 8 * Math.sin(x * 0.04 + r + TT * 2)]); tpStem(P, [TP.blue, TP.navy, TP.blueL][r % 3], { w: 4, key: key + r, hl: false }); } }
// a banner on a pole with a sigil drawn by fn
function tpBanner(x, y, c, sigil, key, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  tpLine(0, 0, 0, -420, TP.brown, { w: 5, key: key + 'p' });
  const fl = 10 * Math.sin(TT * 3 + x * 0.01);
  tpFill([[0, -420], [150, -414 + fl], [150, -250 + fl], [75, -220 + fl], [0, -250]], c, { key: key + 'f', ang: 1.57 });
  if (sigil) { ctx.save(); ctx.translate(75, -330 + fl); sigil(); ctx.restore(); }
  ctx.restore();
}
// the three-headed dragon sigil of House Targaryen, small
function tpSigil(c = TP.red, s = 1) {
  ctx.save(); ctx.scale(s, s);
  tpFill([[-30, 30], [30, 30], [40, -10], [10, -30], [-20, -30], [-40, -10]], c, { key: 'sg' + c, couch: false, lw: 2 });
  for (const [hx, hy] of [[-34, -50], [0, -64], [34, -50]]) { tpLine(0, -20, hx, hy, c, { w: 7, key: 'sgn' + hx + c, hl: false }); tpDot(hx, hy, 10, c); }
  ctx.restore();
}

// ---- the sign-off: gold Roman capitals with a moving shine (no stitch outline)
function tpLogo(str, x, y, size, t0) {
  ctx.save(); ctx.font = `${size}px "1689 GLC Garamond Pro", "Trajan Pro", Baskerville, serif`; ctx.textAlign = 'center'; ctx.letterSpacing = size * 0.12 + 'px';
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(60,35,10,0.45)'; ctx.fillText(str, x + 3, y + 5);
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1); g.addColorStop(0, '#f6dd94'); g.addColorStop(0.45, '#d6a64a'); g.addColorStop(0.55, '#a8761f'); g.addColorStop(1, '#e3bd68');
  ctx.fillStyle = g; ctx.fillText(str, x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#6b4a14'; ctx.strokeText(str, x, y);
  const sx = x - w / 2 + mod((TT - t0) * 0.6, 1.6) * w, sh = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
  sh.addColorStop(0, 'rgba(255,250,220,0)'); sh.addColorStop(0.5, 'rgba(255,250,220,0.85)'); sh.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = sh; ctx.fillText(str, x, y); ctx.restore();
}

// ---- the wiggle (same as the amphora styles): turbulence displacement, re-seeded every 3 frames
let TP_WIG = null;
function tpWiggle(px = 2.6) {
  if (typeof document === 'undefined') return;
  if (!TP_WIG) {
    const NS = 'http' + '://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    for (let i = 0; i < 4; i++) {
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'tpwig' + i); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.022'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(3 + i * 7)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'SourceGraphic'); d.setAttribute('in2', 'n'); d.setAttribute('scale', String(px * 2)); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      f.appendChild(t); f.appendChild(d); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    TP_WIG = document.createElement('canvas'); TP_WIG.width = W; TP_WIG.height = H;
  }
  const g = TP_WIG.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `url(#tpwig${Math.floor(F / 3) % 4})`; ctx.drawImage(TP_WIG, 0, 0); ctx.filter = 'none'; ctx.restore();
}

const STYLE = {
  name: 'tapestry',
  paper: TP.linen,
  backdrop() { tpLinen(0); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { tpFill(P, c); },
  hero(x, y, r) { tpSigil(TP.red, r / 60); },
  heroColor: TP.red,
  post() { tpWiggle(); },
  ones: false,
};

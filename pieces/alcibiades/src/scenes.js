// =====================================================================
//  SCENES — Alcibiades (amphora). World 1080x1920, on 2s, the whole frame wiggles on 3s (STYLE.post).
//  The picture lives between the friezes (y 190..1730); captions in ITC Garamond italic, top or bottom per shot.
//  blue = Athens, red = Sparta, gold = Persia.
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const shotU = (id) => clamp((TT - SUB(id)) / (SUBEND(id) - SUB(id)));
const shotNow = () => IDS[Math.max(0, TB.findIndex((t, i) => TT >= t - 1e-6 && (i + 1 >= TB.length || TT < TB[i + 1] - 1e-6)))];

// ---- captions: a line splits into chunks at sentence ends (and at a comma inside a long sentence); top or bottom per shot
const CAP_POS = { hook: 'T', pericles: 'T', socrates: 'B', sicily: 'T', fleet: 'B', herms: 'T', flee: 'T', advice: 'T', queen: 'T', persia: 'T', gold: 'B', general: 'T', hero: 'B', fire: 'B', name: 'T' };
function capChunks(id) {
  const L = VL(id), ws = L.text.split(/\s+/), out = [[]];
  const left = (i) => { let n = 0; for (let j = i + 1; j < ws.length; j++) { n++; if (/[.:?]$/.test(ws[j])) break; } return n; };
  ws.forEach((w, i) => {
    out[out.length - 1].push({ w, t: L.words[i] ? L.words[i].t0 : L.t0 });
    const cur = out[out.length - 1];
    if (i < ws.length - 1 && (/[.:?]$/.test(w) || (/,$/.test(w) && cur.length >= 6 && left(i) >= 4))) out.push([]);
  });
  return out;
}
const CAPS = {};
function amCaptionLines(words, size, maxW) {
  ctx.save(); ctx.font = amFont(size); const sp = ctx.measureText(' ').width; let n = 1, lw = 0, any = false;
  for (const w of words) { const ww = ctx.measureText(w.w).width; if (lw + ww > maxW && any) { n++; lw = 0; } lw += ww + sp; any = true; }
  ctx.restore(); return n;
}
// a soft band of bare parchment behind a caption, so it reads over any picture (screen space)
function amPaperBand(y0, y1, a = 1) {
  const pc = amPaperCanvas(), f = 70, n = 14;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.82 * a; ctx.drawImage(pc, 0, y0, W, y1 - y0, 0, y0, W, y1 - y0);
  for (let i = 0; i < n; i++) { const k = 0.82 * a * (1 - (i + 0.5) / n), h = f / n; ctx.globalAlpha = k; ctx.drawImage(pc, 0, y0 - (i + 1) * h, W, h, 0, y0 - (i + 1) * h, W, h); ctx.drawImage(pc, 0, y1 + i * h, W, h, 0, y1 + i * h, W, h); }
  ctx.restore();
}
function drawCaptions() {
  const id = shotNow();
  if (id === 'sign' || !VL(id)) return;
  const ch = CAPS[id] || (CAPS[id] = capChunks(id)), end = SUBEND(id);
  for (let k = 0; k < ch.length; k++) {
    const t0 = ch[k][0].t - 0.12, t1 = k + 1 < ch.length ? ch[k + 1][0].t - 0.14 : end;
    if (TT < t0 || TT >= t1) continue;
    const a = fadeOut(t1 - 0.16, 0.16), size = 74, lh = size * 1.22;
    const n = amCaptionLines(ch[k], size, 790);
    const y = CAP_POS[id] === 'B' ? 1430 - (n - 1) * lh : 430;
    amOverlay(() => { amPaperBand(y - size * 1.05, y + (n - 1) * lh + size * 0.45, a); amCaption(ch[k], { y, size, maxW: 790, a }); });
  }
}

// ---- the camera, per shot: a slow float and a push
let CAM = { cx: 540, cy: 960, z: 1 };
function setCam(c) { CAM = c; ctx.setTransform(c.z, 0, 0, c.z, W / 2 - c.z * c.cx, H / 2 - c.z * c.cy); }
function floatCam(id, cx, cy, z0, z1, o = {}) {
  const u = EZ.io(shotU(id));
  return { cx: cx + (o.px ?? 0) * u + 9 * Math.sin(TT * 0.37), cy: cy + (o.py ?? 0) * u + 6 * Math.sin(TT * 0.29 + 1), z: lerp(z0, z1, u) };
}
// night: a blue-grey multiply over the picture, a pale moon glow
function alNight(k, mx = 820, my = 520) {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = k;
  ctx.fillStyle = '#5d6c86'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(mx, my, 10, mx, my, 520); g.addColorStop(0, 'rgba(190,200,215,0.35)'); g.addColorStop(1, 'rgba(190,200,215,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function alMoon(x, y, r) { amWash(ellipsePts(x, y, r, r, 0, 30), '#efe6cc', { key: 'moon', w: 1.8, light: false }); amWash(ellipsePts(x + r * 0.45, y - r * 0.15, r * 0.85, r * 0.85, 0, 30), '#56647c', { key: 'moonc', line: false, a: 0.85, light: false }); }

// =====================================================================
//  people
// =====================================================================
// curls: little "c" and "e" hooks of ink packed into an ellipse (the reference's hair)
function alCurls(cx, cy, rx, ry, n, key, s = 1, inside = null) {
  const R = RNG('curls', key);
  for (let i = 0; i < n; i++) {
    const a = R.r(0, TAU), d = Math.sqrt(R.f()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
    const r = R.r(4.5, 7.5) * s, a0 = R.r(0, TAU), sweep = R.r(3.6, 5.2);
    if (inside && !inside(x, y)) continue;
    const P = [];
    for (let k = 0; k <= 9; k++) { const u = k / 9, aa = a0 + u * sweep, rr = r * (1 - 0.35 * u); P.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr * 0.9]); }
    amPen(P, { w: 1.7 * Math.max(0.7, s), key: key + 'c' + i, a: 0.88, amt: 0.4 });
  }
}
// a front face: lidded eyes, brows, ears, a nose with a nostril, lips, cheek hatching
function alFace(hx, hy, hr, s, k, o = {}) {
  const ex = 0.36 * hr, ey = hy - 0.02 * hr, look = (o.look ?? 0) + 0.6 * Math.sin(TT * 0.5 + hx * 0.01);
  const blink = mod(TT + hx * 0.003, 4.3) < 0.12 ? 0.15 : 1;
  for (const d of [-1, 1]) {
    amWash([[hx + d * hr * 0.84, hy - hr * 0.12], [hx + d * hr * 1.0, hy - hr * 0.2], [hx + d * hr * 1.03, hy + hr * 0.12], [hx + d * hr * 0.86, hy + hr * 0.2]], AM.skin, { key: k + 'ear' + d, w: 1.8, light: false });
    const X = hx + d * ex;
    amWash([[X - 0.17 * hr, ey], [X - 0.05 * hr, ey - 0.07 * hr * blink], [X + 0.1 * hr, ey - 0.06 * hr * blink], [X + 0.17 * hr, ey + 0.01 * hr], [X + 0.04 * hr, ey + 0.05 * hr * blink], [X - 0.1 * hr, ey + 0.04 * hr * blink]], '#efe4cc', { key: k + 'eyew' + d, w: 1.4, light: false });
    if (blink > 0.5) { amDot(X + look * 0.03 * hr, ey, 0.055 * hr, '#4a3524'); amDot(X + look * 0.03 * hr, ey, 0.028 * hr, AM.ink); }
    amPen([[X - 0.19 * hr, ey + 0.005 * hr], [X - 0.05 * hr, ey - 0.085 * hr * blink], [X + 0.12 * hr, ey - 0.07 * hr * blink], [X + 0.2 * hr, ey]], { w: 2.4, key: k + 'lid' + d });
    amPen([[X - 0.15 * hr, ey - 0.14 * hr], [X + 0.03 * hr, ey - 0.13 * hr], [X + 0.14 * hr, ey - 0.1 * hr]], { w: 1.3, a: 0.5, key: k + 'crease' + d });
    const by = ey - 0.22 * hr;
    for (let i = 0; i < 7; i++) { const u = i / 6, bx = X + d * lerp(-0.22, 0.2, u) * hr, byy = by - Math.sin(u * Math.PI) * 0.05 * hr + (o.frown ? (1 - u) * 0.06 * hr : 0); amPen([[bx, byy + 0.03 * hr], [bx + d * 0.05 * hr, byy - 0.02 * hr]], { w: 1.8, key: k + 'brow' + d + i, a: 0.85 }); }
    ctx.save(); ctx.beginPath(); ctx.ellipse(hx, hy, hr * 0.86, hr, 0, 0, TAU); ctx.clip();
    const x0 = d > 0 ? hx + hr * 0.45 : hx - hr * 0.9;
    hatch({ x0, y0: hy + 0.05 * hr, x1: x0 + hr * 0.45, y1: hy + 0.6 * hr }, { key: k + 'chk' + d, a: d > 0 ? 1.2 : 1.9, gap: 5, c: AM.ink2, w: 1, al: 0.28, dash: [8, 24], skip: [4, 12], jit: 0.6 });
    ctx.restore();
  }
  amPen([[hx + 0.04 * hr, ey - 0.08 * hr], [hx + 0.02 * hr, ey + 0.2 * hr], [hx - 0.05 * hr, ey + 0.36 * hr], [hx - 0.01 * hr, ey + 0.43 * hr], [hx + 0.1 * hr, ey + 0.41 * hr]], { w: 2, key: k + 'nose' });
  amPen([[hx - 0.12 * hr, ey + 0.4 * hr], [hx - 0.07 * hr, ey + 0.43 * hr]], { w: 1.5, key: k + 'nost', a: 0.8 });
  const my = hy + 0.6 * hr, sm = o.smile ?? 0;
  amPen([[hx - 0.2 * hr, my - sm * 0.04 * hr], [hx - 0.07 * hr, my + 0.02 * hr], [hx + 0.07 * hr, my + 0.02 * hr], [hx + 0.2 * hr, my - sm * 0.04 * hr]], { w: 2, key: k + 'mouth' });
  amPen([[hx - 0.1 * hr, my - 0.08 * hr], [hx, my - 0.06 * hr], [hx + 0.1 * hr, my - 0.08 * hr]], { w: 1.2, a: 0.5, key: k + 'lip' });
  amPen([[hx - 0.08 * hr, my + 0.13 * hr], [hx + 0.08 * hr, my + 0.13 * hr]], { w: 1.3, a: 0.6, key: k + 'chin' });
  if (o.age) {
    for (const d of [-1, 1]) { amPen([[hx + d * 0.32 * hr, ey + 0.3 * hr], [hx + d * 0.25 * hr, my - 0.02 * hr]], { w: 1.3, a: 0.6, key: k + 'age' + d }); amPen([[hx + d * 0.5 * hr, ey + 0.02 * hr], [hx + d * 0.58 * hr, ey + 0.06 * hr]], { w: 1.1, a: 0.6, key: k + 'crow' + d }); }
    for (let i = 0; i < 3; i++) amPen([[hx - 0.25 * hr, hy - (0.42 + i * 0.07) * hr], [hx + 0.25 * hr, hy - (0.43 + i * 0.07) * hr]], { w: 1.1, a: 0.45, key: k + 'fh' + i });
  }
}
// a hand-drawn bust: o = { x, y (chin), s, view: 'front'|'back', robe, hair: 'curly'|'bald'|'helmet'|'tiara'|'dark', beard, strap, age, trim }
function alPerson(o) {
  const s = o.s ?? 1, x = o.x, y = o.y, k = o.key ?? 'p' + (x | 0);
  const P = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s]);
  const breathe = 1 + 0.006 * Math.sin(TT * 1.6 + x * 0.01);
  const robe = P([[-34, 18], [-80, 34], [-128, 58], [-162, 92], [-184, 140], [-196, 210], [-202, 330], [-212, 520], [-222, 760], [-236, 1100], [236, 1100], [222, 760], [212, 520], [202, 330], [196, 210], [184, 140], [162, 92], [128, 58], [80, 34], [34, 18]].map(([a, b]) => [a * breathe, b]));
  amWash(robe, o.robe ?? AM.cloth, { key: k + 'robe', a: o.robeA ?? 0.85, hatch: [{ a: 1.57, gap: 6, al: 0.42, dash: [60, 320], w: 1.1 }, { a: 1.5, gap: 15, al: 0.3, dash: [40, 160], w: 1.2 }, { a: 1.62, gap: 24, al: 0.25, dash: [20, 90], w: 1 }] });
  if (o.trim) amWash(P([[-230, 960], [230, 960], [234, 1020], [-234, 1020]]), o.trim, { key: k + 'trim', w: 1.8 });
  for (let i = 0; i < 9; i++) { const fx = -175 + i * 44, R = RNG('fold', k, i); amPen(P([[fx * 0.5, 80 + R.r(0, 70)], [fx * 0.78 + R.r(-8, 8), 380], [fx * 0.94 + R.r(-10, 10), 720], [fx * 1.04, 1100]]), { w: 1.5, a: 0.6, key: k + 'fold' + i }); }
  amPen(P([[-182, 150], [-90, 230], [20, 300], [130, 330], [205, 300]]), { w: 2, a: 0.8, key: k + 'drape' });
  amPen(P([[-196, 260], [-80, 380], [60, 450], [210, 440]]), { w: 1.6, a: 0.6, key: k + 'drape2' });
  for (let i = 0; i < 4; i++) amPen(P([[-150 + i * 30, 160 + i * 18], [-110 + i * 35, 250 + i * 24]]), { w: 1.2, a: 0.5, key: k + 'dfold' + i });
  if (o.view !== 'back') amPen(P([[-60, 26], [-20, 70], [20, 74], [60, 30]]), { w: 1.8, a: 0.8, key: k + 'collar' });
  if (o.strap) {
    amWash(P([[-150, 500], [120, 90], [150, 105], [-120, 525]]), o.strap, { key: k + 'strap', w: 2 });
    amPen(P([[-140, 506], [128, 98]]), { w: 1, a: 0.4, key: k + 'strapl' });
    amDot(x + 135 * s, y + 98 * s, 15 * s, AM.gold); amPen(ellipsePts(x + 135 * s, y + 98 * s, 15 * s, 15 * s, 0, 16), { closed: true, w: 1.8, key: k + 'pin' }); amDot(x + 135 * s, y + 98 * s, 5 * s, AM.redD);
  }
  const hx = x, hy = y - 100 * s + (o.nod ? 3 * s * Math.sin(TT * 1.1) : 0), hr = 80 * s;
  amWash(P([[-30, -40], [-32, 36], [32, 36], [30, -40]]), AM.skin, { key: k + 'neck', w: 1.8, light: false });
  if (o.view === 'back') { amPen(P([[-22, -20], [-26, 30]]), { w: 1.4, a: 0.6, key: k + 'nk1' }); amPen(P([[22, -20], [26, 30]]), { w: 1.4, a: 0.6, key: k + 'nk2' }); }
  amWash(ellipsePts(hx, hy, hr * 0.86, hr, 0, 40), AM.skin, { key: k + 'head', w: 2 });
  if (o.view !== 'back') alFace(hx, hy, hr, s, k, o);
  else for (const d of [-1, 1]) amWash([[hx + d * hr * 0.8, hy - hr * 0.05], [hx + d * hr * 0.98, hy - hr * 0.12], [hx + d * hr * 1.0, hy + hr * 0.18], [hx + d * hr * 0.82, hy + hr * 0.22]], AM.skin, { key: k + 'bear' + d, w: 1.8, light: false });
  if (o.beard) {
    const bd = [[-0.84, -0.05], [-0.8, 0.4], [-0.6, 0.85], [-0.3, 1.12], [0, 1.2], [0.3, 1.12], [0.6, 0.85], [0.8, 0.4], [0.84, -0.05], [0.6, 0.25], [0.3, 0.42], [0.25, 0.52], [-0.25, 0.52], [-0.3, 0.42], [-0.6, 0.25]].map(([a, b]) => [hx + a * hr, hy + b * hr]);
    amWash(bd, o.beard, { key: k + 'beard', a: 0.75, w: 1.6, hatch: [{ a: 1.35, gap: 5, al: 0.55, dash: [6, 18], w: 1.1 }, { a: 1.8, gap: 7, al: 0.4, dash: [5, 14], w: 1 }] });
    amWash([[hx - 0.28 * hr, hy + 0.5 * hr], [hx - 0.1 * hr, hy + 0.44 * hr], [hx + 0.1 * hr, hy + 0.44 * hr], [hx + 0.28 * hr, hy + 0.5 * hr], [hx, hy + 0.55 * hr]], o.beard, { key: k + 'moust', a: 0.8, w: 1.4 });
    amPen([[hx - 0.14 * hr, hy + 0.62 * hr], [hx, hy + 0.65 * hr], [hx + 0.14 * hr, hy + 0.62 * hr]], { w: 1.8, key: k + 'bm' });
  }
  if (o.hair === 'curly') {
    if (o.view === 'back') alCurls(hx, hy - 0.05 * hr, hr * 0.95, hr * 1.02, 150, k + 'hb', s);
    else alCurls(hx, hy - 0.62 * hr, hr * 0.98, hr * 0.5, 95, k + 'hf', s, (px, py) => py < hy - 0.32 * hr || Math.abs(px - hx) > hr * 0.78);
  } else if (o.hair === 'bald') {
    for (const d of [-1, 1]) alCurls(hx + d * hr * 0.78, hy - 0.15 * hr, hr * 0.16, hr * 0.32, 14, k + 'side' + d, s * 0.9);
    amPen(arcPts(hx - hr * 0.3, hy - hr * 0.62, hr * 0.25, Math.PI * 1.2, Math.PI * 1.7, 8), { w: 1.3, a: 0.5, key: k + 'shine' });
  } else if (o.hair === 'helmet') {
    alCurls(hx, hy - 0.4 * hr, hr * 0.9, hr * 0.22, 30, k + 'hh', s * 0.9);
    const hm = [...arcPts(hx, hy - 0.42 * hr, hr * 1.02, Math.PI * 1.0, Math.PI * 2.0, 22, 1.05), [hx + hr * 1.0, hy - 0.3 * hr], [hx + hr * 0.75, hy - 0.5 * hr], [hx + 0.22 * hr, hy - 0.56 * hr], [hx, hy - 0.48 * hr], [hx - 0.22 * hr, hy - 0.56 * hr], [hx - hr * 0.75, hy - 0.5 * hr], [hx - hr * 1.0, hy - 0.3 * hr]];
    amWash(hm, AM.gold, { key: k + 'helm', w: 2.2, hatch: [{ a: 0.5, gap: 7, al: 0.32, dash: [14, 50] }] });
    for (const d of [-1, 1]) amWash([[hx + d * 0.14 * hr, hy - 0.86 * hr], [hx + d * 0.42 * hr, hy - 0.95 * hr], [hx + d * 0.68 * hr, hy - 0.8 * hr], [hx + d * 0.36 * hr, hy - 0.74 * hr]], '#3a2a1a', { key: k + 'hole' + d, w: 1.8, light: false });
    amSeg(hx, hy - 1.02 * hr, hx, hy - 0.52 * hr, { w: 2.4, key: k + 'nasal' });
    amPen(arcPts(hx, hy - 0.42 * hr, hr * 0.9, Math.PI * 1.15, Math.PI * 1.85, 14, 1.05), { w: 1.4, a: 0.6, key: k + 'hrim' });
    for (let i = 0; i < 18; i++) { const an = Math.PI * (1.05 + i * 0.9 / 17); amDot(hx + Math.cos(an) * hr * 0.96, hy - 0.42 * hr + Math.sin(an) * hr * 1.0, 2.2 * s, AM.goldD, 0.8); }
  } else if (o.hair === 'tiara') {
    alCurls(hx, hy - 0.42 * hr, hr * 0.85, hr * 0.18, 24, k + 'th', s * 0.9);
    const tr = [[hx - hr * 0.9, hy - 0.3 * hr], [hx - hr * 0.95, hy - 0.9 * hr], [hx - hr * 0.6, hy - 1.7 * hr], [hx - hr * 0.1, hy - 2.0 * hr], [hx + hr * 0.45, hy - 1.85 * hr], [hx + hr * 0.95, hy - 0.9 * hr], [hx + hr * 0.9, hy - 0.3 * hr], [hx + hr * 0.6, hy - 0.5 * hr], [hx - hr * 0.6, hy - 0.5 * hr]];
    amWash(tr, AM.purple, { key: k + 'tia', w: 2.2, hatch: { a: 1.4, gap: 8, al: 0.35, dash: [20, 60] } });
    for (let i = 0; i < 3; i++) amPen([[hx - hr * (0.92 - i * 0.05), hy - (0.65 + i * 0.35) * hr], [hx + hr * (0.92 - i * 0.05), hy - (0.65 + i * 0.35) * hr]], { w: 3.2, c: AM.gold, key: k + 'tb' + i });
    for (const d of [-1, 1]) amWash([[hx + d * hr * 0.82, hy - 0.4 * hr], [hx + d * hr * 1.02, hy - 0.4 * hr], [hx + d * hr * 1.05, hy + 0.5 * hr], [hx + d * hr * 0.88, hy + 0.55 * hr]], AM.purple, { key: k + 'flap' + d, w: 1.8 });
  }
  return { head: [hx, hy], hr };
}
// a hand: palm, four fingers and a thumb, along angle an
function alHand(x, y, an, s = 1, c = AM.skin, k = 'hand', o = {}) {
  const rot = ([a, b]) => [x + (a * Math.cos(an) - b * Math.sin(an)) * s, y + (a * Math.sin(an) + b * Math.cos(an)) * s];
  const curl = o.curl ?? 0;
  amWash([[-14, -24], [34, -26], [40, 24], [-14, 24]].map(rot), c, { key: k + 'palm', w: 1.8, light: false });
  for (let i = 0; i < 4; i++) { const v = -20 + i * 13, L = (i === 0 || i === 3 ? 34 : 42) * (1 - curl * 0.6);
    amWash([[34, v - 5.5], [34 + L, v - 4.5], [34 + L + 5, v], [34 + L, v + 4.5], [34, v + 5.5]].map(rot), c, { key: k + 'f' + i, w: 1.5, light: false }); }
  amWash([[10, -24], [26, -40], [44, -46], [48, -40], [30, -26]].map(rot), c, { key: k + 'th', w: 1.5, light: false });
}
function alHandPoint(x, y, an, s, k) {
  const rot = ([a, b]) => [x + (a * Math.cos(an) - b * Math.sin(an)) * s, y + (a * Math.sin(an) + b * Math.cos(an)) * s];
  amWash([[-10, -26], [36, -24], [40, 26], [-10, 26]].map(rot), AM.skin, { key: k + 'pm', w: 1.8, light: false });
  amWash([[34, -24], [96, -22], [100, -14], [96, -8], [34, -10]].map(rot), AM.skin, { key: k + 'ix', w: 1.6, light: false });
  for (let i = 0; i < 3; i++) amPen([[34, -2 + i * 9], [48, -2 + i * 9], [50, 4 + i * 9], [36, 6 + i * 9]].map(rot), { w: 1.6, key: k + 'kn' + i });
  amWash([[6, -26], [24, -40], [40, -38], [30, -24]].map(rot), AM.skin, { key: k + 'tb', w: 1.4, light: false });
}
function alTemple(x, y, w, h, o = {}) {
  const n = o.cols ?? 8;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  amWash([[x - w / 2 - 12, y], [x + w / 2 + 12, y], [x + w / 2 + 12, y - 8], [x - w / 2 - 12, y - 8]], AM.paperL, { key: 'tst' + x, w: 1.8 });
  amWash([[x - w / 2 - 6, y - 8], [x + w / 2 + 6, y - 8], [x + w / 2 + 6, y - 16], [x - w / 2 - 6, y - 16]], AM.paperL, { key: 'tst2' + x, w: 1.8 });
  for (let i = 0; i < n; i++) { const cx = x - w / 2 + 8 + i * (w - 16) / (n - 1); amSeg(cx - 5, y - 16, cx - 5, y - h, { w: 1.8, key: 'tc' + i + x }); amSeg(cx + 5, y - 16, cx + 5, y - h, { w: 1.8, key: 'td' + i + x }); amSeg(cx, y - 20, cx, y - h + 6, { w: 1, a: 0.4, key: 'tf' + i + x }); }
  amWash([[x - w / 2 - 6, y - h], [x + w / 2 + 6, y - h], [x + w / 2 + 6, y - h - 12], [x - w / 2 - 6, y - h - 12]], AM.paperL, { key: 'tar' + x, w: 1.8, hatch: { a: 0, gap: 4, al: 0.3 } });
  amWash([[x - w / 2 - 10, y - h - 12], [x + w / 2 + 10, y - h - 12], [x, y - h - 12 - h * 0.28]], AM.paperL, { key: 'tpe' + x, w: 1.8 });
  ctx.restore();
}
function alBirds(x, y, n, key, sc = 1) {
  for (let i = 0; i < n; i++) {
    const R = RNG('bird', key, i), bx = x + R.r(-140, 140) + TT * R.r(14, 24), by = y + R.r(-40, 40) + 6 * Math.sin(TT * 2 + i), f = Math.sin(TT * R.r(7, 9) + i) * 7;
    amPen([[bx - 13 * sc, by - f * sc * 0.5], [bx - 4 * sc, by - 2], [bx, by + 2], [bx + 4 * sc, by - 2], [bx + 13 * sc, by - f * sc * 0.5]], { w: 1.7, key: 'bd' + key + i, a: 0.8 });
  }
}
function alHill(y, amp, key, o = {}) {
  const P = []; for (let i = 0; i <= 50; i++) { const x = -260 + i * 1600 / 50; P.push([x, y - amp * Math.sin(Math.PI * clamp((x + 50) / 1180)) * (0.88 + 0.12 * Math.sin(i * 0.9))]); }
  amWash([...P, [1340, 2200], [-260, 2200]], o.c ?? AM.land, { key: key + 'f', line: false, a: o.a ?? 0.4, hatch: [{ a: 1.75, gap: 12, al: 0.3, dash: [20, 70] }, { a: 1.6, gap: 30, al: 0.2, dash: [10, 40] }] });
  amPen(P, { w: 2.2, key });
  for (let i = 0; i < 26; i++) { const R = RNG('grass', key, i), gx = R.r(-100, 1180), gy = y + R.r(20, 360); amPen([[gx - 6, gy], [gx - 2, gy - 12], [gx + 2, gy], [gx + 6, gy - 10]], { w: 1.2, a: 0.45, key: key + 'g' + i }); }
}
// a crowd facing the speaker's platform: rows of heads, receding; arms rise with raise(id, x) 0..1
function alCrowd(key, rows, yTop, yBot, raise = () => 0) {
  const cols = [AM.cloth, '#cdbf9f', AM.brownL, '#9a8a9a', '#a7b4bf', '#c9b48b'];
  for (let r = 0; r < rows; r++) {
    const v = r / (rows - 1), y = lerp(yTop, yBot, Math.pow(v, 1.2)), s = lerp(0.36, 0.95, v), n = Math.round(lerp(15, 7, v));
    for (let i = 0; i < n; i++) {
      const R = RNG('crowd', key, r, i), x = (i + 0.5 + R.r(-0.25, 0.25) + (r % 2) * 0.5) * (1180 / n) - 50, hr = 30 * s, id = r * 40 + i;
      const bob = 2 * s * Math.sin(TT * R.r(1.5, 3) + i), dark = R.f() < 0.45, beard = R.f() < 0.4;
      amWash([[x - 70 * s, y + 160 * s], [x - 64 * s, y + 46 * s], [x - 30 * s, y + 26 * s], [x + 30 * s, y + 26 * s], [x + 64 * s, y + 46 * s], [x + 70 * s, y + 160 * s]], cols[(i + r * 3) % cols.length], { key: key + 'b' + id, w: 1.6, a: 0.8, hatch: { a: 1.57, gap: 7, al: 0.35, dash: [10, 40], w: 1 } });
      amWash(ellipsePts(x, y + bob, hr * 0.85, hr, 0, 20), AM.skin, { key: key + 'h' + id, w: 1.6, light: false });
      if (!dark) alCurls(x, y - hr * 0.55 + bob, hr * 0.85, hr * 0.42, Math.round(14 * s + 6), key + 'hc' + id, s * 0.7);
      else amWash([...arcPts(x, y - hr * 0.15 + bob, hr * 0.9, Math.PI, TAU, 10), [x + hr * 0.7, y - hr * 0.4 + bob], [x - hr * 0.7, y - hr * 0.4 + bob]], R.f() < 0.5 ? '#5a4330' : '#8c8a84', { key: key + 'hd' + id, w: 1.4 });
      amDot(x - hr * 0.3, y + bob, 2.4 * s + 0.6, AM.ink); amDot(x + hr * 0.3, y + bob, 2.4 * s + 0.6, AM.ink);
      amPen([[x - hr * 0.2, y + hr * 0.5 + bob], [x + hr * 0.2, y + hr * 0.5 + bob]], { w: 1.2, key: key + 'm' + id, a: 0.7 });
      if (beard) amWash([[x - hr * 0.6, y + hr * 0.3 + bob], [x + hr * 0.6, y + hr * 0.3 + bob], [x, y + hr * 1.1 + bob]], '#7a6a5a', { key: key + 'bd' + id, w: 1.2, a: 0.7 });
      const up = clamp(raise(id, x, y) * R.r(0.8, 1.25));
      if (up > 0.02) { const ax = x + (R.f() < 0.5 ? -1 : 1) * 46 * s, wave = 6 * s * Math.sin(TT * 7 + i); amPen([[ax, y + 60 * s], [ax + wave * 0.3, y + lerp(40, -60, up) * s], [ax + wave, y + lerp(30, -110, up) * s]], { w: 3 * s + 1, key: key + 'a' + id, c: '#5a4330' }); alHand(ax + wave, y + lerp(30, -110, up) * s, -Math.PI / 2, 0.42 * s, AM.skin, key + 'hn' + id); }
    }
  }
}

// =====================================================================
//  ships, statues, soldiers, houses, fire
// =====================================================================
function alShip(x, y, s, o = {}) {
  const k = o.key ?? 'ship' + (x | 0), roll = 0.02 * Math.sin(TT * 1.3 + x * 0.01), heave = 6 * s * Math.sin(TT * 1.1 + x * 0.02);
  ctx.save(); ctx.translate(x, y + heave); ctx.rotate(roll); ctx.scale(s, s);
  const sweep = Math.sin(TT * 3.2 + (o.ph ?? 0));
  for (let i = 0; i < 16; i++) { const ox = -300 + i * 36, a = 0.9 + sweep * 0.35; amSeg(ox, 10, ox - Math.cos(a) * 150, 10 + Math.sin(a) * 130, { w: 2.2, key: k + 'oar' + i }); }
  const hull = [[-420, -40], [-380, -10], [-300, 20], [300, 22], [380, 0], [470, 18], [480, 6], [400, -30], [380, -70], [-330, -60], [-400, -110], [-430, -150], [-410, -80]];
  amWash(hull, '#4a3626', { key: k + 'hull', w: 2.4, hatch: [{ a: 0, gap: 7, al: 0.35, c: '#1e140c' }] });
  amPen([[-330, -40], [380, -45]], { w: 1.6, c: '#cdb48a', a: 0.6, key: k + 'wale' });
  for (let i = 0; i < 18; i++) amDot(-300 + i * 36, -18, 5, '#1e140c');
  amWash(ellipsePts(345, -32, 16, 10, 0, 14), '#efe4cc', { key: k + 'eye', w: 1.6 }); amDot(349, -32, 5, AM.ink);
  for (let i = 0; i < 10; i++) { const hx = -250 + i * 56, bob = 3 * Math.sin(TT * 3.2 + (o.ph ?? 0) + i * 0.3); amWash(ellipsePts(hx, -82 + bob, 12, 14, 0, 12), AM.skin, { key: k + 'rw' + i, w: 1.4, light: false }); alCurls(hx, -90 + bob, 11, 6, 6, k + 'rwc' + i, 0.55); }
  amSeg(20, -60, 20, -520, { w: 4, key: k + 'mast' }); amSeg(-180, -500, 220, -500, { w: 3.4, key: k + 'yard' });
  const bil = 26 + 8 * Math.sin(TT * 1.7 + x * 0.01), sail = [[-176, -496], [216, -496], [222 + bil * 0.4, -330], [210, -160], [-170, -160], [-182 + bil * 0.4, -330]];
  amWash(sail, o.sail ?? AM.blue, { key: k + 'sail', w: 2.2, hatch: [{ a: 1.57, gap: 11, al: 0.22 }, { a: 0, gap: 60, al: 0.25, w: 1.6 }] });
  if (o.owl !== false) amShield(20, -330, 90, o.emblem ?? 'owl', { a: 0.95 });
  for (const d of [-1, 1]) amPen([[20, -520], [d * 400, -60]], { w: 1.2, a: 0.6, key: k + 'rig' + d });
  amPen([[-400, -110], [-460, -190], [-440, -200]], { w: 3, key: k + 'aplus' });
  if (o.garland) for (let i = 0; i < 12; i++) amWash(ellipsePts(-300 + i * 58, -56 + 8 * Math.sin(i * 1.1), 10, 6, 0.4, 10), i % 3 ? '#7d8a4a' : AM.redL, { key: k + 'gar' + i, w: 1.2 });
  ctx.restore();
}
function alShipMini(x, y, s, key, c) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  amWash([[-420, -40], [-300, 20], [300, 22], [470, 18], [400, -30], [-330, -60], [-430, -150]], '#4a3626', { key: key + 'mh', w: 12, light: false });
  amSeg(20, -60, 20, -420, { w: 14, key: key + 'mm' });
  amWash([[-170, -400], [210, -400], [230, -250], [210, -120], [-170, -120], [-150, -250]], c, { key: key + 'ms', w: 12, light: false });
  ctx.restore();
}
function alSea(y0, y1, key, o = {}) {
  amWash([[-260, y0], [1340, y0], [1340, y1], [-260, y1]], o.c ?? AM.sea, { key: key + 'sea', line: false, a: o.a ?? 0.7, hatch: [{ a: 0, gap: 14, al: 0.22, dash: [30, 120] }] });
  amPen([[-260, y0], [1340, y0]], { w: 2, key: key + 'hz' });
  alWaves(-260, y0 + 14, 1340, y1, key, 150);
}
// wave lines, as in the reference: short horizontal ink squiggles in loose rows, drifting and rippling
function alWaves(x0, y0, x1, y1, key, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const R = RNG('wv', key, i), v = R.f(), y = lerp(y0, y1, o.flat ? v : v * v), sc = o.flat ? 1 : lerp(0.6, 1.4, v), l = R.r(34, 90) * sc;
    const x = x0 + mod(R.r(0, x1 - x0) - TT * R.r(6, 16) * (o.drift ?? 1), x1 - x0), ph = R.r(0, TAU), amp = R.r(2, 4.5) * sc, P = [];
    for (let k = 0; k <= 10; k++) { const u = k / 10; P.push([x - l / 2 + u * l, y + Math.sin(u * TAU * R.r(1.5, 2.5) + ph + TT * 2.2) * amp]); }
    amPen(P, { w: (o.w ?? 2.2) * sc, c: o.c ?? AM.ink2, a: o.a ?? 0.85, key: 'wl' + key + i, amt: 0.3 });
  }
}
function alHerm(x, y, s, broken = 0, k = 'herm') {
  amShadow(x + 20 * s, y + 4, 90 * s, 16 * s, 0.35);
  amWash([[x - 46 * s, y], [x + 46 * s, y], [x + 40 * s, y - 330 * s], [x - 40 * s, y - 330 * s]], '#d9cba9', { key: k + 'p', w: 2, hatch: [{ a: 1.57, gap: 9, al: 0.25 }, { a: 1.57, gap: 4, al: 0.4, dens: (px) => (px > x + 10 * s ? 1 : 0) }] });
  amWash([[x - 60 * s, y], [x + 60 * s, y], [x + 60 * s, y + 18 * s], [x - 60 * s, y + 18 * s]], '#cbbb98', { key: k + 'base', w: 1.8 });
  for (const d of [-1, 1]) amWash([[x + d * 40 * s, y - 250 * s], [x + d * 62 * s, y - 246 * s], [x + d * 62 * s, y - 228 * s], [x + d * 40 * s, y - 232 * s]], '#d9cba9', { key: k + 'arm' + d, w: 1.6 });
  const fall = EZ.i2(broken), hx = x + fall * 120 * s, hy = y - 400 * s + fall * 420 * s, rot = fall * 2.2;
  if (broken > 0) {
    for (let i = 0; i < 5; i++) { const R = RNG('crk', k, i); amPen([[x + R.r(-30, 30) * s, y - 330 * s], [x + R.r(-35, 35) * s, y - 300 * s], [x + R.r(-35, 35) * s, y - 270 * s]], { w: 1.6, key: k + 'crk' + i }); }
    for (let i = 0; i < 9; i++) { const R = RNG('chip', k, i), u = clamp(broken * 1.4), cx = x + R.r(-1, 1) * 160 * s * u, cy = y - 340 * s + (R.r(-140, 40) * u + 700 * u * u) * s; if (cy < y) amWash(ellipsePts(cx, cy, 8 * s, 6 * s, R.r(0, 3), 6), '#d9cba9', { key: k + 'ch' + i, w: 1.2, light: false }); }
  }
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot);
  amWash([[-22 * s, 50 * s], [22 * s, 50 * s], [22 * s, 75 * s], [-22 * s, 75 * s]], '#d9cba9', { key: k + 'nk', w: 1.6 });
  amWash(ellipsePts(0, 0, 50 * s, 60 * s, 0, 24), '#ddd0b0', { key: k + 'hd', w: 2 });
  amWash([[-48 * s, 0], [-40 * s, 50 * s], [0, 82 * s], [40 * s, 50 * s], [48 * s, 0], [20 * s, 26 * s], [-20 * s, 26 * s]], '#c9b993', { key: k + 'bd', w: 1.6, hatch: { a: 1.57, gap: 5, al: 0.5, dash: [6, 16] } });
  alCurls(0, -36 * s, 46 * s, 22 * s, 24, k + 'hc', s * 0.9);
  for (const d of [-1, 1]) { amPen([[d * 26 * s - 9 * s, -4 * s], [d * 26 * s + 9 * s, -4 * s]], { w: 2, key: k + 'e' + d }); amDot(d * 26 * s, -1 * s, 3 * s, AM.ink); }
  amPen([[0, -2 * s], [-5 * s, 18 * s], [4 * s, 20 * s]], { w: 1.8, key: k + 'n' });
  ctx.restore();
}
function alHoplite(x, y, s, k) {
  const sway = 3 * s * Math.sin(TT * 1.2 + x * 0.02);
  amShadow(x + 20 * s, y + 520 * s, 160 * s, 26 * s, 0.3);
  amSeg(x + 110 * s + sway, y - 330 * s, x + 120 * s + sway, y + 560 * s, { w: 3.2 * s + 0.6, key: k + 'spear' });
  amWash([[x + 104 * s + sway, y - 330 * s], [x + 116 * s + sway, y - 330 * s], [x + 110 * s + sway, y - 400 * s]], '#a89b88', { key: k + 'tip', w: 1.6 });
  amWash([[x - 120 * s, y + 20 * s], [x + 120 * s, y + 20 * s], [x + 150 * s, y + 560 * s], [x - 150 * s, y + 560 * s]], AM.red, { key: k + 'cloak', w: 2, hatch: [{ a: 1.57, gap: 8, al: 0.35, c: AM.redD }] });
  for (let i = 0; i < 5; i++) amPen([[x - 90 * s + i * 45 * s, y + 40 * s], [x - 110 * s + i * 55 * s, y + 550 * s]], { w: 1.4, a: 0.6, key: k + 'cf' + i });
  amWash(ellipsePts(x, y - 70 * s, 64 * s, 76 * s, 0, 24), AM.gold, { key: k + 'helm', w: 2, hatch: { a: 0.6, gap: 7, al: 0.3 } });
  amWash([[x - 40 * s, y - 70 * s], [x - 10 * s, y - 80 * s], [x - 10 * s, y - 20 * s], [x + 10 * s, y - 20 * s], [x + 10 * s, y - 80 * s], [x + 40 * s, y - 70 * s], [x + 40 * s, y - 30 * s], [x - 40 * s, y - 30 * s]], '#2a1c11', { key: k + 'slot', w: 1.4, light: false, a: 0.85 });
  amWash([[x - 90 * s, y - 120 * s], [x - 60 * s, y - 175 * s], [x, y - 195 * s], [x + 60 * s, y - 175 * s], [x + 90 * s, y - 120 * s], [x + 60 * s, y - 140 * s], [x, y - 150 * s], [x - 60 * s, y - 140 * s]], AM.redD, { key: k + 'crest', w: 1.8, hatch: { a: 1.3, gap: 5, al: 0.5 } });
  amShield(x - 30 * s, y + 250 * s, 175 * s, 'lambda');
}
function alHouse(x, y, s, lit = 0, k = 'house') {
  amWash([[x - 230 * s, y], [x + 230 * s, y], [x + 230 * s, y - 260 * s], [x - 230 * s, y - 260 * s]], '#c6ad80', { key: k + 'w', w: 2.2, hatch: [{ a: 0, gap: 22, al: 0.25 }, { a: 1.57, gap: 40, al: 0.2, dash: [10, 20] }] });
  amWash([[x - 270 * s, y - 250 * s], [x + 270 * s, y - 250 * s], [x + 180 * s, y - 380 * s], [x - 180 * s, y - 380 * s]], '#9c5a3a', { key: k + 'r', w: 2.2, hatch: [{ a: 1.57, gap: 16, al: 0.4 }, { a: 0, gap: 22, al: 0.3 }] });
  const glow = (P, kk) => { amWash(P, lit > 0 ? AM.fire : '#2e231a', { key: k + kk, w: 2, light: false }); if (lit > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = lit * (0.6 + 0.4 * Math.sin(TT * 17)); amWash(P, AM.fireL, { key: k + kk + 'g', line: false, light: false }); ctx.restore(); } };
  glow([[x - 50 * s, y], [x + 50 * s, y], [x + 50 * s, y - 170 * s], [x - 50 * s, y - 170 * s]], 'door');
  glow([[x + 110 * s, y - 120 * s], [x + 180 * s, y - 120 * s], [x + 180 * s, y - 190 * s], [x + 110 * s, y - 190 * s]], 'win');
}
function alFlames(x, y, w, h, k, key) {
  if (k <= 0) return;
  ctx.save();
  const g = ctx.createRadialGradient(x, y - h * 0.4, 10, x, y - h * 0.4, w * 1.4); g.addColorStop(0, `rgba(255,170,70,${0.45 * k})`); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(x - w * 1.6, y - h * 1.6, w * 3.2, h * 2);
  const n = Math.max(4, Math.round(w / 40));
  for (const [c, sc] of [[AM.redL, 1], [AM.fire, 0.8], [AM.fireL, 0.5]]) for (let i = 0; i < n; i++) {
    const R = RNG('fl', key, i, B), bx = x - w / 2 + (i + 0.5) * w / n, hh = h * k * sc * R.r(0.55, 1.1), ww = w / n * 0.9 * sc, lean = R.r(-0.25, 0.25) * hh;
    amWash([[bx - ww, y], [bx - ww * 0.6, y - hh * 0.4], [bx + lean * 0.5, y - hh * 0.75], [bx + lean, y - hh], [bx + ww * 0.3 + lean * 0.4, y - hh * 0.6], [bx + ww, y]], c, { key: 'flm' + key + i + sc + B, w: 1.4, light: false, a: 0.92 });
  }
  for (let i = 0; i < 16; i++) { const R = RNG('ember', key, i), u = mod(TT * R.r(0.3, 0.6) + R.f(), 1); amDot(x + R.r(-w, w) * 0.6 + Math.sin(TT * 3 + i) * 12, y - u * h * 1.8, 3 * (1 - u), AM.fireL, k * (1 - u)); }
  ctx.restore();
}
function alSmoke(x, y, k, key, n = 6) {
  for (let i = 0; i < n; i++) { const u = mod(TT * 0.12 + i / n, 1), r = lerp(40, 140, u), sx = x + Math.sin(u * 4 + i) * 40 + u * 120; amWash(ellipsePts(sx, y - u * 700, r, r * 0.8, 0, 18), '#4a4038', { key: 'smk' + key + i, line: false, a: k * 0.45 * Math.sin(Math.PI * u), light: false }); }
}

// =====================================================================
//  the map of the Greek world: lon/lat -> map space
// =====================================================================
const MPX = (lon) => (lon - 14) * 120, MPY = (lat) => (41.5 - lat) * 152 + 300;
const MP = (lon, lat) => [MPX(lon), MPY(lat)];
const COAST = {
  sicily: [[12.4, 38.1], [13.3, 38.2], [14.5, 38.05], [15.6, 38.3], [15.1, 37.3], [15.3, 36.9], [15.1, 36.65], [14.3, 36.8], [12.9, 37.6], [12.4, 37.8]],
  italy: [[13.0, 42.5], [14.2, 41.0], [14.9, 40.4], [15.7, 39.9], [15.8, 39.0], [15.65, 38.2], [15.7, 37.95], [16.1, 38.0], [16.55, 38.45], [17.15, 39.0], [17.1, 39.4], [16.5, 39.7], [16.9, 40.4], [17.4, 40.5], [18.0, 40.3], [18.5, 40.1], [18.4, 39.8], [18.55, 40.2], [18.0, 40.65], [17.3, 40.9], [16.0, 41.5], [15.0, 42.5]],
  greece: [[19.3, 42.5], [19.5, 40.9], [19.3, 40.4], [20.0, 39.7], [20.7, 39.0], [21.1, 38.5], [21.6, 38.35], [22.4, 38.35], [22.9, 38.2], [22.95, 37.95], [23.2, 38.0], [23.6, 37.95], [24.0, 37.65], [24.05, 38.1], [23.7, 38.35], [23.0, 38.8], [22.8, 39.0], [23.0, 39.3], [22.6, 40.0], [22.9, 40.6], [23.6, 40.3], [23.9, 40.0], [24.0, 40.8], [25.0, 40.95], [26.0, 40.8], [26.3, 42.5]],
  pelop: [[21.4, 38.2], [21.1, 37.85], [21.6, 37.6], [21.7, 36.8], [22.1, 36.9], [22.4, 36.45], [22.6, 36.85], [23.0, 36.45], [23.2, 36.6], [22.75, 37.5], [23.1, 37.6], [23.3, 37.4], [23.5, 37.6], [23.0, 37.95], [22.4, 38.15], [21.8, 38.3]],
  euboea: [[22.8, 38.95], [23.6, 38.7], [24.6, 38.0], [24.3, 38.0], [23.3, 38.5]],
  asia: [[26.2, 40.1], [26.1, 39.5], [26.8, 39.4], [26.6, 38.8], [26.9, 38.4], [26.3, 38.3], [27.3, 37.9], [27.2, 37.4], [27.6, 36.9], [28.2, 36.7], [29.5, 36.5], [31.5, 36.5], [31.5, 42.5], [26.6, 42.5], [26.4, 41.0], [26.6, 40.4]],
  crete: [[23.5, 35.55], [24.3, 35.35], [25.4, 35.3], [26.3, 35.25], [26.2, 35.0], [24.7, 35.05], [23.6, 35.25]],
  africa: [[9.5, 37.3], [11.1, 37.1], [11.0, 36.4], [10.5, 35.6], [11.2, 34.8], [10.2, 34.0], [9.0, 34.0]],
};
const PLACES = { athens: [23.73, 37.98], sparta: [22.43, 37.07], decelea: [23.85, 38.18], syracuse: [15.29, 37.07], sardis: [28.04, 38.49], thurii: [16.5, 39.7], catana: [15.09, 37.5], cyllene: [21.3, 37.9] };
const PL = (k) => MP(...PLACES[k]);
const ROUGH = {};
function alRough(P, key, lv = 3) {
  if (ROUGH[key]) return ROUGH[key];
  let Q = P; const R = RNG('rough', key);
  for (let l = 0; l < lv; l++) { const N = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], d = dist(a, b), nx = (a[1] - b[1]) / (d || 1), ny = (b[0] - a[0]) / (d || 1), o = R.n(d * 0.16); N.push(a, [(a[0] + b[0]) / 2 + nx * o, (a[1] + b[1]) / 2 + ny * o]); } Q = N; }
  return (ROUGH[key] = Q);
}
const ISLANDS = (() => { const R = RNG('isl'), out = []; for (let i = 0; i < 30; i++) out.push([R.r(24.2, 26.6), R.r(36.4, 38.6), R.r(6, 18), R.r(0, 3)]); return out; })();
function alMap(o = {}) {
  amWash([[-900, -400], [3000, -400], [3000, 2400], [-900, 2400]], AM.sea, { key: 'msea', line: false, a: 0.6, light: false });
  alWaves(-500, 150, 2600, 1700, 'map', 520, { flat: true, a: 0.7, w: 2.1, drift: 0.4 });
  for (const [k, pts] of Object.entries(COAST)) {
    const P = alRough(pts.map(([a, b]) => MP(a, b)), k);
    ctx.save(); ctx.lineJoin = 'round'; trace(P, true); ctx.strokeStyle = AM.seaD; ctx.globalAlpha = 0.16; ctx.lineWidth = 34; ctx.stroke(); ctx.globalAlpha = 0.18; ctx.lineWidth = 14; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.lineJoin = 'round'; trace(P, true); ctx.setLineDash([3, 9]); ctx.strokeStyle = AM.seaD; ctx.globalAlpha = 0.5; ctx.lineWidth = 22; ctx.stroke(); ctx.restore();
    amWash(P, AM.land, { key: 'land' + k, w: 2.2, a: 0.95, hatch: [{ a: 2.2, gap: 22, al: 0.12, dash: [10, 40] }] });
  }
  for (const [lon, lat, r, rot] of ISLANDS) amWash(ellipsePts(MPX(lon), MPY(lat), r, r * 0.7, rot, 12), AM.land, { key: 'is' + lon, w: 1.6 });
  const mtn = (mx, my, sz, kk) => { amPen([[mx - sz, my + sz * 0.4], [mx - sz * 0.25, my - sz * 0.6], [mx + sz * 0.15, my - sz * 0.15], [mx + sz * 0.55, my - sz * 0.7], [mx + sz * 1.2, my + sz * 0.4]], { w: 1.5, a: 0.75, key: kk }); amPen([[mx - sz * 0.25, my - sz * 0.6], [mx + sz * 0.05, my + sz * 0.35]], { w: 1, a: 0.5, key: kk + 's' }); };
  for (let i = 0; i < 40; i++) { const R = RNG('mtn', i), [mx, my] = MP(R.r(20.4, 23.4), R.r(38.5, 41.4)); mtn(mx, my, R.r(10, 18), 'mt' + i); }
  for (let i = 0; i < 14; i++) { const R = RNG('mtp', i), [mx, my] = MP(R.r(21.8, 22.8), R.r(37.0, 38.0)); mtn(mx, my, R.r(9, 14), 'mp' + i); }
  for (let i = 0; i < 18; i++) { const R = RNG('mta', i), [mx, my] = MP(R.r(27.4, 31), R.r(37.2, 41.2)); mtn(mx, my, R.r(12, 20), 'ma' + i); }
  for (let i = 0; i < 10; i++) { const R = RNG('mts', i), [mx, my] = MP(R.r(13.4, 15.1), R.r(37.4, 38.0)); mtn(mx, my, R.r(8, 13), 'ms' + i); }
  amPen([MP(27.0, 38.4), MP(27.6, 38.5), MP(28.04, 38.49), MP(28.6, 38.7), MP(29.4, 38.6)], { w: 1.6, c: AM.seaD, a: 0.7, key: 'hermus' });
  const lab = o.labels ?? 1;
  if (lab > 0) {
    amText('Aegean Sea', ...MP(25.0, 39.1), 40, AM.seaD, { a: lab });
    amText('Ionian Sea', ...MP(18.6, 37.6), 46, AM.seaD, { a: lab });
    amText('Mediterranean', ...MP(20.0, 35.4), 46, AM.seaD, { a: lab * 0.8 });
    amText('SICILY', MPX(14.0), MPY(37.15), 36, AM.ink2, { caps: true, spacing: 4, a: lab });
    amText('ITALY', MPX(16.1), MPY(40.9), 36, AM.ink2, { caps: true, spacing: 4, a: lab });
    amText('ATTICA', MPX(24.35), MPY(38.5), 26, AM.ink2, { caps: true, spacing: 3, a: lab });
    amText('PELOPONNESE', MPX(22.15), MPY(37.62), 24, AM.ink2, { caps: true, spacing: 2, a: lab * 0.8 });
    amText('ASIA', MPX(29.6), MPY(39.8), 36, AM.ink2, { caps: true, spacing: 6, a: lab });
  }
  const [rx, ry] = MP(19.6, 36.4);
  amWash([[rx, ry - 52], [rx + 10, ry], [rx, ry + 52], [rx - 10, ry]], AM.paperL, { key: 'cmp1', w: 1.6 });
  amWash([[rx - 52, ry], [rx, ry - 10], [rx + 52, ry], [rx, ry + 10]], AM.paperL, { key: 'cmp2', w: 1.6 });
  amPen(ellipsePts(rx, ry, 30, 30, 0, 24), { closed: true, w: 1.2, a: 0.6, key: 'cmpr' });
  amText('N', rx, ry - 62, 26, AM.ink, { caps: true });
}
function alCity(k, name, c, a = 1, o = {}) {
  if (a <= 0) return;
  const [x, y] = PL(k);
  ctx.save(); ctx.globalAlpha *= a;
  amDot(x, y, 8, c); amPen(ellipsePts(x, y, 14, 14, 0, 16), { closed: true, w: 1.6, key: 'cty' + k });
  amText(name, x + (o.dx ?? 0), y + (o.dy ?? 44), o.size ?? 36, c, { caps: true, spacing: 3 });
  ctx.restore();
}
function alPawn(x, y, c, s = 1, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.translate(-x, -y);
  amShadow(x + 10 * s, y + 4 * s, 40 * s, 11 * s, 0.4);
  const T = o.tall ?? 1, P = [[-26, 0], [-26, -10], [-12, -18], [-9, -44], [-17, -52], [-9, -58], [-14, -68], [-14, -78], [0, -88], [14, -78], [14, -68], [9, -58], [17, -52], [9, -44], [12, -18], [26, -10], [26, 0]].map(([a, b]) => [x + a * s, y + b * s * T]);
  amWash(P, c, { key: o.key ?? 'pawn' + (x | 0) + (y | 0), w: 2 });
  amPen([[x - 6 * s, y - 70 * s * T], [x - 4 * s, y - 20 * s]], { w: 3 * s, c: 'rgba(255,240,215,0.55)', key: (o.key ?? 'pw') + 'hl' });
  const cy = y - 88 * s * T;
  if (o.crown) amWash([[x - 18 * s, cy + 4 * s], [x - 22 * s, cy - 26 * s], [x - 9 * s, cy - 12 * s], [x, cy - 32 * s], [x + 9 * s, cy - 12 * s], [x + 22 * s, cy - 26 * s], [x + 18 * s, cy + 4 * s]], AM.goldL, { key: (o.key ?? 'pc') + 'cr', w: 1.8 });
  if (o.veil) amWash(ellipsePts(x, cy - 6 * s, 12 * s, 12 * s, 0, 14), AM.goldL, { key: (o.key ?? 'pv') + 'v', w: 1.6 });
  ctx.restore();
}
function alArrow(P, frac, c = AM.red, w = 12, key = 'arr') {
  if (frac <= 0) return;
  const Q = subPath(resample(P, false, 6), EZ.io(frac));
  if (Q.length < 2) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = c; ctx.globalAlpha = 0.9; ctx.lineWidth = w; trace(wobble(Q, false, 1.2, key, 8), false); ctx.stroke();
  ctx.globalAlpha = 0.3; ctx.lineWidth = w * 0.35; ctx.strokeStyle = '#fff2d8'; trace(wobble(Q, false, 1.2, key + 'h', 8).map(([a, b]) => [a - 2, b - 2]), false); ctx.stroke();
  const [x1, y1] = Q[Q.length - 1], [x0, y0] = Q[Math.max(0, Q.length - 4)], an = Math.atan2(y1 - y0, x1 - x0), L = w * 2.6;
  ctx.globalAlpha = 0.95; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(an) * L * 0.6, y1 + Math.sin(an) * L * 0.6);
  ctx.lineTo(x1 + Math.cos(an + 2.5) * L, y1 + Math.sin(an + 2.5) * L); ctx.lineTo(x1 + Math.cos(an - 2.5) * L, y1 + Math.sin(an - 2.5) * L); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function alRoute(P, frac, c, key, boat = true) {
  if (frac <= 0) return;
  const Q = subPath(resample(P, false, 5), EZ.io(clamp(frac)));
  if (Q.length < 2) return;
  ctx.save(); ctx.setLineDash([12, 12]); ctx.lineDashOffset = -TT * 30; ctx.lineCap = 'round'; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.globalAlpha = 0.85; trace(Q, false); ctx.stroke(); ctx.restore();
  if (boat) { const [x, y] = Q[Q.length - 1], [x0] = Q[Math.max(0, Q.length - 3)]; ctx.save(); ctx.translate(x, y - 6); ctx.scale(x < x0 ? -1 : 1, 1); alShipMini(0, 0, 0.11, key, c); ctx.restore(); }
}
function alFort(x, y, s, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(a, a); ctx.translate(-x, -y);
  amWash([[x - 40 * s, y], [x + 40 * s, y], [x + 40 * s, y - 34 * s], [x - 40 * s, y - 34 * s]], AM.redL, { key: 'fortw', w: 2, hatch: { a: 0, gap: 8, al: 0.35 } });
  for (const d of [-1, 1]) amWash([[x + d * 40 * s - 12 * s, y], [x + d * 40 * s + 12 * s, y], [x + d * 40 * s + 12 * s, y - 56 * s], [x + d * 40 * s - 12 * s, y - 56 * s]], AM.red, { key: 'fortt' + d, w: 2 });
  for (let i = 0; i < 5; i++) amSeg(x - 30 * s + i * 15 * s, y - 34 * s, x - 30 * s + i * 15 * s, y - 42 * s, { w: 3, key: 'frc' + i });
  amSeg(x + 40 * s, y - 56 * s, x + 40 * s, y - 90 * s, { w: 2, key: 'ffl' }); amWash([[x + 40 * s, y - 90 * s], [x + 70 * s, y - 82 * s + 4 * Math.sin(TT * 5)], [x + 40 * s, y - 74 * s]], AM.red, { key: 'ffg', w: 1.4 });
  ctx.restore();
}
// parchment laid back over the top of a full-bleed picture so the caption sits on paper (screen space)
function amVeil(y0 = 480, y1 = 660) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const pc = amPaperCanvas(), n = 24;
  ctx.drawImage(pc, 0, 0, W, y0, 0, 0, W, y0);
  for (let i = 0; i < n; i++) { const a = y0 + (y1 - y0) * i / n, b = y0 + (y1 - y0) * (i + 1) / n; ctx.globalAlpha = 1 - (i + 0.5) / n; ctx.drawImage(pc, 0, a, W, b - a, 0, a, W, b - a); }
  ctx.restore();
}

// =====================================================================
//  the beats
// =====================================================================
const FLIPS = () => [[VW('hook', 'sparta') - 0.18, 'lambda'], [VW('hook', 'persia') - 0.18, 'disc'], [VW('hook', 'athens', 2) - 0.18, 'owl']];
function sceneHook() {
  setCam(floatCam('hook', 540, 1020, 1.0, 1.1));
  const lg = ctx.createRadialGradient(540, 1020, 60, 540, 1020, 640); lg.addColorStop(0, 'rgba(245,226,182,0.35)'); lg.addColorStop(1, 'rgba(245,226,182,0)'); ctx.fillStyle = lg; ctx.fillRect(-200, 300, 1480, 1500);
  let emb = 'owl', sx = 1;
  for (const [t, e] of FLIPS()) { const u = clamp((TT - t) / 0.36); if (u > 0) { sx = Math.cos(Math.PI * EZ.io(u)); if (u >= 0.5) emb = e; } }
  const bob = 8 * Math.sin(TT * 1.3), home = fadeIn(VW('hook', 'welcomed') - 0.1, 0.5);
  amShadow(560, 1420, 270, 34, 0.32);
  // an olive wreath grows round the shield as Athens takes him home
  if (home > 0) for (let i = 0; i < 26; i++) { const g = clamp(home * 26 - i); if (g <= 0) continue; const d = i < 13 ? -1 : 1, aa = Math.PI / 2 + d * (0.25 + (i % 13) * 0.2); amWash(ellipsePts(540 + Math.cos(aa) * 360, 1020 + bob + Math.sin(aa) * 360, 28 * g, 11 * g, aa + d * 1.2, 12), '#7d8a4a', { key: 'wrl' + i, w: 1.6 }); }
  amShield(540, 1020 + bob, 310, emb, { sx: Math.abs(sx) < 0.02 ? 0 : sx });
  for (const [t] of FLIPS()) { const u = clamp((TT - t - 0.18) / 0.9); if (u <= 0 || u >= 1) continue;
    for (let i = 0; i < 18; i++) { const R = RNG('dust', t, i), an = R.r(0, TAU), d = 310 + u * R.r(40, 160); amDot(540 + Math.cos(an) * d, 1020 + Math.sin(an) * d, R.r(2, 6) * (1 - u), AM.ink2, 0.6 * (1 - u)); } }
}
function scenePericles() {
  const soc = TT >= SUB('socrates');
  setCam(soc ? floatCam('socrates', 640, 1040, 1.02, 1.08, { px: 60 }) : floatCam('pericles', 520, 1040, 1.0, 1.06));
  alBirds(330, 700, 5, 'pb', 1.1);
  alHill(1010, 110, 'acro');
  alTemple(780, 905, 240, 80);
  for (let i = 0; i < 6; i++) { const R = RNG('olive', i), ox = R.r(-80, 1200), oy = 1000 + R.r(-40, 60); if (Math.abs(ox - 780) < 200) continue; amPen(ellipsePts(ox, oy - 30, 34, 24, 0, 16), { closed: true, w: 1.5, a: 0.6, key: 'ol' + i }); amSeg(ox, oy - 8, ox, oy + 20, { w: 1.5, a: 0.6, key: 'olt' + i }); }
  alPerson({ x: 250, y: 1170, s: 1.05, view: 'front', robe: AM.purple, hair: 'helmet', beard: '#8a7a68', age: true, look: 1, key: 'peric', nod: true });
  if (soc) alPerson({ x: springMove(SUB('socrates') + 0.5, 1320, 1010, SPRING.smooth), y: 1180, s: 1.0, view: 'front', robe: AM.brown, hair: 'bald', beard: '#9a8f80', age: true, look: -1, key: 'socr', smile: 0.6, nod: true });
  alPerson({ x: 660, y: 1150, s: 1.0, view: 'back', robe: AM.cloth, hair: 'curly', strap: AM.blueD, key: 'alci' });
  const raise = EZ.o2(clamp((TT - SUB('pericles') - 0.3) / 0.9)), hx2 = lerp(450, 535, raise), hy2 = lerp(1330, 1262, raise);
  amWash([[330, 1300], [hx2 - 10, hy2 - 26], [hx2 + 4, hy2 + 22], [345, 1380]], AM.purple, { key: 'psleeve', w: 2.2, hatch: { a: 0.35, gap: 8, al: 0.4, dash: [30, 120] } });
  alHand(hx2, hy2, -0.08, 1.0, AM.skin, 'phand', { curl: 0.15 });
  amShield(330, 1530, 150, 'owl');
  amText('PERICLES', 340, 880, 38, AM.ink, { caps: true, spacing: 4, a: fadeIn(VW('pericles', 'pericles') - 0.05, 0.3) });
  if (soc) {
    amText('SOCRATES', 900, 890, 38, AM.ink, { caps: true, spacing: 4, a: fadeIn(VW('socrates', "socrates'") - 0.05, 0.3) });
    const w1 = fadeIn(VW('socrates', 'wealthy') - 0.05, 0.3), g1 = fadeIn(VW('socrates', 'gorgeous') - 0.05, 0.3);
    for (let i = 0; i < 5; i++) { const R = RNG('coin', i), cx = 560 + i * 46 + R.r(-10, 10), cy = 1430 + R.r(-8, 8), a = clamp(w1 * 5 - i); if (a > 0) amWash(ellipsePts(cx, cy - (1 - EZ.back(a)) * 60, 22, 9, 0, 16), AM.goldL, { key: 'cn' + i, w: 1.6 }); }
    if (g1 > 0) for (let i = 0; i < 5; i++) { const R = RNG('spk', i), an = R.r(-2.6, -0.5), d = R.r(110, 160), u = 0.6 + 0.4 * Math.sin(TT * 5 + i * 1.7); star4(660 + Math.cos(an) * d, 1050 + Math.sin(an) * d, 14 * u * g1, AM.goldL); }
  }
}
function sceneSicily() {
  setCam(floatCam('sicily', 540, 1060, 1.0, 1.08, { py: -20 }));
  alHill(760, 70, 'pnyx');
  alTemple(820, 690, 160, 56, { a: 0.85 });
  alBirds(300, 560, 3, 'sb', 0.9);
  const tc = VW('sicily', 'conquest') - 0.3;
  alCrowd('asm', 6, 800, 1360, (id, x) => clamp((TT - tc - Math.abs(x - 540) * 0.0012 - (id % 7) * 0.04) / 0.5));
  amWash([[230, 1700], [850, 1700], [810, 1470], [270, 1470]], '#cdbd98', { key: 'bema', w: 2.2, hatch: [{ a: 0, gap: 16, al: 0.3 }, { a: 1.57, gap: 60, al: 0.3 }] });
  const arm = EZ.o2(clamp((TT - VW('sicily', 'sold') - 0.1) / 0.6)), wv = 0.08 * Math.sin(TT * 3);
  const ex = lerp(700, 800, arm), ey = lerp(1500, 1180, arm);
  alPerson({ x: 540, y: 1330, s: 0.95, view: 'back', robe: AM.cloth, hair: 'curly', strap: AM.blueD, key: 'alci2' });
  amWash([[660, 1400], [ex - 16, ey], [ex + 16, ey + 10], [710, 1440]], AM.cloth, { key: 'aarm', w: 2, hatch: { a: 1.2, gap: 7, al: 0.4 } });
  alHand(ex, ey, -1.2 + wv, 0.9, AM.skin, 'ahand');
  const dr = fadeIn(VW('sicily', 'sicily') - 0.2, 0.5);
  if (dr > 0) { ctx.save(); ctx.globalAlpha = dr * 0.8; const P = alRough(COAST.sicily.map(([a, b]) => [540 + (a - 14) * 110, 560 + (38.2 - b) * 130]), 'skysic'); amWash(P, AM.land, { key: 'skysic', w: 2, a: 0.75 }); amText('SICILY', 540, 790 - 40, 34, AM.ink2, { caps: true, spacing: 5 }); ctx.restore(); }
}
function sceneFleet() {
  setCam(floatCam('fleet', 540, 1000, 1.08, 1.0, { px: 40 }));
  amWash([[-260, 200], [1340, 200], [1340, 1000], [-260, 1000]], '#d9c49a', { key: 'fsky', line: false, a: 0.4, light: false });
  for (let i = 0; i < 4; i++) { const R = RNG('cld', i), cx = mod(R.r(0, 1400) + TT * 12, 1500) - 200, cy = R.r(560, 760); amPen([[cx - 90, cy], [cx - 60, cy - 26], [cx - 20, cy - 34], [cx + 20, cy - 22], [cx + 60, cy - 30], [cx + 100, cy]], { w: 1.6, a: 0.6, key: 'cl' + i }); }
  alHill(940, 40, 'fcoast', { a: 0.3 }); alTemple(170, 902, 90, 30, { a: 0.7 });
  alSea(960, 1800, 'fsea');
  const more = fadeIn(VW('fleet', 'fleet') - 0.25, 0.5);
  if (more > 0) { ctx.save(); ctx.globalAlpha = more; alShip(860 + TT * 6, 1030, 0.38, { key: 'sh2', ph: 1 }); alShip(180 + TT * 6, 1060, 0.42, { key: 'sh3', ph: 2 }); ctx.restore(); }
  const x = 420 + (TT - SUB('fleet')) * 40;
  alShip(x, 1320, 0.95, { key: 'sh1' });
  alPerson({ x: x - 330, y: 1150, s: 0.33, view: 'front', robe: AM.cloth, hair: 'curly', strap: AM.blueD, key: 'acmd' });
}
function sceneHerms() {
  const tSm = VW('herms', 'smashed') - 0.05, tBl = VW('herms', 'blame') - 0.3, sh = TT > tSm ? Math.exp(-(TT - tSm) * 6) * 10 : 0;
  if (TT < tBl) {
    const c = floatCam('herms', 540, 1000, 1.0, 1.12);
    setCam({ ...c, cx: c.cx + sh * Math.sin(TT * 80), cy: c.cy + sh * Math.cos(TT * 70) });
    for (let i = 0; i < 4; i++) { const hx = -80 + i * 330; amWash([[hx, 1250], [hx + 300, 1250], [hx + 300, 800 - (i % 2) * 60], [hx, 800 - (i % 2) * 60]], '#c6ad80', { key: 'hf' + i, w: 2, hatch: [{ a: 0, gap: 24, al: 0.2 }] }); amWash([[hx + 110, 1250], [hx + 190, 1250], [hx + 190, 1110], [hx + 110, 1110]], '#3a2e24', { key: 'hdr' + i, w: 1.8 }); }
    amWash([[-260, 1250], [1340, 1250], [1340, 1900], [-260, 1900]], '#b9a27a', { key: 'street', w: 2, hatch: [{ a: 0, gap: 30, al: 0.25, dash: [40, 90] }] });
    for (let i = 0; i < 3; i++) alHerm(220 + i * 320, 1500, 0.95, clamp((TT - tSm - i * 0.28) / 0.8), 'hm' + i);
    const vb = win(tSm - 0.5, tSm + 0.9, 0.2);
    if (vb > 0) { ctx.save(); ctx.globalAlpha = vb * 0.75; amWash([[-40, 1700], [160, 1700], [150, 1200], [100, 1120], [20, 1120], [-30, 1200]], '#1e1a18', { key: 'vand', line: false }); const sw = clamp((TT - tSm + 0.3) / 0.3); amSeg(120, 1220, lerp(160, 240, sw), lerp(1040, 1180, sw), { w: 10, c: '#1e1a18', key: 'vham' }); ctx.restore(); }
    alNight(0.75);
    alMoon(860, 720, 56);
  } else {
    setCam(floatCam('herms', 540, 1060, 1.0, 1.12));
    alNight(0.4);
    alPerson({ x: 540, y: 1180, s: 1.15, view: 'front', robe: AM.cloth, hair: 'curly', strap: AM.blueD, key: 'alci3', frown: true, look: 0 });
    const hands = [[-60, 820, 0.35], [-60, 1180, 0.05], [-60, 1520, -0.3], [1140, 860, Math.PI - 0.35], [1140, 1260, Math.PI + 0.05], [1140, 1600, Math.PI + 0.35]];
    hands.forEach(([hx, hy, an], i) => { const u = EZ.back(clamp((TT - tBl - i * 0.12) / 0.4)), L = 260 * u, x1 = hx + Math.cos(an) * L, y1 = hy + Math.sin(an) * L;
      if (u <= 0) return;
      amWash([[hx - Math.sin(an) * 30, hy + Math.cos(an) * 30], [x1 - Math.sin(an) * 26, y1 + Math.cos(an) * 26], [x1 + Math.sin(an) * 26, y1 - Math.cos(an) * 26], [hx + Math.sin(an) * 30, hy - Math.cos(an) * 30]], i % 2 ? AM.brownL : '#9a8a9a', { key: 'pa' + i, w: 2 });
      alHandPoint(x1, y1, an, 1.0, 'ph' + i); });
  }
}
function sceneFlee() {
  const tSp = VW('flee', 'enemy') - 0.15;
  if (TT < tSp) {
    const u = clamp((TT - SUB('flee')) / (tSp - SUB('flee'))), tS = VW('flee', 'sailed') - 0.4;
    const cx = springTrack([[0, MPX(17.2)], [tS, MPX(19.8)]], SPRING.heavy), cy = springTrack([[0, MPY(38.4)], [tS, MPY(38.0)]], SPRING.heavy);
    setCam({ cx: cx + 8 * Math.sin(TT * 0.4), cy, z: 0.78 + 0.05 * u });
    alMap();
    alCity('syracuse', 'Syracuse', '#3d6f62', 1, { dy: 44 }); alCity('athens', 'Athens', AM.blueD, 1, { dx: 50, dy: 30 }); alCity('sparta', 'Sparta', AM.red, 1, { dy: 50 });
    alCity('thurii', 'Thurii', AM.ink2, fadeIn(VW('flee', 'slipped') - 0.2, 0.3), { dy: -26, size: 30 });
    const r1 = [PL('catana'), MP(16.0, 38.6), PL('thurii')], r2 = [PL('thurii'), MP(18.5, 38.9), MP(20.4, 38.3), PL('cyllene'), MP(22.0, 37.5), PL('sparta')];
    alRoute(r1, clamp((TT - VW('flee', 'called') + 0.1) / 1.6), AM.blueD, 'r1', TT < VW('flee', 'sailed') - 0.2);
    if (TT > VW('flee', 'home') && TT < VW('flee', 'slipped')) amPen([PL('thurii'), MP(19.5, 39.3), PL('athens')], { w: 2, a: 0.35 * fadeIn(VW('flee', 'home'), 0.3), key: 'ghost' });
    alRoute(r2, clamp((TT - VW('flee', 'sailed') + 0.2) / 1.9), AM.redD, 'r2', true);
    amVeil();
  } else {
    setCam(floatCam('flee', 540, 1080, 1.0, 1.08));
    alHill(820, 50, 'sphill', { a: 0.3 });
    for (let i = 0; i < 9; i++) amPen([[60 + i * 120, 860], [60 + i * 120 + 10, 600]], { w: 2.4, key: 'bsp' + i });
    for (let i = 0; i < 4; i++) alHoplite(150 + i * 270, 1020, 0.62, 'hb' + i);
    const red = clamp((TT - VW('flee', 'sparta') + 0.1) / 0.5);
    alPerson({ x: 560, y: 1200, s: 1.05, view: 'back', robe: AM.cloth, hair: 'curly', strap: mixHex(AM.blueD, AM.red, red), key: 'alci4' });
    alHoplite(110, 1300, 0.95, 'hf1'); alHoplite(1000, 1310, 0.95, 'hf2');
  }
}
function sceneAdvice() {
  const tSy = VW('advice', 'syracuse') - 0.5, tFo = VW('advice', 'fort') - 0.4;
  const cx = springTrack([[0, MPX(22.6)], [tSy, MPX(19.2)], [tFo, MPX(22.9)]], SPRING.heavy);
  const z = springTrack([[0, 1.0], [tSy, 0.62], [tFo, 1.2]], SPRING.heavy);
  const cy = springTrack([[0, MPY(37.7)], [tSy, MPY(37.9)], [tFo, MPY(37.85)]], SPRING.heavy);
  setCam({ cx: cx + 8 * Math.sin(TT * 0.4), cy: cy + 6 * Math.sin(TT * 0.3), z });
  alMap();
  alCity('athens', 'Athens', AM.blueD, 1, { dx: 54, dy: 34 }); alCity('sparta', 'Sparta', AM.red, 1, { dy: 50 }); alCity('syracuse', 'Syracuse', '#3d6f62', 1, { dy: 44 });
  alArrow([PL('sparta'), MP(20.5, 36.4), MP(17.6, 36.5), MP(15.7, 36.95)], clamp((TT - tSy + 0.1) / 1.6), AM.red, 11, 'arSy');
  alArrow([PL('sparta'), MP(22.9, 37.65), MP(23.4, 38.05), MP(23.7, 38.55)], clamp((TT - tFo) / 1.2), AM.red, 11, 'arDe');
  const [dx, dy] = MP(23.55, 38.75);
  if (TT > tFo + 0.9) amPen([[MPX(23.85), MPY(38.2)], [dx + 10, dy + 10]], { w: 1.6, a: 0.7 * fadeIn(tFo + 0.9, 0.3), key: 'decl' });
  alFort(dx, dy, 0.8, popS(tFo + 1.0));
  if (TT > tFo + 1.0) amText('DECELEA', dx, dy - 70, 30, AM.red, { caps: true, spacing: 3, a: fadeIn(tFo + 1.1, 0.3) });
  const [ax, ay] = PL('athens'), [sx, sy] = PL('sparta');
  alPawn(ax, ay - 6, AM.blue, 0.55, { key: 'pAth' });
  alPawn(sx - 30, sy - 4, AM.red, 0.5, { key: 'pSp1' }); alPawn(sx + 2, sy + 8, AM.red, 0.5, { key: 'pSp2' });
  alPawn(sx + 34, sy - 10, AM.redL, 0.6, { key: 'pAlc' });
  const hA = win(SUB('advice') + 0.3, VW('advice', 'save') - 0.3, 0.3);
  if (hA > 0) { ctx.save(); ctx.globalAlpha = hA; alHandPoint(sx + 260 - 40 * Math.sin(TT * 6), sy - 140, Math.PI + 0.5, 1.2, 'adh'); ctx.restore(); }
  amVeil();
}
function sceneQueen() {
  setCam(floatCam('queen', 540, 1040, 1.0, 1.1));
  amWash([[-200, 1700], [1280, 1700], [980, 760], [100, 760]], '#cbb487', { key: 'board', w: 2.2 });
  for (let i = 0; i <= 8; i++) { const u = i / 8; amPen([[lerp(-200, 1280, u), 1700], [lerp(100, 980, u), 760]], { w: 1.4, a: 0.6, key: 'bv' + i }); }
  for (let j = 0; j <= 6; j++) { const v = Math.pow(j / 6, 1.4), y = lerp(760, 1700, v), x0 = lerp(100, -200, v), x1 = lerp(980, 1280, v); amPen([[x0, y], [x1, y]], { w: 1.4, a: 0.6, key: 'bh' + j }); }
  const tW = VW('queen', 'wife') - 0.2, tK = VW('queen', 'king') + 0.1;
  const qx = springMove(tW, 640, 800, SPRING.smooth), tip = EZ.o2(clamp((TT - tK) / 0.5));
  alPawn(380, 1280, AM.red, 2.4, { key: 'king', crown: true, tall: 1.25, rot: -tip * 1.35 });
  alPawn(qx, 1300, AM.redL, 2.1, { key: 'queen', veil: true, tall: 1.15 });
  const hx = qx + 70, hy = 1060;
  ctx.save(); ctx.globalAlpha = fadeIn(SUB('queen') + 0.4, 0.3);
  amWash([[1300, hy - 40], [hx + 60, hy - 30], [hx + 60, hy + 30], [1300, hy + 50]], AM.redD, { key: 'qsl', w: 2, hatch: { a: 0.1, gap: 8, al: 0.4 } });
  alHand(hx + 40, hy, Math.PI, 1.1, AM.skin, 'qh', { curl: 0.5 });
  ctx.restore();
  amText('KING AGIS', 380, 1420, 40, AM.ink, { caps: true, spacing: 3, a: fadeIn(SUB('queen') + 0.3, 0.3) });
  amText('QUEEN TIMAEA', Math.min(qx, 730), 1440, 40, AM.ink, { caps: true, spacing: 3, a: fadeIn(VW('queen', 'wife') - 0.1, 0.3) });
}
function scenePersia() {
  const tRun = VW('persia', 'ran') - 0.3;
  const cx = springTrack([[0, MPX(23.2)], [tRun, MPX(25.8)]], SPRING.heavy), z = springTrack([[0, 1.15], [tRun, 0.82]], SPRING.heavy);
  setCam({ cx: cx + 8 * Math.sin(TT * 0.4), cy: MPY(37.9) + 6 * Math.sin(TT * 0.3), z });
  alMap();
  alCity('athens', 'Athens', AM.blueD, 1, { dx: 54, dy: 34 }); alCity('sparta', 'Sparta', AM.red, 1, { dy: 50 });
  alCity('sardis', 'Sardis', AM.goldD, fadeIn(tRun + 0.3, 0.4), { dy: 50 });
  const pg = fadeIn(VW('persia', 'persia') - 0.2, 0.5);
  if (pg > 0) { ctx.save(); ctx.globalAlpha = pg; amText('PERSIA', MPX(29.0), MPY(39.1), 64, AM.goldD, { caps: true, spacing: 10 }); amShield(MPX(29.3), MPY(37.0), 60 * EZ.back(pg), 'disc'); ctx.restore(); }
  const [sx, sy] = PL('sparta'), close = EZ.io(clamp((TT - VW('persia', 'wanted') + 0.2) / 1.2));
  const run = EZ.io(clamp((TT - tRun) / 1.4)), path = [[sx + 30, sy - 10], MP(23.5, 37.0), MP(25.4, 37.6), MP(27.0, 38.2), [PL('sardis')[0] - 20, PL('sardis')[1]]];
  alRoute(path, clamp((TT - tRun) / 1.4), AM.goldD, 'pr', false);
  const [px, py] = pointAt(resample(path, false, 5), run);
  for (let i = 0; i < 4; i++) { const an = i / 4 * TAU + 0.4, d = lerp(130, 52, close); alPawn(sx + 30 + Math.cos(an) * d, sy - 10 + Math.sin(an) * d * 0.6, AM.red, 0.5, { key: 'spc' + i }); }
  alPawn(px, py, run > 0.5 ? mixHex(AM.redL, AM.gold, clamp(run * 2 - 1)) : AM.redL, 0.62, { key: 'pAlc2' });
  amVeil();
}
function sceneGold() {
  setCam(floatCam('gold', 540, 1060, 1.0, 1.08));
  for (let i = 0; i < 9; i++) amWash([[-100 + i * 150, 560], [50 + i * 150, 560], [40 + i * 150, 700], [-90 + i * 150, 700]], i % 2 ? AM.goldL : AM.purple, { key: 'awn' + i, w: 1.8, a: 0.75 });
  for (let i = 0; i < 9; i++) amPen(arcPts(-25 + i * 150, 700, 75, 0, Math.PI, 10), { w: 1.6, key: 'awa' + i });
  for (const cx of [80, 1000]) amWash([[cx - 34, 1700], [cx + 34, 1700], [cx + 30, 700], [cx - 30, 700]], '#d6c6a0', { key: 'col' + cx, w: 2, hatch: [{ a: 1.57, gap: 10, al: 0.35 }] });
  alPerson({ x: 220, y: 1100, s: 0.9, view: 'front', robe: AM.purple, trim: AM.gold, hair: 'tiara', beard: '#3e2e22', look: 1, key: 'satrap', smile: 0.4, nod: true });
  const tilt = 0.22 * Math.sin((TT - VW('gold', 'played')) * 2.4) * fadeIn(VW('gold', 'played') - 0.2, 0.4);
  const bx = 640, by = 1050, L = 300;
  amSeg(bx, by, bx, 1500, { w: 5, key: 'bpost' }); amWash([[bx - 60, 1500], [bx + 60, 1500], [bx + 40, 1470], [bx - 40, 1470]], AM.goldD, { key: 'bbase', w: 1.8 });
  const ends = [-1, 1].map((d) => [bx + d * L * Math.cos(tilt), by + d * L * Math.sin(tilt)]);
  amPen([ends[0], ends[1]], { w: 5, key: 'beam' }); amDot(bx, by, 12, AM.goldD);
  ends.forEach(([ex, ey], i) => { const py = ey + 200; amPen([[ex, ey], [ex - 70, py]], { w: 1.4, key: 'ch' + i + 'a' }); amPen([[ex, ey], [ex + 70, py]], { w: 1.4, key: 'ch' + i + 'b' });
    amWash([[ex - 90, py], [ex + 90, py], [ex + 60, py + 26], [ex - 60, py + 26]], AM.gold, { key: 'pan' + i, w: 1.8 });
    alPawn(ex, py, i ? AM.red : AM.blue, 0.9, { key: 'bp' + i }); });
  const gd = fadeIn(VW('gold', 'dangled') - 0.2, 0.4);
  if (gd > 0) { const [ex] = ends[0], sw = 0.25 * Math.sin(TT * 2.2), top = [ex + 60, 760], len = lerp(80, 330, EZ.o3(gd)), px = top[0] + Math.sin(sw) * len, py = top[1] + Math.cos(sw) * len;
    amPen([top, [px, py]], { w: 1.8, key: 'cord' });
    amWash([[px - 40, py + 10], [px - 52, py + 60], [px - 30, py + 92], [px + 30, py + 92], [px + 52, py + 60], [px + 40, py + 10], [px + 14, py], [px - 14, py]], AM.goldL, { key: 'purse', w: 2, hatch: { a: 1.2, gap: 9, al: 0.3 } });
    for (let i = 0; i < 4; i++) { const R = RNG('glt', i), u = 0.5 + 0.5 * Math.sin(TT * 6 + i * 2); star4(px + R.r(-50, 50), py + R.r(10, 90), 10 * u, '#fff1c0'); } }
}
function sceneGeneral() {
  setCam(floatCam('general', 540, 1060, 1.0, 1.07));
  const tGen = VW('general', 'made') - 0.2, cheer = (id, x) => clamp((TT - tGen - Math.abs(x - 540) * 0.001 - (id % 5) * 0.05) / 0.5);
  alHill(760, 70, 'pnyx2');
  alTemple(820, 690, 160, 56, { a: 0.85 });
  const lose = 1 - fadeIn(tGen, 0.8) * 0.5;
  for (let i = 0; i < 3; i++) alSmoke(150 + i * 380, 760, lose, 'gs' + i, 7);
  alCrowd('asm2', 6, 800, 1360, cheer);
  amWash([[230, 1700], [850, 1700], [810, 1470], [270, 1470]], '#cdbd98', { key: 'bema2', w: 2.2, hatch: [{ a: 0, gap: 16, al: 0.3 }] });
  const gen = fadeIn(tGen + 0.2, 0.5);
  alPerson({ x: 540, y: 1330, s: 0.95, view: 'back', robe: mixHex('#e3d5b5', AM.blue, gen * 0.85), hair: 'curly', strap: AM.blueD, key: 'alci5' });
  if (gen > 0) amShield(540, 1560, 150 * EZ.back(gen), 'owl');
  if (TT > tGen) for (let i = 0; i < 20; i++) { const R = RNG('pet', i), u = mod((TT - tGen) * R.r(0.25, 0.45) + R.f(), 1); amWash(ellipsePts(R.r(0, 1080) + Math.sin(TT * 2 + i) * 30, 600 + u * 1100, 9, 5, TT * 3 + i, 8), i % 3 ? '#7d8a4a' : AM.redL, { key: 'pt' + i, w: 1, light: false, a: 0.85 }); }
}
function sceneHero() {
  setCam(floatCam('hero', 540, 1000, 1.0, 1.06, { px: 30 }));
  amWash([[-260, 200], [1340, 200], [1340, 1000], [-260, 1000]], '#e2cda0', { key: 'hsky', line: false, a: 0.45, light: false });
  const sun = ctx.createRadialGradient(840, 760, 10, 840, 760, 400); sun.addColorStop(0, 'rgba(255,230,170,0.6)'); sun.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = sun; ctx.fillRect(-260, 200, 1600, 1000);
  const bt = [VW('hero', 'battle'), VW('hero', 'after'), VW('hero', 'battle', 2)];
  bt.forEach((t, i) => { const p = EZ.back(clamp((TT - t + 0.05) / 0.3)); if (p <= 0) return; const x = 240 + i * 300, y = 650;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    for (let j = 0; j < 14; j++) { const d = j < 7 ? -1 : 1, aa = Math.PI / 2 + d * (0.35 + (j % 7) * 0.32); amWash(ellipsePts(Math.cos(aa) * 80, Math.sin(aa) * 80, 20, 9, aa + d * 1.2, 10), '#7d8a4a', { key: 'lr' + i + j, w: 1.4 }); }
    alShipMini(0, 18, 0.13, 'ens' + i, AM.red); amSeg(-60, -50, 60, 60, { w: 5, c: AM.redD, key: 'x1' + i }); amSeg(60, -50, -60, 60, { w: 5, c: AM.redD, key: 'x2' + i });
    ctx.restore(); });
  alSea(1000, 1800, 'hsea');
  amWash([[760, 1000], [1340, 1000], [1340, 1250], [700, 1250]], '#cdbd98', { key: 'quay', w: 2.2, hatch: [{ a: 0, gap: 18, al: 0.3 }] });
  alTemple(1010, 1000, 200, 70, { a: 0.9 });
  const tH = VW('hero', 'home') - 0.4;
  for (let i = 0; i < 8; i++) { const x = 760 + i * 70, bob = Math.abs(Math.sin(TT * 5 + i)) * 10 * fadeIn(tH, 0.3); amWash([[x - 22, 1250], [x - 20, 1170 - bob], [x + 20, 1170 - bob], [x + 22, 1250]], [AM.cloth, AM.brownL, '#9a8a9a', AM.blueL][i % 4], { key: 'qb' + i, w: 1.5 }); amWash(ellipsePts(x, 1150 - bob, 14, 16, 0, 12), AM.skin, { key: 'qh' + i, w: 1.4, light: false }); if (TT > tH) amPen([[x + 14, 1180 - bob], [x + 30, 1120 - bob]], { w: 3, key: 'qa' + i }); }
  alShip(springMove(SUB('hero'), 200, 470, SPRING.heavy), 1380, 0.8, { key: 'hsh', garland: true });
  if (TT > tH) for (let i = 0; i < 26; i++) { const R = RNG('hp', i), u = mod((TT - tH) * R.r(0.3, 0.5) + R.f(), 1); amWash(ellipsePts(R.r(100, 1080) + Math.sin(TT * 2 + i) * 30, 500 + u * 1100, 9, 5, TT * 3 + i, 8), i % 3 ? '#7d8a4a' : AM.redL, { key: 'hpt' + i, w: 1, light: false, a: 0.85 }); }
}
function sceneFire() {
  const tSet = VW('fire', 'fire') - 0.3, tOut = VW('fire', 'ran') - 0.15, tArr = VW('fire', 'shot') - 0.25;
  setCam(floatCam('fire', 540, 1080, 1.0, 1.12));
  alHill(1000, 40, 'phry', { a: 0.3 });
  for (let i = 0; i < 6; i++) { const R = RNG('tree', i), tx = R.r(-60, 1140), ty = 1000 + R.r(-20, 20); if (tx > 250 && tx < 830) continue; amWash(ellipsePts(tx, ty - 80, 50, 80, 0, 16), '#6b6a48', { key: 'tr' + i, w: 1.6, hatch: { a: 1.2, gap: 7, al: 0.4 } }); amSeg(tx, ty - 10, tx, ty + 40, { w: 3, key: 'trt' + i }); }
  const burn = clamp((TT - tSet) / 1.5);
  alSmoke(540, 900, burn, 'fs', 8);
  alHouse(540, 1350, 1.2, burn, 'hs');
  alFlames(540, 1000, 560, 380 * (0.6 + burn * 0.4), burn, 'roof');
  alFlames(380, 1350, 160, 180, burn * 0.8, 'side1'); alFlames(720, 1350, 160, 200, burn * 0.8, 'side2');
  amWash([[-260, 1350], [1340, 1350], [1340, 1900], [-260, 1900]], '#a89067', { key: 'gr', w: 2, hatch: [{ a: 0.1, gap: 26, al: 0.25 }] });
  const out = clamp((TT - tOut) / 1.2), rx = lerp(540, 300, EZ.o2(out)), fall = clamp((TT - tArr - 0.6) / 0.6);
  if (TT > tOut) { ctx.save(); ctx.translate(rx, 1360); ctx.rotate(-fall * 1.3);
    amWash([[-40, 0], [-24, -150], [-46, -200], [-30, -250], [30, -250], [40, -190], [28, -150], [44, 0]], '#1e1a18', { key: 'runb', line: false });
    amWash(ellipsePts(0, -290, 34, 38, 0, 16), '#1e1a18', { key: 'runh', line: false });
    const ar = 0.6 + 0.2 * Math.sin(TT * 8); amSeg(30, -230, 100, -230 - 90 * ar, { w: 12, c: '#1e1a18', key: 'runa' }); amSeg(100, -230 - 90 * ar, 120, -260 - 130 * ar, { w: 5, c: '#c9c2b2', key: 'dag' });
    amSeg(-30, 0, -70, 60 * (1 + Math.sin(TT * 12)) * 0.5, { w: 14, c: '#1e1a18', key: 'rl1' }); amSeg(30, 0, 60, 60 * (1 + Math.cos(TT * 12)) * 0.5, { w: 14, c: '#1e1a18', key: 'rl2' });
    ctx.restore(); }
  for (let i = 0; i < 9; i++) { const R = RNG('arw', i), t0 = tArr + i * 0.12, u = clamp((TT - t0) / 0.35); if (u <= 0) continue;
    const x0 = -120, y0 = R.r(700, 1200), x1 = rx + R.r(-40, 40), y1 = 1360 - R.r(60, 260), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 60, an = Math.atan2(y1 - y0, x1 - x0);
    amSeg(x - Math.cos(an) * 90, y - Math.sin(an) * 90, x, y, { w: 3, key: 'ar' + i }); amWash([[x, y], [x - Math.cos(an - 0.4) * 22, y - Math.sin(an - 0.4) * 22], [x - Math.cos(an + 0.4) * 22, y - Math.sin(an + 0.4) * 22]], '#3a2a1a', { key: 'arh' + i, w: 1.2, light: false }); }
  alNight(0.7, 540, 1000);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(540, 1150, 30, 540, 1150, 700); g.addColorStop(0, `rgba(255,140,50,${0.45 * burn})`); g.addColorStop(1, 'rgba(255,140,50,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function sceneName() {
  const tN = VW('name', 'alcibiades') - 0.1;
  setCam(floatCam('name', 540, 1120, 1.12, 1.0));
  const ring = ctx.createRadialGradient(540, 1100, 60, 540, 1100, 700); ring.addColorStop(0, 'rgba(250,232,190,0.45)'); ring.addColorStop(1, 'rgba(250,232,190,0)'); ctx.fillStyle = ring; ctx.fillRect(-200, 300, 1480, 1600);
  alPerson({ x: 540, y: 1260, s: 1.35, view: 'front', robe: '#d8d2c8', hair: 'curly', strap: AM.blueD, key: 'portrait', look: 0, smile: 0.5 });
  [['owl', 190, 1420], ['lambda', 890, 1420], ['disc', 540, 1600]].forEach(([e, x, y], i) => { const p = EZ.back(clamp((TT - (VW('name', 'switched') + i * 0.35)) / 0.35)); if (p > 0) amShield(x, y, 120 * p, e); });
  const nm = 'ALCIBIADES', k = clamp((TT - tN) / 0.9);
  if (k > 0) amOverlay(() => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `96px ${AM_CAPS}`; ctx.textAlign = 'left'; ctx.letterSpacing = '6px';
    const full = ctx.measureText(nm).width, x0 = 540 - full / 2, n = Math.ceil(k * nm.length);
    ctx.fillStyle = 'rgba(214,190,146,0.55)'; ctx.fillText(nm.slice(0, n), x0 + 3, 683);
    ctx.fillStyle = AM.ink; ctx.fillText(nm.slice(0, n), x0, 680);
    ctx.fillRect(x0, 710, full * EZ.o2(clamp((TT - tN - 0.6) / 0.6)), 4); ctx.restore(); });
}
function sceneSign() {
  setCam({ cx: 540, cy: 960, z: 1 });
  const lg = ctx.createRadialGradient(540, 960, 60, 540, 960, 700); lg.addColorStop(0, 'rgba(250,232,190,0.5)'); lg.addColorStop(1, 'rgba(250,232,190,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  // the channel's symbol: the blue apple with the eye, popping in on a spring and floating
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), bob = 10 * Math.sin((TT - SIGN_T) * 1.6), sz = 460 * k;
  amShadow(560, 1000, 200 * k, 26 * k, 0.3);
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 740 + bob); ctx.rotate(0.03 * Math.sin((TT - SIGN_T) * 1.2)); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  amOverlay(() => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); amLogo('AMPHORUS', 540, 1130, 100); ctx.restore(); });
}
// the sign-off in gold Roman capitals: a dark edge, a gold gradient, a moving shine
function amLogo(str, x, y, size) {
  ctx.save(); ctx.font = `${size}px ${AM_CAPS}`; ctx.textAlign = 'center'; ctx.letterSpacing = size * 0.12 + 'px';
  const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(60,35,10,0.55)'; ctx.fillText(str, x + 4, y + 6);
  const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1); g.addColorStop(0, '#f6dd94'); g.addColorStop(0.45, '#d6a64a'); g.addColorStop(0.55, '#a8761f'); g.addColorStop(1, '#e3bd68');
  ctx.fillStyle = g; ctx.fillText(str, x, y);
  ctx.lineWidth = 2; ctx.strokeStyle = '#6b4a14'; ctx.strokeText(str, x, y);
  const sx = x - w / 2 + mod((TT - SIGN_T) * 0.6, 1.6) * w, s = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
  s.addColorStop(0, 'rgba(255,250,220,0)'); s.addColorStop(0.5, 'rgba(255,250,220,0.8)'); s.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = s; ctx.fillText(str, x, y);
  ctx.restore();
}

const SCENES = { hook: sceneHook, pericles: scenePericles, socrates: scenePericles, sicily: sceneSicily, fleet: sceneFleet, herms: sceneHerms, flee: sceneFlee, advice: sceneAdvice, queen: sceneQueen, persia: scenePersia, gold: sceneGold, general: sceneGeneral, hero: sceneHero, fire: sceneFire, name: sceneName, sign: sceneSign };
function sceneStage() {
  amPaper();
  const id = shotNow();
  ctx.save(); SCENES[id](); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const cut = TB.find((t) => t > 0 && TT >= t && TT < t + 0.12);   // a short paper flash on every cut, like a page turned
  if (cut !== undefined) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - (TT - cut) / 0.12); ctx.drawImage(amPaperCanvas(), 0, 0); ctx.restore(); }
  amOverlay(() => amFrame(1));
  drawCaptions();
}

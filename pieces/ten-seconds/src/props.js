// =====================================================================
//  PROPS — every object in "What If You Could See 10 Seconds Into the Future?" (ifverse look)
//  P_name(x, y, s, o = {}) draws in the current transform (world coords). s = 1 ≈ natural size next to a 520-px actor.
//  (x, y) = the prop's base / bottom-centre unless the comment above it says otherwise.
//  Flat vector shapes, soft shading, a thin warm rim light on the key side (IV_M.key / IV_M.rim), so they sit
//  in any mood. Rect graphics (cards, CCTV) take x, y = top-left, w, h.
// =====================================================================

// ---- shared helpers (prefix prop_) ------------------------------------
// fill a path with a rim pass first: the silhouette in the rim colour, nudged toward the key light by rw (local px)
function prop_rim(path, fill, rw = 2, rimCol) {
  const m = ctx.getTransform(), det = m.a * m.d - m.b * m.c || 1, k = IV_M.key, sc = Math.sqrt(Math.abs(det));
  const vx = k[0] * rw * sc, vy = k[1] * rw * sc, lx = (m.d * vx - m.c * vy) / det, ly = (-m.b * vx + m.a * vy) / det;
  ctx.save(); ctx.translate(lx, ly); path(); ctx.fillStyle = rimCol || IV_M.rim; ctx.fill(); ctx.restore();
  path(); ctx.fillStyle = fill; ctx.fill();
}
// the same rim idea for props made of many strokes: fn(rimColourOrNull) is called twice, offset in the rim colour, then plain
function prop_rimDo(fn, rw = 2) {
  const m = ctx.getTransform(), det = m.a * m.d - m.b * m.c || 1, k = IV_M.key, sc = Math.sqrt(Math.abs(det));
  const vx = k[0] * rw * sc, vy = k[1] * rw * sc, lx = (m.d * vx - m.c * vy) / det, ly = (-m.b * vx + m.a * vy) / det;
  ctx.save(); ctx.translate(lx, ly); fn(IV_M.rim); ctx.restore(); fn(null);
}
// soft shading inside the current path: darker on the side away from the key light
function prop_shade(x, y, w, h, a = 0.28) {
  const k = IV_M.key, cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) / 2;
  const g = ctx.createLinearGradient(cx + k[0] * r, cy + k[1] * r, cx - k[0] * r, cy - k[1] * r);
  g.addColorStop(0, 'rgba(255,240,220,0.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,6,20,${a})`);
  ctx.save(); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(x - 2, y - 2, w + 4, h + 4); ctx.restore();
}
// text that stays readable inside a mirrored (dir = −1) prop
function prop_dText(dir, str, x, y, size, color, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ivText(str, 0, 0, size, color, o); ctx.restore(); }
const prop_rr = (x, y, w, h, r) => () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const prop_poly = (P) => () => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
const prop_circ = (x, y, r) => () => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
// word-wrapped text, returns the y after the last line
function prop_wrap(str, x, y, maxW, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? IV.font}`;
  const words = String(str).split(' '), lines = []; let cur = '';
  words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur); ctx.restore();
  const lh = size * (o.lh ?? 1.22);
  lines.forEach((L, i) => ivText(L, x, y + i * lh, size, color, { align: 'left', ...o }));
  return y + lines.length * lh;
}
// contact shadow under a prop resting on a surface
function prop_shadow(x, y, w, a = 0.35) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * 0.07, 0, 0, TAU); ctx.fillStyle = `rgba(5,3,10,${a})`; ctx.fill(); ctx.restore(); }

// ---- P_phone ------------------------------------------------------------
// anchor: the phone's CENTRE. Natural size 36×75 px. o.ang rotation; o.screen(w, h) draws the screen in local coords
// (w = 360, h = 760 always, whatever the scale); o.back: show the back (camera bump); o.off: dark screen;
// o.glow (default on when a screen is drawn) light spill; o.col case colour.
function P_phone(x, y, s = 1, o = {}) {
  const k = s * 0.09, BW = 400, BH = 830, SW = 360, SH = 760;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(k, k); ctx.translate(-BW / 2, -BH / 2);
  const lit = !o.back && !o.off && (o.glow ?? !!o.screen);
  if (lit) ivGlow(BW / 2, BH / 2, 620, 'rgba(150,190,255,0.22)');
  const col = o.col || '#22242e';
  // side buttons
  ivRR(-7, 170, 12, 70, 5, ivShade(col, -0.3)); ivRR(-7, 260, 12, 110, 5, ivShade(col, -0.3)); ivRR(BW - 5, 230, 12, 140, 5, ivShade(col, -0.3));
  prop_rim(prop_rr(0, 0, BW, BH, 66), col, 7);
  ctx.save(); prop_rr(0, 0, BW, BH, 66)(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();
  prop_rr(0, 0, BW, BH, 66)(); prop_shade(0, 0, BW, BH, 0.4); ctx.restore();
  ivRR(8, 8, BW - 16, BH - 16, 58, null, 'rgba(0,0,0,0.5)', 5);
  if (o.back) {   // the back: a camera bump, a soft sheen
    ivRR(34, 34, 170, 190, 44, ivShade(col, 0.08), 'rgba(255,255,255,0.12)', 3);
    [[80, 82], [80, 172], [160, 127]].forEach(([cx, cy]) => { ivDot(cx, cy, 34, '#0b0c12'); ivDot(cx, cy, 24, '#1b2340'); ivDot(cx, cy, 10, '#3a4a80'); ivDot(cx - 8, cy - 8, 5, 'rgba(255,255,255,0.6)'); });
    ivDot(160, 70, 10, '#fff4d8');
    ctx.save(); ctx.globalAlpha = 0.07; ivPoly([[BW * 0.55, 0], [BW, 0], [BW, BH * 0.35], [BW * 0.1, BH]], '#ffffff'); ctx.restore();
    ctx.restore(); return;
  }
  // the screen
  ctx.save(); ctx.translate(20, 35); prop_rr(0, 0, SW, SH, 48)(); ctx.clip();
  ctx.fillStyle = '#07080c'; ctx.fillRect(0, 0, SW, SH);
  if (o.screen && !o.off) o.screen(SW, SH);
  // glass: one soft diagonal sheen
  ctx.globalAlpha = o.off ? 0.10 : 0.035; ivPoly([[SW * 0.7, 0], [SW, 0], [SW, SH * 0.12], [SW * 0.2, SH], [-10, SH], [-10, SH * 0.9]], '#ffffff'); ctx.globalAlpha = 1;
  ctx.restore();
  ivRR(BW / 2 - 58, 52, 116, 30, 15, '#030305');                // the camera pill
  ivDot(BW / 2 + 36, 67, 7, '#141a2c');
  ctx.restore();
}

// ---- P_phoneUI: screens for P_phone's o.screen (w = 360, h = 760) --------
function prop_statusBar(w, time, c = '#eef2ff') {
  ivText(time, 42, 50, 22, c, { align: 'left', font: IV.sans, weight: 700 });
  for (let i = 0; i < 4; i++) ivRR(w - 128 + i * 9, 50 - 6 - i * 4, 6, 6 + i * 4, 1.5, c);   // signal
  ivRR(w - 80, 34, 40, 18, 5, null, c, 2); ivRR(w - 77, 37, 26, 12, 3, c); ivRR(w - 38, 40, 3, 6, 1, c);   // battery
}
const P_phoneUI = {
  // a text message: o.from (sender), o.text, o.stamp (time sent, shown under the bubble), o.now (status-bar clock), o.mine
  message(w, h, o = {}) {
    ctx.fillStyle = ivVGrad(0, h, ['#141826', '#0f121c', '#0b0d14']); ctx.fillRect(0, 0, w, h);
    prop_statusBar(w, o.now || (o.stamp ? o.stamp.replace(/:\d\d (?=[AP]M)/, ' ').replace(/ [AP]M/, '') : '11:42'));
    ivRR(0, 74, w, 120, 0, 'rgba(255,255,255,0.04)'); ivLine(0, 194, w, 194, 2, 'rgba(255,255,255,0.08)');
    ivLine(36, 118, 24, 132, 5, '#7fb0ff'); ivLine(24, 132, 36, 146, 5, '#7fb0ff');
    ivDot(w / 2, 120, 30, '#3a4058'); ivText(o.avatar || '?', w / 2, 132, 32, '#c9d2ea', { font: IV.sans });
    ivText(o.from || 'UNKNOWN', w / 2, 178, 22, '#eef2ff', { font: IV.sans, weight: 700, track: 2 });
    ivText('Text Message', w / 2, 236, 17, 'rgba(220,228,255,0.45)', { font: IV.sans, weight: 600 });
    ivText(o.day || 'Today', w / 2, 258, 17, 'rgba(220,228,255,0.45)', { font: IV.sans, weight: 600 });
    // the bubble
    ctx.save(); ctx.font = `600 30px ${IV.sans}`; const lines = []; let cur = '';
    String(o.text || '').split(' ').forEach((wd) => { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > 236 && cur) { lines.push(cur); cur = wd; } else cur = t; });
    if (cur) lines.push(cur); const tw = Math.max(...lines.map((L) => ctx.measureText(L).width), 60); ctx.restore();
    const bw = tw + 44, bh = lines.length * 38 + 30, mine = !!o.mine, bx = mine ? w - 24 - bw : 24, by = 290;
    const bc = mine ? '#2f7cf6' : '#2c3144';
    ivPoly(mine ? [[bx + bw - 26, by + bh - 4], [bx + bw + 10, by + bh + 2], [bx + bw - 6, by + bh - 24]] : [[bx + 26, by + bh - 4], [bx - 10, by + bh + 2], [bx + 6, by + bh - 24]], bc);
    ivRR(bx, by, bw, bh, 26, bc);
    lines.forEach((L, i) => ivText(L, bx + 22, by + 46 + i * 38, 30, '#f4f6ff', { align: 'left', font: IV.sans, weight: 600 }));
    if (o.stamp) ivText(o.stamp, mine ? w - 30 : 30, by + bh + 36, 19, o.stampCol || '#9fb0d8', { align: mine ? 'right' : 'left', font: IV.sans, weight: 700, track: 1 });
    // the reply bar
    ivRR(20, h - 92, w - 40, 56, 28, null, 'rgba(255,255,255,0.18)', 2.5);
    ivText('Text Message', 46, h - 56, 20, 'rgba(255,255,255,0.3)', { align: 'left', font: IV.sans, weight: 600 });
    ivDot(w - 52, h - 64, 18, 'rgba(255,255,255,0.15)');
  },
  // a bank app: o.amount ('$14.00'), o.name, o.rows [[label, amount], ...]
  bank(w, h, o = {}) {
    ctx.fillStyle = ivVGrad(0, h, ['#0f3b38', '#0d2a2c', '#0b1a1e']); ctx.fillRect(0, 0, w, h);
    prop_statusBar(w, o.now || '4:12');
    ivDot(54, 112, 20, '#e9c46a'); ivText('B', 54, 121, 24, '#0f3b38'); ivText(o.name || 'CITY BANK', 84, 121, 22, '#eafaf4', { align: 'left', track: 2 });
    ivRR(24, 160, w - 48, 250, 30, '#f3ecdc');
    ivRR(24, 160, w - 48, 250, 30); prop_shade(24, 160, w - 48, 250, 0.12);
    ivText('CHECKING  ••4021', 50, 206, 17, '#6b7a78', { align: 'left', font: IV.sans, weight: 700, track: 2 });
    ivText('Available balance', 50, 250, 20, '#3d4a48', { align: 'left', font: IV.sans, weight: 600 });
    ivText(o.amount || '$14.00', 48, 340, 76, '#13302d', { align: 'left' });
    ivRR(50, 368, 120, 8, 4, '#d8cfbd'); ivRR(50, 368, 26, 8, 4, '#e07a5f');
    ivText('RECENT', 30, 466, 17, 'rgba(234,250,244,0.6)', { align: 'left', font: IV.sans, weight: 800, track: 3 });
    (o.rows || [['Arcade tokens', '−$5.00'], ['Cafeteria', '−$3.50'], ['Allowance', '+$20.00'], ['Bus pass', '−$7.50']]).forEach(([L, A], i) => {
      const yy = 510 + i * 62; ivDot(50, yy - 8, 18, 'rgba(255,255,255,0.08)');
      ivText(L, 80, yy, 22, '#eafaf4', { align: 'left', font: IV.sans, weight: 600 });
      ivText(A, w - 30, yy, 22, A[0] === '+' ? '#8fe3b0' : '#eafaf4', { align: 'right', font: IV.sans, weight: 700 });
      ivLine(80, yy + 22, w - 30, yy + 22, 1.5, 'rgba(255,255,255,0.07)');
    });
  },
  // the camera recording: o.rec (seconds recorded, or true), o.count (clip number badge), o.view(w, h) draws the scene
  camera(w, h, o = {}) {
    if (o.view) o.view(w, h);
    else { ctx.fillStyle = ivVGrad(0, h, ['#2a3150', '#3a3a52', '#24202c']); ctx.fillRect(0, 0, w, h);
      ivLine(w * 0.7, h * 0.62, w * 0.7, h * 0.2, 10, '#151824'); ivRR(w * 0.7 - 26, h * 0.12, 52, 120, 10, '#151824');
      ivDot(w * 0.7, h * 0.12 + 22, 13, '#ff4a3a'); ivGlow(w * 0.7, h * 0.12 + 22, 70, 'rgba(255,70,50,0.6)');
      ctx.fillStyle = '#1b1c26'; ctx.fillRect(0, h * 0.62, w, h); for (let i = 0; i < 6; i++) ivRR(20 + i * 60, h * 0.72, 36, 90, 2, 'rgba(240,235,220,0.35)'); }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, w, 92); ctx.fillRect(0, h - 150, w, 150);
    const L = 34, m = 30; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    [[m, 110, 1, 1], [w - m, 110, -1, 1], [m, h - 170, 1, -1], [w - m, h - 170, -1, -1]].forEach(([cx, cy, sx, sy]) => { ctx.beginPath(); ctx.moveTo(cx, cy + sy * L); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * L, cy); ctx.stroke(); });
    ctx.restore();
    const sec = typeof o.rec === 'number' ? o.rec : (o.rec ? TT % 60 : 0), on = o.rec !== false;
    if (on) {
      ivRR(w / 2 - 92, 40, 184, 40, 10, '#e5352b');
      ivText('00:00:' + String(Math.floor(sec)).padStart(2, '0'), w / 2 + 12, 69, 24, '#ffffff', { font: IV.sans, weight: 700 });
      if (Math.floor(TT * 2) % 2 === 0) ivDot(w / 2 - 68, 60, 8, '#ffffff');
      ivText('REC', 40, 140, 20, '#ff6a5a', { align: 'left', font: IV.sans, weight: 800, track: 2 });
    }
    if (o.count != null) { ivRR(w - 150, 118, 120, 40, 12, 'rgba(10,10,16,0.65)'); ivText('CLIP ' + o.count, w - 90, 146, 21, '#ffe6c4', { track: 1 }); }
    ivText('1×', w / 2, h - 178, 18, '#ffd34d', { font: IV.sans, weight: 800 });
    ivDot(w / 2, h - 76, 44, 'rgba(255,255,255,0.9)'); ivDot(w / 2, h - 76, 37, 'rgba(0,0,0,0.35)');
    if (on) ivRR(w / 2 - 16, h - 92, 32, 32, 6, '#e5352b'); else ivDot(w / 2, h - 76, 32, '#e5352b');
    ivRR(48, h - 102, 52, 52, 10, '#3a3f52', 'rgba(255,255,255,0.6)', 2);
  },
  // a news app headline: o.head, o.kicker ('BREAKING'), o.src, o.photo(w, h) for the picture
  news(w, h, o = {}) {
    ctx.fillStyle = '#f4efe4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b1d26'; ctx.fillRect(0, 0, w, 150); prop_statusBar(w, o.now || '7:05');
    ivText(o.src || 'CITY NEWS', 30, 126, 30, '#fff3e0', { align: 'left', track: 2 });
    ivDot(w - 44, 116, 6, '#e5352b');
    ivRR(30, 184, 150, 36, 8, '#d8342c'); ivText(o.kicker || 'BREAKING', 105, 210, 20, '#ffffff', { track: 2 });
    const y1 = prop_wrap(o.head || 'Headline', 30, 276, w - 60, 38, '#15161d', { lh: 1.12 });
    ctx.save(); const ph = 210, py = y1 + 6; prop_rr(30, py, w - 60, ph, 18)(); ctx.clip();
    if (o.photo) { ctx.translate(30, py); o.photo(w - 60, ph); }
    else { ctx.fillStyle = ivVGrad(py, py + ph, ['#384266', '#5b4a6a', '#b46a5c']); ctx.fillRect(30, py, w - 60, ph);
      ivLine(w * 0.66, py + ph, w * 0.66, py + 60, 9, '#1b1d2b'); ivRR(w * 0.66 - 20, py + 30, 40, 92, 8, '#1b1d2b');
      ivDot(w * 0.66, py + 52, 10, '#ffcd3c'); ivGlow(w * 0.66, py + 52, 60, 'rgba(255,200,60,0.6)'); }
    ctx.restore();
    for (let i = 0; i < 4; i++) ivRR(30, py + ph + 30 + i * 30, (w - 60) * (i === 3 ? 0.55 : 1), 12, 6, 'rgba(20,22,30,0.16)');
  },
};

// ---- lunch --------------------------------------------------------------
// P_carton: a juice carton, gable top + straw. anchor: bottom-centre. ~50×84 px. o.ang tips it over its bottom corner
// (negative = to the left); o.col body, o.label stripe colour, o.text ('JUICE'), o.straw (default true)
function P_carton(x, y, s = 1, o = {}) {
  const w = 48, hb = 62, ht = 22, a = o.ang || 0, c = o.col || '#f1ede4', lab = o.label || '#e6744a';
  ctx.save(); ctx.translate(x + (a < 0 ? -w / 2 : a > 0 ? w / 2 : 0) * s, y); ctx.rotate(a); ctx.scale(s, s); ctx.translate(a < 0 ? w / 2 : a > 0 ? -w / 2 : 0, 0);
  if (!a) prop_shadow(0, 0, w * 1.3, 0.3);
  const body = prop_poly([[-w / 2, 0], [w / 2, 0], [w / 2, -hb], [0, -hb - ht], [-w / 2, -hb]]);
  prop_rim(body, c, 1.6); body(); prop_shade(-w / 2, -hb - ht, w, hb + ht, 0.3);
  ivPoly([[0, -hb - ht], [w / 2, -hb], [w * 0.18, -hb]], 'rgba(0,0,0,0.10)');                  // the gable fold
  ivRR(-3, -hb - ht - 6, 6, 8, 2, ivShade(c, -0.12));                                                 // the seal fin
  ivPoly([[-w / 2, -hb * 0.75], [w / 2, -hb * 0.75], [w / 2, -hb * 0.32], [-w / 2, -hb * 0.32]], lab);
  ivText(o.text || 'JUICE', 0, -hb * 0.43, 10.5, '#fff4e4', { track: 0.5 });
  ivDot(w * 0.24, -hb * 0.86, 5, '#f2a640'); ivDot(w * 0.3, -hb * 0.9, 2.5, '#7cae5b');            // a little orange
  ivLine(-w / 2, -hb, w / 2, -hb, 1.4, 'rgba(0,0,0,0.18)'); ivLine(-w / 2 + 1, -2, -w / 2 + 1, -hb, 1.2, 'rgba(255,255,255,0.35)');
  if (o.straw !== false) { ivLine(w * 0.08, -hb - ht * 0.6, w * 0.22, -hb - ht - 26, 4.2, '#e4e0dc'); ivLine(w * 0.22, -hb - ht - 26, w * 0.38, -hb - ht - 32, 4.2, '#e4e0dc');
    ivLine(w * 0.09, -hb - ht * 0.6, w * 0.22, -hb - ht - 26, 1.3, '#e36b6b'); }
  ctx.restore();
}
// P_tray: a cafeteria tray with lunch. anchor: bottom-centre (the tray's underside on the table top). ~240×40 px.
// o.col tray colour, o.food (default true), o.empty
function P_tray(x, y, s = 1, o = {}) {
  const w = 240, c = o.col || '#d9cfc2';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, w * 1.05, 0.35);
  prop_rim(prop_poly([[-w / 2, -12], [w / 2, -12], [w / 2 - 8, 0], [-w / 2 + 8, 0]]), ivShade(c, -0.2), 1.6);
  ivRR(-w / 2, -16, w, 8, 4, c); ivLine(-w / 2 + 6, -15, w / 2 - 6, -15, 1.6, 'rgba(255,255,255,0.45)');
  if (o.food !== false && !o.empty) {
    // plate with mac & cheese
    ctx.beginPath(); ctx.ellipse(-62, -18, 56, 9, 0, 0, TAU); ctx.fillStyle = '#f4efe6'; ctx.fill();
    prop_rim(() => { ctx.beginPath(); ctx.ellipse(-62, -24, 40, 14, 0, Math.PI, 0); ctx.closePath(); }, '#e8a64c', 1.2);
    for (let i = 0; i < 7; i++) ivRR(-90 + i * 8, -30 - (i % 3) * 3, 6, 4, 2, '#f5c56c');
    // a green apple, a sandwich half, a carton of milk
    prop_rim(prop_circ(14, -31, 14), '#7cae5b', 1.2); ivLine(14, -44, 17, -51, 2.4, '#5a3a2a'); ivDot(9, -35, 3.5, 'rgba(255,255,255,0.4)');
    prop_rim(prop_poly([[40, -18], [96, -18], [60, -52]]), '#e9c58a', 1.2); ivPoly([[44, -20], [92, -20], [61, -47]], '#f6e6c4');
    ivLine(48, -23, 88, -23, 3, '#d65a4a'); ivLine(50, -26, 84, -26, 2.4, '#8ec06c');
    ctx.beginPath(); ctx.ellipse(-62, -18, 56, 9, 0, 0, Math.PI); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    ivLine(102, -18, 116, -48, 3, '#c9c3bb'); ivRR(98, -18, 4, 2, 1, '#c9c3bb');                            // a fork
  }
  ctx.restore();
}
// P_juiceSpill: the puddle of juice spreading on the table. anchor: puddle centre on the surface. u 0..1 how far
// it has spread (droplets fly early on). ~260×24 px full. o.col
function P_juiceSpill(x, y, s = 1, u = 1, o = {}) {
  if (u <= 0) return;
  const c = o.col || '#f2a03c', r = RNG('spill').f, e = EZ.o3(clamp(u));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU, k = 1 + 0.18 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 7);
    const px = Math.cos(a) * 130 * e * k, py = Math.sin(a) * 12 * e * k; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = c; ctx.globalAlpha = 0.92; ctx.fill(); ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.ellipse(-20 * e, -3 * e, 70 * e, 4 * e, 0, 0, TAU); ctx.fillStyle = 'rgba(255,240,200,0.45)'; ctx.fill();
  for (let i = 0; i < 9; i++) { const a = r() * TAU, d = (0.9 + r() * 0.5) * 130 * e; ivDot(Math.cos(a) * d, Math.sin(a) * 14 * e, (2 + r() * 4) * e, c); }
  if (u < 0.5) { const f = u / 0.5; for (let i = 0; i < 6; i++) { const vx = (r() - 0.5) * 220, vy = -60 - r() * 60;
    ivDot(vx * f, vy * f + 240 * f * f, 4 + r() * 3, c); } }
  ctx.restore();
}

// ---- school ---------------------------------------------------------------
// P_basketball: anchor: bottom-centre (the contact point). Ø 72 px. o.rot spin angle (defaults to rolling with x)
function P_basketball(x, y, s = 1, o = {}) {
  const R = 36; ctx.save(); ctx.translate(x, y - R * s); ctx.scale(s, s);
  if (o.shadow !== false && !o.air) prop_shadow(0, R, R * 1.8, 0.3);
  prop_rim(prop_circ(0, 0, R), '#d9692c', 1.8); prop_circ(0, 0, R)(); prop_shade(-R, -R, R * 2, R * 2, 0.4);
  ctx.save(); prop_circ(0, 0, R)(); ctx.clip(); ctx.rotate(o.rot ?? x / (R * s));
  ctx.strokeStyle = '#3a1c10'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-R * 1.05, 0, R * 0.62, R * 1.05, 0, -1.2, 1.2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(R * 1.05, 0, R * 0.62, R * 1.05, 0, Math.PI - 1.2, Math.PI + 1.2); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(-R * 0.35, -R * 0.45, R * 0.28, R * 0.14, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,230,200,0.35)'; ctx.fill();
  ctx.restore();
}
// P_quiz: a quiz sheet. anchor: CENTRE. ~80×104 px. o.ang; o.name ('THEO'); o.answers ['PHOTOSYNTHESIS', ...] written
// on the lines in pencil; o.grade (e.g. 'A+') circled in red; o.n questions (5)
function P_quiz(x, y, s = 1, o = {}) {
  const w = 80, h = 104; ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  ivRR(3, 3, w, h, 1.5, 'rgba(0,0,0,0.25)');
  prop_rim(prop_rr(0, 0, w, h, 1.5), '#f7f2e6', 0.8); prop_rr(0, 0, w, h, 1.5)(); prop_shade(0, 0, w, h, 0.12);
  ivLine(9, 0, 9, h, 0.5, 'rgba(214,80,80,0.45)');
  ivText('POP QUIZ', w / 2 + 3, 15, 9.5, '#1e2030', { track: 0.6 });
  ivLine(w / 2 - 20, 18, w / 2 + 26, 18, 0.7, '#1e2030');
  ivText('NAME', 13, 27, 4.2, '#555a6a', { align: 'left', font: IV.sans, weight: 800 }); ivLine(26, 27.5, w - 8, 27.5, 0.4, '#8a8f9e');
  if (o.name) ivText(o.name, 30, 26.6, 5.5, '#4a4f63', { align: 'left', font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400 });
  const n = o.n || 5;
  for (let i = 0; i < n; i++) {
    const yy = 38 + i * 13; ivText((i + 1) + '.', 13, yy, 4.6, '#2a2e40', { align: 'left', font: IV.sans, weight: 800 });
    ivRR(19, yy - 4.2, (w - 30) * (0.5 + 0.4 * ((i * 37) % 5) / 5), 2.2, 1, 'rgba(40,44,64,0.55)');          // the printed question
    ivLine(19, yy + 4.5, w - 8, yy + 4.5, 0.4, '#9aa0b0');
    const A = (o.answers || [])[i]; if (A) ivText(A, 21, yy + 3.6, 5, '#3c4366', { align: 'left', font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400 });
  }
  if (o.grade) { ctx.save(); ctx.strokeStyle = '#d23a32'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(w - 15, h - 13, 10, 7.5, -0.2, 0, TAU); ctx.stroke(); ctx.restore();
    ivText(o.grade, w - 15, h - 10, 8, '#d23a32', { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400 }); }
  ctx.restore();
}
// P_rpsHand: a big glove hand in a rock-paper-scissors shape ('rock' | 'paper' | 'scissors'). anchor: the WRIST,
// fingers pointing up (−y). ~40×72 px. o.ang rotation, o.flip mirror (thumb on the right), o.sleeve cuff colour
// (e.g. CAST.you.col), o.col glove colour (IV.ink)
function P_rpsHand(x, y, s = 1, shape = 'rock', o = {}) {
  const ink = o.col || IV.ink, det = '#2b2a36';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s * (o.flip ? -1 : 1), s);
  const fist = shape === 'rock', sc = shape === 'scissors';
  const fingers = [   // [base x, length, angle] index → pinky (thumb side is −x)
    [-12, fist ? 0 : sc ? 34 : 30, sc ? -0.32 : -0.16], [-4, fist ? 0 : sc ? 36 : 34, sc ? 0.14 : -0.04],
    [4.5, fist || sc ? 0 : 32, 0.08], [12.5, fist || sc ? 0 : 25, 0.22]];
  const draw = (rc) => {
    const c = rc || ink, add = rc ? 0 : 0;
    ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = 'round';
    ivRR(-15, 0, 30, 14, 5, c);                                           // the wrist
    ivRR(-19, -40, 38, 42, fist ? 15 : 13, c);                            // the palm
    fingers.forEach(([bx, L, a]) => { if (!L) return; ctx.lineWidth = 10.5 + add; ctx.beginPath(); ctx.moveTo(bx, -34); ctx.lineTo(bx + Math.sin(a) * L, -34 - Math.cos(a) * L); ctx.stroke(); });
    if (fist || sc) {   // curled fingers: knuckle bumps on top, folded fronts
      (fist ? [-12, -4, 4.5, 12.5] : [4.5, 12.5]).forEach((bx) => { ivDot(bx, -39, 5.6, c); ivRR(bx - 5, -40, 10, 22, 5, c); });
    }
    // the thumb
    ctx.lineWidth = 11 + add; ctx.beginPath();
    if (shape === 'paper') { ctx.moveTo(-14, -12); ctx.lineTo(-30, -28); }
    else { ctx.moveTo(-17, -10); ctx.quadraticCurveTo(-22, -26, fist ? -2 : 6, -28); }
    ctx.stroke();
  };
  prop_rimDo(draw, 2.2);
  // details: finger lines, knuckles, a cuff seam — soft, on the glove
  ctx.lineCap = 'round';
  if (fist || sc) (fist ? [-8, 0.5, 8.5] : [8.5]).forEach((lx) => ivLine(lx, -34, lx, -20, 1.2, det));
  if (fist) ivLine(-10, -18, 14, -18, 1.1, det);
  fingers.forEach(([bx, L, a]) => { if (L) ivLine(bx + Math.sin(a) * L * 0.55 - 3, -34 - Math.cos(a) * L * 0.55, bx + Math.sin(a) * L * 0.55 + 3, -34 - Math.cos(a) * L * 0.55, 1, det); });
  ivLine(-13, -6, 13, -6, 1, det); ivLine(-14, 2, 14, 2, 1.6, '#24232d');
  ctx.beginPath(); ctx.ellipse(8, -30, 6, 3, -0.4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
  if (o.sleeve) { prop_rim(prop_rr(-21, 12, 42, 40, 6), o.sleeve, 2); ivRR(-21, 12, 42, 9, 4, ivShade(o.sleeve, -0.25)); ivRR(-21, 12, 42, 40, 6); prop_shade(-21, 12, 42, 40, 0.3); }
  ctx.restore();
}

// ---- arcade ---------------------------------------------------------------
// P_claw: the claw-machine claw. anchor: the hub top (where the cable meets it); the cable runs up o.cable px (900).
// ~60×90 px. open 0..1 (0 = closed grip, 1 = wide open). o.sway small swing angle
function P_claw(x, y, s = 1, open = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivLine(0, 0, 0, -(o.cable ?? 900) / s, 2.4, '#8d93a2'); ivLine(0.8, 0, 0.8, -(o.cable ?? 900) / s, 0.8, 'rgba(255,255,255,0.5)');
  ctx.rotate(o.sway || 0);
  const steel = '#c9ced8', dark = '#7b8293', a = lerp(0.12, 0.85, clamp(open));
  const prong = (side, c, back) => {
    ctx.save(); ctx.translate(side * 8, 26); ctx.rotate(side * a);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c || (back ? dark : steel); ctx.lineWidth = c ? 8.5 : 6.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * 4, 34); ctx.lineTo(-side * 7, 58); ctx.stroke();
    if (!c) { ivLine(side * 1.2, 2, side * 4.6, 32, 1.4, 'rgba(255,255,255,0.55)'); ivDot(side * 4, 34, 3.6, dark); ivDot(side * 4, 34, 1.4, '#e9edf4'); }
    ctx.restore();
  };
  prong(0.55, null, true);                                                   // the back prong, darker
  prop_rimDo((rc) => { prong(-1, rc); prong(1, rc); ivRR(-17, 0, 34, 28, 7, rc || steel); }, 1.8);
  prong(-1); prong(1);
  ivRR(-17, 0, 34, 28, 7); prop_shade(-17, 0, 34, 28, 0.45);
  ivRR(-17, 9, 34, 4, 1, 'rgba(60,64,80,0.5)'); ivLine(-11, 3, -11, 24, 2, 'rgba(255,255,255,0.6)');
  ivDot(0, 20, 3, '#ff4fb0'); ivGlow(0, 20, 18, 'rgba(255,80,190,0.6)');
  ctx.restore();
}
// P_plush: a stuffed toy. kind 'bear' | 'bunny' | 'star' | 'cat' | 'duck' | 'dino'. anchor: bottom-centre. ~56×60 px.
// o.ang tilt, o.col body colour
const prop_PLUSH = { bear: '#b07a4a', bunny: '#f2a7b8', star: '#f5c84c', cat: '#9aa3b5', duck: '#f7d64a', dino: '#7cc47a' };
function P_plush(x, y, s = 1, kind = 'bear', o = {}) {
  const c = o.col || prop_PLUSH[kind] || '#b07a4a', d = ivShade(c, -0.22), l = ivShade(c, 0.3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, -30); ctx.rotate(o.ang || 0);
  const face = (fy) => { ivDot(-7, fy, 2.6, '#191820'); ivDot(7, fy, 2.6, '#191820'); ivDot(-6.2, fy - 0.9, 0.9, '#fff');
    ivDot(6.8 + 0.8, fy - 0.9, 0.9, '#fff'); ctx.beginPath(); ctx.arc(0, fy + 4, 3, 0.2, Math.PI - 0.2); ctx.strokeStyle = '#191820'; ctx.lineWidth = 1.3; ctx.stroke();
    ivDot(-12, fy + 5, 2.6, 'rgba(255,120,140,0.45)'); ivDot(12, fy + 5, 2.6, 'rgba(255,120,140,0.45)'); };
  if (kind === 'star') {
    const P = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 13 : 31, a = -Math.PI / 2 + i * Math.PI / 5; P.push([Math.cos(a) * r, Math.sin(a) * r + 2]); }
    ctx.lineJoin = 'round'; prop_rim(prop_poly(P), c, 1.8); prop_poly(P)(); ctx.lineWidth = 5; ctx.strokeStyle = c; ctx.stroke(); prop_poly(P)(); prop_shade(-31, -31, 62, 62, 0.25);
    face(0); ctx.restore(); return;
  }
  const body = (rc) => {
    const b = rc || c;
    if (kind === 'bear' || kind === 'cat') { [-1, 1].forEach((k) => { if (kind === 'bear') ivDot(k * 15, -26, 8, b); else ivPoly([[k * 7, -30], [k * 20, -40], [k * 20, -22]], b); }); }
    if (kind === 'bunny') [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(k * 8, -38, 6, 16, k * 0.2, 0, TAU); ctx.fillStyle = b; ctx.fill(); });
    if (kind === 'dino') for (let i = 0; i < 4; i++) ivPoly([[-18 + i * 9, -18 - (i === 1 || i === 2 ? 4 : 0)], [-14 + i * 9, -27 - (i === 1 || i === 2 ? 4 : 0)], [-10 + i * 9, -18 - (i === 1 || i === 2 ? 4 : 0)]], rc || d);
    if (kind === 'duck') { ctx.beginPath(); ctx.ellipse(18, -6, 7, 4, 0.1, 0, TAU); ctx.fillStyle = rc || '#f08a2c'; ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(0, 16, 21, 16, 0, 0, TAU); ctx.fillStyle = b; ctx.fill();          // body
    [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(k * 13, 28, 8, 5.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(k * 21, 12, 5.5, 9, k * -0.5, 0, TAU); ctx.fill(); });
    ctx.beginPath(); ctx.ellipse(0, -10, 21, 18, 0, 0, TAU); ctx.fill();                              // head
  };
  prop_rimDo(body, 1.8);
  ctx.beginPath(); ctx.ellipse(0, -10, 21, 18, 0, 0, TAU); prop_shade(-21, -28, 42, 36, 0.28);
  ctx.beginPath(); ctx.ellipse(0, 16, 21, 16, 0, 0, TAU); prop_shade(-21, 0, 42, 32, 0.3);
  ctx.beginPath(); ctx.ellipse(0, 18, 11, 9, 0, 0, TAU); ctx.fillStyle = l; ctx.fill();                 // belly
  if (kind === 'bear') [-1, 1].forEach((k) => ivDot(k * 15, -26, 4, l));
  if (kind === 'bunny') [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(k * 8, -38, 3, 11, k * 0.2, 0, TAU); ctx.fillStyle = '#fbd6de'; ctx.fill(); });
  ctx.beginPath(); ctx.ellipse(0, -4, 8, 5.5, 0, 0, TAU); ctx.fillStyle = kind === 'duck' ? c : l; ctx.fill();   // muzzle
  if (kind === 'duck') { ctx.beginPath(); ctx.ellipse(0, -3, 7, 3.4, 0, 0, TAU); ctx.fillStyle = '#f08a2c'; ctx.fill(); }
  face(-12);
  ctx.setLineDash([2, 2]); ivLine(0, 6, 0, 28, 0.8, d); ctx.setLineDash([]);
  ctx.restore();
}

// ---- the cable (a screen graphic) ------------------------------------------
// P_cableMap: NEW YORK ↔ CHICAGO, the cable drawing itself on. anchor: the card's CENTRE. 1000×560 px at s = 1.
// u 0..1 how much of the cable is drawn; o.money / o.ms alpha of the "$300,000,000" and "3 ms" labels (default: pop
// in as u passes 0.35 and 0.95); o.a overall alpha
function P_cableMap(x, y, s = 1, u = 1, o = {}) {
  const W2 = 500, H2 = 280; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ivRR(-W2 + 8, -H2 + 14, W2 * 2, H2 * 2, 26, 'rgba(0,0,0,0.4)');
  ivRR(-W2, -H2, W2 * 2, H2 * 2, 26, '#151b2b'); ivRR(-W2, -H2, W2 * 2, H2 * 2, 26, null, 'rgba(255,214,160,0.45)', 2.5);
  ctx.save(); prop_rr(-W2, -H2, W2 * 2, H2 * 2, 26)(); ctx.clip();
  // land, the ocean to the east, the border to the north
  ctx.fillStyle = '#222c44'; ctx.fillRect(-W2, -H2, W2 * 2, H2 * 2);
  for (let gx = -W2; gx < W2; gx += 50) ivLine(gx, -H2, gx, H2, 1, 'rgba(160,190,255,0.06)');
  for (let gy = -H2; gy < H2; gy += 50) ivLine(-W2, gy, W2, gy, 1, 'rgba(160,190,255,0.06)');
  ivPoly([[W2, -H2], [380, -H2], [395, -170], [430, -110], [410, -40], [445, 60], [475, 95], [440, 130], [400, 200], [380, H2], [W2, H2]], '#121827', 'rgba(255,214,160,0.3)', 2);
  ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(-W2, -175); ctx.lineTo(-330, -175); ctx.lineTo(-250, -160); ctx.lineTo(-160, -150); ctx.lineTo(20, -130); ctx.lineTo(200, -150); ctx.lineTo(300, -180); ctx.lineTo(395, -170);
  ctx.strokeStyle = 'rgba(255,214,160,0.25)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  ivText('CANADA', -400, -192, 16, 'rgba(200,210,235,0.3)', { track: 6 }); ivText('ATLANTIC', 450, 230, 14, 'rgba(200,210,235,0.3)', { track: 4 });
  const lake = (P) => ivPoly(P, '#121827', 'rgba(140,180,255,0.25)', 1.5);
  lake([[-330, -150], [-300, -150], [-290, -60], [-305, 0], [-335, -10], [-345, -80]]);                 // Michigan
  lake([[-250, -150], [-180, -130], [-150, -70], [-205, -60], [-235, -100]]);                           // Huron
  lake([[-150, -30], [-40, -70], [20, -80], [10, -55], [-110, -10]]);                                    // Erie
  lake([[60, -110], [170, -125], [180, -105], [70, -90]]);                                               // Ontario
    // the states, faint
  [[-260, 280, -250, -40], [-80, 280, -90, -20], [120, 280, 110, -95], [300, 280, 290, -110]].forEach(([x1, y1, x2, y2]) => ivLine(x1, y1, x2, y2, 1.2, 'rgba(160,190,255,0.10)'));
  // the old route, dashed
  const A = [-310, 30], B = [430, 80];
  ctx.setLineDash([10, 9]); ctx.beginPath(); ctx.moveTo(...A); ctx.bezierCurveTo(-200, 170, 250, 200, ...B); ctx.strokeStyle = 'rgba(200,210,235,0.28)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  ivText('OLD ROUTE', -40, 205, 16, 'rgba(200,210,235,0.4)', { track: 3 });
  // the cable: almost straight, drawn on to u
  const pts = [A, [-200, 22], [-60, 30], [80, 40], [230, 52], [340, 62], B], seg = [];
  let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  const draw = (lw, c) => { let left = tot * clamp(u); ctx.beginPath(); ctx.moveTo(...A); let end = A;
    for (let i = 1; i < pts.length && left > 0; i++) { const k = Math.min(1, left / seg[i - 1]); end = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; ctx.lineTo(...end); left -= seg[i - 1]; }
    ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); return end; };
  if (u > 0) { draw(16, 'rgba(255,170,80,0.18)'); draw(7, '#ffb35a'); const e = draw(2.5, '#fff1d0');
    if (u < 1) { ivDot(e[0], e[1], 7, '#fff6e0'); ivGlow(e[0], e[1], 60, 'rgba(255,190,100,0.9)'); } }
  ctx.restore();
  // cities
  [[A, 'CHICAGO', -1], [B, 'NEW YORK', 1]].forEach(([[cx, cy], name, k]) => {
    ivDot(cx, cy, 13, 'rgba(255,214,160,0.25)'); ivDot(cx, cy, 8, '#ffe2b0'); ivDot(cx, cy, 3.5, '#151b2b');
    ivText(name, cx + (k < 0 ? 4 : -10), cy - 26, 22, '#ffe6c4', { track: 2, align: k < 0 ? 'left' : 'right' });
  });
  ivText('NEW YORK  ↔  CHICAGO', 0, -H2 + 56, 34, '#fbeedd', { glow: 'rgba(255,170,90,0.45)', track: 3 });
  ivLine(-160, -H2 + 74, 160, -H2 + 74, 1.5, 'rgba(255,230,200,0.4)');
  const am = o.money ?? clamp((u - 0.35) * 8), ams = o.ms ?? clamp((u - 0.95) * 20);
  if (am > 0) ivTag('$300,000,000', 40, -40, 34, am, { c: '#ffe2b0' });
  if (ams > 0) ivTag('3 ms', 160, 130, 30, ams, { c: '#7ff0ff', line: 'rgba(127,240,255,0.5)' });
  ctx.restore();
}

// ---- party ----------------------------------------------------------------
// P_cake: a birthday cake on a plate. anchor: bottom-centre (the plate on the table). ~170×130 px with candles.
// lit: true / 0..1 flames; o.n candles (5), o.col frosting
function P_cake(x, y, s = 1, lit = true, o = {}) {
  const w = 140, hh = 62, top = -14 - hh, fr = o.col || '#f4a7c0', sp = ['#fff3c4', '#7fd1ff', '#9be08a', '#ffb35a', '#c79bff'];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, w * 1.4, 0.3);
  ctx.beginPath(); ctx.ellipse(0, -6, w * 0.66, 10, 0, 0, TAU); ctx.fillStyle = '#e9e4dc'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -8, w * 0.6, 7, 0, 0, TAU); ctx.fillStyle = '#f7f3ec'; ctx.fill();
  const body = () => { ctx.beginPath(); ctx.moveTo(-w / 2, top); ctx.lineTo(-w / 2, -12); ctx.ellipse(0, -12, w / 2, 9, 0, Math.PI, 0, true); ctx.lineTo(w / 2, top); ctx.closePath(); };
  prop_rim(body, '#f6e6cf', 1.8); body(); prop_shade(-w / 2, top, w, hh, 0.32);
  ivRR(-w / 2, top + hh * 0.5, w, 7, 0, '#e86f86');                                     // the jam layer
  // frosting top with drips
  ctx.beginPath(); ctx.ellipse(0, top, w / 2 + 2, 11, 0, 0, TAU); ctx.fillStyle = fr; ctx.fill();
  const r = RNG('cake').f;
  for (let i = 0; i < 11; i++) { const dx = -w / 2 + 6 + i * (w - 12) / 10, L = 8 + r() * 16; ivRR(dx - 5, top, 10, L, 5, fr); }
  ctx.beginPath(); ctx.ellipse(-12, top - 3, 36, 5, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  for (let i = 0; i < 22; i++) { const a = r() * TAU, d = Math.sqrt(r()); ivRR(Math.cos(a) * d * w * 0.44 - 2, top + Math.sin(a) * d * 8 - 1, 4, 1.8, 1, sp[i % 5]); }
  const n = o.n || 5, f = lit === true ? 1 : +lit || 0;
  for (let i = 0; i < n; i++) {
    const cx = -w * 0.32 + i * (w * 0.64) / (n - 1), cy = top + (i % 2 ? 3 : -1);
    ivRR(cx - 3, cy - 30, 6, 30, 2, i % 2 ? '#7fd1ff' : '#fff3c4');
    for (let k = 0; k < 3; k++) ivLine(cx - 3, cy - 26 + k * 9, cx + 3, cy - 21 + k * 9, 1.6, i % 2 ? '#fff' : '#ff8a8a');
    ivLine(cx, cy - 30, cx, cy - 35, 1.3, '#2a2028');
    if (f > 0) { const fl = 1 + 0.12 * Math.sin(F * 1.9 + i * 2.1);
      ctx.save(); ctx.globalAlpha *= f; ivGlow(cx, cy - 42, 30, 'rgba(255,190,90,0.7)');
      ctx.beginPath(); ctx.ellipse(cx, cy - 41, 4, 8 * fl, 0, 0, TAU); ctx.fillStyle = '#ffb347'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 39, 2, 4.5 * fl, 0, 0, TAU); ctx.fillStyle = '#fff6d0'; ctx.fill(); ctx.restore(); }
  }
  if (f > 0) ivGlow(0, top - 40, 160, `rgba(255,170,80,${0.25 * f})`);
  ctx.restore();
}
// P_balloon: anchor: the BOTTOM END of the string (tied to a chair, held in a hand). ~64×85 px + 160 px string.
// col colour; o.len string length, o.sway (default: gentle bob with time), o.key varies the bob
function P_balloon(x, y, s = 1, col = '#e5534b', o = {}) {
  const L = o.len ?? 160, ph = hash(o.key ?? (x | 0)) % 100, sw = o.sway ?? Math.sin(TT * 1.3 + ph) * 0.08;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const tx = Math.sin(sw) * L, ty = -Math.cos(sw) * L;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(10, -L * 0.3, -10, -L * 0.6, tx, ty); ctx.strokeStyle = 'rgba(240,230,220,0.75)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.translate(tx, ty); ctx.rotate(sw * 1.4);
  ivPoly([[-5, 2], [5, 2], [0, -6]], ivShade(col, -0.2));
  const b = () => { ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(-46, -20, -36, -88, 0, -88); ctx.bezierCurveTo(36, -88, 46, -20, 0, -4); ctx.closePath(); };
  prop_rim(b, col, 1.8); b(); prop_shade(-36, -88, 72, 84, 0.35);
  ctx.beginPath(); ctx.ellipse(-12, -64, 7, 13, 0.5, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
  ivDot(-4, -76, 2.5, 'rgba(255,255,255,0.7)');
  ctx.restore();
}

// ---- street ---------------------------------------------------------------
// P_ball: a kid's rubber ball. anchor: bottom-centre. Ø 58 px. o.rot (defaults to rolling with x), o.col, o.air (no shadow)
function P_ball(x, y, s = 1, o = {}) {
  const R = 29, c = o.col || '#e2483d'; ctx.save(); ctx.translate(x, y - R * s); ctx.scale(s, s);
  if (!o.air) prop_shadow(0, R, R * 1.8, 0.3);
  prop_rim(prop_circ(0, 0, R), c, 1.6);
  ctx.save(); prop_circ(0, 0, R)(); ctx.clip(); ctx.rotate(o.rot ?? x / (R * s));
  ctx.fillStyle = '#f6eedd'; ctx.fillRect(-R, -7, R * 2, 14); ctx.fillStyle = '#2f6fd0'; ctx.fillRect(-R, -2.5, R * 2, 5);
  const P = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 11, a = -Math.PI / 2 + i * Math.PI / 5; P.push([Math.cos(a) * r, Math.sin(a) * r - 17]); } ivPoly(P, '#ffd34d');
  ctx.restore(); prop_circ(0, 0, R)(); prop_shade(-R, -R, R * 2, R * 2, 0.4);
  ctx.beginPath(); ctx.ellipse(-R * 0.35, -R * 0.45, R * 0.26, R * 0.13, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
  ctx.restore();
}
// a spoked wheel at (cx, cy), radius R, spin a
function prop_wheel(cx, cy, R, a, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  prop_rimDo((rc) => { ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.lineWidth = R * 0.13; ctx.strokeStyle = rc || o.tire || '#17161d'; ctx.stroke(); }, R * 0.02);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.9, 0, TAU); ctx.lineWidth = R * 0.035; ctx.strokeStyle = o.rim || '#9aa0ad'; ctx.stroke();
  ctx.rotate(a); ctx.lineWidth = Math.max(0.6, R * 0.011); ctx.strokeStyle = 'rgba(200,205,215,0.8)';
  for (let i = 0; i < 16; i++) { const t = (i / 16) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(t) * R * 0.08, Math.sin(t) * R * 0.08); ctx.lineTo(Math.cos(t + 0.35) * R * 0.88, Math.sin(t + 0.35) * R * 0.88); ctx.stroke(); }
  ivDot(0, 0, R * 0.09, '#5a5f6c'); ivDot(0, 0, R * 0.04, '#c9ced8'); ivDot(R * 0.88, 0, R * 0.025, '#d8dce4');
  ctx.restore();
}
// P_bike: a bicycle, side view. anchor: bottom-centre (both tyres on y). ~560×320 px. o.dir 1 faces right / −1 left,
// o.rot wheel spin (defaults to rolling with x), o.col frame colour. P_bikeRider(x, y, s, o) draws it with a rider.
const prop_BIKE = { ax: 175, R: 100, bb: [-25, -95], seat: [-95, -300], bar: [135, -322], head: [118, -272] };
function P_bike(x, y, s = 1, o = {}) {
  const B = prop_BIKE, R = B.R, c = o.col || '#2f9c9a', rot = o.rot ?? x / (R * s) * (o.dir || 1);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  prop_shadow(0, 0, 520, 0.25);
  prop_wheel(-B.ax, -R, R, rot); prop_wheel(B.ax, -R, R, rot);
  const bb = B.bb, st = [-82, -268], ht = B.head, hb = [128, -222];
  const tubes = (rc) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const L = (a, b, w) => ivLine(a[0], a[1], b[0], b[1], w, rc || c);
    L(bb, st, 13); L(st, ht, 12); L(bb, hb, 14); L(bb, [-B.ax, -R], 9); L(st, [-B.ax, -R], 8); L(ht, hb, 15); L(hb, [B.ax, -R], 9);
    L(ht, [ht[0] - 8, -306], 8); L([ht[0] - 8, -306], B.bar, 8); L(st, [-90, -290], 8); };
  prop_rimDo(tubes, 1.8);
  ivLine(st[0] + 3, st[1] + 2, ht[0] - 4, ht[1] + 2, 2.4, 'rgba(255,255,255,0.35)'); ivLine(bb[0] + 3, bb[1] - 4, hb[0] - 3, hb[1] + 2, 2.4, 'rgba(255,255,255,0.3)');
  prop_dText((o.dir || 1), 'SWIFT', 40, -238, 14, 'rgba(255,255,255,0.85)', { track: 2 });
  ivRR(B.seat[0] - 40, B.seat[1] - 6, 70, 13, 6, '#1d1c24'); ivRR(B.bar[0] - 4, B.bar[1] - 7, 34, 14, 7, '#1d1c24');      // saddle, grip
  ivLine(B.bar[0] - 2, B.bar[1] + 6, B.bar[0] + 22, B.bar[1] + 22, 2.5, '#2a2a33');                                     // brake lever
  // chainring, chain, crank and pedals
  ctx.beginPath(); ctx.arc(bb[0], bb[1], 24, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = '#8a909c'; ctx.stroke();
  ivLine(bb[0], bb[1] - 24, -B.ax, -R - 10, 2, '#4a4e58'); ivLine(bb[0], bb[1] + 24, -B.ax, -R + 10, 2, '#4a4e58');
  const ca = rot * 0.6, p1 = [bb[0] + Math.cos(ca) * 42, bb[1] + Math.sin(ca) * 42], p2 = [bb[0] - Math.cos(ca) * 42, bb[1] - Math.sin(ca) * 42];
  ivLine(bb[0], bb[1], p2[0], p2[1], 6, '#3a3d46'); ivRR(p2[0] - 12, p2[1] - 4, 24, 8, 3, '#25262e');
  ivLine(bb[0], bb[1], p1[0], p1[1], 7, '#6b707c'); ivRR(p1[0] - 13, p1[1] - 4, 26, 8, 3, '#1d1e25'); ivDot(bb[0], bb[1], 7, '#c9ced8');
  ivRR(-B.ax - 14, -R - 70, 10, 26, 3, '#e5352b'); ivDot(B.ax + 30, -282, 7, '#fff4cc');                                  // reflector, lamp
  ctx.restore();
}
// P_bikeRider: the bike with a rider pedalling. o.who (CAST.cyclist), o.h actor height (520·s), o.dir, o.rot, o.expr,
// o.lean extra torso lean, o.pose overrides (e.g. { hR: … } for a hand off the bar). Same anchor as P_bike.
function P_bikeRider(x, y, s = 1, o = {}) {
  const B = prop_BIKE, dir = o.dir || 1, h = o.h ?? 520 * s * 0.92, who = o.who || CAST.cyclist, f = 0.5 * dir;
  const rot = o.rot ?? x / (B.R * s) * dir, W = (p) => [x + p[0] * s * dir, y + p[1] * s];
  P_bike(x, y, s, { ...o, rot });
  const lean = 0.42 + (o.lean || 0), dip = 0.14, seat = W([B.seat[0] + 6, B.seat[1] - 6]);
  const hip = [seat[0], seat[1]], yy = hip[1] + h * (0.45 - dip), sg = dir;
  const shC = [hip[0] + Math.sin(lean) * sg * 0.235 * h, hip[1] - Math.cos(lean) * 0.235 * h], sw = 0.066 * h * (1 - 0.55 * 0.5) * (who.build || 1);
  const shR = [shC[0] + sw * sg, shC[1]], shL = [shC[0] - sw * sg, shC[1]], hw = 0.034 * h * (1 - 0.25);
  const hipR = [hip[0] + hw * sg, hip[1]], hipL = [hip[0] - hw * sg, hip[1]];
  const bar = W([B.bar[0] + 8, B.bar[1]]), ca = rot * 0.6, bb = B.bb;
  const p1 = W([bb[0] + Math.cos(ca) * 42, bb[1] + Math.sin(ca) * 42 - 6]), p2 = W([bb[0] - Math.cos(ca) * 42, bb[1] - Math.sin(ca) * 42 - 6]);
  const rel = (p, b) => [(p[0] - b[0]) / h * sg, (p[1] - b[1]) / h];
  const pose = { ...IV_POSES.stand, hL: rel(bar, shL), hR: rel(bar, shR), fL: rel(p2, hipL), fR: rel(p1, hipR), lean, dip, seat: true, ...(o.pose || {}) };
  ivMan({ who, x: hip[0], y: yy, h, f, pose, expr: o.expr || { eyes: 'open', mouth: 'flat' }, grip: { front: 'hold', back: 'hold' }, blinkKey: 'bike' });
}

// P_car: a parked hatchback, side view. anchor: bottom-centre. ~1200×420 px. o.dir 1 nose right / −1 left,
// o.col body colour, o.door 0..1 the front door swinging open toward the camera (hinged at its front edge),
// o.driver (CAST entry) a head seen through the window, o.lights headlights on
function P_car(x, y, s = 1, o = {}) {
  const c = o.col || '#c8503f', dk = ivShade(c, -0.3), R = 92, wx = [-375, 385];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  prop_shadow(0, 0, 1240, 0.4);
  const body = () => { ctx.beginPath(); ctx.moveTo(-600, -95); ctx.lineTo(-610, -200); ctx.quadraticCurveTo(-600, -262, -520, -272); ctx.lineTo(-400, -276);
    ctx.lineTo(-300, -405); ctx.quadraticCurveTo(-280, -420, -240, -420); ctx.lineTo(120, -420); ctx.quadraticCurveTo(160, -418, 190, -395); ctx.lineTo(330, -280);
    ctx.lineTo(540, -255); ctx.quadraticCurveTo(605, -245, 608, -190); ctx.lineTo(600, -95); ctx.closePath(); };
  prop_rim(body, c, 3); body(); prop_shade(-610, -420, 1220, 330, 0.35);
  ivPoly([[-600, -150], [600, -150], [600, -95], [-600, -95]], dk);                                          // the sill
  ivLine(-560, -250, 530, -235, 3, 'rgba(255,255,255,0.28)');                                                // shoulder line
  // the glass
  const glass = ivVGrad(-410, -280, ['#2b3346', '#1a2030']);
  ivPoly([[-385, -284], [-292, -398], [-62, -398], [-62, -284]], glass); ivPoly([[-40, -284], [-40, -398], [112, -398], [172, -385], [300, -284]], glass);
  ctx.save(); ctx.globalAlpha = 0.16; ivPoly([[-300, -398], [-250, -398], [-340, -284], [-385, -284]], '#fff'); ivPoly([[30, -398], [70, -398], [0, -284], [-40, -284]], '#fff'); ctx.restore();
  if (o.driver) { prop_rim(prop_circ(80, -335, 40), IV.ink, 2); }
  ivRR(-62, -400, 22, 310, 4, dk);                                                                           // B-pillar
  // wheels in their arches
  wx.forEach((ax) => { ctx.beginPath(); ctx.arc(ax, -R, R + 18, Math.PI, 0); ctx.lineTo(ax + R + 18, -80); ctx.lineTo(ax - R - 18, -80); ctx.fillStyle = '#121119'; ctx.fill();
    ctx.save(); ctx.translate(ax, -R); ivDot(0, 0, R, '#17161d'); ivDot(0, 0, R * 0.6, '#9aa0ad'); ivDot(0, 0, R * 0.52, '#c9ced8');
    for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + 0.3; ivLine(0, 0, Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, 9, '#8a909c'); }
    ivDot(0, 0, R * 0.14, '#5a5f6c'); ctx.beginPath(); ctx.arc(0, 0, R * 0.8, -2.4, -1.1); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); });
  // lights, handle, mirror
  ivRR(560, -232, 44, 30, 10, '#fff2c4'); ivRR(-612, -240, 22, 46, 6, '#d6302a'); ivRR(-612, -240, 22, 14, 4, '#f08a3a');
  if (o.lights) ivGlow(600, -215, 260, 'rgba(255,240,190,0.55)');
  ivRR(-560, -190, 50, 10, 3, '#e9e4dc');
  ivRR(-280, -235, 48, 12, 6, dk);
  ivPoly([[285, -300], [330, -300], [326, -270], [292, -272]], dk);
  // the front door, from the B-pillar (x −40) to its hinge at x 300
  const d = clamp(o.door || 0), th = d * 1.2, hx = 300, dw = 340;
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  if (d <= 0.01) { ctx.beginPath(); ctx.moveTo(-40, -110); ctx.lineTo(-40, -284); ctx.moveTo(300, -110); ctx.lineTo(310, -276); ctx.moveTo(-40, -110); ctx.lineTo(300, -110); ctx.stroke(); ivRR(10, -240, 48, 12, 6, dk); }
  else {
    ivPoly([[-40, -284], [-40, -110], [300, -110], [304, -282]], '#1a1820');                                // the opening, dark
    ivRR(-30, -270, 120, 150, 20, '#2c2a33'); ivRR(60, -200, 160, 60, 14, '#25232b');                       // the seat
    const fx = hx - dw * Math.cos(th), grow = dw * Math.sin(th) * 0.16, inner = th > 0.35;
    const P = [[hx, -110], [hx + 4, -282], [hx - 18, -296], [fx + 24, -412 - grow * 1.2], [fx, -398 - grow], [fx, -100 + grow], [hx, -96]];
    prop_rim(prop_poly(P), inner ? '#5a5560' : c, 3); prop_poly(P)(); prop_shade(fx, -412 - grow, hx - fx, 316 + grow * 2, 0.35);
    if (inner) { ivPoly([[hx - 10, -250], [fx + 10, -250 - grow * 0.5], [fx + 10, -120 + grow * 0.8], [hx - 10, -120]], '#47434d'); ivRR(lerp(fx, hx, 0.3), -210, 40, 10, 5, '#2b2930'); }
    else ivPoly([[hx - 4, -284], [fx + 14, -396 - grow], [fx + 6, -290 - grow * 0.4]], glass);
    ivLine(fx, -398 - grow, fx, -100 + grow, 4, 'rgba(255,255,255,0.25)');
  }
  ctx.restore();
}
// P_paintCan: a paint can with a wire handle. anchor: bottom-centre. ~40×46 px. o.col paint colour, o.ang tilt,
// o.hang draw the handle up (hanging), o.lid false = open with paint showing
function P_paintCan(x, y, s = 1, o = {}) {
  const c = o.col || '#4aa3d8'; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, -22); ctx.rotate(o.ang || 0); ctx.translate(0, 22);
  ctx.beginPath(); ctx.moveTo(-19, -40); ctx.quadraticCurveTo(0, o.hang ? -78 : -18, 19, -40); ctx.strokeStyle = '#6a6f7a'; ctx.lineWidth = 2; ctx.stroke();
  prop_rim(prop_rr(-20, -42, 40, 42, 3), '#c9ced8', 1.4); prop_rr(-20, -42, 40, 42, 3)(); prop_shade(-20, -42, 40, 42, 0.4);
  ivRR(-20, -32, 40, 22, 0, '#f3ecdc'); ivRR(-20, -16, 40, 6, 0, c); ivDot(0, -23, 6, c); ivText('PAINT', 0, -26, 6, '#2a2e40');
  ctx.beginPath(); ctx.ellipse(0, -42, 20, 4, 0, 0, TAU); ctx.fillStyle = o.lid === false ? c : '#aeb3bd'; ctx.fill();
  ivLine(-20, -1, 20, -1, 2, 'rgba(0,0,0,0.25)'); ivLine(-17, -38, -17, -4, 1.5, 'rgba(255,255,255,0.5)');
  ivLine(-8, -42, -10, -30, 4, c); ivDot(-10, -30, 3, c);                                                     // a drip
  ctx.restore();
}
// P_ladder: an aluminium ladder leaning on a wall to its right. anchor: the FOOT (centre between the rails).
// ~70×900 px. tilt 0 = resting safely against the wall, → 1 = tipping back and falling away (to the left);
// o.dir −1 mirrors (wall on the left); o.can (default true) a paint can hanging on the top rung; o.len
function P_ladder(x, y, s = 1, tilt = 0, o = {}) {
  const L = o.len || 900, wd = 70, ang = lerp(0.2, -1.25, EZ.i2(tilt)), dir = o.dir || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  prop_shadow(0, 0, 120, 0.3);
  ctx.save(); ctx.rotate(ang);
  const draw = (rc) => { const c = rc || '#c3c8d0';
    for (let yy = -60; yy > -L + 20; yy -= 75) ivRR(-wd / 2, yy - 5, wd, 10, 3, rc || '#a9afb9');
    ivRR(-wd / 2 - 9, -L, 11, L, 4, c); ivRR(wd / 2 - 2, -L, 11, L, 4, c); };
  prop_rimDo(draw, 2.4);
  ivRR(-wd / 2 - 7, -L, 3, L, 1.5, 'rgba(255,255,255,0.45)'); ivRR(wd / 2 + 6, -L, 3, L, 1.5, 'rgba(0,0,0,0.2)');
  [-wd / 2 - 3.5, wd / 2 + 3.5].forEach((fx) => { ivRR(fx - 10, -14, 20, 16, 4, '#2a2830'); ivRR(fx - 7, -L - 6, 14, 14, 5, '#2a2830'); });
  ivRR(-12, -360, 24, 60, 3, '#f2c230'); ivText('!', 0, -322, 30, '#2a2830');                                  // safety label
  ctx.restore();
  if (o.can !== false) {   // the can hangs straight down from the top rung, whatever the tilt
    const ty = -L + 95, hx = -ty * Math.sin(ang), hy = Math.cos(ang) * ty;
    ctx.save(); ctx.translate(hx, hy); ctx.scale(dir, 1); P_paintCan(0, 104, 1.3, { hang: true, col: o.canCol }); ctx.restore();
  }
  ctx.restore();
}

// ---- traffic ----------------------------------------------------------------
// a heavy wheel (truck / bus / scooter)
function prop_hwheel(cx, cy, R, rot = 0, hub = '#b9bec8') {
  ctx.save(); ctx.translate(cx, cy); ivDot(0, 0, R, '#141319'); ivDot(0, 0, R * 0.92, '#1d1c23');
  ivDot(0, 0, R * 0.56, ivShade(hub, -0.25)); ivDot(0, 0, R * 0.48, hub); ctx.rotate(rot);
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ivDot(Math.cos(a) * R * 0.32, Math.sin(a) * R * 0.32, R * 0.045, '#6a6f7a'); }
  ivDot(0, 0, R * 0.16, '#6a6f7a'); ctx.rotate(-rot);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.82, -2.5, -1.2); ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = R * 0.06; ctx.stroke();
  ctx.restore();
}
// P_truck: a box truck, side view, "RAPIDO FREIGHT". anchor: bottom-centre. ~1750×900 px. o.dir 1 nose right / −1 left,
// o.lights headlights (default true), o.beam a light cone ahead, o.driver false, o.rot wheel spin (defaults to rolling with x), o.col box colour, o.cab cab colour
function P_truck(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, rot = o.rot ?? x / (78 * s) * dir, box = o.col || '#e9e4da', cab = o.cab || '#d64933', R = 78;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  prop_shadow(0, 0, 1800, 0.45);
  ivRR(-850, -230, 1650, 40, 6, '#2a2930');                                                                   // chassis
  // the box
  const bx = () => { ctx.beginPath(); ctx.roundRect(-870, -880, 1180, 660, 12); };
  prop_rim(bx, box, 4); bx(); prop_shade(-870, -880, 1180, 660, 0.3);
  for (let i = 1; i < 8; i++) ivLine(-870 + i * 147, -870, -870 + i * 147, -230, 2, 'rgba(0,0,0,0.06)');
  ivRR(-870, -880, 1180, 18, 8, ivShade(box, -0.12)); ivRR(-870, -250, 1180, 26, 4, ivShade(box, -0.3));
  // the logo: speed stripes + the name
  ctx.save(); ctx.translate(-280, -560);
  ['#e8622c', '#f2a03c', '#d6302a'].forEach((c, i) => ivPoly([[-520, -80 + i * 34], [380, -80 + i * 34], [350, -56 + i * 34], [-520, -56 + i * 34]], c));
  ctx.restore();
  prop_dText((o.dir || 1), 'RAPIDO', -280, -390, 150, '#1d2a4a', { track: 4 });
  prop_dText((o.dir || 1), 'FREIGHT', -280, -310, 64, '#d6302a', { track: 26 });
  ivPoly([[150, -470], [230, -510], [230, -430]], '#e8622c');
  [-840, -560, -280, 0, 280].forEach((mx) => { ivDot(mx, -872, 8, '#ffb347'); ivGlow(mx, -872, 40, 'rgba(255,170,60,0.6)'); });   // marker lights
  // the cab
  const cb = () => { ctx.beginPath(); ctx.moveTo(330, -230); ctx.lineTo(330, -720); ctx.quadraticCurveTo(330, -760, 380, -760); ctx.lineTo(620, -760);
    ctx.quadraticCurveTo(660, -758, 680, -720); ctx.lineTo(760, -470); ctx.quadraticCurveTo(830, -460, 840, -400); ctx.lineTo(850, -230); ctx.closePath(); };
  prop_rim(cb, cab, 4); cb(); prop_shade(330, -760, 520, 530, 0.35);
  const gl = ivVGrad(-730, -480, ['#2b3346', '#1a2030']);
  ivPoly([[380, -720], [640, -720], [712, -490], [380, -490]], gl);
  ctx.save(); ctx.globalAlpha = 0.18; ivPoly([[560, -720], [610, -720], [470, -490], [420, -490]], '#fff'); ctx.restore();
  if (o.driver !== false) { prop_rim(prop_circ(560, -580, 48), IV.ink, 2); ivRR(500, -540, 120, 60, 26, IV.ink); }
  ivLine(330, -470, 760, -470, 3, 'rgba(0,0,0,0.25)'); ivLine(420, -460, 420, -240, 3, 'rgba(0,0,0,0.25)'); ivRR(450, -440, 50, 12, 6, ivShade(cab, -0.35));
  ivRR(690, -780, 14, 150, 4, '#2a2930'); ivRR(676, -700, 34, 70, 6, '#2a2930');                              // mirror
  ivRR(790, -420, 60, 170, 8, '#2a2930'); for (let i = 0; i < 5; i++) ivLine(796, -400 + i * 30, 844, -400 + i * 30, 4, '#4a4952');   // grille
  ivRR(800, -260, 70, 50, 10, '#3a3942');                                                                     // bumper
  ivRR(560, -310, 200, 70, 14, '#3a3942'); ivRR(380, -250, 80, 14, 4, '#3a3942');                             // fuel tank, step
  ivRR(820, -440, 40, 44, 10, '#fff6d6');
  if (o.lights !== false) { ivGlow(860, -420, 420, 'rgba(255,240,190,0.55)'); ivGlow(860, -420, 120, 'rgba(255,250,230,0.8)'); }
  if (o.beam) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18; ivPoly([[860, -440], [1900, -620], [1900, -60], [860, -400]], '#fff2c8'); ctx.restore(); }
  ivRR(-878, -380, 16, 60, 4, '#d6302a');
  // wheels in arches
  [[640, 1], [-560, 2], [-400, 2]].forEach(([wx]) => { ctx.beginPath(); ctx.arc(wx, -R, R + 14, Math.PI, 0); ctx.fillStyle = '#141319'; ctx.fill(); prop_hwheel(wx, -R, R, rot); });
  ctx.restore();
}
// P_scooter: an e-scooter with a standing rider. anchor: bottom-centre. ~360×560 px with rider. o.dir, o.who
// (CAST.extraB), o.h rider height (520·s), o.rider false = scooter only, o.speed 0..1 speed lines, o.expr, o.rot
function P_scooter(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, rot = o.rot ?? x / (32 * s) * dir, W = (p) => [x + p[0] * s * dir, y + p[1] * s];
  if (o.speed) { ctx.save(); ctx.globalAlpha *= o.speed; for (let i = 0; i < 5; i++) ivLine(x - dir * (220 + i * 30) * s, y - (90 + i * 85) * s, x - dir * (520 + i * 50) * s, y - (90 + i * 85) * s, 5 * s, 'rgba(255,240,220,0.5)'); ctx.restore(); }
  if (o.rider !== false) {
    const who = o.who || CAST.extraB, h = o.h ?? 520 * s, f = 0.5 * dir, sg = dir, lean = 0.14;
    const hipY = y - 26 * s - h * 0.45, hip = [x - 10 * s * dir, hipY];
    const shC = [hip[0] + Math.sin(lean) * sg * 0.235 * h, hip[1] - Math.cos(lean) * 0.235 * h], sw = 0.066 * h * 0.725 * (who.build || 1);
    const bar = W([128, -322]), rel = (p, b) => [(p[0] - b[0]) / h * sg, (p[1] - b[1]) / h];
    const pose = { ...IV_POSES.stand, hL: rel(bar, [shC[0] - sw * sg, shC[1]]), hR: rel(bar, [shC[0] + sw * sg, shC[1]]), fL: [-0.08, 0.45], fR: [0.1, 0.45], lean, ...(o.pose || {}) };
    ivMan({ who, x: hip[0], y: y - 26 * s, h, f, pose, expr: o.expr || { eyes: 'open', mouth: 'flat' }, grip: { front: 'hold', back: 'hold' }, blinkKey: 'scoot' });
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  if (!o.rider) prop_shadow(0, 0, 340, 0.3);
  prop_rimDo((rc) => { ivRR(-140, -40, 260, 18, 8, rc || '#2a2930'); ivLine(112, -34, 140, -322, 12, rc || '#3a3942'); ivLine(140, -322, 110, -330, 9, rc || '#3a3942'); ivLine(140, -322, 165, -320, 9, rc || '#3a3942'); }, 1.8);
  ivRR(-136, -44, 250, 6, 3, '#4a4952'); ivLine(118, -60, 136, -300, 2, 'rgba(255,255,255,0.3)');
  ivRR(-60, -36, 120, 10, 3, '#1d1c23'); ivLine(-50, -32, 50, -32, 2, '#5df0a8');
  ivDot(150, -250, 6, '#fff6d6'); ivGlow(150, -250, 60, 'rgba(255,240,190,0.5)'); ivRR(-146, -50, 10, 10, 2, '#e5352b');
  ctx.beginPath(); ctx.moveTo(-150, -26); ctx.quadraticCurveTo(-150, -66, -110, -64); ctx.strokeStyle = '#2a2930'; ctx.lineWidth = 5; ctx.stroke();
  prop_hwheel(-118, -32, 32, rot, '#8a909c'); prop_hwheel(128, -32, 32, rot, '#8a909c');
  ctx.restore();
}
// P_bus: the LINE 9 city bus, side view. anchor: bottom-centre. ~3000×880 px. o.dir 1 nose right / −1 left,
// o.brake 0..1 brake lights + the nose dipping, o.lit interior lights (default true), o.rot wheels, o.pax false = empty
function P_bus(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, br = clamp(o.brake || 0), R = 95, rot = o.rot ?? x / (R * s) * dir, body = o.col || '#e8e4d8', blue = '#2f5f9e';
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  prop_shadow(0, 0, 3100, 0.5);
  [-950, 1000].forEach((wx) => { ctx.beginPath(); ctx.arc(wx, -R, R + 16, Math.PI, 0); ctx.fillStyle = '#141319'; ctx.fill(); prop_hwheel(wx, -R, R, rot); });
  ctx.save(); ctx.translate(-950, -R); ctx.rotate(br * 0.008); ctx.translate(950, R);       // the nose dips on the brake
  const bd = () => { ctx.beginPath(); ctx.roundRect(-1500, -880, 2990, 690, [40, 70, 20, 20]); };
  // wheel arches cut out of the body
  ctx.save(); ctx.beginPath(); ctx.rect(-2000, -2000, 4000, 4000); [-950, 1000].forEach((wx) => { ctx.moveTo(wx + R + 16, -R); ctx.arc(wx, -R, R + 16, 0, Math.PI, true); });
  ctx.clip('evenodd'); prop_rim(bd, body, 5); bd(); prop_shade(-1500, -880, 2990, 690, 0.3);
  ivRR(-1500, -330, 2990, 70, 0, blue); ivRR(-1500, -258, 2990, 16, 0, '#f2c230'); ivRR(-1500, -242, 2990, 52, [0, 0, 20, 20], '#3a3942');
  ctx.restore();
  // windows, lit, with passengers
  const lit = o.lit !== false, r = RNG('busPax').f;
  for (let i = 0; i < 9; i++) {
    const wx = -1440 + i * 250; if (wx > 760) break; if (i === 5) continue;     // the middle door at i = 5
    ivRR(wx, -790, 220, 300, 14, lit ? ivVGrad(-790, -490, ['#ffe2a6', '#f2b76a']) : '#2b3346');
    if (lit && o.pax !== false && r() < 0.6) { const px = wx + 50 + r() * 120; prop_circ(px, -600, 38)(); ctx.fillStyle = IV.ink; ctx.fill(); ivRR(px - 40, -570, 80, 90, 30, IV.ink); }
    ivRR(wx, -800, 220, 14, 6, '#2a2930'); ivLine(wx + 4, -700, wx + 216, -700, 6, 'rgba(60,55,60,0.45)');
    ctx.save(); ctx.globalAlpha = 0.18; ivPoly([[wx + 140, -790], [wx + 180, -790], [wx + 60, -490], [wx + 20, -490]], '#fff'); ctx.restore();
  }
  if (lit) ivGlow(-300, -640, 1300, 'rgba(255,200,120,0.18)');
  // doors (middle + front)
  [[-190, 200], [880, 210]].forEach(([dx, dw]) => { ivRR(dx, -800, dw, 600, 10, '#2a2930');
    ivRR(dx + 10, -790, dw / 2 - 15, 580, 6, lit ? '#e8c48a' : '#2b3346'); ivRR(dx + dw / 2 + 5, -790, dw / 2 - 15, 580, 6, lit ? '#e8c48a' : '#2b3346');
    ivLine(dx + dw / 2, -790, dx + dw / 2, -210, 6, '#1d1c23'); });
  // the front: windshield + the route sign
  ivPoly([[1130, -790], [1430, -790], [1470, -700], [1470, -420], [1130, -420]], ivVGrad(-790, -420, ['#2b3346', '#1a2030']));
  ctx.save(); ctx.globalAlpha = 0.18; ivPoly([[1300, -790], [1350, -790], [1220, -420], [1170, -420]], '#fff'); ctx.restore();
  ivRR(1130, -860, 330, 56, 8, '#14130f'); prop_dText((o.dir || 1), '9  MAIN ST', 1295, -818, 36, '#ffb347', { font: IV.sans, glow: 'rgba(255,170,60,0.9)', track: 3 });
  ivRR(-1450, -860, 120, 56, 8, '#14130f'); prop_dText((o.dir || 1), '9', -1390, -816, 44, '#ffb347', { font: IV.sans, glow: 'rgba(255,170,60,0.9)' });
  prop_dText((o.dir || 1), '9', 1040, -420, 110, blue); prop_dText((o.dir || 1), 'CITY TRANSIT', 300, -280, 44, '#ffffff', { track: 8 });
  ivRR(1460, -330, 34, 60, 10, '#fff6d6'); ivGlow(1480, -300, 260, 'rgba(255,240,190,0.5)');
  ivRR(1470, -880, 30, 140, 6, '#2a2930');
  // the rear: brake lights
  ivRR(-1506, -400, 22, 110, 6, br > 0.05 ? '#ff3b2f' : '#8a1d1a');
  if (br > 0.05) { ivGlow(-1500, -345, 380, `rgba(255,50,30,${0.75 * br})`); ivGlow(-1500, -345, 90, `rgba(255,140,120,${br})`); }
  ivRR(-1490, -760, 26, 30, 6, br > 0.05 ? '#ff3b2f' : '#8a1d1a');
  ctx.restore(); ctx.restore();
}
// P_trafficLight: anchor: the FOOT of the pole (~ 680 px tall); o.head: draw only the signal head, anchor = its centre
// (for close-ups). state 'red' | 'yellow' | 'green' | 'off'. ~84×230 px head. o.glow (1) strength
function P_trafficLight(x, y, s = 1, state = 'red', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.head) { prop_rimDo((rc) => { ivRR(-9, -560, 18, 560, 6, rc || '#23252e'); ivRR(-18, -14, 36, 14, 4, rc || '#1a1b22'); }, 2);
    ivLine(-4, -550, -4, -10, 2, 'rgba(255,255,255,0.15)'); ivRR(-14, -300, 28, 50, 4, '#e9e4dc'); ivText('PUSH', 0, -270, 8, '#2a2e40');
    ctx.translate(0, -560 - 115); }
  const g = o.glow ?? 1, lamps = [['red', '#ff3b30', '#4a1512'], ['yellow', '#ffc43a', '#4a3810'], ['green', '#38e07b', '#0f3a22']];
  prop_rim(prop_rr(-42, -115, 84, 230, 14), '#1c1e27', 3);
  ivRR(-52, -125, 104, 250, 18, null, '#f2c230', 6);                                                         // the reflective border
  ivRR(-42, -115, 84, 230, 14); prop_shade(-42, -115, 84, 230, 0.4);
  lamps.forEach(([k, on, off], i) => {
    const ly = -72 + i * 72, lit = k === state;
    ivDot(0, ly, 28, '#0c0d12'); ivDot(0, ly, 24, lit ? on : off);
    if (lit) { ivDot(0, ly, 15, ivShade(on, 0.45)); ivDot(-8, ly - 8, 5, 'rgba(255,255,255,0.7)'); ivGlow(0, ly, 150 * g, ivHex(on, 0.6)); ivGlow(0, ly, 50, ivHex(on, 0.9)); }
    else { ivDot(-8, ly - 8, 4, 'rgba(255,255,255,0.12)'); }
    ctx.beginPath(); ctx.arc(0, ly, 32, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 7; ctx.strokeStyle = '#14151c'; ctx.stroke();   // the visor
  });
  ctx.restore();
}

// ---- the bus fall ----------------------------------------------------------
// P_cane: a walking cane with a crook. anchor: its CENTRE (it flies and spins). ~300 px long. o.ang (0 = upright, crook up)
function P_cane(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.ang || 0);
  const c = o.col || '#7a4a2e';
  prop_rimDo((rc) => { ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(0, -120); ctx.arc(-26, -120, 26, 0, Math.PI, true); ctx.lineTo(-52, -108);
    ctx.lineWidth = 11; ctx.strokeStyle = rc || c; ctx.stroke(); }, 1.8);
  ctx.beginPath(); ctx.moveTo(-2.5, 146); ctx.lineTo(-2.5, -118); ctx.arc(-26, -120, 23.5, -0.1, Math.PI * 0.8, true); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,220,180,0.35)'; ctx.stroke();
  ivRR(-6.5, 140, 13, 16, 4, '#1d1c23'); ivRR(-6, -60, 12, 6, 2, '#c9a24a');
  ctx.restore();
}
// P_bags: two paper grocery bags (bread, celery, oranges poking out). anchor: bottom-centre. ~150×150 px.
// o.n 1 or 2 bags, o.ang tilt (about the base), o.spill: the front bag tipped with things sliding out (0..1)
function P_bags(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.ang || 0);
  if (!o.ang) prop_shadow(0, 0, 170, 0.3);
  const bag = (bx, w, hh, c, goods) => {
    goods && goods();
    prop_rim(prop_poly([[bx - w / 2, 0], [bx + w / 2, 0], [bx + w / 2 + 3, -hh], [bx - w / 2 - 3, -hh]]), c, 1.8);
    prop_poly([[bx - w / 2, 0], [bx + w / 2, 0], [bx + w / 2 + 3, -hh], [bx - w / 2 - 3, -hh]])(); prop_shade(bx - w / 2, -hh, w, hh, 0.32);
    ctx.save(); ctx.beginPath(); ctx.moveTo(bx - w / 2 - 3, -hh); for (let i = 0; i <= 8; i++) ctx.lineTo(bx - w / 2 - 3 + i * (w + 6) / 8, -hh + (i % 2 ? 5 : 0)); ctx.lineTo(bx + w / 2 + 3, -hh + 9); ctx.lineTo(bx - w / 2 - 3, -hh + 9); ctx.fillStyle = ivShade(c, 0.18); ctx.fill(); ctx.restore();
    ivLine(bx - w * 0.18, -hh * 0.62, bx - w * 0.18, -6, 1.2, 'rgba(0,0,0,0.12)'); ivLine(bx + w * 0.24, -hh * 0.62, bx + w * 0.24, -6, 1.2, 'rgba(0,0,0,0.12)');
    ctx.beginPath(); ctx.arc(bx, -hh * 0.55, w * 0.14, 0, TAU); ctx.strokeStyle = 'rgba(80,50,30,0.35)'; ctx.lineWidth = 1.6; ctx.stroke(); ivText('MART', bx, -hh * 0.55 + 3, 7.5, 'rgba(80,50,30,0.6)');
  };
  if ((o.n ?? 2) > 1) bag(42, 70, 96, '#b98b5c', () => { ivRR(30, -128, 16, 40, 5, '#7cc47a'); ivRR(48, -122, 12, 34, 5, '#5aa95a'); for (let i = 0; i < 4; i++) ivLine(36 + i * 5, -130, 34 + i * 6, -146, 2.5, '#8fd88a'); });
  bag(-20, 84, 110, '#cfa271', () => { ivRR(-48, -150, 30, 56, 14, '#e2b06a'); for (let i = 0; i < 3; i++) ivLine(-44, -140 + i * 14, -22, -142 + i * 14, 2, '#b98446');
    P_orange(-6, -104, 1, { rot: 0 }); P_orange(12, -106, 1, { rot: 1 }); ivRR(-28, -126, 20, 30, 4, '#f3ecdc'); ivRR(-28, -116, 20, 8, 0, '#5aa9e6'); });
  ctx.restore();
}
// P_orange: anchor: bottom-centre. Ø 26 px. o.rot spin (defaults to rolling with x), o.air no shadow
function P_orange(x, y, s = 1, o = {}) {
  const R = 13; ctx.save(); ctx.translate(x, y - R * s); ctx.scale(s, s);
  if (!o.air && s > 0.3) prop_shadow(0, R, R * 1.7, 0.25);
  prop_rim(prop_circ(0, 0, R), '#f28c28', 1.2); prop_circ(0, 0, R)(); prop_shade(-R, -R, R * 2, R * 2, 0.4);
  ctx.rotate(o.rot ?? x / (R * s));
  const r = RNG('peel').f; for (let i = 0; i < 9; i++) ivDot((r() - 0.5) * R * 1.4, (r() - 0.5) * R * 1.4, 0.7, 'rgba(160,70,10,0.35)');
  ivDot(0, -R * 0.82, 1.8, '#6a7a2a'); ivPoly([[0, -R * 0.85], [5, -R * 1.2], [8, -R * 0.95]], '#5a9a3a');
  ctx.rotate(-(o.rot ?? x / (R * s)));
  ctx.beginPath(); ctx.ellipse(-R * 0.38, -R * 0.42, R * 0.25, R * 0.13, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,240,200,0.45)'; ctx.fill();
  ctx.restore();
}
// P_cast: a plaster arm cast + sling. anchor: the WRIST; o.ang = the direction elbow→hand (radians, 0 = pointing right);
// the cast runs back toward the elbow (len 92 px at s = 1). Plug into ivMan: hold: { R: (x, y, ang, h) => P_cast(x, y, h / 520, { ang }) }.
// o.sling true draws a sling strap up to o.neck [x, y]; o.sig false hides the signatures
function P_cast(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s, s);
  const L = 92, c = o.col || '#f3eee4';
  prop_rim(() => { ctx.beginPath(); ctx.moveTo(4, -9); ctx.lineTo(-L, -12); ctx.arc(-L, 0, 12, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(4, 9); ctx.arc(4, 0, 9, Math.PI / 2, -Math.PI / 2, true); ctx.closePath(); }, c, 1.6);
  ctx.beginPath(); ctx.moveTo(4, -9); ctx.lineTo(-L, -12); ctx.lineTo(-L, 12); ctx.lineTo(4, 9); prop_shade(-L - 12, -12, L + 16, 24, 0.3);
  for (let i = 1; i < 6; i++) ivLine(-i * 16, -11, -i * 16 + 6, 11, 0.8, 'rgba(120,110,100,0.25)');
  ivRR(-2, -9, 8, 18, 4, '#e2dccf');
  if (o.sig !== false) { ivText('GET WELL', -48, -1, 6.5, '#d6453d', { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 400 });
    ctx.beginPath(); ctx.moveTo(-80, 6); ctx.bezierCurveTo(-72, 0, -66, 10, -58, 4); ctx.strokeStyle = '#3d6fb6'; ctx.lineWidth = 1; ctx.stroke(); ivText('♥', -20, 6, 7, '#8a5bb0'); }
  ctx.restore();
  if (o.sling && o.neck) { ctx.save(); ctx.lineCap = 'round'; ivLine(x - Math.cos(o.ang || 0) * 40 * s, y - Math.sin(o.ang || 0) * 40 * s + 10 * s, o.neck[0], o.neck[1], 14 * s, '#3a6fa8'); ctx.restore(); }
}

// ---- screens: CCTV, cards ----------------------------------------------------
// P_cctv: a CCTV frame. x, y = TOP-LEFT, w × h. drawInside(w, h) draws the scene in local coords (0..w, 0..h), clipped;
// then a desaturated green-grey grade, scanlines, noise, "CAM 04", a blinking REC dot and the timestamp.
// o: { stamp: 'FRI 11:42:07 PM', cam: 'CAM 04', tint }
function P_cctv(x, y, w, h, drawInside, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ivRR(-10, -10, w + 20, h + 20, 8, '#0a0b0e'); ivRR(-10, -10, w + 20, h + 20, 8, null, 'rgba(200,210,220,0.25)', 2);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  ctx.fillStyle = '#1d2226'; ctx.fillRect(0, 0, w, h);
  if (drawInside) { ctx.save(); drawInside(w, h); ctx.restore(); }
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,0.85)'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'color'; ctx.fillStyle = o.tint || 'rgba(120,170,150,0.35)'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  const sl = Math.max(3, h / 180); ctx.fillStyle = 'rgba(0,0,0,0.16)'; for (let yy = 0; yy < h; yy += sl * 2) ctx.fillRect(0, yy, w, sl);
  const r = RNG('cctv', F % 8).f; ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 160; i++) ctx.fillRect(r() * w, r() * h, 2 + r() * 3, 1.5);
  const roll = mod(TT * 0.25, 1) * h; ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, roll, w, h * 0.06);
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const ts = Math.max(14, h * 0.045), m = ts * 1.2, sh = 'rgba(0,0,0,0.6)';
  ivText(o.cam || 'CAM 04', m, m + ts * 0.6, ts, '#f2f2ea', { align: 'left', font: '"Courier New", monospace', weight: 700, shadow: sh });
  if (Math.floor(TT * 1.5) % 2 === 0) ivDot(w - m - ts * 2.6, m + ts * 0.25, ts * 0.32, '#ff3b30');
  ivText('REC', w - m, m + ts * 0.6, ts, '#f2f2ea', { align: 'right', font: '"Courier New", monospace', weight: 700, shadow: sh });
  ivText(o.stamp || 'FRI 11:42:07 PM', m, h - m * 0.7, ts, '#f2f2ea', { align: 'left', font: '"Courier New", monospace', weight: 700, shadow: sh });
  ivText(o.date || '10/18', w - m, h - m * 0.7, ts, '#f2f2ea', { align: 'right', font: '"Courier New", monospace', weight: 700, shadow: sh });
  ctx.restore();
  ctx.restore();
}
// P_statCard: a big-number fact card. x, y = TOP-LEFT, w × h. big ('1,086', '⅓', '2.1 s'), small (caption under it).
// o: { a alpha/pop 0..1, accent (number colour), head (small label on top), light: cream paper version }
function P_statCard(x, y, w, h, big, small, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); const sc = 0.9 + 0.1 * EZ.back(clamp(a)); ctx.translate(x + w / 2, y + h / 2); ctx.scale(sc, sc); ctx.translate(-w / 2, -h / 2);
  const light = !!o.light, ink = light ? '#1e1c26' : '#fbeedd';
  ivRR(10, 16, w, h, 26, 'rgba(0,0,0,0.4)');
  ivRR(0, 0, w, h, 26, light ? '#efe7d6' : 'rgba(18,16,26,0.92)'); ivRR(0, 0, w, h, 26, null, light ? 'rgba(80,60,40,0.3)' : 'rgba(255,214,160,0.5)', 2.5);
  ivRR(14, 14, w - 28, h - 28, 18, null, light ? 'rgba(80,60,40,0.12)' : 'rgba(255,214,160,0.12)', 1.5);
  if (o.head) { ivText(o.head, w / 2, h * 0.2, Math.min(h * 0.075, 30), light ? '#a8453f' : '#ffb35a', { track: 5 }); ivLine(w / 2 - w * 0.18, h * 0.24, w / 2 + w * 0.18, h * 0.24, 1.5, light ? 'rgba(80,60,40,0.3)' : 'rgba(255,230,200,0.35)'); }
  ctx.save(); ctx.font = `800 100px ${IV.font}`; const bw = ctx.measureText(big).width; ctx.restore();
  const bs = Math.min(h * (small ? 0.42 : 0.55), 100 * (w * 0.84) / bw);
  ivText(big, w / 2, h * (small ? 0.6 : 0.66) + (o.head ? h * 0.04 : 0), bs, o.accent || (light ? '#1e1c26' : '#ffe2b0'), { glow: light ? null : 'rgba(255,160,80,0.5)', track: 2 });
  if (small) prop_wrapC(small, w / 2, h * 0.8 + (o.head ? h * 0.03 : 0), w * 0.86, Math.min(h * 0.075, 34), light ? 'rgba(30,28,38,0.75)' : 'rgba(255,236,214,0.8)');
  ctx.restore();
}
// centred wrapped text (one or two lines)
function prop_wrapC(str, x, y, maxW, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? IV.font}`; ctx.letterSpacing = '3px';
  const lines = []; let cur = ''; String(str).split(' ').forEach((wd) => { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; }); if (cur) lines.push(cur); ctx.restore();
  lines.forEach((L, i) => ivText(L, x, y + i * size * 1.25, size, color, { track: 3, ...o }));
}
// P_newsCard: a newspaper clipping. x, y = TOP-LEFT, w × h. head = the headline. o: { paper ('THE CITY HERALD'),
// kicker, date, photo(w, h) draws the picture, a alpha/pop, ang tilt }
function P_newsCard(x, y, w, h, head, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.ang ?? -0.02); ctx.scale(0.92 + 0.08 * EZ.back(clamp(a)), 0.92 + 0.08 * EZ.back(clamp(a))); ctx.translate(-w / 2, -h / 2);
  const u = w / 600;
  ivPoly([[10, 18], [w + 12, 14], [w + 8, h + 20], [14, h + 16]], 'rgba(0,0,0,0.4)');
  const r = RNG('news').f, P = [[0, 0]]; for (let i = 1; i < 12; i++) P.push([i * w / 12, (r() - 0.5) * 6 * u]); P.push([w, 0], [w, h]); for (let i = 11; i > 0; i--) P.push([i * w / 12, h + (r() - 0.5) * 6 * u]); P.push([0, h]);
  ivPoly(P, '#efe7d6'); prop_poly(P)(); prop_shade(0, 0, w, h, 0.15);
  ivText(o.paper || 'THE CITY HERALD', w / 2, 52 * u, 40 * u, '#1e1c26', { font: 'Georgia, "Times New Roman", serif', weight: 700, track: 2 * u });
  ivLine(24 * u, 68 * u, w - 24 * u, 68 * u, 2.5 * u, '#1e1c26'); ivLine(24 * u, 74 * u, w - 24 * u, 74 * u, 1 * u, '#1e1c26');
  ivText(o.date || 'MONDAY, OCTOBER 21', 24 * u, 92 * u, 13 * u, '#4a4652', { align: 'left', font: IV.sans, weight: 700, track: 2 * u });
  ivText('LOCAL', w - 24 * u, 92 * u, 13 * u, '#a8453f', { align: 'right', font: IV.sans, weight: 800, track: 2 * u });
  if (o.kicker) ivText(o.kicker, 24 * u, 128 * u, 16 * u, '#a8453f', { align: 'left', track: 3 * u });
  const yy = prop_wrap(head, 24 * u, (o.kicker ? 170 : 140) * u, w - 48 * u, 40 * u, '#15141c', { font: 'Georgia, "Times New Roman", serif', weight: 700, lh: 1.08 });
  const ph = Math.max(0, h - yy - 40 * u), pw = w * 0.5;
  if (ph > 40 * u) { ctx.save(); prop_rr(24 * u, yy, pw, ph, 2)(); ctx.clip();
    if (o.photo) { ctx.translate(24 * u, yy); o.photo(pw, ph); }
    else { ctx.fillStyle = ivVGrad(yy, yy + ph, ['#6a6a72', '#3a3a42']); ctx.fillRect(24 * u, yy, pw, ph); ivLine(24 * u + pw * 0.6, yy + ph, 24 * u + pw * 0.6, yy + ph * 0.3, 8 * u, '#222'); ivRR(24 * u + pw * 0.6 - 16 * u, yy + ph * 0.12, 32 * u, 70 * u, 6 * u, '#222'); }
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(0, 0, w, h); ctx.restore();
    for (let i = 0; i * 18 * u < ph - 8 * u; i++) ivRR(pw + 44 * u, yy + 6 * u + i * 18 * u, (w - pw - 68 * u) * (i % 5 === 4 ? 0.6 : 1), 7 * u, 3 * u, 'rgba(30,28,38,0.22)'); }
  ctx.restore();
}
// P_dayCard: the corner tally "DAY 3 · 19 NEAR MISSES", scoreboard tiles. anchor: CENTRE. 560×300 px at s = 1.
// o: { label ('NEAR MISSES'), a alpha/pop 0..1 }
function P_dayCard(x, y, s = 1, day = 1, count = 0, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (0.9 + 0.1 * EZ.back(clamp(a))), s * (0.9 + 0.1 * EZ.back(clamp(a)))); ctx.globalAlpha *= clamp(a);
  ivRR(-272, -138, 560, 300, 26, 'rgba(0,0,0,0.4)');
  ivRR(-280, -150, 560, 300, 26, '#e9dfcc'); ivRR(-280, -150, 560, 300, 26); prop_shade(-280, -150, 560, 300, 0.2);
  ivRR(-268, -138, 536, 276, 18, null, 'rgba(80,60,40,0.18)', 2);
  ivText('DAY ' + day, 0, -86, 52, '#a8453f', { track: 6, shadow: 'rgba(80,30,20,0.25)' });
  const digits = String(count).split(''), tw = 92, gap = 12, x0 = -(digits.length * (tw + gap) - gap) / 2;
  digits.forEach((d, i) => { const tx = x0 + i * (tw + gap);
    ivRR(tx + 4, -50, tw, 118, 14, 'rgba(0,0,0,0.25)'); ivRR(tx, -56, tw, 118, 14, '#2a2430'); ivRR(tx, -56, tw, 59, [14, 14, 0, 0], '#332c3a');
    ivLine(tx + 4, 3, tx + tw - 4, 3, 2, 'rgba(0,0,0,0.5)');
    ivText(d, tx + tw / 2, 40, 96, '#ffe2b0', { glow: 'rgba(255,170,80,0.6)' }); });
  ivText(o.label || 'NEAR MISSES', 0, 110, 32, '#2a2430', { track: 6 });
  [-1, 1].forEach((k) => { ivDot(k * 250, -120, 7, '#b9a98e'); ivDot(k * 250, 120, 7, '#b9a98e'); });
  ctx.restore();
}

// ---- small things ------------------------------------------------------------
// P_stopwatch: anchor: the dial CENTRE. Ø 34 px at s = 1 (use big: s 8–20). secs = the time shown;
// o.dial seconds per turn (10), o.digits false hides the readout, o.run (blink the readout)
function P_stopwatch(x, y, s = 1, secs = 0, o = {}) {
  const R = 17, dial = o.dial || 10; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ivRR(-3.5, -R - 7, 7, 6, 1.5, '#9aa0ad'); ivRR(-5, -R - 9, 10, 3.5, 1.5, '#c9ced8');
  ctx.save(); ctx.rotate(0.75); ivRR(-2.5, -R - 4.5, 5, 4, 1, '#9aa0ad'); ctx.restore();
  prop_rim(prop_circ(0, 0, R), '#b9bec8', 0.6); prop_circ(0, 0, R)(); prop_shade(-R, -R, 2 * R, 2 * R, 0.4);
  ivDot(0, 0, R * 0.86, '#f7f2e6');
  for (let i = 0; i < dial * 5; i++) { const a = (i / (dial * 5)) * TAU - Math.PI / 2, big = i % 5 === 0, r1 = R * (big ? 0.66 : 0.74);
    ivLine(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82, big ? 0.7 : 0.3, '#2a2e40', 'butt');
    if (big && i / 5 !== dial / 2) ivText(String(i / 5), Math.cos(a) * R * 0.53, Math.sin(a) * R * 0.53 + 1.2, 3.2, '#2a2e40', { font: IV.sans }); }
  if (o.digits !== false) { ivRR(-6.5, 3.5, 13, 5.5, 1.2, '#1d2230'); ivText(secs.toFixed(2), 0, 7.8, 3.8, '#9ff5c4', { font: '"Courier New", monospace', weight: 700 }); }
  const a = (secs / dial) * TAU - Math.PI / 2;
  ivLine(-Math.cos(a) * R * 0.18, -Math.sin(a) * R * 0.18, Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, 0.8, '#d6302a');
  ivDot(0, 0, 1.4, '#d6302a'); ivDot(0, 0, 0.6, '#f7f2e6');
  ctx.beginPath(); ctx.ellipse(-R * 0.35, -R * 0.45, R * 0.3, R * 0.12, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  ctx.restore();
}
// P_clock: a wall clock. anchor: CENTRE. Ø 80 px. h, m (hours, minutes, fractional ok); o.sec seconds hand (number)
function P_clock(x, y, s = 1, h = 10, m = 10, o = {}) {
  const R = 40; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_rim(prop_circ(0, 0, R), o.col || '#2a2430', 1.5); prop_circ(0, 0, R)(); prop_shade(-R, -R, 2 * R, 2 * R, 0.3);
  ivDot(0, 0, R * 0.86, '#f6efe0'); ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; ivLine(Math.sin(a) * R * (big ? 0.68 : 0.76), -Math.cos(a) * R * (big ? 0.68 : 0.76), Math.sin(a) * R * 0.8, -Math.cos(a) * R * 0.8, big ? 2.2 : 0.7, '#2a2430', 'butt'); }
  [[12, 0], [3, 1], [6, 2], [9, 3]].forEach(([n, i]) => { const a = i * Math.PI / 2; ivText(String(n), Math.sin(a) * R * 0.52, -Math.cos(a) * R * 0.52 + 4, 11, '#2a2430'); });
  const ha = ((h % 12) + m / 60) / 12 * TAU, ma = (m / 60) * TAU;
  ivLine(0, 0, Math.sin(ha) * R * 0.42, -Math.cos(ha) * R * 0.42, 4, '#1e1c26'); ivLine(0, 0, Math.sin(ma) * R * 0.66, -Math.cos(ma) * R * 0.66, 2.6, '#1e1c26');
  if (o.sec != null) { const sa = (o.sec / 60) * TAU; ivLine(-Math.sin(sa) * R * 0.15, Math.cos(sa) * R * 0.15, Math.sin(sa) * R * 0.74, -Math.cos(sa) * R * 0.74, 1, '#d6302a'); }
  ivDot(0, 0, 3, '#d6302a');
  ctx.beginPath(); ctx.ellipse(-R * 0.3, -R * 0.45, R * 0.35, R * 0.13, -0.5, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
  ctx.restore();
}
// P_keys: a key ring with three keys + a bus-company fob. anchor: the RING centre (it hangs from it). ~50×70 px. o.ang swing
function P_keys(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.ang || 0);
  const key = (a, c, L) => { ctx.save(); ctx.rotate(a); ctx.translate(0, 9);
    prop_rimDo((rc) => { ivDot(0, 6, 7, rc || c); ivRR(-2.5, 10, 5, L, 1.5, rc || c); ivPoly([[2, 10 + L * 0.55], [6, 10 + L * 0.6], [6, 10 + L * 0.72], [2, 10 + L * 0.75], [5, 10 + L * 0.85], [2, 10 + L]], rc || c); }, 0.8);
    ivDot(0, 5, 2.4, 'rgba(0,0,0,0.5)'); ivLine(-1, 12, -1, 10 + L, 1, 'rgba(255,255,255,0.4)'); ctx.restore(); };
  key(0.5, '#d8b45a', 26); key(0.05, '#c9ced8', 32); key(-0.45, '#c9ced8', 22);
  ctx.save(); ctx.rotate(-0.95); ctx.translate(0, 10); prop_rim(prop_rr(-8, 0, 16, 26, 5), '#3d6fb6', 1); ivText('9', 0, 19, 13, '#f2c230'); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.lineWidth = 2; ctx.strokeStyle = '#a9afb9'; ctx.stroke();
  ctx.restore();
}
// P_mug: a coffee mug. anchor: bottom-centre. ~58×46 px. steam 0..1 (or true), o.col, o.text (e.g. '#1 DAD')
function P_mug(x, y, s = 1, steam = 0, o = {}) {
  const c = o.col || '#e9e2d4'; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, 56, 0.3);
  ctx.beginPath(); ctx.arc(21, -25, 11, -1.3, 1.3); ctx.lineWidth = 6; ctx.strokeStyle = ivShade(c, -0.15); ctx.stroke();
  prop_rim(prop_rr(-20, -46, 40, 46, [3, 3, 9, 9]), c, 1.4); prop_rr(-20, -46, 40, 46, [3, 3, 9, 9])(); prop_shade(-20, -46, 40, 46, 0.35);
  ctx.beginPath(); ctx.ellipse(0, -46, 20, 4, 0, 0, TAU); ctx.fillStyle = ivShade(c, -0.2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -45, 17, 2.8, 0, 0, TAU); ctx.fillStyle = '#4a2c1c'; ctx.fill();
  ivLine(-15, -40, -15, -6, 2, 'rgba(255,255,255,0.4)');
  if (o.text) ivText(o.text, 1, -18, 9, '#a8453f');
  const st = steam === true ? 1 : +steam || 0;
  if (st > 0) { ctx.save(); ctx.globalAlpha *= 0.35 * st; for (let i = 0; i < 3; i++) { const k = mod(TT * 0.7 + i / 3, 1);
    ctx.beginPath(); for (let j = 0; j <= 10; j++) { const yy = -50 - j * 6 - k * 30, xx = (i - 1) * 8 + Math.sin(j * 0.7 + TT * 3 + i) * 4; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.lineWidth = 4 * (1 - k * 0.5); ctx.strokeStyle = `rgba(255,245,230,${1 - k})`; ctx.lineCap = 'round'; ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
// P_wheel: the bus steering wheel. anchor: CENTRE. Ø 170 px at s = 1. o.ang turn (radians), o.tilt 0..0.8 squash
// (0 = face-on, for hand close-ups; ~0.55 seen from the side, a big flat bus wheel), o.col
function P_wheel(x, y, s = 1, o = {}) {
  const R = 85, c = o.col || '#1b1c23'; ctx.save(); ctx.translate(x, y); ctx.scale(s, s * (1 - (o.tilt || 0))); ctx.rotate(o.ang || 0);
  const spokes = (rc) => { [Math.PI / 2, Math.PI * 1.15, -Math.PI * 0.15].forEach((a) => { ivPoly([[Math.cos(a - 0.25) * 18, Math.sin(a - 0.25) * 18], [Math.cos(a - 0.09) * R, Math.sin(a - 0.09) * R], [Math.cos(a + 0.09) * R, Math.sin(a + 0.09) * R], [Math.cos(a + 0.25) * 18, Math.sin(a + 0.25) * 18]], rc || '#2c2d36'); });
    ivDot(0, 0, 28, rc || '#2c2d36'); };
  prop_rimDo((rc) => { spokes(rc); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.lineWidth = 17; ctx.strokeStyle = rc || c; ctx.stroke(); }, 2);
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; ivLine(Math.cos(a) * (R - 7), Math.sin(a) * (R - 7), Math.cos(a) * (R - 3), Math.sin(a) * (R - 3), 1.2, 'rgba(255,255,255,0.06)'); }
  ctx.beginPath(); ctx.arc(0, 0, R + 3, -2.6, -1.0); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R - 6, 0.4, 2.4); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke();
  ivDot(0, 0, 22, '#23242c'); ivDot(0, 0, 20, '#2f303a'); ctx.beginPath(); ctx.arc(0, 0, 22, -2.4, -0.8); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
  ivDot(0, 0, 8, '#c9ced8'); ivText('9', 0, 3.5, 10, '#2a2e40');
  ctx.restore();
}

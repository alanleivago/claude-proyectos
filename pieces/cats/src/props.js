// =====================================================================
//  PROPS — every object in "What If You Could Understand Every Cat?" (ifverse look, 2.5D)
//  P_name(x, y, s, o = {}) draws in the current transform (world coords). s = 1 ≈ natural size next to a 520-px actor.
//  (x, y) = the prop's base / bottom-centre unless the comment above it says otherwise.
//  Flat vector shapes with 2.5D: boxes extrude a top + a side (prop_ext / ivBox), round things get sphere shading with a
//  highlight toward IV_M.key, and every silhouette takes the mood's rim light (IV_M.rim) on the key side.
// =====================================================================

// ---- shared helpers (prefix prop_) ------------------------------------
// fill a path with a rim pass first: the silhouette in the rim colour, nudged toward the key light by rw (screen px)
function prop_rim(path, fill, rw = 2, rimCol) {
  const m = ctx.getTransform(), det = m.a * m.d - m.b * m.c || 1, k = IV_M.key, sc = Math.sqrt(Math.abs(det));
  const vx = k[0] * rw * sc, vy = k[1] * rw * sc, lx = (m.d * vx - m.c * vy) / det, ly = (-m.b * vx + m.a * vy) / det;
  ctx.save(); ctx.translate(lx, ly); path(); ctx.fillStyle = rimCol || IV_M.rim; ctx.fill(); ctx.restore();
  path(); ctx.fillStyle = fill; ctx.fill();
}
// the same rim idea for props made of many parts: fn(rimColourOrNull) is called twice, offset in the rim colour, then plain
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
// sphere shading inside path(): a warm highlight toward the key light, a dark terminator on the far edge, a cool bounce
function prop_ball(path, cx, cy, R, a = 1) {
  const k = IV_M.key, hx = cx + k[0] * R * 0.45, hy = cy + k[1] * R * 0.45;
  ctx.save(); path(); ctx.clip();
  let g = ctx.createRadialGradient(hx, hy, R * 0.04, cx, cy, R * 1.12);
  g.addColorStop(0, `rgba(255,248,235,${0.42 * a})`); g.addColorStop(0.3, 'rgba(255,248,235,0)'); g.addColorStop(0.68, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,4,18,${0.45 * a})`);
  ctx.fillStyle = g; ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);
  const bx = cx - k[0] * R * 0.75, by = cy - k[1] * R * 0.75; g = ctx.createRadialGradient(bx, by, 0, bx, by, R * 0.6);
  g.addColorStop(0, `rgba(150,170,230,${0.16 * a})`); g.addColorStop(1, 'rgba(150,170,230,0)'); ctx.fillStyle = g; ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);
  ctx.restore();
}
// a glossy specular dot toward the key light
function prop_spec(cx, cy, R, a = 0.7) { const k = IV_M.key; ctx.beginPath(); ctx.ellipse(cx + k[0] * R * 0.5, cy + k[1] * R * 0.5, R * 0.2, R * 0.11, Math.atan2(k[1], k[0]) + Math.PI / 2, 0, TAU); ctx.fillStyle = `rgba(255,252,240,${a})`; ctx.fill(); }
// a cylinder's side shading across x (from xa to xb): lit on the key side, dark on the far side
function prop_cyl(xa, xb, y0, y1, a = 0.35) {
  const k = IV_M.key[0], g = ctx.createLinearGradient(xa, 0, xb, 0);
  g.addColorStop(0, k < 0 ? 'rgba(255,245,230,0.22)' : `rgba(8,4,18,${a})`); g.addColorStop(k < 0 ? 0.28 : 0.72, 'rgba(255,245,230,0.06)'); g.addColorStop(1, k < 0 ? `rgba(8,4,18,${a})` : 'rgba(255,245,230,0.22)');
  ctx.save(); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(xa, y0, xb - xa, y1 - y0); ctx.restore();
}
// extrude a polygon P (local coords) by (ex, ey): the faces that look toward the extrusion show (top/side), then the
// front face on top; all with one rim pass. o.top / o.side colours (from front), o.rim false, o.rw rim width
function prop_ext(P, ex, ey, front, o = {}) {
  const n = P.length; let A = 0; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; }
  const sg = A > 0 ? 1 : -1, k = IV_M.key, top = o.top || ivShade(front, 0.16), side = o.side || ivShade(front, -0.3);
  const faces = [];
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = sg * dy / L, ny = -sg * dx / L;
    if (nx * ex + ny * ey <= 0) continue;
    const up = ny < -Math.abs(nx) * 0.8, lit = nx * k[0] + ny * k[1];
    faces.push([[a, b, [b[0] + ex, b[1] + ey], [a[0] + ex, a[1] + ey]], up ? top : (lit > 0.2 && !o.side ? ivShade(front, -0.1) : side)]); }
  const draw = (rc) => { faces.forEach(([Q, c]) => ivPoly(Q, rc || c, rc || c, 1)); ivPoly(P, rc || front); };
  if (o.rim === false) draw(null); else prop_rimDo(draw, o.rw ?? 2);
  return { faces };
}
// text that stays readable inside a mirrored (dir = −1) prop
function prop_dText(dir, str, x, y, size, color, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ivText(str, 0, 0, size, color, o); ctx.restore(); }
const prop_rr = (x, y, w, h, r) => () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const prop_poly = (P) => () => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
const prop_circ = (x, y, r) => () => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
const prop_ell = (x, y, rx, ry, a = 0) => () => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, TAU); };
// word-wrapped text (left), returns the y after the last line
function prop_wrap(str, x, y, maxW, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? IV.font}`;
  const words = String(str).split(' '), lines = []; let cur = '';
  words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur); ctx.restore();
  const lh = size * (o.lh ?? 1.22), al = o.align ?? 'left';
  lines.forEach((L, i) => ivText(L, x, y + i * lh, size, color, { ...o, align: al }));
  return y + lines.length * lh;
}
// contact shadow under a prop resting on a surface
function prop_shadow(x, y, w, a = 0.35) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * 0.07, 0, 0, TAU); ctx.fillStyle = `rgba(5,3,10,${a})`; ctx.fill(); ctx.restore(); }
const prop_num = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ---- the party: balloon, cat hat, ring, cake ----------------------------
// P_balloon: anchor: the BOTTOM END of the string (held in a hand, tied to a door). ~84×106 px + 170 px string.
// o.col ('#e0393b'), o.len string length, o.sway (default: gentle bob), o.key varies the bob,
// o.free 0..1: let go — the balloon rises (o.rise px, 1400) and drifts, the string trailing loose
function P_balloon(x, y, s = 1, o = {}) {
  const col = o.col || '#e0393b', L = o.len ?? 170, ph = hash(String(o.key ?? (x | 0))) % 100, fr = clamp(o.free || 0);
  const sw = o.sway ?? (Math.sin(TT * 1.3 + ph) * 0.08 + fr * Math.sin(TT * 2.3 + ph) * 0.18);
  ctx.save(); ctx.translate(x + fr * 220 * s + Math.sin(TT * 1.1 + ph) * fr * 40 * s, y - EZ.i2(fr) * (o.rise ?? 1400)); ctx.scale(s, s);
  const tx = Math.sin(sw) * L, ty = -Math.cos(sw) * L, wig = 10 + fr * 26 * Math.sin(TT * 5 + ph);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(wig, -L * 0.3, -wig, -L * 0.62, tx, ty); ctx.strokeStyle = 'rgba(245,236,225,0.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.translate(tx, ty); ctx.rotate(sw * 1.4);
  ivPoly([[-6, 3], [6, 3], [0, -7]], ivShade(col, -0.25));
  const b = () => { ctx.beginPath(); ctx.moveTo(0, -5); ctx.bezierCurveTo(-58, -25, -45, -110, 0, -110); ctx.bezierCurveTo(45, -110, 58, -25, 0, -5); ctx.closePath(); };
  prop_rim(b, col, 2.2); prop_ball(b, 0, -62, 52, 1.1);
  ctx.save(); ctx.translate(IV_M.key[0] * 16, IV_M.key[1] * 16); ctx.beginPath(); ctx.ellipse(0, -66, 8, 15, 0.5, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill(); ivDot(5, -84, 3, 'rgba(255,255,255,0.75)'); ctx.restore();
  ctx.restore();
}
// P_catHat: the paper party hat Lily makes (crayon stripes, a pompom, an elastic). anchor: the brim's bottom-centre
// (sit it on a head). ~72×110 px. o.ang tilt, o.col paper, o.col2 crayon, o.string false hides the elastic
function P_catHat(x, y, s = 1, o = {}) {
  const w = 72, h = 98, c = o.col || '#f6e7c6', c2 = o.col2 || '#e05a7a', c3 = '#3c6fd1';
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s, s);
  if (o.string !== false) { ctx.beginPath(); ctx.moveTo(-w / 2 + 5, 0); ctx.quadraticCurveTo(0, 40, w / 2 - 5, 0); ctx.strokeStyle = 'rgba(245,240,230,0.85)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  const cone = () => { ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-2, -h); ctx.quadraticCurveTo(0, -h - 3, 2, -h); ctx.lineTo(w / 2, 0); ctx.ellipse(0, 0, w / 2, 8, 0, 0, Math.PI); ctx.closePath(); };
  prop_rim(cone, c, 2);
  ctx.save(); cone(); ctx.clip();
  for (let i = 0; i < 5; i++) { const yy = -10 - i * 20; ctx.save(); ctx.translate(0, yy); ctx.rotate(-0.35); ivRR(-60, -4, 120, 8, 3, i % 2 ? c3 : c2); ctx.restore(); }   // crayon bands
  const r = RNG('hat').f; for (let i = 0; i < 9; i++) ivDot((r() - 0.5) * w * 0.7 * (1 - (i / 9) * 0.5), -12 - r() * h * 0.7, 2.2, ['#f2c230', '#5ab07a', '#e05a7a'][i % 3]);
  ivText('♥', 8, -30, 16, '#e0393b');
  ctx.restore();
  cone(); prop_cyl(-w / 2, w / 2, -h, 10, 0.4);
  ctx.beginPath(); ctx.ellipse(0, 0, w / 2, 8, 0, 0, Math.PI); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ivLine(-1, -h + 4, -w * 0.18, -4, 1, 'rgba(0,0,0,0.15)');                                 // the paper seam
  // the pompom: a fluffy ball of little tufts
  prop_rimDo((rc) => { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ivDot(Math.cos(a) * 8, -h - 6 + Math.sin(a) * 8, 6, rc || '#f2c230'); } ivDot(0, -h - 6, 9, rc || '#f2c230'); }, 1.5);
  prop_ball(prop_circ(0, -h - 6, 14), 0, -h - 6, 14);
  ctx.restore();
}
// P_ring: Mrs. Gomez's ring (gold band, a cut stone) with a twinkle. anchor: bottom-centre of the band. ~34×52 px.
// o.sparkle 0..1 (default: twinkling), o.stone colour
function P_ring(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = 15, cy = -R - 2, stone = o.stone || '#bfe6ff';
  const gg = ctx.createLinearGradient(0, cy - R, 0, cy + R); gg.addColorStop(0, '#8a6220'); gg.addColorStop(0.45, '#b98a2e'); gg.addColorStop(0.62, '#f2c45a'); gg.addColorStop(1, '#d9a23c');
  prop_rimDo((rc) => { ctx.beginPath(); ctx.ellipse(0, cy, R, R * 0.92, 0, 0, TAU); ctx.lineWidth = 6.5; ctx.strokeStyle = rc || gg; ctx.stroke(); }, 1.2);
  ctx.beginPath(); ctx.ellipse(0, cy, R - 3.2, R * 0.92 - 3.2, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(60,40,10,0.5)'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, cy, R - 1.5, R * 0.92 - 1.5, 0, 0.3, 1.4); ctx.lineWidth = 1.8; ctx.strokeStyle = '#fff2c0'; ctx.stroke();
  // the setting + a brilliant cut: crown and pavilion facets
  ivRR(-6, cy - R - 6, 12, 6, 2, '#c9952e');
  const gy = cy - R - 6;
  prop_rimDo((rc) => ivPoly([[-10, gy - 6], [-6, gy - 12], [6, gy - 12], [10, gy - 6], [0, gy + 3]], rc || stone), 1.2);
  ivPoly([[-10, gy - 6], [10, gy - 6], [0, gy + 3]], ivShade(stone, -0.25)); ivPoly([[-6, gy - 12], [0, gy - 6], [-10, gy - 6]], '#ffffff'); ivPoly([[6, gy - 12], [10, gy - 6], [0, gy - 6]], ivShade(stone, -0.12));
  ivLine(-3, gy - 6, 0, gy + 3, 0.6, 'rgba(255,255,255,0.6)');
  const sp = o.sparkle ?? (0.55 + 0.45 * Math.sin(TT * 5.3));
  if (sp > 0) { ctx.save(); ctx.translate(4, gy - 10); ctx.rotate(TT * 0.6); const L = 18 * sp;
    ivGlow(0, 0, 30 * sp, 'rgba(255,250,220,0.8)'); ivPoly([[0, -L], [2, -2], [L, 0], [2, 2], [0, L], [-2, 2], [-L, 0], [-2, -2]], '#fffdf2');
    ctx.rotate(Math.PI / 4); ivPoly([[0, -L * 0.5], [1.2, -1.2], [L * 0.5, 0], [1.2, 1.2], [0, L * 0.5], [-1.2, 1.2], [-L * 0.5, 0], [-1.2, -1.2]], 'rgba(255,253,242,0.8)'); ctx.restore(); }
  ctx.restore();
}
// P_lemonCake: a whole lemon drizzle cake on a plate (glaze drips, lemon slices, mint). anchor: bottom-centre (plate on
// the table). ~200×120 px. o.slice true: one slice cut out, showing the sponge and the curd layer
function P_lemonCake(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, 230, 0.32);
  prop_rim(prop_ell(0, -6, 108, 14), '#e9e4dc', 1.6); ctx.beginPath(); ctx.ellipse(0, -9, 96, 10, 0, 0, TAU); ctx.fillStyle = '#f8f4ec'; ctx.fill();
  const w = 150, hh = 66, ry = 20, top = -14 - hh;
  const side = () => { ctx.beginPath(); ctx.moveTo(-w / 2, top); ctx.lineTo(-w / 2, -14); ctx.ellipse(0, -14, w / 2, ry, 0, Math.PI, 0, true); ctx.lineTo(w / 2, top); ctx.closePath(); };
  prop_rim(side, '#f0cf7e', 2); side(); prop_cyl(-w / 2, w / 2, top, 0, 0.38);
  ctx.save(); side(); ctx.clip(); ivRR(-w / 2, top + hh * 0.48, w, 9, 0, '#f7dd3a'); ivRR(-w / 2, top + hh * 0.48 + 9, w, 3, 0, 'rgba(255,255,255,0.35)');
  const r = RNG('crumb').f; for (let i = 0; i < 40; i++) ivDot(-w / 2 + r() * w, top + r() * hh + 14, 1.3, 'rgba(160,110,40,0.25)'); ctx.restore();
  // glaze top + drips
  ctx.beginPath(); ctx.ellipse(0, top, w / 2 + 2, ry, 0, 0, TAU); ctx.fillStyle = '#fff6cf'; ctx.fill();
  const r2 = RNG('glaze').f; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.05 + i * 0.9 / 12), dx = -Math.cos(a) * w / 2, L = 8 + r2() * 22; ivRR(dx - 5, top + Math.sin(a) * ry - 4, 10, L, 5, '#fff6cf'); }
  ctx.beginPath(); ctx.ellipse(-14, top - 5, 44, 8, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  if (o.slice) { ivPoly([[0, top], [w / 2 + 2, top + 2], [w / 2, -12], [0, top + hh * 0.9]], '#e8c46a'); ivPoly([[0, top], [w * 0.32, top + ry * 0.9], [w * 0.32, -16 + ry * 0.9], [0, top + hh * 0.9]], '#f4d98a'); ivLine(0, top + hh * 0.5, w * 0.32, top + hh * 0.5 + 8, 6, '#f7dd3a'); }
  // lemon slices + zest + mint
  [[-38, top - 2, 0.2], [0, top - 6, -0.1], [36, top + 2, 0.15]].forEach(([lx, ly, a]) => { if (o.slice && lx > 20) return; ctx.save(); ctx.translate(lx, ly); ctx.rotate(a); ctx.scale(1, 0.5);
    ivDot(0, 0, 17, '#f2c230'); ivDot(0, 0, 14, '#fbe78a'); for (let k = 0; k < 8; k++) { const t = k / 8 * TAU; ivLine(0, 0, Math.cos(t) * 13, Math.sin(t) * 13, 1.4, '#f6d24e'); } ivDot(0, 0, 2.5, '#fff6cf'); ctx.restore(); });
  ivPoly([[-6, top - 12], [-18, top - 22], [-4, top - 18]], '#5aa95a'); ivPoly([[-2, top - 12], [8, top - 24], [6, top - 13]], '#6fc06a');
  const r3 = RNG('zest').f; for (let i = 0; i < 14; i++) ivRR(-60 + r3() * 120, top - 6 + r3() * 12, 4, 1.6, 1, '#f2b81e');
  ctx.restore();
}

// ---- found things: wallet, flyer ---------------------------------------------
// P_wallet: a brown leather bifold with a card peeking out, seen standing (thickness shows top + side). anchor:
// bottom-centre. ~92×64 px. o.ang tilt (about the base), o.col leather, o.flat: lying on the ground (squashed, seen from above)
function P_wallet(x, y, s = 1, o = {}) {
  const c = o.col || '#7a4a2e', w = 92, h = 62;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * (o.flat ? 0.45 : 1)); ctx.rotate(o.ang || 0);
  prop_shadow(0, 0, w * 1.2, 0.3);
  ivRR(-w / 2 + 14, -h - 9, 40, 16, 3, '#3c6fd1'); ivRR(-w / 2 + 14, -h - 9, 40, 5, 2, '#f2c230');               // a card poking out
  const P = [[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]];
  prop_ext(P, 7, -6, c, { rw: 1.6 });
  ctx.save(); prop_poly(P)(); prop_shade(-w / 2, -h, w, h, 0.38); ctx.restore();
  ctx.setLineDash([3, 3]); ivRR(-w / 2 + 5, -h + 5, w - 10, h - 10, 5, null, 'rgba(240,210,170,0.55)', 1.2); ctx.setLineDash([]);
  ivLine(-w / 2 + 2, -h + 1, -w / 2 + 2, -1, 3, ivShade(c, -0.35));                                              // the spine
  prop_rim(prop_rr(w * 0.12, -h * 0.68, w * 0.4, h * 0.36, [8, 0, 0, 8]), ivShade(c, -0.18), 0.8);            // the strap
  ivDot(w * 0.2, -h * 0.5, 4.5, '#c9a24a'); ivDot(w * 0.19, -h * 0.52, 1.6, '#fff2c0');
  ctx.beginPath(); ctx.ellipse(-w * 0.18, -h * 0.7, w * 0.2, h * 0.08, -0.1, 0, TAU); ctx.fillStyle = 'rgba(255,230,200,0.12)'; ctx.fill();
  ctx.restore();
}
// P_flyer: the MISSING poster: a photo of Lily (yellow coat, red balloon), the details, phone tear-off tabs, tape.
// anchor: the poster's CENTRE (taped on a pole/wall). ~150×200 px. o.ang (−0.03), o.head ('MISSING'),
// o.text ('LILY · AGE 7'), o.text2 ('YELLOW COAT · RED BALLOON'), o.phone ('555-0142'), o.tabs (true), o.a alpha
function P_flyer(x, y, s = 1, o = {}) {
  const w = 150, h = 200, a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(o.ang ?? -0.03); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  ivPoly([[4, 6], [w + 5, 4], [w + 4, h + 7], [6, h + 6]], 'rgba(0,0,0,0.35)');
  const P = [[0, 0], [w, 0], [w, h - 14], [w - 16, h], [0, h]];
  prop_rim(prop_poly(P), '#f7f2e6', 1.2); prop_poly(P)(); prop_shade(0, 0, w, h, 0.18);
  ivPoly([[w, h - 14], [w - 16, h], [w - 14, h - 12]], '#d9d2c2');                                                    // the curled corner
  ivText(o.head || 'MISSING', w / 2, 30, 27, '#d6302a', { track: 2 });
  // the photo: Lily, smiling, with her balloon
  ctx.save(); const px = 18, py = 40, pw = w - 36, ph = 82; prop_rr(px, py, pw, ph, 2)(); ctx.clip();
  ctx.fillStyle = ivVGrad(py, py + ph, ['#a9cbe6', '#e6d9c2']); ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#9fb48a'; ctx.fillRect(px, py + ph * 0.8, pw, ph);
  const keep = IV_M; IV_M = { ...IV_MOOD.day };
  ivMan({ who: CAST.lily, x: w / 2 - 6, y: py + ph + 4, h: 84, f: 0.1, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'grin' }, noBlink: true });
  P_balloon(w / 2 + 30, py + ph * 0.5, 0.34, { sway: 0.1, len: 40 }); IV_M = keep;
  ctx.restore(); ivRR(18, 40, w - 36, 82, 2, null, '#2a2430', 1.5);
  ivText(o.text || 'LILY · AGE 7', w / 2, 140, 13.5, '#1e1c26', { track: 1 });
  ivText(o.text2 || 'YELLOW COAT · RED BALLOON', w / 2, 154, 7, '#4a4652', { track: 0.6, font: IV.sans });
  ivText('PLEASE CALL', w / 2, 166, 7, '#d6302a', { track: 1 });
  if (o.tabs !== false) for (let i = 0; i < 7; i++) { const tx = 6 + i * 19; if (tx + 16 > w - 16) break; ivLine(tx, 172, tx, h, 0.6, 'rgba(0,0,0,0.25)');
    ctx.save(); ctx.translate(tx + 10, h - 3); ctx.rotate(-Math.PI / 2); ivText(o.phone || '555-0142', 0, 0, 5.2, '#2a2430', { align: 'left', font: IV.sans, weight: 700 }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= 0.55; [[-6, -4, -0.5], [w - 22, -6, 0.5]].forEach(([tx, ty, r]) => { ctx.save(); ctx.translate(tx + 14, ty + 6); ctx.rotate(r); ivRR(-16, -6, 32, 12, 1, '#f3ecd0'); ctx.restore(); }); ctx.restore();
  ctx.restore();
}

// ---- P_phone ------------------------------------------------------------
// anchor: the phone's CENTRE. Natural size 36×75 px. o.ang rotation; o.screen(w, h) draws the screen in local coords
// (w = 360, h = 760 always, whatever the scale); o.back: show the back (camera bump); o.off: dark screen;
// o.glow (default on when a screen is drawn) light spill; o.col case colour. Screens: P_phoneUI.map / call / news / message
function P_phone(x, y, s = 1, o = {}) {
  const k = s * 0.09, BW = 400, BH = 830, SW = 360, SH = 760;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(k, k); ctx.translate(-BW / 2, -BH / 2);
  const lit = !o.back && !o.off && (o.glow ?? !!o.screen);
  if (lit) ivGlow(BW / 2, BH / 2, 620, 'rgba(150,190,255,0.22)');
  const col = o.col || '#22242e';
  // thickness: the edge toward the key light shows as a lighter band (2.5D)
  ivRR(-7, 170, 12, 70, 5, ivShade(col, -0.3)); ivRR(-7, 260, 12, 110, 5, ivShade(col, -0.3)); ivRR(BW - 5, 230, 12, 140, 5, ivShade(col, -0.3));
  ivRR(14 * Math.sign(IV_M.key[0] || 1), 12, BW, BH, 66, ivShade(col, 0.25));
  prop_rim(prop_rr(0, 0, BW, BH, 66), col, 7);
  ctx.save(); prop_rr(0, 0, BW, BH, 66)(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();
  prop_rr(0, 0, BW, BH, 66)(); prop_shade(0, 0, BW, BH, 0.4); ctx.restore();
  ivRR(8, 8, BW - 16, BH - 16, 58, null, 'rgba(0,0,0,0.5)', 5);
  if (o.back) {
    ivRR(34, 34, 170, 190, 44, ivShade(col, 0.08), 'rgba(255,255,255,0.12)', 3);
    [[80, 82], [80, 172], [160, 127]].forEach(([cx, cy]) => { ivDot(cx, cy, 34, '#0b0c12'); ivDot(cx, cy, 24, '#1b2340'); ivDot(cx, cy, 10, '#3a4a80'); ivDot(cx - 8, cy - 8, 5, 'rgba(255,255,255,0.6)'); });
    ivDot(160, 70, 10, '#fff4d8');
    ctx.save(); ctx.globalAlpha = 0.07; ivPoly([[BW * 0.55, 0], [BW, 0], [BW, BH * 0.35], [BW * 0.1, BH]], '#ffffff'); ctx.restore();
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(20, 35); prop_rr(0, 0, SW, SH, 48)(); ctx.clip();
  ctx.fillStyle = '#07080c'; ctx.fillRect(0, 0, SW, SH);
  if (o.screen && !o.off) o.screen(SW, SH);
  ctx.globalAlpha = o.off ? 0.10 : 0.035; ivPoly([[SW * 0.7, 0], [SW, 0], [SW, SH * 0.12], [SW * 0.2, SH], [-10, SH], [-10, SH * 0.9]], '#ffffff'); ctx.globalAlpha = 1;
  ctx.restore();
  ivRR(BW / 2 - 58, 52, 116, 30, 15, '#030305'); ivDot(BW / 2 + 36, 67, 7, '#141a2c');
  ctx.restore();
}
function prop_statusBar(w, time, c = '#eef2ff') {
  ivText(time, 42, 50, 22, c, { align: 'left', font: IV.sans, weight: 700 });
  for (let i = 0; i < 4; i++) ivRR(w - 128 + i * 9, 50 - 6 - i * 4, 6, 6 + i * 4, 1.5, c);
  ivRR(w - 80, 34, 40, 18, 5, null, c, 2); ivRR(w - 77, 37, 26, 12, 3, c); ivRR(w - 38, 40, 3, 6, 1, c);
}
// screens for P_phone's o.screen (w = 360, h = 760)
const P_phoneUI = {
  // a map: o.place ('Old Train Yard'), o.eta ('12 min'), o.pin [u, v] (0..1 of the map area) drops in with o.drop 0..1,
  // o.route 0..1 how much of the dotted route from "you" to the pin is drawn, o.now clock
  map(w, h, o = {}) {
    ctx.fillStyle = '#ece4d2'; ctx.fillRect(0, 0, w, h);
    const r = RNG('pmap').f;
    for (let i = 0; i < 26; i++) ivRR(r() * w - 40, 140 + r() * (h - 260), 50 + r() * 70, 40 + r() * 60, 8, '#e0d5bd');
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(-0.35);
    for (let i = -6; i <= 6; i++) { ivLine(i * 70, -700, i * 70, 700, i % 3 ? 7 : 14, '#fbf7ee'); ivLine(-700, i * 80, 700, i * 80, i % 3 ? 7 : 14, '#fbf7ee'); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-20, h * 0.78); ctx.bezierCurveTo(w * 0.3, h * 0.6, w * 0.5, h * 0.9, w + 20, h * 0.7); ctx.lineWidth = 34; ctx.strokeStyle = '#a9c4d4'; ctx.stroke();
    ivRR(w * 0.08, h * 0.26, 110, 80, 18, '#c4d6a4');
    const P = o.pin || [0.72, 0.34], px = P[0] * w, py = 140 + P[1] * (h - 260), Y = [w * 0.3, h * 0.66];
    const ru = clamp(o.route ?? 1); if (ru > 0) { const Q = (t) => [(1 - t) * (1 - t) * Y[0] + 2 * (1 - t) * t * w * 0.75 + t * t * px, (1 - t) * (1 - t) * Y[1] + 2 * (1 - t) * t * h * 0.62 + t * t * py];
      ctx.beginPath(); for (let i = 0; i <= 40; i++) { const p = Q(i / 40 * ru); i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      ctx.setLineDash([2, 16]); ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#3c7ce6'; ctx.stroke(); ctx.setLineDash([]); }
    const pul = 0.5 + 0.5 * Math.sin(TT * 4); ivDot(...Y, 26 + pul * 10, 'rgba(60,124,230,0.18)'); ivDot(...Y, 14, '#ffffff'); ivDot(...Y, 10, '#3c7ce6');
    const d = EZ.back(clamp(o.drop ?? 1)), dy = (1 - clamp(o.drop ?? 1)) * -80;
    if (d > 0.01) { ctx.save(); ctx.translate(px, py + dy); ctx.scale(d, d); ctx.beginPath(); ctx.ellipse(0, 4, 14, 5, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -36, -26, -72, 0, -72); ctx.bezierCurveTo(26, -72, 30, -36, 0, 0); ctx.fillStyle = '#e5352b'; ctx.fill(); ivDot(0, -48, 10, '#ffffff'); ctx.restore(); }
    ivRR(18, 76, w - 36, 52, 26, '#ffffff'); ctx.beginPath(); ctx.arc(44, 100, 8, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = '#8a8f9e'; ctx.stroke(); ivLine(50, 106, 56, 112, 3, '#8a8f9e');
    ivText(o.place || 'Old Train Yard', 70, 110, 22, '#1e2030', { align: 'left', font: IV.sans, weight: 700 });
    prop_statusBar(w, o.now || '11:58', '#1e2030');
    ivRR(14, h - 150, w - 28, 126, 24, '#ffffff'); ivText(o.place || 'Old Train Yard', 36, h - 104, 24, '#1e2030', { align: 'left', font: IV.sans, weight: 800 });
    ivText(o.eta || '12 min', 36, h - 68, 20, '#2f9c5a', { align: 'left', font: IV.sans, weight: 700 });
    ivRR(w - 128, h - 118, 96, 60, 30, '#3c7ce6'); ivText('GO', w - 80, h - 78, 24, '#ffffff', { font: IV.sans, weight: 800 });
  },
  // a call: o.name ('MOM'), o.status ('calling…' / a timer string), o.incoming (accept + decline buttons), o.avatar letter
  call(w, h, o = {}) {
    ctx.fillStyle = ivVGrad(0, h, ['#2a3150', '#1c2036', '#121420']); ctx.fillRect(0, 0, w, h);
    prop_statusBar(w, o.now || '11:58');
    const pul = 0.5 + 0.5 * Math.sin(TT * 3);
    if (o.incoming || !o.status) { ivDot(w / 2, 240, 90 + pul * 18, 'rgba(255,255,255,0.05)'); ivDot(w / 2, 240, 76 + pul * 8, 'rgba(255,255,255,0.06)'); }
    ivDot(w / 2, 240, 66, '#5a6390'); ivText(o.avatar || (o.name || 'MOM')[0], w / 2, 262, 64, '#e9ecff', { font: IV.sans });
    ivText(o.name || 'MOM', w / 2, 368, 38, '#ffffff', { font: IV.sans, weight: 700 });
    ivText(o.status || 'calling…', w / 2, 406, 20, 'rgba(230,236,255,0.6)', { font: IV.sans, weight: 600 });
    const btn = (bx, c, label, ang) => { ivDot(bx, h - 150, 40, c); ctx.save(); ctx.translate(bx, h - 150); ctx.rotate(ang); ivRR(-18, -7, 36, 14, 7, '#ffffff'); ivRR(-20, -10, 10, 16, 4, '#ffffff'); ivRR(10, -10, 10, 16, 4, '#ffffff'); ctx.restore();
      ivText(label, bx, h - 88, 16, 'rgba(230,236,255,0.7)', { font: IV.sans, weight: 600 }); };
    if (o.incoming) { btn(w * 0.25, '#e5352b', 'Decline', Math.PI * 0.75); btn(w * 0.75, '#34c759', 'Accept', 0); }
    else { ['mute', 'keypad', 'speaker'].forEach((l, i) => { ivDot(w * (0.22 + i * 0.28), h - 300, 34, 'rgba(255,255,255,0.14)'); ivText(l, w * (0.22 + i * 0.28), h - 248, 15, 'rgba(230,236,255,0.6)', { font: IV.sans, weight: 600 }); });
      btn(w / 2, '#e5352b', 'End', Math.PI * 0.75); }
  },
  // a news app headline: o.head, o.kicker ('BREAKING'), o.src, o.photo(w, h) for the picture
  news(w, h, o = {}) {
    ctx.fillStyle = '#f4efe4'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b1d26'; ctx.fillRect(0, 0, w, 150); prop_statusBar(w, o.now || '7:05');
    ivText(o.src || 'CITY 7 NEWS', 30, 126, 30, '#fff3e0', { align: 'left', track: 2 }); ivDot(w - 44, 116, 6, '#e5352b');
    ivRR(30, 184, 150, 36, 8, '#d8342c'); ivText(o.kicker || 'BREAKING', 105, 210, 20, '#ffffff', { track: 2 });
    const y1 = prop_wrap(o.head || 'Headline', 30, 276, w - 60, 36, '#15161d', { lh: 1.12 });
    ctx.save(); const ph = 210, py = y1 + 6; prop_rr(30, py, w - 60, ph, 18)(); ctx.clip();
    if (o.photo) { ctx.translate(30, py); o.photo(w - 60, ph); }
    else { ctx.fillStyle = ivVGrad(py, py + ph, ['#384266', '#5b4a6a', '#b46a5c']); ctx.fillRect(30, py, w - 60, ph);
      ivCat({ x: w / 2, y: py + ph - 10, s: 150, f: -1, coat: IV_COATS.orange, pose: 'sit' }); }
    ctx.restore();
    for (let i = 0; i < 4; i++) ivRR(30, py + ph + 30 + i * 30, (w - 60) * (i === 3 ? 0.55 : 1), 12, 6, 'rgba(20,22,30,0.16)');
  },
  // a text message: o.from, o.text, o.stamp, o.now, o.mine
  message(w, h, o = {}) {
    ctx.fillStyle = ivVGrad(0, h, ['#141826', '#0f121c', '#0b0d14']); ctx.fillRect(0, 0, w, h);
    prop_statusBar(w, o.now || '11:42');
    ivRR(0, 74, w, 120, 0, 'rgba(255,255,255,0.04)'); ivDot(w / 2, 120, 30, '#3a4058'); ivText(o.avatar || (o.from || '?')[0], w / 2, 132, 32, '#c9d2ea', { font: IV.sans });
    ivText(o.from || 'MOM', w / 2, 178, 22, '#eef2ff', { font: IV.sans, weight: 700, track: 2 });
    ctx.save(); ctx.font = `600 30px ${IV.sans}`; const lines = []; let cur = '';
    String(o.text || '').split(' ').forEach((wd) => { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > 236 && cur) { lines.push(cur); cur = wd; } else cur = t; });
    if (cur) lines.push(cur); const tw = Math.max(...lines.map((L) => ctx.measureText(L).width), 60); ctx.restore();
    const bw = tw + 44, bh = lines.length * 38 + 30, mine = !!o.mine, bx = mine ? w - 24 - bw : 24, by = 260, bc = mine ? '#2f7cf6' : '#2c3144';
    ivRR(bx, by, bw, bh, 26, bc); lines.forEach((L, i) => ivText(L, bx + 22, by + 46 + i * 38, 30, '#f4f6ff', { align: 'left', font: IV.sans, weight: 600 }));
    if (o.stamp) ivText(o.stamp, mine ? w - 30 : 30, by + bh + 36, 19, '#9fb0d8', { align: mine ? 'right' : 'left', font: IV.sans, weight: 700 });
  },
};

// ---- the night after: police car -----------------------------------------------
// a car wheel with a hub (rot = spin)
function prop_hwheel(cx, cy, R, rot = 0, hub = '#b9bec8') {
  ctx.save(); ctx.translate(cx, cy); ivDot(0, 0, R, '#141319'); ivDot(0, 0, R * 0.92, '#1d1c23');
  ivDot(0, 0, R * 0.56, ivShade(hub, -0.25)); ivDot(0, 0, R * 0.48, hub); ctx.rotate(rot);
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6; ivLine(0, 0, Math.cos(a) * R * 0.44, Math.sin(a) * R * 0.44, R * 0.09, ivShade(hub, -0.15)); }
  ivDot(0, 0, R * 0.14, '#6a6f7a'); ctx.rotate(-rot);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.82, -2.5, -1.2); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = R * 0.06; ctx.stroke();
  ctx.restore();
}
// P_policeCar: a black-and-white patrol car, side view extruded into a box (roof + the nose end show). anchor:
// bottom-centre (tyres on y). ~1200×470 px. o.dir 1 nose right / −1 left, o.lights 0..1 the light bar sweeping red/blue
// (also throws coloured light around), o.ext [dx, dy] extrusion (default [70, −48]: seen from a bit above), o.rot wheels,
// o.num ('27'), o.head headlights on (default true at night: set it)
function P_policeCar(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, R = 84, [ex, ey] = o.ext || [70, -48], L = clamp(o.lights ?? 0), rot = o.rot ?? 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  prop_shadow(30, 2, 1300, 0.45);
  [-360, 380].forEach((wx) => prop_hwheel(wx + ex * 0.9, -R + ey * 0.9, R, rot, '#5a5f6c'));                     // far wheels
  const body = [[-560, -95], [-575, -205], [-545, -245], [-340, -262], [-235, -385], [170, -385], [300, -262], [520, -240], [570, -200], [565, -95]];
  prop_ext(body, ex, ey, '#1f2433', { top: '#3a4056', side: '#151925', rw: 3 });
  ctx.save(); prop_poly(body)(); ctx.clip();
  ivPoly([[-330, -262], [295, -262], [295, -100], [-330, -100]], '#eef0f4');                                      // white doors
  ivPoly([[-330, -300], [-235, -385], [170, -385], [295, -262], [-330, -262]], '#eef0f4');
  ivRR(-600, -190, 1200, 26, 0, '#2f5fb8'); ivRR(-600, -164, 1200, 6, 0, '#f2c230');
  ctx.restore();
  prop_poly(body)(); prop_shade(-575, -385, 1150, 290, 0.32);
  ivLine(-540, -240, 520, -232, 3, 'rgba(255,255,255,0.3)');
  // glass
  const glass = ivVGrad(-380, -270, ['#2b3346', '#161b28']);
  ivPoly([[-318, -270], [-225, -372], [-40, -372], [-40, -270]], glass); ivPoly([[-20, -270], [-20, -372], [160, -372], [278, -270]], glass);
  ctx.save(); ctx.globalAlpha = 0.16; ivPoly([[-240, -372], [-200, -372], [-280, -270], [-318, -270]], '#fff'); ivPoly([[60, -372], [100, -372], [30, -270], [-10, -270]], '#fff'); ctx.restore();
  ivRR(-40, -378, 20, 112, 4, '#1f2433'); ivLine(-30, -266, -30, -100, 2.5, 'rgba(0,0,0,0.3)');
  ivLine(-330, -100, -330, -262, 2.5, 'rgba(0,0,0,0.3)'); ivLine(295, -100, 295, -262, 2.5, 'rgba(0,0,0,0.3)');
  ivRR(-150, -238, 44, 11, 5, '#9aa0ad'); ivRR(180, -238, 44, 11, 5, '#9aa0ad');
  prop_dText(dir, 'POLICE', -30, -122, 62, '#1f2433', { track: 6 });
  ctx.save(); ctx.translate(140, -215); ivPoly(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 9 : 22, a = -Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * r, Math.sin(a) * r]; }), '#e8b84a'); ctx.restore();
  prop_dText(dir, o.num || '27', -470, -112, 34, '#eef0f4');
  // wheel arches + wheels
  [-360, 380].forEach((wx) => { ctx.beginPath(); ctx.arc(wx, -R, R + 16, Math.PI, 0); ctx.lineTo(wx + R + 16, -88); ctx.lineTo(wx - R - 16, -88); ctx.fillStyle = '#0d0e14'; ctx.fill(); prop_hwheel(wx, -R, R, rot); });
  // lights, bumpers, push bar, mirror
  ivRR(538, -232, 36, 26, 8, '#fff2c4'); ivRR(-580, -238, 20, 44, 6, '#d6302a');
  if (o.head !== false) ivGlow(560, -218, 220, 'rgba(255,240,190,0.5)');
  ivRR(560, -150, 50, 60, 8, '#2a2e3a'); ivRR(596, -190, 18, 110, 6, '#2a2e3a'); ivRR(-590, -150, 30, 52, 6, '#2a2e3a');
  ivPoly([[262, -282], [300, -282], [298, -258], [268, -260]], '#1f2433');
  // the light bar on the roof, extruded too
  const bar = [[-150, -385], [130, -385], [130, -414], [-150, -414]], ph = Math.sin(TT * 9) > 0, on = L > 0.02;
  const bo = [ex * 0.3, ey * 0.3]; prop_ext(bar.map(([a, b]) => [a + bo[0], b + bo[1]]), ex * 0.35, ey * 0.35, '#2a2e3a', { rw: 2 });
  const red = on && ph ? '#ff6a5a' : on ? '#c42a24' : '#7a1a18', blue = on && !ph ? '#7ab0ff' : on ? '#2a5ad8' : '#16306a';
  ivRR(-140 + bo[0], -411 + bo[1], 120, 22, 5, red); ivRR(0 + bo[0], -411 + bo[1], 120, 22, 5, blue);
  if (on) { const cxr = -80 + bo[0], cxb = 60 + bo[0], cy = -400 + bo[1];
    ivGlow(ph ? cxr : cxb, cy, 900 * L, ph ? 'rgba(255,50,40,0.55)' : 'rgba(60,130,255,0.55)', L); ivGlow(ph ? cxr : cxb, cy, 160, ph ? 'rgba(255,170,160,0.9)' : 'rgba(170,200,255,0.9)', L);
    ivGlow(ph ? cxb : cxr, cy, 400 * L, ph ? 'rgba(60,130,255,0.35)' : 'rgba(255,50,40,0.35)', L); }
  ctx.restore();
}

// ---- home: bowl, tuna, TV, shower --------------------------------------------
// P_bowl: a cat food bowl, the rim seen from above (2.5D). anchor: bottom-centre. ~116×44 px. o.full 0..1 kibble mound
// (0 empty), o.water (water instead), o.col bowl colour, o.name painted on the side (e.g. 'PICKLES')
function P_bowl(x, y, s = 1, o = {}) {
  const c = o.col || '#5aa9e6', rx = 58, ry = 15, top = -40, full = clamp(o.full ?? 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, 130, 0.35);
  const body = () => { ctx.beginPath(); ctx.moveTo(-rx, top); ctx.lineTo(-rx * 0.74, -4); ctx.ellipse(0, -4, rx * 0.74, ry * 0.7, 0, Math.PI, 0, true); ctx.lineTo(rx, top); ctx.ellipse(0, top, rx, ry, 0, 0, Math.PI); ctx.closePath(); };
  prop_rim(body, c, 2); body(); prop_cyl(-rx, rx, top - ry, 0, 0.4);
  ctx.save(); ctx.translate(-22, -20); ctx.scale(0.5, 0.5); ivDot(0, 4, 8, 'rgba(255,255,255,0.75)'); [[-10, -8], [-3, -13], [5, -13], [11, -7]].forEach(([a, b]) => ivDot(a, b, 3.6, 'rgba(255,255,255,0.75)')); ctx.restore();
  if (o.name) ivText(o.name, 10, -16, 11, 'rgba(255,255,255,0.85)', { track: 1 });
  ctx.beginPath(); ctx.ellipse(0, top, rx, ry, 0, 0, TAU); ctx.fillStyle = ivShade(c, 0.25); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, top + 1.5, rx - 7, ry - 4, 0, 0, TAU); ctx.fillStyle = ivShade(c, -0.45); ctx.fill();
  if (o.water) { ctx.beginPath(); ctx.ellipse(0, top + 3, rx - 9, ry - 6, 0, 0, TAU); ctx.fillStyle = 'rgba(160,210,240,0.85)'; ctx.fill(); ctx.beginPath(); ctx.ellipse(-12, top + 1, 16, 2.5, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill(); }
  else if (full > 0) { const hh = 4 + full * 18, r = RNG('kib').f;
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, top + 1.5, rx - 7, ry - 4, 0, 0, Math.PI); ctx.ellipse(0, top - hh + 6, (rx - 9) * (0.6 + full * 0.4), hh, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = '#9a5a2e'; ctx.fill(); ctx.clip();
    for (let i = 0; i < 46; i++) { const kx = (r() - 0.5) * (rx - 8) * 2, ky = top + 6 - r() * (hh + 6); ctx.beginPath(); ctx.ellipse(kx, ky, 4.2, 3, r() * 3, 0, TAU); ctx.fillStyle = ['#b8733c', '#8a4c24', '#c98a4e'][i % 3]; ctx.fill(); ivDot(kx - 1, ky - 1, 1.1, 'rgba(255,230,190,0.5)'); }
    ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(0, top, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
// P_tunaCan: a tuna can (blue label, pull-tab lid). anchor: bottom-centre. ~66×42 px. o.open: the lid peeled back, tuna showing
function P_tunaCan(x, y, s = 1, o = {}) {
  const rx = 32, ry = 9, hh = 28;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, 76, 0.32);
  const side = () => { ctx.beginPath(); ctx.moveTo(-rx, -hh); ctx.lineTo(-rx, -2); ctx.ellipse(0, -2, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(rx, -hh); ctx.closePath(); };
  prop_rim(side, '#c9ced8', 1.6);
  ctx.save(); side(); ctx.clip(); ivRR(-rx, -hh + 5, rx * 2, hh - 9, 0, '#2f6fb8'); ivRR(-rx, -hh + 5, rx * 2, 3, 0, '#f2c230');
  ctx.save(); ctx.translate(-4, -14); ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, TAU); ctx.fillStyle = '#f2e6d0'; ctx.fill(); ivPoly([[9, 0], [17, -5], [17, 5]], '#f2e6d0'); ivDot(-6, -1, 1, '#2f6fb8'); ctx.restore();
  ivText('TUNA', 16, -10, 7, '#ffffff', { track: 0.5 }); ctx.restore();
  side(); prop_cyl(-rx, rx, -hh - ry, 10, 0.42);
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(0, -4 - i * (hh - 6), rx, ry, 0, 0, Math.PI); ctx.strokeStyle = 'rgba(80,90,110,0.45)'; ctx.lineWidth = 1.2; ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -hh, rx, ry, 0, 0, TAU); ctx.fillStyle = '#b9bec8'; ctx.fill();
  if (o.open) { ctx.beginPath(); ctx.ellipse(0, -hh + 1, rx - 3, ry - 2, 0, 0, TAU); ctx.fillStyle = '#e8a59a'; ctx.fill();
    const r = RNG('tuna').f; for (let i = 0; i < 18; i++) ivRR(-22 + r() * 40, -hh - 4 + r() * 8, 6, 2.5, 1.2, ['#f2c0b4', '#d98a7e'][i % 2]);
    ctx.save(); ctx.translate(0, -hh - ry + 1); ctx.rotate(-0.15); ctx.beginPath(); ctx.ellipse(0, -20, rx - 2, 22, 0, 0, TAU); ctx.fillStyle = '#d8dce4'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -20, rx - 8, 16, 0, 0, TAU); ctx.strokeStyle = 'rgba(80,90,110,0.35)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
  else { for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, -hh, rx - i * 6, ry - i * 1.8, 0, 0, TAU); ctx.strokeStyle = 'rgba(80,90,110,0.3)'; ctx.lineWidth = 1; ctx.stroke(); }
    ivRR(6, -hh - 4, 16, 7, 3.5, null, '#8a909c', 2); ivDot(4, -hh, 2, '#8a909c'); }
  ctx.beginPath(); ctx.ellipse(0, -hh, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.restore();
}
// P_tv: a flat TV on a little stand, its thickness showing. anchor: bottom-centre (the stand foot). ~440×290 px.
// o.screen(w, h) draws the picture in local coords (w = 400, h = 225); o.off dark glass; o.wall: no stand (hung, anchor = bottom edge)
function P_tv(x, y, s = 1, o = {}) {
  const SW = 400, SH = 225, bw = 12, W2 = SW + bw * 2, H2 = SH + bw * 2, by = o.wall ? 0 : -44;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.wall) { prop_shadow(0, 0, 240, 0.35); prop_ext([[-90, -8], [90, -8], [90, 0], [-90, 0]], 10, -8, '#1d1f28', { rw: 1.5 }); ivRR(-14, -46, 28, 40, 3, '#23252e'); }
  const on = !o.off && !!o.screen;
  if (on) ivGlow(0, by - H2 / 2, 520, 'rgba(150,190,255,0.18)');
  const P = [[-W2 / 2, by - H2], [W2 / 2, by - H2], [W2 / 2, by], [-W2 / 2, by]];
  prop_ext(P, -IV_M.key[0] * 14 || 12, -10, '#14151c', { top: '#2a2c36', side: '#0c0d12', rw: 2.5 });
  ctx.save(); ctx.translate(-SW / 2, by - H2 + bw); ctx.beginPath(); ctx.rect(0, 0, SW, SH); ctx.clip();
  ctx.fillStyle = '#07080c'; ctx.fillRect(0, 0, SW, SH);
  if (on) o.screen(SW, SH);
  ctx.globalAlpha = on ? 0.05 : 0.12; ivPoly([[SW * 0.55, 0], [SW * 0.8, 0], [SW * 0.4, SH], [SW * 0.15, SH]], '#ffffff'); ctx.globalAlpha = 1;
  ctx.restore();
  ivLine(-W2 / 2 + 3, by - H2 + 2, W2 / 2 - 3, by - H2 + 2, 1.5, 'rgba(255,255,255,0.18)');
  ivDot(W2 / 2 - 14, by - 5, 2.2, on ? '#5df07a' : '#e5352b');
  ctx.restore();
}
// P_showerHead: a chrome shower arm + head with water. anchor: the WALL FLANGE (the arm comes out of the wall at x, y).
// ~220×110 px + the water. o.dir 1 the head reaches right / −1 left, o.on (true) water, o.len how far the water falls (620),
// o.flow 0..1 strength
function P_showerHead(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, len = o.len ?? 620, fl = o.on === false ? 0 : clamp(o.flow ?? 1);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const hx = 150, hy = 60;
  // water first (behind the head's face)
  if (fl > 0) { const r = RNG('shower').f;
    for (let i = 0; i < 46; i++) { const sx = (r() - 0.5) * 70, sp = (r() - 0.5) * 0.5 + 0.12, ph = r(), sd = 1 + r() * 0.4;
      for (let k = 0; k < 3; k++) { const t = mod(TT * 1.6 * sd + ph + k / 3, 1), yy = hy + 16 + t * len, xx = hx + sx + sp * t * len * 0.6;
        ivLine(xx, yy, xx + sp * 6, yy + 26, 2.2, `rgba(200,230,255,${0.55 * fl * (1 - t * 0.6)})`); } }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gw = ctx.createLinearGradient(0, hy, 0, hy + len); gw.addColorStop(0, `rgba(191,224,255,${0.1 * fl})`); gw.addColorStop(1, 'rgba(191,224,255,0)'); ivPoly([[hx - 40, hy + 14], [hx + 40, hy + 14], [hx + 40 + len * 0.3, hy + len], [hx - 40 - len * 0.1, hy + len]], gw); ctx.restore(); }
  prop_rimDo((rc) => { ivDot(0, 0, 22, rc || '#aeb4bf'); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(hx - 50, 18); ctx.quadraticCurveTo(hx - 20, 24, hx - 12, hy - 22); ctx.lineWidth = 15; ctx.strokeStyle = rc || '#b9bec8'; ctx.stroke(); }, 2);
  ivLine(4, -4, hx - 52, 12, 3, 'rgba(255,255,255,0.65)'); ivDot(0, 0, 14, '#d8dce4'); ivDot(-5, -5, 4, 'rgba(255,255,255,0.8)');
  // the head: a dome + a face tilted toward the camera
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.25);
  prop_rim(() => { ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(14, -30); ctx.lineTo(48, 4); ctx.lineTo(-48, 4); ctx.closePath(); }, '#aeb4bf', 2);
  ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(14, -30); ctx.lineTo(48, 4); ctx.lineTo(-48, 4); ctx.closePath(); prop_cyl(-48, 48, -30, 6, 0.4);
  ctx.beginPath(); ctx.ellipse(0, 6, 50, 16, 0, 0, TAU); ctx.fillStyle = '#d8dce4'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 7, 42, 12, 0, 0, TAU); ctx.fillStyle = '#9aa0ad'; ctx.fill();
  for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 6 + ring * 6; i++) { const a = i / (6 + ring * 6) * TAU; ivDot(Math.cos(a) * ring * 13, 7 + Math.sin(a) * ring * 3.7, 1.6, '#3a3f4a'); }
  ctx.beginPath(); ctx.ellipse(0, 6, 50, 16, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ---- animals: dog, pigeon, moth, mouse ------------------------------------------
// shape builders in a 100-unit animal (facing right, y up negative)
const prop_el = (x, y, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, TAU); return p; };
function prop_cap(x1, y1, x2, y2, w) { const p = new Path2D(), a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2;
  p.moveTo(x1 + nx, y1 + ny); p.lineTo(x2 + nx, y2 + ny); p.arc(x2, y2, w / 2, a + Math.PI / 2, a - Math.PI / 2, true); p.lineTo(x1 - nx, y1 - ny); p.arc(x1, y1, w / 2, a - Math.PI / 2, a + Math.PI / 2, true); p.closePath(); return p; }
// rim pass for Path2D parts + stroked parts (tail): offset toward the key light by ~3 screen px
function prop_animalRim(parts, strokes, sc) {
  const k = IV_M.key; ctx.save(); ctx.translate(k[0] * 3.2 / sc, k[1] * 3.2 / sc); ctx.fillStyle = IV_M.rim; ctx.strokeStyle = IV_M.rim; ctx.lineWidth = 4 / sc; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  strokes.forEach((f) => f(IV_M.rim, 4 / sc)); for (const p of parts) { ctx.fill(p); ctx.stroke(p); } ctx.restore();
}
function prop_sheen(p, cx, cy, rr) { const k = IV_M.key; ctx.save(); ctx.clip(p); const gx = cx + k[0] * rr * 0.45, gy = cy + k[1] * rr * 0.45, g = ctx.createRadialGradient(gx, gy, rr * 0.05, cx, cy, rr * 1.25);
  g.addColorStop(0, 'rgba(255,245,230,0.18)'); g.addColorStop(0.65, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.24)'); ctx.fillStyle = g; ctx.fillRect(cx - rr * 1.6, cy - rr * 1.6, rr * 3.2, rr * 3.2); ctx.restore(); }

// P_dog: a scruffy brown dog in the ivCat manner (rim light, sheen, floppy ears, red collar). anchor: the ground point
// under its body. s = 1 → ~200 px tall sitting (next to a 520-px actor). o.f facing (−1 left / 1 right), o.pose 'sit' | 'stand' | 'bark'
// (bark: braced legs, head forward, the mouth snapping open on a rhythm, bark lines), o.wag 0..1 tail wag amount (1),
// o.talk a VOICE line id, o.expr { eyes: open|closed|happy|wide, brow: angry|up }, o.col / o.col2 / o.belly coat, o.key
function P_dog(x, y, s = 1, o = {}) {
  const S = s * 1.9, sx = (o.f ?? 1) < 0 ? -1 : 1, pose = o.pose || 'sit', bark = pose === 'bark', sit = pose === 'sit', e = o.expr || {};
  const col = o.col || '#b07440', dk = o.col2 || ivShade(col, -0.35), lt = o.belly || '#f1dcc0', key = o.key || 'dog';
  const T = TT + (hash(key) % 100) / 37, sc = ctx.getTransform().a * S;
  const bk = bark ? Math.pow(Math.max(0, Math.sin(T * 6.5)), 0.6) : 0, tk = o.talk ? ivTalk(o.talk) : 0;
  const mOpen = Math.max(tk, bark ? 0.6 + 0.4 * bk : 0, e.mouth === 'open' ? 0.7 : 0);
  let head, tail, legs = [], body = [], paws = [], chest;
  if (sit) {
    body.push(prop_el(-14, -26, 30, 26), prop_el(8, -50, 20, 32, -0.35)); legs.push(prop_cap(12, -42, 13, -4, 10), prop_cap(24, -42, 26, -4, 10));
    paws.push([-28, -4, 15, 6], [14, -3, 7, 4.5], [27, -3, 7, 4.5]); head = [24, -92, 21]; chest = [16, -50, 10, 20, -0.35];
    const wa = Math.PI - 0.15 - Math.abs(Math.sin(T * 9)) * 0.55 * (o.wag ?? 1); tail = [[-40, -10], wa, 0.3];
  } else {
    const fw = bark ? 6 : 0, lift = bark ? bk * 3 : 0;
    body.push(prop_el(-4, -54 - lift, 40, 20), prop_el(26, -60 - lift, 19, 21)); chest = [32, -54 - lift, 9, 14, 0];
    [[30, fw], [18, fw * 0.6], [-28, -fw * 0.5], [-38, -fw * 0.7]].forEach(([lx, dx]) => legs.push(prop_cap(lx, -50 - lift, lx + dx, -4, 10)));
    paws.push([30 + fw + 3, -3, 7, 4.5], [18 + fw * 0.6 + 3, -3, 7, 4.5], [-28 - fw * 0.5 + 3, -3, 7, 4.5], [-38 - fw * 0.7 + 3, -3, 7, 4.5]);
    head = bark ? [52 + bk * 3, -90 - lift - bk * 3, 20] : [46, -88, 20];
    const wa = -2.3 + Math.sin(T * (bark ? 18 : 10)) * 0.5 * (o.wag ?? 1); tail = [[-42, -62 - lift], wa, -0.5];
  }
  const [hx, hy, hr] = head, tilt = bark ? -0.12 - bk * 0.08 : 0;
  const tailDraw = (c, ext = 0) => { const [[tx, ty], a, curl] = tail, m = [tx + Math.cos(a) * 18, ty + Math.sin(a) * 18], t2 = [m[0] + Math.cos(a + curl) * 18, m[1] + Math.sin(a + curl) * 18];
    ctx.save(); ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 9 + ext; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(m[0], m[1], t2[0], t2[1]); ctx.stroke(); ctx.restore(); };
  const headP = prop_el(hx, hy, hr * 1.05, hr * 0.95), snout = prop_el(hx + hr * 0.9, hy + hr * 0.32, hr * 0.72, hr * 0.48, tilt);
  const earB = prop_el(hx + hr * 0.35, hy - hr * 0.8, hr * 0.28, hr * 0.5, 0.5);
  const earF = prop_el(hx - hr * 0.38, hy + hr * 0.15 - (bark ? bk * 4 : 0), hr * 0.36, hr * 0.85, bark ? 0.7 : 0.32);
  const pawP = paws.map(([a, b, rx, ry]) => prop_el(a, b, rx, ry));
  const all = [...legs, ...body, ...pawP, earB, headP, snout, earF];
  ctx.save(); ctx.translate(x, y); ctx.scale(sx * S, S);
  prop_animalRim(all, [(c, w) => tailDraw(c, w)], sc);
  tailDraw(col); ctx.fillStyle = dk; ctx.fill(earB); ctx.fillStyle = col; for (const p of [...legs, ...body, headP, snout]) ctx.fill(p);
  ctx.fillStyle = lt; for (const p of pawP) ctx.fill(p); ctx.fill(prop_el(...chest)); ctx.fill(snout);
  ctx.fill(prop_el(hx + hr * 0.25, hy - hr * 0.55, hr * 0.12, hr * 0.32, 0.2));                                   // the blaze
  prop_sheen(new Path2D(headP), hx, hy, hr); body.forEach((p) => prop_sheen(p, sit ? -6 : 0, sit ? -40 : -56, sit ? 40 : 40));
  // the mouth: closed smile, or open with tongue and a lower jaw
  const mx = hx + hr * 1.05, my = hy + hr * 0.62;
  if (mOpen > 0.12) { ctx.save(); ctx.translate(mx, my); ctx.rotate(tilt); ctx.fillStyle = '#4a1418'; ctx.beginPath(); ctx.moveTo(-hr * 0.45, -3); ctx.lineTo(hr * 0.62, -5); ctx.quadraticCurveTo(hr * 0.6, mOpen * hr * 1.2, hr * 0.15, mOpen * hr * 1.05); ctx.quadraticCurveTo(-hr * 0.4, mOpen * hr * 0.8, -hr * 0.45, -3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e46a78'; ctx.beginPath(); ctx.ellipse(hr * 0.05, mOpen * hr * 0.75, hr * 0.28, hr * 0.12 + mOpen * 3.5, 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = lt; ctx.beginPath(); ctx.ellipse(hr * 0.1, mOpen * hr * 1.0 + 2, hr * 0.5, hr * 0.14, 0.12 + mOpen * 0.15, 0, TAU); ctx.fill();
    ivPoly([[hr * 0.42, -2], [hr * 0.36, 4], [hr * 0.3, -2]], '#fff8ec'); ctx.restore(); }
  else { ctx.strokeStyle = '#3a2016'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx + hr * 0.55, hy + hr * 0.55); ctx.quadraticCurveTo(hx + hr * 0.9, hy + hr * 0.78, hx + hr * 1.45, hy + hr * 0.5); ctx.stroke(); }
  // nose, eyes, brows
  const nx = hx + hr * 1.55, ny = hy + hr * 0.12 + (bark ? -2 : 0);
  ctx.fillStyle = '#16100e'; ctx.beginPath(); ctx.ellipse(nx, ny, 5.2, 4, 0, 0, TAU); ctx.fill(); ivDot(nx - 1.5, ny - 1.5, 1.4, 'rgba(255,255,255,0.7)');
  let eyes = e.eyes || (bark ? 'open' : 'open'); if (eyes === 'open' && mod(F + hash(key), Math.round(FPS * 4.2)) < 3) eyes = 'closed';
  [[hx + hr * 0.3, hy - hr * 0.22, 1], [hx + hr * 0.92, hy - hr * 0.26, 0.82]].forEach(([ex, ey, k2]) => {
    if (eyes === 'closed') { ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(ex, ey, 3.6 * k2, 0.2, Math.PI - 0.2); ctx.stroke(); return; }
    if (eyes === 'happy') { ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(ex, ey + 2, 3.6 * k2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); return; }
    const wk = eyes === 'wide' ? 1.3 : 1; if (wk > 1) ivDot(ex, ey, 5.4 * k2, '#fff6e6');
    ctx.fillStyle = '#1a0f0a'; ctx.beginPath(); ctx.ellipse(ex, ey, 3.4 * k2 * wk, 4 * k2 * wk, 0, 0, TAU); ctx.fill(); ivDot(ex + 1.2, ey - 1.5, 1.2 * k2, '#fff6e0');
    const br = e.brow || (bark ? 'angry' : null); if (br) { ctx.save(); ctx.translate(ex, ey - 7 * k2 - (br === 'up' ? 2 : 0)); ctx.rotate(br === 'angry' ? 0.45 : br === 'up' ? -0.2 : 0); ivLine(-4 * k2, 0, 4 * k2, 0, 2, dk); ctx.restore(); } });
  ctx.fillStyle = dk; ctx.fill(earF); prop_sheen(earF, hx - hr * 0.38, hy, hr * 0.6);
  // the collar + its tag
  const c1 = [hx - hr * 0.75, hy + hr * 0.62], c2 = [hx + hr * 0.15, hy + hr * 1.02];
  ivLine(c1[0], c1[1], c2[0], c2[1], 5.5, '#d6302a'); ivLine(c1[0], c1[1] - 1.5, c2[0], c2[1] - 1.5, 1.2, 'rgba(255,255,255,0.35)'); ivDot(lerp(c1[0], c2[0], 0.65), lerp(c1[1], c2[1], 0.65) + 5, 3.4, '#e8b84a');
  if (bark && bk > 0.35) { ctx.save(); ctx.globalAlpha *= (bk - 0.35) / 0.65; ctx.strokeStyle = '#fff1d6'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    [-0.5, 0, 0.5].forEach((a) => { const r0 = hr * 1.3 + bk * 6, r1 = r0 + 12; ctx.beginPath(); ctx.moveTo(mx + hr * 0.6 + Math.cos(a) * r0, my + Math.sin(a) * r0); ctx.lineTo(mx + hr * 0.6 + Math.cos(a) * r1, my + Math.sin(a) * r1); ctx.stroke(); }); ctx.restore(); }
  ctx.restore();
  return { head: [x + sx * hx * S, y + hy * S], r: hr * S };
}
// P_pigeon: a city pigeon (grey, iridescent neck, orange eye). anchor: the feet on the ground. ~62 px tall at s = 1.
// o.f facing, o.peck 0..1 (default: bobbing pecks), o.fly: wings up flapping (no legs), o.key
function P_pigeon(x, y, s = 1, o = {}) {
  const S = s * 0.62, sx = (o.f ?? 1) < 0 ? -1 : 1, T = TT + (hash(o.key || 'pig' + (x | 0)) % 100) / 23, sc = ctx.getTransform().a * S;
  const pk = o.peck ?? Math.pow(Math.max(0, Math.sin(T * 3.2)), 6), fly = !!o.fly;
  const hx = 24 + pk * 10, hy = -70 + pk * 22, col = '#8a909e', dk = '#5e6472';
  const body = prop_el(0, -40, 30, 20, -0.25), headP = prop_el(hx, hy, 11, 10.5), neck = prop_cap(10, -52, hx - 2, hy + 3, 15);
  const tail = new Path2D(); tail.moveTo(-22, -40); tail.lineTo(-52, -26); tail.quadraticCurveTo(-52, -14, -44, -14); tail.lineTo(-16, -28); tail.closePath();
  const fa = fly ? Math.sin(T * 22) : 0, wing = fly ? (() => { const p = new Path2D(); p.moveTo(-4, -50); p.lineTo(-30, -50 - 40 * (0.3 + 0.7 * Math.abs(fa))); p.lineTo(8, -54 - 34 * (0.3 + 0.7 * Math.abs(fa))); p.closePath(); return p; })() : prop_el(-8, -42, 22, 12, -0.2);
  ctx.save(); ctx.translate(x, y); ctx.scale(sx * S, S);
  if (!fly) { ctx.strokeStyle = '#d97a7a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; [[-2, 0], [8, 2]].forEach(([fx, d]) => { ctx.beginPath(); ctx.moveTo(fx, -22); ctx.lineTo(fx + d * 0.3, 0); ctx.moveTo(fx - 5, 0); ctx.lineTo(fx + 7, 0); ctx.stroke(); }); }
  prop_animalRim([tail, body, neck, headP, wing], [], sc);
  ctx.fillStyle = dk; ctx.fill(tail); ctx.fillStyle = col; ctx.fill(body); ctx.fill(neck); ctx.fill(headP);
  const g = ctx.createLinearGradient(8, -60, 22, -46); g.addColorStop(0, '#5fae8a'); g.addColorStop(1, '#9a6ab4'); ctx.fillStyle = g; ctx.globalAlpha = 0.8; ctx.fill(prop_el(13, -54, 9, 10)); ctx.globalAlpha = 1;
  prop_sheen(body, 0, -40, 30); prop_sheen(headP, hx, hy, 11);
  ctx.fillStyle = '#a7adba'; ctx.fill(wing); ivLine(-14, -40, 2, -44, 3, '#3a3f4a'); ivLine(-18, -34, -2, -38, 3, '#3a3f4a');
  ivPoly([[hx + 9, hy - 2], [hx + 19, hy + 2], [hx + 9, hy + 3]], '#3a3438'); ivDot(hx + 8, hy - 4, 2.5, '#f2f0ea');
  ivDot(hx + 3, hy - 3, 3.2, '#e8862c'); ivDot(hx + 3.4, hy - 3, 1.6, '#120c0a');
  ctx.restore();
}
// P_moth: a fluttering moth (pale wings with eye-spots, feathery antennae). anchor: its CENTRE (it jitters around it).
// ~40×30 px at s = 1. o.still: no drift, o.flap 0..1 wing opening override, o.key
function P_moth(x, y, s = 1, o = {}) {
  const T = TT + (hash(o.key || 'moth') % 100) / 17, S = s * 0.4, sc = ctx.getTransform().a * S;
  const dx = o.still ? 0 : (Math.sin(T * 3.1) * 10 + Math.sin(T * 7.3) * 4) * s, dy = o.still ? 0 : (Math.sin(T * 4.3) * 7 + Math.cos(T * 9.1) * 3) * s;
  const fl = o.flap ?? (0.2 + 0.8 * Math.abs(Math.sin(T * 26)));
  ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(Math.sin(T * 2.3) * 0.25); ctx.scale(S, S);
  const wings = (side) => { const fw = new Path2D(), hw = new Path2D(), k = side * fl;
    fw.moveTo(0, -4); fw.bezierCurveTo(20 * k, -30, 50 * k, -34, 52 * k, -14); fw.bezierCurveTo(46 * k, 0, 20 * k, 6, 0, 4); fw.closePath();
    hw.moveTo(0, 2); hw.bezierCurveTo(26 * k, 4, 40 * k, 18, 30 * k, 30); hw.bezierCurveTo(16 * k, 32, 4 * k, 18, 0, 8); hw.closePath(); return [fw, hw]; };
  const [lf, lh] = wings(-1), [rf, rh] = wings(1), bodyP = prop_el(0, 4, 6.5, 20);
  prop_animalRim([lh, rh, lf, rf, bodyP], [], sc);
  ctx.fillStyle = '#c9b48e'; ctx.fill(lh); ctx.fill(rh); ctx.fillStyle = '#e2d4b4'; ctx.fill(lf); ctx.fill(rf);
  [-1, 1].forEach((k) => { ivDot(30 * k * fl, -14, 6, '#6a5238'); ivDot(30 * k * fl, -14, 3, '#efe2c8'); ivLine(8 * k * fl, -6, 44 * k * fl, -20, 1.2, 'rgba(120,90,60,0.4)'); ivDot(20 * k * fl, 18, 3.5, 'rgba(120,90,60,0.5)'); });
  ctx.fillStyle = '#7a5a3c'; ctx.fill(bodyP); for (let i = 0; i < 4; i++) ivLine(-5, 2 + i * 6, 5, 2 + i * 6, 1.2, 'rgba(60,40,20,0.5)');
  ctx.strokeStyle = '#6a5238'; ctx.lineWidth = 1.6; [-1, 1].forEach((k) => { ctx.beginPath(); ctx.moveTo(k * 2, -14); ctx.quadraticCurveTo(k * 8, -30, k * 18, -34); ctx.stroke();
    for (let i = 1; i < 5; i++) { const t = i / 5, px = lerp(k * 2, k * 18, t), py = lerp(-14, -34, t); ivLine(px, py, px + k * 4, py + 2, 1, '#6a5238'); } });
  ivDot(0, -14, 6, '#8a6a48');
  ctx.restore();
}
// P_mouse: a little grey mouse (big pink ears, long tail). anchor: the ground point under it. ~56×30 px at s = 1 (+ tail).
// o.f facing, o.run: legs + body bob scamper, o.key
function P_mouse(x, y, s = 1, o = {}) {
  const S = s * 0.5, sx = (o.f ?? 1) < 0 ? -1 : 1, T = TT + (hash(o.key || 'mouse') % 100) / 19, sc = ctx.getTransform().a * S, run = !!o.run;
  const bob = run ? Math.abs(Math.sin(T * 20)) * 3 : 0, col = '#9a96a0';
  const body = prop_el(0, -20 - bob, 28, 18), head = new Path2D(); head.moveTo(18, -34 - bob); head.quadraticCurveTo(40, -32 - bob, 50, -20 - bob); head.quadraticCurveTo(40, -10 - bob, 18, -10 - bob); head.closePath();
  const ear = prop_el(22, -40 - bob, 11, 12);
  const tailF = (c, w = 0) => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 3 + w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-24, -12 - bob); ctx.bezierCurveTo(-50, -4 + Math.sin(T * 6) * 8, -70, -24 + Math.sin(T * 6 + 1) * 10, -90, -10 + Math.sin(T * 6 + 2) * 6); ctx.stroke(); ctx.restore(); };
  ctx.save(); ctx.translate(x, y); ctx.scale(sx * S, S);
  prop_shadow(4, 0, 64, 0.3);
  prop_animalRim([body, head, ear], [(c, w) => tailF(c, w)], sc);
  tailF('#d9a3a8'); ctx.fillStyle = col; ctx.fill(body); ctx.fill(head); ctx.fill(ear);
  ctx.fillStyle = '#efb3bb'; ctx.fill(prop_el(22, -40 - bob, 7, 8)); prop_sheen(body, 0, -20, 28);
  ctx.fillStyle = '#d8d2cc'; ctx.fill(prop_el(4, -9 - bob, 18, 6));
  [[-16, 0], [-6, 1], [12, 2], [20, 3]].forEach(([fx, i]) => { const p = run ? Math.sin(T * 20 + i * 1.6) * 5 : 0; ctx.fillStyle = '#e8a8b0'; ctx.beginPath(); ctx.ellipse(fx + p, -2, 5, 2.6, 0, 0, TAU); ctx.fill(); });
  ivDot(36, -26 - bob, 2.8, '#120c0a'); ivDot(37, -27 - bob, 0.9, '#ffffff'); ivDot(50, -20 - bob, 3, '#e88a9a');
  ctx.strokeStyle = 'rgba(255,248,235,0.7)'; ctx.lineWidth = 0.8; [[-4, 1], [2, 1], [7, 0.8]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(48, -19 - bob); ctx.lineTo(48 + 16 * b, -19 - bob + a); ctx.stroke(); });
  ctx.restore();
}

// ---- the basement, the garage ---------------------------------------------------
// P_pipe: a leaking pipe with a collar joint, dripping. anchor: the JOINT's centre. The pipe runs o.len px each way (500),
// radius 22. o.ang rotation (0 horizontal), o.col ('#7d8a8f'), o.drip (true) drops falling o.floor px below (300) with
// a splash, o.rust 0..1
function P_pipe(x, y, s = 1, o = {}) {
  const L = o.len ?? 500, r = 22, c = o.col || '#7d8a8f', fl = o.floor ?? 300;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.ang || 0);
  const tube = (x0, x1, rr, cc) => { const g = ctx.createLinearGradient(0, -rr, 0, rr), up = IV_M.key[1] < 0;
    g.addColorStop(0, up ? ivShade(cc, 0.3) : ivShade(cc, -0.4)); g.addColorStop(0.3, ivShade(cc, 0.12)); g.addColorStop(0.65, cc); g.addColorStop(1, up ? ivShade(cc, -0.45) : ivShade(cc, 0.25));
    prop_rim(prop_rr(x0, -rr, x1 - x0, rr * 2, 3), g, 2); ivLine(x0 + 2, -rr * 0.45, x1 - 2, -rr * 0.45, rr * 0.18, 'rgba(255,255,255,0.22)'); };
  tube(-L, L, r, c);
  [-L * 0.75, L * 0.7].forEach((bx) => { ivRR(bx - 7, -r - 10, 14, r * 2 + 20, 3, '#4a4f58'); ivDot(bx, -r - 5, 2.5, '#2a2e36'); });       // wall brackets
  const ru = o.rust ?? 0.6, R2 = RNG('rust').f; ctx.save(); prop_rr(-L, -r, L * 2, r * 2, 3)(); ctx.clip();
  for (let i = 0; i < 9; i++) { ctx.globalAlpha = 0.35 * ru; ivDot((R2() - 0.5) * 120, (R2() - 0.3) * r * 1.6, 6 + R2() * 12, '#8a4a24'); } ctx.restore();
  tube(-34, 34, r * 1.35, ivShade(c, -0.1));
  [-24, -8, 8, 24].forEach((bx) => { ivDot(bx, -r * 1.2, 3, '#4a4f58'); ivDot(bx - 0.8, -r * 1.25, 1.2, 'rgba(255,255,255,0.5)'); });
  if (o.drip !== false) { const rot = o.ang || 0; ctx.save(); ctx.rotate(-rot);
    const bx = Math.sin(rot) * r * 1.35 + 6, by = Math.cos(rot) * r * 1.35;
    ivPoly([[bx - 14, by - 6], [bx + 14, by - 6], [bx + 6, by + 3], [bx - 6, by + 3]], 'rgba(40,60,70,0.35)');              // wet stain
    for (let k = 0; k < 2; k++) { const t = mod(TT / 1.3 + k * 0.5, 1);
      if (t < 0.55) { const g = t / 0.55; ctx.beginPath(); ctx.ellipse(bx, by + 2 + g * 5, 3 + g * 3, 3 + g * 5, 0, 0, TAU); ctx.fillStyle = 'rgba(190,225,240,0.9)'; ctx.fill(); }
      else { const f = (t - 0.55) / 0.45, dy = by + 10 + f * f * fl; if (dy < by + fl) { ctx.beginPath(); ctx.moveTo(bx, dy - 12); ctx.quadraticCurveTo(bx + 5, dy, bx, dy + 4); ctx.quadraticCurveTo(bx - 5, dy, bx, dy - 12); ctx.fillStyle = 'rgba(190,225,240,0.9)'; ctx.fill(); } }
      const sp = mod(TT / 1.3 + k * 0.5 - 0.98, 1); if (sp < 0.25) { const q = sp / 0.25; ctx.beginPath(); ctx.ellipse(bx, by + fl + 10, 6 + q * 34, 2 + q * 6, 0, 0, TAU); ctx.strokeStyle = `rgba(190,225,240,${0.8 * (1 - q)})`; ctx.lineWidth = 2; ctx.stroke();
        [-1, 1].forEach((d) => ivDot(bx + d * q * 18, by + fl + 4 - Math.sin(q * Math.PI) * 18, 2.4, `rgba(190,225,240,${1 - q})`)); } }
    ctx.restore(); }
  ctx.restore();
}
// P_gasMeter: a wall gas meter (a box with dials and a counter) on yellow pipes with a valve, and a hissing leak wisp.
// anchor: bottom-centre of the meter box (the pipes run o.pipe px further down, 220). ~170×200 px + pipes.
// o.leak 0..1 the wisp (default 0), o.spin dial speed (0.3)
function P_gasMeter(x, y, s = 1, o = {}) {
  const w = 170, h = 200, lk = clamp(o.leak || 0), pd = o.pipe ?? 220, yel = '#e8b830';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pipe = (px) => prop_rimDo((rc) => { ivRR(px - 9, -4, 18, pd, 4, rc || yel); ivRR(px - 13, -2, 26, 14, 4, rc || ivShade(yel, -0.2)); }, 1.6);
  pipe(-50); pipe(50); ivLine(-53, 0, -53, pd, 3, 'rgba(255,255,255,0.35)'); ivLine(47, 0, 47, pd, 3, 'rgba(255,255,255,0.35)');
  ivRR(-64, 70, 28, 18, 4, '#9a7a1e'); ctx.save(); ctx.translate(-50, 80); ctx.rotate(-0.4); ivRR(-4, -4, 52, 10, 4, '#d6302a'); ctx.restore();          // the valve lever
  prop_ext([[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]], 16, -12, '#b9b4a6', { rw: 2.5 });
  ctx.save(); prop_rr(-w / 2, -h, w, h, 4)(); prop_shade(-w / 2, -h, w, h, 0.35); ctx.restore();
  ivRR(-w / 2 + 12, -h + 14, w - 24, 104, 10, '#2a2e36'); ivRR(-w / 2 + 16, -h + 18, w - 32, 96, 8, '#e9e4d6');
  for (let i = 0; i < 4; i++) { const dx = -48 + i * 32, dy = -h + 46, a = TT * (o.spin ?? 0.3) * (1 + lk * 6) * (i % 2 ? -1 : 1) * (i + 1);
    ivDot(dx, dy, 12, '#ffffff'); ctx.beginPath(); ctx.arc(dx, dy, 12, 0, TAU); ctx.lineWidth = 1.2; ctx.strokeStyle = '#3a3f4a'; ctx.stroke();
    for (let t = 0; t < 10; t++) { const b = t / 10 * TAU; ivLine(dx + Math.cos(b) * 9, dy + Math.sin(b) * 9, dx + Math.cos(b) * 11, dy + Math.sin(b) * 11, 0.8, '#3a3f4a'); }
    ivLine(dx, dy, dx + Math.cos(a) * 9, dy + Math.sin(a) * 9, 2, '#d6302a'); ivDot(dx, dy, 1.8, '#2a2e36'); }
  const n = Math.floor(48210 + TT * 3 * (1 + lk * 20)); String(n).padStart(6, '0').split('').forEach((d, i) => { ivRR(-54 + i * 18, -h + 70, 16, 24, 2, i > 3 ? '#d6302a' : '#1d1f28'); ivText(d, -46 + i * 18, -h + 88, 17, '#ffffff', { font: IV.sans, weight: 700 }); });
  ivRR(-28, -62, 56, 26, 5, yel); ivText('GAS', 0, -42, 19, '#1d1f28', { track: 3 });
  ivRR(-w / 2 + 10, -18, 20, 10, 3, '#8a8578'); ivRR(w / 2 - 30, -18, 20, 10, 3, '#8a8578');
  if (lk > 0) { const jx = 50, jy = 120; ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const t = mod(TT * 0.7 + i / 6, 1); ctx.beginPath();
      for (let j = 0; j <= 14; j++) { const q = j / 14, yy = jy - q * (120 + t * 160), xx = jx + 14 + q * 50 + Math.sin(q * 6 + TT * 3 + i) * (8 + q * 22); j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.lineWidth = 5 + t * 14; ctx.strokeStyle = `rgba(205,235,170,${0.38 * lk * (1 - t)})`; ctx.stroke(); }
    ctx.globalAlpha = lk; [0, 1, 2].forEach((i) => { const q = mod(TT * 4 + i / 3, 1); ivLine(jx + 14 + q * 30, jy - 4 - i * 6, jx + 22 + q * 30, jy - 6 - i * 6, 2, `rgba(240,250,230,${1 - q})`); });
    ctx.restore(); }
  ctx.restore();
}
// P_garageDoor: a roll-up garage door recessed in a concrete frame (the reveals show — a box opening in 2.5D). anchor:
// bottom-centre. ~1000×800 px. o.open 0..1 the door rolled up (a dark inside shows), o.vp [x, y] local vanishing point
// for the reveals (default [0, −420]), o.col door colour, o.tag spray-paint text, o.inside(w, h) draws in the opening
// (local coords from its top-left), o.lit 0..1 a warm light from inside
function P_garageDoor(x, y, s = 1, o = {}) {
  const w = 880, h = 680, c = o.col || '#6f7686', vp = o.vp || [0, -420], dep = 0.07, op = clamp(o.open || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_rim(prop_rr(-w / 2 - 70, -h - 80, w + 140, h + 80, 4), '#55545c', 2.5);
  ctx.save(); prop_rr(-w / 2 - 70, -h - 80, w + 140, h + 80, 4)(); prop_shade(-w / 2 - 70, -h - 80, w + 140, h + 80, 0.3);
  const R = RNG('conc').f; for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.15; ivDot(-w / 2 - 60 + R() * (w + 120), -h - 70 + R() * (h + 60), 3 + R() * 10, R() < 0.5 ? '#2a2a30' : '#8a8890'); } ctx.restore();
  const tl = [-w / 2, -h], tr = [w / 2, -h], br = [w / 2, 0], bl = [-w / 2, 0], inn = (p) => [lerp(p[0], vp[0], dep), lerp(p[1], vp[1], dep)];
  const [itl, itr, ibr, ibl] = [tl, tr, br, bl].map(inn);
  ivPoly([tl, tr, itr, itl], '#2c2b32'); ivPoly([tl, itl, ibl, bl], '#3e3d45'); ivPoly([tr, br, ibr, itr], '#34333b'); ivPoly([bl, br, ibr, ibl], '#4a4950');
  const iw = itr[0] - itl[0], ih = ibl[1] - itl[1], dh = ih * (1 - op);
  // the inside behind the door
  ctx.save(); ctx.beginPath(); ctx.rect(itl[0], itl[1], iw, ih); ctx.clip();
  ctx.fillStyle = ivVGrad(itl[1], ibl[1], ['#0c0b10', '#16141c', '#201c22']); ctx.fillRect(itl[0], itl[1], iw, ih);
  if (o.inside) { ctx.save(); ctx.translate(itl[0], itl[1]); o.inside(iw, ih); ctx.restore(); }
  if (o.lit) ivGlow(0, ibl[1] - 80, 600, `rgba(255,190,110,${0.45 * o.lit})`);
  // the door slats
  const g = ctx.createLinearGradient(itl[0], 0, itr[0], 0); g.addColorStop(0, ivShade(c, -0.15)); g.addColorStop(0.5, c); g.addColorStop(1, ivShade(c, -0.25));
  ctx.fillStyle = g; ctx.fillRect(itl[0], itl[1], iw, dh);
  for (let yy = itl[1] + dh - 4; yy > itl[1]; yy -= 34) { ivLine(itl[0], yy, itr[0], yy, 3, 'rgba(0,0,0,0.28)'); ivLine(itl[0], yy - 4, itr[0], yy - 4, 2, 'rgba(255,255,255,0.12)'); }
  if (dh > 30) { ivRR(-40, itl[1] + dh - 28, 80, 14, 5, '#3a3d46'); ivRR(itl[0], itl[1] + dh - 6, iw, 6, 0, '#1d1d22'); }
  const R3 = RNG('dirt').f; ctx.globalAlpha = 0.25; for (let i = 0; i < 7; i++) { const sx = itl[0] + R3() * iw; ivRR(sx, itl[1], 6 + R3() * 10, dh * (0.3 + R3() * 0.5), 3, '#3a3328'); } ctx.globalAlpha = 1;
  if (o.tag && dh > ih * 0.4) { ctx.save(); ctx.translate(-120, itl[1] + dh * 0.55); ctx.rotate(-0.08); ivText(o.tag, 0, 0, 92, 'rgba(232,90,120,0.85)', { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 700, glow: 'rgba(232,90,120,0.3)' }); ctx.restore(); }
  ctx.restore();
  ivAO(itl[0], itl[1], itr[0], itr[1], 40, 0.4);
  ivLine(tl[0], tl[1], tr[0], tr[1], 3, 'rgba(255,240,220,0.25)');
  ctx.restore();
}
// P_sign: a painted wooden sign on two posts (planks, grain, nails, a painted paw). anchor: the ground between the posts
// (o.posts false: the board's CENTRE). The board fits text. o.posts (true), o.post height (240), o.ink paint colour,
// o.wood, o.paw (true), o.ang tilt, o.size text px (54)
function P_sign(x, y, s = 1, text = "BOSS'S HOUSE", o = {}) {
  const sz = o.size ?? 54, wood = o.wood || '#9a6a40';
  ctx.save(); ctx.font = `800 ${sz}px ${IV.font}`; ctx.letterSpacing = '3px'; const tw = ctx.measureText(text).width; ctx.restore();
  const w = tw + sz * (o.paw === false ? 1.4 : 2.6), hh = sz * 2.1, ph = o.post ?? 240, posts = o.posts !== false;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (posts) { prop_shadow(0, 0, w * 0.9, 0.3); ctx.translate(0, -ph - hh / 2); } ctx.rotate(o.ang ?? -0.02);
  if (posts) [-w * 0.32, w * 0.32].forEach((px) => prop_ext([[px - 12, -hh * 0.3], [px + 12, -hh * 0.3], [px + 12, ph + hh / 2], [px - 12, ph + hh / 2]], 6, -5, ivShade(wood, -0.25), { rw: 1.6 }));
  const P = [[-w / 2, -hh / 2], [w / 2, -hh / 2], [w / 2, hh / 2], [-w / 2, hh / 2]];
  prop_ext(P, 9, -8, wood, { rw: 2.2 });
  ctx.save(); prop_poly(P)(); ctx.clip();
  const R = RNG('grain' + text).f; for (let i = 0; i < 18; i++) { const gy = -hh / 2 + R() * hh; ctx.beginPath(); ctx.moveTo(-w / 2, gy); ctx.bezierCurveTo(-w / 4, gy + (R() - 0.5) * 8, w / 4, gy + (R() - 0.5) * 8, w / 2, gy + (R() - 0.5) * 6); ctx.strokeStyle = 'rgba(60,30,10,0.18)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ivLine(-w / 2, 0, w / 2, 0, 3, 'rgba(40,20,8,0.45)'); ivLine(-w / 2, 2, w / 2, 2, 1.2, 'rgba(255,220,180,0.2)');
  ctx.restore(); prop_poly(P)(); prop_shade(-w / 2, -hh / 2, w, hh, 0.3);
  const ink = o.ink || '#f6ead0', tx = o.paw === false ? 0 : sz * 0.6;
  ivText(text, tx + 2, sz * 0.36 + 3, sz, 'rgba(40,20,8,0.35)', { track: 3 }); ivText(text, tx, sz * 0.36, sz, ink, { track: 3 });
  if (o.paw !== false) { const px = -w / 2 + sz * 0.95, py = 4; ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2); ctx.beginPath(); ctx.ellipse(0, 6, sz * 0.24, sz * 0.2, 0, 0, TAU); ctx.fillStyle = '#e0873a'; ctx.fill();
    [[-0.3, -0.22], [-0.1, -0.36], [0.12, -0.36], [0.31, -0.2]].forEach(([a, b]) => ivDot(a * sz, b * sz + 4, sz * 0.09, '#e0873a')); ctx.restore(); }
  [[-w / 2 + 12, -hh / 2 + 12], [w / 2 - 12, -hh / 2 + 12], [-w / 2 + 12, hh / 2 - 12], [w / 2 - 12, hh / 2 - 12]].forEach(([nx, ny]) => { ivDot(nx, ny, 4, '#4a4a52'); ivDot(nx - 1, ny - 1, 1.5, 'rgba(255,255,255,0.6)'); });
  ctx.restore();
}

// ---- sound, light ------------------------------------------------------------------
// P_soundRings(x, y, r, u, o): the yowl spreading — concentric warm rings growing to radius r as u goes 0 → 1.
// anchor: CENTRE. o.n rings (4), o.col ('#ffd9a0'), o.squash y factor (1; ~0.35 for rings lying on the ground),
// o.loop speed: rings emitted forever instead of u (e.g. 0.6), o.dir + o.spread: only arcs toward an angle (a call), o.w line width
function P_soundRings(x, y, r, u = 1, o = {}) {
  const n = o.n ?? 4, col = o.col || '#ffd9a0', lw = o.w ?? Math.max(3, r * 0.022);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, o.squash ?? 1); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const p = o.loop ? mod(TT * o.loop + i / n, 1) : clamp(u * (1 + 0.22 * (n - 1)) - i * 0.22); if (p <= 0.01) continue;
    const rr = r * EZ.o3(p), a = (1 - p) * (o.a ?? 1);
    const a0 = o.dir != null ? o.dir - (o.spread ?? 0.7) : 0, a1 = o.dir != null ? o.dir + (o.spread ?? 0.7) : TAU;
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = lw * 3; ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(0, 0, Math.max(0.1, rr), a0, a1); ctx.lineWidth = lw * (1.4 - p * 0.6); ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha *= a * 0.5; ctx.beginPath(); ctx.arc(0, 0, Math.max(0.1, rr - lw * 2.2), a0, a1); ctx.lineWidth = lw * 0.4; ctx.strokeStyle = '#fff6e6'; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
// P_streetLamp: a street lamp with a light cone and a pool on the ground. anchor: the foot. ~180×760 px. o.on (true),
// o.dir which way the arm reaches (1 right), o.cone ground width of the light (560), o.col light colour, o.flicker
function P_streetLamp(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, on = o.on !== false, H2 = 740, ax = 130, col = o.col || [255, 214, 150];
  const fk = o.flicker ? (Math.sin(TT * 37) > 0.85 ? 0.35 : 1) : 1, cw = (o.cone ?? 560) / 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const hx = ax, hy = -H2 + 30;
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, hy, 0, 0); g.addColorStop(0, `rgba(${col},${0.32 * fk})`); g.addColorStop(1, `rgba(${col},0.03)`);
    ivPoly([[hx - 26, hy + 20], [hx + 26, hy + 20], [hx + cw, 0], [hx - cw, 0]], g);
    ctx.beginPath(); ctx.ellipse(hx, 0, cw * 0.95, cw * 0.16, 0, 0, TAU); ctx.fillStyle = `rgba(${col},${0.2 * fk})`; ctx.fill(); ctx.restore(); }
  prop_shadow(0, 0, 90, 0.4);
  prop_rimDo((rc) => { ivPoly([[-26, 0], [26, 0], [16, -60], [-16, -60]], rc || '#2a2c34'); ivRR(-9, -H2 + 40, 18, H2 - 80, 6, rc || '#33363f');
    ctx.beginPath(); ctx.moveTo(0, -H2 + 50); ctx.quadraticCurveTo(0, -H2 - 10, ax * 0.6, -H2 - 6); ctx.lineTo(hx, -H2 - 4); ctx.lineWidth = 12; ctx.strokeStyle = rc || '#33363f'; ctx.lineCap = 'round'; ctx.stroke();
    ivPoly([[hx - 40, hy + 4], [hx + 40, hy + 4], [hx + 22, hy - 30], [hx - 22, hy - 30]], rc || '#2a2c34'); }, 2.2);
  ctx.beginPath(); ivRR(-9, -H2 + 40, 18, H2 - 80, 6); prop_cyl(-9, 9, -H2 + 40, -40, 0.45);
  ivRR(-14, -260, 28, 14, 4, '#2a2c34'); ivRR(-14, -480, 28, 10, 4, '#2a2c34');
  ctx.beginPath(); ctx.ellipse(hx, hy + 8, 34, 9, 0, 0, TAU); ctx.fillStyle = on ? `rgb(${col.map((v) => Math.min(255, v + 30))})` : '#6a6c74'; ctx.fill();
  if (on) { ivGlow(hx, hy + 10, 260, `rgba(${col},${0.6 * fk})`); ivGlow(hx, hy + 10, 60, `rgba(255,250,235,${0.9 * fk})`); }
  ctx.restore();
}
// P_stringLights(x1, y1, x2, y2, o): festoon bulbs on a sagging wire between two points (world coords).
// o.sag (80), o.gap px between bulbs (64), o.on 0..1 (1), o.cols bulb colours, o.r bulb size (9), o.twinkle (true)
function P_stringLights(x1, y1, x2, y2, o = {}) {
  const sag = o.sag ?? 80, gap = o.gap ?? 64, on = clamp(o.on ?? 1), cols = o.cols || ['#ffd27a', '#ff9a6a', '#fff0b8', '#ff7a8a', '#a8dcff'], br = o.r ?? 9;
  const P = (t) => [lerp(x1, x2, t), lerp(y1, y2, t) + sag * 4 * t * (1 - t)];
  ctx.save(); ctx.beginPath(); for (let i = 0; i <= 30; i++) { const p = P(i / 30); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.lineWidth = 2.2; ctx.strokeStyle = '#1d1c22'; ctx.stroke();
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / gap));
  for (let i = 1; i < n; i++) { const [bx, by] = P(i / n), c = cols[i % cols.length], tw = o.twinkle === false ? 1 : 0.75 + 0.25 * Math.sin(TT * 2.3 + i * 1.7), a = on * tw;
    ivRR(bx - br * 0.35, by, br * 0.7, br * 0.8, 1.5, '#2a2a30');
    ctx.beginPath(); ctx.ellipse(bx, by + br * 1.6, br * 0.75, br, 0, 0, TAU); ctx.fillStyle = a > 0.05 ? c : '#5a5048'; ctx.fill();
    if (a > 0.05) { ivDot(bx - br * 0.2, by + br * 1.3, br * 0.25, 'rgba(255,255,255,0.8)'); ivGlow(bx, by + br * 1.6, br * 7, ivHex(c, 0.5), a); } }
  ctx.restore();
}

// ---- the fair: stall --------------------------------------------------------------
// P_stall: a fair stall as a box — a counter (top + side toward the vanishing point), a dark booth, posts, a striped
// scalloped awning in perspective, a sign and festoon bulbs. anchor: bottom-centre of the counter front. ~640×660 px.
// o.vp [x, y] local vanishing point (default [180, −430]: the right side and the top show), o.col awning colour,
// o.text sign ('LEMONADE'), o.goods 'balloons' | 'lemonade' | 'toys' | 'none', o.lights 0..1 (1)
function P_stall(x, y, s = 1, o = {}) {
  const vp = o.vp || [180, -430], c = o.col || '#d8433a', wood = o.wood || '#b07a4a', W2 = 600, ch = 210, ah = 560, dep = 0.16;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  prop_shadow(0, 0, W2 * 1.15, 0.4);
  const back = (p) => [p[0] + (vp[0] - p[0]) * dep, p[1] + (vp[1] - p[1]) * dep];
  // the booth: back wall + its inside, dark
  const btl = back([-W2 / 2, -ah]), btr = back([W2 / 2, -ah]), bbr = back([W2 / 2, -ch]), bbl = back([-W2 / 2, -ch]);
  ivPoly([btl, btr, bbr, bbl], '#3a2a30'); ivPoly([[W2 / 2, -ah], btr, bbr, [W2 / 2, -ch]], '#4a3438');
  ivGlow(0, -ch - 120, 300, 'rgba(255,200,120,0.25)');
  for (let i = 0; i < 4; i++) ivRR(btl[0] + 40 + i * 120, btl[1] + 70, 70, 50, 6, ['#f2c230', '#5aa9e6', '#e05a7a', '#7cc47a'][i]);   // goods on the back shelf
  ivLine(btl[0] + 20, btl[1] + 122, btr[0] - 20, btr[1] + 122, 6, '#6a4a34');
  // posts
  [-W2 / 2 + 10, W2 / 2 - 10].forEach((px) => prop_ext([[px - 9, -ah], [px + 9, -ah], [px + 9, -ch], [px - 9, -ch]], 5, -4, ivShade(wood, -0.15), { rw: 1.5 }));
  // the counter: ivBox in local coords
  ivBox(-W2 / 2, -ch, W2, ch, dep, vp, { front: wood, top: ivShade(wood, 0.25), side: ivShade(wood, -0.3) });
  for (let i = 1; i < 6; i++) ivLine(-W2 / 2 + i * W2 / 6, -ch + 4, -W2 / 2 + i * W2 / 6, -2, 2, 'rgba(60,30,10,0.25)');
  ivRR(-W2 / 2, -ch + 30, W2, 26, 0, c); for (let i = 0; i < 12; i++) if (i % 2) ivRR(-W2 / 2 + i * W2 / 12, -ch + 30, W2 / 12, 26, 0, '#f6eedd');
  ivAO(-W2 / 2, 0, W2 / 2, 0, 20, 0.3);
  // goods on the counter
  const g = o.goods || 'lemonade', top = -ch - 4;
  if (g === 'lemonade') { for (let i = 0; i < 5; i++) { const gx = -200 + i * 60, gy = top - 2 + (i % 2) * 6; ivRR(gx - 13, gy - 42, 26, 42, [3, 3, 8, 8], 'rgba(250,240,170,0.85)'); ivRR(gx - 13, gy - 42, 26, 8, 3, 'rgba(255,255,255,0.5)'); ivLine(gx + 4, gy - 40, gx + 10, gy - 60, 3, '#e05a7a'); }
    prop_rim(prop_rr(130, top - 110, 90, 110, 16), 'rgba(250,236,150,0.92)', 1.6); ivRR(130, top - 116, 90, 14, 6, '#c9ced8'); ivDot(160, top - 60, 12, '#f2c230'); ivDot(190, top - 40, 10, '#f2c230'); }
  else if (g === 'toys') { ['#f2a7b8', '#b07a4a', '#7cc47a', '#f5c84c'].forEach((pc, i) => { const gx = -180 + i * 110; prop_rim(prop_circ(gx, top - 30, 26), pc, 1.6); prop_ball(prop_circ(gx, top - 30, 26), gx, top - 30, 26); ivDot(gx - 18, top - 54, 9, pc); ivDot(gx + 18, top - 54, 9, pc); ivDot(gx - 8, top - 34, 3, '#1a1a20'); ivDot(gx + 8, top - 34, 3, '#1a1a20'); }); }
  else if (g === 'balloons') { ['#e0393b', '#f2c230', '#5aa9e6', '#e05a7a', '#7cc47a'].forEach((bc, i) => P_balloon(W2 / 2 - 30, top, 0.9, { col: bc, len: 160 + i * 30, sway: Math.sin(TT * 1.2 + i) * 0.08 + (i - 2) * 0.16, key: 'st' + i })); }
  // the awning: a box with stripes on its front and top, scallops below
  const af = [[-W2 / 2 - 20, -ah - 70], [W2 / 2 + 20, -ah - 70], [W2 / 2 + 20, -ah], [-W2 / 2 - 20, -ah]];
  const ab = [back(af[0]), back(af[1])];
  const stripes = (P0, P1, P2, P3, n) => { for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, L = (A, B, u) => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
    ivPoly([L(P0, P1, u0), L(P0, P1, u1), L(P3, P2, u1), L(P3, P2, u0)], i % 2 ? '#f6eedd' : c); } };
  prop_rimDo((rc) => { ivPoly([af[0], af[1], ab[1], ab[0]], rc || c); ivPoly([af[1], ab[1], back(af[2]), af[2]], rc || c); ivPoly(af, rc || c); }, 2.4);
  stripes(ab[0], ab[1], af[1], af[0], 10); ivPoly([af[0], af[1], ab[1], ab[0]], 'rgba(255,240,220,0.12)');
  ivPoly([af[1], ab[1], back(af[2]), af[2]], ivShade(c, -0.3));
  stripes(af[0], af[1], af[2], af[3], 10);
  for (let i = 0; i < 10; i++) { const sx = af[3][0] + (i + 0.5) * (W2 + 40) / 10; ctx.beginPath(); ctx.arc(sx, -ah, (W2 + 40) / 20, 0, Math.PI); ctx.fillStyle = i % 2 ? '#f6eedd' : c; ctx.fill(); }
  ctx.beginPath(); ctx.rect(af[0][0], af[0][1], W2 + 40, 70); prop_shade(af[0][0], af[0][1], W2 + 40, 70, 0.3);
  ivRR(-150, -ah - 140, 300, 66, 12, '#f6eedd', '#5a3a28', 4); ivText(o.text || 'LEMONADE', 0, -ah - 94, 36, '#5a3a28', { track: 2 });
  if ((o.lights ?? 1) > 0) P_stringLights(af[3][0], -ah + 30, af[2][0], -ah + 30, { sag: 30, gap: 70, on: o.lights ?? 1, r: 7 });
  ctx.restore();
}

// ---- the train yard: train car ---------------------------------------------------
// P_trainCar: an old rusty boxcar, side view extruded (the roof + one end show). anchor: bottom-centre (wheels on the
// rail line y). ~1500×640 px. o.num ('9'), o.door 0..1 the sliding door open (slides right), o.inside(w, h) draws in the
// door opening (local coords from its top-left, 300×400), o.light 0..1 a warm glow inside, o.ext [dx, dy] ([−80, −50]),
// o.col ('#8a3b2c'), o.tilt broken lean (rad). Returns { door: [x, y, w, h] } the opening in world coords
function P_trainCar(x, y, s = 1, o = {}) {
  const c = o.col || '#8a3b2c', [ex, ey] = o.ext || [-80, -50], d = clamp(o.door || 0), Wc = 1400, top = -570, bot = -120;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
  prop_shadow(0, 2, 1550, 0.5);
  // bogies + wheels (far ones first)
  [-470, 470].forEach((bx) => { [-60, 60].forEach((wx) => prop_hwheel(bx + wx + ex * 0.6, -44 + ey * 0.6, 44, 0.3, '#5a5550')); });
  ivRR(-Wc / 2 + 30, bot, Wc - 60, 30, 4, '#24222a');
  prop_ext([[-Wc / 2, top], [Wc / 2, top], [Wc / 2, bot], [-Wc / 2, bot]], ex, ey, c, { top: ivShade(c, -0.05), side: ivShade(c, -0.4), rw: 3 });
  ctx.save(); prop_rr(-Wc / 2, top, Wc, bot - top, 2)(); ctx.clip();
  ctx.fillStyle = ivVGrad(top, bot, ['rgba(255,220,180,0.1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']); ctx.fillRect(-Wc / 2, top, Wc, bot - top);
  for (let rx = -Wc / 2 + 50; rx < Wc / 2; rx += 64) { ivLine(rx, top, rx, bot, 5, 'rgba(0,0,0,0.22)'); ivLine(rx + 4, top, rx + 4, bot, 2, 'rgba(255,220,190,0.12)'); }
  const R = RNG('rustcar').f; for (let i = 0; i < 26; i++) { ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(-Wc / 2 + R() * Wc, top + R() * (bot - top), 20 + R() * 50, 8 + R() * 30, R(), 0, TAU); ctx.fillStyle = R() < 0.5 ? '#5a2618' : '#b0603a'; ctx.fill(); }
  ctx.globalAlpha = 1;
  ivText(o.num || '9', -420, top + 290, 220, '#efe2c8', { shadow: 'rgba(0,0,0,0.3)' });
  ivText('CAR ' + (o.num || '9'), 430, top + 90, 40, 'rgba(239,226,200,0.85)', { track: 4 });
  ivText('NORTHERN RAIL', 430, top + 140, 26, 'rgba(239,226,200,0.6)', { track: 3 });
  ctx.save(); ctx.translate(400, top + 330); ctx.rotate(-0.06); ivText('MEOW', 0, 0, 80, 'rgba(90,200,190,0.55)', { font: '"Marker Felt", "Comic Sans MS", cursive', weight: 700 }); ctx.restore();
  ctx.restore();
  // the door opening + the sliding door
  const dx0 = -150, dy0 = top + 50, dw = 300, dh = bot - 10 - dy0;
  ivLine(dx0 - 20, dy0 - 10, dx0 + dw + 330, dy0 - 10, 8, '#3a2a26'); ivLine(dx0 - 20, dy0 + dh + 6, dx0 + dw + 330, dy0 + dh + 6, 8, '#3a2a26');
  ctx.save(); ctx.beginPath(); ctx.rect(dx0, dy0, dw, dh); ctx.clip();
  ctx.fillStyle = ivVGrad(dy0, dy0 + dh, ['#0c0a0e', '#1c1618', '#2a2018']); ctx.fillRect(dx0, dy0, dw, dh);
  ivPoly([[dx0, dy0 + dh], [dx0 + dw, dy0 + dh], [dx0 + dw + ex * 0.4, dy0 + dh + ey * 0.4 - 30], [dx0 + ex * 0.4, dy0 + dh + ey * 0.4 - 30]], '#3a2c22');
  if (o.light) ivGlow(dx0 + dw / 2, dy0 + dh * 0.6, 260, `rgba(255,190,110,${0.5 * o.light})`);
  if (o.inside) { ctx.save(); ctx.translate(dx0, dy0); o.inside(dw, dh); ctx.restore(); }
  ctx.restore();
  ivAO(dx0, dy0, dx0, dy0 + dh, 26, 0.45);
  const ddx = dx0 + d * 320;
  prop_rim(prop_rr(ddx - 6, dy0 - 6, dw + 12, dh + 12, 3), ivShade(c, -0.08), 2);
  for (let rx = ddx + 40; rx < ddx + dw; rx += 64) ivLine(rx, dy0, rx, dy0 + dh, 4, 'rgba(0,0,0,0.22)');
  ivLine(ddx + 10, dy0 + dh / 2, ddx + 10, dy0 + dh / 2 + 70, 8, '#3a3436'); ivDot(ddx + 10, dy0 + dh / 2, 6, '#6a6266');
  ctx.beginPath(); ctx.rect(ddx - 6, dy0 - 6, dw + 12, dh + 12); prop_shade(ddx - 6, dy0 - 6, dw + 12, dh + 12, 0.35);
  // couplers, ladder, wheels in front
  ivRR(-Wc / 2 - 40, bot - 10, 50, 24, 5, '#2a2830'); ivRR(Wc / 2 - 10, bot - 10, 50, 24, 5, '#2a2830');
  for (let i = 0; i < 6; i++) ivLine(Wc / 2 - 50, top + 60 + i * 60, Wc / 2 - 14, top + 60 + i * 60, 5, '#2a2830');
  [-470, 470].forEach((bx) => { ivRR(bx - 120, -90, 240, 36, 8, '#24222a'); [-60, 60].forEach((wx) => prop_hwheel(bx + wx, -44, 44, 0.3, '#6a6560')); ivRR(bx - 20, -64, 40, 30, 6, '#33303a'); });
  ctx.restore();
  return { door: [x + dx0 * s, y + dy0 * s, dw * s, dh * s] };
}

// ---- graphics: the city map, the hertz chart, the news lower third --------------------------
// P_cityMap(x, y, s, u, o): a top-down warm paper map of the city; the yowl spreads from the garage roof to roof as
// u goes 0 → 1, each roof cat lighting up (a little cat head pops orange) as the wave reaches it, with tiny rings.
// anchor: CENTRE. 1200×700 px at s = 1. o.dots cats on roofs (150), o.from [x, y] the start (local, default the garage),
// o.count (default: lit cats × o.mult (3) — so 40 → 100 → hundreds), o.label ('CATS'), o.yard 0..1 the train-yard pin
// pops, o.a alpha, o.fair (true) the fair marker
function P_cityMap(x, y, s = 1, u = 0, o = {}) {
  const W2 = 600, H2 = 350, a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ivRR(-W2 + 10, -H2 + 18, W2 * 2, H2 * 2, 30, 'rgba(0,0,0,0.4)');
  ivRR(-W2, -H2, W2 * 2, H2 * 2, 30, '#efe3cc');
  ctx.save(); prop_rr(-W2, -H2, W2 * 2, H2 * 2, 30)(); ctx.clip();
  // the river, the park, the rail line, the yard
  ctx.beginPath(); ctx.moveTo(-W2 - 20, 160); ctx.bezierCurveTo(-200, 60, 100, 300, W2 + 20, 120); ctx.lineWidth = 60; ctx.strokeStyle = '#a9c0c8'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
  ivRR(60, -110, 170, 110, 26, '#c2cf9e'); const RT = RNG('trees').f; for (let i = 0; i < 12; i++) ivDot(80 + RT() * 130, -95 + RT() * 80, 8, '#a6b884');
  ivRR(340, -H2 + 30, 240, 150, 16, '#dccbab'); for (let i = 0; i < 5; i++) ivLine(350, -H2 + 50 + i * 26, 570, -H2 + 50 + i * 26 - 20, 3, '#a89474');
  ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(-W2, -250); ctx.bezierCurveTo(-200, -270, 100, -200, 350, -250); ctx.lineWidth = 5; ctx.strokeStyle = '#a89474'; ctx.stroke(); ctx.setLineDash([]);
  // streets + blocks with roofs
  const blocks = [], R = RNG('city').f, bz = (t, p0, p1, p2, p3) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;
  const riv = Array.from({ length: 60 }, (_, i) => [bz(i / 59, -W2 - 20, -200, 100, W2 + 20), bz(i / 59, 160, 60, 300, 120)]);
  for (let gx = -W2 + 20; gx < W2 - 20; gx += 110) for (let gy = -H2 + 20; gy < H2 - 20; gy += 95) {
    const bx = gx + 8, by = gy + 8, bw = 92, bh = 78, cx = bx + bw / 2, cy = by + bh / 2;
    if (Math.abs(cx - 145) < 110 && Math.abs(cy + 55) < 80) continue; if (cx > 330 && cy < -180) continue;
    if (riv.some(([qx, qy]) => Math.hypot(qx - cx, qy - cy) < 62)) continue;
    ivRR(bx, by, bw, bh, 10, '#e2d1b2'); for (let k = 0; k < 3; k++) { const rx = bx + 6 + R() * 50, ry2 = by + 6 + R() * 40; ivRR(rx, ry2, 22 + R() * 18, 18 + R() * 14, 4, '#d4bf9a'); blocks.push([rx + 14, ry2 + 10]); } }
  ivLine(-W2, -H2 + 18 + 95 * 3, W2, -H2 + 18 + 95 * 3, 10, '#f8f1e2');
  // the cats on the roofs: dark until the wave reaches them
  const from = o.from || [-470, 0], maxD = 1300, Rw = EZ.io(clamp(u)) * maxD, n = Math.min(o.dots ?? 150, blocks.length);
  const RP = RNG('pick').f, list = blocks.map((b) => [b, RP()]).sort((p, q) => p[1] - q[1]).slice(0, n).map((p) => p[0]);
  let lit = 0;
  list.forEach(([cx, cy], i) => { const dd = Math.hypot(cx - from[0], cy - from[1]), on = clamp((Rw - dd) / 50);
    if (on > 0) lit++;
    const sc2 = 1 + 0.5 * Math.sin(Math.PI * clamp((Rw - dd) / 120)) * (on > 0 ? 1 : 0), col = on > 0 ? '#ff8f2c' : '#9a8a72';
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc2, sc2);
    if (on > 0) ivGlow(0, 0, 26, 'rgba(255,150,50,0.55)', on);
    ivDot(0, 0, 7, col); ivPoly([[-7, -2], [-6, -11], [-1, -5]], col); ivPoly([[7, -2], [6, -11], [1, -5]], col);
    if (on > 0) { ivDot(-2.5, -0.5, 1.2, '#3a1a08'); ivDot(2.5, -0.5, 1.2, '#3a1a08'); }
    ctx.restore();
    const q = (Rw - dd) / 140; if (q > 0 && q < 1) { ctx.save(); ctx.globalAlpha *= 1 - q; ctx.beginPath(); ctx.arc(cx, cy, 10 + q * 40, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = '#ff9a3c'; ctx.stroke(); ctx.restore(); } });
  // the big wavefront rings
  for (let i = 0; i < 3; i++) { const rr = Rw - i * 70; if (rr <= 0 || u >= 1) continue; ctx.save(); ctx.globalAlpha *= (1 - Rw / maxD) * (1 - i * 0.3); ctx.beginPath(); ctx.arc(from[0], from[1], rr, 0, TAU); ctx.lineWidth = 6 - i * 1.5; ctx.strokeStyle = '#ff9a3c'; ctx.shadowColor = '#ffb35a'; ctx.shadowBlur = 14; ctx.stroke(); ctx.restore(); }
  ctx.restore();
  // markers + labels
  const tag = (px, py, str, c2) => { ivRR(px - str.length * 8 - 14, py - 46, str.length * 16 + 28, 34, 17, 'rgba(42,36,48,0.88)'); ivText(str, px, py - 21, 19, c2 || '#ffe6c4', { track: 2 }); };
  ivDot(from[0], from[1], 16, '#2a2430'); ivDot(from[0], from[1], 9, '#ff8f2c'); tag(from[0], from[1] - 8, 'THE GARAGE');
  if (o.fair !== false) { ivDot(145, -55, 10, '#e05a7a'); tag(145, -60, 'FAIR', '#ffd0dc'); }
  const yp = clamp(o.yard ?? 0); if (yp > 0) { const ps = EZ.back(yp); ctx.save(); ctx.translate(460, -H2 + 105); ctx.scale(ps, ps);
    ivGlow(0, -20, 120, 'rgba(255,90,60,0.5)'); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -36, -26, -72, 0, -72); ctx.bezierCurveTo(26, -72, 30, -36, 0, 0); ctx.fillStyle = '#e5352b'; ctx.fill(); ivDot(0, -48, 10, '#fff6e6'); ctx.restore();
    ctx.save(); ctx.globalAlpha *= yp; tag(460, -H2 + 28 + 120, 'TRAIN YARD', '#ffd2c8'); ctx.restore(); }
  // the counter
  const cnt = o.count ?? Math.round(lit * (o.mult ?? 3));
  ivRR(-W2 + 24, -H2 + 24, 300, 96, 22, 'rgba(42,36,48,0.9)');
  ivText(o.label || 'CATS', -W2 + 50, -H2 + 62, 22, 'rgba(255,230,200,0.75)', { align: 'left', track: 4 });
  ivText(prop_num(cnt), -W2 + 50, -H2 + 106, 46, '#ffb35a', { align: 'left', glow: 'rgba(255,150,60,0.6)' });
  ivText('N', W2 - 46, H2 - 58, 22, '#7a6a52'); ivPoly([[W2 - 46, H2 - 110], [W2 - 54, H2 - 84], [W2 - 38, H2 - 84]], '#c9472f');
  ivRR(-W2, -H2, W2 * 2, H2 * 2, 30, null, 'rgba(120,90,60,0.5)', 3); ivRR(-W2 + 12, -H2 + 12, W2 * 2 - 24, H2 * 2 - 24, 22, null, 'rgba(120,90,60,0.2)', 1.5);
  ctx.restore();
  return { lit };
}
// P_hzChart(x, y, s, u, o): "how high can you hear" — two bars on a cream card, YOU 20,000 Hz (Kai blue) vs CAT
// 85,000 Hz (Pickles orange), growing and counting up with u 0..1 (YOU first, then CAT); "×4" pops at the end.
// anchor: CENTRE. 1100×540 px at s = 1. o.a alpha, o.title
function P_hzChart(x, y, s = 1, u = 0, o = {}) {
  const W2 = 550, H2 = 270, a = o.a ?? 1; if (a <= 0) return;
  const u1 = EZ.o3(clamp(u / 0.4)), u2 = EZ.o3(clamp((u - 0.35) / 0.55)), u3 = clamp((u - 0.92) / 0.08);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (0.94 + 0.06 * EZ.back(clamp(a))), s * (0.94 + 0.06 * EZ.back(clamp(a)))); ctx.globalAlpha *= clamp(a);
  ivRR(-W2 + 12, -H2 + 18, W2 * 2, H2 * 2, 30, 'rgba(0,0,0,0.42)');
  ivRR(-W2, -H2, W2 * 2, H2 * 2, 30, '#f1e6d2'); ivRR(-W2 + 14, -H2 + 14, W2 * 2 - 28, H2 * 2 - 28, 22, null, 'rgba(90,60,40,0.18)', 2);
  ivText(o.title || 'HOW HIGH CAN YOU HEAR?', 0, -H2 + 62, 34, '#a8453f', { track: 4 });
  const x0 = -W2 + 230, x1 = W2 - 70, bw = x1 - x0, k = bw / 100000;
  for (let t = 0; t <= 100000; t += 20000) { const tx = x0 + t * k; ivLine(tx, -H2 + 100, tx, H2 - 70, 1.5, 'rgba(90,60,40,0.15)'); ivText(t ? t / 1000 + 'K' : '0', tx, H2 - 38, 18, 'rgba(60,40,30,0.55)', { track: 1 }); }
  const row = (yy, val, uu, col, label, icon) => {
    icon(-W2 + 80, yy); ivText(label, -W2 + 150, yy + 10, 30, '#2a2430', { track: 2 });
    const L = Math.max(0, val * k * uu); ivRR(x0, yy - 32, bw, 64, 32, 'rgba(90,60,40,0.08)');
    if (L > 4) { prop_rim(prop_rr(x0, yy - 32, Math.max(64, L), 64, 32), col, 1.5); ctx.save(); prop_rr(x0, yy - 32, Math.max(64, L), 64, 32)(); ctx.clip();
      const g = ctx.createLinearGradient(0, yy - 32, 0, yy + 32); g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)'); ctx.fillStyle = g; ctx.fillRect(x0, yy - 32, L + 64, 64);
      ctx.beginPath(); for (let i = 0; i <= 80; i++) { const px = x0 + i * L / 80, f = 0.02 + i * 0.006; ctx.lineTo(px, yy + Math.sin(px * f * 0.6 - TT * 6) * 12); } ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke(); ctx.restore(); }
    const num = prop_num(Math.round(val * uu / 100) * 100) + ' Hz', ins = L > 300;
    ivText(num, ins ? x0 + Math.max(64, L) - 22 : x0 + Math.max(64, L) + 16, yy + 13, 36, ins ? '#ffffff' : '#2a2430', { align: ins ? 'right' : 'left', track: 1 });
  };
  row(-58, 20000, u1, '#3c6fd1', 'YOU', (ix, iy) => { ivDot(ix, iy, 30, IV.ink); prop_ball(prop_circ(ix, iy, 30), ix, iy, 30); ivDot(ix - 10, iy - 3, 5, IV.eye); ivDot(ix + 10, iy - 3, 5, IV.eye); ivLine(ix - 7, iy + 13, ix + 7, iy + 13, 3, IV.eye); });
  row(76, 85000, u2, '#e0873a', 'CAT', (ix, iy) => { ivPoly([[ix - 28, iy - 6], [ix - 22, iy - 38], [ix - 6, iy - 22]], '#e0873a'); ivPoly([[ix + 28, iy - 6], [ix + 22, iy - 38], [ix + 6, iy - 22]], '#e0873a');
    ivDot(ix, iy, 28, '#e0873a'); prop_ball(prop_circ(ix, iy, 28), ix, iy, 28); ctx.beginPath(); ctx.ellipse(ix - 10, iy - 3, 5, 7, 0, 0, TAU); ctx.ellipse(ix + 10, iy - 3, 5, 7, 0, 0, TAU); ctx.fillStyle = '#c9e05a'; ctx.fill(); ivRR(ix - 11, iy - 9, 2, 12, 1, '#111'); ivRR(ix + 9, iy - 9, 2, 12, 1, '#111'); ivPoly([[ix - 3, iy + 7], [ix + 3, iy + 7], [ix, iy + 11]], '#e88a8a');
    ivLine(ix - 6, iy - 22, ix - 4, iy - 14, 2.5, '#b45c1e'); ivLine(ix + 1, iy - 24, ix + 1, iy - 15, 2.5, '#b45c1e'); });
  if (u3 > 0) { ctx.save(); ctx.translate(x0 + 85000 * k - 40, -150); ctx.rotate(-0.08); const ps = 0.6 + 0.4 * EZ.back(u3); ctx.scale(ps, ps); ctx.globalAlpha *= u3;
    ivRR(-70, -40, 140, 74, 37, '#a8453f'); ivText('×4', 0, 20, 52, '#fff3e0'); ctx.restore(); }
  ctx.restore();
}
// P_newsLowerThird(x, y, w, text, o): the TV news lower third — a red kicker strip, a white headline bar, a channel bug
// and a scrolling ticker. anchor: TOP-LEFT; ~w × 170 px. o.kicker ('BREAKING NEWS'), o.ticker text, o.logo ('CITY 7'),
// o.a 0..1 wipe-in (1), o.live (true)
function P_newsLowerThird(x, y, w = 1300, text = '', o = {}) {
  const a = clamp(o.a ?? 1); if (a <= 0) return;
  const e = EZ.o3(a), lw = 150;
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.rect(-10, -10, (w + 20) * e, 200); ctx.clip();
  ivRR(6, 10, w, 160, 6, 'rgba(0,0,0,0.35)');
  ivRR(0, 0, lw, 132, [10, 0, 0, 10], '#b8323a'); ivRR(0, 0, lw, 132, [10, 0, 0, 10]); prop_shade(0, 0, lw, 132, 0.3);
  ivText((o.logo || 'CITY 7').split(' ')[0], lw / 2, 58, 34, '#ffffff', { track: 2 }); ivText((o.logo || 'CITY 7').split(' ')[1] || '', lw / 2, 106, 46, '#ffe2b0');
  ivRR(lw, 0, w * 0.42, 44, 0, '#d8342c'); ivText(o.kicker || 'BREAKING NEWS', lw + 24, 31, 24, '#ffffff', { align: 'left', track: 3 });
  if (o.live !== false) { ivRR(lw + w * 0.42 + 12, 8, 90, 30, 6, '#1d1f28'); if (Math.floor(TT * 1.5) % 2 === 0) ivDot(lw + w * 0.42 + 30, 23, 6, '#ff3b30'); ivText('LIVE', lw + w * 0.42 + 68, 31, 18, '#ffffff', { track: 2 }); }
  ivRR(lw, 44, w - lw, 88, 0, '#f7f4ee'); ctx.save(); ctx.beginPath(); ctx.rect(lw, 44, w - lw, 88); prop_shade(lw, 44, w - lw, 88, 0.15); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(lw + 20, 44, w - lw - 40, 88); ctx.clip(); ctx.font = `800 40px ${IV.font}`; const tw = ctx.measureText(text).width, fs = Math.min(40, 40 * (w - lw - 60) / Math.max(1, tw + text.length)); ctx.restore();
  ivText(text, lw + 24, 44 + 44 + fs * 0.36, fs, '#15161d', { align: 'left', track: 1 });
  ivRR(0, 132, w, 38, [0, 0, 8, 8], '#1d1f28');
  ctx.save(); ctx.beginPath(); ctx.rect(lw, 132, w - lw, 38); ctx.clip(); const tk = (o.ticker || 'CAT WHISPERER FINDS 11 PETS  •  GAS LEAK FOUND IN BASEMENT  •  WEATHER: CLEAR NIGHT  •  ') + '     ';
  ctx.font = `700 20px ${IV.sans}`; const tl = ctx.measureText(tk).width, off = mod(TT * 110, tl);
  for (let k = -1; k < Math.ceil(w / tl) + 1; k++) ivText(tk, lw + 16 - off + k * tl, 158, 20, '#ffe2b0', { align: 'left', font: IV.sans, weight: 700 });
  ctx.restore(); ivRR(0, 132, lw, 38, [0, 0, 0, 8], '#d8342c'); ivText('NEWS', lw / 2, 158, 20, '#ffffff', { track: 3 });
  ctx.restore();
}

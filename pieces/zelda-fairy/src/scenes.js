// =====================================================================
//  SCENES — zelda-fairy (tapestry, Flow layers, 9:16). The golden frame (assets/bg.jpg) stays put on screen;
//  inside the green field one long strip slides right, panel to panel, and the camera never stops (slow push + drift).
//  Every figure is a woven Flow layer (tools/weave.py: the cloth's own weave pressed into it + a thin cream thread edge).
//  Link is one actor on the strip: when two panels in a row show him, he is drawn once and walks across the seam,
//  his pose crossfading, so he is never on screen twice. Navi rides with him once she has arrived.
// =====================================================================
const FX0 = 0, FX1 = 1080, FY0 = 239, FY1 = 1681, FL = 1640, SLIDE = 0.9;
const at = (t, d = 0.6) => EZ.io(clamp((TT - t) / d));
const LT = (id) => VL(id).t0, LE = (id) => VL(id).t1;
function stripPos() { let p = 0; for (let i = 1; i < TB.length; i++) p += EZ.io(clamp((TT - (TB[i] - SLIDE / 2)) / SLIDE)); return p; }
const IMG = (n) => asset(n + '.webp');
const nat = (n) => { const im = IMG(n); return im ? [im.naturalWidth, im.naturalHeight] : [100, 100]; };
const wOf = (n, h) => { const [w, hh] = nat(n); return h * w / hh; };

// a figure: feet at (x, y), height h; breathes and sways; a soft shadow grounds it
function fig(n, x, y, h, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return;
  const w = h * im.naturalWidth / im.naturalHeight, br = o.breathe === false ? 0 : 0.01 * Math.sin(TT * 1.8 + x * 0.013);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha *= (o.a ?? 1) * 0.3; ctx.fillStyle = '#1f2a0c'; ctx.beginPath(); ctx.ellipse(x, y - 4, w * 0.34, 15, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate((o.rot ?? 0) + (o.sway ?? 0.007) * Math.sin(TT * 1.3 + x * 0.01));
  ctx.scale((o.flip ? -1 : 1) * (1 - br * 0.5), 1 + br); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
}
// a centred layer (props, sets): centre (x, y), width w
function prop(n, x, y, w, o = {}) {
  const im = IMG(n); if (!im || (o.a ?? 1) <= 0.003) return; const h = w * im.naturalHeight / im.naturalWidth;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (o.filter) ctx.filter = o.filter; ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.scale(o.flip ? -1 : 1, o.sy ?? 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
}
// a pose change: two aligned layers (same crop) crossfade over d seconds from t
function pose(a, b, t, x, y, h, o = {}) {
  const k = EZ.io(clamp((TT - t) / (o.d ?? 0.35)));
  if (k < 1) fig(a, x, y, h, { ...o, a: (o.a ?? 1) * Math.min(1, 2 * (1 - k)) });
  if (k > 0) fig(b, x, y, h, { ...o, a: (o.a ?? 1) * Math.min(1, 2 * k), shadow: k > 0.5 });
}
// a walk: x from x0 to x1 over d seconds, with bob and rock while moving
function walk(x0, x1, t0, d, rate = 7, bob = 14) { const u = EZ.io(clamp((TT - t0) / d)), mv = TT > t0 && TT < t0 + d ? Math.sin(Math.PI * clamp((TT - t0) / d)) : 0; return { x: lerp(x0, x1, u), dy: -Math.abs(Math.sin(TT * rate)) * bob * mv, rot: 0.03 * Math.sin(TT * rate) * mv }; }
function glow(x, y, r, c, a, op = 'lighter') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = op; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c.replace('A', a)); g.addColorStop(1, c.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
// a wash over the whole field (night, dread), multiply so the weave shows through
function wash(c, a, op = 'multiply') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = op; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0); ctx.restore(); }

// a fairy: a ball of light with four fluttering woven wings and a little trail of sparks
const NAVI = '172,214,255', FAIRY = '255,236,170', FAIRY2 = '255,200,150';
function fairy(x, y, s = 1, k = 1, col = FAIRY, key = 0) {
  if (k <= 0) return;
  glow(x, y, 120 * s, `rgba(${col},A)`, 0.55 * k);
  ctx.save(); ctx.globalAlpha *= k; ctx.translate(x, y); ctx.scale(s, s);
  const f = 0.55 + 0.45 * Math.abs(Math.sin(TT * 26 + key));
  ctx.fillStyle = 'rgba(255,250,232,0.88)'; ctx.strokeStyle = 'rgba(150,90,40,0.85)'; ctx.lineWidth = 2.2;
  for (const [sx, sy, rx, ry, rot] of [[-1, -1, 26, 12, -0.6], [1, -1, 26, 12, 0.6], [-1, 1, 16, 8, 0.5], [1, 1, 16, 8, -0.5]]) {
    ctx.save(); ctx.scale(1, f); ctx.beginPath(); ctx.ellipse(sx * rx * 0.9, sy * 10, rx, ry, rot * sx * sy, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,90,40,0.6)'; ctx.stroke(); ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(-3, -3, 6, 0, TAU); ctx.fill();
  ctx.restore();
}
function sparks(path, t, n, col, key = 0, k = 1) { if (k <= 0) return; for (let i = 1; i <= n; i++) { const [x, y] = path(t - i * 0.06), a = (1 - i / (n + 1)) * k; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x + 6 * Math.sin(i * 2.3 + key), y + 6 * Math.cos(i * 1.7), 4.5 * (1 - i / (n + 2)), 0, TAU); ctx.fill(); ctx.restore(); } }
// a fairy circling a point (a child's head or hand)
function orbit(cx, cy, col, key, k = 1, r = 70) { const path = (t) => [cx + r * Math.cos(t * 2.8 + key), cy + 0.6 * r * Math.sin(t * 3.7 + key)]; sparks(path, TT, 6, col, key, k); const [x, y] = path(TT); fairy(x, y, 0.95, k, col, key); }

// falling woven leaves (ochre, rust, olive), each sways down on its own path
const LEAF_C = ['#c98a2b', '#b4542a', '#8a9a34', '#d9a441'];
function leaves(x0, x1, y0, y1, n, key, k = 1, sp = 120) {
  for (let i = 0; i < n; i++) { const R = RNG('lf' + key, i), span = y1 - y0, y = y0 + mod(R.r(0, span) + TT * sp * R.r(0.7, 1.2), span), x = R.r(x0, x1) + 40 * Math.sin(TT * R.r(1, 2) + i), a = Math.min(1, (y - y0) / 80, (y1 - y) / 120) * k; if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.sin(TT * 2.2 + i) * 0.9 + i); ctx.fillStyle = LEAF_C[i % 4]; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 8, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); ctx.restore(); }
}
// woven grass tufts on the floor line, swaying
function grass(x0, x1, y, key, n = 26) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const R = RNG('gr' + key, i), x = R.r(x0, x1), h = R.r(26, 54), sw = 7 * Math.sin(TT * 1.6 + x * 0.02); ctx.strokeStyle = ['#5f7a23', '#86a034', '#4a6119'][i % 3]; ctx.lineWidth = 6;
  for (const d of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x + d, y); ctx.quadraticCurveTo(x + d * 1.4, y - h * 0.6, x + d * 1.8 + sw, y - h); ctx.stroke(); } } ctx.restore(); }
// the Kokiri forest band behind the figures (its rounded ends overlap the next panel's band, one long wood)
function forest(x0 = -150, w = 1380, a = 0.95) { const [nw, nh] = nat('forest'), h = w * nh / nw; prop('forest', x0 + w / 2, FL + 26 - h / 2, w, { a }); }
// a dark, wavering curse: thick woven strands of deep plum from (x0, y0) to (x1, y1), drawn on over time
function curse(x0, y0, x1, y1, k, key = 0) {
  if (k <= 0) return;
  for (let s = 0; s < 3; s++) { const P = []; const n = 40; for (let i = 0; i <= n * k; i++) { const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(Math.PI * u) * (60 + 30 * s) + 22 * Math.sin(u * 14 + TT * 5 + s * 2 + key); P.push([x, y]); }
    if (P.length < 2) continue; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = '#3a1838'; ctx.lineWidth = 16 - s * 4; ctx.stroke(); ctx.strokeStyle = '#8a3a6a'; ctx.lineWidth = 5 - s; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.restore(); }
}
// the ocarina, drawn as plainly as the one in Link's hands: a sky-blue woven oval, a rust edge, two holes, a mouthpiece
function ocarina(x, y, rot, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.lineWidth = 6; ctx.strokeStyle = '#c24a1e'; ctx.fillStyle = '#7fc0e6';
  ctx.beginPath(); ctx.roundRect(-58, -16, 26, 22, 6); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 50, 32, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2a2a4a'; for (const [hx, hy] of [[-6, -6], [16, 4]]) { ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, TAU); ctx.fill(); } ctx.restore(); }
// a cream roundel with a woven ochre border, its picture clipped inside; grows in with k
function roundel(x, y, r, k, f) {
  if (k <= 0.02) return; const rr = r * EZ.o2(k);
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
  ctx.fillStyle = '#efe0b8'; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, Math.max(1, rr - 6), 0, TAU); ctx.clip(); f(rr); ctx.restore();
  ctx.lineWidth = 16; ctx.strokeStyle = '#c99a3a'; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = '#7a3a14'; ctx.setLineDash([9, 6]); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke(); ctx.restore();
}
// woven stars for the night
function stars(k, key = 0) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = '#f5e6b8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const R = RNG('st' + key, i), x = R.r(130, 950), y = R.r(560, 1100), s = R.r(8, 15) * (0.75 + 0.25 * Math.sin(TT * 3 + i)); ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); } ctx.restore(); }
// gold woven rays from a point (the curse breaking, the sword)
function rays(x, y, k, len = 520, n = 14, key = 0) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + TT * 0.25 + key, l = len * (0.7 + 0.3 * Math.sin(i * 2.7 + TT * 2)) * EZ.o2(clamp(k)); ctx.strokeStyle = i % 2 ? '#f3c95a' : '#fff1c4'; ctx.lineWidth = i % 2 ? 10 : 6;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); } ctx.restore(); glow(x, y, len * 0.8, 'rgba(255,236,170,A)', 0.55 * clamp(k)); }
// a woven tally stroke (the seven years)
function tallyMark(x, y, k) { if (k <= 0) return; const h = 90 * EZ.o2(clamp(k)); ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#7a3a14'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x, y + 45); ctx.lineTo(x, y + 45 - h); ctx.stroke(); ctx.strokeStyle = '#e9b54a'; ctx.lineWidth = 7; ctx.setLineDash([9, 6]); ctx.stroke(); ctx.restore(); }
// a woven branch for Link to sleep on
function branch(x0, x1, y) { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#6a3a1a'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(x0, y + 30); ctx.quadraticCurveTo((x0 + x1) / 2, y - 20, x1, y + 10); ctx.stroke(); ctx.strokeStyle = '#b4672c'; ctx.lineWidth = 6; ctx.setLineDash([12, 9]); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, x = lerp(x0, x1, u); ctx.save(); ctx.translate(x, y + 18 - 40 * Math.sin(Math.PI * u) * 0.5); ctx.rotate(-0.4 + 0.8 * (i % 2) + 0.06 * Math.sin(TT * 1.5 + i)); ctx.fillStyle = LEAF_C[(i + 2) % 4]; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -26, 14, 30, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); } }
// the Deku Tree: breathes slowly; o.dead greys it
const TREE_MOUTH = [0.5, 0.86];   // the mouth in the layer (fractions)
function deku(x, h, o = {}) {
  const im = IMG('deku'); if (!im) return; const w = h * im.naturalWidth / im.naturalHeight, br = 0.012 * Math.sin(TT * 1.1) * (1 - (o.dead ?? 0));
  const g = o.dead ?? 0; ctx.save(); ctx.globalAlpha *= o.a ?? 1; if (g > 0) ctx.filter = `saturate(${1 - 0.75 * g}) brightness(${1 - 0.18 * g})`;
  ctx.translate(x, FL + 18); ctx.scale(1 - br * 0.4, 1 + br); ctx.rotate(0.006 * Math.sin(TT * 0.9) - 0.03 * g); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
  return { mouth: [x + (TREE_MOUTH[0] - 0.5) * w, FL + 18 - (1 - TREE_MOUTH[1]) * h], w };
}

// ---- captions: cream serif with a stitched brown edge, word by word, at the top of the field; they ride with the cloth
const CAP_Y = { p11: 380 };
function chunks(L) {   // split at punctuation, then cut long pieces into even parts of at most 7 words
  const ws = L.text.split(/\s+/).map((w, j) => ({ w, t: L.words[j] ? L.words[j].t0 : L.t0 })), parts = [[]];
  ws.forEach((it, j) => { parts[parts.length - 1].push(it); if (/[,.?:]$/.test(it.w) && j < ws.length - 1) parts.push([]); });
  const merged = []; for (const pt of parts) { const last = merged[merged.length - 1]; if (last && (pt.length < 3 || last.length < 3) && last.length + pt.length <= 8) last.push(...pt); else merged.push([...pt]); }
  return merged.flatMap((pt) => { const n = Math.ceil(pt.length / 7), size = Math.ceil(pt.length / n), out = []; for (let i = 0; i < pt.length; i += size) out.push(pt.slice(i, i + size)); return out; });
}
const CAPS = {};
function panelCaption(i) {
  const id = IDS[i], panelAt = (t) => { let k = 0; for (let j = 0; j < TB.length; j++) if (t >= TB[j] - 0.3) k = j; return k; }, list = CAPS[id] || (CAPS[id] = VOICE.lines.flatMap((L) => chunks(L)).filter((ch) => panelAt(ch[0].t) === i));
  for (let c = 0; c < list.length; c++) {
    const ch = list[c], t0 = ch[0].t - 0.12, t1 = c + 1 < list.length ? list[c + 1][0].t - 0.12 : 1e9; if (TT < t0 || TT >= t1) continue;
    const fo = c + 1 < list.length ? 1 - clamp((TT - (t1 - 0.15)) / 0.15) : 1;
    ctx.save(); ctx.font = 'bold 64px Georgia, "Times New Roman", serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const lines = [[]]; let lw = 0; const sw = ctx.measureText(' ').width;
    for (const it of ch) { const ww = ctx.measureText(it.w).width; if (lw + ww > 790 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...it, ww }); lw += ww + sw; }
    lines.forEach((ln, r) => { const tot = ln.reduce((s, it) => s + it.ww, 0) + sw * (ln.length - 1); let x = 540 - tot / 2; const y = (CAP_Y[id] ?? 340) + r * 80;
      for (const it of ln) { const k = clamp((TT - it.t + 0.08) / 0.16) * fo; if (k > 0) { ctx.globalAlpha = k; const lift = 10 * (1 - EZ.o2(k));
        ctx.strokeStyle = 'rgba(30,18,6,0.35)'; ctx.lineWidth = 14; ctx.strokeText(it.w, x + 2, y + lift + 6);
        ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 12; ctx.strokeText(it.w, x, y + lift); ctx.fillStyle = '#fbf0d2'; ctx.fillText(it.w, x, y + lift); }
        x += it.ww + sw; } });
    ctx.restore();
  }
}

// =====================================================================
//  Link on the strip: each panel says where he is and how he looks (local coords). Two panels in a row that both
//  have him share one Link: he walks across the seam and his pose crossfades with the slide.
// =====================================================================
const LH = 760;   // young Link's height
const navOrbit = (x, y, h) => [x + 95 * Math.cos(TT * 2.6) + 30, y - h * 0.98 + 40 * Math.sin(TT * 3.4)];
function drawLink(s, x, a = 1, dy = 0, rot = 0) {
  if (!s || a <= 0) return;
  if (s.extra) drawLink({ ...s.extra, navi: 0 }, s.extra.x + (x - s.x), a, dy, rot);
  const o = { a: a * (s.a ?? 1), rot: rot + (s.rot ?? 0), filter: s.filter, d: s.d };
  if (s.b) pose(s.n, s.b, s.t, x, s.y + dy, s.h, o); else fig(s.n, x, s.y + dy, s.h, o);
  if (s.navi > 0) { const [nx, ny] = navOrbit(x, s.y + dy, s.h); const path = (t) => [x + 95 * Math.cos(t * 2.6) + 30, s.y + dy - s.h * 0.98 + 40 * Math.sin(t * 3.4)]; sparks(path, TT, 6, NAVI, 3, a * s.navi); fairy(nx, ny, 0.9, a * s.navi, NAVI, 3); }
}
const LINK = {
  p01: () => ({ n: 'link_adult', x: 540, y: FL, h: 1000 }),
  p02: () => ({ n: 'link', x: 300, y: FL, h: LH }),
  p03: () => (TT < VW('l03', 'own') + 0.1 ? { n: 'link', b: 'link_up', t: VW('l03', 'fairy') - 0.2, x: 330, y: FL, h: LH } : { n: 'link_up', b: 'link', t: VW('l03', 'own') + 0.1, x: 330, y: FL, h: LH }),
  p04: () => ({ n: 'link_sleep', x: 520, y: 1430, h: 330, rot: 0.02 }),
  p06: () => { const tw = VW('l08', 'name'), k = at(tw, 0.5); return TT < tw ? { n: 'link_sleep', x: 350, y: 1500, h: 300 } : { n: 'link_up', x: 330, y: FL, h: LH, a: k, navi: at(tw + 0.2, 0.4), extra: { n: 'link_sleep', x: 350, y: 1500, h: 300, a: 1 - k, dx: 20 } }; },
  p07: () => { const t0 = LT('l09') + 0.1, tIn = t0 + 1.4, tOut = VW('l09', 'but') - 0.1, w = walk(250, 545, t0, 1.4), k = at(tIn - 0.4, 0.5), back = at(tOut, 0.5);
    return TT < tOut ? { n: 'link', x: w.x, y: lerp(FL, FL - 60, k), h: lerp(LH, 420, k), a: 1 - k, navi: 1 - k, rot: w.rot } : { n: 'link', x: lerp(470, 250, back), y: FL, h: LH, a: back, navi: back }; },
  p08: () => { const w = walk(230, 640, LT('l10') + 0.2, 4.0, 6.5, 12); return { n: 'link', x: w.x, y: FL + w.dy, h: LH, navi: 1, rot: w.rot }; },
  p09: () => { const tc = VW('l12', 'ocarina') - 0.05; return TT < tc - 0.4 ? { n: 'link', x: 300, y: FL, h: LH, navi: 1 } : { n: 'link', b: 'link_up', t: tc - 0.4, x: 300, y: FL, h: LH, navi: 1 }; },
  p10: () => ({ n: 'link_ocarina', b: 'link_sword', t: VW('l13', 'pulled') - 0.1, x: 400, y: FL, h: LH, navi: 1, d: 0.3 }),
  p11: () => ({ n: 'link_sleep', x: 540, y: 1230 + 14 * Math.sin(TT * 1.3), h: 360 }),
  p12: () => { const tw = LT('l15') + 0.35, k = at(tw, 0.7); const sl = { n: 'link_sleep', x: 540, y: 1230 + 14 * Math.sin(TT * 1.3), h: 360 }; return TT < tw ? sl : { n: 'link_adult', x: 300, y: FL, h: 900, a: k, extra: { ...sl, a: 1 - k } }; },
  p13: () => { const w = walk(260, 420, LT('l16') + 0.3, 3.4, 6.5, 12); return { n: 'link', x: w.x, y: FL + w.dy, h: LH, navi: 1, rot: w.rot }; },
};
// a sleeping Link rising: the sleep layer is drawn at its own size; a standing layer grows from it (p06, p12)
function linkState(i) { const f = LINK[IDS[i]]; return f ? f() : null; }

// =====================================================================
//  the panels (local coords; panel i sits at strip x = i * W)
// =====================================================================
function p01() {   // "You know the Hero of Time": the grown hero in a burst of gold, leaves falling
  const k = at(0.1, 0.8);
  rays(540, 960, k, 560, 16);
  leaves(FX0, FX1, 300, FL - 40, 10, 'p1', 1, 90);
  grass(-40, 1120, FL + 30, 'p1');
}
function p02() {   // the one Kokiri boy with no fairy: Mido grins with his arms crossed, his fairy circling
  forest();
  leaves(FX0, 1200, 300, FL - 60, 6, 'p2', 0.8, 60);
  const ent = EZ.o3(clamp((TT - SUB('p02') - 0.1) / 1.2)), stp = ent < 1 ? Math.abs(Math.sin(TT * 7)) * 12 * (1 - ent) : 0;
  const mx = lerp(1250, 790, ent), laugh = TT > VW('l02', 'forget') - 0.2 ? Math.abs(Math.sin(TT * 9)) * 10 * (1 - at(VW('l02', 'forget') + 1.2, 0.5)) : 0;
  fig('mido', mx, FL - stp - laugh, 740, { flip: true, rot: ent < 1 ? 0.035 * Math.sin(TT * 7) * (1 - ent) : 0 });
  orbit(mx, FL - 790, FAIRY2, 1, 1, 80);
}
function p03() {   // every other child had a fairy: the girl's fairy swoops past Link, who reaches up, and flies back to her
  forest();
  leaves(FX0, 1200, 300, FL - 60, 7, 'p3', 0.8, 60);
  const gx = 800, gy = FL;
  fig('kokiri_girl', gx, gy, 740, { flip: true });
  const tS = VW('l03', 'fairy') - 0.7, sw = clamp((TT - tS) / 1.9);
  const path = (t) => { const a = t * 3.1, hx = gx - 110 + 60 * Math.cos(a), hy = gy - 600 + 50 * Math.sin(a * 1.3), s = Math.sin(Math.PI * clamp((t - tS) / 1.9)); return [lerp(hx, 500, s), lerp(hy, gy - 700, s)]; };
  sparks(path, TT, 7, FAIRY, 1); const [fx, fy] = path(TT); fairy(fx, fy, 1.05, 1, FAIRY, 1);
}
function p04() {   // the same bad dream, night after night: he sleeps on a branch; the dream in a roundel above
  const n = at(SUB('p04') + 0.2, 0.8);
  stars(n, 4);
  branch(260, 800, 1470);
  const tD = VW('l04', 'dream') - 0.4, k = at(tD, 0.7);
  roundel(540, 830, 250, k, (r) => {   // the dream: the man from the desert, a castle behind him, a red sky
    ctx.fillStyle = '#c86a3a'; ctx.fillRect(540 - r, 830 - r, 2 * r, 2 * r); glow(540, 900, r, 'rgba(255,210,140,A)', 0.4);
    prop('castle', 540, 980, 420, { a: 0.9 });
    fig('ganon', 470 + 20 * Math.sin(TT * 0.8), 830 + r - 10, 420, { shadow: false, filter: 'brightness(0.55) saturate(0.8)' });
  });
  // a little shiver of the dream: the roundel's light flickers each night
  glow(540, 830, 300, 'rgba(255,190,120,A)', 0.12 * k * (0.6 + 0.4 * Math.sin(TT * 4)));
}
function p05() {   // the Great Deku Tree falls sick; the man from the desert walks in and curses it
  const tS = VW('l05', 'sick') - 0.2, sick = 0.35 * at(tS, 1.0);
  const tG = LT('l06') - 0.3, g = walk(-260, 325, tG, 1.3, 6, 10), tC = VW('l06', 'curse') - 0.2, c = clamp((TT - tC) / 1.0);
  const t = deku(690, 1000, { dead: sick + 0.25 * c });
  leaves(260, 1060, 420, FL - 30, 8 + Math.round(8 * sick), 'p5', 1, 120);
  grass(-60, 1140, FL + 30, 'p5');
  if (TT > tG - 0.1) {
    const gh = 780, gw = wOf('ganon', gh), hx = g.x + 0.46 * gw, hy = FL - 0.7 * gh;
    fig('ganon', g.x, FL + g.dy, gh, { rot: g.rot });
    curse(hx, hy, t.mouth[0], t.mouth[1] - 330, c, 5);
    glow(hx, hy, 90, 'rgba(160,70,140,A)', 0.5 * clamp(c * 3), 'source-over');
  }
}
function p06() {   // the tree sends him a fairy at last: Navi flies in from the right and wakes him
  forest(-150, 1380, 0.95);
  branch(140, 560, 1520);
  const tA = LT('l07') + 0.3, tL = VW('l08', 'name'), u = clamp((TT - tA) / (tL - tA));
  const path = (t) => { const v = EZ.io(clamp((t - tA) / (tL - tA))); return [lerp(1180, 420, v) + 30 * Math.sin(t * 4.3) * (1 - v), lerp(700, 1160, v) + 36 * Math.sin(t * 5.7) * (1 - v)]; };
  if (TT > tA && TT < tL + 0.4) { const k = TT < tL ? 1 : 1 - at(tL, 0.4); sparks(path, TT, 9, NAVI, 2, k); const [x, y] = path(TT); fairy(x, y, 1.15, k, NAVI, 2); }
  leaves(FX0, 1200, 300, FL - 60, 5, 'p6', 0.7, 60);
}
function p07() {   // he climbs inside the tree and breaks the curse; but the tree is dying: it greys, the leaves fall
  const tB = VW('l09', 'broke') - 0.1, b = clamp((TT - tB) / 0.9), tD = VW('l09', 'already') - 0.1, dead = at(tD, 1.6);
  const t = deku(600, 1100, { dead: 0.55 - 0.3 * b + 0.45 * dead });
  rays(t.mouth[0], t.mouth[1] - 60, b * (1 - at(tB + 1.2, 0.6)), 420, 14, 1);
  leaves(150, 1060, 420, FL - 20, 10 + Math.round(16 * dead), 'p7', 1, 150);
  grass(-60, 1140, FL + 30, 'p7');
}
function p08() {   // the tree tells him to leave the forest and find the princess: he walks out, the wood thins behind him
  forest(-420, 1100, 0.95);
  grass(500, 1140, FL + 30, 'p8', 14);
  // a woven road sign pointing right (the castle is the next panel)
  ctx.save(); ctx.translate(880, FL); ctx.fillStyle = '#7a4a1e'; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 4; ctx.fillRect(-10, -320, 20, 320); ctx.strokeRect(-10, -320, 20, 320);
  ctx.beginPath(); ctx.moveTo(-90, -310); ctx.lineTo(70, -310); ctx.lineTo(100, -270); ctx.lineTo(70, -230); ctx.lineTo(-90, -230); ctx.closePath(); ctx.fillStyle = '#c99a3a'; ctx.fill(); ctx.stroke(); ctx.restore();
  leaves(FX0, 600, 300, FL - 60, 6, 'p8', 0.8, 60);
}
function p09() {   // Zelda had dreamed of him; then the man from the desert comes after her and she throws Link the ocarina
  prop('castle', 560, FL - 330, 980);
  grass(-60, 1140, FL + 30, 'p9');
  const tG = LT('l12') + 0.1, g = walk(1300, 770, tG, 1.4, 5, 10), dread = at(tG, 1.0);
  if (TT > tG - 0.2) { glow(860, 1100, 420, 'rgba(60,20,40,A)', 0.35 * dread, 'source-over'); fig('ganon', g.x, FL + g.dy, 760, { rot: g.rot, flip: true }); }
  const zx = 680 - 30 * at(tG + 0.4, 0.6);
  fig('zelda', zx, FL, 720);
  // the ocarina: one sprite from Zelda's hands to Link's raised hand, then it stays there
  const tT = VW('l12', 'threw') - 0.05, tc = VW('l12', 'ocarina') - 0.05, zh = 720, zw = wOf('zelda', zh), hx = zx - 0.45 * zw, hy = FL - 0.58 * zh;
  const lx = 300 + 0.33 * wOf('link_up', LH), ly = FL - 0.95 * LH, u = clamp((TT - tT) / Math.max(0.3, tc - tT));
  if (TT > tT - 0.6) { const x = TT < tT ? hx : lerp(hx, lx, u), y = TT < tT ? hy : lerp(hy, ly, u) - Math.sin(Math.PI * u) * 220; ocarina(x, y, TT < tc ? (TT - tT) * 6 : 0.3, (TT < tT ? at(tT - 0.6, 0.4) : 1) * (1 - at(SUB('p10') + 0.1, 0.3))); if (u > 0 && u < 1) glow(x, y, 80, 'rgba(172,214,255,A)', 0.5); }
}
function p10() {   // the Temple of Time (a set that fills the cloth): he plays the ocarina, then pulls the Master Sword
  const tw = 898, th = tw * nat('temple')[1] / nat('temple')[0]; prop('temple', 540, FL + 30 - th / 2, tw);
  const tP = VW('l13', 'pulled') - 0.1, k = clamp((TT - tP) / 0.8);
  rays(560, 1050, k * (1 - 0.4 * at(tP + 1.4, 1)), 600, 18, 2);
  if (TT > LT('l13') && TT < tP) for (let i = 0; i < 4; i++) { const ph = mod(TT * 0.7 + i * 0.25, 1); ctx.save(); ctx.globalAlpha = (1 - ph) * 0.9; ctx.fillStyle = '#7a3a14'; ctx.font = 'bold 54px Georgia'; ctx.fillText('♪', 520 + 60 * Math.sin(ph * 6 + i) + i * 40, 980 - ph * 300); ctx.restore(); }
}
function p11() {   // too young to carry it: the sword seals him away; he sleeps in the light; seven woven marks count the years
  const k = at(SUB('p11') + 0.1, 0.8);
  glow(540, 1150, 620, 'rgba(255,240,190,A)', 0.55 * k);
  rays(540, 1150, k * 0.6, 520, 12, 3);
  const t7 = VW('l14', 'seven') - 0.6;
  for (let i = 0; i < 7; i++) tallyMark(300 + i * 80, 560, clamp((TT - t7 - i * 0.12) / 0.25));
}
function p12() {   // he wakes a grown man; the man from the desert rules Hyrule: the castle dark, Ganondorf looming over it
  const tR = VW('l15', 'desert') - 0.4, r = at(tR, 1.2);
  wash('#7a3a3a', 0.35 * r * (1 - at(SUBEND('p12') - SLIDE / 2, SLIDE)));   // the screen-wide wash fades out with the slide, no pop
  fig('ganon', 690, FL - 150 + 260 * (1 - r), 1040, { a: r, filter: `brightness(${1 - 0.35 * r})`, shadow: false });
  prop('castle', 720, FL - 260, 700, { filter: `brightness(${1 - 0.35 * r}) saturate(${1 - 0.4 * r})` });
  grass(-60, 1140, FL + 30, 'p12');
}
function p13() {   // soon you'll walk that road again: back in the bright forest, with Navi, where it began
  forest();
  fig('kokiri_girl', 860, FL, 700, { flip: true });
  orbit(770, FL - 600, FAIRY, 1, 1, 60);
  leaves(FX0, 1200, 300, FL - 60, 8, 'p13', 0.9, 70);
}
function p14() {   // the sign-off: the apple, AMPHORUS in gold, and under it, small, the trailer's line
  const k = springMove(SIGN_T, 0, 1, SPRING.heavy), sz = 420 * k, bob = 8 * Math.sin((TT - SIGN_T) * 1.6);
  leaves(FX0, FX1, 300, FL - 40, 8, 'p14', 0.7, 60);
  const pk = EZ.o2(clamp((TT - SIGN_T - 0.3) / 0.6));   // a cream woven plaque behind the gold lettering, so it reads on the green
  if (pk > 0) { ctx.save(); ctx.globalAlpha = pk; ctx.fillStyle = '#f1e2bb'; ctx.strokeStyle = '#7a3a14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(170, 1000, 740, 200, 40); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.beginPath(); ctx.roundRect(186, 1016, 708, 168, 30); ctx.stroke(); ctx.restore(); }
  if (sz > 1) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(540, 760 + bob); drawAsset('apple.png', -sz / 2, -sz / 2, sz, sz, { fit: 'contain' }); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = EZ.o2(clamp((TT - SIGN_T - 0.4) / 0.8)); tpLogo('AMPHORUS', 540, 1128, 88, SIGN_T); ctx.restore();
  const s = EZ.o2(clamp((TT - SIGN_T - 1.0) / 0.8)); if (s > 0) { ctx.save(); ctx.globalAlpha = s; ctx.font = 'italic 40px Georgia, serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 8; ctx.strokeText('Beyond time, the boy becomes a hero', 540, 1270); ctx.fillStyle = '#fbf0d2'; ctx.fillText('Beyond time, the boy becomes a hero', 540, 1270); ctx.restore(); }
}
const PANELS = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14];
const NIGHT = new Set(['p04']);
const nightK = (i) => (NIGHT.has(IDS[i]) ? 1 : 0);

function sceneStage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawAsset('bg.jpg', 0, 0, W, H);   // the golden frame stays put
  const p = stripPos(), off = p * W, i0 = Math.min(PANELS.length - 1, Math.floor(p)), i1 = Math.min(PANELS.length - 1, i0 + 1), u = p - i0, sliding = i0 !== i1 && u > 0, show = sliding ? [i0, i1] : [i0];
  ctx.save(); ctx.beginPath(); ctx.rect(FX0, FY0, FX1 - FX0, FY1 - FY0); ctx.clip();
  // night: a navy wash over the night panel, sliding with it
  for (const i of show) { const k = nightK(i); if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; const x = i * W - off, g = ctx.createLinearGradient(x - 140, 0, x + W + 140, 0), e = 140 / (W + 280);
    g.addColorStop(0, 'rgba(70,80,140,0)'); g.addColorStop(2 * e, 'rgba(70,80,140,0.55)'); g.addColorStop(1 - 2 * e, 'rgba(70,80,140,0.55)'); g.addColorStop(1, 'rgba(70,80,140,0)');
    ctx.fillStyle = g; ctx.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0); ctx.restore(); } }   // feathered edges: night falls across the seam
  // the camera never stops: a slow push in and a drift
  const z = 1.035 + 0.025 * Math.sin(TT * 0.45), dx = 14 * Math.sin(TT * 0.37), dy = 10 * Math.sin(TT * 0.29 + 1);
  ctx.translate(540 + dx, 1180 + dy); ctx.scale(z, z); ctx.translate(-540, -1180);
  // the panels' pictures with no inner clip, so things overhanging the seam stay whole
  for (const i of show) { ctx.save(); ctx.translate(i * W - off, 0); PANELS[i](); ctx.restore(); }
  // Link: once, walking across the seam, when both panels have him; else with his own panel
  const s0 = linkState(i0), s1 = sliding ? linkState(i1) : null;
  if (sliding && s0 && s1) { const x = lerp(s0.x, s1.x, EZ.io(u)), mv = Math.sin(Math.PI * u), dy = -Math.abs(Math.sin(TT * 7)) * 14 * mv, rot = 0.03 * Math.sin(TT * 7) * mv;
    drawLink(s0, x, Math.min(1, 2 * (1 - u)), dy, rot); drawLink(s1, x, Math.min(1, 2 * u), dy, rot); }
  else for (const i of show) { const s = i === i0 ? s0 : linkState(i1); if (s) { ctx.save(); ctx.translate(i * W - off, 0); drawLink(s, s.x); ctx.restore(); } }
  for (const i of show) { ctx.save(); ctx.translate(i * W - off, 0); panelCaption(i); ctx.restore(); }
  ctx.restore();
}

// storyboard frames: each panel at its key word
const BOARD_AT = { p01: ['l01', 'know'], p02: ['l02', 'forget'], p03: ['l03', 'own'], p04: ['l04', 'night', 2], p05: ['l06', 'curse'], p06: ['l08', 'navi'], p07: ['l09', 'already'], p08: ['l10', 'princess'], p09: ['l12', 'ocarina'], p10: ['l13', 'stone'], p11: ['l14', 'years'], p12: ['l15', 'hyrule'], p13: ['l16', 'fairy'] };
TIMELINE.board = IDS.map((id, i) => { if (id === 'p01') return { t: Math.round((TB[1] - 0.55) * FPS) / FPS, title: id, sound: '', next: '' }; if (id === 'p14') return { t: Math.round((DURATION - 1.0) * FPS) / FPS, title: id, sound: '', next: '' }; const [l, w, n] = BOARD_AT[id]; const t = Math.min(VW(l, w, n) + 0.5, SUBEND(id) - 0.55); return { t: Math.round(t * FPS) / FPS, title: id, sound: '', next: '' }; });

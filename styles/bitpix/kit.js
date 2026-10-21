// =====================================================================
//  styles/bitpix/kit.js — a dark data-explainer look: near-black navy ground, crisp vector shapes with thin
//  dark seams, three neon inks that each mean one thing (yellow = the original, mint = the new, magenta = the
//  question), glowing dots and particles, small mono data labels and a large serif voice for captions.
//  Built on kit/core.js. Motion on 1s with springs. Helpers are prefixed bp.
// =====================================================================
const BP = {
  ground: '#0b1014', panel: '#131a24', line: '#1b2835', grid: '#121a22', dim: '#5b646c', soft: '#8b949c', text: '#e4e3dc',
  mint: '#1fffa9', mintD: '#008f5c', yellow: '#ffd426', yellowD: '#8a7110', magenta: '#e50673', magentaD: '#7a0a3e',
  sail: 'rgba(160,170,184,0.22)', sailLine: 'rgba(190,198,210,0.55)', azure: '#5797e7',
  serif: 'Georgia, Cambria, "Times New Roman", "DejaVu Serif", serif',
  mono: 'Consolas, "SF Mono", Menlo, "Cascadia Mono", "DejaVu Sans Mono", monospace',
};
const bpHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const bpMix = (a, b, u) => { const x = bpHex(a), y = bpHex(b); return '#' + x.map((v, i) => Math.round(lerp(v, y[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };
const bpA = (h, a) => { const [r, g, b] = bpHex(h); return `rgba(${r},${g},${b},${a})`; };

// ---- text: serif voice (captions, questions) and mono data labels. o.frac types it on letter by letter.
function bpText(str, x, y, size, color, o = {}) {
  ctx.save();
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px ${o.font ?? BP.serif}`;
  ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.globalAlpha = clamp(o.alpha ?? 1);
  const n = Math.round(str.length * clamp(o.frac ?? 1)), s = str.slice(0, n);
  const w = ctx.measureText(str).width;
  if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; }
  ctx.fillStyle = color;
  if (o.align === 'center' || o.align == null) { ctx.textAlign = 'left'; ctx.fillText(s, x - w / 2, y); }
  else ctx.fillText(s, x, y);
  ctx.restore();
  return w;
}
// a caption block: serif, centred, lines fade up in turn; alpha a (0..1) for the whole block
function bpLines(lines, x, y, size, color, a = 1, o = {}) {
  lines.forEach((ln, i) => {
    const s = typeof ln === 'string' ? { t: ln } : ln;
    bpText(s.t, x, y + i * size * (o.lead ?? 1.22), s.size ?? size, s.c ?? color, { alpha: a * (s.a ?? 1), italic: s.i ?? o.italic, font: s.font ?? o.font, weight: s.w ?? o.weight, spacing: o.spacing, align: o.align });
  });
}
// a pill label (reference: thin rounded outline, mono text)
function bpPill(str, x, y, size, color, a = 1) {
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.font = `400 ${size}px ${BP.mono}`;
  const w = ctx.measureText(str).width + size * 1.4, h = size * 1.9;
  trace(rrectPts(x - w / 2, y - h / 2, w, h, h * 0.35, 6), true);
  ctx.fillStyle = bpA(BP.ground, 0.85); ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y + 1);
  ctx.restore();
}

// ---- the ground: flat navy, a faint grid that drifts with the camera, a soft vignette
function bpGround(o = {}) {
  fillAll(BP.ground);
  if (o.grid !== false) {
    ctx.save(); ctx.strokeStyle = BP.grid; ctx.lineWidth = 2;
    const g = o.gap ?? 120;
    for (let x = -g * 4; x < W + g * 4; x += g) { ctx.beginPath(); ctx.moveTo(x, -H); ctx.lineTo(x, H * 2); ctx.stroke(); }
    for (let y = -g * 6; y < H + g * 6; y += g) { ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); ctx.stroke(); }
    ctx.restore();
  }
}
function bpVignette() {
  ctx.save(); screen();
  const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,4,6,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function bpGlow(x, y, r, color, a = 0.5) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, bpA(color, a)); g.addColorStop(1, bpA(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function bpDot(x, y, r, c, a = 1) { ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }

// ---- water: stacked thin wave lines that slide; o.y = surface, o.x0/x1 extent
function bpWater(y, o = {}) {
  const x0 = o.x0 ?? -200, x1 = o.x1 ?? W + 200, n = o.n ?? 5, a = o.a ?? 1;
  ctx.save(); ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    const yy = y + k * (o.gap ?? 26), sp = (k % 2 ? -1 : 1) * (18 + k * 6), amp = 5 + k * 1.5, wl = 140 + k * 30;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 10) { const v = yy + Math.sin((x + TT * sp) / wl * TAU) * amp; x === x0 ? ctx.moveTo(x, v) : ctx.lineTo(x, v); }
    ctx.strokeStyle = bpA(o.c ?? BP.line, a * (1 - k / (n + 1)) * (o.al ?? 0.9)); ctx.lineWidth = o.w ?? 3; ctx.stroke();
  }
  ctx.restore();
}

// ---- the ship: a hull of 38 planks in 5 rows, prow and stern curls, a mast, a yard, a sail, rigging and oars.
//  Local units: the hull spans x in [-1, 1]; s = half-width in px. Returns nothing; bpPlanks gives the plank outlines.
const BP_ROWS = [6, 6, 6, 5, 5, 5, 5];   // 38 planks: long strips, 7 rows
const bpTop = (x) => -0.04 - 0.3 * Math.pow(Math.abs(x), 5);
const bpDepth = (x) => 0.3 * Math.pow(Math.max(0, 1 - x * x), 0.6);
function bpPlankLocal() {   // static: the 38 plank outlines in local units, with row/col and centre
  if (bpPlankLocal.c) return bpPlankLocal.c;
  const out = [];
  BP_ROWS.forEach((nc, r) => {
    const off = (r % 2) * 0.5 / nc, xa = -0.985, xb = 0.985;
    for (let c = 0; c < nc; c++) {
      const u0 = clamp(c / nc + (c ? off : 0)), u1 = clamp((c + 1) / nc + (c < nc - 1 ? off : 0));
      const x0 = lerp(xa, xb, u0), x1 = lerp(xa, xb, u1), P = [];
      for (let i = 0; i <= 8; i++) { const x = lerp(x0, x1, i / 8); P.push([x, bpTop(x) + bpDepth(x) * r / BP_ROWS.length]); }
      for (let i = 8; i >= 0; i--) { const x = lerp(x0, x1, i / 8); P.push([x, bpTop(x) + bpDepth(x) * (r + 1) / BP_ROWS.length]); }
      const xm = (x0 + x1) / 2;
      out.push({ r, c, P, cx: xm, cy: bpTop(xm) + bpDepth(xm) * (r + 0.5) / BP_ROWS.length });
    }
  });
  return (bpPlankLocal.c = out);
}
// world-space plank outlines for a ship at (x, y) with half-width s
const bpPlanks = (x, y, s) => bpPlankLocal().map((p) => ({ ...p, P: p.P.map(([u, v]) => [x + u * s, y + v * s]), cx: x + p.cx * s, cy: y + p.cy * s }));

// o.plank(i) -> { c, dx, dy, rot, a, glow } per plank (default all o.c); o.c the ship's ink; o.a alpha; o.rig ink for mast
function bpShip(x, y, s, o = {}) {
  const ink = o.c ?? BP.yellow, a = o.a ?? 1, rig = o.rig ?? ink, sw = Math.max(1.5, s * 0.008), bob = o.still ? 0 : Math.sin(TT * 1.3 + (o.phase ?? 0)) * s * 0.012;
  const roll = o.still ? 0 : Math.sin(TT * 0.9 + (o.phase ?? 0)) * 0.012;
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(s, s);
  const L = (w) => (ctx.lineWidth = w / s), rigA = clamp(o.rigA ?? 1);
  ctx.globalAlpha = clamp(a * rigA);
  // oars (under the hull)
  if (o.oars !== false) {
    ctx.strokeStyle = bpA(rig, 0.85); L(sw * 1.3); ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const xx = -0.5 + i * 0.12, sweep = Math.sin(TT * 2.2 + i * 0.25) * 0.03; ctx.beginPath(); ctx.moveTo(xx, 0.14); ctx.lineTo(xx - 0.06 + sweep, 0.42); ctx.stroke(); }
  }
  // sail (behind mast): translucent grey, billowing
  if (o.sail !== false) {
    const bil = 0.06 + Math.sin(TT * 1.1 + (o.phase ?? 0)) * 0.015;
    ctx.beginPath(); ctx.moveTo(-0.34, -0.96); ctx.quadraticCurveTo(0.02, -0.92 + bil, 0.38, -0.96);
    ctx.quadraticCurveTo(0.5 + bil, -0.62, 0.28, -0.3); ctx.quadraticCurveTo(-0.02, -0.36 - bil, -0.3, -0.3);
    ctx.quadraticCurveTo(-0.38 + bil, -0.62, -0.34, -0.96); ctx.closePath();
    ctx.fillStyle = BP.sail; ctx.fill(); ctx.strokeStyle = BP.sailLine; L(sw * 0.7); ctx.stroke();
  }
  // rigging
  ctx.strokeStyle = bpA('#9aa4ae', 0.45); L(sw * 0.6);
  for (const [ex, ey] of [[-0.98, -0.42], [0.98, -0.42]]) { ctx.beginPath(); ctx.moveTo(0, -1.06); ctx.lineTo(ex, ey); ctx.stroke(); }
  // mast and yard
  ctx.strokeStyle = o.mastC ?? rig; ctx.lineCap = 'butt'; L(sw * 3.2);
  ctx.beginPath(); ctx.moveTo(0, bpTop(0) + 0.05); ctx.lineTo(0, -1.08); ctx.stroke();
  L(sw * 2.2); ctx.beginPath(); ctx.moveTo(-0.45, -0.99); ctx.lineTo(0.45, -0.99); ctx.stroke();
  ctx.globalAlpha = clamp(a);
  // prow and stern curls
  ctx.strokeStyle = o.curlC ?? ink; L(sw * 1.6); ctx.lineCap = 'round';
  for (const sg of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sg * 0.97, bpTop(0.97) + 0.02);
    ctx.bezierCurveTo(sg * 1.07, -0.5, sg * 1.06, -0.8, sg * 0.96, -0.8); ctx.bezierCurveTo(sg * 0.89, -0.8, sg * 0.9, -0.71, sg * 0.95, -0.72); ctx.stroke();
  }
  // planks
  const pl = bpPlankLocal();
  ctx.lineJoin = 'round';
  pl.forEach((p, i) => {
    const q = o.plank ? o.plank(i) : null; if (q && q.hide) return;
    const c = (q && q.c) || ink, pa = q && q.a != null ? q.a : 1;
    ctx.save(); ctx.globalAlpha = clamp(a * pa);
    if (q && (q.dx || q.dy || q.rot)) { ctx.translate(p.cx + (q.dx || 0) / s, p.cy + (q.dy || 0) / s); ctx.rotate(q.rot || 0); ctx.translate(-p.cx, -p.cy); }
    ctx.beginPath(); p.P.forEach(([u, v], k) => (k ? ctx.lineTo(u, v) : ctx.moveTo(u, v))); ctx.closePath();
    if (q && q.glow) { ctx.shadowColor = c; ctx.shadowBlur = q.glow; }
    ctx.fillStyle = c; ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = bpMix(c[0] === '#' ? c : BP.yellow, BP.ground, 0.72); L(Math.max(1.6, s * 0.0045)); ctx.stroke();
    ctx.restore();
  });
  // gunwale line
  ctx.strokeStyle = o.rimC ?? ink; L(sw * 1.4); ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const xx = lerp(-0.97, 0.97, i / 40); i ? ctx.lineTo(xx, bpTop(xx) - 0.01) : ctx.moveTo(xx, bpTop(xx) - 0.01); }
  ctx.stroke();
  ctx.restore();
}
// a loose plank (sinking, flying): a slightly bowed bar of length len, angle rot
function bpLoosePlank(x, y, len, rot, c, a = 1, th = 0.22) {
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y); ctx.rotate(rot);
  const h = len * th;
  trace(rrectPts(-len / 2, -h / 2, len, h, h * 0.45, 4), true); ctx.fillStyle = c; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = BP.ground; ctx.stroke();
  ctx.restore();
}

// ---- a torn plank: the plank's own outline P (9 top points, then 9 bottom points reversed, world coords, centre cx, cy),
//  drawn at (x, y) turned by rot, with splintered ends (jag 0..1) and a grain line. key seeds the teeth.
function bpSplinter(P, cx, cy, x, y, rot, c, a = 1, jag = 1, key = 'sp') {
  const R = RNG('splinter', key), n = P.length / 2, top = P.slice(0, n), bot = P.slice(n);
  const ax = top[n - 1][0] - top[0][0], ay = top[n - 1][1] - top[0][1], al = Math.hypot(ax, ay) || 1, dx = ax / al, dy = ay / al;
  const teeth = (p, q, sgn) => { const out = []; for (let k = 1; k <= 4; k++) { const f = k / 5, d = sgn * jag * al * (k % 2 ? R.r(0.05, 0.13) : R.r(-0.06, 0.0)); out.push([lerp(p[0], q[0], f) + dx * d, lerp(p[1], q[1], f) + dy * d]); } return out; };
  const Q = [...top, ...teeth(top[n - 1], bot[0], 1), ...bot, ...teeth(bot[n - 1], top[0], -1)];
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y); ctx.rotate(rot); ctx.translate(-cx, -cy);
  ctx.beginPath(); Q.forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v))); ctx.closePath();
  ctx.fillStyle = c; ctx.fill(); ctx.lineJoin = 'miter'; ctx.lineWidth = 1.6; ctx.strokeStyle = bpMix(c, BP.ground, 0.6); ctx.stroke();
  // grain: two thin lines along the plank
  ctx.strokeStyle = bpA(bpMix(c, BP.ground, 0.5), 0.7); ctx.lineWidth = 1.4;
  for (const f of [0.35, 0.68]) { ctx.beginPath(); for (let i = 0; i < n; i++) { const t = top[i], b = bot[n - 1 - i], px = lerp(t[0], b[0], f), py = lerp(t[1], b[1], f); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  ctx.restore();
}
// chips: thin slivers thrown off where a plank is torn out (u = 0..1 over their flight)
function bpChips(x, y, u, c, key, n = 7) {
  if (u <= 0 || u >= 1) return;
  for (let i = 0; i < n; i++) {
    const R = RNG('chip', key, i), an = R.r(-Math.PI * 0.95, -Math.PI * 0.05), sp = R.r(160, 420), t = u * R.r(0.5, 0.9);
    const px = x + Math.cos(an) * sp * t, py = y + Math.sin(an) * sp * t + 900 * t * t, len = R.r(12, 26), w = R.r(2.5, 4.5), r = an + t * R.r(-14, 14);
    ctx.save(); ctx.globalAlpha = clamp(1 - u); ctx.translate(px, py); ctx.rotate(r);
    ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len * 0.1, -w / 2); ctx.lineTo(len / 2, 0); ctx.lineTo(len * 0.05, w / 2); ctx.closePath();
    ctx.fillStyle = c; ctx.fill(); ctx.restore();
  }
}

// ---- a human figure as dots on a hex grid: head, neck, torso, arms, legs. Cached per (size); returns local points.
function bpPersonDots(h, gap) {
  const k = h + ':' + gap; bpPersonDots.c = bpPersonDots.c || {}; if (bpPersonDots.c[k]) return bpPersonDots.c[k];
  const u = h / 100, inside = (x, y) => {   // x, y in units of h/100, origin top-centre
    if (Math.hypot(x, y - 10) < 9.6) return 'head';
    if (Math.abs(x) < 3.6 && y >= 19 && y < 24) return 'body';
    if (y >= 23 && y < 57) { const half = Math.min(11, 11 - (27 - y) * 1.1); if (Math.abs(x) < half) return 'body'; }
    if (y >= 25 && y < 58) { const ax = 17 + (y - 25) * 0.06, aw = y < 28 ? 2.8 - (28 - y) * 0.5 : 2.9; if (Math.abs(Math.abs(x) - ax) < aw) return 'body'; }
    if (y >= 57 && y < 100) { if (Math.abs(Math.abs(x) - 5.8) < 4.1) return 'body'; }
    return null;
  };
  const out = [], dy = gap * Math.sqrt(3) / 2;
  for (let r = 0, y = 0; y <= h; r++, y += dy) for (let x = -h * 0.3 + (r % 2) * gap / 2; x <= h * 0.3; x += gap) {
    const part = inside(x / u, y / u); if (part) out.push({ x, y, part });
  }
  return (bpPersonDots.c[k] = out);
}

// ---- a horizontal timeline with end ticks and labels; u = fill 0..1
function bpTimeline(x0, x1, y, u, la, lb, c = BP.mint, a = 1) {
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.lineCap = 'round';
  ctx.strokeStyle = BP.dim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x, y + 24); ctx.stroke(); }
  if (u > 0) { const xu = lerp(x0, x1, clamp(u)); ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xu, y); ctx.stroke(); bpGlow(xu, y, 54, c, 0.6); bpDot(xu, y, 13, c); }
  ctx.restore();
  bpText(la, x0, y + 70, 38, BP.soft, { font: BP.mono, align: 'left', alpha: a });
  bpText(lb, x1, y + 70, 38, BP.soft, { font: BP.mono, align: 'right', alpha: a });
}

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'bitpix',
  paper: BP.ground,
  backdrop(c) { fillAll(c[0] === '#' ? c : BP.ground); },
  window(P, key, src, o) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 3; ctx.strokeStyle = o && o.c ? o.c : BP.mint; ctx.stroke(); ctx.restore();
  },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { bpGlow(x, y, r * 2.2, BP.mint, 0.5); bpDot(x, y, r * 0.5, BP.mint); },
  heroColor: BP.mint,
  post() { bpVignette(); },
  ones: true,
};

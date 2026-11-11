// =====================================================================
//  styles/cartoon3d/toon.js — CODE-DRAWN "2D-3D" people, v2 (2026-11-08). Opt-in: add "styles/cartoon3d/toon.js" to a
//  piece's build list after "style". Method from refs-ext/claude-animated-shorts (toon.ts / cast.ts / cardshade.ts): each
//  person is ONE Canvas2D card (600 x 1000 design units, soles at y 975) that faces the camera inside the three.js set.
//  v2 (Ricks Clips study): the card is a LIT material — it takes the room's ambient/hemisphere/key light and RECEIVES the
//  set's cast shadows (blind stripes, a desk's shadow), so people darken with the room like Ricks'. Inside the card:
//   - lumpy heads: per-person superellipse (pointed crown, fuller jaw, chin taper, asymmetry, tilt) + seeded low lumps;
//     ink 5 % W, 3:1 thick/thin, heaviest away from the light (bottom-right by default); crescent shade tinted by the room;
//   - eyes with catchlights; 18 expressions; lip-flap levels (talk 0..1); sweat / sparkle fx; stubble; integrated moustache;
//   - Ricks hairstyles: mop, messy, side, bob, bun, topknot, curly, long, ponytail, balding, short, tuft, spiky, bowl, bald
//     (fringe scallops, crown whorl + radiating strands, loose flyaway hairs, lilac/white gloss band); back + profile hair;
//   - bodies at Ricks proportions (~3.35 HH, bean torso .82 W x 1.3 HH, legs 1.18 HH), noodle legs with knees and real
//     shoes, rubber-hose arms with elbows (2-bone IK) and follow-through when given keyframes, dot hands that grip props;
//   - facing: -1..1 (front -> 3/4), ±2 profile (with a nose), 'back'; walk cycle in any facing (3/4 stride with depth),
//     sit 0..1 with c3ToonSitCurve (anticipation, squash, settle); idle: breathing, sway, weight shifts and a head that
//     bobs/tilts on its own rhythm; talk gestures from `gesture` (arms beat with the speech).
//  v5 (study of 4 Ricks/Creatorize shorts, fuentes/cartoon3d/ricks-estilo-4shorts.md): the face stays CENTRED at front and
//  3/4 (only a real profile moves it), no nose; plain black eyes (no catchlights), big white ring eyes, thick short brows,
//  'strain' (> < + teeth); ink ~3.6 % W, near uniform; no lanyards/badges/straps/pens; rubber-hose arms (a soft C that bows
//  >= 22 % of its span, no elbow kink) leaving the torso edge at 0.2 Th; timing = Ricks snap (t3Snap: ~67 % of a move in 4 of
//  10 frames, settled at 0.33 s, no overshoot) and DEAD-STILL holds (no breathing, no sine sway); arm keys start ON the key.
//  Head and torso are cached per person (LRU canvases), so a frame only re-composites limbs + two images.
//  API: c3ToonChar(o) -> person; c3ToonPose(p, cam, t, o) (after the camera is set); c3ToonSitCurve(u); c3ToonHandWorld(p, 'R');
//       c3ToonDims(p) -> { hip, seatStand } in world units. kit.js's c3Toon is the toon MATERIAL (different thing).
//  o (char): { key, skin, hair, hairColor, outfit, colors, glasses, moustache, stubble, shoes, head: {hw,nTop,nBot,egg,asym,
//              rot,lump}, scale, res, legK, torsoK, bodyW, headK }
//  o (pose): { expr, blink, gaze: [x,y], facing, mode: stand|walk|sit, phase, stride (world units per walk cycle, = the
//              distance divisor used for phase; default 3.3), stop (0..1 eases the walk into the stand pose), sit (0..1), seat, hand: { L, R } (preset |
//              [out, down] | keyframes [[t, preset], ...]), prop: { L, R } ('mug'|'paper'|'phone'|'coffee'|'pen'|'bag'|
//              'cheese'|{ kind, color, text }), lean, tilt, light, bright, idle (0..1.5), talk (0..1), gesture (0..1),
//              fx: 'sweat'|'sparkle'|'blush', squash }
// =====================================================================
const T3 = { breathe: 0, ink: '#3a221f', feat: '#33201c', limb: '#382320', U: 0.0165, k: 1.6, a: 112, ref: 1.25, gain: 1.0, cacheN: 14, levels: [0.45, 0.7, 1.0, 1.4, 2.0], texel: 1.0 };
const T3_SKIN = { white: '#fbf3ea', peach: '#f8dcc4', tan: '#e4b48a', brown: '#a8714c', pale: '#f4ece8' };
const T3_HAIR = { brown: '#7a4a2c', dark: '#3e2b22', black: '#2a2630', grey: '#a8a3a0', white: '#e9e5df', ginger: '#c8682a', blond: '#d8a648', auburn: '#8a3c24', chestnut: '#5c3220' };
const t3Hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const t3HexOf = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const t3Mix = (a, b, t) => { const A = t3Hex(a), B = t3Hex(b); return t3HexOf(A.map((v, i) => v + (B[i] - v) * t)); };
const t3Mul = (c, k) => t3HexOf(t3Hex(c).map((v) => v * k));
const t3Lum = (c) => { const [r, g, b] = t3Hex(c); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
const t3Rnd = (s, k) => { const x = Math.sin(s * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const t3Seed = (str) => { let h = 7; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % 9973; return h; };
const t3Q = (x, q) => Math.round(x / q) * q;
const t3Sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
// Ricks' snap (measured in the 4 Creatorize/Ricks shorts): ~65-70 % of a move in the first 4 of 10 frames, then it settles
// slowly to 100 % at frame 10 (0.33 s) — no overshoot, no tween between drawings; then the pose holds DEAD still
const T3_SNAP = 0.33, t3Snap = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) ** 2.2; };

// ---- geometry
// superellipse: crown / jaw exponents, egg (+ = wider at the bottom), optional radial bump(t, X, Y); clockwise on screen
function t3Blob(cx, cy, a, b, nTop = 2, nBot = 2, egg = 0, n = 72, bump = null) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? nTop : nBot);
    let X = Math.sign(c) * Math.abs(c) ** e; const Y = Math.sign(s) * Math.abs(s) ** e; X *= 1 + egg * Y;
    const r = bump ? bump(t, X, Y) : 1; P.push([cx + a * X * r, cy + b * Y * r]);
  }
  return P;
}
const t3Path = (g, P, close = true) => { g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); };
function t3Spline(Q, n = 8) {   // Catmull-Rom through the points, as a polyline
  const out = [];
  for (let i = 0; i < Q.length - 1; i++) {
    const p0 = Q[Math.max(0, i - 1)], p1 = Q[i], p2 = Q[i + 1], p3 = Q[Math.min(Q.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  out.push(Q[Q.length - 1]); return out;
}
const t3Quad = (a, k, b, n = 12) => { const c = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); } return out; };
function t3Stroke(g, P, w, col = T3.ink) { g.lineCap = 'round'; g.lineJoin = 'round'; t3Path(g, P, false); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
// a stroke whose width tapers from wa to wb along the path (limbs: thicker at the root, ink weight toward the bottom)
function t3TaperPath(g, P, wa, wb, col) {
  const n = P.length; if (n < 2) return; const L = [], R = [];
  for (let i = 0; i < n; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const w = (wa + (wb - wa) * (i / (n - 1))) / 2; L.push([P[i][0] + nx * w, P[i][1] + ny * w]); R.push([P[i][0] - nx * w, P[i][1] - ny * w]); }
  g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); R.reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fillStyle = col; g.fill();
  for (const [p, w] of [[P[0], wa], [P[n - 1], wb]]) { g.beginPath(); g.arc(p[0], p[1], w / 2, 0, TAU); g.fill(); }
}
function t3Taper(g, a, b, wa, wb, col = T3.feat) {   // brows: thick end at a, round ends
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  t3Path(g, [[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]]);
  g.fillStyle = col; g.fill(); for (const [p, w] of [[a, wa], [b, wb]]) { g.beginPath(); g.arc(p[0], p[1], w / 2, 0, TAU); g.fill(); }
}
// thick-thin ink ring centred on the contour: w(θ) = w0 (1 + k cos(θ − thick)) — k .5 gives Ricks' 3:1
function t3InkRing(g, P, w0, thick, k = 0.5, col = T3.ink) {
  const n = P.length; let cx = 0, cy = 0; P.forEach(([x, y]) => { cx += x / n; cy += y / n; });
  const out = [], inn = [];
  P.forEach((q, i) => { const a = P[(i + n - 1) % n], b = P[(i + 1) % n]; let nx = b[1] - a[1], ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick)); out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]); });
  g.beginPath(); out.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  inn.reverse().forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = col; g.fill('evenodd');
}
// soft volume over whatever is already filled inside P: a multiply ramp from the lit side to the far side (tinted by the
// room), an occlusion ring hugging the outline, a light rim just inside the shadow edge (Ricks torsos) and a faint glow
function t3Volume(g, P, cx, cy, rx, ry, light, o = {}) {
  const dx = Math.cos(light), dy = Math.sin(light), q = ry / rx;
  const radial = (x0, y0, r0, r1, stops, op, a = 1) => { g.save(); g.globalAlpha = a; g.translate(x0, y0); g.scale(1, q); const gr = g.createRadialGradient(0, 0, r0, 0, 0, r1);
    stops.forEach(([s, c]) => gr.addColorStop(s, c)); g.globalCompositeOperation = op; g.fillStyle = gr; g.fillRect(-rx * 4, -rx * 4, rx * 8, rx * 8); g.restore(); };
  g.save(); t3Path(g, P); g.clip();
  const sh = o.shift ?? 0.42;
  radial(cx + dx * rx * sh, cy + dy * ry * sh, 0, rx * (o.reach ?? 1.5), [[0, '#ffffff'], [o.flat ?? 0.42, '#ffffff'], [0.78, o.mid ?? '#ecdcd8'], [1, o.far ?? '#cbb3b0']], 'multiply');
  radial(cx, cy, rx * (o.ring0 ?? 0.72), rx * 1.03, [[0, '#ffffff'], [1, o.rim ?? '#dcc8c3']], 'multiply');
  if (o.rimLight) {   // a thin bounce light just inside the far edge
    const gr = g.createLinearGradient(cx + dx * rx, cy + dy * ry, cx - dx * rx, cy - dy * ry);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.86, 'rgba(255,255,255,0)'); gr.addColorStop(0.95, `rgba(255,244,236,${o.rimLight})`); gr.addColorStop(1, 'rgba(255,244,236,0)');
    g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(cx - rx * 2, cy - ry * 2, rx * 4, ry * 4); g.globalCompositeOperation = 'source-over';
  }
  if (o.glow !== 0) radial(cx + dx * rx * 0.4, cy + dy * ry * 0.42, 0, rx * 0.62, [[0, `rgba(255,251,244,${o.glow ?? 0.22})`], [1, 'rgba(255,251,244,0)']], 'screen');
  g.restore();
}
// offscreen scratch layers (hair, ink silhouettes), shared by every person
const T3L = {};
function t3Layer(w, h, n) { const c = (T3L[n] ||= document.createElement('canvas')); if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.clearRect(0, 0, c.width, c.height); return [c, x]; }
function t3Silhouette(src, n = 'ink', col = T3.ink) { const [c, x] = t3Layer(src.width, src.height, n); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; }
// stamp the ink silhouette in 16 directions (radius r px, heavier toward `thick`), then the layer itself
function t3Outlined(g, src, ink, r, thick, k = 0.5) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, rr = r * (1 + k * Math.cos(a - thick)); g.drawImage(ink, Math.cos(a) * rr, Math.sin(a) * rr); }
  g.drawImage(src, 0, 0); g.restore();
}
// per-person LRU of pre-drawn parts (head, torso): canvas sized w x h design units at the person's resolution
function t3Part(p, kind, key, w, h, draw) {
  key += '|' + p.k; const M = (p.cache[kind] ||= new Map()); let c = M.get(key);
  if (c) { M.delete(key); M.set(key, c); return c; }
  if (M.size >= T3.cacheN) { const [k0, c0] = M.entries().next().value; M.delete(k0); c = c0; } else c = document.createElement('canvas');
  const k = p.k; c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); const g = c.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, w, h);
  draw(g); M.set(key, c); return c;
}

// ---- heads: each person's own lumpy shape (Ricks: never a perfect circle)
function t3HeadSpec(o) {
  const s = t3Seed(o.key), R = (k) => t3Rnd(s, k);
  return Object.assign({ hw: 0.93 + 0.05 * R(11), nTop: 1.95 + 0.15 * R(12), nBot: 2.05 + 0.2 * R(13), egg: -0.07 + 0.05 * R(14), chin: 0.008 + 0.012 * R(23), chinX: (R(24) - 0.5) * 0.3, asym: (R(15) < 0.5 ? -1 : 1) * (0.012 + 0.015 * R(15)),
    rot: (R(16) < 0.5 ? -1 : 1) * (0.015 + 0.02 * R(22)), lump: 0.75, ph: [R(17), R(18), R(19), R(20)].map((v) => v * TAU), flat: R(21) }, o.head || {});
}
// contour points of the head for a facing f (-2..2) — asym swings to the facing side, a nose bump in profile
function t3HeadPath(H, cx, cy, A, Bh, f, n = 120) {
  const m = Math.abs(f), dir = Math.sign(f) || 1, asym = H.asym * (m > 0.2 ? dir * Math.sign(H.asym) : 1);   // v5: no facing skew (the face stays centred)
  const L = H.lump, ph = H.ph, prof = 0;   // v5 (4 Ricks shorts): no nose, the head stays round in profile
  const bump = (t, X, Y) => {
    let r = 1 + L * (0.016 * Math.sin(2 * t + ph[0]) + 0.013 * Math.sin(3 * t + ph[1]) + 0.008 * Math.sin(5 * t + ph[2]) + 0.004 * Math.sin(7 * t + ph[3]));
    if (Y > 0.4) r += H.chin * (Y - 0.4) / 0.6 * Math.exp(-((X - H.chinX) ** 2) / 0.18);   // the chin drops a little, off-centre
    if (H.flat > 0.6 && Y < -0.75) r -= 0.025 * (H.flat - 0.6) * 4 * (Math.abs(Y) - 0.75) * 4;   // a flattened crown on some
    r *= 1 + asym * Math.sign(X) * Math.abs(X) * (Y > -0.3 ? 1 : 0.5);
    if (prof > 0) { const tn = dir > 0 ? 0.32 : Math.PI - 0.32, d = Math.atan2(Math.sin(t - tn), Math.cos(t - tn)); r += prof * 0.085 * Math.exp(-(d * d) / 0.012); }   // nose
    return r;
  };
  return t3Blob(cx, cy, A, Bh, H.nTop, H.nBot, H.egg, n, bump);
}

// ---- hair (Ricks hairstyles, drawn in code). Units: u across the head (A), v down the head (B), 0 = head centre.
// mass: { sx, sy, dy, lobes: [n, amp, sharp, a0, a1] }; line: hairline (left -> right), everything of the mass below it is
// cut away; fringe: [n, depth, sharp, u0, u1] (scallops/zigzag hanging off the hairline); part: the ink part; whorl: the
// crown the strands radiate from; strands: count; fly: loose hairs outside the silhouette; ell: extra ellipses [u,v,ru,rv];
// behind: shapes drawn behind the head (long hair, bob back, ponytail); gloss: 'band' | 'streak' | 'soft' | 'none'
const T3_HSTYLE = {
  // Ricks caps (refs: genius / "Then" guy / Edison): smooth mass a bit bigger than the skull, a centre part where two fringe
  // locks meet in a cusp, 2-4 thin light streaks running along each lock, darker toward the edge. cusp = line index of the part.
  mop: { mass: { top: 0.12, side: 0.04 }, cusp: 6,
    line: [[-1.3, 0.24], [-1.04, 0.16], [-0.96, -0.08], [-0.74, -0.27], [-0.42, -0.34], [-0.12, -0.36], [0.06, -0.5], [0.22, -0.37], [0.52, -0.34], [0.8, -0.25], [0.97, -0.06], [1.04, 0.16], [1.3, 0.24]],
    part: [[0.06, -1.1], [0.06, -0.84], [0.06, -0.52]], whorl: [0.06, -1.02], streaks: 3, gloss: 'none' },
  tuft: { mass: { top: 0.1, side: 0.035 }, cusp: 6,
    line: [[-1.3, 0.2], [-1.03, 0.12], [-0.95, -0.12], [-0.72, -0.32], [-0.4, -0.4], [-0.1, -0.42], [0.08, -0.56], [0.24, -0.42], [0.54, -0.38], [0.8, -0.3], [0.96, -0.1], [1.03, 0.12], [1.3, 0.2]],
    part: [[0.08, -1.1], [0.08, -0.84], [0.08, -0.58]], whorl: [0.08, -1.02], streaks: 3, gloss: 'none',
    extra: [[-0.18, -1.0], [-0.22, -1.32], [-0.13, -1.62], [0.05, -1.86], [0.15, -1.84], [0.05, -1.58], [0.06, -1.27], [0.18, -1.0]] },
  side: { mass: { top: 0.12, side: 0.04 }, cusp: 4,
    line: [[-1.3, 0.02], [-1.02, -0.06], [-0.9, -0.34], [-0.64, -0.55], [-0.42, -0.66], [-0.2, -0.52], [0.16, -0.4], [0.5, -0.26], [0.8, -0.08], [0.98, 0.14], [1.3, 0.22]],
    part: [[-0.42, -1.1], [-0.42, -0.88], [-0.42, -0.66]], whorl: [-0.42, -1.02], streaks: 4, fly: 2, strandsFront: 2, gloss: 'none' },
  bowl: { mass: { top: 0.11, side: 0.05 }, line: [[-1.3, 0.42], [-1.0, 0.4], [-0.94, 0.08], [-0.86, -0.18], [-0.45, -0.24], [0, -0.25], [0.45, -0.24], [0.86, -0.18], [0.94, 0.08], [1.0, 0.4], [1.3, 0.42]],
    fringe: [5, 0.05, 0.5, -0.82, 0.82], part: [[0.1, -1.1], [0.1, -0.86], [0.1, -0.62]], whorl: [0.1, -1.02], streaks: 2, curlsFront: 2, gloss: 'none' },
  // the casino guy: big clumps with curved tips, flame-like fringe clumps, one wide lilac band
  messy: { mass: { top: 0.12, side: 0.05, lobes: [8, 0.1, 0.7, 186, 354] },
    line: [[-1.3, 0.24], [-1.04, 0.14], [-0.94, -0.12], [-0.6, -0.33], [-0.15, -0.38], [0.3, -0.36], [0.66, -0.3], [0.94, -0.1], [1.04, 0.14], [1.3, 0.24]],
    fringe: [5, 0.15, 0.65, -0.9, 0.9], whorl: [0.05, -1.0], dash: 5, fly: 3, gloss: 'band' },
  // the cashier: black bob, straight bangs with soft little waves, streaks
  bob: { mass: { top: 0.1, side: 0.06 }, fly: 2,
    line: [[-1.4, 0.64], [-1.0, 0.64], [-0.93, 0.1], [-0.84, -0.27], [-0.4, -0.31], [0, -0.32], [0.4, -0.31], [0.84, -0.27], [0.93, 0.1], [1.0, 0.64], [1.4, 0.64]],
    ell: [[-0.98, 0.3, 0.13, 0.36], [0.98, 0.3, 0.13, 0.36]], strandsFront: 2, fringe: [9, 0.025, 0.3, -0.82, 0.82], part: [[0.05, -1.1], [0.05, -0.9], [0.05, -0.72]], whorl: [0.05, -1.05], streaks: 2, gloss: 'none', raise: 0.04,
    behind: [['ell', 0, 0.1, 1.12, 0.6]] },
  // the curly lady: a scalloped cloud taller than the head, rows of ∩ curls inside
  curly: { mass: { cloud: [1.16, 1.14, -0.12, 30] }, ringlets: 3, line: [[-1.3, 0.5], [-1.02, 0.4], [-0.9, 0.02], [-0.72, -0.3], [-0.36, -0.42], [0, -0.44], [0.36, -0.42], [0.72, -0.3], [0.9, 0.02], [1.02, 0.4], [1.3, 0.5]],
    fringe: [7, 0.07, 0, -0.86, 0.86], scales: 1, gloss: 'none', raise: 0.04 },
  bun: { mass: { top: 0.07, side: 0.03 }, cusp: 4, line: [[-1.3, 0.3], [-1.03, 0.2], [-0.86, -0.22], [-0.4, -0.46], [0, -0.6], [0.4, -0.46], [0.86, -0.22], [1.03, 0.2], [1.3, 0.3]],
    ell: [[0, -1.16, 0.36, 0.3]], part: [[0, -1.0], [0, -0.82], [0, -0.6]], whorl: [0, -1.0], streaks: 2, gloss: 'none', bunLines: [0, -1.16, 0.36, 0.3] },
  topknot: { mass: { top: 0.07, side: 0.03 }, cusp: 4, line: [[-1.3, 0.12], [-1.02, 0.04], [-0.86, -0.36], [-0.4, -0.56], [0, -0.66], [0.4, -0.56], [0.86, -0.36], [1.02, 0.04], [1.3, 0.12]],
    ell: [[0, -1.12, 0.26, 0.2]], whorl: [0, -1.0], streaks: 3, gloss: 'none', bunLines: [0, -1.12, 0.26, 0.2], pin: true },
  long: { mass: { top: 0.08, side: 0.04 }, cusp: 4, line: [[-0.9, 1.9], [-0.86, 0.3], [-0.76, -0.24], [-0.36, -0.44], [0.08, -0.58], [0.4, -0.44], [0.76, -0.24], [0.86, 0.3], [0.9, 1.9]],
    ell: [[-0.9, 0.42, 0.28, 0.66], [0.9, 0.42, 0.28, 0.66]], part: [[0.08, -1.1], [0.08, -0.84], [0.08, -0.58]], whorl: [0.08, -1.04], streaks: 3, fly: 1, gloss: 'none',
    behind: [['poly', [[-1.12, -0.2], [-1.2, 0.8], [-1.05, 1.75], [-0.6, 1.9], [0.6, 1.9], [1.05, 1.75], [1.2, 0.8], [1.12, -0.2]]]] },
  ponytail: { mass: { top: 0.08, side: 0.035 }, cusp: 4, line: [[-1.3, 0.2], [-1.02, 0.1], [-0.88, -0.3], [-0.56, -0.5], [-0.3, -0.62], [0.05, -0.5], [0.5, -0.36], [0.86, -0.12], [1.04, 0.16], [1.3, 0.22]],
    part: [[-0.3, -1.08], [-0.3, -0.84], [-0.3, -0.62]], whorl: [-0.3, -1.0], streaks: 3, fly: 1, gloss: 'none',
    behind: [['poly', [[0.7, -0.75], [1.25, -0.6], [1.45, -0.1], [1.4, 0.55], [1.18, 0.95], [1.05, 0.55], [1.1, 0.0], [0.9, -0.4]]]], tie: [0.95, -0.62] },
  balding: { mass: false, cres: [[150, 214], [-34, 30]], combover: 2, fly: 1, gloss: 'none' },
  short: { mass: { top: 0.06, side: 0.025 }, cusp: 5, line: [[-1.3, 0.12], [-1.02, 0.04], [-0.88, -0.32], [-0.5, -0.46], [0.05, -0.48], [0.28, -0.6], [0.5, -0.46], [0.9, -0.2], [1.02, 0.04], [1.3, 0.12]],
    part: [[0.28, -1.06], [0.28, -0.84], [0.28, -0.62]], whorl: [0.28, -1.0], streaks: 2, gloss: 'none' },
  spiky: { mass: { top: 0.09, side: 0.04, lobes: [8, 0.16, 1, 190, 350] }, line: [[-1.3, 0.04], [-1.02, -0.06], [-0.82, -0.36], [-0.6, -0.26], [-0.38, -0.47], [-0.12, -0.34], [0.14, -0.5], [0.4, -0.35], [0.64, -0.46], [0.86, -0.22], [1.02, 0.0], [1.3, 0.06]],
    sharp: true, whorl: [0, -0.95], strands: 6, gloss: 'streak' },
  bald: { mass: false, cres: [[160, 200], [-20, 20]], gloss: 'none' },
};
const T3_HALIAS = { cap: 'short', swoop: 'mop', combed: 'side' };
const t3Style = (n) => T3_HSTYLE[T3_HALIAS[n] || n];
function t3HairCol(o) { return T3_HAIR[o.hairColor] || o.hairColor || T3_HAIR.brown; }
// the cut line in (u, v): two splines meeting in a cusp at the part (Ricks' parted fringe), optional fringe scallops
function t3HairlineUV(S, f) {
  const shift = f.shift, rz = S.raise ?? 0.12, L = S.line.map(([u, v]) => [u + shift * (1 - Math.min(1, Math.abs(u))) * 0.9, v - rz * Math.max(0, 1 - (Math.abs(u) / 1.1) ** 6)]);   // fringe above the brows
  let pts = S.cusp != null ? t3Spline(L.slice(0, S.cusp + 1), 8).concat(t3Spline(L.slice(S.cusp), 8).slice(1)) : t3Spline(L, S.sharp ? 3 : 8);
  if (S.fringe && !f.back) { const [n, d, sh, u0, u1] = S.fringe, s = f.seed;
    pts = pts.map(([u, v]) => { const x = (u - u0 - shift) / (u1 - u0); if (x <= 0 || x >= 1) return [u, v];
      const ph = x * n, fr = ph - Math.floor(ph), tri = 1 - Math.abs(fr * 2 - 1), rnd = 0.7 + 0.6 * t3Rnd(s, Math.floor(ph) + 3);
      const shape = sh * tri ** 1.4 + (1 - sh) * Math.sin(fr * Math.PI); return [u, v + d * rnd * shape * Math.sin(x * Math.PI) ** 0.3]; }); }
  return pts;
}
function t3Hairline(S, P, f) { return t3HairlineUV(S, f).map(([u, v]) => P(u, v)); }
function t3HairLayers(o, f, cx, cy, A, Bh, light, env, hp) {
  const S = t3Style(o.hair); if (!S) return null;
  const col = t3HairCol(o), s0 = t3Seed(o.key), back = f.back, dir = f.dir, m = f.m;
  const shift = back ? 0 : dir * 0.12 * Math.max(0, m - 1.3);   // v5: symmetric at front / 3/4; only a profile moves the part
  const P = (u, v) => [cx + (u + (back ? 0 : -dir * 0.1 * Math.max(0, m - 1))) * A, cy + v * Bh];   // in profile the mass slides to the back of the skull
  const [hc, h] = t3Layer(Math.ceil(f.w * f.k), Math.ceil(f.h * f.k), 'hair'); h.setTransform(f.k, 0, 0, f.k, 0, 0);
  const mass = [];
  if (S.mass) { const M = S.mass, lb = M.lobes;
    const bump = lb ? (t, X, Y) => { const a = ((t * 180 / Math.PI) + 360) % 360; if (a < lb[3] || a > lb[4]) return 1;
      const x = (a - lb[3]) / (lb[4] - lb[3]) * lb[0], fr = x - Math.floor(x), k = t3Rnd(s0, Math.floor(x) + 40), sh = lb[2] ? 1 - Math.abs(fr * 2 - 1) : Math.sin(fr * Math.PI);
      return 1 + lb[1] * (0.55 + 0.9 * k) * (lb[2] ? sh ** 1.6 : sh) * Math.sin((x / lb[0]) * Math.PI) ** 0.4; } : null;
    if (M.cloud) { const [rx, ry, dy0, n] = M.cloud; for (let i = 0; i < n; i++) { const a = Math.PI * (0.78 + 1.44 * i / (n - 1)), r = 0.96 + 0.06 * t3Rnd(s0, i);
        const [x, y] = P(Math.cos(a) * r * rx, dy0 + Math.sin(a) * r * ry), sz = 0.13 + 0.11 * t3Rnd(s0, i + 70); mass.push(t3Blob(x, y, sz * A, sz * 0.95 * Bh, 2, 2, 0, 22)); }
      mass.push(t3Blob(...P(0, dy0), A * rx * 0.97, Bh * ry * 0.97, 2, 2, 0, 72)); }
    else { const top = M.top ?? 0.1, sd = M.side ?? 0.035, pc = P(0, 0);   // flush cap: head contour + thickness (top..side), optional clumps
      mass.push(hp.map(([x, y]) => { const dx = x - cx, dy = y - cy, Y = dy / Bh, X = dx / A, t = Math.atan2(Y, X), up = Math.max(0, -Y);
        const k = 1 + sd + (top - sd) * up ** 1.4 + (bump ? bump(t, X, Y) - 1 : 0);
        return [pc[0] + dx * k, pc[1] + dy * k]; })); } }
  if (S.extra && !back) mass.push(t3Spline(S.extra.map(([u, v]) => P(u + shift * 0.5, v)), 6));
  (S.ell || []).forEach(([u, v, ru, rv]) => mass.push(t3Blob(...P(u, v), ru * A, rv * Bh, 2, 2, 0, 48)));
  (S.cres || []).forEach(([a0, a1]) => { const out = [], inn = [];   // side hair hugging the skull (balding): a crescent on the head contour itself
    const seg = hp.filter(([x, y]) => { let a = Math.atan2((y - cy) / Bh, (x - cx) / A) * 180 / Math.PI; if (a0 > 90 && a < 0) a += 360; return a >= a0 && a <= a1; })
      .sort((p1, p2) => { const f1 = (q) => { let a = Math.atan2((q[1] - cy) / Bh, (q[0] - cx) / A) * 180 / Math.PI; if (a0 > 90 && a < 0) a += 360; return a; }; return f1(p1) - f1(p2); });
    seg.forEach(([x, y], i) => { const k = Math.sin(Math.PI * i / Math.max(1, seg.length - 1)) ** 0.6, dx = x - cx, dy = y - cy, j = 1 + 0.025 * Math.sin(i * 2.3 + s0);
      out.push([cx + dx * (1 + 0.06 * k * j), cy + dy * (1 + 0.06 * k * j)]); inn.push([cx + dx * (1 - 0.1 * k), cy + dy * (1 - 0.1 * k)]); });
    if (seg.length > 2) mass.push(out.concat(inn.reverse())); });
  h.fillStyle = col; mass.forEach((q) => { t3Path(h, q); h.fill(); });
  // form shade: lit toward the light, a cool darker far side (tinted by the room)
  h.save(); h.beginPath(); mass.forEach((q) => { q.forEach(([x, y], i) => (i ? h.lineTo(x, y) : h.moveTo(x, y))); h.closePath(); }); h.clip();
  { const dx = Math.cos(light), dy = Math.sin(light), [gx, gy] = [cx + dx * A * 0.5, cy - Bh * 0.55 + dy * Bh * 0.3], gr = h.createRadialGradient(gx, gy, 0, gx, gy, A * 1.9);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#ffffff'); gr.addColorStop(1, t3Mix(t3Lum(col) > 0.5 ? '#a99cb0' : '#806a80', env, 0.3));
    h.globalCompositeOperation = 'multiply'; h.fillStyle = gr; h.fillRect(cx - 3 * A, cy - 3 * Bh, 6 * A, 6 * Bh); }
  h.restore();
  // the hairline cut (back view: the nape)
  let L = null;
  if (back) { L = t3Spline([[-1.4, 0.62], [-0.95, 0.5], [-0.4, 0.6], [0, 0.56], [0.4, 0.62], [0.95, 0.5], [1.4, 0.62]].map(([u, v]) => [cx + u * A, cy + v * Bh]), 6); }
  else if (S.line) L = t3Hairline(S, P, { shift, back, seed: s0 });
  if (L && !(back && (S.mass === false))) { h.globalCompositeOperation = 'destination-out'; t3Path(h, [...L, [L.at(-1)[0], cy + 4 * Bh], [L[0][0], cy + 4 * Bh]]); h.fill(); }
  h.globalCompositeOperation = 'source-atop';
  const dark = t3Mul(col, t3Lum(col) > 0.5 ? 0.7 : 0.58), lite = t3Mix(col, '#ffffff', t3Lum(col) > 0.5 ? 0.45 : 0.25);
  if (L) { h.save(); h.filter = `blur(${Math.max(1, Math.round(0.06 * Bh * f.k))}px)`; h.globalAlpha = 0.3; t3Stroke(h, L, 0.2 * Bh, dark); h.restore(); }   // darker toward the hairline
  // strands radiating from the crown whorl (Ricks: thin dark lines + a few light ones; side parts sweep across)
  const wh = back ? [0.05, -0.62] : S.whorl ? [S.whorl[0] + shift, S.whorl[1]] : null;
  if (wh && S.strands) { const n = back ? 16 : S.strands;
    for (let i = 0; i < n; i++) { const r1 = t3Rnd(s0, i + 60), r2 = t3Rnd(s0, i + 90);
      let a = back ? Math.PI * (0.05 + 0.9 * (i + 0.5) / n) : S.sweep ? Math.PI * (0.02 + 0.5 * (i + 0.5) / n) : Math.PI * (0.06 + 0.88 * (i + 0.5) / n);
      if (S.sweep && i % 2) a = Math.PI * (0.55 + 0.4 * (i + 0.5) / n);
      const len = back ? 1.0 + 0.25 * r1 : 0.62 + 0.3 * r1, st = back ? 0.08 + 0.1 * r2 : 0.3 + 0.15 * r2, cu = (r2 - 0.5) * 0.5 + (S.sweep ? 0.35 : 0);
      const p0 = [wh[0] + Math.cos(a) * st, wh[1] + Math.sin(a) * st * 0.8], p2 = [wh[0] + Math.cos(a) * len * 1.05, wh[1] + Math.sin(a) * len * 0.95];
      const pm = [(p0[0] + p2[0]) / 2 - Math.sin(a) * cu * 0.25, (p0[1] + p2[1]) / 2 + Math.cos(a) * cu * 0.2];
      const lk = S.locks && !back; h.save(); h.globalAlpha = lk ? 0.55 : i % 3 === 2 ? 0.25 : 0.34; t3Stroke(h, t3Quad(P(...p0), P(...pm), P(...p2), 10), (lk ? 0.028 : i % 3 === 2 ? 0.015 : 0.02) * Bh, lk ? dark : i % 3 === 2 ? lite : dark); h.restore(); }
    // the whorl itself: a small spiral
    if (back) { const [x, y] = P(...wh), q = []; for (let i = 0; i <= 18; i++) { const a = i * 0.45, r = 0.012 * A * i * 0.35; q.push([x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r]); }
      h.save(); h.globalAlpha = 0.55; t3Stroke(h, q, 0.02 * Bh, dark); h.restore(); } }
  if (S.dash && !back) for (let i = 0; i < S.dash; i++) { const a = Math.PI * (1.08 + 0.84 * t3Rnd(s0, i + 120)), r = 0.55 + 0.4 * t3Rnd(s0, i + 140), [x, y] = P(Math.cos(a) * r + shift * 0.5, -0.08 + Math.sin(a) * r * 0.95);
    h.save(); h.globalAlpha = 0.6; t3Stroke(h, t3Quad([x - 0.09 * A, y + 0.02 * Bh], [x, y - 0.025 * Bh], [x + 0.09 * A, y + 0.03 * Bh], 6), 0.024 * Bh, T3.ink); h.restore(); }
  if (S.curlArcs) for (let i = 0; i < S.curlArcs; i++) { const a = Math.PI * (1.0 + 1.0 * (i + 0.5) / S.curlArcs), r = 0.68 + 0.3 * t3Rnd(s0, i + 2), [x, y] = P(Math.cos(a) * r * 1.05, -0.1 + Math.sin(a) * r);
    h.beginPath(); h.arc(x, y, 0.09 * A, 0.5 + t3Rnd(s0, i + 3), 3.4 + t3Rnd(s0, i + 3)); h.lineWidth = 0.028 * Bh; h.strokeStyle = dark; h.globalAlpha = 0.75; h.stroke(); h.globalAlpha = 1; }
  if (S.bunLines) { const [u, v, ru, rv] = S.bunLines; for (let i = -2; i <= 2; i++) { h.save(); h.globalAlpha = 0.45; t3Stroke(h, t3Quad(P(u + i * ru * 0.32, v - rv * 0.85), P(u + i * ru * 0.48, v), P(u + i * ru * 0.3, v + rv * 0.85), 8), 0.02 * Bh, dark); h.restore(); } }
  if (S.part && !back) t3Stroke(h, t3Spline(S.part.map(([u, v]) => P(u + shift, v)), 6), 0.03 * Bh, T3.ink);
  if (S.streaks && !back && S.line) {   // thin light streaks running along each fringe lock, stronger on the lit side
    const Luv = t3HairlineUV(Object.assign({}, S, { fringe: null }), { shift, back, seed: s0 }), pu = S.part ? S.part[0][0] + shift : 0, ls = Math.cos(light) > 0.12 ? 1 : -1;
    for (const half of [-1, 1]) { const seg = Luv.filter(([u]) => (u - pu) * half > 0.1 && Math.abs(u) < 0.86); if (seg.length < 3) continue;
      const mid = seg.reduce((a, q) => a + q[0], 0) / seg.length, lit = half === -ls ? 1 : 0.55;
      for (let k = 1; k <= S.streaks; k++) { const q = seg.filter((_, i) => i > seg.length * 0.12 * k && i < seg.length * (1 - 0.1 * k)).map(([u, v]) => P(mid + (u - mid) * (1 - 0.08 * k), v - 0.1 - 0.085 * k));
        if (q.length < 2) continue; h.save(); h.globalAlpha = (0.62 - 0.1 * k) * lit; t3Stroke(h, q, (0.026 - 0.003 * k) * Bh, lite); h.restore(); } }
    for (const half of [-1, 1]) { h.save(); h.globalAlpha = 0.35; t3Stroke(h, t3Quad(P(pu + half * 0.06, -0.98), P(pu + half * 0.42, -0.86), P(pu + half * 0.72, -0.56), 10), 0.022 * Bh, dark); h.restore(); } }
  if (S.scales && !back) { for (let i = 0; i < 46; i++) {   // curly: scattered curls of mixed size and turn (no grid)
      const a = TAU * t3Rnd(s0, i + 600), r = Math.sqrt(t3Rnd(s0, i + 650)), u = Math.cos(a) * r * 1.05 + shift * 0.5, v = -0.12 + Math.sin(a) * r * 1.02; if (v > -0.42 + 0.25 * Math.abs(u) && Math.abs(u) < 0.8) continue;
      const [x, y] = P(u, v), rr = (0.06 + 0.06 * t3Rnd(s0, i + 700)) * A, a0 = Math.PI * (0.9 + 0.5 * t3Rnd(s0, i + 750));
      h.beginPath(); h.arc(x, y, rr, a0, a0 + Math.PI * (0.9 + 0.5 * t3Rnd(s0, i + 800))); h.lineWidth = 0.022 * Bh; h.strokeStyle = dark; h.globalAlpha = 0.8; h.stroke();
      if (i % 3 === 0) { h.beginPath(); h.arc(x - 0.2 * rr, y - 0.15 * rr, rr * 0.6, Math.PI * 1.15, Math.PI * 1.6); h.lineWidth = 0.016 * Bh; h.strokeStyle = lite; h.globalAlpha = 0.55; h.stroke(); } h.globalAlpha = 1; } }
  // gloss: a soft lilac/white band + crisp streaks on the lit side
  const gc = o.glossColor || (t3Lum(col) < 0.3 ? '#b9a8e6' : t3Lum(col) > 0.6 ? '#ffffff' : '#f3d4b8'), gs = Math.cos(light) > 0.12 ? -1 : 1;
  const arc = (cu, cv, ru, rv, a0, a1, w, al, blur) => { const q = []; for (let i = 0; i <= 16; i++) { const a = ((a0 + (a1 - a0) * i / 16) * Math.PI) / 180; q.push(P(gs * (cu + ru * Math.cos(a)) + shift * 0.4, cv + rv * Math.sin(a))); }
    h.save(); h.globalAlpha = al; if (blur) h.filter = `blur(${Math.max(1, Math.round(blur * Bh * f.k))}px)`; t3Stroke(h, q, w * Bh, gc); h.restore(); };
  const G = S.gloss ?? 'band';
  if (G === 'band') { arc(0, -0.15, 0.68, 0.64, 214, 244, 0.15, 0.2, 0.035); }
  else if (G === 'streak') { for (const [r, a0, a1, w, al] of [[0.62, 210, 246, 0.045, 0.45], [0.74, 214, 242, 0.032, 0.4], [0.86, 218, 236, 0.028, 0.3]]) arc(0, -0.1, r, r * 0.95, a0, a1, w, al, 0); }
  else if (G === 'soft') arc(0, -0.15, 0.66, 0.62, 205, 250, 0.22, 0.3, 0.04);
  // (2026-11-10, opt-in T3.hairDetail = 1..2) Ricks-like strand detail: many fine strands flowing from the crown to the
  // edges (dark + light on dark hair), clumps separated by darker grooves, a soft sheen + crisp gloss streaks on the lit side
  if (T3.hairDetail && S.mass && !S.mass.cloud) { const hd = T3.hairDetail, dk = t3Lum(col) < 0.25, ln = dk ? t3Mix(col, '#c8bce8', 0.45) : lite, grv = t3Mul(col, dk ? 0.5 : 0.55), c0 = back ? [0.05, -0.62] : S.whorl ? [S.whorl[0] + shift, S.whorl[1]] : [shift, -1.0];
    const n = Math.round((back ? 30 : 22) * hd);
    for (let i = 0; i < n; i++) { const r1 = t3Rnd(s0, i + 1300), r2 = t3Rnd(s0, i + 1400), a = Math.PI * (0.04 + 0.92 * (i + r1 * 0.6) / n), len = 0.95 + 0.4 * r2, bend = (r1 - 0.5) * 0.35;
      const p0 = [c0[0] + Math.cos(a) * 0.08, c0[1] + Math.sin(a) * 0.06], p2 = [c0[0] + Math.cos(a) * len * 1.1, c0[1] + Math.sin(a) * len], pm = [(p0[0] + p2[0]) / 2 + bend * Math.sin(a), (p0[1] + p2[1]) / 2 - bend * 0.3];
      const groove = i % 4 === 0; h.save(); h.globalAlpha = groove ? 0.42 : (i % 2 ? 0.22 : 0.3); t3Stroke(h, t3Quad(P(...p0), P(...pm), P(...p2), 12), (groove ? 0.03 : 0.012) * Bh, groove ? grv : (i % 2 ? ln : dark)); h.restore(); }
    // sheen: a soft broad highlight + 3 crisp short gloss streaks following the skull curve (lit side)
    arc(0, -0.2, 0.6, 0.58, 212, 248, 0.2, dk ? 0.32 : 0.26, 0.045);
    for (const [r, a0, a1, w, al] of [[0.56, 214, 236, 0.024, 0.75], [0.66, 218, 240, 0.02, 0.6], [0.48, 222, 238, 0.016, 0.55]]) arc(0.04, -0.16, r, r * 0.92, a0, a1, w * hd, al, 0); }
  h.globalCompositeOperation = 'source-over';
  // loose flyaway hairs (outside the silhouette) and the balding comb-over
  const fly = (S.fly || 0) + (o.messy ?? 0), flies = [];
  for (let i = 0; i < fly; i++) { const a = Math.PI * (1.2 + 0.6 * t3Rnd(s0, i + 200)), [x0, y0] = P(Math.cos(a) * 1.02 * (S.mass?.sx ?? 1), (S.mass?.dy ?? 0) + Math.sin(a) * 1.03 * (S.mass?.sy ?? 1));
    const L2 = (0.07 + 0.06 * t3Rnd(s0, i + 220)) * A, ox = Math.cos(a) * L2, oy = Math.sin(a) * L2, cv = (t3Rnd(s0, i + 240) - 0.5) * 2.4;
    flies.push(t3Quad([x0 - ox * 0.6, y0 - oy * 0.6], [x0 + ox * 0.3 - oy * 0.35 * cv, y0 + oy * 0.3 + ox * 0.35 * cv], [x0 + ox, y0 + oy], 8)); }
  if (S.ringlets && !back) for (let i = 0; i < S.ringlets; i++) { const a = Math.PI * (1.0 + 1.0 * t3Rnd(s0, i + 900)), M = S.mass.cloud, [x0, y0] = P(Math.cos(a) * M[0] * 1.06, M[2] + Math.sin(a) * M[1] * 1.06), q = [];
    for (let j = 0; j <= 16; j++) { const b = a + j * 0.55, r = 0.04 * A * (1 - j / 26); q.push([x0 + Math.cos(a) * j * 0.006 * A + Math.cos(b) * r, y0 + Math.sin(a) * j * 0.006 * Bh + Math.sin(b) * r]); } flies.push(q); }
  if (S.strandsFront && !back) { const Luv = t3HairlineUV(Object.assign({}, S, { fringe: null }), { shift, back, seed: s0 }); for (let i = 0; i < S.strandsFront; i++) {
      const u0 = -0.25 + i * 0.45 + shift, v0 = Luv.reduce((b, q) => (Math.abs(q[0] - u0) < Math.abs(b[0] - u0) ? q : b), Luv[0])[1];
      flies.push(t3Quad(P(u0 - 0.04, v0 - 0.08), P(u0 + 0.06 * (i ? 1 : -1), v0 + 0.06), P(u0 + 0.02 * (i ? 1 : -1), v0 + 0.16), 10)); } }
  if (S.curlsFront && !back) for (let i = 0; i < S.curlsFront; i++) { const u0 = -0.3 + i * 0.42 + shift, q = []; for (let j = 0; j <= 14; j++) { const a = -1.2 + j * 0.42, r = 0.07 * (1 - j / 20); q.push(P(u0 + Math.cos(a) * r, -0.2 + 0.04 * j / 14 + Math.sin(a) * r * 0.9)); } flies.push(q); }
  if (S.combover && !back) for (let i = 0; i < S.combover; i++) { const y = -0.78 + i * 0.09;
    flies.push(t3Quad(P(-0.62 + i * 0.1, y + 0.14), P(0.02, y - 0.1 - i * 0.03), P(0.58 - i * 0.12, y + 0.12), 12)); }
  // what goes behind the head (long hair / bob back / ponytail)
  let hb = null;
  if (S.behind) { const [bc, b] = t3Layer(Math.ceil(f.w * f.k), Math.ceil(f.h * f.k), 'hairB'); b.setTransform(f.k, 0, 0, f.k, 0, 0); b.fillStyle = t3Mul(col, 0.82);
    S.behind.forEach((sh) => { if (sh[0] === 'ell') { t3Path(b, t3Blob(...P(sh[1], sh[2]), sh[3] * A, sh[4] * Bh, 2.2, 2.4, 0, 64)); b.fill(); }
      else { t3Path(b, t3Spline(sh[1].map(([u, v]) => P(back ? u : u - dir * 0.08 * m, v)).concat([P(...sh[1][0])]), 6)); b.fill(); } });
    b.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 9; i++) { const u = -1.0 + i * 0.25; b.globalAlpha = 0.35; t3Stroke(b, t3Quad(P(u * 0.9, -0.2), P(u * 1.05, 0.8), P(u * 0.95, 1.8), 10), 0.022 * Bh, dark); }
    if (T3.hairDetail) { const ln = t3Lum(col) < 0.25 ? t3Mix(col, '#c8bce8', 0.45) : lite; for (let i = 0; i < 14; i++) { const u = -1.05 + i * 0.16 + 0.05 * t3Rnd(s0, i + 1500); b.globalAlpha = i % 2 ? 0.28 : 0.4; t3Stroke(b, t3Quad(P(u * 0.85, -0.1), P(u * 1.08 + 0.05 * Math.sin(i), 0.7), P(u * 0.98, 1.75), 12), (i % 3 ? 0.012 : 0.026) * Bh, i % 2 ? ln : dark); }
      b.globalAlpha = 0.3; b.filter = `blur(${Math.max(1, Math.round(0.05 * Bh * f.k))}px)`; t3Stroke(b, t3Quad(P(-1.0, 0.1), P(-1.12, 0.6), P(-1.0, 1.2), 10), 0.12 * Bh, ln); b.filter = 'none'; }
    b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; hb = bc; }
  return { hc, hb, flies, tie: S.tie && !back ? P(...S.tie) : null, pin: S.pin ? P(0, -1.12) : null, col };
}

// ---- faces (Ricks: eyes .26 W apart, brows ~.2 W above, a small mouth; v2: catchlights)
const T3_FACE = {
  neutral: { eye: 'dot', brow: [0, 0], mouth: 'smile0' },
  smile: { eye: 'dot', brow: [-1, -1], mouth: 'smile' },
  happy: { eye: 'happy', brow: [-2, -2], mouth: 'smile' },
  grin: { eye: 'happy', brow: [-2, -2], mouth: 'teeth' },
  laugh: { eye: 'happy', brow: [-3, -3], mouth: 'open' },
  talk: { eye: 'dot', brow: [-1, 0], mouth: 'talk' },
  talkO: { eye: 'dot', brow: [-2, -1], mouth: 'O' },
  smug: { eye: 'lid', brows: [[1, 1], [-3, -4.5]], mouth: 'smirk' },
  skeptical: { eye: 'lid', brows: [[2, 2.5], [-4, -5]], mouth: 'flat' },
  bored: { eye: 'lid', brow: [1, 1], mouth: 'flat' },
  deadpan: { eye: 'dash', brow: [0, 0.5], mouth: 'flat' },
  nervous: { eye: 'small', brow: [-3.5, 1], mouth: 'wave' },
  worried: { eye: 'dot', brow: [-4, 2], mouth: 'frown' },
  surprised: { eye: 'ring', brow: [-5, -4], mouth: 'O' },
  shock: { eye: 'ring', brow: [-6, -5], mouth: 'teeth' },
  excited: { eye: 'ring', brow: [-5, -4], mouth: 'open' },
  angry: { eye: 'dot', brow: [4, -2.5], mouth: 'frown' },
  strain: { eye: 'squint', brow: [4.5, -1.5], mouth: 'teeth' },   // v5: Ricks effort face (CENTURIES BY / ONE SACK)
  sad: { eye: 'dot', brow: [-3.5, 2], mouth: 'frown' },
  thinking: { eye: 'dot', brows: [[0, 0], [-3, -3]], mouth: 'flat', gaze: [0.6, -0.8] },
  determined: { eye: 'lid', brow: [3, -1], mouth: 'smirk' },
};
const T3_MOUTH = '#5a2228';
function t3BrowSpec(o) { const k = t3Seed(o.key), R = (i) => t3Rnd(k, i);
  return Object.assign({ len: 16 + 3.0 * R(31), wI: 5.4 + 0.8 * R(32), wO: 3.0 + 0.6 * R(33), arc: 0.9 + 1.0 * R(34), up: R(35) < 0.5 ? -1 : 1, asym: 0.2 + 0.4 * R(36), tilt: (R(37) - 0.5) * 0.8 }, o.brows || {}); }
// a catchlight (kept for set props such as the bank's cat poster; v5 faces have none)
function t3Catch(g, x, y, r, ls) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - ls * r * 0.9, y - r * 1.25, r, 0, TAU); g.fill(); g.globalAlpha = 0.85; g.beginPath(); g.arc(x + ls * r * 0.95, y + r * 1.1, r * 0.45, 0, TAU); g.fill(); g.globalAlpha = 1; g.fillStyle = T3.feat; }
function t3Shine(g, x, y, r, ls) { g.fillStyle = '#ffffff'; g.globalAlpha = 0.9; g.beginPath(); g.arc(x - ls * r * 0.9, y, r, 0, TAU); g.fill(); g.globalAlpha = 1; g.fillStyle = T3.feat; }
function t3Face(g, cx, cy, A, st, o, f) {
  const W = 2 * A, u = W / 100, F = T3_FACE[st.expr] || T3_FACE.neutral, m = f.m, dir = f.dir, gz = st.gaze || F.gaze || [0, 0];
  // v5: the face sits CENTRED on the head at front and 3/4 (no slide on turns); only a real profile (|f| > 1.3) moves it
  // v7 (2026-11-09, Ricks study: faces always read whole): in profile the face slides toward the facing side but keeps
  // BOTH eyes, both brows and the mouth (no one-eyed profile)
  const shift = dir * 24 * Math.max(0, Math.min(m, 2) - 1.0) * u, fx = cx + shift, ey = cy + 2.5 * u;
  let ek = F.eye; const lid = st.lid || 0;
  const sp = (ek === 'ring' ? 12 : 13) * u * (1 - 0.06 * Math.min(m, 1)) * (1 - 0.18 * Math.max(0, m - 1.0)), gx = gz[0] * 1.6 * u, gy = gz[1] * 1.3 * u, ls = Math.cos(st.light) > 0.1 ? 1 : -1;
  if (lid >= 1 && ek !== 'happy') ek = 'closed'; else if (lid > 0 && ek !== 'happy') ek = ek === 'lid' ? 'slit' : 'lid';
  g.fillStyle = T3.feat;
  for (const s of [-1, 1]) {
    const far = s === -dir && m > 0.15, sc = far ? 1 - 0.07 * Math.min(m, 1) : 1;
    const x = fx + s * sp, ex = x + gx, ew = 2.3 * u;
    g.save(); g.translate(x, ey); g.scale(sc, 1); g.translate(-x, -ey);
    switch (ek) {
      // v5 (4 Ricks shorts): black ovals, a bit smaller; ONE small catchlight only (the user's rule 'a little shine'; the shorts show none)
      case 'dot': g.beginPath(); g.ellipse(ex, ey + gy, 3.5 * u, 5.2 * u, 0, 0, TAU); g.fill(); t3Shine(g, ex, ey + gy - 1.6 * u, 0.95 * u, ls); break;
      case 'small': g.beginPath(); g.ellipse(ex, ey + gy, 2.5 * u, 3.6 * u, 0, 0, TAU); g.fill(); break;
      case 'lid': g.beginPath(); g.ellipse(x + gx * 0.6, ey, 4.4 * u, 4.6 * u, 0, 0, Math.PI); g.fill(); t3Stroke(g, [[x - 5.9 * u, ey], [x + 5.9 * u, ey]], 2.8 * u, T3.feat); break;
      case 'slit': g.beginPath(); g.ellipse(x + gx * 0.5, ey + 1.5 * u, 4.6 * u, 2.4 * u, 0, 0, Math.PI); g.fill(); t3Stroke(g, [[x - 5.7 * u, ey + 1.5 * u], [x + 5.7 * u, ey + 1.5 * u]], ew, T3.feat); break;
      case 'dash': t3Stroke(g, [[x - 5 * u, ey + 1 * u], [x + 5 * u, ey + 0.6 * u]], 3.2 * u, T3.feat); break;
      case 'closed': t3Stroke(g, t3Quad([x - 5 * u, ey + 0.5 * u], [x, ey + 2.6 * u], [x + 5 * u, ey + 0.5 * u]), ew, T3.feat); break;
      case 'squint': t3Stroke(g, [[x + s * 5 * u, ey - 3.6 * u], [x - s * 4.6 * u, ey + 0.2 * u], [x + s * 5 * u, ey + 3.4 * u]], 2.8 * u, T3.feat); break;   // Ricks effort: > <
      case 'happy': t3Stroke(g, t3Quad([x - 5.2 * u, ey + 2.4 * u], [x, ey - 2.6 * u], [x + 5.2 * u, ey + 2.4 * u]), 2.6 * u, T3.feat); break;
      case 'ring': g.beginPath(); g.arc(x, ey, 9.2 * u, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 2.7 * u; g.strokeStyle = T3.feat; g.stroke();   // Ricks: big white rings, a solid pupil, no shine
        { const px = x + Math.max(-4 * u, Math.min(4 * u, gx * 1.4)), py = ey + Math.max(-3.5 * u, Math.min(3.5 * u, gy)); g.fillStyle = T3.feat; g.beginPath(); g.arc(px, py, 3.4 * u, 0, TAU); g.fill(); t3Shine(g, px, py - 1.1 * u, 0.85 * u, ls); } break;
    }
    g.fillStyle = T3.feat;
    const [dI, dO] = F.brows ? F.brows[s < 0 ? 0 : 1] : F.brow, BS = t3BrowSpec(o), by = ey - (ek === 'ring' ? 19.5 : 15.5) * u - (st.browUp || 0) * u * (s === BS.up ? 1.25 : 1) + (s === BS.up ? -BS.asym * u : 0);
    { const a = [x - s * BS.len * 0.4 * u, by + (dI + BS.tilt) * u], b = [x + s * BS.len * 0.6 * u, by + (dO - BS.tilt * 0.5) * u], mm = [(a[0] + b[0]) / 2 - s * 0.6 * u, (a[1] + b[1]) / 2 - BS.arc * u];
      t3TaperPath(g, t3Quad(a, mm, b, 10), BS.wI * u, BS.wO * u, T3.feat); }
    g.restore();
  }
  const mx = fx + dir * Math.max(0, m - 1.0) * 3 * u, my = cy + 18 * u, mw = 2.6 * u;   // v5: centred, a little closer to the eyes
  let mouth = F.mouth;
  if (st.talkOn) mouth = st.talk === 4 ? 'O' : st.talk >= 3 ? (F.mouth === 'teeth' || F.mouth === 'open' ? 'open' : 'talkW') : st.talk >= 2 ? 'talk' : st.talk >= 1 ? 'talkS' : (F.mouth === 'smile' || F.mouth === 'smile0' ? 'smile0' : 'flat');
  if (o.moustache) t3Moustache(g, mx, my, u, o, st, dir, m);
  switch (mouth) {
    case 'smile0': t3Stroke(g, t3Quad([mx - 4.6 * u, my - 0.2 * u], [mx, my + 2.2 * u], [mx + 4.8 * u, my - 0.9 * u]), mw, T3.feat); break;
    case 'smile': t3Stroke(g, t3Quad([mx - 5.6 * u, my - 0.8 * u], [mx + 0.4 * u, my + 3.2 * u], [mx + 6.2 * u, my - 2.2 * u]), mw, T3.feat); break;
    case 'flat': t3Stroke(g, [[mx - 4.4 * u, my + 0.6 * u], [mx + 4.2 * u, my - 0.3 * u]], mw, T3.feat); break;
    case 'smirk': t3Stroke(g, t3Quad([mx - 4.2 * u, my + 0.6 * u], [mx + 1.4 * u, my + 1.8 * u], [mx + 6 * u, my - 2.6 * u]), mw, T3.feat); break;
    case 'frown': t3Stroke(g, t3Quad([mx - 4 * u, my + 1.6 * u], [mx, my - 1.4 * u], [mx + 4 * u, my + 1.6 * u]), mw, T3.feat); break;
    case 'wave': { const q = []; for (let i = 0; i <= 10; i++) q.push([mx - 5 * u + i * u, my + 1.1 * u * Math.sin(i * 1.4)]); t3Stroke(g, q, 2 * u, T3.feat); break; }
    case 'O': g.beginPath(); g.ellipse(mx, my + 1 * u, 3.2 * u, 4.2 * u, 0, 0, TAU); g.fillStyle = T3_MOUTH; g.fill(); g.lineWidth = 1.9 * u; g.strokeStyle = T3.feat; g.stroke(); break;
    case 'talkS': case 'talk': case 'talkW': case 'open': {
      const k = { talkS: [3.6, 2.4], talk: [5, 4.4], talkW: [5.6, 6.4], open: [8.5, 8] }[mouth], rx = k[0] * u, ry = k[1] * u, y0 = my - 1.4 * u;
      g.beginPath(); g.moveTo(mx - rx, y0); g.lineTo(mx + rx, y0); g.ellipse(mx, y0, rx, ry, 0, 0, Math.PI); g.closePath(); g.fillStyle = T3_MOUTH; g.fill();
      g.save(); g.clip(); g.fillStyle = '#e8737a'; g.beginPath(); g.ellipse(mx + rx * 0.15, y0 + ry * 0.98, rx * 0.55, ry * 0.42, 0, 0, TAU); g.fill();
      if (mouth !== 'talkS') { g.fillStyle = '#ffffff'; g.fillRect(mx - rx, y0, 2 * rx, ry * 0.26); } g.restore();
      g.beginPath(); g.moveTo(mx - rx, y0); g.lineTo(mx + rx, y0); g.ellipse(mx, y0, rx, ry, 0, 0, Math.PI); g.closePath(); g.lineWidth = 1.9 * u; g.strokeStyle = T3.feat; g.stroke(); break; }
    case 'teeth': { const w = 8.6 * u, h = 4.6 * u, y0 = my + 0.8 * u, k0 = t3Seed(o.key);   // Ricks grin: a smiling box, 3-4 uneven teeth per row
      const box = t3Spline([[mx - w, y0 - h * 0.9], [mx, y0 - h * 1.05], [mx + w, y0 - h * 0.95], [mx + w * 1.02, y0 + h * 0.2], [mx + w * 0.7, y0 + h * 1.0], [mx, y0 + h * 1.2], [mx - w * 0.72, y0 + h * 0.95], [mx - w * 1.02, y0 + h * 0.1], [mx - w, y0 - h * 0.9]], 5);
      t3Path(g, box); g.fillStyle = '#ffffff'; g.fill(); g.save(); g.clip(); const n = 3 + (k0 % 2);
      for (let i = 1; i < n + 1; i++) { const xk = mx - w + (2 * w) * (i + (t3Rnd(k0, i + 50) - 0.5) * 0.25) / (n + 1); t3Stroke(g, [[xk + 0.3 * u, y0 - h * 1.1], [xk - 0.2 * u, y0 + h * 1.2]], 1.25 * u, T3.feat); }
      t3Stroke(g, t3Quad([mx - w, y0 + 0.1 * h], [mx, y0 + 0.35 * h], [mx + w, y0 + 0.05 * h], 8), 1.25 * u, T3.feat); g.restore();
      t3Path(g, box); g.lineWidth = 1.8 * u; g.strokeStyle = T3.feat; g.stroke(); break; }
  }
  if (o.glasses) { g.lineWidth = 1.9 * u; g.strokeStyle = T3.feat;
    for (const s of [-1, 1]) { const far = s === -dir && m > 0.15; const x = fx + s * sp; g.save(); g.translate(x, ey); g.scale(far ? 1 - 0.2 * Math.min(m, 1) : 1, 1);
      g.beginPath(); g.arc(0, 0, 7.6 * u, 0, TAU); g.stroke(); g.restore(); g.strokeStyle = T3.feat; g.lineWidth = 1.9 * u; }
    t3Stroke(g, t3Quad([fx - sp + 7.6 * u, ey - 1 * u], [fx, ey - 3 * u], [fx + sp - 7.6 * u, ey - 1 * u]), 1.9 * u, T3.feat);
  }
}
// moustache: a soft brush shape in a darkened hair colour, shaded, no hard outline — it belongs to the face
function t3Moustache(g, mx, my, u, o, st, dir, m) {
  const col = t3Mul(t3HairCol(o), t3Lum(t3HairCol(o)) > 0.5 ? 0.62 : 0.8), y = my - 5.6 * u, w = 1 - 0.25 * Math.min(m, 1);
  g.save(); g.translate(mx, y); g.scale(w, 1);
  for (const s of [-1, 1]) { const far = s === -dir && m > 0.15, k = far ? 0.8 : 1;
    const q = t3Spline([[s * 0.4 * u, -2.2 * u], [s * 4.5 * u * k, -3.4 * u], [s * 9 * u * k, -1.6 * u], [s * 11.2 * u * k, 2.6 * u], [s * 9.6 * u * k, 1.4 * u], [s * 5.5 * u * k, 1.2 * u], [s * 1 * u, 0.6 * u], [s * 0.4 * u, -2.2 * u]], 5);
    t3Path(g, q); g.fillStyle = col; g.fill(); g.save(); g.clip();
    const gr = g.createLinearGradient(0, -3.5 * u, 0, 2.6 * u); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(30,10,20,0.35)');
    g.fillStyle = gr; g.fillRect(-14 * u, -5 * u, 28 * u, 9 * u);
    for (let i = 0; i < 4; i++) t3Stroke(g, [[s * (2 + i * 2.2) * u, -2.6 * u + i * 0.3 * u], [s * (2.8 + i * 2.4) * u, 1 * u]], 0.6 * u, 'rgba(20,8,14,0.35)');
    g.restore(); t3Stroke(g, q.slice(Math.floor(q.length * 0.45)), 1.1 * u, T3.ink); }
  g.restore();
}
function t3Fx(g, cx, cy, A, Bh, fx, dir) {
  const u = 2 * A / 100;
  if (fx === 'sweat') { const x = cx - dir * 0.72 * A, y = cy - 0.42 * Bh; g.beginPath(); g.moveTo(x, y - 7 * u); g.bezierCurveTo(x + 5 * u, y, x + 5 * u, y + 6 * u, x, y + 6 * u); g.bezierCurveTo(x - 5 * u, y + 6 * u, x - 5 * u, y, x, y - 7 * u);
    g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.6 * u; g.strokeStyle = T3.ink; g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x - 1.6 * u, y + 2 * u, 1.2 * u, 2 * u, 0.3, 0, TAU); g.fill(); }
  if (fx === 'blush') { g.globalAlpha = 0.28; g.fillStyle = '#ff7f8a'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 22 * u + dir * 6 * u, cy + 15 * u, 6 * u, 3 * u, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; }
  if (fx === 'sparkle') { const x = cx + dir * 0.9 * A, y = cy - 0.9 * Bh; g.fillStyle = '#fff6c8'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 2 * u : 8 * u, a = i * Math.PI / 4; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); g.lineWidth = 1.2 * u; g.strokeStyle = T3.ink; g.stroke(); }
}
// the whole head, pre-drawn: hair behind, skin + lumpy contour + room-tinted crescent, hair shadow, face, ink, hair (+ ink)
const T3_HEADBOX = { w: 420, h: 440, cx: 210, cy: 230 };
function t3HeadCanvas(p, st, f) {
  const o = p.o, A = T3.a * (o.headK ?? 1), H = p.head, Bh = A * H.hw, back = f.back;
  const key = [st.expr, st.lid, st.talk, st.talkOn ? 1 : 0, st.browUp || 0, (st.gaze || []).map((v) => t3Q(v, 0.25)).join(','), back ? 'B' : t3Q(f.f, 0.1), t3Q(st.light, 0.12), st.env, st.fx || ''].join('|');
  return t3Part(p, 'head', key, T3_HEADBOX.w, T3_HEADBOX.h, (g) => {
    const cx = T3_HEADBOX.cx, cy = T3_HEADBOX.cy, light = st.light, thick = Math.atan2(-Math.sin(light) + 0.9, -Math.cos(light)), u = 2 * A / 100, ow = 3.6 * u;   // v5: Ricks ink ~3.5 % W (real Ricks clips; the Creatorize clones go to 2.5 %), near uniform
    const ff = Object.assign({}, f, { w: T3_HEADBOX.w, h: T3_HEADBOX.h, k: p.k });
    const hp = t3HeadPath(H, cx, cy, A, Bh, back ? 0 : f.f, 160), skin = T3_SKIN[o.skin] || o.skin || T3_SKIN.white;
    const hair = o.hair && o.hair !== 'none' ? t3HairLayers(o, ff, cx, cy, A, Bh, light, st.env, hp) : null;
    if (hair && hair.hb) { const ink = t3Silhouette(hair.hb, 'inkB'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); t3Outlined(g, hair.hb, ink, 0.5 * ow * p.k, thick); g.restore(); }
    t3Path(g, hp); g.fillStyle = skin; g.fill();
    const far = t3Mix(t3Mix('#bfa9b4', skin, 0.25), st.env, 0.5), mid = t3Mix('#efe0de', st.env, 0.15);
    t3Volume(g, hp, cx, cy, A, Bh, light, { flat: 0.4, shift: 0.5, reach: 1.36, far: t3Mul(t3Mix(far, '#9c8aa4', 0.15), 0.8), mid: t3Mix(mid, '#e6d2d4', 0.4), rim: t3Mix('#f0e6e8', st.env, 0.15), ring0: 0.86, glow: 0.22 });
    { g.save(); t3Path(g, hp); g.clip(); const gr = g.createLinearGradient(0, cy + Bh * 0.55, 0, cy + Bh * 1.02); gr.addColorStop(0, 'rgba(255,170,110,0)'); gr.addColorStop(1, 'rgba(255,170,110,0.22)');
      g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(cx - 2 * A, cy, 4 * A, 2 * Bh); g.restore(); }   // warm bounce from below
    if (o.stubble && !back) { g.save(); t3Path(g, hp); g.clip(); g.fillStyle = 'rgba(60,40,50,0.38)'; const s0 = t3Seed(o.key);
      for (let i = 0; i < 90; i++) { const a = 0.3 + 2.55 * t3Rnd(s0, i + 300), r = 0.66 + 0.3 * t3Rnd(s0, i + 400), x = cx + Math.cos(a) * A * r + f.dir * Math.max(0, f.m - 1.3) * 18 * u, y = cy + Math.sin(a) * Bh * r;
        if (y > cy + 0.3 * Bh) { g.beginPath(); g.arc(x, y, 0.55 * u, 0, TAU); g.fill(); } } g.restore(); }
    const ink = hair && t3Silhouette(hair.hc);
    if (ink) { g.save(); t3Path(g, hp); g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${Math.max(1, Math.round(0.05 * Bh * p.k))}px)`; g.globalAlpha = 0.24;
      g.drawImage(ink, -Math.cos(light) * 0.05 * A * p.k, (0.07 - Math.sin(light) * 0.03) * Bh * p.k); g.restore(); }   // the hair's soft shadow on the forehead
    if (!back) t3Face(g, cx, cy, A, st, o, f);
    t3InkRing(g, hp, ow, thick, 0.3);
    if (hair) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); t3Outlined(g, hair.hc, ink, 0.55 * ow * p.k, thick, 0.3); g.restore();
      hair.flies.forEach((q) => t3TaperPath(g, q, 1.6 * u, 0.6 * u, T3.ink));
      if (hair.tie) { g.beginPath(); g.ellipse(hair.tie[0], hair.tie[1], 7 * u, 5 * u, 0.6, 0, TAU); g.fillStyle = o.colors?.tie || '#d84a6a'; g.fill(); g.lineWidth = 2 * u; g.strokeStyle = T3.ink; g.stroke(); }
      if (hair.pin) { t3Stroke(g, [[hair.pin[0] - 0.55 * A, hair.pin[1] + 2 * u], [hair.pin[0] + 0.55 * A, hair.pin[1] - 3 * u]], 2.6 * u, '#e2b23a'); g.beginPath(); g.arc(hair.pin[0] - 0.58 * A, hair.pin[1] + 2.3 * u, 3.4 * u, 0, TAU); g.fillStyle = '#3aa88a'; g.fill(); g.lineWidth = 1.4 * u; g.strokeStyle = T3.ink; g.stroke(); } }
    if (st.fx && !back) t3Fx(g, cx, cy, A, Bh, st.fx, f.dir);
  });
}

// ---- clothes, drawn flat inside the torso (the volume pass shades them all together). Ricks: ~5 details per torso.
const T3_OUTFIT = {
  suit: { main: '#2b3a66', shirt: '#f5f2ec', tie: '#cc3434' },
  guard: { main: '#8ea5bd', tie: '#273042', badge: '#e6b93a', belt: '#24201f' },
  apron: { main: '#f2a0b4', apron: '#c9692c', collar: '#ffffff' },
  hivis: { main: '#7d838c', vest: '#ff8a1c', band: '#dde2e8' },
  sweater: { main: '#3f7d55', rib: '#326546' },
  polo: { main: '#d8473c', collar: '#c23a30' },
  shirt: { main: '#9cc4e4', tie: '#2a3a6a', pocket: true },
  hoodie: { main: '#7a5ab8', cord: '#f2efe8' },
  vest: { main: '#5a3a2a', shirt: '#f2ece0', tie: '#a8323a' },
  dress: { main: '#e2574c', belt: '#3a2a2a' },
  robe: { main: '#2e5aa8', trim: '#e2b23a', sash: '#e2b23a' },
};
function t3Clothes(g, kind, C, x0, top, bot, tw, o, back) {
  const h = bot - top, R = (pts, fill, w = 2.2) => { t3Path(g, pts); g.fillStyle = fill; g.fill(); if (w) { g.lineWidth = w; g.strokeStyle = T3.ink; g.stroke(); } };
  const dot = (x, y, r, c) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = c; g.fill(); };
  const seam = (P, a = 0.5, w = 1.6) => { g.save(); g.globalAlpha = a; t3Stroke(g, P, w, t3Mul(C.main, 0.55)); g.restore(); };
  g.fillStyle = C.main; g.fillRect(x0 - tw * 2, top - 20, tw * 4, h + 40);
  // fabric: a faint weave so big torsos never read as plastic
  { const s0 = t3Seed(kind); g.save(); g.globalAlpha = 0.025; g.strokeStyle = t3Lum(C.main) > 0.5 ? '#000000' : '#ffffff'; g.lineWidth = 1;
    for (let i = 0; i < 28; i++) { const y = top + (i / 28) * h + t3Rnd(s0, i) * 3; g.beginPath(); g.moveTo(x0 - tw * 1.2, y); g.lineTo(x0 + tw * 1.2, y + 2); g.stroke(); } g.restore(); }
  if (back) {   // seen from behind: collar, a centre seam, the belt
    g.beginPath(); g.ellipse(x0, top + 2, 0.36 * tw, 0.06 * h, 0, 0, Math.PI); g.fillStyle = t3Mul(C.main, 0.8); g.fill();
    seam([[x0, top + 0.1 * h], [x0, bot + 10]], 0.45); if (kind === 'suit') seam([[x0, bot - 0.2 * h], [x0, bot + 10]], 0.8, 2.2);
    if (C.belt) { g.fillStyle = C.belt; g.fillRect(x0 - 2 * tw, top + 0.8 * h, 4 * tw, 0.09 * h); }
    if (kind === 'hivis') { g.fillStyle = C.vest; g.fillRect(x0 - 2 * tw, top - 6, 4 * tw, h + 20); g.fillStyle = C.band; for (const y of [0.4, 0.62]) g.fillRect(x0 - 2 * tw, top + y * h, 4 * tw, 0.075 * h); }
  } else if (kind === 'suit') {
    R([[x0 - 0.46 * tw, top - 6], [x0 + 0.46 * tw, top - 6], [x0, top + 0.5 * h]], C.shirt, 0);
    R([[x0 - 0.42 * tw, top - 4], [x0 - 0.1 * tw, top + 0.1 * h], [x0 - 0.3 * tw, top + 0.13 * h]], C.shirt, 1.6); R([[x0 + 0.42 * tw, top - 4], [x0 + 0.1 * tw, top + 0.1 * h], [x0 + 0.3 * tw, top + 0.13 * h]], C.shirt, 1.6);
    R([[x0 - 0.1 * tw, top + 0.03 * h], [x0 + 0.1 * tw, top + 0.03 * h], [x0 + 0.07 * tw, top + 0.12 * h], [x0 - 0.07 * tw, top + 0.12 * h]], C.tie, 1.6);
    R([[x0 - 0.07 * tw, top + 0.12 * h], [x0 + 0.07 * tw, top + 0.12 * h], [x0 + 0.13 * tw, top + 0.42 * h], [x0, top + 0.5 * h], [x0 - 0.13 * tw, top + 0.42 * h]], C.tie, 1.6);
    g.save(); g.globalAlpha = 0.35; for (let i = 0; i < 4; i++) t3Stroke(g, [[x0 - 0.1 * tw, top + (0.17 + i * 0.07) * h], [x0 + 0.12 * tw, top + (0.13 + i * 0.07) * h]], 2, t3Mul(C.tie, 0.6)); g.restore();   // tie stripes
    for (const s of [-1, 1]) { R([[x0 + s * 0.46 * tw, top - 6], [x0 + s * 0.66 * tw, top - 4], [x0 + s * 0.52 * tw, top + 0.18 * h], [x0 + s * 0.6 * tw, top + 0.24 * h], [x0 + s * 0.04 * tw, top + 0.52 * h], [x0 + s * 0.14 * tw, top + 0.3 * h]], t3Mul(C.main, 1.12), 1.6); }   // lapels
    t3Stroke(g, [[x0, top + 0.52 * h], [x0, bot + 10]], 1.8, t3Mul(C.main, 0.6));
    dot(x0 + 0.08 * tw, top + 0.64 * h, 2.8, t3Mul(C.main, 0.45)); dot(x0 + 0.08 * tw, top + 0.8 * h, 2.8, t3Mul(C.main, 0.45));
    R([[x0 + 0.36 * tw, top + 0.33 * h], [x0 + 0.7 * tw, top + 0.31 * h], [x0 + 0.66 * tw, top + 0.36 * h], [x0 + 0.37 * tw, top + 0.37 * h]], t3Mul(C.main, 0.8), 1.2);   // breast pocket
    R([[x0 + 0.44 * tw, top + 0.33 * h], [x0 + 0.5 * tw, top + 0.27 * h], [x0 + 0.58 * tw, top + 0.32 * h]], '#f5f2ec', 1.2);   // pocket square
    for (const s of [-1, 1]) seam([[x0 + s * 0.3 * tw, top + 0.84 * h], [x0 + s * 0.72 * tw, top + 0.83 * h]], 0.6, 2);   // hip pocket flaps
  } else if (kind === 'guard') {
    t3Stroke(g, [[x0, top + 0.06 * h], [x0, bot + 10]], 1.8, t3Mul(C.main, 0.7));
    for (let i = 0; i < 4; i++) dot(x0 + 3, top + (0.32 + i * 0.15) * h, 2.4, t3Mul(C.main, 0.5));
    R([[x0 - 0.36 * tw, top - 6], [x0, top + 0.12 * h], [x0 + 0.36 * tw, top - 6]], t3Mix(C.main, '#ffffff', 0.25), 1.6);
    R([[x0 - 0.06 * tw, top + 0.08 * h], [x0 + 0.06 * tw, top + 0.08 * h], [x0 + 0.09 * tw, top + 0.5 * h], [x0, top + 0.56 * h], [x0 - 0.09 * tw, top + 0.5 * h]], C.tie, 1.4);
    for (const s of [-1, 1]) { R([[x0 + s * 0.2 * tw, top + 0.3 * h], [x0 + s * 0.62 * tw, top + 0.3 * h], [x0 + s * 0.62 * tw, top + 0.45 * h], [x0 + s * 0.41 * tw, top + 0.48 * h], [x0 + s * 0.2 * tw, top + 0.45 * h]], t3Mul(C.main, 0.92), 1.4);
      R([[x0 + s * 0.2 * tw, top + 0.3 * h], [x0 + s * 0.62 * tw, top + 0.3 * h], [x0 + s * 0.62 * tw, top + 0.36 * h], [x0 + s * 0.41 * tw, top + 0.39 * h], [x0 + s * 0.2 * tw, top + 0.36 * h]], t3Mul(C.main, 0.84), 1.2);
      dot(x0 + s * 0.41 * tw, top + 0.35 * h, 1.8, t3Mul(C.main, 0.5));
      R([[x0 + s * 0.6 * tw, top - 4], [x0 + s * 1.2 * tw, top + 0.05 * h], [x0 + s * 1.2 * tw, top + 0.13 * h], [x0 + s * 0.6 * tw, top + 0.09 * h]], t3Mul(C.main, 0.6), 1.4); }
    const bx = x0 - 0.42 * tw, by = top + 0.22 * h; R([[bx - 7, by - 6], [bx + 7, by - 6], [bx + 7, by + 3], [bx, by + 10], [bx - 7, by + 3]], C.badge, 1.6); dot(bx, by - 1, 2, t3Mul(C.badge, 0.7));
    R([[x0 - 2 * tw, top + 0.8 * h], [x0 + 2 * tw, top + 0.8 * h], [x0 + 2 * tw, top + 0.89 * h], [x0 - 2 * tw, top + 0.89 * h]], C.belt, 0);
    R([[x0 - 9, top + 0.79 * h], [x0 + 9, top + 0.79 * h], [x0 + 9, top + 0.9 * h], [x0 - 9, top + 0.9 * h]], C.badge, 1.6);
  } else if (kind === 'apron') {
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x0 + s * 0.17 * tw, top + 0.02 * h, 0.2 * tw, 0.08 * h, s * 0.25, 0, TAU); g.fillStyle = C.collar; g.fill(); g.lineWidth = 1.6; g.strokeStyle = T3.ink; g.stroke(); }
    for (const s of [-1, 1]) t3Stroke(g, [[x0 + s * 0.42 * tw, top + 0.3 * h], [x0 + s * 0.62 * tw, top - 6]], 5, t3Mul(C.apron, 0.85));
    R([[x0 - 0.44 * tw, top + 0.3 * h], [x0 + 0.44 * tw, top + 0.3 * h], [x0 + 0.5 * tw, top + 0.6 * h], [x0 + 1.1 * tw, bot + 10], [x0 - 1.1 * tw, bot + 10], [x0 - 0.5 * tw, top + 0.6 * h]], C.apron, 2);
    R([[x0 - 0.26 * tw, top + 0.68 * h], [x0 + 0.26 * tw, top + 0.68 * h], [x0 + 0.24 * tw, top + 0.86 * h], [x0 - 0.24 * tw, top + 0.86 * h]], t3Mul(C.apron, 0.9), 1.6);
    t3Stroke(g, [[x0 - 0.5 * tw, top + 0.6 * h], [x0 + 0.5 * tw, top + 0.6 * h]], 2, t3Mul(C.apron, 0.6));
  } else if (kind === 'hivis') {
    g.beginPath(); g.ellipse(x0, top - 2, 0.3 * tw, 0.07 * h, 0, 0, Math.PI); g.lineWidth = 3; g.strokeStyle = t3Mul(C.main, 0.6); g.stroke();
    for (const s of [-1, 1]) { const pan = [[x0 + s * 0.42 * tw, top - 6], [x0 + s * 2 * tw, top - 6], [x0 + s * 2 * tw, bot + 10], [x0 + s * 0.1 * tw, bot + 10], [x0 + s * 0.1 * tw, top + 0.32 * h]];
      R(pan, C.vest, 2.2); g.save(); t3Path(g, pan); g.clip();
      for (const y of [0.56, 0.78]) { g.fillStyle = C.band; g.fillRect(x0 - 2 * tw, top + y * h, 4 * tw, 0.075 * h); }
      g.fillRect(x0 + s * 0.34 * tw - 5, top - 6, 10, 0.56 * h); g.restore(); }
    R([[x0 - 0.62 * tw, top + 0.3 * h], [x0 - 0.36 * tw, top + 0.3 * h], [x0 - 0.36 * tw, top + 0.44 * h], [x0 - 0.62 * tw, top + 0.44 * h]], t3Mul(C.vest, 0.85), 1.2);
  } else if (kind === 'sweater') {
    g.fillStyle = C.rib; g.fillRect(x0 - 2 * tw, bot - 0.1 * h, 4 * tw, 0.2 * h);
    g.beginPath(); g.ellipse(x0, top, 0.45 * tw, 0.11 * h, 0, 0, TAU); g.fillStyle = C.rib; g.fill(); g.lineWidth = 1.6; g.strokeStyle = T3.ink; g.stroke();
    R([[x0 - 0.2 * tw, top + 0.02 * h], [x0, top + 0.1 * h], [x0 + 0.2 * tw, top + 0.02 * h]], '#f2efe8', 1.2);   // shirt collar peeking
    for (let i = -6; i <= 6; i++) t3Stroke(g, [[x0 + i * 0.16 * tw, bot - 0.1 * h], [x0 + i * 0.16 * tw, bot + 4]], 1.4, t3Mul(C.rib, 0.7));
  } else if (kind === 'polo') {
    for (const s of [-1, 1]) R([[x0, top + 0.02 * h], [x0 + s * 0.42 * tw, top - 6], [x0 + s * 0.38 * tw, top + 0.12 * h]], C.collar, 1.6);
    t3Stroke(g, [[x0, top + 0.02 * h], [x0, top + 0.26 * h]], 1.8, t3Mul(C.main, 0.6)); dot(x0 + 3, top + 0.12 * h, 2.2, '#f2efe8'); dot(x0 + 3, top + 0.22 * h, 2.2, '#f2efe8');
  } else if (kind === 'shirt' || kind === 'vest') {
    for (const s of [-1, 1]) R([[x0, top + 0.04 * h], [x0 + s * 0.44 * tw, top - 6], [x0 + s * 0.4 * tw, top + 0.1 * h]], kind === 'vest' ? C.shirt : t3Mix(C.main, '#ffffff', 0.35), 1.6);
    if (kind === 'vest') { R([[x0 - 0.5 * tw, top + 0.06 * h], [x0, top + 0.5 * h], [x0 + 0.5 * tw, top + 0.06 * h], [x0 + 0.3 * tw, top - 6], [x0 - 0.3 * tw, top - 6]], C.shirt, 0); }
    R([[x0 - 0.07 * tw, top + 0.06 * h], [x0 + 0.07 * tw, top + 0.06 * h], [x0 + 0.11 * tw, top + 0.46 * h], [x0, top + 0.52 * h], [x0 - 0.11 * tw, top + 0.46 * h]], C.tie, 1.4);
    t3Stroke(g, [[x0 + (kind === 'vest' ? 0 : 0.18 * tw), top + 0.12 * h], [x0 + (kind === 'vest' ? 0 : 0.18 * tw), bot + 10]], 1.6, t3Mul(C.main, 0.6));
    for (let i = 0; i < 4; i++) dot(x0 + (kind === 'vest' ? 6 : 0.24 * tw), top + (0.55 + i * 0.12) * h, 2.2, kind === 'vest' ? '#e2b23a' : '#f4f2ee');
    if (C.pocket) { R([[x0 - 0.66 * tw, top + 0.28 * h], [x0 - 0.34 * tw, top + 0.28 * h], [x0 - 0.34 * tw, top + 0.44 * h], [x0 - 0.5 * tw, top + 0.47 * h], [x0 - 0.66 * tw, top + 0.44 * h]], t3Mul(C.main, 0.94), 1.2);
 }
  } else if (kind === 'hoodie') {
    g.beginPath(); g.ellipse(x0, top + 0.02 * h, 0.62 * tw, 0.14 * h, 0, 0, TAU); g.fillStyle = t3Mul(C.main, 0.82); g.fill(); g.lineWidth = 1.8; g.strokeStyle = T3.ink; g.stroke();
    for (const s of [-1, 1]) t3Stroke(g, [[x0 + s * 0.14 * tw, top + 0.12 * h], [x0 + s * 0.16 * tw, top + 0.36 * h]], 2.4, C.cord);
    R([[x0 - 0.55 * tw, top + 0.6 * h], [x0 + 0.55 * tw, top + 0.6 * h], [x0 + 0.7 * tw, top + 0.86 * h], [x0 - 0.7 * tw, top + 0.86 * h]], t3Mul(C.main, 0.9), 1.6);
    g.fillStyle = t3Mul(C.main, 0.8); g.fillRect(x0 - 2 * tw, bot - 0.08 * h, 4 * tw, 0.2 * h);
  } else if (kind === 'dress') {
    for (const s of [-1, 1]) R([[x0, top + 0.1 * h], [x0 + s * 0.36 * tw, top - 6], [x0 + s * 0.12 * tw, top - 6]], '#ffffff', 1.4);
    g.fillStyle = C.belt; g.fillRect(x0 - 2 * tw, top + 0.5 * h, 4 * tw, 0.06 * h);
    for (let i = 0; i < 16; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2) dot(x0 - tw * 1.1 + i * tw * 0.15, top + 0.12 * h + j * 0.1 * h, 1.6, 'rgba(255,255,255,0.28)');
  } else if (kind === 'robe') {
    R([[x0 - 0.5 * tw, top - 6], [x0 + 0.1 * tw, top + 0.6 * h], [x0 + 0.5 * tw, top - 6]], t3Mul(C.main, 1.15), 1.4);
    t3Stroke(g, [[x0 - 0.5 * tw, top - 6], [x0 + 0.1 * tw, top + 0.6 * h]], 5, C.trim); t3Stroke(g, [[x0 + 0.5 * tw, top - 6], [x0 + 0.05 * tw, top + 0.32 * h]], 5, '#ffffff');
    g.fillStyle = C.sash; g.fillRect(x0 - 2 * tw, top + 0.62 * h, 4 * tw, 0.08 * h);
  }
  // v5: no lanyards / name badges / camera straps / pens — Ricks never draws them (the user saw them as stray marks)
}
// torso, pre-drawn: bean, clothes, room-tinted volume with a rim, thick-thin ink
function t3TorsoShape(o, f, cx, top, Th, tw) {
  const m = f.m, w = tw * (1 - 0.12 * Math.min(1, m)) * (1 - 0.1 * Math.max(0, m - 1)), Bd = T3_BODY[o.body] || T3_BODY.avg;
  const tp = t3Blob(cx, top + Th / 2, w, Th / 2, Bd.nTop, Bd.nBot, Bd.egg, 96, (t, X, Y) => 1 + (0.02 + Bd.belly * 1.4) * f.dir * Math.min(1, m) * X * (Y > 0 ? 1 : 0.3) + Bd.belly * 0.5 * Math.max(0, Y - 0.1) * (1 - Math.min(1, m)));
  return { tp, w };
}
function t3EdgesAt(P, y) { let lo = Infinity, hi = -Infinity; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) { const x = a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); lo = Math.min(lo, x); hi = Math.max(hi, x); } } return [lo, hi]; }
function t3TorsoCanvas(p, st, f, tw, Th) {
  const o = p.o, key = [f.back ? 'B' : t3Q(f.f, 0.25), t3Q(st.light, 0.12), st.env].join('|'), bw = tw * 2 + 40, bh = Th + 40;
  const c = t3Part(p, 'torso', key, bw, bh, (g) => {
    const cx = bw / 2, top = 20, m = f.m, { tp, w } = t3TorsoShape(o, f, cx, top, Th, tw);
    const C = Object.assign({}, T3_OUTFIT[o.outfit] || T3_OUTFIT.polo, o.colors || {}), A = T3.a * (o.headK ?? 1), u = 2 * A / 100, light = st.light;
    g.save(); t3Path(g, tp); g.clip(); g.translate(f.back ? 0 : f.dir * Math.min(1, m) * 0.18 * w, 0); t3Clothes(g, o.outfit || 'polo', C, cx, top, top + Th, w, o, f.back); g.restore();
    t3Volume(g, tp, cx, top + Th / 2, w, Th / 2, light, { shift: 0.5, flat: 0.22, mid: t3Mix('#d6cad6', st.env, 0.3), far: t3Mix('#857c9a', st.env, 0.35), rim: t3Mix('#c4bccc', st.env, 0.3), ring0: 0.74, glow: 0, rimLight: 0.22 });
    t3InkRing(g, tp, 3.6 * u, Math.atan2(-Math.sin(light) + 0.9, -Math.cos(light)), 0.3);
  });
  return { c, bw, bh };
}

// ---- limbs
// two-bone IK: elbow/knee for root S, end T, lengths l1 l2, bending toward the pole side (unit [px, py])
function t3IK(S, T, l1, l2, pole) {
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.max(1e-3, Math.hypot(dx, dy)), D = Math.min(d, l1 + l2 - 0.01), ux = dx / d, uy = dy / d;
  const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  let nx = -uy, ny = ux; if (nx * pole[0] + ny * pole[1] < 0) { nx = -nx; ny = -ny; }
  return { E: [S[0] + ux * a + nx * hh, S[1] + uy * a + ny * hh], T: [S[0] + ux * D, S[1] + uy * D] };
}
// arm presets: h = hand offset from the shoulder in head-heights [out, down] (out mirrors per side), pole = elbow side
// [out, down], front = drawn over the torso, hand = dot | open | point | grip
const T3_ARM = {
  down: { h: [0.08, 0.84], pole: [1, 0.1] }, rest: { h: [0.12, 0.8], pole: [1, -0.2] },
  hip: { h: [0.04, 0.52], pole: [1, 0], hand: 'dot' }, talk: { h: [0.36, 0.3], pole: [0.8, 1], hand: 'open' }, talk2: { h: [0.3, 0.12], pole: [0.7, 1], hand: 'open' },
  talkIn: { h: [0.1, 0.36], pole: [1, 0.6], hand: 'open', front: true }, shrug: { h: [0.46, 0.0], pole: [0.2, 1], hand: 'open' },
  wave: { h: [0.42, -0.55], pole: [1, 0.4], hand: 'open' }, up: { h: [0.46, -0.46], pole: [1, 0.7], hand: 'open' }, point: { h: [0.85, 0.05], pole: [0, 1], hand: 'point' },
  desk: { h: [-0.12, 0.62], pole: [1, 0.3], front: true }, front: { h: [-0.2, 0.5], pole: [1, 0.4], front: true }, chin: { h: [-0.3, -0.06], pole: [0.5, 1], front: true },
  hold: { h: [0.12, 0.52], pole: [1, 0.5], front: true, hand: 'grip' }, holdUp: { h: [0.02, 0.18], pole: [0.6, 1], front: true, hand: 'grip' },
  cross: { h: [-0.3, 0.4], pole: [1, 1.2], front: true }, cross2: { h: [-0.34, 0.32], pole: [1, 1.2], front: true }, pocket: { h: [0.06, 0.72], pole: [1, -0.4] }, lap: { h: [-0.06, 0.78], pole: [1, 0.3], front: true },
  sip: { h: [-0.14, -0.04], pole: [0.4, 1], front: true, hand: 'grip' },
};
function t3ArmSpec(h0) { if (!h0) return null; if (typeof h0 === 'string') return T3_ARM[h0] || T3_ARM.down; if (Array.isArray(h0)) return { h: [h0[0], h0[1]], pole: [1, 0.3], front: !!h0[2] }; return h0; }
// keyframed arm: [[t, preset|spec], ...] -> blended spec with overshoot; lag = how far the hand trails the elbow (s)
function t3ArmTrack(K, t, lag = 0) {   // v5: the move starts ON the key (Ricks cuts/acts on the word) and snaps (t3Snap)
  const tt = t - lag; let i = 0; while (i < K.length - 1 && K[i + 1][0] <= tt) i++;
  const b = t3ArmSpec(K[i][1]); if (i === 0 || tt < K[0][0]) return Object.assign({}, b);
  const a = t3ArmSpec(K[i - 1][1]), x = (tt - K[i][0]) / Math.min(T3_SNAP, (K[i + 1] ? K[i + 1][0] - K[i][0] : 1) * 0.9);
  if (x >= 1) return Object.assign({}, b);
  const e = t3Snap(x);
  return { h: [a.h[0] + (b.h[0] - a.h[0]) * e, a.h[1] + (b.h[1] - a.h[1]) * e], pole: e < 0.5 ? a.pole : b.pole, front: e < 0.5 ? a.front : b.front, hand: e < 0.5 ? a.hand : b.hand };
}
// props held in a hand (drawn on the card, outlined + shaded like the person; the hand dot grips over them)
function t3Prop(g, kind, x, y, u, s, o = {}) {
  const ol = (w = 1.8 * u) => { g.lineWidth = w; g.strokeStyle = T3.ink; g.stroke(); }, shade = (x0, y0, w, h) => { const gr = g.createLinearGradient(x0 - w, 0, x0 + w, 0); gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(40,20,50,0.3)'); g.fillStyle = gr; g.fillRect(x0 - w, y0 - h, 2 * w, 2 * h); };
  g.save(); g.translate(x, y);
  if (kind === 'mug' || kind === 'coffee') { const w = 7.5 * u, h = 9.5 * u, c = o.color || (kind === 'coffee' ? '#f4efe6' : '#e8eef6');
    g.beginPath(); g.ellipse(s * w * 1.05, -h * 0.05, 3.6 * u, 4.6 * u, 0, 0, TAU); g.lineWidth = 2.6 * u; g.strokeStyle = T3.ink; g.stroke(); g.lineWidth = 1.4 * u; g.strokeStyle = c; g.stroke();
    g.beginPath(); g.roundRect(-w, -h - 4 * u, 2 * w, 2 * h, 2 * u); g.fillStyle = c; g.fill(); g.save(); g.clip(); shade(0, -4 * u, w, h);
    if (kind === 'coffee') { g.fillStyle = '#8a5a34'; g.fillRect(-w, -2 * u, 2 * w, 6 * u); } else if (o.text) { g.fillStyle = o.ink || '#c8323a'; g.font = `900 ${3.4 * u}px Arial`; g.textAlign = 'center'; g.fillText(o.text, 0, -2 * u); }
    g.restore(); g.beginPath(); g.roundRect(-w, -h - 4 * u, 2 * w, 2 * h, 2 * u); ol();
    if (kind === 'coffee') { g.beginPath(); g.ellipse(0, -h - 4 * u, w * 1.08, 2.4 * u, 0, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); ol(1.4 * u); }
    else { g.beginPath(); g.ellipse(0, -h - 4 * u, w, 2 * u, 0, 0, TAU); g.fillStyle = '#5a3420'; g.fill(); ol(1.4 * u); }
  } else if (kind === 'paper') { g.rotate(-0.12 * s); g.beginPath(); g.rect(-9 * u, -26 * u, 18 * u, 24 * u); g.fillStyle = '#fbf7ee'; g.fill(); ol(1.6 * u);
    g.fillStyle = 'rgba(60,40,30,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(-6.5 * u, (-22 + i * 3.2) * u, (i % 2 ? 9 : 12) * u, 0.9 * u); g.fillStyle = '#c8323a'; g.fillRect(-6.5 * u, -24.5 * u, 7 * u, 1.4 * u);
  } else if (kind === 'phone') { g.rotate(-0.15 * s); g.beginPath(); g.roundRect(-4.6 * u, -15 * u, 9.2 * u, 16 * u, 1.6 * u); g.fillStyle = '#2a2a34'; g.fill(); ol(1.4 * u); g.fillStyle = '#7ad0ff'; g.fillRect(-3.4 * u, -13.4 * u, 6.8 * u, 11.5 * u);
  } else if (kind === 'pen') { g.rotate(-0.6 * s); t3Stroke(g, [[0, -14 * u], [0, 4 * u]], 3 * u, T3.ink); t3Stroke(g, [[0, -13 * u], [0, 3 * u]], 1.6 * u, o.color || '#2a5ad8');
  } else if (kind === 'bag') { g.beginPath(); g.moveTo(-3 * u, -18 * u); g.bezierCurveTo(-14 * u, -12 * u, -14 * u, 6 * u, 0, 6 * u); g.bezierCurveTo(14 * u, 6 * u, 14 * u, -12 * u, 3 * u, -18 * u); g.closePath();
    g.fillStyle = '#d9b26a'; g.fill(); g.save(); g.clip(); shade(0, -6 * u, 12 * u, 12 * u); g.restore(); ol(); g.fillStyle = '#2f8a3a'; g.font = `900 ${9 * u}px Arial`; g.textAlign = 'center'; g.fillText('$', 0, 0); t3Stroke(g, [[-4 * u, -16 * u], [4 * u, -16.5 * u]], 2 * u, '#8a5a2a');
  } else if (kind === 'cheese') { g.beginPath(); g.moveTo(-12 * u, -2 * u); g.lineTo(10 * u, -12 * u); g.lineTo(12 * u, 2 * u); g.lineTo(-12 * u, 4 * u); g.closePath(); g.fillStyle = '#f2c862'; g.fill(); ol();
    g.fillStyle = 'rgba(160,110,30,0.6)'; for (const [a, b] of [[-4, 0], [4, -4], [6, 1]]) { g.beginPath(); g.arc(a * u, b * u, 1.4 * u, 0, TAU); g.fill(); }
  }
  g.restore();
}
function t3Hand(g, x, y, kind, s, ang, u, col) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, (kind === 'grip' ? 6.6 : 6.0) * u, 0, TAU); g.fill();
  if (kind === 'point') t3Stroke(g, [[x, y], [x + Math.cos(ang) * 9 * u, y + Math.sin(ang) * 9 * u]], 2.6 * u, col);
}
// a shoe: rounded toe, a sole line, a highlight. dirx = which way it points (screen), fore = foreshortening 0..1
function t3Shoe(g, x, y, dirx, fore, u, col) {
  const L = 12.5 * u * (0.55 + 0.45 * fore), H = 5.6 * u;
  g.save(); g.translate(x, y); g.scale(dirx < 0 ? -1 : 1, 1); g.rotate(-0.05);
  g.beginPath(); g.moveTo(-L * 0.45, -H * 0.9); g.bezierCurveTo(L * 0.2, -H * 1.25, L * 0.95, -H * 0.9, L, 0); g.lineTo(L * 0.98, H * 0.45); g.lineTo(-L * 0.55, H * 0.45); g.bezierCurveTo(-L * 0.68, 0, -L * 0.62, -H * 0.7, -L * 0.45, -H * 0.9); g.closePath();
  g.fillStyle = col; g.fill(); g.lineWidth = 1.5 * u; g.strokeStyle = T3.ink; g.stroke();
  g.fillStyle = t3Mul(col, 0.55); g.fillRect(-L * 0.58, H * 0.08, L * 1.56, H * 0.38);
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.ellipse(L * 0.35, -H * 0.55, L * 0.28, H * 0.2, -0.15, 0, TAU); g.fill();
  g.restore();
}

// ---- the whole card. Layout (design units, a = 105): head W 210 x HH ~195, torso .82 W x 1.3 HH, legs 1.18 HH.
const T3_BODY = {   // tw: half width in W; Th: torso height in HH; leg: leg factor; bean shape; belly: front bulge; hip: leg spacing in W
  avg: { tw: 0.41, Th: 1.36, leg: 1, nTop: 1.95, nBot: 2.5, egg: 0.14, belly: 0.03, hip: 0.1 },
  thin: { tw: 0.33, Th: 1.44, leg: 1.06, nTop: 2.0, nBot: 2.3, egg: 0.06, belly: 0.01, hip: 0.085 },
  fat: { tw: 0.55, Th: 1.32, leg: 0.88, nTop: 1.8, nBot: 2.8, egg: 0.22, belly: 0.09, hip: 0.13 },
  tall: { tw: 0.39, Th: 1.52, leg: 1.16, nTop: 1.95, nBot: 2.4, egg: 0.1, belly: 0.02, hip: 0.1 },
  short: { tw: 0.44, Th: 1.14, leg: 0.82, nTop: 1.9, nBot: 2.6, egg: 0.16, belly: 0.05, hip: 0.11 },
  pear: { tw: 0.45, Th: 1.38, leg: 0.98, nTop: 1.7, nBot: 2.7, egg: 0.3, belly: 0.04, hip: 0.11 },
  kid: { tw: 0.36, Th: 1.02, leg: 0.74, nTop: 2.0, nBot: 2.4, egg: 0.12, belly: 0.03, hip: 0.09 },
};
function t3Dims(o) { const A = T3.a * (o.headK ?? 1), H = 2 * A * 0.94, Bd = T3_BODY[o.body] || T3_BODY.avg;
  return { A, HH: H, legL: 1.14 * H * Bd.leg * (o.legK ?? 1), Th: Bd.Th * 0.95 * H * (o.torsoK ?? 1), tw: Bd.tw * 0.95 * 2 * A * (o.bodyW ?? 1), Bd }; }
// v6: how far the hips must drop on a contact so both feet reach their planted spots (long strides need it; no IK clamp = no skating)
function t3HipDrop(legL, st, p, acrossK) { const half = 0.5 * 0.55 * (st.stride ?? 3.3) / (p.U ?? T3.U) * (0.35 + 0.65 * acrossK); return Math.max(0, legL - Math.sqrt(Math.max(0, legL * legL - half * half))); }
function t3Draw(g, p, st) {
  const o = p.o, { A, HH, legL, Th, tw, Bd } = t3Dims(o), W = 2 * A, u = W / 100, sole = 975, two = TAU;
  const f = st.f, m = f.m, dir = f.dir, back = f.back, mode = st.mode, side = Math.min(1, m), ld = st.limbCol;
  const idle = st.idle, t = st.t, s0 = p.seed;
  // ---- idle (stateless), measured on Ricks: pose-to-pose holds, the head on its own schedule trailing the torso
  const talk = st.talkAmp || 0, gest = st.gesture || 0, br = (T3.breathe || 0) * Math.sin(two * (t / 3.3) + s0) * idle;   // v5: T3.breathe 0 — Ricks holds DEAD still
  const TH = t3Holds(s0 * 7 + 3, t, 1.0, 2.0), HD = t3Holds(s0 * 11 + 5, t, talk > 0 ? 0.4 : 0.7, talk > 0 ? 0.9 : 1.6);
  const sway = TH(0) * 0.055 * idle, wsh = TH(1) * idle, tdx = TH(2) * 0.035 * W * idle;   // torso tilt rms ~1.5 deg (Ricks 1-1.8)
  const hT = HD(0) * 0.13 * idle, hX = HD(1) * 0.03 * W * idle, hY = HD(2) * 0.1 * W * idle;   // head vs torso: tilt rms ~3.8 deg, dy rms ~0.035 W
  const lk = Math.max(1, Math.min(1.8, 1 + (1000 - (st.px || 1000)) / 1000 * 0.8)), lkh = lk ** 0.8;   // limbs/hands read in wide shots
  // ---- torso placement
  const walk = mode === 'walk', ph = st.phase, sw = walk ? Math.sin(two * ph) : 0;
  // v6 walk: go = 1 - stop (st.stop eases the last steps into the stand pose); th = the travel angle off the camera axis
  const go = walk ? 1 - Math.max(0, Math.min(1, st.stop || 0)) : 0, th = back ? 0 : Math.min(2, m) * Math.PI / 4, acrossK = Math.sin(th), deepK = Math.cos(th);
  const bobv = 0.5 - 0.5 * Math.cos(two * 2 * ph);   // 0 on the two contacts (legs apart, hips low), 1 on the passing poses (hips high)
  const sitK = st.sit, seatTb = sole - st.seat - 0.02 * HH, standTb = sole - legL + 0.05 * HH;
  let tb = standTb + (seatTb - standTb) * sitK + (walk ? (0.03 * HH * (1 - bobv) - 0.012 * HH + t3HipDrop(legL, st, p, acrossK) * (1 - bobv)) * go : 0) + (mode === 'stand' ? 0.006 * HH * (1 - Math.abs(wsh)) : 0);
  const squash = st.squash || 0, sy = 1 + 0.012 * br - 0.08 * squash, sx = 1 + 0.006 * br + 0.06 * squash;
  const tcx = 300 + (mode === 'stand' ? wsh * 0.03 * W + tdx : tdx * 0.5) + (walk ? dir * acrossK * 0.01 * W * Math.cos(two * ph * 2) * go : 0);
  const lean = st.lean + sway + (walk ? dir * acrossK * 0.07 * go : 0) + (mode === 'stand' ? -wsh * 0.02 : 0);
  const top = tb - Th * sy, hipY = tb - 0.07 * HH;
  // ---- legs: hip -> knee (IK) -> foot, noodle curve, shoes
  const feet = [];
  const legLen = Math.hypot(0.05 * W, standTb - 0.07 * HH - sole + 0.005 * HH) * 1.012, l1 = legLen * 0.5, l2 = legLen * 0.5;
  for (const s of [-1, 1]) {
    const Hp = [tcx + s * Bd.hip * W * (1 - 0.6 * side), hipY]; let F, pole, lift = 0;
    if (walk) {   // v6 planted-foot cycle: 55 % contact — the foot slides back LINEARLY at ground speed (it stays put in the
      // world, no skating), 45 % swing — it lifts and swings forward. Stride = ground covered during one contact (st.stride =
      // world units per cycle, the same number the piece divides the distance by for st.phase). Across the screen by sin(th),
      // in depth by cos(th) (the forward foot sits lower = nearer; walking away it sits higher)
      const pS = ((ph + (s > 0 ? 0 : 0.5)) % 1 + 1) % 1, C = 0.55; let rel, up = 0;
      if (pS < C) rel = 0.5 - pS / C; else { const q = (pS - C) / (1 - C); rel = -0.5 + t3Sm(q); up = Math.sin(Math.PI * q); }
      const S = C * (st.stride ?? 3.3) / (p.U ?? T3.U) * go, depth = back ? -1 : 1; lift = up * 0.12 * HH * go;
      const lat = s * (0.07 * W * (1 - acrossK) * go + (0.15 * W - 0.05 * W * side) * (1 - go));
      F = [300 + lat + dir * rel * S * acrossK, sole - lift + depth * rel * S * deepK * 0.22];
      pole = [dir * acrossK + s * (1 - acrossK) * 0.4, -0.3 - (1 - acrossK) * 0.4];
    } else {
      const spread = 0.15 * W + (sitK > 0 ? 0.08 * W * sitK : 0) - side * 0.05 * W, load = s === Math.sign(wsh || 1) ? 1 : 0;
      F = [300 + s * spread + dir * side * sitK * 0.24 * W, sole - 0.005 * HH * load];
      pole = sitK > 0.3 ? [s * (1 - side) + dir * side * 1.4, -1] : [s * 0.8 + dir * side, -0.25 - (1 - load) * Math.abs(wsh) * 0.5];
    }
    const { E: K, T: Fe } = t3IK(Hp, F, l1, l2, pole);
    t3TaperPath(g, t3Spline([Hp, K, Fe], 8), 4.0 * u * lk ** 0.85, 3.4 * u * lk ** 0.85, ld);
    const out = walk ? dir : back ? 0 : s, fore = walk ? 0.25 + 0.75 * side : side > 0.5 ? 0.9 : 0.35;
    feet.push([Fe[0], Fe[1], out === 0 ? s : out, fore, lift]);
  }
  feet.sort((a, b) => a[1] - b[1]).forEach(([x, y, d, fo]) => t3Shoe(g, x + d * 2.5 * u, y + 0.6 * u, d, fo, u, o.shoes || '#3a2620'));
  p.feet = feet.map((q) => q[0]);
  // ---- upper body: rotate about the hips
  g.save(); g.translate(tcx, hipY); g.rotate(lean); g.translate(-tcx, -hipY);
  const shY = top + 0.2 * Th * sy, arms = [];   // v5: Ricks arms leave the torso edge just under the head
  const edges = (() => { const { tp } = t3TorsoShape(o, f, 0, 0, Th, tw); return t3EdgesAt(tp, 0.2 * Th); })();
  for (const s of [-1, 1]) {
    const nm = s < 0 ? 'L' : 'R', h0 = st.hand && st.hand[nm], keyed = Array.isArray(h0) && Array.isArray(h0[0]);
    let A1 = keyed ? t3ArmTrack(h0, t, 0) : t3ArmSpec(h0) || T3_ARM.down, A2 = keyed ? t3ArmTrack(h0, t, 0.07) : A1;
    const Sh = [tcx + (s < 0 ? edges[0] : edges[1]) * sx, shY];   // the shoulder sits ON the torso outline
    // walk swing (opposite the legs, the forearm lags), talk beats (the gesturing hand pumps with the speech)
    let ox = 0, oy = 0;
    if (walk && !h0) { const k = -Math.cos(two * (ph + (s > 0 ? 0 : 0.5)));   // v6: each arm swings opposite its own leg (forward with the other foot)
      ox = (dir * acrossK * k * 0.3 * HH + (1 - acrossK) * k * 0.06 * HH) * go; oy = -Math.abs(k) * 0.04 * HH * go; }
    if (gest > 0 && !A1.front && !(st.prop && st.prop[nm])) { const GH = t3Holds(s0 * 13 + 7 + s, t, 0.35, 0.8), b = gest * (0.5 + 0.5 * GH(0)) * (s > 0 ? 1 : 0.55);   // talk beats snap pose to pose
      ox += s * b * 0.05 * HH + GH(1) * gest * 0.03 * HH; oy += -b * 0.1 * HH - talk * 0.02 * HH * GH(2); }
    oy += -0.01 * HH * br;
    const tgt = (S2) => [Sh[0] + s * S2.h[0] * HH + ox, Sh[1] + S2.h[1] * HH + oy];
    const T1 = tgt(A1), T2 = tgt(A2), la = 0.56 * HH, lb = 0.53 * HH;
    const pole = [s * A1.pole[0], A1.pole[1]], ik = t3IK(Sh, T1, la, lb, pole), E = ik.E, ik2 = t3IK(Sh, T2, la, lb, pole);
    const Hd = ik2.T, drag = [(T1[0] - T2[0]) * 0.6, (T1[1] - T2[1]) * 0.6];   // the hand trails (follow-through)
    const cx0 = Hd[0] - Sh[0], cy0 = Hd[1] - Sh[1], d = Math.max(1e-3, Math.hypot(cx0, cy0)), Lr = la + lb, slack = Math.sqrt(Math.max(0, Lr * Lr - d * d));
    let nx = -cy0 / d, ny = cx0 / d; if (nx * pole[0] + ny * pole[1] < 0) { nx = -nx; ny = -ny; }
    // v5 (Ricks): a rubber-hose arc, never a kinked elbow — it bows out at least 22 % of its span and curls back into the hand
    const bow = Math.max(0.22 * d, 0.07 * HH, slack * 0.45), C1 = [Sh[0] + cx0 * 0.22 + nx * bow * 1.15, Sh[1] + cy0 * 0.22 + ny * bow * 1.15], C2 = [Sh[0] + cx0 * 0.86 + nx * bow * 1.0 - drag[0], Sh[1] + cy0 * 0.86 + ny * bow * 1.0 - drag[1]];
    const pts = []; for (let i = 0; i <= 18; i++) { const q = i / 18, r = 1 - q; pts.push([0, 1].map((j) => r * r * r * Sh[j] + 3 * r * r * q * C1[j] + 3 * r * q * q * C2[j] + q * q * q * Hd[j])); }

    let front = !!A1.front; if (back) front = false; if (side > 0.6 && s === -dir && !back) front = true;
    arms.push({ pts, end: Hd, front, over: !!A1.over, hand: A1.hand || 'dot', s, ang: Math.atan2(Hd[1] - C2[1], Hd[0] - C2[0]), prop: st.prop && st.prop[nm], nm });
  }
  p.handC = {};
  const drawArm = (a) => { t3TaperPath(g, a.pts, 4.2 * u * lk, 4.0 * u * lk, ld);
    let kind = a.hand; if (a.prop) { const pr = typeof a.prop === 'string' ? { kind: a.prop } : a.prop; t3Prop(g, pr.kind, a.end[0] - a.s * 7.5 * u * lkh, a.end[1] + 2.5 * u * lkh, u * lkh, -a.s, pr); kind = 'grip'; }
    t3Hand(g, a.end[0], a.end[1], kind, a.s, a.ang, u * lkh, ld); const q = g.getTransform().transformPoint(new DOMPoint(a.end[0], a.end[1])); p.handC[a.nm] = [q.x / p.k, q.y / p.k]; };
  arms.filter((a) => !a.front).forEach(drawArm);
  // ---- torso (cached) with breathing / squash scale
  const TC = t3TorsoCanvas(p, st, f, tw, Th);
  g.save(); g.translate(tcx, tb); g.scale(sx, sy); g.drawImage(TC.c, -TC.bw / 2, -Th - 20, TC.bw, TC.bh); g.restore();
  arms.filter((a) => a.front && !a.over).forEach(drawArm); arms.filter((a) => a.front && a.over).forEach(drawArm);   // (2026-11-10, additive) over: true = drawn after the other arm + its prop (a hand ON a held bag)
  // ---- head (cached): its own bob / tilt / drift, lagging the body, nodding with the speech
  const chin = top + 0.12 * HH, Bh = A * p.head.hw, hcY = chin - Bh * 0.9;
  const nod = st.nod || 0, sylN = talk * (st.talk >= 2 ? 1 : 0);   // beats (gestures / expression changes) nod the head; open syllables dip it
  const hbob = hY + (walk ? 2.4 * Math.sin(two * ph * 2 - 0.9) * u * 0.6 : 0) + nod * 0.035 * W + sylN * 0.8 * u + 0.4 * br * u;
  const htilt = st.tilt + p.head.rot + hT - sway * 0.6 - lean * 0.35 + nod * 0.05 * (st.nodSide || 1);
  const hdx = hX + dir * side * 1.5 * u;
  const HC = t3HeadCanvas(p, st, f);
  g.translate(tcx + hdx, chin + hbob); g.rotate(htilt); g.translate(0, hcY - chin);
  g.drawImage(HC, -T3_HEADBOX.cx, -T3_HEADBOX.cy, T3_HEADBOX.w, T3_HEADBOX.h);
  g.restore();
}

// ---- three.js: the card (lit, takes the set's shadows), its contact shadow, the pose
function t3Level(p, k) {   // one canvas + texture per resolution level (made on first use)
  if (p.lv[k]) return p.lv[k];
  const cv = document.createElement('canvas'); cv.width = Math.round(600 * k); cv.height = Math.round(1000 * k);
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8; return (p.lv[k] = { cv, tex, k, last: null });
}
function c3ToonChar(o = {}) {
  const k = o.res ?? T3.k, lv0 = t3Level({ lv: {} }, k), cv = lv0.cv, tex = lv0.tex;
  const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
  mat.toneMapped = false;
  // the card's shadow lookup is pushed toward the light (its normal points there), so it never shadows itself
  mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <shadowmap_vertex>', THREE.ShaderChunk.shadowmap_vertex.replace(/directionalLightShadows\[ i \]\.shadowNormalBias/g, '( directionalLightShadows[ i ].shadowNormalBias + 0.7 )')); };
  mat.customProgramCacheKey = () => 't3card';
  const U = T3.U * (o.scale ?? 1), g = new THREE.Group(), root = new THREE.Group(); g.add(root); g.userData.person = true;
  const geo = new THREE.PlaneGeometry(600 * U, 1000 * U); geo.translate(0, 475 * U, 0);
  const card = new THREE.Mesh(geo, mat); card.renderOrder = 2; root.add(card);
  // the card casts its silhouette, pushed away from the light so it never shadows itself (no acne on the faces)
  card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 24 });
  T3.shTex ||= c3Tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(20,10,20,0.6)'); gr.addColorStop(0.5, 'rgba(20,10,20,0.28)'); gr.addColorStop(1, 'rgba(20,10,20,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128, false);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T3.shTex, transparent: true, depthWrite: false, toneMapped: false, opacity: o.shadow ?? 0.75 }));
  sh.rotation.x = -Math.PI / 2; sh.renderOrder = 1; sh.userData.noInk2 = true; root.add(sh);
  const oo = Object.assign({ key: o.key ?? 'toon', hair: 'mop', outfit: 'polo' }, o);
  return { g, root, card, cv, tex, mat, sh, U, k, lv: { [k]: lv0 }, key: oo.key, o: oo, last: null, feet: [270, 330], cache: {}, head: t3HeadSpec(oo), seed: t3Seed(oo.key) * 0.37, handC: {} };
}
// pose-to-pose schedule: holds of dmin..dmax s with 0.24 s eased moves (a little overshoot); returns k -> value -1..1
function t3Holds(seed, t, dmin, dmax) {
  let t0 = -0.5 - t3Rnd(seed, 1) * dmax, i = 0; while (t0 + dmin + (dmax - dmin) * t3Rnd(seed, i + 2) <= t) { t0 += dmin + (dmax - dmin) * t3Rnd(seed, i + 2); i++; }
  const e = t3Snap((t - t0) / T3_SNAP);   // v5: Ricks snap, then dead still until the next pose
  return (k) => { const a = t3Rnd(seed, (i - 1) * 7 + k + 100) * 2 - 1, b = t3Rnd(seed, i * 7 + k + 100) * 2 - 1; return a + (b - a) * e; };
}
// syllables while talking: 0.08-0.21 s each, shape 0 closed / 1 small / 2 mid / 3 wide / 4 O; opens and closes inside the syllable
function t3Syl(seed, t) {
  let t0 = 0, i = 0; while (t0 + 0.08 + 0.13 * t3Rnd(seed, i + 300) <= t) { t0 += 0.08 + 0.13 * t3Rnd(seed, i + 300); i++; }
  const d = 0.08 + 0.13 * t3Rnd(seed, i + 300), x = (t - t0) / d, r = t3Rnd(seed, i + 500), L = r < 0.16 ? 0 : r < 0.42 ? 1 : r < 0.76 ? 2 : r < 0.9 ? 3 : 4;
  return x < 0.22 || x > 0.88 ? Math.min(L === 4 ? 1 : L, 1) : L;
}
// keyframe helpers: [[t, v], ...] -> the value in force at t / the change times
const t3KeyAt = (K, t) => { let v = K[0][1]; for (const [k, x] of K) if (k <= t) v = x; return v; };
const t3IsKeys = (v) => Array.isArray(v) && Array.isArray(v[0]) && typeof v[0][0] === 'number';
// blinks every 1.4-3.3 s (seeded per person), 4 frames: half, closed, closed, half
function t3Blink(key, t) {
  const s = t3Seed(key); let tb = 0.3 + 1.6 * t3Rnd(s, 1), i = 2;
  while (tb + 4 / 30 <= t) tb += 1.4 + 1.9 * t3Rnd(s, i++);
  const f = Math.floor((t - tb) * 30 + 1e-6); return f < 0 ? 0 : f === 0 || f === 3 ? 0.5 : f < 3 ? 1 : 0;
}
// sit action over u 0..1: anticipation (a small dip + lean), the drop (hips back, chest forward), contact squash, settle
function c3ToonSitCurve(u) {
  u = Math.max(0, Math.min(1, u));
  const ant = t3Sm(u / 0.22) * (1 - t3Sm((u - 0.22) / 0.12)), drop = EZ.io((u - 0.2) / 0.5), hit = Math.max(0, 1 - Math.abs(u - 0.74) / 0.1), settle = t3Sm((u - 0.78) / 0.22);
  return { sit: Math.max(-0.06, Math.min(1, drop - 0.05 * ant)), lean: -0.05 * ant + 0.22 * Math.sin(Math.PI * t3Sm((u - 0.2) / 0.6)) * (1 - settle) , squash: 0.6 * hit - 0.06 * Math.sin(Math.PI * settle) };
}
// scene lights, read once per scene; the env tint / brightness re-read every frame (shadow setup scales them later)
function t3Lights(scene) {
  if (scene.userData.t3L) return scene.userData.t3L;
  const L = { amb: [], hemi: [], key: null }; scene.traverse((l) => { if (l.isAmbientLight) L.amb.push(l); if (l.isHemisphereLight) L.hemi.push(l); if (l.isDirectionalLight && (!L.key || l.intensity > L.key.intensity)) L.key = l; });
  return (scene.userData.t3L = L);
}
const T3V = { a: null, n: null };
function c3ToonPose(p, cam, t, o = {}) {
  T3V.a ||= new THREE.Vector3(); T3V.n ||= new THREE.Vector3();
  const wp = new THREE.Vector3(); p.g.getWorldPosition(wp); let ry = 0; for (let q = p.g; q; q = q.parent) ry += q.rotation.y;
  p.root.rotation.y = Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z) - ry;
  let scene = p.g; while (scene.parent) scene = scene.parent;
  const LS = t3Lights(scene), key = LS.key;
  // the key light seen from this camera -> the canvas angle it comes from
  const shd = typeof C3_SHADOW !== 'undefined' && C3_SHADOW && C3_SHADOW.dir;
  const dW = shd ? new THREE.Vector3(...C3_SHADOW.dir).normalize() : key ? key.position.clone().sub(key.target.position).normalize() : new THREE.Vector3(-1, 1, 1).normalize();
  let light = o.light;
  if (light == null) { const d = dW.clone(); cam.updateMatrixWorld(); d.transformDirection(cam.matrixWorldInverse); light = Math.hypot(d.x, d.y) < 0.2 ? -2.3 : Math.atan2(-d.y, d.x); light = Math.round(light / 0.06) * 0.06; }
  // the room: ambient + hemisphere colour -> the shade tint; the card is lit (Lambert) and normalised so a fully key-lit
  // person keeps the drawn colours, one in shadow / in a dim room drops toward the room's fill
  let fill = [0, 0, 0], fillI = 0;
  LS.amb.forEach((l) => { fill = fill.map((v, i) => v + l.color.toArray()[i] * l.intensity); fillI += l.intensity * (l.color.r + l.color.g + l.color.b) / 3; });
  LS.hemi.forEach((l) => { const c = l.color.clone().lerp(l.groundColor, 0.3); fill = fill.map((v, i) => v + c.toArray()[i] * l.intensity); fillI += l.intensity * (c.r + c.g + c.b) / 3; });
  const keyI = key ? key.intensity * (key.color.r + key.color.g + key.color.b) / 3 : 0, full = Math.max(0.2, fillI + keyI);
  const mx = Math.max(1e-3, ...fill), env = t3HexOf(fill.map((v) => t3Q(Math.pow(v / mx, 1 / 2.2) * 255, 16)));
  p.mat.color.setScalar((T3.gain * (o.bright ?? 1)) / Math.max(full, o.ref ?? T3.ref ?? full));
  { const tot = fill.map((v, i) => v + (key ? key.color.toArray()[i] * key.intensity : 0)), av = (tot[0] + tot[1] + tot[2]) / 3 || 1;   // neutralise 70 % of the lights' tint
    p.mat.color.multiply(new THREE.Color(...tot.map((v) => Math.pow(av / Math.max(1e-3, v), full < (T3.ref ?? 0) ? 0.25 : 0.7)))); }   // dim rooms keep their tint
  // the card normal points at the key light (so it reads as lit from the front) unless it is behind the card
  { p.root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(p.root.matrixWorld).invert();
    const n = dW.clone().transformDirection(inv); n.z = Math.max(0.25, n.z); n.normalize(); n.lerp(new THREE.Vector3(0, 0, 1), 0.3).normalize();
    const na = p.card.geometry.attributes.normal; if (Math.abs(na.getX(0) - n.x) + Math.abs(na.getY(0) - n.y) + Math.abs(na.getZ(0) - n.z) > 0.02) { for (let i = 0; i < na.count; i++) na.setXYZ(i, n.x, n.y, n.z); na.needsUpdate = true; } }
  // beats: hand keyframes, expression changes, explicit o.beats -> brows lift, the head nods; facing keyframes -> turns blink
  const beats = [...(o.beats || [])], turns = [];
  if (o.hand) for (const h of Object.values(o.hand)) if (t3IsKeys(h)) h.slice(1).forEach(([k]) => beats.push(k));
  let exprV = o.expr ?? 'neutral'; if (t3IsKeys(exprV)) { exprV.slice(1).forEach(([k]) => beats.push(k)); exprV = t3KeyAt(exprV, t); }
  let fac = o.facing ?? 0;
  if (t3IsKeys(fac)) { const K = fac; K.slice(1).forEach(([k]) => turns.push(k)); let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
    const a = K[Math.max(0, i - 1)][1], b = K[i][1], x = i === 0 ? 1 : Math.min(1, (t - K[i][0]) / 0.2);   // v5: turns snap too
    fac = b === 'back' || a === 'back' ? (x > 0.25 ? b : a) : a + (b - a) * t3Snap(x); }
  const benv = (d) => (d < 0 ? 0 : d < 0.08 ? d / 0.08 : d < 0.32 ? 1 : d < 0.6 ? 1 - (d - 0.32) / 0.28 : 0);
  // v5: a beat snaps the head to a nod pose, holds 0.6 s, snaps back (Ricks never tweens a nod)
  let browUp = 0, nod = 0, nodSide = 1; beats.forEach((k, j) => { browUp = Math.max(browUp, benv(t - k)); const d = t - k; if (d >= 0 && d < 0.6 + T3_SNAP) { const v = d < 0.6 ? t3Snap(d / T3_SNAP) : 1 - t3Snap((d - 0.6) / T3_SNAP); if (v > nod) { nod = v; nodSide = j % 2 ? -1 : 1; } } });
  let turnBlink = null; for (const k of turns) { const fr = Math.floor((t - k) * 30 + 1e-6); if (fr >= 0 && fr < 4) turnBlink = fr === 0 || fr === 3 ? 0.5 : 1; }
  const bl = o.blink ?? turnBlink ?? t3Blink(p.key, t), back = fac === 'back';
  const fv = back ? 0 : Math.max(-2, Math.min(2, fac)), f = { f: fv, m: Math.abs(fv), dir: back ? 1 : Math.sign(fv) || 1, back };
  const mode = o.mode ?? 'stand', sit = o.sit ?? (mode === 'sit' ? 1 : 0), talkAmp = o.talk ?? 0;
  const st = { t, expr: exprV, browUp: Math.round(browUp * (o.browK ?? 2.6) * 2) / 2, nod, nodSide, lid: typeof bl === 'number' ? bl : bl ? 1 : 0, gaze: o.gaze, f, mode: mode === 'sit' ? 'stand' : mode, phase: o.phase ?? 0,
    sit, seat: o.seat != null ? o.seat / p.U : 0, hand: o.hand, prop: o.prop, lean: o.lean ?? 0, tilt: o.tilt ?? 0, light, env, idle: o.idle ?? 1,
    talkAmp, talkOn: talkAmp > 0.05, talk: talkAmp > 0.05 ? Math.min(talkAmp < 0.5 ? 2 : 4, t3Syl(t3Seed(p.key), t)) : 0,
    gesture: o.gesture ?? 0, fx: o.fx, squash: o.squash ?? 0, limbCol: T3.limb, stride: o.stride, stop: o.stop };
  if (mode === 'sit' && o.sit == null) st.sit = 1;
  st.px = (() => { const a = new THREE.Vector3(0, 0, 0), b = new THREE.Vector3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(cam); b.project(cam); return Math.round(Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / 50) * 50; })();
  const still = st.idle === 0 && !talkAmp && !st.gesture && mode !== 'walk' && !(o.hand && Object.values(o.hand).some((h) => Array.isArray(h) && Array.isArray(h[0])));
  const sk = still ? JSON.stringify(Object.assign({}, st, { t: 0 })) : null;
  // resolution level from the card's height on screen (texel ~1.2 px), capped by o.res; swap the map when it changes
  { const a = new THREE.Vector3(0, 0, 0), b = new THREE.Vector3(0, 1000 * p.U, 0); p.root.localToWorld(a); p.root.localToWorld(b); a.project(cam); b.project(cam);
    const px = Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2), need = Math.min(p.o.res ?? T3.levels.at(-1), (px / 1000) * T3.texel);
    const k = T3.levels.find((l) => l >= need) ?? T3.levels.at(-1), L = t3Level(p, k);
    if (L.tex !== p.mat.map) { p.mat.map = L.tex; if (p.card.customDepthMaterial) p.card.customDepthMaterial.map = L.tex; if (p.card.userData.c3e) p.card.userData.c3e.uniforms.map.value = L.tex; }
    p.k = k; p.cv = L.cv; p.tex = L.tex; }
  if (!still || sk !== p.lv[p.k].last) { p.lv[p.k].last = sk; const g = p.cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, p.cv.width, p.cv.height);
    g.setTransform(p.k, 0, 0, p.k, 0, 0); (p.drawFn || t3Draw)(g, p, st); p.tex.needsUpdate = true; }   // opt-in: p.drawFn draws a non-human card (toon-pets.js)
  const [f0, f1] = [Math.min(...p.feet), Math.max(...p.feet)]; p.sh.position.set(((f0 + f1) / 2 - 300) * p.U, 0.03, 0.06); p.sh.scale.set((Math.abs(f1 - f0) + 90) * p.U * 1.1, 1.0, 1);
  return p;
}
// world position of a hand (after c3ToonPose) — to attach a 3D prop or check a grip
function c3ToonHandWorld(p, nm = 'R') { const c = p.handC[nm]; if (!c) return null; p.root.updateMatrixWorld(); return p.root.localToWorld(new THREE.Vector3((c[0] - 300) * p.U, (975 - c[1]) * p.U, 0.02)); }
// heights in world units: hip (standing torso bottom) and the seat a standing person's hips are at
function c3ToonDims(p) { const d = t3Dims(p.o); return { hip: (d.legL - 0.05 * d.HH) * p.U, height: (d.legL + d.Th + d.HH * 0.85) * p.U }; }

// ---- (2026-11-10, additive) the gripping hand drawn OVER a 3D prop: a small square of the person's OWN card around the hand
// (same texture, same lit material colour and normal), drawn without depth test — so the fist reads exactly like the card's
// hand (dark limb colour, same light). Replaces piece-local skin-coloured unlit discs (they rendered as white/transparent
// fists over arms). c3ToonGripDot(p, 'R', cam, show) after c3ToonPose; returns the mesh (add it to the scene once).
function c3ToonGripDot(p, nm, cam, show = true) {
  p.gripM ||= {};
  let m = p.gripM[nm];
  const c = p.handC[nm];
  if (!m) { const mat = p.mat.clone(); mat.depthTest = false; mat.depthWrite = false; mat.alphaTest = 0.5; mat.transparent = true; mat.customProgramCacheKey = () => 't3grip';
    m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = 30; m.userData.noInk2 = true; m.userData.noCast = true; m.userData.noShade = true; p.gripM[nm] = m; }
  m.visible = !!(show && c && p.g.visible); if (!m.visible) return m;
  const hsD = 13 * 2.24 * 1.15, s = 2 * hsD * p.U, u0 = (c[0] - hsD) / 600, u1 = (c[0] + hsD) / 600, v0 = 1 - (c[1] + hsD) / 1000, v1 = 1 - (c[1] - hsD) / 1000;
  const uv = m.geometry.attributes.uv; uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0); uv.needsUpdate = true;
  m.scale.set(s, s, 1); m.material.map = p.mat.map; m.material.color.copy(p.mat.color);
  const cn = p.card.geometry.attributes.normal, nn = m.geometry.attributes.normal; for (let i = 0; i < 4; i++) nn.setXYZ(i, cn.getX(0), cn.getY(0), cn.getZ(0)); nn.needsUpdate = true;
  const h = c3ToonHandWorld(p, nm); m.position.copy(h); p.card.getWorldQuaternion(m.quaternion);
  if (cam) m.position.addScaledVector(cam.position.clone().sub(h).normalize(), 0.02);
  return m;
}

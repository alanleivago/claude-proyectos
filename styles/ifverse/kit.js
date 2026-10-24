// =====================================================================
//  styles/ifverse/kit.js — "What If" stickman stories (from Ref ifverse). 16:9, 1920x1080, motion on 1s.
//  Flat cards at real depth filmed by a camera: every layer is drawn flat, parallaxes with its depth and goes soft
//  with depth of field; film grain, vignette and cinema bars on top. Black stick people with a warm rim light,
//  cream eyes and mouth, one-colour clothes; hands change with shot size (nub / mitten / glove).
//  Prefix: iv. Needs from the piece head: nothing but W, H, FPS (core). VOICE optional (talking mouths).
// =====================================================================
const IV = {
  bar: 62,                     // cinema bars, px at 1080
  ink: '#0c0b10', eye: '#f7eedd', ghost: '#7ff0ff', ghostDeep: '#2bc8ff',
  font: '"Arial Rounded MT Bold", "Avenir Next", "Nunito", "Helvetica Neue", Arial, sans-serif',
  sans: '"Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif',
  dof: 16,                     // blur px for a layer one "depth unit" off focus
};
// moods: light and grade for a whole set. rim = the edge light on the stick people; amb = a wash over the far layers
const IV_MOOD = {
  sunset:   { rim: '#ffb257', key: [0.85, -0.5], tint: 'rgba(120,60,110,0.10)', haze: '#c97a72', vig: 0.55 },
  lunch:    { rim: '#ffd29a', key: [0.7, -0.6], tint: 'rgba(255,200,140,0.05)', haze: '#e9c9a2', vig: 0.42 },
  day:      { rim: '#fff0d8', key: [-0.6, -0.7], tint: 'rgba(150,170,200,0.05)', haze: '#c9d0da', vig: 0.40 },
  night:    { rim: '#8fb4ff', key: [0.6, -0.4], tint: 'rgba(20,30,70,0.18)', haze: '#2a3658', vig: 0.62 },
  rain:     { rim: '#ffcf8a', key: [-0.8, -0.3], tint: 'rgba(10,25,50,0.20)', haze: '#1f2c44', vig: 0.66 },
  lamp:     { rim: '#ffbf6a', key: [-0.7, -0.5], tint: 'rgba(90,50,20,0.10)', haze: '#3a2a26', vig: 0.62 },
  office:   { rim: '#e9eef8', key: [0.5, -0.7], tint: 'rgba(120,140,170,0.08)', haze: '#9aa4b4', vig: 0.48 },
};
let IV_M = IV_MOOD.sunset;     // current mood, set by ivShot
let IV_CAM = { x: 960, y: 540, z: 1 }, IV_FOCUS = 1, IV_LAYER_D = 1;

// ---------------------------------------------------------------------
//  small drawing helpers
// ---------------------------------------------------------------------
function ivRR(x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function ivPoly(P, fill, stroke, lw = 2) {
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function ivLine(x1, y1, x2, y2, w, c, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = cap; ctx.stroke();
}
function ivDot(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function ivVGrad(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g;
}
function ivGlow(x, y, r, c, a = 1) {   // soft round light
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function ivHex(h, a = 1) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function ivShade(h, k) {   // k < 0 darker, k > 0 lighter
  const n = parseInt(h.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function ivText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? IV.font}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = o.base ?? 'alphabetic';
  if (o.track) ctx.letterSpacing = `${o.track}px`;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = size * 0.45; }
  if (o.shadow) { ctx.save(); ctx.fillStyle = o.shadow; ctx.fillText(str, x + size * 0.03, y + size * 0.06); ctx.restore(); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}

// ---------------------------------------------------------------------
//  the camera and the depth layers
//  cam = { x, y, z }: the focus-plane point at the frame centre, and the zoom. A layer at depth d (1 = the actors'
//  plane, 3 = far wall, 0.6 = foreground) pans 1/d as much and zooms 1+(z-1)/d — so far layers slide less and a
//  close-up keeps a wide, soft background. Every layer is drawn as if the camera were at the base framing.
// ---------------------------------------------------------------------
const IV_POOL = [];
function ivCanvas(i, w, h) {
  let c = IV_POOL[i];
  if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; IV_POOL[i] = c; }
  return c;
}
function ivLayerXf(d, k = 1) {   // the transform for depth d on a canvas scaled by k
  const s = 1 + (IV_CAM.z - 1) / d, cx = 960 + (IV_CAM.x - 960) / d, cy = 540 + (IV_CAM.y - 540) / d;
  return [s * k, 0, 0, s * k, (960 - cx * s) * k, (540 - cy * s) * k];
}
function ivBlurFor(d) { return IV.dof * Math.abs(1 / d - 1 / IV_FOCUS) * Math.pow(IV_CAM.z, 0.6) * (d < IV_FOCUS ? 1.6 : 1); }
// layers: [{ d, draw(), blur? }] back to front. A blurred layer is drawn at half resolution (it is soft anyway).
function ivStage(layers) {
  const main = ctx;
  layers.forEach((L, i) => {
    const bl = L.blur ?? ivBlurFor(L.d);
    IV_LAYER_D = L.d;
    if (bl < 0.8) { main.save(); main.setTransform(...ivLayerXf(L.d)); L.draw(); main.restore(); return; }
    const k = 0.5, c = ivCanvas(i, W * k, H * k), g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.setTransform(...ivLayerXf(L.d, k));
    ctx = g; L.draw(); ctx = main;
    main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.filter = `blur(${(bl * k).toFixed(1)}px)`;
    main.drawImage(c, 0, 0, W, H); main.filter = 'none'; main.restore();
  });
  IV_LAYER_D = 1;
}
// a push-in: z grows by amt over dur seconds from t0, eased out, then stops (the guide: 3% over < 2 s)
const ivPush = (t0, amt = 0.03, dur = 1.8) => 1 + amt * EZ.o3(clamp((TT - t0) / dur));

// ---------------------------------------------------------------------
//  the film: grade, vignette, grain, cinema bars (after every frame)
// ---------------------------------------------------------------------
let IV_GRAIN = null;
function ivGrainTiles() {
  if (IV_GRAIN) return IV_GRAIN;
  IV_GRAIN = [0, 1, 2, 3].map((k) => {
    const c = document.createElement('canvas'); c.width = 480; c.height = 270; const g = c.getContext('2d');
    const im = g.createImageData(480, 270), r = RNG('grain', k).f;
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); return c;
  });
  return IV_GRAIN;
}
function ivPost(o = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (IV_M.tint) { ctx.fillStyle = IV_M.tint; ctx.fillRect(0, 0, W, H); }
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(5,3,10,${IV_M.vig ?? 0.5})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const gt = ivGrainTiles()[mod(F, 4)];
  ctx.globalAlpha = 0.085; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = true;
  if (gt instanceof HTMLCanvasElement) ctx.drawImage(gt, (F * 37) % 7 - 7, (F * 53) % 5 - 5, W + 14, H + 10);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (o.bars !== false) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, IV.bar); ctx.fillRect(0, H - IV.bar, W, IV.bar); }
  ctx.restore();
}

// =====================================================================
//  the stick person
//  ivMan({ who, x, y, h, f, pose, expr, talk, look, ghost, armsFront, hold })
//    who   a cast entry: { key, top: 'hoodie'|'tee'|'jacket'|'suit'|'uniform'|'cardigan'|'coat'|'vest', col, col2, hair, hat, glasses }
//    x, y  the point between the feet on the ground; h the full height in px (at the focus plane)
//    f     facing -1..1 (0 = to camera, ±1 = profile). pose: from ivPose(...); expr: { eyes, mouth, brow }
//    talk  a VOICE line id: the mouth moves on its words.  ghost: draw as the 10-seconds-ahead ghost
// =====================================================================
const IV_J = { headY: 0.85, R: 0.125, shY: 0.685, hipY: 0.45, sw: 0.066, hw: 0.034, ua: 0.17, fa: 0.165, th: 0.232, sh: 0.232, lw: 0.034 };
function ivIK(ax, ay, bx, by, l1, l2, bend) {
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1e-6;
  const dm = Math.min(d, (l1 + l2) * 0.999), a = Math.atan2(dy, dx);
  const ca = clamp((l1 * l1 + dm * dm - l2 * l2) / (2 * l1 * dm), -1, 1), ang = a + bend * Math.acos(ca);
  return { ex: ax + Math.cos(ang) * l1, ey: ay + Math.sin(ang) * l1, bx: ax + (dx / d) * dm, by: ay + (dy / d) * dm };
}
// poses: hand targets relative to the shoulder, foot targets relative to the hip, in units of h (y down).
// lean: torso angle (rad, + = forward); dip: hip drop (units of h); tilt: head tilt (rad)
const IV_POSES = {
  stand:   { hL: [-0.03, 0.29], hR: [0.03, 0.29], fL: [-0.05, 0.45], fR: [0.05, 0.45] },
  relaxed: { hL: [-0.05, 0.28], hR: [0.06, 0.27], fL: [-0.06, 0.45], fR: [0.07, 0.45] },
  hips:    { hL: [-0.11, 0.2], hR: [0.11, 0.2], fL: [-0.07, 0.45], fR: [0.07, 0.45], bendL: 1, bendR: -1 },
  shrug:   { hL: [-0.17, 0.1], hR: [0.17, 0.1], fL: [-0.05, 0.45], fR: [0.05, 0.45], bendL: 1, bendR: -1 },
  reach:   { hL: [-0.03, 0.28], hR: [0.3, -0.02], fL: [-0.06, 0.45], fR: [0.08, 0.45], lean: 0.08 },
  point:   { hL: [-0.03, 0.29], hR: [0.31, -0.04], fL: [-0.05, 0.45], fR: [0.06, 0.45] },
  wave:    { hL: [-0.03, 0.29], hR: [0.16, -0.24], fL: [-0.05, 0.45], fR: [0.05, 0.45] },
  catchUp: { hL: [-0.03, 0.29], hR: [0.12, -0.27], fL: [-0.06, 0.45], fR: [0.06, 0.45], tilt: -0.12 },
  phone:   { hL: [-0.03, 0.29], hR: [0.08, 0.1], fL: [-0.05, 0.45], fR: [0.05, 0.45], tilt: 0.18 },
  phoneUp: { hL: [0.06, 0.14], hR: [0.16, -0.02], fL: [-0.05, 0.45], fR: [0.06, 0.45] },
  think:   { hL: [0.03, 0.18], hR: [0.11, -0.06], fL: [-0.05, 0.45], fR: [0.05, 0.45], tilt: 0.1 },
  arms:    { hL: [0.12, 0.12], hR: [-0.12, 0.13], fL: [-0.06, 0.45], fR: [0.06, 0.45] },   // arms crossed
  handsUp: { hL: [-0.15, -0.22], hR: [0.15, -0.22], fL: [-0.07, 0.45], fR: [0.07, 0.45] },
  duck:    { hL: [-0.12, -0.08], hR: [0.1, -0.1], fL: [-0.1, 0.33], fR: [0.12, 0.33], lean: 0.35, dip: 0.07 },
  sit:     { hL: [0.08, 0.24], hR: [0.14, 0.23], fL: [0.17, 0.3], fR: [0.21, 0.3], dip: 0.14, seat: true },
  sitDesk: { hL: [0.2, 0.17], hR: [0.25, 0.16], fL: [0.17, 0.3], fR: [0.21, 0.3], dip: 0.14, seat: true, lean: 0.12 },
  drive:   { hL: [0.25, 0.08], hR: [0.29, 0.06], fL: [0.2, 0.3], fR: [0.24, 0.29], dip: 0.14, seat: true, lean: 0.06 },
  slump:   { hL: [0.12, 0.2], hR: [0.16, 0.2], fL: [0.17, 0.3], fR: [0.21, 0.3], dip: 0.15, seat: true, lean: 0.28, tilt: 0.25 },
  fallen:  { hL: [-0.2, 0.05], hR: [0.25, 0.12], fL: [0.3, 0.05], fR: [0.36, 0.1], lean: 1.35, dip: 0.3 },
  grab:    { hL: [-0.03, 0.29], hR: [0.27, -0.12], fL: [-0.12, 0.38], fR: [0.1, 0.45], lean: -0.15 },
  hug:     { hL: [0.2, 0.1], hR: [0.24, 0.08], fL: [-0.04, 0.45], fR: [0.07, 0.45], lean: 0.08 },
  handOut: { hL: [-0.03, 0.29], hR: [0.25, 0.1], fL: [-0.05, 0.45], fR: [0.06, 0.45] },
};
function ivPose(name, mix = {}) { return { ...IV_POSES.stand, ...(IV_POSES[name] || {}), ...mix }; }
const ivPoseMix = (a, b, u) => { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k] ?? b[k], y = b[k] ?? a[k]; o[k] = Array.isArray(x) ? [lerp(x[0], y[0], u), lerp(x[1], y[1], u)] : typeof x === 'number' ? lerp(x, y, u) : (u < 0.5 ? x : y); } return o; };

// walking with planted feet: 5 frames a step (brisk). Returns { x, pose } for an actor walking from x0 at t0, dir ±1
function ivWalk(t0, x0, h, dir = 1, framesPerStep = 5, until = 1e9) {
  const stepT = framesPerStep / FPS, S = h * 0.26, u = Math.max(0, Math.min(TT, until) - t0) / stepT;
  const n = Math.floor(u), p = u - n, x = x0 + dir * S * u;
  const Xn = x0 + dir * S * (n + 0.5);
  const stance = (Xn - x) / h, swing = (lerp(Xn - dir * S, Xn + dir * S, EZ.io(p)) - x) / h, lift = Math.sin(Math.PI * p) * 0.05;
  const a = n % 2 === 0, sw = Math.sin(Math.PI * (p + n)) * 0.09 * dir;
  const pose = ivPose('stand', {
    fL: a ? [stance, 0.45] : [swing, 0.45 - lift], fR: a ? [swing, 0.45 - lift] : [stance, 0.45],
    hL: [-0.02 + (a ? sw : -sw), 0.28], hR: [0.02 + (a ? -sw : sw), 0.28], lean: 0.05 * dir, bob: Math.abs(Math.cos(Math.PI * p)) * 0.012,
  });
  return { x, pose, moving: TT < until && TT >= t0 };
}

// the mouth on a VOICE line: 0 closed .. 1 open, syllable-ish on each word
function ivTalk(id) {
  if (!id || typeof VOICE === 'undefined') return 0;
  const L = VOICE.lines.find((l) => l.id === id); if (!L || TT < L.t0 || TT > L.t1) return 0;
  for (const w of L.words || []) if (TT >= w.t0 && TT <= w.t1) { const syl = Math.max(1, Math.round(w.w.replace(/[^aeiouy]+/gi, ' ').trim().split(' ').length)); return 0.35 + 0.65 * Math.abs(Math.sin(Math.PI * syl * (TT - w.t0) / Math.max(0.05, w.t1 - w.t0))); }
  return 0.1;
}
// blink every 3.5–4 s, 3 frames closed
const ivBlink = (key) => { const h = hash(key) % 1000, P = Math.round(FPS * (3.5 + (h % 10) / 20)); return mod(F + h, P) < 3; };

// ---------------------------------------------------------------------
//  ivMan: body, clothes, head, face, hands. Drawn twice: a rim pass (the silhouette in the mood's rim colour,
//  nudged toward the key light) and the body pass on top. Ghosts go through an offscreen and composite translucent.
// ---------------------------------------------------------------------
function ivMan(o) {
  if (o.ghost) return ivGhost(() => ivMan({ ...o, ghost: false, _ghost: true }), o.ghostA ?? 0.5);
  const who = o.who || {}, h = o.h, f = clamp(o.f ?? 0.45, -1, 1), s = f < 0 ? -1 : 1, af = Math.abs(f);
  const P = o.pose || IV_POSES.stand, J = IV_J;
  const lean = (P.lean || 0) + (o.lean || 0), tilt = P.tilt || 0, dip = (P.dip || 0) + (P.bob || 0);
  const hip = [o.x + (P.dx || 0) * h, o.y - h * (J.hipY - dip)];
  const up = (a, L) => [Math.sin(a) * s * L, -Math.cos(a) * L];
  const shC = [hip[0] + up(lean, (J.shY - J.hipY) * h)[0], hip[1] + up(lean, (J.shY - J.hipY) * h)[1]];
  const hd = [shC[0] + up(lean + tilt * 0.6, (J.headY - J.shY) * h)[0], shC[1] + up(lean + tilt * 0.6, (J.headY - J.shY) * h)[1]];
  const R = J.R * h * (who.head || 1), sw = J.sw * h * (1 - 0.55 * af) * (who.build || 1), lw = J.lw * h;
  const shL = [shC[0] - sw * s, shC[1] + h * 0.004], shR = [shC[0] + sw * s, shC[1] - h * 0.004];
  const hipL = [hip[0] - J.hw * h * s * (1 - 0.5 * af), hip[1]], hipR = [hip[0] + J.hw * h * s * (1 - 0.5 * af), hip[1]];
  const tgt = (base, v) => [base[0] + v[0] * s * h, base[1] + v[1] * h];
  const gY = o.y;
  const foot = (base, v) => { const p = tgt(base, v); if (!P.seat && !o.air) p[1] = Math.min(p[1], gY); return p; };
  const armL = ivIK(...shL, ...tgt(shL, P.hL), J.ua * h, J.fa * h, (P.bendL ?? 1) * s);
  const armR = ivIK(...shR, ...tgt(shR, P.hR), J.ua * h, J.fa * h, (P.bendR ?? 1) * s);
  const legL = ivIK(...hipL, ...foot(hipL, P.fL), J.th * h, J.sh * h, -s);
  const legR = ivIK(...hipR, ...foot(hipR, P.fR), J.th * h, J.sh * h, -s);
  const sc = ctx.getTransform().a, pxR = R * sc;
  const handMode = o.hands || (pxR < 34 ? 'nub' : pxR < 105 ? 'mitten' : 'glove');
  const rw = Math.max(1.6 / sc, h * 0.009), k = IV_M.key, ghost = !!o._ghost;
  const top = who.top || 'tee', col = who.col || '#c0392b', col2 = who.col2 || ivShade(col, -0.35);
  const long = !['tee', 'vest'].includes(top), sleeveW = (top === 'hoodie' || top === 'coat' || top === 'suit' ? 1.75 : 1.55) * lw;
  const pass = (mode) => {
    const rim = mode === 'rim', C = (c) => (rim ? IV_M.rim : c), Wd = (w) => w + (rim ? rw * 2 : 0);
    ctx.save(); if (rim) ctx.translate(k[0] * rw * 0.9, k[1] * rw * 0.9);
    const arm = (sh, A, hand, side) => {
      ivLine(sh[0], sh[1], A.ex, A.ey, Wd(lw), C(IV.ink)); ivLine(A.ex, A.ey, A.bx, A.by, Wd(lw), C(IV.ink));
      if (top !== 'none') { ivLine(sh[0], sh[1], A.ex, A.ey, Wd(sleeveW), C(col)); if (long) ivLine(A.ex, A.ey, lerp(A.ex, A.bx, 0.86), lerp(A.ey, A.by, 0.86), Wd(sleeveW * 0.92), C(col)); }
      const gr = o.grip || {}, hd2 = o.hold || {}, hf = hd2[hand] || hd2[side];
      ivHand(A.bx, A.by, Math.atan2(A.by - A.ey, A.bx - A.ex), h, handMode, gr[hand] || gr[side] || 'open', C, Wd, s);
      if (!rim && hf) hf(A.bx, A.by, Math.atan2(A.by - A.ey, A.bx - A.ex), h);
    };
    const leg = (hp, L) => { const c = C(who.pants || IV.ink); ivLine(hp[0], hp[1], L.ex, L.ey, Wd(lw * 1.08), c); ivLine(L.ex, L.ey, L.bx, L.by, Wd(lw * 1.05), c);
      ivLine(L.bx, L.by, L.bx + s * lw * 0.9, L.by, Wd(lw * 1.05), C(who.shoes || IV.ink)); };
    const back = af > 0.25 && !o.armsFront;
    if (back) arm(shL, armL, 'L', 'back');
    leg(hipL, legL); leg(hipR, legR);
    // hood behind the head
    if (top === 'hoodie') { ctx.beginPath(); ctx.ellipse(hd[0] - s * R * 0.25 * af, hd[1] + R * 0.45, R * 0.92, R * 0.7, 0, 0, TAU); ctx.fillStyle = C(col2); ctx.fill(); }
    // torso
    ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean * s);
    const tH = (J.shY - J.hipY) * h, tw = sw + sleeveW * 0.42, bw = J.hw * h + h * (top === 'coat' ? 0.075 : 0.05) * (1 - 0.35 * af);
    const bot = top === 'coat' ? h * 0.12 : h * 0.035;
    ctx.beginPath(); ctx.moveTo(-tw, -tH + lw * 0.2); ctx.quadraticCurveTo(0, -tH - lw * 0.9, tw, -tH + lw * 0.2);
    ctx.lineTo(bw, bot); ctx.quadraticCurveTo(0, bot + lw * 0.5, -bw, bot); ctx.closePath();
    ctx.fillStyle = C(top === 'none' ? IV.ink : col); ctx.fill();
    if (rim) { ctx.lineWidth = rw * 2; ctx.strokeStyle = C(col); ctx.stroke(); }
    if (!rim) ivClothes(top, who, tw, tH, bw, bot, lw, s, af, col, col2);
    ctx.restore();
    // neck + head
    ivLine(shC[0], shC[1], hd[0], hd[1], Wd(lw), C(IV.ink));
    if (who.hair) ivHair(who.hair, hd, R, s, af, C, Wd, true);
    ctx.beginPath(); ctx.arc(hd[0], hd[1], R + (rim ? rw : 0), 0, TAU); ctx.fillStyle = C(IV.ink); ctx.fill();
    if (who.hair) ivHair(who.hair, hd, R, s, af, C, Wd, false);
    if (!rim) ivFace(hd, R, f, o.expr || {}, o, who);
    if (who.hat) ivHat(who.hat, hd, R, s, af, C, rim, who);
    arm(shR, armR, 'R', 'front');
    if (!back) arm(shL, armL, 'L', 'front');
    ctx.restore();
  };
  if (!ghost) pass('rim');
  pass('body');
  return { head: hd, R, hip, handL: [armL.bx, armL.by], handR: [armR.bx, armR.by], sh: shC };
}
function ivClothes(top, who, tw, tH, bw, bot, lw, s, af, col, col2) {
  const fr = 1 - af;
  if (top === 'hoodie') {
    ivLine(-tw * 0.95, bot - lw * 0.2, tw * 0.95, bot - lw * 0.2, lw * 0.5, col2, 'butt');
    if (fr > 0.2) { ivLine(-lw * 0.5 * fr, -tH + lw * 0.6, -lw * 0.7 * fr, -tH + lw * 3.2, lw * 0.22, IV.eye); ivLine(lw * 0.5 * fr, -tH + lw * 0.6, lw * 0.7 * fr, -tH + lw * 3.4, lw * 0.22, IV.eye);
      ctx.beginPath(); ctx.roundRect(-tw * 0.5, -tH * 0.42, tw, tH * 0.32, lw * 0.4); ctx.strokeStyle = col2; ctx.lineWidth = lw * 0.25; ctx.stroke(); }
  } else if (top === 'suit') {
    ivPoly([[-lw * 0.9, -tH], [lw * 0.9, -tH], [0, -tH * 0.45]], who.shirt || '#eef0f4');
    ivLine(0, -tH + lw * 0.3, 0, -tH * 0.5, lw * 0.45, who.tie || '#b8323a', 'butt');
    ivLine(-lw * 1.0, -tH, -lw * 0.1, -tH * 0.42, lw * 0.25, col2); ivLine(lw * 1.0, -tH, lw * 0.1, -tH * 0.42, lw * 0.25, col2);
  } else if (top === 'uniform') {
    ivPoly([[-lw * 1.1, -tH], [0, -tH + lw * 1.2], [lw * 1.1, -tH]], col2);
    ivDot(s * tw * 0.45, -tH * 0.62, lw * 0.32, '#f2c14e');
    ivLine(0, -tH + lw * 1.2, 0, bot, lw * 0.12, col2);
  } else if (top === 'jacket') {
    ivPoly([[-lw * 0.7, -tH], [lw * 0.7, -tH], [lw * 0.35, bot], [-lw * 0.35, bot]], who.shirt || '#2b2a33');
  } else if (top === 'cardigan') {
    ivLine(0, -tH + lw, 0, bot, lw * 0.18, col2); for (let i = 0; i < 3; i++) ivDot(lw * 0.35, -tH * (0.7 - i * 0.25), lw * 0.15, IV.eye);
  } else if (top === 'coat') {
    ivLine(0, -tH + lw, 0, bot, lw * 0.15, col2); ivPoly([[-lw * 0.8, -tH], [lw * 0.8, -tH], [0, -tH * 0.6]], who.shirt || '#3a4a66');
  } else if (top === 'vest') {
    ivPoly([[-tw, -tH], [-lw * 0.6, -tH], [-lw * 0.3, bot], [-bw, bot]], who.col2 || '#f08a24');
    ivPoly([[tw, -tH], [lw * 0.6, -tH], [lw * 0.3, bot], [bw, bot]], who.col2 || '#f08a24');
  }
}

// hands change with shot size: a round nub (wide), a mitten (medium), a five-finger glove (close-up)
// grip: 'open' | 'fist' | 'point' | 'hold' (fingers curled round something) | 'flat'
function ivHand(x, y, ang, h, mode, grip, C, Wd, s) {
  const lw = IV_J.lw * h, c = C(IV.ink);
  if (mode === 'nub') { ivDot(x, y, Wd(lw * 1.25) / 2, c); return; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  if (mode === 'mitten') {
    const r = lw * 0.95, ext = Wd(0) / 2;
    ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 1.15 + ext, r * 0.85 + ext, 0, 0, TAU); ctx.fillStyle = c; ctx.fill();
    ctx.beginPath(); ctx.ellipse(r * 0.25, -r * 0.85 * s, r * 0.42 + ext, r * 0.3 + ext, -0.6 * s, 0, TAU); ctx.fill();
    ctx.restore(); return;
  }
  const pr = lw * 0.85, fl = lw * 1.35, fw = lw * 0.48, ext = Wd(0) / 2;
  ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(pr * 0.45, 0, pr * 1.05 + ext, pr * 0.92 + ext, 0, 0, TAU); ctx.fill();
  const finger = (a, len, curl) => {
    const bx = pr * 0.9 + Math.cos(a) * pr * 0.2, by = Math.sin(a) * pr * 0.95;
    const mx = bx + Math.cos(a) * len * 0.55, my = by + Math.sin(a) * len * 0.55;
    const ex = mx + Math.cos(a + curl) * len * 0.5, ey = my + Math.sin(a + curl) * len * 0.5;
    ctx.lineWidth = fw + ext * 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
  };
  const spread = [-0.42, -0.14, 0.14, 0.4];
  spread.forEach((a, i) => {
    let len = fl * (i === 0 || i === 3 ? 0.82 : 1), curl = 0;
    if (grip === 'fist') { len *= 0.55; curl = 1.9 * s; }
    else if (grip === 'hold') { curl = 1.35 * s; len *= 0.85; }
    else if (grip === 'point') { if (i !== 0) { len *= 0.55; curl = 1.9 * s; } }
    else if (grip === 'flat') a *= 0.3;
    finger(a * s * (grip === 'flat' ? 0.5 : 1), len, curl);
  });
  // thumb
  const ta = (grip === 'fist' || grip === 'hold' ? -1.0 : -1.25) * s;
  ctx.lineWidth = fw * 1.1 + ext * 2; ctx.beginPath(); ctx.moveTo(pr * 0.3, -pr * 0.5 * s);
  ctx.lineTo(pr * 0.3 + Math.cos(ta) * fl * 0.7, -pr * 0.5 * s + Math.sin(ta) * fl * 0.7); ctx.stroke();
  ctx.restore();
}

// the face: cream eyes and mouth on the black head. expr: { eyes, mouth, brow, look:[x,y] }
// eyes: open | happy | wide | squint | angry | sad | closed | tired | dots    mouth: smile | grin | flat | o | frown | open | smirk | none
function ivFace(hd, R, f, e, o, who) {
  const key = (who.key || 'x') + (o.blinkKey || '');
  let eyes = e.eyes || 'open'; const mouth = e.mouth || 'flat', look = e.look || [0, 0];
  if (eyes !== 'happy' && eyes !== 'closed' && !o.noBlink && ivBlink(key)) eyes = 'closed';
  const af = Math.abs(f), s = f < 0 ? -1 : 1;
  const cx = hd[0] + f * R * 0.42 + look[0] * R * 0.08, cy = hd[1] - R * 0.06 + look[1] * R * 0.08;
  const sp = R * 0.38 * (1 - 0.42 * af), ew = R * 0.17, eh = R * 0.25;
  const list = af > 0.82 ? [[cx + s * sp * 0.25, 1]] : [[cx - sp, -1], [cx + sp, 1]];
  for (const [ex, side] of list) {
    const w = ew * (side * s < 0 ? 1 - 0.3 * af : 1);
    ctx.fillStyle = IV.eye; ctx.strokeStyle = IV.eye; ctx.lineCap = 'round';
    if (eyes === 'closed') { ivLine(ex - w, cy + eh * 0.2, ex + w, cy + eh * 0.2, R * 0.065, IV.eye); continue; }
    if (eyes === 'happy') { ctx.lineWidth = R * 0.075; ctx.beginPath(); ctx.arc(ex, cy + eh * 0.3, w * 1.05, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); continue; }
    if (eyes === 'dots') { ivDot(ex, cy, R * 0.07, IV.eye); continue; }
    const k = eyes === 'wide' ? 1.3 : 1;
    ctx.beginPath(); ctx.ellipse(ex, cy, w * k, eh * k, 0, 0, TAU); ctx.fill();
    if (eyes === 'wide') ivDot(ex + look[0] * w * 0.4, cy + look[1] * eh * 0.3, w * 0.5, IV.ink);
    // lids: an ink polygon over the eye
    const lid = (y0, y1) => ivPoly([[ex - w * 1.5, cy - eh * 1.6], [ex + w * 1.5, cy - eh * 1.6], [ex + w * 1.5, cy + y1], [ex - w * 1.5, cy + y0]], IV.ink);
    const inner = side < 0 ? 1 : -1;   // +1: the inner corner is on the right of this eye
    if (eyes === 'squint') lid(-eh * 0.05, -eh * 0.05);
    else if (eyes === 'tired') lid(-eh * 0.25, -eh * 0.25);
    else if (eyes === 'angry') lid(inner > 0 ? -eh * 0.75 : -eh * 0.05, inner > 0 ? -eh * 0.05 : -eh * 0.75);
    else if (eyes === 'sad') lid(inner > 0 ? -eh * 0.05 : -eh * 0.7, inner > 0 ? -eh * 0.7 : -eh * 0.05);
    if (e.brow) {
      const by = cy - eh * 1.45, bw = w * 1.1; let a = 0;
      if (e.brow === 'angry') a = 0.38 * -side; else if (e.brow === 'sad') a = -0.35 * -side; else if (e.brow === 'up') a = 0;
      const lift = e.brow === 'up' ? -eh * 0.35 : 0;
      ctx.save(); ctx.translate(ex, by + lift); ctx.rotate(a); ivLine(-bw, 0, bw, 0, R * 0.07, IV.eye); ctx.restore();
    }
  }
  // mouth
  const mx = hd[0] + f * R * 0.48, my = hd[1] + R * 0.42, mw = R * 0.24 * (1 - 0.3 * af);
  const tk = o.talk ? ivTalk(o.talk) : 0;
  ctx.fillStyle = IV.eye; ctx.strokeStyle = IV.eye; ctx.lineWidth = R * 0.065; ctx.lineCap = 'round';
  if (tk > 0.12) { ctx.beginPath(); ctx.ellipse(mx, my, mw * (0.75 + tk * 0.25), R * (0.04 + tk * 0.12), 0, 0, TAU); ctx.fill(); return; }
  ctx.beginPath();
  if (mouth === 'smile') { ctx.arc(mx, my - R * 0.12, mw, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  else if (mouth === 'grin') { ctx.moveTo(mx - mw * 1.1, my - R * 0.03); ctx.quadraticCurveTo(mx, my + R * 0.32, mx + mw * 1.1, my - R * 0.03); ctx.closePath(); ctx.fill(); }
  else if (mouth === 'frown') { ctx.arc(mx, my + R * 0.16, mw * 0.85, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke(); }
  else if (mouth === 'o') { ctx.ellipse(mx, my, R * 0.075, R * 0.1, 0, 0, TAU); ctx.fill(); }
  else if (mouth === 'open') { ctx.ellipse(mx, my, mw * 0.85, R * 0.13, 0, 0, TAU); ctx.fill(); }
  else if (mouth === 'smirk') { ctx.moveTo(mx - mw * 0.7, my); ctx.quadraticCurveTo(mx + mw * 0.3, my + R * 0.04, mx + mw * 0.9, my - R * 0.1); ctx.stroke(); }
  else if (mouth !== 'none') { ctx.moveTo(mx - mw * 0.75, my); ctx.lineTo(mx + mw * 0.75, my); ctx.stroke(); }
  if (who.glasses) { ctx.lineWidth = R * 0.045; for (const [ex] of list) { ctx.beginPath(); ctx.arc(ex, cy, ew * 1.55, 0, TAU); ctx.stroke(); } if (list.length > 1) ivLine(list[0][0] + ew * 1.55, cy, list[1][0] - ew * 1.55, cy, R * 0.04, IV.eye); }
}
function ivHair(kind, hd, R, s, af, C, Wd, behind) {
  const c = C(IV.ink); const ext = Wd(0) / 2;
  if (kind === 'puffs' && behind) { ivDot(hd[0] - R * 0.78, hd[1] - R * 0.6, R * 0.48 + ext, c); ivDot(hd[0] + R * 0.78, hd[1] - R * 0.6, R * 0.48 + ext, c); }
  if (kind === 'bun' && behind) { ivDot(hd[0] - s * R * 0.35, hd[1] - R * 1.0, R * 0.38 + ext, c); }
  if (kind === 'pony' && behind) { ctx.beginPath(); ctx.ellipse(hd[0] - s * R * 1.05, hd[1] + R * 0.1, R * 0.32 + ext, R * 0.62 + ext, s * 0.4, 0, TAU); ctx.fillStyle = c; ctx.fill(); }
  if (kind === 'tuft' && !behind) { ctx.save(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(hd[0] - R * 0.3, hd[1] - R * 0.9); ctx.lineTo(hd[0] + s * R * 0.1, hd[1] - R * 1.28 - ext); ctx.lineTo(hd[0] + s * R * 0.35, hd[1] - R * 0.92); ctx.fill(); ctx.restore(); }
}
function ivHat(kind, hd, R, s, af, C, rim, who) {
  const ext = rim ? 3 : 0;
  if (kind === 'buscap') {
    ctx.beginPath(); ctx.ellipse(hd[0], hd[1] - R * 0.55, R * 0.98 + ext, R * 0.55 + ext, 0, Math.PI, TAU); ctx.fillStyle = C(who.capCol || '#1f2e4f'); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hd[0] + s * R * 0.62 * (0.4 + af), hd[1] - R * 0.52, R * 0.62 + ext, R * 0.13 + ext, 0, 0, TAU); ctx.fillStyle = C('#111a2e'); ctx.fill();
    if (!rim) ivDot(hd[0] + s * R * 0.2 * af, hd[1] - R * 0.85, R * 0.12, '#f2c14e');
  } else if (kind === 'cap') {
    ctx.beginPath(); ctx.ellipse(hd[0], hd[1] - R * 0.5, R * 1.0 + ext, R * 0.62 + ext, 0, Math.PI, TAU); ctx.fillStyle = C(who.capCol || '#f0c419'); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hd[0] + s * R * 0.7 * (0.3 + af), hd[1] - R * 0.5, R * 0.7 + ext, R * 0.15 + ext, 0, 0, TAU); ctx.fill();
  }
}
// the ghost: anything drawn in fn, ten seconds ahead — a hologram: drawn offscreen with a cyan rim, recoloured
// cyan by luminance (black stays dark, eyes and clothes glow), then screened on with a soft glow and a 1-px jitter
function ivGhost(fn, a = 0.5) {
  const main = ctx, cw = main.canvas.width, ch = main.canvas.height, c = ivCanvas(30, cw, ch), g = c.getContext('2d'), m = ivCanvas(31, cw, ch), gm = m.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cw, ch); g.setTransform(main.getTransform());
  ctx = g; const keepM = IV_M; IV_M = { ...IV_M, rim: '#bff8ff' }; let r; try { r = fn(); } finally { ctx = main; IV_M = keepM; }
  g.setTransform(1, 0, 0, 1, 0, 0);
  gm.setTransform(1, 0, 0, 1, 0, 0); gm.clearRect(0, 0, cw, ch); gm.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'color'; g.fillStyle = IV.ghost; g.fillRect(0, 0, cw, ch);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(40,150,200,0.38)'; g.fillRect(0, 0, cw, ch);
  g.globalCompositeOperation = 'source-over';
  main.save(); main.setTransform(1, 0, 0, 1, 0, 0);
  main.globalCompositeOperation = 'lighter'; main.globalAlpha = a * 0.6; main.filter = 'blur(12px)'; main.drawImage(c, 0, 0); main.filter = 'none';
  main.globalCompositeOperation = 'screen'; main.globalAlpha = a; main.drawImage(c, Math.sin(F * 1.7) * 1.5, 0);
  main.globalAlpha = a * 0.3; main.drawImage(c, -5, 2);
  main.restore(); return r;
}

// =====================================================================
//  graphics: labels pop in over 3 frames, numbers count up and land on the end of their word
// =====================================================================
const ivPop = (t) => (TT < t ? 0 : clamp((TT - t) * FPS / 3));
// a count that lands exactly at t1 (the end of the spoken word), easing out
const ivCount = (t0, t1, a, b) => Math.round(lerp(a, b, EZ.o3(clamp((TT - t0) / Math.max(1 / FPS, t1 - t0)))));
// big title: two lines, cream with a warm glow, a small subtitle under a hairline
function ivTitle(l1, l2, sub, x, y, a = 1, size = 74) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ivText(l1, x, y, size * 0.72, '#fbeedd', { glow: 'rgba(255,170,90,0.55)', track: 3 });
  ivText(l2, x, y + size * 1.02, size * 1.12, '#ffe2b0', { glow: 'rgba(255,150,70,0.7)', track: 2 });
  if (sub) { ivLine(x - size * 4, y + size * 1.36, x + size * 4, y + size * 1.36, 1.5, 'rgba(255,230,200,0.55)'); ivText(sub, x, y + size * 1.72, size * 0.26, 'rgba(255,235,210,0.8)', { weight: 700, track: 5 }); }
  ctx.restore();
}
// a dark rounded tag with cream text (labels on the world)
function ivTag(str, x, y, size = 30, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `800 ${size}px ${IV.font}`; ctx.letterSpacing = '2px';
  const w = ctx.measureText(str).width + size * 1.1, sc = 0.85 + 0.15 * EZ.back(clamp(a));
  ctx.translate(x, y); ctx.scale(sc, sc);
  ivRR(-w / 2, -size * 0.95, w, size * 1.5, size * 0.4, o.bg || 'rgba(14,12,20,0.82)', o.line || 'rgba(255,214,160,0.55)', 2);
  ivText(str, 0, size * 0.1, size, o.c || '#ffe6c4', { track: 2 }); ctx.restore();
}
// the running counter (screen space, bottom-centre, above the bar): rows of [label, value]
function ivCounter(rows, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a;
  const y = o.y ?? H - IV.bar - 70, gap = 330, x0 = W / 2 - (gap * (rows.length - 1)) / 2;
  rows.forEach(([lab, val, hot], i) => {
    const x = x0 + i * gap;
    ivText(lab, x, y - 34, 19, 'rgba(255,236,214,0.78)', { weight: 800, track: 4, font: IV.sans });
    ivText(String(val), x, y + 22, 54, hot ? '#7ff0ff' : '#ffe2b0', { glow: hot ? 'rgba(80,220,255,0.8)' : 'rgba(255,160,80,0.55)' });
  });
  ctx.restore();
}

// =====================================================================
//  STYLE — the renderer's hooks. Ifverse cuts hard and never morphs; window/blob are plain fallbacks.
// =====================================================================
const STYLE = {
  name: 'ifverse',
  paper: '#0c0b10',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { ivMan({ who: { key: 'hero', top: 'hoodie', col: '#d8432f' }, x, y: y + r, h: r * 2 }); },
  heroColor: '#d8432f',
  post() { ivPost(); },
  ones: true,
};

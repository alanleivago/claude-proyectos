// =====================================================================
//  styles/onebit/kit.js — 1-bit manga-horror pixel. Every picture is drawn with smooth canvas paths at a
//  low internal resolution (180x320 = 6 px pixels by default), then each shape is THRESHOLDED to hard pixels
//  in a 4-step grey ramp (black, a near-black, one flat mid grey, white) with ordered-dither and hatch fills,
//  an optional dithered light-falloff pass, and the frame is scaled up nearest-neighbour to 1080x1920.
//  Subtitles: a bold bitmap font drawn in code (2-cell vertical strokes on a 5 px grid), white, black outline,
//  drop shadow and a dithered dark plate, typed on letter by letter.
//  Built on kit/core.js (RNG, EZ, TT/B/E0/DEFER). Needs W, H from the piece head.
//
//  Drawing model: obScene(draw) opens a palette-index buffer (OB.idx) and an "emissive" buffer (OB.emit).
//  Inside, every obMask(fill, fn) call runs fn(g) with canvas paths on an offscreen low-res canvas, thresholds
//  its alpha and writes `fill` (an index 0..3, or a function (x, y) -> index | null) into the buffer, optionally
//  with a 1-pixel rim (all round or only on the lit side). After draw, obScene's `light` option darkens every
//  non-emissive pixel by distance from the lights with Bayer dither: lamps, rims and eye glints stay lit.
// =====================================================================

// ---- the palette (measured from the references: #000000, #2b2b2b, #8e8e8e, #fdfdfd)
const OB_PAL = ['#000000', '#2b2b2b', '#8e8e8e', '#fdfdfd'];
const OB_RGB = OB_PAL.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
const K = 0, DK = 1, GR = 2, WH = 3;   // palette indexes: ink, night, wall grey, paper white

// ---- ordered dither (4x4 Bayer)
const OB_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const obBayer = (x, y) => OB_BAYER[((y & 3) << 2) | (x & 3)];

// ---- state of the current low-res scene
const OB = { w: 180, h: 320, G: 6, idx: null, emit: null, cam: null, pre: null };
const OB_CV = new Map();
function obCanvas(tag, w, h) {
  const k = tag + w + 'x' + h;
  if (!OB_CV.has(k)) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); OB_CV.set(k, c); }
  return OB_CV.get(k);
}

// draw(w, h) fills OB.idx through obMask calls; then the light pass, then the buffer is upscaled with hard pixels.
// o: w, h (internal size, must divide 1080x1920; default 180x320), bg (index), cam { z, x, y } (a push-in about low-res
//    point x, y that keeps the pixel grid fixed), shake [dx, dy] whole low-res pixels, map (remap the ramp),
//    light { amb, lights: [{ x, y, r0, r1, p, sx, sy }] } (dithered falloff; emissive pixels are skipped)
function obScene(draw, o = {}) {
  const w = o.w ?? 180, h = o.h ?? 320;
  Object.assign(OB, { w, h, G: W / w, cam: o.cam || null, pre: null, idx: new Uint8Array(w * h).fill(o.bg ?? GR), emit: new Uint8Array(w * h) });
  draw(w, h);
  if (o.light) obLightPass(o.light);
  const c = obCanvas('scene', w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, I = OB.idx;
  const sx = Math.round(o.shake?.[0] ?? 0), sy = Math.round(o.shake?.[1] ?? 0), map = o.map || [0, 1, 2, 3];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const xs = clamp(x - sx, 0, w - 1), ys = clamp(y - sy, 0, h - 1), p = OB_RGB[map[I[ys * w + xs]]], k = (y * w + x) * 4;
    d[k] = p[0]; d[k + 1] = p[1]; d[k + 2] = p[2]; d[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, w, h, 0, 0, W, H); ctx.restore();
}
// the light pass: tone v becomes floor(v * L + bayer), never brighter than v. L = amb .. 1 by distance to the nearest light.
function obLightPass(L) {
  const { w, h, idx, emit } = OB, lights = L.lights || [], amb = L.amb ?? 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (emit[i]) continue; const v = idx[i]; if (!v) continue;
    let l = amb;
    for (const q of lights) {
      const d = Math.hypot((x - q.x) / (q.sx ?? 1), (y - q.y) / (q.sy ?? 1)), f = clamp(1 - (d - q.r0) / (q.r1 - q.r0));
      l = Math.max(l, amb + (1 - amb) * f ** (q.p ?? 1));
    }
    idx[i] = Math.min(v, Math.floor(v * l + obBayer(x, y)));
  }
}

// the threshold pass: fn(g) draws paths in white on a clear low-res canvas; pixels whose coverage beats thr get `fill`.
// o: thr (0..1, default 0.5), rim (index: a 1-pixel ring just outside the shape, 4-neighbour; rim8 for 8-neighbour),
//    rimDir [dx, dy] (only the ring on that side: the side a light comes from), emit / rimEmit (mark as emissive: the
//    light pass leaves them), lw (default lineWidth), noCam (ignore the push-in), noPre (ignore a figure's roll)
function obMask(fill, fn, o = {}) {
  const { w, h } = OB, t = obCanvas('mask', w, h), g = t.getContext('2d', { willReadFrequently: true });
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
  if (OB.cam && !o.noCam) { const { z, x, y } = OB.cam; g.setTransform(z, 0, 0, z, x - z * x, y - z * y); }
  if (OB.pre && !o.noPre) OB.pre(g);
  g.fillStyle = g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = o.lw ?? 1; g.globalAlpha = 1;
  g.save(); fn(g); g.restore();
  const a = g.getImageData(0, 0, w, h).data, thr = (o.thr ?? 0.5) * 255, M = new Uint8Array(w * h), I = OB.idx, E = OB.emit;
  for (let i = 0; i < w * h; i++) M[i] = a[i * 4 + 3] > thr ? 1 : 0;
  if (o.rim != null) {
    const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && M[yy * w + xx];
    const dx = Math.sign(o.rimDir?.[0] ?? 0), dy = Math.sign(o.rimDir?.[1] ?? 0);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (M[i]) continue;
      let hit;
      if (o.rimDir) hit = (dx && n(x - dx, y)) || (dy && n(x, y - dy)) || (dx && dy && n(x - dx, y - dy));
      else hit = n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1) || (o.rim8 && (n(x - 1, y - 1) || n(x + 1, y - 1) || n(x - 1, y + 1) || n(x + 1, y + 1)));
      if (hit) { I[i] = o.rim; if (o.rimEmit) E[i] = 1; }
    }
  }
  const f = typeof fill === 'function';
  if (f || fill >= 0) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!M[i]) continue;
    const v = f ? fill(x, y) : fill; if (v != null && v >= 0) { I[i] = v; E[i] = o.emit ? 1 : 0; }
  }
  return M;
}
// ---- fills
const obDith = (a, b, d) => (x, y) => (d > obBayer(x, y) ? b : a);                       // b over a at density d (a = -1: leave)
const obDithF = (a, b, fd) => (x, y) => (fd(x, y) > obBayer(x, y) ? b : a);              // density from a function
const obHatchF = (ink, ang = 45, sp = 3, bg = null, ph = 0) => {                         // parallel 1-px hatching
  const c = Math.cos(ang * DEG), s = Math.sin(ang * DEG);
  return (x, y) => (mod(Math.round(x * c + y * s) + ph, sp) === 0 ? ink : bg);
};
const obCrossF = (ink, sp = 3, bg = null) => (x, y) => (mod(x + y, sp) === 0 || mod(x - y, sp) === 0 ? ink : bg);
// ---- path helpers (on the mask canvas g)
function obEll(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
function obPoly(g, P, close = true) { g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); }
function obPolyAdd(g, P) { P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
function obCurve(g, P) {   // a smooth open curve through P (quadratic midpoints)
  g.beginPath(); g.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) { const m = [(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2]; g.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); }
  const L = P[P.length - 1]; g.lineTo(L[0], L[1]);
}
// Catmull-Rom: densify an open (or closed) point list into a smooth polyline
function obCR(P, n = 6, closed = false) {
  const out = [], N = P.length, at = (i) => (closed ? P[mod(i, N)] : P[clamp(i, 0, N - 1)]);
  const last = closed ? N : N - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  if (!closed) out.push(P[N - 1]);
  return out;
}
// a point at fraction t of a polyline's length, with its unit tangent
function obAlong(Pl, t) {
  const d = [0]; for (let i = 1; i < Pl.length; i++) d.push(d[i - 1] + dist(Pl[i - 1], Pl[i]));
  const L = d[d.length - 1], tg = clamp(t) * L; let i = 1; while (i < Pl.length - 1 && d[i] < tg) i++;
  const a = Pl[i - 1], b = Pl[i], k = (tg - d[i - 1]) / ((d[i] - d[i - 1]) || 1), m = dist(a, b) || 1;
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), tx: (b[0] - a[0]) / m, ty: (b[1] - a[1]) / m, L };
}
// shorthand: a filled shape and an inked stroke
const obFill = (fill, fn, o) => obMask(fill, (g) => { fn(g); g.fill(); }, o);
const obInk = (fn, lw = 1, ink = K, o = {}) => obMask(ink, (g) => { g.lineWidth = lw; fn(g); g.stroke(); }, { thr: 0.34, ...o });
const obRect = (x, y, w, h, fill, o) => obFill(fill, (g) => { g.beginPath(); g.rect(x, y, w, h); }, o);
const obLine = (P, lw = 1, ink = K, o) => obInk((g) => obPoly(g, P, false), lw, ink, o);
const obSpl = (P, lw = 1, ink = K, o) => obInk((g) => obPoly(g, obCR(P, 6), false), lw, ink, o);
// a region hatched in parallel lines (cast shadow on skin, cheeks, walls)
function obHatch(fn, o = {}) { return obFill(obHatchF(o.ink ?? K, o.ang ?? 45, o.sp ?? 3, o.bg ?? null, o.ph ?? 0), fn, o); }
// a dithered glow (lamp halo): white at density k*(1-d/r)^p around (x, y), emissive so the light pass keeps it
function obGlow(x, y, rx, ry, o = {}) {
  const k = o.k ?? 0.9, p = o.p ?? 1.6;
  obFill(obDithF(-1, o.ink ?? WH, (xx, yy) => k * clamp(1 - Math.hypot((xx - x) / rx, (yy - y) / ry)) ** p), (g) => obEll(g, x, y, rx, ry), { emit: true, noCam: o.noCam });
}

// ---------------------------------------------------------------------
//  hair: a heavy black mass with a white rim and fine strands (gloss lines, separations, flyaways)
// ---------------------------------------------------------------------
function obHairMass(P, o = {}) {
  obFill(K, (g) => obPoly(g, P), { rim: o.rim === -1 ? null : o.rim ?? WH, rim8: true, rimDir: o.rimDir });
  for (const [x0, y0, x1, y1, bend] of o.strands || []) obInk((g) => obCurve(g, [[x0, y0], [(x0 + x1) / 2 + (bend ?? 0), (y0 + y1) / 2], [x1, y1]]), 1, o.gloss ?? GR, { thr: 0.45 });
}

// ---------------------------------------------------------------------
//  the face: a young woman, front-on, bob haircut, ringer t-shirt (head-and-shoulders close-up framing)
//  obPerson(x, y, s, o): (x, y) = the eye line's centre in low-res px, s = half the face's width.
//  o: blink 0..1, stare 0..1 (wide whites, pinpoint pupils, tense lower lids), smile 0..1 (the stretched grin),
//     look [dx, dy] (-1..1), shade 1 | -1 (screen side the shadow falls; the light comes from the other, upper side),
//     roll (radians, about the neck), shirt (index), noBody, glow (dark scene: rim and eye glints emissive),
//     rimDir [dx, dy] (only rim the lit side), key
// ---------------------------------------------------------------------
const shadeInkN = (o) => o.shadowInk ?? GR;
function obPerson(x, y, s, o = {}) {
  const sh = o.shade ?? 1, bl = clamp(o.blink ?? 0), st = clamp(o.stare ?? 0), sm = clamp(o.smile ?? 0);
  const P = (u, v) => [x + u * s, y + v * s];                 // plain face coords (u: half widths, v: down)
  const S = (u, v) => [x + sh * u * s, y + v * s];            // u > 0 = the shadow side
  const pts = (A, f = P) => A.map(([u, v]) => f(u, v));
  const prevPre = OB.pre;
  if (o.roll) { const [px, py] = P(0, 1.7); OB.pre = (g) => { if (prevPre) prevPre(g); g.translate(px, py); g.rotate(o.roll); g.translate(-px, -py); }; }
  const big = s >= 26;   // enough pixels for the fine marks

  // --- shapes
  const R1 = [[0, -1.42], [0.52, -1.33], [0.86, -1.02], [0.98, -0.55], [1.0, -0.1], [0.95, 0.25], [0.9 + 0.05 * sm, 0.5], [0.83 + 0.03 * sm, 0.8], [0.6, 1.08 + 0.03 * sm], [0.3, 1.3 + 0.05 * sm]];
  const faceUV = [...R1, [0, 1.37 + 0.08 * sm], ...R1.slice(1).reverse().map(([u, v]) => [-u, v])];
  const facePts = obCR(pts(faceUV), 5, true);
  const face = (g) => obPoly(g, facePts);
  const backHair = pts([[-1.1, -0.9], [-1.3, -0.2], [-1.38, 0.5], [-1.42, 1.05], [-1.32, 1.45], [-1.18, 1.22], [-1.05, 1.52], [-0.9, 1.24], [-0.7, 1.36], [0.7, 1.36], [0.9, 1.24], [1.05, 1.52], [1.18, 1.22], [1.32, 1.45], [1.42, 1.05], [1.38, 0.5], [1.3, -0.2], [1.1, -0.9]]);
  const neck = pts([[-0.44, 0.9], [-0.48, 1.65], [-0.64, 2.05], [0.64, 2.05], [0.48, 1.65], [0.44, 0.9]]);
  const body = pts([[-0.6, 1.92], [-1.5, 2.18], [-2.25, 2.6], [-2.6, 3.4], [-2.8, 6], [2.8, 6], [2.6, 3.4], [2.25, 2.6], [1.5, 2.18], [0.6, 1.92]]);
  // front hair: a smooth crown, a zigzag fringe, a side lock over the shadow-side cheek, tucked behind the lit-side ear
  const crown = obCR(pts([[-1.08, -0.15], [-1.1, -0.72], [-0.92, -1.14], [-0.55, -1.43], [0, -1.53], [0.55, -1.43], [0.92, -1.14], [1.1, -0.72], [1.12, -0.15]].map(([u, v]) => [u * sh, v])), 5);
  const fringeUV = [[1.18, 0.35], [1.13, 0.98], [0.99, 0.45], [0.9, -0.08], [0.8, -0.45], [0.67, -0.12], [0.55, -0.5], [0.4, -0.2], [0.26, -0.58], [0.07, -0.66], [-0.03, -0.3], [-0.17, -0.62], [-0.42, -0.58], [-0.55, -0.28], [-0.66, -0.6], [-0.85, -0.44], [-0.95, -0.3], [-1.0, -0.15]];
  const frontHair = [...crown, ...pts(fringeUV, S)];
  const sil = (g) => { obPolyAdd(g, backHair); obPolyAdd(g, facePts); obPolyAdd(g, frontHair); if (!o.noBody) { obPolyAdd(g, neck); obPolyAdd(g, body); } };

  // --- back hair
  obHairMass(backHair, { rim: o.glow ? -1 : WH });
  obInk((g) => { for (const [u0, v0, u1, v1] of [[-1.2, 0.0, -1.3, 1.35], [-1.0, 0.3, -1.05, 1.45], [1.2, 0.0, 1.3, 1.35], [1.0, 0.3, 1.05, 1.45]]) { const a = P(u0, v0), b = P(u1, v1); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + s * 0.06 * Math.sign(u0), (a[1] + b[1]) / 2, b[0], b[1]); } }, 1, DK);

  if (!o.noBody) {
    // neck: skin, the head's cast shadow under the jaw, the shadow-side strip hatched, tendons, the notch
    obFill(WH, (g) => obPoly(g, neck));
    obFill(shadeInkN(o), (g) => { obPoly(g, neck); g.clip(); obPoly(g, obCR(pts([[-0.6, 0.9], [-0.5, 1.4], [0, 1.72], [0.5, 1.4], [0.6, 0.9]]), 5)); g.fill(); g.beginPath(); });
    obHatch((g) => { obPoly(g, neck); g.clip(); obPoly(g, pts([[0.22, 0.9], [0.32, 2.1], [1, 2.1], [1, 0.9]], S)); }, { ang: 70, sp: 3 });
    if (big) {
      obSpl(pts([[-0.36, 1.2], [-0.24, 1.6], [-0.1, 1.95]], S), 1, GR);
      obSpl(pts([[0.36, 1.2], [0.24, 1.6], [0.1, 1.95]], S), 1, K);
      if (sm > 0.5) for (const e of [-1, 1]) obSpl(pts([[e * 0.3, 1.5], [e * 0.42, 1.8], [e * 0.55, 2.0]]), 1, K);   // the grin pulls the neck taut
    }
    obLine(pts([[-0.07, 1.92], [0, 2.0], [0.07, 1.92]]), 1, K);
    // shirt: white ringer tee, black collar band, seams and folds, the shadow side hatched
    obFill(o.shirt ?? WH, (g) => obPoly(g, body), { rim: o.glow ? null : WH, rim8: true });
    obHatch((g) => { obPoly(g, body); g.clip(); obPoly(g, pts([[1.25, 2.0], [1.5, 3.2], [1.9, 6], [3, 6], [3, 2]], S)); }, { ang: 60, sp: 3 });
    obInk((g) => obPoly(g, body), 1);
    obFill(K, (g) => { obPoly(g, obCR(pts([[-0.78, 1.9], [-0.5, 2.25], [0, 2.4], [0.5, 2.25], [0.78, 1.9]]), 5).concat(obCR(pts([[0.58, 1.95], [0.4, 2.13], [0, 2.24], [-0.4, 2.13], [-0.58, 1.95]]), 5))); });
    obInk((g) => { for (const e of [-1, 1]) { const a = P(e * 1.75, 2.3), b = P(e * 2.0, 2.9), c = P(e * 2.15, 3.6); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); const d = P(e * 1.0, 3.0), f2 = P(e * 1.15, 4.2); g.moveTo(d[0], d[1]); g.lineTo(f2[0], f2[1]); } }, 1, big ? K : GR);
  }
  // ears (the lit-side ear shows, the hair is tucked behind it)
  for (const e of [-1, 1]) {
    const Q = pts([[0.95, -0.3], [1.13, -0.36], [1.21, -0.08], [1.15, 0.3], [1.03, 0.5], [0.94, 0.32]].map(([u, v]) => [u * e, v]));
    obFill(e === sh ? GR : WH, (g) => obPoly(g, obCR(Q, 4, true)), { rim: K });
    if (big) obSpl(pts([[1.0, -0.22], [1.12, -0.14], [1.1, 0.15], [1.02, 0.3]].map(([u, v]) => [u * e, v])), 1, e === sh ? K : GR);
  }
  // face: skin with an inked edge
  obFill(WH, face, { rim: K });
  // --- form shading (light from the upper -sh side): flat grey planes like the references, hatching only at the deepest edge
  const shadeInk = o.shadowInk ?? GR;
  // the shadow-side plane: temple, cheekbone edge, the hollow under it, jaw to chin
  const plane = pts([[0.66, -1.0], [0.76, -0.55], [0.8, -0.15], [0.72, 0.1], [0.58, 0.4], [0.64, 0.72], [0.48, 1.02], [0.16, 1.3], [0.3, 1.6], [1.4, 1.0], [1.4, -1.4]], S);
  obFill(shadeInk, (g) => { face(g); g.clip(); obPoly(g, obCR(plane, 4, true)); g.fill(); g.beginPath(); });
  obHatch((g) => { face(g); g.clip(); obPoly(g, obCR(plane.map(([a, b]) => [a - sh * 2, b]), 4, true)); g.fill(); g.beginPath(); obPoly(g, obCR(plane.map(([a, b]) => [a + sh * 1, b]), 4, true)); g.globalCompositeOperation = 'destination-out'; g.fill(); }, { ang: 45, sp: 2, ink: shadeInk === K ? GR : K });
  // cheekbone contours: a grey line under each cheekbone, the shadow side longer
  for (const e of [-1, 1]) {
    const shd = e === 1;
    if (big && sm < 0.3) obSpl(pts([[e * 0.86, 0.12], [e * 0.72, 0.3], [e * (shd ? 0.55 : 0.6), 0.36]], S), 1, GR);
  }
  // nose: the shadow-side plane, the cast shadow under it, alar wings, nostrils
  obFill(GR, (g) => obPoly(g, obCR(pts([[0.07, 0.02], [0.12, 0.2], [0.18, 0.42], [0.16, 0.53], [0.07, 0.5]], S), 3, true)));
  obFill(GR, (g) => obPoly(g, obCR(pts([[0.02, 0.64], [0.18, 0.6], [0.24, 0.66], [0.1, 0.7]], S), 3, true)));
  const fl = 1 + 0.4 * sm;
  for (const e of [-1, 1]) {
    obSpl(pts([[e * 0.16 * fl, 0.46], [e * 0.2 * fl, 0.55], [e * 0.11, 0.62]]), 1, e * sh > 0 ? K : (big ? GR : K));
    obFill(K, (g) => { const c = P(e * 0.09 * fl, 0.6); obEll(g, c[0], c[1], Math.max(0.6, s * 0.05 * fl), Math.max(0.6, s * 0.022)); });
  }
  if (big) obLine(pts([[-0.05, 0.47], [0.06, 0.5]]), 1, GR);   // the tip's underside
  // mouth (neutral) or the grin
  if (sm < 0.05) {
    if (big) for (const e of [-1, 1]) obLine(pts([[e * 0.05, 0.7], [e * 0.055, 0.83]]), 1, GR);   // philtrum
    obFill(GR, (g) => obPoly(g, obCR(pts([[-0.32, 0.92], [-0.16, 0.84], [-0.04, 0.86], [0, 0.875], [0.04, 0.86], [0.16, 0.84], [0.32, 0.92], [0.15, 0.935], [0, 0.945], [-0.15, 0.935]]), 3, true)));
    obSpl(pts([[-0.33, 0.925], [-0.15, 0.935], [0, 0.945], [0.15, 0.935], [0.33, 0.92]]), 1, K);
    obSpl(pts([[-0.18, 1.04], [0, 1.065], [0.18, 1.04]]), 1, big ? GR : K);
    if (big) obFill(obHatchF(K, 0, 2), (g) => obPoly(g, obCR(pts([[-0.14, 1.07], [0, 1.1], [0.14, 1.07], [0, 1.13]]), 3, true)));
    if (big) obSpl(pts([[-0.1, 1.2], [0, 1.23], [0.1, 1.2]]), 1, GR);   // the chin's ball
  } else obGrin(P, s, sm, o);
  // eyes
  const lx = clamp(o.look?.[0] ?? 0, -1, 1), ly = clamp(o.look?.[1] ?? 0, -1, 1), ten = Math.max(st * 0.7, sm);
  for (const e of [-1, 1]) {
    const shd = e === sh, cx = x + e * 0.4 * s, ey = y;
    const ew = 0.25 * s, eh = s * 0.105 * (1 + 0.55 * st) * (1 + (e > 0 ? 0.12 * sm : -0.05 * sm));
    const inn = [cx - e * ew, ey + eh * 0.15], out = [cx + e * ew, ey - eh * 0.05];
    const upper = obCR([inn, [cx - e * ew * 0.45, ey - eh * 1.05], [cx + e * ew * 0.3, ey - eh * 1.1], out], 5);
    const lowY = lerp(eh * 0.85, eh * 0.5, ten);
    const lower = obCR([out, [cx + e * ew * 0.35, ey + lowY], [cx - e * ew * 0.35, ey + lowY * 0.95], inn], 5);
    const almond = (g) => obPoly(g, [...upper, ...lower]);
    // the brow
    const by = ey - s * (0.33 + 0.06 * st) - (e > 0 ? 0.04 * sm * s : 0), lift = s * 0.05 * st;
    const bTop = obCR([[cx - e * ew * 1.05, by - s * 0.02 - lift], [cx + e * ew * 0.45, by - s * 0.07], [cx + e * ew * 1.3, by + s * 0.03]], 4);
    const bBot = obCR([[cx + e * ew * 1.3, by + s * 0.045], [cx + e * ew * 0.45, by - s * 0.015], [cx - e * ew * 1.0, by + s * 0.055 - lift]], 4);
    obFill(K, (g) => obPoly(g, [...bTop, ...bBot]));
    // the lid crease (outer two thirds) and a short eye bag
    if (big) obSpl([[cx - e * ew * 0.2, ey - eh * 1.75], [cx + e * ew * 0.4, ey - eh * 1.9], [out[0] + e * s * 0.02, out[1] - eh * 1.15]], 1, shd ? K : GR);
    if (big) obSpl([[cx - e * ew * 0.3, ey + eh * (2.0 - 0.5 * sm)], [cx + e * ew * 0.2, ey + eh * (2.25 - 0.6 * sm)], [cx + e * ew * 0.7, ey + eh * (1.9 - 0.5 * sm)]], 1, GR);
    if (sm > 0.4 && big) {   // the cheeks push the lower lids up: a second crease and crow's feet
      obInk((g) => { for (let i = 0; i < 2; i++) { const a = [out[0] + e * s * 0.06, out[1] + (i * 2 - 1) * eh * 0.6]; g.moveTo(a[0], a[1]); g.lineTo(a[0] + e * s * 0.06, a[1] + (i * 2 - 1) * eh * 0.4); } }, 1, GR);
    }
    if (bl > 0.5) {   // closed: the lid sags to a lash line, lashes pointing down
      obFill(WH, almond);
      obInk((g) => obPoly(g, obCR([inn, [cx, ey + eh * 0.6], out], 5), false), Math.max(1, s * 0.05));
      if (big) obInk((g) => { for (let i = 0; i < 3; i++) { const t = 0.55 + i * 0.18, p = [lerp(inn[0], out[0], t), ey + eh * 0.55 - i * eh * 0.05]; g.moveTo(p[0], p[1]); g.lineTo(p[0] + e * s * 0.03, p[1] + s * 0.05); } }, 1);
      continue;
    }
    obFill(WH, almond, { emit: !!o.glow && false });
    // the iris: grey with a black limbal ring, the lid's shadow over its top, a pupil (a pinpoint when staring), a glint
    const ir = s * 0.118 * (1 - 0.25 * st), icx = cx + lx * ew * 0.4, icy = ey + eh * 0.08 + ly * eh * 0.3;
    obMask(GR, (g) => { almond(g); g.clip(); obEll(g, icx, icy, ir, ir); g.fill(); });
    obMask(K, (g) => { almond(g); g.clip(); obEll(g, icx, icy, ir, ir); g.lineWidth = 1; g.stroke(); });
    obMask(K, (g) => { almond(g); g.clip(); g.beginPath(); g.rect(icx - ir - 1, ey - eh * 1.3, ir * 2 + 2, eh * (0.62 - 0.5 * st)); g.fill(); });
    const pr = Math.max(0.55, ir * 0.45 * (1 - 0.85 * st));
    obFill(K, (g) => obEll(g, icx, icy, pr, pr));
    const gx = Math.round(icx - sh * ir * 0.4), gy = Math.round(icy - ir * 0.45), gs = s > 50 ? 2 : 1;
    obRect(gx, gy, gs, gs, WH, { emit: !!o.glow });
    // the shadow under the upper lid, the heavy lid line thickening outward, lashes, the lower lid
    obMask(GR, (g) => { almond(g); g.clip(); g.lineWidth = 1.4; obPoly(g, upper.map(([a, b]) => [a, b + 1]), false); g.stroke(); }, { thr: 0.4 });
    obInk((g) => obPoly(g, upper, false), Math.max(1, s * 0.045));
    obInk((g) => obPoly(g, upper.slice(Math.floor(upper.length * 0.45)), false), Math.max(1.4, s * 0.075));
    obInk((g) => { const n = big ? 3 : 1; for (let i = 0; i < n; i++) { const p = upper[upper.length - 1 - i * 2]; g.moveTo(p[0], p[1]); g.lineTo(p[0] + e * s * (0.08 - i * 0.015), p[1] - s * (0.05 + i * 0.02)); } }, 1);
    obInk((g) => obPoly(g, lower.slice(0, Math.ceil(lower.length * 0.75)), false), 1, ten > 0.4 || !big ? K : GR);
  }
  // front hair over everything: the mass, separations between locks, gloss on the lit side, stray strands
  obHairMass(frontHair, { rim: -1 });
  if (big) obInk((g) => { for (const [u0, v0, u1, v1] of [[0.5, -1.25, 0.64, -0.2], [-0.15, -1.4, -0.05, -0.38], [0.95, -0.9, 1.1, 0.85]]) { const a = S(u0, v0), b = S(u1, v1); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + sh * s * 0.05, (a[1] + b[1]) / 2, b[0], b[1]); } }, 1, GR);
  obInk((g) => { for (const [u0, v0, u1, v1, b] of [[-0.85, -0.85, -0.3, -1.3, -0.12], [-0.7, -0.6, -0.15, -1.15, -0.1]]) { const a = S(u0, v0), c = S(u1, v1); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + c[0]) / 2 + s * b * sh, (a[1] + c[1]) / 2 + s * b, c[0], c[1]); } }, 1, big ? WH : GR, { emit: !!o.glow, thr: 0.45 });   // gloss on the lit side of the crown
  obInk((g) => { for (const [u0, v0, u1, v1, b] of [[0.1, -0.64, 0.24, -0.12, 0.06], [-0.32, -0.6, -0.4, -0.2, -0.05]]) { const a = S(u0, v0), c = S(u1, v1); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + c[0]) / 2 + s * b, (a[1] + c[1]) / 2, c[0], c[1]); } }, 1, K, { thr: 0.42 });
  // eye glints on top in a dark scene (the only lit thing in the face)
  if (o.glow && bl <= 0.5) for (const e of [-1, 1]) { const gx = Math.round(x + e * 0.4 * s + lx * 0.1 * s), gy = Math.round(y); obRect(gx, gy, s > 30 ? 2 : 1, 1, WH, { emit: true }); obRect(gx + (s > 30 ? 2 : 1), gy, 1, 1, GR, { emit: true }); }
  // the silhouette's rim: all round, or only on the lit side; emissive in a dark scene
  if (o.glow || o.rimDir) obMask(-1, (g) => { sil(g); g.fill(); }, { rim: WH, rimDir: o.rimDir, rim8: !o.rimDir, rimEmit: !!o.glow });
  OB.pre = prevPre;
}

// the grin: corners pulled up and out (unevenly), the opening black, gums, irregular separate teeth in two rows,
// a thin stretched upper lip, a lower lip edge, deep nasolabial folds, bunched cheeks, corner creases
function obGrin(P, s, u, o = {}) {
  const R = RNG('grin', o.key ?? 'g'), big = s >= 26;
  const Lc = P(-0.3 - 0.34 * u, 0.93 - 0.2 * u), Rc = P(0.3 + 0.38 * u, 0.93 - 0.27 * u);
  const top = obCR([Lc, P(-0.18 - 0.2 * u, 0.885 - 0.1 * u), P(0, 0.885 - 0.015 * u), P(0.2 + 0.22 * u, 0.875 - 0.13 * u), Rc], 8);
  const bot = obCR([Rc, P(0.22 + 0.2 * u, 0.96 + 0.07 * u), P(0, 0.99 + 0.2 * u), P(-0.2 - 0.2 * u, 0.97 + 0.08 * u), Lc], 8);
  const mouth = [...top, ...bot], open = (g) => obPoly(g, mouth);
  // folds and cheeks first (the mouth draws over their ends)
  for (const e of [-1, 1]) {
    obSpl([P(e * 0.2, 0.5), P(e * (0.4 + 0.2 * u), 0.7 - 0.05 * u), P(e * (0.55 + 0.24 * u), 0.98), P(e * (0.5 + 0.22 * u), 1.16)], 1, K);
    if (big) obFill(obHatchF(K, e > 0 ? 30 : 150, 3), (g) => obPoly(g, obCR([P(e * 0.22, 0.52), P(e * (0.4 + 0.2 * u), 0.72 - 0.05 * u), P(e * (0.55 + 0.24 * u), 0.98), P(e * (0.6 + 0.24 * u), 0.96), P(e * (0.47 + 0.2 * u), 0.7), P(e * 0.26, 0.5)], 3, true)));   // the fold's shadow
    if (big) obSpl([P(e * (0.6 + 0.2 * u), 0.42), P(e * (0.74 + 0.15 * u), 0.56), P(e * (0.76 + 0.12 * u), 0.72)], 1, GR);   // the bunched cheek's edge
  }
  if (u < 0.3) {   // a closed, too-long smile
    obInk((g) => obPoly(g, top, false), Math.max(1, s * 0.04));
    return;
  }
  obFill(K, open);
  obMask(GR, (g) => { open(g); g.clip(); g.lineWidth = Math.max(1.6, s * 0.075 * u); obPoly(g, top, false); g.stroke(); });   // gums
  // teeth: one subpath each, irregular widths, lengths and tilts; gaps stay black
  const teeth = (curve, n, len0, gum, key) => {
    const T = RNG('teeth', o.key ?? 'g', key), Lc0 = obAlong(curve, 0).L, sp = Lc0 / n;
    return (g) => {
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5 + T.n(0.12)) / n, a = obAlong(curve, t), dx = -a.ty, dy = a.tx, tx = a.tx, ty = a.ty;
        const mid = 1 - Math.abs(t - 0.5) * 2, tw = sp * T.r(0.62, 0.92) * (0.75 + 0.35 * mid), th = s * len0 * u * (0.65 + 0.5 * mid) * T.r(0.8, 1.2), tilt = T.n(0.25);
        const ddx = dx + tx * tilt, ddy = dy + ty * tilt, b0 = s * gum * u;
        const bx = a.x + dx * b0, by = a.y + dy * b0;
        obPolyAdd(g, [[bx - tx * tw / 2, by - ty * tw / 2], [bx + tx * tw / 2, by + ty * tw / 2], [bx + tx * tw * 0.42 + ddx * th, by + ty * tw * 0.42 + ddy * th], [bx + ddx * th * 1.08, by + ddy * th * 1.08], [bx - tx * tw * 0.42 + ddx * th, by - ty * tw * 0.42 + ddy * th]]);
      }
    };
  };
  const up = teeth(top, big ? 12 : 8, 0.15, 0.055, 'u'), lo = teeth(bot, big ? 11 : 7, 0.1, 0.03, 'l');
  obMask(WH, (g) => { open(g); g.clip(); up(g); g.fill(); lo(g); g.fill(); }, { emit: !!o.glow });
  if (big) obMask(GR, (g) => { open(g); g.clip(); lo(g); g.lineWidth = 1; g.stroke(); }, { thr: 0.6 });   // the lower row sits in shadow
  // lips: the stretched upper lip a thin grey band, the lower lip's edge, its shadow, creases at the corners
  obInk((g) => obPoly(g, top.map(([a, b]) => [a, b - 1.2]), false), 1, GR);
  obInk((g) => obPoly(g, top, false), 1, K);
  obInk((g) => obPoly(g, bot.map(([a, b]) => [a, b + 2.2]), false), 1, K);
  obInk((g) => obPoly(g, bot.slice(4, -4).map(([a, b]) => [a, b + 3.4]), false), 1, GR);
  for (const [c, e] of [[Lc, -1], [Rc, 1]]) obInk((g) => { g.moveTo(c[0], c[1]); g.quadraticCurveTo(c[0] + e * s * 0.07, c[1] - s * 0.01, c[0] + e * s * 0.1, c[1] - s * 0.08); g.moveTo(c[0], c[1]); g.lineTo(c[0] + e * s * 0.05, c[1] + s * 0.07); }, 1, K);
  if (big) obInk((g) => { for (const e of [-1, 0.4]) { const a = P(e * 0.12, 1.24 + 0.15 * u); g.moveTo(a[0], a[1]); g.lineTo(a[0] + s * 0.03, a[1] + s * 0.05); } }, 1, GR);   // a tense chin
}

// a hand, fingers up. o.side 'palm' (seen in the mirror) | 'back' (seen from behind: knuckles, nails), o.mirror (thumb on
// the other side), o.flat (palm pressed on glass: a breath smudge around it), o.arm (forearm length in s), o.glow
function obHand(x, y, s, o = {}) {
  const th = o.mirror ? -1 : 1, spread = o.flat ? 0.3 : 0.2, fing = [-1.5, -0.5, 0.5, 1.5], len = [0.82, 1.0, 1.06, 0.92];
  const tips = fing.map((f, i) => { const a = f * spread, L = s * len[th > 0 ? 3 - i : i]; const bx = x + f * s * 0.23, by = y - s * 0.42; return [bx, by, bx + Math.sin(a) * L, by - Math.cos(a) * L]; });
  const shape = (g) => {
    g.beginPath(); g.moveTo(x - s * 0.52, y - s * 0.45); g.lineTo(x + s * 0.52, y - s * 0.45); g.lineTo(x + s * 0.48, y + s * 0.4); g.quadraticCurveTo(x, y + s * 0.62, x - s * 0.48, y + s * 0.4); g.closePath(); g.fill();
    g.lineWidth = s * 0.25; g.beginPath(); for (const [bx, by, ex, ey] of tips) { g.moveTo(bx, by); g.lineTo(ex, ey); }
    g.moveTo(x + th * s * 0.42, y + s * 0.15); g.lineTo(x + th * s * 0.88, y - s * 0.3);   // the thumb
    g.stroke();
    if (o.arm) { g.lineWidth = s * 0.62; g.beginPath(); g.moveTo(x, y + s * 0.3); g.lineTo(x + (o.armDx ?? 0) * s, y + s * (0.3 + o.arm)); g.stroke(); }
  };
  if (o.flat) obFill(obDith(-1, WH, 0.35), (g) => obEll(g, x, y - s * 0.2, s * 1.05, s * 1.15));
  obMask(WH, shape, { rim: K, thr: 0.5 });
  // shading: the far side of the hand hatched (the light comes from the -th side)
  if (s >= 14) obMask(obHatchF(GR, 60, 3), (g) => { g.beginPath(); g.rect(x + th * s * 0.25 - (th > 0 ? 0 : s * 1.6), y - s * 1.5, s * 1.6, s * 3 + (o.arm ?? 0) * s); g.clip(); shape(g); });
  obInk((g) => { for (let i = 0; i < 3; i++) { const a = tips[i], b = tips[i + 1], mx = (a[0] + b[0]) / 2, my = a[1]; g.moveTo(mx, my + 0.5); g.lineTo(mx + ((a[2] + b[2]) / 2 - mx) * 0.3, my - s * 0.3); } }, 1, K, { thr: 0.4 });   // the clefts between fingers
  if (o.side === 'back') {
    obInk((g) => { for (const [bx, by] of tips) { g.moveTo(bx - s * 0.06, by + s * 0.05); g.lineTo(bx + s * 0.06, by + s * 0.03); } }, 1, GR);   // knuckles
    obInk((g) => { for (const [bx, by, ex, ey] of tips) { const k = 0.55; g.moveTo(lerp(bx, ex, k) - s * 0.05, lerp(by, ey, k)); g.lineTo(lerp(bx, ex, k) + s * 0.05, lerp(by, ey, k)); } }, 1, GR);
    obMask(GR, (g) => { for (const [bx, by, ex, ey] of tips) { const k = 0.86, cx = lerp(bx, ex, k), cy = lerp(by, ey, k); g.moveTo(cx + s * 0.07, cy); g.ellipse(cx, cy, s * 0.07, s * 0.09, 0, 0, TAU); } g.fill(); });   // nails
  } else {
    obSpl([[x - th * s * 0.45, y - s * 0.12], [x, y - s * 0.02], [x + th * s * 0.35, y - s * 0.25]], 1, K);    // the heart line
    obSpl([[x + th * s * 0.35, y - s * 0.3], [x + th * s * 0.12, y + s * 0.1], [x + th * s * 0.18, y + s * 0.42]], 1, GR);  // the life line
    obInk((g) => { for (const [bx, by, ex, ey] of tips) for (const k of [0.35, 0.68]) { g.moveTo(lerp(bx, ex, k) - s * 0.07, lerp(by, ey, k)); g.lineTo(lerp(bx, ex, k) + s * 0.07, lerp(by, ey, k)); } }, 1, GR);
  }
  if (o.glow) obMask(-1, shape, { rim: WH, rimEmit: true });
}

// ---------------------------------------------------------------------
//  the person from behind (over-the-shoulder foreground): bob hair with gloss, the nape, a white tee, a rim light
//  obBackOfHead(x, y, s, o): (x, y) = the head's centre, s = half the head's width. o.glow (dark scene), o.rimDir
// ---------------------------------------------------------------------
function obBackOfHead(x, y, s, o = {}) {
  const P = (u, v) => [x + u * s, y + v * s], pts = (A) => A.map(([u, v]) => P(u, v));
  const body = pts([[-0.5, 1.2], [-1.5, 1.5], [-2.4, 1.95], [-2.9, 3.0], [-3.1, 6], [3.1, 6], [2.9, 3.0], [2.4, 1.95], [1.5, 1.5], [0.5, 1.2]]);
  const nape = pts([[-0.42, 0.7], [-0.5, 1.55], [0.5, 1.55], [0.42, 0.7]]);
  const hair = [...obCR(pts([[-1.12, 0.55], [-1.12, -0.35], [-0.8, -0.95], [0, -1.18], [0.8, -0.95], [1.12, -0.35], [1.12, 0.55]]), 5), ...obCR(pts([[1.16, 0.95], [0.9, 1.02], [0.62, 0.95], [0.32, 1.04], [0, 0.97], [-0.32, 1.05], [-0.62, 0.96], [-0.9, 1.03], [-1.16, 0.93]]), 3)];
  obFill(o.shirt ?? WH, (g) => obPoly(g, body), { rim: o.glow ? null : WH, rim8: true });
  obHatch((g) => { obPoly(g, body); g.clip(); g.beginPath(); g.rect(x - s * 3.2, y + s * 1.2, s * 1.6, s * 5); }, { ang: 60, sp: 3 });
  obInk((g) => obPoly(g, body), 1);
  obInk((g) => { for (const e of [-1, 1]) { const a = P(e * 1.0, 2.0), b = P(e * 1.25, 2.9), c = P(e * 1.05, 3.8); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); } const d = P(0, 2.3), f = P(0.05, 4.2); g.moveTo(d[0], d[1]); g.lineTo(f[0], f[1]); }, 1, GR);   // shoulder blades, spine fold
  obFill(K, (g) => obPoly(g, [...obCR(pts([[-0.75, 1.25], [0, 1.45], [0.75, 1.25]]), 4), ...obCR(pts([[0.62, 1.4], [0, 1.6], [-0.62, 1.4]]), 4)]));   // collar band
  obFill(WH, (g) => obPoly(g, nape));
  obFill(obDith(-1, GR, 0.7), (g) => { obPoly(g, nape); g.clip(); g.beginPath(); g.rect(x - s, y, s * 2, s * 1.2); g.fill(); g.beginPath(); });
  obSpl(pts([[-0.12, 1.0], [-0.08, 1.3], [-0.1, 1.5]]), 1, GR); obSpl(pts([[0.14, 1.0], [0.1, 1.3], [0.12, 1.5]]), 1, GR);
  obHairMass(hair, { rim: o.glow ? -1 : WH });
  obInk((g) => { for (const [u0, v0, u1, v1, b] of [[-0.6, -0.9, -0.9, 0.95, -0.1], [-0.15, -1.1, -0.25, 0.9, -0.05], [0.3, -1.05, 0.45, 0.95, 0.06], [0.75, -0.8, 0.95, 1.0, 0.1]]) { const a = P(u0, v0), c = P(u1, v1); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + c[0]) / 2 + s * b, (a[1] + c[1]) / 2, c[0], c[1]); } }, 1, DK);
  obInk((g) => { for (let i = 0; i < 6; i++) { const t = i / 5, a = P(lerp(-0.7, 0.7, t), -0.7 + 0.25 * (t - 0.5) ** 2 * 4 * 0.3); g.moveTo(a[0], a[1]); g.lineTo(a[0] + s * 0.05, a[1] + s * 0.18); } }, 1, GR, { emit: !!o.glow });
  if (o.glow || o.rimDir) obMask(-1, (g) => { obPolyAdd(g, hair); obPolyAdd(g, body); g.fill(); }, { rim: WH, rimDir: o.rimDir, rimEmit: !!o.glow });
}

// a face in profile, facing screen-right (the foreground of a two-shot): a black silhouette rim-lit on its front edge,
// faint night-grey form, and an eye that is a glint when open and a lash line when closed. o.blink, o.glow
function obProfile(x, y, s, o = {}) {
  const P = (u, v) => [x + u * s, y + v * s], pts = (A) => A.map(([u, v]) => P(u, v));
  const front = obCR(pts([[0.15, -1.45], [0.5, -1.05], [0.62, -0.55], [0.64, -0.3], [0.56, -0.12], [0.62, 0.05], [0.84, 0.32], [0.62, 0.42], [0.68, 0.55], [0.62, 0.63], [0.67, 0.74], [0.52, 0.88], [0.56, 1.05], [0.32, 1.22], [0.24, 1.6], [0.3, 2.4]]), 4);
  const head = [...front, ...pts([[0.4, 2.5], [-2.5, 2.5], [-2.5, -1.6], [-0.6, -1.75]])];
  obFill(K, (g) => obPoly(g, head));
  obFill(obDith(-1, DK, 0.5), (g) => obPoly(g, obCR(pts([[0.3, -0.5], [0.5, -0.2], [0.55, 0.5], [0.35, 1.0], [0.0, 0.8], [0.0, -0.2]]), 4, true)));
  obInk((g) => obPoly(g, obCR(pts([[-0.1, -1.4], [0.3, -1.1], [0.42, -0.62], [0.3, -0.3]]), 4), false), Math.max(1, s * 0.12), K);   // hair over the forehead
  obMask(-1, (g) => { obPoly(g, head); g.fill(); }, { rim: WH, rimDir: [1, 0], rimEmit: true });
  obMask(-1, (g) => { obPoly(g, head); g.fill(); }, { rim: GR, rimDir: [0, -1], rimEmit: true });
  const ex = x + s * 0.48, ey = y - s * 0.08;
  if ((o.blink ?? 0) > 0.5) obInk((g) => { g.moveTo(ex - s * 0.08, ey); g.lineTo(ex + s * 0.06, ey + s * 0.03); g.moveTo(ex + s * 0.02, ey + s * 0.02); g.lineTo(ex + s * 0.07, ey + s * 0.08); }, 1, GR, { emit: true });
  else { obRect(Math.round(ex), Math.round(ey), 2, 1, WH, { emit: true }); obInk((g) => { g.moveTo(ex - s * 0.04, ey - s * 0.05); g.lineTo(ex + s * 0.1, ey - s * 0.07); }, 1, GR, { emit: true }); }
}

// ---------------------------------------------------------------------
//  the bathroom: tiles (in perspective), a lamp with a dithered glow, a sink with taps, drain and pipes, a shelf
//  with bottles and a toothbrush cup, a towel on a rail, a door, the mirror with wear, spots and glints
// ---------------------------------------------------------------------
const obAt = (Q, u, v) => [lerp(lerp(Q[0][0], Q[1][0], u), lerp(Q[3][0], Q[2][0], u), v), lerp(lerp(Q[0][1], Q[1][1], u), lerp(Q[3][1], Q[2][1], u), v)];
// a tiled quad Q = [tl, tr, br, bl] of nx x ny tiles: base fill, grout, a bevel highlight, stains, drips, a cracked tile
function obTiles(Q, nx, ny, o = {}) {
  const R = RNG('tiles', o.key ?? 't');
  obFill(o.base ?? WH, (g) => obPoly(g, Q), { noCam: o.noCam });
  const tile = (i, j) => [obAt(Q, i / nx, j / ny), obAt(Q, (i + 1) / nx, j / ny), obAt(Q, (i + 1) / nx, (j + 1) / ny), obAt(Q, i / nx, (j + 1) / ny)];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const r = R.f(), T = tile(i, j), tw = dist(T[0], T[1]), tz = dist(T[0], T[3]);
    if (r < (o.stain ?? 0.16)) {   // a stain: a dithered grey blot, heavier near the bottom of the wall
      const c = obAt(T, R.r(0.25, 0.75), R.r(0.35, 0.85)), d = R.r(0.2, 0.55);
      obFill(obDith(-1, R.f() < 0.3 ? K : GR, d), (g) => { obPoly(g, T); g.clip(); obEll(g, c[0], c[1], tw * R.r(0.15, 0.4), tz * R.r(0.1, 0.3)); }, { noCam: o.noCam });
    } else if (r < (o.stain ?? 0.16) + 0.05) {   // a drip streak from the grout line down
      const a = obAt(T, R.r(0.2, 0.8), 0), L = tz * R.r(0.5, 1.6);
      obFill(obDith(-1, GR, 0.4), (g) => { g.beginPath(); g.rect(a[0], a[1], 1, L); }, { noCam: o.noCam });
    } else if (r < (o.stain ?? 0.16) + 0.08) {   // a crack
      let p = obAt(T, R.r(0.1, 0.4), R.r(0.1, 0.4)); const Pc = [p];
      for (let k = 0; k < 3; k++) { p = [p[0] + tw * R.r(0.1, 0.3), p[1] + tz * R.r(0.1, 0.3)]; Pc.push(p); }
      obLine(Pc, 1, K, { noCam: o.noCam });
    }
  }
  if (o.bevel) obInk((g) => { for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const T = tile(i, j), a = obAt(T, 0.12, 0.14), b = obAt(T, 0.6, 0.14); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } }, 1, o.shine ?? WH, { noCam: o.noCam, thr: 0.5 });
  obInk((g) => { for (let i = 0; i <= nx; i++) { const a = obAt(Q, i / nx, 0), b = obAt(Q, i / nx, 1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } for (let j = 0; j <= ny; j++) { const a = obAt(Q, 0, j / ny), b = obAt(Q, 1, j / ny); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } }, 1, o.grout ?? GR, { noCam: o.noCam });
}
// a wall lamp: a black housing, a diffuser (white and emissive when on), a dithered glow on the wall around it
function obLamp(x, y, w, on = 1, o = {}) {
  if (on) obGlow(x + w / 2, y + 2, w * (o.gw ?? 0.95), o.gh ?? 34, { k: 0.95, p: 1.3, noCam: o.noCam });
  obRect(x - 2, y - 3, w + 4, 8, K, { noCam: o.noCam });
  obRect(x, y - 1, w, 4, on ? WH : DK, { emit: !!on, noCam: o.noCam });
  if (!on) obRect(x + 1, y, w - 2, 1, GR, { noCam: o.noCam });
  obRect(x + w / 2 - 1, y - 7, 3, 4, K, { noCam: o.noCam });
}
// a wall-mounted basin seen front-on: rim, bowl with a dark inside and a drain, a mixer tap with two handles, the trap pipe
function obSink(x, y, w, o = {}) {
  const hw = w / 2, rh = w * 0.09, depth = w * 0.33;
  // the trap pipe under the bowl, into the wall
  const py = y + depth;
  obInk((g) => { g.moveTo(x, py - 2); g.lineTo(x, py + w * 0.22); g.quadraticCurveTo(x, py + w * 0.32, x + w * 0.1, py + w * 0.32); g.lineTo(x + w * 0.32, py + w * 0.32); }, 4, K);
  obInk((g) => { g.moveTo(x, py - 2); g.lineTo(x, py + w * 0.22); g.quadraticCurveTo(x, py + w * 0.32, x + w * 0.1, py + w * 0.32); g.lineTo(x + w * 0.32, py + w * 0.32); }, 2, WH);
  obInk((g) => { g.moveTo(x - 1, py); g.lineTo(x - 1, py + w * 0.2); }, 1, GR);
  obRect(x + w * 0.32, py + w * 0.32 - 4, 3, 8, K); obRect(x + w * 0.32 + 1, py + w * 0.32 - 3, 1, 6, GR);   // the wall flange
  // the bowl's front, white, shaded underneath, inked
  const front = (g) => { g.beginPath(); g.moveTo(x - hw, y); g.bezierCurveTo(x - hw, y + depth * 0.9, x - hw * 0.45, y + depth, x, y + depth); g.bezierCurveTo(x + hw * 0.45, y + depth, x + hw, y + depth * 0.9, x + hw, y); g.closePath(); };
  obFill(WH, front, { rim: K });
  obHatch((g) => { front(g); g.clip(); obEll(g, x + hw * 0.5, y + depth * 0.95, hw * 0.9, depth * 0.45); }, { ang: 0, sp: 2 });
  obFill(obDith(-1, GR, 0.5), (g) => { front(g); g.clip(); obEll(g, x, y + depth * 1.05, hw * 0.75, depth * 0.35); });
  // the rim and the inside
  obFill(WH, (g) => obEll(g, x, y, hw, rh), { rim: K });
  obFill(obDith(GR, DK, 0.35), (g) => obEll(g, x, y + 0.6, hw - 3, rh - 1.6));
  obFill(obDith(WH, GR, 0.5), (g) => { obEll(g, x, y + 0.6, hw - 3, rh - 1.6); g.clip(); obEll(g, x, y + rh * 0.9, hw * 0.75, rh * 0.6); });
  obFill(K, (g) => obEll(g, x, y + rh * 0.35, 2.6, 1.2)); obRect(Math.round(x - 1), Math.round(y + rh * 0.35 - 1), 1, 1, WH);   // the drain
  // the tap: a spout rising from the back of the rim and curving towards us, two cross handles
  const ty = y - rh * 0.7;
  obInk((g) => { g.moveTo(x, ty); g.lineTo(x, ty - w * 0.17); g.quadraticCurveTo(x, ty - w * 0.22, x + 2, ty - w * 0.21); g.lineTo(x + 3, ty - w * 0.15); }, 5, K);
  obInk((g) => { g.moveTo(x, ty); g.lineTo(x, ty - w * 0.17); g.quadraticCurveTo(x, ty - w * 0.22, x + 2, ty - w * 0.21); g.lineTo(x + 3, ty - w * 0.15); }, 3, WH);
  obInk((g) => { g.moveTo(x + 1, ty - 1); g.lineTo(x + 1, ty - w * 0.15); }, 1, GR);
  for (const e of [-1, 1]) {
    const hx = x + e * w * 0.2;
    obFill(WH, (g) => obEll(g, hx, ty, 3.2, 1.6), { rim: K });
    obInk((g) => { g.moveTo(hx, ty); g.lineTo(hx, ty - 5); g.moveTo(hx - 3, ty - 5); g.lineTo(hx + 3, ty - 5); }, 2, K);
    obRect(hx - 3, ty - 6, 1, 1, WH);
  }
  if (o.drip) obRect(x + 3, ty - w * 0.15 + 2 + (o.drip % 1) * (rh + w * 0.13), 1, 2, WH);
}
// a shelf with bottles, a jar and a toothbrush cup. items: [[kind, x, h], ...] standing on y
function obShelf(x, y, w, items, o = {}) {
  for (const [kind, ix, ih] of items) {
    const bw = kind === 'pump' ? 6 : kind === 'round' ? 8 : kind === 'jar' ? 9 : kind === 'cup' ? 7 : 4, bh = ih ?? 12;
    if (kind === 'cup') {
      obInk((g) => { g.moveTo(ix - 1, y - bh); g.lineTo(ix - 5, y - bh - 9); g.moveTo(ix + 2, y - bh); g.lineTo(ix + 4, y - bh - 10); }, 1.6, K);
      obRect(ix - 7, y - bh - 12, 3, 3, GR, { rim: K }); obRect(ix + 3, y - bh - 13, 3, 3, WH, { rim: K });
      obFill(obDith(WH, GR, 0.5), (g) => obPoly(g, [[ix - bw / 2, y - bh], [ix + bw / 2, y - bh], [ix + bw / 2 - 1, y], [ix - bw / 2 + 1, y]]), { rim: K });
      obRect(ix - bw / 2 + 1, y - bh + 1, 1, bh - 2, WH);
      continue;
    }
    const body = (g) => { g.beginPath(); if (kind === 'round') g.ellipse(ix, y - bh * 0.42, bw / 2, bh * 0.42, 0, 0, TAU); else g.roundRect(ix - bw / 2, y - bh, bw, bh, kind === 'jar' ? 1 : 2); };
    obFill(kind === 'tall' ? obDith(WH, GR, 0.5) : WH, body, { rim: K });
    obHatch((g) => { body(g); g.clip(); g.beginPath(); g.rect(ix + bw * 0.15, y - bh - 2, bw, bh + 4); }, { ang: 60, sp: 2 });
    if (kind !== 'jar') obRect(Math.round(ix - bw / 2 + 1), Math.round(y - bh * 0.62), Math.max(1, bw - 2), Math.max(2, bh * 0.3), kind === 'round' ? K : GR);   // a label
    obRect(Math.round(ix - bw / 2 + 1), Math.round(y - bh * 0.9), 1, Math.round(bh * 0.25), WH);   // a highlight
    if (kind === 'pump') { obRect(ix - 1, y - bh - 3, 2, 3, K); obRect(ix - 1, y - bh - 5, 5, 2, K); }
    else if (kind === 'jar') obRect(ix - bw / 2, y - bh - 2, bw, 3, K);
    else obRect(ix - 1.5, y - bh * (kind === 'round' ? 0.84 : 1) - 3, 3, 3, K);
  }
  obRect(x, y, w, 2, WH, { rim: K });   // the glass shelf
  obRect(x, y + 3, w, 1, GR);
  for (const bx of [x + 3, x + w - 5]) obRect(bx, y + 2, 2, 4, K);
}
// a towel on a rail: the rail (black, a white highlight), the fold over it, soft folds, a woven stripe band, a fringed hem
function obTowel(x, y, w, h, o = {}) {
  const R = RNG('towel', o.key ?? 'tw');
  obRect(x - 4, y - 2, w + 8, 3, K); obRect(x - 3, y - 2, w + 6, 1, WH);
  for (const bx of [x - 5, x + w + 3]) obRect(bx, y - 4, 3, 6, K);
  const body = [[x, y], [x + w, y], [x + w + 1, y + h * 0.5], [x + w, y + h], ...Array.from({ length: 5 }, (_, i) => [x + w - (i + 1) * w / 6, y + h + R.r(-1.5, 1.5)]), [x, y + h], [x - 1, y + h * 0.5]];
  obFill(o.base ?? WH, (g) => obPoly(g, body), { rim: K });
  obFill(o.base === GR ? DK : GR, (g) => { g.beginPath(); g.rect(x, y + 1, w, 4); });   // the fold over the rail
  obLine([[x, y + 5], [x + w, y + 5]], 1, K);
  obInk((g) => { for (let i = 1; i < 4; i++) { const fx = x + w * i / 4 + R.r(-1, 1); g.moveTo(fx, y + 7); g.quadraticCurveTo(fx + R.r(-2, 2), y + h * 0.5, fx + R.r(-1, 1), y + h - 1); } }, 1, GR);
  obHatch((g) => { obPoly(g, body); g.clip(); g.beginPath(); g.rect(x + w * 0.7, y + 5, w, h); }, { ang: 90, sp: 2 });
  obRect(x, y + h * 0.72, w, 1, K); obFill(obDith(-1, GR, 0.5), (g) => { g.beginPath(); g.rect(x, y + h * 0.72 + 1, w, 2); }); obRect(x, y + h * 0.72 + 3, w, 1, K);
  obInk((g) => { for (let fx = x + 1; fx < x + w; fx += 2) { g.moveTo(fx, y + h); g.lineTo(fx, y + h + 2); } }, 1, K);
}
// a door: a white casing, a dark gap when it stands open (the leaf at an angle), two inset panels and a handle when shut
function obDoor(x, y, w, h, o = {}) {
  obRect(x - 3, y - 3, w + 6, h + 3, WH, { rim: K });
  obLine([[x - 1, y + h], [x - 1, y - 1], [x + w, y - 1], [x + w, y + h]], 1, GR);
  if (o.open) {
    obFill(obDith(K, DK, o.gapLight ?? 0.25), (g) => { g.beginPath(); g.rect(x, y, w, h); });
    const lw = w * o.open, leaf = [[x, y], [x + lw, y + 4], [x + lw, y + h - 2], [x, y + h]];
    obFill(GR, (g) => obPoly(g, leaf), { rim: K });
    obHatch((g) => obPoly(g, leaf), { ang: 90, sp: 3 });
    obRect(Math.round(x + lw - 3), Math.round(y + h * 0.52), 2, 2, K);
  } else {
    obFill(o.base ?? GR, (g) => { g.beginPath(); g.rect(x, y, w, h); });
    for (const [py, ph] of [[0.06, 0.38], [0.52, 0.42]]) { obInk((g) => { g.rect(x + 3, y + h * py, w - 6, h * ph); }, 1, K); obLine([[x + 4, y + h * (py + ph) + 1], [x + w - 2, y + h * (py + ph) + 1]], 1, WH); }
    obRect(Math.round(x + w - 5), Math.round(y + h * 0.5), 3, 2, K); obRect(Math.round(x + w - 5), Math.round(y + h * 0.5), 1, 1, WH);
  }
}
// the ceiling and walls of a room seen in perspective: the back wall rectangle B = [x0, y0, x1, y1] inside the frame F
function obRoomBox(F, B, o = {}) {
  const [fx0, fy0, fx1, fy1] = F, [bx0, by0, bx1, by1] = B;
  obFill(o.ceil ?? obDith(GR, DK, 0.35), (g) => obPoly(g, [[fx0, fy0], [fx1, fy0], [bx1, by0], [bx0, by0]]));
  obInk((g) => { for (let i = 1; i < 4; i++) { const t = i / 4, a = [lerp(fx0, fx1, t), fy0], b = [lerp(bx0, bx1, t), by0]; g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } }, 1, DK);
  if (o.walls !== false) {
    obTiles([[fx0, fy0], [bx0, by0], [bx0, by1], [fx0, fy1]], 2, 7, { key: 'wl', base: o.side ?? obDith(WH, GR, 0.5), grout: K, stain: 0.1, bevel: false });
    obTiles([[bx1, by0], [fx1, fy0], [fx1, fy1], [bx1, by1]], 2, 7, { key: 'wr', base: o.side ?? obDith(WH, GR, 0.3), grout: K, stain: 0.1, bevel: false });
  }
  obLine([[fx0, fy0], [bx0, by0], [bx1, by0], [fx1, fy0]], 1, K);
  obLine([[bx0, by0], [bx0, by1]], 1, K); obLine([[bx1, by0], [bx1, by1]], 1, K);
}
// the mirror: everything drawn by inside() is clipped to the glass; then wear (desilvering at the edges, water spots,
// specks), glints, a thick black frame with a 1-px bevel
function obMirror(x, y, w, h, inside, o = {}) {
  const keep = OB.idx, keepE = OB.emit, I2 = new Uint8Array(keep), E2 = new Uint8Array(keepE);
  OB.idx = I2; OB.emit = E2; inside(); OB.idx = keep; OB.emit = keepE;
  const W2 = OB.w; for (let j = Math.max(0, Math.ceil(y)); j < Math.min(OB.h, y + h); j++) for (let i = Math.max(0, Math.ceil(x)); i < Math.min(W2, x + w); i++) { keep[j * W2 + i] = I2[j * W2 + i]; keepE[j * W2 + i] = E2[j * W2 + i]; }
  const nc = { noCam: o.noCam };
  if (o.wear !== false) {
    const R = RNG('mirror-wear', o.key ?? 'm');
    obMask((xx, yy) => {   // desilvering: speckle that thickens toward the bottom corners and edges
      const ex = Math.min(xx - x, x + w - xx), ey = y + h - yy, d = Math.min(ex * 1.4, ey, (yy - y) * 2.5);
      const n = hash('ds', xx, yy) % 1000 / 1000;
      return d < 6 && n > 0.8 + d * 0.035 ? (n > 0.95 ? K : GR) : null;
    }, (g) => { g.beginPath(); g.rect(x, y, w, h); g.fill(); }, nc);
    for (let i = 0; i < (o.spots ?? 9); i++) {   // water spots and toothpaste specks
      const sx = x + R.r(0.08, 0.92) * w, sy = y + R.r(0.45, 0.95) * h, r = R.r(0.8, 2.2);
      if (R.f() < 0.5) obInk((g) => obEll(g, sx, sy, r, r * 0.8), 1, GR, { ...nc, thr: 0.45 }); else obRect(Math.round(sx), Math.round(sy), 1, 1, WH, nc);
    }
    obFill(obDith(-1, GR, 0.35), (g) => { g.beginPath(); g.rect(x + w * R.r(0.2, 0.8), y + h * 0.55, 1, h * 0.4); }, nc);   // a dried drip run
  }
  for (const [gx, gw] of o.glints ?? [[0.62, 5], [0.72, 2]]) obFill(obDith(-1, WH, 0.25), (g) => { g.beginPath(); g.rect(x, y, w, h); g.clip(); g.beginPath(); g.moveTo(x + w * gx, y); g.lineTo(x + w * gx + gw, y); g.lineTo(x + w * gx + gw - h * 0.5, y + h); g.lineTo(x + w * gx - h * 0.5, y + h); }, { ...nc, emit: !!o.glow });
  const fw = o.frame ?? 4;
  obMask(K, (g) => { g.beginPath(); g.rect(x - fw, y - fw, w + fw * 2, h + fw * 2); g.rect(x, y, w, h); g.fill('evenodd'); }, nc);
  obInk((g) => { g.beginPath(); g.rect(x - fw + 1.5, y - fw + 1.5, w + fw * 2 - 3, h + fw * 2 - 3); }, 1, o.glow ? GR : WH, { ...nc, thr: 0.4, emit: !!o.glow });
}

// ---------------------------------------------------------------------
//  the bitmap font, bold: glyphs are drawn with 1-cell strokes and widened one cell to the right, so vertical strokes
//  are 2 cells and counters 2 cells (base glyphs keep 3 empty cells between verticals). 9 rows: 0-6 caps,
//  2-6 x-height, 7-8 descenders. Lower case, the upper case in Spanish captions, á é í ó ú ñ ü, ¿ ? ¡ ! . , … : ; - ' "
// ---------------------------------------------------------------------
const OB_G = (rows) => rows.split('/');
const OB_FONT = {
  ' ': OB_G('../../../../../../../../..'),
  a: OB_G('...../...../.###./....#/.####/#...#/.####/...../.....'), b: OB_G('#..../#..../####./#...#/#...#/#...#/####./...../.....'),
  c: OB_G('...../...../.####/#..../#..../#..../.####/...../.....'), d: OB_G('....#/....#/.####/#...#/#...#/#...#/.####/...../.....'),
  e: OB_G('...../...../.###./#...#/#####/#..../.####/...../.....'), f: OB_G('..##/.#../####/.#../.#../.#../.#../..../....'),
  g: OB_G('...../...../.####/#...#/#...#/#...#/.####/....#/####.'), h: OB_G('#..../#..../####./#...#/#...#/#...#/#...#/...../.....'),
  i: OB_G('#/./#/#/#/#/#/./.'), j: OB_G('..#/.../..#/..#/..#/..#/..#/..#/##.'),
  k: OB_G('#..../#..../#...#/#..#./###../#..#./#...#/...../.....'), l: OB_G('#./#./#./#./#./#./.#/../..'),
  m: OB_G('......./......./######./#..#..#/#..#..#/#..#..#/#..#..#/......./.......'), n: OB_G('...../...../####./#...#/#...#/#...#/#...#/...../.....'),
  o: OB_G('...../...../.###./#...#/#...#/#...#/.###./...../.....'), p: OB_G('...../...../####./#...#/#...#/#...#/####./#..../#....'),
  q: OB_G('...../...../.####/#...#/#...#/#...#/.####/....#/....#'), r: OB_G('..../..../#.##/##../#.../#.../#.../..../....'),
  s: OB_G('...../...../.####/#..../.###./....#/####./...../.....'), t: OB_G('.#../.#../####/.#../.#../.#../..##/..../....'),
  u: OB_G('...../...../#...#/#...#/#...#/#...#/.####/...../.....'), v: OB_G('...../...../#...#/#...#/#...#/.#.#./..#../...../.....'),
  w: OB_G('......./......./#..#..#/#..#..#/#..#..#/#..#..#/.##.##./......./.......'), x: OB_G('...../...../#...#/.#.#./..#../.#.#./#...#/...../.....'),
  y: OB_G('...../...../#...#/#...#/#...#/#...#/.####/....#/####.'), z: OB_G('...../...../#####/...#./..#../.#.../#####/...../.....'),
  'á': OB_G('..##./...../.###./....#/.####/#...#/.####/...../.....'), 'é': OB_G('..##./...../.###./#...#/#####/#..../.####/...../.....'),
  'í': OB_G('.##/.../#../#../#../#../#../.../...'), 'ó': OB_G('..##./...../.###./#...#/#...#/#...#/.###./...../.....'),
  'ú': OB_G('..##./...../#...#/#...#/#...#/#...#/.####/...../.....'), 'ñ': OB_G('.###./...../####./#...#/#...#/#...#/#...#/...../.....'),
  'ü': OB_G('.#.#./...../#...#/#...#/#...#/#...#/.####/...../.....'),
  '?': OB_G('.###./#...#/....#/..##./..#../...../..#../...../.....'), '¿': OB_G('...../..#../...../..#../.##../#..../#...#/.###./.....'),
  '!': OB_G('#/#/#/#/#/./#/./.'), '¡': OB_G('./#/./#/#/#/#/#/.'),
  '.': ['.', '.', '.', '.', '.', '.', '#', '.', '.'], ',': ['.', '.', '.', '.', '.', '.', '#', '#', '.'],
  ':': ['.', '.', '#', '.', '.', '.', '#', '.', '.'], ';': ['.', '.', '#', '.', '.', '.', '#', '#', '.'],
  '…': OB_G('......./......./......./......./......./......./#..#..#/......./.......'), '-': OB_G('.../.../.../.../###/.../.../.../...'),
  "'": OB_G('#/#/./././././.'), '"': OB_G('#..#/#..#/..../..../..../..../..../..../....'),
};
// upper case and digits from 5x7 bit rows (bit 16 = left column)
(() => {
  const U = {
    A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14], D: [28, 18, 17, 17, 17, 18, 28], E: [31, 16, 16, 30, 16, 16, 31],
    F: [31, 16, 16, 30, 16, 16, 16], G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12],
    K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31], M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17], S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
    U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17], Y: [17, 17, 17, 10, 4, 4, 4],
    Z: [31, 1, 2, 4, 8, 16, 31], 0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31], 3: [31, 2, 4, 2, 1, 17, 14],
    4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14], 6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8], 8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  };
  for (const ch in U) OB_FONT[ch] = [...U[ch].map((b) => [16, 8, 4, 2, 1].map((m) => (b & m ? '#' : '.')).join('')), '.....', '.....'];
})();
// the bold glyph: every lit cell also lights the cell to its right
const OB_BOLD = new Map();
function obGlyph(ch) {
  const base = OB_FONT[ch] || OB_FONT[ch.toLowerCase()] || OB_FONT['?'];
  if (ch === ' ') return base;
  if (!OB_BOLD.has(ch)) OB_BOLD.set(ch, base.map((r) => [...r + '.'].map((c, i) => (c === '#' || r[i - 1] === '#' ? '#' : '.')).join('')));
  return OB_BOLD.get(ch);
}
// the advance: the glyph's width, minus trailing columns empty in the body rows (an accent may overhang the gap)
const OB_ADV = new Map();
function obAdv(ch) {
  if (!OB_ADV.has(ch)) { const gl = obGlyph(ch); let last = -1; for (let r = 2; r < 9; r++) for (let c = 0; c < gl[r].length; c++) if (gl[r][c] === '#') last = Math.max(last, c); OB_ADV.set(ch, last < 0 ? gl[0].length : last + 1); }
  return OB_ADV.get(ch);
}
const obTextW = (s) => [...s].reduce((a, ch) => a + obAdv(ch) + 1, 0) - 1;   // in font cells

// subtitle lines centred at screen x cx, first line's top at screen y; o.count = glyphs revealed (typing, across lines),
// o.G = screen px per font cell (default 5), o.lead = line spacing in cells (default 12). White bold glyphs, a 1-cell black
// outline and a 1-cell drop shadow down-right, over a dithered dark plate (o.plate = false to drop it) so the line reads on
// any ground. Each line also leaves an invisible fillText ghost so tools/textcheck can see its box.
function obSubtitle(lines, cx, y, o = {}) {
  const G = o.G ?? 5, lead = o.lead ?? 12, n = o.count ?? Infinity, pad = 2;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  let shown = 0;
  lines.forEach((line, li) => {
    const chars = [...line], tw = obTextW(line), cols = tw + 4, rows = 9 + 4, M = new Uint8Array(cols * rows);
    let c0 = 2, any = 0;
    for (const ch of chars) {
      const gl = obGlyph(ch), gw = gl[0].length;
      if (shown < n) { for (let r = 0; r < 9; r++) for (let c = 0; c < gw; c++) if (gl[r][c] === '#') { M[(r + 2) * cols + c0 + c] = 1; any = 1; } }
      if (ch !== ' ') shown++;
      c0 += obAdv(ch) + 1;
    }
    if (!any) return;
    const x0 = Math.round(cx / G - cols / 2) * G, y0 = Math.round((y + li * lead * G) / G) * G - 2 * G;
    // the plate: the typed part of the line, padded, 75% black dither inside and 40% at its edge ring
    if (o.plate !== false) {
      let last = 0; for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) if (M[r * cols + c]) last = c;
      const pc0 = -pad + 1, pc1 = last + pad + 1, pr0 = 0 - 0, pr1 = rows;
      ctx.fillStyle = OB_PAL[K]; ctx.beginPath();
      for (let r = pr0 - 1; r <= pr1; r++) for (let c = pc0; c <= pc1; c++) {
        const edge = r === pr0 - 1 || r === pr1 || c === pc0 || c === pc1, d = edge ? 0.4 : 0.8;
        if (d > obBayer(c + 64, r + 64)) ctx.rect(x0 + c * G, y0 + r * G, G, G);
      }
      ctx.fill();
    }
    const at = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && M[r * cols + c];
    ctx.fillStyle = OB_PAL[o.outline ?? K]; ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (M[r * cols + c]) continue;
      let hit = at(r - 1, c - 1);   // the drop shadow
      for (let v = -1; v <= 1 && !hit; v++) for (let u = -1; u <= 1; u++) if (at(r + v, c + u)) { hit = 1; break; }
      if (hit) ctx.rect(x0 + c * G, y0 + r * G, G, G);
    }
    ctx.fill();
    ctx.fillStyle = OB_PAL[o.fg ?? WH]; ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (M[r * cols + c]) ctx.rect(x0 + c * G, y0 + r * G, G, G);
    ctx.fill();
    // the ghost box for the text check: the line's full width, cap height to descender
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.font = `700 ${Math.round(9 * G * 1.6)}px monospace`; ctx.textBaseline = 'alphabetic';
    ctx.fillText(line, x0 + 2 * G, y0 + 9 * G, tw * G); ctx.restore();
  });
  ctx.restore();
}
// typing: how many glyphs of a subtitle are shown at TT (rate = s per glyph), and each glyph's time (the score clicks on them)
const obTypeCount = (t0, rate = 0.045) => (TT < t0 ? 0 : Math.floor((TT - t0) / rate) + 1);
function obTypeTimes(lines, t0, rate = 0.045) { const n = lines.join('').replace(/ /g, '').length; return Array.from({ length: n }, (_, i) => t0 + i * rate); }
// queue a subtitle for after the scene (screen space, over the upscaled picture)
function obSub(lines, t0, o = {}) { const f = () => { if (TT >= t0) obSubtitle(lines, o.cx ?? 540, o.y ?? 1250, { ...o, count: obTypeCount(t0, o.rate) }); }; if (DEFER) DEFER.push(f); else f(); }

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md). Morphs are not this look's grammar (it hard-cuts), but they work:
//  the backdrop and the morphing shape are drawn on the 6 px grid in the 4-step ramp.
// =====================================================================
function obNearest(c) { const m = c.match(/[\da-f]{2}/gi), v = c[0] === '#' ? m.map((h) => parseInt(h, 16)) : (c.match(/[\d.]+/g) || [0, 0, 0]).map(Number); const L = (v[0] + v[1] + v[2]) / 3; return L / 255 * 3; }
function obCells(test, val) {   // fill 6-px screen cells where test(cx, cy) with the dithered ramp value val (0..3)
  const G = 6, a = Math.floor(val), f = val - a; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const pass of [0, 1]) { ctx.fillStyle = OB_PAL[clamp(a + pass, 0, 3)]; ctx.beginPath(); for (let j = 0; j < H / G; j++) for (let i = 0; i < W / G; i++) if (test(i * G + 3, j * G + 3) && ((f > obBayer(i, j)) === !!pass)) ctx.rect(i * G, j * G, G, G); ctx.fill(); }
  ctx.restore();
}
function obInside(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
const STYLE = {
  name: 'onebit',
  paper: '#000000',
  backdrop(c) { obCells(() => true, obNearest(c)); },
  window(P, key, src) { obCells(() => true, 0); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); for (let j = 0; j < H / 6; j++) for (let i = 0; i < W / 6; i++) if (obInside(P, i * 6 + 3, j * 6 + 3)) ctx.rect(i * 6, j * 6, 6, 6); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { obCells((x, y) => obInside(P, x, y), obNearest(c)); },
  hero(x, y, r, o = {}) { obScene(() => obPerson(x / 6, y / 6, r / 6 * 0.5, { key: o.key }), { bg: K }); },
  heroColor: '#fdfdfd',
  heroPts: (x, y, r) => ellipsePts(x, y, r * 0.5, r * 0.65, 0, 96),
  post() {},
  ones: false,   // on 2s: TT steps at 12 fps; the reference's tiny motions read as held drawings that twitch
};

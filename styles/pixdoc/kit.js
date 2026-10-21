// =====================================================================
//  styles/pixdoc/kit.js — documentary pixel art (built on styles/pixel/kit.js; doc layer at the end). Every picture is drawn at a low internal resolution with whole-pixel
//  primitives in a limited palette, then scaled up nearest-neighbour to 1080x1920. Resolution can tell
//  time: a coarse early era, a sharper later one.  Built on kit/core.js (RNG, EZ, geometry, TT/B/E0/DEFER).
//  Needs from the piece head: W, H, CX, BEAT.  Optional from the piece (src/bridges.js):
//    ERA_RES  = [[w, h], ...]   each era's internal resolution (an integer divisor of W x H); the STYLE hooks
//                               use it for the pixel grid of morph windows, the morphing blob and post FX
//    ERA_POST = [{ scan, lcd, vignette }, ...]   per-era screen effects drawn by STYLE.post
//  Inside lowres(res, draw) coordinates are LOW-RES PIXELS (0..w, 0..h) and every primitive snaps to them.
//  No anti-aliasing anywhere: rects only, never arcs, strokes or text from fonts.
// =====================================================================

// ---- palettes: one per era; a scene uses only its era's colours (lowres({ fx: { pal } }) can enforce it)
const PAL16 = {
  ink: '#14101e', night: '#232a4e', blue: '#2f5fa8', sky: '#5fb4e6', ice: '#a8f0f0', white: '#f4f0e6',
  grey: '#8a8ca0', slate: '#4a4e66', green: '#2e8a4a', lime: '#8ad04a', yellow: '#f6d64a', orange: '#f08a32',
  red: '#d83a3a', pink: '#f07aa8', purple: '#6a3a8a', brown: '#7a4a2a',
};
const HANDHELD = ['#0f2a14', '#306a2e', '#8aac2a', '#c4d870'];   // 4 greens, darkest to lightest
const PAL4 = HANDHELD;
const PIX_UI = { light: PAL16.white, dark: PAL16.ink, shadow: '#07060c' };   // window rims

// ---- colour helpers (for hooks that are handed mixed colours by the renderer)
function rgbOf(c) {
  if (c[0] === '#') { const n = c.length === 4 ? c.slice(1).split('').map((h) => h + h).join('') : c.slice(1, 7); return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)); }
  const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
}
const hexOf = (v) => '#' + v.map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
const posterize = (c, levels = 8) => hexOf(rgbOf(c).map((v) => Math.round(v / 255 * (levels - 1)) * 255 / (levels - 1)));
const shadeC = (c, k) => hexOf(rgbOf(c).map((v) => (k < 0 ? v * (1 + k) : v + (255 - v) * k)));   // k -1..1: toward black / white
function nearestC(c, pal) {
  const a = rgbOf(c); let best = pal[0], bd = 1e9;
  for (const p of pal) { const b = rgbOf(p), d = (a[0] - b[0]) ** 2 * 0.3 + (a[1] - b[1]) ** 2 * 0.59 + (a[2] - b[2]) ** 2 * 0.11; if (d < bd) { bd = d; best = p; } }
  return best;
}

// the two palette colours (and the mix 0..1 between them) that best make colour c when dithered
const PIX_ALL = [...Object.values(PAL16), ...HANDHELD];
function ditherPair(c, pal = PIX_ALL) {
  const v = rgbOf(c), P = pal.map(rgbOf); let best = [pal[0], pal[0], 0], be = 1e18;
  for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) {
    const a = P[i], b = P[j], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
    const t = L ? clamp(((v[0] - a[0]) * d[0] + (v[1] - a[1]) * d[1] + (v[2] - a[2]) * d[2]) / L) : 0;
    const e = (a[0] + d[0] * t - v[0]) ** 2 + (a[1] + d[1] * t - v[1]) ** 2 + (a[2] + d[2] * t - v[2]) ** 2 + (L ? t * (1 - t) * L * 0.15 : 0);   // prefer near neighbours
    if (e < be) { be = e; best = [pal[i], pal[j], t]; }
  }
  return best;
}

// ---- ordered dithering: a 4x4 Bayer matrix, thresholds in (0, 1)
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER4[((Math.round(y) & 3) << 2) | (Math.round(x) & 3)];

// ---------------------------------------------------------------------
//  the low-res pass. PIX maps pixel coords to the canvas being drawn: canvas = z * p + t (then x s to screen)
// ---------------------------------------------------------------------
const PIX = { z: 1, tx: 0, ty: 0, s: 1, w: W, h: H, depth: 0 };
const PIX_OFF = new Map();
function pixCanvas(w, h, tag) {   // cached offscreen canvases, cleared and fully redrawn on every use
  const k = w + 'x' + h + '@' + tag;
  if (!PIX_OFF.has(k)) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); PIX_OFF.set(k, c); }
  return PIX_OFF.get(k);
}
const resOf = (res) => (Array.isArray(res) ? res : [Math.round(W / res), Math.round(H / res)]);   // [w, h] or a pixel size
// draw(w, h) runs with the global ctx swapped to a w x h canvas; the result is scaled up with hard pixels onto
// the real ctx (in screen space). A camera on the real ctx (pieceCam) is applied in pixel space, snapped:
// pans land on whole pixels; keep zoom at 1 (or whole numbers) so pixels stay square.
// o.fx: { pal: [...], posterize, noise, noiseAmt, blocks, bs, flicker, blur } (see pixFX); o.al: opacity
function lowres(res, draw, o = {}) {
  const [w, h] = resOf(res), s = W / w, m = ctx.getTransform(), saved = ctx, keep = { ...PIX };
  const c = pixCanvas(w, h, keep.depth), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, w, h);
  Object.assign(PIX, { z: m.a, tx: Math.round(m.e / s), ty: Math.round(m.f / s), s, w, h, depth: keep.depth + 1 });
  ctx = g;
  try { draw(w, h); if (o.fx) pixFX(g, w, h, o.fx); } finally { ctx = saved; Object.assign(PIX, keep); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = o.al ?? 1; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, w, h, 0, 0, W, H); ctx.restore();
}
// draw pixel primitives straight onto the current canvas in screen space, one pixel = G x G screen px
// (the STYLE hooks use this for the hero and the morph; scenes normally use lowres)
function withGrid(G, fn) {
  const keep = { ...PIX };
  Object.assign(PIX, { z: G, tx: 0, ty: 0, s: 1, w: Math.ceil(W / G), h: Math.ceil(H / G) });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  try { fn(); } finally { ctx.restore(); Object.assign(PIX, keep); }
}
const pixToScreen = (x, y) => [(PIX.z * x + PIX.tx) * PIX.s, (PIX.z * y + PIX.ty) * PIX.s];
const pixFromWorld = (x, y, res) => { const [w] = resOf(res), s = W / w; return [Math.floor(x / s), Math.floor(y / s)]; };
const pixToWorld = (x, y, res) => { const [w] = resOf(res), s = W / w; return [(x + 0.5) * s, (y + 0.5) * s]; };   // a pixel's centre

// ---------------------------------------------------------------------
//  primitives (pixel coords; everything rounds to whole pixels; colours are '#hex')
// ---------------------------------------------------------------------
function cellR(x, y, w, h) {   // fill whole pixels [x, x+w) x [y, y+h) in the current fillStyle
  const z = PIX.z, x0 = Math.round(z * x + PIX.tx), y0 = Math.round(z * y + PIX.ty), x1 = Math.round(z * (x + w) + PIX.tx), y1 = Math.round(z * (y + h) + PIX.ty);
  if (x1 > x0 && y1 > y0) ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function pset(x, y, c) { ctx.fillStyle = c; cellR(Math.round(x), Math.round(y), 1, 1); }
function prect(x, y, w, h, c) { ctx.fillStyle = c; cellR(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function pfill(c) { prect(-PIX.tx - 2, -PIX.ty - 2, PIX.w / PIX.z + 4, PIX.h / PIX.z + 4, c); }   // the whole low-res frame
// Bresenham line, one pixel wide
function pline(x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  ctx.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (let n = 0; n < 8192; n++) {
    cellR(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
// filled pixel ellipse around the centre pixel (rx = ry = r gives a disc 2r+1 wide); o.ring = rim thickness only
function pellipse(cx, cy, rx, ry, c, o = {}) {
  cx = Math.round(cx); cy = Math.round(cy); rx = Math.max(0, Math.round(rx)); ry = Math.max(0, Math.round(ry));
  ctx.fillStyle = c;
  const A = rx + 0.5, Bq = ry + 0.5, t = o.ring ?? 0;
  for (let j = -ry; j <= ry; j++) {
    const hw = Math.floor(A * Math.sqrt(Math.max(0, 1 - (j / Bq) ** 2)) + 1e-9);
    if (!t) { cellR(cx - hw, cy + j, 2 * hw + 1, 1); continue; }
    const iA = A - t, iB = Bq - t, inner = iA > 0 && iB > 0 && Math.abs(j) < iB ? Math.floor(iA * Math.sqrt(Math.max(0, 1 - (j / iB) ** 2)) + 1e-9) : -1;
    if (inner < 0) cellR(cx - hw, cy + j, 2 * hw + 1, 1);
    else { cellR(cx - hw, cy + j, hw - inner, 1); cellR(cx + inner + 1, cy + j, hw - inner, 1); }
  }
}
const pcircle = (cx, cy, r, c, o) => pellipse(cx, cy, r, r, c, o);
// rows y0..y1-1 of polygon P (pixel coords): spans [i0, i1) of pixels whose centres are inside (even-odd)
function polySpans(P, y0, y1) {
  const rows = [], n = P.length;
  for (let j = y0; j < y1; j++) {
    const yc = j + 0.5, xs = [];
    for (let k = 0; k < n; k++) { const a = P[k], b = P[(k + 1) % n]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    xs.sort((p, q) => p - q);
    const sp = [];
    for (let k = 0; k + 1 < xs.length; k += 2) { const i0 = Math.ceil(xs[k] - 0.5), i1 = Math.ceil(xs[k + 1] - 0.5); if (i1 > i0) sp.push([i0, i1]); }
    rows.push(sp);
  }
  return rows;
}
// filled polygon, rasterised by pixel centres (hard stepped edges)
function ppoly(P, c) {
  const bb = bbox(P), y0 = Math.floor(bb.y0), y1 = Math.ceil(bb.y1) + 1;
  ctx.fillStyle = c;
  polySpans(P, y0, y1).forEach((sp, k) => sp.forEach(([a, b]) => cellR(a, y0 + k, b - a, 1)));
}
// ordered dither: cB where f(x, y) (0..1) beats the Bayer threshold, else cA (cA null = leave what is there)
function pdither(x, y, w, h, cA, cB, f) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (cA) prect(x, y, w, h, cA);
  ctx.fillStyle = cB;
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (f(i, j) > bayer(i, j)) cellR(i, j, 1, 1);
}
// a dithered gradient through cols, top to bottom (o.horiz: left to right); o.ease(u) reshapes it
function pgrad(x, y, w, h, cols, o = {}) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const n = cols.length - 1, L = o.horiz ? w : h;
  for (let k = 0; k < L; k++) {
    const u = (o.ease || ((v) => v))(L > 1 ? k / (L - 1) : 0) * n, a = Math.min(n, Math.floor(u)), f = u - a, b = Math.min(n, a + 1);
    ctx.fillStyle = cols[a];
    if (o.horiz) cellR(x + k, y, 1, h); else cellR(x, y + k, w, 1);
    if (f <= 0 || a === b) continue;
    ctx.fillStyle = cols[b];
    if (o.horiz) { for (let j = y; j < y + h; j++) if (f > bayer(x + k, j)) cellR(x + k, j, 1, 1); }
    else for (let i = x; i < x + w; i++) if (f > bayer(i, y + k)) cellR(i, y + k, 1, 1);
  }
}
// a dithered halo: density amt at radius r0 falling to 0 at r1 (moons, lamps, coins)
function pglow(cx, cy, r0, r1, c, amt = 0.5) {
  cx = Math.round(cx); cy = Math.round(cy); ctx.fillStyle = c;
  const R = Math.ceil(r1);
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
    const d = Math.hypot(i, j); if (d < r0 || d > r1) continue;
    if (amt * (1 - (d - r0) / (r1 - r0)) > bayer(cx + i, cy + j)) cellR(cx + i, cy + j, 1, 1);
  }
}

// ---------------------------------------------------------------------
//  era effects on the low-res picture (keyed on B, so they boil on 2s and repeat exactly)
//    pal: [..]      snap every pixel to the nearest palette colour (enforces the era's palette)
//    posterize: n   n levels per channel          noise: count, noiseAmt   colour noise on random pixels
//    blocks: frac   JPEG-ish: frac of bs x bs blocks flattened to their mean    flicker: amt   brightness jitter
//    blur: px       soft early-generative look (breaks the palette; use for one era only)
// ---------------------------------------------------------------------
function pixFX(g, w, h, fx) {
  if (fx.blur) {
    const t = pixCanvas(w, h, 'fx'), tg = t.getContext('2d');
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, w, h); tg.drawImage(g.canvas, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.filter = `blur(${fx.blur}px)`; g.drawImage(t, 0, 0); g.restore();
  }
  if (!(fx.pal || fx.posterize || fx.blocks || fx.flicker || fx.noise)) return;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  if (fx.flicker) { const k = 1 + RNG('pxflk', B).n(fx.flicker); for (let i = 0; i < d.length; i += 4) { d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; } }
  if (fx.blocks) {
    const bs = fx.bs ?? 4;
    for (let by = 0; by < h; by += bs) for (let bx = 0; bx < w; bx += bs) {
      if (RNG('pxblk', bx, by, B).f() >= fx.blocks) continue;
      const m = [0, 0, 0]; let n = 0;
      for (let y = by; y < Math.min(h, by + bs); y++) for (let x = bx; x < Math.min(w, bx + bs); x++) { const i = (y * w + x) * 4; m[0] += d[i]; m[1] += d[i + 1]; m[2] += d[i + 2]; n++; }
      for (let y = by; y < Math.min(h, by + bs); y++) for (let x = bx; x < Math.min(w, bx + bs); x++) { const i = (y * w + x) * 4; d[i] = m[0] / n; d[i + 1] = m[1] / n; d[i + 2] = m[2] / n; }
    }
  }
  if (fx.noise) {
    const R = RNG('pxnoise', w, B), a = fx.noiseAmt ?? 40;
    for (let k = 0; k < fx.noise; k++) { const i = R.i(0, w * h - 1) * 4, v = R.n(a); if (!d[i + 3]) continue; d[i] += v + R.n(a * 0.5); d[i + 1] += v + R.n(a * 0.5); d[i + 2] += v + R.n(a * 0.5); }
  }
  if (fx.posterize) { const L = fx.posterize - 1; for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] / 255 * L) * 255 / L; }
  if (fx.pal) {
    const pal = (Array.isArray(fx.pal) ? fx.pal : Object.values(fx.pal)).map(rgbOf), memo = new Map();
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      let p = memo.get(key);
      if (!p) { let bd = 1e9; for (const q of pal) { const e = (d[i] - q[0]) ** 2 * 0.3 + (d[i + 1] - q[1]) ** 2 * 0.59 + (d[i + 2] - q[2]) ** 2 * 0.11; if (e < bd) { bd = e; p = q; } } memo.set(key, p); }
      d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
}

// ---------------------------------------------------------------------
//  the bitmap font: 5x7 glyphs, one number per row (bit 16 = left column).
//  A-Z, 0-9 and  . , ! ? : - + / ' " > < * = ( ) # % _ $   (lower case is drawn as upper case)
// ---------------------------------------------------------------------
const FONT5 = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14], D: [28, 18, 17, 17, 17, 18, 28],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16], G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17], S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 17, 10, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31], 3: [31, 2, 4, 2, 1, 17, 14],
  4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14], 6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8],
  8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  '.': [0, 0, 0, 0, 0, 12, 12], ',': [0, 0, 0, 0, 12, 4, 8], '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4],
  ':': [0, 12, 12, 0, 12, 12, 0], '-': [0, 0, 0, 31, 0, 0, 0], '+': [0, 4, 4, 31, 4, 4, 0], '/': [1, 1, 2, 4, 8, 16, 16],
  "'": [4, 4, 8, 0, 0, 0, 0], '"': [10, 10, 0, 0, 0, 0, 0], '>': [8, 4, 2, 1, 2, 4, 8], '<': [2, 4, 8, 16, 8, 4, 2],
  '*': [0, 4, 21, 14, 21, 4, 0], '=': [0, 0, 31, 0, 31, 0, 0], '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8],
  '#': [10, 10, 31, 10, 31, 10, 10], '%': [24, 25, 2, 4, 8, 19, 3], _: [0, 0, 0, 0, 0, 0, 31], $: [4, 15, 20, 14, 5, 30, 4],
};
const pixTextW = (str, sc = 1) => Math.max(0, String(str).length * 6 * sc - sc);
// pixel text, top-left at (x, y) in pixels; 6 px advance per glyph at scale 1, 7 px tall.
// o: scale (whole number), count (typing reveal: glyphs shown), align 'left' | 'center' | 'right', shadow '#hex',
//    cursor (true or '#hex': a blinking block after the last typed glyph while typing)
function pixText(str, x, y, c, o = {}) {
  const sc = Math.max(1, Math.round(o.scale ?? 1)), s = String(str).toUpperCase(), n = clamp(Math.floor(o.count ?? s.length), 0, s.length), tw = pixTextW(s, sc);
  const x0 = Math.round(x - (o.align === 'center' ? Math.floor(tw / 2) : o.align === 'right' ? tw : 0)), y0 = Math.round(y);
  const draw = (ox, oy, col) => {
    ctx.fillStyle = col;
    for (let k = 0; k < n; k++) {
      const gl = FONT5[s[k]] || FONT5[' '];
      for (let r = 0; r < 7; r++) {
        const bits = gl[r]; if (!bits) continue;
        for (let b = 0; b < 5; b++) {
          if (!(bits & (16 >> b))) continue;
          let e = b; while (e + 1 < 5 && bits & (16 >> (e + 1))) e++;   // one rect per run of lit pixels
          cellR(ox + k * 6 * sc + b * sc, oy + r * sc, (e - b + 1) * sc, sc); b = e;
        }
      }
    }
  };
  if (o.shadow) draw(x0 + sc, y0 + sc, o.shadow);
  draw(x0, y0, c);
  if (o.cursor && n < s.length && B % 4 < 2) prect(x0 + n * 6 * sc, y0, 5 * sc, 7 * sc, o.cursor === true ? c : o.cursor);
  return tw;
}

// ---------------------------------------------------------------------
//  sprites from string arrays: rows like '..XX..', map { X: '#hex' }; '.' and ' ' are clear
//  o: flip (mirror), scale (whole number), anchor 'tl' (default) | 'c' | 'bc' (bottom centre: stand it on a floor)
// ---------------------------------------------------------------------
function sprite(rows, map, x, y, o = {}) {
  const sc = Math.max(1, Math.round(o.scale ?? 1)), w = rows[0].length, h = rows.length;
  let x0 = Math.round(x), y0 = Math.round(y);
  if (o.anchor === 'c') { x0 -= Math.floor(w * sc / 2); y0 -= Math.floor(h * sc / 2); }
  else if (o.anchor === 'bc') { x0 -= Math.floor(w * sc / 2); y0 -= h * sc; }
  for (let j = 0; j < h; j++) {
    const row = rows[j], at = (i) => row[o.flip ? w - 1 - i : i];
    for (let i = 0; i < w;) {
      const ch = at(i); let k = i + 1;
      while (k < w && at(k) === ch) k++;
      const col = map[ch];
      if (col) { ctx.fillStyle = col; cellR(x0 + i * sc, y0 + j * sc, (k - i) * sc, sc); }
      i = k;
    }
  }
  return [w * sc, h * sc];
}
// a few stock sprites (map 'a' = main colour, 'b' = accent)
const SPR = {
  spark: ['..a..', '..a..', 'aabaa', '..a..', '..a..'],
  twinkle: ['.a.', 'aba', '.a.'],
  heart: ['.aa.aa.', 'abaaaaa', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'],
  note: ['..aaa', '..a.a', '..a..', 'aaa..', 'aaa..'],
};

// ---------------------------------------------------------------------
//  the hero: a round critter with ears, feet and big eyes, rasterised at any size (so it looks native to
//  every era's resolution). 2-frame idle: squash on every other beat, ears flick, feet stay planted.
//  (x, y) = body centre in pixels, r = body radius in pixels (>= 3). Sets SPARK_AT (screen coords).
//  o: pal { ink, body, light, dark, eye, pupil, cheek }, mood 'smile' | 'wow' | 'happy', look [dx, dy] (-1..1),
//     hop (pixels up), frame (0/1, default: flips on the beat), blink, key
// ---------------------------------------------------------------------
const HERO_PAL = { ink: PAL16.ink, body: PAL16.orange, light: PAL16.yellow, dark: PAL16.red, eye: PAL16.white, pupil: PAL16.ink, cheek: PAL16.pink };
const HERO_HH = { ink: HANDHELD[0], body: HANDHELD[2], light: HANDHELD[3], dark: HANDHELD[1], eye: HANDHELD[3], pupil: HANDHELD[0] };
function pixHero(x, y, r, o = {}) {
  const pal = o.pal || HERO_PAL, key = o.key ?? 'hero', ink = pal.ink;
  r = Math.max(3, Math.round(r));
  const fr = o.frame ?? (Math.floor(TT / BEAT + 1e-6) % 2);
  const rx = r + fr, ry = r - fr, cx = Math.round(x), cy = Math.round(y) - Math.round(o.hop ?? 0) + fr;
  const inside = (i, j) => (i / (rx + 0.5)) ** 2 + (j / (ry + 0.5)) ** 2 <= 1;
  // ears: little stepped triangles, drawn first so the head covers their base
  const eh = Math.max(1, Math.round(r * 0.38)), ex = Math.round(rx * 0.5) + fr, top = cy - ry;
  for (const s of [-1, 1]) for (let k = 0; k <= eh; k++) {
    const wk = eh + 1 - k, x0 = cx + s * ex - Math.floor(wk / 2);
    prect(x0, top - k, wk, 1, ink);
    if (wk >= 3 && k < eh) prect(x0 + 1, top - k, wk - 2, 1, k === 0 ? pal.body : pal.light);
  }
  // body: ink rim, light top-left, dark bottom-right, dithered between
  for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) {
    if (!inside(i, j)) continue;
    let col;
    if (!inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)) col = ink;
    else {
      const u = -i / rx - j / ry, b = bayer(i + 64, j + 64);
      col = clamp((u - 0.6) * 1.5) > b ? pal.light : clamp((-u - 0.45) * 1.4) > b ? pal.dark : pal.body;
    }
    ctx.fillStyle = col; cellR(cx + i, cy + j, 1, 1);
  }
  // feet (planted: they ignore the squash)
  const fw = Math.max(2, Math.round(r / 3)), fh = Math.max(1, Math.round(r / 8)), fy = Math.round(y) - Math.round(o.hop ?? 0) + r + 1;
  for (const s of [-1, 1]) prect(cx + s * Math.round(r * 0.45) - Math.floor(fw / 2), fy, fw, fh, ink);
  // eyes
  const es = Math.max(1, Math.round(r / 5)), ew = es + 1, wow = o.mood === 'wow', ehh = es + 1 + (wow ? 1 : 0);
  const eo = Math.max(2, Math.round(rx * 0.42)), ey = cy - Math.round(ry * 0.12);
  const [lx, ly] = o.look || [0, 0], blink = o.blink || (B + key.length * 7) % 37 < 2;
  for (const s of [-1, 1]) {
    const ex0 = cx + s * eo - Math.floor(ew / 2), ey0 = ey - Math.floor(ehh / 2);
    if (o.mood === 'happy') { for (let k = -es; k <= es; k++) prect(cx + s * eo + k, ey - (es - Math.abs(k)), 1, 1, ink); continue; }
    if (blink) { prect(ex0, ey0 + ehh - 1, ew, 1, ink); continue; }
    prect(ex0, ey0, ew, ehh, pal.eye);
    const ps = es, px = ex0 + (lx > 0.3 ? ew - ps : lx < -0.3 ? 0 : Math.floor((ew - ps) / 2)), py = ey0 + (ly < -0.3 ? 0 : ehh - ps);   // pupils rest low; look up lifts them
    prect(px, py, ps, ps, pal.pupil);
  }
  // mouth and cheeks
  const my = cy + Math.max(2, Math.round(ry * 0.38)), mw = Math.max(1, Math.round(r / 6));
  if (wow) prect(cx - Math.floor(mw / 2), my, mw + 1, mw + 1, ink);
  else if (o.mood === 'happy') { prect(cx - mw, my, 2 * mw + 1, 1, ink); prect(cx - mw - 1, my - 1, 1, 1, ink); prect(cx + mw + 1, my - 1, 1, 1, ink); }
  else prect(cx - Math.floor(mw / 2), my, mw + 1, 1, ink);
  if (pal.cheek && r >= 6) for (const s of [-1, 1]) prect(cx + s * (eo + es) - (s < 0 ? 1 : 0), my - 1, 2, 1, pal.cheek);
  SPARK_AT = pixToScreen(cx, cy);
  return { top: top - eh, foot: fy + fh };
}
// a speech bubble with pixel text (or one glyph, like '!'), tail pointing down at (x, y)
function pixBubble(str, x, y, o = {}) {
  const tw = pixTextW(str), w = tw + 6, h = 13, x0 = Math.round(x - Math.floor(w / 2)), y0 = Math.round(y) - h - 3;
  pixBox(x0, y0, w, h, o);
  prect(Math.round(x) - 1, y0 + h - 1, 3, 2, o.bg ?? PAL16.white); prect(Math.round(x), y0 + h + 1, 1, 2, o.edge ?? PAL16.ink);
  prect(Math.round(x) - 2, y0 + h - 1, 1, 2, o.edge ?? PAL16.ink); prect(Math.round(x) + 2, y0 + h - 1, 1, 2, o.edge ?? PAL16.ink);
  pixText(str, x0 + 3, y0 + 3, o.fg ?? PAL16.ink, { count: o.count });
}
// a UI panel: 1-pixel border with clipped (rounded) corners, fill, optional drop shadow one pixel down-right
function pixBox(x, y, w, h, o = {}) {
  x = Math.round(x); y = Math.round(y);
  if (o.shadow) { prect(x + 2, y + 1, w - 2, h, o.shadow); prect(x + 1, y + 2, w, h - 2, o.shadow); }
  const e = o.edge ?? PAL16.ink;
  prect(x + 1, y, w - 2, h, e); prect(x, y + 1, w, h - 2, e);
  prect(x + 1, y + 1, w - 2, h - 2, o.bg ?? PAL16.white);
}

// ---------------------------------------------------------------------
//  captions and tags: drawn after the camera (DEFER), in the era's own resolution, in the pixel font
//  pixCaption(str, o): a panel at caption height that types itself on (E0 + 0.45 over 0.6 s)
//  pixTag(str, o): a level/year tag top-left that pops in at E0 + 0.2 (one boil at double size, then 1x)
//  pixOverlay(draw): any other screen-fixed pixel layer (a HUD, a score), in the current era's resolution
//  o: res ([w, h], default the current lowres), fg, bg, edge, shadow, scale, x / cx (screen), y (screen), at, dur
// ---------------------------------------------------------------------
const pixDefer = (f) => { if (DEFER) DEFER.push(f); else f(); };
const curRes = (o) => o.res ?? (PIX.depth > 0 ? [PIX.w, PIX.h] : resOf(8));
function pixCaption(str, o = {}) {
  const res = curRes(o);
  pixDefer(() => {
    if (TT < E0 + (o.at ?? 0.45)) return;
    lowres(res, (w) => {
      const s = W / w, sc = o.scale ?? 1, tw = pixTextW(str, sc), bw = tw + 6 * sc, bh = 7 * sc + 6 * sc;
      const x0 = Math.round((o.cx ?? CX) / s - bw / 2), y0 = Math.round((o.y ?? 1440) / s - bh / 2);
      pixBox(x0, y0, bw, bh, { bg: o.bg ?? PAL16.ink, edge: o.edge ?? PAL16.white, shadow: o.shadow });
      const n = Math.floor(ev(E0 + (o.at ?? 0.45), o.dur ?? 0.6) * str.length + 1e-6);
      pixText(str, x0 + 3 * sc, y0 + 3 * sc, o.fg ?? PAL16.white, { scale: sc, count: n, cursor: o.cursor ?? true });
    });
  });
}
function pixTag(str, o = {}) {
  const res = curRes(o);
  pixDefer(() => {
    const t0 = E0 + (o.at ?? 0.2); if (TT < t0) return;
    lowres(res, (w) => {
      const s = W / w, sc = (o.scale ?? 1) * (TT < t0 + 0.08 ? 2 : 1), bw = pixTextW(str, sc) + 6 * sc, bh = 13 * sc;
      const x0 = Math.round((o.x ?? 70) / s), y0 = Math.round((o.y ?? 290) / s);
      pixBox(x0, y0, bw, bh, { bg: o.bg ?? PAL16.ink, edge: o.edge ?? PAL16.yellow, shadow: o.shadow });
      pixText(str, x0 + 3 * sc, y0 + 3 * sc, o.fg ?? PAL16.yellow, { scale: sc });
    });
  });
}
function pixOverlay(draw, o = {}) { const res = curRes(o); pixDefer(() => lowres(res, draw)); }

// ---------------------------------------------------------------------
//  the grid the hooks use: the current era's pixel size (from ERA_RES), stepped finer/coarser through a morph
// ---------------------------------------------------------------------
const PIX_GRIDS = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40];
function gridOfEra(e) { return typeof ERA_RES !== 'undefined' && ERA_RES[e] ? W / resOf(ERA_RES[e])[0] : 8; }
const eraLook = (e) => (typeof ERA_POST !== 'undefined' && ERA_POST[Math.max(0, e)]) || null;
// an era's palette (ERA_POST[e].pal; default every kit colour): what the backdrop and the blob may dither with.
// The paper itself is snapped to it too, so a handheld era fades to its own darkest green, not to the ink.
function eraPal(...es) { const out = []; for (const e of es) { const p = eraLook(e)?.pal; out.push(...(p ? (Array.isArray(p) ? p : Object.values(p)) : PIX_ALL)); } return out; }
function gridAt(t) {
  const br = typeof BRIDGES !== 'undefined' ? BRIDGES.find((r) => Math.abs(t - r.tc) < 0.2 + 1e-6) : null;
  if (!br) return gridOfEra(Math.max(0, eraAt(t)));
  const a = gridOfEra(eraAt(br.tc - 0.01)), b = gridOfEra(eraAt(br.tc + 0.01)), want = a * (b / a) ** EZ.io(seg(t, br.tc - 0.2, br.tc + 0.2));
  return PIX_GRIDS.reduce((best, v) => (Math.abs(Math.log(v / want)) < Math.abs(Math.log(best / want)) ? v : best));
}
// outline P (screen coords) rasterised on a G-px grid: { M (1 = inside), cols, rows }
function gridMask(P, G) {
  const cols = Math.ceil(W / G), rows = Math.ceil(H / G), M = new Uint8Array(cols * rows);
  const Q = P.map(([x, y]) => [x / G, y / G]), bb = bbox(Q), y0 = clamp(Math.floor(bb.y0), 0, rows), y1 = clamp(Math.ceil(bb.y1) + 1, 0, rows);
  polySpans(Q, y0, y1).forEach((sp, k) => sp.forEach(([a, b]) => { for (let i = Math.max(0, a); i < Math.min(cols, b); i++) M[(y0 + k) * cols + i] = 1; }));
  return { M, cols, rows };
}
function maskRing(m) {   // the cells just outside the mask (8-neighbour): a stepped one-pixel rim
  const { M, cols, rows } = m, O = new Uint8Array(M.length);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (M[j * cols + i]) continue;
    let hit = 0;
    for (let v = -1; v <= 1 && !hit; v++) for (let u = -1; u <= 1; u++) { const x = i + u, y = j + v; if (x >= 0 && y >= 0 && x < cols && y < rows && M[y * cols + x]) { hit = 1; break; } }
    O[j * cols + i] = hit;
  }
  return { M: O, cols, rows };
}
const maskOr = (a, b) => ({ M: a.M.map((v, i) => v | b.M[i]), cols: a.cols, rows: a.rows });
function maskPath(m, G, dx = 0, dy = 0) {   // one rect per run of cells
  const { M, cols, rows } = m; ctx.beginPath();
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols;) {
    if (!M[j * cols + i]) { i++; continue; }
    let k = i + 1; while (k < cols && M[j * cols + k]) k++;
    ctx.rect((i + dx) * G, (j + dy) * G, (k - i) * G, G); i = k;
  }
}

// ---------------------------------------------------------------------
//  screen effects after every frame (STYLE.post), on the era's grid: o = { scan, lcd, vignette } (alphas); o.rim = [light, dark]
//  sets the morph window's rim colours for that era (default PIX_UI: white and ink); o.pal = the era's palette, which
//  the backdrop and the morphing blob dither with (default: every kit palette)
//    scan: the bottom third of every pixel row darkened (a CRT)      lcd: a thin gap between pixels (a handheld)
//    vignette: dithered, stepped darkening into the corners (a curved tube)
// ---------------------------------------------------------------------
function pixPost(o, G) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (o.lcd) {
    const lw = Math.max(1, Math.round(G / 8)); ctx.fillStyle = `rgba(0,0,0,${o.lcd})`; ctx.beginPath();
    for (let x = G - lw; x < W; x += G) ctx.rect(x, 0, lw, H);
    for (let y = G - lw; y < H; y += G) ctx.rect(0, y, W, lw);
    ctx.fill();
  }
  if (o.scan) {
    const sh = Math.max(1, Math.round(G / 3)); ctx.fillStyle = `rgba(0,0,0,${o.scan})`; ctx.beginPath();
    for (let y = G - sh; y < H; y += G) ctx.rect(0, y, W, sh);
    ctx.fill();
  }
  if (o.vignette) {
    const cols = Math.ceil(W / G), rows = Math.ceil(H / G); ctx.fillStyle = `rgba(0,0,0,${o.vignette})`; ctx.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const dx = (i + 0.5) / cols * 2 - 1, dy = (j + 0.5) / rows * 2 - 1, v = clamp(((dx ** 4 + dy ** 4) ** 0.25 - 0.86) / 0.16);
      if (v > bayer(i, j)) ctx.rect(i * G, j * G, G, G);
    }
    ctx.fill();
  }
  ctx.restore();
}

// =====================================================================
//  STYLE — the renderer's hooks (see styles/README.md)
// =====================================================================
const STYLE = {
  name: 'pixdoc',
  paper: PAL16.ink,   // a dark pixel ground: morphs happen on a blank screen
  backdrop(c) {   // colour c as an ordered dither of the two palette colours that mix closest to it, on the era's grid
    const [a, b, t] = ditherPair(c, eraPal(eraAt(TT))), G = gridAt(TT), cols = Math.ceil(W / G), rows = Math.ceil(H / G);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = a; ctx.fillRect(0, 0, W, H);
    if (t > 0) { ctx.fillStyle = b; ctx.beginPath(); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (t > bayer(i, j)) ctx.rect(i * G, j * G, G, G); ctx.fill(); }
    ctx.restore();
  },
  window(P, key, src) {   // the old/new world seen through P rasterised on the era's grid: stepped edge, 1-pixel rims, shadow
    const G = gridAt(TT), m = gridMask(P, G), r1 = maskRing(m), u1 = maskOr(m, r1), r2 = maskRing(u1);
    const eo = eraLook(eraAt(TT)), [rl, rd] = (eo && eo.rim) || [PIX_UI.light, PIX_UI.dark];
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PIX_UI.shadow; maskPath(maskOr(u1, r2), G, 1, 1); ctx.fill();
    ctx.fillStyle = rd; maskPath(r2, G); ctx.fill();
    ctx.fillStyle = rl; maskPath(r1, G); ctx.fill();
    maskPath(m, G); ctx.clip(); ctx.drawImage(src, 0, 0);
    ctx.restore();
  },
  blob(P, c, key) {   // the morphing shape as chunky pixels: the grid steps from one era's resolution to the next
    const G = gridAt(TT), m = gridMask(P, G), { M, cols, rows } = m;
    const br = typeof BRIDGES !== 'undefined' ? BRIDGES.find((r) => Math.abs(TT - r.tc) < 0.2 + 1e-6) : null, bp = br ? eraPal(eraAt(br.tc - 0.01), eraAt(br.tc + 0.01)) : eraPal(eraAt(TT));
    let sx = 0, sy = 0, n = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (M[j * cols + i]) { sx += i; sy += j; n++; }
    if (!n) return;
    const cx = sx / n, cy = sy / n, rr = Math.sqrt(n / Math.PI), [ca, cb, ct] = ditherPair(c, bp), lt = nearestC(shadeC(c, 0.45), bp), dk = nearestC(shadeC(c, -0.4), bp);
    const groups = { [ca]: [], [cb]: [], [lt]: [], [dk]: [] };   // palette colours only: the mix is dithered
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (!M[j * cols + i]) continue;
      const u = (-(i - cx) - (j - cy)) / rr, b = bayer(i, j);
      groups[clamp((u - 0.55) * 1.4) > b ? lt : clamp((-u - 0.5) * 1.4) > b ? dk : ct > bayer(i + 2, j + 1) ? cb : ca].push([i, j]);
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PIX_UI.dark; maskPath(maskRing(m), G); ctx.fill();
    for (const col in groups) { ctx.fillStyle = col; ctx.beginPath(); for (const [i, j] of groups[col]) ctx.rect(i * G, j * G, G, G); ctx.fill(); }
    ctx.restore();
  },
  hero(x, y, r, o) { const G = gridAt(TT); withGrid(G, () => pixHero(x / G, y / G, (r * 0.6) / G, { ...o, pal: o.pal || HERO_PAL, key: o.key })); },
  heroColor: PAL16.orange,
  heroPts: (x, y, r) => ellipsePts(x, y, r * 0.6, r * 0.6, 0, 96),
  post() { const o = eraLook(eraAt(TT)); if (o) pixPost(o, gridAt(TT)); },
  ones: false,   // on 2s: TT steps at 12 fps, so a 1-pixel-per-step move is a steady 12 px/s and sprites flip on beats
};

// =====================================================================
//  DOC LAYER — documentary pixel look: a fine-grained 270x480 world (4 px pixels), a navy subtitle bar that
//  types itself on, amber labels, circular "loupe" insets with a gilded rim, static paper/stone speckle.
//  Text lives on a 180x320 grid (6 px pixels) so it stays readable on a phone.
// =====================================================================
const DOC_RES = [270, 480], DOC_TXT = [180, 320];
const DOC = {
  bar: '#050716', ink: '#010208', cap: '#eef0ea', amber: '#f0b23c', amberDk: '#7a4a10', red: '#e0302a', redDk: '#7a1410',
  sky0: '#4f78ab', sky1: '#5f88b8', sky2: '#7ea2c8', sky3: '#aac2d8', sky4: '#e2dcc4',
  paper: '#f2e4c2', paper2: '#e3d1a8', paperDk: '#b9a47a', sea: '#8fb0c4', sea2: '#7598b0',
  grass: '#678239', grass2: '#98a758', grassDk: '#3f5a26', field: '#c9b16a',
  stone: '#d9cba6', stone2: '#c4b38a', stoneDk: '#8d7d5a', slate: '#4a5468', slate2: '#5d6a80', slateDk: '#2e3444',
  wood: '#6a4426', wood2: '#8a5a32', woodDk: '#3e2614', iron: '#1c1e26', iron2: '#3a3e4a',
  skin: '#e8b48c', skinDk: '#b77c5a', coat: '#16161e', coat2: '#2c2c3a', shirt: '#f0ece0',
  gold: '#c8902e', goldLt: '#f2cc6a', goldDk: '#5a3812', shadow: '#0a0c14',
  chalk: '#24402e', chalk2: '#33573f',
};

// static speckle (does not boil): colour c on a fraction amt of the pixels of a rect
const dhash = (i, j, s) => { let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function ptex(x, y, w, h, c, amt, seed = 1) {
  ctx.fillStyle = c;
  for (let j = Math.round(y); j < y + h; j++) for (let i = Math.round(x); i < x + w; i++) if (dhash(i, j, seed) < amt) cellR(i, j, 1, 1);
}
// a thick straight bar from (x0, y0) to (x1, y1), width wd (semaphore arms, poles, beams)
function pbeam(x0, y0, x1, y1, wd, c) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * wd / 2, ny = dx / L * wd / 2;
  ppoly([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], c);
}
// a cumulus: a cluster of discs, a light top and a dithered shadow underside
function pcloud(x, y, w, seed = 1, o = {}) {
  const R = RNG('cloud', seed), n = Math.max(3, Math.round(w / 7)), lt = o.lt ?? '#f4f4f0', dk = o.dk ?? '#c8d2dc';
  for (let k = 0; k < n; k++) { const u = k / (n - 1), r = Math.round(w * 0.16 * (1 - Math.abs(u - 0.5)) + 2 + R.i(0, 2)); pcircle(x + u * w, y - r * 0.5, r, lt); }
  pdither(x - 4, y - 2, w + 8, 5, null, dk, (i, j) => (j - (y - 2)) / 5);
}
// the bitmap font with Spanish marks: NFD splits Á into A + a combining mark drawn above (rows -3..-2) or below
const DOC_GLYPH = { '¿': [4, 0, 4, 8, 16, 17, 14], '¡': [4, 0, 4, 4, 4, 4, 4], ';': [0, 12, 12, 0, 12, 4, 8], '…': [0, 0, 0, 0, 0, 0, 21], '’': [4, 4, 8, 0, 0, 0, 0], '↑': [4, 14, 21, 4, 4, 4, 4], '↓': [4, 4, 4, 4, 21, 14, 4], '·': [0, 0, 0, 12, 12, 0, 0], '²': [12, 2, 4, 8, 14, 0, 0], '↻': [14, 17, 1, 1, 17, 14, 0], '↺': [14, 17, 16, 16, 17, 14, 0], '≈': [0, 13, 22, 0, 13, 22, 0], '×': [0, 17, 10, 4, 10, 17, 0], '¹': [4, 12, 4, 4, 14, 0, 0], '⁹': [14, 10, 14, 2, 14, 0, 0], '°': [12, 18, 18, 12, 0, 0, 0] };
const DOC_MARK = { '́': [[3, -3], [2, -2]], '̀': [[1, -3], [2, -2]], '̃': [[0, -2], [1, -3], [2, -3], [3, -2], [4, -3]], '̈': [[1, -2], [3, -2]], '̧': [[2, 7], [2, 8], [1, 8]] };
// lower case for chemical symbols (Fe, Si, He, Ne): a string starting with '~' keeps its case ('~Fe')
const DOC_LOWER = { e: [0, 0, 14, 17, 31, 16, 14], i: [4, 0, 12, 4, 4, 4, 14], a: [0, 0, 14, 1, 15, 17, 15], o: [0, 0, 14, 17, 17, 17, 14], n: [0, 0, 22, 25, 17, 17, 17], r: [0, 0, 22, 25, 16, 16, 16], u: [0, 0, 17, 17, 17, 19, 13], l: [12, 4, 4, 4, 4, 4, 14], g: [0, 15, 17, 17, 15, 1, 14] };
const docChars = (s) => { s = String(s); return s[0] === '~' ? Array.from(s.slice(1).normalize('NFC')) : Array.from(s.toUpperCase().normalize('NFC')); };
const docTextW = (s, sc = 1) => Math.max(0, docChars(s).length * 6 * sc - sc);
function docText(str, x, y, c, o = {}) {
  const sc = Math.max(1, Math.round(o.scale ?? 1)), cs = docChars(str), n = clamp(Math.floor(o.count ?? cs.length), 0, cs.length), tw = docTextW(str, sc);
  const x0 = Math.round(x - (o.align === 'center' ? Math.floor(tw / 2) : o.align === 'right' ? tw : 0)), y0 = Math.round(y);
  const draw = (ox, oy, col) => {
    ctx.fillStyle = col;
    for (let k = 0; k < n; k++) {
      const [base, ...marks] = Array.from(cs[k].normalize('NFD')), gl = DOC_GLYPH[base] || DOC_LOWER[base] || FONT5[base] || FONT5[' '], gx = ox + k * 6 * sc;
      for (let r = 0; r < 7; r++) { const bits = gl[r]; if (!bits) continue; for (let b = 0; b < 5; b++) if (bits & (16 >> b)) cellR(gx + b * sc, oy + r * sc, sc, sc); }
      for (const m of marks) for (const [mx, my] of DOC_MARK[m] || []) cellR(gx + mx * sc, oy + my * sc, sc, sc);
    }
  };
  if (o.outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) draw(x0 + dx * sc, y0 + dy * sc, o.outline);
  if (o.shadow) draw(x0 + sc, y0 + sc, o.shadow);
  draw(x0, y0, c);
  return tw;
}
function docWrap(str, max) {
  const out = []; let cur = '';
  for (const w of String(str).split(/\s+/)) { if (cur && docChars(cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }
  if (cur) out.push(cur);
  return out;
}
// the subtitle: a full-width navy bar near the top (screen y), typed on at cps glyphs/s from t0.
// o: y (screen top, default 250), max (glyphs per line), cps, bar (false: outlined text straight on the picture), until
function docCaption(str, t0, o = {}) {
  pixDefer(() => {
    if (TT < t0 - 1e-6 || (o.until != null && TT >= o.until)) return;
    lowres(DOC_TXT, (w) => {
      const lines = docWrap(str, o.max ?? 26), lh = 11, pad = 5, s = W / w, y0 = Math.round((o.y ?? 250) / s), bh = lines.length * lh + pad * 2 - 1;
      const n = (o.pre ?? 0) + Math.floor((TT - t0) * (o.cps ?? 30) + 1e-6) + 1;
      if (o.bar !== false) {
        prect(0, y0, w, bh, DOC.bar);
        pdither(0, y0 - 1, w, 1, null, DOC.bar, () => 0.5); pdither(0, y0 + bh, w, 1, null, DOC.bar, () => 0.5);
      }
      let k = 0;
      lines.forEach((ln, i) => {
        docText(ln, w / 2, y0 + pad + 2 + i * lh, DOC.cap, { count: n - k, align: 'center', outline: o.bar === false ? DOC.bar : null });
        k += docChars(ln).length + 1;
      });
    });
  });
}
// a label in amber (or o.fg) with a dark outline, screen coords; pops in at o.at (two flickering boils first)
function docLabel(str, sx, sy, o = {}) {
  pixDefer(() => {
    const at = o.at ?? -1; if (TT < at - 1e-6 || (o.until != null && TT >= o.until)) return;
    if (TT < at + 0.17 && B % 2) return;
    lowres(DOC_TXT, (w) => { const s = W / w; docText(str, sx / s, sy / s, o.fg ?? DOC.amber, { align: o.align ?? 'left', outline: o.outline === undefined ? DOC.ink : o.outline, scale: o.scale, count: o.count }); });
  });
}
// a stamp: a red bordered box with text, slammed in at o.at (one boil at double size)
function docStamp(str, sx, sy, o = {}) {
  pixDefer(() => {
    const at = o.at ?? -1; if (TT < at - 1e-6) return;
    lowres(DOC_TXT, (w) => {
      const s = W / w, sc = (o.scale ?? 1) * (TT < at + 0.09 ? 2 : 1), tw = docTextW(str, sc), bw = tw + 8 * sc, bh = 7 * sc + 8 * sc, c = o.fg ?? DOC.red;
      const x0 = Math.round(sx / s - bw / 2), y0 = Math.round(sy / s - bh / 2);
      prect(x0, y0, bw, sc, c); prect(x0, y0 + bh - sc, bw, sc, c); prect(x0, y0, sc, bh, c); prect(x0 + bw - sc, y0, sc, bh, c);
      prect(x0 + 2 * sc, y0 + 2 * sc, bw - 4 * sc, sc, c); prect(x0 + 2 * sc, y0 + bh - 3 * sc, bw - 4 * sc, sc, c);
      docText(str, x0 + 4 * sc, y0 + 4 * sc, c, { scale: sc });
    });
  });
}
// a circular loupe inset at pixel (cx, cy), radius r: inner() draws the inside (clipped), then a gilded rim + shadow
function pdiscPath(cx, cy, r) {
  ctx.beginPath();
  for (let j = -r; j <= r; j++) {
    const hw = Math.floor((r + 0.5) * Math.sqrt(Math.max(0, 1 - (j / (r + 0.5)) ** 2)) + 1e-9), z = PIX.z;
    ctx.rect(Math.round(z * (cx - hw) + PIX.tx), Math.round(z * (cy + j) + PIX.ty), Math.round(z * (2 * hw + 1)), Math.round(z));
  }
}
function docIris(cx, cy, r, inner, o = {}) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r); if (r < 3) return;
  pdither(cx - r - 3, cy - r + 1, 2 * r + 9, 2 * r + 9, null, DOC.shadow, (i, j) => (Math.hypot(i - cx - 2, j - cy - 4) <= r + 3 ? 0.6 : 0));
  ctx.save(); pdiscPath(cx, cy, r); ctx.clip(); inner(cx, cy, r); ctx.restore();
  const rim = o.rim ?? [DOC.goldDk, DOC.gold, DOC.goldLt];
  pcircle(cx, cy, r + 4, rim[0], { ring: 1 }); pcircle(cx, cy, r + 3, rim[1], { ring: 3 }); pcircle(cx, cy, r + 1, rim[0], { ring: 1 });
  ctx.fillStyle = rim[2];
  for (let a = 0; a < 64; a++) { const th = Math.PI * (0.95 + a / 64 * 0.6), px = Math.round(cx + Math.cos(th) * (r + 2.5)), py = Math.round(cy + Math.sin(th) * (r + 2.5)); cellR(px, py, 1, 1); }
}
// radius of an iris that opens at t0 (stepped spring, a small overshoot) and closes at t1
const irisR = (t0, r, t1 = 1e9) => Math.round(r * clamp(springMove(t0, 0, 1, SPRING.snappy)) * (1 - ev(t1, 0.25)));
// a gentleman in a frock coat and top hat, feet at (x, y) in pixels, ~44 px tall. o: flip, arm ('up' | 'point'), coat, hat, walk (frame)
function docMan(x, y, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const coat = o.coat ?? DOC.coat, c2 = o.coat2 ?? DOC.coat2, s = o.flip ? -1 : 1, wf = o.walk ?? 0;
  // legs
  prect(x - 4 + (wf ? 1 : 0), y - 13, 3, 13, DOC.coat2); prect(x + 1 - (wf ? 1 : 0), y - 13, 3, 13, DOC.coat2);
  prect(x - 5 + (wf ? 1 : 0), y - 1, 5, 1, DOC.ink); prect(x + 1 - (wf ? 1 : 0), y - 1, 5, 1, DOC.ink);
  // coat: tails flare, lapels, shirt front
  ppoly([[x - 6, y - 32], [x + 6, y - 32], [x + 7, y - 12], [x - 7, y - 12]], coat);
  prect(x - 6, y - 32, 1, 18, c2);
  ppoly([[x - 2, y - 32], [x + 2, y - 32], [x, y - 25]], DOC.shirt);
  pset(x, y - 31, DOC.ink); pset(x, y - 30, DOC.ink);
  // arms
  if (o.arm === 'up') { pbeam(x + 6 * s, y - 30, x + 10 * s, y - 40, 3, coat); prect(x + 9 * s - 1, y - 43, 3, 3, DOC.skin); }
  else if (o.arm === 'point') { pbeam(x + 6 * s, y - 29, x + 14 * s, y - 27, 3, coat); prect(x + 14 * s - 1, y - 28, 3, 2, DOC.skin); }
  else { prect(x + (s > 0 ? 6 : -8), y - 31, 2, 15, c2); prect(x + (s > 0 ? 6 : -8), y - 16, 2, 2, DOC.skin); }
  prect(x + (s > 0 ? -8 : 6), y - 31, 2, 15, c2); prect(x + (s > 0 ? -8 : 6), y - 16, 2, 2, DOC.skin);
  // head: face, sideburns, eye, hat
  prect(x - 3, y - 39, 7, 7, DOC.skin); prect(x - 3, y - 39, 1, 6, o.hair ?? '#3a2618'); prect(x + 3, y - 39, 1, 6, o.hair ?? '#3a2618');
  pset(x + (s > 0 ? 1 : -1), y - 37, DOC.ink); prect(x - 1, y - 34, 3, 1, DOC.skinDk);
  if (o.beard) prect(x - 3, y - 35, 7, 3, o.hair ?? '#3a2618');
  prect(x - 5, y - 40, 11, 1, DOC.ink); prect(x - 3, y - 47, 7, 7, DOC.ink); prect(x - 3, y - 42, 7, 1, '#3c3c48');
}
// a soft cast shadow: a dithered dark ellipse (amt 0..1) centred at (x, y)
function docShadow(x, y, rx, ry, amt = 0.5, c = DOC.shadow) {
  pdither(x - rx - 1, y - ry - 1, 2 * rx + 3, 2 * ry + 3, null, c, (i, j) => { const d = ((i - x) / rx) ** 2 + ((j - y) / ry) ** 2; return d <= 1 ? amt * (1 - d * 0.5) : 0; });
}
// a detailed bust (head and shoulders), bottom centre (x, y), ~26 px wide, ~44 px tall with a top hat.
// o: coat, coat2, hair, hat (true) | cap '#hex' (a judge's toque), jabot (white bands), look (-1 | 1), glasses, beard, talk, key
function docBust(x, y, o = {}) {
  x = Math.round(x); y = Math.round(y);
  const coat = o.coat ?? DOC.coat, c2 = o.coat2 ?? DOC.coat2, hair = o.hair ?? '#3a2618', s = o.look ?? 1, key = o.key ?? 'bust';
  ppoly([[x - 13, y], [x + 13, y], [x + 10, y - 15], [x - 10, y - 15]], coat);
  prect(x - 10, y - 15, 3, 15, c2); prect(x + 8, y - 13, 2, 13, shadeC(coat, -0.4));
  if (o.jabot) { prect(x - 2, y - 15, 2, 6, '#f4f2ea'); prect(x + 1, y - 15, 2, 6, '#f4f2ea'); }
  else { ppoly([[x - 4, y - 15], [x + 4, y - 15], [x, y - 7]], DOC.shirt); prect(x - 1, y - 14, 3, 2, DOC.ink); ppoly([[x - 5, y - 15], [x - 1, y - 15], [x - 3, y - 9]], c2); ppoly([[x + 5, y - 15], [x + 1, y - 15], [x + 3, y - 9]], c2); }
  prect(x - 2, y - 18, 5, 3, DOC.skinDk);
  prect(x - 5, y - 31, 11, 13, DOC.skin); prect(x + 4, y - 30, 2, 11, DOC.skinDk);
  prect(x - 6, y - 27, 1, 4, DOC.skinDk); prect(x + 6, y - 27, 1, 4, DOC.skinDk);
  prect(x - 5, y - 30, 1, 9, hair); prect(x + 5, y - 30, 1, 9, hair);
  if (o.beard) { prect(x - 5, y - 22, 11, 4, hair); prect(x - 3, y - 19, 7, 2, hair); }
  const blink = (B + key.length * 5) % 41 < 2, ex = x + (s > 0 ? 0 : -1);
  prect(ex - 3, y - 27, 3, 1, hair); prect(ex + 2, y - 27, 3, 1, hair);
  if (blink) { prect(ex - 3, y - 25, 2, 1, DOC.skinDk); prect(ex + 2, y - 25, 2, 1, DOC.skinDk); }
  else { prect(ex - 3, y - 25, 2, 2, '#f4f0e6'); prect(ex + 2, y - 25, 2, 2, '#f4f0e6'); pset(ex - 3 + (s > 0 ? 1 : 0), y - 25, DOC.ink); pset(ex + 2 + (s > 0 ? 1 : 0), y - 25, DOC.ink); }
  if (o.glasses) { prect(ex - 4, y - 26, 4, 1, '#c8d0d8'); prect(ex + 1, y - 26, 4, 1, '#c8d0d8'); }
  prect(x + (s > 0 ? 1 : 0), y - 24, 1, 3, DOC.skinDk);
  prect(x - 1, y - 21, 3, o.talk && B % 2 ? 2 : 1, '#9a5a4a');
  if (o.cap) { prect(x - 6, y - 35, 13, 5, o.cap); prect(x - 6, y - 31, 13, 1, shadeC(o.cap, -0.4)); prect(x - 5, y - 36, 11, 1, shadeC(o.cap, 0.2)); }
  else if (o.hat !== false) { prect(x - 8, y - 32, 17, 2, DOC.ink); prect(x - 5, y - 43, 11, 11, DOC.ink); prect(x - 5, y - 35, 11, 2, '#3c3c48'); prect(x - 4, y - 43, 1, 8, '#2c2c38'); }
  else prect(x - 5, y - 32, 11, 3, hair);
}
// the camera's idle float (screen-steady handheld drift): whole-pixel offsets, scaled per layer by depth
const docFloat = (seed = 0, amp = 2) => ({ dx: amp * Math.sin(TT * 0.55 + seed), dy: amp * 0.7 * Math.sin(TT * 0.41 + seed * 2.3) });
// draw fn with everything shifted by whole pixels (a parallax layer: pass cam.dx * depth, cam.dy * depth)
function pshift(dx, dy, fn) { const kx = PIX.tx, ky = PIX.ty; PIX.tx += Math.round(dx) * PIX.z; PIX.ty += Math.round(dy) * PIX.z; try { fn(); } finally { PIX.tx = kx; PIX.ty = ky; } }
// ---- the BOX caption (the space references): a navy box with a 1-cell blue border that opens sideways, then types.
// lines: array of lines; a line is a string or an array of [text, colour] segments (coloured words, e.g. an element)
// o: y (screen top, default 250), cps, until, edge, bg, open (s)
function docBoxCaption(lines, t0, o = {}) {
  pixDefer(() => {
    if (TT < t0 - 1e-6 || (o.until != null && TT >= o.until)) return;
    lowres(DOC_TXT, (w) => {
      const L = lines.map((ln) => (typeof ln === 'string' ? [[ln, DOC.cap]] : ln)), lw = L.map((ln) => docTextW(ln.map((s) => s[0]).join('')));
      const s = W / w, bw = Math.max(Math.max(...lw) + 12, o.minW ?? 140), bh = L.length * 11 + 7, y0 = Math.round((o.y ?? 250) / s), cx = Math.round(w / 2);
      const u = clamp((TT - t0) / (o.open ?? 0.15)), hw = Math.max(2, Math.round(bw / 2 * EZ.o3(u)));
      prect(cx - hw, y0, 2 * hw, bh, o.bg ?? '#050716');
      const e = o.edge ?? '#3a4aa8'; prect(cx - hw, y0, 2 * hw, 1, e); prect(cx - hw, y0 + bh - 1, 2 * hw, 1, e); prect(cx - hw, y0, 1, bh, e); prect(cx + hw - 1, y0, 1, bh, e);
      if (u < 1) return;
      let n = Math.floor((TT - t0 - (o.open ?? 0.15)) * (o.cps ?? 30) + 1e-6) + 1;
      L.forEach((ln, i) => {
        let x = cx - Math.floor(lw[i] / 2); const y = y0 + 5 + i * 11;
        for (const [txt, col] of ln) { const c = docChars(txt).length; if (n > 0) docText(txt, x, y, col, { count: n }); n -= c; x += c * 6; }
      });
    });
  });
}

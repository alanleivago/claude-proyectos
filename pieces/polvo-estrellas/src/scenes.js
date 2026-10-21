// =====================================================================
//  SCENES — polvo de estrellas (style pixdoc, space variant). Drawn at 360x640 (3 px pixels) inside spaceFrame();
//  procedural fields (value noise, polar swirls) are written straight into the low-res ImageData and dithered.
//  Beats join with a mosaic zoom: the picture pixelates (40 → 1 px blocks) while the camera zooms through.
//  One colour per element for the whole piece (EL in the head); rust red = iron = your blood.
// =====================================================================
const D = DOC, CU = TIMELINE.cues, SW = 360, SH = 640, SCX = 180, SCY = 340;
const beatN = () => Math.floor(TT / BEAT + 1e-6);
const shotT = () => TT - E0;
const RGB = (c) => rgbOf(c);
const mix3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

// ---- value noise (deterministic), fbm
const vhash = (i, j, s) => dhash(i, j, s);
function vnoise(x, y, s = 1) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = vhash(i, j, s), b = vhash(i + 1, j, s), c = vhash(i, j + 1, s), d = vhash(i + 1, j + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm = (x, y, s = 1, oct = 3) => { let v = 0, a = 0.5, f = 1; for (let k = 0; k < oct; k++) { v += a * vnoise(x * f, y * f, s + k * 17); f *= 2.03; a *= 0.5; } return v / (1 - 0.5 ** oct); };

// ---- a per-pixel field written into the current low-res canvas: fn(i, j) -> null | [r, g, b] | [r, g, b, cover]
// (cover 0..1 is ordered-dithered against what is already there)
function pfield(x0, y0, w, h, fn) {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); w = Math.min(SW - x0, Math.ceil(w)); h = Math.min(SH - y0, Math.ceil(h));
  if (w <= 0 || h <= 0) return;
  const im = ctx.getImageData(x0, y0, w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const c = fn(x0 + i, y0 + j); if (!c) continue;
    if (c.length > 3 && c[3] < 1 && !(c[3] > bayer(x0 + i, y0 + j))) continue;
    const q = (j * w + i) * 4; d[q] = c[0]; d[q + 1] = c[1]; d[q + 2] = c[2]; d[q + 3] = 255;
  }
  ctx.putImageData(im, x0, y0);
}
// a palette ramp sampled at u (0..1) with a Bayer step between neighbours, so gradients stay pixel-art
function ramp(cols, u, i, j) { const n = cols.length - 1, x = clamp(u) * n, k = Math.min(n - 1, Math.floor(x)), f = x - k; return f > bayer(i, j) ? cols[k + 1] : cols[k]; }

// ---- the frame: space background, stars with parallax, then the scene; o.mosaic = block size (1 = none)
const SPACE = ['#05060f', '#0a0d24', '#141a40'].map(RGB);
function starfield(cam = { dx: 0, dy: 0 }, o = {}) {
  pfill('#05060f');
  for (let k = 0; k < 3; k++) { const d = 0.15 + k * 0.25; for (let n = 0; n < 70 + k * 40; n++) {
    const r = RNG('st', k, n), x = Math.round(mod(r.i(0, SW) + cam.dx * d, SW)), y = Math.round(mod(r.i(0, SH) + cam.dy * d, SH));
    const tw = (B + n * 7) % (19 + k * 6) === 0, c = k === 2 ? (n % 5 ? '#c8d4ff' : '#ffe0b0') : k === 1 ? '#6a78b0' : '#353c66';
    if (!tw) pset(x, y, c); else if (k === 2) sprite(SPR.twinkle, { a: '#8090d0', b: '#ffffff' }, x - 1, y - 1);
  } }
  if (o.milky) pfield(0, 0, SW, SH, (i, j) => { const v = fbm(i * 0.012 + cam.dx * 0.002, j * 0.012, 5); return v > 0.62 ? [20, 26, 64, (v - 0.62) * 3] : null; });
}
function spaceFrame(draw, o = {}) {
  lowres(SP_RES, (w, h) => {
    draw();
    const m = o.mosaic ?? 1;
    if (m > 1) { const t = pixCanvas(Math.round(w / m), Math.round(h / m), 'mos'), tg = t.getContext('2d'); tg.imageSmoothingEnabled = false; tg.clearRect(0, 0, t.width, t.height);
      tg.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, t.width, t.height); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(t, 0, 0, t.width, t.height, 0, 0, w, h); ctx.restore(); }
  });
}
// mosaic block size for a beat's ends: blocks grow over the last `d` s and shrink over the first `d` s
const MOS = [1, 2, 4, 5, 8, 10, 20, 40];
function mosaicAt(o = {}) {
  const d = o.d ?? 0.3, t = shotT(), dur = SHOT_LIST[CUR_SHOT][4], uin = CUR_SHOT > 0 && o.in !== false ? clamp(1 - t / d) : 0, uout = o.out !== false ? clamp((t - (dur - d)) / d) : 0;
  const u = Math.max(uin, uout); return MOS[Math.round(u * (MOS.length - 1))];
}

// ---- captions: big outlined text (hook, title) or the box caption, from CAPS in the current shot
function spCaptions() {
  const [, , , o0, oDur] = SHOT_LIST[CUR_SHOT];
  let k = -1; for (let i = 0; i < CAPS.length; i++) if (CAPS[i][0] >= o0 - 1e-6 && CAPS[i][0] < o0 + oDur && CAPS[i][0] <= TT + 1e-6) k = i;
  if (k < 0 || !CAPS[k][1]) return;
  const [t0, lines, o = {}] = CAPS[k];
  if (o.big) { pixDefer(() => lowres(DOC_TXT, () => { let n = Math.floor((TT - t0) * 22) + 1; lines.forEach((ln, i) => { docText(ln, 90, 58 + i * 20, D.cap, { align: 'center', scale: 2, count: n, outline: '#05060f' }); n -= docChars(ln).length; }); })); return; }
  docBoxCaption(lines, t0, o);
}

// ---- the iron atom: a nucleus of packed protons (rust) and neutrons (grey), four electron shells (2, 8, 14, 2) turning
function ironAtom(cx, cy, R, t, o = {}) {
  pglow(cx, cy, 2, R * 0.55, EL.Fe, 0.35);
  const shells = [[0.28, 2], [0.48, 8], [0.72, 14], [0.95, 2]];
  shells.forEach(([rf, n], s) => {
    const rx = R * rf, ry = R * rf * 0.42, tilt = 0.5 + s * 0.7;
    for (let a = 0; a < 240; a++) { const th = a / 240 * Math.PI * 2, x = Math.cos(th) * rx, y = Math.sin(th) * ry; pset(cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt), a % 3 ? '#4a5cb0' : '#6a7cd8'); }
    for (let e = 0; e < n; e++) { const th = e / n * Math.PI * 2 + t * (1.6 - s * 0.3), x = Math.cos(th) * rx, y = Math.sin(th) * ry, px = cx + x * Math.cos(tilt) - y * Math.sin(tilt), py = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
      pglow(px, py, 1, 6, '#6a8cff', 0.5); prect(px - 1, py - 2, 3, 5, '#9ab8ff'); prect(px - 2, py - 1, 5, 3, '#9ab8ff'); prect(px - 1, py - 1, 3, 3, '#ffffff'); }
  });
  const nr = Math.max(4, Math.round(R * 0.16));
  for (let k = 0; k < 56; k++) { const r = RNG('nuc', k), a = r.f() * Math.PI * 2, d = Math.sqrt(r.f()) * nr, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.95, p = k % 2 === 0;
    pcircle(x, y, Math.max(1, Math.round(nr * 0.28)), p ? EL.Fe : '#8a8ea0'); pset(x - 1, y - 1, p ? '#ff9a70' : '#c8ccd8'); }
}
// ---- red blood cells: biconcave discs (a ring brighter than the dimple), drifting in plasma
function bloodCell(cx, cy, r, tilt) {
  const ry = Math.max(2, r * (0.45 + 0.55 * Math.abs(Math.cos(tilt))));
  pfield(cx - r - 2, cy - ry - 2, 2 * r + 5, 2 * ry + 5, (i, j) => {
    const u = ((i - cx) / r) ** 2 + ((j - cy) / ry) ** 2; if (u > 1) return null;
    const rim = Math.sqrt(u), shade = (-(i - cx) / r - (j - cy) / ry) * 0.25;
    const v = clamp((rim > 0.55 ? 0.75 + (1 - rim) * 0.6 : 0.42 + rim * 0.4) + shade);
    return RGB(ramp(['#3a0408', '#6a0a12', EL.blood, '#e0303a', '#ff7a6a'], v, i, j));
  });
}

// ---- a gas cloud in polar coordinates: fbm density, rotated more near the centre (a swirl), dithered in blues/violets
const NEB = ['#0a0d24', '#1a1f5a', '#2e2f8a', '#4a3cb0', '#7a4ac8', '#c060c8', '#9ab8ff', '#e8e0ff'];
function nebula(cx, cy, R, t, o = {}) {
  const swirl = o.swirl ?? 1, seed = o.seed ?? 3, glow = o.core ?? 0, sq = o.squash ?? 1, cols = o.cols ?? NEB;
  pfield(cx - R, cy - R * sq, 2 * R, 2 * R * sq, (i, j) => {
    const dx = (i - cx) / R, dy = (j - cy) / (R * sq), r = Math.hypot(dx, dy); if (r > 1) return null;
    const a = Math.atan2(dy, dx) + swirl * (1 - r) * 2.2 + t * 0.15 * swirl, x = Math.cos(a) * r, y = Math.sin(a) * r;
    let v = fbm(x * 3.2 + 10, y * 3.2 + 10, seed, 4) * (1 - r ** 2.2) * 1.5 + glow * clamp(1 - r * 3) ** 2;
    if (o.dust && v > 0.3 && dhash(i, j, seed + 40) < 0.035) return RGB(o.dust[Math.floor(dhash(i, j, seed + 41) * o.dust.length)]);   // fine specks of new elements
    if (v < 0.2) return v > 0.12 && (i + j * 3) % 7 === 0 ? RGB(cols[1]) : null;
    return RGB(ramp(cols, clamp((v - 0.2) / 0.75), i, j));
  });
}

// ---- a star's ball: granulation (fbm cells that boil on 2s), limb darkening, a dithered halo
function starBall(cx, cy, r, cols, t, o = {}) {
  pglow(cx, cy, r, r * (o.halo ?? 1.5), cols[cols.length - 2], 0.45);
  pfield(cx - r - 1, cy - r - 1, 2 * r + 3, 2 * r + 3, (i, j) => {
    const dx = (i - cx) / r, dy = (j - cy) / r, q = dx * dx + dy * dy; if (q > 1) return null;
    const mu = Math.sqrt(1 - q), g = fbm(dx * (o.cell ?? 5) + 3, dy * (o.cell ?? 5) + B * 0.07, o.seed ?? 21, 3);
    return RGB(ramp(cols, clamp(0.25 + mu * 0.55 + (g - 0.5) * (o.grain ?? 0.7)), i, j));
  });
}
const BLUE_STAR = ['#1a2a8a', '#3a5ad0', '#7a9cff', '#c8d8ff', '#ffffff'];
const RED_STAR = ['#4a0a04', '#9a2a0a', '#e0601a', '#ffa040', '#ffe0a0'];

// ---- 6: the onion. The star opens in section; shells appear outside-in, each in its element's colour, a clock speeds up
const SHELLS = [['H', 1.0, null], ['He', 0.8, 'He'], ['C', 0.64, 'C'], ['Ne', 0.5, 'Ne'], ['O', 0.38, 'O'], ['Si', 0.27, 'Si'], ['Fe', 0.16, 'Fe']];
function onion(cx, cy, R, t, o = {}) {
  pglow(cx, cy, R, R * 1.25, '#3a4ab0', 0.35);
  const shown = SHELLS.filter(([el]) => el === 'H' || t >= CU[el]);
  shown.forEach(([el, rf], k) => {
    const rr = Math.round(R * rf * (1 + 0.012 * Math.sin(t * 3 + k))), base = mix3(RGB(EL[el]), [8, 8, 30], 0.2), lit = mix3(RGB(EL[el]), [255, 255, 255], 0.3), dark = mix3(base, [8, 8, 30], 0.55);
    const age = el === 'H' ? 9 : t - CU[el], pop = el === 'H' ? 1 : clamp(springMove(CU[el], 0, 1, SPRING.snappy), 0, 1.15);
    const r2 = Math.round(rr * pop), rin = k + 1 < SHELLS.length ? R * SHELLS[k + 1][1] : 0;
    pfield(cx - r2 - 1, cy - r2 - 1, 2 * r2 + 3, 2 * r2 + 3, (i, j) => {
      const d = Math.hypot(i - cx, j - cy); if (d > r2) return null;
      if (r2 - d < 1.2) return lit.map(Math.round);
      // inside the shell: dark at its outer edge, lighter toward the next shell, dithered; a slow churn of lighter cells
      const u = clamp((r2 - d) / Math.max(4, r2 - rin)), churn = fbm((i - cx) * 0.05, (j - cy) * 0.05 + B * 0.04, 30 + k, 2);
      const c = mix3(dark, base, clamp(u * 1.3 + (churn - 0.5) * 0.4));
      return (u * 1.3 + (churn - 0.5) * 0.4 > bayer(i, j) + 0.6 ? mix3(c, lit, 0.18) : c).map(Math.round);
    });
    if (age < 0.25 && B % 2) pcircle(cx, cy, r2 + 2, '#ffffff', { ring: 1 });   // the flash as a new shell ignites
  });
  // the iron core: dull, no glow, a slow dying heartbeat in its rim
  if (t >= CU.Fe) { const hb = Math.max(0, Math.sin((t - CU.Fe) * 5.5)) ** 6 * Math.max(0, 1 - (t - CU.Fe) / 3); pcircle(cx, cy, Math.round(R * 0.16) + 1, hb > 0.3 ? '#ff9a70' : '#5a2a20', { ring: 1 }); }
}

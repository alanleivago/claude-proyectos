// =====================================================================
//  styles/yokai/kit.js — folk-horror low-poly 3D, dithered into a fixed palette.
//  three.js renders a small frame (YK.LW × YK.LH, a 3 px pixel at 1080); ykBlit() pushes it through a 4×4 Bayer
//  ordered dither into a fixed palette (fog, skies and glows turn into dot screens) and blows it up with no smoothing.
//  Text is a code-drawn pixel font: a paragraph decodes glyph by glyph from noise and scrambles out.
//  The title card: black with stars, a framed print, the name and a red seal. Helpers are prefixed `yk`.
// =====================================================================
const YK = {
  LW: 216, LH: 384, VIG: 0, DOT: 52, DOTC: [0.9, 0.2, -0.8], SPREAD: 16,
  text: '#f4f0e4', shade: '#03050a', gold: '#b8995a', seal: '#b3271c',
  // the main palette: blue-blacks, teals, greys, earth, embers, yolk, and a few greens (measured from the references, plus forest)
  PAL: {
    main: ['#020306', '#06090f', '#0b1a22', '#0b2c38', '#172728', '#1f3c44', '#346c76', '#4e8389', '#65969a', '#8fb1b0', '#b9cbc6',
      '#191b18', '#2b2d29', '#3f4542', '#848a8b', '#acb6b3', '#d3d6cc', '#eeeadb',
      '#221c15', '#3c2c1e', '#5a4430', '#a07c50', '#cfae78', '#2e1410', '#5a2418', '#8e3a24',
      '#141a2e', '#26304a', '#2a3a3a', '#56706c'],
    // the title card's print: indigo, cream, red, ink
    print: ['#0d1018', '#1b2434', '#2c3a52', '#465a72', '#6f8294', '#9eaab0', '#3a3a2c', '#5e5a40', '#868058', '#b0a476', '#d4c8a0', '#ece2c4', '#8e3a24', '#b8603a', '#c8a050', '#4a3a2a'],
  },
};
const YK_BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ykRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const _ykLUT = {};
function ykLUT(name) {   // nearest palette colour for every 5-bit rgb, packed as 0xRRGGBB
  if (_ykLUT[name]) return _ykLUT[name];
  const P = YK.PAL[name].map(ykRGB), L = new Int32Array(32768);
  for (let i = 0; i < 32768; i++) {
    const r = ((i >> 10) & 31) * 8.226, g = ((i >> 5) & 31) * 8.226, b = (i & 31) * 8.226;
    let best = 0, bd = 1e9;
    for (let k = 0; k < P.length; k++) { const dr = r - P[k][0], dg = g - P[k][1], db = b - P[k][2], d = dr * dr * 0.9 + dg * dg * 1.2 + db * db * 0.8; if (d < bd) { bd = d; best = k; } }
    L[i] = (P[best][0] << 16) | (P[best][1] << 8) | P[best][2];
  }
  return (_ykLUT[name] = L);
}
let _ykLow = null;
function ykLow() { if (!_ykLow) { const c = document.createElement('canvas'); c.width = YK.LW; c.height = YK.LH; _ykLow = { c, x: c.getContext('2d', { willReadFrequently: true }) }; } return _ykLow; }
// src (any canvas) → dithered palette frame. o: { pal, spread (dither strength 0..255), vis (0..1, dithered fade to black),
//   gain, lift (pre-quantise grade), paint(x, w, h) (2D at low res before the dither), dst [x, y, w, h] (default the full frame) }
function ykBlit(src, o = {}) {
  const L = ykLow(), x = L.x, w = YK.LW, h = YK.LH;
  x.save(); x.imageSmoothingEnabled = true; x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  if (src) x.drawImage(src, 0, 0, w, h); else { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); }
  if (o.paint) o.paint(x, w, h);
  x.restore();
  const id = x.getImageData(0, 0, w, h), d = id.data, lut = ykLUT(o.pal || 'main'), sp = o.spread ?? YK.SPREAD, vis = o.vis ?? 1, lift = o.lift ?? 0, sat = o.sat ?? 0.6, vig = o.vig ?? YK.VIG, dot = o.dot ?? YK.DOT, dc = YK.DOTC, gr = o.grade ?? [0.9, 0.97, 1.0], gl = o.glift ?? [1, 5, 7], gn = o.gain ?? 0.9;
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const i = (yy * w + xx) * 4, bt = (YK_BAY[(yy & 3) * 4 + (xx & 3)] + 0.5) / 16;
    if (bt > vis) { d[i] = 2; d[i + 1] = 3; d[i + 2] = 6; continue; }
    const off = (bt - 0.5) * sp, dt = ((xx & 1) === 0 && (yy & 1) === 0) ? dot : ((xx & 1) !== (yy & 1) ? -dot * 0.25 : 0);
    const vx = (xx / w - 0.5) * 2, vy = (yy / h - 0.42) * 1.6, vg = 1 - vig * Math.min(1, Math.pow(vx * vx * 0.8 + vy * vy, 1.3));
    const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    let r = (lum + (d[i] - lum) * sat) * gr[0] * gn * vg + gl[0] * vg + lift + off + dt * dc[0], g = (lum + (d[i + 1] - lum) * sat) * gr[1] * gn * vg + gl[1] * vg + lift + off + dt * dc[1], b = (lum + (d[i + 2] - lum) * sat) * gr[2] * gn * vg + gl[2] * vg + lift + off + dt * dc[2];
    r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b;
    const c = lut[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
    d[i] = c >> 16; d[i + 1] = (c >> 8) & 255; d[i + 2] = c & 255;
  }
  x.putImageData(id, 0, 0);
  const [dx, dy, dw, dh] = o.dst || [0, 0, W, H];
  ctx.save(); screen(); ctx.imageSmoothingEnabled = false; ctx.drawImage(L.c, 0, 0, w, h, dx, dy, dw, dh); ctx.restore();
}

// ---------------------------------------------------------------------
//  the pixel font: rows top→bottom; 7 rows to the baseline, 2 below. Lowercase leaves rows 0–1 for accents.
// ---------------------------------------------------------------------
const YK_G = {};
(function () {
  const def = (ch, rows) => { YK_G[ch] = { w: rows[0].length, rows }; };
  const up = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', C: '.###.|#...#|#....|#....|#....|#...#|.###.',
    D: '####.|#...#|#...#|#...#|#...#|#...#|####.', E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#', I: '###|.#.|.#.|.#.|.#.|.#.|###',
    J: '...#|...#|...#|...#|#..#|#..#|.##.', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#...|#...|#...|#...|#...|#...|####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    P: '####.|#...#|#...#|####.|#....|#....|#....', Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.###.|#...#|#....|.###.|....#|#...#|.###.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
    3: '####.|....#|....#|.###.|....#|....#|####.', 4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...', 8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
    9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  };
  Object.entries(up).forEach(([k, v]) => def(k, v.split('|')));
  const lo = {   // x-height rows 2–6, descenders 7–8
    a: '.....|.....|.###.|....#|.####|#...#|.####', b: '#....|#....|####.|#...#|#...#|#...#|####.', c: '....|....|.###|#...|#...|#...|.###',
    d: '....#|....#|.####|#...#|#...#|#...#|.####', e: '.....|.....|.###.|#...#|#####|#....|.###.', f: '..##|.#..|####|.#..|.#..|.#..|.#..',
    g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.', h: '#....|#....|####.|#...#|#...#|#...#|#...#', i: '#|.|#|#|#|#|#',
    j: '..#|...|..#|..#|..#|..#|..#|#.#|.#.', k: '#...|#...|#..#|#.#.|##..|#.#.|#..#', l: '#.|#.|#.|#.|#.|#.|.#',
    m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#', n: '.....|.....|####.|#...#|#...#|#...#|#...#', o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
    p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....', q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#', r: '....|....|#.##|##..|#...|#...|#...',
    s: '.....|.....|.####|#....|.###.|....#|####.', t: '.#..|.#..|####|.#..|.#..|.#..|..##', u: '.....|.....|#...#|#...#|#...#|#...#|.####',
    v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..', w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.', x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
    y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.', z: '.....|.....|#####|...#.|..#..|.#...|#####',
  };
  Object.entries(lo).forEach(([k, v]) => def(k, v.split('|')));
  const acc = (base, a0, a1) => { const g = YK_G[base].rows.slice(); g[0] = a0; g[1] = a1; return g; };
  def('á', acc('a', '...#.', '..#..')); def('é', acc('e', '...#.', '..#..')); def('ó', acc('o', '...#.', '..#..')); def('ú', acc('u', '...#.', '..#..'));
  def('í', ['.#', '#.', '#.', '#.', '#.', '#.', '#.']); def('ñ', acc('n', '.##.#', '#..#.')); def('ü', acc('u', '.#.#.', '.....')); def('ō', acc('o', '.###.', '.....'));
  const p = {
    '.': '.|.|.|.|.|.|#', ',': '.|.|.|.|.|.|#|#', ':': '.|.|#|.|.|.|#', ';': '.|.|#|.|.|.|#|#', '!': '#|#|#|#|#|.|#', '¡': '#|.|#|#|#|#|#',
    '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '¿': '..#..|.....|..#..|.#...|#....|#...#|.###.',
    '«': '.....|.....|..#.#|.#.#.|#.#..|.#.#.|..#.#', '»': '.....|.....|#.#..|.#.#.|..#.#|.#.#.|#.#..',
    '"': '#.#|#.#|...|...|...|...|...', "'": '#|#|.|.|.|.|.', '-': '...|...|...|###|...|...|...', '—': '.....|.....|.....|#####|.....|.....|.....',
    '(': '.#|#.|#.|#.|#.|#.|.#', ')': '#.|.#|.#|.#|.#|.#|#.',
  };
  Object.entries(p).forEach(([k, v]) => def(k, v.split('|')));
})();
const ykGW = (ch) => (ch === ' ' ? 3 : (YK_G[ch] || YK_G['?']).w);
const ykWidth = (s) => [...s].reduce((a, ch, i) => a + ykGW(ch) + (i ? 1 : 0), 0);
function ykWrap(str, maxU) {
  const out = []; let line = '';
  str.split(' ').forEach((wd) => { const tryL = line ? line + ' ' + wd : wd; if (ykWidth(tryL) > maxU && line) { out.push(line); line = wd; } else line = tryL; });
  if (line) out.push(line); return out;
}
// one glyph at (x, y = top of the cap row) in units of u px. noise > 0 draws a scramble of that density instead (reseeded on 2s)
function ykGlyph(ch, x, y, u, col, noise = 0, key = 0) {
  const g = YK_G[ch]; if (!g) return;
  ctx.fillStyle = col;
  if (noise > 0) { const R = RNG('ykn', key, B); for (let r = 2; r < 7; r++) for (let c = 0; c < g.w; c++) if (R.f() < noise) ctx.fillRect(x + c * u, y + r * u, u, u); return; }
  g.rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') ctx.fillRect(x + c * u, y + r * u, u, u); });
}
// a centred line of pixel text; o: { u, col, shade, alpha, reveal(i) → 0 hidden | (0,1) scramble | 1 shown }
function ykLine(str, cx, y, o = {}) {
  const u = o.u ?? 4, wU = ykWidth(str); let x = Math.round(cx - (wU * u) / 2);
  ctx.save(); screen(); ctx.globalAlpha = clamp(o.alpha ?? 1);
  [...str].forEach((ch, i) => {
    const s = o.reveal ? o.reveal(i) : 1, gw = ykGW(ch);
    if (ch !== ' ' && s > 0) {
      const nz = s < 1 ? 0.25 + 0.3 * (1 - s) : 0;
      for (const [ox, oy] of [[u, u], [u, 0], [0, u], [-u, 0], [0, -u], [-u, u], [u, -u]]) ykGlyph(ch, x + ox, y + oy, u, o.shade ?? YK.shade, nz, (o.key ?? 0) * 997 + i);
      ykGlyph(ch, x, y, u, o.col ?? YK.text, nz, (o.key ?? 0) * 997 + i);
    }
    x += (gw + 1) * u;
  });
  ctx.restore();
}
// a paragraph: wrapped, centred on (cx, cy); decodes glyph by glyph from t0, scrambles out before t1
function ykPara(str, t0, t1, o = {}) {
  if (TT < t0 - 0.01 || TT >= t1) return;
  const u = o.u ?? 6, lines = ykWrap(str, o.maxU ?? 132), lh = (o.lh ?? 11.5) * u, cx = o.cx ?? CX, cy = o.cy ?? 1300;
  const y0 = Math.round(cy - (lines.length * lh) / 2), rate = o.rate ?? 0.011, key = hash(str) % 100000;
  const f = () => {
    let n = 0;
    lines.forEach((l, li) => {
      const base = n;
      ykLine(l, cx, y0 + li * lh, { u, key: key + li, reveal: (i) => {
        const k = base + i, tin = t0 + k * rate, R = RNG('ykout', key, k), tout = t1 - 0.55 + R.f() * 0.4;
        if (TT < tin) return 0; if (TT < tin + 0.22) return (TT - tin) / 0.22;
        if (TT >= tout + 0.16) return 0; if (TT >= tout) return 0.5;
        return 1; } });
      n += l.length;
    });
  };
  if (DEFER) DEFER.push(f); else f();
}

// ---------------------------------------------------------------------
//  the title card: stars on black, a framed print (any canvas, dithered with the print palette), the name, a red seal
// ---------------------------------------------------------------------
function ykStars(a = 1, key = 'stars') {
  const R = RNG(key); ctx.save(); screen();
  for (let i = 0; i < 160; i++) { const x = Math.floor(R.r(0, W) / 3) * 3, y = Math.floor(R.r(0, H) / 3) * 3, tw = 0.5 + 0.5 * Math.sin(TT * R.r(1, 4) + R.r(0, TAU)), s = R.f() < 0.12 ? 6 : 3;
    ctx.globalAlpha = clamp(a * (0.25 + 0.6 * tw) * (R.f() < 0.5 ? 0.6 : 1)); ctx.fillStyle = R.f() < 0.2 ? '#9fb3c8' : '#d8dde2'; ctx.fillRect(x, y, s, s); }
  ctx.restore();
}
// the seal: a small red square with a pale pixel mark (a stylised spider sign)
function ykSeal(x, y, u, a = 1) {
  const M = ['.#####.', '#.#.#.#', '##.#.##', '#..#..#', '##.#.##', '#.#.#.#', '.#####.'];
  ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.fillStyle = YK.seal; ctx.fillRect(x, y, u * 9, u * 9);
  ctx.fillStyle = '#f3d9c8'; M.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') ctx.fillRect(x + u + k * u, y + u + r * u, u, u); })); ctx.restore();
}
// k: 0..1 how much of the card is in (a dithered dissolve); the print is src drawn through the print palette
function ykCard(src, name, kIn, kName, o = {}) {
  const fw = o.w ?? 720, fh = o.h ?? 540, fx = Math.round(CX - fw / 2), fy = o.y ?? 380, b = 15;
  if (kIn > 0) {
    const fr = () => { ctx.fillStyle = '#1a140c'; ctx.fillRect(fx - b - 6, fy - b - 6, fw + 2 * b + 12, fh + 2 * b + 12);
      ctx.fillStyle = '#b8a47a'; ctx.fillRect(fx - b, fy - b, fw + 2 * b, fh + 2 * b);
      ctx.save(); ctx.beginPath(); ctx.rect(fx - b, fy - b, fw + 2 * b, fh + 2 * b); ctx.rect(fx, fy, fw, fh); ctx.clip('evenodd'); ctx.fillStyle = '#5e5236';
      for (let i = -fh - 2 * b; i < fw + 2 * b + fh; i += 18) { ctx.beginPath(); ctx.moveTo(fx - b + i, fy - b); ctx.lineTo(fx - b + i + 8, fy - b); ctx.lineTo(fx - b + i + 8 - fh - 2 * b, fy + fh + b); ctx.lineTo(fx - b + i - fh - 2 * b, fy + fh + b); ctx.fill(); }
      ctx.restore(); ctx.fillStyle = '#0d0a06'; ctx.fillRect(fx - 4, fy - 4, fw + 8, fh + 8); };
    ctx.save(); screen(); fr(); ctx.restore();
    const L = ykLow(), keep = [YK.LW, YK.LH], pw = o.pw ?? 132, ph = Math.round(pw * fh / fw);
    YK.LW = pw; YK.LH = ph; L.c.width = pw; L.c.height = ph;
    ykBlit(src, { pal: 'print', spread: 26, sat: 1, vig: 0, dot: 0, grade: [1, 1, 1], glift: [0, 0, 0], gain: 1, vis: 1, dst: [fx, fy, fw, fh] });
    YK.LW = keep[0]; YK.LH = keep[1]; L.c.width = keep[0]; L.c.height = keep[1];
    if (kIn < 1) {   // the whole card dissolves in and out through the Bayer screen
      ctx.save(); screen(); ctx.fillStyle = '#020306'; const cs = 6;
      for (let yy = fy - b - 6; yy < fy + fh + b + 6; yy += cs) for (let xx = fx - b - 6; xx < fx + fw + b + 6; xx += cs) { const bt = (YK_BAY[((yy / cs) & 3) * 4 + ((xx / cs) & 3)] + 0.5) / 16; if (bt > kIn) ctx.fillRect(xx, yy, cs, cs); }
      ctx.restore();
    }
  }
  if (kName > 0) {
    const u = 8, wN = ykWidth(name) * u, yN = fy + fh + 54, reveal = (i) => (kName >= 1 ? 1 : clamp(kName * 1.6 - i * 0.06));
    ykLine(name, CX - 34, yN, { u, reveal, key: 7 });
    if (kName > 0.4) ykSeal(Math.round(CX - 34 + wN / 2 + 22), yN - 6, 7, clamp((kName - 0.4) * 3));
  }
}

// the channel badge (as earlobe's, top-left there; ours centred at the top at the end): a navy plate with a woven pixel
// texture, the profile picture pixelated on the left, the name in the pixel font. a = 0..1 dithered in.
function ykBadge(img, name, cx, y, a = 1) {   // the channel badge: a navy plate with a woven pixel texture, the kodama figure
  // (its black square keyed out) on the left, the name in the pixel font. a = 0..1 dithered in.
  if (a <= 0) return; const u = 6, tw = ykWidth(name) * u, ic = 96, padX = 22, w = padX * 3 + ic + tw, h = ic + 30, x = Math.round(cx - w / 2);
  ctx.save(); screen();
  ctx.fillStyle = '#2a3552'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#1b2440';
  for (let yy = 0; yy < h; yy += 6) for (let xx = (yy / 6) % 2 ? 3 : 0; xx < w; xx += 12) ctx.fillRect(x + xx, y + yy, 6, 3);
  ctx.fillStyle = '#3a4a6e'; ctx.fillRect(x, y, w, 3); ctx.fillRect(x, y + h - 3, w, 3); ctx.fillRect(x, y, 3, h); ctx.fillRect(x + w - 3, y, 3, h);
  if (img) { if (!ykBadge.k) { const c = document.createElement('canvas'); c.width = c.height = 36; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 36, 36); const d = g.getImageData(0, 0, 36, 36);
      for (let i = 0; i < d.data.length; i += 4) { if (Math.max(d.data[i], d.data[i + 1], d.data[i + 2]) < 40) d.data[i + 3] = 0; } g.putImageData(d, 0, 0); ykBadge.k = c; }
    ctx.imageSmoothingEnabled = false; ctx.drawImage(ykBadge.k, x + padX, y + 15, ic, ic); }
  ctx.restore();
  ykLine(name, x + padX * 2 + ic + tw / 2, y + h / 2 - 4 * u, { u });
  if (a < 1) { ctx.save(); screen(); ctx.fillStyle = '#020306'; const cs = 6; for (let yy = y; yy < y + h; yy += cs) for (let xx = x; xx < x + w; xx += cs) { const bt = (YK_BAY[((yy / cs) & 3) * 4 + ((xx / cs) & 3)] + 0.5) / 16; if (bt > a) ctx.fillRect(xx, yy, cs, cs); } ctx.restore(); }
}

// =====================================================================
const STYLE = {
  name: 'yokai',
  paper: '#020306',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { ctx.save(); ctx.fillStyle = '#eef6f4'; ctx.fillRect(x - 3, y - r, 3, r * 2); ctx.restore(); },   // a glinting thread
  heroColor: '#eef6f4',
  post() {},
  ones: true,
};

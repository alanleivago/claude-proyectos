// menukit.js — the MML2 STATUS/ITEM menu kit, ported 1:1 from pieces/mechayuki-banner/engine/banner.js (the banner the user
// approved: lavender machine-part pattern, mint panels with thick teal borders + chamfered corners + orange ticks, notched
// teal bars, chunky outlined pixel titles with green bolt circles, rivets, Z coins, the vertical energy capsule).
// menuKit(ctx) returns the drawing functions bound to a 2D context (any size; the expedition overlay is 480x270).
import { G, NARROW, textWidth, bitText } from './pixfont.js';

export const P = {
  bg: '#6b6fd6', pat: '#5d61c7', patHi: '#7a7ee2', mint: '#a8e6a8', mintHi: '#dcfad4', mintLo: '#78bf86', teal: '#1f4a52',
  bar: '#2e4a55', barHi: '#5c8892', barLo: '#142a30', orange: '#f08a28', red: '#d8303a', redHi: '#ff8a78', redLo: '#6a0c16',
  purple: '#2a1f55', purpleHi: '#5a4aa0', green: '#4cd060', greenLo: '#14602a', greenHi: '#d4ffd0', ink: '#141838',
  gold: '#f6c832', goldHi: '#fff0a0', goldLo: '#7a4a08', slot: '#244049', slotLn: '#2f5560',
};
const BG_CACHE = {};

export function menuKit(c) {
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const px = (x, y, col) => R(Math.round(x), Math.round(y), 1, 1, col);
  function cham(x, y, w, h, k, col) { c.fillStyle = col; for (let r = 0; r < h; r++) { const i = Math.max(0, k - r, k - (h - 1 - r)); c.fillRect(x + i, y + r, w - 2 * i, 1); } }
  function panel(x, y, w, h, { k = 7, b = 3, fill = P.mint, ticks = 'bottom', shadow = true } = {}) {
    if (shadow) cham(x + 3, y + 3, w, h, k, 'rgba(24,20,90,0.45)');
    cham(x, y, w, h, k, P.teal);
    const ix = x + b, iy = y + b, iw = w - 2 * b, ih = h - 2 * b, ik = Math.max(1, k - 2);
    cham(ix, iy, iw, ih, ik, P.mintHi); cham(ix + 1, iy + 1, iw - 1, ih - 1, ik, P.mintLo); cham(ix + 1, iy + 1, iw - 2, ih - 2, ik, fill);
    if (ticks === 'bottom') for (let t = 0; t < 8; t++) R(x + w - k - 8 - t * 5, y + h - b - 5, 2, 3, P.orange);
    if (ticks === 'left') for (let t = 0; t < 6; t++) R(x + b + 2, y + k + 5 + t * 5, 3, 2, P.orange);
    if (ticks === 'top') for (let t = 0; t < 8; t++) R(x + k + 8 + t * 5, y + b + 2, 2, 3, P.orange);
  }
  function bar(x, y, w, h, { col = P.bar, hi = P.barHi, lo = P.barLo, slope = 0.55, notch = true } = {}) {
    const m = (h - 1) / 2;
    for (let r = 0; r < h; r++) { const i = Math.round(Math.abs(r - m) * slope); R(x + i, y + r, w - 2 * i, 1, r === 0 ? hi : r === h - 1 ? lo : col); }
    if (notch) for (const nx of [x + Math.round(m * slope) + 3, x + w - Math.round(m * slope) - 5]) R(nx, y + 2, 2, h - 4, lo);
  }
  const redBar = (x, y, w, h) => bar(x, y, w, h, { col: P.red, hi: P.redHi, lo: P.redLo });
  function disc(cx, cy, r, col) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) R(cx + x, cy + y, 1, 1, col); }
  function rivet(cx, cy, r = 3) { disc(cx, cy, r + 1, P.greenLo); disc(cx, cy, r, P.green); px(cx - 1, cy - 1, P.greenHi); }
  function boltCircle(cx, cy, r = 7) {
    disc(cx + 1, cy + 2, r + 1, 'rgba(20,16,80,0.5)'); disc(cx, cy, r + 1, P.ink); disc(cx, cy, r, P.greenLo); disc(cx, cy, r - 1, P.green);
    R(cx - r + 2, cy - 1, 2 * r - 3, 2, P.greenLo);
    px(cx - r + 3, cy - r + 3, P.greenHi); px(cx - r + 4, cy - r + 3, P.greenHi); px(cx - r + 3, cy - r + 4, P.greenHi);
  }
  function zcoin(cx, cy, r = 6) {
    disc(cx, cy, r + 1, P.goldLo); disc(cx, cy, r, P.gold); disc(cx + 1, cy + 1, r - 2, '#e0a820'); disc(cx, cy, r - 2, P.gold);
    bitText(c, 'Z', cx + 1, cy + 1, 1, P.goldLo, { outline: null }); px(cx - r + 2, cy - r + 2, P.goldHi);
  }
  const BOLDW = [2, 1, 2, 1, 2];
  function boldGlyph(ch) {
    const g = G[ch] || G['?'], cols = NARROW[ch] ? [1, 2, 3] : [0, 1, 2, 3, 4], cells = []; let x = 0;
    for (const col of cols) { const wd = BOLDW[col]; for (let r = 0; r < 7; r++) if (g[r][col] === '#') for (let k = 0; k < wd; k++) cells.push([x + k, r]); x += wd; }
    return { cells, w: x };
  }
  const boldWidth = (s, sc) => { let w = 0; for (const ch of s.toUpperCase()) w += (boldGlyph(ch).w + 1) * sc; return w - sc; };
  function bold(s, x, y, sc, fg, { outline = P.ink, ow = 1, shadow = null, fg2 = null, align = 'center', gap = 0 } = {}) {
    s = s.toUpperCase(); const w = boldWidth(s, sc) + gap * (s.length - 1); const X = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x), Y = Math.round(y - 7 * sc / 2);
    const cells = []; let cx = X;
    for (const ch of s) { const g = boldGlyph(ch); for (const [gx, gy] of g.cells) cells.push([cx + gx * sc, Y + gy * sc, gy]); cx += (g.w + 1) * sc + gap; }
    if (shadow) { c.fillStyle = shadow; for (const [a, b] of cells) c.fillRect(a - ow + sc, b - ow + sc, sc + 2 * ow, sc + 2 * ow); }
    if (outline) { c.fillStyle = outline; for (const [a, b] of cells) c.fillRect(a - ow, b - ow, sc + 2 * ow, sc + 2 * ow); }
    for (const [a, b, gy] of cells) { c.fillStyle = fg2 && gy >= 4 ? fg2 : fg; c.fillRect(a, b, sc, sc); }
    return [X, Y, w, 7 * sc];
  }
  const text = (s, x, y, sc, fg, o = {}) => bitText(c, s, x + (o.align === 'left' ? textWidth(s, sc) / 2 : 0), y, sc, fg, { outline: null, ...o });
  // the title with the two green bolts (= STATUS)
  function title(s, cx, cy, sc = 3) { const w = boldWidth(s, sc); bold(s, cx, cy, sc, '#ffffff', { outline: P.ink, ow: 2, shadow: 'rgba(20,16,80,0.55)', fg2: '#e2e6ff' }); boltCircle(Math.round(cx - w / 2) - 13, cy, 6); boltCircle(Math.round(cx + w / 2) + 13, cy, 6); }
  // the lavender background with the diagonal machine-part pattern + sheen bands (cached per size)
  function background(W, H) {
    const key = W + 'x' + H;
    if (!BG_CACHE[key]) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const b = cv.getContext('2d'); const k = menuKit(b);
      k.R(0, 0, W, H, P.bg);
      for (let j = -1; j < H / 26 + 1; j++) for (let i = -1; i < W / 52 + 1; i++) {
        const x = i * 52 + (j % 2 ? 26 : 0) + 8, y = j * 26 + 10, t = ((i + j * 2) % 3 + 3) % 3;
        if (t === 0) k.gear(x, y, 6, P.pat); else if (t === 1) k.hexBolt(x, y, 5, P.pat); else k.wrench(x, y, 6, P.pat);
      }
      for (let y = 0; y < H; y++) for (let x0 = -H; x0 < W; x0 += 96) k.R(x0 + y * 0.5 | 0, y, 3, 1, 'rgba(255,255,255,0.05)');
      BG_CACHE[key] = cv;
    }
    c.drawImage(BG_CACHE[key], 0, 0);
  }
  function gear(cx, cy, r, col) { for (let y = -r - 2; y <= r + 2; y++) for (let x = -r - 2; x <= r + 2; x++) { const d = Math.hypot(x, y), a = Math.atan2(y, x); if ((d <= r - 1 && d >= r * 0.38) || (d <= r + 1.6 && d > r - 1.5 && Math.cos(8 * a) > 0.25)) R(cx + x, cy + y, 1, 1, col); } }
  function hexBolt(cx, cy, r, col) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const ax = Math.abs(x), ay = Math.abs(y); if (Math.max(ax * 0.866 + ay * 0.5, ay) <= r * 0.87 && Math.hypot(x, y) > r * 0.36) R(cx + x, cy + y, 1, 1, col); } }
  function wrench(cx, cy, len, col) {
    for (let t = -len; t <= len; t++) R(Math.round(cx + t * 0.707), Math.round(cy - t * 0.707), 2, 2, col);
    const jx = cx + len * 0.707 + 2, jy = cy - len * 0.707 - 2, rx = cx - len * 0.707 - 1, ry = cy + len * 0.707 + 1;
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const d = Math.hypot(x, y); if (d <= 4.2 && d >= 1.8 && !(x - y > 1.5 && x + y > -2 && x + y < 2.5)) R(Math.round(jx + x), Math.round(jy + y), 1, 1, col); if (d <= 3.4 && d >= 1.5) R(Math.round(rx + x), Math.round(ry + y), 1, 1, col); }
  }
  // the vertical green energy capsule (segments lit up to `level` 0..1)
  function capsule(x, y, w, h, level = 1, { segs = 12 } = {}) {
    cham(x - 1, y - 1, w + 2, h + 2, 4, P.teal); cham(x, y, w, h, 3, '#0e2228');
    const sh = (h - 10) / segs; for (let s = 0; s < segs; s++) { const sy = y + h - 5 - (s + 1) * sh, on = s < Math.round(level * segs); R(x + 2, Math.round(sy) + 1, w - 4, Math.max(1, Math.round(sh) - 1), on ? (s > segs * 0.75 ? '#a8ff9a' : P.green) : '#1e3a40'); }
    R(x + 2, y + 4, 1, h - 8, 'rgba(255,255,255,0.25)');
  }
  // a dark-teal item slot with the faint grid; hole=true clears the inside so the 3D scene shows through
  function slot(x, y, w, h, { k = 4, hole = false, fill = P.slot, sel = false } = {}) {
    cham(x, y, w, h, k, sel ? '#ffd23a' : P.teal); cham(x + 2, y + 2, w - 4, h - 4, Math.max(1, k - 1), fill);
    for (let gx = x + 8; gx < x + w - 4; gx += 8) R(gx, y + 3, 1, h - 6, P.slotLn);
    for (let gy = y + 8; gy < y + h - 4; gy += 8) R(x + 3, gy, w - 6, 1, P.slotLn);
    if (hole) c.clearRect(x + 4, y + 4, w - 8, h - 8);
  }
  // the dark purple description box with green rivets
  function descBox(x, y, w, h) { cham(x, y, w, h, 3, P.purpleHi); cham(x + 1, y + 1, w - 2, h - 2, 3, P.purple); for (const [rx, ry] of [[x + 5, y + 5], [x + w - 6, y + 5], [x + 5, y + h - 6], [x + w - 6, y + h - 6]]) rivet(rx, ry, 2); }
  return { c, R, px, cham, panel, bar, redBar, disc, rivet, boltCircle, zcoin, bold, boldWidth, text, title, background, gear, hexBolt, wrench, capsule, slot, descBox, P };
}

// =====================================================================
//  SCENES — Nure-onna. Flow images reduced to their native grid by tools/native.py (134x240), drawn 9 px a pixel.
//  Base code: pieces/lost-second (flowShot draw layers, aansa captions, HUD queue, egWiggle 1.5 + egbw).
// =====================================================================
const EG = { w: 180 };                          // the default pixel grid: 6 px pixels at 1080 (o.grid: 135 = 8 px for close-ups)
const EG_LUM = [0, 43, 142, 253];               // the ramp's luminances (OB_PAL)
const EG_RED = [208, 24, 24];
const EG_CV = new Map();
function egCanvas(tag, w, h) {
  let c = EG_CV.get(tag);
  if (!c) { c = document.createElement('canvas'); EG_CV.set(tag, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
// a cut-out layer with a 1-cell white outline around it (the World of Horror rim), cached per asset and size
function egRimmed(name, gw, gh) {
  const img = asset(name); if (!img) return null;
  const tag = `rim:${name}:${gw}x${gh}`, c = egCanvas(tag, gw + 4, gh + 4);
  if (c.dataset.ok) return c;
  const g = c.getContext('2d'), s = egCanvas('rimtmp', gw + 4, gh + 4), sg = s.getContext('2d');
  sg.clearRect(0, 0, s.width, s.height); sg.drawImage(img, 2, 2, gw, gh);
  sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#fff'; sg.fillRect(0, 0, s.width, s.height); sg.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, c.width, c.height);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) g.drawImage(s, dx, dy);
  g.drawImage(img, 2, 2, gw, gh);
  c.dataset.ok = 1; return c;
}
// flowShot(layers, o): the layers are Flow images already reduced to their native pixel grid and the onebit palette by
// tools/native.py (134x240, so one native pixel is ~8 px on screen). They are only scaled up here, nearest-neighbour,
// never re-pixelated: a second grid that doesn't match the source's broke every line into uneven steps.
// layers = [{ a, x, y, w, h (frame px; default cover) | dx, dy, scale }] or { draw(g) } drawn in frame coords;
// o.cam = { z, x, y } zooms about a frame point; o.spot = { x, y, r, f } a flashlight circle (dithered dark outside);
// o.shake = [dx, dy] in native pixels.
const NATIVE_PX = 9;   // one native pixel = 9 screen px (134x240 -> 1206x2160, a margin all round)
function flowShot(layers, o = {}) {
  SUB_Y = o.subY ?? 1380; SUB_STROKE = o.stroke ?? 7;
  const cam = { z: 1.01, x: W / 2, y: H / 2, ...o.cam }; cam.z = Math.max(1.01, cam.z);
  const sx = Math.round(o.shake?.[0] ?? 0) * NATIVE_PX, sy = Math.round(o.shake?.[1] ?? 0) * NATIVE_PX;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(cam.z, 0, 0, cam.z, cam.x - cam.x * cam.z + sx, cam.y - cam.y * cam.z + sy);
  ctx.imageSmoothingEnabled = false;
  layers.forEach((L, li) => {
    if (L.draw) {   // drawn at frame size with no transform, then placed as one image: cells drawn one by one under a fractional zoom left hairline seams
      const D = egCanvas('drawlayer', W, H), dg = D.getContext('2d'); dg.setTransform(1, 0, 0, 1, 0, 0); dg.clearRect(0, 0, W, H); dg.imageSmoothingEnabled = false;
      L.draw(dg); ctx.drawImage(D, 0, 0); return;
    }
    const img = asset(L.a); if (!img) return;
    const iw = img.naturalWidth, ih = img.naturalHeight, cov = Math.max(W / iw, H / ih);
    let { x, y, w: lw, h: lh } = L;
    if (lw == null) { lw = iw * NATIVE_PX; lh = ih * NATIVE_PX; x = Math.round(((W - lw) / 2 + (L.dx ?? 0)) / NATIVE_PX) * NATIVE_PX; y = Math.round(((H - lh) / 2 + (L.dy ?? 0)) / NATIVE_PX) * NATIVE_PX; }
    ctx.drawImage(img, x, y, lw, lh);
    if (li === 0 && o.spot) egSpot(o.spot);
  });
  ctx.restore();
}
// the flashlight: native-pixel cells outside the circle go dark (a checker at the edge, black beyond)
function egSpot(sp) {
  const w = Math.ceil(W / NATIVE_PX), h = Math.ceil(H / NATIVE_PX), c = egCanvas('spot', w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const fx = (x + 0.5) * NATIVE_PX, fy = (y + 0.5) * NATIVE_PX, k = (Math.hypot(fx - sp.x, fy - sp.y) - sp.r) / sp.f, j = (y * w + x) * 4;
    d[j + 3] = k < 0 ? 0 : k < 1 ? ((x + y) & 1 ? 255 : 0) : 230;
  }
  g.putImageData(im, 0, 0); ctx.drawImage(c, 0, 0, w * NATIVE_PX, h * NATIVE_PX);
}

// ---- text: the aansa atlas (white glyphs), drawn on whole cells of S px with a black outline and drop shadow
const AF_CW = 20, AF_CH = 22;
function afAtlas(col) {
  const img = asset('font.png'); if (!img) return null;
  const c = egCanvas('font:' + col, img.naturalWidth, img.naturalHeight);
  if (c.dataset.ok) return c;
  const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over';
  c.dataset.ok = 1; return c;
}
// the black stroke: every cell within 2 of the glyph, plus a drop shadow 3 down-right
const AF_RING = []; for (let dy = -2; dy <= 3; dy++) for (let dx = -2; dx <= 3; dx++) if ((dx * dx + dy * dy <= 5 && (dx || dy)) || (dx === 3 && dy === 3) || (dx >= 1 && dy >= 1 && dx + dy <= 5)) AF_RING.push([dx, dy]);
const AF_TRACK = 0.4;   // letters a little tighter (user); the bold pass still needs a sliver so f and t don't touch
const afW = (s) => [...s].reduce((a, ch) => a + (AF_ADV[AF_CHARS.indexOf(ch)] ?? 6) + AF_TRACK, 0) - AF_TRACK;
function afRun(atl, s, x, y, S) {
  let cx = x;
  for (const ch of s) {
    const i = AF_CHARS.indexOf(ch);
    if (i >= 0) ctx.drawImage(atl, (i % 16) * AF_CW, Math.floor(i / 16) * AF_CH, AF_CW, AF_CH, cx - 2 * S, y - 2 * S, AF_CW * S, AF_CH * S);
    cx += ((AF_ADV[i] ?? 6) + AF_TRACK) * S;
  }
}
// afText(lines, cx, y, { S, count, col }) — centred lines, typed to count glyphs (spaces free)
// afText(lines, cx, y, { S, count }) — lower case, centred, typed to count glyphs (spaces free). Bold white letters,
// a thick black stroke, then a thin white edge around the stroke (the World of Horror outline, on the text too).
function afRing(r) { const R = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + r) R.push([dx, dy]); return R; }
function afText(lines, cx, y, o = {}) {
  const S = o.S ?? 5, lh = (o.lh ?? 15) * S, white = afAtlas('#fdfdfd'); if (!white) return;
  const SW = 2, R = o.stroke ?? 8, E = 0;   // bold offset, black stroke radius (no white edge: the user's call)
  let left = o.count ?? 1e9;
  lines.forEach((ln0, li) => {
    const ln = ln0.toLowerCase();
    let vis = ''; for (const ch of ln) { if (left <= 0) break; vis += ch; if (ch !== ' ') left--; }
    if (!vis) return;
    const tw = afW(ln) * S + SW + 2 * (R + E) + 8, th = AF_CH * S + 2 * (R + E), pad = R + E;
    const T = egCanvas('sub:t', tw, th), tg = T.getContext('2d'); tg.imageSmoothingEnabled = false; tg.clearRect(0, 0, tw, th);
    const saved = ctx; ctx = tg; afRun(white, vis, pad + 2 * S, pad + 2 * S, S); afRun(white, vis, pad + 2 * S + SW, pad + 2 * S, S); ctx = saved;
    const L = egCanvas('sub:l', tw, th), lg = L.getContext('2d'); lg.imageSmoothingEnabled = false; lg.clearRect(0, 0, tw, th);
    const stamp = (r, col) => {
      const M = egCanvas('sub:m', tw, th), mg = M.getContext('2d'); mg.clearRect(0, 0, tw, th);
      for (const [dx, dy] of afRing(r)) mg.drawImage(T, dx, dy);
      mg.globalCompositeOperation = 'source-in'; mg.fillStyle = col; mg.fillRect(0, 0, tw, th); mg.globalCompositeOperation = 'source-over';
      lg.drawImage(M, 0, 0);
    };
    stamp(R, '#000000'); lg.drawImage(T, 0, 0);
    const x = Math.round(cx - afW(ln) * S / 2) - pad - 2 * S, yy = Math.round(y + li * lh) - pad - 2 * S;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(L, x, yy); ctx.restore();
  });
}
// ---- subtitles from the voice: each line split into chunks of up to two rows (<= 22 characters), shown while its words
// are spoken and typed on at the speaking rate. SUB_TEXT overrides how a line reads on screen (quotes).
const SUB_S = 7;      // the caption letter size (9:16, as amigara)
const SUB_PX = 900;   // max row width in px (the frame is 1080)
function subChunks(l) {
  const text = SUB_TEXT[l.id] ?? l.text, ws = text.split(' '), rows = [], nWords = ws.filter((w) => w !== '|').length;
  let row = '';
  const fits = (r) => afW(r.toLowerCase()) * SUB_S <= SUB_PX;   // measured width at the subtitle size
  for (const w of ws) { if (w === '|') { if (row) rows.push(row); row = ''; continue; } if (row && !fits(row + ' ' + w)) { rows.push(row); row = w; } else row = row ? row + ' ' + w : w; if (/[.!?]"?$/.test(w) || (/,"?$/.test(w) && row.length > 9)) { rows.push(row); row = ''; } }
  if (row) { const j = rows.length ? rows[rows.length - 1] + ' ' + row : ''; if (row.split(' ').length <= 1 && j && fits(j)) rows[rows.length - 1] = j; else rows.push(row); }
  // no row ends on a little word ("the", "of"...), and no row is a lone word: move a word down from the row above
  for (let i = 0; i + 1 < rows.length; i++) {
    const a = rows[i].split(' '), b = rows[i + 1].split(' ');
    while (a.length > 1 && !/[.!?]"?$/.test(a[a.length - 1]) && (/^(the|of|on|a|an|to|into|and|but|like|was|who)$/.test(a[a.length - 1]) || b.length === 1) && fits(a[a.length - 1] + ' ' + b.join(' '))) { b.unshift(a.pop()); if (b.length > 2 && !/^(the|of|on|a|an|to|into|and|but|like|was|who)$/.test(a[a.length - 1])) break; }
    rows[i] = a.join(' '); rows[i + 1] = b.join(' ');
  }
  const chunks = [], nW = l.words.length, nT = nWords;
  let wi = 0;
  for (let i = 0; i < rows.length; i += step) {
    var step = /[.!?]"?$/.test(rows[i]) && rows[i + 1] ? 1 : 2;   // a sentence ends: its row stands alone
    const r = rows.slice(i, i + step), n = r.join(' ').split(' ').length;
    const a = l.words[Math.min(nW - 1, Math.round(wi * nW / nT))], e = l.words[Math.min(nW - 1, Math.round((wi + n) * nW / nT) - 1)];
    chunks.push({ rows: r, t0: a.t0, t1: e.t1 ?? e.t0 + 0.3 }); wi += n;
  }
  chunks.forEach((c, i) => { c.end = i + 1 < chunks.length ? chunks[i + 1].t0 : l.t1 + 6; });   // the last chunk holds through the pause
  return chunks;
}
const SUB_TEXT = { grandma: 'My grandmother said that | every winter in Shimane. | I thought it was a story | to keep kids off the rocks.', hook: 'If a woman on the beach | asks you to hold her baby, | don\'t.', heavy: 'The baby was cold. | Then heavy. | Then heavier. | My arms wouldn\'t let go.', slid: 'Behind her, | something long | slid out of the sea. | It didn\'t stop coming.', body: 'It wasn\'t her hair | she was washing. | It was her body. | Hundreds | of meters of it.' };
const SUBS = VOICE.lines.flatMap(subChunks);
SUBS.forEach((c, i) => {
  if (SUBS[i + 1]) c.end = Math.min(c.end, SUBS[i + 1].t0 - (SUBS[i + 1].t0 - c.t1 > 1.5 ? 0.5 : 0));
  const cut = SHOT_LIST.map(([t]) => t).find((t) => t > c.t0 + 0.3 && t > c.t1 - 0.3); if (cut != null) c.end = Math.min(c.end, cut);
  c.t1 = Math.min(c.t1, c.end - 0.25);   // a chunk that a cut ends early types a little faster, so it is read whole before the cut   // never over the next shot
});
let SUB_Y = 1300, SUB_STROKE = 7;   // a shot can thicken the caption stroke over busy white (the cloth)   // a shot can move the subtitles (the tunnel keeps its workers clear)
function subsNow() {
  for (const c of SUBS) if (TT >= c.t0 && TT < c.end) {
    const n = c.rows.join('').replace(/ /g, '').length, rate = Math.min(0.07, Math.max(0.025, (c.t1 - c.t0) / n));
    const f = () => afText(c.rows, CX, SUB_Y, { count: Math.floor((TT - c.t0) / rate) + 1, S: SUB_S, lh: 12, stroke: SUB_STROKE }); DEFER ? DEFER.push(f) : f();   // captions tremble with the picture (user)
  }
}

// ---- a World of Horror window tag: double white frame, the title on an inverted bar (e.g. the place or the person)
function wohTag(title, o = {}) {
  const f = () => {
    const S = 6, x = o.x ?? 66, y = o.y ?? 264, w = afW(title) * 4 + 8 * S, h = 13 * S;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(x - S, y - S, w + 2 * S, h + 2 * S);
    ctx.fillStyle = '#fdfdfd'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#000'; ctx.fillRect(x + S, y + S, w - 2 * S, h - 2 * S);
    ctx.fillStyle = '#fdfdfd'; ctx.fillRect(x + 2 * S, y + 2 * S, w - 4 * S, h - 4 * S);
    ctx.imageSmoothingEnabled = false; afRun(afAtlas('#000000'), title, x + 4 * S, y + 3 * S, 4);
    ctx.restore();
  };
  hud(f);
}
// a held face that swaps expressions on cue: keys = [[t, 'asset.png'], ...]; a swap lands with a 1-cell head nudge
function faceAt(keys) { let a = keys[0][1], t0 = keys[0][0]; for (const [t, k] of keys) if (TT >= t - 1e-6) { a = k; t0 = t; } return { a, nudge: TT - t0 < 1 / 12 + 1e-6 && t0 > keys[0][0] ? 1 : 0 }; }

// ---- faces: an expression track with blinks and small head moves, like a held anime close-up
// keys = [[t, 'asset.png'], ...]; blink = { 'base.png': 'blink.png' } (closed for one boil about every 2.6 s);
// every swap lands with a one-cell head nudge, and the head drifts a cell left/right now and then.
function face(keys, o = {}) {
  let a = keys[0][1], t0 = -1, i0 = 0;
  keys.forEach(([t, k], i) => { if (TT >= t - 1e-6) { a = k; t0 = t; i0 = i; } });
  const bl = o.blink?.[a], ph = mod(TT + (o.seed ?? 0.7), o.every ?? 2.6);
  if (bl && ph < 0.13 && TT - t0 > 0.3) a = bl;
  const cell = NATIVE_PX, nudge = 0;   // no jolt on a swap: the variants already line up
  const drift = Math.round(Math.sin((TT + (o.seed ?? 0) + 0.9) * 0.8) * 0.6);
  return { a, dx: (nudge + drift) * cell, dy: (nudge ? cell : 0) };
}
// a mouth that moves with each spoken word: open on the word, closed 0.12 s later
const lips = (id, open, shut) => VL(id).words.filter((w, i) => i % 2 === 0).flatMap((w) => [[w.t0, open], [w.t0 + 0.24, shut]]);

const pushIn = (t0, t1, z0, z1, x, y) => ({ z: lerp(z0, z1, EZ.io(seg(TT, t0, t1))), x, y });
const shotEnd = () => ERA_LIST[Math.max(0, eraAt(TT))][1];
// ---- pixel helpers in native cells (8 px): a cell, a line of cells, a filled disk
const cellAt = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x) * NATIVE_PX, Math.round(y) * NATIVE_PX, NATIVE_PX, NATIVE_PX); };
function cellLine(g, x0, y0, x1, y1, c, w = 1) {
  const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))), steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / (n || 1), y = y0 + (y1 - y0) * i / (n || 1); for (let k = 0; k < w; k++) cellAt(g, x + (steep ? k : 0), y + (steep ? 0 : k), c); }   // thickness across the line, so no stroke is 1 cell thin
}
function cellDisk(g, cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.5) cellAt(g, cx + x, cy + y, c); }
const PXD = new Map();
function pxData(name) {
  if (PXD.has(name)) return PXD.get(name);
  const img = asset(name); if (!img) return null;
  const c = egCanvas('px:' + name, img.naturalWidth, img.naturalHeight), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
  const d = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; PXD.set(name, d); return d;
}
const hsh = (a, b, c) => ((((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0) % 1000) / 1000;

// ---- native cell (c, r) of a default-placed 134x240 layer -> screen px (flowShot centres it at -63, -117)
const NX = (c) => -63 + c * NATIVE_PX, NY = (r) => -117 + r * NATIVE_PX;
const snap = (v) => Math.round(v / NATIVE_PX) * NATIVE_PX;

// ---- 1 HOOK: the sea at night; Nure-onna rises out of it (risen by 1.4 s), sways, stares. Expression track: base,
// a blink, a slow side-glance, back to the lens, and on "don't" the slit smile splits wider. All variants share the
// base's pixels outside the face box (tools/prep.py), so a swap changes the face only.
// The sea in front of her (plate rows below HOOK_WL) is drawn again over her body, so she comes OUT of the water; foam
// rings her body at the waterline. Captions sit above the horizon, over the dark neck: no wave line crosses them.
const HOOK_WL = 205;   // the waterline row (native)
const NURE_BLINK = { 'nureS_base.png': 'nureS_blink.png', 'nureS_side.png': 'nureS_blink.png' };
function hookRise() { return Math.round(lerp(64, 0, EZ.o3(seg(TT, 0, 1.4)))); }   // cells below rest
function seaFront(g) {
  const sp = asset('seaplate.png'); if (!sp) return;
  g.imageSmoothingEnabled = false;
  const wl = HOOK_WL, roll = Math.round(Math.sin(TT * 1.3) * 1);   // the waves roll a cell side to side
  g.drawImage(sp, 0, wl, 134, 240 - wl, NX(roll), NY(wl), 134 * NATIVE_PX, (240 - wl) * NATIVE_PX);
}
function hookFoam(g, cr, dxC, dyC) {
  const P = pxData(cr); if (!P) return;
  const r = HOOK_WL - dyC; if (r < 0 || r >= P.h) return;
  let x0 = -1, x1 = -1;
  for (let x = 0; x < P.w; x++) if (P.d[(r * P.w + x) * 4 + 3] > 0) { if (x0 < 0) x0 = x; x1 = x; }
  if (x0 < 0) return;
  const k = Math.floor(F / 3), cells = [];
  for (let i = -3; i <= 3; i++) { cells.push([x0 - 1 - Math.abs(i % 3), i < 0 ? 0 : 1]); cells.push([x1 + 1 + Math.abs(i % 3), i < 0 ? 0 : 1]); }
  for (let x = x0 - 6; x <= x1 + 6; x++) if (hsh(x, k, 7) < 0.55) cells.push([x, hsh(x, k, 3) < 0.5 ? 0 : -1]);
  g.fillStyle = '#fdfdfd';
  for (const [c, dr] of cells) g.fillRect(NX(c + dxC), NY(HOOK_WL + dr), NATIVE_PX, NATIVE_PX);
}
function sceneHook() {
  const rise = hookRise(), sway = Math.round(Math.sin(TT * 1.1) * 1.2), bob = Math.round(Math.sin(TT * 0.9 + 1) * 0.8);
  const f = face([[0, 'nureS_base.png'], [2.1, 'nureS_side.png'], [3.1, 'nureS_base.png'], [VW('hook', "don't"), 'nureS_wide.png']], { blink: NURE_BLINK, seed: 0.9, every: 2.4 });
  flowShot([
    { a: 'seaplate.png' },
    { a: f.a, dx: sway * NATIVE_PX, dy: (rise + bob) * NATIVE_PX },
    { draw: seaFront },
    { draw: (g) => hookFoam(g, f.a, sway, rise + bob) },
  ], { cam: pushIn(0, shotEnd(), 1.04, 1.12, 540, 760), subY: 1585 });
  subsNow();
}
// ---- 2 GRANDMOTHER: low angle in the doorway, slow push up to her; snow falls in code (native cells, flat white)
function snow(g, n = 40, seed = 1) {
  g.fillStyle = '#fdfdfd';
  for (let i = 0; i < n; i++) {
    const x = (hsh(i, seed, 1) * 134 + Math.sin(TT * 0.7 + i) * 1.5), y = (hsh(i, seed, 2) * 240 + TT * (4 + hsh(i, seed, 3) * 4)) % 240;
    g.fillRect(NX(Math.round(x)), NY(Math.round(y)), NATIVE_PX, NATIVE_PX);
  }
}
function sceneGran() {
  const gf = face([[E0, 'grandma.png'], [VW('grandma', 'every'), 'grandma_frown.png'], [VW('grandma', 'shimane') + 0.3, 'grandma.png']], { seed: 1.2 });
  flowShot([{ a: gf.a, dx: gf.dx }, { draw: (g) => snow(g, 22, 2) }], { cam: pushIn(E0, shotEnd(), 1.04, 1.16, 520, 760), subY: 1560 });
  wohTag('SHIMANE'); subsNow();
}
function sceneGranCU() {
  flowShot([{ a: 'grandma_ecu.png' }], { cam: pushIn(E0, shotEnd(), 1.05, 1.2, 380, 860), subY: 300 });   // captions over her hair: her mouth stays clear
  subsNow();
}
// ---- 3 SHORE: from high above; the camera drifts down the line of footprints toward the tiny kneeling figure
function sceneShore() {
  const u = EZ.io(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'shore.png' }], { cam: { z: lerp(1.05, 1.35, u), x: lerp(560, 700, u), y: lerp(1250, 820, u) }, subY: 1180 });
  subsNow();
}
// ---- 3b closer: the same woman (ots.png without the shoulder), kneeling with the bundle, so the beat reads
function sceneShoreHer() {
  flowShot([{ a: 'kneel.png' }], { cam: pushIn(E0, shotEnd(), 1.04, 1.16, 520, 800), subY: 1560 });
  subsNow();
}
// ---- 8b the stone face, close (stone.png): the payoff line
function sceneStoneCU() {
  flowShot([{ a: 'stone_old.png' }], { cam: pushIn(E0, shotEnd(), 1.05, 1.2, 520, 700), subY: 1560, stroke: 11 });
  subsNow();
}
// ---- 8c the old man, close: terrified, the stone baby in his arms; on "winter" his mouth opens in a silent scream
function sceneGrandpa() {
  const f = face([[E0, 'grandpa.png'], [VW('stone', 'winter'), 'grandpa_scream.png']], { seed: 0.4 });
  flowShot([{ a: f.a, dx: f.dx }], { cam: pushIn(E0, shotEnd(), 1.04, 1.18, 540, 640), subY: 1640 });
  subsNow();
}
// ---- 4 OVER THE SHOULDER: she offers the bundle; then the extreme close-up as the smile stretches on "too wide"
function sceneOts() {
  flowShot([{ a: 'ots.png' }], { cam: pushIn(E0, shotEnd(), 1.05, 1.14, 640, 900), subY: 1560 });
  subsNow();
}
function sceneSmile() {
  const tw = VW('smile', 'wide');
  const a = TT < tw ? 'smile_a.png' : 'smile_b.png';
  flowShot([{ a }], { cam: pushIn(E0, shotEnd(), 1.08, 1.22, 540, 1020), shake: TT >= tw && TT < tw + 0.1 ? [1, 0] : [0, 0], subY: 1640 });
  subsNow();
}
// ---- 5 THE STONE: high-angle POV on his hands; the bundle sinks two cells on each "heavy", with a jolt
function sceneStone() {
  const hits = [VW('heavy', 'heavy'), VW('heavy', 'heavier'), VW('heavy', 'go')];
  const n = hits.filter((t) => TT >= t).length, jolt = hits.some((t) => TT >= t && TT < t + 0.12);
  flowShot([{ a: 'stone.png', dy: n * 2 * NATIVE_PX }], { cam: pushIn(E0, shotEnd(), 1.04, 1.12, 540, 760), shake: jolt ? [0, 1] : [0, 0], subY: 1560, stroke: 11 });
  subsNow();
}
// ---- 6 THE REVEAL: silence, tight on her face (reveal_pre.png: no body anywhere); then the hard cut wide on the hit, a shake that settles
function sceneSilence() {
  flowShot([{ a: 'reveal_pre.png' }], { cam: { z: lerp(1.6, 1.7, seg(TT, E0, shotEnd())), x: 204, y: 1190 }, subY: 1560 });
  subsNow();
}
function sceneReveal() {
  const t = TT - E0, sh = t < 0.3 ? [(F % 2 ? 2 : -2), (F % 3) - 1] : [0, 0];
  flowShot([{ a: 'reveal.png' }], { cam: { z: lerp(1.25, 1.04, EZ.o3(seg(t, 0, 0.5))) + 0.06 * seg(t, 0.5, shotEnd() - E0), x: 600, y: 760 }, shake: sh, subY: 210 });
  subsNow();
}
// ---- 7 THE TOWER: worm's-eye; tilt up the converging body from the surf to her head against the moon
function sceneTower() {
  const u = EZ.io(seg(TT, E0, shotEnd() - 0.6));
  flowShot([{ a: 'tower.png' }], { cam: { z: lerp(1.55, 1.14, u), x: 540, y: lerp(1900, 200, u) }, subY: 1500 });   // starts low and tight (her head hidden), tilts up to it
  subsNow();
}
// ---- 8 YEARS LATER: from the ceiling corner, a slow push on the old man and the bundle; snow outside the window
function sceneOldman(close = false) {
  const of = close ? face([[E0, 'oldman_up.png'], [VW('stone', 'every'), 'oldman.png']]) : face([[E0, 'oldman.png'], [VW('stone', 'still'), 'oldman_up.png']]);
  flowShot([{ a: of.a }], { cam: close ? pushIn(E0, shotEnd(), 1.3, 1.45, 470, 900) : pushIn(E0, shotEnd(), 1.05, 1.25, 470, 1020), subY: 1560 });
  subsNow();
}
// ---- 9 THE CARD: black; the creature in a World of Horror double frame, NURE-ONNA in aansa, 濡女 in the dot font
function sceneCard() {
  const t = TT - E0, cr = asset('nureS_base.png'), kj = asset('card_kanji.png');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  const S = 9, fx = 180, fy = 300, fw = 720, fh = 1000;   // the window
  const on = Math.min(1, t / 0.4);
  if (cr) {
    const vis = Math.round(fh * on / S) * S;   // the portrait wipes down in cell rows
    ctx.save(); ctx.beginPath(); ctx.rect(fx + 2 * S, fy + 2 * S, fw - 4 * S, Math.max(0, vis - 4 * S)); ctx.clip();
    const k = 6, w = cr.width * k, h = cr.height * k, bob = Math.round(Math.sin(t * 1.4) * 1) * k;
    ctx.drawImage(cr, Math.round((540 - w / 2) / k) * k, fy - 6 * k + bob, w, h); ctx.restore();
  }
  hud(() => {
    ctx.fillStyle = '#fdfdfd'; ctx.fillRect(fx - 2 * S, fy - 2 * S, fw + 4 * S, S); ctx.fillRect(fx - 2 * S, fy + fh + S, fw + 4 * S, S);
    ctx.fillRect(fx - 2 * S, fy - 2 * S, S, fh + 4 * S); ctx.fillRect(fx + fw + S, fy - 2 * S, S, fh + 4 * S);
    ctx.fillRect(fx, fy, fw, S); ctx.fillRect(fx, fy + fh - S, fw, S); ctx.fillRect(fx, fy, S, fh); ctx.fillRect(fx + fw - S, fy, S, fh);
    if (t > 0.5) afText(['nure-onna'], CX, fy + fh + 90, { count: Math.floor((t - 0.5) / 0.07) + 1, S: 9, stroke: 9 });
    if (kj && t > 1.3) { const k = 6; ctx.drawImage(kj, Math.round(540 - kj.width * k / 2), fy + fh + 230, kj.width * k, kj.height * k); }
  });
  ctx.restore();
}
// ---- 10 THE MADFABLE OUTRO (9:16): the red forest (outro_bg.png, 8 px a cell, centre-cropped) powers on in four steps
// behind the black trees with a slow push; "madfable" dissolves in at the top centre; the cartridge steps in
// centred under the name (x6 cells), loops for the ~20 s end screen. The one place with colour: egWiggle and the HUD skip the black-and-white pass here.
const OUTRO = { nameY: 300, cardY: 560, k: 6 };   // 9:16 (user): the card centred under the wordmark, 2x (6 px a cell)
function outroRed(bg) {
  const c = egCanvas('outro:red', bg.width, bg.height); if (c.dataset.ok) return c;
  const g = c.getContext('2d'); g.drawImage(bg, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let j = 0; j < d.length; j += 4) if (d[j] > 60) { d[j] = 168; d[j + 1] = 0; d[j + 2] = 10; }
  g.putImageData(im, 0, 0); c.dataset.ok = 1; return c;
}
function sceneLogo() {
  const t = TT - E0, bg = asset('outro_bg.png'), card = asset('outro_card.png'), nm = asset('outro_name.png');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  if (!bg || !card || !nm) { ctx.restore(); return; }
  const z = lerp(1.0, 1.06, EZ.io(seg(t, 0, shotEnd() - E0))), P = 8;
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z); ctx.drawImage(outroRed(bg), 540 - bg.width * P / 2, 960 - bg.height * P / 2, bg.width * P, bg.height * P);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const on = Math.min(4, Math.floor(t / 0.11));
  if (on < 4) { ctx.fillStyle = `rgba(0,0,0,${1 - on / 4})`; ctx.fillRect(0, 0, W, H); }
  const dissolve = (img, x, y, q, cell, tag) => {
    const N = egCanvas(tag, img.width, img.height), g = N.getContext('2d'); g.clearRect(0, 0, N.width, N.height); g.drawImage(img, 0, 0);
    if (q < 1) {
      g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#fff'; g.beginPath();
      for (let yy = 0; yy < img.height; yy += cell) for (let xx = 0; xx < img.width; xx += cell) if (hsh(xx, yy, cell) < q) g.rect(xx, yy, cell, cell);
      g.fill(); g.globalCompositeOperation = 'source-over';
    }
    ctx.drawImage(N, x, y);
  };
  const qn = seg(t, 0.45, 1.05);
  if (qn > 0) hud(() => dissolve(nm, Math.round((W - nm.width) / 2 / 5) * 5, OUTRO.nameY, qn, 10, 'outro:n'));
  const tc = t - 0.9;
  if (tc > 0) hud(() => {
    const fw = card.width / 8, fh = card.height / 6, k = Math.floor(tc * 12) % 48, K = OUTRO.k;
    const S = egCanvas('outro:cf', fw, fh), sg = S.getContext('2d'); sg.clearRect(0, 0, fw, fh); sg.drawImage(card, (k % 8) * fw, Math.floor(k / 8) * fh, fw, fh, 0, 0, fw, fh);
    const C = egCanvas('outro:c2', fw * K, fh * K), cg = C.getContext('2d'); cg.imageSmoothingEnabled = false; cg.clearRect(0, 0, C.width, C.height); cg.drawImage(S, 0, 0, fw * K, fh * K);
    dissolve(C, Math.round((W - fw * K) / 2 / K) * K, OUTRO.cardY, seg(tc, 0, 0.25), 12, 'outro:c');
  });
  ctx.restore();
}

// ---- the board: one key time per beat, each where its caption chunk is fully typed (never mid-word)
function chunkDone(id, k, pad = 0.2) {
  const l = VL(id), cs = SUBS.filter((c) => c.t0 >= l.t0 - 1e-6 && c.t0 <= l.t1 + 1e-6), c = cs[Math.min(k, cs.length - 1)];
  const n = c.rows.join('').replace(/ /g, '').length, rate = Math.min(0.07, Math.max(0.025, (c.t1 - c.t0) / n));
  return Math.min(c.end - 0.05, c.t0 + n * rate + pad);
}
TIMELINE.board = [
  { t: chunkDone('hook', 0), title: '1 hook: she rises out of the sea, stares (frontal close)', sound: 'surf, sub swell, talking loop', next: 'side-glance, blink' },
  { t: chunkDone('hook', 2), title: '1 "don\'t." the slit smile splits', sound: 'low hit on "don\'t"', next: 'cut' },
  { t: chunkDone('grandma', 0), title: '2 grandmother, doorway, LOW angle, snow', sound: 'winter wind, house creak', next: 'cut in on "I thought"' },
  { t: chunkDone('grandma', 2), title: '2b her eye, EXTREME close-up', sound: 'wind drops, a breath', next: 'cut' },
  { t: chunkDone('shore', 1), title: '3 shoreline from HIGH above, footprints', sound: 'surf, distant gulls off', next: 'drift down to her' },
  { t: chunkDone('shore', 3), title: '3b closer: the woman kneeling with the bundle', sound: 'surf closer, cloth drip', next: 'cut' },
  { t: chunkDone('smile', 0), title: '4 OVER THE SHOULDER: she offers the bundle', sound: 'her wet breath, drips', next: 'cut on "She smiled"' },
  { t: chunkDone('smile', 2), title: '4b EXTREME close-up: the smile stretches', sound: 'skin creak, sub drop', next: 'cut' },
  { t: chunkDone('heavy', 2), title: '5 HIGH-angle POV: stone infant, hands sink', sound: 'stone grind + thud per "heavy"', next: 'cut' },
  { t: REVEAL - 0.3, title: '6 exact silence, tight on her face', sound: 'SILENCE', next: 'hard cut on the hit' },
  { t: chunkDone('slid', 3), title: '6b WIDE: the body slides out of the sea', sound: 'LOUDEST hit, scales scraping', next: 'cut' },
  { t: chunkDone('body', 3) + 0.4, title: '7 WORM\'S-EYE: up the body to her head, moon', sound: 'water pouring off, deep drone', next: 'cut' },
  { t: chunkDone('stone', 1), title: '8 years later, from the ceiling: the bundle', sound: 'room tone, creak, wind', next: 'cut on "It\'s a stone"' },
  { t: chunkDone('stone', 2), title: '8b the stone face, close', sound: 'low hit', next: 'cut back to him, closer' },
  { t: chunkDone('stone', 3), title: '8c the old man, close, terrified, the stone baby', sound: 'deep hit on "winter"', next: 'cut to black' },
  { t: CARD + 2.6, title: '9 card: NURE-ONNA 濡女', sound: 'one low hit, ring-out', next: 'cut' },
  { t: LOGO + 2.4, title: '10 Madfable red outro (5 s)', sound: 'scrape + low hit, silence', next: 'end' },
];

// ---- the wiggle (lost-second): whole-frame turbulence + the black-and-white pass; egbw for the HUD
let EG_WIG = null;
function egWiggle(px = 2.6) {
  if (typeof document === 'undefined') return;
  if (!EG_WIG) {
    const NS = 'http' + '://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    for (let j = 0; j < 8; j++) {
      const i = j % 4, f = document.createElementNS(NS, 'filter'); f.setAttribute('id', (j < 4 ? 'egwig' : 'egwigc') + i); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.022'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(3 + i * 7)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'SourceGraphic'); d.setAttribute('in2', 'n'); d.setAttribute('scale', String(px * 2)); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      // then the black-and-white pass over everything (Flow's images come out greyish): no tint, greys pushed darker,
      // whites to pure white. The user's standing rule for this style; tune the exponent as the videos go.
      const m = document.createElementNS(NS, 'feColorMatrix'); m.setAttribute('type', 'saturate'); m.setAttribute('values', '0');
      const ct = document.createElementNS(NS, 'feComponentTransfer'); ct.setAttribute('color-interpolation-filters', 'sRGB'); m.setAttribute('color-interpolation-filters', 'sRGB');
      for (const ch of ['feFuncR', 'feFuncG', 'feFuncB']) { const fn = document.createElementNS(NS, ch); fn.setAttribute('type', 'gamma'); fn.setAttribute('amplitude', '1.08'); fn.setAttribute('exponent', '2.0'); fn.setAttribute('offset', '-0.02'); ct.appendChild(fn); }
      f.appendChild(t); f.appendChild(d); if (j < 4) { f.appendChild(m); f.appendChild(ct); } svg.appendChild(f);
    }
    { // egbw: the black-and-white pass alone (no displacement), for the HUD drawn after the wiggle
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'egbw'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const m = document.createElementNS(NS, 'feColorMatrix'); m.setAttribute('type', 'saturate'); m.setAttribute('values', '0'); m.setAttribute('color-interpolation-filters', 'sRGB');
      const ct = document.createElementNS(NS, 'feComponentTransfer'); ct.setAttribute('color-interpolation-filters', 'sRGB');
      for (const ch of ['feFuncR', 'feFuncG', 'feFuncB']) { const fn = document.createElementNS(NS, ch); fn.setAttribute('type', 'gamma'); fn.setAttribute('amplitude', '1.08'); fn.setAttribute('exponent', '2.0'); fn.setAttribute('offset', '-0.02'); ct.appendChild(fn); }
      f.appendChild(m); f.appendChild(ct); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    EG_WIG = document.createElement('canvas'); EG_WIG.width = W; EG_WIG.height = H;
  }
  const g = EG_WIG.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `url(#egwig${TT >= LOGO ? 'c' : ''}${Math.floor(F / 3) % 4})`; ctx.drawImage(EG_WIG, 0, 0); ctx.filter = 'none'; ctx.restore();
}
// ---- the HUD (captions, CCTV marks, labels, counters, tags, bezels, the outro name and card): queued by the scenes with
// hud(f), drawn after the wiggle so it never trembles; it still gets the black-and-white pass (not on the colour outro)
const HUD_Q = [];
function hud(f) { HUD_Q.push([F, f]); }
function hudFlush() {
  const q = HUD_Q.filter(([fr]) => fr === F); HUD_Q.length = 0;
  if (!q.length || typeof document === 'undefined') return;
  const C = egCanvas('hud', W, H), g = C.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = false;
  const saved = ctx; ctx = g;
  for (const [, f] of q) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; f(); ctx.restore(); }
  ctx = saved;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = TT >= LOGO ? 'none' : 'url(#egbw)'; ctx.drawImage(C, 0, 0); ctx.filter = 'none'; ctx.restore();
}
STYLE.post = () => { egWiggle(1.5); hudFlush(); };   // 1.5 px wiggle on picture + captions; HUD after, no wiggle

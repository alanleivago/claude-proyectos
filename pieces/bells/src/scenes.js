// =====================================================================
//  SCENES — bells (16:9), copied from the lost second. Flow images (assets/) drawn into a low-res grid, then quantized to the onebit ramp
//  (black, night, wall grey, paper) with a 4x4 Bayer dither; red is the one accent (the cross). Text = aansa atlas.
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
const NATIVE_PX = 8;   // one native pixel = 8 screen px exactly (240x134 -> 1920x1072); cam.z >= 1.01 hides the 8-px strip
function flowShot(layers, o = {}) {
  SUB_Y = 860;
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
    if (lw == null) { const cp = iw > 300 ? NATIVE_PX / 2 : NATIVE_PX; lw = iw * cp; lh = ih * cp; const q = L.free ? 1 : cp;   // the character shots sit on a finer 4-px grid (tools/gentle.py)
      x = Math.round(((W - lw) / 2 + (L.dx ?? 0)) / q) * q; y = Math.round(((H - lh) / 2 + (L.dy ?? 0)) / q) * q; }   // free layers (parallax) move by whole screen px
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
const SUB_S = 4;      // the caption letter size (16:9: small)
const SUB_PX = 1240;   // max row width in px (the frame is 1920)
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
const SUB_TEXT = { inscr: "Medieval bells carried an inscription: | \"I call the living. | I mourn the dead. | I break the lightning.\"" };
const SUBS = VOICE.lines.flatMap(subChunks);
SUBS.forEach((c, i) => {
  if (SUBS[i + 1]) c.end = Math.min(c.end, SUBS[i + 1].t0 - (SUBS[i + 1].t0 - c.t1 > 1.5 ? 0.5 : 0));
  const cut = SHOT_LIST.map(([t]) => t).find((t) => t > c.t0 + 0.3 && t > c.t1 - 0.3); if (cut != null) c.end = Math.min(c.end, cut);
  c.t1 = Math.min(c.t1, c.end - 0.25);   // a chunk that a cut ends early types a little faster, so it is read whole before the cut   // never over the next shot
});
let SUB_Y = 1300;   // a shot can move the subtitles (the tunnel keeps its workers clear)
function subsNow() {
  for (const c of SUBS) if (TT >= c.t0 && TT < c.end) {
    const n = c.rows.join('').replace(/ /g, '').length, rate = Math.min(0.07, Math.max(0.025, (c.t1 - c.t0) / n));
    const f = () => afText(c.rows, CX, SUB_Y, { count: Math.floor((TT - c.t0) / rate) + 1, S: SUB_S, lh: 12, stroke: 7 }); DEFER ? DEFER.push(f) : f();   // captions tremble with the picture (user)
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
const MAN_BLINK = { 'mnM_base.png': 'mnM_blink.png' }, YO_BLINK = { 'yoM_base.png': 'yoM_blink.png' }, OW_BLINK = { 'owM_base.png': 'owM_blink.png' };
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

// =====================================================================
//  BELLS — the look-check shots (beats 10, 13-14, 24). Everything else is a black placeholder until the board.
// =====================================================================
const hsh = (a, b, c) => ((((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0) % 1000) / 1000;
function sceneTodo() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  SUB_Y = 860; subsNow();
}
// low fog: native cells drifting left along a band (grey, a few white crests), drawn over the crag's foot
function fogBand(g, y0, y1, speed, seed, dens = 0.5) {
  const t = TT * speed;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < 240; x++) {
    const u = x + t, k = Math.sin(u * 0.11 + seed + y * 0.7) + Math.sin(u * 0.047 - y * 0.31 + seed * 2) + Math.sin(u * 0.023 + seed);
    const edge = 1 - Math.abs((y - (y0 + y1) / 2) / ((y1 - y0) / 2 + 0.5));
    if (k * 0.5 + edge > 1.55 - dens) cellAt(g, x, y, k > 1.6 ? '#fdfdfd' : '#8e8e8e');
  }
}
// ---- beat 10: "a brow. a nose. two closed eyelids. larger than the mountain." The shot opens low on the monastery
// (the crag in its fog) and tilts up the face feature by feature as the caption names them, then eases back wide on
// "mountain" so face and monastery read together. Low fog drifts across the crag's foot.
function sceneFace() {
  const tb = VW('face', 'brow'), tn = VW('face', 'nose'), te = VW('face', 'eyelids'), tm = VW('face', 'mountain');
  // A1 (the sky is the face) in frame px: brow/eyes y~340, nose tip ~520, mouth ~600, monastery 800-960 (x 960)
  // one continuous move (user: no push-pull-push): a slow tilt from the monastery up the face, easing out as it reaches
  // the eyelids, with a gentle zoom-out under it so the face's scale opens up; no reversal
  const u = EZ.io(seg(TT, E0 + 0.3, Math.min(shotEnd(), tm + 1.2)));
  const cam = { z: lerp(1.55, 1.3, u), x: 960, y: lerp(860, 380, u) };
  const v = EZ.io(seg(TT, E0, shotEnd())), Ly = LAY.face;
  flowShot([{ a: 'face_closed_bg.png', dx: lerp(-Ly.b[0] / 2, Ly.b[0] / 2, v), dy: lerp(-Ly.b[1] / 2, Ly.b[1] / 2, v), free: true },
    ...Ly.fog.map((f) => ({ draw: (g) => fogBand(g, f[0], f[1], f[2], f[3], f[4]) })),
    { a: 'face_closed_fg.png', dx: lerp(-Ly.p[0] / 2, Ly.p[0] / 2, v), dy: 0, free: true }], { cam });
  SUB_Y = 975; subsNow();   // under the monastery, so the scale reference stays clear
}
// ---- beats 13-14: the log. Wide on the lectern, the ink fills in line by line while "one line for every hour"; then on
// "asleep" a slow push down the right page. The candle flame flickers (cells above the wick).
function sceneLog() {
  const ta = AT('asleep'), tw = VW('asleep', 'asleep'), ink = asset('log_ink.png');
  const fill = seg(TT, E0 + 0.2, tw - 0.4);   // the ink fills while "every line said the same word"
  const cam = TT < tw - 0.3 ? pushIn(E0, tw - 0.3, 1.26, 1.36, 960, 520) : { z: lerp(1.36, 1.95, EZ.io(seg(TT, tw - 0.3, shotEnd()))), x: lerp(960, 1220, EZ.io(seg(TT, tw - 0.3, tw + 1.5))), y: lerp(520, 600, EZ.io(seg(TT, tw - 0.3, shotEnd()))) };
  const flame = (g) => {   // the wick sits at native (47, 16): a 1-2 cell tongue that flickers
    const k = Math.floor(TT * 8), h1 = hsh(k, 2, 7);
    cellAt(g, 47 + (h1 < 0.3 ? -1 : h1 > 0.7 ? 1 : 0), 13, h1 > 0.5 ? '#fdfdfd' : '#8e8e8e');
    if (h1 > 0.4) cellAt(g, 47, 12, '#8e8e8e');
  };
  const inkL = (g) => {   // the handwriting at 4 px a cell, revealed top to bottom, left page then right
    if (!ink) return; const rows = ink.height, n = fill * 2, lp = Math.min(1, n), rp = Math.max(0, n - 1);
    const sp = ink.width * 0.5;   // the gutter: half the layer
    if (lp > 0) g.drawImage(ink, 0, 0, sp, rows * lp, 0, 0, sp * 4, rows * lp * 4);
    if (rp > 0) g.drawImage(ink, sp, 0, sp, rows * rp, sp * 4, 0, sp * 4, rows * rp * 4);
  };
  flowShot([{ a: 'log.png' }, { draw: inkL }, { draw: flame }], { cam });
  SUB_Y = 1000; subsNow();   // below the page text, on the page stack and lectern edge
}

// =====================================================================
//  THE BEATS (board): one Flow image per beat (assets/b*.png, native grid), each with its own slow move; a few swap the
//  image on a key word (the same framing), HUD tags/counters where they help (no wiggle).
//  cam: [z0, z1, x0, y0, x1, y1] in frame px over the shot, eased.
// =====================================================================
const FX = 1920 / 1376;   // Flow px -> frame px
const BEATS = {
  hook:    { a: 'b01_monastery.png', cam: [1.04, 1.32, 1250, 420, 1380, 300], tag: ['修道院-THE MONASTERY', 'tower'] },
  never:   { a: () => TT < VW('never', 'war', 1) - 0.12 ? 'b02_plague.png' : 'b02_war.png', cam: () => TT < VW('never', 'war', 1) - 0.12 ? [1.05, 1.22, 960, 520, 960, 420] : [1.08, 1.22, 960, 560, 1000, 420] },
  why:     { a: () => TT < VW('why', 'villagers') - 0.12 ? 'b03_monks.png' : 'b03_villagers.png', cam: () => TT < VW('why', 'villagers') - 0.12 ? [1.04, 1.2, 960, 560, 960, 400] : [1.04, 1.2, 960, 640, 960, 380] },
  died:    { a: 'b04_died.png', cam: [1.05, 1.5, 900, 470, 830, 400] },
  silent:  { a: 'b05_bell.png', cam: [1.04, 1.18, 960, 520, 960, 470], clock: true },
  dogs:    { a: 'b06_dogs.png', cam: [1.25, 1.28, 700, 600, 1250, 560] },
  strange: { a: () => TT < VW('strange', 'silence') - 0.1 ? 'b07_window.png' : 'b07_window_b.png', cam: [1.08, 1.45, 1100, 420, 1160, 380] },
  fog:     { a: 'b08_fog.png', cam: [1.35, 1.08, 960, 260, 960, 560] },
  sunrise: { a: 'b09_sunrise.png', cam: [1.04, 1.32, 960, 760, 960, 380] },
  hour:    { a: () => TT < VW('hour', 'eyelids') - 0.1 ? 'face_closed.png' : TT < VW('hour', 'more') - 0.1 ? 'b11_slits.png' : 'b11_half.png', cam: [1.12, 1.5, 960, 380, 960, 330], hours: true },
  rope:    { a: 'b12_rope.png', cam: [1.08, 1.5, 760, 520, 1120, 250] },
  log:     { a: 'b13_archive.png', cam: [1.03, 1.6, 960, 600, 960, 640], tag: ['記録-THE LOG', 'book'] },
  oldest:  { a: 'b15_oldest.png', cam: [1.04, 1.42, 960, 480, 960, 330] },
  other:   { a: 'b16_historians.png', cam: [1.04, 1.3, 960, 540, 1080, 470] },
  inscr:   { a: 'b17_band.png', cam: [1.03, 1.1, 1080, 520, 1080, 520], latin: true },
  fourth:  { a: 'b18_scratched.png', cam: [1.05, 1.4, 960, 520, 960, 520] },
  war:     { a: 'b19_cemetery.png', cam: [1.2, 1.25, 600, 600, 1200, 560], tag: ['鐘-THE BELLS 1939-1945', 'bell'], count: true },
  winter:  { a: 'b20_empty.png', cam: [1.04, 1.42, 960, 640, 960, 430], tag: ['冬-WINTER 1942', 'flake'] },
  seventh: { a: 'b21_carry.png', cam: [1.2, 1.28, 700, 640, 1150, 430], tag: ['第七夜-NIGHT 7', 'moon'] },
  hung:    { a: 'b22_hands.png', cam: [1.05, 1.3, 960, 520, 960, 560], shake: true },
  open:    { a: 'b23_above.png', cam: [1.03, 1.28, 960, 600, 960, 340], blackAfter: () => VL('open').t1 + 0.9 },
  rang:    { a: 'b25_rang.png', cam: () => TT < VW('rang', 'and') - 0.12 ? [1.85, 1.95, 1820, 520, 1810, 480] : [1.06, 1.18, 1000, 520, 1000, 470], from: () => (TT < VW('rang', 'and') - 0.12 ? E0 : VW('rang', 'and') - 0.12), ring: true },
  notall:  { a: 'b26_sliver.png', cam: [1.02, 1.3, 960, 540, 980, 520] },
  road:    { a: 'b27_monk.png', cam: [1.03, 1.45, 960, 600, 960, 300], sign: true },
  near:    { a: 'b28_town.png', cam: [1.05, 1.4, 960, 700, 960, 400], subY: 300 },
  who:     { a: 'b29_empty.png', cam: [1.02, 1.25, 960, 540, 1100, 470] },
};
// ---- LAYERS: the board images split into background / foreground (tools/layers.py: Flow magenta isolations or the sky
// split), each moving on its own: L = { p: [x, y] the foreground's travel over the shot (frame px, eased), b: [x, y] the
// background's (often the other way), sway: px of slow breathing on the foreground, bob: [px, period] a periodic pull }
const LAY = {
  hook:    { p: [-26, 6], b: [30, 0], fog: [[38, 46, 1.5, 2.1, 0.25]] },
  never:   { p: [34, 0], b: [-14, 0], sway: 2 },
  why:     { p: [-24, 0], b: [12, 0], bob: [10, 2.2] },
  died:    { p: [-18, 10], b: [10, -4], snow: 'door' },
  silent:  { p: [-16, 0], b: [36, -8], snow: 'far' },
  dogs:    { p: [-30, -10], b: [18, 0], snow: 'all', sway: 2 },
  strange: { p: [-22, 0], b: [16, 0], sway: 3 },
  fog:     { p: [0, 0], b: [0, 70], fog: [[100, 112, 3.0, 4.1, 0.4]] },
  sunrise: { p: [-20, 4], b: [36, 0] },
  face:    { p: [-26, 0], b: [18, -10], fog: [[66, 74, 2.2, 1.3, 0.18], [112, 122, 4.0, 4.1, 0.4]] },
  hour:    { p: [-24, 0], b: [20, -8], fog: [[70, 77, 2.6, 2.7, 0.18], [112, 122, 4.0, 5.1, 0.4]] },
  rope:    { p: [-28, 0], b: [14, 0], sway: 2 },
  other:   { p: [-26, 0], b: [14, 0], sway: 2 },
  winter:  { p: [-18, 0], b: [70, 0], snow: 'all' },
  seventh: { p: [70, -34], b: [-10, 0], snow: 'all', bob: [3, 0.7] },
  open:    { p: [0, 16], b: [0, -30], fog: [[90, 100, 2.0, 3.3, 0.2]] },
  rang:    { p: [-24, 0], b: [34, -6], fog: [[70, 80, 2.4, 6.2, 0.2]] },
  road:    { p: [0, -14], b: [0, 10], fog: [[80, 92, 1.4, 7.7, 0.35]] },
  near:    { p: [-40, 18], b: [10, 0], bob: [3, 0.55] },
  who:     { p: [-20, 0], b: [40, 0], fog: [[60, 70, 1.2, 8.8, 0.3]] },
};
// particles in native cells: snow (two depths, wind drift), drawn into a draw layer; seeded so every frame is repeatable
function snowLayer(kind) {
  return (g) => {
    const n = kind === 'all' ? 140 : 70, area = kind === 'door' ? [150, 0, 240, 70] : kind === 'far' ? [60, 30, 180, 120] : [0, 0, 240, 134];
    for (let i = 0; i < n; i++) {
      const near = i % 3 === 0, sp = near ? 9 : 4.5, x0 = hsh(i, 7, 3) * 260, y0 = hsh(i, 2, 9) * 150;
      const y = mod(y0 + TT * sp, 150) - 8, x = mod(x0 + TT * (near ? 3.2 : 1.6) + Math.sin(TT * 0.7 + i) * 1.5, 260) - 10;
      if (x < area[0] || x > area[2] || y < area[1] || y > area[3]) continue;
      cellAt(g, x, y, near ? '#fdfdfd' : '#8e8e8e');
    }
  };
}
function dripLayer(g) {   // beat 22: dark drops falling from the knuckles
  for (let i = 0; i < 6; i++) {
    const x = [118, 122, 128, 124, 131, 120][i], y0 = [66, 70, 84, 92, 96, 104][i], per = 1.6 + i * 0.37, u = mod(TT + i * 0.53, per) / per;
    cellAt(g, x, y0 + u * u * 40, '#101010');
  }
}
function moteLayer(g) {   // dust motes drifting in the lantern / flashlight light
  for (let i = 0; i < 26; i++) {
    const x = mod(hsh(i, 5, 1) * 240 + TT * (0.6 + hsh(i, 1, 2)), 240), y = mod(hsh(i, 3, 8) * 134 - TT * (0.4 + hsh(i, 9, 2) * 0.6), 134);
    if (Math.floor(TT * 3 + i) % 5) cellAt(g, x, y, '#8e8e8e');
  }
}
const OVER = { log: moteLayer, oldest: moteLayer, fourth: moteLayer, war: snowLayer('far'), hung: dripLayer };
const LATIN = [['VIVOS VOCO', 'call'], ['MORTUOS PLANGO', 'mourn'], ['FULGURA FRANGO', 'break']];
// the inscription cast on the bell: the three phrases are set flat on a scratch canvas (S 6, the caps ~60 px), then laid
// column by column onto the band's own curve, measured from b17_band (frame px: band visible x 363-1695, its centre line
// y = 520 + K (x - 1100)^2, K = 1.07e-4; the strip is ~215 px tall), condensed to fit X0..X1 with margins, foreshortened
// toward the ends (x follows sin, letters lower and narrower), and raised: light edge up-left, dark edge down-right,
// grey face. Each phrase appears on its caption cue.
const BAND = { cx: 1080, cy: 515, k: 1.5e-4, x0: 450, x1: 1610 };
function latinBand(g) {
  const atl = afAtlas('#ffffff'); if (!atl) return;
  const S = 6, GAP = 54, ws = LATIN.map(([w]) => afW(w) * S), tot = ws.reduce((a, b) => a + b, 0) + GAP * 2;
  const T = egCanvas('latin:t', Math.ceil(tot) + 8, AF_CH * S), tg = T.getContext('2d'); tg.clearRect(0, 0, T.width, T.height); tg.imageSmoothingEnabled = false;
  const saved = ctx; ctx = tg; let x = 4;
  LATIN.forEach(([w, cue], i) => { if (TT >= VW('inscr', cue) - 0.1) afRun(atl, w, x, 2 * S, S); x += ws[i] + GAP; });
  ctx = saved;
  const M = egCanvas('latin:m', T.width, T.height), mg = M.getContext('2d');
  const tint = (col) => { mg.globalCompositeOperation = 'source-over'; mg.clearRect(0, 0, M.width, M.height); mg.drawImage(T, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = col; mg.fillRect(0, 0, M.width, M.height); mg.globalCompositeOperation = 'source-over'; return M; };
  const a0 = 0.9, hw = (BAND.x1 - BAND.x0) / 2, mid = (BAND.x0 + BAND.x1) / 2;
  const at = (c) => { const th = (c / T.width * 2 - 1) * a0; return mid + hw * Math.sin(th) / Math.sin(a0); };
  const place = (img, ox, oy) => {
    for (let c = 0; c < img.width; c += 2) {
      const X = at(c), X2 = at(c + 2), th = (c / img.width * 2 - 1) * a0, sc = 0.8 + 0.2 * Math.cos(th);
      const Y = BAND.cy + BAND.k * (X - BAND.cx) * (X - BAND.cx), h = img.height * sc;
      g.drawImage(img, c, 0, 2, img.height, Math.round(X + ox), Math.round(Y - h * 0.52 + oy), Math.max(1, Math.ceil(X2 - X)), Math.round(h));
    }
  };
  g.imageSmoothingEnabled = false;
  place(tint('#fdfdfd'), -3, -3); place(tint('#101010'), 4, 4); place(tint('#8e8e8e'), 0, 0);
}
function roadSign(g) {   // beat 27: "DRUM ÎNCHIS" (road closed) on the blanked barrier sign (native cells 105-141 x 113-131)
  const atl = afAtlas('#101010'); if (!atl) return; const saved = ctx; ctx = g;
  const S = 3, cx = 123 * NATIVE_PX, w1 = afW('DRUM') * S, w2 = afW('INCHIS') * S;
  afRun(atl, 'DRUM', Math.round(cx - w1 / 2), 115 * NATIVE_PX, S);
  const x2 = Math.round(cx - w2 / 2); afRun(atl, 'INCHIS', x2, 123 * NATIVE_PX + 4, S);
  g.fillStyle = '#101010'; g.fillRect(x2 - 2, 123 * NATIVE_PX - 2, 3, 3); g.fillRect(x2 + 1, 123 * NATIVE_PX - 5, 3, 3); g.fillRect(x2 + 4, 123 * NATIVE_PX - 2, 3, 3);   // the circumflex on the I
  ctx = saved;
}
function sceneBeat(id) {
  const B = BEATS[id], a = typeof B.a === 'function' ? B.a() : B.a, c = typeof B.cam === 'function' ? B.cam() : B.cam;
  if (B.blackAfter && TT >= B.blackAfter()) {   // the hard silence before the reveal: black
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); SUB_Y = 860; subsNow(); return;
  }
  const t0 = B.from ? B.from() : E0, u = EZ.io(seg(TT, t0, shotEnd()));
  const cam = { z: lerp(c[0], c[1], u), x: lerp(c[2], c[4], u), y: lerp(c[3], c[5], u) };
  let shake = null;
  if (B.shake) { const k = Math.floor(TT * 12); shake = [hsh(k, 3, 1) > 0.85 ? 1 : 0, 0]; }
  if (B.ring) { const k = Math.floor(TT * 12), on = mod(TT - E0, 2.2) < 0.25; shake = on ? [hsh(k, 1, 4) > 0.5 ? 1 : -1, 0] : null; }
  const Ly = LAY[id], base = a.replace('.png', ''), bgA = base + '_bg.png', fgA = base + '_fg.png';
  let layers = [{ a }];
  if (Ly && asset(bgA) && asset(fgA)) {
    const v = EZ.io(seg(TT, E0, shotEnd())), w = (TT - E0);
    const fx = lerp(-Ly.p[0] / 2, Ly.p[0] / 2, v), fy = lerp(-Ly.p[1] / 2, Ly.p[1] / 2, v) + (Ly.sway ? Math.sin(w * 1.3) * Ly.sway : 0) + (Ly.bob ? -Math.abs(Math.sin(w * Math.PI / Ly.bob[1])) * Ly.bob[0] : 0);
    const bx = lerp(-Ly.b[0] / 2, Ly.b[0] / 2, v), by = lerp(-Ly.b[1] / 2, Ly.b[1] / 2, v);
    layers = [{ a: bgA, dx: bx, dy: by, free: true }];
    for (const f of Ly.fog ?? []) layers.push({ draw: (g) => fogBand(g, f[0], f[1], f[2], f[3], f[4]) });
    if (Ly.snow === 'far') layers.push({ draw: snowLayer('far') });
    layers.push({ a: fgA, dx: fx, dy: fy, free: true });
    if (Ly.snow && Ly.snow !== 'far') layers.push({ draw: snowLayer(Ly.snow) });
  } else if (Ly?.fog) for (const f of Ly.fog) layers.push({ draw: (g) => fogBand(g, f[0], f[1], f[2], f[3], f[4]) });
  if (OVER[id]) layers.push({ draw: OVER[id] });
  if (B.latin) layers.push({ draw: latinBand });
  if (B.sign) layers.push({ draw: roadSign });
  flowShot(layers, { cam, shake });
  if (B.subY) SUB_Y = B.subY;
  if (B.tag) chapterTag(B.tag[0], B.tag[1]);
  if (B.clock) chapterTag(TT < VW('silent', 'silent') - 0.1 ? '深夜-02:59 AM' : '午前三時-03:00 AM', 'clock');
  if (B.hours) chapterTag('沈黙-HOURS SILENT ' + String(Math.min(31, 1 + Math.floor((TT - E0) * 2.2))).padStart(2, '0'), 'eye');
  if (B.count) { const n = Math.round(175000 * EZ.o3(seg(TT, VW('war', 'took') - 0.2, VW('war', 'bells') + 0.3))); chapterTag('奪われた鐘-BELLS TAKEN ' + n.toLocaleString('en-US'), 'bell', 1); }
  subsNow();
}

// ---- the chapter tag: the user's own (video AMpBNywoQB0, measured at 1080p): a black icon box with a notched white frame
// (x30 y25, 78x80) and a white 1-bit icon, then a white bar (x112 y17, 700x92) with a 4-px black inner line, a 4-px black
// outline round the whole, "KANJI-TITLE" in the Nosutaru dot font at x4 (x150), and a dithered hill at the bar's
// bottom-right. Slot n stacks a second tag 100 px lower. HUD: no wiggle.
const TAG_ICON = {
  tower: ['.....#.....', '....###....', '...#####...', '...#.#.#...', '...#####...', '...#...#...', '...#.#.#...', '.#########.', '.#.......#.', '.#.##.##.#.', '.#.##.##.#.', '.#########.'],
  book:  ['...........', '.####.####.', '.#..#.#..#.', '.#.##.##.#.', '.#..#.#..#.', '.#.##.##.#.', '.#..#.#..#.', '.#.##.##.#.', '.#..#.#..#.', '.#########.', '.....#.....', '...........'],
  bell:  ['.....#.....', '....###....', '...#####...', '...#####...', '..#######..', '..#######..', '..#######..', '.#########.', '###########', '...........', '.....#.....', '...........'],
  clock: ['...#####...', '..#.....#..', '.#...#...#.', '#....#....#', '#....#....#', '#....###..#', '#.........#', '#.........#', '.#.......#.', '..#.....#..', '...#####...', '...........'],
  eye:   ['...........', '...........', '...#####...', '.##.....##.', '#...###...#', '#..#####..#', '#...###...#', '.##.....##.', '...#####...', '...........', '...........', '...........'],
  flake: ['.....#.....', '..#..#..#..', '...#.#.#...', '....###....', '.#..###..#.', '###########', '.#..###..#.', '....###....', '...#.#.#...', '..#..#..#..', '.....#.....', '...........'],
  moon:  ['....###....', '..##.......', '.#.........', '.#.........', '#..........', '#..........', '#..........', '.#.......#.', '.#......#..', '..##..##...', '....##.....', '...........'],
};
const TAG_HILL = [[726, 71], [726, 84], [739, 84], [788, 84], [720, 90], [733, 90], [745, 90], [782, 90], [714, 96], [726, 96], [739, 96], [752, 96], [764, 96], [788, 96]];
function tfRun(s, x, y, S) {
  const atl = asset('tagfont.png'); if (!atl) return;
  for (const ch of s) { const i = TF_CHARS.indexOf(ch); if (i < 0) { x += 5 * S; continue; } ctx.drawImage(atl, (i % 16) * 12, Math.floor(i / 16) * 12, 12, 12, x - S, y - S, 12 * S, 12 * S); x += TF_ADV[i] * S; }
}
function chapterTag(title, icon = 'tower', slot = 0) {
  hud(() => {
    const dy = slot * 100, g = ctx; g.imageSmoothingEnabled = false;
    g.fillStyle = '#000'; g.fillRect(26, 13 + dy, 790, 100);                          // the outline
    g.fillStyle = '#fdfdfd'; g.fillRect(30, 25 + dy, 78, 80);                          // icon box: notched white frame
    g.fillStyle = '#000'; for (const [cx, cy] of [[30, 25], [104, 25], [30, 101], [104, 101]]) g.fillRect(cx, cy + dy, 4, 4);
    g.fillRect(34, 29 + dy, 70, 72);
    g.fillStyle = '#fdfdfd'; const I = TAG_ICON[icon] ?? TAG_ICON.tower;
    I.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') g.fillRect(47 + k * 4, 41 + r * 4 + dy, 4, 4); }));
    g.fillRect(112, 17 + dy, 700, 92);                                                // the bar
    g.fillStyle = '#000'; g.fillRect(116, 21 + dy, 692, 84);
    g.fillStyle = '#fdfdfd'; g.fillRect(120, 25 + dy, 684, 76);
    tfRun(title, 150, 41 + dy, 4);
    g.fillStyle = '#000'; for (const [hx, hy] of TAG_HILL) g.fillRect(hx, hy + dy, 4, 4);
  });
}
// ---- beat 24, the REVEAL: "it was looking at the village." Hard silence before (beat 23 ends black), then a glitch
// burst on twos: the wide-eyed face inverted / plain / black / the closed face (a flash of before); it settles on the
// open eyes over the village and the procession's torches, and pushes slowly into the eyes.
const TORCH = [[26, 103], [79, 107], [98, 108], [116, 111], [129, 111], [144, 111]];   // flame tips (native cells) in reveal.png (O4 face, village low angle)
function sceneReveal() {
  const k = Math.round((TT - E0) * 12), hold = VW('looking', 'village') + 0.35;
  const v = TT >= hold ? 'open' : ['open', 'inv', 'black', 'open', 'closed', 'inv', 'open', 'black', 'open', 'inv', 'open', 'open'][(k + Math.floor(hsh(k, 5, 9) * 3)) % 12];
  SUB_Y = 860;
  if (v === 'black') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); subsNow(); return; }
  const z = TT >= hold ? lerp(1.04, 1.5, EZ.io(seg(TT, hold, shotEnd() + 2))) : 1.02 + (k % 3) * 0.06;
  const y = TT >= hold ? lerp(540, 330, EZ.io(seg(TT, hold, shotEnd() + 2))) : 540;
  const torches = (g) => { for (const [x, ty] of TORCH) { const h1 = hsh(Math.floor(TT * 10), x, ty); cellAt(g, x, ty - 1, h1 > 0.35 ? '#fdfdfd' : '#8e8e8e'); if (h1 > 0.75) cellAt(g, x, ty - 2, '#8e8e8e'); } };
  const hv = EZ.io(seg(TT, hold, shotEnd() + 2));   // held: the face sinks toward the village while the village rises a little
  const L = v === 'closed' ? [{ a: 'face_closed.png' }] : TT >= hold ? [{ a: 'reveal_bg.png', dx: 0, dy: lerp(-6, 22, hv), free: true }, { a: 'reveal_fg.png', dx: 0, dy: lerp(6, -8, hv), free: true }, { draw: (g) => { g.save(); g.translate(0, Math.round(lerp(6, -8, hv))); torches(g); g.restore(); } }] : [{ a: 'reveal.png' }, { draw: torches }];
  flowShot(L, { cam: { z, x: 960, y }, shake: TT < hold ? [hsh(k, 1, 1) * 2 - 1, 0] : null });
  if (v === 'inv') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  SUB_Y = 70; subsNow();   // top: the procession and its torches fill the bottom of this shot
}
function sceneCard() {   // the closing question in the outro wordmark's font and spacing (assets/card_l*.png), typed on
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (TT > E0 + 0.5) {
    let n = Math.floor((TT - E0 - 0.5) / 0.07) + 1;
    const f = () => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
      CARD_TXT.forEach((L, k) => {
        const img = asset('card_l' + (k + 1) + '.png'); if (!img) return;
        const c = Math.min(L.text.length, Math.max(0, n)); n -= L.text.length; if (!c) return;
        const w = L.ends[c - 1], x = Math.round((W - L.w) / 2 / 6) * 6, y = 400 + k * 150;
        ctx.drawImage(img, 0, 0, w, L.h, x, y, w, L.h);
      });
      ctx.restore();
    };
    DEFER ? DEFER.push(f) : f();
  }
  subsNow();
}
// ---- the Madfable outro: the red forest (assets/outro_bg.png, its own native grid, 4 px a pixel) powers on in four
// steps behind the black trees, with a slow push; "madfable" dissolves in at the top in 10-px cells over a 5-px black
// shadow; the cartridge (assets/outro_card.png, 48 frames at 12 fps, 2-px cells) steps in bottom-right, wobbles, turns
// edge-on and back, then holds. The one place in the piece with colour: egWiggle skips its black-and-white pass here.
const OUTRO = { card: [1660, 740], nameY: 96, cardT: 0.9 };
// the forest's red pushed to a true deep red (the sampled (186, 31, 29) read orange on screen)
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
  const z = lerp(1.02, 1.08, EZ.io(seg(t, 0, shotEnd() - E0)));
  ctx.setTransform(z, 0, 0, z, 960 - 960 * z, 540 - 540 * z); ctx.drawImage(outroRed(bg), 0, 0, bg.width * 4, bg.height * 4);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const on = Math.min(4, Math.floor(t / 0.11));   // power-on: black over the red in four steps
  if (on < 4) { ctx.fillStyle = `rgba(0,0,0,${1 - on / 4})`; ctx.fillRect(0, 0, W, H); }
  const dissolve = (img, x, y, q, cell, tag, shadow) => {   // cells of the image switch on in a seeded order
    const N = egCanvas(tag, img.width, img.height), g = N.getContext('2d'); g.clearRect(0, 0, N.width, N.height); g.drawImage(img, 0, 0);
    if (q < 1) {
      g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#fff'; g.beginPath();
      for (let yy = 0; yy < img.height; yy += cell) for (let xx = 0; xx < img.width; xx += cell) if (hsh(xx, yy, cell) < q) g.rect(xx, yy, cell, cell);
      g.fill(); g.globalCompositeOperation = 'source-over';
    }
    if (shadow) { ctx.save(); ctx.filter = 'brightness(0)'; ctx.drawImage(N, x + shadow, y + shadow); ctx.restore(); }
    ctx.drawImage(N, x, y);
  };
  const qn = seg(t, 0.45, 1.05);
  if (qn > 0) hud(() => dissolve(nm, Math.round((W - nm.width) / 2 / 5) * 5, OUTRO.nameY, qn, 10, 'outro:n', 0));   // name and card: no wiggle
  const tc = t - OUTRO.cardT;
  if (tc > 0) hud(() => {
    const fw = card.width / 8, fh = card.height / 6, k = Math.floor(tc * 12) % 48;   // loops for the whole end screen
    const S = egCanvas('outro:cf', fw, fh), sg = S.getContext('2d'); sg.clearRect(0, 0, fw, fh); sg.drawImage(card, (k % 8) * fw, Math.floor(k / 8) * fh, fw, fh, 0, 0, fw, fh);
    const C = egCanvas('outro:c2', fw * 2, fh * 2), cg = C.getContext('2d'); cg.imageSmoothingEnabled = false; cg.clearRect(0, 0, C.width, C.height); cg.drawImage(S, 0, 0, fw * 2, fh * 2);
    dissolve(C, OUTRO.card[0], OUTRO.card[1], seg(tc, 0, 0.25), 6, 'outro:c', 0);
  });
  ctx.restore();
}



// ---- the wiggle: the same as the HotD (tapestry) and God of War (amphora-bf) videos: the whole finished frame, captions
// included, displaced by fractal turbulence (~2.6 px), re-seeded every 3 frames. Lines tremble in place; nothing travels.
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
      f.appendChild(t); f.appendChild(d); if (j < 4) f.appendChild(m); svg.appendChild(f);   // Premiere-style B&W: desaturate to luma, no threshold or curve
    }
    { // egbw: the black-and-white pass alone (no displacement), for the HUD drawn after the wiggle
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'egbw'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const m = document.createElementNS(NS, 'feColorMatrix'); m.setAttribute('type', 'saturate'); m.setAttribute('values', '0'); m.setAttribute('color-interpolation-filters', 'sRGB');
      const ct = document.createElementNS(NS, 'feComponentTransfer'); ct.setAttribute('color-interpolation-filters', 'sRGB');
      f.appendChild(m); svg.appendChild(f);
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
STYLE.post = () => { egWiggle(1.5); hudFlush(); };   // wiggle: was 2.6, then 1.3; 1.5 is the user's value   // the HotD value: lines tremble; more shears the 1-bit squares

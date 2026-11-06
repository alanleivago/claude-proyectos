// =====================================================================
//  SCENES — learning-faces (16:9), copied from bells (the approved bar). Flow images (assets/) drawn into a low-res grid, then quantized to the onebit ramp
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
    if (L.alpha != null) { if (L.alpha <= 0) return; ctx.globalAlpha = L.alpha; }
    ctx.drawImage(img, x, y, lw, lh); ctx.globalAlpha = 1;
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
const SUB_S = 3;      // the caption letter size (round 9: smaller, placed in the empty parts of each shot)
const SUB_PX = 760;    // max row width in px: compact blocks that fit the empty areas
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
const SUB_TEXT = { holes: "Two holes for eyes. A slit for a mouth. Like a child's | drawing of a person.", turns: 'Then the cameraman | turns the camera | toward himself.' };   // narrow block for the dark left of beat 22
const SUBS = VOICE.lines.flatMap(subChunks);
SUBS.forEach((c, i) => {
  if (SUBS[i + 1]) c.end = Math.min(c.end, SUBS[i + 1].t0 - (SUBS[i + 1].t0 - c.t1 > 1.5 ? 0.5 : 0));
  const cut = SHOT_LIST.map(([t]) => t).find((t) => t > c.t0 + 0.3 && t > c.t1 - 0.3); if (cut != null) c.end = Math.min(c.end, cut);
  c.t1 = Math.min(c.t1, c.end - 0.25);   // a chunk that a cut ends early types a little faster, so it is read whole before the cut   // never over the next shot
});
let SUB_Y = 1300;   // a shot can move the subtitles (the tunnel keeps its workers clear)
// caption placement (round 9, the Urbn way): tools/subplace.mjs renders each chunk's frames without captions, finds the
// emptiest dark flat region big enough for the block (never over a face / the subject, never off frame) and writes
// src/subpos.js: SUBPOS[key] = [cx, top y] by the chunk's start time; hand overrides go in SUBPOS_FIX.
const subKey = (c) => c.t0.toFixed(2);
const SUBPOS_FIX = { '98.63': [700, 945], '101.74': [700, 975],   // hand overrides where the map saw dark clothes/hair as empty
  '10.27': [390, 50], '13.74': [420, 60], '200.42': [420, 36], '202.77': [420, 36], '113.34': [470, 30], '59.39': [270, 800], '77.45': [560, 60], '120.45': [420, 40], '125.37': [470, 60], '152.25': [290, 500], '154.34': [290, 500] };   // beat 14: the emptiness map picked her dark hair; below the desk edge instead
function subsNow() {
  if (typeof window !== 'undefined' && window.NOCAP) return;
  for (const c of SUBS) if (TT >= c.t0 && TT < c.end) {
    const n = c.rows.join('').replace(/ /g, '').length, rate = Math.min(0.07, Math.max(0.025, (c.t1 - c.t0) / n));
    const P = SUBPOS_FIX[subKey(c)] ?? (typeof SUBPOS !== 'undefined' ? SUBPOS[subKey(c)] : null);
    const f = () => afText(c.rows, P ? P[0] : CX, P ? P[1] : SUB_Y, { count: Math.floor((TT - c.t0) / rate) + 1, S: SUB_S, lh: 12, stroke: 7 }); DEFER ? DEFER.push(f) : f();   // captions tremble with the picture (user)
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
//  LEARNING FACES — the look-check shots (round 2: the progression, beats 6, 8, 9, 13, 15, 24). Everything else is a black placeholder until the board.
//  All images are gentle.py passes on the 480x268 grid (4 screen px a cell): fine cells are drawn at 4 px here.
// =====================================================================
const hsh = (a, b, c) => ((((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0) % 1000) / 1000;
const CP = NATIVE_PX / 2;   // one gentle cell = 4 screen px
function sceneTodo() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  SUB_Y = 860; subsNow();
}
// ---- the sub camera's HUD (no wiggle): corner marks, REC square beside "rec", the dive or tape, a running timecode
// and the depth. Text = the aansa atlas with a black ring (as the lost second's CCTV). o = { label, tc0 (s), depth }
function subHud(o) {
  hud(() => {
    const m = 48, L = 64, T = 8, S = 5;
    ctx.fillStyle = '#fdfdfd';
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.fillRect(x, y, sx * L, sy * T); ctx.fillRect(x, y, sx * T, sy * L); }
    const A = afAtlas('#fdfdfd'), K = afAtlas('#000000');
    const run = (str, x, y) => { for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-4, -4], [4, 4], [-4, 4], [4, -4]]) afRun(K, str, x + dx, y + dy, S); afRun(A, str, x, y, S); };
    if (Math.floor(TT * 2) % 2 === 0) { ctx.fillStyle = '#000'; ctx.fillRect(m + 36, m + 58, 36, 36); ctx.fillStyle = '#fdfdfd'; ctx.fillRect(m + 40, m + 62, 28, 28); }
    run('rec', m + 84, m + 40);                                   // the square sits on the x-height of "rec" (rows 4S..12S)
    run(o.label, m + 40, H - m - 40 - 12 * S);
    const t = o.tc0 + (TT - E0), f = Math.floor(t * 24) % 24, sec = Math.floor(t);
    const tc = [Math.floor(sec / 3600), Math.floor(sec / 60) % 60, sec % 60, f].map((v) => String(v).padStart(2, '0')).join(':');
    run(tc, W - m - 40 - afW('00:00:00:00') * S, m + 40);
    const dp = 'depth ' + o.depth.toLocaleString('en-US') + ' m';
    run(dp, W - m - 40 - afW(dp) * S, H - m - 40 - 12 * S);
  });
}
// marine snow in 4-px cells: two depths, drifting down and across as the sub creeps forward; seeded, repeatable.
// front = only the near flakes (drawn over the figure, for depth)
function snowDeep(front) {
  return (g) => {
    for (let i = 0; i < 120; i++) {
      const near = i % 4 === 0; if (front !== near) continue;
      const sp = near ? 26 : 9, x0 = hsh(i, 7, 3) * 520, y0 = hsh(i, 2, 9) * 300;
      const y = mod(y0 + TT * sp * (0.6 + hsh(i, 4, 4) * 0.6), 300) - 16, x = mod(x0 - TT * (near ? 14 : 5) + Math.sin(TT * 0.5 + i) * 2, 520) - 20;
      g.fillStyle = near ? '#fdfdfd' : '#8e8e8e';
      g.fillRect(Math.round(x) * CP, Math.round(y) * CP, CP * (near ? 2 : 1), CP * (near ? 2 : 1));
    }
  };
}
// ---- moving light (user, round 4: "every moment lit by a flashlight, lamp or sub light gets a light that moves"):
// amigara's egSpot on our 4-px cells: cells outside the circle go dark (a checker on the edge band, flat dark beyond),
// drawn as a layer in frame coords. lit(u) returns { x, y, r, f, d } (d = darkness 0..1) for u = s into the shot;
// every move is a sum of slow sines (smooth, deterministic).
function spotLayer(lit) {
  return (g) => {
    const sp = lit(TT - E0), w = W / CP, h = H / CP, c = egCanvas('spot4', w, h), cg = c.getContext('2d'), im = cg.createImageData(w, h), d = im.data;
    const A = Math.round(255 * (sp.d ?? 0.6));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = (Math.hypot((x + 0.5) * CP - sp.x, ((y + 0.5) * CP - sp.y) * (sp.sy ?? 1)) - sp.r) / sp.f, j = (y * w + x) * 4;
      d[j + 3] = k <= 0 ? 0 : k >= 1 ? A : Math.round(A * Math.ceil(k * 4) / 4);   // round 6: a soft stepped falloff (4 flat steps), no checker band
    }
    cg.putImageData(im, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, W, H);
  };
}
const sway = (u, a, sp, ph = 0) => Math.sin(u * sp + ph) * a + Math.sin(u * sp * 0.43 + ph * 2) * a * 0.4;
const LIGHT = {
  beam: (cx, cy, r) => (u) => ({ x: cx + sway(u, 170, 0.5), y: cy + sway(u, 50, 0.37, 1), r, f: 160, d: 0.62 }),          // sub lamps sweeping
  hand: (cx, cy, r) => (u) => ({ x: cx + sway(u, 40, 1.7) + sway(u, 14, 4.1, 2), y: cy + sway(u, 30, 1.3, 1), r, f: 140, d: 0.5 }),   // a hand-held camera light
  lamp: (cx, cy, r) => (u) => ({ x: cx + sway(u, 55, 0.8), y: cy + sway(u, 12, 0.8, 1.6), r, f: 200, d: 0.45 }),          // a hanging lamp swaying
  flame: (cx, cy, r) => (u) => ({ x: cx + sway(u, 6, 3.1), y: cy, r: r + sway(u, 30, 5.3) + sway(u, 14, 11.7, 1), f: 220, d: 0.5 }),   // a lantern flickering
};
// ---- the dives, through the sub camera: one Flow image per stage of the thing (it is NOT human at first and only
// takes human form dive by dive). Every stage holds perfectly still: the motion is the marine snow at two depths,
// the lamp dipping now and then, and one slow push (z0 -> z1 toward a frame point; dx slides the plate).
const DIVES = {
  still:  { light: LIGHT.beam(1150, 520, 560), a: 'd1_mass.png', label: 'dive 01', tc0: 1 * 3600 + 52 * 60 + 40, depth: 10902, cam: [1.04, 1.28, 960, 540, 1180, 420] },     // a formless membrane
  holes:  { light: LIGHT.beam(1000, 420, 600), a: 'd2_imprint.png', label: 'dive 02', tc0: 2 * 3600 + 14 * 60 + 7, depth: 10916, cam: [1.04, 1.4, 960, 560, 1010, 400] },   // a face pressed into it
  three:  { light: LIGHT.beam(960, 380, 620), a: 'd4_draft.png', label: 'dive 04', tc0: 2 * 3600 + 31 * 60 + 12, depth: 10911, cam: [1.04, 1.45, 960, 600, 960, 260] },   // a drafted torso and face
  smiled: { light: LIGHT.beam(960, 360, 620), a: 'd5_smile.png', label: 'dive 05', tc0: 2 * 3600 + 48 * 60 + 55, depth: 10913, cam: [1.04, 1.5, 960, 600, 960, 330] },     // nearly a person, smiling
};
function sceneDeep(id) {
  const B = DIVES[id], c = B.cam, u = EZ.io(seg(TT, E0, shotEnd() + 1));
  const cam = { z: lerp(c[0], c[1], u), x: lerp(c[2], c[4], u), y: lerp(c[3], c[5], u) };
  // the lamp sags now and then: a smooth dim over ~0.8 s (round 6: the 2-frame dips read as flicker)
  const dip = (g) => { const c = Math.floor(TT / 3.1), u = mod(TT, 3.1); if (hsh(c, 3, 3) > 0.45 && u < 0.8) { g.fillStyle = `rgba(0,0,0,${(0.32 * Math.sin(Math.PI * u / 0.8)).toFixed(3)})`; g.fillRect(0, 0, W, H); } };
  flowShot([{ a: B.a }, { draw: spotLayer(B.light) }, { draw: snowDeep(false) }, { draw: snowDeep(true) }, { draw: dip }], { cam });
  subHud({ label: B.label, tc0: B.tc0, depth: B.depth });
  SUB_Y = 860; subsNow();   // above the HUD's bottom labels (a long caption touched 'depth')
}
// ---- beat 9: "every time the pilot moved, it moved the same way." Dive 3, the cockpit. Three layers: the cockpit (bg),
// the thing behind the glass (the dive-2 membrane with its pressed-in face, and a stalk ending in a crude copy of his
// raised hand, composited by tools/mirror.py) and the pilot (fg). The pilot leans in to the glass on "moved"; the thing
// makes the same move, mirrored, exactly one second later (and so does his breathing). He holds his breath, then gasps
// on "same".
const LAG = 1.0;
function scenePilot() {
  const tm = VW('moved', 'moved'), ts = VW('moved', 'same');
  const lean = (t) => 18 * EZ.io(seg(t, tm, tm + 1.6)) + Math.sin((t - E0) * 1.1) * 3;    // px toward the glass
  const rise = (t) => Math.round(Math.sin((t - E0) * 0.9) * 3);                          // breathing
  const u = EZ.io(seg(TT, E0, shotEnd() + 0.5));
  const cam = { z: lerp(1.04, 1.32, u), x: lerp(940, 1060, u), y: lerp(560, 420, u) };
  const pa = TT < ts - 0.05 ? 'f09_pilot_b_fg.png' : 'f09_pilot_fg.png';
  flowShot([{ a: 'f09_pilot_bg.png', dx: Math.round(lerp(10, -10, u)), dy: 0, free: true },
    { a: 'd3_out_fg.png', dx: -Math.round(lean(TT - LAG)), dy: rise(TT - LAG), free: true },
    { a: pa, dx: Math.round(lean(TT)) - 8, dy: rise(TT), free: true }], { cam });
  chapterTag('ダイブ-DIVE 03', 'eye');
  SUB_Y = 960; subsNow();
}
// ---- beat 24, the REVEAL: "it wasn't his face." Hard silence before (beat 23 ends black), a short glitch burst on twos
// (his face, inverted, black, a flash of the dive-2 pressed-in face), then QUIET: the cameraman's face, calm, a small
// fixed closed smile, skin waxy and poreless, a faint fold of the thing's pale flesh at the hairline and neck
// (tools/reveal.py). It is almost perfect. Then the eyes slowly sink toward the two-hole look of dive 2 (black holes
// growing out of the irises, a dark-grey rim), and the right half of the face follows the head's small drift one second
// late (the thing is always a second late): a seam opens and closes down the middle, no more.
const SEAM = 240, SL = [40, 268], EYES = [[211, 116], [269, 116]];
function sceneReveal() {
  // round 10: no inverted frames. Black for 0.2 s (the hit), then the face comes in under a VHS tape-tracking glitch on
  // the WHOLE composited frame (vhsPost, after the HUD: band slices shift sideways, a static line, a rolling sync bar) for
  // 6 frames, then the still, normal reveal. Nothing shifts on its own, so face, outline and HUD can't misalign.
  const u0 = TT - E0, hold = E0 + 0.45;
  SUB_Y = 1000;
  const tape = () => subHud({ label: 'tape 06', tc0: 40 * 60 + 51, depth: 10914 });
  if (u0 < 0.2) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); tape(); subsNow(); return; }
  if (TT < hold) VHS = 1 - seg(TT, E0 + 0.2, hold) * 0.6;
  const hv = EZ.io(seg(TT, hold, shotEnd() + 2));
  const z = lerp(1.04, 1.38, hv), y = lerp(520, 430, hv);
  const drift = (t) => Math.round(Math.sin((t - E0) * 0.8) * 5 + Math.sin((t - E0) * 0.37) * 3);
  // the eyes: 0 = his, 1 = two black holes. A slow creep for 3.4 s (only the pupils widen), then the final drop in 0.7 s
  const sink = 0.28 * EZ.io(seg(TT, hold + 0.9, hold + 4.3)) + 0.72 * EZ.i3(seg(TT, hold + 4.3, hold + 5.0));
  const face = (g) => {
    const img = asset('f24_q_fg.png'); if (!img) return;
    const dl = drift(TT), dr = drift(TT - LAG), y0 = 4;
    const part = (sx, sy, sw, sh, dx) => g.drawImage(img, sx, sy, sw, sh, sx * CP + dx, y0 + sy * CP, sw * CP, sh * CP);
    // round 9: the whole cut-out (face + its outline) is drawn as ONE layer; the 1-s lag only moves the right half's
    // INTERIOR (f24_q_in.png: the face 4+ cells in from the outline, right of the seam), so the outline never splits
    part(0, 0, 480, 268, dl);
    const inn = asset('f24_q_in.png'); if (inn) g.drawImage(inn, 0, 0, 480, 268, dr, y0, 480 * CP, 268 * CP);
    if (sink > 0) EYES.forEach(([ex, ey], i) => {   // a hole grows out of each iris: round, black, a dark-grey rim
      const dx = i ? dr : dl, rx = lerp(2, 8, sink), ry = lerp(1.5, 7, sink);
      for (let yy = -9; yy <= 9; yy++) for (let xx = -10; xx <= 10; xx++) {
        const d = (xx * xx) / (rx * rx) + (yy * yy) / (ry * ry);
        if (d <= 1.45 && d > 1) { g.fillStyle = '#383838'; g.fillRect((ex + xx) * CP + dx, y0 + (ey + yy) * CP, CP, CP); }
        if (d <= 1) { g.fillStyle = '#000'; g.fillRect((ex + xx) * CP + dx, y0 + (ey + yy) * CP, CP, CP); }
      }
    });
  };
  const L = [{ a: 'f24_q_bg.png', dx: Math.round(lerp(-6, 6, hv)), dy: 0, free: true }, { draw: face }, { draw: spotLayer(LIGHT.hand(960, 480, 560)) }];   // the camera light wobbles in his hand
  flowShot(L, { cam: { z, x: 960, y } });
  SUB_Y = 1000; tape(); subsNow();
}

// =====================================================================
//  THE BOARD: one shot per beat. Stage beats (6, 8, 13, 15) = sceneDeep, 9 = scenePilot, 21 = sceneDark, 24 = sceneReveal;
//  every other beat is one Flow image (assets/b*.png, gentle grid) with ONE eased camera move (no yo-yo):
//  cam = [z0, z1, x0, y0, x1, y1] in frame px over the shot. sub: true adds marine snow; hud: the sub camera overlay;
//  tag: the WoH chapter tag; blackAfter: the hard silence before the reveal.
//  LAYER PLAN (animation step, not drawn in the board): fg/bg cut-outs + 1-cell outline (masks.py/outline.py) for
//  b03 (the man vs the sailors), b04 (crew vs the hanging sub), b07 (two heads vs the monitor), b11 (two men vs desk),
//  b14 (biologist vs desk), b16 (three crew vs table), b18 (pilot vs cabin), b19 (cameraman vs sub), b23 (face vs cabin),
//  b27 (old man vs window); sky/water splits for b01, b05 (sub vs seabed); b28/b29 one layer (stillness) + snow.
// =====================================================================
const BOARD_SHOTS = {
  '1960':  { light: (u) => ({ ...LIGHT.lamp(963, 820, 760)(u), d: 0.4 }), a: 'b01_trieste.png', cam: [1.04, 1.18, 960, 520, 960, 470], sub: true, tag: ['海溝-CHALLENGER DEEP 1960', 'eye'] },
  saw:     { a: 'b02_porthole.png', cam: [1.04, 1.35, 1100, 480, 1020, 420] },
  camera:  { a: 'b03_deck.png', cam: [1.04, 1.22, 700, 600, 560, 540] },
  back:    { a: 'b04_ship.png', cam: [1.2, 1.04, 960, 360, 960, 540], tag: ['六十年後-60 YEARS LATER', 'clock'] },
  first:   { beam: true, a: 'b05_lights.png', cam: [1.04, 1.4, 900, 600, 1050, 330], sub: true, tag: ['ダイブ-DIVE 01', 'eye'] },
  second:  { swap: () => VW('second', 'face') - 0.1, a: 'b07_monitorc.png', cam: [1.04, 1.32, 960, 500, 960, 300], tag: ['ダイブ-DIVE 02', 'eye'] },
  late:    { a: 'b10_glassc.png', cam: [1.04, 1.25, 960, 540, 1080, 520] },
  strange: { light: LIGHT.lamp(640, 520, 560), a: 'b11_review.png', cam: [1.04, 1.3, 900, 560, 1100, 500] },
  better:  { light: LIGHT.lamp(1250, 470, 900), a: 'b12_stillsc.png', cam: [1.15, 1.2, 420, 540, 1300, 520] },   // a slow pan along the prints, left to right
  species: { swaps: () => [[VW('species', 'known') - 0.1, '_c'], [VW('species', 'name') - 0.1, '_b']], light: LIGHT.lamp(520, 560, 640), a: 'b14_biologist.png', cam: [1.04, 1.3, 960, 540, 1000, 420] },
  general: { swap: () => VW('general', 'general') + 0.5, light: LIGHT.lamp(960, 760, 700), a: 'b16_ids.png', cam: [1.04, 1.32, 960, 400, 960, 580], subY: 130 },   // the photos fill the bottom
  theirs:  { a: 'b17_match.png', cam: [1.04, 1.35, 900, 400, 1300, 380] },   // drifts from his ID photo to its copy
  refused: { light: LIGHT.flame(220, 640, 760), a: 'b18_refused.png', cam: [1.04, 1.4, 900, 500, 960, 400] },
  alone:   { a: 'b19_alone.png', cam: [1.3, 1.04, 760, 400, 960, 540] },
  tape:    { a: 'b20_tape.png', cam: [1.04, 1.3, 960, 500, 800, 420], tag: ['記録-TAPE 06 41:07', 'book'] },
  turns:   { light: LIGHT.hand(1000, 520, 640), a: 'b22_turn_candidate.png', cam: [1.04, 1.3, 900, 560, 860, 420] },
  smiling: { swap: () => VL('smiling').t1 + 0.4, light: LIGHT.hand(960, 440, 620), a: 'b23_smilingc.png', cam: [1.04, 1.4, 900, 500, 960, 340], hud: { label: 'tape 06', tc0: 40 * 60 + 20, depth: 10914 }, blackAfter: () => VL('smiling').t1 + 0.9 },
  empty:   { a: 'b25_empty.png', cam: [1.04, 1.3, 600, 600, 500, 640] },
  shut:    { a: 'b26_shut.png', cam: [1.04, 1.35, 1000, 600, 1100, 640], tag: ['機密-CLASSIFIED', 'book'] },
  piccard: { swap: () => VW('piccard', 'died') - 0.1, a: 'b27_piccard.png', cam: [1.04, 1.3, 960, 500, 1000, 360] },
  three_faces: { a: 'b28_threec.png', cam: [1.04, 1.28, 960, 420, 960, 380], sub: true },
  next:    { a: 'b29_next.png', cam: [1.02, 1.5, 960, 420, 960, 330], sub: true },
};
// ---- beat 5: the sub's two lamp beams, drawn in code (round 7: Flow's beam was a blocky gradient polygon). Per 4-px cell,
// each lamp gives a light level that falls off with distance and toward the cone's edge; the edge is uneven (a slow
// wobble along the length, so it follows the cone, never blocky); quantized to 4 flat steps (white near the lamp only).
// The beams sweep slowly (one eased sway); marine snow shows only inside them.
const LAMPS = [[837, 639, 0.05], [691, 695, 0.12]];   // frame px, base angle (rad, + = down)
function subBeams(g) {
  const u = TT - E0, sw = Math.sin(u * 0.45) * 0.09 + Math.sin(u * 0.19 + 1) * 0.04, w = W / CP, h = H / CP;
  const c = egCanvas('beam', w, h), cg = c.getContext('2d'), im = cg.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let I = 0; const fx = (x + 0.5) * CP, fy = (y + 0.5) * CP;
    for (const [lx, ly, a0] of LAMPS) {
      const dx = fx - lx, dy = fy - ly, r = Math.hypot(dx, dy); if (dx < 8 || r < 6) continue;
      const ang = Math.atan2(dy, dx) - a0 - sw, half = 0.26 + 0.012 * Math.sin(r * 0.006 + lx) + 0.006 * Math.sin(r * 0.017 + 2);
      const e = 1 - Math.abs(ang) / half; if (e <= 0) continue;
      I = Math.max(I, Math.pow(e, 0.8) * Math.pow(Math.max(0, 1 - r / 1300), 1.15));
    }
    const j = (y * w + x) * 4, v = I > 0.78 ? 255 : I > 0.6 ? 214 : I > 0.44 ? 168 : I > 0.3 ? 128 : I > 0.17 ? 87 : I > 0.08 ? 46 : -1;   // the 7 tones
    let col = v;
    if (I > 0.08) { const k = hsh(x + Math.floor(u * 6 + y * 0.3), y - Math.floor(u * 9), 5); if (k > 0.993) col = 255; }   // snow caught in the light
    if (col >= 0) { d[j] = d[j + 1] = d[j + 2] = col; d[j + 3] = 255; }
  }
  cg.putImageData(im, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, W, H);
}
const LAYB = {   // per-shot parallax overrides (default: fg -22 px, bg +18 px, 2 px breathing)
  saw: { p: [-16, 4], b: [26, 0] }, camera: { p: [-20, 0], b: [24, 0] }, back: { p: [0, -14], b: [0, 18], sway: 1, shift: [4.2, 8] },   // the crew shift their weight once mid-hold
  second: { p: [-20, 0], b: [10, -6] }, general: { p: [0, -16], b: [0, 10] }, refused: { p: [-10, 0], b: [14, 0], sway: 1 },
  alone: { p: [10, 24], b: [-12, 0], sway: 0 }, turns: { p: [-14, 0], b: [20, 0], sway: 1 }, smiling: { p: [-10, -6], b: [18, 6], sway: 1 },
  piccard: { p: [-16, 0], b: [24, 0], sway: 1 },
};
// round 11: bold-framing ALTERNATES for the board (index_alt.html sets USE_ALT): overhead table (16), overhead descent (5),
// worm's-eye cameraman (19), Dutch angle on the tape (23)
// round 14 (approved board r13): the bold framings are in the cut.
//  5  first:   opens on the overhead descent (slow marine snow), cuts to the side view of the sub on "lights"
//  16 general: opens on the overhead table, cuts to the crew (their faces act) on "copying"
//  19 alone:   the worm's-eye cameraman replaces the original
//  23 smiling: the Dutch-angle tape replaces the original (then black, the hard silence)
const PRE = {
  first:   { a: 'alt05_overhead.png', cam: [1.22, 1.06, 960, 400, 960, 520], beam: false, sub: true, light: null, until: () => VW('first', 'pale') - 0.1 },
  general: { a: 'alt16_overhead.png', cam: [1.04, 1.16, 960, 560, 960, 500], swaps: null, swap: null, light: (u) => ({ ...LIGHT.lamp(960, 520, 640)(u), d: 0.35 }), until: () => VW('general', 'faces') - 0.1 },
};
Object.assign(BOARD_SHOTS.alone, { a: 'alt19_lowangle.png', cam: [1.04, 1.22, 760, 600, 760, 460], light: (u) => ({ ...LIGHT.lamp(760, 420, 560)(u), d: 0.3 }) });
Object.assign(BOARD_SHOTS.smiling, { a: 'alt23_dutch.png', cam: [1.04, 1.24, 960, 500, 960, 470], swap: null });
function sceneBoard(id) {
  let B = BOARD_SHOTS[id], t0 = E0, t1 = shotEnd() + 0.5;
  if (PRE[id]) { const tc = PRE[id].until(); if (TT < tc) { B = { ...B, ...PRE[id] }; t1 = tc; } else t0 = tc; }   // the mid-beat cut
  const c = B.cam;
  if (B.blackAfter && TT >= B.blackAfter()) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); SUB_Y = 960; subsNow(); return; }
  const u = EZ.io(seg(TT, t0, t1));
  const cam = { z: lerp(c[0], c[1], u), x: lerp(c[2], c[4], u), y: lerp(c[3], c[5], u) };
  // layers (tools/cutm.py + outline.py): bg and fg travel opposite ways (frame px over the shot, eased with the camera,
  // whole px), the fg breathes; one smooth move each, no reversal
  const base = B.a.replace('.png', ''), Ly = { p: [-22, 0], b: [18, 0], sway: 2, ...(LAYB[id] ?? {}) };
  let L = [{ a: B.a }];
  if (asset(base + '_bg.png') && asset(base + '_fg.png')) {
    const w = TT - E0;
    L = [{ a: base + '_bg.png', dx: Math.round(lerp(-Ly.b[0] / 2, Ly.b[0] / 2, u)), dy: Math.round(lerp(-Ly.b[1] / 2, Ly.b[1] / 2, u)), free: true },
         { a: base + '_fg.png', dx: Math.round(lerp(-Ly.p[0] / 2, Ly.p[0] / 2, u) + (Ly.shift ? Ly.shift[1] * EZ.io(seg(w, Ly.shift[0], Ly.shift[0] + 0.6)) : 0)), dy: Math.round(lerp(-Ly.p[1] / 2, Ly.p[1] / 2, u) + Math.sin(w * 1.1) * Ly.sway), free: true }];
    // round 11: the face acts: crossfade (4 frames) to each expression variant in turn
    const sw = B.swaps ? B.swaps() : B.swap ? [[B.swap(), '_b']] : [];
    for (const [t, sfx] of sw) if (asset(base + sfx + '_fg.png')) L.push({ ...L[1], a: base + sfx + '_fg.png', alpha: seg(TT, t, t + 4 / 24) });
  }
  if (B.light) L.push({ draw: spotLayer(B.light) });
  if (B.beam) L.push({ draw: subBeams });
  if (B.sub && !B.beam) L.push({ draw: snowDeep(false) }, { draw: snowDeep(true) });
  flowShot(L, { cam });
  if (B.tag) chapterTag(B.tag[0], B.tag[1]);
  if (B.hud) subHud(B.hud);
  SUB_Y = B.subY ?? 960; subsNow();
}
// ---- beat 21: "for forty minutes, there's only dark water." The tape itself: nothing but black water and marine snow
// through the sub camera, the timecode racing from 00:00 to 00:40 (sped up) while the depth holds.
function sceneDark() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  flowShot([{ draw: (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); } }, { draw: snowDeep(false) }, { draw: snowDeep(true) }, { draw: spotLayer((u) => ({ ...LIGHT.beam(960, 540, 420)(u), d: 0.85 })) }], { cam: { z: 1.02, x: 960, y: 540 } });   // only the flakes in the swaying beam show
  const k = seg(TT, E0, shotEnd()), tc = 40 * 60 * EZ.i2(k);
  subHud({ label: 'tape 06', tc0: tc - (TT - E0), depth: 10914 });
  SUB_Y = 960; subsNow();
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
// the VHS tape-tracking glitch over the finished frame (picture + captions + HUD together); VHS = strength this frame
let VHS = 0;
function vhsPost() {
  if (!VHS || typeof document === 'undefined') return;
  const a = VHS; VHS = 0; const C = egCanvas('vhs', W, H), g = C.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  let y = 0, i = 0;
  while (y < H) {   // band slices: some shifted sideways (seeded by the frame), most left in place
    const h = 24 + Math.floor(hsh(F, i, 3) * 140), sh = hsh(F, i, 7) < 0.45 ? Math.round((hsh(F, i, 11) * 2 - 1) * 110 * a) : 0;
    if (sh) { ctx.fillStyle = '#000'; ctx.fillRect(0, y, W, h); ctx.drawImage(C, 0, y, W, h, sh, y, W, h); }
    y += h; i++;
  }
  const sy = Math.floor(hsh(F, 99, 1) * (H - 20));   // one line of static
  for (let x = 0; x < W; x += 8) { const v = Math.floor(hsh(F, x, 5) * 3); ctx.fillStyle = ['#000', '#555', '#bbb'][v]; ctx.fillRect(x, sy, 8, 8 + Math.floor(hsh(F, x, 9) * 8)); }
  const by = Math.floor(((F % 6) / 6) * (H + 120)) - 60;   // the rolling sync bar
  ctx.fillStyle = `rgba(0,0,0,${(0.55 * a).toFixed(2)})`; ctx.fillRect(0, by, W, 56); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, by - 4, W, 4);
  ctx.restore();
}
STYLE.post = () => { egWiggle(1.5); hudFlush(); vhsPost(); };   // wiggle: was 2.6, then 1.3; 1.5 is the user's value   // the HotD value: lines tremble; more shears the 1-bit squares

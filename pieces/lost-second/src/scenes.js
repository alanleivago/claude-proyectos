// =====================================================================
//  SCENES — the lost second (16:9). Was: the elevator game. Flow images (assets/) drawn into a low-res grid, then quantized to the onebit ramp
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
const SUB_TEXT_AMIGARA = { open: 'After the earthquake, | a fault opened | on Amigara Mountain.', holes: 'The rock was full of holes. | Hundreds of them. | Shaped like people.', anymore: 'The holes there | weren\'t shaped like | people anymore.', made: '"this hole was made for me," a man said.', light: 'No light could reach | the end of it.', months: 'Months later, they dug | into the other side | of the mountain.' };   // ' | ' forces a row break
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
const SUB_TEXT = { hook: 'At 3:14 and 7 seconds, | every clock on Earth | skipped the same second.', exact: 'Exactly one second was gone. | Not lost, removed.', monk: 'A monk in 1582 wrote | that an hour went missing, | and a man stood in every doorway.' };
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
// clock.png sits at y + 1 cell (flowShot rounds the 4-px margin up); its face: centre (143, 37.5), radius 17.5 cells
const LAYER_Y = 1;
function clockHands(g, sec) {
  const cx = 143, cy = 37 + LAYER_Y;
  cellDisk(g, cx, cy, 16, '#fdfdfd');
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; cellAt(g, cx + Math.sin(a) * 15, cy - Math.cos(a) * 15, '#000'); }   // ticks at the rim, clear of the hands
  const hand = (frac, len, w) => cellLine(g, cx, cy, cx + Math.sin(frac * TAU) * len, cy - Math.cos(frac * TAU) * len, '#000', w);
  hand((3 + 14 / 60) / 12, 7, 3); hand((14 + sec / 60) / 60, 11, 2); hand(sec / 60, 12, 2);
  cellAt(g, cx, cy, '#000');
}
// the hook: the tower clock ticks 3:14:04, 05, 06... and jumps from 06 to 08 on "skipped"
function sceneClock() {
  const skip = VW('hook', 'skipped');
  const sec = TT < skip ? Math.max(0, 6 - Math.floor(skip - TT)) : 8 + Math.floor(TT - skip);
  const z = TT < skip ? lerp(1.0, 1.5, EZ.io(seg(TT, 0, skip))) : lerp(1.5, 1.2, EZ.o3(seg(TT, skip, shotEnd())));
  flowShot([{ a: 'clock.png' }, { draw: (g) => clockHands(g, sec) }], { cam: { z, x: 1144, y: 300 } });
  wohTag('03:14:' + String(sec).padStart(2, '0'), { x: 60, y: 60 }); subsNow();
}
// the lab: the atomic-clock display overwritten in code, the scientist in front, her expression on the word "removed"
function labClock(g) {
  g.fillStyle = '#000'; g.fillRect(153 * NATIVE_PX, (26 + LAYER_Y) * NATIVE_PX, 65 * NATIVE_PX, 17 * NATIVE_PX);
  const blink = Math.floor(TT * 2) % 2 === 0, txt = blink ? '03:14:06' : '03:14:08';
  const saved = ctx; ctx = g; afRun(afAtlas('#fdfdfd'), txt, 158 * NATIVE_PX, (28 + LAYER_Y) * NATIVE_PX, 6); ctx = saved;
}
function sceneLab() {
  const f = face([[E0, 'sci_base.png'], [VW('labs', 'paris'), 'sci_side.png'], [VW('labs', 'confirmed'), 'sci_base.png']], { blink: { 'sci_base.png': 'sci_blink.png' }, seed: 0.4 });
  flowShot([{ a: 'lab.png', mode: 'flat' }, { draw: labClock }, { a: f.a, dx: f.dx - 160, dy: f.dy + 8, rim: true }], { cam: pushIn(E0, shotEnd(), 1.02, 1.1, 760, 420) });
  subsNow();
}
// the cameras: CCTV on the platform; the 24 frames of the missing second step by, the man a size closer every 8 frames
function cctv(label, frame, m = 48) {
  const f = () => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fdfdfd';
    const L = 64, T = 8;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.fillRect(x, y, sx * L, sy * T); ctx.fillRect(x, y, sx * T, sy * L); }
    const A = afAtlas('#fdfdfd'), K = afAtlas('#000000');
    const run = (str, x, y) => { for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-4, -4], [4, 4], [-4, 4], [4, -4]]) afRun(K, str, x + dx, y + dy, 5); afRun(A, str, x, y, 5); };
    run(label, m + 40, m + 40);
    run('03:14:07.' + String(frame).padStart(2, '0'), W - m - 40 - afW('03:14:07.00') * 5, m + 40);
    if (Math.floor(TT * 2) % 2 === 0) { ctx.fillStyle = '#000'; ctx.fillRect(m + 36, m + 134, 36, 36); ctx.fillStyle = '#fdfdfd'; ctx.fillRect(m + 40, m + 138, 28, 28); run('rec', m + 84, m + 116); }   // the square is centred on the x-height of 'rec' (glyph rows 4S..12S)
    run('frame ' + frame + '/24', W - m - 40 - afW('frame 00/24') * 5, m + 116);
    ctx.restore();
  };
  hud(f);
}
// grow = false: the man stands (frames tick 0.4 s apart); grow = true: all 24 frames step through the shot and he comes
// a size closer every 8 frames (d3 -> d2 -> back), the camera pushing in with him
function sceneCam(grow = false) {
  const per = grow ? (shotEnd() - E0 - 0.2) / 24 : 0.4, fr = 1 + Math.min(23, Math.floor((TT - E0) / per)), k = grow ? (fr < 9 ? 0 : fr < 17 ? 1 : 2) : 0;
  const fig = ['figure_d3.png', 'figure_d2.png', 'figure_back.png'][k], [dx, dy] = [[390, 160], [330, 228], [250, 300]][k];
  const cam = grow ? pushIn(E0, shotEnd(), 1.01, 1.12, 1300, 600) : pushIn(E0, shotEnd(), 1.01, 1.06, 960, 540);
  flowShot([{ a: 'subway.png' }, { a: fig, dx, dy }], { cam });
  cctv('cam 04  tokyo', fr); subsNow();
}
// "places": the same man in another camera. Each place = its CCTV plate, the man standing in its empty centre
const PLACE = {
  tokyo: { a: 'subway.png', label: 'cam 04  tokyo', fig: 'figure_d3.png', dx: 390, dy: 160, cam: [1.42, 1.55, 1100, 800] },
  lagos: { a: 'cam_lagos.png', label: 'cam 17  lagos', fig: 'figure_d3.png', dx: 0, dy: -32, cam: [1.04, 1.16, 960, 470] },
  iowa: { a: 'cam_iowa.png', label: 'cam 02  iowa', fig: 'figure_d3.png', dx: 40, dy: 24, cam: [1.18, 1.06, 1000, 600] },
  lima: { a: 'cam_lima.png', label: 'cam 31  lima', fig: 'figure_d3.png', dx: 80, dy: 56, cam: [1.01, 1.22, 1040, 640] },
};
function scenePlace(key) {
  const p = PLACE[key], fr = 1 + Math.floor((TT - E0) / 0.4) % 24;
  flowShot([{ a: p.a }, { a: p.fig, dx: p.dx, dy: p.dy }], { cam: pushIn(E0, shotEnd(), ...p.cam) });
  cctv(p.label, fr); subsNow();
}
// a frame-stable hash in 0..1 (no Math.random: every render is the same)
const hsh = (a, b, c) => ((((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0) % 1000) / 1000;
// a city tag in the corner, the World of Horror way
const tagAt = (s) => wohTag(s, { x: 60, y: 60 });

// ---- 2: phones, stations, watches: the city from above, a slow tilt down onto the tower; then the tower face close
function sceneCity() {
  const u = EZ.io(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'city_aerial.png' }], { cam: { z: lerp(1.5, 1.3, u), x: 960, y: lerp(120, 700, u) } });
  tagAt('03:14:08'); subsNow();
}
// a wristwatch close (watch.png: Flow dial with hour marks and no hands; dial centre (159, 55) cells, radius ~24).
// The hands in code: at 3:14 the hour and minute hands sit 13 degrees apart, so they read by shape: a short fat hour
// wedge, a long tapering minute hand, and a thin second hand with a tail and a round counterweight (filled cell by cell). The second hand jumps once a second and overshoots a fifth of a tick on the jump frame.
function watchHands(g, s) {
  const cx = 159, cy = 55 + LAYER_Y;
  // a tapered hand filled cell by cell: inside when along the hand (-tail..len) and within half its width there
  const fill = (frac, len, w0, w1, tail, c, grow) => {
    const ux = Math.sin(frac * TAU), uy = -Math.cos(frac * TAU), R = len + tail + 3;
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const t = x * ux + y * uy, d = Math.abs(-x * uy + y * ux), k = Math.max(0, t) / len;
      if (t >= -tail - grow && t <= len + grow && d <= (w0 + (w1 - w0) * k) / 2 + grow) cellAt(g, cx + x, cy + y, c);
    }
  };
  const hand = (frac, len, w0, w1, tail = 0) => fill(frac, len, w0, w1, tail, '#000', 0);
  hand((3 + 14 / 60) / 12, 11, 6, 3.6); hand((14 + s / 60) / 60, 23, 2, 1);
  const a = s / 60 * TAU; hand(s / 60, 24, 1.1, 1.1, 8);
  cellDisk(g, cx - Math.sin(a) * 7, cy + Math.cos(a) * 7, 1, '#000'); cellDisk(g, cx, cy, 1, '#000'); cellAt(g, cx, cy, '#fdfdfd');
}
function sceneWatch() {
  const t = TT - E0, sec = 8 + Math.floor(t), jump = t - Math.floor(t) < 1 / 24 + 1e-6 && t >= 1;
  flowShot([{ a: 'watch.png' }, { draw: (g) => watchHands(g, sec + (jump ? 0.25 : 0)) }], { cam: pushIn(E0, shotEnd(), 1.42, 1.66, 1276, 452) });
  subsNow();
}
// ---- 3: the lab. Wide first (she glances aside on "Paris"), then a close-up for "removed" (shock); she blinks
const SCI_BLINK = { 'sci_base.png': 'sci_blink.png', 'sci_side.png': 'sci_blink.png' };
function sceneLabClose() {
  const f = face([[E0, 'sci_base.png'], [VW('exact', 'not'), 'sci_side.png'], [VW('exact', 'removed') - 0.05, 'sci_shock.png']], { blink: SCI_BLINK, seed: 1.3, every: 2.2 });
  const z = TT < VW('exact', 'removed') - 0.05 ? lerp(1.55, 1.7, EZ.io(seg(TT, E0, VW('exact', 'removed')))) : lerp(1.85, 1.95, EZ.o3(seg(TT, VW('exact', 'removed'), shotEnd())));
  flowShot([{ a: 'lab.png' }, { draw: labClock }, { a: f.a, dx: f.dx - 160, dy: f.dy + 8 }], { cam: { z, x: 800, y: 330 } });
  subsNow();
}
// ---- 4: the monitor wall. The 9 blank screens of monitors_ots.png filled in code on the native grid: each screen is
// flood-filled from a seed over its grey cells (her head and shoulder stay in front), then painted every motion step:
// static, or a 1:1 crop of another camera (no resampling), with a bright scan row rolling down and a rec dot.
const MON = [
  { r: [76, 12, 118, 42], s: [97, 27] }, { r: [124, 7, 173, 41], s: [150, 25] }, { r: [181, 4, 234, 35], s: [207, 20] },
  { r: [78, 46, 118, 77], s: [100, 62] }, { r: [125, 44, 173, 78], s: [150, 62] }, { r: [180, 42, 234, 76], s: [207, 60] },
  { r: [78, 82, 118, 112], s: [110, 96] }, { r: [125, 82, 174, 118], s: [150, 100] }, { r: [180, 83, 234, 120], s: [207, 100] },
];
const MON_FEED = [null, ['cam_lagos.png', 92, 30], null, ['cam_lima.png', 118, 40], ['subway.png', 160, 40], null, null, ['cam_iowa.png', 96, 32], ['city_aerial.png', 92, 38]];
const PXD = new Map();
function pxData(name) {
  if (PXD.has(name)) return PXD.get(name);
  const img = asset(name); if (!img) return null;
  const c = egCanvas('px:' + name, img.naturalWidth, img.naturalHeight), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
  const d = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; PXD.set(name, d); return d;
}
let MON_MASK = null;
function monMasks() {
  if (MON_MASK) return MON_MASK;
  const P = pxData('monitors_ots.png'); if (!P) return null;
  const grey = (x, y) => P.d[(y * P.w + x) * 4] === 142;
  MON_MASK = MON.map(({ r, s }) => {
    const seen = new Set(), out = [], st = [s];
    while (st.length) {
      const [x, y] = st.pop(), k = y * P.w + x;
      if (x < r[0] || x > r[2] || y < r[1] || y > r[3] || seen.has(k) || !grey(x, y)) continue;
      seen.add(k); out.push([x, y]); st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    let x0 = 1e9, y0 = 1e9, y1 = 0; for (const [x, y] of out) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { px: out, x0, y0, y1 };
  });
  return MON_MASK;
}
const PAL = [[0, 0, 0], [142, 142, 142], [253, 253, 253]];
function monFeeds(g) {
  const M = monMasks(); if (!M) return;
  const c = egCanvas('feeds', 240, 134), fg = c.getContext('2d'), im = fg.createImageData(240, 134), d = im.data, step = Math.round(TT * 12);
  M.forEach((m, i) => {
    const feed = MON_FEED[i], src = feed && pxData(feed[0]), roll = m.y0 + (step * 2 + i * 7) % (m.y1 - m.y0 + 1);
    for (const [x, y] of m.px) {
      let v;
      if (src) { const sx = feed[1] + x - m.x0, sy = feed[2] + y - m.y0, s = src.d[(sy * src.w + sx) * 4]; v = s < 70 ? 0 : s < 200 ? 1 : 2; }
      else { const h = hsh(x >> 1, y >> 1, step + i * 31), band = hsh(0, y >> 1, step + i * 31 + 7) < 0.12; v = band ? 2 : h < 0.3 ? 0 : h < 0.93 ? 1 : 2; }   // 2x2-cell snow, mostly grey
      if (y === roll) v = Math.min(2, v + 1);
      if (src && Math.floor(TT * 2) % 2 === 0 && x - m.x0 < 3 && y - m.y0 >= 1 && y - m.y0 < 3 && x - m.x0 >= 1) v = 2;   // the rec dot
      const j = (y * 240 + x) * 4; d[j] = d[j + 1] = d[j + 2] = PAL[v][0]; d[j + 3] = 255;
    }
  });
  fg.putImageData(im, 0, 0); g.drawImage(c, 0, NATIVE_PX, 240 * NATIVE_PX, 134 * NATIVE_PX);
}
// wide over her shoulder, slow push / a pan across the wall / the subway screen alone, its 24 frames counting
function sceneMonitors() {   // one held shot over two lines: a slow push, then on "cameras" a glide up the wall
  const tc = AT('cameras'), u = EZ.io(seg(TT, tc, shotEnd()));
  const cam = TT < tc ? pushIn(E0, tc, 1.02, 1.14, 1250, 480) : { z: lerp(1.14, 1.6, u), x: lerp(1250, 1900, u), y: lerp(480, 200, u) };
  flowShot([{ a: 'monitors_ots.png' }, { draw: monFeeds }], { cam });
  subsNow();
}
function sceneMonWall() {
  const u = EZ.io(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'monitors_ots.png' }, { draw: monFeeds }], { cam: { z: 1.6, x: lerp(1900, 1150, u), y: lerp(200, 520, u) } });
  subsNow();
}
function sceneMonOne(scrub = false) {
  // cut to the subway screen itself, full frame inside the monitor's bezel: the empty platform, its 24 frames counting,
  // a bright scan row rolling down, the picture hopping one cell on each new frame (tape advance)
  let per = (shotEnd() - E0 - 0.3) / 24, fr = 1 + Math.min(23, Math.floor((TT - E0) / per)), hop = fr > 1 && (TT - E0) - (fr - 1) * per < 1 / 24 + 1e-6;
  if (scrub) {   // the engineers: the 24 frames scrubbed forward and back, two frames a step, a hop on each step
    const st = Math.floor((TT - E0) * 6), ph = st % 24; fr = 1 + (ph < 12 ? ph * 2 : (23 - ph) * 2); hop = ((TT - E0) * 6) % 1 < 0.25;
  }
  const scan = (g) => {
    const P = pxData('subway.png'); if (!P) return;
    const r = (Math.round(TT * 12) * 2) % P.h;
    for (let x = 0; x < P.w; x++) { const s = P.d[(r * P.w + x) * 4]; cellAt(g, x, r + LAYER_Y, s < 70 ? '#8e8e8e' : '#fdfdfd'); }
  };
  flowShot([{ a: 'subway.png' }, { draw: scan }], { cam: scrub ? pushIn(E0, shotEnd(), 1.5, 1.75, 1240, 640) : pushIn(E0, shotEnd(), 1.04, 1.1, 1100, 520), shake: [0, hop ? 1 : 0] });
  const B = 48, led = Math.floor(TT * 2) % 2;
  hud(() => {   // the monitor's bezel is HUD: drawn after the wiggle
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#8e8e8e'; ctx.fillRect(0, 0, W, B); ctx.fillRect(0, H - B, W, B); ctx.fillRect(0, 0, B, H); ctx.fillRect(W - B, 0, B, H);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, H - 8, W, 8); ctx.fillRect(0, 0, 8, H); ctx.fillRect(W - 8, 0, 8, H);
  ctx.fillRect(B - 8, B - 8, W - 2 * B + 16, 8); ctx.fillRect(B - 8, H - B, W - 2 * B + 16, 8); ctx.fillRect(B - 8, B - 8, 8, H - 2 * B + 16); ctx.fillRect(W - B, B - 8, 8, H - 2 * B + 16);
  for (const [x, y, sx, sy] of [[B, B, 1, 1], [W - B, B, -1, 1], [B, H - B, 1, -1], [W - B, H - B, -1, -1]])   // the tube's rounded corners
    for (let i = 0; i < 3; i++) ctx.fillRect(sx > 0 ? x : x - (3 - i) * 8, sy > 0 ? y + i * 8 : y - (i + 1) * 8, (3 - i) * 8, 8);
  ctx.fillStyle = led ? '#fdfdfd' : '#000'; ctx.fillRect(W - 120, H - 32, 24, 16);   // power LED
  ctx.restore();
  });
  cctv('cam 04  tokyo', fr, 96); subsNow();
}
// ---- 9: "he had started to turn around": the man huge in the subway camera, side view, then turning on "turn";
// the face never shown. Slow push. The reveal reuses the framing.
const TURN_DY = 120;
// a ceiling lamp's glow behind his head (cells (120, 27)): only the subway's black cells light up, flat grey in the core and a
// checker at the edge, so the dark head reads against it
function headGlow(g) {
  const P = pxData('subway.png'); if (!P) return;
  const c = egCanvas('headglow', 240, 136);
  if (!c.dataset.ok) {   // drawn once on the native grid and scaled as one image (no seams between cells)
    const cg = c.getContext('2d'); cg.clearRect(0, 0, 240, 136);
    for (let y = 4; y <= 52; y++) for (let x = 96; x <= 144; x++) {
      const d = Math.hypot(x - 120, (y - 24) * 1.1), sy = y - LAYER_Y; if (d > 19 || sy < 0) continue;
      const dark = P.d[(sy * P.w + x) * 4] <= 70;
      // a flat grey disk (it also washes out the pillar edges near his head), a checker fringe, sparse dots beyond
      const col = d < 15 ? '#8e8e8e' : d < 17.5 ? ((x + y) & 1 && dark ? '#8e8e8e' : null) : ((x + y) % 4 === 0 && dark ? '#2b2b2b' : null);
      if (col) { cg.fillStyle = col; cg.fillRect(x, y, 1, 1); }
    }
    c.dataset.ok = 1;
  }
  g.drawImage(c, 0, 0, 240 * NATIVE_PX, 136 * NATIVE_PX);
}
function sceneTurn() {
  const a = TT < VW('turn', 'turn') ? 'man_side.png' : 'man_turn.png';
  flowShot([{ a: 'subway.png' }, { draw: headGlow }, { a, dy: TURN_DY }],{ cam: pushIn(E0, shotEnd(), 1.4, 1.75, 960, 260) });
  cctv('cam 04  tokyo', 24); subsNow();
}
// ---- 10: the old records. The monk's page close along the handwriting, then the page wide pushing into the doorway;
// the 1888 photograph (push into the tall man); the 1961 reel panned frame to frame
function sceneBefore() {   // along the handwriting, then on the monk's line a glide on into the doorway
  const tm = AT('monk'), u = EZ.io(seg(TT, E0, tm)), v = EZ.io(seg(TT, tm, shotEnd()));
  flowShot([{ a: 'scroll_1582.png' }], { cam: TT < tm ? { z: 2.0, x: lerp(300, 1300, u), y: lerp(330, 520, u) } : { z: lerp(2.0, 2.3, v), x: lerp(1300, 1464, v), y: lerp(520, 408, v) } });
  if (TT >= tm) tagAt('1582');
  subsNow();
}
function sceneMonk() {
  flowShot([{ a: 'scroll_1582.png' }], { cam: pushIn(E0, shotEnd(), 1.04, 1.9, 1464, 408) });
  tagAt('1582'); subsNow();
}
function scenePhoto() {
  flowShot([{ a: 'photo_1888.png' }], { cam: pushIn(E0, shotEnd(), 1.05, 1.75, 960, 330) });
  tagAt('1888'); subsNow();
}
function sceneFilm() {
  const u = EZ.io(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'film_1961.png' }], { cam: { z: 1.5, x: lerp(0, 1920, u), y: 540 } });
  tagAt('1961'); subsNow();
}
// "one step closer": three hard cuts, each record's man bigger than the last (doorway -> photo -> film frame 3)
function sceneStep() {
  const k = TT < VW('step', 'skipped') - 0.1 ? 0 : TT < VW('step', 'one') - 0.1 ? 1 : 2, t0 = [E0, VW('step', 'skipped') - 0.1, VW('step', 'one') - 0.1][k];
  const s = [['scroll_1582.png', 2.0, 2.2, 1464, 408, '1582'], ['photo_1888.png', 2.1, 2.3, 960, 330, '1888'], ['film_1961.png', 1.9, 2.1, 1600, 488, '1961']][k];
  flowShot([{ a: s[0] }], { cam: pushIn(t0, shotEnd(), s[1], s[2], s[3], s[4]) });
  tagAt(s[5]); subsNow();
}
// ---- 11: someone counted the steps: tally marks scratched on black, 23 of them; the 24th slot empty and blinking.
// After the line, a beat of black (the hard silence before the reveal).
function sceneCount() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  SUB_Y = 860;
  const end = REVEAL - 0.9;   // the marks hold (the 24th blinking) until the hard silence before the reveal
  if (TT < end) {
    const n = Math.min(23, Math.floor(seg(TT, E0 + 0.15, VL('count').t1 - 0.2) * 23) + (TT > E0 + 0.15 ? 1 : 0)), g = ctx;
    for (let i = 0; i < n; i++) {
      const grp = Math.floor(i / 5), j = i % 5, x0 = 62 + grp * 24, y0 = 46, jx = Math.round(hsh(i, 3, 1) * 2 - 1);
      if (j < 4) cellLine(g, x0 + j * 4, y0 + jx, x0 + j * 4 + jx, y0 + 16, '#fdfdfd', 2);
      else cellLine(g, x0 - 2, y0 + 13, x0 + 15, y0 + 3, '#fdfdfd', 2);
    }
    if (n === 23 && Math.floor(TT * 4) % 2 === 0) for (let y = 0; y <= 16; y += 2) cellAt(g, 62 + 4 * 24 + 4 * 3 - 4, 46 + y, '#8e8e8e');
    tagAt('steps  ' + String(n).padStart(2, '0') + ' / 24');
  }
  ctx.restore(); subsNow();
}
// ---- 11b REVEAL: "there is one left". Flicker cuts on twos: the turning man inverted / plain, the empty platform,
// the side view, black; it settles on the inverted turn and pushes in, then goes black just before the cover-up.
function sceneReveal() {
  const k = Math.round((TT - E0) * 12), hold = VL('left').t1 + 0.25;
  // man_close.png: the man close from behind, head turned three-quarters, face in black shadow, the neck twisted too long.
  // Every flicker frame is one whole readable picture: him plain, him inverted (white on black), the empty platform, black.
  // Settles on him plain and pushes into the head, then black just before the cover-up.
  let v = TT >= shotEnd() - 0.25 ? 'black' : TT >= hold ? 'man' : ['man', 'man', 'black', 'inv', 'man', 'empty', 'man', 'black', 'inv', 'man', 'man', 'black'][(k + Math.floor(hsh(k, 5, 9) * 3)) % 12];
  if (v === 'black') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); SUB_Y = 860; subsNow(); return; }
  const z = TT >= hold ? lerp(1.05, 1.4, EZ.io(seg(TT, hold, shotEnd()))) : 1.02 + (k % 3) * 0.07;
  flowShot([{ a: v === 'empty' ? 'subway.png' : 'man_close.png' }], { cam: { z, x: 1190, y: 330 } });
  if (v === 'inv') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  subsNow();
}
// ---- 12: the cover-up. The officer turning a camera, wide push; then close on the camera; on "face the walls" the
// camera's own view: a cracked wall, still recording
function sceneOfficer() {
  flowShot([{ a: 'officer_cam.png' }], { cam: pushIn(E0, shotEnd(), 1.03, 1.22, 1040, 260) });
  subsNow();
}
function sceneWalls() {
  if (TT < VW('walls', 'face') - 0.1) {
    const u = EZ.io(seg(TT, E0, VW('walls', 'face')));   // the officer wide, pushing slowly in onto the camera he turns
    flowShot([{ a: 'officer_cam.png' }], { cam: { z: lerp(1.03, 1.85, u), x: lerp(1040, 1180, u), y: lerp(260, 240, u) } });
  } else {
    flowShot([{ a: 'subway.png' }], { cam: { z: 2.2, x: 0, y: lerp(360, 420, seg(TT, VW('walls', 'face'), shotEnd())) } });   // the Tokyo camera, now on its tiled wall
    cctv('cam 04  tokyo', 1 + Math.floor((TT - E0) / 0.4) % 24);
  }
  subsNow();
}
// ---- 13: the vote: the city pulling out from the tower; then the tower itself, its second hand stuck between 06 and 08
function sceneVote() {
  flowShot([{ a: 'city_aerial.png' }], { cam: pushIn(E0, shotEnd(), 2.0, 1.1, 960, 464) });
  tagAt('2022'); subsNow();
}
function sceneWhy() {
  const sec = Math.floor((TT - E0) * 2) % 2 ? 8 : 6;
  flowShot([{ a: 'clock.png' }, { draw: (g) => clockHands(g, sec) }], { cam: pushIn(E0, shotEnd(), 1.04, 1.3, 1156, 316) });
  subsNow();
}
// ---- 14: people who won't look at a clock: a pan along their backs, then a tilt up to the street clock on "clock"
function scenePeople() {
  const tc = VW('clocks', 'clock') - 0.2, u = EZ.io(seg(TT, E0, tc)), v = EZ.io(seg(TT, tc, tc + 0.9));
  flowShot([{ a: 'people_backs.png' }], { cam: { z: 1.3, x: lerp(lerp(0, 1300, u), 1920, v), y: lerp(1080, 0, v) } });
  subsNow();
}
// ---- 15: the final question: the phone screen's reflection, a slow push onto the blank face
function scenePhone() {
  // the face in the black glass is wrong (eyes too wide apart, pinpoint pupils, a smile too wide); on "face" the smile
  // stretches further (phone_reflect2b, same framing) with a small push punch
  const tf = VW('face', 'face'), wide = TT >= tf;
  const z = lerp(1.03, 1.3, EZ.io(seg(TT, E0, shotEnd()))) + (wide ? 0.06 * EZ.o3(seg(TT, tf, tf + 0.25)) : 0);
  flowShot([{ a: wide ? 'phone_reflect2b.png' : 'phone_reflect2.png' }], { cam: { z, x: 1300, y: 470 } });
  subsNow();
}
function sceneCard() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (TT > E0 + 0.5) { const n = Math.floor((TT - E0 - 0.5) / 0.07) + 1; const f = () => afText(['whose face', 'will he have?'], CX, 480, { count: n, S: 8 }); DEFER ? DEFER.push(f) : f(); }
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

// =====================================================================
//  THE LONG CUT: shots for the added lines (each held 6-12 s, always moving)
// =====================================================================
// tv snow on the native grid (2x2-cell grains, mostly grey), with a bright band rolling down
function egSnow(seed) {
  const w = 240, h = 135, c = egCanvas('snow', w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, band = (seed * 3) % h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = hsh(x >> 1, y >> 1, seed), j = (y * w + x) * 4, l = Math.abs(y - band) < 2 ? 253 : v < 0.35 ? 0 : v < 0.92 ? 142 : 253;
    d[j] = d[j + 1] = d[j + 2] = l; d[j + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, W, h * NATIVE_PX); ctx.restore();
}
// "every government asked": low over the rooftops, a slow drift right to left; lit windows go out one by one
function sceneGovt() {
  const u = EZ.io(seg(TT, E0, shotEnd())), P = pxData('city_aerial.png');
  const lights = (g) => {
    if (!P) return;
    const st = Math.floor((TT - E0) * 3);
    for (let i = 0; i < 260; i++) {
      const x = Math.floor(hsh(i, 11, 3) * P.w), y = Math.floor(hsh(i, 5, 17) * P.h);
      if (P.d[(y * P.w + x) * 4] > 200 && hsh(i, st, 9) < 0.35) cellAt(g, x, y + LAYER_Y, '#000');
    }
  };
  flowShot([{ a: 'city_aerial.png' }, { draw: lights }], { cam: { z: lerp(2.3, 2.15, u), x: lerp(1560, 380, u), y: lerp(760, 700, u) } });
  tagAt('03:14:08'); subsNow();
}
// "engineers checked the footage": the subway tape again, scrubbed back and forth frame by frame
function sceneTamper() { sceneMonOne(true); }   // the same tape, scrubbed, pushed in on the platform
// "thousands of cameras": a 2x2 wall of the four feeds, then 3x3 on "cities"; same man in every tile. Each tile is drawn
// at a whole number of screen px per native pixel (4 or 3), drifting by whole px, so no cell is resampled unevenly.
const GRID_CITY = ['tokyo', 'lagos', 'iowa', 'lima', 'cairo', 'oslo', 'mumbai', 'quito', 'perth'];
function sceneGrid() {
  const n = TT < VW('thousands', 'cities') - 0.1 ? 2 : 3, tw = W / n, th = H / n, k = n === 2 ? 0.5 : 0.375;   // 8*k = 4 or 3 px cells
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  const keys = ['tokyo', 'lagos', 'iowa', 'lima'], labels = [];
  for (let i = 0; i < n * n; i++) {
    const p = PLACE[keys[i % 4]], tx = (i % n) * tw, ty = Math.floor(i / n) * th;
    const img = asset(p.a), fig = asset(p.fig); if (!img || !fig) continue;
    const vw = tw / k, vh = th / k;                                            // the tile's view in frame coords
    const fx = W / 2 + p.dx, fy = H / 2 + p.dy + 120, drift = (TT - E0) * (8 + i * 3) * (i % 2 ? 1 : -1);
    const vx = Math.round(Math.max(0, Math.min(W - vw, fx - vw / 2 + drift)) / 8) * 8, vy = Math.round(Math.max(0, Math.min(H - vh, fy - vh / 2)) / 8) * 8;
    ctx.save(); ctx.beginPath(); ctx.rect(tx, ty, tw, th); ctx.clip();
    ctx.setTransform(k, 0, 0, k, Math.round(tx - vx * k), Math.round(ty - vy * k));
    for (const [im, dx, dy] of [[img, 0, 0], [fig, p.dx, p.dy]]) {
      const lw = im.naturalWidth * NATIVE_PX, lh = im.naturalHeight * NATIVE_PX;
      ctx.drawImage(im, Math.round(((W - lw) / 2 + dx) / NATIVE_PX) * NATIVE_PX, Math.round(((H - lh) / 2 + dy) / NATIVE_PX) * NATIVE_PX, lw, lh);
    }
    ctx.restore();
    const burst = hsh(i, Math.floor(TT * 6), 4) < 0.025;                       // now and then a tile drops to snow for a beat
    if (burst) { ctx.fillStyle = '#8e8e8e'; ctx.fillRect(tx, ty, tw, th); for (let y = 0; y < th; y += 8) for (let x = 0; x < tw; x += 8) if (hsh(x, y, Math.floor(TT * 12)) < 0.4) { ctx.fillStyle = hsh(y, x, 3) < 0.6 ? '#000' : '#fdfdfd'; ctx.fillRect(tx + x, ty + y, 8, 8); } }
    const roll = ty + ((Math.round(TT * 12) * 6 + i * 37) % th); ctx.fillStyle = 'rgba(253,253,253,0.35)'; ctx.fillRect(tx, roll - (roll % 4), tw, 4);
    labels.push([tx, ty, i]);
  }
  ctx.restore();
  const T0 = TT, e0 = E0;
  hud(() => {   // the tile dividers and labels are HUD: drawn after the wiggle
  const TT = T0, E0 = e0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; for (let j = 1; j < n; j++) { ctx.fillRect(j * tw - 4, 0, 8, H); ctx.fillRect(0, j * th - 4, W, 8); }
  const A = afAtlas('#fdfdfd'), K = afAtlas('#000000'), S = n === 2 ? 5 : 4;
  const run = (str, x, y) => { for (const [dx, dy] of [[-S, 0], [S, 0], [0, -S], [0, S]]) afRun(K, str, x + dx, y + dy, S); afRun(A, str, x, y, S); };
  if (A && K) for (const [tx, ty, i] of labels) {
    run('cam ' + String(4 + i * 13 % 89).padStart(2, '0') + '  ' + GRID_CITY[i], tx + 24 + 9 * S, ty + 20);
    const fr = 1 + (Math.floor((TT - E0) / 0.4) + i * 5) % 24, fs = 'frame ' + String(fr).padStart(2, '0') + '/24';
    if (n === 2) run(fs, tx + tw - 24 - afW(fs) * S, ty + 20); else run(fs, tx + 24 + 9 * S, ty + 20 + 11 * S);   // 3x3: the counter under the name, so both stay big
    if (Math.floor(TT * 2 + i * 0.5) % 2 === 0) { ctx.fillStyle = '#000'; ctx.fillRect(tx + 24 - S, Math.round(ty + 20 + 4.5 * S), 7 * S, 7 * S); ctx.fillStyle = '#fdfdfd'; ctx.fillRect(tx + 24, Math.round(ty + 20 + 5.5 * S), 5 * S, 5 * S); }
  }
  ctx.restore();
  });
  SUB_Y = 860; subsNow();
}
// "nobody has seen his face": low and close on his head, the last two frames replayed (23, 24, 23, 24...), then on
// "soon" the tape runs out into snow
function sceneNoFace() {
  const end = VW('noface', 'soon') + 0.35;
  if (TT >= end) { egSnow(Math.round(TT * 12)); SUB_Y = 860; cctv('cam 04  tokyo', 24); subsNow(); return; }
  const fr = Math.floor((TT - E0) / 1.3) % 2 ? 24 : 23, u = EZ.io(seg(TT, E0, end));
  flowShot([{ a: 'subway.png' }, { draw: headGlow }, { a: fr === 24 ? 'man_turn.png' : 'man_side.png', dy: TURN_DY }], { cam: { z: lerp(1.95, 1.4, u), x: 960, y: 300 }, shake: [0, (TT - E0) % 1.3 < 1 / 24 ? 1 : 0] });
  cctv('cam 04  tokyo', fr); subsNow();
}
// the cave painting: a torch circle slides along the hunters and the animals, then finds the tall figure on "tall"
// and stays on him; the flame flickers the circle's edge
function sceneCave() {
  const tf = VW('cave', 'tall') - 0.3, a = EZ.io(seg(TT, E0, tf)), b = EZ.io(seg(TT, tf, tf + 1.6));
  const sx = lerp(lerp(260, 900, a), 1560, b), sy = lerp(lerp(640, 560, a), 520, b);
  const r = 300 + Math.round(hsh(Math.floor(TT * 8), 1, 2) * 3) * 8 + b * 80;
  const z = lerp(1.35, 1.5, EZ.io(seg(TT, E0, shotEnd())));
  // his back is engraved into the paint (a spine groove, two shoulder blades, a nape), so the tall figure reads as turned away
  const back = (g) => {
    const c = '#8e8e8e', y0 = LAYER_Y;
    for (let y = 33; y <= 74; y++) cellAt(g, 196, y + y0, c);
    for (const [x, y] of [[190, 36], [191, 37], [191, 38], [191, 39], [192, 40], [193, 41], [202, 36], [201, 37], [201, 38], [201, 39], [200, 40], [199, 41], [194, 29], [195, 29], [196, 29], [197, 29]]) cellAt(g, x, y + y0, c);
  };
  flowShot([{ a: 'cave.png' }, { draw: back }], { cam: { z, x: lerp(lerp(420, 900, a), 1480, b), y: lerp(560, 520, b) }, spot: { x: sx, y: sy, r, f: 70 } });
  tagAt('france'); subsNow();
}
// "he will be facing us": extreme close on the shadowed face, a slow push; one inverted frame now and then, two on "facing"
function sceneFacing() {
  const k = Math.round((TT - E0) * 12), tf = VW('facing', 'facing');
  const inv = hsh(k, 7, 3) < 0.04 || (TT >= tf && TT < tf + 2 / 12);
  flowShot([{ a: 'man_close.png' }], { cam: { z: lerp(2.0, 2.5, EZ.io(seg(TT, E0, shotEnd()))), x: 1180, y: 300 } });
  if (inv) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  subsNow();
}
// "observatories stopped publishing": the lab empty (no scientist), its clock display blanked to dashes, then dark
function sceneObserv() {
  const dark = TT >= VW('observ', 'stopped');
  const disp = (g) => {
    g.fillStyle = '#000'; g.fillRect(153 * NATIVE_PX, (26 + LAYER_Y) * NATIVE_PX, 65 * NATIVE_PX, 17 * NATIVE_PX);
    const txt = dark ? (Math.floor(TT * 2) % 2 ? '_' : '') : (Math.floor(TT * 2) % 2 ? '--:--:--' : '03:14:0?');
    if (txt) { const saved = ctx; ctx = g; afRun(afAtlas('#fdfdfd'), txt, 158 * NATIVE_PX, (28 + LAYER_Y) * NATIVE_PX, 6); ctx = saved; }
  };
  const u = EZ.io(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'lab.png' }, { draw: disp }], { cam: { z: lerp(1.25, 1.4, u), x: lerp(500, 1500, u), y: 380 } });
  subsNow();
}
// "a single tick": the tower at night from the street, tilting up to the face; the second hand sits at 07 and on "tick"
// moves once, a ring of cells spreading from the face and fading in checker steps
function sceneTick() {
  const tk = VW('tick', 'tick'), u = EZ.io(seg(TT, E0, tk - 0.2)), cx = 143, cy = 37 + LAYER_Y, q = seg(TT, tk, tk + 1.1);
  const ring = (g) => {
    if (TT < tk || q >= 1) return;
    const R = 18 + q * 46;
    for (let y = -70; y <= 70; y++) for (let x = -70; x <= 70; x++) {
      const d = Math.hypot(x, y);
      if (Math.abs(d - R) < 1.2 && (q < 0.5 || (x + y) & 1)) cellAt(g, cx + x, cy + y, '#fdfdfd');
    }
  };
  flowShot([{ a: 'clock.png' }, { draw: (g) => clockHands(g, TT >= tk ? 8 : 7) }, { draw: ring }],
    { cam: { z: lerp(1.6, 1.3, u) + (TT >= tk ? 0.04 * EZ.o3(seg(TT, tk, tk + 0.3)) : 0), x: 1148, y: lerp(980, 330, u) } });
  subsNow();
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
STYLE.post = () => { egWiggle(1.5); hudFlush(); };   // wiggle: was 2.6, then 1.3; 1.5 is the user's value   // the HotD value: lines tremble; more shears the 1-bit squares

// =====================================================================
//  SCENES — the elevator game. Flow images (assets/) drawn into a low-res grid, then quantized to the onebit ramp
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
const NATIVE_PX = 9;   // one native pixel = 9 screen px exactly (134x240 -> 1206x2160, a margin all round), so every square is the same size
function flowShot(layers, o = {}) {
  SUB_Y = 1300;
  const cam = o.cam || { z: 1, x: W / 2, y: H / 2 };
  const sx = Math.round(o.shake?.[0] ?? 0) * NATIVE_PX, sy = Math.round(o.shake?.[1] ?? 0) * NATIVE_PX;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(cam.z, 0, 0, cam.z, cam.x - cam.x * cam.z + sx, cam.y - cam.y * cam.z + sy);
  ctx.imageSmoothingEnabled = false;
  layers.forEach((L, li) => {
    if (L.draw) { L.draw(ctx); return; }
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
  const S = o.S ?? 7, lh = 15 * S, white = afAtlas('#fdfdfd'); if (!white) return;
  const SW = 2, R = o.stroke ?? 11, E = 0;   // bold offset, black stroke radius (no white edge: the user's call)
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
const SUB_TEXT = { open: 'After the earthquake, | a fault opened | on Amigara Mountain.', holes: 'The rock was full of holes. | Hundreds of them. | Shaped like people.', anymore: 'The holes there | weren\'t shaped like | people anymore.', made: '"this hole was made for me," a man said.', light: 'No light could reach | the end of it.', months: 'Months later, they dug | into the other side | of the mountain.' };   // ' | ' forces a row break
const SUB_PX = 900;   // max row width in px (the frame is 1080)
function subChunks(l) {
  const text = SUB_TEXT[l.id] ?? l.text, ws = text.split(' '), rows = [], nWords = ws.filter((w) => w !== '|').length;
  let row = '';
  const fits = (r) => afW(r.toLowerCase()) * 7 <= SUB_PX;   // measured width at the subtitle size
  for (const w of ws) { if (w === '|') { if (row) rows.push(row); row = ''; continue; } if (row && !fits(row + ' ' + w)) { rows.push(row); row = w; } else row = row ? row + ' ' + w : w; if (/[.!?]"?$/.test(w) || (/,"?$/.test(w) && row.length > 9)) { rows.push(row); row = ''; } }
  if (row) { const j = rows.length ? rows[rows.length - 1] + ' ' + row : ''; if (row.split(' ').length <= 1 && j && fits(j)) rows[rows.length - 1] = j; else rows.push(row); }
  // no row ends on a little word ("the", "of"...), and no row is a lone word: move a word down from the row above
  for (let i = 0; i + 1 < rows.length; i++) {
    const a = rows[i].split(' '), b = rows[i + 1].split(' ');
    while (a.length > 1 && (/^(the|of|on|a|an|to|into|and|but|like|was|who)$/.test(a[a.length - 1]) || b.length === 1) && fits(a[a.length - 1] + ' ' + b.join(' '))) { b.unshift(a.pop()); if (b.length > 2 && !/^(the|of|on|a|an|to|into|and|but|like|was|who)$/.test(a[a.length - 1])) break; }
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
  chunks.forEach((c, i) => { c.end = i + 1 < chunks.length ? chunks[i + 1].t0 : l.t1 + 0.45; });
  return chunks;
}
const SUBS = VOICE.lines.flatMap(subChunks);
SUBS.forEach((c, i) => {
  if (SUBS[i + 1]) c.end = Math.min(c.end, SUBS[i + 1].t0);
  const cut = SHOT_LIST.map(([t]) => t).find((t) => t > c.t1 + 0.05); if (cut != null) c.end = Math.min(c.end, cut);   // never over the next shot
});
let SUB_Y = 1300;   // a shot can move the subtitles (the tunnel keeps its workers clear)
function subsNow() {
  for (const c of SUBS) if (TT >= c.t0 && TT < c.end) {
    const n = c.rows.join('').replace(/ /g, '').length, rate = Math.min(0.05, Math.max(0.025, (c.t1 - c.t0) / n));
    const f = () => afText(c.rows, 540, SUB_Y, { count: Math.floor((TT - c.t0) / rate) + 1 }); DEFER ? DEFER.push(f) : f();
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
  DEFER ? DEFER.push(f) : f();
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
function sceneFault() {
  flowShot([{ a: 'fault.png' }], { grid: 180, cam: pushIn(0, shotEnd(), 1.0, 1.14, 540, 1050) });
  wohTag('AMIGARA FAULT'); subsNow();
}
function sceneCrowd() {
  flowShot([{ a: 'crowd.png' }], { grid: 180, cam: pushIn(E0, shotEnd(), 1.5, 1.38, 520, 1450) });
  subsNow();
}
function sceneMan() {
  const f = face([[E0, 'mnM_base.png'], [VW('found', 'exactly'), 'mnM_rapture.png'], [VL('found').t1 + 0.1, 'mnM_base.png'], ...lips('made', 'mnM_talk.png', 'mnM_base.png'), [VW('made', 'a'), 'mnM_rapture.png']], { blink: MAN_BLINK, seed: 0.3 });
  const close = TT >= VL('made').t0 - 0.15;   // a cut-in to his face when he speaks
  flowShot([{ a: 'holeplate.png', mode: 'flat' }, { a: f.a, dx: f.dx + 36, dy: f.dy, rim: true }], { grid: 180, cam: close ? { z: 13 / 9, x: 560, y: 640 } : pushIn(E0, VL('made').t0, 1.0, 1.06, 640, 800) });
  subsNow();
}
function sceneManFit() {
  flowShot([{ a: 'man_fit.png', mode: 'flat' }], { grid: 135, cam: pushIn(E0, shotEnd(), 1.0, 1.1, 300, 700) });
  subsNow();
}
// the flashlight: a round spot that wanders over the hole; the black inside never lights up
function sceneEmpty() {
  const u = TT - E0, spot = { x: 300 + Math.sin(u * 1.3) * 90, y: 820 + Math.sin(u * 0.9 + 1) * 160, r: 380, f: 260 };
  flowShot([{ a: 'holeplate.png', mode: 'flat' }], { grid: 135, spot, cam: pushIn(E0, shotEnd(), 1.0, 1.2, 300, 880) });
  subsNow();
}
function sceneYoshida() {
  const f = face([[E0, 'yoM_base.png'], [VW('yoshida', 'hers'), 'yoM_side.png'], [VW('yoshida', 'she'), 'yoM_trance.png']], { blink: YO_BLINK, seed: 1.8 });
  flowShot([{ a: 'holeplate.png', mode: 'flat', dx: -54 }, { a: f.a, dx: f.dx + 36, dy: f.dy + 36, rim: true }], { grid: 180, cam: pushIn(E0, shotEnd(), 1.0, 1.06, 540, 800) });
  wohTag('YOSHIDA'); subsNow();
}
function scenePath() {
  flowShot([{ a: 'owaki_path.png', mode: 'flat' }], { grid: 135, cam: { z: 1, x: 540, y: 960 } });
  wohTag('OWAKI'); subsNow();
}
function sceneHisHole() {
  flowShot([{ a: 'owakihole.png', mode: 'flat' }], { grid: 135, cam: pushIn(E0, shotEnd(), 1.0, 1.1, 540, 900) });
  subsNow();
}
function sceneOwaki() {
  const f = face([[E0, 'owM_base.png'], [VW('shape', 'own'), 'owM_side.png'], [VW('shape', 'him'), 'owM_trance.png']], { blink: OW_BLINK, seed: 1.8 });
  flowShot([{ a: 'owakihole.png', mode: 'flat', dx: 36, dy: 108 }, { a: f.a, dx: f.dx + 36, dy: f.dy + 36, rim: true }], { grid: 180, cam: pushIn(E0, shotEnd(), 1.0, 1.06, 540, 800) });
  wohTag('OWAKI'); subsNow();
}
function sceneEnter() {
  const u = EZ.i3(seg(TT, E0, shotEnd()));
  flowShot([{ a: 'owakihole.png', mode: 'flat' }], { grid: 135, cam: { z: lerp(1.0, 4.5, u), x: 540, y: 700 } });
  if (TT > shotEnd() - 0.17) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // fully inside: pure black
}
function sceneTunnel() {
  flowShot([{ a: 'tunnel.png', mode: 'flat' }], { grid: 180, gamma: 1.2, cam: pushIn(E0, shotEnd(), 1.0, 1.15, 540, 900) });
  SUB_Y = 1150;   // over the stone face: clear of the two workers
  subsNow();
}
// two white eyes open inside the hole's head in the last second: something is in there
function holeEyes(g) {
  const o = EZ.o2(seg(TT, shotEnd() - 1.1, shotEnd() - 0.7)); if (o <= 0) return;
  const P = NATIVE_PX, cell = (cx, cy, col) => { g.fillStyle = col; g.fillRect(Math.round(cx / P) * P, Math.round(cy / P) * P, P, P); };
  for (const ex of [505, 575]) for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
    const r = Math.hypot(i, j / Math.max(0.15, o)); if (r <= 3.2) cell(ex + i * P, 620 + j * P, r <= 1.6 ? '#000' : '#fdfdfd');
  }
}
function sceneStretch() {
  flowShot([{ a: 'stretchholes.png', mode: 'flat' }, { draw: holeEyes, mode: 'flat' }], { grid: 135, cam: pushIn(E0, shotEnd(), 1.0, 1.1, 540, 620) });
  subsNow();
}
function sceneReveal() {
  const t = TT - E0, sh = t < 0.15 ? [(B % 2 ? 2 : -2), (B % 3) - 1] : [0, 0];
  const crawl = EZ.o2(seg(TT, E0, E0 + 2.6)) * 60;
  flowShot([{ a: 'emerge.png', mode: 'flat', dy: -90 }], { grid: 135, cam: { z: lerp(1.3, 1.0, EZ.o3(seg(TT, E0, E0 + 0.35))) + 0.15 * crawl / 60, x: 540, y: 1700 }, shake: sh });
}
function sceneCard() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (TT > E0 + 0.5) afText(['this hole was', 'made for me.'], 540, 880, { count: Math.floor((TT - E0 - 0.5) / 0.07) + 1, S: 8 });
}
// ---- the Madfable outro: the channel's spiral draws itself in like a pen from its outer tail (assets/logo_order.png
// holds each pixel's distance along the stroke), then the name dissolves in, one 9-px cell at a time. White on black.
let EG_ORDER = null;
function sceneLogo() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sp = asset('logo_spiral.png'), od = asset('logo_order.png'), nm = asset('logo_name.png');
  if (!sp || !od || !nm) { ctx.restore(); return; }
  if (!EG_ORDER) { const c = egCanvas('logo:o', od.width, od.height), g = c.getContext('2d'); g.drawImage(od, 0, 0); EG_ORDER = g.getImageData(0, 0, od.width, od.height).data; }
  const t = TT - E0, p = 1 + 254 * EZ.io(seg(t, 0.15, 1.65));
  const S = egCanvas('logo:s', sp.width, sp.height), sg = S.getContext('2d'), im = sg.createImageData(sp.width, sp.height);
  for (let i = 0; i < EG_ORDER.length; i += 4) if (EG_ORDER[i] && EG_ORDER[i] <= p) { im.data[i] = im.data[i + 1] = im.data[i + 2] = 253; im.data[i + 3] = 255; }
  sg.putImageData(im, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const sy = 648 + Math.round((t < 1.65 ? 0 : -EZ.o3(seg(t, 1.65, 2.1)) * 60) / 9) * 9;   // the spiral rises a little to make room
  ctx.drawImage(S, 540 - sp.width / 2, sy);
  const q = seg(t, 1.85, 2.55);
  if (q > 0) {   // the name: square cells switch on in a seeded order
    const N = egCanvas('logo:n', nm.width, nm.height), ng = N.getContext('2d'); ng.clearRect(0, 0, nm.width, nm.height); ng.drawImage(nm, 0, 0);
    const M = egCanvas('logo:m', nm.width, nm.height), mg = M.getContext('2d'); mg.clearRect(0, 0, nm.width, nm.height); mg.fillStyle = '#fff';
    for (let y = 0; y < nm.height; y += 9) for (let x = 0; x < nm.width; x += 9) if ((((x * 73856093) ^ (y * 19349663)) >>> 0) % 1000 / 1000 < q) mg.fillRect(x, y, 9, 9);
    ng.globalCompositeOperation = 'destination-in'; ng.drawImage(M, 0, 0); ng.globalCompositeOperation = 'source-over';
    ctx.drawImage(N, 540 - nm.width / 2, sy + sp.width + 40);
  }
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
    for (let i = 0; i < 4; i++) {
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'egwig' + i); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.022'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(3 + i * 7)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'SourceGraphic'); d.setAttribute('in2', 'n'); d.setAttribute('scale', String(px * 2)); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      // then the black-and-white pass over everything (Flow's images come out greyish): no tint, greys pushed darker,
      // whites to pure white. The user's standing rule for this style; tune the exponent as the videos go.
      const m = document.createElementNS(NS, 'feColorMatrix'); m.setAttribute('type', 'saturate'); m.setAttribute('values', '0');
      const ct = document.createElementNS(NS, 'feComponentTransfer'); ct.setAttribute('color-interpolation-filters', 'sRGB'); m.setAttribute('color-interpolation-filters', 'sRGB');
      for (const ch of ['feFuncR', 'feFuncG', 'feFuncB']) { const fn = document.createElementNS(NS, ch); fn.setAttribute('type', 'gamma'); fn.setAttribute('amplitude', '1.03'); fn.setAttribute('exponent', '1.8'); fn.setAttribute('offset', '0'); ct.appendChild(fn); }
      f.appendChild(t); f.appendChild(d); f.appendChild(m); f.appendChild(ct); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    EG_WIG = document.createElement('canvas'); EG_WIG.width = W; EG_WIG.height = H;
  }
  const g = EG_WIG.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `url(#egwig${Math.floor(F / 3) % 4})`; ctx.drawImage(EG_WIG, 0, 0); ctx.filter = 'none'; ctx.restore();
}
STYLE.post = () => egWiggle(2.6);   // the HotD value: lines tremble; more shears the 1-bit squares

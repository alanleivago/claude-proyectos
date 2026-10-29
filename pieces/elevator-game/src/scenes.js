// =====================================================================
//  SCENES — the elevator game. Flow images (assets/) drawn into a low-res grid, then quantized to the onebit ramp
//  (black, night, wall grey, paper) with a 4x4 Bayer dither; red is the one accent (the cross). Text = aansa atlas.
// =====================================================================
const EG = { w: 216, h: 384 };                 // the pixel grid: 5 px pixels at 1080
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
// flowShot(layers, o): layers = [{ a: 'name.png', x, y, w, h (frame px; default cover), rim }]; o.cam = { z, x, y } zooms
// about a frame point; o.red = [x, y, w, h] frame rect where bright pixels turn red; o.shake = [dx, dy] in cells;
// o.lo / o.hi / o.gamma shape the tone before the ramp; o.night adds the near-black step; o.flat (0..0.9) narrows the dither band.
function flowShot(layers, o = {}) {
  const { w, h } = EG, c = egCanvas('shot', w, h), g = c.getContext('2d'), k = w / W;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const cam = o.cam || { z: 1, x: W / 2, y: H / 2 };
  g.setTransform(k * cam.z, 0, 0, k * cam.z, k * (cam.x - cam.x * cam.z), k * (cam.y - cam.y * cam.z));
  let redMask = null;
  layers.forEach((L, li) => {
    const img = asset(L.a); if (!img) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    let { x, y, w: lw, h: lh } = L;
    if (lw == null) { const s = Math.max(W / iw, H / ih); lw = iw * s; lh = ih * s; x = (W - lw) / 2; y = (H - lh) / 2; }
    if (L.rim) {
      const gw = Math.max(1, Math.round(lw * k * cam.z)), gh = Math.max(1, Math.round(lh * k * cam.z)), r = egRimmed(L.a, gw, gh);
      const px = 2 / (k * cam.z);
      g.drawImage(r, x - px, y - px, lw + 2 * px, lh + 2 * px);
    } else g.drawImage(img, x, y, lw, lh);
    if (li === 0 && o.red) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); redMask = g.getImageData(0, 0, w, h).data; g.restore(); }   // the accent comes from the background only
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
  const im = g.getImageData(0, 0, w, h), d = im.data;
  const lo = o.lo ?? 0.06, hi = o.hi ?? 0.94, gam = o.gamma ?? 1;
  const ramp = o.night ? EG_LUM : [0, 142, 253], fk = 1 / (1 - (o.flat ?? 0.55));   // flat: dither only near the middle of each step
  const red = o.red ? [(cam.x + (o.red[0] - cam.x) * cam.z) * k, (cam.y + (o.red[1] - cam.y) * cam.z) * k, o.red[2] * cam.z * k, o.red[3] * cam.z * k] : null;
  const sx = Math.round(o.shake?.[0] ?? 0), sy = Math.round(o.shake?.[1] ?? 0);
  const out = g.createImageData(w, h), q = out.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const xs = clamp(x - sx, 0, w - 1), ys = clamp(y - sy, 0, h - 1), i = (ys * w + xs) * 4, j = (y * w + x) * 4;
    const r = d[i], gg = d[i + 1], b = d[i + 2];
    let v = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
    if (red && (0.299 * redMask[i] + 0.587 * redMask[i + 1] + 0.114 * redMask[i + 2]) > 140 && v > 0.55 && xs >= red[0] && xs < red[0] + red[2] && ys >= red[1] && ys < red[1] + red[3]) { q[j] = EG_RED[0]; q[j + 1] = EG_RED[1]; q[j + 2] = EG_RED[2]; q[j + 3] = 255; continue; }
    v = clamp((v - lo) / (hi - lo)) ** gam * 253;
    let n = 0; while (n < ramp.length - 2 && v > ramp[n + 1]) n++;
    const f = clamp(((v - ramp[n]) / (ramp[n + 1] - ramp[n]) - 0.5) * fk + 0.5), lv = ramp[f > OB_BAYER[((y & 3) << 2) | (x & 3)] ? n + 1 : n];
    q[j] = q[j + 1] = q[j + 2] = lv === 253 ? 253 : lv; q[j + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, w, h, 0, 0, W, H); ctx.restore();
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
const afW = (s) => [...s].reduce((a, ch) => a + (AF_ADV[AF_CHARS.indexOf(ch)] ?? 6), 0);
function afRun(atl, s, x, y, S) {
  let cx = x;
  for (const ch of s) {
    const i = AF_CHARS.indexOf(ch);
    if (i >= 0) ctx.drawImage(atl, (i % 16) * AF_CW, Math.floor(i / 16) * AF_CH, AF_CW, AF_CH, cx - 2 * S, y - 2 * S, AF_CW * S, AF_CH * S);
    cx += (AF_ADV[i] ?? 6) * S;
  }
}
// afText(lines, cx, y, { S, count, col }) — centred lines, typed to count glyphs (spaces free)
function afText(lines, cx, y, o = {}) {
  const S = o.S ?? 6, lh = 14 * S, white = afAtlas(o.col ?? '#fdfdfd'), black = afAtlas('#000000'); if (!white) return;
  let left = o.count ?? 1e9;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  lines.forEach((ln, li) => {
    let vis = ''; for (const ch of ln) { if (left <= 0) break; vis += ch; if (ch !== ' ') left--; }
    if (!vis) return;
    const x = Math.round((cx - afW(ln) * S / 2) / S) * S, yy = Math.round((y + li * lh) / S) * S;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [2, 2], [1, 2], [2, 1]]) afRun(black, vis, x + dx * S, yy + dy * S, S);
    afRun(white, vis, x, yy, S);
  });
  ctx.restore();
}
const afCount = (t0, rate = 0.045) => (TT < t0 ? 0 : Math.floor((TT - t0) / rate) + 1);
function subsNow() { for (const s of SUBS) if (TT >= s.t0 - 1e-6 && TT < s.t1 - 1e-6) { const f = () => afText(s.lines, 540, 1270, { count: afCount(s.t0) }); DEFER ? DEFER.push(f) : f(); } }

// ---- the floor counter: a World of Horror window (double white frame, inverted title bar, big digits)
function floorBox(n, o = {}) {
  const f = () => {
    const S = 5, x = o.x ?? 70, y = o.y ?? 270, w = 230, h = 215;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(x - S, y - S, w + 2 * S, h + 2 * S);
    ctx.fillStyle = '#fdfdfd'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#000'; ctx.fillRect(x + S, y + S, w - 2 * S, h - 2 * S);
    ctx.fillStyle = '#fdfdfd'; ctx.fillRect(x + 2 * S, y + 2 * S, w - 4 * S, 9 * S);
    ctx.restore();
    const blk = afAtlas('#000000'); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    afRun(blk, 'FLOOR', x + 4 * S, y + 2 * S, 3); ctx.restore();
    afText([String(n)], x + w / 2, y + 16 * S, { S: 10 });
  };
  DEFER ? DEFER.push(f) : f();
}

// ---- shots
const pushIn = (t0, t1, z0, z1, x, y) => ({ z: lerp(z0, z1, EZ.io(seg(TT, t0, t1))), x, y });
function sceneStare() {
  flowShot([{ a: 'heroine.png' }], { cam: pushIn(0, 3, 1.0, 1.08, 540, 860) });
  floorBox(5); subsNow();
}
function sceneOther() {
  flowShot([{ a: 'other10.png' }], { cam: pushIn(3, 6, 1.0, 1.12, 540, 850), red: [440, 780, 200, 260], lo: 0.04, hi: 0.95, gamma: 1.5, night: true });
  floorBox(10); subsNow();
}
function sceneOnly() {
  flowShot([{ a: 'other10.png' }, { a: 'womanback.png', x: 440, y: 790, w: 99, h: 330, rim: true }], { cam: pushIn(6, 9, 1.12, 1.18, 540, 850), red: [440, 780, 200, 260], lo: 0.04, hi: 0.95, gamma: 1.5, night: true });
  floorBox(10); subsNow();
}
function sceneReveal() {
  const sh = TT - 9 < 0.15 ? [(B % 2 ? 2 : -2), (B % 3) - 1] : [0, 0];
  flowShot([{ a: 'reveal.png' }], { night: true, cam: { z: lerp(1.18, 1.05, EZ.o3(seg(TT, 9, 9.4))), x: 540, y: 900 }, shake: sh });
}

// =====================================================================
//  COMMON — overlays, fades, the pixel cats, the network drawing, the landscape projection
// =====================================================================
const SHIFT = 0;   // centred: the user prefers a centred frame over clearing the phone UI strip
const OV = (f) => { const g = () => { ctx.save(); ctx.translate(SHIFT, 0); f(); ctx.restore(); }; DEFER ? DEFER.push(g) : g(); };
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const topTag = (str, a, c = BP.soft) => { if (a > 0) OV(() => bpText(str, 540, 322, 46, c, { font: BP.mono, alpha: a, spacing: 2 })); };
const caption = (lines, a, y = 1400, size = 74, o = {}) => { if (a > 0) OV(() => bpLines(lines, 540, y, size, BP.text, a, o)); };
const fmt = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);
const sig = (z) => 1 / (1 + Math.exp(-z));

// ---- pixel cats (X body, E eyes, N nose, M mouth line)
const CAT_A = [
  '..X..........X..',
  '.XXX........XXX.',
  '.XXXX......XXXX.',
  '.XXXXXXXXXXXXXX.',
  'XXXXXXXXXXXXXXXX',
  'XXXEEXXXXXXEEXXX',
  'XXXEEXXXXXXEEXXX',
  'XXXXXXXNNXXXXXXX',
  'XXXXXXXXXXXXXXXX',
  '.XXXXMXXXXMXXXX.',
  '..XXXXMMMMXXXX..',
  '...XXXXXXXXXX...',
];
const CAT_B = [   // a different cat: one ear folded, eyes half closed, sitting with a tail
  '.X...........X.....',
  'XXX.........XX.....',
  'XXXX.......XXX.....',
  'XXXXXXXXXXXXXX.....',
  'XXXXXXXXXXXXXXX....',
  'XXEEEXXXXXEEEXX....',
  'XXXXXXXNNXXXXXX....',
  '.XXXXXMXXMXXXX.....',
  '..XXXXXMMXXXX......',
  '..XXXXXXXXXXXX.....',
  '.XXXXXXXXXXXXXX..XX',
  '.XXXXXXXXXXXXXX.XX.',
  '.XXXXXXXXXXXXXXXX..',
  '..XXXX....XXXXX....',
];
// cells of a cat: [{ x, y, k }] in units, centred
function catCells(P) { const out = [], h = P.length, w = P[0].length; P.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') out.push({ x: i - (w - 1) / 2, y: j - (h - 1) / 2, k: ch }); })); return out; }
const catColor = (k) => (k === 'E' || k === 'N' ? BP.magenta : k === 'M' ? '#0e5a3e' : BP.mint);
function drawCat(P, cx, cy, cell, a = 1, o = {}) {
  catCells(P).forEach((c, i) => {
    const R = RNG('catin', P.length, i), u = o.build != null ? EZ.o3(seg(o.build, R.r(0, 0.5), R.r(0.5, 1))) : 1;
    if (u <= 0) return;
    const sx = R.r(-600, 600), sy = R.r(-900, 900), x = lerp(cx + sx, cx + c.x * cell, u), y = lerp(cy + sy, cy + c.y * cell, u);
    const bl = c.k === 'E' && o.blink ? o.blink : 0, bob = o.bob ? Math.sin(TT * 2.2 + c.x * 0.15) * o.bob : 0;
    ctx.save(); ctx.globalAlpha = clamp(a * u); ctx.fillStyle = bl > 0.5 ? BP.mint : catColor(c.k);
    const s = cell * 0.86; trace(rrectPts(x - s / 2, y + bob - s / 2, s, s, s * 0.18, 3), true); ctx.fill(); ctx.restore();
  });
}

// ---- the network: node positions and drawing
const NL = [2, 10, 10, 1];
function netPos(cy = 960, gapY = 250, spread = 78) {   // [[x, y], ...] per layer, top to bottom
  return NL.map((n, l) => Array.from({ length: n }, (_, i) => [540 + (i - (n - 1) / 2) * (n === 2 ? 240 : spread), cy + (l - 1.5) * gapY]));
}
// o: { a, show[l] 0..1 (layer reveal), Wt (weights), flick (0..1 random flicker), fwd (signal phase 0..1 or null),
//      back (0..1 blame wave from output to input), blame (gradient), x (input for activations), cy, gapY }
function drawNet(o) {
  const P = netPos(o.cy, o.gapY, o.spread), Wt = o.Wt || NN.W0, a = o.a ?? 1, show = o.show || [1, 1, 1, 1];
  const A = o.x ? NN.forward(Wt, o.x) : null;
  let gmax = 1e-9; if (o.blame) o.blame.forEach((l) => l.m.forEach((r) => r.forEach((v) => (gmax = Math.max(gmax, Math.abs(v))))));
  ctx.save(); ctx.lineCap = 'round';
  for (let l = 0; l < 3; l++) {
    const vis = Math.min(show[l], show[l + 1]); if (vis <= 0) continue;
    for (let j = 0; j < NL[l + 1]; j++) for (let i = 0; i < NL[l]; i++) {
      let w = Wt[l].m[j][i];
      if (o.flick) w = lerp(w, RNG('flick', l, j, i, Math.floor(TT * 8)).r(-2.5, 2.5), o.flick);
      const [x0, y0] = P[l][i], [x1, y1] = P[l + 1][j];
      const f = clamp(vis * 1.4 - (i + j) / (NL[l] + NL[l + 1]) * 0.4);
      let c = BP.yellow, al = 0.12 + 0.45 * clamp(Math.abs(w) / 2.5), lw = 1.2 + 2.2 * clamp(Math.abs(w) / 2.5);
      // blame: the backward wave reaches layer l when back passes its depth
      if (o.blame && o.back != null) {
        const reach = clamp((o.back - (2 - l) / 3) * 3), g = Math.abs(o.blame[l].m[j][i]) / gmax;
        if (reach > 0) { c = bpMix(BP.yellow, BP.magenta, reach); al = lerp(al, 0.15 + 0.85 * Math.sqrt(g), reach); lw = lerp(lw, 1 + 5 * Math.sqrt(g), reach); }
      }
      ctx.globalAlpha = clamp(a * al); ctx.strokeStyle = c; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); ctx.stroke();
    }
  }
  // signals forward: one pulse per edge group travelling down
  if (o.fwd != null) for (let l = 0; l < 3; l++) {
    const u = clamp(o.fwd * 3 - l); if (u <= 0 || u >= 1) continue;
    for (let j = 0; j < NL[l + 1]; j++) for (let i = 0; i < NL[l]; i++) if ((i + j * 3) % 3 === 0) {
      const [x0, y0] = P[l][i], [x1, y1] = P[l + 1][j]; bpDot(lerp(x0, x1, u), lerp(y0, y1, u), 4, BP.mint, a * 0.9);
    }
  }
  // the blame pulses travelling back up
  const bb = o.back != null ? (o.back > 1 ? o.back - 1 : o.back) : null;
  if (bb != null) for (let l = 2; l >= 0; l--) {
    const u = clamp(bb * 3 - (2 - l)); if (u <= 0 || u >= 1) continue;
    for (let j = 0; j < NL[l + 1]; j++) for (let i = 0; i < NL[l]; i++) if ((i * 2 + j) % 2 === 0) {
      const [x0, y0] = P[l][i], [x1, y1] = P[l + 1][j]; bpGlow(lerp(x1, x0, u), lerp(y1, y0, u), 18, BP.magenta, a * 0.5); bpDot(lerp(x1, x0, u), lerp(y1, y0, u), 7, BP.magenta, a);
    }
  }
  // nodes
  NL.forEach((n, l) => { if (show[l] <= 0) return; for (let i = 0; i < n; i++) {
    const [x, y] = P[l][i], s = EZ.back(clamp(show[l] * 1.6 - i / n * 0.6)); if (s <= 0) continue;
    const act = A ? (l === 3 ? A[3][0] * 2 - 1 : A[l][i]) : 0, r = (l === 3 ? 26 : l === 0 ? 24 : 17) * s;
    let c = l === 3 && o.outC ? o.outC : BP.mint;
    if (o.back != null && clamp((o.back - (3 - l) / 3) * 3) > 0 && l > 0) c = bpMix(BP.mint, BP.magenta, 0.6);
    bpGlow(x, y, r * 2.2, c, a * (0.25 + 0.35 * Math.abs(act)));
    ctx.globalAlpha = clamp(a); ctx.fillStyle = BP.ground; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.stroke();
    ctx.globalAlpha = clamp(a * (0.25 + 0.75 * Math.abs(act))); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.fill();
  } });
  ctx.restore();
  return P;
}

// ---- the landscape: NN.surf projected in 3D, slowly turning; height = error
const SURF = { cx: 540, cy: 1060, R: 330, H: 400 };
function surfZ(gx, gy) { const s = NN.surf, n = NN.NG; const x = clamp(gx, 0, n), y = clamp(gy, 0, n), i = Math.min(n - 1, Math.floor(x)), j = Math.min(n - 1, Math.floor(y)), u = x - i, v = y - j;
  return lerp(lerp(s[j][i], s[j][i + 1], u), lerp(s[j + 1][i], s[j + 1][i + 1], u), v); }
const ZMAX = Math.max(...NN.surf.flat());
function surfProj(gx, gy, z, rot, k = 1) {   // grid coords (0..NG), error z -> screen
  const n = NN.NG, X = (gx / n - 0.5) * 2, Y = (gy / n - 0.5) * 2, c = Math.cos(rot), s = Math.sin(rot);
  const xr = X * c - Y * s, yr = X * s + Y * c;
  return [SURF.cx + xr * SURF.R * k, SURF.cy + yr * SURF.R * 0.5 * k - Math.pow(z / ZMAX, 0.6) * SURF.H * k];
}
const pathGrid = (p) => [(p[0] - (NN.ow[0] - NN.RANGE)) / (2 * NN.RANGE) * NN.NG, (p[1] - (NN.ow[1] - NN.RANGE)) / (2 * NN.RANGE) * NN.NG];
function heightColor(u) { return u < 0.5 ? bpMix(BP.mint, BP.yellow, u * 2) : bpMix(BP.yellow, BP.magenta, (u - 0.5) * 2); }
function drawSurface(a, rot, k = 1, grow = 1) {
  const n = NN.NG, quads = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const z = (NN.surf[j][i] + NN.surf[j][i + 1] + NN.surf[j + 1][i] + NN.surf[j + 1][i + 1]) / 4 * grow;
    const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([x, y]) => surfProj(x, y, NN.surf[y][x] * grow, rot, k));
    const depth = P.reduce((s, p) => s + p[1], 0) + z * 0;   // painter's order: far (higher on screen) first
    quads.push({ P, z, depth: (i - n / 2) * Math.sin(rot) + (j - n / 2) * Math.cos(rot) });
  }
  quads.sort((p, q) => p.depth - q.depth);
  ctx.save(); ctx.lineJoin = 'round';
  for (const q of quads) {
    const u = Math.pow(q.z / ZMAX, 0.6), c = heightColor(u);
    ctx.beginPath(); q.P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.globalAlpha = clamp(a * 0.85); ctx.fillStyle = bpMix(c, BP.ground, 0.55); ctx.fill();
    ctx.globalAlpha = clamp(a * 0.9); ctx.strokeStyle = c; ctx.lineWidth = 1.3; ctx.stroke();
  }
  ctx.restore();
}

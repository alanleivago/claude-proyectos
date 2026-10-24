// =====================================================================
//  SCENES — An ant with two rules builds a highway (voltreal, Bitstory). World 1080x1920, TT on 1s.
//  A real Langton's ant, run in code: a 2.5D board of bits (amber = on), a cartoon ant, the counter,
//  the highway; random starts; logic circuits. Karaoke captions from VOICE (kit vrCaptions).
// =====================================================================
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));
const OV = (f) => { if (DEFER) DEFER.push(f); else f(); };
const KEYS = new Set(['ant', 'two', 'highway', 'bit', 'right', 'left', 'forward', 'slowly', 'tidy', 'breaks', 'thousand', 'nothing', 'look', 'diagonally', 'hundred', 'forever', "langton's", '1986', 'alive', 'nobody', 'again', 'same', 'proven', 'circuit', 'computer', 'turn', 'forty', 'comments']);
const BX = 540, BY = 960;   // the board's centre on screen

function camAtT() {
  let i = 0; while (i + 1 < TB.length && TT >= TB[i + 1]) i++;
  const u = EZ.io(clamp((TT - TB[i]) / Math.max(0.5, (i + 1 < TB.length ? TB[i + 1] : DURATION) - TB[i])));
  const push = 0.06 * (i % 2 ? 1 - u : u);
  const sh = TT > HIT ? Math.exp(-(TT - HIT) * 5) * 12 : 0;
  return { cx: 540 + 14 * Math.sin(TT * 0.27), cy: 960 + 10 * Math.sin(TT * 0.21 + 1), z: (1 + push) * (1 + 0.015 * Math.sin(TT * 0.37)), sx: sh * Math.sin(TT * 91), sy: sh * Math.cos(TT * 77) };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }
function rr(x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function card(x, y, w, h, a, f) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.filter = 'blur(26px)'; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 8, y - h / 2 + 22, w - 16, h, 34); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, 'rgba(48,48,52,0.96)'); g.addColorStop(1, 'rgba(26,26,30,0.96)');
  rr(x - w / 2, y - h / 2, w, h, 34, g, 'rgba(255,255,255,0.10)', 2);
  f(x - w / 2, y - h / 2, w, h);
  ctx.restore();
}
function pill(x, y, str, bg, fg = '#fff', a = 1, size = 34) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px ${VR_SANS}`; const w = ctx.measureText(str).width + size * 1.1;
  rr(x - w / 2, y - size * 0.95, w, size * 1.5, size * 0.75, bg); vrText(str, x, y + size * 0.15, size, fg, { weight: 700 }); ctx.restore();
}

// =====================================================================
//  the ant, run for real: every step's place, heading, and whether it switched a bit on
// =====================================================================
const DXS = [0, 1, 0, -1], DYS = [-1, 0, 1, 0];
const key = (x, y) => x * 4096 + y;
function antRun(start, n) {
  const on = new Set(start.map(([x, y]) => key(x, y))), X = new Int16Array(n + 1), Y = new Int16Array(n + 1), D0 = new Int8Array(n + 1), D1 = new Int8Array(n + 1), ON = new Uint8Array(n);
  const mv = new Uint8Array(n); let x = 0, y = 0, d = 0;
  let bx0 = 0, bx1 = 0, by0 = 0, by1 = 0; const BB = new Int16Array(4 * (n + 1));
  for (let s = 0; s < n; s++) {
    X[s] = x; Y[s] = y; D0[s] = d; const k = key(x, y);
    if (on.has(k)) { on.delete(k); d = (d + 3) % 4; ON[s] = 0; mv[s] = 0; } else { on.add(k); d = (d + 1) % 4; ON[s] = 1; mv[s] = 1; }
    D1[s] = d; x += DXS[d]; y += DYS[d];
    bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); BB.set([bx0, bx1, by0, by1], 4 * (s + 1));
  }
  X[n] = x; Y[n] = y; D0[n] = d; D1[n] = d;
  for (const [sx, sy] of start) { bx0 = Math.min(bx0, sx); bx1 = Math.max(bx1, sx); by0 = Math.min(by0, sy); by1 = Math.max(by1, sy); }
  let last = -1;   // the highway starts right after the last step that breaks the 104-step repeat
  for (let i = 0; i < n - 104; i++) if (mv[i] !== mv[i + 104]) last = i;
  const onset = last + 1;
  return { start, X, Y, D0, D1, ON, BB, n, onset };
}
const MAIN = antRun([], 13000);
function scatter(seed, n = 30, span = 6) { const R = RNG('start', seed), out = [], seen = new Set(); while (out.length < n) { const x = Math.round(R.r(-span, span)), y = Math.round(R.r(-span, span)); if (!seen.has(key(x, y))) { seen.add(key(x, y)); out.push([x, y]); } } return out; }
const ALT = [1, 2, 3].map((s) => antRun(scatter(s), 16000));
// the bits that are on after k whole steps (cached)
const CELLS_CACHE = new Map();
function cellsAt(run, k) {
  k = Math.max(0, Math.min(run.n, Math.floor(k)));
  const ck = run.n + ':' + run.start.length + ':' + k;
  if (CELLS_CACHE.has(ck)) return CELLS_CACHE.get(ck);
  const on = new Map(); for (const [x, y] of run.start) on.set(key(x, y), -1);
  for (let s = 0; s < k; s++) { const kk = key(run.X[s], run.Y[s]); if (run.ON[s]) on.set(kk, s); else on.delete(kk); }
  if (CELLS_CACHE.size > 6) CELLS_CACHE.clear();
  CELLS_CACHE.set(ck, on); return on;
}
// the ant's pose at a fractional step: flip (0–.3), turn (.3–.65), walk (.65–1)
function antPose(run, n) {
  const k = Math.max(0, Math.min(run.n - 1, Math.floor(n))), f = n - k;
  const a0 = run.D0[k] * Math.PI / 2, a1 = a0 + (run.D1[k] - run.D0[k] === 1 || run.D1[k] - run.D0[k] === -3 ? 1 : -1) * Math.PI / 2;
  const tu = EZ.io(clamp((f - 0.3) / 0.35)), wk = EZ.io(clamp((f - 0.65) / 0.35));
  return { x: lerp(run.X[k], run.X[k + 1], wk), y: lerp(run.Y[k], run.Y[k + 1], wk), ang: lerp(a0, a1, tu), flip: clamp(f / 0.3), k, walking: wk > 0 && wk < 1 };
}

// =====================================================================
//  the clock: how many steps at time TT (slow for the rules, a flood in the chaos, a stop at 9,977)
// =====================================================================
function stepsAt(t) {
  const K = [
    [0, 0], [VW('right', 'switches') - 0.2, 0], [VW('right', 'switches') + 1.6, 1],
    [S('left') + 0.1, 1], [S('left') + 1.0, 4], [VW('left', 'switches') - 0.2, 4], [VW('left', 'switches') + 1.6, 5],
    [VW('forward', 'moves') - 0.3, 5], [VW('forward', 'moves') + 1.0, 6],
    [S('slow') + 0.5, 6], [VL('slow').t1, 12],
    [S('tidy') + 0.3, 12], [VL('tidy').t1, 420],
    [VW('breaks', 'thousand') - 0.2, 1000], [VW('breaks', 'five') + 0.4, 5000], [VL('breaks').t1, 7600],
    [VL('bet').t1, 9100], [VL('step').t1 - 0.2, 9977], [HIT, 9977],
    [VL('look').t1, 10900], [S('langton') + 0.6, 12600], [DURATION, 12600],
  ];
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) { const [t0, n0] = K[i - 1], [t1, n1] = K[i]; const u = clamp((t - t0) / Math.max(0.01, t1 - t0));
    const e = n1 - n0 > 200 ? (i === K.length - 2 || t0 >= HIT ? u : EZ.io(u)) : u; return n0 + (n1 - n0) * e; }
  return K[K.length - 1][1];
}

// =====================================================================
//  drawing: the board slab, the bits, the ant
// =====================================================================
function boardSlab(x0, y0, w, h, a) {
  if (a <= 0) return;
  vrSlab(x0 + w / 2, y0 + h / 2, w, h, 22, 36, '#26262a', '#18181b', '#0c0c0e', { a });
}
// draw a run's bits in a view {cx, cy, cs} clipped to a rect; hot = steps after which bits glow gold
function drawBits(run, n, view, clip, a, o = {}) {
  const { cx, cy, cs } = view;
  const sx = (gx) => clip.x + clip.w / 2 + (gx - cx) * cs, sy = (gy) => clip.y + clip.h / 2 + (gy - cy) * cs;
  if (a <= 0) return { sx, sy };
  const cells = cellsAt(run, n + 0.85);   // a step's own flip shows from 15 % into it
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.roundRect(clip.x, clip.y, clip.w, clip.h, 28); ctx.clip();
  // the empty squares (only when they are big enough to read)
  if (cs >= 16) {
    const gx0 = Math.floor(cx - clip.w / 2 / cs) - 1, gx1 = Math.ceil(cx + clip.w / 2 / cs) + 1, gy0 = Math.floor(cy - clip.h / 2 / cs) - 1, gy1 = Math.ceil(cy + clip.h / 2 / cs) + 1;
    const pad = Math.max(1.5, cs * 0.07), al = clamp((cs - 16) / 30);
    for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
      const x = sx(gx) - cs / 2 + pad, y = sy(gy) - cs / 2 + pad, s = cs - 2 * pad;
      ctx.globalAlpha = a * (0.55 + 0.45 * al); ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.roundRect(x, y, s, s, cs * 0.12); ctx.fill();
      if (al > 0) { ctx.globalAlpha = a * al * 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x + s, y + s); ctx.stroke(); }
    }
  } else {
    ctx.globalAlpha = a * 0.25; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let gx = Math.floor(cx - clip.w / 2 / cs); gx < cx + clip.w / 2 / cs; gx += cs < 8 ? 4 : 2) { const x = sx(gx) - cs / 2; ctx.beginPath(); ctx.moveTo(x, clip.y); ctx.lineTo(x, clip.y + clip.h); ctx.stroke(); }
  }
  // the bits that are on: a soft glow pass, then the tiles
  const hot = o.hot ?? Infinity, pad = Math.max(0.6, cs * 0.07);
  for (const pass of [0, 1]) {
    for (const [k, s] of cells) {
      const gx = Math.round(k / 4096), gy = k - gx * 4096, x = sx(gx), y = sy(gy);
      if (x < clip.x - cs || x > clip.x + clip.w + cs || y < clip.y - cs || y > clip.y + clip.h + cs) continue;
      const isHot = s >= hot, isStart = s === -1, isWin = o.win && s >= o.win[0] && s < o.win[1];
      const fresh = o.flash !== false && s >= 0 && n - s < 1.5 && cs > 20 ? 1 - (n - s) / 1.5 : 0;
      const c = isStart ? VR.blue : isHot ? '#fff1cf' : VR.amber;
      if (pass === 0) { ctx.globalAlpha = a * (0.22 + 0.5 * fresh + (isHot ? 0.25 : 0)); ctx.fillStyle = isHot ? VR.gold : c; const g = cs * (0.5 + 0.6 * fresh); ctx.fillRect(x - g, y - g, 2 * g, 2 * g); }
      else {
        const s2 = cs - 2 * pad; ctx.globalAlpha = a;
        if (cs >= 20) { const gr = ctx.createLinearGradient(0, y - s2 / 2, 0, y + s2 / 2); gr.addColorStop(0, isStart ? '#7fb0ff' : '#ffe2a0'); gr.addColorStop(1, c); ctx.fillStyle = gr; } else ctx.fillStyle = c;
        ctx.beginPath(); ctx.roundRect(x - s2 / 2, y - s2 / 2, s2, s2, cs * 0.14); ctx.fill();
        if (isWin) { ctx.strokeStyle = VR.blue; ctx.lineWidth = Math.max(1.5, cs * 0.12); ctx.stroke(); }
      }
    }
  }
  ctx.restore();
  return { sx, sy };
}
// a cartoon ant seen from above, heading ang (0 = up), length s
function ant(x, y, ang, s, a = 1, walk = 0) {
  if (a <= 0) return;
  vrShadow(x + s * 0.06, y + s * 0.1, s * 0.75, s * 0.95, 0.5 * a, Math.max(4, s * 0.12));
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang);
  const ph = walk * TAU, lw = Math.max(1.5, s * 0.035);
  ctx.strokeStyle = '#1a1210'; ctx.lineCap = 'round'; ctx.lineWidth = lw;
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {   // six legs, alternating as it walks
    const sw = Math.sin(ph + i * 2.1 + (side > 0 ? Math.PI : 0)) * 0.08 * s, y0 = -0.05 * s + i * 0.06 * s;
    ctx.beginPath(); ctx.moveTo(side * 0.08 * s, y0); ctx.lineTo(side * 0.3 * s, y0 - 0.1 * s + (i - 1) * 0.1 * s + sw); ctx.lineTo(side * 0.42 * s, y0 + (i - 1) * 0.22 * s + sw); ctx.stroke();
  }
  // antennae
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(side * 0.05 * s, -0.36 * s); ctx.quadraticCurveTo(side * 0.12 * s, -0.56 * s, side * 0.24 * s, -0.6 * s + Math.sin(TT * 5 + side) * 0.02 * s); ctx.stroke(); }
  const blob = (cy, rx, ry) => { const g = ctx.createRadialGradient(-rx * 0.35, cy - ry * 0.4, rx * 0.1, 0, cy, Math.max(rx, ry) * 1.1); g.addColorStop(0, '#6b4a3c'); g.addColorStop(0.5, '#2c1d18'); g.addColorStop(1, '#0d0807'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, cy, rx, ry, 0, 0, TAU); ctx.fill(); };
  blob(0.3 * s, 0.2 * s, 0.27 * s); blob(-0.03 * s, 0.11 * s, 0.13 * s); blob(-0.27 * s, 0.15 * s, 0.13 * s);
  // gloss and the big cartoon eyes
  ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.beginPath(); ctx.ellipse(-0.06 * s, 0.22 * s, 0.05 * s, 0.09 * s, -0.3, 0, TAU); ctx.fill();
  for (const side of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(side * 0.07 * s, -0.32 * s, 0.055 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(side * 0.07 * s, -0.34 * s, 0.028 * s, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// =====================================================================
//  the main board: view, bits, ant, counter
// =====================================================================
const CLIP = { x: 90, y: 520, w: 900, h: 860 };
function fitView(run, n, capCs, box = 860) {   // a view that holds everything drawn up to a little ahead of n
  const k = Math.min(run.n, Math.floor(n) + 300), b = run.BB.subarray(4 * k, 4 * k + 4);
  const w = b[1] - b[0] + 6, h = b[3] - b[2] + 6, cs = Math.min(capCs, box / Math.max(w, h));
  return { cx: (b[0] + b[1]) / 2, cy: (b[2] + b[3]) / 2, cs };
}
function capAt(t) { return springTrack([[0, 150], [S('tidy') + 0.2, 150], [VL('tidy').t1, 40], [S('breaks'), 26], [VL('breaks').t1, 12], [DURATION, 12]], SPRING.smooth); }
function beatBoard() {
  const a = win(0.1, S('langton') + 0.3, 0.4) * (1 - 0.65 * win(S('langton') + 0.2, S('why'), 0.3)); if (a <= 0) return;
  const n = stepsAt(TT), ba = fadeIn(S('board') + 0.1, 0.5);
  // the view: centred on the ant while the rules are shown, then on everything drawn so far
  const f = fitView(MAIN, n, capAt(TT)), p = antPose(MAIN, n), early = 1 - EZ.io(clamp((TT - S('tidy')) / 1.5));
  const view = { cx: lerp(f.cx, p.x, early), cy: lerp(f.cy, p.y, early), cs: lerp(f.cs, capAt(TT), early) };
  ctx.save(); const dz = 1 + 0.08 * (1 - EZ.o3(ba)); ctx.translate(BX, BY); ctx.scale(dz, dz); ctx.translate(-BX, -BY);
  boardSlab(CLIP.x, CLIP.y, CLIP.w, CLIP.h, a * ba);
  const { sx, sy } = drawBits(MAIN, n, view, CLIP, a * ba, { hot: TT >= HIT ? MAIN.onset : Infinity, win: TT > S('repeat') && TT < S('langton') ? [Math.floor(n) - 104, Math.floor(n)] : null });
  ctx.restore();
  // the ant: as big as a square up close, never smaller than a visible bug; a halo when the board is far
  const hero = 1 - EZ.io(clamp((TT - S('board') - 0.2) / 1.0)), as = lerp(Math.max(56, view.cs * (view.cs > 60 ? 1.35 : 0.95)), 300, hero), ax = lerp(sx(p.x), 540, hero), ay = lerp(sy(p.y), 1000, hero);
  if (view.cs < 30) vrHalo(ax, ay, 60, '255,210,140', a * 0.8);
  ant(ax, ay, p.ang + hero * 0.15 * Math.sin(TT * 1.3), as, a * fadeIn(0.3, 0.5), TT * (n < 20 ? 1.6 : 6) * (hero > 0.5 ? 0.3 : 1));
  // the flip flash on the square under the ant (rules)
  if (n < 13 && p.flip < 1 && p.flip > 0) vrHalo(sx(MAIN.X[p.k]), sy(MAIN.Y[p.k]), view.cs * 0.8, MAIN.ON[p.k] ? '255,200,90' : '160,170,190', a * (1 - p.flip));
  // turn arrows for the rules
  const ra = win(VW('right', 'turns') - 0.2, S('left'), 0.2), la = win(VW('left', 'turns') - 0.2, S('forward'), 0.2), fa = win(VW('forward', 'moves') - 0.2, S('slow'), 0.2);
  OV(() => {
    if (ra > 0) { vrGlow(vaArc(ax, ay, as * 0.85, -2.2, -0.6, 18), VR.amber, 5, ra); vrText('↻ right', ax + as * 0.9, ay - as * 0.9, 40, VR.amber, { weight: 700, a: ra, glow: 14 }); }
    if (la > 0) { vrGlow(vaArc(ax, ay, as * 0.85, -2.5, -0.9, 18).reverse(), VR.blue, 5, la, {}); vrText('↺ left', ax - as * 0.9, ay - as * 0.9, 40, '#8fb8ff', { weight: 700, a: la, glow: 14 }); }
    if (fa > 0) vrText('↑ forward', ax, ay - as * 1.05, 40, VR.ink, { weight: 700, a: fa, glow: 14 });
  });
  // the two rules as cards under the board
  const rk = win(S('right'), S('tidy') + 0.4, 0.3) * a;
  if (rk > 0) OV(() => {
    const on = TT < S('left') || (TT >= S('slow') && MAIN.ON[p.k]), off = (TT >= S('left') && TT < S('forward')) || (TT >= S('slow') && !MAIN.ON[p.k]);
    pill(300, 1460, 'off → on · ↻ right', on ? 'rgba(245,183,74,0.95)' : 'rgba(60,60,64,0.9)', on ? '#1a1206' : '#cfcfcf', rk, 32);
    pill(780, 1460, 'on → off · ↺ left', off ? 'rgba(59,130,246,0.95)' : 'rgba(60,60,64,0.9)', '#fff', rk * fadeIn(S('left'), 0.3), 32);
  });
  // the counter
  const ca = win(S('tidy') + 0.2, S('langton') + 0.2, 0.3) * a;
  if (ca > 0) OV(() => { const s = Math.floor(n), pk = 1 + 0.25 * flashK(VL('step').t1 - 0.2, 0.5) + 0.15 * flashK(HIT, 0.5);
    vrText('STEP', 540, 1410, 28, VR.grey, { weight: 700, a: ca, letter: 4 });
    vrText(s.toLocaleString('en-US'), 540, 1490, 76 * pk, TT >= VL('step').t1 - 0.2 ? VR.gold : VR.ink, { weight: 800, a: ca, glow: TT >= VL('step').t1 - 0.2 ? 24 : 8, glowC: TT >= VL('step').t1 - 0.2 ? VR.gold : 'rgba(0,0,0,0.8)' }); });
  // the intro: no eyes, no brain, no memory; 2 rules
  const ia = win(VW('ant', 'see') - 0.2, S('board') + 0.2, 0.3);
  if (ia > 0) OV(() => { [['no eyes', 270, 'see'], ['no brain', 540, 'think'], ['no memory', 810, 'remember']].forEach(([w, x, k]) => pill(x, 1460, w, 'rgba(60,60,64,0.9)', '#ddd', ia * popS(VW('ant', k) - 0.1), 30)); });
  const ta = win(VW('ant', 'two') - 0.1, S('board'), 0.3);
  if (ta > 0) OV(() => vrText('2 rules', 540, 640, 96, VR.amber, { weight: 800, a: ta * popS(VW('ant', 'two') - 0.1), glow: 26 }));
  // the bet: "ends in nothing?" and the highway's arrow → ∞
  if (TT >= HIT && TT < S('langton')) {
    const ha = fadeIn(HIT + 0.6, 0.4) * fadeOut(S('langton'), 0.3);
    const d = MAIN.X[MAIN.n] - MAIN.X[MAIN.onset], e = MAIN.Y[MAIN.n] - MAIN.Y[MAIN.onset], L = Math.hypot(d, e), ux = d / L, uy = e / L;
    OV(() => { const x0 = ax + ux * 60, y0 = ay + uy * 60; vrGlow([[x0, y0], [x0 + ux * 150, y0 + uy * 150]], VR.gold, 5, ha * (0.6 + 0.4 * Math.sin(TT * 6)));
      if (TT > VW('repeat', 'forever') - 0.2) vrText('∞', x0 + ux * 200, y0 + uy * 200 + 30, 90, VR.gold, { weight: 700, a: fadeIn(VW('repeat', 'forever') - 0.2, 0.3), glow: 24 }); });
  }
  const pa = win(VW('repeat', 'hundred') - 0.2, S('langton'), 0.3);
  if (pa > 0) OV(() => { pill(540, 640, '104 steps, repeating', 'rgba(59,130,246,0.95)', '#fff', pa, 36);
    ['again', 'again'].forEach((w, i) => { const t = VW('repeat', 'again', i + 1) - 0.1; vrText(`×${i + 2}`, 540 + (i ? 120 : -120), 740, 56, VR.gold, { weight: 800, a: pa * popS(t), glow: 16 }); }); });
}
function vaArc(cx, cy, r, a0, a1, n) { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; }

// =====================================================================
//  Langton, 1986 · nobody knows why · random starts · the same highway
// =====================================================================
function beatLangton() {
  const a = win(S('langton') + 0.1, S('why') + 0.1, 0.3); if (a <= 0) return;
  OV(() => card(540, 960, 760, 420, a, (x, y, w, h) => {
    vrText("Langton's ant", 540, y + 120, 72, VR.ink, { weight: 800 });
    vrText('Chris Langton · 1986', 540, y + 200, 40, VR.amber, { weight: 700, a: fadeIn(VW('langton', 'chris') - 0.1, 0.3) });
    vrText('the simplest rule', 540, y + 290, 36, VR.grey, { weight: 600, a: fadeIn(VW('langton', 'simplest') - 0.1, 0.3) });
    vrText('that behaves like something alive', 540, y + 340, 36, VR.grey, { weight: 600, a: fadeIn(VW('langton', 'alive') - 0.4, 0.3) });
  }));
}
function beatWhy() {
  const a = win(S('why') + 0.1, VW('circuit', 'logic') - 0.2, 0.35); if (a <= 0) return;
  // the main board resets to a random start (blue = squares you switched on), then runs into a highway
  const A = ALT[0], tA = VW('any', 'switch') - 0.1, tR = VW('any', 'happens') - 0.3, sameT = S('same');
  const solo = fadeOut(sameT + 0.2, 0.4), q = win(S('why') + 0.2, S('any') + 0.2, 0.3);
  if (solo > 0) {
    const n = TT < tR ? 0 : lerp(0, A.onset + 1600, EZ.i2(clamp((TT - tR) / (sameT + 0.3 - tR))));
    const v = fitView(A, n, 70), shown = fadeIn(tA, 0.4);
    boardSlab(CLIP.x, CLIP.y, CLIP.w, CLIP.h, a * solo);
    const { sx, sy } = drawBits(A, TT < tA ? 0 : n, v, CLIP, a * solo * shown, { hot: A.onset, flash: false });
    const p = antPose(A, n); ant(sx(p.x), sy(p.y), p.ang, Math.max(48, v.cs), a * solo, TT * 6);
    if (q > 0) OV(() => vrText('?', 540, 1050, 260, VR.ink, { weight: 800, a: q * a, glow: 40, glowC: 'rgba(255,200,120,0.7)' }));
  }
  // the same highway, three times: longer, shorter, every time
  const ta = fadeIn(sameT + 0.1, 0.4) * a;
  if (ta > 0) ALT.forEach((R, i) => {
    const x = 255 + i * 280, cl = { x: x - 130, y: 760, w: 260, h: 420 }, t0 = sameT + 0.2 + i * 0.25;
    const n = lerp(0, R.onset + 1800, EZ.i2(clamp((TT - t0) / (VL('same').t1 - 0.6 - t0))));
    const k = popS(t0 - 0.1) * ta;
    boardSlab(cl.x, cl.y, cl.w, cl.h, k);
    const v = fitView(R, n, 24, cl.w - 30);
    const { sx, sy } = drawBits(R, n, v, cl, k, { hot: R.onset, flash: false });
    const p = antPose(R, n); vrHalo(sx(p.x), sy(p.y), 30, '255,210,140', k); ant(sx(p.x), sy(p.y), p.ang, 34, k, TT * 6);
    OV(() => { const done = n >= R.onset; vrText(done ? `highway at ${R.onset.toLocaleString('en-US')}` : 'chaos…', x, 1240, 22, done ? VR.gold : VR.grey, { weight: 700, a: k }); });
  });
  if (ta > 0) OV(() => { pill(540, 1350, 'the same highway. every time.', 'rgba(245,183,74,0.95)', '#1a1206', ta * fadeIn(VW('same', 'every') - 0.1, 0.3), 34);
    vrText('never proven', 540, 1470, 44, VR.red, { weight: 800, a: ta * fadeIn(VW('same', 'proven') - 0.2, 0.3), glow: 16 }); });
}

// =====================================================================
//  a logic circuit · a whole computer · two rules, one bit, forty years
// =====================================================================
function gate(x, y, kind, a, lit) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(1.45, 1.45); ctx.translate(-x, -y); gateBody(x, y, kind, a, lit); ctx.restore();
}
function gateBody(x, y, kind, a, lit) {
  vrSlab(x, y, 220, 150, 16, 22, '#2a2a2e', '#1b1b1e', '#0c0c0e', { a });
  const c = lit > 0.5 ? VR.amber : '#9a9aa0', P = [];
  if (kind === 'AND') { P.push([x - 45, y - 40], [x, y - 40]); for (let i = 0; i <= 12; i++) { const an = -Math.PI / 2 + Math.PI * i / 12; P.push([x + 40 * Math.cos(an), y + 40 * Math.sin(an)]); } P.push([x - 45, y + 40], [x - 45, y - 40]); }
  if (kind === 'OR') { for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([x - 45 + 95 * u, y - 40 + 40 * u * u]); } for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([x + 50 - 95 * u, y + 40 * u * u]); } for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([x - 45 + 18 * Math.sin(Math.PI * u), y + 40 - 80 * u]); } }
  if (kind === 'NOT') { P.push([x - 40, y - 38], [x + 30, y], [x - 40, y + 38], [x - 40, y - 38]); }
  vrGlow(P, c, 5, lit > 0.5 ? 1.8 : 0.3, { a });
  if (lit > 0.5) vrHalo(x, y, 90, '255,190,90', a * 0.6);
  if (kind === 'NOT') vrGlow(vaArc(x + 40, y, 9, 0, TAU, 16), c, 4, 1, { a });
  vrText(kind, x, y + 108, 28, VR.grey, { weight: 700, a });
}
function beatCircuit() {
  const a = win(S('circuit') + 0.1, S('end') + 0.2, 0.35); if (a <= 0) return;
  const ga = fadeOut(S('computer') + 0.3, 0.4) * a;
  if (ga > 0) {
    // the ant's highway-like trails run into the gates and light them
    const G = [['AND', 290, 800], ['OR', 790, 800], ['NOT', 540, 1170]];
    G.forEach(([k, x, y], i) => { const t = VW('circuit', 'logic') - 0.3 + i * 0.25, lit = clamp((TT - t - 0.5) / 0.2);
      const tr = []; for (let j = 0; j <= 24; j++) { const u = j / 24; tr.push([x - 250 + 110 * u + (j % 2) * 8, y + 90 - 90 * u + ((j >> 1) % 2) * 8]); }
      vrGlow(vaPartTrail(tr, clamp((TT - t) / 0.5)), VR.gold, 5, 1.4, { a: ga * popS(t) }); gate(x, y, k, ga * popS(t), lit); });
  }
  const ca = fadeIn(S('computer') + 0.1, 0.4) * a;
  if (ca > 0) {
    // a chip: a slab with pins, its die is a tiny ant board with a highway
    const k = popS(S('computer') + 0.1) * ca;
    vrSlab(540, 900, 420 * k, 420 * k, 26, 40, '#2c2c30', '#1a1a1d', '#0b0b0d', { a: ca });
    for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { const o = -175 + i * 50; rr(540 + o * k - 9, 900 + s * 228 * k - 18, 18, 36, 4, '#b9b9be'); rr(540 + s * 228 * k - 18, 900 + o * k - 9, 36, 18, 4, '#b9b9be'); }
    const cl = { x: 540 - 150 * k, y: 900 - 150 * k, w: 300 * k, h: 300 * k }, v = fitView(MAIN, 12600, 30, 280 * k);
    drawBits(MAIN, 12600, v, cl, ca, { hot: MAIN.onset, flash: false });
    OV(() => {
      [['2 rules', 'two', 290], ['1 bit', 'one', 540], ['40 years', 'forty', 790]].forEach(([s, w, x]) => pill(x, 1300, s, w === 'forty' ? 'rgba(255,77,77,0.95)' : 'rgba(245,183,74,0.95)', w === 'forty' ? '#fff' : '#1a1206', ca * popS(VW('computer', w) - 0.1), 36));
      vrText('no proof', 540, 1420, 48, VR.red, { weight: 800, a: ca * fadeIn(VW('computer', 'proof') - 0.1, 0.3), glow: 16 });
    });
  }
}
function vaPartTrail(P, f) { const n = Math.max(2, Math.round(P.length * clamp(f))); return P.slice(0, n); }

// =====================================================================
//  title and end
// =====================================================================
function beatTitle() {
  const a = fadeOut(VL('title').t1 + 0.1, 0.3); if (a <= 0) return;
  OV(() => {
    vrText('An ant with two rules', 540, 330, 66, VR.ink, { weight: 800, a, glow: 20, glowC: 'rgba(0,0,0,0.8)' });
    vrText('builds a highway', 540, 415, 70, VR.amber, { weight: 800, a: a * fadeIn(VW('title', 'builds') - 0.1, 0.2), glow: 26 });
    vrText('and nobody can prove why', 540, 500, 52, VR.ink, { weight: 600, a: a * fadeIn(VW('title', 'nobody') - 0.1, 0.2), glow: 20, glowC: 'rgba(0,0,0,0.8)' });
  });
}
function beatEnd() {
  const a = fadeIn(S('end') + 0.1, 0.5); if (a <= 0) return;
  // the ant again, on its highway, small and lit
  const EC = { x: 190, y: 560, w: 700, h: 640 }, v = fitView(MAIN, 12600, 12, 620);
  boardSlab(EC.x, EC.y, EC.w, EC.h, a);
  const { sx, sy } = drawBits(MAIN, 12600, v, EC, a, { hot: MAIN.onset, flash: false });
  const p = antPose(MAIN, 12600 - 0.5 + 0.5 * Math.sin(TT)); vrHalo(sx(p.x), sy(p.y), 60, '255,210,140', a); ant(sx(p.x), sy(p.y), p.ang, 52, a, TT * 2);
  OV(() => {
    pill(320, 1310, 'coincidence?', 'rgba(60,60,64,0.92)', '#eee', a * popS(VW('end', 'coincidence') - 0.1), 34);
    pill(760, 1310, 'something hidden?', 'rgba(59,130,246,0.95)', '#fff', a * popS(VW('end', 'hidden') - 0.1), 34);
    const na = fadeIn(VL('end').t1 + 0.2, 0.4);
    if (na > 0) {
      ctx.save(); ctx.globalAlpha = na; ctx.font = `700 34px ${VR_SANS}`; const w1 = ctx.measureText('@bitstory').width;
      rr(540 - (w1 + 200) / 2, 1400, w1 + 200, 76, 38, 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.2)', 2);
      vrText('@bitstory', 540 - 50, 1450, 34, '#fff', { weight: 700 }); rr(540 + w1 / 2 - 40, 1414, 130, 48, 24, VR.blue); vrText('Follow', 540 + w1 / 2 + 25, 1448, 26, '#fff', { weight: 700 });
      ctx.restore();
    }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT();
  const glow = TT >= HIT && TT < S('langton') ? Math.max(0.25, flashK(HIT, 1.4)) : 0;
  vrBg('warm', { light: [540, 960, 900], lightK: 0.16 + 0.2 * glow });
  vrBokeh(28, 1, 'bk', true);
  setCam(c);
  beatBoard(); beatLangton(); beatWhy(); beatCircuit(); beatEnd(); beatTitle();
  OV(() => vrCaptions({ keys: KEYS, hide: (t) => t < VL('title').t1 + 0.3 }));
}

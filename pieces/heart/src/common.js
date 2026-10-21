// =====================================================================
//  COMMON — overlays, fades, the ring of 23, the calendar
// =====================================================================
const SHIFT = 0;   // centred (the user prefers a centred frame)
const OV = (f) => { const g = () => { ctx.save(); ctx.translate(SHIFT, 0); f(); ctx.restore(); }; DEFER ? DEFER.push(g) : g(); };
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const topTag = (str, a, c = BP.soft) => { if (a > 0) OV(() => bpText(str, 540, 322, 46, c, { font: BP.mono, alpha: a, spacing: 2 })); };
const caption = (lines, a, y = 1400, size = 74, o = {}) => { if (a > 0) OV(() => bpLines(lines, 540, y, size, BP.text, a, o)); };
const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const line = (x0, y0, x1, y1, c, w, a) => { ctx.save(); ctx.globalAlpha = clamp(a); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };

// ---- the circle and the times table
const CIR = { cx: 540, cy: 880, r: 390 };
const A0 = Math.PI / 2;                                    // point 0 at the bottom, so the heart's point is at the top
const angOf = (x, N) => A0 + TAU * x / N;                 // x may be fractional (k·i)
const cPt = (x, N, r = CIR.r) => [CIR.cx + Math.cos(angOf(x, N)) * r, CIR.cy + Math.sin(angOf(x, N)) * r];
// draw the chords i -> k·i for i < m (m may be fractional: the last one grows in), N dots, multiplier k
function drawTable(N, k, m, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.lineCap = 'round';
  const n = Math.min(N, Math.ceil(m)), lw = o.lw ?? (N > 100 ? 1.25 : 3), al = o.al ?? (N > 100 ? 0.42 : 0.9);
  for (let i = 0; i < n; i++) {
    const f = clamp(m - i), [x0, y0] = cPt(i, N), [x1, y1] = cPt(k * i, N);
    ctx.globalAlpha = a * al; ctx.strokeStyle = o.c ? o.c(i, N) : bpMix(BP.mint, BP.azure, i / N); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); ctx.stroke();
  }
  ctx.restore();
}
// the envelope nobody drew: P(θ) = (k·e^{iθ} + e^{ikθ}) / (k + 1), an epicycloid with k - 1 cusps
function envPt(th, k, r = CIR.r) { const a0 = A0; const x = (k * Math.cos(th + a0) + Math.cos(k * th + a0)) / (k + 1), y = (k * Math.sin(th + a0) + Math.sin(k * th + a0)) / (k + 1); return [CIR.cx + x * r, CIR.cy + y * r]; }
function drawEnvelope(k, a, frac = 1, w = 6) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.magenta; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.shadowColor = BP.magenta; ctx.shadowBlur = 18;
  ctx.beginPath(); const M = 720; for (let j = 0; j <= M * frac; j++) { const [x, y] = envPt(TAU * j / M, k); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
}
// the cusps (the "points") of the k table: where the chord collapses to a point, θ = 2πj / (k - 1)
const cusps = (k) => { const n = Math.round(k - 1), out = []; for (let j = 0; j < n; j++) out.push(envPt((2 * j + 1) * Math.PI / n, k)); return out; };   // where (k-1)θ = π (mod 2π): the envelope's sharp points
function drawCircle(a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = BP.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CIR.cx, CIR.cy, CIR.r, 0, TAU); ctx.stroke(); ctx.restore();
}

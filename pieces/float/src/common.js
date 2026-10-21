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

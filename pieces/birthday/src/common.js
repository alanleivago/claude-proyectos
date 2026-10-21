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

// the ring of 23 people
const RING = { cx: 540, cy: 840, r: 320 };
const ringPt = (i, r = RING.r) => { const a = -Math.PI / 2 + i / 23 * TAU + TT * 0.035; return [RING.cx + Math.cos(a) * r, RING.cy + Math.sin(a) * r]; };
// every pair (a < b) in a fixed order: by "distance" round the ring, so the web fills from the rim inwards
const PAIRS = (() => { const P = []; for (let a = 0; a < 23; a++) for (let b = a + 1; b < 23; b++) P.push([a, b]); const d = ([a, b]) => Math.min(b - a, 23 - (b - a)); return P.sort((p, q) => d(p) - d(q) || p[0] - q[0]); })();

// the calendar: 365 cells, 12 month rows of up to 31 days
const CAL = { x0: 92, y0: 560, cw: 29, ch: 52 };
const dayCell = (d) => { const ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let m = 0; while (d >= ML[m]) { d -= ML[m]; m++; } return [CAL.x0 + d * CAL.cw + CAL.cw / 2, CAL.y0 + m * CAL.ch + CAL.ch / 2, m, d]; };
function drawCalendar(a) {
  if (a <= 0) return;
  const ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], MN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  ctx.save();
  for (let m = 0; m < 12; m++) for (let d = 0; d < ML[m]; d++) {
    const x = CAL.x0 + d * CAL.cw, y = CAL.y0 + m * CAL.ch, u = clamp(a * 1.6 - (m * 31 + d) / 372 * 0.6);
    ctx.globalAlpha = u * 0.9; ctx.fillStyle = BP.panel; ctx.fillRect(x + 2, y + 4, CAL.cw - 4, CAL.ch - 8);
  }
  ctx.restore();
  for (let m = 0; m < 12; m++) bpText(MN[m], CAL.x0 - 30, CAL.y0 + m * CAL.ch + CAL.ch / 2 + 12, 30, BP.soft, { font: BP.mono, alpha: a });
}

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

// ---- the sound field: rings born where the source was, growing at C. The camera follows the source after the opening.
const CS = 300, PERIOD = 0.5, X0 = 540, Y0 = 820;          // px/s (sound, on screen), s between rings, the source on screen
// the source's speed as a fraction of C, over time (exaggerated on screen; the real numbers are written as text)
function ratioAt(t) {
  if (t < B0('wave')) return 0.45;
  let r = 0;
  r = lerp(r, 0.45, EZ.io(seg(t, VL('moving').t0, VL('moving').t0 + 1.2)));
  r = lerp(r, 1.0, EZ.io(seg(t, VL('fast').t0 + 0.4, VW('pile', 'catches') + 0.2)));
  if (t >= HIT) r = 1.35;
  if (t >= B0('light')) r = lerp(1.35, 0.45, EZ.io(seg(t, B0('light'), B0('light') + 0.8)));
  if (t >= B0('galaxies')) r = 0;
  if (t >= B0('end')) r = 0.45;
  return r;
}
// cumulative distance travelled (px), tabulated at 48 Hz from the start
const SDIST = (() => { const dt = 1 / 48, n = Math.ceil((DURATION + 1) / dt), S = new Float64Array(n + 1); for (let i = 1; i <= n; i++) S[i] = S[i - 1] + ratioAt((i - 0.5) * dt) * CS * dt; return { S, dt }; })();
const distAt = (t) => { const i = clamp(t / SDIST.dt, 0, SDIST.S.length - 2), k = Math.floor(i); return lerp(SDIST.S[k], SDIST.S[k + 1], i - k); };
// the opening: the world is fixed and the ambulance drives past a listener at the centre
const tPass = () => VW('open', 'passes');
const passX = (t) => X0 + (distAt(t) - distAt(tPass()));
// draw the rings; mode 'pass' (world fixed) or 'follow' (source fixed at X0); colours ahead/behind
function drawRings(t0, a, o = {}) {
  if (a <= 0) return;
  const follow = o.mode !== 'pass', now = TT, sNow = distAt(now);
  const first = Math.max(t0, now - 6.5), k0 = Math.ceil(first / PERIOD);
  ctx.save(); ctx.lineCap = 'round';
  for (let k = k0; k * PERIOD <= now; k++) {
    const te = k * PERIOD, r = CS * (now - te); if (r < 2) continue;
    const cx = follow ? X0 - (sNow - distAt(te)) : passX(te), fade = clamp(1 - r / 1300);
    const rr = ratioAt(te), squeeze = clamp(rr / 0.6);
    const ahead = o.ahead || bpMix(BP.azure, BP.mint, squeeze), behind = o.behind || bpMix(BP.azure, BP.magenta, squeeze);
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = a * fade; ctx.strokeStyle = ahead; ctx.beginPath(); ctx.arc(cx, Y0, r, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = behind; ctx.beginPath(); ctx.arc(cx, Y0, r, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
  }
  ctx.restore();
}
// the ambulance (side view), lights flashing
function drawAmbulance(x, y, a, s = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e4e3dc'; trace(rrectPts(-70, -40, 120, 70, 10, 4), true); ctx.fill();
  ctx.beginPath(); ctx.moveTo(50, -20); ctx.lineTo(80, -2); ctx.lineTo(80, 30); ctx.lineTo(50, 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5797e7'; ctx.fillRect(56, -12, 16, 16);
  ctx.fillStyle = BP.magenta; ctx.fillRect(-28, -18, 12, 34); ctx.fillRect(-39, -7, 34, 12);
  const on = Math.floor(TT * 6) % 2; ctx.fillStyle = on ? BP.magenta : '#5797e7'; ctx.fillRect(-50, -52, 22, 12); ctx.fillStyle = on ? '#5797e7' : BP.magenta; ctx.fillRect(-20, -52, 22, 12);
  ctx.fillStyle = '#0b1014'; for (const wx of [-42, 46]) { ctx.beginPath(); ctx.arc(wx, 32, 15, 0, TAU); ctx.fill(); ctx.strokeStyle = BP.dim; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.restore();
}
// a received-pitch bar: ticks scrolling left at the rate the listener receives wave fronts
function pitchBar(y, label, f, c, a) {
  if (a <= 0) return;
  const x0 = 150, x1 = 930, sp = 240 / f;
  ctx.save(); ctx.globalAlpha = a; trace(rrectPts(x0, y - 40, x1 - x0, 80, 14, 5), true); ctx.fillStyle = BP.panel; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.rect(x0 + 4, y - 36, x1 - x0 - 8, 72); ctx.clip(); ctx.strokeStyle = c; ctx.lineWidth = 5;
  for (let x = x1 - mod(TT * 240, sp); x > x0 + 230; x -= sp) { ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x, y + 22); ctx.stroke(); }
  ctx.restore();
  OV(() => bpText(label, x0 + 24, y + 12, 34, c, { font: BP.mono, weight: 700, align: 'left', alpha: a }));
}

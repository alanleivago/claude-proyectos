// =====================================================================
//  SCENES — How much does one extra meter lift a rope around the Earth? (bitstory). World 1080x1920, TT on 1s.
//  mint = the rope and the formula, amber = the numbers and the gap, magenta = the wrist and the accent, blue = the Earth.
//  Every free text is centred (x 540); titles and big text in serif, formulas in mono.
// =====================================================================
const CXT = 540;
const fadeIn = (t, d = 0.35) => EZ.o2(ev(t, d));
const fadeOut = (t, d = 0.35) => 1 - EZ.i2(ev(t, d));
const win = (t0, t1, d = 0.35) => fadeIn(t0, d) * fadeOut(t1, d);
const OV = vaOverlay;
const flashK = (t, d = 0.6) => (TT < t ? 0 : TT < t + 0.08 ? (TT - t) / 0.08 : Math.exp(-(TT - t - 0.08) / d * 3));
const BW = (from, to = from, d = 0.3) => win(SUB(from) + 0.05, SUBEND(to) - 0.05, d);   // visible across beats from..to
const MINT = VA.mint, AMB = VA.amber, MAG = VA.plus;

// ---- text helpers: centred serif captions typed on their word; mono formulas
function cap(str, y, t0, c = VA.cream, size = 60, o = {}) {
  const a = (o.a ?? 1) * fadeIn(t0 - 0.05, 0.25);
  if (a <= 0) return;
  OV(() => vaText(str, CXT, y, size, c, { align: 'center', serif: !o.mono, italic: o.italic, weight: o.weight, a, frac: vaType(t0, str, o.cps ?? 26), glow: o.glow ?? 8 }));
}
function fx(str, y, t0, c = VA.text, size = 50, o = {}) { cap(str, y, t0, c, size, { ...o, mono: true, cps: o.cps ?? 30, weight: o.weight ?? 700 }); }
function label(str, x, y, c = VA.text, size = 30, a = 1) { vaText(str, x, y, size, c, { align: 'center', a }); }

// ---- the camera: a slow float, each beat pushes the other way
function camAtT() {
  let i = 0; while (i + 1 < TB.length && TT >= TB[i + 1]) i++;
  const u = EZ.io(clamp((TT - TB[i]) / Math.max(0.5, (i + 1 < TB.length ? TB[i + 1] : DURATION) - TB[i])));
  const push = 0.09 * (i % 2 ? 1 - u : u);
  const kick = 0.06 * flashK(HIT, 0.8);
  return { cx: 540 + 22 * Math.sin(TT * 0.29), cy: 960 + 16 * Math.sin(TT * 0.23 + 1), z: (1 + push + kick) * (1 + 0.02 * Math.sin(TT * 0.41)), sx: 0, sy: 0 };
}
function setCam(c) { ctx.setTransform(c.z, 0, 0, c.z, W / 2 + c.sx - c.z * c.cx, H / 2 + c.sy - c.z * c.cy); }
function zoomAbout(x, y, z, f) { ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); f(); ctx.restore(); }
// mint data pulses along the grid's major lines, and a twinkling starfield
function gridPulses(c) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + (c.z - 1) * 0.35, st = 240 * z, ox = -(c.cx - 540) * 0.4 * z, oy = -(c.cy - 960) * 0.4 * z;
  for (let k = 0; k < 8; k++) {
    const R = RNG('gp', k), horiz = k % 2 === 0, line = Math.floor(R.r(0, 8)), sp = R.r(110, 240), ph = R.r(0, 3000);
    const pos = mod(TT * sp + ph, (horiz ? W : H) + 400) - 200;
    const x = horiz ? pos : mod(line * st + ox, W), y = horiz ? mod(line * st + oy, H) : pos;
    const g = ctx.createLinearGradient(horiz ? x - 120 : x, horiz ? y : y - 120, x, y);
    g.addColorStop(0, 'rgba(46,240,176,0)'); g.addColorStop(1, 'rgba(46,240,176,0.45)');
    ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(horiz ? x - 120 : x, horiz ? y : y - 120); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = 'rgba(190,255,230,0.8)'; ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  ctx.restore();
}
function stars(a = 1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 70; i++) {
    const R = RNG('st', i), x = R.r(0, W), y = R.r(0, H), tw = 0.5 + 0.5 * Math.sin(TT * R.r(0.8, 2.2) + i * 1.3);
    ctx.globalAlpha = a * (0.25 + 0.55 * tw) * (i % 7 === 0 ? 1 : 0.6);
    ctx.fillStyle = i % 11 === 0 ? '#bff' : '#9cc4dc';
    const s = i % 7 === 0 ? 3 : 2; ctx.fillRect(x, y, s, s);
    if (i % 7 === 0 && tw > 0.85) { ctx.globalAlpha *= 0.5; ctx.fillRect(x - 5, y + 1, 13, 1); ctx.fillRect(x + 1, y - 5, 1, 13); }
  }
  ctx.restore();
}

// =====================================================================
//  the sphere: a tilted globe of pixel tiles (earth), a tennis ball, a marble — lit from the upper left
// =====================================================================
const TILT = 0.36, LIGHT = (() => { const v = [-0.55, 0.6, 0.6], n = Math.hypot(...v); return v.map((x) => x / n); })();
function sp3(lat, lon, phi) {   // a point on the unit sphere → view space [x, y, z] (y up, z to the viewer)
  const x = Math.cos(lat) * Math.sin(lon + phi), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon + phi);
  return [x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT)];
}
const shade = (n) => 0.22 + 0.78 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
const rgb = (c, k, a = 1) => `rgba(${c[0] * k | 0},${c[1] * k | 0},${c[2] * k | 0},${a})`;
function sphere(cx, cy, R, o = {}) {
  const a = o.a ?? 1; if (a <= 0 || R < 1) return;
  const mat = o.mat ?? 'earth', phi = o.phi ?? TT * 0.22;
  ctx.save(); ctx.globalAlpha *= a;
  // the atmosphere: a soft halo outside the limb
  const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.28);
  const hc = mat === 'earth' ? '70,150,255' : mat === 'tennis' ? '200,240,80' : mat === 'sun' ? '255,190,70' : '120,220,255';
  halo.addColorStop(0, `rgba(${hc},0.38)`); halo.addColorStop(1, `rgba(${hc},0)`);
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  if (mat === 'earth') {
    const NL = 12, NO = 24, tiles = [];
    for (let i = 0; i < NL; i++) for (let j = 0; j < NO; j++) {
      const la0 = -Math.PI / 2 + Math.PI * i / NL, la1 = la0 + Math.PI / NL, lo0 = TAU * j / NO, lo1 = lo0 + TAU / NO;
      const c = sp3((la0 + la1) / 2, (lo0 + lo1) / 2, phi); if (c[2] < -0.25) continue;
      const P = [];
      for (let k = 0; k <= 3; k++) P.push(sp3(la0, lerp(lo0, lo1, k / 3), phi));
      for (let k = 0; k <= 3; k++) P.push(sp3(la1, lerp(lo1, lo0, k / 3), phi));
      // a little land: some tiles go green, seeded by their place on the globe
      const land = RNG('land', i, j).f() < (Math.abs(i - 6) < 4 ? 0.28 : 0.1);
      const base = land ? ((i + j) % 2 ? [52, 196, 132] : [36, 160, 108]) : ((i + j) % 2 ? [64, 140, 255] : [36, 98, 218]);
      tiles.push([c[2], P, base, shade(c)]);
    }
    tiles.sort((p, q) => p[0] - q[0]);
    for (const [, P, base, k] of tiles) {
      ctx.beginPath(); P.forEach(([x, y], n) => (n ? ctx.lineTo(cx + R * x, cy - R * y) : ctx.moveTo(cx + R * x, cy - R * y))); ctx.closePath();
      ctx.fillStyle = rgb(base, k); ctx.fill(); ctx.strokeStyle = rgb(base, k * 0.8); ctx.lineWidth = Math.max(1, R / 220); ctx.stroke();
    }
    // a few sparkling pixels drifting over the oceans (light on the water)
    for (let s = 0; s < 14; s++) { const Rn = RNG('glint', s), p = sp3(Rn.r(-1, 1), Rn.r(0, TAU), phi); if (p[2] < 0.2) continue;
      ctx.globalAlpha = a * 0.5 * Math.max(0, Math.sin(TT * 2 + s)); ctx.fillStyle = '#cfe8ff'; const q = Math.max(2, R / 60); ctx.fillRect(cx + R * p[0] - q / 2, cy - R * p[1] - q / 2, q, q); }
    ctx.globalAlpha = a;
  } else {
    const base = mat === 'tennis' ? [205, 232, 60] : mat === 'sun' ? [255, 190, 60] : mat === 'wrist' ? [120, 40, 80] : [30, 150, 170];
    const g = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.05, cx, cy, R * 1.05);
    g.addColorStop(0, rgb(base, 1.15)); g.addColorStop(0.55, rgb(base, 0.75)); g.addColorStop(1, rgb(base, 0.25));
    ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    if (mat === 'tennis') {   // felt fuzz and the seam (a + b = 1 keeps it on the sphere)
      for (let s = 0; s < 120; s++) { const Rn = RNG('felt', s); ctx.fillStyle = `rgba(255,255,200,${Rn.r(0.05, 0.16)})`; ctx.fillRect(cx + Rn.r(-R, R), cy + Rn.r(-R, R), 2, 2); }
      const A = 0.7, B = 0.3, seg = [];
      for (let k = 0; k <= 160; k++) {
        const th = TAU * k / 160, x = A * Math.cos(th) + B * Math.cos(3 * th), y = A * Math.sin(th) - B * Math.sin(3 * th), z = 2 * Math.sqrt(A * B) * Math.sin(2 * th);
        const lon = Math.atan2(x, z), lat = Math.asin(clamp(y, -1, 1)), p = sp3(lat, lon, phi);
        seg.push(p);
      }
      for (let k = 1; k < seg.length; k++) if (seg[k][2] > 0 && seg[k - 1][2] > 0) vaLine(cx + R * seg[k - 1][0], cy - R * seg[k - 1][1], cx + R * seg[k][0], cy - R * seg[k][1], 'rgba(255,255,240,0.95)', Math.max(2, R * 0.05));
    }
    if (mat === 'marble') {   // a twisted ribbon inside the glass
      for (const [c, off] of [[MAG, 0], [AMB, Math.PI]]) {
        const P = []; for (let k = 0; k <= 40; k++) { const u = k / 40; P.push([cx + R * 0.7 * Math.sin(u * Math.PI * 2 + off + TT * 1.2) * Math.sin(u * Math.PI), cy - R * 0.85 + R * 1.7 * u]); }
        vaStroke(P, c, Math.max(2, R * 0.12), { a: 0.85 });
      }
    }
    if (mat === 'sun') {   // boiling granules
      for (let s = 0; s < 40; s++) { const Rn = RNG('gran', s), an = Rn.r(0, TAU), rr = Math.sqrt(Rn.f()) * R; ctx.fillStyle = `rgba(255,240,170,${0.18 + 0.15 * Math.sin(TT * 3 + s)})`; ctx.beginPath(); ctx.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, R * 0.07, 0, TAU); ctx.fill(); }
    }
  }
  // limb darkening and a specular highlight
  const lg = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
  lg.addColorStop(0, 'rgba(0,8,24,0)'); lg.addColorStop(1, mat === 'sun' ? 'rgba(120,40,0,0.35)' : 'rgba(0,8,24,0.55)'); ctx.fillStyle = lg; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const sg = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.45, 0, cx - R * 0.42, cy - R * 0.45, R * (mat === 'marble' ? 0.35 : 0.6));
  sg.addColorStop(0, `rgba(255,255,255,${mat === 'marble' ? 0.75 : 0.28})`); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.restore();
  ctx.strokeStyle = mat === 'earth' ? 'rgba(140,200,255,0.7)' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.restore();
}
// the rope around the equator: an ellipse; the far half (above the centre) is drawn before the sphere, the near half after
function ropeHalf(cx, cy, Rr, near, frac = 1, o = {}) {
  const ry = Rr * Math.sin(TILT), P = [], N = 160;
  for (let k = 0; k <= N * frac; k++) { const u = Math.PI / 2 + TAU * k / N, y = cy + ry * Math.sin(u); P.push([cx + Rr * Math.cos(u), y, Math.sin(u)]); }
  const runs = []; let cur = [];
  for (const p of P) { if ((p[2] >= 0) === near) cur.push([p[0], p[1]]); else if (cur.length) { runs.push(cur); cur = []; } }
  if (cur.length) runs.push(cur);
  for (const r of runs) vaGlow(r, o.c ?? MINT, o.w ?? 5, (o.k ?? 1) * (near ? 1 : 0.45), { a: (o.a ?? 1) * (near ? 1 : 0.55) });
  if (near && frac < 1 && frac > 0) { const h = P[P.length - 1]; vaDot(h[0], h[1], 9, '#eafff6', o.a ?? 1); vaDot(h[0], h[1], 18, MINT, 0.3 * (o.a ?? 1)); }
  return P;
}
function globeRope(cx, cy, R, Rr, o = {}) {
  const fr = o.frac ?? 1;
  if (o.rope !== false) ropeHalf(cx, cy, Rr, false, fr, o);
  sphere(cx, cy, R, o);
  if (o.rope !== false) ropeHalf(cx, cy, Rr, true, fr, o);
}

// =====================================================================
//  1 — the globe: title, the rope, 40,000 km, +1 m, the guesses, the reveal
// =====================================================================
const GX = 540, GY = 960, GR = 270;
function gapNow() {   // the rope's visible gap in px (exaggerated after the reveal)
  const tLift = VW('add', 'tight') + 0.2;
  const small = 7 * EZ.io(clamp((TT - tLift) / 0.8));
  return small + (TT >= HIT ? springMove(HIT, 0, 64, SPRING.playful) : 0);
}
function beatGlobe() {
  const a = win(0, S('phone') + 0.2, 0.3); if (a <= 0) return;
  // the dive to the surface: the globe swells about the near rope point and fades as the ground takes over
  const tz0 = VW('reveal', 'once') + 0.15, dz = EZ.i3(clamp((TT - tz0) / 0.75)), zz = Math.exp(dz * 3.2);
  const R = GR * (1 - 0.06 * EZ.io(clamp((TT - S('ask')) / 1))), gap = gapNow(), Rr = R + 2 + gap;
  const frac = clamp((TT - VW('wrap', 'wrap')) / (VW('wrap', 'equator') + 0.4 - VW('wrap', 'wrap')));
  const pivot = [GX, GY + Rr * Math.sin(TILT)];
  zoomAbout(pivot[0], pivot[1], zz, () => {
    globeRope(GX, GY, R, Rr, { a: a * (1 - dz), frac: EZ.io(frac), rope: TT > VW('wrap', 'wrap') - 0.1, k: 1 + 1.5 * flashK(HIT, 0.8) });
    // +1 m: an amber piece flies up and splices into the near side
    const tA = VW('add', 'one') - 0.1, tJ = VW('add', 'just') + 0.2;
    if (TT > tA - 0.05 && TT < S('ask') + 0.6) {
      const u = EZ.o3(clamp((TT - tA) / 0.6)), j = EZ.io(clamp((TT - tJ) / 0.5)), fade = fadeOut(S('ask') + 0.2, 0.4);
      const x0 = GX - 60, y0 = lerp(1560, GY + Rr * Math.sin(TILT) + 34, u), P = [[x0, y0], [x0 + 120, y0]];
      const yj = lerp(y0, GY + Rr * Math.sin(TILT), j);
      vaGlow([[x0, yj], [x0 + 120, yj]], AMB, 6, 1.4, { a: a * fade * (1 - 0.6 * j) });
      if (j < 0.9) OV(() => vaText('+1 m', GX, y0 + 70, 46, AMB, { align: 'center', weight: 700, a: a * (1 - j) * fade, glow: 12 }));
    }
    // "everywhere at once": amber arrows push the rope out all round
    if (TT >= HIT && TT < S('phone')) {
      const k = win(HIT, VW('reveal', 'once') + 0.4, 0.2), ry = () => Math.sin(TILT);
      for (let n = 0; n < 18; n++) {
        const u = TAU * n / 18 + TT * 0.15, near = Math.sin(u) >= 0, c = Math.cos(u), s = Math.sin(u);
        const x0 = GX + (R + 4) * c, y0 = GY + (R + 4) * s * ry(), x1 = GX + (Rr - 6) * c, y1 = GY + (Rr - 6) * s * ry();
        if (!near && Math.hypot(x0 - GX, (y0 - GY) / Math.sin(TILT) * 1) < R && Math.abs(c) < 0.95) continue;
        vaArrow(x0, y0, x1, y1, AMB, 3, k * (near ? 1 : 0.4) * (0.6 + 0.4 * Math.sin(TT * 6 + n)), 10);
      }
      // a light wave runs around the ring
      const wu = Math.PI / 2 + TAU * clamp((TT - HIT) / 1.4), wx = GX + Rr * Math.cos(wu), wy = GY + Rr * Math.sin(TILT) * Math.sin(wu);
      vaDot(wx, wy, 14, '#fff6dc', 0.9 * (1 - clamp((TT - HIT) / 1.4)));
    }
    // the magnifying glass over the rope (it sees nothing)
    const tM = VW('nothing', 'magnifying') - 0.3, mk = win(tM, VL('nothing').t1 + 0.1, 0.25);
    if (mk > 0) {
      const mx = GX + R * 0.62 + 30 * Math.sin((TT - tM) * 3), my = GY + R * 0.42;
      ctx.save(); ctx.globalAlpha *= mk; ctx.beginPath(); ctx.arc(mx, my, 70, 0, TAU); ctx.fillStyle = 'rgba(160,220,255,0.12)'; ctx.fill(); ctx.restore();
      vaRing(mx, my, 70, VA.cream, 6, mk); vaStroke([[mx + 50, my + 50], [mx + 120, my + 120]], VA.cream, 14, { a: mk });
      vaText('?', mx, my + 18, 54, AMB, { align: 'center', serif: true, a: mk, glow: 10 });
    }
  });
  // the gap rule on the right side of the ring
  const ga = win(HIT + 0.35, S('phone') - 0.1, 0.25) * (1 - dz);
  if (ga > 0) { const y = GY - 34; vaRule(GX + R + 4, y, GX + Rr - 2, y, '', AMB, 30, ga); }
  // captions
  if (dz < 0.5) {
    const tT = 0.15;
    OV(() => {
      const ta = fadeOut(S('wrap') + 0.3, 0.4);
      vaText('How much does one extra meter', CXT, 360, 56, VA.cream, { align: 'center', serif: true, a: ta * fadeIn(tT, 0.2), frac: vaType(tT, 'How much does one extra meter', 30), glow: 8 });
      vaText('lift a rope around the Earth?', CXT, 440, 56, MINT, { align: 'center', serif: true, italic: true, a: ta * fadeIn(VW('title', 'lift') - 0.1, 0.2), frac: vaType(VW('title', 'lift') - 0.1, 'lift a rope around the Earth?', 30), glow: 14 });
    });
    // 40,000 km counting up while the rope wraps
    const kmA = win(VW('wrap', 'wrap'), S('ask'), 0.3);
    if (kmA > 0) { const n = Math.round(40000 * EZ.o2(clamp((TT - VW('wrap', 'wrap')) / (VW('km', 'forty') + 0.4 - VW('wrap', 'wrap'))))); const s = n.toLocaleString('en-US') + ' km';
      OV(() => { vaText(s, CXT, 400, 72, MINT, { align: 'center', weight: 700, a: kmA, glow: 16 }); vaText('of rope, flat on the ground', CXT, 460, 30, VA.text, { align: 'center', a: kmA * fadeIn(VW('wrap', 'flat'), 0.3) }); }); }
    cap('+ just one meter', 1440, VW('add', 'just') - 0.05, AMB, 48, { a: fadeOut(VW('add', 'same') - 0.3, 0.25), italic: true });
    cap('same height all the way round', 1440, VW('add', 'same') - 0.1, VA.text, 34, { mono: true, a: fadeOut(S('ask'), 0.3) });
    cap('how high does it rise?', 400, VW('ask', 'high') - 0.2, VA.cream, 60, { a: fadeOut(HIT, 0.25) });
    // the guesses: three chips, then crossed out at the payoff
    const gw = [['nothing', 330], ['a hair', 540], ['invisible', 750]];
    gw.forEach(([w, x], i) => {
      const t0 = VW('ask', 'same') + 0.1 + i * 0.35, k = popS(t0) * fadeOut(VW('reveal', 'once') - 0.2, 0.3);
      if (k <= 0) return;
      OV(() => {
        ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = 'rgba(18,40,60,0.9)'; ctx.strokeStyle = VA.dim; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x - 92, 486, 184, 58, 12); ctx.fill(); ctx.stroke(); ctx.restore();
        vaText(w, x, 525, 30, VA.text, { align: 'center', a: k });
        const s = EZ.o2(clamp((TT - HIT - i * 0.08) / 0.25)); if (s > 0) vaLine(x - 80, 515, x - 80 + 160 * s, 515, VA.red, 4, { a: k });
      });
    });
    cap('1 m  ÷  40,000,000 m', 1440, VW('nothing', 'spread') - 0.1, VA.text, 38, { mono: true, a: fadeOut(HIT, 0.2) });
    // THE REVEAL
    const rk = popS(VW('reveal', 'sixteen') - 0.1) * fadeOut(tz0 + 0.3, 0.3);
    if (rk > 0) OV(() => { vaText('16', CXT - 40, 1450, 150 * rk, AMB, { align: 'center', serif: true, weight: 700, a: rk, glow: 28 }); vaText('cm', CXT + 95, 1450, 64 * rk, AMB, { align: 'center', serif: true, a: rk, glow: 12 }); });
    cap('everywhere on the planet, at once', 450, VW('reveal', 'everywhere') - 0.1, VA.cream, 40, { italic: true, a: fadeOut(tz0 + 0.2, 0.3) });
    cap('(gap exaggerated)', 1300, HIT + 0.6, VA.dim, 26, { mono: true, a: fadeOut(tz0, 0.3) });
  }
}

// =====================================================================
//  2 — the surface, to scale: the phone stands under the rope
// =====================================================================
const GROUND = 1180, BIGR = 5200, PXCM = 10;
function beatSurface() {
  const tz0 = VW('reveal', 'once') + 0.15, a = fadeIn(tz0 + 0.35, 0.4) * fadeOut(VW('line', 'math') - 0.1, 0.35);
  if (a <= 0) return;
  const zin = 1 + 0.8 * (1 - EZ.o3(clamp((TT - tz0 - 0.3) / 0.9)));
  zoomAbout(540, GROUND, zin, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cy = GROUND + BIGR;
    // the sea: a huge circle, pixel-checker water fading down
    ctx.save(); ctx.beginPath(); ctx.arc(540, cy, BIGR, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, GROUND - 10, 0, H); g.addColorStop(0, '#1d5fc4'); g.addColorStop(0.25, '#0e3a78'); g.addColorStop(1, '#04101f');
    ctx.fillStyle = g; ctx.fillRect(-400, GROUND - 40, W + 800, H);
    for (let r = 0; r < 12; r++) for (let c = -2; c < 20; c++) { if ((r + c) % 2) continue; const y = GROUND + 8 + r * r * 6 + r * 20, h = 6 + r * 10, w = 60 + r * 14, x = mod(c * w - TT * 18 * (1 + r * 0.2), W + w * 2) - w; ctx.fillStyle = `rgba(90,160,255,${0.1 - r * 0.006})`; ctx.fillRect(x, y, w, h); }
    ctx.restore();
    ctx.strokeStyle = '#7fb6ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(540, cy, BIGR, Math.PI * 1.35, Math.PI * 1.65); ctx.stroke();
    ctx.restore();
    // the rope: 16 cm above, the same curve
    const ropeR = BIGR + 16 * PXCM, P = vaArcPts(540, cy, ropeR, Math.PI * 1.38, Math.PI * 1.62, 80);
    vaGlow(P, MINT, 5, 1.2, { a });
    // the phone, standing upright (15 cm)
    const pk = popS(VW('phone', 'phone') - 0.15) * a;
    if (pk > 0) {
      const ph = 150 * PXCM / 10 * pk, pw = 72, px = 610;
      ctx.save(); ctx.globalAlpha *= pk;
      ctx.fillStyle = '#0b1a2a'; ctx.beginPath(); ctx.roundRect(px - pw / 2, GROUND - ph, pw, ph, 12); ctx.fill();
      const sc = ctx.createLinearGradient(0, GROUND - ph, 0, GROUND); sc.addColorStop(0, '#3a86ff'); sc.addColorStop(1, '#2ef0b0');
      ctx.globalAlpha *= 0.85; ctx.fillStyle = sc; ctx.beginPath(); ctx.roundRect(px - pw / 2 + 6, GROUND - ph + 12, pw - 12, ph - 24, 6); ctx.fill();
      ctx.restore();
      vaStroke([[px - pw / 2, GROUND - ph + 12], [px - pw / 2, GROUND - 12]], VA.line, 3, { a: pk });
      ctx.save(); ctx.globalAlpha *= pk; ctx.strokeStyle = VA.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px - pw / 2, GROUND - ph, pw, ph, 12); ctx.stroke(); ctx.restore();
    }
    // the 16 cm rule
    const rk = fadeIn(tz0 + 0.8, 0.3) * a;
    if (rk > 0) { vaArrow(450, GROUND - 80, 450, GROUND - 160 + 4, AMB, 3.5, rk, 14); vaArrow(450, GROUND - 80, 450, GROUND - 4, AMB, 3.5, rk, 14); }
  });
  const rk = fadeIn(tz0 + 0.8, 0.3) * a;
  if (rk > 0) OV(() => { vaText('16 cm', 380, GROUND - 70 - (zin - 1) * 0, 34, AMB, { align: 'right', weight: 700, a: rk, glow: 10 }); });
  cap('16 cm', 560, tz0 + 0.6, AMB, 110, { a: a, glow: 26, weight: 700 });
  cap('(this part is to scale)', 1290, tz0 + 1.0, VA.dim, 28, { mono: true, a });
  cap('your phone fits underneath', 1380, VW('phone', 'phone') - 0.1, VA.cream, 42, { italic: true, a });
}

// =====================================================================
//  3 — the math: the rope straightens into one line, curls into the circle, the formula is written
// =====================================================================
const DC = [540, 600], DR = 170;
function beatMath() {
  const a = win(VW('line', 'math') - 0.1, S('missing') + 0.4, 0.35); if (a <= 0) return;
  const tL = VW('line', 'math') - 0.1, tC = VW('circ', 'length') - 0.2;
  const toLine = EZ.io(clamp((TT - tL) / 0.6)), toCirc = EZ.io(clamp((TT - tC) / 0.9));
  const grow = EZ.io(clamp((TT - VW('grow', 'longer') + 0.1) / 0.7));
  const Rring = DR + 6 + 44 * grow;
  // the rope: arc → straight line → circle
  const N = 120, P = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, lx = 90 + 900 * s, ly = 960, an = Math.PI / 2 + TAU * s;
    const ax = 540 + (lx - 540), ay = lerp(1020, 960, toLine) + (1 - toLine) * 40 * Math.sin(Math.PI * s);
    P.push([lerp(ax, DC[0] - Rring * Math.sin(an - Math.PI / 2) * 1, toCirc), lerp(ay, DC[1] + Rring * Math.cos(an - Math.PI / 2), toCirc)]);
  }
  vaGlow(P, MINT, 5, 1.1, { a });
  cap('the math fits on one line', 1060, VW('line', 'math') - 0.05, VA.cream, 46, { italic: true, a: a * fadeOut(tC, 0.3) });
  if (toCirc <= 0) return;
  // the Earth's cross-section, the radius, the gap
  const da = a * toCirc;
  ctx.save(); ctx.globalAlpha *= da; const g = ctx.createRadialGradient(DC[0] - 50, DC[1] - 60, 10, DC[0], DC[1], DR);
  g.addColorStop(0, '#2a5fae'); g.addColorStop(1, '#0d2446'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(DC[0], DC[1], DR, 0, TAU); ctx.fill(); ctx.restore();
  vaRing(DC[0], DC[1], DR, '#7fb6ff', 3, da);
  const rk = fadeIn(VW('circ', 'radius') - 0.2, 0.3) * da;
  if (rk > 0) { const sw = EZ.o2(clamp((TT - VW('circ', 'radius') + 0.2) / 0.5)); vaLine(DC[0], DC[1], DC[0] + DR * sw, DC[1], AMB, 4, { a: rk }); vaDot(DC[0], DC[1], 6, AMB, rk); label('r', DC[0] + DR / 2, DC[1] - 16, AMB, 34, rk); }
  label('L', DC[0], DC[1] - Rring - 22, MINT, 34, fadeIn(VW('circ', 'length'), 0.3) * da);
  if (grow > 0) { const y = DC[1] + 46; vaRule(DC[0] + DR + 2, y, DC[0] + Rring - 2, y, '', AMB, 26, grow * da); label('Δr', DC[0] + DR + 22, y + 46, AMB, 30, grow * da);
    // the extra meter: an amber piece inserted at the top
    vaGlow(vaArcPts(DC[0], DC[1], Rring, -Math.PI / 2 - 0.18, -Math.PI / 2 + 0.18, 12), AMB, 6, 1.3, { a: da * grow }); }
  // 2π: six radius-long arcs light up around the circle, then the last 0.28
  const t2 = VW('twopi', 'two') - 0.15, n2 = (TT - t2) / 0.2;
  if (n2 > 0) for (let k = 0; k < 7; k++) {
    const kk = clamp(n2 - k); if (kk <= 0) break;
    const a0 = -Math.PI / 2 + k, a1 = a0 + (k === 6 ? 0.283 : 1) * kk;
    vaGlow(vaArcPts(DC[0], DC[1], DR - 10, a0, a1, 16), k % 2 ? VA.cream : AMB, 6, 1, { a: da * fadeOut(S('div') + 1.2, 0.4) });
    const am = (a0 + a1) / 2; label(k === 6 ? '.28' : String(k + 1), DC[0] + Math.cos(am) * (DR - 46), DC[1] + Math.sin(am) * (DR - 46) + 10, k % 2 ? VA.cream : AMB, 28, da * kk * fadeOut(S('div') + 1.2, 0.4));
  }
  // the formula, line by line
  const fo = fadeOut(S('missing') - 0.1, 0.3);
  fx('L = 2π · r', 930, VW('circ', 'length') - 0.1, VA.cream, 56, { a: fo });
  fx('ΔL = 2π · Δr', 1020, VW('grow', 'longer') - 0.1, VA.cream, 50, { a: fo });
  fx('Δr = ΔL / 2π', 1110, VW('grow', 'divided') - 0.1, MINT, 56, { a: 1, glow: 14 });
  fx('2π ≈ 6.28', 1200, VW('twopi', 'two') - 0.1, AMB, 50, { a: fo });
  fx('1 m / 6.28 ≈ 0.159 m', 1290, VW('div', 'one') - 0.1, VA.cream, 46, { a: fo });
  const sk = popS(VW('div', 'sixteen') - 0.1) * fo;
  if (sk > 0) OV(() => vaText('16 cm', CXT, 1430, 104 * sk, AMB, { align: 'center', serif: true, weight: 700, a: sk, glow: 24 }));
}

// =====================================================================
//  4 — what's missing: the formula alone, the Earth can't get in; the ball shrinks; no percentage; the rule
// =====================================================================
function formulaHead() {   // Δr = ΔL / 2π: from the math list to the centre, then up to the top
  const t0 = S('missing'), t1 = S('any') + 0.2, t2 = S('rule');
  if (TT < t0 + 0.05 || TT > S('three') + 0.3) return;
  const u0 = EZ.io(clamp((TT - t0) / 0.7)), u1 = EZ.io(clamp((TT - t1) / 0.7)), u2 = EZ.io(clamp((TT - S('gap')) / 0.7)), u3 = EZ.io(clamp((TT - t2) / 0.5));
  let y = lerp(1110, 760, u0); y = lerp(y, 420, u1); y = lerp(y, 760, u2); y = lerp(y, 420, u3);
  let s = lerp(56, 92, u0); s = lerp(s, 64, u1); s = lerp(s, 92, u2); s = lerp(s, 60, u3);
  const a = fadeOut(S('three') - 0.1, 0.35), hl = clamp(fadeIn(VW('gap', 'add') - 0.2, 0.3) * fadeOut(S('rule'), 0.3));
  OV(() => {
    ctx.save(); ctx.font = `700 ${s}px ${VMONO}`; const wA = ctx.measureText('Δr = ').width, wB = ctx.measureText('ΔL').width, wC = ctx.measureText(' / 2π').width; ctx.restore();
    const x0 = CXT - (wA + wB + wC) / 2;
    vaText('Δr = ', x0, y, s, VA.cream, { weight: 700, a, glow: 8 });
    vaText('ΔL', x0 + wA, y, s, MINT, { weight: 700, a, glow: 14 + 20 * hl });
    vaText(' / 2π', x0 + wA + wB, y, s, VA.cream, { weight: 700, a, glow: 8 });
    if (hl > 0) { vaArrow(x0 + wA + wB / 2, y + 140, x0 + wA + wB / 2, y + 30, MINT, 4, hl * a, 16); vaText('what you add', x0 + wA + wB / 2, y + 190, 38, MINT, { align: 'center', weight: 700, a: hl * a, glow: 10 }); }
    // the scan: a mint bar sweeps across, looking for the Earth
    const sc = clamp((TT - VW('missing', 'missing') + 0.2) / 1.2);
    if (sc > 0 && sc < 1) { ctx.save(); ctx.globalAlpha = a * Math.sin(Math.PI * sc) * 0.8; ctx.fillStyle = MINT; ctx.shadowColor = MINT; ctx.shadowBlur = 20; ctx.fillRect(x0 - 30 + (wA + wB + wC + 60) * sc, y - s - 10, 5, s + 40); ctx.restore(); }
  });
}
function beatMissing() {
  const a = win(S('size'), S('any') + 0.2, 0.3); if (a <= 0) return;
  // the Earth tries to get into the formula and bounces off
  const tE = VW('size', 'earth') - 0.25, hop = EZ.o2(clamp((TT - tE) / 0.45)), back = EZ.io(clamp((TT - tE - 0.45) / 0.5));
  const y = lerp(1180, 900, hop) + 280 * back * hop - 30 * Math.sin(Math.PI * back);
  sphere(540, y, 95, { a: a * popS(tE - 0.2), phi: TT * 0.6 });
  const xk = popS(VW('size', "isn't") - 0.15) * a;
  if (xk > 0) { const r = 60 * xk; vaLine(540 - r, y - r, 540 + r, y + r, VA.red, 10, { a: xk }); vaLine(540 + r, y - r, 540 - r, y + r, VA.red, 10, { a: xk }); }
  cap('the size of the Earth?', 1380, VW('size', 'size') - 0.1, VA.cream, 48, { a });
  cap("it isn't there", 1450, VW('size', "isn't") - 0.1, VA.red, 44, { italic: true, a });
}
const MATS = () => [['earth', 'the Earth', 230], ['tennis', 'a tennis ball', 120], ['marble', 'a marble', 56]];
function beatShrink() {
  const a = win(S('any') + 0.1, S('pct') + 0.4, 0.35); if (a <= 0) return;
  const tT = VW('shrink', 'tennis') - 0.25, tM = VW('shrink', 'marble') - 0.25;
  const R = springTrack([[S('any'), 230], [tT, 120], [tM, 56]], SPRING.playful), m = TT < tT ? 0 : TT < tM ? 1 : 2;
  const [mat, name] = MATS()[m], gap = 40, cy = 980 + (m === 2 ? 26 * Math.sin((TT - tM) * 2.2) * fadeIn(VW('same', 'same'), 0.5) : 0);
  globeRope(540, cy, R, R + gap, { a, mat, phi: TT * 0.5, k: 1 + flashK(m === 0 ? 0 : m === 1 ? tT : tM, 0.6) });
  const y = cy - 30; vaRule(540 + R + 3, y, 540 + R + gap - 3, y, '', AMB, 26, a);
  for (let i = 0; i < 3; i++) { const t = VW('same', 'same') + 0.5 + i * 0.9, u = clamp((TT - t) / 0.9); if (u <= 0 || u >= 1) continue;
    vaRing(540, cy, (R + gap) * (1 + 1.6 * u), MINT, 3, a * (1 - u)); }
  OV(() => {
    vaText(name, CXT, 1320, 44, m === 0 ? '#7fb6ff' : m === 1 ? '#d6ef5a' : '#6fe0ee', { align: 'center', serif: true, italic: true, a, glow: 10 });
    const pk = 1 + 0.25 * (flashK(tT, 0.4) + flashK(tM, 0.4));
    vaText('16 cm', CXT, 1420, 70 * pk, AMB, { align: 'center', serif: true, weight: 700, a: a * fadeIn(S('any') + 0.3, 0.3), glow: 20 });
  });
  cap('same meter, same gap', 1490, VW('same', 'same') - 0.1, VA.cream, 36, { mono: true, a: a * fadeOut(S('pct') + 0.2, 0.3) });
}
function beatPct() {
  const a = win(S('pct') + 0.1, S('gap') + 0.3, 0.3); if (a <= 0) return;
  const tS = VW('pct', 'no') - 0.15, s = EZ.o2(clamp((TT - tS) / 0.35));
  fx('1 m / 40,000,000 m', 860, VW('pct', 'percentages') - 0.6, VA.text, 46, { a });
  fx('= 0.0000025 %', 950, VW('pct', 'percentages') - 0.2, AMB, 56, { a });
  if (s > 0) { vaLine(250, 845, 250 + 580 * s, 845, VA.red, 6, { a }); vaLine(260, 935, 260 + 560 * s, 935, VA.red, 6, { a }); }
  cap('no percentage here', 1100, tS, VA.cream, 52, { italic: true, a });
}
function beatGapRule() {
  const a = win(S('gap') + 0.1, S('three') + 0.2, 0.3); if (a <= 0) return;
  // "what you wrap" is crossed out under the formula; then the rule in big type
  const wa = a * fadeOut(S('rule'), 0.3);
  cap('what you wrap', 1180, VW('gap', 'wrap') - 0.1, VA.text, 40, { mono: true, a: wa });
  const xs = EZ.o2(clamp((TT - VW('gap', 'only') + 0.1) / 0.3));
  if (xs > 0) vaLine(382, 1167, 382 + 316 * xs, 1167, VA.red, 5, { a: wa });
  const ra = a * fadeIn(S('rule') + 0.2, 0.3);
  if (ra <= 0) return;
  cap('1 m of rope', 780, VW('rule', 'one') - 0.1, MINT, 84, { a: ra, glow: 16 });
  const ak = fadeIn(VW('rule', 'always') - 0.1, 0.3) * ra;
  if (ak > 0) vaArrow(540, 840, 540, 960 + 20 * Math.sin(TT * 5), VA.cream, 5, ak, 22);
  cap('16 cm of gap', 1100, VW('rule', 'sixteen') - 0.1, AMB, 92, { a: ra, glow: 22, weight: 700 });
}

// =====================================================================
//  5 — the Sun, the Earth, your wrist; the wrist test; the end
// =====================================================================
function beatThree() {
  const a = win(S('three') + 0.05, S('test') + 0.5, 0.35); if (a <= 0) return;
  const B = [['sun', 'the Sun', 240, 150, VW('three', 'sun') - 0.2], ['earth', 'the Earth', 610, 72, VW('three', 'earth') - 0.2], ['wrist', 'your wrist', 800, 24, VW('three', 'wrist') - 0.2]];
  for (const [mat, name, x, R, t] of B) {
    const k = popS(t) * a; if (k <= 0) continue;
    const y = 980, gap = 34;
    sphere(x, y, R * k, { a: k, mat: mat === 'wrist' ? 'wrist' : mat, phi: TT * 0.4 });
    if (mat === 'wrist') vaRing(x, y, R * k, MAG, 4, k);
    const rk = fadeIn(t + 0.3, 0.3) * k;
    vaGlow(vaArcPts(x, y, (R + gap) * k, 0, TAU * rk, 60), MINT, 4, 1, { a: rk });
    vaRule(x + R * k + 2, y, x + (R + gap) * k - 2, y, '', AMB, 24, rk);
    label(name, x, 1220, mat === 'sun' ? AMB : mat === 'earth' ? '#7fb6ff' : MAG, 32, k);
  }
  cap('the same gap on all three', 1380, VW('three', 'wrist') + 0.3, AMB, 44, { italic: true, a, glow: 12 });
}
const WC = [540, 900], WR = 60, WPX = 23.5;   // the wrist, to scale: 16 cm round → r 2.55 cm = 60 px
function beatWrist() {
  const a = win(S('test') + 0.1, S('end') + 0.3, 0.35); if (a <= 0) return;
  cap('try it today', 420, VW('test', 'test') - 0.1, VA.cream, 60, { a: a * fadeOut(S('wrist') + 0.3, 0.3) });
  // a coil of string waits on the table, then unwinds into the loop around the wrist
  const ck = fadeIn(S('test') + 0.2, 0.3) * fadeOut(S('wrist') + 0.2, 0.3) * a;
  if (ck > 0) { const P = []; for (let i = 0; i <= 200; i++) { const u = i / 200, th = u * TAU * 5 + TT * 0.8, r = 30 + 110 * u; P.push([540 + r * Math.cos(th), 900 + r * 0.55 * Math.sin(th)]); }
    vaGlow(P, MINT, 4, 1, { a: ck }); cap('a string and your wrist', 1420, S('test') + 0.4, VA.text, 34, { mono: true, a: ck }); }
  const wk = popS(S('wrist') - 0.1) * a; if (wk <= 0) return;
  // the wrist seen end-on: skin, flesh, the two bones
  ctx.save(); ctx.globalAlpha *= wk;
  const g = ctx.createRadialGradient(WC[0] - 18, WC[1] - 20, 4, WC[0], WC[1], WR); g.addColorStop(0, '#7a2a52'); g.addColorStop(1, '#3a1028');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(WC[0], WC[1], WR * 1.12, WR * 0.88, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= wk; ctx.strokeStyle = MAG; ctx.lineWidth = 4; ctx.shadowColor = MAG; ctx.shadowBlur = 14; ctx.beginPath(); ctx.ellipse(WC[0], WC[1], WR * 1.12, WR * 0.88, 0, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(WC[0], WC[1], WR * 1.1, WR * 0.86, 0, 0, TAU); ctx.clip();   // a cut section: fine magenta hatch
  for (let x = -80; x < 80; x += 9) vaLine(WC[0] + x, WC[1] - 60, WC[0] + x + 50, WC[1] + 60, MAG, 1.5, { a: wk * 0.35 }); ctx.restore();
  OV(() => vaText('wrist', WC[0], WC[1] + WR + 44, 28, MAG, { align: 'center', a: wk * fadeOut(VW('wrist', 'tight'), 0.3) }));
  // the string: tight, then one meter added, then pulled tight all round
  const tA = VW('wrist', 'add') - 0.1, tP = VW('wrist', 'tight') - 0.25;
  const out = springMove(tP, 0, 16 * WPX, SPRING.smooth), Rs = WR * 1.12 + 5 + out;
  vaGlow(vaArcPts(WC[0], WC[1], Rs, 0, TAU, 120).map(([x, y]) => [x, WC[1] + (y - WC[1]) * (out > 5 ? 1 : 0.8)]), MINT, 4, 1, { a: wk });
  const ak = win(tA, tP + 0.3, 0.2);
  if (ak > 0) { vaGlow(vaArcPts(WC[0], WC[1], Rs + 2, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5, 20), AMB, 6, 1.4, { a: ak * wk }); OV(() => vaText('+1 m', CXT, WC[1] - Rs - 40, 46, AMB, { align: 'center', weight: 700, a: ak * wk, glow: 12 })); }
  const rk = fadeIn(tP + 0.7, 0.3) * wk;
  if (rk > 0) { vaArrow(WC[0], WC[1] - WR * 0.88 - 4, WC[0], WC[1] - Rs + 4, AMB, 4, rk, 16); vaArrow(WC[0], WC[1] - Rs + 8, WC[0], WC[1] - WR * 0.88 - 2, AMB, 4, rk, 16);
    OV(() => vaText('16 cm', WC[0] + 30, WC[1] - 200, 40, AMB, { weight: 700, a: rk, glow: 12 })); }
  cap('your wrist + 1 m of string', 1420, VW('wrist', 'wrap') - 0.1, VA.text, 34, { mono: true, a: a * fadeOut(VW('skin', 'exactly') - 0.55, 0.3) });
  // "exactly like the planet": a small globe with its ring floats in at the top
  const pk = popS(VW('skin', 'planet') - 0.25) * a;
  if (pk > 0) { globeRope(540, 330, 58 * pk, (58 + 16) * pk, { a: pk, phi: TT * 0.5 }); }
  cap('exactly like the planet', 1420, VW('skin', 'exactly') - 0.1, VA.cream, 44, { italic: true, a });
}
function beatEnd() {
  const t0 = S('end') + 0.2; if (TT < t0 - 0.1) return;
  OV(() => {
    vaText('So what did you guess?', CXT, 720, 64, VA.cream, { align: 'center', serif: true, a: fadeIn(t0, 0.3), frac: vaType(t0, 'So what did you guess?', 26), glow: 10 });
    const t1 = VW('end', 'before') - 0.1;
    vaText('before you saw the number', CXT, 800, 34, VA.text, { align: 'center', a: fadeIn(t1, 0.3), frac: vaType(t1, 'before you saw the number', 30) });
    const t2 = VW('end', 'tell') - 0.1;
    vaText('Tell me in the comments', CXT, 930, 56, MINT, { align: 'center', serif: true, italic: true, a: fadeIn(t2, 0.3), frac: vaType(t2, 'Tell me in the comments', 26), glow: 16 });
    const ak = fadeIn(t2 + 0.5, 0.3), b = 18 * Math.abs(Math.sin(TT * 4));
    if (ak > 0) vaArrow(CXT, 1010 + b, CXT, 1180 + b, MAG, 7, ak, 30);
    const na = fadeIn(VL('end').t1 + 0.2, 0.5);
    if (na > 0) {
      ctx.save(); ctx.font = `700 50px ${VMONO}`; const wB = ctx.measureText('Bit').width, wS = ctx.measureText('story').width; ctx.restore();
      const x0 = CXT - (wB + wS) / 2;
      const gl = 14 + 16 * Math.max(0, Math.sin((TT - VL('end').t1) * 2.4));
      vaText('Bit', x0, 1475, 50, MINT, { weight: 700, a: na, glow: gl }); vaText('story', x0 + wB, 1475, 50, MAG, { weight: 700, a: na, glow: gl });
      const sw = mod((TT - VL('end').t1) / 1.4, 1); ctx.save(); ctx.globalAlpha = na * 0.5 * Math.sin(Math.PI * sw); ctx.fillStyle = '#ffffff'; ctx.fillRect(x0 - 20 + (wB + wS + 40) * sw, 1428, 6, 60); ctx.restore();
    }
  });
}

// =====================================================================
//  the stage
// =====================================================================
function sceneStage() {
  const c = camAtT();
  vaBg(0.25 * flashK(HIT, 1.2));
  stars(0.9);
  vaGridBg(c, 1.15);
  gridPulses(c);
  vaSpecks(30, 0.25);
  setCam(c);
  beatGlobe(); beatSurface(); beatMath(); formulaHead(); beatMissing(); beatShrink(); beatPct(); beatGapRule(); beatThree(); beatWrist(); beatEnd();
}

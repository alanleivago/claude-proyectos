// =====================================================================
//  SCENES — What if any drawing can be made with spinning circles? (bitstory). World 1080x1920, TT on 1s.
//  mint = the drawing and the wave, grey = the circles, amber = numbers, magenta = the rough version.
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


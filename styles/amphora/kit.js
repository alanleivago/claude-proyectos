// =====================================================================
//  styles/amphora/kit.js — a pencil-and-wash history on parchment, framed by black-figure amphora friezes.
//  Measured from local refs (references/amphora/): warm parchment (#bca27a) with mottled stains, a dense
//  brown crosshatch vignette at top and bottom, thin brown pencil figures with long vertical hatching and
//  flat watercolour washes (Athens blue, Sparta red, Persia gold), captions in a woodcut serif with the
//  side's name in its colour. On top and bottom: the amphora frieze — terracotta with black teeth and a
//  Greek key, worn into the page. Lines boil gently on 2s; captions ink in word by word with the voice.
//  Needs from the piece head: W, H.
// =====================================================================
const AM = {
  paper: '#bca27a', paperL: '#d6bd90', paperD: '#9b8460',
  ink: '#2a1c11', ink2: '#4b3826', hatch: '#3b2a19',
  blue: '#4f80bb', blueL: '#7aa3d1', blueD: '#2c5389',
  red: '#b3372b', redL: '#cf5a45', redD: '#7a2118',
  gold: '#c9962f', goldL: '#ecc56a', goldD: '#8a6119',
  purple: '#6f4b68', brown: '#7b5638', brownL: '#9b7350',
  skin: '#d8b48a', cloth: '#e3d5b5', sea: '#8fa29d', seaD: '#62797a', land: '#c8b083',
  terra: '#c3632c', terraL: '#d97b3c', fdark: '#1b0c0f', fink: '#33231a',
  night: '#2a3346', fire: '#e8822e', fireL: '#ffd27a',
};
const AM_FONT = '"ITC Garamond Std", "Garamond", "EB Garamond", "Palatino Linotype", Palatino, Georgia, serif';   // set italic
const AM_CAPS = '"1689 GLC Garamond Pro", "Trajan Pro", "Baskerville", "Times New Roman", serif';
const AM_BAND = 190;                         // frieze height, top and bottom
const amFont = (s, cap = false) => (cap ? `${s}px ${AM_CAPS}` : `italic ${s}px ${AM_FONT}`);

// ---- offscreen caches for the static page (paper, friezes, vignette variants)
const AM_CACHE = {};
function amCanvas(key, w, h, fn) {
  if (AM_CACHE[key]) return AM_CACHE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const keep = ctx; ctx = c.getContext('2d'); fn(ctx); ctx = keep;
  return (AM_CACHE[key] = c);
}
function amNoise(g, w, h, key, amp, mono = true) {
  const im = g.getImageData(0, 0, w, h), d = im.data, R = RNG('amn', key);
  for (let i = 0; i < d.length; i += 4) { const v = (R.f() - 0.5) * amp; d[i] += v; d[i + 1] += v * (mono ? 1 : 0.9); d[i + 2] += v * (mono ? 1 : 0.8); }
  g.putImageData(im, 0, 0);
}

// ---- the parchment: warm ground, light centre, mottled stains, fibres, faint water rings
function amPaperCanvas() {
  return amCanvas('paper', W, H, (g) => {
    const gr = g.createRadialGradient(W / 2, H * 0.47, 80, W / 2, H * 0.5, H * 0.75);
    gr.addColorStop(0, '#cdb387'); gr.addColorStop(0.55, '#bea47b'); gr.addColorStop(1, '#a58c66');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const R = RNG('amstain');
    for (let i = 0; i < 40; i++) {   // big soft clouds: the subtle mottling of old paper
      const x = R.r(-200, W + 200), y = R.r(-200, H + 200);
      for (let j = 0; j < 7; j++) { const r = R.r(80, 220), px = x + R.r(-160, 160), py = y + R.r(-160, 160), s = g.createRadialGradient(px, py, 0, px, py, r);
        s.addColorStop(0, `rgba(118,88,52,${R.r(0.025, 0.05)})`); s.addColorStop(0.7, `rgba(118,88,52,${R.r(0.01, 0.03)})`); s.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = s; g.fillRect(px - r, py - r, r * 2, r * 2); }
    }
    for (let i = 0; i < 260; i++) {
      const x = R.r(-100, W + 100), y = R.r(-100, H + 100), r = R.r(30, 260), dark = R.f() < 0.55;
      const s = g.createRadialGradient(x, y, 0, x, y, r);
      s.addColorStop(0, dark ? `rgba(110,82,48,${R.r(0.03, 0.09)})` : `rgba(235,214,170,${R.r(0.04, 0.11)})`); s.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = s; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 9; i++) {   // faint water rings, like old tide marks
      const x = R.r(100, W - 100), y = R.r(300, H - 300), r = R.r(60, 170);
      g.strokeStyle = `rgba(120,92,58,${R.r(0.05, 0.1)})`; g.lineWidth = R.r(1.5, 3); g.beginPath();
      for (let k = 0; k <= 60; k++) { const a = k / 60 * TAU, rr = r * (1 + 0.12 * Math.sin(a * 3 + i) + 0.06 * Math.sin(a * 7)); k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.stroke();
    }
    g.lineCap = 'round';
    for (let i = 0; i < 2600; i++) {   // fibres
      const x = R.r(0, W), y = R.r(0, H), a = R.r(-0.5, 0.5) + (R.f() < 0.5 ? 0 : Math.PI / 2), l = R.r(4, 22);
      g.strokeStyle = R.f() < 0.5 ? 'rgba(90,64,36,0.07)' : 'rgba(240,222,182,0.09)'; g.lineWidth = R.r(0.6, 1.4);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    amNoise(g, W, H, 'paper', 16, false);
  });
}
function amPaper(a = 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(amPaperCanvas(), 0, 0); ctx.restore(); }

// ---- the crosshatch vignette: dense brown strokes against the friezes, thinning toward the middle (3 boil variants)
function amVignetteCanvas(v) {
  return amCanvas('vig' + v, W, H, (g) => {
    const S = RNG('vig'), J = RNG('vigj', v);
    g.lineCap = 'round';
    const zone = (top) => {
      for (let i = 0; i < 2300; i++) {
        const u = Math.pow(S.f(), 2.3), y = top ? AM_BAND - 30 + u * 430 : H - AM_BAND + 30 - u * 430;
        const x = S.r(-60, W + 60), fam = S.f(), a = fam < 0.45 ? S.r(1.25, 1.85) : fam < 0.75 ? S.r(0.35, 0.75) : S.r(2.3, 2.8);
        const l = S.r(50, 190) * (1 - u * 0.4), jx = J.n(1.6), jy = J.n(1.6);
        g.strokeStyle = `rgba(48,32,18,${(0.72 - u * 0.6) * S.r(0.6, 1)})`; g.lineWidth = S.r(1.0, 2.2);
        const dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2, bend = S.n(8);
        g.beginPath(); g.moveTo(x - dx + jx, y - dy + jy); g.quadraticCurveTo(x + bend - dy * 0.1, y + bend * 0.3, x + dx + jx, y + dy + jy); g.stroke();
      }
    };
    zone(true); zone(false);
    for (let i = 0; i < 260; i++) {   // the side edges: a lighter scribble
      const left = i % 2 === 0, x = left ? S.r(-20, 70) : W - S.r(-20, 70), y = S.r(AM_BAND, H - AM_BAND), a = S.r(1.3, 1.9), l = S.r(40, 120);
      g.strokeStyle = `rgba(52,36,20,${S.r(0.12, 0.3)})`; g.lineWidth = S.r(1, 2);
      g.beginPath(); g.moveTo(x + J.n(1.5), y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const sh = g.createLinearGradient(0, 0, 0, H);   // the hatch zone darkens the paper under it
    sh.addColorStop(0, 'rgba(60,40,20,0.30)'); sh.addColorStop(0.2, 'rgba(60,40,20,0)'); sh.addColorStop(0.8, 'rgba(60,40,20,0)'); sh.addColorStop(1, 'rgba(60,40,20,0.30)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
  });
}
function amVignette(a = 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(amVignetteCanvas(B % 3), 0, 0); ctx.restore(); }

// ---- the amphora frieze: dark rules, black teeth, a Greek key, painted on terracotta and worn into the page
function amKeyPath(g, x0, y0, u, n) {   // a running key: hooks rising off a baseline, spiralling inward
  g.beginPath();
  g.moveTo(x0 - u, y0 + 6 * u); g.lineTo(x0 + n * 7 * u + u, y0 + 6 * u);
  g.moveTo(x0 - u, y0); g.lineTo(x0 + n * 7 * u + u, y0);
  for (let k = 0; k < n; k++) {
    const x = x0 + k * 7 * u + u;
    g.moveTo(x, y0 + 6 * u); g.lineTo(x, y0 + 1.5 * u); g.lineTo(x + 5 * u, y0 + 1.5 * u); g.lineTo(x + 5 * u, y0 + 4.4 * u);
    g.lineTo(x + 2.4 * u, y0 + 4.4 * u); g.lineTo(x + 2.4 * u, y0 + 3 * u); g.lineTo(x + 3.6 * u, y0 + 3 * u);
  }
}
function amFriezeCanvas() {
  return amCanvas('frieze', W, AM_BAND * 2, (g) => {
    const band = (y0, up) => {
      g.fillStyle = AM.fink;
      const rule = (y, h) => g.fillRect(0, y0 + y, W, h);
      if (!up) { rule(0, 12); rule(18, 8); } else { rule(AM_BAND - 12, 12); rule(AM_BAND - 26, 8); }
      // the teeth: black triangles, apex toward the picture
      const tw = 38, ty0 = up ? 34 : 26, th = 60;
      g.beginPath();
      for (let x = -tw; x < W + tw; x += tw) {
        if (!up) { g.moveTo(x, y0 + ty0); g.lineTo(x + tw, y0 + ty0); g.lineTo(x + tw / 2, y0 + ty0 + th); }
        else { g.moveTo(x, y0 + ty0 + th); g.lineTo(x + tw, y0 + ty0 + th); g.lineTo(x + tw / 2, y0 + ty0); }
      }
      g.fill();
      if (!up) { rule(92, 9); } else { rule(24, 10); rule(94, 9); }
      // the key
      const u = 8.4, ky = up ? 118 : 116, n = Math.ceil(W / (7 * u)) + 1;
      g.strokeStyle = AM.fink; g.lineWidth = u * 0.95; g.lineCap = 'square'; g.lineJoin = 'miter';
      amKeyPath(g, -u * 2, y0 + ky, u, n); g.stroke();
      if (!up) { rule(AM_BAND - 10, 10); } else { rule(0, 10); }
    };
    band(0, false); band(AM_BAND, true);
    // wear: chips and scratches knocked out, then the paper's own grain multiplied over the paint
    const R = RNG('wear');
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 900; i++) { g.globalAlpha = R.r(0.15, 0.6); g.beginPath(); g.ellipse(R.r(0, W), R.r(0, AM_BAND * 2), R.r(0.8, 4), R.r(0.6, 2.5), R.r(0, 3), 0, TAU); g.fill(); }
    g.lineCap = 'round';
    for (let i = 0; i < 140; i++) { g.globalAlpha = R.r(0.1, 0.4); g.lineWidth = R.r(0.6, 1.6); const x = R.r(0, W), y = R.r(0, AM_BAND * 2), a = R.r(-0.4, 0.4), l = R.r(10, 60); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 70; i++) { const x = R.r(0, W), y = R.r(0, AM_BAND * 2), r = R.r(20, 120), s = g.createRadialGradient(x, y, 0, x, y, r);
      s.addColorStop(0, `rgba(${R.f() < 0.5 ? '255,200,140' : '60,20,5'},${R.r(0.05, 0.14)})`); s.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = s; g.fillRect(x - r, y - r, r * 2, r * 2); }
    g.globalCompositeOperation = 'source-over';
    amNoise(g, W, AM_BAND * 2, 'frieze', 22);
  });
}
// the frame: the friezes and the vignette, always on top of the picture, at screen size (a: 0..1, slide: px)
function amFrame(a = 1, slide = 0) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  amVignette(a);
  ctx.globalAlpha = a;
  const fz = amFriezeCanvas(), pc = amPaperCanvas();
  ctx.drawImage(pc, 0, 0, W, AM_BAND, 0, -slide, W, AM_BAND);   // the friezes are opaque: the picture passes under them
  ctx.drawImage(pc, 0, H - AM_BAND, W, AM_BAND, 0, H - AM_BAND + slide, W, AM_BAND);
  ctx.drawImage(fz, 0, 0, W, AM_BAND, 0, -slide, W, AM_BAND);
  ctx.drawImage(fz, 0, AM_BAND, W, AM_BAND, 0, H - AM_BAND + slide, W, AM_BAND);
  // a soft shadow the friezes cast onto the page
  for (const [y, d] of [[AM_BAND - slide, 1], [H - AM_BAND + slide, -1]]) { const s = ctx.createLinearGradient(0, y, 0, y + d * 26); s.addColorStop(0, 'rgba(60,40,20,0.22)'); s.addColorStop(1, 'rgba(30,15,5,0)'); ctx.fillStyle = s; ctx.fillRect(0, Math.min(y, y + d * 26), W, 26); }
  ctx.restore();
}

// ---- line: a brown pencil-ink stroke that boils on 2s; o: w, c, a, closed, amt, frac, key, double
function amPen(P, o = {}) {
  if (o.frac === 0) return;
  ctx.save();
  ink(P, { closed: o.closed, color: o.c ?? AM.ink, w: o.w ?? 2.2, amt: o.amt ?? 0.9, key: o.key ?? 'pen' + P.length + (P[0] ? P[0][0] | 0 : 0), alpha: o.a ?? 0.92, frac: o.frac, double: o.double ?? false });
  ctx.restore();
}
const amSeg = (x1, y1, x2, y2, o = {}) => amPen([[x1, y1], [x2, y2]], { double: false, ...o });
// a watercolour wash: flat colour, a darker pooled edge, grain; then optional hatching inside
function amWash(P, c, o = {}) {
  const key = o.key ?? 'w' + (P[0][0] | 0) + (P[0][1] | 0);
  const Q = o.raw ? P : wobble(P, true, o.amt ?? 1.2, key, 9);
  ctx.save(); trace(Q, true); ctx.clip();
  const bb = bbox(Q, 4);
  ctx.globalAlpha = o.a ?? 0.88; ctx.fillStyle = c; ctx.fillRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
  if (o.light !== false) {   // a soft light from the upper left
    const g = ctx.createLinearGradient(bb.x0, bb.y0, bb.x1, bb.y1);
    g.addColorStop(0, 'rgba(255,240,210,0.16)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,5,0.22)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.55; ctx.drawImage(amPaperCanvas(), 0, 0); ctx.restore(); ctx.globalCompositeOperation = "source-over";   // the paper shows through
  ctx.globalAlpha = 1;
  if (o.hatch) for (const h of [].concat(o.hatch)) hatch(bb, { key: key + 'h' + (h.a ?? 1.57), a: h.a ?? 1.57, gap: h.gap ?? 9, c: h.c ?? AM.hatch, w: h.w ?? 1.3, al: h.al ?? 0.5, dash: h.dash ?? [40, 160], skip: [4, 30], jit: 0.8, dens: h.dens });
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = c; ctx.globalAlpha = 0.35; ctx.lineWidth = 5; trace(Q, true); ctx.stroke(); ctx.restore();
  if (o.line !== false) amPen(P, { closed: true, w: o.w ?? 2.6, key: key + 'l', a: o.la ?? 0.92 });
  return Q;
}
// long vertical hatching only (cloth with no wash), clipped to P
function amHatchIn(P, o = {}) {
  const key = o.key ?? 'h' + (P[0][0] | 0);
  ctx.save(); trace(P, true); ctx.clip();
  const bb = bbox(P, 4);
  hatch(bb, { key, a: o.a ?? 1.57, gap: o.gap ?? 9, c: o.c ?? AM.hatch, w: o.w ?? 1.3, al: o.al ?? 0.55, dash: o.dash ?? [50, 200], skip: [4, 30], jit: 0.8, dens: o.dens });
  ctx.restore();
}
// a soft cast shadow on the ground
function amShadow(x, y, rx, ry, a = 0.3) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(50,32,15,${a})`); g.addColorStop(1, 'rgba(50,32,15,0)');
  ctx.fillStyle = g; ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, rx, 0, TAU); ctx.fill(); ctx.restore();
}
function amDot(x, y, r, c, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }

// ---- text
function amText(str, x, y, size, c = AM.ink, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = amFont(size, o.caps); ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.fillStyle = c; ctx.fillText(str, x, y); ctx.restore();
}
const AM_SIDES = [[/^(athens|athens'|athenians?)$/i, 'blue'], [/^(sparta|spartans?|sparta's)$/i, 'red'], [/^(persia|persian|satrap's)$/i, 'gold'], [/^(sicily|syracuse)$/i, 'sea']];
function amWordColor(w) {
  const n = w.toLowerCase().replace(/[^a-z']/g, '');
  for (const [re, k] of AM_SIDES) if (re.test(n)) return k === 'sea' ? '#3d6f62' : k === 'blue' ? AM.blueD : k === 'red' ? AM.red : AM.goldD;
  return null;
}
// a caption block: words (with times) laid out centred in lines no wider than maxW; each word inks in at its time
// words: [{ w, t }], o: y, size, maxW, a, color
function amCaption(words, o = {}) {
  const size = o.size ?? 52, maxW = o.maxW ?? 900, lh = size * 1.22, y0 = o.y ?? 360;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = amFont(size); ctx.textBaseline = 'alphabetic';
  const sp = ctx.measureText(' ').width, lines = [[]]; let lw = 0;
  for (const w of words) {
    if (w.br && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    const ww = ctx.measureText(w.w).width;
    if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp;
  }
  lines.forEach((L, i) => {
    const tw = L.reduce((s, w) => s + w.ww, 0) + sp * (L.length - 1);
    let x = W / 2 - tw / 2; const y = y0 + i * lh;
    for (const w of L) {
      const k = o.instant ? 1 : EZ.o2(clamp((TT - w.t + 0.06) / 0.22));
      if (k > 0) {
        const col = amWordColor(w.w) ?? o.color ?? AM.ink;
        ctx.globalAlpha = k * (o.a ?? 1);
        ctx.fillStyle = 'rgba(214,190,146,0.45)'; ctx.fillText(w.w, x + 1.5, y + 2);   // a pale halo lifts the word off the hatch
        ctx.fillStyle = col; ctx.fillText(w.w, x, y + (1 - k) * 6);
      }
      x += w.ww + sp;
    }
  });
  ctx.restore();
  return y0 + (lines.length - 1) * lh;
}
const amOverlay = (f) => { if (DEFER) DEFER.push(f); else f(); };

// =====================================================================
//  props in the medium
// =====================================================================
// a hoplite shield: bronze rim with beading, a painted face and its emblem ('owl' | 'lambda' | 'disc'); sx squashes it for a flip
function amShield(x, y, r, emblem = 'owl', o = {}) {
  const sx = o.sx ?? 1, a = o.a ?? 1;
  if (Math.abs(sx) < 0.02) { amSeg(x, y - r, x, y + r, { w: 6, c: AM.goldD }); return; }
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sx, 1);
  const face = emblem === 'owl' ? AM.blue : emblem === 'lambda' ? AM.red : '#3a2618';
  amWash(ellipsePts(0, 0, r, r, 0, 72), AM.gold, { key: 'rim' + emblem, line: true, w: 3 });
  amWash(ellipsePts(0, 0, r * 0.86, r * 0.86, 0, 72), face, { key: 'face' + emblem, w: 2.4 });
  // rim beading
  for (let i = 0; i < 64; i++) { const an = i / 64 * TAU; amDot(Math.cos(an) * r * 0.93, Math.sin(an) * r * 0.93, r * 0.016, AM.goldD, 0.9); }
  ctx.globalAlpha *= 0.95;
  if (emblem === 'owl') {   // a white owl with an olive sprig, a wave border
    ctx.save(); ctx.strokeStyle = '#eae2cf'; ctx.lineWidth = r * 0.02; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const an = i / 120 * TAU, rr = r * (0.76 + 0.025 * Math.sin(an * 28)); i ? ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : ctx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    ctx.stroke(); ctx.restore();
    const s = r / 300;
    const body = [[-60, 150], [-110, 90], [-120, 10], [-90, -60], [-70, -110], [0, -125], [70, -110], [90, -60], [110, 10], [100, 90], [60, 150]].map(([px, py]) => [px * s, py * s]);
    amWash(body, '#ece4d2', { key: 'owlb', light: false, w: 2 });
    for (let i = 0; i < 18; i++) amDot((-60 + (i % 6) * 22) * s, (20 + Math.floor(i / 6) * 30) * s, 6 * s, AM.blueD, 0.8);
    for (const ex of [-42, 42]) { amDot(ex * s, -70 * s, 34 * s, '#ece4d2'); amPen(ellipsePts(ex * s, -70 * s, 34 * s, 34 * s, 0, 24), { closed: true, w: 2, key: 'owe' + ex }); amPen(ellipsePts(ex * s, -70 * s, 20 * s, 20 * s, 0, 20), { closed: true, w: 2, key: 'owi' + ex }); amDot(ex * s, -70 * s, 10 * s, AM.ink); }
    amPen([[-10 * s, -50 * s], [0, -30 * s], [10 * s, -50 * s]], { w: 2.4, key: 'beak' });
    for (const fx of [-30, 30]) amPen([[fx * s - 14 * s, 160 * s], [fx * s, 145 * s], [fx * s + 14 * s, 160 * s]], { w: 2.4, key: 'claw' + fx });
    amPen([[-150 * s, -160 * s], [-110 * s, -120 * s]], { w: 2.4, key: 'twig', c: '#eae2cf' });
    amWash(ellipsePts(-160 * s, -100 * s, 26 * s, 12 * s, -0.6, 16), '#eae2cf', { key: 'leaf1', light: false, w: 1.6 });
    amWash(ellipsePts(-120 * s, -175 * s, 26 * s, 12 * s, 0.9, 16), '#eae2cf', { key: 'leaf2', light: false, w: 1.6 });
  } else if (emblem === 'lambda') {
    amPen([[-r * 0.42, r * 0.5], [0, -r * 0.55], [r * 0.42, r * 0.5]], { w: r * 0.12, c: '#efe3c8', key: 'lam', double: false, amt: 0.8 });
  } else {   // the winged disc of Persia, in gold on dark
    const s = r / 300, Wg = (d) => { const P = []; for (let i = 0; i <= 6; i++) { const u = i / 6; P.push([d * (40 + u * 200) * s, (-30 + u * 10 - Math.sin(u * Math.PI) * 30) * s]); } for (let i = 6; i >= 0; i--) { const u = i / 6; P.push([d * (40 + u * 200) * s, (10 + u * 18 + (i % 2 ? 0 : 14)) * s]); } return P; };
    amWash(Wg(-1), AM.goldL, { key: 'wgl', w: 2, hatch: { a: 1.57, gap: 14, al: 0.35 } }); amWash(Wg(1), AM.goldL, { key: 'wgr', w: 2, hatch: { a: 1.57, gap: 14, al: 0.35 } });
    amWash(ellipsePts(0, -10 * s, 46 * s, 46 * s, 0, 30), AM.goldL, { key: 'disc', w: 2.2 });
    amWash([[-40 * s, 34 * s], [40 * s, 34 * s], [0, 120 * s]], AM.goldL, { key: 'tail', w: 2, hatch: { a: 0, gap: 12, al: 0.35 } });
  }
  // a glint that slides across the bronze
  const gl = mod(TT * 0.25 + x * 0.001, 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.12; const g = ctx.createLinearGradient(-r + gl * 4 * r - 2 * r, -r, -r + gl * 4 * r - 1.4 * r, r);
  g.addColorStop(0, 'rgba(255,230,170,0)'); g.addColorStop(0.5, 'rgba(255,230,170,1)'); g.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore();
  ctx.restore();
}

// ---- the wiggle: the whole frame displaced by a fine turbulence, a new seed every 3 frames (measured: ~2px, 8/s)
let AM_WIG = null;
function amWiggle(px = 2.6) {
  if (typeof document === 'undefined') return;
  if (!AM_WIG) {
    const NS = 'http' + '://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    for (let i = 0; i < 4; i++) {
      const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', 'amwig' + i); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '1'); f.setAttribute('height', '1');
      const t = document.createElementNS(NS, 'feTurbulence'); t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.022'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(3 + i * 7)); t.setAttribute('result', 'n');
      const d = document.createElementNS(NS, 'feDisplacementMap'); d.setAttribute('in', 'SourceGraphic'); d.setAttribute('in2', 'n'); d.setAttribute('scale', String(px * 2)); d.setAttribute('xChannelSelector', 'R'); d.setAttribute('yChannelSelector', 'G');
      f.appendChild(t); f.appendChild(d); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    AM_WIG = document.createElement('canvas'); AM_WIG.width = W; AM_WIG.height = H;
  }
  const g = AM_WIG.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `url(#amwig${Math.floor(F / 3) % 4})`; ctx.drawImage(AM_WIG, 0, 0); ctx.filter = 'none'; ctx.restore();
}

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'amphora',
  paper: AM.paper,
  backdrop(c) { amPaper(); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); amPen(P, { closed: true, w: 3 }); },
  blob(P, c, key) { amWash(P, c, { key: 'blob' + key, raw: true }); },
  hero(x, y, r) { amShield(x, y, r, 'owl'); },
  heroColor: AM.blue,
  post() { amWiggle(); },
  ones: false,
};

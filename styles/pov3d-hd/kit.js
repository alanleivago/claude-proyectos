// =====================================================================
//  styles/pov3d-hd/kit.js — "couldn't stop" POV in real 3D, 16:9 (1920x1080, 30 fps, motion on 1s).
//  One continuous first-person shot that escalates from human scale to cosmic scale; soft-lit low-poly worlds
//  (three.js r149, inlined from styles/pov3d/three.js) drawn under a 2D overlay:
//  - a HUD block top-left (small-caps label / big serif number / small-caps sub / hairline / NEXT · target / serif distance)
//  - a mirrored HUD block top-right (a second counter)
//  - one italic serif caption, bottom centre
//  Every text sits on a big, very soft dark blob (not a box). Measured from the references at 1280x720, scaled x1.5.
//  Helpers are prefixed `hd`.
// =====================================================================
const HD = {
  serif: 'Charter, "Iowan Old Style", "Source Serif 4", Georgia, Cambria, "Times New Roman", serif',
  sans: '"Helvetica Neue", Inter, "Segoe UI", Arial, sans-serif',
  text: '#fbf7f0', dim: 'rgba(251,247,240,0.78)', shade: 'rgba(12,10,9,0.55)',
  // layout (1920x1080)
  L: 108, R: 1812, top: 105, capY: 978,
};

// text with a soft halo so it reads on white clouds and on black space alike
function hdText(str, x, y, size, o = {}) {
  ctx.save(); screen();
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px ${o.font ?? HD.serif}`;
  ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.globalAlpha = clamp(o.alpha ?? 1);
  ctx.shadowColor = o.halo ?? HD.shade; ctx.shadowBlur = size * 0.5;
  ctx.fillStyle = o.color ?? HD.text; ctx.fillText(str, x, y);
  ctx.shadowBlur = 0; ctx.fillText(str, x, y);
  ctx.restore();
}
function hdWidth(str, size, o = {}) {
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px ${o.font ?? HD.serif}`;
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}
// the big, very soft dark blob under a text block (the references' "smoke" behind the HUD)
function hdBlob(x, y, rx, ry, a = 1) {
  if (a <= 0) return;
  ctx.save(); screen(); ctx.translate(x, y); ctx.scale(rx / ry, 1); ctx.globalAlpha = clamp(a);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
  g.addColorStop(0, 'rgba(14,12,12,0.42)'); g.addColorStop(0.45, 'rgba(14,12,12,0.28)'); g.addColorStop(0.75, 'rgba(14,12,12,0.1)'); g.addColorStop(1, 'rgba(14,12,12,0)');
  ctx.fillStyle = g; ctx.fillRect(-ry, -ry, ry * 2, ry * 2); ctx.restore();
}
// one HUD block. side 'L' | 'R'. o: { label, value, unit, sub, next, nextV, a, blob }
//   label  small caps over the number          ("WAVE HEIGHT")
//   value  the big serif number                ("26.2")  unit appended smaller ("m")
//   sub    small caps under the number         ("AS TALL AS THE BIGGEST WAVE EVER SURFED")
//   next / nextV  below a hairline: "NEXT  THE LIGHTHOUSE" / "in 14 m"
function hdHud(side, o) {
  const a = o.a ?? 1; if (a <= 0) return;
  const f = () => {
    const R = side === 'R', x = R ? HD.R : HD.L, al = R ? 'right' : 'left', y = HD.top;
    if (o.blob !== 0) hdBlob(R ? x - 210 : x + 210, y + 110, 430, 190, a * (o.blob ?? 0.85));
    hdText(o.label.toUpperCase(), x, y, 17, { font: HD.sans, weight: 600, spacing: 2.6, alpha: a, align: al });
    const vs = 58, us = 34;
    if (o.unit) {
      const uw = hdWidth(' ' + o.unit, us), vw = hdWidth(o.value, vs);
      const x0 = R ? x - uw - vw : x;
      hdText(o.value, x0, y + 68, vs, { alpha: a });
      hdText(' ' + o.unit, x0 + vw, y + 68, us, { alpha: a });
    } else hdText(o.value, x, y + 68, vs, { alpha: a, align: al });
    if (o.sub) hdText(o.sub.toUpperCase(), x, y + 112, 15, { font: HD.sans, weight: 600, spacing: 2.2, alpha: a * 0.82, align: al });
    if (o.next) {
      ctx.save(); screen(); ctx.globalAlpha = a * 0.4; ctx.fillStyle = HD.text;
      ctx.fillRect(R ? x - 250 : x, y + 140, 250, 1.5); ctx.restore();
      const lw = hdWidth('NEXT', 15, { font: HD.sans, weight: 600, spacing: 2.2 });
      if (R) {
        hdText(o.next.toUpperCase(), x, y + 172, 16, { font: HD.sans, weight: 700, spacing: 2.4, alpha: a, align: 'right' });
        const nw = hdWidth(o.next.toUpperCase(), 16, { font: HD.sans, weight: 700, spacing: 2.4 });
        hdText('NEXT', x - nw - 14, y + 172, 15, { font: HD.sans, weight: 600, spacing: 2.2, alpha: a * 0.6, align: 'right' });
      } else {
        hdText('NEXT', x, y + 172, 15, { font: HD.sans, weight: 600, spacing: 2.2, alpha: a * 0.6 });
        hdText(o.next.toUpperCase(), x + lw + 14, y + 172, 16, { font: HD.sans, weight: 700, spacing: 2.4, alpha: a });
      }
      if (o.nextV) hdText(o.nextV, x, y + 206, 27, { alpha: a, align: al });
    }
  };
  if (DEFER) DEFER.push(f); else f();
}
// the caption: italic serif, bottom centre, on a soft blob; fades across [t0, t1]
function hdCaption(str, t0, t1, o = {}) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.45), 1 - ev(t1 - 0.45, 0.45)) * (o.a ?? 1);
  const f = () => {
    const w = hdWidth(str, 54, { italic: true });
    hdBlob(W / 2, HD.capY - 18, w * 0.62 + 90, 70, a * 0.9);
    hdText(str, W / 2, HD.capY, 54, { italic: true, align: 'center', alpha: a });
  };
  if (DEFER) DEFER.push(f); else f();
}
// the end card: title over black, two fact lines
function hdCard(title, lines, t0) {
  const a = ev(t0, 0.8); if (a <= 0) return;
  const f = () => {
    hdText(title[0], W / 2, 470, 64, { align: 'center', alpha: a });
    if (title[1]) hdText(title[1], W / 2, 548, 64, { align: 'center', alpha: a });
    lines.forEach((l, i) => hdText(l.toUpperCase(), W / 2, 650 + i * 34, 16, { font: HD.sans, weight: 600, spacing: 3, align: 'center', alpha: ev(t0 + 0.8 + i * 0.4, 0.8) * 0.8 }));
  };
  if (DEFER) DEFER.push(f); else f();
}
// ---- glass panels (measured from the "twice as big" reference at 720p, x1.5): frosted, rounded, a light rim
HD.amber = '#f4b84a';
HD.thin = '"Helvetica Neue", "Avenir Next", Inter, Arial, sans-serif';
let HD_BLUR = null;
// a frosted rounded rectangle: the frame behind it blurred and lifted, a soft gradient sheen, a 1.5 px light rim, a soft drop shadow
function hdGlass(x, y, w, h, r = 22, a = 1, o = {}) {
  if (a <= 0) return;
  ctx.save(); screen();
  if (!HD_BLUR) { HD_BLUR = document.createElement('canvas'); HD_BLUR.width = W / 2; HD_BLUR.height = H / 2; }
  const b = HD_BLUR.getContext('2d'); b.filter = 'blur(9px)'; b.clearRect(0, 0, W / 2, H / 2); b.drawImage(ctx.canvas, 0, 0, W / 2, H / 2); b.filter = 'none';
  const path = () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  ctx.globalAlpha = clamp(a) * 0.5; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6; path(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.globalAlpha = clamp(a);
  ctx.save(); path(); ctx.clip(); ctx.drawImage(HD_BLUR, 0, 0, W, H);
  const dark = o.dark ?? 0.18, g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, `rgba(255,255,255,${0.16 - dark * 0.2})`); g.addColorStop(0.5, `rgba(${o.tint ?? '40,48,60'},${dark})`); g.addColorStop(1, `rgba(${o.tint ?? '40,48,60'},${dark + 0.08})`);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const sh = ctx.createLinearGradient(x, y, x + w * 0.6, y + h); sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(x, y, w, h);
  ctx.restore();
  path(); const rim = ctx.createLinearGradient(x, y, x + w, y + h); rim.addColorStop(0, 'rgba(255,255,255,0.62)'); rim.addColorStop(0.5, 'rgba(255,255,255,0.28)'); rim.addColorStop(1, 'rgba(255,255,255,0.45)');
  ctx.lineWidth = 1.5; ctx.strokeStyle = rim; ctx.stroke();
  ctx.restore();
}
// a thin progress bar with a filled part, a glowing dot and min / max labels under it
function hdBar(x, y, w, k, a, lo, hi, color = HD.amber) {
  ctx.save(); screen(); ctx.globalAlpha = clamp(a);
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x, y - 1.5, w, 3);
  const fx = x + w * clamp(k); ctx.fillStyle = color; ctx.fillRect(x, y - 1.5, fx - x, 3);
  ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(fx, y, 4.5, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  if (lo) hdText(lo, x, y + 24, 14, { font: HD.thin, weight: 500, spacing: 0.6, alpha: a * 0.75, halo: 'rgba(0,0,0,0.25)' });
  if (hi) hdText(hi, x + w, y + 24, 14, { font: HD.thin, weight: 500, spacing: 0.6, alpha: a * 0.75, align: 'right', halo: 'rgba(0,0,0,0.25)' });
}
// a glass measurement panel. side 'L' | 'R'. o: { label, value, unit, sub, next, nextV, bar: { k, lo, hi }, a }
function hdPanel(side, o) {
  const a = o.a ?? 1; if (a <= 0) return;
  const f = () => {
    const R = side === 'R', w = o.w ?? 470, x = R ? W - 56 - w : 56, y = 52, pad = 30, h = 148 + (o.next ? 52 : 0) + (o.bar ? 50 : 0);
    hdGlass(x, y, w, h, 22, a);
    const al = R ? 'right' : 'left', tx = R ? x + w - pad : x + pad, halo = 'rgba(0,0,0,0.3)';
    hdText(o.label.toUpperCase(), tx, y + 44, 16, { font: HD.thin, weight: 600, spacing: 2.6, alpha: a, align: al, halo });
    const vs = 66, us = 30, vw = hdWidth(o.value, vs, { font: HD.thin, weight: 300 }), uw = o.unit ? hdWidth(' ' + o.unit, us, { font: HD.thin, weight: 400 }) : 0;
    const x0 = R ? tx - vw - uw : tx;
    hdText(o.value, x0, y + 112, vs, { font: HD.thin, weight: 300, alpha: a, halo });
    if (o.unit) hdText(' ' + o.unit, x0 + vw, y + 112, us, { font: HD.thin, weight: 400, alpha: a, halo });
    if (o.sub) hdText(o.sub, tx, y + 140, 18, { font: HD.thin, weight: 500, alpha: a * 0.9, align: al, halo });
    let yy = y + 148;
    if (o.next) {
      ctx.save(); screen(); ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#fff'; ctx.fillRect(x + pad, yy + 6, w - 2 * pad, 1); ctx.restore();
      const nl = 'NEXT', nw = hdWidth(nl + '  ', 14, { font: HD.thin, weight: 700, spacing: 2.2 });
      const body = o.next.toUpperCase(), vtxt = o.nextV ? '  ' + o.nextV : '';
      if (R) { hdText(body + vtxt, tx, yy + 36, 15, { font: HD.thin, weight: 600, spacing: 1.6, alpha: a, align: 'right', halo }); }
      else {
        hdText(nl, tx, yy + 36, 14, { font: HD.thin, weight: 700, spacing: 2.2, alpha: a, color: HD.amber, halo });
        hdText(body, tx + nw, yy + 36, 15, { font: HD.thin, weight: 600, spacing: 1.6, alpha: a, halo });
        const bw = hdWidth(body + '  ', 15, { font: HD.thin, weight: 600, spacing: 1.6 });
        if (o.nextV) hdText(o.nextV, tx + nw + bw, yy + 36, 20, { italic: true, alpha: a, halo });
      }
      yy += 52;
    }
    if (o.bar) hdBar(x + pad, yy + 14, w - 2 * pad, o.bar.k, a, o.bar.lo, o.bar.hi);
  };
  if (DEFER) DEFER.push(f); else f();
}
// a glass fact card on the right, under the right panel. o: { title, value, unit, lines: [..], bars: [[label, k, valueText, hot]], a }
function hdFact(o) {
  const a = o.a ?? 1; if (a <= 0) return;
  const f = () => {
    const w = 430, x = W - 56 - w, y = o.y ?? 320, pad = 28, halo = 'rgba(0,0,0,0.3)';
    const h = 132 + o.lines.length * 26 + (o.bars ? o.bars.length * 48 + 10 : 0);
    hdGlass(x, y, w, h, 20, a, { dark: 0.3 });
    hdText(o.title.toUpperCase(), x + pad, y + 40, 15, { font: HD.thin, weight: 700, spacing: 2.4, color: HD.amber, alpha: a, halo });
    const vw = hdWidth(o.value, 54);
    hdText(o.value, x + pad, y + 98, 54, { alpha: a, halo });
    if (o.unit) hdText(' ' + o.unit, x + pad + vw, y + 98, 26, { alpha: a, halo });
    let yy = y + 132;
    o.lines.forEach((l) => { hdText(l, x + pad, yy, 17, { font: HD.thin, weight: 500, alpha: a * 0.86, halo }); yy += 26; });
    if (o.bars) { yy += 10; o.bars.forEach(([lab, k, vt, hot]) => {
      hdText(lab.toUpperCase(), x + pad, yy + 4, 13, { font: HD.thin, weight: 700, spacing: 1.4, alpha: a * (hot ? 1 : 0.8), color: hot ? HD.amber : HD.text, halo });
      hdText(vt, x + w - pad, yy + 4, 13, { font: HD.thin, weight: 700, alpha: a, align: 'right', halo });
      ctx.save(); screen(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + pad, yy + 14, w - 2 * pad, 9);
      ctx.fillStyle = hot ? HD.amber : 'rgba(255,255,255,0.85)'; ctx.fillRect(x + pad, yy + 14, (w - 2 * pad) * clamp(k), 9); ctx.restore();
      yy += 48; }); }
  };
  if (DEFER) DEFER.push(f); else f();
}
// en-US numbers: 1,234,567
const hdNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// a length with sensible units and 3 significant figures: 1.24 m, 26.2 m, 524 m, 3.68 km, 1.23 million km
function hdLen(m) {
  const sig = (v) => (v >= 100 ? hdNum(v) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
  if (m < 1000) return [sig(m), 'm'];
  const km = m / 1000;
  if (km < 1e6) return [km >= 1000 ? hdNum(km) : sig(km), 'km'];
  return [sig(km / 1e6), 'million km'];
}

// =====================================================================
const STYLE = {
  name: 'pov3d-hd',
  paper: '#0b0d12',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { ctx.save(); ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); },
  heroColor: '#fff6d8',
  post() {   // a lens vignette
    ctx.save(); screen(); const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,6,6,0.32)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  ones: true,
};

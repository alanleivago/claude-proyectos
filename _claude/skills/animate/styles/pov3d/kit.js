// =====================================================================
//  styles/pov3d/kit.js (2D overlay helpers for the three.js POV look) — a "what if" POV look: one fixed wide camera on a busy place, flat-shaded
//  low-poly shapes (lit face + shadow face, no outlines), soft atmospheric gradients and glow, tiny people,
//  a serif HUD counter on the left and an italic serif caption in the lower third. Motion on 1s.
//  Built on kit/core.js. Helpers are prefixed `pv`.
// =====================================================================
const PV = {
  serif: 'Georgia, Cambria, "Times New Roman", "DejaVu Serif", serif',
  sans: '"Segoe UI", "Helvetica Neue", Arial, "DejaVu Sans", sans-serif',
  text: '#fbf6ee', shade: 'rgba(30,22,18,0.55)',
  skin: ['#f1c9a5', '#d9a47c', '#b47a52', '#8a5636', '#5e3a26'],
  wear: ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#f4f1ea', '#7b4fc9', '#ef8a3a', '#1f2d3d'],
};

// colour blend that accepts '#hex' or 'rgb()' and returns '#hex' (so blends nest)
const pvRGB = (c) => (c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number));
function pvMix(a, b, t) { const A = pvRGB(a), Bc = pvRGB(b), k = clamp(t); return '#' + A.map((v, i) => Math.round(v + (Bc[i] - v) * k).toString(16).padStart(2, '0')).join(''); }
// a flat polygon (no outline)
function pvPoly(P, c) { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
// a soft radial glow
function pvGlow(x, y, r, c, a = 1) {
  if (r <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(a); const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// a vertical gradient band
function pvBand(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(-20, y0, W + 40, y1 - y0);
}
// whole-frame tint (screen space)
function pvTint(c, a, mode = 'source-over') { if (a <= 0) return; ctx.save(); screen(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = clamp(a); ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// a tiny low-poly person. s = height in px. o: { wear, skin, run (0..1 phase active), arms: 'up'|'eyes', dark (0..1 char) }
function pvPerson(x, y, s, o = {}) {
  const dk = o.dark ?? 0, col = (c) => (dk > 0 ? pvMix(c, '#2b1d16', dk) : c);
  const sk = col(o.skin), wr = col(o.wear), leg = o.run ? Math.sin(o.run * TAU) * 0.35 : 0;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.beginPath(); ctx.ellipse(0, s * 0.02, s * 0.22, s * 0.06, 0, 0, TAU); ctx.fill();
  if (o.lying) {   // lying on a towel
    ctx.fillStyle = sk; ctx.fillRect(-s * 0.45, -s * 0.12, s * 0.9, s * 0.12);
    ctx.fillStyle = wr; ctx.fillRect(-s * 0.12, -s * 0.13, s * 0.3, s * 0.13);
    ctx.beginPath(); ctx.arc(-s * 0.5, -s * 0.08, s * 0.08, 0, TAU); ctx.fillStyle = sk; ctx.fill();
    ctx.restore(); return;
  }
  ctx.strokeStyle = sk; ctx.lineWidth = Math.max(1.5, s * 0.1); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * 0.06, -s * 0.45); ctx.lineTo(-s * 0.08 - leg * s * 0.3, 0); ctx.moveTo(s * 0.06, -s * 0.45); ctx.lineTo(s * 0.08 + leg * s * 0.3, 0); ctx.stroke();
  pvPoly([[-s * 0.13, -s * 0.82], [s * 0.13, -s * 0.82], [s * 0.11, -s * 0.42], [-s * 0.11, -s * 0.42]], wr);
  pvPoly([[0, -s * 0.82], [s * 0.13, -s * 0.82], [s * 0.11, -s * 0.42], [0, -s * 0.42]], 'rgba(0,0,0,0.12)');
  ctx.beginPath();
  if (o.arms === 'up') { ctx.moveTo(-s * 0.12, -s * 0.78); ctx.lineTo(-s * 0.2, -s * 1.05); ctx.moveTo(s * 0.12, -s * 0.78); ctx.lineTo(s * 0.2, -s * 1.05); }
  else if (o.arms === 'eyes') { ctx.moveTo(-s * 0.12, -s * 0.78); ctx.lineTo(-s * 0.03, -s * 0.92); ctx.moveTo(s * 0.12, -s * 0.78); ctx.lineTo(s * 0.03, -s * 0.92); }
  else { const a = leg * s * 0.25; ctx.moveTo(-s * 0.13, -s * 0.78); ctx.lineTo(-s * 0.17 + a, -s * 0.45); ctx.moveTo(s * 0.13, -s * 0.78); ctx.lineTo(s * 0.17 - a, -s * 0.45); }
  ctx.lineWidth = Math.max(1.2, s * 0.07); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -s * 0.92, s * 0.1, 0, TAU); ctx.fillStyle = sk; ctx.fill();
  ctx.restore();
}

// a beach umbrella: pole + a low-poly dome in alternating stripes
function pvUmbrella(x, y, s, cA, cB, o = {}) {
  const dk = o.dark ?? 0, col = (c) => (dk > 0 ? pvMix(c, '#2b1d16', dk) : c);
  ctx.fillStyle = 'rgba(40,30,20,0.22)'; ctx.beginPath(); ctx.ellipse(x, y + s * 0.05, s * 0.6, s * 0.16, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = col('#e8e2d6'); ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.75); ctx.stroke();
  if (o.gone) return;
  const n = 8, cy = y - s * 0.75, rx = s * 0.6, ry = s * 0.26;
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
    pvPoly([[x, cy - ry], [x + Math.cos(a0) * rx, cy + Math.sin(a0) * ry * 0.2 + ry * 0.35], [x + Math.cos(a1) * rx, cy + Math.sin(a1) * ry * 0.2 + ry * 0.35]], col(i % 2 ? cA : cB));
  }
}

// text with a soft dark halo (readable over white skies)
function pvText(str, x, y, size, o = {}) {
  ctx.save(); screen();
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px ${o.font ?? PV.serif}`;
  ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.globalAlpha = clamp(o.alpha ?? 1);
  ctx.shadowColor = o.halo ?? PV.shade; ctx.shadowBlur = size * 0.6;
  ctx.fillStyle = o.color ?? PV.text; ctx.fillText(str, x, y);
  ctx.shadowBlur = 0; ctx.fillText(str, x, y);
  ctx.restore();
}
// a feathered dark ellipse under text (rx, ry = half sizes); returns undefined
function pvFeather(x, y, rx, ry, a = 1) {
  if (a <= 0) return;
  ctx.save(); screen(); ctx.translate(x, y); ctx.scale(rx / ry, 1); ctx.globalAlpha = clamp(a);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry); g.addColorStop(0, 'rgba(22,18,16,0.56)'); g.addColorStop(0.5, 'rgba(22,18,16,0.34)'); g.addColorStop(0.8, 'rgba(22,18,16,0.12)'); g.addColorStop(1, 'rgba(25,18,14,0)');
  ctx.fillStyle = g; ctx.fillRect(-ry, -ry, ry * 2, ry * 2); ctx.restore();
}
// the HUD counter: LABEL / big value / sub-label, left side
function pvHud(label, value, sub, a = 1) {
  const f = () => {
    pvFeather(250, 852, 370, 145, a * 0.9);
    pvText(label.toUpperCase(), 64, 800, 26, { font: PV.sans, weight: 700, spacing: 4, alpha: a });
    pvText(value, 60, 872, 76, { alpha: a });
    if (sub) pvText(sub.toUpperCase(), 64, 914, 20, { font: PV.sans, weight: 600, spacing: 3, alpha: a * 0.85 });
  };
  if (DEFER) DEFER.push(f); else f();
}
// the caption: italic serif, centred in the lower third; fades in/out across [t0, t1]
function pvCaption(str, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { pvFeather(CX, 1374, 570, 120, a); pvText(str, CX, 1390, 52, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
// the title: big roman serif, two lines, upper third
function pvTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => pvFeather(CX, 470 + (lines.length - 1) * 46 - 26, 480, 190, a) || lines.forEach((l, i) => pvText(l, CX, 470 + i * 92, 80, { align: 'center', alpha: a }));
  if (DEFER) DEFER.push(f); else f();
}
// es-ES number formatting: 150.000.000
const pvNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// =====================================================================
const STYLE = {
  name: 'pov3d',
  paper: '#e9d9c0',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { pvGlow(x, y, r * 2, '#fff6d8'); },
  heroColor: '#fff6d8',
  post() {   // a gentle vignette, like a lens
    ctx.save(); screen(); const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,12,8,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  ones: true,
};

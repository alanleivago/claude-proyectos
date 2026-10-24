// =====================================================================
//  styles/scroll3d/kit.js — the 2D overlay for the "scroll" 3D explainer look: a three.js world (pov3d's engine,
//  styles/pov3d/three.js) drawn onto the 2D canvas, then karaoke captions from VOICE, bold sans labels with leader
//  lines, white tags, small grey notes. Every text is Helvetica FreeSans Bold (assets/FreeSans.ttf, embedded by the
//  build). Motion on 1s. Helpers are prefixed `s3`.
// =====================================================================
const S3 = {
  font: '"FreeSans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  white: '#f4f1ea', grey: '#8d8780', yellow: '#f2b632', cyan: '#3fd0d6', note: '#b9b2a8',
  capY: 1438, capSize: 54,
};
const s3Font = (size) => `700 ${size}px ${S3.font}`;

// project a THREE.Vector3 (world) to canvas pixels with the camera; returns [x, y, inFront]
function s3Proj(v, cam) { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z < 1]; }

// a text; o: { size, color, align, alpha, spacing, base }
function s3Text(str, x, y, o = {}) {
  const a = clamp(o.alpha ?? 1); if (a <= 0) return;
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = s3Font(o.size ?? 44);
  ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = o.base ?? 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.shadowColor = 'rgba(8,6,10,0.7)'; ctx.shadowBlur = (o.size ?? 44) * 0.35;   // a soft dark halo: labels stay readable over bright 3D
  ctx.fillStyle = o.color ?? S3.white; ctx.fillText(str, x, y); ctx.restore();
}
// a label with a sub-line (e.g. "solo lo que se movió" / "los siguientes 3 fotogramas")
function s3Label(x, y, title, sub, o = {}) {
  const a = o.alpha ?? 1, c = o.color ?? S3.yellow, sz = o.size ?? 50;
  s3Text(title, x, y, { size: sz, color: c, align: o.align, alpha: a });
  if (sub) s3Text(sub, x + (o.subDx ?? 0), y + sz * 0.78, { size: Math.round(sz * 0.6), color: o.subColor ?? c, align: o.align, alpha: a * 0.9, spacing: 1 });
}
// a thin leader line from (x0, y0) to (x1, y1) with a dot at the end; drawn as far as u (0..1)
function s3Leader(x0, y0, x1, y1, c, a = 1, u = 1, w = 2.5) {
  if (a <= 0 || u <= 0) return;
  ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w;
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  if (u >= 1) { ctx.beginPath(); ctx.arc(x1, y1, w * 2.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// a white tag with black text ("Fotograma clave"), anchored by its bottom-right corner
function s3Tag(x, y, str, a = 1, o = {}) {
  if (a <= 0) return;
  const sz = o.size ?? 46, px = sz * 0.36;
  ctx.save(); screen(); ctx.font = s3Font(sz); const w = ctx.measureText(str).width + px * 2, h = sz * 1.45;
  ctx.globalAlpha = clamp(a); ctx.fillStyle = o.bg ?? '#f6f3ec'; ctx.fillRect(x - w, y - h, w, h);
  ctx.fillStyle = o.color ?? '#141210'; ctx.textBaseline = 'middle'; ctx.fillText(str, x - w + px, y - h / 2 + sz * 0.04);
  ctx.restore();
}

// ---- HUD: the status pill (top centre: a dot + a state in caps) and a readout box (bottom left: big value + unit + label)
function s3Pill(str, a = 1, o = {}) {
  if (a <= 0) return;
  const sz = o.size ?? 30, y = o.y ?? 300;
  ctx.save(); screen(); ctx.font = s3Font(sz); ctx.letterSpacing = '4px';
  const tw = ctx.measureText(str).width, h = sz * 1.7, w = tw + sz * 2.6, x = CX - w / 2;
  ctx.globalAlpha = clamp(a) * 0.82; ctx.fillStyle = '#16130f'; ctx.beginPath(); ctx.roundRect(x, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.globalAlpha = clamp(a); ctx.fillStyle = o.dot ?? S3.white; ctx.beginPath(); ctx.arc(x + sz * 0.95, y, sz * 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = S3.white; ctx.textBaseline = 'middle'; ctx.fillText(str, x + sz * 1.7, y + sz * 0.04);
  ctx.restore();
}
function s3Readout(value, unit, label, a = 1, o = {}) {
  if (a <= 0) return;
  const x = o.x ?? 60, y = o.y ?? 1250, c = o.color ?? S3.white, bar = o.bar ?? S3.yellow;
  ctx.save(); screen(); ctx.font = s3Font(70); const vw = ctx.measureText(value).width; ctx.font = s3Font(34); const uw = ctx.measureText(unit).width;
  ctx.font = s3Font(24); ctx.letterSpacing = '3px'; const lw = ctx.measureText(label).width; ctx.letterSpacing = '0px';
  const w = 40 + vw + 12 + uw + 22 + lw + 34, h = 104;
  ctx.globalAlpha = clamp(a) * 0.82; ctx.fillStyle = '#16130f'; ctx.beginPath(); ctx.roundRect(x, y - h, w, h, 10); ctx.fill();
  ctx.globalAlpha = clamp(a); ctx.fillStyle = bar; ctx.fillRect(x + 14, y - h + 18, 7, h - 36);
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = c; ctx.font = s3Font(70); ctx.fillText(value, x + 40, y - 26);
  ctx.font = s3Font(34); ctx.fillText(unit, x + 40 + vw + 12, y - 28);
  ctx.font = s3Font(24); ctx.letterSpacing = '3px'; ctx.fillStyle = S3.note; ctx.fillText(label, x + 40 + vw + 12 + uw + 22, y - 30);
  ctx.restore();
}
// the step bar (top): dots on a line, labels under; the active step bright (and coloured), the rest dim
function s3Steps(labels, active, a = 1, o = {}) {
  if (a <= 0) return; const y = o.y ?? 330, x0 = o.x0 ?? 110, x1 = o.x1 ?? 970, n = labels.length, c = o.color ?? S3.yellow;
  ctx.save(); screen(); ctx.globalAlpha = clamp(a) * 0.5; ctx.strokeStyle = S3.grey; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
  labels.forEach((l, i) => { const x = lerp(x0, x1, i / (n - 1)), on = i === Math.round(active), k = clamp(1 - Math.abs(active - i));
    ctx.save(); screen(); ctx.globalAlpha = clamp(a); ctx.fillStyle = on ? c : i < active ? S3.white : S3.grey; ctx.beginPath(); ctx.arc(x, y, 7 + 4 * k, 0, TAU); ctx.fill(); ctx.restore();
    s3Text(l, x, y + 44, { size: 24, color: on ? S3.white : S3.grey, align: 'center', alpha: a * (0.55 + 0.45 * k), spacing: 3 }); });
}
// a small grey honesty note at the top-left ("RECREADO · ILUSTRATIVO")
function s3Note(str, a = 1, o = {}) { s3Text(str, o.x ?? 60, o.y ?? 230, { size: o.size ?? 22, color: S3.note, alpha: a * 0.85, spacing: 3 }); }

// ---- karaoke captions: VOICE words in chunks of a few words; spoken words white, the rest grey, in a dark box
let S3_CHUNKS = null;
function s3Chunks() {
  if (S3_CHUNKS) return S3_CHUNKS;
  const out = [];
  for (const L of VOICE.lines) {
    let cur = null;
    L.words.forEach((w, i) => {
      const txt = w.w.replace(/…/g, '');
      const len = cur ? cur.words.map((x) => x.w).join(' ').length + 1 + txt.length : txt.length;
      const prev = cur && cur.words[cur.words.length - 1];
      if (!cur || len > 21 || /[.:;?!]$/.test(prev.w) || (/[,]$/.test(prev.w) && cur.words.length >= 2) || w.t0 - prev.t1 > 0.45) { cur = { words: [] }; out.push(cur); }
      cur.words.push({ w: txt, t0: w.t0, t1: w.t1 });
    });
  }
  out.forEach((c, i) => { c.t0 = c.words[0].t0; c.t1 = c.words[c.words.length - 1].t1; });
  out.forEach((c, i) => { const n = out[i + 1]; c.until = n ? (n.t0 - c.t1 > 1.0 ? c.t1 + 0.5 : n.t0) : c.t1 + 1.2; });
  return (S3_CHUNKS = out);
}
function s3Caption(t = TT, o = {}) {
  const c = s3Chunks().find((k) => t >= k.t0 - 0.05 && t < k.until); if (!c) return;
  const sz = o.size ?? S3.capSize, y = o.y ?? S3.capY, a = o.alpha ?? 1;
  ctx.save(); screen(); ctx.font = s3Font(sz);
  const sp = ctx.measureText(' ').width, ws = c.words.map((w) => ctx.measureText(w.w).width);
  const tw = ws.reduce((s, x) => s + x, 0) + sp * (ws.length - 1), padX = sz * 0.5, h = sz * 1.62;
  const fade = clamp((c.until - t) / 0.12);
  ctx.globalAlpha = a * fade * 0.86; ctx.fillStyle = '#16130f';
  ctx.beginPath(); ctx.roundRect(CX - tw / 2 - padX, y - h / 2, tw + padX * 2, h, 6); ctx.fill();
  ctx.globalAlpha = a * fade; ctx.textBaseline = 'middle'; let x = CX - tw / 2;
  c.words.forEach((w, i) => { const said = t >= w.t0 - 0.02, now = said && (i === c.words.length - 1 ? t < w.t1 + 0.25 : t < c.words[i + 1].t0 - 0.02);
    ctx.fillStyle = S3.hl && now ? S3.yellow : said ? S3.white : S3.grey; ctx.fillText(w.w, x, y + sz * 0.05);
    if (S3.hl && now) { ctx.fillRect(x, y + sz * 0.58, ws[i] * clamp((t - w.t0) / Math.max(0.08, w.t1 - w.t0)), 3); }
    x += ws[i] + sp; });
  ctx.restore();
}

// =====================================================================
const STYLE = {
  name: 'scroll3d',
  paper: '#0c0a08',
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) {},
  heroColor: '#f2b632',
  post() {   // a soft lens vignette
    ctx.save(); screen(); const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.5, H * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,4,3,0.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  ones: true,
};

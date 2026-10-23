// =====================================================================
//  styles/voltreal/kit.js — Bitvolts "real" look (measured from local refs, references/voltamps/new/).
//  Cinematic 2.5D objects on a dark charcoal / warm-brown ground: soft key light, gradients for volume,
//  drop shadows, depth-of-field blur on far layers, bokeh specks, warm amber glow for energy, cartoon
//  hands. Karaoke captions top-centre: word by word, current word white semibold, earlier words grey,
//  keywords inside a blue text-selection box. Motion on 1s.
//  Needs from the piece head: W, H, VOICE (for captions), VMONO.
// =====================================================================
const VR = {
  bg0: '#1c1c1c', bg1: '#070707', warm0: '#2a170c', warm1: '#0a0706', night0: '#0f1428', night1: '#04040a',
  ink: '#f4f4f4', grey: '#8a8a8a', dim: '#5c5c5c',
  amber: '#f5b74a', gold: '#ffd27a', red: '#ff4d4d', green: '#3fd27a', blue: '#3b82f6', navy: '#0f2350',
  skin0: '#f2c2aa', skin1: '#c58768', skin2: '#9c5f45', nail: '#f6d3cc',
  metal0: '#4a4f5c', metal1: '#22252d', glass: '#0d1018',
};
const VR_SANS = '"Avenir Next", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';

// ---- the ground: a lit centre falling into black; tone = 'neutral' | 'warm' | 'night'
function vrBg(tone = 'neutral', o = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [c0, c1] = tone === 'warm' ? [VR.warm0, VR.warm1] : tone === 'night' ? [VR.night0, VR.night1] : [VR.bg0, VR.bg1];
  const g = ctx.createRadialGradient(W / 2, H * (o.cy ?? 0.55), 40, W / 2, H * (o.cy ?? 0.55), H * 0.85);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.light) {   // a warm pool of light
    const l = ctx.createRadialGradient(o.light[0], o.light[1], 10, o.light[0], o.light[1], o.light[2] ?? 600);
    l.addColorStop(0, `rgba(255,190,110,${o.lightK ?? 0.18})`); l.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = l; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
// floating specks and soft bokeh discs (depth)
function vrBokeh(n = 26, a = 1, key = 'bk', warm = true) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < n; i++) {
    const R = RNG(key, i), x = mod(R.r(0, W) + TT * R.r(-6, 6), W), y = mod(R.r(0, H) - TT * R.r(3, 12), H);
    const big = i % 5 === 0, r = big ? R.r(18, 46) : R.r(1.5, 3);
    const k = (0.5 + 0.5 * Math.sin(TT * R.r(0.4, 1.2) + i)) * a * (big ? 0.12 : 0.55);
    ctx.fillStyle = warm ? `rgba(255,214,160,${k})` : `rgba(200,215,255,${k})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// grain + vignette (STYLE.post)
let VR_NOISE = null;
function vrPost(k = 1) {
  if (!VR_NOISE) { VR_NOISE = document.createElement('canvas'); VR_NOISE.width = VR_NOISE.height = 256; const g = VR_NOISE.getContext('2d'), im = g.createImageData(256, 256), R = RNG('vrg');
    for (let i = 0; i < im.data.length; i += 4) { const v = R.f() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const R = RNG('vrgf', F); const ox = R.r(0, 256) | 0, oy = R.r(0, 256) | 0;
  ctx.globalAlpha = 0.035 * k; ctx.globalCompositeOperation = 'overlay';
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(VR_NOISE, x, y);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.32, W / 2, H * 0.5, H * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---- volume helpers
function vrShadow(x, y, w, h, k = 0.55, blur = 40) {   // a soft contact shadow under an object
  ctx.save(); ctx.filter = `blur(${blur}px)`; ctx.fillStyle = `rgba(0,0,0,${k})`;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); ctx.fill(); ctx.restore();
}
// a rounded slab seen slightly from above: top face (gradient), front side (thickness), rim highlight
function vrSlab(x, y, w, h, d, r, top0, top1, side, o = {}) {
  const a = o.a ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  if (o.shadow !== false) { ctx.save(); ctx.filter = 'blur(28px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 10, y - h / 2 + d + 24, w - 20, h, r); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = side; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2 + d, w, h, r); ctx.fill();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, top0); g.addColorStop(1, top1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, r); ctx.fill();
  ctx.strokeStyle = o.rim ?? 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - w / 2 + 1, y - h / 2 + 1, w - 2, h - 2, r); ctx.stroke();
  ctx.restore();
}
// glowing energy line (amber by default)
function vrGlow(P, c = VR.amber, w = 4, k = 1, o = {}) {
  if (P.length < 2 || k <= 0) return;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); if (o.closed) ctx.closePath();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = c; ctx.globalAlpha *= 0.14 * k; ctx.lineWidth = w * 8; ctx.stroke();
  ctx.globalAlpha /= 0.14; ctx.globalAlpha *= 0.35; ctx.lineWidth = w * 3; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha /= 0.35;
  ctx.strokeStyle = o.core ?? '#fff1d0'; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function vrHalo(x, y, r, c = '255,190,90', k = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${0.45 * k})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
// a cartoon fingertip / thumb pointing along `ang` (radians, 0 = right); tip at (x, y)
function vrFinger(x, y, ang, s = 1, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang);
  const L = 520 * s, Wd = 150 * s;
  ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.roundRect(-L + 20, -Wd / 2 + 26, L, Wd, Wd / 2); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, -Wd / 2, 0, Wd / 2); g.addColorStop(0, VR.skin0); g.addColorStop(0.55, VR.skin1); g.addColorStop(1, VR.skin2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-L, -Wd / 2, L, Wd, Wd / 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90,40,25,0.45)'; ctx.lineWidth = 3; ctx.stroke();
  // nail
  const ng = ctx.createLinearGradient(0, -Wd * 0.3, 0, Wd * 0.3); ng.addColorStop(0, '#fff2ee'); ng.addColorStop(1, VR.nail);
  ctx.fillStyle = ng; ctx.beginPath(); ctx.roundRect(-Wd * 0.95, -Wd * 0.34, Wd * 0.82, Wd * 0.68, [Wd * 0.18, Wd * 0.34, Wd * 0.34, Wd * 0.18]); ctx.fill();
  ctx.strokeStyle = 'rgba(150,80,60,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-Wd * 0.88, -Wd * 0.18); ctx.lineTo(-Wd * 0.3, -Wd * 0.2); ctx.stroke();
  ctx.restore();
}

// ---- type
function vrText(str, x, y, size, c, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 600} ${size}px ${o.mono ? VMONO : VR_SANS}`;
  ctx.fillStyle = c; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  if (o.glow) { ctx.shadowColor = o.glowC ?? c; ctx.shadowBlur = o.glow; }
  if (o.letter) ctx.letterSpacing = o.letter + 'px';
  ctx.fillText(str, x, y); ctx.restore();
}

// ---- karaoke captions from VOICE: phrases of ≤ maxW words / 2 lines; keywords get the blue selection box
// opts: { y, size, keys: Set of lowercased words, hide: (t) => bool }
let VR_PHRASES = null;
function vrBuildPhrases(maxChars = 19, maxWords = 5) {
  const out = [];
  for (const L of VOICE.lines) {
    let cur = [];
    const flush = () => { if (cur.length) out.push(cur); cur = []; };
    L.words.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(' ').length, end = /[.,!?:;]$/.test(w.w);
      if ((end && cur.length >= 2) || len > maxChars * 2 - 8 || cur.length >= maxWords) flush();
    });
    flush();
  }
  // each phrase lives from its first word to the next phrase's first word (or its last word + 0.6s)
  out.forEach((p, i) => { p.t0 = p[0].t0 - 0.05; p.t1 = i + 1 < out.length ? Math.min(out[i + 1][0].t0 - 0.05, p[p.length - 1].t1 + 0.9) : p[p.length - 1].t1 + 0.9; });
  return out;
}
function vrCaptions(o = {}) {
  if (!VR_PHRASES) VR_PHRASES = vrBuildPhrases();
  const p = VR_PHRASES.find((q) => TT >= q.t0 && TT < q.t1);
  if (!p || (o.hide && o.hide(TT))) return;
  const size = o.size ?? 64, y0 = o.y ?? 352, lh = size * 1.18, keys = o.keys ?? new Set();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  // split into ≤ 2 lines by character count
  const words = p.map((w) => w.w), total = words.join(' ').length;
  let split = words.length, acc = 0;
  if (total > 22) for (let i = 0; i < words.length; i++) { acc += words[i].length + 1; if (acc >= total / 2) { split = i + 1; break; } }
  const lines = [p.slice(0, split), p.slice(split)].filter((l) => l.length);
  const font = (b) => `${b ? 700 : 500} ${size}px ${VR_SANS}`;
  lines.forEach((ln, li) => {
    ctx.font = font(true);
    const widths = ln.map((w) => ctx.measureText(w.w + ' ').width), lineW = widths.reduce((s, v) => s + v, 0) - ctx.measureText(' ').width;
    let x = W / 2 - lineW / 2; const y = y0 + li * lh;
    ln.forEach((w, wi) => {
      const shown = TT >= w.t0 - 0.02, cur = shown && (TT < w.t1 + 0.05 || wi === ln.length - 1 && li === lines.length - 1 && TT < w.t1 + 0.3);
      const key = keys.has(w.w.toLowerCase().replace(/[^a-z0-9'%]/g, ''));
      if (shown) {
        const bold = cur || key;
        ctx.font = font(bold);
        const ww = ctx.measureText(w.w).width;
        if (key) {   // the text-selection box
          const k = clamp((TT - w.t0) / 0.12);
          ctx.fillStyle = `rgba(15,35,80,${0.9 * k})`; ctx.fillRect(x - 8, y - size * 0.86, ww + 16, size * 1.12);
          ctx.strokeStyle = VR.blue; ctx.lineWidth = 2.5; ctx.globalAlpha = k; ctx.strokeRect(x - 8, y - size * 0.86, ww + 16, size * 1.12);
          ctx.fillStyle = VR.blue; ctx.beginPath(); ctx.arc(x - 8, y - size * 0.86, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x + ww + 8, y + size * 0.26, 6, 0, TAU); ctx.fill();
          ctx.globalAlpha = 1;
        }
        const pop = cur ? 1 + 0.04 * (1 - clamp((TT - w.t0) / 0.15)) : 1;
        ctx.save(); ctx.translate(x + ww / 2, y); ctx.scale(pop, pop);
        ctx.fillStyle = bold ? VR.ink : VR.grey; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.textAlign = 'center';
        ctx.fillText(w.w, 0, 0); ctx.restore();
      }
      x += widths[wi];
    });
  });
  ctx.restore();
}

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'voltreal',
  paper: '#121212',
  backdrop(c) { vrBg('neutral'); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c, key) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r, o) { vrHalo(x, y, r, '255,190,90', 1); },
  heroColor: VR.amber,
  post() { vrPost(1); },
  ones: true,
};

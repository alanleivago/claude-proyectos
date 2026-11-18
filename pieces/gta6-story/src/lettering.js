// ---- lettering: speech bubbles, caption boxes, SFX (GTA comic). Fonts: Bangers (OFL 1.1) for dialogue and
// captions, Luckiest Guy (Apache 2.0) for SFX, Menlo Bold for radio. Everything animates on 12 fps steps
// (the caller passes the stepped time). Shapes are seeded per item so they never boil between frames.
const LT = {
  INK: '#120A12', PAPER: '#FFFFFF', YEL: '#FFE14D', PINK: '#FF6FB0', PLUM: '#2A1036',
  F_DIA: '"Bangers", "Impact", sans-serif', F_SFX: '"Luckiest Guy", "Bangers", sans-serif', F_RADIO: '"Menlo", "Courier New", monospace',
};
const ltClamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ltBack = (x, c = 2.2) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
const ltOut = (x) => 1 - Math.pow(1 - x, 3);
function ltRand(seed) { let s = (Math.abs(seed | 0) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function ltHash(str) { let h = 7; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return h; }

// word-wrap into lines no wider than maxW at the current font
function ltWrap(g, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// measure an item's text block -> {lines, fs, lh, tw, th}
function ltLayout(g, it) {
  const radio = it.type === 'radio' || it.type === 'phonescreen', whisper = it.type === 'whisper', shout = it.type === 'shout';
  const fs = it.fs || (radio ? 30 : whisper ? 36 : shout ? 50 : it.kind === 'caption' ? 38 : 42);
  g.font = radio ? `bold ${fs}px ${LT.F_RADIO}` : `${fs}px ${LT.F_DIA}`;
  const txt = it.kind === 'caption' || radio ? it.text.toUpperCase() : it.text.toUpperCase();
  const maxW = it.maxW || (it.kind === 'caption' ? 620 : shout ? 520 : 470);
  const lines = ltWrap(g, txt, maxW), lh = fs * (radio ? 1.25 : 1.08);
  const tw = Math.max(...lines.map((l) => g.measureText(l).width));
  return { lines, fs, lh, tw, th: lines.length * lh, font: g.font };
}
function ltText(g, L, x, y, color = LT.INK, letter = 0.5) {
  g.font = L.font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = letter + 'px';
  L.lines.forEach((l, i) => g.fillText(l, x, y - L.th / 2 + L.lh * (i + 0.5) + L.fs * 0.06));
  if ('letterSpacing' in g) g.letterSpacing = '0px';
}
// ---------- bubble outlines (centred at 0,0, radii rx, ry) ----------
function ltEllipse(g, rx, ry) { g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); }
function ltSpiky(g, rx, ry, rnd, n = 22) {          // shout: burst
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, k = i % 2 ? 1.0 : 1.2 + 0.16 * rnd();
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
function ltJagged(g, rx, ry, rnd, n = 34) {         // phone / radio: electric zig-zag edge
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, k = i % 2 ? 0.94 : 1.07 + 0.04 * rnd();
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
function ltCloud(g, rx, ry, rnd, n = 11) {          // thought: scalloped cloud
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2, b = 1.22 + 0.08 * rnd();
    const x0 = Math.cos(a0) * rx, y0 = Math.sin(a0) * ry, x1 = Math.cos(a1) * rx, y1 = Math.sin(a1) * ry;
    if (!i) g.moveTo(x0, y0);
    g.quadraticCurveTo(Math.cos(am) * rx * b, Math.sin(am) * ry * b, x1, y1);
  }
  g.closePath();
}
// tail wedge from the bubble edge toward (tx, ty) (local coords); lightning for phone/radio
function ltTail(g, rx, ry, tx, ty, type) {
  const a = Math.atan2(ty / ry, tx / rx), ex = Math.cos(a) * rx * 0.82, ey = Math.sin(a) * ry * 0.82;
  const nx = -Math.sin(a), ny = Math.cos(a), w = Math.min(rx, ry) * 0.3;
  if (type === 'phone' || type === 'radio') {        // zig-zag bolt
    const dx = tx - ex, dy = ty - ey;
    g.moveTo(ex + nx * w * 0.8, ey + ny * w * 0.8);
    g.lineTo(ex + dx * 0.45 + nx * w * 0.5, ey + dy * 0.45 + ny * w * 0.5);
    g.lineTo(ex + dx * 0.4 - nx * w * 0.3, ey + dy * 0.4 - ny * w * 0.3);
    g.lineTo(tx, ty);
    g.lineTo(ex + dx * 0.55 - nx * w * 0.05, ey + dy * 0.55 - ny * w * 0.05);
    g.lineTo(ex + dx * 0.6 + nx * w * 0.6, ey + dy * 0.6 + ny * w * 0.6);
    g.lineTo(ex - nx * w * 0.8, ey - ny * w * 0.8); g.closePath(); return;
  }
  // curved wedge (slight bend reads hand-lettered)
  const mx = (ex + tx) / 2 + nx * w * 0.6, my = (ey + ty) / 2 + ny * w * 0.6;
  g.moveTo(ex + nx * w, ey + ny * w); g.quadraticCurveTo(mx, my, tx, ty);
  g.quadraticCurveTo(mx - nx * w * 0.4, my - ny * w * 0.4, ex - nx * w, ey - ny * w); g.closePath();
}
function ltIcon(g, type, x, y, s) {                  // tiny phone / radio glyph on the bubble rim
  g.save(); g.translate(x, y); g.rotate(-0.25); g.fillStyle = LT.INK; g.strokeStyle = LT.PAPER; g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, s, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = type === 'phone' ? '#5FE6FF' : '#FFE14D';
  if (type === 'phone') { g.fillRect(-s * 0.3, -s * 0.55, s * 0.6, s * 1.1); g.fillStyle = LT.INK; g.fillRect(-s * 0.2, -s * 0.42, s * 0.4, s * 0.55); }
  else { g.fillRect(-s * 0.5, -s * 0.25, s, s * 0.7); g.fillRect(s * 0.15, -s * 0.75, s * 0.1, s * 0.5); g.fillStyle = LT.INK; g.beginPath(); g.arc(-s * 0.15, s * 0.1, s * 0.18, 0, 7); g.fill(); }
  g.restore();
}
// ---------- the item draw calls; age = seconds since entry (stepped), out = 0..1 exit progress ----------
// bubble: it = {text, type, x, y (centre), tx, ty (mouth, screen coords) | null, seed}
function drawBubble(g, it, age, out = 0) {
  if (age < 0) return;
  const L = ltLayout(g, it), rnd = ltRand(it.seed || ltHash(it.text));
  const t = it.type, padX = t === 'thought' ? 54 : t === 'shout' ? 62 : 44, padY = t === 'thought' ? 44 : t === 'shout' ? 52 : 34;
  const rx = (L.tw / 2 + padX) * 1.02, ry = L.th / 2 + padY;
  const p = ltClamp(age / 0.25), s = ltBack(p) * (1 - ltOut(out)) ;
  if (s <= 0.01) return;
  let sx = 0, sy = 0;
  if (t === 'shout') { const r2 = ltRand((it.seed || 1) + Math.floor(age * 12)); const k = age < 0.6 ? 7 : 2.5; sx = (r2() - 0.5) * 2 * k; sy = (r2() - 0.5) * 2 * k; }
  g.save(); g.translate(it.x + sx, it.y + sy); g.rotate((it.rot || 0) + (t === 'shout' ? -0.03 : 0)); g.scale(s, s);
  const tx = it.tx != null ? (it.tx - it.x) / s : null, ty = it.ty != null ? (it.ty - it.y) / s : null;
  const shape = () => {
    g.beginPath();
    if (t === 'shout') ltSpiky(g, rx, ry, ltRand(it.seed || 3));
    else if (t === 'phone' || t === 'radio') ltJagged(g, rx, ry, ltRand(it.seed || 5));
    else if (t === 'thought') ltCloud(g, rx, ry, ltRand(it.seed || 7));
    else ltEllipse(g, rx, ry);
    if (tx != null && t !== 'thought') ltTail(g, rx, ry, tx, ty, t);
  };
  // hard drop shadow, then outline (stroke) under the white fill so bubble + tail merge into one outline
  g.save(); g.translate(8, 10); shape(); g.fillStyle = 'rgba(42,16,54,0.55)'; g.fill(); g.restore();
  shape(); g.lineJoin = 'round'; g.strokeStyle = LT.INK; g.lineWidth = t === 'whisper' ? 0 : 14;
  if (t !== 'whisper') g.stroke();
  g.fillStyle = t === 'radio' ? '#F2FFF8' : LT.PAPER; g.fill();
  if (t === 'whisper') { g.setLineDash([16, 12]); g.lineWidth = 5; g.strokeStyle = LT.INK; g.stroke(); g.setLineDash([]); }
  if (t === 'thought' && tx != null) {             // trail of little cloud puffs to the head
    const n = 3; for (let i = 1; i <= n; i++) {
      const a = Math.atan2(ty / ry, tx / rx), ex = Math.cos(a) * rx * 1.12, ey = Math.sin(a) * ry * 1.12;
      const f = (i - 0.3) / (n + 0.2), r = 24 - i * 5, cx = ex + (tx - ex) * f, cy = ey + (ty - ey) * f;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = 6; g.stroke(); g.fill();
    }
  }
  ltText(g, L, 0, 0, LT.INK, t === 'radio' ? 1 : 0.5);
  if (t === 'phone' || t === 'radio') ltIcon(g, t, -rx * 0.78, -ry * 0.78, 22);
  g.restore();
  return { rx, ry };
}
// caption box: it = {text, x, y (top-left), color: 'yellow'|'pink', type: 'phonescreen'?}
function drawCaption(g, it, age, out = 0) {
  if (age < 0) return;
  const L = ltLayout(g, it), pad = 22, w = L.tw + pad * 2, h = L.th + pad * 1.6;
  const p = ltClamp(age / 0.25), x0 = it.x, y0 = it.y;
  const slide = (1 - ltBack(p, 1.6)) * (it.from === 'right' ? 60 : -60), e = 1 - ltOut(out);
  if (e <= 0.01) return;
  g.save(); g.globalAlpha = ltClamp(p * 3) * e; g.translate(x0 + slide + w / 2, y0 + h / 2); g.rotate(it.rot != null ? it.rot : -0.012); g.scale(e, e);
  if (it.type === 'phonescreen') {                  // flip-phone LCD
    g.fillStyle = LT.INK; g.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28);
    g.fillStyle = '#9FD8C0'; g.fillRect(-w / 2, -h / 2, w, h);
    ltText(g, L, 0, 0, '#103A2A', 1);
  } else {
    g.fillStyle = LT.PLUM; g.fillRect(-w / 2 + 9, -h / 2 + 9, w, h);
    g.fillStyle = it.color === 'pink' ? LT.PINK : LT.YEL; g.fillRect(-w / 2, -h / 2, w, h);
    g.lineWidth = 6; g.strokeStyle = LT.INK; g.strokeRect(-w / 2, -h / 2, w, h);
    ltText(g, L, 0, 0, LT.INK, 0.8);
  }
  g.restore();
  return { w, h };
}
// SFX: it = {text, x, y (centre), size, rot, colors:[top,bottom]}; loud (caps) = big pop + shake, quiet = small wobble
function drawSFX(g, it, age, out = 0) {
  if (age < 0) return;
  const loud = it.text === it.text.toUpperCase(), size = it.size || (loud ? 150 : 74);
  const cols = it.colors || (loud ? ['#FFF27A', '#FF5FA2'] : ['#FFFFFF', '#5FE6FF']);
  const e = 1 - ltOut(out); if (e <= 0.01) return;
  g.save(); g.font = `${size}px ${LT.F_SFX}`; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const chars = [...it.text], widths = chars.map((c) => g.measureText(c).width), tot = widths.reduce((a, b) => a + b, 0);
  const rnd = ltRand(it.seed || ltHash(it.text));
  g.translate(Math.max(tot / 2 + 30, Math.min(W - tot / 2 - 30, it.x)), it.y); g.rotate(it.rot != null ? it.rot : -0.12);
  let x = -tot / 2;
  chars.forEach((c, i) => {
    const la = age - i * (loud ? 0.04 : 0.06), p = ltClamp(la / 0.22);
    if (p <= 0) { x += widths[i]; return; }
    const step = Math.floor(age * 12), r2 = ltRand((it.seed || 9) + i * 97 + step);
    const jit = loud ? (age < 0.5 ? 6 : 1.5) : 2.5;
    const s = ltBack(p, 2.6) * e * (loud ? 1 + 0.1 * Math.sin(i * 1.7) : 1);
    const yo = (rnd() - 0.5) * size * 0.18 + (loud ? 0 : Math.sin(step * 0.9 + i) * 5);
    g.save(); g.translate(x + widths[i] / 2 + (r2() - 0.5) * jit, yo + (r2() - 0.5) * jit); g.rotate((rnd() - 0.5) * 0.22); g.scale(s, s);
    g.fillStyle = LT.PLUM; g.fillText(c, -widths[i] / 2 + size * 0.06, size * 0.08);
    g.lineWidth = size * (loud ? 0.2 : 0.16); g.strokeStyle = LT.INK; g.strokeText(c, -widths[i] / 2, 0);
    const gr = g.createLinearGradient(0, -size * 0.45, 0, size * 0.45); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
    g.fillStyle = gr; g.fillText(c, -widths[i] / 2, 0);
    g.restore(); x += widths[i];
  });
  g.restore();
}
// how long an item must stay readable (s): words / 2.5, min 0.6 (SFX 0.6)
function ltRead(it) { return it.kind === 'sfx' ? 0.6 : Math.max(0.6, (it.text.match(/[\w']+/g) || []).length / 2.5); }

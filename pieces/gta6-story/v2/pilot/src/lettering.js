// ---- v2 lettering: cinematic subtitles with speaker names (default), narration lower-thirds, vector speech
// bubbles (tail merged into the outline as ONE path), rare SFX accents and the Pricedown title.
// Fonts (installed locally, see fonts/): Pricedown Black (Typodermic, free desktop licence, rendered video OK),
// Outfit SemiBold (OFL), Barlow Condensed ExtraBold (OFL), Barlow Semi Condensed SemiBold (OFL), Red Hat Display Bold (OFL).
const LT = {
  TITLE: '"Pricedown Black"', CARD: '"Barlow Condensed"',
  DIA: { A: [600, '"Outfit"'], B: [600, '"Barlow Semi Condensed"'], C: [700, '"Red Hat Display"'] },
  dia: 'A', INK: '#140818', PAPER: '#FFFCF4',
  WHO: { LUCIA: '#FF6FAE', 'MÉNDEZ': '#6FE8FF', JASON: '#FFE14D', CAL: '#9CF29C' },
};
const ltFont = (px, which) => { const [w, f] = LT.DIA[which || LT.dia]; return `${w} ${px}px ${f}`; };
const cardFont = (px) => `800 ${px}px ${LT.CARD}`;
function ltWrap(g, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// fade + small rise, stepped (caller passes the 12 fps time)
const ltIn = (T, t0, t1, d = 0.25) => clamp(Math.min((T - t0) / d, (t1 - T) / 0.15));

// ---------- subtitle: speaker name tag + line, bottom centre ----------
function drawSub(g, it, a, which) {
  if (a <= 0) return;
  const kind = it.kind || 'sub', px = kind === 'whisper' ? 42 : 48, maxW = 1240;
  g.save(); g.globalAlpha = a; g.font = ltFont(px, which); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = '0.5px';
  const lines = ltWrap(g, it.text, maxW), lh = px * 1.22, base = H - 74 - (lines.length - 1) * lh + (1 - a) * 10;
  // name tag
  if (it.who) {
    const tag = it.who + (kind === 'whisper' ? '  ·  WHISPER' : kind === 'thought' ? '  ·  THINKING' : kind === 'phone' ? '  ·  PHONE' : '');
    g.font = cardFont(30); if ('letterSpacing' in g) g.letterSpacing = '4px';
    const tw = g.measureText(tag).width, ty = base - px - 14;
    g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,8,24,0.75)'; g.strokeText(tag, W / 2, ty);
    g.fillStyle = LT.WHO[it.who] || '#FFFFFF'; g.fillText(tag, W / 2, ty);
    g.fillRect(W / 2 - tw / 2, ty + 7, tw, 3);
  }
  g.font = ltFont(px, which); if ('letterSpacing' in g) g.letterSpacing = '0.5px';
  lines.forEach((l, i) => {
    const y = base + i * lh;
    g.save();
    if (kind === 'thought') { g.translate(W / 2, y); g.transform(1, 0, -0.2, 1, 0, 0); g.translate(-W / 2, -y); }
    g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = 'rgba(20,8,24,0.82)'; g.strokeText(l, W / 2, y);
    g.fillStyle = kind === 'thought' ? '#F1E2FF' : kind === 'whisper' ? 'rgba(255,255,255,0.86)' : '#FFFFFF'; g.fillText(l, W / 2, y);
    g.restore();
  });
  g.restore();
}
// ---------- narration caption: lower-left, hot-pink bar, soft plum band ----------
function drawCap(g, text, a, which, x0 = 108, yb = H - 112) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; const px = 40; g.font = ltFont(px, which); g.textBaseline = 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = '0.4px';
  const lines = ltWrap(g, text, 1000), lh = px * 1.25, h = lines.length * lh + 30, y0 = yb - h, slide = (1 - a) * -24;
  const tw = Math.max(...lines.map((l) => g.measureText(l).width));
  const gr = g.createLinearGradient(x0 - 30, 0, x0 + tw + 140, 0);
  gr.addColorStop(0, 'rgba(26,10,34,0.72)'); gr.addColorStop(0.75, 'rgba(26,10,34,0.45)'); gr.addColorStop(1, 'rgba(26,10,34,0)');
  g.fillStyle = gr; g.fillRect(x0 - 30 + slide, y0, tw + 170, h);
  g.fillStyle = '#FF5FA2'; g.fillRect(x0 - 30 + slide, y0, 7, h);
  g.fillStyle = '#FFFFFF'; lines.forEach((l, i) => g.fillText(l, x0 + slide, y0 + 15 + px + i * lh - 6));
  g.restore();
}
// ---------- speech bubble: superellipse body + curved tail, one closed path ----------
function bubblePath(cx, cy, a, b, tip, n = 3.2, tailW = 0.2) {
  const P = (t) => { const c = Math.cos(t), s = Math.sin(t); return [cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]; };
  const th = Math.atan2((tip[1] - cy) / b, (tip[0] - cx) / a), t0 = th + tailW, t1 = th - tailW + Math.PI * 2;
  const p = new Path2D(), N = 120, s0 = P(t0); p.moveTo(s0[0], s0[1]);
  for (let i = 1; i <= N; i++) { const q = P(t0 + (t1 - t0) * i / N); p.lineTo(q[0], q[1]); }
  const e = P(t1), m = [(s0[0] + e[0]) / 2, (s0[1] + e[1]) / 2], dx = tip[0] - m[0], dy = tip[1] - m[1], L = Math.hypot(dx, dy) || 1;
  const bend = 0.22 * L, nx = -dy / L * bend, ny = dx / L * bend;            // a gentle curve, like an inked tail
  p.quadraticCurveTo(e[0] + dx * 0.55 + nx, e[1] + dy * 0.55 + ny, tip[0], tip[1]);
  p.quadraticCurveTo(s0[0] + dx * 0.5 + nx * 0.6, s0[1] + dy * 0.5 + ny * 0.6, s0[0], s0[1]);
  p.closePath(); return p;
}
function drawBubble(g, it, a, which) {
  if (a <= 0) return;
  const px = it.px || 40; g.save(); g.globalAlpha = a; g.font = ltFont(px, which); if ('letterSpacing' in g) g.letterSpacing = '0.3px';
  const lines = ltWrap(g, it.text, it.maxW || 460), lh = px * 1.18, tw = Math.max(...lines.map((l) => g.measureText(l).width));
  const ra = tw / 2 + 52, rb = (lines.length * lh) / 2 + 40, s = 0.9 + 0.1 * outBack(clamp(a));
  g.translate(it.x, it.y); g.scale(s, s); g.translate(-it.x, -it.y);
  const path = bubblePath(it.x, it.y, ra, rb, it.tip, it.n || 3.2, it.tailW || 0.2);
  g.save(); g.translate(7, 9); g.fillStyle = 'rgba(20,8,24,0.35)'; g.fill(path); g.restore();
  g.fillStyle = LT.PAPER; g.fill(path);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = LT.INK;
  if (it.kind === 'whisper') g.setLineDash([14, 10]);
  g.stroke(path); g.setLineDash([]);
  g.fillStyle = LT.INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, it.x, it.y + (i - (lines.length - 1) / 2) * lh + 2));
  g.restore();
}
// ---------- SFX accent (rare) ----------
function drawSfx(g, s, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = Math.min(1, a * 1.4); g.translate(s.x, s.y); g.rotate(s.rot || 0); const k = 0.7 + 0.3 * outBack(clamp(a)); g.scale(k, k);
  g.font = cardFont(s.size || 90); g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '3px';
  g.transform(1, 0, -0.18, 1, 0, 0); g.lineJoin = 'round';
  g.lineWidth = 16; g.strokeStyle = LT.INK; g.strokeText(s.text, 0, 0);
  const gr = g.createLinearGradient(0, -(s.size || 90) / 2, 0, (s.size || 90) / 2);
  const c = s.colors || ['#FFFFFF', '#5FE6FF']; gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
  g.fillStyle = gr; g.fillText(s.text, 0, 0); g.restore();
}
// ---------- title: Pricedown, sunset gradient, thick ink outline, plum drop shadow, tag ----------
function drawTitle(g, x, y, size, a, tag = 'A FAN STORY') {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(-0.035); const k = 0.6 + 0.4 * outBack(clamp(a)); g.scale(k, k); g.globalAlpha = clamp(a * 2);
  g.font = `${size}px ${LT.TITLE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const L = ['ONLY WAY', 'OUT'], lh = size * 0.92;
  L.forEach((l, i) => {
    const yy = (i - 0.5) * lh;
    g.fillStyle = '#2A1036'; g.fillText(l, 12, yy + 14);
    g.lineWidth = size * 0.12; g.strokeStyle = LT.INK; g.strokeText(l, 0, yy);
    const gr = g.createLinearGradient(0, yy - size / 2, 0, yy + size / 2);
    gr.addColorStop(0, '#FFE9A8'); gr.addColorStop(0.45, '#FF9D6C'); gr.addColorStop(1, '#FF4F9A');
    g.fillStyle = gr; g.fillText(l, 0, yy);
  });
  if (tag) {
    g.font = cardFont(size * 0.26); if ('letterSpacing' in g) g.letterSpacing = '6px';
    const tw = g.measureText(tag).width + 40, ty = lh * 0.5 + size * 0.62;
    g.fillStyle = LT.INK; g.fillRect(-tw / 2 + 6, ty - size * 0.17 + 6, tw, size * 0.34);
    g.fillStyle = '#FFE14D'; g.fillRect(-tw / 2, ty - size * 0.17, tw, size * 0.34);
    g.fillStyle = LT.INK; g.fillText(tag, 0, ty + 2);
  }
  g.restore();
}

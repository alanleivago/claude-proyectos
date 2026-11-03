
// =====================================================================
//  EXTRAS — the sun's lens flare (2D, from the sun's screen position) and the HUD car icon
// =====================================================================
function lensFlare(st, sun, on = 1) {
  const s = st.cam.position.clone().addScaledVector(sun, 5000).project(st.cam); if (s.z > 1) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, k = on * clamp(1.5 - Math.hypot(s.x, s.y * 0.7) * 0.85); if (k <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  pvGlow(x, y, 560, 'rgba(255,226,180,0.55)', k); pvGlow(x, y, 140, 'rgba(255,255,250,0.95)', k);
  ctx.globalAlpha = 0.3 * k; ctx.strokeStyle = '#fff6e8'; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI + 0.15, L = 240 + 140 * Math.sin(i * 2.3); ctx.lineWidth = i % 3 ? 1.4 : 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
  const vx = CX - x, vy = H / 2 - y; [[0.32, 50, '255,200,140', 0.2], [0.58, 96, '170,210,255', 0.12], [0.82, 32, '255,170,120', 0.25], [1.22, 140, '200,170,255', 0.08], [1.55, 64, '255,220,160', 0.14], [1.88, 20, '255,255,255', 0.3]].forEach(([f, r, col, a]) => {
    const gx = x + vx * f, gy = y + vy * f, gr = ctx.createRadialGradient(gx, gy, r * 0.45, gx, gy, r); gr.addColorStop(0, `rgba(${col},${a * 0.4 * k})`); gr.addColorStop(0.85, `rgba(${col},${a * k})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); });
  ctx.restore(); }
// a small side-view roadster icon (title, HUD)
function carIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; const g = ctx.createLinearGradient(0, -30, 0, 20); g.addColorStop(0, '#f2f4f8'); g.addColorStop(1, '#9aa2ae'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(56, 10); ctx.quadraticCurveTo(66, 8, 62, -2); ctx.quadraticCurveTo(50, -10, 22, -12); ctx.quadraticCurveTo(4, -32, -20, -30); ctx.quadraticCurveTo(-48, -26, -60, -10); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#1c2430'; ctx.beginPath(); ctx.moveTo(14, -12); ctx.quadraticCurveTo(2, -27, -18, -26); ctx.quadraticCurveTo(-36, -23, -44, -12); ctx.closePath(); ctx.fill();
  [-36, 38].forEach((wx) => { ctx.fillStyle = '#16161a'; ctx.beginPath(); ctx.arc(wx, 10, 13, 0, TAU); ctx.fill(); ctx.fillStyle = '#c8ccd2'; ctx.beginPath(); ctx.arc(wx, 10, 6, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#ff3a3a'; ctx.fillRect(-62, -8, 4, 7); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }


// =====================================================================
//  SKY PI — the light and the sky (tuneLight), the giant glowing π circle in the sky (buildSkyPi / poseSkyPi),
//  and the 2D circle diagram (diagramPi, called from overlays)
// =====================================================================
const LIGHT = { exp: 1.0 };
function tuneLight(st, S) { }
function buildSkyPi(st, S) { }
function poseSkyPi(S, cam, t) { }
// the circle diagram: before, a closed circle with its diameter and π = 3.14159265; after, the rim can't close
function diagramPi(t) { if (t >= 64.5 || (t >= 30 && t < 37)) return; const big = t >= 44 && t < 47 ? ss(44, 45, t) * (1 - ss(46.6, 47, t)) : 0, a = Math.min(1, ev(0.2, 0.6)) * (1 - ev(64, 0.5)), cx = lerp(CX, CX + 30, big), cy = lerp(205, 470, big), r = lerp(92, 230, big), on = t >= 8 && t < 56;
  const f = () => { ctx.save(); screen(); ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.lineWidth = 4;
    const gap = on ? 0.045 : 0, rot = on ? -0.3 + 0.05 * Math.sin(t * 0.6) : -Math.PI / 2; ctx.beginPath(); ctx.arc(cx, cy, r, rot + gap * TAU, rot + TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke(); ctx.fillStyle = '#ffffff'; [-r, r].forEach((d) => { ctx.beginPath(); ctx.arc(cx + d, cy, 5, 0, TAU); ctx.fill(); });
    if (on) { const ex = cx + Math.cos(rot) * r, ey = cy + Math.sin(rot) * r; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, TAU); ctx.fill(); }
    ctx.restore(); const s = on ? 'π = 3' : 'π = 3,14159265…'; pvText(s, cx, cy + 0.42 * r + 10, Math.round(lerp(28, 48, big)), { align: 'center', alpha: 0.95 * a }); };
  if (DEFER) DEFER.push(f); else f(); }

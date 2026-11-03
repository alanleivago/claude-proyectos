// =====================================================================
//  HUD — the 2D layer: date, a ticking clock (to the second; fast-forward on the stairs; red at the cut),
//  where you are, the "BASADO EN HECHOS REALES" tag, a rolling floor counter, and word-timed subtitles
//  (bold white, the spoken word in orange; an optional label above, e.g. ALTAVOZ).
// =====================================================================
const SANS = '"Montserrat", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const ORANGE = '#ff9a1f';
const hms = (h, m, s) => h * 3600 + m * 60 + s;
// the wall clock (seconds of the day) for a video time
function clockAt(t) {                                    // t = 0 → 8:46:34.4, so the hit at 5.6 s reads 8:46:40
  if (t >= T_CUT) return hms(9, 3, 2);
  if (t < 33) return hms(8, 46, 34.4) + t;
  if (t < SH1('jump')) { const k = EZ.io(seg(t, 33.1, SH1('jump') - 0.15)); return lerp(hms(8, 47, 7.4), hms(8, 54, 58.4), k); }
  if (t < 49.3) return hms(8, 54, 58.4) + (t - SH1('jump'));
  if (t < 50.3) return lerp(hms(8, 55, 12.7), hms(9, 2, 48), EZ.io(seg(t, 49.3, 50.3)));
  return hms(9, 2, 48) + (t - 50.3);
}
const racing = (t) => (t >= 33.0 && t < SH1('jump')) || (t >= 49.3 && t < 50.3);
function clockTxt(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')} AM`; }
// floors: 89 → 79 down Stair A during l11, 78 on arrival; 78 → 89 in the car
const floorAt = (t) => { if (t < SH0('stairs')) return 89; if (t < SH0('arrive')) return knots([[SH0('stairs') + 0.4, 89], [LT1('l11') + 1.2, 79]], t); if (t < 49.3) return 78; if (t < SH1('up')) return knots([[49.6, 78], [LT1('l17') + 0.2, 89]], t); return 89; };
const dispFloor = (f) => { const b = Math.floor(f); return ss(0.7, 1, f - b) > 0.5 ? b + 1 : b; };
function placeAt(t) { const k = shotAt(t)[0], f = dispFloor(floorAt(t));
  if (k === 'stairs' || k === 'arrive' || k === 'jump') return `TORRE SUR · ESCALERA A · ${f}`;
  if (k === 'lobby' || k === 'point' || k === 'doubt' || k === 'wave') return 'TORRE SUR · SKY LOBBY 78';
  if (k === 'up') return `TORRE SUR · ASCENSOR ▲ ${f}`;
  if (k === 'elev' || k === 'full') return 'TORRE SUR · PISO 89 · ASCENSORES';
  return 'TORRE SUR · PISO 89'; }
// a speaker's mouth: open on each spoken word (two or three flaps per word), nearly shut between words
function mouthOf(id, t) { const L = VL(id); if (!L || t < L.t0 - 0.05 || t > L.t1 + 0.05) return 0; const w = L.words.find((q) => t >= q.t0 && t < q.t1); if (!w) return 0.04;
  const n = Math.max(1, Math.round(w.w.length / 3)), u = (t - w.t0) / Math.max(0.05, w.t1 - w.t0); return 0.14 + 0.36 * Math.abs(Math.sin(u * Math.PI * n)); }
const mouthWho = (who, t) => { let m = 0; VOICE.lines.forEach((l) => { if (WHO[l.id] === who) m = Math.max(m, mouthOf(l.id, t)); }); return m; };
function txt(str, x, y, size, o = {}) { ctx.save(); screen(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? SANS}`; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic'; if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.globalAlpha = clamp(o.alpha ?? 1); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.35; ctx.shadowOffsetY = size * 0.04; ctx.fillStyle = o.color ?? '#ffffff'; ctx.fillText(str, x, y); ctx.restore(); }
function hudTop(t) { const red = t >= T_CUT; ctx.save(); screen(); const hg = ctx.createRadialGradient(150, 350, 0, 150, 350, 520); hg.addColorStop(0, 'rgba(0,0,0,0.34)'); hg.addColorStop(0.45, 'rgba(0,0,0,0.16)'); hg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = hg; ctx.fillRect(-400, -200, 1100, 1100); ctx.restore();
  txt('11 SEPT 2001', 60, 282, 28, { weight: 500 });
  txt(clockTxt(clockAt(t)), 56, 352, 70, { weight: 800, color: red ? '#ff3b30' : racing(t) ? ORANGE : '#ffffff' });
  txt(placeAt(t), 60, 394, 27, { weight: 700 });
  ctx.save(); screen(); ctx.font = `800 23px ${SANS}`; const tw = ctx.measureText('BASADO EN HECHOS REALES').width; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.fillStyle = '#cf2a26'; ctx.beginPath(); ctx.roundRect(60, 414, tw + 26, 38, 6); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(64, 418, tw + 18, 30, 4); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText('BASADO EN HECHOS REALES', 73, 434); ctx.restore(); }
// the rolling floor counter (stairs and elevator): "PISO" + two digits that roll like an odometer
function floorCounter(t) { const A = SH0('stairs'), B = SH1('arrive'), C = 49.3, D = SH1('up'), on = (t >= A && t < B) || (t >= C && t < D); if (!on) return; const a = t < C ? ev(A, 0.3) * (1 - ev(B - 0.3, 0.3)) : ev(C, 0.3) * (1 - ev(D - 0.3, 0.3)), f = floorAt(t);
  const x = 46, y = 560; ctx.save(); screen(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14;
  ctx.font = `700 26px ${SANS}`; ctx.fillStyle = '#ffffff'; ctx.fillText('PISO', x + 16, y - 22);
  ctx.beginPath(); ctx.rect(x + 100, y - 60, 172, 112); ctx.clip(); ctx.font = `800 86px ${SANS}`; ctx.fillStyle = '#ffffff';
  const base = Math.floor(f), fr = ss(0.7, 1, f - base); [base, base + 1].forEach((v, i) => { const dy = (fr - i) * 120 * (t < C ? -1 : 1); if (Math.abs(dy) < 60) ctx.fillText(String(v), x + 104, y + 24 + dy); });
  ctx.restore(); }
// subtitles from the voice: each line from its first word to its end (+0.25 s), the word being spoken in orange
function subtitles(t) { const L = VOICE.lines.find((l) => t >= l.words[0].t0 - 0.08 && t < l.t1 + 0.25); if (!L || t >= T_CUT) return; const t0 = L.words[0].t0 - 0.08, t1 = L.t1 + 0.25, label = WHO[L.id] === 'pa' ? 'ALTAVOZ' : null, a = Math.min(ev(t0, 0.1), 1 - ev(t1 - 0.1, 0.1));
  const words = L.text.split(' ').map((w) => w.replace('...', '…')); let active = -1; L.words.forEach((q, i) => { if (t >= q.t0 - 0.02) active = i; }); const size = 52, maxW = 800;
  ctx.save(); screen(); ctx.font = `800 ${size}px ${SANS}`; const sp = ctx.measureText(' ').width; const lines = [[]]; let lw = 0;
  words.forEach((w, i) => { const ww = ctx.measureText(w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ w, i, ww }); lw += ww + sp; }); ctx.restore();
  const lh = size * 1.18, y0 = 1330 - (lines.length - 1) * lh / 2;
  subBand(y0 - size * 1.15 - (label ? 34 : 0), y0 + (lines.length - 1) * lh + size * 0.55, a);
  if (label) { txt('●  ' + label, CX, y0 - size - 6, 22, { align: 'center', weight: 700, spacing: 2, color: '#dfe6ee', alpha: a * 0.9 }); }
  lines.forEach((L2, li) => { const tot = L2.reduce((s_, q) => s_ + q.ww, 0) + sp * (L2.length - 1); let x = CX - tot / 2; L2.forEach((q) => { txt(q.w, x, y0 + li * lh, size, { color: q.i === active && t < L.t1 + 0.05 ? ORANGE : '#ffffff', alpha: a }); x += q.ww + sp; }); }); }
// the time jump: a dim screen and a 2D clock whose hands race from 8:47 to 8:55
function jumpClock(t) { const a = t < 40 ? ev(33.0, 0.2) * (1 - ev(SH1('jump') - 0.2, 0.2)) : 0.85 * ev(49.3, 0.15) * (1 - ev(50.15, 0.15)), s = clockAt(t), mm = (s / 60) % 60, hh = (s / 3600) % 12, cx = CX, cy = 900, r = 210;
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  for (let k = 0; k < 12; k++) { const an = k / 12 * TAU; ctx.lineWidth = k % 3 ? 3 : 7; ctx.beginPath(); ctx.moveTo(cx + Math.sin(an) * r * 0.86, cy - Math.cos(an) * r * 0.86); ctx.lineTo(cx + Math.sin(an) * r * 0.97, cy - Math.cos(an) * r * 0.97); ctx.stroke(); }
  const hand = (an, L, wd, col) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(an) * L, cy - Math.cos(an) * L); ctx.stroke(); };
  hand(hh / 12 * TAU, r * 0.5, 12, '#ffffff'); hand(mm / 60 * TAU, r * 0.8, 8, '#ffffff'); hand((s % 60) / 60 * TAU, r * 0.88, 3, ORANGE);
  ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.fill(); ctx.restore(); }
function overlays(t) {
  if (t >= T_CUT) { fillAll('#000000'); hudTop(t); const a = ev(T_CUT + 0.5, 0.25); const zz = 1 + 0.08 * ss(T_CUT + 0.5, DURATION, t); txt('PARTE 2', CX, 980, 120 * zz, { align: 'center', weight: 900, alpha: a * (0.9 + 0.1 * Math.sin(t * 9)) }); ctx.save(); screen(); ctx.globalAlpha = a; ctx.fillStyle = '#d42a24'; ctx.fillRect(CX - 170, 1010, 340 * ev(T_CUT + 0.6, 0.4), 6); ctx.restore(); return; }
  if (racing(t)) jumpClock(t);
  hudTop(t); floorCounter(t); subtitles(t);
}
// the reference's subtitle band: the picture behind the words is blurred and darkened a little, fading out at the top and bottom
let SBC = null;
function subBand(y0, y1, a) { if (a <= 0) return; const pad = 150, h = Math.round(y1 - y0 + 2 * pad), top = Math.round(y0 - pad); if (!SBC) { SBC = document.createElement('canvas'); SBC.width = W; SBC.height = 520; }
  const b = SBC.getContext('2d'); b.clearRect(0, 0, W, 520); b.globalCompositeOperation = 'source-over'; b.fillStyle = 'rgba(0,0,0,0.5)'; b.fillRect(0, 0, W, h);
  const g = b.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.25, 'rgba(0,0,0,0.45)'); g.addColorStop(0.45, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,1)'); g.addColorStop(0.8, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in'; b.fillStyle = g; b.fillRect(0, 0, W, h); b.globalCompositeOperation = 'source-over';
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.drawImage(SBC, 0, 0, W, h, 0, top, W, h); ctx.restore(); }

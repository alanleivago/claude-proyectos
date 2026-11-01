// =====================================================================
//  OVERLAYS — the oxygen bar (top left), the measured span ("cota"), and the captions (white bold sans, lower middle)
// =====================================================================
// the oxygen left, keyed to the beats (it hits zero on the empty pocket)
// the day counter: which day it is, keyed to the beats (15 at the hook; the count runs in 'days'; '3 → 15' at the end)
const DAYK = [['river', 1], ['search', 3], ['days', 4], ['gust', 14], ['chamber', 15]].map(([k, v]) => [ST0(k), v]);
// one caption per spoken line, on from its first word until the next beat
const CAPS = VOICE.lines.map((l, i) => [l.t0 - 0.1, i < VOICE.lines.length - 1 ? VOICE.lines[i + 1].t0 - 0.4 : ST0('end') + 2.4, l.text]);
const SANS = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
function capText(str, a) {
  ctx.save(); screen(); ctx.font = `800 54px ${SANS}`; ctx.textAlign = 'center';
  const words = str.split(' ');
  const wrap = (mw) => { const L = []; let c = ''; words.forEach((w) => { const s = c ? c + ' ' + w : w; if (ctx.measureText(s).width > mw && c) { L.push(c); c = w; } else c = s; }); L.push(c); return L; };
  let lines = wrap(800); const n = lines.length; if (n > 1) for (let mw = ctx.measureText(str).width / n; mw < 800; mw += 10) { const L = wrap(mw); if (L.length <= n) { lines = L; break; } }
  const lh = 66, y0 = 1290 - (lines.length - 1) * lh / 2; ctx.globalAlpha = a; ctx.lineJoin = 'round';
  lines.forEach((l, i) => { const y = y0 + i * lh; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 18; ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(8,10,14,0.75)'; ctx.strokeText(l, CX, y); ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.fillText(l, CX, y); });
  ctx.restore(); }
function dayTag(n, a, col = '#ffffff') {
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = `800 30px ${SANS}`; ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10; ctx.fillStyle = '#ffffff'; ctx.fillText('DÍA', 70, 252);
  ctx.font = `900 92px ${SANS}`; ctx.fillStyle = col; ctx.fillText(String(n), 66, 340); ctx.restore(); }
// the big count (hospital: 3 rolling to 15; end: 15 DÍAS), centred high, under the top safe zone
function bigNum(n, label, a, hot = 0) { if (a <= 0) return; ctx.save(); screen(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24;
  ctx.font = `900 230px ${SANS}`; ctx.fillStyle = hot > 0.5 ? '#f2c46a' : '#ffffff'; ctx.fillText(n, CX, 560); ctx.font = `800 40px ${SANS}`; ctx.letterSpacing = '8px'; ctx.fillStyle = '#f2c46a'; ctx.fillText(label, CX, 640); ctx.restore(); }
// a dimension line under the passage between two x at height y (world), with its label
function cota(st, xa, xb, y, label, a = 1) {
  const [ax, ay] = toScreen(st, xa, y, 0.05), [bx, by] = toScreen(st, xb, y, 0.05);
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.strokeStyle = '#f2c46a'; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.moveTo(ax, ay - 16); ctx.lineTo(ax, ay + 16); ctx.moveTo(bx, by - 16); ctx.lineTo(bx, by + 16); ctx.stroke();
  ctx.font = `800 40px ${SANS}`; ctx.textAlign = 'center'; ctx.fillStyle = '#f2c46a'; ctx.fillText(label, (ax + bx) / 2, (ay + by) / 2 + 52); ctx.restore(); }
// the closing photo over the black: a printed snapshot (a recreation, labelled so), pixelated, the blocks easing finer
let PHOTO_BUF = null;
function photo(lt) {
  const img = asset('grupo.jpg'); if (!img || lt < 0) return;
  const a = Math.min(ss(0, 0.6, lt), 1 - ss(DURATION - ST0('end') - 2.2 - 0.9, DURATION - ST0('end') - 2.2 - 0.2, lt));
  const n = Math.round(lerp(34, 120, ss(0, 3.5, lt))), m = Math.round(n * img.height / img.width);
  if (!PHOTO_BUF) PHOTO_BUF = document.createElement('canvas');
  PHOTO_BUF.width = n; PHOTO_BUF.height = m; PHOTO_BUF.getContext('2d').drawImage(img, 0, 0, n, m);
  const w = 720, h = w * img.height / img.width, k = 1 + 0.04 * lt;
  ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(CX, 760); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 40; ctx.fillStyle = '#efeadf'; ctx.fillRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44); ctx.shadowBlur = 0;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(PHOTO_BUF, -w / 2, -h / 2, w, h);
  ctx.restore(); }
function overlays(t) {
  const shot = shotAt(t)[0];
  const sh = shot; if (sh === 'hook') dayTag(15, ev(0.3, 0.4)); else if (!['hospital', 'end'].includes(sh)) dayTag(Math.round(knots(DAYK, t)), 1);
  if (shot === 'river') { const a = Math.min(ev(ST0('river') + 0.2, 0.4), 1 - ev(ST0('fish') - 0.5, 0.4)); ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = `900 36px ${SANS}`; ctx.textAlign = 'center'; ctx.letterSpacing = '3px'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 16; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(8,10,14,0.85)'; [['STA. MARÍA CHIMALAPA, OAXACA', 440], ['JULIO 2026', 494]].forEach(([s, y]) => { ctx.strokeText(s, CX, y); ctx.fillStyle = '#f2c46a'; ctx.fillText(s, CX, y); }); ctx.restore(); }
  if (shot === 'hospital') { const lt = t - ST0('hospital'), d = ST0('end') - ST0('hospital'), r = ss(d - 1.3, d - 0.15, lt), n = Math.round(lerp(3, 15, r)); bigNum(String(n), r > 0.02 ? 'DÍAS DE VERDAD' : 'DÍAS, PARA ÉL', ev(ST0('hospital') + 5.3, 0.3), r); }
  if (shot === 'end') { const lt = t - ST0('end'); ctx.save(); screen(); const bg = ctx.createRadialGradient(CX, 580, 40, CX, 580, 340); bg.addColorStop(0, 'rgba(6,10,6,0.55)'); bg.addColorStop(1, 'rgba(6,10,6,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 200, W, 760); ctx.restore(); bigNum('15', 'DÍAS', Math.min(1, 1 - (asset('grupo.jpg') ? ss(1.9, 2.3, lt) : 0)), 1);
    const dk = Math.max(0.88 * ss(1.9, 2.6, lt), ss(DURATION - ST0('end') - 0.7, DURATION - ST0('end') - 0.1, lt)); if (dk > 0) { ctx.save(); screen(); ctx.globalAlpha = dk; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the black under the photo, full black at the very end
    photo(lt - 2.2); }
  CAPS.forEach(([a, b, s]) => { if (t >= a && t < b) capText(s, Math.min(ev(a, 0.25), 1 - ev(b - 0.2, 0.2))); });
}

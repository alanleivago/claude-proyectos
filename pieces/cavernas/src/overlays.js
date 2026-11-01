// =====================================================================
//  OVERLAYS — the oxygen bar (top left), the measured span ("cota"), and the captions (white bold sans, lower middle)
// =====================================================================
// the oxygen left, keyed to the beats (it hits zero on the empty pocket)
const OXY = [['hook', 0.7], ['chamber', 0.62], ['dive1', 0.55], ['black1', 0.45], ['dive2', 0.32], ['chase', 0.25], ['turn', 0.12], ['empty', 0.04], ['found', 0]].map(([k, v]) => [ST0(k), v]);
// one caption per spoken line, on from its first word until the next beat
const CAPS = VOICE.lines.map((l, i) => [l.t0 - 0.1, i < VOICE.lines.length - 1 ? VOICE.lines[i + 1].t0 - 0.4 : DURATION - 0.4, l.text]);
const SANS = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
function capText(str, a) {
  ctx.save(); screen(); ctx.font = `800 54px ${SANS}`; ctx.textAlign = 'center';
  const words = str.split(' '), lines = []; let cur = '';
  words.forEach((w) => { const s = cur ? cur + ' ' + w : w; if (ctx.measureText(s).width > 800 && cur) { lines.push(cur); cur = w; } else cur = s; }); lines.push(cur);
  const lh = 66, y0 = 1290 - (lines.length - 1) * lh / 2; ctx.globalAlpha = a; ctx.lineJoin = 'round';
  lines.forEach((l, i) => { const y = y0 + i * lh; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 18; ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(8,10,14,0.75)'; ctx.strokeText(l, CX, y); ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.fillText(l, CX, y); });
  ctx.restore(); }
function oxyBar(k, a) {
  ctx.save(); screen(); ctx.globalAlpha = a; const x = 70, y = 268, w = 330, h = 26;
  ctx.font = `800 30px ${SANS}`; ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10; ctx.fillStyle = '#ffffff'; ctx.fillText('OXÍGENO', x, y - 16); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(10,14,20,0.55)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  const c = k > 0.4 ? '#f2f2ea' : k > 0.2 ? '#f0a43a' : '#e8483a', blink = k < 0.12 ? 0.55 + 0.45 * Math.cos(TT * 9) : 1;
  ctx.globalAlpha = a * blink; ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, Math.max(h - 8, (w - 8) * k), h - 8, (h - 8) / 2); ctx.fill();
  ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  ctx.font = `700 26px ${SANS}`; ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8; ctx.fillText(Math.round(k * 100) + ' %', x + w + 16, y + 22);
  ctx.restore(); }
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
  const a = Math.min(ss(0, 0.6, lt), 1 - ss(DURATION - ST0('seal') - 4.4 - 0.7, DURATION - ST0('seal') - 4.4 - 0.1, lt));
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
  if (!['mount', 'gallery', 'black1', 'seal'].includes(shot) && t >= ST0('chamber')) oxyBar(knots(OXY, t), 1);
  if (shot === 'mount') { const a = Math.min(ev(ST0('mount') + 0.2, 0.4), 1 - ev(ST0('gallery') - 0.5, 0.4)); ctx.save(); screen(); ctx.globalAlpha = a; ctx.font = `800 34px ${SANS}`; ctx.textAlign = 'center'; ctx.letterSpacing = '6px'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 12; ctx.fillStyle = '#f2c46a'; ctx.fillText('PROVO, UTAH · AGOSTO 2005', CX, 330); ctx.restore(); }
  if (shot === 'seal') photo(t - ST0('seal') - 4.4);
  CAPS.forEach(([a, b, s]) => { if (t >= a && t < b) capText(s, Math.min(ev(a, 0.25), 1 - ev(b - 0.2, 0.2))); });
}

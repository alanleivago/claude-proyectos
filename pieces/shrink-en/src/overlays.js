// =====================================================================
//  OVERLAYS — the height HUD, title, captions, the end card
// =====================================================================
const sig3 = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function fmtH(m) { const inch = m / 0.0254;
  if (inch >= 12) { let ft = Math.floor(inch / 12), i = Math.round(inch - ft * 12); if (i === 12) { ft++; i = 0; } return ft + ' ft ' + i + ' in'; }
  if (inch >= 1) return sig3(inch) + ' in';
  if (inch >= 1 / 64) { const D = inch >= 0.25 ? 16 : inch >= 1 / 16 ? 32 : 64, n = Math.max(1, Math.round(inch * D)), d = gcd(n, D); return n === D ? '1 in' : (n / d) + '/' + (D / d) + ' in'; }
  if (m >= 1e-6) return sig3(m * 1e6) + ' µm'; return sig3(m * 1e9) + ' nm'; }
function hud(t) { if (t >= 57.5) return; const a = ev(0.2, 0.5) * (1 - ev(57.0, 0.4));
  pvHud('Height', fmtH(HGT(t)), 'halves every 2 seconds', a); }
function bigTitle(lines, t0, t1) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(100, Math.floor(100 * 760 / wmax)), lh = size * 1.12, y0 = 500;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(57.55, 0.4), b = ev(58.0, 0.5), g = ev(58.9, 0.5), h = ev(59.6, 0.4), e = ev(60.1, 0.4);
  const f = () => { fillAll('#121212'); pvText('What if you shrank to half', CX, 560, 48, { align: 'center', alpha: a }); pvText('your size every 2 seconds?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText("IN 60 SECONDS YOU'D BE ABOUT", CX, 800, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('A BILLION TIMES SMALLER', CX, 840, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('But relax, this will never happen…', CX, 1030, 42, { italic: true, align: 'center', alpha: g }); pvText('… or will it?', CX, 1110, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 51.6 && t < 51.98) pvTint('#000000', 1);
  if (t >= 57.2 && t < 57.5) pvTint('#000000', ss(57.2, 57.5, t));
  if (t >= 57.5) { endCard(); return; }
  hud(t);
  bigTitle(['What if you shrank', 'to half your size', 'every 2 seconds?'], 0.2, 2.8);
  capFit('And she shrinks again…', 2.9, 4.0);
  capFit('The sofa is a mountain now.', 4.4, 7.8);
  capFit("The cat thinks she's a toy.", 8.3, 10.8);
  capFit('A coin is a giant wall.', 11.4, 15.8);
  capFit('A cat flea is a monster.', 16.3, 19.8);
  capFit("The cat's fur is a jungle.", 20.3, 23.8);
  capFit('Dust mites are everywhere.', 24.3, 27.8);
  capFit('A grain of salt is a giant block.', 28.3, 30.8);
  capFit('She falls into a drop of milk…', 31.3, 35.8);
  capFit('…full of bacteria.', 36.3, 39.8);
  capFit('She lands on a cell as big as a planet.', 40.3, 43.8);
  capFit('Viruses are the size of boulders.', 44.3, 47.8);
  capFit('Inside… a world of molecules.', 48.3, 51.5);
  capFit('DNA: the code of life.', 52.3, 55.8);
  capFit("Now she's just a few atoms tall.", 56.1, 57.4);
}

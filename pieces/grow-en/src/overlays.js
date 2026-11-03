// =====================================================================
//  OVERLAYS — the height HUD (with what she is taller than), title, captions, the end card
// =====================================================================
const thou = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const nat = (v) => { if (v < 100) return v.toFixed(1); if (v < 1000) return v.toFixed(0); const p = Math.pow(10, Math.floor(Math.log10(v)) - 2); return thou(Math.round(v / p) * p); };
function fmtH(m) { const ft = m * 3.28084; if (ft < 5280) return nat(ft) + ' ft'; return nat(m / 1609.344) + ' mi'; }
const CMP = [[30, 'longer than a blue whale'], [93, 'taller than the Statue of Liberty'], [330, 'taller than the Eiffel Tower'], [828, 'taller than the Burj Khalifa'], [8849, 'taller than Mount Everest'], [100e3, 'head above the Kármán line'], [408e3, "above the Space Station's orbit"], [12742e3, 'bigger than the Earth'], [384400e3, 'taller than the distance to the Moon']];
function cmpOf(h) { let s = 'normal height'; CMP.forEach(([v, txt]) => { if (h >= v) s = txt; }); return s; }
function hud(t) { if (t >= 57) return; const a = ev(0.2, 0.5) * (1 - ev(56.5, 0.4)), h = HGT(t);
  pvHud('Your height', fmtH(h), cmpOf(h), a); }
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
function endCard() { const a = ev(57.05, 0.4), b = ev(57.5, 0.5), g = ev(58.4, 0.5), h = ev(59.0, 0.4), e = ev(59.4, 0.4);
  const f = () => { fillAll('#121212'); pvText('What would happen if you doubled', CX, 560, 48, { align: 'center', alpha: a }); pvText('your size every 2 seconds?', CX, 624, 48, { align: 'center', alpha: a });
    const mono = { font: '"Courier New", monospace', weight: 700, spacing: 1, align: 'center' };
    pvText('AT 620,000 MILES TALL, A STUBBED TOE', CX, 790, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('WOULD TAKE ABOUT 100 DAYS', CX, 830, 23, Object.assign({ alpha: b * 0.85 }, mono)); pvText('TO REACH YOUR BRAIN', CX, 870, 23, Object.assign({ alpha: b * 0.85 }, mono));
    pvText('But relax, this will never happen…', CX, 1030, 42, { italic: true, align: 'center', alpha: g }); pvText('… or will it?', CX, 1110, 60, { italic: true, align: 'center', alpha: h, color: '#f2d38a' }); pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 51.6 && t < 51.98) pvTint('#000000', 1);
  if (t >= 56.7 && t < 57) pvTint('#000000', ss(56.7, 57, t));
  if (t >= 57) { endCard(); return; }
  hud(t);
  bigTitle(['What would happen if', 'you doubled your size', 'every 2 seconds?'], 0.2, 2.9);
  capFit('At first, people just stare.', 3.2, 4.9);
  capFit('Then they run.', 5.2, 7.9);
  capFit('Cars turn into toys.', 8.2, 10.9);
  capFit('Buildings crumble at your feet.', 11.2, 14.9);
  capFit('15 seconds: as tall as the Eiffel Tower.', 15.2, 17.9);
  capFit('Taller than the Burj Khalifa.', 18.2, 19.9);
  capFit('The clouds reach your knees.', 20.2, 23.9);
  capFit('Taller than Everest. Planes swerve around you.', 24.2, 27.9);
  capFit('Your head is above 99% of the air.', 28.2, 30.9);
  capFit('31 seconds: your head is in space.', 31.2, 33.9);
  capFit('The Space Station flies right past your eyes.', 34.2, 37.9);
  capFit('The Earth curves under your feet.', 38.2, 40.9);
  capFit('One step would cross a whole country.', 41.2, 45.9);
  capFit("Now you're bigger than the Earth.", 46.2, 48.9);
  capFit('Satellites circle your legs like flies.', 49.2, 51.5);
  capFit('The Moon is 238,900 miles away…', 52.2, 54.6);
  capFit('…you could touch it.', 54.8, 56.9);
}

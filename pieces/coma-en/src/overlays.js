// =====================================================================
//  OVERLAYS — the place/time HUD, then "EN COMA · DÍA n", title, captions, the end card
// =====================================================================
const STAGES = [[16, 'DAY 1'], [24, 'DAY 2'], [31, 'DAY 3'], [36, 'WEEK 3'], [39, 'WEEK 4'], [41, 'WEEK 5'], [47, 'WEEK 6']];
function hud(t) { if (t >= 68 || (t >= 15.5 && t < 16)) return;
  if (t < 15.5) { pvHud('Valle de Bravo · Mexico', '11:48 PM', '', ev(0.2, 0.5) * (1 - ev(15, 0.5))); return; }
  let v = 'DAY 1'; STAGES.forEach(([a, s]) => { if (t >= a) v = s; });
  const a = ev(16.2, 0.5) * (1 - ev(67.4, 0.5)), sub = t >= 57.4 ? 'Response detected' : '';
  pvHud('In a coma', v, '', a);
  if (sub) { const b = a * ev(57.4, 0.4); const f = () => pvText(sub.toUpperCase(), 64, 922, 28, { font: PV.sans, weight: 700, spacing: 3, alpha: b, color: '#7fe0a8' }); if (DEFER) DEFER.push(f); else f(); } }
function bigTitle(lines, t0, t1, y0 = 500) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore(); const size = Math.min(100, Math.floor(100 * 760 / wmax)), lh = size * 1.12;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 170 + lines.length * 80, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function capFit(str, t0, t1, dy = 0) { if (TT < t0 || TT >= t1) return; const a = Math.min(ev(t0, 0.3), 1 - ev(t1 - 0.25, 0.25));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; let lines = [str];
    if (w > 760) { const mid = str.length / 2; let best = -1; for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [str.slice(0, best), str.slice(best + 1)]; }
    const size = Math.min(52, Math.floor(52 * 760 / Math.max(...lines.map((l) => ctx.measureText(l).width)))); ctx.restore(); const lh = size * 1.18, y0 = 1390 + dy - (lines.length - 1) * lh;
    pvFeather(CX, y0 - 16 + (lines.length - 1) * lh / 2, 570, 110 + (lines.length - 1) * 50, a); lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { italic: true, align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f(); }
function endCard() { const a = ev(68.3, 0.6), q = ev(69.6, 0.6), e = ev(71.2, 0.5);
  const f = () => { pvTint('#000000', 0.4 * ev(68, 0.6)); pvFeather(CX, 580, 640, 240, a * 0.9); pvText('What if you fell', CX, 560, 56, { align: 'center', alpha: a }); pvText('into a coma?', CX, 630, 56, { align: 'center', alpha: a });
    pvFeather(CX, 1180, 560, 120, q * 0.8); pvText('Would you want them to keep waiting?', CX, 1190, 44, { italic: true, align: 'center', alpha: q, color: '#f2d38a' });
    pvText('ALTERBASE', CX, 1300, 36, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 }); };
  if (DEFER) DEFER.push(f); else f(); }
function overlays(t) {
  if (t >= 15.5 && t < 16) pvTint('#000000', 1);
  if (t >= 68) { endCard(); return; }
  hud(t);
  bigTitle(['What if you fell', 'into a coma?'], 0.2, 3.8);
  capFit('Your friends dare you to jump.', 4.2, 6.9);
  capFit('You jump. Not far enough.', 7.2, 9.9);
  capFit('Your head hits a rock.', 10.2, 11.9);
  capFit("You don't wake up.", 12.4, 15.4);
  capFit("You're in a coma.", 16.4, 18.8);
  capFit('Doctors score you 3 out of 15. The lowest.', 19.2, 20.9);
  capFit('Your mom is crying beside you.', 21.3, 23.9);
  capFit('Many people in intensive care dream.', 24.3, 27.8);
  capFit('Then the dream becomes a nightmare.', 28.2, 30.9);
  capFit('Doctors talk about switching you off.', 31.2, 33.4);
  capFit('Most deaths like this happen that way.', 33.6, 35.9);
  capFit("Week 3. Your eyes open. You can't respond.", 36.3, 38.9);
  capFit("Your phone won't stop buzzing.", 39.2, 40.9);
  capFit("The doctor says: no one's in there.", 41.2, 43.9);
  capFit("But 4 times in 10, they're wrong.", 44.2, 46.9);
  capFit('Week 6. A brain scan.', 47.3, 49.9);
  capFit('A voice says: imagine walking through your house.', 50.1, 51.9);
  capFit("So you do. With everything you've got.", 52.3, 56.5);
  capFit('Your brain lights up.', 57.2, 59.9);
  capFit("1 in 4 who can't respond can do this.", 60.2, 63.9);
  capFit("You still can't move. But now they know.", 64.2, 67.9);
}

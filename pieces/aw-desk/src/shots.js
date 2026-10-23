// =====================================================================
//  SHOTS — the 29 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ['s01', 0.00, '1976', 'calendar APRIL 1976, page drops'],
  ['s02', 1.30, '1976', 'Ron signs the partnership between the two Steves'],
  ['s03', 3.62, 'desk', 'typewriter: Ron types the contract'],
  ['s04', 5.00, 'desk', 'drawing table: Ron inks the first logo'],
  ['s05', 6.44, 'desk', 'ECU: the drawing, Isaac Newton'],
  ['s06', 7.18, 'desk', 'tilt up: the tree, the apple glows and drops'],
  ['s07', 7.92, '1976', 'Jobs and Woz step in'],
  ['s08', 9.84, '1976', 'Ron in tie with briefcase, age counter 41'],
  ['s09', 10.62, '1976', 'the Steves goof around, Ron unimpressed'],
  ['s10', 12.20, '1976', 'a pie chart: the 10% slice slides to Ron'],
  ['s11', 13.22, 'money', 'bank: LED counter rolls to $15,000'],
  ['s12', 15.00, 'money', 'garage workbench, stacks of Apple I boards'],
  ['s13', 16.90, 'money', 'Byte Shop: box of UNPAID bills'],
  ['s14', 18.88, 'money', 'storm clouds roll over the garage'],
  ['s15', 20.16, 'money', 'a giant bill lands on Ron'],
  ['s16', 21.34, '1976', 'the Steves turn out empty pockets'],
  ['s17', 23.40, 'desk', 'desk calendar: 12 pages fly'],
  ['s18', 24.88, 'money', 'Ron hands over the slice, gets a $800 cheque'],
  ['s19', 27.00, 'desk', 'wall clock sweeps forward'],
  ['s20', 28.12, 'money', '$1,500 cheque; Ron walks out with a box'],
  ['s21', 30.74, 'today', 'calendar pages fly 1976 -> 2026'],
  ['s22', 31.20, 'today', 'LED board rolls to $5,000,000,000,000'],
  ['s23', 33.00, 'today', 'the old contract in a museum case'],
  ['s24', 33.95, 'today', 'pallets of cash stack up; the 10% glows'],
  ['s25', 35.89, 'today', 'Ron trades a golden lottery ticket for a used bike'],
  ['s26', 38.89, 'today', 'old Ron on his porch rocker'],
  ['s27', 40.07, 'today', 'old Ron smiles, sips lemonade'],
  ['s28', 42.33, 'today', 'the contract in his hands'],
  ['s29', 44.75, 'today', 'push into the paper -> APRIL 1976 (loops to s01)'],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = { s01: 'warmDay', s02: 'warmDay', s03: 'warmInterior', s04: 'warmInterior', s05: 'warmDay', s06: 'warmDay', s07: 'warmDay', s08: 'warmDay',
  s09: 'warmDay', s10: 'warmDay', s11: 'warmDay', s12: 'warmInterior', s13: 'warmDay', s14: 'storm', s15: 'warmInterior', s16: 'warmDay', s17: 'warmInterior',
  s18: 'warmInterior', s19: 'warmInterior', s20: 'warmInterior', s21: 'warmDay', s22: 'night', s23: 'warmInterior', s24: 'night', s25: 'dayExterior',
  s26: 'golden', s27: 'golden', s28: 'golden', s29: 'warmDay' };
const DISSOLVE = 6 / FPS;
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : 46.0];   // original timeline
// a set file's camera keys use shot-local seconds (0 = shot start); they run on through the dissolve
const SHOT_T = {};
function drawShot(i, t) {
  const [id] = SHOT_LIST[i], [a, b] = shotSpan(i), fn = SHOT_FN[id];
  if (!fn) { ctx.save(); screen(); ctx.fillStyle = '#20140e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff'; ctx.font = '700 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText(id + ' — ' + SHOT_LIST[i][3].slice(0, 30), W / 2, H / 2); ctx.restore(); return; }
  fn(t, clamp((t - a) / (b - a)), t - a);
  c3Look(SHOT_LOOK[id]);
}
const SHOT_LAYER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
function sceneApple() {
  TT = warpT(TT);   // animate on the original timeline (timewarp.js)
  const t = TT, i = shotIndexAt(t), [a] = shotSpan(i);
  if (i > 0 && t < a + DISSOLVE) {   // dissolve: the outgoing shot keeps moving under the incoming one
    drawShot(i - 1, t);
    const lx = SHOT_LAYER.getContext('2d'); lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0);
    drawShot(i, t);
    ctx.save(); screen(); ctx.globalAlpha = 1 - EZ.io((t - a) / DISSOLVE); ctx.drawImage(SHOT_LAYER, 0, 0); ctx.restore();
  } else drawShot(i, t);
  c3Vignette(0.42); c3Grain(0.05);
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

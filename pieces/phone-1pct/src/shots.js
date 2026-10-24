// =====================================================================
//  SHOTS — the 29 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ["s01", 0.00, 'street', "rainy night street, clock shows 11:47 PM"],
  ["s02", 0.70, 'street', "pouring rain on you, umbrella flips inside out"],
  ["s03", 1.82, 'phone', "your phone: battery icon 1% red"],
  ["s04", 3.16, 'phone', "ride app opens"],
  ["s05", 4.52, 'phone', "price rolls and doubles"],
  ["s06", 5.84, 'street', "you: no way (smug, shake head)"],
  ["s07", 6.90, 'street', "you sit on the bus-stop bench, arms crossed, wait"],
  ["s08", 8.04, 'phone', "the screen dims, your face goes dark"],
  ["s09", 9.56, 'phone', "Battery Saver popup"],
  ["s10", 10.88, 'street', "you realize (panic)"],
  ["s11", 12.80, 'street', "empty street, a taxi splashes past without stopping"],
  ["s12", 14.58, 'street', "no map: the paper map flies off in the wind"],
  ["s13", 15.40, 'street', "no way to call anyone: payphone OUT OF ORDER"],
  ["s14", 16.76, 'phone', "you smash ACCEPT"],
  ["s15", 18.04, 'phone', "the screen goes black, two seconds later"],
  ["s16", 20.18, 'car', "the car pulls up, splashing the puddle"],
  ["s17", 21.34, 'car', "driver looks at you, you soaking wet"],
  ["s18", 23.02, 'car', "driver: long night, huh?"],
  ["s19", 23.84, 'car', "you: yeah, expensive night too (receipt prints)"],
  ["s20", 25.64, 'hq', "whoosh to the ride company HQ at night"],
  ["s21", 26.92, 'hq', "control room: the company knows"],
  ["s22", 28.82, 'hq', "wall of phones, every battery level visible"],
  ["s23", 31.94, 'hq', "the economist at the podium"],
  ["s24", 34.20, 'hq', "chart: lower battery -> more yes to high prices"],
  ["s25", 37.10, 'car', "full battery: relaxed, clock sweeps 10 minutes"],
  ["s26", 40.58, 'car', "dying battery: hourglass draining, you can't"],
  ["s27", 42.44, 'car', "every second closer to stranded: you on a tiny island in a puddle"],
  ["s28", 45.82, 'hq', "a row of people at 1% all hitting YES"],
  ["s29", 48.96, 'hq', "spokesperson at press podium: we don't use it"],
  ["s30", 52.10, 'phone', "but it noticed: the 1% icon, an eye"],
  ["s31", 53.02, 'street', "next time: phone almost dead, price high"],
  ["s32", 56.72, 'street', "it's not just the rain"],
  ["s33", 57.94, 'street', "it's you, deciding faster: tap -> loops to s01"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = { s01: 'night', s02: 'night', s03: 'night', s04: 'night', s05: 'night', s06: 'night', s07: 'night', s08: 'night', s09: 'night', s10: 'night', s11: 'night', s12: 'night', s13: 'night', s14: 'night', s15: 'night', s16: 'night', s17: 'night', s18: 'night', s19: 'night', s20: 'night', s21: 'warmInterior', s22: 'warmInterior', s23: 'warmInterior', s24: 'warmInterior', s25: 'night', s26: 'night', s27: 'night', s28: 'night', s29: 'warmInterior', s30: 'night', s31: 'night', s32: 'night', s33: 'night' };
const DISSOLVE = 6 / FPS;
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : DURATION];
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

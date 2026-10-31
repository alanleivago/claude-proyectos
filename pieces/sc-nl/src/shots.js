// =====================================================================
//  SHOTS — the 31 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };   // Ricks exposure + contrast (kit c3Look, measured on 24 Ricks frames)
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ["s01", 0.00, 'storea', "you're late: wall clock, you grab one carton of milk in an aisle"],
  ["s02", 2.00, 'storea', "you sprint to the checkout"],
  ["s03", 3.20, 'storea', "just one person ahead of you"],
  ["s04", 4.80, 'storea', "an old lady with a single banana on the belt"],
  ["s05", 6.60, 'storea', "Easy: you smug, relaxed"],
  ["s06", 7.10, 'storea', "the cashier picks up the banana and asks how her week was"],
  ["s07", 10.30, 'storea', "she tells her, all of it (wide, chatting happily)"],
  ["s08", 11.80, 'storea', "the grandson: she shows a photo of her grandson"],
  ["s09", 12.60, 'storea', "the new knee: an x-ray card of a knee"],
  ["s10", 13.30, 'storea', "the neighbor's cat stealing her slippers (thought cloud gag)"],
  ["s11", 15.70, 'storeb', "five minutes go by, then ten: clock spins, you wilt, milk sweating"],
  ["s12", 17.40, 'storeb', "you look up at the sign above the lane, praying it says CLOSED"],
  ["s13", 20.40, 'storeb', "it says CHAT CHECKOUT"],
  ["s14", 21.80, 'storeb', "you try the next lane, the guy behind you laughs"],
  ["s15", 24.70, 'storeb', "guy: Bro, that lane's for people who aren't in a hurry. Clearly not you."],
  ["s16", 27.80, 'storeb', "but here's the twist (whoosh, reveal)"],
  ["s17", 29.00, 'storeb', "that lane isn't broken, the cashier isn't lazy"],
  ["s18", 31.40, 'storeb', "it's slow on purpose"],
  ["s19", 32.70, 'nl', "You see: Dutch street with canal houses and bikes, a big supermarket chain HQ (generic)"],
  ["s20", 35.30, 'nl', "the chain noticed something about older customers (meeting, chart)"],
  ["s21", 37.60, 'nl', "the checkout chat was the only real conversation they'd have all day: an old man home alone, quiet room"],
  ["s22", 41.30, 'nl', "loneliness hits more than a million people: counter 1,000,000 over many windows"],
  ["s23", 44.10, 'nl', "instead of making checkouts faster (fast self-checkout crossed out)"],
  ["s24", 46.10, 'lane', "they built one that's allowed to be slow: the cozy chat lane with a CHAT CHECKOUT sign"],
  ["s25", 48.10, 'lane', "cashiers who love to talk"],
  ["s26", 49.50, 'lane', "no rush, no line of people tapping their feet"],
  ["s27", 51.70, 'nl', "it worked so well they planned about 200 more: map of the Netherlands with pins popping"],
  ["s28", 54.40, 'storeb', "so next time the line won't move"],
  ["s29", 56.20, 'storeb', "maybe don't sigh"],
  ["s30", 57.30, 'storeb', "someone might be having the best conversation of their week"],
  ["s31", 59.70, 'storeb', "over a single banana: the banana hero shot, loops to s01"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = { s01: 'warmInterior', s02: 'warmInterior', s03: 'warmInterior', s04: 'warmInterior', s05: 'warmInterior', s06: 'warmInterior', s07: 'warmInterior', s08: 'warmInterior', s09: 'warmInterior', s10: 'warmInterior', s11: 'warmInterior', s12: 'warmInterior', s13: 'warmInterior', s14: 'warmInterior', s15: 'warmInterior', s16: 'warmInterior', s17: 'warmInterior', s18: 'warmInterior', s19: 'dayExterior', s20: 'warmInterior', s21: 'warmInterior', s22: 'dayExterior', s23: 'warmInterior', s24: 'warmInterior', s25: 'warmInterior', s26: 'warmInterior', s27: 'dayExterior', s28: 'warmInterior', s29: 'warmInterior', s30: 'warmInterior', s31: 'warmInterior' };
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
  c3Crisp(0.45); c3Vignette(0.34); c3Grain(0.04);
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

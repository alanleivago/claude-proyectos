// =====================================================================
//  SHOTS — the 35 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ["s01", 0.00, 'beach', "wide Cornish beach after a storm: cliffs, lighthouse, surf"],
  ["s02", 1.20, 'beach', "the strange tide: colourful glints rolling in the surf"],
  ["s03", 2.40, 'beach', "the big storm over the sea: black clouds, lightning, rain on the beach"],
  ["s04", 3.30, 'beach', "a wave pulls back and leaves Lego in the sand, one brick flung out"],
  ["s05", 4.50, 'beach', "the woman (mustard raincoat, bucket) walks along the wet sand, morning gold"],
  ["s06", 6.00, 'beach', "she crouches and picks up something tiny and black"],
  ["s07", 7.40, 'beach', "macro: a little black plastic dragon in her palm"],
  ["s08", 8.80, 'beach', "then another dragon, she grins"],
  ["s09", 9.40, 'beach', "then a flipper"],
  ["s10", 10.20, 'beach', "then a tiny life jacket in the sand"],
  ["s11", 11.70, 'beach', "here's the funny part: she looks at us, bucket overflowing"],
  ["s12", 12.90, 'beach', "almost thirty years: calendar pages fly off in the wind, 30 YEARS"],
  ["s13", 15.00, 'storm', "whoosh back: night ocean, ship's log FEB 1997"],
  ["s14", 16.30, 'storm', "the cargo ship rolling in heavy seas off Cornwall, lighthouse far"],
  ["s15", 18.00, 'storm', "a giant rogue wave slams the ship"],
  ["s16", 19.60, 'storm', "containers slide off the deck into the ocean, counter 62"],
  ["s17", 22.00, 'storm', "one container bursts: a cloud of Lego, counter 5,000,000"],
  ["s18", 24.60, 'sea', "underwater: Lego set boxes of every theme tumbling down"],
  ["s19", 26.80, 'sea', "most were sea themed: the sea-themed boxes, a big wave logo"],
  ["s20", 28.10, 'sea', "scuba tanks drifting"],
  ["s21", 29.00, 'sea', "spear guns"],
  ["s22", 29.60, 'sea', "seaweed"],
  ["s23", 30.60, 'sea', "octopuses"],
  ["s24", 31.20, 'sea', "the ocean got its own Lego collection: a fish curating a shelf of pieces"],
  ["s25", 33.50, 'hunt', "the neighbor walks by with his dog"],
  ["s26", 35.50, 'hunt', "neighbor: still cleaning up after a wave… (smug), dog sniffs the bucket"],
  ["s27", 39.00, 'sea', "plastic doesn't go away: one piece on the seabed, years ticking, unchanged"],
  ["s28", 41.00, 'sea', "it floats, it sinks, it rides the currents (current arrows)"],
  ["s29", 43.10, 'storm', "storms push it back to shore: a wave carries pieces to the beach"],
  ["s30", 45.20, 'hunt', "ocean scientist with a giant map of currents, pins and arrows"],
  ["s31", 49.30, 'hunt', "dragon hunters with torches and buckets after a storm, dusk"],
  ["s32", 51.90, 'hunt', "black dragons are common: a pile of black dragons"],
  ["s33", 53.70, 'hunt', "a green dragon glows: she holds it up like a winning lottery ticket, confetti"],
  ["s34", 57.30, 'sea', "all because one wave knocked over one box: the container on the seabed"],
  ["s35", 59.80, 'sea', "that refuses to leave: Lego trickles out, loops to s01"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = { s01: 'warmDay', s02: 'warmDay', s03: 'storm', s04: 'warmDay', s05: 'warmDay', s06: 'warmDay', s07: 'warmDay', s08: 'warmDay', s09: 'warmDay', s10: 'warmDay', s11: 'warmDay', s12: 'warmDay', s13: 'storm', s14: 'storm', s15: 'storm', s16: 'storm', s17: 'storm', s18: 'dayExterior', s19: 'dayExterior', s20: 'dayExterior', s21: 'dayExterior', s22: 'dayExterior', s23: 'dayExterior', s24: 'dayExterior', s25: 'warmDay', s26: 'warmDay', s27: 'dayExterior', s28: 'dayExterior', s29: 'storm', s30: 'warmInterior', s31: 'golden', s32: 'golden', s33: 'golden', s34: 'dayExterior', s35: 'dayExterior' };
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

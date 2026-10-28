// =====================================================================
//  SHOTS — the 35 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };   // Ricks exposure + contrast (kit c3Look, measured on 24 Ricks frames)
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ["s01", 0.00, 'lib', "exterior: a modern Oslo library by the fjord, morning"],
  ["s02", 1.30, 'lib', "inside: shelves of brand-new books by famous living writers (generic portraits, gold plaques)"],
  ["s03", 4.70, 'lib', "nobody's allowed to read them: a giant padlock snaps shut, NO READING stamp"],
  ["s04", 6.10, 'lib', "not you: your hand reaches, a glass pane blocks it (bonk)"],
  ["s05", 6.80, 'lib', "not the librarians: librarian blocked too, shrugs"],
  ["s06", 8.00, 'lib', "writers can't show anyone: a writer with a zipped mouth hides a manuscript behind his back"],
  ["s07", 10.20, 'room', "you walk into a tiny wooden room (the Silent Room)"],
  ["s08", 12.10, 'room', "and there they are: glass drawers glow as the lights come up"],
  ["s09", 13.00, 'room', "close: a sealed manuscript with a wax seal inside a glass drawer"],
  ["s10", 15.10, 'room', "each with a title and a name: brass label plates"],
  ["s11", 16.90, 'room', "you lean in, nose on the glass, breath fog: you can read the title"],
  ["s12", 18.60, 'room', "that's it: your deadpan face"],
  ["s13", 19.20, 'room', "you ask the guard when they open"],
  ["s14", 21.00, 'room', "guard: in twenty-one fourteen (a 2114 calendar device)"],
  ["s15", 22.40, 'room', "you do the math: floating equation, counting on fingers"],
  ["s16", 23.20, 'room', "you'd be… well, gone: a tiny tombstone with your name pops up"],
  ["s17", 24.10, 'room', "guard: don't worry, so will I (his own tombstone pops up, smug)"],
  ["s18", 26.10, 'forest', "and it gets weirder: whoosh out over the city"],
  ["s19", 27.00, 'forest', "a forest outside the city"],
  ["s20", 28.60, 'forest', "a thousand saplings pop up in rows, counter 1,000"],
  ["s21", 31.20, 'forest', "You see… a carved sign FUTURE LIBRARY 2014-2114 in the forest"],
  ["s22", 34.00, 'forest', "every year for a hundred years: seasons cycle over the forest, year counter"],
  ["s23", 35.70, 'forest', "one writer hands in one book (ceremony in the forest)"],
  ["s24", 37.20, 'room', "that stays locked away until twenty-one fourteen: drawer closes, lock dial 2114"],
  ["s25", 39.80, 'forest', "those thousand trees fully grown by then: time-lapse trees shooting up"],
  ["s26", 42.20, 'print', "cut down to make the paper: logs into a paper machine, sheets fly"],
  ["s27", 43.80, 'print', "the books finally printed: a press stamps, a book pops out 2114 EDITION"],
  ["s28", 45.50, 'print', "every writer writes for readers not born yet: writer at desk, future babies in cradles"],
  ["s29", 48.90, 'print', "no reviews: empty review stars"],
  ["s30", 49.80, 'print', "no fan mail: empty mailbox with a cobweb"],
  ["s31", 50.80, 'print', "they'll never know if anyone liked it: writer stares at 0 likes"],
  ["s32", 52.60, 'print', "they just write it, seal it and walk away: wax seal, writer walks off"],
  ["s33", 54.50, 'forest', "somewhere in that forest, right now: golden-hour push-in to one tree"],
  ["s34", 57.00, 'forest', "a tree slowly growing into a book: the tree morphs into a giant book"],
  ["s35", 58.90, 'room', "that nobody alive today will ever get to read: the sealed drawer, lights dim, loops to s01"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = { s01: 'dayExterior', s02: 'warmDay', s03: 'warmDay', s04: 'warmDay', s05: 'warmDay', s06: 'warmDay', s07: 'warmInterior', s08: 'warmInterior', s09: 'warmInterior', s10: 'warmInterior', s11: 'warmInterior', s12: 'warmInterior', s13: 'warmInterior', s14: 'warmInterior', s15: 'warmInterior', s16: 'warmInterior', s17: 'warmInterior', s18: 'dayExterior', s19: 'dayExterior', s20: 'dayExterior', s21: 'dayExterior', s22: 'golden', s23: 'golden', s24: 'warmInterior', s25: 'golden', s26: 'warmInterior', s27: 'warmInterior', s28: 'warmInterior', s29: 'warmInterior', s30: 'warmInterior', s31: 'warmInterior', s32: 'warmInterior', s33: 'golden', s34: 'golden', s35: 'warmInterior' };
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

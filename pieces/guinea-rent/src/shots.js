// =====================================================================
//  SHOTS — 33 shots cut on word onsets (Ricks: ~1.4-2 s each, hard cuts, whip pans at place changes, the longest shot
//  saved for the end). Every set file registers SHOT_FN[id] = (t, u, lt) => { ... }: it renders the full frame for
//  absolute time t with c3Render and draws nothing else; the finish and the one-word subtitle are added here.
//  Camera = the house SNAP camera (ref 6WTahOqdEl4): hold, then snap in ~5 frames onto what the voice names (SNAPS).
// =====================================================================
C3_HD = true;
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.12, s: 1.1, vib: 0.4, bgBlur: 0.85 });   // toon-test grade (toon.js cards); stronger lens blur (Ricks CUs)
C3_INK2 = C3_INK2_DEF; C3_SHADOW = Object.assign({}, C3_SHADOW_DEF, { catch: 0.55, tint: '#2a2050', key: 0.8 });   // warm light, cool violet shadows
const SHOT_FN = {}, SNAPS = {};   // set files fill both (SNAPS[id] = [[t, targets, fill], ...])
// [id, t0, set, what we see] — t0 = the onset of the shot's first word (voice/words.json)
const SHOT_LIST = [
  ["s01", 0.00, 'home', "In Switzerland, you can get: the owner by the cage, the Alps in the window, the Swiss flag"],
  ["s02", 1.40, 'home', "trouble for having a lonely guinea pig: the cage, push in to Gerald alone"],
  ["s03", 3.26, 'home', "You buy one, name him Gerald: the owner lifts Gerald; crane down to the GERALD plate on the cage"],
  ["s04", 4.66, 'home', "build him a tiny house: hammering, the tiny house with its GERALD sign"],
  ["s05", 5.96, 'home', "and you've already broken the law: TOP-DOWN on the NOTICE OF VIOLATION on the table, pan down the lines, the ILLEGAL stamp slams on \"law\""],
  ["s06", 7.50, 'office', "Because Swiss law says: the official opens the big ANIMAL WELFARE ACT"],
  ["s07", 8.50, 'office', "social animals like guinea pigs need company: the poster, 2 pigs = OK, 1 pig = NO"],
  ["s08", 10.82, 'home', "So you get Gerald a friend: the friend lands in the cage, a heart"],
  ["s09", 12.36, 'home', "Problem solved: the owner dusts his hands, smug; the pigs cuddle"],
  ["s10", 13.44, 'home', "Until one day, the friend dies: the friend's eyes close, a halo floats up"],
  ["s11", 15.62, 'home', "Now Gerald is alone: Gerald alone under the lamp, sad"],
  ["s12", 16.80, 'home', "and you can't leave him like that: the owner, worried"],
  ["s13", 18.24, 'home', "But if you buy him a young friend: a baby pig pops in, sparkle"],
  ["s14", 19.72, 'home', "that one will outlive Gerald: two little hourglasses, the young one's full, Gerald's almost run out"],
  ["s15", 21.32, 'home', "And then you'll need another one. And another one: pigs pop in one after another"],
  ["s16", 23.54, 'home', "Forever: wide, an endless line of guinea pigs out of the door, the owner screams"],
  ["s17", 24.18, 'home', "So you call: the owner on the phone"],
  ["s18", 25.04, 'lady', "a lady who rents out guinea pigs: the lady on her phone, her herd, RENT-A-PIG"],
  ["s19", 26.36, 'home', "She shows up with a little box: the lady at the door with the box"],
  ["s20", 27.90, 'home', "and inside is an old, calm guinea pig: the box opens, the old grey pig"],
  ["s21", 30.48, 'home', "ready for the job: the old pig steps out next to Gerald, nods"],
  ["s22", 31.64, 'home', "She looks at Gerald and says: the lady leans over the cage, Gerald nervous"],
  ["s23", 33.14, 'home', "Don't worry. Mine's very good at goodbyes: the lady, kind; the old pig, smug"],
  ["s24", 35.52, 'office', "You see, Switzerland changed its animal laws in 2008: TOP-DOWN on the ordinance on the desk, the stamp slams, a red pen circles 2008"],
  ["s25", 38.42, 'office', "so that social animals can't be kept alone: the poster, NOT ALONE! stamped on it, the official wags a finger"],
  ["s26", 40.88, 'home', "Because a guinea pig with nobody to talk to gets stressed: Gerald chats to his water bottle, then pops in panic"],
  ["s27", 43.76, 'office', "So a woman near Zurich: the wall map, the ZURICH pin"],
  ["s28", 44.98, 'lady', "started renting out companions: the lady with her clipboard, the herd"],
  ["s29", 46.52, 'home', "for the last guinea pig standing: Gerald alone in a spotlight"],
  ["s30", 48.06, 'home', "When your pet's friend passes away, you borrow one of hers: the lady hands the box over"],
  ["s31", 51.36, 'home', "And when your pet passes away too: Gerald's halo, the owner sad"],
  ["s32", 52.94, 'lady', "the rented one goes back home to her herd: the old pig scurries into the pen, the herd hops"],
  ["s33", 54.98, 'lady', "Nobody gets left alone: the herd, the lady, the old pig home"],
  ["s34", 56.36, 'lady', "Not even the guinea pig who's only there on contract + GAG: TOP-DOWN on the contract on the box, handwriting, the paw signs; crane up; the box bursts into guinea pigs"],
];
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id]) => [id, 'warmInterior']));
// background lens blur per shot (Ricks: close-ups clearly blurred, wides ~3)
C3_DOF = {};
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null;
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[7.16, 0.8], [36.38, 0.9], [58.48, 0.4], [59.5, 3.4], [59.62, 2.4], [59.8, 1.4]], roll: {} });   // only real impacts kick
C3_SNAP = Object.assign({}, C3_SNAP_DEF, { blur: 8, blurMin: 99 });   // v2: no sub-frame camera blur (it switched on/off mid-shot)
{ const render1 = c3Render;
  c3Render = function (scene, cam, o) { if (C3_DRY) { C3_DRY_CAM = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov }; return; }
    scene.traverse((m) => { if (m.userData.tick) m.userData.tick(TT); }); return render1(scene, cam, o); };
}
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : DURATION];
function drawShot(i, t) {
  const [id] = SHOT_LIST[i], [a, b] = shotSpan(i), fn = SHOT_FN[id];
  if (!fn) { ctx.save(); screen(); ctx.fillStyle = '#20140e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff'; ctx.font = '700 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText(id + ' — ' + SHOT_LIST[i][3].slice(0, 30), W / 2, H / 2); ctx.restore(); return; }
  const fresh = Array.isArray(SNAPS[id]) && !SNAP_KEYS[id];   // the first frame measures the snap keys with dry runs: draw it again so nothing they posed leaks in
  C3_SHOT = { id, t0: a }; CUR_SHOT = id; try { fn(t, clamp((t - a) / (b - a)), t - a); if (fresh) fn(t, clamp((t - a) / (b - a)), t - a); } finally { CUR_SHOT = null; }
  c3Look(SHOT_LOOK[id]);
}
// Ricks mixes hard cuts with 4-7 frame moving dissolves (ricks-documentos-camara.md)
const DIS = 5 / FPS, DISSOLVE_IN = new Set(['s04', 's09', 's11', 's14', 's21', 's23', 's31', 's34']);
const SHOT_LAYER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
// the whip pan without the kit's black fill (review: a black band entered on the edge): the gap is filled with a blurred,
// enlarged copy of the frame, then the smeared copies on top
function grWhip(u, dir) {
  if (u <= 0) return; const L = grWhip.L ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), lx = L.getContext('2d');
  lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0); const sh = dir * W * 0.75 * u * u, rot = dir * 0.12 * u * u, n = 9, step = dir * W * 0.04 * u;
  ctx.save(); screen(); ctx.filter = 'blur(28px)'; ctx.drawImage(L, -W * 0.4, -H * 0.2, W * 1.8, H * 1.4); ctx.filter = 'none';
  for (let k = 0; k < n; k++) { ctx.globalAlpha = k ? 1 / (k + 1) : 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2 + sh - k * step, H / 2); ctx.rotate(rot); ctx.scale(1 + 0.25 * u, 1 + 0.25 * u); ctx.drawImage(L, -W / 2, -H / 2); }
  ctx.restore();
}
function sceneApple() {
  const t = TT, place = (j) => j > 0 && j < SHOT_LIST.length && SHOT_LIST[j][2] !== SHOT_LIST[j - 1][2];
  c3SnapBlur((tt) => { const j = shotIndexAt(tt), [a0] = shotSpan(j), n = j + 1 < SHOT_LIST.length ? shotSpan(j + 1)[0] : 1e9, wh = C3_SNAP.whip;
    if (j > 0 && !place(j) && DISSOLVE_IN.has(SHOT_LIST[j][0]) && tt < a0 + DIS) {   // a moving dissolve (both shots keep moving)
      drawShot(j - 1, tt); const lx = SHOT_LAYER.getContext('2d'); lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0);
      drawShot(j, tt); ctx.save(); screen(); ctx.globalAlpha = 1 - EZ.io((tt - a0) / DIS); ctx.drawImage(SHOT_LAYER, 0, 0); ctx.restore();
    } else drawShot(j, tt);   // hard cuts on the word; a whip pan across every change of place
    if (place(j + 1) && tt > n - wh) grWhip((tt - (n - wh)) / wh, -1); else if (place(j) && tt < a0 + wh) grWhip(1 - (tt - a0) / wh, 1); }, t);
  c3Crisp(0.6); c3Vignette(0.22);
  { const f = Math.floor((t - 59.5) * FPS + 1e-6); if (f >= 0 && f < 4) { const L = sceneApple.L ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), lx = L.getContext('2d');   // impact frames: 2 frames of high-contrast ink
    lx.filter = 'none'; lx.drawImage(ctx.canvas, 0, 0); ctx.save(); screen(); ctx.filter = ['grayscale(1) contrast(9) brightness(1.6)', 'grayscale(1) contrast(9) invert(1)', 'grayscale(1) contrast(9) brightness(1.6)', 'contrast(1.6) saturate(1.8)'][f]; ctx.drawImage(L, 0, 0); ctx.restore(); } }
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
function buildBoard() { TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  const sn = (Array.isArray(SNAPS[id]) ? SNAPS[id] : []).map((k) => k[0]).filter((k) => k < b - 0.1), last = sn.length ? sn[sn.length - 1] : a;   // the shot's last framing, settled (never mid-snap)
  return { t: id === 's34' ? 58.9 : Math.min(b - (i + 1 < SHOT_LIST.length && SHOT_LIST[i + 1][2] !== set ? 0.13 : 0.04), Math.max(a + (b - a) * 0.6, last + 0.38)), title: `${i + 1}. ${a.toFixed(2)}s ${words}`.slice(0, 70), sound: what, next: '' };
});
TIMELINE.board.push({ t: 59.86, title: '34b. 59.50s GAG: the box explodes into guinea pigs', sound: 'end gag', next: '' }); }   // called from bridges.js (after the set files fill SNAPS)
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

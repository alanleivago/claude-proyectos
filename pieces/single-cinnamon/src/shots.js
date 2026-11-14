// =====================================================================
//  SHOTS — 28 shots (lost-luggage header below kept for reference) cut on word onsets (Ricks: ~1.4-2 s each, hard cuts, whip pans at place changes) + 3 wordless gag
//  beats (G1 12.87, G2 26.85, G3 52.12) + the closing gag after the voice (58.10-60.50). Every set file registers SHOT_FN[id] = (t, u, lt) => { ... }: it renders the full frame for
//  absolute time t with c3Render and draws nothing else; the finish and the one-word subtitle are added here.
//  Camera = the house SNAP camera (ref 6WTahOqdEl4): hold, then snap in ~5 frames onto what the voice names (SNAPS).
// =====================================================================
C3_HD = true; T3.hairDetail = 1.4;   // v4: strand detail + gloss on every hairstyle (toon.js opt-in)
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.2, c: 1.04, s: 1.18, vib: 0.42, bgBlur: 0.85 });   // v5: high-key + colourful like the user's Ricks refs (qa/ricks_ref_1..5)   // v3: fuller tonal range, less flat saturation (Ricks envs)   // toon-test grade (toon.js cards); stronger lens blur (Ricks CUs)
C3_INK2 = Object.assign({}, C3_INK2_DEF, { bg: false, px: 2.6 });   // v3: no ink on the set (Ricks' sets have none), thinner on the subject layer
 C3_SHADOW = Object.assign({}, C3_SHADOW_DEF, { catch: 0.36, tint: '#3a48a8', key: 0.95, dark: 1.05, type: 'vsm', radius: 4, blurSamples: 10, size: 4096, bias: -0.0005, normalBias: 0.05, maxRad: 110 });   // v4: soft VSM shadows (no acne flicker)
C3_AO = { r: 2.2, k: 0.85, bias: 0.15, blur: 2.0 };   // v4: SSAO on the set (setlook.js)   // warm light, cool violet shadows
const SHOT_FN = {}, SNAPS = {};
// v5 COLOUR SCRIPT (user rejected v4's global lift: "you just raised the lighting and saturation on everything"). The v4
// boost is gone; each set has a designed palette measured on the Ricks refs (fuentes/cartoon3d/ricks-color.md): warm key /
// cool shadow, world fades on walls + floors (setlook.js via color.js c3ColorWorld), painted skies (exterior.js), and one
// post pass (color.js c3Grade): split tone, coloured lift, saturation by luminance, filmic shoulder (nothing clips),
// screen fades + a light glow, vignette and the slight barrel bulge. exp = renderer exposure (ACES), catch = shadow-catcher.
const COLOR = {
  // golden hour in Denmark: low warm key (#ffb468..#ffc078 highlights), blue-sky fill (#2f68b0..#4a7ae0 shadows), saturated facades
  street: { exp: 1.0, catch: [0.32, '#1e2a6a'], face: ['#fff0e4', 0.2],   // residential row-house street (ochre, red, teal, mustard facades, cobbles, bikes)
    world: { top: '#ffffff', bot: '#fff0de', y: [0, 20], near: '#fff0dc', far: '#e2e4f2', c: [0, 0], r: [20, 160] },
    grade: { expo: 1.3, lift: '#22306a', liftK: 0.14, shadow: '#4a7ae0', hi: '#ffb870', tintK: 0.36, sat: [1.1, 1.4, 1.2], contrast: 1.14, shoulder: [0.76, 0.99],
      top: '#ffe6d0', bot: '#fff0de', fadeK: 0.1, glow: [0.75, 0.3, 0.5, 0.1, '#ffa868'], vig: 0.18, barrel: 0.12 } },
  canal: { exp: 1.0, catch: [0.32, '#1e2a6a'], face: ['#fff0e4', 0.2],   // Nyhavn-style canal quay: gabled facades, masts, the cast-iron lamppost, cafe parasols
    world: { top: '#ffffff', bot: '#fff0de', y: [0, 20], near: '#fff0dc', far: '#dfe4f4', c: [0, 0], r: [20, 160] },
    grade: { expo: 1.3, lift: '#20306a', liftK: 0.14, shadow: '#3f72dc', hi: '#ffb468', tintK: 0.36, sat: [1.1, 1.4, 1.25], contrast: 1.15, shoulder: [0.76, 0.99],
      top: '#ffe2cc', bot: '#fff0de', fadeK: 0.1, glow: [0.75, 0.3, 0.5, 0.1, '#ffa060'], vig: 0.18, barrel: 0.12 } },
  history: { exp: 1.02, catch: [0.34, '#22244e'], face: ['#fff0dc', 0.24],   // old Danish market town (1700s): half-timbered houses, spice cart, amber late sun, teal shadows
    world: { top: '#fff4e2', bot: '#fff0dc', y: [0, 24], near: '#fff0d8', far: '#d8dcec', c: [0, 0], r: [16, 120] },
    grade: { expo: 1.25, lift: '#1e2c5e', liftK: 0.14, shadow: '#3a6ec8', hi: '#ffc078', tintK: 0.42, sat: [1.1, 1.35, 1.1], contrast: 1.16, shoulder: [0.76, 0.99],
      top: '#ffe8c8', bot: '#fff0dc', fadeK: 0.1, glow: [0.6, 0.3, 0.5, 0.1, '#ffb060'], vig: 0.22, barrel: 0.12 } },
  square: { exp: 1.0, catch: [0.32, '#1e2a6a'], face: ['#fff0e4', 0.2],   // town square with two lampposts, Dannebrog bunting, bakery; d06 = dusk (pinker sky)
    world: { top: '#ffffff', bot: '#fff0de', y: [0, 20], near: '#fff0dc', far: '#e0e4f4', c: [0, 0], r: [20, 160] },
    grade: { expo: 1.3, lift: '#22306a', liftK: 0.14, shadow: '#4a7ae0', hi: '#ffb870', tintK: 0.36, sat: [1.1, 1.4, 1.2], contrast: 1.14, shoulder: [0.76, 0.99],
      top: '#ffe6d0', bot: '#fff0de', fadeK: 0.1, glow: [0.75, 0.3, 0.5, 0.1, '#ffa868'], vig: 0.18, barrel: 0.12 } },
};
const setOf = (id) => (SHOT_LIST.find((r) => r[0] === id) || [])[2] || 'street';
const colorNow = () => COLOR[setOf(C3_SHOT && C3_SHOT.id)] || COLOR.street;   // set files fill both (SNAPS[id] = [[t, targets, fill], ...])
// [id, t0, set, what we see] — t0 = the onset of the shot's first word (voice/words.json); G1/G2/G3 = wordless gag beats
const SHOT_LIST = [
  ["c01", 0.00, 'canal', "In Denmark, if you're still single on your 25th birthday: crane DOWN from the sky over Nyhavn-style gabled facades, a Dannebrog flag and ship masts to YOU on the quay holding a cupcake with a '25' candle (lands on '25th')"],
  ["c02", 3.24, 'canal', 'your friends do something strange: the 3 friends peek out grinning from behind a cafe parasol, hiding rope, bucket and a sack'],
  ["c03", 4.80, 'canal', "They tie you to a lamppost and cover you in cinnamon: rope snaps round you and the cast-iron lamppost on 'tie'; a brown cinnamon cloud poofs over you on 'cinnamon'"],
  ["a01", 7.70, 'street', "You're walking home from work, thinking about cake: whip into a row-house street; you walk with a work bag past bikes; on 'cake' you stop at a bakery window with a big layer cake (KAGE)"],
  ["a02", 9.74, 'street', "and suddenly your best friends jump out of a car: a little car screeches up, doors fly open, the 3 friends leap out on 'jump' (anticipation, squash landing)"],
  ["a03", 12.28, 'street', "They've got rope, they've got a bucket of water, and they've got an entire bag of cinnamon: the camera lands on each on its word: rope, bucket, the huge KANEL sack"],
  ["c04", 16.56, 'canal', "Ten minutes later, you're tied to a post in the middle of the street: whip back to the quay; the facade clock jumps 10 minutes; you, tied tight to the lamppost"],
  ["c05", 19.28, 'canal', 'soaking wet: the bucket friend throws the water (splash, drips)'],
  ["c06", 20.08, 'canal', 'covered head to toe in spice: the sack friend pours cinnamon over you, head to toe, a brown cloud'],
  ["c07", 21.54, 'canal', 'A stranger walks past, sniffs, and says: an old gentleman walks in, stops, sniffs the air (scent wisps)'],
  ["c08", 23.66, 'canal', 'Happy birthday! Still single, huh?: the stranger, deadpan then smug; you, dusted, sulk'],
  ["h01", 25.68, 'history', "You see, it's a real tradition, and people say it goes back hundreds of years: whip into an old Danish market town (1700s), crane down from the church spire"],
  ["h02", 29.06, 'history', 'to spice sellers who traveled from town to town: the pepper man pushes his spice cart down a road; a signpost with town names'],
  ["h03", 31.54, 'history', 'and were so busy they never settled down: swamped at his cart selling; a girl waves at him, he is too busy, she leaves'],
  ["h04", 33.48, 'history', "Unmarried men got called pepper men, and it stuck: townsfolk point and laugh; a PEBERSVEND board gets nailed onto his cart on 'stuck'"],
  ["d01", 36.14, 'square', "So at 25, you get cinnamon, the gentle spice: whip to a town square; you on lamppost 1 with a '25' sign, cinnamon sprinkling softly"],
  ["d02", 39.04, 'square', "But if you're still single at 30, your friends upgrade you to pepper: the next lamppost: the 30-year-old with a '30' sign; on 'upgrade' the friends roll in a giant pepper grinder; on 'pepper' a black pepper burst"],
  ["d03", 42.72, 'square', "And somehow, it's one of the happiest days of the year: both laugh, Dannebrog flags and bunting wave, balloons"],
  ["d04", 45.44, 'square', 'The whole street joins in, everyone takes pictures: a crowd gathers with phones, flashes pop on pictures'],
  ["d05", 47.64, 'square', 'and you smell like a cinnamon roll for days: untied, you walk off with cinnamon scent wisps; a giant cinnamon-roll bakery sign'],
  ["a04", 49.76, 'street', "So if you're ever in Denmark, and someone walks past smelling like dessert: whip to the street; a woman dusted in cinnamon walks past trailing scent wisps"],
  ["a05", 53.68, 'street', "don't ask about their love life: you open your mouth to ask, she glares; you shut it"],
  ["a06", 55.12, 'street', 'Just say, happy birthday: you wave and say it; she beams and waves a little Dannebrog flag'],
  ["d06", 56.76, 'square', "Because somewhere out there, a 30-year-old is still sneezing pepper: whip to the square at dusk, the 30-year-old alone on his lamppost, pepper-coated; ah.. ah.. and a giant sneeze ON 'pepper' (59.96): pepper cloud blasts, camera kick"],
];
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, ['street', 'canal', 'square'].includes(set) ? 'warmDay' : 'warmInterior']));
// background lens blur per shot (Ricks: close-ups clearly blurred, wides ~3)
C3_DOF = {};
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null;
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[11.40, 0.6], [19.40, 0.9], [59.98, 1.6]], roll: {} });   // only real impacts kick
C3_SNAP = Object.assign({}, C3_SNAP_DEF, { blur: 8, blurMin: 99 });   // v2: no sub-frame camera blur (it switched on/off mid-shot)
{ const render1 = c3Render;
  c3Render = function (scene, cam, o) { if (C3_DRY) { C3_DRY_CAM = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov }; return; }
  // v4: person cards never take cast shadows (faces stay lit)
    scene.traverse((m) => { if (m.userData.tick) m.userData.tick(TT); if (m.userData.person) m.traverse((c) => { if (c.isMesh) c.receiveShadow = false; }); });
    const CS = colorNow(); c3Renderer().r.toneMappingExposure = CS.exp; c3ColorWorld(CS.world);
    if (!scene.userData.faceSet && CS.face) { scene.userData.faceSet = true; const a = new THREE.AmbientLight(CS.face[0], CS.face[1]); c3Layer(a, C3.L_FOCUS); scene.add(a); }   // v5: a neutral-warm fill on the characters only (faces stay white under coloured set light)
    if (!scene.userData.catchSet && scene.userData.c3shadow) { scene.userData.catchSet = true; scene.traverse((m) => { if (m.userData.c3catch && m.material && m.material.isShadowMaterial) { m.material.opacity = CS.catch[0]; m.material.color.set(CS.catch[1]); } }); }
    const k = C3_SHADOW; if (k) C3_SHADOW = Object.assign({}, k, { catch: CS.catch[0], tint: CS.catch[1] });   // first frame too (the catchers are made inside the render)
    stableShadow(scene);   // v2: texel-snapped shadow frustum (no swimming)
    try { return render1(scene, cam, Object.assign({}, o, { grade: 'saturate(1)' })); } finally { C3_SHADOW = k; } };   // v5: no CSS grade on the set (it clipped); colour = the colour script
}
const STORY_T = (t) => t;   // the voice runs continuously: story time = video time
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : DURATION];
function drawShot(i, t) {
  const [id] = SHOT_LIST[i], [a, b] = shotSpan(i), fn = SHOT_FN[id];
  if (!fn) { ctx.save(); screen(); ctx.fillStyle = '#20140e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff'; ctx.font = '700 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText(id + ' — ' + SHOT_LIST[i][3].slice(0, 30), W / 2, H / 2); ctx.restore(); return; }
  const fresh = Array.isArray(SNAPS[id]) && !SNAP_KEYS[id];   // the first frame measures the snap keys with dry runs: draw it again so nothing they posed leaks in
  C3_SHOT = { id, t0: a }; CUR_SHOT = id; const st = STORY_T(t); try { fn(st, clamp((t - a) / (b - a)), t - a); if (fresh) fn(st, clamp((t - a) / (b - a)), t - a); } finally { CUR_SHOT = null; }
}
// Ricks mixes hard cuts with 4-7 frame moving dissolves (ricks-documentos-camara.md)
const DIS = 5 / FPS, DISSOLVE_IN = new Set([]);   // none: inside a set the camera never cuts (seqCam)
const SHOT_LAYER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
// the whip pan without the kit's black fill (review: a black band entered on the edge): the gap is filled with a blurred,
// enlarged copy of the frame, then the smeared copies on top
function grWhip(u, dir) {
  if (u <= 0) return; const L = grWhip.L ||= Object.assign(document.createElement('canvas'), { width: W, height: H }), lx = L.getContext('2d');
  lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0); const sh = dir * W * 0.75 * u * u, rot = dir * 0.12 * u * u, n = 20, step = dir * W * 0.018 * u;   // v6: more, closer copies (9 read as comb bands)
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
  c3Grade((COLOR[SHOT_LIST[shotIndexAt(t)][2]] || COLOR.street).grade);   // v5: the colour pass (+ barrel), before the captions
  c3Crisp(0.5);
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
const BOARD_T = { c02: 3.7, a02: 11.8, c08: 25.5, d03: 43.2, d05: 48.2, d06: 60.35 };   // panel time overrides (storyboard v1 review)
function buildBoard() { TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  const sn = (Array.isArray(SNAPS[id]) ? SNAPS[id] : []).map((k) => k[0]).filter((k) => k < b - 0.1), last = sn.length ? sn[sn.length - 1] : a;   // the shot's last framing, settled (never mid-snap)
  return { t: BOARD_T[id] ?? Math.min(b - (i + 1 < SHOT_LIST.length && SHOT_LIST[i + 1][2] !== set ? 0.13 : 0.04), Math.max(a + (b - a) * 0.6, last + 0.38)), title: `${i + 1}. ${a.toFixed(2)}s ${words || what.split(':')[0]}`.slice(0, 70), sound: what, next: '' };
});
}   // called from bridges.js (after the set files fill SNAPS)
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

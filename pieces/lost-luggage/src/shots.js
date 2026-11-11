// =====================================================================
//  SHOTS — 38 shots cut on word onsets (Ricks: ~1.4-2 s each, hard cuts, whip pans at place changes) + 3 wordless gag
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
  airport: { exp: 1.05, catch: [0.3, '#24285a'], face: ['#fff0e0', 0.3],   // late-afternoon golden hour through the tall windows (ref 3 lobby)
    world: { top: '#b4b0dc', bot: '#fff0de', y: [0, 34], near: '#fff4e4', far: '#c4bce0', c: [0, 4], r: [8, 70], ceil: '#a6a4d2' },
    grade: { expo: 1.3, lift: '#34406e', liftK: 0.42, shadow: '#7890e0', hi: '#ffdcaa', tintK: 0.4, sat: [0.95, 1.22, 0.75], contrast: 1.03, shoulder: [0.76, 0.99],
      top: '#d8d6ff', bot: '#fff0e2', fadeK: 0.14, glow: [0.75, 0.82, 0.45, 0.1, '#ffb070'], vig: 0.2, barrel: 0.12 } },
  outside: { exp: 1.0, catch: [0.3, '#1e2e6a'], face: ['#fff4ea', 0.15],   // sunny Alabama: cobalt zenith -> milky horizon, painted clouds, blue shadows (ref 1, 7xS)
    world: { top: '#ffffff', bot: '#fff2e2', y: [0, 20], near: '#fff4e2', far: '#d4dcee', c: [0, 0], r: [20, 160] },
    grade: { expo: 1.22, lift: '#2e3a72', liftK: 0.36, shadow: '#6a88e0', hi: '#fff0d2', tintK: 0.4, sat: [0.95, 1.08, 0.72], contrast: 1.03, shoulder: [0.76, 0.99],
      top: '#e2e8ff', bot: '#fff4e4', fadeK: 0.1, glow: [0.8, 0.88, 0.5, 0.08, '#fff0c8'], vig: 0.18, barrel: 0.12 } },
  sort: { exp: 1.15, catch: [0.3, '#1c2a60'], face: ['#fff2e4', 0.25],   // the factory: ultramarine walls, warm orange floor, yellow lamp pools (ref 4)
    world: { top: '#b8c4f0', bot: '#fff4e4', y: [0, 40], near: '#fff2de', far: '#c8c0dc', c: [0, 30], r: [10, 70], ceil: '#8c98d8' },
    grade: { expo: 1.3, lift: '#2c3670', liftK: 0.4, shadow: '#6c80dc', hi: '#ffe0b0', tintK: 0.4, sat: [0.95, 1.22, 0.75], contrast: 1.03, shoulder: [0.76, 0.99],
      top: '#d4dcff', bot: '#fff0de', fadeK: 0.12, glow: [0.3, 0.85, 0.45, 0.08, '#ffd890'], vig: 0.2, barrel: 0.12 } },
  store: { exp: 1.0, catch: [0.3, '#1e1e40'], face: ['#fff2e4', 0.2],   // warm retail: cream -> peach walls, sun patches, violet shadows (ref 3/5)
    world: { top: '#f0dcc4', bot: '#fff8ec', y: [0, 30], near: '#fff8ea', far: '#ecdcd0', c: [0, 30], r: [10, 80], ceil: '#e4d2bc' },
    grade: { expo: 1.48, lift: '#2e4068', liftK: 0.36, shadow: '#80aee8', hi: '#ffe0b0', tintK: 0.2, sat: [0.95, 1.18, 0.75], contrast: 1.03, shoulder: [0.76, 0.99],
      top: '#eef0ff', bot: '#fff4e4', fadeK: 0.1, glow: [0.6, 0.9, 0.5, 0.08, '#ffc88a'], vig: 0.2, barrel: 0.12 } },
  museum: { exp: 1.2, catch: [0.3, '#1a1a3a'], face: ['#fff0dc', 0.3],   // dark warm hall: teal walls fading up, amber spot pools, burgundy carpet (ship galley)
    world: { top: '#b4bede', bot: '#fff2e2', y: [0, 30], near: '#fff4e4', far: '#d8cce0', c: [10, 20], r: [8, 70], ceil: '#8c96bc' },
    grade: { expo: 1.55, lift: '#2c3260', liftK: 0.5, shadow: '#6274c8', hi: '#ffd6a0', tintK: 0.4, sat: [0.9, 1.22, 0.75], contrast: 1.03, shoulder: [0.76, 0.99],
      top: '#d0d4ff', bot: '#ffeedd', fadeK: 0.14, glow: [0.5, 0.75, 0.45, 0.08, '#ffc070'], vig: 0.22, barrel: 0.12 } },
};
const setOf = (id) => (SHOT_LIST.find((r) => r[0] === id) || [])[2] || 'airport';
const colorNow = () => COLOR[setOf(C3_SHOT && C3_SHOT.id)] || COLOR.airport;   // set files fill both (SNAPS[id] = [[t, targets, fill], ...])
// [id, t0, set, what we see] — t0 = the onset of the shot's first word (voice/words.json); G1/G2/G3 = wordless gag beats
const SHOT_LIST = [
  ["s01", 0.00, 'airport', "You land, you wait at the carousel: crane down over the big baggage hall to the traveller at carousel 4, bags circling"],
  ["s02", 1.72, 'airport', "and your suitcase never comes out: the rubber flaps of the carousel mouth, other bags slide out; on 'out' the belt is empty, the traveller alone"],
  ["s03", 3.20, 'airport', "The airline searches for months: BAGGAGE SERVICES counter, the clerk typing; behind her the wall calendar flips its months on 'months'"],
  ["s04", 4.82, 'airport', "then gives up: TOP-DOWN on the MISSING BAGGAGE REPORT on the counter, pan down the lines, the CASE CLOSED stamp slams on 'up'"],
  ["s05", 5.62, 'airport', "So where does it go?: the lost-and-found cage in the back room, the lone blue suitcase under one lamp, slow push in"],
  ["s06", 6.36, 'outside', "Alabama: whip; low angle on the WELCOME TO ALABAMA road sign, a truck stacked with suitcases roars past"],
  ["s07", 7.20, 'outside', "There's a store in a small town there: crane up over the little main street to the big store with the UNCLAIMED BAGGAGE sign"],
  ["s08", 8.90, 'outside', "that buys lost luggage nobody ever claimed: the loading dock, the driver wheels a dolly of suitcases (gripped handles), the buyer hands him cash"],
  ["s09", 10.94, 'sort', "opens it, and sells everything inside: the sorter snaps a suitcase open on the long table and lifts out a shirt; the price gun tags it on 'sells'"],
  ["s10", 12.87, 'sort', "G1 GAG (wordless 1.2 s): the next suitcase on the table shakes, bulges and bursts: rubber chicken, bowling ball, a storm of socks, a garden gnome; the sorter ducks"],
  ["s11", 14.07, 'store', "You walk in: the sliding doors open, the shopper walks in (long travelling with her)"],
  ["s12", 14.64, 'store', "and it's like a mall built out of other people's vacations: the big crane up and back revealing the whole store: aisles, signs, shoppers"],
  ["s13", 17.40, 'store', "Shirts, cameras, headphones, wedding dresses, a whole rack of ski boots: one long lateral travelling down the aisle, landing on each one as it's named"],
  ["s14", 20.74, 'store', "In Alabama: the skier tries on a ski boot by the front window; outside blazing sun, the thermometer sign reads 98°F; he sweats"],
  ["s15", 21.50, 'store', "Then a guy at the register holds up a jacket: the register, the cashier; the guy holds the jacket up by its hanger"],
  ["s16", 23.54, 'store', "Hey, this looks just like mine: closer, he squints at the jacket, talking"],
  ["s17", 24.88, 'store', "He checks the pocket: his other hand dips into the jacket pocket"],
  ["s18", 25.92, 'store', "It is mine: he pulls out a card: his own driver's licence (in-world insert, his face + name), then his shocked face"],
  ["s19", 26.85, 'store', "G2 GAG (wordless 1.0 s): the cashier beeps the jacket's price tag, the register display reads $45.00, the drawer pops; his face falls"],
  ["s20", 27.85, 'museum', "You see, this place is called Unclaimed Baggage: crane up the big logo wall UNCLAIMED BAGGAGE over the entrance hall"],
  ["s21", 30.58, 'museum', "and it's been doing this since 1970: the history wall, a framed photo of the first little shop + brass plaque EST. 1970, push in"],
  ["s22", 32.56, 'airport', "Airlines find almost every bag they lose: the carousel; owners happily grab their bags, one hugs his suitcase"],
  ["s23", 34.80, 'airport', "But the few that stay lost for about three months: the cage room, three dusty bags, the wall calendar flips three months, a 90 DAYS tag"],
  ["s24", 37.06, 'airport', "get sold: the warehouse: a pallet of shrink-wrapped suitcases, the airline man and the buyer shake hands, a SOLD tag on the pallet"],
  ["s25", 37.86, 'airport', "and this store buys them without knowing what's inside: TOP-DOWN on the purchase invoice: LOT 4471 / 1,200 BAGS / CONTENTS: ??? / the buyer signs"],
  ["s26", 40.32, 'sort', "Workers open thousands of new items every single day: wide of the big sorting floor: rows of tables, sorters opening bags, a mountain of suitcases, the ITEMS TODAY counter ticking"],
  ["s27", 43.36, 'sort', "Most of it gets washed, priced and put on a shelf: one continuous move: the washing machines spin (washed), the price gun (priced), a sorter puts it on a shelf (shelf)"],
  ["s28", 45.84, 'sort', "Some gets donated: the sorter drops a teddy bear into the big DONATE cart"],
  ["s29", 46.74, 'sort', "And some is just strange: a sorter opens a suitcase, a glow from inside, his eyebrow goes up"],
  ["s30", 47.92, 'museum', "They've found a suit of armor: the museum corner, the suit of armor in its glass case, plaque FOUND IN A SUITCASE"],
  ["s31", 49.04, 'sort', "a live rattlesnake: an open suitcase on the table, the rattlesnake rears up rattling; the sorter jumps back"],
  ["s32", 49.96, 'museum', "and even an ancient Egyptian burial mask: the glass case with the gold burial mask, crane down to its plaque"],
  ["s33", 52.12, 'museum', "G3 GAG (wordless 1.0 s): the armor's visor creaks open and the rattlesnake peeks out of the helmet, rattling"],
  ["s34", 53.12, 'airport', "So next time your suitcase goes missing: back at carousel 4, the traveller waiting alone, the empty belt going round"],
  ["s35", 54.70, 'airport', "don't panic. It's probably fine: the traveller panics (shock), then calms down on 'fine' (relieved smile)"],
  ["s36", 56.58, 'store', "It's just in Alabama… on sale: his blue suitcase on a store shelf; on 'sale' a big SALE tag swings on: $19.99"],
  ["s37", 58.10, 'airport', "END GAG: the flaps part and his blue suitcase finally rolls out, an UNCLAIMED BAGGAGE sticker on it; he grabs the handle and lifts: the lid falls open, EMPTY; a receipt flutters out"],
  ["s38", 59.70, 'airport', "END GAG 2: TOP-DOWN on the receipt landing on the belt: UNCLAIMED BAGGAGE · CONTENTS: SOLD · THANK YOU FOR SHOPPING! (hard cut 60.5)"],
];
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'outside' ? 'warmDay' : 'warmInterior']));
// background lens blur per shot (Ricks: close-ups clearly blurred, wides ~3)
C3_DOF = {};
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null;
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[5.20, 0.8], [13.25, 1.4], [27.35, 0.6], [49.32, 0.6], [52.40, 0.5], [59.24, 0.6]], roll: {} });   // only real impacts kick
C3_SNAP = Object.assign({}, C3_SNAP_DEF, { blur: 8, blurMin: 99 });   // v2: no sub-frame camera blur (it switched on/off mid-shot)
{ const render1 = c3Render;
  c3Render = function (scene, cam, o) { if (C3_DRY) { C3_DRY_CAM = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov }; return; }
  // v4: person cards never take cast shadows (faces stay lit)
    scene.traverse((m) => { if (m.userData.tick) m.userData.tick(TT); if (m.userData.person) m.traverse((c) => { if (c.isMesh) c.receiveShadow = false; }); });
    const CS = colorNow(); c3Renderer().r.toneMappingExposure = CS.exp; c3ColorWorld(CS.world);
    if (!scene.userData.faceSet && CS.face) { scene.userData.faceSet = true; const a = new THREE.AmbientLight(CS.face[0], CS.face[1]); c3Layer(a, C3.L_FOCUS); scene.add(a); }   // v5: a neutral-warm fill on the characters only (faces stay white under coloured set light)
    if (!scene.userData.catchSet && scene.userData.c3shadow) { scene.userData.catchSet = true; scene.traverse((m) => { if (m.userData.c3catch && m.material && m.material.isShadowMaterial) { m.material.opacity = CS.catch[0]; m.material.color.set(CS.catch[1]); } }); }
    const k = C3_SHADOW; if (k) C3_SHADOW = Object.assign({}, k, { catch: CS.catch[0], tint: CS.catch[1] });   // first frame too (the catchers are made inside the render)
    try { return render1(scene, cam, Object.assign({}, o, { grade: 'saturate(1)' })); } finally { C3_SHADOW = k; } };   // v5: no CSS grade on the set (it clipped); colour = the colour script
}
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : DURATION];
function drawShot(i, t) {
  const [id] = SHOT_LIST[i], [a, b] = shotSpan(i), fn = SHOT_FN[id];
  if (!fn) { ctx.save(); screen(); ctx.fillStyle = '#20140e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff'; ctx.font = '700 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText(id + ' — ' + SHOT_LIST[i][3].slice(0, 30), W / 2, H / 2); ctx.restore(); return; }
  const fresh = Array.isArray(SNAPS[id]) && !SNAP_KEYS[id];   // the first frame measures the snap keys with dry runs: draw it again so nothing they posed leaks in
  C3_SHOT = { id, t0: a }; CUR_SHOT = id; try { fn(t, clamp((t - a) / (b - a)), t - a); if (fresh) fn(t, clamp((t - a) / (b - a)), t - a); } finally { CUR_SHOT = null; }
}
// Ricks mixes hard cuts with 4-7 frame moving dissolves (ricks-documentos-camara.md)
const DIS = 5 / FPS, DISSOLVE_IN = new Set(['s16', 's17', 's23', 's35']);
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
  c3Grade((COLOR[SHOT_LIST[shotIndexAt(t)][2]] || COLOR.airport).grade);   // v5: the colour pass (+ barrel), before the captions
  c3Crisp(0.5);
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
const BOARD_T = { s04: 5.45 };   // panel time overrides (s04: after the stamp has lifted off CASE CLOSED)
function buildBoard() { TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  const sn = (Array.isArray(SNAPS[id]) ? SNAPS[id] : []).map((k) => k[0]).filter((k) => k < b - 0.1), last = sn.length ? sn[sn.length - 1] : a;   // the shot's last framing, settled (never mid-snap)
  return { t: BOARD_T[id] ?? Math.min(b - (i + 1 < SHOT_LIST.length && SHOT_LIST[i + 1][2] !== set ? 0.13 : 0.04), Math.max(a + (b - a) * 0.6, last + 0.38)), title: `${i + 1}. ${a.toFixed(2)}s ${words || what.split(':')[0]}`.slice(0, 70), sound: what, next: '' };
});
}   // called from bridges.js (after the set files fill SNAPS)
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

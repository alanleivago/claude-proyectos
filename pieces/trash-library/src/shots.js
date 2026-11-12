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
  street: { exp: 1.0, catch: [0.32, '#1e2a6a'], face: ['#fff0e4', 0.18],   // Ankara at dawn (Ricks ref 2): low orange sun, warm lit walls/ground, cool blue-violet shadows, blue-grey asphalt, blue zenith over a peach band (52.8+ = morning)
    world: { top: '#ffffff', bot: '#fff0de', y: [0, 20], near: '#fff0dc', far: '#e2e4f2', c: [0, 0], r: [20, 160] },
    grade: { expo: 1.45, lift: '#22306a', liftK: 0.2, shadow: '#4a7ae0', hi: '#ffb870', tintK: 0.32, sat: [1.05, 1.3, 1.25], contrast: 1.12, shoulder: [0.76, 0.99],
      top: '#ffe2d0', bot: '#fff0de', fadeK: 0.1, glow: [0.75, 0.3, 0.5, 0.1, '#ffa868'], vig: 0.18, barrel: 0.12 } },
  depot: { exp: 0.98, catch: [0.34, '#1e2450'], face: ['#fff2e4', 0.25],   // break room: teal walls + orange lockers, warm tube light, tea urn steam (v2: Ricks-rich, less milky)
    world: { top: '#a8ccd0', bot: '#fff0dc', y: [0, 30], near: '#fff0dc', far: '#b8c8dc', c: [0, 20], r: [8, 60], ceil: '#90b4c0' },
    grade: { expo: 1.0, lift: '#1a2a66', liftK: 0.1, shadow: '#4a70e0', hi: '#ffb468', tintK: 0.46, sat: [1.15, 1.62, 1.45], contrast: 1.16, shoulder: [0.76, 0.99],
      top: '#d0ecf0', bot: '#fff0de', fadeK: 0.1, glow: [0.5, 0.25, 0.45, 0.07, '#ffc880'], vig: 0.22, barrel: 0.12 } },
  factory: { exp: 1.12, catch: [0.3, '#24204a'], face: ['#fff0dc', 0.28],   // brick factory library: terracotta brick vaults, cool blue skylight shafts, amber reading lamps
    world: { top: '#e2e6ff', bot: '#fff0e0', y: [0, 40], near: '#fff2e0', far: '#d4dcf0', c: [0, 30], r: [10, 80], ceil: '#d4dcff' },
    grade: { expo: 1.36, lift: '#1a2e6a', liftK: 0.24, shadow: '#3a7ae0', hi: '#ffc078', tintK: 0.5, sat: [1.05, 1.3, 1.0], contrast: 1.14, shoulder: [0.76, 0.99],
      top: '#dcd8ff', bot: '#fff0de', fadeK: 0.13, glow: [0.5, 0.2, 0.5, 0.1, '#ffc078'], vig: 0.2, barrel: 0.12 } },
  bay: { exp: 1.0, catch: [0.3, '#1e2e6a'], face: ['#fff4ea', 0.18],   // loading bay in sun: ultramarine roller doors, yellow crates and van
    world: { top: '#ffffff', bot: '#fff2e2', y: [0, 20], near: '#fff4e2', far: '#d4dcee', c: [0, 0], r: [20, 120] },
    grade: { expo: 1.04, lift: '#1a2a5e', liftK: 0.1, shadow: '#4a6ce0', hi: '#ffd49a', tintK: 0.42, sat: [1.15, 1.45, 1.1], contrast: 1.16, shoulder: [0.76, 0.99],
      top: '#e2e8ff', bot: '#fff4e4', fadeK: 0.1, glow: [0.8, 0.3, 0.5, 0.08, '#fff0c8'], vig: 0.18, barrel: 0.12 } },
  village: { exp: 1.05, catch: [0.3, '#22305a'], face: ['#fff2e4', 0.22],   // village classroom: mint-green walls, cream chalk light from tall windows, wooden desks
    world: { top: '#c4e4cc', bot: '#fff4e4', y: [0, 26], near: '#fff4e2', far: '#d0e0d4', c: [0, 15], r: [8, 50], ceil: '#b4d4bc' },
    grade: { expo: 1.08, lift: '#14304a', liftK: 0.1, shadow: '#4a80d8', hi: '#ffd090', tintK: 0.42, sat: [1.15, 1.4, 1.1], contrast: 1.16, shoulder: [0.76, 0.99],
      top: '#e4fff0', bot: '#fff4e4', fadeK: 0.1, glow: [0.7, 0.2, 0.45, 0.08, '#fff0c0'], vig: 0.2, barrel: 0.12 } },
  prison: { exp: 1.05, catch: [0.42, '#142c48'], face: ['#fff0dc', 0.3],   // v2 cell (Ricks prison short HxqtHI62otM): cyan/slate block walls + deep-teal dado, warm key + ONE warm sun shaft, pink/orange accents
    world: { top: '#b4d8e4', bot: '#fff0e2', y: [0, 26], near: '#fff2e2', far: '#a4c4d4', c: [0, 10], r: [6, 40], ceil: '#6a98b0' },
    grade: { expo: 1.1, lift: '#102838', liftK: 0.08, shadow: '#2f68b0', hi: '#ffc078', tintK: 0.5, sat: [1.2, 1.4, 1.2], contrast: 1.2, shoulder: [0.76, 0.99],
      top: '#c8e4f0', bot: '#ffeedd', fadeK: 0.1, glow: [0.6, 0.25, 0.4, 0.1, '#ffc070'], vig: 0.22, barrel: 0.12 } },
};
const setOf = (id) => (SHOT_LIST.find((r) => r[0] === id) || [])[2] || 'street';
const colorNow = () => COLOR[setOf(C3_SHOT && C3_SHOT.id)] || COLOR.street;   // set files fill both (SNAPS[id] = [[t, targets, fill], ...])
// [id, t0, set, what we see] — t0 = the onset of the shot's first word (voice/words.json); G1/G2/G3 = wordless gag beats
const SHOT_LIST = [
  ["s01", 0.00, 'street', "In Ankara, Turkey, one of the best libraries in town was built out of trash: crane DOWN from the dawn sky over Ankara rooftops (minaret, flag) to the orange ÇANKAYA garbage truck; on 'library' a book glints in a bin; on 'trash' bags thump into the hopper"],
  ["s02", 3.60, 'street', "Imagine you're a garbage collector: the hero hops off the truck's back step (camera swings round the truck corner to a low angle)"],
  ["s03", 5.24, 'street', "It's six in the morning, you're grabbing bags off the sidewalk: the street clock at 6:00, then he tosses bags into the hopper (lateral track)"],
  ["s04", 7.74, 'street', "and one of them is weirdly heavy: he pulls one bag and it won't move; strain face, rubber arms stretched (push-in + dutch)"],
  ["s05", 9.38, 'street', 'You open it. Books.: the knot opens, warm light from inside the bag (crane to top-down)'],
  ["s06", 10.52, 'street', 'Good ones. Novels, comics, a whole encyclopedia: he lifts each out on its word: novel, comic, a huge stack of encyclopedia volumes (orbit)'],
  ["g1", 13.70, 'street', "G1 GAG (wordless 1.0 s): the truck's compactor chomps the empty bag right beside him; he hugs the books and leaps away"],
  ["s07", 14.72, 'street', 'Somebody just threw them away, so you put them aside: he looks at the bin, shakes his head, puts the books in a crate in the truck cab'],
  ["s08", 17.06, 'depot', 'Then your coworker finds more, and more: break room; the coworker bursts in with an armload, then a second, bigger armload'],
  ["s09", 19.12, 'depot', 'Soon the break room is stacked to the ceiling: towers of books to the ceiling, the tea urn buried (crane up a tower)'],
  ["s10", 21.02, 'depot', 'and your boss walks in and says: the door opens, the boss steps in'],
  ["s11", 22.54, 'depot', 'Guys, is this a dump or a library?: the boss, deadpan, holds up one book'],
  ["g2", 24.97, 'depot', 'G2 GAG (wordless 1.2 s): the tower he touched leans and avalanches on him; only his hand sticks out, holding a book'],
  ["s12", 26.19, 'factory', "You see, that's exactly what happened: whip into the old brick factory, brick vaults and shelves"],
  ["s13", 27.94, 'factory', 'Garbage collectors in Ankara started saving the books people threw out: collectors carry crates of books through the brick vaults'],
  ["s14", 31.12, 'factory', 'and they piled up so fast the city turned an old brick factory into a real library: crane up the kiln chimney outside, down through a skylight; the LIBRARY sign swings into place'],
  ["s15", 35.92, 'factory', "Shelves, reading tables, a kids' corner: one travel landing on each as it's named"],
  ["s16", 37.98, 'factory', "All of it filled with books somebody decided they didn't need: dolly along the spines; a dented, coffee-ringed book"],
  ["s17", 40.70, 'factory', "It started with a few thousand and grew to tens of thousands: the desk's flip counter 6,000 -> 25,000"],
  ["s18", 43.78, 'factory', "At first it was only for the workers and their families: the hero reads to his daughter on a beanbag; the coworker's family nearby"],
  ["s19", 46.14, 'bay', 'but it got so big they started lending books to schools: loading bay; crates SCHOOL / VILLAGE / PRISON loaded into a yellow van'],
  ["s20", 48.60, 'village', 'villages: a village classroom, the teacher opens a crate, kids lean in'],
  ["s21", 50.30, 'prison', 'and even prisons all over the country: a cell; a book slides through the bars to the tough inmate'],
  ["g3", 52.40, 'prison', 'G3 GAG (wordless 1.0 s): the inmate reads and sobs into the book; his cellmate hands him a tissue'],
  ["s22", 53.42, 'street', 'So next time you throw away an old book: back on the street (morning); a passer-by drops an old book in a bin'],
  ["s23", 55.40, 'street', 'it might not be the end of the story: top-down, the book open on its last page: THE END'],
  ["s24", 57.14, 'street', "In Ankara, it might just be chapter two: the hero's hand fishes it out, crosses out THE END and writes CHAPTER 2"],
  ["s25", 59.00, 'street', 'CLOSING GAG (58.40-61.00): the truck pulls away; its hopper opens: inside a cosy little library, the boss in an armchair reading, he waves (long crane up and back)'],
];
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, ['street', 'bay'].includes(set) ? 'warmDay' : 'warmInterior']));
// background lens blur per shot (Ricks: close-ups clearly blurred, wides ~3)
C3_DOF = {};
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null;
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[3.30, 0.6], [13.95, 1.2], [25.35, 1.4]], roll: {} });   // only real impacts kick
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
// v3 TIME MAP (user: the village classroom went by too fast). voice.wav got +0.6 s of pause after 'villages' (voice/gaps.py),
// the classroom now runs 48.60-50.30 on the video clock, and every set from the prison on keeps its v2 timeline ("story time"):
// story = video - 0.6 from 50.30, and the closing gag (story 58.40-61.00, 2.6 s) is squeezed into video 59.00-61.00
// (the truck pull-away fastest, the gate/boss part ~1.12x). Subtitles and the voice use the video clock (WORDS).
const STORY_T = (t) => t < 50.30 ? t : t < 59.0 ? t - 0.6 : t < 59.35 ? 58.4 + (t - 59.0) * (0.75 / 0.35) : 59.15 + (t - 59.35) * (1.85 / 1.65);
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
const BOARD_T = {};   // panel time overrides
function buildBoard() { TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  const sn = (Array.isArray(SNAPS[id]) ? SNAPS[id] : []).map((k) => k[0]).filter((k) => k < b - 0.1), last = sn.length ? sn[sn.length - 1] : a;   // the shot's last framing, settled (never mid-snap)
  return { t: BOARD_T[id] ?? Math.min(b - (i + 1 < SHOT_LIST.length && SHOT_LIST[i + 1][2] !== set ? 0.13 : 0.04), Math.max(a + (b - a) * 0.6, last + 0.38)), title: `${i + 1}. ${a.toFixed(2)}s ${words || what.split(':')[0]}`.slice(0, 70), sound: what, next: '' };
});
}   // called from bridges.js (after the set files fill SNAPS)
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

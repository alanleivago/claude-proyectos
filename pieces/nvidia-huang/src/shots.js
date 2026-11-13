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
const COLOR = {   // nvidia-huang: Ricks-tuned starting points (trash-library v3 values); each set agent tunes its own entry
  stage: { get exp() { return TT > 30 ? 1.24 : 1.0; }, catch: [0.34, '#1a1e48'], face: ['#fff2e4', 0.26],   // keynote: deep indigo house, huge saturated LED screens (green/teal + magenta accents), warm follow spot on him
    world: { top: '#8a90d8', bot: '#fff0dc', y: [0, 30], near: '#fff0dc', far: '#9aa0d8', c: [0, 20], r: [10, 90], ceil: '#5a60a8' },
    grade: { get expo() { return TT > 30 ? 1.24 : 1.12; }, lift: '#16205e', liftK: 0.12, shadow: '#4a62e0', hi: '#ffbe78', tintK: 0.44, get sat() { return TT > 30 ? [1.12, 1.5, 1.2] : [1.05, 1.25, 1.1]; }, contrast: 1.16, shoulder: [0.76, 0.99],
      top: '#c8d0ff', bot: '#fff0de', fadeK: 0.1, glow: [0.5, 0.3, 0.45, 0.08, '#ffc890'], vig: 0.2, barrel: 0.12 } },
  news: { exp: 1.0, catch: [0.34, '#1e2450'], face: ['#fff2e4', 0.25],   // newsroom: teal walls, red press, warm desk lamps, cream newsprint with gradients (never 255)
    world: { top: '#a8ccd0', bot: '#fff0dc', y: [0, 30], near: '#fff0dc', far: '#b8c8dc', c: [0, 20], r: [8, 60], ceil: '#90b4c0' },
    grade: { expo: 1.1, lift: '#1a2a66', liftK: 0.12, shadow: '#4a70e0', hi: '#ffb468', tintK: 0.44, sat: [1.05, 1.22, 1.15], contrast: 1.14, shoulder: [0.76, 0.99],
      top: '#d0ecf0', bot: '#fff0de', fadeK: 0.1, glow: [0.5, 0.25, 0.45, 0.07, '#ffc880'], vig: 0.2, barrel: 0.12 } },
  hq: { exp: 1.02, catch: [0.32, '#1e2a60'], face: ['#fff2e4', 0.22],   // HQ open-plan: warm wood + green plants, cool daylight through big windows, the glass corner office
    world: { top: '#c8dcf0', bot: '#fff2e2', y: [0, 26], near: '#fff2e2', far: '#c8d4ea', c: [0, 15], r: [10, 70], ceil: '#a8bcd8' },
    grade: { expo: 1.06, lift: '#1a2a62', liftK: 0.12, shadow: '#4a74e0', hi: '#ffc078', tintK: 0.44, sat: [1.1, 1.45, 1.15], contrast: 1.14, shoulder: [0.76, 0.99],
      top: '#e0ecff', bot: '#fff2e2', fadeK: 0.1, glow: [0.6, 0.25, 0.45, 0.07, '#fff0c8'], vig: 0.2, barrel: 0.12 } },
  board: { exp: 1.0, catch: [0.34, '#22204a'], face: ['#fff0dc', 0.26],   // boardroom: walnut + oxblood leather, tall windows with a blue city, amber pendant lights
    world: { top: '#c8bce0', bot: '#fff0e0', y: [0, 30], near: '#fff2e0', far: '#d0c8e0', c: [0, 15], r: [8, 60], ceil: '#a8a0cc' },
    grade: { expo: 1.04, lift: '#26327a', liftK: 0.22, shadow: '#4a6ae0', hi: '#ffb868', tintK: 0.44, sat: [0.95, 1.4, 1.1], contrast: 1.14, shoulder: [0.74, 0.97],
      top: '#dcd8ff', bot: '#fff0de', fadeK: 0.1, glow: [0.5, 0.2, 0.5, 0.08, '#ffc078'], vig: 0.2, barrel: 0.12 } },
  trade: { exp: 1.08, catch: [0.32, '#1a2458'], face: ['#fff2e4', 0.28],   // trading floor: cobalt blue room, red/green screens, LED ticker band, warm desk pools
    world: { top: '#b0c8f4', bot: '#fff0dc', y: [0, 30], near: '#fff0dc', far: '#c0d0f0', c: [0, 20], r: [10, 80], ceil: '#94acdc' },
    grade: { expo: 1.22, lift: '#1a2a6e', liftK: 0.16, shadow: '#3a64e0', hi: '#ffb870', tintK: 0.44, sat: [1.12, 1.5, 1.2], contrast: 1.16, shoulder: [0.74, 0.97],
      top: '#c8d8ff', bot: '#fff0de', fadeK: 0.1, glow: [0.5, 0.3, 0.45, 0.08, '#ffc080'], vig: 0.2, barrel: 0.12 } },
};
const setOf = (id) => (SHOT_LIST.find((r) => r[0] === id) || [])[2] || 'stage';
const colorNow = () => COLOR[setOf(C3_SHOT && C3_SHOT.id)] || COLOR.stage;   // set files fill both (SNAPS[id] = [[t, targets, fill], ...])
// [id, t0, set, what we see] — t0 = the onset of the shot's first word (voice/words.json); G1/G2/G3 = wordless gag beats
const SHOT_LIST = [   // t0 = voice/words.json onsets (tempo 1.0, 2026-11-13); beat table = shots.md
  ["s01", 0.00, 'stage', "Imagine you're Jensen Huang: the giant chip rises behind him; Huang in the leather jacket spreads his arms to the cheering crowd (crane DOWN from the LED screens)"],
  ["s02", 1.36, 'stage', "and in just two weeks you go from running the company behind the AI boom to handing in your resignation: 14-day calendar on the screens on 'two weeks'; charts + chips burst on 'AI boom'; spotlight narrows on 'resignation', he holds up one sheet"],
  ["s03", 5.86, 'stage', "You co-founded Nvidia, and you've worn the same leather jacket on stage for years: screen 'NVIDIA · 1993' over a first chip; the jacket shines on 'jacket'; keynote snapshots in the same jacket flick by"],
  ["s04", 9.78, 'stage', "Then, in late October: a calendar leaf 'OCT' tears off and flies (whip right into the newsroom)"],
  ["s05", 11.12, 'news', "the New York Times reports that you're close to a businesswoman named Alice Huang: the press rolls out a paper; headline text only"],
  ["s06", 14.98, 'news', "No relation.: a red stamp slams NO RELATION on the paper"],
  ["s07", 15.82, 'news', "She helped set up Megaspeed, a Singapore company that buys billions in your chips: map pin Singapore -> MEGASPEED sign -> chip crates + cash"],
  ["s08", 19.64, 'news', "And the Times goes further... recruited by China's spy agency: second edition, headline with 'TIMES SAYS' + 'NYT · OCT 29' chip"],
  ["s09", 24.98, 'news', "China calls that a smear, and nobody has been charged: wall TV with an empty podium + quote card 'A SMEAR'; board 'CHARGES FILED: 0'"],
  ["s10", 27.28, 'hq', "So on a Sunday in November, you email your whole company: 'I was unfaithful to my wife.': wall calendar SUN · NOV 8; Huang alone in the glass office typing; monitor shows the line + 'To: All employees'"],
  ["g1", 32.00, 'hq', "G1 GAG (wordless 0.9 s): he presses SEND; every phone on the floor buzzes at once and the whole floor turns to stare at the glass office"],
  ["s11", 32.94, 'hq', "You don't say who.: still stared at, he quietly lowers the blinds"],
  ["s12", 33.46, 'board', "Your board opens an investigation the same day: board members slap a thick folder INDEPENDENT INVESTIGATION on the long table"],
  ["s13", 35.82, 'trade', "On Monday your stock slides about five percent: ticker 'MON · NVDA ▼ ~5%'; traders gasp, one drops his coffee"],
  ["s14", 37.86, 'trade', "and the president says the FBI is looking into it: wall TV, empty presidential-style podium (generic seal) + quote card"],
  ["s15", 40.38, 'trade', "On Wednesday the Times reports a second relationship, with an executive who reports to you: headline crawl + org-chart card with an arrow up to CEO"],
  ["s16", 44.74, 'trade', "On Thursday Reuters reports another one: crawl 'THU · REUTERS: ANOTHER ONE'; a +1 counter ticks"],
  ["s17", 46.64, 'trade', "Your intern stares at the chart and says, 'Boss, is that a graph or a ski slope?': the intern in front of the plunging wall chart, deadpan"],
  ["g2", 50.30, 'trade', "G2 GAG (wordless 0.9 s): the intern grabs skis, slaloms down the falling chart line and flies out of the window"],
  ["s18", 51.28, 'trade', "You see, when one man is the face of a company this big, investors are buying him along with the chips: a giant cardboard cutout of Huang's face rides in a shopping cart next to a box of chips, one price tag 'CHIPS + JENSEN'"],
  ["s19", 55.58, 'board', "That same day, Nvidia files a notice: a one-page filing slides into the tray: 'has resigned ... effective immediately'"],
  ["s20", 57.72, 'board', "It's official.: a stamp lands: FILED"],
  ["s21", 58.46, 'stage', "Thirty-three years, and the end took two weeks: the empty stage (house lights half on): one screen flickers '1993 -> 2026', then the 14-day calendar, then goes dark"],
  ["s22", 60.56, 'stage', "CLOSING GAG (60.56-62.80): the spotlight finds the leather jacket hanging alone on the mic stand; the janitor tries it on, checks his reflection in a dark screen, and quietly hangs it back up"],
];
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id]) => [id, 'warmInterior']));
// background lens blur per shot (Ricks: close-ups clearly blurred, wides ~3)
C3_DOF = {};
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null;
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[15.28, 0.9], [32.06, 0.7], [34.26, 1.0], [57.80, 0.9]], roll: {} });   // only real impacts kick (NO RELATION stamp, SEND, folder slap, FILED)
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
const STORY_T = (t) => t;   // one clock (kept for the shared drawShot)
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
  c3Grade((COLOR[SHOT_LIST[shotIndexAt(t)][2]] || COLOR.stage).grade);   // v5: the colour pass (+ barrel), before the captions
  c3Crisp(0.5);
  { const sy = C3.subY; if (t >= 15.8 && t < 17.1) C3.subY = 0.5;   // rev4: Alice's name card sits in the caption band: caption goes above it
    else if ([[12.4, 14.5], [19.3, 20.5], [39.0, 40.7], [43.7, 44.5], [56.2, 58.4]].some(([a, b]) => t >= a && t < b)) C3.subY = 0.86;   // v1 review: the caption covered the quote card / org-chart arrow / 8-K text: drop it lower there
    try { c3Subtitle(WORDS, t); } finally { C3.subY = sy; } }
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

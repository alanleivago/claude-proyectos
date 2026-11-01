// =====================================================================
//  SHOTS — the 32 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };   // Ricks exposure + contrast (kit c3Look, measured on 24 Ricks frames)
C3_VIVID = C3_VIVID_DEF;   // VIVID finish (kit): no milky veil, Ricks saturation/clarity
C3_INK2 = C3_INK2_DEF; C3_SHADOW = C3_SHADOW_DEF;   // Ricks marker outlines on every edge + real cast shadows (kit, 2026-10-29)
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the trimmed voice (voice/words.json)
const SHOT_LIST = [
  ["s00", 0.00, 'hall', "Imagine an auction: the buyers in the tiers, you at your desk in the middle, everyone staring up at something"],
  ["s01", 0.82, 'hall', "where the price only goes down: the giant price clock, the lit dot running DOWN the ring, the price digits falling; pull back"],
  ["s02", 2.58, 'hall', "and that's what makes it terrifying: you at your desk in the tiers, gulping, sweat drop"],
  ["s03", 4.42, 'out', "You're a flower buyer in the Netherlands: aerial over flat tulip-stripe fields, a windmill, a canal, the huge hall on the horizon"],
  ["s04", 6.14, 'out', "sitting in one of the biggest buildings on the planet: long take, the camera glides over the endless roof, tiny trucks along it"],
  ["s05", 8.20, 'hall', "with your finger on a single button: insert, your fist hovering over the one big red button on your console"],
  ["s06", 10.00, 'hall', "On the wall, there's a giant clock: wide, the amphitheatre of buyers facing the clock wall"],
  ["s07", 12.20, 'hall', "But it doesn't tell time. It tells price: the clock face, hands spin away, the numbers flip to prices"],
  ["s08", 14.46, 'hall', "A cart full of red roses rolls in: a trolley of rose buckets rolls in under the clock, the roses photo lights up"],
  ["s09", 16.48, 'hall', "and the clock starts high: the dot at the top of the ring, price 100 blazing"],
  ["s10", 17.56, 'hall', "Way too high. So you wait: you scoff, cross your arms, lean back"],
  ["s11", 19.06, 'hall', "The pointer drops: the dot jumps down the ring, price drops"],
  ["s12", 20.02, 'hall', "Then it drops again: long take from s11, the dot drops again"],
  ["s13", 21.02, 'hall', "Now it's a pretty good deal: you sit up, starstruck, sparkles"],
  ["s14", 22.24, 'hall', "Your finger twitches: insert, your fist trembling over the button, sweat drop lands on the console"],
  ["s15", 23.22, 'hall', "But if you wait one more second, it'll be even cheaper: thought cloud, a mountain of roses with a 1 cent tag (Flow photo)"],
  ["s16", 25.48, 'hall', "So you wait: eyes closed, smug grin, fist hovering"],
  ["s17", 26.18, 'hall', "Click: across the hall the rival's fist slams his button, CLICK burst"],
  ["s18", 26.66, 'hall', "Somebody else pressed it: the clock freezes, SOLD + the rival's buyer number"],
  ["s19", 27.70, 'hall', "The roses are gone: the rose trolley rolls away out of the hall"],
  ["s20", 28.92, 'hall', "and the guy next to you leans over: the tweed neighbour leans in"],
  ["s21", 30.74, 'hall', "Nice strategy. Very cheap. For him: long take from s20, push in; the neighbour smug, you deflated; the rival waves a rose behind"],
  ["s22", 33.10, 'hall', "You see, this is called a Dutch auction: the clock wall with a DUTCH AUCTION plaque, tulips pop around it"],
  ["s23", 35.04, 'classic', "Instead of people shouting higher and higher: an old-school auction room, bidders raising paddles and shouting, UP arrows climbing"],
  ["s24", 37.16, 'hall', "the price falls until the first person brave enough presses the button: a DOWN arrow on the clock, a determined buyer slams the button"],
  ["s25", 40.20, 'hall', "Nobody gets a second chance: you slam your button too late, a SOLD stamp lands on your screen"],
  ["s26", 41.84, 'hall', "That one rule forces everyone to show how badly they really want something, in a split second: long take along a row of buyers, all leaning in, fists over buttons"],
  ["s27", 46.68, 'floor', "And because one click sells a whole batch: CLICK, and a whole train of trolleys lurches off"],
  ["s28", 48.68, 'floor', "they can sell millions of flowers every single day: the vast distribution hall, trolley trains criss-crossing, a MILLIONS A DAY counter"],
  ["s29", 51.08, 'out', "so fast that a rose cut in the morning: a greenhouse at sunrise, the grower snips a rose"],
  ["s30", 52.98, 'world', "can be in a shop on another continent a day or two later: a world map, a cargo plane carries a rose box across the ocean to a little shop, the calendar flips"],
  ["s31", 55.66, 'date', "So the roses you buy for a date: a cosy cafe, the date hands his date a bouquet"],
  ["s32", 57.32, 'hall', "were probably won by someone who refused to be greedy: the rival calmly presses his button, a little halo"],
  ["s33", 59.62, 'hall', "for exactly one second: the clock dot ticks one notch, freeze, 1 SECOND"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'out' || set === 'world' ? 'dayExterior' : 'warmInterior']));
const DISSOLVE = 6 / FPS;
// ---- Ricks framing (styles/cartoon3d/FRAMING.md): wider shots + a few long takes ----
// SHOT_WIDEN pulls each shot's camera back along its own view line (c3SetCam p→l distance x k), so faces that
// filled the frame become medium/full-body like Ricks. CONTINUOUS[id] = the shot it flows out of: no dissolve,
// the camera glides from that shot's pose at the boundary into this shot's pose over CONT_BLEND (plano secuencia).
const SHOT_WIDEN = { s04: 1.0, s03: 1.0, s06: 1.0, s08: 1.0, s19: 1.0, s24: 1.0, s26: 1.3, s00: 1.5, s02: 2.0, s10: 2.0, s13: 2.0, s15: 1.6, s16: 2.0, s17: 1.9, s20: 1.8, s21: 1.9, s25: 1.9, s32: 1.9, s31: 1.6, s29: 1.5, s27: 1.3, s23: 1.2 };   // Ricks: head ~10-15 % of the frame
const CONTINUOUS = { s04: 's03', s08: 's07', s10: 's09', s12: 's11', s14: 's13', s16: 's15', s18: 's17', s21: 's20', s28: 's27', s33: 's32' };   // ~23 cuts/min
const CONT_BLEND = 0.55;
// far aerials and the big floor: thinner ink and a much higher depth threshold, so far flat roofs/shelves don't turn into black stripes
const SHOT_INK = { s03: null, s04: null,   // the aerial: no screen-space ink at all (grazing far roofs alias into stripes); the props keep their mesh ink
  s28: { px: 2.4, depth: 0.05, normal: 0.45 }, s27: { px: 3.0, depth: 0.03 } };
const SHOT_INSERT = { s01: 1, s05: 1, s07: 1, s09: 1, s11: 1, s12: 1, s14: 1, s18: 1, s22: 1, s30: 1, s33: 1 };   // the clock, the button, the map: framed on purpose
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null, CONT_A = null, CONT_ID = null;
{ const setCam0 = c3SetCam;
  c3SetCam = function (cam, c) { const k = !CUR_SHOT || SHOT_INSERT[CUR_SHOT] ? 1 : SHOT_WIDEN[CUR_SHOT] || 1.22;   // everything else wider too (Ricks head median ~10 % of frame height)
    if (k === 1) return setCam0(cam, c);
    const p = c.p.map((v, j) => c.l[j] + (v - c.l[j]) * k); return setCam0(cam, Object.assign({}, c, { p })); };
  const render1 = c3Render;
  // near-lens cull: a static set piece (shelf, display, sign) the camera glides through is hidden for those frames
  // instead of filling the screen (never the blurred foreground layer, never rooms/floors bigger than 20 units)
  const render0 = function (scene, cam, o) {
    const hid = [], pc = cam.position, bb = new THREE.Box3();
    scene.children.forEach((c) => {
      if (!c.visible || c.isLight || (c.layers.mask & (1 << C3.L_NEAR))) return;
      if (!c.userData.c3bb) { c.updateMatrixWorld(true); c.userData.c3bb = bb.setFromObject(c).clone(); c.userData.c3r = c.userData.c3bb.getSize(new THREE.Vector3()).length() / 2;
        let spr = false; c.traverse((m) => { if (m.isMesh && m.material && m.material.transparent && m.material.map) spr = true; }); c.userData.c3moving = spr; }
      if (c.userData.c3moving || c.userData.c3r > 20 || c.userData.c3r < 0.05) return;   // people/props that move keep their own staging
      if (c.userData.c3bb.distanceToPoint(pc) < (c.userData.c3r < 3 ? 4.5 : 1.2)) { c.visible = false; hid.push(c); }   // small racks: a wider berth
    });
    render1(scene, cam, o); hid.forEach((c) => { c.visible = true; });
  };
  c3Render = function (scene, cam, o) {
    if (C3_DRY) { C3_DRY_CAM = { p: cam.position.clone(), q: cam.quaternion.clone(), fov: cam.fov }; return; }
    const A = CONT_A;
    if (A && CUR_SHOT === CONT_ID) {   // glide from the previous shot's camera at the boundary (pose captured in drawShot)
      const a = SHOT_LIST[shotIndexAt(TT)][1];
      { const e = EZ.io((TT - a) / CONT_BLEND), P = cam.position.clone(), Q = cam.quaternion.clone(), F = cam.fov;
        cam.position.lerpVectors(A.p, P, e); cam.quaternion.copy(A.q).slerp(Q, e); cam.fov = A.fov + (F - A.fov) * e; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
        render0(scene, cam, o); cam.position.copy(P); cam.quaternion.copy(Q); cam.fov = F; cam.updateProjectionMatrix(); return; } }
    return render0(scene, cam, o); };
}
// the previous shot's camera pose at time a: run its shot function dry (no render) and read the camera it set
function contCamAt(i, a) {
  const [id] = SHOT_LIST[i], [a0, b0] = shotSpan(i), fn = SHOT_FN[id]; if (!fn) return null;
  const keep = CUR_SHOT; CUR_SHOT = id; C3_DRY = true; C3_DRY_CAM = null;
  try { fn(a, clamp((a - a0) / (b0 - a0)), a - a0); } finally { C3_DRY = false; CUR_SHOT = keep; }
  return C3_DRY_CAM;
}
const shotIndexAt = (t) => { let i = 0; while (i + 1 < SHOT_LIST.length && t >= SHOT_LIST[i + 1][1] - 1e-6) i++; return i; };
const shotSpan = (i) => [SHOT_LIST[i][1], i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][1] : DURATION];
// a set file's camera keys use shot-local seconds (0 = shot start); they run on through the dissolve
const SHOT_T = {};
function drawShot(i, t) {
  const [id] = SHOT_LIST[i], [a, b] = shotSpan(i), fn = SHOT_FN[id];
  if (!fn) { ctx.save(); screen(); ctx.fillStyle = '#20140e'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff'; ctx.font = '700 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText(id + ' — ' + SHOT_LIST[i][3].slice(0, 30), W / 2, H / 2); ctx.restore(); return; }
  // long take: read the previous shot's camera at the boundary BEFORE this shot sets up the shared world
  CONT_A = CONTINUOUS[id] && t < a + CONT_BLEND ? contCamAt(i - 1, a) : null; CONT_ID = id;
  const ink0 = C3_INK2; if (C3_INK2 && id in SHOT_INK) C3_INK2 = SHOT_INK[id] && Object.assign({}, C3_INK2, SHOT_INK[id]);
  CUR_SHOT = id; try { fn(t, clamp((t - a) / (b - a)), t - a); } finally { C3_INK2 = ink0; } CUR_SHOT = null; CONT_A = null;
  c3Look(SHOT_LOOK[id]);
}
const SHOT_LAYER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
function sceneApple() {
  const t = TT, i = shotIndexAt(t), [a] = shotSpan(i);
  if (i > 0 && t < a + DISSOLVE && !CONTINUOUS[SHOT_LIST[i][0]]) {   // dissolve: the outgoing shot keeps moving under the incoming one (not inside a long take)
    drawShot(i - 1, t);
    const lx = SHOT_LAYER.getContext('2d'); lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0);
    drawShot(i, t);
    ctx.save(); screen(); ctx.globalAlpha = 1 - EZ.io((t - a) / DISSOLVE); ctx.drawImage(SHOT_LAYER, 0, 0); ctx.restore();
  } else drawShot(i, t);
  c3Crisp(0.6); c3Vignette(0.2); c3Grain(0.02);
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

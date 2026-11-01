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
  ["s01", 0.00, 'world', "Sweden once gave its phone number to the entire planet: the globe, Sweden lights up and a giant phone number banner unrolls around the Earth"],
  ["s02", 2.68, 'nope', "Not a call center: rows of headset operators, a big red X stamps over it"],
  ["s03", 3.62, 'nope', "Not a tourist office: brochure counter with TOURIST INFO sign, red X stamps"],
  ["s04", 4.98, 'north', "Just... Sweden: red wooden cottages, pines, snowy hills, a flag, a moose (wide establishing)"],
  ["s05", 6.18, 'home', "You dial it from your couch, it rings: you on the couch dialling, the phone rings"],
  ["s06", 7.70, 'north', "and somewhere up north: camera flies over the snowy north to a little red cottage"],
  ["s07", 8.62, 'north', "a random person picks up: phones ringing in cottages, someone grabs one"],
  ["s08", 10.10, 'north', "A farmer: farmer in overalls with a cow, phone to his ear"],
  ["s09", 10.74, 'north', "A student: student in a parka with a bike and books"],
  ["s10", 11.50, 'stuga', "A guy literally in the middle of eating meatballs: kitchen, fork mid-air, cheeks full"],
  ["s11", 13.78, 'home', "And you can ask them anything: you on the couch, excited, question marks pop"],
  ["s12", 15.32, 'stuga', "Why are you all so tall?: the meatball guy stands up and keeps rising, his head bumps the lamp"],
  ["s13", 16.64, 'stuga', "Do you really eat dinner at five?: the kitchen clock at 5:00 over the plate of meatballs"],
  ["s14", 18.34, 'stuga', "Is it actually dark all winter?: the window, dark snowy night at 3 PM, street lamps"],
  ["s15", 20.26, 'stuga', "Then the guy on the other end chews, swallows, and says,"],
  ["s16", 22.78, 'stuga', "Wait. Who gave you this number?: suspicious squint, push in"],
  ["s17", 24.60, 'hq', "You see, this was the Swedish Number: the campaign poster with the number"],
  ["s18", 26.24, 'hq', "A Swedish tourism group set it up: the exec in the meeting room presenting"],
  ["s19", 28.56, 'hq', "to celebrate 250 years: a cake with 250 on it, confetti"],
  ["s20", 30.32, 'hq', "since Sweden became one of the first countries to get rid of censorship: the 1766 decree, the CENSORED stamp breaks"],
  ["s21", 33.76, 'hq', "So instead of an ad with actors and a script: an ad storyboard with actors and a script, crossed out"],
  ["s22", 35.92, 'hq', "they let any Swede who downloaded an app: the app on a phone"],
  ["s23", 38.18, 'north', "become the voice of the whole country: Swedes everywhere holding up phones, aerial"],
  ["s24", 40.18, 'hq', "No training: the training manual dropped in the bin"],
  ["s25", 41.02, 'hq', "No rules about what to say: the rulebook follows into the bin"],
  ["s26", 42.78, 'hq', "And that's the risky part: the exec sweating, nervous grin"],
  ["s27", 44.08, 'north', "One call could get you a poet: a poet in a beret reciting by the frozen lake"],
  ["s28", 45.58, 'stuga', "the next could get you someone who just woke up: bed alcove, pajamas, nightcap, groggy"],
  ["s29", 48.04, 'world', "But people loved it: hearts pop around the globe"],
  ["s30", 49.38, 'world', "first couple of months, close to 200,000 calls from almost every country: call arcs from everywhere to Sweden, counter climbs"],
  ["s31", 54.22, 'world', "Which means a lot of the world's first impression of Sweden: the globe turns, a postcard of Sweden"],
  ["s32", 57.54, 'stuga', "came from someone in pajamas who just wanted to finish their meatballs: the pajama Swede on the phone, meatballs, loops"],
];
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'world' || set === 'north' ? 'dayExterior' : 'warmInterior']));
const DISSOLVE = 6 / FPS;
// ---- Ricks framing (styles/cartoon3d/FRAMING.md): wider shots + a few long takes ----
// SHOT_WIDEN pulls each shot's camera back along its own view line (c3SetCam p→l distance x k), so faces that
// filled the frame become medium/full-body like Ricks. CONTINUOUS[id] = the shot it flows out of: no dissolve,
// the camera glides from that shot's pose at the boundary into this shot's pose over CONT_BLEND (plano secuencia).
const SHOT_WIDEN = { s07: 1.0, s23: 1.0, s05: 1.3, s10: 1.4, s11: 1.5, s12: 1.3, s15: 1.5, s16: 1.6, s18: 1.4, s26: 1.1, s28: 1.4, s32: 1.4 };
const CONTINUOUS = { s03: 's02', s07: 's06', s14: 's13', s16: 's15', s25: 's24', s30: 's29' };
const CONT_BLEND = 0.55;
const SHOT_INSERT = { s01: 1, s13: 1, s17: 1, s18: 1, s19: 1, s20: 1, s22: 1, s29: 1, s30: 1, s31: 1 };   // globe, clock, poster, cake, decree, app: framed on purpose
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
  CUR_SHOT = id; fn(t, clamp((t - a) / (b - a)), t - a); CUR_SHOT = null; CONT_A = null;
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

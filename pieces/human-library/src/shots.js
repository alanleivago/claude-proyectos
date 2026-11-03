// =====================================================================
//  SHOTS — the 32 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };   // Ricks exposure + contrast (kit c3Look, measured on 24 Ricks frames)
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.18, s: 1.12, vib: 0.4 });   // user: saturation median ~0.58-0.62   // mromidev grade, saturation lifted a touch (user 2026-11-01: median ~0.55-0.58) (user 2026-11-01): HSV S median ~0.49, luma ~0.55, no crushed blacks; NO grain
C3_INK2 = C3_INK2_DEF; C3_SHADOW = C3_SHADOW_DEF;   // Ricks marker outlines on every edge + real cast shadows (kit, 2026-10-29)
// sunlit exteriors: the same mromidev grade with less exposure lift (1.32 blew the paving and sky to white)
const C3_VIVID_STREET = Object.assign({}, C3_VIVID_MRO, { b: 0.98, c: 1.08, s: 1.2, vib: 0.55 });   // + the same saturation lift; contrast so they don't read pale next to the interiors
const SHOT_FN = {};
// [id, t0, set file, what we see] — t0 from the voice (take 17, voice/words.json). Story + shot plan = the approved
// mromidev test (app/ storyboard v2); its three in-shot cuts are shots of their own here (s07, s14, s19).
const SHOT_LIST = [
  ["s01", 0.00, 'street', "There's a library where you don't borrow books: the Human Library facade at the end of the street, people walk in, nobody carries a book"],
  ["s02", 1.88, 'room', "You borrow people: (white flash) the reading room, every table a reader + a person under a title card"],
  ["s03", 2.85, 'room', "You walk up to the desk, and the librarian hands you a catalog: you walk in, she slides the catalog over"],
  ["s04", 5.70, 'room', "But instead of titles like 'Cooking for Beginners', it says Refugee, Former Prisoner, Police Officer, Covered in Tattoos: the catalog insert, entries pop, the cookbook gets crossed out"],
  ["s05", 12.40, 'room', "You pick one, just to be bold. 'Former Prisoner, please.': you at the desk, nervous, then brave"],
  ["s06", 15.62, 'room', "The librarian stamps your card: STAMP, 30 MIN"],
  ["s07", 17.48, 'room', "and says, 'Thirty minutes. Please return him in the same condition.': the librarian, deadpan"],
  ["s08", 20.10, 'room', "And then an actual man walks over and sits down across from you: tracking him down the aisle"],
  ["s09", 23.70, 'room', "Now it's awkward. You've got a hundred questions and you're scared to ask a single one: two-shot, question marks"],
  ["s10", 27.80, 'room', "But that's the whole point. He's the book, and you're allowed to ask him anything: him, THE BOOK card"],
  ["s11", 31.14, 'room', "Then the lady at the next table leans over, holding her own borrowed book, a firefighter: glide to the next table"],
  ["s12", 36.20, 'room', "'Mine's way more interesting than yours, by the way.': the lady, smug"],
  ["s13", 38.75, 'street', "You see, this started in Denmark, and it's called: aerial over the Copenhagen canal town, the library"],
  ["s14", 41.30, 'street', "the Human Library: the HUMAN LIBRARY banner over the door"],
  ["s15", 42.08, 'street', "The books are real volunteers, usually people others judge from far away: telephoto across the canal, volunteers under title cards"],
  ["s16", 47.00, 'room', "and the rules are simple. You sit down, you ask, they answer, honestly: one table, '?' then '...'"],
  ["s17", 50.05, 'room', "Because it's really easy to judge a whole group of people... and really hard to judge the one sitting right in front of you: wide over every table, then down to you and him, the titles pop away"],
  ["s18", 55.66, 'room', "Now it runs in dozens of countries: the desk globe, pins pop"],
  ["s19", 57.85, 'room', "and its motto says it all: the librarian"],
  ["s20", 58.85, 'room', "Don't judge a book by its cover... just borrow it: you and him at the desk, BORROWED"],
];
// mromidev camera grammar (kit C3_CAMFX, refs-ext/claude-animated-shorts): every hold creeps in, punch words push harder,
// 4-5 deg tilts on emphasis, 7-frame impact shakes; background lens blur per shot (C3_DOF, CU 7 / MS 5 / wides 0)
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, {
  punch: [6.8, 8.4, 9.26, 10.52, 11.38, 13.58, 25.24, 29.56, 36.26, 41.36, 45.88, 54.48, 56.34, 60.7],
  kicks: [[16.2, 1.1], [25.24, 0.4], [60.7, 0.9]],
  roll: { s05: 4, s07: -4, s12: -4.5, s20: 4 } });
C3_DOF = { s01: 0, s02: 0, s03: 4, s04: 0, s05: 7, s06: 5, s07: 7, s08: 0, s09: 5, s10: 7, s11: 5, s12: 7, s13: 0, s14: 0, s15: 3, s16: 5, s17: 3, s18: 7, s19: 6, s20: 5 };
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'street' ? 'dayExterior' : 'warmInterior']));
const DISSOLVE = 6 / FPS;
// ---- Ricks framing (styles/cartoon3d/FRAMING.md): wider shots + a few long takes ----
// SHOT_WIDEN pulls each shot's camera back along its own view line (c3SetCam p→l distance x k), so faces that
// filled the frame become medium/full-body like Ricks. CONTINUOUS[id] = the shot it flows out of: no dissolve,
// the camera glides from that shot's pose at the boundary into this shot's pose over CONT_BLEND (plano secuencia).
// framing is set per shot in the set files (ported from the approved test), so no extra widening here
const SHOT_WIDEN = {};
const CONTINUOUS = { s07: 's06', s10: 's09', s12: 's11' };   // (s20 dissolves: the s19 glide swept your head past the lens)   // long takes: the camera glides on, no dissolve
const CONT_BLEND = 0.55;
const SHOT_INK = { s13: { px: 2.4, depth: 0.05, normal: 0.45 } };   // the aerial: thinner ink so far roofs don't alias into stripes
const SHOT_INSERT = { s04: 1, s18: 1 };
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null, CONT_A = null, CONT_ID = null;
{ const setCam0 = c3SetCam;
  c3SetCam = function (cam, c) { const k = !CUR_SHOT || SHOT_INSERT[CUR_SHOT] ? 1 : SHOT_WIDEN[CUR_SHOT] || 1;   // everything else wider too (Ricks head median ~10 % of frame height)
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
  const viv0 = C3_VIVID; if (SHOT_LIST[i][2] === 'street') C3_VIVID = C3_VIVID_STREET;
  C3_SHOT = { id, t0: a }; CUR_SHOT = id; try { fn(t, clamp((t - a) / (b - a)), t - a); } finally { C3_INK2 = ink0; } CUR_SHOT = null; CONT_A = null;
  c3Look(SHOT_LOOK[id]); C3_VIVID = viv0;
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
  c3Crisp(0.6); c3Vignette(0.2);   // no grain (Ricks / mromidev measure none)
  { const fl = t - 1.88; if (fl >= 0 && fl < 3 / FPS) { ctx.save(); screen(); ctx.globalAlpha = [0.45, 0.2, 0.08][Math.floor(fl * FPS)]; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the hook flash (test)
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

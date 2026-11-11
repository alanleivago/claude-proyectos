// =====================================================================
//  SHOTS — the 26 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
//  of the next clause (cartoon3d rule). Every set file registers its shots in SHOT_FN[id] = (t, u) => { ... }:
//  it renders the full frame for absolute time t (u = 0..1 progress through its own shot) with c3Render and
//  draws nothing else; vignette, grain and the one-word subtitle are added here, once, on top.
// =====================================================================
C3_HD = true;   // HD finish (kit c3Look + c3Crisp): sharper, cleaner whites, like the refs
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };   // Ricks exposure + contrast (kit c3Look, measured on 24 Ricks frames)
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.18, s: 1.12, vib: 0.4 });   // user: saturation median ~0.58-0.62   // mromidev grade, saturation lifted a touch (user 2026-11-01: median ~0.55-0.58) (user 2026-11-01): HSV S median ~0.49, luma ~0.55, no crushed blacks; NO grain
C3_INK2 = C3_INK2_DEF; C3_SHADOW = Object.assign({}, C3_SHADOW_DEF, { catch: 0.6, tint: '#1e1c5a', key: 0.8 });   // mromidev: warm light, cool blue-violet shadows   // darker cast shadows (user: sets need shadows like the mromidev test)   // Ricks marker outlines on every edge + real cast shadows (kit, 2026-10-29)
// sunlit exteriors: the same mromidev grade with less exposure lift (1.32 blew the paving and sky to white)
const C3_VIVID_STREET = Object.assign({}, C3_VIVID_MRO, { b: 0.98, c: 1.08, s: 1.2, vib: 0.55 });   // + the same saturation lift; contrast so they don't read pale next to the interiors
const SHOT_FN = {};
// ALT_BOOM (alternate cut, user 2026-11-02): after the voice the tag is the facade outside, then everything explodes and
// the film cuts dead mid-blast at 61.0 s. tools: set true, build, export -> renders/final_boom.mp4, set back to false.
const ALT_BOOM = false;
// SNAP_TEST (2026-11-03): the ref-6WTahOqdEl4 camera (kit C3_SNAP): holds + 5-frame snaps, crash zooms on punch words,
// motion blur, hard cuts, whip pans at place changes. Export -> renders/video_only_snap.mp4.
const SNAP_TEST = false;
// [id, t0, set file, what we see] — t0 from the voice (take 13 tightened, voice/words.json); one clause per shot
const SHOT_LIST = [
  ["s01", 0.00, 'street', "You walk into a little restaurant in Tokyo: a lantern-lit alley at dusk, you push through the noren of a tiny wooden restaurant"],
  ["s02", 1.94, 'rest', "and order a burger: you at your table, the old waitress with her notepad, a burger photo in your thought cloud"],
  ["s03", 3.02, 'rest', "The waitress smiles, writes it down: her smile, the pencil scribbling on the pad"],
  ["s04", 5.28, 'rest', "and ten minutes later: the wall clock's minute hand sweeps ten minutes"],
  ["s05", 6.26, 'rest', "she puts a plate of dumplings in front of you: the plate lands on your table, steam"],
  ["s06", 8.42, 'rest', "You look up to complain: finger up, mouth open"],
  ["s07", 9.58, 'rest', "Then you see the sign on the wall: the camera follows your look to WE MIGHT GET YOUR ORDER WRONG"],
  ["s08", 12.96, 'rest', "The guy at the next table ordered coffee: the coffee guy, a coffee photo in his thought cloud"],
  ["s09", 15.04, 'rest', "He got two straws, a spoon, and no coffee: straw, straw, spoon land on his table, an empty saucer"],
  ["s10", 17.46, 'rest', "And he's laughing. So is everyone: he laughs, then the whole room laughs"],
  ["s11", 19.56, 'rest', "Your waitress comes back, sits down next to you, asks where you're from. Twice: two identical speech bubbles"],
  ["s12", 23.36, 'street', "You see, this place was called the Restaurant of Mistaken Orders: the facade sign lights up"],
  ["s13", 26.86, 'rest', "And every waiter there was living with dementia: the three old waiters in aprons, smiling in a row"],
  ["s14", 28.82, 'care', "It started when a TV director visited a care home: he walks into the care-home day room, TV DIRECTOR card"],
  ["s15", 31.56, 'care', "ordered a burger, and got dumplings: burger cloud, the resident sets dumplings down"],
  ["s16", 33.68, 'care', "He almost said something... then realized it didn't matter: finger up, then down, a smile"],
  ["s17", 36.40, 'care', "They were good dumplings: he bites, love face, sparkles"],
  ["s18", 37.64, 'rest', "So he opened a pop-up where mistakes were part of the menu: the menu board, MISTAKES chalked in"],
  ["s19", 40.46, 'rest', "More than a third of the orders came out wrong: the ticket rail, OOPS stamps on 3 of 8, the 37% tag"],
  ["s20", 42.66, 'rest', "and almost everyone left happy anyway: diners leave by the door waving, the 99% smiley board"],
  ["s21", 44.76, 'rest', "Because the food was never really the point: push past the food to the people talking"],
  ["s22", 47.04, 'rest', "For a few days, people told they couldn't work anymore got to put on an apron: the waitress ties her apron"],
  ["s23", 51.18, 'rest', "do a real job: she carries a full tray across the room, proud"],
  ["s24", 52.22, 'rest', "and hear a room full of strangers say thank you: everyone claps, THANK YOU bubbles"],
  ["s25", 54.62, 'rest', "So next time a waiter mixes up your order, maybe just eat the dumplings: you eat one, happy"],
  ["s26", 57.94, ALT_BOOM ? 'street' : 'rest', "(no voice) the tag: the waitress proudly brings THE BURGER to the coffee guy; he shrugs and bites"],
];
// SNAPS (SNAP_TEST, ref 6WTahOqdEl4 re-measured): per shot, the framings the camera holds and snaps between, each on the
// word that names its subject: [t (absolute s; the first = shot start), targets, fill]. Targets: 'p:who' (a person's
// whole billboard), 'u:who' (head + torso), 'o:name' (a set mesh), or a box [x, y, z, w, h, d]. c3FrameBox fits the
// whole target in frame (texts whole, heads whole); zoom-outs reopen the context after each detail.
const SNAPS = {
  s01: [[0, ['p:you'], 0.3], [1.68, [[0, 12, 0, 34, 26, 2]], 0.95]],
  s02: [[1.94, ['p:you', 'p:wait'], 0.6], [2.6, ['u:you', [2.0, 12.6, 28.4, 5, 5]], 0.9]],
  s03: [[3.02, ['p:wait'], 0.6], [4.26, ['u:wait'], 0.8]],
  s04: [[5.28, ['o:clkM', 'o:menuM'], 0.85], [5.62, ['o:clkM'], 0.75]],
  s05: [[6.26, ['p:you', [1.4, 4.2, 28.6, 3, 1.4, 3]], 0.7], [7.2, [[1.4, 4.3, 28.6, 3.4, 1.6, 3]], 0.75]],
  s06: [[8.42, ['p:you'], 0.55], [9.0, ['u:you'], 0.75]],
  s07: [[9.58, ['u:you'], 0.75], [9.98, ['o:signM', 'p:you'], 0.9], [11.28, ['o:signM'], 0.85]],
  s08: [[12.96, ['p:coffee', 'p:wait2'], 0.6], [14.42, ['u:coffee', [11.0, 12.6, 28.4, 5, 5]], 0.9]],
  s09: [[15.04, [[15.2, 4.2, 28.6, 5.5, 2, 3]], 0.75], [16.76, [[14.6, 4.6, 29, 2.6, 1.8, 2]], 0.6]],
  s10: [[17.46, ['p:coffee'], 0.5], [18.42, [[0, 8, 30, 48, 14, 20]], 0.95]],
  s11: [[19.56, ['p:you', [8, 7, 30, 10, 9, 4]], 0.75], [22.12, ['p:you', [8.4, 13.2, 28.8, 5, 3, 1], [5.6, 14.9, 29, 5, 3, 1], [7.8, 6, 28.6, 3, 8, 2]], 0.92]],
  s12: [[23.36, [[0, 12, 0, 34, 24, 2]], 0.9], [24.98, ['o:sign'], 0.85]],
  s13: [[26.86, ['p:wait', 'p:wait2', 'p:wait3'], 0.7], [28.58, ['u:wait2'], 0.7]],
  s14: [[28.82, [[2, 9, 18, 30, 16, 12]], 0.9], [30.08, ['p:dir', [11, 13.6, 28, 5, 2, 1]], 0.75]],
  s15: [[31.56, ['p:dir', 'p:gran'], 0.65], [32.04, ['u:dir', [5.6, 12.6, 22.4, 5, 5, 1]], 0.9], [32.9, [[2.0, 4.3, 22.8, 3.4, 1.6, 3]], 0.7]],
  s16: [[33.68, ['u:dir'], 0.7], [35.2, ['u:dir'], 0.8]],
  s17: [[36.40, ['u:dir', 'u:gran'], 0.75], [36.98, ['u:dir'], 0.82]],
  s18: [[37.64, [[-26, 13, 0.3, 12, 20, 1]], 0.9], [38.8, ['o:menuM'], 0.9]],
  s19: [[40.46, [[-8, 11.5, 0.3, 18, 14, 1]], 0.9], [41.08, ['o:tkM'], 0.95]],
  s20: [[42.66, [[30, 8, 46, 16, 14, 10]], 0.9], [43.82, ['o:hapM'], 0.8]],
  s21: [[44.76, [[-14.8, 4.4, 28.6, 4.5, 2, 3]], 0.7], [45.76, ['p:d1', 'p:d2', 'p:wait2'], 0.75]],
  s22: [[47.04, ['p:wait'], 0.6], [50.76, ['u:wait'], 0.75]],
  s23: [[51.18, ['p:wait'], 0.6]],
  s24: [[52.22, [[0, 8, 30, 50, 15, 20]], 0.95], [53.96, ['p:wait', 'p:you'], 0.7]],
  s25: [[54.62, ['p:you'], 0.55], [57.66, ['u:you'], 0.8]],
  s26: [[57.94, ['p:you', 'p:coffee'], 0.8], [59.0, ['p:coffee', 'p:wait'], 0.7], [60.25, ['u:coffee'], 0.8]],
};
// mromidev camera grammar (kit C3_CAMFX, refs-ext/claude-animated-shorts): every hold creeps in, punch words push harder,
// 4-5 deg tilts on emphasis, 7-frame impact shakes; background lens blur per shot (C3_DOF, CU 7 / MS 5 / wides 0)
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, {
  punch: [2.6, 7.2, 9.0, 11.28, 14.42, 16.9, 23.0, 25.7, 28.58, 32.9, 36.98, 39.0, 42.26, 46.58, 50.76, 53.96, 57.66],
  kicks: ALT_BOOM ? [[6.84, 0.6], [23.0, 0.5], [41.3, 0.6], [60.0, 2.4], [60.35, 1.6], [60.7, 1.2]] : [[6.84, 0.6], [23.0, 0.5], [41.3, 0.6], [59.4, 0.8]],
  roll: { s06: 4, s10: -4, s16: 4, s26: -4 } });
C3_DOF = { s01: 0, s02: 5, s03: 7, s04: 0, s05: 3, s06: 7, s07: 3, s08: 5, s09: 3, s10: 0, s11: 5, s12: 0, s13: 3, s14: 3, s15: 5, s16: 7, s17: 7, s18: 0, s19: 0, s20: 3, s21: 5, s22: 6, s23: 4, s24: 0, s25: 6, s26: ALT_BOOM ? 0 : 4 };
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'street' ? 'golden' : 'warmInterior']));
const DISSOLVE = 6 / FPS;
// ---- Ricks framing (styles/cartoon3d/FRAMING.md): wider shots + a few long takes ----
// SHOT_WIDEN pulls each shot's camera back along its own view line (c3SetCam p→l distance x k), so faces that
// filled the frame become medium/full-body like Ricks. CONTINUOUS[id] = the shot it flows out of: no dissolve,
// the camera glides from that shot's pose at the boundary into this shot's pose over CONT_BLEND (plano secuencia).
// framing is set per shot in the set files (ported from the approved test), so no extra widening here
const SHOT_WIDEN = Object.fromEntries(SHOT_LIST.map(([id]) => [id, ({ s01: 1, s10: 1, s12: 1, s14: 1.15, s20: 1.2, s24: 1, s21: 1.4, s03: 3.0, s16: 2.8, s17: 2.7, s25: 2.6, s06: 2.6, s12: 1.25, s18: 2.1 })[id] ?? 1.9]));   // Ricks framing: full-body medium shots
const CONTINUOUS = { s07: 's06', s16: 's15', s23: 's22' };   // long takes: the camera glides on, no dissolve
const CONT_BLEND = SNAP_TEST ? 0.2 : 0.55;
if (SNAP_TEST) { C3_SNAP = Object.assign({}, C3_SNAP_DEF); C3_CAMFX.punch = []; C3_CAMFX.roll = {}; }   // the authored SNAPS are the zooms: no extra punch-ins or rolls on top (user: zooms collided and shook)
const SHOT_INK = {};
const SHOT_INSERT = { s04: 1, s05: 1, s09: 1, s18: 1, s19: 1 };
let CUR_SHOT = null, C3_DRY = false, C3_DRY_CAM = null, CONT_A = null, CONT_ID = null;
{ const setCam0 = c3SetCam;
  c3SetCam = function (cam, c) { const k = !CUR_SHOT || C3_SNAP ? 1 : SHOT_INSERT[CUR_SHOT] ? (SHOT_WIDEN[CUR_SHOT] > 1.7 ? SHOT_WIDEN[CUR_SHOT] : 1.7) : SHOT_WIDEN[CUR_SHOT] || 1;   // everything else wider too (Ricks head median ~10 % of frame height)
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
  const place = (j) => j > 0 && j < SHOT_LIST.length && SHOT_LIST[j][2] !== SHOT_LIST[j - 1][2];
  if (C3_SNAP) c3SnapBlur((tt) => { const j = shotIndexAt(tt), [a0] = shotSpan(j), n = j + 1 < SHOT_LIST.length ? shotSpan(j + 1)[0] : 1e9, wh = C3_SNAP.whip;
    drawShot(j, tt);   // hard cuts; a whip pan across every change of place
    if (place(j + 1) && tt > n - wh) c3Whip((tt - (n - wh)) / wh, -1); else if (place(j) && tt < a0 + wh) c3Whip(1 - (tt - a0) / wh, 1); }, t);
  else if (i > 0 && t < a + DISSOLVE && !CONTINUOUS[SHOT_LIST[i][0]]) {   // dissolve: the outgoing shot keeps moving under the incoming one (not inside a long take)
    drawShot(i - 1, t);
    const lx = SHOT_LAYER.getContext('2d'); lx.clearRect(0, 0, W, H); lx.drawImage(ctx.canvas, 0, 0);
    drawShot(i, t);
    ctx.save(); screen(); ctx.globalAlpha = 1 - EZ.io((t - a) / DISSOLVE); ctx.drawImage(SHOT_LAYER, 0, 0); ctx.restore();
  } else drawShot(i, t);
  c3Crisp(0.6); c3Vignette(0.2);   // no grain (Ricks / mromidev measure none)
  if (ALT_BOOM) { const f = t - 60.0; if (f >= 0 && f < 4 / FPS) { ctx.save(); screen(); ctx.globalAlpha = [0.95, 0.7, 0.4, 0.15][Math.floor(f * FPS)]; ctx.fillStyle = '#fff6d0'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the blast flash
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

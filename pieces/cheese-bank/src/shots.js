// =====================================================================
//  SHOTS — the 21 shots (brief.md), one clause each, joined by 6-frame dissolves that start on the first word
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
const ALT_BOOM = false;   // (mistaken-orders only)
// SNAP_TEST (2026-11-03): the ref-6WTahOqdEl4 camera (kit C3_SNAP): holds + 5-frame snaps, crash zooms on punch words,
// motion blur, hard cuts, whip pans at place changes. Export -> renders/video_only_snap.mp4.
const SNAP_TEST = true;   // the ref-6WTahOqdEl4 camera is the house camera from now on
// [id, t0, set file, what we see] — t0 from the voice (take 11 tightened, voice/words.json); one clause per shot
const SHOT_LIST = [
  ["s01", 0.00, 'bank', "There's a bank in Italy where the vault doesn't hold gold: the hall with clients, then the open vault door; GOLD crossed out"],
  ["s02", 2.84, 'bank', "It holds cheese: inside the vault, the aisle of towering cheese racks"],
  ["s03", 3.88, 'bank', "You walk in for a loan: you cross the hall to the banker's desk, the LOAN form"],
  ["s04", 5.16, 'bank', "the banker doesn't ask about your salary: the payslip pops, NOT NEEDED"],
  ["s05", 7.36, 'bank', "He asks how many wheels you've got: the wheel photo in his thought cloud"],
  ["s06", 9.04, 'dairy', "You make cheese near Parma: you in your cellar, the map card with the PARMA pin"],
  ["s07", 10.30, 'dairy', "hundreds of giant wheels of Parmigiano: wide, the racks fill the frame"],
  ["s08", 12.72, 'dairy', "none of them are ready: NOT READY tag on the table wheel"],
  ["s09", 13.94, 'dairy', "Each one has to age at least a year, usually two: the calendar 12 -> 24 months"],
  ["s10", 16.72, 'dairy', "before anyone can sell it: a buyer with cash, NOT YET!"],
  ["s11", 18.08, 'dairy', "two years of paying for cows, workers and electricity, no money coming in: bills land, the empty wallet"],
  ["s12", 22.76, 'piazza', "So you load your cheese into a truck and drive it to the bank: the truck crosses the square"],
  ["s13", 25.26, 'bank', "The banker knocks on a wheel, listens like it's a watermelon: APPROVED"],
  ["s14", 29.17, 'bank', "Then the security guard leans over: Relax, we'll smell them coming (sniff)"],
  ["s15", 33.59, 'piazza', "this bank is called Credito Emiliano, doing this since the 1950s: the sign lights up, SINCE 1953"],
  ["s16", 38.55, 'bank', "Your cheese becomes the guarantee for your loan: the wheel on the desk, GUARANTEE"],
  ["s17", 40.69, 'bank', "while you wait, the bank keeps it in its own giant warehouse: high over the vault aisles"],
  ["s18", 43.65, 'bank', "where workers flip and brush every wheel: flip, brush"],
  ["s19", 47.23, 'bank', "hundreds of thousands of wheels, worth hundreds of millions of euros: over the racks, the counter and the tag"],
  ["s20", 51.65, 'bank', "if you can't pay the loan back, the bank keeps the cheese and sells it: shrug, the wheel goes, SOLD"],
  ["s21", 55.21, 'bank', "a vault where the most valuable thing inside smells amazing: the guard sniffing, love; the door swings shut"],
];
// SNAPS (SNAP_TEST, ref 6WTahOqdEl4 re-measured): per shot, the framings the camera holds and snaps between, each on the
// word that names its subject: [t (absolute s; the first = shot start), targets, fill]. Targets: 'p:who' (a person's
// whole billboard), 'u:who' (head + torso), 'o:name' (a set mesh), or a box [x, y, z, w, h, d]. c3FrameBox fits the
// whole target in frame (texts whole, heads whole); zoom-outs reopen the context after each detail.
const SNAPS = {
  s01: [[0, ['p:c1', 'p:c2', 'p:c3', 'p:teller'], 0.6], [1.42, [[-14, 9, 0.5, 19, 19, 2]], 0.85], [2.28, [[-14, 10, 2, 4.5, 4.5, 1]], 0.55]],
  s02: [[2.84, [[-14, 10, -26, 8, 12, 8]], 0.9], [3.28, [[-14, 13, -32, 14, 22, 10]], 0.98]],
  s03: [[3.88, ['p:you', 'p:banker', [4, 3, 34, 9, 1, 5]], 0.7], [4.74, [[5.2, 4.3, 34.6, 3, 1, 3.5], 'u:banker'], 0.8]],
  s04: [[5.16, ['p:banker', 'p:you'], 0.65], [6.8, ['u:you', [7.6, 12.6, 34, 2.8, 3.6, 1]], 0.85]],
  s05: [[7.36, ['p:banker', 'p:you'], 0.65], [8.12, ['u:banker', [-0.8, 12.8, 34, 5, 5, 1]], 0.9]],
  s06: [[9.04, ['p:you'], 0.55], [9.84, ['u:you', [3.4, 11.4, 22.4, 3.6, 5, 1]], 0.85]],
  s07: [[10.30, ['u:you'], 0.6], [10.66, [[-6, 7.5, 9, 26, 14, 4]], 0.98], [12.04, [[-9, 5.5, 9, 12, 8, 4]], 0.9]],
  s08: [[12.72, ['p:you', [6.8, 4.6, 29.4, 3.4, 1.4, 3.4]], 0.7], [13.54, [[6.8, 5.6, 29.6, 4.6, 3, 3]], 0.7]],
  s09: [[13.94, [[22, 13, 2.8, 8, 9, 1]], 0.7], [15.56, [[22, 13, 2.8, 4.6, 6.4, 1]], 0.65]],
  s10: [[16.72, ['p:you', 'p:p1'], 0.65], [17.56, [[8, 12.4, 30.5, 3.4, 3.4, 1], 'u:you'], 0.85]],
  s11: [[18.08, ['p:you', [9, 4, 30, 9, 1, 5]], 0.7], [19.36, [[8.2, 9.7, 31, 8.4, 3.6, 1]], 0.9], [21.48, ['u:you', [9, 13.6, 31, 3.2, 3.2, 1]], 0.85]],
  s12: [[22.76, [[0, 18, 0, 46, 40, 6]], 0.95], [23.92, [[6, 4.5, 50, 9, 9, 18]], 0.7]],   // (the wide 'bank' re-frame backed the camera into the parasols: dropped)
  s13: [[25.26, ['p:banker', 'p:you'], 0.65], [25.72, ['u:banker', [6.6, 4.4, 33.6, 2.6, 1, 2.6]], 0.8], [27.38, ['u:banker', [-0.8, 12.6, 34, 4.4, 4.4, 1]], 0.88], [28.75, [[4, 9.5, 35, 5, 5, 1], 'p:you', 'p:banker'], 0.85]],
  s14: [[29.17, ['p:banker', 'p:you'], 0.6], [30.15, ['p:guard', 'u:you'], 0.75], [32.59, ['u:guard', [9.8, 12, 36.8, 2.6, 2.4, 1]], 0.8]],
  s15: [[33.59, [[0, 20, 0, 48, 42, 8]], 0.95], [35.05, [[0, 28.6, 4.4, 28, 6, 1]], 0.85], [37.19, [[11, 8, 0.4, 4.4, 3.4, 1]], 0.6]],
  s16: [[38.55, [[6, 4.6, 34, 6, 2, 3], 'u:you'], 0.75], [39.61, [[6.6, 5.8, 33.8, 7.4, 3.4, 2]], 0.7]],
  s17: [[40.69, [[-14, 10, -28, 10, 14, 8]], 0.9], [43.05, [[-14, 14, -34, 16, 24, 10]], 0.98]],
  s18: [[43.65, ['p:w1', 'p:w2'], 0.72], [44.19, ['p:w1', [-12.4, 5, -14, 3.4, 3.4, 2]], 0.7], [44.83, ['p:w2', 'p:w1'], 0.75]],
  s19: [[47.23, [[-14, 14, -34, 16, 24, 10]], 0.98], [47.79, [[-14, 20, -26, 10, 9, 1]], 0.8], [50.45, [[-14, 17.6, -26, 10, 9, 1]], 0.8]],
  s20: [[51.65, ['p:banker', 'p:you'], 0.65], [53.57, [[4.4, 4.4, 33.6, 7, 1.6, 3], 'u:banker'], 0.8], [54.53, [[2.4, 6.6, 34, 4, 1.4, 1]], 0.6]],
  s21: [[55.21, [[-14, 9, 0.5, 19, 19, 2]], 0.85], [57.35, ['p:guard'], 0.6], [58.89, ['u:guard', [-14.5, 14, -5.6, 4, 2, 1]], 0.8], [59.6, [[-14, 9, 0.5, 19, 19, 2]], 0.9]],
};
// mromidev camera grammar (kit C3_CAMFX, refs-ext/claude-animated-shorts): every hold creeps in, punch words push harder,
// 4-5 deg tilts on emphasis, 7-frame impact shakes; background lens blur per shot (C3_DOF, CU 7 / MS 5 / wides 0)
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [], kicks: [[28.75, 0.8], [60.1, 1.0]], roll: {} });   // one zoom system: the authored SNAPS (no punch-ins on top)
C3_DOF = { s01: 0, s02: 0, s03: 4, s04: 5, s05: 5, s06: 5, s07: 0, s08: 5, s09: 0, s10: 4, s11: 5, s12: 0, s13: 5, s14: 5, s15: 0, s16: 5, s17: 0, s18: 4, s19: 0, s20: 5, s21: 3 };
// each shot's colour look (kit C3_LOOKS, measured on the refs)
const SHOT_LOOK = Object.fromEntries(SHOT_LIST.map(([id, , set]) => [id, set === 'piazza' ? 'dayExterior' : 'warmInterior']));
const DISSOLVE = 6 / FPS;
// ---- Ricks framing (styles/cartoon3d/FRAMING.md): wider shots + a few long takes ----
// SHOT_WIDEN pulls each shot's camera back along its own view line (c3SetCam p→l distance x k), so faces that
// filled the frame become medium/full-body like Ricks. CONTINUOUS[id] = the shot it flows out of: no dissolve,
// the camera glides from that shot's pose at the boundary into this shot's pose over CONT_BLEND (plano secuencia).
// framing is set per shot in the set files (ported from the approved test), so no extra widening here
const SHOT_WIDEN = Object.fromEntries(SHOT_LIST.map(([id]) => [id, ({ s01: 1, s10: 1, s12: 1, s14: 1.15, s20: 1.2, s24: 1, s21: 1.4, s03: 3.0, s16: 2.8, s17: 2.7, s25: 2.6, s06: 2.6, s12: 1.25, s18: 2.1 })[id] ?? 1.9]));   // Ricks framing: full-body medium shots
const CONTINUOUS = { s02: 's01', s16: 's14' };   // long takes: the camera snaps on through the vault door / along the desk
const CONT_BLEND = SNAP_TEST ? 0.2 : 0.55;
if (SNAP_TEST) { C3_SNAP = Object.assign({}, C3_SNAP_DEF); C3_CAMFX.punch = []; C3_CAMFX.roll = {}; }
// LOOK_TUT (2026-11-08, tutorial _XllAGyvdd8 analysed frame by frame: fuentes/cartoon3d/tut-XllAGyvdd8-frames*.md): moody
// haze per place, stronger lens blur, lower saturation, heavy vignette + fine grain, lamp bloom, sphere-shaded heads,
// tighter framing; camera half-way between our snaps and its slow push-ins (user: "una media"). One-word subtitles stay.
const LOOK_TUT = false;   // user 2026-11-08: "quedó casi igualito, olvida ese tutorial"
const TUT_FOG = { bank: ['#5e4636', 0.013], dairy: ['#6e5440', 0.016], piazza: ['#9a8a98', 0.007] };
let SNAP_FILLK = 1;
if (LOOK_TUT) {
  C3_HEADSHADE = { hi: 0.4, edge: 0.72, spec: 0.6 };
  C3_VIVID = Object.assign({}, C3_VIVID, { b: 1.0, c: 1.08, s: 0.68, vib: 0, bloom: 0.22 });
  for (const k in C3_DOF) C3_DOF[k] = C3_DOF[k] ? C3_DOF[k] + 3 : 2;
  C3_SNAP = Object.assign({}, C3_SNAP_DEF, { dur: 8 / 30, drift: 0.0028, blur: 10 });   // snaps ~0.27 s (ours 0.17, his slow pushes), holds push in ~+5 %/s
  SNAP_FILLK = 1.15;   // tighter: heads ~25-35 % of the frame on character shots
}   // the authored SNAPS are the zooms: no extra punch-ins or rolls on top (user: zooms collided and shook)
const SHOT_INK = {};
const SHOT_INSERT = {};
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
  const viv0 = C3_VIVID; if (SHOT_LIST[i][2] === 'piazza') C3_VIVID = C3_VIVID_STREET;
  C3_SHOT = { id, t0: a }; CUR_SHOT = id; try { fn(t, clamp((t - a) / (b - a)), t - a); } finally { C3_INK2 = ink0; } CUR_SHOT = null; CONT_A = null;
  c3Look(SHOT_LOOK[id]); C3_VIVID = viv0;
}
const SHOT_LAYER = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
function sceneApple() {
  if (LOOK_TUT) for (const [S, k] of [[bkGet(), 'bank'], [dyGet(), 'dairy'], [pzGet(), 'piazza']]) if (!S.scene.fog) { S.scene.fog = new THREE.FogExp2(TUT_FOG[k][0], TUT_FOG[k][1]);   // people, signs and labels (alpha sprites) stay crisp over the haze
    S.scene.traverse((m) => { if (m.isMesh && m.material && m.material.alphaTest > 0) m.material.fog = false; }); }
  if (0) for (const [S, k] of [[BK.s, 'bank'], [DY.s, 'dairy'], [PZ.s, 'piazza']]) if (S && !S.scene.fog) S.scene.fog = new THREE.FogExp2(TUT_FOG[k][0], TUT_FOG[k][1]);
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
  if (LOOK_TUT) { c3Crisp(0.45); c3Vignette(0.42); c3Grain(0.035); } else { c3Crisp(0.6); c3Vignette(0.2); }   // no grain (Ricks / mromidev measure none); LOOK_TUT: his heavy vignette + fine grain
  if (ALT_BOOM) { const f = t - 60.0; if (f >= 0 && f < 4 / FPS) { ctx.save(); screen(); ctx.globalAlpha = [0.95, 0.7, 0.4, 0.15][Math.floor(f * FPS)]; ctx.fillStyle = '#fff6d0'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the blast flash
  c3Subtitle(WORDS, t);
}
// the storyboard: one panel per shot, at 60 % of it, titled with the words spoken in it
TIMELINE.board = SHOT_LIST.map(([id, t0, set, what], i) => {
  const [a, b] = shotSpan(i), words = WORDS.filter((w) => w.s >= a - 0.05 && w.s < b - 0.05).map((w) => w.w).join(' ');
  return { t: a + (b - a) * 0.6, title: `${i + 1}. ${words}`, sound: what, next: '' };
});
TIMELINE.shots = SHOT_LIST.map(([id, t0, set, what], i) => ({ id: i + 1, key: id, era: 0, t0: shotSpan(i)[0], t1: shotSpan(i)[1], title: what }));

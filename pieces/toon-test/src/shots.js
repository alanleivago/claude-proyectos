// =====================================================================
//  TOON TEST v2 — code-drawn "2D-3D" people (styles/cartoon3d/toon.js v2) in the bank hall (src/set-bank.js).
//  0-9 s (toon_test_v2.mp4): idle with the head moving on its own, a 3/4 walk-in, a sit with anticipation, the banker
//  talking with his arms while gripping a mug, a profile walk with a coffee, a back view. 9-9.5 s lineup, 9.5-11 s close-ups.
// =====================================================================
C3_HD = true;
var C3_RICKS = { b: 0.93, c: 1.1, s: 1.0 };
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.12, s: 1.1, vib: 0.4 });
C3_INK2 = C3_INK2_DEF; C3_SHADOW = Object.assign({}, C3_SHADOW_DEF, { catch: 0.5, tint: '#4a2a34', key: 0.8 });
const TOON_CAST = {
  banker: { key: 'banker', hair: 'balding', hairColor: 'grey', outfit: 'suit', moustache: true, body: 'fat' },
  you: { key: 'you', hair: 'mop', hairColor: 'brown', outfit: 'sweater', body: 'avg' },
  guard: { key: 'guard', hair: 'side', hairColor: 'black', outfit: 'guard', body: 'tall' },
  teller: { key: 'teller', hair: 'bob', hairColor: 'black', outfit: 'apron', skin: 'peach', body: 'pear' },
  worker: { key: 'worker', hair: 'messy', hairColor: 'dark', outfit: 'hivis', skin: 'tan', body: 'avg' },
  clerk: { key: 'clerk', hair: 'tuft', hairColor: '#9a5a2e', outfit: 'shirt', glasses: true, body: 'thin' },
  nonna: { key: 'nonna', hair: 'curly', hairColor: '#c8702a', outfit: 'dress', glasses: true, colors: { main: '#3a9a8a' }, body: 'short' },
  kid: { key: 'kid', hair: 'ponytail', hairColor: 'blond', outfit: 'hoodie', colors: { main: '#e2a23a', tie: '#d84a6a' }, body: 'kid' },
};
function toonGet(s) {
  if (!s.toon) { s.toon = {}; for (const [k, o] of Object.entries(TOON_CAST)) { const p = c3ToonChar(o); s.scene.add(p.g); c3Layer(p.g, C3.L_FOCUS); s.toon[k] = p; } }
  for (const k in s.toon) s.toon[k].g.visible = false;
  return s.toon;
}
function toonAt(s, k, t, x, z, o = {}) { const p = s.toon[k]; p.g.visible = true; p.g.position.set(x, 0, z); return c3ToonPose(p, s.cam, t, o); }
const SEAT = 2.4;
const RENDER_O = { bg: '#d8643a', bgBlur: 1.0, glow: 0.4, glowBlur: 12 };

// ---- 9-9.5 s: the lineup (two rows)
const LPOS = [[-19, 25], [-16.3, 19], [-13.6, 25], [-10.9, 19], [-8.2, 25], [-5.5, 19], [-2.8, 25], [-0.1, 19]];
const LINEUP = [['banker', 'smug', { L: 'down', R: 'hip' }, 0.8], ['you', 'happy', { L: 'down', R: 'wave' }, 0.4], ['guard', 'bored', { L: 'hip', R: 'hip' }, 0.9],
  ['teller', 'grin', { L: 'down', R: 'talk' }, -0.5], ['worker', 'surprised', null, 0], ['clerk', 'skeptical', { L: 'cross', R: 'cross2' }, -0.9],
  ['nonna', 'smile', { L: 'hold', R: 'down' }, -0.6, { L: 'bag' }], ['kid', 'excited', { L: 'up', R: 'down' }, -1]];
function sceneLineup(t) {
  const s = bkGet(); toonGet(s);
  c3SetCam(s.cam, { p: [-9.5, 6.8, 69], l: [-9.5, 7.2, 20], fov: 50 });
  LINEUP.forEach(([k, e, hand, fc, prop], i) => toonAt(s, k, t, ...LPOS[i], { expr: e, hand: hand || undefined, prop, facing: fc, gaze: [fc * 0.4, 0], blink: 0 }));
  c3Render(s.scene, s.cam, RENDER_O);
}
// ---- 9.5-11 s: a close-up of each person (comparison crops vs Ricks)
function sceneCU(t) {
  const s = bkGet(); toonGet(s); const i = Math.min(7, Math.floor((t - 9.5) * 6)), [x, z] = LPOS[i];
  const hy = c3ToonDims(s.toon[LINEUP[i][0]]).height - 1.6; c3SetCam(s.cam, { p: [x + 1.2, hy + 1.0, z + 15], l: [x, hy, z], fov: 30 });
  LINEUP.forEach(([k, e, hand, fc, prop], j) => j === i && toonAt(s, k, t, ...LPOS[j], { expr: e, hand: hand || undefined, prop, facing: fc, gaze: [fc * 0.4, 0], blink: 0 }));
  c3Render(s.scene, s.cam, Object.assign({}, RENDER_O, { bgBlur: 12 }));   // v5: Ricks close-ups have a shallow depth of field
}
function sceneIdle(t) {
  const s = bkGet(); toonGet(s); const lt = t - 12;
  c3SetCam(s.cam, { p: [2.6, 8.4, 64], l: [2.2, 7.6, 46], fov: 30 });
  toonAt(s, 'you', t, 2.2, 46, { facing: 0.35, gaze: [0.3, 0], expr: [[0, 'neutral'], [1.2, 'smile'], [1.75, 'skeptical']], idle: 1, talk: lt > 1.2 ? 0.8 : 0, gesture: lt > 1.2 ? 0.7 : 0,
    hand: { L: 'down', R: [[0, 'down'], [1.25, 'talk'], [1.75, 'talk2'], [2.15, 'talk']] } });
  c3Render(s.scene, s.cam, Object.assign({}, RENDER_O, { bgBlur: 8 }));
}
// 14.4-16.4 s: hair-follows-head + arm-attach test — 4 people in a medium shot: idle, talk with gestures, turns
const HT = ['teller', 'nonna', 'guard', 'kid'];
function sceneHairTest(t, set2) {
  const s = bkGet(); toonGet(s); const lt = t - 14.4, row = set2 ? ['worker', 'clerk', 'banker', 'you'] : HT;
  c3SetCam(s.cam, { p: [2.7, 7.6, 70], l: [2.7, 6.6, 44], fov: 44 });
  row.forEach((k, i) => toonAt(s, k, t, -2.4 + i * 3.4, 44, { facing: [[0, [0.4, -0.4, 0.8, -0.8][i]], [0.7, [-0.9, 0.9, -0.3, 0.3][i]], [1.4, [0.4, -0.4, 0.8, -0.8][i]]], idle: 1.5,
    expr: [[0, 'neutral'], [0.5, 'smile'], [1.2, 'surprised']], talk: i % 2 ? 0.9 : 0, gesture: i % 2 ? 0.9 : 0, hand: { L: [[0, 'down'], [0.6, 'hip'], [1.3, 'down']], R: [[0, 'down'], [0.45, 'talk'], [1.0, 'wave'], [1.6, 'down']] } }));
  c3Render(s.scene, s.cam, RENDER_O);
}
// 18.4-19.4 s: a dark room — the lights dimmed to a night blue with a warm desk lamp (shading must darken and tint)
function sceneDark(t) {
  const s = bkGet(); toonGet(s); const L = []; s.scene.traverse((l) => { if (l.isLight) L.push([l, l.intensity, l.color.clone(), l.groundColor ? l.groundColor.clone() : null]); });
  L.forEach(([l]) => { l.intensity *= l.isPointLight ? 1 : 0.32; if (l.isAmbientLight || l.isHemisphereLight) l.color.set('#7a8ad8'); if (l.isDirectionalLight) l.color.set('#ffb070'); });
  c3SetCam(s.cam, { p: [4.0, 9.4, 60], l: [4.0, 6.4, 35], fov: 50 }); const R0 = c3Renderer().r, ex0 = R0.toneMappingExposure; R0.toneMappingExposure = 0.4;
  toonAt(s, 'banker', t, BK_SEAT.banker[0], BK_SEAT.banker[1] + 1.3, { sit: 1, seat: SIT_SEAT, facing: 1.1, expr: 'smug', hand: { L: 'hold', R: 'desk' }, prop: { L: 'mug' } });
  toonAt(s, 'you', t, BK_SEAT.you[0], BK_SEAT.you[1] + 1.3, { sit: 1, seat: SIT_SEAT, facing: -1.1, expr: 'nervous', hand: { L: 'lap', R: 'lap' } });
  c3Render(s.scene, s.cam, Object.assign({}, RENDER_O, { bg: '#1a1a30' }));
  L.forEach(([l, i, c, gc]) => { l.intensity = i; l.color.copy(c); if (gc) l.groundColor.copy(gc); }); R0.toneMappingExposure = ex0;
}
function sceneApple() {
  const t = TT;
  if (t < 9) sceneClip(t); else if (t < 9.5) sceneLineup(t); else if (t < 11) sceneCU(t); else if (t < 12) sceneExpr(t); else if (t < 14.4) sceneIdle(t); else if (t < 16.4) sceneHairTest(t, false); else if (t < 18.4) sceneHairTest(t - 2, true); else sceneDark(t);
  c3Look('warmInterior'); c3Crisp(0.6); c3Vignette(0.2);
}
// ---- the clip (0-9 s), hard cuts like Ricks
// facing from a world-space motion direction, seen from the camera: front 0, 3/4 ±1, profile ±2, 'back'; + = toward screen right
// (v6 fix: the old sign was inverted, so the walk-in faced away from its travel and moonwalked)
function toonFacing(cam, x, z, vx, vz) {
  const c = new THREE.Vector3(cam.position.x - x, 0, cam.position.z - z).normalize(), r = new THREE.Vector3(c.z, 0, -c.x), l = Math.hypot(vx, vz) || 1;
  const toward = (vx * c.x + vz * c.z) / l, across = (vx * r.x + vz * r.z) / l, th = Math.atan2(Math.abs(across), toward);
  return th > 2.5 ? 'back' : Math.sign(across || 1) * Math.min(2, th * 4 / Math.PI);
}
const SIT_SEAT = 2.42;
const BANK_TALK = [[4.1, 4.95], [5.25, 6.15]];   // banker speaking (s)
const talkAmp = (t, segs) => { for (const [a, b] of segs) if (t >= a && t <= b) return Math.min(1, (t - a) / 0.08, (b - t) / 0.08); return 0; };
function sceneClip(t) {
  const s = bkGet(); toonGet(s);
  const [bx, bz] = BK_SEAT.banker, [yx, yz] = BK_SEAT.you;
  // the banker (all shots but D): seated, a mug in his left hand, the right hand on the desk / gesturing
  const bankerR = [[0, [0.5, 0.56, 1]], [2.9, [0.5, 0.56, 1]], [3.15, 'talk2'], [3.7, [0.5, 0.56, 1]], [4.1, 'talk'], [4.55, 'point'], [4.95, 'talk2'], [5.3, 'shrug'], [5.85, 'talk'], [6.2, [0.5, 0.56, 1]]];
  const bankerL = [[0, 'hold'], [1.2, 'sip'], [1.75, 'hold'], [6.1, 'hold'], [6.35, 'sip']];
  const bExpr = [[0, 'neutral'], [2.9, 'smile'], [3.7, 'smug'], [4.1, 'neutral'], [4.55, 'determined'], [4.95, 'smile'], [5.3, 'skeptical'], [5.85, 'smile'], [6.2, 'smug']];
  const banker = () => toonAt(s, 'banker', t, bx, bz + 1.3, { sit: 1, seat: SIT_SEAT, facing: toonFacing(s.cam, bx, bz + 1.3, 1, 0.3), gaze: [0.7, 0], expr: bExpr, hand: { L: bankerL, R: bankerR }, prop: { L: { kind: 'mug', text: '#1', color: '#f2efe6' } },
    talk: talkAmp(t, BANK_TALK), gesture: talkAmp(t, BANK_TALK) * 0.8, idle: 1.1 });
  // "you": walk in (0-2.35 s, 3/4 toward the camera), turn, sit with anticipation (2.45-3.35 s), then listen
  const P1 = [yx + 0.3, yz + 2.2], P0 = [P1[0] + (14.8 - P1[0]) * 1.4, P1[1] + (30.5 - P1[1]) * 1.4],   // v6: starts further off so the stride can be Ricks-long
  wT = 2.35, sT0 = 2.45, sT1 = 3.4;
  const you = () => {
    if (t < wT) { const k = t / wT, e = k < 0.15 ? k * k / 0.3 : k > 0.85 ? 1 - (1 - k) ** 2 / 0.3 - 0.0 : k, x = lerp(P0[0], P1[0], e), z = lerp(P0[1], P1[1], e);
      const d = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]) * e;
      return toonAt(s, 'you', t, x, z, { mode: 'walk', phase: d / 4.6, stride: 4.6, stop: Math.max(0, (k - 0.82) / 0.18) ** 1.5, facing: toonFacing(s.cam, x, z, P1[0] - P0[0], P1[1] - P0[1]), gaze: [-0.5, 0], expr: 'smile', idle: 1 }); }
    const u = (t - sT0) / (sT1 - sT0), sc = c3ToonSitCurve(u), turn = EZ.io((t - wT) / 0.18);
    const x = lerp(P1[0], yx, EZ.io(u * 1.4)), z = lerp(P1[1], yz + 1.3, EZ.io(u * 1.4));
    const exprY = [[0, 'smile'], [4.0, 'nervous'], [5.02, 'surprised'], [5.9, 'grin'], [8.05, 'excited']];
    return toonAt(s, 'you', t, x, z, { sit: Math.max(0, sc.sit), seat: SIT_SEAT, lean: -sc.lean, squash: sc.squash, facing: (() => { const fw = toonFacing(s.cam, x, z, -1, 0.3), f0 = toonFacing(s.cam, x, z, P1[0] - P0[0], P1[1] - P0[1]); return [[0, f0], [wT, fw]]; })(), gaze: [-0.8, t > 4 && t < 5 ? 0.3 : 0], expr: exprY,
      hand: { L: u < 0.9 ? [[sT0, 'down'], [sT0 + 0.25, [0.32, 0.5]], [sT1, 'lap']] : 'lap', R: [[sT0, 'down'], [sT0 + 0.3, [0.35, 0.55]], [sT1, 'lap'], [5.05, [0.42, 0.1]], [5.6, 'lap']] },
      fx: t > 4.2 && t < 5.0 ? 'sweat' : t > 8.1 ? 'sparkle' : undefined, idle: 1, talk: t > 8.2 && t < 8.8 ? 0.7 : 0, gesture: t > 8.2 ? 0.6 : 0 });
  };
  const teller = () => toonAt(s, 'teller', t, 20, 15.5, { facing: -0.6, gaze: [-0.5, 0], expr: 'smile', hand: { L: 'desk', R: [[0, 'down'], [6.9, 'wave'], [7.6, 'down']] }, idle: 1.2 });
  const guard = (back) => toonAt(s, 'guard', t, back ? 3.5 : -8, back ? 27 : 24, back ? { facing: 'back', hand: { L: 'hip', R: 'hip' }, idle: 1.2 } : { facing: 0.6, expr: 'bored', hand: { L: 'hip', R: 'hip' }, idle: 1 });
  if (t < 4.0) {   // A + B: the walk-in and the sit (one camera, a slow push)
    const k = t / 4; c3SetCam(s.cam, { p: [4.6, 10.2, 69.5 - 4 * k], l: [4.6, 6.4, 31], fov: 47 });
    banker(); you(); teller(); guard(false);
  } else if (t < 5.2) {   // C1: the banker talks with his hands (a medium single)
    const k = (t - 4) / 1.2; c3SetCam(s.cam, { p: [2.2, 9.0, 53 - 1.2 * k], l: [-0.6, 7.3, 35.5], fov: 33 });
    banker(); you();
  } else if (t < 6.4) {   // C2: over the customer's shoulder, the banker across the desk
    const k = (t - 5.2) / 1.2; c3SetCam(s.cam, { p: [25 - 0.6 * k, 11.4, 39.6], l: [1, 6.6, 35.3], fov: 36 });
    banker(); you();
  } else if (t < 8.0) {   // D: the clerk crosses in profile with a coffee; the guard seen from behind; the teller waves
    const k = (t - 6.4) / 1.6, x = lerp(-6.5, 4.5, k), cx = lerp(-2, 1.5, k);
    c3SetCam(s.cam, { p: [cx, 8.2, 64], l: [cx, 7.0, 44], fov: 36 });
    toonAt(s, 'clerk', t, x, 46, { mode: 'walk', phase: (x + 6.5) / 3.5, stride: 3.5, facing: 1.0, expr: 'skeptical', gaze: [0.8, 0], hand: { L: { h: [-0.36, 0.42], pole: [1, 0.6], front: true, hand: 'grip' } }, prop: { L: 'coffee' }, idle: 0.6 });
    guard(true); teller(); toonAt(s, 'kid', t, -9, 30, { facing: 0.8, expr: 'happy', gaze: [0.6, 0], hand: { R: 'wave' }, idle: 1.4 });
    toonAt(s, 'nonna', t, -14, 33, { facing: 0.9, expr: 'smile', hand: { L: 'hold' }, prop: { L: 'bag' }, idle: 0.8 });
  } else {   // E: "you" — the deal is done
    const k = (t - 8) / 1; c3SetCam(s.cam, { p: [5.2 + 0.3 * k, 9.4, 49.5 - 1.2 * k], l: [9.6, 7.9, 35.5], fov: 36 });
    you(); banker();
  }
  c3Render(s.scene, s.cam, Object.assign({}, RENDER_O, { bgBlur: t < 4 ? 3 : t < 6.4 ? 9 : t < 8 ? 4 : 8 }));   // v5: DOF per shot
}
// 11-12 s: an expression sheet (one per 1/12 s) on the customer, for the comparison vs Ricks
const EXPRS = ['neutral', 'smile', 'happy', 'grin', 'talk', 'smug', 'skeptical', 'nervous', 'strain', 'surprised', 'shock', 'angry'];
function sceneExpr(t) {
  const s = bkGet(); toonGet(s); const i = Math.min(11, Math.floor((t - 11) * 12)), w = ['you', 'teller', 'worker', 'guard'][i % 4], [x, z] = [2, 44];
  const hy = c3ToonDims(s.toon[w]).height - 1.6; c3SetCam(s.cam, { p: [x + 0.8, hy + 0.6, z + 12], l: [x, hy, z], fov: 26 });
  toonAt(s, w, t, x, z, { expr: EXPRS[i], facing: [0.5, -0.6, 0.2, -0.9][i % 4], gaze: [0.3, 0], blink: 0, idle: 0, talk: EXPRS[i] === 'talk' ? 0.7 : 0, fx: EXPRS[i] === 'nervous' ? 'sweat' : undefined });
  c3Render(s.scene, s.cam, Object.assign({}, RENDER_O, { bgBlur: 12 }));
}
TIMELINE.board = [{ t: 1.0, title: 'walk-in', sound: '', next: '' }, { t: 9.2, title: 'lineup', sound: '', next: '' }];
TIMELINE.shots = [{ id: 1, key: 'clip', era: 0, t0: 0, t1: 9, title: 'clip' }, { id: 2, key: 'lineup', era: 0, t0: 9, t1: 9.5, title: 'lineup' }, { id: 3, key: 'cu', era: 0, t0: 9.5, t1: 11, title: 'cu' }];

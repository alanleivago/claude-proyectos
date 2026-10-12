// =====================================================================
//  SCENES — reflejo. Low-res coords: 180x320 (6 px pixels). Each scene is one obScene; subtitles queue after it.
//  Light: one wall lamp above the mirror. Every scene ends with a dithered falloff pass from it (obScene light).
// =====================================================================
// the subtitle active now (typed from its t0)
function subsNow(o = {}) { for (const s of SUBS) if (TT >= s.t0 - 1e-6 && TT < s.t1 - 1e-6) obSub(s.lines, s.t0, o); }
// a deterministic idle blink: closed for one boil every ~2.7 s (key shifts the phase)
const idleBlink = (key, extra = []) => { const p = mod(TT + (key === 'a' ? 0.9 : 1.7), 2.7); return p < 0.12 || extra.some(([a, b]) => TT >= a && TT < b) ? 1 : 0; };
const LAMP_LIGHT = (x, y, r0 = 270, r1 = 420, amb = 0.3) => ({ amb, lights: [{ x, y, r0, r1, p: 1.2 }] });

// the bathroom wall behind the sink: big white tiles above, half-tone tiles below a dado line
function bathWall(dado = 212, o = {}) {
  obTiles([[-2, -2], [182, -2], [182, dado], [-2, dado]], o.nx ?? 8, Math.round((dado + 2) / 22), { key: 'wallU', grout: GR, stain: 0.14 });
  obTiles([[-2, dado], [182, dado], [182, 322], [-2, 322]], o.nx ?? 8, 5, { key: 'wallL', base: obDith(WH, GR, 0.5), grout: K, stain: 0.22, shine: WH });
  obRect(-2, dado - 1, 184, 3, WH, { rim: K });
}
// the reflected room inside a mirror (x, y, w, h): ceiling and side walls in perspective, a door, a towel; flip mirrors it
function reflRoom(x, y, w, h, o = {}) {
  const bx0 = x + w * 0.11, bx1 = x + w * 0.89, by0 = y + h * 0.17, dado = y + h * 0.78;
  obRoomBox([x, y, x + w, y + h], [bx0, by0, bx1, y + h]);
  obTiles([[bx0, by0], [bx1, by0], [bx1, dado], [bx0, dado]], 6, 6, { key: 'reflU', grout: GR, stain: 0.12 });
  obTiles([[bx0, dado], [bx1, dado], [bx1, y + h + 2], [bx0, y + h + 2]], 6, 2, { key: 'reflL', base: obDith(WH, GR, 0.5), grout: K });
  const flip = o.flip ? -1 : 1, X = (f) => (flip > 0 ? x + w * f : x + w * (1 - f));
  const dw = w * 0.22;
  obDoor(flip > 0 ? X(0.16) : X(0.16) - dw, by0 + h * 0.08, dw, y + h - by0 - h * 0.08, { open: o.doorOpen ?? 0.35, gapLight: 0.15 });
  const tw = w * 0.15; obTowel(flip > 0 ? X(0.7) : X(0.7) - tw, by0 + h * 0.3, tw, h * 0.26, { key: 'refl' });
}

// 1 — the question: over the shoulder (the person's back of head, right), the reflection in the mirror, a slow push-in
function sceneMirrorClose() {
  const u = seg(TT, E0, E0 + 3);
  obScene(() => {
    bathWall();
    obLamp(54, 15, 76, 1);
    obMirror(26, 30, 128, 162, () => {
      reflRoom(26, 30, 128, 162);
      obPerson(86, 102, 21, { blink: idleBlink('a', [[1.75, 1.9]]), look: [0.25, 0], key: 'refl', rimDir: [0, -1] });
    }, { key: 'm1' });
    obShelf(36, 202, 108, [['pump', 44, 13], ['round', 54, 11], ['cup', 66, 9], ['jar', 128, 6], ['tall', 138, 15]]);
    obSink(92, 224, 96, { drip: TT * 1.3 });
    obTowel(2, 100, 16, 70, { key: 'fg' });
    obBackOfHead(150, 214, 30);
  }, { cam: { z: 1 + 0.05 * EZ.io(u), x: 86, y: 104 }, light: LAMP_LIGHT(92, 10) });
  subsNow({ y: 1190 });
}
// 2 — the hand: the person's hand rises beside their head; the reflection's follows late and slowly
function sceneHandLag() {
  const up = EZ.o3(seg(TT, CUE.handUp, CUE.handUp + 0.5)), lag = seg(TT, CUE.reflHand, CUE.reflHand + 1.0);
  obScene(() => {
    bathWall();
    obLamp(54, 15, 76, 1);
    obMirror(26, 30, 128, 162, () => {
      reflRoom(26, 30, 128, 162);
      obPerson(86, 102, 21, { blink: idleBlink('a'), look: [lag > 0.5 ? 0.6 : 0.25, 0], key: 'refl', rimDir: [0, -1] });
      if (lag > 0) obHand(Math.round(lerp(118, 116, lag)), Math.round(lerp(182, 116, lag)), 10, { side: 'palm', mirror: true, arm: 3, armDx: 0.3 });
    }, { key: 'm1' });
    obShelf(36, 202, 108, [['pump', 44, 13], ['round', 54, 11], ['cup', 66, 9], ['jar', 128, 6], ['tall', 138, 15]]);
    obSink(92, 224, 96, { drip: TT * 1.3 });
    obTowel(2, 100, 16, 70, { key: 'fg' });
    obBackOfHead(150, 214, 30);
    if (up > 0) obHand(Math.round(lerp(150, 142, up)), Math.round(lerp(360, 146, up)), 19, { side: 'back', arm: 6, armDx: -1.4 });
  }, { light: LAMP_LIGHT(92, 10) });
  subsNow({ y: 1190 });
}
// the bathroom behind a face, seen from the mirror: ceiling corner, the door, a towel, a shelf; flip = the reflection's side
function behindRoom(flip = 1) {
  const X = (x, w = 0) => (flip > 0 ? x : 180 - x - w);
  obRoomBox([-2, -2, 182, 330], [X(20, 0) < 90 ? 22 : 22, 36, 158, 330], { walls: true });
  obTiles([[22, 36], [158, 36], [158, 230], [22, 230]], 6, 8, { key: 'beh', grout: GR, stain: 0.14 });
  obTiles([[22, 230], [158, 230], [158, 330], [22, 330]], 6, 4, { key: 'behL', base: obDith(WH, GR, 0.5), grout: K });
  obDoor(X(26, 36), 52, 36, 280, { open: 0.3, gapLight: 0.12 });
  obTowel(X(128, 22), 150, 22, 64, { key: 'beh' });
  obShelf(X(118, 36), 120, 36, [['pump', X(124, 0), 12], ['round', X(134, 0), 9], ['cup', X(146, 0), 8]].map(([k, x, h]) => [k, x, h]));
  obLamp(X(70, 40), 30, 40, 0);
}
// 3a — the person, from the mirror's side: lit from the front lamp; they blink
function sceneSelfBlink() {
  const bl = TT >= CUE.blink && TT < CUE.blink + 0.17 ? 1 : 0;
  obScene(() => {
    behindRoom(1);
    obPerson(90, 128, 42, { blink: bl, look: [0.1, 0], key: 'self', shade: 1 });
  }, { cam: { z: 1 + 0.03 * seg(TT, E0, E0 + 1.5), x: 90, y: 130 }, light: LAMP_LIGHT(90, 170, 200, 330) });
  subsNow({ y: 1330 });
}
// 3b — two-shot through the glass: the person's profile (foreground, left) blinks; the reflection does not, and stares
function sceneReflStare() {
  const st = EZ.o2(seg(TT, E0, E0 + 0.8));
  const pb = (TT >= 7.9 && TT < 8.05) || (TT >= 8.3 && TT < 8.5) ? 1 : 0;
  obScene(() => {
    obMirror(4, 6, 172, 308, () => {
      behindRoom(-1);
      obPerson(110, 128, 40, { stare: st, look: [-0.35, 0], key: 'refl', shade: -1, roll: -0.05 * seg(TT, E0 + 0.5, E0 + 1.5) });
    }, { frame: 4, glints: [[0.78, 6], [0.88, 2]], key: 'm3', spots: 14 });
    obProfile(2, 150, 56, { blink: pb });
  }, { cam: { z: 1 + 0.04 * seg(TT, E0, E0 + 1.5), x: 110, y: 130 }, light: LAMP_LIGHT(100, 170, 200, 330) });
  subsNow({ y: 1330 });
}
// 4 — the medium shot: they step back; the reflection stays, palms on the glass, and grins; the lamp flickers and dies
function sceneStepBack() {
  const back = EZ.io(seg(TT, CUE.stepBack, CUE.stepBack + 0.5)), press = EZ.o3(seg(TT, CUE.press, CUE.press + 0.35)), sm = seg(TT, CUE.smile, CUE.lightOff - 0.1);
  const off = TT >= CUE.lightOff, flick = TT >= CUE.lightOff - 0.5 && TT < CUE.lightOff && B % 3 === 0, dark = off || flick;
  obScene(() => {
    bathWall(206, { nx: 7 });
    obTiles([[156, -30], [182, -50], [182, 360], [156, 330]], 1, 14, { key: 'side', base: obDith(WH, GR, 0.4), grout: K, bevel: false });   // the side wall in the corner
    obLine([[156, -2], [156, 322]], 1, K);
    obLamp(52, 20, 64, dark ? 0 : 1, { gh: 30 });
    obMirror(22, 34, 128, 148, () => {
      reflRoom(22, 34, 128, 148, { doorOpen: 0.5 });
      obPerson(86, 98, 21, { stare: 1, smile: sm, key: 'refl', glow: dark, rimDir: dark ? null : [0, -1] });
      if (press > 0) for (const sd of [-1, 1]) obHand(86 + sd * Math.round(lerp(26, 40, press)), Math.round(lerp(170, 124, press)), Math.round(lerp(10, 14, press)), { side: 'palm', flat: press > 0.9, mirror: sd > 0, glow: dark });
    }, { frame: 3, key: 'm4', glow: dark });
    obShelf(32, 188, 108, [['pump', 40, 12], ['round', 50, 10], ['cup', 62, 8], ['jar', 126, 6], ['tall', 135, 14]]);
    obSink(86, 210, 84, { drip: TT * 1.3 });
    obTowel(160, 120, 14, 64, { key: 'side' });
    obBackOfHead(Math.round(lerp(30, 26, back)), Math.round(lerp(262, 270, back)), Math.round(lerp(22, 28, back)), { glow: dark, rimDir: dark ? [0, -1] : null });
  }, { light: dark ? { amb: 0.12, lights: [] } : LAMP_LIGHT(84, 16) });
  subsNow({ y: 1330 });
}
// 5 — the payoff: an extreme close-up of the reflection's stare and grin in the dark; the glass cracks on the hit
function sceneGrinXCU() {
  const k = Math.round((TT - E0) * 12), shake = k < 3 ? [[3, -2], [-2, 1], [1, 1]][k] : [0, 0];
  obScene(() => {
    obRect(-2, -2, 184, 324, K);
    obPerson(90, 116, 70, { stare: 1, smile: 1, key: 'refl', shade: -1, glow: true, rimDir: [-1, 0], shadowInk: K });
    // the crack: jagged lines from a point beside the eye, white edged, emissive (they catch what light there is)
    const R = RNG('crack');
    for (let i = 0; i < 6; i++) {
      let x = 138, y = 64, a = i / 8 * TAU + R.r(-0.3, 0.3); const P = [[x, y]];
      for (let j = 0; j < 7; j++) { x += Math.cos(a) * R.r(8, 18); y += Math.sin(a) * R.r(8, 18); a += R.r(-0.5, 0.5); P.push([x, y]); }
      obInk((g) => obPoly(g, P, false), 1, K, { rim: WH, rimEmit: true });
    }
    obInk((g) => { for (let i = 0; i < 3; i++) { g.moveTo(120 + i * 18, 40 + i * 6); g.arc(138, 64, 16 + i * 14, -2.6 + i * 0.4, -1.7 + i * 0.5); } }, 1, WH, { emit: true, thr: 0.5 });
  }, { bg: K, shake, light: { amb: 0.3, lights: [{ x: 120, y: 120, r0: 130, r1: 260, p: 1.2 }] } });
  subsNow({ y: 1360 });
}

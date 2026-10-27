// =====================================================================
//  s06 — 120–136 · PICKLES (the twist), the run across the roofs, train car 9.
//  "One voice. Old. Tired. Grumpy." → three cat-part close-ups → Pickles on the moonlit roof (hero). The flashback
//  (fair, warm memory tint), Pickles' long line as cutaways (kitten, yard, car 9, Lily cold/scared, the hat), the run
//  (Kai, Mom, police, Pickles roof to roof), car 9: the "9", the yellow coat, the balloon, Lily.
//  Sets: SET_roofs, SET_alley, SET_fair, SET_street, SET_police, SET_trainYard + s06_moonSet (the hero roof).
//  Every shot cues on the voice (CUT / VW / VWE / LT / LE). Helpers are s06_*.
// =====================================================================
const s06_E = (lt, a, d = 5 / 24) => EZ.o3(clamp((lt - a) / d));            // a 5-frame gesture that stops hard
const s06_mv = (lt, dur, a, b, ez = EZ.io) => { const u = ez(clamp(lt / dur)); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };
const s06_PK = { ...CATS.pickles, key: 'pickles' };
// actors with their cast shadow
function s06_man(who, x, y, h, o = {}) { if (o.shadow !== false) ivCastShadow(x, y, h); return ivMan({ who, x, y, h, blinkKey: 's06', ...o }); }
function s06_cat(o) { if (o.shadow !== false) ivCastShadow(o.x, o.y, o.s * 0.9, { w: 0.4, len: 0.7, a: 0.3 }); return ivCat({ coat: s06_PK, ...o }); }
// a run: ivWalk with fewer frames per step, a forward lean and pumping arms (always to the right, f > 0)
function s06_run(t0, x0, h, fps = 3, until = 1e9) {
  const w = ivWalk(t0, x0, h, 1, fps, until), p = w.pose;
  return { x: w.x, pose: { ...p, hL: [p.hL[0] * 2.4 + 0.05, 0.17], hR: [p.hR[0] * 2.4 + 0.05, 0.17], lean: 0.2, bob: (p.bob || 0) * 2 } };
}
// the warm memory tint (flashback): desaturate, warm, soft bright edges
function s06_memory(a = 1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.55 * a})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,214,160,${0.55 * a})`; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(255,230,190,0)'); g.addColorStop(1, `rgba(255,228,186,${0.32 * a})`);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
// a point along SET_roofs' run path at distance d px (with the slope angle) — Pickles running roof to roof
function s06_pathAt(d) {
  const P = SET_POS2.roofs.path; let acc = 0;
  for (let i = 0; i < P.length - 1; i++) { const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
    if (acc + L >= d || i === P.length - 2) { const u = clamp((d - acc) / L); return [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u), Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0])]; }
    acc += L; }
}
// the hero roof: Pickles on a parapet against a huge moon. Pickles sits at SP (base frame), s 520; o.act draws on d 1
const s06_SP = [960, 915];
function s06_moonSet(o = {}) {
  IV_M = { ...IV_MOOD.extRoofs, rim: '#e4ecff', key: [0.35, -0.85], vig: 0.66 };
  const moon = o.moon || [905, 470];
  return [
    { d: 6, draw: () => {
      ctx.fillStyle = ivVGrad(-600, 1300, ['#03050c', '#0b1430', '#1c2850', '#2a3660']); ctx.fillRect(-2500, -1500, 7000, 4000);
      const r = RNG('s06st').f; for (let i = 0; i < 160; i++) { const x = -900 + r() * 3700, y = -500 + r() * 1100, tw = 0.5 + 0.5 * Math.sin(TT * (1 + r() * 2) + i); ivDot(x, y, 1 + r() * 2.2, `rgba(230,236,255,${0.25 + 0.5 * tw * r()})`); }
      ivGlow(moon[0], moon[1], 900, 'rgba(150,175,255,0.35)'); ivGlow(moon[0], moon[1], 420, 'rgba(220,230,255,0.45)');
      ivDot(moon[0], moon[1], 250, '#eef0f6');
      ctx.save(); ctx.beginPath(); ctx.arc(moon[0], moon[1], 250, 0, TAU); ctx.clip();
      for (const [dx, dy, rr] of [[-80, -60, 60], [70, 40, 46], [-20, 110, 34], [110, -100, 28], [-140, 70, 24]]) ivDot(moon[0] + dx, moon[1] + dy, rr, 'rgba(160,170,200,0.28)');
      const g = ctx.createRadialGradient(moon[0] - 90, moon[1] - 90, 40, moon[0], moon[1], 260); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,130,170,0.35)'); ctx.fillStyle = g; ctx.fillRect(moon[0] - 260, moon[1] - 260, 520, 520); ctx.restore();
      for (let i = 0; i < 3; i++) { const cx = mod(TT * (14 + i * 6) + i * 900, 3000) - 700, cy = 250 + i * 150; ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = 'rgba(40,52,95,0.8)'; ctx.beginPath(); ctx.ellipse(cx, cy, 380, 34, 0, 0, TAU); ctx.ellipse(cx + 160, cy - 18, 220, 30, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    } },
    { d: 2.6, draw: () => {
      const r = RNG('s06sk').f, vp = [960, 470];
      for (let i = 0; i < 14; i++) { const x = -1400 + i * 330 + r() * 80, w = 260 + r() * 120, top = 640 + r() * 260, c = ['#0e1328', '#121831', '#0b1022'][i % 3];
        ivBox(x, top, w, 1400 - top, 0.08, vp, { front: c, top: ivShade(c, 0.12), side: ivShade(c, -0.2), line: 'rgba(160,180,255,0.25)' });
        for (let wy = top + 40; wy < 1300; wy += 70) for (let wx = x + 30; wx < x + w - 40; wx += 60) if (r() < 0.22) ivRR(wx, wy, 26, 36, 3, r() < 0.7 ? '#e8a85a' : '#8fb0e8');
        if (r() < 0.4) { ivLine(x + w * 0.6, top, x + w * 0.6, top - 160, 4, '#070a16'); ivLine(x + w * 0.6 - 50, top - 110, x + w * 0.6 + 50, top - 110, 3, '#070a16'); if (Math.sin(TT * 2.2 + i) > 0.3) ivDot(x + w * 0.6, top - 160, 5, '#ff4a3a'); }
        if (i % 4 === 1) ivCat({ x: x + w * 0.3, y: top + 4, s: 46, f: i % 2 ? 1 : -1, coat: { ...IV_COATS.black, key: 's06sc' + i }, pose: 'sit' }); }
      ext_fog(980, 140, 'rgba(120,140,200,0.5)', 0.22, 's06fog', 8);
    } },
    { d: 1, draw: () => {
      const vp = [960, 420];
      ivBox(-900, 930, 3800, 400, 0.14, vp, { front: '#262c46', top: '#3a4366', side: '#1c2136', line: 'rgba(200,215,255,0.55)' });
      for (let y = 970; y < 1300; y += 44) ivLine(-900, y, 2900, y, 2, 'rgba(0,0,0,0.22)', 'butt');
      for (let k = 0, y = 930; y < 1300; y += 44, k++) for (let x = -900 + (k % 2) * 60; x < 2900; x += 120) ivLine(x, y, x, y + 44, 2, 'rgba(0,0,0,0.16)', 'butt');
      ivLightPool([[-900, 930], [2900, 930], [2900, 870], [-900, 870]], 'rgba(170,190,255,0.06)');
      o.act && o.act();
    } },
    ...(o.fg === false ? [] : [{ d: 0.55, draw: () => {
      ivLine(-120, 1400, -40, 200, 16, '#04050b'); for (let i = 0; i < 4; i++) ivLine(-260, 300 + i * 70, 260 - i * 40, 300 + i * 70, 9, '#04050b');
      ivLine(-300, 160, 2600, 250, 4, '#04050b'); ivLine(-300, 190, 2600, 300, 3, '#04050b');
    } }]),
  ];
}
// Pickles on the hero roof (o: expr, talk, look, s, x, y, pose)
const s06_heroCat = (o = {}) => s06_cat({ x: s06_SP[0], y: s06_SP[1], s: 520, f: -1, pose: 'sit', ...o });

// ---------------------------------------------------------------------
//  120 "And then, one voice." — the roofs at night, a slow track across; a ring of sound from one dark roof
// ---------------------------------------------------------------------
SHOT(CUT('120-narrator'), 's06_oneVoice', (lt, S) => {
  s06_mv(lt, S.t1 - S.t0, [640, 520, 1.08], [980, 500, 1.24]);
  const tv = VW('120-narrator', 'one') - S.t0;
  ivStage(SET_roofs({ cats: 34, from: [1500, 700], act: () => {
    if (lt > tv) P_soundRings(1560, 830, 260, clamp((lt - tv) / 1.6), { n: 3, col: '#ffd9a0', a: 0.8 });
    ivCastShadow(1560, 900, 120, { w: 0.4, len: 0.7, a: 0.3 }); ivCat({ x: 1560, y: 900, s: 120, f: -1, coat: { ...s06_PK, col: '#1a1820', col2: '#121018', pattern: 'plain', eye: '#c9e05a' }, pose: 'sit' });
  } }));
}, { sec: 's06', title: '120 one voice from the roofs' });
{ const t0 = CUT('120-narrator'); SFX(t0, 'whoosh', 0.7); SFX(VW('120-narrator', 'one'), 'rise', 0.45, 0.6, 1.6); }

// 121 "Old." — the muzzle: grey-tipped whiskers, moonlit
SHOT(CUT('121-narrator'), 's06_old', (lt, S) => {
  IV_CAM = { x: 800, y: 660, z: 3.9 * ivPush(S.t0, 0.04, 1.2) };
  ivStage(s06_moonSet({ fg: false, act: () => s06_heroCat({ expr: { eyes: 'half' } }) }));
}, { sec: 's06', title: '121 old: the whiskers' });
SFX(CUT('121-narrator'), 'cloth', 0.45, -0.2);

// 122 "Tired." — the ears against the moon, the lids sinking
SHOT(CUT('122-narrator'), 's06_tired', (lt, S) => {
  IV_CAM = { x: 860, y: 445, z: 3.3 };
  const u = EZ.io(clamp(lt / 0.9));
  ivStage(s06_moonSet({ fg: false, moon: [880, 380], act: () => s06_heroCat({ expr: { eyes: 'open', blink: lerp(0.25, 0.62, u) } }) }));
}, { sec: 's06', title: '122 tired: ears, heavy lids' });
SFX(CUT('122-narrator') + 0.1, 'swish', 0.3, -0.1); SFX(CUT('122-narrator') + 0.5, 'cloth', 0.3);

// 123 "Grumpy." — the eyes: half → angry on the word, a low grumble
SHOT(CUT('123-narrator'), 's06_grumpy', (lt, S) => {
  IV_CAM = { x: 846, y: 548, z: 5.6 };
  const u = s06_E(lt, VW('123-narrator', 'grumpy') - S.t0 + 0.05, 4 / 24);
  ivStage(s06_moonSet({ fg: false, act: () => s06_heroCat({ expr: u > 0.5 ? { eyes: 'angry' } : { eyes: 'open', blink: 0.5 }, look: [-0.6, 0.1] }) }));
}, { sec: 's06', title: '123 grumpy: the eye narrows' });
SFX(VW('123-narrator', 'grumpy') + 0.05, 'tick', 0.5); SFX(VW('123-narrator', 'grumpy') + 0.45, 'gasp', 0.3);

// ---------------------------------------------------------------------
//  124 Pickles: "Took you long enough." — THE REVEAL: Pickles on the parapet against a huge moon, talking
// ---------------------------------------------------------------------
SHOT(CUT('124-pickles'), 's06_reveal', (lt, S) => {
  IV_CAM = { x: 940, y: 610, z: 1.32 * ivPush(S.t0, 0.06, 1.9) };
  ivStage(s06_moonSet({ act: () => s06_heroCat({ expr: { eyes: 'half' }, talk: '124-pickles', look: [-0.5, 0.4] }) }));
}, { sec: 's06', title: '124 HERO: Pickles on the roof, the moon' });
SFX(CUT('124-pickles'), 'whoosh', 0.8); SFX(CUT('124-pickles') + 0.05, 'shimmer', 0.45, 0, 1.4);

// 125 "Pickles." — Kai in the alley looks up: wide → a smile of relief
SHOT(CUT('125-narrator'), 's06_kaiUp', (lt, S) => {
  IV_CAM = { x: 580, y: 430, z: 2.1 };
  const u = s06_E(lt, 0.45);
  ivStage(SET_alley({ cats: 40, act: () => s06_man(CAST.kai, 520, GROUND, 520, { f: 0.35, pose: ivPose('relaxed', { tilt: -0.15 }), expr: { eyes: u > 0.5 ? 'happy' : 'wide', mouth: u > 0.5 ? 'smile' : 'o', look: [0.4, -1] } }) }));
}, { sec: 's06', title: '125 Pickles! — your face' });
SFX(CUT('125-narrator') + 0.1, 'gasp', 0.45, -0.3); SFX(CUT('125-narrator') + 0.5, 'cloth', 0.4, -0.3);

// 126 "On the rooftop." — a crane down the roofs onto Pickles, small, sitting on the edge
SHOT(CUT('126-narrator'), 's06_onRoof', (lt, S) => {
  s06_mv(lt, S.t1 - S.t0, [1380, 300, 1.32], [1300, 560, 1.12]);
  ivStage(SET_roofs({ cats: 24, from: [1480, 860], act: () => s06_cat({ x: 1480, y: 900, s: 160, f: -1, pose: 'sit', expr: { eyes: 'half' } }) }));
}, { sec: 's06', title: '126 on the rooftop (crane down)' });
SFX(CUT('126-narrator'), 'swish', 0.6, 0.3); SFX(CUT('126-narrator') + 0.8, 'cloth', 0.3, 0.4);

// 127a "Fourteen years old," — Pickles in profile on the parapet; "14" counts up and lands on the word
SHOT(CUT('127-narrator'), 's06_fourteen', (lt, S) => {
  IV_CAM = { x: 1130, y: 560, z: 1.45 };
  ivStage(s06_moonSet({ moon: [1180, 360], act: () => s06_heroCat({ expr: { eyes: 'half' }, look: [-1, 0] }) }));
  const t1 = VWE('127-narrator', 'fourteen'), a = ivPop(S.t0 + 0.1), n = ivCount(S.t0 + 0.1, t1, 0, 14);
  ctx.save(); ctx.globalAlpha = a; ivText(String(n), 1560, 600, 230, '#ffe2b0', { glow: 'rgba(255,160,80,0.55)' }); ctx.restore();
  ivTag('YEARS OLD', 1560, 690, 34, ivPop(VW('127-narrator', 'years')));
}, { sec: 's06', title: '127 fourteen years old' });
SFX(CUT('127-narrator') + 0.1, 'pop', 0.6, 0.4); SFX(VWE('127-narrator', 'fourteen'), 'blip', 0.5, 0.4); SFX(VW('127-narrator', 'years'), 'pop', 0.4, 0.4);

// ---------------------------------------------------------------------
//  127b "…and he has followed her since the fair" — FLASHBACK (warm memory tint): low through the crowd's legs,
//  Pickles slips between them after the yellow coat; then the fair wide, Lily with the red balloon, Pickles behind
// ---------------------------------------------------------------------
const s06_legs = [[-360, CAST.extraA, 0.3], [-60, CAST.kidB, 0.5], [260, CAST.extraC, 0.4], [520, CAST.extraB, 0.35]];
SHOT(CUT('127-narrator', 'followed'), 's06_legsFlash', (lt, S) => {
  const px = 640 + 420 * lt;
  IV_CAM = { x: px + 260, y: 760, z: 1.9 };
  ivStage(SET_fair({ t: 'dusk', fg: false, act: () => {
    const lw = ivWalk(S.t0 - 2, px + 560, 322, 1, 6); s06_man(CAST.lily, lw.x, GROUND, 322, { f: 0.6, pose: lw.pose, expr: { eyes: 'happy', mouth: 'smile' } });
    s06_legs.forEach(([dx, who, f], i) => { if (i === 2) return; const w = ivWalk(S.t0 - i, px + dx, 520, 1, 7); s06_man(who, w.x, GROUND, 520, { f, pose: w.pose }); });
    s06_cat({ x: px, y: GROUND, s: 130, f: 1, pose: 'walk', phase: lt * 6, expr: { eyes: 'half' }, look: [1, 0] });
    const w = ivWalk(S.t0 - 2, px + s06_legs[2][0], 520, 1, 7); s06_man(s06_legs[2][1], w.x, GROUND, 520, { f: 0.4, pose: w.pose });
  } }));
  s06_memory();
}, { sec: 's06', title: '127 flashback: through the legs' });
{ const t0 = CUT('127-narrator', 'followed'); SFX(t0, 'whoosh', 0.55); SFX(t0 + 0.05, 'crowd', 0.35, 0, 2.4); SFX(t0 + 0.35, 'step', 0.4, -0.2); }

SHOT(CUT('127-narrator', 'since'), 's06_fairFlash', (lt, S) => {
  IV_CAM = { x: 960, y: 560, z: 1.02 * ivPush(S.t0, 0.1, 1.9) };
  ivStage(SET_fair({ t: 'dusk', fg: false, act: () => {
    const lw = ivWalk(S.t0, 980, 322, 1, 7); s06_man(CAST.lily, lw.x, GROUND, 322, { f: 0.35, pose: { ...lw.pose, hR: [0.06, 0.1] }, expr: { eyes: 'happy', mouth: 'smile' },
      grip: { front: 'hold' }, hold: { front: (x, y) => P_balloon(x, y + 4, 0.75, { key: 'lilyB' }) } });
    s06_cat({ x: 700 + 230 * lt, y: GROUND, s: 120, f: 1, pose: 'walk', expr: { eyes: 'half' }, look: [1, 0] });
  } }));
  s06_memory();
}, { sec: 's06', title: '127 flashback: the fair, Pickles follows' });
SFX(CUT('127-narrator', 'since') + 0.2, 'step', 0.35, -0.3); SFX(CUT('127-narrator', 'since') + 0.9, 'laugh', 0.25, 0.4);

// ---------------------------------------------------------------------
//  128 Pickles: "She chased a kitten into the old train yard. She's in a broken train car. She's cold. She's scared.
//  And she won't stop talking to me about hats." — a cutaway per clause
// ---------------------------------------------------------------------
SHOT(CUT('128-pickles'), 's06_kitten', (lt, S) => {
  const kx = 760 + 820 * lt, r = s06_run(S.t0 + 0.2, 380, 322, 3);
  IV_CAM = { x: Math.max(860, r.x + 260), y: 600, z: 1.25 };
  ivStage(SET_street({ t: 'dusk', act: () => {
    s06_cat({ x: kx, y: GROUND, s: 80, f: 1, coat: { ...IV_COATS.kitten, key: 's06kit' }, pose: 'walk', phase: lt * 10, expr: { eyes: 'wide' } });
    s06_man(CAST.lily, r.x, GROUND, 322, { f: 0.6, pose: { ...r.pose, hR: [0.12, -0.1] }, expr: { eyes: 'happy', mouth: 'open' },
      grip: { front: 'hold' }, hold: { front: (x, y) => P_balloon(x, y + 4, 0.75, { key: 'lilyB', sway: -0.25 }) } });
    s06_cat({ x: r.x - 330, y: GROUND, s: 120, f: 1, pose: 'walk', phase: lt * 8, expr: { eyes: 'angry' } });
  } }));
  s06_memory(0.85);
}, { sec: 's06', title: '128 she chased a kitten' });
{ const t0 = CUT('128-pickles'); SFX(t0, 'swish', 0.5); for (let k = 0; k < 3; k++) SFX(t0 + 0.3 + k * 0.5, 'step', 0.4, -0.3 + k * 0.3); SFX(t0 + 0.55, 'laugh', 0.3, 0); }

SHOT(CUT('128-pickles', 'old'), 's06_yard', (lt, S) => {
  s06_mv(lt, S.t1 - S.t0 + 0.4, [700, 520, 1.0], [1080, 470, 1.32]);
  ivStage(SET_trainYard({ door: 0.12, act: () => {
    const kx = 300 + 700 * lt; s06_cat({ x: kx, y: 960, s: 70, f: 1, coat: { ...IV_COATS.kitten, key: 's06kit' }, pose: 'walk', phase: lt * 10 });
  } }));
}, { sec: 's06', title: '128 the old train yard (dolly in)' });
SFX(CUT('128-pickles', 'old'), 'whoosh', 0.6); SFX(CUT('128-pickles', 'old') + 0.3, 'horn', 0.2, -0.6); SFX(CUT('128-pickles', 'old') + 1.0, 'metal', 0.35, 0.4);

SHOT(CUT('128-pickles', 'broken'), 's06_brokenCar', (lt, S) => {
  IV_CAM = { x: 1420, y: 420, z: 1.9 * ivPush(S.t0, 0.04, 1.5) };
  ivStage(SET_trainYard({ door: 0.28, inside: () => { const C9 = SET_POS2.trainYard.car9; ivGlow(C9.door[0] + 30, C9.door[3] - 60, 90, 'rgba(242,194,48,0.25)'); } }));
}, { sec: 's06', title: '128 a broken train car' });
SFX(CUT('128-pickles', 'broken') + 0.1, 'metal', 0.45, 0.3); SFX(CUT('128-pickles', 'broken') + 0.8, 'drip', 0.3, 0.3);

// the inside of car 9: a boxcar interior in perspective, moonlight through the open door on the right
function s06_carInside(o = {}) {
  IV_M = { ...IV_MOOD.extYard, key: [0.8, -0.4] };
  return [
    { d: 2.2, draw: () => {
      const R = ivRoom({ back: [460, 250, 1460, 780], vp: [960, 520], wall: '#3a2420', side: '#2c1a17', sideR: '#331e1a', floor: '#2a1c18', ceil: '#1c1210', planks: 12, plankCol: 'rgba(0,0,0,0.3)', front: 2.4 });
      for (let i = 1; i < 12; i++) { const x = lerp(460, 1460, i / 12); ivLine(x, 250, x, 780, 2, 'rgba(0,0,0,0.25)', 'butt'); }
      for (let i = 1; i < 8; i++) { ivLine(...R.L(i / 8, 0), ...R.L(i / 8, 1), 3, 'rgba(0,0,0,0.25)', 'butt'); }
      ivQuad(R.R, 0.45, 0.85, 0.05, 0.85, '#0c1226'); ivQuad(R.R, 0.47, 0.83, 0.07, 0.83, 'rgba(120,150,230,0.35)');   // the door: moonlit night
      const a = R.R(0.47, 0.83), b = R.R(0.83, 0.83); ivRays([a, b], [R.F(0.55, 0.2), R.F(0.95, 0.55)], { n: 4, a: 0.16, col: [190, 210, 255] });
      ivLightPool([R.F(0.5, 0.3), R.F(0.6, 0.85), R.F(0.95, 0.85), R.F(0.9, 0.2)], 'rgba(150,175,255,0.12)');
      ivBox(520, 640, 220, 140, 0.12, [960, 520], { front: '#5a4030', top: '#6e5040', side: '#3e2a20' });   // a crate
      const r = RNG('s06hay').f; for (let i = 0; i < 40; i++) { const p = R.F(0.1 + r() * 0.8, r() * 0.5); ivLine(p[0], p[1], p[0] + (r() - 0.5) * 40, p[1] - r() * 10, 2, 'rgba(200,170,90,0.35)'); }
    } },
    { d: 1, draw: () => { o.act && o.act(); } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { ivRR(-200, -200, 260, 1600, 0, '#120a08'); ivRR(1880, -200, 300, 1600, 0, '#120a08'); } }]),
  ];
}
// a small crate/hay bale Lily sits on (her hip at y - 0.31 h)
function s06_seat(x, y, h) { const top = y - h * 0.3; ivCastShadow(x, y, h * 0.5, { a: 0.3 }); ivBox(x - h * 0.2, top, h * 0.34, y - top, 0.1, [960, 520], { front: '#7a5a34', top: '#a08048', side: '#5a4024' }); ivLine(x - h * 0.2, top + (y - top) * 0.5, x + h * 0.14, top + (y - top) * 0.5, 2, 'rgba(0,0,0,0.25)'); }
const s06_lilySit = (x, o = {}) => (s06_seat(x, GROUND, 322), s06_man(CAST.lily, x, GROUND, 322, { f: 0.5, pose: ivPose('sit', { hL: [0.17, 0.2], hR: [0.21, 0.19], tilt: 0.12, ...(o.mix || {}) }), ...o }));

SHOT(CUT('128-pickles', 'cold'), 's06_coldScared', (lt, S) => {
  IV_CAM = { x: 880, y: 700, z: 2.6 * ivPush(S.t0, 0.05, 1.2) };
  const sc = VW('128-pickles', 'scared') - S.t0, u = s06_E(lt, sc), jit = Math.sin(TT * 70) * 1.6;
  ivStage(s06_carInside({ act: () => {
    s06_lilySit(860 + jit, { f: 0.45, expr: u > 0.5 ? { eyes: 'wide', mouth: 'o', look: [1, -0.3] } : { eyes: 'sad', mouth: 'frown', brow: 'sad' } });
    for (let i = 0; i < 2; i++) { const p = mod(lt * 0.9 + i * 0.5, 1); ivGlow(905 + p * 40, 640 - p * 50, 22 + p * 30, `rgba(220,230,255,${0.35 * (1 - p)})`); }
  } }));
}, { sec: 's06', title: "128 she's cold, she's scared" });
SFX(CUT('128-pickles', 'cold') + 0.1, 'cloth', 0.4); SFX(VW('128-pickles', 'scared') - 0.05, 'metal', 0.35, 0.6); SFX(VW('128-pickles', 'scared') + 0.1, 'gasp', 0.35);

SHOT(CUT('128-pickles', 'and'), 's06_hats', (lt, S) => {
  IV_CAM = { x: 980, y: 700, z: 2.4 };
  const th = VW('128-pickles', 'hats') - S.t0 - 0.3, u = EZ.io(clamp((lt - th) / (7 / 24)));
  ivStage(s06_carInside({ act: () => {
    const chat = Math.floor(F / 4) % 2 && lt < th, give = s06_E(lt, th - 0.2, 4 / 24);
    const L = s06_lilySit(840, { f: 0.5, mix: ivPoseMix({ hR: [0.24, 0.12] }, { hR: [0.32, -0.05] }, give), expr: { eyes: 'happy', mouth: chat ? 'open' : 'grin' }, grip: { R: 'hold', front: 'hold' } });
    const pk = s06_cat({ x: 1120, y: GROUND, s: 150, f: -1, pose: 'loaf', expr: { eyes: 'half' }, look: [-0.6, 0] });
    const hand = L.handR, top = [pk.head[0] + 2, pk.head[1] - pk.r * 0.75];
    P_catHat(lerp(hand[0] + 6, top[0], u), lerp(hand[1] - 4, top[1], u), 0.62, { ang: lerp(-0.5, 0.18, u) });
  } }));
}, { sec: 's06', title: '128 …about hats (the hat lands on Pickles)' });
{ const t0 = CUT('128-pickles', 'and'); SFX(t0 + 0.2, 'paper', 0.5, -0.2); SFX(t0 + 1.4, 'paper', 0.4, -0.2); SFX(VW('128-pickles', 'hats') - 0.3 + 7 / 24, 'pop', 0.6, 0.2); SFX(VW('128-pickles', 'hats') + 0.3, 'cloth', 0.3, 0.2); }

// [BEAT] — your face in the alley: the decision (wide → determined, turning to run)
SHOT(LE('128-pickles') + 0.15, 's06_decide', (lt, S) => {
  IV_CAM = { x: 540, y: 450, z: 2.9 };
  const u = s06_E(lt, 0.7);
  ivStage(SET_alley({ cats: 40, act: () => s06_man(CAST.kai, 520, GROUND, 520, { f: lerp(0.2, 0.75, u), pose: ivPose('relaxed', { hL: [-0.04, 0.27], hR: [0.05, 0.26] }),
    expr: u > 0.5 ? { eyes: 'squint', mouth: 'flat', brow: 'angry' } : { eyes: 'wide', mouth: 'o', look: [0.3, -0.8] }, grip: u > 0.5 ? { L: 'fist', R: 'fist' } : undefined }) }));
}, { sec: 's06', title: '[beat] you decide' });
SFX(LE('128-pickles') + 0.85, 'swish', 0.6); SFX(LE('128-pickles') + 1.0, 'cloth', 0.5);

// ---------------------------------------------------------------------
//  129–132 THE RUN — you, Mom, the police (to the right, toward the yard), Pickles roof to roof. Fast cuts, tracking.
// ---------------------------------------------------------------------
SHOT(CUT('129-narrator'), 's06_youRun', (lt, S) => {
  const r = s06_run(S.t0 - 0.1, 60, 520, 3);
  IV_CAM = { x: clamp(r.x + 80, 700, 1400), y: 540, z: 1.2 };
  ivStage(SET_street({ t: 'night', cats: true, act: () => s06_man(CAST.kai, r.x, GROUND, 520, { f: 0.75, pose: r.pose, expr: { eyes: 'squint', mouth: 'open', brow: 'angry' } }) }));
}, { sec: 's06', title: '129 you run' });
{ const t0 = CUT('129-narrator'); SFX(t0, 'whoosh', 0.9); for (let k = 1; k <= 3; k++) SFX(t0 + k * 0.32, 'step', 0.55, -0.6 + k * 0.4); }

SHOT(CUT('130-narrator'), 's06_momRuns', (lt, S) => {
  const r = s06_run(S.t0 - 0.2, 380, 540, 3);
  IV_CAM = { x: r.x + 120, y: 520, z: 1.6 };
  ivStage(SET_police({ lights: 0.7, act: () => s06_man(CAST.mom, r.x, GROUND, 540, { f: 0.7, pose: { ...r.pose, hR: [0.1, 0.06] }, expr: { eyes: 'wide', mouth: 'open', brow: 'sad' },
    grip: { front: 'hold' }, hold: { front: (x, y, a, h) => P_phone(x, y - 8, h / 520 * 0.9, { glow: 1 }) } }) }));
}, { sec: 's06', title: '130 Mom runs' });
{ const t0 = CUT('130-narrator'); SFX(t0, 'swish', 0.6); for (let k = 1; k <= 3; k++) SFX(t0 + k * 0.3, 'step', 0.5, 0); SFX(t0 + 0.5, 'cloth', 0.35); }

SHOT(CUT('131-narrator'), 's06_policeRun', (lt, S) => {
  IV_CAM = { x: clamp(s06_run(S.t0 + 0.15, 560, 540, 3).x, 800, 1500), y: 520, z: 1.3 };
  ivStage(SET_police({ lights: 1, act: () => {
    [[260, -0.1], [760, 0]].forEach(([x0, dt], i) => { const r = s06_run(S.t0 + 0.15 + dt, x0, 540, 3);
      s06_man(CAST.cop, r.x, GROUND, 540, { f: 0.7, pose: i ? { ...r.pose, hR: [0.3, -0.05] } : r.pose, expr: { eyes: 'squint', mouth: 'flat' }, blinkKey: 'cop' + i }); });
  } }));
}, { sec: 's06', title: '131 the police run' });
{ const t0 = CUT('131-narrator'); SFX(t0 + 0.05, 'door', 0.7, -0.5); SFX(t0 + 0.45, 'step', 0.5, -0.2); SFX(t0 + 0.9, 'step', 0.5, 0.3); SFX(t0 + 0.2, 'engine', 0.3, -0.4, 1.2); }

// Pickles along SET_roofs' path: distance of path point i (for timing jumps)
function s06_pathD(i) { const P = SET_POS2.roofs.path; let d = 0; for (let k = 0; k < i; k++) d += Math.hypot(P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]); return d; }
const s06_pkRun = (d, lt, o = {}) => { const [x, y, a] = s06_pathAt(d), air = Math.abs(a) > 0.08;
  if (!air) ivCastShadow(x, y, 120, { w: 0.4, len: 0.7, a: 0.3 });
  return ivCat({ x, y, s: o.s || 150, f: 1, coat: s06_PK, pose: air ? 'stand' : 'walk', phase: lt * 10, rot: air ? a * 0.8 : 0, expr: { eyes: 'angry' }, arch: air ? -6 : 0 }); };

SHOT(CUT('132-narrator'), 's06_pkLeads', (lt, S) => {
  const d = s06_pathD(1) + 980 * lt, x = s06_pathAt(d)[0];
  IV_CAM = { x: x + 220, y: 690, z: 1.4 };
  ivStage(SET_roofs({ cats: 30, from: [1200, 250], act: () => s06_pkRun(d, lt) }));
}, { sec: 's06', title: '132 Pickles leads the way (tracking)' });
{ const t0 = CUT('132-narrator'), v = 980, j = (s06_pathD(4) - s06_pathD(1)) / v, l = (s06_pathD(6) - s06_pathD(1)) / v;
  SFX(t0, 'whoosh', 0.7); SFX(t0 + 0.2, 'step', 0.4, -0.2); SFX(t0 + j - 0.1, 'swish', 0.5); SFX(t0 + l, 'thud', 0.6, 0.2); }

SHOT(CUT('132-narrator', 'roof'), 's06_jump', (lt, S) => {
  const tA = VW('132-narrator', 'roof', 2) - S.t0, d = s06_pathD(11) + 620 * (lt - tA);
  s06_mv(lt, S.t1 - S.t0, [1880, 650, 1.75], [2200, 630, 1.8]);
  ivStage(SET_roofs({ cats: 30, from: [2000, 250], act: () => s06_pkRun(d, lt, { s: 160 }) }));
}, { sec: 's06', title: '132 roof by roof: the jump' });
{ const tA = VW('132-narrator', 'roof', 2); SFX(tA - (s06_pathD(11) - s06_pathD(10)) / 620, 'swish', 0.6, -0.2); SFX(tA + (s06_pathD(13) - s06_pathD(11)) / 620, 'thud', 0.7, 0.2); SFX(tA + 0.6, 'step', 0.4, 0.4); SFX(tA + 0.85, 'step', 0.35, 0.5); }

// ---------------------------------------------------------------------
//  133–136 CAR 9 — the yard, the "9", the yellow coat, the balloon on the door, Lily
// ---------------------------------------------------------------------
const s06_C9 = SET_POS2.trainYard.car9, s06_DX = (s06_C9.door[0] + s06_C9.door[2]) / 2, s06_LH = 0.62 * 520 / s06_C9.D;
// a flashlight pool on the car (screen-additive, drawn in the set's front pass)
const s06_torch = (x, y, r, a = 1) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,240,200,${0.32 * a})`); g.addColorStop(0.7, `rgba(255,230,180,${0.12 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };

SHOT(CUT('133-narrator'), 's06_yardArrive', (lt, S) => {
  s06_mv(lt, S.t1 - S.t0 + 0.3, [900, 540, 1.0], [1240, 480, 1.3]);
  const r = s06_run(S.t0 - 0.2, -200, 520, 3, S.t0 + 0.55), stop = TT > S.t0 + 0.55;
  ivStage(SET_trainYard({ door: 0, act: () => {
    s06_cat({ x: 1060, y: 930, s: 150, f: 1, pose: 'sit', expr: { eyes: 'half' }, look: [1, -0.5] });
    s06_man(CAST.kai, r.x, GROUND, 520, { f: 0.6, pose: stop ? ivPose('relaxed', { lean: 0.08 }) : r.pose, expr: { eyes: 'wide', mouth: 'open', look: [1, -0.4] } });
  } }));
}, { sec: 's06', title: '133 train car… (push in)' });
SFX(CUT('133-narrator'), 'whoosh', 0.7); SFX(CUT('133-narrator') + 0.25, 'step', 0.5, -0.5); SFX(CUT('133-narrator') + 0.6, 'slide', 0.4, -0.3);

SHOT(CUT('133-narrator', 'nine'), 's06_nine', (lt, S) => {
  IV_CAM = { x: 1700, y: 360, z: 3.0 * ivPush(S.t0, 0.04, 1) };
  const u = EZ.o3(clamp(lt / 0.25));
  ivStage(SET_trainYard({ door: 0, fg: false, front: () => s06_torch(lerp(1480, 1715, u), lerp(420, 352, u), 230, 0.4 + 0.6 * u) }));
}, { sec: 's06', title: '133 NINE (the number, a torch lands on it)' });
SFX(VW('133-narrator', 'nine'), 'impact', 0.7, 0.4); SFX(VW('133-narrator', 'nine') + 0.05, 'click', 0.4, 0.4);

SHOT(CUT('134-narrator', 'small'), 's06_coat', (lt, S) => {
  IV_CAM = { x: 1330, y: 480, z: 2.7 * ivPush(S.t0, 0.06, 1.6) };
  ivStage(SET_trainYard({ door: 0.42, fg: false, inside: () => { s06_torch(1320, 560, 140, 0.8); s06_seat(1330, s06_C9.floor, s06_LH);
    ivMan({ who: CAST.lily, x: 1330, y: s06_C9.floor, h: s06_LH, f: 0.2, pose: ivPose('sit', { hL: [0.17, 0.2], hR: [0.21, 0.19], tilt: 0.35, lean: 0.15 }), expr: { eyes: 'closed', mouth: 'flat' }, blinkKey: 'lilyC' }); },
    front: () => s06_torch(1300, 520, 220, 0.5) }));
}, { sec: 's06', title: '134 a small yellow coat (in the gap)' });
SFX(CUT('134-narrator', 'small') + 0.1, 'click', 0.35, 0.3); SFX(VW('134-narrator', 'yellow'), 'cloth', 0.45, 0.3); SFX(VW('134-narrator', 'coat') + 0.3, 'metal', 0.25, 0.4);

SHOT(CUT('135-narrator', 'red'), 's06_balloonDoor', (lt, S) => {
  IV_CAM = { x: 1330, y: 470, z: 2.3 };
  const td = VW('135-narrator', 'door') - S.t0 - 0.15, u = EZ.io(clamp((lt - td) / 0.5)), g = s06_E(lt, td - 0.35);
  ivStage(SET_trainYard({ door: lerp(0.42, 1, u), balloon: true, fg: false, inside: () => { s06_seat(1330, s06_C9.floor, s06_LH);
    ivMan({ who: CAST.lily, x: 1330, y: s06_C9.floor, h: s06_LH, f: 0.2, pose: ivPose('sit', { hL: [0.17, 0.2], hR: [0.21, 0.19], tilt: lerp(0.35, 0.05, u), lean: 0.15 }), expr: u > 0.6 ? { eyes: 'wide', mouth: 'o', look: [-1, 0] } : { eyes: 'closed', mouth: 'flat' }, blinkKey: 'lilyC' }); },
    act: () => s06_man(CAST.kai, 1110, GROUND, 520, { f: 0.6, pose: ivPoseMix(ivPose('relaxed'), ivPose('reach', { hR: [0.36, -0.05] }), g), expr: { eyes: 'wide', mouth: 'flat', look: [1, -0.3] }, grip: { R: 'hold', front: 'hold' } }) }));
}, { sec: 's06', title: '135 a red balloon tied to the door — it slides open' });
SFX(VW('135-narrator', 'red'), 'plastic', 0.35, 0.3); SFX(VW('135-narrator', 'tied'), 'cloth', 0.3, 0.2); SFX(VW('135-narrator', 'door') - 0.15, 'slide', 0.9, 0.4); SFX(VW('135-narrator', 'door') + 0.3, 'metal', 0.45, 0.5);

SHOT(CUT('136-lily'), 's06_lilyKai', (lt, S) => {
  IV_CAM = { x: s06_DX - 20, y: 440, z: 2.4 };
  const up = s06_E(lt, 0.0, 5 / 24), hop = Math.max(0, Math.sin(Math.PI * clamp((lt - 0.2) / 0.35))) * 22;
  ivStage(SET_trainYard({ door: 1, balloon: true, fg: false, inside: () => {
    s06_cat({ x: s06_DX + 62, y: s06_C9.floor, s: 112, f: -1, pose: 'sit', expr: { eyes: 'half' }, look: [-1, 0] });
    ivMan({ who: CAST.lily, x: s06_DX - 30, y: s06_C9.floor - hop, h: s06_LH, f: -0.4, air: true, pose: ivPoseMix(ivPose('sit'), ivPose('wave'), up), expr: { eyes: 'happy', mouth: 'grin', brow: 'up' }, talk: '136-lily', blinkKey: 'lilyC' });
  } }));
}, { sec: 's06', title: '136 Lily: "Kai!"' });
SFX(CUT('136-lily') + 0.05, 'cloth', 0.45, 0.3); SFX(CUT('136-lily') + 0.45, 'thud', 0.4, 0.3); SFX(VW('136-lily', 'stayed'), 'step', 0.3, 0.3);

SHOT(CUT('136-lily', 'whole'), 's06_lilyHug', (lt, S) => {
  IV_CAM = { x: s06_DX + 10, y: 515, z: 3.3 };
  const u = s06_E(lt, 0.05, 5 / 24);
  ivStage(SET_trainYard({ door: 1, balloon: true, fg: false, inside: () => {
    s06_cat({ x: s06_DX + 50, y: s06_C9.floor, s: 112, f: -1, pose: 'sit', expr: u > 0.5 ? { eyes: 'closed' } : { eyes: 'half' }, look: [-1, 0] });
    ivMan({ who: CAST.lily, x: s06_DX - 40, y: s06_C9.floor, h: s06_LH, f: 0.55, pose: ivPoseMix(ivPose('wave'), ivPose('hug', { hL: [0.24, 0.16], hR: [0.3, 0.14], lean: 0.18 }), u), expr: { eyes: 'happy', mouth: 'smile' }, talk: '136-lily', blinkKey: 'lilyC' });
  } }));
}, { sec: 's06', title: '136 …the whole time (she hugs Pickles)' });
SFX(CUT('136-lily', 'whole') + 0.1, 'cloth', 0.5, 0.2);

// [BEAT] — the wide: you and Mom run in, a cop's torch, Lily waving in the door, Pickles on the rail. Crane back.
SHOT(LE('136-lily') + 0.15, 's06_yardBeat', (lt, S) => {
  s06_mv(lt, S.t1 - S.t0, [1220, 470, 1.32], [980, 540, 1.02]);
  const k = s06_run(S.t0 - 0.1, 120, 520, 3, S.t0 + 0.75), m = s06_run(S.t0 + 0.1, -320, 540, 3, S.t0 + 0.92);
  ivStage(SET_trainYard({ door: 1, balloon: true, inside: () => {
    ivMan({ who: CAST.lily, x: s06_DX, y: s06_C9.floor, h: s06_LH, f: -0.4, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'open' }, blinkKey: 'lilyC' }); },
    act: () => {
      s06_cat({ x: 1120, y: 940, s: 150, f: -1, pose: 'sit', expr: { eyes: 'half' }, look: [-0.3, 0.3] });
      s06_man(CAST.cop, 150, GROUND, 540, { f: 0.5, pose: ivPose('handOut', { hR: [0.28, 0.0] }), expr: { eyes: 'open', mouth: 'flat' } });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ivPoly([[300, 540], [310, 520], [s06_DX + 60, 300], [s06_DX - 40, 660]], 'rgba(255,240,200,0.07)'); ctx.restore();
      s06_man(CAST.mom, m.x, GROUND, 540, { f: 0.7, pose: TT > S.t0 + 0.92 ? ivPose('handsUp', { hL: [-0.1, -0.05], hR: [0.12, -0.08] }) : m.pose, expr: { eyes: 'sad', mouth: 'open', brow: 'up' } });
      s06_man(CAST.kai, k.x, GROUND, 520, { f: 0.7, pose: TT > S.t0 + 0.75 ? ivPose('reach', { hR: [0.32, -0.12] }) : k.pose, expr: { eyes: 'happy', mouth: 'open' } });
    } }));
}, { sec: 's06', title: '[beat] the yard: everyone arrives (crane back)' });
{ const t0 = LE('136-lily') + 0.15; for (let k = 0; k < 2; k++) SFX(t0 + 0.15 + k * 0.35, 'step', 0.5, -0.5 + k * 0.3); SFX(t0 + 0.9, 'gasp', 0.45, -0.3); SFX(t0 + 1.3, 'step', 0.4, -0.2); SFX(t0 + 1.4, 'heart', 0.4); SFX(t0 + 2.0, 'cloth', 0.4); }

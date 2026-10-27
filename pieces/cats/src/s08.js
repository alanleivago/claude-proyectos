// =====================================================================
//  s08 — 154–163 · the knock at the window, the black cat (Shadow), the dog, the CTA, the end. Prefix s08_.
//  Times only from the voice helpers (CUT / VW / VWE / LT / LE). SFX registered next to each SHOT.
// =====================================================================
const s08_fr = (n) => n / FPS;
const s08_ramp = (lt, a, d = 5 / FPS) => EZ.o3(clamp((lt - a) / d));     // a hard-stopping gesture ramp
const s08_ss = (fn) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };
const S08_MOOD = { ...IV_MOOD.bedNight, rim: '#a8c2ff', key: [0.75, -0.45], vig: 0.62 };
const S08_GREEN = 'rgba(120,255,110,';
// the eyes of an ivCat (world points) — same geometry as kit.js ivCat, for the green glow
function s08_eyes(o) {
  const S = o.s / 100, sx = (o.f ?? 1) < 0 ? -1 : 1, pose = o.pose || 'sit';
  const [hx, hy, hr] = pose === 'sit' ? [16, -70, 19] : pose === 'loaf' ? [24, -44, 18] : pose === 'sleep' ? [20, -16, 13] : [38, -54, 16];
  const ey = hy - hr * 0.08;
  return { pts: [hx - hr * 0.02, hx + hr * 0.6].map((ex) => [o.x + sx * ex * S, o.y + ey * S]), r: hr * S, head: [o.x + sx * hx * S, o.y + hy * S] };
}
// Shadow, the black cat, with glowing green eyes (k = glow 0..1)
function s08_shadow(o, k = 1) {
  if ((o.pose || 'sit') === 'sit') ivCastShadow(o.x + o.s * 0.05, o.y, o.s * 0.75, { a: 0.3 });
  ivCat({ coat: CATS.shadow, pose: 'sit', ...o });
  const E = s08_eyes(o), op = 1 - clamp(o.expr?.blink ?? 0);
  if (k <= 0 || op <= 0.05 || o.expr?.eyes === 'closed') return E;
  for (const [x, y] of E.pts) { ivGlow(x, y, E.r * 0.62, S08_GREEN + '0.75)', k * op); ivGlow(x, y, E.r * 0.22, 'rgba(220,255,200,0.8)', k * op * 0.7); }
  ivGlow(E.head[0], E.head[1], E.r * 2.4, S08_GREEN + '0.07)', k * op);
  return E;
}
// a cat's paw tapping the glass: arm from below, pad pressed on contact (u 0 off .. 1 pressed)
function s08_paw(x, y, s, u) {
  const yy = y + (1 - u) * 26 * s, sc = 1 + u * 0.08;
  ivLine(x + 30 * s, yy + 420 * s, x, yy, 62 * s, '#16151c'); ivLine(x + 30 * s, yy + 420 * s, x, yy, 50 * s, '#1c1b22');
  ctx.save(); ctx.translate(x, yy); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.ellipse(0, 0, 46 * s, 40 * s, 0, 0, TAU); ctx.fillStyle = '#1c1b22'; ctx.fill();
  ctx.lineWidth = 3 * s; ctx.strokeStyle = 'rgba(168,194,255,0.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 46 * s, 40 * s, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  { ctx.globalAlpha = 0.45 + 0.55 * u; ctx.fillStyle = '#c98a9a'; ctx.beginPath(); ctx.ellipse(0, 10 * s, 18 * s, 13 * s, 0, 0, TAU); ctx.fill();
    for (const a of [-1.05, -0.35, 0.35, 1.05]) { ctx.beginPath(); ctx.ellipse(Math.sin(a) * 30 * s, -Math.cos(a) * 22 * s, 7 * s, 8 * s, 0, 0, TAU); ctx.fill(); } }
  ctx.restore();
  if (u > 0.6) { ctx.save(); ctx.globalAlpha = (u - 0.6) * 2.5; for (const a of [-2.4, -1.57, -0.74]) ivLine(x + Math.cos(a) * 80 * s, y + Math.sin(a) * 70 * s, x + Math.cos(a) * 120 * s, y + Math.sin(a) * 105 * s, 6 * s, '#fff1d6'); ctx.restore(); }
}
// ---------------------------------------------------------------------
//  the window seen from inside Kai's room at night (a set for this section): far sky + moon + skyline (d 4),
//  near roofs (d 2.2), the outer sill with o.cat() on it (d 1.15), the room wall with the opening, frame bars, curtains,
//  the inner sill (d 1, then o.act — Kai inside), soft foreground (d 0.6). Opening WIN = [x0, y0, x1, y1].
// ---------------------------------------------------------------------
const S08_WIN = [740, 150, 1660, 790], S08_SILL = 792;
function s08_winSet(o = {}) {
  IV_M = S08_MOOD;
  const [x0, y0, x1, y1] = S08_WIN, vp = [1180, 470];
  return [
    { d: 4, draw: () => {
      ext_sky(['#03050c', '#0b1330', '#22305a'], -500, 900); ext_stars('s08st', 150, [-600, -400, 2600, 600]);
      ext_moon(o.moon?.[0] ?? 1330, o.moon?.[1] ?? 300, 70); ext_clouds('s08cl', 5, 80, 380, 'rgba(40,52,95,0.5)', 6);
      ext_skyline('s08sk', 760, '#0b1024', { h0: 80, h1: 280, lit: 0.4, litCol: '#e0a860' });
    } },
    { d: 2.2, draw: () => {   // the neighbours' roofs: pitched roof, chimney with smoke, an antenna, lit windows
      ivBox(-200, 640, 820, 900, 0.12, vp, { front: '#161b30', top: '#232a46' }); ivPoly([[-220, 640], [210, 470], [640, 640]], '#1d2238');
      ivBox(1500, 600, 900, 900, 0.12, vp, { front: '#141a2e', top: '#20284a' }); ivPoly([[1480, 600], [1950, 420], [2420, 600]], '#1a2036');
      ivBox(330, 470, 70, 120, 0.1, vp, { front: '#3a2a2e' }); for (let i = 0; i < 4; i++) { const u = mod(TT * 0.22 + i / 4, 1); ext_puff(365 + u * 50, 460 - u * 200, 30 + u * 50, '170,180,220', 0.16 * Math.sin(Math.PI * u)); }
      ivLine(2050, 430, 2050, 230, 4, '#0a0c18'); for (let i = 0; i < 3; i++) ivLine(1990 + i * 15, 290 + i * 30, 2110 - i * 15, 290 + i * 30, 3, '#0a0c18');
      if (Math.sin(TT * 2.4) > 0) { ivDot(2050, 230, 5, '#ff4a3a'); ivGlow(2050, 230, 50, 'rgba(255,70,50,0.7)'); }
      const r = RNG('s08rw').f; for (let i = 0; i < 9; i++) { const wx = i < 4 ? 20 + i * 140 : 1560 + (i - 4) * 150, wy = 720 + (i % 2) * 120; ivRR(wx, wy, 64, 80, 4, r() < 0.55 ? '#f0b866' : '#1a2034'); }
      if (o.roofCats) o.roofCats();
    } },
    { d: 1.15, draw: () => {   // the outer stone sill, Shadow on it
      ivBox(x0 - 60, S08_SILL, x1 - x0 + 120, 46, 0.05, vp, { front: '#4a4c62', top: '#6a6e8a' });
      ivAO(x0 - 60, S08_SILL + 2, x1 + 60, S08_SILL + 2, 10, 0.4);
      ivLightPool([[x0, S08_SILL - 2], [x1, S08_SILL - 2], [x1 + 30, S08_SILL + 12], [x0 - 30, S08_SILL + 12]], 'rgba(170,190,255,0.12)');
      o.cat && o.cat();
    } },
    { d: 1, draw: () => {
      // glass: a faint sheen and two diagonal reflections, then the bars of the frame
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ivPoly([[x0 + 120, y0], [x0 + 260, y0], [x0 + 40, y1], [x0 - 100, y1]], 'rgba(150,170,255,0.035)'); ivPoly([[x0 + 560, y0], [x0 + 610, y0], [x0 + 390, y1], [x0 + 340, y1]], 'rgba(150,170,255,0.03)');
      ctx.restore();
      if (o.glass) o.glass();
      const bar = (a, b, c, d) => { ivRR(a, b, c, d, 3, '#b9b6cc'); ivRR(a, b + d - 6, c, 6, 0, 'rgba(0,0,0,0.25)'); };
      bar(x0, 330, x1 - x0, 20); bar(1080, y0, 20, 180);
      // the wall around the opening (even-odd hole), moonlight on it, the frame
      ctx.beginPath(); ctx.rect(-1600, -1200, 5200, 3600); ctx.rect(x0, y0, x1 - x0, y1 - y0);
      ctx.fillStyle = ivVGrad(-200, 1300, ['#1a1e36', '#262c4c', '#1c2038']); ctx.fill('evenodd');
      ivGlow(1200, 500, 900, 'rgba(120,150,255,0.10)');
      ctx.lineWidth = 26; ctx.strokeStyle = '#c9c6d6'; ctx.strokeRect(x0 - 13, y0 - 13, x1 - x0 + 26, y1 - y0 + 26);
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.strokeRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
      ivAO(x0 - 26, y0 - 26, x1 + 26, y0 - 26, 30, 0.25);
      // fairy lights along the top of the wall, a poster corner on the left
      for (let i = 0; i < 14; i++) { const x = -200 + i * 170, y = 70 + Math.sin(i * 0.9) * 12, tw = 0.6 + 0.4 * Math.sin(TT * 2.2 + i * 1.7); ivDot(x, y, 6, `rgba(255,214,140,${tw})`); ivGlow(x, y, 34, 'rgba(255,190,110,0.5)', tw); }
      ivRR(160, 260, 240, 330, 8, '#2f4f9c'); ivDot(280, 380, 50, '#b8903e'); ivText('SPACE', 280, 540, 46, '#d8c8b0');
      // the inner sill (a box), a plant and a little lamp on it
      ivBox(x0 - 80, y1 + 13, x1 - x0 + 160, 34, 0.08, vp, { front: '#c9c6d6', top: '#dcd9e8' }); ivAO(x0 - 80, y1 + 47, x1 + 80, y1 + 47, 24, 0.4);
      set_inPlant(x0 + 40, y1 + 13, 0.55, 's08', { leaf: '#2f5a3e', pot: '#7a4a3a' });
      // moonlight falling through onto the sill + floor
      ivRays([[x0 + 40, y0 + 40], [x1 - 40, y0 + 40]], [[x0 - 200, 1300], [x1 - 200, 1300]], { n: 5, a: 0.05, col: [150, 175, 255] });
      if (o.eyeLight) ivGlow(o.eyeLight[0], o.eyeLight[1], 700, S08_GREEN + '0.10)', o.eyeLight[2] ?? 1);
      // curtains either side
      const cs = Math.sin(TT * 0.8) * 8;
      ivPoly([[x0 - 150, y0 - 60], [x0 + 30, y0 - 60], [x0 + 10 + cs, y1 + 120], [x0 - 170 + cs, y1 + 140]], '#33406c');
      for (let i = 1; i < 4; i++) ivLine(x0 - 150 + i * 45, y0 - 50, x0 - 165 + i * 45 + cs, y1 + 130, 6, 'rgba(0,0,0,0.18)');
      ivPoly([[x1 - 30, y0 - 60], [x1 + 150, y0 - 60], [x1 + 170 + cs, y1 + 140], [x1 - 10 + cs, y1 + 120]], '#2e3a64');
      for (let i = 1; i < 4; i++) ivLine(x1 - 30 + i * 45, y0 - 50, x1 - 15 + i * 45 + cs, y1 + 130, 6, 'rgba(0,0,0,0.18)');
      ivLine(x0 - 200, y0 - 64, x1 + 200, y0 - 64, 8, '#8a86a0');
      o.act && o.act();
    } },
    ...(o.fg === false ? [] : [{ d: 0.6, draw: () => { set_inFgShape([[-300, 1300], [-260, 960], [300, 990], [380, 1300]], '#0e0e18'); set_inFgShape([[1900, 1300], [1960, 900], [2400, 900], [2400, 1300]], '#0e0e18'); } }]),
  ];
}
// Kai lying in bed asleep (SET_bedroom night, inside o.onBed): head on the pillow, a blanket lump over the body
const S08_HEAD = [298, 738];
function s08_kaiLying(expr, o = {}) {
  const h = 520, rot = -Math.PI / 2 + 0.22;
  ctx.save(); ctx.beginPath(); ctx.rect(-2000, -2000, 2372, 4000); ctx.clip(); ctx.translate(...S08_HEAD); ctx.rotate(rot);
  ivMan({ who: CAST.kai, x: 0, y: h * 0.85, h, f: 0.05, pose: ivPose('stand'), expr, noBlink: true, blinkKey: 's08ly' });
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(352, 840); ctx.bezierCurveTo(345, 760, 390, 716, 470, 712); ctx.bezierCurveTo(700, 700, 900, 720, 1000, 742);
  ctx.bezierCurveTo(1100, 760, 1180, 740, 1246, 760); ctx.lineTo(1250, 860); ctx.closePath(); ctx.fillStyle = '#35325e'; ctx.fill();
  ivLine(400, 728, 980, 724, 5, 'rgba(255,255,255,0.13)'); ivLine(650, 718, 680, 850, 3, 'rgba(0,0,0,0.14)');
  if (o.pickles) o.pickles();
}
// ---------------------------------------------------------------------
//  154 "That night, there's a knock at the window." — wide: Kai asleep, Pickles curled at his feet; slow push to the window
// ---------------------------------------------------------------------
SHOT(CUT('154-narrator'), 's08_night', (lt) => {
  const u = EZ.io(clamp(lt / Math.max(0.5, CUT('154-narrator', 'knock') - CUT('154-narrator'))));
  IV_CAM = { x: lerp(900, 1180, u), y: lerp(560, 520, u), z: lerp(1.02, 1.28, u) };
  ivStage(SET_bedroom({ t: 'night', knock: { expr: { eyes: 'closed' } }, onBed: () => s08_kaiLying({ eyes: 'closed', mouth: 'flat' }, {
    pickles: () => ivCat({ x: 980, y: 760, s: 140, f: -1, coat: CATS.pickles, pose: 'sleep' }) }) }));
}, { sec: 's08', title: 'night: Kai asleep, Pickles at his feet, a shape at the window — push in' });
SFX(CUT('154-narrator') + 0.05, 'whoosh', 0.6, 0); SFX(VW('154-narrator', 'night'), 'tick', 0.5, -0.6);
SFX(VW('154-narrator', 'there\'s') - 0.1, 'cloth', 0.4, -0.3);
// "…knock at the window" — the glass, a black paw taps three times
const s08_kn = () => VW('154-narrator', 'knock');
SHOT(CUT('154-narrator', 'knock'), 's08_knock', (lt) => {
  IV_CAM = { x: 1150, y: 560, z: 3.0 }; IV_FOCUS = 1;
  const t = TT - s08_kn(); let u = 0;
  for (const k of [0, 0.2, 0.4]) { const d = t - k; if (d > -0.07 && d < 0.1) u = Math.max(u, d < 0 ? 1 + d / 0.07 : 1 - d / 0.1); }
  ivStage(s08_winSet({ fg: false, moon: [1180, 500], glass: () => s08_paw(1150, 560, 1.0, clamp(u)) }));
}, { sec: 's08', title: 'knock: a black paw taps the glass 3×' });
SFX(s08_kn(), 'thud', 1.3, 0.3); SFX(s08_kn() + 0.2, 'click', 1.3, 0.3); SFX(s08_kn() + 0.4, 'thud', 1.35, 0.3);
// "…window." — Kai's eyes snap open on the pillow
SHOT(VW('154-narrator', 'window') + 0.05, 's08_wake', (lt) => {
  IV_CAM = { x: 330, y: 720, z: 3.0 };
  const o = s08_ramp(lt, 0.18, 3 / FPS);
  ivStage(SET_bedroom({ t: 'night', onBed: () => s08_kaiLying(o > 0.5 ? { eyes: 'wide', mouth: 'flat', look: [0.6, -0.3] } : { eyes: 'closed', mouth: 'flat' }) }));
}, { sec: 's08', title: 'Kai\'s eyes snap open' });
SFX(VW('154-narrator', 'window') + 0.23, 'gasp', 0.45, -0.3);
// ---------------------------------------------------------------------
//  155–157 · "A cat you've never seen. / Black. / Green eyes."
// ---------------------------------------------------------------------
const S08_CAT = { x: 1240, y: S08_SILL, s: 430, f: -1 };
// Kai sitting up in bed, in the room (foreground left of the window), facing it
const s08_kaiSit = (expr, o = {}) => {
  const x = o.x ?? 360, y = o.y ?? 1290, h = o.h ?? 940;
  ivCastShadow(x + 60, y - 40, h * 0.6, { a: 0.25 });
  return ivMan({ who: CAST.kai, x, y, h, f: o.f ?? 0.62, pose: o.pose || ivPose('sit', { hL: [0.14, 0.2], hR: [0.2, 0.2] }), expr, hands: 'mitten', blinkKey: 's08k' });
};
SHOT(CUT('155-narrator'), 's08_stranger', (lt) => {
  IV_CAM = { x: 1000, y: 540, z: 1.02 + 0.06 * EZ.io(clamp(lt / 1.8)) };
  ivStage(s08_winSet({ eyeLight: [1240, 600, 0.6], cat: () => s08_shadow({ ...S08_CAT, expr: { eyes: 'open', look: [-0.6, 0.2] } }, 0.7),
    act: () => s08_kaiSit({ eyes: 'wide', mouth: 'o', look: [1, -0.2] }) }));
}, { sec: 's08', title: 'a cat you\'ve never seen: Kai sits up, a black cat on the outer sill' });
SFX(CUT('155-narrator'), 'cloth', 0.7, -0.4); SFX(VW('155-narrator', 'never') - 0.05, 'step', 0.4, 0.3);
// "Black." — the cat, eyes shut, a silhouette against the moon
SHOT(CUT('156-narrator'), 's08_black', (lt) => {
  const E = s08_eyes(S08_CAT);
  IV_CAM = { x: E.head[0] + 60, y: E.head[1] + 140, z: 1.85 * ivPush(SHOT_T0, 0.03, 1.2) }; IV_FOCUS = 1.15;
  ivStage(s08_winSet({ fg: false, moon: [E.head[0] + 30, E.head[1] - 30], cat: () => s08_shadow({ ...S08_CAT, expr: { eyes: 'closed' } }, 0) }));
}, { sec: 's08', title: 'Black: the silhouette against the moon, eyes shut' });
SFX(CUT('156-narrator'), 'whoosh', 0.5, 0.2); SFX(VW('156-narrator', 'black') + 0.25, 'cloth', 0.35, 0.3);
// "Green eyes." — extreme close-up: the eyes open and glow
SHOT(CUT('157-narrator'), 's08_green', (lt) => {
  const E = s08_eyes(S08_CAT), o = s08_ramp(TT, VW('157-narrator', 'green') - 0.02, 4 / FPS);
  IV_CAM = { x: E.head[0] + 10, y: E.head[1] - 20, z: 3.6 * ivPush(SHOT_T0, 0.02, 1.5) }; IV_FOCUS = 1.15;
  ivStage(s08_winSet({ fg: false, moon: [E.head[0] + 140, E.head[1] - 120], cat: () => s08_shadow({ ...S08_CAT, expr: { eyes: o > 0.02 ? 'open' : 'closed', blink: 1 - o } }, o) }));
}, { sec: 's08', title: 'Green eyes: ECU, the eyes open and glow' });
SFX(VW('157-narrator', 'green'), 'shimmer', 0.55, 0.2);   // key moment 1 of 2
SFX(VW('157-narrator', 'eyes') + 0.2, 'rise', 0.4, 0, 0.8);
// ---------------------------------------------------------------------
//  158 Shadow Cat: "So you're the human who understands us. Good. We've been waiting a very long time.
//  Something is coming, and the cats are not the only ones who know."
// ---------------------------------------------------------------------
SHOT(CUT('158-shadowcat'), 's08_talk', (lt) => {
  IV_CAM = { x: 1060, y: 520, z: 1.22 };
  ivStage(s08_winSet({ eyeLight: [1240, 600, 0.8], cat: () => s08_shadow({ ...S08_CAT, talk: '158-shadowcat', expr: { eyes: 'half', look: [-0.8, 0.3] } }, 0.9),
    act: () => s08_kaiSit({ eyes: 'wide', mouth: 'flat', look: [1, -0.3] }, { pose: ivPoseMix(ivPose('sit', { hL: [0.14, 0.2], hR: [0.2, 0.2] }), ivPose('sit', { hL: [0.14, 0.2], hR: [0.12, -0.02], lean: -0.06 }), s08_ramp(lt, 0.9)) }) }));
  s08_ss(() => ivTag('"SO YOU\'RE THE HUMAN WHO UNDERSTANDS US."', 1200, 950, 30, ivPop(VW('158-shadowcat', 'so') + 0.1)));
}, { sec: 's08', title: 'Shadow talks; Kai pulls back, hand to his chest' });
SFX(CUT('158-shadowcat') + 0.1, 'pop', 0.6, 0.2); SFX(CUT('158-shadowcat') + 0.9, 'cloth', 0.6, -0.4);
SFX(VW('158-shadowcat', 'understands'), 'step', 0.4, 0.3);
// "Good." — close on Shadow, a pleased half-lidded look
SHOT(CUT('158-shadowcat', 'good'), 's08_good', (lt) => {
  const E = s08_eyes(S08_CAT);
  IV_CAM = { x: E.head[0] - 40, y: E.head[1] + 60, z: 2.2 }; IV_FOCUS = 1.15;
  ivStage(s08_winSet({ fg: false, moon: [E.head[0] + 260, E.head[1] - 60], cat: () => s08_shadow({ ...S08_CAT, talk: '158-shadowcat', expr: { eyes: 'half', look: [-1, 0.2] } }, 1) }));
}, { sec: 's08', title: 'Good. — Shadow close, pleased' });
SFX(CUT('158-shadowcat', 'good'), 'swish', 0.5, 0.2); SFX(VW('158-shadowcat', 'good') + 0.4, 'cloth', 0.35, 0.3);
// "We've been waiting a very long time." — the street below: cats in every window, all watching this house
SHOT(CUT('158-shadowcat', 'waiting'), 's08_waiting', (lt) => {
  const u = EZ.io(clamp(lt / 1.7));
  IV_CAM = { x: lerp(820, 1080, u), y: 520, z: 1.12 };
  ivStage(SET_roofs({ cats: 46, from: [960, 500], act: () => {
    for (const sl of EXT_ROOFSLOTS) if (sl.d === 1) { const E = s08_eyes({ x: sl.x, y: sl.y, s: sl.s, f: sl.f, pose: sl.pose }); for (const [x, y] of E.pts) ivGlow(x, y, E.r * 0.7, S08_GREEN + '0.6)'); }
  } }));
}, { sec: 's08', title: 'we\'ve been waiting: cats on every roof, all watching' });
SFX(CUT('158-shadowcat', 'waiting'), 'whoosh', 0.6, -0.2); SFX(VW('158-shadowcat', 'long') - 0.1, 'step', 0.35, -0.5);
// "Something is coming," — ECU: the pupils snap to slits
SHOT(CUT('158-shadowcat', 'something'), 's08_coming', (lt) => {
  const E = s08_eyes(S08_CAT), slit = TT > VW('158-shadowcat', 'coming');
  IV_CAM = { x: E.head[0] + 10, y: E.head[1] - 30, z: 4.2 * ivPush(SHOT_T0, 0.04, 1.4) }; IV_FOCUS = 1.15;
  ivStage(s08_winSet({ fg: false, moon: [E.head[0] - 200, E.head[1] - 140], cat: () => s08_shadow({ ...S08_CAT, talk: '158-shadowcat', expr: { eyes: 'open', look: [-0.6, 0] } }, slit ? 1.3 : 0.7) }));
  s08_ss(() => ivTag('"SOMETHING IS COMING."', 960, 950, 32, ivPop(VW('158-shadowcat', 'coming'))));
}, { sec: 's08', title: 'Something is coming: ECU, pupils snap to slits' });
SFX(CUT('158-shadowcat', 'something'), 'rise', 0.5, 0, 0.9); SFX(VW('158-shadowcat', 'coming'), 'pop', 0.6, 0);
// "…and the cats are not the only ones who know." — Kai close, green light on his face, eyes sliding sideways
SHOT(CUT('158-shadowcat', 'and'), 's08_kaiKnow', (lt) => {
  IV_CAM = { x: 470, y: 560, z: 2.1 };
  const sl = s08_ramp(TT, VW('158-shadowcat', 'only'), 6 / FPS);
  ivStage(s08_winSet({ eyeLight: [700, 500, 1.6], cat: () => s08_shadow({ ...S08_CAT, talk: '158-shadowcat', expr: { eyes: 'half' } }, 0.9),
    act: () => { s08_kaiSit({ eyes: 'wide', mouth: sl > 0.5 ? 'frown' : 'flat', look: [lerp(1, -1, sl), lerp(-0.2, 0.4, sl)] }); ivGlow(560, 480, 260, S08_GREEN + '0.16)'); } }));
}, { sec: 's08', title: 'not the only ones who know: Kai, green-lit, eyes slide away' });
SFX(CUT('158-shadowcat', 'and') + 0.05, 'whoosh', 0.45, -0.3); SFX(VW('158-shadowcat', 'only'), 'cloth', 0.4, -0.4);
SFX(VW('158-shadowcat', 'know') + 0.1, 'heart', 0.5, 0);
// ---------------------------------------------------------------------
//  159 "Behind him, a dog barks." — outside: Kai's house, the lit window with Shadow on the sill; crane down to the dog
// ---------------------------------------------------------------------
const S08_DOG = [780, 965];
function s08_house(o = {}) {
  const vp = [700, 470], wx0 = 1380, wx1 = 1740, wy0 = -170, wy1 = 170;
  ivBox(1180, -760, 1200, 1700, 0.08, vp, { front: '#353150', top: '#433e60', side: '#28253e' });
  for (let y = -740; y < 930; y += 46) ivLine(1182, y, 2380, y, 2, 'rgba(0,0,0,0.16)');
  ivPoly([[1150, -760], [1780, -1100], [2420, -760]], '#2a2234');
  // the upper window: Kai's room (blue, the desk lamp), Kai at the glass, the outer sill with Shadow
  ctx.save(); ctx.beginPath(); ctx.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); ctx.clip();
  ctx.fillStyle = '#2b3152'; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0); ivGlow(wx0 + 80, wy1 - 40, 260, 'rgba(255,200,120,0.55)');
  for (let i = 0; i < 6; i++) ivDot(wx0 + 30 + i * 60, wy0 + 26, 4, 'rgba(255,214,140,0.9)');
  ivMan({ who: CAST.kai, x: 1520, y: wy1 + 180, h: 330, f: 0.3, pose: ivPose('stand', { hL: [0.06, 0.2], hR: [0.2, 0.1] }), expr: { eyes: 'wide', mouth: 'flat', look: [0.6, 1] } });
  ctx.restore();
  ctx.lineWidth = 12; ctx.strokeStyle = '#c9c6d6'; ctx.strokeRect(wx0 - 6, wy0 - 6, wx1 - wx0 + 12, wy1 - wy0 + 12); ivLine(wx0, -40, wx1, -40, 8, '#c9c6d6');
  ivBox(wx0 - 40, wy1 + 6, wx1 - wx0 + 80, 24, 0.04, vp, { front: '#6a6e8a', top: '#8a8ea8' });
  s08_shadow({ x: 1660, y: wy1 + 8, s: 130, f: -1, expr: { eyes: 'open', look: [-0.6, 1] } }, 0.8);
  ivGlow((wx0 + wx1) / 2, wy1, 380, 'rgba(255,190,110,0.12)');
  // ground floor: the front door with a little lamp, a dark window, the front steps
  ivRR(1300, 560, 170, 380, 6, '#4a2e30'); ivDot(1440, 760, 6, '#d8c49a'); ivDot(1385, 520, 12, '#ffd890'); ivGlow(1385, 520, 220, 'rgba(255,200,120,0.5)');
  ivRR(1600, 560, 300, 230, 4, '#151a2c'); ivRR(1600, 560, 300, 230, 4, null, '#c9c6d6', 10);
  ivBox(1270, 900, 230, 40, 0.06, vp, { front: '#4a4c62', top: '#6a6e8a' });
  // the dog on the sidewalk under the lamp
  P_streetLamp(470, 968, 0.95, { dir: 1 });
  ivCastShadow(S08_DOG[0], S08_DOG[1], 220, { a: 0.35 });
  P_dog(S08_DOG[0], S08_DOG[1], o.dogS ?? 0.95, { f: 1, pose: o.dogPose || 'stand', key: 's08dog', expr: o.dogExpr || {} });
}
SHOT(CUT('159-narrator'), 's08_house', (lt) => {
  const u = EZ.io(clamp(lt / Math.max(0.6, VW('159-narrator', 'dog') - CUT('159-narrator'))));
  IV_CAM = { x: lerp(1500, 1050, u), y: lerp(40, 640, u), z: lerp(1.35, 1.08, u) };
  ivStage(SET_street({ t: 'night', grate: false, fg: false, act: () => s08_house({ dogPose: TT > VW('159-narrator', 'barks') - 0.1 ? 'bark' : 'stand' }) }));
}, { sec: 's08', title: 'outside: Kai + Shadow at the lit window; crane down to a dog' });
SFX(CUT('159-narrator'), 'whoosh', 0.6, 0.3); SFX(CUT('159-narrator') + 0.4, 'car', 0.3, -0.6, 1.4); SFX(VW('159-narrator', 'dog') - 0.05, 'step', 0.4, -0.3);
// "…barks." — the dog close, barking up at the window
SHOT(CUT('159-narrator', 'barks'), 's08_bark', (lt) => {
  IV_CAM = { x: S08_DOG[0] + 110, y: S08_DOG[1] - 170, z: 2.5 };
  ivStage(SET_street({ t: 'night', grate: false, fg: false, act: () => s08_house({ dogPose: 'bark' }) }));
}, { sec: 's08', title: 'the dog barks up at the window' });
{ const b = VW('159-narrator', 'barks'); SFX(b + 0.02, 'impact', 0.5, -0.2); SFX(b + 0.05, 'gasp', 0.6, -0.2); SFX(b + 0.55, 'impact', 0.4, -0.2); }
// ---------------------------------------------------------------------
//  160 "And for the first time in your life, you understand that too." + [BEAT 2 s]
// ---------------------------------------------------------------------
const s08_kaiWin = (expr, o = {}) => ivMan({ who: CAST.kai, x: o.x ?? 620, y: 1560, h: 1250, f: 0.55, pose: ivPose('stand', { hL: [0.1, 0.18], hR: [0.22, 0.12], lean: 0.06 }), expr, hands: 'mitten', blinkKey: 's08w' });
SHOT(CUT('160-narrator'), 's08_look', (lt) => {
  IV_CAM = { x: 980, y: 560, z: 1.25 };
  const d = s08_ramp(lt, 0.25, 6 / FPS);
  ivStage(s08_winSet({ eyeLight: [1240, 600, 0.6], cat: () => s08_shadow({ ...S08_CAT, expr: { eyes: 'half', look: [lerp(-0.8, 0.2, d), lerp(0.2, 1, d)] } }, 0.8),
    act: () => s08_kaiWin({ eyes: 'wide', mouth: 'flat', look: [lerp(0.6, 0.9, d), lerp(-0.2, 1, d)] }) }));
}, { sec: 's08', title: 'Kai at the glass, both look down to the street' });
SFX(CUT('160-narrator') + 0.25, 'cloth', 0.6, -0.3); SFX(CUT('160-narrator') + 0.3, 'glass', 0.35, 0.2);
SFX(VW('160-narrator', 'life') - 0.2, 'impact', 0.3, -0.4);   // a far bark
// "…you understand that too." — the dog, sitting, looks up: a speech bubble "…!"
function s08_bubble(x, y, str, a, size = 64) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); const sc = 0.8 + 0.2 * EZ.back(clamp(a)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(a);
  ctx.font = `800 ${size}px ${IV.font}`; const w = ctx.measureText(str).width + size * 1.2, h = size * 1.6;
  ivPoly([[-w * 0.3, h * 0.35], [-w * 0.45, h * 0.85], [-w * 0.12, h * 0.4]], '#fbf3e4');
  ivRR(-w / 2, -h / 2, w, h, h * 0.45, '#fbf3e4'); ivRR(-w / 2, -h / 2, w, h, h * 0.45, null, 'rgba(0,0,0,0.25)', 3);
  ivText(str, 0, size * 0.36, size, '#1c1b22'); ctx.restore();
}
SHOT(CUT('160-narrator', 'understand'), 's08_dogTalk', (lt) => {
  IV_CAM = { x: S08_DOG[0] + 160, y: S08_DOG[1] - 220, z: 2.0 };
  ivStage(SET_street({ t: 'night', grate: false, fg: false, act: () => s08_house({ dogPose: 'sit', dogS: 1.05, dogExpr: { eyes: 'wide', brow: 'up' } }) }));
  s08_ss(() => s08_bubble(1360, 300, '…!', ivPop(VW('160-narrator', 'understand') + 0.1), 80));
}, { sec: 's08', title: 'the dog looks up — a speech bubble "…!"' });
SFX(VW('160-narrator', 'understand') + 0.1, 'pop', 0.9, 0.3); SFX(VW('160-narrator', 'understand') + 0.5, 'gasp', 0.35, -0.2);
// "…too." — Kai, eyes wide, green light on his face (holds into the beat)
SHOT(CUT('160-narrator', 'too'), 's08_wide', (lt) => {
  IV_CAM = { x: 610, y: 560, z: 2.6 * ivPush(SHOT_T0, 0.03, 1.6) }; IV_FOCUS = 1;
  ivStage(s08_winSet({ eyeLight: [700, 450, 1.4], cat: () => s08_shadow({ ...S08_CAT, expr: { eyes: 'half' } }, 0.9),
    act: () => { s08_kaiWin({ eyes: 'wide', mouth: 'o', look: [-0.2, 0.2] }); ivGlow(720, 420, 220, S08_GREEN + '0.13)'); } }));
}, { sec: 's08', title: 'Kai, eyes wide (into the beat)' });
SFX(VW('160-narrator', 'too'), 'heart', 0.6, 0); SFX(VW('160-narrator', 'too') + 0.7, 'heart', 0.5, 0);
// [BEAT] — Shadow gives one slow blink, turns, and leaps off into the night
const s08_beat = () => LE('160-narrator') + 0.75;
SHOT(s08_beat(), 's08_leap', (lt) => {
  IV_CAM = { x: 1100, y: 520, z: 1.12 };
  const bl = Math.sin(Math.PI * clamp(lt / 0.9)), j = clamp((lt - 1.15) / 0.45), gone = lt > 1.6;
  ivStage(s08_winSet({ eyeLight: [1240, 600, gone ? 0 : 0.7], cat: () => {
    if (gone) return;
    if (lt < 1.15) s08_shadow({ ...S08_CAT, f: lt < 0.95 ? -1 : 1, expr: { eyes: 'open', blink: bl } }, 0.9);
    else s08_shadow({ x: S08_CAT.x + j * 520, y: S08_SILL - Math.sin(Math.PI * j) * 260 - j * 120, s: 430, f: 1, pose: 'stand', rot: -0.3 * (1 - j) }, 0.6);
  }, act: () => s08_kaiWin({ eyes: lt > 1.3 ? 'wide' : 'open', mouth: lt > 1.3 ? 'o' : 'flat', look: [1, lt > 1.3 ? -0.6 : 0] }, { x: 420 }) }));
}, { sec: 's08', title: 'BEAT: Shadow slow-blinks, turns, leaps away' });
SFX(s08_beat() + 0.95, 'cloth', 0.5, 0.3); SFX(s08_beat() + 1.15, 'whoosh', 0.8, 0.5); SFX(s08_beat() + 1.9, 'thud', 0.35, 0.8);
// ---------------------------------------------------------------------
//  161 "So, would you want to understand every cat, if it meant hearing what they really think of you?"
// ---------------------------------------------------------------------
const S08_PK = { x: 880, y: 838, s: 210, f: -1 };   // Pickles sitting on the bed, Kai asleep behind him
const s08_bedPickles = (pk, o = {}) => SET_bedroom({ t: 'night', onBed: () => s08_kaiLying({ eyes: 'closed', mouth: 'flat' }, { pickles: () => {
  ivCastShadow(pk.x + 10, pk.y, pk.s * 0.8, { a: 0.3 }); ivCat({ coat: CATS.pickles, pose: 'sit', ...pk });
} }), ...o });
SHOT(CUT('161-narrator'), 's08_cta', (lt) => {
  const E = s08_eyes(S08_PK);
  IV_CAM = { x: E.head[0] + 30, y: E.head[1] + 80, z: 2.0 * ivPush(SHOT_T0, 0.04, 2.0) };
  const turn = s08_ramp(TT, VW('161-narrator', 'would'), 5 / FPS);
  ivStage(s08_bedPickles({ ...S08_PK, expr: { eyes: turn > 0.5 ? 'half' : 'open', look: [turn > 0.5 ? -0.2 : -1, 0] } }));
}, { sec: 's08', title: 'CTA: Pickles on the bed turns to us, unimpressed' });
SFX(CUT('161-narrator'), 'whoosh', 0.7, 0); SFX(VW('161-narrator', 'would'), 'cloth', 0.45, 0.2);
// "…every cat," — the alley wall, every cat in the city looking at us
SHOT(CUT('161-narrator', 'every'), 's08_every', (lt) => {
  const u = EZ.io(clamp(lt / 1.4));
  IV_CAM = { x: 960, y: lerp(470, 540, u), z: lerp(1.25, 1.12, u) };
  ivStage(SET_alley({ cats: 40, act: () => { const B = SET_POS2.alley.boss; ivCat({ x: B[0], y: B[1], s: B[2], f: -1, coat: CATS.boss, pose: 'sit', expr: { eyes: 'half' } }); } }));
}, { sec: 's08', title: 'every cat: the alley wall full of cats, Boss in the middle' });
SFX(CUT('161-narrator', 'every'), 'crowd', 0.35, 0, 1.0);
// "…if it meant hearing what they really think of you?" — Pickles close, judging; his opinion pops on "think"
SHOT(CUT('161-narrator', 'hearing'), 's08_judge', (lt) => {
  const E = s08_eyes(S08_PK), sq = s08_ramp(TT, VW('161-narrator', 'really'), 5 / FPS);
  IV_CAM = { x: E.head[0] + 30, y: E.head[1] + 40, z: 3.4 }; IV_FOCUS = 1;
  ivStage(s08_bedPickles({ ...S08_PK, expr: { eyes: sq > 0.5 ? 'angry' : 'half', look: [-0.3, 0] } }));
  s08_ss(() => ivTag('"YOU SNORE. AND YOUR SOCKS ARE A CRIME."', 960, 950, 32, ivPop(VW('161-narrator', 'think'))));
}, { sec: 's08', title: 'what they really think: Pickles judges you — "YOU SNORE…"' });
SFX(CUT('161-narrator', 'hearing'), 'swish', 0.5, 0); SFX(VW('161-narrator', 'really'), 'cloth', 0.4, 0.2); SFX(VW('161-narrator', 'think'), 'pop', 0.8, 0);
// ---------------------------------------------------------------------
//  162 "Tell us in the comments." — a comment card written by the cats
// ---------------------------------------------------------------------
SHOT(CUT('162-narrator'), 's08_comments', (lt) => {
  IV_CAM = { x: 960, y: 540, z: 1.0 };
  ivStage(s08_winSet({ fg: false }).map((L) => ({ ...L, blur: 10 })));
  s08_ss(() => {
    ctx.fillStyle = 'rgba(6,6,14,0.45)'; ctx.fillRect(0, 0, W, H);
    const x = 460, y = 150, w = 1000;
    ivRR(x, y, w, 760, 36, 'rgba(20,18,30,0.94)', 'rgba(255,214,160,0.45)', 3);
    ivText('COMMENTS', x + 60, y + 78, 40, '#ffe6c4', { align: 'left', track: 4 });
    const rows = [[CATS.pickles, 'Pickles', 'No. Absolutely not.'], [CATS.duchess, 'Duchess', 'Darling, obviously yes.'], [CATS.noodle, 'Noodle', 'YES YES YES YES YES'], [CATS.shadow, '???', 'We are watching.']];
    rows.forEach(([coat, name, txt], i) => {
      const a = ivPop(SHOT_T0 + 0.2 + i * 0.3); if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a; const yy = y + 160 + i * 130;
      ivDot(x + 100, yy, 50, '#2e2c40'); ctx.save(); ctx.beginPath(); ctx.arc(x + 100, yy, 48, 0, TAU); ctx.clip();
      ivCat({ x: x + 92, y: yy + 128, s: 170, f: 1, coat, pose: 'sit', expr: { eyes: i === 0 ? 'half' : 'open' } }); ctx.restore();
      ivText(name, x + 180, yy - 12, 30, i === 3 ? '#9ef08a' : '#ffcf8a', { align: 'left' }); ivText(txt, x + 180, yy + 34, 34, '#f4ead6', { align: 'left', font: IV.sans, weight: 600 });
      ctx.restore();
    });
    ivRR(x + 50, y + 680, w - 100, 56, 28, null, 'rgba(255,255,255,0.25)', 3);
    ivText('Add a comment…', x + 90, y + 718, 26, 'rgba(255,255,255,0.45)', { align: 'left', font: IV.sans, weight: 600 });
    if (Math.floor(lt * 2.5) % 2 === 0) ivLine(x + 320, y + 690, x + 320, y + 726, 3, '#ffe6c4');
  });
}, { sec: 's08', title: 'comments card: Pickles "No.", Duchess, Noodle, ??? "We are watching."' });
SFX(CUT('162-narrator'), 'whoosh', 0.7, 0);
for (let i = 0; i < 4; i++) SFX(CUT('162-narrator') + 0.2 + i * 0.3 + 3 / FPS, 'pop', 0.7 + i * 0.08, -0.3 + i * 0.2);
SFX(VW('162-narrator', 'comments') + 0.2, 'type', 0.4, 0.1, 0.6);
// ---------------------------------------------------------------------
//  163 "And if Pickles made you cry a little, hit like and subscribe for part two."
// ---------------------------------------------------------------------
// Pickles curled on Kai's chest, ECU: the slow blink (callback) lands on "cry"
const S08_PKC = { x: 560, y: 716, s: 170, f: -1 };
SHOT(CUT('163-narrator'), 's08_blink', (lt) => {
  const E = s08_eyes({ ...S08_PKC, pose: 'loaf' }), c = VW('163-narrator', 'cry'), bl = Math.sin(Math.PI * clamp((TT - c + 0.35) / 1.0));
  IV_CAM = { x: E.head[0] + 20, y: E.head[1] + 30, z: 3.2 * ivPush(SHOT_T0, 0.03, 2) }; IV_FOCUS = 1;
  ivStage(SET_bedroom({ t: 'night', onBed: () => s08_kaiLying({ eyes: 'closed', mouth: 'smile' }, { pickles: () => ivCat({ coat: CATS.pickles, pose: 'loaf', ...S08_PKC, expr: { eyes: 'half', blink: bl } }) }) }));
}, { sec: 's08', title: 'Pickles on Kai\'s chest: the slow blink on "cry"' });
SFX(CUT('163-narrator'), 'swish', 0.4, 0); SFX(VW('163-narrator', 'cry'), 'heart', 0.7, 0);
// "…hit like and subscribe" — the two of them asleep, LIKE / SUBSCRIBE pop on their words
function s08_pill(str, x, y, a, col) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); const sc = 0.85 + 0.15 * EZ.back(clamp(a)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(a);
  ctx.font = `800 40px ${IV.font}`; const w = ctx.measureText(str).width + 110;
  ivRR(-w / 2, -40, w, 80, 40, col); ivText(str, 22, 14, 40, '#fff6e8', { track: 2 });
  ctx.beginPath(); ctx.arc(-w / 2 + 44, 0, 15, 0, TAU); ctx.fillStyle = 'rgba(255,246,232,0.9)'; ctx.fill();
  ctx.restore();
}
SHOT(CUT('163-narrator', 'hit'), 's08_like', (lt) => {
  IV_CAM = { x: 640, y: 640, z: 1.7 * ivPush(SHOT_T0, 0.03, 1.5) };
  ivStage(SET_bedroom({ t: 'night', onBed: () => s08_kaiLying({ eyes: 'closed', mouth: 'smile' }, { pickles: () => ivCat({ coat: CATS.pickles, pose: 'loaf', ...S08_PKC, expr: { eyes: 'closed' } }) }) }));
  s08_ss(() => { s08_pill('LIKE', 760, 230, ivPop(VW('163-narrator', 'like') - s08_fr(3)), '#3a3448'); s08_pill('SUBSCRIBE', 1130, 230, ivPop(VW('163-narrator', 'subscribe') - s08_fr(3)), '#c8352e'); });
}, { sec: 's08', title: 'LIKE / SUBSCRIBE pop over Kai + Pickles asleep' });
SFX(VW('163-narrator', 'like') - s08_fr(3), 'pop', 1.4, -0.2); SFX(VW('163-narrator', 'like') - s08_fr(3) + 0.05, 'click', 0.8, -0.2);
SFX(VW('163-narrator', 'subscribe') - s08_fr(3), 'pop', 1.6, 0.2); SFX(VW('163-narrator', 'subscribe') - s08_fr(3) + 0.05, 'click', 0.9, 0.2);
// "…for part two." — END: crane up over the city at night, cats on every roof, Shadow on the nearest one; title + PART 2
SHOT(CUT('163-narrator', 'part'), 's08_end', (lt) => {
  const u = EZ.io(clamp(lt / 4.5));
  IV_CAM = { x: lerp(1000, 960, u), y: lerp(700, 470, u), z: lerp(1.18, 1.0, u) };
  ivStage(SET_roofs({ cats: 60, from: [700, 700], act: () => { s08_shadow({ x: 700, y: 900, s: 150, f: 1, expr: { eyes: 'open' } }, 1); } }));
  s08_ss(() => {
    ctx.fillStyle = ivVGrad(IV.bar, 420, ['rgba(5,4,12,0.7)', 'rgba(5,4,12,0.45)', 'rgba(5,4,12,0)']); ctx.fillRect(0, IV.bar, W, 360);
    ivTitle('WHAT IF YOU COULD', 'UNDERSTAND EVERY CAT?', null, 960, 170, clamp(lt / 0.4), 52);
    ivTag('PART 2', 960, 305, 40, ivPop(VW('163-narrator', 'two') - s08_fr(2)), { c: '#ffe2b0' });
  });
}, { sec: 's08', title: 'END: crane up over the roofs full of cats, title + PART 2 on "two"' });
SFX(CUT('163-narrator', 'part'), 'whoosh', 1.0, 0); SFX(VW('163-narrator', 'two') - s08_fr(2), 'pop', 1.1, 0); SFX(VW('163-narrator', 'two') - s08_fr(2) + 0.05, 'ding', 0.5, 0);   // key moment 2 of 2
SFX(VW('163-narrator', 'two') + 0.8, 'crowd', 0.25, 0, 1.6);

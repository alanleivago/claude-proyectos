// =====================================================================
//  STYLE FRAMES — "What If You Could Understand Every Cat?" · the 2.5D upgrade
//  1 bedroom morning (perspective room, window light, Pickles on Kai) · 2 the bus stop (perspective street, long shadows)
//  3 the alley at 3 a.m. (Boss and forty cats on the wall) · 4 the slow blink (close-up, moonlight, train car 9)
// =====================================================================
const CAST = {
  kai:  { key: 'kai', top: 'hoodie', col: '#3c6fd1', col2: '#284c94' },
  lily: { key: 'lily', top: 'coat', col: '#f2c230', col2: '#c4951a', hair: 'puffs', shirt: '#e05a7a' },
  extraA: { key: 'extraA', top: 'coat', col: '#6b6378' }, extraB: { key: 'extraB', top: 'tee', col: '#8a7a64' },
};
const GROUND = 900;

// ---- 1: bedroom, morning ---------------------------------------------------
function lookBedroom() {
  IV_M = { ...IV_MOOD.lunch, key: [0.75, -0.55], rim: '#ffd9a6' }; const u = EZ.io(clamp(TT / 3)); IV_CAM = { x: lerp(820, 1040, u), y: lerp(560, 610, u), z: lerp(1.0, 1.45, u) }; IV_FOCUS = 1;
  ivStage([
    { d: 2.2, draw: () => {
      const R = ivRoom({ back: [560, 210, 1460, 760], vp: [1010, 470], wall: '#c9a98e', side: '#a8846c', sideR: '#b8937a', floor: '#7a5440', ceil: '#d8bfa6', planks: 9, plankCol: 'rgba(60,30,20,0.22)', front: 2.8 });
      // window on the right wall, sun pouring across the floor
      ivQuad(R.R, 0.18, 0.62, 0.32, 0.86, '#ffe6b8', '#7c5a46', 10);
      ivQuad(R.R, 0.4, 0.42, 0.32, 0.86, '#7c5a46');
      ivLightPool([R.F(0.22, 0.55), R.F(0.58, 0.32), R.F(0.98, 0.05), R.F(0.6, 0.62)], 'rgba(255,214,150,0.28)');
      ivGlow(R.R(0.4, 0.6)[0], R.R(0.4, 0.6)[1], 520, 'rgba(255,220,160,0.45)');
      // far wall: poster, shelf with a trophy, a clock; on the left wall a door
      ivRR(700, 300, 150, 200, 6, '#3c6fd1'); ivText('SPACE', 775, 420, 34, '#ffe6c4');
      ivRR(1150, 400, 220, 14, 3, '#6b4a38'); ivRR(1180, 350, 40, 50, 6, '#e8b84a'); ivRR(1260, 360, 70, 40, 6, '#c94a3c');
      ivDot(1000, 300, 34, '#f4ead8'); ivLine(1000, 300, 1000 + Math.cos(TT * 0.3) * 22, 300 + Math.sin(TT * 0.3) * 22, 4, '#3a2a24');
      ivQuad(R.L, 0.12, 0.42, 0, 0.78, '#8a6650', '#5e4232', 6);
      ivBox(1180, 560, 230, 200, 0.22, R.vp, { front: '#8a6650', top: '#a8826a' });    // a desk against the far wall
      ivRR(1215, 470, 120, 90, 6, '#20242e'); ivRR(1222, 477, 106, 70, 4, '#3c6fd1'); // a laptop
      ivRays([R.R(0.2, 0.86), R.R(0.6, 0.32)], [R.F(0.3, 0.75), R.F(0.98, 0.15)], { n: 6, a: 0.12 });
    } },
    { d: 1, draw: () => {
      // the bed in perspective: the frame recedes toward the vanishing point
      ivAO(230, 1060, 1650, 1060, 60, 0.4);
      ivBox(230, 840, 1420, 220, 0.18, [1010, 470], { front: '#9c8fb8', top: '#ece6f4', side: '#7c6f98' });   // the bed
      ivRR(420, 640, 300, 140, 40, '#f6f2fb'); // pillow
      ivCastShadow(1000, 990, 420, { a: 0.25, len: 0.5 });
      ivMan({ who: CAST.kai, x: 900, y: 1000, h: 560, f: 0.25, pose: ivPose('sit', { hL: [0.18, 0.12], hR: [0.26, 0.1], fL: [0.17, 0.32], fR: [0.21, 0.32] }), expr: { eyes: 'wide', mouth: 'o', brow: 'up', look: [0.6, 0.5] } });
      // the blanket over his legs
      ivPoly([[560, 870], [1450, 860], [1600, 1000], [420, 1010]], '#7e6ca8'); ivLine(560, 872, 1450, 862, 6, 'rgba(255,255,255,0.18)');
      ivCat({ x: 1150, y: 880, s: 200, f: -1, coat: IV_COATS.orange, pose: 'loaf', talk: null, expr: { eyes: 'half', mouth: 'open' } });
    } },
  ]);
  ivTag('"BREAKFAST. NOW."', 1360, 230, 34, ivPop(0.6), { c: '#ffe6c4' });
}

// ---- 2: the bus stop, a street in perspective ------------------------------------
function lookStreet() {
  IV_M = { ...IV_MOOD.day, key: [0.85, -0.45], rim: '#fff0d4' }; const u = EZ.io(clamp((TT - 3) / 3)); IV_CAM = { x: lerp(760, 1120, u), y: 560, z: 1.12 }; IV_FOCUS = 1;
  const vp = [1180, 470];
  ivStage([
    { d: 3, draw: () => {
      ctx.fillStyle = ivVGrad(-200, 600, ['#7fb2e0', '#bcd8ee', '#f2e6d4']); ctx.fillRect(-1500, -500, 5000, 1300);
      ivDot(1700, 120, 60, '#fff6dc'); ivGlow(1700, 120, 400, 'rgba(255,240,200,0.5)');
      // buildings on both sides receding to the vanishing point
      const r = RNG('st').f;
      for (let i = 0; i < 7; i++) { const u = i / 7, u2 = (i + 1) / 7, k = (t) => 1 - Math.pow(1 - t, 1.6);
        const xa = lerp(-200, vp[0] - 40, k(u)), xb = lerp(-200, vp[0] - 40, k(u2)), ta = lerp(-150, vp[1] - 160, k(u)) - r() * 40, tb = lerp(-150, vp[1] - 160, k(u2));
        const ba = lerp(1100, vp[1] + 20, k(u)), bb = lerp(1100, vp[1] + 20, k(u2));
        ivPoly([[xa, ta], [xb, tb], [xb, bb], [xa, ba]], ['#c98e6a', '#b7a08a', '#9d8fb0', '#c7b48e'][i % 4]);
        for (let w = 0.2; w < 0.9; w += 0.25) ivPoly([[lerp(xa, xb, 0.25), lerp(ta, tb, 0.25) + (ba - ta) * w], [lerp(xa, xb, 0.7), lerp(ta, tb, 0.7) + (bb - tb) * w], [lerp(xa, xb, 0.7), lerp(ta, tb, 0.7) + (bb - tb) * (w + 0.12)], [lerp(xa, xb, 0.25), lerp(ta, tb, 0.25) + (ba - ta) * (w + 0.12)]], 'rgba(60,70,100,0.45)'); }
      ivPoly([[vp[0] + 60, vp[1] - 200], [2600, -300], [2600, 1100], [vp[0] + 60, vp[1] + 20]], '#d8c2a4');
      for (let j = 0; j < 6; j++) { const y = lerp(vp[1] - 150, -100, j / 6); ivLine(vp[0] + 60, lerp(vp[1] - 150, vp[1] + 10, j / 6), 2600, lerp(-250, 1050, j / 6), 2, 'rgba(90,60,40,0.18)'); }
    } },
    { d: 1.6, draw: () => {
      // road and sidewalk receding; lane marks converge
      ivPoly([[-800, 1150], [3000, 1150], [vp[0] + 30, vp[1] + 20], [vp[0] - 30, vp[1] + 20]], '#5c5a64');
      for (let i = 0; i < 9; i++) { const a = Math.pow(i / 9, 1.8), b = Math.pow((i + 0.45) / 9, 1.8); ivPoly([[lerp(vp[0], 1300, a) - 3, lerp(vp[1] + 20, 1150, a)], [lerp(vp[0], 1300, a) + 3, lerp(vp[1] + 20, 1150, a)], [lerp(vp[0], 1300, b) + 9, lerp(vp[1] + 20, 1150, b)], [lerp(vp[0], 1300, b) - 9, lerp(vp[1] + 20, 1150, b)]], '#f2e8c8'); }
      ivPoly([[-800, 1150], [vp[0] - 30, vp[1] + 20], [vp[0] - 80, vp[1] + 20], [-800, 900]], '#b9b0a4');
      for (let i = 0; i < 4; i++) { const t = (i + ((TT * 0.25) % 1)) / 4; const x = lerp(vp[0] - 40, -400, t * t), y = lerp(vp[1] + 30, 1000, t * t), sc = 0.1 + t * t * 0.9; ivMan({ who: i % 2 ? CAST.extraA : CAST.extraB, x, y, h: 480 * sc, f: -0.6, pose: ivPose('stand') }); }
    } },
    { d: 1, draw: () => {
      ivBox(980, 700, 520, 200, 0.12, [1180, 470], { front: '#9a8f86', top: '#c4b9ae', side: '#7a7068' });   // the low wall
      ivBox(1540, 300, 260, 600, 0.08, [1180, 470], { front: 'rgba(170,200,220,0.35)', top: '#5a6478', side: 'rgba(120,150,170,0.4)', line: '#e8f0f8' });   // the bus shelter glass
      ivLine(1640, 900, 1640, 380, 12, '#3a4458'); ivRR(1590, 360, 100, 70, 8, '#2f6fb8'); ivText('BUS', 1640, 408, 30, '#fff');
      ivCastShadow(760, 900, 560, { len: 1.1, a: 0.3 });
      ivMan({ who: CAST.kai, x: 760, y: 900, h: 560, f: 0.55, pose: ivPose('relaxed'), expr: { eyes: 'squint', mouth: 'flat', look: [1, -0.4] } });
      ivCastShadow(1180, 700, 170, { len: 1, a: 0.25 });
      ivCat({ x: 1180, y: 700, s: 175, f: -1, coat: IV_COATS.white, pose: 'sit', expr: { eyes: 'half', mouth: 'open' } });
    } },
  ]);
  ivTag('"YOUR HAIRCUT IS A TRAGEDY."', 1180, 330, 30, 1, { c: '#ffe6c4' });
}

// ---- 3: the alley at 3 a.m. ---------------------------------------------------
function lookAlley() {
  IV_M = { ...IV_MOOD.night, key: [-0.6, -0.6], rim: '#a9c4ff', vig: 0.7 }; const u = EZ.io(clamp((TT - 6) / 3)); IV_CAM = { x: 940, y: lerp(260, 560, u), z: lerp(1.25, 1.02, u) }; IV_FOCUS = 1;
  const vp = [960, 520];
  ivStage([
    { d: 4, draw: () => {
      ctx.fillStyle = ivVGrad(-300, 700, ['#05070f', '#111832', '#1e2746']); ctx.fillRect(-1500, -600, 5000, 1700);
      ivDot(1460, 150, 70, '#e9eefa'); ivGlow(1460, 150, 520, 'rgba(170,190,255,0.35)');
      const r = RNG('roof').f; for (let i = 0; i < 16; i++) { const x = -500 + i * 190, h = 120 + r() * 200; ctx.fillStyle = '#0c1020'; ctx.fillRect(x, 520 - h, 170, h + 400); if (r() < 0.5) ivRR(x + 60, 520 - h + 30, 26, 34, 2, '#f2b866'); }
    } },
    { d: 1.5, draw: () => {
      // the alley walls converge; wet cobbles reflect the moon
      ivPoly([[-600, -400], [vp[0] - 240, vp[1] - 220], [vp[0] - 240, vp[1] + 40], [-600, 1300]], '#1b2135');
      ivPoly([[2500, -400], [vp[0] + 240, vp[1] - 220], [vp[0] + 240, vp[1] + 40], [2500, 1300]], '#232a42');
      ivPoly([[-600, 1300], [vp[0] - 240, vp[1] + 40], [vp[0] + 240, vp[1] + 40], [2500, 1300]], '#141a2c');
      for (let i = 0; i < 8; i++) { const t = Math.pow(i / 8, 1.7), y = lerp(vp[1] + 40, 1300, t); ivLine(lerp(vp[0] - 240, -600, t), y, lerp(vp[0] + 240, 2500, t), y, 2, 'rgba(160,180,255,0.08)'); }
      ivGlow(1300, 980, 360, 'rgba(170,190,255,0.16)');
      // a door with a warm bulb on the right wall, steam from a vent
      ivPoly([[1700, 300], [1900, 220], [1900, 820], [1700, 760]], '#3a2f2a'); ivDot(1660, 260, 14, '#ffd38a'); ivGlow(1660, 260, 260, 'rgba(255,200,120,0.4)');
      ctx.save(); ctx.globalAlpha = 0.2; for (let i = 0; i < 4; i++) ivDot(560 + Math.sin(TT + i) * 20, 700 - mod(TT * 40 + i * 50, 200), 30 + i * 8, '#c8d4ff'); ctx.restore();
    } },
    { d: 1, draw: () => {
      // the garage wall in front, forty cats on top, eyes glowing
      ivBox(260, 560, 1400, 420, 0.1, [960, 360], { front: '#2a2f44', top: '#4a5070', side: '#1c2032' }); for (let i = 0; i < 7; i++) ivLine(260 + i * 200, 560, 260 + i * 200, 980, 3, 'rgba(0,0,0,0.25)');
      ivBox(1500, 860, 260, 220, 0.25, [960, 520], { front: '#3e5a46', top: '#567a60', side: '#2c4232' });   // a dumpster
      ivBox(150, 900, 160, 150, 0.2, [960, 520], { front: '#6a5034', top: '#8a6a48', side: '#4e3a26' }); ivBox(200, 760, 130, 140, 0.2, [960, 520], { front: '#735638', top: '#93714c', side: '#553f28' });   // crates
      ctx.save(); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(1250, 1040, 220, 26, 0, 0, TAU); ctx.fillStyle = '#9fb4ff'; ctx.fill(); ctx.restore(); ivDot(1250, 1040, 30, 'rgba(240,244,255,0.5)');
      const r = RNG('cats').f, coats = [IV_COATS.black, IV_COATS.tux, IV_COATS.grey, IV_COATS.calico, IV_COATS.kitten];
      for (let i = 0; i < 17; i++) { const x = 300 + i * 82 + r() * 20; if (Math.abs(x - 960) < 150) continue; ivCat({ x, y: 552, s: 105 + r() * 35, f: x < 960 ? 1 : -1, coat: { ...coats[i % 5], key: 'c' + i }, pose: r() < 0.3 ? 'loaf' : 'sit', expr: { eyes: r() < 0.3 ? 'angry' : 'open' } }); }
      ivCat({ x: 960, y: 552, s: 290, f: -1, coat: IV_COATS.grey, pose: 'sit', expr: { eyes: 'angry', mouth: 'open' } });
      ivCastShadow(470, 1100, 460, { len: 1.4, a: 0.4 });
      ivMan({ who: CAST.kai, x: 470, y: 1100, h: 460, f: 0.5, pose: ivPose('stand'), expr: { eyes: 'wide', look: [0, -1] } });
    } },
  ]);
  ivTag('3:00 A.M.', 230, 140, 30, 1);
}

// ---- 4: the slow blink, close-up ----------------------------------------------
function lookBlink() {
  IV_M = { ...IV_MOOD.night, key: [0.7, -0.6], rim: '#c8d8ff' }; const u = EZ.io(clamp((TT - 9) / 3)); IV_CAM = { x: lerp(980, 1080, u), y: 520, z: lerp(1.9, 2.4, u) }; IV_FOCUS = 1;
  ivStage([
    { d: 3, draw: () => {
      ctx.fillStyle = ivVGrad(-200, 900, ['#0a0f20', '#1a2240', '#26304e']); ctx.fillRect(-1500, -600, 5000, 2000);
      ivBox(300, 330, 900, 360, 0.3, [1500, 500], { front: '#5a3a32', top: '#6e4a40', side: '#3e2822' }); ivRR(340, 370, 200, 120, 6, '#1a1420'); ivRR(600, 370, 200, 120, 6, '#ffcf7a'); ivText('9', 1060, 470, 120, '#f2e2c4');
      ivRays([[620, 380], [790, 380]], [[520, 900], [980, 900]], { n: 4, a: 0.1 });
      ivGlow(700, 430, 300, 'rgba(255,200,120,0.4)');
    } },
    { d: 1, draw: () => {
      ivMan({ who: CAST.kai, x: 860, y: 1180, h: 640, f: 0.35, pose: ivPose('hug', { hL: [0.22, 0.08], hR: [0.26, 0.04] }), expr: { eyes: 'happy', mouth: 'smile' }, hands: 'mitten' });
      const u = 0.5 + 0.5 * Math.sin(TT * 2.2);
      ivCat({ x: 1180, y: 860, s: 330, f: -1, coat: IV_COATS.orange, pose: 'sit', expr: { blink: u } });
    } },
  ]);
  ivTag('SLOW BLINK = A CAT SMILE', 1200, 180, 30, 1, { c: '#ffe6c4' });
}

function sceneLook() {
  const s = Math.floor(TT / 3);
  if (s === 0) lookBedroom(); else if (s === 1) lookStreet(); else if (s === 2) lookAlley(); else lookBlink();
}

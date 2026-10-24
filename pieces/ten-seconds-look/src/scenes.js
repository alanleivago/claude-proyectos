// =====================================================================
//  STYLE FRAMES — ifverse look for "What If You Could See 10 Seconds Into the Future?"
//  1 lunch two-shot · 2 close-up · 3 the night bus, the ghost truck · 4 title over the street at sunset
// =====================================================================
const CAST = {
  you:    { key: 'you', top: 'hoodie', col: '#3aa36b', col2: '#23704a' },
  nia:    { key: 'nia', top: 'jacket', col: '#f2c230', col2: '#c4951a', hair: 'puffs', shirt: '#2c2a3a' },
  dad:    { key: 'dad', top: 'uniform', col: '#3d6fb6', col2: '#2a4f86', hat: 'buscap', build: 1.12 },
  kid:    { key: 'kid', top: 'tee', col: '#7a6c8a' },
  kid2:   { key: 'kid2', top: 'tee', col: '#5d7086' },
};
const GROUND = 900;   // the floor line at the actors' plane (base framing)

// ---- set pieces -------------------------------------------------------
function cafWall() {
  ctx.fillStyle = ivVGrad(-200, 1300, ['#2e2230', '#4b3644', '#5a4048']); ctx.fillRect(-1200, -400, 4300, 1900);
  for (let i = -2; i < 7; i++) {   // tall windows, warm afternoon light
    const x = 120 + i * 360;
    ivRR(x, 120, 250, 470, 10, ivVGrad(120, 590, ['#ffd9a0', '#f7b26f', '#e88d5f']));
    ivLine(x + 125, 120, x + 125, 590, 10, '#3a2a36', 'butt'); ivLine(x, 330, x + 250, 330, 10, '#3a2a36', 'butt');
    ivRR(x - 10, 110, 270, 490, 12, null, '#3a2a36', 14);
    ivGlow(x + 125, 360, 330, 'rgba(255,190,120,0.35)');
  }
  ivRR(-1200, 640, 4300, 30, 0, '#3a2a34');                       // wainscot rail
  ctx.fillStyle = '#3c2c37'; ctx.fillRect(-1200, 670, 4300, 700);
  // clock + a poster
  ivDot(1620, 70, 44, '#f3e6d0'); ivDot(1620, 70, 44 - 6, '#fff6e6'); ctx.save(); ctx.translate(1620, 70);
  const a = TT * 0.4; ivLine(0, 0, Math.cos(a) * 26, Math.sin(a) * 26, 4, '#2a2028'); ivLine(0, 0, Math.cos(-1.2) * 18, Math.sin(-1.2) * 18, 5, '#2a2028'); ctx.restore();
  ivRR(840, 200, 120, 160, 6, '#c8574a'); ivText('LUNCH', 900, 300, 26, '#ffe8cf');
}
function cafFloor() { ctx.fillStyle = ivVGrad(860, 1300, ['#3a2a30', '#2a1e24']); ctx.fillRect(-1200, 860, 4300, 600);
  for (let i = -6; i < 16; i++) ivLine(i * 170, 860, i * 260 - 600, 1300, 2, 'rgba(255,220,180,0.05)'); }
function cafTable(x, y, w, o = {}) {   // a long cafeteria table seen side-on: top at y
  ivRR(x - w / 2, y, w, 20, 6, o.top || '#8a6a6e'); ivRR(x - w / 2, y + 20, w, 14, 4, '#5c4248');
  ivLine(x - w * 0.38, y + 30, x - w * 0.38, y + 230, 14, '#2b2026', 'butt'); ivLine(x + w * 0.38, y + 30, x + w * 0.38, y + 230, 14, '#2b2026', 'butt');
  ivLine(x - w / 2, y + 2, x + w / 2, y + 2, 2, 'rgba(255,215,170,0.5)');
}
function tray(x, y, w, o = {}) { ivRR(x - w / 2, y - 10, w, 12, 4, o.c || '#d9cfc2'); ivRR(x - w * 0.3, y - 20, w * 0.25, 12, 6, '#e8a64c'); ivRR(x + w * 0.05, y - 18, w * 0.22, 10, 5, '#7cae5b'); }
function carton(x, y, s, ang = 0, c = '#f1ede4') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ivPoly([[-s * 0.3, 0], [s * 0.3, 0], [s * 0.3, -s * 0.9], [0, -s * 1.15], [-s * 0.3, -s * 0.9]], c);
  ivRR(-s * 0.3, -s * 0.6, s * 0.6, s * 0.28, 2, '#e6744a'); ivLine(s * 0.05, -s * 1.12, s * 0.2, -s * 1.5, s * 0.07, '#e2e2e2');
  ivLine(-s * 0.3, -s * 0.9, s * 0.3, -s * 0.9, 2, 'rgba(0,0,0,0.15)');
  ctx.restore();
}
function steam(x, y, k) { ctx.save(); ctx.globalAlpha = 0.25; for (let i = 0; i < 3; i++) { const yy = y - mod(TT * 30 + i * 22, 66); ivDot(x + Math.sin(TT * 2 + i + k) * 6, yy, 7 + i * 2, '#fff1dc'); } ctx.restore(); }

// ---- shot 1: lunch two-shot -------------------------------------------
function shotLunch() {
  IV_M = IV_MOOD.lunch; IV_CAM = { x: 980, y: 560, z: 1.2 * ivPush(0, 0.03, 1.8) }; IV_FOCUS = 1;
  ivStage([
    { d: 3.2, draw: () => { cafWall(); } },
    { d: 1.9, draw: () => {   // far tables, other kids
      cafFloor();
      cafTable(500, 640, 560); cafTable(1500, 640, 560);
      [[380, 0.3, 'kid'], [600, -0.4, 'kid2'], [1420, 0.5, 'kid2'], [1650, -0.3, 'kid']].forEach(([x, f, k], i) => ivMan({ who: CAST[k], x, y: 790, h: 300, f, pose: ivPose('sitDesk'), expr: { eyes: i % 2 ? 'happy' : 'open', mouth: 'smile' }, blinkKey: 'bg' + i }));
      cafTable(500, 640, 560); cafTable(1500, 640, 560);
    } },
    { d: 1, draw: () => {
      ivMan({ who: CAST.you, x: 700, y: GROUND, h: 520, f: 0.55, pose: ivPose('sitDesk', { hR: [0.36, 0.12], hL: [0.22, 0.16] }), expr: { eyes: 'squint', mouth: 'smirk' }, grip: { front: 'hold' } });
      ivMan({ who: CAST.nia, x: 1290, y: GROUND, h: 500, f: -0.55, pose: ivPose('sitDesk', { hR: [0.12, -0.1], tilt: -0.08 }), expr: { eyes: 'wide', mouth: 'o', brow: 'up' } });
      cafTable(990, 700, 900, { top: '#9a7a78' });
      tray(760, 702, 230);                                  // your tray: already moved aside
      carton(1170, 702, 70, -0.25);                         // Nia's juice, just starting to tip
      ivGhost(() => { carton(1100, 702, 70, -1.55); ctx.beginPath(); ctx.ellipse(980, 706, 150, 12, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); }, 0.6);   // ten seconds ahead: spilled
      steam(880, 690, 1);
    } },
    { d: 0.55, draw: () => { ivRR(-200, 960, 760, 260, 30, '#1c1418'); ivRR(1500, 940, 700, 300, 30, '#1c1418'); } },   // foreground chair backs, soft
  ]);
  ivTag('0.08 s', 1650, 200, 30, ivPop(0.3), { c: '#ffe2b0' });
}

// ---- shot 2: close-up, you ----------------------------------------------
function shotClose() {
  IV_M = IV_MOOD.lunch; IV_CAM = { x: 860, y: 520, z: 2.5 }; IV_FOCUS = 1;
  ivStage([
    { d: 3.2, draw: () => cafWall() },
    { d: 1.9, draw: () => { cafFloor(); cafTable(500, 640, 560); [[380, 0.3, 'kid'], [600, -0.4, 'kid2']].forEach(([x, f, k]) => ivMan({ who: CAST[k], x, y: 790, h: 300, f, pose: ivPose('sitDesk') })); } },
    { d: 1, draw: () => {
      ivGhost(() => ivMan({ who: CAST.nia, x: 1000, y: GROUND, h: 500, f: -0.55, pose: ivPose('reach'), expr: { eyes: 'happy', mouth: 'grin' } }), 0.35);
      ivMan({ who: CAST.you, x: 700, y: GROUND, h: 520, f: 0.35, pose: ivPose('think', { hR: [0.13, -0.02] }), expr: { eyes: 'squint', mouth: 'smirk', brow: 'angry', look: [1, 0] }, grip: { front: 'point' } });
    } },
  ]);
  // the ghost catches in the eye: a small cyan glint
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ivGlow(1170, 360, 160, 'rgba(90,230,255,0.25)'); ctx.restore();
}

// ---- shot 3: the night bus, the ghost truck -----------------------------
function streetNight() {
  ctx.fillStyle = ivVGrad(-100, 1100, ['#070b18', '#121a33', '#1d2440']); ctx.fillRect(-1500, -500, 5000, 2000);
  const r = RNG('bld').f;
  for (let i = 0; i < 14; i++) { const x = -600 + i * 260 + r() * 60, w = 180 + r() * 90, top = 80 + r() * 260;
    ctx.fillStyle = '#0d1226'; ctx.fillRect(x, top, w, 900);
    for (let yy = top + 30; yy < 760; yy += 54) for (let xx = x + 20; xx < x + w - 30; xx += 44) if (r() < 0.35) ivRR(xx, yy, 22, 30, 2, r() < 0.5 ? '#f6c06a' : '#e98d4c'); }
  ctx.fillStyle = ivVGrad(760, 1100, ['#1a2038', '#0c1022']); ctx.fillRect(-1500, 760, 5000, 600);
  for (let i = 0; i < 10; i++) { const x = -400 + i * 300; ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = ivVGrad(780, 1000, ['#f2a24f', 'rgba(0,0,0,0)']); ctx.fillRect(x, 780, 26, 220); ctx.restore(); }   // wet reflections
  // the traffic light, red
  ivLine(1530, 760, 1530, 300, 16, '#121522'); ivRR(1490, 250, 80, 210, 14, '#151a2a');
  ivDot(1530, 290, 24, '#ff3b30'); ivGlow(1530, 290, 140, 'rgba(255,60,40,0.55)'); ivDot(1530, 355, 22, '#3a2a10'); ivDot(1530, 420, 22, '#10301c');
  ivGlow(1530, 900, 160, 'rgba(255,60,40,0.18)');
}
function truck(x, y, s) {
  ivRR(x, y - s * 1.0, s * 1.9, s * 0.95, s * 0.06, '#c9ced8'); ivRR(x - s * 0.75, y - s * 0.8, s * 0.8, s * 0.75, s * 0.12, '#d9dee6');
  ivRR(x - s * 0.66, y - s * 0.72, s * 0.4, s * 0.3, s * 0.05, '#6e7d96'); ivDot(x - s * 0.5, y, s * 0.17, '#1a1d26'); ivDot(x + s * 1.5, y, s * 0.17, '#1a1d26');
  ivDot(x - s * 0.74, y - s * 0.2, s * 0.08, '#fff2c4'); ivGlow(x - s * 0.8, y - s * 0.2, s * 0.9, 'rgba(255,240,190,0.5)');
}
function rainLayer(n, len, a) { const r = RNG('rain', Math.floor(TT * 24) % 6).f; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#a9c4ff'; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) { const x = -200 + r() * 2400, y = -100 + r() * 1300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.25, y + len); ctx.stroke(); } ctx.restore(); }
function shotBus() {
  IV_M = IV_MOOD.rain; IV_CAM = { x: 960, y: 540, z: 1.0 }; IV_FOCUS = 1;
  ivStage([
    { d: 4, draw: () => { streetNight(); rainLayer(140, 40, 0.35); } },
    { d: 2, draw: () => ivGhost(() => truck(1120, 700, 330), 0.85), blur: 2 },
    { d: 1, draw: () => {
      // the windshield frame: dark bus interior around a wide window
      ctx.fillStyle = '#0d1018';
      ctx.beginPath(); ctx.rect(-400, -400, 2800, 2000); ctx.roundRect(120, 110, 1680, 560, 40); ctx.fill('evenodd');
      ivRR(120, 110, 1680, 560, 40, null, '#1d2333', 18);
      ivLine(960, 110, 960, 670, 16, '#151a26', 'butt');
      // raindrops on the glass
      const r = RNG('drops').f; ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 90; i++) { const x = 140 + r() * 1640, y = 130 + mod(r() * 520 + TT * (20 + r() * 40), 520); ivDot(x, y, 2 + r() * 4, 'rgba(200,220,255,0.6)'); } ctx.restore();
      // dashboard
      ctx.fillStyle = ivVGrad(640, 1100, ['#1c2232', '#0b0e16']); ctx.beginPath(); ctx.moveTo(-200, 700); ctx.quadraticCurveTo(960, 620, 2100, 700); ctx.lineTo(2100, 1200); ctx.lineTo(-200, 1200); ctx.fill();
      ivRR(330, 700, 180, 60, 10, '#0e2a22'); ivText('LINE 9', 420, 742, 30, '#5df0a8', { glow: 'rgba(80,255,170,0.8)', font: IV.sans });
      ivGlow(420, 730, 140, 'rgba(60,255,160,0.15)');
      // dad at the wheel, you at the rail
      ctx.beginPath(); ctx.ellipse(720, 790, 120, 120, 0, 0, TAU); ctx.lineWidth = 20; ctx.strokeStyle = '#05070c'; ctx.stroke();   // the wheel
      ivMan({ who: CAST.dad, x: 520, y: 1130, h: 640, f: 0.6, pose: ivPose('drive'), expr: { eyes: 'open', mouth: 'flat', look: [1, 0] } });
      ivLine(1300, 0, 1300, 1100, 20, '#c3c9d4'); ivLine(1290, 0, 1290, 1100, 4, 'rgba(255,255,255,0.4)');   // the pole
      ivMan({ who: CAST.you, x: 1420, y: 1100, h: 640, f: -0.3, pose: ivPose('point', { hR: [0.3, -0.08] }), expr: { eyes: 'wide', mouth: 'open', brow: 'up', look: [-1, -0.3] }, talk: null });
    } },
  ]);
  ivGlow(1530, 290, 200, 'rgba(255,40,30,0.05)');
}

// ---- shot 4: title over the street at sunset ------------------------------
function shotTitle() {
  IV_M = IV_MOOD.sunset; IV_CAM = { x: 960, y: 540, z: 1.0 * ivPush(3, 0.03, 1.8) }; IV_FOCUS = 1;
  ivStage([
    { d: 6, draw: () => {
      ctx.fillStyle = ivVGrad(-200, 900, ['#2a2350', '#5b3a6c', '#c4636a', '#f2a35e', '#ffd08a']); ctx.fillRect(-1500, -500, 5000, 1700);
      ivDot(960, 690, 90, '#fff0c8'); ivGlow(960, 690, 600, 'rgba(255,190,110,0.6)');
      ctx.save(); ctx.globalAlpha = 0.6; [[300, 220, 260], [1500, 160, 320], [1000, 300, 200]].forEach(([x, y, w]) => ivRR(x, y, w, 16, 8, '#f6b77a')); ctx.restore();
      ctx.fillStyle = '#3b2948'; const r = RNG('sky').f; for (let i = 0; i < 20; i++) { const x = -500 + i * 170, hh = 140 + r() * 260; ctx.fillRect(x, 760 - hh, 150, hh + 300); }
    } },
    { d: 2.2, draw: () => {
      const r = RNG('st2').f; ctx.fillStyle = '#2b1f33';
      [[-200, 330, 420], [260, 250, 380], [1380, 280, 420], [1800, 200, 420]].forEach(([x, top, w]) => { ctx.fillRect(x, top, w, 900);
        for (let yy = top + 40; yy < 760; yy += 70) for (let xx = x + 30; xx < x + w - 40; xx += 70) ivRR(xx, yy, 34, 44, 3, r() < 0.55 ? '#f7b468' : '#40304a'); });
      ivRR(660, 600, 600, 30, 4, '#3a2a42'); ivPoly([[660, 600], [1260, 600], [1230, 560], [690, 560]], '#a8453f');
      for (let i = 0; i < 6; i++) ivRR(690 + i * 95, 560, 48, 40, 0, i % 2 ? '#e9dccb' : '#a8453f');
      ivRR(700, 630, 520, 140, 0, '#2b1f33'); for (let i = 0; i < 4; i++) ivRR(720 + i * 125, 650, 90, 100, 4, '#f6b468');
    } },
    { d: 1, draw: () => {
      ctx.fillStyle = ivVGrad(780, 1100, ['#2a1f2c', '#16101a']); ctx.fillRect(-1500, 780, 5000, 600);
      ivLine(-1500, 782, 3500, 782, 3, 'rgba(255,200,140,0.35)');
      ivMan({ who: CAST.you, x: 900, y: 790, h: 160, f: 0.2, pose: ivPose('relaxed') });
      ivMan({ who: CAST.nia, x: 1010, y: 790, h: 150, f: -0.2, pose: ivPose('relaxed') });
      ivLine(300, 790, 300, 470, 8, '#1a1220'); ivDot(300, 470, 14, '#ffcf8a'); ivGlow(300, 470, 120, 'rgba(255,200,130,0.5)');
    } },
  ]);
  ivTitle('WHAT IF YOU COULD SEE', '10 SECONDS INTO THE FUTURE?', 'A  WHAT - IF  STORY', 960, 175, 1, 70);
}

function sceneLook() {
  const s = Math.floor(TT);
  if (s === 0) shotLunch(); else if (s === 1) shotClose(); else if (s === 2) shotBus(); else shotTitle();
  if (s === 1) ivCounter([['FUTURES CHANGED', 112, true], ['THANK-YOUS', 0]], 1);
}

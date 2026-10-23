// =====================================================================
//  SCENES — a casino slot bank (three machines, stools, LED jackpot banner, patterned carpet) and Milo on a stool.
//  Units: Milo's head radius = 1 (~0.22 m). Machine fronts at z = 0, reels centred at y = 5.95.
//  Everything is a pure function of TT + seeded RNG.
// =====================================================================
const G = {};
const MILO_K = 1.35, MILO_X = -2.3, MILO_Z = 5.5;
let M_BULB_OFF = null;
const INK = C3.ink;

// ---- code-drawn textures
function inked(x, txt, px, py, size, fill, o = {}) {
  x.save(); x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; x.textAlign = o.align ?? 'center'; x.textBaseline = 'middle';
  const maxW = o.maxW ?? x.canvas.width * 0.9, tw = x.measureText(txt).width;   // never spill past the sign: shrink to fit
  if (tw > maxW) { size *= maxW / tw; x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; }
  x.lineJoin = 'round'; if (o.stroke !== false) { x.strokeStyle = o.stroke ?? '#3a1208'; x.lineWidth = o.sw ?? size * 0.14; x.strokeText(txt, px, py); }
  x.fillStyle = fill; x.fillText(txt, px, py); x.restore();
}
function sym(x, kind, cx, cy, s) {   // a reel symbol, upright, centred, ~s tall
  x.save(); x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
  if (kind === '7') {
    x.font = `900 ${s * 1.15}px "Arial Black", "Segoe UI Black", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.strokeStyle = '#4a0d06'; x.lineWidth = s * 0.16; x.strokeText('7', 0, 0); x.fillStyle = '#e8321e'; x.fillText('7', 0, 0);
    x.strokeStyle = '#ffb347'; x.lineWidth = s * 0.03; x.strokeText('7', -s * 0.02, -s * 0.02);
  } else if (kind === 'cherry') {
    x.strokeStyle = '#3d7a26'; x.lineWidth = s * 0.07; x.beginPath(); x.moveTo(-s * 0.2, s * 0.05); x.quadraticCurveTo(-s * 0.05, -s * 0.35, s * 0.12, -s * 0.42); x.moveTo(s * 0.2, s * 0.08); x.quadraticCurveTo(s * 0.1, -s * 0.25, s * 0.12, -s * 0.42); x.stroke();
    for (const [dx, dy] of [[-0.2, 0.18], [0.2, 0.22]]) { x.beginPath(); x.arc(dx * s, dy * s, s * 0.2, 0, TAU); x.fillStyle = '#d41f2a'; x.fill(); x.strokeStyle = '#4a0d06'; x.lineWidth = s * 0.045; x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.arc((dx - 0.07) * s, (dy - 0.07) * s, s * 0.05, 0, TAU); x.fill(); }
  } else if (kind === 'bell') {
    x.beginPath(); x.moveTo(-s * 0.36, s * 0.28); x.quadraticCurveTo(-s * 0.3, -s * 0.38, 0, -s * 0.38); x.quadraticCurveTo(s * 0.3, -s * 0.38, s * 0.36, s * 0.28); x.closePath();
    x.fillStyle = '#e8b030'; x.fill(); x.strokeStyle = '#5a3a08'; x.lineWidth = s * 0.05; x.stroke();
    x.beginPath(); x.arc(0, s * 0.33, s * 0.08, 0, TAU); x.fillStyle = '#c88a1a'; x.fill(); x.stroke();
    x.beginPath(); x.arc(0, -s * 0.44, s * 0.06, 0, TAU); x.fill(); x.stroke();
  } else if (kind === 'bar') {
    const w = s * 0.95, h = s * 0.36; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h * 0.25); x.fillStyle = '#3a2210'; x.fill(); x.strokeStyle = '#e0a830'; x.lineWidth = s * 0.06; x.stroke();
    x.font = `900 ${s * 0.27}px "Arial Black", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#f6e8c8'; x.fillText('BAR', 0, s * 0.01);
  } else if (kind === 'diamond') {
    x.beginPath(); x.moveTo(-s * 0.36, -s * 0.12); x.lineTo(-s * 0.2, -s * 0.32); x.lineTo(s * 0.2, -s * 0.32); x.lineTo(s * 0.36, -s * 0.12); x.lineTo(0, s * 0.36); x.closePath();
    x.fillStyle = '#3aa8e8'; x.fill(); x.strokeStyle = '#0d3a5a'; x.lineWidth = s * 0.045; x.stroke();
    x.beginPath(); x.moveTo(-s * 0.36, -s * 0.12); x.lineTo(s * 0.36, -s * 0.12); x.moveTo(-s * 0.12, -s * 0.32); x.lineTo(0, s * 0.36); x.lineTo(s * 0.12, -s * 0.32); x.lineWidth = s * 0.025; x.stroke();
  }
  x.restore();
}
const REEL_SYM = ['7', 'cherry', 'bell', 'bar', 'diamond', '7', 'cherry', 'bar'];
const NSYM = REEL_SYM.length;
function texReel() {   // u (canvas x) runs around the reel, v (canvas y) along its axis: symbols drawn turned 90°
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d9c49a'); g.addColorStop(0.5, '#fbf1d6'); g.addColorStop(1, '#d9c49a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    REEL_SYM.forEach((k, i) => { x.save(); x.translate((i + 0.5) * w / NSYM, h / 2); x.rotate(Math.PI / 2); sym(x, k, 0, 0, h * 0.62); x.restore(); });
  }, 2048, 256);
}
function texSunburst(title, sub, theme) {
  return c3Tex((x, w, h) => {
    const cx = w / 2, cy = h * 0.62, n = 28;
    const cA = theme === 'gold' ? '#8a5a12' : '#d8261a', cB = theme === 'gold' ? '#c08a24' : '#f24a1e';
    x.fillStyle = cA; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, w, (i / n) * TAU, ((i + 0.5) / n) * TAU); x.closePath(); x.fillStyle = cB; x.fill(); }
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6); rg.addColorStop(0, 'rgba(255,220,120,0.55)'); rg.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h);
    // the title on an arc
    x.save(); x.font = `900 ${w * 0.15}px "Arial Black", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    const R = w * 0.62, L = title.length, spread = 0.13;
    for (let i = 0; i < L; i++) { const a = -Math.PI / 2 + (i - (L - 1) / 2) * spread; x.save(); x.translate(cx + Math.cos(a) * R, h * 0.86 + Math.sin(a) * R); x.rotate(a + Math.PI / 2);
      x.strokeStyle = '#4a1204'; x.lineWidth = w * 0.028; x.strokeText(title[i], 0, 0); x.fillStyle = '#ffd23c'; x.fillText(title[i], 0, 0); x.restore(); }
    x.restore();
    if (sub === '7s') { sym(x, '7', cx - w * 0.06, h * 0.63, h * 0.36); inked(x, 's', cx + w * 0.17, h * 0.71, w * 0.17, '#ffc226', { stroke: '#4a1204' }); }
    else { inked(x, sub, cx, h * 0.6, w * 0.15, '#ffd23c', { stroke: '#4a1204' }); for (let i = 0; i < 3; i++) sym(x, 'bar', cx - w * 0.25 + i * w * 0.25, h * 0.82, h * 0.13); }
    for (let i = 0; i < 5; i++) { const R2 = RNG('spark', title, i); x.fillStyle = '#fff6d8'; star4Tex(x, R2.r(w * 0.15, w * 0.85), R2.r(h * 0.25, h * 0.85), R2.r(6, 12)); }
  }, 512, 512);
}
function star4Tex(x, px, py, r) { x.beginPath(); x.moveTo(px, py - r); x.quadraticCurveTo(px, py, px + r, py); x.quadraticCurveTo(px, py, px, py + r); x.quadraticCurveTo(px, py, px - r, py); x.quadraticCurveTo(px, py, px, py - r); x.fill(); }
function texUpper() {
  return c3Tex((x, w, h) => {
    x.fillStyle = '#3c1410'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f2c230'; x.fillRect(0, 0, w, h * 0.05); x.fillRect(0, h * 0.95, w, h * 0.05);
    inked(x, 'PLAY 3 CREDITS', w * 0.62, h * 0.38, h * 0.2, '#f6d040', { stroke: '#2a0a06' });
    inked(x, '★ 1 LINE · $1 GAME ★', w * 0.62, h * 0.7, h * 0.12, '#fff3e0', { stroke: false });
    x.fillStyle = '#1a0806'; x.fillRect(w * 0.04, h * 0.32, w * 0.16, h * 0.4); x.strokeStyle = '#cfcfd6'; x.lineWidth = 6; x.strokeRect(w * 0.04, h * 0.32, w * 0.16, h * 0.4);
    inked(x, 'WIN', w * 0.12, h * 0.2, h * 0.11, '#f6d040', { stroke: false });
    inked(x, '0', w * 0.17, h * 0.52, h * 0.28, '#ff3a1a', { stroke: false, font: 'Consolas, monospace', weight: 700 });
  }, 1024, 256);
}
function texPaytable() {
  return c3Tex((x, w, h) => {
    x.fillStyle = '#b81c14'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c230'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
    inked(x, '★ LUCKY 7s PAYS ★', w / 2, h * 0.1, h * 0.06, '#fff3e0', { stroke: false });
    const rows = [['7', '7', '7', '=JACK$1,000'], ['diamond', 'diamond', 'diamond', '$100'], ['bell', 'bell', 'bell', '$50'], ['bar', 'bar', 'bar', '$10'], ['cherry', '', '', '$2']];
    rows.forEach((r, i) => { const y = h * (0.24 + i * 0.16);
      for (let k = 0; k < 3; k++) if (r[k]) { x.fillStyle = '#f8ecd0'; x.fillRect(w * (0.1 + k * 0.12), y - h * 0.06, w * 0.1, h * 0.12); sym(x, r[k], w * (0.15 + k * 0.12), y, h * 0.1); }
      inked(x, r[3], w * 0.78, y, h * 0.07, '#ffe9a8', { stroke: '#3a0a06' }); });
  }, 512, 512);
}
function texStars() {
  return c3Tex((x, w, h) => { x.fillStyle = '#d42a1a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c230'; x.fillRect(0, 0, w, h * 0.12); x.fillRect(0, h * 0.88, w, h * 0.12);
    for (let i = 0; i < 8; i++) { x.save(); x.translate((i + 0.5) * w / 8, h / 2); x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? h * 0.12 : h * 0.26; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.restore(); } }, 1024, 128);
}
function texLedBanner() {
  return c3Tex((x, w, h) => { x.fillStyle = '#120404'; x.fillRect(0, 0, w, h);
    x.font = `700 ${h * 0.72}px Consolas, "Courier New", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(255,40,20,0.12)'; x.fillText('8,888,888', w / 2, h * 0.54); x.fillStyle = '#ff3218'; x.fillText('$1,000,316', w / 2, h * 0.54); }, 1024, 160);
}
function texCarpet() {
  return c3Tex((x, w, h) => { x.fillStyle = '#2a1a3a'; x.fillRect(0, 0, w, h); const R = RNG('carpet');
    const cols = ['#e0a020', '#2aa0b0', '#c83a5a', '#4a3a8a', '#f0d070'];
    for (let i = 0; i < 160; i++) { x.fillStyle = R.pick(cols); x.globalAlpha = R.r(0.5, 0.9); const px = R.r(0, w), py = R.r(0, h), s = R.r(5, 16);
      if (i % 3) { x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill(); } else { x.save(); x.translate(px, py); x.rotate(R.r(0, TAU)); for (let k = 0; k < 6; k++) { x.rotate(TAU / 6); x.fillRect(0, -2, s * 2.2, 4); } x.restore(); } }
    x.globalAlpha = 1; }, 512, 512);
}
function texRibs(c1, c2) { return c3Tex((x, w, h) => { for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect(i * w / 32, 0, w / 32, h); } }, 512, 64); }
function texGrille() { return c3Tex((x, w, h) => { x.fillStyle = '#1c0e0c'; x.fillRect(0, 0, w, h); x.fillStyle = '#2c1814'; for (let j = 0; j < 12; j++) for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(10 + i * 17, 10 + j * 17, 4, 0, TAU); x.fill(); } }, 512, 210); }
function texPanelSide() {
  return c3Tex((x, w, h) => { x.fillStyle = '#c42218'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#141414'; x.fillRect(w * 0.15, h * 0.06, w * 0.7, h * 0.16); x.fillStyle = '#5ac8f0'; x.fillRect(w * 0.25, h * 0.13, w * 0.5, h * 0.04);
    inked(x, 'CREDITS', w / 2, h * 0.3, h * 0.04, '#f6d040', { stroke: false });
    x.fillStyle = '#140404'; x.fillRect(w * 0.15, h * 0.34, w * 0.7, h * 0.14); inked(x, '36', w * 0.6, h * 0.41, h * 0.11, '#ff3218', { stroke: false, font: 'Consolas, monospace', weight: 700 });
    x.fillStyle = '#141414'; x.fillRect(w * 0.12, h * 0.56, w * 0.76, h * 0.3); x.fillStyle = '#2acb6a'; x.fillRect(w * 0.2, h * 0.6, w * 0.6, h * 0.05);
    inked(x, '$1 $5 $10', w / 2, h * 0.72, h * 0.04, '#e8e8e8', { stroke: false }); inked(x, '$20 $50 $100', w / 2, h * 0.79, h * 0.04, '#e8e8e8', { stroke: false }); }, 256, 512);
}

// ---- the world
function g3() {
  if (G.scene) return G;
  const scene = new THREE.Scene(); G.scene = scene;
  G.cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 400);
  scene.add(new THREE.AmbientLight('#fff0e4', 0.3));
  scene.add(new THREE.HemisphereLight('#ffe2c0', '#3a1c2a', 0.45));
  const key = new THREE.DirectionalLight('#ffe9d0', 0.95); key.position.set(6, 14, 12); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffb070', 0.55); rim.position.set(-6, 9, -8); scene.add(rim);
  const warm = new THREE.PointLight('#ff6a30', 0.9, 22, 1.6); warm.position.set(0, 10, 3); scene.add(warm);
  scene.children.forEach((o) => o.isLight && o.layers.enableAll());   // lights must light every pass's layer

  const T = { reel: texReel(), upper: texUpper(), pay: texPaytable(), stars: texStars(), led: texLedBanner(), carpet: texCarpet(),
    ribs: texRibs('#c41c1c', '#9e1414'), grille: texGrille(), side: texPanelSide(),
    lucky: texSunburst('LUCKY', '7s', 'red'), gold: texSunburst('GOLD', 'RUSH', 'gold'), lucky2: texSunburst('LUCKY', '7s', 'red') };
  T.carpet.wrapS = T.carpet.wrapT = THREE.RepeatWrapping; T.carpet.repeat.set(10, 10);
  T.ribs.wrapS = THREE.RepeatWrapping; T.ribs.repeat.set(3, 1);
  const M = { red: c3Prop('#c41f17', { rough: 0.3 }), maroon: c3Prop('#4a1712', { rough: 0.5 }), chrome: c3Chrome(), dark: c3Prop('#22100c', { rough: 0.4 }), gold: c3Prop('#e2b23a', { rough: 0.25, metal: 0.9 }),
    bulbOn: c3Flat('#fff4c8', { glow: '#ffcf70' }), bulbOff: c3Prop('#7a6a50', { rough: 0.3 }), payline: c3Flat('#ff4a2a', { glow: '#ff3a1a' }) };
  const bx = (w, h, d, mat, x, y, z, ink = 0.03) => { const m = c3Mesh(c3RBox(w, h, d, Math.min(0.12, w * 0.2, h * 0.2, d * 0.2)), mat, ink); m.position.set(x, y, z); return m; };
  const plane = (w, h, map, x, y, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.flat ? c3Flat('#ffffff', { map, glow: o.glow }) : c3Prop('#ffffff', { map, rough: 0.35 })); m.position.set(x, y, z); return m; };

  // floor, back wall, ceiling
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), c3Prop('#ffffff', { map: T.carpet, rough: 0.95, env: 0.3 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), c3Prop('#2a120e', { rough: 0.8 })); wall.position.set(0, 20, -6); scene.add(wall);
  scene.add(bx(40, 2.6, 1.0, M.dark, 0, 17.6, -1.2, 0));
  scene.add(plane(14, 2.0, T.led, 0, 17.6, -0.69, { flat: true, glow: '#ff2a10' }));
  scene.add(bx(40, 0.25, 1.2, M.gold, 0, 13.25, -1.0, 0.02));
  M_BULB_OFF = M.bulbOff; G.bulbs = [];
  for (let i = 0; i < 46; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M.bulbOn); b.position.set(-11.5 + i * 0.5, 13.25, -0.38); scene.add(b); G.bulbs.push(b); }

  // a slot machine (front at local z = 0)
  G.reels = [];
  function machine(px, ry, pz, theme) {
    const g = new THREE.Group(); g.position.set(px, 0, pz); g.rotation.y = ry; scene.add(g);
    const body = theme === 'gold' ? c3Prop('#8a4a14', { rough: 0.3, metal: 0.3 }) : M.red;
    g.add(bx(5.0, 4.3, 3.0, body, 0, 2.15, -1.5));
    g.add(plane(3.6, 1.8, T.pay, -0.2, 3.15, 0.01));
    g.add(plane(3.6, 1.0, T.grille, -0.2, 1.1, 0.01));
    const deck = bx(5.2, 0.4, 1.3, M.dark, 0, 4.5, 0.4); deck.rotation.x = 0.16; g.add(deck);
    g.add(bx(0.8, 0.18, 0.5, c3Prop('#f2c230', { rough: 0.3 }), -1.6, 4.75, 0.55, 0.02));
    g.add(bx(0.8, 0.18, 0.5, c3Prop('#f0922a', { rough: 0.3 }), -0.5, 4.75, 0.55, 0.02));
    const spin = c3Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.22, 24), c3Prop('#e8281c', { rough: 0.2 }), 0.025); spin.position.set(1.5, 4.8, 0.5); g.add(spin);
    const ring = c3Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24), M.chrome, 0.02); ring.position.set(1.5, 4.7, 0.5); g.add(ring);
    // reel section: chrome frame around a window, the reels behind it
    g.add(bx(5.0, 2.6, 1.0, theme === 'gold' ? c3Prop('#5a3010') : M.maroon, 0, 6.0, -3.2, 0));   // the box behind the reels
    g.add(bx(5.0, 0.3, 3.0, M.maroon, 0, 7.15, -1.5, 0)); g.add(bx(5.0, 0.3, 3.0, M.maroon, 0, 4.85, -1.5, 0));
    g.add(bx(3.8, 0.34, 0.4, M.chrome, -0.55, 7.12, 0.02));
    g.add(bx(3.8, 0.34, 0.4, M.chrome, -0.55, 4.86, 0.02));
    g.add(bx(0.3, 2.6, 0.4, M.chrome, -2.6, 6.0, 0.02));
    g.add(bx(0.3, 2.6, 0.4, M.chrome, 1.5, 6.0, 0.02));
    g.add(plane(3.8, 0.28, T.stars, -0.55, 4.56, 0.32));
    g.add(bx(1.05, 2.6, 0.5, body, 2.15, 6.0, -0.1, 0.02));
    g.add(plane(0.9, 2.3, T.side, 2.15, 6.0, 0.16));
    const reels = [];
    for (let k = 0; k < 3; k++) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.12, 48, 1, true), c3Prop('#ffffff', { map: T.reel, rough: 0.35 }));
      r.rotation.order = 'ZYX'; r.rotation.z = Math.PI / 2; const holder = new THREE.Group(); holder.position.set(-1.8 + k * 1.24, 6.0, -1.35); holder.add(r); g.add(holder); reels.push(holder);
      if (k) g.add(bx(0.1, 2.3, 0.3, M.dark, -1.8 + k * 1.24 - 0.62, 6.0, -0.15, 0));
    }
    g.add(bx(3.7, 0.05, 0.05, M.payline, -0.55, 6.0, -0.05, 0));
    // upper panel and the arched topper with bulbs
    g.add(bx(5.0, 1.3, 2.4, c3Prop('#3c1410', { rough: 0.4 }), 0, 7.95, -1.2, 0.03));
    g.add(plane(4.9, 1.22, T.upper, 0, 7.95, 0.01));
    const sh = new THREE.Shape(); const tw = 2.35, tb = 8.7, tt = 12.6;
    sh.moveTo(-tw, tb); sh.lineTo(-tw, tt - tw * 0.85); sh.absarc(0, tt - tw * 0.85, tw, Math.PI, 0, true); sh.lineTo(tw, tb); sh.lineTo(-tw, tb);
    const topG = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 32 });
    const top = c3Mesh(topG, theme === 'gold' ? c3Prop('#3a2208', { rough: 0.3, metal: 0.5 }) : c3Prop('#5a1a10', { rough: 0.3 }), 0.04); top.position.z = -0.6; g.add(top);
    const face = new THREE.Mesh(new THREE.ShapeGeometry(sh, 32), c3Prop('#ffffff', { map: theme === 'gold' ? T.gold : T.lucky, rough: 0.25, emissive: '#ffffff', ei: 0.35, emissiveMap: theme === 'gold' ? T.gold : T.lucky }));
    { const uv = face.geometry.attributes.uv, pos = face.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + tw) / (2 * tw), (pos.getY(i) - tb) / (tt - tb)); }
    face.scale.set(0.86, 1, 1); face.position.set(0, (1 - 1) * 0, -0.08); g.add(face); G.toppers.push(face.material);
    const nb = 30;
    for (let i = 0; i < nb; i++) {   // bulbs around the arch
      const u = i / (nb - 1), L1 = tt - tw * 0.85 - tb, arcL = Math.PI * tw, tot = 2 * L1 + arcL, d = u * tot;
      let x, y; if (d < L1) { x = -tw * 0.93; y = tb + 0.25 + d; } else if (d < L1 + arcL) { const a = Math.PI - (d - L1) / tw; x = Math.cos(a) * tw * 0.93; y = tt - tw * 0.85 + Math.sin(a) * tw * 0.93; } else { x = tw * 0.93; y = tb + 0.25 + (tot - d); }
      const b = c3Mesh(new THREE.SphereGeometry(0.15, 10, 8), M.bulbOn, 0.03); b.position.set(x, y, -0.02); g.add(b); G.bulbs.push(b);
    }
    return reels;
  }
  G.toppers = [];
  G.reels = machine(0, 0, 0, 'red');
  machine(-5.7, 0.22, 0.9, 'gold');
  machine(5.7, -0.22, 0.9, 'red');
  machine(-11.0, 0.42, 3.0, 'red');
  machine(11.0, -0.42, 3.0, 'gold');

  // stools
  function stool(px, pz) {   // the refs' people are big next to the set: stools (and people) at 1.35x
    const g = new THREE.Group(); g.position.set(px, 0, pz); g.scale.setScalar(MILO_K);
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.16, 32), M.chrome, 0.03), 0, 0.08, 0));
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.2, 16), M.chrome, 0.03), 0, 1.8, 0));
    g.add(c3Put(c3Mesh(new THREE.TorusGeometry(0.85, 0.06, 8, 32), M.chrome, 0.025), 0, 1.6, 0, 0, Math.PI / 2));
    for (let k = 0; k < 4; k++) { const sp = c3Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6), M.chrome, 0.015); sp.position.set(Math.cos(k * TAU / 4) * 0.42, 1.6, Math.sin(k * TAU / 4) * 0.42); sp.rotation.set(0, -k * TAU / 4, Math.PI / 2); g.add(sp); }
    g.add(c3Put(c3Mesh(new THREE.CylinderGeometry(1.1, 0.95, 0.6, 32), c3Prop('#ffffff', { map: T.ribs, rough: 0.6 }), 0.04), 0, 3.55, 0));
    g.add(c3Put(c3Mesh(new THREE.SphereGeometry(1.1, 32, 10, 0, TAU, 0, 0.55), c3Prop('#d42420', { rough: 0.55 }), 0.03), 0, 3.48, 0, 0, 0, 0, [1, 0.6, 1]));
    scene.add(g); return g;
  }
  G.stool = stool(MILO_X, MILO_Z); stool(3.6, 4.6); stool(-8.2, 4.2);

  // Milo
  G.milo = c3Person({ key: 'milo', outfit: 'teal', hairStyle: 'ref', shirt: '#00c7b5', shirt2: '#3ae0d0', shade: '#16806e', patternColor: '#f4c430', tie: '#e2462f' });
  G.milo.g.position.set(MILO_X, 3.78 * MILO_K, MILO_Z + 1.3); G.milo.g.scale.setScalar(MILO_K); scene.add(G.milo.g);   // on the cushion's front edge: legs hang in front of it, like the ref
  c3Layer(G.milo.g, C3.L_FOCUS); c3Layer(G.stool, C3.L_FOCUS);
  c3Env(scene); c3Shadows(scene, key, 16);
  return G;
}

// ---- motion
// reel angle: spinning at v until it brakes over D seconds into a stop at symbol `sym` (+ offset in symbols), small settle
function reelAngle(t, stop, sym, off, v, D) {
  const step = TAU / NSYM, a0 = -((sym + 0.5 + off) / NSYM) * TAU;
  if (t >= stop) return a0 + 0.05 * step * Math.sin((t - stop) * 26) * Math.exp(-(t - stop) * 9);
  const dt = stop - t; return dt > D ? a0 - v * (dt - D / 2) : a0 - v * dt * dt / (2 * D);
}
// camera measured on ref 6: mid shot (1.3-2.5 s) head = 0.43 of the frame's width, its centre at 29 % / 27 %;
// close-up (3.65 s on) head = 0.56 of the width at 28 % / 33 %. fov 50.
const CAMK = [
  [0.0, [0.9, 6.05, 2.7], [0.25, 6.0, -0.3], 38],
  [0.35, [0.8, 6.1, 4.6], [0.1, 6.0, -0.2], 40],
  [0.85, [0.3, 7.0, 14.0], [-0.4, 6.7, 0.0], 47],
  [1.3, [-0.6, 5.2, 21.6], [-0.6, 7.05, 6.8], 50],   // low camera looking up: the machines tower behind him (ref)
  [2.5, [-0.7, 5.2, 21.0], [-0.7, 7.1, 6.8], 50],
  [3.65, [-0.94, 7.0, 18.6], [-0.94, 8.46, 6.8], 50],
  [4.5, [-0.96, 7.0, 18.1], [-0.96, 8.46, 6.8], 50],
];
const FACE = [[0, 'neutral'], [1.6, 'grin'], [2.44, 'smug']];   // as in ref 6
const SURPRISE = 1.6;

function sceneCasino() {
  const g = g3(), t = TT;
  // reels: 1st lands a 7 early, 2nd lands a 7 on "land", 3rd creeps and stops half a symbol short
  g.reels[0].children[0].rotation.y = reelAngle(t, 0.95, 0, 0, 16, 0.5);
  g.reels[1].children[0].rotation.y = reelAngle(t, 1.84, 5, 0, 16, 0.6);
  g.reels[2].children[0].rotation.y = reelAngle(t, 3.95, 0, 0.55, 16, 2.2);
  // the machine behind flares when he jolts (ref 6, frames 47-55): every bulb on, the topper glows
  const flare = t < SURPRISE - 0.08 ? 0 : Math.exp(-(t - SURPRISE + 0.08) * 2.6);
  const ph = Math.floor(t * 8);
  g.bulbs.forEach((b, i) => { b.material = flare < 0.3 && (i + ph) % 3 === 0 ? b.userData.off || (b.userData.off = M_BULB_OFF) : b.userData.on || (b.userData.on = b.material); });
  g.toppers.forEach((m) => { m.emissiveIntensity = 0.35 + 1.1 * flare; });
  const m = g.milo;
  c3SetCam(g.cam, c3CamAt(CAMK, t));   // the billboard faces the camera, so the camera comes first
  // pose (Milo-local units): right hand holds the lanyard, left fist rests on the knee, legs splay to the foot-rest
  const handR = [0.05, 1.7], handL = c3Hold([[0, [1.25, 0.4]], [3.62, [1.3, 0.25]], [3.82, [1.25, 0.4]]], t, 4 / 30);
  const head = c3Hold([[0, [0.05, 0, 0]], [SURPRISE, [-0.05, 0, 0]], [2.44, [0.07, 0.04, -0.06]], [3.0, [0.03, 0, -0.04]]], t, 5 / 30);
  const lean = c3Hold([[0, 0], [SURPRISE, -0.02], [2.44, 0.03], [3.0, 0.01]], t);
  const gaze = c3Hold([[0, [0.6, 0.1]], [3.0, [0, 0]]], t, 2 / 30);
  // the jolt: up ~0.37 in 4 frames on the surprise (ref: frames 47-51), settles back as the smirk comes in
  const lift = (u) => 0.37 * EZ.back(seg(u, SURPRISE - 0.06, SURPRISE + 0.08)) * (1 - EZ.io(seg(u, 2.4, 2.62)));
  c3PersonPose(m, g.cam, t, { head, lean, gaze, lift, expr: c3FaceAt(FACE, t, 'milo'),
    hand: { armL: handL, armR: handR }, foot: { legL: [0.95, -2.25], legR: [-0.8, -2.3] } });
  const bgBlur = lerp(0.0, 2.6, ss01(0.6, 1.2, t)) + lerp(0, 2.2, ss01(2.6, 3.6, t));
  c3Render(g.scene, g.cam, { bg: '#1a0c08', bgBlur, glow: 0.6 + 0.9 * flare, glowBlur: 14, bloom: 0.34, grade: 'saturate(1.35) contrast(1.18) brightness(0.86)' });
  c3Vignette(0.45); c3Grain(0.05);
  c3Subtitle(WORDS, t);
}
function ss01(a, b, x) { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); }

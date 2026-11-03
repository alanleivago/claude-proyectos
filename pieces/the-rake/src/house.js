// =====================================================================
//  HOUSE — a mountain minka in winter, night: the main room (tatami where we sleep, boards round the irori), the shōji
//  wall on the moon side (x = −4.5), the shōji partition to the baby's room (x = 3), thatch roof, snow, cedars outside.
//  The Rake (a pale hairless crouching thing with long claw fingers, two-bone IK on all fours), the woman (rig from
//  pieces/gashadokuro), the sleepers' heads, the ejiko cradle, the match, the torn panel, the scroll, the ofuda.
// =====================================================================
const HS = { x0: -4.5, x1: 5.5, z0: -3, z1: 3, xp: 3.0, h: 2.35, eng: -5.4 };
const IRORI = { x: 1.0, z: 0.6, s: 1.0 };
const inHouse = (x, z) => x > HS.x0 && x < HS.x1 && z > HS.z0 && z < HS.z1;
function groundAt(x, z) {
  if (inHouse(x, z)) return 0;
  if (x > HS.eng && x <= HS.x0 && z > HS.z0 && z < HS.z1) return -0.05;   // the engawa
  const d = Math.max(HS.x0 - x, x - HS.x1, HS.z0 - z, z - HS.z1, 0);
  return -0.5 + 0.35 * (fbm2(x * 0.12 + 3, z * 0.12) - 0.5) * ss(1, 5, d) + 0.6 * ss(14, 40, d) * fbm2(x * 0.04, z * 0.04 + 5);
}
// futons: [x, z, w (x), l (z) or along x, axis 'z' | 'x'] — the rake stands on their top (surfY)
const FUTON = { me: { x: -2.6, z: -0.6, w: 1.0, l: 2.0, ax: 'z' }, mil: { x: 0.8, z: -1.75, w: 1.0, l: 2.0, ax: 'x' } };
function surfY(x, z) { let y = groundAt(x, z); Object.values(FUTON).forEach((F) => { const [hw, hl] = F.ax === 'z' ? [F.w / 2, F.l / 2] : [F.l / 2, F.w / 2]; if (Math.abs(x - F.x) < hw && Math.abs(z - F.z) < hl) y = Math.max(y, 0.14); }); return y; }

// ---------------------------------------------------------------------
//  textures
// ---------------------------------------------------------------------
function texTatami() { return txCanvas('tatami', 128, 256, (x, w, h, R) => { x.fillStyle = '#8a8458'; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { x.fillStyle = R.pick(['rgba(60,56,30,0.22)', 'rgba(170,160,110,0.18)', 'rgba(90,84,50,0.15)']); x.fillRect(0, y, w, 1); }
  for (let i = 0; i < 40; i++) { x.fillStyle = R.pick(['rgba(60,50,30,0.2)', 'rgba(120,110,70,0.15)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 20), R); x.fill(); }
  x.fillStyle = '#1a1e1c'; x.fillRect(0, 0, 9, h); x.fillRect(w - 9, 0, 9, h); x.fillStyle = 'rgba(120,130,110,0.25)'; for (let y = 0; y < h; y += 6) { x.fillRect(2, y, 5, 2); x.fillRect(w - 7, y + 3, 5, 2); }
  x.fillStyle = 'rgba(20,16,10,0.5)'; x.fillRect(0, 0, w, 2); }, [1, 1]); }
function texShoji(key, base) { return txCanvas('shoji' + key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 1; const px = R.r(0, w), py = R.r(0, h); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R.n(6), py + R.n(6)); x.stroke(); }
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(120,96,60,0.12)'; blob(x, R.r(0, w), R.r(0, h), R.r(4, 12), R); x.fill(); } }, [1, 1]); }
function texTear() { return txCanvas('tear', 64, 128, (x, w, h, R) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000'; x.beginPath();
  const cx = 32, cy = 58; for (let i = 0; i <= 22; i++) { const a = (i / 22) * TAU, r = (i % 2 ? 14 : 27) * (0.8 + R.f() * 0.5); const px = cx + Math.cos(a) * r * 0.95, py = cy + Math.sin(a) * r * 1.6; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); x.fill();
  for (let i = 0; i < 6; i++) { crack(x, R, cx + R.n(10), cy + R.n(20), 4, R.n(6), R.n(8), '#000', 1.5); } }, [1, 1], false); }
function texKasuri(key, base, dot = '#c8ccc4') { return txCanvas('kas' + key, 128, 128, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 12), R); x.fill(); }
  x.fillStyle = dot; for (let gy = 8; gy < h; gy += 16) for (let gx = (gy / 16) % 2 ? 8 : 0; gx < w; gx += 16) { const jx = gx + R.n(1), jy = gy + R.n(1); x.globalAlpha = R.r(0.5, 0.9); x.fillRect(jx - 3, jy - 0.5, 2, 1.5); x.fillRect(jx + 1, jy - 0.5, 2, 1.5); x.fillRect(jx - 0.5, jy - 3, 1.5, 2); x.fillRect(jx - 0.5, jy + 1, 1.5, 2); }
  x.globalAlpha = 1; for (let i = 0; i < w; i += 2) { x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(i, 0, 1, h); } }, [2, 2]); }
function texAsh() { return txCanvas('ash', 128, 128, (x, w, h, R) => { x.fillStyle = '#5a5650'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { x.fillStyle = R.pick(['rgba(140,136,128,0.3)', 'rgba(40,36,32,0.35)', 'rgba(90,86,80,0.3)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 14), R); x.fill(); }
  for (let i = 0; i < 26; i++) { x.fillStyle = R.pick(['#e07028', '#c04818', '#f0a040']); blob(x, w / 2 + R.n(22), h / 2 + R.n(22), R.r(1.5, 5), R); x.fill(); } }, [1, 1]); }
function texSoot() { return txCanvas('soot', 128, 128, (x, w, h, R) => { x.fillStyle = '#1e1812'; x.fillRect(0, 0, w, h); vlines(x, R, w, h, 30, ['rgba(60,46,30,0.4)', 'rgba(10,8,6,0.5)'], [1, 3], 1); speckle(x, R, w, h, 300, ['rgba(255,240,220,0.05)']); }, [1, 1]); }
function texRakeSkin() { return txCanvas('rakeskin', 256, 256, (x, w, h, R) => { x.fillStyle = '#b4b6ac'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { x.fillStyle = R.pick(['rgba(140,146,140,0.35)', 'rgba(200,200,190,0.3)', 'rgba(120,118,104,0.25)', 'rgba(160,150,130,0.25)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 30), R); x.fill(); }
  for (let i = 0; i < 70; i++) crack(x, R, R.r(0, w), R.r(0, h), 7, R.n(5), R.r(2, 6), R.pick(['rgba(50,62,74,0.7)', 'rgba(70,40,40,0.55)']), R.r(1, 2));   // veins
  for (let i = 0; i < 7; i++) { x.strokeStyle = 'rgba(120,58,32,0.45)'; x.lineWidth = R.r(2, 5); x.beginPath(); let px = R.r(0, w), py = R.r(0, h); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += R.n(3); py += R.r(5, 12); x.lineTo(px, py); } x.stroke(); }   // rust streaks
  speckle(x, R, w, h, 900, ['rgba(60,60,50,0.2)', 'rgba(255,255,250,0.08)'], [1, 2]); }, [1, 1]); }
function texScroll() { return txCanvas('scroll', 128, 384, (x, w, h, R) => { x.fillStyle = '#c8b890'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 50; i++) { x.fillStyle = R.pick(['rgba(140,110,60,0.18)', 'rgba(90,70,40,0.12)']); blob(x, R.r(0, w), R.r(0, h), R.r(6, 26), R); x.fill(); }
  // columns of brush writing (strokes, not a font)
  x.strokeStyle = 'rgba(24,18,12,0.85)'; x.lineCap = 'round';
  for (let c = 0; c < 5; c++) { const cx = w - 14 - c * 16; for (let y = 16; y < 150; y += 13) { x.lineWidth = R.r(1.4, 2.4); x.beginPath(); x.moveTo(cx - 4 + R.n(1), y + R.n(1)); x.lineTo(cx + 4, y + R.n(2)); x.moveTo(cx + R.n(2), y - 3); x.lineTo(cx + R.n(2), y + 6); x.stroke(); } }
  // the crouched figure in ink: a hunched back, long arms, claws, big round eyes
  x.save(); x.translate(64, 268); x.strokeStyle = '#140e0a'; x.fillStyle = 'rgba(20,14,10,0.18)'; x.lineWidth = 2.2;
  x.beginPath(); x.moveTo(-40, 40); x.quadraticCurveTo(-30, -30, 8, -36); x.quadraticCurveTo(28, -38, 34, -18); x.quadraticCurveTo(36, 4, 22, 10); x.stroke();
  x.beginPath(); x.arc(30, -26, 12, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#140e0a'; x.beginPath(); x.arc(26, -27, 3.4, 0, TAU); x.arc(35, -26, 3, 0, TAU); x.fill();
  x.beginPath(); x.moveTo(14, -16); x.lineTo(30, 20); x.lineTo(44, 40); x.moveTo(30, 20); x.lineTo(50, 34); x.moveTo(-10, -20); x.lineTo(-20, 18); x.lineTo(-8, 44); x.moveTo(-36, 24); x.lineTo(-52, 8); x.lineTo(-44, 46); x.stroke();
  for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(44, 40); x.quadraticCurveTo(52 + k * 3, 46, 58 + k * 2, 56 + k * 2); x.stroke(); }
  x.restore(); x.fillStyle = '#9a2a1a'; x.fillRect(16, 344, 16, 16); x.fillStyle = 'rgba(200,180,140,0.6)'; x.fillRect(19, 347, 10, 2); x.fillRect(22, 351, 2, 6); }, [1, 1]); }
function texOfuda() { return txCanvas('ofuda', 32, 96, (x, w, h, R) => { x.fillStyle = '#d8d0b8'; x.fillRect(0, 0, w, h); x.fillStyle = '#9a2a1a'; x.fillRect(8, 6, 16, 14);
  x.strokeStyle = '#141010'; x.lineWidth = 2; x.lineCap = 'round'; for (let y = 28; y < 86; y += 10) { x.beginPath(); x.moveTo(10 + R.n(2), y); x.lineTo(22 + R.n(2), y + R.n(2)); x.moveTo(16 + R.n(2), y - 3); x.lineTo(16 + R.n(2), y + 6); x.stroke(); }
  x.fillStyle = 'rgba(120,96,60,0.25)'; blob(x, 20, 70, 8, R); x.fill(); }, [1, 1]); }
function texScratch() { return txCanvas('scratch', 64, 64, (x, w, h, R) => { x.clearRect(0, 0, w, h); for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(8,6,4,0.95)'; x.lineWidth = 3; x.beginPath(); x.moveTo(12 + k * 11, 6 + k * 2); x.quadraticCurveTo(16 + k * 11, 34, 10 + k * 12, 60 - k * 3); x.stroke(); x.strokeStyle = 'rgba(200,170,120,0.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(14 + k * 11, 8 + k * 2); x.quadraticCurveTo(18 + k * 11, 34, 12 + k * 12, 58 - k * 3); x.stroke(); } }, [1, 1]); }

// ---------------------------------------------------------------------
//  the house: floors, irori, walls, shōji, posts, beams, roof, props
// ---------------------------------------------------------------------
function plane(w, h, mat, pos, rot, par) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.copy(pos); m.rotation.set(rot[0], rot[1], rot[2] || 0); m.receiveShadow = true; m.castShadow = true; (par || WJ.scene).add(m); return m; }
function mkHouse(Wd) {
  const S = Wd.scene, darkW = SM({ map: texPlank('wallp', '#3a2c1e') }), boardM = SM({ map: texPlank('floor', '#4a3624'), color: '#c8b8a0' }), post = SM({ map: texPlank('post', '#2e2218') }), soot = SM({ map: texSoot(), side: THREE.DoubleSide });
  const tat = SM({ map: texTatami() }); tat.map.repeat.set(4, 3);
  plane(3.9, 6, tat, V3(-2.55, 0, 0), [-Math.PI / 2, 0, 0]);
  const tat2 = SM({ map: texTatami().clone() }); tat2.map.needsUpdate = true; tat2.map.repeat.set(2.5, 3); plane(2.5, 6, tat2, V3(4.25, 0, 0), [-Math.PI / 2, 0, 0]);
  // boards round the irori hole (x −0.6..3, hole x 0.5..1.5, z 0.1..1.1)
  const I = IRORI, hx0 = I.x - I.s / 2, hx1 = I.x + I.s / 2, hz0 = I.z - I.s / 2, hz1 = I.z + I.s / 2;
  [[-0.6, HS.xp, -3, hz0], [-0.6, HS.xp, hz1, 3], [-0.6, hx0, hz0, hz1], [hx1, HS.xp, hz0, hz1]].forEach(([a, b, c, d]) => { const m = SM({ map: texPlank('floor', '#4a3624').clone(), color: '#c8b8a0' }); m.map.needsUpdate = true; m.map.repeat.set((b - a) / 1.2, (d - c) / 1.2); plane(b - a, d - c, m, V3((a + b) / 2, 0.002, (c + d) / 2), [-Math.PI / 2, 0, 0]); });
  void boardM;
  // the irori: a dark frame, pit walls, ash, charred logs, embers; the jizai-kagi hook and an iron kettle
  { const fr = SM({ color: '#1c140e' }); [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([sx, sz]) => { const L = I.s + 0.2; bx(sx ? 0.1 : L, 0.06, sz ? 0.1 : L, fr, I.x + sx * (I.s / 2 + 0.05), -0.02, I.z + sz * (I.s / 2 + 0.05), S); });
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([sx, sz]) => bx(sx ? 0.02 : I.s, 0.2, sz ? 0.02 : I.s, SM({ color: '#2a2018' }), I.x + sx * I.s / 2, -0.1, I.z + sz * I.s / 2, S));
    plane(I.s, I.s, SM({ map: texAsh() }), V3(I.x, -0.12, I.z), [-Math.PI / 2, 0, 0]);
    const ch = SM({ map: texDeadBark('char', '#2a2018') }); [[0.4, 0.2], [-0.3, 2.0], [0.1, 4.1]].forEach(([o, a]) => { const l = cyl(0.04, 0.05, 0.6, ch, 7); l.rotation.set(Math.PI / 2, 0, a); l.position.set(I.x + Math.cos(a) * 0.12 + o * 0.05, -0.08, I.z + Math.sin(a) * 0.12); S.add(l); });
    Wd.emb = []; const R = RNG('emb'); for (let i = 0; i < 14; i++) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), BM('#ff8a30')); e.position.set(I.x + R.n(0.12), -0.09, I.z + R.n(0.12)); e.userData.ph = R.r(0, TAU); S.add(e); Wd.emb.push(e); }
    const pole = cyl(0.025, 0.025, 1.9, SM({ map: texDeadBark('bam', '#5a4a30') }), 7); pole.position.set(I.x, 1.6, I.z); S.add(pole);
    const fish = bx(0.32, 0.1, 0.04, SM({ map: texPlank('fish', '#3a2a1a') }), I.x, 1.05, I.z, S); void fish;
    const ket = sph(0.14, SM({ color: '#1a1a1a', roughness: 0.5 }), 1, 0.8, 1); ket.position.set(I.x, 0.52, I.z); S.add(ket); const lid = cyl(0.05, 0.06, 0.03, SM({ color: '#141414' }), 10); lid.position.set(I.x, 0.63, I.z); S.add(lid);
    const hk = new THREE.Mesh(UCYL1, SM({ color: '#141414' })); between(hk, V3(I.x, 0.64, I.z), V3(I.x, 0.66, I.z).add(V3(0, 0.0, 0)), 0.006); S.add(hk);
    const sp = cyl(0.01, 0.01, 0.42, SM({ color: '#141414' }), 5); sp.position.set(I.x, 0.86, I.z); S.add(sp);
    const spout = cyl(0.015, 0.025, 0.12, SM({ color: '#1a1a1a' }), 6); spout.rotation.z = -0.9; spout.position.set(I.x + 0.16, 0.56, I.z); S.add(spout); }
  // walls: back (z −3), front (z +3) with the baby room's barred window, right (x 5.5); thickness 0.08
  const wall = (x0, x1, z0, z1, y0, y1, m = darkW) => { const b = bx(Math.max(0.08, x1 - x0), y1 - y0, Math.max(0.08, z1 - z0), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, S); b.material = m; return b; };
  wall(HS.x0, HS.x1, -3.04, -2.96, 0, HS.h); wall(HS.x0, 4.0, 2.96, 3.04, 0, HS.h); wall(4.8, HS.x1, 2.96, 3.04, 0, HS.h); wall(4.0, 4.8, 2.96, 3.04, 0, 1.0); wall(4.0, 4.8, 2.96, 3.04, 1.5, HS.h);
  wall(5.46, 5.54, HS.z0, HS.z1, 0, HS.h);
  for (let k = 0; k < 6; k++) { const b = cyl(0.016, 0.016, 0.5, SM({ map: texDeadBark('bam', '#5a4a30') }), 6); b.position.set(4.06 + k * 0.136, 1.25, 3.0); S.add(b); }
  // the moon-side shōji wall (x −4.5): six panels, a sill and lintel, a plank band above; posts at z −3, 0, 3
  Wd.paperOut = BM('#9db4b0', { side: THREE.DoubleSide }); Wd.paperOutT = Wd.paperOut;
  const kum = [], kumC = '#2a1e14';
  const panel = (cx, cz, ax, w, h, holeOk) => { const pm = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, h - 0.06), null); pm.position.set(cx, h / 2, cz); pm.rotation.y = ax === 'x' ? Math.PI / 2 : 0; pm.castShadow = false; pm.receiveShadow = false; S.add(pm);
    const at = (lw, lh, dx, dy) => { const v = ax === 'x' ? V3(cx, dy, cz + dx) : V3(cx + dx, dy, cz); kum.push([new THREE.BoxGeometry(ax === 'x' ? 0.03 : lw, lh, ax === 'x' ? lw : 0.03), M4c(v.x, v.y, v.z), kumC]); };
    at(w, 0.05, 0, 0.025); at(w, 0.05, 0, h - 0.025); at(0.05, h, -w / 2 + 0.025, h / 2); at(0.05, h, w / 2 - 0.025, h / 2);
    for (let i = 1; i < 3; i++) at(0.014, h, -w / 2 + i * w / 3, h / 2); for (let j = 1; j < 7; j++) at(w, 0.014, 0, j * h / 7); void holeOk; return pm; };
  Wd.outPanels = []; for (let k = 0; k < 6; k++) Wd.outPanels.push(panel(HS.x0, -2.5 + k, 'x', 1.0, 1.8));
  Wd.outPanels.forEach((p) => (p.material = Wd.paperOut));
  wall(HS.x0 - 0.04, HS.x0 + 0.04, HS.z0, HS.z1, 1.8, HS.h, SM({ map: texLime(), color: '#8a8e84' }));
  // the partition to the baby's room (x 3): four panels z −1.8..1.8, plank either side; panel 2 tears (beat 7)
  Wd.paperIn = SM({ map: texShoji('in', '#cfcab8'), color: '#7a7668', side: THREE.DoubleSide });
  Wd.inPanels = []; for (let k = 0; k < 4; k++) Wd.inPanels.push(panel(HS.xp, -1.35 + k * 0.9, 'x', 0.9, 1.8));
  Wd.inPanels.forEach((p) => (p.material = Wd.paperIn));
  { const tp = Wd.inPanels[2], tm = SM({ map: texShoji('in', '#cfcab8'), alphaMap: texTear(), alphaTest: 0.5, color: '#d8d4c4', side: THREE.DoubleSide }); const torn = new THREE.Mesh(tp.geometry, tm); torn.position.copy(tp.position); torn.rotation.copy(tp.rotation); S.add(torn); torn.visible = false;
    const flaps = []; const R = RNG('flap'); for (let i = 0; i < 7; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.06, 0, 0, 0.06, 0, 0, R.n(0.03), -R.r(0.1, 0.22), 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); g.computeVertexNormals();
      const f = new THREE.Mesh(g, Wd.paperIn); const a = (i / 7) * TAU; f.position.set(HS.xp + 0.02 + R.r(0, 0.04), 0.9 + Math.sin(a) * 0.28, tp.position.z + Math.cos(a) * 0.17); f.rotation.set(0, Math.PI / 2 + R.n(0.6), a + Math.PI / 2 + R.n(0.4)); f.userData.ph = R.r(0, TAU); f.userData.r0 = f.rotation.clone(); S.add(f); flaps.push(f); }
    Wd.tear = { intact: tp, torn, flaps }; }
  wall(HS.xp - 0.04, HS.xp + 0.04, HS.z0, -1.8, 0, HS.h); wall(HS.xp - 0.04, HS.xp + 0.04, 1.8, HS.z1, 0, HS.h); wall(HS.xp - 0.04, HS.xp + 0.04, -1.8, 1.8, 1.8, HS.h, soot);
  Wd.kumiko = shd(new THREE.Mesh(mergeG(kum), SM({ vertexColors: true, map: texPlank('kum', '#5a4430') }))); S.add(Wd.kumiko);
  // sills, lintels, posts, beams
  const beam = (x0, y0, z0, x1, y1, z1, r, m = post) => { const b = bx(Math.max(r, Math.abs(x1 - x0)), r, Math.max(r, Math.abs(z1 - z0)), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, S); return b; };
  beam(HS.x0, 0.02, HS.z0, HS.x0, 0.02, HS.z1, 0.1); beam(HS.x0, 1.82, HS.z0, HS.x0, 1.82, HS.z1, 0.08); beam(HS.xp, 0.02, -1.8, HS.xp, 0.02, 1.8, 0.1); beam(HS.xp, 1.82, -1.8, HS.xp, 1.82, 1.8, 0.08);
  [[HS.x0, HS.z0], [HS.x0, 0], [HS.x0, HS.z1], [HS.x1, HS.z0], [HS.x1, HS.z1], [HS.xp, HS.z0], [HS.xp, HS.z1], [HS.xp, 1.8], [-0.6, HS.z0]].forEach(([x, z]) => beam(x, HS.h / 2, z, x, HS.h / 2, z, 0.14).scale.set(1, HS.h / 0.14, 1));
  Wd.daikoku = beam(HS.xp, HS.h / 2, -1.8, HS.xp, HS.h / 2, -1.8, 0.24); Wd.daikoku.scale.set(1, HS.h / 0.24, 1);
  [[HS.z0], [0], [HS.z1]].forEach(([z]) => beam(HS.x0, HS.h + 0.1, z, HS.x1, HS.h + 0.1, z, 0.2)); [HS.x0, -0.6, HS.xp, HS.x1].forEach((x) => beam(x, HS.h + 0.05, HS.z0, x, HS.h + 0.05, HS.z1, 0.18));
  { const g = taperTube([V3(HS.x0, HS.h + 0.3, -1.4), V3(-1.5, HS.h + 0.55, -1.3), V3(1.5, HS.h + 0.5, -1.5), V3(HS.x1, HS.h + 0.32, -1.4)], 0.17, 0.15, 8, 12, { seed: 4 }); const m = shd(new THREE.Mesh(g, SM({ map: texDeadBark('beam', '#2a2018') }))); S.add(m); }
  // the roof: thatch outside, soot inside (does not shade the moon through the shōji)
  { const w = HS.x1 - HS.x0, d = HS.z1 - HS.z0, cx = (HS.x0 + HS.x1) / 2, th = SM({ map: texThatch(), side: THREE.DoubleSide });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1, true).rotateY(Math.PI / 4), th); roof.scale.set((w + 2.4) * 0.72, 4.2, (d + 2.4) * 0.72); roof.position.set(cx, HS.h + 1.9, 0); roof.receiveShadow = true; S.add(roof); Wd.roof = roof;
    const inn = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1, true).rotateY(Math.PI / 4), soot); inn.scale.set((w + 2.2) * 0.72, 4.1, (d + 2.2) * 0.72); inn.position.set(cx, HS.h + 1.85, 0); S.add(inn);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4), SM({ color: '#d0d6d2' })); cap.scale.set((w + 2.4) * 0.5, 2.95, (d + 2.4) * 0.5); cap.position.set(cx, HS.h + 2.5, 0); S.add(cap);
    const ridge = bx(w * 0.42, 0.25, 0.4, SM({ map: texThatch(), color: '#7a6a50' }), cx, HS.h + 3.95, 0, S); void ridge; }
  // the engawa (veranda) outside the shōji, the outer face of the walls
  { const m = SM({ map: texPlank('eng', '#5a4632') }); m.map.repeat.set(1, 4); bx(0.9, 0.08, 6.4, m, (HS.eng + HS.x0) / 2, -0.09, 0, S); [HS.z0 - 0.1, 0, HS.z1 + 0.1].forEach((z) => { const p = cyl(0.06, 0.07, 0.5, post, 6); p.position.set(HS.eng + 0.05, -0.38, z); S.add(p); }); }
  // props: the kamidana with a shimenawa, a tansu, an andon (unlit), the mino and hat on the wall, firewood, bowls
  { const wd = SM({ map: texPlank('kami', '#4a3828') }); bx(0.9, 0.04, 0.32, wd, -1.2, 1.95, -2.82, S); bx(0.36, 0.3, 0.22, wd, -1.2, 2.12, -2.84, S); const rf = shd(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.12, 4).rotateY(Math.PI / 4), wd)); rf.scale.set(1, 1, 0.6); rf.position.set(-1.2, 2.33, -2.84); S.add(rf);
    const rope = shd(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 5, 24, Math.PI), SM({ map: texStraw(), color: '#c8b888' }))); rope.rotation.z = Math.PI; rope.scale.set(0.7, 0.18, 1); rope.position.set(-1.2, 2.0, -2.62); S.add(rope);
    for (let i = 0; i < 3; i++) shideAt(S, V3(-1.6 + i * 0.4, 1.9, -2.6), 0.6); }
  { const m = SM({ map: texPlank('tansu', '#3a2416') }); bx(0.9, 1.0, 0.42, m, -3.7, 0.5, -2.74, S); for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const k = sph(0.018, SM({ color: '#8a6a30', roughness: 0.4 })); k.position.set(-3.92 + c * 0.44, 0.15 + r * 0.24, -2.52); S.add(k); } }
  { const g = new THREE.Group(); g.position.set(-3.05, 0, 1.5); S.add(g); const fr = SM({ color: '#1e160e' }); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => bx(0.02, 0.62, 0.02, fr, a * 0.11, 0.31, b * 0.11, g));
    Wd.andonM = BM('#e8a050', { side: THREE.DoubleSide }); const pp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.2), Wd.andonM); pp.position.y = 0.4; pp.castShadow = false; g.add(pp); bx(0.26, 0.03, 0.26, fr, 0, 0.6, 0, g);
    Wd.andonAt = V3(-3.05, 0.42, 1.5); Wd.andonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,220,150,1)'], [0.25, 'rgba(255,160,70,0.45)'], [1, 'rgba(220,110,40,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); S.add(Wd.andonGlow); }
  { const mino = shd(new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.8, 10, 1, true), SM({ map: texMino(), side: THREE.DoubleSide }))); mino.position.set(-1.6, 1.25, 2.9); mino.scale.set(1, 1, 0.35); S.add(mino);
    const hat = shd(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.13, 20, 1, true), SM({ map: texStraw(), color: '#e0d0a8', side: THREE.DoubleSide }))); hat.rotation.x = -Math.PI / 2 + 0.15; hat.position.set(-0.8, 1.45, 2.88); S.add(hat); }
  { const R = RNG('wood'), m = SM({ map: texDeadBark() }); for (let k = 0; k < 18; k++) { const f = cyl(0.05, 0.055, 0.5, m, 6); f.rotation.x = Math.PI / 2; f.position.set(2.2 + (k % 6) * 0.11 + R.n(0.01), 0.05 + Math.floor(k / 6) * 0.095, -2.7); S.add(f); } }
  { const m = SM({ color: '#3a1e14', roughness: 0.4 }); [[1.9, -0.3], [2.05, -0.2], [0.05, 1.5]].forEach(([x, z]) => { const b = sph(0.07, m, 1, 0.5, 1); b.position.set(x, 0.03, z); S.add(b); }); }
  // claw scratches (shown from beat 7 on): on the big post, on the boards before the partition
  Wd.scr = []; { const m = new THREE.MeshBasicMaterial({ map: texScratch(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    Wd.scr.push(plane(0.22, 0.5, m, V3(HS.xp - 0.125, 0.75, -1.8), [0, -Math.PI / 2, 0.1])); Wd.scr.push(plane(0.3, 0.45, m, V3(2.55, 0.006, 0.55), [-Math.PI / 2, 0, 0.5])); Wd.scr.push(plane(0.25, 0.4, m, V3(2.75, 0.006, 0.1), [-Math.PI / 2, 0, -0.3])); Wd.scr.forEach((s) => (s.castShadow = false)); }
  // the ofuda on the post by my futon (beat 11)
  { Wd.ofudaPost = plane(0.08, 0.24, SM({ map: texOfuda() }), V3(HS.x0 + 0.075, 1.35, 0), [0, Math.PI / 2, 0]); Wd.ofudaPost.castShadow = false; }
  // the scroll on the boards (beat 10)
  { const g = new THREE.Group(); g.position.set(2.1, 0.012, 0.9); g.rotation.y = 0.35; S.add(g); const p = plane(0.34, 1.0, SM({ map: texScroll() }), V3(0, 0, 0), [-Math.PI / 2, 0, 0], g); p.castShadow = false;
    [-0.52, 0.52].forEach((z) => { const r = cyl(0.025, 0.025, 0.42, SM({ color: '#3a1e12' }), 8); r.rotation.z = Math.PI / 2; r.position.set(0, 0.022, z); g.add(r); }); Wd.scroll = g; }
}
function shideAt(par, p, s = 1) { const pts = [0, 0, 0.03, -0.03, 0, -0.06, 0.03, -0.09, 0, -0.12, 0.03, -0.15]; const P = []; for (let i = 0; i < pts.length - 2; i += 2) { const [x0, y0, x1, y1] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]]; P.push(x0 * s, y0 * s, 0, x0 * s + 0.025 * s, y0 * s, 0, x1 * s, y1 * s, 0, x0 * s + 0.025 * s, y0 * s, 0, x1 * s + 0.025 * s, y1 * s, 0, x1 * s, y1 * s, 0); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, SM({ color: '#e8e4d8', side: THREE.DoubleSide })); m.position.copy(p); par.add(m); return m; }

// the outside: snowy ground, cedars in a ring, a stone step and a woodpile
function mkOutside(Wd) {
  const cA = lin('#c4ccc8'), cB = lin('#9aa6a2'), cD = lin('#5a4a34'), tmp = new THREE.Color();
  const xs = gridAxis(-90, 90, [[-20, 20]], 0.6, 3), zs = gridAxis(-90, 90, [[-20, 20]], 0.6, 3);
  Wd.ground = heightMesh(xs, zs, (x, z) => (inHouse(x, z) ? -0.5 : groundAt(x, z)) - 0.01, (x, z) => tmp.copy(cA).lerp(cB, fbm2(x * 0.3, z * 0.3)).lerp(cD, ss(0.62, 0.7, fbm2(x * 0.5 + 9, z * 0.5)) * 0.6).clone(), SM({ map: texFrost(), vertexColors: true, color: '#e8e4dc' }));
  Wd.ground.material.map.repeat.set(4, 4); Wd.scene.add(Wd.ground);
  const R = RNG('cedars'), pts = [];
  for (let i = 0; i < 6000 && pts.length < 700; i++) { const x = R.r(-80, 80), z = R.r(-80, 80), d = Math.hypot(x / 1.4, z); if (d < 10 || (x < -6 && Math.abs(z - 6) < 9 && x > -30)) continue; pts.push([x, z, R.r(12, 24), R.r(0.2, 0.36), R.f()]); }
  const trunk = IM(new THREE.CylinderGeometry(0.7, 1, 1, 7), SM({ map: texCedarBark() }), pts.length), tiers = 5, cone = IM(new THREE.ConeGeometry(1, 1, 8), SM({ map: texNeedles(), color: '#9aa69a' }), pts.length * tiers);
  pts.forEach(([x, z, h, r, f], i) => { const y = groundAt(x, z) - 0.4; trunk.setMatrixAt(i, M4c(x, y + h / 2, z, f * 6, r, h, r));
    for (let k = 0; k < tiers; k++) { const ty = y + h * (0.42 + k * 0.13), cr = h * 0.085 * (1 - k * 0.15) * (0.8 + f * 0.4), ch = h * 0.24; cone.setMatrixAt(i * tiers + k, M4c(x + Math.sin(k + f * 9) * 0.15, ty + ch / 2, z + Math.cos(k * 2 + f) * 0.15, f * 9 + k, cr, ch, cr)); } });
  Wd.scene.add(trunk); Wd.scene.add(cone); Wd.cedarIM = [trunk, cone];
  { const m = SM({ map: texStone('step', 0.4) }); bx(0.9, 0.2, 0.5, m, HS.eng - 0.4, -0.42, 0, Wd.scene); }
  { const m = SM({ map: texDeadBark() }); for (let k = 0; k < 24; k++) { const f = cyl(0.06, 0.065, 0.6, m, 6); f.rotation.x = Math.PI / 2; f.position.set(HS.x0 + 0.4 + (k % 8) * 0.13, -0.44 + Math.floor(k / 8) * 0.12, HS.z1 + 0.5); Wd.scene.add(f); } const sn = bx(1.2, 0.08, 0.7, SM({ color: '#d0d6d2' }), HS.x0 + 0.85, -0.05, HS.z1 + 0.5, Wd.scene); void sn; }
}

// ---------------------------------------------------------------------
//  futons and the sleepers: a kakebuton draped over a body lump; heads on buckwheat pillows
// ---------------------------------------------------------------------
function futonGeo(w, l, lump) {   // local: width x, length z (+z = feet), top surface displaced by lump(u, v) (u −1..1, v −1 head .. 1 feet)
  const g = new THREE.PlaneGeometry(w + 0.16, l + 0.12, 16, 24); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), u = x / (w / 2), v = z / (l / 2), edge = Math.max(Math.abs(u), Math.abs(v)); p.setY(i, (0.11 + lump(u, v)) * (1 - ss(0.92, 1.08, edge)) + 0.015 + 0.006 * Math.sin(x * 23 + z * 17)); }
  g.computeVertexNormals(); return g;
}
function mkFuton(Wd, F, lump, key, base) {
  const g = new THREE.Group(); g.position.set(F.x, 0, F.z); g.rotation.y = F.ax === 'x' ? -Math.PI / 2 : 0; Wd.scene.add(g);
  bx(F.w, 0.07, F.l, SM({ map: texCloth('shiki' + key, '#b8b0a0') }), 0, 0.035, 0, g);
  const kake = shd(new THREE.Mesh(futonGeo(F.w, F.l * 0.86, lump), SM({ map: texKasuri(key, base), side: THREE.DoubleSide }))); kake.position.z = F.l * 0.07; g.add(kake);
  const pil = cyl(0.09, 0.09, 0.42, SM({ map: texKasuri(key + 'p', '#5a2a1e', '#c8b090') }), 10); pil.rotation.z = Math.PI / 2; pil.scale.set(1, 1, 0.7); pil.position.set(0, 0.1, -F.l / 2 + 0.16); g.add(pil);
  return { g, kake, pil };
}
const lumpBody = (u, v) => 0.09 * Math.exp(-((u / 0.42) ** 2)) * ss(-1.0, -0.75, v) * (1 - ss(0.75, 1.0, v)) * (1 - 0.35 * ss(0.1, 0.7, v));
function mkSleeper(Wd, faceKey, hair, old) {
  const H = new THREE.Group(); Wd.scene.add(H); const sk = shd(new THREE.Mesh(new THREE.SphereGeometry(0.095, 22, 16), SM({ map: texFaceOf(faceKey), color: '#ffffff', roughness: 0.75 }))); sk.scale.set(0.9, 1.05, 0.98); sk.rotation.y = -Math.PI / 2; H.add(sk);
  const hm = SM({ color: hair, roughness: 0.6 }), cap = sph(0.1, hm, 0.95, 0.85, 0.95); cap.position.set(0, 0.03, -0.025); H.add(cap); const bun = sph(old ? 0.04 : 0.048, hm); bun.position.set(0, old ? 0.06 : 0.02, -0.1); H.add(bun);
  return H;
}
// the ejiko: a straw basket cradle, the baby wrapped inside, a small red hood
function mkEjiko(Wd) {
  const g = new THREE.Group(); g.position.set(4.3, 0, 0.6); Wd.scene.add(g); const st = SM({ map: texStraw(), color: '#c8b080', side: THREE.DoubleSide });
  const b = shd(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.36, 18, 1, true), st)); b.position.y = 0.18; g.add(b); const bot = cyl(0.26, 0.26, 0.03, st, 18); bot.position.y = 0.015; g.add(bot);
  const rim = shd(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 22), SM({ map: texStraw(), color: '#a08860' }))); rim.rotation.x = Math.PI / 2; rim.position.y = 0.36; g.add(rim);
  for (let k = 0; k < 4; k++) { const r = shd(new THREE.Mesh(new THREE.TorusGeometry(0.28 - k * 0.01, 0.012, 4, 22), SM({ color: '#6a5634' }))); r.rotation.x = Math.PI / 2; r.position.y = 0.08 + k * 0.08; g.add(r); }
  const quilt = sph(0.25, SM({ map: texKasuri('baby', '#7a2a20', '#d8c8a8') }), 1, 0.45, 1); quilt.position.y = 0.3; g.add(quilt);
  const head = shd(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), SM({ map: texFaceOf('girl'), color: '#ffffff' }))); head.rotation.y = -Math.PI / 2; head.rotation.x = -0.9; head.position.set(0, 0.38, -0.06); g.add(head);
  const hood = sph(0.068, SM({ color: '#8e3a24' }), 1, 1, 1, 12); hood.position.set(0, 0.39, -0.1); hood.scale.set(1, 0.9, 0.8); g.add(hood);
  return { g, rimY: 0.36, r: 0.3 };
}
// a match: a thin stick in the fist (local X), a red head, the flame sprite and its light
function mkMatch(Wd) {
  const g = new THREE.Group(); Wd.scene.add(g); const st = cyl(0.0022, 0.0022, 0.055, SM({ color: '#c8a870' }), 5); st.rotation.z = Math.PI / 2; st.position.x = 0.02; g.add(st);
  const hd = sph(0.0042, SM({ color: '#2a1410' }), 1.3, 1, 1, 6); hd.position.x = 0.048; g.add(hd);
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,245,200,1)'], [0.3, 'rgba(255,190,90,0.8)'], [1, 'rgba(230,110,30,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); Wd.scene.add(fl);
  return { g, fl, tip: V3(0.052, 0, 0) };
}

// ---------------------------------------------------------------------
//  THE RAKE: pale, hairless, emaciated, crouched on all fours; knees above the hips, long arms with four long claw
//  fingers; a long skull with big black asymmetric sockets (a white pin in each, the left one red), a slit mouth of
//  thin teeth; a frayed shimenawa with shide round its neck, an ofuda stuck to its back, rust streaks on the skin.
// ---------------------------------------------------------------------
const RK = { uArm: 0.37, fArm: 0.35, thigh: 0.4, shin: 0.42 };
function mkClaw(par, skin, clawM, sd, foot) {
  const hg = new THREE.Group(); par.add(hg); const s = foot ? 0.85 : 1;
  const palm = sph(1, skin, 0.036 * s, 0.014, (foot ? 0.07 : 0.045)); palm.position.z = foot ? 0.04 : 0.032; hg.add(palm); hg.add(sph(1, skin, 0.028, 0.02, 0.028));
  hg.userData.f = [];
  for (let f = 0; f < 4; f++) { let p = new THREE.Group(); p.position.set((f - 1.5) * 0.017 * -sd * s, 0, (foot ? 0.1 : 0.072) - Math.abs(f - 1.4) * 0.006); p.rotation.y = (f - 1.5) * 0.16 * -sd; hg.add(p); const segs = [];
    (foot ? [0.045, 0.035, 0.03] : [0.09, 0.08, 0.068]).forEach((L0, j) => { const L = L0 * (1 - Math.abs(f - 1.3) * 0.08), sg = new THREE.Group(); sg.position.z = j ? segs[j - 1].userData.L : 0; p.add(sg); const r = (0.0072 - j * 0.0011) * s, c = capsule(r, L, skin, 6); c.rotation.x = Math.PI / 2; c.position.z = L / 2; sg.add(c); sg.add(sph(r * 1.35, skin)); sg.userData.L = L; segs.push(sg); p = sg; });
    const cl = shd(new THREE.Mesh(new THREE.ConeGeometry(0.0048 * s, foot ? 0.025 : 0.045, 5), clawM)); cl.rotation.x = Math.PI / 2 + 0.35; cl.position.set(0, -0.003, segs[2].userData.L + 0.018); segs[2].add(cl); segs[2].userData.claw = cl; hg.userData.f.push(segs); }
  if (!foot) { const th = new THREE.Group(); th.position.set(sd * 0.03, -0.006, 0.02); th.rotation.set(0.2, sd * 0.7, 0); hg.add(th); const a = capsule(0.0068, 0.06, skin, 6); a.rotation.x = Math.PI / 2; a.position.z = 0.03; th.add(a); const cl = shd(new THREE.Mesh(new THREE.ConeGeometry(0.0045, 0.035, 5), clawM)); cl.rotation.x = Math.PI / 2 + 0.3; cl.position.z = 0.075; th.add(cl); hg.userData.th = th; }
  hg.userData.sd = sd; return hg;
}
function clawTips(h) { h.updateMatrixWorld(true); return h.userData.f.map((s) => s[2].localToWorld(V3(0, -0.012, s[2].userData.L + 0.04))); }
function mkRake(Wd) {
  const S = Wd.scene, K = { parts: [] }, skin = K.skinM =SM({ map: texRakeSkin(), color: '#ffffff', roughness: 0.55 }), clawM = SM({ color: '#2a241c', roughness: 0.35 }), dark = BM('#030304');
  const add = (m) => { S.add(m); K.parts.push(m); return m; };
  K.chest = add(new THREE.Group()); { const c = sph(1, skin, 0.145, 0.125, 0.2); K.chest.add(c);
    for (let k = 0; k < 6; k++) { const z = -0.12 + k * 0.045, f = Math.sqrt(Math.max(0, 1 - (z / 0.2) ** 2)), r = shd(new THREE.Mesh(new THREE.TorusGeometry(1, 0.055, 4, 18), skin)); r.scale.set(0.147 * f, 0.127 * f, 0.147 * f); r.position.z = z; r.rotation.z = 0.2; K.chest.add(r); }
    [-1, 1].forEach((sd) => { const b = sph(1, skin, 0.05, 0.012, 0.075); b.position.set(sd * 0.075, 0.105, -0.06); b.rotation.set(0.25, 0, sd * 0.35); K.chest.add(b); });
    const of = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.16), SM({ map: texOfuda(), side: THREE.DoubleSide })); of.rotation.set(-Math.PI / 2 + 0.15, 0, 0.12); of.position.set(0.02, 0.131, -0.04); K.chest.add(of); }
  K.pelvis = add(sph(1, skin, 0.115, 0.085, 0.1)); K.belly = add(shd(new THREE.Mesh(UCYL, skin))); K.neck = add(shd(new THREE.Mesh(UCYL, skin)));
  K.vert = [...Array(16)].map(() => add(sph(0.017, skin, 1, 0.8, 1.2, 8)));
  K.arm = [1, -1].map((sd) => ({ sd, up: add(shd(new THREE.Mesh(UCYL, skin))), fo: add(shd(new THREE.Mesh(UCYL, skin))), sj: add(sph(0.034, skin)), ej: add(sph(0.028, skin, 1, 1, 1.3)) }));
  K.arm.forEach((a) => { a.hand = mkClaw(S, skin, clawM, a.sd === 1 ? -1 : 1); K.parts.push(a.hand); });
  K.leg = [1, -1].map((sd) => ({ sd, th: add(shd(new THREE.Mesh(UCYL, skin))), sh: add(shd(new THREE.Mesh(UCYL, skin))), kj: add(sph(0.03, skin, 1, 1.2, 1)), hj: add(sph(0.04, skin)) }));
  K.leg.forEach((l) => { l.foot = mkClaw(S, skin, clawM, l.sd === 1 ? -1 : 1, true); K.parts.push(l.foot); });
  // the head: +z face, +y up
  const Hd = add(new THREE.Group()); K.head = Hd;
  { const sk = sph(1, skin, 0.082, 0.118, 0.115); sk.position.set(0, 0.025, -0.005); Hd.add(sk); const back = sph(1, skin, 0.078, 0.1, 0.1); back.position.set(0, 0.05, -0.06); Hd.add(back);
    const low = sph(1, skin, 0.06, 0.074, 0.064); low.position.set(0, -0.058, 0.035); Hd.add(low);
    [-1, 1].forEach((sd) => { const cb = sph(1, skin, 0.022, 0.014, 0.02); cb.position.set(sd * 0.05, -0.02, 0.072); Hd.add(cb); });
    const brow = sph(1, skin, 0.08, 0.022, 0.045); brow.position.set(0, 0.038, 0.082); brow.rotation.x = 0.35; Hd.add(brow);
    // sockets: big, black, slanted, asymmetric and cracked; a white pin in each, the left one red
    const sL = sph(1, dark, 0.022, 0.04, 0.022); sL.position.set(0.039, 0.01, 0.092); sL.rotation.z = 0.75; Hd.add(sL);
    const sR = sph(1, dark, 0.019, 0.033, 0.02); sR.position.set(-0.04, 0.0, 0.09); sR.rotation.z = -0.62; Hd.add(sR);
    K.pinL = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 6, 4), BM('#c8261a')); K.pinL.position.set(0.037, 0.004, 0.113); Hd.add(K.pinL);
    K.pinR = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 4), BM('#e8ece4')); K.pinR.position.set(-0.039, -0.003, 0.109); Hd.add(K.pinR);
    [[0.06, 0.04, 0.6], [0.07, -0.01, -0.5], [0.028, 0.05, 1.3]].forEach(([x, y, a]) => { const c = bx(0.003, 0.03, 0.003, dark, x, y, 0.095, Hd); c.rotation.z = a; c.position.z = 0.1 - Math.abs(x) * 0.15; });
    [-1, 1].forEach((sd) => { const n = sph(0.0045, dark); n.position.set(sd * 0.008, -0.028, 0.116); Hd.add(n); });
    // mouth: a dark slit with the upper teeth from the gum; the jaw (hinged) with the lower teeth inside the upper arc
    // raw flesh round the sockets (sunken, red-brown, a few dark veins)
    const raw = SM({ color: '#5a2418', roughness: 0.4 }); [[0.039, 0.01, 0.087, 0.027, 0.045, 0.75], [-0.04, 0.0, 0.085, 0.024, 0.038, -0.62]].forEach(([x, y, z, sx, sy, r]) => { const m = sph(1, raw, sx * 1.18, sy * 1.15, 0.018); m.position.set(x, y, z); m.rotation.z = r; Hd.add(m); });
    // mouth: a grin from ear to ear, two rows of long flat human teeth on red gums; the jaw (hinged) opens it into a pit
    K.mouth = sph(1, dark, 0.07, 0.01, 0.03); K.mouth.position.set(0, -0.082, 0.078); Hd.add(K.mouth);
    const tooth = SM({ color: '#d4cbb0', roughness: 0.35 }), gumM = SM({ color: '#6a1e16', roughness: 0.3 });
    const gumU = shd(new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.008, 4, 20, Math.PI * 0.78), gumM)); gumU.rotation.set(Math.PI / 2, 0, Math.PI * 0.11); gumU.scale.set(1, 0.9, 1); gumU.position.set(0, -0.074, 0.032); Hd.add(gumU);
    for (let i = 0; i < 16; i++) { const a = (i - 7.5) * 0.15, t = shd(new THREE.Mesh(new THREE.BoxGeometry(0.0085, 0.026 - Math.abs(i - 7.5) * 0.0009, 0.004), tooth)); t.position.set(Math.sin(a) * 0.072, -0.088, 0.032 + Math.cos(a) * 0.078); t.rotation.y = a; Hd.add(t); }
    const J = new THREE.Group(); J.position.set(0, -0.07, 0.0); Hd.add(J); K.jaw = J;
    const ch = sph(1, skin, 0.06, 0.022, 0.07); ch.position.set(0, -0.04, 0.05); J.add(ch);
    const gumL = shd(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.007, 4, 20, Math.PI * 0.78), gumM)); gumL.rotation.set(Math.PI / 2, 0, Math.PI * 0.11); gumL.position.set(0, -0.03, 0.032); J.add(gumL);
    for (let i = 0; i < 14; i++) { const a = (i - 6.5) * 0.16, t = shd(new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.022, 0.004), tooth)); t.position.set(Math.sin(a) * 0.064, -0.02, 0.032 + Math.cos(a) * 0.069); t.rotation.y = a; J.add(t); }
    // the shimenawa round the neck (a twisted straw rope, frayed) and four zigzag shide
    K.rope = add(new THREE.Group()); const rope = shd(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 20), SM({ map: texStraw(), color: '#c8b888' }))); K.rope.add(rope);
    const rope2 = shd(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 4, 20), SM({ color: '#8a7a50' }))); rope2.rotation.z = 0.4; rope2.scale.set(1.02, 1.02, 1); K.rope.add(rope2);
    for (let i = 0; i < 4; i++) { const a = -0.4 + i * 0.95 + (i > 1 ? 1.2 : 0); const sh = shideAt(K.rope, V3(Math.cos(a) * 0.065, Math.sin(a) * 0.065, 0), 0.55); sh.rotation.set(Math.PI / 2, 0, a + Math.PI / 2); } }
  K.parts.forEach((m) => m.traverse((o) => { if (o.isMesh) o.frustumCulled = false; }));
  return K;
}
const qFrom = (X, Y, Z) => qBasis(X, Y, Z);
// pose the rake. o: { p (ground point under the body), yaw, lift, arch, s (crawl distance from p0) / p0+D, gait: bool,
//   hands: [V3|null, V3|null] (wrist targets), handZ: [V3], curl: [a, b], head: { yaw, pitch, roll }, jaw (0..1), feet: [V3, V3] }
function poseRake(Wd, o) {
  const K = Wd.rake; K.parts.forEach((m) => (m.visible = true));
  const F = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)), U = V3(0, 1, 0), X = U.clone().cross(F), lift = o.lift ?? 0, arch = o.arch ?? 0;
  let p = o.p.clone(); const Lc = 0.55, s = o.s ?? 0;
  if (o.gait) p = o.p.clone().addScaledVector(F, s);
  const bob = o.gait ? 0.015 * Math.cos(TAU * 2 * s / Lc) : 0;
  const L = (x, y, z) => p.clone().addScaledVector(X, x).addScaledVector(U, y + bob).addScaledVector(F, z);
  const Pv = L(0, 0.47 + lift, -0.34), M = L(0, 0.64 + lift + arch, -0.08), Ch = L(0, 0.56 + lift + arch * 0.5, 0.16), Nb = L(0, 0.6 + lift + arch * 0.4, 0.3);
  if (o.dip) { Ch.addScaledVector(U, -o.dip); Nb.addScaledVector(U, -o.dip * 1.3).addScaledVector(F, o.dip * 0.5); }
  // chest and pelvis
  const Zc = Ch.clone().sub(M).normalize(), cc = Ch.clone().lerp(M, 0.4);
  { const fr = frameOf(U, Zc); K.chest.position.copy(cc); K.chest.quaternion.copy(qFrom(fr.X, fr.Y, fr.Z)); }
  K.pelvis.position.copy(Pv); K.pelvis.quaternion.copy(qFrom(X, U, F)); between(K.belly, Pv, M, 0.085, 0.07);
  { const c = new THREE.CatmullRomCurve3([Pv.clone().addScaledVector(F, -0.06), M, Ch, Nb]); K.vert.forEach((v, i) => { const u = i / (K.vert.length - 1), q = c.getPointAt(u), tg = c.getTangentAt(u), up = U.clone().addScaledVector(tg, -U.dot(tg)).normalize();
    const d = q.clone().sub(cc).dot(Zc), rc = Math.abs(d) < 0.2 ? 0.125 * Math.sqrt(1 - (d / 0.2) ** 2) : 0, rb = u < 0.15 ? 0.08 : u > 0.85 ? 0.035 : 0.062;
    v.position.copy(q).addScaledVector(up, Math.max(rc, rb) + 0.004); v.quaternion.copy(qFrom(up.clone().cross(tg), up, tg)); }); }
  // head and neck
  const h = o.head || {}, qB = qFrom(X, U, F), nyaw = (h.yaw ?? 0) * 0.35, Nd = F.clone().applyAxisAngle(U, nyaw).multiplyScalar(0.17).addScaledVector(U, -0.01 - (h.pitch ?? 0) * 0.05);
  const Hc = Nb.clone().add(Nd), qH = qB.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(h.pitch ?? 0, h.yaw ?? 0, h.roll ?? 0, 'YXZ')));
  K.head.position.copy(Hc); K.head.quaternion.copy(qH); K.jaw.rotation.x = 0.03 + 0.75 * (o.jaw ?? 0); K.mouth.scale.set(0.064, 0.01 + 0.06 * (o.jaw ?? 0), 0.03); K.mouth.position.y = -0.082 - 0.03 * (o.jaw ?? 0);
  const HU = V3(0, 1, 0).applyQuaternion(qH), HZ = V3(0, 0, 1).applyQuaternion(qH), hb = Hc.clone().addScaledVector(HU, -0.07).addScaledVector(HZ, -0.04);
  between(K.neck, Nb, hb, 0.04, 0.034);
  { const nd = hb.clone().sub(Nb).normalize(); K.rope.position.copy(Nb.clone().lerp(hb, 0.72)); K.rope.scale.setScalar(0.85); K.rope.quaternion.setFromUnitVectors(V3(0, 0, 1), nd); }
  // limbs
  const gaitAt = (x0, z0, off, j) => { if (o.feet && o.feet[j]) return o.feet[j].clone(); let sp = z0 + s; let lif = 0;
    if (o.gait) { const u = s / Lc - off, n = Math.floor(u), f = u - n; if (f < 0.4) { const k = ss(0, 1, f / 0.4); sp = z0 + lerp((n - 0.32 + off) * Lc, (n + 0.68 + off) * Lc, k); lif = 0.07 * Math.sin(Math.PI * k); } else sp = z0 + (n + 0.68 + off) * Lc; }
    const g = o.p.clone().addScaledVector(F, o.gait ? sp : z0).addScaledVector(X, x0); g.y = surfY(g.x, g.z) + lif; return g; };
  K.arm.forEach((a, i) => {
    const Sh = L(a.sd * 0.13, 0.57 + lift + arch * 0.5, 0.21); if (o.dip) Sh.addScaledVector(U, -o.dip);
    let W = (o.hands && o.hands[i]) ? o.hands[i].clone() : gaitAt(a.sd * 0.27, 0.56, i ? 0.5 : 0, i).add(V3(0, 0.06, 0));
    const hz = (o.handZ && o.handZ[i]) || F.clone().addScaledVector(X, a.sd * 0.45).setY(0).normalize(), hy = o.handY && o.handY[i] ? o.handY[i] : U;
    const pole = X.clone().multiplyScalar(a.sd * 0.8).addScaledVector(U, 0.6).addScaledVector(F, -0.5);
    const curl = o.curl ? o.curl[i] : 0.25;
    for (let it = 0; it < 2; it++) {
      const { E, W: Wq } = twoBone(Sh, W, RK.uArm, RK.fArm, pole); a.E = E; a.W = Wq;
      between(a.up, Sh, E, 0.034, 0.042); between(a.fo, E, Wq, 0.022, 0.03); a.sj.position.copy(Sh); a.ej.position.copy(E);
      const fr = frameOf(hy, hz); a.hand.position.copy(Wq); a.hand.quaternion.copy(qFrom(fr.Y.clone().cross(fr.Z), fr.Y, fr.Z));
      a.hand.userData.f.forEach((sg, k) => { sg[0].rotation.x = curl * 0.6 + 0.05 * Math.sin(TT * 1.3 + k + i * 2) * (o.twitch ?? 0.3); sg[1].rotation.x = curl * 1.0 + 0.15; sg[2].rotation.x = curl * 0.9 + 0.25; });
      if (o.hands && o.hands[i] && !o.plantHands) break;
      const tips = clawTips(a.hand); let gap = 1e9; tips.forEach((tp) => (gap = Math.min(gap, tp.y - surfY(tp.x, tp.z)))); W = Wq.clone().add(V3(0, -gap + 0.004, 0));
    }
  });
  K.leg.forEach((l, i) => {
    const Hj = L(l.sd * 0.11, 0.44 + lift, -0.34); const A = gaitAt(l.sd * 0.24, -0.14, i ? 0 : 0.5, 2 + i).add(V3(0, 0.078, 0));
    const pole = U.clone().addScaledVector(X, l.sd * 0.7).addScaledVector(F, 0.35);
    const { E: Kn, W: Aw } = twoBone(Hj, A, RK.thigh, RK.shin, pole); l.K = Kn; l.A = Aw;
    between(l.th, Hj, Kn, 0.03, 0.042); between(l.sh, Kn, Aw, 0.02, 0.028); l.kj.position.copy(Kn); l.hj.position.copy(Hj);
    const fz = F.clone().addScaledVector(X, l.sd * 0.3).normalize(), fr = frameOf(U, fz); l.foot.position.copy(Aw); l.foot.quaternion.copy(qFrom(fr.Y.clone().cross(fr.Z), fr.Y, fr.Z));
    l.foot.userData.f.forEach((sg) => { sg[0].rotation.x = 0.15; sg[1].rotation.x = 0.25; sg[2].rotation.x = 0.35; });
  });
  K.p = p; K.F = F; K.X = X; K.Hc = Hc; return K;
}
function hideRake(Wd) { Wd.rake.parts.forEach((m) => (m.visible = false)); }

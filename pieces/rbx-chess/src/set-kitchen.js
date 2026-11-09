// rbx-chess KITCHEN set: the king's kitchen inside the castle keep. Stone walls, a chequered floor of 4-unit squares,
// a cast-iron range with pots on the back wall (z=-12), a 1987 calendar, copper pans, a cobwebbed door on the +x wall
// with an "OUT" sign, a window on the -x wall. Interior x -14..14, z -12..12, floor y=0, ceiling y=14.
'use strict';
SETS.kitchen = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng } = RBX, { V, uvBox, texPair, noiseOver } = KIT;
  const scene = new T.Scene(), props = {}, marks = {}, PI = Math.PI, C = (h) => new T.Color(h);
  const SM = (o) => new T.MeshStandardMaterial(o);
  const BX = (w, h, d, m, x, y, z, par = scene) => { const me = new T.Mesh(uvBox(new T.BoxGeometry(w, h, d), w, h, d), m); me.position.set(x, y, z); par.add(me); return me; };
  const CY = (rt, rb, h, m, x, y, z, par = scene, seg = 24) => { const me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); par.add(me); return me; };
  const P = (t, o) => pbr(t.c, t.h, o);
  const WX = 14, WZ = 12, H = 14;
  const stoneT = KIT.bricks(512, 801, { color: '#c8bca6', mortar: '#7a7064', rows: 6, cols: 3 });
  const M = { stone: P(stoneT, { rough: 0.92, bump: 5, repeat: [1 / 6, 1 / 6] }), iron: SM({ color: '#1e1f22', roughness: 0.5, metalness: 0.7 }), brass: SM({ color: '#c9a35a', roughness: 0.3, metalness: 0.9 }),
    copper: SM({ color: '#c06a3a', roughness: 0.3, metalness: 0.9 }), wood: P(KIT.woodPlanks(512, 802, { rows: 5, tones: ['#7a4e2a', '#6a4222', '#845632'] }), { rough: 0.7, bump: 2, repeat: [1 / 5, 1 / 5] }),
    beam: SM({ color: '#3a2414', roughness: 0.85 }), cream: SM({ color: '#efe6d4', roughness: 0.6 }), soup: SM({ color: '#c8642a', roughness: 0.3, emissive: C('#ff7a30'), emissiveIntensity: 0.15 }) };
  // floor: chequered squares (4 units)
  const tl = [SM({ color: '#e6dcc4', roughness: 0.35 }), SM({ color: '#3a3836', roughness: 0.35 })];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) BX(4, 0.4, 4, tl[(i + j + 6) % 2], i * 4, -0.2, j * 4 - 0.5);
  BX(2 * WX + 2, 0.4, 2 * WZ + 2, tl[1], 0, -0.6, 0);
  // walls + ceiling beams
  BX(2 * WX, H, 1, M.stone, 0, H / 2, -WZ - 0.5); BX(2 * WX, H, 1, M.stone, 0, H / 2, WZ + 0.5); BX(1, H, 2 * WZ, M.stone, -WX - 0.5, H / 2, 0); BX(1, H, 2 * WZ, M.stone, WX + 0.5, H / 2, 0);
  BX(2 * WX, 0.6, 2 * WZ, M.beam, 0, H + 0.3, 0); for (let x = -12; x <= 12; x += 6) BX(1, 1, 2 * WZ, M.beam, x, H - 0.5, 0);
  // the range: iron stove with oven doors, 4 hot plates, pots, kettle, chimney hood
  const st = new T.Group(); st.position.set(-4, 0, -WZ + 2); scene.add(st); props.stove = st;
  BX(9, 3.8, 3.6, M.iron, 0, 1.9, 0, st); BX(9.4, 0.3, 3.9, M.iron, 0, 3.95, 0, st);
  [-2.4, 2.4].forEach((x) => { BX(3.2, 2.2, 0.15, SM({ color: '#2a2a2e', roughness: 0.4, metalness: 0.6 }), x, 1.7, 1.85, st); BX(1.6, 0.25, 0.3, M.brass, x, 2.4, 2.0, st);
    const glow = BX(1.6, 0.6, 0.1, new T.MeshBasicMaterial({ color: C('#ff8a30').multiplyScalar(2), toneMapped: false }), x, 1.4, 1.95, st); });
  [[-2.6, -0.6], [-0.6, 0.6], [1.6, -0.6], [3.2, 0.6]].forEach(([x, z]) => CY(0.8, 0.8, 0.12, SM({ color: '#3a1a10', emissive: C('#ff4a10'), emissiveIntensity: 0.5 }), x, 4.15, z, st));
  CY(1.1, 1.0, 1.8, M.copper, -2.6, 5.1, -0.6, st); CY(1.0, 1.0, 0.1, M.soup, -2.6, 5.9, -0.6, st); CY(0.9, 0.85, 1.2, M.iron, 1.6, 4.8, -0.6, st);
  const ket = new T.Mesh(new T.SphereGeometry(0.75, 20, 14), M.brass); ket.scale.y = 0.8; ket.position.set(-0.6, 4.75, 0.6); st.add(ket); const sp = CY(0.12, 0.2, 1.0, M.brass, 0.2, 4.9, 0.6, st); sp.rotation.z = -1.0;
  BX(10, 0.6, 3, M.stone, 0, 9.5, -0.4, st); const hood = new T.Mesh(new T.CylinderGeometry(1.6, 5.4, 3.2, 4, 1), M.stone); hood.rotation.y = PI / 4; hood.scale.z = 0.5; hood.position.set(0, 11.2, -0.6); st.add(hood);
  // steam puffs over the pot
  const steamT = tex((() => { const c = cnv(128, 128), q = c.getContext('2d'), g = q.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(0, 0, 128, 128); return c; })());
  for (let i = 0; i < 6; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: 0.5 - i * 0.06 })); s.position.set(-6.6 + Math.sin(i) * 0.4, 6.4 + i * 0.7, -WZ + 1.4); s.scale.setScalar(1.2 + i * 0.5); scene.add(s); }
  // hanging copper pans on a rail
  BX(8, 0.2, 0.2, M.iron, 7, 9.5, -WZ + 0.6); for (let i = 0; i < 4; i++) { const pan = CY(0.9 - i * 0.1, 0.8 - i * 0.1, 0.3, M.copper, 4.2 + i * 1.9, 8.0, -WZ + 0.8); pan.rotation.x = PI / 2; BX(0.15, 1.4, 0.15, M.copper, 4.2 + i * 1.9, 8.9, -WZ + 0.8); }
  // the calendar: JUNE 1987, days crossed out
  const calT = tex((() => { const c = cnv(512, 704), q = c.getContext('2d'); q.fillStyle = '#efe6d0'; q.fillRect(0, 0, 512, 704); q.fillStyle = '#b8362a'; q.fillRect(0, 0, 512, 200);
    q.fillStyle = '#fff6e0'; q.font = '900 150px Georgia'; q.textAlign = 'center'; q.fillText('1987', 256, 158); q.fillStyle = '#2a1a10'; q.font = 'bold 54px Georgia'; q.fillText('JUNE', 256, 262);
    q.strokeStyle = '#6a5a48'; q.lineWidth = 3; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) { const x = 26 + k * 66, y = 290 + r * 80; q.strokeRect(x, y, 62, 74); q.fillStyle = '#4a3a2a'; q.font = '22px Georgia'; q.textAlign = 'left'; const d = r * 7 + k + 1; if (d <= 30) q.fillText(String(d), x + 6, y + 26);
      if (d <= 30) { q.strokeStyle = '#b8362a'; q.lineWidth = 5; q.beginPath(); q.moveTo(x + 10, y + 64); q.lineTo(x + 54, y + 12); q.moveTo(x + 10, y + 12); q.lineTo(x + 54, y + 64); q.stroke(); q.strokeStyle = '#6a5a48'; q.lineWidth = 3; } }
    // age: yellowing + stains
    const g = q.createRadialGradient(256, 352, 100, 256, 352, 420); g.addColorStop(0, 'rgba(150,110,40,0)'); g.addColorStop(1, 'rgba(120,80,30,0.45)'); q.fillStyle = g; q.fillRect(0, 0, 512, 704); return c; })());
  const cal = new T.Mesh(new T.PlaneGeometry(3.2, 4.4), SM({ map: calT, roughness: 0.9 })); cal.position.set(4.4, 5.4, -WZ + 0.02); cal.rotation.z = 0.04; scene.add(cal); props.calendar = cal;
  BX(0.12, 0.12, 0.3, M.iron, 4.4, 7.7, -WZ + 0.1);
  // the door on the +x wall: arched, planked, cobwebs, OUT sign
  const dr = new T.Group(); dr.position.set(WX - 0.05, 0, 3); dr.rotation.y = -PI / 2; scene.add(dr); props.door = dr;
  BX(4.4, 7.4, 0.3, M.wood, 0, 3.7, 0, dr); [1.6, 5.6].forEach((y) => BX(4.4, 0.35, 0.4, M.iron, 0, y, 0.1, dr)); CY(0.25, 0.25, 0.3, M.brass, 1.6, 3.6, 0.3, dr).rotation.x = PI / 2;
  BX(5.4, 0.6, 0.6, M.stone, 0, 7.7, 0, dr); [-1, 1].forEach((s) => BX(0.6, 8, 0.6, M.stone, s * 2.5, 4, 0, dr));
  const outT = tex((() => { const c = cnv(256, 96), q = c.getContext('2d'); q.fillStyle = '#2a1a10'; q.fillRect(0, 0, 256, 96); q.font = 'bold 64px Georgia'; q.fillStyle = '#f2d48a'; q.textAlign = 'center'; q.fillText('OUT', 128, 70); return c; })());
  BX(2.6, 1.0, 0.1, SM({ map: outT, roughness: 0.6 }), 0, 8.6, 0.3, dr);
  const webT = tex((() => { const c = cnv(256, 256), q = c.getContext('2d'); q.strokeStyle = 'rgba(240,240,240,0.7)'; q.lineWidth = 1.5; for (let k = 0; k < 9; k++) { const a = (k / 8) * PI / 2; q.beginPath(); q.moveTo(0, 0); q.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); q.stroke(); }
    for (let r = 20; r < 250; r += 22) { q.beginPath(); for (let k = 0; k <= 8; k++) { const a = (k / 8) * PI / 2, rr = r * (k % 2 ? 0.94 : 1); k ? q.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : q.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } q.stroke(); } return c; })());
  const webM = new T.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: T.DoubleSide });
  [[-2.2, 7.4, 0], [2.2, 7.4, PI / 2]].forEach(([x, y, r]) => { const w = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), webM); w.position.set(x + (x < 0 ? 1.3 : -1.3), y - 1.3, 0.4); w.rotation.z = -PI / 2 - r + (x < 0 ? PI / 2 : 0); dr.add(w); });
  // window on the -x wall (daylight) + a table with a teacup + shelves of plates
  const winM = new T.MeshBasicMaterial({ color: C('#cfe4ff').multiplyScalar(1.6), toneMapped: false });
  BX(0.2, 4.4, 3.6, winM, -WX + 0.05, 7, 2); BX(0.4, 0.3, 3.8, M.beam, -WX + 0.2, 7, 2); BX(0.4, 4.6, 0.3, M.beam, -WX + 0.2, 7, 2);
  BX(6, 0.4, 3.4, M.wood, 2, 3.2, 4); [[-2.6, -1.4], [2.6, -1.4], [-2.6, 1.4], [2.6, 1.4]].forEach(([x, z]) => BX(0.4, 3.0, 0.4, M.wood, 2 + x, 1.5, 4 + z));
  CY(0.4, 0.3, 0.5, M.cream, 1.4, 3.65, 4); CY(0.7, 0.7, 0.06, M.cream, 1.4, 3.42, 4);
  BX(0.8, 0.2, 7, M.wood, -WX + 0.6, 9.5, -4); for (let i = 0; i < 6; i++) { const pl = CY(0.8, 0.8, 0.08, M.cream, -WX + 0.7, 10.4, -7 + i * 1.2); pl.rotation.z = PI / 2 - 0.15; }
  // lights
  scene.add(new T.HemisphereLight('#ffe8c8', '#3a2a20', 1.4));
  const sun = new T.DirectionalLight('#fff0d0', 4); sun.position.set(-40, 30, 10); sun.target.position.set(2, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 100 }); sun.shadow.normalBias = 0.05; scene.add(sun, sun.target);
  const fire = new T.PointLight('#ff9a50', 160, 16, 2); fire.position.set(-4, 3, -7.5); scene.add(fire);
  const lampL = new T.PointLight('#ffd8a0', 120, 30, 2); lampL.position.set(2, 12, 2); scene.add(lampL);
  scene.background = C('#1a120c');
  scene.traverse((m) => { if (m.isMesh) { const mt = m.material; m.castShadow = !(mt.isMeshBasicMaterial || mt.transparent); m.receiveShadow = !mt.isMeshBasicMaterial; } });
  const mk = (n, x, y, z, ry = 0) => { marks[n] = { p: [x, y, z], ry }; };
  mk('p_king_stove', -4, 0, -6.6, PI); mk('p_king_door', 9.5, 0, 3, PI / 2); mk('p_king_mid', 2, 0, -1, 0);
  marks.m_calendar = { p: [4.4, 5.4, -WZ] };
  const views = { wide: { p: [8, 9, 11], l: [-2, 4, -8], fov: 60 }, stove: { p: [-1, 6, 2], l: [-4, 4, -10], fov: 50 }, calendar: { p: [4.4, 5.4, -6], l: [4.4, 5.4, -12], fov: 40 }, door: { p: [-4, 6, 6], l: [13, 4, 3], fov: 55 } };
  return { scene, grade: 'day', marks, props, views, mood() {}, reset() {} };
};

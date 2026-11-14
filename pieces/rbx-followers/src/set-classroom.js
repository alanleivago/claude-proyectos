// rbx-followers CLASSROOM set: math class (x -14..14, z -12..12, ceiling 12). Green chalkboard on the back wall (z=-12),
// rows of desks, windows on the -x wall (day), posters. The crowd fills the room; the teacher stands at the board.
'use strict';
SETS.classroom = async function (ctx) {
  const T = THREE, { pbr } = RBX, { box, woodPlanks, texPair, noiseOver } = KIT, PI = Math.PI;
  const scene = new T.Scene(); scene.background = new T.Color('#9fc8f0'); const add = (m) => { scene.add(m); return m; };
  const SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const fl = woodPlanks(512, 71, { rows: 6, tones: ['#b07a44', '#a46e3a', '#ba8450'] }), wallT = texPair(256, (g, hg, S) => { g.fillStyle = '#f0e2b8'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.1, 8, 4); g.fillStyle = '#c8a870'; g.fillRect(0, S * 0.75, S, S * 0.25); });
  const M = { floor: pbr(fl.c, fl.h, { rough: 0.6, repeat: [1 / 6, 1 / 6] }), wall: pbr(wallT.c, null, { rough: 0.85, repeat: [1 / 8, 1 / 8] }), desk: SM('#c89a5a', 0.5), leg: SM('#4a4e58', 0.4, 0.6), trim: SM('#f4f0e6', 0.5) };
  add(box(28, 0.4, 24, M.floor, 0, -0.2, 0, true)); add(box(28, 0.3, 24, SM('#f4f2ee', 0.8), 0, 12.15, 0));
  add(box(28, 12, 0.4, M.wall, 0, 6, -12.2, true)); add(box(28, 12, 0.4, M.wall, 0, 6, 12.2, true)); add(box(0.4, 12, 24, M.wall, 14.2, 6, 0, true));
  add(box(0.4, 3.6, 24, M.wall, -14.2, 1.8, 0, true)); add(box(0.4, 2.4, 24, M.wall, -14.2, 10.8, 0, true));
  add(box(0.1, 6, 24, new THREE.MeshBasicMaterial({ color: new T.Color(1.5, 1.8, 2.2), toneMapped: false }), -14.35, 6.6, 0)); [-8, 0, 8].forEach((z) => add(box(0.5, 6, 0.4, M.trim, -14.1, 6.6, z + 4)));
  const bt = KIT.textTex(1024, 400, (g, w, h) => { g.fillStyle = '#21402e'; g.fillRect(0, 0, w, h); noiseOver(g, w, h, 5, 0.25, 6, 3); g.fillStyle = '#f4f2ea'; g.font = '900 64px "Comic Sans MS", sans-serif'; g.fillText('3,000,001 + x = ?', 60, 110); g.fillText('7 x 8 = 56', 60, 220); g.font = '700 46px "Comic Sans MS"'; g.fillText('HOMEWORK: p. 42', 560, 330); });
  add(box(14, 5.2, 0.2, [M.trim, M.trim, M.trim, M.trim, new T.MeshStandardMaterial({ map: bt, roughness: 0.9 }), M.trim], 0, 6.2, -11.9));
  add(box(14.4, 0.3, 0.6, M.trim, 0, 3.5, -11.7));
  for (let x = -9; x <= 9; x += 4.5) for (let z = -5; z <= 9; z += 4.5) { add(box(3, 0.25, 2.2, M.desk, x, 3.0, z)); [[-1.3, -0.9], [1.3, -0.9], [-1.3, 0.9], [1.3, 0.9]].forEach(([a, b]) => add(box(0.15, 2.9, 0.15, M.leg, x + a, 1.45, z + b))); }
  add(box(5, 3.2, 2.4, SM('#7a4a2a', 0.5), 7.5, 1.6, -8.5));
  ['#E0101A', '#2F7BF5', '#2E9A3A'].forEach((c, i) => { const p = add(box(2.6, 3.2, 0.1, SM(c, 0.7), 14.0, 7, -6 + i * 5)); p.rotation.y = -PI / 2; });
  scene.add(new T.HemisphereLight('#dfeaff', '#8a7a60', 1.3));
  const sun = new T.DirectionalLight('#fff2d8', 4.5); sun.position.set(-40, 30, 10); sun.target.position.set(0, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = 0.04; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 }); scene.add(sun, sun.target);
  [-6, 6].forEach((x) => { const L = new T.PointLight('#fff8ee', 60, 30, 2); L.position.set(x, 11, 0); scene.add(L); });
  scene.traverse((m) => { if (m.isMesh) { m.castShadow = !m.material.isMeshBasicMaterial; m.receiveShadow = true; } });
  return { scene, grade: 'day' };
};

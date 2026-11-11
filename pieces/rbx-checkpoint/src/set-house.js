// rbx-checkpoint HOUSE set: the rich guy's mansion. Upstairs bedroom on a landing (floor y=9): gold canopy bed with a gold
// checkpoint flag on a pad beside it; a grand staircase from the landing down to the marble foyer (y=0) toward +z; chandelier,
// portraits, rug, warm interior light. Bed at (-6, 9, -10) facing +z; stairs from (4, 9, -4) down to (4, 0, 14).
'use strict';
SETS.house = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), scene = new T.Scene(); scene.background = new T.Color('#2a1a20');
  const box = (w, h, d, m, x, y, z, par = scene) => TK.box(par, w, h, d, m, x, y, z, false);
  scene.add(new T.HemisphereLight('#ffe8c8', '#5a3a2a', 1.6));
  const key = new T.DirectionalLight('#ffe0b0', 4.5); key.position.set(18, 30, 26); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 }); scene.add(key);
  [[-6, 16, -6], [4, 14, 8], [-8, 6, 10]].forEach(([x, y, z]) => { const L = new T.PointLight('#ffc888', 60, 30, 1.6); L.position.set(x, y, z); scene.add(L); });
  // marble foyer floor + walls (damask), landing floor
  const marble = (() => { const t = KIT.textTex(512, 512, (q, W) => { q.fillStyle = '#efe8dc'; q.fillRect(0, 0, W, W); q.strokeStyle = 'rgba(150,130,110,0.35)'; q.lineWidth = 2; for (let i = 0; i < 14; i++) { q.beginPath(); let x = Math.random() * W, y = 0; q.moveTo(x, y); while (y < W) { x += (Math.random() - 0.5) * 40; y += 30; q.lineTo(x, y); } q.stroke(); } q.fillStyle = 'rgba(0,0,0,0.12)'; q.fillRect(0, 0, W, 3); q.fillRect(0, 0, 3, W); }); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(0.25, 0.25); return new T.MeshStandardMaterial({ map: t, roughness: 0.25 }); })();
  TK.planeG(scene, 60, 60, marble, 0, 0, 0);
  const wall = new T.MeshStandardMaterial({ map: KIT.textTex(256, 256, (q, W) => { q.fillStyle = '#6a1a30'; q.fillRect(0, 0, W, W); q.fillStyle = 'rgba(232,184,48,0.22)'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { q.beginPath(); q.ellipse(x * 64 + 32 + (y % 2) * 32, y * 64 + 32, 14, 24, 0, 0, 7); q.fill(); } }), roughness: 0.8 });
  wall.map.wrapS = wall.map.wrapT = T.RepeatWrapping; wall.map.repeat.set(6, 3);
  box(40, 24, 0.5, wall, 0, 12, -16); box(0.5, 24, 40, wall, -16, 12, 4); box(0.5, 24, 40, wall, 18, 12, 4);
  const wood = ENV.mt(ENV.T.wood('#6a3a22'), 2), gold = new T.MeshPhysicalMaterial({ color: '#e0b030', metalness: 0.8, roughness: 0.3 });
  box(16, 0.6, 14, wood, -8, 8.7, -9); box(16.2, 0.4, 0.4, gold, -8, 9.2, -2.0);
  for (let x = -15.5; x <= -0.5; x += 1.0) box(0.15, 1.6, 0.15, gold, x, 9.8, -2.0); box(16, 0.2, 0.3, gold, -8, 10.6, -2.0);
  [-15, -1].forEach((x) => box(0.8, 8.4, 0.8, new T.MeshStandardMaterial({ color: '#f2ead8', roughness: 0.5 }), x, 4.2, -2.4));
  // red rug on the landing
  const rug = new T.Mesh(new T.PlaneGeometry(10, 6), new T.MeshStandardMaterial({ color: '#a01a2a', roughness: 0.9 })); rug.rotation.x = -PI / 2; rug.position.set(-6, 9.02, -8); scene.add(rug);
  // canopy bed: gold frame, 4 posts, canopy + drapes, red covers, pillows
  const bed = new T.Group(); bed.position.set(-6, 9, -10); scene.add(bed);
  box(5.2, 1.4, 7.6, gold, 0, 0.7, 0, bed); box(4.8, 0.9, 7.2, new T.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.8 }), 0, 1.85, 0, bed);
  box(5.4, 3.2, 0.5, gold, 0, 2.4, -3.8, bed); [[-2.5, -3.7], [2.5, -3.7], [-2.5, 3.7], [2.5, 3.7]].forEach(([x, z]) => box(0.3, 8, 0.3, gold, x, 4, z, bed));
  box(5.6, 0.4, 8, new T.MeshStandardMaterial({ color: '#7a1030', roughness: 0.7 }), 0, 8.1, 0, bed);
  [-1, 1].forEach((s) => { const dr = new T.Mesh(new T.PlaneGeometry(1.4, 6), new T.MeshStandardMaterial({ color: '#7a1030', roughness: 0.8, side: T.DoubleSide })); dr.position.set(s * 2.75, 5, 3.6); dr.rotation.y = PI / 2; bed.add(dr); });
  [-1.2, 1.2].forEach((x) => { const p = new T.Mesh(RBX.rbox(1.8, 0.6, 1.1, 0.25, 4), new T.MeshStandardMaterial({ color: '#fff8ee', roughness: 0.9 })); p.position.set(x, 2.55, -2.9); bed.add(p); });
  const covers = new T.Mesh(RBX.rbox(5.0, 0.7, 4.8, 0.3, 4), new T.MeshStandardMaterial({ color: '#c8203a', roughness: 0.8 })); covers.position.set(0, 2.5, 1.2); covers.castShadow = true; bed.add(covers);
  ENV.shadow(bed);
  const cpk = CP.checkpoint({ c: CP.COL.rich, emblem: 'star', h: 4.4, w: 1.8, s: 0.8 }); cpk.position.set(-0.6, 9, -10.5); scene.add(cpk);
  // grand staircase: from the landing edge (x 4, y 9, z -2) down toward +z, red runner, gold rails
  const stepM = new T.MeshStandardMaterial({ color: '#f2ead8', roughness: 0.5 }), run = new T.MeshStandardMaterial({ color: '#a01a2a', roughness: 0.9 });
  box(8, 0.6, 6, wood, 4, 8.7, -5);
  const N = 22; for (let k = 0; k < N; k++) { const y = 9 - (k + 1) * (9 / N), z = -1.5 + k * 0.75; box(7, y + 0.01 > 0 ? 9 / N : 0.4, 0.78, stepM, 4, y + 9 / N / 2, z); box(3.4, 0.03, 0.78, run, 4, y + 9 / N + 0.02, z); }
  [0.4, 7.6].forEach((x) => { const pts = [V(x, 10.4, -2), V(x, 1.5, 15)]; const r = new T.Mesh(new T.TubeGeometry(new T.LineCurve3(pts[0], pts[1]), 4, 0.12, 8), gold); scene.add(r); for (let k = 0; k < N; k += 2) box(0.12, 1.4, 0.12, gold, x, 9 - (k + 1) * (9 / N) + 0.9, -1.5 + k * 0.75); });
  // chandelier
  const ch = new T.Group(); ch.position.set(4, 19, 4); scene.add(ch); ch.add(new T.Mesh(new T.TorusGeometry(2.2, 0.12, 8, 30), gold)); ch.children[0].rotation.x = PI / 2;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2, b = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), new T.MeshStandardMaterial({ color: '#fff4d0', emissive: '#ffd080', emissiveIntensity: 4 })); b.position.set(Math.cos(a) * 2.2, 0.3, Math.sin(a) * 2.2); ch.add(b); }
  // portrait of himself
  const pt = KIT.textTex(256, 320, (q, W, H) => { q.fillStyle = '#3a2418'; q.fillRect(0, 0, W, H); q.fillStyle = '#F4A878'; q.fillRect(78, 80, 100, 100); q.fillStyle = '#f4f4f4'; q.fillRect(70, 50, 116, 40); q.fillStyle = '#6a1a3a'; q.fillRect(60, 180, 136, 140); q.fillStyle = '#141414'; q.fillRect(100, 120, 10, 10); q.fillRect(146, 120, 10, 10); });
  const por = new T.Mesh(new T.PlaneGeometry(3.6, 4.5), new T.MeshStandardMaterial({ map: pt, roughness: 0.6 })); por.position.set(-6, 14.5, -15.7); scene.add(por); box(4.0, 4.9, 0.2, gold, -6, 14.5, -15.85);
  return { scene, grade: 'morning', bed, covers, cpk, bedTop: 9 + 2.3, stairs: (k) => V(4, 9 - (k + 1) * (9 / N) + 9 / N, -1.5 + k * 0.75) };
};

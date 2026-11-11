// rbx-library SCHOOL yard (day): brick school front facing +z at z=-12 (door x 0), playground asphalt with hopscotch, bench (-6, 0, -6),
// coat rack by the door (5, 0, -9.5) with coats on hooks, fire-alarm bell (red light in 'drill'), fire truck parked at (14, 0, 4).
// mood('day'|'drill'|'sepia')
'use strict';
SETS.school = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), scene = new T.Scene(); scene.fog = new T.Fog('#cfe6ff', 70, 240);
  const SM = (c, r = 0.7, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m }), box = (par, w, h, d, m, x, y, z, uv = true) => TK.box(par, w, h, d, m, x, y, z, uv);
  const sky = ENV.sky(scene, ctx.renderer, { top: '#1a6ef0', mid: '#4aa0f8', hor: '#bfe2ff', env: true }); ENV.clouds(scene, 8, { seed: 7 });
  const hemi = new T.HemisphereLight('#7fb8ff', '#8a8470', 1.7); scene.add(hemi);
  const sun = new T.DirectionalLight('#fff0c8', 7.5); sun.position.set(40, 60, 45); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); scene.add(sun);
  const asph = ENV.mt(ENV.T.asphalt(), 6); TK.planeG(scene, 120, 80, asph, 0, 0, 10); TK.planeG(scene, 200, 200, ENV.mt(ENV.T.grass(), 6), 0, -0.02, 0);
  // hopscotch + four-square paint
  const paint = KIT.textTex(512, 256, (q, W, H) => { q.clearRect(0, 0, W, H); q.strokeStyle = '#f6f2e0'; q.lineWidth = 8; for (let i = 0; i < 6; i++) q.strokeRect(10 + i * 80, 80, 78, 96); q.fillStyle = '#f6f2e0'; q.font = '900 50px Arial'; for (let i = 0; i < 6; i++) q.fillText(String(i + 1), 34 + i * 80, 146); });
  const hp = new T.Mesh(new T.PlaneGeometry(10, 5), new T.MeshStandardMaterial({ map: paint, transparent: true, roughness: 0.9 })); hp.rotation.x = -PI / 2; hp.position.set(-4, 0.02, 6); scene.add(hp);
  // school building
  const brick = (() => { const t = KIT.bricks(512, 41, { rows: 8, cols: 4, color: '#b0503a', mortar: '#d8cfc0' }); const m = new T.MeshStandardMaterial({ map: RBX.tex(t.c), roughness: 0.9 }); m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(1 / 4, 1 / 4); return m; })();
  const lime = SM('#efe8d6', 0.6); box(scene, 60, 14, 12, brick, 0, 7, -18); box(scene, 61, 1, 13, lime, 0, 14.5, -18); box(scene, 61, 0.6, 12.6, lime, 0, 0.3, -18);
  const glass = new T.MeshPhysicalMaterial({ color: '#2a4a6a', roughness: 0.08, clearcoat: 1 }); for (const x of [-24, -16, -8, 8, 16, 24]) for (const y of [4.5, 10]) { box(scene, 4, 3.2, 0.2, glass, x, y, -11.9, false); box(scene, 4.4, 0.3, 0.5, lime, x, y - 1.75, -11.8, false); }
  box(scene, 4, 6, 0.3, SM('#2a5ac0', 0.4), 0, 3, -11.85, false); box(scene, 5, 0.4, 1.4, lime, 0, 6.3, -11.4, false);
  const sg = new T.Mesh(new T.PlaneGeometry(12, 1.6), new T.MeshStandardMaterial({ map: KIT.textTex(512, 68, (q, W, H) => { q.fillStyle = '#1f4fa8'; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '900 50px Arial Black, Arial'; q.textAlign = 'center'; q.fillText('MAPLE ELEMENTARY', W / 2, 52); }) })); sg.position.set(0, 8.6, -11.84); scene.add(sg);
  // fire-alarm bell + red strobe
  const bell = new T.Group(); bell.add(new T.Mesh(new T.SphereGeometry(0.55, 16, 10, 0, PI * 2, 0, PI / 2), SM('#d81e1e', 0.3, 0.3))); bell.children[0].rotation.x = PI / 2; const strobe = new T.Mesh(new T.SphereGeometry(0.25, 10, 8), new T.MeshStandardMaterial({ color: '#ff2020', emissive: '#ff2020', emissiveIntensity: 0 })); strobe.position.set(0, 0.9, 0.2); bell.add(strobe); bell.position.set(4, 7.2, -11.7); scene.add(bell);
  const red = new T.PointLight('#ff2a2a', 0, 30, 1.6); red.position.set(4, 7, -9); scene.add(red);
  // bench + coat rack with coats
  const wood = ENV.mt(ENV.T.wood('#8a5a32'), 1); const bench = new T.Group(); box(bench, 5, 0.25, 1.4, wood, 0, 1.3, 0); box(bench, 5, 1.1, 0.2, wood, 0, 2.1, -0.6); [-2.2, 2.2].forEach((x) => box(bench, 0.25, 1.3, 1.4, SM('#2a2a30', 0.4, 0.6), x, 0.65, 0)); bench.position.set(-6, 0, -6); scene.add(bench);
  const rack = new T.Group(); rack.position.set(5.5, 0, -9.6); scene.add(rack); const iron = SM('#3a2a20', 0.5); box(rack, 0.3, 7.8, 0.3, iron, 0, 3.9, 0, false); box(rack, 2.6, 0.25, 2.6, iron, 0, 0.12, 0, false);
  const coat = (c, a) => { const g = new T.Group(), m = GN.mat('tee', { c, tile: 1 }); const body = new T.Mesh(new T.CylinderGeometry(0.55, 1.0, 3.2, 10), m); body.position.y = -1.7; g.add(body); const hd = new T.Mesh(new T.SphereGeometry(0.5, 12, 8, 0, PI * 2, 0, PI / 2), m); hd.position.y = -0.2; g.add(hd); g.rotation.y = a; return g; };
  [['#c8302a', 0], ['#2a6a3a', 2.1], ['#e8b020', 4.2]].forEach(([c, a]) => { const k = coat(c, a); k.position.set(Math.sin(a) * 0.7, 7.4, Math.cos(a) * 0.7); rack.add(k); }); ENV.shadow(rack);
  rack.hook = V(5.5 - 0.9, 7.6, -9.6 + 0.4);
  // fire truck
  const truck = new T.Group(); truck.position.set(15, 0, 3); truck.rotation.y = -0.5; scene.add(truck); const tr = new T.MeshPhysicalMaterial({ color: '#d81e1e', roughness: 0.3, clearcoat: 1 }), chrome = SM('#d8dce4', 0.2, 1), blk = SM('#141414', 0.8);
  box(truck, 6, 4.2, 16, tr, 0, 3.2, 0, false); box(truck, 5.6, 2.4, 4.4, tr, 0, 6.2, 5.4, false); box(truck, 5.4, 1.6, 0.2, glass, 0, 6.4, 7.62, false); box(truck, 6.2, 0.6, 0.4, chrome, 0, 1.6, 8.1, false);
  for (const z of [-5, 0, 5]) for (const s of [-1, 1]) { const w = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 0.8, 20), blk); w.rotation.z = PI / 2; w.position.set(s * 3.1, 1.2, z); truck.add(w); }
  const lad = new T.Group(); lad.position.set(0, 5.6, -2); truck.add(lad); [-1, 1].forEach((s) => box(lad, 0.2, 0.2, 14, chrome, s * 1.0, 0, 0, false)); for (let z = -6.5; z <= 6.5; z += 1) box(lad, 2.0, 0.12, 0.12, chrome, 0, 0, z, false);
  [-1.6, 1.6].forEach((x) => { const l = new T.Mesh(new T.BoxGeometry(1.0, 0.5, 0.6), new T.MeshStandardMaterial({ color: '#ff3030', emissive: '#ff2020', emissiveIntensity: 2 })); l.position.set(x, 7.6, 5.6); truck.add(l); }); ENV.shadow(truck);
  // basketball hoop + fence
  const hoop = new T.Group(); box(hoop, 0.3, 9, 0.3, SM('#555', 0.4, 0.7), 0, 4.5, 0, false); box(hoop, 3, 2, 0.15, SM('#f4f4f4'), 0, 9, 0.3, false); const rim = new T.Mesh(new T.TorusGeometry(0.6, 0.06, 6, 20), SM('#f05a28')); rim.rotation.x = PI / 2; rim.position.set(0, 8.2, 1.0); hoop.add(rim); hoop.position.set(-16, 0, 2); hoop.rotation.y = 0.8; scene.add(hoop);
  for (let x = -30; x <= 30; x += 2) box(scene, 0.12, 3, 0.12, SM('#9aa0a8', 0.4, 0.8), x, 1.5, 30, false); box(scene, 60, 0.12, 0.12, SM('#9aa0a8', 0.4, 0.8), 0, 3, 30, false);
  const set = { scene, rack, bench, truck, bell, sky, grade: 'day' };
  set.mood = (m) => { const drill = m === 'drill'; strobe.material.emissiveIntensity = drill ? 6 : 0; red.intensity = drill ? 120 : 0; set.grade = m === 'sepia' ? 'sepia' : 'day'; };
  set.mood('day'); return set;
};

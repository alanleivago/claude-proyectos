// rbx-followers STREET set (from rbx-rope CITY, no rope): Bloxburg suburb, houses both sides, sidewalks, lawns, driveways,
// mailboxes, trees, power poles + wires. The hero's house is the +x house at z=HZ (front door at x=18, facing -x) with a porch.
// Street: x -7..7, sidewalks 7..10, lawns beyond, houses centred at x=+-23 every 16 along z.
'use strict';
SETS.street = async function (ctx) {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, { rng } = RBX;
  const scene = new T.Scene(), r = rng(101);
  scene.fog = new T.FogExp2('#c4e0ff', 0.0055);
  ENV.sky(scene, ctx.renderer, { top: '#1a6ef0', mid: '#4aa0f8', hor: '#bfe2ff', sun: [0.55, 0.62, 0.4], glow: 0.4 });
  ENV.clouds(scene, 14, { s: 16, a0: -PI, a1: 2 * PI, d: 600, y: 170 });
  const hemi = new T.HemisphereLight('#7fb8ff', '#8a8470', 1.45); scene.add(hemi);
  const sun = new T.DirectionalLight('#fff0c8', 6.0); sun.position.set(40, 60, 30); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 }); sun.target.position.set(0, 0, 12); scene.add(sun, sun.target);
  const Z0 = -70, Z1 = 420, LEN = Z1 - Z0, ZC = (Z0 + Z1) / 2;
  const plane = (w, d, m, x, y, z) => { const g = new T.PlaneGeometry(w, d); g.rotateX(-PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.receiveShadow = true; scene.add(me); return me; };
  const box = (w, h, d, m, x, y, z) => { const g = new T.BoxGeometry(w, h, d); KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; scene.add(me); return me; };
  plane(14, LEN, ENV.mt(ENV.T.asphalt(), 6), 0, 0, ZC);
  plane(600, LEN + 400, ENV.mt(ENV.T.grass(), 5), 0, -0.02, ZC);
  const walk = new T.MeshStandardMaterial({ color: '#c8c4bc', roughness: 0.85 }); walk.map = ENV.T.cobble().map.clone(); walk.map.repeat.set(0.5, 0.5); walk.map.needsUpdate = true;
  [-1, 1].forEach((s) => { box(3, 0.25, LEN, ENV.mt(ENV.T.asphalt(), 3), s * 8.5, 0.12, ZC).material.color = new T.Color('#d8d4cc'); box(0.4, 0.35, LEN, new T.MeshStandardMaterial({ color: '#b0aca4', roughness: 0.8 }), s * 7.1, 0.17, ZC);
    // dashed edge lines
    for (let z = Z0; z < Z1; z += 6) box(0.18, 0.02, 3, new T.MeshStandardMaterial({ color: '#f2f0e8', roughness: 0.6 }), s * 6.2, 0.01, z); });
  // houses, driveways, mailboxes, trees, fences
  let seed = 1;
  for (let z = Z0 + 8; z < Z1; z += 16) [-1, 1].forEach((s) => { const h = ENV.house({ seed: seed++ * 13 + 7 }); h.position.set(s * 23, 0, z + (r() - 0.5) * 2); h.rotation.y = s > 0 ? -PI / 2 : PI / 2; scene.add(h);
    box(5, 0.08, 12.5, ENV.mt(ENV.T.asphalt(), 4), s * 14, 0.05, z - 3).material.color = new T.Color('#9a968e');
    const mb = new T.Group(); const post = new T.Mesh(new T.BoxGeometry(0.18, 1.3, 0.18), ENV.mt(ENV.T.wood(), 1)); post.position.y = 0.65; mb.add(post); const bx = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.9, 12, 1, false, 0, PI), new T.MeshStandardMaterial({ color: ['#2a4aa0', '#c03030', '#2a2a2a'][seed % 3], roughness: 0.4, metalness: 0.3 })); bx.rotation.z = PI / 2; bx.position.y = 1.35; mb.add(bx); mb.position.set(s * 10.6, 0, z + 3.5); ENV.shadow(mb); scene.add(mb);
    if (r() > 0.35) { const t = r() > 0.5 ? ENV.tree({ seed: seed * 7 }) : ENV.pine({ s: 1.1 }); t.position.set(s * (13 + r() * 3), 0, z + 7); scene.add(t); }
    if (r() > 0.5) for (let k = 0; k < 5; k++) box(0.15, 1.1, 1.6, new T.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.6 }), s * 11.2, 0.55, z - 6 + k * 1.7); });
  // power poles + wires (one side)
  const poles = []; for (let z = Z0; z < Z1; z += 30) { const p = ENV.pole(); p.position.set(-11.5, 0, z); scene.add(p); poles.push(p.position.clone()); }
  for (let i = 0; i + 1 < poles.length; i++) [-1.6, 0, 1.6].forEach((x) => scene.add(ENV.wire(V(-11.5 + x, 13.2, poles[i].z), V(-11.5 + x, 13.2, poles[i + 1].z), 0.9)));
  // the hero's porch (house at x=+23, z=HZ): deck, two posts, a little roof, an open front door, a doormat, a porch light
  const HZ = 8 + 16 * 4 - 70;   // = 10: the 5th +x house
  const hh = scene.children.find((o) => o.isGroup && Math.abs(o.position.x - 23) < 0.1 && Math.abs(o.position.z - HZ) < 1.5); const doorZ = hh ? hh.position.z : HZ;
  const wd = ENV.mt(ENV.T.wood('#8a6038'), 1.5), trimM = new T.MeshStandardMaterial({ color: '#f6f4ee', roughness: 0.6 });
  box(3.4, 0.5, 7, wd, 16.3, 0.25, doorZ); box(1.2, 0.25, 4, wd, 14.1, 0.12, doorZ);
  [-3.2, 3.2].forEach((dz) => box(0.4, 5.6, 0.4, trimM, 14.9, 3.3, doorZ + dz)); 
  const door = new T.Group(); door.position.set(17.95, 0.5, doorZ - 0.8); scene.add(door); const dm = box(0.2, 3.0, 1.6, new T.MeshStandardMaterial({ color: '#c03a2a', roughness: 0.5 }), 0, 1.5, 0.8); scene.remove(dm); door.add(dm); door.rotation.y = 1.2;
  box(0.06, 3.1, 1.75, new T.MeshBasicMaterial({ color: '#1a1410' }), 18.0, 2.05, doorZ);   // dark doorway behind the open door
  box(1.2, 0.04, 1.8, new T.MeshStandardMaterial({ color: '#7a5a3a', roughness: 1 }), 16.9, 0.52, doorZ);
  const pl = new T.PointLight('#ffc070', 4, 10, 2); pl.position.set(17.4, 4.6, doorZ + 1.6); scene.add(pl);
  // street spots for the crowd (people stand on the asphalt, sidewalks and lawns)
  return { scene, grade: 'day', sun, house: hh, reset() { if (hh) hh.visible = true; }, HZ: doorZ, door: [17.95, 0.5, doorZ] };
};

// rbx-rope LAWN set: a Bloxburg front lawn for the cast line-up (class photo on wooden bleachers) and face close-ups.
// Bleachers centred at the origin facing +z; house behind at z=-22.
'use strict';
SETS.lawn = async function (ctx) {
  const T = THREE, PI = Math.PI, scene = new T.Scene();
  scene.fog = new T.FogExp2('#cfe6ff', 0.006);
  ENV.sky(scene, ctx.renderer, { top: '#1a6ef0', mid: '#4aa0f8', hor: '#bfe2ff', sun: [0.4, 0.6, 0.7], glow: 0.4 });
  ENV.clouds(scene, 10, { s: 16, a0: -1.2, a1: 2.4, d: 500, y: 140 });
  scene.add(new T.HemisphereLight('#7fb8ff', '#8a8470', 1.7));
  const sun = new T.DirectionalLight('#fff0c8', 7.2); sun.position.set(25, 40, 35); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 150 }); scene.add(sun);
  const g = new T.PlaneGeometry(400, 400); g.rotateX(-PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 400, uv.getY(i) * 400); const gr = new T.Mesh(g, ENV.mt(ENV.T.grass(), 5)); gr.receiveShadow = true; scene.add(gr);
  [[-26, -24, 3], [0, -26, 5], [26, -24, 9]].forEach(([x, z, s]) => { const h = ENV.house({ seed: s, noGarage: s === 5 }); h.position.set(x, 0, z); scene.add(h); });
  [[-14, -10], [15, -12], [-20, 4], [21, 2]].forEach(([x, z], i) => { const t = i % 2 ? ENV.pine({ s: 1.2 }) : ENV.tree({ seed: i * 5 + 1, s: 1.1 }); t.position.set(x, 0, z); scene.add(t); });
  const fm = new T.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.6 }); for (let x = -30; x <= 30; x += 1.3) { const p = new T.Mesh(new T.BoxGeometry(0.16, 1.2, 0.5), fm); p.position.set(x, 0.6, -14); p.castShadow = true; scene.add(p); }
  const w = ENV.mt(ENV.T.wood('#a0703a'), 2), bl = new T.Group(); [[0.8, 0], [2.5, -2.4], [4.2, -4.8], [5.9, -7.2]].forEach(([h, z]) => { const b = new T.Mesh(new T.BoxGeometry(10.5, h, 2.4), w); KIT.uvBox(b.geometry, 10.5, h, 2.4); b.position.set(0, h / 2, z); bl.add(b); }); ENV.shadow(bl); scene.add(bl);
  return { scene, grade: 'day' };
};

// rbx-checkpoint YARD set: the school playground at recess. Asphalt yard with painted hopscotch, play structure (towers,
// monkey bars, slide), benches and tyres, school wall behind. lava(bool) turns the ground into glowing lava (floor is lava).
// Centre at the origin, school wall at z=-24, open toward +z.
'use strict';
SETS.yard = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), scene = new T.Scene();
  scene.fog = new T.FogExp2('#cfe6ff', 0.004);
  ENV.sky(scene, ctx.renderer, { top: '#1a6ef0', mid: '#4aa0f8', hor: '#bfe2ff', sun: [0.4, 0.6, 0.6], glow: 0.4 }); ENV.clouds(scene, 10, { s: 16, a0: -PI, a1: 2 * PI, d: 500, y: 150 });
  scene.add(new T.HemisphereLight('#7fb8ff', '#8a8470', 1.7));
  const sun = new T.DirectionalLight('#fff0c8', 7.5); sun.position.set(30, 50, 40); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); scene.add(sun);
  const asph = TK.planeG(scene, 90, 90, ENV.mt(ENV.T.asphalt(), 6), 0, 0, 0);
  TK.planeG(scene, 600, 600, ENV.mt(ENV.T.grass(), 5), 0, -0.02, 0);
  // lava floor (hidden unless lava(true)): emissive orange noise + glow
  const lt = KIT.textTex(512, 512, (q, W) => { const g = q.createLinearGradient(0, 0, W, W); g.addColorStop(0, '#ff5a10'); g.addColorStop(0.5, '#ffb020'); g.addColorStop(1, '#e83a08'); q.fillStyle = g; q.fillRect(0, 0, W, W); for (let i = 0; i < 70; i++) { q.fillStyle = `rgba(${90 + Math.random() * 60},20,8,0.6)`; q.beginPath(); q.ellipse(Math.random() * W, Math.random() * W, 20 + Math.random() * 50, 10 + Math.random() * 30, Math.random() * 3, 0, 7); q.fill(); } });
  lt.wrapS = lt.wrapT = T.RepeatWrapping; lt.repeat.set(6, 6);
  const lava = new T.Mesh(new T.PlaneGeometry(90, 90), new T.MeshStandardMaterial({ map: lt, emissive: '#ff6a10', emissiveMap: lt, emissiveIntensity: 1.3, roughness: 0.6 })); lava.rotation.x = -PI / 2; lava.position.y = 0.03; lava.visible = false; scene.add(lava);
  const glow = new T.PointLight('#ff7a20', 0, 40, 1.5); glow.position.set(0, 2, 4); scene.add(glow);
  // hopscotch
  const hp = KIT.textTex(256, 512, (q, W, H) => { q.strokeStyle = '#f6f2ea'; q.lineWidth = 8; const s = 60; [[98, 420], [98, 360], [68, 300], [128, 300], [98, 240], [68, 180], [128, 180], [98, 120]].forEach(([x, y]) => q.strokeRect(x - 30 + 30, y - 30, s, s)); q.fillStyle = '#f6f2ea'; q.font = '900 36px sans-serif'; [[128, 448, '1'], [128, 388, '2']].forEach(([x, y, t]) => q.fillText(t, x - 10, y)); });
  const hpm = new T.Mesh(new T.PlaneGeometry(4, 8), new T.MeshStandardMaterial({ map: hp, transparent: true, roughness: 0.8 })); hpm.rotation.x = -PI / 2; hpm.position.set(-10, 0.02, 10); scene.add(hpm);
  // school wall behind with windows
  const sch = TK.shop({ seed: 4, w: 60, floors: 3, c: '#e8b070', sign: 'GREENHILL SCHOOL' }); sch.position.set(0, 0, -28); scene.add(sch);
  // play structure: two towers, monkey bars between, slide, ladder
  const pg = new T.Group(); scene.add(pg); const red = TK.SM('#e8402a', 0.4, 0.2), blu = TK.SM('#2a7ad8', 0.4, 0.2), yel = TK.SM('#f2c01a', 0.4, 0.2), wd = ENV.mt(ENV.T.wood('#b88a58'), 1.2);
  const tower = (x, z, c) => { [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([a, b]) => TK.box(pg, 0.35, 7, 0.35, c, x + a, 3.5, z + b, false)); TK.box(pg, 3.6, 0.35, 3.6, wd, x, 4, z, false); const roof = new T.Mesh(new T.ConeGeometry(2.8, 2, 4), c); roof.rotation.y = PI / 4; roof.position.set(x, 8, z); roof.castShadow = true; pg.add(roof); };
  tower(-8, -6, red); tower(8, -6, blu);
  [-0.8, 0.8].forEach((dz) => TK.box(pg, 12.4, 0.25, 0.25, yel, 0, 6.5, -6 + dz, false)); for (let x = -5.4; x <= 5.4; x += 1.2) TK.box(pg, 0.18, 0.18, 1.8, yel, x, 6.5, -6, false);
  const sl = new T.Mesh(new T.BoxGeometry(2, 0.3, 8), yel); sl.position.set(8, 2.2, 0); sl.rotation.x = 0.5; sl.castShadow = true; pg.add(sl);
  // benches + tyres (stepping stones over the lava)
  const benches = [], bench = (x, z, ry) => { const g = new T.Group(); TK.box(g, 4, 0.3, 1.2, wd, 0, 1.4, 0); [-1.6, 1.6].forEach((bx) => TK.box(g, 0.25, 1.4, 1.0, TK.SM('#3a3a40', 0.4, 0.6), bx, 0.7, 0, false)); g.position.set(x, 0, z); g.rotation.y = ry; ENV.shadow(g); scene.add(g); benches.push(g); };
  bench(-4, 6, 0.3); bench(3, 9, -0.4); bench(-2, 14, 0.1);
  const tyres = []; [[6, 4], [8, 8], [1, 3], [-7, 2]].forEach(([x, z]) => { const t = new T.Mesh(new T.TorusGeometry(0.9, 0.4, 10, 24), TK.SM('#1a1a1e', 0.9)); t.rotation.x = PI / 2; t.position.set(x, 0.4, z); t.castShadow = true; scene.add(t); tyres.push(t); });
  const set = { scene, grade: 'day', benches, tyres, lavaOn: false };
  set.lava = (on) => { lava.visible = on; glow.intensity = on ? 40 : 0; };
  set.reset = () => set.lava(false);
  return set;
};

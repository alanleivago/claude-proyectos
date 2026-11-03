// Self-check sheet for src/props.js: every prop on a neutral studio floor + R6 avatars wearing the hairs/caps/box.
// node setview.mjs propsheet <outDir> src/props.js
SETS.propsheet = async function () {
  const V = KIT.V, scene = new THREE.Scene(); scene.background = new THREE.Color('#c7ccd4');
  const fl = KIT.texPair(512, (g) => { g.fillStyle = '#b9bdc4'; g.fillRect(0, 0, 512, 512); KIT.noiseOver(g, 512, 512, 5, 0.18, 8, 4); g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 3; g.strokeRect(0, 0, 512, 512); });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), RBX.pbr(fl.c, fl.h, { rough: 0.85, bump: 1, repeat: [60, 60] })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a8f99', 1.5));
  const key = new THREE.DirectionalLight('#fff4e6', 3.2); key.position.set(-30, 50, 60); key.target.position.set(-10, 0, 8); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -60, right: 60, top: 40, bottom: -40, near: 1, far: 200 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#cfe0ff', 1.6); rim.position.set(20, 20, -40); scene.add(rim);
  const add = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; KIT.shadow(o); scene.add(o); return o; };
  const views = {};
  const ped = new THREE.MeshStandardMaterial({ color: '#e4e6ea', roughness: 0.8 });
  const block = (w, h, d, x, z) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ped), x, h / 2, z);

  // ---- hair avatars: one per style, a front 3/4 and a back 3/4 view each ----
  const hairs = [['pigtails', '#6b3a1e', { headScale: 1.25, shirt: '#f28ab0', face: 'smile' }], ['bun', '#bdbab3', { shirt: '#7e5aa6', skin: '#e8c4a0' }], ['short', '#2a1a10', { shirt: '#3d6fd1' }], ['bob', '#8a4a22', { shirt: '#3aa07a' }],
    ['spiky', '#e0b040', { shirt: '#e05a2a' }], ['ponytail', '#1d1612', { shirt: '#d64b6a' }], ['curly', '#3a2414', { shirt: '#f2c230', skin: '#a8714a' }], ['cap', '#2a1a10', { shirt: '#2f8f86' }]];
  hairs.forEach(([st, col, o], i) => {
    const x = -42 + i * 6, av = RBX.avatar(Object.assign({ face: 'neutral', seed: 20 + i }, o)); add(av.root, x, 0, 0, 0);
    av.head.add(PROPS.hair(st, col, st === 'cap' ? '#c8262c' : undefined));
    const hy = 4.64 + (o.headScale ? 0.3 : 0);
    views['h_' + st + '_f'] = { p: [x + 2.6, hy + 1.2, 6.2], l: [x, hy - 0.2, 0], fov: 32 };
    views['h_' + st + '_b'] = { p: [x - 3.6, hy + 1.6, -5.4], l: [x, hy - 0.3, 0], fov: 32 };
  });
  // ---- accessory avatars ----
  const acc = (x, o, fn) => { const av = RBX.avatar(Object.assign({ face: 'neutral' }, o)); add(av.root, x, 0, 0, 0); fn(av); return av; };
  acc(8, { shirt: '#22325e', pants: '#3a4a6a', seed: 40 }, (av) => { av.head.add(PROPS.hair('undercap', '#5a4030')); av.head.add(PROPS.mailCap()); av.body.add(PROPS.mailBag()); av.setFace('neutral'); });
  views.a_mail = { p: [8 + 3.4, 5.0, 8.5], l: [8, 3.6, 0], fov: 34 };
  views.a_mail_side = { p: [8 - 6.5, 4.4, 5.5], l: [8, 3.4, 0], fov: 34 };
  acc(14, { shirt: '#c8262c', pants: '#222', seed: 41 }, (av) => { av.head.add(PROPS.hair('undercap', '#2a1a10')); av.head.add(PROPS.pizzaCap()); av.pose({ armL: [-1.2, 0, 0], armR: [-1.2, 0, 0] }); av.setFace('neutral');
    const pb = PROPS.pizzaBox(); pb.position.set(0, 0.44, 1.55); av.body.add(pb); KIT.shadow(pb); });
  views.a_pizza = { p: [14 + 3.6, 6.2, 8.5], l: [14, 4.0, 0], fov: 34 };
  acc(20, { shirt: '#e9e2d4', pants: '#2b2f3a', seed: 42 }, (av) => av.head.add(PROPS.cerealBox()));
  views.a_cereal = { p: [20 + 2.8, 5.4, 8.0], l: [20, 4.2, 0], fov: 34 };
  views.a_cereal_b = { p: [20 - 4.5, 6.4, -5.5], l: [20, 4.2, 0], fov: 34 };
  acc(26, { shirt: '#3d6fd1', seed: 43 }, (av) => { av.head.add(PROPS.hair('bob', '#8a4a22')); av.head.add(PROPS.glasses()); });
  acc(30.5, { shirt: '#f28a1e', seed: 44 }, (av) => { av.head.add(PROPS.hair('spiky', '#2a1a10')); av.head.add(PROPS.sunglasses()); });
  views.a_glasses = { p: [27.2, 5.5, 5.6], l: [26.2, 4.6, 0], fov: 26 };
  views.a_sun = { p: [32.4, 5.4, 4.2], l: [30.5, 4.6, 0], fov: 28 };
  // a kid holding props (hold helper)
  acc(36, { shirt: '#f28a1e', seed: 45, hood: 'dino', headScale: 1.25 }, (av) => { av.pose({ armL: [-0.5, 0, 0], armR: [-0.4, 0, 0] }); PROPS.hold(av, PROPS.flashlight({ on: true }), 'R'); PROPS.hold(av, PROPS.wateringCan(), 'L'); });
  views.a_hold = { p: [36 + 2, 5.0, 9], l: [36, 3.2, 0], fov: 36 };

  // ---- prop stations (z = 14 row), each with an auto-framed view ----
  const Z = 14; let cx = -46; scene.updateMatrixWorld(true);
  const station = (name, objs, o = {}) => {
    const w = o.w || 5, x = cx + w / 2; cx += w + 1; const grp = new THREE.Group(); grp.position.set(x, 0, Z); scene.add(grp);
    objs.forEach(([obj, px = 0, py = 0, pz = 0, ry = 0]) => { obj.position.set(px, py, pz); obj.rotation.y += ry; KIT.shadow(obj); grp.add(obj); });
    grp.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(grp), c = box.getCenter(V(0, 0, 0)), sz = box.getSize(V(0, 0, 0));
    const fov = o.fov || 30, d = V(...(o.dir || [0.35, 0.4, 1])).normalize(), need = Math.max(sz.y, sz.x * 16 / 9 * 0.8, sz.z * 0.8) / 2 / Math.tan((fov * Math.PI) / 360) * (o.pad || 1.0) + Math.max(sz.x, sz.z) / 4;
    views['p_' + name] = { p: c.clone().addScaledVector(d, need).toArray(), l: c.toArray(), fov };
    return grp;
  };
  const cs = PROPS.cat({ pose: 'sit' }); station('cat_sit', [[cs]], { w: 3 });
  station('cat_stand', [[PROPS.cat({ pose: 'stand', face: 'neutral' }), 0, 0, 0, -Math.PI / 2]], { w: 3, dir: [0.2, 0.25, 1] });
  const cb = PROPS.cat({ pose: 'sit', face: 'blink' }); station('cat_blink', [[cb]], { w: 3 });
  views.p_cat_face = { p: [views.p_cat_sit.l[0] + 0.3, 1.6, Z + 2.4], l: [views.p_cat_sit.l[0], 1.5, Z + 0.4], fov: 32 };
  station('balloon', [[PROPS.numberBalloon('10')]], { w: 4 });
  const tro = [0, 1, 2, 3].map((i) => [PROPS.trophy(i), -2 + i * 1.35, 0, (i % 2) * -0.6]); station('trophies', tro, { w: 6, dir: [0.2, 0.3, 1] });
  station('trophy_cu', [[PROPS.trophy(0)]], { w: 2 });
  station('clock', [[PROPS.alarmClock(8, 59)]], { w: 2 });
  station('book', [[PROPS.book(), 0, 0.675, 0], [PROPS.book('THURSDAY RULES', { color: '#7a2a2a' }), 1.3, 0.675, -0.3, -0.3]], { w: 3 });
  station('smalls', [[PROPS.chalk(), -0.6, 0.05, 0.4, 0.4], [PROPS.flashlight({ on: true }), 0.5, 0.15, 0.2, 0.7], [PROPS.mug('#e9e3d6', '#1 MOM'), -0.6, 0, -0.6], [PROPS.mug('#3d6fd1', 'COFFEE'), 0.1, 0, -0.9], [PROPS.glasses(), 0.8, 0.1, -0.5], [PROPS.sunglasses(), -1.1, 0.1, -0.1]], { w: 3, dir: [0.2, 0.9, 1] });
  station('cactus', [[PROPS.plantPot('cactus')]], { w: 2 });
  station('fern', [[PROPS.plantPot('fern')]], { w: 3 });
  station('can', [[PROPS.wateringCan(), 0, 0, 0, -1.2]], { w: 2 });
  station('cookies', [[PROPS.cookiePlate()], [PROPS.mug(), 1.0, 0, -0.3]], { w: 2.5, dir: [0.2, 0.8, 1] });
  const pl = PROPS.plank(4); const pl2 = PROPS.plank(3, { seed: 9 }); const hm = PROPS.hammer();
  station('boards', [[pl, 0, 1.2, 0], [pl2, 0.3, 0.4, 0.2, 0.1], [hm, 1.6, 0, 0.5]], { w: 5, dir: [0.15, 0.25, 1] });
  station('suitcases', [[PROPS.suitcase('#c0392b'), -0.8, 0, 0], [PROPS.suitcase('#2f6fd1'), 0.9, 0, -0.4, -0.3]], { w: 4 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 0.3), new THREE.MeshStandardMaterial({ color: '#8f7a68', roughness: 0.9 }));
  station('blanket', [[wall, 0, 3, -0.3], [PROPS.blanket('#c94f4f', 'quilt'), -0.5, 5.5, -0.15], [PROPS.blanket('#3d6fd1', 'stars', { w: 2, h: 2.4, seed: 4 }), 1.3, 4.6, -0.05]], { w: 6, dir: [0.45, 0.15, 1] });
  station('ladder', [[PROPS.ladder(8)]], { w: 3, dir: [0.6, 0.2, 1] });
  station('pizzabox', [[PROPS.pizzaBox(), 0, 0.11, 0, 0.3]], { w: 3, dir: [0.2, 1.1, 1] });
  station('mailbag', [[PROPS.mailBag({ worn: false }), 0, 0, 0, -0.3]], { w: 2 });
  station('caps', [[PROPS.mailCap(), -0.8, 0.0, 0, 0.6], [PROPS.pizzaCap(), 0.8, 0.0, 0, -0.5]], { w: 3, dir: [0.1, 0.7, 1] });
  station('cereal', [[PROPS.cerealBox(), 0, 0.66, 0, -0.35]], { w: 2.5 });
  station('plush', [[PROPS.plush(), 0, 0, 0, -0.2]], { w: 2 });

  return { scene, grade: 'day', marks: {}, props: {}, views };
};

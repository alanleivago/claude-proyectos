// rbx-checkpoint POOL set: the water park. Pool (water surface y=-0.3) in a tiled deck, the slide tower (platform y=11) with a
// flat ROOF DECK at y=15.5 = the kids' checkpoint (cyan flag), a spiral slide + a straight slide into the pool, palms, umbrellas,
// a lifeguard chair. Tower centred at (0,0,-10), pool from z=-4 to z=22.
'use strict';
SETS.pool = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rng } = RBX, r = rng(303), scene = new T.Scene();
  scene.fog = new T.FogExp2('#cfe6ff', 0.0015);
  ENV.sky(scene, ctx.renderer, { top: '#1268f0', mid: '#46a2fa', hor: '#c4e6ff', sun: [0.5, 0.65, 0.5], glow: 0.45 });
  ENV.clouds(scene, 12, { s: 16, a0: -PI, a1: 2 * PI, d: 500, y: 150 });
  scene.add(new T.HemisphereLight('#7fc0ff', '#a09070', 1.8));
  const sun = new T.DirectionalLight('#fff0c8', 7.8); sun.position.set(40, 60, 40); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); sun.target.position.set(0, 0, 0); scene.add(sun, sun.target);
  // tiles
  const tileT = KIT.textTex(256, 256, (q, W) => { q.fillStyle = '#e2c8a0'; q.fillRect(0, 0, W, W); q.fillStyle = '#b89a70'; for (let i = 0; i <= 8; i++) { q.fillRect(i * 32 - 1, 0, 3, W); q.fillRect(0, i * 32 - 1, W, 3); } });
  tileT.wrapS = tileT.wrapT = T.RepeatWrapping; const deck = new T.MeshStandardMaterial({ map: tileT, roughness: 0.5 });
  const blueT = KIT.textTex(256, 256, (q, W) => { q.fillStyle = '#2aa8d8'; q.fillRect(0, 0, W, W); q.fillStyle = '#1a88b8'; for (let i = 0; i <= 8; i++) { q.fillRect(i * 32 - 1, 0, 2, W); q.fillRect(0, i * 32 - 1, W, 2); } }); blueT.wrapS = blueT.wrapT = T.RepeatWrapping;
  const poolX = 16, z0 = -4, z1 = 22, depth = 3;
  [[-60, -poolX, -60, 80], [poolX, 60, -60, 80], [-poolX, poolX, -60, z0], [-poolX, poolX, z1, 80]].forEach(([xa, xb, za, zb]) => { const m = TK.planeG(scene, xb - xa, zb - za, deck, (xa + xb) / 2, 0, (za + zb) / 2); m.material = deck.clone(); m.material.map = tileT.clone(); m.material.map.repeat.set(0.25, 0.25); m.material.map.needsUpdate = true; });
  const basin = new T.MeshStandardMaterial({ map: blueT, roughness: 0.4, side: T.BackSide }); { const b = new T.Mesh(new T.BoxGeometry(2 * poolX, depth, z1 - z0), basin); KIT.uvBox(b.geometry, 2 * poolX / 4, depth / 4, (z1 - z0) / 4); b.position.set(0, -depth / 2, (z0 + z1) / 2); b.receiveShadow = true; scene.add(b); }
  const water = new T.Mesh(new T.PlaneGeometry(2 * poolX, z1 - z0, 1, 1), new T.MeshPhysicalMaterial({ color: '#30c8e8', roughness: 0.05, metalness: 0, transmission: 0.35, transparent: true, opacity: 0.82, clearcoat: 1, normalMap: ENV.waterNormal(), normalScale: new T.Vector2(0.6, 0.6) }));
  water.material.normalMap.repeat.set(4, 4); water.rotation.x = -PI / 2; water.position.set(0, -0.3, (z0 + z1) / 2); scene.add(water);
  const coping = TK.SM('#f6f4ee', 0.6); [[0, z0, 2 * poolX + 1, 0.8], [0, z1, 2 * poolX + 1, 0.8]].forEach(([x, z, w, d]) => TK.box(scene, w, 0.3, d, coping, x, 0.15, z, false)); [-1, 1].forEach((s) => TK.box(scene, 0.8, 0.3, z1 - z0, coping, s * poolX, 0.15, (z0 + z1) / 2, false));
  // slide tower: 4 posts, platform, stairs, roof deck with railing
  const tw = new T.Group(); tw.position.set(0, 0, -10); scene.add(tw); const post = TK.SM('#f2c01a', 0.4, 0.2), plat = TK.SM('#e8402a', 0.5), rail = TK.SM('#f6f4ee', 0.4, 0.3);
  [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([x, z]) => TK.box(tw, 0.7, 15.5, 0.7, post, x, 7.75, z, false));
  TK.box(tw, 9.4, 0.5, 9.4, plat, 0, 11, 0, false); TK.box(tw, 10, 0.5, 10, TK.SM('#1890c0', 0.5), 0, 15.5, 0, false);
  const railRing = (y, L) => [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([sx, sz]) => { TK.box(tw, sx ? 0.12 : L, 0.12, sx ? L : 0.12, rail, sx * L / 2, y + 1.3, sz * L / 2, false); for (let k = -L / 2; k <= L / 2 + 0.01; k += 1.25) TK.box(tw, 0.1, 1.3, 0.1, rail, sx ? sx * L / 2 : k, y + 0.65, sz ? sz * L / 2 : k, false); });
  railRing(11.25, 9.4); railRing(15.75, 10);
  for (let k = 0; k < 28; k++) TK.box(tw, 2, 0.2, 0.7, TK.SM('#f6f4ee', 0.6), 5.6, 0.4 + k * 0.39, 4.5 - k * 0.32, false);
  const sign = KIT.textTex(512, 128, (q, W, H) => { q.fillStyle = '#18b8d8'; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '900 72px "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.lineWidth = 10; q.strokeStyle = '#0a4a6a'; q.strokeText('SPLASH ZONE', W / 2, H / 2 + 4); q.fillText('SPLASH ZONE', W / 2, H / 2 + 4); });
  const sp = new T.Mesh(new T.PlaneGeometry(8, 2), new T.MeshStandardMaterial({ map: sign, roughness: 0.5 })); sp.position.set(0, 13.4, 4.4); tw.add(sp);
  // the kids' checkpoint on the roof deck
  const cpk = CP.checkpoint({ c: CP.COL.pool, emblem: 'arrow', h: 3.6, w: 1.6, s: 0.8 }); cpk.position.set(-2.4, 15.75, -1.8); tw.add(cpk);
  // slides: spiral (yellow) and straight (red), open half-pipes
  const slide = (pts, c) => { const cv = new T.CatmullRomCurve3(pts), g = new T.TubeGeometry(cv, 200, 1.0, 16, false); const pos = g.attributes.position; // open the top half: squash vertices above the centreline down into a U
    const m = new T.Mesh(g, new T.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 1, side: T.DoubleSide, transparent: true, opacity: 1 })); m.castShadow = true; scene.add(m); return m; };
  const sp1 = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * PI * 3.2 + PI * 0.2; sp1.push(V(Math.cos(a) * 7 - 9, 11.2 - t * 10.8, -10 + Math.sin(a) * 7 + t * 6)); } sp1.push(V(-10, 0.2, 0.5));
  slide(sp1, '#f2c01a');
  slide([V(4, 11.3, -6), V(6, 8, -1), V(8, 3.5, 4), V(9, 0.4, 8), V(9, 0.1, 10)], '#e8402a');
  // palms, umbrellas, loungers, lifeguard chair
  const palm = (x, z, h = 10) => { const g = new T.Group(), tr = ENV.mt(ENV.T.wood('#8a6a42'), 1); for (let k = 0; k < 8; k++) { const s = new T.Mesh(new T.CylinderGeometry(0.42 - k * 0.025, 0.48 - k * 0.025, h / 8, 8), tr); s.position.set(k * k * 0.03, (k + 0.5) * h / 8, 0); s.rotation.z = -k * 0.03; g.add(s); }
    const lm = new T.MeshStandardMaterial({ color: '#3aa040', roughness: 0.8, side: T.DoubleSide }); for (let i = 0; i < 8; i++) { const lf = new T.Mesh(new T.PlaneGeometry(5, 1.2, 6, 1), lm); const p = lf.geometry.attributes.position; for (let j = 0; j < p.count; j++) { const xx = p.getX(j); p.setY(j, p.getY(j) - (xx + 2.5) * (xx + 2.5) * 0.06); } lf.geometry.translate(2.5, 0, 0); lf.position.set(2, h, 0); lf.rotation.y = (i / 8) * PI * 2; lf.rotation.z = -0.25; g.add(lf); }
    g.position.set(x, 0, z); ENV.shadow(g); scene.add(g); };
  [[-22, -12], [22, -16], [-24, 18], [24, 14], [-20, 34], [26, 34]].forEach(([x, z]) => palm(x, z, 10 + r() * 4));
  const umb = (x, z, c) => { const g = new T.Group(); g.add(new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 4, 8), TK.SM('#f6f4ee'))); g.children[0].position.y = 2; const t = KIT.textTex(256, 64, (q, W, H) => { for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#fff' : c; q.fillRect(i * 32, 0, 32, H); } });
    const cn = new T.Mesh(new T.ConeGeometry(2.4, 0.9, 16, 1, true), new T.MeshStandardMaterial({ map: t, side: T.DoubleSide, roughness: 0.7 })); cn.position.y = 4.2; g.add(cn); g.position.set(x, 0, z); ENV.shadow(g); scene.add(g); };
  [[-20, 2, '#e8402a'], [20, 4, '#18b8d8'], [-20, 12, '#f2c01a'], [21, 18, '#f07ad0']].forEach(([x, z, c]) => umb(x, z, c));
  return { scene, grade: 'day', tower: tw, roofY: 15.75, cpk, water };
};

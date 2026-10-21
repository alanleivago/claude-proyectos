// the Roadster and other vehicles (from pieces/roadster, adapted)
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: o.r ?? 0.8, metalness: o.m ?? 0, map: o.map ?? null, emissive: lin(o.em ?? '#000000'), emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide, transparent: o.tr ?? false, opacity: o.op ?? 1, envMapIntensity: o.env ?? 1 });
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: lin(c), transparent: o.tr ?? false, opacity: o.op ?? 1, depthWrite: o.dw ?? true, side: o.side ?? THREE.FrontSide, map: o.map ?? null, toneMapped: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
function mesh(geo, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.s) m.scale.set(...o.s); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; return m;
}
function texBattery() {
  return g3Tex((x, w, h) => { x.fillStyle = '#2a6fd6'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(200,230,255,0.75)'; x.lineWidth = 3;
    for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo(i * w / 12, 0); x.lineTo(i * w / 12, h); x.stroke(); } for (let j = 1; j < 6; j++) { x.beginPath(); x.moveTo(0, j * h / 6); x.lineTo(w, j * h / 6); x.stroke(); } }, 256, 128);
}
function extrudeProfile(pts, depth, bevel) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
}
function roundBody(draw, depth, bevel, tumble = 0.28, noseX = 1.5) {
  const sh = new THREE.Shape(); draw(sh);
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 20, steps: 1 });
  g.translate(0, 0, -depth / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 - tumble * smooth(0.55, 1.3, y) - 0.16 * smooth(noseX, 2.4, x) - 0.1 * smooth(-1.6, -2.4, x); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g;
}
function buildWheel(r, w, rimC) {
  const g = new THREE.Group(), tire = std('#16161a', { r: 0.9 }), rim = std(rimC, { r: 0.35, m: 0.35, env: 0.6 }), cal = std('#d23a2a', { r: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(r, r, w, 28), tire, 0, 0, 0, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, w + 0.02, 24), std('#2a2a30', { r: 0.6 }), 0, 0, 0, { rx: Math.PI / 2 }));
  for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(r * 1.2, r * 0.13, 0.04), rim, 0, 0, w / 2 + 0.01, { rz: (k / 5) * Math.PI }); g.add(sp); }
  g.add(mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, w + 0.06, 12), rim, 0, 0, 0, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.BoxGeometry(r * 0.35, r * 0.5, 0.06), cal, r * 0.42, 0, w / 2 - 0.06));
  return g;
}
function buildRoadster() {
  const g = new THREE.Group(), body = new THREE.Group(), xr = new THREE.Group(); g.add(body, xr);
  const paint = std('#c9ced6', { r: 0.28, m: 0.55, env: 1.2, tr: true }), glass = std('#121822', { r: 0.08, m: 0.2, env: 1.6, tr: true }), trim = std('#1a1a1e', { r: 0.5 });
  const shell = roundBody((s) => { s.moveTo(-2.15, 0.32); s.lineTo(1.95, 0.32); s.quadraticCurveTo(2.32, 0.34, 2.28, 0.5); s.quadraticCurveTo(2.16, 0.66, 1.25, 0.76); s.quadraticCurveTo(0.2, 0.9, -0.9, 0.96); s.quadraticCurveTo(-1.95, 1.0, -2.2, 0.84); s.quadraticCurveTo(-2.32, 0.55, -2.15, 0.32); }, 1.62, 0.14, 0.22);
  const cab = roundBody((s) => { s.moveTo(0.9, 0.82); s.quadraticCurveTo(0.25, 1.3, -0.45, 1.29); s.quadraticCurveTo(-1.3, 1.25, -1.8, 0.93); s.lineTo(-0.9, 0.9); s.lineTo(0.9, 0.82); }, 1.22, 0.1, 0.35, 3);
  body.add(mesh(shell, paint), mesh(cab, glass));
  for (const z of [-0.9, 0.9]) body.add(mesh(new THREE.BoxGeometry(3.9, 0.12, 0.1), trim, 0, 0.36, z));             // sills
  body.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 1.5), basic('#e8f4ff'), 2.23, 0.55, 0));                       // LED front bar
  body.add(mesh(new THREE.BoxGeometry(0.06, 0.07, 1.7), basic('#ff2a2a'), -2.3, 0.72, 0));                       // rear light bar
  body.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 1.9), trim, -2.0, 0.98, 0));                                    // rear lip
  const wheels = []; for (const [x, z] of [[1.38, 0.86], [1.38, -0.86], [-1.36, 0.88], [-1.36, -0.88]]) { const w = buildWheel(0.37, 0.3, '#d6d9de'); w.position.set(x, 0.37, z); if (z < 0) w.rotation.y = Math.PI; g.add(w); wheels.push(w); }
  // x-ray parts
  const cy = std('#2fd6dc', { r: 0.4, em: '#0a6a70', ei: 0.6 }), dark = std('#22262c', { r: 0.6 });
  const P = {};
  P.edges = new THREE.LineSegments(new THREE.EdgesGeometry(shell, 25), new THREE.LineBasicMaterial({ color: lin('#8fe9f0'), transparent: true, opacity: 0, toneMapped: false })); xr.add(P.edges);
  P.ghostM = new THREE.MeshBasicMaterial({ color: lin('#6fe2ea'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  P.ghost = new THREE.Mesh(shell, P.ghostM); xr.add(P.ghost);
  P.frame = new THREE.Group(); for (const z of [-0.55, 0.55]) P.frame.add(mesh(new THREE.BoxGeometry(4.0, 0.1, 0.12), dark, 0, 0.42, z)); for (const x of [-1.4, -0.4, 0.6, 1.5]) P.frame.add(mesh(new THREE.BoxGeometry(0.12, 0.1, 1.2), dark, x, 0.42, 0)); xr.add(P.frame);
  P.engine = new THREE.Group(); P.engine.add(mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), std('#c8352a', { r: 0.5 }), 1.25, 0.72, 0)); P.engine.add(mesh(new THREE.BoxGeometry(0.7, 0.12, 0.6), std('#5a5f66', { r: 0.4, m: 0.6 }), 1.25, 1.03, 0)); xr.add(P.engine);
  P.motors = new THREE.Group(); for (const x of [1.38, -1.36]) P.motors.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 20), cy, x, 0.37, 0, { rx: Math.PI / 2 })); xr.add(P.motors);
  P.battery = mesh(new THREE.BoxGeometry(2.9, 0.14, 1.5), std('#ffffff', { map: texBattery(), r: 0.4, em: '#0b2a5a', ei: 0.5 }), -0.05, 0.47, 0); xr.add(P.battery);
  P.fans = []; const fanG = new THREE.Group(); for (const x of [0.75, -0.85]) { const f = new THREE.Group(); f.position.set(x, 0.2, 0); f.add(mesh(new THREE.TorusGeometry(0.58, 0.06, 8, 32), basic('#3fd0d6'), 0, 0, 0, { rx: Math.PI / 2 })); const rot = new THREE.Group(); for (let k = 0; k < 7; k++) rot.add(mesh(new THREE.BoxGeometry(1.05, 0.03, 0.16), basic('#8ff4f8'), 0, 0, 0, { ry: (k / 7) * Math.PI })); f.add(rot); f.userData.rot = rot; fanG.add(f); P.fans.push(f); } xr.add(fanG); P.fanG = fanG;
  P.skirts = new THREE.Group(); const sk = std('#0d0d10', { r: 0.95 }); P.skirts.add(mesh(new THREE.BoxGeometry(3.6, 0.2, 0.06), sk, 0, 0.22, 0.86), mesh(new THREE.BoxGeometry(3.6, 0.2, 0.06), sk, 0, 0.22, -0.86), mesh(new THREE.BoxGeometry(0.06, 0.2, 1.72), sk, 1.8, 0.22, 0), mesh(new THREE.BoxGeometry(0.06, 0.2, 1.72), sk, -1.8, 0.22, 0)); xr.add(P.skirts);
  P.tank = mesh(new THREE.CylinderGeometry(0.27, 0.27, 1.25, 24), std('#e8f2f6', { r: 0.25, m: 0.5, em: '#1a4a55', ei: 0.4 }), -0.75, 0.68, 0, { rz: Math.PI / 2 }); xr.add(P.tank);
  P.nozzles = new THREE.Group(); for (const z of [-0.5, 0, 0.5]) P.nozzles.add(mesh(new THREE.ConeGeometry(0.12, 0.3, 16, 1, true), std('#9aa2ac', { r: 0.3, m: 0.8, side: THREE.DoubleSide }), -2.32, 0.58, z, { rz: Math.PI / 2 })); g.add(P.nozzles);
  P.minis = new THREE.Group(); P.miniPts = [[1.9, 0.9, 0.95], [1.9, 0.9, -0.95], [-1.9, 0.95, 0.95], [-1.9, 0.95, -0.95], [0.3, 1.0, 1.0], [0.3, 1.0, -1.0], [1.9, 0.35, 0.95], [-1.9, 0.35, -0.95]];
  P.miniPts.forEach(([x, y, z]) => P.minis.add(mesh(new THREE.ConeGeometry(0.07, 0.16, 10), std('#8a929c', { r: 0.3, m: 0.8 }), x, y, z, { rx: z > 0 ? Math.PI / 2 : -Math.PI / 2 }))); g.add(P.minis);
  g.userData = { body, xr, paint, glass, wheels, P };
  return g;
}
function buildSedan(c) {   // the Toyota Corolla (generic sedan, red)
  const g = new THREE.Group(), paint = std(c, { r: 0.35, m: 0.35 }), glass = std('#141a22', { r: 0.1, m: 0.2, env: 1.4 });
  const sh = extrudeProfile([[-2.3, 0.36], [2.28, 0.36], [2.36, 0.62], [2.12, 0.8], [0.95, 0.88], [0.32, 1.34], [-1.15, 1.38], [-1.85, 0.98], [-2.36, 0.92]], 1.68, 0.1);
  const win = extrudeProfile([[0.86, 0.9], [0.32, 1.3], [-1.1, 1.33], [-1.72, 0.98]], 1.72, 0.03);
  g.add(mesh(sh, paint), mesh(win, glass));
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.1, 1.4), basic('#fff6dc'), 2.36, 0.66, 0), mesh(new THREE.BoxGeometry(0.06, 0.1, 1.5), basic('#c01818'), -2.4, 0.8, 0));
  const wheels = []; for (const [x, z] of [[1.42, 0.84], [1.42, -0.84], [-1.4, 0.84], [-1.4, -0.84]]) { const w = buildWheel(0.36, 0.26, '#a8adb4'); w.position.set(x, 0.36, z); if (z < 0) w.rotation.y = Math.PI; g.add(w); wheels.push(w); }
  g.userData = { wheels }; return g;
}
function buildTruck() {
  const g = new THREE.Group(), w = std('#d9dce0', { r: 0.35, m: 0.4 }), d = std('#1b1d22', { r: 0.4 });
  g.add(mesh(extrudeProfile([[-2.6, 0.7], [2.2, 0.7], [2.6, 1.6], [2.4, 3.2], [1.0, 3.9], [-2.6, 3.9]], 2.5, 0.2), w));
  g.add(mesh(extrudeProfile([[2.25, 2.0], [2.42, 3.1], [1.05, 3.72], [0.9, 2.0]], 2.56, 0.03), d));
  for (const [x, z] of [[1.6, 1.2], [1.6, -1.2], [-1.6, 1.2], [-1.6, -1.2]]) g.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20), std('#16161a'), x, 0.55, z, { rx: Math.PI / 2 }));
  return g;
}

// extra exterior detail on the Roadster
function detailRoadster(car) { const u = car.userData, body = u.body, blk = std('#121214', { r: 0.4 }), chrome = std('#d8dce2', { r: 0.12, m: 1.0 });
  const paint = new THREE.MeshPhysicalMaterial({ color: lin('#cfd4dc'), metalness: 0.6, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.3, transparent: true });
  body.children[0].material = paint; u.paint = paint;
  [-1, 1].forEach((s) => { const m = new THREE.Group(); m.position.set(0.72, 0.98, s * 0.8); body.add(m); m.add(mesh(new THREE.CapsuleGeometry(0.05, 0.12, 4, 10).rotateZ(Math.PI / 2).scale(1, 0.8, 0.6), paint, 0, 0, s * 0.07)); m.add(mesh(new THREE.BoxGeometry(0.02, 0.06, 0.12), blk, -0.06, 0, s * 0.07)); m.add(mesh(new THREE.BoxGeometry(0.06, 0.02, 0.06), blk, 0.02, -0.03, s * 0.01));
    body.add(mesh(new THREE.BoxGeometry(0.5, 0.12, 0.04), blk, -1.15, 0.55, s * 0.86)); body.add(mesh(new THREE.BoxGeometry(0.16, 0.02, 0.02), chrome, -0.1, 0.72, s * 0.84)); body.add(mesh(new THREE.BoxGeometry(0.012, 0.36, 0.02), blk, 0.55, 0.6, s * 0.86)); body.add(mesh(new THREE.BoxGeometry(0.012, 0.36, 0.02), blk, -0.78, 0.62, s * 0.86)); });
  body.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 1.7), blk, 2.18, 0.3, 0)); for (let k = -3; k <= 3; k++) body.add(mesh(new THREE.BoxGeometry(0.3, 0.12, 0.02), blk, -2.2, 0.36, k * 0.2));
  body.add(mesh(new THREE.BoxGeometry(0.3, 0.06, 0.5), blk, 2.0, 0.42, 0)); body.add(mesh(new THREE.BoxGeometry(0.03, 0.02, 1.5), chrome, 0.95, 0.83, 0));
  u.wheels.forEach((w) => w.add(mesh(new THREE.TorusGeometry(0.37, 0.025, 6, 28), blk, 0, 0, 0))); }

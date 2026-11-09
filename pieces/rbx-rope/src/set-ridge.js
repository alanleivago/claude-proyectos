// rbx-rope RIDGE set: the rope climbs our side of a rock ridge (from the Fog, +z), runs over a worn notch at the crest
// (z=0, y=40) and drops down the far side to the OTHER world: their first knot on a ledge (z~-24, y~26), then a city on a
// steep slope sliding toward the sea (tilted houses, cracks, debris), the sea at y=0 far below.
// mood('dawn' | 'day' (Wave Day: bunting, banner, no fog)).
'use strict';
SETS.ridge = async function (ctx) {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, { rng, fbm } = RBX;
  const scene = new T.Scene(), r = rng(701);
  scene.fog = new T.FogExp2('#c9a8a8', 0.0026);
  const sky = ENV.sky(scene, ctx.renderer, { top: '#3a4a8a', mid: '#d08a7a', hor: '#ffd0a8', sun: [0.55, 0.12, -0.83], sunC: '#ffd8a8', sunK: 1.1, sunS: 0.9991, glow: 0.8 });
  ENV.clouds(scene, 10, { s: 18, a0: PI - 1.4, a1: 2.8, d: 800, y: 150, c: '#ffd8c8', e: '#d08070', ei: 0.5 });
  const hemi = new T.HemisphereLight('#8aa8ff', '#5a4038', 1.2); scene.add(hemi);
  const sun = new T.DirectionalLight('#ffcf9a', 6); sun.position.set(60, 40, -80); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 300 }); sun.target.position.set(0, 20, -30); scene.add(sun, sun.target);
  // terrain: height(x,z). crest along x at z=0, y=40; our side slopes down gently to +z; their side drops to the sea (y=0 at z~-170)
  const n = fbm(703, 4, 5), n2 = fbm(707, 8, 4);
  const crest = (x) => 70 + 4 * Math.sin(x * 0.05) - 0.006 * x * x;
  const H = (x, z) => { const c = crest(x), u = (n((x + 300) / 600, (z + 300) / 600) - 0.5), v = n2((x + 300) / 600, (z + 300) / 600) - 0.5;
    if (z >= 0) return c - z * 0.5 + u * 8 * Math.min(1, z / 20) + v * 2;
    const t = -z, ledge = t < 4 ? 1.5 * t / 4 : t < 16 ? 1.5 + (t - 4) * 0.25 : t < 40 ? 4.5 + (t - 16) * 1.15 : 4.5 + 27.6 + (t - 40) * 0.33;
    return Math.max(-3, c - ledge + (u * 7 + v * 2) * THREE.MathUtils.smoothstep(t, 14, 24)); };
  const G = new T.PlaneGeometry(500, 500, 250, 250); G.rotateX(-PI / 2); const gp = G.attributes.position, colA = new Float32Array(gp.count * 3);
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i) - 60, y = H(x, z); gp.setY(i, y); gp.setZ(i, z); }
  G.computeVertexNormals(); const gn = G.attributes.normal;
  for (let i = 0; i < gp.count; i++) { const y = gp.getY(i), slope = 1 - gn.getY(i), rock = Math.min(1, slope * 3.2 + (y > 55 ? 0.5 : 0)), g = [0.3, 0.52, 0.2], rk = [0.62, 0.56, 0.52]; for (let k = 0; k < 3; k++) colA[i * 3 + k] = g[k] + (rk[k] - g[k]) * rock; }
  G.setAttribute('color', new T.BufferAttribute(colA, 3)); const uv = G.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 500, uv.getY(i) * 500);
  const rockM = ENV.mt(ENV.T.rock('#d8d0c8'), 10); rockM.vertexColors = true; const ground = new T.Mesh(G, rockM); ground.receiveShadow = true; ground.castShadow = true; scene.add(ground);
  // boulders on the crest + scree
  const bM = ENV.mt(ENV.T.rock('#8a8078'), 6);
  for (let i = 0; i < 60; i++) { const x = (r() - 0.5) * 160, z = (r() - 0.6) * 30, g = new T.DodecahedronGeometry(1, 0); g.scale(0.7 + r() * 0.5, 0.5 + r() * 0.5, 0.7 + r() * 0.5);
    if (Math.abs(x) < 18) continue; const m = new T.Mesh(g, bM); const s = 1 + r() * 3.5; m.scale.setScalar(s); m.position.set(x, H(x, z) + s * 0.3, z); m.rotation.set(r() * 3, r() * 3, 0); m.castShadow = m.receiveShadow = true; scene.add(m); }
  // sea far below
  const wn = ENV.waterNormal(); wn.repeat.set(80, 80);
  const sea = new T.Mesh(new T.PlaneGeometry(3000, 3000), new T.MeshPhysicalMaterial({ color: '#16405a', roughness: 0.2, clearcoat: 0.4, normalMap: wn, normalScale: new T.Vector2(0.6, 0.6), envMapIntensity: 0.7 })); sea.rotation.x = -PI / 2; sea.position.set(0, 0.5, -700); scene.add(sea);
  // their city on the slope: houses tilted downhill (sliding), cracks, debris, a road
  const houses = new T.Group(); let sd = 11;
  for (let z = -46; z > -125; z -= 10) for (let x = -70; x <= 70; x += 14) { if (Math.abs(x) < 6) continue; if (r() < 0.25) continue;
    const h = ENV.house({ seed: sd++ * 17, lit: true, w: 10, d: 9 }); const y = H(x, z); h.position.set(x + (r() - 0.5) * 4, y - 0.8, z + (r() - 0.5) * 4); h.rotation.set(-0.2 - r() * 0.3, (r() - 0.5) * 0.8 + (r() > 0.5 ? 0 : PI), (r() - 0.5) * 0.45); h.scale.setScalar(0.9); houses.add(h); }
  scene.add(houses);
  const crackM = new T.MeshBasicMaterial({ color: '#1a1210' });
  for (let i = 0; i < 26; i++) { const x0 = (r() - 0.5) * 120, z0 = -44 - r() * 70; let pts = [], x = x0, z = z0; for (let k = 0; k < 8; k++) { pts.push(V(x, H(x, z) + 0.15, z)); x += (r() - 0.5) * 8; z -= 1 + r() * 2; } scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.25 + r() * 0.3, 4), crackM)); }
  for (let i = 0; i < 80; i++) { const x = (r() - 0.5) * 140, z = -44 - r() * 70, s = 0.4 + r() * 1.2, m = new T.Mesh(new T.BoxGeometry(s, s * 0.6, s), bM); m.position.set(x, H(x, z) + s * 0.3, z); m.rotation.set(r(), r(), r()); m.castShadow = true; scene.add(m); }
  // the rope: from the Fog side (+z), up our slope, through a worn notch with a wooden roller at the crest, down to their first knot and their city
  const RY = 2.8, pts = [];
  for (let z = 120; z >= 4; z -= 4) pts.push(V(0.4 * Math.sin(z * 0.05), H(0, z) + RY, z));
  pts.push(V(0, crest(0) + 2.9, 1.0)); pts.push(V(0, crest(0) + 2.9, -1.2));
  for (let z = -6; z >= -130; z -= 3) pts.push(V(0.8 * Math.sin(z * 0.04), H(0, z) + RY, z));
  const rope = ROPE.make(pts, 0.32, { maxSeg: 9000 }); scene.add(rope);
  const roller = new T.Group(), wood = ENV.mt(ENV.T.wood('#6a4a30'), 2); const cyl = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 3, 16), wood); cyl.rotation.z = PI / 2; cyl.position.y = crest(0) + 1.9; roller.add(cyl);
  [-1.8, 1.8].forEach((x) => { const p = new T.Mesh(new T.BoxGeometry(0.5, 4.2, 0.6), wood); p.position.set(x, crest(0) + 0.6, 0); roller.add(p); }); ENV.shadow(roller); scene.add(roller);
  const cv = rope.userData.curve, L = rope.userData.len;
  const sAt = (z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (cv.getPointAt(m).z > z) lo = m; else hi = m; } return lo * L; };
  // Wave Day dressing: bunting along the rope at the crest + banner
  const deco = new T.Group(); deco.visible = false; scene.add(deco);
  const flagC = ['#e84040', '#f2c94c', '#2fa3a0', '#f07a1a', '#7a4ad8', '#ffffff'];
  [-1, 1].forEach((side) => { const a = V(side * 10, crest(side * 10) + 7, 0), b = V(-side * 2, crest(0) + 6.5, 0); });
  { const A = V(-14, crest(-14) + 6, -0.5), B = V(14, crest(14) + 6, -0.5); const c = new T.QuadraticBezierCurve3(A, V(0, crest(0) + 3.5, -0.5), B); deco.add(new T.Mesh(new T.TubeGeometry(c, 40, 0.05, 4), new T.MeshStandardMaterial({ color: '#2a2a2a' })));
    for (let i = 1; i < 28; i++) { const p = c.getPoint(i / 28), f = new T.Mesh(new T.ConeGeometry(0.42, 0.9, 3), new T.MeshStandardMaterial({ color: flagC[i % 6], roughness: 0.7, side: T.DoubleSide })); f.position.copy(p).add(V(0, -0.45, 0)); f.rotation.x = PI; f.scale.z = 0.15; deco.add(f); }
    [-14, 14].forEach((x) => { const p = new T.Mesh(new T.CylinderGeometry(0.2, 0.25, 8, 8), wood); p.position.set(x, crest(x) + 3, -0.5); deco.add(p); });
    const bt = KIT.textTex(1024, 256, (g, w, h) => { g.fillStyle = '#f6efe0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e84040'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26); g.font = '900 150px "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 14; g.strokeStyle = '#1a1410'; g.strokeText('WAVE DAY', w / 2, h / 2 + 6); g.fillStyle = '#f2c94c'; g.fillText('WAVE DAY', w / 2, h / 2 + 6); });
    const ban = new T.Mesh(new T.PlaneGeometry(12, 3), new T.MeshStandardMaterial({ map: bt, side: T.DoubleSide, roughness: 0.8 })); ban.position.set(0, crest(0) + 9.5, -0.6); deco.add(ban);
    [-6, 6].forEach((x) => { const p = new T.Mesh(new T.CylinderGeometry(0.15, 0.18, 11, 8), wood); p.position.set(x, crest(x) + 5, -0.6); deco.add(p); }); }
  ENV.shadow(deco);
  const set = { scene, rope, sAt, H, crest, grade: 'sunset', houses, deco };
  set.mood = (m) => { const day = m === 'day'; deco.visible = day; scene.fog.color.set(day ? '#cfe0f4' : '#c9a8a8'); scene.fog.density = day ? 0.0018 : 0.0026;
    sky.material.uniforms.top.value.set(day ? '#2a78e0' : '#3a4a8a'); sky.material.uniforms.mid.value.set(day ? '#79b8f2' : '#d08a7a'); sky.material.uniforms.hor.value.set(day ? '#d8eeff' : '#ffd0a8'); sky.material.uniforms.sunDir.value.set(...(day ? [0.4, 0.7, -0.6] : [0.55, 0.12, -0.83])).normalize();
    sun.color.set(day ? '#fff0d6' : '#ffcf9a'); sun.position.set(...(day ? [40, 80, -40] : [60, 40, -80])); hemi.color.set(day ? '#cfe4ff' : '#ffd8c0');
    houses.children.forEach((h, i) => { h.rotation.x = day ? 0 : h.userData.rx ?? (h.userData.rx = h.rotation.x); h.rotation.z = day ? 0 : h.userData.rz ?? (h.userData.rz = h.rotation.z); }); };
  houses.children.forEach((h) => { h.userData.rx = h.rotation.x; h.userData.rz = h.rotation.z; });
  return set;
};

// rbx-rope COAST set: the rope leaves the land on a wooden pier and crosses the ocean on tall pylons (Y-saddle tops),
// sagging between them to the horizon. Beach, rocks, a lighthouse on the headland, gulls. Sunset, sun low over the sea.
// Shore at z~0 (land +z, sea -z). Pier x -2..2 from z=4 to z=-40; pylons every 16 from z=-48 to -1600 at x=0.
'use strict';
SETS.coast = async function (ctx) {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, { rng, fbm } = RBX;
  const scene = new T.Scene(), r = rng(301);
  scene.fog = new T.FogExp2('#e8a888', 0.0006);
  const sunDir = V(0.05, 0.07, -1).normalize();
  ENV.sky(scene, ctx.renderer, { top: '#2a3a7a', mid: '#d27a6a', hor: '#ffc890', sun: sunDir.toArray(), sunC: '#ffd7a0', sunK: 1.2, sunS: 0.9992, glow: 0.9 });
  ENV.clouds(scene, 12, { s: 20, a0: PI - 0.9, a1: 1.8, d: 900, y: 130, c: '#ffd0b0', e: '#e07a60', ei: 0.6 });
  scene.add(new T.HemisphereLight('#8aa8ff', '#6a4a3a', 1.3));
  const sun = new T.DirectionalLight('#ffc890', 7); sun.position.copy(sunDir).multiplyScalar(120); sun.position.y += 10; sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 300 }); sun.target.position.set(0, 0, -10); scene.add(sun, sun.target);
  const rim = new T.DirectionalLight('#9ab0ff', 1.2); rim.position.set(-30, 20, 40); scene.add(rim);
  // sea: big physical plane, wave normal map, reflects the sky env
  const wn = ENV.waterNormal(); wn.repeat.set(120, 120);
  const seaM = new T.MeshPhysicalMaterial({ color: '#0c2a44', roughness: 0.18, metalness: 0.0, clearcoat: 0.3, clearcoatRoughness: 0.3, normalMap: wn, normalScale: new T.Vector2(0.7, 0.7), envMapIntensity: 0.6 });
  const sea = new T.Mesh(new T.PlaneGeometry(6000, 6000), seaM); sea.rotation.x = -PI / 2; sea.position.set(0, -0.6, -2000); sea.receiveShadow = true; scene.add(sea);
  // beach: sloping sand into the water + headland rocks
  const sandM = ENV.mt(ENV.T.sand(), 6), rockM = ENV.mt(ENV.T.rock('#6a5e58'), 8);
  const bg = new T.PlaneGeometry(600, 300, 120, 60); bg.rotateX(-PI / 2); const bp = bg.attributes.position, n = fbm(303, 3, 4);
  for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), z = bp.getZ(i) + 150, d = z; bp.setY(i, Math.min(6, d * 0.08) - 1.2 + (n((x + 300) / 600, z / 300) - 0.5) * 1.2); bp.setZ(i, z - 10); }
  bg.computeVertexNormals(); const uv = bg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 600, uv.getY(i) * 300); const beach = new T.Mesh(bg, sandM); beach.receiveShadow = true; scene.add(beach);
  const rocks = []; for (let i = 0; i < 40; i++) { const g = new T.DodecahedronGeometry(1, 0); g.scale(0.8 + r() * 0.4, 0.6 + r() * 0.4, 0.8 + r() * 0.4);
    const m = new T.Mesh(g, rockM), side = i % 2 ? 1 : -1, x = side * (14 + r() * 50), s = 1.5 + r() * 5; m.position.set(x, -0.4, -6 + r() * 14); m.scale.setScalar(s); m.rotation.set(r() * 3, r() * 3, 0); m.castShadow = m.receiveShadow = true; scene.add(m); rocks.push(m); }
  // headland + lighthouse (right side)
  const head = new T.Mesh(new T.CylinderGeometry(26, 40, 22, 14, 3), rockM); head.position.set(-90, 4, -60); head.castShadow = head.receiveShadow = true; scene.add(head);
  const lh = new T.Group(); const tw = new T.Mesh(new T.CylinderGeometry(3, 4.2, 26, 24), (() => { const c = RBX.cnv(256, 256), q = c.getContext('2d'); for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#f4f0e8' : '#c8302a'; q.fillRect(0, i * 32, 256, 32); } const m = new T.MeshStandardMaterial({ map: RBX.tex(c), roughness: 0.6 }); return m; })()); tw.position.y = 13; lh.add(tw);
  const lamp = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 3, 16), new T.MeshStandardMaterial({ color: '#fff0c0', emissive: '#ffd070', emissiveIntensity: 8 })); lamp.position.y = 27.5; lh.add(lamp); const cap = new T.Mesh(new T.ConeGeometry(3.2, 3, 16), new T.MeshStandardMaterial({ color: '#2a2a2a' })); cap.position.y = 30.5; lh.add(cap);
  lh.position.set(-90, 15, -60); ENV.shadow(lh); scene.add(lh);
  // pier: planks on posts, railing
  const wood = ENV.mt(ENV.T.wood('#7a5a3a'), 3), dark = ENV.mt(ENV.T.wood('#4a3424'), 2);
  const box = (w, h, d, m, x, y, z) => { const g = new T.BoxGeometry(w, h, d); KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; scene.add(me); return me; };
  const PIER0 = 8, PIER1 = -44; box(7, 0.4, PIER0 - PIER1, wood, 0, 1.2, (PIER0 + PIER1) / 2);
  for (let z = PIER1; z <= PIER0; z += 4) [-3.2, 3.2].forEach((x) => { box(0.5, 6, 0.5, dark, x, -1.6, z); box(0.25, 1.4, 0.25, dark, x, 2.1, z); });
  [-3.2, 3.2].forEach((x) => box(0.2, 0.2, PIER0 - PIER1, dark, x, 2.8, (PIER0 + PIER1) / 2));
  // pylons with saddles: the rope rests in the Y at y=7.5 and sags between
  const pyl = (z, h = 7.5) => { const g = new T.Group(); const p = new T.Mesh(new T.CylinderGeometry(0.42, 0.55, h + 4, 10), dark); p.position.y = (h + 4) / 2 - 4; g.add(p);
    [-1, 1].forEach((s) => { const a = new T.Mesh(new T.BoxGeometry(0.3, 1.4, 0.4), dark); a.position.set(s * 0.45, h + 0.2, 0); a.rotation.z = -s * 0.5; g.add(a); });
    const ring = new T.Mesh(new T.TorusGeometry(0.6, 0.12, 8, 16), new T.MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.6, roughness: 0.5 })); ring.position.y = h - 0.4; ring.rotation.x = PI / 2; g.add(ring);
    g.position.set(0, -0.6, z); ENV.shadow(g); scene.add(g); return g; };
  const pts = [], RY = 2.8;
  // land part: down the beach to the pier (held by people), then up onto the pylons
  for (let z = 80; z >= PIER1; z -= 4) pts.push(V(0, (z > PIER0 ? Math.max(1.4, Math.min(6, (z + 10) * 0.08) - 1.2) : 1.4) + RY, z));
  const tops = []; for (let z = PIER1 - 12, k = 0; z > -1600; z -= 16 + k * 0.6, k++) { const h = 7.5 + Math.min(8, k * 0.25); pyl(z, h); tops.push(V(0, h - 0.6 + 0.0, z)); }
  tops.forEach((t, i) => { if (i) { const m = tops[i - 1].clone().lerp(t, 0.5); m.y -= 1.6; pts.push(m); } pts.push(t.clone().add(V(0, 0.15, 0))); });
  const rope = ROPE.make(pts, 0.32, { maxSeg: 12000 }); scene.add(rope);   // arclength 0 on the land, tangent points out to sea (-z, toward the Fog)
  // gulls
  const gm = new T.MeshBasicMaterial({ color: '#2a2020' }); for (let i = 0; i < 14; i++) { const g = new T.Group(); [-1, 1].forEach((s) => { const w = new T.Mesh(new T.BoxGeometry(1.1, 0.06, 0.3), gm); w.position.x = s * 0.5; w.rotation.z = s * 0.35; g.add(w); }); g.position.set((r() - 0.5) * 60, 14 + r() * 18, -30 - r() * 120); g.scale.setScalar(0.8 + r()); scene.add(g); }
  const L = rope.userData.len, cv = rope.userData.curve;
  const sAt = (z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (cv.getPointAt(m).z > z) lo = m; else hi = m; } return lo * L; };
  return { scene, rope, sAt, grade: 'sunset', pier: [PIER0, PIER1], ground: (z) => (z > PIER0 ? Math.max(-1, Math.min(6, (z + 10) * 0.08) - 1.2) : 1.4) };
};

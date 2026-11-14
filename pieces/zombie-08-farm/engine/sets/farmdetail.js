// sets/farmdetail.js — ep8 detail pass (user, after storyboard v1: "a bit more detail on everything, still low poly, it all
// looks very flat"). Adds to the farm world of farm.js: varied terrain (vertex-colour patches, bumps beyond the fields, far
// hills), dirt paths, mud + puddles at the pen, grass tufts / tall grass / bushes as crossed cards, card trees, relief on the
// barn (battens, X braces, hay loft, weathervane, fascia) and the house (shutters, window trim, corner boards, fascia, porch
// light, rocker, mailbox), scattered props in code (barrels, tires, wheelbarrow, crates, tools, hose, old tractor), contact
// shadows (blob decals + AO strips at building bases), power poles to the horizon, the county road, a neighbour farm, sky
// clouds, moon, and the night light spill. Deterministic (L.rng). Returns { setTod(k), trees(x,z,h) }.
export async function addFarmDetail(L, scene, R) {
  const { THREE } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const rgb = (a, b, c) => `rgb(${Math.max(0, Math.min(255, a | 0))},${Math.max(0, Math.min(255, b | 0))},${Math.max(0, Math.min(255, c | 0))})`;
  const B = (w, h, d, m, x, y, z, p = scene) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p = scene) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const basic = (t, col = 0xffffff, extra) => L.basic(t, col, extra);
  const DS = THREE.DoubleSide;
  const rnd = L.rng(808);
  const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');
  const noise = (x, z) => Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2) * 0.5 + Math.sin(z * 0.13 + x * 0.05) * 0.35 + Math.sin((x + z) * 0.31) * 0.15;

  // ---------- textures ----------
  const tex = (w, h, f) => L.cvs(w, h, f);
  const MIPC = (t) => { t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; };
  const tTuft = tex(32, 32, (c) => { c.clearRect(0, 0, 32, 32); const r = L.rng(1); for (let k = 0; k < 22; k++) { const x0 = 4 + r() * 24, h = 10 + r() * 20, lean = (r() - 0.5) * 8, col = ['#5a7a2a', '#7a9a3a', '#4a6a24', '#9aa04a', '#6a8a30'][k % 5]; for (let i = 0; i < h; i++) px(c, x0 + lean * i / h, 31 - i, col, 1, 1); } });
  const tTall = tex(32, 64, (c) => { c.clearRect(0, 0, 32, 64); const r = L.rng(2); for (let k = 0; k < 26; k++) { const x0 = 3 + r() * 26, h = 30 + r() * 34, lean = (r() - 0.5) * 10, col = ['#8a8a3a', '#a8a24a', '#6a7a2a', '#c8b860', '#7a8a34'][k % 5]; for (let i = 0; i < h; i++) px(c, x0 + lean * i / h, 63 - i, col, 1, 1); if (r() < 0.4) px(c, x0 + lean - 1, 63 - h, '#d8c880', 3, 3); } });
  const tLeaves = (seed, base) => tex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); const r = L.rng(seed); for (let k = 0; k < 260; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 28, x = 32 + Math.cos(a) * d, y = 34 + Math.sin(a) * d * 0.85; const sh = (y - 10) / 54; px(c, x, y, rgb(base[0] * (1.2 - sh * 0.6) + (r() - 0.5) * 30, base[1] * (1.2 - sh * 0.6) + (r() - 0.5) * 30, base[2] * (1.2 - sh * 0.6)), 3, 2); } });
  const tLeafA = tLeaves(3, [70, 110, 48]), tLeafB = tLeaves(4, [90, 120, 50]), tLeafC = tLeaves(5, [56, 90, 52]), tBush = tLeaves(6, [64, 100, 44]);
  const tBark = tex(16, 32, (c) => { const r = L.rng(7); for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) px(c, x, y, rgb(84 + (x % 4 === 0 ? -20 : 0) + (r() - 0.5) * 20, 64 + (r() - 0.5) * 14, 46)); });
  const tPath = tex(32, 32, (c) => { c.clearRect(0, 0, 32, 32); const r = L.rng(8); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const e = Math.min(x, 31 - x); if (e < 4 && r() > e / 4) continue; px(c, x, y, rgb(128 + (r() - 0.5) * 30, 104 + (r() - 0.5) * 24, 74 + (r() - 0.5) * 16)); } for (let k = 0; k < 20; k++) px(c, 6 + r() * 20, r() * 32, '#8a7058', 2, 1); });
  const tMud = tex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); const r = L.rng(9); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const d = Math.hypot(x - 32, y - 32) / 32 + (r() - 0.5) * 0.25; if (d > 1) continue; px(c, x, y, rgb(84 + (r() - 0.5) * 20, 64 + (r() - 0.5) * 14, 44 + (r() - 0.5) * 10)); } for (let k = 0; k < 40; k++) px(c, 10 + r() * 44, 10 + r() * 44, '#5a4430', 3, 2); });
  const tPuddle = tex(32, 32, (c) => { c.clearRect(0, 0, 32, 32); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot(x - 16, (y - 16) * 1.3) / 15; if (d > 1) continue; px(c, x, y, d > 0.8 ? '#4a4038' : y < 13 ? '#9ab0c0' : '#6a7e8e'); } });
  const tBlob = tex(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const tAO = tex(4, 16, (c) => { const g = c.createLinearGradient(0, 16, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 4, 16); });
  const tAOg = tex(16, 4, (c) => { const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 4); });
  const tRust = tex(32, 32, (c) => { const r = L.rng(10); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(120 + (r() - 0.5) * 30, 58 + (r() - 0.5) * 20, 34)); for (let y = 4; y < 32; y += 12) px(c, 0, y, '#3a2a1e', 32, 2); for (let k = 0; k < 20; k++) px(c, r() * 32, r() * 32, '#c87a3a', 2, 2); });
  const tBlue = tex(32, 32, (c) => { const r = L.rng(11); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(40 + (r() - 0.5) * 16, 70 + (r() - 0.5) * 16, 120 + (r() - 0.5) * 20)); for (let y = 6; y < 32; y += 10) px(c, 0, y, '#1a2a4a', 32, 2); });
  const tCrate = tex(32, 32, (c) => { const r = L.rng(12); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(168 + (y % 8 === 0 ? -50 : 0) + (r() - 0.5) * 16, 130 + (r() - 0.5) * 14, 84)); for (let k = 0; k < 32; k++) { px(c, k, k, '#7a5a38', 2, 1); } px(c, 0, 0, '#6a4a2a', 32, 2); px(c, 0, 30, '#6a4a2a', 32, 2); px(c, 0, 0, '#6a4a2a', 2, 32); px(c, 30, 0, '#6a4a2a', 2, 32); });
  const tTire = tex(16, 8, (c) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 8; y++) px(c, x, y, (x + y) % 4 < 2 ? '#1a1a1a' : '#2e2e2c'); });
  const tShut = tex(16, 32, (c) => { for (let y = 0; y < 32; y++) px(c, 0, y, y % 3 === 0 ? '#1e3a2a' : '#2e5a40', 16, 1); px(c, 0, 0, '#183022', 16, 1); px(c, 0, 31, '#183022', 16, 1); px(c, 0, 0, '#183022', 1, 32); px(c, 15, 0, '#183022', 1, 32); });
  const tTrim = tex(8, 8, (c) => { const r = L.rng(13); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px(c, x, y, rgb(232 + (r() - 0.5) * 12, 228 + (r() - 0.5) * 12, 214)); });
  const tRed = tex(16, 16, (c) => { const r = L.rng(14); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(c, x, y, rgb(150 + (r() - 0.5) * 20, 34, 26)); });
  const tWood = tex(32, 8, (c) => { const r = L.rng(15); for (let y = 0; y < 8; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(130 + Math.sin(x * 0.8 + y) * 12 + (r() - 0.5) * 12, 98 + (r() - 0.5) * 10, 64)); });
  const tPole = tex(8, 32, (c) => { const r = L.rng(16); for (let y = 0; y < 32; y++) for (let x = 0; x < 8; x++) px(c, x, y, rgb(96 + (x === 0 ? -20 : 0) + (r() - 0.5) * 14, 74 + (r() - 0.5) * 10, 52)); });
  const tAsph = tex(32, 32, (c) => { const r = L.rng(17); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(72 + (r() - 0.5) * 18, 72 + (r() - 0.5) * 18, 76 + (r() - 0.5) * 18)); for (let y = 0; y < 32; y += 16) px(c, 15, y, '#d8c850', 2, 8); });
  const tHay = tex(32, 32, (c) => { const r = L.rng(18); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, rgb(196 + (r() - 0.5) * 40, 164 + (r() - 0.5) * 36, 80 + (r() - 0.5) * 20)); for (let k = 0; k < 40; k++) px(c, r() * 32, r() * 32, '#8a6a30', 3, 1); });

  // ---------- terrain: vertex-colour patches, bumps only beyond the fields, far hills ----------
  { const g = new THREE.PlaneGeometry(900, 900, 150, 150); g.rotateX(-Math.PI / 2); const P = g.attributes.position, col = [];
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), r = Math.max(Math.abs(x) - 125, Math.abs(z) - 118, 0); const ramp = Math.min(1, r / 60);
      P.setY(i, ramp * (noise(x, z) * 3.5 + 1.2) - 0.02); const n = noise(x * 2.3, z * 2.1), m = noise(z * 1.7 + 40, x * 1.3);
      const k = 0.82 + 0.22 * n; col.push(k * (1 + 0.12 * m), k, k * (1 - 0.1 * m)); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const MIP = (t) => { t.minFilter = THREE.NearestMipmapLinearFilter; t.magFilter = THREE.NearestFilter; t.generateMipmaps = true; t.needsUpdate = true; return t; };   // v4: mip-mapped minification, no sparkle in the distance
    const m = lam(MIP(R.grassRep), 0xffffff); m.vertexColors = true; const t = new THREE.Mesh(g, m); t.renderOrder = -2; scene.add(t); R.ground.visible = false; }
  { const hillM = lam(null, 0x5a7a5a); const hills = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + rnd() * 0.2, d = 330 + rnd() * 50, h = 18 + rnd() * 30;
      const g = new THREE.ConeGeometry(50 + rnd() * 40, h, 7, 1); g.translate(0, h / 2 - 2, 0); g.scale(1, 1, 0.6 + rnd() * 0.4); g.rotateY(rnd() * 3); g.translate(Math.cos(a) * d, 0, Math.sin(a) * d); hills.push(g); }
    const hm = new THREE.Mesh(mergeGeometries(hills), hillM); scene.add(hm); }
  // ---------- county road + power poles to the horizon + neighbour farm ----------
  L.plane(900, 7, lam(L.rep(tAsph, 120, 1)), 0, 0.03, 113, scene, 0, -Math.PI / 2);
  { const poleM = lam(tPole), wire = new THREE.LineBasicMaterial({ color: 0x18181a }); const tops = [];
    const pole = (x, z, ry = 0) => { cyl(0.13, 0.16, 9, 6, poleM, x, 4.5, z); const cb = B(2.2, 0.14, 0.14, poleM, x, 8.4, z); cb.rotation.y = ry; tops.push([x, z, ry]); };
    for (let z = 22; z <= 108; z += 30) pole(-4.2, z, Math.PI / 2); for (let x = -420; x <= 420; x += 42) pole(x, 116.5, 0);
    const line = (a, b) => { const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(V(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - Math.sin(u * Math.PI) * 0.8, a.z + (b.z - a.z) * u)); } scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wire)); };
    const run = (list) => { for (let i = 0; i + 1 < list.length; i++) for (const o of [-0.9, 0.9]) { const [x1, z1, r1] = list[i], [x2, z2, r2] = list[i + 1]; line(V(x1 + Math.cos(r1) * o, 8.5, z1 - Math.sin(r1) * o), V(x2 + Math.cos(r2) * o, 8.5, z2 - Math.sin(r2) * o)); } };
    run(tops.filter((t) => t[0] === -4.2)); run(tops.filter((t) => t[2] === 0)); line(V(-4.2, 8.5, 22), V(-4.9, 5.4, 3.0)); }
  { const nb = new THREE.Group(); nb.position.set(-210, 0, -170); scene.add(nb); B(14, 6, 10, lam(tRed, 0xb04030), 0, 3, 0, nb); B(15, 1, 11, lam(null, 0x55585e), 0, 6.5, 0, nb); cyl(3, 3, 16, 10, lam(null, 0xb8b8c0), 12, 8, 0, nb); L.mesh(new THREE.SphereGeometry(3, 10, 5, 0, 6.3, 0, 1.6), lam(null, 0x9a9aa0), 12, 16, 0, nb);
    const nb2 = nb.clone(); nb2.position.set(260, 0, -90); nb2.rotation.y = 1.2; scene.add(nb2); }

  // ---------- paths, mud, puddles ----------
  const PO = { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -16 };
  const decal = (t, w, l, x, z, ry, y = 0.035, col = 0xffffff) => { const p = L.plane(w, l, lam(t, col, { transparent: true, alphaTest: 0.3, depthWrite: false, ...PO }), x, y, z, scene, 0, -Math.PI / 2); p.rotation.z = ry; p.renderOrder = -1; return p; };
  const path = (x0, z0, x1, z1, w = 1.6) => { const l = Math.hypot(x1 - x0, z1 - z0); const t = L.rep(tPath, 1, Math.max(1, Math.round(l / 2))); decal(t, w, l, (x0 + x1) / 2, (z0 + z1) / 2, Math.atan2(x1 - x0, z1 - z0)); };
  path(-1.0, 5.5, -13.5, -3.6); path(4.0, 6.5, 12.5, -1.4, 1.3); path(3.0, 8.0, 8.6, 7.6, 1.2); path(-14.2, -1.0, -24, -19, 1.4); path(12.5, 6.0, 20, 2.0, 1.2);
  decal(tMud, 6.5, 11.5, -9.8, 4.0, 0.0, 0.04); decal(tMud, 3.2, 3.0, -9.5, 4.0, 0.4, 0.045); decal(tMud, 3, 2.4, 24, 2, 0.2, 0.04);
  for (const [x, z, s] of [[-11.5, 7.5, 1.0], [-8.2, 1.0, 0.7], [-10.6, 2.2, 0.5], [-4.5, 8.5, 0.8], [6.5, 16, 1.1], [0.5, 30, 1.3], [-0.8, 46, 0.9]]) decal(tPuddle, 1.6 * s, 1.1 * s, x, z, rnd() * 3, 0.05);
  // ---------- cards: grass tufts, tall grass at the edges, bushes ----------
  const cardGeo = (w, h) => { const a = new THREE.PlaneGeometry(w, h), b = a.clone(); b.rotateY(Math.PI / 2); a.translate(0, h / 2, 0); b.translate(0, h / 2, 0); return mergeGeometries([a, b]); };
  const scatter = (geo, mat, pts) => { const im = new THREE.InstancedMesh(geo, mat, pts.length); const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V(), p = V();
    pts.forEach(([x, z, k, a], i) => { q.setFromAxisAngle(V(0, 1, 0), a); s.set(k, k, k); p.set(x, 0, z); M.compose(p, q, s); im.setMatrixAt(i, M); }); im.frustumCulled = false; scene.add(im); return im; };
  const free = (x, z) => { if (Math.hypot(x - 2, z - 12) < 14.5) return false; if (Math.abs(x) < 3 && z > 15 && z < 160) return false; if (Math.abs(x + 20) < 6.5 && Math.abs(z + 4) < 8.5) return false; if (Math.abs(x) < 5.5 && z > -4.5 && z < 7) return false;
    if (Math.hypot((x + 24) / 7.6, (z + 27) / 5.3) < 1) return false; if (Math.abs(x - 13) < 2.4 && Math.abs(z + 3) < 2) return false; if (Math.abs(x + 30) < 3.5 && Math.abs(z + 14) < 3.5) return false; if (Math.abs(z - 113) < 4) return false; return true; };
  { const mT = new THREE.MeshLambertMaterial({ map: MIPC(tTuft), side: DS, alphaTest: 0.5 }); /* v4: no PS1 vertex snap on the tiny cards (they shimmered) */ const pts = []; while (pts.length < 5200) { const x = (rnd() - 0.5) * 220, z = (rnd() - 0.5) * 220 + 10; if (free(x, z)) pts.push([x, z, 0.35 + rnd() * 0.45, rnd() * 6]); } scatter(cardGeo(0.9, 0.6), mT, pts); }
  { const mT = new THREE.MeshLambertMaterial({ map: MIPC(tTall), side: DS, alphaTest: 0.5 }); const pts = []; const along = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const u = rnd(), x = x0 + (x1 - x0) * u + (rnd() - 0.5) * 0.8, z = z0 + (z1 - z0) * u + (rnd() - 0.5) * 0.8; if (free(x, z) || Math.abs(x) > 6) pts.push([x, z, 0.7 + rnd() * 0.5, rnd() * 6]); } };
    along(20, -22, 20, 24, 70); along(20, 24, 62, 24, 60); along(20, -22, 62, -22, 60); along(-60, 69.4, -3, 69.4, 90); along(3, 69.4, 60, 69.4, 90); along(-13.4, -2, -13.4, 10, 20); along(-28, -34, -19, -34, 15); along(-34, -20, -32, -36, 15);
    along(-3.2, 18, -3.2, 66, 50); along(3.2, 18, 3.2, 66, 50); scatter(cardGeo(0.9, 1.1), mT, pts); }
  { const mB = new THREE.MeshLambertMaterial({ map: tBush, side: DS, alphaTest: 0.5 }); const pts = []; for (const [x, z] of [[-5.6, 4.6], [5.6, 4.6], [-5.8, -4.4], [5.8, -4.5], [-4.8, 6.9], [4.8, 6.9], [14.6, -1.2], [11.2, -4.8], [-14.2, 8.6], [-26.5, 5.5], [-27, -12], [19.5, 25], [-6, 22], [7, 24], [-17, -22], [30, -26], [-33, -30]]) pts.push([x, z, 0.9 + rnd() * 0.6, rnd() * 6]); scatter(cardGeo(1.6, 1.2), mB, pts); }
  // ---------- card trees (trunk + 3 levels of crossed leaf cards) ----------
  const LEAFM = [tLeafA, tLeafB, tLeafC].map((t) => lam(t, 0xffffff, { side: DS, alphaTest: 0.5 }));
  const blob = (x, z, r, y = 0.06) => { const p = L.plane(r * 2, r * 2, basic(tBlob, 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -24 }), x, y, z, scene, 0, -Math.PI / 2); p.renderOrder = -1; return p; };
  function tree(x, z, h, kind = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); cyl(0.16 * h / 8, 0.3 * h / 8, h * 0.55, 6, lam(tBark), 0, h * 0.27, 0, g);
    for (const [y, s, n] of [[0.42, 0.62, 3], [0.62, 0.5, 3], [0.8, 0.34, 2]]) for (let k = 0; k < n; k++) { const w = h * s * (0.9 + rnd() * 0.3); const card = L.mesh(cardGeo(w, w * 0.8), LEAFM[(kind + k) % 3], (rnd() - 0.5) * h * 0.12, h * y - w * 0.3, (rnd() - 0.5) * h * 0.12, g); card.rotation.y = rnd() * 3; }
    for (let k = 0; k < 2; k++) { const br = cyl(0.04, 0.07, h * 0.3, 4, lam(tBark), 0, h * 0.45, 0, g); br.rotation.set(0.8, k * 2.4, 0); }
    blob(x, z, h * 0.35); return g; }
  for (const [x, z, h, k] of [[-8, -10, 9, 0], [7, -9, 10, 1], [-3, -12, 8, 2], [16, 12, 7, 0], [-30, 6, 9, 1], [26, -30, 8, 2], [-40, -30, 10, 0], [-9, -14, 7, 1], [11, -12, 8, 2], [18.5, 16, 6, 1], [-34, 12, 8, 2], [-45, -8, 11, 0], [40, -34, 9, 1], [-50, 40, 10, 2], [48, 30, 9, 0], [-14, 26, 7, 1], [12, 30, 6, 2]]) tree(x, z, h, k);
  // ---------- contact shadows / AO at building bases ----------
  const aoWall = (x, z, len, ry, h = 0.9) => { const p = L.plane(len, h, basic(L.rep(tAO, Math.max(1, len), 1), 0xffffff, { transparent: true, depthWrite: false, side: DS }), x, h / 2, z, scene, ry); p.renderOrder = 1; const g = L.plane(len, 1.2, basic(L.rep(tAOg, 1, Math.max(1, len)), 0xffffff, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -24 }), 0, 0, 0, scene, 0, -Math.PI / 2);
    g.rotation.z = ry; g.position.set(x + Math.sin(ry) * 0.6, 0.045, z + Math.cos(ry) * 0.6); g.renderOrder = -1; };
  aoWall(0, 4.03, 10, 0); aoWall(0, -4.03, 10, Math.PI); aoWall(5.03, 0, 8, Math.PI / 2); aoWall(-5.03, 0, 8, -Math.PI / 2);
  aoWall(-20, 4.03, 12, 0); aoWall(-20, -12.03, 12, Math.PI); aoWall(-13.97, -4, 16, Math.PI / 2); aoWall(-26.03, -4, 16, -Math.PI / 2);
  for (const [x, z, r] of [[9, 7, 1.4], [13, -3, 2.6], [8.2, 2.6, 1.6], [-30, -14, 3.8], [-16, 6, 1.6], [-9.5, 4, 1.1], [24, 2, 1.1], [10.4, 7.4, 0.6]]) blob(x, z, r);

  // ---------- barn relief: battens, X braces on the leaves, hay loft, weathervane, fascia ----------
  const barn = R.barn, mBat = lam(L.rep(tRed, 1, 4), 0xc8c8c8), mWhite = lam(tTrim);
  for (let z = -7.6; z <= 7.6; z += 0.8) { if (Math.abs(z) < 2.3) continue; B(0.06, 4.9, 0.07, mBat, 6.03, 2.45, z, barn); }
  for (let x = -5.6; x <= 5.6; x += 0.8) { B(0.07, 4.9, 0.06, mBat, x, 2.45, 8.03, barn); B(0.07, 4.9, 0.06, mBat, x, 2.45, -8.03, barn); }
  for (const lf of R.barnDoors) { const g = new THREE.Group(); lf.add(g); const d = Math.hypot(2.0, 3.8), a = Math.atan2(3.8, 2.0);
    for (const s of [-1, 1]) { const b = B(0.05, d, 0.16, mWhite, 0.07, 0, 0, g); b.rotation.x = s * (Math.PI / 2 - a); }
    B(0.05, 0.16, 2.1, mWhite, 0.07, 1.92, 0, g); B(0.05, 0.16, 2.1, mWhite, 0.07, -1.92, 0, g); B(0.05, 4.0, 0.16, mWhite, 0.07, 0, 0.97, g); B(0.05, 4.0, 0.16, mWhite, 0.07, 0, -0.97, g); }
  { const loft = new THREE.Group(); loft.position.set(6.05, 6.4, 0); barn.add(loft); B(0.04, 1.5, 1.5, basic(null, 0x120c08), 0, 0, 0, loft); for (let k = 0; k < 3; k++) B(0.5, 0.42, 0.8, lam(tHay), -0.3, -0.5 + k * 0.15, -0.35 + k * 0.3, loft);
    B(0.1, 0.1, 1.7, mWhite, 0.04, 0.8, 0, loft); B(0.1, 0.1, 1.7, mWhite, 0.04, -0.8, 0, loft); B(0.1, 1.7, 0.1, mWhite, 0.04, 0, 0.8, loft); B(0.1, 1.7, 0.1, mWhite, 0.04, 0, -0.8, loft);
    B(1.4, 0.18, 0.18, lam(tWood), 0.6, 1.45, 0, loft); cyl(0.12, 0.12, 0.06, 8, lam(null, 0x3a3a3a), 1.2, 1.3, 0, loft).rotation.x = Math.PI / 2; }
  { const v = new THREE.Group(); v.position.set(0, 9.05, 0); barn.add(v); const mBlk = lam(null, 0x1a1a1c); cyl(0.03, 0.03, 1.6, 4, mBlk, 0, 0.8, 0, v); B(0.9, 0.04, 0.04, mBlk, 0, 1.1, 0, v); B(0.04, 0.04, 0.9, mBlk, 0, 1.1, 0, v);
    const ar = B(0.05, 0.05, 1.2, mBlk, 0, 1.45, 0, v); const fin = B(0.02, 0.3, 0.25, mBlk, 0, 1.45, -0.6, v);
    const rooster = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); px(c, 4, 6, '#1a1a1c', 7, 5); px(c, 10, 3, '#1a1a1c', 3, 4); px(c, 12, 2, '#1a1a1c', 2, 1); px(c, 1, 3, '#1a1a1c', 4, 5); px(c, 6, 11, '#1a1a1c', 1, 3); px(c, 8, 11, '#1a1a1c', 1, 3); });
    L.plane(0.6, 0.6, basic(rooster, 0xffffff, { side: DS, alphaTest: 0.5 }), 0, 1.85, 0.1, v, Math.PI / 2); }
  for (const s of [-1, 1]) B(0.12, 0.25, 16.4, mWhite, s * 6.05, 5.0, 0, barn);
  // ---------- house: window trim + shutters, corner boards, fascia, porch light, rocker, pots, mailbox ----------
  const house = R.house, mSh = lam(tShut);
  for (const w of R.windows) { const p = w.position, ry = w.rotation.y, g = new THREE.Group(); g.position.copy(p); g.rotation.y = ry; house.add(g);
    B(1.2, 0.08, 0.06, mWhite, 0, 0.79, 0.03, g); for (const s of [-1, 1]) { B(0.08, 1.62, 0.06, mWhite, s * 0.56, 0, 0.03, g); if (Math.abs(ry) < 0.1 && p.y > 3) B(0.42, 1.55, 0.04, mSh, s * 0.85, 0, 0.03, g); } }
  for (const [x, z] of [[-5.02, 4.02], [5.02, 4.02], [-5.02, -4.02], [5.02, -4.02]]) B(0.2, 6.0, 0.2, mWhite, x, 3.0, z, house);
  for (const s of [-1, 1]) B(10.6, 0.22, 0.12, mWhite, 0, 6.02, s * 4.2, house);
  B(10.2, 0.3, 0.12, mWhite, 0, 3.02, 4.04, house);
  const porchLamp = B(0.16, 0.24, 0.12, basic(null, 0x8a7a50), 0.9, 2.45, 4.08, house);
  { const rk = new THREE.Group(); rk.position.set(-2.6, 0.5, 5.4); rk.rotation.y = 0.4; house.add(rk); const mW = lam(tWood); B(0.55, 0.05, 0.5, mW, 0, 0.42, 0, rk); B(0.55, 0.6, 0.05, mW, 0, 0.75, -0.25, rk); for (const s of [-1, 1]) { B(0.04, 0.42, 0.04, mW, s * 0.25, 0.21, 0.2, rk); B(0.04, 0.42, 0.04, mW, s * 0.25, 0.21, -0.2, rk); const r = B(0.04, 0.04, 0.8, mW, s * 0.25, 0.02, 0, rk); } }
  for (const [x, z] of [[-1.3, 6.2], [1.3, 6.2], [3.8, 4.5]]) { const pot = cyl(0.16, 0.12, 0.26, 7, lam(null, 0xa8583a), x, 0.63, z, house); L.mesh(cardGeo(0.45, 0.35), LEAFM[1], x, 0.74, z, house); }
  { const mb = new THREE.Group(); mb.position.set(3.4, 0, 71.2); scene.add(mb); B(0.1, 1.1, 0.1, lam(tWood), 0, 0.55, 0, mb); const box = B(0.24, 0.24, 0.5, lam(null, 0x2a3a5a), 0, 1.2, 0, mb); B(0.02, 0.18, 0.05, lam(null, 0xc82a1a), 0.13, 1.3, 0.1, mb); }
  // ---------- scattered props (code) ----------
  const barrel = (x, z, t = tRust, ry = 0, lie = false) => { const g = new THREE.Group(); g.position.set(x, lie ? 0.29 : 0, z); g.rotation.y = ry; scene.add(g); const b = cyl(0.29, 0.29, 0.88, 10, lam(L.rep(t, 3, 1)), 0, lie ? 0 : 0.44, 0, g); if (lie) b.rotation.z = Math.PI / 2; L.mesh(new THREE.CircleGeometry(0.27, 10), lam(null, 0x3a2a20), 0, lie ? 0 : 0.885, 0, g).rotation.x = -Math.PI / 2; blob(x, z, 0.55); };
  barrel(15.6, -1.4); barrel(16.2, -1.0, tBlue); barrel(15.9, -2.1, tRust, 0.4); barrel(-15.0, 9.4, tBlue, 1.2, true); barrel(-27.5, 4.5); barrel(11.4, -1.6, tBlue);
  const tire = (x, y, z, rx = Math.PI / 2) => { const t = L.mesh(new THREE.TorusGeometry(0.34, 0.13, 5, 10), lam(L.rep(tTire, 4, 1), 0xffffff), x, y, z, scene); t.rotation.x = rx; return t; };
  tire(-14.8, 0.13, 10.5); tire(-14.8, 0.39, 10.5); tire(-14.7, 0.65, 10.45); tire(-13.9, 0.34, 11.4, 0.2); blob(-14.8, 10.6, 0.8);
  { const wb = new THREE.Group(); wb.position.set(-12.2, 0, 11.8); wb.rotation.y = 2.4; scene.add(wb); const m = lam(null, 0x2a5a3a); const tray = B(0.6, 0.25, 0.9, m, 0, 0.55, 0, wb); tray.rotation.x = 0.12; B(0.05, 0.05, 1.5, lam(tWood), 0.25, 0.48, -0.5, wb).rotation.x = 0.25; B(0.05, 0.05, 1.5, lam(tWood), -0.25, 0.48, -0.5, wb).rotation.x = 0.25; const w = cyl(0.2, 0.2, 0.08, 8, lam(tTire), 0, 0.2, 0.55, wb); w.rotation.z = Math.PI / 2; B(0.6, 0.15, 0.7, lam(tHay), 0, 0.72, 0, wb); blob(-12.2, 11.8, 0.8); }
  const crate = (x, y, z, ry = 0, s = 0.6) => { const c = B(s, s * 0.75, s, lam(tCrate), x, y + s * 0.375, z); c.rotation.y = ry; };
  crate(-14.6, 0, 1.2, 0.2); crate(-14.6, 0.45, 1.25, -0.1, 0.55); crate(-15.3, 0, 0.6, 0.5); crate(14.6, 0, -4.2, 0.1, 0.5); crate(-27.2, 0, 6.4, 0.3); blob(-14.8, 1, 1.1);
  { const mT = lam(null, 0x6a5038), mM = lam(null, 0x8a9098); const shovel = new THREE.Group(); shovel.position.set(-13.9, 0, -9.2); shovel.rotation.z = -0.25; scene.add(shovel); B(0.04, 1.3, 0.04, mT, 0, 0.75, 0, shovel); B(0.22, 0.28, 0.02, mM, 0, 0.1, 0, shovel);
    const fork = new THREE.Group(); fork.position.set(-13.9, 0, -8.6); fork.rotation.z = -0.2; scene.add(fork); B(0.04, 1.4, 0.04, mT, 0, 0.8, 0, fork); for (let k = -1; k <= 1; k++) B(0.015, 0.3, 0.015, mM, k * 0.06, 0.05, 0, fork); B(0.16, 0.02, 0.02, mM, 0, 0.2, 0, fork); }
  { const pts = []; for (let i = 0; i < 40; i++) { const a = i * 0.55, r = 0.25 + i * 0.004; pts.push(V(10.0 + Math.cos(a) * r, 0.06 + i * 0.002, 8.6 + Math.sin(a) * r)); } for (let i = 0; i <= 12; i++) pts.push(V(10.2 - i * 0.6, 0.03, 8.9 + Math.sin(i * 0.8) * 0.3 - i * 0.35));
    const curve = new THREE.CatmullRomCurve3(pts); L.mesh(new THREE.TubeGeometry(curve, 90, 0.022, 4), lam(null, 0x2a7a3a), 0, 0, 0, scene); }
  // old tractor (code): north side of the barn
  { const tr = new THREE.Group(); tr.position.set(-11.0, 0, -13.5); tr.rotation.y = -0.6; scene.add(tr); const mR = lam(tRust, 0xd03a2a), mK = lam(null, 0x2a2a2a), mG = lam(null, 0x8a8a8a);
    B(0.8, 0.7, 2.0, mR, 0, 1.0, 0.4, tr); B(0.7, 0.5, 0.8, mR, 0, 1.35, -0.7, tr); B(0.9, 0.08, 0.9, mK, 0, 1.0, -0.75, tr); cyl(0.05, 0.05, 0.8, 5, mK, 0.2, 1.7, 1.0, tr); B(0.5, 0.45, 0.05, mG, 0, 1.0, 1.42, tr);
    for (const s of [-1, 1]) { const rw = cyl(0.72, 0.72, 0.4, 10, lam(L.rep(tTire, 6, 1)), s * 0.75, 0.72, -0.7, tr); rw.rotation.z = Math.PI / 2; const hub = cyl(0.3, 0.3, 0.42, 8, mR, s * 0.75, 0.72, -0.7, tr); hub.rotation.z = Math.PI / 2;
      const fw = cyl(0.36, 0.36, 0.22, 8, lam(L.rep(tTire, 3, 1)), s * 0.5, 0.36, 1.1, tr); fw.rotation.z = Math.PI / 2; } blob(-11.0, -13.5, 2.2); }
  // ---------- sky: clouds on the dome textures, moon, night spill ----------
  const clouds = (col) => tex(128, 64, (c) => { c.clearRect(0, 0, 128, 64); const r = L.rng(70); for (let k = 0; k < 16; k++) { const x = r() * 128, y = 18 + r() * 22, w = 14 + r() * 24; for (let j = 0; j < 6; j++) { c.fillStyle = col[j % 2]; c.beginPath(); c.ellipse(x + (r() - 0.5) * w, y + (r() - 0.5) * 4, w * (0.3 + r() * 0.3), 3 + r() * 3, 0, 0, Math.PI * 2); c.fill(); } } });
  const CL = { dawn: clouds(['#f8c8a0', '#e8a888']), day: clouds(['#f4f8fc', '#d8e4ee']), noon: clouds(['#ffffff', '#e8eef4']), dusk: clouds(['#d87a6a', '#a05a6a']), sunset: clouds(['#ffc890', '#e8907a']), night: clouds(['#1e2a46', '#18223c']) };
  const cloudDome = L.mesh(new THREE.SphereGeometry(390, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), basic(CL.day, 0xffffff, { side: THREE.BackSide, transparent: true, fog: false, depthWrite: false }), 0, -30, 0, scene); cloudDome.material.map.wrapS = THREE.RepeatWrapping; cloudDome.material.map.repeat.set(3, 1);
  const moonT = tex(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.fillStyle = '#e8ecf8'; c.beginPath(); c.arc(8, 8, 7, 0, 7); c.fill(); px(c, 5, 5, '#c8ccd8', 2, 2); px(c, 9, 9, '#c8ccd8', 3, 2); });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonT, fog: false, depthWrite: false })); moon.scale.set(16, 16, 1); moon.position.set(-160, 120, -250); scene.add(moon);
  const spillT = tex(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const spills = []; for (const [x, z, s] of [[0.9, 6.6, 3.2], [-3.3, 5.4, 2.2], [2.4, 5.4, 2.2], [6.2, 2, 2.4], [-6.2, -2, 2.4]]) { const p = L.plane(s, s, basic(spillT, 0xffffff, { transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -32 }), x, 0.06, z, scene, 0, -Math.PI / 2); p.renderOrder = 2; spills.push(p); }
  const porchL = new THREE.PointLight(0xffc880, 0, 9, 1.5); porchL.position.set(0.9, 2.3, 4.6); scene.add(porchL);
  function setTod(k) { const n = k === 'night'; cloudDome.material.map = CL[k]; cloudDome.material.needsUpdate = true; moon.visible = n || k === 'dusk'; spills.forEach((s) => s.visible = n); porchL.intensity = n ? 6 : 0; porchLamp.material.color.set(n ? 0xfff0b0 : 0x8a7a50); }
  return { setTod, tree };
}

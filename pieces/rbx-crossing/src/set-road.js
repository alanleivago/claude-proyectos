// rbx-crossing ROAD set: a small town cut in two by an endless 6-lane highway along x (asphalt z -12..12), driverless cars
// that never brake, curbs + sidewalks (z +-12..+-16), our side (+z): houses; their side (-z): the school (door at x=0, z=-30).
// The crosswalk is at x=0. mood('fall') = clear autumn day; mood('snow') = first snow (white ground, falling flakes, grey-blue).
// cars(t, o) places the traffic for time t (o.stop = cars brake at the crossing, o.gap = keep x in (-g, g) clear).
'use strict';
SETS.road = async function (ctx) {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, { rng } = RBX;
  const scene = new T.Scene(), r = rng(808), add = (m) => { scene.add(m); return m; };
  const box = (w, h, d, m, x, y, z) => { const g = new T.BoxGeometry(w, h, d); KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; return add(me); };
  const SM = (c, ro = 0.6, me = 0) => new T.MeshStandardMaterial({ color: c, roughness: ro, metalness: me });
  const X0 = -500, X1 = 500, LEN = X1 - X0;
  // ground: grass (fall) / snow, road, curbs, sidewalks
  const grass = ENV.mt(ENV.T.grass(), 5), snowM = new T.MeshStandardMaterial({ color: '#e2eaf6', roughness: 0.7 }); snowM.normalMap = ENV.T.sand().normalMap.clone(); snowM.normalMap.repeat.set(1 / 3, 1 / 3); snowM.normalScale.set(0.7, 0.7);
  const ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), grass); ground.rotation.x = -PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; add(ground);
  const road = box(LEN, 0.1, 24, ENV.mt(ENV.T.asphalt(), 6), 0, 0.0, 0);
  const walkM = new T.MeshStandardMaterial({ color: '#cfcbc4', roughness: 0.85 }), curbM = SM('#b0aca4', 0.8);
  [-1, 1].forEach((s) => { box(LEN, 0.3, 4, walkM, 0, 0.15, s * 14); box(LEN, 0.35, 0.4, curbM, 0, 0.17, s * 12.1); box(LEN, 0.02, 0.25, SM('#f2c94c', 0.5), 0, 0.06, s * 11.6); });
  const dash = SM('#f2f0e8', 0.6); for (let x = X0; x < X1; x += 8) [-4, 4].forEach((z) => box(4, 0.02, 0.22, dash, x, 0.06, z)); box(LEN, 0.02, 0.3, SM('#f2c94c', 0.5), 0, 0.06, 0);
  for (let k = -5; k <= 5; k++) box(1.2, 0.03, 23, SM('#f4f2ea', 0.6), k * 2.2, 0.07, 0);   // crosswalk stripes (x -11..11)
  // snow layer on top of everything flat (visible in snow mood)
  const snowG = new T.Group(); add(snowG);
  const sb = (w, d, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.12, d), snowM); m.position.set(x, y, z); m.receiveShadow = true; snowG.add(m); };
  [-1, 1].forEach((s) => { sb(LEN, 4, 0, 0.36, s * 14); sb(LEN, 0.5, 0, 0.4, s * 12.1); }); [-1, 1].forEach((s) => sb(LEN, 2.2, 0, 0.1, s * 10.6));   // slush along the curbs
  // our side (+z): houses facing the road; their side (-z): the school
  const houses = new T.Group(); add(houses);
  for (let x = -220; x <= 220; x += 18) { if (Math.abs(x) < 10) continue; const h = ENV.house({ seed: (x + 300) * 7 }); h.position.set(x, 0, 27); h.rotation.y = PI; houses.add(h); }
  for (let x = -220; x <= 220; x += 22) { if (Math.abs(x) < 26) continue; const h = ENV.house({ seed: (x + 900) * 3 }); h.position.set(x, 0, -27); houses.add(h); }
  // the school (their side, door facing the road at x=0)
  const brick = (() => { const t = KIT.bricks(512, 61, { color: '#a0442e', mortar: '#d8d0c4' }); const m = new T.MeshStandardMaterial({ map: RBX.tex(t.c), roughness: 0.85 }); m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(1 / 6, 1 / 6); return m; })();
  box(44, 16, 16, brick, 0, 8, -38); box(46, 1, 18, SM('#f4f0e6', 0.5), 0, 16.5, -38);
  const glass = new T.MeshPhysicalMaterial({ color: '#2a3a4a', roughness: 0.08, clearcoat: 1, emissive: new T.Color('#ffd890'), emissiveIntensity: 0.25 });
  for (let x = -18; x <= 18; x += 6) { if (Math.abs(x) < 4) continue; [5, 11.5].forEach((y) => { box(3.4, 3.2, 0.2, glass, x, y, -29.9); box(3.8, 0.3, 0.4, SM('#f4f0e6'), x, y - 1.75, -29.8); }); }
  box(5.6, 7.4, 0.3, SM('#f4f0e6'), 0, 3.7, -29.95); const door = box(4.6, 6.6, 0.3, SM('#2F6FD1', 0.4), 0, 3.3, -29.75);
  const sign = KIT.textTex(1024, 200, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a2a4a'; g.font = '900 120px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('SCHOOL', w / 2, 150); });
  const sp = new T.Mesh(new T.PlaneGeometry(16, 3.1), new T.MeshStandardMaterial({ map: sign, roughness: 0.6 })); sp.position.set(0, 13.6, -29.88); add(sp);
  const flag = box(0.3, 14, 0.3, SM('#c8c8cc', 0.3, 0.8), 14, 7, -26); box(4, 2.4, 0.06, SM('#d23a2a', 0.7), 16, 12.6, -26);
  // trees (fall colours; white in snow), lamps, a bus stop
  const leafM = new T.MeshStandardMaterial({ color: '#e07a24', roughness: 0.9, flatShading: true }), trees = new T.Group(); add(trees);
  for (let x = -200; x <= 200; x += 14) [-1, 1].forEach((s) => { if (Math.abs(x + 5) < 16) return; const t = ENV.tree({ seed: (x + 500) * (s + 3) }); t.traverse((m) => { if (m.isMesh && m.material.flatShading) m.material = leafM; }); t.position.set(x + 5, 0, s * (19 + r() * 3)); trees.add(t); });
  // falling snow (Points, moved per frame by snowAt)
  const NF = 9000, fp = new Float32Array(NF * 3); for (let i = 0; i < NF; i++) fp.set([(r() - 0.5) * 140, r() * 50, (r() - 0.5) * 140], i * 3);
  const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fp.slice(), 3));
  const fc = RBX.cnv(32, 32), fx = fc.getContext('2d'), gr = fx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); fx.fillStyle = gr; fx.fillRect(0, 0, 32, 32);
  const flakes = new T.Points(fg, new T.PointsMaterial({ size: 0.42, map: RBX.tex(fc), transparent: true, depthWrite: false, color: '#ffffff' })); add(flakes);
  const snowAt = (t, c = [0, 0, 0]) => { const a = fg.attributes.position.array; for (let i = 0; i < NF; i++) { a[i * 3] = c[0] + fp[i * 3] + Math.sin(t * 0.7 + i) * 0.6; a[i * 3 + 1] = ((fp[i * 3 + 1] - t * 2.2) % 50 + 50) % 50; a[i * 3 + 2] = c[2] + fp[i * 3 + 2]; } fg.attributes.position.needsUpdate = true; };
  // driverless cars: chunky Roblox sedans/vans, empty glass cabins (you can see nobody is inside), headlights
  const CC = ['#d23a2a', '#2F6FD1', '#f2c94c', '#2E9A3A', '#f4f2ee', '#1a1a1e', '#9a2ad8', '#FF8A1E', '#7fd0c8', '#c0c4cc'];
  const mkCar = (c, van) => { const g = new T.Group(), body = new T.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 0.8, metalness: 0.2 }), dk = SM('#141414', 0.8), gl = new T.MeshPhysicalMaterial({ color: '#cfe4f4', roughness: 0.05, transparent: true, opacity: 0.35 });
    const L = van ? 9 : 8, H = van ? 3.6 : 2.0; const b = new T.Mesh(RBX.rbox(L, H, 3.6, 0.4, 4), body); b.position.y = 0.6 + H / 2; g.add(b);
    if (!van) { const cab = new T.Mesh(RBX.rbox(4.2, 1.7, 3.3, 0.3, 4), gl); cab.position.set(-0.3, 2.6 + 0.85, 0); g.add(cab); const seat = new T.Mesh(new T.BoxGeometry(1.0, 1.3, 1.2), SM('#3a3a40')); seat.position.set(0.2, 2.9, 0.8); g.add(seat); const wheel = new T.Mesh(new T.TorusGeometry(0.35, 0.07, 6, 14), dk); wheel.position.set(0.9, 3.0, 0.8); wheel.rotation.y = PI / 2; g.add(wheel); }
    else { const w = new T.Mesh(new T.BoxGeometry(0.1, 1.2, 3.0), gl); w.position.set(L / 2 + 0.01, 3.1, 0); g.add(w); }
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, s]) => { const wh = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.6, 16), dk); wh.rotation.x = PI / 2; wh.position.set(a * (L / 2 - 1.5), 0.75, s * 1.6); g.add(wh); });
    const hl = new T.MeshBasicMaterial({ color: new T.Color(3, 2.8, 2.2), toneMapped: false }); [-1, 1].forEach((s) => { const h = new T.Mesh(new T.BoxGeometry(0.1, 0.4, 0.7), hl); h.position.set(L / 2 + 0.02, 1.4, s * 1.1); g.add(h); const tl = new T.Mesh(new T.BoxGeometry(0.1, 0.4, 0.7), new T.MeshBasicMaterial({ color: new T.Color(3, 0.2, 0.15), toneMapped: false })); tl.position.set(-L / 2 - 0.02, 1.4, s * 1.1); g.add(tl); });
    g.traverse((m) => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } }); return g; };
  const LANES = [[-10, 1], [-6, 1], [-2, 1], [2, -1], [6, -1], [10, -1]], cars = [];
  LANES.forEach(([z, dir], li) => { for (let k = 0; k < 9; k++) { const c = mkCar(CC[(li * 3 + k) % CC.length], (li + k) % 5 === 0); c.userData = { z, dir, x0: k * 110 + r() * 60, v: 34 + li * 3 + r() * 6 }; add(c); cars.push(c); } });
  const carsAt = (t, o = {}) => cars.forEach((c) => { const u = c.userData, span = 1000; let x = ((u.x0 + u.dir * u.v * t) % span + span) % span - span / 2;
    if (o.gap && Math.abs(x) < o.gap) x = x < 0 ? -o.gap - (o.gap - Math.abs(x)) * 0.0 : o.gap; if (o.stop) { const front = u.dir > 0 ? (x > -16 && x < 0) : (x < 16 && x > 0); if (front) x = u.dir > 0 ? Math.min(x, -16) : Math.max(x, 16); }
    c.position.set(x, 0, u.z); c.rotation.y = u.dir > 0 ? 0 : PI; c.visible = !o.none; });
  // ================= set dressing (v2: richer world) =================
  const dress = new T.Group(); add(dress); const D = (m) => { dress.add(m); return m; };
  const DB = (w, h, d, m, x, y, z) => { const g = new T.BoxGeometry(w, h, d); KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; return D(me); };
  const roofs = [], snowable = [];   // meshes that turn white in the snow
  houses.traverse((m) => { if (m.isMesh && Math.abs(m.rotation.x) > 0.2) roofs.push([m, m.material]); });
  // rolling hills + pine forest on the horizon (both sides)
  const hillM = new T.MeshStandardMaterial({ color: '#7a9a4a', roughness: 1, flatShading: true }), pineM = new T.MeshStandardMaterial({ color: '#2e5a34', roughness: 0.9, flatShading: true });
  for (let i = 0; i < 26; i++) { const a = (i / 26) * PI * 2, d = 330 + r() * 160, hl = new T.Mesh(new T.IcosahedronGeometry(90 + r() * 70, 2), hillM); hl.scale.y = 0.32 + r() * 0.2; hl.position.set(Math.cos(a) * d, -14, Math.sin(a) * d); D(hl); }
  { const N = 900, cone = new T.ConeGeometry(3.4, 11, 7).translate(0, 5.5, 0), im = new T.InstancedMesh(cone, pineM, N), m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3();
    for (let i = 0; i < N; i++) { const a = r() * PI * 2, d = 120 + r() * 260; if (Math.abs(Math.sin(a) * d) < 60) { i--; continue; } sc.setScalar(0.8 + r() * 1.2); m4.compose(V(Math.cos(a) * d, 0, Math.sin(a) * d), q, sc); im.setMatrixAt(i, m4); } im.castShadow = true; D(im); }
  // power poles + wires along our side, lamp posts both sides (warm heads, lit in the snow)
  const poles = []; for (let x = -240; x <= 240; x += 30) { const p = ENV.pole(); p.position.set(x, 0, 17.5); D(p); poles.push(x); }
  for (let i = 0; i + 1 < poles.length; i++) [-1.6, 0, 1.6].forEach((dz) => D(ENV.wire(V(poles[i], 13.2, 17.5 + dz), V(poles[i + 1], 13.2, 17.5 + dz), 1.1)));
  const lampHead = new T.MeshStandardMaterial({ color: '#fff0c8', emissive: new T.Color('#ffb860'), emissiveIntensity: 0.2 }), iron = SM('#2a2a2e', 0.5, 0.6), lampLights = [];
  for (let x = -195; x <= 205; x += 26) [-1, 1].forEach((s) => { const px = x + (s > 0 ? 13 : 0); const p = new T.Mesh(new T.CylinderGeometry(0.16, 0.22, 9, 8), iron); p.position.set(px, 4.5, s * 12.9); D(p); DB(0.18, 0.18, 2.2, iron, px, 9, s * 11.9); DB(0.7, 0.3, 1.2, lampHead, px, 8.8, s * 10.9);
    if (Math.abs(px) < 60) { const L = new T.PointLight('#ffc070', 0, 22, 2); L.position.set(px, 8.2, s * 10.9); D(L); lampLights.push(L); } });
  // school-crossing signs + the warning sign
  const signTex = (draw, w = 256, h = 256) => KIT.textTex(w, h, draw);
  const kidSign = signTex((g, w, h) => { g.fillStyle = '#f2e600'; g.beginPath(); g.moveTo(128, 6); g.lineTo(250, 110); g.lineTo(250, 250); g.lineTo(6, 250); g.lineTo(6, 110); g.closePath(); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 10; g.stroke();
    g.fillStyle = '#111'; [[96, 150], [160, 150]].forEach(([x, y], i) => { g.beginPath(); g.arc(x, y - 44, 13, 0, 7); g.fill(); g.fillRect(x - 12, y - 30, 24, 50); g.fillRect(x - 12 + (i ? 6 : -6), y + 20, 10, 40); g.fillRect(x + (i ? -6 : 2), y + 20, 10, 40); }); g.fillRect(104, 128, 50, 9); });
  const warnSign = signTex((g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d01818'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); g.fillStyle = '#111'; g.textAlign = 'center'; g.font = '900 54px "Arial Black"'; g.fillText('CARS', 128, 82); g.fillText('NEVER', 128, 142); g.fillText('STOP', 128, 202); g.fillStyle = '#d01818'; g.font = '700 22px Arial'; g.fillText('CROSS WITH MISS DOT', 128, 238); }, 256, 256);
  const postSign = (tex, x, z, ry, y = 6.2, s = 2.2) => { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; D(g); const p = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, y, 8), SM('#9a9aa0', 0.4, 0.8)); p.position.y = y / 2; g.add(p);
    const f = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshStandardMaterial({ map: tex, roughness: 0.5, side: T.DoubleSide, transparent: true, alphaTest: 0.5 })); f.position.set(0, y + s / 2 - 0.3, 0.12); g.add(f); return g; };
  postSign(kidSign, 13.5, 13.0, PI, 5.6); postSign(kidSign, -13.5, -13.0, 0, 5.6); postSign(warnSign, -16, 13.2, PI, 6.4, 2.6); postSign(warnSign, 18, -13.2, 0, 6.4, 2.6);
  // Miss Dot's booth on our side: orange hut, window, a chair, a thermos, sign
  { const g = new T.Group(); g.position.set(17.5, 0.3, 15.8); g.rotation.y = PI; D(g); const om = SM('#ff6a1a', 0.5), wm = SM('#f4f0e6', 0.5);
    const b = (w, h, d, m, x, y, z) => { const me = new T.Mesh(RBX.rbox(w, h, d, 0.08, 3), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
    b(4, 5.2, 3.4, om, 0, 2.6, 0); b(4.6, 0.4, 4, wm, 0, 5.4, 0); b(2.6, 1.6, 0.1, new T.MeshPhysicalMaterial({ color: '#2a3a4a', roughness: 0.05, clearcoat: 1, emissive: new T.Color('#ffd890'), emissiveIntensity: 0.3 }), 0, 3.4, 1.72);
    const st = KIT.textTex(512, 96, (q, w, h) => { q.fillStyle = '#f4f0e6'; q.fillRect(0, 0, w, h); q.fillStyle = '#d01818'; q.font = '900 50px "Arial Black"'; q.textAlign = 'center'; q.fillText('CROSSING GUARD', w / 2, 66); });
    const sp = new T.Mesh(new T.PlaneGeometry(4.2, 0.8), new T.MeshStandardMaterial({ map: st })); sp.position.set(0, 4.75, 1.73); g.add(sp);
    b(1.2, 0.2, 1.2, SM('#3a6ab0', 0.5), 2.8, 1.5, 1.2); b(0.2, 1.5, 0.2, SM('#3a6ab0'), 2.4, 0.75, 0.8); const th = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.8, 12), SM('#d01818', 0.3, 0.4)); th.position.set(3.2, 2.0, 1.2); g.add(th); }
  // front yards on our side: picket fences, mailboxes, round bushes, driveways; their side: hedges
  const picket = SM('#f6f4ee', 0.6), bushM = new T.MeshStandardMaterial({ color: '#3e7a32', roughness: 0.9, flatShading: true }); snowable.push(bushM);
  for (let x = -220; x <= 220; x += 18) { if (Math.abs(x) < 10) continue;
    for (let k = -3; k <= 3; k++) { if (k === 0) continue; DB(0.15, 1.3, 0.12, picket, x + k * 1.2, 0.95, 20.5); } DB(8, 0.14, 0.1, picket, x, 1.2, 20.5); DB(8, 0.14, 0.1, picket, x, 0.6, 20.5);
    const mb = new T.Group(); mb.position.set(x + 4.6, 0.3, 17.0); D(mb); const mp = new T.Mesh(new T.BoxGeometry(0.18, 1.3, 0.18), ENV.mt(ENV.T.wood(), 1)); mp.position.y = 0.65; mb.add(mp); const mbx = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 0.9, 12, 1, false, 0, PI), SM(['#2a4aa0', '#c03030', '#2a2a2a'][(x / 18 + 20) % 3 | 0], 0.4, 0.3)); mbx.rotation.x = PI / 2; mbx.rotation.z = PI / 2; mbx.position.y = 1.4; mb.add(mbx);
    [-2.6, 2.6].forEach((dx) => { const bu = new T.Mesh(new T.IcosahedronGeometry(1.1 + r() * 0.5, 1), bushM); bu.position.set(x + dx, 0.9, 22.3); bu.castShadow = true; D(bu); });
    DB(4.4, 0.06, 5, SM('#9a968e', 0.8), x - 5.6, 0.04, 22.5); }
  for (let x = -220; x <= 220; x += 4.2) { if (Math.abs(x) < 26) continue; const hd = new T.Mesh(new T.BoxGeometry(4, 1.6, 1.4), bushM); hd.position.set(x, 0.8, -19.5); hd.castShadow = true; D(hd); }
  // fallen leaves on grass + sidewalk (fall only)
  const leaves = new T.Group(); add(leaves);
  { const N = 2600, g = new T.CircleGeometry(0.22, 5).rotateX(-PI / 2), cols = ['#e07a24', '#c84a1a', '#e8b030', '#a8541c'];
    cols.forEach((c, ci) => { const im = new T.InstancedMesh(g, SM(c, 0.9), N / 4), m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(1, 1, 1);
      for (let i = 0; i < N / 4; i++) { const x = (r() - 0.5) * 160, s = r() < 0.5 ? 1 : -1, z = s * (12.5 + r() * 14); q.setFromAxisAngle(V(0, 1, 0), r() * 6); m4.compose(V(x, (Math.abs(z) < 16 ? 0.31 : 0.02) + ci * 0.002, z), q, sc); im.setMatrixAt(i, m4); } im.receiveShadow = true; leaves.add(im); });
    [[-24, 21.5], [9, 23], [30, -21.5], [-40, 22.5]].forEach(([x, z]) => { for (let i = 0; i < 26; i++) { const l = new T.Mesh(new T.IcosahedronGeometry(0.5, 0), SM(cols[i % 4], 0.9)); l.scale.y = 0.4; l.position.set(x + (r() - 0.5) * 2.4, 0.2 + r() * 0.5, z + (r() - 0.5) * 1.8); leaves.add(l); } }); }
  // road wear: patches, manholes, skid-free (cars never brake)
  for (let i = 0; i < 40; i++) DB(2 + r() * 4, 0.02, 1 + r() * 2, SM('#3a3c42', 0.9), (r() - 0.5) * 300, 0.055, (r() - 0.5) * 20);
  [[-30, 5], [22, -6], [70, 2]].forEach(([x, z]) => { const mh = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.04, 20), SM('#2a2a2c', 0.5, 0.6)); mh.position.set(x, 0.07, z); D(mh); });
  // the school gets a gabled roof, a clock, steps, columns, a bike rack, a bus and a playground
  { const rm = ENV.mt(ENV.T.shingle('#3a3e4a'), 2.5); [-1, 1].forEach((s) => { const p = DB(48, 0.5, 10.4, rm, 0, 20.2, -38 + s * 4.3); p.rotation.x = s * 0.62; roofs.push([p, rm]); });
    const gab = new T.Shape(); gab.moveTo(-9, 0); gab.lineTo(9, 0); gab.lineTo(0, 6.4); gab.closePath(); const gg = new T.ExtrudeGeometry(gab, { depth: 0.6, bevelEnabled: false }); const gm = new T.Mesh(gg, SM('#f4f0e6', 0.5)); gm.position.set(0, 16.8, -30.6); D(gm);
    const ct = KIT.textTex(256, 256, (q, w, h) => { q.fillStyle = '#fbf8f0'; q.beginPath(); q.arc(128, 128, 120, 0, 7); q.fill(); q.strokeStyle = '#1a1a1a'; q.lineWidth = 10; q.stroke(); for (let k = 0; k < 12; k++) { const a = k * PI / 6; q.fillStyle = '#1a1a1a'; q.fillRect(128 + Math.cos(a) * 96 - 4, 128 + Math.sin(a) * 96 - 4, 8, 8); } q.lineWidth = 9; q.beginPath(); q.moveTo(128, 128); q.lineTo(128, 52); q.moveTo(128, 128); q.lineTo(180, 140); q.stroke(); });
    const cl = new T.Mesh(new T.CircleGeometry(1.8, 32), new T.MeshStandardMaterial({ map: ct, roughness: 0.5 })); cl.position.set(0, 19.6, -29.95); D(cl);
    for (let k = 0; k < 3; k++) DB(9 - k * 0.8, 0.4, 1.2, SM('#c8c4bc', 0.8), 0, 0.2 + k * 0.4, -28.5 - k * 0.6); [-3.6, 3.6].forEach((x) => { const c = new T.Mesh(new T.CylinderGeometry(0.4, 0.45, 8, 14), SM('#f4f0e6', 0.5)); c.position.set(x, 4, -28.6); c.castShadow = true; D(c); });
    for (let k = 0; k < 6; k++) { const hp = new T.Mesh(new T.TorusGeometry(0.6, 0.06, 6, 16, PI), SM('#c8c8cc', 0.3, 0.8)); hp.position.set(8 + k * 0.9, 0.3, -24); hp.rotation.y = PI / 2; D(hp); }
    const bus = new T.Group(); bus.position.set(-17, 0.3, -23); D(bus); const by = SM('#f2b80c', 0.4); const bb = new T.Mesh(RBX.rbox(14, 4.6, 4, 0.4, 4), by); bb.position.y = 2.9; bus.add(bb);
    for (let k = 0; k < 6; k++) { const w = new T.Mesh(new T.BoxGeometry(1.6, 1.3, 0.1), new T.MeshPhysicalMaterial({ color: '#2a3a4a', roughness: 0.05, clearcoat: 1 })); w.position.set(-5 + k * 2.1, 3.6, 2.02); bus.add(w); } const bst = new T.Mesh(new T.BoxGeometry(14.1, 0.25, 4.05), SM('#111')); bst.position.y = 2.2; bus.add(bst);
    [[-4.5, 1], [-4.5, -1], [4.5, 1], [4.5, -1]].forEach(([x, s]) => { const wh = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.6, 16), SM('#141414', 0.8)); wh.rotation.x = PI / 2; wh.position.set(x, 0.9, s * 1.8); bus.add(wh); }); bus.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    const pg = new T.Group(); pg.position.set(32, 0, -24); D(pg); const red = SM('#d23a2a', 0.4, 0.4); [-2.5, 2.5].forEach((x) => [-1, 1].forEach((s) => { const l = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 6.6, 8), red); l.position.set(x + s * 0.9, 3, 0); l.rotation.z = s * 0.28; pg.add(l); }));
    const top = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 5.4, 8), red); top.rotation.z = PI / 2; top.position.y = 6.3; pg.add(top); [-1.2, 1.2].forEach((x) => { [-0.3, 0.3].forEach((dz) => { const ch = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 4.4, 4), SM('#888', 0.3, 0.9)); ch.position.set(x, 4.1, dz); pg.add(ch); }); const st = new T.Mesh(new T.BoxGeometry(1.0, 0.12, 0.8), SM('#2a2a2a')); st.position.set(x, 1.9, 0); pg.add(st); }); }
  // sky clouds, varied tree colours, SCHOOL painted on the asphalt before the crossing, manhole steam (snow)
  const clouds = ENV.clouds(scene, 18, { s: 16, a0: -PI, a1: 2 * PI, d: 520, y: 150 });
  const leafCols = ['#e07a24', '#d23a1a', '#e8b030', '#c86a2a', '#b8402a'], treeMats = leafCols.map((c) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }));
  let ti = 0; trees.traverse((m) => { if (m.isMesh && m.material === leafM) { m.material = treeMats[(ti++ >> 2) % treeMats.length]; } });
  const roadTxt = KIT.textTex(512, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(244,242,234,0.92)'; g.font = '900 130px "Arial Black"'; g.textAlign = 'center'; g.fillText('SCHOOL', w / 2, 132); });
  [[-1, 18], [1, -18]].forEach(([s2, x]) => { const p = new T.Mesh(new T.PlaneGeometry(9, 2.8), new T.MeshStandardMaterial({ map: roadTxt, transparent: true, roughness: 0.7 })); p.rotation.x = -PI / 2; p.rotation.z = s2 > 0 ? PI / 2 : -PI / 2; p.position.set(x, 0.065, s2 * 6); dress.add(p); });
  for (let k = 0; k < 8; k++) [-1, 1].forEach((s2) => DB(0.25, 0.03, 2.2, SM('#f4f2ea', 0.6), s2 * (14 + k * 3.2), 0.065, s2 * (k % 2 ? 9 : 3)));
  const steam = new T.Group(); add(steam); { const st = RBX.cnv(64, 64), q = st.getContext('2d'), gr2 = q.createRadialGradient(32, 32, 0, 32, 32, 32); gr2.addColorStop(0, 'rgba(255,255,255,0.55)'); gr2.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gr2; q.fillRect(0, 0, 64, 64); const tx = RBX.tex(st);
    [[-30, 5], [22, -6], [70, 2]].forEach(([x, z]) => { for (let i = 0; i < 6; i++) { const sp2 = new T.Sprite(new T.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, opacity: 0.5 - i * 0.06 })); sp2.position.set(x + Math.sin(i) * 0.5, 0.8 + i * 0.9, z); sp2.scale.setScalar(1.4 + i * 0.7); steam.add(sp2); } }); }
  // snow banks along both curbs (snow mood) + snow caps on the posts' feet
  const banks = new T.Group(); add(banks);
  for (let x = -120; x <= 120; x += 2.6) [-1, 1].forEach((s) => { if (Math.abs(x) < 12) return; const b = new T.Mesh(new T.IcosahedronGeometry(0.9 + r() * 0.6, 1), snowM); b.scale.set(1.4, 0.5 + r() * 0.3, 1); b.position.set(x, 0.35, s * (16.3 + r() * 0.6)); b.receiveShadow = true; banks.add(b); });
  // lights + sky + moods
  const hemi = add(new T.HemisphereLight('#bcd8ff', '#8a7a60', 1.4)); const sun = new T.DirectionalLight('#fff0d0', 5.5); sun.position.set(40, 60, 50); sun.target.position.set(0, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 260 }); scene.add(sun, sun.target);
  let dome = null, cur = null;
  const MOOD = { fall: { sky: { top: '#1a62d8', mid: '#5aa0f0', hor: '#f4e8d8', sun: [0.55, 0.3, 0.7], glow: 0.5 }, fog: ['#e8dcc8', 0.0018], hemi: ['#9ab8e8', '#6a5a40', 1.0], key: ['#ffd49a', 7.0], pos: [70, 34, 80], snow: false },
    snow: { sky: { top: '#3e4a68', mid: '#7e8eac', hor: '#c8d0e0', sun: [0.2, 0.4, 0.6], glow: 0.1, sunK: 0 }, fog: ['#b8c4d8', 0.0075], hemi: ['#c8d4ec', '#8a90a0', 1.5], key: ['#dfe8ff', 2.2], pos: [30, 60, 40], snow: true } };
  const mood = (k) => { if (cur === k) return; cur = k; const o = MOOD[k]; if (dome) scene.remove(dome); dome = ENV.sky(scene, ctx.renderer, o.sky); scene.fog = new T.FogExp2(o.fog[0], o.fog[1]);
    hemi.color.set(o.hemi[0]); hemi.groundColor.set(o.hemi[1]); hemi.intensity = o.hemi[2]; sun.color.set(o.key[0]); sun.intensity = o.key[1];
    ground.material = o.snow ? snowM : grass; snowG.visible = flakes.visible = o.snow; leafM.color.set(o.snow ? '#f2f6fc' : '#e07a24');
    sun.position.set(...o.pos); roofs.forEach(([m, mat]) => { m.material = o.snow ? snowM : mat; }); hillM.color.set(o.snow ? '#e8eef6' : '#7a9a4a'); pineM.color.set(o.snow ? '#7a9488' : '#2e5a34'); bushM.color.set(o.snow ? '#eef2f8' : '#3e7a32');
    leaves.visible = !o.snow; banks.visible = o.snow; steam.visible = o.snow; clouds.visible = !o.snow; treeMats.forEach((tm, i) => tm.color.set(o.snow ? '#f2f6fc' : leafCols[i])); lampHead.emissiveIntensity = o.snow ? 3 : 0.2; lampLights.forEach((L) => { L.intensity = o.snow ? 40 : 0; }); glass.emissiveIntensity = o.snow ? 1.2 : 0.25; };
  mood('fall');
  return { scene, grade: 'day', mood, carsAt, snowAt, door, cars, reset() { carsAt(0); } };
};

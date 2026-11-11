// rbx-checkpoint HOLE set: night after the Fair. The square fell into a giant sinkhole (radius R, depth D): jagged rock walls,
// the town crowd at the bottom with the leaning big flag, the broken plinth, the tilted cotton candy stand and fair debris,
// lanterns; at the rim: fire truck with flashing lights + searchlight, red ladders that only reach halfway, ropes, the lit
// Clock Tower and shopfronts. A climbing route of rocks + roots down the near wall (+z side). Hole centred at the origin.
'use strict';
SETS.hole = async function (ctx) {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rng, fbm } = RBX, r = rng(909);
  const R = 24, D = 34, scene = new T.Scene();
  scene.fog = new T.FogExp2('#1c1a48', 0.008);
  const sky = ENV.sky(scene, ctx.renderer, { top: '#04061e', mid: '#16144a', hor: '#3a2e80', sun: [-0.3, 0.45, -0.85], sunC: '#dfe4ff', sunK: 0.8, sunS: 0.9985, glow: 0.35 });
  const hemi = new T.HemisphereLight('#9a92e0', '#2a2440', 1.15); scene.add(hemi);
  const moon = new T.DirectionalLight('#9ab8ff', 5.0); moon.position.set(-30, 60, -60); moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.03;
  Object.assign(moon.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 }); moon.target.position.set(0, -20, 0); scene.add(moon, moon.target);
  const rimL = new T.DirectionalLight('#ffb070', 0.3); rimL.position.set(30, 20, 60); scene.add(rimL);
  // stars
  { const g = new T.BufferGeometry(), p = []; for (let i = 0; i < 1500; i++) { const a = r() * PI * 2, e = 0.12 + r() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 1800, Math.sin(e) * 1800, Math.sin(a) * Math.cos(e) * 1800); } g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); scene.add(new T.Points(g, new T.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false }))); }
  // ground with the hole cut out: ring (cobbles near the rim, asphalt/grass further)
  const ring = (r0, r1, m, y, tile) => { const g = new T.RingGeometry(r0, r1, 96, 4); g.rotateX(-PI / 2); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile);
    // jagged inner edge
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < r0 + 0.01) { const a = Math.atan2(z, x), k = 1 + 0.04 * Math.sin(a * 13) + 0.03 * Math.sin(a * 31 + 1); p.setX(i, x * k); p.setZ(i, z * k); } }
    const me = new T.Mesh(g, m); me.position.y = y; me.receiveShadow = true; scene.add(me); return me; };
  ring(R, 46, ENV.mt(ENV.T.cobble(), 1), 0.01, 1); ring(46, 600, ENV.mt(ENV.T.grass(), 5), 0, 5);
  // the hole wall: open cylinder seen from inside, noisy rock + dirt strata
  const wallM = ENV.mt(ENV.T.rock('#7a7480'), 6); wallM.side = T.BackSide; wallM.color = new T.Color('#b4b0c4');
  { const g = new T.CylinderGeometry(R * 1.04, R * 0.9, D, 96, 30, true); const p = g.attributes.position, n = fbm(17, 6, 4), uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), v = (y + D / 2) / D, k = 1 + 0.07 * (n(a / (2 * PI) + 0.5, v) - 0.5) * 2 + 0.03 * Math.sin(y * 1.3 + a * 5);
      p.setX(i, x * k); p.setZ(i, z * k); uv.setXY(i, (a / (2 * PI)) * 2 * PI * R / 6, y / 6); }
    g.computeVertexNormals(); const w = new T.Mesh(g, wallM); w.position.y = -D / 2 + 0.02; w.receiveShadow = true; scene.add(w); }
  // strata bands + cobble lip hanging over the edge
  for (let i = 0; i < 70; i++) { const a = (i / 70) * PI * 2, s = new T.Mesh(new T.BoxGeometry(2.4 + r() * 1.4, 0.6, 1.2), ENV.mt(ENV.T.cobble(), 1)); s.position.set(Math.cos(a) * (R - 0.2), -0.25 - r() * 0.4, Math.sin(a) * (R - 0.2)); s.rotation.set((r() - 0.5) * 0.5, -a, (r() - 0.5) * 0.4); s.castShadow = true; scene.add(s); }
  // bottom: dirt + rubble
  const bot = new T.Mesh(new T.CircleGeometry(R * 0.95, 64), ENV.mt(ENV.T.dirt(), 4)); bot.rotation.x = -PI / 2; bot.position.y = -D; bot.receiveShadow = true; scene.add(bot);
  for (let i = 0; i < 60; i++) { const a = r() * PI * 2, d = 4 + r() * (R * 0.85), sl = new T.Mesh(new T.BoxGeometry(1.2 + r() * 2.6, 0.4 + r() * 0.5, 1 + r() * 2), ENV.mt(ENV.T.cobble(), 2.2)); sl.position.set(Math.cos(a) * d, -D + 0.2, Math.sin(a) * d); sl.rotation.set((r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6); sl.castShadow = sl.receiveShadow = true; scene.add(sl); }
  // the broken plinth + the leaning big flag (pad still glowing), cotton candy stand tilted, a stall roof, a bench
  const pl = new T.Group(); TK.box(pl, 7, 1.0, 7, ENV.mt(ENV.T.stone(), 2), 0, 0.5, 0); const pad = CP.pad({ s: 1.5 }); pad.position.y = 1.0; pl.add(pad); pl.position.set(-2, -D + 0.1, -4); pl.rotation.set(0.08, 0.4, -0.1); ENV.shadow(pl); scene.add(pl);
  const big = CP.flag({ c: CP.COL.town, emblem: 'star', h: 24, w: 9, pole: 0.22, pad: false, amp: 0.05, ph: 2 }); big.position.set(-12, -D + 0.9, 1); big.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(V(0, 0.08, 1).normalize(), V(1, 0.03, 0).normalize(), V(0, 1, -0.08).normalize())); scene.add(big);
  const candy = TK.candy(); candy.position.set(9, -D + 0.3, 2); candy.rotation.set(0.15, -0.9, 0.3); scene.add(candy);
  const stall = TK.stall('#1f8ad8', 'HOOK A DUCK'); stall.position.set(-12, -D + 0.6, 6); stall.rotation.set(-0.2, 0.7, -0.35); scene.add(stall);
  // lanterns + warm glow at the bottom (people brought lights down)
  [[-14, 4], [-16, -6], [4, -14], [14, -8], [-2, -16]].forEach(([x, z], i) => { const l = TK.lamp(true); l.position.set(x, -D, z); l.rotation.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3); scene.add(l); });
  const glow = new T.PointLight('#ffb070', 110, 45, 1.5); const blueF = new T.PointLight('#b0a8ff', 45, 80, 1.2); blueF.position.set(0, -12, 0); scene.add(blueF); glow.position.set(0, -D + 8, 0); scene.add(glow);
  // rim: fire truck (flashing red/blue, searchlight into the hole), ladders that stop halfway, ropes on stakes
  const truck = new T.Group(); { const red = new T.MeshPhysicalMaterial({ color: '#c81e1e', roughness: 0.35, clearcoat: 1 }), chrome = new T.MeshStandardMaterial({ color: '#d8dce4', metalness: 1, roughness: 0.2 }), dark = TK.SM('#18181c', 0.8);
    TK.box(truck, 5, 4, 14, red, 0, 2.6, 0, false); TK.box(truck, 5, 2.4, 4, red, 0, 4.6, 5, false); TK.box(truck, 4.6, 1.6, 0.2, new T.MeshPhysicalMaterial({ color: '#1b2a3a', roughness: 0.05, clearcoat: 1 }), 0, 4.8, 7.05, false);
    [-4.5, 0, 4.5].forEach((z) => [-1, 1].forEach((s) => { const w = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 0.7, 20), dark); w.rotation.z = PI / 2; w.position.set(s * 2.6, 1.1, z); truck.add(w); }));
    TK.box(truck, 5.2, 0.3, 14.2, chrome, 0, 1.3, 0, false); [['#ff2020', -1.6], ['#2050ff', 1.6]].forEach(([c, x]) => { const b = new T.Mesh(new T.BoxGeometry(1.2, 0.4, 0.6), new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 6 })); b.position.set(x, 6.0, 5); truck.add(b); const L = new T.PointLight(c, 8, 18, 2); L.position.set(x * 2, 7, 5); truck.add(L); });
    const lad = CP.ladder(16, { c: '#d8dce4' }); lad.rotation.x = -1.25; lad.position.set(0, 4.8, -6); truck.add(lad);
    const sp = new T.SpotLight('#fff4d8', 900, 90, 0.35, 0.5, 1.5); sp.position.set(0, 7, 4); sp.target.position.set(-6, -D, -14); truck.add(sp); scene.add(sp.target); sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048);
    const lamp = new T.Mesh(new T.CylinderGeometry(0.5, 0.7, 0.8, 16), new T.MeshStandardMaterial({ color: '#fff', emissive: '#fff4d8', emissiveIntensity: 8 })); lamp.position.set(0, 7, 4.5); lamp.rotation.x = 1.2; truck.add(lamp); }
  ENV.shadow(truck); truck.position.set(-22, 0, 22); truck.rotation.y = 2.35; scene.add(truck);
  const ladders = []; [[-0.6, 15], [0.25, 17], [1.2, 14], [2.5, 16], [3.6, 15], [4.6, 18]].forEach(([a, len]) => { const l = CP.ladder(len, { red: true }); l.position.set(Math.cos(a) * (R + 0.6), -len + 1.4, Math.sin(a) * (R + 0.6)); l.lookAt(0, l.position.y, 0); l.rotateX(-0.12); scene.add(l); ladders.push(l); });
  [-1.2, -0.3, 0.9, 2.0, 3.0, 4.0].forEach((a) => { const top = V(Math.cos(a) * (R + 3), 0.6, Math.sin(a) * (R + 3)), lip = V(Math.cos(a) * (R + 0.2), 0.1, Math.sin(a) * (R + 0.2)), low = V(Math.cos(a) * (R - 1.4), -12 - r() * 10, Math.sin(a) * (R - 1.4));
    scene.add(CP.rope([top, lip, lip.clone().lerp(low, 0.5).add(V(0, 0, 0)), low], 0.09)); const st = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 1.6, 8), ENV.mt(ENV.T.wood(), 1)); st.position.copy(top); st.position.y = 0.6; st.castShadow = true; scene.add(st); });
  // the town round the rim: lit shopfronts + the Clock Tower (lit clock faces)
  for (let i = 0; i < 12; i++) { const a = -PI * 0.95 + (i / 11) * PI * 0.9; if (Math.abs(a + 1.23) < 0.22) continue; const s = TK.shop({ seed: 70 + i, w: 11.6, lit: true }); s.position.set(Math.cos(a) * 52, 0, Math.sin(a) * 52); s.rotation.y = -a - PI / 2; scene.add(s); }
  const tower = TK.tower({ lit: true }); tower.scale.setScalar(1.5); tower.position.set(24, 0, -70); scene.add(tower);
  [[-30, 34], [30, 30], [36, -10], [-40, -12]].forEach(([x, z]) => { const l = TK.lamp(true); l.position.set(x, 0, z); scene.add(l); });
  // climbing route down the near wall (+z, angle PI/2): stepping rocks + roots (sweeping tubes) + small ledges
  const route = new T.Group(); scene.add(route); const rockM = ENV.mt(ENV.T.rock('#8a7462'), 2), rootM = TK.SM('#5a3a22', 0.85);
  const wallR = (y) => R * (0.9 + 0.14 * (y + D) / D) * 1.0 - 0.3;
  for (let i = 0; i < 26; i++) { const y = -2 - i * 1.25 - r() * 0.5, a = PI / 2 + (r() - 0.5) * 0.22 + Math.sin(i * 0.9) * 0.06, rr = wallR(y); const rk = new T.Mesh(new T.DodecahedronGeometry(0.75 + r() * 0.55, 0), rockM); rk.scale.set(1.4, 0.7, 1.0); rk.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); rk.rotation.set(r(), r() * 3, r()); rk.castShadow = rk.receiveShadow = true; route.add(rk); }
  for (let i = 0; i < 9; i++) { const a0 = PI / 2 + (r() - 0.5) * 0.3, y0 = -3 - i * 3.4, pts = []; for (let k = 0; k <= 6; k++) { const a = a0 + (k - 3) * 0.035, y = y0 - k * 0.5 - Math.sin(k) * 0.4, rr = wallR(y) - 0.25 - Math.sin(k * 1.1) * 0.35; pts.push(V(Math.cos(a) * rr, y, Math.sin(a) * rr)); }
    const rt = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.13 + r() * 0.08, 7), rootM); rt.castShadow = true; route.add(rt); }
  const set = { scene, grade: 'night', R, D, big, pl, candy, truck, ladders, route, wallR, tower, glow, moon, hemi, sky };
  const night0 = { top: '#04061e', mid: '#16144a', hor: '#3a2e80' };
  set.mood = (m) => { if (set.curMood === m) return; set.curMood = m; const U = sky.material.uniforms;
    if (m === 'dusk') { U.top.value.set('#3a5ab8'); U.mid.value.set('#f08a68'); U.hor.value.set('#ffd2a0'); moon.color.set('#ffa868'); moon.intensity = 5.5; hemi.color.set('#c0a0e0'); hemi.groundColor.set('#6a4a3a'); hemi.intensity = 1.6; scene.fog.color.set('#e0a090'); scene.fog.density = 0.004; }
    else if (m === 'dawn') { U.top.value.set('#3a4aa8'); U.mid.value.set('#d88a90'); U.hor.value.set('#ffd0a8'); moon.color.set('#ffc890'); hemi.intensity = 1.4; hemi.color.set('#ffc8b8'); scene.fog.color.set('#c8a0a8'); }
    else { U.top.value.set(night0.top); U.mid.value.set(night0.mid); U.hor.value.set(night0.hor); moon.color.set('#9ab8ff'); moon.intensity = 5.0; hemi.color.set('#9a92e0'); hemi.groundColor.set('#2a2440'); hemi.intensity = 1.15; scene.fog.color.set('#1c1a48'); scene.fog.density = 0.008; }
    TK.rebake(scene, sky, ctx.renderer); };
  set.curMood = 'night';
  const keep = [big, candy, pl].map((o) => [o, o.position.clone(), o.rotation.clone()]);
  set.reset = () => keep.forEach(([o, p, r]) => { o.position.copy(p); o.rotation.copy(r); o.visible = true; });
  return set;
};

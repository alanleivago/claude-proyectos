// rbx-rope FRONT set: the last village before the Fog. Cobbled lane, stone/timber cottages with warm windows, lanterns,
// picket fences, the FIRST KNOT post with its brass plaque, and the Fog wall (stacked lit noise sheets + ground wisps).
// Night: blue-violet moonlight from behind the Fog, warm practicals. The rope runs along z from the village (+z) into the Fog (-z).
// Fog wall front at z=-20; first knot station at z=-12. mood('night'|'inside'|'dawn').
'use strict';
SETS.front = async function (ctx) {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), PI = Math.PI, { rng, fbm } = RBX;
  const scene = new T.Scene(), r = rng(501);
  scene.fog = new T.FogExp2('#1c1640', 0.016);
  const sky = ENV.sky(scene, ctx.renderer, { top: '#04051a', mid: '#141240', hor: '#3a2c78', sun: [-0.2, 0.42, -0.88], sunC: '#dfe4ff', sunK: 0.8, sunS: 0.9985, glow: 0.35 });
  const hemi = new T.HemisphereLight('#5a48d8', '#140a24', 0.55); scene.add(hemi);
  const moon = new T.DirectionalLight('#8eb0ff', 4.2); moon.position.set(-12, 26, -50); moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.03;
  Object.assign(moon.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); moon.target.position.set(0, 0, 0); scene.add(moon, moon.target);
  const fill = new T.DirectionalLight('#ffb070', 0.5); fill.position.set(20, 10, 40); scene.add(fill);
  // ground: cobbled lane + grass/dirt verges
  const plane = (w, d, m, x, y, z) => { const g = new T.PlaneGeometry(w, d, 1, 1); g.rotateX(-PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.receiveShadow = true; scene.add(me); return me; };
  plane(12, 240, ENV.mt(ENV.T.cobble(), 1.4), 0, 0.01, 60);
  const gm = ENV.mt(ENV.T.grass(), 5); gm.color = new T.Color('#9aa888'); plane(400, 400, gm, 0, 0, 40);
  plane(60, 40, ENV.mt(ENV.T.dirt(), 4), 0, 0.02, -30);
  const box = (w, h, d, m, x, y, z, par = scene) => { const g = new T.BoxGeometry(w, h, d); KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; par.add(me); return me; };
  // cottages: stone base, timber-frame plaster upper, steep shingle roof, glowing windows, chimney
  const stone = ENV.mt(ENV.T.stone(), 3), plaster = new T.MeshStandardMaterial({ color: '#d8ccb4', roughness: 0.9 }), beam = ENV.mt(ENV.T.wood('#4a3020'), 2);
  const winM = new T.MeshStandardMaterial({ color: '#ffd090', emissive: '#ff9a40', emissiveIntensity: 3.2, roughness: 0.5 });
  const cottage = (x, z, ry, seed) => { const g = new T.Group(), rr = rng(seed), w = 9 + rr() * 3, d = 8, h1 = 3.5, h2 = 3.2;
    box(w, h1, d, stone, 0, h1 / 2, 0, g); box(w + 0.2, h2, d + 0.2, plaster, 0, h1 + h2 / 2, 0, g);
    for (let k = -2; k <= 2; k++) box(0.25, h2, 0.1, beam, (k * w) / 5, h1 + h2 / 2, d / 2 + 0.12, g); box(w + 0.3, 0.25, 0.12, beam, 0, h1 + 0.1, d / 2 + 0.14, g); box(w + 0.3, 0.25, 0.12, beam, 0, h1 + h2 - 0.1, d / 2 + 0.14, g);
    const rh = 5, sl = Math.hypot(d / 2 + 0.8, rh), a = Math.atan2(rh, d / 2 + 0.8), rm = ENV.mt(ENV.T.shingle(['#4a3a3a', '#3a3a4a', '#5a4030'][seed % 3]), 2);
    [-1, 1].forEach((s) => { const p = box(w + 1.2, 0.35, sl, rm, 0, h1 + h2 + rh / 2, s * (d / 4 + 0.4), g); p.rotation.x = s * a; });
    const gab = new T.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, rh); gab.closePath(); const gg = new T.ExtrudeGeometry(gab, { depth: w, bevelEnabled: false }); gg.translate(0, 0, -w / 2); gg.rotateY(PI / 2); const gmh = new T.Mesh(gg, plaster); gmh.position.y = h1 + h2; g.add(gmh);
    [[-w * 0.28, 1.9], [w * 0.28, 1.9], [-w * 0.2, h1 + 1.5], [w * 0.2, h1 + 1.5]].forEach(([wx, wy], i) => { box(1.5, 1.4, 0.12, winM, wx, wy, d / 2 + 0.08, g); box(1.8, 0.16, 0.3, beam, wx, wy - 0.78, d / 2 + 0.2, g); box(0.1, 1.4, 0.16, beam, wx, wy, d / 2 + 0.16, g); });
    box(1.4, 2.6, 0.15, beam, 0, 1.3, d / 2 + 0.08, g); box(1.2, 3.2, 1.2, stone, w * 0.3, h1 + h2 + rh - 0.6, -1, g);
    const L = new T.PointLight('#ff9a50', 10, 16, 2); L.position.set(0, 2.2, d / 2 + 1.6); g.add(L);
    g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); return g; };
  let sd = 1; for (let z = -2; z < 150; z += 15) [-1, 1].forEach((s) => cottage(s * (14 + r() * 3), z + r() * 4, s > 0 ? -PI / 2 : PI / 2, sd++));
  // fences + lanterns along the lane
  const fenceM = new T.MeshStandardMaterial({ color: '#c8c0b0', roughness: 0.8 });
  [-1, 1].forEach((s) => { for (let z = -14; z < 120; z += 1.2) box(0.14, 1.0 + (Math.floor(z) % 2) * 0.1, 0.5, fenceM, s * 7.4, 0.5, z); box(0.1, 0.12, 134, fenceM, s * 7.4, 0.75, 53); });
  [-12, 6, 24, 42, 60].forEach((z, i) => { const l = ENV.lantern({ k: 22, dist: 20 }); l.position.set((i % 2 ? 1 : -1) * 6.4, 0, z); scene.add(l); });
  // the edge: a low stone wall the rope passes over, warning signs, an old bench
  box(30, 1.2, 1.2, stone, 0, 0.6, -17, scene).position.x = 0;
  const signTex = KIT.textTex(512, 256, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); KIT.noiseOver(g, w, h, 7, 0.2, 6, 3); g.fillStyle = '#7a1a10'; g.font = '900 78px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('THE FRONT', w / 2, 100); g.font = '900 40px "Arial Black", sans-serif'; g.fillStyle = '#1a1410'; g.fillText('HOLD ON. HUM IF SCARED.', w / 2, 190); });
  const sign = new T.Group(); box(0.25, 3.4, 0.25, beam, -1.6, 1.7, 0, sign); box(0.25, 3.4, 0.25, beam, 1.6, 1.7, 0, sign); const sp = new T.Mesh(new T.BoxGeometry(4, 2, 0.12), [beam, beam, beam, beam, new T.MeshStandardMaterial({ map: signTex, roughness: 0.8 }), beam]); sp.position.y = 2.6; sign.add(sp); sign.position.set(-5.2, 0, -12.5); sign.rotation.y = 0.5; ENV.shadow(sign); scene.add(sign);
  // the Fog wall + ground wisps (lavender, faintly self-lit)
  // the Fog bank: a towering wall of billowing puffs, lit from behind by the moon, faintly self-lit
  const puffM = new T.MeshStandardMaterial({ color: '#8c86d0', roughness: 1, emissive: '#6a5cc8', emissiveIntensity: 0.55, flatShading: false }), bank = new T.Group();
  for (let i = 0; i < 420; i++) { const x = (r() - 0.5) * 240, y = r() ** 0.7 * 50, z = -34 - r() * 30 - y * 0.3, s = 3.5 + r() * 6 + (1 - y / 50) * 3; const p = new T.Mesh(new T.IcosahedronGeometry(1, 3), puffM); p.position.set(x, y, z); p.scale.set(s * (1 + r() * 0.5), s * (0.7 + r() * 0.4), s); bank.add(p); }
  scene.add(bank);
  const fogW = ENV.fogWall({ n: 12, w: 260, h: 40, gap: 2.2, c: '#a8a4d8', op: 0.36, k: 0.9 }); fogW.position.z = -21; scene.add(fogW);
  const back = new T.Mesh(new T.PlaneGeometry(800, 300), new T.MeshBasicMaterial({ color: '#5a5690', fog: false })); back.position.set(0, -130, -62); scene.add(back);
  const wisps = new T.Group(); for (let i = 0; i < 26; i++) { const m = new T.MeshBasicMaterial({ map: ENV.fogTex(), color: '#b8b4e0', transparent: true, opacity: 0.35, depthWrite: false, side: T.DoubleSide }); const p = new T.Mesh(new T.PlaneGeometry(26 + r() * 20, 5), m); p.position.set((r() - 0.5) * 40, 1.0 + r() * 1.4, -26 + r() * 9); p.rotation.y = (r() - 0.5) * 0.6; p.renderOrder = 4; wisps.add(p); } scene.add(wisps);
  const fogGlow = new T.PointLight('#c8c0ff', 30, 60, 1.6); fogGlow.position.set(0, 6, -26); scene.add(fogGlow);
  // the rope: from the village down the lane, over the wall, into the Fog
  const pts = []; for (let z = 160; z >= -120; z -= 4) { const y = z < -17 ? 2.8 + Math.max(-0.6, (z + 17) * 0.01) : 2.8; pts.push(V(Math.sin(z * 0.02) * 0.3, y + (Math.abs(z + 17) < 2 ? 0.0 : 0), z)); }
  const rope = ROPE.make(pts, 0.32, { maxSeg: 6000 }); scene.add(rope);
  const cv = rope.userData.curve, L = rope.userData.len;
  const sAt = (z) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (cv.getPointAt(m).z > z) lo = m; else hi = m; } return lo * L; };
  // the first knot: a big knot with a brass plaque on a short oak stake next to the rope
  const kn = ROPE.knot(cv, sAt(-10.6) / L, 0.32, { scale: 1.7 }); scene.add(kn);
  const plaque = new T.Group(); box(0.5, 2.2, 0.5, beam, 0, 1.1, 0, plaque);
  const pTex = KIT.textTex(256, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f0d080'); gr.addColorStop(1, '#a8782a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a4a14'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3a2408'; g.textAlign = 'center'; g.font = '900 30px "Arial Black", sans-serif'; g.fillText('KNOT No.1', w / 2, 66); g.font = '700 22px sans-serif'; g.fillText('HELD SINCE THE START', w / 2, 112); });
  const pm = new T.Mesh(new T.BoxGeometry(1.3, 0.8, 0.08), [beam, beam, beam, beam, new T.MeshPhysicalMaterial({ map: pTex, metalness: 0.7, roughness: 0.35 }), beam]); pm.position.set(0, 2.1, 0.3); pm.rotation.x = -0.3; plaque.add(pm); plaque.position.set(2.4, 0, -9.2); plaque.rotation.y = -0.4; ENV.shadow(plaque); scene.add(plaque);
  const set = { scene, rope, sAt, grade: 'night', fogW, wisps, fogGlow, bank };
  set.mood = (m) => { sky.visible = back.visible = m !== 'inside'; scene.background = m === 'inside' ? new T.Color('#c4c0e4') : null; if (m === 'inside') { scene.fog.color.set('#c4c0e4'); scene.fog.density = 0.06; hemi.intensity = 2.2; hemi.color.set('#d8d4ff'); moon.intensity = 0.6; }
    else if (m === 'dawn') { scene.fog.color.set('#e8c8c8'); scene.fog.density = 0.006; hemi.intensity = 1.4; hemi.color.set('#ffd8c0'); moon.intensity = 4.5; moon.color.set('#ffc890');
      const U = sky.material.uniforms; U.top.value.set('#5a7ac8'); U.mid.value.set('#f0a890'); U.hor.value.set('#ffe0b8'); }
    else { moon.color.set('#8eb0ff'); { const U = sky.material.uniforms; U.top.value.set('#04051a'); U.mid.value.set('#141240'); U.hor.value.set('#3a2c78'); } scene.fog.color.set('#1c1640'); scene.fog.density = 0.016; hemi.intensity = 0.55; hemi.color.set('#5a48d8'); moon.intensity = 4.2; } };
  return set;
};

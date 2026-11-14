// rbx-followers BRIDGE set: a long red suspension bridge over a bay, city skyline on the far shore.
// Deck along z (x -9..9, y 0 = road surface, z -400..300), two lanes + sidewalks, railings; towers at z=-150 and z=150,
// parabolic main cables + suspenders, water at y=-40. mood(name): 'dusk' (three days, the crowd), 'dawn' (after he turns around).
'use strict';
SETS.bridge = async function (ctx) {
  const T = THREE, { rng } = RBX, { V, box } = KIT, PI = Math.PI;
  const scene = new T.Scene(); const add = (...o) => { o.forEach((m) => scene.add(m)); return o[0]; };
  const SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const ZA = -420, ZB = 320, XW = 9, TZ = [-150, 150], TH = 70, WY = -40;
  const red = SM('#c8402a', 0.45, 0.3), steel = SM('#8a3020', 0.5, 0.4), conc = ENV.mt(ENV.T.stone(), 3), road = ENV.mt(ENV.T.asphalt(), 6);
  // deck
  add(box(2 * XW - 6, 0.6, ZB - ZA, road, 0, -0.3, (ZA + ZB) / 2, true));
  [-1, 1].forEach((s) => { add(box(3, 0.9, ZB - ZA, conc, s * (XW - 1.5), -0.15, (ZA + ZB) / 2, true)); add(box(0.5, 0.5, ZB - ZA, SM('#b0aca4', 0.8), s * (XW - 3.1), 0.05, (ZA + ZB) / 2));
    add(box(1.0, 3.0, ZB - ZA, steel, s * XW, -2.2, (ZA + ZB) / 2));   // stiffening girder
    for (let z = ZA; z < ZB; z += 6) add(box(0.14, 0.14, 6.6, SM('#f2f0e8', 0.6), s * 3.2 * 0 + s * 0.15, 0.01, z));
    // railing: posts + 2 rails
    add(box(0.25, 0.25, ZB - ZA, red, s * (XW - 0.1), 3.0, (ZA + ZB) / 2), box(0.2, 0.2, ZB - ZA, red, s * (XW - 0.1), 1.6, (ZA + ZB) / 2));
    for (let z = ZA; z < ZB; z += 2.5) add(box(0.22, 3.0, 0.22, red, s * (XW - 0.1), 1.5, z)); });
  for (let z = ZA; z < ZB; z += 6) add(box(0.3, 0.02, 3, SM('#f2f0e8', 0.6), 0, 0.01, z));   // centre dashes
  // towers (two legs + 3 portal beams) + footings
  TZ.forEach((tz) => { [-1, 1].forEach((s) => { add(box(3.2, TH + 45, 4, red, s * (XW + 2), (TH - 45) / 2, tz)); add(box(4, 1.2, 4.8, steel, s * (XW + 2), TH, tz)); });
    [TH - 6, TH * 0.6, 12].forEach((y) => add(box(2 * XW + 6, 3, 2.6, red, 0, y, tz))); add(box(30, 10, 14, conc, 0, WY - 2, tz)); });
  // main cables: catenary-ish parabola between towers and down to anchors; suspenders every 6
  const cableY = (z) => { if (z < TZ[0]) return TH - (TH - 4) * ((TZ[0] - z) / (TZ[0] - ZA)) ** 1.4; if (z > TZ[1]) return TH - (TH - 4) * ((z - TZ[1]) / (ZB - TZ[1])) ** 1.4; const u = (z - TZ[0]) / (TZ[1] - TZ[0]); return 6 + (TH - 6) * (2 * u - 1) ** 2; };
  const cm = SM('#b8382a', 0.4, 0.4);
  [-1, 1].forEach((s) => { const pts = []; for (let z = ZA; z <= ZB; z += 5) pts.push(V(s * (XW + 2), cableY(z), z)); add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 300, 0.55, 8), cm));
    for (let z = ZA + 3; z < ZB; z += 6) { const y = cableY(z); if (y < 3.4) continue; const h = y - 2.8, m = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, h, 5), cm); m.position.set(s * (XW + 2) - s * 0.0, 2.8 + h / 2, z); add(m); } });
  // lamp posts along both sides (warm at dusk)
  const lampM = new T.MeshStandardMaterial({ color: '#fff0c8', emissive: new T.Color('#ffb860'), emissiveIntensity: 0 }); const lamps = [];
  for (let z = ZA + 10; z < ZB; z += 24) [-1, 1].forEach((s) => { const p = new T.Mesh(new T.CylinderGeometry(0.15, 0.2, 9, 8), SM('#2a2a2e', 0.5, 0.6)); p.position.set(s * (XW - 0.9), 4.5, z); add(p); const arm = box(2.2, 0.2, 0.2, SM('#2a2a2e', 0.5, 0.6), s * (XW - 1.9), 9, z); add(arm); const hd = box(1.0, 0.3, 0.6, lampM, s * (XW - 2.8), 8.8, z); add(hd); lamps.push(hd.position.clone()); });
  // water + far shore city + hills
  const water = new T.Mesh(new T.PlaneGeometry(4000, 4000), new T.MeshPhysicalMaterial({ color: '#1a4a7a', roughness: 0.12, metalness: 0.1, clearcoat: 1, normalMap: ENV.waterNormal() })); water.material.normalMap.repeat.set(80, 80); water.material.normalScale.set(0.6, 0.6); water.rotation.x = -PI / 2; water.position.y = WY; add(water);
  const r = rng(303), city = new T.Group(); scene.add(city); const winM = [];
  const bt = (k) => KIT.textTex(128, 256, (g, w, h) => { g.fillStyle = ['#3a4a6a', '#5a5a6a', '#6a5a4a', '#2a3a5a'][k]; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.fillStyle = Math.random() > 0.55 ? '#ffd890' : 'rgba(10,15,30,0.85)'; g.fillRect(x, y, 9, 10); } });
  const bm = [0, 1, 2, 3].map((k) => { const t = bt(k); t.wrapS = t.wrapT = T.RepeatWrapping; const m = new T.MeshStandardMaterial({ map: t, roughness: 0.6, emissive: new T.Color('#ffffff'), emissiveMap: t, emissiveIntensity: 0.0 }); winM.push(m); return m; });
  for (let i = 0; i < 140; i++) { const w = 10 + r() * 22, h = 20 + r() ** 2 * 140, x = -420 + r() * 840, z = 560 + r() * 260, g = new T.BoxGeometry(w, h, w); const m = new T.Mesh(g, bm[i % 4]); m.position.set(x, WY + h / 2, z); city.add(m); }
  for (let i = 0; i < 9; i++) { const hill = new T.Mesh(new T.SphereGeometry(140 + r() * 120, 16, 10), SM('#3a5a3a', 1)); hill.scale.y = 0.35; hill.position.set(-900 + i * 230, WY - 20, -700 - r() * 200); add(hill); }
  // lights + sky (set by mood)
  const hemi = add(new T.HemisphereLight('#ffb890', '#2a2a40', 1.2)); const sun = new T.DirectionalLight('#ff9a5a', 6); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 400 }); scene.add(sun, sun.target);
  const sky = {}; const mkSky = (k, o) => { const s = new T.Scene(); sky[k] = { o, dome: null }; };
  const SKY = { dusk: { top: '#1a1a4a', mid: '#6a3a7a', hor: '#ff8a4a', sun: [-0.12, 0.07, 0.99], sunC: '#ffb070', glow: 0.8, sunK: 0.6, fog: '#a86a7a', fd: 0.0026, hemi: ['#c8b8d0', '#2a2040', 1.35], key: ['#ffc8a8', 3.2], lamps: 1.4, win: 0.9 },
    dawn: { top: '#3a7ad8', mid: '#9ac0f0', hor: '#ffe0b8', sun: [-0.3, 0.12, -0.95], sunC: '#fff0d0', glow: 0.6, sunK: 0.8, fog: '#d8e0f0', fd: 0.0018, hemi: ['#cfe0ff', '#5a5040', 1.5], key: ['#ffe2b0', 5.2], lamps: 0, win: 0.15 } };
  let dome = null;
  const mood = (k) => { if (sky.cur === k) return; const o = SKY[k]; if (dome) scene.remove(dome); dome = ENV.sky(scene, ctx.renderer, { top: o.top, mid: o.mid, hor: o.hor, sun: o.sun, sunC: o.sunC, glow: o.glow, sunK: o.sunK });
    scene.fog = new T.FogExp2(o.fog, o.fd); hemi.color.set(o.hemi[0]); hemi.groundColor.set(o.hemi[1]); hemi.intensity = o.hemi[2]; sun.color.set(o.key[0]); sun.intensity = o.key[1];
    const d = V(...o.sun).normalize(); sun.position.set(d.x * 200, Math.max(30, d.y * 400), d.z * 200); sun.target.position.set(0, 0, 0); lampM.emissiveIntensity = o.lamps; winM.forEach((m) => { m.emissiveIntensity = o.win; }); sky.cur = k; };
  mood('dusk');
  scene.traverse((m) => { if (m.isMesh && m !== water) { m.castShadow = true; m.receiveShadow = true; } });
  return { scene, grade: 'sunset', mood, sun, XW, reset() {} };
};

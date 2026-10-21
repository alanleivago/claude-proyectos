
// =====================================================================
//  FAR — three places seen at night: a hillside cemetery (cypresses, headstones, crosses, a chapel) where columns of light
//  rise from the graves; a private airfield (runway lights, jets taxiing, cars racing in); a street among towers where the
//  light comes down.
// =====================================================================
function nightStage(o = {}) { const st = makeStage(Object.assign({ hemi: 0.35, sky: 0x4a5a8a, ground: 0x1a1a22, key: 0.5, keyCol: '#9ab0e0', box: 60, boxFar: 600, fog: '#1a1e30', fogNear: 120, fogFar: 2600, sunDist: 300, far: 40000 }, o));
  st.setSun(L_DIR, new THREE.Vector3(0, 0, -10)); skyEnv(st, '#0a0e1e', '#2a2a40', L_DIR, '#fff0d0'); heavenDome(st); return st; }
const beamTex = () => g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, 'rgba(255,250,235,0.35)'); g.addColorStop(0.5, 'rgba(255,255,250,1)'); g.addColorStop(0.65, 'rgba(255,250,235,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.5, 'rgba(0,0,0,0.6)'); v.addColorStop(0.95, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.fillStyle = v; x.fillRect(0, 0, w, h); }, 64, 256);
// ------------------------------------------------------------------ the cemetery
const hy = (x, z) => -z * 0.22 + 1.6 * Math.sin(x * 0.07) * Math.cos(z * 0.05) + 0.6 * Math.sin(x * 0.21 + z * 0.13);
function buildGrave() { const st = nightStage(), R = RNG('grave'), S = { st };
  const g = new THREE.PlaneGeometry(260, 260, 130, 130).rotateX(-Math.PI / 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, hy(p.getX(i), p.getZ(i))); g.computeVertexNormals();
  const grass = STDm({ map: wrap(texNoise('cgrass', '#2e4a26', ['#3a5a2e', '#24401e', '#4a6a34', '#2a3a20'], 12000, 256), 40, 40), roughness: 1 }); const land = new THREE.Mesh(g, grass); land.receiveShadow = true; st.scene.add(land);
  const stone = STDm({ map: texNoise('gst', '#a8a49a', ['#8a867c', '#c0bcb2', '#6a675f'], 6000), roughness: 0.9 }), dark = STDm({ color: '#6a6660', roughness: 0.9 });
  // paths: gravel strips up the hill and across
  const grav = STDm({ map: wrap(texNoise('grav', '#8a8070', ['#9a9080', '#6a6458', '#b0a490'], 9000), 2, 40), roughness: 1 });
  [-14, 14].forEach((x0) => { const pg = new THREE.PlaneGeometry(2.4, 200, 1, 100).rotateX(-Math.PI / 2), pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setY(i, hy(pp.getX(i) + x0, pp.getZ(i) - 40) + 0.04); pg.computeVertexNormals(); const m = new THREE.Mesh(pg, grav); m.position.set(x0, 0, -40); m.receiveShadow = true; st.scene.add(m); });
  // graves in rows on the slope: headstones (rounded), crosses, slabs
  const N = 420, hs = IM(new THREE.BoxGeometry(0.6, 0.8, 0.14).translate(0, 0.4, 0), stone, N), top = IM(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 0.8, 0), stone, N);
  const cv = IM(new THREE.BoxGeometry(0.12, 1.2, 0.12).translate(0, 0.6, 0), stone, N), ch = IM(new THREE.BoxGeometry(0.6, 0.12, 0.12).translate(0, 0.85, 0), stone, N), slab = IM(new THREE.BoxGeometry(0.9, 0.14, 1.9).translate(0, 0.07, 0.8), dark, N);
  S.graves = []; let n = 0; for (let row = 0; row < 26 && n < N; row++) for (let c = -15; c <= 15 && n < N; c++) { const x = c * 2.1 + R.n(0.2), z = 20 - row * 3.4 + R.n(0.2); if (Math.abs(Math.abs(x) - 14) < 1.8 || R.f() < 0.12) continue; const y = hy(x, z), ry = R.n(0.06), tilt = R.n(0.04), kind = R.f();
    const M = M4c(x, y, z, ry, 1, R.r(0.85, 1.2), 1, tilt); if (kind < 0.6) { hs.setMatrixAt(n, M); top.setMatrixAt(n, M); cv.setMatrixAt(n, _hid); ch.setMatrixAt(n, _hid); } else { hs.setMatrixAt(n, _hid); top.setMatrixAt(n, _hid); cv.setMatrixAt(n, M); ch.setMatrixAt(n, M); }
    slab.setMatrixAt(n, M4c(x, y, z, ry)); S.graves.push([x, y, z]); n++; }
  [hs, top, cv, ch, slab].forEach((m) => { m.count = n; st.scene.add(m); });
  // cypresses along the paths and the walls; a chapel at the top; the stone wall
  const cyp = STDm({ map: leafTex('cyp', '#1e3a24'), roughness: 1 }); for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, x = side * (i < 30 ? 16.2 : 34), z = 22 - Math.floor(i / 2) * 6.5 * (i < 30 ? 1 : 1.4), y = hy(x, z), h = R.r(7, 10);
    const t = mesh(lumpyGeo(3, 0.2, 400 + i), cyp, x, y + h * 0.5, z); t.scale.set(0.9, h * 0.5, 0.9); st.scene.add(t); }
  const wallM = STDm({ map: wrap(texNoise('cwall', '#9a9280', ['#7a7464', '#b0a894', '#5a564c']), 20, 1), roughness: 1 }); [-38, 38].forEach((x) => { for (let z = 24; z > -80; z -= 4) st.scene.add(mesh(new THREE.BoxGeometry(0.5, 1.8, 4.05), wallM, x, hy(x, z) + 0.6, z)); });
  { const cz = -72, cy = hy(0, cz), cm = STDm({ map: texNoise('chap', '#d8ccb4', ['#c8bca4', '#e0d4bc', '#a89c84']), roughness: 0.9 }); st.scene.add(mesh(new THREE.BoxGeometry(8, 7, 12), cm, 0, cy + 3.5, cz)); const r = mesh(new THREE.CylinderGeometry(0.01, 6.2, 3.4, 4, 1).rotateY(Math.PI / 4), STDm({ color: '#6a3a2a' }), 0, cy + 8.7, cz); r.scale.set(0.95, 1, 1.45); st.scene.add(r);
    st.scene.add(mesh(new THREE.BoxGeometry(2.4, 6, 2.4), cm, 0, cy + 10, cz + 4.6)); st.scene.add(mesh(new THREE.ConeGeometry(1.8, 3.6, 4), STDm({ color: '#6a3a2a' }), 0, cy + 14.8, cz + 4.6)); st.scene.add(mesh(new THREE.PlaneGeometry(1.4, 2.6), STDm({ color: '#ffd08a', emissive: '#ffb860', emissiveIntensity: 1.6 }), 0, cy + 2.2, cz + 6.02)); }
  // the columns of light: one per chosen grave; a bright core, a soft halo, a glow on the ground, motes rising
  S.beams = []; const bt = beamTex(), pick = S.graves.filter((_, i) => i % 5 === 2).slice(0, 70); pick.forEach(([x, y, z], i) => { const ts = 54.4 + (i * 0.618 % 1) * 3.6 + R.r(0, 0.4);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 80, 10, 1, true).translate(0, 40, 0), new THREE.MeshBasicMaterial({ map: bt, color: '#fff6e0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0 })); core.position.set(x, y, z + 0.6); st.scene.add(core);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 80, 14, 1, true).translate(0, 40, 0), new THREE.MeshBasicMaterial({ map: bt, color: '#ffe8c0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0 })); halo.position.copy(core.position); st.scene.add(halo);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#fff0d0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); gl.position.set(x, y + 0.4, z + 0.6); gl.scale.setScalar(3.4); st.scene.add(gl);
    const mote = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); mote.scale.set(0.5, 1.4, 1); st.scene.add(mote); S.beams.push({ core, halo, gl, mote, ts, x, y, z: z + 0.6 }); });
  S.pl = [0, 1, 2].map((i) => { const l = new THREE.PointLight('#ffe8c0', 0, 60, 1.6); l.position.set(-10 + i * 10, hy(0, -10 - i * 18) + 3, -10 - i * 18); st.scene.add(l); return l; });
  return S; }
function poseGrave(S, t) { let on = 0; S.beams.forEach((b) => { const k = ss(b.ts, b.ts + 0.8, t), fl = 0.85 + 0.15 * Math.sin(t * 7 + b.x); on += k; b.core.material.opacity = 0.9 * k * fl; b.halo.material.opacity = 0.32 * k; b.gl.material.opacity = 0.8 * k; b.core.scale.y = b.halo.scale.y = 0.02 + 0.98 * ss(b.ts, b.ts + 1.2, t);
    const u = Math.max(0, t - b.ts - 0.4); b.mote.position.set(b.x, b.y + 1 + u * u * 4 + u * 3, b.z); b.mote.material.opacity = k * clamp(1 - u / 5) * 0.9; }); S.pl.forEach((l) => (l.intensity = 0.06 * on)); }
// ------------------------------------------------------------------ the airfield
function jet(par, x, z, ry, R) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; par.add(g); const wh = STDm({ color: '#f4f4f6', roughness: 0.35, metalness: 0.2 }), gr = STDm({ color: '#8a8e96', metalness: 0.6, roughness: 0.4 }), stripe = STDm({ color: R.pick(['#1e3a6a', '#6a1e2a', '#2a2a2e', '#b0903a']) });
  g.add(mesh(new THREE.CapsuleGeometry(1.0, 13, 8, 18).rotateX(Math.PI / 2).scale(1, 1.05, 1), wh, 0, 2.0, 0)); g.add(mesh(new THREE.ConeGeometry(1.0, 2.6, 18).rotateX(Math.PI / 2), wh, 0, 2.0, 8.2));
  g.add(mesh(new THREE.BoxGeometry(2.04, 0.12, 12), stripe, 0, 1.8, 0)); const win = STDm({ color: '#1a1e28', emissive: '#ffd090', emissiveIntensity: 1.2 }); for (let k = 0; k < 7; k++) [-1, 1].forEach((s) => g.add(mesh(new THREE.BoxGeometry(0.06, 0.32, 0.38), win, s * 0.98, 2.3, 4 - k * 1.1)));
  g.add(mesh(new THREE.BoxGeometry(1.6, 0.36, 0.9), STDm({ color: '#141820', roughness: 0.1 }), 0, 2.6, 7.0)); [-1, 1].forEach((s) => { const wg = mesh(new THREE.BoxGeometry(8, 0.18, 2.6), wh, s * 4.6, 1.5, 0.4); wg.rotation.y = s * 0.35; wg.rotation.z = s * 0.06; g.add(wg); g.add(mesh(new THREE.CapsuleGeometry(0.45, 2.2, 6, 14).rotateX(Math.PI / 2), gr, s * 1.6, 2.6, -4.6)); g.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), STDm({ color: s < 0 ? '#ff2020' : '#20ff40', emissive: s < 0 ? '#ff2020' : '#20ff40', emissiveIntensity: 3 }), s * 8.4, 1.6, -1.0)); });
  const fin = mesh(new THREE.BoxGeometry(0.18, 3.2, 2.2), wh, 0, 4.0, -6.3); fin.rotation.x = -0.4; g.add(fin); g.add(mesh(new THREE.BoxGeometry(5.2, 0.14, 1.4), wh, 0, 5.4, -7.2)); [[0, 6], [-1.4, -0.4], [1.4, -0.4]].forEach(([a, b]) => g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 12).rotateZ(Math.PI / 2), STDm({ color: '#141414' }), a, 0.22, b)));
  const bea = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff3020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bea.position.set(0, 3.2, 0); bea.scale.setScalar(2.2); g.add(bea); g.userData.bea = bea; return g; }
function buildJets() { const st = nightStage({ fog: '#141828', fogNear: 200, fogFar: 3200, hemi: 0.6, key: 1.0 }), R = RNG('jets'), S = { st };
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('afg', '#2a3424', ['#34402a', '#22301e', '#3a4430']), 80, 80), roughness: 1 })); gnd.receiveShadow = true; st.scene.add(gnd);
  const asph = STDm({ map: wrap(texNoise('asph', '#34363a', ['#2a2c30', '#3e4044', '#26282c'], 9000), 4, 60), roughness: 0.9 });
  const rw = mesh(new THREE.PlaneGeometry(45, 2400).rotateX(-Math.PI / 2), asph, 60, 0.02, -600); st.scene.add(rw); const tw = mesh(new THREE.PlaneGeometry(22, 2400).rotateX(-Math.PI / 2), asph, 0, 0.02, -600); st.scene.add(tw);
  const ap = mesh(new THREE.PlaneGeometry(140, 120).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('apr', '#4a4c50', ['#3e4044', '#56585c', '#44464a'], 9000), 12, 10), roughness: 0.85 }), -70, 0.02, -40); st.scene.add(ap);
  const dashes = IM(new THREE.PlaneGeometry(0.9, 24).rotateX(-Math.PI / 2), STDm({ color: '#e8e8e0', roughness: 0.6 }), 50, false); for (let i = 0; i < 50; i++) dashes.setMatrixAt(i, M4c(60, 0.04, 560 - i * 48)); st.scene.add(dashes);
  const yl = IM(new THREE.PlaneGeometry(0.3, 2400).rotateX(-Math.PI / 2), STDm({ color: '#d8b030' }), 1, false); yl.setMatrixAt(0, M4c(0, 0.04, -600)); st.scene.add(yl);
  const lightsW = [], lightsB = []; for (let z = 560; z > -1800; z -= 30) { lightsW.push([37, z], [83, z]); lightsB.push([-11, z + 15], [11, z + 15]); }
  S.rwL = IM(new THREE.SphereGeometry(0.35, 8, 6), STDm({ color: '#fff4e0', emissive: '#fff0d0', emissiveIntensity: 4 }), lightsW.length, false); lightsW.forEach(([x, z], i) => S.rwL.setMatrixAt(i, M4c(x, 0.3, z))); st.scene.add(S.rwL);
  S.twL = IM(new THREE.SphereGeometry(0.28, 8, 6), STDm({ color: '#4060ff', emissive: '#3050ff', emissiveIntensity: 4 }), lightsB.length, false); lightsB.forEach(([x, z], i) => S.twL.setMatrixAt(i, M4c(x, 0.3, z))); st.scene.add(S.twL);
  // hangar and a small terminal with lit glass; a control tower
  const hm = STDm({ color: '#c8ccd2', metalness: 0.4, roughness: 0.5 }); st.scene.add(mesh(new THREE.BoxGeometry(70, 18, 70), hm, -120, 9, -40)); st.scene.add(mesh(new THREE.CylinderGeometry(35, 35, 70, 24, 1, false, -0.5, 1.0).rotateZ(Math.PI / 2), hm, -120, -12, -40)); st.scene.add(mesh(new THREE.PlaneGeometry(40, 18), STDm({ color: '#ffd8a0', emissive: '#ffcf90', emissiveIntensity: 1.2 }), -120, 9, -4.9));
  st.scene.add(mesh(new THREE.BoxGeometry(60, 9, 18), STDm({ color: '#d8d4cc' }), -110, 4.5, 40)); st.scene.add(mesh(new THREE.BoxGeometry(58, 5, 0.2), STDm({ color: '#1a2030', emissive: '#ffd090', emissiveIntensity: 1.0 }), -110, 5, 30.9));
  st.scene.add(mesh(new THREE.CylinderGeometry(2.2, 3, 30, 12), STDm({ color: '#d8d4cc' }), -20, 15, 60)); st.scene.add(mesh(new THREE.CylinderGeometry(4.5, 3.6, 4, 12), STDm({ color: '#203040', emissive: '#80b0d0', emissiveIntensity: 0.8 }), -20, 32, 60));
  // jets: one rolling out to the runway, the rest on the apron with people running to them
  S.jets = [[-30, -50, Math.PI * 0.5], [-58, -66, Math.PI * 0.62], [-86, -56, Math.PI * 0.6], [-50, -24, Math.PI * 0.45], [-80, -22, Math.PI * 0.5]].map(([x, z, r]) => jet(st.scene, x, z, r, R));
  S.flood = [[-20, -20], [-100, -10], [-60, -90], [-70, 14]].map(([x, z]) => { const l = new THREE.PointLight('#ffe8c8', 3.0, 140, 1.1); l.position.set(x, 18, z); st.scene.add(l); st.scene.add(mesh(new THREE.CylinderGeometry(0.25, 0.35, 18, 8).translate(0, 9, 0), IRON(), x, 0, z + 3));
    st.scene.add(mesh(new THREE.BoxGeometry(3, 1, 1.2), STDm({ color: '#fff4e0', emissive: '#fff0d0', emissiveIntensity: 3 }), x, 18, z + 3)); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffe8c8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); sp.position.set(x, 18, z + 3); sp.scale.setScalar(12); st.scene.add(sp); l.userData.sp = sp; return l; });
  S.cars = []; for (let i = 0; i < 6; i++) { const c = new THREE.Group(); st.scene.add(c); c.add(mesh(new THREE.BoxGeometry(2.0, 1.2, 4.8).translate(0, 0.8, 0), STDm({ color: '#141418', metalness: 0.6, roughness: 0.3 }))); c.add(mesh(new THREE.BoxGeometry(1.8, 0.6, 2.6).translate(0, 1.6, -0.3), STDm({ color: '#0a0c10', roughness: 0.1 })));
    [-0.7, 0.7].forEach((s) => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#fff8e8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.position.set(s, 0.9, 2.5); h.scale.setScalar(2.2); c.add(h); }); S.cars.push({ g: c, z0: 120 + i * 16, x: -44 - i * 7 }); }
  S.crowd = makeCrowd(60, { seed: 33, tops: ['#1a1a1e', '#2a2a30', '#3a3a44', '#f4f1ea', '#5a4a3a'] }); st.scene.add(S.crowd.grp); S.cr = []; for (let i = 0; i < 60; i++) S.cr.push({ x: R.r(-80, -40), z: R.r(4, 26), tx: S.jets[i % 5].position.x, tz: S.jets[i % 5].position.z, sp: R.r(3.5, 5.5), ph: R.r(0, 6) });
  return S; }
function poseJets(S, t) { const u = t - 61; const j = S.jets[0]; j.position.set(lerp(-30, 0, ss(61, 63.5, t)), 0, -50 - 30 * ss(62.5, 65.5, t)); j.rotation.y = Math.PI * lerp(0.5, 1.0, ss(62.4, 63.6, t));
  S.jets.forEach((g, i) => { g.userData.bea.material.opacity = (Math.sin(t * 6 + i) > 0.6 ? 1 : 0.1) * (1 - ss(64.8, 65.2, t)); });
  S.cars.forEach((c, i) => { const zz = c.z0 - u * 22; c.g.position.set(c.x, 0, Math.max(5 + i * 3, zz)); c.g.rotation.y = Math.PI; });
  S.cr.forEach((c, i) => { const k = clamp(u * c.sp / Math.hypot(c.tx - c.x, c.tz - c.z)), x = lerp(c.x, c.tx, k), z = lerp(c.z, c.tz, k); S.crowd.set(i, x, 0.06 * Math.abs(Math.sin(t * 10 + c.ph)), z, Math.atan2(c.tx - c.x, c.tz - c.z), 1, 0.15, 0.08 * Math.sin(t * 10 + c.ph)); }); S.crowd.done();
  const off = 1 - ss(64.8, 65.3, t); S.rwL.material.emissiveIntensity = 4 * off; S.twL.material.emissiveIntensity = 4 * off; S.flood.forEach((l) => { l.intensity = 3.0 * off; l.userData.sp.material.opacity = 0.8 * off; }); }
// ------------------------------------------------------------------ the city street, looking up
function buildCity() { const st = nightStage({ fog: '#101420', fogNear: 300, fogFar: 4000, hemi: 0.9, key: 1.4, keyCol: '#fff0d8' }), R = RNG('city'), S = { st, towers: [] };
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('st', '#2a2c30', ['#323438', '#222428']), 200, 200), roughness: 0.8 })); st.scene.add(gnd);
  const cols = ['#4a5260', '#5a5650', '#6a6a70', '#3a4048', '#7a7068', '#8a8a92'];
  for (let gx = -6; gx <= 6; gx++) for (let gz = -10; gz <= 3; gz++) { if (gx === 0) continue; const x = gx * 40 + (gx > 0 ? -8 : 8), z = gz * 40; for (let k = 0; k < 2; k++) { const w = R.r(14, 24), d = R.r(14, 30), h0 = R.r(30, 70) + 160 * Math.exp(-((gz + 4) ** 2) / 20) * R.f() * (Math.abs(gx) < 3 ? 1.3 : 0.7), h = gx < 0 && gz < 2 && gx > -4 ? Math.min(h0, 22 + 18 * -gz) : h0; const m = winLit(R.pick(cols), (gx * 31 + gz * 7 + k) & 15);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), m); b.position.set(x + (k ? 8 : -8) * Math.sign(gx), 0, z + (k ? 10 : -10)); b.castShadow = b.receiveShadow = true; st.scene.add(b); S.towers.push(m);
    const cap = mesh(new THREE.SphereGeometry(0.5, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff3020' }), b.position.x, h + 1, b.position.z); st.scene.add(cap); } }
  // the avenue: lamps, stopped cars with their lights on, people standing in the street looking up
  const lamp = STDm({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 3 }); for (let z = 100; z > -420; z -= 18) [-13, 13].forEach((x) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.1, 0.15, 8, 8).translate(0, 4, 0), IRON(), x, 0, z)); st.scene.add(mesh(new THREE.BoxGeometry(1.4, 0.2, 0.5), lamp, x - Math.sign(x) * 0.7, 8, z)); });
  S.cars = IM(new THREE.BoxGeometry(1.9, 1.4, 4.6).translate(0, 0.7, 0), STDm({ roughness: 0.3, metalness: 0.5 }), 40); const ccol = ['#c8c8cc', '#1a1a1e', '#8a1a1a', '#2a4a8a', '#e8e8ea'];
  for (let i = 0; i < 40; i++) { S.cars.setMatrixAt(i, M4c((i % 4 - 1.5) * 4.2, 0, 60 - Math.floor(i / 4) * 9 - R.r(0, 3), R.n(0.15))); S.cars.setColorAt(i, lin(R.pick(ccol))); } st.scene.add(S.cars);
  S.crowd = makeCrowd(120, { seed: 44 }); st.scene.add(S.crowd.grp); for (let i = 0; i < 120; i++) S.crowd.set(i, R.r(-11, 11), 0, R.r(-60, 40), Math.PI + R.n(0.6), 1, R.f() < 0.4 ? 0.8 : 0.1, 0); S.crowd.done();
  return S; }
// the figure in the light (2D): Jesus, recognisable by his outline — long hair to the shoulders, a beard, a tunic with a
// mantle over one shoulder, wide sleeves, arms open with the palms out, a halo; no facial features, soft and luminous
function figureIn(st, k, t) { if (k <= 0) return; const s = st.cam.position.clone().addScaledVector(L_DIR, 5000).project(st.cam); if (s.z > 1) return; const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, sc = lerp(0.8, 1.3, k);
  const P = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? (p.length > 2 ? ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]) : ctx.lineTo(p[0], p[1])) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
  const gl = (y0, y1, a, b) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  ctx.save(); screen(); ctx.translate(x, y + 30 * sc - 20 * (1 - k)); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 1.6); const sw = 4 * Math.sin(t * 0.9);
  // halo and an aura behind the body
  let g = ctx.createRadialGradient(0, -150, 30, 0, -150, 95); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(0.62, 'rgba(255,232,170,0.95)'); g.addColorStop(0.7, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -150, 95, 0, TAU); ctx.fill();
  g = ctx.createRadialGradient(0, 0, 40, 0, 0, 300); g.addColorStop(0, 'rgba(255,248,230,0.55)'); g.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 10, 230, 300, 0, 0, TAU); ctx.fill();
  ctx.shadowColor = 'rgba(255,214,140,0.95)'; ctx.shadowBlur = 26; ctx.filter = 'blur(0.8px)';
  // sleeves and open arms, hands with the palms out
  [-1, 1].forEach((d) => { ctx.fillStyle = gl(-110, 60, '#fffdf6', '#efe2c8'); P([[d * 30, -112], [d * 90, -95, d * 150, -52 + sw], [d * 168, -38 + sw], [d * 160, -6 + sw, d * 132, 40 + sw], [d * 112, 54 + sw], [d * 96, 20, d * 44, -20]]);
    ctx.fillStyle = '#f6e2c8'; ctx.beginPath(); ctx.ellipse(d * 172, -44 + sw, 13, 19, d * -0.5, 0, TAU); ctx.fill(); [0, 1, 2, 3].forEach((f) => { ctx.beginPath(); ctx.ellipse(d * (178 + f * 3.5), -64 + sw + f * 5, 3.6, 11, d * -0.35, 0, TAU); ctx.fill(); }); ctx.beginPath(); ctx.ellipse(d * 160, -52 + sw, 4, 9, d * 0.9, 0, TAU); ctx.fill(); });
  // the tunic, falling to the feet
  ctx.fillStyle = gl(-120, 250, '#fffef9', '#eadcc0'); P([[-34, -116], [-50, -108, -58, -70], [-54, 40, -84, 236], [0, 250, 84, 236], [54, 40, 58, -70], [50, -108, 34, -116]]);
  ctx.fillStyle = '#f2e0c6'; [-1, 1].forEach((d) => { ctx.beginPath(); ctx.ellipse(d * 22, 246, 15, 6, 0, 0, TAU); ctx.fill(); });
  // the mantle: from the left shoulder across the body to the right hip and down
  ctx.shadowBlur = 10; ctx.fillStyle = gl(-120, 240, '#f4e6cc', '#d8c29c'); P([[-40, -112], [-10, -60, 40, 10], [62, 60, 70, 150], [76, 220], [50, 232], [44, 140, 18, 70], [-16, 0, -46, -10], [-62, -70, -40, -112]]);
  ctx.strokeStyle = 'rgba(170,140,100,0.45)'; ctx.lineWidth = 2.2; [[-30, -80, 20, 0, 52, 120], [-36, -40, 4, 20, 34, 110], [-20, -98, 30, -30, 62, 40]].forEach(([a, b, c, d2, e, f]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c, d2, e, f); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(190,160,110,0.4)'; [-30, -10, 12].forEach((xx) => { ctx.beginPath(); ctx.moveTo(xx, 120); ctx.quadraticCurveTo(xx - 4, 180, xx - 8, 232); ctx.stroke(); });
  ctx.fillStyle = '#c8a870'; ctx.fillRect(-46, 18, 40, 7);
  // neck, long hair to the shoulders, the face (no features), the beard
  ctx.shadowBlur = 16; ctx.fillStyle = '#f2dcc0'; ctx.fillRect(-11, -132, 22, 22);
  ctx.fillStyle = gl(-196, -96, '#e8d2ae', '#cdb085'); P([[0, -196], [-36, -196, -40, -158], [-46, -128, -50, -100], [-38, -92], [-30, -100], [-26, -128, -22, -146], [0, -170], [22, -146], [26, -128, 30, -100], [38, -92], [50, -100], [46, -128, 40, -158], [36, -196, 0, -196]]);
  ctx.fillStyle = '#f6e4cc'; ctx.beginPath(); ctx.ellipse(0, -152, 20, 26, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = gl(-150, -110, '#dcc29a', '#c8a878'); P([[-20, -150], [-22, -128, -10, -114], [0, -106], [10, -114], [22, -128, 20, -150], [12, -138, 0, -137], [-12, -138, -20, -150]]);
  ctx.fillStyle = gl(-196, -170, '#e8d2ae', '#d8bf96'); P([[-22, -168], [-20, -186, 0, -190], [20, -186, 22, -168], [10, -178, 0, -176], [-10, -178, -22, -168]]);
  ctx.restore(); }


// =====================================================================
//  SHOTS — one stage per location, built lazily the first time it is drawn; each shot = fn(lt, dur, t)
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const T_ZERO = 10.0;                                   // the arena clock hits 0: every man vanishes
// ---- shared textures and props
const texWood = (key, base, dark, w = 256, h = 256) => g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let k = 0; k < 120; k++) { const y0 = R.r(0, h); x.strokeStyle = `rgba(${dark},${R.r(0.05, 0.2)})`; x.lineWidth = R.r(0.6, 2); x.beginPath(); x.moveTo(0, y0); for (let s = 0; s <= w; s += 8) x.lineTo(s, y0 + Math.sin(s * 0.03 + k) * R.r(1, 4)); x.stroke(); } for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(${dark},0.25)`; x.fillRect(0, i * h / 8, w, 1.5); } }, w, h);
const texNoise = (key, base, cols, n = 9000, w = 256) => g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 50), R.pick(cols)); speck(x, w, w, n, cols, R, 1, 2); }, w, w);
const texTiles = (key, base, line, n = 4, w = 256) => g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '0,0,0' : '255,255,255'},${R.r(0.02, 0.06)})`; x.fillRect(i * w / n, j * w / n, w / n, w / n); } x.fillStyle = line; for (let i = 0; i <= n; i++) { x.fillRect(i * w / n - 1, 0, 2, w); x.fillRect(0, i * w / n - 1, w, 2); } }, w, w);
const plane = (st, w, d, mat, x = 0, y = 0, z = 0, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; st.scene.add(m); return m; };
const box = (par, w, h, d, mat, x, y, z, ry = 0, shadow = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = shadow; m.receiveShadow = true; (par.scene || par).add(m); return m; };
const cyl = (par, r0, r1, h, mat, x, y, z, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (par.scene || par).add(m); return m; };
const pts = (st, list, size, col, map) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(list.flat(), 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ size, color: col, map: map || glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.renderOrder = 6; st.scene.add(m); return m; };
// the vanishing: a burst of light motes where a man was (points that rise and fade)
function motes(st, n = 600) { const P = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.05, color: 0xfff2d8, map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.frustumCulled = false; st.scene.add(m); return { m, P, g, n }; }
function moteBurst(M, centers, k, t, spread = 0.3, rise = 1.2) { const R = RNG('motes'); for (let i = 0; i < M.n; i++) { const c = centers[i % centers.length]; if (!c || k <= 0 || k >= 1) { M.P[i * 3 + 1] = -1e4; continue; } const a = R.r(0, TAU), r = R.r(0, spread), h = R.r(0, 1.7);
    M.P[i * 3] = c[0] + Math.cos(a) * r * (1 + k); M.P[i * 3 + 1] = c[1] + h + k * rise * R.r(0.3, 1); M.P[i * 3 + 2] = c[2] + Math.sin(a) * r * (1 + k); } M.g.attributes.position.needsUpdate = true; M.m.material.opacity = Math.sin(Math.PI * clamp(k)); }
// a suburban house: walls, gable roof, windows, door, porch
function house(st, x, z, ry, o = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; st.scene.add(g); const w = o.w || 9, d = o.d || 8, h = o.h || 5.4, wall = STDm({ map: o.siding || null, color: o.col || '#e8e0d0' }), roof = STDm({ color: o.roof || '#5a4a48', roughness: 0.9 });
  box(g, w, h, d, wall, 0, h / 2, 0); const rg = new THREE.BufferGeometry(); const P = [-w / 2 - 0.4, 0, -d / 2 - 0.4, w / 2 + 0.4, 0, -d / 2 - 0.4, 0, 2.6, -d / 2 - 0.4, -w / 2 - 0.4, 0, d / 2 + 0.4, 0, 2.6, d / 2 + 0.4, w / 2 + 0.4, 0, d / 2 + 0.4];
  const roofG = new THREE.CylinderGeometry(0.01, (w + 0.8) * 0.72, 2.6, 4, 1).rotateY(Math.PI / 4).scale(1, 1, (d + 0.8) / (w + 0.8)); const rm = new THREE.Mesh(roofG, roof); rm.position.y = h + 1.3; rm.castShadow = true; g.add(rm);
  const winM = STDm({ color: '#2c3644', roughness: 0.15, metalness: 0.3, emissive: '#ffc880', emissiveIntensity: 0 }), frame = STDm({ color: '#f6f2ea' });
  const wins = []; for (const fy of [1.5, 3.9]) for (const fx of [-w * 0.3, w * 0.3]) { box(g, 1.3, 1.5, 0.08, frame, fx, fy, d / 2 + 0.02, 0, false); wins.push(box(g, 1.1, 1.3, 0.1, winM, fx, fy, d / 2 + 0.03, 0, false)); }
  box(g, 1.2, 2.2, 0.12, STDm({ color: o.door || '#7a2a2a' }), 0, 1.1, d / 2 + 0.03); box(g, w * 0.6, 0.25, 2.2, STDm({ color: '#c8c0b0' }), 0, 0.12, d / 2 + 1.1); return { g, winM }; }
// a tree with an autumn crown of leaf cards
function tree(st, x, z, h = 6, cols = ['#d86a2a', '#e8a030', '#c8402a', '#a8b040']) { const R = RNG('tree', x * 7 + z); cyl(st, 0.14, 0.24, h * 0.6, STDm({ color: '#5a4632' }), x, h * 0.3, z, 8);
  const leaf = g3Tex((c, w) => { c.clearRect(0, 0, w, w); for (let k = 0; k < 60; k++) { c.fillStyle = R.pick(cols); c.beginPath(); c.ellipse(R.r(8, w - 8), R.r(8, w - 8), R.r(4, 9), R.r(2, 5), R.r(0, TAU), 0, TAU); c.fill(); } }, 128, 128);
  const n = 26, cr = IM(new THREE.PlaneGeometry(1, 1), STDm({ map: leaf, alphaTest: 0.4, side: THREE.DoubleSide }), n); for (let k = 0; k < n; k++) { const a = R.r(0, TAU), r = R.r(0, 1.6), s = R.r(1.2, 2.0); cr.setMatrixAt(k, M4c(x + Math.cos(a) * r, h * 0.62 + R.r(-0.8, 1.6), z + Math.sin(a) * r, R.r(0, TAU), s, s, s, R.r(-0.8, 0.8))); } st.scene.add(cr); }
// a bike (for Lucía and later her brother)
function bike(col = '#2a9d8f') { const g = new THREE.Group(), fr = STDm({ color: col, roughness: 0.4, metalness: 0.3 }), blk = STDm({ color: '#1a1a1a' }), chrome = STDm({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3 });
  const tube = (a, b, r = 0.018, m = fr) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B), c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), m); c.position.copy(A).add(B).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); c.castShadow = true; g.add(c); };
  const wheels = [0.38, -0.38].map((z) => { const w = new THREE.Group(); w.position.set(0, 0.25, z); g.add(w); const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.028, 8, 24), blk); tyre.rotation.y = Math.PI / 2; tyre.castShadow = true; w.add(tyre); for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.44, 4), chrome); sp.rotation.x = k / 8 * Math.PI; w.add(sp); } return w; });
  tube([0, 0.25, -0.38], [0, 0.5, -0.05]); tube([0, 0.5, -0.05], [0, 0.62, 0.3]); tube([0, 0.25, -0.38], [0, 0.6, -0.12]); tube([0, 0.6, -0.12], [0, 0.62, 0.3]); tube([0, 0.62, 0.3], [0, 0.25, 0.38]); tube([0, 0.62, 0.3], [0, 0.82, 0.27]);
  tube([-0.22, 0.82, 0.24], [0.22, 0.82, 0.24], 0.016, chrome); tube([0, 0.5, -0.05], [0, 0.66, -0.1]); const seat = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.1, 4, 8).rotateX(Math.PI / 2).scale(1.2, 0.5, 1), blk); seat.position.set(0, 0.68, -0.12); g.add(seat);
  [[-0.24, 0.82, 0.24], [0.24, 0.82, 0.24]].forEach((p) => { const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8).rotateZ(Math.PI / 2), STDm({ color: '#e8508a' })); gr.position.set(...p); g.add(gr); });
  [-1, 1].forEach((s) => { const st2 = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 3), STDm({ color: s < 0 ? '#e8508a' : '#f2c230' })); st2.position.set(s * 0.26, 0.74, 0.24); st2.rotation.z = s * 0.3; g.add(st2); });   // handlebar streamers
  return { g, wheels }; }
// pose a rider on a bike: sitting, hands on the bars, legs pedalling (crank angle ph)
function rideBike(P, B, x, z, yaw, ph, emo, look, headYaw = 0) { B.g.position.set(x, 0, z); B.g.rotation.y = yaw; B.wheels.forEach((w) => (w.rotation.x = -ph * 1.6));
  posePerson(P, { x: x - Math.sin(yaw) * 0.12, y: 0.66 - 0.92 * P.root.scale.y + 0.02 * Math.sin(ph * 2), z: z - Math.cos(yaw) * 0.12, yaw, lean: 0.25, headPitch: -0.2, headYaw, emo, look,
    legL: [-1.0 - 0.45 * Math.sin(ph), 1.0 + 0.5 * Math.sin(ph + 1.2)], legR: [-1.0 - 0.45 * Math.sin(ph + Math.PI), 1.0 + 0.5 * Math.sin(ph + Math.PI + 1.2)], armL: [1.0, 0.22, 0.45], armR: [1.0, 0.22, 0.45] }); }

// ===================== 1. ARENA (0-12): the countdown on the jumbotron, then every man vanishes =====================
SHOT_FN.arena = (lt, dur, t) => {
  const S = once('arena', () => { const st = makeStage({ hemi: 0.35, key: 1.6, keyCol: '#fff4e8', box: 60, boxFar: 300, fog: '#0a0c14', fogNear: 60, fogFar: 260, sunDist: 120 }); st.setSun(new THREE.Vector3(0.2, 1, 0.3));
    st.scene.background = lin('#06070c');
    const court = g3Tex((x, w, h) => { x.fillStyle = '#d8a868'; x.fillRect(0, 0, w, h); const R = RNG('court'); for (let i = 0; i < 64; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '120,70,30' : '255,230,190'},${R.r(0.04, 0.12)})`; x.fillRect(i * w / 64, 0, w / 64 - 1, h); }
      x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(20, 20, w - 40, h - 40); x.beginPath(); x.moveTo(w / 2, 20); x.lineTo(w / 2, h - 20); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 90, 0, TAU); x.stroke(); x.fillStyle = '#1f4e8a'; x.beginPath(); x.arc(w / 2, h / 2, 60, 0, TAU); x.fill();
      for (const s of [1, -1]) { x.fillStyle = 'rgba(31,78,138,0.85)'; x.fillRect(s > 0 ? 20 : w - 260, h / 2 - 110, 240, 220); x.beginPath(); x.arc(s > 0 ? 260 : w - 260, h / 2, 110, -Math.PI / 2, Math.PI / 2, s < 0); x.stroke(); x.beginPath(); x.arc(s > 0 ? 20 : w - 20, h / 2, 330, -Math.PI / 2 * 0.95, Math.PI / 2 * 0.95, s < 0); x.stroke(); } }, 1024, 560);
    plane(st, 28, 15.4, STDm({ map: court, roughness: 0.35, metalness: 0.1 }), 0, 0, 0, Math.PI / 2);
    plane(st, 60, 60, STDm({ color: '#20242c' }), 0, -0.01, 0);
    // stands: tiers on four sides; a crowd seated on them (half men)
    const tierM = STDm({ color: '#1a1e28' }), tiers = []; for (let r = 0; r < 26; r++) { const y = 0.5 + r * 0.55, off = 2 + r * 0.85; [[0, 7.7 + 2 + off, 34 + r * 1.7, 0], [0, -(7.7 + 2 + off), 34 + r * 1.7, Math.PI], [14 + 2 + off, 0, 19 + r * 1.7, -Math.PI / 2], [-(14 + 2 + off), 0, 19 + r * 1.7, Math.PI / 2]].forEach(([x, z, L, ry]) => { box(st, L, 0.55, 0.85, tierM, x, y - 0.27, z, ry, false); tiers.push([x, y, z, L, ry]); }); }
    const N = 8000, crowd = makeCrowd(N, { males: 0.5, seed: 3 }); st.scene.add(crowd.grp); const R = RNG('seats');
    crowd.L.forEach((q, i) => { const tr = tiers[Math.floor(R.f() * tiers.length)], u = R.r(-0.5, 0.5) * tr[3]; q.x = tr[0] + Math.cos(tr[4]) * u; q.z = tr[2] - Math.sin(tr[4]) * u; q.y = tr[1]; q.yaw = tr[4] + Math.PI; });
    // players: ten men on the court, a referee; two women's benches stay
    const players = makeCrowd(11, { males: 1, seed: 9, tops: ['#f2c230', '#f2c230', '#f2c230', '#f2c230', '#f2c230', '#2a4a8a', '#2a4a8a', '#2a4a8a', '#2a4a8a', '#2a4a8a', '#1a1a1a'] }); st.scene.add(players.grp);
    // the jumbotron: four screens with a live canvas (GAME TIME, the countdown, then the falling counter)
    const jc = document.createElement('canvas'); jc.width = 512; jc.height = 288; const jt = new THREE.CanvasTexture(jc); jt.encoding = THREE.sRGBEncoding;
    const jb = new THREE.Group(); jb.position.set(0, 13, 0); st.scene.add(jb); box(jb, 7.4, 4.4, 7.4, STDm({ color: '#101218' }), 0, 0, 0);
    for (let k = 0; k < 4; k++) { const sc = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 3.8), new THREE.MeshBasicMaterial({ map: jt, toneMapped: false })); sc.position.set(Math.sin(k * Math.PI / 2) * 3.72, 0, Math.cos(k * Math.PI / 2) * 3.72); sc.rotation.y = k * Math.PI / 2; jb.add(sc); }
    const led = g3Tex((x, w, h) => { const cs = ['#38e070', '#e83a3a', '#f2c230', '#3a8ae8', '#e8508a']; for (let i = 0; i < 12; i++) { x.fillStyle = cs[i % 5]; x.fillRect(i * w / 12, 0, w / 12, h); x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = 'bold 20px sans-serif'; x.fillText(['VELTRO', 'ZENTARO', 'BRAXI', 'ALTERBASE'][i % 4], i * w / 12 + 6, h * 0.65); } }, 1024, 32);
    led.wrapS = THREE.RepeatWrapping; const ring = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 0.5, 40, 1, true), new THREE.MeshBasicMaterial({ map: led, side: THREE.DoubleSide, toneMapped: false })); ring.position.y = 15.5; st.scene.add(ring); const ring2 = ring.clone(); ring2.position.y = 10.6; st.scene.add(ring2);
    [[0, 9.2, 30, 0], [0, -9.2, 30, Math.PI]].forEach(([x, z, L, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.9), new THREE.MeshBasicMaterial({ map: led, toneMapped: false })); m.position.set(x, 0.45, z); m.rotation.y = ry; st.scene.add(m); });
    const spot = []; for (let k = 0; k < 8; k++) { const l = new THREE.SpotLight(0xfff0dc, 0.9, 80, 0.5, 0.6); l.position.set(Math.cos(k / 8 * TAU) * 18, 26, Math.sin(k / 8 * TAU) * 12); l.target.position.set(0, 0, 0); st.scene.add(l, l.target); spot.push(l); }
    return { st, crowd, players, jc, jt, M: motes(st, 1800) }; });
  const { st, crowd, players, jc, jt, M } = S, z = T_ZERO, vk = ss(z, z + 0.5, t);
  // jumbotron canvas
  { const x = jc.getContext('2d'), w = jc.width, h = jc.height; const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6); g.addColorStop(0, '#5a9af0'); g.addColorStop(1, '#0c2a6a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) { x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 6; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.cos(i / 18 * TAU + t * 0.4) * w, h / 2 + Math.sin(i / 18 * TAU + t * 0.4) * w); x.stroke(); }
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; const n = Math.ceil(z - t);
    if (t < z - 6) { x.font = 'bold 70px sans-serif'; x.fillText('GAME TIME', w / 2, h / 2); } else if (t < z) { const f = mod(z - t, 1); x.font = `bold ${Math.round(150 + 40 * f)}px sans-serif`; x.shadowColor = '#fff'; x.shadowBlur = 30; x.fillText(String(Math.min(6, n)), w / 2, h / 2); x.shadowBlur = 0; }
    else { x.font = 'bold 120px sans-serif'; x.fillStyle = '#ff4040'; x.fillText('0', w / 2, h / 2); } jt.needsUpdate = true; }
  // crowd: seated and cheering; at zero the men are gone (motes), the women jump up, hands to their heads
  const centers = []; crowd.L.forEach((q, i) => { const cheer = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + q.ph)) * ss(z - 6, z - 4, t) * (t < z ? 1 : 0), shock = ss(z + 0.4, z + 1.4, t);
    const gone = q.male ? vk : 0; if (q.male && t > z - 0.05 && t < z + 0.8 && i % 2 === 0) centers.push([q.x, q.y, q.z]);
    crowd.set(i, q.x, q.y + (t < z ? 0.05 * cheer * Math.abs(Math.sin(t * 6 + q.ph)) : 0.1 * shock), q.z, q.yaw, 1, t < z ? cheer : 0.55 * shock, 0, gone); }); crowd.done();
  players.L.forEach((q, i) => { const a = i / 11 * TAU + t * 0.2, px = Math.cos(a) * (i < 10 ? 2.5 + (i % 5) * 1.6 : 0.5), pz = Math.sin(a * 1.3) * 4; if (t > z - 0.05 && t < z + 0.8) centers.push([px, 0, pz]); players.set(i, px, 0, pz, a, 1.1, 0, 0, vk); }); players.done();
  moteBurst(M, centers, seg(t, z, z + 1.6), t, 0.25, 1.4);
  // the camera: high over the stands, slowly pushing in; after zero it drops toward the stunned crowd
  const k = EZ.io(seg(t, 0, z)), k2 = EZ.io(seg(t, z + 0.3, dur));
  camLook(st.cam, lerp(-6, -3, k) + 3 * k2, lerp(17, 13, k) + 1 * k2, lerp(28, 22, k) - 1 * k2, 0, lerp(4, 8, k) - 2 * k2, -4 * k2); st.cam.fov = 54; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 1 + 3 * ss(z, z + 0.3, t) * (1 - ss(z + 0.8, z + 2, t)));
  renderStage(st, 1.1); bloom(0.35);
  if (t >= z && t < z + 0.25) pvTint('#ffffff', 0.5 * (1 - seg(t, z, z + 0.25)));
};

// ===================== 2. BIKE (12-25): Lucía learns to ride, her father holds the seat — then he is gone =====================
const LUCIA = { female: true, kid: true, skin: SKINS[1], hair: '#4a3020', hairStyle: 'pigtails', top: '#f2c230', bottom: '#3a6ab0', shorts: true, iris: '#3a5a2a', seed: 11, tie: '#e8508a' };
const ANA = { female: true, skin: SKINS[1], hair: '#4a3020', hairStyle: 'pony', top: '#c8372d', bottom: '#2b3a55', iris: '#3a5a2a', seed: 21, tie: '#2a2a2a' };
function suburb(st, seedKey = 'sub') { const R = RNG(seedKey);
  const asph = wrap(texNoise('asph', '#4c4c50', ['rgba(20,20,22,0.35)', 'rgba(140,140,140,0.25)']), 6, 60), grass = wrap(texNoise('grass', '#5a8a3a', ['rgba(40,70,20,0.4)', 'rgba(140,170,70,0.35)', 'rgba(200,150,60,0.25)'], 14000), 20, 60), walk = wrap(texTiles('walk', '#c8c2b6', 'rgba(80,76,70,0.5)', 4), 1, 40);
  plane(st, 8, 420, STDm({ map: asph }), 0, 0, -50); [-1, 1].forEach((s) => { plane(st, 2, 420, STDm({ map: walk }), s * 5, 0.06, -50); plane(st, 40, 420, STDm({ map: grass }), s * 26, 0.03, -50); plane(st, 3, 420, STDm({ map: grass }), s * 7.5, 0.04, -50); box(st, 0.25, 0.15, 420, STDm({ color: '#b8b2a6' }), s * 4.05, 0.07, -50, 0, false); });
  const lines = []; for (let z = 150; z > -250; z -= 6) lines.push(box(st, 0.12, 0.01, 3, STDm({ color: '#e8d870' }), 0, 0.01, z, 0, false));
  const houses = []; [-1, 1].forEach((s) => { for (let z = 150; z > -250; z -= R.r(13, 16)) houses.push(house(st, s * 12.5, z, s > 0 ? -Math.PI / 2 : Math.PI / 2, { col: R.pick(['#e8e0d0', '#c8d8e0', '#e8d8b8', '#d8c8c8', '#b8c8b0', '#f0ece4']), roof: R.pick(['#5a4a48', '#3a4048', '#6a3a30']), door: R.pick(['#7a2a2a', '#2a4a6a', '#2a5a3a']) })); });
  for (let z = 150; z > -250; z -= 11) [-1, 1].forEach((s) => tree(st, s * (7.2 + R.r(-0.4, 0.4)), z + R.r(-2, 2), R.r(6, 8.5)));
  // fallen leaves on the ground
  const lf = IM(new THREE.PlaneGeometry(0.12, 0.08).rotateX(-Math.PI / 2), STDm({ roughness: 0.9 }), 1500, false); for (let i = 0; i < 1500; i++) { lf.setMatrixAt(i, M4c(R.r(-10, 10), 0.035, R.r(-120, 120), R.r(0, TAU))); lf.setColorAt(i, lin(R.pick(['#d86a2a', '#e8a030', '#c8402a', '#a87a30']))); } st.scene.add(lf);
  return { houses }; }
SHOT_FN.bike = (lt, dur, t) => {
  const S = once('bike', () => { const st = makeStage({ skyTop: '#7aa8d8', skyHor: '#f0dcc0', hemi: 0.75, key: 2.6, keyCol: '#ffe0b8', box: 18, fog: '#e8d8c0', fogNear: 40, fogFar: 220 }); suburb(st);
    const L = makePerson(LUCIA), D = makePerson({ skin: SKINS[2], hair: '#2a1d16', hairStyle: 'short', top: '#2a6a62', bottom: '#3a3a3a', seed: 12, height: 1.05, cap: '#1f2d3d' }), B = bike();
    [L.root, D.root, B.g].forEach((m) => st.scene.add(m)); return { st, L, D, B, M: motes(st, 400) }; });
  const { st, L, D, B, M } = S, TV = 2.6, run = lt * 2.2, z = 6 - run, ph = lt * 5.2;
  // she pedals down the street (getting steadier); dad jogs beside her holding the seat until he vanishes
  const wob = 0.06 * Math.sin(lt * 3.1) * (1 - ss(1, 6, lt)), stopK = ss(dur - 2.6, dur - 1.2, lt), zz = z + stopK * 1.2;
  const look = lt > 8.6 ? 1 : 0, react = ss(8.8, 9.6, lt);
  rideBike(L, B, 0.4 + wob, zz, Math.PI + wob * 0.5, ph * (1 - stopK), { smile: 1 - react, open: 0.4 * (1 - react) + 0.5 * react, surprise: react * 0.7, fear: react * 0.6, sad: react * 0.3 }, [0, 0], look * 1.15 * react);
  posePerson(D, { x: 1.0, z: z + 0.25, yaw: Math.PI, walk: 0, run: 0.55, ph: lt * 9, lean: 0.35, armL: [0.9, 0.25, 0.4], armR: [0.4, 0.1, 0.3], headYaw: -0.4, emo: { smile: 0.8, open: 0.3 }, look: [-0.5, -0.2] });
  vanish(D, ss(TV, TV + 0.4, lt)); moteBurst(M, [[1.0, 0, z + 0.25]], seg(lt, TV, TV + 1.4), t, 0.2, 1.0);
  // camera: low, in front of her, travelling backwards with her; after he vanishes it slowly rises
  const cz = zz - 3.4 - 0.3 * Math.sin(lt * 0.4);
  const orb = EZ.io(seg(lt, 7.6, 9.4)) * 1.35, cr = 3.3; camLook(st.cam, 0.4 + Math.sin(orb) * cr + 0.3 * Math.sin(lt * 0.3) * (1 - orb), 1.0 + 0.25 * ss(5, 9, lt), zz - Math.cos(orb) * cr, 0.4, 0.95, zz + 0.1); st.cam.fov = 46; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.8, 2);
  st.setSun(dirV(-130 * DEG, 24 * DEG), new THREE.Vector3(0, 0, zz)); renderStage(st, 1.05); bloom(0.25);
};

// ===================== 3. COCKPIT (25-33): nobody at the controls; the headset swings; the sea of clouds =====================
SHOT_FN.cockpit = (lt, dur, t) => {
  const S = once('cockpit', () => { const st = makeStage({ skyTop: '#2a5aa8', skyHor: '#a8c8ec', hemi: 1.3, sky: 0xdfe8f4, ground: 0x8a7a68, key: 2.6, keyCol: '#ffd8a8', box: 4 }); st.setSun(dirV(20 * DEG, 12 * DEG));
    const dash = STDm({ color: '#2a2e34', roughness: 0.7 }), seatM = STDm({ color: '#3a3e48', roughness: 0.9 }), cream = STDm({ color: '#4a4e56' });
    box(st, 3.2, 0.9, 1.2, dash, 0, 0.75, -1.4); box(st, 3.4, 0.15, 2.2, cream, 0, 2.45, -0.6); box(st, 0.4, 0.9, 1.4, dash, 0, 0.6, -0.4);
    const panel = g3Tex((x, w, h) => { x.fillStyle = '#16181c'; x.fillRect(0, 0, w, h); const R = RNG('panel'); for (let k = 0; k < 6; k++) { const px = 20 + k * 165; x.fillStyle = '#0a1a2a'; x.fillRect(px, 30, 140, 110); x.strokeStyle = '#38e070'; x.lineWidth = 2; x.beginPath(); x.arc(px + 70, 85, 40, 0, TAU); x.stroke(); x.fillStyle = '#3a8ae8'; x.fillRect(px + 10, 40, 120, 40); x.fillStyle = '#8a5a2a'; x.fillRect(px + 10, 80, 120, 50); }
      for (let k = 0; k < 120; k++) { x.fillStyle = R.pick(['#e8e8e0', '#f2c230', '#38e070', '#e83a3a']); x.fillRect(R.r(10, w - 10), R.r(160, h - 10), 6, 4); } }, 1024, 256);
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.75), new THREE.MeshStandardMaterial({ map: panel, emissive: '#ffffff', emissiveMap: panel, emissiveIntensity: 0.8 })); pm.position.set(0, 1.1, -0.85); pm.rotation.x = -0.6; st.scene.add(pm);
    [-0.75, 0.75].forEach((x) => { box(st, 0.6, 0.12, 0.6, seatM, x, 0.55, 0.4); box(st, 0.6, 0.9, 0.14, seatM, x, 1.05, 0.72, 0); box(st, 0.4, 0.18, 0.1, seatM, x, 1.58, 0.72); const y = new THREE.Group(); y.position.set(x, 0.95, -0.55); st.scene.add(y); box(y, 0.04, 0.4, 0.04, dash, 0, 0, 0); box(y, 0.32, 0.05, 0.05, dash, 0, 0.2, 0); });
    const hs = new THREE.Group(); hs.position.set(0.75, 1.62, 0.65); st.scene.add(hs); const band = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 16, Math.PI), STDm({ color: '#1a1a1a' })); hs.add(band); [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 14).rotateZ(Math.PI / 2), STDm({ color: '#1a1a1a' })); c.position.set(s * 0.11, 0, 0); hs.add(c); });
    // the window frame and the sea of clouds outside (sprites drifting toward and under the plane)
    [[-1.6, 1.4, -1.9, 0.2], [1.6, 1.4, -1.9, -0.2], [0, 1.95, -1.95, 0]].forEach(([x, y, z, ry]) => box(st, x ? 0.18 : 3.4, x ? 1.3 : 0.12, 0.2, cream, x, y, z, ry));
    const ct = g3Tex((x, w) => { const R = RNG('cl'); for (let i = 0; i < 90; i++) { const px = w / 2 + R.n(w * 0.22), py = w / 2 + R.n(w * 0.1), s = R.r(w * 0.06, w * 0.18); const g = x.createRadialGradient(px, py - s * 0.3, 0, px, py, s); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.6, 'rgba(250,220,200,0.25)'); g.addColorStop(1, 'rgba(240,200,180,0)'); x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 256, 256);
    const clouds = []; const R = RNG('clouds'); for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, depthWrite: false, fog: false })); s.userData = { x: R.r(-300, 300), y: R.r(-40, -8), z: R.r(-1400, -40), w: R.r(80, 220) }; s.renderOrder = -1; st.scene.add(s); clouds.push(s); }
    [-0.55, 0.55].forEach((x) => box(st, 0.07, 1.0, 0.07, cream, x, 1.45, -1.85));
    const warn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: '#ff3020', toneMapped: false })); warn.position.set(0, 1.22, -0.92); warn.rotation.x = -0.6; st.scene.add(warn);
    return { st, hs, clouds, warn }; });
  const { st, hs, clouds, warn } = S; warn.visible = Math.sin(lt * 7) > 0;
  clouds.forEach((s) => { const u = s.userData, z = -1400 + mod(u.z + 1400 + lt * 140, 1400); s.position.set(u.x, u.y, z); s.scale.set(u.w, u.w * 0.4, 1); });
  hs.rotation.set(0.25 * Math.sin(lt * 1.6), 0, 0.3 * Math.sin(lt * 1.1));
  camLook(st.cam, 0.1 + 0.2 * Math.sin(lt * 0.2), 1.75, 2.4 - lt * 0.05, 0, 1.45, -3); st.cam.fov = 64; st.cam.updateProjectionMatrix(); handheld(st.cam, t, 1.2, 4); st.cam.rotation.z += 0.03 * Math.sin(lt * 0.6);
  renderStage(st, 1.05); bloom(0.35);
};

// ===================== 4. VIGIL (33-45): a square full of candles; Ana holds Lucía =====================
SHOT_FN.vigil = (lt, dur, t) => {
  const S = once('vigil', () => { const st = makeStage({ hemi: 0.4, sky: 0x4a5a7a, ground: 0x1a1410, key: 0.25, keyCol: '#8aa0d0', box: 30, fog: '#0a0c14', fogNear: 20, fogFar: 160 }); st.setSun(dirV(40 * DEG, 50 * DEG)); st.scene.background = lin('#05060a');
    plane(st, 200, 200, STDm({ map: wrap(texTiles('plaza', '#6a625a', 'rgba(20,18,16,0.6)', 6), 40, 40), roughness: 0.6 }), 0, 0, 0);
    const N = 2600, crowd = makeCrowd(N, { males: 0, kids: 0.12, seed: 5 }); st.scene.add(crowd.grp); const R = RNG('vig');
    crowd.L.forEach((q) => { let x, z; do { x = R.r(-24, 24); z = R.r(-40, 7); } while (Math.hypot(x, z) < 2.4); q.x = x; q.z = z; q.yaw = R.r(-0.6, 0.6) + Math.PI * (R.f() < 0.15 ? 1 : 0); });
    const candles = []; crowd.L.forEach((q) => { if (R.f() < 0.8) candles.push([q.x + 0.15, 1.05 * q.s, q.z + 0.2]); }); for (let k = 0; k < 3000; k++) candles.push([R.r(-26, 26), 0.06, R.r(-42, 8)]);
    const cp = pts(st, candles, 0.9, 0xffc070); const lights = []; for (let k = 0; k < 6; k++) { const l = new THREE.PointLight(0xffb060, 0.7, 7, 2); l.position.set(R.r(-3, 3), 0.6, R.r(-3, 2)); st.scene.add(l); lights.push(l); }
    const A = makePerson(ANA), L = makePerson(LUCIA); A.root.add; st.scene.add(A.root, L.root);
    const hc = cyl(st, 0.025, 0.025, 0.12, STDm({ color: '#f4efe4', emissive: '#ffc070', emissiveIntensity: 0.3 }), 0, 0, 0);
    return { st, crowd, cp, lights, A, L, hc }; });
  const { st, crowd, cp, lights, A, L, hc } = S;
  crowd.L.forEach((q, i) => crowd.set(i, q.x, 0, q.z, q.yaw, 1, 0.15, 0.04 * Math.sin(t * 0.8 + q.ph), 0)); crowd.done();
  cp.material.size = 0.85 + 0.08 * Math.sin(t * 9); lights.forEach((l, i) => (l.intensity = 0.7 * (0.85 + 0.15 * Math.sin(t * 11 + i))));
  // Ana kneels and holds Lucía; both cry; Lucía holds a candle
  const hug = ss(1.5, 3.5, lt);
  posePerson(A, { x: 0.32, z: 0.05, yaw: -0.4, kneel: 1, lean: 0.15, headPitch: 0.15, headYaw: 0.35 * hug, headRoll: 0.15 * hug, emo: { cry: 0.9, sad: 1 }, cryShake: 1, armR: [1.1 * hug + 0.2, -0.55 * hug, 1.3 * hug], armL: [0.7, 0.15, 1.5], look: [0.3, -0.3] });
  posePerson(L, { x: -0.12, z: -0.05, yaw: 0.25, headRoll: -0.15 * hug, emo: { cry: 1, sad: 1, tremble: 0.6 }, cryShake: 1, headPitch: -0.15, headYaw: 0.3 * hug, armR: [0.9, 0.1, 1.4], armL: [0.5 + 0.4 * hug, 0.4, 1.0], look: [-0.2, 0.2] });
  L.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); L.arms[1].hand.getWorldPosition(hp); hc.position.set(hp.x, hp.y + 0.06, hp.z);
  // camera: starts high over the sea of candles, descends onto the two of them
  const k = EZ.io(seg(lt, 0, 7));
  camLook(st.cam, lerp(4, 0.15, k), lerp(9, 1.1, k), lerp(16, 2.3, k), 0.1, lerp(0.5, 0.92, k), lerp(-12, -0.1, k)); st.cam.fov = lerp(50, 38, k); st.cam.updateProjectionMatrix(); handheld(st.cam, t, 0.6, 5);
  renderStage(st, 1.1); bloom(0.45);
};

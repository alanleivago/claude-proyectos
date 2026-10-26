// =====================================================================
//  WORLD — "Cómo te encuentra un AirTag" (three.js r149), metres. Places:
//  the train station at night (origin: the waiting hall, benches, pillars, departure board, the mustard suitcase),
//  the exploded AirTag (x = -60, a dark stage), and the city at night (x = 300: blocks with lit windows, streets,
//  the station shed, a bus). The Bluetooth range is a cyan wire dome; reports are yellow beams and pins.
// =====================================================================
const SC = { x: 0, z: 0 };            // the suitcase's spot in the hall
const AT_S = 2.6;                      // the AirTag is drawn 2.6× its size (8 cm): "ILUSTRATIVO"
const CITY = 300, BLK = 6, NB = 13;   // city origin x, block pitch, blocks per side
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.background = lin('#0a0d14'); scene.fog = new THREE.Fog(lin('#0a0d14'), 14, 60);
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.01, 900); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0xa8b4e0, 0x141826, 0.8));
  const key = new THREE.DirectionalLight(0xfff2dc, 1.25); key.position.set(-5, 10, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x8ab8d0, 0.25); rim.position.set(6, 4, -8); scene.add(rim);

  // ---- the hall: polished tile floor, benches, pillars, the back wall with the departure board, roof trusses
  const hall = new THREE.Group();
  const floorT = g3Tex((x, w) => { x.fillStyle = '#2a3140'; x.fillRect(0, 0, w, w); const R = RNG('tile'); for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { x.fillStyle = hexMix('#252c3a', '#323a4c', R.f()); x.fillRect(a * 64 + 1, b * 64 + 1, 62, 62); } }, 512, 512, [10, 8]);
  hall.add(mesh(new THREE.PlaneGeometry(48, 36), std('#ffffff', { map: floorT, r: 0.8, m: 0 }), 0, 0, -4, { rx: -Math.PI / 2, cast: false }));
  const seatM = std('#4a5670', { r: 0.6, m: 0.2 }), legM = std('#2a2f3a', { r: 0.4, m: 0.6 });
  const benches = [];
  for (let row = 0; row < 4; row++) for (let col = -2; col <= 2; col++) {
    const bx = col * 3.4, bz = -1.6 - row * 2.4, b = new THREE.Group();
    for (let s = 0; s < 4; s++) { b.add(mesh(rrBox(0.56, 0.06, 0.48, 0.03), seatM, -0.9 + s * 0.6, 0.46, 0, { rx: -Math.PI / 2 })); b.add(mesh(rrBox(0.56, 0.5, 0.05, 0.03), seatM, -0.9 + s * 0.6, 0.74, -0.24)); }
    b.add(mesh(new THREE.BoxGeometry(2.5, 0.05, 0.08), legM, 0, 0.4, 0)); for (const lx of [-1.1, 1.1]) b.add(mesh(new THREE.BoxGeometry(0.06, 0.42, 0.4), legM, lx, 0.2, 0));
    b.position.set(bx, 0, bz); hall.add(b); benches.push(b);
  }
  const pilM = std('#3a4256', { r: 0.7 });
  for (let k = -3; k <= 3; k++) for (const pz of [-10, 2.5]) { if (pz > 0 && Math.abs(k) < 2) continue; hall.add(mesh(new THREE.BoxGeometry(0.6, 9, 0.6), pilM, k * 5, 4.5, pz)); }
  hall.add(mesh(new THREE.PlaneGeometry(48, 10), std('#262c3a', { r: 0.9 }), 0, 5, -12, { cast: false }));
  // the departure board: a dark panel with amber rows (code-drawn), a clock beside it
  const boardT = g3Tex((x, w, h) => { x.fillStyle = '#0c0e12'; x.fillRect(0, 0, w, h); x.font = `700 34px ${S3.font}`; x.fillStyle = '#f2b632'; x.fillText('SALIDAS', 24, 46);
    const rows = [['22:10', 'NORTE 4', '3'], ['22:25', 'COSTA', '7'], ['22:40', 'VALLE ALTO', '2'], ['22:55', 'AEROPUERTO', '5'], ['23:05', 'SIERRA', '1']];
    x.font = `700 26px ${S3.font}`; rows.forEach(([t, d, a], i) => { const y = 100 + i * 42; x.fillStyle = '#f2c86a'; x.fillText(t, 24, y); x.fillText(d, 140, y); x.fillText('VÍA ' + a, w - 130, y); }); }, 512, 320);
  hall.add(mesh(new THREE.BoxGeometry(5.2, 3.25, 0.12), std('#14161c', { r: 0.4 }), -3, 5.2, -11.9));
  hall.add(mesh(new THREE.PlaneGeometry(5.0, 3.1), basic('#ffffff', { map: boardT }), -3, 5.2, -11.83, { cast: false }));
  hall.add(mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 40), std('#f4f1ea', { r: 0.4, em: '#3a3a30' }), 4, 5.6, -11.85, { rx: Math.PI / 2 }));
  for (const [len, a] of [[0.45, 0.6], [0.32, 2.4]]) hall.add(mesh(new THREE.BoxGeometry(0.04, len, 0.02), basic('#16161c'), 4 + Math.sin(a) * len / 2, 5.6 + Math.cos(a) * len / 2, -11.78, { rz: -a, cast: false }));
  // roof: arched trusses with cool glass light
  const trussM = basic('#3a4a66');
  for (let k = -4; k <= 4; k++) { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = Math.PI * u; pts.push(V3(k * 5, 9 + 2.5 * Math.sin(a), -12 + 15 * u)); } const geo = new THREE.BufferGeometry().setFromPoints(pts); hall.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: lin('#3a4a66'), toneMapped: false }))); }
  // ceiling lamps: soft pools
  for (let k = -2; k <= 2; k++) { const l = new THREE.PointLight(0xffe2b8, 0.7, 10, 1.6); l.position.set(k * 5, 6, -3); scene.add(l); }
  scene.add(hall);

  // ---- the suitcase (mustard hard shell, ribs, wheels, telescoping handle) with the AirTag in a tan holder
  const suit = buildSuitcase(); suit.position.set(SC.x, 0, SC.z); scene.add(suit);

  // ---- the exploded AirTag (x = -60): cap, antenna board, battery, steel back, on a dark plinth
  const exp = new THREE.Group(); exp.position.set(-60, 0, 0);
  exp.add(mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 48), std('#161a24', { r: 0.6 }), 0, -0.1, 0));
  const S = 0.032 * 30;   // the parts at 30× (a 32 mm disc → ~1 m)
  const cap = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.22], [0.25, 0.21], [0.4, 0.17], [0.48, 0.09], [0.5, 0.02], [0.5, 0]].map(([a, b]) => new THREE.Vector2(a * S, b * S)), 48), std('#f4f4f2', { r: 0.25 }));
  cap.castShadow = true; exp.add(cap);
  const pcb = new THREE.Group(); pcb.add(mesh(new THREE.CylinderGeometry(0.45 * S, 0.45 * S, 0.03 * S, 48), std('#1a2a44', { r: 0.5 })));
  pcb.add(mesh(new THREE.BoxGeometry(0.16 * S, 0.03 * S, 0.16 * S), std('#3a8ae8', { r: 0.3, em: '#1a4a9a', ei: 0.6 }), 0, 0.03 * S, 0));
  for (let k = 0; k < 6; k++) pcb.add(mesh(new THREE.BoxGeometry(0.05 * S, 0.02 * S, 0.03 * S), std('#8a8a90', { m: 0.6, r: 0.3 }), Math.cos(k) * 0.28 * S, 0.025 * S, Math.sin(k) * 0.28 * S));
  pcb.add(mesh(new THREE.TorusGeometry(0.38 * S, 0.008 * S, 6, 64), std('#c8a040', { m: 0.8, r: 0.3 }), 0, 0.02 * S, 0, { rx: Math.PI / 2 }));
  exp.add(pcb);
  const bat = mesh(new THREE.CylinderGeometry(0.3 * S, 0.3 * S, 0.05 * S, 48), std('#c8ccd4', { m: 0.85, r: 0.25 })); exp.add(bat);
  const back = new THREE.Group(); back.add(mesh(new THREE.CylinderGeometry(0.5 * S, 0.48 * S, 0.04 * S, 48), std('#b8bcc4', { m: 0.9, r: 0.2 }))); back.add(mesh(new THREE.TorusGeometry(0.3 * S, 0.012 * S, 8, 48), std('#8a8e96', { m: 0.9, r: 0.3 }), 0, 0.025 * S, 0, { rx: Math.PI / 2 })); exp.add(back);
  scene.add(exp);

  // ---- the city at night (x = 300): blocks with lit windows, streets, the station shed, a bus
  const city = new THREE.Group(); city.position.set(CITY, 0, 0);
  city.add(mesh(new THREE.PlaneGeometry(NB * BLK + 200, NB * BLK + 200), std('#222c3c', { r: 0.95 }), 0, -0.02, 0, { rx: -Math.PI / 2, cast: false }));
  // the reference's city: flat slate-blue blocks, a few warm windows (sparse), no window grid
  const winT = g3Tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); }, 8, 8);
  const winE = g3Tex((x, w, h) => { x.fillStyle = '#000000'; x.fillRect(0, 0, w, h); const R = RNG('win'); for (let a = 0; a < 8; a++) for (let b = 0; b < 16; b++) if (R.f() < 0.045) { x.fillStyle = R.f() < 0.8 ? '#ffc870' : '#cfe4ff'; x.fillRect(a * 32 + 11, b * 32 + 10, 10, 12); } }, 256, 512);
  const bldM = new THREE.MeshStandardMaterial({ color: lin('#28324a'), roughness: 0.95, emissive: lin('#ffffff'), emissiveMap: winE, emissiveIntensity: 0.9 });
  const roofM = std('#323e58', { r: 0.95 });
  const bld = [], R = RNG('city');
  for (let a = 0; a < NB; a++) for (let b = 0; b < NB; b++) {
    const cx = (a - (NB - 1) / 2) * BLK, cz = (b - (NB - 1) / 2) * BLK;
    if (Math.abs(cx) < BLK && Math.abs(cz) < 1) continue;   // the station block
    for (let q = 0; q < 4; q++) { const ox = (q % 2 ? 1 : -1) * 1.15, oz = (q > 1 ? 1 : -1) * 1.15, d = Math.hypot(cx, cz), hh = R.r(0.9, 2.6) + (d > 12 && R.f() < 0.15 ? R.r(1.5, 4) : 0);
      bld.push([cx + ox + R.n(0.15), cz + oz + R.n(0.15), R.r(1.5, 2.1), hh, R.r(1.5, 2.1)]); }
  }
  const bG = new THREE.BoxGeometry(1, 1, 1); { const uv = bG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i)); }
  const bI = new THREE.InstancedMesh(bG, [bldM, bldM, roofM, roofM, bldM, bldM], bld.length);
  bld.forEach(([x, z, w, h, d], k) => { _m4.compose(V3(x, h / 2, z), _q4, V3(w, h, d)); bI.setMatrixAt(k, _m4); });
  bI.castShadow = false; bI.receiveShadow = true; city.add(bI);
  // street lights: tiny warm dots along the avenues
  { const pts = []; for (let a = 0; a <= NB; a++) for (let s = -NB * BLK / 2; s < NB * BLK / 2; s += 1.5) { const v = (a - NB / 2) * BLK; pts.push(v, 0.15, s, s, 0.15, v); } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); city.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: lin('#ffb860'), size: 0.07, toneMapped: false, transparent: true, opacity: 0.5 }))); }
  // the station shed: a long arched roof
  const shed = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 9, 24, 1, true, 0, Math.PI), std('#4a5a74', { r: 0.8, side: THREE.DoubleSide })); shed.rotation.set(0, 0, Math.PI / 2); shed.rotation.y = 0; shed.position.set(0, 0, 0);
  const shedG = new THREE.Group(); shedG.add(shed); shed.rotation.set(Math.PI / 2, 0, Math.PI / 2); shed.position.y = 0; shedG.add(mesh(new THREE.BoxGeometry(9, 0.3, 5), std('#2a3242'), 0, 0.15, 0)); city.add(shedG);
  // the bus
  const bus = new THREE.Group(); bus.add(mesh(rrBox(2.4, 0.75, 0.8, 0.12), std('#2f6fd1', { r: 0.5 }), 0, 0.5, 0));
  bus.add(mesh(new THREE.BoxGeometry(2.1, 0.22, 0.82), basic('#ffe0a0'), 0.05, 0.62, 0, { cast: false }));
  for (const wx of [-0.75, 0.75]) for (const wz of [-0.4, 0.4]) bus.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16), std('#16161a'), wx, 0.15, wz, { rx: Math.PI / 2 }));
  bus.children[0].rotation.y = 0; city.add(bus);
  scene.add(city);

  // ---- people (pov3d rig): walkers with phones, "you" in teal, a crowd for the network shots
  const people = [];
  const mk = (seed, o, ph = true) => { const p = randomPerson(seed, o); scene.add(p); people.push(p); if (ph) { const f = buildPhone('#1a1c22'); f.scale.setScalar(1.2); p.userData.arms[1].userData.el.add(f); f.position.set(0.02, -0.29, 0.06); f.rotation.set(-1.1, 0, 0); p.userData.phone = f; paintScr(f, screenHome, {}); } return p; };
  const walker = mk(7, { shirt: '#c2185b', pants: '#2b3a55' });   // the stranger
  const walker2 = mk(19, { shirt: '#3cae5c', pants: '#3a3a3a' }), walker3 = mk(23, { shirt: '#7b4fc9', pants: '#c8b89a' });
  const you = mk(31, { shirt: '#2a9d8f', pants: '#1f2d3d', skin: '#d4a07a', hair: '#2a1d16' });
  const crowd = []; for (let k = 0; k < 26; k++) crowd.push(mk(100 + k, {}, true));
  const porter = mk(61, { shirt: '#f0c33c', pants: '#1f2d3d' }, false);

  // ---- the Bluetooth dome (wire hemisphere), the phone ring, the ground ring, beams, pins, sparks
  const dome = new THREE.Group();
  { const p = []; for (let i = 1; i <= 7; i++) { const a = (i / 8) * Math.PI / 2, y = Math.sin(a), rr = Math.cos(a); for (let k = 0; k < 64; k++) { const b0 = (k / 64) * TAU, b1 = ((k + 1) / 64) * TAU; p.push(rr * Math.cos(b0), y, rr * Math.sin(b0), rr * Math.cos(b1), y, rr * Math.sin(b1)); } }
    for (let m = 0; m < 24; m++) { const b = (m / 24) * TAU; for (let i = 0; i < 16; i++) { const a0 = (i / 16) * Math.PI / 2, a1 = ((i + 1) / 16) * Math.PI / 2; p.push(Math.cos(a0) * Math.cos(b), Math.sin(a0), Math.cos(a0) * Math.sin(b), Math.cos(a1) * Math.cos(b), Math.sin(a1), Math.cos(a1) * Math.sin(b)); } }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    dome.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false })));
    dome.add(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })));
    const base = new THREE.Mesh(new THREE.RingGeometry(0.985, 1.0, 96), new THREE.MeshBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); base.rotation.x = -Math.PI / 2; base.position.y = 0.01; dome.add(base); }
  scene.add(dome);
  const ringMat = () => new THREE.MeshBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.95, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
  const rings = [...Array(12)].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), ringMat()); m.visible = false; scene.add(m); return m; });
  const beams = [...Array(30)].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: lin('#f2b632'), transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); return m; });
  const pins = [...Array(24)].map(() => { const g = new THREE.Group(), m = std('#f2b632', { r: 0.35, em: '#7a5410', ei: 0.7 });
    g.add(mesh(new THREE.SphereGeometry(0.26, 24, 16), m, 0, 0.9, 0)); g.add(mesh(new THREE.ConeGeometry(0.2, 0.55, 24), m, 0, 0.55, 0, { rx: Math.PI })); g.add(mesh(new THREE.SphereGeometry(0.1, 12, 8), basic('#fff4d0'), 0, 0.95, 0.2, { cast: false }));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: lin('#f2b632'), transparent: true, opacity: 0.22, toneMapped: false, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.02; g.add(disc); g.userData.disc = disc;
    g.visible = false; scene.add(g); return g; });
  const sparks = [...Array(120)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('255,220,140'), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s; });
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(0, 1, 0)]), new THREE.LineDashedMaterial({ color: lin('#f4f1ea'), dashSize: 0.08, gapSize: 0.06, toneMapped: false, transparent: true })); scene.add(line);
  const uwb = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), new THREE.MeshBasicMaterial({ color: lin('#f2b632'), toneMapped: false })); scene.add(uwb);
  // the big phone for the arrow shot
  const bigPhone = buildPhone('#1a1c22'); scene.add(bigPhone);
  G = { r, cv, scene, cam, key, hall, benches, suit, exp, cap, pcb, bat, back, city, bus, people, walker, walker2, walker3, you, crowd, porter, dome, rings, beams, pins, sparks, line, uwb, bigPhone };
  return G;
}
const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion();

function buildSuitcase() {
  const g = new THREE.Group(), shellM = std('#d9a322', { r: 0.45 }), ribM = std('#c8921a', { r: 0.4 }), darkM = std('#1e1e22', { r: 0.4, m: 0.4 }), metM = std('#9aa0aa', { m: 0.8, r: 0.3 });
  const SW = 0.44, SH = 0.66, SD = 0.27;
  g.add(mesh(rrBox(SW, SH, SD, 0.06, 0.01), shellM, 0, SH / 2 + 0.07, 0));
  for (const s of [-1, 1]) for (let k = -2; k <= 2; k++) g.add(mesh(rrBox(0.03, SH - 0.1, 0.012, 0.012, 0.002), ribM, k * 0.075, SH / 2 + 0.07, s * (SD / 2 + 0.008)));
  g.add(mesh(new THREE.BoxGeometry(SW + 0.012, 0.02, SD + 0.012), darkM, 0, SH / 2 + 0.07, 0));   // the zip seam
  for (const wx of [-1, 1]) for (const wz of [-1, 1]) { const w = new THREE.Group(); w.add(mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), darkM, 0, 0.05, 0)); w.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 16), darkM, 0, 0.03, 0, { rz: Math.PI / 2 })); w.position.set(wx * (SW / 2 - 0.05), 0, wz * (SD / 2 - 0.05)); g.add(w); }
  // telescoping handle (rods slide up by g.userData.ext 0..1)
  const tele = new THREE.Group(); for (const s of [-1, 1]) tele.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.5, 10), metM, s * 0.1, -0.25, 0)); tele.add(mesh(rrBox(0.24, 0.035, 0.035, 0.015), darkM, 0, 0.0, 0)); tele.position.set(0, SH + 0.09, -SD / 2 + 0.03); g.add(tele);
  // top carry handle + the tan holder with the AirTag
  const tag = new THREE.Group(); tag.position.set(0.1, SH + 0.075 + 0.004, -0.06); g.add(tag);
  const holder = mesh(new THREE.CylinderGeometry(0.0185 * AT_S, 0.0185 * AT_S, 0.004 * AT_S, 40), std('#b07a44', { r: 0.7 }), 0, 0.002 * AT_S, 0); tag.add(holder);
  tag.add(mesh(new THREE.TorusGeometry(0.012 * AT_S, 0.002 * AT_S, 8, 24), std('#9a6a3a', { r: 0.7 }), 0.022 * AT_S, 0.004 * AT_S, 0, { rx: Math.PI / 2 }));
  const disc = new THREE.Mesh(new THREE.SphereGeometry(0.016 * AT_S, 40, 20, 0, TAU, 0, Math.PI / 2), std('#f6f6f4', { r: 0.22 })); disc.scale.y = 0.5;
  disc.position.y = 0.004 * AT_S; disc.castShadow = true; tag.add(disc);
  g.userData = { tele, tag, disc, SH };
  return g;
}
// the AirTag's world position (top of the white disc)
const tagPos = () => wpt(g3().suit.userData.disc, 0, 0.008 * AT_S, 0);

// walk: legs and arms swing at phase w (radians), amplitude a; the phone arm stays up when phone
function walkPose(p, w, a = 1, o = {}) {
  const u = p.userData, hips = [p.children[0], p.children[1]];
  pose(p, { ph: o.ph ?? 0, arm: o.phone ? -0.55 : -0.05, elbow: o.phone ? -1.25 : -0.3, hand: 1, down: o.phone ? 0.35 : 0, yaw: o.yaw ?? 0 });
  hips.forEach((h, i) => { const s = i ? 1 : -1, ph = Math.sin(w + (i ? Math.PI : 0)); h.rotation.x = -0.42 * a * ph; h.children[1].rotation.x = 0.6 * a * Math.max(0, -Math.cos(w + (i ? Math.PI : 0))); });
  u.arms.forEach((ar, i) => { if (o.phone && i === 1) { ar.rotation.x = -0.45; ar.userData.el.rotation.x = -1.3; return; } ar.rotation.x = 0.38 * a * Math.sin(w + (i ? 0 : Math.PI)); ar.userData.el.rotation.x = -0.25 - 0.15 * a; });
  u.torso.position.y = (u.torso.userData.y0 ?? 0) + 0.025 * a * Math.abs(Math.cos(w));
}
// place a walker on a straight path at time R: from A to B over [t0, t1] (stands still outside), facing the walk
function walkOn(p, R, A, B, t0, t1, o = {}) {
  const u = clamp((R - t0) / (t1 - t0)), x = lerp(A[0], B[0], u), z = lerp(A[1], B[1], u), moving = R > t0 && R < t1;
  p.visible = true; p.position.set(x, 0, z); p.rotation.y = Math.atan2(B[0] - A[0], B[1] - A[1]);
  const dist = Math.hypot(B[0] - A[0], B[1] - A[1]) * u; walkPose(p, dist / 0.7 * Math.PI, moving ? 1 : 0, o);
  return p;
}
const phoneOf = (p) => wpt(p.userData.phone, 0, 0, 0);

let SPI2 = 0, RGI = 0, BMI = 0;
function resetWorld() {
  const g = g3(); SPI2 = RGI = BMI = 0;
  for (const k of ['hall', 'suit', 'exp', 'city', 'dome', 'line', 'uwb', 'bigPhone']) g[k].visible = k === 'hall' || k === 'suit';
  g.people.forEach((p) => (p.visible = false)); g.rings.forEach((m) => (m.visible = false)); g.beams.forEach((m) => (m.visible = false)); g.pins.forEach((m) => (m.visible = false)); g.sparks.forEach((s) => (s.visible = false));
  g.suit.position.set(SC.x, 0, SC.z); g.suit.rotation.set(0, 0.35, 0); g.suit.userData.tele.position.y = g.suit.userData.SH + 0.09;
  g.scene.fog.near = 14; g.scene.fog.far = 60; g.scene.background.set('#0a0d14'); g.scene.fog.color.set('#0a0d14');
}
function spark(p, s, a) { const q = g3().sparks[SPI2++]; if (!q || a <= 0) return; q.visible = true; q.position.copy(p); q.scale.set(s, s, 1); q.material.opacity = clamp(a); }
// a flat ring (radius r) at p, facing up (or facing the camera when o.face), opacity a
function ring(p, r, a, o = {}) { const m = g3().rings[RGI++]; if (!m || a <= 0) return; m.visible = true; m.position.copy(p); m.scale.setScalar(r); m.material.opacity = clamp(a); m.material.color.set(o.c ?? '#3fd0d6');
  if (o.face) m.quaternion.copy(g3().cam.quaternion); else m.rotation.set(-Math.PI / 2, 0, 0); }
// a vertical beam from p up by h (u = how much has grown)
function beam(p, h, u, a = 1, w = 1) { const m = g3().beams[BMI++]; if (!m || u <= 0) return; m.visible = true; const hh = h * clamp(u); m.position.set(p.x, p.y + hh / 2, p.z); m.scale.set(w, Math.max(0.001, hh), w); m.material.opacity = 0.9 * a; }
function pin(i, p, s, a = 1, o = {}) { const q = g3().pins[i]; if (!q || s <= 0) return; q.visible = true; q.position.copy(p); q.scale.setScalar(s); q.userData.disc.scale.setScalar(o.disc ?? 1.6); q.userData.disc.material.opacity = 0.22 * a * (o.discA ?? 1);
  q.children.slice(0, 2).forEach((c) => { c.material.color.set(o.grey ? '#8a8e9a' : '#f2b632'); c.material.emissive.set(o.grey ? '#000000' : '#7a5410'); }); }
function setDome(c, r, a = 1) { const d = g3().dome; if (r <= 0 || a <= 0) return; d.visible = true; d.position.copy(c); d.scale.setScalar(r); d.children[0].material.opacity = 0.55 * a; d.children[1].material.opacity = 0.06 * a; d.children[2].material.opacity = 0.9 * a; }
const wpt = (obj, x, y, z) => { obj.updateWorldMatrix(true, false); return V3(x, y, z).applyMatrix4(obj.matrixWorld); };

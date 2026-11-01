// =====================================================================
//  HOSPITAL — three sets reused with different light: the patient's room (bed, your hands on the blanket, vitals
//  monitor, window over Valle de Bravo, clock, whiteboard, IV stand, bedside table with the phone), the MRI bore,
//  and the MRI control room with the brain-scan screens. Globals prefixed hs.
// =====================================================================
const HS = {};
const hsV = (x, y, z) => new THREE.Vector3(x, y, z);
const _hsx = new THREE.Vector3(), _hsy = new THREE.Vector3(), _hsz = new THREE.Vector3(), _hsm = new THREE.Matrix4();
// orient a POV hand: fingers along dir, back of the hand toward up
function hsAim(H, p, dir, up) { _hsy.copy(dir).normalize(); _hsz.copy(up).addScaledVector(_hsy, -up.dot(_hsy)).normalize(); _hsx.crossVectors(_hsy, _hsz); _hsm.makeBasis(_hsx, _hsy, _hsz); H.root.quaternion.setFromRotationMatrix(_hsm); H.root.position.copy(p); }
// a cylinder between two points
function hsLimb(par, a, b, r0, r1, mat, seg = 14) { const d = b.clone().sub(a), L = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, seg, 1, false).translate(0, L / 2, 0), mat);
  m.position.copy(a); m.quaternion.setFromUnitVectors(hsV(0, 1, 0), d.normalize()); m.castShadow = true; m.receiveShadow = true; par.add(m); return m; }
function hsBox(par, w, h, d, mat, x, y, z, o = {}) { const m = mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, o); (par.scene || par).add(m); return m; }
function hsRBox(par, w, h, d, r, mat, x, y, z, o = {}) { const m = mesh(roundedBox(w, h, d, r, 4), mat, x, y, z, o); (par.scene || par).add(m); return m; }
const hsEmis = (col, k = 1, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: '#000', emissive: col, emissiveIntensity: k, roughness: 0.4 }, o));
function hsCanvasTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return { c, x: c.getContext('2d'), t, w, h }; }
function hsRR(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

// ---- textures
const hsFloorTex = () => wrap(g3Tex((x, w, h) => { const R = RNG('hsfl'); x.fillStyle = '#b49a7c'; x.fillRect(0, 0, w, h);
  for (let j = 0; j < 8; j++) { const off = (j % 2) * 160; for (let i = -1; i < 3; i++) { const c = R.r(-14, 14); x.fillStyle = `rgb(${172 + c},${146 + c},${116 + c})`; x.fillRect(i * 320 + off, j * 64, 318, 62);
    for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(90,60,40,${R.r(0.05, 0.14)})`; x.lineWidth = R.r(0.6, 1.6); x.beginPath(); const y = j * 64 + R.r(2, 60); x.moveTo(i * 320 + off, y); x.bezierCurveTo(i * 320 + off + 100, y + R.n(4), i * 320 + off + 220, y + R.n(4), i * 320 + off + 318, y + R.n(3)); x.stroke(); } } }
  x.fillStyle = 'rgba(60,40,30,0.5)'; for (let j = 0; j < 8; j++) x.fillRect(0, j * 64 + 62, w, 2); speck(x, w, h, 3000, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.05)'], R); }, 640, 512), 3, 3);
const hsWallTex = (base) => wrap(g3Tex((x, w, h) => { const R = RNG('hsw' + base); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) blot(x, R.r(0, w), R.r(0, h), R.r(20, 80), R.f() < 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.03)'); speck(x, w, h, 6000, ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.05)'], R, 1, 2); }, 256, 256), 4, 2);
const hsCeilTex = () => wrap(g3Tex((x, w, h) => { const R = RNG('hsce'); x.fillStyle = '#e8e6e0'; x.fillRect(0, 0, w, h); speck(x, w, h, 5000, ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.04)', 'rgba(255,255,255,0.1)'], R, 1, 2);
  x.fillStyle = '#c8c6c0'; x.fillRect(0, 0, w, 5); x.fillRect(0, 0, 5, h); x.fillStyle = '#f8f8f4'; x.fillRect(0, 5, w, 1.5); x.fillRect(5, 0, 1.5, h); }, 128, 128), 9, 11);
const hsKnit = (col) => wrap(g3Tex((x, w, h) => { const R = RNG('knit' + col); x.fillStyle = col; x.fillRect(0, 0, w, h); for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i += 6) { x.fillStyle = `rgba(255,255,255,${R.r(0.04, 0.12)})`; x.beginPath(); x.ellipse(i + 3, j + 3, 2.2, 2.8, 0.5, 0, TAU); x.fill(); }
  for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, h), R.r(10, 40), 'rgba(0,0,0,0.04)'); }, 192, 192), 5, 8);
const hsGownTex = () => wrap(g3Tex((x, w, h) => { x.fillStyle = '#b8d0e4'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a86b0'; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.save(); x.translate(i * 16 + (j % 2) * 8, j * 16); x.rotate(Math.PI / 4); x.fillRect(-2, -2, 4, 4); x.restore(); } }, 128, 128), 3, 3);

// ---- the blanket over the legs: height field (x across, z along the bed; feet near z 0.35)
function hsBlanketH(x, z) { const legs = [-0.13, 0.13].reduce((a, lx) => a + 0.06 * Math.exp(-(((x - lx) / 0.13) ** 2)) * ss(0.2, 0.6, z), 0);
  const toes = [-0.12, 0.12].reduce((a, lx) => a + 0.07 * Math.exp(-(((x - lx) / 0.1) ** 2) - (((z - 0.4) / 0.16) ** 2)), 0);
  const hips = 0.09 * Math.exp(-(((x) / 0.22) ** 2)) * ss(0.95, 1.35, z), head = Math.max(0, z - 1.42) * 0.3;
  const wr = 0.008 * Math.sin(x * 17 + z * 5) * Math.sin(z * 9 - x * 4) + 0.004 * Math.sin(x * 29 - z * 11);
  const edge = ss(0.44, 0.6, Math.abs(x));
  return 0.7 + (legs + toes + hips + wr) * (1 - edge) + head - edge * 0.3; }

// ---- the hospital room
function hsRoomBuild() {
  const st = inStage({ hemi: 0.5, sky: 0xdde8f4, ground: 0x8a7a68, key: 2.2, keyCol: '#fff4e4', box: 7, boxFar: 120, sunDist: 40, target: hsV(0, 1, 0), sun: dirV(25 * DEG, 38 * DEG), top: '#4a86d0', hor: '#d8e6f2', clouds: 0.55 });
  st.scene.fog = new THREE.Fog('#c8d6e4', 60, 1400); st.env = st.scene.environment;
  const S = st.scene, R = RNG('hsroom');
  const wallM = STDm({ color: '#dfe6ea', map: hsWallTex('#ffffff'), roughness: 0.9 }), wallM2 = STDm({ color: '#c9d8e2', map: hsWallTex('#ffffff'), roughness: 0.9 });
  const XL = -2.6, XR = 2.6, ZF = -3.6, ZB = 2.7, HT = 2.8;
  // floor, ceiling, walls (the far wall has the window hole x -0.9..1.4, y 0.85..2.35)
  S.add(mesh(new THREE.PlaneGeometry(XR - XL, ZB - ZF).rotateX(-Math.PI / 2), STDm({ map: hsFloorTex(), roughness: 0.45, metalness: 0.0 }), 0, 0, (ZF + ZB) / 2, { cast: false }));
  S.add(mesh(new THREE.PlaneGeometry(XR - XL, ZB - ZF).rotateX(Math.PI / 2), STDm({ map: hsCeilTex(), roughness: 0.95 }), 0, HT, (ZF + ZB) / 2, { cast: false }));
  const WX0 = -0.9, WX1 = 1.4, WY0 = 0.85, WY1 = 2.35;
  hsBox(S, WX0 - XL, HT, 0.16, wallM2, (XL + WX0) / 2, HT / 2, ZF); hsBox(S, XR - WX1, HT, 0.16, wallM2, (WX1 + XR) / 2, HT / 2, ZF);
  hsBox(S, WX1 - WX0, WY0, 0.16, wallM2, (WX0 + WX1) / 2, WY0 / 2, ZF); hsBox(S, WX1 - WX0, HT - WY1, 0.16, wallM2, (WX0 + WX1) / 2, (HT + WY1) / 2, ZF);
  hsBox(S, 0.16, HT, ZB - ZF, wallM, XL, HT / 2, (ZF + ZB) / 2); hsBox(S, 0.16, HT, ZB - ZF, wallM, XR, HT / 2, (ZF + ZB) / 2); hsBox(S, XR - XL, HT, 0.16, wallM, 0, HT / 2, ZB);
  // baseboards + a wooden bumper rail along the walls
  const baseM = STDm({ color: '#6a7480', roughness: 0.5 }), railM = STDm({ color: '#a8845e', roughness: 0.45 });
  [[0, ZF + 0.09, XR - XL, 0.02], [0, ZB - 0.09, XR - XL, 0.02]].forEach(([x, z, w, d]) => { hsBox(S, w, 0.1, d, baseM, x, 0.05, z); });
  [XL + 0.09, XR - 0.09].forEach((x) => { hsBox(S, 0.02, 0.1, ZB - ZF, baseM, x, 0.05, (ZF + ZB) / 2); hsBox(S, 0.04, 0.12, ZB - ZF - 1.4, railM, x, 0.92, (ZF + ZB) / 2 + 0.3); });
  hsBox(S, WX0 - XL - 0.1, 0.12, 0.04, railM, (XL + WX0) / 2, 0.72, ZF + 0.1);
  // window: frame, mullions, sill, glass, a half-raised blind
  const alu = STDm({ color: '#c8ccd0', metalness: 0.6, roughness: 0.35 });
  [[WX0, 0], [WX1, 0], [(WX0 + WX1) / 2 + 0.1, 0]].forEach(([x]) => hsBox(S, 0.06, WY1 - WY0, 0.1, alu, x, (WY0 + WY1) / 2, ZF + 0.02));
  [WY0, WY1, 1.45].forEach((y) => hsBox(S, WX1 - WX0 + 0.06, 0.06, 0.1, alu, (WX0 + WX1) / 2, y, ZF + 0.02));
  hsBox(S, WX1 - WX0 + 0.3, 0.04, 0.3, STDm({ color: '#e8e4dc', roughness: 0.4 }), (WX0 + WX1) / 2, WY0 - 0.02, ZF + 0.16);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), new THREE.MeshStandardMaterial({ color: '#d8e8f4', transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0.2, depthWrite: false }));
  glass.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, ZF + 0.03); S.add(glass);
  { const n = 16, sl = IM(new THREE.BoxGeometry(WX1 - WX0 + 0.1, 0.004, 0.05), STDm({ color: '#eeeae2', roughness: 0.6 }), n, true);
    for (let i = 0; i < n; i++) sl.setMatrixAt(i, M4c((WX0 + WX1) / 2, WY1 - 0.02 - i * 0.022, ZF + 0.12, 0, 1, 1, 1, 0.5)); S.add(sl); hsBox(S, WX1 - WX0 + 0.14, 0.05, 0.07, STDm({ color: '#eeeae2' }), (WX0 + WX1) / 2, WY1 + 0.02, ZF + 0.12);
    [WX0 + 0.3, WX1 - 0.3].forEach((x) => hsLimb(S, hsV(x, WY1, ZF + 0.12), hsV(x, WY1 - 0.4, ZF + 0.12), 0.002, 0.002, STDm({ color: '#ddd' }), 4)); }
  // cards on the sill
  [['#f0c040', -0.5], ['#e86fa8', -0.3], ['#2a9d8f', 0.95]].forEach(([c, x], i) => { const m = mesh(new THREE.BoxGeometry(0.12, 0.16, 0.004), STDm({ color: c, roughness: 0.7 }), x, WY0 + 0.08, ZF + 0.2, { ry: (i - 1) * 0.3, rx: -0.15 }); S.add(m); });
  // outside: Valle de Bravo — white houses with red tile roofs down the slope, pines, the lake, the hills
  { const O = new THREE.Group(); S.add(O); const GY = -9;
    O.add(mesh(new THREE.PlaneGeometry(900, 700).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('hsgr', '#6a7a48', ['#5a6a3a', '#7a8a58', '#8a7a58', '#4a5a30'], 9000), 60, 60), roughness: 1 }), 0, GY, -340, { cast: false }));
    const n = 150, hb = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), STDm({ roughness: 0.85 }), n, false), rf = IM(new THREE.ConeGeometry(0.75, 0.45, 4).rotateY(Math.PI / 4).translate(0, 0.22, 0), STDm({ color: '#a8482c', roughness: 0.8 }), n, false);
    for (let i = 0; i < n; i++) { const z = -28 - Math.pow(R.f(), 1.4) * 150, x = R.n(20 + (-z) * 0.9), w = R.r(5, 9), d = R.r(5, 8), h = R.r(3, 7), y = GY + Math.max(0, (-z - 60) * 0.03), ry = R.n(0.3);
      hb.setMatrixAt(i, M4c(x, y, z, ry, w, h, d)); hb.setColorAt(i, lin(R.pick(['#f2eee6', '#f4f0e8', '#e8dcc4', '#f0e0c0', '#e8c8a0', '#d8a888', '#f4f2ee']))); rf.setMatrixAt(i, M4c(x, y + h, z, ry, w * 1.05, h * 0.5, d * 1.05)); }
    O.add(hb, rf);
    const church = new THREE.Group(); church.position.set(22, GY, -70); O.add(church); hsBox(church, 10, 9, 18, STDm({ color: '#e8d8b8' }), 0, 4.5, 0); hsBox(church, 4, 18, 4, STDm({ color: '#e0cca8' }), -4, 9, 9);
    church.add(mesh(new THREE.SphereGeometry(2.4, 16, 10, 0, TAU, 0, Math.PI / 2), STDm({ color: '#c8a050', metalness: 0.3, roughness: 0.5 }), -4, 18, 9));
    const nt = 420, tr = IM(new THREE.ConeGeometry(1, 3, 7).translate(0, 1.5, 0), STDm({ color: '#2f4a2c', roughness: 0.9 }), nt, false);
    for (let i = 0; i < nt; i++) { const z = -34 - R.f() * 220, x = R.n(30 + (-z) * 1.1), s = R.r(1.2, 2.4); tr.setMatrixAt(i, M4c(x, GY + Math.max(0, (-z - 60) * 0.03), z, 0, s * 0.8, s * R.r(1.0, 1.6), s * 0.8)); tr.setColorAt(i, lin(R.pick(['#3f6a3a', '#4a7a40', '#38603a', '#5a8a48']))); }
    O.add(tr);
    O.add(mesh(new THREE.PlaneGeometry(1400, 260).rotateX(-Math.PI / 2), STDm({ color: '#5a7a90', roughness: 0.12, metalness: 0.4 }), 0, GY + 0.3, -330, { cast: false }));
    for (let i = 0; i < 9; i++) { const hm = new THREE.Mesh(lumpyGeo(3, 0.3, 920 + i), STDm({ color: R.pick(['#3e5a3a', '#4a6440', '#36503a']), roughness: 1, map: wrap(texNoise('hshill' + i, '#5a7a50', ['#3a5a30', '#6a8a58', '#2a4a28'], 8000), 6, 3) }));
      hm.position.set(-500 + i * 125 + R.n(30), GY - 20, -520 - R.r(0, 200)); hm.scale.set(R.r(130, 200), R.r(70, 130), 110); hm.castShadow = false; O.add(hm); }
    HS.out = O; }
  // whiteboard + clock on the far wall (left of the window)
  { const wb = g3Tex((x, w, h) => { x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a5aa8'; x.fillRect(0, 0, w, 54); x.fillStyle = '#fff'; x.font = 'bold 34px Arial'; x.fillText('HABITACIÓN 12', 22, 39);
      x.font = '30px "Comic Sans MS", "Segoe Print", cursive'; [['#1a3a8a', 'Enfermera: Lucía', 110], ['#1a3a8a', 'Médico: Dr. Ruiz', 160], ['#c83a2a', 'Hoy: descanso', 230]].forEach(([c, s, y]) => { x.fillStyle = c; x.fillText(s, 26, y); });
      x.strokeStyle = 'rgba(40,60,140,0.5)'; x.lineWidth = 3; x.beginPath(); x.arc(380, 300, 28, 0.2, 3.0); x.stroke(); x.fillStyle = 'rgba(200,200,200,0.3)'; x.fillRect(240, 250, 90, 40); }, 480, 340);
    hsBox(S, 0.84, 0.6, 0.02, STDm({ color: '#b8bcc0', metalness: 0.5, roughness: 0.4 }), -1.8, 1.55, ZF + 0.09);
    S.add(mesh(new THREE.PlaneGeometry(0.8, 0.566), STDm({ map: wb, roughness: 0.25 }), -1.8, 1.55, ZF + 0.105, { cast: false }));
    hsBox(S, 0.7, 0.02, 0.04, STDm({ color: '#9aa0a8' }), -1.8, 1.24, ZF + 0.12); [['#2a5ad8', -1.95], ['#d83a2a', -1.88]].forEach(([c, x]) => S.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.11, 8).rotateZ(Math.PI / 2), STDm({ color: c }), x, 1.26, ZF + 0.13)));
    HS.clock = new THREE.Group(); HS.clock.position.set(-1.8, 2.25, ZF + 0.1); S.add(HS.clock);
    HS.clock.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 32).rotateX(Math.PI / 2), STDm({ color: '#2a2a30', roughness: 0.4 })));
    HS.clock.add(mesh(new THREE.CircleGeometry(0.135, 40), STDm({ map: g3Tex((x, w) => { x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, w, w); x.fillStyle = '#222'; for (let i = 0; i < 60; i++) { x.save(); x.translate(w / 2, w / 2); x.rotate(i / 60 * TAU); x.fillRect(-1.5, -w * 0.47, i % 5 ? 3 : 7, i % 5 ? 10 : 24); x.restore(); } }, 256, 256) }), 0, 0, 0.021));
    HS.hands = [[0.08, 0.008], [0.115, 0.005]].map(([L, wd]) => { const m = mesh(new THREE.BoxGeometry(wd, L, 0.004).translate(0, L / 2 - 0.015, 0), STDm({ color: '#111' }), 0, 0, 0.026); HS.clock.add(m); return m; }); }
  // TV in the corner, sanitizer, door on the right wall, curtain on a ceiling track
  hsBox(S, 0.05, 0.42, 0.72, STDm({ color: '#101014', roughness: 0.3 }), XR - 0.12, 2.15, ZF + 0.8);
  hsBox(S, 0.08, 0.2, 0.1, STDm({ color: '#f4f4f0' }), XR - 0.12, 1.3, -1.6); hsBox(S, 0.03, 0.06, 0.06, STDm({ color: '#2a8ad8' }), XR - 0.17, 1.26, -1.6);
  { const dm = STDm({ color: '#b08a62', roughness: 0.5 }); hsBox(S, 0.06, 2.1, 1.0, dm, XR - 0.06, 1.05, -2.5); hsBox(S, 0.05, 0.6, 0.12, STDm({ color: '#aac4d8', transparent: true, opacity: 0.5 }), XR - 0.09, 1.5, -2.25);
    hsBox(S, 0.08, 0.025, 0.14, STDm({ color: '#c8ccd0', metalness: 0.8, roughness: 0.3 }), XR - 0.12, 1.0, -2.15); hsBox(S, 0.04, 2.18, 1.1, STDm({ color: '#e8e8e4' }), XR - 0.07, 1.09, -2.5); }
  { const cg = new THREE.PlaneGeometry(1.5, 2.1, 60, 1), p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.05 * Math.sin(p.getX(i) * 34)); cg.computeVertexNormals();
    const c = mesh(cg, STDm({ color: '#9cc4b8', roughness: 0.9, side: THREE.DoubleSide, map: wrap(g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(80,120,110,0.25)'; for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 3, h); }, 128, 64), 3, 1) }), XR - 0.5, 1.6, -0.5, { ry: Math.PI / 2 }); S.add(c);
    hsBox(S, 0.03, 0.03, 5, STDm({ color: '#c8ccd0', metalness: 0.7 }), XR - 0.5, HT - 0.06, 0); }
  // ceiling light panels (emissive; their glow is a point light set per mood)
  HS.panelM = hsEmis('#f4f8ff', 1.4); [[0, -1.2], [0, 1.0]].forEach(([x, z]) => { hsBox(S, 1.22, 0.04, 0.62, STDm({ color: '#d8dce0' }), x, HT - 0.01, z); S.add(mesh(new THREE.PlaneGeometry(1.16, 0.56).rotateX(Math.PI / 2), HS.panelM, x, HT - 0.035, z, { cast: false })); });
  HS.fluo = new THREE.PointLight('#eef4ff', 0.9, 7, 1.6); HS.fluo.position.set(0, 2.5, -0.8); S.add(HS.fluo);
  HS.fill = new THREE.PointLight('#fff4e8', 0.35, 5, 2); HS.fill.position.set(0.2, 1.8, 1.4); S.add(HS.fill);
  // the bed
  { const B = new THREE.Group(); S.add(B); const frame = STDm({ color: '#d4d8dc', metalness: 0.4, roughness: 0.4 }), dark = STDm({ color: '#4a5058', roughness: 0.5 }), plast = STDm({ color: '#e4dccb', roughness: 0.45 });
    hsBox(B, 1.0, 0.16, 2.2, frame, 0, 0.44, 1.25); hsBox(B, 0.9, 0.06, 2.0, dark, 0, 0.33, 1.25);
    [[-0.42, 0.3], [0.42, 0.3], [-0.42, 2.2], [0.42, 2.2]].forEach(([x, z]) => { hsBox(B, 0.06, 0.3, 0.06, frame, x, 0.2, z); B.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16).rotateZ(Math.PI / 2), dark, x, 0.06, z)); });
    hsRBox(B, 0.96, 0.16, 1.3, 0.05, STDm({ color: '#eef2f4', roughness: 0.8 }), 0, 0.6, 0.8);
    const back = hsRBox(B, 0.96, 0.16, 1.0, 0.05, STDm({ color: '#eef2f4', roughness: 0.8 }), 0, 0.84, 1.86); back.rotation.x = -0.55;
    const pil = mesh(new THREE.SphereGeometry(1, 24, 14).scale(0.36, 0.1, 0.2), STDm({ color: '#f6f8fa', roughness: 0.9 }), 0, 1.12, 2.3, { rx: -0.9 }); B.add(pil);
    // footboard with the little display
    hsRBox(B, 1.02, 0.32, 0.06, 0.03, plast, 0, 0.72, 0.13); hsBox(B, 0.3, 0.07, 0.01, STDm({ color: '#141a18', roughness: 0.3 }), 0, 0.8, 0.165);
    for (let i = 0; i < 4; i++) B.add(mesh(new THREE.PlaneGeometry(0.045, 0.035), hsEmis('#48e890', 1.6), -0.09 + i * 0.06, 0.8, 0.171, { cast: false }));
    // side rails
    [-1, 1].forEach((s) => { const x = s * 0.53; [0.82, 0.96].forEach((y) => hsLimb(B, hsV(x, y, 0.55), hsV(x, y, 1.6), 0.016, 0.016, frame, 10)); [0.6, 1.0, 1.55].forEach((z) => hsLimb(B, hsV(x, 0.55, z), hsV(x, 0.98, z), 0.015, 0.015, frame, 10));
      hsRBox(B, 0.04, 0.3, 0.7, 0.02, plast, s * 0.53, 0.86, 2.0).rotation.x = -0.55; });
    // blanket (height field), with a folded sheet edge near the chest
    const bg = new THREE.PlaneGeometry(1.36, 1.72, 80, 100).rotateX(-Math.PI / 2), p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 0.98; p.setY(i, hsBlanketH(x, z)); p.setZ(i, z); } bg.computeVertexNormals();
    const bl = new THREE.Mesh(bg, STDm({ color: '#a8c4e0', map: hsKnit('#ffffff'), roughness: 0.95, side: THREE.DoubleSide })); bl.castShadow = bl.receiveShadow = true; B.add(bl);
    const sh = new THREE.PlaneGeometry(1.36, 0.16, 80, 4).rotateX(-Math.PI / 2), q = sh.attributes.position;
    for (let i = 0; i < q.count; i++) { const x = q.getX(i), z = q.getZ(i) + 1.72; q.setY(i, hsBlanketH(x, z) + 0.012 + 0.006 * Math.sin(x * 30)); q.setZ(i, z); } sh.computeVertexNormals();
    B.add(mesh(sh, STDm({ color: '#f4f6f8', roughness: 0.9, side: THREE.DoubleSide }))); HS.bed = B; }
  // your hands on the blanket: forearms, upper arms in the gown, the IV line taped to the right hand, a wristband on the left
  { const gown = STDm({ map: hsGownTex(), roughness: 0.9 }), skinM = STDm({ color: SKIN_HAND, roughness: 0.62 });
    HS.HL = makeHand(-1); HS.HR = makeHand(1); S.add(HS.HL.root, HS.HR.root);
    [[HS.HL, -1], [HS.HR, 1]].forEach(([Hd, s]) => { const wx = s * 0.22, wz = 1.34, wy = hsBlanketH(wx, wz) + 0.045; Hd.wp = hsV(wx, wy, wz);
      hsAim(Hd, Hd.wp, hsV(-s * 0.16, 0.02, -1), hsV(s * 0.12, 1, 0.1)); poseHand(Hd, { curl: [0.4, 0.45, 0.5, 0.55], spread: 0.2, thumb: 0.3 });
      const el = Hd.wp.clone().add(hsV(s * 0.035, 0.035, 0.31)), shd = hsV(s * 0.2, 0.98, 1.92); hsLimb(S, el, shd, 0.045, 0.05, skinM); hsLimb(S, el.clone().lerp(shd, 0.35), shd, 0.062, 0.068, gown);
      S.add(mesh(new THREE.SphereGeometry(0.043, 14, 10), skinM, el.x, el.y, el.z)); });
    const wb = HS.HL.fore; wb.add(mesh(new THREE.CylinderGeometry(0.041, 0.04, 0.018, 20, 1, true).scale(1.28, 1, 0.8), STDm({ color: '#f4f4f0', side: THREE.DoubleSide, roughness: 0.6 }), 0, -0.05, 0));
    HS.HR.fore.add(mesh(new THREE.BoxGeometry(0.035, 0.03, 0.006), STDm({ color: '#f0ece4', roughness: 0.8 }), 0, -0.035, 0.03)); HS.ivEnd = HS.HR; }
  // vitals monitor on an arm from the left wall
  { const T = hsCanvasTex(512, 384); HS.mon = T; const g = new THREE.Group(); g.position.set(-0.95, 1.62, 1.25); S.add(g); g.lookAt(0, 1.2, 1.8);
    hsRBox(g, 0.46, 0.36, 0.08, 0.02, STDm({ color: '#3a3f46', roughness: 0.45 }), 0, 0, -0.03); g.add(mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshBasicMaterial({ map: T.t, toneMapped: false }), 0, 0.005, 0.012, { cast: false }));
    g.add(mesh(new THREE.SphereGeometry(0.012, 10, 8), HS.beepM = hsEmis('#ff3a3a', 0), 0.18, 0.165, 0.01)); hsLimb(S, hsV(-0.95, 1.62, 1.2), hsV(XL + 0.1, 1.7, 1.0), 0.02, 0.02, STDm({ color: '#8a9098', metalness: 0.6, roughness: 0.3 }));
    HS.monLight = new THREE.PointLight('#7affc8', 0, 1.6, 2); HS.monLight.position.set(-0.8, 1.6, 1.4); S.add(HS.monLight); }
  // IV stand to the right of the bed head, bag, drip chamber, the line down to your hand
  { const g = new THREE.Group(); g.position.set(0.78, 0, 1.75); S.add(g); const st_ = STDm({ color: '#c8ccd2', metalness: 0.8, roughness: 0.25 });
    g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.0, 10).translate(0, 1.0, 0), st_)); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; hsLimb(g, hsV(0, 0.07, 0), hsV(Math.cos(a) * 0.28, 0.04, Math.sin(a) * 0.28), 0.01, 0.01, st_, 6); g.add(mesh(new THREE.SphereGeometry(0.025, 8, 6), STDm({ color: '#222' }), Math.cos(a) * 0.28, 0.025, Math.sin(a) * 0.28)); }
    hsLimb(g, hsV(-0.12, 1.98, 0), hsV(0.12, 1.98, 0), 0.008, 0.008, st_, 6);
    const bag = mesh(new THREE.SphereGeometry(1, 20, 14).scale(0.08, 0.13, 0.025), new THREE.MeshStandardMaterial({ color: '#e8f2f8', transparent: true, opacity: 0.6, roughness: 0.1 }), -0.1, 1.8, 0); g.add(bag);
    g.add(mesh(new THREE.PlaneGeometry(0.08, 0.06), STDm({ map: g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a6ab0'; x.fillRect(0, 0, w, 14); x.fillStyle = '#555'; for (let i = 0; i < 4; i++) x.fillRect(8, 22 + i * 10, R.r(30, 50), 4); }, 64, 64) }), -0.1, 1.8, 0.027, { cast: false }));
    g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), new THREE.MeshStandardMaterial({ color: '#f0f8ff', transparent: true, opacity: 0.5 }), -0.1, 1.62, 0));
    const pts = [hsV(0.68, 1.59, 1.75), hsV(0.62, 1.2, 1.7), hsV(0.55, 0.95, 1.5), hsV(0.4, 0.9, 1.5), hsV(0.27, hsBlanketH(0.27, 1.36) + 0.05, 1.36), hsV(0.225, hsBlanketH(0.225, 1.32) + 0.05, 1.31)];
    S.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0035, 6), new THREE.MeshStandardMaterial({ color: '#e8f4fa', transparent: true, opacity: 0.75, roughness: 0.1 }))); }
  // bedside table on the left: phone, cup with straw, tissues, flowers, water pitcher
  { const g = new THREE.Group(); g.position.set(-0.9, 0, 1.55); S.add(g); const wd = STDm({ color: '#b8926a', roughness: 0.35, map: g3Tex((x, w, h) => { const R = RNG('tabw'); x.fillStyle = '#c49c72'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(110,70,40,${R.r(0.05, 0.16)})`; x.lineWidth = R.r(0.6, 2); const y = R.r(0, h); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + R.n(6), w * 0.7, y + R.n(6), w, y + R.n(4)); x.stroke(); } }, 256, 256) }), wh = STDm({ color: '#eceae4', roughness: 0.5 });
    hsBox(g, 0.5, 0.6, 0.45, wh, 0, 0.3, 0); hsBox(g, 0.54, 0.03, 0.49, wd, 0, 0.615, 0); hsBox(g, 0.46, 0.2, 0.01, STDm({ color: '#dedad2' }), 0, 0.42, 0.226); hsBox(g, 0.12, 0.02, 0.02, STDm({ color: '#9aa0a6', metalness: 0.7 }), 0, 0.45, 0.235);
    const cup = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 18, 1, true), STDm({ color: '#f4f4f4', side: THREE.DoubleSide }), 0.15, 0.69, 0.1); g.add(cup); hsLimb(g, hsV(0.15, 0.68, 0.1), hsV(0.16, 0.8, 0.09), 0.003, 0.003, STDm({ color: '#e84a6a' }), 6);
    hsRBox(g, 0.22, 0.09, 0.12, 0.01, STDm({ color: '#7ab8d8' }), -0.1, 0.675, -0.1); g.add(mesh(new THREE.SphereGeometry(0.04, 10, 8).scale(1, 0.8, 0.5), STDm({ color: '#ffffff', roughness: 1 }), -0.1, 0.73, -0.1));
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.16, 18), new THREE.MeshStandardMaterial({ color: '#d8ecf4', transparent: true, opacity: 0.45, roughness: 0.05 }), 0.12, 0.71, -0.13));
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, x = 0.12 + Math.cos(a) * 0.04, z = -0.13 + Math.sin(a) * 0.04, top = hsV(x + Math.cos(a) * 0.06, 0.95 + R.r(0, 0.08), z + Math.sin(a) * 0.06);
      hsLimb(g, hsV(0.12, 0.7, -0.13), top, 0.003, 0.003, STDm({ color: '#3a7a3a' }), 5); g.add(mesh(lumpyGeo(1, 0.35, 60 + i), STDm({ color: R.pick(['#f0c030', '#e84a3a', '#f08a2a', '#e86fa8', '#ffffff']), roughness: 0.8 }), top.x, top.y, top.z, { s: [0.035, 0.03, 0.035] })); }
    HS.phone = new THREE.Group(); HS.phone.position.set(-0.06, 0.632, 0.09); HS.phone.rotation.y = 0.35; g.add(HS.phone); HS.phT = hsCanvasTex(360, 760);
    HS.phone.add(mesh(roundedBox(0.075, 0.009, 0.158, 0.004, 3), STDm({ color: '#1a1c22', metalness: 0.5, roughness: 0.3 })));
    HS.phScr = mesh(new THREE.PlaneGeometry(0.069, 0.15).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: HS.phT.t, toneMapped: false }), 0, 0.0047, 0, { cast: false }); HS.phone.add(HS.phScr);
    HS.phGlow = new THREE.PointLight('#cfe0ff', 0, 0.6, 2); HS.phGlow.position.set(-0.06, 0.75, 0.09); g.add(HS.phGlow); HS.table = g; }
  // a sink cabinet on the left wall, a trash bin, the mom's chair at the right with a heart balloon tied to it
  hsBox(S, 0.5, 0.85, 1.0, STDm({ color: '#e8e4dc' }), XL + 0.33, 0.43, -1.6); hsBox(S, 0.54, 0.04, 1.04, STDm({ color: '#b8bcc0', roughness: 0.3 }), XL + 0.33, 0.87, -1.6); hsBox(S, 0.02, 0.6, 0.8, STDm({ color: '#c8d4dc', metalness: 0.9, roughness: 0.08 }), XL + 0.1, 1.5, -1.6);
  S.add(mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.4, 20), STDm({ color: '#f0d040' }), -0.95, 0.2, 0.9));
  HS.chair = new THREE.Group(); S.add(HS.chair); { const c = HS.chair, up = STDm({ color: '#3a6a9a', roughness: 0.8 }), wd = STDm({ color: '#a8845e', roughness: 0.5 });
    hsRBox(c, 0.56, 0.12, 0.52, 0.04, up, 0, 0.44, 0); hsRBox(c, 0.56, 0.6, 0.1, 0.04, up, 0, 0.78, -0.26).rotation.x = -0.12;
    [-1, 1].forEach((s) => { hsBox(c, 0.06, 0.05, 0.56, wd, s * 0.31, 0.64, 0.0); hsLimb(c, hsV(s * 0.28, 0, 0.25), hsV(s * 0.28, 0.4, 0.22), 0.02, 0.02, wd, 8); hsLimb(c, hsV(s * 0.28, 0, -0.25), hsV(s * 0.28, 0.62, -0.28), 0.02, 0.02, wd, 8); hsLimb(c, hsV(s * 0.31, 0.4, 0.24), hsV(s * 0.31, 0.62, 0.24), 0.02, 0.02, wd, 8); });
    const bal = new THREE.Shape(); bal.moveTo(0, -0.14); bal.bezierCurveTo(-0.16, -0.02, -0.15, 0.12, -0.075, 0.12); bal.bezierCurveTo(-0.03, 0.12, 0, 0.08, 0, 0.06); bal.bezierCurveTo(0, 0.08, 0.03, 0.12, 0.075, 0.12); bal.bezierCurveTo(0.15, 0.12, 0.16, -0.02, 0, -0.14);
    HS.balloon = mesh(new THREE.ExtrudeGeometry(bal, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 4, curveSegments: 16 }), STDm({ color: '#e83a5a', metalness: 0.75, roughness: 0.18 }), -0.25, 1.5, -0.32); HS.balloon.scale.setScalar(0.7); c.add(HS.balloon);
    hsLimb(c, hsV(-0.31, 0.64, -0.2), hsV(-0.25, 1.4, -0.32), 0.0015, 0.0015, STDm({ color: '#eee' }), 4); }
  // people: the mom and the doctor
  HS.mom = hsMakeMom(); S.add(HS.mom.root); HS.doc = hsMakeDoc(); S.add(HS.doc.root);
  // a warm bedside lamp for the night moods
  HS.lamp = new THREE.PointLight('#ffb070', 0, 4, 2); HS.lamp.position.set(-0.95, 1.1, 1.3); S.add(HS.lamp);
  HS.sunMood = null; return st; }

// ---- people
function hsMakeMom() { const P = makePerson({ female: true, skin: '#c48a62', hair: '#24170f', hairStyle: 'bun', top: '#b07ab8', bottom: '#3a3550', lips: '#9a4a48', iris: '#3a2416', seed: 41 });
  const sc = mesh(new THREE.TorusGeometry(0.1, 0.035, 10, 24).rotateX(Math.PI / 2).scale(1.1, 1, 0.85), STDm({ color: '#e8d8b8', roughness: 1 }), 0, 0.47, 0.01); P.spine.add(sc); return P; }
function hsMakeDoc(o = {}) { const P = makePerson(Object.assign({ skin: '#dcae88', hair: '#3a2c24', hairStyle: 'short', top: '#7aa8d0', coat: '#f2f2ee', bottom: '#2b3a55', glasses: true, seed: 77 }, o));
  const coatM = STDm({ color: o.coat || '#f2f2ee', roughness: 0.75, side: THREE.DoubleSide });
  P.hips.add(mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.5, 20, 1, true, 0.5, TAU - 1.0).translate(0, -0.25, 0).scale(1, 1, 0.78), coatM, 0, 0.02, 0));
  if (!o.noScope) { const sc = mesh(new THREE.TorusGeometry(0.085, 0.008, 6, 24, Math.PI * 1.3).rotateX(Math.PI / 2).rotateY(Math.PI * 0.85), STDm({ color: '#222', roughness: 0.4 }), 0, 0.5, 0.0); P.spine.add(sc);
    [-1, 1].forEach((s) => hsLimb(P.spine, hsV(s * 0.07, 0.46, 0.08), hsV(s * 0.06, 0.28, 0.13), 0.006, 0.006, STDm({ color: '#222' }), 6)); P.spine.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 14).rotateX(Math.PI / 2), STDm({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 }), 0, 0.26, 0.14)); }
  P.spine.add(mesh(new THREE.BoxGeometry(0.06, 0.08, 0.005), STDm({ color: '#ffffff', map: g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a6ab0'; x.fillRect(0, 0, w, 14); x.fillStyle = '#9ab'; x.fillRect(16, 22, 32, 30); }, 64, 80) }), 0.1, 0.33, 0.125));
  if (!o.noBoard) { const cb = new THREE.Group(); P.spine.add(cb); cb.position.set(0.02, 0.24, 0.2); cb.rotation.set(-0.5, 0, 0.1); cb.position.set(0, 0, 0); HS.cbBoard = cb;
    cb.add(mesh(new THREE.BoxGeometry(0.23, 0.32, 0.012), STDm({ color: '#7a5434', roughness: 0.6 }))); cb.add(mesh(new THREE.BoxGeometry(0.2, 0.27, 0.004), STDm({ color: '#fafaf6', map: g3Tex((x, w, h) => { x.fillStyle = '#fafaf6'; x.fillRect(0, 0, w, h); x.fillStyle = '#9aa'; for (let i = 0; i < 9; i++) x.fillRect(10, 14 + i * 13, 40 + (i * 23) % 50, 4); }, 128, 160) }), 0, -0.01, 0.008)); cb.add(mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), STDm({ color: '#c8ccd0', metalness: 0.8 }), 0, 0.15, 0.008)); P.board = cb; }
  return P; }

// ---- the vitals monitor screen (live)
function hsDrawMon(t, dim = 1) { const { x, w, h, t: tex } = HS.mon; x.fillStyle = '#05080a'; x.fillRect(0, 0, w, h);
  const ecg = (u) => { const p = mod(u, 0.77) / 0.77; return p < 0.04 ? Math.sin(p / 0.04 * Math.PI) * 0.12 : p < 0.1 ? 0 : p < 0.12 ? -0.15 : p < 0.15 ? 1 : p < 0.18 ? -0.35 : p < 0.3 ? 0 : p < 0.42 ? Math.sin((p - 0.3) / 0.12 * Math.PI) * 0.22 : 0; };
  const trace = (y0, amp, col, f) => { x.strokeStyle = col; x.lineWidth = 3; x.shadowColor = col; x.shadowBlur = 8; x.beginPath(); for (let i = 0; i < 330; i += 2) { const u = t - (330 - i) / 330 * 2.4; const v = y0 - f(u) * amp; i ? x.lineTo(i + 10, v) : x.moveTo(i + 10, v); } x.stroke(); x.shadowBlur = 0; };
  trace(90, 60, '#3aff8a', ecg); trace(200, 34, '#4ad8ff', (u) => Math.pow(Math.max(0, Math.sin(mod(u - 0.15, 0.77) / 0.77 * Math.PI)), 3)); trace(300, 22, '#ffd84a', (u) => Math.sin(u * TAU / 4.2));
  x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 1; [140, 250].forEach((y) => { x.beginPath(); x.moveTo(10, y); x.lineTo(340, y); x.stroke(); });
  const num = (s, y, col, sz) => { x.fillStyle = col; x.font = `bold ${sz}px Arial`; x.textAlign = 'right'; x.fillText(s, 500, y); };
  num('78', 110, '#3aff8a', 82); num('97', 215, '#4ad8ff', 62); num('14', 300, '#ffd84a', 50); num('118/76', 365, '#ff8ac8', 40);
  x.font = 'bold 18px Arial'; x.textAlign = 'left'; x.fillStyle = '#3aff8a'; x.fillText('FC', 360, 40); x.fillStyle = '#4ad8ff'; x.fillText('SpO2', 360, 160);
  const beat = mod(t, 0.77) < 0.12; x.fillStyle = beat ? '#ff4a4a' : '#5a1a1a'; x.beginPath(); x.arc(368, 90, 8, 0, TAU); x.fill();
  if (dim < 1) { x.fillStyle = `rgba(0,0,0,${1 - dim})`; x.fillRect(0, 0, w, h); } tex.needsUpdate = true; return beat; }

// ---- the phone lock screen: 3:14 and stacking notifications (names only)
const HS_NOTI = [['Mamá', '#3ac85a'], ['Sofi', '#2a8af8'], ['Grupo del lago', '#3ac85a'], ['Diego', '#e84a8a'], ['Abuela', '#3ac85a'], ['Sofi', '#2a8af8']];
function hsDrawPhone(lt) { const { x, w, h, t } = HS.phT; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2a5a'); g.addColorStop(0.55, '#c86a5a'); g.addColorStop(0.75, '#f0a860'); g.addColorStop(1, '#2a2440'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1a1830'; x.beginPath(); x.moveTo(0, h * 0.78); for (let i = 0; i <= 12; i++) x.lineTo(i * w / 12, h * 0.74 - 30 * Math.abs(Math.sin(i * 1.7))); x.lineTo(w, h); x.lineTo(0, h); x.fill();
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '500 24px Arial'; x.fillText('jueves 14', w / 2, 82); x.font = '300 112px Arial'; x.fillText('3:14', w / 2, 188);
  const n = Math.min(HS_NOTI.length, 1 + Math.floor(lt * 2.6)), sl = clamp((lt * 2.6) % 1 * 3);
  for (let i = 0; i < n; i++) { const k = n - 1 - i, y = 228 + k * 82 + (i === n - 1 && n > 1 ? 0 : 0) - (i === n - 1 ? (1 - EZ.o3(sl)) * 40 : 0), a = i === n - 1 ? EZ.o2(sl) : 1, [nm, col] = HS_NOTI[i];
    x.globalAlpha = a; x.fillStyle = 'rgba(245,245,250,0.88)'; hsRR(x, 14, y, w - 28, 72, 18); x.fill(); x.fillStyle = col; hsRR(x, 26, y + 14, 44, 44, 11); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(48, y + 36, 12, 0, TAU); x.fill(); x.fillStyle = '#111'; x.textAlign = 'left'; x.font = 'bold 26px Arial'; x.fillText(nm, 84, y + 32);
    x.fillStyle = 'rgba(0,0,0,0.22)'; hsRR(x, 84, y + 44, 120 + (i * 37) % 90, 12, 6); x.fill(); x.fillStyle = 'rgba(0,0,0,0.35)'; x.font = '18px Arial'; x.textAlign = 'right'; x.fillText('ahora', w - 30, y + 30); x.globalAlpha = 1; }
  t.needsUpdate = true; }

// ---- moods of the room: 'night' (dark, monitor glow, warm lamp), 'day' (cool daylight), 'sunset' (low warm sun)
function hsMood(st, m) { if (HS.sunMood === m) return; HS.sunMood = m; const U = st.skyU;
  if (m === 'day') { const sun = dirV(28 * DEG, 36 * DEG); st.setSun(sun, hsV(0, 1, 0)); st.key.intensity = 2.0; st.key.color.set('#fff4e6'); st.hemi.intensity = 0.55; st.hemi.color.set('#dde8f4'); st.hemi.groundColor.set('#8a7a68');
    U.uTop.value.set('#4a86d0'); U.uHor.value.set('#d8e6f2'); U.uSun.value.copy(sun); U.uSunC.value.set('#fff4dc'); U.uCl.value = 0.55; st.scene.fog.color.set('#c8d6e4');
    HS.panelM.emissiveIntensity = 1.4; HS.fluo.intensity = 0.9; HS.fill.intensity = 0.35; HS.fill.color.set('#fff4e8'); HS.lamp.intensity = 0; st.scene.environment = st.env; HS.out.visible = true; }
  if (m === 'sunset') { const sun = dirV(16 * DEG, 8.5 * DEG); st.setSun(sun, hsV(0, 1, 0)); st.key.intensity = 4.4; st.key.color.set('#ffa860'); st.hemi.intensity = 0.32; st.hemi.color.set('#ffc8a0'); st.hemi.groundColor.set('#5a3a30');
    U.uTop.value.set('#3a4a8a'); U.uHor.value.set('#ffb070'); U.uSun.value.copy(sun); U.uSunC.value.set('#ffd8a0'); U.uCl.value = 0.45; st.scene.fog.color.set('#e8a070');
    HS.panelM.emissiveIntensity = 0.05; HS.fluo.intensity = 0; HS.fill.intensity = 0.35; HS.fill.color.set('#ffb880'); HS.lamp.intensity = 0.25; st.scene.environment = st.env; HS.out.visible = true; }
  if (m === 'night') { st.key.intensity = 0.0; st.hemi.intensity = 0.04; st.hemi.color.set('#6a7aa0'); U.uTop.value.set('#02030a'); U.uHor.value.set('#0c1424'); U.uSunC.value.set('#000'); U.uCl.value = 0.0; st.scene.fog.color.set('#050810');
    HS.panelM.emissiveIntensity = 0; HS.fluo.intensity = 0; HS.fill.intensity = 0; HS.lamp.intensity = 0.9; st.scene.environment = null; HS.out.visible = false; } }

// the patient's camera on the pillow
const HS_POV = [0.0, 1.14, 2.04];
function hsRoom(t, mood, dimMon = 1) { const st = once('hsRoom', hsRoomBuild); hsMood(st, mood);
  const beat = hsDrawMon(t, dimMon); HS.beepM.emissiveIntensity = beat ? 3 : 0.3; HS.monLight.intensity = mood === 'night' ? 0.5 + (beat ? 0.4 : 0) : 0.15;
  const a = mod(t / 3600 * 0 + 0.31, 1); HS.hands[0].rotation.z = -(10 + 10 / 60) / 12 * TAU; HS.hands[1].rotation.z = -10 / 60 * TAU; HS.phGlow.intensity = 0;
  [HS.HL, HS.HR].forEach((Hd, i) => poseHand(Hd, { curl: [0.32 + 0.02 * i, 0.38, 0.42, 0.48], spread: 0.25, thumb: 0.25, tremble: 0 }));
  HS.doc.root.visible = false; HS.mom.root.visible = false; if (HS.glove) HS.glove.root.visible = HS.glove2.root.visible = HS.pen.visible = false; HS.balloon.rotation.y = 0.3 * Math.sin(t * 0.4); HS.balloon.visible = mood === 'sunset'; return st; }

// ---- 2D post helpers
let HSBC = null, HSLC = null;
function hsBlur(px) { if (px < 0.4) return; if (!HSBC) { HSBC = document.createElement('canvas'); HSBC.width = W / 4; HSBC.height = H / 4; }
  const b = HSBC.getContext('2d'); b.filter = `blur(${px / 4}px)`; b.clearRect(0, 0, W / 4, H / 4); b.drawImage(ctx.canvas, -8, -14, W / 4 + 16, H / 4 + 28); b.filter = 'none';
  ctx.save(); screen(); ctx.globalAlpha = clamp(px / 5); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(HSBC, 0, 0, W, H); ctx.restore(); }
// eyelids: open 0 (closed) .. 1; col = the lid colour (dark red when light comes through)
function hsLids(open, col = '#000', soft = 1) { if (open >= 1.2) return; if (!HSLC) { HSLC = document.createElement('canvas'); HSLC.width = W / 4; HSLC.height = H / 4; }
  const x = HSLC.getContext('2d'), w = W / 4, h = H / 4; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.fillStyle = col; x.fillRect(0, 0, w, h);
  if (open > 0.01) { x.globalCompositeOperation = 'destination-out'; x.save(); x.translate(w / 2, h * 0.47); x.scale(1, Math.max(0.01, open * 0.75)); const r = w * 0.95, g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(clamp(0.75 - 0.3 * soft), 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(-r, -r / Math.max(0.01, open * 0.75) - h, 2 * r, 2 * r / Math.max(0.01, open * 0.75) + 2 * h); x.restore(); }
  ctx.save(); screen(); ctx.drawImage(HSLC, 0, 0, W, H); ctx.restore(); }

// ---- shots in the room
// day1: closed eyes in the dark, a faint red glow through the lids, the monitor's beep light
SHOT_FN.day1 = (lt, dur, t) => { const st = hsRoom(t, 'night', 0.7);
  camPt(st, HS_POV, [-0.25, 0.95, -1.0], 68, t, 0.2, 3); renderStage(st, 0.8); hsBlur(46);
  pvTint('#3a0604', 0.9, 'multiply'); pvTint('#000', 0.55); const beat = mod(t, 0.77) / 0.77;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; pvGlow(CX, H * 0.46, 760, 'rgba(120,16,10,0.55)', 0.6 + 0.15 * Math.sin(t * 1.3)); pvGlow(250, 700, 360, 'rgba(80,255,170,0.35)', 0.25 + 0.6 * Math.exp(-beat * 6)); ctx.restore();
  hsLids(0, 'rgba(0,0,0,0)'); bloom(0.2); };
// pupil: your eyelid is pulled open by a gloved thumb, the penlight flares
SHOT_FN.pupil = (lt, dur, t) => { const st = hsRoom(t, 'night', 0.8); const S = st.scene;
  if (!HS.glove) { HS.glove = makeHand(1, { skin: '#9cc0e8' }); HS.glove2 = makeHand(-1, { skin: '#9cc0e8' }); S.add(HS.glove.root, HS.glove2.root); HS.glove.skins.concat(HS.glove2.skins).forEach((m) => { m.map = null; m.bumpMap = null; m.roughness = 0.35; m.needsUpdate = true; });
    HS.pen = new THREE.Group(); S.add(HS.pen); HS.pen.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.14, 12).translate(0, -0.07, 0), STDm({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 })));
    HS.penTip = mesh(new THREE.CircleGeometry(0.0065, 12).rotateX(-Math.PI / 2), hsEmis('#ffffff', 4), 0, 0.001, 0); HS.pen.add(HS.penTip); HS.penL = new THREE.PointLight('#fff8f0', 2, 1.2, 2); HS.pen.add(HS.penL); HS.penL.position.set(0, 0.03, 0); }
  HS.glove.root.visible = HS.glove2.root.visible = HS.pen.visible = true; HS.lamp.intensity = 0.6; const C = hsV(...HS_POV), op = EZ.o3(seg(lt, 0.1, 0.5)), sw = Math.sin(lt * 2.2) * 0.012;
  // the thumb pulls the upper lid: the glove sits just above the eye, fingers to the left, across the top of the view
  hsAim(HS.glove, C.clone().add(hsV(0.08, 0.05 + 0.025 * op, -0.13)), hsV(-0.8, 0.45, -0.2), hsV(0, 0.3, 1)); poseHand(HS.glove, { curl: [0.35, 0.4, 0.45, 0.5], thumb: 0.0, spread: 0.3 });
  const tip = C.clone().add(hsV(0.03 + sw, -0.035, -0.26)); HS.pen.position.copy(tip); HS.pen.quaternion.setFromUnitVectors(hsV(0, 1, 0), C.clone().sub(tip).normalize());
  hsAim(HS.glove2, tip.clone().add(hsV(0.06, -0.1, -0.1)), hsV(-0.35, 0.55, 0.25), hsV(0.6, 0.2, -0.7)); poseHand(HS.glove2, { curl: [0.75, 0.8, 0.85, 0.9], thumb: 0.6, spread: 0.1 });
  camPt(st, HS_POV, [0.0, 1.08, -1.0], 62, t, 0.3, 5); renderStage(st, 1.0); if (TT > 20.4) hsBlur(18);
  const pp = hsV(); HS.penTip.getWorldPosition(pp); pp.project(st.cam); const px = (pp.x * 0.5 + 0.5) * W, py = (-pp.y * 0.5 + 0.5) * H, fl = op * (0.85 + 0.15 * Math.sin(lt * 9));
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; pvGlow(px, py, 700, 'rgba(255,240,220,0.7)', fl); pvGlow(px, py, 170, 'rgba(255,255,255,1)', fl); pvGlow(px, py, 70, 'rgba(255,255,255,1)', fl); ctx.restore();
  hsLids(lerp(0.15, 0.95, op), 'rgb(70,10,8)', 1); bloom(0.35); };
// mom: dark again, a dim blurred warm silhouette of the mom crying at the bedside
SHOT_FN.mom = (lt, dur, t) => { const st = hsRoom(t, 'night', 0.4); const M = HS.mom; M.root.visible = true; HS.lamp.intensity = 2.6; HS.lamp.position.set(0.25, 1.35, 1.25);
  const sob = Math.sin(lt * 7.5) * (0.6 + 0.4 * Math.sin(lt * 1.7));
  posePerson(M, { x: 0.72, z: 1.0, yaw: -1.0, sit: 1, lean: 0.3 + 0.03 * sob, headPitch: 0.35, armL: [1.55, -0.1, 2.75, -0.9], armR: [1.55, -0.1, 2.75, -0.9], emo: { cry: 1, sad: 1 }, cryShake: 1 });
  M.spine.rotation.z += 0.025 * sob; M.arms.forEach((A) => { A.sh.position.y += 0.012 * Math.max(0, sob); }); HS.chair.position.set(0.74, 0, 1.0); HS.chair.rotation.y = -1.0;
  camPt(st, HS_POV, [0.62, 1.12, 0.75], 52, t, 0.25, 7); renderStage(st, 1.7); M.arms.forEach((A) => { A.sh.position.y -= 0.012 * Math.max(0, sob); });
  hsBlur(5); pvTint('#ffa060', 0.2, 'multiply'); pvTint('#1a0a04', 0.2);
  const op = 0.85 + 0.05 * Math.sin(lt * 1.1); hsLids(op, 'rgb(6,3,2)', 1); vignette(0.5); bloom(0.3); HS.lamp.position.set(-0.95, 1.1, 1.3); };
// eyes: week 3, the lids open, blur clears: the room in cool daylight
function hsPovCam(st, t, lt, look = [0.05, 0.78, -1.6], f = 70, amt = 0.25) { camPt(st, HS_POV, look, f, t, amt, 11); }
SHOT_FN.eyes = (lt, dur, t) => { const st = hsRoom(t, 'day'); const M = HS.mom; M.root.visible = true; HS.chair.position.set(1.35, 0, -1.1); HS.chair.rotation.y = -0.6;
  posePerson(M, { x: 1.35, z: -1.1, yaw: -0.6, sit: 1, headPitch: 0.45, headYaw: 0.2, armL: [0.7, 0.1, 1.4], armR: [0.7, 0.1, 1.4], emo: { sad: 0.4, sleepy: 0.4 } });
  hsPovCam(st, t, lt, [0.05 + 0.1 * Math.sin(lt * 0.5), 0.62, -1.6], 70); renderStage(st, 1.0); bloom(0.25);
  const op = Math.min(EZ.o2(seg(lt, 0.0, 0.7)), 1 - Math.sin(seg(lt, 1.25, 1.55) * Math.PI) * 0.9); hsBlur(lerp(22, 0, EZ.io(seg(lt, 0.3, 2.3)))); hsLids(op * 1.25, '#000', 1); };
// phone: the bedside table, the phone lit and buzzing, notifications stacking
SHOT_FN.phone = (lt, dur, t) => { const st = hsRoom(t, 'day'); hsDrawPhone(lt); const buzz = mod(lt, 0.385) < 0.2 ? 1 : 0, j = buzz * 0.0014;
  HS.phone.position.set(-0.06 + j * Math.sin(lt * 190), 0.632, 0.09 + j * Math.cos(lt * 170)); HS.phone.rotation.y = 0.35 + buzz * 0.012 * Math.sin(lt * 230); HS.phGlow.intensity = 0.5;
  const p = hsV(); HS.phone.getWorldPosition(p); camPt(st, [p.x + 0.22, p.y + 0.62, p.z + 0.42 - lt * 0.02], [p.x + 0.03, p.y, p.z + 0.1], 36, t, 0.35, 13); renderStage(st, 0.95); bloom(0.25); };
// doctor: at the foot of the bed with a clipboard, shaking his head; the mom sits at the right
function hsPoseDoc(D, q) { posePerson(D, q); }
SHOT_FN.doctor = (lt, dur, t) => { const st = hsRoom(t, 'day'); const M = HS.mom, D = HS.doc; M.root.visible = D.root.visible = true; HS.chair.position.set(0.78, 0, -0.15); HS.chair.rotation.y = -0.75;
  posePerson(M, { x: 0.78, z: -0.15, yaw: -0.75, sit: 1, headYaw: -0.45, headPitch: 0.05, armL: [0.6, 0.05, 1.3], armR: [0.6, 0.05, 1.3], look: [-0.4, 0], emo: { sad: 0.8, fear: 0.3 } });
  const shake = Math.sin(lt * 5.2) * 0.32 * ss(0.6, 1.0, lt) * (1 - ss(2.4, 2.9, lt));
  posePerson(D, { x: 0.02, z: -0.45, yaw: 0.05, headYaw: shake, headPitch: 0.12, armL: [0.35, 0.05, 1.45, 0.5], armR: [0.35, 0.05, 1.45, 0.5], look: [0, -0.2], emo: { sad: 0.5, smile: 0 } });
  hsPovCam(st, t, lt, [0.1, 0.84, -1.6], 64); renderStage(st, 1.0); bloom(0.2); };
// wrong: the mom close, crying with her hands on her face; the doctor turns away toward the door
SHOT_FN.wrong = (lt, dur, t) => { const st = hsRoom(t, 'day'); const M = HS.mom, D = HS.doc; M.root.visible = D.root.visible = true; HS.chair.position.set(0.75, 0, 0.6); HS.chair.rotation.y = -0.6;
  posePerson(M, { x: 0.75, z: 0.6, yaw: -0.6, sit: 1, lean: 0.4, headPitch: 0.45, armL: [1.3, -0.08, 2.6, -0.9], armR: [1.3, -0.08, 2.6, -0.9], emo: { cry: 1, sad: 1 }, cryShake: 1 });
  const turn = EZ.io(seg(lt, 0.2, 1.2)), wk = seg(lt, 0.9, 3);
  posePerson(D, { x: lerp(0.2, 1.1, wk), z: lerp(-0.6, -1.7, wk), yaw: lerp(-0.3, 2.45, turn), walk: wk > 0 ? 0.8 : 0, headYaw: -0.3 * (1 - turn), armL: [0.35, 0.05, 1.45, 0.5], armR: [0.35, 0.05, 1.45, 0.5], emo: { sad: 0.6 } });
  camPt(st, HS_POV, [0.81, 1.0, 0.22], 58, t, 0.3, 17); renderStage(st, 1.0); bloom(0.2); };
// still: back in your bed at sunset, the mom asleep at the bedside, your still hands
function hsSunset(st, t, lt, look, f, dark = 0) { const M = HS.mom; M.root.visible = true; HS.chair.position.set(0.85, 0, 1.25); HS.chair.rotation.y = -Math.PI / 2;
  posePerson(M, { x: 0.82, z: 1.25, yaw: -Math.PI / 2, sit: 1, lean: 0.75, headRoll: -0.35, headPitch: 0.1, armL: [0.55, 0.05, 1.5, 0.5], armR: [0.55, 0.05, 1.5, 0.5], emo: { blink: 1, smile: 0.25 } });
  camPt(st, HS_POV, look, f, t, 0.2, 19); renderStage(st, 1.05 * (1 - dark)); pvTint('#ff9a50', 0.3 * (1 - dark), 'soft-light'); const sun = st.skyU.uSun.value; lensFlare(st, sun, 0.55 * (1 - dark)); bloom(0.45 * (1 - dark * 0.5)); }
SHOT_FN.still = (lt, dur, t) => { const st = hsRoom(t, 'sunset'); hsSunset(st, t, lt, [0.12 + lt * 0.03, 0.66, -1.6], 70); };
SHOT_FN.card = (lt, dur, t) => { const st = hsRoom(t, 'sunset'); const k = EZ.io(seg(lt, 0, 7)); const C = HS_POV;
  hsSunset(st, t, lt, [0.24 - k * 0.1, 0.74, -1.6], lerp(68, 58, k)); pvTint('#000', 0.45 * EZ.o2(seg(lt, 0, 0.8))); vignette(0.35); };

// ---- the MRI: lying in the bore, looking out of the end toward the scanner room
function hsMriBuild() { const st = makeStage({ hemi: 0.12, sky: 0xdde6f0, ground: 0x6a6a70, key: 0.9, keyCol: '#f4f6ff', box: 6, boxFar: 40, sunDist: 12 }); st.setSun(dirV(10 * DEG, 70 * DEG), hsV(0, 1, -3));
  const S = st.scene, R = RNG('hsmri'), white = STDm({ color: '#f2f3f4', roughness: 0.35 }), grey = STDm({ color: '#c8ccd2', roughness: 0.5 });
  { const pm = new THREE.PMREMGenerator(r3().r), es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: '#4a525c', side: THREE.BackSide }))); S.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  // the bore: an open tube (axis z) of radius 0.34, length 1.8, flared lip at the far end, panel seams, the light strip on top
  const L = 1.8, r = 0.34, z0 = 0.9, z1 = -0.9, y = 1.05;
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 64, 8, true).rotateX(Math.PI / 2), STDm({ color: '#d4d8de', roughness: 0.55, side: THREE.BackSide, map: g3Tex((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0.05)'); g.addColorStop(0.55, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 1; i < 7; i++) { x.fillStyle = 'rgba(20,24,30,0.55)'; x.fillRect(0, i * h / 7 - 2, w, 4); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(0, i * h / 7 + 2, w, 1.5); }
    for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(20,24,30,0.4)'; x.fillRect(i * w / 12 - 1.5, 0, 3, h); }
    speck(x, w, h, 3000, ['rgba(0,0,0,0.05)'], RNG('bore'), 1, 2); }, 1024, 512) }));
  tub.position.set(0, y, 0); tub.receiveShadow = true; S.add(tub);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(r + 0.06, 0.07, 16, 64), white); lip.position.set(0, y, z1); S.add(lip);
  const face = new THREE.Mesh(new THREE.RingGeometry(r + 0.1, 1.3, 64), white); face.position.set(0, y, z1 - 0.05); face.rotation.y = Math.PI; S.add(face);
  const face2 = new THREE.Mesh(new THREE.RingGeometry(r + 0.1, 1.3, 64), white); face2.position.set(0, y, z1 - 0.049); S.add(face2);
  hsBox(S, 2.4, 2.4, 1.6, STDm({ color: '#e8eaee', roughness: 0.4 }), 0, 1.15, 0.0).visible = false;
  HS.stripM = hsEmis('#7cc8ff', 2.6); S.add(mesh(new THREE.BoxGeometry(0.06, 0.006, L - 0.1), HS.stripM, 0, y + r - 0.004, 0, { cast: false }));
  HS.boreL = new THREE.PointLight('#8ccfff', 0.35, 1.2, 2); HS.boreL.position.set(0, y + 0.25, -0.2); S.add(HS.boreL);
  // the patient table + blanket inside, the head coil around the face
  hsBox(S, 0.56, 0.06, 4.0, STDm({ color: '#d8dce2', roughness: 0.5 }), 0, y - 0.25, -1.0); const bg = new THREE.PlaneGeometry(0.5, 1.7, 30, 60).rotateX(-Math.PI / 2), p = bg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 0.45; p.setY(i, y - 0.21 + 0.06 * Math.exp(-(((x) / 0.16) ** 2)) * ss(-0.9, -0.2, -z) + [-0.09, 0.09].reduce((a, lx) => a + 0.05 * Math.exp(-(((x - lx) / 0.06) ** 2) - (((z + 1.25) / 0.08) ** 2)), 0) + 0.006 * Math.sin(x * 40 + z * 9) - 0.07 * ss(0.2, 0.26, Math.abs(x))); p.setZ(i, z); }
  bg.computeVertexNormals(); S.add(mesh(bg, STDm({ color: '#a8c4e0', map: hsKnit('#ffffff'), roughness: 0.95, side: THREE.DoubleSide })));
  [-0.7, -0.35].forEach((a) => { const c = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 10, 32, Math.PI * 0.8), grey); c.position.set(0, y - 0.06, 0.3 + a * 0.2); c.rotation.z = Math.PI * 0.1; S.add(c); });
  S.add(mesh(new THREE.PlaneGeometry(0.12, 0.06), STDm({ color: '#8a9aa8', metalness: 0.9, roughness: 0.05 }), 0, y + 0.115, 0.25, { rx: Math.PI / 2 + 0.6, cast: false }));
  // the scanner room beyond: walls, ceiling panels, the control-room window glowing
  const wm = STDm({ color: '#d4dce4', map: hsWallTex('#ffffff'), roughness: 0.9 });
  hsBox(S, 7, 3, 0.1, wm, 0, 1.5, -4.8); hsBox(S, 0.1, 3, 6, wm, -3, 1.5, -2); hsBox(S, 0.1, 3, 6, wm, 3, 1.5, -2);
  S.add(mesh(new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2), STDm({ color: '#b8bcc4', roughness: 0.4, map: wrap(texNoise('hsmf', '#d0d4d8', ['#c0c4c8', '#e0e4e8'], 8000), 6, 6) }), 0, 0, -2, { cast: false }));
  S.add(mesh(new THREE.PlaneGeometry(7, 7).rotateX(Math.PI / 2), STDm({ map: hsCeilTex(), roughness: 0.95 }), 0, 2.9, -2, { cast: false }));
  [[-0.9, -2.6], [0.9, -2.6], [0, -4.0]].forEach(([x, z]) => S.add(mesh(new THREE.PlaneGeometry(1.1, 0.55).rotateX(Math.PI / 2), hsEmis('#f2f6ff', 1.6), x, 2.88, z, { cast: false })));
  S.add(mesh(new THREE.PlaneGeometry(1.8, 0.8), hsEmis('#9ab8d8', 0.6), 1.2, 1.55, -4.74, { cast: false })); hsBox(S, 1.9, 0.06, 0.12, STDm({ color: '#a8aeb6', metalness: 0.5 }), 1.2, 1.12, -4.7);
  hsBox(S, 0.9, 2.1, 0.06, STDm({ color: '#8a96a4', metalness: 0.4, roughness: 0.4 }), -1.6, 1.05, -4.74); S.add(mesh(new THREE.CircleGeometry(0.16, 24), STDm({ color: '#f4d020' }), -1.6, 1.6, -4.7, { cast: false }));
  hsBox(S, 0.6, 1.0, 0.4, STDm({ color: '#e8e8e4' }), 2.5, 0.5, -3.6); const room = new THREE.PointLight('#fff2e0', 1.6, 9, 1.2); room.position.set(0, 2.5, -3); S.add(room);
  return st; }
SHOT_FN.mri = (lt, dur, t) => { const st = once('hsMri', hsMriBuild); const k = lt / dur; HS.stripM.emissiveIntensity = 2.6 + 0.25 * Math.sin(lt * 18) * ss(1.2, 1.5, lt);
  const vib = ss(1.2, 1.5, lt) * 0.0012 * Math.sin(lt * 120); camPt(st, [0 + vib, 1.1 + vib, 0.55 - k * 0.15], [0, 1.02, -3], 74, t, 0.15, 23); renderStage(st, 0.55); vignette(0.55); bloom(0.35); };

// ---- the brain scans (grey slices; orange-yellow activation blobs grow with k)
let HSBR = null;
function hsSlice(x, cx, cy, rx, ry, kind, seed) { const R = RNG('slice' + seed); x.save(); x.translate(cx, cy);
  if (kind === 'ax') { x.fillStyle = '#d8d8d8'; x.beginPath(); x.ellipse(0, 0, rx * 1.08, ry * 1.08, 0, 0, TAU); x.fill(); x.fillStyle = '#1a1a1a'; x.beginPath(); x.ellipse(0, 0, rx * 1.02, ry * 1.02, 0, 0, TAU); x.fill();
    x.fillStyle = '#8a8a8a'; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill(); x.save(); x.clip(); x.fillStyle = '#b4b4b4'; x.beginPath(); x.ellipse(0, 0, rx * 0.72, ry * 0.75, 0, 0, TAU); x.fill();
    x.strokeStyle = '#3a3a3a'; x.lineCap = 'round'; for (let i = 0; i < 70; i++) { const a = R.r(0, TAU), r0 = R.r(0.98, 1.0); let px = Math.cos(a) * rx * r0, py = Math.sin(a) * ry * r0; x.lineWidth = R.r(1.2, 2.6); x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 5; s++) { const b = a + Math.PI + R.n(0.9); px += Math.cos(b) * rx * 0.06; py += Math.sin(b) * ry * 0.06; x.lineTo(px, py); } x.stroke(); }
    x.fillStyle = '#2a2a2a'; x.fillRect(-1.5, -ry, 3, ry * 0.5); x.fillRect(-1.5, ry * 0.55, 3, ry * 0.5);
    x.beginPath(); x.ellipse(-rx * 0.1, -ry * 0.05, rx * 0.06, ry * 0.25, 0.25, 0, TAU); x.ellipse(rx * 0.1, -ry * 0.05, rx * 0.06, ry * 0.25, -0.25, 0, TAU); x.fill(); x.restore(); }
  else { x.fillStyle = '#d8d8d8'; x.beginPath(); x.ellipse(0, -ry * 0.05, rx * 1.08, ry * 1.0, 0, Math.PI * 0.95, Math.PI * 2.05); x.lineTo(rx * 0.7, ry * 0.9); x.lineTo(-rx * 0.4, ry * 0.9); x.closePath(); x.fill();
    x.fillStyle = '#1a1a1a'; x.beginPath(); x.ellipse(0, -ry * 0.05, rx * 1.02, ry * 0.94, 0, Math.PI * 0.95, Math.PI * 2.05); x.fill();
    x.fillStyle = '#9a9a9a'; x.beginPath(); x.ellipse(0, -ry * 0.05, rx, ry * 0.9, 0, Math.PI * 0.97, Math.PI * 2.03); x.quadraticCurveTo(rx * 0.9, ry * 0.35, rx * 0.3, ry * 0.3); x.lineTo(-rx * 0.9, ry * 0.25); x.closePath(); x.fill();
    x.save(); x.clip(); x.strokeStyle = '#3a3a3a'; for (let i = 0; i < 40; i++) { const a = R.r(Math.PI, TAU); let px = Math.cos(a) * rx, py = Math.sin(a) * ry * 0.9; x.lineWidth = R.r(1.2, 2.6); x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 4; s++) { px -= Math.cos(a) * rx * 0.07 + R.n(4); py -= Math.sin(a) * ry * 0.07 + R.n(4); x.lineTo(px, py); } x.stroke(); }
    x.strokeStyle = '#d8d8d8'; x.lineWidth = 6; x.beginPath(); x.ellipse(0, ry * 0.05, rx * 0.45, ry * 0.25, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.restore();
    x.fillStyle = '#7a7a7a'; x.beginPath(); x.ellipse(rx * 0.55, ry * 0.5, rx * 0.32, ry * 0.25, 0, 0, TAU); x.fill(); x.strokeStyle = '#3a3a3a'; x.lineWidth = 1.5; for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(rx * 0.55, ry * 0.5, rx * 0.3 * (1 - i * 0.12), ry * 0.22 * (1 - i * 0.12), 0, 0, Math.PI); x.stroke(); }
    x.fillStyle = '#8a8a8a'; x.fillRect(rx * 0.12, ry * 0.3, rx * 0.16, ry * 0.75); }
  x.restore(); }
function hsBlob(x, cx, cy, r, k) { if (k <= 0.01) return; x.save(); x.globalCompositeOperation = 'lighter'; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r * k); g.addColorStop(0, 'rgba(255,250,150,1)'); g.addColorStop(0.35, 'rgba(255,190,40,0.95)'); g.addColorStop(0.7, 'rgba(255,90,10,0.7)'); g.addColorStop(1, 'rgba(255,40,0,0)');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r * k, 0, TAU); x.fill(); x.restore(); }
// the big screen: a sagittal slice + two axial slices, a minimal header; k = activation 0..1
function hsBrainDraw(T, k, variant = 0) { const { x, w, h } = T; x.fillStyle = '#06080c'; x.fillRect(0, 0, w, h); x.fillStyle = '#121a26'; x.fillRect(0, 0, w, 46);
  x.fillStyle = '#9ab8d8'; x.font = 'bold 26px Arial'; x.textAlign = 'left'; x.fillText(variant ? 'RM · AXIAL' : 'RM FUNCIONAL', 18, 32); x.textAlign = 'right'; x.fillStyle = k > 0.05 ? '#ffb040' : '#6a7a8a'; x.fillText(variant ? 'SERIE 4' : 'TAREA: CASA', w - 18, 32);
  const P = variant ? [['ax', 0.25, 0.55, 0.19, 0.36, 3], ['ax', 0.75, 0.55, 0.19, 0.36, 4]] : [['sag', 0.3, 0.52, 0.24, 0.34, 1], ['ax', 0.66, 0.53, 0.13, 0.3, 2], ['ax', 0.88, 0.53, 0.1, 0.24, 5]];
  P.forEach(([kd, cx, cy, rx, ry, sd]) => { hsSlice(x, cx * w, cy * h, rx * w, ry * h, kd, sd); const RR = RNG('blob' + sd); const n = kd === 'sag' ? 4 : 4;
    for (let i = 0; i < n; i++) { const a = RR.r(0, TAU), d = RR.r(0.25, 0.7), bx = cx * w + Math.cos(a) * d * rx * w, by = cy * h + Math.sin(a) * d * ry * h * (kd === 'sag' ? 0.6 : 1) - (kd === 'sag' ? ry * h * 0.2 : 0), kk = clamp(k * 1.4 - i * 0.12);
      hsBlob(x, bx, by, RR.r(0.035, 0.07) * w * (kd === 'sag' ? 1.2 : 0.9), kk); } });
  if (!variant) { const g = x.createLinearGradient(30, 0, 230, 0); g.addColorStop(0, '#ff3000'); g.addColorStop(0.5, '#ffa020'); g.addColorStop(1, '#fff8a0'); x.fillStyle = g; x.fillRect(30, h - 40, 200, 16); x.fillStyle = '#9ab8d8'; x.font = 'bold 20px Arial'; x.textAlign = 'left'; x.fillText('ACTIVACIÓN', 246, h - 25); }
  T.t.needsUpdate = true; }

// ---- the control room seen from the scanner room: the glass, a technician with a microphone, the screens
function hsCtlBuild() { const st = makeStage({ hemi: 0.35, sky: 0xc8d4e4, ground: 0x4a4a52, key: 0.8, keyCol: '#eef2ff', box: 6, boxFar: 40, sunDist: 14 }); st.setSun(dirV(20 * DEG, 65 * DEG), hsV(0, 1, -1.5));
  const S = st.scene, R = RNG('hsctl'); { const pm = new THREE.PMREMGenerator(r3().r), es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: '#7a8a9a', side: THREE.BackSide }))); S.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); }
  const wm = STDm({ color: '#c4ccd6', map: hsWallTex('#ffffff'), roughness: 0.9 }), wm2 = STDm({ color: '#d8dee6', map: hsWallTex('#ffffff'), roughness: 0.9 }), dk = STDm({ color: '#2a2e36', roughness: 0.4 });
  // control room z -3.2..0 ; the glass wall at z 0 (window x -1.6..1.6, y 0.95..2.1); the scanner room on z > 0
  S.add(mesh(new THREE.PlaneGeometry(8, 9).rotateX(-Math.PI / 2), STDm({ color: '#8a8e96', roughness: 0.5, map: wrap(texNoise('hscf', '#9a9ea6', ['#8a8e96', '#a8acb4', '#7a7e86'], 9000), 6, 6) }), 0, 0, 0.5, { cast: false }));
  S.add(mesh(new THREE.PlaneGeometry(8, 9).rotateX(Math.PI / 2), STDm({ map: hsCeilTex(), roughness: 0.95 }), 0, 2.7, 0.5, { cast: false }));
  hsBox(S, 7, 2.7, 0.1, wm, 0, 1.35, -3.25); hsBox(S, 0.1, 2.7, 4, wm, -2.4, 1.35, -1.4); hsBox(S, 0.1, 2.7, 4, wm, 2.4, 1.35, -1.4);
  hsBox(S, 3.2, 0.95, 0.16, wm2, 0, 0.475, 0); hsBox(S, 3.2, 0.6, 0.16, wm2, 0, 2.4, 0); hsBox(S, 2.0, 2.7, 0.16, wm2, -2.6, 1.35, 0); hsBox(S, 2.0, 2.7, 0.16, wm2, 2.6, 1.35, 0);
  const alu = STDm({ color: '#9aa0a8', metalness: 0.6, roughness: 0.35 }); [-1.6, 1.6].forEach((x) => hsBox(S, 0.07, 1.2, 0.2, alu, x, 1.525, 0)); [0.95, 2.1].forEach((y) => hsBox(S, 3.27, 0.07, 0.2, alu, 0, y, 0));
  const refl = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.0)'); g.addColorStop(0.36, 'rgba(255,255,255,0.35)'); g.addColorStop(0.42, 'rgba(255,255,255,0.05)'); g.addColorStop(0.62, 'rgba(255,255,255,0.0)'); g.addColorStop(0.66, 'rgba(255,255,255,0.22)'); g.addColorStop(0.7, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 256, 128);
  HS.glass = mesh(new THREE.PlaneGeometry(3.2, 1.15), new THREE.MeshBasicMaterial({ map: refl, transparent: true, opacity: 0.55, depthWrite: false, color: '#cfe0f0' }), 0, 1.525, 0.02, { cast: false }); S.add(HS.glass);
  // scanner-room side: the bore's housing edge in the corner, a speaker grille under the window
  hsBox(S, 0.6, 0.1, 0.16, STDm({ color: '#3a3e46' }), 1.1, 0.8, 0.1); S.add(mesh(new THREE.TorusGeometry(1.0, 0.32, 16, 48), STDm({ color: '#eef0f2', roughness: 0.35 }), -2.2, 1.0, 2.2, { ry: 0.5 }));
  S.add(mesh(new THREE.PlaneGeometry(6, 4).rotateX(Math.PI / 2), STDm({ color: '#d8dce0' }), 0, 2.7, 2.5, { cast: false }));
  // desk along the window with monitors, keyboards, the microphone on a gooseneck
  const desk = STDm({ color: '#d8d4cc', roughness: 0.5 }); hsBox(S, 3.6, 0.05, 0.8, desk, 0, 0.75, -0.6); hsBox(S, 3.6, 0.7, 0.04, STDm({ color: '#b8b4ac' }), 0, 0.37, -0.25);
  HS.small = []; [-1.25, 1.15].forEach((x, i) => { const T = hsCanvasTex(512, 320); hsBrainDraw(T, 0, 1); HS.small.push(T); const g = new THREE.Group(); g.position.set(x, 1.05, -0.4); g.rotation.y = Math.PI + (i ? 0.35 : -0.35); S.add(g);
    hsBox(g, 0.62, 0.4, 0.04, dk, 0, 0, 0); g.add(mesh(new THREE.PlaneGeometry(0.58, 0.36), new THREE.MeshBasicMaterial({ map: T.t, toneMapped: false }), 0, 0, 0.021, { cast: false })); hsBox(g, 0.05, 0.28, 0.05, dk, 0, -0.2, -0.05); });
  hsBox(S, 0.45, 0.02, 0.15, STDm({ color: '#2a2a30' }), -0.2, 0.785, -0.75); hsBox(S, 0.45, 0.02, 0.15, STDm({ color: '#2a2a30' }), 0.9, 0.785, -0.75);
  HS.mic = new THREE.Group(); HS.mic.position.set(-0.15, 0.78, -0.45); S.add(HS.mic); HS.mic.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 20), dk));
  { const pts = [hsV(0, 0.02, 0), hsV(0, 0.18, 0.02), hsV(0, 0.3, -0.06), hsV(0, 0.34, -0.18)]; HS.mic.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.008, 6), dk)); HS.mic.add(mesh(new THREE.CapsuleGeometry(0.02, 0.05, 4, 10).rotateX(Math.PI / 2 - 0.5), STDm({ color: '#1a1a1e', roughness: 0.6 }), 0, 0.33, -0.21));
    HS.micLed = mesh(new THREE.SphereGeometry(0.006, 8, 6), hsEmis('#ff3030', 3), 0.0, 0.03, 0.065); HS.mic.add(HS.micLed); }
  // back wall: the big brain-scan display and two side displays, a shelf, a poster
  HS.big = hsCanvasTex(1024, 640); hsBrainDraw(HS.big, 0, 0); { const g = new THREE.Group(); g.position.set(0.1, 1.62, -3.17); S.add(g); hsBox(g, 1.5, 0.94, 0.06, dk, 0, 0, 0); g.add(mesh(new THREE.PlaneGeometry(1.44, 0.9), new THREE.MeshBasicMaterial({ map: HS.big.t, toneMapped: false }), 0, 0, 0.032, { cast: false })); HS.bigG = g; }
  HS.side = []; [-1.22, 1.38].forEach((x, i) => { const T = hsCanvasTex(512, 320); hsBrainDraw(T, 0, 1); HS.side.push(T); const g = new THREE.Group(); g.position.set(x, 1.7, -3.17); S.add(g); hsBox(g, 0.8, 0.52, 0.05, dk, 0, 0, 0); g.add(mesh(new THREE.PlaneGeometry(0.76, 0.48), new THREE.MeshBasicMaterial({ map: T.t, toneMapped: false }), 0, 0, 0.027, { cast: false })); });
  hsBox(S, 1.2, 0.8, 0.4, STDm({ color: '#e0dcd4' }), -1.7, 0.4, -2.9); hsBox(S, 0.3, 0.2, 0.3, STDm({ color: '#4a7aa8' }), -1.9, 0.9, -2.9); hsBox(S, 0.25, 0.32, 0.22, STDm({ color: '#c8c4bc' }), -1.5, 0.96, -2.9);
  [[-0.6, -1.2], [0.8, -1.4]].forEach(([x, z]) => { const c = new THREE.Group(); c.position.set(x, 0, z); S.add(c); c.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8).translate(0, 0.22, 0), dk)); hsRBox(c, 0.48, 0.08, 0.46, 0.03, STDm({ color: '#2a3a5a' }), 0, 0.48, 0); hsRBox(c, 0.46, 0.5, 0.07, 0.03, STDm({ color: '#2a3a5a' }), 0, 0.8, -0.24); });
  // light: ceiling panels, the screens' glow on the faces
  [[-0.8, -1.6], [0.9, -1.6]].forEach(([x, z]) => S.add(mesh(new THREE.PlaneGeometry(1.1, 0.5).rotateX(Math.PI / 2), hsEmis('#eef4ff', 1.2), x, 2.69, z, { cast: false })));
  HS.ctlL = new THREE.PointLight('#e8eeff', 0.7, 6, 1.6); HS.ctlL.position.set(0, 2.3, -0.6); S.add(HS.ctlL); HS.scrL = new THREE.PointLight('#a8c0ff', 0.6, 3.2, 2); HS.scrL.position.set(0.1, 1.6, -2.7); S.add(HS.scrL);
  HS.frontL = new THREE.PointLight('#fff2e4', 0.5, 4, 2); HS.frontL.position.set(0.2, 1.7, -0.2); S.add(HS.frontL);
  // the people: the technician (scrubs, headset) seated at the mic, the doctor standing by the big screen
  HS.tech = makePerson({ female: true, skin: '#e0b088', hair: '#6a4028', hairStyle: 'pony', top: '#2f8a8a', bottom: '#2f8a8a', seed: 23, tie: '#2f8a8a' }); S.add(HS.tech.root);
  { const hs_ = HS.tech.head, r = HS.tech.headR; hs_.add(mesh(new THREE.TorusGeometry(r * 1.12, 0.008, 6, 24, Math.PI).rotateY(Math.PI / 2), dk, 0, r * 0.15, 0)); [-1, 1].forEach((s) => hs_.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 14).rotateZ(Math.PI / 2), dk, s * r * 1.02, -0.005, 0))); }
  HS.doc2 = hsMakeDoc({ noBoard: true }); S.add(HS.doc2.root);
  return st; }
function hsCtl(t, k) { const st = once('hsCtl', hsCtlBuild); const kq = Math.round(k * 40) / 40; if (HS.bigK !== kq) { HS.bigK = kq; hsBrainDraw(HS.big, kq, 0); HS.side.forEach((T) => hsBrainDraw(T, kq * 0.8, 1)); HS.small.forEach((T) => hsBrainDraw(T, kq * 0.8, 1)); }
  HS.scrL.color.set(k > 0.1 ? '#ffb070' : '#a8c0ff'); HS.scrL.intensity = 0.6 + 0.6 * k; return st; }
// voice: through the glass, the technician speaks into the mic; grey scans on the screens
SHOT_FN.voice = (lt, dur, t) => { const st = hsCtl(t, 0); const T = HS.tech, D = HS.doc2; const talk = Math.abs(Math.sin(lt * 9)) * 0.5 * (Math.sin(lt * 2.1) > -0.6 ? 1 : 0);
  posePerson(T, { x: -0.2, z: -1.05, yaw: 0.05, sit: 1, lean: 0.35, headPitch: 0.1, armL: [0.75, 0.1, 1.2], armR: [0.8, 0.2, 1.6, 0.2], look: [0, 0.1], emo: { open: talk, sad: 0.15 } }); HS.micLed.material.emissiveIntensity = 3;
  posePerson(D, { x: 1.0, z: -2.3, yaw: -0.25, headYaw: -0.2, armL: [0.3, 0.15, 1.8, 0.6], armR: [0.3, 0.15, 1.8, 0.6], emo: { sad: 0.2 } });
  camPt(st, [0.15 - lt * 0.04, 1.42, 1.9 - lt * 0.1], [0.1, 1.4, -2.0], 46, t, 0.3, 29); renderStage(st, 1.0); bloom(0.25); };
// lights: the scan lights up orange; the doctor leans in, surprised; the technician turns
SHOT_FN.lights = (lt, dur, t) => { const k = EZ.io(seg(lt, 0.0, 1.1)); const st = hsCtl(t, k); const T = HS.tech, D = HS.doc2, r = EZ.io(seg(lt, 0.35, 1.2)), r2 = EZ.io(seg(lt, 0.8, 1.7));
  posePerson(D, { x: 0.52, z: -2.2, yaw: -0.15, lean: 0.38 * r, headPitch: -0.15 * r, headYaw: 0.1, armL: [lerp(0.2, 0.75, r), 0.12, lerp(0.3, 0.5, r)], armR: [lerp(0.2, 0.75, r), 0.12, lerp(0.3, 0.5, r)], look: [0, -0.1], emo: { surprise: r, open: 0.5 * r } });
  posePerson(T, { x: -0.4, z: -2.0, yaw: lerp(0.05, 0.75, r2), sit: 1, lean: 0.15, headYaw: lerp(0, 0.35, r2), headPitch: -0.05, armL: [0.75, 0.1, 1.2], armR: [0.75, 0.1, 1.2], look: [0.3 * r2, 0], emo: { surprise: 0.8 * r2, open: 0.3 * r2 } });
  camPt(st, [0.05, 1.42, -0.2 - lt * 0.06], [0.08, 1.48, -3.2], 66, t, 0.25, 31); renderStage(st, 1.0); bloom(0.3 + 0.25 * k); };
// know: the doctor and the technician smile at each other; slow push on the lit brain
SHOT_FN.know = (lt, dur, t) => { const st = hsCtl(t, 1); const T = HS.tech, D = HS.doc2, p = EZ.io(seg(lt, 0, 4));
  posePerson(D, { x: 0.52, z: -2.2, yaw: -0.35, lean: 0.1, headYaw: -0.25, armL: [0.3, 0.12, 0.6], armR: [0.6, 0.1, 1.2], look: [-0.3, 0], emo: { smile: 1, open: 0.3 } });
  posePerson(T, { x: -0.4, z: -2.0, yaw: 0.75, sit: 1, headYaw: 0.35, armL: [0.75, 0.1, 1.2], armR: [0.75, 0.1, 1.2], look: [0.3, 0], emo: { smile: 1, open: 0.25 } });
  camPt(st, [0.06, 1.45, lerp(-0.25, -0.75, p)], [0.08, 1.55, -3.2], lerp(66, 50, p), t, 0.2, 37); renderStage(st, 1.0); bloom(0.45); };

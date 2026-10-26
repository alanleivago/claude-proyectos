// =====================================================================
//  SET storm — the night of 13 February 1997 off Cornwall: s13 s14 s15 s16 s17, and the storm surf at dusk s29.
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed stm.
//    log    s13  whoosh into the past: the ship's logbook, its pages flipping back year by year to 13 FEB 1997
//    sea    s14  the rounded cartoon container ship rolling in a black storm sea, rain, lightning, a lighthouse far off;
//                sailors on the bridge wing
//           s15  a rogue wave rears up behind the ship and slams over it (spray, foam)
//           s16  containers slide off the deck and splash into the sea; the bridge's OVERBOARD board flips to 62
//           s17  one container bursts in the waves: a cloud of Lego, the odometer on its side rolls to 5,000,000
//    shore  s29  dusk, still stormy: breakers carry the floating pieces back onto a Cornish beach
//  One sea world (Gerstner waves on a CPU-displaced grid, vertex-coloured foam), built once; the log is its own room.
//  Units: head radius = 1. The ship is ~92 long; people are c3Person billboards at STM_K.
// =====================================================================
const STM = {};
const STM_K = 1.35, STM_FOOT = 2.55 * STM_K;
const stmW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const stmV = (x, y, z) => new THREE.Vector3(x, y, z);
const stmSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// camera: never still — keys give the move, a ~5 %/s creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function stmCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = stmSpan(id), dur = b - a;
  const P = stmV(...c.p), L = stmV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(stmV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  const p = L.clone().add(off).add(d.multiplyScalar(dist * push));
  if (o.shake) { const k = o.shake; p.x += Math.sin(lt * 31) * k; p.y += Math.sin(lt * 23 + 1) * k; }
  return { p: p.toArray(), l: c.l, fov: c.fov };
}
const stmRack = (lt, id, a, b) => { const [t0, t1] = stmSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground pieces: placed in the WORLD where `at` (camera space) is at the shot's first frame; the camera then
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function stmFg(s, list, K, id, lt, o = {}) {
  const c = s.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 900);
  c3SetCam(c, stmCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = stmV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(stmV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
// merge plain geometries into one (for instanced Lego bricks)
function stmMerge(geos) {
  const parts = geos.map((g) => g.index ? g.toNonIndexed() : g), n = parts.reduce((a, g) => a + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  parts.forEach((g) => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return m;
}
// a Lego-ish 2x2 brick: rounded body + four studs (unit: ~1.6 wide)
function stmBrickGeo() {
  const g = [c3RBox(1.6, 0.96, 1.6, 0.08, 2).translate(0, 0.48, 0)];
  for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) g.push(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12).translate(x, 1.06, z));
  return stmMerge(g);
}
const STM_LEGO = ['#c91a09', '#0055bf', '#f2cd37', '#237841', '#f4f4f4', '#fe8a18', '#05131d', '#4b9f4a', '#36aebf', '#a0a5a9', '#c870a0'];

// ---- the sea: a sum of Gerstner waves, plus the rogue wave (a ridge that travels toward the ship and rises)
const STM_WAVES = [[1.0, 0.25, 2.3, 64, 0.0], [0.55, 1.0, 1.5, 36, 1.3], [-0.45, 1.0, 0.9, 19, 2.1], [1.0, -0.7, 0.55, 11, 0.7], [0.2, 1.0, 0.35, 7, 4.2]]
  .map(([dx, dz, a, L, ph]) => { const l = Math.hypot(dx, dz), k = TAU / L; return { dx: dx / l, dz: dz / l, a, k, w: Math.sqrt(9.8 * k) * 0.9, ph, q: 0.55 / (k * a * 5) }; });
// sea state per shot: storm (amplitude), rogue = {z0, z1, t0, t1, A} ridge moving along +z, shore = beach at z < zShore
function stmSea(x, z, t, st, out) {
  let dx = 0, dz = 0, y = 0;
  for (const v of STM_WAVES) { const f = v.k * (v.dx * x + v.dz * z) - v.w * t + v.ph, a = v.a * st.amp;
    y += a * Math.sin(f); const c = v.q * a * Math.cos(f); dx += c * v.dx; dz += c * v.dz; }
  let foam = 0;
  if (st.rogue) { const r = st.rogue, k = clamp((t - r.t0) / (r.t1 - r.t0)), zc = lerp(r.z0, r.z1, EZ.i2(k)), A = r.A * EZ.io(clamp(k * 1.4)) * (1 - 0.92 * EZ.io(clamp((t - r.t1) / 0.4)));
    const dir = r.dir ?? 1, d = dir * (z - zc) / r.w, front = d > 0 ? Math.exp(-d * d * 2.2) : Math.exp(-d * d * 0.5);   // steep face toward the ship
    const along = Math.exp(-Math.pow((x - r.x) / r.len, 2)); y += A * front * along; dz += -dir * A * 0.25 * front * along; const hh = A * front * along; foam += clamp((hh - 0.72 * A) / (0.2 * A + 1e-3)) * 0.9; }
  if (st.shore != null) { const sh = clamp((st.shore - z) / 40 + 1); y *= lerp(1, 0.25, sh); }   // waves shoal and flatten on the beach
  out.x = x + dx; out.y = y; out.z = z + dz; out.foam = foam; return out;
}
const stmRogue = (r, t) => { const k = clamp((t - r.t0) / (r.t1 - r.t0)); return { zc: lerp(r.z0, r.z1, EZ.i2(k)), A: r.A * EZ.io(clamp(k * 1.4)) * (1 - 0.92 * EZ.io(clamp((t - r.t1) / 0.4))) }; };
const STM_TMP = { x: 0, y: 0, z: 0, foam: 0 };
const stmH = (x, z, t, st) => stmSea(x, z, t, st, STM_TMP).y;

// ---- textures
function stmTexSky(dusk) {
  return c3Tex((x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    if (dusk) { g.addColorStop(0, '#2a2a4a'); g.addColorStop(0.32, '#5a4a6a'); g.addColorStop(0.47, '#e08a5a'); g.addColorStop(0.52, '#ffc070'); g.addColorStop(0.6, '#3a3048'); g.addColorStop(1, '#141220'); }
    else { g.addColorStop(0, '#0c1230'); g.addColorStop(0.35, '#26346a'); g.addColorStop(0.5, '#5a6aa8'); g.addColorStop(0.56, '#2a3868'); g.addColorStop(1, '#0a1024'); }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('sky', dusk ? 1 : 0);
    for (let i = 0; i < 260; i++) {   // heavy cloud billows, darker on top, lit at the bottom
      const cx = R.r(0, w), cy = R.r(h * 0.12, h * 0.5), r = R.r(30, 110);
      const gr = x.createRadialGradient(cx, cy + r * 0.3, r * 0.1, cx, cy, r);
      const lit = dusk ? `rgba(${200 + R.r(0, 55)},${120 + R.r(0, 60)},${110 + R.r(0, 40)},0.20)` : `rgba(${100 + R.r(0, 40)},${116 + R.r(0, 40)},${180 + R.r(0, 50)},0.24)`;
      gr.addColorStop(0, lit); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
      const dk = x.createRadialGradient(cx + R.n(20), cy - r * 0.35, 0, cx, cy - r * 0.35, r * 0.8); dk.addColorStop(0, dusk ? 'rgba(30,24,50,0.12)' : 'rgba(4,6,14,0.18)'); dk.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = dk; x.beginPath(); x.arc(cx, cy - r * 0.35, r * 0.8, 0, TAU); x.fill();
    }
  }, 2048, 1024);
}
function stmTexCorrugated(c) {
  return c3Tex((x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 32; i++) { const gx = i * w / 32; const g = x.createLinearGradient(gx, 0, gx + w / 32, 0); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0.22)'); x.fillStyle = g; x.fillRect(gx, 0, w / 32, h); }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, w, h * 0.05); x.fillRect(0, h * 0.95, w, h * 0.05);
    const R = RNG('rust', c); x.fillStyle = 'rgba(120,60,30,0.22)'; for (let i = 0; i < 18; i++) x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 6), R.r(10, 50)); }, 256, 128);
}
function stmTexHull() {   // navy topsides with a white sheer line; red below the boot-top (mapped by world-units UVs)
  const t = c3Tex((x, w, h) => { const g = x.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, '#9a1c18'); g.addColorStop(0.36, '#c8281e'); g.addColorStop(0.365, '#f4f4f4'); g.addColorStop(0.395, '#f4f4f4'); g.addColorStop(0.4, '#1c2e5a'); g.addColorStop(0.95, '#24386a'); g.addColorStop(0.955, '#f4f4f4'); g.addColorStop(1, '#f4f4f4');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) x.fillRect(i * w / 40, h * 0.4, 2, h * 0.55);   // plate seams
    x.fillStyle = 'rgba(160,80,40,0.25)'; const R = RNG('hullrust'); for (let i = 0; i < 40; i++) x.fillRect(R.r(0, w), R.r(h * 0.42, h * 0.9), 3, R.r(10, 40)); }, 1024, 256);
  return t;
}
function stmTexWindows() {
  return c3Tex((x, w, h) => { x.fillStyle = '#c9cdd6'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) { const on = (i * 7 + j * 3) % 5 !== 0; x.fillStyle = on ? '#ffd890' : '#2a3040'; x.beginPath(); x.roundRect(i * w / 8 + 10, j * h / 3 + 14, w / 8 - 20, h / 3 - 32, 10); x.fill(); } }, 512, 256);
}
function stmTexBridgeGlass() {
  return c3Tex((x, w, h) => { x.fillStyle = '#e8e8ea'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) { x.fillStyle = '#ffcf7a'; x.beginPath(); x.roundRect(i * w / 7 + 8, h * 0.18, w / 7 - 16, h * 0.62, 12); x.fill(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(i * w / 7 + 14, h * 0.22, 8, h * 0.5); } }, 512, 128);
}
function stmBoardDraw(s, n) {   // the OVERBOARD flip board on the bridge wing
  const x = s.boardCv.getContext('2d'), w = s.boardCv.width, h = s.boardCv.height;
  x.fillStyle = '#14161c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c230'; x.lineWidth = 10; x.strokeRect(8, 8, w - 16, h - 16);
  inked(x, 'OVERBOARD', w / 2, h * 0.17, h * 0.15, '#f2c230', { stroke: false, maxW: w * 0.86 });
  const txt = String(n).padStart(2, '0');
  for (let i = 0; i < 2; i++) { const cx = w * (0.3 + i * 0.4); x.fillStyle = '#2a2d36'; x.beginPath(); x.roundRect(cx - w * 0.19, h * 0.3, w * 0.38, h * 0.65, 16); x.fill();
    x.fillStyle = '#000'; x.fillRect(cx - w * 0.19, h * 0.62, w * 0.38, 4);
    inked(x, txt[i], cx, h * 0.63, h * 0.66, '#ffffff', { stroke: false, font: '"Arial Black", Arial' }); }
  s.boardTex.needsUpdate = true;
}
function stmOdoDraw(s, v) {   // the odometer placard on the container's side: rolling digits up to 5,000,000
  const x = s.odoCv.getContext('2d'), w = s.odoCv.width, h = s.odoCv.height;
  x.fillStyle = '#f2ead4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a2a18'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12);
  inked(x, 'TOY BRICKS — PIECES', w / 2, h * 0.17, h * 0.11, '#3a2a18', { stroke: false, maxW: w * 0.86 });
  const N = 7, cw = w * 0.115, x0 = w / 2 - (N * cw + (N - 1) * 4 + 2 * 14) / 2;
  let xx = x0;
  for (let i = 0; i < N; i++) {
    if (i === 1 || i === 4) { inked(x, ',', xx + 7, h * 0.78, h * 0.3, '#3a2a18', { stroke: false }); xx += 14; }
    const place = Math.pow(10, N - 1 - i), d = (v / place) % 10, k = d - Math.floor(d), dig = Math.floor(d);
    x.save(); x.beginPath(); x.rect(xx, h * 0.34, cw, h * 0.56); x.clip(); x.fillStyle = '#1a1a1e'; x.fillRect(xx, h * 0.34, cw, h * 0.56);
    const roll = i < N - 1 ? EZ.io(k > 0.9 ? (k - 0.9) / 0.1 : 0) : k;   // lower digits spin, higher ones click over
    for (const [dd, off] of [[dig, -roll], [(dig + 1) % 10, 1 - roll]]) inked(x, String(dd), xx + cw / 2, h * 0.62 + off * h * 0.56, h * 0.42, '#ffffff', { stroke: false, font: '"Arial Black", Arial' });
    const g = x.createLinearGradient(0, h * 0.34, 0, h * 0.9); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = g; x.fillRect(xx, h * 0.34, cw, h * 0.56);
    x.restore(); xx += cw + 4;
  }
  s.odoTex.needsUpdate = true;
}

// ---- the sea world
function stmBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(46, W / H, 0.5, 1400), s = { scene, cam };
  scene.fog = new THREE.Fog('#2c3c6a', 160, 700); s.fog = scene.fog;
  s.hemi = new THREE.HemisphereLight('#9ab0e8', '#142038', 1.1); scene.add(s.hemi);
  s.key = new THREE.DirectionalLight('#d8e2ff', 1.25); s.key.position.set(-60, 120, 80); scene.add(s.key);
  s.rim = new THREE.DirectionalLight('#ffb070', 0.75); s.rim.position.set(80, 40, -90); scene.add(s.rim);
  s.fill = new THREE.DirectionalLight('#e8eeff', 0.5); s.fill.position.set(60, 30, 160); scene.add(s.fill);   // front fill: ship and crew read clearly
  s.flash = new THREE.DirectionalLight('#e8f0ff', 0); s.flash.position.set(-40, 200, -120); scene.add(s.flash);
  scene.children.forEach((c) => c.isLight && c.layers.enableAll());
  // sky dome + far ocean (fog hides the seam)
  s.skyNight = stmTexSky(false); s.skyDusk = stmTexSky(true);
  s.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.MeshBasicMaterial({ map: s.skyNight, side: THREE.BackSide, fog: false, toneMapped: false }));
  scene.add(s.sky);
  s.farSea = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), c3Prop('#0e2230', { rough: 0.2, metal: 0.2 })); s.farSea.rotation.x = -Math.PI / 2; s.farSea.position.y = -1.5; scene.add(s.farSea);
  // the near sea: a 520 x 520 grid displaced every frame, coloured deep teal -> foam on the crests
  const N = 220, seaG = new THREE.PlaneGeometry(520, 520, N, N); seaG.rotateX(-Math.PI / 2);
  s.seaBase = Float32Array.from(seaG.attributes.position.array);
  seaG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(seaG.attributes.position.count * 3), 3));
  s.sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.25, envMapIntensity: 0.9 }));
  s.sea.frustumCulled = false; scene.add(s.sea); c3Layer(s.sea, C3.L_FOCUS);
  // the rogue wave's curling lip (s15): a half-pipe of water along the crest, foam-streaked, that pitches forward
  const lipG = new THREE.CylinderGeometry(8, 8, 150, 32, 1, true, 0, Math.PI * 1.15); lipG.rotateZ(Math.PI / 2);
  const lipT = c3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d8eef4'); g.addColorStop(0.25, '#3a8a9a'); g.addColorStop(0.7, '#0e3a4a'); g.addColorStop(1, '#082a36'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('lip'); x.strokeStyle = 'rgba(230,245,250,0.55)'; for (let i = 0; i < 70; i++) { x.lineWidth = R.r(2, 6); const xx = R.r(0, w); x.beginPath(); x.moveTo(xx, R.r(0, h * 0.3)); x.bezierCurveTo(xx + R.n(30), h * 0.4, xx + R.n(30), h * 0.6, xx + R.n(20), R.r(h * 0.5, h)); x.stroke(); } }, 512, 256);
  s.lip = new THREE.Mesh(lipG, c3Prop('#ffffff', { map: lipT, rough: 0.18, metal: 0.2 })); s.lip.material.side = THREE.DoubleSide; c3Ink(s.lip, 0.0); s.lip.visible = false; scene.add(s.lip); c3Layer(s.lip, C3.L_FOCUS);
  stmWaveBuild(s);
  // the lighthouse on a dark headland far off, its beam sweeping
  const hd = new THREE.Group(); hd.position.set(-330, 0, -420); scene.add(hd); s.headland = hd;
  for (let i = 0; i < 7; i++) { const R = RNG('cliff', i); const m = c3Mesh(new THREE.SphereGeometry(R.r(40, 70), 14, 10), c3Prop('#141a22', { rough: 0.9 }), 0); m.scale.set(1.6, R.r(0.55, 0.9), 1); m.position.set(i * 55 - 160, -6, R.n(20)); hd.add(m); }
  const tw = new THREE.Group(); tw.position.set(-20, 38, 0); hd.add(tw);
  for (let i = 0; i < 4; i++) tw.add(cyl(5 - i * 0.6, 5.4 - i * 0.6, 7, c3Prop(i % 2 ? '#c8281e' : '#f0f0f0', { rough: 0.5 }), 0, 3.5 + i * 7, 0, 0.0, 20));
  const lamp = c3Mesh(new THREE.SphereGeometry(3.4, 16, 10), c3Flat('#fff6d0', { glow: '#ffe8a0' }), 0); lamp.position.y = 31; tw.add(lamp);
  s.beam = new THREE.Group(); s.beam.position.set(-350, 69, -420); scene.add(s.beam);
  const bm = new THREE.Mesh(new THREE.ConeGeometry(26, 520, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0c0', transparent: true, opacity: 0.11, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false }));
  bm.rotation.z = Math.PI / 2; bm.position.x = 260; s.beam.add(bm);
  // ---- the ship (bow at +x): a rounded hull, stacked containers, the bridge block aft with wings, a funnel and a mast
  const ship = new THREE.Group(); s.ship = ship; scene.add(ship);
  const hullG = new THREE.Group(); ship.add(hullG); s.hullG = hullG;
  const prof = new THREE.Shape();
  prof.moveTo(-44, 9); prof.lineTo(-44, 0.5); prof.quadraticCurveTo(-44, -6, -36, -6.5); prof.lineTo(34, -6.5);
  prof.quadraticCurveTo(44, -6.5, 47, 2); prof.quadraticCurveTo(48.5, 7, 49.5, 10.5); prof.lineTo(-44, 10.5); prof.lineTo(-44, 9);
  const hullGeo = new THREE.ExtrudeGeometry(prof, { depth: 19, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.8, bevelSegments: 6, curveSegments: 24 });
  hullGeo.translate(0, 0, -9.5);
  { const uv = hullGeo.attributes.uv, p = hullGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + 50) / 100, (p.getY(i) + 8.5) / 19.5); }   // side faces: UVs from height
  hullGeo.computeVertexNormals();
  const ht = stmTexHull(); hullG.add(c3Mesh(hullGeo, c3Prop('#ffffff', { map: ht, rough: 0.35, metal: 0.25 }), 0.12));
  // the bow taper: squash the front of the hull to a rounded point
  { const p = hullGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); if (x > 24) { const k = clamp((x - 24) / 26); p.setZ(i, p.getZ(i) * (1 - 0.72 * k * k)); } if (x < -38) { const k = clamp((-38 - x) / 8); p.setZ(i, p.getZ(i) * (1 - 0.18 * k)); } } p.needsUpdate = true; hullGeo.computeVertexNormals(); }
  const deck = c3Mesh(c3RBox(86, 0.6, 21, 0.3), c3Prop('#5a6a5a', { rough: 0.7 }), 0.03); deck.position.set(0, 10.6, 0); hullG.add(deck);
  const bulw = c3Mesh(c3RBox(30, 2.4, 1.2, 0.5), c3Prop('#1c2e5a', { rough: 0.4 }), 0.04); bulw.position.set(38, 12, 0); bulw.scale.z = 18; hullG.add(bulw);   // a raised forecastle
  const anchor = c3Mesh(new THREE.TorusGeometry(1.4, 0.35, 8, 16), c3Chrome('#9aa0aa'), 0.02); anchor.position.set(42, 6, 9.4); hullG.add(anchor);
  // containers: 6 rows x 4 across x 3 high; each its own colour; s.ct = list with their rest pose
  const CC = ['#c8281e', '#1e5aa8', '#e8862a', '#2a8a4a', '#f2c230', '#1a8a9a', '#8a3aa8', '#d8d8d8', '#5a3a2a', '#e85a8a'];
  const ctMats = CC.map((c) => c3Prop('#ffffff', { map: stmTexCorrugated(c), rough: 0.45, metal: 0.25 }));
  const ctGeo = c3RBox(11.2, 4.8, 4.9, 0.45, 2);
  s.ct = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) for (let l = 0; l < 3; l++) {
    const R = RNG('ct', r, c, l), m = c3Mesh(ctGeo, ctMats[R.i(0, CC.length)], 0.07);
    const p = stmV(-24 + r * 11.9, 13.3 + l * 5.05, -7.8 + c * 5.2);
    m.position.copy(p); m.rotation.y = R.n(0.01); hullG.add(m); s.ct.push({ m, p, r, c, l });
  }
  // bridge block aft: three rounded tiers, a glass band, wings out to both sides, a funnel and a mast with lights
  const white = c3Prop('#d6d8de', { rough: 0.5 });
  const br = new THREE.Group(); br.position.set(-37, 10.8, 0); hullG.add(br); s.bridge = br;
  br.add(rb(11, 7, 19, white, 0, 3.5, 0, 0.06)); br.add(rb(10, 6.5, 17, white, 0.4, 10.2, 0, 0.06)); br.add(rb(9.5, 6, 22, white, 0.8, 16.4, 0, 0.06));
  const winT = stmTexWindows();
  for (const z of [1, -1]) { const p = pl(10.4, 12.5, c3Flat('#ffffff', { map: winT }), 0, 6.8, z * 9.56, z > 0 ? 0 : Math.PI); br.add(p); }
  const glass = pl(21.6, 4.2, c3Flat('#ffffff', { map: stmTexBridgeGlass(), glow: '#ffc070' }), 5.58, 16.6, 0, Math.PI / 2); br.add(glass);
  for (const z of [1, -1]) { const wing = rb(6, 0.7, 8, white, 1.5, 13.6, z * 14.5, 0.04); br.add(wing);
    const rail = rb(6, 1.8, 0.25, white, 1.5, 14.9, z * 18.4, 0.02); br.add(rail); const rail2 = rb(0.25, 1.8, 8, white, 4.4, 14.9, z * 14.5, 0.02); br.add(rail2); }
  br.add(rb(10, 0.9, 23, c3Prop('#1c2e5a', { rough: 0.4 }), 0.8, 19.8, 0, 0.04));
  const fun = new THREE.Group(); fun.position.set(-4.5, 20, 0); br.add(fun);
  fun.add(c3Mesh(c3RBox(5.6, 9, 4.8, 1.6), c3Prop('#1c2e5a', { rough: 0.4 }), 0.05)).position.y = 4.5;
  const band = c3Mesh(c3RBox(5.7, 1.6, 4.9, 0.7), c3Prop('#c8281e', { rough: 0.4 }), 0.0); band.position.y = 6.5; fun.add(band);
  const mast = new THREE.Group(); mast.position.set(1.5, 20.4, 0); br.add(mast);
  mast.add(cyl(0.3, 0.4, 9, c3Prop('#d8d8d8', { rough: 0.4 }), 0, 4.5, 0, 0.02, 8)); mast.add(rb(0.4, 0.4, 6, c3Prop('#d8d8d8', { rough: 0.4 }), 0, 7, 0, 0.02));
  s.navL = [];
  for (const [z, c] of [[3, '#3aff6a'], [-3, '#ff3a2a'], [0, '#fff6d0']]) { const b = c3Mesh(new THREE.SphereGeometry(0.55, 10, 8), c3Flat(c, { glow: c }), 0); b.position.set(0, z === 0 ? 9.4 : 7, z); mast.add(b); s.navL.push(b); }
  const sl = new THREE.PointLight('#ffd8a0', 1.4, 60, 1.6); sl.position.set(4, 18, 12); sl.layers.enableAll(); br.add(sl);
  // the OVERBOARD flip board on the port bridge wing's front, facing the camera side (+z)
  s.boardCv = Object.assign(document.createElement('canvas'), { width: 512, height: 300 }); s.boardTex = new THREE.CanvasTexture(s.boardCv); s.boardTex.encoding = THREE.sRGBEncoding;
  const bf = rb(11.4, 7.0, 0.6, c3Prop('#2a2d36', { rough: 0.4 }), 1.5, 9.4, 18.6, 0.04); br.add(bf);
  for (const x of [-3.5, 6.5]) br.add(rb(0.4, 2.2, 0.4, c3Prop('#2a2d36', { rough: 0.4 }), x, 13.2, 18.6, 0.02));
  s.board = pl(10.6, 6.2, c3Flat('#ffffff', { map: s.boardTex }), 1.5, 9.4, 18.92); br.add(s.board); stmBoardDraw(s, 0);
  // sailors on the port wing (navy coats; the captain with a white beard)
  s.sailors = [
    c3Person({ key: 'capt', outfit: 'navy', hairStyle: 'white', fx: ['beard_full'] }),
    c3Person({ key: 'mate', outfit: 'navy', hairStyle: 'spiky' }),
    c3Person({ key: 'deck', outfit: 'mustard', hairStyle: 'messy', fx: ['mustache'] }),
  ];
  s.sailors.forEach((p, i) => { p.g.scale.setScalar(STM_K * 1.7); p.g.position.set([2.6, 0.4, -1.2][i], 14.0 + STM_FOOT * 1.7, [11.2, 14.4, 17.4][i]); br.add(p.g); });
  // containers that fall (s16) and the one that bursts (s17): the falling ones are the port column (c 3), top two tiers
  s.fallers = s.ct.filter((c) => c.c === 3 && c.l >= 1).sort((a, b) => b.l - a.l || b.r - a.r);
  // the burst container (s17): its own mesh floating in the waves near the camera, doors that blow open, an odometer
  const bc = new THREE.Group(); s.burst = bc; scene.add(bc);
  bc.add(c3Mesh(c3RBox(11.2, 4.8, 4.9, 0.45, 2), c3Prop('#ffffff', { map: stmTexCorrugated('#1e5aa8'), rough: 0.45, metal: 0.25 }), 0.07));
  s.doors = [];
  for (const z of [1, -1]) { const hinge = new THREE.Group(); hinge.position.set(5.65, 0, z * 2.4); bc.add(hinge);
    const d = c3Mesh(c3RBox(0.3, 4.6, 2.35, 0.1), c3Prop('#ffffff', { map: stmTexCorrugated('#1a4a90'), rough: 0.45, metal: 0.25 }), 0.04); d.position.set(0.15, 0, -z * 1.18); hinge.add(d);
    for (const yy of [-1.2, 1.2]) { const bar = cyl(0.08, 0.08, 4.4, c3Chrome(), 0.35, 0, -z * 1.6, 0.0, 6); bar.position.y = yy * 0.0; hinge.add(bar); }
    s.doors.push({ hinge, z }); }
  s.odoCv = Object.assign(document.createElement('canvas'), { width: 640, height: 260 }); s.odoTex = new THREE.CanvasTexture(s.odoCv); s.odoTex.encoding = THREE.sRGBEncoding;
  const plq = rb(6.4, 2.7, 0.2, c3Prop('#3a2a18', { rough: 0.6 }), -0.6, 0.6, 2.52, 0.03); bc.add(plq);
  s.odo = pl(6.0, 2.45, c3Prop('#ffffff', { map: s.odoTex, rough: 0.6 }), -0.6, 0.6, 2.64); bc.add(s.odo); stmOdoDraw(s, 0);
  bc.visible = false;
  // Lego: an instanced cloud of bricks (burst / riding the surf), each its own colour
  s.nBricks = 900;
  s.bricks = new THREE.InstancedMesh(stmBrickGeo(), c3Prop('#ffffff', { rough: 0.25, metal: 0.0, env: 1.2 }), s.nBricks); s.bricks.frustumCulled = false; scene.add(s.bricks);
  for (let i = 0; i < s.nBricks; i++) s.bricks.setColorAt(i, new THREE.Color(STM_LEGO[RNG('bc', i).i(0, STM_LEGO.length)]));
  s.bricks.instanceColor.needsUpdate = true;
  // spray: instanced soft white drops; rain streaks around the camera; a lightning bolt
  s.nSpray = 700;
  const puff = c3Tex((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(240,248,255,0.95)'); g.addColorStop(0.45, 'rgba(225,238,250,0.55)'); g.addColorStop(1, 'rgba(220,235,250,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 64, 64);
  // spray = water: shaded droplets stretched along their flight (every 4th one a faint mist puff behind them)
  s.spray = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshStandardMaterial({ color: '#dff4ff', roughness: 0.08, metalness: 0.1, emissive: '#3a7aa0', emissiveIntensity: 0.35 }), s.nSpray);
  s.spray.frustumCulled = false; scene.add(s.spray);
  s.mist = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: puff, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false }), s.nSpray);
  s.mist.frustumCulled = false; scene.add(s.mist);
  const streak = new THREE.BoxGeometry(0.05, 2.2, 0.05);
  s.rain = new THREE.InstancedMesh(streak, new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.26, depthWrite: false, toneMapped: false, fog: false }), 1800); s.rain.frustumCulled = false; scene.add(s.rain);
  s.rainSeed = [...Array(1800)].map((_, i) => { const R = RNG('srain', i); return [R.r(-40, 40), R.r(0, 60), R.r(18, 140), R.r(50, 64)]; });
  s.bolt = new THREE.Group(); scene.add(s.bolt);
  { const pts = []; const R = RNG('bolt'); let x = 0, y = 260; while (y > 0) { pts.push(stmV(x, y, 0)); x += R.n(14); y -= R.r(10, 26); } pts.push(stmV(x, -2, 0));
    s.bolt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0), 64, 1.0, 5), c3Flat('#f4f8ff', { glow: '#c8d8ff' })));
    for (let k = 0; k < 3; k++) { const i0 = 2 + k * 3, b = [pts[i0]]; let bx = pts[i0].x, by = pts[i0].y; for (let j = 0; j < 4; j++) { bx += R.r(-18, 18); by -= R.r(10, 20); b.push(stmV(bx, by, 0)); }
      s.bolt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b), 20, 0.5, 4), c3Flat('#f4f8ff', { glow: '#c8d8ff' }))); } }
  s.bolt.traverse((m) => { if (m.material) m.material.fog = false; });
  s.bolt.visible = false;
  // the shore for s29: a sandy beach rising out of the surf at z < 0, wet sand that mirrors the sky, dark cliffs, rocks
  const sh = new THREE.Group(); s.shore = sh; scene.add(sh); sh.visible = false;
  const sandG = new THREE.PlaneGeometry(520, 200, 60, 20); sandG.rotateX(-Math.PI / 2);
  { const p = sandG.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), x = p.getX(i); p.setY(i, (78 - z) * 0.1 + Math.sin(x * 0.05) * 0.4 + (z < -40 ? (-40 - z) * 0.3 : 0)); } sandG.computeVertexNormals(); }
  const sandT = c3Tex((x, w, h) => { x.fillStyle = '#b8895a'; x.fillRect(0, 0, w, h); const R = RNG('sandt');
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${R.r(90, 200)},${R.r(70, 150)},${R.r(40, 100)},${R.r(0.15, 0.4)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.62, 'rgba(0,0,0,0)'); g.addColorStop(0.78, 'rgba(60,40,30,0.45)'); g.addColorStop(1, 'rgba(50,34,26,0.55)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(240,230,210,0.35)'; x.lineWidth = 3; for (let i = 0; i < 5; i++) { const y = h * (0.66 + i * 0.05); x.beginPath(); x.moveTo(0, y); for (let k = 0; k <= 20; k++) x.lineTo(k * w / 20, y + Math.sin(k * 1.3 + i) * 6); x.stroke(); } }, 1024, 512);
  const sand = new THREE.Mesh(sandG, c3Prop('#ffffff', { map: sandT, rough: 0.8, metal: 0.0, env: 0.3 })); sand.position.set(0, 0, -90); sh.add(sand);
  for (let i = 0; i < 9; i++) { const R = RNG('scliff', i); const m = c3Mesh(new THREE.SphereGeometry(R.r(26, 48), 14, 10), c3Prop('#3a3638', { rough: 0.85 }), 0.05); m.scale.set(1.3, R.r(1.0, 1.6), 0.9); m.position.set(-180 + i * 48 + R.n(10), 6, -200 - R.r(0, 30)); sh.add(m); }
  for (let i = 0; i < 14; i++) { const R = RNG('rock', i); const m = c3Mesh(new THREE.DodecahedronGeometry(R.r(2, 5.5), 0), c3Prop('#2e2c30', { rough: 0.7, metal: 0.1 }), 0.05); m.position.set(R.r(-90, 90), R.r(-0.5, 1.5), R.r(-60, -15)); m.rotation.set(R.f(), R.f(), R.f()); if (Math.abs(m.position.x) > 30 || m.position.z < -58) sh.add(m); }
  { // foreground beach detail (s29): pebbles, shells, seaweed strands, a glossy wet band and lacy foam lines that slide
    const sandY = (z) => (78 - (z + 90)) * 0.1 + 0.02;
    const nP = 420, pg = new THREE.DodecahedronGeometry(0.5, 1), pm = c3Prop('#ffffff', { rough: 0.35, metal: 0.05 });
    const peb = new THREE.InstancedMesh(pg, pm, nP), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const PC = ['#6a6470', '#8a8078', '#b8aa98', '#4a4650', '#c8bca8', '#7a6a5a'];
    for (let i = 0; i < nP; i++) { const R = RNG('peb', i), x = R.r(-40, 50), z = R.r(-50, -13), k = R.r(0.12, 0.55);
      e.set(R.f(), R.f() * 6, R.f()); q.setFromEuler(e); m4.compose(stmV(x, sandY(z) + k * 0.12, z), q, stmV(k * 1.3, k * 0.45, k)); peb.setMatrixAt(i, m4); peb.setColorAt(i, new THREE.Color(PC[R.i(0, PC.length)])); }
    sh.add(peb);
    const shellG = new THREE.SphereGeometry(0.6, 12, 6, 0, TAU, 0, Math.PI / 2); shellG.scale(1, 0.45, 1.2);
    for (let i = 0; i < 26; i++) { const R = RNG('shell', i), z = R.r(-40, -14), m = c3Mesh(shellG, c3Prop(['#f4d8c0', '#f0b0a0', '#fff2e0', '#e8c070'][i % 4], { rough: 0.4 }), 0.02);
      m.position.set(R.r(-30, 40), sandY(z), z); m.rotation.y = R.r(0, TAU); m.scale.setScalar(R.r(0.6, 1.2)); sh.add(m); }
    const weedM = c3Prop('#2e4a1e', { rough: 0.5, metal: 0.1 }), weedM2 = c3Prop('#5a4a1a', { rough: 0.5 });
    for (let i = 0; i < 34; i++) { const R = RNG('weed', i), z0 = R.r(-30, -12), x0 = R.r(-34, 44), pts = [];
      for (let k = 0; k < 6; k++) pts.push(stmV(x0 + k * R.r(0.8, 1.6) * (R.f() < 0.5 ? 1 : -1) * 0.6 + k * 0.9, sandY(z0 - k * 0.6) + 0.12, z0 - k * R.r(0.3, 0.9) + Math.sin(k * 1.7 + i) * 0.8));
      const m = c3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, R.r(0.12, 0.26), 6), R.f() < 0.6 ? weedM : weedM2, 0.03); m.scale.y = 0.6; sh.add(m); }
    const wet = new THREE.Mesh(new THREE.PlaneGeometry(220, 12), c3Prop('#5a4a48', { rough: 0.06, metal: 0.55, transparent: true, env: 1.6 })); wet.material.opacity = 0.45;
    wet.rotation.x = -Math.PI / 2; wet.position.set(0, sandY(-17) + 0.04, -17); sh.add(wet);
    s.lace = [];
    const laceT = c3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('lace'); x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineCap = 'round';
      for (let i = 0; i < 3; i++) { x.lineWidth = 7 - i * 2; x.beginPath(); for (let k = 0; k <= 64; k++) { const xx = k * w / 64, yy = h * (0.3 + i * 0.22) + Math.sin(k * 0.7 + i) * 9 + R.n(5); k ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
      for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${R.r(0.4, 0.9)})`; x.beginPath(); x.arc(R.r(0, w), R.r(h * 0.2, h * 0.85), R.r(1, 4), 0, TAU); x.fill(); } }, 1024, 128);
    laceT.wrapS = THREE.RepeatWrapping; laceT.repeat.set(4, 1);
    for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 3.2), new THREE.MeshBasicMaterial({ map: laceT, transparent: true, depthWrite: false, toneMapped: false }));
      m.rotation.x = -Math.PI / 2; sh.add(m); s.lace.push(m); }
    s.sandY = sandY;
  }
  c3Layer(sh, C3.L_FOCUS);   // the beach must depth-sort against the surf (both in the subject pass)
  s.lh2 = new THREE.Group(); s.lh2.position.set(95, 12, -175); s.lh2.scale.setScalar(0.75); sh.add(s.lh2);
  { const m = c3Mesh(new THREE.DodecahedronGeometry(9, 1), c3Prop('#2e2c30', { rough: 0.8 }), 0.05); m.scale.set(1.4, 0.8, 1); m.position.set(95, 7, -175); sh.add(m); }
  for (let i = 0; i < 4; i++) s.lh2.add(cyl(4.4 - i * 0.5, 4.8 - i * 0.5, 7, c3Prop(i % 2 ? '#c8281e' : '#f0f0f0', { rough: 0.5 }), 0, 3.5 + i * 7, 0, 0.04, 20));
  { const m = c3Mesh(new THREE.SphereGeometry(3, 16, 10), c3Flat('#fff6d0', { glow: '#ffe8a0' }), 0.03); m.position.y = 31; s.lh2.add(m); }
  // blurred foreground (NEAR layer), placed per shot by stmFg
  const rope = c3Prop('#d8c8a0', { rough: 0.8 });
  s.fgBy = {
    rail: (() => { const g = new THREE.Group(); g.add(rb(26, 0.5, 0.5, white, 0, 0, 0, 0.02)); g.add(rb(26, 0.4, 0.4, white, 0, -2.2, 0, 0.02)); for (let i = 0; i < 6; i++) g.add(rb(0.4, 5.5, 0.4, white, -11 + i * 4.4, -2.5, 0, 0.02)); return g; })(),
    drops: (() => { const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const R = RNG('sdrop', i); const d = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.12, 0.34), 10, 8), new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0.35, toneMapped: false })); d.position.set(R.n(1.7), R.n(2.8), 0); g.add(d); } return g; })(),
    spray: (() => { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const R = RNG('fspray', i); const d = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.1, 0.32), 10, 8), new THREE.MeshBasicMaterial({ color: '#eef6ff', transparent: true, opacity: 0.4, toneMapped: false, fog: false })); d.position.set(R.n(1.4), R.n(1.4), R.n(0.5)); g.add(d); } return g; })(),
    coil: (() => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const m = c3Mesh(new THREE.TorusGeometry(1.6 - i * 0.12, 0.28, 8, 24), rope, 0.02); m.rotation.x = Math.PI / 2; m.position.y = i * 0.5; g.add(m); } return g; })(),
    grass: (() => { const g = new THREE.Group(); for (let i = 0; i < 26; i++) { const R = RNG('mgrass', i); const b = c3Mesh(new THREE.ConeGeometry(0.12, R.r(3, 6), 4), c3Prop('#4a5a2a', { rough: 0.8 }), 0); b.position.set(R.n(4), 0, R.n(0.5)); b.rotation.z = R.n(0.35); g.add(b); } return g; })(),
  };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Layer(ship, C3.L_FOCUS); c3Layer(bc, C3.L_FOCUS); c3Layer(s.bricks, C3.L_FOCUS); c3Layer(s.spray, C3.L_FOCUS); c3Layer(s.mist, C3.L_FOCUS); c3Layer(s.rain, C3.L_FOCUS);
  c3Env(scene, { top: '#3a4a70', mid: '#1a2236', bot: '#05080c', cards: [[0, 40, -30, 40, 8, '#8aa0d0'], [-30, 12, 10, 10, 18, '#6a7aa8'], [24, 6, 10, 8, 10, '#ffb070']] });
  c3Shadows(scene, s.key, 60);
  return s;
}
const stmGet = () => STM.s ||= stmBuild();
// ---- the rogue wave (s15): a sculpted wall of water — a profile curve (back slope, crest, curling lip, concave face)
// extruded along the ship and re-shaped every frame; deep blue at the base, glassy turquoise lit through the face,
// white foam on the crest and lip, foam streaks running down; chunky shaded foam blobs ride the crest
const STM_WNX = 90, STM_WNP = 44, STM_WL = 320;
function stmWaveBuild(s) {
  const nv = (STM_WNX + 1) * STM_WNP, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  const uv = new Float32Array(nv * 2), idx = [];
  for (let i = 0; i <= STM_WNX; i++) for (let j = 0; j < STM_WNP; j++) { const v = i * STM_WNP + j; uv[v * 2] = i / STM_WNX * 6; uv[v * 2 + 1] = j / (STM_WNP - 1); }
  for (let i = 0; i < STM_WNX; i++) for (let j = 0; j < STM_WNP - 1; j++) { const a = i * STM_WNP + j, b = a + STM_WNP; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  const streak = c3Tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); const R = RNG('wstreak');
    for (let i = 0; i < 90; i++) { const xx = R.r(0, w), y0 = R.r(h * 0.25, h * 0.55), y1 = y0 + R.r(h * 0.15, h * 0.45); x.strokeStyle = `rgba(${R.f() < 0.5 ? '255,255,255' : '150,200,215'},${R.r(0.35, 0.7)})`; x.lineWidth = R.r(2, 7);
      x.beginPath(); x.moveTo(xx, y0); x.bezierCurveTo(xx + R.n(14), y0 + (y1 - y0) * 0.4, xx + R.n(14), y0 + (y1 - y0) * 0.7, xx + R.n(10), y1); x.stroke(); } }, 1024, 512);
  streak.wrapS = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: streak, roughness: 0.28, metalness: 0.0, emissive: '#0a5a66', emissiveIntensity: 0.3, side: THREE.DoubleSide, envMapIntensity: 0.5 });
  s.wave = new THREE.Mesh(g, m); s.wave.frustumCulled = false; s.wave.visible = false; c3Ink(s.wave, 0.22, '#082838'); s.scene.add(s.wave); c3Layer(s.wave, C3.L_FOCUS);
  s.nFoam = 70;
  s.foam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#f6fcff', roughness: 0.55, emissive: '#6a9ab8', emissiveIntensity: 0.3, flatShading: false }), s.nFoam);
  s.foam.frustumCulled = false; s.foam.visible = false; s.scene.add(s.foam); c3Layer(s.foam, C3.L_FOCUS);
  s.wCurve = new THREE.CatmullRomCurve3([...Array(12)].map(() => stmV(0, 0, 0)), false, 'centripetal');
}
// profile in (z, y) for height H, curl c (0..1); P[k] = [z, y, foam]
function stmWaveProfile(H, c) {
  return [[-1.9 * H, -3, 0], [-1.0 * H, 0.28 * H, 0], [-0.45 * H, 0.72 * H, 0], [-0.1 * H, 0.97 * H, 0.3], [0.12 * H + 0.15 * H * c, H * (1 + 0.05 * c), 0.8],
    [0.35 * H + 0.35 * H * c, H * (0.93 - 0.22 * c), 0.15], [0.42 * H + 0.5 * H * c, H * (0.8 - 0.5 * c), 0.6], [0.3 * H + 0.3 * H * c, H * (0.7 - 0.36 * c), 0.05],
    [0.22 * H, 0.6 * H, 0], [0.3 * H, 0.34 * H, 0], [0.5 * H, 0.12 * H, 0.25], [0.85 * H, -3, 0.6]];
}
function stmWaveAt(s, t, o) {   // o: { x0, zc, H, c (curl), g (collapse 0..1) }
  const pos = s.wave.geometry.attributes.position, col = s.wave.geometry.attributes.color;
  const deep = [0.015, 0.08, 0.22], face = [0.03, 0.36, 0.48], back = [0.02, 0.13, 0.3], foamC = [0.95, 0.99, 1.0];
  const prof = (fx) => stmWaveProfile(o.H * fx * (1 - 0.8 * o.g), o.c * Math.min(1, fx * 1.4));
  for (let i = 0; i <= STM_WNX; i++) {
    const x = -STM_WL / 2 + STM_WL * i / STM_WNX, d = (x - 0) / (STM_WL * 0.43), fx = Math.exp(-Math.pow(Math.abs(d), 4)) * (1 + 0.07 * Math.sin(x * 0.09 + t * 1.3) + 0.04 * Math.sin(x * 0.23 - t * 2));
    const P = prof(fx); P.forEach((q, k) => s.wCurve.points[k].set(0, q[1], q[0] + o.g * o.H * 0.6));
    for (let j = 0; j < STM_WNP; j++) {
      const u = j / (STM_WNP - 1), pt = s.wCurve.getPoint(u), v = i * STM_WNP + j;
      const kf = u * (P.length - 1), k0 = Math.floor(kf), k1 = Math.min(P.length - 1, k0 + 1), fm = lerp(P[k0][2], P[k1][2], kf - k0);
      pos.setXYZ(v, o.x0 + x, pt.y, o.zc + pt.z);
      const hy = clamp(pt.y / Math.max(1, o.H * fx)), front = u > 0.36 ? 1 : 0, base = front ? face : back;
      const n = 0.5 + 0.5 * Math.sin(x * 0.31 + u * 23 + t * 3) * Math.sin(x * 0.17 - u * 11);
      const f = clamp((fm * (0.55 + 0.7 * n) - 0.3) * 1.8 + clamp((o.g - 0.3) * 1.4) * 0.6 * (1 - hy) * n);
      for (let ch = 0; ch < 3; ch++) col.array[v * 3 + ch] = lerp(lerp(deep[ch], base[ch], EZ.io(hy)), foamC[ch], f);
    }
  }
  pos.needsUpdate = true; col.needsUpdate = true; s.wave.geometry.computeVertexNormals(); s.wave.geometry.computeBoundingSphere();
  // foam blobs along the crest and lip (u 0.3..0.62); after the crash they tumble down as whitewater
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = stmV(1, 1, 1), p = stmV(0, 0, 0);
  for (let k = 0; k < s.nFoam; k++) {
    const R = RNG('wfoam', k), x = R.r(-0.42, 0.42) * STM_WL, d = x / (STM_WL * 0.43), fx = Math.exp(-Math.pow(Math.abs(d), 4));
    const P = prof(fx); P.forEach((qq, kk) => s.wCurve.points[kk].set(0, qq[1], qq[0] + o.g * o.H * 0.6));
    const pt = s.wCurve.getPoint(R.r(0.44, 0.5)), bub = 1 + 0.18 * Math.sin(t * R.r(4, 9) + k);
    const fall = o.g * R.r(0.5, 1.0);
    p.set(o.x0 + x + R.n(2), lerp(pt.y + R.n(1.2), R.r(4, 18), fall), o.zc + pt.z + R.n(1.5) + fall * R.r(10, 40));
    const r = R.r(0.6, 1.5) * Math.max(0.25, o.H / 55) * bub * fx * (1 - 0.4 * fall);
    e.set(R.n(0.3), R.r(0, TAU) + t, R.n(0.3)); q.setFromEuler(e); sc.set(r * 1.6, r * 0.55, r * 1.2); m4.compose(p, q, sc); s.foam.setMatrixAt(k, m4);
  }
  s.foam.instanceMatrix.needsUpdate = true;
  s.wave.visible = s.foam.visible = true;
}

// ---- per-frame world: the sea surface, the ship riding it, rain, lightning, the lighthouse beam
const STM_FLASH = [15.3, 17.1, 18.15, 21.0, 23.25, 43.5];   // lightning (also thunder cues)
function stmWorld(s, t, o = {}) {
  const st = o.sea ?? { amp: 1 }, cx = o.cx ?? 0, cz = o.cz ?? 0;
  // sea grid follows the camera's look area (snapped to its cells so the waves never swim)
  const cell = 520 / 220, ox = Math.round(cx / cell) * cell, oz = Math.round(cz / cell) * cell;
  const p = s.sea.geometry.attributes.position, col = s.sea.geometry.attributes.color, B = s.seaBase, out = { x: 0, y: 0, z: 0, foam: 0 };
  const deep = [0.01, 0.05, 0.14], mid = [0.03, 0.17, 0.33], foamC = [0.86, 0.93, 1.0];
  for (let i = 0; i < p.count; i++) {
    const x = B[i * 3] + ox, z = B[i * 3 + 2] + oz; stmSea(x, z, t, st, out);
    p.setXYZ(i, out.x - ox, out.y, out.z - oz);
    const h = out.y / (5.0 * st.amp + 1e-3), n = Math.sin(x * 0.37 + t * 0.6) * Math.sin(z * 0.29 - t * 0.4) + 0.5 * Math.sin(x * 0.11 - z * 0.13 + t * 0.3);
    let f = clamp((h - 0.56) * 2.0 + n * 0.25) * 0.75 + out.foam + (o.surf ? o.surf(x, z) : 0); f = clamp(f);
    const k = clamp(h * 0.5 + 0.5), g = clamp((out.y - 5) / 22);   // tall water (the rogue wave) glows glassy teal, lit through
    const c0 = lerp(lerp(deep[0], mid[0], k), 0.05, g), c1 = lerp(lerp(deep[1], mid[1], k), 0.28, g), c2 = lerp(lerp(deep[2], mid[2], k), 0.34, g);
    col.setXYZ(i, lerp(c0, foamC[0], f), lerp(c1, foamC[1], f), lerp(c2, foamC[2], f));
  }
  s.sea.position.set(ox, 0, oz); p.needsUpdate = true; col.needsUpdate = true; s.sea.geometry.computeVertexNormals();
  // the ship rides the sea: heave from the mean height, pitch and roll from bow/stern and port/starboard samples
  s.ship.visible = o.ship !== false;
  if (s.ship.visible) {
    const hb = stmH(40, 0, t, st), hs = stmH(-40, 0, t, st), hp = stmH(0, 10, t, st), hsb = stmH(0, -10, t, st);
    s.ship.position.set(0, clamp((hb + hs + hp + hsb) / 4 * 0.8, -4, 4) - 1.0 + (o.heave ?? 0), 0);
    s.ship.rotation.set(clamp((hp - hsb) / 20 * 0.55, -0.14, 0.14) + (o.roll ?? 0) + Math.sin(t * 0.9) * 0.03, 0, clamp((hb - hs) / 80 * 0.6, -0.1, 0.1) + (o.pitch ?? 0));
  }
  // rain: streaks in a box in front of the camera
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, o.wind ?? 0.25)), one = stmV(1, 1, 1), z0 = stmV(0, 0, 0), v = stmV(0, 0, 0);
  const cam = s.cam, fwd = stmV(0, 0, -1).applyQuaternion(cam.quaternion), right = stmV(1, 0, 0).applyQuaternion(cam.quaternion);
  const heavy = o.rain ?? 1;
  s.rainSeed.forEach(([x, y, d, sp], i) => {
    const yy = mod(y - sp * t, 60) - 30, on = RNG('srainOn', i).f() < heavy;
    v.copy(cam.position).addScaledVector(fwd, d).addScaledVector(right, x * d / 40).add(stmV(0, yy * d / 40 + 2, 0));
    m4.compose(v, q, on ? one : z0); s.rain.setMatrixAt(i, m4); });
  s.rain.instanceMatrix.needsUpdate = true;
  // lightning: a bright frame or two, then a flicker; the bolt shows on the first frames
  let fl = 0; for (const f of o.flashes ?? STM_FLASH) { const d = t - f; if (d > 0 && d < 0.5) fl = Math.max(fl, (d < 0.07 ? 1 : 0) + (d > 0.12 && d < 0.18 ? 0.7 : 0) + Math.exp(-d * 9) * 0.4); }
  s.flash.intensity = fl * 2.6; s.hemi.intensity = (o.hemi ?? 1.1) + fl * 0.9;
  s.sky.material.color.setScalar(1 + fl * 1.4);
  s.bolt.visible = fl > 0.6 && !o.noBolt; if (s.bolt.visible) { const f = (o.flashes ?? STM_FLASH).find((x) => t - x > 0 && t - x < 0.5); const R = RNG('boltp', f);
    s.bolt.position.set(cam.position.x + fwd.x * 420 + right.x * R.r(-120, 120), 0, cam.position.z + fwd.z * 420 + right.z * R.r(-120, 120)); s.bolt.rotation.y = Math.atan2(fwd.x, fwd.z); }
  s.fl = fl;
  s.beam.rotation.y = Math.sin(t * 0.9) * 0.35;   // sweeps along the coast, never into the lens
  s.navL.forEach((b, i) => { b.visible = i < 2 || Math.sin(t * 6) > 0; });
  s.burst.visible = false; s.shore.visible = false; s.sky.material.map = s.skyNight; s.lip.visible = false; s.wave.visible = s.foam.visible = false;
}
// spray burst: n drops leaving point P at time t0 (ballistic), seeded by key
function stmSprayAt(s, t, bursts) {
  const m4 = new THREE.Matrix4(), p = stmV(0, 0, 0), q = s.cam.quaternion, sc = stmV(1, 1, 1), qd = new THREE.Quaternion(), vel = stmV(0, 0, 0), up = stmV(0, 1, 0), Z = new THREE.Matrix4().makeScale(0, 0, 0); let i = 0;
  for (const b of bursts) {
    for (let k = 0; k < b.n && i < s.nSpray; k++, i++) {
      const R = RNG('spr', b.key, k), dt = t - b.t0 - R.r(0, b.spread ?? 0.25);
      if (dt < 0 || dt > 2.4) { s.spray.setMatrixAt(i, Z); s.mist.setMatrixAt(i, Z); continue; }
      const vx = (b.v[0] + R.n(b.r ?? 8)), vy = b.v[1] * R.r(0.6, 1.2), vz = (b.v[2] + R.n(b.r ?? 8));
      p.set(b.p[0] + R.n(b.w ?? 6) + vx * dt, b.p[1] + vy * dt - 14 * dt * dt, b.p[2] + R.n(b.d ?? 3) + vz * dt);
      const alive = p.y > -1 ? 1 : 0;
      if (k % 4 === 3) { const sz = R.r(1.0, 2.6) * (b.s ?? 1) * (1 + dt * 1.2) * alive; sc.set(sz, sz, sz); m4.compose(p, q, sc); s.mist.setMatrixAt(i, m4); s.spray.setMatrixAt(i, Z); continue; }
      vel.set(vx, vy - 28 * dt, vz); const sp = vel.length(); qd.setFromUnitVectors(up, vel.normalize());
      const sz = R.r(0.35, 0.95) * Math.sqrt(b.s ?? 1) * alive * (1 - clamp((dt - 1.6) / 0.8)), st = 1 + Math.min(2.6, sp * 0.06);
      sc.set(sz, sz * st, sz); m4.compose(p, qd, sc); s.spray.setMatrixAt(i, m4); s.mist.setMatrixAt(i, Z);
    }
  }
  for (; i < s.nSpray; i++) { s.spray.setMatrixAt(i, Z); s.mist.setMatrixAt(i, Z); }
  s.spray.instanceMatrix.needsUpdate = true; s.mist.instanceMatrix.needsUpdate = true;
}
const stmNoBricks = (s) => { const m4 = new THREE.Matrix4().makeScale(0, 0, 0); for (let i = 0; i < s.nBricks; i++) s.bricks.setMatrixAt(i, m4); s.bricks.instanceMatrix.needsUpdate = true; };
// sailor poses on the wing
function stmCrew(s, t, o) {
  const ex = o.expr ?? [['worried'], ['scared'], ['nervous']];
  s.sailors.forEach((p, i) => {
    const R = RNG('crew', i), sway = Math.sin(t * 2.4 + i) * 0.08;
    c3PersonPose(p, s.cam, t, { expr: c3FaceAt(ex[i].map((e, j) => [j === 0 ? 0 : (o.at ?? 0) + j * 0.05 * i, e]), t, p.key), gaze: o.gaze ?? [0.6, 0.3], lean: sway + (o.lean ?? 0),
      lift: o.lift, hand: o.hand?.[i] ?? { armL: [1.6, 2.4 + R.r(0, 0.6)], armR: [-1.4, 1.0] }, foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] }, x: o.x?.[i] ?? [] });
  });
}
// a brighter exposure for the storm (the refs' nights stay colourful and readable), restored after the frame
function stmRender(s, o = {}) {
  const { r } = c3Renderer(), ex = r.toneMappingExposure; r.toneMappingExposure = o.exposure ?? 1.15;
  c3Render(s.scene, s.cam, Object.assign({ bg: '#0c1430', bgBlur: 2.2, nearBlur: 9, glow: 0.75, glowBlur: 16, bloom: 0.26 }, o));
  r.toneMappingExposure = ex;
}

// =====================================================================
//  s13 — "Back in 1997,": whoosh into the past — the ship's logbook on the chart table, its pages flipping back
//  year by year (the header year counts down 2026 -> 1997) and landing on 13 FEB 1997; rain on the window, lightning
// =====================================================================
function stmLogPage(x, w, h, year, full) {
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#e8dcb8'); g.addColorStop(0.08, '#f6eed6'); g.addColorStop(1, '#f2e8cc'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(80,110,160,0.35)'; x.lineWidth = 2; for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(w * 0.06, h * (0.26 + i * 0.04)); x.lineTo(w * 0.96, h * (0.26 + i * 0.04)); x.stroke(); }
  x.strokeStyle = 'rgba(200,60,60,0.45)'; x.beginPath(); x.moveTo(w * 0.16, h * 0.2); x.lineTo(w * 0.16, h * 0.98); x.stroke();
  inked(x, "SHIP'S LOG", w / 2, h * 0.07, h * 0.05, '#3a2a18', { stroke: false, font: 'Georgia, serif', weight: 700 });
  if (full) {
    inked(x, '13 FEB', w / 2, h * 0.15, h * 0.075, '#1a2a6a', { stroke: false, font: '"Segoe Script", "Brush Script MT", cursive', weight: 700 });
    inked(x, String(year), w / 2, h * 0.255, h * 0.13, '#c8281e', { stroke: false, font: '"Segoe Script", "Brush Script MT", cursive', weight: 700 });
    const L = ['Wind: force 10, gusting', 'Sea: very high', '20 mi off Land\'s End', 'Cargo: 62 boxes on deck', 'Heading for New York'];
    L.forEach((s, i) => inked(x, s, w * 0.18, h * (0.37 + i * 0.08), h * 0.045, '#1a2a6a', { stroke: false, font: '"Segoe Script", "Brush Script MT", cursive', weight: 400, align: 'left', maxW: w * 0.76 }));
  } else inked(x, String(year), w / 2, h * 0.2, h * 0.13, '#3a2a18', { stroke: false, font: '"Segoe Script", "Brush Script MT", cursive', weight: 700 });
}
function stmLogBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 300), s = { scene, cam };
  const key = lights(scene, { amb: '#8a7a6a', ambI: 0.7, sky: '#a8b0d8', ground: '#2a1a10', key: '#ffd8a8', keyI: 1.1, keyP: [3, 14, 6], rim: '#7a9aff', rimI: 0.8, rimP: [-6, 8, -10] });
  s.flash = new THREE.DirectionalLight('#dce8ff', 0); s.flash.position.set(-4, 10, -14); s.flash.layers.enableAll(); scene.add(s.flash);
  const wood = c3Prop('#ffffff', { map: texWood(), rough: 0.45 });
  // the chart table, a nautical chart under the book, a brass lamp that swings with the roll, a mug that slides
  s.room = new THREE.Group(); scene.add(s.room);
  s.room.add(rb(16, 1, 10, wood, 0, -0.5, 0, 0.04));
  const chart = pl(13, 8.4, c3Prop('#ffffff', { map: c3Tex((x, w, h) => { x.fillStyle = '#e8e0c0'; x.fillRect(0, 0, w, h); x.fillStyle = '#b8d0d8'; x.fillRect(0, 0, w, h * 0.55);
    x.fillStyle = '#d8c8a0'; x.beginPath(); x.moveTo(0, h * 0.55); x.bezierCurveTo(w * 0.3, h * 0.45, w * 0.5, h * 0.7, w * 0.8, h * 0.55); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.strokeStyle = 'rgba(60,80,120,0.4)'; x.lineWidth = 2; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, i * h / 9); x.lineTo(w, i * h / 9); x.stroke(); x.beginPath(); x.moveTo(i * w / 9, 0); x.lineTo(i * w / 9, h); x.stroke(); }
    inked(x, 'CORNWALL', w * 0.62, h * 0.8, h * 0.07, '#5a3a1a', { stroke: false, font: 'Georgia, serif', weight: 700 }); x.strokeStyle = '#c8281e'; x.lineWidth = 5; x.setLineDash([12, 8]); x.beginPath(); x.moveTo(w * 0.1, h * 0.2); x.lineTo(w * 0.55, h * 0.35); x.stroke(); }, 1024, 660), rough: 0.8 }), 0, 0.02, 0, 0, -Math.PI / 2);
  s.room.add(chart);
  // the book: a cover, a left stack and right stack; flipping pages are bent strips that turn around the spine (x = 0)
  s.book = new THREE.Group(); s.book.position.set(0.4, 0.05, 0.6); s.book.rotation.y = -0.08; s.room.add(s.book);
  s.book.add(rb(9.4, 0.3, 6.6, c3Prop('#5a2a1a', { rough: 0.6 }), 0, 0.15, 0, 0.02));
  const pageW = 4.4, pageH = 6.2;
  s.pageCv = []; s.pageTex = [];
  for (let i = 0; i < 2; i++) { const cv = Object.assign(document.createElement('canvas'), { width: 512, height: 720 }); const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; s.pageCv.push(cv); s.pageTex.push(tx); }
  const pageM = (i) => c3Prop('#ffffff', { map: s.pageTex[i], rough: 0.8 });
  s.leftP = pl(pageW, pageH, pageM(0), -pageW / 2 - 0.05, 0.36, 0, 0, -Math.PI / 2); s.book.add(s.leftP);
  s.rightP = pl(pageW, pageH, pageM(1), pageW / 2 + 0.05, 0.36, 0, 0, -Math.PI / 2); s.book.add(s.rightP);
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) s.book.add(rb(pageW, 0.06, pageH, c3Prop('#e8dcb8', { rough: 0.9 }), sd * (pageW / 2 + 0.05), 0.32 - k * 0.05, 0, 0));
  s.flip = [];
  for (let i = 0; i < 5; i++) { const cv = Object.assign(document.createElement('canvas'), { width: 256, height: 360 }); const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
    const g = new THREE.PlaneGeometry(pageW, pageH, 14, 1); g.translate(pageW / 2, 0, 0); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, c3Prop('#ffffff', { map: tx, rough: 0.8, side: THREE.DoubleSide })); m.position.set(0.05, 0.4, 0); s.book.add(m);
    s.flip.push({ m, cv, tx, base: Float32Array.from(g.attributes.position.array), year: -1 }); }
  s.pen = cyl(0.09, 0.09, 3.2, c3Prop('#1a1a22', { rough: 0.3, metal: 0.5 }), 3.2, 0.5, 2.4, 0.01, 8); s.pen.rotation.set(Math.PI / 2, 0, 0.6); s.room.add(s.pen);
  s.mug = mug('#c8281e', -5.6, 0, -1.6); s.room.add(s.mug);
  s.lamp = new THREE.Group(); s.lamp.position.set(-3.0, 9.5, -1.0); scene.add(s.lamp);
  s.lamp.add(cyl(0.05, 0.05, 3.6, c3Chrome('#c8a050'), 0, -1.8, 0, 0.0, 6));
  const shade = c3Mesh(new THREE.ConeGeometry(1.1, 1.3, 20, 1, true), c3Prop('#b8862a', { rough: 0.3, metal: 0.7, side: THREE.DoubleSide }), 0.02); shade.position.y = -3.9; s.lamp.add(shade);
  const bulb = c3Mesh(new THREE.SphereGeometry(0.45, 12, 8), c3Flat('#fff1c8', { glow: '#ffcf70' }), 0); bulb.position.y = -4.3; s.lamp.add(bulb);
  const L = new THREE.PointLight('#ffcf80', 1.6, 26, 1.5); L.position.y = -4.5; L.layers.enableAll(); s.lamp.add(L);
  // the window behind: a storm painted on the far side (lightning lights it), rain running down the glass
  s.winCv = Object.assign(document.createElement('canvas'), { width: 512, height: 512 }); s.winTex = new THREE.CanvasTexture(s.winCv); s.winTex.encoding = THREE.sRGBEncoding;
  s.win = pl(18, 12, c3Flat('#ffffff', { map: s.winTex }), 0, 6, -8); scene.add(s.win);
  scene.add(rb(19, 0.8, 0.8, c3Prop('#ecebe6', { rough: 0.4 }), 0, 0, -7.8, 0.03)); scene.add(rb(19, 0.8, 0.8, c3Prop('#ecebe6', { rough: 0.4 }), 0, 12, -7.8, 0.03));
  for (const x of [-9.2, -3, 3, 9.2]) scene.add(rb(0.7, 12, 0.7, c3Prop('#ecebe6', { rough: 0.4 }), x, 6, -7.8, 0.03));
  scene.add(pl(60, 30, c3Prop('#d8d4c8', { rough: 0.6 }), 0, 6, -8.4));
  s.capt = c3Person({ key: 'capt', outfit: 'navy', hairStyle: 'white', fx: ['beard_full'] }); s.capt.g.scale.setScalar(1.1); s.capt.g.position.set(3.4, 0.7 + 2.55 * 1.1 - 3.2, -4.4); scene.add(s.capt.g);
  c3Layer(s.room, C3.L_FOCUS); c3Layer(s.lamp, C3.L_FOCUS); c3Layer(s.capt.g, C3.L_FOCUS);
  s.fgBy = { lamp2: (() => { const g = new THREE.Group(); g.add(c3Mesh(new THREE.SphereGeometry(1.4, 14, 10), c3Prop('#b8862a', { rough: 0.3, metal: 0.7 }), 0.02)); return g; })(),
    rope: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const m = c3Mesh(new THREE.TorusGeometry(1.2 - i * 0.1, 0.22, 8, 20), c3Prop('#d8c8a0', { rough: 0.8 }), 0.02); m.position.y = i * 0.4; m.rotation.x = Math.PI / 2; g.add(m); } return g; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  c3Env(scene, { top: '#ffd9a8', mid: '#8a7060', bot: '#1a0c10' }); c3Shadows(scene, key, 14);
  return s;
}
const stmLogGet = () => STM.log ||= stmLogBuild();
function stmWinDraw(s, t, fl) {
  const x = s.winCv.getContext('2d'), w = s.winCv.width, h = s.winCv.height;
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgb(${20 + fl * 180},${28 + fl * 180},${50 + fl * 190})`); g.addColorStop(0.55, `rgb(${40 + fl * 120},${54 + fl * 120},${80 + fl * 130})`); g.addColorStop(0.56, '#0e2230'); g.addColorStop(1, '#05121a');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(200,220,240,0.5)'; for (let i = 0; i < 14; i++) { const R = RNG('wcrest', i), xx = mod(R.r(0, w) + t * 40 * R.r(0.5, 1.2), w + 60) - 30, yy = h * R.r(0.6, 0.95); x.beginPath(); x.ellipse(xx, yy, R.r(20, 50), 4, 0, 0, TAU); x.fill(); }
  const tilt = Math.sin(t * 1.4) * 0.12; x.save(); x.translate(w / 2, h * 0.56); x.rotate(tilt); x.fillStyle = 'rgba(10,30,40,0.0)'; x.restore();
  x.strokeStyle = 'rgba(210,225,255,0.55)'; x.lineWidth = 2.5; for (let i = 0; i < 60; i++) { const R = RNG('wdrop', i), xx = R.r(0, w), y0 = mod(R.r(0, h) + t * R.r(60, 180), h + 40) - 20; x.beginPath(); x.moveTo(xx, y0); x.lineTo(xx + R.n(3), y0 + R.r(10, 30)); x.stroke(); }
  if (fl > 0.6) { x.strokeStyle = '#ffffff'; x.lineWidth = 5; x.beginPath(); let bx = w * 0.7, by = 0; x.moveTo(bx, by); const R = RNG('wbolt'); while (by < h * 0.55) { bx += R.n(30); by += R.r(20, 40); x.lineTo(bx, by); } x.stroke(); }
  s.winTex.needsUpdate = true;
}
const STM_K13 = [[0, [0.6, 30, 26], [0.4, 0.5, -1.0], 62], [0.42, [0.4, 13.5, 16.5], [0.4, 1.2, -1.5], 48], [1.3, [-0.8, 12.2, 15.0], [0.3, 1.4, -1.8], 47]];
SHOT_FN['s13'] = (t, u, lt) => {
  const s = stmLogGet(), [a, b] = stmSpan('s13'), dur = b - a, y97 = stmW('1997', 1, 15.3);
  c3SetCam(s.cam, stmCam(STM_K13, lt, 's13', { orbit: 0.06, creep: 0.03 }));
  // the roll: the room tilts, the lamp swings, the mug slides
  const roll = Math.sin(t * 1.6) * 0.06; s.room.rotation.z = roll; s.lamp.rotation.z = -roll * 4 + Math.sin(t * 3.2) * 0.1;
  s.mug.position.x = -5.6 + Math.sin(t * 1.6 - 0.6) * 0.9;
  // pages: 5 flipping strips cycle very fast at first, slower as the year closes on 1997; the year on each flipping page
  // counts down from 2026; the right page shows the date once it lands
  const land = y97 - 0.02, k = clamp(lt / Math.max(0.1, land - a));
  const yearAt = (q) => Math.round(lerp(2026, 1997, EZ.o2(clamp(q))));
  const turns = 14 * EZ.o2(k);   // total flips so far
  s.flip.forEach((f, i) => {
    const ph = turns - i, rot = ph - Math.floor(ph), active = ph >= 0 && ph < 14 && k < 1 && Math.floor(ph) % 5 === 0 ? 1 : 0;
    const ang = Math.PI * EZ.io(rot), yr = yearAt((Math.floor(turns) - i) / 14);
    f.m.visible = k < 1 && ph >= 0;
    if (f.year !== yr) { stmLogPage(f.cv.getContext('2d'), f.cv.width, f.cv.height, yr, false); f.tx.needsUpdate = true; f.year = yr; }
    const p = f.m.geometry.attributes.position;   // bend: the page curls along its width while it turns
    for (let j = 0; j < p.count; j++) { const x0 = f.base[j * 3], zz = f.base[j * 3 + 2], q = x0 / pageW0(), a2 = ang * (0.7 + 0.3 * q) + Math.sin(Math.PI * clamp(rot)) * 0.5 * q;
      p.setXYZ(j, Math.cos(a2) * x0, Math.sin(a2) * x0 + 0.02 * i, zz); }
    p.needsUpdate = true; f.m.geometry.computeVertexNormals(); f.m.rotation.set(0, 0, 0); f.m.scale.x = 1;
    void active;
  });
  const cur = k >= 1 ? 1997 : yearAt(Math.floor(turns) / 14);
  if (s.lastL !== cur) { stmLogPage(s.pageCv[0].getContext('2d'), 512, 720, cur, false); s.pageTex[0].needsUpdate = true;
    stmLogPage(s.pageCv[1].getContext('2d'), 512, 720, cur, k >= 1); s.pageTex[1].needsUpdate = true; s.lastL = cur; }
  // lightning on "1997", the window and the room flash
  let fl = 0; for (const f of [y97 + 0.05]) { const d = t - f; if (d > 0 && d < 0.5) fl = Math.max(fl, (d < 0.07 ? 1 : 0) + (d > 0.12 && d < 0.18 ? 0.7 : 0) + Math.exp(-d * 9) * 0.4); }
  s.flash.intensity = fl * 2.2; stmWinDraw(s, t, fl);
  c3PersonPose(s.capt, s.cam, t, { expr: c3FaceAt([[0, 'worried'], [y97 + 0.1, 'shocked']], t, 'capt'), gaze: t < y97 ? [-0.8, -0.2] : [-0.3, 0.2], lean: -roll,
    lift: (q) => 0.2 * EZ.back(seg(q, y97 + 0.05, y97 + 0.15)) * Math.exp(-Math.max(0, q - y97 - 0.15) * 4), hand: { armL: [1.4, 1.4], armR: [-1.5, 1.2] }, foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } });
  stmFg(s, [['lamp2', [-3.4, 2.6, -5], 0.9]], STM_K13, 's13', lt, { orbit: 0.06, creep: 0.03 });
  // the whoosh: a fast blur at the head of the shot clears as the camera lands on the book
  stmRenderLog(s, { bgBlur: lerp(9, 2.4, EZ.o2(clamp(lt / 0.4))), glow: 0.8 + fl * 0.4 });
  if (lt < 0.3) { ctx.save(); screen(); ctx.globalAlpha = 0.5 * (1 - lt / 0.3); ctx.fillStyle = '#e8f0ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  void dur;
};
const pageW0 = () => 4.4;
const stmRenderLog = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#140e0a', bgBlur: 2.4, nearBlur: 10, glow: 0.8, glowBlur: 16, bloom: 0.3 }, o));

// =====================================================================
//  s14 — "a cargo ship off the coast of Cornwall": the ship rolls in a black sea; the lighthouse beam sweeps the
//  far headland; the crew on the port wing hang on
// =====================================================================
const STM_K14 = [[0, [124, 38, 156], [-6, 16, 0], 40], [0.5, [104, 36, 140], [-12, 18, 2], 40], [1.75, [10, 40, 96], [-29, 29.5, 13], 40]];
SHOT_FN['s14'] = (t, u, lt) => {
  const s = stmGet(), st = { amp: 1.0 };
  c3SetCam(s.cam, stmCam(STM_K14, lt, 's14', { orbit: 0.05 }));
  stmWorld(s, t, { sea: st, cx: 30, cz: 50 });
  stmSprayAt(s, t, [{ key: 'bow14', t0: 16.8, n: 120, p: [46, 4, 0], v: [6, 16, 0], w: 4, d: 8, r: 6 }, { key: 'bow14b', t0: 17.6, n: 120, p: [46, 4, 4], v: [8, 14, 6], w: 4, d: 8, r: 6 }]);
  stmNoBricks(s); if (s.boardN !== 0) { stmBoardDraw(s, 0); s.boardN = 0; }
  stmCrew(s, t, { expr: [['worried'], ['nervous'], ['scared']], gaze: [0.8, 0.2], hand: [{ armL: [1.8, 1.4], armR: [-1.6, 1.2] }, { armL: [1.4, 3.6], armR: [-1.2, 1.1] }, { armL: [1.7, 1.3], armR: [-1.8, 2.4] }] });
  stmFg(s, [['drops', [-1.5, 1.6, -5], 0.5]], STM_K14, 's14', lt, { orbit: 0.05 });
  stmRender(s, { bgBlur: stmRack(lt, 's14', 1.2, 2.0), glow: 0.8 + s.fl * 0.4 });
};

// =====================================================================
//  s15 — "got slammed by a giant wave,": a rogue wave rears up behind the ship, towers over the containers and
//  crashes across the deck on "slammed"; spray everywhere, the ship heels hard toward us, the crew screams
// =====================================================================
const STM_K15 = [[0, [128, 9, 112], [-6, 30, -26], 50], [0.7, [118, 8, 104], [-6, 38, -24], 52], [1.6, [112, 10, 96], [-4, 24, -6], 52]];
SHOT_FN['s15'] = (t, u, lt) => {
  const s = stmGet(), wv = stmW('wave', 1, 19.2), ti = wv - 0.15;   // the lip lands on the ship just before "wave"
  const H = 64 * EZ.o2(clamp((t - 17.4) / 1.35)), zc = lerp(-120, -36, EZ.io(clamp((t - 17.4) / (ti - 17.4))));
  const c = EZ.io(clamp((t - (ti - 0.62)) / 0.62)), g = EZ.o2(clamp((t - ti) / 0.55));
  const st = { amp: 1.15, rogue: { x: -4, len: 420, z0: -150, z1: -30, t0: 17.4, t1: ti, A: 16, w: 26 } };
  const hit = clamp((t - ti) / 0.5);
  c3SetCam(s.cam, stmCam(STM_K15, lt, 's15', { orbit: 0.02, shake: t > ti ? 1.0 * Math.exp(-(t - ti) * 2.5) : 0 }));
  stmWorld(s, t, { sea: st, cx: 20, cz: 20, roll: 0.22 * EZ.back(hit), heave: -2.5 * hit, flashes: [18.15, ti - 0.05] });
  stmWaveAt(s, t, { x0: -4, zc, H, c, g });
  // spray: wind tearing off the crest while it rises, the crash over the deck, then sheets of water off the rail at us
  const lipZ = zc + 0.42 * H + 0.5 * H * c;
  stmSprayAt(s, t, [{ key: 'crest', t0: 18.0, n: 160, p: [-4, H * 0.98, zc + 6], v: [0, 6, 10], w: 110, d: 3, r: 4, s: 1.6, spread: 1.0 },
    { key: 'crash', t0: ti, n: 300, p: [-4, 26, lipZ - 8], v: [0, 16, 22], w: 60, d: 6, r: 10, s: 2.2, spread: 0.25 },
    { key: 'sheet', t0: ti + 0.22, n: 200, p: [0, 16, 12], v: [0, 8, 20], w: 40, d: 2, r: 6, s: 1.4 }]);
  stmNoBricks(s); if (s.boardN !== 0) { stmBoardDraw(s, 0); s.boardN = 0; }
  stmCrew(s, t, { expr: [['scared', 'screaming'], ['panic', 'screaming'], ['shocked', 'screaming']], at: ti, gaze: [-0.4, 0.9], lean: 0.12 * hit,
    lift: (q) => 0.4 * EZ.back(seg(q, ti + 0.02, ti + 0.15)) * Math.exp(-Math.max(0, q - ti - 0.15) * 3),
    hand: [{ armL: [1.8, 4.4], armR: [-1.8, 4.2] }, { armL: [1.6, 4.8], armR: [-1.6, 4.6] }, { armL: [1.9, 1.3], armR: [-1.9, 1.3] }], x: [['exclaim'], ['sweat'], ['exclaim']] });
  stmFg(s, [['spray', [2.4, -3.0, -9], -0.8], ['drops', [-1.6, 1.4, -5], 0.4]], STM_K15, 's15', lt, { orbit: 0.02 });
  stmRender(s, { bgBlur: stmRack(lt, 's15', 1.0, 1.8), glow: 0.8 + s.fl * 0.4 });
};

// =====================================================================
//  s16 — "and sixty-two containers fell into the ocean.": the ship heels; the port stack slides off one box after
//  another and splashes in; the OVERBOARD board on the wing flips up to 62 on "sixty-two", landing on "ocean"
// =====================================================================
const STM_K16 = [[0, [8, 36, 90], [-32, 23, 13], 48], [2.4, [0, 35, 82], [-34, 23, 13], 48]];
function stmFallers(s, t, tStart, tEnd) {
  // each faller: slides out toward +z, tips over the edge, falls (ship-local), splashes, then bobs half-sunk
  const n = s.fallers.length, out = [];
  s.ct.forEach((c) => { c.m.position.copy(c.p); c.m.rotation.set(0, c.m.rotation.y, 0); c.m.visible = true; });
  s.fallers.forEach((c, i) => {
    const t0 = lerp(tStart, tEnd, i / (n - 1)) + RNG('fall', i).r(0, 0.12), d = t - t0;
    if (d < 0) return;
    const slide = Math.min(d, 0.35) / 0.35, fall = Math.max(0, d - 0.3), R = RNG('fallr', i);
    const zz = c.p.z + slide * 4.5 + fall * 9, yy = c.p.y - (fall > 0 ? 18 * fall * fall + 4 * fall : 0);
    const bob = yy < -1 ? -1 + Math.sin(t * 2 + i) * 0.4 : yy;
    c.m.position.set(c.p.x + R.n(1) * fall * 3, Math.max(-3.5 + Math.sin(t * 2 + i) * 0.5, bob), Math.min(zz, c.p.z + 26 + R.r(0, 10)));
    c.m.rotation.set(Math.min(1.25, slide * 0.2 + fall * 2.6) * (R.f() < 0.5 ? 1 : 0.7), c.m.rotation.y, R.n(0.4) * fall);
    out.push({ t0: t0 + 0.3 + Math.sqrt(Math.max(0, (c.p.y + 1)) / 18), x: c.p.x, z: c.p.z + 14, key: 'cs' + i });
  });
  return out;
}
SHOT_FN['s16'] = (t, u, lt) => {
  const s = stmGet(), sixty = stmW('sixty', 1, 19.8), ocean = stmW('ocean', 1, 21.4);
  c3SetCam(s.cam, stmCam(STM_K16, lt, 's16', { orbit: 0.035, creep: 0.04 }));
  stmWorld(s, t, { sea: { amp: 1.0 }, cx: 0, cz: 40, roll: 0.16 + Math.sin(t * 1.3) * 0.04, flashes: [21.0] });
  const splash = stmFallers(s, t, sixty - 0.15, ocean + 0.1);
  // splashes: each container's own burst where it hits (ship-local -> world via the ship's matrix)
  s.ship.updateMatrixWorld(true);
  stmSprayAt(s, t, splash.map((c) => { const p = stmV(c.x, 0, c.z).applyMatrix4(s.ship.matrixWorld); return { key: c.key, t0: c.t0, n: 26, p: [p.x, 0, p.z], v: [0, 14, 4], w: 5, d: 3, r: 5, s: 1.2, spread: 0.1 }; }));
  // the flip board: counts each splash, settling on 62 as "ocean" lands
  const n = t < sixty ? 0 : t > ocean + 0.1 ? 62 : Math.round(lerp(0, 62, EZ.o2(clamp((t - sixty) / (ocean + 0.1 - sixty)))));
  if (s.boardN !== n) { stmBoardDraw(s, n); s.boardN = n; }
  stmNoBricks(s);
  stmCrew(s, t, { expr: [['shocked', 'screaming'], ['panic', 'crying'], ['screaming', 'scared']], at: sixty + 0.4, gaze: [0.8, -0.6], lean: 0.1,
    hand: [{ armL: [1.8, 4.4], armR: [-1.6, 1.3] }, { armL: [1.4, 1.0], armR: [-1.4, 4.4] }, { armL: [2.0, 4.0], armR: [-2.0, 4.0] }], x: [['sweat'], ['tears'], ['exclaim']] });
  stmFg(s, [['rail', [0, -6.5, -16], -1.8]], STM_K16, 's16', lt, { orbit: 0.035, creep: 0.04 });
  stmRender(s, { bgBlur: stmRack(lt, 's16', 1.2, 2.2), glow: 0.85 + s.fl * 0.4 });
};

// =====================================================================
//  s17 — "One of them held almost five million Lego pieces.": close on one container wallowing in the swell; on
//  "held" its doors blow open and a cloud of bricks bursts out and rains onto the sea; the odometer on its side
//  rolls up and lands on 5,000,000 on "million"
// =====================================================================
const STM_K17 = [[0, [26, 9, 30], [0, 3, 0], 48], [1.2, [22, 10, 27], [3, 4.5, 0], 50], [2.6, [24, 14, 32], [6, 6, 0], 52]];
const STM_BC = [0, 0];   // where the burst container floats (world)
function stmBurstBricks(s, t, tb) {
  const m4 = new THREE.Matrix4(), p = stmV(0, 0, 0), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = stmV(1, 1, 1), st = { amp: 0.8 };
  s.burst.updateMatrixWorld(true);
  const mouth = stmV(5.9, 0, 0).applyMatrix4(s.burst.matrixWorld), dir = stmV(1, 0.4, 0).transformDirection(s.burst.matrixWorld);
  for (let i = 0; i < s.nBricks; i++) {
    const R = RNG('bb', i), dt = t - tb - R.r(0, 1.1) * R.f();   // a gush that keeps pouring for a second
    if (dt < 0) { m4.makeScale(0, 0, 0); s.bricks.setMatrixAt(i, m4); continue; }
    const sp = R.r(8, 26), vx = dir.x * sp + R.n(7), vy = dir.y * sp + R.r(4, 18), vz = dir.z * sp + R.n(9);
    let x = mouth.x + vx * dt, y = mouth.y + vy * dt - 12 * dt * dt, z = mouth.z + vz * dt;
    const hs = stmH(x, z, t, st);
    if (y < hs + 0.2) { const tl = Math.max(0, dt - 0.2); y = hs + 0.15 + Math.sin(t * 3 + i) * 0.1; x = mouth.x + vx * Math.min(dt, 1.4) + tl * 0.6; z = mouth.z + vz * Math.min(dt, 1.4); }
    e.set(R.r(0, TAU) + dt * R.n(8), R.r(0, TAU) + dt * R.n(6), R.r(0, TAU)); q.setFromEuler(e);
    p.set(x, y, z); const k = R.r(0.38, 0.62); sc.set(k, k * (R.f() < 0.3 ? 0.4 : 1), k); m4.compose(p, q, sc); s.bricks.setMatrixAt(i, m4);
  }
  s.bricks.instanceMatrix.needsUpdate = true;
}
SHOT_FN['s17'] = (t, u, lt) => {
  const s = stmGet(), held = stmW('held', 1, 22.4), mil = stmW('million', 1, 23.2), lego = stmW('Lego', 2, 23.6);
  c3SetCam(s.cam, stmCam(STM_K17, lt, 's17', { orbit: 0.04, creep: 0.03, shake: t > held ? 0.25 * Math.exp(-(t - held) * 3) : 0 }));
  const st = { amp: 0.8 };
  stmWorld(s, t, { sea: st, cx: 0, cz: 0, ship: false, flashes: [23.25], rain: 0.8 });
  // the ship's dark bulk heels away in the far background
  s.ship.visible = true; s.ship.position.set(-60, -1, -150); s.ship.rotation.set(0.2 + Math.sin(t) * 0.04, 0.6, 0.02);
  s.ct.forEach((c) => { c.m.position.copy(c.p); c.m.rotation.x = 0; c.m.visible = !(c.c === 3 && c.l >= 1); });
  if (s.boardN !== 62) { stmBoardDraw(s, 62); s.boardN = 62; }   // the 62 have already gone over
  // the container wallows: sits low in the swell, tipped; the doors blow open on "held"
  s.burst.visible = true;
  const h0 = stmH(0, 0, t, st), hb = stmH(5, 0, t, st), hf = stmH(-5, 0, t, st), hz = stmH(0, 2.5, t, st);
  s.burst.position.set(0, h0 + 0.6, 0); s.burst.rotation.set((hz - h0) * 0.25 - 0.1, 0.35, (hb - hf) / 10 * 0.5 + 0.12);
  const open = EZ.back(clamp((t - held + 0.02) / 0.18));
  s.doors.forEach((d) => { d.hinge.rotation.y = d.z * open * 1.9; });
  const v = t < held ? 0 : t > mil + 0.05 ? 5000000 : 5000000 * EZ.o3(clamp((t - held) / (mil + 0.05 - held)));
  stmOdoDraw(s, Math.round(v));
  stmBurstBricks(s, t, held);
  s.burst.updateMatrixWorld(true); const mouth = stmV(5.9, 0, 0).applyMatrix4(s.burst.matrixWorld);
  stmSprayAt(s, t, [{ key: 'burst', t0: held, n: 160, p: [mouth.x, mouth.y, mouth.z], v: [10, 12, 2], w: 1.5, d: 1.5, r: 7, s: 0.7, spread: 0.15 },
    { key: 'wall17', t0: 22.6, n: 60, p: [-6, 0, 2], v: [0, 9, 3], w: 6, d: 2, r: 3, s: 1.0 }]);
  stmFg(s, [['spray', [-2.2, -2.4, -7], 1.0]], STM_K17, 's17', lt, { orbit: 0.04, creep: 0.03 });
  stmRender(s, { bgBlur: stmRack(lt, 's17', 2.4, 3.2), glow: 0.85 + s.fl * 0.3 + (t > lego ? 0.1 : 0) });
  void lego;
};

// =====================================================================
//  s29 — "and then storms push it right back to shore.": dusk under a breaking storm sky; a breaker rolls in toward
//  the beach full of bright bricks, pushes them up the wet sand and drains away leaving them glinting
// =====================================================================
const STM_K29 = [[0, [-8, 8.2, -52], [4, 2.4, -2], 48], [2.1, [-3, 7.0, -44], [6, 2.0, -8], 48]];
function stmShoreBricks(s, t, tP) {
  const m4 = new THREE.Matrix4(), p = stmV(0, 0, 0), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = stmV(1, 1, 1), st = { amp: 0.7, shore: -12 };
  const n = 520;
  for (let i = 0; i < s.nBricks; i++) {
    if (i >= n) { m4.makeScale(0, 0, 0); s.bricks.setMatrixAt(i, m4); continue; }
    const R = RNG('sb', i), x0 = R.r(-26, 34), z0 = R.r(-6, 40), push = EZ.io(clamp((t - tP - R.r(-0.4, 0.4)) / 1.3));
    const zEnd = R.r(-34, -14), z = lerp(z0, zEnd, push) + Math.sin(t * 1.3 + i) * 0.6 * (1 - push), x = x0 + push * R.n(3);
    const sand = (-12 - z) * 0.1;
    const y = z > -12 ? stmH(x, z, t, st) + 0.15 : Math.max(sand + 0.2, stmH(x, z, t, st) + 0.1);
    e.set(R.r(0, TAU) * (1 - push * 0.7) + t * R.n(1.2) * (1 - push), R.r(0, TAU), R.r(0, TAU) * (1 - push * 0.8)); q.setFromEuler(e);
    p.set(x, y, z); const k = R.r(0.32, 0.5); sc.setScalar(k); m4.compose(p, q, sc); s.bricks.setMatrixAt(i, m4);
  }
  s.bricks.instanceMatrix.needsUpdate = true;
}
SHOT_FN['s29'] = (t, u, lt) => {
  const s = stmGet(), push = stmW('push', 1, 43.7), shore = stmW('shore', 1, 44.7);
  const st = { amp: 0.7, shore: -12, rogue: { dir: -1, x: 4, len: 400, z0: 50, z1: -14, t0: 43.0, t1: shore + 0.2, A: 4.5, w: 7 } };
  c3SetCam(s.cam, stmCam(STM_K29, lt, 's29', { orbit: -0.04 }));
  // the breaker here moves toward -z (the beach): flip the ridge direction by mirroring z in the sea state
  stmWorld(s, t, { sea: st, cx: 0, cz: 10, ship: false, flashes: [43.5], noBolt: false, rain: 0.5, wind: 0.32, hemi: 1.0,
    surf: (x, z) => z < -8 && z > -16 ? clamp(0.35 + 0.35 * Math.sin(x * 0.5 + t * 2.5) - Math.abs(z + 12) * 0.08) : 0 });
  s.shore.visible = true; s.sky.material.map = s.skyDusk; s.fog.color.set('#5a4a5a');
  s.hemi.color.set('#ffc8a0'); s.key.color.set('#ffb880'); s.key.position.set(80, 40, -160);
  stmShoreBricks(s, t, push);
  s.lace.forEach((m, i) => { const ph = clamp(Math.sin((t - push) * 1.6 - i * 1.1) * 0.5 + 0.5), z = lerp(-12, -24 + i * 3, ph); m.position.set(i * 7, s.sandY(z) + 0.06, z); m.material.opacity = 0.55 + 0.4 * ph; });
  const rg = stmRogue(st.rogue, t); stmSprayAt(s, t, [{ key: 'br29', t0: push - 0.3, n: 140, p: [4, rg.A * 0.9, rg.zc - 1], v: [0, 5, -4], w: 40, d: 1.5, r: 2.5, s: 0.55, spread: 0.8 }]);
  stmFg(s, [['grass', [-3.2, -5.2, -10], 1.2]], STM_K29, 's29', lt, { orbit: -0.04 });
  stmRender(s, { bg: '#1a1420', bgBlur: stmRack(lt, 's29', 1.4, 2.4), glow: 0.8 + s.fl * 0.3, bloom: 0.3 });
  // restore the night lighting for the other shots
  s.fog.color.set('#2c3c6a'); s.hemi.color.set('#9ab0e8'); s.key.color.set('#d8e2ff'); s.key.position.set(-60, 120, 80);
};

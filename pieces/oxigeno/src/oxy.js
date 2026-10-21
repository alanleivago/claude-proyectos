
// =====================================================================
//  OXY — the rooftop café at golden hour over luna's harbour town, and the five seconds without oxygen (×10 slow).
//  Built on scenes.js (the harbour world); this file adds the café terrace, poses everything from TT and draws the story.
// =====================================================================
const OXEN = typeof OX_EN !== 'undefined' && OX_EN;   // the English version sets OX_EN = true in its head.html
const LG = (es, en) => (OXEN ? en : es);
const blot2 = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const DECK = { x: -6, z: -60, w: 20, d: 15 };          // the café deck on a seafront building's roof: x -16..4, z -67.5..-52.5
DECK.y = 2.6 + 14;
const DZ = DECK.z + 7;                                 // the café layout offsets were drawn for z -7
const PITS = LG([[-6.4, -6.0], [-1.2, -9.4]], [[-10.6, -6.4], [-3.0, -4.6]]);                // two fire-pit tables in the foreground (old-frame x, z)
const SUN = LG(dirV(-26 * DEG, 6.5 * DEG), dirV(30 * DEG, 20 * DEG));   // ES: low golden sun ahead-left; EN: a higher afternoon sun ahead-right
const T_GONE = 5.0, T_BACK = 55.0, T_FALL = 37.6, CAMX = LG(-5.6, 1.2), CAMZ = DECK.z - DECK.d / 2 + 0.05;   // you sit near the glass, 3.6 m from the edge
const fallY = (t) => (t < T_FALL ? 0 : -Math.min(DECK.y - 1.0, 0.5 * 0.5 * Math.pow(t - T_FALL, 2)) - 1.2 * ss(41, 53, t));   // you fall (slowed) into the dust, down to the crumbling ground
// the camera: seated at the café's edge looking over the harbour; a jolt when the oxygen goes; glances; the fall; the blast
// head turns [t0, t1, yaw°, pitch°]: right after the pop the camera slowly looks round at the people holding their ears
const GL = LG([[5.5, 8.3, 34, -10], [8.1, 10.9, -22, -9], [11.6, 13.4, 30, -4], [14.2, 16.4, -24, -3], [19.6, 26.5, 6, -24], [27.6, 34.2, -52, 4], [34.2, 38.6, 165, -32], [39.0, 46.5, -6, -22]],
  [[5.5, 8.3, -30, -10], [8.1, 10.9, 26, -9], [11.4, 13.2, -32, -4], [14.0, 16.2, 26, -3], [19.6, 26.5, -8, -24], [27.6, 34.2, -4, 3], [34.2, 38.6, -170, -32], [39.0, 46.5, 8, -22]]);
const stepW = (t) => (t > 17.3 && t < 19.6 ? (t - 17.3) * 16 : 0);   // a few steps to the glass
function camPoseO(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c, pop = ss(5.0, 5.12, t) * (1 - ss(5.6, 7.5, t)), fall = ss(T_FALL, T_FALL + 0.6, t), blast = ss(55, 55.25, t) * (1 - ss(58, 62, t));
  let y = 0, p = 0; for (const [a, b, yw, pt] of GL) { const k = ss(a, a + 0.8, t) * (1 - ss(b - 0.8, b, t)); y += yw * k; p += pt * k; }
  const shake = pop * 1.0 + 0.25 * ss(27, 33, t) * (1 - fall) + 0.9 * ss(T_FALL - 1.2, T_FALL, t) * (1 - ss(T_FALL + 2, T_FALL + 5, t)) + 1.6 * blast;
  const P = camPoseRaw(t, n, y, p, shake, fall), aim = ss(51.5, 54, t);
  if (aim > 0) { P.y += 5 * aim; const dx = BLAST_C.x - P.x, dz = BLAST_C.z - P.z, dy = BLAST_C.y + 14 - P.y, yawT = Math.atan2(-dx, -dz), pitT = Math.atan2(dy, Math.hypot(dx, dz));
    let dyaw = yawT - P.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); P.yaw += dyaw * aim; P.pitch = lerp(P.pitch, pitT, aim); P.roll *= 1 - 0.7 * aim; }
  return P;
}
function camPoseRaw(t, n, y, p, shake, fall) {
  return {
    x: lerp(LG(-3.9, -9.5), CAMX, EZ.io(seg(t, 17.3, 19.6))) + n(0.31, 1, 0.03) + shake * (n(29, 0, 0.04) + n(41, 1, 0.025)) - 4 * fall * ss(T_FALL, 50, t),
    y: DECK.y + 1.82 + 0.45 * ss(18.6, 20.2, t) * (1 - ss(T_FALL - 1.5, T_FALL, t)) + n(0.43, 0.3, 0.015) + shake * n(33, 2, 0.04) + fallY(t),
    z: lerp(-0.2 + DZ, CAMZ, EZ.io(seg(t, 17.3, 19.6))) + 0.18 * Math.sin(stepW(t)) - 3 * fall * ss(T_FALL, 48, t),
    yaw: (LG(lerp(4, 17, ss(17.3, 19.6, t)), lerp(-14, -24, ss(17.3, 19.6, t))) + y + n(0.21, 0.7, 0.5) + n(0.57, 2.1, 0.2) + shake * n(23, 3, 1.4) + 25 * fall * Math.sin((t - T_FALL) * 0.35)) * DEG,
    pitch: (lerp(-1.5, -12, ss(17.3, 19.8, t)) + p + n(0.33, 1.2, 0.3) + shake * n(37, 1, 1.8) + 30 * ss(46, 52, t)) * DEG,
    roll: (n(0.27, 2.1, 0.3) + shake * n(19, 2, 1.6) + 6 * fall * Math.sin((t - T_FALL) * 0.5)) * DEG,
  };
}
// the town crumbles from the far side towards you (27-37): each house's moment
// the blast: ignition point over the harbour, the front's radius over time; it reaches the camera (≈170 m away) at T_HIT2
const BLAST_C = new THREE.Vector3(OXEN ? -40 : 30, 18, -235), T_HIT2 = 59.5;
const blastR = (t) => (t < 55 ? 0 : 8 + 190 * Math.pow(seg(t, 55, T_HIT2 + 0.4), 0.7));
const boatSpeed = (t) => 3.2 * (1 - ss(13.4, 16.0, t));   // engines die: the boats coast to a stop
const boatRun = (t) => { let s = 0; for (let u = 0; u < t; u += 0.05) s += boatSpeed(u) * Math.min(0.05, t - u); return s; };
const crumbleT = (x, z) => 27.2 + 8.5 * clamp((300 + z) / 330) + 0.6 * Math.sin(x * 0.13 + z * 0.07);

// ---- the café terrace (built once on top of the harbour world)
let GO = null;
function gO() {
  if (GO) return GO;
  const g = g3(), scene = g.scene, R = RNG('cafe');
  // the luna houses under the café's footprint are removed (the café building stands there)
  for (let i = 0; i < g.nH; i++) { const [hx, hz] = g.hPos[i]; if (Math.abs(hx - DECK.x) < DECK.w / 2 + 14 && Math.abs(hz - DECK.z) < DECK.d / 2 + 7) { g.hMat[i] = _hid.clone(); g.rMat[i] = _hid.clone(); g.houses.setMatrixAt(i, _hid); g.roofs.setMatrixAt(i, _hid); } }
  g.chim.forEach((ch, i) => { const [hx, hz] = g.hPos[ch[5]]; if (Math.abs(hx - DECK.x) < DECK.w / 2 + 5 && Math.abs(hz - DECK.z) < DECK.d / 2 + 5) { g.cMat[i] = _hid.clone(); g.kMat[i] = _hid.clone(); } });
  g.ants.forEach((a, i) => { const [hx, hz] = g.hPos[a[3]]; if (Math.abs(hx - DECK.x) < DECK.w / 2 + 5 && Math.abs(hz - DECK.z) < DECK.d / 2 + 5) for (let k = 0; k < 3; k++) g.aMat[i * 3 + k] = _hid.clone(); });
  scene.children.forEach((ch) => { if (ch.isGroup && Math.abs(ch.position.x - TERR.x) < 0.01 && Math.abs(ch.position.z - TERR.z) < 0.01) ch.visible = false; });   // luna's small roof terrace lies under the café
  const plank = wrap(g3Tex((x, w, h) => { const Rp = RNG('planks'); for (let i = 0; i < 6; i++) { const v = Rp.r(-14, 14); x.fillStyle = `rgb(${150 + v},${108 + v},${74 + v})`; x.fillRect(0, i * h / 6, w, h / 6 - 3); for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(70,45,25,0.18)'; x.lineWidth = 1; x.beginPath(); const yy = i * h / 6 + Rp.r(2, h / 6 - 4); x.moveTo(0, yy); for (let s = 0; s <= w; s += 16) x.lineTo(s, yy + Math.sin(s * 0.05 + k) * 1.5); x.stroke(); } x.fillStyle = 'rgba(40,25,15,0.55)'; x.fillRect(0, i * h / 6 + h / 6 - 3, w, 3); }
    speck(x, w, h, 6000, ['rgba(60,40,20,0.15)', 'rgba(255,230,190,0.1)'], Rp, 1, 3); for (let k = 0; k < 8; k++) { x.fillStyle = 'rgba(50,30,15,0.4)'; x.fillRect(Rp.r(0, w), Math.floor(Rp.r(0, 6)) * h / 6, 2, h / 6 - 3); } }, 256, 256), 1, 1);
  // wood grain for planks and furniture; rough plaster for the walls; a woven canvas for the parasols (each also a bump map)
  const texGrain = (key, base, dark) => g3Tex((x, w, h) => { const Rg = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let k = 0; k < 140; k++) { const y0 = Rg.r(0, h), a = Rg.r(0.05, 0.22); x.strokeStyle = `rgba(${dark},${a})`; x.lineWidth = Rg.r(0.6, 2.2); x.beginPath(); x.moveTo(0, y0); for (let s = 0; s <= w; s += 8) x.lineTo(s, y0 + Math.sin(s * 0.03 + k) * Rg.r(1, 5) + Math.sin(s * 0.11 + k * 2) * 1.2); x.stroke(); }
    for (let k = 0; k < 12; k++) { const px = Rg.r(0, w), py = Rg.r(0, h), r = Rg.r(3, 9); x.strokeStyle = `rgba(${dark},0.35)`; x.lineWidth = 1.2; x.beginPath(); x.ellipse(px, py, r * 2.2, r, 0, 0, TAU); x.stroke(); } }, 256, 256);
  const plaster = wrap(g3Tex((x, w) => { const Rp = RNG('plaster'); x.fillStyle = '#ece0c8'; x.fillRect(0, 0, w, w); for (let k = 0; k < 40; k++) blot2(x, Rp.r(0, w), Rp.r(0, w), Rp.r(10, 60), `rgba(${Rp.f() < 0.5 ? '120,100,80' : '255,250,235'},0.12)`); speck(x, w, w, 18000, ['rgba(90,80,70,0.18)', 'rgba(255,255,255,0.2)'], Rp, 1, 2); }, 256, 256), 2, 1);
  const canvasT = g3Tex((x, w) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 3) { x.fillStyle = 'rgba(0,0,0,0.07)'; x.fillRect(i, 0, 1, w); x.fillRect(0, i, w, 1); } for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(i * w / 12, 0, 2, w); } }, 128, 128);
  const deckM = STD({ map: plank, bumpMap: plank, bumpScale: 0.12, roughness: 0.75 });
  // the floor's end: holes eat into the deck and the walls (noise threshold uDis), each hole rimmed with pale crumbling dust
  const DIS = { uDis: { value: -1 } };
  const dissolve = (m) => { m.onBeforeCompile = (sh) => { sh.uniforms.uDis = DIS.uDis;
    sh.vertexShader = 'varying vec3 vDw;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      { vec4 w4 = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        w4 = instanceMatrix * w4;
      #endif
        vDw = (modelMatrix * w4).xyz; }`);
    sh.fragmentShader = 'uniform float uDis; varying vec3 vDw;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      { vec2 q = vDw.xz * 0.9 + vDw.y * 0.3; float n = 0.5 + 0.25 * sin(q.x * 3.1 + sin(q.y * 2.3) * 1.7) * sin(q.y * 2.9 + sin(q.x * 1.9) * 1.3) + 0.15 * sin(q.x * 9.7 - q.y * 7.3) + 0.1 * sin(q.x * 21.0 + q.y * 17.0);
        if (n < uDis) discard; float rim = 1.0 - smoothstep(uDis, uDis + 0.07, n); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.78, 0.7), rim * step(-0.5, uDis)); }`); }; return m; };
  dissolve(deckM);
  // the deck as 1.25 m tiles so it can break apart and fall
  const TW = 1.25, nx = Math.round(DECK.w / TW), nz = Math.round(DECK.d / TW), tiles = IM(new THREE.BoxGeometry(TW - 0.004, 0.3, TW - 0.004), deckM, nx * nz), tileL = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = DECK.x - DECK.w / 2 + (i + 0.5) * TW, z = DECK.z - DECK.d / 2 + (j + 0.5) * TW, d = Math.hypot(x - CAMX, z - CAMZ);
    tileL.push({ x, z, t0: T_FALL - 0.4 + d * 0.06 + R.r(0, 0.5), rx: R.n(2), rz: R.n(2), sp: R.r(0.8, 1.2) }); }
  tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tiles.frustumCulled = false; scene.add(tiles);
  const under = new THREE.Mesh(new THREE.BoxGeometry(DECK.w, DECK.y + 2, DECK.d), new THREE.MeshStandardMaterial({ map: wrap(texFacade(), 1, 1), color: 0xe8d4b4, roughness: 0.9 })); under.position.set(DECK.x, DECK.y / 2 - 1.15, DECK.z); under.receiveShadow = true; scene.add(under);
  // the parapet: a low rendered wall and a glass balustrade on top (the glass will turn to dust)
  const wallM = dissolve(STD({ map: plaster, bumpMap: plaster, bumpScale: 1.2, color: 0xffffff, roughness: 0.9 })), glassM = new THREE.MeshPhysicalMaterial({ color: 0xbfd8e0, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.28, side: THREE.DoubleSide });
  const par = [[DECK.x, DECK.z - DECK.d / 2, DECK.w, 0.25], [DECK.x - DECK.w / 2, DECK.z, 0.25, DECK.d], [DECK.x + DECK.w / 2, DECK.z, 0.25, DECK.d]];
  const parM = par.map(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, d), wallM); m.position.set(x, DECK.y + 0.42, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; });
  const glass = par.map(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.03), 0.9, Math.max(d, 0.03)), glassM); m.position.set(x, DECK.y + 1.15, z); scene.add(m); return m; });
  const rail = par.map(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), STD({ color: 0x2a2e33, metalness: 0.6, roughness: 0.35 })); m.position.set(x, DECK.y + 1.62, z); scene.add(m); return m; });
  // tables with chairs, candles in glass jars, wine glasses, bottles; two patio heaters; a bar; plants; string lights
  const TAB = []; { const Rt = RNG('tables'); for (const z of [-12.5, -9.6, -6.7, -4.3].map((v) => v + DZ)) for (const x of [-13.2, -9.9, -6.6, -3.3, 0.1, 2.6]) { const px = lerp(LG(-3.9, -9.5), CAMX, clamp((-0.2 + DZ - z) / 14.5)); if (Math.abs(x - px) < 1.6 || (x > 2 && z > -8 + DZ) || PITS.some(([fx, fz]) => Math.abs(x - fx) < 2.4 && Math.abs(z - fz - DZ) < 2.0)) continue; TAB.push([x + Rt.r(-0.3, 0.3), z + Rt.r(-0.25, 0.25)]); } }
  const woodD = STD({ map: texGrain('tabletop', '#6a4428', '30,18,10'), bumpMap: texGrain('tabletop', '#808080', '0,0,0'), bumpScale: 0.6, roughness: 0.55 }), metal = STD({ color: 0x2a2e33, metalness: 0.6, roughness: 0.4 }), white = STD({ color: 0xf2efe8, roughness: 0.5 });
  const top = IM(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), woodD, TAB.length), leg = IM(new THREE.CylinderGeometry(0.035, 0.05, 0.74, 8), metal, TAB.length), foot = IM(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 16), metal, TAB.length);
  const chairS = IM(new THREE.BoxGeometry(0.42, 0.04, 0.42), STD({ map: texGrain('chair', '#9a663c', '40,22,10'), roughness: 0.7 }), TAB.length * 3), chairB = IM(new THREE.BoxGeometry(0.42, 0.42, 0.04), STD({ map: texGrain('chairB', '#9a663c', '40,22,10'), roughness: 0.7 }), TAB.length * 3), chairL = IM(new THREE.BoxGeometry(0.03, 0.44, 0.03), metal, TAB.length * 12);
  const jar = IM(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 12), new THREE.MeshPhysicalMaterial({ color: 0xffe0b0, transparent: true, opacity: 0.45, roughness: 0.1 }), TAB.length, false), wineG = IM(new THREE.CylinderGeometry(0.035, 0.012, 0.16, 10), new THREE.MeshPhysicalMaterial({ color: 0xe8f0f4, transparent: true, opacity: 0.4, roughness: 0.05 }), TAB.length * 2, false), bottle = IM(new THREE.CylinderGeometry(0.035, 0.04, 0.3, 10), STD({ color: 0x2e4a2a, roughness: 0.2, metalness: 0.2 }), TAB.length, false);
  const seats = [], props = [];
  TAB.forEach(([x, z], i) => { const y = DECK.y + 0.15; top.setMatrixAt(i, M4c(x, y + 0.76, z)); leg.setMatrixAt(i, M4c(x, y + 0.38, z)); foot.setMatrixAt(i, M4c(x, y + 0.02, z));
    jar.setMatrixAt(i, M4c(x + 0.1, y + 0.83, z)); bottle.setMatrixAt(i, M4c(x - 0.15, y + 0.93, z + 0.1)); for (let k = 0; k < 2; k++) wineG.setMatrixAt(i * 2 + k, M4c(x + R.r(-0.25, 0.25), y + 0.86, z + R.r(-0.25, 0.25)));
    props.push([x, y, z]);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + R.r(0, 0.5) + 0.4, cx = x + Math.sin(a) * 0.72, cz = z + Math.cos(a) * 0.72, ry = a + Math.PI, idx = i * 3 + k;
      chairS.setMatrixAt(idx, M4c(cx, y + 0.46, cz, ry)); chairB.setMatrixAt(idx, M4c(cx + Math.sin(ry) * -0.2, y + 0.68, cz + Math.cos(ry) * -0.2, ry));
      [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz], q) => { const c = Math.cos(ry), s = Math.sin(ry); chairL.setMatrixAt(idx * 4 + q, M4c(cx + lx * c + lz * s, y + 0.22, cz - lx * s + lz * c)); });
      seats.push({ x: cx, z: cz, ry, table: i }); } });
  [top, leg, foot, chairS, chairB, chairL, jar, wineG, bottle].forEach((m) => scene.add(m));
  const heaters = [[-15.1, -14.0], [-8.2, -8.1], [1.2, -11.0]].map(([x, z]) => [x, z + DZ]).map(([x, z]) => { const grp = new THREE.Group(); grp.position.set(x, DECK.y + 0.15, z); scene.add(grp);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 10), metal); pole.position.y = 1.05; grp.add(pole); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.12, 16), metal); base.position.y = 0.06; grp.add(base);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.12, 0.25, 20, 1, true), STD({ color: 0x8a8e94, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })); head.position.y = 2.25; grp.add(head);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 12), new THREE.MeshBasicMaterial({ color: 0xff7a30 })); glow.position.y = 1.9; grp.add(glow); return { grp, glow, x, z }; });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 6.5), STD({ color: 0x3a2a20, roughness: 0.6 })); bar.position.set(3.2, DECK.y + 0.7, -3.4 + DZ); bar.castShadow = true; scene.add(bar);
  const barTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 6.7), STD({ color: 0xe8e4dc, roughness: 0.3 })); barTop.position.set(3.2, DECK.y + 1.28, -3.4 + DZ); scene.add(barTop);
  const bottles = IM(new THREE.CylinderGeometry(0.04, 0.045, 0.32, 10), STD({ roughness: 0.15, metalness: 0.2 }), 22, false); for (let i = 0; i < 22; i++) { bottles.setMatrixAt(i, M4c(3.35 + R.r(-0.2, 0.2), DECK.y + 1.47, -6.3 + DZ + i * 0.27)); bottles.setColorAt(i, lin(R.pick(['#2e4a2a', '#5a2a1a', '#d8c890', '#2a3a5a', '#e8e4dc']))); } scene.add(bottles);
  const potM = STD({ color: 0xb0603a, roughness: 0.9 }), leafM = STD({ color: 0x3a6a34, roughness: 0.9 }), plants = [];
  [[-15.3, -2.0], [-15.3, -6.5], [-15.3, -10.5], [3.4, -0.2]].map(([x, z]) => [x, z + DZ]).forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55, 14), potM); p.position.set(x, DECK.y + 0.42, z); p.castShadow = true; scene.add(p);
    for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), leafM); l.position.set(x + R.n(0.15), DECK.y + 0.95 + k * 0.18, z + R.n(0.15)); l.scale.set(1, 1.3, 1); l.castShadow = true; scene.add(l); plants.push(l); } plants.push(p); });
  // parasols: canvas canopies on wooden poles over the back tables
  const paraC = STD({ map: canvasT, bumpMap: canvasT, bumpScale: 0.5, roughness: 0.85, side: THREE.DoubleSide }), paraP = STD({ color: 0x8a6a48 }); const paras = LG([[-11.6, -11.1, '#f2ead8'], [-1.6, -11.1, '#c8372d'], [-11.6, -8.1, '#2a6a62']], [[-13.2, -9.6, '#1f4e8a'], [-5.0, -12.2, '#f2ead8'], [0.6, -8.4, '#e8b23a'], [-14.4, -3.6, '#1f4e8a']]).map(([x, z, c]) => [x, z + DZ, c]).map(([x, z, c]) => { const grp = new THREE.Group(); grp.position.set(x, DECK.y + 0.15, z); scene.add(grp);
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.5, 8), paraP); pl.position.y = 1.25; grp.add(pl); const cn = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.6, 12, 1, true), paraC.clone()); cn.material.color.set(c); cn.position.y = 2.45; cn.castShadow = true; grp.add(cn); return grp; });
  // fire-pit tables: a plaster block, a dark stone rim, a bed of lava rocks; flames and a warm light (out at 11 s)
  const pits = PITS.map(([px, pz]) => { const x = px, z = pz + DZ, grp = new THREE.Group(); grp.position.set(x, DECK.y + 0.15, z); scene.add(grp);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.46, 0.95), wallM); body.position.y = 0.23; body.castShadow = true; body.receiveShadow = true; grp.add(body);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.06, 1.01), STD({ color: 0x3a3632, roughness: 0.6 })); rim.position.y = 0.49; grp.add(rim);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.55), STD({ color: 0x1a1612, roughness: 1 })); bed.position.y = 0.53; grp.add(bed);
    const Rr = RNG('lava', x); for (let k = 0; k < 26; k++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(Rr.r(0.04, 0.08), 0), STD({ color: 0x2a2420, roughness: 1, emissive: 0x401808 })); s.position.set(Rr.r(-0.65, 0.65), 0.56, Rr.r(-0.24, 0.24)); grp.add(s); }
    const light = new THREE.PointLight(0xff8a40, 2.2, 9, 2); light.position.set(0, 1.0, 0); grp.add(light);
    [[-0.95, 0.5], [0.95, 0.5], [0, -0.85]].forEach(([dx, dz], q) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.42, 14), STD({ color: 0x8a6a48, roughness: 0.8 })); st.position.set(dx * 1.05, 0.21, dz * 1.1); st.castShadow = true; grp.add(st); });
    return { grp, light, x, z }; });
  // string lights: catenaries between poles at the corners
  const poleP = [[-15.8, -14.3], [3.8, -14.3], [3.8, 0.3], [-15.8, 0.3]].map(([x, z]) => [x, z + DZ]), polesO = poleP.map(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.4, 8), metal); m.position.set(x, DECK.y + 1.85, z); m.castShadow = true; scene.add(m); return m; });
  const bulbs = []; [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]].forEach(([a, b]) => { const [x0, z0] = poleP[a], [x1, z1] = poleP[b]; for (let k = 0; k <= 16; k++) { const u = k / 16; bulbs.push([lerp(x0, x1, u), DECK.y + 3.4 - 0.9 * Math.sin(u * Math.PI), lerp(z0, z1, u)]); } });
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,236,200,0.85)'], [0.5, 'rgba(255,190,110,0.2)'], [1, 'rgba(255,170,90,0)']], 64);
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bulbs.flat(), 3));
  const bulbPts = new THREE.Points(bg, new THREE.PointsMaterial({ size: 0.55, map: glowTex, color: 0xffe2b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bulbPts.renderOrder = 6; scene.add(bulbPts);
  const wireG = new THREE.BufferGeometry().setFromPoints(bulbs.map(([x, y, z]) => new THREE.Vector3(x, y + 0.06, z))); const wire = new THREE.Line(wireG, new THREE.LineBasicMaterial({ color: 0x1a1a1a })); scene.add(wire);
  // people on the terrace: seated at the tables, a few standing at the glass, a waiter
  const PG = g.PG, NP = 36, PMo = {}; for (const k in PG) { const [geo, n, , mat] = PG[k]; const m = IM(geo.clone(), mat.clone(), NP * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); PMo[k] = m; }
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#c2185b', '#f4f1ea', '#a8402a'], PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#4a3a2a', '#6a7a8a'], SKIN = ['#f3cfae', '#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26'], HAIR = ['#2a1d16', '#4a3020', '#7a5230', '#c9a060', '#1a1a1a', '#b8b0a8'];
  const tp = []; const RP = RNG('cafePeople');
  const mk = (o) => { const skin = lin(RP.pick(SKIN)), shirt = lin(RP.pick(SHIRT)), pants = lin(RP.pick(PANTS)), shorts = RP.f() < 0.3, longS = RP.f() < 0.45;
    const c = { skin, shirt, pants, shin: shorts ? skin : pants, sleeve: shirt, fore: longS ? shirt : skin, shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030'])), hair: lin(RP.pick(HAIR)) };
    tp.push(Object.assign({ s: RP.r(0.94, 1.06), w: RP.r(0.9, 1.15), ph: RP.r(0, TAU), longHair: RP.f() < 0.45, c, earT: T_GONE + RP.r(0.04, 0.35), look: RP.n(0.4),
      bendK: RP.r(0.55, 1), kneels: RP.f() < 0.6 ? 1 : 0, kneelT: RP.r(0.9, 2.6), lies: RP.f() < 0.45 ? 1 : 0 }, o)); };
  seats.forEach((st, i) => { if (tp.length < 23 && (i % 3 !== 2 || RP.f() < 0.5)) mk({ kind: 'sit', x: st.x, z: st.z, yaw: st.ry + Math.PI }); });
  LG([[-11.2, -13.6, Math.PI], [-9.0, -13.7, Math.PI + 0.3], [-1.6, -13.5, Math.PI - 0.2], [1.2, -13.4, Math.PI], [2.4, -1.4, -Math.PI / 2]], [[-11.2, -13.6, Math.PI], [-9.0, -13.7, Math.PI + 0.3], [-6.4, -13.5, Math.PI - 0.2], [-3.4, -13.4, Math.PI], [2.4, -1.4, -Math.PI / 2]]).forEach(([x, z, yaw]) => mk({ kind: 'stand', x, z: z + DZ, yaw }));
  mk({ kind: 'waiter', x: -4, z: -4.5 + DZ, yaw: 0 });
  // a few people right by you, so the pain reads up close when the camera looks round (5.5-10.9 s)
  LG([[-1.2, -2.6, 2.4, 0], [-2.0, -3.8, 2.0, 1], [-6.8, -2.2, -2.2, 0], [-7.4, -3.4, -1.0, 1], [-5.9, -4.4, -0.4, 0]], [[-12.0, -2.4, -2.2, 1], [-12.8, -3.8, -1.4, 0], [-7.0, -2.6, 2.2, 0], [-6.4, -3.6, 1.6, 1], [-8.6, -4.6, 0.3, 0]]).forEach(([x, z, yaw, k]) => mk({ kind: 'stand', x, z: z + DZ, yaw, kneels: k, lies: 0, kneelT: 1.2 + x * 0.05 }));
  tp.length = Math.min(tp.length, NP);
  tp.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMo[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });
  // the vapour of the sea (hydrogen) and the dust of the town: big billow sprites in a pool (normal blend), flames (additive)
  // the fireball: a churning sphere of flame born over the harbour (55 s), and a bright inner core
  const fireTex = g3Tex((x, w, h) => { const Rf = RNG('fireTex'); x.fillStyle = '#c84a12'; x.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) blot2(x, Rf.r(0, w), Rf.r(0, h), Rf.r(6, 40), Rf.pick(['rgba(255,210,120,0.35)', 'rgba(255,150,50,0.35)', 'rgba(120,30,8,0.35)', 'rgba(255,240,190,0.25)', 'rgba(60,20,10,0.3)'])); }, 512, 256);
  fireTex.wrapS = THREE.RepeatWrapping;
  const fball = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), new THREE.MeshBasicMaterial({ map: fireTex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  const fcore = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  [fball, fcore].forEach((m) => { m.visible = false; m.renderOrder = 9; scene.add(m); });
  // smoke and dust: ragged clusters of many small lumps (lit on top, shaded below), wispy edges — replaces the round billows
  const smokeTex = [0, 1, 2].map((v) => g3Tex((x, w) => { const Rs = RNG('smokeT', v);
    for (let i = 0; i < 220; i++) { const a = Rs.r(0, TAU), d = Math.pow(Rs.f(), 0.6) * w * 0.34 * (0.75 + 0.25 * Math.sin(a * 5 + v)), px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.8, s = Rs.r(w * 0.025, w * 0.09) * (1.2 - d / (w * 0.45));
      const g = x.createRadialGradient(px, py - s * 0.3, 0, px, py, s), lit = py < w / 2 ? 255 : 205; g.addColorStop(0, `rgba(${lit},${lit},${lit},${Rs.r(0.18, 0.4)})`); g.addColorStop(0.6, `rgba(${lit - 30},${lit - 30},${lit - 25},${Rs.r(0.08, 0.2)})`); g.addColorStop(1, 'rgba(150,150,150,0)');
      x.fillStyle = g; x.fillRect(px - s, py - s, 2 * s, 2 * s); }
    for (let i = 0; i < 40; i++) { const a = Rs.r(0, TAU), d = w * Rs.r(0.3, 0.46), px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.8; blot2(x, px, py, Rs.r(4, 12), 'rgba(230,230,230,0.12)'); } }, 192, 192));
  g.smokes.forEach((s, i) => { s.material.map = smokeTex[i % 3]; s.material.needsUpdate = true; }); g.billows.forEach((s, i) => { s.material.map = smokeTex[i % 3]; s.material.needsUpdate = true; });
  // ---- a modern district across the bay: a quay of land and ~30 towers with glass curtain walls; they crumble from the top down
  const DIST = OXEN ? { x0: 180, x1: 760, z0: -760, z1: -1250 } : { x0: 150, x1: 620, z0: -150, z1: -620 };
  const land = new THREE.Mesh(new THREE.BoxGeometry(DIST.x1 - DIST.x0 + 60, 30, DIST.z0 - DIST.z1 + 60), STD({ color: 0x8a8478, roughness: 0.95 })); land.position.set((DIST.x0 + DIST.x1) / 2, PROM - 15, (DIST.z0 + DIST.z1) / 2); land.receiveShadow = true; scene.add(land);
  const curtain = g3Tex((x, w, h) => { const Rc = RNG('curtain'); const gr = x.createLinearGradient(0, 0, w * 0.4, h); gr.addColorStop(0, '#e8d8c8'); gr.addColorStop(0.4, '#9aa8bc'); gr.addColorStop(1, '#3a4658'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 10; k++) { const px = Rc.r(0, w), pw = Rc.r(10, 50); const gg = x.createLinearGradient(px, 0, px + pw, 0); gg.addColorStop(0, 'rgba(255,240,220,0)'); gg.addColorStop(0.5, 'rgba(255,240,220,0.22)'); gg.addColorStop(1, 'rgba(255,240,220,0)'); x.fillStyle = gg; x.fillRect(px, 0, pw, h); }
    const cw = w / 12, rh = h / 24; for (let r = 0; r < 24; r++) for (let q = 0; q < 12; q++) if (Rc.f() < 0.15) { x.fillStyle = `rgba(${Rc.f() < 0.5 ? '235,228,214' : '40,46,56'},0.4)`; x.fillRect(q * cw + 2, r * rh + 2, cw - 4, rh * Rc.r(0.3, 0.9)); }
    x.fillStyle = 'rgba(30,34,40,0.85)'; for (let q = 0; q <= 12; q++) x.fillRect(q * cw - 1, 0, 2, h); x.fillStyle = 'rgba(70,76,86,0.9)'; for (let r = 0; r <= 24; r++) x.fillRect(0, r * rh - 2, w, 4); }, 256, 512);
  curtain.wrapS = curtain.wrapT = THREE.RepeatWrapping;
  const TOWU = { uFront: { value: 0 } };
  const towM = STD({ map: curtain, roughness: 0.3, metalness: 0.25 }); towM.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute float aCut; varying float vCut; varying vec3 vTp; varying vec2 vTw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 lp = (position + 0.5) * sc; vTp = lp; vCut = aCut * sc.y;
      vTw = (abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y)) / vec2(36.0, 72.0);`);
    sh.fragmentShader = 'varying float vCut; varying vec3 vTp; varying vec2 vTw;\n' + sh.fragmentShader.replace('#include <map_fragment>', `diffuseColor.rgb *= texture2D(map, vTw).rgb * 1.1;
      { float jag = 2.5 * sin(vTp.x * 0.9 + vTp.z * 1.3) + 1.5 * sin(vTp.x * 3.1 - vTp.z * 2.7); if (vTp.y > vCut + jag) discard; float rim = 1.0 - smoothstep(0.0, 3.0, vCut + jag - vTp.y); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.5, 0.44), rim * step(vCut, 9000.0)); }`);
  };
  const TL = []; { const Rt = RNG('district'); let tries = 0; while (TL.length < 30 && tries++ < 400) { const x = Rt.r(DIST.x0, DIST.x1), z = Rt.r(DIST.z1, DIST.z0), sx = Rt.r(16, 30), sz = Rt.r(16, 30), h = Rt.r(40, 150) * (Rt.f() < 0.2 ? 1.5 : 1);
    if (TL.some((q) => Math.abs(q.x - x) < (q.sx + sx) / 2 + 6 && Math.abs(q.z - z) < (q.sz + sz) / 2 + 6)) continue; TL.push({ x, z, sx, sz, h, t0: 27.6 + Rt.r(0, 6.5), dur: Rt.r(4, 7) }); } }
  const tGeo = new THREE.BoxGeometry(1, 1, 1); tGeo.setAttribute('aCut', new THREE.InstancedBufferAttribute(new Float32Array(TL.length).fill(9e3), 1)); tGeo.attributes.aCut.setUsage(THREE.DynamicDrawUsage);
  const towers = IM(tGeo, towM, TL.length); TL.forEach((q, i) => { towers.setMatrixAt(i, M4c(q.x, PROM + q.h / 2, q.z, 0, q.sx, q.h, q.sz)); towers.setColorAt(i, lin(Rt2(i))); }); towers.frustumCulled = false; scene.add(towers);
  function Rt2(i) { return ['#c8ccd4', '#b8bcc4', '#d4cfc6', '#aeb6c2', '#c4c0b8'][i % 5]; }
  const crowns = IM(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0x3a3e46, roughness: 0.6 }), TL.length); TL.forEach((q, i) => crowns.setMatrixAt(i, M4c(q.x, PROM + q.h + 2, q.z, 0, q.sx * 0.6, 4, q.sz * 0.6))); crowns.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(crowns);
  // falling chunks of façade (instanced), spawned along each tower's crumbling front
  const chunkN = 1800, chunks = IM(new THREE.BoxGeometry(1, 1, 1), STD({ map: curtain, roughness: 0.4 }), chunkN, false); chunks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); chunks.frustumCulled = false; scene.add(chunks);
  const chunkL = []; { const Rc = RNG('chunks'); for (let i = 0; i < chunkN; i++) { const ti = i % TL.length, q = TL[ti], u = Rc.r(0.05, 1), face = Rc.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    chunkL.push({ ti, u, x: q.x + (face[0] ? face[0] * q.sx / 2 : Rc.r(-q.sx / 2, q.sx / 2)), z: q.z + (face[1] ? face[1] * q.sz / 2 : Rc.r(-q.sz / 2, q.sz / 2)), vx: face[0] * Rc.r(2, 9) + Rc.n(2), vz: face[1] * Rc.r(2, 9) + Rc.n(2), s: Rc.r(1.2, 4.5), r: [Rc.r(0, 3), Rc.r(0, 3)] }); } }
  // volumetric clouds: clumps of lit billows (warm on top, shaded below); they boil away when the oxygen goes (water -> hydrogen)
  const cloudTex = [0, 1, 2].map((v) => g3Tex((x, w) => { const Rs = RNG('cloudV', v);
    for (let i = 0; i < 160; i++) { const a = Rs.r(0, TAU), d = Math.pow(Rs.f(), 0.6) * w * 0.36, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.62, s = Rs.r(w * 0.05, w * 0.13) * (1.15 - d / (w * 0.5));
      const g2 = x.createRadialGradient(px, py - s * 0.45, 0, px, py, s), top = py < w / 2; g2.addColorStop(0, `rgba(255,255,255,${top ? 0.55 : 0.32})`); g2.addColorStop(0.6, `rgba(${top ? '235,232,236' : '170,168,182'},${Rs.r(0.18, 0.3)})`); g2.addColorStop(1, 'rgba(150,150,170,0)');
      x.fillStyle = g2; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 256, 256));
  const vclouds = []; { const Rv = RNG(OXEN ? 'vcloudEN' : 'vcloud'); for (let c = 0; c < 16; c++) { const az = Rv.r(-60, 60) * DEG + (OXEN ? 0.4 : 0), D = Rv.r(1400, 5200), cx = Math.sin(az) * D, cz = DECK.z - Math.cos(az) * D, cy = Rv.r(380, 1100), size = Rv.r(260, 620), n = 6 + Math.floor(Rv.f() * 6), tg = T_GONE + Rv.r(0.3, 2.6);
    for (let k = 0; k < n; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex[k % 3], transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
      s.position.set(cx + Rv.n(size * 0.55), cy + Rv.n(size * 0.14) + (k === 0 ? size * 0.12 : 0), cz + Rv.n(size * 0.4)); s.userData = { w: size * Rv.r(0.6, 1.05), tg, o: Rv.r(0.55, 0.9), y0: s.position.y }; s.renderOrder = 2; scene.add(s); vclouds.push(s); } } }
  g.clouds.forEach((s) => (s.visible = false));
  // sparks for the return of the oxygen: glowing embers flung out from the ignition point
  const SPN = 1200, spP = new Float32Array(SPN * 3), spC = new Float32Array(SPN * 3), spG = new THREE.BufferGeometry(); spG.setAttribute('position', new THREE.BufferAttribute(spP, 3)); spG.setAttribute('color', new THREE.BufferAttribute(spC, 3));
  const sparks = new THREE.Points(spG, new THREE.PointsMaterial({ size: 1.6, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sparks.frustumCulled = false; sparks.renderOrder = 11; scene.add(sparks);
  const sparkL = []; { const Rs = RNG('sparks'); for (let i = 0; i < SPN; i++) { const a = Rs.r(0, TAU), el = Rs.r(-0.15, 1.2), v = Rs.r(25, 140); sparkL.push({ d: new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)), v, t0: 55 + Rs.r(0, 1.6), life: Rs.r(1.5, 4.5), hot: Rs.f() }); } }
  // EN: a suspension bridge across the bay mouth (towers, deck, main cables, hangers) — falls to dust with the rest
  const bridge = new THREE.Group(); scene.add(bridge); bridge.visible = OXEN; if (OXEN) { const red = STD({ color: 0xb8402a, roughness: 0.6, metalness: 0.3 }), conc = STD({ color: 0xb8b0a4, roughness: 0.9 }), z0 = -560, x0 = -260, x1 = 360, H0 = 2;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 2.2, 14), conc); deck.position.set((x0 + x1) / 2, H0 + 22, z0); deck.castShadow = true; bridge.add(deck);
    const tw = [-80, 180]; tw.forEach((tx) => { for (const dz of [-6, 6]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(4, 92, 4), red); leg.position.set(tx, H0 + 46, z0 + dz); leg.castShadow = true; bridge.add(leg); } for (const hy of [40, 70, 90]) { const bm = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 16), red); bm.position.set(tx, H0 + hy, z0); bridge.add(bm); } const pier = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 30, 16), conc); pier.position.set(tx, H0 + 5 - 20, z0); bridge.add(pier); });
    for (const dz of [-6, 6]) { const pts = []; for (let k = 0; k <= 60; k++) { const x = x0 + (x1 - x0) * k / 60; let y; if (x < tw[0]) y = lerp(H0 + 26, H0 + 92, (x - x0) / (tw[0] - x0)); else if (x > tw[1]) y = lerp(H0 + 92, H0 + 26, (x - tw[1]) / (x1 - tw[1])); else { const u = (x - tw[0]) / (tw[1] - tw[0]); y = H0 + 92 - 66 * 4 * u * (1 - u); } pts.push(new THREE.Vector3(x, y, z0 + dz)); }
      const cab = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.7, 6), red); bridge.add(cab);
      for (let k = 1; k < 60; k++) { const p = pts[k], h = p.y - (H0 + 23); if (h < 1) continue; const hg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 4), red); hg.position.set(p.x, H0 + 23 + h / 2, z0 + dz); bridge.add(hg); } } }
  GO = { bridge, sparks, spG, sparkL, towers, towM, TL, crowns, chunks, chunkL, vclouds, DIS, pits, fball, fcore, paras, tiles, tileL, nx, nz, under, parM, glass, rail, top, leg, foot, chairS, chairB, chairL, jar, wineG, bottle, props, heaters, bar, barTop, bottles, plants, polesO, bulbPts, wire, PMo, tp, glassM };
  return GO;
}

// one terrace person's pose: seated / standing / the waiter; hands to the ears when the oxygen goes; they fall with the deck
function cafePose(q, t) {
  // hands to the ears (pain), then doubling over; some kneel, a few collapse onto their side; they hold it while the world comes apart
  const sit = q.kind === 'sit', ears = ss(q.earT, q.earT + 0.3, t) * (1 - 0.45 * ss(q.earT + 9, q.earT + 12, t)), bend = ss(q.earT + 0.5, q.earT + 1.6, t) * q.bendK;
  const kneel = sit ? 0 : ss(q.earT + q.kneelT, q.earT + q.kneelT + 0.9, t) * q.kneels, lie = ss(q.earT + q.kneelT + 1.6, q.earT + q.kneelT + 3.2, t) * q.lies;
  let x = q.x, z = q.z, yaw = q.yaw, walk = 0, y = DECK.y + 0.15;
  if (q.kind === 'waiter') { const k = Math.min(t, q.earT); x = q.x + Math.sin(k * 0.35) * 5; z = q.z + Math.sin(k * 0.21) * 2; yaw = Math.atan2(Math.cos(k * 0.35) * 5 * 0.35, Math.cos(k * 0.21) * 2 * 0.21); walk = t < q.earT ? 1 : 0; }
  const d = Math.hypot(x - CAMX, z - CAMZ), tf = T_FALL - 0.4 + d * 0.06 + 0.25; if (t > tf) y += -Math.min(DECK.y - 0.6, 0.5 * 0.6 * Math.pow(t - tf, 2));
  return { x, y, z, yaw, sit, ears, bend, kneel, lie, sway: q.ph, walk, p: t * 5.6 + q.ph, fallen: t > tf + 14 };
}

// ---- the frame
function updateOxy() {
  const g = g3(), o = gO(), t = TT, c = camPoseO(t), lev = seaLevel(t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.fov = 64;
  g.sky.position.copy(g.cam.position); g.stars.position.copy(g.cam.position);
  const dust = ss(28, 40, t), fire = ss(55, 55.4, t) * (1 - 0.6 * ss(58, 63, t)), dark = ss(60, 63, t);
  // golden hour sky; the dust turns it tan, the fire orange
  const su = g.skyU; su.top.value.copy(C3(LG('#5a6aa8', '#2f6fd8'), '#8a7a68', dust).lerp(lin('#4a140a'), fire)); su.mid.value.copy(C3(LG('#d898a0', '#6aa4ec'), '#b8a084', dust).lerp(lin('#b03a12'), fire)); su.hor.value.copy(C3(LG('#ffbc80', '#cfe4f6'), '#c8a882', dust).lerp(lin('#e86a20'), fire));
  su.moonDir.value.copy(SUN); su.halo.value = 0.35 * (1 - dust * 0.8) * (1 - fire); su.haloW.value = 0.004; su.fire.value = LG(0.5, 0) * (1 - dust) + 0.35 * fire; su.fireCol.value.copy(lin('#ff9a50')); su.dark.value = 0.92 * dark;
  g.stars.material.opacity = 0; g.moonG.visible = false; g.wave.visible = false; g.beamPivot.visible = false; WSH.value = -1e6;
  g.clouds.forEach((s) => (s.visible = false));
  // volumetric clouds: lit by the low sun; at the event each clump swells, thins and boils away
  o.vclouds.forEach((s) => { const u = s.userData, e = ss(u.tg, u.tg + 2.2, t); s.visible = e < 1; if (!s.visible) return; s.scale.set(u.w * (1 + 0.6 * e), u.w * 0.62 * (1 + 0.3 * e), 1); s.position.y = u.y0 + 60 * e;
    s.material.opacity = u.o * (1 - e); s.material.color.copy(OXEN ? C3('#ffffff', '#e8eef4', e) : C3('#ffe2c8', '#ffd0b0', e)); });
  // the towers: each one's crumbling front drops from the top; façade chunks peel off and fall; the crown goes first
  { const TA = o.towers.geometry.attributes.aCut, R = RNG('tcut'); o.TL.forEach((q, i) => { const a = clamp((t - q.t0) / q.dur); TA.array[i] = a <= 0 ? 9e3 : 1 - a; o.crowns.setMatrixAt(i, a > 0.02 ? _hid : M4c(q.x, PROM + q.h + 2, q.z, 0, q.sx * 0.6, 4, q.sz * 0.6)); });
    TA.needsUpdate = true; o.crowns.instanceMatrix.needsUpdate = true;
    o.chunkL.forEach((k, i) => { const q = o.TL[k.ti], a = clamp((t - q.t0) / q.dur), born = q.t0 + (1 - k.u) * q.dur, age = t - born;
      if (a <= 0 || age < 0 || age > 9) { o.chunks.setMatrixAt(i, _hid); return; } const y0 = PROM + q.h * k.u, y = y0 - 0.5 * 9.8 * 0.5 * age * age;
      if (y < PROM - 2) { o.chunks.setMatrixAt(i, _hid); return; } o.chunks.setMatrixAt(i, M4c(k.x + k.vx * age, y, k.z + k.vz * age, age * k.r[0], k.s, k.s * 0.35, k.s * 0.8, age * k.r[1], age)); });
    o.chunks.instanceMatrix.needsUpdate = true; }
  g.scene.fog.color.copy(C3(LG('#e8b890', '#c8daea'), '#9a8a74', dust).lerp(lin('#c8501a'), fire).lerp(lin('#0a0806'), dark)); g.scene.fog.near = lerp(400, 60, dust); g.scene.fog.far = lerp(14000, 2600, dust) * (1 - 0.5 * fire);
  // light: the low sun from ahead-left; the dust dims it; the fireball floods everything orange
  // the shadow box is fixed over the café and the near harbour (it used to follow the camera, so the shadow map swam and flickered)
  g.key.target.position.set(DECK.x, 0, DECK.z - 50); g.key.target.updateMatrixWorld(); g.key.position.copy(g.key.target.position).addScaledVector(SUN.clone().setY(0.28).normalize(), 500);
  if (!g.key.userData.boxed) { Object.assign(g.key.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 200, far: 900 }); g.key.shadow.camera.updateProjectionMatrix(); g.key.shadow.bias = -0.0004; g.key.shadow.normalBias = 0.4; g.key.userData.boxed = true; }
  g.key.color.copy(C3(LG('#ffc890', '#fff6e8'), '#d8b890', dust).lerp(lin('#ff9050'), fire)); g.key.intensity = lerp(2.4, 1.4, dust) + 1.4 * fire;
  g.fill.intensity = 1.2 * fire; g.fill.color.set('#ff7a30'); g.fill.position.set(c.x, c.y + 40, c.z - 120);
  g.hemi.color.copy(C3(LG('#a8b0d8', '#b8d4f4'), '#a89a84', dust).lerp(lin('#ff9a50'), fire)); g.hemi.groundColor.copy(C3(LG('#6a4a38', '#7a6a58'), '#4a3a2a', dust)); g.hemi.intensity = 0.65 + 0.35 * fire;
  g.r.toneMappingExposure = 1.05 * (1 - 0.85 * dark);
  WIN.uOn.value = 0.38; WIN.uT.value = t; WIN.uPow.value = (t < T_GONE ? 0.8 : 0.8 * (1 - ss(T_GONE, T_GONE + 3, t))) * (1 - dust);
  g.lamps.material.opacity = 0.5 * (1 - ss(T_GONE, T_GONE + 2, t)); g.hillL.material.opacity = 0.5 * (1 - ss(T_GONE, T_GONE + 2, t)); g.pools.visible = t < T_GONE + 2;
  // the sea: golden glitter; it turns to hydrogen — the level drops, it churns, mist rises
  const sea = g.seaMat.uniforms; g.seaMesh.position.y = lev; sea.uT.value = t; sea.uLevel.value = lev; sea.uToeOn.value = 0; sea.uFlood.value = 0;
  sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uFire.value = 0.4 + 1.2 * fire; sea.uFireCol.value.copy(lin('#ff9a50')); sea.uDark.value = 0.8 * dark;
  sea.uMoon.value.copy(SUN); sea.uMoonCol.value.copy(lin(LG('#ffd8a0', '#ffffff'))); sea.uGlit.value = 1.4 * (1 - dust); sea.uGK.value = 260; sea.uChurn.value = ss(17.5, 20, t) * 1.6;
  sea.uShallow.value.copy(lin(LG('#2a6a72', '#1f8a9a'))); sea.uMid.value.copy(lin(LG('#1a4a62', '#1260a0'))); sea.uDeep.value.copy(lin(LG('#123a54', '#0a3e7a'))); sea.uFar.value.copy(lin(LG('#c89878', '#8ab4d8')));
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.seaMesh.visible = lev > -13.0;
  // boats: two under way (engines) until the oxygen goes, the rest moored; all settle on the mud as the sea drains
  g.boats.forEach((b, i) => { const moving = i === 1 || i === 4, run = moving ? Math.min(t, T_GONE + 2 + 3 * (1 - Math.exp(-(t - T_GONE - 2) * 0)) ) : 0, dx = moving ? (i === 1 ? 1 : -1) * boatRun(t) : 0;
    const bx = b.x + dx, bc = gH(bx, b.z), fy = lev - 0.4 * b.D, gnd = ss(-0.05, 0.8, bc - fy);
    const y = Math.max(fy, bc - 0.12 * b.D * gnd) + (1 - gnd) * 0.08 * Math.sin(t * 1.3 + b.ph), roll = b.roll * 0.3 * gnd + (1 - gnd) * 0.04 * Math.sin(t * 1.1 + b.ph);
    const sink = t > 52 ? -(t - 52) * 3 : 0; b.grp.position.set(bx, y + sink - (t > 27 ? 2.5 * ss(27, 37, t) * gnd : 0), b.z); b.grp.rotation.set(0.05 * gnd * b.roll, b.yaw + (moving ? (i === 1 ? -0.1 : 0.1) : 0), roll); b.grp.visible = t < 55; });
  // the town: glass and concrete turn to dust (27-37), far side first; the church and the lighthouse go too
  { const k = (z, x) => ss(0, 1.6, t - crumbleT(x, z));
    for (let i = 0; i < g.nH; i++) { const [hx, hz] = g.hPos[i], a = k(hz, hx); if (a <= 0) { g.houses.setMatrixAt(i, g.hMat[i]); g.roofs.setMatrixAt(i, g.rMat[i]); continue; }
      if (a >= 1) { g.houses.setMatrixAt(i, _hid); g.roofs.setMatrixAt(i, _hid); continue; }
      const m = g.hMat[i].clone(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(pos, q, s); const sy = s.y * (1 - a), py = pos.y - s.y / 2 + sy / 2 - a * 2;
      g.houses.setMatrixAt(i, M4().compose(pos.setY(py), q, s.setY(Math.max(1e-3, sy)))); g.roofs.setMatrixAt(i, a > 0.4 ? _hid : M4().copy(g.rMat[i]).premultiply(Tr(0, -a * s.y, 0))); }
    g.chim.forEach((ch, i) => { const v = k(g.hPos[ch[5]][1], g.hPos[ch[5]][0]) > 0.2; g.chimI.setMatrixAt(i, v ? _hid : g.cMat[i]); g.capI.setMatrixAt(i, v ? _hid : g.kMat[i]); });
    g.ants.forEach((an, i) => { const v = k(g.hPos[an[3]][1], g.hPos[an[3]][0]) > 0.2; for (let q2 = 0; q2 < 3; q2++) g.antI.setMatrixAt(i * 3 + q2, v ? _hid : g.aMat[i * 3 + q2]); });
    g.houses.instanceMatrix.needsUpdate = g.roofs.instanceMatrix.needsUpdate = g.chimI.instanceMatrix.needsUpdate = g.capI.instanceMatrix.needsUpdate = g.antI.instanceMatrix.needsUpdate = true;
    if (OXEN) { const br = k(-560, 60); GO.bridge.scale.y = Math.max(1e-3, 1 - br); GO.bridge.position.y = -12 * br; GO.bridge.visible = br < 1; }
    const lh = k(-335, 14), ch = 1; g.lighthouse.scale.set(1, Math.max(1e-3, 1 - lh), 1); g.lighthouse.visible = lh < 1; g.church.scale.set(0.7, Math.max(1e-3, 0.7 * (1 - ch)), 0.7); g.church.visible = ch < 1; }
  // people in the town: walking until the oxygen goes; then hands to ears; gone with the ground
  const PM = g.PM, PG = g.PG, hide = (i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PM[k].setMatrixAt(i * PG[k][1] + j, _hid); };
  // a person: walk / sit; ears = hands clamped to the ears; bend = doubled over (upper body pivots at the hips);
  // kneel = drops onto the knees; lie = then topples onto the side; sway = a pained rocking
  const pose = (PMx, i, x, y, z, yaw, s, w, walk, p, ears, sit, bend = 0, kneel = 0, lie = 0, sway = 0) => {
    const rock = (bend + kneel) * 0.08 * Math.sin(TT * 3.1 + sway);
    let base = M4().compose(_v.set(x, y - 0.44 * kneel, z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w)), put = (k, j, m) => PMx[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
    if (lie > 0) base = base.multiply(Tr(0, 0.15 * lie, 0)).multiply(Rz(1.45 * lie * (sway > Math.PI ? 1 : -1)));
    const A = 0.42 * walk, Ak = 0.5 * walk, Aa = 0.35 * walk, by = sit ? 0.5 : 0.92, up = base.clone().multiply(Tr(0, by, 0)).multiply(Rx(0.85 * bend + rock)).multiply(Tr(0, -by, 0));
    for (const j of [0, 1]) { const hip = sit ? -1.45 : lerp((j ? 1 : -1) * Math.sin(p) * A, -0.05, kneel), knee = sit ? 1.5 : lerp(0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0))), 1.62, kneel);
      const hipY = sit ? 0.48 : 0.9, th = base.clone().multiply(Tr(j ? 0.095 : -0.095, hipY, 0)).multiply(Rx(hip)), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee));
      put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(sit ? -0.1 : -knee * 0.4 - hip * 0.3)));
      const sh = (j ? -1 : 1) * Math.sin(p) * Aa * (1 - ears) - (sit ? 0.5 : 0) * (1 - ears) - 0.25 * ears, sg = j ? 1 : -1, side = sg * (0.09 + 1.25 * ears);
      const ua = up.clone().multiply(Tr(j ? 0.2 : -0.2, (sit ? 0.98 : 1.4), 0)).multiply(Rz(side)).multiply(Rx(sh)), fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rz(-sg * 2.45 * ears)).multiply(Rx(-0.3 * (1 - ears)));
      put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa); }
    put('hips', 0, base.clone().multiply(Tr(0, by, 0))); put('torso', 0, up.clone().multiply(Tr(0, by + 0.02, 0)).multiply(Rx(0.06 * ears)));
    put('neck', 0, up.clone().multiply(Tr(0, by + 0.53, 0))); const hd = up.clone().multiply(Tr(0, by + 0.68, 0)).multiply(Rx(0.18 * ears + 0.25 * bend)).multiply(M4().makeRotationY(0.25 * Math.sin(TT * 2.3 + sway) * ears));
    put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, hd.clone().multiply(Tr(0, -0.08, -0.07)));
  };
  g.ppl.forEach((q, i) => { if (q.role !== 'prom' && q.role !== 'quay') return hide(i); const tw = Math.min(t, T_GONE + 0.3); let x = q.x, z = q.z, yaw = q.yaw;
    if (q.role === 'prom') { x = mod(q.x + q.v * tw + 36, 72) - 36; z = Math.min(q.z, -72.5); yaw = q.v > 0 ? Math.PI / 2 : -Math.PI / 2; } else { z = q.z + q.v * tw; yaw = q.v > 0 ? 0 : Math.PI; }
    if (t > crumbleT(x, z) + 0.6) return hide(i); const ears = ss(T_GONE + 0.2, T_GONE + 0.7, t);
    const bend = ss(T_GONE + 0.8, T_GONE + 2, t) * (0.5 + 0.5 * Math.sin(q.ph)), kneel = ss(T_GONE + 1.5, T_GONE + 2.6, t) * (Math.sin(q.ph * 3) > 0 ? 1 : 0);
    pose(PM, i, x, q.quay ? PROM : gH(x, z), z, yaw, q.s, q.w, t < T_GONE ? 1 : 0, t * 5.6 + q.ph, ears, false, bend, kneel, 0, q.ph); });
  for (const k in PM) PM[k].instanceMatrix.needsUpdate = true;
  const PMo = o.PMo; o.tp.forEach((q, i) => { const st = cafePose(q, t); if (st.fallen) { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMo[k].setMatrixAt(i * PG[k][1] + j, _hid); return; }
    pose(PMo, i, st.x, st.y, st.z, st.yaw, q.s, q.w, st.walk, st.p, st.ears, st.sit, st.bend, st.kneel, st.lie, st.sway); });
  for (const k in PMo) PMo[k].instanceMatrix.needsUpdate = true; o.bulbPts.visible = false;
  // the deck breaks into tiles and falls (from where you sit, outwards); the café falls with it
  // the floor first ripples like a wave (T_FALL-3.2 .. T_FALL), holes eat into it, then it breaks into tiles and falls
  const rip = (x, z) => { const e = ss(T_FALL - 3.2, T_FALL - 2.2, t) * (1 - ss(T_FALL + 0.3, T_FALL + 1.2, t)); if (e <= 0) return 0; const d = Math.hypot(x - CAMX, z - CAMZ); return e * 0.32 * Math.sin(d * 0.9 - t * 7.5) * (0.6 + 0.4 * Math.sin(x * 0.7 + z * 0.4)); };
  o.DIS.uDis.value = t < T_FALL - 1.6 ? -1 : lerp(0.05, 0.62, ss(T_FALL - 1.6, T_FALL + 1.0, t));
  o.tileL.forEach((q, i) => { const a = t - q.t0; o.tiles.setMatrixAt(i, a <= 0 ? M4c(q.x, DECK.y + rip(q.x, q.z), q.z, 0, 1, 1, 1, rip(q.x + 0.6, q.z) * 0.15, rip(q.x, q.z + 0.6) * 0.15) : M4c(q.x + q.rx * a * 0.4, DECK.y - Math.min(DECK.y - 0.3, 0.5 * 2.6 * a * a * q.sp), q.z + q.rz * a * 0.4, 0, 1, 1, 1, q.rx * a * 1.6, q.rz * a * 1.6)); }); o.tiles.instanceMatrix.needsUpdate = true;
  const dropAt = (x, z) => { const d = Math.hypot(x - CAMX, z - CAMZ), a = t - (T_FALL - 0.4 + d * 0.06 + 0.2); return (a > 0 ? -Math.min(DECK.y - 0.6, 0.5 * 0.6 * a * a) : 0) + rip(x, z); };
  o.under.position.y = DECK.y / 2 - 1.15 + Math.min(0, dropAt(DECK.x, DECK.z) * 0.6) - 30 * ss(T_FALL, 45, t); o.under.scale.y = Math.max(1e-3, 1 - ss(T_FALL - 2.5, T_FALL + 0.3, t)); o.under.visible = t < T_FALL + 0.4;
  const setIM = (m, list, fn) => { list.forEach((p, i) => m.setMatrixAt(i, fn(p, i))); m.instanceMatrix.needsUpdate = true; };
  setIM(o.top, o.props, ([x, y, z]) => M4c(x, y + 0.76 + dropAt(x, z), z)); setIM(o.leg, o.props, ([x, y, z]) => M4c(x, y + 0.38 + dropAt(x, z), z)); setIM(o.foot, o.props, ([x, y, z]) => M4c(x, y + 0.02 + dropAt(x, z), z));
  setIM(o.jar, o.props, ([x, y, z]) => M4c(x + 0.1, y + 0.83 + dropAt(x, z), z)); setIM(o.bottle, o.props, ([x, y, z]) => M4c(x - 0.15, y + 0.93 + dropAt(x, z), z + 0.1));
  o.parM.forEach((m) => { m.position.y = DECK.y + 0.42 + dropAt(m.position.x, m.position.z); }); o.rail.forEach((m) => { m.position.y = DECK.y + 1.62 + dropAt(m.position.x, m.position.z); });
  o.glass.forEach((m) => { m.visible = t < 29.5; }); o.glassM.opacity = 0.28 * (1 - ss(28.5, 29.5, t));
  o.heaters.forEach((h) => { h.grp.position.y = DECK.y + 0.15 + dropAt(h.x, h.z); h.glow.material.color.copy(C3('#ff7a30', '#2a2420', ss(11.0, 11.6, t))); });
  o.bar.position.y = DECK.y + 0.7 + dropAt(3.2, -3.4 + DZ); o.barTop.position.y = DECK.y + 1.28 + dropAt(3.2, -3.4 + DZ); o.bottles.visible = t < T_FALL + 1;
  o.polesO.forEach((m) => { m.position.y = DECK.y + 1.85 + dropAt(m.position.x, m.position.z); }); o.bulbPts.visible = o.wire.visible = t < T_FALL + 0.4; o.bulbPts.material.opacity = 1 - ss(T_GONE, T_GONE + 1.2, t) * 0.75;
  o.paras.forEach((m) => { if (m.userData.y0 === undefined) m.userData.y0 = m.position.y; m.position.y = m.userData.y0 + dropAt(m.position.x, m.position.z); });
  o.plants.forEach((m) => { if (m.userData.y0 === undefined) m.userData.y0 = m.position.y; m.position.y = m.userData.y0 + dropAt(m.position.x, m.position.z); });

  // ---- sprites: candle and heater flames (die at 11), smoke wisps, the sea's hydrogen mist, the dust of the town, the fireball
  let si = 0, fi = 0, mi = 0, bi = 0; const SP = g.sprays, FL = g.flames, SM = g.smokes, BL = g.billows;
  const put = (pool, idx, x, y, z, sc, op, col, rot = 0) => { if (idx >= pool.length || op <= 0.004) return idx; const s = pool[idx]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col); s.material.rotation = rot; return idx + 1; };
  const out = ss(11.0, 11.5, t);
  o.props.forEach(([x, y, z], i) => { const fl = 1 + 0.15 * Math.sin(t * 13 + i * 2.1) + 0.08 * Math.sin(t * 31 + i); if (out < 1) fi = put(FL, fi, x + 0.1, y + 0.9 + dropAt(x, z), z, 0.16 * fl, (1 - out), '#ffb060'); fi = put(FL, fi, x + 0.1, y + 0.86 + dropAt(x, z), z, 0.5, 0.25 * (1 - out), '#ff9a40');
    if (out > 0 && t < 16) { const R = RNG('wisp', i); for (let k = 0; k < 4; k++) { const a = mod(t - 11 - k * 0.7, 4); if (t - 11 < k * 0.7) continue; mi = put(SM, mi, x + 0.1 + Math.sin(a * 2 + i) * 0.04 * a, y + 0.9 + a * 0.35, z, 0.05 + a * 0.08, 0.35 * (1 - a / 4), '#d8d0c8', a); } } });
  // the fire pits: a bed of flames, then out (11 s) into a column of smoke
  o.pits.forEach((pt, i) => { const dy = dropAt(pt.x, pt.z); pt.grp.position.y = DECK.y + 0.15 + dy; pt.light.intensity = 2.2 * (1 - out) * (0.85 + 0.15 * Math.sin(t * 9 + i)); const R = RNG('pitfl', i);
    if (out < 1) for (let k = 0; k < 18; k++) { const u = R.r(-0.6, 0.6), w = R.r(-0.2, 0.2), age = mod(t * R.r(1.6, 2.6) + R.f(), 1), h = 0.1 + age * R.r(0.35, 0.75);
      fi = put(FL, fi, pt.x + u + Math.sin(t * 7 + k) * 0.03, DECK.y + 0.7 + dy + h, pt.z + w, R.r(0.22, 0.42) * (1 - age * 0.6), (1 - out) * 0.55 * Math.sin(age * Math.PI), age < 0.4 ? '#ffd080' : '#ff7a30'); }
    if (out > 0 && t < 22) for (let k = 0; k < 14; k++) { const a = t - 11 - k * 0.45; if (a < 0) continue; const aa = mod(a, 6); mi = put(SM, mi, pt.x + Math.sin(aa * 1.3 + k) * 0.12 * aa, DECK.y + 0.8 + dy + aa * 0.7, pt.z + aa * 0.15, 0.25 + aa * 0.35, 0.5 * (1 - aa / 6) * (1 - ss(18, 22, t)), '#cfc8c0', aa); } });
  // boats under way: a white wake behind each until the engines die (13.5 s), then they drift
  g.boats.forEach((b, i) => { if (i !== 1 && i !== 4) return; const sp = boatSpeed(t); if (sp < 0.2 || lev < -2) return; const dir = i === 1 ? 1 : -1, R = RNG('wake', i);
    for (let k = 0; k < 26; k++) { const back = k * 1.6, spread = 0.4 + back * 0.18; for (const sd of [-1, 1]) si = put(SP, si, b.grp.position.x - dir * (b.L * 0.45 + back), lev + 0.3, b.z + sd * spread + R.n(0.2), 2.2 + back * 0.25, 0.5 * (sp / 3.2) * (1 - k / 26), '#ffffff', R.r(0, 6)); } });
  o.heaters.forEach((h, i) => { if (out < 1) for (let k = 0; k < 5; k++) fi = put(FL, fi, h.x + Math.sin(k * 1.3) * 0.1, DECK.y + 2.05 + k * 0.06, h.z, 0.35 * (1 + 0.2 * Math.sin(t * 17 + k)), 0.45 * (1 - out), '#ff8a40'); });
  // the hydrogen mist: billows boiling off the harbour (17.5-34), drifting up
  { const R = RNG('mist'), on = ss(17.5, 19.5, t) * (1 - ss(36, 44, t)); if (on > 0) for (let k = 0; k < 220; k++) { const x = R.r(-160, 180), z = R.r(-90, -520), age = mod(t * R.r(0.08, 0.16) + R.f(), 1), y = lev + age * R.r(10, 40), sz = R.r(14, 40) * (0.5 + age);
    bi = put(BL, bi, x, y, z, sz, on * 0.55 * Math.sin(age * Math.PI), '#eef2f4', R.r(0, 6)); } }
  // dust: each house blows out a cloud as it goes, then a brown haze everywhere
  { for (let i = 0; i < g.nH; i += 2) { const [hx, hz, hy] = g.hPos[i], a = t - crumbleT(hx, hz); if (a < 0 || a > 6) continue; const R = RNG('dust', i);
      for (let k = 0; k < 3; k++) bi = put(BL, bi, hx + R.n(6), hy * (1 - Math.min(1, a / 1.6)) + a * R.r(1, 4), hz + R.n(6), R.r(10, 20) * (0.6 + a * 0.4), 0.85 * Math.min(1, a * 2) * (1 - a / 6), R.pick(['#b8a890', '#a8987e', '#c8b8a0']), R.r(0, 6)); } }
  o.TL.forEach((q, i) => { const a = (t - q.t0) / q.dur; if (a <= 0 || a > 1.3) return; const R = RNG('tdust', i), hf = PROM + q.h * Math.max(0, 1 - a);
    for (let k = 0; k < 7; k++) bi = put(BL, bi, q.x + R.n(q.sx * 0.6), hf + R.r(-10, 6), q.z + R.n(q.sz * 0.6), R.r(18, 34) * (0.7 + a), 0.7 * Math.min(1, a * 4) * (1 - ss(1, 1.3, a)), R.pick(['#c8b8a0', '#b8a890', '#d8ccb8']), R.r(0, 6));
    for (let k = 0; k < 4; k++) bi = put(BL, bi, q.x + R.n(q.sx), PROM + R.r(2, 18), q.z + R.n(q.sz), R.r(26, 48), 0.6 * ss(0.3, 0.8, a), '#b0a088', R.r(0, 6)); });
  if (t > T_FALL - 0.5) { const R = RNG('falldust'), k0 = ss(T_FALL - 0.5, T_FALL + 3, t) * (1 - fire); for (let k = 0; k < 120; k++) { const a = R.r(0, TAU), r = R.r(6, 60), age = mod(t * 0.2 + R.f(), 1);
    bi = put(BL, bi, c.x + Math.cos(a) * r, c.y + R.r(-40, 25) - age * 10, c.z + Math.sin(a) * r, R.r(8, 26), k0 * 0.7 * Math.sin(age * Math.PI), R.pick(['#9a8a74', '#8a7a66', '#aa9a82']), R.r(0, 6)); } }
  // the oxygen returns into a world full of hydrogen: a white-hot point over the harbour, sparks, then a wall of churning orange smoke
  // that rolls out towards you (it is a front of billows, not a sphere) and reaches the lens at T_HIT2
  o.fball.visible = false; o.fcore.visible = t >= 55 && t < 57; { const C0 = BLAST_C;
    if (o.fcore.visible) { const k = 1 - ss(55.05, 56.8, t); o.fcore.position.copy(C0); o.fcore.scale.setScalar(3 + 9 * ss(55, 55.3, t)); o.fcore.material.opacity = 0.9 * k * (1 - ss(55.4, 56.2, t)); o.fcore.material.color.set('#fff2d0'); }
    const P = o.spG.attributes.position.array, Cc = o.spG.attributes.color.array; o.sparks.visible = t >= 55 && t < 61;
    if (o.sparks.visible) { o.sparkL.forEach((s, i) => { const a = t - s.t0; if (a < 0 || a > s.life) { P[i * 3 + 1] = -1e5; return; } const dd = s.v * (1 - Math.exp(-a * 1.3)) / 1.3;
      P[i * 3] = C0.x + s.d.x * dd; P[i * 3 + 1] = C0.y + s.d.y * dd - 2.5 * a * a; P[i * 3 + 2] = C0.z + s.d.z * dd; const f = (1 - a / s.life) * 1.4;
      Cc[i * 3] = f; Cc[i * 3 + 1] = f * lerp(0.45, 0.9, s.hot); Cc[i * 3 + 2] = f * lerp(0.1, 0.5, s.hot); }); o.spG.attributes.position.needsUpdate = true; o.spG.attributes.color.needsUpdate = true; }
    if (t >= 55) { const Rr = blastR(t), R = RNG('front'), age = t - 55;
      for (let k = 0; k < 430; k++) { const u = R.f(), th = R.r(0, TAU), el = Math.asin(R.r(-0.12, 1)), rr = Rr * (u < 0.7 ? R.r(0.82, 1.03) : R.r(0.3, 0.8)), boil = Math.sin(age * R.r(1.5, 3) + k) * 0.04 * Rr;
        const x = C0.x + Math.cos(th) * Math.cos(el) * (rr + boil), y = C0.y + Math.sin(el) * (rr + boil) * 0.75, z = C0.z + Math.sin(th) * Math.cos(el) * (rr + boil);
        const outer = rr > Rr * 0.8, col = outer ? R.pick(['#ffb050', '#ff9a3a', '#ffc070', '#f08030']) : R.pick(['#c8501a', '#a8401a', '#e06a24']), sz = Rr * R.r(0.16, 0.34) + 6;
        bi = put(BL, bi, x, Math.max(y, 1), z, sz, (outer ? 0.85 : 0.65) * ss(55, 55.6, t), col, R.r(0, 6) + age * R.n(0.2)); }
      for (let k = 0; k < 160; k++) { const th = R.r(0, TAU), el = Math.asin(R.r(0, 1)), rr = Rr * R.r(0.2, 0.85), x = C0.x + Math.cos(th) * Math.cos(el) * rr, y = C0.y + Math.sin(el) * rr * 0.75, z = C0.z + Math.sin(th) * Math.cos(el) * rr;
        fi = put(FL, fi, x, y, z, Rr * R.r(0.12, 0.3) + 4, R.r(0.12, 0.3) * (1 - 0.4 * ss(58, 61, t)), R.pick(['#ffd890', '#ffb050', '#ff8a30']), R.r(0, 6)); }
      if (age > 2) for (let k = 0; k < 70; k++) { const th = R.r(0, TAU), rr = Rr * R.r(0.3, 0.9); mi = put(SM, mi, C0.x + Math.cos(th) * rr, C0.y + Rr * R.r(0.6, 1.0) + age * 4, C0.z + Math.sin(th) * rr, Rr * R.r(0.2, 0.4), 0.55 * ss(57, 59, t), '#3a2418', R.r(0, 6)); } } }
  for (; si < SP.length; si++) SP[si].visible = false; for (; fi < FL.length; fi++) FL[fi].visible = false; for (; mi < SM.length; mi++) SM[mi].visible = false; for (; bi < BL.length; bi++) BL[bi].visible = false;
  g.rubble.visible = false;
  // the fall: planks, chairs, pots and chunks of the building tumble down around you (a little slower than you, so they drift up past the lens)
  g.debris.visible = t > T_FALL - 0.3 && t < 55; if (g.debris.visible) { const R = RNG('falldeb'), D = g.debris, a = Math.max(0, t - T_FALL);
    for (let i = 0; i < 90; i++) { const ang = R.r(0, TAU), rr = R.r(1.5, 14), oy = R.r(-6, 9), k = R.r(0.55, 0.95), sz = R.r(0.25, 1.4);
      const y = DECK.y + 1.5 + oy - Math.min(DECK.y - 0.5, 0.5 * 0.5 * k * a * a), x = CAMX + Math.cos(ang) * rr + R.n(0.4) * a, z = CAMZ + Math.sin(ang) * rr;
      D.setMatrixAt(i, M4c(x, y, z, a * R.r(0.5, 2.5), sz * R.r(0.6, 2.2), sz * R.r(0.08, 0.4), sz * R.r(0.4, 1.2), a * R.r(0.4, 2), a * R.r(0.3, 1.8))); }
    D.instanceMatrix.needsUpdate = true; }
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: the ear-pop (a pressure punch: a zoom bump and a dull ring), the HUD countdown, the title, captions, the end card
function earPop(t) { const k = ss(5.0, 5.08, t) * (1 - ss(5.25, 6.4, t)); if (k <= 0) return; const g = g3(); ctx.save(); screen();
  for (let i = 1; i <= 4; i++) { const s = 1 + k * 0.012 * i; ctx.globalAlpha = 0.2 * k; ctx.drawImage(g.cv, CX - CX * s, H / 2 - H / 2 * s, W * s, H * s); }
  const v = ctx.createRadialGradient(CX, H / 2, H * 0.25, CX, H / 2, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,8,6,${0.55 * k})`); ctx.globalAlpha = 1; ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// motion blur: the frame smeared along the camera's own angular velocity (yaw/pitch over 1/48 s), so turns and the fall streak
function motionBlur(t) {
  const a = camPoseO(t), b = camPoseO(t - 1 / 48), f = (H / 2) / Math.tan(32 * DEG);
  let dx = -Math.atan2(Math.sin(a.yaw - b.yaw), Math.cos(a.yaw - b.yaw)) * f, dy = (a.pitch - b.pitch) * f; const L = Math.hypot(dx, dy); if (L < 3) return;
  const k = Math.min(1, 90 / L); dx *= k; dy *= k; const g = g3(); ctx.save(); screen();
  for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.16 * (1 - i / 8); ctx.drawImage(g.cv, -dx * i / 6, -dy * i / 6, W, H); } ctx.restore();
}
// bloom: a dimmed, high-contrast, blurred copy added on top (bright sky, sun, flames and the blast glow spill light)
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.4) blur(9px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
// the sun's lens flare: a glow, a starburst and a line of ghosts through the centre; it dies when the dust thickens
function lensFlare(t) {
  const g = g3(), s = g.cam.position.clone().addScaledVector(SUN, 5000).project(g.cam); if (s.z > 1) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, on = (1 - ss(26, 34, t)) * (1 - ss(54.5, 55, t)) * clamp(1.4 - Math.hypot(s.x, s.y) * 0.8); if (on <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  pvGlow(x, y, 520, OXEN ? 'rgba(255,255,250,0.55)' : 'rgba(255,214,160,0.6)', on); pvGlow(x, y, 120, 'rgba(255,255,255,0.95)', on);
  ctx.globalAlpha = 0.35 * on; ctx.strokeStyle = '#fff6e8'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI + 0.2, L = 260 + 120 * Math.sin(i * 2.1); ctx.lineWidth = i % 3 ? 1.5 : 3; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke(); }
  const vx = CX - x, vy = H / 2 - y; [[0.35, 46, '255,200,140', 0.2], [0.6, 90, '170,210,255', 0.12], [0.85, 30, '255,170,120', 0.25], [1.25, 130, '200,170,255', 0.08], [1.6, 60, '255,220,160', 0.14], [1.9, 18, '255,255,255', 0.3]].forEach(([f, r, col, a]) => {
    const gx = x + vx * f, gy = y + vy * f, gr = ctx.createRadialGradient(gx, gy, r * 0.5, gx, gy, r); gr.addColorStop(0, `rgba(${col},${a * 0.4 * on})`); gr.addColorStop(0.85, `rgba(${col},${a * on})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); });
  ctx.restore();
}
// the blast reaching the lens: the frame drowns in churning orange smoke and the camera's glass cracks
function blastHit(t) {
  if (t < T_HIT2 - 0.6 || t >= 63) return; const k = ss(T_HIT2 - 0.6, T_HIT2 + 0.2, t), R = RNG('blastov', Math.floor(t * 12));
  ctx.save(); screen(); pvTint('#d8661c', 0.55 * k);
  for (let i = 0; i < 46; i++) { const x = R.r(-100, W + 100), y = R.r(-100, H + 100), r = R.r(140, 420); const g2 = ctx.createRadialGradient(x, y - r * 0.2, 0, x, y, r); g2.addColorStop(0, `rgba(255,${R.r(150, 210) | 0},90,${0.4 * k})`); g2.addColorStop(0.6, `rgba(200,80,25,${0.3 * k})`); g2.addColorStop(1, 'rgba(120,40,10,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  ctx.restore();
  if (t >= T_HIT2) crackGlass(t);
}
// procedural cracked glass: radial cracks from an impact point, concentric rings between them, a crushed core, small chips
function crackGlass(t) {
  const R = RNG('crack'), cx = CX + 140, cy = H * 0.44, grow = ss(T_HIT2, T_HIT2 + 0.12, t), rays = [];
  ctx.save(); screen(); ctx.lineCap = 'round';
  for (let i = 0; i < 17; i++) { const a0 = i / 17 * TAU + R.n(0.15), L = R.r(500, 1400) * grow, pts = [[cx, cy]]; let a = a0, px = cx, py = cy;
    for (let s = 0; s < 14; s++) { a += R.n(0.12); const st = L / 14; px += Math.cos(a) * st; py += Math.sin(a) * st; pts.push([px, py]); } rays.push(pts); }
  const line = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
  rays.forEach((p) => { line(p, 5, 'rgba(0,0,0,0.25)'); line(p, 2, 'rgba(255,255,255,0.85)'); });
  for (let ring = 1; ring <= 5; ring++) for (let i = 0; i < rays.length; i++) { const A = rays[i], B = rays[(i + 1) % rays.length], idx = Math.min(A.length - 1, ring * 2 + (R.f() < 0.5 ? 1 : 0)); if (R.f() < 0.25) continue;
    const p = [A[idx], [(A[idx][0] + B[idx][0]) / 2 + R.n(12), (A[idx][1] + B[idx][1]) / 2 + R.n(12)], B[Math.min(B.length - 1, idx + (R.f() < 0.5 ? 0 : 1))]]; line(p, 3, 'rgba(0,0,0,0.2)'); line(p, 1.3, 'rgba(255,255,255,0.7)'); }
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70); g2.addColorStop(0, 'rgba(255,255,255,0.75)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.3)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(cx - 70, cy - 70, 140, 140);
  for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), d = R.r(10, 110), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; ctx.fillStyle = `rgba(255,255,255,${R.r(0.3, 0.8)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R.n(8), y + R.n(8)); ctx.lineTo(x + R.n(8), y + R.n(8)); ctx.fill(); }
  ctx.restore();
}
const secLeft = (t) => clamp(5 - (t - T_GONE) / 10, 0, 5);
function hud() { const t = TT; if (t < 4.4 || t >= 55.3) return; const s = t < T_GONE ? 5 : secLeft(t);
  pvHud(LG('Oxígeno de vuelta en', 'Oxygen back in'), `0:0${Math.floor(s)}.${String(Math.floor((s % 1) * 1000)).padStart(3, '0')}`, LG('cámara lenta ×10', 'slowed down 10×'), ev(4.4, 0.5) * (1 - ev(55.0, 0.3))); }
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(108, Math.floor(100 * 800 / wmax)), lh = size * 1.14, y0 = 470;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 560, 130 + lines.length * 62, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  // the fact (higher), then 2 s later the teaser in the user's words, and the signature at the bottom
  const a = ev(64.3, 0.7), b = ev(64.9, 0.8), c2 = ev(65.5, 0.8), d = ev(67.5, 0.6), e = ev(68.2, 0.6);
  const f = () => {
    pvGlow(CX, 760, 520 + 90 * Math.max(0, TT - 64), 'rgba(160,110,60,0.3)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));
    pvFeather(CX, 760, 520, 280, 0.8 * a);
    pvText(LG('El oxígeno es', 'Almost half'), CX, 630, 56, { italic: true, align: 'center', alpha: a });
    pvText(LG('el 46 %', '46 %'), CX, 770, 120, { align: 'center', alpha: b });
    pvText(LG('de la roca bajo tus pies.', 'of the rock you stand on is oxygen.'), CX, 890, LG(54, 48), { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#e0c8a0'; ctx.fillRect(CX - 60, 935, 120, 3); ctx.restore();
    pvFeather(CX, 1090, 470, 110, 0.7 * d);
    pvText(LG('tranquilo, esto no puede pasar...', 'relax, this could never happen...'), CX, 1080, 50, { italic: true, align: 'center', alpha: d });
    pvText(LG('o si?', 'could it?'), CX, 1150, 58, { italic: true, align: 'center', alpha: d });
    pvText(LG('ALTERBASE.ESP', 'ALTERBASE'), CX, 1450, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function sceneOxy() {
  const t = TT;
  if (t < 63.05) { updateOxy(); motionBlur(t); lensFlare(t); bloom(0.32 + 0.35 * ss(55, 55.5, t)); }
  earPop(t);
  if (t >= 55 && t < 55.5) { const k = 1 - seg(t, 55, 55.5); pvTint('#fff6e8', 0.55 * k); }
  blastHit(t);
  if (t >= 62 && t < 64) pvTint('#050403', ss(62, 63, t));
  if (t >= 63) fillAll('#050403');
  if (t >= 64) endCard();
  hud();
  bigTitle(LG(['¿Qué pasaría si el', 'oxígeno desapareciera', 'durante 5 segundos?'], ['What if every', 'oxygen atom vanished', 'for 5 seconds?']), 0.3, 4.8);
  pvCaption(LG('A todos les estallan los oídos.', 'Every eardrum pops at once.'), 5.6, 10.8);
  pvCaption(LG('Todo fuego se apaga.', 'Every flame goes out.'), 11.2, 13.9);
  pvCaption(LG('Cada motor se para.', 'Engines choke and stall.'), 14.1, 16.8);
  pvCaption(LG('El mar es 89 % oxígeno.', 'Water is 89 % oxygen by mass.'), 17.4, 21.8);
  pvCaption(LG('Se vuelve hidrógeno.', 'The bay boils off as hydrogen.'), 22.0, 26.8);
  pvCaption(LG('El cristal y el hormigón, también.', 'Glass and concrete fall to dust.'), 27.4, 36.8);
  pvCaption(LG('Y el suelo bajo tus pies.', 'So does the floor.'), 37.4, 44.6);
  pvCaption(LG('Por ahora, nada puede arder.', 'Nothing can burn. Not yet.'), 45.4, 52.6);
  pvCaption(LG('Entonces vuelve el oxígeno.', 'Then the oxygen comes back.'), 53.0, 54.9);
}

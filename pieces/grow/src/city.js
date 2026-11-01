// =====================================================================
//  CITY — shots 0–20 s: a European avenue (classic facades, plane trees, lamps, cars, a crowd) inside a city of
//  instanced blocks that runs to the horizon. One world in metres; the girl walks down the avenue (−z) at
//  0.75·HGT m/s, buildings near her path sink into rubble and dust from 11 s on; Eiffel Tower and Burj Khalifa ahead.
// =====================================================================
const CT_A = 0.75 * 1.6 * 2 / Math.LN2;                       // her z(t) = −CT_A·(2^(t/2) − 1)
const ctZ = (t) => -CT_A * (Math.pow(2, t / 2) - 1);
const CT_SUN = dirV(150 * DEG, 36 * DEG);
const CT_EIF = [300, -2000], CT_BURJ = [-900, -6000];
const ctBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
function ctIM(par, geo, mat, Ms, cols, shadow = true) { const m = IM(geo, mat, Math.max(1, Ms.length), shadow); Ms.forEach((M, i) => m.setMatrixAt(i, M)); if (cols) cols.forEach((c, i) => m.setColorAt(i, c)); m.count = Ms.length; m.frustumCulled = false; par.add(m); return m; }
// time a unit at (x, z) is wrecked: she has reached its z and her swath (0.3·H + 15 m) covers its x; never before 11 s
function ctHit(x, z, R) { const tz = 2 * Math.log2(Math.max(1, (CT_A - z) / (CT_A + 0.8))), ax = Math.abs(x), tx = ax > 15 ? 2 * Math.log2((ax - 15) / 0.56) : 0; return Math.max(tz + 0.15, tx, 11.1) + R.r(0, 0.6); }

function ctCar() { const sh = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
  const body = new THREE.ExtrudeGeometry(sh([[-2.15, 0.3], [2.15, 0.3], [2.24, 0.55], [2.14, 0.84], [0.95, 0.97], [-1.9, 1.0], [-2.22, 0.9], [-2.24, 0.45]]), { depth: 1.64, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.08, bevelSegments: 2 }).translate(0, 0, -0.82);
  const cab = new THREE.ExtrudeGeometry(sh([[1.0, 0.95], [0.45, 1.36], [-1.0, 1.4], [-1.92, 0.98]]), { depth: 1.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }).translate(0, 0, -0.75);
  const roof = new THREE.BoxGeometry(1.25, 0.07, 1.5).translate(-0.3, 1.42, 0);
  const wl = [-1.38, 1.38].flatMap((wx) => [-0.84, 0.84].map((wz) => new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14).rotateX(Math.PI / 2).translate(wx, 0.34, wz)));
  const lt = [[2.2, 0.66, 0.6], [2.2, 0.66, -0.6]].map(([x, y, z]) => new THREE.BoxGeometry(0.1, 0.12, 0.3).translate(x, y, z)), tl = [[-2.26, 0.74, 0.62], [-2.26, 0.74, -0.62]].map(([x, y, z]) => new THREE.BoxGeometry(0.08, 0.14, 0.34).translate(x, y, z));
  const mg = (L) => { const g = pierlessMerge(L); return g; };
  return { body, cab, roof, wheels: mg(wl), heads: mg(lt), tails: mg(tl) }; }
function pierlessMerge(list) { let n = 0; const H = list.map((g) => { const h = g.index ? g.toNonIndexed() : g.clone(); n += h.attributes.position.count; return h; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  H.forEach((h) => { const c = h.attributes.position.count; P.set(h.attributes.position.array, o * 3); N.set(h.attributes.normal.array, o * 3); if (h.attributes.uv) U.set(h.attributes.uv.array, o * 2); o += c; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.BufferAttribute(U, 2)); return g; }

function buildCity() { const st = dayStage({ sun: CT_SUN, top: '#2f6cc4', hor: '#cfe0f0', clouds: 0.35, fogC: '#c8d8e8', far: 60000, box: 60 }), sc = st.scene, R = RNG('ctcity'), S = { st, units: [] }; st.skyU.uCl.value = 0.15;
  // ---- ground: the street grid (70 m tiles: asphalt, kerb, pavement, courtyard) and the avenue strip on top
  const gt = wrap(g3Tex((x, w) => { x.fillStyle = '#56575b'; x.fillRect(0, 0, w, w); const k = w / 70; x.fillStyle = '#a9a398'; x.fillRect(7 * k, 7 * k, 56 * k, 56 * k); x.fillStyle = '#7e786c'; x.fillRect(10 * k, 10 * k, 50 * k, 50 * k);
    x.fillStyle = 'rgba(240,236,220,0.7)'; for (let i = 0; i < 70; i += 6) { x.fillRect(i * k, 3.4 * k, 3 * k, 0.4 * k); x.fillRect(3.4 * k, i * k, 0.4 * k, 3 * k); } speck(x, w, w, 3000, ['rgba(0,0,0,0.1)', 'rgba(255,255,255,0.08)'], RNG('ctg'), 1, 2); }, 256, 256), 570, 570);
  sc.add(mesh(new THREE.PlaneGeometry(39900, 39900).rotateX(-Math.PI / 2), STDm({ map: gt, roughness: 0.95 }), 0, 0, -7000, { cast: false }));
  const ZA = 600, ZB = -9000, LA = ZA - ZB, ZC = (ZA + ZB) / 2;
  const asph = wrap(g3Tex((x, w, h) => { x.fillStyle = '#4c4d51'; x.fillRect(0, 0, w, h); speck(x, w, h, 2500, ['#424347', '#5a5b5f', '#38393c'], RNG('ctas'), 1, 2); x.fillStyle = '#ece8dc'; x.fillRect(w / 2 - 1, 0, 2, h / 2); x.fillRect(0, 0, 2, h); x.fillRect(w - 2, 0, 2, h); }, 128, 128), 1, LA / 12);
  [-1, 1].forEach((s) => sc.add(mesh(new THREE.PlaneGeometry(10, LA).rotateX(-Math.PI / 2), STDm({ map: asph, roughness: 0.85 }), s * 12, 0.02, ZC, { cast: false })));
  const pav = (key, base, n) => wrap(g3Tex((x, w) => { const Rr = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const l = Rr.r(-12, 12); x.fillStyle = `rgba(${l > 0 ? 255 : 0},${l > 0 ? 250 : 0},${l > 0 ? 240 : 0},${Math.abs(l) / 120})`; x.fillRect(i * w / n + 1, j * w / n + 1, w / n - 2, w / n - 2); } speck(x, w, w, 2000, ['rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'], Rr, 1, 2); }, 256, 256), 1, 1);
  const pm = pav('ctpv', '#b8ad9c', 8), sm = pav('ctsw', '#a8a49c', 6); pm.repeat.set(3.5, LA / 4); sm.repeat.set(1.75, LA / 4);
  sc.add(mesh(new THREE.BoxGeometry(14, 0.15, LA).translate(0, 0.075, 0), STDm({ map: pm, roughness: 0.9 }), 0, 0, ZC, { cast: false }));
  [-1, 1].forEach((s) => sc.add(mesh(new THREE.BoxGeometry(7, 0.15, LA).translate(0, 0.075, 0), STDm({ map: sm, roughness: 0.9 }), s * 20.5, 0, ZC, { cast: false })));
  const kerb = STDm({ color: '#cfc8bc', roughness: 0.8 }); [-7, 7, -17, 17].forEach((x) => sc.add(mesh(new THREE.BoxGeometry(0.3, 0.17, LA).translate(0, 0.085, 0), kerb, x, 0, ZC, { cast: false })));
  { const zc = (Mz) => M4c(0, 0.025, Mz); const W = []; for (let z = -36; z > -44; z -= 1.0) [-1, 1].forEach((s) => W.push(M4c(s * 12, 0.025, z, 0, 9.6, 0.01, 0.5)));   // crosswalk
    ctIM(sc, ctBox, STDm({ color: '#f2efe6', roughness: 0.7 }), W, null, false); }
  // ---- avenue facades (instanced styles, front plane + body + cornice + zinc mansard), cross streets every 70 m
  const STY = [['#efe6d2', 5, 5, 17, { balc: true, noShut: true }], ['#e8d8b8', 6, 6, 20, { balc: true }], ['#f2e8d8', 5, 4, 14, { arcade: true }], ['#d8c8a8', 6, 5, 18, { balc: true, noShut: true }],
    ['#e8c4a8', 4, 4, 14, {}], ['#c8a888', 5, 5, 17, { balc: true }], ['#f4ecdc', 6, 6, 21, { arcade: true, balc: true, noShut: true }], ['#e0d4c0', 5, 4, 15, {}]].map(([wall, f, b, w, o], i) => {
    const F = facadeTex(9100 + i, wall, f, b, 4.4, 3.4, w, Object.assign({ lit: 0.2 }, o)); return { wall, w, h: F.h, front: STDm({ map: F.map, emissiveMap: F.em, emissive: '#ffffff', emissiveIntensity: 0.06, roughness: 0.85 }), side: STDm({ color: wall, roughness: 0.9 }), FM: [], BM: [] }; });
  const CO = [], COC = [], RF = [], unitsAv = [];
  [-1, 1].forEach((s) => { for (let zb = 70; zb > -2240; zb -= 70) { let z = zb - 7; while (z > zb - 63) { const si = R.i(0, STY.length - 1), y = STY[si], w = Math.min(y.w, z - (zb - 63)); if (w < 9) break;
      const cz = z - w / 2, ry = s > 0 ? -Math.PI / 2 : Math.PI / 2, fx = s * 24, d = 16, U = { x: fx + s * d / 2, z: cz, w: d, d: w, h: y.h, parts: [] };
      const add = (arr, M) => { arr.push(M); U.parts.push([arr, arr.length - 1, M]); };
      add(y.FM, M4c(fx - s * 0.02, 0, cz, ry, w / y.w)); add(y.BM, M4c(fx + s * (d / 2 + 0.1), 0, cz, ry, w, y.h, d - 0.3));
      add(CO, M4c(fx + s * d / 2, y.h - 0.2, cz, ry, w + 0.3, 0.5, d + 0.5)); COC.push(C3(y.wall, '#fff8ec', 0.5)); add(RF, M4c(fx + s * d / 2, y.h + 1.4, cz, ry + Math.PI / 4, w * 0.74, 2.8, d * 0.74));
      unitsAv.push(U); z -= w; } } });
  const avIM = new Map(); STY.forEach((y) => { avIM.set(y.FM, ctIM(sc, new THREE.PlaneGeometry(y.w, y.h).translate(0, y.h / 2, 0), y.front, y.FM, null, false)); avIM.set(y.BM, ctIM(sc, ctBox, y.side, y.BM)); });
  avIM.set(CO, ctIM(sc, ctBox, STDm({ roughness: 0.8 }), CO, COC)); avIM.set(RF, ctIM(sc, new THREE.CylinderGeometry(0.15, 1, 1, 4, 1).translate(0, -0.5 + 0.5, 0), STDm({ color: '#5d646c', roughness: 0.55, metalness: 0.3 }), RF));
  // ---- the city grid: classic mid-rise blocks with mansards near, plain blocks far, glass towers here and there, parks
  const CB = [], CC = [], CR = [], TB = [], TC = [], TRp = [], TRc = [], WALL = ['#efe6d2', '#e8d8b8', '#f2e8d8', '#d8c8a8', '#e8c4a8', '#c8a888', '#ddd6cc', '#b8b4ac', '#c87a5a'];
  const free = (x, z, r) => Math.hypot(x - CT_EIF[0], z - CT_EIF[1]) > r + 260 && Math.hypot(x - CT_BURJ[0], z - CT_BURJ[1]) > r + 90;
  const unitsGrid = [];
  for (let cz = 2035; cz > -13000; cz -= 70) for (let cx = -4935; cx < 5000; cx += 70) { if (Math.abs(cx) < 70) continue; const near = Math.abs(cx) < 1500 && cz > -5200, rr = RNG('ctc', cx, cz);
    if (!free(cx, cz, 40)) { if (Math.hypot(cx - CT_EIF[0], cz - CT_EIF[1]) < 280) for (let k = 0; k < 10; k++) { TRp.push(M4c(cx + rr.n(30), 6, cz + rr.n(30), 0, rr.r(5, 8), rr.r(5, 7), rr.r(5, 8))); TRc.push(C3('#3e6a2c', '#6a8a3a', rr.f())); } continue; }
    if (rr.f() < 0.045) { for (let k = 0; k < (near ? 14 : 5); k++) { TRp.push(M4c(cx + rr.n(24), 5, cz + rr.n(24), 0, rr.r(4, 7), rr.r(4, 6), rr.r(4, 7))); TRc.push(C3('#3e6a2c', '#6a8a3a', rr.f())); } continue; }
    const tower = rr.f() < (Math.hypot(cx + 900, cz + 3800) < 900 ? 0.35 : 0.05), nb = near && !tower ? 2 : 1;
    for (let b = 0; b < nb; b++) { const w = nb === 2 ? 25 : 52, x = cx + (nb === 2 ? (b ? 13.5 : -13.5) : 0), d = 52 + rr.n(2), U = { x, z: cz, w, d, parts: [] };
      if (tower) { const h = rr.r(70, 230), tw = rr.r(26, 44); U.w = U.d = tw; U.h = h; TB.push(M4c(x, 0, cz, 0, tw, h, tw)); TC.push(C3('#7f98b0', '#c8d4dc', rr.f())); U.parts.push([TB, TB.length - 1, TB[TB.length - 1]]); }
      else { const h = near ? rr.r(17, 30) : rr.r(14, 34) * (rr.f() < 0.1 ? 1.8 : 1); U.h = h; CB.push(M4c(x, 0, cz, 0, w, h, d)); CC.push(lin(rr.pick(WALL))); U.parts.push([CB, CB.length - 1, CB[CB.length - 1]]);
        if (near) { CR.push(M4c(x, h, cz, Math.PI / 4, w * 0.7, 3.2, d * 0.7)); U.parts.push([CR, CR.length - 1, CR[CR.length - 1]]); } }
      if (Math.abs(x) < 620 && cz < 80 && cz > -3800) unitsGrid.push(U); } }
  // the row behind the avenue facades (x ±40…66)
  [-1, 1].forEach((s) => { for (let cz = 35; cz > -5000; cz -= 70) { const rr = RNG('ctrow', s, cz), h = rr.r(18, 28), U = { x: s * 53, z: cz, w: 26, d: 56, h, parts: [] }; CB.push(M4c(s * 53, 0, cz, 0, 26, h, 56)); CC.push(lin(rr.pick(WALL))); U.parts.push([CB, CB.length - 1, CB[CB.length - 1]]);
    CR.push(M4c(s * 53, h, cz, Math.PI / 4, 18, 3, 39)); U.parts.push([CR, CR.length - 1, CR[CR.length - 1]]); if (cz > -3800) unitsGrid.push(U); } });
  avIM.set(CB, ctIM(sc, ctBox, winLit('#ffffff', 3), CB, CC)); avIM.set(TB, ctIM(sc, ctBox, Object.assign(winLit('#ffffff', 7), { metalness: 0.45, roughness: 0.25 }), TB, TC));
  avIM.set(CR, ctIM(sc, new THREE.CylinderGeometry(0.15, 1, 1, 4, 1).translate(0, 0.5, 0), STDm({ color: '#5d646c', roughness: 0.55, metalness: 0.3 }), CR));
  [CB, TB].forEach((A) => avIM.get(A).material.userData.U.uLit.value = 0.12);
  ctIM(sc, lumpyGeo(1, 0.3, 11), STDm({ roughness: 0.95 }), TRp, TRc, true);
  // ---- trees and lamps along the promenade (instanced), the Eiffel Tower and the Burj Khalifa
  { const TK = [], CN = [], CNc = [], LP = [], LH = []; for (let z = 40; z > -2400; z -= 9) [-1, 1].forEach((s) => { const rr = RNG('cttr', s, z), x = s * 18.6, k = rr.r(1.2, 1.45); TK.push(M4c(x, 0.15, z, rr.r(0, 6), k, k, k));
      for (let j = 0; j < 4; j++) { CN.push(M4c(x + rr.n(1.0) - s * 0.3, (5.4 + rr.r(-0.2, 1.4)) * k, z + rr.n(1.4), rr.r(0, 6), rr.r(1.7, 2.4) * k, rr.r(1.4, 2.0) * k, rr.r(1.7, 2.4) * k)); CNc.push(C3('#7a9a4a', '#4a6a2a', rr.f())); } });
    for (let z = 31; z > -2400; z -= 18) [-1, 1].forEach((s) => { const rr = RNG('ctbn', s, z); TK.push(M4c(s * 5.6, 0.15, z, 0, 0.55, 0.5, 0.55)); for (let j = 0; j < 3; j++) { CN.push(M4c(s * 5.6 + rr.n(0.5), 2.4 + rr.r(0, 0.5), z + rr.n(0.6), rr.r(0, 6), rr.r(0.8, 1.1), rr.r(0.7, 0.9), rr.r(0.8, 1.1))); CNc.push(C3('#6a8a3a', '#3e5e26', rr.f())); } });
    for (let z = 35; z > -2400; z -= 18) [-1, 1].forEach((s) => { LP.push(M4c(s * 6.6, 0.15, z)); LH.push(M4c(s * 6.6, 4.3, z)); });
    ctIM(sc, new THREE.CylinderGeometry(0.17, 0.27, 4.4, 8).translate(0, 2.2, 0), STDm({ map: texNoise('ctbark', '#8a8270', ['#6a6458', '#a8a090', '#c0b8a4'], 5000), roughness: 1 }), TK);
    ctIM(sc, lumpyGeo(2, 0.32, 21), STDm({ map: leafTex('ctlf', '#5a7a38'), roughness: 0.95 }), CN, CNc);
    const ir = STDm({ color: '#1e1c1c', roughness: 0.5, metalness: 0.6 }); ctIM(sc, new THREE.CylinderGeometry(0.06, 0.12, 4.2, 8).translate(0, 2.1, 0), ir, LP); ctIM(sc, new THREE.CylinderGeometry(0.22, 0.12, 0.5, 6), STDm({ color: '#fff0c8', emissive: '#ffcf80', emissiveIntensity: 0.4 }), LH); }
  { const lat = g3Tex((x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 3; const n = 10; for (let j = 0; j < n * 4; j++) { const y0 = j * h / (n * 4), y1 = y0 + h / (n * 4); for (let i = 0; i < 8; i++) { const a = i * w / 8, b = a + w / 8; x.beginPath(); x.moveTo(a, y0); x.lineTo(b, y1); x.moveTo(b, y0); x.lineTo(a, y1); x.stroke(); } x.fillStyle = '#fff'; x.fillRect(0, y0, w, 2); }
      for (let i = 0; i <= 8; i++) x.fillRect(i * w / 8 - 2, 0, 4, h); }, 128, 512, false);
    const em = STDm({ color: '#6a5040', roughness: 0.7, metalness: 0.3, alphaMap: lat, alphaTest: 0.5, side: THREE.DoubleSide }), sol = STDm({ color: '#5e4636', roughness: 0.7, metalness: 0.3 }), E = new THREE.Group(); E.position.set(CT_EIF[0], 0, CT_EIF[1]); sc.add(E);
    [[0, 57, 88, 50], [57, 116, 44, 26], [116, 276, 23, 4]].forEach(([y0, y1, r0, r1]) => E.add(mesh(new THREE.CylinderGeometry(r1, r0, y1 - y0, 4, 6, true).rotateY(Math.PI / 4).translate(0, (y0 + y1) / 2, 0), em)));
    [[57, 74], [116, 40], [276, 6]].forEach(([y, s]) => E.add(mesh(new THREE.BoxGeometry(s, 4, s), sol, 0, y, 0))); E.add(mesh(new THREE.CylinderGeometry(0.6, 2, 54, 8).translate(0, 303, 0), sol));
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => E.add(mesh(new THREE.BoxGeometry(14, 4, 14), sol, a * 56, 2, b * 56)));
    const B = new THREE.Group(); B.position.set(CT_BURJ[0], 0, CT_BURJ[1]); sc.add(B); const gl = Object.assign(winLit('#c8d4dc', 9), { metalness: 0.6, roughness: 0.22 }); gl.userData.U.uLit.value = 0.1;
    [[0, 140, 44, 40], [140, 280, 34, 30], [280, 420, 27, 23], [420, 540, 20, 16], [540, 620, 14, 10], [620, 690, 9, 6]].forEach(([y0, y1, r0, r1], i) => { B.add(mesh(new THREE.CylinderGeometry(r1, r0, y1 - y0, 6).translate(0, (y0 + y1) / 2, 0), gl)); [0, 2, 4].forEach((k) => { const a = k / 6 * TAU + i * 0.35; B.add(mesh(new THREE.CylinderGeometry(r1 * 0.6, r0 * 0.6, (y1 - y0) * 0.8, 6).translate(0, y0 + (y1 - y0) * 0.4, 0), gl, Math.cos(a) * r0 * 0.75, 0, Math.sin(a) * r0 * 0.75)); }); });
    B.add(mesh(new THREE.CylinderGeometry(0.6, 6, 140, 8).translate(0, 760, 0), STDm({ color: '#c8d0d8', metalness: 0.8, roughness: 0.25 }))); }
  // ---- cars on the avenue (4 lanes; +x side heads −z), animated per frame
  { const G = ctCar(), N = 150; S.cars = []; for (let k = 0; k < N; k++) { const s = k % 2 ? 1 : -1, lane = R.f() < 0.5 ? 9.6 : 14.4; S.cars.push({ x: s * lane, z0: R.r(-2400, 120), v: R.r(8, 12), s, c: lin(R.pick(['#c8202a', '#f2f2f2', '#1e1e22', '#2e5aa8', '#8a8e94', '#f0c33c', '#2a6a4e', '#d8d4cc', '#5a2a6a', '#f2f2f2'])) }); }
    const I0 = S.cars.map(() => M4()), cols = S.cars.map((c) => c.c), paint = STDm({ roughness: 0.3, metalness: 0.5 });
    S.carIM = [ctIM(sc, G.body, paint, I0, cols), ctIM(sc, G.roof, paint, I0, cols), ctIM(sc, G.cab, STDm({ color: '#141c24', roughness: 0.08, metalness: 0.6 }), I0), ctIM(sc, G.wheels, STDm({ color: '#141414', roughness: 0.8 }), I0, null, false),
      ctIM(sc, G.heads, STDm({ color: '#fffaf0', emissive: '#fff4d8', emissiveIntensity: 0.6 }), I0, null, false), ctIM(sc, G.tails, STDm({ color: '#8a1010', emissive: '#ff2010', emissiveIntensity: 0.4 }), I0, null, false)];
    S.carIM.forEach((m) => m.instanceMatrix.setUsage(THREE.DynamicDrawUsage));
    S.brake = { body: [G.body, G.roof, G.cab, G.wheels, G.heads, G.tails].map((g, i) => mesh(g, i < 2 ? STDm({ color: '#c8202a', roughness: 0.3, metalness: 0.5 }) : i === 5 ? (S.tailM = STDm({ color: '#8a1010', emissive: '#ff2010', emissiveIntensity: 3 })) : S.carIM[i].material)) }; S.brake.g = new THREE.Group(); S.brake.body.forEach((m) => S.brake.g.add(m)); sc.add(S.brake.g); }
  // ---- collapse registry: every wrecked unit gets a hit time, a rubble mound and two dust puffs
  S.ims = avIM; S.units = unitsAv.concat(unitsGrid); const rub = [], rubC = [], dustT = [0, 1, 2, 3].map((k) => cloudTex(40 + k));
  S.units.forEach((U, i) => { const rr = RNG('ctu', i); U.t = ctHit(U.x, U.z, rr); U.rub = rub.length; rub.push(_hid.clone()); rubC.push(C3('#8a7a68', '#b8a890', rr.f())); U.tilt = [rr.n(0.12), rr.n(0.12)];
    U.dust = Math.abs(U.x) < 420 ? [0, 1].map((k) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: rr.pick(dustT), color: C3('#c9b496', '#e0d0b8', rr.f()), transparent: true, depthWrite: false, premultipliedAlpha: true })); sp.visible = false; sp.userData.o = [rr.n(0.4), rr.r(0, 0.5), rr.n(0.4), rr.r(0.9, 1.3), rr.r(0, 0.5)]; sc.add(sp); return sp; }) : []; });
  S.rubIM = ctIM(sc, lumpyGeo(1, 0.35, 77), STDm({ roughness: 1 }), rub, rubC); S.rubIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // ---- clouds, the crowd (instanced, far) and a dozen full people (near camera)
  addSkyClouds(st, 26, 0, -6000, 9000, 24000, 2600, 3400, 'ct');
  S.crowd = makeCrowd(320, { seed: 31 }); sc.add(S.crowd.grp); S.cw = []; for (let i = 0; i < 320; i++) { const rr = RNG('ctcw', i), side = rr.f(); S.cw.push({ x: side < 0.6 ? rr.r(-6.2, 6.2) : (rr.f() < 0.5 ? -1 : 1) * rr.r(18, 23), z: rr.r(-260, 25), dir: rr.f() < 0.5 ? 1 : -1, v: rr.r(1.0, 1.5) }); }
  S.cw = S.cw.filter((c) => !(Math.abs(c.x) < 1.2 && c.z < 2 && c.z > -40));
  const RP = RNG('ctppl'); S.ppl = []; for (let i = 0; i < 14; i++) { const P = i % 2 ? man(RP) : woman(RP); sc.add(P.root); S.ppl.push(P); }
  S.girl = makeGirl(st); return S; }

// ---- per-frame state
function ctShadow(st, x, z, size) { const k = st.key, c = k.shadow.camera; k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(CT_SUN, size * 3);
  Object.assign(c, { left: -size, right: size, top: size, bottom: -size, near: size * 0.5, far: size * 6 }); c.updateProjectionMatrix(); k.shadow.normalBias = 0.02 * Math.max(1, size / 60); }
function ctWorld(S, t, H, cam = null) { const st = S.st, gz = ctZ(t); st.cam.near = Math.max(0.05, H * 0.012); st.cam.far = 60000; st.scene.fog.far = Math.max(2600, 16 * H); st.scene.fog.near = st.scene.fog.far * 0.08;
  // cars (the near one brakes at the crosswalk during 'run')
  S.cars.forEach((c, i) => { const span = 2520, zz = mod(c.z0 - c.s * c.v * t + 2400, span) - 2400; let M = M4c(c.x, 0, zz, c.s > 0 ? Math.PI / 2 : -Math.PI / 2);
    if (t > 8 && Math.abs(zz - gz) < H * 0.1 && Math.abs(c.x) < H * 0.12) M = _hid; S.carIM.forEach((m) => m.setMatrixAt(i, M)); }); S.carIM.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // wrecked units: sink + tilt, rubble grows, dust billows and drifts
  const touched = new Set(); S.units.forEach((U) => { const u = t - U.t, k = EZ.i2(clamp(u / 1.4)); if (k <= 0) return;
    U.parts.forEach(([arr, idx, M0]) => { let M = _hid; if (k < 1) { _v.setFromMatrixPosition(M0); M = M4c(_v.x, _v.y - k * U.h * 0.97, _v.z, 0, 1, 1, 1, U.tilt[0] * k, U.tilt[1] * k).multiply(M4c(-_v.x, -_v.y, -_v.z)).multiply(M0); } S.ims.get(arr).setMatrixAt(idx, M); touched.add(arr); });
    const rs = clamp(u / 1.2); S.rubIM.setMatrixAt(U.rub, M4c(U.x, 0, U.z, U.x * 0.1, U.w * 0.55 * (0.4 + 0.6 * rs), Math.min(U.h, 40) * 0.22 * rs, U.d * 0.55 * (0.4 + 0.6 * rs)));
    U.dust.forEach((sp, j) => { const o = sp.userData.o, v = u - o[4] * 0.4; sp.visible = v > 0 && v < 8 && U.z < gz + 0.6 * H; if (!sp.visible) return; const sz = (Math.max(U.w, U.d) * 1.1 + U.h * 0.6) * o[3] * 1.5 * (0.45 + 0.9 * (1 - Math.exp(-v * 0.9)));
      sp.position.set(U.x + o[0] * U.w + v * 2, sz * 0.28 + v * 1.5, U.z + o[2] * U.d - v * 1.2); sp.scale.set(sz * 1.5, sz, 1); sp.material.opacity = ss(0, 0.25, v) * (1 - ss(3.5, 8, v)); }); });
  touched.forEach((a) => (S.ims.get(a).instanceMatrix.needsUpdate = true)); S.rubIM.instanceMatrix.needsUpdate = true;
  // instanced crowd: walk, stop and stare (3.3 s), flee (5.2 s); hidden once she is a giant
  const C = S.crowd, vis = t < 11; C.grp.visible = vis; if (vis) { const g5 = ctZ(5.2); S.cw.forEach((c, i) => { const tw = Math.min(t, 3.3), x = c.x, z = c.z + c.dir * c.v * tw; let px = x, pz = z, yaw = c.dir > 0 ? 0 : Math.PI, gone = 0;
      if (t > 3.3) yaw = Math.atan2(-x, ctZ(Math.min(t, 5.2)) - z); if (t > 5.2) { const dx = x, dz = z - g5, L = Math.hypot(dx, dz) || 1, r = (t - 5.2) * 4.5 * (0.8 + 0.4 * c.v / 1.5); px = clamp(x + dx / L * r * 0.6, -23, 23); pz = z + dz / L * r; yaw = Math.atan2(dx, dz); }
      if (Math.abs(pz - gz) < H * 0.12 && Math.abs(px) < H * 0.1 + 0.6) gone = 1; if (cam && Math.hypot(px - cam[0], pz - cam[2]) < 9) gone = 1; C.set(i, px, Math.abs(px) < 7 || Math.abs(px) > 17 ? 0.15 : 0, pz, yaw, 1, t > 3.3 && t < 5.2 && i % 4 === 0 ? 0.6 : 0, 0, gone); }); C.done(); }
  S.ppl.forEach((P) => (P.root.visible = false)); S.brake.g.visible = false;
  ctShadow(st, 0, gz - H * 0.3, Math.max(45, H * 1.4)); return gz; }
function ctGirl(S, t, H, gz, q = {}) { placeGirl(S.girl, 0, 0.15, gz, H, Object.assign({ yaw: Math.PI, walk: 1 }, q)); }
function ctPerson(S, i, x, z, q) { const P = S.ppl[i]; P.root.visible = true; posePerson(P, Object.assign({ x, y: Math.abs(x) < 7 || Math.abs(x) > 17 ? 0.15 : 0, z }, q)); }

SHOT_FN.walk = (lt, dur, t) => { const S = once('city', buildCity), H = HGT(t), g0 = ctZ(t), cam = [0.3 * H, 0.5 * H + 0.45, g0 + 1.25 * H + 0.5], gz = ctWorld(S, t, H, cam); ctGirl(S, t, H, gz);
  // people on the promenade around her: some ahead walking away, some coming towards the camera
  [[-2.4, -6, -1], [2.2, -9, 1], [-3.6, -14, 1], [3.4, -4, -1], [-1.6, -20, -1], [4.6, -17, 1], [1.8, -26, -1], [-4.8, -9, 1], [5.5, -12, -1], [-5.2, -24, 1]].forEach(([x, z, d], i) => { const zz = z + d * 1.25 * t * (d > 0 ? 1 : 0.85); ctPerson(S, i, x, zz, { yaw: d > 0 ? 0 : Math.PI, walk: 1, ph: t * 6 + i * 1.3 }); });
  camPt(S.st, cam, [0, 0.5 * H, gz - 6 * H], 54, t, 0.35, 3); renderStage(S.st, 1.0); bloom(0.12); };
SHOT_FN.stare = (lt, dur, t) => { const S = once('city', buildCity), H = HGT(t), cam = [2.0, 1.55, -30 + lt * 0.4], gz = ctWorld(S, t, H, cam); ctGirl(S, t, H, gz, { yaw: Math.PI, headPitch: 0.25 });
  // camera low among the crowd in front of her; people turned towards her, heads up
  [[-1.4, -26.5], [3.6, -26.8], [-3.6, -23], [0.9, -22.5], [4.8, -21.5], [-5.4, -27.5], [2.6, -20.5], [-2.4, -20.8], [6.2, -24.5], [-0.6, -28.6]].forEach(([x, z], i) => { const yaw = Math.atan2(-x, gz - z); ctPerson(S, i, x, z, { yaw, headPitch: -0.5 - 0.1 * (i % 3), emo: { surprise: 0.8, open: 0.4 }, armL: i % 3 === 1 ? [1.4, 0.2, 1.6] : null, armR: i % 4 === 2 ? [0.3, 0.1, 1.9] : null }); });
  camPt(S.st, cam, [0, 0.62 * H, gz], 58, t, 0.5, 5); renderStage(S.st, 1.0); bloom(0.12); };
SHOT_FN.run = (lt, dur, t) => { const S = once('city', buildCity), H = HGT(t), cam = [15.8, 1.35, -19 - lt * 0.5], gz = ctWorld(S, t, H, cam); ctGirl(S, t, H, gz);
  // people fleeing past the camera, a car braking hard just before the crosswalk
  const g5 = ctZ(5);
  [[-3, -30], [2, -27], [5, -35], [-5, -22], [1, -40], [4, -24], [-2, -36], [6, -29], [3, -44], [-4, -42]].forEach(([x, z], i) => { const dx = x + 8, dz = z - g5, L = Math.hypot(dx, dz), r = (lt + 0.4) * 5.2; ctPerson(S, i, clamp(x + dx / L * r, -23, 23), z + dz / L * r * 0.5, { yaw: Math.atan2(dx, dz * 0.5), run: 1, ph: t * 10 + i, emo: { fear: 0.9 } }); });
  { const B = S.brake.g, u = clamp(lt / 1.3), zf = lerp(-12, -33.5, 1 - Math.pow(1 - u, 2.2)), dip = Math.sin(clamp((lt - 0.6) / 1.2) * Math.PI) * 0.06; B.visible = true; B.position.set(9.6, 0, zf + 2.2); B.rotation.set(0, Math.PI / 2, 0); B.rotation.z = -dip; }
  camPt(S.st, cam, [-1.5, 0.5 * H, gz - 6], 68, t, 0.6, 7); renderStage(S.st, 1.0); bloom(0.14); };
SHOT_FN.cars = (lt, dur, t) => { const S = once('city', buildCity), H = HGT(t), gz = ctWorld(S, t, H); ctGirl(S, t, H, gz);
  camPt(S.st, [0.16 * H, 0.66 * H, gz + 0.5 * H], [0, 0.02 * H, gz - 0.75 * H], 56, t, 0.4, 9); renderStage(S.st, 1.0); bloom(0.12); };
SHOT_FN.crumble = (lt, dur, t) => { const S = once('city', buildCity), H = HGT(t), gz = ctWorld(S, t, H); ctGirl(S, t, H, gz);
  camPt(S.st, [0.14 * H, 0.6 * H, gz + 0.95 * H], [0, 0.2 * H, gz - 1.1 * H], 56, t, 0.4, 11); renderStage(S.st, 1.0); bloom(0.12); };
const ctTall = (lt, dur, t, seed) => { const S = once('city', buildCity), H = HGT(t), gz = ctWorld(S, t, H); ctGirl(S, t, H, gz, { headPitch: 0.1 });
  camPt(S.st, [0.1 * H, 0.8 * H, gz + 1.15 * H], [0, 0.42 * H, gz - 2.2 * H], 55, t, 0.35, seed); renderStage(S.st, 1.0); bloom(0.12); };
SHOT_FN.eiffel = (lt, dur, t) => ctTall(lt, dur, t, 13);
SHOT_FN.burj = (lt, dur, t) => ctTall(lt, dur, t, 15);

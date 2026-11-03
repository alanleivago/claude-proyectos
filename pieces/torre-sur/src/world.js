// =====================================================================
//  WORLD — the sets, smooth matte 3D like the reference (beige office, grey stair, white sky lobby):
//   • stTower(): floor 89 of the South Tower (open-plan office on the north side) + outside: the North Tower 49 m
//     away (real proud aluminium columns, mechanical-floor bands), Lower Manhattan below in haze, the rivers, a plane.
//   • stStair(): Stair A — a stack of switchback flights in grey concrete, yellow nosings, steel rails, wall lamps.
//   • stLobby(): the 78th-floor sky lobby — tall bright hall, an elevator bank "ASCENSORES 79–100", windows, a crowd.
//  y = 0 is the street; floor 89 is at FY. The towers' faces run along x/z, north = -z.
// =====================================================================
const FY = 326, CEIL = 2.65;
const NT = { x: -28, z: -112, w: 63.4, h: 417 };          // North Tower centre and size
const ST = { x: 0, z: 0, w: 63.4 };                       // South Tower (we are inside)
const BAY = 1.5, COLW = 0.6;                            // window bay pitch and inner column width (stylised a bit wider than the real 1.02 m)

// ---- code textures
const texCarpet = () => wrap(g3Tex((x, w) => { const R = RNG('carpet'); x.fillStyle = '#3c4656'; x.fillRect(0, 0, w, w); for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 60), R.pick(['rgba(66,76,92,0.35)', 'rgba(56,64,78,0.35)']));
  speck(x, w, w, 6000, ['#424c5c', '#38414f', '#465162'], R, 1, 1.5); }, 256, 256), 30, 30);
const texCeiling = () => wrap(g3Tex((x, w) => { const R = RNG('ceil'); x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, w); speck(x, w, w, 1500, ['#e6e2d8', '#ebe8e0'], R, 1, 1.5);
  x.fillStyle = '#d6d2c8'; x.fillRect(0, 0, w, 4); x.fillRect(0, 0, 4, w); }, 128, 128), 60, 30);
const texConcrete = (key, base = '#9a9894') => g3Tex((x, w) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 50; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 60), R.pick(['rgba(140,138,132,0.12)', 'rgba(190,188,182,0.12)']));
  x.strokeStyle = 'rgba(80,78,74,0.12)'; x.lineWidth = 1; x.strokeRect(0, 0, w, w); }, 256, 256);
const texStone = () => wrap(g3Tex((x, w) => { const R = RNG('stone'); /* polished limestone tiles */ x.fillStyle = '#e6dfd2'; x.fillRect(0, 0, w, w); for (let k = 0; k < 60; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 50), R.pick(['rgba(214,206,192,0.25)', 'rgba(244,240,232,0.3)', 'rgba(206,196,180,0.18)']));
  x.strokeStyle = 'rgba(160,150,135,0.7)'; x.lineWidth = 2; x.strokeRect(0, 0, w, w); for (let k = 0; k < 6; k++) { x.strokeStyle = 'rgba(180,170,155,0.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(R.r(0, w), R.r(0, w)); x.bezierCurveTo(R.r(0, w), R.r(0, w), R.r(0, w), R.r(0, w), R.r(0, w), R.r(0, w)); x.stroke(); } }, 256, 256), 18, 12);
const texCityGround = () => wrap(g3Tex((x, w) => { const R = RNG('cgr'); x.fillStyle = '#6a6c6e'; x.fillRect(0, 0, w, w); speck(x, w, w, 6000, ['#5e6062', '#787a7c', '#505254'], R, 1, 3); x.fillStyle = '#4a4c4e'; for (let i = 0; i < w; i += 32) { x.fillRect(i, 0, 5, w); x.fillRect(0, i, w, 4); } }, 256, 256), 80, 80);
const texFabric = (base) => { const t = wrap(g3Tex((x, w) => { const R = RNG('fab' + base); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 2) { x.fillStyle = 'rgba(0,0,0,0.07)'; x.fillRect(i, 0, 1, w); x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(0, i, w, 1); } speck(x, w, w, 2500, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.07)'], R, 1, 1); }, 256, 256), 3, 2); t.anisotropy = 16; return t; };
// the WTC skin seen from far: aluminium column stripes, dark glass slits, a faint floor line (one column × one floor per tile)
const texWTC = () => g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#b4bcc4'); g.addColorStop(0.3, '#eef1f4'); g.addColorStop(0.55, '#c8ced4'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const wg = x.createLinearGradient(0, h * 0.14, 0, h * 0.9); wg.addColorStop(0, '#2c3846'); wg.addColorStop(1, '#4e5e70'); x.fillStyle = wg; x.fillRect(w * 0.58, h * 0.14, w * 0.34, h * 0.76);
  x.fillStyle = 'rgba(170,200,230,0.35)'; x.fillRect(w * 0.6, h * 0.16, w * 0.08, h * 0.7); }, 32, 64);

// ---- small builders
const TM = (col, o = {}) => TOON(Object.assign({ color: col }, o));
function bx(par, w, h, d, mat, x, y, z, o = {}) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; m.castShadow = o.cast ?? true; m.receiveShadow = true; par.add(m); return m; }
function textPlane(par, lines, w, h, x, y, z, o = {}) { const ar = w / h, tw = 1024, th = Math.round(tw / ar); const t = g3Tex((c, cw, ch) => { c.fillStyle = o.bg || '#1e2226'; c.fillRect(0, 0, cw, ch); c.fillStyle = o.fg || '#f4f2ea'; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => { const sz = (o.size || 0.62) * ch / lines.length * (i ? 0.7 : 1); c.font = `${o.weight || 800} ${sz}px "Segoe UI", Arial, sans-serif`; c.fillText(l, o.align === 'left' ? ch * 0.25 : cw / 2, ch * (i + 0.5) / lines.length); }); }, tw, th);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), TOON({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: o.glow ?? 0.25 })); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; par.add(m); return m; }
// an elevator floor indicator: amber arrow and number on a dark glass panel
const IND_T = {}; function indTex(txt) { return IND_T[txt] || (IND_T[txt] = g3Tex((x, w, h) => { x.fillStyle = '#16100c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5a5048'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#ffa22a'; x.font = '800 62px "Segoe UI", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h / 2 + 2); }, 256, 96)); }
const indMat = (txt) => new THREE.MeshBasicMaterial({ map: indTex(txt), toneMapped: false });
const glowMat = (col, a = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: a < 1, opacity: a, toneMapped: false });

// ---- a tower (North Tower; also the South Tower seen from outside later): glass core box + real columns on two faces + mechanical bands
function buildTower(par, T, faces = [], o = {}) {
  const g = new THREE.Group(); g.position.set(T.x, 0, T.z); par.add(g);
  const tex = texWTC(), mats = [0, 1, 2, 3, 4, 5].map((i) => { const t = tex.clone(); t.needsUpdate = true; wrap(t, Math.round(T.w / 1.02), Math.round(T.h / 3.66)); t.anisotropy = 16; return TOON({ map: t, roughness: 0.6 }); });
  const core = new THREE.Mesh(new THREE.BoxGeometry(T.w, T.h, T.w), mats); core.position.y = T.h / 2; core.castShadow = true; core.receiveShadow = true; g.add(core);
  const colM = TOON({ color: '#e2e6ea' }), n = Math.floor(T.w / 1.02);
  faces.forEach((f) => { const im = IM(new THREE.BoxGeometry(0.46, T.h - 20, 0.42), colM, n); for (let i = 0; i < n; i++) { const u = -T.w / 2 + (i + 0.5) * T.w / n, y = (T.h - 20) / 2 + 20;
      const M = f === 's' ? M4c(u, y, T.w / 2 + 0.2) : f === 'n' ? M4c(u, y, -T.w / 2 - 0.2) : f === 'e' ? M4c(T.w / 2 + 0.2, y, u, Math.PI / 2) : M4c(-T.w / 2 - 0.2, y, u, Math.PI / 2); im.setMatrixAt(i, M); } g.add(im); });
  // mechanical floors (louvred bands) and the roof edge
  const bandM = TOON({ color: '#7d858e' }); [[106, 7.3], [272, 7.3], [404, 7.3]].forEach(([y, hh]) => bx(g, T.w + 1.2, hh, T.w + 1.2, bandM, 0, y, 0));
  bx(g, T.w + 0.6, 2, T.w + 0.6, TOON({ color: '#c4c8cc' }), 0, T.h + 1, 0);
  if (o.antenna) { cyl(g, 0.9, 2.2, 110, TOON({ color: '#e8e4dc' }), 0, T.h + 55, 0, 10); for (let k = 0; k < 6; k++) bx(g, 4 - k * 0.5, 0.6, 4 - k * 0.5, TOON({ color: k % 2 ? '#d8392a' : '#f4f0e8' }), 0, T.h + 10 + k * 16, 0); }
  // the ground plaza ring of lower floors (arched base) as a lighter band
  bx(g, T.w + 0.8, 20, T.w + 0.8, TOON({ color: '#c8ccd0' }), 0, 10, 0);
  return g;
}

// ---- Lower Manhattan and the harbour: land shapes (Manhattan, Brooklyn, New Jersey, Governors and Liberty islands) over
//      the water, ~20k instanced blocks whose height and colour depend on the district (brick walk-ups, mid towers,
//      the Financial District, Midtown far north, low Brooklyn and Jersey), streets in the ground, haze.
// Manhattan's shores (x at a given z; north = -z): the Hudson side and the East River side, closing at the Battery (z ≈ +700)
const xW = (z) => (z > 0 ? lerp(-430, 60, Math.min(1, z / 720)) : -430 + 0.12 * z), xE = (z) => (z > 0 ? lerp(1050, 330, Math.min(1, z / 720)) : 1050 - 0.17 * z);
const xBk = (z) => xE(Math.min(z, 0)) + 420 + Math.max(0, z) * 0.15, xNJ = (z) => xW(Math.min(z, 0)) - 1300;
function landAt(x, z) {
  if (z < 720 && x > xW(z) && x < xE(z)) return 'man';
  if (z < 2500 && x > xBk(z)) return 'bk';
  if (x < xNJ(z) && z < 2200) return 'nj';
  if (Math.hypot(x - 760, z - 1750) < 380) return 'gov';
  return null; }
function buildCity(par) {
  const R = RNG('city'), N = 30000, im = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), windowsMat('#b8b2a8'), N); let i = 0;
  const BRICK = ['#8a4a36', '#9a5a40', '#7a4232', '#a46a4c', '#6e3e30', '#b07a5a'], STONE = ['#c9c2b4', '#d6d0c4', '#b4a48e', '#c8bca4', '#a89c8c'], GLASS = ['#7c8a98', '#6a7888', '#9aa6b2', '#8c96a0'];
  for (let gx = -95; gx < 105 && i < N; gx++) for (let gz = -110; gz < 50 && i < N; gz++) {
    const x0 = gx * 44, z0 = gz * 66, land = landAt(x0, z0); if (!land || land === 'gov') continue;
    if (Math.hypot(x0, z0) < 130) continue;                                                      // the WTC plaza
    const north = z0 < -1600, rot = land === 'man' ? (north ? 0.5 : R.n(0.15)) : land === 'bk' ? 0.3 : -0.1, cs = Math.cos(rot), sn = Math.sin(rot);
    const x = land === 'man' && north ? x0 * cs - z0 * sn * 0.05 : x0, z = z0, fin = land === 'man' && z0 > -500 && z0 < 720 && x0 > -150, mid = land === 'man' && z0 < -3800;
    let h, pal;
    if (land !== 'man') { h = R.f() < 0.05 ? R.r(40, 90) : R.r(7, 26); pal = R.f() < 0.6 ? BRICK : STONE; if (land === 'nj' && Math.hypot(x0 + 1900, z0 - 200) < 400 && R.f() < 0.5) { h = R.r(80, 180); pal = GLASS; } }
    else if (fin) { h = R.f() < 0.35 ? R.r(110, 250) : R.r(35, 110); pal = R.f() < 0.4 ? GLASS : STONE; }
    else if (mid) { h = R.f() < 0.3 ? R.r(120, 300) : R.r(40, 120); pal = R.f() < 0.4 ? GLASS : STONE; }
    else { const r = R.f(); h = r < 0.06 ? R.r(90, 180) : r < 0.3 ? R.r(35, 80) : R.r(12, 32); pal = h < 34 ? BRICK : R.f() < 0.5 ? STONE : GLASS; }
    const k = R.f() < 0.45 ? 2 : 1; for (let s = 0; s < k && i < N; s++) { const w_ = R.r(16, 30), dz = R.r(22, 52 / k); const hh = h * R.r(0.7, 1.1) * (s ? R.r(0.5, 1) : 1);
      im.setMatrixAt(i, M4c(x + R.n(3), 0, z + (s - (k - 1) / 2) * 52 / k, rot, w_, hh, dz)); im.setColorAt(i, lin(R.pick(pal))); i++; } }
  // the Financial District down to the Battery and Brooklyn Heights: a finer, denser fill
  for (let gx = -40; gx < 60 && i < N; gx++) for (let gz = -14; gz < 30 && i < N; gz++) { const x = gx * 26 + R.n(4), z = gz * 30 + R.n(4), land = landAt(x, z); if (!land || land === 'gov' || land === 'nj' || Math.hypot(x, z) < 150 || R.f() < 0.25) continue;
    const h = land === 'man' ? (R.f() < 0.3 ? R.r(80, 210) : R.r(25, 90)) : R.r(10, 30), pal = land === 'man' ? (R.f() < 0.35 ? GLASS : R.f() < 0.5 ? STONE : BRICK) : BRICK;
    im.setMatrixAt(i, M4c(x, 0, z, R.n(0.1), R.r(12, 20), h, R.r(14, 24))); im.setColorAt(i, lin(R.pick(pal))); i++; }
  im.count = i; par.add(im);
  // water everywhere, land shapes on top (with street texture)
  const wn = g3Tex((x, w) => { const R2 = RNG('ripple'), hgt = new Float32Array(w * w); for (let k = 0; k < 26; k++) { const fx = R2.r(2, 9) | 0, fy = R2.r(2, 9) | 0, ph = R2.r(0, TAU), a = 1 / (fx + fy); for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) hgt[yy * w + xx] += a * Math.sin(TAU * (fx * xx + fy * yy * (R2.f() < 2 ? 1 : 0)) / w + ph); }
    const im2 = x.createImageData(w, w); for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) { const hx = hgt[yy * w + (xx + 1) % w] - hgt[yy * w + (xx + w - 1) % w], hy = hgt[((yy + 1) % w) * w + xx] - hgt[((yy + w - 1) % w) * w + xx], o = (yy * w + xx) * 4; im2.data[o] = 128 - hx * 300; im2.data[o + 1] = 128 - hy * 300; im2.data[o + 2] = 255; im2.data[o + 3] = 255; } x.putImageData(im2, 0, 0); }, 256, 256, false);
  wrap(wn, 110, 110); wn.anisotropy = 16; const wn2 = wn.clone(); wn2.needsUpdate = true; wrap(wn2, 900, 900); wn2.rotation = 0.73; wn2.anisotropy = 16; const waterM = new THREE.MeshPhysicalMaterial({ color: '#2a5476', roughness: 0.1, metalness: 0.05, normalMap: wn, normalScale: new THREE.Vector2(0.45, 0.45), clearcoat: 1, clearcoatRoughness: 0.04, clearcoatNormalMap: wn2, clearcoatNormalScale: new THREE.Vector2(0.6, 0.6), envMapIntensity: 1.2 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000).rotateX(-Math.PI / 2), waterM); par.userData.waterM = waterM;
  // boats and their wakes on the harbour
  { const R3 = RNG('boats'), bm = TOON({ color: '#f2f0ea' }), wk = new THREE.MeshBasicMaterial({ color: '#e8f0f4', transparent: true, opacity: 0.55, depthWrite: false });
    [[-600, 1500, 0.4, 60], [300, 2300, -0.6, 45], [-200, 3400, 0.9, 30], [1200, 2900, 2.0, 70], [-1800, 2600, -0.3, 35], [700, 1200, 1.2, 25]].forEach(([x, z, ry, L]) => { const g = new THREE.Group(); g.position.set(x, 0.5, z); g.rotation.y = ry; par.add(g);
      bx(g, L * 0.3, L * 0.12, L, bm, 0, L * 0.06, 0); bx(g, L * 0.24, L * 0.1, L * 0.4, TOON({ color: '#c84a2a' }), 0, L * 0.16, -L * 0.1);
      const w = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.9, L * 4).rotateX(-Math.PI / 2), wk); w.position.set(0, 0.2, L * 2.4); w.userData.noInk = true; g.add(w); }); } water.position.y = 0.2; par.add(water);
  const gM = TOON({ map: wrap(texCityGround(), 1 / 90, 1 / 90) }), grass = TOON({ color: '#5e7a4a' });
  const shape = (pts, mat, y = 0.6) => { const sh = new THREE.Shape(); pts.forEach(([a, b], k) => (k ? sh.lineTo(a, -b) : sh.moveTo(a, -b))); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2), mat); m.position.y = y; m.receiveShadow = true; par.add(m); return m; };
  const man = []; for (let z = -9000; z <= 720; z += 120) man.push([xE(z), z]); for (let z = 720; z >= -9000; z -= 120) man.push([xW(z), z]); shape(man, gM);
  const bk = []; for (let z = -9000; z <= 2500; z += 200) bk.push([xBk(z), z]); bk.push([12000, 2500], [12000, -9000]); shape(bk, gM);
  const nj = [[-12000, -9000]]; for (let z = -9000; z <= 2200; z += 200) nj.push([xNJ(z), z]); nj.push([-12000, 2200]); shape(nj, gM);
  const disc = (x, z, r, mat) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32).rotateX(-Math.PI / 2), mat); m.position.set(x, 0.7, z); par.add(m); };
  disc(760, 1750, 380, grass); disc(90, 650, 160, grass);                     // Governors Island, Battery Park
  // a few landmark silhouettes far north (Midtown) so it reads as Manhattan
  const tallM = TOON({ color: '#9aa4b0' }); [[-180, -6400, 380], [120, -6200, 320], [40, -6600, 300], [300, -6000, 260]].forEach(([x, z, h]) => bx(par, 50, h, 50, tallM, x, h / 2, z));
  return im;
}
// the Statue of Liberty on its island (SW, ~3.3 km): star fort, pedestal, the robed figure with the torch up (scaled 1.4× to read at distance)
function buildLiberty(par) { const g = new THREE.Group(); g.position.set(-1395, 0, 2990); g.scale.setScalar(3.0); par.add(g);
  const isl = new THREE.Mesh(new THREE.CircleGeometry(160, 32).rotateX(-Math.PI / 2), TOON({ color: '#6e8a56' })); isl.position.y = 0.5; g.add(isl);
  const st = TOON({ color: '#b8ae9a' }), cu = TOON({ color: '#6fa58e', roughness: 0.7 });
  cyl(g, 46, 46, 8, st, 0, 4, 0, 11); bx(g, 20, 27, 20, st, 0, 21, 0); bx(g, 14, 6, 14, st, 0, 37, 0);
  cyl(g, 4.5, 8, 28, cu, 0, 54, 0, 14); cyl(g, 3.5, 4.5, 8, cu, 0, 72, 0, 12); const hd = new THREE.Mesh(new THREE.SphereGeometry(3, 14, 10), cu); hd.position.y = 78.5; g.add(hd);
  for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3, sp = new THREE.Mesh(new THREE.ConeGeometry(0.6, 4, 6), cu); sp.position.set(Math.sin(a) * 3, 81, Math.cos(a) * 3 * 0.4); sp.rotation.z = -Math.sin(a) * 0.9; g.add(sp); }
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 14, 10), cu); arm.position.set(3.5, 83, 0); arm.rotation.z = -0.2; g.add(arm);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 10), TOON({ color: '#e8c060', emissive: '#e0a030', emissiveIntensity: 0.4 })); fl.position.set(5, 92, 0); g.add(fl);
  return g; }

// ---- a plane (generic twin-jet, silver): fuselage, wings, tail, engines. Nose toward -z in local space
function buildPlane(par) { const g = new THREE.Group(), m = TOON({ color: '#78808c', roughness: 0.45, metalness: 0.3 }), dk = TOON({ color: '#2a3038' });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(2.0, 40, 8, 16).rotateX(Math.PI / 2), m); g.add(fus);
  const wing = new THREE.Shape(); wing.moveTo(0, 0); wing.lineTo(19, 7); wing.lineTo(19, 9.5); wing.lineTo(0, 7); wing.closePath();
  [-1, 1].forEach((s) => { const wm = new THREE.Mesh(new THREE.ExtrudeGeometry(wing, { depth: 0.5, bevelEnabled: false }), m); wm.rotation.x = Math.PI / 2; wm.scale.x = s; wm.position.set(0, -0.8, -6); g.add(wm);
    const en = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 4.6, 14).rotateX(Math.PI / 2), dk); en.position.set(s * 7, -2.0, -3); g.add(en);
    const st_ = new THREE.Shape(); st_.moveTo(0, 0); st_.lineTo(7, 3); st_.lineTo(7, 4.5); st_.lineTo(0, 3.5); st_.closePath(); const sm = new THREE.Mesh(new THREE.ExtrudeGeometry(st_, { depth: 0.3, bevelEnabled: false }), m); sm.rotation.x = Math.PI / 2; sm.scale.x = s; sm.position.set(0, 0.5, 15); g.add(sm); });
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(6, 0); fin.lineTo(9, 9); fin.lineTo(6.5, 9); fin.closePath(); const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.3, bevelEnabled: false }), m); fm.rotation.y = -Math.PI / 2; fm.position.set(0.15, 1.5, 13); g.add(fm);
  const win = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.35, 30), dk); win.position.set(0, 0.7, -2); win.scale.x = 1.0; g.add(win);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } }); par.add(g); return g; }

// =========================== SET 1: the tower (office floor 89 + outside) ===========================
function stTower() { return once('tower', () => {
  const st = makeStage({ fov: 62, far: 9000, skyTop: '#3f7cc8', skyHor: '#e4ecf2', fog: '#dce4ec', fogNear: 250, fogFar: 4200, sky: 0xeef2f8, ground: 0xa89c88, hemi: 1.25, key: 1.6, keyCol: 0xfff4e6, box: 34, boxFar: 260 });
  st.setSun(dirV(150 * DEG, 32 * DEG), new THREE.Vector3(0, FY, -20));
  const S = { st }, sc = st.scene;
  buildTower(sc, NT, [], { antenna: true }); buildCity(sc); buildLiberty(sc);
  skyEnv(st, '#3f7cc8', '#e4ecf2', dirV(150 * DEG, 32 * DEG)); sc.userData.waterM.envMap = sc.environment; sc.environment = null; sc.fog = new THREE.FogExp2('#dde6ee', 0.00024);
  // other WTC neighbours seen in the view (WTC 7, the Customs House block) as simple masses
  bx(sc, 100, 186, 60, TOON({ color: '#9a6a54' }), -60, 93, -330); bx(sc, 70, 60, 120, TOON({ color: '#7a7e84' }), -200, 30, -60);
  // the office floor
  const off = new THREE.Group(); off.position.y = FY; sc.add(off); S.off = off;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(63, 40).rotateX(-Math.PI / 2), TOON({ map: texCarpet() })); floor.position.set(0, 0, -11.5); floor.receiveShadow = true; off.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(63, 40).rotateX(Math.PI / 2), TOON({ map: texCeiling() })); ceil.position.set(0, CEIL, -11.5); off.add(ceil);
  // ceiling light panels (glow) and air diffusers
  for (let x = -28; x <= 28; x += 3.6) for (let z = -29; z <= -4; z += 3.0) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6).rotateX(Math.PI / 2), glowMat('#fffaf0')); p.position.set(x, CEIL - 0.005, z); p.userData.noInk = true; off.add(p); }
  // the north wall: spandrel under the sill, inner columns (drywall), the slab edge above, glass
  const wallM = TOON({ color: '#d8ccb4' }), sillM = TOON({ color: '#cbbfa6' }), zW = -31.5;
  bx(off, 63, 0.22, 0.5, wallM, 0, 0.11, zW); bx(off, 63, 0.04, 0.56, sillM, 0, 0.23, zW + 0.03); bx(off, 63, CEIL - 2.5, 0.5, wallM, 0, 2.5 + (CEIL - 2.5) / 2, zW, { cast: false });
  for (let x = -31.5 + BAY / 2; x < 31.5; x += BAY) { bx(off, COLW, CEIL, 0.5, wallM, x - BAY / 2, CEIL / 2, zW + 0.02); [-1, 1].forEach((sd) => bx(off, 0.06, CEIL, 0.5, sillM, x - BAY / 2 + sd * (COLW / 2 + 0.01), CEIL / 2, zW + 0.02, { cast: false })); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(63, 2.3), new THREE.MeshBasicMaterial({ color: '#cfe2f2', transparent: true, opacity: 0.08, depthWrite: false })); glass.position.set(0, 1.4, zW - 0.12); glass.userData.noInk = true; off.add(glass); S.glass = glass;
  // the core wall (behind the cubicles), side walls
  bx(off, 40, CEIL, 0.3, wallM, 0, CEIL / 2, 0); [-31.5, 31.5].forEach((x) => bx(off, 0.5, CEIL, 34, wallM, x, CEIL / 2, -14.5));
  // cubicles: grey fabric panels, desks, beige CRT monitors, chairs, papers, plants
  const R = RNG('cubes'), panM = TOON({ map: texFabric('#9aa0a8') }), deskM = TOON({ color: '#c8bca8' }), crtM = TOON({ color: '#d8d0bc' }), scrM = glowMat('#3a5a8a'), chairM = TOON({ color: '#2a2e36' }), papM = TOON({ color: '#f6f4ec' }), potM = TOON({ color: '#8a5a3a' }), leafM = TOON({ color: '#3a7a3a' });
  for (let cx = -24; cx <= 24; cx += 4.2) for (let cz = -27; cz <= -6; cz += 4.6) { if (Math.abs(cx - 8) < 2.5) continue;   // an open aisle from the core to the windows
    const g = new THREE.Group(); g.position.set(cx + R.n(0.05), 0, cz); off.add(g);
    bx(g, 3.6, 1.35, 0.06, panM, 0, 0.675, -1.6); bx(g, 0.06, 1.35, 3.2, panM, -1.8, 0.675, 0); bx(g, 3.6, 0.04, 0.06, TOON({ color: '#6a6e74' }), 0, 1.36, -1.6);
    bx(g, 1.8, 0.04, 0.75, deskM, -0.8, 0.74, -1.15); bx(g, 0.75, 0.04, 1.6, deskM, -1.35, 0.74, -0.2);
    const mon = new THREE.Group(); mon.position.set(-1.0, 0.76, -1.25); mon.rotation.y = R.n(0.2); g.add(mon); bx(mon, 0.42, 0.36, 0.42, crtM, 0, 0.2, -0.05); const sc_ = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.25), scrM); sc_.position.set(0, 0.21, 0.165); sc_.userData.noInk = true; mon.add(sc_);
    bx(g, 0.45, 0.03, 0.18, crtM, -1.0, 0.77, -0.85);
    const ch = new THREE.Group(); ch.position.set(-0.8 + R.n(0.2), 0, -0.3 + R.n(0.2)); ch.rotation.y = R.n(0.8); g.add(ch); bx(ch, 0.5, 0.08, 0.5, chairM, 0, 0.48, 0); bx(ch, 0.48, 0.55, 0.07, chairM, 0, 0.8, 0.24); cyl(ch, 0.03, 0.03, 0.44, chairM, 0, 0.24, 0, 8);
    for (let p = 0; p < 3; p++) bx(g, 0.22, 0.01 + R.f() * 0.04, 0.3, papM, -0.5 + R.n(0.3), 0.77, -1.2 + R.n(0.15), { ry: R.n(0.4) });
    if (R.f() < 0.3) { cyl(g, 0.11, 0.08, 0.2, potM, -0.2, 0.86, -1.35, 10); const l = new THREE.Mesh(lumpyGeo(1, 0.4, cx * 7 + cz), leafM); l.scale.setScalar(0.18); l.position.set(-0.2, 1.08, -1.35); l.castShadow = true; g.add(l); } }
  // the paper coffee cup (blue-and-white diner cup, our own pattern) and the POV hand
  const HR = makeHand(1, { sleeve: '#f2f0ea', skin: '#d9a47c' }); HR.bones.concat(HR.vessels).forEach((b) => (b.visible = false)); HR.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.userData.noInk = true; }); toonify(HR.root); st.cam.add(HR.root); S.HR = HR;
  { const slv = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.55, 24).translate(0, -0.33, 0).scale(1.3, 1, 0.9), TOON({ color: '#f4f3ef', roughness: 0.9 })); HR.fore.add(slv); const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.051, 0.051, 0.05, 24).translate(0, -0.075, 0).scale(1.3, 1, 0.9), TOON({ color: '#ffffff', roughness: 0.9 })); HR.fore.add(cuff); const btn = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), TOON({ color: '#d8d4cc' })); btn.position.set(0.06, -0.075, 0.02); HR.fore.add(btn); }
  // a plain white mug with a small blue logo (a skyline in a circle, our own mark), handle on the right
  const logoT = g3Tex((x, w, h) => { x.fillStyle = '#f7f6f2'; x.fillRect(0, 0, w, h); const cx = w * 0.5, cy = h * 0.42; x.strokeStyle = '#2a5fae'; x.lineWidth = 7; x.beginPath(); x.arc(cx, cy, 52, 0, TAU); x.stroke();
    x.fillStyle = '#2a5fae'; [[-30, 30], [-14, 50], [2, 44], [16, 26], [-4, 36]].forEach(([dx, hh]) => x.fillRect(cx + dx, cy + 34 - hh, 12, hh)); x.font = '800 30px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('CAFE 89', cx, cy + 92); }, 512, 256);
  const cup = new THREE.Group(), mugM = TOON({ color: '#f7f6f2', roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.042, 0.004], [0.042, 0.1], [0.039, 0.1], [0.038, 0.012], [0, 0.012]].map(([r_, y]) => new THREE.Vector2(r_, y)), 40), mugM); body.position.y = -0.05; cup.add(body);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.0423, 0.0423, 0.07, 40, 1, true), TOON({ map: logoT, roughness: 0.35 })); label.position.y = 0.0; label.rotation.y = 0.9; cup.add(label);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.038, 32).rotateX(-Math.PI / 2), TOON({ color: '#3a2214', roughness: 0.2 })); coffee.position.y = 0.035; cup.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.0072, 12, 28, Math.PI * 1.2), mugM); handle.rotation.z = -Math.PI * 0.6; handle.position.set(0.05, 0.0, 0); cup.add(handle); S.handle = handle;
  cup.traverse((o) => { if (o.isMesh) o.castShadow = true; }); st.cam.add(cup); S.cup = cup;
  { const south = off.clone(false); off.children.slice().forEach((c) => { if (c !== HR.root) south.add(c.clone()); }); south.rotation.y = Math.PI; south.position.y = 0; const so = new THREE.Group(); so.position.y = FY; so.add(south); sc.add(so); S.south = south; }
  const lamp = new THREE.PointLight(0xfff4e0, 0.5, 4); lamp.position.set(0.3, 0.3, 0.2); st.cam.add(lamp);
  S.plane = buildPlane(sc); S.plane2 = buildPlane(sc); towerFx(S); towerCast(S);
  // interior fill (the ceiling panels)
  [[-12, -18], [8, -18], [8, -26], [-12, -26], [-12, 18], [2, 26], [8, 18]].forEach(([x, z]) => { const p = new THREE.PointLight(0xfff6e8, 0.5, 20); p.position.set(x, FY + 2.3, z); sc.add(p); });
  return S; }); }

// =========================== SET 2: Stair A ===========================
const SH = 3.66, RISE = SH / 20, TREAD = 0.27, RUN = 10 * TREAD, FW = 1.25, GAP = 0.34;   // floor height, riser, tread, flight run, flight width, gap between flights
// level L's floor landing at y = L*SH (z from 0 to 1.4); flight A goes down toward -z on x<0; mid landing at z = -RUN-1.4..-RUN; flight B comes back on x>0
function stStair() { return once('stair', () => {
  const st = makeStage({ fov: 64, far: 120, fog: '#6a6a68', fogNear: 8, fogFar: 40, sky: 0xf6f4ee, ground: 0x7a7874, hemi: 1.05, key: 1.3, keyCol: 0xfff6ea, box: 9, boxFar: 60 });
  st.scene.background = lin('#5a5a58'); const S = { st }, sc = st.scene;
  const conc = wrap(texConcrete('st1', '#a9a8a4'), 1, 1), cM = TOON({ map: conc }), stepM = TOON({ map: wrap(texConcrete('st2', '#9e9d99'), 1, 0.3) }), yel = TOON({ color: '#d8e6a8', emissive: '#c8e090', emissiveIntensity: 0.45 }), railM = TOON({ color: '#e0b21e' }), wallM = TOON({ map: wrap(texConcrete('st3', '#b9b7b1'), 2, 2) }), stripeM = TOON({ color: '#e2b420' });
  const X0 = -(FW + GAP / 2), X1 = GAP / 2, L0 = -9, L1 = 3;   // levels below and above level 0 (the camera's)
  for (let L = L0; L <= L1; L++) { const y0 = L * SH, g = new THREE.Group(); g.position.y = y0; sc.add(g);
    bx(g, 2 * FW + GAP, 0.2, 1.5, cM, 0, -0.1, 0.75); bx(g, 2 * FW + GAP, 0.2, 1.4, cM, 0, -SH / 2 - 0.1, -RUN - 0.7);       // landings
    for (let s = 0; s < 10; s++) {   // flight A: down from the floor landing toward -z; flight B: back up toward +z from the mid landing below
      const yA = -(s + 1) * RISE, zA = -(s + 0.5) * TREAD; bx(g, FW, RISE, TREAD, stepM, X0 + FW / 2, yA + RISE / 2, zA, { cast: false }); bx(g, FW, 0.02, 0.05, yel, X0 + FW / 2, yA + RISE + 0.004, zA + TREAD / 2 - 0.03, { cast: false });
      const yB = -SH / 2 - (s + 1) * RISE, zB = -RUN + (s + 0.5) * TREAD; bx(g, FW, RISE, TREAD, stepM, X1 + FW / 2, yB + RISE / 2, zB, { cast: false }); bx(g, FW, 0.02, 0.05, yel, X1 + FW / 2, yB + RISE + 0.004, zB - TREAD / 2 + 0.03, { cast: false }); }
    // soffits under the flights (slabs), so the stack reads solid
    const sA = bx(g, FW, 0.16, Math.hypot(RUN, SH / 2), cM, X0 + FW / 2, -SH / 4 - 0.28, -RUN / 2); sA.rotation.x = -Math.atan2(SH / 2, RUN);
    const sB = bx(g, FW, 0.16, Math.hypot(RUN, SH / 2), cM, X1 + FW / 2, -SH / 2 - SH / 4 - 0.28, -RUN / 2); sB.rotation.x = Math.atan2(SH / 2, RUN);
    // rails along the gap (both flights) and wall rails
    [[X0 + FW - 0.02, 0, 0, -SH / 2, -RUN], [X1 + 0.02, -SH / 2, -RUN, -SH, 0]].forEach(([x, ya, za, yb, zb], ri) => { if ((85 + L === 78 && ri === 0) || (85 + L === 79 && ri === 1)) return; const a = new THREE.Vector3(x, ya + 0.9, za), b = new THREE.Vector3(x, yb + 0.9, zb), L_ = a.distanceTo(b);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, L_, 10), railM); r.position.copy(a).add(b).multiplyScalar(0.5); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); r.castShadow = true; g.add(r);
      });
    // walls of the shaft (the three sides; the camera side stays open), the floor door and its stencil number
    bx(g, 0.2, SH, RUN + 3.0, wallM, -(FW + GAP / 2) - 0.1, -SH / 2, -RUN / 2 + 0.05); bx(g, 0.2, SH, RUN + 3.0, wallM, FW + GAP / 2 + 0.1, -SH / 2, -RUN / 2 + 0.05);
    bx(g, 2 * FW + GAP + 0.4, SH, 0.2, wallM, 0, -SH / 2, -RUN - 1.5);
    // the yellow guide line on the outer walls, parallel to each flight
    [[-(FW + GAP / 2) + 0.005, 0, -SH / 2, 0, -RUN], [FW + GAP / 2 - 0.005, -SH / 2, -SH, -RUN, 0]].forEach(([x, ya, yb, za, zb]) => { const a = new THREE.Vector3(x, ya + 1.0, za), b = new THREE.Vector3(x, yb + 1.0, zb), L_ = a.distanceTo(b);
      const ln = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, L_), stripeM); ln.position.copy(a).add(b).multiplyScalar(0.5); g.add(ln); ln.lookAt(ln.localToWorld(new THREE.Vector3()).add(b.clone().sub(a))); });
    if (85 + L !== 78) bx(g, 2 * FW + GAP + 0.4, SH, 0.2, wallM, 0, SH / 2, 1.55);
    else {   // the 78 door: a wall with an opening, a steel frame, a door on a hinge with a push bar and its "78" plaque, the lobby's light behind it
      const dx0 = X0 + 0.65 - 0.475, dx1 = X0 + 0.65 + 0.475, wl = -(2 * FW + GAP + 0.4) / 2, wr = -wl, fM = TOON({ color: '#6a6e72', roughness: 0.5 }), dM = TOON({ color: '#8a2a22', roughness: 0.6 }), st_ = TOON({ color: '#c8ccd0', roughness: 0.3 });
      bx(g, dx0 - wl, SH, 0.2, wallM, (wl + dx0) / 2, SH / 2, 1.55); bx(g, wr - dx1, SH, 0.2, wallM, (dx1 + wr) / 2, SH / 2, 1.55); bx(g, dx1 - dx0, SH - 2.12, 0.2, wallM, (dx0 + dx1) / 2, (SH + 2.12) / 2, 1.55);
      [dx0 - 0.03, dx1 + 0.03].forEach((x) => bx(g, 0.06, 2.18, 0.26, fM, x, 1.09, 1.52)); bx(g, dx1 - dx0 + 0.12, 0.06, 0.26, fM, (dx0 + dx1) / 2, 2.15, 1.52);
      const hinge = new THREE.Group(); hinge.position.set(dx0, 0, 1.44); g.add(hinge); S.door78 = hinge;
      bx(hinge, 0.95, 2.1, 0.05, dM, 0.475, 1.05, 0); const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 12).rotateZ(Math.PI / 2), st_); bar.position.set(0.5, 1.0, -0.07); bar.castShadow = true; hinge.add(bar);
      [0.18, 0.82].forEach((u) => bx(hinge, 0.04, 0.06, 0.06, st_, u * 0.95, 1.0, -0.045)); bx(hinge, 0.05, 0.3, 0.02, st_, 0.88, 1.0, -0.03);
      textPlane(hinge, ['78'], 0.24, 0.18, 0.475, 1.6, -0.03, { bg: '#f4f2ea', fg: '#1a1a1a', ry: Math.PI, size: 0.9, glow: 0.1 });
      const lt = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.1), glowMat('#fff3dc')); lt.position.set((dx0 + dx1) / 2, 1.05, 1.66); lt.rotation.y = Math.PI; lt.userData.noInk = true; g.add(lt);
      const pl = new THREE.PointLight(0xfff0d8, 0, 6); pl.position.set((dx0 + dx1) / 2, 1.6, 1.2); g.add(pl); S.door78L = pl; }
    const fl = 85 + L; if (fl === 78) textPlane(g, ['SKY LOBBY'], 0.9, 0.28, X1 + FW - 0.5, 2.3, 1.44, { bg: '#1e2226', fg: '#f4f2ea', size: 0.7, ry: Math.PI, glow: 0.3 }); textPlane(g, [String(fl)], 0.62, 0.5, X1 + FW - 0.35, 1.7, 1.44, { bg: '#b8b4aa', fg: '#141414', size: 0.95, ry: Math.PI, glow: 0.05 });
    textPlane(g, ['ESCALERA A', 'PISO ' + fl], 0.5, 0.26, fl === 78 ? X0 + 1.55 : X0 + 0.45, 1.55, 1.44, { bg: '#f4f2ea', fg: '#1a1a1a', size: 0.62, ry: Math.PI, glow: 0.1 });
    if (85 + L !== 78) bx(g, 0.95, 2.1, 0.06, TOON({ color: '#7a1e1e' }), X0 + 0.65, 1.05, 1.42);
    // wall lamps (caged fluorescent) on the landings
    [[0, 2.6, 1.42], [0, -SH / 2 + 2.4, -RUN - 1.38]].forEach(([x, y, z]) => { const lm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), glowMat('#fffbea')); lm.position.set(x, y, z); lm.userData.noInk = true; g.add(lm); const pl = new THREE.PointLight(0xfff6e0, 0.45, 7); pl.position.set(x, y - 0.3, z + (z > 0 ? -0.5 : 0.5)); g.add(pl); }); }
  // the people going down: Diego just ahead, a column of others on the flights below (seeded)
  S.D = makeDiego(); sc.add(S.D.root);
  const R = RNG('stairppl'); S.ppl = []; for (let k = 0; k < 9; k++) { const P = R.f() < 0.45 ? officeWoman(R, { hair: R.pick(['#2a1d16', '#3a2618', '#4a3020', '#1a1a1a', '#6a4a30']) }) : officeMan(R); sc.add(P.root); S.ppl.push({ P, k, ph: R.r(0, TAU), side: R.f() < 0.5 ? -1 : 1 }); }
  return S; }); }
// a point on the descent path: u = metres walked down from level 0's floor landing (flight A, mid landing, flight B, next landing …)
function stairPath(u) { const segL = [RUN, 1.6, RUN, 1.6], X0 = -(FW + GAP / 2) + FW * 0.62, X1 = GAP / 2 + FW * 0.62; let L = 0, d = u;
  while (d < 0) { d += segL.reduce((a, b) => a + b, 0); L--; }
  for (;;) { for (let i = 0; i < 4; i++) { if (d <= segL[i]) { const k = d / segL[i], y0 = -L * SH;
        if (i === 0) return { x: X0, y: y0 - k * SH / 2, z: -k * RUN, yaw: Math.PI };
        if (i === 1) return { x: lerp(X0, X1, k), y: y0 - SH / 2, z: -RUN - 0.7, yaw: Math.PI / 2 };
        if (i === 2) return { x: X1, y: y0 - SH / 2 - k * SH / 2, z: -RUN + k * RUN, yaw: 0 };
        return { x: lerp(X1, X0, k), y: y0 - SH, z: 0.7, yaw: -Math.PI / 2 }; } d -= segL[i]; } L++; } }

// =========================== SET 3: the sky lobby, floor 78 ===========================
function stLobby() { return once('lobby', () => {
  const st = makeStage({ fov: 58, far: 3000, skyTop: '#5a8ed6', skyHor: '#e2ecf4', fog: '#e8ecf0', fogNear: 30, fogFar: 600, sky: 0xf4f6fa, ground: 0xc8bca8, hemi: 1.35, key: 1.2, keyCol: 0xfff6ea, box: 24, boxFar: 120 });
  st.setSun(dirV(-60 * DEG, 52 * DEG), new THREE.Vector3(0, 0, -2)); const S = { st }, sc = st.scene, HT = 6.4;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(44, 30).rotateX(-Math.PI / 2), TOON({ map: texStone(), roughness: 0.45, color: '#ffffff' })); fl.receiveShadow = true; fl.position.z = -2; sc.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(44, 30).rotateX(Math.PI / 2), TOON({ map: wrap(texCeiling(), 36, 25) })); ce.position.set(0, HT, -2); sc.add(ce);
  for (let x = -20; x <= 20; x += 2.6) for (let z = -15; z <= 10; z += 2.6) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18).rotateX(Math.PI / 2), glowMat('#fffbef')); d.position.set(x, HT - 0.01, z); d.userData.noInk = true; sc.add(d); }
  // the elevator wall (back, z = -14): steel doors in a marble surround, the sign above
  const wallM = TOON({ color: '#e8e2d6' }), marb = TOON({ map: wrap(texStone(), 3, 2) }), steel = TOON({ color: '#b4bcc4' }), dark = TOON({ color: '#3a3430' });
  bx(sc, 44, HT, 0.4, wallM, 0, HT / 2, -14.2); bx(sc, 30, 3.4, 0.2, marb, 0, 1.7, -13.95);
  S.carT = g3Tex((x, w, h) => { x.fillStyle = '#6a4228'; x.fillRect(0, 0, w, h); x.fillStyle = '#7e5232'; x.fillRect(w * 0.18, h * 0.08, w * 0.64, h * 0.8); x.fillStyle = '#fff4dc'; x.fillRect(w * 0.2, 0, w * 0.6, h * 0.05); x.fillStyle = '#3a3430'; x.fillRect(0, h * 0.88, w, h * 0.12); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(40,20,10,0.4)'; x.fillRect(w * (0.2 + i * 0.12), h * 0.08, 2, h * 0.8); } }, 128, 256);
  for (let k = 0; k < 8; k++) { const x = -12.25 + k * 3.5; if (k === 3) { const cp = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), new THREE.MeshBasicMaterial({ map: S.carT, toneMapped: false })); cp.position.set(x, 1.25, -13.84); sc.add(cp); S.openDoor = bx(sc, 1.5, 2.5, 0.1, steel, x, 1.25, -13.8); S.openX = x; continue; } bx(sc, 1.5, 2.5, 0.1, steel, x, 1.25, -13.82); bx(sc, 0.02, 2.5, 0.12, dark, x, 1.25, -13.8); bx(sc, 1.8, 0.12, 0.14, dark, x, 2.56, -13.82);
    const ind = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), indMat(['▲ 81', '▼ 90', '▲ 79', '78', '▲ 85', '▼ 93', '▲ 88', '▼ 99'][k])); ind.position.set(x, 2.85, -13.83); ind.userData.noInk = true; sc.add(ind); bx(sc, 0.12, 0.22, 0.04, steel, x + 1.0, 1.15, -13.85); }
  bx(sc, 30, 0.9, 0.06, TOON({ color: '#26231f' }), 0, 3.9, -13.8); textPlane(sc, ['ASCENSORES 79–100  ▲'], 9.5, 0.85, 2.6, 3.9, -13.76, { bg: '#26231f', fg: '#f4efe4', size: 0.66, glow: 0.5 });
  textPlane(sc, ['78'], 1.6, 1.6, 15.2, 3.4, -13.98, { bg: '#e8e2d6', fg: '#1a1a1a', size: 1.0, glow: 0.05 });
  // the window wall (left, x = -21): WTC bays onto the bright sky; side wall right with a stair door "ESCALERA A"
  for (let z = -14; z < 10; z += BAY) bx(sc, 0.62, HT, COLW, wallM, -21.6, HT / 2, z);
  bx(sc, 0.6, 0.5, 26, wallM, -21.6, 0.25, -2); bx(sc, 0.6, 1.2, 26, wallM, -21.6, HT - 0.6, -2);
  bx(sc, 0.4, HT, 26, wallM, 21.6, HT / 2, -2); textPlane(sc, ['ESCALERA A'], 2.2, 0.4, 21.38, 2.6, -6, { bg: '#f4f2ea', fg: '#1a1a1a', ry: -Math.PI / 2, size: 0.7 });
  // the city seen through the windows (far, hazed): blocks below the sill line
  { const R = RNG('lobcity'), im = IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), TOON({ color: '#c8c4bc' }), 300); for (let i = 0; i < 300; i++) im.setMatrixAt(i, M4c(-120 - R.r(0, 900), -285, R.r(-600, 600), 0.5, R.r(20, 50), R.r(40, 240), R.r(20, 60))); im.castShadow = false; sc.add(im); }
  // the reception desk (wood), benches, a column pair, planters
  const wood = TOON({ color: '#7a4a2a' }); bx(sc, 7, 1.1, 1.2, wood, 6, 0.55, -8.5); bx(sc, 7.2, 0.06, 1.4, TOON({ color: '#3a2a1e' }), 6, 1.12, -8.5);
  [[-10, -4], [10, -1]].forEach(([x, z]) => bx(sc, 1.2, HT, 1.2, wallM, x, HT / 2, z));
  // the crowd (toon heroes): clusters waiting, some on phones, some looking up at the speakers
  const R = RNG('lobbyppl'); S.ppl = [];
  for (let k = 0; k < 82; k++) { const P = R.f() < 0.45 ? officeWoman(R, { hair: R.pick(['#2a1d16', '#4a3020', '#1a1a1a', '#3a2618', '#6a4a30']) }) : officeMan(R); sc.add(P.root);
    const q = { x: k < 20 ? R.r(2, 10) : k >= 70 ? R.r(-2.6, 3.2) : R.r(-14, 13), z: k < 20 ? R.r(-7.5, -4.5) : k < 46 ? R.r(-12.6, -7) : k >= 70 ? R.r(0.6, 3.4) : R.r(-7, 0.4), yaw: k >= 70 ? Math.PI + R.n(0.35) : R.r(-Math.PI, Math.PI), ph: R.r(0, TAU), fg: k >= 70, kind: R.pick(['idle', 'idle', 'idle', 'phone', 'arms', 'look']) };
    if (q.kind === 'phone') propPhone(P); S.ppl.push({ P, q }); }
  S.D = makeDiego(); sc.add(S.D.root);
  return S; }); }

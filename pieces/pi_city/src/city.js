// =====================================================================
//  CITY — the ring of buildings around the park: old domed blocks at the far end (each dome in 8 petals that burst
//  open, 28-30 s), brown-brick apartment blocks with water tanks along the sides, and behind them a dense skyline
//  (tan / brick / grey stone towers with setbacks, crowns and spires, a few slender glass towers) merged into ONE
//  mesh whose shader draws the windows and the warm haze. At 44-47.5 s the skyline is sucked up toward a point in the
//  sky (vertex bend: the higher, the more it is pulled in and stretched); the damage stays.
// =====================================================================
const CITY_T = new THREE.Vector3(0, 650, -520); // the point in the sky the towers are pulled toward
const CITY_PAL = {
  tan: ['#ab9c86', '#a09078', '#b4a690', '#9a8c78', '#a89a88'],
  brick: ['#76604f', '#6c5446', '#826a58', '#7a5e4e', '#86705e'],
  grey: ['#99968f', '#8e8b86', '#a5a29b', '#86837e'],
  pale: ['#b4b8ba', '#a6adb2', '#bfc1c0'],
};
// merge parts into one non-indexed geometry with per-part colour (linear), base/bend (aB) and window style (aW)
function cityMerge(P) {
  let n = 0; const gs = P.map((p) => { const g = p.g.index ? p.g.toNonIndexed() : p.g; n += g.attributes.position.count; return g; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), aB = new Float32Array(n * 4), aW = new Float32Array(n * 4); let o = 0;
  gs.forEach((g, i) => { const p = P[i], c = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    for (let j = 0; j < c; j++) { col.set(p.c, (o + j) * 3); aB.set(p.b, (o + j) * 4); aW.set(p.w, (o + j) * 4); } o += c; g.dispose(); });
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  G.setAttribute('color', new THREE.BufferAttribute(col, 3)); G.setAttribute('aB', new THREE.BufferAttribute(aB, 4)); G.setAttribute('aW', new THREE.BufferAttribute(aW, 4)); return G; }
// the skyline material: windows from the (unbent) world position, the suck-up bend in the vertex shader, warm haze
function cityMat(U) { const m = STDm({ vertexColors: true, roughness: 0.82, metalness: 0.05, fog: false }); m.extensions = { derivatives: true };
  m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
    sh.vertexShader = `attribute vec4 aB; attribute vec4 aW; uniform float uSuck; uniform vec3 uT; varying vec3 vWp; varying vec3 vWn; varying vec4 vB; varying vec4 vW;
vec3 cityBend(vec3 p) { float s = uSuck * aB.w; if (s <= 0.0) return p; float h = max(p.y, 0.0), u = clamp(h / uT.y, 0.0, 1.0);
  float k = min(s * (0.12 * u + 2.6 * u * u), 0.93); vec2 b = aB.xy;
  p.xz -= (p.xz - b) * min(s * 0.9 * u, 0.6);      // the section thins as it is pulled up
  p.xz += (uT.xz - b) * k;                          // and bends toward the point (the higher, the more)
  p.y += s * h * (0.1 + 1.1 * u);                   // and stretches upward
  return p; }\n` + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vWp = position; vWn = normal; vB = aB; vW = aW;')
      .replace('#include <project_vertex>', 'vec4 mvPosition = modelViewMatrix * vec4(cityBend(transformed), 1.0); gl_Position = projectionMatrix * mvPosition;');
    sh.fragmentShader = `uniform vec3 uHaze; varying vec3 vWp; varying vec3 vWn; varying vec4 vB; varying vec4 vW;
float cityI(float t, float a, float b) { return floor(t) * (b - a) + clamp(fract(t), a, b) - a; }
float cityP(float x, float a, float b, float fw) { fw = max(fw, 1e-4); return (cityI(x + 0.5 * fw, a, b) - cityI(x - 0.5 * fw, a, b)) / fw; }\n` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      { float sty = vW.x; vec3 base = diffuseColor.rgb;
        if (sty < 3.5 && abs(vWn.y) < 0.5) { float u = abs(vWn.x) > 0.5 ? vWp.z : vWp.x; vec2 q = vec2(u / vW.y, vWp.y / vW.z), fw = fwidth(q) * 1.2;
          vec4 A = sty < 0.5 ? vec4(0.26, 0.74, 0.3, 0.8) : sty < 1.5 ? vec4(0.3, 0.7, 0.28, 0.76) : sty < 2.5 ? vec4(0.04, 0.96, 0.16, 0.84) : vec4(0.24, 0.76, 0.0, 1.0);
          float wx = cityP(q.x, A.x, A.y, fw.x), wy = cityP(q.y, A.z, A.w, fw.y), win = sty > 2.5 ? wx * (0.7 + 0.3 * cityP(q.y, 0.14, 0.86, fw.y)) : wx * wy;
          float h = fract(sin(dot(floor(q) + vB.z, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 gl = sty > 1.5 && sty < 2.5 ? vec3(0.13, 0.16, 0.2) + 0.1 * h : vec3(0.055, 0.058, 0.065) + 0.05 * h; gl += step(0.93, h) * vec3(0.12, 0.13, 0.15);
          diffuseColor.rgb = mix(base, gl, win * vW.w * step(4.5, vWp.y)) * (1.0 - 0.1 * cityP(q.y, 0.0, 0.07, fw.y));
          diffuseColor.rgb *= 0.86 + 0.14 * smoothstep(0.0, 60.0, vWp.y); }
        else if (vWn.y > 0.5) diffuseColor.rgb *= 0.7; }`)
      .replace('#include <fog_fragment>', `{ float d = length(vWp - cameraPosition); float hz = 1.0 - exp(-max(d - 60.0, 0.0) / 460.0);
        hz += (1.0 - smoothstep(0.0, 70.0, vWp.y)) * 0.32 * smoothstep(150.0, 420.0, d); gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, clamp(hz, 0.0, 0.88)); }`); };
  return m; }
// one tower (kind: deco | slab | slim | mid) as parts pushed into P
function cityTower(P, R, x, z, kind, hm, seed) {
  const pal = kind === 'slim' ? (R.f() < 0.6 ? CITY_PAL.pale : CITY_PAL.grey) : kind === 'mid' ? (R.f() < 0.7 ? CITY_PAL.brick : CITY_PAL.tan) : kind === 'deco' ? (R.f() < 0.55 ? CITY_PAL.grey : CITY_PAL.tan) : (R.f() < 0.5 ? CITY_PAL.brick : CITY_PAL.tan);
  const col = lin(R.pick(pal)).multiplyScalar(R.r(0.88, 1.08)), lite = col.clone().lerp(lin('#d8ccb8'), 0.35), dark = col.clone().multiplyScalar(0.62), wood = lin('#5a4030');
  const sty = kind === 'slim' ? 2 : kind === 'deco' ? (R.f() < 0.6 ? 3 : 0) : pal === CITY_PAL.brick ? 1 : 0, bw = sty === 2 ? R.r(1.4, 2) : sty === 1 ? R.r(2.2, 2.7) : R.r(2.4, 3.0), fh = sty === 2 ? R.r(3.6, 4.2) : R.r(3.2, 3.6), gw = R.r(0.8, 0.95);
  const put = (g, c, s = sty) => P.push({ g, c: [c.r, c.g, c.b], b: [x, z, seed % 97, 1], w: [s, bw, fh, gw] });
  const B = (w, d, y0, h, c = col, s) => put(new THREE.BoxGeometry(w, h, d).translate(x, y0 + h / 2, z), c, s);
  const tank = (ox, oz, y) => { B(1.2, 1.2, y, 1.4, dark, 5); put(new THREE.CylinderGeometry(2.1, 2.1, 4.2, 10).translate(x + ox, y + 3.5, z + oz), wood, 5); put(new THREE.ConeGeometry(2.3, 1.6, 10).translate(x + ox, y + 6.4, z + oz), wood, 5); };
  const pyr = (w, d, y0, h, c) => put(new THREE.CylinderGeometry(0.02, w * 0.7071, h, 4, 1).rotateY(Math.PI / 4).scale(1, 1, d / w).translate(x, y0 + h / 2, z), c, 5);
  const spire = (y0, h, r = 1.2) => put(new THREE.CylinderGeometry(0.15, r, h, 6).translate(x, y0 + h / 2, z), lite, 5);
  if (kind === 'mid') { const W = R.r(30, 58), D = R.r(24, 42), H = R.r(34, 86) * hm; B(W, D, 0, H); B(W + 1.4, D + 1.4, H, 1.3, lite, 5); const nt = 1 + (R.f() < 0.5); for (let i = 0; i < nt; i++) tank(R.n(W * 0.3), R.n(D * 0.3), H + 1.3); if (R.f() < 0.5) B(W * 0.3, D * 0.3, H + 1.3, 3.5, dark, 5); return H; }
  if (kind === 'slab') { const W = R.r(30, 48), D = R.r(22, 36), H = R.r(90, 185) * hm, h1 = H * R.r(0.7, 0.82); B(W, D, 0, h1); B(W + 1, D + 1, h1, 1.2, lite, 5); B(W * 0.78, D * 0.8, h1 + 1.2, H - h1); B(W * 0.78 + 1.6, D * 0.8 + 1.6, H + 1.2, 1.6, lite, 5);
    if (R.f() < 0.6) tank(R.n(W * 0.2), R.n(D * 0.2), H + 2.8); else B(W * 0.4, D * 0.4, H + 2.8, 5, dark, 5); return H; }
  if (kind === 'slim') { const W = R.r(15, 22), H = R.r(220, 320) * hm; B(W, W * R.r(0.8, 1), 0, H * 0.93); B(W * 0.86, W * 0.8, H * 0.93, H * 0.07, dark, 5); if (R.f() < 0.4) spire(H, H * 0.12, 0.8); return H; }
  // deco: base, wedding-cake tiers with ledges, a crown (pyramid or steps) and maybe a spire
  const H = R.r(130, 260) * hm, h0 = H * R.r(0.38, 0.52), cH = H * 0.1, nT = 3 + (R.f() < 0.5); let w = R.r(32, 50), d = w * R.r(0.72, 1), y = 0;
  B(w, d, 0, h0); y = h0; for (let i = 0; i < nT; i++) { B(w + 1.2, d + 1.2, y, 1.0, lite, 5); y += 1; w *= R.r(0.74, 0.84); d *= R.r(0.74, 0.84); const hT = (H - h0 - cH) / nT * R.r(0.8, 1.2); B(w, d, y, hT); y += hT; }
  if (R.f() < 0.5) pyr(w, d, y, cH * 1.4, R.f() < 0.4 ? lin('#6a8a7c') : lite); else { let s = 1; for (let i = 0; i < 3; i++) { s *= 0.72; B(w * s, d * s, y, cH * 0.35, i === 2 ? lite : col, 5); y += cH * 0.35; } }
  if (R.f() < 0.55) spire(y, H * R.r(0.12, 0.22)); return H; }
function buildCity(st, S, R) {
  const Rc = RNG('city');
  // the old blocks at the far end (stone and brick, no shutters); every other one carries a dome
  S.domes = []; S.blocks = []; const ow = ['#b09a7c', '#9a7462', '#bcaa90', '#8c6a58', '#b4a088', '#866656']; let k = 0;
  for (let x = -140; x <= 140; x += 22) { const z = -175 - Rc.r(0, 20), w = Rc.r(16, 21), fl = 4 + Math.floor(Rc.f() * 3);
    const g = building(st, x, z, w, 16, 0, 700 + k, ow[k % 6], fl, Math.max(3, Math.round(w / 3.4)), { gH: 5, lit: 0.05, roofCol: '#6a4a3a', noShut: true }); const h = 5 + fl * 3.4 + 0.9; S.blocks.push({ g, s: x < 0 ? 1 : -1, a: Rc.r(0.6, 1.2) });
    if (k % 2 === 0) { const d = new THREE.Group(); d.position.set(0, h + 0.2, 0); g.add(d); d.add(mesh(new THREE.CylinderGeometry(3.2, 3.4, 2.4, 24), stoneM('drum', '#cbbba0'), 0, 1.2, 0)); d.scale.setScalar(1.5); const pet = []; const dm = STDm({ color: k % 4 ? '#5a8a80' : '#c8a050', metalness: 0.5, roughness: 0.4 });
      for (let q = 0; q < 8; q++) { const pg = new THREE.Group(); pg.position.y = 2.4; pg.rotation.y = q / 8 * TAU; d.add(pg); const pm = mesh(new THREE.SphereGeometry(3.2, 8, 10, -TAU / 16, TAU / 8, 0, Math.PI / 2), dm, 0, 0, 0); pg.add(pm); pet.push(pg); } d.add(mesh(new THREE.ConeGeometry(0.25, 1.6, 8), GOLD(), 0, 6.2, 0)); S.domes.push({ d, pet, ts: 28.3 + (S.domes.length % 3) * 0.2 }); }
    k++; }
  // brown-brick apartment blocks along both sides of the park, flat roofs with water tanks
  { const tg = new THREE.CylinderGeometry(2, 2, 4, 10).translate(0, 3.4, 0), tc = new THREE.ConeGeometry(2.2, 1.5, 10).translate(0, 6.15, 0), tl = new THREE.BoxGeometry(1.2, 1.4, 1.2).translate(0, 0.7, 0), wood = STDm({ color: '#5a4030', roughness: 0.9 }), br = ['#7e6050', '#8a6e5a', '#745a4a', '#947a66', '#a08e7a'];
    [-1, 1].forEach((s) => { for (let z = 0; z > -160; z -= 24) { const fl = 7 + Math.floor(Rc.f() * 4), g = building(st, s * Rc.r(95, 110), z, 20, 16, s > 0 ? -Math.PI / 2 : Math.PI / 2, 800 + k++, br[k % 5], fl, 5, { gH: 5, lit: 0.05, noShut: true, roof: false }); S.blocks.push({ g, s: -s, a: Rc.r(0.3, 0.6) });
      const h = 5 + fl * 3.4 + 0.9 + 0.3; for (let i = 0; i < 1 + (Rc.f() < 0.5); i++) { const tk = new THREE.Group(); tk.position.set(Rc.n(6), h, Rc.r(-5, 3)); g.add(tk); [tg, tc, tl].forEach((gg) => tk.add(mesh(gg, wood))); } } }); }
  // the skyline: one merged mesh of towers (far end + both sides), a few landmarks in the middle
  const P = [], U = { uSuck: { value: 0 }, uT: { value: CITY_T }, uHaze: { value: new THREE.Vector3(0.8, 0.77, 0.72) } }; let n = 0;
  const kindAt = (x, z, near) => { const f = Rc.f(); if (near) return f < 0.7 ? 'mid' : 'slab'; return f < 0.22 ? 'slim' : f < 0.6 ? 'deco' : f < 0.86 ? 'slab' : 'mid'; };
  for (let gx = -440; gx <= 440; gx += 50) for (let gz = -235; gz >= -900; gz -= gz > -300 ? 50 : 48) { if (Rc.f() < (gz > -300 ? 0.15 : 0.32)) continue; const x = gx + Rc.n(12), z = gz + Rc.n(12), near = gz > -300;
    if (Math.abs(x + 35) < 40 && Math.abs(z + 520) < 40) continue; if (Math.abs(x - 70) < 30 && Math.abs(z + 430) < 30) continue;
    const hm = near ? 0.7 : 0.62 + 0.42 * Math.exp(-((x / 220) ** 2)); cityTower(P, Rc, x, z, kindAt(x, z, near), hm, n++); }
  [-1, 1].forEach((s) => { for (let gx = 150; gx <= 470; gx += 52) for (let gz = 60; gz >= -230; gz -= 52) { if (gz < -70 && gz > -160) continue; if (Rc.f() < 0.15) continue;
    const x = s * (gx + Rc.n(12)), z = gz + Rc.n(12), near = gx < 210; cityTower(P, Rc, x, z, kindAt(x, z, near), near ? 0.8 : 1, n++); } });
  // landmarks: a stepped stone giant with a mast, a silver-crowned deco tower, two slender supertalls
  { const put = (g, c, x, z, s, bw = 3.2, fh = 3.6) => P.push({ g, c: [c.r, c.g, c.b], b: [x, z, 11, 1], w: [s, bw, fh, 0.9] }); const ES = lin('#aea592'), x = -35, z = -520;
    [[62, 46, 0, 26], [44, 34, 26, 150], [38, 29, 176, 18], [32, 24, 194, 14], [24, 18, 208, 12]].forEach(([w, d, y, h]) => { put(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z), ES, 3); put(new THREE.BoxGeometry(w + 1.2, 1, d + 1.2).translate(x, y + h, z), ES.clone().lerp(lin('#e0d6c4'), 0.4), 5); });
    put(new THREE.CylinderGeometry(4, 6, 18, 8).translate(x, 229, z), ES, 5); put(new THREE.CylinderGeometry(0.4, 1.6, 70, 6).translate(x, 273, z), lin('#c8c4bc'), 5);
    const CH = lin('#9c988f'), cx = 70, cz = -430; put(new THREE.BoxGeometry(46, 60, 40).translate(cx, 30, cz), CH, 3); put(new THREE.BoxGeometry(34, 140, 34).translate(cx, 130, cz), CH, 3);
    for (let i = 0; i < 6; i++) { const r = 24 * (1 - i * 0.15), y = 200 + i * 9; put(new THREE.CylinderGeometry(r * 0.55, r * 0.72, 9, 8).rotateY(Math.PI / 8).translate(cx, y + 4.5, cz), lin('#c4c4c0'), 5); }
    put(new THREE.CylinderGeometry(0.2, 1.5, 60, 6).translate(cx, 284, cz), lin('#d0d0cc'), 5);
    [[-130, -380, 330, 18], [160, -610, 300, 22], [-250, -660, 260, 20]].forEach(([sx, sz, H, w]) => { put(new THREE.BoxGeometry(w, H, w * 0.9).translate(sx, H / 2, sz), lin('#a4aab0'), 2, 1.6, 4); put(new THREE.BoxGeometry(w * 0.8, 10, w * 0.7).translate(sx, H + 5, sz), lin('#6a6e72'), 5); }); }
  const sky = new THREE.Mesh(cityMerge(P), cityMat(U)); sky.frustumCulled = false; sky.castShadow = false; sky.receiveShadow = false; st.scene.add(sky); S.towers = { mesh: sky, U };
  for (let i = 0; i < 375; i++) R.f(); // keep the park's RNG stream as before (the crowd after this is placed from it)
}
function poseCity(S, t) {
  // domes can't close: they burst open like petals
  S.domes.forEach((d) => { const k = ss(d.ts, d.ts + 1.2, t); d.pet.forEach((pg, q) => { pg.rotation.order = 'YXZ'; pg.rotation.x = -1.9 * k * (0.8 + 0.2 * Math.sin(q * 2.3)); pg.position.y = 2.4 + 1.2 * k; }); });
  // the planet: the ground has too much length — the skyline is sucked up toward a point in the sky (and stays bent)
  { const k = ss(44.1, 47.5, t), wob = k * (1 - ss(47, 48.5, t)) * 0.04 * Math.sin(t * 7); S.towers.U.uSuck.value = k * (1 + wob);
    S.blocks.forEach((b) => { b.g.rotation.order = 'ZYX'; b.g.rotation.z = -b.s * 0.05 * b.a * k; if (Math.abs(b.g.rotation.y) < 0.1) b.g.rotation.x = -0.02 * b.a * k; }); }
}


// =====================================================================
//  DESERT — one day under two suns, seen from a ranch porch (camera at the origin, 3.2 m up on the porch).
//  Az: 0 = north (-z), 90 = east (+x), 180 = south (+z), 270 = west (-x).
//  Sun B (big, white) rises 7:05, sets 17:05; sun A (small, orange) rises earlier and sets later; at 12:57 A slides across B.
// =====================================================================
const DAYK = [[0, 5.95], [8, 6.6], [14, 7.0], [20, 7.55], [26, 9.6], [34, 12.25], [40, 12.97], [46, 14.4], [52, 16.35], [58, 17.07], [64, 17.5], [68, 17.85], [76, 18.2]];
const hourAt = (t) => { for (let i = 0; i < DAYK.length - 1; i++) if (t <= DAYK[i + 1][0]) { const [t0, h0] = DAYK[i], [t1, h1] = DAYK[i + 1]; return lerp(h0, h1, (t - t0) / (t1 - t0)); } return DAYK[DAYK.length - 1][1]; };
const H_ECL = 12.97;
function sunsAt(h) { const u = (h - 7.05) / 10, elB = 64 * Math.sin(Math.PI * u), azB = lerp(100, 262, u), d = h - H_ECL;
  const elA = elB + 3.2 * Math.sqrt(d * d + 0.0004) - 0.06, azA = azB - 3.6 * d / (1 + 0.05 * Math.abs(d));
  const B = dirV(azB * DEG, elB * DEG), A = dirV(azA * DEG, elA * DEG), sep = Math.acos(clamp(A.dot(B), -1, 1));
  return { A, B, elA, elB, azA, azB, sep, ecl: 1 - ss(0.006, 0.05, sep) }; }
const SKYU = { A: { value: new THREE.Vector3() }, B: { value: new THREE.Vector3() }, uT: { value: 0 }, dim: { value: 1 } };
function sandTex() { return g3Tex((x, w) => { const R = RNG('sand'); x.fillStyle = '#c8956a'; x.fillRect(0, 0, w, w); for (let k = 0; k < 80; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 90), R.pick(['rgba(150,100,60,0.3)', 'rgba(220,170,120,0.3)', 'rgba(170,110,70,0.25)']));
  speck(x, w, w, 60000, ['rgba(90,55,30,0.35)', 'rgba(240,200,150,0.35)', 'rgba(130,85,50,0.3)'], R, 1, 2); for (let k = 0; k < 160; k++) { x.strokeStyle = 'rgba(120,75,40,0.18)'; x.lineWidth = R.r(1, 2); x.beginPath(); const y = R.r(0, w); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + R.n(8), w * 0.6, y + R.n(8), w, y + R.n(6)); x.stroke(); } }, 512, 512); }
function rockStripeTex() { return g3Tex((x, w, h) => { const R = RNG('strata'); for (let y = 0; y < h; y += R.r(3, 12)) { const l = R.r(-25, 25), hh = R.r(3, 12); x.fillStyle = `rgb(${172 + l},${84 + l * 0.7},${52 + l * 0.5})`; x.fillRect(0, y, w, hh); } speck(x, w, h, 12000, ['rgba(60,30,20,0.25)', 'rgba(230,170,130,0.2)'], R, 1, 3);
  for (let k = 0; k < 60; k++) { x.strokeStyle = 'rgba(70,35,20,0.35)'; x.lineWidth = R.r(1, 3); x.beginPath(); const cx = R.r(0, w); x.moveTo(cx, 0); x.lineTo(cx + R.n(10), h); x.stroke(); } }, 256, 512); }
function buildDesert(st) {
  const R = RNG('desert'), S = { st };
  // the sky: a dome shader with two suns, a twilight gradient, stars, and fast cirrus streaks (time-lapse)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(30000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: SKYU,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 A, B; uniform float uT, dim; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * vn(p); p = p * 2.03 + 3.1; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float eA = A.y, eB = B.y, e = max(eA, eB);
  float day = smoothstep(-0.12, 0.3, e), tw = smoothstep(-0.2, 0.0, e) * (1.0 - smoothstep(0.05, 0.4, e));
  vec3 zen = mix(vec3(0.03, 0.04, 0.10), vec3(0.17, 0.38, 0.78), day), hor = mix(vec3(0.10, 0.07, 0.12), vec3(0.78, 0.86, 0.94), day);
  vec3 S = eB > eA ? B : A; float toward = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(S.x, 0.0, S.z))), 0.0), 3.0);
  hor = mix(hor, vec3(1.0, 0.55, 0.25), tw * (0.45 + 0.55 * toward)); zen = mix(zen, vec3(0.32, 0.22, 0.38), tw * 0.6);
  float hgt = clamp(d.y, 0.0, 1.0); vec3 col = mix(hor, zen, pow(hgt, 0.45));
  if (d.y < 0.0) col = mix(hor * 0.8, vec3(0.25, 0.15, 0.1), clamp(-d.y * 6.0, 0.0, 1.0));
  // stars
  vec2 sp = d.xz / (abs(d.y) + 0.2) * 220.0; float st_ = step(0.997, h2(floor(sp))) * (1.0 - smoothstep(-0.25, -0.05, e)) * step(0.0, d.y); col += vec3(st_);
  // cirrus streaks, lit by the suns
  if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.08); float c = fbm(vec2(cp.x * 0.55 + uT * 0.05, cp.y * 2.4 - uT * 0.02)) ; c = smoothstep(0.52, 0.8, c) * smoothstep(0.0, 0.15, d.y);
    vec3 lit = mix(vec3(1.0, 0.5, 0.35), vec3(1.0), day) * (0.35 + 0.75 * max(day, tw)); col = mix(col, lit, c * 0.75); }
  // the suns: B big and white, A small and orange; A passes in front of B at noon (darker core)
  float dB = acos(clamp(dot(d, B), -1.0, 1.0)), dA = acos(clamp(dot(d, A), -1.0, 1.0));
  vec3 cB = mix(vec3(1.0, 0.75, 0.45), vec3(1.0, 0.98, 0.94), smoothstep(-0.02, 0.25, eB)), cA = mix(vec3(1.0, 0.3, 0.08), vec3(1.0, 0.5, 0.18), smoothstep(-0.02, 0.25, eA));
  col += cB * (smoothstep(0.032, 0.026, dB) * 6.0 + exp(-dB * 14.0) * 0.45 + exp(-dB * 60.0) * 0.9) * smoothstep(-0.03, 0.0, eB) * dim;
  col += cA * (smoothstep(0.017, 0.013, dA) * 5.0 + exp(-dA * 22.0) * 0.6) * smoothstep(-0.03, 0.0, eA);
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); sky.renderOrder = -10; sky.frustumCulled = false; st.scene.add(sky); S.sky = sky;
  // the ground: sand with ripples and gentle swells
  const gG = new THREE.PlaneGeometry(9000, 9000, 220, 220).rotateX(-Math.PI / 2); { const p = gG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); p.setY(i, (Math.sin(x * 0.011) * Math.cos(z * 0.013) * 3 + Math.sin(x * 0.0031 + z * 0.002) * 8) * ss(60, 300, r)); } gG.computeVertexNormals(); }
  const sand = wrap(sandTex(), 900, 900), ground = new THREE.Mesh(gG, STDm({ map: sand, bumpMap: sand, bumpScale: 0.05, roughness: 0.95, color: '#e8c8a8' })); ground.receiveShadow = true; st.scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(5, 900).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('dirt', '#a87a52', ['rgba(80,50,30,0.35)', 'rgba(200,160,120,0.3)']), 2, 200), roughness: 1 })); road.position.set(14, 0.03, 440); road.rotation.y = 0.05; road.receiveShadow = true; st.scene.add(road);
  // mesas and buttes on the horizon (flat tops, sheer cliffs with strata), a few near ones
  const strata = rockStripeTex(); const mesaM = STDm({ map: wrap(strata, 6, 1), roughness: 0.95, color: '#e8b896' });
  const mesa = (x, z, w, d, h, seed) => { const Rm = RNG('mesa' + seed), sh = new THREE.Shape(), n = 14; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = 1 + Rm.n(0.14); (i ? sh.lineTo : sh.moveTo).call(sh, Math.cos(a) * w * rr, Math.sin(a) * d * rr); } sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, steps: 4 }); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 + 0.35 * (1 - y / h) ** 3; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, mesaM); m.position.set(x, -2, z); m.castShadow = m.receiveShadow = true; st.scene.add(m); };
  for (let i = 0; i < 46; i++) { const a = R.r(0, TAU), r = R.r(1300, 3800); if (Math.abs(Math.sin(a)) > 0.92 && r < 1700) continue; mesa(Math.sin(a) * r, -Math.cos(a) * r, R.r(60, 260), R.r(50, 160), R.r(60, 230), i); }
  [[30, 900, 0], [320, 1100, 0]].forEach(([az, r, h0], k) => mesa(Math.sin(az * DEG) * r, -Math.cos(az * DEG) * r, 50 + k * 15, 30, 90 + k * 20, 100 + k));
  // rocks, dry shrubs, saguaros
  const rockG = new THREE.DodecahedronGeometry(1, 1); { const p = rockG.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + 0.25 * Math.sin(i)), p.getY(i) * 0.6, p.getZ(i) * (1 + 0.2 * Math.cos(i * 1.3))); rockG.computeVertexNormals(); }
  const rocks = IM(rockG, STDm({ color: '#8a5a3a', roughness: 0.95 }), 2200); for (let i = 0; i < 2200; i++) { const a = R.r(0, TAU), r = 6 + R.f() ** 1.6 * 500, s = R.r(0.08, 0.6) * (1 + r / 400); rocks.setMatrixAt(i, M4c(Math.sin(a) * r, s * 0.15, -Math.cos(a) * r, R.r(0, 6), s, s, s)); rocks.setColorAt(i, lin(R.pick(['#ffffff', '#e0c8b0', '#c8a890', '#f0d8c0']))); } st.scene.add(rocks);
  const shrubs = IM(lumpyGeo(2, 0.4, 41), STDm({ map: leafTex('shrubT', '#6a6a3a'), roughness: 0.95 }), 1600); for (let i = 0; i < 1600; i++) { const a = R.r(0, TAU), r = 5 + R.f() ** 1.5 * 600, s = R.r(0.25, 0.7); shrubs.setMatrixAt(i, M4c(Math.sin(a) * r, s * 0.3, -Math.cos(a) * r, R.r(0, 6), s * 1.3, s * 0.8, s * 1.3)); shrubs.setColorAt(i, lin(R.pick(['#c8c090', '#a8a070', '#d8c8a0', '#9a9860']))); } st.scene.add(shrubs);
  const cact = STDm({ color: '#4a6a3a', roughness: 0.8, map: wrap(g3Tex((x, w) => { x.fillStyle = '#6a8a50'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(30,50,20,0.55)'; x.fillRect(i, 0, 3, w); } }, 64, 64), 2, 4) });
  const saguaro = (x, z, h, seed) => { const Rs = RNG('sag' + seed), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Rs.r(0, 6); st.scene.add(g); const r = h * 0.07;
    const tr = new THREE.Mesh(new THREE.CapsuleGeometry(r, h - 2 * r, 6, 14).translate(0, h / 2, 0), cact); tr.castShadow = true; g.add(tr);
    const arms = Rs.int ? Rs.int(0, 3) : Math.floor(Rs.f() * 4); for (let k = 0; k < arms; k++) { const s = k % 2 ? 1 : -1, y0 = h * Rs.r(0.35, 0.6), out = r * 2.6, up = h * Rs.r(0.18, 0.32), ar = r * 0.75;
      const a1 = new THREE.Mesh(new THREE.CapsuleGeometry(ar, out, 4, 10).rotateZ(Math.PI / 2).translate(s * out / 2, y0, 0), cact); const a2 = new THREE.Mesh(new THREE.CapsuleGeometry(ar, up, 4, 10).translate(s * out, y0 + up / 2, 0), cact); a1.castShadow = a2.castShadow = true; g.add(a1, a2); } };
  for (let i = 0; i < 70; i++) { const a = R.r(0, TAU), r = R.r(18, 320); saguaro(Math.sin(a) * r, -Math.cos(a) * r, R.r(4, 9), i); }
  // a wooden ranch fence running across the view, and a corral
  const wood = STDm({ color: '#6a4a32', roughness: 0.9, map: wrap(texNoise('fwood', '#7a5a3a', ['rgba(40,25,15,0.4)', 'rgba(150,110,80,0.3)']), 1, 4) });
  const fence = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 2.6), ang = Math.atan2(bz - az, bx - ax); for (let i = 0; i <= n; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.5, 6), wood); p.position.set(lerp(ax, bx, i / n), 0.75, lerp(az, bz, i / n)); p.rotation.z = R.n(0.04); p.castShadow = true; st.scene.add(p); }
    [0.55, 1.15].forEach((y) => { const r = new THREE.Mesh(new THREE.BoxGeometry(L, 0.1, 0.05), wood); r.position.set((ax + bx) / 2, y, (az + bz) / 2); r.rotation.y = -ang; r.castShadow = true; st.scene.add(r); }); };
  fence(10, -40, 26, 30); fence(26, 30, 8, 60); fence(-30, 22, 8, 60);
  // the windmill (left in the morning view): lattice tower, turning fan, tail vane
  { const wm = new THREE.Group(); wm.position.set(40, 0, -1.4); st.scene.add(wm); S.wm = wm; const steel = STDm({ color: '#4a4a4c', metalness: 0.6, roughness: 0.5 }), H = 11;
    for (const [x, z] of [[-1.3, -1.3], [1.3, -1.3], [1.3, 1.3], [-1.3, 1.3]]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, H * 1.02, 6), steel); leg.position.set(x * 0.55, H / 2, z * 0.55); leg.rotation.set(z * 0.1, 0, -x * 0.1); leg.castShadow = true; wm.add(leg); }
    for (let k = 1; k < 7; k++) { const y = k * H / 7, s = 1.3 * (1 - y / H * 0.82); [[0, s], [0, -s]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(2 * s, 0.04, 0.04), steel); b.position.set(0, y, z); wm.add(b); }); [[s, 0], [-s, 0]].forEach(([x]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2 * s), steel); b.position.set(x, y, 0); wm.add(b); }); }
    const head = new THREE.Group(); head.position.set(0, H + 0.4, 0); wm.add(head); const fan = new THREE.Group(); fan.position.set(-0.6, 0, 0); head.add(fan); S.fan = fan; const bladeM = STDm({ color: '#8a8a88', metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 18; k++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.6).translate(0, 1.05, 0), bladeM); b.rotation.set(k / 18 * TAU, 0.35, 0, 'XYZ'); b.rotateY(Math.PI / 2); fan.add(b); }
    fan.add(new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.03, 6, 36).rotateY(Math.PI / 2), steel)); fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12).rotateZ(Math.PI / 2), steel));
    const boom = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.06), steel); boom.position.set(1.3, 0, 0); head.add(boom); const vane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), bladeM); vane.position.set(2.6, 0.1, 0); vane.rotation.y = Math.PI / 2; head.add(vane); head.rotation.y = -0.6; }
  // the stock tank (round, corrugated) — the water reflects both suns; a trough pipe from the windmill
  { const tk = new THREE.Group(); tk.position.set(7.7, 0, 11.1); st.scene.add(tk); S.tank = tk; const corr = wrap(g3Tex((x, w) => { const gr = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 16; i++) gr.addColorStop(i / 16, i % 2 ? '#8a8e92' : '#c8ccd0'); x.fillStyle = gr; x.fillRect(0, 0, w, w); }, 256, 32), 10, 1);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.8, 64, 1, true), STDm({ map: corr, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide })); wall.position.y = 0.4; wall.castShadow = wall.receiveShadow = true; tk.add(wall);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.05, 6, 64).rotateX(Math.PI / 2), STDm({ color: '#9aa0a4', metalness: 0.8, roughness: 0.3 })); rim.position.y = 0.8; tk.add(rim);
    S.WU = { A: SKYU.A, B: SKYU.B, uT: SKYU.uT, dim: SKYU.dim };
    const wat = new THREE.Mesh(new THREE.CircleGeometry(3.35, 64).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: S.WU,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform vec3 A, B; uniform float uT, dim; varying vec3 vW; void main(){ vec2 p = vW.xz; vec3 n = normalize(vec3(0.012 * sin(p.x * 9.0 + uT * 2.0) + 0.008 * sin(p.y * 13.0 - uT * 3.0), 1.0, 0.012 * sin(p.y * 8.0 - uT * 1.7)));
        vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fr = 0.04 + 0.96 * pow(1.0 - max(dot(-V, n), 0.0), 5.0); float e = max(A.y, B.y), day = smoothstep(-0.12, 0.3, e);
        vec3 sky = mix(mix(vec3(0.1, 0.07, 0.12), vec3(0.75, 0.84, 0.94), day), mix(vec3(0.03, 0.04, 0.1), vec3(0.2, 0.42, 0.8), day), clamp(Rf.y * 1.5, 0.0, 1.0));
        vec3 col = mix(vec3(0.05, 0.08, 0.07), sky, clamp(fr + 0.35, 0.0, 1.0));
        col += vec3(1.0, 0.97, 0.9) * (pow(max(dot(Rf, B), 0.0), 900.0) * 30.0 + pow(max(dot(Rf, B), 0.0), 60.0) * 0.6) * step(0.0, B.y) * dim;
        col += vec3(1.0, 0.55, 0.25) * (pow(max(dot(Rf, A), 0.0), 1500.0) * 22.0 + pow(max(dot(Rf, A), 0.0), 90.0) * 0.4) * step(0.0, A.y);
        gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); wat.position.y = 0.68; tk.add(wat); }
  // the pickup truck by the tank
  { const pk = new THREE.Group(); pk.position.set(18, 0, 18); pk.rotation.y = 2.3; st.scene.add(pk); const paint = STDm({ color: '#6a8aa8', metalness: 0.4, roughness: 0.45 }), dark = STDm({ color: '#1a1a1c', roughness: 0.5 }), rust = STDm({ color: '#8a5a3a', roughness: 0.9 });
    pk.add(mesh(extrudeProfile([[-2.7, 0.55], [2.5, 0.55], [2.6, 1.05], [1.4, 1.15], [0.9, 1.75], [-0.3, 1.78], [-0.45, 1.15], [-2.7, 1.15]], 1.85, 0.08), paint)); pk.add(mesh(extrudeProfile([[1.25, 1.18], [0.85, 1.7], [-0.25, 1.72], [-0.35, 1.18]], 1.88, 0.02), STDm({ color: '#1a2430', metalness: 0.6, roughness: 0.1 })));
    pk.add(mesh(new THREE.BoxGeometry(2.1, 0.1, 1.7), rust, -1.6, 1.12, 0)); pk.add(mesh(new THREE.BoxGeometry(0.3, 0.3, 1.9), STDm({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 }), 2.62, 0.7, 0));
    for (const [x, z] of [[1.6, 0.9], [1.6, -0.9], [-1.8, 0.9], [-1.8, -0.9]]) { const w = buildWheel(0.42, 0.3, '#b8bcc2'); w.position.set(x, 0.42, z); if (z < 0) w.rotation.y = Math.PI; pk.add(w); } pk.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); }
  // the porch (you): a round deck around you with an arched railing on the outer half (east → south → west)
  { const pw = STDm({ color: '#5a3e2a', roughness: 0.85, map: wrap(texNoise('plank', '#6a4a32', ['rgba(30,20,10,0.45)', 'rgba(140,100,70,0.3)']), 4, 1) }), dk = STDm({ color: '#3a2618', roughness: 0.8 }); S.porch = new THREE.Group(); st.scene.add(S.porch);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.2, 48), pw); deck.position.set(0, 2.5, -0.55); deck.receiveShadow = deck.castShadow = true; S.porch.add(deck);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 2.5, 10).translate(0, 1.25, 0), dk); post.position.set(0, 0, -0.55); st.scene.add(post);
    const R0 = 2.35, a0 = 62, a1 = 298, n = 14; for (let i = 0; i <= n; i++) { const az = lerp(a0, a1, i / n) * DEG, x = Math.sin(az) * R0, z = -0.55 - Math.cos(az) * R0; const p = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.42, 0.11), dk); p.position.set(x, 2.81, z); p.rotation.y = -az; p.castShadow = true; S.porch.add(p);
      if (i < n) { const am = lerp(a0, a1, (i + 0.5) / n) * DEG, seg = 2 * R0 * Math.sin((a1 - a0) / n / 2 * DEG); const arc = new THREE.Mesh(new THREE.TorusGeometry(seg / 2, 0.035, 6, 20, Math.PI), dk); arc.position.set(Math.sin(am) * R0 * 0.99, 2.6, -0.55 - Math.cos(am) * R0 * 0.99); arc.rotation.y = Math.PI / 2 - am; arc.castShadow = true; S.porch.add(arc); } }
    const top = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.06, 6, 64, (a1 - a0) * DEG), dk); top.rotation.set(Math.PI / 2, 0, (a0 - 90) * DEG); top.position.set(0, 3.03, -0.55); top.castShadow = true; S.porch.add(top); }
  // two suns: two shadow-casting lights (B big white, A small orange)
  S.LB = st.key; S.LA = new THREE.DirectionalLight(0xff9050, 1); S.LA.castShadow = true; S.LA.shadow.mapSize.set(2048, 2048); S.LA.shadow.radius = 4; S.LA.shadow.bias = -0.0004; S.LA.shadow.normalBias = 0.03; Object.assign(S.LA.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 400 }); S.LA.shadow.camera.updateProjectionMatrix(); st.scene.add(S.LA, S.LA.target);
  // the rancher and the dog on the porch
  S.ranch = makePerson({ skin: SKINS[3], hair: HAIRS[1], hairStyle: 'short', top: '#a8463a', bottom: '#3a4a6a', seed: 81 }); st.scene.add(S.ranch.root);
  { const hatM = STDm({ color: '#c8a878', roughness: 0.9 }), hat = new THREE.Group(); hat.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.015, 24), hatM)); hat.add(mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 20).translate(0, 0.07, 0), hatM)); hat.add(mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.03, 20).translate(0, 0.02, 0), STDm({ color: '#3a2818' }))); hat.position.set(0, S.ranch.headR * 0.85, 0); S.ranch.head.add(hat); }
  S.dog = makePuppy(); S.dog.root.scale.setScalar(2.1); S.dog.root.position.set(1.6, 2.6, -0.4); S.dog.root.rotation.y = 0.6; st.scene.add(S.dog.root);
  return S; }
function poseDesert(S, t) { const st = S.st, h = hourAt(t), su = sunsAt(h), dim = 1 - 0.6 * su.ecl; SKYU.A.value.copy(su.A); SKYU.B.value.copy(su.B); SKYU.uT.value = t * 2.2; SKYU.dim.value = dim;
  const kB = ss(-2, 6, su.elB), kA = ss(-2, 6, su.elA), warmB = ss(2, 25, su.elB), warmA = ss(2, 25, su.elA);
  S.LB.intensity = 2.9 * kB * dim; S.LB.color.copy(lin('#ffb070').lerp(lin('#fff6ea'), warmB)); S.LA.intensity = 1.9 * kA * (1 - 0.3 * su.ecl); S.LA.color.copy(lin('#ff6a30').lerp(lin('#ffb070'), warmA));
  const tgt = new THREE.Vector3(8, 0, 4); [[S.LB, su.B], [S.LA, su.A]].forEach(([L, d]) => { L.target.position.copy(tgt); L.position.copy(d).multiplyScalar(150).add(tgt); L.target.updateMatrixWorld(); });
  const e = Math.max(su.elA, su.elB); st.hemi.intensity = 0.3 + 0.35 * ss(-8, 30, e) * (1 - 0.35 * su.ecl); st.hemi.color.copy(lin('#4a4a7a').lerp(lin('#bcd0e8'), ss(-4, 20, e))); st.hemi.groundColor.copy(lin('#6a3a24').lerp(lin('#a87a52'), ss(-4, 20, e)));
  if (st.scene.fog) st.scene.fog.color.copy(lin('#1a1420').lerp(lin('#f08a50'), ss(-6, 3, e) * (1 - ss(6, 25, e))).lerp(lin('#d8dce4'), ss(10, 30, e)));
  S.fan.rotation.x = t * 3.5; return su; }

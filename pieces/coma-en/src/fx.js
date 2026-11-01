
// =====================================================================
//  FX — the dissolve (a holy place breaks into rising golden sparks from the top down), the day sky dome,
//  and small builders shared by the sets (arches, stained glass, candles, lamps, crowds that sit or kneel)
// =====================================================================
// a dissolve over everything under `root`: a clip plane sweeps down from the top; points sampled from the surfaces are
// released as the plane passes them, drift outward and rise as glowing sparks. set(k): 0 = whole … 1 = gone
let SPARK = null;
function dissolver(st, root, n, seed, o = {}) { r3().r.localClippingEnabled = true; root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root), y0 = box.min.y, y1 = box.max.y, span = y1 - y0, plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), y1 + 1);
  const seen = new Set(); root.traverse((m) => { if (!m.isMesh) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { if (seen.has(mt)) return; seen.add(mt); mt.clippingPlanes = [plane]; mt.clipShadows = true; mt.needsUpdate = true; }); });
  const P = samplePoints([root], n, seed), R = RNG('dis' + seed), pos = new Float32Array(P.length * 3), aK = new Float32Array(P.length), aR = new Float32Array(P.length * 3), aS = new Float32Array(P.length);
  P.forEach((p, i) => { pos.set([p.x, p.y, p.z], i * 3); aK[i] = (y1 + 0.3 - p.y) / (span + 0.6); aR.set([R.n(1), R.r(0.2, 1), R.n(1)], i * 3); aS[i] = R.r(0.5, 1.5); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aK', new THREE.BufferAttribute(aK, 1)); g.setAttribute('aR', new THREE.BufferAttribute(aR, 3)); g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
  SPARK = SPARK || g3Radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,240,200,0.9)'], [0.6, 'rgba(255,200,120,0.25)'], [1, 'rgba(255,180,100,0)']], 64);
  const U = { uK: { value: 0 }, uDur: { value: o.dur || 1.0 }, uSize: { value: o.size || 1.0 }, uSpread: { value: o.spread ?? Math.max(0.6, span * 0.12) }, uRise: { value: o.rise ?? Math.max(1.0, span * 0.35) }, uMap: { value: SPARK }, uCol: { value: lin(o.col || '#ffd890') } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `uniform float uK, uDur, uSize, uSpread, uRise; attribute float aK, aS; attribute vec3 aR; varying float vA;
      void main(){ float u = (uK - aK) * uDur * 2.2; vA = step(0.0, u) * smoothstep(0.0, 0.06, u) * exp(-u * 0.9); vec3 p = position + aR * uSpread * u + vec3(0.0, 1.0, 0.0) * uRise * (0.35 * u + 0.25 * u * u);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aS * 380.0 / max(0.5, -mv.z) * (0.6 + 0.6 * vA); }`,
    fragmentShader: `uniform sampler2D uMap; uniform vec3 uCol; varying float vA; void main(){ if (vA < 0.004) discard; vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(uCol * t.rgb * vA * 0.6, t.a * vA); }` });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; st.scene.add(pts);
  return { plane, pts, y0, y1, set(k) { plane.constant = lerp(y1 + 0.3, y0 - 0.3, clamp(k)); U.uK.value = k <= 0 ? -1 : k; root.visible = k < 0.999; } }; }
// the day sky: a blue gradient, the sun, soft fbm clouds (colours as uniforms so each place has its own)
function daySky(st, o = {}) { const U = { uTop: { value: lin(o.top || '#3a78c8') }, uHor: { value: lin(o.hor || '#cfe2f2') }, uSun: { value: (o.sun || dirV(30 * DEG, 40 * DEG)).clone() }, uCl: { value: o.clouds ?? 0.6 }, uSunC: { value: lin(o.sunC || '#fff4dc') } };
  const m = new THREE.Mesh(new THREE.SphereGeometry(30000, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 uTop, uHor, uSun, uSunC; uniform float uCl; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 6; i++) { a += m * vn(p); p = p * 2.02 + 1.7; m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float h = clamp(d.y, 0.0, 1.0); vec3 col = mix(uHor, uTop, pow(h, 0.55)); if (d.y < 0.0) col = uHor * 0.9;
  float sd = acos(clamp(dot(d, uSun), -1.0, 1.0)); col += uSunC * (smoothstep(0.02, 0.016, sd) * 6.0 + exp(-sd * 8.0) * 0.5);
  if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.1); float c = fbm(cp * 0.8) * 0.7 + fbm(cp * 2.6 + 3.0) * 0.4; float cov = smoothstep(1.05 - uCl * 0.5, 1.2 - uCl * 0.4, c + 0.35) * smoothstep(0.0, 0.12, d.y);
    vec3 cc = mix(vec3(0.78, 0.82, 0.9), vec3(1.0), smoothstep(0.5, 0.9, fbm(cp * 2.6 + 3.0))); col = mix(col, cc, cov * 0.9); }
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
}` })); m.renderOrder = -10; m.frustumCulled = false; st.scene.add(m); return U; }
function dayStage(o = {}) { const st = makeStage(Object.assign({ hemi: 0.6, sky: 0xcfe0f4, ground: 0x8a7a68, key: 2.4, keyCol: '#fff2e0', box: 40, boxFar: 500, fog: o.fogC || '#d0dcea', fogNear: 450, fogFar: 7000, sunDist: 250, far: 40000 }, o));
  const sun = o.sun || dirV(30 * DEG, 40 * DEG); st.setSun(sun, o.target || new THREE.Vector3(0, 0, -10)); skyEnv(st, o.top || '#3a78c8', o.hor || '#cfe2f2', sun); st.skyU = daySky(st, Object.assign({ sun }, o)); return st; }
function inStage(o = {}) { const st = makeStage(Object.assign({ hemi: 0.7, sky: 0xfff0dc, ground: 0x6a5a48, key: 1.6, keyCol: '#fff0d8', box: 30, boxFar: 300, sunDist: 120, far: 30000 }, o)); const sun = o.sun || dirV(-60 * DEG, 45 * DEG);
  st.setSun(sun, o.target || new THREE.Vector3(0, 0, -10)); skyEnv(st, '#6a7a98', '#e8dccb', sun); st.skyU = daySky(st, Object.assign({ sun }, o)); return st; }
// shared pieces
const GOLD = () => STDm({ color: '#d8a838', metalness: 0.9, roughness: 0.28 });
function glassTex(seed, pal, w = 128, h = 256, arch = true) { return g3Tex((x) => { const R = RNG('glass' + seed); x.fillStyle = '#1a1410'; x.fillRect(0, 0, w, h); const cs = 16;
  for (let j = 0; j < h / cs; j++) for (let i = 0; i < w / cs; i++) { x.fillStyle = R.pick(pal); x.fillRect(i * cs + 1.5, j * cs + 1.5, cs - 3, cs - 3); }
  x.strokeStyle = '#1a1410'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, h * 0.32, w * 0.3, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
  if (arch) { x.fillStyle = '#000'; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, w / 2); x.arc(w / 2, w / 2, w / 2, Math.PI, 0); x.lineTo(w, 0); x.fill(); } }, w, h); }
function glassPane(par, x, y, z, w, h, ry, seed, pal, k = 1.4) { const t = glassTex(seed, pal); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: new THREE.Color(k, k, k), transparent: true, alphaTest: 0.01 }));
  m.material.alphaMap = g3Tex((c, ww, hh) => { c.fillStyle = '#fff'; c.fillRect(0, 0, ww, hh); c.fillStyle = '#000'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, ww / 2); c.arc(ww / 2, ww / 2, ww / 2, Math.PI, 0); c.lineTo(ww, 0); c.fill(); }, 128, 256); m.position.set(x, y, z); m.rotation.y = ry; (par.scene || par).add(m); return m; }
function shaft(par, x, y, z, w, h, rx, ry, col = '#fff0d0', a = 0.12) { const t = g3Tex((c, ww, hh) => { const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, ww, hh);
    c.globalCompositeOperation = 'destination-in'; const g2 = c.createLinearGradient(0, 0, ww, 0); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(0.3, 'rgba(0,0,0,1)'); g2.addColorStop(0.7, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g2; c.fillRect(0, 0, ww, hh); }, 64, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, -h / 2, 0), new THREE.MeshBasicMaterial({ map: t, color: col, transparent: true, opacity: a, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); (par.scene || par).add(m); return m; }
function candle(par, x, y, z, h = 0.3, r = 0.03) { par.add(mesh(new THREE.CylinderGeometry(r, r, h, 10).translate(0, h / 2, 0), STDm({ color: '#f4ecd8', roughness: 0.6 }), x, y, z));
  const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffc870', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); f.position.set(x, y + h + 0.05, z); f.scale.set(0.12, 0.2, 1); par.add(f);
  const f2 = new THREE.Sprite(f.material.clone()); f2.material.opacity = 0.35; f2.position.copy(f.position); f2.scale.setScalar(0.6); par.add(f2); return f; }
function lampRing(par, x, y, z, r, n, col = '#ffd890') { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); g.add(mesh(new THREE.TorusGeometry(r, 0.04, 8, 64).rotateX(Math.PI / 2), GOLD()));
  const b = IM(new THREE.SphereGeometry(0.09, 10, 8), STDm({ color: '#fff4d8', emissive: col, emissiveIntensity: 2.5 }), n, false); for (let i = 0; i < n; i++) b.setMatrixAt(i, M4c(Math.cos(i / n * TAU) * r, 0.08, Math.sin(i / n * TAU) * r)); g.add(b);
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU, c = mesh(new THREE.CylinderGeometry(0.006, 0.006, 20, 4).translate(0, 10, 0), STDm({ color: '#2a2420' }), Math.cos(a) * r, 0, Math.sin(a) * r); c.rotation.z = Math.cos(a) * 0.04; c.rotation.x = -Math.sin(a) * 0.04; g.add(c); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 })); gl.scale.setScalar(r * 3); g.add(gl); return g; }
// people in rows: seated (behind pews), kneeling (prayer rows) or standing — the instanced crowd, posed once
function crowdRows(st, spots, o = {}) { const C = makeCrowd(spots.length, { seed: o.seed || 5, tops: o.tops }); st.scene.add(C.grp); spots.forEach(([x, z, yaw], i) => C.set(i, x, o.y ?? 0, z, yaw ?? Math.PI, o.s ?? 1, o.arms ?? 0, 0)); C.done(); return C; }
function archGeo(w, h, d, seg = 16) { const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.4, 0); s.lineTo(-w / 2 - 0.4, h + w / 2 + 0.4); s.lineTo(w / 2 + 0.4, h + w / 2 + 0.4); s.lineTo(w / 2 + 0.4, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.absarc(0, h, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: seg }).translate(0, 0, -d / 2); }
function sparkIcon(x, y, s, a = 1) { if (a <= 0) return; const f = () => { ctx.save(); screen(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, 'rgba(255,230,170,0.9)'); g.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff8e8'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, r = i % 2 ? 14 : 62; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill();
  [[38, -30, 0.35], [-42, 26, 0.28], [30, 36, 0.22]].forEach(([px, py, k]) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, r = (i % 2 ? 5 : 22) * k / 0.35; ctx.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r); } ctx.closePath(); ctx.fill(); });
  ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); }

// the world outside a holy interior (hidden by its walls until they dissolve): paving, rows of houses, trees, far hills
const SUR = { mosq: { walls: ['#efe4cc', '#e8d8b8', '#f4ecdc', '#d8c8a8', '#e4d0b0'], ground: '#cbb89a', roof: '#c8a070', tree: 'palm', hill: '#b8a890', noShut: true },
  syn: { walls: ['#d8c0a0', '#c8a888', '#e0d0b8', '#b8a088', '#d4b898'], ground: '#9a948a', roof: '#8a4a3a', tree: 'tree', hill: '#7a8a7a' },
  hin: { walls: ['#e87a8a', '#f0c040', '#5ab8c8', '#f09848', '#a8d070', '#e8a0c8'], ground: '#c8a888', roof: '#c86a3a', tree: 'palm', hill: '#9aa080', noShut: true },
  bud: { walls: ['#e8e0d0', '#ece4d4', '#d8ccb8'], ground: '#a8a090', roof: '#3a3a42', tree: 'cherry', hill: '#6a7a8a' } };
function palm(st, x, z, s, seed) { const R = RNG('palm' + seed), tr = STDm({ color: '#8a7050', roughness: 1 }), lf = STDm({ color: '#4a7a2a', roughness: 0.9, side: THREE.DoubleSide }); let px = x, pz = z, y = 0; const lean = R.r(-0.25, 0.25);
  for (let k = 0; k < 6; k++) { const sg = mesh(new THREE.CylinderGeometry(0.16 * s, 0.2 * s, 1.4 * s, 8).translate(0, 0.7 * s, 0), tr, px, y, pz); sg.rotation.z = lean * k * 0.25; st.scene.add(sg); px -= Math.sin(lean * k * 0.25) * 1.4 * s; y += 1.35 * s; }
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, b = mesh(new THREE.PlaneGeometry(0.5 * s, 3.4 * s).translate(0, 1.7 * s, 0), lf, px, y, pz); b.rotation.set(1.1 + R.r(0, 0.3), a, 0, 'YXZ'); st.scene.add(b); } }
function surround(st, th) { const P = SUR[th], R = RNG('sur' + th);
  st.scene.add(mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('pv' + th, P.ground, [C3(P.ground, '#000', 0.12).getStyle(), C3(P.ground, '#fff', 0.15).getStyle()], 9000), 70, 70), roughness: 0.95 }), 0, -0.03, -80));
  let k = 0; [[-38, 0], [-62, 1]].forEach(([z, row]) => { let x = -70; while (x < 70) { const w = R.r(9, 15), fl = (th === 'bud' ? 1 : 2) + Math.floor(R.f() * (row ? 4 : 3)); building(st, x + w / 2, z - 6, w, 12, 0, 300 + k + th.length * 40, R.pick(P.walls), fl, Math.max(2, Math.round(w / 3.4)), { noShut: P.noShut, arcade: k % 3 === 0, balc: th !== 'bud', lit: 0.15, roofCol: P.roof, gH: th === 'bud' ? 3.6 : 4.4 }); x += w + R.r(0.4, 3); k++; } });
  [-1, 1].forEach((s) => { for (let z = 14; z > -32; z -= 12) { const w = R.r(10, 12); building(st, s * 34, z - 5, w, 12, s > 0 ? -Math.PI / 2 : Math.PI / 2, 400 + k++ + th.length * 40, R.pick(P.walls), (th === 'bud' ? 1 : 2) + Math.floor(R.f() * 3), 3, { noShut: P.noShut, balc: th !== 'bud', lit: 0.15, roofCol: P.roof, gH: th === 'bud' ? 3.6 : 4.4 }); } });
  for (let i = 0; i < 14; i++) { const x = -60 + i * 9.5 + R.n(1.5), z = -27 - R.r(0, 3); if (P.tree === 'palm') palm(st, x, z, R.r(0.9, 1.2), th + i); else if (P.tree === 'cherry') { st.scene.add(mesh(new THREE.CylinderGeometry(0.15, 0.25, 2.6, 8).translate(0, 1.3, 0), STDm({ color: '#4a3428' }), x, 0, z)); const c = mesh(lumpyGeo(3, 0.3, 700 + i), STDm({ color: R.pick(['#f4b8c8', '#f0c8d4', '#e8a8bc']), roughness: 0.9 }), x, 3.6, z); c.scale.set(2.4, 1.6, 2.4); st.scene.add(c); } else tree(st, x, z, 1.0, 900 + i + th.length); }
  for (let i = 0; i < 12; i++) { const a = (-70 + i * 13) * DEG, r = R.r(600, 900), hm = new THREE.Mesh(lumpyGeo(3, 0.25, 800 + i + th.length * 20), STDm({ color: P.hill, roughness: 1 })); hm.position.set(Math.sin(a) * r, -60, -Math.cos(a) * r); hm.scale.set(R.r(160, 260), R.r(90, th === 'bud' ? 260 : 150), 150); st.scene.add(hm); } }

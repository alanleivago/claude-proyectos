
// =====================================================================
//  WAVE — the sea coming back: the water reappears behind a running front (the bay fills from the far side),
//  a plunging breaker (crest, curling lip, foam face, mist) races to the seawall, slams into it and throws a wall of spray
//  over the railing toward you; white water floods the promenade; drops hit the lens.
//  tb = seconds since the water returns (t - T_BACK).
// =====================================================================
const WV = { ARRIVE: 2.2 };
const frontZ = (tb) => (tb < 0 ? -9999 : tb < WV.ARRIVE ? lerp(-300, BAY.WALL - 1.5, (tb / WV.ARRIVE) ** 1.7) : 999);
function buildWave(st, S) {
  const R = RNG('wave'), W8 = {};
  // the breaker: a ribbon across the bay with a plunging profile
  const prof = new THREE.CatmullRomCurve3([[-34, 0], [-14, 0.3], [-6, 0.62], [-2, 0.92], [0, 1.0], [2.0, 0.93], [3.0, 0.7], [2.6, 0.42], [1.3, 0.16], [0.3, -0.05]].map(([z, y]) => new THREE.Vector3(0, y, z)));
  const NU = 220, NV = 40, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const p = prof.getPoint(j / NV); pos.push(-450 + 900 * i / NU, p.y, p.z); uv.push(i / NU, j / NV); }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  W8.U = { uT: { value: 0 }, uH: { value: 4 }, uSun: { value: SUND.clone() } };
  W8.front = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: Object.assign(W8.U, THREE.UniformsLib.fog), fog: true, side: THREE.DoubleSide,
    vertexShader: `uniform float uT; uniform float uH; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
#include <fog_pars_vertex>
void main(){ vUv = uv; vec3 p = position; float h = uH * (0.82 + 0.18 * sin(p.x * 0.031 + 1.7) * sin(p.x * 0.013) + 0.06 * sin(p.x * 0.17 + uT * 3.0)); p.y *= h; p.z *= 0.9 + 0.25 * h / 5.0; p.z += 1.6 * sin(p.x * 0.021 + uT * 0.8);
  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`,
    fragmentShader: `uniform float uT; uniform vec3 uSun; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
#include <fog_pars_fragment>
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
void main(){ vec3 V = normalize(vW - cameraPosition); vec3 n = normalize(vN + 0.25 * vec3(vn(vW.xy * 1.3 + uT) - 0.5, 0.0, vn(vW.zy * 1.1 - uT) - 0.5)); if (dot(n, V) > 0.0) n = -n;
  float fr = 0.03 + 0.97 * pow(1.0 - max(dot(-V, n), 0.0), 5.0); vec3 Rf = reflect(V, n); vec3 sky = mix(vec3(0.78, 0.86, 0.94), vec3(0.25, 0.48, 0.82), clamp(Rf.y * 2.0, 0.0, 1.0));
  vec3 body = mix(vec3(0.02, 0.12, 0.16), vec3(0.08, 0.36, 0.38), smoothstep(0.35, 0.85, vUv.y)); float sss = pow(max(dot(V, uSun), 0.0), 2.0) * smoothstep(0.4, 0.85, vUv.y) * 0.6;
  vec3 col = mix(body + sss * vec3(0.2, 0.6, 0.5), sky, fr) + pow(max(dot(Rf, uSun), 0.0), 200.0) * 3.0;
  float fn = vn(vec2(vUv.x * 900.0 * 0.35, vUv.y * 30.0) + vec2(0.0, -uT * 4.0)) * 0.6 + vn(vec2(vUv.x * 900.0 * 1.2, vUv.y * 90.0) + uT * 3.0) * 0.4;
  float foam = smoothstep(0.72, 0.84, vUv.y) * smoothstep(0.3, 0.5, fn + 0.3 * smoothstep(0.8, 0.95, vUv.y)) + smoothstep(0.88, 0.92, vUv.y) * 0.7 + smoothstep(0.5, 0.75, vUv.y) * smoothstep(0.62, 0.72, fn) * 0.5;
  col = mix(col, vec3(0.95, 0.97, 0.98) * (0.85 + 0.15 * max(dot(n, uSun), 0.0)), clamp(foam, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}` }));
  W8.front.visible = false; st.scene.add(W8.front);
  // spray and mist: points with soft sprites
  const sprT = g3Radial([[0, 'rgba(255,255,255,0.95)'], [0.4, 'rgba(240,248,255,0.6)'], [1, 'rgba(220,235,250,0)']], 64);
  const mk = (n, size, op) => { const p = new Float32Array(n * 3), g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g2, new THREE.PointsMaterial({ map: sprT, size, transparent: true, opacity: op, depthWrite: false, color: 0xf4f8ff })); m.frustumCulled = false; m.visible = false; st.scene.add(m); return { m, p, g: g2 }; };
  W8.spray = mk(7000, 0.8, 0.95); W8.mist = mk(3000, 3.6, 0.45); W8.crest = mk(2500, 1.4, 0.55);
  W8.sL = []; for (let i = 0; i < 7000; i++) W8.sL.push({ x: R.r(-45, 45), y: R.r(-1, 1), t0: WV.ARRIVE + R.r(-0.05, 0.5) + Math.abs(R.n(0.15)), vx: R.n(1.8), vy: R.r(9, 22), vz: R.r(3, 12) });
  W8.mL = []; for (let i = 0; i < 3000; i++) W8.mL.push({ x: R.r(-60, 60), y: R.r(0, 6), t0: WV.ARRIVE + R.r(-0.1, 0.6), vy: R.r(2, 6), vz: R.r(1, 5) });
  W8.cL = []; for (let i = 0; i < 2500; i++) W8.cL.push({ x: R.r(-300, 300), dy: R.r(0.7, 1.4), dz: R.r(-1, 5) });
  // white water flooding the promenade
  const fT = g3Tex((x, w) => { const Rf = RNG('foamT'); x.clearRect(0, 0, w, w); for (let k = 0; k < 1600; k++) { x.fillStyle = `rgba(255,255,255,${Rf.r(0.15, 0.6)})`; x.beginPath(); x.ellipse(Rf.r(0, w), Rf.r(0, w), Rf.r(2, 10), Rf.r(1, 5), Rf.r(0, 3), 0, TAU); x.fill(); } }, 512, 512);
  W8.sheet = new THREE.Mesh(new THREE.PlaneGeometry(120, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#cfe4ec', map: wrap(fT, 30, 2), transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.2, depthWrite: false })); W8.sheet.visible = false; st.scene.add(W8.sheet);
  return W8;
}
function poseWave(W8, S, tb) {
  const on = tb >= 0, fz = frontZ(tb); W8.U.uT.value = Math.max(0, tb);
  W8.front.visible = on && tb < WV.ARRIVE + 0.15; if (W8.front.visible) { W8.U.uH.value = lerp(4.0, 12.0, clamp(tb / WV.ARRIVE) ** 1.5); W8.front.position.set(0, BAY.LEVEL + 0.2, fz); }
  S.WU.uFront.value = on ? fz : 999; S.WU.uSurge.value = on ? ss(WV.ARRIVE - 0.2, WV.ARRIVE + 0.4, tb) * (1 - 0.6 * ss(4, 8, tb)) : 0;
  S.water.position.y = BAY.LEVEL + (on ? 1.4 * ss(WV.ARRIVE - 0.3, WV.ARRIVE + 0.6, tb) * (1 - ss(3, 7, tb)) * (1 + 0.25 * Math.sin(tb * 3)) : 0);
  const sp = (o, L, f) => { o.m.visible = on && tb > WV.ARRIVE - 0.3; if (!o.m.visible) return; L.forEach((d, i) => { const r = f(d, i); o.p[i * 3] = r[0]; o.p[i * 3 + 1] = r[1]; o.p[i * 3 + 2] = r[2]; }); o.g.attributes.position.needsUpdate = true; };
  sp(W8.spray, W8.sL, (d) => { const s = tb - d.t0; if (s < 0) return [0, -99, 0]; const y = 0.5 + d.y + d.vy * s - 4.9 * s * s; return y < -0.2 ? [0, -99, 0] : [d.x + d.vx * s, y, BAY.WALL + d.vz * s * (1 - 0.15 * s)]; });
  W8.spray.m.material.opacity = 0.9 * (1 - ss(3.2, 5.0, tb));
  sp(W8.mist, W8.mL, (d) => { const s = tb - d.t0; if (s < 0) return [0, -99, 0]; return [d.x + 0.4 * Math.sin(s + d.x), d.y + d.vy * s * (1 - 0.2 * s), BAY.WALL + d.vz * s]; }); W8.mist.m.material.opacity = 0.35 * (1 - ss(2.8, 6, tb));
  W8.crest.m.visible = W8.front.visible; if (W8.crest.m.visible) { W8.cL.forEach((d, i) => { W8.crest.p[i * 3] = d.x; W8.crest.p[i * 3 + 1] = BAY.LEVEL + W8.U.uH.value.valueOf() * d.dy + 0.3; W8.crest.p[i * 3 + 2] = fz + d.dz; }); W8.crest.g.attributes.position.needsUpdate = true; }
  W8.sheet.visible = on && tb > WV.ARRIVE + 0.25 && tb < 9; if (W8.sheet.visible) { const L = 9.5 * ss(WV.ARRIVE + 0.25, WV.ARRIVE + 1.6, tb); W8.sheet.scale.z = Math.max(0.01, L); W8.sheet.position.set(0, 0.03, BAY.WALL + L / 2); W8.sheet.material.opacity = 0.85 * (1 - ss(4.5, 8.5, tb)); W8.sheet.material.map.offset.y = -tb * 0.6; }
}
// drops on the lens (2D) after the spray reaches you
function lensDrops(tb) { if (tb < WV.ARRIVE + 0.55 || tb > 7.5) return; const k = ss(WV.ARRIVE + 0.55, WV.ARRIVE + 0.8, tb) * (1 - ss(5, 7.5, tb)), R = RNG('ldrop');
  ctx.save(); screen(); for (let i = 0; i < 46; i++) { const x = R.r(0, W), y = R.r(0, H) + (tb - 2.5) * R.r(0, 60), r = R.r(10, 46); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, `rgba(255,255,255,${0.35 * k})`); g.addColorStop(0.7, `rgba(200,220,235,${0.12 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.restore(); }

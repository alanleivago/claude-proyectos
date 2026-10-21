
// =====================================================================
//  FX — the world without electrons:
//   - XRAY: an override material (rims glow ice-blue, interiors see-through, additive) that works on skinned and instanced
//     meshes, so every object reads as a ghost of glass; uGlow brightens it toward white as the charges push apart;
//   - the star field that shows once light passes through the sky;
//   - SPARKS: points sampled from the real geometry of the scene (people, railing, table, towers) that fly apart (Coulomb)
//     and later come back as blue electrons;
//   - the plasma Earth seen from space, and the Moon.
// =====================================================================
const XU = { uGlow: { value: 0 }, uFade: { value: 1 }, uT: { value: 0 } };
const XRAY = new THREE.ShaderMaterial({ uniforms: XU, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: `#include <common>
#include <skinning_pars_vertex>
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
#include <beginnormal_vertex>
#include <skinbase_vertex>
#include <skinnormal_vertex>
#include <defaultnormal_vertex>
#include <begin_vertex>
#include <skinning_vertex>
#include <project_vertex>
  vN = normalize(transformedNormal); vV = normalize(-mvPosition.xyz); vec4 w = modelMatrix * vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  w = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
#endif
  vW = w.xyz; }`,
  fragmentShader: `uniform float uGlow, uFade, uT; varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){ float r = 1.0 - abs(dot(normalize(vN), normalize(vV))); float rim = pow(r, 2.6);
  float scan = 0.85 + 0.15 * sin(vW.y * 40.0 - uT * 6.0);
  vec3 c = mix(vec3(0.35, 0.6, 1.0), vec3(1.0), clamp(uGlow, 0.0, 1.0)); float a = (rim * 0.7 + 0.012) * scan * (1.0 + 3.0 * uGlow);
  gl_FragColor = vec4(c * a * uFade, 1.0); }` });
function starField(st, n = 9000, r = 15000) { const R = RNG('estars'), p = new Float32Array(n * 3), c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3(R.n(1), Math.abs(R.n(1)) * 0.9 + 0.05, R.n(1)).normalize().multiplyScalar(r); p.set([v.x, v.y, v.z], i * 3); const k = R.r(0.5, 1); c.set([k, k, k * R.r(1, 1.15)], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.frustumCulled = false; st.scene.add(m);
  const mw = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: g3Tex((x, w, h) => { const Rm = RNG('mw'); x.clearRect(0, 0, w, h); for (let k = 0; k < 4000; k++) { const u = Rm.f(), y = h * 0.5 + Rm.n(h * 0.12) + (u - 0.5) * h * 0.3; x.fillStyle = `rgba(${Rm.r(180, 230)},${Rm.r(190, 230)},255,${Rm.r(0.02, 0.08)})`; x.beginPath(); x.arc(u * w, y, Rm.r(2, 12), 0, TAU); x.fill(); } }, 1024, 512), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  mw.userData.keep = true; mw.scale.set(30000, 15000, 1); mw.position.set(4000, 6000, -9000); mw.lookAt(0, 0, 0); st.scene.add(mw); return { pts: m, mw }; }
// sample points on the surfaces of meshes (instanced and skinned included); returns positions + outward directions
function samplePoints(meshes, n, seed) { const R = RNG('samp' + seed), out = [], tmp = new THREE.Vector3(), M = new THREE.Matrix4(); const list = [];
  meshes.forEach((m) => m.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.position) list.push(o); }));
  const weights = list.map((o) => Math.min(4000, o.geometry.attributes.position.count) * (o.isInstancedMesh ? Math.min(o.count, 40) : 1)), tot = weights.reduce((a, b) => a + b, 0);
  list.forEach((o, li) => { const k = Math.max(2, Math.round(n * weights[li] / tot)), pos = o.geometry.attributes.position; o.updateMatrixWorld(true);
    for (let j = 0; j < k; j++) { const vi = Math.floor(R.f() * pos.count); tmp.fromBufferAttribute(pos, vi); if (o.isSkinnedMesh && o.boneTransform) o.boneTransform(vi, tmp);
      if (o.isInstancedMesh) { o.getMatrixAt(Math.floor(R.f() * o.count), M); tmp.applyMatrix4(M); } tmp.applyMatrix4(o.matrixWorld); out.push(tmp.clone()); } });
  return out; }
function makeSparks(st, pts, color, size) { const n = pts.length, p = new Float32Array(n * 3), g = new THREE.BufferGeometry(); pts.forEach((v, i) => p.set([v.x, v.y, v.z], i * 3)); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']], 64), size, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }));
  m.frustumCulled = false; st.scene.add(m); return { m, base: pts, p, g, R: RNG('spark' + n), dir: pts.map((v, i) => { const R = RNG('sd' + i); return new THREE.Vector3(R.n(1), R.n(1) + 0.3, R.n(1)).normalize().multiplyScalar(R.r(0.4, 1.6)); }) }; }
// k: 0 = at rest, grows to fly apart; spread in metres per unit^2
function poseSparks(S, k, spread, jitter, t) { for (let i = 0; i < S.base.length; i++) { const b = S.base[i], d = S.dir[i], s = spread * k * k, j = jitter * Math.sin(t * 7 + i * 1.7);
  S.p[i * 3] = b.x + d.x * s + j * 0.02; S.p[i * 3 + 1] = b.y + d.y * s + j * 0.02; S.p[i * 3 + 2] = b.z + d.z * s; } S.g.attributes.position.needsUpdate = true; }
// space: the plasma Earth and the Moon
function buildSpaceE() { const st = makeStage({ hemi: 0.2, key: 2.0, box: 10, far: 100000 }); st.scene.background = lin('#010104'); const S = { st };
  S.stars = starField(st, 7000, 20000); S.stars.pts.material.opacity = 0.9; S.stars.mw.visible = false;
  S.EU = { uT: { value: 0 }, uHeat: { value: 0 } };
  S.earth = new THREE.Mesh(new THREE.SphereGeometry(1000, 128, 96), new THREE.ShaderMaterial({ uniforms: S.EU,
    vertexShader: 'varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position / 1000.0; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform float uT, uHeat; varying vec3 vP; varying vec3 vN; varying vec3 vV;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y), mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 6; i++) { a += m * n3(p); p = p * 2.07 + 1.3; m *= 0.5; } return a; }
void main(){ vec3 q = vP * 3.0 + vec3(0.0, uT * 0.08, uT * 0.05); float f = fbm(q + fbm(q * 1.7 + uT * 0.1) * 1.5);
  vec3 c = mix(vec3(0.62, 0.72, 0.98), vec3(1.0), smoothstep(0.35, 0.75, f)); c = mix(c, vec3(0.45, 0.58, 0.95), smoothstep(0.62, 0.3, f) * 0.6);
  float rim = pow(1.0 - max(dot(vN, vV), 0.0), 2.0); c += vec3(0.6, 0.75, 1.0) * rim * 0.8; gl_FragColor = vec4(c * (1.0 + 0.6 * uHeat), 1.0); }` }));
  st.scene.add(S.earth);
  S.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,255,0)'], [0.62, 'rgba(200,220,255,0)'], [0.7, 'rgba(210,225,255,0.85)'], [1, 'rgba(160,190,255,0)']], 512), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.halo.scale.setScalar(2900); st.scene.add(S.halo);
  const moonT = g3Tex((x, w) => { const R = RNG('moon'); x.fillStyle = '#9a9690'; x.fillRect(0, 0, w, w); for (let k = 0; k < 220; k++) blot(x, R.r(0, w), R.r(0, w), R.r(4, 40), R.pick(['rgba(60,58,55,0.4)', 'rgba(200,198,190,0.3)'])); }, 512, 256);
  S.moon = new THREE.Mesh(new THREE.SphereGeometry(270, 48, 32), STDm({ map: moonT, roughness: 1 })); st.scene.add(S.moon); st.setSun(new THREE.Vector3(-0.3, 0.4, 1)); return S; }

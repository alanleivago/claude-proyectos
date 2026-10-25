
// =====================================================================
//  CORE3D — one WebGL renderer drawn into the 2D canvas; stages (one THREE.Scene + camera + lights per location),
//  small helpers, the sky dome, and the 2D post (bloom, motion blur, film grain, vignette).
// =====================================================================
THREE.ColorManagement.legacyMode = false;

const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const C3 = (a, b, k) => lin(a).lerp(lin(b), clamp(k));
const dirV = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
function knots(K, t) { if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1]; let i = 0; while (t > K[i + 1][0]) i++; const [t0, v0] = K[i], [t1, v1] = K[i + 1], u = (t - t0) / (t1 - t0); return v0 + (v1 - v0) * u * u * (3 - 2 * u); }
const M4 = () => new THREE.Matrix4(), Tr = (x, y, z) => M4().makeTranslation(x, y, z), Rx = (a) => M4().makeRotationX(a), Ry = (a) => M4().makeRotationY(a), Rz = (a) => M4().makeRotationZ(a);
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _hid = new THREE.Matrix4().makeScale(0, 0, 0);
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; return m; };
const STDm = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.8, metalness: 0 }, o));
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
const wrap = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rx) t.repeat.set(rx, ry); return t; };
const blot = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const glowTex = () => g3Radial([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,240,210,0.85)'], [0.5, 'rgba(255,200,130,0.25)'], [1, 'rgba(255,180,100,0)']], 64);
function g3Radial(stops, w = 128) { return g3Tex((x) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); }, w, w); }

// ---- the renderer
let R3 = null;
function r3() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  R3 = { cv, r }; return R3;
}
// a stage: scene, camera, key light with a fixed shadow box, hemisphere light, an optional gradient sky
function makeStage(o = {}) {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(o.fov || 50, W / H, 0.05, o.far || 4000); cam.rotation.order = 'YXZ'; scene.add(cam);
  const hemi = new THREE.HemisphereLight(o.sky || 0xbcd0e8, o.ground || 0x6a5a48, o.hemi ?? 0.8); scene.add(hemi);
  const key = new THREE.DirectionalLight(o.keyCol || 0xfff0dc, o.key ?? 2.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  const b = o.box || 20; Object.assign(key.shadow.camera, { left: -b, right: b, top: b, bottom: -b, near: 1, far: o.boxFar || 200 }); key.shadow.camera.updateProjectionMatrix();
  scene.add(key, key.target);
  const st = { scene, cam, hemi, key, setSun(dir, target = new THREE.Vector3()) { key.target.position.copy(target); key.target.updateMatrixWorld(); key.position.copy(target).addScaledVector(dir.clone().normalize(), o.sunDist || 60); } };
  if (o.fog) scene.fog = new THREE.Fog(o.fog, o.fogNear || 30, o.fogFar || 400);
  if (o.skyTop) { const U = { top: { value: lin(o.skyTop) }, hor: { value: lin(o.skyHor || '#ffffff') } };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top, hor; varying vec3 vD; void main(){ float h = clamp(normalize(vD).y, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.6)), 1.0);\n#include <encodings_fragment>\n}' }));
    sky.renderOrder = -2; scene.add(sky); st.sky = sky; st.skyU = U; }
  return st;
}
function camLook(cam, x, y, z, tx, ty, tz, roll = 0) { cam.position.set(x, y, z); const dx = tx - x, dy = ty - y, dz = tz - z; cam.rotation.set(Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(-dx, -dz), roll); }
// handheld wobble for a camera (deterministic)
function handheld(cam, t, amt = 1, seed = 0) { cam.rotation.x += amt * 0.004 * (Math.sin(t * 0.9 + seed) + 0.5 * Math.sin(t * 2.3 + seed * 2)); cam.rotation.y += amt * 0.004 * (Math.sin(t * 0.7 + seed * 3) + 0.4 * Math.sin(t * 1.9 + seed)); cam.rotation.z += amt * 0.003 * Math.sin(t * 0.5 + seed * 5); }
let CAMONLY = false, CAMREC = null;
function renderStage(st, exposure = 1) { st.cam.updateMatrixWorld(true); CAMREC = { q: st.cam.quaternion.clone(), fov: st.cam.fov, p: st.cam.position.clone() }; if (CAMONLY) return; const R = r3(); R.r.toneMappingExposure = exposure; R.r.render(st.scene, st.cam); ctx.save(); screen(); ctx.filter = 'saturate(1.32) contrast(1.06)'; ctx.drawImage(R.cv, 0, 0, W, H); ctx.filter = 'none'; ctx.restore(); }

// ---- 2D post
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.4) blur(9px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
function vignette(a = 0.45) { ctx.save(); screen(); const g = ctx.createRadialGradient(CX, H / 2, H * 0.3, CX, H / 2, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function grain(t, a = 0.05) { const R = RNG('grain', Math.floor(t * 24)); ctx.save(); screen(); for (let i = 0; i < 1400; i++) { ctx.fillStyle = R.f() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; ctx.fillRect(R.r(0, W), R.r(0, H), 2, 2); } ctx.restore(); }

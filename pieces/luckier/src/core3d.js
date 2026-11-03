// =====================================================================
//  CORE 3D — renderer, shot camera, light rig helpers, code textures, post. Shared by every set.
//  Sets build their own THREE.Scene; the character (char.js) is one rig re-used in every set (moved between scenes).
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const cam = new THREE.PerspectiveCamera(35, W / H, 0.05, 2000);
  G = { cv, r, cam, ani: r.capabilities.getMaxAnisotropy() };
  return G;
}
// point the shot camera: position, target, lens (mm on a 24 mm-high sensor), a little handheld drift
function shotCam(g, pos, tgt, mm = 35, drift = 1, t = TT) {
  const n = (a, b, c) => Math.sin(t * a + b) * c * drift;
  const cam = g.cam; cam.fov = 2 * Math.atan(12 / mm) / DEG;
  cam.position.set(pos[0] + n(0.5, 0.3, 0.012), pos[1] + n(0.7, 1.1, 0.008), pos[2] + n(0.4, 2.2, 0.01));
  cam.up.set(0, 1, 0); cam.lookAt(tgt[0] + n(0.6, 0.9, 0.006), tgt[1] + n(0.8, 0.2, 0.006), tgt[2]);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return cam;
}
// a soft three-point light rig with one VSM shadow (sets may add their own practicals)
function lightRig(scene, o = {}) {
  const key = new THREE.DirectionalLight(lin(o.key ?? '#fff1de'), o.keyI ?? 2.6);
  key.position.set(...(o.keyPos ?? [3, 5, 4])); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;
  const s = o.shadowSize ?? 6; Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: 40 });
  const fill = new THREE.HemisphereLight(lin(o.sky ?? '#cfe0ff'), lin(o.ground ?? '#5a4a3e'), o.fillI ?? 0.9);
  const rim = new THREE.DirectionalLight(lin(o.rim ?? '#ffd9b0'), o.rimI ?? 1.4); rim.position.set(...(o.rimPos ?? [-4, 3, -4]));
  scene.add(key, key.target, fill, rim);
  return { key, fill, rim };
}
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops, w = 128) => g3Tex((x) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, w, w); }, w, w);

// ---- post (2D): bloom + vignette
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.3) blur(10px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
function present(g, scene, o = {}) {
  g.r.setClearColor(lin(o.clear ?? '#000000'), 1); g.r.clear(); g.r.render(scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  bloom(o.bloom ?? 0.22);
}

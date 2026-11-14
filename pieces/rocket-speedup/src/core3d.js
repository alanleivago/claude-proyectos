// =====================================================================
//  CORE 3D — renderer, the pilot's eye, code textures (with relief), post. Shared by the stages.
//  A frame is two passes into one WebGL canvas: the OUTSIDE (sky, pad, Moon, stars) seen by an eye camera with a
//  huge far plane, then the COCKPIT (camera at the same spot, metres, near 0.03) on top after clearing depth.
//  The window is a real hole in the cockpit shell: the outside shows through it.
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
  r.autoClear = false;
  const cam = new THREE.PerspectiveCamera(60, W / H, 0.03, 30);        // cockpit camera (metres)
  const far = new THREE.PerspectiveCamera(60, W / H, 1, 1e9);           // outside camera, same pose
  cam.rotation.order = far.rotation.order = 'YXZ';
  G = { cv, r, cam, far, ani: r.capabilities.getMaxAnisotropy() };
  return G;
}

// ---- the pilot's eye: never locked. A slow breathing sway, a launch rumble, and a look direction per beat.
// yaw/pitch in degrees (yaw + = left, pitch + = up); keyed to story time
const EYE_YAW0 = [[0, 0], [6, -2], [10, -14], [16.5, -14.5], [19.5, 0], [30, 1], [60, 0], [86, 0], [90, -14], [97, -14], [101, 0], [120, 3], [128, -6], [138, -6], [146, 1], [250, 0], [253, 10], [261, 10], [265, 0], [300, 0], [400, -1], [408, -15], [424, -15], [432, -2], [438, 0], [442, 0], [455, -2], [470, -13], [486, -10], [510, -9]];
const EYE_PITCH0 = [[0, -4], [6, -3], [10, -8.5], [16.5, -8.5], [19.5, -3], [30, -4], [60, -3], [66, -4], [78, -4], [84, -3], [86, -3], [90, -10], [97, -10], [101, -3], [120, -3], [250, -4], [253, -9], [261, -9], [265, -4], [300, -4], [400, -5], [408, -10], [424, -10], [432, -5], [438, -5], [442, -8], [450, -8], [455, -7], [470, -16], [510, -17]];
const EYE_FOV0 = [[0, 62], [6, 62], [10, 30], [16.5, 30], [19.5, 62], [86, 62], [90, 52], [97, 52], [101, 62], [250, 62], [253, 52], [261, 52], [265, 62], [400, 62], [408, 52], [424, 52], [432, 62], [455, 62], [472, 48], [486, 41], [510, 40]];
// cruise head moves (first person): [t in, t out, yaw, pitch, fov] - eased 1.6 s in and out, never static for long
const LOOKS = [[128, 138, -6, -3, 62], [141, 145, 22, -3, 62], [148, 152, -13, -11, 54], [156.5, 161, -9, -3, 62], [164, 168, 7, -17, 54], [171, 177, 12, -1, 62],
  [180, 184, -13, -11, 54], [188, 195, -12, -3, 62], [199, 205, -12, -2, 62], [207, 212, -12, -3, 62], [214.5, 218, 20, -2, 62], [220, 225, -11, -3, 62], [227, 233, 0, -1, 62],
  [238.5, 244, -12, -3, 62], [245.5, 249, 7, -17, 54], [252, 262, 10, -9, 52], [268, 272, 22, -2, 62], [277, 281, -13, -11, 54], [287, 291, -20, -2, 62], [297, 301, 7, -17, 54],
  [306, 310, 20, -2, 62], [316, 322, -11, -3, 62]];
function withLooks(base, k, neutral) {
  const out = base.filter(([t]) => t < 126 || t > 326);
  LOOKS.forEach(([a, b, ...v], i) => { const prev = LOOKS[i - 1], next = LOOKS[i + 1];
    if (!prev || a - 1.6 > prev[1] + 1.6) out.push([a - 1.6, neutral]);
    out.push([a, v[k]], [b, v[k]]);
    if (!next || b + 1.6 < next[0] - 1.6) out.push([b + 1.6, neutral]); });
  return out.sort((p, q) => p[0] - q[0]);
}
const EYE_YAW = withLooks(EYE_YAW0, 0, 0), EYE_PITCH = withLooks(EYE_PITCH0, 1, -3.5), EYE_FOV = withLooks(EYE_FOV0, 2, 62);
const TEASER = () => TT < TEASE.t1;
// the galaxy act's chaos (343-455) and the teaser: hull-stress jolts with alarms and radiation flashes [t, strength, flash?]
const STRESS = (() => { const R = RNG('stress'), a = []; for (let t = 344; t < 455; t += R.r(2.2, 6.0)) a.push([t, R.r(0.4, 1), R.f() < 0.5]);
  for (let t = 350.3; t < 355.0; t += R.r(0.35, 0.8)) a.push([t, R.r(0.6, 1.2), R.f() < 0.6]); return a.sort((p, q) => p[0] - q[0]); })();
const stressHit = (st) => { let v = 0; for (const [t, k] of STRESS) if (st >= t && st < t + 0.8) v = Math.max(v, k * Math.exp(-(st - t) * 6)); return v; };
const radFlash = (st) => { let v = 0; for (const [t, k, f] of STRESS) if (f && st >= t && st < t + 0.25) v = Math.max(v, k * (1 - (st - t) / 0.25)); return v; };
const EYE_LEAN = V3(-0.07, -0.10, -0.27);   // the pilot leans in towards the photo at the end
function rumble(st) {   // 0..1 engine shake: hard at liftoff, gone once the air is
  return st < LIFTOFF - 2 ? 0.05 : st < LIFTOFF + 1 ? ss(LIFTOFF - 2, LIFTOFF + 1, st) : 1 - 0.85 * ss(LIFTOFF + 10, 90, st);
}
const MICRO = (() => { const R = RNG('micro'), a = []; for (let t = 268; t < 323; t += R.r(2.2, 5.5)) a.push([t, R.r(640, 1300), R.r(260, 560)]); return a; })();   // [t, x, y] glass pin hits
const microHit = (st) => { let v = 0; for (const [t] of MICRO) if (st >= t && st < t + 0.6) v = Math.max(v, Math.exp(-(st - t) * 8)); return v; };
const PAD_LEAN = (st) => ss(8, 10.5, st) * (1 - ss(16, 19, st));   // the pilot leans to the glass to look down at the crowd
const ckHit = (st) => (st >= 326.2 && st < 329.2 ? Math.exp(-(st - 326.2) * 2.2) : 0);   // the dust impact at 326 s
function eyePose(st) {
  const n = (a, b, c) => Math.sin(st * a + b) * c, rb = rumble(st), R = (k) => Math.sin(st * 37.1 * k + k * 7.3) * Math.sin(st * 23.7 * k + 1.1);
  return {
    pos: [n(0.31, 0.4, 0.010) + rb * 0.004 * R(1) + EYE_LEAN.x * ss(458, 472, st) + 0.10 * PAD_LEAN(st), n(0.47, 1.3, 0.008) + rb * 0.004 * R(1.7) + EYE_LEAN.y * ss(458, 472, st) + 0.14 * PAD_LEAN(st), n(0.23, 2.0, 0.006) + EYE_LEAN.z * ss(458, 472, st) - 0.62 * PAD_LEAN(st)],
    yaw: (TEASER() ? 5 * Math.sin(TT * 0.9) * DEG : 0) + (knots(EYE_YAW, st) + n(0.17, 0.3, 0.55) + n(0.41, 1.9, 0.25)) * DEG + rb * 0.0025 * R(2.3),
    pitch: (knots(EYE_PITCH, st) + n(0.21, 2.2, 0.4) + n(0.53, 0.7, 0.18)) * DEG + rb * 0.0025 * R(3.1) + ckHit(st) * 0.05 * Math.sin(st * 47) + microHit(st) * 0.006 * Math.sin(st * 83) + stressHit(st) * 0.012 * Math.sin(st * 71) + (TEASER() ? 0.012 * Math.sin(st * 9.3) + 0.006 * Math.sin(st * 31) : 0),
    roll: (n(0.13, 0.9, 0.35) + n(0.37, 2.6, 0.12)) * DEG + rb * 0.0018 * R(1.3) + ckHit(st) * 0.03 * Math.sin(st * 61) + stressHit(st) * 0.01 * Math.sin(st * 53) + (TEASER() ? 0.09 * Math.sin(TT * 1.9 + 0.4) + 0.02 * Math.sin(TT * 13) : 0),
    fov: knots(EYE_FOV, st),
  };
}
const SHIP_PITCH = (st) => -17 * ss(58, 68, st) * (1 - ss(76, 84, st));
function poseEye(g, st) {
  const e = eyePose(st);
  for (const c of [g.cam, g.far]) { c.position.set(...e.pos); c.rotation.set(e.pitch, e.yaw, e.roll); c.fov = e.fov; c.aspect = W / H; c.updateProjectionMatrix(); c.updateMatrixWorld(); }
  // the ship's attitude: it pitches its nose down during the gravity turn, so the Earth's limb rises into the window
  g.far.rotation.x += SHIP_PITCH(st) * DEG; g.far.position.set(0, 0, 0); g.far.updateMatrixWorld();
  return e;
}

// ---- code textures. g3Tex(draw, w, h): a canvas texture. g3Mat(...): colour + bump (relief) + roughness from one draw.
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
const g3Radial = (stops, w = 128) => g3Tex((x) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, w, w); }, w, w);
// value noise on a canvas (tileable, cheap): fills x with grey noise at a scale, alpha a
function g3Noise(x, w, h, cell, a, seed, col = '255,255,255') {   // smooth value noise: random cells upscaled with smoothing
  const R = RNG(seed), nx = Math.ceil(w / cell) + 2, ny = Math.ceil(h / cell) + 2, c = document.createElement('canvas'); c.width = nx; c.height = ny;
  const cx = c.getContext('2d'), im = cx.createImageData(nx, ny), [r, gg, b] = col.split(',').map(Number);
  for (let i = 0; i < nx * ny; i++) { im.data[i * 4] = r; im.data[i * 4 + 1] = gg; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = Math.round(R.f() * a * 255); }
  cx.putImageData(im, 0, 0); x.save(); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(c, 0.5, 0.5, nx - 1, ny - 1, 0, 0, (nx - 1) * cell, (ny - 1) * cell); x.restore();
}
// a material from two draws: col(x, w, h) for colour, bump(x, w, h) for height (white = raised). o: roughness, metalness, rep, bumpScale
function g3Mat(key, col, bump, o = {}) {
  const w = o.w ?? 512, h = o.h ?? 512;
  const map = g3Tex(col, w, h), bm = bump ? g3Tex(bump, w, h, false) : null;
  for (const t of [map, bm]) if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; if (o.rep) t.repeat.set(...o.rep); }
  return new THREE.MeshStandardMaterial({ map, bumpMap: bm, bumpScale: o.bumpScale ?? 0.004, roughness: o.roughness ?? 0.6, metalness: o.metalness ?? 0.0, side: o.side ?? THREE.FrontSide });
}
// a rounded box (smooth bevels) via a rounded-rect extrusion: w x h x d, corner radius r
function g3RBox(w, h, d, r = 0.01, seg = 4) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh);
  s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r); s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh);
  s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const b = Math.min(r, d / 2 - 1e-4), geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: seg, curveSegments: seg * 2 });
  geo.translate(0, 0, -(d - 2 * b) / 2); geo.computeVertexNormals();
  // planar UVs on the front face in metres
  const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return geo;
}

// ---- post (2D, on the main canvas): bloom, a lens flare at a screen point
let BLC = null;
function bloom(amt, o = {}) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = `brightness(${o.br ?? 0.6}) contrast(${o.co ?? 2.5}) blur(${o.blur ?? 10}px)`; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
// a flare for a bright source in world direction dir (seen by camera cam); amt 0..1; tint 'r,g,b'
function lensFlare(cam, dir, amt, tint = '255,236,200', big = 520) {
  const s = dir.clone().multiplyScalar(1e5).add(cam.position).project(cam); if (s.z > 1 || amt <= 0) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, on = amt * clamp(1.5 - Math.hypot(s.x, s.y) * 0.7); if (on <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  const gr = ctx.createRadialGradient(x, y, 0, x, y, big); gr.addColorStop(0, `rgba(${tint},${0.55 * on})`); gr.addColorStop(0.12, `rgba(${tint},${0.2 * on})`); gr.addColorStop(1, `rgba(${tint},0)`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  for (const [k, r, c] of [[-0.35, 60, '120,200,255'], [-0.7, 26, '255,190,120'], [-1.1, 90, '160,255,200']]) {
    const gx = W / 2 + (x - W / 2) * k, gy = H / 2 + (y - H / 2) * k, g2 = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    g2.addColorStop(0, `rgba(${c},${0.1 * on})`); g2.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g2; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r);
  }
  ctx.restore();
}

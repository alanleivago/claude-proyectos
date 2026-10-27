// zero-test: 10 s of sinaboto "make river water safe to drink" (0:00-0:10) rebuilt with zero_fem.
// Each shot: { t0, scene, camera, update(localT, globalT), overlay? }. Units: metres, Y up.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { FX } from './fx.js';

export const SHOTS = [];
const LW = 270, LH = 480;      // low-res grid (main.js), vertices snap to it
// character shading: soft lambert (gentle key + ambient, no specular) by default; ?flat=1 gives the v1 unlit look
export const SOFT = !new URLSearchParams(location.search).has('flat');
// v3: much subtler: the lambert result is mixed back toward the unlit albedo, SHADE_K of the lighting shows
// (lit side ~1.02x, shadow side ~0.89x of the albedo at 0.3; v2 was 1.0 = 1.07x / 0.64x). ?shade=0.5 to tune.
export const SHADE_K = Number(new URLSearchParams(location.search).get('shade') ?? 0.3);
const CH = 1.6;                 // character height in metres (model is 13.2 units)
const S = CH / 13.2;
const M = {}, T = {};           // loaded models / textures
let ZERO, CLIPS, FACES;

// ---------- helpers ----------
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, k) => a + (b - a) * k;

// PS1 wobble: snap every projected vertex to the 270x480 pixel grid (v3: the include needs the <> - before v3 the replace never matched)
function snap(m) {
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap';
  return m;
}
function nearest(t) { if (t) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; } return t; }
function snapAll(root) { root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(snap); }); return root; }

const basic = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshBasicMaterial({ map, color, ...extra }));
const lam = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshLambertMaterial({ map, color, ...extra }));
function box(w, h, d, m, x, y, z, parent) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); parent.add(o); return o; }
function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); parent.add(o); return o; }
function ground(w, d, tex, rep, x, y, z, parent, color = 0xffffff) {   // flat textured ground, repeat in metres
  const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / rep, d / rep); t.needsUpdate = true;
  return plane(w, d, basic(t, color), x, y, z, parent, 0, -Math.PI / 2);
}

async function img(url) { const i = new Image(); i.src = url; await i.decode(); return i; }
async function loadTex(url, px) {   // canvas-downscaled, nearest, sRGB
  const i = await img(url); const k = Math.min(1, px / Math.max(i.width, i.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(i.width * k); cv.height = Math.round(i.height * k);
  cv.getContext('2d').drawImage(i, 0, 0, cv.width, cv.height);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t);
}
function canvasTex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t); }
function model(name, h, color) {   // clone of a loaded GLB scaled to height h (m), unlit, snapped
  const g = M[name].clone(true);
  g.traverse((o) => {
    if (!o.isMesh) return;
    const src = o.material; nearest(src.map);
    o.material = basic(src.map, color ?? (src.map ? 0xffffff : src.color.getHex()), { alphaTest: 0.5, side: THREE.DoubleSide });
  });
  const bb = new THREE.Box3().setFromObject(g); g.scale.setScalar(h / (bb.max.y - bb.min.y));
  const w = new THREE.Group(); w.add(g); return w;
}

// ---------- sky ----------
// v3: sinaboto's sky is a SCREEN-SPACE vertical gradient: the same row has the same colour in every shot whatever the
// camera pitch, banded to 5 bits per channel (steps of ~8). Measured on 0750 frames 30/100/140/200/280 (1080x1920):
// row 0 (104,165,234), row 480 (147,195,246), row 960 (180,220,243) -> linear top -> horizon over the top half.
// One preset per video: top, horizon (sRGB), hy (screen fraction where the horizon colour is reached), sat, bands.
export const SKY_PRESETS = {
  ref: { top: [104, 165, 234], horizon: [182, 222, 246], hy: 0.5, sat: 1.0, bands: 32 },     // as measured
  v3: { top: [104, 165, 234], horizon: [182, 222, 246], hy: 0.5, sat: 1.4, bands: 32 },      // user: more saturated
  dusk: { top: [64, 72, 150], horizon: [250, 168, 118], hy: 0.55, sat: 1.1, bands: 32 },
};
export const SKY = SKY_PRESETS[new URLSearchParams(location.search).get('sky') || 'v3'];
export function skyColor(p, k) {   // k: 0 top .. 1 horizon -> banded, saturated sRGB [r,g,b]
  const c = p.top.map((v, i) => lerp(v, p.horizon[i], clamp01(k))), l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return c.map((v) => { const x = Math.min(255, Math.max(0, l + (v - l) * p.sat)); return Math.round(Math.round(x / 255 * (p.bands - 1)) / (p.bands - 1) * 255); });
}
function skyBgTex(p = SKY) {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = LH; const c = cv.getContext('2d');
  for (let y = 0; y < LH; y++) { c.fillStyle = `rgb(${skyColor(p, (y + 0.5) / (p.hy * LH))})`; c.fillRect(0, y, 1, 1); }
  return canvasTex(cv);
}
function skyTex() {   // clouds only (the gradient is the screen-space background): small flat pixel clouds
  const W = 128, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const r = rng(7);
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = 70 + r() * 48, w = 6 + r() * 12;
    c.fillStyle = '#f4f8fb'; c.fillRect(x | 0, y | 0, w | 0, 1); c.fillStyle = '#dfe9f3'; c.fillRect((x + 2) | 0, (y + 1) | 0, (w * 0.7) | 0, 1);
  }
  return canvasTex(cv);
}
function addSky(scene) {   // clouds on the inside of a tall cylinder, gradient behind everything in screen space
  const g = new THREE.CylinderGeometry(300, 300, 260, 24, 1, true);
  const t = T.sky.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); t.needsUpdate = true;
  const sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, depthWrite: false, fog: false, alphaTest: 0.5 }));
  sky.position.y = 125; sky.renderOrder = -1; scene.add(sky);
  scene.background = T.skyBg;
  // soft light for the character and the few lambert props: ambient ~0.62 of the albedo, key adds ~0.42 (no specular)
  scene.add(new THREE.HemisphereLight(0xfbfdff, 0xc8c0b0, 2.0));
  const sun = new THREE.DirectionalLight(0xfff2dc, 1.35); sun.position.set(-3, 6, 4); scene.add(sun);
}

// ---------- shared scenery ----------
function fenceLine(parent, x0, x1, z, h = 1.0, color = 0x9a7a5a) {   // birch rail fence tinted brown, one segment per 2.4 m
  for (let x = x0; x < x1; x += 2.3) {
    const f = model('fence', h, color); f.rotation.y = Math.PI / 2; f.position.set(x + 1.15, 0, z);
    f.children[0].scale.z *= 0.95; parent.add(f);
  }
}
function hedge(parent, x0, x1, z, h = 3.2, seed = 1) {   // photo bush strip (Flow), billboards in a row
  const r = rng(seed); const w = h * 256 / 94;
  for (let x = x0; x < x1; x += w * 0.8) {
    const t = T.hedge.clone(); t.needsUpdate = true; if (r() < 0.5) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; }
    plane(w, h, basic(t, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide }), x + w / 2, h / 2 - 0.05, z - r() * 0.8, parent);
  }
}
function trees(parent, x0, x1, z0, z1, n, h0, h1, seed = 2) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const t = model('tree', h0 + r() * (h1 - h0)); t.position.set(lerp(x0, x1, (i + r() * 0.6) / n), 0, lerp(z0, z1, r()));
    t.rotation.y = r() * 6.28; parent.add(t);
  }
}

// ---------- the character ----------
function zero() {
  const root = SkeletonUtils.clone(ZERO);
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const conv = (m) => new (SOFT ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial)({ name: m.name, map: nearest(m.map), alphaTest: 0.5, side: THREE.DoubleSide });
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  setFace(root, { eyes: 'open', mouth: 'neutral' });   // clones the face materials for this copy
  snapAll(root);
  if (SOFT) root.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      const prev = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => { prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `outgoingLight = mix(diffuseColor.rgb, outgoingLight, ${SHADE_K.toFixed(3)});
#include <opaque_fragment>`); };
      m.customProgramCacheKey = () => 'snap-shade' + SHADE_K;
    });
  });
  root.scale.setScalar(S); root.position.y = 9.0 * S;   // model origin is at the hips: soles at y = -9.0 units
  const wrap = new THREE.Group(); wrap.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const acts = {};
  const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(THREE.AnimationClip.findByName(CLIPS, n)); a.play(); a.setEffectiveWeight(0); return a; })());
  const hand = (side) => root.getObjectByName('Hand' + side);
  // segs: [{ clip, at (shot time), speed=1, from (clip seconds at 'at'), fade (s), loop }]
  // faces: optional [[t, eyes, mouth]] overriding the clip's face track
  function pose(lt, segs, faces) {
    const q = Math.floor(lt * 15 + 1e-6) / 15;           // 15 fps stepping
    let i = 0; while (i < segs.length - 1 && q >= segs[i + 1].at) i++;
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    const clipT = (s) => {
      const a = act(s.clip), d = a.getClip().duration;
      let x = (s.from || 0) + (q - s.at) * (s.speed ?? 1);
      x = s.loop ? ((x % d) + d) % d : Math.min(d - 1e-4, Math.max(0, x));
      return [a, x];
    };
    const cur = segs[i], [a, x] = clipT(cur);
    const w = i > 0 && cur.fade ? clamp01((q - cur.at) / cur.fade) : 1;
    a.time = x; a.setEffectiveWeight(w);
    if (w < 1) { const [b, y] = clipT({ ...segs[i - 1] }); b.time = y; b.setEffectiveWeight(1 - w); }
    mixer.update(0);
    let face;
    if (faces) { face = faces[0]; for (const f of faces) if (f[0] <= q + 1e-6) face = f; face = { eyes: face[1], mouth: face[2] }; }
    else { const tr = FACES[cur.clip]; const fr = Math.floor(x * 30) + 1; let k = tr[0]; for (const f of tr) if (f[0] <= fr) k = f; face = { eyes: k[1], mouth: k[2] }; }
    setFace(root, face);
  }
  return { root: wrap, pose, hand };
}

const CELLS = 16;
const FACE = {
  face_eyes: ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink', 'hearts', 'shocked', 'dizzy', 'relaxed'],
  face_mouth: ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout', 'blep', 'cat', 'gasp', 'bigShock'],
};
function setFace(root, { eyes, mouth } = {}) {   // from zero-fem/face/README.md
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = FACE[m.name];
      if (!cells) return;
      if (!m.userData.faceOwn) {
        m = m.clone(); m.map = m.map.clone();
        m.map.magFilter = m.map.minFilter = THREE.NearestFilter; m.map.generateMipmaps = false; m.map.flipY = false; m.map.needsUpdate = true;
        m.userData.faceOwn = true;
        if (Array.isArray(o.material)) o.material[i] = m; else o.material = m;
      }
      const k = cells.indexOf(m.name === 'face_eyes' ? eyes : mouth);
      if (k >= 0) m.map.offset.x = k / CELLS;
    });
  });
}

// ---------- props ----------
// glass of river water (ref 0:00-0:07): clear glass with a white rim and a pale base band, translucent muddy water,
// and a tiny frog swimming in it (lib-mml frog, retinted). Origin at the centre of the glass, 0.24 m tall (ref: big, as tall as her fist x1.5). tick(t) animates.
function cup() {
  const g = new THREE.Group(), H = 0.24, RT = 0.066, RB = 0.058, N = 10;
  const tr = (color, opacity, side = THREE.DoubleSide) => snap(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side }));   // blends in linear: keep glass faint
  const cyl = (rt, rb, h, m, y, open = false, ro = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, N, 1, open), m); o.position.y = y; o.renderOrder = ro; g.add(o); return o; };
  const wl = H * 0.8;                                               // water level
  cyl(RB * 0.93 + (RT - RB) * 0.4, RB * 0.93, wl - 0.01, tr(0x8a6038, 0.9), 0.01 + (wl - 0.01) / 2, false, 2);   // muddy water
  cyl(RT * 0.94, RT * 0.94, 0.003, basic(null, 0x76522e), wl, false, 1);                                          // water surface
  cyl(RT, RB, H, tr(0xe6f4f8, 0.1, THREE.FrontSide), H / 2, true, 3);                                                              // glass wall
  cyl(RT * 1.07, RT * 1.04, 0.016, basic(null, 0xf4f8f8, { side: THREE.DoubleSide }), H - 0.008, true);                                             // rim
  cyl(RB * 1.04, RB * 1.05, 0.022, basic(null, 0xd2ecee), 0.011);                                                 // thick base
  const frog = SkeletonUtils.clone(M.frog);
  frog.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = basic(nearest(o.material.map), 0xc8f0a8, { alphaTest: 0.5, side: THREE.DoubleSide }); } });
  const fw = new THREE.Group(); fw.add(frog); frog.scale.setScalar(0.62); fw.position.y = wl * 0.55; g.add(fw);
  g.userData.tick = (t) => {
    const q = Math.floor(t * 15) / 15;
    fw.position.y = wl * (0.5 + 0.12 * Math.sin(q * 4.2)); fw.rotation.y = q * 1.6; fw.rotation.x = 0.25 * Math.sin(q * 6.0);
    fw.position.x = 0.012 * Math.cos(q * 1.6); fw.position.z = 0.012 * Math.sin(q * 1.6);
  };
  const c = new THREE.Group(); g.position.y = -H / 2; c.add(g); c.userData.tick = g.userData.tick;   // origin at the glass centre
  return c;
}
const QS = new URLSearchParams(location.search), qv = (k, d) => (QS.get(k) ? QS.get(k).split(',').map(Number) : d);   // tuning overrides
const CUP_GRIP = qv('grip', [0, 1.05, -0.8]);   // hand-bone space (fist centre = 0,0.8,0): glass centre beside the fingers
const STINK_OFF = qv('stink', [-0.06, 0.3, 0.06]);   // world metres above the Head bone
const S3 = qv('s3', [1.53, 1.36]);   // shot 3 camera height / look-at height (v2: 1.7 / 1.53)
const _q = new THREE.Quaternion(), _I = new THREE.Quaternion();
function upright(prop, k) {   // after posing: turn a hand-held prop (local rot = 0) toward world-upright by k (0 = follow the hand)
  prop.quaternion.identity(); prop.parent.updateWorldMatrix(true, false); prop.parent.getWorldQuaternion(_q);
  const want = _q.clone().slerp(_I, k); prop.quaternion.copy(_q.invert().multiply(want));
}
function holdIn(ch, prop, side, off = [0, 0.8, 0], rot = [0, 0, 0]) {   // props live in hand-bone space (model units)
  const h = ch.hand(side); h.add(prop); prop.scale.multiplyScalar(1 / S); prop.position.set(...off); prop.rotation.set(...rot); return prop;
}

// ripple rings on the river (white broken ellipses, ref 0:00-0:04)
function ringTex(seed) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 96; const tex = canvasTex(cv);
  return { tex, draw(t) {
    const c = cv.getContext('2d'); c.clearRect(0, 0, 96, 96); c.fillStyle = '#f2f2ea'; const r = rng(seed);
    for (let k = 0; k < 3; k++) {
      const R = 10 + ((t * 9 + k * 13) % 39);
      for (let a = 0; a < 6.283; a += 0.05) { if (r() < 0.25) continue; c.fillRect(Math.round(48 + Math.cos(a) * R), Math.round(48 + Math.sin(a) * R), 1, 1); }
    }
    tex.needsUpdate = true;
  } };
}

// ---------- the river set (shots 1 and 2) ----------
function riverSet(scene) {
  addSky(scene);
  const w = new THREE.Group(); scene.add(w);
  // muddy water: opaque, light brown, the river runs left-right
  ground(60, 10, T.mud, 2.5, 0, 0, -0.5, w);
  // far bank: dirt face rising to the grass field
  const bank = plane(60, 1.0, basic(T.dirtRep, 0xffffff), 0, 0.22, -5.3, w, 0, -0.95);
  ground(80, 60, T.grass, 3, 0, 0.45, -35.7, w);
  ground(80, 5, T.grass, 3, 0, 0.45, -8.1, w);
  // near side: the bank under the camera
  ground(60, 6, T.mud, 2.5, 0, 0, 7, w);
  const back = new THREE.Group(); back.position.y = 0.45; w.add(back);
  fenceLine(back, -14, 14, -7.5, 1.05);
  const mb = model('mailbox', 1.25); mb.position.set(-2.4, 0, -7.1); mb.rotation.y = Math.PI / 2; back.add(mb);
  hedge(back, -30, 30, -14, 2.4, 4);
  trees(back, -80, 80, -60, -80, 24, 7, 10, 5);
  return w;
}

function shot1() {   // 0.00-2.00  kneeling waist-deep in the river, the glass dipped at the surface, then lifted
  const scene = new THREE.Scene(); riverSet(scene);
  const ch = zero(); ch.root.position.set(0.1, -0.6, 0); ch.root.rotation.y = -0.3; scene.add(ch.root);
  const c1 = holdIn(ch, cup(), 'R', CUP_GRIP);          // the glass stays in her hand; the fist rides at the water line
  const rings = ringTex(3); const rp = plane(2.6, 2.6, basic(rings.tex, 0xffffff, { alphaTest: 0.5, transparent: false }), 0.1, 0.01, 0.2, scene, 0, -Math.PI / 2);
  const cw = new THREE.Vector3();
  const cam = new THREE.PerspectiveCamera(46, 9 / 16, 0.05, 600);
  return {
    t0: 0, scene, camera: cam,
    update(lt) {
      ch.pose(lt, [{ clip: 'scoop_kneel', at: -1, from: S1.from, speed: S1.speed }, { clip: 'scoop_kneel', at: 1.25, from: S1.from2, speed: 0.45 }],
        [[-1, 'half', 'neutral'], [0.9, 'blink', 'neutral'], [1.0, 'half', 'neutral'], [1.7, 'happy', 'smile']]);
      rings.draw(lt); c1.userData.tick(lt); upright(c1, lt < 1.25 ? 0.45 : Math.min(1, 0.45 + (lt - 1.25) * 2));
      scene.updateMatrixWorld(true); c1.getWorldPosition(cw); rp.position.set(cw.x, 0.01, cw.z);
      cam.position.set(0.3 - lt * 0.02, 0.55, 1.75 - lt * 0.05); cam.lookAt(-0.12, 0.34, 0);
    },
  };
}
const [S1from, S1speed, S1from2] = qv('s1', [0.6, 0.03, 0.62]); const S1 = { from: S1from, speed: S1speed, from2: S1from2 };

function shot2() {   // 2.00-4.10  wide: she gets up out of the crouch holding the cup with both hands
  const scene = new THREE.Scene(); riverSet(scene);
  const ch = zero(); ch.root.position.set(0, -0.1, 0); ch.root.rotation.y = 0.1; scene.add(ch.root);
  const c2 = holdIn(ch, cup(), 'R', CUP_GRIP);
  const rings = ringTex(9); plane(2.4, 2.4, basic(rings.tex, 0xffffff, { alphaTest: 0.5 }), 0, 0.01, 0.1, scene, 0, -Math.PI / 2);
  const cam = new THREE.PerspectiveCamera(36, 9 / 16, 0.05, 600);
  return {
    t0: 2.0, hard: true, scene, camera: cam,
    update(lt) {
      ch.pose(lt, [
        { clip: 'kneel', at: -0.3, from: 1.5, speed: 0 },          // still crouched after the cut
        { clip: 'kneel', at: 0.15, from: 1.0, speed: -2.2 },        // rewinding the kneel = standing up
        { clip: 'phone_look', at: 0.45, from: 0.25, fade: 0.2, speed: 0.6 },
      ], [[-1, 'happy', 'smile'], [0.55, 'half', 'smile'], [0.75, 'angry', 'smile'], [1.2, 'half', 'smile']]);
      rings.draw(lt + 2); c2.userData.tick(lt + 2); upright(c2, 1);
      cam.position.set(0.15, 1.0, 3.8 - lt * 0.06); cam.lookAt(0.05, 0.82, 0);
    },
  };
}

// ---------- shot 3: close-up, cup held up against the sky ----------
function shot3() {   // 4.10-7.35  "But it's brown, because rivers carry mud."
  const scene = new THREE.Scene(); addSky(scene);
  const w = new THREE.Group(); scene.add(w);
  ground(120, 120, T.grass, 3, 0, 0, -50, w);
  fenceLine(w, -10, 10, -6.5, 1.05);
  const mb = model('mailbox', 1.25); mb.position.set(-3.2, 0, -6.1); mb.rotation.y = Math.PI / 2; w.add(mb);
  hedge(w, -40, 40, -26, 2.6, 8);
  trees(w, -80, 80, -60, -80, 24, 4.5, 6.5, 6);   // v3: lower than the river set so the sky shows behind the head (ref)
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.sun, fog: false, depthWrite: false })); sun.scale.setScalar(9); sun.position.set(-30, 40, -120); scene.add(sun);
  const ch = zero(); ch.root.position.set(0, 0, 0); ch.root.rotation.y = 0.0; scene.add(ch.root);
  const c = holdIn(ch, cup(), 'R', CUP_GRIP);
  // ref 0750: green stink squiggles rise over the helmet from frame 195 (6.50 s, 4 frames after "mud.") into the mosaic at 7.35
  const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: STINK_OFF, t0: 6.5, dur: 1.2, scale: 1, rise: 46 });
  const cam = new THREE.PerspectiveCamera(19, 9 / 16, 0.05, 600);
  const talk = [[-1, 'open', 'neutral'], [0.0, 'open', 'talkA'], [0.15, 'open', 'neutral'], [0.35, 'open', 'talkO'], [0.6, 'half', 'neutral'],
    [0.75, 'open', 'talkA'], [1.0, 'open', 'neutral'], [1.4, 'open', 'talkO'], [1.65, 'open', 'neutral'], [1.85, 'open', 'talkA'], [2.1, 'half', 'neutral'],
    [2.3, 'half', 'talkO'], [2.55, 'half', 'frown']];
  return {
    t0: 4.1, scene, camera: cam, fx,
    update(lt) {
      ch.pose(lt, [{ clip: 'hold_up_object', at: -0.1, speed: 1 }], talk);
      c.userData.tick(lt + 4.1); upright(c, 0.8);
      cam.position.set(2.3 - lt * 0.03, S3[0], 2.6 - lt * 0.04); cam.lookAt(-0.33, S3[1], 0);   // v3: camera 0.17 m lower, same pitch: she sits higher like the ref, sky behind the stink
    },
  };
}

// ---------- shot 4: high angle, digging on the bare dirt ----------
// the shovel rides on the line between her fists (anim 'dig': R fist at 8.6 u, L fist at 5.6 u from the blade tip)
const SHOV_HI = 8.6 * S, SHOV_LO = 5.6 * S, Y_UP = new THREE.Vector3(0, 1, 0), Z_FW = new THREE.Vector3(0, 0, 1);
function shovelOnHands(ch, sh) {
  const hr = ch.hand('R').localToWorld(new THREE.Vector3(0, 0.8, 0)), hl = ch.hand('L').localToWorld(new THREE.Vector3(0, 0.8, 0));
  const a = hr.clone().sub(hl).normalize();
  sh.position.copy(hr.clone().addScaledVector(a, -SHOV_HI).add(hl.clone().addScaledVector(a, -SHOV_LO)).multiplyScalar(0.5));
  sh.quaternion.setFromUnitVectors(Y_UP, a);
  const fw = Z_FW.clone().applyQuaternion(ch.root.quaternion); fw.addScaledVector(a, -fw.dot(a)).normalize();
  const z = Z_FW.clone().applyQuaternion(sh.quaternion);                     // blade face toward her front
  const ang = Math.atan2(z.clone().cross(fw).dot(a), z.dot(fw));
  sh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(a, ang));
  return sh.position;
}
function shot4() {   // 7.35-8.37  "So you pump"
  const scene = new THREE.Scene(); addSky(scene);
  const w = new THREE.Group(); scene.add(w);
  // v2: the ground has a real gap for the trench (v1's opaque dirt plane covered it, so it read as a line)
  ground(120, 120, T.grass, 3, 0, -0.01, -64.5, w);                         // grass behind the plot
  ground(60, 12.5, T.grass, 3, -35.5, -0.01, 1.75, w); ground(60, 12.5, T.grass, 3, 36.5, -0.01, 1.75, w);
  ground(7, 12.5, T.dirtRep, 2.0, 3.0, 0, 1.75, w); ground(3.4, 12.5, T.dirtRep, 2.0, -3.8, 0, 1.75, w);
  // trench on her right (frame left): x -2.1..-0.5, 0.6 m deep
  plane(1.6, 12.5, basic(T.dirtRep, 0x8a6440), -1.3, -0.6, 1.75, w, 0, -Math.PI / 2);
  plane(12.5, 0.6, basic(T.dirtRep, 0xe0b080), -2.1, -0.3, 1.75, w, Math.PI / 2);      // far wall, lit, faces the camera
  plane(12.5, 0.6, basic(T.dirtRep, 0x7a5636), -0.5, -0.3, 1.75, w, -Math.PI / 2);
  plane(1.6, 0.6, basic(T.dirtRep, 0x9a7048), -1.3, -0.3, -4.5, w);                     // back end
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.42, 10), basic(null, 0x3a2412)); hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.005, 0); w.add(hole);
  fenceLine(w, -8, 10, -3.8, 1.05);
  const mb = model('mailbox', 1.25); mb.position.set(1.6, 0, -3.4); mb.rotation.y = Math.PI / 2; w.add(mb);
  ground(40, 1.4, T.dirtRep, 2, 0, 0.003, -5.2, w, 0xd8c8b0);
  trees(w, -22, 22, -12, -19, 26, 6, 8, 9);
  const ch = zero(); ch.root.position.set(0.15, 0, 0.1); ch.root.rotation.y = 0.45; scene.add(ch.root);
  const shovel = model('shovel', 1.15); scene.add(shovel);
  // dirt clods thrown to her left at the end of each dig cycle (36 f = 1.2 s, toss at f27)
  const clodM = basic(T.dirtRep, 0x7a5434);
  const clods = [...Array(6)].map((_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.06), clodM); scene.add(m); return m; });
  const segs = [{ clip: 'dig', at: -0.55, loop: true, speed: 1 }];
  const r = rng(21), vel = clods.map(() => new THREE.Vector3(0.9 + r() * 0.8, 1.3 + r() * 0.9, -0.2 + r() * 0.5));
  const cam = new THREE.PerspectiveCamera(50, 9 / 16, 0.05, 600);
  const c0 = new THREE.Vector3(0.45, 1.85, 2.9), c1 = new THREE.Vector3(1.05, 2.5, 4.1), l0 = new THREE.Vector3(0.0, 0.75, -0.5), l1 = new THREE.Vector3(-0.2, 0.6, -0.6);   // ref: crane up and back, the trench wall rises on the left
  let toss = null;
  return {
    t0: 7.35, scene, camera: cam,
    update(lt) {
      if (!toss) {                                                         // blade position at the toss key, once
        ch.pose(0.87 - 0.55, segs); scene.updateMatrixWorld(true); toss = shovelOnHands(ch, shovel).clone();
        toss.add(new THREE.Vector3(0.12, 0.15, 0).applyQuaternion(shovel.quaternion));
      }
      ch.pose(lt, segs, [[-1, 'half', 'neutral'], [0.15, 'angry', 'shout'], [0.5, 'angry', 'frown'], [0.75, 'half', 'neutral']]);
      scene.updateMatrixWorld(true);
      shovelOnHands(ch, shovel);
      const q = Math.floor(lt * 15) / 15, ct = (((q + 0.55) % 1.2) + 1.2) % 1.2 - 0.87;   // seconds since the toss
      clods.forEach((m, i) => {
        const tt = ct - i * 0.02; m.visible = tt > 0 && tt < 0.5;
        if (m.visible) { const v = vel[i].clone().applyAxisAngle(Y_UP, ch.root.rotation.y); m.position.copy(toss).addScaledVector(v, tt); m.position.y -= 4.9 * tt * tt; m.rotation.set(tt * 9, tt * 7, 0); if (m.position.y < 0.03) m.visible = false; }
      });
      const k = THREE.MathUtils.smoothstep(lt, 0, 1.02);
      cam.position.lerpVectors(c0, c1, k); cam.lookAt(new THREE.Vector3().lerpVectors(l0, l1, k));
    },
  };
}

// ---------- shot 5: the hand pump ----------
function waterTex() {
  const cv = document.createElement('canvas'); cv.width = 8; cv.height = 32; const c = cv.getContext('2d');
  for (let y = 0; y < 32; y++) { c.fillStyle = y % 8 < 3 ? '#e8f4ff' : '#9cc8ec'; c.fillRect(0, y, 8, 1); }
  c.fillStyle = '#ffffff'; c.fillRect(3, 0, 1, 32);
  const t = canvasTex(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function shot5() {   // 8.37-10.00  "it into a pond and let it sit."
  const scene = new THREE.Scene(); addSky(scene);
  const w = new THREE.Group(); scene.add(w);
  ground(120, 120, T.grass, 3, 0, 0, -40, w);
  fenceLine(w, -8, 10, -3.2, 1.05);
  const mb = model('mailbox', 1.25); mb.position.set(2.0, 0, -2.9); mb.rotation.y = Math.PI / 2; w.add(mb);
  hedge(w, -20, 20, -8, 3.0, 12);
  trees(w, -16, 18, -9, -18, 16, 7, 10, 13);
  // pump: brick pedestal, red body, spout to +X, handle pivot on top
  const pump = new THREE.Group(); pump.position.set(0.1, 0, 0.6); w.add(pump);
  const brick = T.brick.clone(); brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(0.6, 0.8); brick.needsUpdate = true;
  box(0.45, 0.45, 0.45, lam(brick), 0, 0.225, 0, pump);
  const red = lam(null, 0xd01818);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8), red); body.position.y = 0.675; pump.add(body);
  const capm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 8), red); capm.position.y = 0.92; pump.add(capm);
  const spout = box(0.26, 0.06, 0.06, red, 0.18, 0.8, 0, pump); spout.rotation.z = -0.35;
  const handle = new THREE.Group(); handle.position.set(-0.08, 0.94, 0); pump.add(handle);
  const bar = box(1, 0.045, 0.045, red, -0.5, 0, 0, handle);
  // wooden trough from under the spout running to the bottom-right corner
  const trough = new THREE.Group(); trough.position.set(0.42, 0.0, 0.05); trough.rotation.y = -1.05; pump.add(trough);
  const wood = T.fenceTex.clone(); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 0.3); wood.needsUpdate = true;
  const wm = basic(wood, 0xa07850);
  box(8, 0.18, 0.06, wm, 4, 0.09, -0.16, trough); box(8, 0.18, 0.06, wm, 4, 0.09, 0.16, trough);
  box(8, 0.04, 0.3, basic(T.dirtRep, 0x9a7048), 4, 0.02, 0, trough);
  // water stream: a falling arc from the spout into the trough
  const wt = waterTex();
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.3, 0.76, 0), new THREE.Vector3(0.42, 0.74, 0.02), new THREE.Vector3(0.48, 0.08, 0.06));
  const stream = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.025, 4), basic(wt, 0xffffff, { transparent: true, opacity: 0.85 }));
  pump.add(stream);
  const ch = zero(); ch.root.position.set(-0.85, 0, 0.3); ch.root.rotation.y = Math.PI / 2; scene.add(ch.root);
  const handP = new THREE.Vector3(), piv = new THREE.Vector3();
  const cam = new THREE.PerspectiveCamera(45, 9 / 16, 0.05, 600);
  return {
    t0: 8.37, hard: true, scene, camera: cam,
    update(lt) {
      ch.pose(lt, [{ clip: 'pump', at: -0.3, loop: true }], [[-1, 'half', 'neutral'], [0.3, 'angry', 'shout'], [0.6, 'half', 'neutral'], [1.0, 'happy', 'smile']]);
      scene.updateMatrixWorld(true);
      ch.hand('R').localToWorld(handP.set(0, 0.8, 0));
      handle.getWorldPosition(piv);
      const d = handP.clone().sub(piv); const len = d.length();   // aim the bar at her fist
      handle.quaternion.setFromUnitVectors(new THREE.Vector3(-1, 0, 0), d.clone().normalize()); bar.scale.x = len + 0.08; bar.position.x = -(len + 0.08) / 2;
      wt.offset.y = -lt * 3; stream.visible = Math.sin(lt * Math.PI * 2 * 1.0) > -0.6;
      const k = THREE.MathUtils.smoothstep(lt, 0, 1.63);                // ref: slow push in with a slight drift right
      cam.position.set(0.1 + k * 0.18, 1.9 - k * 0.08, 3.9 - k * 0.3); cam.lookAt(-0.3 + k * 0.08, 0.55, 0.3);
    },
  };
}

const TREE = { sat: 1.45, gain: 1.22, r: 1.06, b: 0.8 };
export async function loadAll() {
  const gl = new GLTFLoader();
  for (const [k, f] of [['tree', 'tree_leaf'], ['fence', 'fence'], ['mailbox', 'mailbox'], ['shovel', 'shovel'], ['frog', 'frog']]) M[k] = (await gl.loadAsync(`models/${f}.glb`)).scene;
  M.tree.traverse((o) => {   // v2: the ref's trees are brighter and more yellow-green than this texture
    if (!o.isMesh || !o.material.map) return;
    const im = o.material.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0); const d = c.getImageData(0, 0, cv.width, cv.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const l = (p[i] + p[i + 1] + p[i + 2]) / 3;
      p[i] = (l + (p[i] - l) * TREE.sat) * TREE.gain * TREE.r; p[i + 1] = (l + (p[i + 1] - l) * TREE.sat) * TREE.gain; p[i + 2] = (l + (p[i + 2] - l) * TREE.sat) * TREE.gain * TREE.b;
    }
    c.putImageData(d, 0, 0); const t = canvasTex(cv); t.flipY = false; o.material.map = t;
  });
  M.mailbox.traverse((o) => {   // paint the grey box of the palette atlas blue, like the ref's mailbox
    if (!o.isMesh || !o.material.map) return;
    const im = o.material.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0); const d = c.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < d.data.length; i += 4) if (Math.abs(d.data[i] - 139) < 6 && Math.abs(d.data[i + 1] - 139) < 6 && Math.abs(d.data[i + 2] - 139) < 6) { d.data[i] = 30; d.data[i + 1] = 72; d.data[i + 2] = 190; }
    c.putImageData(d, 0, 0); const t = canvasTex(cv); t.flipY = false; o.material.map = t;
  });
  const z = await gl.loadAsync('models/zero_anim.glb'); ZERO = z.scene; CLIPS = z.animations;
  FACES = await (await fetch('models/face_tracks.json')).json();
  T.sky = skyTex(); T.skyBg = skyBgTex();
  T.grass = await loadTex('tex/grass.png', 128);
  T.dirtRep = await loadTex('tex/dirt_ref.png', 128);
  T.mud = await loadTex('tex/mud.png', 128);
  T.brick = await loadTex('tex/brick_ref.png', 128);
  T.hedge = await loadTex('tex/hedge.png', 256);
  T.fenceTex = null; M.fence.traverse((o) => { if (o.isMesh && !T.fenceTex) T.fenceTex = o.material.map; });
  { const cv = document.createElement('canvas'); cv.width = cv.height = 16; const c = cv.getContext('2d');
    c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(8, 8, 6.5, 0, 7); c.fill(); c.fillStyle = '#fff8d8'; c.beginPath(); c.arc(8, 8, 4.5, 0, 7); c.fill(); T.sun = canvasTex(cv); }
  SHOTS.push(shot1(), shot2(), shot3(), shot4(), shot5());
}

// vera-01 storyboard engine: "THE LAST SLICE" (ep 1), PS1 rom-com in a low-poly cafe. Vera (upnext-waitress, shorts) + Theo (upnext-suitor).
// Built on the approved upnext-01 engine (main_sb.js: unlit characters, face-cell _meta swaps, lens 0.016, emissive bloom, afps).
// Interface for main_sb.js: SHOTS = [{ t0, scene, camera, update(lt, t), hard, dof }], loadAll(renderer).
// Storyboard mode: every shot is a still held 3 s (t0 = 3 * i); subtitles, title card, vignette and grain are added in post (tools/compose.py).
// Units: metres, Y up. Cafe interior x in [-3, 3], z in [-3.2, 3]; back wall z = -3.2 (back bar, menu board), counter along x at z ~ -1.75,
// right wall x = 3 = the street side (glass door at z = -1.2, big window z 0..2.6), street outside x in [3, 10] (night, cool).
// ?set=1 -> set stills only; ?poses=vera|theo -> pose sheet (one still per clip, 3 phases).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SHOTS = [];
const LW = 270, LH = 480;
const QS = new URLSearchParams(location.search);
const CH = {};   // kind -> { src, clips, face, S, foot, H }
const HEIGHTS = { vera: 1.75, theo: 1.67 };   // as approved in upnext-suitor/review/height_pair_v3.png (she is slightly taller)

// ---------- helpers ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function snap(m) {
  if (QS.has('nosnap') || m.userData.noSnap) return m;   // v3: PS1 vertex wobble back on the set (user); single pieces can opt out (userData.noSnap)
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap' + (m.userData.mixK ?? '');
  return m;
}
// emissive surfaces write alpha > 1 into the HDR target -> the only bloom sources (main_sb.js)
function emissive(m, gain = 1) { const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', '#include <opaque_fragment>\n  gl_FragColor.a = ' + (1 + gain).toFixed(2) + ';'); };
  const k = m.customProgramCacheKey; m.customProgramCacheKey = () => k.call(m) + 'em' + gain; return m; }
function nearest(t) { if (t) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; } return t; }
function canvasTex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t); }
function cvs(w, h, f) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; f(cv.getContext('2d'), w, h); return canvasTex(cv); }
function rep(t, rx, ry) { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; }
const lam = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshLambertMaterial({ map, color, ...extra }));
const basic = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshBasicMaterial({ map, color, ...extra }));
function mesh(geo, m, x, y, z, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function box(w, h, d, m, x, y, z, parent) { return mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent); }
function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = mesh(new THREE.PlaneGeometry(w, h), m, x, y, z, parent); o.rotation.set(rx, ry, 0); return o; }
function cyl(rt, rb, h, seg, m, x, y, z, parent) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, parent); }
function blob(parent, x, z, r, op = 0.6, y = 0.006) { const o = mesh(new THREE.CircleGeometry(r, 12), basic(null, 0x1a0e08, { transparent: true, opacity: op, depthWrite: false }), x, y, z, parent); o.rotation.x = -Math.PI / 2; return o; }
function txt(c, s, x, y, size, col, align = 'center', font = 'Pixelify') { c.font = `700 ${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }

// ---------- textures (32-64 px, nearest, like the characters) ----------
const TX = {};
function makeTextures() {
  TX.floor = cvs(32, 32, (c, w, h) => { c.fillStyle = '#7a4a2c'; c.fillRect(0, 0, w, h); const r = rng(5);   // warm plank floor (ref Sugar #6B3F2A)
    for (let y = 0; y < h; y += 8) { c.fillStyle = '#56321c'; c.fillRect(0, y, w, 1); c.fillStyle = '#8c5834'; c.fillRect(0, y + 1, w, 1); const o = (y / 8) % 2 ? 10 : 24; c.fillStyle = '#56321c'; c.fillRect(o, y, 1, 8); }
    for (let i = 0; i < 16; i++) { c.fillStyle = r() < 0.5 ? '#6a3e22' : '#86522e'; c.fillRect((r() * w) | 0, (r() * h) | 0, 3, 1); } });
  TX.wall = cvs(32, 32, (c, w, h) => { c.fillStyle = '#c9a77e'; c.fillRect(0, 0, w, h); const r = rng(11);   // beige upper wall, faint damask dots
    for (let y = 4; y < h; y += 8) for (let x = (y / 8 % 2) * 4 + 2; x < w; x += 8) { c.fillStyle = '#b8966e'; c.fillRect(x, y, 2, 2); }
    for (let i = 0; i < 20; i++) { c.fillStyle = r() < 0.5 ? '#c09e76' : '#d2b088'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 1); } });
  TX.wains = cvs(32, 32, (c, w, h) => { c.fillStyle = '#3e5b4c'; c.fillRect(0, 0, w, h);   // sage-green panelled wainscot (ref #3E5B4C)
    for (let x = 0; x < w; x += 16) { c.fillStyle = '#2f4a3c'; c.fillRect(x + 2, 3, 12, 1); c.fillRect(x + 2, 3, 1, 26); c.fillStyle = '#4e6e5c'; c.fillRect(x + 2, 29, 12, 1); c.fillRect(x + 13, 3, 1, 26); } });
  TX.wood = cvs(16, 16, (c, w, h) => { c.fillStyle = '#6e4428'; c.fillRect(0, 0, w, h); for (let y = 1; y < h; y += 4) { c.fillStyle = '#5a361e'; c.fillRect(0, y, w, 1); } c.fillStyle = '#7e5232'; c.fillRect(3, 6, 6, 1); });
  TX.counterFront = cvs(32, 32, (c, w, h) => { c.fillStyle = '#4a2c1a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { c.fillStyle = '#3a2214'; c.fillRect(x, 0, 1, h); c.fillStyle = '#5a3822'; c.fillRect(x + 1, 0, 1, h); } });
  TX.top = cvs(16, 16, (c, w, h) => { c.fillStyle = '#a8784a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 5) { c.fillStyle = '#946638'; c.fillRect(x, 0, 1, h); } c.fillStyle = '#b88a58'; c.fillRect(2, 5, 4, 1); });
  TX.marble = cvs(32, 32, (c, w, h) => { c.fillStyle = '#e8e2d6'; c.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 40; i++) { c.fillStyle = '#cfc6b6'; c.fillRect((r() * w) | 0, (r() * h) | 0, 3, 1); } });
  TX.brick = cvs(32, 32, (c, w, h) => { c.fillStyle = '#3a2a30'; c.fillRect(0, 0, w, h);   // exterior brick under the cool night light
    for (let y = 0; y < h; y += 6) for (let x = ((y / 6) % 2) * 6; x < w + 6; x += 12) { c.fillStyle = (x * 7 + y) % 5 ? '#6a3a36' : '#5c3230'; c.fillRect(x - 6, y + 1, 11, 5); } });
  TX.asphalt = cvs(32, 32, (c, w, h) => { c.fillStyle = '#23262e'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 60; i++) { c.fillStyle = r() < 0.5 ? '#1c1e26' : '#2c303a'; c.fillRect((r() * w) | 0, (r() * h) | 0, 1, 1); } });
  TX.pave = cvs(16, 16, (c, w, h) => { c.fillStyle = '#5a5e68'; c.fillRect(0, 0, w, h); c.fillStyle = '#464a54'; c.fillRect(0, 0, w, 1); c.fillRect(0, 0, 1, h); });
  TX.chalk = cvs(64, 48, (c, w, h) => { c.fillStyle = '#1e2a24'; c.fillRect(0, 0, w, h);   // menu board
    txt(c, 'MENU', w / 2, 7, 9, '#f2e8d0'); const rows = [['LATTE', '4'], ['MOCHA', '5'], ['CHAI', '4'], ['CAKE', '6']];
    rows.forEach(([a, b], i) => { txt(c, a, 5, 18 + i * 8, 7, '#e8dcc0', 'left'); txt(c, b, w - 5, 18 + i * 8, 7, '#f3df6a', 'right'); });
    c.fillStyle = '#f08aa0'; c.fillRect(46, 4, 2, 2); c.fillRect(49, 4, 2, 2); c.fillRect(46, 6, 5, 2); c.fillRect(47, 8, 3, 1); });
  TX.awning = cvs(16, 8, (c, w, h) => { for (let x = 0; x < w; x += 4) { c.fillStyle = (x / 4) % 2 ? '#e8dcc0' : '#2f5b4a'; c.fillRect(x, 0, 4, h); } });
  TX.sign = cvs(128, 28, (c, w, h) => { c.fillStyle = '#1a1210'; c.fillRect(0, 0, w, h); txt(c, 'CRUMB CAFE', w / 2, 14.5, 17, '#ffb860', 'center', 'Verdana'); });
  TX.closed = cvs(32, 16, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a2a2a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); txt(c, 'CLOSED', w / 2, 8.5, 8, '#8a2222'); });
  TX.openTag = cvs(32, 16, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f5b4a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); txt(c, 'OPEN', w / 2, 8.5, 9, '#2f5b4a'); });
  TX.leaf = cvs(16, 16, (c, w, h) => { c.fillStyle = '#3e7a44'; c.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 30; i++) { c.fillStyle = r() < 0.5 ? '#2c5a34' : '#5c9a5c'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 2); } });
  TX.pot = cvs(8, 8, (c) => { c.fillStyle = '#b8603a'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#9a4c2c'; c.fillRect(0, 6, 8, 2); });
  TX.facade = cvs(32, 32, (c, w, h) => { c.fillStyle = '#2a3048'; c.fillRect(0, 0, w, h); c.fillStyle = '#20263c'; for (let y = 0; y < h; y += 8) c.fillRect(0, y, w, 1); });
  TX.winWarm = cvs(8, 8, (c, w, h) => { c.fillStyle = '#ffcf80'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8a050'; c.fillRect(0, 5, w, 3); c.fillStyle = '#3a2a20'; c.fillRect(3, 0, 1, h); });
  TX.winCool = cvs(8, 8, (c, w, h) => { c.fillStyle = '#7ab0e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a88c0'; c.fillRect(0, 5, w, 3); c.fillStyle = '#20283a'; c.fillRect(3, 0, 1, h); });
  TX.winDark = cvs(8, 8, (c, w, h) => { c.fillStyle = '#141a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1e2638'; c.fillRect(1, 1, 2, 3); });
  TX.screen = cvs(16, 8, (c, w, h) => { c.fillStyle = '#10241a'; c.fillRect(0, 0, w, h); txt(c, '6.00', w / 2, 4.5, 6, '#5cf08a'); });
  TX.cups = cvs(16, 16, (c, w, h) => { c.fillStyle = '#f2ece0'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f5b4a'; c.fillRect(0, 6, w, 3); });
  TX.jars = cvs(16, 16, (c, w, h) => { c.fillStyle = '#c8a070'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a3a22'; c.fillRect(0, 0, w, 4); c.fillStyle = '#f2e8d0'; c.fillRect(3, 8, 10, 4); });
}

// the slice's name label: a small kraft paper tag, handwritten-ish but readable at the storyboard res
function labelTex() {
  return cvs(64, 40, (c, w, h) => {
    c.fillStyle = '#efe2c4'; c.fillRect(0, 0, w, h); c.fillStyle = '#d6c49c'; c.fillRect(0, h - 3, w, 3); c.fillRect(w - 3, 0, 3, h);
    c.fillStyle = '#b8a07a'; c.fillRect(4, 4, 4, 4); c.fillStyle = '#efe2c4'; c.fillRect(5, 5, 2, 2);   // string hole
    txt(c, 'THEO', w / 2 + 3, 16, 17, '#2a1a12');
    txt(c, 'since mon.', w / 2 - 3, 31, 9, '#8a2a3a', 'center', 'Verdana');
    c.fillStyle = '#c83a52'; c.fillRect(54, 26, 2, 2); c.fillRect(57, 26, 2, 2); c.fillRect(54, 28, 5, 2); c.fillRect(55, 30, 3, 1); c.fillRect(56, 31, 1, 1);
  });
}

// ---------- characters ----------
// UNLIT (MeshBasic + nearest, like the approved upnext-01 look); a per-shot tint stands in for the light (warm amber inside, cool at the door)
function charMat(src) { const m = new THREE.MeshBasicMaterial({ name: src.name, map: src.map, alphaTest: 0.5, side: THREE.DoubleSide }); if (QS.has('nodecal') && /^face_/.test(src.name)) m.visible = false; return QS.has('charsnap') ? snap(m) : m; }
// v2 (face streaks, user review): the PS1 vertex snap is OFF on the characters. Snapping each vertex to the 270x480 grid opened
// cracks at the head mesh's T-junctions (cheek/eye seams) and the hair's dark back faces showed through as dashed lines across
// the face (proved: ?nodecal keeps the line, ?nosnap removes it; DOF, lens and atlas inset change nothing). The set keeps the snap.
function prepChar(root) {
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => { nearest(m.map); return charMat(m); };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
}
function faceSet(root, eyes, mouth, kind) {
  const meta = CH[kind].face._meta, cols = meta.cols, rows = meta.rows;
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = meta[m.name]; if (!cells) return;
      if (!m.userData.faceOwn) { const t = m.map.clone(); nearest(t); t.flipY = false; t.needsUpdate = true; m = charMat({ name: m.name, map: t }); m.userData.faceOwn = true; if (Array.isArray(o.material)) o.material[i] = m; else o.material = m; }
      const want = /eyes/.test(m.name) ? eyes : mouth; const k = cells.indexOf(want);
      if (k < 0) console.log('missing face cell', kind, m.name, want);
      else {   // v2 (face streaks): the cells abut with no padding and the decal UVs end exactly on the cell edge, so nearest sampling
        // pulled the NEIGHBOUR cell's edge pixels (the eyebrows of the row below = a dashed dark line across the cheeks).
        // Inset the sampled window by 1 atlas texel on every side.
        const img = m.map.image, eu = 1 / (img.width || 2944), ev = 1 / (img.height || 416);
        m.map.repeat.set(1 - 2 * eu * cols, 1 - 2 * ev * rows);
        m.map.offset.set((k % cols) / cols + eu, Math.floor(k / cols) / rows + ev);
      }
    });
  });
}
// kind 'vera' | 'theo'. Returns { root (group at the feet), model, pose(clip, t, eyes, mouth), bone(name), world(name, off) }
function character(kind, { tint = 0xffffff, shadow = 0.5 } = {}) {
  const C = CH[kind]; const model = SkeletonUtils.clone(C.src); prepChar(model);
  model.scale.setScalar(C.S); model.position.y = -C.foot * C.S;
  const root = new THREE.Group(); root.add(model);
  const sh = shadow ? blob(root, 0, 0, 0.26, shadow) : null;
  const mixer = new THREE.AnimationMixer(model); let cur = null;
  const ch = {
    root, model, kind, shadow: sh,
    pose(clip, t, eyes, mouth) {
      const c = THREE.AnimationClip.findByName(C.clips, clip); if (!c) { console.log('NO CLIP', kind, clip); return ch; }
      if (cur) cur.stop(); cur = mixer.clipAction(c); cur.play(); cur.time = Math.min(t, c.duration - 1e-3); mixer.update(0);
      if (eyes) faceSet(model, eyes, mouth, kind);
      model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.set(tint)); });
      root.updateMatrixWorld(true); return ch;
    },
    bone(n) { return model.getObjectByName(n) || model.getObjectByName(n.replace('.', '')); },
    world(n, off = [0, 0, 0]) { root.updateMatrixWorld(true); return ch.bone(n).localToWorld(V3(...off)); },
  };
  return ch;
}
function holdAt(scene, ch, boneName, prop, off = [0, 0, 0], rot = [0, 0, 0]) {
  ch.root.updateMatrixWorld(true); const b = ch.bone(boneName);
  prop.position.copy(b.localToWorld(V3(...off)));
  const q = new THREE.Quaternion(); b.getWorldQuaternion(q); prop.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)));
  scene.add(prop); return prop;
}

// ---------- props ----------
// the last slice on a small plate; label = flat paper tag in front of the slice (readable only from above)
function slicePlate({ label = true, forks = 0 } = {}) {
  const g = new THREE.Group();
  cyl(0.105, 0.085, 0.014, 14, lam(null, 0xf6f2ea), 0, 0.007, 0, g);
  cyl(0.08, 0.08, 0.002, 14, lam(null, 0xe4ddd0), 0, 0.015, 0, g);
  // the wedge: apex at the cylinder axis, 56 deg wide; shifted so its centroid sits on the plate centre (toward -z, the label takes +z)
  const S = new THREE.Group(); g.add(S); S.position.set(0, 0.016, -0.022);
  const R0 = 0.088, TH = Math.PI / 3.2, cx = 0.6 * R0 * Math.sin(TH / 2), cz = 0.6 * R0 * Math.cos(TH / 2);
  const sector = new THREE.Shape(); sector.moveTo(0, 0); sector.absarc(0, 0, R0, Math.PI / 2 - TH, Math.PI / 2, false); sector.lineTo(0, 0);
  const wg = (h, y, col) => { const geo = new THREE.ExtrudeGeometry(sector, { depth: h, bevelEnabled: false, curveSegments: 3 }); geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2, 0);
    return mesh(geo, lam(null, col), -cz * Math.sin(-TH / 2) * 0 - 0.6 * R0 * Math.cos(Math.PI / 2 - TH / 2), y, 0.6 * R0 * Math.sin(Math.PI / 2 - TH / 2), S); };
  wg(0.026, 0.013, 0xe8c48a); wg(0.008, 0.03, 0xc0304a); wg(0.024, 0.046, 0xe8c48a); wg(0.012, 0.064, 0xf6e2e8);   // sponge, jam, sponge, frosting
  mesh(new THREE.ConeGeometry(0.013, 0.024, 5), lam(null, 0xd8283c), 0.0, 0.082, 0.0, S);                         // strawberry on top
  mesh(new THREE.ConeGeometry(0.008, 0.008, 4), lam(null, 0x3e8a3a), 0.0, 0.096, 0.0, S);
  S.rotation.y = -0.5;
  if (label) { const L = plane(0.068, 0.0425, lam(labelTex()), 0.005, 0.0175, 0.068, g, 0, -Math.PI / 2); L.rotation.z = -0.12; L.name = 'label'; }
  for (let k = 0; k < forks; k++) { const f = box(0.008, 0.003, 0.11, lam(null, 0xd8dce4), 0.07 - k * 0.14, 0.017, 0.0, g); f.rotation.y = 0.3 - k * 0.6; }
  return g;
}
function cakeStand(withSlice = true, dome = true) {   // pedestal + plate + glass dome; origin = counter top
  const g = new THREE.Group();
  cyl(0.05, 0.07, 0.012, 12, lam(null, 0xe8e2d6), 0, 0.006, 0, g); cyl(0.018, 0.022, 0.1, 8, lam(null, 0xe8e2d6), 0, 0.06, 0, g);
  cyl(0.15, 0.14, 0.014, 16, lam(null, 0xf2ece2), 0, 0.117, 0, g);
  if (withSlice) { const s = slicePlate(); s.position.y = 0.124; s.rotation.y = Math.PI; g.add(s); g.userData.slice = s; }   // label faces away at first
  if (dome) {
    const gm = basic(null, 0xcfe4ff, { transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide });
    cyl(0.142, 0.142, 0.16, 16, gm, 0, 0.204, 0, g).geometry = new THREE.CylinderGeometry(0.142, 0.142, 0.16, 16, 1, true);
    const cap = mesh(new THREE.SphereGeometry(0.142, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), gm, 0, 0.284, 0, g); cap.scale.y = 0.6;
    mesh(new THREE.SphereGeometry(0.018, 6, 4), lam(null, 0xd8c08a), 0, 0.375, 0, g);
    const hl = emissive(basic(null, 0xffffff, { transparent: true, opacity: 0.55, depthWrite: false }), 0.6);   // specular glints on the glass
    plane(0.012, 0.13, hl, -0.07, 0.21, 0.124, g, -0.5); plane(0.008, 0.07, hl, -0.045, 0.31, 0.11, g, -0.4, -0.5);
  }
  return g;
}
function cup(col = 0xf2ece0) { const g = new THREE.Group(); cyl(0.035, 0.028, 0.07, 8, lam(null, col), 0, 0.035, 0, g); cyl(0.05, 0.05, 0.006, 10, lam(null, col), 0, 0.003, 0, g); return g; }
function espresso(scene, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  const chrome = lam(null, 0xc8ccd4), red = lam(null, 0x8a2a2a), dark = lam(null, 0x24262c);
  box(0.62, 0.38, 0.42, red, 0, 0.19 + 0.05, 0, g); box(0.66, 0.05, 0.46, chrome, 0, 0.025, 0, g); box(0.62, 0.06, 0.42, chrome, 0, 0.46, 0, g);
  for (const sx of [-0.15, 0.15]) { cyl(0.04, 0.04, 0.06, 8, chrome, sx, 0.26, 0.23, g); box(0.03, 0.02, 0.14, dark, sx, 0.22, 0.31, g); cup().position.set(sx, 0.05, 0.25); g.add(cup().translateX(sx).translateY(0.05).translateZ(0.25)); }
  cyl(0.008, 0.008, 0.22, 5, chrome, 0.26, 0.26, 0.2, g).rotation.z = 0.3;   // steam wand
  mesh(new THREE.CircleGeometry(0.035, 10), emissive(basic(null, 0xfff0c0), 0.8), 0, 0.33, 0.212, g);           // gauge
  for (let k = 0; k < 5; k++) g.add(cup().translateX(-0.22 + k * 0.11).translateY(0.49));   // cups warming on top
  return g;
}
function register(scene, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  box(0.36, 0.1, 0.32, lam(null, 0x3a3e46), 0, 0.05, 0, g); box(0.3, 0.05, 0.18, lam(null, 0x22252c), 0, 0.125, 0.04, g);
  const s = box(0.24, 0.14, 0.03, lam(null, 0x2a2d34), 0, 0.22, -0.1, g); s.rotation.x = -0.35;
  const sc = plane(0.2, 0.1, emissive(basic(TX.screen), 0.9), 0, 0.225, -0.075, g); sc.rotation.x = -0.35;
  return g;
}
function plant(scene, x, y, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g);
  cyl(0.09, 0.07, 0.16, 8, lam(TX.pot), 0, 0.08, 0, g);
  const lm = lam(TX.leaf);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; const l = mesh(new THREE.ConeGeometry(0.05, 0.28, 4), lm, Math.cos(a) * 0.05, 0.27, Math.sin(a) * 0.05, g); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
  mesh(new THREE.IcosahedronGeometry(0.08, 0), lm, 0, 0.3, 0, g);
  return g;
}
const TABLE_H = 0.72, SEAT_H = 0.45;
function table(scene, x, z, top = 0.36) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  cyl(top, top, 0.035, 14, lam(TX.marble), 0, TABLE_H - 0.018, 0, g); cyl(top + 0.006, top + 0.006, 0.012, 14, lam(null, 0x3a2416), 0, TABLE_H - 0.04, 0, g);
  cyl(0.03, 0.03, TABLE_H - 0.05, 6, lam(null, 0x22201e), 0, (TABLE_H - 0.05) / 2, 0, g); cyl(0.2, 0.22, 0.03, 10, lam(null, 0x22201e), 0, 0.015, 0, g);
  return g;
}
function chair(scene, x, z, ry) {   // bentwood cafe chair, faces +z at ry = 0 (seat front toward +z)
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const w = lam(TX.wood, 0x8a5a38);
  cyl(0.2, 0.2, 0.04, 10, w, 0, SEAT_H - 0.02, 0, g);
  for (const [sx, sz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) { const l = cyl(0.014, 0.012, SEAT_H, 5, w, sx, SEAT_H / 2, sz, g); l.rotation.set(sz * 0.4, 0, -sx * 0.4); }
  for (const sx of [-0.14, 0.14]) cyl(0.013, 0.013, 0.45, 5, w, sx, SEAT_H + 0.22, -0.16, g);
  const back = mesh(new THREE.TorusGeometry(0.15, 0.014, 4, 10, Math.PI), w, 0, SEAT_H + 0.44, -0.16, g); back.rotation.z = 0;
  box(0.26, 0.05, 0.02, w, 0, SEAT_H + 0.28, -0.16, g);
  return g;
}
function pendant(scene, x, y, z, warm = 0xffc070) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  cyl(0.004, 0.004, 3.0 - y, 3, lam(null, 0x1a1a1a), 0, (3.0 - y) / 2, 0, g);
  const sh = mesh(new THREE.ConeGeometry(0.13, 0.14, 8, 1, true), lam(null, 0x2f5b4a, { side: THREE.DoubleSide }), 0, 0.0, 0, g);
  mesh(new THREE.SphereGeometry(0.045, 8, 6), emissive(basic(null, 0xfff0c8), 2.0), 0, -0.06, 0, g);
  void sh; const pl = new THREE.PointLight(warm, 1.6, 3.2, 1.6); pl.position.set(0, -0.2, 0); g.add(pl);
  return g;
}

// ---------- the cafe ----------
const COUNTER = { x0: -2.95, x1: 0.85, zf: -1.45, zb: -2.05, h: 1.02 };   // front face z = -1.45, back z = -2.05
const BACKBAR = { zf: -2.75, h: 0.95 };
const DOME = { x: -0.25, z: -1.78 };
const DOOR = { z: -1.2, w: 0.95, h: 2.15 };
const WIN = { z0: 0.05, z1: 2.6, y0: 0.85, y1: 2.45 };
const TABLES = [[2.15, 1.3], [0.55, 0.75], [-1.65, 0.55], [-0.75, 2.15]];   // [0] = the window table (her section)
const WALL_T = 0.14;
function cafe({ dome = true, slice = true, sign = 'open', doorOpen = 0, extraLight = 1 } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0e1e);
  scene.add(new THREE.HemisphereLight(0xffd8a8, 0x4a2a1a, 1.25 * extraLight));
  const key = new THREE.DirectionalLight(0xffc890, 0.55); key.position.set(-2, 4, 2); scene.add(key);
  // floor + ceiling
  plane(6, 6.2, lam(rep(TX.floor, 7, 7)), 0, 0, -0.1, scene, 0, -Math.PI / 2);
  plane(6, 6.2, basic(null, 0x2a1c14), 0, 3.0, -0.1, scene, 0, Math.PI / 2);
  for (let k = 0; k < 6; k++) box(0.12, 0.1, 6.2, lam(TX.wood, 0x5a3a24), -2.5 + k, 2.95, -0.1, scene);   // ceiling beams
  // walls: wainscot (0-1.0) + beige upper + rail; left, back, front full; right wall (street) built around the door + window openings
  const wallStrip = (len, x, z, ry) => { plane(len, 1.0, lam(rep(TX.wains, len * 2, 1)), x, 0.5, z, scene, ry); plane(len, 2.0, lam(rep(TX.wall, len * 2, 2)), x, 2.0, z, scene, ry);
    const r = box(len, 0.05, 0.04, lam(null, 0xe0d0b0), x, 1.01, z, scene); r.rotation.y = ry; };
  wallStrip(6, 0, -3.2, 0); wallStrip(6.2, -3, -0.1, Math.PI / 2); wallStrip(6, 0, 3.0, Math.PI);
  // right wall pieces (inner face at x = 3 - WALL_T/2 facing -x; outer face brick facing +x)
  const rw = (z0, z1, y0, y1) => { const len = z1 - z0, h = y1 - y0, zc = (z0 + z1) / 2, yc = (y0 + y1) / 2;
    const b = box(WALL_T, h, len, [lam(rep(TX.brick, len * 2, h * 2)), lam(null, 0xc9a77e, { visible: false }), lam(null, 0x2a1c14), lam(null, 0x2a1c14), lam(null, 0x8a6a4a), lam(null, 0x8a6a4a)], 3, yc, zc, scene);   // v2: inner face hidden (the skins 2 mm in front z-fought with it)
    // inner skin with wainscot/wall textures
    if (y0 < 1.0) plane(len, Math.min(1.0, y1) - y0, lam(rep(TX.wains, len * 2, 1)), 3 - WALL_T / 2 - 0.002, (y0 + Math.min(1.0, y1)) / 2, zc, scene, -Math.PI / 2);
    if (y1 > 1.0) plane(len, y1 - Math.max(1.0, y0), lam(rep(TX.wall, len * 2, 2)), 3 - WALL_T / 2 - 0.002, (Math.max(1.0, y0) + y1) / 2, zc, scene, -Math.PI / 2);
    return b; };
  const dz0 = DOOR.z - DOOR.w / 2, dz1 = DOOR.z + DOOR.w / 2;
  // v3 (flicker with the PS1 snap back on): the wall is cut on ONE grid (every column split at every opening/wainscot height) so all the
  // pieces share their corner vertices. The v1/v2 pieces met in T-junctions (the full-height piece next to the one above the door) and
  // the snapped seam opened a dotted crack at the top of the door wall in shot 27.
  { const zs = [-3.2, dz0, dz1, WIN.z0, WIN.z1, 3.0], ys = [0, WIN.y0, 1.0, DOOR.h, WIN.y1, 3.0];
    for (let i = 0; i < zs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const zc = (zs[i] + zs[i + 1]) / 2, yc = (ys[j] + ys[j + 1]) / 2;
      if (zs[i] === dz0 && yc < DOOR.h) continue;                       // door opening
      if (zs[i] === WIN.z0 && yc > WIN.y0 && yc < WIN.y1) continue;     // window opening
      rw(zs[i], zs[i + 1], ys[j], ys[j + 1]); } }
  // window frame + glass + mullions
  const frm = lam(null, 0x2f4a3c), glass = basic(null, 0x9ab8e0, { transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
  plane(WIN.z1 - WIN.z0, WIN.y1 - WIN.y0, glass, 3, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2, scene, -Math.PI / 2);
  for (const z of [WIN.z0, (WIN.z0 + WIN.z1) / 2, WIN.z1]) box(WALL_T + 0.04, WIN.y1 - WIN.y0, 0.06, frm, 3, (WIN.y0 + WIN.y1) / 2, z, scene);
  box(WALL_T + 0.04, 0.06, WIN.z1 - WIN.z0, frm, 3, WIN.y0, (WIN.z0 + WIN.z1) / 2, scene); box(WALL_T + 0.04, 0.06, WIN.z1 - WIN.z0, frm, 3, WIN.y1, (WIN.z0 + WIN.z1) / 2, scene);
  box(WALL_T + 0.04, 0.04, WIN.z1 - WIN.z0, frm, 3, WIN.y0 + 1.1, (WIN.z0 + WIN.z1) / 2, scene);
  box(0.22, 0.04, WIN.z1 - WIN.z0 + 0.1, lam(TX.wood), 2.88, WIN.y0 - 0.02, (WIN.z0 + WIN.z1) / 2, scene);   // sill
  // string lights along the window top (bloom sources)
  for (let k = 0; k <= 12; k++) { const z = WIN.z0 + 0.1 + k * (WIN.z1 - WIN.z0 - 0.2) / 12; mesh(new THREE.SphereGeometry(0.022, 5, 4), emissive(basic(null, k % 3 ? 0xffd890 : 0xff9a70), 1.6), 2.88, WIN.y1 - 0.08 - 0.05 * Math.sin(k / 12 * Math.PI * 4) ** 2, z, scene); }
  // glass door (hinge at dz0, opens inward)
  const door = new THREE.Group(); door.position.set(3 - WALL_T / 2, 0, dz0); scene.add(door);
  { const dw = DOOR.w, dh = DOOR.h, fr = lam(null, 0x2f4a3c);
    box(0.05, dh, 0.08, fr, 0, dh / 2, 0.04, door); box(0.05, dh, 0.08, fr, 0, dh / 2, dw - 0.04, door); box(0.05, 0.1, dw, fr, 0, dh - 0.05, dw / 2, door); box(0.05, 0.32, dw, fr, 0, 0.16, dw / 2, door);
    plane(dw - 0.16, dh - 0.42, glass, 0, dh / 2 + 0.11, dw / 2, door, Math.PI / 2);
    box(0.06, 0.03, 0.22, lam(null, 0xd8b860), -0.05, 1.02, dw - 0.15, door);   // push bar
    const tag = new THREE.Group(); tag.position.set(0.0, 1.55, dw / 2); door.add(tag);   // the hanging sign: OPEN faces the street, CLOSED at the end
    plane(0.28, 0.14, lam(sign === 'closed' ? TX.closed : TX.openTag), 0.03, 0, 0, tag, Math.PI / 2);
    plane(0.28, 0.14, lam(sign === 'closed' ? TX.closed : TX.openTag), -0.03, 0, 0, tag, -Math.PI / 2); }   // both faces read the same (storyboard clarity)
  door.rotation.y = doorOpen;
  // door bell on a brass bracket above the door, inside
  { const b = new THREE.Group(); b.position.set(3 - WALL_T / 2 - 0.12, DOOR.h + 0.05, dz1 - 0.2); scene.add(b);
    box(0.2, 0.015, 0.015, lam(null, 0xb08a40), 0.05, 0.1, 0, b); mesh(new THREE.CylinderGeometry(0.012, 0.045, 0.06, 8, 1, true), lam(null, 0xd8b050, { side: THREE.DoubleSide }), -0.04, 0.05, 0, b);
    mesh(new THREE.SphereGeometry(0.01, 5, 4), lam(null, 0x806020), -0.04, 0.015, 0, b); scene.userData.bell = b; }
  // counter: plank front + kick, wood top, end flap at x1
  { const C = COUNTER, len = C.x1 - C.x0, xc = (C.x0 + C.x1) / 2;
    box(len, C.h - 0.05, C.zb - C.zf + 0.0 > 0 ? 0.6 : 0.6, lam(rep(TX.counterFront, len * 3, 1)), xc, (C.h - 0.05) / 2, (C.zf + C.zb) / 2, scene);
    box(len + 0.06, 0.05, 0.7, lam(rep(TX.top, len * 2, 1)), xc, C.h - 0.025, (C.zf + C.zb) / 2 + 0.03, scene);
    box(len, 0.08, 0.02, lam(null, 0x2a180c), xc, 0.04, C.zf - 0.011, scene);
    box(len, 0.03, 0.02, lam(null, 0xb08a40), xc, 0.75, C.zf - 0.012, scene);   // brass rail
    // pastry glass case at the left end (low)
    const gc = basic(null, 0xcfe4ff, { transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
    box(0.8, 0.32, 0.5, gc, -1.8, C.h + 0.184, -1.76, scene); box(0.8, 0.02, 0.5, lam(null, 0xd8d0c0), -1.8, C.h + 0.012, -1.76, scene);
    for (let k = 0; k < 3; k++) { const p = new THREE.Group(); p.position.set(-2.05 + k * 0.25, C.h + 0.02, -1.76); scene.add(p); cyl(0.07, 0.07, 0.012, 10, lam(null, 0xf6f2ea), 0, 0.006, 0, p); }   // EMPTY plates: sold out
  }
  const stand = cakeStand(slice, dome); stand.position.set(DOME.x, COUNTER.h, DOME.z); scene.add(stand);
  register(scene, -2.62, COUNTER.h, -1.8);
  { const tj = cyl(0.05, 0.05, 0.12, 8, basic(null, 0xcfe4ff, { transparent: true, opacity: 0.3, depthWrite: false }), 0.25, COUNTER.h + 0.06, -1.6, scene); void tj; }
  { const nap = box(0.1, 0.1, 0.06, lam(null, 0xc8ccd4), -1.2, COUNTER.h + 0.05, -1.95, scene); void nap; }
  // back bar + espresso machine + grinder + shelves + menu board + jars
  { const zc = -3.2 + (-2.75 + 3.2) / 2;
    box(3.6, BACKBAR.h, 0.45, lam(rep(TX.counterFront, 10, 1)), -1.15, BACKBAR.h / 2, zc, scene);
    box(3.66, 0.04, 0.5, lam(rep(TX.marble, 6, 1)), -1.15, BACKBAR.h + 0.02, zc, scene);
    espresso(scene, -1.55, BACKBAR.h + 0.04, zc + 0.02);
    const gr = new THREE.Group(); gr.position.set(-2.25, BACKBAR.h + 0.04, zc); scene.add(gr);
    box(0.18, 0.3, 0.22, lam(null, 0x24262c), 0, 0.15, 0, gr); mesh(new THREE.ConeGeometry(0.1, 0.2, 8), basic(null, 0x6a4a30, { transparent: true, opacity: 0.7 }), 0, 0.42, 0, gr).rotation.x = Math.PI;
    for (const [y, x0, x1] of [[1.62, -2.9, -0.6], [2.02, -2.9, -0.6]]) { box(x1 - x0, 0.03, 0.26, lam(TX.wood), (x0 + x1) / 2, y, -3.07, scene);
      for (let x = x0 + 0.12; x < x1 - 0.05; x += 0.18) { const j = cyl(0.05, 0.05, 0.14, 8, lam(y > 1.8 ? TX.jars : TX.cups), x, y + 0.085, -3.07, scene); void j; } }
    const mb = box(1.5, 1.05, 0.04, lam(null, 0x3a2416), 0.45, 2.02, -3.17, scene); void mb;
    plane(1.4, 0.95, lam(TX.chalk, 0xffffff), 0.45, 2.02, -3.135, scene);
    box(0.5, 0.02, 0.3, lam(TX.wood), 0.45, BACKBAR.h + 0.08, -2.98, scene);
    for (let k = 0; k < 4; k++) g4(scene, 0.25 + k * 0.13, BACKBAR.h + 0.09, -2.98);
  }
  function g4(sc, x, y, z) { sc.add(cup(k4[(x * 100 | 0) % 3]).translateX(x).translateY(y).translateZ(z)); }
  // pendant lights over the counter and the tables
  for (const x of [-2.1, -0.95, 0.2]) pendant(scene, x, 2.25, -1.75);
  TABLES.forEach(([x, z]) => pendant(scene, x, 2.15, z, 0xffb860));
  // tables + chairs (two per table, facing each other along x)
  TABLES.forEach(([x, z], i) => { table(scene, x, z); chair(scene, x - 0.55, z, Math.PI / 2); chair(scene, x + 0.55, z, -Math.PI / 2); if (i === 2) { cup(0xf2ece0).position.set(x + 0.1, TABLE_H, z - 0.05); scene.add(cup().translateX(x + 0.1).translateY(TABLE_H).translateZ(z - 0.05)); } });
  // window-table chairs for the twist: Theo on the street side? -> Theo sits at x+0.55 facing -x (window at his right), Vera at x-0.55
  // decor: plants, framed pictures, a coat rack by the door
  plant(scene, 2.62, 0, 2.75, 1.7); plant(scene, -2.7, 0, 2.7, 1.5); plant(scene, -1.15, COUNTER.h, -1.62, 0.5);
  for (const [z, col] of [[-0.6, 0x8a5a7a], [0.9, 0x5a7a8a], [2.0, 0xb87a4a]]) { box(0.03, 0.5, 0.4, lam(null, 0x2a1a10), -2.98, 1.75, z, scene); plane(0.32, 0.42, lam(null, col), -2.952, 1.75, z, scene, Math.PI / 2); }
  { const cr = new THREE.Group(); cr.position.set(2.65, 0, -2.4); scene.add(cr); cyl(0.02, 0.02, 1.8, 5, lam(TX.wood), 0, 0.9, 0, cr); cyl(0.2, 0.22, 0.03, 8, lam(TX.wood), 0, 0.015, 0, cr);
    for (const a of [0, 2.1, 4.2]) box(0.14, 0.02, 0.02, lam(TX.wood), Math.cos(a) * 0.07, 1.75, Math.sin(a) * 0.07, cr).rotation.y = -a; }
  // ---- the street (night, cool) ----
  { plane(1.6, 6.4, lam(rep(TX.pave, 6, 24), 0x8a96b0), 3.8, 0.0, -0.1, scene, 0, -Math.PI / 2);
    box(0.12, 0.14, 6.4, lam(null, 0x6a7080), 4.6, 0.07, -0.1, scene);
    plane(4.4, 30, lam(rep(TX.asphalt, 8, 40), 0x8090b0), 6.8, -0.06, -0.1, scene, 0, -Math.PI / 2);
    plane(1.4, 30, lam(rep(TX.pave, 4, 60), 0x8a96b0), 9.6, 0.0, -0.1, scene, 0, -Math.PI / 2);
    // opposite building facade with lit windows
    plane(30, 9, lam(rep(TX.facade, 16, 5)), 10.3, 4.5, -0.1, scene, -Math.PI / 2);
    const r = rng(21);
    for (let fl = 0; fl < 3; fl++) for (let k = -6; k <= 6; k++) { const v = r(); const t = v < 0.35 ? TX.winWarm : v < 0.55 ? TX.winCool : TX.winDark;
      const m = t === TX.winDark ? basic(t) : emissive(basic(t), t === TX.winWarm ? 0.7 : 0.4); plane(0.8, 1.1, m, 10.28, 1.3 + fl * 2.2, k * 1.6, scene, -Math.PI / 2); }
    // street lamp
    const sl = new THREE.Group(); sl.position.set(4.35, 0, 0.9); scene.add(sl);
    cyl(0.04, 0.05, 3.6, 6, lam(null, 0x1e2230), 0, 1.8, 0, sl); box(0.5, 0.04, 0.04, lam(null, 0x1e2230), -0.2, 3.58, 0, sl);
    mesh(new THREE.ConeGeometry(0.14, 0.16, 6), lam(null, 0x1e2230), -0.42, 3.5, 0, sl); mesh(new THREE.SphereGeometry(0.07, 6, 4), emissive(basic(null, 0xd8e8ff), 2.0), -0.42, 3.42, 0, sl);
    const sp = new THREE.PointLight(0x9cb8ff, 2.0, 6, 1.4); sp.position.set(-0.42, 3.3, 0); sl.add(sp);
    const moon = new THREE.DirectionalLight(0x7088d8, 0.6); moon.position.set(8, 6, 2); moon.target.position.set(3, 0, 0); scene.add(moon); scene.add(moon.target);
    // our facade: awning over the window, the cafe sign
    const aw = box(0.9, 0.03, WIN.z1 - WIN.z0 + 0.3, lam(rep(TX.awning, 1, 12)), 3.45, WIN.y1 + 0.32, (WIN.z0 + WIN.z1) / 2, scene); aw.rotation.z = -0.35;
    plane(1.6, 0.4, emissive(basic(TX.sign), 1.1), 3 + WALL_T / 2 + 0.03, 2.75, (WIN.z0 + WIN.z1) / 2, scene, Math.PI / 2);
    plane(WIN.z1 - WIN.z0 + 0.4, 0.06, lam(null, 0x1a1210), 3 + WALL_T / 2 + 0.02, 2.52, (WIN.z0 + WIN.z1) / 2, scene, Math.PI / 2);
  }
  return { scene, door, stand, bell: scene.userData.bell };
}
const k4 = [0xf2ece0, 0x2f5b4a, 0xc8a070];

// ---------- shot helpers ----------
function cam(fov, pos, look, roll = 0) {
  const c = new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 80); c.position.set(...pos); c.lookAt(...look); if (roll) c.rotateZ(roll); return c;
}
let SI = 0;
function addShot(scene, camera, extra = {}) { if (QS.has('camlog')) { const d = new THREE.Vector3(); camera.getWorldDirection(d); console.log('cam', SI, camera.position.toArray().map((v) => v.toFixed(2)).join(','), 'dir', d.toArray().map((v) => v.toFixed(2)).join(','), 'fov', camera.fov); } SHOTS.push({ t0: SI * 3, scene, camera, hard: true, update() {}, ...extra }); SI++; }

// ---------- loading ----------
export async function loadAll() {
  const gl = new GLTFLoader();
  for (const kind of ['vera', 'theo']) {
    const g = await gl.loadAsync(`models/${kind}.glb`); const face = await (await fetch(`models/${kind}_face_tracks.json`)).json();
    const bb = new THREE.Box3().setFromObject(g.scene, true);
    CH[kind] = { src: g.scene, clips: g.animations, face, foot: bb.min.y, S: HEIGHTS[kind] / (bb.max.y - bb.min.y), H: HEIGHTS[kind] };
    console.log(kind, 'bind', bb.min.toArray().map((v) => v.toFixed(2)), bb.max.toArray().map((v) => v.toFixed(2)), 'S', CH[kind].S.toFixed(4), 'clips', g.animations.length);
  }
  makeTextures();
  window.WORDS_OVERRIDE = [];
  const L = { CH, addShot, cafe, character, holdAt, slicePlate, cakeStand, cup, cam, box, plane, mesh, cyl, lam, basic, emissive, blob, cvs, TX, COUNTER, DOME, DOOR, WIN, TABLES, TABLE_H, SEAT_H, V3, THREE };
  if (QS.get('poses')) {   // pose sheet: one still per clip, three phases side by side
    const kind = QS.get('poses'), list = (QS.get('clips') || '').split(',').filter(Boolean);
    const clips = list.length ? list : CH[kind].clips.map((c) => c.name); window.SB = [];
    for (const name of clips) {
      const sc = new THREE.Scene(); sc.background = new THREE.Color(0xd8d0c4); sc.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1));
      const c = THREE.AnimationClip.findByName(CH[kind].clips, name); if (!c) continue;
      const ph = (QS.get('phases') || '0.2,0.5,0.85').split(',').map(Number);
      ph.forEach((f, i) => { const ch = character(kind, { shadow: 0.4 }); ch.pose(name, c.duration * f, 'open', 'neutral'); if (QS.has('side')) ch.root.position.z = (i - (ph.length - 1) / 2) * 0.75; else ch.root.position.x = (i - (ph.length - 1) / 2) * 0.75; sc.add(ch.root); });
      window.SB.push({ id: name, dur: c.duration }); addShot(sc, QS.has('side') ? cam(40, [1.55 * ph.length, 1.0, 0], [0, 0.88, 0]) : cam(40, [0, 1.0, QS.has('back') ? -1.6 * ph.length : 1.55 * ph.length], [0, 0.88, 0]));
    }
    return;
  }
  if (QS.has('film')) L.TL = await (await fetch('film_timeline.json')).json();
  const { buildShots } = await import('./sb_shots.js');
  buildShots(L);
  if (L.TL) window.FILM = { dur: L.TL.dur, frames: Math.round(L.TL.dur * 30), shots: L.TL.shots.map((s) => [s.id, s.t0]) };
}

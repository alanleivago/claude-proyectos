// upnext-01 storyboard: remake of @jongmin.design reel Dd2YemoPJ9- ("UpNext") with Ashley (upnext-girl2, tights) + Pip (upnext-gnome, eyes A).
// Same interface as shots.js for main_sb.js: SHOTS = [{ t0, scene, camera, update(lt, t), hard }], loadAll(renderer).
// Every storyboard shot is a still held 3 s (t0 = 3 * i); the UpNext subtitle, vignette, grain and frame are added in post (tools/compose.py).
// Units: metres, Y up. Bedroom: x in [-2, 2], z in [-2.2, 2]; back wall z = -2.2 (bed headboard), left wall x = -2 (window + desk),
// right wall x = 2 (door). ?probe=1 logs clip measurements instead of building shots.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SHOTS = [];
const LW = 270, LH = 480;
const QS = new URLSearchParams(location.search);
let GIRL, GCLIPS, GFACE, GNOME, NCLIPS, NFACE, MENTOR;   // GNOME/NCLIPS = the mentor model (any character, see mentor.json)
const GIRL_H = 1.6;
let SG = 1, SN = 1, GFOOT = 0;   // model -> metre scales, girl foot offset (model units)

// ---------- helpers ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function snap(m) {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap' + (m.userData.mixK ?? '');
  return m;
}
// emissive surfaces write alpha 2 into the HDR target -> the only bloom sources (main_sb.js)
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
function blob(parent, x, z, r, op = 0.6, y = 0.006) { const o = mesh(new THREE.CircleGeometry(r, 12), basic(null, 0x10121c, { transparent: true, opacity: op, depthWrite: false }), x, y, z, parent); o.rotation.x = -Math.PI / 2; return o; }

// ---------- textures ----------
const TX = {};
function makeTextures() {
  TX.wall = cvs(32, 32, (c, w, h) => { c.fillStyle = '#3c4470'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = '#2d3360'; c.fillRect(x, 0, 3, h); c.fillStyle = '#4a5280'; c.fillRect(x + 5, 0, 1, h); } });
  TX.floor = cvs(32, 32, (c, w, h) => { c.fillStyle = '#a06e3e'; c.fillRect(0, 0, w, h); const r = rng(5);
    for (let y = 0; y < h; y += 8) { c.fillStyle = '#6e4626'; c.fillRect(0, y, w, 1); c.fillStyle = '#b8824c'; c.fillRect(0, y + 1, w, 1); const o = (y / 8) % 2 ? 12 : 26; c.fillStyle = '#6e4626'; c.fillRect(o, y, 1, 8); }
    for (let i = 0; i < 14; i++) { c.fillStyle = r() < 0.5 ? '#8e5e34' : '#ac7846'; c.fillRect((r() * w) | 0, (r() * h) | 0, 3, 1); } });
  TX.wood = cvs(16, 16, (c, w, h) => { c.fillStyle = '#7a5530'; c.fillRect(0, 0, w, h); for (let y = 1; y < h; y += 4) { c.fillStyle = '#634226'; c.fillRect(0, y, w, 1); } c.fillStyle = '#8c6438'; c.fillRect(3, 6, 6, 1); });
  TX.darkwood = cvs(16, 16, (c, w, h) => { c.fillStyle = '#5c4526'; c.fillRect(0, 0, w, h); for (let x = 1; x < w; x += 5) { c.fillStyle = '#4a3720'; c.fillRect(x, 0, 1, h); } });
  TX.quilt = cvs(32, 32, (c, w, h) => { c.fillStyle = '#4f8f58'; c.fillRect(0, 0, w, h);   // green quilt (ref: red plaid duvet) with cream stitching
    for (let k = 0; k < w; k += 16) { c.fillStyle = '#3c7446'; c.fillRect(k, 0, 2, h); c.fillRect(0, k, w, 2); c.fillStyle = '#d8e0b0'; c.fillRect(k + 8, 0, 1, h); c.fillRect(0, k + 8, w, 1); } });
  TX.sheet = cvs(16, 16, (c, w, h) => { c.fillStyle = '#e8e4da'; c.fillRect(0, 0, w, h); c.fillStyle = '#d0ccc2'; for (let i = 0; i < 6; i++) c.fillRect((i * 5) % 15, (i * 7) % 15, 2, 1); });
  TX.rug = cvs(64, 64, (c, w, h) => { c.fillStyle = '#7d8696'; c.fillRect(0, 0, w, h); const r = rng(9);
    for (let i = 0; i < 260; i++) { c.fillStyle = r() < 0.5 ? '#6a7282' : '#8e98a8'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 2); }
    c.strokeStyle = '#5a6272'; c.lineWidth = 3; c.beginPath(); c.arc(32, 32, 22, 0, 7); c.stroke(); });
  TX.mat = cvs(16, 48, (c, w, h) => { c.fillStyle = '#c85a8c'; c.fillRect(0, 0, w, h); c.fillStyle = '#e07aa8'; for (let y = 2; y < h; y += 6) c.fillRect(1, y, w - 2, 1); c.fillStyle = '#a8467a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); });   // yoga mat (replaces the sneakers)
  TX.crt = cvs(32, 32, (c, w, h) => { c.fillStyle = '#d8ccae'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8ac90'; c.fillRect(0, h - 3, w, 3); });
  TX.screen = cvs(32, 24, (c, w, h) => { c.fillStyle = '#1a2230'; c.fillRect(0, 0, w, h); c.fillStyle = '#2c3a4c'; c.fillRect(2, 2, w - 4, h - 4); c.fillStyle = '#3a5068'; c.fillRect(4, 4, 6, 2); });
  TX.door = cvs(24, 48, (c, w, h) => { c.fillStyle = '#7a4a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#683c20'; c.fillRect(3, 3, w - 6, 18); c.fillRect(3, 25, w - 6, 20); c.fillStyle = '#8e5a34'; c.fillRect(4, 4, w - 8, 16); c.fillRect(4, 26, w - 8, 18); });
  TX.sky = cvs(32, 32, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5c9ad8'); g.addColorStop(1, '#bcdcf4'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; c.fillRect(4, 6, 8, 2); c.fillRect(6, 5, 4, 1); c.fillStyle = '#3e8a3a'; for (let x = 0; x < w; x += 6) { c.beginPath(); c.arc(x + 3, h - 4, 6, 0, 7); c.fill(); } c.fillStyle = '#2c6a2c'; c.fillRect(0, h - 3, w, 3); });
  TX.skyNight = cvs(32, 32, (c, w, h) => { c.fillStyle = '#0e1430'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8d0ff'; [[5, 4], [20, 8], [27, 3], [12, 12]].forEach(([x, y]) => c.fillRect(x, y, 1, 1)); c.fillStyle = '#16301e'; for (let x = 0; x < w; x += 6) { c.beginPath(); c.arc(x + 3, h - 4, 6, 0, 7); c.fill(); } });
  TX.pot = cvs(8, 8, (c) => { c.fillStyle = '#b8603a'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#9a4c2c'; c.fillRect(0, 6, 8, 2); });
  TX.leaf = cvs(16, 16, (c, w, h) => { c.fillStyle = '#3e9a44'; c.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 30; i++) { c.fillStyle = r() < 0.5 ? '#2c7a34' : '#5cba5c'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 2); } });
  TX.phoneScreen = cvs(8, 16, (c, w, h) => { c.fillStyle = '#9cc4ff'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8f0ff'; for (let y = 2; y < h - 2; y += 3) c.fillRect(1, y, 5, 1); c.fillStyle = '#5c84d8'; c.fillRect(0, 0, w, 2); });
  TX.phoneOff = cvs(8, 16, (c, w, h) => { c.fillStyle = '#14161e'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2e3a'; c.fillRect(1, 1, 2, 4); });
}
const DIG7 = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function clockTex(time, col = '#ff3a2e') {   // red 7-segment LED face, 48x20
  return cvs(48, 20, (c, w, h) => {
    c.fillStyle = '#0c0606'; c.fillRect(0, 0, w, h);
    const draw = (d, x) => { const s = DIG7[d], y = 3, L = 6, T = 2;
      const seg = { a: [x + 1, y, L, T], b: [x + L + 1, y + 1, T, L], c: [x + L + 1, y + L + 2, T, L], d: [x + 1, y + 2 * L + 2, L, T], e: [x, y + L + 2, T, L], f: [x, y + 1, T, L], g: [x + 1, y + L + 1, L, T] };
      for (const k of s) { c.fillStyle = col; c.fillRect(...seg[k]); } };
    const [hh, mm] = time.split(':'); const digs = (hh.length === 1 ? ' ' + hh : hh) + mm; let x = 4;
    [...digs].forEach((d, i) => { if (d !== ' ') draw(d, x); x += 10; if (i === 1) { c.fillStyle = col; c.fillRect(x, 7, 2, 2); c.fillRect(x, 12, 2, 2); x += 4; } });
  });
}
function noteTex(col, lines = 3) { return cvs(12, 12, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(40,40,60,0.55)'; for (let i = 0; i < lines; i++) c.fillRect(2, 3 + i * 3, i === lines - 1 ? 5 : 8, 1); }); }

// ---------- characters ----------
// characters are UNLIT (MeshBasicMaterial + nearest, like her viewer2 / the approved review renders); a per-shot tint colour
// stands in for the scene light (night blue, phone lilac). v1 used Lambert with a 45 % light mix and faceSet() cloned the face
// materials, which dropped that mix + the vertex snap -> the face decals were fully Lambert-shaded and off-grid ("face shadows").
function charMat(src) { return snap(new THREE.MeshBasicMaterial({ name: src.name, map: src.map, alphaTest: 0.5, side: THREE.DoubleSide })); }
function prepChar(root) {
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => { nearest(m.map); return charMat(m); };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
}
function faceSet(root, eyes, mouth, kind) {
  const meta = kind === 'girl' ? GFACE._meta : (MENTOR.face_lists ? null : NFACE._meta);
  const cols = meta ? (meta.cols || meta.cells) : MENTOR.face_cols, rows = meta ? (meta.rows || 1) : MENTOR.face_rows;
  if (kind !== 'girl') { eyes = (MENTOR.eyes_map || {})[eyes] || eyes; mouth = (MENTOR.mouth_map || {})[mouth] || mouth;
    if (!MENTOR.mouth_material && MENTOR.talk_suffix && /^talk/.test(mouth || '')) eyes = eyes + MENTOR.talk_suffix; }   // no mouth: talking = pupil pulse cells
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = meta ? meta[m.name] : MENTOR.face_lists[m.name]; if (!cells) return;
      if (!m.userData.faceOwn) { const t = m.map.clone(); nearest(t); t.flipY = false; t.needsUpdate = true; m = charMat({ name: m.name, map: t }); m.userData.faceOwn = true; if (Array.isArray(o.material)) o.material[i] = m; else o.material = m; }
      const want = (kind === 'girl' ? /eyes/.test(m.name) : m.name === MENTOR.eyes_material) ? eyes : mouth; const k = cells.indexOf(want);
      if (k < 0) console.log('missing face cell', m.name, want);
      else m.map.offset.set((k % cols) / cols, Math.floor(k / cols) / rows);
    });
  });
}
// kind 'girl' | 'mentor' (mentor.json). Returns { root (group at the feet), model, pose(clip, t, eyes, mouth), bone(name), tint(color) }
function character(kind, { tint = 0xffffff, shadow = 0.55 } = {}) {
  const src = kind === 'girl' ? GIRL : GNOME, clips = kind === 'girl' ? GCLIPS : NCLIPS;
  const model = SkeletonUtils.clone(src); prepChar(model);
  const s = kind === 'girl' ? SG : SN; model.scale.setScalar(s); model.position.y = kind === 'girl' ? -GFOOT * s : 0;
  const root = new THREE.Group(); root.add(model);
  const sh = shadow ? blob(root, 0, 0, kind === 'girl' ? 0.26 : (MENTOR.shadow_r || 0.2), shadow) : null;
  model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.set(tint)); });
  const mixer = new THREE.AnimationMixer(model); let cur = null;
  const ch = {
    root, model, kind, shadow: sh, clipsAll: clips,
    pose(clip, t, eyes, mouth) {
      if (kind !== 'girl') clip = (MENTOR.clip_map || {})[clip] || clip;
      const c = THREE.AnimationClip.findByName(clips, clip); if (!c) { console.log('NO CLIP', kind, clip); return ch; }
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
// hold a prop: world transform from a bone + local offset (model units) and local rotation; prop added to the scene
function holdAt(scene, ch, boneName, prop, off = [0, 0, 0], rot = [0, 0, 0]) {
  ch.root.updateMatrixWorld(true); const b = ch.bone(boneName);
  prop.position.copy(b.localToWorld(V3(...off)));
  const q = new THREE.Quaternion(); b.getWorldQuaternion(q); prop.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)));
  scene.add(prop); return prop;
}

// ---------- props ----------
function phone(on = true) {
  const g = new THREE.Group();
  box(0.07, 0.14, 0.01, lam(null, 0x16181f), 0, 0, 0, g);
  const s = plane(0.062, 0.128, on ? emissive(basic(TX.phoneScreen)) : basic(TX.phoneOff), 0, 0, 0.0055, g); s.name = 'screen';
  return g;
}
function ledClock(time) {   // bedside alarm clock, origin at the bottom centre, display faces +z
  const g = new THREE.Group();
  box(0.2, 0.09, 0.08, lam(null, 0x1a1a1e), 0, 0.045, 0, g);
  plane(0.17, 0.065, emissive(basic(clockTex(time)), 2.4), 0, 0.047, 0.041, g);   // LEDs glow hardest in the ref
  return g;
}
function plant(scene, x, y, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g);
  mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.16, 8), lam(TX.pot), 0, 0.08, 0, g);
  const lm = lam(TX.leaf);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; const l = mesh(new THREE.ConeGeometry(0.05, 0.28, 4), lm, Math.cos(a) * 0.05, 0.27, Math.sin(a) * 0.05, g); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
  mesh(new THREE.IcosahedronGeometry(0.08, 0), lm, 0, 0.3, 0, g);
  return g;
}

// ---------- the bedroom ----------
// light: 'night' (dark blue, phone glow), 'lamp' (night but the room readable), 'day' (warm window light)
const BED = { x: 0.35, z0: -2.2, len: 2.0, w: 1.05, top: 0.43 };   // headboard at the back wall, foot at z = -0.2
const NS = { x: -0.5, z: -1.95, w: 0.46, d: 0.38, h: 0.55 };      // nightstand
const DESK = { x: -1.62, z: 0.9, w: 0.7, d: 1.2, h: 0.74 };        // desk against the left wall (long side along z)
function bedroom(light = 'day', { clock = '11:52', phoneOnNS = false, phoneOnDesk = false, mat = false, doorOpen = 0, rug = true } = {}) {
  const scene = new THREE.Scene();
  const night = light !== 'day';
  scene.background = new THREE.Color(night ? 0x0c1024 : 0x8090b0);
  if (light === 'day') {
    scene.add(new THREE.HemisphereLight(0xfff2e0, 0x6a5040, 1.9));
    const sun = new THREE.DirectionalLight(0xffe2b8, 1.6); sun.position.set(-4, 5, 1.5); scene.add(sun);
  } else if (light === 'lamp') {
    scene.add(new THREE.HemisphereLight(0xb8c4ff, 0x40384a, 1.3));
    const k = new THREE.DirectionalLight(0xdce4ff, 0.9); k.position.set(2, 4, 3); scene.add(k);
  } else {
    scene.add(new THREE.HemisphereLight(0x5c6cb8, 0x181830, 0.85));
    const moon = new THREE.DirectionalLight(0x8090ff, 0.5); moon.position.set(-4, 4, 1); scene.add(moon);
  }
  const W = 4, D = 4.2;
  // floor, walls
  const fl = plane(W, D, lam(rep(TX.floor, 5, 5)), 0, 0, -0.1, scene, 0, -Math.PI / 2);
  const wm = lam(rep(TX.wall, 6, 3));
  plane(W, 2.6, wm, 0, 1.3, -2.2, scene);                              // back
  plane(D, 2.6, wm, -2, 1.3, -0.1, scene, Math.PI / 2);                // left
  plane(D, 2.6, wm, 2, 1.3, -0.1, scene, -Math.PI / 2);                // right
  plane(W, 2.6, wm, 0, 1.3, 2.0, scene, Math.PI);                      // front
  plane(W, D, basic(null, night ? 0x262c44 : 0xc8c2b6), 0, 2.6, -0.1, scene, 0, Math.PI / 2);   // ceiling
  const crown = lam(null, night ? 0x8a8aa0 : 0xe8e2d4);   // crown moulding where the walls meet the ceiling
  box(W, 0.07, 0.05, crown, 0, 2.565, -2.175, scene); box(W, 0.07, 0.05, crown, 0, 2.565, 1.975, scene); box(0.05, 0.07, D, crown, -1.975, 2.565, -0.1, scene); box(0.05, 0.07, D, crown, 1.975, 2.565, -0.1, scene);
  const skirt = lam(null, 0xd8d0c0);
  box(W, 0.08, 0.02, skirt, 0, 0.04, -2.19, scene); box(0.02, 0.08, D, skirt, -1.99, 0.04, -0.1, scene); box(0.02, 0.08, D, skirt, 1.99, 0.04, -0.1, scene); box(W, 0.08, 0.02, skirt, 0, 0.04, 1.99, scene);
  // window on the left wall (green garden outside)
  const wz = -0.75;
  plane(0.9, 1.0, night ? basic(TX.skyNight, 0x8090c0) : emissive(basic(TX.sky), 0.45), -1.995, 1.45, wz, scene, Math.PI / 2);
  const fr = lam(null, 0xece6d8);
  box(0.06, 1.1, 0.06, fr, -1.97, 1.45, wz - 0.48, scene); box(0.06, 1.1, 0.06, fr, -1.97, 1.45, wz + 0.48, scene);
  box(0.06, 0.06, 1.0, fr, -1.97, 1.97, wz, scene); box(0.12, 0.05, 1.04, fr, -1.94, 0.93, wz, scene); box(0.04, 1.0, 0.03, fr, -1.975, 1.45, wz, scene); box(0.04, 0.03, 0.9, fr, -1.975, 1.45, wz, scene);
  // door on the right wall
  const dz = 1.1, dw = 0.82, dh = 2.0;
  const dfr = lam(null, 0x5a3a20);
  box(0.08, dh + 0.08, 0.06, dfr, 1.97, (dh + 0.08) / 2, dz - dw / 2 - 0.03, scene); box(0.08, dh + 0.08, 0.06, dfr, 1.97, (dh + 0.08) / 2, dz + dw / 2 + 0.03, scene); box(0.08, 0.06, dw + 0.12, dfr, 1.97, dh + 0.05, dz, scene);
  const door = new THREE.Group(); door.position.set(1.96, 0, dz - dw / 2); scene.add(door);   // hinge on the -z side
  box(0.045, dh, dw, lam(TX.door), 0, dh / 2, dw / 2, door);
  mesh(new THREE.SphereGeometry(0.03, 6, 4), lam(null, 0xe8c040), -0.04, 1.0, dw - 0.08, door);
  door.rotation.y = -doorOpen;   // opens into the room
  if (doorOpen > 0) plane(dw, dh, emissive(basic(null, 0xfff8e8)), 1.995, dh / 2, dz, scene, -Math.PI / 2);   // bright hallway light
  // bed (v2, low poly but modelled): turned posts, side rails, slatted headboard with a top rail, low footboard,
  // a rounded mattress with a sheet, a soft pillow, and a draped quilt (folds, side + foot overhang, turned-down band)
  const bw = lam(TX.darkwood), bw2 = lam(TX.darkwood, 0xc8a888);
  const zc = BED.z0 + BED.len / 2, zf = BED.z0 + BED.len, hx = BED.w / 2 + 0.05;
  for (const sx of [-1, 1]) {
    mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.05, 6), bw, BED.x + sx * hx, 0.525, BED.z0 + 0.04, scene);            // head posts
    mesh(new THREE.SphereGeometry(0.048, 6, 4), bw2, BED.x + sx * hx, 1.07, BED.z0 + 0.04, scene);
    mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.62, 6), bw, BED.x + sx * hx, 0.31, zf, scene);                        // foot posts
    mesh(new THREE.SphereGeometry(0.046, 6, 4), bw2, BED.x + sx * hx, 0.64, zf, scene);
    box(0.045, 0.13, BED.len - 0.06, bw, BED.x + sx * (hx - 0.005), 0.21, zc + 0.02, scene);                              // side rails
  }
  box(BED.w + 0.06, 0.06, 0.05, bw2, BED.x, 0.98, BED.z0 + 0.04, scene);                                                  // headboard top rail
  box(BED.w + 0.06, 0.05, 0.045, bw, BED.x, 0.5, BED.z0 + 0.04, scene);                                                   // lower rail
  for (let k = 0; k < 7; k++) box(0.06, 0.44, 0.03, bw, BED.x - BED.w / 2 + 0.08 + k * (BED.w - 0.16) / 6, 0.74, BED.z0 + 0.04, scene);   // slats
  box(BED.w + 0.06, 0.22, 0.04, bw, BED.x, 0.4, zf, scene); box(BED.w + 0.06, 0.05, 0.05, bw2, BED.x, 0.53, zf, scene);   // footboard
  box(BED.w + 0.04, 0.03, BED.len - 0.08, bw, BED.x, 0.27, zc + 0.02, scene);                                             // slat base
  const mat_ = mesh(new RoundedBoxGeometry(BED.w, 0.16, BED.len - 0.1, 2, 0.045), lam(rep(TX.sheet, 3, 5)), BED.x, BED.top - 0.08, zc + 0.02, scene);
  const pil = mesh(new RoundedBoxGeometry(0.64, 0.12, 0.36, 2, 0.05), lam(TX.sheet, 0xf8f6f0), BED.x, BED.top + 0.05, BED.z0 + 0.3, scene);
  pil.scale.set(1, 1, 1); pil.rotation.x = -0.1;
  let quiltObj = null;
  // quilt: grid cloth; u across (|u| > 1 = hanging over the sides), v along (v > 1 = hanging over the foot);
  // lump = height of a body under it (centred at x = BED.x - 0.05, from z0 + 0.08 to the feet at zFeet)
  function quilt(z0 = BED.z0 + 0.62, z1 = zf - 0.01, lump = 0, tint = 0xffffff, zFeet = -0.36, width = 0.27) {
    if (quiltObj) scene.remove(quiltObj);
    const g = new THREE.Group(); quiltObj = g; scene.add(g);
    const HO = 0.6, VO = 0.35, hang = 0.27, W2 = BED.w / 2 + 0.01;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const body = (x, z) => lump * Math.exp(-(((x - (BED.x - 0.05)) / width) ** 2) * 1.6) * sm(z0 + 0.02, z0 + 0.16, z) * (1 - sm(zFeet - 0.05, zFeet + 0.12, z));
    // one cloth strip from za to zb (foot overhang only if footHang), lifted by lift
    function cloth(za, zb, lift, mtl, footHang, NX = 18, NZ = 16) {
      const pos = [], uv = [], idx = [], VV = footHang ? VO : 0;
      for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
        const u = -1 - HO + (2 + 2 * HO) * i / NX, v = (1 + VV) * j / NZ, au = Math.abs(u), su = Math.sign(u) || 1;
        const hu = au > 1 ? (au - 1) / HO : 0, hv = v > 1 ? (v - 1) / VO : 0, h = Math.max(hu, hv);
        let x = BED.x + (au <= 1 ? u * W2 : su * (W2 + 0.03 * hu)), z = v <= 1 ? za + v * (zb - za) : zb + 0.03 * hv;
        const zz = Math.min(z, zb), xx = BED.x + Math.max(-W2, Math.min(W2, x - BED.x));
        const bz = Math.max(zz, z0 + 0.1);   // the band at the top edge rides the lump as if the body were under it
        let y = BED.top + 0.028 + lift + body(xx, bz) * (1 - h) + 0.007 * Math.sin(xx * 23 + zz * 7) * (1 - h) - h * hang;
        if (hu > 0) x += su * (0.014 * Math.sin(z * 26) + lift) * hu;
        if (hv > 0) z += 0.014 * Math.sin(x * 24) * hv;
        pos.push(x, y, z); uv.push(i / NX * 3, j / NZ * 3 * (zb - za) / Math.max(0.5, z1 - z0));
      }
      for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      return mesh(geo, mtl, 0, 0, 0, g);
    }
    cloth(z0, z1, 0, lam(rep(TX.quilt, 1, 1), tint, { side: THREE.DoubleSide }), true);
    cloth(z0 - 0.015, z0 + 0.11, 0.012, lam(TX.sheet, tint, { side: THREE.DoubleSide }), false, 18, 3);   // turned-down sheet band
    return g;
  }
  quilt();
  // v2: the quilt DRAPED over her real pose: her skinned vertices -> a height map over the bed (max per cell, dilated, then
  // smoothed upward only, + 4 cm), the cloth rides it so nothing of her passes through it; z0 (the top edge) can slide
  // (to the waist when she sits up). drape(ch, opts) -> update(z0) to call after each pose.
  function drape(ch, { z0 = -1.62, z1 = zf - 0.01, tint = 0xffffff } = {}) {
    if (quiltObj) scene.remove(quiltObj);
    const g = new THREE.Group(); quiltObj = g; scene.add(g);
    const HO = 0.6, VO = 0.35, hang = 0.27, W2 = BED.w / 2 + 0.01, GX = 28, GZ = 44;
    const gx0 = BED.x - W2 - 0.06, gw = 2 * W2 + 0.12, gz0 = BED.z0 + 0.05, gl = zf + 0.1 - gz0;
    const hm = new Float32Array(GX * GZ), tmp = new Float32Array(GX * GZ), v = new THREE.Vector3(), meshes = [];
    ch.model.traverse((o) => { if (o.isSkinnedMesh) meshes.push(o); });
    function heights() {
      hm.fill(0); ch.root.updateMatrixWorld(true);
      for (const m of meshes) { const p = m.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); m.applyBoneTransform(i, v); v.applyMatrix4(m.matrixWorld);
          const ix = Math.floor((v.x - gx0) / gw * GX), iz = Math.floor((v.z - gz0) / gl * GZ); if (ix < 0 || ix >= GX || iz < 0 || iz >= GZ) continue;
          const h = v.y - BED.top; if (h > hm[iz * GX + ix]) hm[iz * GX + ix] = h; } }
      for (let pass = 0; pass < 4; pass++) { tmp.set(hm);
        for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) { let mx = 0, sum = 0, n = 0;
          for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, zz = z + dz; if (xx < 0 || xx >= GX || zz < 0 || zz >= GZ) continue; const h = tmp[zz * GX + xx]; if (h > mx) mx = h; sum += h; n++; }
          hm[z * GX + x] = pass === 0 ? mx : Math.max(tmp[z * GX + x], sum / n); } }
    }
    const H = (x, z) => { const fx = (x - gx0) / gw * GX - 0.5, fz = (z - gz0) / gl * GZ - 0.5;
      const a = Math.max(0, Math.min(GX - 1, Math.floor(fx))), b = Math.max(0, Math.min(GZ - 1, Math.floor(fz))), a1 = Math.min(GX - 1, a + 1), b1 = Math.min(GZ - 1, b + 1);
      const tx = Math.min(1, Math.max(0, fx - a)), tz = Math.min(1, Math.max(0, fz - b));
      return (hm[b * GX + a] * (1 - tx) + hm[b * GX + a1] * tx) * (1 - tz) + (hm[b1 * GX + a] * (1 - tx) + hm[b1 * GX + a1] * tx) * tz; };
    function strip(lift, mtl, footHang, NX, NZ) {
      const n = (NX + 1) * (NZ + 1), idx = [], uv = [];
      for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) uv.push(i / NX * 3, j / NZ * 3);
      for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      const o = mesh(geo, mtl, 0, 0, 0, g); o.frustumCulled = false;
      o.userData.fill = (za, zb) => { const P = geo.attributes.position.array, VV = footHang ? VO : 0; let k = 0;
        for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
          const u = -1 - HO + (2 + 2 * HO) * i / NX, w = (1 + VV) * j / NZ, au = Math.abs(u), su = Math.sign(u) || 1;
          const hu = au > 1 ? (au - 1) / HO : 0, hv = w > 1 ? (w - 1) / VO : 0, h = Math.max(hu, hv);
          let x = BED.x + (au <= 1 ? u * W2 : su * (W2 + 0.03 * hu)), z = w <= 1 ? za + w * (zb - za) : zb + 0.03 * hv;
          const zz = Math.min(z, zb), xx = BED.x + Math.max(-W2, Math.min(W2, x - BED.x));
          const top = BED.top + lift + Math.max(0.028, H(xx, zz) + 0.04) + 0.006 * Math.sin(xx * 23 + zz * 7);
          let y = top - h * (top - BED.top + hang);
          if (hu > 0) x += su * (0.014 * Math.sin(z * 26) + lift) * hu;
          if (hv > 0) z += 0.014 * Math.sin(x * 24) * hv;
          P[k++] = x; P[k++] = y; P[k++] = z; }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); };
      return o;
    }
    const q = strip(0, lam(rep(TX.quilt, 1, 1), tint, { side: THREE.DoubleSide }), true, 22, 24);
    const band = strip(0.012, lam(TX.sheet, tint, { side: THREE.DoubleSide }), false, 22, 3);
    const update = (zTop = z0) => { heights(); q.userData.fill(zTop, z1); band.userData.fill(zTop - 0.015, zTop + 0.11); };
    update(z0); return update;
  }
  // rug (round, grey) in the middle of the room
  if (rug) { const r = mesh(new THREE.CircleGeometry(0.85, 16), lam(TX.rug), -0.55, 0.004, 0.55, scene); r.rotation.x = -Math.PI / 2; }
  // nightstand + LED clock
  const nw = lam(TX.wood);
  box(NS.w, NS.h, NS.d, nw, NS.x, NS.h / 2, NS.z, scene);
  box(NS.w - 0.06, 0.16, 0.01, lam(TX.wood, 0x9a7048), NS.x, NS.h - 0.14, NS.z + NS.d / 2 + 0.004, scene);
  box(0.08, 0.025, 0.025, lam(null, 0x3a2a18), NS.x, NS.h - 0.14, NS.z + NS.d / 2 + 0.02, scene);
  const clk = ledClock(clock); clk.position.set(NS.x + 0.06, NS.h, NS.z + 0.04); clk.rotation.y = 0.25; scene.add(clk);
  // red LED glow at night
  if (night) { const pl = new THREE.PointLight(0xff4030, 0.25, 0.6); pl.position.set(NS.x + 0.06, NS.h + 0.1, NS.z + 0.2); scene.add(pl); }
  // desk + CRT + keyboard + chair + sticky notes + plant
  const dk = lam(TX.wood, 0xc89868);
  box(DESK.w, 0.05, DESK.d, dk, DESK.x, DESK.h - 0.025, DESK.z, scene);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, DESK.h - 0.05, 0.05, dk, DESK.x + sx * (DESK.w / 2 - 0.04), (DESK.h - 0.05) / 2, DESK.z + sz * (DESK.d / 2 - 0.04), scene);
  const crt = new THREE.Group(); crt.position.set(DESK.x - 0.08, DESK.h, DESK.z + 0.25); crt.rotation.y = Math.PI / 2; scene.add(crt);
  const cm = lam(TX.crt);
  box(0.42, 0.36, 0.3, cm, 0, 0.2, 0, crt); box(0.32, 0.28, 0.2, cm, 0, 0.2, -0.2, crt); box(0.26, 0.04, 0.24, cm, 0, 0.02, 0, crt);
  plane(0.34, 0.26, emissive(basic(TX.screen, night ? 0x8090b0 : 0xffffff, { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })), 0, 0.21, 0.162, crt);   // v2: 12 mm proud of the bezel + polygon offset (v1 flickered: z-fight 1 mm)
  const kb = box(0.12, 0.025, 0.38, lam(null, 0xd8ccae), DESK.x + 0.22, DESK.h + 0.012, DESK.z + 0.25, scene);
  // sticky notes on the wall above the desk (yellow, pink, blue)
  [['#f4d84a', 0.95, -0.05], ['#f08ab0', 1.2, 0.18], ['#7ab8e8', 0.95, 0.4]].forEach(([c, y, dz2], i) => { const n = box(0.012, 0.11, 0.11, lam(noteTex(c)), -1.99, y + 0.3, DESK.z + dz2, scene); n.rotation.x = (i - 1) * 0.08; n.material = [lam(null, new THREE.Color(c).getHex()), lam(null, new THREE.Color(c).getHex()), lam(null, new THREE.Color(c).getHex()), lam(null, new THREE.Color(c).getHex()), lam(noteTex(c)), lam(noteTex(c))]; n.material.forEach((m) => m.map && (m.map.center.set(0.5, 0.5), m.map.rotation = Math.PI / 2)); });
  plant(scene, DESK.x - 0.12, DESK.h, DESK.z - 0.5, 0.9);
  // chair (grey) in front of the desk
  const chm = lam(null, 0x8a8e96);
  const chr = new THREE.Group(); chr.position.set(DESK.x + 0.55, 0, DESK.z + 0.42); scene.add(chr);
  box(0.42, 0.05, 0.42, chm, 0, 0.46, 0, chr); box(0.05, 0.45, 0.4, chm, 0.2, 0.7, 0, chr);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.035, 0.46, 0.035, chm, sx * 0.18, 0.23, sz * 0.18, chr);
  // big floor plant in the corner (green balance)
  plant(scene, 1.62, 0, 1.75, 1.8);
  // yoga mat rolled out at the bed foot side (the nudge)
  let matObj = null;
  if (mat) { matObj = box(0.6, 0.012, 1.3, lam(TX.mat), -0.5, 0.006, -0.95, scene); }
  let ph = null;
  if (phoneOnNS) { ph = phone(false); ph.rotation.set(-Math.PI / 2, 0, 0.4); ph.position.set(NS.x - 0.12, NS.h + 0.006, NS.z + 0.06); scene.add(ph); }
  if (phoneOnDesk) { ph = phone(true); ph.rotation.set(-Math.PI / 2, 0, 1.3); ph.position.set(DESK.x + 0.14, DESK.h + 0.006, DESK.z - 0.12); scene.add(ph);
    const cable = box(0.006, 0.006, 0.3, lam(null, 0xf0f0f0), DESK.x + 0.0, DESK.h + 0.004, DESK.z + 0.02, scene); cable.rotation.y = 0.5; }
  return { scene, door, clock: clk, phone: ph, mat: matObj, quilt, drape, lights: scene.children.filter((o) => o.isLight) };
}

// ---------- shot helpers ----------
function cam(fov, pos, look, roll = 0) {
  const c = new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 60); c.position.set(...pos); c.lookAt(...look); if (roll) c.rotateZ(roll); return c;
}
let SI = 0;
function addShot(scene, camera, extra = {}) { SHOTS.push({ t0: SI * 3, scene, camera, hard: true, update() {}, ...extra }); SI++; }

// ---------- probe: log clip extents ----------
function probe() {
  for (const kind of ['girl', 'mentor']) {
    const clips = kind === 'girl' ? GCLIPS : NCLIPS;
    for (const c of clips) {
      const ch = character(kind); const sc = new THREE.Scene(); sc.add(ch.root);
      const out = [];
      for (const f of [0, 0.5, 1]) {
        ch.pose(c.name, c.duration * f * 0.999);
        const bb = new THREE.Box3().setFromObject(ch.model, true);
        const hd = ch.world('Head'); const hr = ch.bone('Hand.R') ? ch.world('Hand.R') : null; const pv = ch.bone('Pelvis') ? ch.world('Pelvis') : ch.world('Body');
        out.push(`f${f} bb[${bb.min.toArray().map((v) => v.toFixed(2))} | ${bb.max.toArray().map((v) => v.toFixed(2))}] head ${hd.toArray().map((v) => v.toFixed(2))} handR ${hr ? hr.toArray().map((v) => v.toFixed(2)) : '-'} pelvis ${pv.toArray().map((v) => v.toFixed(2))}`);
      }
      console.log(kind, c.name, c.duration.toFixed(2), '\n  ' + out.join('\n  '));
    }
  }
}

// ---------- loading ----------
export async function loadAll() {
  const gl = new GLTFLoader();
  const g = await gl.loadAsync('models/upnext/girl_up01_tights.glb'); GIRL = g.scene; GCLIPS = g.animations;
  MENTOR = await (await fetch(QS.get('mentor') || 'mentor.json')).json();
  const n = await gl.loadAsync(MENTOR.glb); GNOME = n.scene; NCLIPS = n.animations;
  // optional body-texture override (mentor.json "tex_override": {material: png}; ?mtex=<png> wins) - e.g. Pip's v2 palette
  { const ov = Object.assign({}, MENTOR.tex_override || {}); if (QS.get('mtex')) for (const k of Object.keys(ov).length ? Object.keys(ov) : ['Gnome']) ov[k] = QS.get('mtex');
    for (const [mat, url] of Object.entries(ov)) { const t = await new THREE.TextureLoader().loadAsync(url); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; nearest(t);
      GNOME.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.name === mat) m.map = t; }); }); } }
  GFACE = await (await fetch('models/upnext/girl_face_tracks.json')).json();
  NFACE = MENTOR.face_tracks ? await (await fetch(MENTOR.face_tracks)).json() : {};
  // scales from the bind pose: girl 1.6 m (feet at y = 0), gnome GNOME_H
  { const bb = new THREE.Box3().setFromObject(GIRL, true); GFOOT = bb.min.y; SG = GIRL_H / (bb.max.y - bb.min.y); console.log('girl bind', bb.min.toArray(), bb.max.toArray(), 'S', SG); }
  { const bb = new THREE.Box3().setFromObject(GNOME, true); SN = MENTOR.height_m / (bb.max.y - bb.min.y); MENTOR.depth = (bb.max.z - bb.min.z) * SN; MENTOR.back = -bb.min.z * SN; console.log('mentor bind', bb.min.toArray(), bb.max.toArray(), 'S', SN); }
  makeTextures();
  window.WORDS_OVERRIDE = [];
  if (QS.has('facetest')) {   // face close-ups (front + 3/4) in the engine, to compare with her approved viewer renders
    for (const [eyes, mouth, yaw] of [['open', 'neutral', 0], ['open', 'neutral', 0.6], ['half', 'talkSmall', 0.3], ['sad', 'sadPout', -0.4]]) {
      const sc = new THREE.Scene(); sc.background = new THREE.Color(0xebddc7); const g = character('girl', { shadow: 0 }); g.pose('his_idle', 0, eyes, mouth); sc.add(g.root);
      const E = g.world('Head', [0, 1.2, 0]); addShot(sc, cam(30, [E.x + Math.sin(yaw) * 0.75, E.y + 0.02, E.z + Math.cos(yaw) * 0.75], [E.x, E.y, E.z]));
    }
    return;
  }
  if (QS.has('probe')) { probe(); const sc = new THREE.Scene(); addShot(sc, cam(40, [0, 1, 3], [0, 1, 0])); return; }
  if (QS.has('film')) {   // the film: shots from film_shots.js on the voice timeline
    const TL = await (await fetch('film_timeline.json')).json();
    const { buildFilm } = await import('./film_shots.js');
    buildFilm({ TL, SHOTS, MENTOR, GFACE, bedroom, character, phone, cam, box, plane, mesh, lam, basic, blob, cvs, TX, BED, NS, DESK, V3, THREE });
    window.FILM = { dur: TL.dur, frames: Math.round(TL.dur * 30), shots: TL.shots.map((s) => [s.id, s.t0]) };
    return;
  }
  const { buildShots } = await import('./sb_shots.js');
  buildShots({ MENTOR, addShot, bedroom, character, holdAt, phone, ledClock, plant, cam, box, plane, mesh, lam, basic, blob, cvs, TX, BED, NS, DESK, V3, THREE });
}

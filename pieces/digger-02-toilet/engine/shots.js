// digger-01-fridge: style frames + storyboard board for "Digger 01: the fridge".
// Engine copied from pieces/zero-test (post PS1 pass, captions, fx.js). Each shot: { t0, scene, camera, update(lt, t), overlay?, fx? }.
// index.html            -> 4 style frames, 3 s each (hook, icehouse, mail, cross-section)
// index.html?board=1    -> every storyboard shot, 3 s each (BOARD list at the bottom)
// Units: metres, Y up. World look: snowy post-human village (MML2 Yosyonke feel): overcast grey sky, fog, snowfall,
// stone + dark plank houses with snowy gable roofs, iron railings, dead lamp posts, snowy pines, ruined towers in the fog.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FX } from './fx.js';

export const SHOTS = [];
const LW = 270, LH = 480;
const QS = new URLSearchParams(location.search);
export const SOFT = !QS.has('flat');
export const SHADE_K = Number(QS.get('shade') ?? 0.3);
const CH = 1.6, S = CH / 13.2;
const M = {}, T = {};
let ZERO, CLIPS, FACES;

// ---------- helpers ----------
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, k) => a + (b - a) * k;
function snap(m) {   // PS1 wobble: projected vertices snap to the 270x480 grid
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap';
  return m;
}
function nearest(t) { if (t) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; } return t; }
function snapAll(root) { root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(snap); }); return root; }
const col = (c) => (typeof c === 'number' && c <= 4 ? new THREE.Color(c, c, c) : new THREE.Color(c));   // 0..4 = grey tint factor
const basic = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshBasicMaterial({ map, color: col(color), ...extra }));
const lam = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshLambertMaterial({ map, color: col(color), ...extra }));
function mesh(geo, m, x, y, z, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function box(w, h, d, m, x, y, z, parent) { return mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent); }
function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = mesh(new THREE.PlaneGeometry(w, h), m, x, y, z, parent); o.rotation.set(rx, ry, 0); return o; }
function rep(t, rx, ry) { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; }
async function img(url) { const i = new Image(); i.src = url; await i.decode(); return i; }
function canvasTex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t); }
async function loadTex(url, px) {
  const i = await img(url); const k = Math.min(1, px / Math.max(i.width, i.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(i.width * k); cv.height = Math.round(i.height * k);
  cv.getContext('2d').drawImage(i, 0, 0, cv.width, cv.height); return canvasTex(cv);
}
function cvs(w, h, f) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; f(cv.getContext('2d'), w, h); return canvasTex(cv); }
async function texOr(name, px, fill) {   // Flow texture (tex/d_<name>.png) or a flat fallback
  try { return await loadTex(`tex/d_${name}.png`, px); } catch { return cvs(8, 8, (c) => { c.fillStyle = fill; c.fillRect(0, 0, 8, 8); }); }
}

// ---------- sky: overcast MML2 grey (screen-space gradient, 5-bit bands) + fog ----------
export const SKY_PRESETS = {
  mml2: { top: [150, 154, 170], horizon: [208, 210, 216], hy: 0.62, sat: 1.0, bands: 32 },
  interior: { top: [40, 38, 44], horizon: [70, 66, 70], hy: 0.6, sat: 1.0, bands: 32 },
  lab: { top: [10, 16, 40], horizon: [30, 52, 96], hy: 0.9, sat: 1.0, bands: 32 },
  summer: { top: [120, 160, 214], horizon: [238, 214, 168], hy: 0.62, sat: 1.0, bands: 32 },
  night: { top: [10, 14, 38], horizon: [44, 54, 96], hy: 0.62, sat: 1.0, bands: 32 },
  morning: { top: [150, 176, 214], horizon: [250, 214, 170], hy: 0.62, sat: 1.0, bands: 32 },
};
function skyColor(p, k) {
  const c = p.top.map((v, i) => lerp(v, p.horizon[i], clamp01(k))), l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return c.map((v) => { const x = Math.min(255, Math.max(0, l + (v - l) * p.sat)); return Math.round(Math.round(x / 255 * (p.bands - 1)) / (p.bands - 1) * 255); });
}
function skyBgTex(p) { return cvs(1, LH, (c) => { for (let y = 0; y < LH; y++) { c.fillStyle = `rgb(${skyColor(p, (y + 0.5) / (p.hy * LH))})`; c.fillRect(0, y, 1, 1); } }); }
function addSky(scene, { near = 14, far = 120, preset = 'mml2' } = {}) {   // digger-02: + night / morning presets
  const p = SKY_PRESETS[preset];
  scene.background = T['sky_' + preset] || (T['sky_' + preset] = skyBgTex(p));
  scene.fog = new THREE.Fog(new THREE.Color(`rgb(${p.horizon.join(',')})`), near, far);
  scene.add(new THREE.HemisphereLight(0xf2f4ff, 0x9aa0b4, 2.1));
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.1); sun.position.set(-3, 6, 4); scene.add(sun);
}
// falling snow: square points (1-2 low-res px), deterministic in t
function snowfall(scene, { cx = 0, cz = 0, R = 14, H = 9, n = 900, seed = 3, size = 2 } = {}) {
  const r = rng(seed), base = [], pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) base.push([cx + (r() * 2 - 1) * R, r() * H, cz + (r() * 2 - 1) * R, 0.5 + r() * 0.6, r() * 6.28]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size, sizeAttenuation: false })); pts.frustumCulled = false; scene.add(pts);
  return (t) => {
    const q = Math.floor(t * 15) / 15;
    base.forEach(([x, y, z, v, ph], i) => { pos[i * 3] = x + Math.sin(q * 1.3 + ph) * 0.25; pos[i * 3 + 1] = ((y - q * v) % H + H) % H - 0.2; pos[i * 3 + 2] = z + Math.cos(q * 1.1 + ph) * 0.2; });
    g.attributes.position.needsUpdate = true;
  };
}

// ---------- canvas pixel art (windows, doors, signs, pines, towers) ----------
function windowTex(broken) {
  return cvs(24, 32, (c, w, h) => {
    c.fillStyle = '#e8e2d2'; c.fillRect(0, 0, w, h);                      // cream frame
    c.fillStyle = '#9a9488'; c.fillRect(0, h - 3, w, 3);                  // sill shadow
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) {
      const x = 3 + i * 10, y = 3 + j * 9;
      c.fillStyle = broken && (i + j) % 2 ? '#0c0c12' : '#3c4658'; c.fillRect(x, y, 8, 7);
      if (!(broken && (i + j) % 2)) { c.fillStyle = '#7d8aa0'; c.fillRect(x + 1, y + 1, 2, 1); c.fillRect(x + 1, y + 2, 1, 1); }
      else { c.fillStyle = '#3c4658'; c.fillRect(x, y + 5, 3, 2); c.fillRect(x + 6, y, 2, 2); }
    }
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, 2);                        // snow on the lintel
  });
}
function windowLitTex() {   // digger-02 night: warm lit panes
  return cvs(24, 32, (c, w, h) => {
    c.fillStyle = '#5a4a38'; c.fillRect(0, 0, w, h);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { const x = 3 + i * 10, y = 3 + j * 9; c.fillStyle = '#ffc860'; c.fillRect(x, y, 8, 7); c.fillStyle = '#fff0b0'; c.fillRect(x + 1, y + 1, 3, 2); }
    c.fillStyle = '#c8d0e8'; c.fillRect(0, 0, w, 2);
  });
}
function doorTex() {
  return cvs(24, 44, (c, w, h) => {
    c.fillStyle = '#3a2a1e'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#5a412c'; for (let x = 2; x < w - 2; x += 5) c.fillRect(x, 2, 4, h - 4);
    c.fillStyle = '#26190f'; c.fillRect(2, 12, w - 4, 2); c.fillRect(2, 32, w - 4, 2);
    c.fillStyle = '#b89a50'; c.fillRect(w - 6, 22, 2, 3);
    c.fillStyle = '#f4f6fa'; c.fillRect(0, h - 4, w, 4); c.fillRect(0, h - 6, 9, 2);
  });
}
function pineTex() {
  return cvs(32, 32, (c, w, h) => {
    c.fillStyle = '#1e3a2c'; c.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 70; i++) { c.fillStyle = r() < 0.5 ? '#2a4c38' : '#163024'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 1); }
    for (let x = 0; x < w; x++) {   // heavy snow on the upper half, ragged lower edge
      const e = 12 + Math.round(Math.sin(x * 1.3) * 3 + r() * 4);
      c.fillStyle = '#f2f4f8'; c.fillRect(x, 0, 1, e); c.fillStyle = '#c8d0dc'; c.fillRect(x, e, 1, 1);
      if (x % 5 === 2) { c.fillStyle = '#f2f4f8'; c.fillRect(x, e + 3, 2, 3); }
    }
  });
}
function towerTex(seed) {
  return cvs(32, 64, (c, w, h) => {
    c.fillStyle = '#8c8c90'; c.fillRect(0, 0, w, h); const r = rng(seed);
    for (let y = 2; y < h - 2; y += 5) for (let x = 2; x < w - 2; x += 5) { c.fillStyle = r() < 0.15 ? '#6c6c70' : '#2c2e36'; c.fillRect(x, y, 3, 3); }
    for (let i = 0; i < 40; i++) { c.fillStyle = '#7a7a7e'; c.fillRect((r() * w) | 0, (r() * h) | 0, 1, 3); }   // streaks
  });
}
function signTex() {
  return cvs(24, 24, (c) => {
    c.fillStyle = '#141414'; c.beginPath(); c.moveTo(12, 0); c.lineTo(24, 12); c.lineTo(12, 24); c.lineTo(0, 12); c.fill();
    c.fillStyle = '#e8b818'; c.beginPath(); c.moveTo(12, 2); c.lineTo(22, 12); c.lineTo(12, 22); c.lineTo(2, 12); c.fill();
    c.fillStyle = '#141414'; c.fillRect(11, 6, 2, 8); c.fillRect(11, 16, 2, 2);
    c.fillStyle = '#ffffff'; c.fillRect(8, 2, 8, 3);
  });
}
function foamTex() {   // cut face of the fridge wall: insulation foam, pale yellow with dots + hatch
  return cvs(16, 16, (c, w, h) => {
    c.fillStyle = '#f0d27a'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8b452';
    for (let i = -16; i < 16; i += 4) for (let k = 0; k < 16; k++) c.fillRect(i + k, k, 1, 1);
  });
}
function flowTex(hot) {   // moving dashes on the refrigerant pipe
  const t = cvs(4, 16, (c) => {
    c.fillStyle = hot ? '#d8401c' : '#2f6ae0'; c.fillRect(0, 0, 4, 16);
    c.fillStyle = hot ? '#ffb040' : '#a8d8ff'; c.fillRect(0, 0, 4, 5);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function stripeTex(colA, colB) { return cvs(8, 8, (c) => { c.fillStyle = colA; c.fillRect(0, 0, 8, 8); c.fillStyle = colB; c.fillRect(0, 0, 8, 2); c.fillRect(0, 4, 8, 1); }); }

// ---------- scenery builders ----------
const snowM = (tint = 1.0, rp = 3) => basic(rep(T.snow, 1 / rp, 1 / rp), tint);
function snowField(parent, { w = 260, d = 260, cx = 0, cz = 0, holes = [], ellipses = [], tint = 1.0, y = 0 } = {}) {
  const sh = new THREE.Shape(); sh.moveTo(cx - w / 2, -cz - d / 2); sh.lineTo(cx + w / 2, -cz - d / 2); sh.lineTo(cx + w / 2, -cz + d / 2); sh.lineTo(cx - w / 2, -cz + d / 2); sh.lineTo(cx - w / 2, -cz - d / 2);
  for (const [x, z, r] of holes) { const p = new THREE.Path(); p.absarc(x, -z, r, 0, Math.PI * 2, true); sh.holes.push(p); }
  for (const [x, z, rx, rz] of ellipses) { const p = new THREE.Path(); p.absellipse(x, -z, rx, rz, 0, Math.PI * 2, true); sh.holes.push(p); }
  const g = new THREE.ShapeGeometry(sh, 16); g.rotateX(-Math.PI / 2);
  const t = rep(T.snow, 1 / 3, 1 / 3);
  return mesh(g, basic(t, tint), 0, y, 0, parent);
}
function drift(parent, x, z, sx, sy, sz, ry = 0, tint = 1.0) {   // low-poly snow mound
  const g = new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  const o = mesh(g, basic(rep(T.snow, 1, 1), tint), x, -0.02, z, parent); o.scale.set(sx, sy, sz); o.rotation.y = ry; return o;
}
function hole(parent, x, z, r, depth) {   // hole dug in the snow: inner wall, dark bottom, rim chunks (ground needs holes: [[x,z,r]])
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  mesh(new THREE.CylinderGeometry(r, r * 0.8, depth, 10, 1, true), basic(rep(T.snow, 2, 1), 0.22, { side: THREE.BackSide }), 0, -depth / 2, 0, g);
  const b = mesh(new THREE.CircleGeometry(r * 0.8, 10), basic(rep(T.snow, 1, 1), 0.08), 0, -depth + 0.01, 0, g); b.rotation.x = -Math.PI / 2;
  const rr = rng(Math.round(x * 100 + z * 7));
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * 6.283 + rr() * 0.4, k = r + 0.05 + rr() * 0.12;
    const c = mesh(new THREE.IcosahedronGeometry(0.06 + rr() * 0.07, 0), basic(rep(T.snow, 1, 1), 0.95 + rr() * 0.1), Math.cos(a) * k, 0.02, Math.sin(a) * k, g);
    c.scale.y = 0.55; c.rotation.set(rr() * 3, rr() * 3, 0);
  }
  return g;
}
// gable house. wall: 'stone' | 'planks'. tints fake the light: front 1.0, sides 0.78, back 0.7
function house(parent, o) {
  const { x = 0, z = 0, ry = 0, w = 6, d = 5, h = 3.6, wall = 'stone', roofH = 2.0, ov = 0.35, wins = [], door = null, chimney = true, ruin = false, open = false, seed = 1 } = o;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  const tm = wall === 'stone' ? 2.4 : 2.0;
  const lift = wall === 'planks' ? (o.lift ?? 1.35) : 1.0;
  const wm = (W, H, tint) => basic(rep(T[wall], W / tm, H / tm), tint * lift, { side: THREE.DoubleSide });
  if (!open) plane(w, h, wm(w, h, 1.0), 0, h / 2, d / 2, g);
  else {   // front with a wide doorway (icehouse)
    const dw = o.doorW || 1.8, dh = o.doorH || 2.4, sw = (w - dw) / 2;
    plane(sw, h, wm(sw, h, 1.0), -w / 2 + sw / 2, h / 2, d / 2, g); plane(sw, h, wm(sw, h, 1.0), w / 2 - sw / 2, h / 2, d / 2, g);
    plane(dw, h - dh, wm(dw, h - dh, 1.0), 0, dh + (h - dh) / 2, d / 2, g);
    box(w + 0.6, h + roofH, d - 0.1, basic(null, 0x0c0b0d, { side: THREE.BackSide }), 0, (h + roofH) / 2, 0, g);   // dark inside
  }
  plane(w, h, wm(w, h, 0.7), 0, h / 2, -d / 2, g, Math.PI);
  plane(d, h, wm(d, h, 0.8), w / 2, h / 2, 0, g, Math.PI / 2); plane(d, h, wm(d, h, 0.78), -w / 2, h / 2, 0, g, -Math.PI / 2);
  // gables
  const tri = new THREE.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, roofH); tri.lineTo(-w / 2, 0);
  const tg = new THREE.ShapeGeometry(tri); const uv = tg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / tm, uv.getY(i) / tm);
  const gm = basic(rep(T[wall], 1, 1), 0.95, { side: THREE.DoubleSide });
  mesh(tg, gm, 0, h, d / 2, g); const gb = mesh(tg, gm, 0, h, -d / 2, g); gb.rotation.y = Math.PI;
  // roof: two thick slabs, snowy shingle texture on top, snow lip at the eaves and a ridge cap
  const a = Math.atan2(roofH, w / 2), L = Math.hypot(w / 2, roofH) + ov, D = d + ov * 2;
  const under = basic(null, 0x2a2018);
  for (const s of [1, -1]) {
    if (ruin && s === 1) continue;
    const top = basic(rep(T.roof, L / 2.2, D / 2.2), 1.0);
    const slab = mesh(new THREE.BoxGeometry(L, 0.14, D), [under, under, top, under, under, under], s * (w / 4 + ov * Math.cos(a) / 2 - 0.0), h + roofH / 2 - ov * Math.sin(a) / 2 + 0.07, 0, g);
    slab.rotation.z = -s * a;
    const lip = box(0.22, 0.16, D + 0.04, basic(rep(T.snow, 1, 2), 1.0), 0, 0, 0, g);
    lip.position.set(s * (w / 2 + ov * Math.cos(a) - 0.04), h - ov * Math.sin(a) + 0.08, 0); lip.rotation.z = -s * a;
  }
  if (!ruin) box(0.3, 0.16, D, basic(rep(T.snow, 1, 2), 1.0), 0, h + roofH + 0.05, 0, g);
  else {   // exposed rafters where the roof fell in
    for (let k = -d / 2 + 0.3; k < d / 2; k += 0.7) { const b = box(L, 0.1, 0.1, basic(null, 0x3a2c20), w / 4, h + roofH / 2, k, g); b.rotation.z = -a; }
  }
  if (chimney && !ruin) { box(0.6, 1.4, 0.6, basic(rep(T.stone, 0.4, 0.6), 0.8), -w / 4, h + roofH * 0.6 + 0.3, -d / 5, g); box(0.7, 0.14, 0.7, basic(rep(T.snow, 1, 1), 1), -w / 4, h + roofH * 0.6 + 1.05, -d / 5, g); }
  const winM = [basic(T.win, 1), basic(T.winBroken, 1)];
  for (const [face, u, v, br] of wins) {   // face 0 front, 1 right, 2 back, 3 left; u along the wall from centre, v height of centre
    const W = 0.75, H = 1.0, m = winM[br || (ruin ? 1 : 0)];
    if (face === 0) plane(W, H, m, u, v, d / 2 + 0.02, g); else if (face === 1) plane(W, H, m, w / 2 + 0.02, v, u, g, Math.PI / 2);
    else if (face === 2) plane(W, H, m, u, v, -d / 2 - 0.02, g, Math.PI); else plane(W, H, m, -w / 2 - 0.02, v, u, g, -Math.PI / 2);
  }
  if (door) plane(1.0, 1.9, basic(T.door, 1), door, 0.95, d / 2 + 0.02, g);
  drift(g, w / 2 - 0.3, d / 2 + 0.1, 1.2, 0.35, 0.6); drift(g, -w / 2 + 0.6, d / 2 + 0.05, 1.5, 0.3, 0.5);
  return g;
}
function ironFence(parent, x0, z0, x1, z1, h = 1.1) {
  const L = Math.hypot(x1 - x0, z1 - z0), geos = [];
  const add = (geo, x, y) => { geo.translate(x, y, 0); geos.push(geo); };
  for (let x = 0.07; x < L; x += 0.16) { add(new THREE.BoxGeometry(0.035, h, 0.035), x, h / 2); add(new THREE.ConeGeometry(0.035, 0.1, 4), x, h + 0.05); }
  for (let x = 0; x <= L; x += 2.4) add(new THREE.BoxGeometry(0.09, h + 0.15, 0.09), x, (h + 0.15) / 2);
  add(new THREE.BoxGeometry(L, 0.045, 0.045), L / 2, h - 0.12); add(new THREE.BoxGeometry(L, 0.045, 0.045), L / 2, 0.18);
  const geo = mergeGeometries(geos.map((q) => q.index ? q.toNonIndexed() : q));
  const o = mesh(geo, basic(null, 0x1a1b20), x0, 0, z0, parent); o.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  const cap = box(L, 0.05, 0.08, basic(rep(T.snow, 4, 1), 1.0), 0, 0, 0, o); cap.position.set(L / 2, h - 0.08, 0);   // snow on the top rail
  return o;
}
function lamp(parent, x, z, h = 3.4, tilt = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.z = tilt; parent.add(g);
  const k = basic(null, 0x1c1d22);
  mesh(new THREE.CylinderGeometry(0.05, 0.08, h, 6), k, 0, h / 2, 0, g); box(0.24, 0.4, 0.24, k, 0, 0.2, 0, g);
  box(0.3, 0.42, 0.3, basic(null, 0x9c9a86), 0, h + 0.2, 0, g);
  mesh(new THREE.ConeGeometry(0.28, 0.24, 4), k, 0, h + 0.53, 0, g).rotation.y = Math.PI / 4;
  mesh(new THREE.ConeGeometry(0.2, 0.12, 4), basic(null, 0xf4f6fa), 0, h + 0.6, 0, g).rotation.y = Math.PI / 4;
  return g;
}
function pine(parent, x, z, h) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  mesh(new THREE.CylinderGeometry(0.08 * h / 4, 0.12 * h / 4, h * 0.2, 5), basic(null, 0x2e2420), 0, h * 0.1, 0, g);
  [[0.36, 0.42, 0.15], [0.28, 0.34, 0.4], [0.19, 0.28, 0.63]].forEach(([r, hh, y]) => mesh(new THREE.ConeGeometry(r * h, hh * h, 7), basic(T.pine, 1), 0, y * h + hh * h / 2, 0, g));
  return g;
}
function tower(parent, x, z, w, h, d, seed) {   // ruined concrete tower in the fog (post-human skyline)
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); const r = rng(seed);
  const t = rep(T['tower' + (seed % 2)], w / 8, h / 16);
  box(w, h, d, basic(t, 0.9), 0, h / 2, 0, g);
  for (let i = 0; i < 4; i++) { const b = box(w * (0.2 + r() * 0.4), 2 + r() * 5, d * (0.3 + r() * 0.5), basic(t, 0.85), (r() - 0.5) * w * 0.7, h + 1, (r() - 0.5) * d * 0.5, g); b.rotation.z = (r() - 0.5) * 0.5; }
  box(w * 1.02, 0.5, d * 1.02, basic(rep(T.snow, 4, 4), 1.0), 0, h * (0.3 + r() * 0.3), 0, g);
  return g;
}
function sign(parent, x, z, tilt = 0.2, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, -0.5, z); g.rotation.set(0, ry, tilt); parent.add(g);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5), basic(null, 0x6c7078), 0, 1.2, 0, g);
  plane(0.7, 0.7, basic(T.sign, 1, { side: THREE.DoubleSide }), 0, 2.2, 0.04, g, 0, 0).rotation.z = 0;
  return g;
}
function libModel(id, tex, variant, opts = {}) {   // pieces/lib-mml model (copied to lib/), unlit, recolor variant
  const g = M['lib_' + id].clone(true);
  g.traverse((o) => { if (o.isMesh) o.material = basic(T[`lib_${tex}_${variant}`], opts.tint ?? 1, { alphaTest: 0.5, side: THREE.DoubleSide }); });
  const w = new THREE.Group(); w.add(g); return w;
}
function model(name, h, color) {
  const g = M[name].clone(true);
  g.traverse((o) => { if (!o.isMesh) return; const src = o.material; nearest(src.map); o.material = basic(src.map, color ?? (src.map ? 0xffffff : src.color.getHex()), { alphaTest: 0.5, side: THREE.DoubleSide }); });
  const bb = new THREE.Box3().setFromObject(g); g.scale.setScalar(h / (bb.max.y - bb.min.y));
  const w = new THREE.Group(); w.add(g); return w;
}
// the shared village backdrop: rows of houses, railings, lamps, pines, half-buried human relics, ruined towers in the fog
function village(scene, { cx = 0, cz = 0, ry = 0, holes = [], ellipses = [], skip = {} } = {}) {
  addSky(scene, { near: 10, far: 95 });
  const w = new THREE.Group(); w.position.set(cx, 0, cz); w.rotation.y = ry; scene.add(w);
  snowField(scene, { holes, ellipses });
  if (!skip.houses) {
    house(w, { x: -7.5, z: -11, w: 6.5, d: 5, h: 4.2, wall: 'stone', wins: [[0, -1.8, 2.6], [0, 1.6, 2.6], [1, 0.5, 2.4]], door: 0, seed: 1 });
    house(w, { x: 0.5, z: -13.5, w: 5.5, d: 5, h: 3.4, wall: 'planks', roofH: 2.4, wins: [[0, 1.4, 2.0, 1], [3, 0, 2.0]], door: -1.2, ruin: true, seed: 2 });
    house(w, { x: 8, z: -11.5, w: 6, d: 6, h: 5.2, wall: 'stone', roofH: 2.2, wins: [[0, -1.8, 1.6], [0, 0, 1.6], [0, 1.8, 1.6], [0, -1.8, 3.9], [0, 1.8, 3.9, 1], [3, 0, 3.0]], door: 0, seed: 3 });
    house(w, { x: -16, z: -18, ry: 0.5, w: 7, d: 5, h: 4.0, wall: 'planks', wins: [[0, -1.5, 2.4], [0, 1.5, 2.4]], door: 0 });
    house(w, { x: 17, z: -20, ry: -0.4, w: 6, d: 5, h: 4.6, wall: 'stone', ruin: true, wins: [[0, -1.5, 2.6, 1], [0, 1.5, 2.6, 1]] });
  }
  if (!skip.fence) { ironFence(w, -12, -6.5, -2.5, -6.5); ironFence(w, 3.5, -6.5, 13, -6.5); }
  if (!skip.lamps) { lamp(w, -2.8, -6.0, 3.4, 0.0); lamp(w, 4.0, -6.0, 3.4, -0.12); }
  for (const [x, z, h] of [[-10, -8.5, 5.5], [12.5, -8, 6.5], [-21, -12, 7], [22, -13, 8], [-4, -24, 7], [6, -26, 9], [-28, -30, 9]]) pine(w, x, z, h);
  // human relics poking out of the snow
  if (!skip.car) { const car = libModel('red_car', 'red_car', 'skyblue'); car.position.set(-5.2, -0.75, -4.2); car.rotation.set(0.12, 0.7, -0.18); w.add(car); box(1.6, 0.18, 1.4, basic(rep(T.snow, 1, 1), 1), 0, 0, 0, car).position.set(0, 2.25, -0.3); drift(w, -5.2, -3.0, 2.2, 0.55, 1.2, 0.7); }
  sign(w, 6.8, -4.5, 0.25, -0.3);
  if (!skip.can) { const tc = libModel('trashcan', 'trashcan', 'green'); tc.position.set(2.6, -0.3, -5.8); tc.rotation.z = 0.15; w.add(tc); }
  for (const [x, z, ww, hh, dd, s] of [[-40, -85, 14, 38, 12, 1], [-12, -110, 18, 52, 14, 2], [25, -90, 12, 30, 12, 3], [55, -105, 16, 46, 12, 4], [-70, -100, 14, 26, 12, 5]]) tower(w, x, z, ww, hh, dd, s);
  return w;
}

function footprints(parent, x0, z0, x1, z1, n) {   // boot prints in the snow: little grey-blue ovals, alternating
  const m = basic(rep(T.snow, 1, 1), 0.62, { polygonOffset: true, polygonOffsetFactor: -2 });
  for (let i = 0; i < n; i++) { const k = i / (n - 1), s = i % 2 ? 1 : -1, ang = Math.atan2(x1 - x0, z1 - z0);
    const o = mesh(new THREE.CircleGeometry(0.07, 6), m, lerp(x0, x1, k) + Math.cos(ang) * 0.1 * s, 0.006, lerp(z0, z1, k) - Math.sin(ang) * 0.1 * s, parent); o.rotation.set(-Math.PI / 2, 0, ang); o.scale.set(1, 1.7, 1); }
}
// ---------- props ----------
function meat() {   // cartoon bone-in meat ("manga meat"), origin at the bone grip
  const g = new THREE.Group();
  const m1 = mesh(new THREE.SphereGeometry(0.1, 8, 6), lam(null, 0xa4402a), 0.13, 0, 0, g); m1.scale.set(1.35, 1, 1);
  const m2 = mesh(new THREE.SphereGeometry(0.085, 8, 6), lam(null, 0xc8644a), 0.15, 0.025, 0.02, g); m2.scale.set(1.2, 0.9, 1);
  const bone = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6), lam(null, 0xf2ead8), 0, 0, 0, g); bone.rotation.z = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.03, 6, 4), lam(null, 0xf2ead8), -0.08, 0.018, 0, g); mesh(new THREE.SphereGeometry(0.03, 6, 4), lam(null, 0xf2ead8), -0.08, -0.018, 0, g);
  return g;
}
function iceBlock(w = 0.55, h = 0.4, d = 0.4, tint = 1.0) { return box(w, h, d, basic(rep(T.ice, 1, 1), tint), 0, 0, 0, null); }
function letter() { return plane(0.2, 0.14, basic(cvs(20, 14, (c) => { c.fillStyle = '#f4f0e4'; c.fillRect(0, 0, 20, 14); c.fillStyle = '#9a9488'; for (let y = 3; y < 13; y += 3) c.fillRect(2, y, 14, 1); c.fillStyle = '#d83030'; c.fillRect(15, 1, 4, 4); }), 1, { side: THREE.DoubleSide }), 0, 0, 0, null); }
function fridgeWhole() {   // closed 1950s fridge: Flow front image on the door, cream enamel sides, rounded top
  const g = new THREE.Group(), cream = basic(null, 0xd8d0b8), side = basic(T.rust, 0.86);
  box(0.78, 1.45, 0.7, [side, side, cream, cream, basic(T.fridgeFront, 1), side], 0, 0.725, 0, g);
  const top = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.78, 10, 1, false, 0, Math.PI), [cream, cream, cream], 0, 1.45, 0, g); top.rotation.z = Math.PI / 2; top.scale.set(1, 1, 0.42); top.rotation.y = 0;
  return g;
}
function holdIn(ch, prop, side, off = [0, 0.8, 0], rot = [0, 0, 0]) { const h = ch.hand(side); h.add(prop); prop.scale.multiplyScalar(1 / S); prop.position.set(...off); prop.rotation.set(...rot); return prop; }

// ---------- the character (zero_fem, from zero-test) ----------
const CELLS = 16;
const FACE = {
  face_eyes: ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink', 'hearts', 'shocked', 'dizzy', 'relaxed', 'disgust', 'smirk', 'soft', 'sparkle'],   // 13-15: 2026-10-28
  face_mouth: ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout', 'blep', 'cat', 'gasp', 'bigShock', 'disgust', 'smirk', 'blushSmile', 'blushGasp'],
};
function setFace(root, { eyes, mouth } = {}) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = FACE[m.name]; if (!cells) return;
      if (!m.userData.faceOwn) {
        m = m.clone(); m.map = m.map.clone();
        m.map.magFilter = m.map.minFilter = THREE.NearestFilter; m.map.generateMipmaps = false; m.map.flipY = false; m.map.needsUpdate = true;
        m.userData.faceOwn = true; if (Array.isArray(o.material)) o.material[i] = m; else o.material = m;
      }
      const k = cells.indexOf(m.name === 'face_eyes' ? eyes : mouth); if (k >= 0) m.map.offset.x = k / CELLS;
    });
  });
}
function zero() {
  const root = SkeletonUtils.clone(ZERO);
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => new (SOFT ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial)({ name: m.name, map: nearest(m.map), alphaTest: 0.5, side: THREE.DoubleSide });
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  setFace(root, { eyes: 'open', mouth: 'neutral' }); snapAll(root);
  if (SOFT) root.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      const prev = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => { prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `outgoingLight = mix(diffuseColor.rgb, outgoingLight, ${SHADE_K.toFixed(3)});\n#include <opaque_fragment>`); };
      m.customProgramCacheKey = () => 'snap-shade' + SHADE_K;
    });
  });
  root.scale.setScalar(S); root.position.y = 9.0 * S;
  const wrap = new THREE.Group(); wrap.add(root);
  // contact shadow under the feet (cartoon3d rule: shadows at the feet)
  const sh = mesh(new THREE.CircleGeometry(0.32, 10), basic(null, 0x343c50, { transparent: true, opacity: 0.68, depthWrite: false }), 0, 0.012, 0, wrap); sh.rotation.x = -Math.PI / 2; sh.scale.y = 0.75;
  const mixer = new THREE.AnimationMixer(root), acts = {};
  const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(THREE.AnimationClip.findByName(CLIPS, n)); a.play(); a.setEffectiveWeight(0); return a; })());
  const hand = (side) => root.getObjectByName('Hand' + side);
  function pose(lt, segs, faces) {
    const q = Math.floor(lt * 15 + 1e-6) / 15;
    let i = 0; while (i < segs.length - 1 && q >= segs[i + 1].at) i++;
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    const clipT = (s) => { const a = act(s.clip), d = a.getClip().duration; let x = (s.from || 0) + (q - s.at) * (s.speed ?? 1); x = s.loop ? ((x % d) + d) % d : Math.min(d - 1e-4, Math.max(0, x)); return [a, x]; };
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
  return { root: wrap, pose, hand, bone: root };
}
const still = (clip, at) => [{ clip, at: -10, from: at, speed: 0 }];

// ---------- overlay helpers (sinaboto yellow label + leader line, comment sticker, HUD) ----------
const toScreen = (cam, x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [Math.round((v.x * 0.5 + 0.5) * LW), Math.round((0.5 - v.y * 0.5) * LH)]; };
function label(o, text, x, y, size = 20, tip = null) {   // tip: [x,y] low-res px the leader points at
  const c = o.tctx;
  if (tip) {
    c.strokeStyle = '#040412'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 8); c.lineTo(tip[0], tip[1]); c.stroke();
    c.strokeStyle = '#fdd941'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 8); c.lineTo(tip[0], tip[1]); c.stroke();
    c.fillStyle = '#040412'; c.fillRect(tip[0] - 2, tip[1] - 2, 5, 5); c.fillStyle = '#fdd941'; c.fillRect(tip[0] - 1, tip[1] - 1, 3, 3);
  }
  o.pixelText(text, x, y, size, '#fdd941', 3, 1, { bold: 0, spacing: 1 });   // v4: no faux-bold (C read as O), 1 px letter spacing
}
function tag(o, text, x, y, fill) { o.pixelText(text, x, y, 12, fill, 2, 1); }
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
function commentSticker(o, lt, { user = 'operator_mike', text = 'why not just make cold?', x = 135, y = 96 } = {}) {   // TikTok "reply to comment" sticker
  const c = o.tctx, f = Math.floor(lt * 30), s = f < 3 ? [0.6, 1.08, 0.97][f] : 1;
  const W = Math.round(206 * s), H = Math.round(54 * s), X = Math.round(x - W / 2), Y = Math.round(y - H / 2);
  c.fillStyle = '#040412'; rrect(c, X - 1, Y - 1, W + 2, H + 3, 7); c.fill();
  c.fillStyle = '#fdfdfd'; rrect(c, X, Y, W, H, 6); c.fill();
  if (s < 0.9) return;
  c.fillStyle = '#ff3b5c'; c.beginPath(); c.arc(X + 15, Y + 15, 9, 0, 7); c.fill();          // avatar
  c.fillStyle = '#fdfdfd'; c.fillRect(X + 11, Y + 11, 3, 3); c.fillRect(X + 17, Y + 11, 3, 3); c.fillRect(X + 12, Y + 18, 7, 2);
  c.textAlign = 'left'; c.textBaseline = 'middle';
  c.font = '700 10px Pixelify'; c.fillStyle = '#8a8a96'; c.fillText(`Reply to ${user}'s comment`, X + 29, Y + 15);
  c.font = '700 14px Pixelify'; c.fillStyle = '#141418'; c.fillText(text, X + 10, Y + 38);
}

// ---------- STYLE FRAME A: the hook (hole in the snow + meat) ----------
function shotHook(t0, v = {}) {
  const scene = new THREE.Scene();
  const ch = zero(); ch.root.position.set(-0.22, 0, 0.0); ch.root.rotation.y = v.cry ?? 0.3; scene.add(ch.root);
  const mt = holdIn(ch, meat(), 'L', v.grip || [0, 0.8, 0], [0, 0, 1.6]);
  ch.pose(1, v.segs || still('present', 1.0)); ch.root.updateMatrixWorld(true);
  const mp = new THREE.Vector3(); mt.getWorldPosition(mp);
  const HX = v.hx ?? mp.x + 0.05, HZ = v.hz ?? mp.z;   // the hole sits right under the meat
  village(scene, { cz: -5, cx: -3.5, holes: [[HX, HZ, 0.34]] });
  hole(scene, HX, HZ, 0.34, 0.5);
  drift(scene, -1.6, 0.6, 0.9, 0.25, 0.6); drift(scene, 2.2, -1.2, 1.4, 0.3, 0.8);
  const shovel = model('shovel', 1.15); shovel.position.set(HX + 0.42, -0.28, HZ - 0.6); shovel.rotation.set(0.1, 0.5, -0.22); scene.add(shovel);
  drift(scene, HX + 0.42, HZ - 0.6, 0.4, 0.3, 0.32); footprints(scene, -0.5, -0.3, -2.6, -4.5, 12);
  const sf = snowfall(scene, { cx: 0, cz: -2, R: 10 });
  const fx = new FX(LW, LH).add('snow', { world: [HX, 0.1, HZ], t0: t0, dur: 30, n: 6, width: 40, height: 28, seed: 4 });
  const cam = new THREE.PerspectiveCamera(v.fov || 38, 9 / 16, 0.05, 400);
  const p0 = v.cam || [0.55, 1.6, 4.6], l0 = v.look || [0.25, 0.5, 0.0];
  return {
    t0, scene, camera: cam, fx,
    update(lt) {
      ch.pose(lt, v.segs || still('present', 1.0), v.faces || [[-1, 'happy', 'smileOpen']]);
      sf(lt + t0);
      cam.position.set(p0[0] - lt * 0.03, p0[1], p0[2] - lt * 0.05); cam.lookAt(...l0);
    },
    overlay(lt, dt, a, o) { if (v.noLabel) return; const tip = toScreen(cam, HX, 0.0, HZ); label(o, 'REFRIGERATOR', 196, tip[1] - 46, 18, [tip[0] + 3, tip[1] + 2]); },
  };
}

// ---------- STYLE FRAME B: the icehouse ----------
function icehouseSet(scene) {
  const LX = -4.6, LZ = 0.2;   // frozen lake
  village(scene, { ellipses: [[LX, LZ, 3.4, 2.6]], skip: { car: true, can: true } });
  // v4: the lake is a sheet with real rectangular holes cut in it; each hole is a sunk well (ice walls + dark water),
  // so the holes sit IN the ice instead of floating on it as flat dark planes
  const CUTS = [[-4.0, 0.8], [-5.4, -0.4], [-3.6, -0.9]], hw = 0.5, hd = 0.35;
  const ls = new THREE.Shape(); ls.moveTo(LX - 3.7, -LZ - 2.9); ls.lineTo(LX + 3.7, -LZ - 2.9); ls.lineTo(LX + 3.7, -LZ + 2.9); ls.lineTo(LX - 3.7, -LZ + 2.9); ls.lineTo(LX - 3.7, -LZ - 2.9);
  for (const [x, z] of CUTS) { const h = new THREE.Path(); h.moveTo(x - hw, -z - hd); h.lineTo(x - hw, -z + hd); h.lineTo(x + hw, -z + hd); h.lineTo(x + hw, -z - hd); h.lineTo(x - hw, -z - hd); ls.holes.push(h); }
  const lg = new THREE.ShapeGeometry(ls); lg.rotateX(-Math.PI / 2);
  const uv = lg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.4, uv.getY(i) / 2.9);
  mesh(lg, basic(rep(T.ice, 1, 1), 0.95), 0, -0.04, 0, scene);
  for (const [x, z] of CUTS) {
    plane(hw * 2, hd * 2, basic(null, 0x0e1c2c), x, -0.2, z, scene, 0, -Math.PI / 2);                                   // dark water
    const wall = basic(rep(T.ice, 1, 0.2), 0.62, { side: THREE.DoubleSide });
    plane(hw * 2, 0.16, wall, x, -0.12, z - hd, scene); plane(hw * 2, 0.16, wall, x, -0.12, z + hd, scene);
    plane(hd * 2, 0.16, wall, x - hw, -0.12, z, scene, Math.PI / 2); plane(hd * 2, 0.16, wall, x + hw, -0.12, z, scene, Math.PI / 2);
  }
  for (const [x, z, r] of [[-2.4, 1.6, 0.3], [-1.9, 1.2, -0.2], [-2.2, 1.4, 0.1]]) { const b = iceBlock(); b.position.set(x, 0.18, z); b.rotation.y = r; scene.add(b); }
  // (v1 had a box 'saw' here; the film uses the CC0 hand saw in her hand, film.js)
  // the shed: dark planks, snowy roof, open front, ice stacked in sawdust inside
  const sh = house(scene, { x: 2.2, z: -2.6, w: 4.6, d: 4.2, h: 2.9, wall: 'planks', roofH: 1.7, open: true, doorW: 2.0, doorH: 2.3, chimney: false });
  const inner = new THREE.Group(); inner.position.set(2.2, 0, -2.6); scene.add(inner);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const b = iceBlock(0.6, 0.42, 0.45, 0.92 - j * 0.06); b.position.set(-1.35 + i * 0.68 + (j % 2) * 0.2, 0.22 + j * 0.44, -0.9 + (i % 2) * 0.1); inner.add(b); }
  const heap = drift(inner, 0, 0.9, 1.6, 0.42, 1.0); heap.material = basic(rep(T.sawdust, 2, 2), 1.0);
  const spill = drift(inner, 0.2, 2.2, 1.0, 0.16, 0.6); spill.material = basic(rep(T.sawdust, 2, 2), 1.0);
  for (const s of [1, -1]) { const dr = plane(1.0, 2.3, basic(rep(T.planks, 0.5, 1.1), 0.85, { side: THREE.DoubleSide }), 2.2 + s * 1.48, 1.15, -2.6 + 2.1 + 0.45, scene, s * 0.0); dr.rotation.y = s * -1.2; dr.position.x = 2.2 + s * 1.38; }
  return { LX, LZ };
}
function shotIcehouse(t0, v = {}) {
  const scene = new THREE.Scene(); icehouseSet(scene);
  const ch = zero(); ch.root.position.set(v.cx ?? -0.3, 0, v.cz ?? 1.2); ch.root.rotation.y = v.cry ?? 2.5; scene.add(ch.root);
  const blk = iceBlock(0.5, 0.36, 0.36); if (!v.noBlock) scene.add(blk); const _hp = new THREE.Vector3();
  const sf = snowfall(scene, { cx: 0, cz: 0, R: 12 });
  const fx = new FX(LW, LH).add('sparkle', { world: [2.0, 0.9, -1.6], t0, dur: 30, n: 4, radius: 16, color: '#bff4ff', seed: 7 });
  const cam = new THREE.PerspectiveCamera(v.fov || 36, 9 / 16, 0.05, 400);
  const p0 = v.cam || [-1.0, 3.2, 16.5], l0 = v.look || [0.7, 1.7, -2.2];
  return {
    t0, scene, camera: cam, fx,
    update(lt) {
      ch.pose(lt, v.segs || still('carry_heavy', 1.2), v.faces || [[-1, 'angry', 'shout']]);
      scene.updateMatrixWorld(true); ch.hand('R').localToWorld(_hp.set(0, 0.8, 0)); const ry = ch.root.rotation.y;
      blk.position.copy(_hp).add(new THREE.Vector3(-Math.sin(ry) * 0.16, 0.12, -Math.cos(ry) * 0.16)); blk.rotation.set(0, ry + 0.3, 0.15);
      sf(lt + t0);
      cam.position.set(p0[0] + lt * 0.04, p0[1], p0[2] - lt * 0.06); cam.lookAt(...l0);
    },
    overlay(lt, dt, a, o) { if (v.noLabel) return; const p = toScreen(cam, 2.2, 4.4, -2.6); label(o, 'ICEHOUSE', 135, 64, 22, [p[0], p[1]]); },
  };
}

// ---------- STYLE FRAME C: the comment / mailbox break ----------
function mailSet(scene) {
  addSky(scene, { near: 8, far: 70 }); snowField(scene, {});
  house(scene, { x: 0.2, z: -4.6, w: 7, d: 5, h: 4.4, wall: 'stone', wins: [[0, -2.2, 2.4], [0, 2.3, 2.4]], door: 0.4, chimney: true });
  ironFence(scene, -6, -0.2, -2.0, -0.2); ironFence(scene, 2.6, -0.2, 7, -0.2);
  lamp(scene, 2.9, 0.05, 3.3);
  pine(scene, -5.5, -1.5, 5); pine(scene, 6.5, -2.5, 6);
  for (const [x, z, ww, hh, dd, s] of [[-30, -70, 14, 34, 12, 1], [18, -80, 14, 44, 12, 2]]) tower(scene, x, z, ww, hh, dd, s);
  const mb = model('mailbox', 1.25); mb.position.set(-0.72, 0, 0.45); mb.rotation.y = Math.PI / 2 - 0.35; scene.add(mb);
  box(0.5, 0.08, 0.3, basic(rep(T.snow, 1, 1), 1.0), -0.72, 1.27, 0.45, scene).rotation.y = -0.35;
  drift(scene, -1.6, 0.9, 0.8, 0.22, 0.6); drift(scene, 1.6, 0.4, 1.1, 0.28, 0.6);
}
function shotMail(t0, v = {}) {
  const scene = new THREE.Scene(); mailSet(scene);
  const ch = zero(); ch.root.position.set(0.0, 0, 0.75); ch.root.rotation.y = -0.1; scene.add(ch.root);
  const lt0 = holdIn(ch, letter(), 'R', v.lgrip || [0, 1.4, 0.6], [0.2, 0, Math.PI / 2]); lt0.scale.multiplyScalar(1.5);
  const sf = snowfall(scene, { cx: 0, cz: 0, R: 9 });
  const fx = new FX(LW, LH).add('sparkle', { world: [-0.72, 1.15, 0.45], t0, dur: 30, n: 3, radius: 10, seed: 3 });
  const cam = new THREE.PerspectiveCamera(v.fov || 33, 9 / 16, 0.05, 400);
  const p0 = v.cam || [-0.3, 1.3, 6.0], l0 = v.look || [-0.3, 1.12, 0.4];
  return {
    t0, scene, camera: cam, fx,
    update(lt) {
      ch.pose(lt, v.segs || still('phone_look', 1.0), v.faces || [[-1, 'surprised', 'talkO']]);
      sf(lt + t0); upright(lt0, 0.0);
      cam.position.set(p0[0], p0[1], p0[2] - lt * 0.06); cam.lookAt(...l0);
    },
    overlay(lt, dt, a, o) { if (!v.noLabel) commentSticker(o, lt, {}); },
  };
}
const _q = new THREE.Quaternion(), _I = new THREE.Quaternion();
function upright(prop, k) { prop.parent.updateWorldMatrix(true, false); if (!k) return; prop.quaternion.identity(); prop.parent.getWorldQuaternion(_q); const want = _q.clone().slerp(_I, k); prop.quaternion.copy(_q.invert().multiply(want)); }

// ---------- STYLE FRAME D: fridge cross-section in the abandoned kitchen ----------
function kitchenSet(scene) {
  addSky(scene, { near: 6, far: 40, preset: 'interior' });
  const room = new THREE.Group(); scene.add(room);
  plane(9, 12, basic(rep(T.tiles, 9 / 1.2, 12 / 1.2), 0.9), 0, 0, 4.4, room, 0, -Math.PI / 2);
  plane(9, 3.4, basic(rep(T.wallpaper, 9 / 1.0, 3.4 / 1.0), 0.82), 0, 1.7, -1.6, room);
  box(9, 0.9, 0.04, basic(rep(T.planks, 4, 0.4), 0.55), 0, 0.45, -1.57, room);   // wainscot
  plane(6, 3.4, basic(rep(T.wallpaper, 6 / 1.6, 3.4 / 1.6), 0.6), -3.6, 1.7, 1.0, room, Math.PI / 2);
  // a window with snow light, a broken cabinet and an old stove (kitchen read)
  plane(1.0, 1.2, basic(T.winBroken, 1.15), -2.3, 1.8, -1.57, room);
  box(1.1, 0.9, 0.6, basic(rep(T.planks, 0.6, 0.5), 0.75), -2.4, 0.45, -1.25, room); box(1.16, 0.06, 0.64, basic(null, 0xb8b0a0), -2.4, 0.93, -1.25, room);
  box(0.8, 0.9, 0.62, basic(null, 0xcac6bc), 2.6, 0.45, -1.25, room); box(0.8, 0.04, 0.62, basic(null, 0x222226), 2.6, 0.91, -1.25, room);
  drift(room, -1.3, -1.2, 0.9, 0.18, 0.4); drift(room, 2.0, -1.0, 0.7, 0.14, 0.35);
  // light shaft + snow pile from the hole in the ceiling
  const beam = mesh(new THREE.CylinderGeometry(0.5, 0.9, 3.6, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfc8d8, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), -1.3, 1.8, 0.2, room); beam.rotation.z = 0.12;
  drift(room, -1.45, 0.25, 0.7, 0.2, 0.6);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
}
// the fridge cut in half (we see the far half). Front (door) faces -X toward her, back faces +X (hot coils).
function fridgeSection(parent) {
  const g = new THREE.Group(); parent.add(g);
  const Wx = 0.78, Hy = 1.55, Dz = 0.36, th = 0.07, cream = basic(null, 0xe4dcc6), foam = basic(T.foam, 1), liner = basic(null, 0xd8e4ec), linerD = basic(null, 0xb8c8d4);
  const wallBox = (w, h, x, y) => box(w, h, Dz, [cream, cream, cream, cream, foam, cream], x, y, -Dz / 2, g);
  wallBox(Wx, th, 0, Hy - th / 2); wallBox(Wx, th, 0, 0.12 + th / 2);            // top, bottom
  wallBox(th, Hy - 0.12, -Wx / 2 + th / 2, 0.12 + (Hy - 0.12) / 2);                // door (front, -X)
  wallBox(th, Hy - 0.12, Wx / 2 - th / 2, 0.12 + (Hy - 0.12) / 2);                 // back wall
  plane(Wx - th * 2, Hy - 0.12 - th * 2, liner, 0, 0.12 + (Hy - 0.12) / 2, -Dz + 0.001, g);   // inner far wall
  box(0.03, 0.18, 0.05, basic(null, 0xb8bcc4), -Wx / 2 - 0.02, 1.1, -0.05, g);                 // handle
  box(Wx, 0.12, Dz, [basic(null, 0x5a5650), basic(null, 0x5a5650), basic(null, 0x5a5650), basic(null, 0x5a5650), basic(null, 0x3a3834), basic(null, 0x5a5650)], 0, 0.06, -Dz / 2, g);   // plinth
  // shelves + food
  for (const y of [0.55, 0.95]) box(Wx - th * 2, 0.025, Dz - 0.02, [linerD, linerD, basic(null, 0xf0f4f8), linerD, basic(null, 0x9ab0c0), linerD], 0, y, -Dz / 2, g);
  const m = meat(); m.position.set(-0.12, 0.65, -0.15); m.scale.setScalar(0.9); g.add(m);
  mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.22, 7), basic(null, 0xf4f4f0), 0.15, 0.68, -0.18, g);
  box(0.16, 0.1, 0.14, basic(null, 0xe8e0d0), 0.12, 1.02, -0.18, g); box(0.16, 0.02, 0.14, basic(null, 0xd84040), 0.12, 1.08, -0.18, g);   // leftovers box
  box(0.2, 0.08, 0.16, basic(null, 0x6ab04a), -0.12, 0.2, -0.18, g);   // veg drawer
  // refrigerant loop: evaporator zigzag inside the top (cold, blue), compressor (bottom back, outside), condenser zigzag on the back (hot)
  const P = (x, y, z = -0.06) => new THREE.Vector3(x, y, z);
  const evap = [P(-0.25, 1.4), P(0.25, 1.4), P(0.25, 1.32), P(-0.25, 1.32), P(-0.25, 1.24), P(0.25, 1.24)];
  const xb = Wx / 2 + 0.07;
  const cold = [P(-0.3, 1.46, -0.06), ...evap, P(0.3, 1.24), P(xb - 0.12, 1.2), P(xb - 0.12, 0.3), P(xb + 0.05, 0.22)];
  const hot = [P(xb + 0.2, 0.3), P(xb, 0.45), P(xb + 0.06, 0.6), P(xb, 0.75), P(xb + 0.06, 0.9), P(xb, 1.05), P(xb + 0.06, 1.2), P(xb, 1.35), P(xb + 0.04, 1.6), P(0.1, 1.62), P(-0.3, 1.58), P(-0.3, 1.46, -0.06)];
  const tube = (pts, hot) => { const t = flowTex(hot); const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1); const o = mesh(new THREE.TubeGeometry(c, pts.length * 10, 0.022, 5), basic(t, 1), 0, 0, 0, g); t.repeat.set(pts.length * 2.2, 1); return t; };
  const tc = tube(cold, false), th2 = tube(hot, true);
  // compressor: black dome on the floor behind the fridge
  const comp = new THREE.Group(); comp.position.set(xb + 0.14, 0, -0.12); g.add(comp);
  mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.24, 8), basic(null, 0x26272c), 0, 0.14, 0, comp);
  mesh(new THREE.SphereGeometry(0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), basic(null, 0x34363c), 0, 0.26, 0, comp);
  box(0.06, 0.03, 0.06, basic(null, 0x8a8c94), 0.0, 0.4, 0, comp);
  // frost on the evaporator
  for (let i = 0; i < 14; i++) { const r = rng(i + 3); box(0.03, 0.02, 0.03, basic(null, 0xf4fbff), -0.24 + r() * 0.48, 1.22 + r() * 0.2, -0.04, g); }
  g.userData.tick = (lt) => { const q = Math.floor(lt * 15) / 15; tc.offset.x = -q * 1.6; th2.offset.x = -q * 1.6; };
  g.userData.comp = comp; g.userData.xb = xb;
  return g;
}
function shotSection(t0, v = {}) {
  const scene = new THREE.Scene(); kitchenSet(scene);
  const fr = fridgeSection(scene); fr.position.set(0.5, 0, 0.0);
  const ch = zero(); ch.root.position.set(-0.33, 0, 0.3); ch.root.rotation.y = v.cry ?? 0.25; scene.add(ch.root);
  const X = (x) => x + 0.5;
  const fx = new FX(LW, LH)
    .add('heat', { world: [X(fr.userData.xb + 0.05), 1.25, -0.08], t0, dur: 30, lines: 3, rise: 40, seed: 2 })
    .add('bubbles', { world: [X(0), 1.32, -0.06], t0, dur: 30, every: 0.12, seed: 5 })
    .add('arrow', { world: [X(0.02), 0.95, -0.1], t0, dur: 30, angle: -Math.PI / 2, len: 16, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 6 })
    .add('arrow', { world: [X(-0.2), 1.0, -0.1], t0, dur: 30, angle: -Math.PI / 2, len: 12, color: '#ff8a2a', light: '#ffd080', edge: '#5a1800', seed: 8 })
    .add('arrow', { world: [X(fr.userData.xb + 0.32), 1.0, -0.08], t0, dur: 30, angle: 0, len: 18, color: '#e83c1c', light: '#ffb070', edge: '#4a0800', seed: 9 });
  const cam = new THREE.PerspectiveCamera(v.fov || 30, 9 / 16, 0.05, 200);
  const p0 = v.cam || [0.32, 1.0, 7.2], l0 = v.look || [0.32, 0.98, 0];
  return {
    t0, scene, camera: cam, fx,
    update(lt) {
      ch.pose(lt, v.segs || still('point', 1.0), v.faces || [[-1, 'open', 'smileOpen']]);
      fr.userData.tick(lt + t0);
      cam.position.set(p0[0], p0[1], p0[2] - lt * 0.05); cam.lookAt(...l0);
    },
    overlay(lt, dt, a, o) {
      if (v.noLabel) return;
      const c = toScreen(cam, X(fr.userData.xb + 0.14), 0.3, -0.12); label(o, v.label || 'COMPRESSOR', 180, c[1] + 72, 18, [c[0], c[1] + 6]);
      const e = toScreen(cam, X(0), 1.48, -0.06); tag(o, 'COLD', e[0], e[1] - 14, '#9cd8ff');
      const h = toScreen(cam, X(fr.userData.xb + 0.05), 1.7, -0.06); tag(o, 'HOT', Math.min(250, h[0] + 12), h[1] - 22, '#ff9a5a');
    },
  };
}

// ---------- loading ----------
export async function loadAll() {
  const gl = new GLTFLoader();
  for (const [k, f] of [['shovel', 'shovel'], ['mailbox', 'mailbox'], ['cup', 'cup']]) M[k] = (await gl.loadAsync(`models/${f}.glb`)).scene;
  for (const id of ['red_car', 'trashcan']) M['lib_' + id] = (await gl.loadAsync(`lib/models/${id}.glb`)).scene;
  for (const [tex, variant] of [['red_car', 'skyblue'], ['trashcan', 'green']]) { const t = await loadTex(`lib/textures/${tex}_${variant}.png`, 256); t.flipY = false; T[`lib_${tex}_${variant}`] = t; }
  M.mailbox.traverse((o) => {   // our relic postbox: rusty red instead of sinaboto's blue
    if (!o.isMesh || !o.material.map) return;
    const im = o.material.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const c = cv.getContext('2d'); c.drawImage(im, 0, 0); const d = c.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < d.data.length; i += 4) if (Math.abs(d.data[i] - 139) < 6 && Math.abs(d.data[i + 1] - 139) < 6 && Math.abs(d.data[i + 2] - 139) < 6) { d.data[i] = 168; d.data[i + 1] = 58; d.data[i + 2] = 38; }
    c.putImageData(d, 0, 0); const t = canvasTex(cv); t.flipY = false; o.material.map = t;
  });
  const z = await gl.loadAsync('models/zero_anim.glb'); ZERO = z.scene; CLIPS = z.animations;
  FACES = await (await fetch('models/face_tracks.json')).json();
  T.snow = await texOr('snow', 128, '#eef0f4'); T.stone = await texOr('stone', 128, '#9a8a70'); T.planks = await texOr('planks', 128, '#3a2c22');
  T.roof = await texOr('roof', 128, '#e8eaee'); T.rubble = await texOr('rubble', 128, '#7a8088'); T.wallpaper = await texOr('wallpaper', 128, '#8a8a50');
  T.tiles = await texOr('tiles', 128, '#c8c0a8'); T.ice = await texOr('ice', 64, '#a8e0f0'); T.sawdust = await texOr('sawdust', 64, '#d8b870');
  T.fridgeFront = await texOr('fridge', 128, '#e0d8c0'); T.rust = await texOr('rust', 64, '#d0c8b0');
  T.win = windowTex(false); T.winBroken = windowTex(true); T.door = doorTex(); T.pine = pineTex(); T.tower0 = towerTex(4); T.tower1 = towerTex(9); T.sign = signTex(); T.foam = foamTex();
  if (QS.has('v')) {   // the film: one shot list, timeline from the chosen voice (timeline_<v>.json)
    for (const n of ['bed', 'bathtub']) M['cc_' + n] = (await gl.loadAsync(`models/cc_${n}.glb`)).scene;
    for (const id of ['homework_girl', 'bank_teller', 'art_student', 'hound', 'hawk', 'mini_red_car']) M['lib_' + id] = (await gl.loadAsync(`lib/models/${id}.glb`)).scene;
    for (const [tex, variant] of [['homework_girl', 'red'], ['bank_teller', 'navy'], ['art_student', 'teal'], ['homework_girl', 'green'], ['hound', 'orig'], ['hawk', 'orig'], ['mini_red_car', 'darkgreen']]) { const t = await loadTex(`lib/textures/${tex}_${variant}.png`, 256); t.flipY = false; T[`lib_${tex}_${variant}`] = t; }
    T.dirt = await loadTex('tex/dirt.png', 128); T.brick = await loadTex('tex/brick.png', 128); T.winLit = windowLitTex();
    const TL = await (await fetch(`timeline_${QS.get('v')}.json`)).json();
    const { buildFilm } = await import('./film.js');
    buildFilm({ SHOTS, TL, lib: { snap, SKY_PRESETS, windowTex, doorTex, footprints, still, village, house, hole, drift, snowField, ironFence, lamp, pine, tower, addSky, snowfall, zero, holdIn, meat, iceBlock, letter, fridgeWhole, fridgeSection, kitchenSet, mailSet, icehouseSet, model, libModel, basic, lam, box, plane, mesh, rep, cvs, T, M, FX, LW, LH, S, label, tag, toScreen, commentSticker, upright, setFace, snapAll, nearest, rng, flowTex, THREE } });
    return;
  }
  if (QS.has('board')) { const { buildBoard } = await import('./board.js'); buildBoard({ SHOTS, shotHook, shotIcehouse, shotMail, shotSection, lib: { footprints, still, village, house, hole, drift, snowField, ironFence, lamp, pine, tower, addSky, snowfall, zero, still, holdIn, meat, iceBlock, letter, fridgeWhole, fridgeSection, kitchenSet, mailSet, icehouseSet, model, libModel, basic, lam, box, plane, mesh, rep, cvs, T, M, FX, LW, LH, label, tag, toScreen, commentSticker, upright, THREE } }); return; }
  SHOTS.push(shotHook(0), shotIcehouse(3), shotMail(6), shotSection(9));
}

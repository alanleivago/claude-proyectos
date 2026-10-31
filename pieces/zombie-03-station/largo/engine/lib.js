// lib.js — helpers del remake "barricade a door" (Ava Bread). Base: pieces/digger-03-lock/engine/shots.js (Mechayuki),
// a 360x640 (la referencia mide pixel x3 sobre 1080x1920). Unidades: metros, Y arriba, la heroina mira a +Z.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
export { THREE };

export const LW = 640, LH = 360;   // largo 16:9 (el snap PS1 usa este grid)
export const QS = new URLSearchParams(location.search);
export const SOFT = !QS.has('flat');
export const SHADE_K = Number(QS.get('shade') ?? 0.45);
export const CH = 1.70, S = CH / 13.2;          // la heroina mide 13.2 u en el rig (zero-fem) = 1.70 m
export const M = {}, T = {};
let HERO, CLIPS, FACES;

export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const q15 = (t) => Math.floor(t * 15 + 1e-6) / 15;          // acciones a 15 fps ("on 2s") como el PS1
export function snap(m) {   // PS1 wobble: vertices proyectados al grid de 360x640
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap';
  return m;
}
export function nearest(t) { if (t) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; } return t; }
export function snapAll(root) { root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(snap); }); return root; }
const col = (c) => (typeof c === 'number' && c <= 4 ? new THREE.Color(c, c, c) : new THREE.Color(c));
export const basic = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshBasicMaterial({ map, color: col(color), ...extra }));
export const lam = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshLambertMaterial({ map, color: col(color), ...extra }));
export function mesh(geo, m, x, y, z, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
export function box(w, h, d, m, x, y, z, parent) { return mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent); }
export function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = mesh(new THREE.PlaneGeometry(w, h), m, x, y, z, parent); o.rotation.set(rx, ry, 0); return o; }
export function rep(t, rx, ry) { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; }
export async function img(url) { const i = new Image(); i.src = url; await i.decode(); return i; }
export function canvasTex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t); }
export async function loadTex(url, px) {
  const i = await img(url); const k = Math.min(1, px / Math.max(i.width, i.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(i.width * k); cv.height = Math.round(i.height * k);
  cv.getContext('2d').drawImage(i, 0, 0, cv.width, cv.height); return canvasTex(cv);
}
export function cvs(w, h, f) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; f(cv.getContext('2d'), w, h); return canvasTex(cv); }
export const gltf = new GLTFLoader();
export async function loadModel(url) { const g = await gltf.loadAsync(url); return g; }
/** copia de un GLB cargado, materiales sin brillo + texturas nearest + snap PS1 */
export function ps1Clone(scene, { lit = true, double = true } = {}) {
  const root = SkeletonUtils.clone(scene);
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => snap(new (lit && SOFT ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial)({ name: m.name, map: nearest(m.map || m.emissiveMap), color: (m.map || m.emissiveMap) ? 0xffffff : m.color, alphaTest: 0.5, side: double ? THREE.DoubleSide : THREE.FrontSide, vertexColors: !!o.geometry.attributes.color && !m.map }));
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  return root;
}

// ---------- la heroina (Ava): mismo sistema de caras que Mechayuki (atlas de 16 celdas) ----------
const CELLS = 16;
const FACE = {
  face_eyes: ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink', 'hearts', 'shocked', 'dizzy', 'relaxed', 'disgust'],
  face_mouth: ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout', 'blep', 'cat', 'gasp', 'bigShock', 'disgust'],
};
export function setFace(root, { eyes, mouth } = {}) {
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
function shadeMix(root) {
  if (!SOFT) return;
  root.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      const prev = m.onBeforeCompile;
      m.onBeforeCompile = (sh, r) => { prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `outgoingLight = mix(diffuseColor.rgb, outgoingLight, ${SHADE_K.toFixed(3)});\n#include <opaque_fragment>`); };
      m.customProgramCacheKey = () => 'snap-shade' + SHADE_K;
    });
  });
}
/** Ava. ch.pose(lt, segs, faces): segs [{clip, at, from, speed, loop, fade}], faces [[t, eyes, mouth]] o null (cara de la accion) */
export function hero() {
  const root = SkeletonUtils.clone(HERO);
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => new (SOFT ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial)({ name: m.name, map: nearest(m.map || m.emissiveMap), alphaTest: 0.5, side: THREE.DoubleSide });   // Blender exporta los materiales Emission como emissiveTexture
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  setFace(root, { eyes: 'open', mouth: 'neutral' }); snapAll(root); shadeMix(root);
  root.scale.setScalar(S); root.position.y = 9.0 * S;
  const wrap = new THREE.Group(); wrap.add(root);
  const sh = mesh(new THREE.CircleGeometry(0.3, 10), basic(null, 0x101014, { transparent: true, opacity: 0.6, depthWrite: false }), 0, 0.012, 0, wrap); sh.rotation.x = -Math.PI / 2; sh.scale.y = 0.75;
  const mixer = new THREE.AnimationMixer(root), acts = {};
  const act = (n) => acts[n] || (acts[n] = (() => { const c = THREE.AnimationClip.findByName(CLIPS, n); if (!c) throw new Error('clip ' + n); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); return a; })());
  const hand = (side) => root.getObjectByName('Hand' + side);
  const HB = root.getObjectByName('Head'), NB = root.getObjectByName('Neck'); let saved = null;
  function pose(lt, segs, faces) {
    const q = q15(lt);
    let i = 0; while (i < segs.length - 1 && q >= segs[i + 1].at) i++;
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    if (saved) { NB.quaternion.copy(saved[0]); HB.quaternion.copy(saved[1]); saved = null; }   // deshace el lookAt anterior: el mixer no reescribe un hueso si su valor no cambio
    const clipT = (s) => { const a = act(s.clip), d = a.getClip().duration; let x = (s.from || 0) + (q - s.at) * (s.speed ?? 1); x = s.loop ? ((x % d) + d) % d : Math.min(d - 1e-4, Math.max(0, x)); return [a, x]; };
    const cur = segs[i], [a, x] = clipT(cur);
    const w = i > 0 && cur.fade ? clamp01((q - cur.at) / cur.fade) : 1;
    a.time = x; a.setEffectiveWeight(w);
    if (w < 1) { const [b, y] = clipT({ ...segs[i - 1] }); b.time = y; b.setEffectiveWeight(1 - w); }
    mixer.update(0);
    let face;
    if (faces) { face = faces[0]; for (const f of faces) if (f[0] <= q + 1e-6) face = f; face = { eyes: face[1], mouth: face[2] }; }
    else { const tr = FACES[cur.clip] || [[1, 'open', 'neutral']]; const fr = Math.floor(x * 30) + 1; let k = tr[0]; for (const f of tr) if (f[0] <= fr) k = f; face = { eyes: k[1], mouth: k[2] }; }
    setFace(root, face);
  }
  // mirar a camara (pedido del usuario: en los planos frontales miraba arriba): gira Neck/Head hacia la camara despues de la pose
  const FWD = new THREE.Vector3(0, 0, 1);
  wrap.updateMatrixWorld(true); const rest = new THREE.Quaternion();
  { const qw = new THREE.Quaternion(), qr = new THREE.Quaternion(); HB.getWorldQuaternion(qw); wrap.getWorldQuaternion(qr); rest.copy(qr.invert().multiply(qw)); }
  function lookAt(camera, w = 1, maxDeg = 35) {
    saved = [NB.quaternion.clone(), HB.quaternion.clone()];
    wrap.updateMatrixWorld(true);
    for (const [b, share] of [[NB, 0.35], [HB, 1]]) {
      if (!b) continue;
      const qw = new THREE.Quaternion(), qr = new THREE.Quaternion(), hp = new THREE.Vector3(); b.getWorldQuaternion(qw); wrap.getWorldQuaternion(qr); HB.getWorldPosition(hp);
      const dev = qr.clone().invert().multiply(qw).multiply(rest.clone().invert());               // giro actual de la cabeza respecto a reposo
      const f = FWD.clone().applyQuaternion(dev).applyQuaternion(qr).normalize();
      const d = camera.position.clone().sub(hp).normalize();
      const full = new THREE.Quaternion().setFromUnitVectors(f, d), ang = 2 * Math.acos(Math.min(1, Math.abs(full.w)));
      const k = Math.min(1, (maxDeg * Math.PI / 180) / Math.max(1e-6, ang)) * w * (b === NB ? share : 1 - 0.35);
      const R = new THREE.Quaternion().slerp(full, k);
      const pw = new THREE.Quaternion(); b.parent.getWorldQuaternion(pw);
      b.quaternion.copy(pw.invert().multiply(R.multiply(qw)));
      b.updateMatrixWorld(true);
    }
  }
  return { root: wrap, pose, hand, bone: root, shadow: sh, lookAt };
}
export const seg = (clip, at, o = {}) => ({ clip, at, ...o });
export const still = (clip, x) => [seg(clip, -99, { from: x, speed: 0 })];
/** prop en la mano: off/rot en el espacio del hueso Hand (unidades del rig) */
export function holdIn(ch, prop, side, off = [0, 0.8, 0], rot = [0, 0, 0]) { const h = ch.hand(side); h.add(prop); prop.scale.multiplyScalar(1 / S); prop.position.set(...off); prop.rotation.set(...rot); return prop; }

// ---------- overlays ----------
export const toScreen = (cam, x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [Math.round((v.x * 0.5 + 0.5) * LW), Math.round((0.5 - v.y * 0.5) * LH)]; };

export async function loadHero() {
  const z = await gltf.loadAsync('models/heroine_anim.glb'); HERO = z.scene; CLIPS = z.animations;
  // pantalon limpio: la textura Body traia lineas claras sueltas en las islas de las piernas (rayas verticales palidas); tex/ava_body_clean.png = misma textura con esos pixeles reemplazados por el negro del pantalon
  const clean = await new THREE.ImageLoader().loadAsync('tex/ava_body_clean.png');
  HERO.traverse((o) => { if (!o.isMesh) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) { const t = m.name === 'Body_mat' && (m.map || m.emissiveMap); if (t) { t.image = clean; t.needsUpdate = true; } } });
  FACES = await (await fetch('models/face_tracks.json')).json();
  return CLIPS.map((c) => c.name);
}

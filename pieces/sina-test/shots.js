// The four shots of the 10 s test (ref: "How to properly heat up your home", 0:00-0:10).
// Each shot: { t0, scene, camera, update(localT, globalT), overlay?(localT, drawText, weight) }.
import * as THREE from 'three';
import { makeGirl, POSES, blend } from './char.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

let NETO = null;   // the rigged low poly girl (models/neto.glb), cloned per shot
function neto() {
  const root = SkeletonUtils.clone(NETO);
  root.traverse((o) => {
    if (!o.isMesh) return;
    const src = o.material;
    if (src.map) { src.map.minFilter = src.map.magFilter = THREE.NearestFilter; src.map.generateMipmaps = false; }
    o.material = new THREE.MeshLambertMaterial({ map: src.map, alphaTest: 0.5, side: THREE.DoubleSide });
  });
  return root;
}

export const SHOTS = [];
const T = {};

// ---------- helpers ----------
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ease = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function canvasTex(cv, repeat) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;   // PS1: no mipmaps, no filtering
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// load tex/<name>.jpg downscaled to <= px; key=true turns the green screen into alpha
async function loadTex(name, px = 128, key = false, gain = 1) {
  const img = new Image(); img.src = `tex/${name}.jpg`;
  try { await img.decode(); } catch { img.width = 0; }
  const cv = document.createElement('canvas');
  if (!img.width) { cv.width = cv.height = 4; const c = cv.getContext('2d'); c.fillStyle = '#888'; c.fillRect(0, 0, 4, 4); return cv; }
  const k = Math.min(1, px / Math.max(img.width, img.height));
  cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
  const c = cv.getContext('2d'); c.drawImage(img, 0, 0, cv.width, cv.height);
  if (gain !== 1) {
    const d = c.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < d.data.length; i += 4) for (let j = 0; j < 3; j++) d.data[i + j] = Math.min(255, d.data[i + j] * gain);
    c.putImageData(d, 0, 0);
  }
  if (key) {
    const d = c.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]];
      if (g > 120 && g > r * 1.35 && g > b * 1.35) d.data[i + 3] = 0;
    }
    c.putImageData(d, 0, 0);
  }
  return cv;
}

const lam = (map, color = 0xffffff, extra = {}) => new THREE.MeshLambertMaterial({ map, color, ...extra });
function box(w, h, d, m, x, y, z, parent) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); parent.add(o); return o; }
function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); parent.add(o); return o; }

// procedural textures
function smokeTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; const c = cv.getContext('2d'); const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const x = 9 + r() * 14, y = 9 + r() * 14, s = 5 + r() * 7, v = 140 + r() * 60;
    c.fillStyle = `rgba(${v},${v},${v},0.85)`; c.beginPath(); c.arc(x, y, s, 0, Math.PI * 2); c.fill();
  }
  return canvasTex(cv);
}
const fireCv = document.createElement('canvas'); fireCv.width = 48; fireCv.height = 32;
const fireTex = canvasTex(fireCv);
function drawFire(frame) {   // jagged pixel flames, new shape every 2 frames
  const c = fireCv.getContext('2d'); c.clearRect(0, 0, 48, 32); const r = rng(1000 + Math.floor(frame / 2));
  for (let x = 0; x < 48; x += 2) {
    const h = 6 + r() * 22 * (1 - Math.abs(x - 24) / 30);
    for (const [col, k] of [['#c81e0a', 1], ['#ff6a00', 0.75], ['#ffd21a', 0.4]]) {
      c.fillStyle = col; c.fillRect(x, 32 - h * k, 2, h * k);
    }
  }
  fireTex.needsUpdate = true;
}
function skyTex() {   // pixel-art sky: pale blue bands, blocky clouds, round sun
  const W = 96, H = 64; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  for (let y = 0; y < H; y++) { const k = y / H; c.fillStyle = `rgb(${150 + 70 * k | 0},${190 + 45 * k | 0},${230 + 20 * k | 0})`; c.fillRect(0, y, W, 1); }
  const r = rng(11); c.fillStyle = '#eef3f8';
  for (let i = 0; i < 9; i++) { const x = r() * W, y = 4 + r() * 30, w = 10 + r() * 26; c.fillRect(x | 0, y | 0, w | 0, 2); c.fillRect((x + 3) | 0, (y - 2) | 0, (w * 0.6) | 0, 2); }
  c.fillStyle = '#f6e7a0'; c.beginPath(); c.arc(38, 16, 5, 0, Math.PI * 2); c.fill();     // sun, top-left of the framed part
  c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(38, 16, 3.8, 0, Math.PI * 2); c.fill();
  return canvasTex(cv);
}
function vignetteTex() {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 112; const c = cv.getContext('2d');
  const g = c.createRadialGradient(36, 52, 10, 32, 56, 64);
  g.addColorStop(0, 'rgba(10,18,28,0)'); g.addColorStop(0.55, 'rgba(10,18,28,0.25)'); g.addColorStop(1, 'rgba(8,14,22,0.95)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 112);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- the living room (shots A and C) ----------
function livingRoom(scene) {
  const room = new THREE.Group(); scene.add(room);
  plane(8, 8, lam(T.floor), 0, 0, 0, room, 0, -Math.PI / 2);
  plane(6, 3, lam(T.wallpaper), -1.2, 1.5, -1.6, room);
  plane(6, 3, lam(T.wallpaper), -2.4, 1.5, 0.4, room, Math.PI / 2);
  // window + curtains on the back wall, right side
  plane(1.1, 1.3, lam(T.window, 0xffffff, { emissive: 0x9aa6b0 }), 1.25, 1.45, -1.58, room);
  for (const x of [0.55, 1.95]) box(0.3, 2.2, 0.06, lam(T.curtain), x, 1.6, -1.55, room);
  // pink floral sofa behind her
  const sofa = lam(T.sofa);
  box(2.2, 0.42, 0.8, sofa, 0.3, 0.21, -1.15, room);
  box(2.2, 0.7, 0.22, sofa, 0.3, 0.65, -1.45, room);
  for (const x of [-0.85, 1.45]) box(0.22, 0.6, 0.8, sofa, x, 0.3, -1.15, room);
  scene.add(new THREE.HemisphereLight(0xfff2e0, 0x6a5040, 1.6));
  const sun = new THREE.DirectionalLight(0xfff0dd, 1.6); sun.position.set(2, 3, 2); scene.add(sun);
  return room;
}

function shotA() {   // 0.00-2.02: sitting on the floor, striking a match
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8a9a8a);
  livingRoom(scene);
  const g = makeGirl(T); g.root.rotation.y = 1.15; scene.add(g.root);   // 3/4, turned towards frame right
  const matches = box(0.09, 0.03, 0.06, lam(null, 0xd0202a), 0, -0.1, 0.03, g.J.wristR);
  const cam = new THREE.PerspectiveCamera(42, 9 / 16, 0.05, 50);
  return {
    t0: 0, scene, camera: cam,
    update(lt) {
      const p = blend(POSES.sit, { ...POSES.sit, elbowR: [-1.25, 0, 0.35], wristR: [0.3] }, 0.5 + 0.5 * Math.sin(lt * 5));
      g.set(p);
      cam.position.set(1.0 - lt * 0.03, 0.92, 1.85 - lt * 0.04); cam.lookAt(0.05, 0.55, 0.05);
    },
  };
}

function shotC() {   // 5.37-7.68: fire on the floor, smoke fills the room
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8a9a8a);
  livingRoom(scene);
  const g = makeGirl(T); scene.add(g.root);
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.33), new THREE.MeshBasicMaterial({ map: fireTex, transparent: true, alphaTest: 0.5 }));
  fire.position.set(0, 0.16, 0.6); scene.add(fire);
  const fireLight = new THREE.PointLight(0xff7a20, 3, 3); fireLight.position.set(0, 0.4, 0.7); scene.add(fireLight);
  const smoke = smokeTex(); const puffs = []; const r = rng(21);
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, transparent: true, depthWrite: false, opacity: 0 }));
    s.userData = { x: (r() - 0.5) * 3, z: -1 + r() * 1.8, d: r() * 1.4, sp: 0.25 + r() * 0.3, sz: 0.5 + r() * 0.7 };
    scene.add(s); puffs.push(s);
  }
  scene.fog = new THREE.Fog(0x9c9c9c, 30, 40);
  const cam = new THREE.PerspectiveCamera(46, 9 / 16, 0.05, 50);
  return {
    t0: 5.37, scene, camera: cam,
    update(lt, t) {
      drawFire(Math.round(t * 30));
      g.set(blend(POSES.sitScared, { ...POSES.sitScared, head: [0.05, 0.25, 0] }, ease(clamp01((lt - 0.6) / 0.5))));
      const k = ease(clamp01(lt / 1.8));            // smoke thickens to a whiteout by "house,"
      scene.fog.near = 6 - 5.8 * k; scene.fog.far = 9 - 6.6 * k;
      for (const s of puffs) {
        const u = s.userData, life = lt - u.d;
        s.material.opacity = clamp01(life * 2) * 0.9;
        s.position.set(u.x + Math.sin(life + u.x) * 0.1, 0.4 + life * u.sp * 1.6, u.z);
        s.scale.setScalar(u.sz * (1 + life * 0.4));
      }
      cam.position.set(0, 0.95, 2.1 - lt * 0.05); cam.lookAt(0, 0.68, 0);
    },
  };
}

// ---------- the house cross-section (shot B) ----------
function shotB() {   // 2.02-5.37: the house cut open, two room temperatures, "CENTRAL HEATING"
  const scene = new THREE.Scene();
  plane(160, 80, new THREE.MeshBasicMaterial({ map: skyTex(), fog: false }), 0, 22, -60, scene);
  // snowy yard, trees, fence
  plane(80, 40, lam(T.snow, 0xffffff), 0, 0, -20, scene, 0, -Math.PI / 2).material.map.repeat?.set(6, 3);
  const trees = [];
  const r = rng(3);
  for (let i = 0; i < 18; i++) {
    const kind = ['pine1', 'pine2', 'pine1', 'bare'][i % 4];
    const h = 7 + r() * 4, x = -22 + i * 2.7 + r() * 1.5, z = -16 - r() * 12;
    const m = new THREE.MeshLambertMaterial({ map: T[kind], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    trees.push(plane(h * 0.55, h, m, x, h / 2, z, scene));
  }
  const fenceM = lam(T.fence, 0xd8d8d8);
  for (let x = -14; x <= 14; x += 1.6) box(0.12, 1.0, 0.12, fenceM, x, 0.5, -4.5, scene);
  for (const y of [0.45, 0.85]) box(29, 0.1, 0.06, fenceM, 0, y, -4.5, scene);

  // ground cross-section in front (z = 0 plane), with the basement hole
  const soilM = lam(T.soil), gravelM = lam(T.gravel);
  const W = 6.2, BD = 2.6;                    // house width, basement depth
  // soil band with a hole where the basement is cut open, gravel below
  const SB = 3.3, HW = W / 2 + 0.09;
  plane(20 - HW, SB, soilM, -(HW + (20 - HW) / 2), -SB / 2, 0, scene);
  plane(20 - HW, SB, soilM, HW + (20 - HW) / 2, -SB / 2, 0, scene);
  plane(2 * HW, SB - BD - 0.06, soilM, 0, -BD - 0.06 - (SB - BD - 0.06) / 2, 0, scene);
  plane(40, 14, gravelM, 0, -SB - 7, 0, scene);
  // the basement behind the cut: light concrete walls and floor
  const concrete = lam(T.basement, 0xc0d4f0, { emissive: 0x30405a });
  plane(W, BD, concrete, 0, -BD / 2, -1.6, scene);
  plane(W, 1.6, concrete, 0, -BD + 0.01, -0.8, scene, 0, -Math.PI / 2);
  for (const s of [-1, 1]) plane(1.6, BD, concrete, s * (W / 2 - 0.01), -BD / 2, -0.8, scene, -s * Math.PI / 2);

  const house = new THREE.Group(); scene.add(house);
  const frameM = lam(null, 0x3a2a22);
  // outer frame of the cutaway (thick dark edges)
  box(0.18, 2.8 + BD, 0.4, frameM, -W / 2, (2.8 - BD) / 2, -0.2, house);
  box(0.18, 2.8 + BD, 0.4, frameM, W / 2, (2.8 - BD) / 2, -0.2, house);
  box(W, 0.16, 0.4, frameM, 0, 0.0, -0.2, house);       // ground floor slab
  box(W, 0.14, 0.4, frameM, 0, 2.8, -0.2, house);       // ceiling
  box(W, 0.12, 0.4, frameM, 0, -BD, -0.2, house);       // basement floor
  box(0.12, 2.8, 0.4, frameM, 0.35, 1.4, -0.2, house);  // wall between the rooms
  // living room (left): wallpaper, window, curtains, sofa, tiny girl with a fire
  plane(W / 2 + 0.3, 2.8, lam(T.wallpaper), -1.4, 1.4, -1.6, house);
  plane(0.9, 1.0, lam(T.window, 0xffffff, { emissive: 0x808890 }), -1.0, 1.55, -1.58, house);
  for (const x of [-1.55, -0.45]) box(0.25, 1.5, 0.05, lam(T.curtain), x, 1.75, -1.55, house);
  box(1.3, 0.45, 0.6, lam(T.sofa), -1.0, 0.3, -1.25, house);
  plane(3.4, 1.6, lam(T.floor), -1.4, 0.09, -0.8, house, 0, -Math.PI / 2);
  const g = makeGirl(T); g.root.scale.setScalar(0.62); g.root.position.set(-1.65, 0.08, -0.5); g.set(POSES.sit); house.add(g.root);
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.24), new THREE.MeshBasicMaterial({ map: fireTex, transparent: true, alphaTest: 0.5 }));
  fire.position.set(-1.65, 0.2, -0.2); house.add(fire);
  // bedroom (right)
  plane(W / 2 - 0.2, 2.8, lam(T.bedroom), 1.75, 1.4, -1.6, house);
  plane(2.9, 1.6, lam(T.floor, 0x9fb0ff), 1.75, 0.09, -0.8, house, 0, -Math.PI / 2);
  // basement: stairs on the left, concrete
  const stairM = lam(T.floor, 0xbb9977);
  for (let i = 0; i < 9; i++) box(0.7, 0.12, 0.28, stairM, -2.55 + i * 0.0, -BD + 0.15 + i * 0.28, -0.6 - i * 0.0, house).position.x = -2.65 + i * 0.12;
  box(0.5, 1.1, 0.5, lam(null, 0x6a5a50), 0.2, -BD + 0.6, -1.2, house);
  // roof: gable front + slopes
  const roofM = lam(T.roof), gableM = lam(T.attic, 0x9a8070);
  const shape = new THREE.Shape([new THREE.Vector2(-W / 2 - 0.5, 0), new THREE.Vector2(W / 2 + 0.5, 0), new THREE.Vector2(0, 2.3)]);
  const gable = new THREE.Mesh(new THREE.ShapeGeometry(shape), gableM); gable.position.set(0, 2.86, 0.02); house.add(gable);
  for (const s of [-1, 1]) {
    const len = Math.hypot(W / 2 + 0.6, 2.3);
    const slope = box(len, 0.16, 2.2, roofM, s * (W / 4 + 0.25), 2.86 + 1.15, -1.0, house);
    slope.rotation.z = -s * Math.atan2(2.3, W / 2 + 0.5);
    const trim = box(len, 0.1, 0.1, lam(null, 0xf2f2f2), s * (W / 4 + 0.25), 2.86 + 1.15 + 0.08, 0.06, house);
    trim.rotation.z = slope.rotation.z;
  }
  scene.add(new THREE.HemisphereLight(0xeef4ff, 0x8a7a70, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-3, 6, 5); scene.add(sun);

  // framed like the ref: house ~63% of the width and left of centre, ground line at 57% of the height
  const cam = new THREE.PerspectiveCamera(48, 9 / 16, 0.1, 300);
  cam.position.set(0.9, 4.0, 23); cam.lookAt(0.9, 1.3, 0);
  return {
    t0: 2.02, scene, camera: cam,
    update(lt, t) { drawFire(Math.round(t * 30)); },
    overlay(lt, drawText, w) {
      if (w < 0.5) return;
      drawText('38°F', 92, 268, 13, '#8fe3ff', { font: 'Tahoma', stroke: 3 });
      drawText('36°F', 232, 268, 13, '#8fe3ff', { font: 'Tahoma', stroke: 3 });
      if (lt + 2.02 >= 3.5) {
        drawText('CENTRAL', 180, 392, 15, '#ffd83a', { font: 'Tahoma', stroke: 4 });
        drawText('HEATING', 180, 410, 15, '#ffd83a', { font: 'Tahoma', stroke: 4 });
      }
    },
  };
}

// ---------- the attic (shot D) ----------
function shotD() {   // 7.68-10.0: in the dark attic, saw raised, smoke column curling up
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1c2632);
  scene.fog = new THREE.Fog(0x2a3440, 3.5, 12);   // dusty haze
  const wood = lam(T.attic, 0x9a9aa8);
  plane(8, 8, lam(T.floor, 0x777788), 0, 0, 0, scene, 0, -Math.PI / 2);
  for (const s of [-1, 1]) {   // A-frame roof slopes
    const p = plane(6, 5, wood, s * 1.6, 2.0, -1.0, scene);
    p.rotation.set(0, 0, 0); p.position.set(s * 1.4, 2.0, -1.2); p.rotation.y = -s * 0.15; p.rotation.z = s * 0.55;
  }
  const back = new THREE.Shape([new THREE.Vector2(-3, 0), new THREE.Vector2(3, 0), new THREE.Vector2(0, 3.6)]);
  const bw = new THREE.Mesh(new THREE.ShapeGeometry(back), wood); bw.position.set(0.4, 0, -2.2); scene.add(bw);
  const g = makeGirl(T); g.root.position.set(0.75, 0, 0.2); g.root.rotation.y = -0.5; scene.add(g.root);
  g.root.visible = false;   // TEST: the real model stands in for the box girl
  const n = neto(); const bb = new THREE.Box3().setFromObject(n);
  n.scale.setScalar(1.62 / (bb.max.y - bb.min.y)); n.position.set(0.6, -bb.min.y * n.scale.y, 0.2); n.rotation.y = -0.4; scene.add(n);
  console.log('neto bbox', JSON.stringify(bb));
  // hand saw in the raised right hand
  const saw = new THREE.Group(); g.J.wristR.add(saw); saw.position.set(0, -0.08, 0.02);
  const blade = box(0.05, 0.5, 0.008, lam(null, 0xd8dde4), 0, -0.3, 0, saw); blade.rotation.z = 0.1;
  box(0.09, 0.13, 0.03, lam(null, 0xff8a1a), 0, -0.02, 0, saw);
  const smoke = smokeTex(); const puffs = [];
  for (let i = 0; i < 11; i++) {   // separate lumpy puffs, not a tube
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, depthWrite: false, transparent: true, color: 0x6a6e74, opacity: 0.9 }));
    s.material.rotation = i * 1.7;
    s.userData = { u: i / 11 }; scene.add(s); puffs.push(s);
  }
  scene.add(new THREE.HemisphereLight(0x9ab0d0, 0x202830, 1.3));
  const key = new THREE.DirectionalLight(0xc8d8ff, 1.4); key.position.set(-1, 3, 3); scene.add(key);
  const cam = new THREE.PerspectiveCamera(50, 9 / 16, 0.05, 50);
  const vig = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: vignetteTex(), transparent: true, depthTest: false }));
  vig.position.z = -0.6; vig.scale.set(0.27, 0.48, 1); vig.renderOrder = 10; cam.add(vig); scene.add(cam);
  return {
    t0: 7.68, scene, camera: cam,
    update(lt) {
      const saw = Math.sin(lt * 14) * 0.12;
      g.set({ ...POSES.saw, shoulderR: [-2.75 + saw, 0, -0.25], elbowR: [-0.35 - saw] });
      for (const s of puffs) {   // a column from the floor (left) curving up to the cut in the roof
        const u = (s.userData.u + lt * 0.12) % 1;
        s.position.set(-1.3 + u * 1.9 + Math.sin(u * 3) * 0.3, 0.1 + u * 2.15, -0.2 - u * 0.2);
        s.scale.setScalar(0.45 + 0.2 * Math.sin(u * 9 + 1) + u * 0.25);
      }
      cam.position.set(-0.1, 1.2, 4.6 - lt * 0.06); cam.lookAt(0.1, 1.15, 0);
    },
  };
}

export async function loadAll() {
  const spec = { wallpaper: 128, floor: 128, sofa: 128, window: 128, curtain: 64, roof: 128, siding: 128, soil: 128, gravel: 128,
    snow: 128, bedroom: 192, basement: 128, attic: 128, fence: 64, vest: 96, pants: 64, face: 96, hair: 64 };
  const GAIN = { soil: 1.7, gravel: 1.3, basement: 1.8 };
  for (const [n, px] of Object.entries(spec)) {
    const file = n === 'face' ? 'face_crop' : n;
    T[n] = canvasTex(await loadTex(file, px, false, GAIN[n] || 1), ['floor', 'snow', 'gravel', 'soil', 'attic', 'roof', 'basement'].includes(n) ? [4, 4] : null);
  }
  for (const n of ['pine1', 'pine2', 'bare']) T[n] = canvasTex(await loadTex(n, 128, true));
  NETO = (await new GLTFLoader().loadAsync('models/neto.glb')).scene;
  SHOTS.push(shotA(), shotB(), shotC(), shotD());
}

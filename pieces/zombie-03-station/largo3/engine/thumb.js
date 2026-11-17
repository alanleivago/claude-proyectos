// thumb.js — capas con alfa para las miniaturas v2 (key art RE Requiem): Ava con linterna, cabeza del gigante, siluetas de zombis.
// window.shoot(o) -> { url (png con alfa), lens:[x,y] en px }. Driver: thumb_shoot.mjs
import * as THREE from 'three';
import * as L from './lib.js';
import { paintScared } from './sets/avaface.js';
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

await L.loadHero();
const SG = await L.loadModel('models/stalker_ps1.glb');
const ZG = { city: await L.loadModel('models/city-zombie.glb'), thin: await L.loadModel('models/thin-zombie.glb') };
const lam = L.lam, cyl = (rt, rb, h, s, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(rt, rb, h, s), m, x, y, z, p);

function mkGun() {
  const g = new THREE.Group(), mS = lam(null, 0x2a2b2f), mF = lam(null, 0x16161a);
  L.box(0.19, 0.034, 0.03, mS, 0, 0.02, 0, g); L.box(0.17, 0.02, 0.028, mF, -0.01, -0.005, 0, g);
  const gr = L.box(0.035, 0.11, 0.032, mF, -0.065, -0.06, 0, g); gr.rotation.z = 0.25; L.box(0.008, 0.01, 0.008, mF, 0.09, 0.042, 0, g); return g;
}
function mkTorch() {
  const g = new THREE.Group(), mB = lam(null, 0x1a1a1c);
  cyl(0.017, 0.017, 0.14, 10, mB, 0, 0, 0, g).rotation.z = Math.PI / 2;
  cyl(0.027, 0.019, 0.05, 10, mB, 0.085, 0, 0, g).rotation.z = Math.PI / 2;
  cyl(0.023, 0.023, 0.004, 10, L.basic(null, 0xfff6d0), 0.111, 0, 0, g).rotation.z = Math.PI / 2;
  return g;
}

// Ava, una vez
const scene = new THREE.Scene();
const ch = L.hero(); paintScared(ch); scene.add(ch.root); ch.shadow.visible = false;
const torch = mkTorch(); L.holdIn(ch, torch, 'L', [0, 0.75, 0.22], [0, 0, Math.PI / 2]);
const gun = mkGun(); L.holdIn(ch, gun, 'R', [0, 0.62, 0.32], [0, Math.PI / 2, Math.PI / 2]);
const UA = ch.bone.getObjectByName('UpperArmL'), FA = ch.bone.getObjectByName('ForearmL'), HA = ch.bone.getObjectByName('HandL');
const UAL = ch.bone.getObjectByName('UpperArmR'), FAL = ch.bone.getObjectByName('ForearmR'), HAL = ch.bone.getObjectByName('HandR');

// gigante
const st = L.ps1Clone(SG.scene); const stW = new THREE.Group(); stW.add(st); scene.add(stW);
{ st.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(st), k = 2.6 / (bb.max.y - bb.min.y); st.scale.multiplyScalar(k); st.position.y = -bb.min.y * k; }
const bn = {}; st.traverse((o) => { if (o.isBone) bn[o.name] = o; }); const q0 = {}; for (const [n, b] of Object.entries(bn)) q0[n] = b.quaternion.clone();
const boxL = new THREE.PointLight(0x5aff6a, 1.5, 1.6, 1.5); if (bn.chest) { bn.chest.add(boxL); boxL.position.set(0, 0.2 / st.scale.x, 0.3 / st.scale.x); }

// zombis
const SK = await import('three/addons/utils/SkeletonUtils.js');
const zs = [];
function zombie(kind) { const g = ZG[kind]; const r = SK.clone(g.scene); r.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = new THREE.MeshBasicMaterial({ color: 0x000000 }); } });
  r.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(r, true), k = 1.8 / (bb.max.y - bb.min.y); r.scale.multiplyScalar(k); const w = new THREE.Group(); w.add(r); scene.add(w);
  const mx = new THREE.AnimationMixer(r); return { w, r, mx, g }; }

const lights = new THREE.Group(); scene.add(lights);
function setLights(list) { lights.clear(); for (const l of list) { lights.add(l); if (l.target) lights.add(l.target); } }

let restore = null;
window.shoot = (o) => {
  if (restore) { restore(); restore = null; }
  const W = o.w || 1600, H = o.h || 2000; renderer.setSize(W, H, false);
  const cam = new THREE.PerspectiveCamera(o.fov || 30, W / H, 0.05, 100);
  ch.root.visible = o.mode === 'ava'; stW.visible = o.mode === 'stalker'; zs.forEach((z) => { z.w.visible = false; });
  let lens = null;
  if (o.mode === 'ava') {
    ch.root.position.set(0, 0, 0); ch.root.rotation.y = o.yaw || 0;
    ch.pose(0, L.still(o.clip || 'idle', o.from ?? 0.3), [[-99, o.eyes || 'open', o.mouth || 'neutral']]);
    const ARMB = [UA, FA, HA, UAL, FAL, HAL]; const sv = ARMB.map((b) => b.quaternion.clone()); restore = () => ARMB.forEach((b, i) => b.quaternion.copy(sv[i]));
    const R = (b, ax, a) => b.rotateOnAxis(ax, a);
    const a = o.arm || {}; R(UA, V(1, 0, 0), a.ux ?? 0); R(UA, V(0, 0, 1), a.uz ?? 0); R(UA, V(0, 1, 0), a.uy ?? 0); R(FA, V(1, 0, 0), a.fx ?? 0); R(FA, V(0, 0, 1), a.fz ?? 0); R(FA, V(0, 1, 0), a.fy ?? 0); R(HA, V(1, 0, 0), a.hx ?? 0); R(HA, V(0, 0, 1), a.hz ?? 0); R(HA, V(0, 1, 0), a.hy ?? 0);
    const b = o.armR || {}; R(UAL, V(1, 0, 0), b.ux ?? 0); R(UAL, V(0, 0, 1), b.uz ?? 0); R(FAL, V(1, 0, 0), b.fx ?? 0); R(FAL, V(0, 0, 1), b.fz ?? 0); R(HAL, V(1, 0, 0), b.hx ?? 0); R(HAL, V(0, 0, 1), b.hz ?? 0);
    cam.position.set(...o.cam); cam.lookAt(...o.look); cam.updateMatrixWorld();
    if (o.lookCam) ch.lookAt(cam, 1, o.lookMax || 30);
    ch.root.updateMatrixWorld(true);
    const lp = torch.localToWorld(V(0.115, 0, 0)), dir = torch.localToWorld(V(1.115, 0, 0)).sub(lp).normalize();
    const sp = new THREE.SpotLight(0xffe2b0, 30, 6, 0.7, 1, 1.2); sp.position.copy(lp); sp.target.position.copy(lp).addScaledVector(dir, 2);
    const warm = new THREE.PointLight(0xffc890, o.warm ?? 2.2, 1.2, 1.5); warm.position.copy(lp).add(V(0, 0.02, 0.06));
    const rim = new THREE.DirectionalLight(0x9ec4e0, o.rim ?? 2.4); rim.position.set(-2, 2.5, -2.5);
    const rim2 = new THREE.DirectionalLight(0x7fa6c8, (o.rim ?? 2.4) * 0.6); rim2.position.set(2.5, 1.5, -2);
    const fill = new THREE.DirectionalLight(0x8a9cb0, o.fill ?? 0.7); fill.position.set(1.5, 1.2, 3);
    setLights([sp, warm, rim, rim2, fill, new THREE.AmbientLight(0x4a5a6a, o.amb ?? 0.5)]);
    const v = lp.clone().project(cam); lens = [(v.x * 0.5 + 0.5) * W, (0.5 - v.y * 0.5) * H];
  } else if (o.mode === 'stalker') {
    for (const [n, bq] of Object.entries(bn)) bq.quaternion.copy(q0[n]);
    const R = (n, ax, a) => { if (bn[n]) bn[n].rotateOnAxis(ax, a); };
    R('head', V(0, 0, 1), o.tilt || 0); R('head', V(0, 1, 0), o.yawHead || 0); R('head', V(1, 0, 0), o.pitch || 0);
    stW.rotation.y = o.yaw || 0; st.updateMatrixWorld(true);
    const hp = bn.head.getWorldPosition(V());
    cam.position.copy(hp).add(V(...o.camOff)); cam.lookAt(hp.clone().add(V(...(o.lookOff || [0, 0, 0])))); cam.updateMatrixWorld();
    const key = new THREE.DirectionalLight(0xc8d8e8, o.key ?? 2.0); key.position.copy(hp).add(V(...(o.keyPos || [-1.5, 1.2, 1])));
    const rim = new THREE.DirectionalLight(0xa0c0e0, 2.5); rim.position.copy(hp).add(V(1.5, 0.8, -1.5));
    rim.intensity = o.rim ?? 2.5; if (o.rimPos) rim.position.copy(hp).add(V(...o.rimPos));
    const rim2 = new THREE.DirectionalLight(0x9ec4e8, o.rim2 ?? 0); rim2.position.copy(hp).add(V(-1.6, 0.6, -1.4));
    const warmS = new THREE.PointLight(0xffc48a, o.warm ?? 0, 6, 1.2); warmS.position.copy(hp).add(V(...(o.warmPos || [1.6, -0.3, 1.4])));
    setLights([key, rim, rim2, warmS, new THREE.AmbientLight(0x50586a, o.amb ?? 0.7)]);
    boxL.intensity = o.box ?? 0.25;
  } else if (o.mode === 'zombies') {
    while (zs.length < o.list.length) zs.push(zombie(zs.length % 2 ? 'thin' : 'city'));
    o.list.forEach((d, i) => { const z = zs[i]; z.w.visible = true; z.w.position.set(d.x, 0, d.z); z.w.rotation.y = d.yaw; z.w.scale.setScalar(d.s || 1);
      z.mx.stopAllAction(); const clip = THREE.AnimationClip.findByName(z.g.animations, d.clip) || z.g.animations[0]; const ac = z.mx.clipAction(clip); ac.play(); z.mx.setTime(d.t || 0); z.w.scale.setScalar(1); z.w.position.set(0, 0, 0); z.r.scale.setScalar(z.k0 || (z.k0 = z.r.scale.x)); z.r.position.set(0, 0, 0); z.w.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(z.r, true), hk = 1.8 / Math.max(1e-6, bb.max.y - bb.min.y); z.r.scale.multiplyScalar(hk); z.r.position.y = -bb.min.y * hk; z.w.position.set(d.x, 0, d.z); z.w.scale.setScalar(d.s || 1); });
    cam.position.set(...o.cam); cam.lookAt(...o.look); setLights([new THREE.AmbientLight(0xffffff, 1)]);
  }
  renderer.render(scene, cam);
  return { url: renderer.domElement.toDataURL('image/png'), lens };
};
window.READY = true;

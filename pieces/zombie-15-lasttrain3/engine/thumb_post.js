// Solo para miniaturas (thumb.mjs): despues del update del plano, re-posa a Ava con un clip propio, apunta los brazos,
// le pone la pistola negra en la mano y agrega luces. No lo usa la pelicula.
import * as L from './lib.js';
const { THREE } = L;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
let CLIPS, GUN, mixer, root, acts = {}, lights = [], hidden = [], bg0 = null;

export async function init() {
  CLIPS = (await L.loadModel('models/heroine_anim.glb')).animations;
  const g = await L.loadModel('models/pistol-retro.glb');
  const raw = L.ps1Clone(g.scene, { lit: true });
  raw.traverse((o) => { if (o.isMesh) o.material = L.lam(null, 0x4a4d56, { side: THREE.DoubleSide }); });
  const b = new THREE.Box3().setFromObject(raw), s = b.getSize(V()), k = (window.GUN_SIZE || 0.27) / Math.max(s.x, s.y, s.z);
  raw.scale.multiplyScalar(k);
  const b2 = new THREE.Box3().setFromObject(raw), c = b2.getCenter(V()), sz = b2.getSize(V());
  raw.position.sub(c);
  GUN = new THREE.Group(); const inner = new THREE.Group(); inner.add(raw); GUN.add(inner);
  GUN.userData = { inner, sz };
}

function findAva(scene) {
  let hand = null; scene.traverse((o) => { if (!hand && (o.name === 'HandR' || o.name === 'Hand.R') && o.isBone) hand = o; });
  if (!hand) return null;
  let r = hand; while (r.parent && !(Math.abs(r.scale.x - L.S) < 1e-4)) r = r.parent;
  return r;
}
const bone = (n) => root.getObjectByName(n) || root.getObjectByName(n.replace('.', ''));
function aimBone(b, tip, target) {
  const bp = b.getWorldPosition(V()), cur = tip.getWorldPosition(V()).sub(bp).normalize(), want = target.clone().sub(bp).normalize();
  const qW = new THREE.Quaternion().setFromUnitVectors(cur, want), bw = b.getWorldQuaternion(new THREE.Quaternion()), pw = b.parent.getWorldQuaternion(new THREE.Quaternion());
  b.quaternion.copy(pw.invert().multiply(qW.multiply(bw))); b.updateMatrixWorld(true);
}
function twist(b, axis, deg) { b.rotateOnAxis(axis, deg * Math.PI / 180); b.updateMatrixWorld(true); }

/** p = { clip, ct, pos:[x,z], yaw, face:[eyes,mouth], aimR:[x,y,z], aimL:[x,y,z], elbowR:[x,y,z], gun:'aim'|'up'|'low', head:[x,y,z], rim:[x,y,z,color,int], key:[...], hide:[names] } */
export function apply(shot, t, p) {
  const scene = shot.scene, r = findAva(scene); if (!r) return;
  for (const o of hidden) o.visible = true; hidden = [];
  if (bg0) { scene.background = bg0; bg0 = null; }
  if (r !== root) { root = r; mixer = new THREE.AnimationMixer(root); acts = {}; root.userData.q0 = []; root.traverse((o) => { if (o.isBone) root.userData.q0.push([o, o.quaternion.clone()]); }); }
  mixer = new THREE.AnimationMixer(root); acts = {};   // mezclador nuevo en cada render: siempre reescribe todos los huesos del clip
  for (const [o, q] of root.userData.q0) o.quaternion.copy(q);
  if (root.userData.y0 !== undefined) root.position.y = root.userData.y0;   // deshace los giros manuales del render anterior (huesos sin pista en el clip)
  const wrap = root.parent;
  if (p.pos) wrap.position.set(p.pos[0], p.posY || 0, p.pos[1]);
  if (p.yaw !== undefined) wrap.rotation.y = p.yaw;
  wrap.visible = true; wrap.updateMatrixWorld(true);
  if (p.clip) {
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    const a = acts[p.clip] || (acts[p.clip] = mixer.clipAction(THREE.AnimationClip.findByName(CLIPS, p.clip)));
    a.play(); a.setEffectiveWeight(1); a.time = (p.ct || 0) + 0.013; mixer.update(0); a.time = p.ct || 0; mixer.update(0); root.updateMatrixWorld(true);   // doble update: el mixer no reescribe un hueso si su valor no cambio (los giros manuales del render anterior quedarian)
  }
  if (p.face) L.setFace(root, { eyes: p.face[0], mouth: p.face[1] });
  if (p.local) {   // aim/elbow/pies/gunDir/gunUp en el espacio del cuerpo (+z al frente, +x a su izquierda), en metros
    p = { ...p, local: false };
    for (const k of ['aimR', 'aimL', 'elbowR', 'elbowL', 'footR', 'footL']) if (Array.isArray(p[k])) p[k] = wrap.localToWorld(V(...p[k])).toArray();
    const q = wrap.getWorldQuaternion(new THREE.Quaternion());
    for (const k of ['gunDir', 'gunUp']) if (p[k]) p[k] = V(...p[k]).applyQuaternion(q).toArray();
  }
  const U = (n) => bone(n);
  const yawB = (b, deg, ax = [0, 1, 0]) => { b.rotateOnWorldAxis(V(...ax), deg * Math.PI / 180); b.updateMatrixWorld(true); };
  if (p.chestYaw) yawB(U('Chest'), p.chestYaw);
  if (p.elbowR) for (let i = 0; i < 6; i++) { aimBone(U('UpperArm.R'), U('Forearm.R'), V(...p.elbowR)); }
  if (p.aimR) for (let i = 0; i < 6; i++) { if (!p.elbowR) aimBone(U('UpperArm.R'), U('Hand.R'), V(...p.aimR)); aimBone(U('Forearm.R'), U('Hand.R'), V(...p.aimR)); }
  if (p.elbowL) for (let i = 0; i < 6; i++) { aimBone(U('UpperArm.L'), U('Forearm.L'), V(...p.elbowL)); }
  if (p.aimL) { const tg = () => p.aimL === 'handR' ? U('Hand.R').localToWorld(V(...(p.supL || [0, 0.3, 0]))) : V(...p.aimL);
    for (let i = 0; i < 6; i++) { if (!p.elbowL) aimBone(U('UpperArm.L'), U('Hand.L'), tg()); aimBone(U('Forearm.L'), U('Hand.L'), tg()); } }
  if (p.legIK) {   // piernas: rodillas flexionadas y pies en el suelo (IK de dos huesos). legIK = {drop, R:[x,z], L:[x,z], knee:[x,y,z] local}
    const { drop = 0.08, knee = [0, 0, 1] } = p.legIK;
    if (root.userData.y0 === undefined) root.userData.y0 = root.position.y;
    root.position.y = root.userData.y0 - drop / (wrap.scale.x || 1); root.updateMatrixWorld(true);
    const kd = V(...knee).applyQuaternion(wrap.getWorldQuaternion(new THREE.Quaternion())).normalize();
    for (const side of ['R', 'L']) {
      const th = U('Thigh.' + side), ca = U('Calf.' + side), ft = U('Foot.' + side);
      const hp = th.getWorldPosition(V()), l1 = hp.distanceTo(ca.getWorldPosition(V())), l2 = ca.getWorldPosition(V()).distanceTo(ft.getWorldPosition(V()));
      const [fx, fz] = p.legIK[side]; const F = wrap.localToWorld(V(fx, 0, fz)); F.y = ft.getWorldPosition(V()).y + drop;
      const d = Math.min(l1 + l2 - 1e-3, hp.distanceTo(F)), dir = F.clone().sub(hp).normalize();
      const a1 = Math.acos(Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
      const side_ = kd.clone().sub(dir.clone().multiplyScalar(kd.dot(dir))).normalize();
      const K = hp.clone().add(dir.clone().multiplyScalar(Math.cos(a1) * l1)).add(side_.multiplyScalar(Math.sin(a1) * l1));
      for (let i = 0; i < 4; i++) { aimBone(th, ca, K); aimBone(ca, ft, F); }
    }
  }
  for (const [k, side] of [['footL', 'L'], ['footR', 'R']]) if (p[k]) for (let i = 0; i < 3; i++) aimBone(U('Thigh.' + side), U('Foot.' + side), V(...p[k]));
  if (p.head) { const h = U('Head'); for (let i = 0; i < 3; i++) { const hp = h.getWorldPosition(V()); const tip = h.localToWorld(V(0, 0, 1)); const d = tip.sub(hp); const tgt = V(...p.head); const want = tgt.sub(hp).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(d.normalize(), want).slerp(new THREE.Quaternion(), 1 - (p.headK ?? 0.6)); const bw = h.getWorldQuaternion(new THREE.Quaternion()), pw = h.parent.getWorldQuaternion(new THREE.Quaternion()); h.quaternion.copy(pw.invert().multiply(q.multiply(bw))); h.updateMatrixWorld(true); } }
  if (p.headYaw) { yawB(U('Neck'), p.headYaw * 0.4); yawB(U('Head'), p.headYaw * 0.6); }
  if (p.headTilt) yawB(U('Head'), p.headTilt, p.headTiltAx || [1, 0, 0]);
  if (p.headTilt2) yawB(U('Head'), p.headTilt2, p.headTiltAx2 || [1, 0, 0]);
  if (p.handTwist) twist(U('Hand.R'), V(...p.handTwist[0]), p.handTwist[1]);
  root.updateMatrixWorld(true);
  // pistola: empunadura en la palma, canon (-z del modelo) segun p.gunDir (mundo) o la linea antebrazo->mano
  if (p.gun) {
    if (GUN.parent !== scene) scene.add(GUN);
    const hand = U('Hand.R'), fore = U('Forearm.R');
    const palm = hand.localToWorld(V(...(p.palm || [0, 0.55, 0.15])));
    const dir = p.gunDir ? V(...p.gunDir).normalize() : hand.getWorldPosition(V()).sub(fore.getWorldPosition(V())).normalize();
    const up = V(...(p.gunUp || [0, 1, 0])); up.sub(dir.clone().multiplyScalar(up.dot(dir))).normalize();
    const zAxis = dir.clone().negate(), xAxis = up.clone().cross(zAxis).normalize();
    GUN.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, up, zAxis));
    const { inner, sz } = GUN.userData;
    inner.position.set(0, (p.gripY ?? 0.3) * sz.y, -(p.gripZ ?? 0.3) * sz.z);   // la empunadura (abajo-atras) cae en el origen
    GUN.position.copy(palm); GUN.visible = true; GUN.updateMatrixWorld(true);
    GUN.traverse((o) => { if (o.isMesh) o.material.color.set(p.gunColor || 0x4a4d56); });
  } else if (GUN) GUN.visible = false;
  for (const l of lights) scene.remove(l); lights = [];
  for (const k of ['rim', 'key', 'fill']) if (p[k]) { const [x, y, z, col, it, dist] = p[k]; const l = new THREE.PointLight(col, it, dist || 6, 1); l.position.set(x, y, z); scene.add(l); lights.push(l); }
  if (p.copLight) scene.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) if (m.color && ([0x2a2e34, 0x3a4048].includes(m.color.getHex()) || m.userData.copLit)) { m.userData.copLit = true; m.color.set(p.copLight); } });
  if (p.isolate) {   // solo Ava + pistola + luces sobre verde puro (para recortar y componer)
    const keep = new Set([root.parent, GUN, ...lights]);
    for (const o of scene.children) if (o.visible && !keep.has(o) && !o.isLight) { o.visible = false; hidden.push(o); }
    bg0 = scene.background; scene.background = new THREE.Color(0x00ff00);
    root.parent.children.forEach((c) => { if (c !== root && c.visible) { c.visible = false; hidden.push(c); } });   // sombra circular
  }
  if (p.noFx) shot.fx = null;   // sin lluvia (canvas fx) en este render
  if (p.copEyes) scene.traverse((o) => { if (o.isGroup && !o.visible && o.parent && o.parent.isBone && /head/i.test(o.parent.name) && o.children.length) { o.visible = true; hidden.push({ set visible(v) { o.visible = !v ? true : false; } }); o.children.forEach((e) => e.material && e.material.color && e.material.color.set(p.copEyes)); } });
  for (const n of p.hide || []) { const o = scene.getObjectByName(n); if (o) o.visible = false; }
}

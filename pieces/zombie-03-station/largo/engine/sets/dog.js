// sets/dog.js — RIBBON, the K-9 German shepherd (shared by kennel.js, hall.js, screens.js).
// Model: Quaternius "German Shepard" (poly.pizza/m/Hssa6NPc6W, CC-BY 3.0, see models/DOG_LICENSE.txt), rigged + animated
// (Idle, Idle_2, Idle_2_HeadLow, Walk, Run, Attack, Eating, Death...). PS1 look: ps1Clone (snap + nearest, no shine).
// API (stable):  const dog = await loadDog(L);  scene.add(dog.root);  dog.update(lt, state, opts)
//   states: 'sleep' (lying, head on paws, slow breathing), 'sleepy_wag' (lying, head up a little, tail wags),
//           'stand' (idle), 'stare' (standing still, head up + ears pricked, looking at opts.look), 'growl' (head low, ears up,
//           lips back: teeth show, body leans forward), 'walk' (walk cycle in place; move dog.root yourself).
//   opts: { wag: 0..1 (tail amount, default per state), look: THREE.Vector3 world target for the head (stare/growl/stand),
//           growl: 0..1 (teeth/lean amount), headUp: rad (lying states: lift the head), breath: 0..1, speed: walk speed multiplier, k: 0..1 blend from the previous
//           pose ('from' state) for smooth get-ups }.
// The dog faces +Z in dog.root space, feet on y=0, ~0.65 m at the shoulder. dog.tag = the collar tag (Object3D) for close-ups;
// dog.head = head bone (world pos via getWorldPosition). Deterministic: everything from lt.
let GLB = null;
const TAG_NAME = 'RIBBON';

// ---- German-shepherd recolour of the Quaternius mesh (it ships as a brown "zombie survival" dog with a backpack, bedroll
// and bandana, all from a flat-colour palette atlas): drop the backpack/bedroll/bandana triangles and repaint every triangle
// from a tiny nearest palette by (original colour, position): tan body, black saddle + muzzle + tail top, cream legs/belly.
// Mesh-local axes of the source: y = length (head at -y), z = up (units ~1/100 m before the armature scale).
const PAL = ['#b8803c', '#1e1a16', '#cfa262', '#2a2420', '#7a4c20', '#0e0c0a', '#f0ece0', '#3a2a1a', '#8a5a2a', '#1c120c', '#fffaf0'];   // 0 tan 1 saddle 2 cream 3 muzzle 4 dark tan 5 nose 6 eye-white 7 ear brown 8 eye socket 9 eye (near-black brown) 10 catch-light
function retexture(L, scene) {
  const { THREE } = L;
  scene.traverse((o) => {
    if (!o.isSkinnedMesh) return;
    const img = o.material.map.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const c2 = cv.getContext('2d', { willReadFrequently: true }); c2.drawImage(img, 0, 0); const D = c2.getImageData(0, 0, cv.width, cv.height).data;
    const g = o.geometry.toNonIndexed(), P = g.attributes.position, U = g.attributes.uv, n = P.count / 3;
    const keep = [], cell = [];
    const SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, bones = o.skeleton.bones;
    const domTail = (i) => { let bj = 0, bw = -1; for (let j = 0; j < 4; j++) { const w = SW.getComponent(i, j); if (w > bw) { bw = w; bj = SI.getComponent(i, j); } } return bones[bj].name.startsWith('Tail'); };
    const tailTri = (t) => domTail(t * 3) && domTail(t * 3 + 1) && domTail(t * 3 + 2);
    const hex = (u, v) => { const x = Math.min(cv.width - 1, Math.floor(u * cv.width)), y = Math.min(cv.height - 1, Math.floor(v * cv.height)), i = (y * cv.width + x) * 4; return (D[i] << 16) | (D[i + 1] << 8) | D[i + 2]; };
    for (let t = 0; t < n; t++) {
      let u = 0, v = 0, x = 0, y = 0, z = 0;
      for (let k = 0; k < 3; k++) { u += U.getX(t * 3 + k) / 3; v += U.getY(t * 3 + k) / 3; x += P.getX(t * 3 + k) / 3; y += P.getY(t * 3 + k) / 3; z += P.getZ(t * 3 + k) / 3; }
      const c = hex(u, v);
      if (tailTri(t)) continue;   // the source tail (thin ridged stick): replaced by the brush tail built in loadDog
      // only the backpack/bedroll/pack straps are dropped: they are separate closed shells. The bandana (0x923c12) and the
      // goggle strap (0x8f662a) ARE the neck/head surface (dropping them left see-through holes), so they get fur colours.
      if (c === 0x4c3a21 || c === 0x9e731d || c === 0x5f4009) continue;
      if (c === 0xa3a59c && y > -0.0024 && y < 0.0020 && z > 0.0062) continue;   // pack buckles/straps above the back
      let k = 0;
      if (c === 0x923c12) k = z > 0.0070 ? 1 : 0;   // bandana -> neck: black on top, tan throat
      else if (c === 0x5f3a20 || c === 0x8f662a) {   // brown fur -> tan body, black saddle, black muzzle, dark ears, dark tail top
        if (y < -0.0044) k = y < -0.0066 ? 3 : z > 0.0084 ? 7 : (z > 0.0079 && y > -0.0064) ? 4 : 0;
        else if (y < -0.0036) k = z > 0.0060 ? 1 : 0;
        else if (y < 0.0044) k = z > SADDLE_Z(y) ? 1 : 0;
        else k = z > 0.00445 ? 1 : 4;
      } else if (c === 0xa3a59c) k = y < -0.0064 ? 3 : y < -0.0044 ? 2 : 2;   // light grey -> cream legs/belly/chest, dark under the muzzle
      else if (c === 0x241f22) {   // goggle lens balls -> cute round eyes: the cap facing out = near-black brown eye, a tiny cap
        // up-front of it = white catch-light, the rest of the ball = brown socket. Normal-based, so it stays round in every pose.
        const sx = x > 0 ? 1 : -1, N = g.attributes.normal; let nx = 0, ny = 0, nz = 0;
        for (let j = 0; j < 3; j++) { nx += N.getX(t * 3 + j); ny += N.getY(t * 3 + j); nz += N.getZ(t * 3 + j); }
        const nl = Math.hypot(nx, ny, nz) || 1, d = (ax, ay, az) => (nx * ax + ny * ay + nz * az) / nl / Math.hypot(ax, ay, az);
        k = d(sx * 0.42, -1, 0.42) > 0.985 ? 10 : d(sx * 0.55, -1, 0.1) > 0.6 ? 9 : 8;
      }
      else if (c === 0x2e2e2e) k = y > -0.0040 ? 1 : 5;   // harness strap -> saddle black; nose black
      keep.push(t); cell.push(k);
    }
    const out = new THREE.BufferGeometry();
    for (const [name, a] of Object.entries(g.attributes)) {
      const arr = new a.array.constructor(keep.length * 3 * a.itemSize);
      keep.forEach((t, i) => { for (let k = 0; k < 3 * a.itemSize; k++) arr[i * 3 * a.itemSize + k] = a.array[t * 3 * a.itemSize + k]; });
      out.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize, a.normalized));
    }
    const uv = out.attributes.uv; cell.forEach((k, i) => { for (let j = 0; j < 3; j++) uv.setXY(i * 3 + j, (k + 0.5) / PAL.length, 0.5); });
    out.computeBoundingBox(); out.computeBoundingSphere();
    o.geometry = out;
    o.material.map = L.cvs(PAL.length, 1, (c) => PAL.forEach((col, i) => { c.fillStyle = col; c.fillRect(i, 0, 1, 1); }));
    o.material.map.flipY = false;
  });
}
const SADDLE_Z = (y) => 0.0046 + 0.0004 * Math.abs(y - 0.0004) / 0.004;   // saddle line: lower in the middle of the back

export async function loadDog(L, { shoulder = 0.65 } = {}) {
  const { THREE } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  if (!GLB) { GLB = await L.loadModel('models/german_shepherd.glb'); retexture(L, GLB.scene); }
  const model = L.ps1Clone(GLB.scene, { lit: true });
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  const inner = new THREE.Group(); inner.add(model);
  const root = new THREE.Group(); root.add(inner);
  const bone = (n) => { n = n.replace(/\./g, ''); let b = null; model.traverse((o) => { if (!b && o.isBone && o.name === n) b = o; }); return b; };   // GLTFLoader drops '.' from node names
  const BN = ['Body', 'Back', 'Torso', 'Torso2', 'Torso3', 'Neck1', 'Neck2', 'Neck3', 'Head', 'Ear1.L', 'Ear2.L', 'Ear1.R', 'Ear2.R',
    'FrontShoulder.L', 'FrontUpperLeg.L', 'FrontLowerLeg.L', 'FrontShoulder.R', 'FrontUpperLeg.R', 'FrontLowerLeg.R',
    'BackShoulder.L', 'BackLeg.L', 'BackUpperLeg.L', 'BackLowerLeg.L', 'BackShoulder.R', 'BackLeg.R', 'BackUpperLeg.R', 'BackLowerLeg.R',
    'Tail1', 'Tail2', 'Tail3', 'Torso.001'];
  const BB = {}; for (const n of BN) BB[n] = bone(n);
  const bind = []; model.traverse((o) => { if (o.isBone) bind.push([o, o.position.clone(), o.quaternion.clone()]); });

  const mixer = new THREE.AnimationMixer(model), acts = {};
  const act = (n) => acts[n] || (acts[n] = (() => { const c = THREE.AnimationClip.findByName(GLB.animations, n); if (!c) throw new Error('dog clip ' + n); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); return a; })());
  function clip(n, time, w = 1, loop = true) {
    const a = act(n), d = a.getClip().duration; a.time = loop ? ((time % d) + d) % d : Math.min(d - 1e-4, Math.max(0, time)); a.setEffectiveWeight(w);
  }

  // ---- orientation + scale from the bind pose: face +Z, feet on 0, shoulder height = `shoulder`
  const fit = () => {
    for (const [o, p, q] of bind) { o.position.copy(p); o.quaternion.copy(q); }
    root.updateMatrixWorld(true);
  };
  fit(); clip('Idle', 0); mixer.update(0); root.updateMatrixWorld(true);
  const hp = BB.Head.getWorldPosition(V()), tp = BB.Tail1.getWorldPosition(V());
  { const d = V(hp.x - tp.x, 0, hp.z - tp.z); inner.rotation.y = -Math.atan2(d.x, d.z); }   // head -> +Z
  root.updateMatrixWorld(true);
  { // shoulder = withers (top of Torso2 bone), feet = lowest front foot
    const fl = new THREE.Box3().setFromObject(model, true);
    const k = (shoulder / 0.68) / Math.max(1e-6, fl.max.y - fl.min.y);   // withers = 0.68 of the ear-tip height (measured on the model)
    inner.scale.setScalar(k); root.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(model, true); inner.position.y -= b2.min.y;
    const c = b2.getCenter(V()); inner.position.x -= c.x; inner.position.z -= c.z;
  }
  root.updateMatrixWorld(true);
  const baseY = inner.position.y;

  // ---- collar (red nylon) + tag (brass bone tag "RIBBON") parented to Neck1, built in world space then attached
  const n1 = BB.Neck1.getWorldPosition(V()), n2 = BB.Neck3.getWorldPosition(V()), hd = BB.Head.getWorldPosition(V());
  const collar = new THREE.Group();
  const neckDir = n2.clone().sub(n1).normalize();
  const cMat = L.lam(L.cvs(16, 4, (c) => { c.fillStyle = '#a4161a'; c.fillRect(0, 0, 16, 4); c.fillStyle = '#d8343a'; c.fillRect(0, 0, 16, 1); c.fillStyle = '#5a0a0c'; c.fillRect(0, 3, 16, 1); }), 0xffffff, { side: THREE.DoubleSide });
  // measure the real neck cross-section where the collar sits (skinned verts in a thin slab across the neck): the collar is an
  // elliptic band hugging that section, centred on it, and rides the bone that carries most of those verts (follows every pose)
  const c0 = n1.clone().lerp(n2, 0.45);
  const down0 = V(0, -1, 0).sub(neckDir.clone().multiplyScalar(V(0, -1, 0).dot(neckDir))).normalize(), side = V().crossVectors(neckDir, down0).normalize();
  const sec = [], bw = new Map(); let skel = null;
  model.traverse((o) => {
    if (!o.isSkinnedMesh) return; skel = o.skeleton;
    const p = o.geometry.attributes.position, si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight, v = V();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); o.applyBoneTransform(i, v); v.applyMatrix4(o.matrixWorld);
      const d = v.clone().sub(c0); if (Math.abs(d.dot(neckDir)) > 0.02 || d.length() > 0.25) continue;
      sec.push([d.dot(side), d.dot(down0)]);
      for (let j = 0; j < 4; j++) { const b = si.getComponent(i, j), w = sw.getComponent(i, j); bw.set(b, (bw.get(b) || 0) + w); }
    }
  });
  let s0 = 1e9, s1 = -1e9, d0 = 1e9, d1 = -1e9; for (const [a, b] of sec) { s0 = Math.min(s0, a); s1 = Math.max(s1, a); d0 = Math.min(d0, b); d1 = Math.max(d1, b); }
  if (!sec.length) { s0 = d0 = -0.075; s1 = d1 = 0.075; }
  const rS = (s1 - s0) / 2 + 0.012, rD = (d1 - d0) / 2 + 0.022;   // margin: the neck fur bulges when the head bends
  c0.add(side.clone().multiplyScalar((s0 + s1) / 2)).add(down0.clone().multiplyScalar((d0 + d1) / 2 - 0.006));   // a bit higher: throat side stays snug
  const neckR = rD;
  const ring = L.mesh(new THREE.CylinderGeometry(1, 1.04, 0.032, 12, 1, true), cMat, 0, 0, 0, collar);
  ring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, neckDir, down0)); ring.scale.set(rS, 1, rD);
  let cBone = BB.Neck1, cw = -1; for (const [b, w] of bw) if (w > cw && skel && skel.bones[b]) { cw = w; cBone = skel.bones[b]; }
  const tagTex = L.cvs(48, 32, (c) => {
    c.fillStyle = '#b8902c'; c.fillRect(0, 0, 48, 32);
    c.fillStyle = '#e8c860'; c.fillRect(0, 0, 48, 2); c.fillRect(0, 0, 2, 32);
    c.fillStyle = '#6a4c10'; c.fillRect(0, 30, 48, 2); c.fillRect(46, 0, 2, 32);
    c.fillStyle = '#3a2808'; c.font = 'bold 12px Tahoma, Verdana, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(TAG_NAME, 24, 13); c.font = 'bold 7px Tahoma, Verdana, sans-serif'; c.fillText('K-9  UNIT 7', 24, 24);
  });
  // tag hangs from the bottom-front of the collar (throat side)
  const tag = new THREE.Group(); collar.add(tag);
  const tagMesh = L.mesh(new THREE.BoxGeometry(0.06, 0.04, 0.004), [L.lam(null, 0x8a6a1c), L.lam(null, 0x8a6a1c), L.lam(null, 0x8a6a1c), L.lam(null, 0x8a6a1c), L.lam(tagTex), L.lam(null, 0x9a7a28)], 0, -0.028, 0, tag);
  L.mesh(new THREE.TorusGeometry(0.007, 0.002, 4, 8), L.lam(null, 0xc0c0b8), 0, -0.004, 0, tag);
  void tagMesh;
  collar.position.copy(c0);
  // throat = down + forward (perpendicular to neckDir, toward -Y world)
  const down = down0;
  tag.position.copy(down.clone().multiplyScalar(neckR * 1.02));
  tag.lookAt(collar.position.clone().add(tag.position).add(V(0, 0, 1)));   // tag face toward +Z (front of the dog)
  root.add(collar); collar.updateMatrixWorld(true);
  cBone.attach(collar);

  // ---- teeth / lips for the growl: white strip + dark gum under the muzzle, attached to the Head bone
  let muz = hd.clone();
  model.traverse((o) => { if (!o.isSkinnedMesh) return; const p = o.geometry.attributes.position, v = V(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); o.applyBoneTransform(i, v); v.applyMatrix4(o.matrixWorld); if (v.z > muz.z) muz = v.clone(); } });
  const teeth = new THREE.Group();
  L.box(0.05, 0.012, 0.006, L.basic(null, 0xf0ece0), 0, 0, 0, teeth);
  L.box(0.054, 0.008, 0.007, L.basic(null, 0x5a1418), 0, 0.009, -0.001, teeth);
  for (const x of [-0.022, 0.022]) L.box(0.006, 0.016, 0.006, L.basic(null, 0xfffff0), x, -0.006, 0.001, teeth);   // fangs
  teeth.position.copy(muz).add(V(0, -0.035, -0.035)); root.add(teeth); teeth.updateMatrixWorld(true); BB.Head.attach(teeth);
  teeth.visible = false;
  // ---- pose helpers (local rotations on top of the clip; all bind-relative, reset every update)
  const E = new THREE.Euler(), Q = new THREE.Quaternion();
  const rot = (n, x, y, z) => { const b = BB[n]; if (!b) return; E.set(x, y, z); Q.setFromEuler(E); b.quaternion.multiply(Q); };
  const QA = new THREE.Quaternion(), QP = new THREE.Quaternion(), QR = new THREE.Quaternion(), AX = new THREE.Vector3();
  // rotate a bone about an axis given in dog.root space (x = dog's left-right, y = up, z = forward), in parent-relative terms
  const rotW = (n, ax, ay, az, ang) => {
    const b = BB[n] || bone(n); if (!b || !ang) return;
    b.parent.updateWorldMatrix(true, false); b.parent.getWorldQuaternion(QP); root.getWorldQuaternion(QR);
    AX.set(ax, ay, az).normalize().applyQuaternion(QR); QA.setFromAxisAngle(AX, ang);
    const inv = QP.clone().invert(); b.quaternion.premultiply(inv.multiply(QA).multiply(QP));
  };
  const WP = new THREE.Vector3();
  // move a bone by (dx, dy, dz) metres in dog.root space
  const movW = (n, dx, dy, dz) => {
    const b = BB[n] || bone(n); if (!b) return;
    root.updateMatrixWorld(true); b.getWorldPosition(WP);
    const d = new THREE.Vector3(dx, dy, dz).applyQuaternion(root.getWorldQuaternion(QR)).multiplyScalar(root.getWorldScale(AX).x);
    WP.add(d); b.parent.worldToLocal(WP); b.position.copy(WP);
  };
  const wagAngle = (lt, amp, hz) => amp * Math.sin(lt * Math.PI * 2 * hz);
  let dbg = null;
  const tailB = [], TAIL_PHI = [];   // tail bone chain (built after the vest) + rest angle of each segment below "straight back"
  const TQ = new THREE.Quaternion();
  const tailRot = (i, ax, ay, az, a) => { if (!a || !tailB[i]) return; TQ.setFromAxisAngle(AX.set(ax, ay, az).normalize(), a); tailB[i].quaternion.multiply(TQ); };
  // lift: raise the whole tail (rad about the hip's x); flat: straighten each later joint; curl: swing to the side (lying);
  // wag a(t): side-to-side about the axis across each segment (a sweep, not a twist), the later joints lag behind the base
  function poseTail(q, lift, flat, curl, wag, hz) {
    if (!tailB.length) return;
    for (const b of tailB) b.quaternion.identity();
    for (let i = 0; i < tailB.length - 1; i++) {
      const ph = TAIL_PHI[i], a = wag ? wagAngle(q - 0.045 * i, 0.6 * wag, hz) * (i ? 0.3 : 1) : 0;
      if (i === 0) { tailRot(0, 0, 1, 0, curl); tailRot(0, 1, 0, 0, lift); }
      else { tailRot(i, 1, 0, 0, flat); if (curl) tailRot(i, 0, 1, 0, curl * 0.25); }
      tailRot(i, 0, Math.cos(ph), -Math.sin(ph), a);
    }
  }

  // lying pose (front legs stretched forward, hind legs tucked): the paws are skinned to the IK bones, so the body bone is
  // lowered and the IK feet slid forward; then the hind thighs fold forward.
  const LIE = () => {
    movW('Body', 0, -0.38, 0);
    for (const sd of ['L', 'R']) { movW('IKFrontLeg.' + sd, 0, 0, 0.45); rotW('BackLeg.' + sd, 1, 0, 0, -1.2); }
  };
  const headTo = (look, w = 1) => {   // turn neck/head toward a world point (yaw + pitch, limited)
    if (!look || !w) return;
    root.updateMatrixWorld(true);
    const h = BB.Head.getWorldPosition(V()), lp = root.worldToLocal(look.clone()), hp = root.worldToLocal(h);
    const d = lp.sub(hp); const yaw = Math.max(-1.0, Math.min(1.0, Math.atan2(d.x, d.z))), pitch = Math.max(-0.5, Math.min(0.5, Math.atan2(d.y, Math.hypot(d.x, d.z))));
    rotW('Neck1', 0, 1, 0, yaw * 0.5 * w); rotW('Neck3', 0, 1, 0, yaw * 0.25 * w); rotW('Head', 0, 1, 0, yaw * 0.25 * w);
    rotW('Head', 1, 0, 0, -pitch * 0.7 * w);
  };
  // the AnimationMixer only writes a bone when its value changed since ITS last write, so procedural edits are undone by
  // restoring the last mixer output (not the bind pose) before every evaluation
  const base = bind.map(([o]) => [o, o.position.clone(), o.quaternion.clone()]);
  function applyState(q, s, opts) {
    for (const [o, p, qq] of base) { o.position.copy(p); o.quaternion.copy(qq); }
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    if (opts.clip) clip(opts.clip[0], opts.clip[1], 1, false);
    else if (s === 'walk') clip('Walk', q * (opts.speed ?? 1));
    else if (s === 'growl') clip('Attack', 0.16, 1, false);          // crouched, weight forward, head low (wind-up of the lunge)
    else if (s === 'stare' || s === 'sleep' || s === 'sleepy_wag') clip('Idle', 0.0, 1, false);
    else clip('Idle', q * 0.9);
    mixer.update(0);
    for (const b of base) { b[1].copy(b[0].position); b[2].copy(b[0].quaternion); }
    if (opts.bones) for (const [n, x, y, z] of opts.bones) rot(n, x, y, z);
    if (opts.mv) for (const [n, x, y, z] of opts.mv) movW(n, x, y, z);
    if (opts.wb) for (const [n, x, y, z, a] of opts.wb) { root.updateMatrixWorld(true); rotW(n, x, y, z, a); }
    const br = Math.sin(q * Math.PI * 2 * (s === 'sleep' ? 0.33 : s === 'growl' ? 1.1 : 0.5));   // breathing
    if (s === 'sleep' || s === 'sleepy_wag') {
      LIE();
      movW('Torso2', 0, 0.006 * br * (opts.breath ?? 1), 0);
      if (s === 'sleep') { rotW('Neck1', 1, 0, 0, 0.95); rotW('Head', 1, 0, 0, 0.35); }   // chin on the paws
      else { rotW('Neck1', 1, 0, 0, 0.35 - (opts.headUp ?? 0) - 0.05 * Math.sin(q * 1.3)); rotW('Head', 1, 0, 0, 0.15); headTo(opts.look, 0.6); }
    } else if (s === 'growl') {
      movW('Torso2', 0, 0.004 * br, 0);
      headTo(opts.look, 1);
      rotW('Head', 1, 0, 0, 0.12);                                      // head low, eyes up
    } else if (s === 'stare') { movW('Torso2', 0, 0.003 * br, 0); headTo(opts.look, 1); rotW('Head', 1, 0, 0, -0.12); }
    else if (s === 'stand') headTo(opts.look, 1);
    // tail: wag side to side (lying: sweeps the floor = tail_thump on each end)
    const wag = opts.wag ?? (s === 'sleepy_wag' ? 0.9 : s === 'stand' ? 0.4 : s === 'walk' ? 0.3 : 0);
    const lying = s === 'sleep' || s === 'sleepy_wag';
    const lift = lying ? 0.72 : s === 'growl' ? 0.7 : s === 'stare' ? 0.3 : s === 'walk' ? 0.22 + 0.04 * Math.sin(q * Math.PI * 2 * (opts.speed ?? 1) * 2) : 0.08;
    const flat = lying ? 0.13 : s === 'growl' ? 0.16 : 0;               // lying: along the floor; growl: stiff, straight back
    poseTail(q, lift, flat, lying ? 0.45 : 0, wag, opts.wagHz ?? (s === 'sleepy_wag' ? 1.4 : 2.2));
  }
  const SNAP = new Map();
  function update(lt, state = 'stand', opts = {}) {
    const q = Math.floor(lt * 30 + 1e-6) / 30;   // 30 fps
    const k = opts.from ? L.clamp01(opts.k ?? 1) : 1;
    if (k < 1) { applyState(q, opts.from, { ...opts, clip: null }); for (const [o] of bind) SNAP.set(o, [o.position.clone(), o.quaternion.clone()]); }
    applyState(q, state, opts);
    if (k < 1) { const e = L.smooth(k); for (const [o] of bind) { const [p0, q0] = SNAP.get(o); o.position.lerpVectors(p0, o.position, e); o.quaternion.slerpQuaternions(q0, o.quaternion.clone(), e); } }
    teeth.visible = state === 'growl' && (opts.growl ?? 1) > 0.15 && k > 0.5;
    root.updateMatrixWorld(true);
    dbg = state;
  }
  /** tail sweep extremes for sfx (s from the start of the wag): times where the wag changes direction */
  function wagBeats(t0, t1, hz = 1.4) { const out = []; for (let n = 0; ; n++) { const t = (n + 0.5) / (2 * hz); if (t > t1 - t0) break; out.push(+(t0 + t).toFixed(3)); } return out; }
  // ---- K-9 vest: a low-poly harness skinned to the dog's own skeleton, so it follows the back in every pose. Built in the
  // stand pose from measured cross-sections of the torso (only verts whose main bone is a spine bone: no legs/neck/head),
  // from just behind the shoulders (z 0.20) to the loin (z -0.13): back panel over the top + down the flanks, two girth straps
  // (behind the front legs + belly), a K-9 patch on each side and a grab handle on top. dog.vest = Group on Torso2 (handle;
  // its local (0, 0.68, 0.08) is the top of the vest, used as the label anchor), dog.vestMesh = the skinned panel + straps.
  const vest = new THREE.Group();
  let vestMesh = null;
  {
    update(0, 'stand'); root.updateMatrixWorld(true);
    const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    const tPatch = L.cvs(32, 16, (c) => { c.fillStyle = '#16181c'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#e8e8e0'; c.fillRect(2, 2, 28, 12); c.fillStyle = '#16181c'; c.font = 'bold 9px Tahoma, Verdana, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K-9', 16, 8.5); });
    const tNylon = L.cvs(16, 16, (c) => {   // u = around the body, v = along it; grey binding on every edge
      const rr = L.rng(931); for (let i = 0; i < 256; i++) { const n = (rr() * 10) | 0; px(c, i % 16, i >> 4, `rgb(${30 + n},${32 + n},${40 + n})`); }
      px(c, 0, 0, '#5a5e66', 16, 1); px(c, 0, 15, '#5a5e66', 16, 1); px(c, 0, 0, '#5a5e66', 1, 16); px(c, 15, 0, '#5a5e66', 1, 16);
    });
    const tStrap = L.cvs(4, 4, (c) => { c.fillStyle = '#26282e'; c.fillRect(0, 0, 4, 4); c.fillStyle = '#40444c'; c.fillRect(0, 0, 4, 1); c.fillRect(0, 3, 4, 1); });
    const side2 = { side: THREE.DoubleSide };
    const mN = L.lam(tNylon, 0xffffff, side2), mP = L.lam(tPatch, 0xffffff, side2), mS = L.lam(tStrap, 0xffffff, side2);
    let sm = null; model.traverse((o) => { if (o.isSkinnedMesh && (!sm || o.geometry.attributes.position.count > sm.geometry.attributes.position.count)) sm = o; });
    const sk = sm.skeleton; sk.update();
    const spine = new Set(['Body', 'Back', 'Torso', 'Torso2', 'Torso3', 'Torso.001'].map((n) => BB[n]).filter(Boolean).map((b) => sk.bones.indexOf(b)));
    const GP = sm.geometry.attributes.position, SI = sm.geometry.attributes.skinIndex, SW = sm.geometry.attributes.skinWeight;
    const pts = [], v = V();
    for (let i = 0; i < GP.count; i++) {
      let bj = -1, bw0 = -1; for (let j = 0; j < 4; j++) { const w = SW.getComponent(i, j); if (w > bw0) { bw0 = w; bj = SI.getComponent(i, j); } }
      if (!spine.has(bj)) continue;
      v.fromBufferAttribute(GP, i); sm.applyBoneTransform(i, v); v.applyMatrix4(sm.matrixWorld); root.worldToLocal(v);
      pts.push([v.x, v.y, v.z, i]);
    }
    // cross-section of the torso at z: centre + radius per 10-degree bin (theta 0 = up, + toward +x)
    const NB = 36, prof = (z, hw = 0.03) => {
      const s = pts.filter((p) => Math.abs(p[2] - z) < hw); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of s) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = new Array(NB).fill(0);
      for (const p of s) { const dx = p[0] - cx, dy = p[1] - cy, b = ((Math.round(Math.atan2(dx, dy) / (2 * Math.PI) * NB) % NB) + NB) % NB; r[b] = Math.max(r[b], Math.hypot(dx, dy)); }
      for (let k = 0; k < 3; k++) for (let b = 0; b < NB; b++) if (!r[b]) r[b] = Math.max(r[(b + 1) % NB], r[(b + NB - 1) % NB]);
      const rs = r.map((x, b) => Math.max(x, (r[(b + 1) % NB] + r[(b + NB - 1) % NB]) / 2));
      const R = (th) => { const f = ((th / (2 * Math.PI) * NB) % NB + NB) % NB, b = Math.floor(f), e = f - b; return rs[b] * (1 - e) + rs[(b + 1) % NB] * e; };
      return { cx, cy, R, at: (th, off) => V(cx + Math.sin(th) * (R(th) + off), cy + Math.cos(th) * (R(th) + off), z) };
    };
    // skin weights: inverse-distance blend of the 8 nearest spine verts; bind-space position = inverse of that skin transform
    const bones = sk.bones, M = new THREE.Matrix4(), Mb = new THREE.Matrix4(), T = new THREE.Matrix4(), inv = new THREE.Matrix4().copy(sm.matrixWorld).invert();
    const pos = [], uvs = [], sIdx = [], sWt = [];
    const vert = (p, u, vv) => {
      const near = pts.map((q) => [(q[0] - p.x) ** 2 + (q[1] - p.y) ** 2 + (q[2] - p.z) ** 2, q[3]]).sort((a, b) => a[0] - b[0]).slice(0, 8);
      const acc = new Map(); for (const [d, i] of near) { const k = 1 / (Math.sqrt(d) + 0.01); for (let j = 0; j < 4; j++) { const b = SI.getComponent(i, j), w = SW.getComponent(i, j) * k; if (w) acc.set(b, (acc.get(b) || 0) + w); } }
      const top = [...acc].sort((a, b) => b[1] - a[1]).slice(0, 4), tw = top.reduce((s, x) => s + x[1], 0);
      while (top.length < 4) top.push([0, 0]);
      for (let j = 0; j < 4; j++) top[j][1] /= tw;
      M.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      for (const [b, w] of top) if (w) { Mb.multiplyMatrices(bones[b].matrixWorld, sk.boneInverses[b]); for (let k = 0; k < 16; k++) M.elements[k] += Mb.elements[k] * w; }
      T.multiplyMatrices(sm.bindMatrixInverse, M).multiply(sm.bindMatrix).invert();
      const q = p.clone().applyMatrix4(root.matrixWorld).applyMatrix4(inv).applyMatrix4(T);
      pos.push(q.x, q.y, q.z); uvs.push(u, vv); for (const [b, w] of top) { sIdx.push(b); sWt.push(w); }
      return pos.length / 3 - 1;
    };
    const idx = [], groups = [];
    const grid = (P, mat) => {   // P[i][j] = [Vector3, u, v]; i along the body, j around it
      const s0 = idx.length, I = P.map((row) => row.map(([p, u, vv]) => vert(p, u, vv)));
      for (let i = 0; i + 1 < I.length; i++) for (let j = 0; j + 1 < I[i].length; j++) idx.push(I[i][j], I[i + 1][j], I[i][j + 1], I[i][j + 1], I[i + 1][j], I[i + 1][j + 1]);
      groups.push([s0, idx.length - s0, mat]);
    };
    const Z0 = -0.13, Z1 = 0.20, NZ = 6, TH = 1.62, NT = 14, P0 = [];
    const profs = []; for (let i = 0; i <= NZ; i++) profs.push(prof(Z0 + (Z1 - Z0) * i / NZ));
    for (let i = 0; i <= NZ; i++) { const row = []; for (let j = 0; j <= NT; j++) { const th = -TH + 2 * TH * j / NT; row.push([profs[i].at(th, 0.016), j / NT, i / NZ]); } P0.push(row); }
    grid(P0, 0);                                                                                        // back panel
    for (const zs of [0.19, -0.07]) {                                                                   // girth straps (full loops)
      const a = prof(zs - 0.014, 0.025), b = prof(zs + 0.014, 0.025), rows = [[], []];
      for (let j = 0; j <= 24; j++) { const th = -Math.PI + 2 * Math.PI * j / 24; rows[0].push([a.at(th, 0.01), j / 24, 0]); rows[1].push([b.at(th, 0.01), j / 24, 1]); }
      grid(rows, 2);
    }
    for (const sx of [-1, 1]) {                                                                         // K-9 patch on each flank
      const zc = 0.035, rows = [];
      for (const [k, zz] of [[0, zc - 0.075], [0.5, zc], [1, zc + 0.075]]) {
        const pr = prof(zz), row = []; for (let j = 0; j <= 2; j++) { const th = sx * (0.98 + 0.25 * (1 - j)); row.push([pr.at(th, 0.026), sx > 0 ? 1 - k : k, j / 2]); }
        rows.push(row);
      }
      grid(rows, 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(sIdx, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sWt, 4));
    geo.setIndex(idx); for (const [s, c, m] of groups) geo.addGroup(s, c, m); geo.computeVertexNormals();
    vestMesh = new THREE.SkinnedMesh(geo, [mN, mP, mS]); vestMesh.frustumCulled = false;
    vestMesh.position.copy(sm.position); vestMesh.quaternion.copy(sm.quaternion); vestMesh.scale.copy(sm.scale);
    sm.parent.add(vestMesh); vestMesh.bind(sk, sm.bindMatrix);
    // anchor group on Torso2: its local (0, 0.68, 0.08) = just above the top of the vest; grab handle (low arch) on top
    const pm = prof(0.06), top = pm.at(0, 0.016);
    vest.position.set(top.x, top.y + 0.02 - 0.68, 0);
    const h = L.mesh(new THREE.TorusGeometry(0.028, 0.007, 3, 6, Math.PI), mS, 0, 0.68 - 0.02 - 0.004, 0.06, vest); h.rotation.y = Math.PI / 2; h.scale.set(1, 0.55, 1);
    root.add(vest); vest.updateMatrixWorld(true);
    BB.Torso2.attach(vest);
  }
  update(0, 'stand');
  // ---- tail: the source tail (a thin ridged stick) is dropped in retexture(); this one is a smooth tapered German-shepherd
  // brush on its own 7-bone chain, parented to the hip: thick bushy base (fuller underside), hangs back + down in a sabre curve
  // with the tip hooking up a little, black top + tip, tan underside. Posed per state in applyState (lift, curl, wag + lag).
  {
    root.updateMatrixWorld(true);
    const hip = BB.Tail1.parent, P0 = root.worldToLocal(BB.Tail1.getWorldPosition(V())).add(V(0, 0.01, 0.02));
    const ANG = [0.55, 0.85, 1.15, 1.3, 1.25, 1.0], SEG = 0.07, NB = ANG.length;   // segment angles below "straight back"
    const J = [V(0, 0, 0)]; for (const a of ANG) J.push(J[J.length - 1].clone().add(V(0, -Math.sin(a) * SEG, -Math.cos(a) * SEG)));
    const tg = new THREE.Group(); tg.position.copy(P0); root.add(tg); tg.updateMatrixWorld(true); hip.attach(tg);
    for (let i = 0; i <= NB; i++) { const b = new THREE.Bone(); if (i) { b.position.copy(J[i]).sub(J[i - 1]); tailB[i - 1].add(b); } else { b.position.copy(J[0]); tg.add(b); } tailB.push(b); }
    TAIL_PHI.push(...ANG, ANG[NB - 1]);
    const curve = new THREE.CatmullRomCurve3(J, false, 'centripetal');
    const NR = 22, NS = 8, pos = [], uvs = [], sI = [], sW = [], idx = [];
    const rad = (s) => s < 0.32 ? 0.046 + 0.018 * Math.sin(s / 0.32 * Math.PI / 2) : 0.064 * Math.pow(1 - (s - 0.32) / 0.68, 0.7) + 0.004;   // bushy base -> tip
    for (let i = 0; i <= NR; i++) {
      const s = i / NR, p = curve.getPointAt(s), T = curve.getTangentAt(s), N = V(1, 0, 0), D = V().crossVectors(N, T).normalize();   // D = dorsal (up/back)
      const f = Math.min(NB - 1e-4, s * NB), b = Math.floor(f), e = f - b;
      const w = e < 0.5 ? [[Math.max(0, b - 1), 0.5 - e], [b, 0.5 + e]] : [[b, 1.5 - e], [Math.min(NB, b + 1), e - 0.5]];
      for (let j = 0; j <= NS; j++) {
        const th = 2 * Math.PI * j / NS, under = Math.max(0, -Math.cos(th));   // fuller fur on the underside
        const r = rad(s) * (1 + 0.28 * under * Math.min(1, s * 3) * (1 - s * 0.6)), q = p.clone().addScaledVector(D, Math.cos(th) * r).addScaledVector(N, Math.sin(th) * r * 0.92);
        pos.push(q.x, q.y, q.z); uvs.push(j / NS, s);
        sI.push(w[0][0], w[1][0], 0, 0); sW.push(w[0][1], w[1][1], 0, 0);
      }
    }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const a = i * (NS + 1) + j, c = a + NS + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(sI, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sW, 4));
    geo.setIndex(idx); geo.computeVertexNormals();
    // fur: u around (0 = top), v base -> tip. Black top (the saddle runs on), tan flanks, cream-tan underside, black last quarter
    const tFur = L.cvs(8, 16, (c) => {
      const rr = L.rng(941), col = [[30, 26, 22], [74, 52, 30], [176, 122, 58], [200, 150, 84], [200, 150, 84], [176, 122, 58], [74, 52, 30], [30, 26, 22]];
      for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
        const tip = y >= 12 ? (y >= 14 ? 1 : 0.7) : 0, k = col[x], n = rr() * 14 - 7, m = (v, d) => v + (d - v) * tip;
        c.fillStyle = `rgb(${m(k[0], 26) + n | 0},${m(k[1], 22) + n | 0},${m(k[2], 18) + n | 0})`; c.fillRect(x, y, 1, 1);
      }
    });
    const tm = new THREE.SkinnedMesh(geo, L.lam(tFur)); tm.frustumCulled = false; tg.add(tm);
    tg.updateMatrixWorld(true); tm.bind(new THREE.Skeleton(tailB));
    for (const b of tailB) bind.push([b, b.position.clone(), b.quaternion.clone()]);   // so 'from'/k blends include the tail
  }
  update(0, 'stand');
  return { root, update, tag, head: BB.Head, bones: BB, collar, vest, vestMesh, teeth, wagBeats, get state() { return dbg; } };
}

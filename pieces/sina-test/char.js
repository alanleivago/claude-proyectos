// Placeholder low poly girl (until the real VRM arrives): boxes on a joint tree, posed by Euler angles.
// Faces +Z, her left is +X. Joint angles: -X swings a limb forward, +X bends a knee / leans the chest forward.
import * as THREE from 'three';

const C = { navy: 0x24326e, skin: 0xf2c9a8, khaki: 0xc7b08a, tan: 0xc9a46a, orange: 0xff7a1a, hair: 0x7a4126, pad: 0x2a3048 };

function mat(color, map) {
  return new THREE.MeshLambertMaterial({ color: map ? 0xffffff : color, map: map || null });
}
function boxMesh(w, h, d, m, y = -h / 2) {
  const g = new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(g, m); o.position.y = y; return o;
}
function joint(parent, name, x, y, z, J) {
  const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); J[name] = g; return g;
}

export function makeGirl(T) {
  const J = {};
  const root = new THREE.Group();
  const navy = mat(C.navy), skin = mat(C.skin), khaki = mat(C.khaki, T.pants), tan = mat(C.tan), pad = mat(C.pad);
  const vestFront = mat(0xd8ff3a, T.vest), vestSide = mat(0xc8f026);

  const hips = joint(root, 'hips', 0, 0.92, 0, J);
  hips.add(boxMesh(0.32, 0.17, 0.2, khaki, 0));
  const spine = joint(hips, 'spine', 0, 0.08, 0, J);
  const torso = boxMesh(0.3, 0.44, 0.18, navy, 0.22); spine.add(torso);
  // vest: textured front, flat colour elsewhere (BoxGeometry face order: +x -x +y -y +z -z)
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.315, 0.36, 0.19), [vestSide, vestSide, vestSide, vestSide, vestFront, vestSide]);
  vest.position.y = 0.23; spine.add(vest);
  const neck = joint(spine, 'neck', 0, 0.44, 0, J);
  neck.add(boxMesh(0.08, 0.07, 0.08, skin, 0.035));
  const head = joint(neck, 'head', 0, 0.07, 0, J);
  const headScale = new THREE.Group(); headScale.scale.setScalar(1.3); head.add(headScale);   // anime proportions
  const faceMat = mat(C.skin, T.face);
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.23, 0.2), [skin, skin, skin, skin, faceMat, skin]);
  headMesh.position.y = 0.115; headScale.add(headMesh);
  const hairM = mat(C.hair, T.hair);
  const hairBack = boxMesh(0.24, 0.3, 0.1, hairM, 0.1); hairBack.position.z = -0.08; headScale.add(hairBack);
  for (const sx of [-1, 1]) { const s = boxMesh(0.04, 0.24, 0.16, hairM, 0.09); s.position.set(sx * 0.115, 0.09, 0.0); headScale.add(s); }
  const bangs = boxMesh(0.22, 0.07, 0.04, hairM, 0.205); bangs.position.z = 0.1; headScale.add(bangs);
  // hard hat: low poly dome + brim
  const hatM = mat(C.orange);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), hatM);
  dome.position.y = 0.2; dome.scale.set(1, 0.9, 1.08); headScale.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 10), hatM);
  brim.position.set(0, 0.2, 0.025); brim.scale.set(1, 1, 1.12); headScale.add(brim);

  for (const [side, sx] of [['L', 1], ['R', -1]]) {
    const sh = joint(spine, 'shoulder' + side, sx * 0.19, 0.4, 0, J);
    sh.add(boxMesh(0.085, 0.28, 0.085, navy));
    const el = joint(sh, 'elbow' + side, 0, -0.28, 0, J);
    el.add(boxMesh(0.075, 0.25, 0.075, navy));
    const wr = joint(el, 'wrist' + side, 0, -0.25, 0, J);
    wr.add(boxMesh(0.085, 0.1, 0.06, tan));
    const cuff = boxMesh(0.09, 0.03, 0.065, hatM, -0.005); wr.add(cuff);

    const hp = joint(hips, 'hip' + side, sx * 0.09, -0.06, 0, J);
    hp.add(boxMesh(0.135, 0.42, 0.14, khaki));
    const kn = joint(hp, 'knee' + side, 0, -0.42, 0, J);
    kn.add(boxMesh(0.115, 0.4, 0.12, khaki));
    const kp = boxMesh(0.1, 0.11, 0.03, pad, -0.03); kp.position.z = 0.065; kn.add(kp);
    const an = joint(kn, 'ankle' + side, 0, -0.4, 0, J);
    const boot = boxMesh(0.12, 0.1, 0.22, tan, -0.05); boot.position.z = 0.04; an.add(boot);
  }

  function set(pose) {
    for (const k in J) J[k].rotation.set(0, 0, 0);
    for (const [k, v] of Object.entries(pose)) {
      if (k === 'y') { hips.position.y = v; continue; }
      if (J[k]) J[k].rotation.set(v[0] || 0, v[1] || 0, v[2] || 0);
    }
  }
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, J, set };
}

export function blend(a, b, k) {
  const out = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[key] ?? (key === 'y' ? 0.92 : [0, 0, 0]), vb = b[key] ?? (key === 'y' ? 0.92 : [0, 0, 0]);
    out[key] = key === 'y' ? va + (vb - va) * k : [0, 1, 2].map((i) => (va[i] || 0) + ((vb[i] || 0) - (va[i] || 0)) * k);
  }
  return out;
}

export const POSES = {
  stand: { shoulderL: [0, 0, 0.12], shoulderR: [0, 0, -0.12], elbowL: [-0.15], elbowR: [-0.15] },
  // sitting on the floor, knees up and apart, leaning in over something in her hands
  sit: {
    y: 0.14, spine: [0.22], head: [0.2],
    hipL: [-2.0, 0, 0.35], hipR: [-2.0, 0, -0.35], kneeL: [2.3], kneeR: [2.3], ankleL: [-0.35], ankleR: [-0.35],
    shoulderL: [-0.75, 0, 0.3], shoulderR: [-0.75, 0, -0.3], elbowL: [-1.0, 0, -0.2], elbowR: [-1.0, 0, 0.2],
  },
  // same, hands lifted, startled
  sitScared: {
    y: 0.14, spine: [0.05], head: [-0.05],
    hipL: [-2.0, 0, 0.4], hipR: [-2.0, 0, -0.4], kneeL: [2.3], kneeR: [2.3], ankleL: [-0.35], ankleR: [-0.35],
    shoulderL: [-0.85, 0, 0.3], shoulderR: [-0.85, 0, -0.3], elbowL: [-1.15, 0, -0.35], elbowR: [-1.15, 0, 0.35],
  },
  // right arm up holding the saw, left hand on hip
  saw: {
    head: [-0.25, 0.35, 0],
    shoulderR: [-2.75, 0, -0.25], elbowR: [-0.35], wristR: [0.2],
    shoulderL: [0.1, 0, 0.55], elbowL: [-1.4, 0.9, 0],
  },
};

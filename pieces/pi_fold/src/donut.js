
// =====================================================================
//  DONUT — the glazed donut and your right hand holding it at the bottom right of the frame
// =====================================================================
// a donut: glazed torus with sprinkles, in three arcs that can split apart
function makeDonut() { const g = new THREE.Group(), dough = STDm({ color: '#d8a060', roughness: 0.7 }), glaze = STDm({ color: '#f4a8c0', roughness: 0.25 }), R = RNG('dn'); g.parts = [];
  for (let k = 0; k < 3; k++) { const p = new THREE.Group(); g.add(p); const a0 = k * TAU / 3 + 0.03, al = TAU / 3 - 0.06; p.add(mesh(new THREE.TorusGeometry(0.045, 0.022, 14, 24, al).rotateZ(a0), dough)); const top = mesh(new THREE.TorusGeometry(0.045, 0.0232, 14, 24, al).rotateZ(a0), glaze); top.scale.set(1, 1, 0.9); top.position.z = 0.004; p.add(top);
    for (let s = 0; s < 14; s++) { const a = a0 + R.r(0, al), r = 0.045 + R.n(0.012); const sp = mesh(new THREE.CapsuleGeometry(0.0015, 0.005, 2, 4), STDm({ color: R.pick(['#ffffff', '#3a8ae8', '#f0c030', '#3ab05a', '#e83a3a']) }), Math.cos(a) * r, Math.sin(a) * r, 0.022); sp.rotation.z = R.r(0, 3); p.add(sp); } g.parts.push({ p, a: a0 + al / 2 }); }
  return g; }
// your right hand with the donut at the bottom right of the frame; k = 0 (out of view) … 1; split = 0 … 1
function placeDonut(S, cam, k, split, t) { const H = S.HR; H.root.visible = k > 0.01; S.donut.visible = k > 0.01; if (!H.root.visible) return; cam.updateMatrixWorld(true);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion), fw = new THREE.Vector3(-0.35, 0.25, -1).normalize().applyQuaternion(cam.quaternion), X = up.clone().negate(), Y = fw.clone().addScaledVector(X, -fw.dot(X)).normalize(), Z = new THREE.Vector3().crossVectors(X, Y);
  H.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); H.root.position.copy(cam.position).add(new THREE.Vector3(0.2, lerp(-0.7, -0.26, k) + 0.006 * Math.sin(TS(t) * 6), -0.56).applyQuaternion(cam.quaternion)); poseHand(H, { curl: [0.55, 0.6, 0.66, 0.72], spread: 0.1, thumb: 0.7, tremble: 0.1 }); H.root.updateMatrixWorld(true);
  S.donut.position.copy(new THREE.Vector3(0.0, 0.075, -0.06).applyMatrix4(H.root.matrixWorld)).addScaledVector(up, 0.02); S.donut.quaternion.copy(cam.quaternion); S.donut.rotateX(-0.5); S.donut.rotateZ(0.3);
  S.donut.parts.forEach((p, i) => { p.p.position.set(Math.cos(p.a) * 0.018 * split, Math.sin(p.a) * 0.018 * split, 0.004 * split * (i - 1)); p.p.rotation.set(0.15 * split * (i - 1), 0.1 * split, 0.08 * split * (i - 1)); }); }

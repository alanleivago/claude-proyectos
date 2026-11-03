// =====================================================================
//  SCENES — look check for now: the character on a studio cyc (turnaround, expressions, poses).
// =====================================================================
let LK = null;
function lookStudio() {
  if (LK) return LK;
  const scene = new THREE.Scene();
  const cyc = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 6, 64, 1, true, Math.PI * 0.5, Math.PI), new THREE.MeshStandardMaterial({ color: lin('#e9e4dc'), roughness: 0.95, side: THREE.BackSide }));
  cyc.position.set(0, 3, 0); cyc.receiveShadow = true;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: lin('#e3ddd3'), roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(cyc, floor); lightRig(scene, { keyPos: [2.5, 4, 3.5], shadowSize: 3 });
  scene.add(chBuild().root);
  LK = { scene };
  return LK;
}
function sceneMain() {
  const g = g3(), S = lookStudio(), t = TT;
  if (t < 10) {   // turnaround: front, 3/4, side, back
    const rot = [0, 35, 90, 160][Math.min(3, Math.floor(t / 2.5))];
    chPose({ pose: 'stand', expr: 'happy', rot, look: [0, 0] });
    shotCam(g, [0, 0.95, 3.4], [0, 0.9, 0], 40, 0);
  } else if (t < 30) {   // expressions, close
    const keys = Object.keys(CH_EXPR), k = keys[Math.min(keys.length - 1, Math.floor((t - 10) / 2.5))];
    chPose({ pose: 'stand', expr: k, rot: 12, blink: false });
    shotCam(g, [0.1, 1.52, 0.95], [0, 1.5, 0], 85, 0);
  } else if (t < 50) {   // poses
    const P = ['cheer', 'flip', 'shock', 'shrug', 'sad', 'point', 'hold', 'walk'], k = P[Math.min(P.length - 1, Math.floor((t - 30) / 2.5))];
    chPose(k === 'walk' ? { pose: 'stand', walk: (t - 30) * 0.9, expr: 'happy', rot: 30 } : { pose: k, expr: { cheer: 'joy', flip: 'amazed', shock: 'surprised', shrug: 'smug', sad: 'sad', point: 'happy', hold: 'happy' }[k], rot: 25 });
    shotCam(g, [0, 0.95, 3.6], [0, 0.92, 0], 40, 0);
  } else if (t < 70) {   // dev: medium-wide expressions (character ~40% of frame height)
    const keys = Object.keys(CH_EXPR), k = keys[Math.min(keys.length - 1, Math.floor((t - 50) / 2.5))];
    chPose({ pose: 'stand', expr: k, rot: 12, blink: false });
    shotCam(g, [0, 1.1, 5.4], [0, 1.0, 0], 35, 0);
  } else {   // dev: head front / 3-4 / side / back, hands (relaxed, fist, point, open)
    const i = Math.floor((t - 70) / 2.5);
    if (i < 4) { chPose({ pose: 'stand', expr: 'happy', rot: [0, 40, 90, 180][i], blink: false }); shotCam(g, [0, 1.54, 1.1], [0, 1.52, 0], 70, 0); }
    else { const hs = ['relax', 'fist', 'point', 'open', 'hold', 'flip', 'thumb', 'relax'][i - 4]; chPose({ pose: 'stand', hand: { L: hs, R: hs }, rot: -70, expr: 'neutral' }); const w = CH.arms.L.wr.getWorldPosition(new THREE.Vector3()); shotCam(g, [w.x + 0.45, w.y - 0.02, w.z + 1.3], [w.x, w.y - 0.09, w.z], 85, 0); }
  }
  present(g, S.scene, { bloom: 0.12 });
}
// ---- dev: extras (t 100–116 one by one full body, 120–126 medium shots with expressions, 130 a crowd of 16)
let XS = null;
const XOPT = [
  { sex: 'm', outfit: 'casual' }, { sex: 'f', outfit: 'dress' }, { sex: 'm', outfit: 'suit', beard: 'full', age: 'adult' }, { sex: 'f', outfit: 'casual', hair: 'pony' },
  { sex: 'm', outfit: 'jersey', hair: 'curly', skin: 0.85 }, { sex: 'f', outfit: 'uniform', hair: 'bun', bottom: 'skirt' }, { sex: 'm', outfit: 'apron', hair: 'buzz', skin: 0.6, beard: 'goatee' }, { sex: 'f', outfit: 'tee', hair: 'curly', skin: 0.9 },
  { sex: 'm', outfit: 'casual', age: 'old', hair: 'bald', glasses: true, beard: 'mustache' }, { sex: 'f', outfit: 'suit', hair: 'bob', glasses: true, skin: 0.3 }, { sex: 'm', outfit: 'uniform', hair: 'crop', skin: 0.7, build: 'heavy' }, { sex: 'f', outfit: 'apron', hair: 'long', skin: 0.15 },
  { sex: 'm', outfit: 'tee', hair: 'wavy', build: 'slim', skin: 0.2 }, { sex: 'f', outfit: 'casual', age: 'old', hair: 'bob' }, { sex: 'm', outfit: 'jersey', hair: 'side', skin: 0.45, beard: 'stubble' }, { sex: 'f', outfit: 'dress', hair: 'pixie', skin: 0.55 },
];
const XEXPR = ['happy', 'joy', 'surprised', 'worried', 'sad', 'smug'], XPOSE = ['stand', 'cheer', 'point', 'shrug', 'hold', 'stand', 'sad', 'shock', 'stand', 'hold', 'stand', 'shrug', 'point', 'stand', 'cheer', 'stand'];
function devExtras(scene) {
  if (XS) return XS;
  const t0 = performance.now(); XS = XOPT.map((o, i) => { const x = chExtra(i * 7 + 3, o); scene.add(x.root); x.root.visible = false; return x; });
  console.log('extras build ms', Math.round(performance.now() - t0));
  return XS;
}
const _sceneMain0 = sceneMain;
sceneMain = function () {
  const t = TT;
  if (t < 100) return _sceneMain0();
  const g = g3(), S = lookStudio(), X = devExtras(S.scene); CH.root.visible = false; X.forEach((x) => { x.root.visible = false; });
  if (t < 116) { const i = Math.floor(t - 100), x = X[i]; x.root.visible = true; x.pose({ pose: XPOSE[i], expr: XEXPR[i % 6], rot: 18, blink: false }); shotCam(g, [0, 0.95, 3.4], [0, 0.88, 0], 40, 0); }
  else if (t < 130) { const i = Math.floor(t - 120) % 6, x = X[[0, 1, 4, 9, 8, 7][i]]; x.root.visible = true; x.pose({ pose: 'stand', expr: XEXPR[i], rot: 14, blink: false }); const hy = x.rig.B.head.getWorldPosition(new THREE.Vector3()).y; shotCam(g, [0, hy + 0.02, 1.25], [0, hy - 0.02, 0], 50, 0); }
  else { X.forEach((x, i) => { x.root.visible = true; const r = Math.floor(i / 8), c = i % 8; x.pose({ pose: XPOSE[i], walk: i % 5 === 4 ? t * 0.9 + i * 0.13 : null, expr: XEXPR[i % 6], pos: [(c - 3.5) * 0.62 + r * 0.3, 0, -r * 1.1], rot: (c - 3.5) * -4 }); }); shotCam(g, [0, 1.3, 6.2], [0, 0.9, -0.5], 32, 0); }
  present(g, S.scene, { bloom: 0.12 });
  CH.root.visible = true;
};

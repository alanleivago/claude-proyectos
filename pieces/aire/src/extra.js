// =====================================================================
//  EXTRA WORLD for "aire" (on top of the roadster world in world.js): a dark stage with a plinth (the explainer
//  "lab", far off at z = 900, everything else hidden while on it), a town crossing with a traffic light, a gas
//  station, a falling rock, a woman by the stands, x-ray air tanks inside the Roadster, a big motor in the Corolla,
//  a Model S-style dark sedan and two more Roadsters for the line-up.
// =====================================================================
const SC = new THREE.Vector3(0, 0.5, 900);     // the stage: the plinth's top centre
const XING = -250;                              // the town crossing (a road along z at x = XING)
let X = null;
function x3d() {
  if (X) return X;
  const g = g3(), sc = g.scene;
  // everything in the world that hides on the stage (not the lights, the camera, the cars or the effects)
  const keep = new Set([g.hero, g.corolla, g.balloon, g.cam, ...g.puffs, ...g.arrows, ...g.glows]);
  const world = sc.children.filter((o) => !o.isLight && !keep.has(o) && o !== g.key.target);
  const fog = sc.fog;
  // --- the stage
  const stage = new THREE.Group();
  const floor = mesh(new THREE.PlaneGeometry(600, 600), std('#0d1521', { r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }); stage.add(floor);
  stage.add(mesh(new THREE.CylinderGeometry(7.5, 7.8, 0.5, 64), std('#1a2838', { r: 0.7 }), 0, 0.25, 0));
  stage.add(mesh(new THREE.TorusGeometry(7.55, 0.05, 8, 96), basic('#4a6a8c'), 0, 0.5, 0, { rx: Math.PI / 2, cast: false }));
  stage.add(mesh(new THREE.TorusGeometry(10.5, 0.03, 8, 96), basic('#26384c'), 0, 0.01, 0, { rx: Math.PI / 2, cast: false }));
  stage.position.set(SC.x, 0, SC.z); sc.add(stage);
  // --- x-ray air tanks in the hero (4 cylinders + feed lines to the 3 nozzles)
  const tankM = new THREE.MeshBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false });
  const lineM = new THREE.MeshBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.9, toneMapped: false });
  const tanks = new THREE.Group();
  for (const [y, z] of [[0.62, -0.34], [0.62, 0.34], [0.92, -0.17], [0.92, 0.17]]) tanks.add(mesh(new THREE.CapsuleGeometry(0.2, 0.9, 6, 16), tankM, -0.55, y, z, { rz: Math.PI / 2, cast: false }));
  for (const z of [-0.5, 0, 0.5]) { const a = V3x(-1.1, 0.7, z * 0.5), b = V3x(-2.3, 0.58, z), d = b.clone().sub(a); const l = mesh(new THREE.CylinderGeometry(0.03, 0.03, d.length(), 6), lineM, 0, 0, 0, { cast: false }); l.position.copy(a.clone().add(b).multiplyScalar(0.5)); l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); tanks.add(l); }
  tanks.visible = false; g.hero.add(tanks);
  // --- the Corolla: x-ray-able materials and a big glowing motor at the rear axle
  const corM = []; g.corolla.traverse((o) => { if (o.isMesh && !corM.includes(o.material)) { o.material.transparent = true; o.material.needsUpdate = true; corM.push(o.material); } });
  const motor = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 24), basic('#ff8a3c', { tr: true, op: 0.9 }), -1.4, 0.4, 0, { rx: Math.PI / 2, cast: false }); motor.visible = false; g.corolla.add(motor);
  // --- the rock
  const rock = mesh(new THREE.DodecahedronGeometry(0.9, 0), std('#6a4a3a', { r: 1 }), 0, 0, 0); rock.geometry.computeVertexNormals(); rock.visible = false; sc.add(rock);
  // --- the town crossing: a road along z, crosswalks, a traffic light, houses
  const town = new THREE.Group();
  const Tz = texAsphalt(true); Tz.wrapS = THREE.RepeatWrapping; Tz.repeat.set(30, 1);
  const cross = mesh(new THREE.PlaneGeometry(300, 10), std('#ffffff', { map: Tz, r: 0.85 }), XING, 0.07, 0, { rx: -Math.PI / 2, rz: Math.PI / 2, cast: false }); cross.material.polygonOffset = true; cross.material.polygonOffsetFactor = -3; town.add(cross);
  const white = basic('#e9e6dc'); for (let k = -4; k <= 4; k++) { town.add(mesh(new THREE.BoxGeometry(0.6, 0.02, 2.2), white, XING - 7, 0.09, k * 1.1, { ry: Math.PI / 2, cast: false })); town.add(mesh(new THREE.BoxGeometry(2.2, 0.02, 0.6), white, XING + k * 1.1, 0.09, -6.6, { cast: false })); }
  const pole = std('#2a2c32', { r: 0.5 }); town.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 6, 10), pole, XING + 6, 3, -6.5)); town.add(mesh(new THREE.BoxGeometry(0.2, 0.2, 5.2), pole, XING + 6, 6, -4.0));
  const box = mesh(new THREE.BoxGeometry(0.5, 1.6, 0.6), std('#16171b', { r: 0.6 }), XING + 6, 5.2, -1.6); town.add(box);
  const lamps = ['#ff3a2a', '#ffc02a', '#3aff7a'].map((c, i) => { const m = new THREE.MeshBasicMaterial({ color: lin(c), toneMapped: false }); town.add(mesh(new THREE.CircleGeometry(0.17, 20), m, XING + 5.74, 5.7 - i * 0.5, -1.6, { ry: -Math.PI / 2, cast: false })); return m; });
  { const R = RNG('houses'), wallC = ['#d8c3a8', '#c9b8d0', '#e0d0b8', '#b8c4cc', '#d6b8a8'], roofC = ['#4a3a3a', '#3a4048', '#5a3a30'];
    for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1, x = XING - 40 + (i >> 1) * 15 + R.n(2), z = side * R.r(16, 22); if (Math.abs(x - XING) < 9) continue;
      const w = R.r(7, 10), d = R.r(6, 8), h = R.r(3.2, 4.2), hs = new THREE.Group(); hs.add(mesh(new THREE.BoxGeometry(w, h, d), std(R.pick(wallC), { r: 0.85 }), 0, h / 2, 0));
      const roof = extrudeProfile([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [0, 2.2]], d + 0.6, 0.02); roof.rotateY(0); hs.add(mesh(roof, std(R.pick(roofC), { r: 0.8 }), 0, h, 0));
      const winM = new THREE.MeshBasicMaterial({ color: lin('#ffd890'), toneMapped: false }); for (const dx of [-w / 4, w / 4]) hs.add(mesh(new THREE.PlaneGeometry(1.1, 1.0), winM, dx, h * 0.55, -side * (d / 2 + 0.01), { ry: side > 0 ? Math.PI : 0, cast: false }));
      hs.position.set(x, 0, z); town.add(hs); }
    for (let i = 0; i < 8; i++) { const x = XING - 30 + i * 9, z = (i % 2 ? 1 : -1) * 11; town.add(mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.4, 8), std('#5a3e2a'), x, 1.2, z)); town.add(mesh(new THREE.IcosahedronGeometry(1.7, 0), std('#4f6a34', { r: 0.9 }), x, 3.4, z)); } }
  sc.add(town);
  // --- the gas station
  const gas = new THREE.Group(); { const c = std('#e8e6e0', { r: 0.6 }), red = std('#c8281e', { r: 0.6 });
    gas.add(mesh(new THREE.BoxGeometry(16, 0.7, 9), c, 0, 5.2, 0)); gas.add(mesh(new THREE.BoxGeometry(16.1, 0.3, 9.1), red, 0, 4.8, 0));
    for (const [x, z] of [[-6, -3], [6, -3], [-6, 3], [6, 3]]) gas.add(mesh(new THREE.BoxGeometry(0.35, 5, 0.35), c, x, 2.5, z));
    for (const x of [-3, 3]) { gas.add(mesh(new THREE.BoxGeometry(0.9, 1.6, 0.6), red, x, 0.8, 0)); gas.add(mesh(new THREE.BoxGeometry(0.6, 0.4, 0.62), basic('#1a1a1e'), x, 1.25, 0)); }
    const sC = document.createElement('canvas'); sC.width = 512; sC.height = 64; const x = sC.getContext('2d'); x.fillStyle = '#c8281e'; x.fillRect(0, 0, 512, 64); x.fillStyle = '#ffffff'; x.font = `700 40px ${S3.font}`; x.textAlign = 'center'; x.fillText('GASOLINERA', 256, 47);
    const sT = new THREE.CanvasTexture(sC); sT.encoding = THREE.sRGBEncoding; gas.add(mesh(new THREE.PlaneGeometry(8, 1), basic('#ffffff', { map: sT }), 0, 5.2, 4.56, { cast: false }));
    gas.add(mesh(new THREE.PlaneGeometry(20, 14), std('#3a3a40', { r: 0.9 }), 0, 0.05, 0, { rx: -Math.PI / 2, cast: false }));
    gas.position.set(-180, 0, 13); }
  sc.add(gas);
  // --- the woman by the stands (x -134, z 36), facing the track (-z)
  const woman = new THREE.Group(); { const skin = std('#a8714f', { r: 0.6 }), top = std('#e0a030', { r: 0.9 }), pants = std('#2b3040', { r: 0.8 }), hair = std('#24170f', { r: 0.7 });
    for (const s of [-1, 1]) { woman.add(mesh(new THREE.CapsuleGeometry(0.12, 0.8, 4, 10), pants, s * 0.14, 0.5, 0)); woman.add(mesh(new THREE.CapsuleGeometry(0.09, 0.62, 4, 10), top, s * 0.36, 1.3, 0, { rz: s * 0.1 })); }
    woman.add(mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.8, 20), top, 0, 1.35, 0, { s: [1, 1, 0.7] })); woman.add(mesh(new THREE.SphereGeometry(0.21, 20, 14), skin, 0, 1.98, 0, { s: [1, 1.12, 1] }));
    woman.add(mesh(new THREE.SphereGeometry(0.225, 20, 12, 0, TAU, 0, Math.PI * 0.5), hair, 0, 2.02, 0.04, { s: [1, 1.12, 1.02], rx: 0.45 })); woman.add(mesh(new THREE.SphereGeometry(0.12, 12, 10), hair, 0, 2.18, 0.17));
    for (const s of [-1, 1]) woman.add(mesh(new THREE.SphereGeometry(0.028, 8, 6), std('#1a120c'), s * 0.075, 1.99, -0.2));
    woman.position.set(-134, 0, 36); }
  sc.add(woman);
  // --- more cars: a dark Model S-style sedan, two more Roadsters for the line-up
  const plaid = buildSedan('#26272c'); plaid.visible = false; sc.add(plaid);
  const ups = [buildRoadster(), buildRoadster()]; ups.forEach((u) => { u.userData.xr.visible = false; u.userData.P.nozzles.visible = u.userData.P.minis.visible = false; u.visible = false; sc.add(u); });
  X = { world, fog, stage, tanks, tankM, lineM, corM, motor, rock, lamps, woman, plaid, ups, gas, town };
  return X;
}
const V3x = (x, y, z) => new THREE.Vector3(x, y, z);
// per frame: back to the plain world
function resetExtra() {
  const x = x3d(), g = g3();
  stageMode(false); x.tanks.visible = false; x.tankM.color.set('#3fd0d6'); x.lineM.color.set('#3fd0d6'); x.motor.visible = false; x.rock.visible = false; x.plaid.visible = false; x.ups.forEach((u) => (u.visible = false));
  cxray(0); x.lamps.forEach((m, i) => m.color.set(['#3a1210', '#3a2c10', '#123a1c'][i]));
  g.hero.userData.P.nozzles.visible = true; g.corolla.scale.setScalar(1); x.rock.scale.setScalar(1); x.woman.scale.set(1, 1, 1); x.tankM.opacity = 0.85;
}
function stageMode(on) {
  const x = x3d(), g = g3(); x.world.forEach((o) => (o.visible = !on)); x.stage.visible = on;
  g.scene.fog = on ? null : x.fog; g.scene.background = on ? lin('#0b111a') : null;
}
function cxray(u) { x3d().corM.forEach((m) => { m.opacity = 1 - 0.85 * u; m.depthWrite = u < 0.5; }); }
// a car on the stage, heading +x
function onStage(car, dx = 0, dz = 0) { poseCar(car, { p: SC.clone().add(V3x(dx, 0, dz)), t: V3x(1, 0, 0), n: V3x(0, 1, 0) }); }
const cpt = (x, y, z) => { const c = g3().corolla; c.updateMatrixWorld(); return new THREE.Vector3(x, y, z).applyMatrix4(c.matrixWorld); };

SETS.moontest = async function () {
  await MOON.load(); const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a1240');
  scene.add(new THREE.HemisphereLight('#8090ff', '#101020', 1.2)); const k = new THREE.DirectionalLight('#c8d4ff', 3); k.position.set(2, 3, 5); scene.add(k);
  const a = MOON.make(); a.position.set(-1.1, 1.2, 0); scene.add(a); const b = MOON.make(); b.position.set(1.1, 1.2, 0); b.userData.setLids(1, 1); scene.add(b);
  const c = MOON.make(); c.position.set(0, -1.1, 0); c.userData.setLids(0.55, 0.15); scene.add(c);
  return { scene, grade: 'night', marks: {}, views: { all: { p: [0, 0, 9], l: [0, 0, 0], fov: 40 } } };
};

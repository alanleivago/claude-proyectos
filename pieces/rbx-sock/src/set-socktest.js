// self-check: socks on avatars, loose socks, the Sock Man's arm + the Sock Man, isolated on a grey studio floor.
'use strict';
SETS.socktest = async function () {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a2c33');
  scene.add(new THREE.HemisphereLight('#dfe6ff', '#3a3330', 1.4));
  const key = new THREE.DirectionalLight('#fff2e0', 4); key.position.set(10, 20, 14); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(key);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#55565c', roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const hero = RBX.avatar({ hood: 'dino', face: 'neutral', headScale: 1.25 }); SOCKS.dress(hero, 'dino', 'pizza'); hero.root.position.set(-6, 0, 0); scene.add(hero.root);
  const pip = RBX.avatar({ top: 'shirt', shirt: '#f29bb8', pants: '#7a5cc4', face: 'smile', headScale: 1.35, scale: 0.72, seed: 31 }); SOCKS.dress(pip, 'bare', 'duck'); pip.root.position.set(-2.5, 0, 0); scene.add(pip.root);
  const mm = RBX.avatar({ top: 'polo', shirt: '#2c5aa0', pants: '#1f3a68', seed: 71 }); SOCKS.dress(mm, 'mail', 'mail', { string: true }); mm.root.position.set(1, 0, 0); scene.add(mm.root);
  ['duck', 'pizza', 'dino', 'knit', 'stripe', 'gym', 'argyle', 'grey'].forEach((k, i) => { const s = SOCKS.one(k, 1); s.position.set(-6 + i * 1.6, 0.4, 6); s.rotation.set(-Math.PI / 2, 0, 0.3); scene.add(s); });
  const arm = SOCKS.arm({ n: 360 }); scene.add(arm); arm.userData.set([[18, 0.5, -6], [16, 6, -4], [12, 9, -1], [8, 6, 2], [6, 2.2, 3]], 0.6);
  const man = SOCKS.man(); man.position.set(30, 0, -2); man.rotation.y = 0; scene.add(man);
  return { scene, grade: 'day', marks: {}, props: {}, views: {
    avatars: { p: [-3.5, 3.2, 9], l: [-3.5, 2, 0], fov: 50 },
    feet: { p: [-3, 1.2, 4.5], l: [-3, 0.8, 0], fov: 50 },
    loose: { p: [-0.5, 5, 11], l: [-0.5, 0, 6], fov: 50 },
    arm: { p: [12, 8, 20], l: [12, 5, -1], fov: 50 },
    hand: { p: [4, 4, 9], l: [6.5, 2.5, 3], fov: 40 },
    man_front: { p: [30, 9, 22], l: [30, 6, 0], fov: 50 },
    man_side: { p: [48, 8, 10], l: [30, 6, 0], fov: 50 },
    man_head: { p: [29, 11, 13], l: [30, 10, 0], fov: 40 },
  } };
};

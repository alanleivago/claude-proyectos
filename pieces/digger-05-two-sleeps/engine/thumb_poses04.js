  // v2 poses (user): 1 hands over the ears while it rings, 2 slapping the top knob (snooze), 3 blowpipe at her lips aimed at the clock
  cover('full', (scene) => { twinBellClock(scene, 0.5, 0.0, 1.1, -0.3); const ch = hero(scene, { p: [-0.25, 0, 0.75], ry: 0.15 });
    return (t) => ch.drive(t, [still('surprised', 0.8)], [[-99, 'surprised', 'gasp']], false); }, 'HUMAN|ALARM?', 0.32);
  cover('bedroom', (scene) => { const ck = twinBellClock(scene, 0.4, 0.0, 0.95, -0.3); const ch = hero(scene, { p: [-0.3, 0, 0.6], ry: 0.65 }); const fp = V3([0, 0, 0]), top = V3([0, 0, 0]);
    return (t) => { ch.drive(t, [still('point', 0.8)], [[-99, 'angry', 'frown']], false); scene.updateMatrixWorld(true); ch.fist('L', fp);
      // the clock moves so its top knob sits right under her fist (touching, no overlap)
      ck.updateMatrixWorld(true); ck.localToWorld(top.set(0, 1.26, 0)); ck.position.add(V3([fp.x - top.x, fp.y - 0.06 - top.y, fp.z - top.z])); }; }, 'HUMAN|ALARM?', 0.32);
  cover('expedition', (scene) => { twinBellClock(scene, 0.62, -0.3, 1.0, -0.4); const ch = hero(scene, { p: [-0.35, 0, 0.75], ry: 0.6 });
    const tube = L.mesh(new THREE.CylinderGeometry(0.045, 0.055, 1, 10), litM(null, 0x6a8a3a), 0, 0, 0, scene); const tg = V3([0.55, 0.75, -0.2]);
    const peas = [0.45, 0.75].map((k) => ({ k, m: L.mesh(new THREE.IcosahedronGeometry(0.09, 1), new THREE.MeshBasicMaterial({ color: 0x8cf04a }), 0, 0, 0, scene) })); const hd = V3([0, 0, 0]);
    let head = null; ch.root.traverse((o) => { if (!head && o.isBone && o.name === 'Head') head = o; });
    return (t) => { ch.drive(t, [still('blow_tube', 1.0)], [[-99, 'open', 'talkO']], false); scene.updateMatrixWorld(true); head.localToWorld(hd.set(0, 0, 0)); const mouth = hd.clone().add(V3([0.06, -0.07, 0.08]));
      const d = tg.clone().sub(mouth).normalize(), a = mouth.clone().addScaledVector(d, 0.02), b = mouth.clone().addScaledVector(d, 0.6); orient(tube, a, b); peas.forEach(({ k, m }) => m.position.copy(b).lerp(tg, k)); }; }, 'HUMAN|ALARM?', 0.32);

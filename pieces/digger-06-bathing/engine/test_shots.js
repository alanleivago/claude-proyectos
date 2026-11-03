  // TEST ONLY (pose sampler, injected by test_exp.mjs): 8 clips side by side with her fists marked, plus head-bone axis tests
  SH([9, 'average'], 'C', (t0) => { const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9ab0c0); scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const clips = (window.TEST_CLIPS || 'warm_hands,light_candle,charge_plug,press_down,dig_hands,blow_tube,hold_up_object,think').split(',');
    const hs = clips.map((c, i) => { const ch = hero(scene, { p: [-0.9 + i * 0.6, 0, 0], ry: 0 }); return [ch, c]; });
    const mk = []; for (let i = 0; i < 16; i++) mk.push(L.mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x00ff00 : 0xff00ff }), 0, 0, 0, scene));
    return { scene, cam: CAM([[0, 1.0, 6.5]], [[0, 0.9, 0]], 40), upd(t) { hs.forEach(([ch, c], i) => { ch.drive(t, [still(c, window.TEST_T || 1.0)], [[-99, 'open', 'smile']], false);
      if (window.TEST_HEAD) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); hd.rotation[window.TEST_HEAD] += (i - 3.5) * 0.15; }
      scene.updateMatrixWorld(true); ch.fist('R', mk[i * 2].position); ch.fist('L', mk[i * 2 + 1].position); }); } }; });

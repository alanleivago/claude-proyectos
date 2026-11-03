// The Watcher: the Majora moon (RBX.loadMoon) + eyelids for blink / squint. MOON.make() -> Group (radius 1, faces +z).
'use strict';
const MOON = {};
(function () {
  let base = null;
  MOON.load = async function () { base = await RBX.loadMoon({ eyeGlow: 6 }); return base; };
  // eye centres from the vertices whose UV lands on the glowing iris tile
  function findEyes(mesh) {
    const im = mesh.material.emissiveMap.image, S = im.width, d = im.getContext('2d').getImageData(0, 0, S, S).data;
    const uv = mesh.geometry.attributes.uv, P = mesh.geometry.attributes.position, acc = [[], []];
    for (let i = 0; i < uv.count; i++) { const x = Math.min(S - 1, Math.floor(uv.getX(i) * S)), y = Math.min(S - 1, Math.floor((1 - uv.getY(i)) * S)); if (d[(y * S + x) * 4] < 60) continue;
      const v = new THREE.Vector3().fromBufferAttribute(P, i); if (v.z < 0.3) continue; acc[v.x < 0 ? 0 : 1].push(v); }
    return acc.map((a) => { const c = new THREE.Vector3(); a.forEach((v) => c.add(v)); c.divideScalar(Math.max(1, a.length)); let r = 0; a.forEach((v) => { r = Math.max(r, v.distanceTo(c)); }); return { c, r: r || 0.12 }; });
  }
  MOON.make = function () {
    const g = base.clone(), mesh = g.children[0];
    const eyes = findEyes(base.userData.mesh), lidM = (() => { const lc = RBX.cnv(256, 256), lg = lc.getContext('2d'), r = RBX.rng(3); lg.fillStyle = '#9a9ca6'; lg.fillRect(0, 0, 256, 256); KIT.noiseOver(lg, 256, 256, 41, 0.9, 8, 5);
      for (let i = 0; i < 40; i++) { lg.fillStyle = 'rgba(40,44,60,0.35)'; lg.beginPath(); lg.arc(r() * 256, r() * 256, 3 + r() * 14, 0, 7); lg.fill(); }
      return new THREE.MeshStandardMaterial({ map: RBX.tex(lc), color: '#b4b6c0', roughness: 1, emissive: new THREE.Color('#3a3d4a'), emissiveIntensity: 0.5 }); })();
    const lids = eyes.map((e) => {
      const piv = new THREE.Group(); piv.position.copy(e.c).add(new THREE.Vector3(0, 0, -e.r * 0.35)); g.add(piv);
      const m = new THREE.Mesh(new THREE.SphereGeometry(e.r * 1.25, 40, 20, 0, Math.PI * 2, 0, 0.01), lidM); m.rotation.x = 0.35; piv.add(m); piv.userData.m = m; piv.userData.r = e.r * 1.25; return piv;
    });
    // k: 0 open .. 1 closed, per eye
    g.userData.setLids = (kL, kR = kL) => { [kL, kR].forEach((k, i) => { const L = lids[i], th = (0.12 + 0.62 * k) * Math.PI; L.userData.m.geometry.dispose(); L.userData.m.geometry = new THREE.SphereGeometry(L.userData.r, 40, 20, 0, Math.PI * 2, 0, th); L.visible = k > 0.01; }); };
    g.userData.setLids(0); g.userData.eyes = eyes; g.userData.mesh = mesh;
    g.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; m.material.fog = false; } });
    return g;
  };
})();

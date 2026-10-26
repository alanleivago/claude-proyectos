// STAGE space — stub (to be replaced)
let G_space = null;
function stageSpace(g, st) {
  if (!G_space) { const scene = new THREE.Scene(); const sea = new THREE.Mesh(new THREE.PlaneGeometry(4e6, 4e6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: lin('#1f7f8c'), roughness: 0.3 }));
    const sun = new THREE.DirectionalLight(0xfff0dc, 2); sun.position.copy(SUN);
    scene.add(sea, new THREE.HemisphereLight(0xbfd8ff, 0x204050, 1.2), sun); scene.background = lin('#9cc0e8'); G_space = { scene, sea }; }
  const S = G_space, Hm = waveH(st); applyCam(g, st, Math.max(0.3, Hm * 0.02), Math.max(5e4, Hm * 3000));
  updateWave(g, st); if (g.wave.mesh.parent !== S.scene) S.scene.add(g.wave.mesh);
  FOGC.value.set('#cfd8e6'); FOGD.value = 2 / Math.max(2e4, Hm * 400); SKYC.value.set('#9ab8dc');
  g.r.render(S.scene, g.cam);
  return {};
}

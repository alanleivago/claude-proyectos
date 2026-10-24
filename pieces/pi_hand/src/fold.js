
// =====================================================================
//  FOLD — the ground has too much length: it ripples (47-50 s) and folds up into an earth wall across the park (50-56 s)
// =====================================================================
function buildFold(st, S) { const R = RNG('fold');
  // the fold: an earth wall that rises across the park ahead (hidden until 50 s)
  { const wg = new THREE.PlaneGeometry(400, 60, 80, 30), wall = mesh(wg, STDm({ map: wrap(texNoise('dirt', '#7a5a3a', ['#6a4a2e', '#8a6a44', '#5a3e28', '#9a7a54'], 12000), 30, 5), roughness: 1, side: THREE.DoubleSide }), 0, 0, -70); wall.visible = false; st.scene.add(wall); S.wall = wall; S.w0 = wg.attributes.position.array.slice(); }
  S.dust = []; for (let i = 0; i < 40; i++) { const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#c8b090', transparent: true, depthWrite: false, opacity: 0 })); st.scene.add(d); S.dust.push({ d, x: R.r(-60, 60), y: R.r(0, 20), ph: R.r(0, 6) }); }
}
function foldH(t) { return 26 * ss(50.0, 55.5, t); }
const foldAt = (z, H) => H * Math.exp(-(((z + 72) / 7) ** 2)) + H * 0.35 * Math.exp(-(((z + 60) / 10) ** 2));
function poseFold(S, t) {
  // the fold: an earth wall heaves up across the park; the ground and the path bend into it
  { const H = foldH(t); S.wall.visible = H > 0.05; if (S.wall.visible) { const p = S.wall.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = S.w0[i * 3], y = S.w0[i * 3 + 1]; const v = (y + 30) / 60; p.setY(i, v * H * (1 + 0.15 * Math.sin(x * 0.07)) + 0.6 * Math.sin(x * 0.3 + y) * v); p.setZ(i, -2 * v * v * H * 0.3 + 0.8 * Math.sin(x * 0.11 + y * 0.2)); } p.needsUpdate = true; S.wall.geometry.computeVertexNormals(); }
    [[S.gnd, S.g0, S.gOZ], [S.path, S.p0, S.pOZ]].forEach(([m, base, oz]) => { const p = m.geometry.attributes.position; if (!m.userData.f && H < 0.01) return; m.userData.f = true; for (let i = 0; i < p.count; i++) p.setY(i, base[i * 3 + 1] + foldAt(base[i * 3 + 2] + oz, H) * 0.5); p.needsUpdate = true; m.geometry.computeVertexNormals(); });
    S.dust.forEach((d) => { const k = ss(50, 53, t) * (1 - ss(60, 64, t)); d.d.material.opacity = 0.35 * k; d.d.position.set(d.x, d.y + H * 0.4, -68 + Math.sin(d.ph) * 4); d.d.scale.setScalar(10 + 8 * Math.sin(t * 0.3 + d.ph)); }); }
}

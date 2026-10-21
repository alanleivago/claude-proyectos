
// =====================================================================
//  SHOTS — the lake park (with your hands in view), the zoom into the atom, the rise to the Earth.
//  The 5 seconds without protons are drawn by inverting the frame to magenta (2D post) + glassy hands with bones.
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const T_GONE = 10.0, T_BACK = 56.5;
const goneK = (t) => (t >= T_GONE && t < T_BACK ? 1 : 0);
const texNoise = (key, base, cols, n = 9000, w = 256) => g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 50), R.pick(cols)); speck(x, w, w, n, cols, R, 1, 2); }, w, w);
const plane = (st, w, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat); m.position.set(x, y, z); m.receiveShadow = true; st.scene.add(m); return m; };
const box = (par, w, h, d, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; (par.scene || par).add(m); return m; };
const cyl = (par, r0, r1, h, mat, x, y, z, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (par.scene || par).add(m); return m; };

// the scene clock: real time before T_GONE and after T_BACK; slowed 12x (and nearly frozen) in between
const sceneT = (t) => (t < T_GONE ? t : t < T_BACK ? T_GONE + (t - T_GONE) / 12 * 0.3 : T_GONE + (T_BACK - T_GONE) / 12 * 0.3 + (t - T_BACK));
// place both hands in front of the camera (q.view: 0 = hidden low, 1 = in view)
function placeHands(S, cam, q) {
  cam.updateMatrixWorld(true);
  [S.HL, S.HR].forEach((H) => { const s = H.side, k = (q.only && q.only !== s ? 0 : 1) * (q.view ?? 1); H.root.visible = k > 0.02;
    const off = new THREE.Vector3(s * (q.dx ?? 0.075), lerp(-0.6, q.dy ?? -0.12, k), q.dz ?? -0.56).applyQuaternion(cam.quaternion); H.root.position.copy(cam.position).add(off);
    H.root.quaternion.copy(cam.quaternion); H.root.rotateX(-(q.tilt ?? 0.45)); H.root.rotateZ(-s * (q.roll ?? -0.12)); if (q.palm) H.root.rotateY(Math.PI); if (q.twist) H.root.rotateY(s * q.twist);
    poseHand(H, { curl: q.curl ?? [0.15, 0.1, 0.12, 0.18], spread: q.spread ?? 0.6, thumb: q.thumb ?? 0.1, tremble: q.tremble ?? 0.6 }); handsGlass(H, q.glass || 0); });
}

// ===================== 4. CRACK (30-38) and 6. FALL (48-56.5): the hands crack; the last 100 ms =====================
function crackHands(S, k) { [S.HL, S.HR].forEach((H) => H.skins.forEach((m) => { if (!m.userData.crack) { m.userData.crack = { value: 0 }; const u = m.userData.crack; m.onBeforeCompile = (sh) => { sh.uniforms.uCrack = u;
    sh.vertexShader = 'varying vec3 vCp;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vCp = position;');
    sh.fragmentShader = 'uniform float uCrack; varying vec3 vCp;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      if (uCrack > 0.001) { vec3 q = vCp * 160.0; vec3 c = floor(q); float d1 = 9.0, d2 = 9.0; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++) { vec3 h = c + vec3(float(i), float(j), float(k)); vec3 o = fract(sin(vec3(dot(h, vec3(127.1, 311.7, 74.7)), dot(h, vec3(269.5, 183.3, 246.1)), dot(h, vec3(113.5, 271.9, 124.6)))) * 43758.5453); float d = length(q - h - o); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
        float edge = 1.0 - smoothstep(0.0, 0.06 + 0.1 * uCrack, d2 - d1); totalEmissiveRadiance += vec3(1.0, 0.85, 0.95) * edge * uCrack * 2.5; }`); }; m.needsUpdate = true; }
  m.userData.crack.value = k; })); }
// ===================== 3. ZOOM (20-30): skin -> cells -> molecule -> atom -> nucleus without protons =====================
SHOT_FN.zoom = (lt, dur, t) => {
  const S = once('zoom', () => { const st = makeStage({ hemi: 1.0, sky: 0xffffff, ground: 0x404040, key: 1.6, box: 10 }); st.setSun(new THREE.Vector3(0.3, 1, 0.6)); st.scene.background = lin('#0a0a0e');
    const cells = new THREE.Group(); st.scene.add(cells); const R = RNG('cells'); const cm = STDm({ color: '#f0b8a0', roughness: 0.5 }), nm = STDm({ color: '#b86a78', roughness: 0.4 });
    const cms = ['#f0b8a0', '#e8a890', '#f4c4ae', '#e0a088'].map((c) => STDm({ color: c, roughness: 0.45 })); for (let i = -14; i <= 14; i++) for (let j = -16; j <= 16; j++) { const x = (i + (j & 1) * 0.5) * 0.1 + R.n(0.008), y = j * 0.087 + R.n(0.008), r = R.r(0.044, 0.05); const c = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6).scale(1, 1, 0.35), R.pick(cms)); c.position.set(x, y, -0.03); c.rotation.z = R.r(0, 6); cells.add(c); const n = new THREE.Mesh(new THREE.SphereGeometry(r * 0.32, 14, 10).scale(1, 1, 0.6), nm); n.position.set(x + R.n(0.006), y + R.n(0.006), -0.03 + r * 0.3); cells.add(n); }
    const mol = new THREE.Group(); mol.position.set(0, 0, 0); st.scene.add(mol); const atomCols = ['#f4f4f4', '#3a3a3a', '#e83a3a', '#3a6ae8'], at = []; for (let k = 0; k < 26; k++) { const p = new THREE.Vector3(R.n(0.004), R.n(0.004), R.n(0.004)); at.push(p); const m = new THREE.Mesh(new THREE.SphereGeometry(R.r(0.0008, 0.0014), 16, 12), STDm({ color: R.pick(atomCols), roughness: 0.3 })); m.position.copy(p); mol.add(m); }
    for (let k = 1; k < at.length; k++) { const a = at[k], b = at[Math.floor(R.f() * k)], L = a.distanceTo(b); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0002, 0.0002, L, 6), STDm({ color: '#c8c8c8' })); s.position.copy(a).add(b).multiplyScalar(0.5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); mol.add(s); }
    const atom = new THREE.Group(); atom.position.set(0, 0, 0); st.scene.add(atom); const EN = 9000, eP = new Float32Array(EN * 3); for (let i = 0; i < EN; i++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(Math.abs(R.n(4e-5)) + 1e-5); eP.set([v.x, v.y, v.z], i * 3); }
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(eP, 3)); const cloud = new THREE.Points(eg, new THREE.PointsMaterial({ size: 0.000008, color: 0x9ad0ff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); atom.add(cloud);
    const nuc = new THREE.Group(); atom.add(nuc); const pM = new THREE.MeshStandardMaterial({ color: '#e83a5a', roughness: 0.3, transparent: true }), nM = STDm({ color: '#b8bcc4', roughness: 0.3 }), parts = [];
    for (let k = 0; k < 12; k++) { const v = new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize().multiplyScalar(R.r(0, 0.8e-6)); const isP = k % 2 === 0, m = new THREE.Mesh(new THREE.SphereGeometry(0.55e-6, 24, 18), isP ? pM : nM); m.position.copy(v); nuc.add(m); parts.push({ m, isP, v }); }
    return { st, cells, mol, atom, cloud, parts, pM }; });
  const { st, cells, mol, atom, cloud, parts, pM } = S;
  // an exponential dolly from 3 m to a few femtometres
  const KD = [[0, 0.8], [2.5, 0.15], [3.8, 0.012], [5.3, 1.6e-4], [7.0, 6e-6]]; let dist = KD[KD.length - 1][1]; for (let i = 0; i < KD.length - 1; i++) if (lt < KD[i + 1][0]) { dist = Math.exp(lerp(Math.log(KD[i][1]), Math.log(KD[i + 1][1]), EZ.io(seg(lt, KD[i][0], KD[i + 1][0])))); break; }
  cells.visible = dist > 0.006; mol.visible = dist < 0.04 && dist > 5e-4; atom.visible = dist < 3e-4; cloud.material.size = dist * 0.01;
  mol.rotation.y = lt * 0.4; atom.rotation.y = lt * 0.3;
  const gone = ss(7.6, 8.4, lt); parts.forEach((p) => { if (p.isP) p.m.visible = gone < 0.99; else p.m.position.copy(p.v).multiplyScalar(1 + 0.6 * gone); }); pM.opacity = 1 - gone;
  st.cam.near = dist * 0.01; st.cam.far = dist * 400 + 10; camLook(st.cam, dist * 0.2, dist * 0.15, dist, 0, 0, 0); st.cam.fov = 50; st.cam.updateProjectionMatrix();
  renderStage(st, 1.0); bloom(0.35);
};

SHOT_FN.card = () => {};


// =====================================================================
//  LAP — you on the bench: wooden slats and cast-iron ends, your legs in jeans and trainers, a golden puppy lying
//  across your lap (real-looking fur from 18 shells with strands that lean toward the tail; breathing, ears, tail,
//  blinking eyes, a wet nose), and your two hands: the right one stroking its back, the left resting on its side.
// =====================================================================
const BENCHZ = -6.2, LAP = { EYE: new THREE.Vector3(0, 1.22, BENCHZ + 0.35) };
let FURU = null;
function furMats() { if (FURU) return FURU; const strand = g3Tex((x, w) => { const R = RNG('strand'); x.fillStyle = '#000'; x.fillRect(0, 0, w, w); for (let k = 0; k < 9000; k++) { const v = R.f(); x.fillStyle = `rgb(${v * 255},${v * 255},${v * 255})`; x.fillRect(R.r(0, w), R.r(0, w), 1.6, 1.6); } }, 256, 256, false);
  wrap(strand, 10, 10); const N = 18, mats = [];
  for (let i = 0; i <= N; i++) { const k = i / N, m = STDm({ color: lin('#d49a52').multiplyScalar(0.55 + 0.5 * k), roughness: 0.9, alphaMap: i ? strand : null, alphaTest: i ? 0.08 + 0.85 * k : 0, side: i ? THREE.DoubleSide : THREE.FrontSide });
    m.userData.k = k; m.onBeforeCompile = (sh) => { sh.uniforms.uK = { value: k }; sh.uniforms.uLen = m.userData.len = m.userData.len || { value: 0.024 };
      sh.vertexShader = 'uniform float uK; uniform float uLen;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(objectNormal) * uLen * uK + vec3(-0.6, -0.5, 0.0) * uLen * uK * uK;'); };
    m.customProgramCacheKey = () => 'fur' + i; mats.push(m); }
  return (FURU = mats); }
function furMesh(geo, par, len = 1) { const g = new THREE.Group(); par.add(g); furMats().forEach((m, i) => { const mesh = new THREE.Mesh(geo, m); mesh.castShadow = i === 0; mesh.receiveShadow = true; mesh.scale.setScalar(1 + 0.0 * i); mesh.onBeforeRender = () => {}; g.add(mesh); }); return g; }
function makePuppy() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const dark = STDm({ color: '#1a1210', roughness: 0.3 }), nose = STDm({ color: '#2a1c18', roughness: 0.15, metalness: 0.1 });
  const torso = new THREE.CapsuleGeometry(0.1, 0.24, 8, 24).rotateZ(Math.PI / 2); { const p = torso.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setY(i, p.getY(i) * (1 - 0.08 * Math.max(0, -x / 0.2))); p.setZ(i, p.getZ(i) * 1.05); } torso.computeVertexNormals(); }
  furMesh(torso, body);
  const neck = new THREE.Group(); neck.position.set(0.17, 0.035, 0); body.add(neck); furMesh(new THREE.SphereGeometry(0.075, 20, 16).scale(1.1, 1, 1), neck);
  const head = new THREE.Group(); head.position.set(0.075, 0.06, 0); neck.add(head); furMesh(new THREE.SphereGeometry(0.075, 24, 18).scale(1.05, 0.95, 1), head);
  const muz = new THREE.SphereGeometry(0.04, 18, 14).scale(1.6, 0.8, 0.95); furMesh(muz.translate(0.075, -0.024, 0), head);
  const nz = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 10).scale(1, 0.8, 1.2), nose); nz.position.set(0.138, -0.014, 0); head.add(nz);
  const eyes = [-1, 1].map((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.013, 14, 10), dark); e.position.set(0.06, 0.018, s * 0.04); head.add(e); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(0.07, 0.024, s * 0.043); head.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 12, 8, 0, TAU, 0, Math.PI / 2), STDm({ color: '#b07a40' })); lid.position.copy(e.position); head.add(lid); return { e, lid }; });
  const ears = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(-0.01, 0.04, s * 0.068); head.add(g); const eg = new THREE.SphereGeometry(0.045, 16, 12).scale(0.7, 1.15, 0.42).translate(0, -0.045, 0); furMesh(eg, g); g.rotation.x = s * -0.25; return g; });
  const legs = [[0.13, 1], [0.13, -1], [-0.13, 1], [-0.13, -1]].map(([x, s]) => { const g = new THREE.Group(); g.position.set(x, -0.04, s * 0.06); body.add(g); furMesh(new THREE.CapsuleGeometry(0.03, 0.09, 6, 12).rotateZ(Math.PI / 2).translate(0.05, -0.03, 0), g); return g; });
  const tail = new THREE.Group(); tail.position.set(-0.2, 0.0, 0); body.add(tail); furMesh(new THREE.CapsuleGeometry(0.018, 0.1, 6, 12).rotateZ(Math.PI / 2).translate(-0.06, 0, 0), tail);
  return { root, body, neck, head, eyes, ears, legs, tail };
}
function posePuppy(D, ts, frozen) { const t = ts; D.body.scale.set(1, 1 + 0.03 * Math.sin(t * 2.4), 1 + 0.025 * Math.sin(t * 2.4)); D.tail.rotation.y = 0.8 + 0.3 * Math.sin(t * 5.5); D.tail.rotation.z = -0.5;
  D.neck.rotation.set(0.25 + 0.1 * Math.sin(t * 0.5), 0.75 + 0.2 * Math.sin(t * 0.37), 0.12 + 0.06 * Math.sin(t * 0.6)); D.head.rotation.set(0, 0.15 * Math.sin(t * 0.8 + 1), -0.15 + 0.1 * Math.sin(t * 0.45));
  D.ears.forEach((e, i) => (e.rotation.z = 0.12 * Math.sin(t * 1.7 + i)));
  const bl = mod(t + 0.7, 3.4) < 0.16 ? 1 : 0; D.eyes.forEach((E) => { E.lid.rotation.z = lerp(-1.4, 0.0, bl); }); }
function buildLap(st) {
  const S = {}, g = new THREE.Group(); g.position.z = BENCHZ; st.scene.add(g); S.g = g;
  // the bench (seat at y 0.45, from z 0.1 to 0.55; backrest behind you)
  const slatM = STDm({ color: '#8a6040', roughness: 0.75, map: wrap(texNoise('slat', '#8a6040', ['rgba(50,30,15,0.35)', 'rgba(170,130,90,0.3)'], 6000), 4, 1) }), ironM = STDm({ color: '#1e2226', metalness: 0.6, roughness: 0.45 });
  for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.085), slatM); s.position.set(0, 0.45, 0.13 + k * 0.1); s.castShadow = s.receiveShadow = true; g.add(s); }
  [-0.9, 0.9].forEach((x) => { const a = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.5), ironM); a.position.set(x, 0.225, 0.33); a.castShadow = true; g.add(a); const ar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 10).rotateX(Math.PI / 2), ironM); ar.position.set(x, 0.66, 0.3); g.add(ar); });
  // your legs: jeans (with seams and twill), trainers
  const denim = g3Tex((x, w) => { const R = RNG('denim'); x.fillStyle = '#3a5680'; x.fillRect(0, 0, w, w); for (let i = -w; i < w; i += 3) { x.strokeStyle = `rgba(${R.f() < 0.5 ? '20,30,50' : '140,160,190'},${R.r(0.05, 0.14)})`; x.lineWidth = 1; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + w, w); x.stroke(); } speck(x, w, w, 3000, ['rgba(200,210,230,0.15)', 'rgba(10,20,40,0.2)'], R, 1, 2); }, 256, 256);
  const jeans = STDm({ map: wrap(denim, 2, 2), roughness: 0.9, bumpMap: denim, bumpScale: 0.002 }), shoeM = STDm({ color: '#e8e6e2', roughness: 0.6 }), soleM = STDm({ color: '#c8c0b0' });
  [-1, 1].forEach((s) => { const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 8, 20).rotateX(Math.PI / 2 - 0.08), jeans); th.position.set(s * 0.12, 0.555, 0.08); th.castShadow = th.receiveShadow = true; g.add(th);
    const kn = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 14), jeans); kn.position.set(s * 0.12, 0.54, -0.17); g.add(kn);
    const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.38, 8, 18), jeans); sh.position.set(s * 0.125, 0.3, -0.24); sh.rotation.x = 0.12; sh.castShadow = true; g.add(sh);
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.17, 6, 16).rotateX(Math.PI / 2).scale(1, 0.75, 1), shoeM); shoe.position.set(s * 0.13, 0.05, -0.33); shoe.castShadow = true; g.add(shoe); const so = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.28), soleM); so.position.set(s * 0.13, 0.013, -0.33); g.add(so); });
  // the puppy on your lap (head to your right)
  const D = makePuppy(); D.root.position.set(0.01, 0.725, 0.02); D.root.rotation.y = Math.PI / 2 + 0.12; g.add(D.root); S.D = D;
  // your hands
  S.HR = makeHand(1); S.HL = makeHand(-1); g.add(S.HR.root, S.HL.root);
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transmission: 1, thickness: 0.004, ior: 1.5, transparent: true, opacity: 1, side: THREE.DoubleSide, specularIntensity: 1 });
  const gl = new THREE.Group(); g.add(gl); S.glass = gl; const shell = new THREE.Mesh(new THREE.LatheGeometry([[0.0, 0.0], [0.034, 0.0], [0.036, 0.004], [0.04, 0.12], [0.0405, 0.125], [0.0375, 0.124], [0.034, 0.012], [0.0, 0.012]].map(([r, y]) => new THREE.Vector2(r, y)), 40), glassM); gl.add(shell);
  const wM = new THREE.MeshPhysicalMaterial({ color: '#cfe8f4', roughness: 0.02, transmission: 0.92, thickness: 0.06, ior: 1.33, transparent: true });
  const wat = new THREE.Group(); gl.add(wat); S.glassWater = wat; wat.add(new THREE.Mesh(new THREE.CylinderGeometry(0.0368, 0.0342, 0.074, 40).translate(0, 0.049, 0), wM));
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.0368, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e8f6ff', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.5 })); top.position.y = 0.086; wat.add(top);
  return S;
}
// place a hand: wrist at w, fingers along dir, back of the hand toward up-ish
const _hx = new THREE.Vector3(), _hy = new THREE.Vector3(), _hz = new THREE.Vector3(), _hm = new THREE.Matrix4();
function aimHand(H, w, dir, up) { _hy.copy(dir).normalize(); _hz.copy(up).addScaledVector(_hy, -up.dot(_hy)).normalize(); _hx.crossVectors(_hy, _hz); _hm.makeBasis(_hx, _hy, _hz); H.root.quaternion.setFromRotationMatrix(_hm); H.root.position.copy(w); }
function poseLap(S, ts, k, reach = 0, tb = -1) {
  posePuppy(S.D, ts, k < 0.5);
  // stroking: the left hand slides along the back from the neck, lifts, comes back; the right hand holds the glass on your knee
  const c = mod(ts / 2.4, 1), slide = c < 0.62 ? ss(0, 0.62, c) : 1 - ss(0.62, 1, c), lift = c < 0.62 ? 0 : Math.sin((c - 0.62) / 0.38 * Math.PI);
  const wR = new THREE.Vector3(-0.07 + 0.02 * slide, 0.905 + 0.035 * lift, lerp(-0.0, 0.15, slide)), dR = new THREE.Vector3(0.22, -0.36, -0.9);
  aimHand(S.HL, wR, dR, new THREE.Vector3(-0.3, 1, -0.1)); poseHand(S.HL, { curl: [0.45 - 0.12 * lift, 0.42, 0.44, 0.5], spread: 0.35, thumb: 0.15, tremble: 0.15 });
  const gx = lerp(0.19, 0.2, reach), gy = lerp(0.6, 0.86, reach), gz = lerp(-0.14 + 0.004 * Math.sin(ts * 0.7), -0.7, reach); S.glass.position.set(gx, gy, gz); S.glass.rotation.set(0.04 * Math.sin(ts * 0.5), 0, -0.05);
  aimHand(S.HR, new THREE.Vector3(gx + 0.058, gy + 0.03, gz + 0.03), new THREE.Vector3(lerp(-0.35, -0.3, reach), lerp(0.06, 0.12, reach), -0.94), new THREE.Vector3(1, 0.15, 0.2)); poseHand(S.HR, { curl: [0.62, 0.68, 0.72, 0.78], spread: 0.15, thumb: 0.55, tremble: 0.1 });
  S.glassWater.visible = k > 0.5;
}

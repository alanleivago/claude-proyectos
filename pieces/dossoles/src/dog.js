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

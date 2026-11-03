// =====================================================================
//  LOOK — the reference's soft 3D: smooth matte materials (no cel steps, no ink), bright diffuse light,
//  soft VSM shadows, a gentle screen-space ambient occlusion from a depth pass, and a strong depth-of-field blur.
//  renderSoft(st, o): colour pass → AO (multiplied, blurred) → DOF → onto the 2D canvas.
//  (TOON / toonify keep their names so the sets read the same; they now make smooth matte materials.)
//  Objects with userData.noInk (glows, glass, sprites) are left out of the depth pass.
// =====================================================================
function TOON(o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.88, metalness: 0 }, o)); }
function toonify(root) { root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshPhysicalMaterial) { const m = o.material; o.material = new THREE.MeshStandardMaterial({ color: m.color, map: m.map, bumpMap: m.bumpMap, bumpScale: m.bumpScale, roughness: 0.7, transparent: m.transparent, opacity: m.opacity, side: m.side }); } }); return root; }

let PST = null;
function post3() {
  if (PST) return PST;
  const rt = new THREE.WebGLRenderTarget(W / 2, H / 2, { depthTexture: new THREE.DepthTexture(W / 2, H / 2), depthBuffer: true });
  rt.depthTexture.type = THREE.UnsignedIntType;
  const dm = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const U = { tD: { value: rt.depthTexture }, uNear: { value: 0.05 }, uFar: { value: 4000 }, uPx: { value: new THREE.Vector2(2 / W, 2 / H) }, uMode: { value: 0 }, uFocus: { value: 3 }, uRange: { value: 6 }, uNearB: { value: 0 }, uAO: { value: 0.5 }, uAOr: { value: 0.35 }, uFov: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tD; uniform float uNear, uFar, uMode, uFocus, uRange, uNearB, uAO, uAOr, uFov; uniform vec2 uPx; varying vec2 vUv;
      float lz(vec2 uv){ float d = texture2D(tD, uv).x; return uNear * uFar / (uFar - d * (uFar - uNear)); }
      void main(){
        float z = lz(vUv);
        if (uMode > 0.5) { float far = smoothstep(uFocus + uRange * 0.2, uFocus + uRange, z), nr = uNearB * (1.0 - smoothstep(uFocus * 0.4, uFocus * 0.85, z)); float a = max(far, nr); gl_FragColor = vec4(a, a, a, a); return; }
        // AO: how many neighbours in a world-sized disc sit in front of this pixel (corners, contacts, under furniture)
        float rad = uAOr / (z * uFov) * 0.5; float occ = 0.0;
        for (int i = 0; i < 16; i++) { float fi = float(i); float a = fi * 2.39996; float rr = rad * sqrt((fi + 0.5) / 16.0); vec2 o = vec2(cos(a), sin(a) * 0.5625) * rr;
          float zs = lz(vUv + o); float dz = z - zs; occ += step(0.02 * z + 0.01, dz) * (1.0 - smoothstep(uAOr * 0.6, uAOr * 2.5, dz)); }
        float ao = clamp(occ / 16.0 * 1.6, 0.0, 1.0) * uAO * (1.0 - smoothstep(30.0, 80.0, z));
        gl_FragColor = vec4(0.0, 0.0, 0.0, ao); }` });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; const qs = new THREE.Scene(); qs.add(quad); const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  PST = { rt, dm, U, qs, qc, aoC: mk(W / 2, H / 2), maskC: mk(W / 2, H / 2), blurC: mk() }; return PST;
}
// o: { focus, range, blur (px), nearBlur, ao (0..1), aoR (m), exposure }
function renderSoft(st, o = {}) {
  st.cam.updateMatrixWorld(true); CAMREC = { q: st.cam.quaternion.clone(), fov: st.cam.fov, p: st.cam.position.clone() }; if (CAMONLY) return;
  const R = r3(), r = R.r, P = post3(); r.toneMappingExposure = o.exposure ?? 1;
  r.setClearColor(0x000000, 1); r.render(st.scene, st.cam);
  ctx.save(); screen(); ctx.drawImage(R.cv, 0, 0, W, H); ctx.restore();
  // depth pass at half size
  const bg = st.scene.background, ov = st.scene.overrideMaterial, fog = st.scene.fog; st.scene.background = null; st.scene.overrideMaterial = P.dm; st.scene.fog = null;
  const hid = []; st.scene.traverse((m) => { if (m.userData.noInk && m.visible) { m.visible = false; hid.push(m); } });
  r.setRenderTarget(P.rt); r.clear(); r.render(st.scene, st.cam); r.setRenderTarget(null);
  hid.forEach((m) => (m.visible = true)); st.scene.background = bg; st.scene.overrideMaterial = ov; st.scene.fog = fog;
  P.U.uNear.value = st.cam.near; P.U.uFar.value = st.cam.far; P.U.uFov.value = Math.tan(st.cam.fov * DEG / 2) * 2;
  const pass = (mode, canvas) => { P.U.uMode.value = mode; const sz = r.getSize(new THREE.Vector2()); r.setSize(W / 2, H / 2, false); r.setClearColor(0x000000, 0); r.clear(); r.render(P.qs, P.qc);
    const x = canvas.getContext('2d'); x.clearRect(0, 0, canvas.width, canvas.height); x.drawImage(R.cv, 0, 0, W / 2, H / 2, 0, 0, canvas.width, canvas.height); r.setSize(sz.x, sz.y, false); };
  if ((o.ao ?? 0.55) > 0) { P.U.uAO.value = o.ao ?? 0.55; P.U.uAOr.value = o.aoR ?? 0.35; pass(0, P.aoC); ctx.save(); screen(); ctx.filter = 'blur(5px)'; ctx.drawImage(P.aoC, 0, 0, W, H); ctx.filter = 'none'; ctx.restore(); }
  if ((o.blur ?? 0) > 0) { P.U.uFocus.value = o.focus ?? 3; P.U.uRange.value = o.range ?? 8; P.U.uNearB.value = o.nearBlur ?? 0; pass(1, P.maskC);
    const b = P.blurC.getContext('2d'); b.clearRect(0, 0, W, H); b.globalCompositeOperation = 'source-over'; b.filter = `blur(${o.blur}px)`; b.drawImage(ctx.canvas, 0, 0); b.filter = 'none';
    b.globalCompositeOperation = 'destination-in'; b.filter = 'blur(4px)'; b.drawImage(P.maskC, 0, 0, W, H); b.filter = 'none'; b.globalCompositeOperation = 'source-over';
    ctx.save(); screen(); ctx.drawImage(P.blurC, 0, 0); ctx.restore(); }
  r.setClearColor(0x000000, 1);
}
const renderToon = renderSoft;

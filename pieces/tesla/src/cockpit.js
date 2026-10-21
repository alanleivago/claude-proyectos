
// =====================================================================
//  COCKPIT + LOOK — an environment map from a sky (so the paint and glass reflect), the cabin (bucket seats, the yoke,
//  the dash and its big screen, A-pillars, door cards), your hands on the yoke, and a 2D zoom blur for the launch.
//  Car-local axes: +x forward, +y up, +z right; the driver sits on the left (z -0.38).
// =====================================================================
function skyEnv(st, top, hor, sun, sunCol = '#fff4e0') {
  const R3_ = r3().r, es = new THREE.Scene(), U = { top: { value: lin(top) }, hor: { value: lin(hor) }, sun: { value: sun.clone().normalize() }, sc: { value: lin(sunCol) } };
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: U,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top, hor, sun, sc; varying vec3 vD; void main(){ vec3 d = normalize(vD); float h = d.y; vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.6)) : mix(hor * 0.55, vec3(0.18, 0.17, 0.16), clamp(-h * 3.0, 0.0, 1.0)); c += sc * pow(max(dot(d, sun), 0.0), 600.0) * 30.0 + sc * pow(max(dot(d, sun), 0.0), 8.0) * 0.4; gl_FragColor = vec4(c, 1.0); }' })));
  const pm = new THREE.PMREMGenerator(R3_); st.scene.environment = pm.fromScene(es, 0.02).texture; pm.dispose(); }
function buildCockpit(car) {
  const g = new THREE.Group(); car.add(g); const leather = std('#2a2a2e', { r: 0.75 }), alc = std('#1a1a1c', { r: 0.95 }), alu = std('#b8bcc2', { r: 0.3, m: 0.85 }), white = std('#e8e6e0', { r: 0.6 });
  [-0.38, 0.38].forEach((z) => { const s = new THREE.Group(); s.position.set(-0.55, 0.42, z); g.add(s); s.add(mesh(new THREE.BoxGeometry(0.55, 0.12, 0.5), leather, 0.0, 0.06, 0)); const back = mesh(new THREE.BoxGeometry(0.12, 0.7, 0.5), leather, -0.3, 0.42, 0); back.rotation.z = 0.25; s.add(back);
    [-0.24, 0.24].forEach((bz) => s.add(mesh(new THREE.CapsuleGeometry(0.05, 0.4, 4, 10), white, -0.26, 0.36, bz, { rz: 0.25 }))); s.add(mesh(new THREE.BoxGeometry(0.1, 0.18, 0.3), leather, -0.42, 0.85, 0)); });
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.18, 1.6), alc, 0.55, 0.82, 0)); g.add(mesh(new THREE.BoxGeometry(0.36, 0.04, 1.64), alu, 0.5, 0.92, 0));
  g.add(mesh(new THREE.BoxGeometry(1.2, 0.22, 0.24), leather, -0.1, 0.55, 0)); // centre console
  // the screen
  const scv = document.createElement('canvas'); scv.width = 384; scv.height = 640; const scr = new THREE.CanvasTexture(scv); scr.encoding = THREE.sRGBEncoding; g.userData.scv = scv; g.userData.scr = scr; g.userData.scKey = ''; drawScreen(g, 0, 'PAQUETE SPACEX · LISTO', false);
  g.userData.screen = mesh(new THREE.PlaneGeometry(0.24, 0.4), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }), 0.42, 1.06, 0.0, { ry: -Math.PI / 2 }); g.userData.screen.rotation.set(0, -Math.PI / 2, 0); g.userData.screen.rotateX(-0.25); g.add(g.userData.screen);
  // the yoke
  const yoke = new THREE.Group(); yoke.position.set(0.22, 0.98, -0.38); g.add(yoke); yoke.rotation.z = 0.35; g.userData.yoke = yoke;
  yoke.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 14), alc, 0.12, -0.02, 0, { rz: Math.PI / 2 }));
  const hub = mesh(new THREE.BoxGeometry(0.04, 0.08, 0.15), leather, 0, -0.02, 0); yoke.add(hub); yoke.add(mesh(new THREE.BoxGeometry(0.04, 0.03, 0.26), alu, -0.01, -0.04, 0));
  [-1, 1].forEach((s) => { const grip = mesh(new THREE.CapsuleGeometry(0.03, 0.2, 4, 12), leather, 0, 0.03, s * 0.17); yoke.add(grip); yoke.add(mesh(new THREE.CapsuleGeometry(0.026, 0.12, 4, 10), leather, 0, -0.06, s * 0.1, { rx: Math.PI / 2 })); });
  yoke.add(mesh(new THREE.CapsuleGeometry(0.026, 0.3, 4, 10), leather, 0, -0.07, 0, { rx: Math.PI / 2 }));
  // the pillars, the door cards, the floor
  [-0.82, 0.82].forEach((z) => { g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.75, 10), alc, 0.62, 1.12, z * 0.95, { rz: -0.95 })); g.add(mesh(new THREE.BoxGeometry(1.6, 0.4, 0.06), leather, -0.2, 0.7, z)); g.add(mesh(new THREE.BoxGeometry(1.4, 0.03, 0.04), alu, -0.2, 0.9, z * 0.97)); });
  g.add(mesh(new THREE.BoxGeometry(2.0, 0.04, 1.5), alc, -0.1, 0.4, 0));
  // your hands on the yoke
  g.userData.HL = makeHand(-1); g.userData.HR = makeHand(1); yoke.add(g.userData.HL.root, g.userData.HR.root);
  return g; }
function poseCockpit(cp, ts, steer = 0, grip = 1, tremble = 0.1) { const y = cp.userData.yoke; y.rotation.x = steer; const H = [cp.userData.HL, cp.userData.HR];
  H.forEach((h, i) => { const s = i ? 1 : -1; h.root.position.set(-0.045, 0.0, s * 0.235); const Y = new THREE.Vector3(0.3, -0.12, -s * 1).normalize(), Z0 = new THREE.Vector3(-1, 0.25, 0).normalize(), Z = Z0.addScaledVector(Y, -Z0.dot(Y)).normalize(), X = new THREE.Vector3().crossVectors(Y, Z); h.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    poseHand(h, { curl: [0.85 * grip, 0.9 * grip, 0.92 * grip, 0.95 * grip], spread: 0.1, thumb: 0.5 * grip, tremble }); }); }
// a radial zoom blur (2D) for the launch and the speed
let ZBC = null;
function zoomBlur(k, cx = CX, cy = H * 0.45) { if (k <= 0.01) return; if (!ZBC) { ZBC = document.createElement('canvas'); ZBC.width = W; ZBC.height = H; } const x = ZBC.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0);
  ctx.save(); screen(); for (let i = 1; i <= 7; i++) { const s = 1 + k * 0.035 * i; ctx.globalAlpha = 0.16 * (1 - i / 9); ctx.drawImage(ZBC, cx - cx * s, cy - cy * s, W * s, H * s); } ctx.restore(); }
// cut the cabin out of the body while you sit inside (clipping planes follow the car)
const CABIN = { planes: [new THREE.Plane(), new THREE.Plane(), new THREE.Plane()], on: false };
function cabinCut(car, on) { const R = r3().r; R.localClippingEnabled = true; const m = car.userData.paint; car.updateMatrixWorld(true);
  if (!on) { m.clippingPlanes = null; m.needsUpdate = true; return; }
  const M = car.matrixWorld, N = new THREE.Matrix3().getNormalMatrix(M), mk = (n, p, i) => CABIN.planes[i].setFromNormalAndCoplanarPoint(n.clone().applyMatrix3(N).normalize(), p.clone().applyMatrix4(M));
  mk(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.62, 0, 0), 0); mk(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-1.75, 0, 0), 1); mk(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.66, 0), 2);
  m.clippingPlanes = CABIN.planes; m.clipIntersection = true; m.side = THREE.DoubleSide; m.needsUpdate = true; }
// cold-gas plumes from the rear nozzles and the corner thrusters (white, translucent, flickering)
function addPlumes(car) { const tex = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(235,242,250,0.55)'); g.addColorStop(1, 'rgba(220,230,245,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 128); tex.center.set(0.5, 0.5); tex.rotation = Math.PI;
  const mk = () => new THREE.Mesh(new THREE.ConeGeometry(0.34, 2.2, 16, 1, true).translate(0, -1.1, 0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0, color: 0xf4f8ff }));
  const pl = []; [-0.5, 0, 0.5].forEach((z) => { const g = new THREE.Group(); g.position.set(-2.45, 0.58, z); g.rotation.z = -Math.PI / 2; const m = mk(); g.add(m); car.add(g); pl.push({ g, m, rear: true }); });
  car.userData.P.miniPts.forEach(([x, y, z]) => { const g = new THREE.Group(); g.position.set(x, 0.25, z); const m = mk(); m.scale.setScalar(0.6); g.add(m); car.add(g); pl.push({ g, m, rear: false }); });
  car.userData.plumes = pl; }
function posePlumes(car, rear, down, ts) { (car.userData.plumes || []).forEach((p, i) => { const k = p.rear ? rear : down; p.m.material.opacity = 0.75 * k; p.g.scale.set(1, (0.6 + 0.6 * k) * (1 + 0.12 * Math.sin(ts * 40 + i * 2)), 1); p.g.visible = k > 0.02; }); }

// redraw the car's screen only when what it shows changes
function drawScreen(cp, kmh, mode, thr) { const key = kmh + '|' + mode + '|' + thr; if (cp.userData.scKey === key) return; cp.userData.scKey = key; const x = cp.userData.scv.getContext('2d'), w = 384, h = 640;
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e1218'); gr.addColorStop(1, '#1a2230'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.textAlign = 'left'; x.fillStyle = '#e8eef6'; x.font = 'bold 40px sans-serif'; x.fillText('ROADSTER', 30, 70); x.font = '24px sans-serif'; x.fillStyle = '#8fd0ff'; x.fillText(mode, 30, 110);
  const f = clamp(kmh / 400); x.strokeStyle = '#2a3446'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h * 0.5, 120, Math.PI * 0.75, Math.PI * 2.25); x.stroke(); x.strokeStyle = f > 0.7 ? '#ff6a3a' : '#3fa4f0'; x.beginPath(); x.arc(w / 2, h * 0.5, 120, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * f)); x.stroke();
  x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = `bold ${kmh >= 1000 ? 64 : 90}px sans-serif`; x.fillText(String(kmh), w / 2, h * 0.53); x.font = '28px sans-serif'; x.fillText('km/h', w / 2, h * 0.6);
  x.fillStyle = thr ? '#c8372d' : '#2a3446'; x.fillRect(40, h - 110, w - 80, 60); x.fillStyle = '#fff'; x.font = 'bold 28px sans-serif'; x.fillText(thr ? 'PROPULSORES ON' : 'PROPULSORES', w / 2, h - 70); cp.userData.scr.needsUpdate = true; }

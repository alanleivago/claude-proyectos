
// =====================================================================
//  SHOTS — the plaza from your seat (cafe → sun), then three places seen from above: the cemetery, the airfield, the city
// =====================================================================
const SHOT_FN = {}, STG = {};
const once = (k, f) => STG[k] || (STG[k] = f());
const fov = (st, f) => { st.cam.fov = f; st.cam.updateProjectionMatrix(); };
function plazaStage() { return once('plaza', () => { const st = makeStage({ hemi: 0.75, sky: 0xc8c8f0, ground: 0x7a6050, key: 2.6, keyCol: '#ffc890', box: 30, boxFar: 420, fog: '#c8a8b0', fogNear: 250, fogFar: 5200, sunDist: 200, far: 40000 });
  st.setSun(SUN_DIR, new THREE.Vector3(0, 0, -10)); skyEnv(st, '#4a58a8', '#e8b8a8', SUN_DIR, '#ffb070'); heavenDome(st); const S = buildPlaza(st); addWatch(S); return S; }); }
// a look from your seat: yaw (degrees, 0 = across the table toward the plaza, + = left) and pitch
function lookP(st, yaw, pitch, f = 58, dp = [0, 0, 0]) { const x = EYE[0] + dp[0], y = EYE[1] + dp[1], z = EYE[2] + dp[2], a = yaw * DEG, p = pitch * DEG; camLook(st.cam, x, y, z, x - Math.sin(a) * 10 * Math.cos(p), y + 10 * Math.sin(p), z - Math.cos(a) * 10 * Math.cos(p)); fov(st, f); }
// your left hand and the watch: Mom's message
function watchTex() { return g3Tex((x, w, h) => { x.fillStyle = '#05060a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = '600 26px Arial, sans-serif'; x.fillText('vie 18', w / 2, 40); x.font = 'bold 84px Arial, sans-serif'; x.fillText('19:51', w / 2, 122);
  x.fillStyle = '#2a2c34'; x.beginPath(); x.roundRect(14, 150, w - 28, 120, 22); x.fill(); x.fillStyle = '#4cd964'; x.beginPath(); x.arc(44, 182, 14, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = 'bold 28px Arial, sans-serif'; x.fillText('Mamá', 68, 192); x.font = '26px Arial, sans-serif'; x.fillText('¿Lo estás viendo?', 28, 240); }, 256, 300); }
function addWatch(S) { const st = S.st; S.HL = makeHand(-1, { sleeve: '#2a3a5a' }); st.scene.add(S.HL.root); S.HL.root.visible = false;
  const w = new THREE.Group(); S.HL.fore.add(w); w.position.set(0, -0.05, 0); const band = STDm({ color: '#1a1a1e', roughness: 0.6 });
  w.add(mesh(new THREE.TorusGeometry(0.036, 0.007, 8, 32).rotateX(Math.PI / 2).scale(1, 1, 0.8), band)); w.add(mesh(new THREE.BoxGeometry(0.044, 0.036, 0.01), STDm({ color: '#2a2a2e', metalness: 0.8, roughness: 0.25 }), 0, 0, 0.032));
  S.watchScr = mesh(new THREE.PlaneGeometry(0.031, 0.038), new THREE.MeshBasicMaterial({ map: watchTex(), toneMapped: false }), 0, 0, 0.0376); S.watchScr.rotation.z = Math.PI / 2; w.add(S.watchScr); S.watch = w; }
function placeWatch(S, cam, k, t) { cam.updateMatrixWorld(true); const H = S.HL; H.root.visible = k > 0.01; if (!H.root.visible) return;
  const Y = new THREE.Vector3(0.82, 0.42, -0.25).normalize(), Zc = new THREE.Vector3(0.1, 0.35, 1).normalize(), Z = Zc.clone().addScaledVector(Y, -Zc.dot(Y)).normalize(), X = new THREE.Vector3().crossVectors(Y, Z);
  const M = new THREE.Matrix4().makeBasis(X, Y, Z); H.root.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromRotationMatrix(M));
  H.root.position.copy(cam.position).add(new THREE.Vector3(0.05, lerp(-0.45, -0.02, k) + 0.003 * Math.sin(t * 7), -0.42).applyQuaternion(cam.quaternion)); poseHand(H, { curl: [0.35, 0.4, 0.45, 0.5], spread: 0.15, thumb: 0.3, tremble: 0.6 }); }
function plazaShot(yawK, pitchK, fovK) { return (lt, dur, t) => { const S = plazaStage(), st = S.st, sky = heavenState(t); posePlaza(S, t, sky);
  lookP(st, knots(yawK, t), knots(pitchK, t), knots(fovK, t)); handheld(st.cam, t, 0.6 + 2.5 * HV.uFlash.value, 1); placeWatch(S, st.cam, 0, t);
  renderStage(st, 1.0 + 0.05 * sky.open * (1 - sky.night)); bloom(0.3 + 0.2 * sky.open + 0.6 * HV.uFlash.value); if (t < 46) lensFlare(st, SUN_DIR, 0.5); }; }
SHOT_FN.cafe = plazaShot([[0, 0], [3.8, 2], [5.5, -24], [7.6, -30], [9.0, 28], [10.6, 4], [12.5, 0]], [[0, -7], [3.8, -6], [5.5, 2], [9.0, -2], [10.6, -6], [12.5, -2]], [[0, 52], [12.5, 50]]);
SHOT_FN.bolt = (lt, dur, t) => { const S = plazaStage(), st = S.st, sky = heavenState(t); posePlaza(S, t, sky);
  const y = knots([[12.5, 18], [14.0, -10], [14.6, 0], [17, 0]], t), p = knots([[12.5, 30], [14.0, 26], [14.8, -4], [17, -3]], t), f = knots([[12.5, 64], [14.0, 62], [14.8, 40], [17, 36]], t);
  lookP(st, y, p, f); handheld(st.cam, t, 0.8 + 4 * HV.uFlash.value, 2); placeWatch(S, st.cam, 0, t); renderStage(st, 1.0 + 0.6 * HV.uFlash.value); bloom(0.35 + 0.8 * HV.uFlash.value); };
SHOT_FN.light = plazaShot([[17, 10], [24, 15]], [[17, 12], [20, 32], [24, 34]], [[17, 64], [24, 56]]);
SHOT_FN.kneel = plazaShot([[24, 42], [25.6, 8], [26.4, -16], [28.0, -22], [30, -44]], [[24, -4], [26, -6], [30, -3]], [[24, 50], [30, 48]]);
SHOT_FN.watch = (lt, dur, t) => { const S = plazaStage(), st = S.st, sky = heavenState(t); posePlaza(S, t, sky);
  lookP(st, 4, knots([[30, -14], [31.2, -24], [34, -26]], t), 48); handheld(st.cam, t, 0.8, 3); placeWatch(S, st.cam, ss(30.1, 31.0, t), t); renderStage(st, 1.15); bloom(0.45); };
SHOT_FN.rise = (lt, dur, t) => { const S = plazaStage(), st = S.st, sky = heavenState(t); posePlaza(S, t, sky); const rz = risen(t, T_RISE + 0.3), p = Math.atan2(rz - 0.05, 1.6 + 0.4 * rz) / DEG;
  lookP(st, 0, Math.max(-5, Math.min(62, p)), lerp(46, 60, ss(35, 40, t))); handheld(st.cam, t, 0.6, 7); placeWatch(S, st.cam, 0, t); renderStage(st, 1.0); bloom(0.45); };
SHOT_FN.crutch = plazaShot([[40, 4], [41.2, 26], [46, 30]], [[40, -14], [41.2, -6], [46, -2]], [[40, 48], [41.2, 40], [46, 46]]);
SHOT_FN.sun = plazaShot([[46, 70], [48, 93], [54, 95]], [[46, 4], [48, 9], [51, 10], [54, 20]], [[46, 56], [48.5, 42], [54, 46]]);
SHOT_FN.sun2 = plazaShot([[50.5, 99], [54, 99.5]], [[50.5, 9.5], [54, 10.5]], [[50.5, 24], [54, 19]]);
SHOT_FN.grave2 = (lt, dur, t) => { const S = once('grave', buildGrave), st = S.st; heavenState(t); poseGrave(S, t); const k = EZ.io(seg(t, 57.5, 61)), y0 = hy(3, 4);
  camLook(st.cam, lerp(3.5, 2.5, k), y0 + 1.3, lerp(5, 3, k), -3, y0 + lerp(10, 16, k), -24); fov(st, 62); handheld(st.cam, t, 0.8, 8); renderStage(st, 1.1); bloom(0.6); };
SHOT_FN.grave = (lt, dur, t) => { const S = once('grave', buildGrave), st = S.st; heavenState(t); poseGrave(S, t); const k = EZ.io(seg(t, 54, 61));
  camLook(st.cam, lerp(-6, 4, k), lerp(44, 30, k), lerp(46, 30, k), 0, hy(0, -22), -22); fov(st, 56); handheld(st.cam, t, 0.8, 4); renderStage(st, 1.1); bloom(0.6); };
SHOT_FN.jets = (lt, dur, t) => { const S = once('jets', buildJets), st = S.st; heavenState(t); poseJets(S, t); const k = EZ.io(seg(t, 61, 66.5));
  camLook(st.cam, lerp(-34, -42, k), lerp(14, 10, k), lerp(46, 36, k), lerp(-52, -46, k), 2, -40); fov(st, 54); handheld(st.cam, t, 0.8, 5); renderStage(st, 1.1); bloom(0.5); };
SHOT_FN.city = (lt, dur, t) => { const S = once('city', buildCity), st = S.st; heavenState(t); const k = EZ.io(seg(t, 66.5, 72)), a = -15 * DEG, p = lerp(30, 35, k) * DEG, e = [0, 1.7, lerp(70, 60, k)];
  camLook(st.cam, e[0], e[1], e[2], e[0] + Math.sin(a) * Math.cos(p) * 10, e[1] + Math.sin(p) * 10, e[2] - Math.cos(a) * Math.cos(p) * 10); fov(st, lerp(68, 60, k)); handheld(st.cam, t, 0.7, 6);
  renderStage(st, 1.0); bloom(0.5 + 0.4 * ss(67, 71, t)); figureIn(st, ss(68.0, 71.0, t), t); };
SHOT_FN.card = () => {};

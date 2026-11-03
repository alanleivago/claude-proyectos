// =====================================================================
//  THUMB mode (thumbnails only; src/ untouched). sceneMain override: t in [0,10) = A, [10,20) = B, [20,30) = C.
//  The set functions stage their beat as usual; present() is overridden so a per-variant hook (TH.pre) can
//  re-pose the hero, add props and re-aim the camera right before the frame is rendered. No HUD / captions.
// =====================================================================
const TH = { pre: null, A: null, B: null, C: null };
function present(g, scene, o = {}) {
  if (TH.pre) { TH.pre(g, scene, o); }
  g.r.setClearColor(lin(o.clear ?? '#000000'), 1); g.r.clear(); g.r.render(scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  bloom(o.bloom ?? 0.22);
}
// shotCam override: when TH.cam is set, every set's camera call is replaced by it
function shotCam(g, pos, tgt, mm = 35, drift = 1, t = TT) {
  if (TH.cam) { [pos, tgt, mm] = TH.cam; drift = 0; }
  const n = (a, b, c) => Math.sin(t * a + b) * c * drift;
  const cam = g.cam; cam.fov = 2 * Math.atan(12 / mm) / DEG;
  cam.position.set(pos[0] + n(0.5, 0.3, 0.012), pos[1] + n(0.7, 1.1, 0.008), pos[2] + n(0.4, 2.2, 0.01));
  cam.up.set(0, 1, 0); cam.lookAt(tgt[0] + n(0.6, 0.9, 0.006), tgt[1] + n(0.8, 0.2, 0.006), tgt[2]);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return cam;
}
function chPose(o = {}) { if (TH.poseOvr) o = Object.assign({}, o, TH.poseOvr); return chPoseRig(chBuild(), o); }
const thRow = (shot) => BEAT_ROWS.find((r) => r.shot === shot);
function thBeat(shot, s) { const row = thRow(shot), b = Object.assign({}, row), t = row.t0 + s; b.k = seg(t, b.t0, b.t1); return [t, b]; }
// deterministic scatter helpers
function thMat4(p, e, s) { return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(e), s); }

// ---------------- text block
const TH_FONT = '"Futura", "Helvetica Neue", Arial, sans-serif';
function thBlock(lines) {   // lines: [{ txt, size, y, color, font, weight, spacing, italic, stroke }]
  lines.forEach((L) => {
    ctx.save(); screen();
    ctx.font = `${L.italic ? 'italic ' : ''}${L.weight ?? 800} ${L.size}px ${L.font ?? TH_FONT}`;
    ctx.textAlign = L.align ?? 'left'; ctx.textBaseline = 'alphabetic'; if (L.spacing) ctx.letterSpacing = L.spacing + 'px';
    const x = L.x ?? 96;
    // drop shadow + dark stroke for phone-size legibility
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = L.size * 0.28; ctx.shadowOffsetY = L.size * 0.06;
    if (L.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = L.stroke; ctx.strokeStyle = L.strokeCol ?? 'rgba(20,12,6,0.95)'; ctx.strokeText(L.txt, x, L.y); }
    ctx.shadowColor = 'transparent';
    if (L.grad) { const gr = ctx.createLinearGradient(0, L.y - L.size * 0.8, 0, L.y); L.grad.forEach(([o, c]) => gr.addColorStop(o, c)); ctx.fillStyle = gr; } else ctx.fillStyle = L.color ?? '#fff';
    ctx.fillText(L.txt, x, L.y);
    ctx.restore();
  });
}
function thLeftShade(a = 0.7, w = 0.62) {
  ctx.save(); screen(); const g = ctx.createLinearGradient(0, 0, W * w, 0);
  g.addColorStop(0, `rgba(6,8,14,${a})`); g.addColorStop(0.5, `rgba(6,8,14,${a * 0.6})`); g.addColorStop(1, 'rgba(6,8,14,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function thGrade(sat = 1.25, con = 1.08) { ctx.save(); screen(); ctx.filter = `saturate(${sat}) contrast(${con})`; ctx.drawImage(ctx.canvas, 0, 0); ctx.filter = 'none'; ctx.restore(); }
function thVignette(a = 0.45) { ctx.save(); screen(); const vg = ctx.createRadialGradient(W * 0.6, H * 0.5, H * 0.35, W * 0.6, H * 0.5, H * 1.1); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// =====================================================================
//  A — "TOO LUCKY": the storm hits everyone but him. Hero cheering in a sunbeam, lightning all around,
//      coins + bills raining on him, the crowd of losers behind in the red-lit rain.
// =====================================================================
const TH_A = { hero: [8, 0.04, 6.4], heroRot: 272 };
function thBuildA(g) {
  if (TH.A) return TH.A;
  const S = ST.scene, grp = new THREE.Group(); S.add(grp); const A = { grp };
  const R = RNG('th-a');
  // crowd of losers (sculpted extras)
  A.crowd = [];
  for (let i = 0; i < 16; i++) { const X = chExtra(300 + i, { lod: i < 6 ? 0 : 1 }); grp.add(X.root); A.crowd.push(X); }
  // lightning: several bolts striking the street / yards around him
  A.bolts = [
    [[34, 44, -8], [17, 0.1, 1.8], 'a'], [[40, 44, 20], [21, 0.1, 9.8], 'b'], [[26, 42, 30], [15, 0.1, 10.8], 'c'],
    [[60, 46, 0], [32, 0.1, 4], 'd'], [[70, 50, -30], [40, 0.1, -1], 'e'], [[50, 46, 30], [27, 0.1, 13], 'f'],
  ].map(([a, b, s]) => { const B = stBolt(a, b, 'th' + s, grp); B.visible = true; return B; });
  // ground sparks at the bolt feet
  A.sparks = A.bolts.map((B, i) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex.w, color: lin('#dfe8ff'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); grp.add(sp); return sp; });
  // gold coins + bills raining on him
  const gold = new THREE.MeshStandardMaterial({ color: lin('#ffcf4a'), metalness: 1, roughness: 0.22, envMap: ST.envs.sunny, envMapIntensity: 2.2 });
  const coinG = new THREE.CylinderGeometry(0.075, 0.075, 0.012, 40, 1);
  A.coins = new THREE.InstancedMesh(coinG, gold, 300); A.coins.castShadow = false; A.coins.frustumCulled = false; grp.add(A.coins);
  const bt = stTexBill(); const billM = new THREE.MeshStandardMaterial({ map: bt, color: lin('#cfe6c0'), roughness: 0.75, side: THREE.DoubleSide });
  const billG = new THREE.PlaneGeometry(0.31, 0.135, 6, 1); { const P = billG.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, 0.02 * Math.sin(P.getX(i) * 14)); billG.computeVertexNormals(); }
  A.bills = new THREE.InstancedMesh(billG, billM, 80); A.bills.castShadow = false; A.bills.frustumCulled = false; grp.add(A.bills);
  const h = TH_A.hero, m = new THREE.Matrix4();
  for (let i = 0; i < 300; i++) {
    const pile = i < 140; let x, y, z;
    if (pile) { const a = R.r(0, TAU), r = 0.35 + Math.pow(R.f(), 0.7) * 1.6; x = h[0] + Math.cos(a) * r; z = h[2] + Math.sin(a) * r; y = 0.05 + R.r(0, 0.03) + Math.max(0, 0.18 - r * 0.08) * R.f(); }
    else { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 2.2; x = h[0] + Math.cos(a) * r; z = h[2] + Math.sin(a) * r; y = R.r(0.3, 5.5); if (x < h[0] - 1.2) { x += 1.6; } if (x < h[0] + 0.3 && Math.abs(z - h[2]) < 0.7 && y < 2.2) { x += 1.4; } }
    A.coins.setMatrixAt(i, thMat4(V3(x, y, z), pile ? new THREE.Euler(R.n(0.25), R.r(0, TAU), R.n(0.25)) : new THREE.Euler(R.r(0, TAU), R.r(0, TAU), R.r(0, TAU)), V3(1, 1, 1)));
  }
  for (let i = 0; i < 80; i++) { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 2.4, y = i < 25 ? 0.07 : R.r(0.4, 5); const bx = Math.cos(a) * r < -1.2 && i >= 25 ? 1.8 : 0;
    A.bills.setMatrixAt(i, thMat4(V3(h[0] + Math.cos(a) * r + bx, y, h[2] + Math.sin(a) * r), i < 25 ? new THREE.Euler(-Math.PI / 2 + R.n(0.1), 0, R.r(0, TAU)) : new THREE.Euler(R.r(0, TAU), R.r(0, TAU), R.r(0, TAU)), V3(1, 1, 1))); }
  A.flash = A.bolts.slice(0, 3).map((B) => { const L = new THREE.PointLight(lin('#cfdcff'), 8, 6, 1.6); L.position.copy(B.children[2].position).setY(1.2); grp.add(L); return L; });
  // lights: warm key on the hero, red wash on the crowd
  A.key = new THREE.SpotLight(lin('#ffe6c4'), 5, 30, 0.32, 0.6, 1.2); A.key.position.set(h[0] - 6, 8, h[2] - 3); A.key.target.position.set(h[0], 1.1, h[2]); A.key.castShadow = true; A.key.shadow.mapSize.set(1024, 1024); A.key.shadow.bias = -0.0005; grp.add(A.key, A.key.target);
  A.reds = [[13, 1.4, 4.5], [13, 1.4, 8.5], [17.5, 1.4, 6.5], [22, 1.4, 6.5]].map((p) => { const L = new THREE.PointLight(lin('#ff3a2a'), 14, 6, 1.6); L.position.set(...p); grp.add(L); return L; });
  TH.A = A; return A;
}
function thPreA(g, scene) {
  const A = thBuildA(g), h = TH_A.hero;
  if (scene !== ST.scene) return;
  stWeather('storm', 'storm', 0, { hemiK: 1.0, gain: 0.6 });
  ST.grp.hole.visible = true; ST.bolts.tree.visible = ST.bolts.car.visible = false;
  // hero: cheering, joyful, looking at the camera
  chPose({ pose: [['cheer', 1]], expr: 'joy', rot: TH_A.heroRot, pos: h, look: [-4, -2], t: 3.3, add: { neck: [10, 0, 0], head: [16, 4, 6], spine: [0, 0, 0], shL: [0, 0, -8], shR: [0, 0, 12] } });
  ST.chBlob.visible = true; ST.chBlob.position.set(h[0], 0.045, h[2]);
  // crowd: rows along the sidewalk / street, facing him, sad / worried / shocked
  const R = RNG('th-a-crowd');
  A.crowd.forEach((X, i) => {
    const row = Math.floor(i / 5), j = i % 5, x = h[0] + 3.2 + row * 2.4 + R.r(-0.4, 0.4), z = 3.4 + j * 1.55 + (row % 2) * 0.7 + R.r(-0.25, 0.25);
    const dx = h[0] - x, dz = h[2] - z, rot = Math.atan2(dx, dz) / DEG + R.r(-20, 20);
    const kind = ['sad', 'sad', 'shrug', 'sad', 'sad', 'shrug', 'sad'][i % 7];
    X.pose({ pose: kind, expr: kind === 'shrug' ? 'worried' : 'sad', rot, pos: [x, 0.04, z], t: 2 + i });
  });
  A.bolts.forEach((B, i) => { const sp = A.sparks[i], foot = B.children[2].position; sp.position.copy(foot).setY(0.5); sp.scale.set(5, 5, 1); });
  // camera: low, from the house side, looking out at him with the street + storm behind
  shotCam(g, [h[0] - 3.0, 0.85, h[2] + 0.3], [h[0] + 2, 1.65, h[2] - 1.75], 26, 0, 3);
  stRainUpdate(3, g.cam, [h[0], h[2], 2.2]);
}
function thA() {
  const g = g3(); const [t, b] = thBeat('strikes', 2.0);
  if (!ST) stBuild(g);
  TH.pre = thPreA; setStreet(g, t, b); TH.pre = null;
  thGrade(1.2, 1.1);
  thLeftShade(0.75, 0.6); thVignette(0.4);
  thBlock([
    { txt: 'YOU ARE', size: 64, y: 250, color: '#ffffff', spacing: 8, weight: 700 },
    { txt: 'TOO LUCKY', size: 172, y: 430, grad: [[0, '#fff27a'], [1, '#ffc21a']], stroke: 14 },
    { txt: 'PEOPLE WHO LOST', size: 46, y: 590, color: '#ff8a7a', spacing: 6, weight: 700 },
    { txt: '1,000,000,000', size: 128, y: 720, color: '#ff4a3a', stroke: 10 },
  ]);
}

// =====================================================================
//  B — "IT MISSED": a Little-Prince Earth, the coin standing on its edge on top of it, the hero balancing on
//      the coin's rim, the asteroid swerving around him with a burning trail.
// =====================================================================
const TH_B = { cr: 4.5, hs: 5, sun: [-0.45, 0.55, 0.7], up: [-0.5, 0.25, 0.83],
  cam: [[5.5, 50 + 17.2, 22.6], [-5.6, 50 + 10, 0], 30],
  expr: [['joy', 0.85], ['smug', 0.15]],
  add: { shL: [0, 0, -18], shR: [0, 0, 10], hipL: [-12, 0, 2], hipR: [6, 0, 1], knL: [22, 0, 0], knR: [8, 0, 0], spine: [0, 8, -4], neck: [10, 0, 0], head: [14, -6, 6] } };
function thBuildB(g) {
  if (TH.B) return TH.B;
  const SP = isS.space, grp = new THREE.Group(); SP.scene.add(grp); const B = { grp };
  const RE = SP.RE, cs = TH_B.cr / 0.028;
  B.coin = new THREE.Mesh(isS.coin.geometry, isS.coin.material); B.coin.scale.setScalar(cs);
  // coin on its edge at the north pole (axis along x)
  B.coin.rotation.set(0, 0, Math.PI / 2); B.coin.rotation.y = 0.5; B.coin.position.set(0, RE + TH_B.cr - 0.05, 0); grp.add(B.coin);
  B.key = new THREE.DirectionalLight(lin('#fff0dc'), 2.4); grp.add(B.key, B.key.target);
  B.fill = new THREE.HemisphereLight(lin('#9fc0ff'), lin('#2a3a5a'), 0.9); grp.add(B.fill);
  B.rim = new THREE.DirectionalLight(lin('#ffb070'), 2.2); grp.add(B.rim, B.rim.target);
  // asteroid fire trail: additive glow sprites along a bent path
  const glow = g3Radial([[0, 'rgba(255,240,200,1)'], [0.25, 'rgba(255,170,80,0.7)'], [0.6, 'rgba(255,90,30,0.2)'], [1, 'rgba(255,60,20,0)']]);
  B.trail = []; for (let i = 0; i < 70; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); grp.add(sp); B.trail.push(sp); }
  TH.B = B; return B;
}
function thPreB(g, scene) {
  const SP = isS.space; if (scene !== SP.scene) return;
  const B = thBuildB(g), RE = SP.RE, U = SP.U, cr = TH_B.cr, grp = B.grp;
  // a local frame whose +y is a nice spot on the globe (ocean + clouds, not the polar cap)
  const d = V3(...TH_B.up).normalize(); grp.quaternion.setFromUnitVectors(V3(0, 1, 0), d); grp.updateMatrixWorld(true);
  const W = (x, y, z) => grp.localToWorld(V3(x, y, z));
  const sunL = V3(...TH_B.sun).normalize(), sun = sunL.clone().applyQuaternion(grp.quaternion); U.uSun.value.copy(sun); SP.sunL.position.copy(sun).multiplyScalar(100);
  B.key.position.copy(sunL).multiplyScalar(60).add(V3(0, RE, 0)); B.key.target.position.set(0, RE + 10, 0);
  B.rim.position.set(30, RE + 15, -40); B.rim.target.position.set(0, RE + 15, 0);
  SP.trail.visible = false;
  // hero on the rim: one fist up, the other arm out for balance
  const rig = chBuild(); if (rig.root.parent !== grp) grp.add(rig.root); rig.root.visible = true;
  if (SP.rock.parent !== grp) grp.add(SP.rock);
  const top = RE + 2 * cr - 0.32;
  chPose({ pose: [['cheer', 1]], expr: TH_B.expr, rot: 16, pos: [0.0, top, 0.0], t: 1.2, look: [0, 4], ground: false,
    add: TH_B.add });
  rig.root.scale.setScalar(TH_B.hs);
  // the asteroid: comes in from the upper left, bends around him, leaves to the right
  const Q0 = V3(-10, RE + 1, -26), Q1 = V3(9, RE + 9, -12), Q2 = V3(6.5, RE + 15.5, -9), P = (u) => Q0.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(Q1, 2 * u * (1 - u)).addScaledVector(Q2, u * u);
  const head = 1, ap = P(head); SP.rock.position.copy(ap); SP.rock.scale.setScalar(2.4); SP.rock.rotation.set(0.6, 1.1, 0.3);
  B.trail.forEach((sp, i) => { const u = head - 0.02 - i * 0.011; const p = P(u); sp.position.copy(p); const k = 1 - i / B.trail.length; sp.scale.setScalar(lerp(0.8, 6.5, k * k)); sp.material.opacity = k * 0.8; });
  SP.earthGlow.position.set(0, 0, 0); SP.earthGlow.target.position.copy(W(ap.x, ap.y, ap.z));
  const C = TH_B.cam, cam = g.cam, cp = W(...C[0]), tg = W(...C[1]);
  cam.fov = 2 * Math.atan(12 / C[2]) / DEG; cam.position.copy(cp); cam.up.copy(d); cam.lookAt(tg);
  cam.far = 6000; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); U.uCam.value.copy(cam.position);
}
function thB() {
  const g = g3(); const [t, b] = thBeat('asteroid', 4);
  TH.pre = thPreB; setIsland(g, t, b); TH.pre = null;
  thGrade(1.2, 1.08);
  thLeftShade(0.6, 0.55); thVignette(0.35);
  thBlock([
    { txt: 'THE ASTEROID', size: 58, y: 270, color: '#ffffff', spacing: 7, weight: 700 },
    { txt: 'MISSED', size: 220, y: 470, grad: [[0, '#fff27a'], [1, '#ffc21a']], stroke: 14 },
    { txt: 'Of course it did.', size: 74, y: 640, color: '#ffffff', font: HD.serif, weight: 400, italic: true },
  ]);
}

// =====================================================================
//  C — "BANNED": the roulette table erupts (the 'forty' beat), re-framed so he is on the right.
// =====================================================================
const TH_C = { s: [2.9], pose: { rot: 30, look: [-4, 2], add: { head: [6, 8, 0] } }, cam: [[1.45, 1.38, 1.75], [-1.05, 1.62, -0.9], 28] };
function thC() {
  const g = g3(); const [t, b] = thBeat('forty', TH_C.s[Math.min(TH_C.s.length - 1, Math.floor((TT - 20) * 2))]);
  TH.cam = TH_C.cam; TH.poseOvr = TH_C.pose; setCasino(g, t, b); TH.cam = null; TH.poseOvr = null;
  thGrade(1.2, 1.08);
  thLeftShade(0.78, 0.6); thVignette(0.35);
  thBlock([
    { txt: 'YOU ARE', size: 64, y: 260, color: '#ffffff', spacing: 8, weight: 700 },
    { txt: 'BANNED', size: 220, y: 460, grad: [[0, '#fff27a'], [1, '#ffc21a']], stroke: 14 },
    { txt: 'WINS IN A ROW', size: 46, y: 590, color: '#ff8a7a', spacing: 6, weight: 700 },
    { txt: '40', size: 150, y: 735, color: '#ff4a3a', stroke: 10 },
  ]);
}

function sceneMain() {
  const t = TT;
  if (t < 10) return thA();
  if (t < 20) return thB();
  if (t < 30) return thC();
  fillAll('#222');
}

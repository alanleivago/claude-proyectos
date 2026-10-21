// =====================================================================
//  WORLD — "¿Te pueden robar con un lector?" (three.js r149, metres). Three places:
//  the stage (origin: a dark void with a faint grid, for the card, the terminal, the chip and the codes),
//  the metro car (x = 100: the thief behind the victim) and the shop counter (x = 200: the tap and the PIN).
// =====================================================================
const CW = 0.0856, CH = 0.054, CD = 0.0008;   // a bank card
// ---- canvas textures
function cardFace(copy) {
  const c = document.createElement('canvas'); c.width = 856; c.height = 540; const x = c.getContext('2d');
  if (copy) { x.fillStyle = '#f4f2ee'; x.fillRect(0, 0, 856, 540); x.fillStyle = '#e8283a'; x.font = `700 92px ${S3.font}`; x.fillText('COPIA', 60, 140); }
  else { const g = x.createLinearGradient(0, 0, 856, 540); g.addColorStop(0, '#0fa894'); g.addColorStop(0.55, '#1a6ad0'); g.addColorStop(1, '#3a3ab8'); x.fillStyle = g; x.fillRect(0, 0, 856, 540);
    x.fillStyle = 'rgba(255,255,255,0.08)'; x.beginPath(); x.arc(760, 80, 300, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.font = `700 44px ${S3.font}`; x.fillText('BANCO NUBE', 540, 90); }
  x.fillStyle = '#d8b04a'; x.beginPath(); x.roundRect(70, 200, 120, 92, 14); x.fill(); x.strokeStyle = 'rgba(80,60,20,0.6)'; x.lineWidth = 3; for (const [a, b, cc, d] of [[70, 246, 190, 246], [130, 200, 130, 292], [70, 222, 110, 222], [150, 270, 190, 270]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke(); }
  x.strokeStyle = copy ? '#9a9a9a' : '#fff'; x.lineWidth = 7; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(230, 246, 22 + k * 16, -0.7, 0.7); x.stroke(); }
  x.fillStyle = copy ? '#5a5a62' : '#fff'; x.font = `700 54px ${S3.font}`; x.fillText(copy ? '4821 6630 1207 4821' : '••••  ••••  ••••  4821', 70, 400); x.font = `700 32px ${S3.font}`; x.fillText(copy ? '' : 'L. HERRERA', 70, 470);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
}
function buildCard(copy = false) {
  const g = new THREE.Group(), face = new THREE.MeshStandardMaterial({ map: cardFace(copy), roughness: 0.35, metalness: 0.15, transparent: true });
  const body = new THREE.Mesh(rrBox(CW, CH, CD, 0.0032, 0.0003), new THREE.MeshStandardMaterial({ color: lin(copy ? '#e8e6e2' : '#1a4ab0'), roughness: 0.4, transparent: true })); g.add(body);
  const fg = new THREE.ShapeGeometry(rrShape(CW, CH, 0.0032), 8); { const p = fg.attributes.position, uv = []; for (let i = 0; i < p.count; i++) uv.push(p.getX(i) / CW + 0.5, p.getY(i) / CH + 0.5); fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
  const f = new THREE.Mesh(fg, face); f.position.z = CD / 2 + 0.0004; g.add(f);
  // x-ray parts: the antenna coil (4 loops) and the chip glow
  const coilM = new THREE.LineBasicMaterial({ color: lin('#7ae8ff'), transparent: true, opacity: 0, toneMapped: false }), coil = new THREE.Group();
  for (let k = 0; k < 4; k++) { const w = CW - 0.008 - k * 0.003, h = CH - 0.008 - k * 0.003, pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]].map(([a, b]) => V3(a, b, CD / 2 + 0.0008)); coil.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), coilM)); }
  g.add(coil);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('255,210,110'), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); glow.position.set(-CW / 2 + 0.0152, -0.0003, 0.002); glow.scale.set(0.03, 0.03, 1); g.add(glow);
  g.userData = { body: body.material, face, coilM, glow, chip: V3(-CW / 2 + 0.0152, -0.0003, CD / 2) };
  return g;
}
function cardXray(card, u, wake = 0) { const d = card.userData; d.face.opacity = 1 - 0.75 * u; d.body.opacity = 1 - 0.7 * u; d.face.depthWrite = d.body.depthWrite = u < 0.5; d.coilM.opacity = u * (0.6 + 0.4 * wake); d.coilM.color.set(wake > 0 ? '#c8f8ff' : '#7ae8ff'); d.glow.material.opacity = wake; d.glow.scale.setScalar(0.02 + 0.03 * wake); }
// the payment terminal: body + screen (canvas 300x300) + keypad
function termScreen(x, o = {}) {
  x.fillStyle = o.state === 'ok' ? '#0f5a32' : o.state === 'no' ? '#6a1420' : '#0c1220'; x.fillRect(0, 0, 300, 300); x.textAlign = 'center'; x.fillStyle = '#fff';
  if (o.state === 'ok') { x.font = `700 110px ${S3.font}`; x.fillText('✓', 150, 160); x.font = `700 34px ${S3.font}`; x.fillText('APROBADO', 150, 230); }
  else if (o.state === 'no') { x.font = `700 110px ${S3.font}`; x.fillText('✕', 150, 150); x.font = `700 34px ${S3.font}`; x.fillText('RECHAZADA', 150, 215); x.font = `700 20px ${S3.font}`; x.fillText('CÓDIGO YA USADO', 150, 252); }
  else { x.font = `700 22px ${S3.font}`; x.fillStyle = '#8a92a8'; x.fillText('TOTAL', 150, 60); x.fillStyle = '#fff'; x.font = `700 66px ${S3.font}`; x.fillText('$45,00', 150, 130); x.strokeStyle = '#7ae8ff'; x.lineWidth = 6; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(130, 210, 14 + k * 13, -0.8, 0.8); x.stroke(); } x.font = `700 18px ${S3.font}`; x.fillStyle = '#8a92a8'; x.fillText('ACERCA TU TARJETA', 150, 272); }
}
function buildTerminal() {
  const g = new THREE.Group(); g.add(mesh(rrBox(0.075, 0.16, 0.028, 0.01), std('#1a1c22', { r: 0.4, m: 0.2 })));
  const c = document.createElement('canvas'); c.width = c.height = 300; const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  const scr = mesh(new THREE.PlaneGeometry(0.062, 0.062), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, 0.042, 0.0152, { cast: false }); g.add(scr);
  const keyM = std('#2e323c', { r: 0.5 }); for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) g.add(mesh(rrBox(0.016, 0.011, 0.004, 0.003, 0.0005), keyM, -0.02 + k * 0.02, -0.004 - r * 0.016, 0.016));
  g.userData = { c, x: c.getContext('2d'), tex, scr: V3(0, 0.042, 0.016) };
  return g;
}
function paintTerm(t, o) { const u = t.userData; u.x.save(); termScreen(u.x, o); u.x.restore(); u.tex.needsUpdate = true; }
// a floating info card (canvas text): label + big value, accent bar
function buildInfo(label, value, accent = '#3fd0d6', w = 0.17, h = 0.065) {
  const c = document.createElement('canvas'); c.width = 680; c.height = 260; const x = c.getContext('2d');
  x.fillStyle = '#f6f3ec'; x.beginPath(); x.roundRect(0, 0, 680, 260, 26); x.fill(); x.fillStyle = accent; x.fillRect(0, 26, 14, 208);
  x.fillStyle = '#8a8680'; x.font = `700 34px ${S3.font}`; x.fillText(label, 48, 78); x.fillStyle = '#16161c'; x.font = `700 96px ${S3.font}`; x.fillText(value, 48, 196);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, side: THREE.DoubleSide })); m.visible = false; return m;
}
// ---- a standing person (faces +z); userData like the sitter's so pose() works
function buildStander(top, o = {}) {
  const g = new THREE.Group(), T = std(top, { r: 0.9 }), S = std(o.skin ?? '#a8714f', { r: 0.6 }), P = std(o.pants ?? '#24262e', { r: 0.8 }), Hm = std(o.hair ?? '#24170f', { r: 0.7 });
  for (const s of [-1, 1]) { g.add(mesh(new THREE.CapsuleGeometry(0.075, 0.72, 4, 10), P, s * 0.1, 0.46, 0)); g.add(mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), std('#1a1a1e'), s * 0.1, 0.035, 0.04)); }
  const torso = new THREE.Group(); torso.position.y = 0.88; torso.userData.y0 = 0.88; g.add(torso);
  torso.add(mesh(new THREE.CapsuleGeometry(0.17, 0.36, 6, 16), T, 0, 0.3, 0, { s: [1, 1, 0.72] }));
  const arms = [-1, 1].map((s) => { const sh = new THREE.Group(); sh.position.set(s * 0.22, 0.52, 0); sh.add(mesh(new THREE.CapsuleGeometry(0.05, 0.26, 4, 10), T, 0, -0.15, 0));
    const el = new THREE.Group(); el.position.set(0, -0.31, 0); el.add(mesh(new THREE.CapsuleGeometry(0.045, 0.22, 4, 10), T, 0, -0.12, 0)); el.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), S, 0, -0.27, 0)); sh.add(el); sh.userData.el = el; torso.add(sh); return sh; });
  const head = new THREE.Group(); head.position.set(0, 0.66, 0.02); torso.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.12, 20, 16), S, 0, 0.1, 0, { s: [1, 1.12, 1] }));
  if (o.cap) { head.add(mesh(new THREE.SphereGeometry(0.13, 20, 12, 0, TAU, 0, Math.PI * 0.5), std(o.cap, { r: 0.8 }), 0, 0.13, -0.01, { s: [1, 1.0, 1.05] })); head.add(mesh(new THREE.BoxGeometry(0.16, 0.012, 0.1), std(o.cap, { r: 0.8 }), 0, 0.13, 0.12)); }
  else head.add(mesh(new THREE.SphereGeometry(0.128, 20, 12, 0, TAU, 0, Math.PI * 0.5), Hm, 0, 0.12, -0.02, { s: [1, 1.12, 1.04], rx: -0.35 }));
  if (o.ponytail) head.add(mesh(new THREE.CapsuleGeometry(0.04, 0.14, 4, 8), Hm, 0, 0.06, -0.14, { rx: 0.4 }));
  const eyes = [-1, 1].map((s) => { const e = mesh(new THREE.SphereGeometry(0.012, 8, 6), std('#140e0a'), s * 0.042, 0.11, 0.11); head.add(e); return e; });
  const mouth = mesh(new THREE.BoxGeometry(0.035, 0.006, 0.006), std('#5a2a20'), 0, 0.05, 0.118); head.add(mouth);
  g.userData = { torso, head, arms, eyes, mouth }; return g;
}
// a hand (palm + fingers), pointing +z, palm down
function buildHand(sleeve, skin = '#a8714f') {
  const g = new THREE.Group(), S = std(skin, { r: 0.6 });
  g.add(mesh(new THREE.CapsuleGeometry(0.035, 0.3, 4, 10), std(sleeve, { r: 0.9 }), 0, 0, -0.2, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.BoxGeometry(0.075, 0.022, 0.08), S, 0, 0, 0)); for (let k = 0; k < 4; k++) g.add(mesh(new THREE.CapsuleGeometry(0.008, 0.05, 3, 6), S, -0.027 + k * 0.018, -0.002, 0.065, { rx: Math.PI / 2 }));
  g.add(mesh(new THREE.CapsuleGeometry(0.009, 0.035, 3, 6), S, 0.045, -0.004, 0.02, { rz: 0.9, rx: Math.PI / 2 })); return g;
}

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = lin('#0a0e18'); const cam = new THREE.PerspectiveCamera(40, W / H, 0.002, 600); scene.add(cam);
  { const pm = new THREE.PMREMGenerator(r), es = new THREE.Scene(); es.background = lin('#3a4a6a'); es.add(new THREE.HemisphereLight(0xffffff, 0x202030, 2)); scene.environment = pm.fromScene(es, 0.04).texture; }
  scene.add(new THREE.HemisphereLight(0x8a9ad8, 0x141018, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(2, 4, 3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 20 }); scene.add(key, key.target);
  const rimL = new THREE.DirectionalLight(0x7ab8ff, 0.5); rimL.position.set(-3, 2, -2); scene.add(rimL);
  // ---- the stage: a faint grid on a dark floor
  const stage = new THREE.Group(); stage.add(mesh(new THREE.PlaneGeometry(40, 40), std('#0c1220', { r: 0.95 }), 0, -0.3, 0, { rx: -Math.PI / 2, cast: false }));
  { const p = []; for (let i = -40; i <= 40; i++) p.push(i * 0.25, -0.299, -10, i * 0.25, -0.299, 10, -10, -0.299, i * 0.25, 10, -0.299, i * 0.25); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); stage.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: lin('#16223a'), toneMapped: false }))); }
  scene.add(stage);
  // the secure element (the chip, blown up): a dark box with a glass top, a gold core and the secret key inside
  const se = new THREE.Group(); se.add(mesh(rrBox(0.36, 0.36, 0.22, 0.05, 0.01), std('#3a4460', { r: 0.35, m: 0.5 }), 0, 0, 0, { rx: -Math.PI / 2 }));
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.07, 32, 20), new THREE.MeshStandardMaterial({ color: lin('#ffcf5a'), emissive: lin('#ff9a20'), emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.6 })); core.position.y = 0.12; se.add(core);
  const keyG = new THREE.Group(), gold = std('#ffd36a', { r: 0.3, m: 0.8, em: '#7a5010', ei: 0.4 }); keyG.add(mesh(new THREE.TorusGeometry(0.025, 0.008, 10, 24), gold, -0.03, 0, 0)); keyG.add(mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), gold, 0.015, 0, 0)); keyG.add(mesh(new THREE.BoxGeometry(0.01, 0.018, 0.01), gold, 0.035, -0.01, 0)); keyG.position.set(0, 0.12, 0.09); keyG.scale.setScalar(0.6); keyG.visible = false; se.add(keyG);
  se.add(mesh(new THREE.TorusGeometry(0.15, 0.006, 8, 64), basic('#3a5070'), 0, 0.112, 0, { rx: Math.PI / 2, cast: false }));
  se.position.set(0, -0.08, 0); se.visible = false; scene.add(se);
  const infos = { num: buildInfo('NÚMERO DE TARJETA', '•••• 4821'), pago: buildInfo('ESTE PAGO', '$45,00', '#ffb42a'), code: buildInfo('CÓDIGO DE UN SOLO USO', '7F3A-91C2', '#3ad08a'), next: buildInfo('SIGUIENTE PAGO', 'C04E-2B7D', '#8a8680') };
  Object.values(infos).forEach((m) => scene.add(m));
  // the hero card, the copy, the terminal (all on the stage, posed per shot)
  const card = buildCard(false), copy = buildCard(true), term = buildTerminal(); scene.add(card, copy, term);
  // ---- the metro car (x = 100), riding along -x: floor, seats, poles, windows with passing lights, ceiling lights
  const metro = new THREE.Group(); const MX = 100;
  metro.add(mesh(new THREE.PlaneGeometry(12, 2.8), std('#5a5e66', { r: 0.8 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
  const wallM = std('#c8ccd4', { r: 0.6 }); for (const s of [-1, 1]) metro.add(mesh(new THREE.PlaneGeometry(12, 2.3), wallM, 0, 1.15, s * 1.4, { ry: s > 0 ? Math.PI : 0, cast: false }));
  metro.add(mesh(new THREE.PlaneGeometry(12, 2.8), std('#e8eaee', { r: 0.7 }), 0, 2.3, 0, { rx: Math.PI / 2, cast: false }));
  const tun = document.createElement('canvas'); tun.width = 1024; tun.height = 128; const tx = tun.getContext('2d'); tx.fillStyle = '#05070c'; tx.fillRect(0, 0, 1024, 128); { const R = RNG('tunnel'); for (let i = 0; i < 18; i++) { const x0 = R.r(0, 1024), g = tx.createLinearGradient(x0, 0, x0 + 60, 0); g.addColorStop(0, 'rgba(255,220,160,0)'); g.addColorStop(0.5, 'rgba(255,220,160,0.9)'); g.addColorStop(1, 'rgba(255,220,160,0)'); tx.fillStyle = g; tx.fillRect(x0, R.r(20, 90), 60, 6); } }
  const tunT = new THREE.CanvasTexture(tun); tunT.encoding = THREE.sRGBEncoding; tunT.wrapS = THREE.RepeatWrapping; tunT.repeat.set(3, 1);
  const winM = new THREE.MeshBasicMaterial({ map: tunT, toneMapped: false }); for (const s of [-1, 1]) for (let k = -2; k <= 2; k++) metro.add(mesh(new THREE.PlaneGeometry(1.6, 0.7), winM, k * 2.2, 1.45, s * 1.39, { ry: s > 0 ? Math.PI : 0, cast: false }));
  const seatM = std('#2a5a9a', { r: 0.8 }); for (const s of [-1, 1]) for (let k = -2; k <= 2; k++) { metro.add(mesh(new THREE.BoxGeometry(1.7, 0.1, 0.45), seatM, k * 2.2, 0.45, s * 1.15)); metro.add(mesh(new THREE.BoxGeometry(1.7, 0.5, 0.08), seatM, k * 2.2, 0.72, s * 1.33)); }
  const poleM = std('#d8dce2', { r: 0.2, m: 0.9 }); for (let k = -3; k <= 3; k++) { if (k === 0 || k === 1) continue; metro.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.3, 12), poleM, k * 1.1, 1.15, 0.75)); } for (const s of [-1, 1]) metro.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 12, 10), poleM, 0, 2.0, s * 0.75, { rz: Math.PI / 2 }));
  const lightM = basic('#fff4dc'); for (const s of [-1, 1]) metro.add(mesh(new THREE.BoxGeometry(11, 0.03, 0.12), lightM, 0, 2.28, s * 0.6, { cast: false }));
  metro.position.set(MX, 0, 0); scene.add(metro);
  const mLight = new THREE.PointLight(0xfff0d8, 1.4, 8, 1.5); mLight.position.set(MX, 2.1, 0); scene.add(mLight);
  // the victim (red jacket, ponytail) holding a pole, the thief (grey hoodie + cap) right behind her, a reader in his hand
  const victim = buildStander('#c8323a', { hair: '#2a1a12', ponytail: true }), thief = buildStander('#6a6e76', { cap: '#1a1c22', hood: true, skin: '#c89a78', pants: '#30343c' });
  victim.position.set(MX + 0.05, 0, 0.3); victim.rotation.y = -Math.PI / 2; thief.position.set(MX + 0.42, 0, -0.08); thief.rotation.y = -Math.PI / 2 - 0.35; scene.add(victim, thief);
  const wallet = mesh(new THREE.BoxGeometry(0.03, 0.12, 0.09), std('#6a3a1e', { r: 0.7 }), MX + 0.19, 0.84, 0.38); scene.add(wallet);
  const reader = new THREE.Group(); reader.add(mesh(rrBox(0.07, 0.11, 0.02, 0.01), std('#2a2c32', { r: 0.4 }))); reader.add(mesh(new THREE.CircleGeometry(0.008, 12), basic('#ff3a3a'), 0.02, 0.04, 0.011, { cast: false })); scene.add(reader);
  // ---- the shop counter (x = 200)
  const shop = new THREE.Group(), SX = 200; shop.add(mesh(new THREE.PlaneGeometry(8, 8), std('#3a3430', { r: 0.9 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false })); shop.add(mesh(new THREE.PlaneGeometry(8, 3), std('#4a5468', { r: 0.9 }), 0, 1.5, -1.6, { cast: false }));
  const woodT = g3Tex((x, w) => { const R = RNG('ctr'); x.fillStyle = '#8a5a34'; x.fillRect(0, 0, w, w); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(50,26,10,${R.r(0.06, 0.18)})`; x.lineWidth = R.r(1, 4); x.beginPath(); const y0 = R.r(0, w); x.moveTo(0, y0); x.bezierCurveTo(w / 3, y0 + R.n(20), 2 * w / 3, y0 + R.n(20), w, y0 + R.n(10)); x.stroke(); } }, 512, 512, [2, 1]);
  shop.add(mesh(new THREE.BoxGeometry(2.4, 1.0, 0.7), std('#ffffff', { map: woodT, r: 0.6 }), 0, 0.5, -0.4)); shop.add(mesh(new THREE.BoxGeometry(0.3, 0.22, 0.12), std('#e8e4dc'), 0.7, 1.11, -0.6)); shop.add(mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 16), std('#f4f0e8'), -0.7, 1.05, -0.5));
  shop.position.set(SX, 0, 0); scene.add(shop);
  const sLight = new THREE.PointLight(0xffe0b8, 1.2, 6, 1.5); sLight.position.set(SX, 2.2, 0.5); scene.add(sLight);
  const hand = buildHand('#c8323a'), shopper = buildStander('#c8323a', { hair: '#2a1a12', ponytail: true }), peeker = buildStander('#6a6e76', { cap: '#1a1c22', hood: true, skin: '#c89a78', pants: '#30343c' });
  shopper.position.set(SX + 0.0, 0, 0.32); shopper.rotation.y = Math.PI; peeker.position.set(SX + 0.42, 0, 0.62); peeker.rotation.y = Math.PI + 0.35; scene.add(hand, shopper, peeker);
  // ---- effect pools: rings (red skim / blue field), sparks
  const ringM = [...Array(10)].map(() => new THREE.MeshBasicMaterial({ color: lin('#ff5a5a'), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  const rings = ringM.map((m) => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 8, 64), m); q.visible = false; scene.add(q); return q; });
  const sparks = [...Array(80)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('180,230,255'), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s; });
  G = { r, cv, scene, cam, key, se, core, keyG, infos, card, copy, term, tunT, victim, thief, reader, hand, shopper, peeker, rings, ringM, sparks, MX, SX };
  return G;
}
function resetWorld() {
  const g = g3(); SPI = 0;
  for (const k of ['card', 'copy', 'term', 'se', 'reader', 'hand']) { g[k].visible = false; g[k].position.set(0, 0, 0); g[k].rotation.set(0, 0, 0); g[k].scale.setScalar(1); }
  g.keyG.visible = false; g.core.material.emissiveIntensity = 0.6; Object.values(g.infos).forEach((m) => (m.visible = false)); g.rings.forEach((q) => (q.visible = false)); g.sparks.forEach((s) => (s.visible = false));
  cardXray(g.card, 0); cardXray(g.copy, 0); g.tunT.offset.x = -RNOW * 0.9;
  g.key.position.set(2, 4, 3); g.key.target.position.set(0, 0, 0); g.key.target.updateMatrixWorld();
}
function spark(p, s, a, c) { const q = g3().sparks[SPI++]; if (!q || a <= 0) return; q.visible = true; q.position.copy(p); q.scale.set(s, s, 1); q.material.opacity = clamp(a); }
function ringsAt(c, dir, R, a, o = {}) {   // rings travelling from c along dir (a unit vector), or growing in place (o.grow)
  const g = g3(), n = o.n ?? 6, col = o.color ?? '#ff5a5a';
  for (let i = 0; i < n; i++) { const q = g.rings[i], ph = (R * (o.speed ?? 0.9) + i / n) % 1; q.visible = a > 0; g.ringM[i].color.set(col); g.ringM[i].opacity = a * 0.9 * (1 - ph) * Math.min(1, ph * 6);
    if (o.grow) { q.position.copy(c); q.scale.setScalar((o.r0 ?? 0.02) + ph * (o.r1 ?? 0.15)); q.quaternion.setFromUnitVectors(V3(0, 0, 1), dir); }
    else { q.position.copy(c).addScaledVector(dir, ph * (o.len ?? 0.4)); q.scale.setScalar((o.r0 ?? 0.03) + ph * (o.r1 ?? 0.03)); q.quaternion.setFromUnitVectors(V3(0, 0, 1), dir); } }
}
const wpt = (obj, x, y, z) => { obj.updateMatrixWorld(); return V3(x, y, z).applyMatrix4(obj.matrixWorld); };

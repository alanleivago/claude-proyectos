// sets/radioprops.js — ep12 "The Radio": props nuevos en codigo (texturas PS1 pintadas, 32-128 px, nearest).
// makeRadio: radio de emergencia a manivela (naranja, parlante, dial AM/FM con aguja, panel solar, antena, manivela que gira, jack del auricular).
// makeHerb: maceta de terracota con hierba verde (homenaje dibujado, no es el asset de Capcom).
// makeNotebook: libreta con hoja en CanvasTexture que se escribe (log de radio; "itchy... tasty..." tachado arriba).
// makeHatMan: silueta alta con sombrero y gabardina (homenaje), toda negra, camina con las piernas en pendulo.
// makeTypewriter: maquina de escribir verde con hoja y la cinta de tinta (INK RIBBON) al lado.
export function makeRadio(L) {
  const { THREE } = L, px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const g = new THREE.Group(), W = 0.24, H = 0.14, D = 0.075;
  const R = L.rng(1201);
  const tFront = L.cvs(96, 56, (c) => {
    px(c, 0, 0, '#d0482a', 96, 56); for (let k = 0; k < 120; k++) px(c, R() * 96 | 0, R() * 56 | 0, 'rgba(90,20,10,0.25)', 1, 1);
    px(c, 0, 0, '#1c1c1e', 96, 3); px(c, 0, 53, '#1c1c1e', 96, 3); px(c, 0, 0, '#1c1c1e', 3, 56); px(c, 93, 0, '#1c1c1e', 3, 56);   // goma negra
    px(c, 6, 7, '#26262a', 40, 40); for (let y = 9; y < 46; y += 3) for (let x = 8; x < 45; x += 3) px(c, x, y, '#0a0a0c', 2, 2);  // parlante
    px(c, 6, 7, '#5a5a60', 40, 1); px(c, 6, 46, '#101012', 40, 1);
    px(c, 51, 8, '#e8dcb0', 38, 20); px(c, 51, 8, '#7a6a40', 38, 1); px(c, 51, 27, '#7a6a40', 38, 1);                          // ventana del dial
    for (let x = 53; x < 88; x += 3) px(c, x, 12, '#3a2a1a', 1, x % 9 === 2 ? 4 : 2); for (let x = 53; x < 88; x += 4) px(c, x, 21, '#a02010', 1, 3);
    c.fillStyle = '#3a2a1a'; c.font = 'bold 5px monospace'; c.textBaseline = 'top'; c.fillText('AM', 53, 16); c.fillStyle = '#a02010'; c.fillText('FM', 80, 16);
    px(c, 52, 33, '#1c1c1e', 9, 9); px(c, 54, 35, '#5a5a60', 5, 5); px(c, 66, 33, '#1c1c1e', 9, 9); px(c, 68, 35, '#5a5a60', 5, 5);   // perillas
    px(c, 80, 34, '#1c1c1e', 9, 6); px(c, 83, 35, '#2a2a2a', 3, 4);                                                           // jack + boton
    c.fillStyle = '#f4e8d0'; c.font = 'bold 5px monospace'; c.fillText('EMERGENCY', 52, 45);
  });
  const tSide = L.cvs(16, 32, (c) => { px(c, 0, 0, '#b03c22', 16, 32); for (let y = 2; y < 32; y += 4) px(c, 0, y, '#1c1c1e', 16, 1); });
  const tTop = L.cvs(64, 24, (c) => { px(c, 0, 0, '#1c1c1e', 64, 24); px(c, 8, 4, '#16224a', 48, 16); for (let x = 8; x < 56; x += 6) px(c, x, 4, '#5a6a9a', 1, 16); px(c, 8, 12, '#5a6a9a', 48, 1); px(c, 9, 5, 'rgba(160,190,255,0.5)', 10, 2); });
  const mF = L.lam(tFront), mS = L.lam(tSide), mT = L.lam(tTop), mK = L.lam(null, 0x1c1c1e), mSt = L.lam(null, 0xc8ccd0);
  L.box(W, H, D, [mS, mS, mT, mK, mF, mK], 0, 0, 0, g);
  for (const x of [-W / 2 + 0.03, W / 2 - 0.03]) L.box(0.02, 0.05, 0.02, mK, x, H / 2 + 0.025, 0, g);   // asa
  L.box(W - 0.05, 0.018, 0.022, mK, 0, H / 2 + 0.05, 0, g);
  const ant = new THREE.Group(); ant.position.set(-W / 2 + 0.02, H / 2 - 0.01, -D / 2 + 0.01); g.add(ant); ant.rotation.z = 0.35;   // antena con pivote en la base (se pliega en planos donde cruzaria la cara)
  L.mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.26, 5), mSt, 0, 0.13, 0, ant); L.mesh(new THREE.SphereGeometry(0.008, 5, 4), mSt, 0, 0.262, 0, ant);
  const needle = L.box(0.003, 0.05, 0.004, L.basic(null, 0xd01010), 0, 0.034, D / 2 + 0.003, g);
  const crank = new THREE.Group(); crank.position.set(W / 2 + 0.012, -0.01, 0); g.add(crank);
  { const hub = L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 8), mK, 0, 0, 0, crank); hub.rotation.z = Math.PI / 2;
    L.box(0.012, 0.075, 0.018, mK, 0.012, -0.035, 0, crank); const kn = L.mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.045, 6), L.lam(null, 0xe8e0c8), 0.035, -0.07, 0, crank); kn.rotation.z = Math.PI / 2; }
  const led = L.box(0.008, 0.008, 0.004, L.basic(null, 0x203010), W / 2 - 0.02, H / 2 - 0.018, D / 2 + 0.002, g);
  const jack = new THREE.Object3D(); jack.position.set(0.075, -0.02, D / 2 + 0.004); g.add(jack);
  const knobL = new THREE.Object3D(); knobL.position.set(W / 2 + 0.06, -0.08, 0); crank.add(knobL);
  return { g, crank, needle, led, jack, knob: knobL, ant, W, H, D,
    set({ crankA = 0, freq = 0.3, ledOn = false, antZ = 0.35 } = {}) { ant.rotation.z = antZ; crank.rotation.x = crankA; needle.position.x = 0.012 + (freq - 0.5) * 0.085; led.material.color.set(ledOn ? 0x60ff40 : 0x203010); } };
}

export function makeHerb(L) {
  const { THREE } = L, px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const g = new THREE.Group(), R = L.rng(1202);
  const tPot = L.cvs(32, 16, (c) => { px(c, 0, 0, '#b8643a', 32, 16); for (let k = 0; k < 40; k++) px(c, R() * 32 | 0, R() * 16 | 0, 'rgba(80,30,10,0.3)', 1, 1); px(c, 0, 0, '#d47a4a', 32, 3); px(c, 0, 3, '#7a3a1a', 32, 1); });
  const tLeaf = L.cvs(16, 32, (c) => { c.clearRect(0, 0, 16, 32); c.fillStyle = '#3a8a2a'; c.beginPath(); c.moveTo(8, 31); for (let i = 0; i <= 8; i++) { const y = 31 - i * 3.6, w = 7 * Math.sin((i / 8) * Math.PI) + (i % 2 ? 1 : 0); c.lineTo(8 + w, y); } c.lineTo(8, 0); for (let i = 8; i >= 0; i--) { const y = 31 - i * 3.6, w = 7 * Math.sin((i / 8) * Math.PI) + (i % 2 ? 1 : 0); c.lineTo(8 - w, y); } c.fill();
    px(c, 7, 4, '#9ad860', 1, 27); for (let y = 8; y < 28; y += 5) { px(c, 5, y, '#5aa83a', 2, 1); px(c, 9, y - 1, '#5aa83a', 2, 1); } px(c, 3, 14, '#2a6a1a', 2, 6); });
  const pot = L.mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.15, 10), L.lam(L.rep(tPot, 3, 1)), 0, 0.075, 0, g); void pot;
  L.mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 10), L.lam(null, 0xc06c40), 0, 0.15, 0, g);
  const soil = L.mesh(new THREE.CircleGeometry(0.09, 10), L.lam(null, 0x3a2414), 0, 0.155, 0, g); soil.rotation.x = -Math.PI / 2;
  const mL = L.lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + R() * 0.3, h = 0.16 + R() * 0.08, piv = new THREE.Group(); piv.position.set(Math.cos(a) * 0.02, 0.15, Math.sin(a) * 0.02); piv.rotation.y = -a + Math.PI / 2; g.add(piv);
    const lf = L.plane(0.07, h, mL, 0, h / 2, 0, piv); void lf; piv.rotation.z = 0; piv.children[0].position.set(0, h / 2, 0); piv.rotateX(0.25 + R() * 0.35); }
  return g;
}

export function makeNotebook(L) {
  const { THREE } = L;
  const g = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 96; cv.height = 128;
  const tex = new THREE.CanvasTexture(cv); L.nearest(tex); tex.colorSpace = THREE.SRGBColorSpace;
  const mP = L.basic(tex), mC = L.lam(null, 0x2a3a6a), mE = L.lam(null, 0xe8e2d0);
  L.box(0.21, 0.012, 0.28, [mE, mE, mC, mC, mE, mE], 0, 0.006, 0, g);
  const page = L.plane(0.2, 0.27, mP, 0, 0.0135, 0, g, 0, -Math.PI / 2); void page;
  for (let i = 0; i < 9; i++) L.mesh(new THREE.TorusGeometry(0.008, 0.002, 4, 6), L.lam(null, 0xb8bcc0), -0.105, 0.012, -0.12 + i * 0.03, g).rotation.y = Math.PI / 2;
  const pencil = new THREE.Group(); g.add(pencil);
  { const p = L.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.15, 6), L.lam(null, 0xe8c020), 0, 0, 0, pencil); p.rotation.z = Math.PI / 2; const tip = L.mesh(new THREE.ConeGeometry(0.004, 0.015, 6), L.lam(null, 0xe8d0a0), 0.082, 0, 0, pencil); tip.rotation.z = -Math.PI / 2; }
  // draw(fn): fn(ctx 96x128) pinta la hoja (papel rayado de fondo ya puesto)
  const R = L.rng(1203);
  const paper = document.createElement('canvas'); paper.width = 96; paper.height = 128; { const c = paper.getContext('2d'); c.fillStyle = '#ece4cc'; c.fillRect(0, 0, 96, 128); for (let k = 0; k < 160; k++) { c.fillStyle = `rgba(140,110,70,${0.06 + R() * 0.1})`; c.fillRect(R() * 96, R() * 128, 1, 1); } c.fillStyle = 'rgba(70,90,150,0.35)'; for (let y = 16; y < 128; y += 10) c.fillRect(4, y, 88, 1); c.fillStyle = 'rgba(190,50,40,0.45)'; c.fillRect(12, 0, 1, 128); }
  return { g, pencil, cv, draw(fn) { const c = cv.getContext('2d'); c.drawImage(paper, 0, 0); fn(c); tex.needsUpdate = true; } };
}

export function makeHatMan(L) {   // v2 (usuario: bloque plano): figura 3D con sombrero de ala y copa, hombros redondos, gabardina con faldon que se abre
  // y balancea, brazos y piernas articulados (rodilla/codo). Material oscuro con luz de borde (fresnel) azul de luna para leer el volumen.
  const { THREE } = L, g = new THREE.Group();
  const rim = (col, k = 1.0) => { const m = L.lam(null, col, { side: THREE.DoubleSide }); const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `float rimK = pow(1.0 - clamp(abs(normalize(vNormal).z), 0.0, 1.0), 2.4); outgoingLight = outgoingLight * 0.35 + vec3(0.42, 0.55, 0.95) * rimK * ${k.toFixed(2)};\n#include <opaque_fragment>`); };
    m.customProgramCacheKey = () => 'snap-rim' + k; return m; };
  const mC = rim(0x0c0c12), mH = rim(0x08080c, 1.2), mB = rim(0x1c1c26, 0.8);
  const cyl = (rt, rb, h, seg, m, x, y, z, p, open = false) => L.mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m, x, y, z, p);
  const legs = [], arms = [];
  for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(s * 0.12, 1.02, 0); g.add(hip); cyl(0.09, 0.075, 0.5, 8, mC, 0, -0.25, 0, hip);
    const knee = new THREE.Group(); knee.position.set(0, -0.5, 0); hip.add(knee); cyl(0.072, 0.06, 0.47, 8, mC, 0, -0.235, 0, knee);
    L.box(0.12, 0.08, 0.29, mC, 0, -0.5, 0.06, knee); legs.push([hip, knee, s]); }
  const torso = cyl(0.3, 0.27, 0.95, 12, mC, 0, 1.48, 0, g); torso.scale.z = 0.72;
  const skirtP = new THREE.Group(); skirtP.position.set(0, 1.06, 0); g.add(skirtP);
  const skirt = cyl(0.28, 0.44, 0.78, 14, mC, 0, -0.39, 0, skirtP, true); skirt.scale.z = 0.78;
  const sh = cyl(0.12, 0.12, 0.66, 10, mC, 0, 1.9, 0, g); sh.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) L.mesh(new THREE.SphereGeometry(0.135, 10, 8), mC, s * 0.34, 1.9, 0, g);
  cyl(0.12, 0.17, 0.2, 10, mC, 0, 2.02, -0.01, g, true);
  const head = L.mesh(new THREE.SphereGeometry(0.125, 12, 10), mC, 0, 2.13, 0.01, g); head.scale.y = 1.15;
  const hat = new THREE.Group(); hat.position.set(0, 2.25, 0.01); hat.rotation.x = -0.1; g.add(hat);
  cyl(0.32, 0.32, 0.018, 24, mH, 0, 0, 0, hat); cyl(0.135, 0.158, 0.19, 18, mH, 0, 0.1, 0, hat); cyl(0.161, 0.161, 0.04, 18, mB, 0, 0.03, 0, hat);
  L.box(0.05, 0.03, 0.2, mH, 0, 0.19, 0, hat);
  for (const s of [-1, 1]) { const shp = new THREE.Group(); shp.position.set(s * 0.4, 1.9, 0); g.add(shp); cyl(0.085, 0.075, 0.44, 8, mC, 0, -0.22, 0, shp);
    const el = new THREE.Group(); el.position.set(0, -0.44, 0); shp.add(el); cyl(0.072, 0.064, 0.42, 8, mC, 0, -0.21, 0, el); L.mesh(new THREE.SphereGeometry(0.06, 8, 6), mC, 0, -0.45, 0.01, el);
    shp.rotation.z = s * 0.08; arms.push([shp, el, s]); }
  return { g, walk(t, amp = 1) { const q = L.q15(t), a = 0.42 * amp * Math.sin(q * 5.2);
    for (const [hip, knee, s] of legs) { hip.rotation.x = a * s; knee.rotation.x = 0.85 * Math.max(0, a * s) + 0.05; }
    for (const [shp, el, s] of arms) { shp.rotation.x = -a * s * 0.65; el.rotation.x = -0.25 - 0.25 * Math.max(0, -a * s); }
    skirtP.rotation.x = -0.1 * Math.abs(a) - 0.05; skirtP.rotation.z = 0.06 * a; skirt.scale.x = 1 + 0.12 * Math.abs(a); skirt.scale.z = 0.78 + 0.1 * Math.abs(a);
    g.position.y = 0.025 * Math.abs(Math.cos(q * 5.2)) * amp; } };
}

export function makeTypewriter(L) {   // v2 (usuario: teclas pegadas a la mesa): base con patas, teclado escalonado (4 filas con zocalo),
  // teclas redondas sobre vastagos, carro con rodillo y palanca; el origen esta en el piso del aparato (y = 0 apoya en la mesa).
  const { THREE } = L, px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const g = new THREE.Group(), B = (w, h, d, m, x, y, z, p = g) => L.box(w, h, d, m, x, y, z, p);
  const mG = L.lam(L.cvs(16, 16, (cx) => { const r = L.rng(81); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = r() * 14 - 7; px(cx, x, y, `rgb(${52 + n},${86 + n},${64 + n})`); } })), mK = L.lam(null, 0x161616), mKey = L.lam(null, 0xe8e2d0), mSt = L.lam(null, 0x9a9ea4), mRim = L.lam(null, 0x2a2a2a);
  for (const x of [-0.18, 0.18]) for (const z of [-0.12, 0.13]) B(0.04, 0.012, 0.04, mK, x, 0.006, z);
  B(0.42, 0.05, 0.32, mG, 0, 0.037, 0);
  B(0.42, 0.13, 0.13, mG, 0, 0.127, -0.095);
  for (let r = 0; r < 4; r++) {
    const zr = 0.135 - r * 0.034, yr = 0.062 + r * 0.016, hz = yr - 0.062 + 0.016; B(0.4, hz, 0.034, mG, 0, 0.062 + hz / 2 - 0.001, zr);
    for (let k = 0; k < 10; k++) { const x = -0.155 + k * 0.034 + (r % 2) * 0.012; B(0.004, 0.016, 0.004, mSt, x, yr + 0.022, zr);
      const cap = L.mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.006, 10), mKey, x, yr + 0.033, zr, g); cap.userData.key = r * 10 + k; L.mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 10), mRim, x, yr + 0.029, zr, g); } }
  B(0.2, 0.012, 0.03, mKey, 0, 0.07, 0.17);
  const plat = L.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), mK, 0, 0.23, -0.1, g); plat.rotation.z = Math.PI / 2;
  for (const x of [-0.27, 0.27]) { const kn = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), mK, x, 0.23, -0.1, g); kn.rotation.z = Math.PI / 2; }
  B(0.015, 0.015, 0.1, mSt, -0.27, 0.27, -0.03);
  const cv = document.createElement('canvas'); cv.width = 96; cv.height = 128; const pt = new THREE.CanvasTexture(cv); L.nearest(pt); pt.colorSpace = THREE.SRGBColorSpace;
  L.plane(0.24, 0.32, L.basic(pt, 0xffffff, { side: THREE.DoubleSide }), 0, 0.37, -0.115, g, 0, -0.22);
  const rib = new THREE.Group(); g.add(rib); rib.position.set(0.34, 0, 0.06);
  const tRib = L.cvs(32, 16, (c) => { px(c, 0, 0, '#1a1a1c', 32, 16); px(c, 2, 2, '#d8d0b0', 28, 6); c.fillStyle = '#1a1a1c'; c.font = 'bold 5px monospace'; c.textBaseline = 'top'; c.fillText('INK RIBBON', 3, 2); px(c, 6, 10, '#3a3a3e', 6, 4); px(c, 20, 10, '#3a3a3e', 6, 4); });
  const mR = L.lam(tRib), mRs = L.lam(null, 0x1a1a1c);
  B(0.11, 0.03, 0.06, [mRs, mRs, mR, mRs, mRs, mRs], 0, 0.015, 0, rib);
  for (const x of [-0.03, 0.03]) L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), L.lam(null, 0x2a2a2e), x, 0.036, 0, rib);
  return { g, cv, tex: pt, rib };
}


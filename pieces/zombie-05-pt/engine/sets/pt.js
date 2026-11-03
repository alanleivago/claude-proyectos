// sets/pt.js — ep5 "the ghost behind you (P.T.)". Pasillo en L de P.T. (refs: fuentes/zombie-nicho/pt_refs, plano clave
// hall_norm.png): yeso beige sucio, zocalo y moldura oscuros, parquet en espiga, comoda con lampara de vidrio y foto familiar,
// farol colgante, cuadros, reloj de pared, mesita con radio, puerta del bano, ventana, escalera que baja y la puerta doble del
// fondo. Props = GLB foto->loft (objects/tools/build_pt.py). Lisa = Sketchfab CC-BY (lisa/tools/build.py), animada aqui por huesos.
// Camara: dollies continuos y orbitas por splines Catmull-Rom (cam keys [t, pos, target]); cortes invisibles a traves del
// negro de una puerta o de la espalda de Ava. Prefijo propio: P*.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

export async function shots({ L, TL }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 120);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateProjectionMatrix(); };
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  // Catmull-Rom por tiempo: keys [[t, x, y, z], ...] -> Vector3 (velocidad continua: dollies sin paradas)
  const cr = (keys, t) => {
    if (t <= keys[0][0]) return V(keys[0][1], keys[0][2], keys[0][3]);
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const k = (j) => keys[Math.max(0, Math.min(keys.length - 1, j))], [a, b, c, d] = [k(i - 1), k(i), k(i + 1), k(i + 2)];
    const u = Math.min(1, (t - b[0]) / (c[0] - b[0])), u2 = u * u, u3 = u2 * u;
    const f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3);
    return V(f(1), f(2), f(3));
  };
  const vign = (k) => (lt, dt, a, o) => { const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LW * 0.33, LW / 2, LH * 0.5, LH * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH); };

  // ================= texturas pintadas (yeso sucio, techo, azulejo del bano) =================
  const R = L.rng(55);
  const tPlaster = L.cvs(64, 64, (c) => { for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const n = R() * 14 + 8 * Math.sin(x * 0.21 + y * 0.07) + (y > 48 ? -10 * R() : 0); px(c, x, y, `rgb(${150 + n},${140 + n},${112 + n})`); }
    for (let k = 0; k < 14; k++) { c.fillStyle = `rgba(70,58,40,${0.12 + R() * 0.15})`; const x = R() * 64, y = R() * 64; c.beginPath(); c.ellipse(x, y, 2 + R() * 7, 2 + R() * 9, R() * 3, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(60,50,36,0.25)'; for (let x = 0; x < 64; x += 1) if (R() < 0.3) c.fillRect(x, 40 + R() * 24, 1, 24); });
  const tCeil = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = R() * 12; px(c, x, y, `rgb(${92 + n},${88 + n},${74 + n})`); } });
  const tTile = L.cvs(32, 32, (c) => { px(c, 0, 0, '#c8ccc4', 32, 32); for (let i = 0; i < 32; i += 8) { px(c, i, 0, '#7a8078', 1, 32); px(c, 0, i, '#7a8078', 32, 1); } c.fillStyle = 'rgba(80,60,40,0.3)'; for (let k = 0; k < 20; k++) c.fillRect(R() * 32, R() * 32, 1 + R() * 3, 1 + R() * 5); });
  const tPar = L.rep(await L.loadTex('tex/pt/parquet.png', 64), 2, 2);

  // ================= el pasillo en L (trazado del juego: fuentes/zombie-nicho/pt_refs/yt_0fF3gW3K4rM, 1 fps de los 20 s) =================
  // A: x [-0.8, 0.8], z [-9.6, 3]: pasillo largo con apliques en la pared izquierda y cuadros; al fondo la VENTANA con una bombilla
  //    encima y la mesita de la esquina (lampara + radio). Gira a la DERECHA (+X).
  // B: x [0.8, 7], z [-9.6, -8]: mas oscuro, globos colgantes, puertas a los dos lados (bano a la derecha, otra cerrada a la
  //    izquierda), hueco de la escalera que baja; al empezar, la comoda con lampara y foto (hall_norm). Al fondo el cuarto iluminado
  //    (x [7, 9.2]) con comoda, lampara y fotos; la puerta doble del bucle en su pared derecha (z = -7.2).
  const HW = 0.8, ZS = 3, ZC = -9.6, ZI = -8, XE = 7, XR = 9.2, RZ0 = -10.4, RZ1 = -7.2, HH = 2.7, DH = 2.1;
  const ZB = (ZI + ZC) / 2, DOOR_X = 8.3;
  const mWall = lam(L.rep(tPlaster, 1, 1)), mCeil = lam(L.rep(tCeil, 4, 4)), mTrim = lam(null, 0x2a1c12), mTrimL = lam(null, 0x4a3524);
  const wallSeg = (g, x0, z0, x1, z1, y0 = 0, y1 = HH, trim = true) => {   // tramo de pared con zocalo y moldura
    const len = Math.hypot(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ang = Math.atan2(x1 - x0, z1 - z0);
    if (len < 0.01) return null;
    const m = lam(L.rep(tPlaster, Math.max(1, len / 1.4), (y1 - y0) / 1.4));
    const w = B(0.1, y1 - y0, len, m, cx, (y0 + y1) / 2, cz, g); w.rotation.y = ang;
    if (trim && y0 === 0) { const s = B(0.14, 0.14, len, mTrim, cx, 0.07, cz, g); s.rotation.y = ang; }
    if (trim && y1 === HH) { const s = B(0.16, 0.1, len, mTrimL, cx, HH - 0.05, cz, g); s.rotation.y = ang; }
    return w;
  };
  const opening = (g, x0, z0, x1, z1, holes) => {   // pared con huecos [[a0, a1, top, bottom], ...] (fracciones del tramo, ordenados)
    const P = (k) => [x0 + (x1 - x0) * k, z0 + (z1 - z0) * k], ang = Math.atan2(x1 - x0, z1 - z0);
    let prev = 0;
    for (const [a0, a1, top, bottom = 0] of holes) {
      const [ax, az] = P(a0), [bx, bz] = P(a1), [px0, pz0] = P(prev);
      wallSeg(g, px0, pz0, ax, az); wallSeg(g, ax, az, bx, bz, top, HH); if (bottom > 0) wallSeg(g, ax, az, bx, bz, 0, bottom, true);
      const len = Math.hypot(bx - ax, bz - az);
      for (const [x, z] of [[ax, az], [bx, bz]]) { const j = B(0.17, top - bottom, 0.14, mTrim, x, (top + bottom) / 2, z, g); j.rotation.y = ang; }   // v3: mas ancho: tapa la union pared/hueco (la costura parpadeaba con el snap PS1)
      const lt = B(0.16, 0.1, len + 0.16, mTrim, (ax + bx) / 2, top + 0.05, (az + bz) / 2, g); lt.rotation.y = ang;
      if (bottom > 0) { const sl = B(0.2, 0.05, len + 0.16, mTrim, (ax + bx) / 2, bottom - 0.02, (az + bz) / 2, g); sl.rotation.y = ang; }
      prev = a1;
    }
    const [px0, pz0] = P(prev); wallSeg(g, px0, pz0, x1, z1);
  };
  const fr = (a, b, v) => (v - a) / (b - a);
  async function makeHall() {
    const g = new THREE.Group();
    const flo = (w, d, x, z) => L.plane(w, d, lam(L.rep(tPar, w / 0.9, d / 0.9)), x, 0, z, g, 0, -Math.PI / 2);
    flo(2 * HW, ZS - ZC, 0, (ZS + ZC) / 2); flo(XE - HW, ZI - ZC, (HW + XE) / 2, ZB); flo(XR - XE, RZ1 - RZ0, (XE + XR) / 2, (RZ0 + RZ1) / 2);
    const ceil = new THREE.Group(); g.add(ceil);
    L.plane(2 * HW, ZS - ZC, mCeil, 0, HH, (ZS + ZC) / 2, ceil, 0, Math.PI / 2); L.plane(XE - HW, ZI - ZC, mCeil, (HW + XE) / 2, HH, ZB, ceil, 0, Math.PI / 2);
    L.plane(XR - XE, RZ1 - RZ0, mCeil, (XE + XR) / 2, HH, (RZ0 + RZ1) / 2, ceil, 0, Math.PI / 2);
    wallSeg(g, -HW - 0.05, ZS, -HW - 0.05, ZC - 0.05);                                           // A izquierda (apliques)
    wallSeg(g, HW + 0.05, ZS, HW + 0.05, ZI + 0.05);                                             // A derecha
    opening(g, -HW, ZS + 0.05, HW, ZS + 0.05, [[0.22, 0.78, DH]]);                               // entrada con su puerta
    opening(g, -HW - 0.05, ZC - 0.05, XE, ZC - 0.05, [[fr(-HW, XE, -0.45), fr(-HW, XE, 0.45), 2.2, 0.85], [fr(-HW, XE, 4.4), fr(-HW, XE, 5.3), DH]]);   // exterior: ventana al fondo de A + puerta cerrada en B
    opening(g, HW + 0.05, ZI + 0.05, XE, ZI + 0.05, [[fr(HW, XE, 2.6), fr(HW, XE, 3.5), DH], [fr(HW, XE, 4.6), fr(HW, XE, 6.0), DH]]);   // interior de B: bano + escalera
    wallSeg(g, XE, RZ0, XE, ZC - 0.05); wallSeg(g, XE, ZI + 0.05, XE, RZ1);                      // boca del cuarto del fondo
    wallSeg(g, XE, RZ0, XR, RZ0); wallSeg(g, XR, RZ0, XR, RZ1);
    opening(g, XE, RZ1, XR, RZ1, [[fr(XE, XR, DOOR_X - 0.75), fr(XE, XR, DOOR_X + 0.75), 2.3]]);   // puerta doble del bucle
    return { g, ceil };
  }
  const scene = new THREE.Scene(); const BG = 0x070806; scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(0x0a0c08, 5, 16);
  const hemi = new THREE.HemisphereLight(0xc4ccaa, 0x2e3424, 1.05); scene.add(hemi);   // revision: algo mas oscuro y verde (P.T.), Ava legible
  const hall = await makeHall(); scene.add(hall.g);
  const ground = L.plane(60, 60, lam(L.rep(tCeil, 30, 30), 0x7a6a50), 3, -0.03, -4, scene, 0, -Math.PI / 2); ground.visible = false;   // v2: tierra bajo la casa en la cenital
  const leafG = await prop('door_leaf');
  const startDoor = leafG.clone(); startDoor.position.set(0, 0, ZS + 0.02); startDoor.rotation.y = Math.PI; scene.add(startDoor);
  const endDoor = await prop('door_double'); endDoor.position.set(DOOR_X, 0, RZ1 - 0.03); endDoor.rotation.y = Math.PI; scene.add(endDoor);
  const sideDoor = leafG.clone(); sideDoor.position.set(4.85, 0, ZC + 0.03); scene.add(sideDoor);   // puerta cerrada de B (lado izquierdo)
  // bano (lado derecho de B, x [2.6, 3.5]): hoja con bisagra en x = 2.6, se abre hacia dentro (+Z); cuarto de azulejo detras
  const bathPiv = new THREE.Group(); bathPiv.position.set(2.6, 0, ZI + 0.06); scene.add(bathPiv);
  const bathLeaf = leafG.clone(); bathLeaf.position.set(0.45, 0, 0); bathPiv.add(bathLeaf);
  const mTileW = lam(L.rep(tTile, 4, 3)); const bathG = new THREE.Group(); scene.add(bathG);
  B(0.1, HH, 1.78, mTileW, 2.35, HH / 2, ZI + 1.01, bathG); B(0.1, HH, 1.78, mTileW, 3.75, HH / 2, ZI + 1.01, bathG);   // v3: empiezan detras de la pared del pasillo (antes compartian plano en z = -8: la raya que parpadeaba) B(1.5, HH, 0.1, mTileW, 3.05, HH / 2, ZI + 1.9, bathG);
  L.plane(1.4, 1.9, lam(L.rep(tTile, 5, 6)), 3.05, 0.005, ZI + 0.95, bathG, 0, -Math.PI / 2);
  const bathL = new THREE.PointLight(0xc8e8c0, 0, 4, 1.5); bathL.position.set(3.05, 1.9, ZI + 1.0); scene.add(bathL);
  // ventana al fondo de A: vidrio azul noche, montantes de guillotina, luz de luna; bombilla encima (como en el juego)
  const winG = new THREE.Group(); winG.position.set(0, 1.525, ZC - 0.02); scene.add(winG);
  L.plane(0.9, 1.35, L.basic(null, 0x162238), 0, 0, 0, winG); B(0.9, 0.05, 0.05, mTrim, 0, 0, 0.02, winG);
  for (const x of [-0.15, 0.15]) B(0.03, 1.35, 0.04, mTrim, x, 0, 0.02, winG);
  for (const y of [-0.34, 0.34]) B(0.9, 0.03, 0.04, mTrim, 0, y, 0.02, winG);
  const moon = new THREE.PointLight(0x6a80c0, 1.2, 4, 1.5); moon.position.set(0, 1.6, ZC + 0.6); scene.add(moon);
  // escalera que baja (x [4.6, 6.0], hacia +Z desde z = -8)
  const mStep = lam(L.rep(tPar, 1.5, 0.3)), mDark = lam(null, 0x15120c); const stairG = new THREE.Group(); scene.add(stairG);
  for (let k = 0; k < 11; k++) B(1.4, 0.19, 0.27, mStep, 5.3, -0.095 - k * 0.19, ZI + 0.14 + k * 0.27, stairG);
  B(0.1, 4.6, 3.2, mWall, 4.55, HH - 2.3, ZI + 1.6, stairG); B(0.1, 4.6, 3.2, mWall, 6.05, HH - 2.3, ZI + 1.6, stairG); B(1.6, 4.6, 0.1, mDark, 5.3, HH - 2.3, ZI + 3.1, stairG);
  B(1.6, 0.1, 3.2, mCeil, 5.3, HH, ZI + 1.6, stairG);
  const rail = B(0.06, 0.06, 3.0, mTrimL, 4.75, 0.9 - 0.6, ZI + 1.5, stairG); rail.rotation.x = Math.atan2(2.1, 3.0) * 0.9;
  // v3 (usuario): radio de los 60-70 hecha en codigo (la foto traia el fondo pegado): caja de madera, frente de plastico crema,
  // rejilla del altavoz, ventana del dial con escala y aguja roja, dos perillas cromadas, banda cromada y asa de cuero
  const makeRadio = () => {
    const g = new THREE.Group(), r = L.rng(70);
    const tWood = L.cvs(32, 16, (c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.9 + Math.sin(y * 0.7) * 2) + r() * 8; px(c, x, y, `rgb(${92 + n},${54 + n * 0.6},${30 + n * 0.4})`); } });
    const tFront = L.cvs(64, 32, (c) => {
      px(c, 0, 0, '#d8ccb0', 64, 32); px(c, 0, 0, '#b8ac90', 64, 1); px(c, 0, 31, '#8a8070', 64, 1);
      px(c, 3, 4, '#2a2420', 30, 24); for (let y = 5; y < 27; y += 2) for (let x = 4; x < 32; x += 2) px(c, x, y, '#5a5048', 1, 1);   // rejilla perforada
      px(c, 36, 4, '#3a3028', 25, 13); px(c, 37, 5, '#e8dcb8', 23, 11);                                          // ventana del dial
      for (let x = 38; x < 59; x += 2) px(c, x, 6, '#3a3028', 1, x % 4 ? 2 : 3); c.fillStyle = '#3a3028'; c.font = '4px monospace'; c.fillText('AM 5  7  10 14', 37, 14);
      px(c, 47, 5, '#d8201a', 1, 11);                                                                             // aguja
      px(c, 36, 20, '#a8a8b0', 25, 2); px(c, 36, 25, '#8a8a90', 25, 1);                                           // banda cromada
    });
    const mW = lam(tWood), mF = lam(tFront), mC = lam(null, 0xb8b8c0), mD = lam(null, 0x2a2420);
    L.box(0.46, 0.24, 0.15, [mW, mW, mW, mW, mF, mW], 0, 0.12, 0, g);
    for (const x of [0.11, 0.19]) { const k = L.mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 8), mC, x, 0.06, 0.082, g); k.rotation.x = Math.PI / 2; }
    L.box(0.32, 0.018, 0.03, mD, 0, 0.262, 0, g); L.box(0.02, 0.04, 0.03, mD, -0.15, 0.245, 0, g); L.box(0.02, 0.04, 0.03, mD, 0.15, 0.245, 0, g);   // asa
    return g;
  };
  // props (foto -> loft)
  const tlampG = await prop('table_lamp'), stableG = await prop('side_table'), photoG = await prop('frame_photo');
  // comoda al empezar B (izquierda), lampara y foto encima (hall_norm)
  const dresser = await prop('dresser'); dresser.position.set(1.75, 0, ZC + 0.24); scene.add(dresser);
  const tlamp = tlampG.clone(); tlamp.position.set(1.35, 0.86, ZC + 0.24); scene.add(tlamp);
  const fphoto = photoG.clone(); fphoto.position.set(2.0, 0.86, ZC + 0.22); fphoto.rotation.set(-0.12, 0.2, 0); scene.add(fphoto);
  // mesita de la esquina de A (izquierda, junto a la ventana): lampara + la radio
  const tDrawer = L.cvs(32, 32, (c) => { const r = L.rng(33); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = 9 * Math.sin(x * 0.7 + Math.sin(y * 0.5) * 2.5) + r() * 7; px(c, x, y, `rgb(${88 + n},${52 + n * 0.6},${30 + n * 0.4})`); }
    px(c, 3, 4, '#3a2214', 26, 1); px(c, 3, 13, '#3a2214', 26, 1); px(c, 3, 4, '#3a2214', 1, 10); px(c, 28, 4, '#3a2214', 1, 10); px(c, 15, 8, '#c8a050', 3, 2); });
  const woodify = (g) => g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.map = tDrawer; o.material.needsUpdate = true; } });
  woodify(stableG);
  const stable = stableG.clone(); stable.position.set(-HW + 0.22, 0, ZC + 0.62); stable.rotation.y = Math.PI / 2; stable.scale.set(1.7, 1, 1); scene.add(stable);
  const tlamp2 = tlampG.clone(); tlamp2.position.set(-HW + 0.24, 0.66, ZC + 0.3); scene.add(tlamp2);
  const radio = makeRadio(); radio.position.set(-HW + 0.24, 0.66, ZC + 0.78); radio.rotation.y = Math.PI / 2; scene.add(radio);
  const radioLed = L.plane(0.03, 0.03, L.basic(null, 0xff2010), -HW + 0.32, 0.86, ZC + 0.93, scene, Math.PI / 2);
  const radioL = new THREE.PointLight(0xff6030, 0, 2.5, 1.5); radioL.position.set(-HW + 0.5, 0.95, ZC + 0.8); scene.add(radioL);
  // cuarto del fondo: comoda, lampara y fotos (el punto iluminado al final de B)
  const dresser2 = dresser.clone(); dresser2.position.set(XR - 0.24, 0, -8.8); dresser2.rotation.y = -Math.PI / 2; scene.add(dresser2);
  const tlamp3 = tlampG.clone(); tlamp3.position.set(XR - 0.24, 0.86, -9.25); scene.add(tlamp3);
  for (const [z, ry] of [[-8.6, -0.2], [-8.3, 0.25]]) { const p2 = photoG.clone(); p2.position.set(XR - 0.24, 0.86, z); p2.rotation.set(-0.12, -Math.PI / 2 + ry, 0); scene.add(p2); }
  const roomL = new THREE.PointLight(0xfff0c8, 5.5, 6, 1.4); roomL.position.set(8.4, 2.1, -8.8); scene.add(roomL);
  // cuadros y reloj
  const pa = await prop('painting_a'); pa.position.set(HW - 0.02, 1.3, -2.4); pa.rotation.y = -Math.PI / 2; scene.add(pa);
  const pb = await prop('painting_b'); pb.position.set(-HW + 0.02, 1.35, -6.2); pb.rotation.y = Math.PI / 2; scene.add(pb);
  const pa2 = pa.clone(); pa2.position.set(HW - 0.02, 1.35, -5.6); scene.add(pa2);
  const pb2 = pb.clone(); pb2.position.set(-HW + 0.02, 1.35, -1.2); scene.add(pb2);
  const pa3 = pa.clone(); pa3.position.set(4.0, 1.35, ZI - 0.02); pa3.rotation.y = Math.PI; scene.add(pa3);
  for (const [x, z, ry] of [[XR - 0.02, -9.9, -Math.PI / 2], [XR - 0.02, -7.7, -Math.PI / 2]]) { const p3 = pb.clone(); p3.position.set(x, 1.5, z); p3.rotation.y = ry; p3.scale.setScalar(0.6); scene.add(p3); }
  const clock = await prop('wall_clock'); clock.position.set(HW - 0.03, 1.15, 1.3); clock.rotation.y = -Math.PI / 2; scene.add(clock);
  // la tele CRT (PS1, 14"): mesita a la derecha de A; carcasa gris oscura, bisel con la pantalla METIDA dentro, perillas y rejilla
  const tvG = new THREE.Group(); tvG.position.set(HW - 0.24, 0.66, -0.9); tvG.rotation.y = -Math.PI / 2; scene.add(tvG);
  const stable2 = stableG.clone(); stable2.position.set(HW - 0.22, 0, -0.9); stable2.rotation.y = -Math.PI / 2; scene.add(stable2);
  const tPlas = L.cvs(32, 32, (c) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = R() * 10; px(c, x, y, `rgb(${46 + n},${46 + n},${50 + n})`); }
    for (let y = 6; y < 26; y += 3) px(c, 6, y, '#141418', 20, 1);   // ranuras de ventilacion
    for (const [x, y] of [[2, 2], [29, 2], [2, 29], [29, 29]]) { px(c, x, y, '#9a9aa0', 1, 1); }   // tornillos
    px(c, 0, 0, '#5a5a62', 32, 1); px(c, 0, 31, '#2a2a30', 32, 1); });
  const mPl = lam(tPlas), mPlD = lam(null, 0x1c1c20), mBack = lam(tPlas, 0x8a8a90);
  B(0.5, 0.4, 0.3, mPl, 0, 0.2, 0, tvG); B(0.36, 0.3, 0.16, mBack, 0, 0.18, -0.22, tvG); B(0.02, 0.02, 0.3, mPlD, 0.12, 0.05, -0.38, tvG);   // culo del tubo con ranuras + cable              // caja + culo del tubo
  B(0.5, 0.05, 0.03, mPlD, 0, 0.375, 0.16, tvG); B(0.5, 0.06, 0.03, mPlD, 0, 0.03, 0.16, tvG);       // bisel arriba / abajo
  B(0.05, 0.4, 0.03, mPlD, -0.225, 0.2, 0.16, tvG); B(0.13, 0.4, 0.03, mPlD, 0.185, 0.2, 0.16, tvG);  // bisel izquierda / panel de controles
  for (const y of [0.29, 0.2]) { const k = L.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), lam(null, 0x8a8a90), 0.185, y, 0.18, tvG); k.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 4; i++) B(0.08, 0.008, 0.005, lam(null, 0x0a0a0c), 0.185, 0.09 + i * 0.022, 0.177, tvG);   // rejilla del altavoz
  const pwrLed = B(0.012, 0.012, 0.005, L.basic(null, 0x40ff50), 0.215, 0.05, 0.178, tvG);
  const crtCv = document.createElement('canvas'); crtCv.width = 64; crtCv.height = 52; const crtTex = L.canvasTex(crtCv);
  const crtScreen = L.plane(0.34, 0.285, L.basic(crtTex), -0.035, 0.2, 0.152, tvG);                  // dentro del bisel (hueco 0,35 x 0,29)
  const crtGlass = L.plane(0.34, 0.285, L.basic(null, 0x0c120e), -0.035, 0.2, 0.151, tvG);
  const crtL = new THREE.PointLight(0x80ff90, 0, 2.2, 1.5); crtL.position.set(0.1, 0.95, -0.9); scene.add(crtL);
  // luces: apliques en la pared izquierda de A, bombilla sobre la ventana, farol colgante al girar (hall_norm), globos en B
  const lanterns = [];
  const addL = (x, y, z, k = 1) => { const pl = new THREE.PointLight(0xffd890, 5.2 * k, 6.5, 1.4); pl.position.set(x, y, z); pl.userData.k = k; scene.add(pl); lanterns.push(pl); return pl; };
  const lanG = await prop('lantern');
  for (const z of [2.0, -4.2]) { const s = lanG.clone(); s.scale.setScalar(0.62); s.position.set(-HW + 0.17, 1.65, z); scene.add(s); B(0.03, 0.16, 0.09, mTrim, -HW + 0.015, 1.92, z, scene); B(0.13, 0.025, 0.025, mTrim, -HW + 0.08, 1.99, z, scene); addL(-HW + 0.35, 1.85, z, 0.85); }   // v2: el aplique de z 0,6 quedaba como sombrero sobre Ava en la apertura   // placa en la pared + brazo hasta el farol
  const tGlobe = L.cvs(8, 8, (c) => { px(c, 0, 0, '#fff6dc', 8, 8); px(c, 0, 6, '#d8ccb0', 8, 2); });
  const globe = (x, z) => { L.mesh(new THREE.SphereGeometry(0.11, 6, 4), L.basic(tGlobe), x, HH - 0.42, z, scene); B(0.012, 0.3, 0.012, mTrim, x, HH - 0.16, z, scene); };
  globe(0, ZC + 0.7); addL(0, HH - 0.55, ZC + 0.7, 0.8);
  const lan = lanG.clone(); lan.position.set(1.3, HH - 0.78, ZB); scene.add(lan); B(0.015, 0.22, 0.015, mTrim, 1.3, HH - 0.11, ZB, scene); addL(1.3, HH - 0.5, ZB, 1.0);
  for (const x of [3.9, 6.2]) { globe(x, ZB); addL(x, HH - 0.55, ZB, 0.55); }
  const lampL = new THREE.PointLight(0xfff0c8, 1.8, 3.0, 1.5); lampL.position.set(1.35, 1.3, ZC + 0.5); scene.add(lampL);
  const lampL2 = new THREE.PointLight(0xfff0c8, 1.6, 3.0, 1.5); lampL2.position.set(-0.4, 1.1, ZC + 0.4); scene.add(lampL2);

  // ================= Ava =================
  const ch = L.hero(); scene.add(ch.root);
  // v3 (usuario: el >.< no gusta): cara de "ya me di cuenta" para el aliento en la nuca. Celda 13 de ojos 'scared' = copia de
  // 'shocked' (9, ojos muy abiertos) con las pupilas corridas de reojo y cejas de preocupacion; celda 13 de bocas 'yikes' =
  // mueca apretada con dientes. Atlas 2048x128 (16 celdas): la banda de ojos usa u 86..142 de la celda (el ojo B se envuelve a
  // u 0..14 de la MISMA celda); v crece hacia arriba de la cara. Se pinta en una tira continua y se reparte.
  ch.root.traverse((o) => {
    if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m.map || m.map.userData.v3) return;
      const im = m.map.image, W2 = im.width, H2 = im.height, k = W2 / 2048, ky = H2 / 128, cell = 128 * k;
      const cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
      if (m.name === 'face_eyes') {
        const SRC = 9 * cell, C13 = 13 * cell;
        const st = document.createElement('canvas'); st.width = Math.round(64 * k); st.height = H2; const s2 = st.getContext('2d', { willReadFrequently: true });
        s2.drawImage(cv, SRC + 86 * k, 0, 42 * k, H2, 0, 0, 42 * k, H2); s2.drawImage(cv, SRC, 0, 22 * k, H2, 42 * k, 0, 22 * k, H2);
        const DX = -2.5;   // pupilas de reojo (hacia Lisa)
        for (const cx of [16, 47]) {
          const x0 = Math.round((cx - 10) * k), y0 = Math.round(76 * ky), w = Math.round(20 * k), h = Math.round(13 * ky);
          const d = s2.getImageData(x0, y0, w, h), P = d.data, lum = (i) => (P[i] + P[i + 1] + P[i + 2]) / 3;
          let sx = 0, sy = 0, n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (lum(i) > 190 && Math.abs(P[i] - P[i + 2]) < 40) { sx += x; sy += y; n++; } }
          if (!n) continue; const ex = sx / n, ey = sy / n, rx = 5.5 * k, ry = 3.6 * ky;
          const pup = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (((x - ex) / rx) ** 2 + ((y - ey) / ry) ** 2 < 1 && lum(i) < 110) pup.push([x, y, P[i], P[i + 1], P[i + 2]]); }
          for (const [x, y] of pup) { const i = (y * w + x) * 4; P[i] = 236; P[i + 1] = 232; P[i + 2] = 228; }   // borra la pupila (esclerotica)
          for (const [x, y, r, g, b] of pup) { const xx = Math.round(x + DX * k); if (xx < 0 || xx >= w || ((xx - ex) / (rx * 1.15)) ** 2 + ((y - ey) / ry) ** 2 >= 1) continue; const i = (y * w + xx) * 4; P[i] = r; P[i + 1] = g; P[i + 2] = b; }
          s2.putImageData(d, x0, y0);
        }
        s2.strokeStyle = '#4a2c18'; s2.lineWidth = 1.6 * k; s2.lineCap = 'round';   // cejas de preocupacion: el extremo interior (entre los ojos) mas alto
        for (const [cx, inner] of [[16, 1], [47, -1]]) { s2.beginPath(); s2.moveTo((cx - 7 * inner) * k, 92 * ky); s2.lineTo((cx + 6 * inner) * k, 95.5 * ky); s2.stroke(); }
        c.drawImage(cv, SRC, 0, cell, H2, C13, 0, cell, H2);
        c.clearRect(C13 + 86 * k, 0, 42 * k, H2); c.drawImage(st, 0, 0, 42 * k, H2, C13 + 86 * k, 0, 42 * k, H2);
        c.clearRect(C13, 0, 22 * k, H2); c.drawImage(st, 42 * k, 0, 22 * k, H2, C13, 0, 22 * k, H2);
      } else if (m.name === 'face_mouth') {
        const C13 = 13 * cell; c.drawImage(cv, 0, 0, cell, H2, C13, 0, cell, H2);   // base: 'neutral' (piel limpia)
        const sk = c.getImageData(C13 + 104 * k, 60 * ky, 1, 1).data; c.fillStyle = `rgb(${sk[0]},${sk[1]},${sk[2]})`; c.fillRect(C13 + 104 * k, 61 * ky, 18 * k, 9 * ky);
        c.fillStyle = '#3a1810'; c.fillRect(C13 + 106 * k, 63 * ky, 14 * k, 4.5 * ky);          // mueca ancha y apretada
        c.fillStyle = '#f2ece4'; c.fillRect(C13 + 107 * k, 64 * ky, 12 * k, 2.5 * ky);            // dientes
        c.fillStyle = '#9a8a80'; for (const x of [110, 113, 116]) c.fillRect(C13 + x * k, 64 * ky, 0.8 * k, 2.5 * ky);
      } else return;
      m.map.image = cv; m.map.userData.v3 = 1; m.map.needsUpdate = true;
    });
  });
  // v3: limpieza de texturas de Ava para este episodio: el pantalon (casi negro) en un tono parejo sin las manchas redondas,
  // y en el pelo los huecos negros (se veian como manchas en la coronilla al inclinar la cabeza) pasan al rubio medio
  ch.root.traverse((o) => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
    if (!m.map || m.map.userData.clean || !/^Hair/.test(m.name)) return;
    const im = m.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const c = cv.getContext('2d'); c.drawImage(im, 0, 0);
    const d = c.getImageData(0, 0, cv.width, cv.height), P = d.data;
    if (m.name.startsWith('Hair')) {
      let sr = 0, sg = 0, sb = 0, n = 0; for (let i = 0; i < P.length; i += 4) if (P[i] > 120 && P[i + 1] > 90) { sr += P[i]; sg += P[i + 1]; sb += P[i + 2]; n++; }
      for (let i = 0; i < P.length; i += 4) if (P[i] + P[i + 1] + P[i + 2] < 150) { P[i] = sr / n * 0.82; P[i + 1] = sg / n * 0.82; P[i + 2] = sb / n * 0.82; }
    } else {
      for (let i = 0; i < P.length; i += 4) { const mx = Math.max(P[i], P[i + 1], P[i + 2]), mn = Math.min(P[i], P[i + 1], P[i + 2]); if (mx < 58 && mx - mn < 14) { const v = 30 + (mx > 40 ? 6 : 0); P[i] = v; P[i + 1] = v - 1; P[i + 2] = v + 3; } }
    }
    c.putImageData(d, 0, 0); m.map.image = cv; m.map.userData.clean = 1; m.map.needsUpdate = true;
  }); });
  const phoneG = await prop('phone'); L.holdIn(ch, phoneG, 'R', [0, 0.9, 0.2], [Math.PI / 2, 0, Math.PI]); phoneG.visible = false;
  const AVA_HEAD = ch.bone.getObjectByName('Head');

  // ================= Lisa =================
  const lisa = await prop('lisa'); const lisaW = new THREE.Group(); lisaW.add(lisa); scene.add(lisaW);
  const tBlob = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const lShadow = L.plane(0.6, 0.45, L.basic(tBlob, 0xffffff, { transparent: true, depthWrite: false, opacity: 0.5 }), 0, 0.012, 0, lisaW, 0, -Math.PI / 2);   // v3b: sombra suave bajo la que flota
  const lMats = []; lisa.traverse((o) => { if (o.isMesh) { o.material.transparent = true; lMats.push(o.material); } });
  const LB = {}; for (const n of ['hips', 'spine', 'chest', 'neck', 'head', 'thighL', 'thighR', 'shinL', 'shinR', 'upperarmL', 'upperarmR', 'forearmL', 'forearmR']) { const b = lisa.getObjectByName(n) || lisa.getObjectByName(n.replace(/(L|R)$/, '.$1')); if (b) LB[n] = { b, q: b.quaternion.clone() }; }
  const qx = (a) => new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), a), qz = (a) => new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), a);
  const rotB = (n, q) => { const e = LB[n]; if (e) e.b.quaternion.copy(e.q).multiply(q); };
  let TT = 0;   // tiempo global del fotograma (lo fija cada update; Lisa flota con el)
  const STRIDE = 0.7;   // metros por ciclo de paso (fase = distancia / STRIDE: los pies no patinan)
  /** Lisa: phase = ciclo del paso, walk 0..1, lean 0..1 (se inclina al cuello de Ava), vis 0..1 (sale de la oscuridad) */
  const lisaPose = ({ phase = 0, walk = 0, lean = 0, vis = 1, tilt = 0.18 } = {}) => {
    for (const e of Object.values(LB)) e.b.quaternion.copy(e.q);
    // v3 (usuario): Lisa NUNCA camina: levita. Piernas quietas (rodillas apenas flojas), pies sobre el suelo, flota y deriva despacio
    rotB('shinL', qx(-0.06)); rotB('shinR', qx(-0.04)); rotB('thighL', qx(0.05)); rotB('thighR', qx(0.03));
    rotB('spine', qx(0.10 + 0.30 * lean)); rotB('chest', qx(0.06 + 0.25 * lean)); rotB('neck', qx(0.12 + 0.25 * lean).multiply(qz(tilt + 0.15 * lean)));   // + = hacia delante (encorvada)
    rotB('head', qz(0.10 + 0.12 * lean).multiply(qx(0.15 * lean)));
    rotB('upperarmL', qx(0.04 * Math.sin(TT * 0.8))); rotB('upperarmR', qx(-0.04 * Math.sin(TT * 0.8 + 1)));
    lisa.position.set(0.015 * Math.sin(TT * 0.6), (0.25 - 0.12 * lean) + 0.03 * Math.sin(TT * 1.7), 0);   // v3b: 25 cm sobre el suelo (en la inclinacion baja un poco para llegar al cuello)
    lShadow.material.opacity = 0.5 * Math.min(1, vis * 1.5) * (1 - 0.15 * Math.sin(TT * 1.7)); lShadow.scale.setScalar(1 - 0.06 * Math.sin(TT * 1.7)); lisa.rotation.z = 0.02 * Math.sin(TT * 0.9);
    const k = 0.12 + 0.88 * vis; lMats.forEach((m) => { m.color.setRGB(k, k, k * 0.97); m.opacity = Math.min(1, vis * 1.8); m.depthWrite = vis > 0.6; });
    lisaW.visible = vis > 0.01;
  };

  // ================= estado por plano =================
  const RED = new THREE.Color(0xff2a14), WARM = new THREE.Color(0xffd890);
  const state = ({ loop = 0, hero = true, lisaOn = false, red = 0, crtOn = false, ceil = true, bath = 0.0, lightK = 1, endOpen = 0, startOpen = 0 } = {}) => {
    ch.root.visible = hero; phoneG.visible = false; bathG.visible = true; stairG.visible = true; ground.visible = false; lisaW.visible = lisaOn; hall.ceil.visible = ceil;
    const col = WARM.clone().lerp(RED, red);
    lanterns.forEach((p) => { p.color.copy(col); p.intensity = 5.2 * p.userData.k * lightK; });
    lampL.intensity = 1.8 * lightK * (1 - red); lampL2.intensity = 1.6 * lightK * (1 - red); roomL.intensity = 5.5 * lightK; roomL.color.copy(new THREE.Color(0xfff0c8).lerp(RED, red));
    hemi.color.set(0xc4ccaa).lerp(RED, red * 0.7); hemi.intensity = (1.05 - 0.4 * red) * lightK;
    radioL.intensity = loop >= 1 ? 1.4 : 0; radioLed.visible = loop >= 1;
    bathPiv.rotation.y = -bath * 1.4; bathL.intensity = bath > 0.05 ? 1.2 : 0;   // abre hacia dentro del bano (+Z)
    endPiv.rotation.y = -endOpen * 1.3; startPiv.rotation.y = startOpen * 1.3;
    crtL.intensity = crtOn ? 1.6 : 0; crtScreen.visible = crtOn; pwrLed.visible = crtOn;
    scene.fog.color.set(0x0a0c08).lerp(new THREE.Color(0x200404), red); scene.fog.near = 5; scene.fog.far = 16;
  };
  // puertas con bisagra (la de entrada se abre hacia el pasillo; la doble del bucle hacia fuera, al negro)
  const startPiv = new THREE.Group(); startPiv.position.set(-0.45, 0, ZS + 0.02); scene.add(startPiv); startDoor.position.set(0.45, 0, 0); startDoor.scale.set(1.04, 1, 1); startPiv.add(startDoor);
  const endPiv = new THREE.Group(); endPiv.position.set(DOOR_X - 0.75, 0, RZ1 - 0.03); scene.add(endPiv); endDoor.position.set(0.75, 0, 0); endPiv.add(endDoor);
  const drawCRT = (t, txt = true) => {   // la tele: el pasillo en verde (lineas de fuga), barrido, FREE CAM y coordenadas, todo dentro de 64x52
    const c = crtCv.getContext('2d'), w = 64, h = 52; px(c, 0, 0, '#031208', w, h);
    c.strokeStyle = '#2a8a3a'; c.lineWidth = 1; const vx = 32 + 4 * Math.sin(t * 0.7), vy = 24;
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(vx + (x ? 5 : -5), vy + (y ? 5 : -5)); c.stroke(); }
    c.strokeRect(vx - 5, vy - 5, 10, 10); px(c, vx - 2, vy - 1, '#0a3a12', 4, 6);
    for (let y = 0; y < h; y += 2) px(c, 0, y, 'rgba(0,0,0,0.35)', w, 1);
    px(c, 0, Math.floor((t * 40) % h), 'rgba(140,255,150,0.25)', w, 2);
    if (txt) { c.fillStyle = '#9cff9c'; c.font = 'bold 8px monospace'; c.textAlign = 'left'; c.fillText('FREE CAM', 4, 10);
      c.font = '6px monospace'; const n = (k) => (Math.sin(t * (0.9 + k) + k) * 9).toFixed(1); c.fillText(`X ${n(1)}`, 4, 36); c.fillText(`Y ${n(2)}`, 4, 43); c.fillText(`Z ${n(3)}`, 4, 50); }
    // esquinas redondeadas del tubo
    c.fillStyle = '#0c120e'; for (const [x, y] of [[0, 0], [w - 2, 0], [0, h - 2], [w - 2, h - 2]]) c.fillRect(x, y, 2, 2);
    crtTex.needsUpdate = true;
  };
  const freeCamHud = (t) => (lt, dt, a, o) => {   // overlay verde de la camara libre: ARRIBA A LA DERECHA (lejos del HUD y de los subtitulos)
    const c = o.tctx; const n = (k) => (Math.sin(t() * (0.9 + k) + k) * 9).toFixed(2);
    c.fillStyle = 'rgba(0,20,6,0.55)'; c.fillRect(226, 44, 122, 44);
    bitText(c, 'FREE CAM', 287, 54, 1, '#9cff9c', { outline: null });
    c.fillStyle = '#9cff9c'; c.font = '8px monospace'; c.textAlign = 'left'; c.fillText(`X ${n(1)}  Y ${n(2)}`, 232, 71); c.fillText(`Z ${n(3)}  ROT ${(t() * 37 % 360).toFixed(0)}`, 232, 82);
    if (Math.floor(lt * 2) % 2 === 0) { px(c, 18, 118, '#ff3020', 6, 6); c.fillStyle = '#ff6050'; c.fillText('REC', 28, 124); }
  };
  const out = {};
  const AW = 1.0;   // velocidad de paso de Ava (m/s); el clip walk a speed 1 avanza ~1 m/s
  const walkSeg = (from = 0, speed = 1) => [L.seg('walk', -99, { loop: true, from, speed })];
  const behind = (pos, yaw, d) => V(pos.x - Math.sin(yaw) * d, 0, pos.z - Math.cos(yaw) * d);
  /** Lisa detras de Ava (d m), con su paso; side = corrimiento lateral (derecha de Ava +). La cabeza nunca entra en el pelo de Ava (>= 0,3 m) */
  const placeLisa = (pos, yaw, d, o, side = 0) => {
    lisaW.position.copy(behind(pos, yaw, d)).add(V(Math.cos(yaw) * -side, 0, Math.sin(yaw) * side)); lisaW.rotation.y = yaw; lisaPose(o);
    if (!ch.root.visible || !o.lean) return;
    for (let it = 0; it < 3; it++) {
      lisaW.updateMatrixWorld(true); ch.root.updateMatrixWorld(true);
      const lh = LB.head.b.getWorldPosition(V()).add(V(Math.sin(yaw) * 0.09, 0.05, Math.cos(yaw) * 0.09)), ah = AVA_HEAD.getWorldPosition(V());
      const dd = Math.hypot(lh.x - ah.x, lh.z - ah.z) - (Math.abs(lh.y - ah.y) > 0.25 ? 0 : 0.3);
      if (dd >= 0) break;
      lisaW.position.add(V(-Math.sin(yaw), 0, -Math.cos(yaw)).multiplyScalar(-dd + 0.01));
    }
  };
  // tramo B: los planos 07-09 se escriben en coordenadas del tramo A (Ava hacia -Z, bano a su derecha) y se llevan al tramo B
  const toB = (v) => { const r = v.clone().applyAxisAngle(V(0, 1, 0), -Math.PI / 2); return r.add(V(-1.95, 0, -8.8)); };
  const lookB = (c, p, t) => look(c, toB(p), toB(t));

  // 01 (como el TikTok): de frente, Ava camina hacia la camara por el pasillo A con Lisa YA visible a su espalda;
  // la camara empuja y orbita a un 3/4 lateral que deja ver a las dos
  { const c = cam(50);
    out['01_hall'] = { scene, camera: c, overlay: vign(0.35), update(lt, t) {
      state({ lisaOn: true }); const q = L.q15(lt), P = V(-0.12, 0, 1.4 - AW * 0.95 * q); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, walkSeg(0, 0.95), [[-99, 'half', mouthAt(t, 'neutral')]]);
      placeLisa(P, Math.PI, 0.42, { phase: (1.4 - P.z) / STRIDE, walk: 1, vis: 0.85 }, -0.16);   // corrida a su izquierda: se ve desde el primer frame (TikTok)
      const k = L.smooth((lt - 1.3) / 1.6);   // 0 = de frente, 1 = 3/4 lateral
      const ang = 1.05 * k, r = L.lerp(4.6 - 2.6 * L.smooth(lt / 1.4), 2.05, k);
      const cp = V(P.x + Math.sin(ang) * Math.min(r, 0.85 / Math.max(0.01, Math.sin(ang)) || r), 1.55 - 0.1 * k, P.z - Math.cos(ang) * r);
      cp.x = Math.min(cp.x, HW - 0.1);
      look(c, cp, V(P.x - 0.05, 1.3 - 0.1 * k, P.z + 0.25 * k));
      c.fov = L.lerp(50, 60, k); c.updateProjectionMatrix();
    } };
  }
  // 02 FILE (RE): 2014 -> 2019, a maquina (una tecla por letra)
  { const fs = new THREE.Scene(); fs.background = new THREE.Color(0x000000); const fc = cam(45);
    const PWd = 300, PHd = 250, PXL = 30, PYT = 120, INK = '#2a2016';
    const paper = document.createElement('canvas'); paper.width = PWd; paper.height = PHd;
    { const c = paper.getContext('2d'), img = c.createImageData(PWd, PHd), Rr = L.rng(14);
      for (let y = 0; y < PHd; y++) for (let x = 0; x < PWd; x++) { const i = (y * PWd + x) * 4, e = Math.min(x, y, PWd - 1 - x, PHd - 1 - y), edge = e < 8 ? (8 - e) * 5 : 0, n = (Rr() - 0.5) * 14;
        img.data[i] = 222 + n - edge; img.data[i + 1] = 212 + n - edge * 1.2; img.data[i + 2] = 176 + n - edge * 1.6; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0); c.strokeStyle = 'rgba(120,80,30,0.22)'; c.lineWidth = 2; c.beginPath(); c.arc(250, 40, 16, 0, 6.3); c.stroke(); }
    const LINES = [['P.T. RELEASED AUG 2014', 0.1, INK], ['LISA FOUND  SEP 2019', 1.15, '#8a1810']];   // v2: menos texto, 20 letras/s (una tecla por letra)
    out['02_file'] = { scene: fs, camera: fc, update() {}, overlay(lt, dt, a, o) {
      const c = o.tctx, prev = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      px(c, 14, 70, '#2c3040', 332, 22); px(c, 14, 70, '#7a8094', 332, 1); px(c, 18, 74, '#04060e', 324, 14);
      bitText(c, 'FILE', 40, 81, 1, '#9cf09c', { outline: null }); bitText(c, 'SILENT HILLS?', 290, 81, 1, '#c8ccd8', { outline: null });
      const sl = Math.round(14 * (1 - ease(0, 0.25, lt))); c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, PYT + sl + 4, PWd, PHd); c.drawImage(paper, PXL, PYT + sl);
      LINES.forEach(([s, t0, col], i) => { const n = Math.max(0, Math.floor((lt - t0) * 20)); if (n) left(c, s.slice(0, n), 50, PYT + sl + 34 + i * 28, 1, col); });
      const t = T.file + lt, k1 = Math.max(0, Math.floor((t - W.five + 0.1) * 14)), k2 = Math.max(0, Math.floor((t - W.years) * 14));
      if (k1) bitText(c, '2014'.slice(0, k1), 110, PYT + sl + 160, 3, INK, { outline: null });
      if (k1 >= 4) bitText(c, '>', LW / 2, PYT + sl + 160, 3, '#8a1810', { outline: null });
      if (k2) bitText(c, '2019'.slice(0, k2), 250, PYT + sl + 160, 3, '#8a1810', { outline: null });
      if (t > W.years + 0.5) bitText(c, '5 YEARS. NOBODY SAW HER.', LW / 2, PYT + sl + 210, 1, INK, { outline: null });
      c.imageSmoothingEnabled = prev;
    } };
  }
  // 03 bucle: vuelta 0 por el tramo B hasta el cuarto del fondo y la puerta doble (se abre al negro) -> corte en el negro ->
  // vuelta 1: la camara cruza la puerta de entrada detras de ella (la radio suena al fondo) -> corte por su espalda ->
  // vuelta 2: tramo B en rojo, la puerta del bano entreabierta
  { const c = cam(56);
    const t1 = 2.55, t2 = 5.0, D = T.turn - T.loop;
    out['03_loop'] = { scene, camera: c, overlay(lt, dt, a, o) {
      vign(0.38)(lt, dt, a, o); const c2 = o.tctx;
      const bl = Math.max(1 - Math.abs(lt - t1) / 0.14, 1 - Math.abs(lt - t2) / 0.22, 0); if (bl > 0) { c2.fillStyle = `rgba(0,0,0,${Math.min(1, bl * 1.3)})`; c2.fillRect(0, 0, LW, LH); }
    }, update(lt, t) {
      const q = L.q15(lt);
      if (lt < t1) {
        state({ loop: 0, endOpen: ease(0.9, 1.9, lt) });
        const path = [[0, 5.2, 0, -8.8], [1.4, 7.6, 0, -8.85], [2.0, 8.1, 0, -8.2], [t1, 8.2, 0, -7.3]];
        const P = cr(path, q), P2 = cr(path, q + 0.05); ch.root.position.copy(P); ch.root.rotation.y = Math.atan2(P2.x - P.x, P2.z - P.z);
        ch.pose(lt, walkSeg(0, 1.3), [[-99, 'half', 'neutral']]);
        const cp = cr([[0, 3.6, 1.6, -8.75], [1.4, 6.0, 1.62, -8.9], [t1, 7.7, 1.55, -8.6]], lt);
        look(c, cp, V(P.x + 0.6, 1.3, P.z + 0.3));
      } else if (lt < t2) {
        state({ loop: 1, lightK: 1.0, startOpen: 1 - ease(1.2, 2.2, lt - t1) });
        const u = q - t1, P = V(0.0, 0, 2.3 - AW * 1.15 * u); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
        ch.pose(lt, walkSeg(0.3, 1.1), [[-99, 'half', 'frown']]);
        const cp = cr([[0, 0.05, 1.7, 3.6], [0.6, 0.1, 1.7, 2.75], [1.5, 0.2, 1.62, P.z + 1.6], [t2 - t1, 0.05, 1.45, P.z + 1.0]], u);   // cruza la puerta; se acerca a su espalda solo en el negro del corte
        look(c, cp, V(-0.15, 1.3, P.z - 3));
      } else {
        const u = q - t2; state({ loop: 2, red: ease(0, 0.6, u), bath: 0.25 + 0.2 * ease(0.4, 1.6, u) });
        const P = V(1.6 + AW * 0.9 * u, 0, -8.85); ch.root.position.copy(P); ch.root.rotation.y = Math.PI / 2;
        ch.pose(lt, walkSeg(0.6, 0.9), [[-99, 'sad', 'frown']]);
        const cp = cr([[0, P.x - 0.5, 1.45, -8.85], [0.8, 0.6, 1.5, -8.95], [D - t2, 0.55, 1.55, -9.05]], u);   // v2: por debajo del farol
        look(c, cp, V(P.x + 2.4, 1.25, -8.6));
      }
    } };
  }
  // 04 respiracion -> se da vuelta: la camara gira con ella (whip) y mira el pasillo vacio
  { const c = cam(50);
    out['04_turn'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ loop: 2 });
      const q = L.q15(lt), tt = W.turn - T.turn, wz = Math.min(q, tt);
      const P = V(0.0, 0, -4.0 - 0.75 * wz); ch.root.position.copy(P);
      const k = ease(tt - 0.05, tt + 0.45, q); ch.root.rotation.y = Math.PI + Math.PI * k;
      ch.pose(lt, [L.seg('walk', -99, { loop: true, speed: 0.75 }), L.seg('look_around', tt - 0.1, { fade: 0.2, from: 0.2, speed: 0.6 }), L.seg('idle', tt + 1.0, { loop: true, fade: 0.3 })],
        [[-99, 'half', 'frown'], [W.breathing - T.turn, 'surprised', 'gasp'], [tt, 'shocked', 'gasp'], [W.nothing - T.turn, 'sad', 'frown']]);
      const ang = Math.PI * L.smooth((q - tt + 0.02) / 0.5), r = 1.25;
      const cp = V(P.x + Math.sin(ang) * r * 0.55, 1.55, P.z - Math.cos(ang) * r);
      if (q < tt) cp.z -= 0.2 * (tt - q);
      const tgt = q < tt ? V(P.x, 1.45, P.z) : V(P.x - 0.1, 1.3, P.z + 4.0 * ease(tt, tt + 0.6, q) + 0.01);
      if (q > tt + 0.6) cp.z += 0.35 * (q - tt - 0.6);   // v2: empuje lento hacia el pasillo vacio (sin aire muerto)
      look(c, cp, q < tt ? tgt : V(P.x, 1.45, P.z).lerp(tgt, ease(tt + 0.1, tt + 0.55, q)));
    } };
  }
  // 05 la tele CRT (mesita a la derecha de A) con FREE CAM -> la camara se suelta de Ava y vuela sola
  { const c = cam(46), tcut = W.see - T.crt - 0.1, SCR = V(0.408, 0.86, -0.935);
    out['05_crt'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.4)(lt, dt, a, o); if (lt > tcut) freeCamHud(() => T.crt + lt)(lt - tcut, dt, a, o); }, update(lt, t) {
      const q = L.q15(lt);
      if (lt < tcut) {   // empuje recto hacia la pantalla (sin inclinar)
        state({ crtOn: true, hero: false }); drawCRT(t, t > W.modder - 0.1);
        look(c, cr([[0, -0.7, 1.3, -0.5], [tcut, -0.72, 1.05, -0.9]], lt), SCR.clone().add(V(0, -0.03, 0)));
      } else {
        state({ crtOn: true }); drawCRT(t);
        const u = q - tcut, P = V(-0.05, 0, -1.6 - AW * u); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
        ch.pose(lt, walkSeg(), [[-99, 'half', 'neutral']]);
        const cp = cr([[0, -0.1, 1.55, P.z + 1.2], [0.6, -0.05, 1.65, -0.8], [1.6, -0.35, 2.15, -0.3], [3.0, 0.4, 2.3, 0.3]], u);
        look(c, cp, V(0.3 * Math.sin(u * 1.3), 1.0 - 0.15 * u, -5.0));
        c.rotation.z += 0.08 * Math.sin(u * 1.7);
      }
    } };
  }
  // 06 revelacion: orbita alrededor de Ava -> Lisa pegada a su espalda, paso a paso (sale de la oscuridad). FREE CAM arriba a la derecha
  { const c = cam(48);
    out['06_reveal'] = { scene, camera: c, overlay(lt, dt, a, o) { vign(0.42)(lt, dt, a, o); freeCamHud(() => T.reveal + lt)(lt + 3, dt, a, o); }, update(lt, t) {
      state({ lisaOn: true }); const q = L.q15(lt), P = V(0.0, 0, -1.8 - 0.55 * q); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('walk', -99, { loop: true, speed: 0.55 })], [[-99, 'half', 'neutral']]);
      placeLisa(P, Math.PI, 0.42, { phase: (0.55 * q) / STRIDE, walk: 1, vis: ease(0.0, 1.0, lt) * 0.95 + 0.05 }, 0.15);   lisaW.position.z += 0.08;   // v2: asoma del lado de la camara en 'she was' / LISA   // v3: un poco mas separada (los brazos se cruzaban)
      // spline por la pared derecha: de frente -> 3/4 frontal (Lisa asoma) -> por encima de las cabezas -> 3/4 trasero alto
      const tl = W.lisa - T.reveal;   // v3: la voz es mas lenta: la orbita se ancla a 'Lisa'
      const cp = cr([[0, 0.3, 1.6, -2.6], [tl, 0.68, 1.75, -1.7], [tl + 1.2, 0.72, 2.55, 0.1], [tl + 2.4, 0.5, 2.25, 2.2], [tl + 5.0, 0.68, 2.1, 1.8], [tl + 8.0, 0.68, 2.0, 1.6]], lt).add(V(0, 0, P.z));
      look(c, cp, V(P.x, 1.3, P.z + 0.25));
      // v3: sin el empuje viejo (metia la camara dentro de Lisa)
    } };
  }
  // 07 "el juego la escondia" (tramo B, frente al bano): de lado desde dentro del bano, camara lenta: gira -> Lisa se apaga;
  // mira al frente -> vuelve desde lo oscuro. La repeticion desde arriba.
  { const c = cam(54);
    out['07_hid'] = { scene, camera: c, overlay: vign(0.42), update(lt, t) {
      state({ lisaOn: true, lightK: 0.9, bath: 1 }); const q = L.q15(lt);
      const Pa = V(0.0, 0, -5.2 - 0.1 * q), P = toB(Pa); ch.root.position.copy(P);
      const T1 = W.turned - T.hid, T2 = W.face - T.hid, Tb = W.back7 - T.hid, T3 = Tb + 0.35, T4 = T3 + 0.9;
      const turn = ease(T1, T1 + 1.0, q) - ease(T2, T2 + 1.0, q) + ease(T3 + 0.3, T3 + 0.9, q) - ease(T4 + 0.2, T4 + 0.8, q);
      const yaw = Math.PI / 2 + Math.PI * 0.85 * turn; ch.root.rotation.y = yaw;
      ch.pose(lt, [L.seg('walk', -99, { loop: true, speed: 0.35 })], [[-99, 'half', 'neutral'], [T1, 'surprised', 'gasp'], [T2, 'half', 'frown'], [T3, 'shocked', 'gasp'], [T4 + 0.5, 'sad', 'frown']]);
      const gate = lt > T2 && lt < T3 ? ease(Tb - 0.55, Tb + 0.05, lt) : 1;   // v2: vuelve desde lo oscuro justo en 'back'
      const vis = (1 - L.smooth((turn - 0.15) / 0.35)) * gate;
      placeLisa(P, Math.PI / 2, 0.42, { phase: (0.1 * q) / STRIDE, walk: 0.6, vis: Math.max(0, vis) });
      const side = lt < T3 ? 1 : -1;
      if (side > 0) lookB(c, V(2.25 - 0.05 * lt, 1.45, -5.0), V(Pa.x - 0.1, 1.3, Pa.z + 0.2));
      else lookB(c, V(-0.6, 2.35, Pa.z + 1.9), V(Pa.x + 0.1, 1.1, Pa.z + 0.1));
    } };
  }
  // 08 el truco: levanta el telefono (camara frontal) -> pantalla del selfie: la cara de Lisa junto a la suya
  { const c = cam(46), tPh = W.phone - T.selfie, tScr = W.second - T.selfie - 0.7;
    const phoneUI = (lt, dt, a, o) => {
      const c2 = o.tctx; vign(0.25)(lt, dt, a, o);
      px(c2, 0, 0, '#050506', LW, 30); px(c2, 0, LH - 92, '#050506', LW, 92); px(c2, 0, 0, '#050506', 16, LH); px(c2, LW - 16, 0, '#050506', 16, LH);
      px(c2, LW / 2 - 30, 10, '#000', 60, 12); c2.fillStyle = '#d8d8d8'; c2.font = '8px monospace'; c2.textAlign = 'center';
      c2.fillText('VIDEO   PHOTO   SELFIE', LW / 2, LH - 76); px(c2, LW / 2 + 22, LH - 72, '#ffd23f', 24, 1);
      c2.beginPath(); c2.arc(LW / 2, LH - 42, 18, 0, 7); c2.fillStyle = '#e8e8e8'; c2.fill(); c2.beginPath(); c2.arc(LW / 2, LH - 42, 14, 0, 7); c2.fillStyle = '#c8c8c8'; c2.fill();
      if (Math.floor(lt * 2) % 2 === 0) { px(c2, 26, 40, '#ff3020', 6, 6); }
    };
    out['08_selfie'] = { scene, camera: c, hideHud: (lt) => lt > tScr, overlay(lt, dt, a, o) { if (lt > tScr) phoneUI(lt, dt, a, o); else vign(0.38)(lt, dt, a, o); }, update(lt, t) {
      state({ lisaOn: true, lightK: 0.9, bath: 1 }); const Pa = V(0.0, 0, -5.3), P = toB(Pa); ch.root.position.copy(P); ch.root.rotation.y = Math.PI / 2;
      if (lt < tScr) {
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('think', 0.2, { fade: 0.25, speed: 0.8 }), L.seg('phone_look', tPh - 0.6, { fade: 0.3, speed: 0.7 })],
          [[-99, 'open', mouthAt(t, 'smile')], [W.trick - T.selfie, 'wink', mouthAt(t, 'smileOpen')], [W.trick - T.selfie + 0.5, 'open', mouthAt(t, 'smile')], [tPh - 0.6, 'open', 'smile']]);
        if (lt < tPh - 0.6) ch.lookAt(c, 1, 40);   // v2: mira a camara en el truco
        phoneG.visible = lt > tPh - 0.3;
        placeLisa(P, Math.PI / 2, 0.42, { phase: 0.25, walk: 0, vis: 0.0 });
        const u0 = L.smooth(lt / tScr);   // v2: 3/4 frontal desde el pasillo, empuje lento: se ve el telefono en su mano antes del selfie
        lookB(c, V(Pa.x - 0.55 + 0.1 * u0, 1.5, Pa.z - 2.1 + 0.5 * u0), V(Pa.x + 0.02, 1.25 + 0.1 * u0, Pa.z));
      } else {
        const u = lt - tScr; ch.pose(lt, [L.seg('idle', -99, { loop: true })], [[-99, 'open', 'smile'], [W.second - T.selfie + 0.1, 'surprised', 'gasp']]);
        const em = ease(0.2, 1.6, u); placeLisa(P, Math.PI / 2, 0.34, { phase: 0.25, walk: 0, lean: 0.25, vis: em }, 0.2 + 0.25 * (1 - em));   // v2: sale de la sombra deslizandose desde atras, ~2 s
        lookB(c, V(Pa.x + 0.08, 1.6, Pa.z - 0.66 + 0.03 * Math.sin(u * 2)), V(Pa.x + 0.08, 1.5, Pa.z + 0.2)); c.rotation.z += 0.02 * Math.sin(u * 1.4);
        ch.lookAt(c, 1, 35);
      }
    } };
  }
  // 09 Lisa se acerca a su cuello (sin atravesar el pelo: placeLisa la frena a 0,3 m de la cabeza): aliento. Perfil desde el bano
  const tBreath = L.cvs(32, 32, (c) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(230,236,240,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const breath = []; for (let i = 0; i < 6; i++) { const s = L.plane(0.12, 0.12, L.basic(tBreath, 0xffffff, { transparent: true, depthWrite: false, opacity: 0 }), 0, 0, 0, scene); s.visible = false; breath.push(s); }
  const puff = (from, dir, t, cam) => breath.forEach((s, i) => { const k = ((t * 0.7 + i / breath.length) % 1); s.position.copy(from).add(dir.clone().multiplyScalar(k * 0.25)); s.position.y += k * 0.04; s.scale.setScalar(0.5 + k * 1.4); s.material.opacity = 0.45 * Math.sin(Math.PI * k); s.lookAt(cam.position); s.visible = true; });
  const noPuff = () => breath.forEach((s) => { s.visible = false; });
  const lisaMouth = () => { lisaW.updateMatrixWorld(true); return LB.head.b.getWorldPosition(V()).add(V(-0.09, -0.06, 0)); };   // B: Lisa mira a +X
  { const c = cam(50);
    out['09_lean'] = { scene, camera: c, overlay: vign(0.45), update(lt, t) {
      state({ lisaOn: true, lightK: 0.85, bath: 1 }); const Pa = V(0.0, 0, -5.3), P = toB(Pa); ch.root.position.copy(P); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('idle', -99, { loop: true })], [[-99, 'half', 'neutral'], [W.breath - T.lean, 'shocked', 'gasp']]);
      const ln = ease(0.2, 2.2, lt); placeLisa(P, Math.PI / 2, 0.4 - 0.06 * ln, { lean: 0.8 * ln, vis: 1 }, 0.07 * ln);
      lookB(c, V(Pa.x + 2.3 - 0.25 * lt, 1.55, Pa.z + 0.22), V(Pa.x, 1.48, Pa.z + 0.22));
      if (lt > 1.4) { const m = lisaMouth(); m.x += 0.12; puff(m, V(0.3, -0.03, 0), lt, c); } else noPuff();
    } };
  }
  // 09b "Oh, fudge": frontal, >.< con mueca; Lisa asomada por su hombro
  { const c = cam(42);
    out['09_fudge'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ lisaOn: true, lightK: 0.85, bath: 1 }); const Pa = V(0.0, 0, -5.3), P = toB(Pa); ch.root.position.copy(P); ch.root.rotation.y = Math.PI / 2;
      ch.pose(lt, [L.seg('shrug', 0, { from: 0.25, speed: 0.5 })], [[-99, 'shocked', 'gasp'], [0.35, 'scared', 'gasp']]);
      placeLisa(P, Math.PI / 2, 0.32, { lean: 0.55, vis: 1, tilt: 0.1 }, 0.22);
      lookB(c, V(Pa.x - 0.1, 1.5, Pa.z - 1.7 + 0.08 * lt), V(Pa.x, 1.42, Pa.z));
      ch.lookAt(c, 1, 40);
      { const m = lisaMouth(); m.x += 0.1; puff(m, V(0.3, -0.03, 0), lt + 3, c); }
    } };
  }
  // 10 "it was real": grua desde su espalda hasta una vista cenital oblicua del pasillo en L entero (sin techo, como el TikTok):
  // las dos figuras caminan por el tramo A; se lee la L, la ventana, el giro y el cuarto del fondo
  { const c = cam(46);
    out['10_crane'] = { scene, camera: c, overlay: vign(0.4), update(lt, t) {
      state({ lisaOn: true, ceil: lt < 0.45, lightK: 1.0 }); noPuff();
      const up = ease(0.3, 2.4, lt); scene.fog.near = 5 + 40 * up; scene.fog.far = 16 + 60 * up; hemi.intensity = 1.05 + 0.6 * up; bathG.visible = stairG.visible = up < 0.5; ground.visible = up > 0.2;
      const q = L.q15(lt), P = V(0.0, 0, -0.5 - 0.6 * q); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('walk', -99, { loop: true, speed: 0.6 })], [[-99, 'sad', 'neutral']]);
      placeLisa(P, Math.PI, 0.45, { phase: (0.6 * q) / STRIDE, walk: 1, vis: 1 }, -0.32);   // a su izquierda: desde arriba se ven las dos
      const cp = cr([[0, 0.55, 2.0, P.z + 1.6], [1.0, 0.8, 4.4, P.z + 2.6], [3.3, 1.6, 10.5, 2.2]], lt);   // v3: mas baja: el pasillo llena el cuadro
      look(c, cp, V(L.lerp(P.x, 0.6, up), 0, L.lerp(P.z - 0.3, -3.4, up)));
    } };
  }
  // 11 CTA: Ava camina y no mira atras; Lisa detras, corrida a su izquierda: se leen las dos. 3/4 alto por detras
  { const c = cam(50);
    out['11_send'] = { scene, camera: c, overlay: vign(0.42), update(lt, t) {
      state({ lisaOn: true, lightK: 0.9 });
      const q = L.q15(lt), P = V(0.18, 0, -0.5 - AW * 0.8 * q); ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('walk', -99, { loop: true, speed: 0.8 })], [[-99, 'half', 'neutral']]);
      placeLisa(P, Math.PI, 0.5, { phase: (0.8 * q) / STRIDE, walk: 1, vis: 1 }, -0.42);
      look(c, cr([[0, 0.62, 2.25, 2.1], [3.8, 0.6, 2.15, 1.3]], lt), V(-0.05, 1.0, P.z - 1.2));
    } };
  }
  // 12 tarjeta final: la radio girando + DON'T LOOK BACK. + FOLLOW FOR MORE! (radio y texto juntos)
  { const es = new THREE.Scene(); es.background = new THREE.Color(0x000000); const ec = cam(30); ec.position.set(0, 0, 3.0); ec.lookAt(0, 0, 0);
    es.add(new THREE.AmbientLight(0xffffff, 1.6)); const dl = new THREE.DirectionalLight(0xfff2dc, 1.4); dl.position.set(2, 3, 4); es.add(dl);
    const r2 = makeRadio(); const g = new THREE.Group(); g.add(r2); r2.position.set(0, -0.12, 0); g.position.set(0, 0.06, 0); g.scale.setScalar(1.3); es.add(g);
    out['12_end'] = { scene: es, camera: ec, update(lt) { const q = L.q15(lt); g.rotation.y = -0.5 + q * 0.25; g.rotation.x = 0.12; }, overlay(lt, dt, a, o) {
      const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 26px "Courier New", monospace'; c.fillStyle = '#ff4a3a'; c.fillText("DON'T LOOK BACK.".slice(0, Math.floor(lt * 14)), LW / 2, 418);
      if (lt > 1.4) bitText(c, 'FOLLOW FOR MORE!', LW / 2, 480, 2, '#ececec', { outline: null });
    } };
  }
  for (const sh of Object.values(out)) { const up = sh.update; sh.update = (lt, t) => { TT = t ?? lt; up(lt, t); }; }
  return out;
}

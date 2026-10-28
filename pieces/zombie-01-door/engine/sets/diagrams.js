import { reText as bitText, reWidth as textWidth } from '../refont.js';
// sets/diagrams.js — planos 04 (diagrama en corte: 2 tornillos cortos que no llegan al montante), 12 (EXAMINE: tornillo
// de 3" girando), 15 (mismo diagrama: los tornillos largos muerden el montante) y 18 (corte lateral: zombi empuja, barra
// de la manija al suelo). Contrato: SETS.md. Prefijo propio: D*.
export async function shots(ctx) {
  const { L, TL, examine } = ctx;
  const { THREE, LW, LH } = L;
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const W = (w, k = 0) => { const r = TL.words.filter((x) => x[0] === w); return r[Math.min(k, r.length - 1)]; };   // [w, s, e, ...]
  const keys = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t < K[i][0]) { const [a, va] = K[i - 1], [b, vb] = K[i]; return va + (vb - va) * L.smooth((t - a) / (b - a)); } return K[K.length - 1][1]; };
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');

  // ---------- texturas ----------
  const Dwood = (seed, base, dark, vertical = false, freq = 0.55) => L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(seed), ph = []; for (let i = 0; i < 64; i++) ph.push(r() * 6.28);
    const A = hexRGB(base), B = hexRGB(dark), img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = vertical ? y : x, v = vertical ? x : y;
      const s = Math.sin((v + 2.2 * Math.sin(u * 0.098 + ph[v % 7]) + 1.2 * Math.sin(u * 0.29 + ph[(v >> 3) % 64])) * freq);
      let k = s > 0.55 ? 0.85 : s > 0.1 ? 0.45 : 0.08; k += (r() - 0.5) * 0.18; k = Math.min(1, Math.max(0, k));
      const i = (y * w + x) * 4; for (let j = 0; j < 3; j++) img.data[i + j] = A[j] + (B[j] - A[j]) * k; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const tStud = Dwood(11, '#ff8c1e', '#e0640c');
  const tStudDark = Dwood(12, '#d86a1c', '#9c4210', true, 0.9);
  const tTrimTop = Dwood(13, '#ec9a5a', '#c87038');
  const tTrim = Dwood(14, '#dc8040', '#b45a24', false, 0.7);
  const tDoor = Dwood(15, '#3e2216', '#2a160e', true, 0.5);
  const tGrid = L.cvs(32, 32, (c) => { c.fillStyle = '#0a1630'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#1c3664'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32); });
  const tGridFloor = L.cvs(32, 32, (c) => { c.fillStyle = '#0b1834'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#20406e'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32); });
  const tParquet = L.cvs(64, 64, (c, w, h) => {   // espiga: columnas de 8 px con tablillas inclinadas alternas
    const r = L.rng(5), sh = []; for (let i = 0; i < 400; i++) sh.push(0.8 + r() * 0.32);
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = Math.floor(x / 8), lx = x % 8, s = col % 2 ? 1 : -1, v = y + s * lx + 64, st = Math.floor(v / 4), ly = ((v % 4) + 4) % 4;
      const k = sh[(col * 37 + st * 11) % 400] * (lx === 0 || ly === 0 ? 0.66 : 1) * (0.95 + 0.1 * (((x * 7 + y * 13) % 11) === 0));
      const i = (y * w + x) * 4; img.data[i] = 196 * k; img.data[i + 1] = 118 * k; img.data[i + 2] = 52 * k; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const tDoorSide = Dwood(16, '#8a3e22', '#6a2a16', true, 0.6);
  const tDoorEdge = Dwood(17, '#7a5c48', '#5a4232', true, 0.8);

  // caja con un material por cara (px nx py ny pz nz): [tex|null, color]; sombreado plano "a mano" (MeshBasic)
  const Dbox = (w, h, d, faces, x, y, z, parent) => {
    const mats = faces.map(([t, c]) => L.basic(t, c));
    return L.mesh(new THREE.BoxGeometry(w, h, d), mats, x, y, z, parent);
  };
  const DboxAt = (x0, x1, y0, y1, z0, z1, faces, parent) => Dbox(x1 - x0, y1 - y0, z1 - z0, faces, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent);

  // ---------- tornillo para madera (eje +Y, cabeza en y=0, punta en y=len) ----------
  function Dscrew({ len = 1, r = 0.03, pitch = 0.04, headR = 0.07, headH = 0.03, pan = false, color = 0xe9dcb4 }) {
    const g = new THREE.Group(), tip = r * 3.2, pts = [new THREE.Vector2(0.0001, len), new THREE.Vector2(r, len - tip)];
    for (let y = len - tip; y > headH * 0.2 + pitch; y -= pitch) { pts.push(new THREE.Vector2(r * 1.3, y - pitch * 0.5)); pts.push(new THREE.Vector2(r, y - pitch)); }
    pts.push(new THREE.Vector2(r, 0)); pts.push(new THREE.Vector2(0.0001, 0));
    pts.reverse();
    const shaftM = L.lam(null, 0xffffff, { flatShading: true, vertexColors: true });
    const geo = new THREE.LatheGeometry(pts, 8), pos = geo.attributes.position, cols = [], base = new THREE.Color(color), dark = base.clone().multiplyScalar(0.42);
    for (let i = 0; i < pos.count; i++) { const rr = Math.hypot(pos.getX(i), pos.getZ(i)), cc = rr > r * 1.15 || pos.getY(i) > len - tip - 0.001 ? base : dark; cols.push(cc.r, cc.g, cc.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const shaft = new THREE.Mesh(geo, shaftM); g.add(shaft);
    const headM = L.lam(null, color, { flatShading: true });
    let head;
    if (pan) { head = new THREE.Mesh(new THREE.CylinderGeometry(headR * 0.92, headR, headH, 10), headM); head.position.y = -headH / 2; }
    else { head = new THREE.Mesh(new THREE.CylinderGeometry(headR * 0.55, headR, headH, 10), headM); head.position.y = headH / 2 - headH * 0.2; }
    g.add(head);
    if (pan) {   // cruz Phillips en la cara de la cabeza
      const xm = L.basic(null, 0x18140c);
      L.box(headR * 1.25, 0.004, headR * 0.26, xm, 0, -headH - 0.002, 0, g); L.box(headR * 0.26, 0.004, headR * 1.25, xm, 0, -headH - 0.002, 0, g);
    }
    g.userData = { shaftM, headM, base: new THREE.Color(color) };
    return g;
  }
  const Dlights = (scene, k = 1) => {
    scene.add(new THREE.AmbientLight(0xffffff, 1.25 * k));
    const d = new THREE.DirectionalLight(0xffffff, 1.9 * k); d.position.set(-1.2, 2.2, 2.4); scene.add(d);
    return d;
  };

  // ---------- etiquetas de diagrama (cajita oscura + borde 1 px + texto pixel + linea fina hasta el objeto) ----------
  const FS = Number(L.QS.get('fs') ?? 16), SP = Number(L.QS.get('sp') ?? 2), FW = Number(L.QS.get('fw') ?? 400), TH = Number(L.QS.get('th') ?? 110), LHT = 13, PX = 6, PY = 5;
  function Dline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  /** lines: texto (\n = 2 lineas); (cx, cy) centro de la caja; col borde; tgt [x,y] pantalla o null; at [fx,fy] punto de la caja de
   *  donde sale la linea (0..1); k = aparicion 0..1 (fundido desde negro) */
  function Dlabel(o, text, cx, cy, col, tgt, at = [0.5, 0], k = 1, { dot = true } = {}) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n');
    const tw = Math.max(...lines.map((s) => textWidth(s, 1)));   // fuente bitmap 5x7 (Pixelify cerraba C/2/3)
    const w = Math.round(tw + 2 * PX), h = lines.length * LHT + 2 * PY - 1, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', '#f4f4f4', k);
    if (tgt) {
      const ax = x + at[0] * (w - 1), ay = y + at[1] * (h - 1);
      Dline(c, ax, ay, tgt[0], tgt[1], bc);
      if (dot) { c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + PY + 6 + i * LHT, 1, fc, { outline: null }));
  }
  // texto pixel fino (Pixelify 400, sin antialias): pixelText va siempre en 700 y a este tamano cierra la C, el 2 y la S
  const dtc = document.createElement('canvas'); dtc.width = LW; dtc.height = 32; const dtx = dtc.getContext('2d', { willReadFrequently: true });
  const dto = document.createElement('canvas'); dto.width = LW; dto.height = 32; const dtoc = dto.getContext('2d');
  function Dtext(c, s, cx, cy, col) {
    dtx.clearRect(0, 0, LW, 32); dtx.font = `${FW} ${FS}px Pixelify`; dtx.textAlign = 'center'; dtx.textBaseline = 'middle'; dtx.letterSpacing = `${SP}px`;
    dtx.fillStyle = '#fff'; dtx.fillText(s, LW / 2, 16); dtx.letterSpacing = '0px';
    const d = dtx.getImageData(0, 0, LW, 32), im = dtoc.createImageData(LW, 32), rgb = hexRGB(col);
    for (let i = 0; i < LW * 32; i++) if (d.data[i * 4 + 3] > TH) { im.data[i * 4] = rgb[0]; im.data[i * 4 + 1] = rgb[1]; im.data[i * 4 + 2] = rgb[2]; im.data[i * 4 + 3] = 255; }
    dtoc.putImageData(im, 0, 0); c.drawImage(dto, Math.round(cx - LW / 2), Math.round(cy - 16));
  }
  const fadeIn = (lt, t0, d = 0.15) => L.clamp01((lt - t0) / d);
  const scr = (cam, v) => L.toScreen(cam, v.x, v.y, v.z);

  // ---------- 04 / 15: diagrama en corte del marco (pared + montante arriba, tapajuntas de pino, puerta, cerrojo) ----------
  // Corte del marco visto desde delante y un poco desde abajo (Y arriba): el montante (stud) es el bloque naranja grande
  // entre las 2 placas de yeso blancas, mas arriba; el tapajuntas de pino (trim) debajo, con su cara superior clara; la hoja
  // (oscura) baja desde el tapajuntas; cerrojo gris y tornillos de pie sobre el tapajuntas (dibujados encima, "rayos X").
  const Y_TR = 0, Y_SB = 0.55, Z_SC = 0.06;
  const XR = { depthTest: false, depthWrite: false };
  function Dframe() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x09142c);
    Dlights(scene);
    const gm = L.basic(L.rep(tGrid, 16, 16), 0xffffff, { side: THREE.BackSide });   // sala con cuadricula azul tenue
    L.box(14, 14, 14, gm, 0, 1, -1, scene);
    const SF = [0.8, 0.8, 0.9, 0.62, 1.0, 0.6];
    const stud = DboxAt(-0.75, 0.75, Y_SB, 1.95, -1.6, -0.2, [[tStud, SF[0]], [tStud, SF[1]], [tStud, SF[2]], [tStudDark, SF[3]], [tStud, SF[4]], [tStud, SF[5]]], scene);
    stud.userData.SF = SF;
    const dw = (x0, x1, inner) => DboxAt(x0, x1, Y_SB - 0.02, 5, -1.8, -0.12, [[null, inner === 0 ? 0xc4c6cc : 0xeeeef0], [null, inner === 1 ? 0xc4c6cc : 0xeeeef0], [null, 0xf8f8f8], [null, 0x9a9ca0], [null, 0xf4f4f6], [null, 0x909296]], scene);
    const dwL = dw(-0.92, -0.75, 0), dwR = dw(0.75, 0.92, 1);
    // tapajuntas de pino: tabla + escalon delantero a la izquierda de la puerta
    DboxAt(-1.02, 0.95, Y_TR, 0.3, -0.45, 0.1, [[tTrim, 0.8], [tTrim, 0.7], [tTrimTop, 1.0], [tTrimTop, 1.0], [tTrim, 0.88], [tTrim, 0.6]], scene);
    DboxAt(-1.02, 0.12, -0.5, Y_TR, -0.2, 0.62, [[tTrim, 0.78], [tTrim, 0.7], [tTrimTop, 0.96], [tTrim, 0.74], [tTrim, 0.86], [tTrim, 0.6]], scene);
    // hoja de la puerta (oscura), baja fuera de cuadro
    DboxAt(0.12, 0.9, -6, Y_TR - 0.004, 0.1, 0.48, [[tDoor, 0.55], [tDoor, 0.7], [tDoor, 0.75], [tDoor, 0.5], [L.rep(tDoor, 1, 6), 1.0], [tDoor, 0.6]], scene);
    // cerradero (laton) y cerrojo (gris)
    DboxAt(0.12, 0.9, Y_TR, Y_TR + 0.01, -0.02, 0.1, [[null, 0xb08a30], [null, 0xb08a30], [null, 0xe8c050], [null, 0x806020], [null, 0xd0a840], [null, 0x806020]], scene);
    DboxAt(0.33, 0.56, -0.32, Y_SB - 0.14, 0.3, 0.52, [[null, 0x9c9ea2], [null, 0xb4b6ba], [null, 0xd8dade], [null, 0x808286], [null, 0xbcbec2], [null, 0x8a8c90]], scene);
    return { scene, stud, dwL, dwR };
  }
  const DscrewXR = (o) => { const s = Dscrew(o); s.traverse((m) => { if (m.isMesh) { Object.assign(m.material, XR); m.renderOrder = m.geometry.type === 'LatheGeometry' ? 10 : 11; } }); return s; };

  // ---------- 04: 2 tornillos diminutos ----------
  function shot04() {
    const F = Dframe(), { scene } = F;
    const cam = new THREE.PerspectiveCamera(58, LW / LH, 0.05, 60);
    const sx = [0.2, 0.7], LS = 0.3;
    const screws = sx.map((x) => { const s = DscrewXR({ len: LS, r: 0.042, pitch: 0.036, headR: 0.1, headH: 0.025 }); s.position.set(x, Y_TR, Z_SC); scene.add(s); return s; });
    const bars = sx.map((x) => { const b = L.plane(0.075, Y_SB + 0.12 - LS - 0.03, L.basic(null, 0xff1a10, XR), x, (LS + 0.03 + Y_SB + 0.12) / 2, Z_SC, scene); b.renderOrder = 9; return b; });
    const T = 4.0, tLock = W('lock')[1] + 0.12 - T, tScrews = W('screws')[1] + 0.1 - T, tTrimL = W('screws')[2] + 0.26 - T;
    const tWall = W("don't")[1] - T, tClose = W("don't")[1] - T, tReach = W('reach')[1] - T;   // usuario: NOT EVEN CLOSE y el parpadeo en "don't even reach"
    const P = (x, y, z) => new THREE.Vector3(x, y, z);
    return {
      scene, camera: cam,
      update(lt) {
        const k = lt / 4.7;
        cam.position.set(0.15 - 0.05 * k, -1.35 + 0.04 * k, 5.3 - 0.1 * k); cam.lookAt(0.07, -0.75, 2.36); cam.fov = 44.6; cam.updateProjectionMatrix();
        const hi = lt > tScrews - 0.15 && lt < tScrews + 0.75;   // los tornillos se iluminan al decir "screws"
        for (const s of screws) { s.userData.shaftM.color.setScalar(hi ? 1.25 : 1); s.userData.headM.color.set(hi ? 0xffffff : 0xe9dcb4); }
        const blink = lt > tWall && (Math.floor((lt - tWall) / 0.2) % 3 !== 2);
        for (const b of bars) b.visible = blink;
      },
      overlay(lt, dt, a, o) {
        const c = o.camera;
        if (lt > tLock && lt < tScrews) Dlabel(o, 'DEADBOLT', 96, 486, '#e4e4e8', scr(c, P(0.36, -0.25, 0.52)), [0.62, 0], fadeIn(lt, tLock));
        if (lt > tScrews) Dlabel(o, '2 TINY SCREWS\n3/4 INCH', 247, 493, '#f0bc3c', scr(c, P(sx[1], LS * 0.6, Z_SC)), [0.5, 0], fadeIn(lt, tScrews));
        if (lt > tTrimL) Dlabel(o, 'THIN PINE\nTRIM', 83, 332, '#e8a888', scr(c, P(-0.6, Y_TR, -0.15)), [0.5, 0], fadeIn(lt, tTrimL));
        if (lt > tReach) Dlabel(o, 'THE WALL\n(STUD)', 180, 140, '#58d058', [127, 150], [0, 0.6], fadeIn(lt, tReach));
        if (lt > tClose) Dlabel(o, 'NOT EVEN\nCLOSE', 266, 298, '#ee4a48', scr(c, P(sx[0] - 0.12, Y_SB - 0.02, Z_SC)), [0.2, 0], fadeIn(lt, tClose));
      },
    };
  }

  // ---------- 15: tornillos de 3" entran girando y muerden el montante ----------
  function shot15() {
    const F = Dframe(), { scene } = F;
    const cam = new THREE.PerspectiveCamera(58, LW / LH, 0.05, 60);
    const sx = [0.2, 0.7], LS = 1.35;
    const screws = sx.map(() => { const s = DscrewXR({ len: LS, r: 0.04, pitch: 0.036, headR: 0.1, headH: 0.025 }); scene.add(s); return s; });
    const T = 26.0, tIn0 = W('bite')[1] - T, tIn1 = W('into')[2] - T, tLab = W('they', 0)[1] - T, tBones = W('bones')[1] + 0.2 - T, tStud = W('stud')[1] - T;
    const studM = F.stud.material, SF = F.stud.userData.SF;
    const P = (x, y, z) => new THREE.Vector3(x, y, z);
    return {
      scene, camera: cam,
      update(lt) {
        const k = lt / 3.1;
        cam.position.set(0.64 - 0.2 * k, -1.13 + 0.05 * k, 4.49 - 0.08 * k); cam.lookAt(0.27, -0.45, 1.6); cam.fov = 46.5; cam.updateProjectionMatrix();
        const u = ease(tIn0, tIn1 - 0.08, lt), y = Y_TR - 1.0 * (1 - u);
        screws.forEach((s, i) => { s.position.set(sx[i], y, Z_SC); s.rotation.y = u * 14 + i; });
        // el montante se ilumina un poco al decir "the stud"
        const hl = lt > tStud ? 1 + 0.14 * Math.max(0, 1 - (lt - tStud) / 0.9) : 1;
        studM.forEach((m, i) => m.color.setScalar(SF[i] * hl));
      },
      overlay(lt, dt, a, o) {
        const c = o.camera;
        if (lt > tLab) Dlabel(o, '3 INCH SCREWS', 253, 325, '#58d058', scr(c, P(sx[1], 0.85, Z_SC)), [0.57, 0], fadeIn(lt, tLab));
        if (lt > tBones) Dlabel(o, 'STUD =\nTHE BONES', 297, 88, '#58d058', scr(c, P(-0.35, 1.2, -0.2)), [0.25, 1], fadeIn(lt, tBones));
      },
    };
  }

  // ---------- 12: EXAMINE, tornillo de 3" girando sobre negro ----------
  function shot12() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const d = new THREE.DirectionalLight(0xffffff, 2.6); d.position.set(-1, 2, 3); scene.add(d);
    const cam = new THREE.PerspectiveCamera(40, LW / LH, 0.05, 60); cam.position.set(0, 0, 6); cam.lookAt(0, 0, 0);
    const LEN = 2.05, s = Dscrew({ len: LEN, r: 0.068, pitch: 0.085, headR: 0.165, headH: 0.08, pan: true, color: 0xead8aa });
    s.position.y = -LEN / 2 + 0.08;
    const spin = new THREE.Group(); spin.add(s);
    const piv = new THREE.Group(); piv.add(spin); scene.add(piv);
    piv.rotation.order = 'ZXY';
    const TH = [[0, 28], [0.3, 34], [0.5, 46], [0.7, 68], [0.9, 86], [1.1, 96], [1.4, 136], [1.7, 150], [2.0, 156], [2.8, 158]];
    const PH = [[0, 8], [0.5, 32], [1.5, 30], [2.0, 18], [2.8, 48]];
    const SC = [[0, 1], [2.1, 1], [2.8, 0.7]];
    return {
      scene, camera: cam, hard: true,
      update(lt) {
        const q = L.q15(lt);
        piv.rotation.z = (keys(TH, q) - 90) * Math.PI / 180;
        piv.rotation.x = -keys(PH, q) * Math.PI / 180;
        spin.rotation.y = q * 5.5;
        piv.scale.setScalar(keys(SC, q));
        piv.position.set(-0.03, 0.62, 0);
      },
      overlay(lt, dt, a, o) { examine(o, lt, '3-INCH SCREWS x8', 'Long enough to bite into the\nwall stud.'); },
    };
  }

  // ---------- 18: corte lateral, zombi empuja, barra de la manija al suelo ----------
  async function Dzombie() {
    const g = await L.loadModel('models/city-zombie.glb');
    const root = L.ps1Clone(g.scene);
    // recolor PS1: ropa azul claro (pijama de hospital) y piel palida, con manchas de sangre (la textura original es casi toda roja)
    root.traverse((m) => {
      if (!m.isMesh) return;
      const list = Array.isArray(m.material) ? m.material : [m.material];
      list.forEach((mt) => {
        if (!mt.map || !mt.map.image) return;
        const im = mt.map.image, cv = document.createElement('canvas'); cv.width = Math.min(128, im.width); cv.height = Math.min(128, im.height);
        const c = cv.getContext('2d'); c.drawImage(im, 0, 0, cv.width, cv.height);
        const d = c.getImageData(0, 0, cv.width, cv.height), cloth = /Outfit/i.test(mt.name);
        const base = cloth ? [150, 182, 214] : [176, 182, 170];
        for (let i = 0; i < d.data.length; i += 4) {
          const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2], red = (r - Math.max(gg, b)) / 255, lum = (r * 0.3 + gg * 0.59 + b * 0.11) / 255;
          const v = 0.62 + lum * 1.3;
          const blood = red > (cloth ? 0.5 : 0.42);
          const out = blood ? [150, 18, 14] : base.map((x) => x * v);
          for (let j = 0; j < 3; j++) d.data[i + j] = Math.max(0, Math.min(255, out[j]));
        }
        c.putImageData(d, 0, 0);
        const t = L.canvasTex(cv); t.flipY = false; t.needsUpdate = true; mt.map = t; mt.needsUpdate = true;
      });
    });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = 1.8 / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), clip = THREE.AnimationClip.findByName(g.animations, L.QS.get('zc') ?? 'Zombie_Reaction_Hit'), act = mixer.clipAction(clip); act.play();
    return { root: wrap, inner: root, set(t) { act.time = ((t % clip.duration) + clip.duration) % clip.duration; mixer.update(0); }, dur: clip.duration };
  }
  async function shot18() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    Dlights(scene, 0.9);
    const cam = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 80);
    // suelo: parquet en espiga delante, rejilla azul detras; corte gris del forjado abajo
    DboxAt(-6, 6, -0.4, 0, -1.4, 0.85, [[null, 0x404048], [null, 0x404048], [L.rep(tParquet, 6, 1.7), 1.0], [null, 0x202024], [null, 0x55555c], [null, 0x303034]], scene);
    const gp = L.plane(40, 30, L.basic(L.rep(tGridFloor, 40, 30)), 0, -0.001, -16.4, scene, 0, -Math.PI / 2);
    void gp;
    // puerta: hoja fina en el plano YZ (x=0), canto hacia la camara
    const DX = 0.03, DZ0 = -0.5, DZ1 = 0.42;
    DboxAt(-DX, DX, 0, 2.2, DZ0, DZ1, [[L.rep(tDoorSide, 1, 1), 0.95], [tDoorSide, 0.7], [tDoorEdge, 0.8], [tDoorEdge, 0.4], [L.rep(tDoorEdge, 1, 3), 1.0], [tDoorEdge, 0.6]], scene);
    // manija (lado +x) y barra hasta el suelo
    const H = new THREE.Vector3(DX + 0.02, 1.02, 0.12), F = new THREE.Vector3(Number(L.QS.get('fx') ?? 0.78), 0.03, Number(L.QS.get('fz') ?? -0.45));
    DboxAt(DX, DX + 0.06, 0.99, 1.05, 0.06, 0.2, Array(6).fill([null, 0x9a9aa0]), scene);
    const bar = L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 6), L.lam(null, 0x9aa0aa), 0, 0, 0, scene);
    bar.position.copy(H).add(F).multiplyScalar(0.5); bar.scale.y = H.distanceTo(F);
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), F.clone().sub(H).normalize());
    const foot = L.mesh(new THREE.BoxGeometry(0.09, 0.05, 0.07), L.basic(null, 0x101010), F.x, F.y, F.z, scene); foot.quaternion.copy(bar.quaternion);
    // linea verde de agarre en el suelo, al pie de la barra
    const grip = L.plane(0.7, 0.05, L.basic(null, 0x18c88a), F.x + 0.22, 0.004, F.z, scene, 0, -Math.PI / 2); grip.visible = false;
    // zombi empujando desde fuera (lado -x)
    let Z = null;
    try { Z = await Dzombie(); Z.root.rotation.order = 'YXZ'; Z.root.rotation.y = Math.PI / 2; scene.add(Z.root); }
    catch (e) { console.warn('zombie', e); }
    const T = 34.6, tPush = W('push', 2)[1] + 0.18 - T, tDigs = W('digs')[1] - T;
    const ZT = Number(L.QS.get('zt') ?? 0.3), ZX = Number(L.QS.get('zx') ?? -0.32), ZZ = Number(L.QS.get('zz') ?? -0.15), ZR = Number(L.QS.get('zr') ?? -0.1);
    return {
      scene, camera: cam,
      update(lt) {
        const k = lt / 3.4;
        cam.position.set(0.45 + 0.04 * k, 1.05, 3.1 - 0.08 * k); cam.lookAt(0.14 + 0.02 * k, 0.98, 0); cam.updateProjectionMatrix();
        if (Z) { Z.set(ZT + 0.05 * Math.sin(L.q15(lt) * 6)); Z.root.position.set(ZX, 0, ZZ); Z.root.rotation.x = ZR; }
        grip.visible = lt > tDigs;
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, q = L.q15(lt);
        // 3 flechas rojas grandes contra la puerta, laten
        const px = Math.round(3 * Math.sin(q * 2 * Math.PI * 2.2));
        for (const y of [150, 303, 443]) Darrow(c, -12 + px, y, 113 + px, y, 21, 50, 50, '#ff2a12', '#d81a08');
        Dlabel(o, 'PUSH', 83, 252, '#f05050', [-1, 158], [0.05, 0], 1, { dot: false });
        // flecha naranja a lo largo de la barra
        if (lt > tPush) {
          const g = ease(tPush, tPush + 0.2, lt), p0 = scr(cam, H), p1 = scr(cam, H.clone().lerp(F, 0.6));
          Darrow(c, p0[0] + 2, p0[1] + 4, p0[0] + (p1[0] - p0[0]) * g, p0[1] + (p1[1] - p0[1]) * g, 12, 30, 28, '#ff6a12', '#e05408');
          if (lt > tPush + 0.2) Dlabel(o, 'BAR', 287, 173, '#f0a040', scr(cam, H.clone().lerp(F, 0.58)), [0.5, 1], fadeIn(lt, tPush + 0.2));
        }
        // flecha azul hacia abajo al pie de la barra + MORE GRIP
        if (lt > tDigs) {
          const g = ease(tDigs, tDigs + 0.18, lt), pf = scr(cam, F), x = pf[0] + 6, y1 = pf[1] + 6, y0 = y1 - 100;
          Darrow(c, x, y0, x, y0 + (y1 - y0) * g, 13, 30, 30, '#1450f0', '#0a34b8');
          if (lt > tDigs + 0.2) Dlabel(o, 'MORE GRIP', 260, 507, '#4cb4d8', [pf[0] + 34, pf[1] - 2], [1, 0], fadeIn(lt, tDigs + 0.2));
        }
      },
    };
  }
  // flecha plana 2D de (x0,y0) a la punta (x1,y1): grosor del cuerpo sw, alto de la cabeza hw, largo de la cabeza hl
  function Darrow(c, x0, y0, x1, y1, sw, hw, hl, col, dark) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 2) return;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, hL = Math.min(hl, len), b = len - hL;
    const P = (s, n) => [x0 + ux * s + nx * n, y0 + uy * s + ny * n];
    const poly = (pts, f) => { c.fillStyle = f; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
    poly([P(0, -sw / 2), P(b, -sw / 2), P(b, -hw / 2), P(len, 0), P(b, hw / 2), P(b, sw / 2), P(0, sw / 2)], dark);
    poly([P(0, -sw / 2), P(b, -sw / 2), P(b, -hw / 2), P(len, 0), P(b + 2, sw * 0.1), P(0, sw * 0.1)], col);
  }

  return { '04_diag_screws': shot04(), '12_examine': shot12(), '15_diag_stud': shot15(), '18_diag_bar': await shot18() };
}

import { reText as bitText, reWidth as textWidth } from '../refont.js';
// sets/diagrams.js (ep2 ventana) — 05 (corte: tabla clavada a la moldura fina, el clavo se sale), 08 (EXAMINE: contrachapado
// girando sobre la rejilla verde del inventario), 09 (frontal: hueco con montantes, lamina +4 in, STUD vs TRIM) y 11 (corte
// cenital: lamina dentro vs fuera). Contrato: SETS.md. Prefijo propio: D*. Etiquetas/animaciones en la palabra (TL.words).
export async function shots(ctx) {
  const { L, TL, examine } = ctx;
  const { THREE, LW, LH } = L;
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  // palabra w con inicio >= after (s globales) -> [w, s, e, ...]
  const Wd = (w, after = 0) => TL.words.find((x) => x[0] === w && x[1] >= after);
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const fadeIn = (lt, t0, d = 0.15) => L.clamp01((lt - t0) / d);
  const scr = (cam, x, y, z) => L.toScreen(cam, x, y, z);

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
  const tBoard = Dwood(21, '#ff8c1e', '#e0640c');
  const tBoardV = Dwood(22, '#ff8c1e', '#d8600c', true);
  const tStud = Dwood(23, '#ff9428', '#e06a10', true, 0.7);
  const tStudH = Dwood(24, '#ff9428', '#e06a10', false, 0.7);
  const tTrim = Dwood(25, '#f2ede2', '#cfc6b4', false, 0.8);
  const tPly = Dwood(26, '#f0a454', '#c8783a', false, 0.35);
  const tPlyDark = Dwood(27, '#8a5a32', '#6a4024', false, 0.3);
  const tGrid = L.cvs(32, 32, (c) => { c.fillStyle = '#0a1630'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#1c3664'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32); });
  const tConc = L.cvs(64, 64, (c, w, h) => {   // hormigon gris granulado (ref: bloques grises con poro)
    const r = L.rng(31), img = c.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const v = 128 + (r() - 0.5) * 70 + (r() < 0.06 ? -50 : 0); img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v + 4; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0);
  });
  const tWall = L.cvs(64, 64, (c, w, h) => {   // yeso/ladrillo beige del corte
    const r = L.rng(32), img = c.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const v = (r() - 0.5) * 30; img.data[i * 4] = 196 + v; img.data[i * 4 + 1] = 186 + v; img.data[i * 4 + 2] = 168 + v; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0);
  });
  const tPlyEdge = L.cvs(64, 16, (c) => {   // canto del contrachapado: chapas horizontales alternas claras/oscuras
    const r = L.rng(33);
    for (let y = 0; y < 16; y++) { c.fillStyle = y % 3 === 1 ? '#7a4a22' : (y % 3 === 0 ? '#f0c088' : '#d49a5a'); c.fillRect(0, y, 64, 1); }
    c.fillStyle = 'rgba(60,30,10,0.45)'; for (let k = 0; k < 30; k++) c.fillRect(r() * 64 | 0, r() * 16 | 0, 2 + r() * 5 | 0, 1);
  });
  const tInv = L.cvs(64, 64, (c) => {   // rejilla verde del inventario (ref 037)
    c.fillStyle = '#123a26'; c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#1a4a32'; for (let k = 0; k < 64; k += 4) c.fillRect(0, k, 64, 1);
    c.fillStyle = '#3c8a5c'; c.fillRect(0, 0, 64, 2); c.fillRect(0, 0, 2, 64);
  });
  const tCase = Dwood(34, '#2a1a12', '#1a100a', false, 0.5);

  const Dbox = (w, h, d, faces, x, y, z, parent) => L.mesh(new THREE.BoxGeometry(w, h, d), faces.map(([t, c, e]) => L.basic(t, c, e || {})), x, y, z, parent);
  const DboxAt = (x0, x1, y0, y1, z0, z1, faces, parent) => Dbox(x1 - x0, y1 - y0, z1 - z0, faces, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent);
  const shade = (t, f = [0.8, 0.7, 0.95, 0.55, 1.0, 0.6]) => f.map((k) => [t, k]);   // px nx py ny pz nz
  const Dbg = (scene) => {
    scene.background = new THREE.Color(0x09142c);
    L.box(30, 30, 30, L.basic(L.rep(tGrid, 30, 30), 0xffffff, { side: THREE.BackSide }), 0, 0, -6, scene);
  };

  // ---------- etiquetas de diagrama (copiadas del ep1) ----------
  const LHT = 13, PX = 6, PY = 5;
  function Dline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function Dlabel(o, text, cx, cy, col, tgt, at = [0.5, 0], k = 1, { dot = true, fg = '#f4f4f4' } = {}) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n');
    const tw = Math.max(...lines.map((s) => textWidth(s, 1)));
    const w = Math.round(tw + 2 * PX), h = lines.length * LHT + 2 * PY - 1, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', fg, k);
    if (tgt) {
      const ax = x + at[0] * (w - 1), ay = y + at[1] * (h - 1);
      Dline(c, ax, ay, tgt[0], tgt[1], bc);
      if (dot) { c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + PY + 6 + i * LHT, 1, fc, { outline: null }));
  }
  function Darrow(c, x0, y0, x1, y1, sw, hw, hl, col, dark) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 2) return;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, hL = Math.min(hl, len), b = len - hL;
    const P = (s, n) => [x0 + ux * s + nx * n, y0 + uy * s + ny * n];
    const poly = (pts, f) => { c.fillStyle = f; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
    poly([P(0, -sw / 2), P(b, -sw / 2), P(b, -hw / 2), P(len, 0), P(b, hw / 2), P(b, sw / 2), P(0, sw / 2)], dark);
    poly([P(0, -sw / 2), P(b, -sw / 2), P(b, -hw / 2), P(len, 0), P(b + 2, sw * 0.1), P(0, sw * 0.1)], col);
  }
  // ✕ y ✓ gruesos en pixel (trazo de 3 px)
  function Dthick(c, pts, col, wd = 3) { for (let i = 1; i < pts.length; i++) for (let a = -(wd >> 1); a <= wd >> 1; a++) for (let b = -(wd >> 1); b <= wd >> 1; b++) Dline(c, pts[i - 1][0] + a, pts[i - 1][1] + b, pts[i][0] + a, pts[i][1] + b, col); }
  const Dcross = (c, x, y, r, col, k = 1) => { const s = r * L.smooth(k); Dthick(c, [[x - s, y - s], [x + s, y + s]], col); Dthick(c, [[x + s, y - s], [x - s, y + s]], col); };
  const Dcheck = (c, x, y, r, col, k = 1) => { const g = L.smooth(k); const p0 = [x - r, y], p1 = [x - r * 0.35, y + r * 0.65], p2 = [x + r, y - r * 0.8];
    if (g < 0.4) Dthick(c, [p0, [p0[0] + (p1[0] - p0[0]) * g / 0.4, p0[1] + (p1[1] - p0[1]) * g / 0.4]], col);
    else { const h = (g - 0.4) / 0.6; Dthick(c, [p0, p1, [p1[0] + (p2[0] - p1[0]) * h, p1[1] + (p2[1] - p1[1]) * h]], col); } };
  const Dring = (c, x, y, r, col) => { c.fillStyle = col; for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; c.fillRect(Math.round(x + Math.cos(t) * r), Math.round(y + Math.sin(t) * r), 1, 1); } };
  // pop de aparicion (escala tipo "boing" en etiquetas: solo se usa para posicion vertical)
  const XR = { depthTest: false, depthWrite: false };

  // ==================== 05: corte, tabla clavada a una moldura fina ====================
  // Corte visto desde delante y algo arriba. Arriba = FUERA. Muro (beige) a la izquierda con la moldura blanca fina en su
  // cara interior; la tabla naranja por dentro (abajo) cruza el hueco; el clavo sube desde la tabla y apenas muerde la
  // moldura. Flechas rojas empujan por el hueco: en "friction" la tabla y el clavo se salen un poco.
  function shot05() {
    const scene = new THREE.Scene(); Dbg(scene);
    const cam = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 80);
    DboxAt(-3.2, -0.35, 0.34, 2.0, -0.6, 0.6, shade(L.rep(tConc, 1.5, 1), [0.78, 0.7, 1.0, 0.6, 0.85, 0.6]), scene);   // muro
    DboxAt(-3.0, -0.35, 0.12, 0.34, -0.5, 0.62, shade(L.rep(tTrim, 3, 0.4), [0.9, 0.75, 1.1, 0.75, 1.15, 0.65]), scene);                   // moldura fina
    const mov = new THREE.Group(); scene.add(mov);
    DboxAt(-2.6, 3.2, -0.3, 0.12, -0.45, 0.45, [[tBoardV, 0.8], [tBoardV, 0.7], [L.rep(tBoard, 3, 0.6), 1.0], [tBoard, 0.6], [L.rep(tBoard, 3, 0.25), 0.95], [tBoard, 0.6]], mov);   // tabla
    // clavo (rayos X): cabeza bajo la tabla, cana hasta y=0.30 (apenas 0.18 dentro de la moldura)
    const nailM = L.basic(null, 0xe8eef4, XR), nailD = L.basic(null, 0x9aa4b0, XR), NX = -1.1;
    const shaft = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.58, 6), nailM, NX, 0.0, 0.5, mov); shaft.renderOrder = 10;
    const tip = L.mesh(new THREE.ConeGeometry(0.035, 0.08, 6), nailM, NX, 0.33, 0.5, mov); tip.renderOrder = 10;
    const head = L.mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), nailD, NX, -0.31, 0.5, mov); head.renderOrder = 11;
    const T = 9.3, tNails = Wd('nails', 9)[1] - T, tFric = Wd('friction', 10)[1] - T;
    // marcas de friccion (cian) a los lados del clavo dentro de la moldura
    const fr = [];
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const m = L.plane(0.04, 0.03, L.basic(null, 0x40e0ff, XR), NX + s * 0.075, 0.16 + i * 0.06, 0.52, scene); m.renderOrder = 12; m.visible = false; fr.push(m); }
    return {
      scene, camera: cam,
      update(lt) {
        const k = lt / 2.2;
        cam.position.set(0.05 + 0.1 * k, 1.7, 7.6 - 0.35 * k); cam.lookAt(0.05 + 0.05 * k, 0.3, 0); cam.updateProjectionMatrix();
        const q = L.q15(lt), out = ease(tFric, tFric + 0.55, q);
        mov.position.y = -0.17 * out - (q > tFric + 0.55 ? 0.004 * Math.sin(q * 40) : 0);
        for (const m of fr) m.visible = lt > tFric;
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, q = L.q15(lt), push = 0.5 + 0.5 * Math.sin(q * Math.PI * 2 * 2.4), dyb = scr(cam, 0, mov.position.y + 0.12, 0)[1];
        // 3 flechas rojas por el hueco (de fuera hacia dentro), laten
        for (const x of [0.15, 0.75, 1.35]) { const p = scr(cam, x, 0.12, 0.45); Darrow(c, p[0], 175 + 4 * push, p[0], Math.min(dyb, p[1]) - 4 + 3 * push, 22, 50, 46, '#ff2a12', '#d81a08'); }
        if (lt > tNails) {
          Dlabel(o, 'THIN TRIM', 92, 172, '#e8e8ec', scr(cam, -0.6, 0.23, 0.6), [0.75, 1], fadeIn(lt, tNails));
          Dlabel(o, 'NAIL', 78, 505, '#e8e8ec', scr(cam, NX, mov.position.y - 0.12, 0.5), [0.5, 0], fadeIn(lt, tNails));
        }
        if (lt > tFric) Dlabel(o, 'HELD BY\nFRICTION', 210, 470, '#40e0ff', scr(cam, NX + 0.08, 0.2, 0.52), [0, 0.3], fadeIn(lt, tFric));
      },
    };
  }

  // ==================== 08: EXAMINE, contrachapado sobre la rejilla verde ====================
  function shot08() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1.5, 3, 2); scene.add(dl);
    const cam = new THREE.PerspectiveCamera(40, LW / LH, 0.05, 60);
    const lamC = (c) => L.lam(null, c, { flatShading: true });
    const cyl = (r0, r1, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r0, r1, h, n), m, x, y, z, p);
    // maletin RE2: caja oscura, 4x5 casillas con marco biselado (luz arriba-izq, sombra abajo-der)
    const inv = new THREE.Group(); scene.add(inv);
    const tSlot = L.cvs(32, 32, (c) => {
      c.fillStyle = '#0e2a1a'; c.fillRect(0, 0, 32, 32);
      c.fillStyle = '#123a24'; for (let y = 4; y < 30; y += 3) c.fillRect(3, y, 26, 1);
      c.fillStyle = '#06120a'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32);
      c.fillStyle = '#58b07c'; c.fillRect(1, 1, 30, 2); c.fillRect(1, 1, 2, 30);
      c.fillStyle = '#04100a'; c.fillRect(1, 29, 30, 2); c.fillRect(29, 1, 2, 30);
      c.fillStyle = '#2c6e48'; c.fillRect(3, 3, 26, 1); c.fillRect(3, 3, 1, 26);
    });
    DboxAt(-1.75, 1.75, -0.3, -0.02, -2.25, 2.25, shade(tCase, [0.6, 0.5, 0.8, 0.3, 0.7, 0.4]), inv);
    L.plane(3.2, 4.0, L.lam(L.rep(tSlot, 4, 5)), 0, -0.01, 0, inv, 0, -Math.PI / 2);
    for (const [x0, x1, z0, z1] of [[-1.75, 1.75, -2.25, -2.0], [-1.75, 1.75, 2.0, 2.25], [-1.75, -1.6, -2.25, 2.25], [1.6, 1.75, -2.25, 2.25]])
      DboxAt(x0, x1, -0.02, 0.12, z0, z1, shade(tCase, [0.7, 0.55, 0.9, 0.3, 0.8, 0.45]), inv);   // reborde
    for (const s of [-1, 1]) DboxAt(s * 1.75 - 0.03, s * 1.75 + 0.03, 0.12, 0.15, -2.25, 2.25, [0.8, 0.8, 1, 0.5, 0.9, 0.6].map((k) => [null, new THREE.Color(0xb08a3a).multiplyScalar(k)]), inv);   // filo de laton
    // casillas: x -1.2 -0.4 0.4 1.2 ; z -1.6 -0.8 0 0.8 1.6. Lamina = 2x3 (col 0-1, fila 0-2)
    // ESCOPETA (Remington de corredera): fila 0, col 2-3, tumbada a lo largo de X
    const sg = new THREE.Group(); sg.position.set(0.82, 0.14, 0.78); sg.rotation.y = 0.04; sg.scale.set(1.05, 1.5, 2.3); inv.add(sg);
    const mGun = lamC(0x2a2c30), mGun2 = lamC(0x45484e), mWood = L.lam(Dwood(41, '#7a3e1c', '#4e220c'));
    cyl(0.035, 0.035, 1.0, 6, mGun, 0.2, 0.03, 0, sg).rotation.z = Math.PI / 2;          // canon
    cyl(0.03, 0.03, 0.8, 6, mGun2, 0.12, -0.04, 0, sg).rotation.z = Math.PI / 2;         // tubo cargador
    L.box(0.32, 0.09, 0.09, mWood, 0.25, -0.04, 0, sg);                                   // corredera de madera
    for (let i = 0; i < 4; i++) L.box(0.02, 0.095, 0.095, lamC(0x3a1a08), 0.13 + i * 0.08, -0.04, 0, sg);   // estrias
    L.box(0.34, 0.16, 0.1, mGun, -0.42, 0.0, 0, sg);                                      // cajon de mecanismos
    L.box(0.12, 0.03, 0.105, lamC(0x8a8e96), -0.42, 0.02, 0, sg);                         // ventana de expulsion
    L.box(0.1, 0.06, 0.03, mGun, -0.44, -0.11, 0, sg);                                    // guardamonte
    L.box(0.5, 0.13, 0.09, mWood, -0.82, -0.04, 0, sg).rotation.z = 0.12;                 // culata
    L.box(0.04, 0.17, 0.095, lamC(0x141414), -1.06, -0.07, 0, sg);                        // cantonera
    L.box(0.02, 0.03, 0.03, lamC(0xc8c8c8), 0.69, 0.07, 0, sg);                           // punto de mira
    // MUNICION de pistola (caja)
    const tAmmo = L.cvs(32, 32, (c) => { c.fillStyle = '#5a1e14'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#d8b040'; c.fillRect(0, 10, 32, 6);
      c.fillStyle = '#1a0a06'; c.fillRect(3, 19, 26, 10);
      for (let x = 5; x < 28; x += 4) { c.fillStyle = '#d8a840'; c.fillRect(x, 21, 2, 6); c.fillStyle = '#f0d070'; c.fillRect(x, 21, 2, 2); }
      c.fillStyle = '#f0e8d0'; c.fillRect(4, 4, 18, 2); c.fillRect(4, 7, 10, 1); });
    const ammoF = [[null, 0x4a160e], [null, 0x3a120a], [tAmmo, 0xffffff], [null, 0x200806], [null, 0x6a2216], [null, 0x2a0c08]];
    DboxAt(0.12, 0.68, 0, 0.2, -1.05, -0.55, ammoF, inv);
    // SPRAY de primeros auxilios (copiado de ep1 Rspray), tumbado en su casilla
    const tSpray = L.cvs(64, 64, (c) => {
      c.fillStyle = '#bdbab2'; c.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 4) { c.fillStyle = y % 8 ? '#c4c1b8' : '#b6b3aa'; c.fillRect(0, y, 64, 2); }
      c.fillStyle = '#dfe2c8'; c.fillRect(0, 14, 64, 36);
      c.fillStyle = '#2e9a50'; c.fillRect(0, 13, 64, 2); c.fillRect(0, 49, 64, 2);
      c.fillStyle = '#2e9a50'; c.fillRect(8, 19, 4, 12); c.fillRect(4, 23, 12, 4);
      c.font = 'bold 6px monospace'; c.textBaseline = 'top'; c.fillText('FIRST-AID', 0, 38); c.fillText('FIRST-AID', 32, 38);
      c.fillStyle = '#2e9a50'; c.fillRect(40, 19, 4, 12); c.fillRect(36, 23, 12, 4);
      c.fillStyle = '#d0504c'; c.fillRect(39, 32, 6, 6); c.fillRect(38, 33, 8, 4); c.fillStyle = '#f0e8e0'; c.fillRect(41, 33, 2, 4); c.fillRect(40, 34, 4, 2);
    });
    tSpray.wrapS = THREE.RepeatWrapping;
    function Dspray(x, z, ry) {
      const g = new THREE.Group(); g.position.set(x, 0.17, z); g.rotation.set(0, ry, Math.PI / 2); inv.add(g); g.scale.setScalar(4.6);
      const r = 0.032, h = 0.13, mRim = lamC(0x7a6e6a), o = -0.075;
      cyl(r * 1.12, r * 1.12, 0.012, 8, mRim, 0, 0.006 + o, 0, g);
      cyl(r, r, h, 8, L.lam(tSpray), 0, 0.012 + h / 2 + o, 0, g);
      cyl(r * 1.12, r * 1.12, 0.01, 8, mRim, 0, 0.012 + h + o, 0, g);
      cyl(r * 0.45, r, 0.03, 8, lamC(0xd8d6d0), 0, 0.017 + h + 0.015 + o, 0, g);
      L.box(0.014, 0.016, 0.014, lamC(0x2a2a2c), 0, 0.017 + h + 0.038 + o, 0, g);
    }
    Dspray(1.2, -0.8, 0.5);
    // HIERBA VERDE (maceta RE, copiada de ep1 Rherb)
    const leaf = L.cvs(32, 32, (c) => {
      const rr = L.rng(77);
      for (let k = 0; k < 7; k++) { const x = 4 + rr() * 24, y = 4 + rr() * 16, w = 5 + rr() * 4, hh = 8 + rr() * 6, a = (rr() - 0.5) * 0.9;
        c.fillStyle = '#1c5a1a'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2 + 1, hh / 2 + 1, a, 0, 7); c.fill();
        c.fillStyle = '#3aa035'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2, hh / 2, a, 0, 7); c.fill(); }
      c.fillStyle = '#3a5a20'; for (let k = 0; k < 5; k++) c.fillRect(8 + k * 4, 22, 2, 10);
    });
    const herb = new THREE.Group(); herb.position.set(0.4, 0, 0); herb.scale.setScalar(4.4); inv.add(herb);
    cyl(0.05, 0.036, 0.07, 8, lamC(0x9a5a34), 0, 0.035, 0, herb); cyl(0.054, 0.054, 0.012, 8, lamC(0x9a5a34), 0, 0.068, 0, herb);
    cyl(0.046, 0.046, 0.004, 8, lamC(0x3a2414), 0, 0.072, 0, herb);
    const lm = L.lam(leaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) L.plane(0.13, 0.13, lm, 0, 0.13, 0, herb, k * Math.PI / 3);
    // CINTA DE TINTA
    const tInk = L.cvs(32, 16, (c) => { c.fillStyle = '#2a2a30'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#e8e8e0'; c.fillRect(4, 4, 24, 8); c.fillStyle = '#1a1a1a'; c.fillRect(6, 6, 20, 1); c.fillRect(6, 9, 14, 1); });
    DboxAt(0.95, 1.45, 0, 0.12, -0.2, 0.2, [[null, 0x1c1c22], [null, 0x1c1c22], [tInk, 0xffffff], [null, 0x0c0c10], [null, 0x2a2a30], [null, 0x101014]], inv);
    for (const s of [-1, 1]) cyl(0.09, 0.09, 0.03, 8, lamC(0x101012), 1.2 + s * 0.13, 0.135, 0, inv);
    // TALADRO amarillo (fila 3), caja de tornillos + tacos 2x4 (fila 4)
    const drill = new THREE.Group(); drill.position.set(0.85, 0.13, -1.6); inv.add(drill);
    L.box(0.75, 0.22, 0.3, lamC(0xf0b818), 0, 0, 0, drill); L.box(0.3, 0.22, 0.24, lamC(0x202020), -0.5, 0, 0, drill); L.box(0.14, 0.08, 0.08, lamC(0x9aa0a8), 0.44, 0, 0, drill);
    L.box(0.2, 0.2, 0.22, lamC(0x202020), -0.1, -0.02, 0.24, drill); L.box(0.24, 0.12, 0.2, lamC(0x303034), -0.1, -0.03, 0.42, drill);
    DboxAt(0.1, 0.7, 0, 0.18, 1.35, 1.85, [[null, 0x5a1810], [null, 0x5a1810], [L.cvs(16, 8, (c) => { c.fillStyle = '#6a1c14'; c.fillRect(0, 0, 16, 8); c.fillStyle = '#e8e0d0'; for (let y = 2; y < 7; y += 2) c.fillRect(2, y, 12, 1); }), 0xffffff], [null, 0x300c08], [null, 0x7a2418], [null, 0x400e0a]], inv);
    for (const z of [1.45, 1.75]) DboxAt(0.9, 1.5, 0, 0.13, z - 0.11, z + 0.11, shade(tStudH, [0.8, 0.7, 1.0, 0.5, 0.9, 0.6]), inv);
    // col 0-1 filas 3-4: hierba, spray, municion, cartuchos de escopeta
    const herb2 = herb.clone(); herb2.position.set(-1.2, 0, 1.6); inv.add(herb2);
    Dspray(-0.4, 1.6, -0.3);
    DboxAt(-0.68, -0.12, 0, 0.2, 0.55, 1.05, ammoF, inv);
    const sh2 = new THREE.Group(); sh2.position.set(-1.2, 0.07, 0.75); inv.add(sh2);
    for (let i = 0; i < 4; i++) { const x = -0.18 + i * 0.12; cyl(0.05, 0.05, 0.3, 6, lamC(0xb02018), x, 0, 0, sh2).rotation.x = Math.PI / 2; cyl(0.052, 0.052, 0.07, 6, lamC(0xc8a040), x, 0, 0.17, sh2).rotation.x = Math.PI / 2; }
    // la lamina de contrachapado (5/8 in): ocupa 2x3 casillas
    const ply = new THREE.Group(); inv.add(ply);
    const edgeM = L.lam(L.rep(tPlyEdge, 2, 1)), edgeM2 = L.lam(L.rep(tPlyEdge, 2.5, 1));
    L.mesh(new THREE.BoxGeometry(1.45, 0.1, 2.2), [edgeM2, edgeM2, L.lam(L.rep(tPly, 1.1, 1.4)), L.lam(tPlyDark), edgeM, edgeM], 0, 0, 0, ply);
    const counts = [['7', 1.55, 1.15], ['15', 0.75, -0.45], ['x2', 1.55, 0.35], ['x8', 0.75, 1.95], ['x6', 1.55, 1.95], ['15', -0.05, 1.15], ['x4', -0.85, 1.15]];
    return {
      scene, camera: cam, hard: true,
      update(lt) {
        const q = L.q15(lt);
        cam.position.set(0, 8.6, 6.4); cam.lookAt(0, 0, 0.55); cam.updateProjectionMatrix();
        inv.position.set(0, 0, -0.35);
        // la lamina se levanta de su casilla y gira despacio ensenando el canto (examinar objeto)
        const up = ease(0, 0.6, q);
        ply.position.set(-0.8, 0.08 + 0.95 * up, -0.8 + 0.2 * up);
        ply.rotation.set(-0.5 * up + 0.12 * Math.sin(q * 1.4), q * 0.9, 0.18 * up);
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, P = (x, z, y = 0.02) => scr(cam, x, y, z - 0.35), q = L.q15(lt);
        // cursor de seleccion parpadeante sobre las casillas de la lamina
        const col = Math.floor(q * 4) % 2 === 0 ? '#ffe048' : '#b08418';
        const k = [P(-1.6, -2.0), P(0, -2.0), P(0, 0.4), P(-1.6, 0.4)];
        for (let i = 0; i < 4; i++) { const p0 = k[i], p1 = k[(i + 1) % 4]; for (const d of [0, 1]) Dline(c, p0[0] + d, p0[1] + d, p1[0] + d, p1[1] + d, col); }
        for (const p of k) { c.fillStyle = col; c.fillRect(p[0] - 2, p[1] - 2, 5, 5); }
        // contadores de las casillas (verde RE2, esquina inferior derecha)
        for (const [s, x, z] of counts) { const p = P(x, z, 0.0); bitText(c, s, p[0] - textWidth(s, 1) / 2 - 2, p[1] - 6, 1, '#9cf09c', { outline: '#000000' }); }
        // menu lateral RE2: EQUIP / USE / CHECK / COMBINE con CHECK resaltado
        const items = ['EQUIP', 'USE', 'CHECK', 'COMBINE'], mx = 262, my = 30, mw = 86, mh = 14, H = items.length * mh + 8;
        c.fillStyle = 'rgba(6,10,16,0.92)'; c.fillRect(mx, my, mw, H);
        c.fillStyle = '#8a90a8'; c.fillRect(mx, my, mw, 1); c.fillRect(mx, my + H - 1, mw, 1); c.fillRect(mx, my, 1, H); c.fillRect(mx + mw - 1, my, 1, H);
        items.forEach((s, i) => {
          const y = my + 4 + i * mh, sel = s === 'CHECK';
          if (sel) { c.fillStyle = '#284a8a'; c.fillRect(mx + 3, y, mw - 6, mh - 1); c.fillStyle = '#ffe048'; c.fillRect(mx + 5, y + 4, 3, 5); }
          bitText(c, s, mx + 12 + textWidth(s, 1) / 2, y + 7, 1, sel ? '#ffffff' : '#7a8098', { outline: null });
        });
        bitText(c, 'ITEMS', 40, 37, 1, '#9cf09c', { outline: null });
        examine(o, lt, 'PLYWOOD 5/8 in  x1', 'One sheet. No gaps for hands.');
      },
    };
  }

  // ==================== 09: frontal del hueco con montantes, lamina encima ====================
  // Medidas: hueco x [-1.2,1.2] y [-1.2,1.4]; moldura 0.12 alrededor; montantes x +-[1.22,1.62]; dintel y [1.4,1.85];
  // alfeizar y [-1.55,-1.2]; patas bajo el alfeizar. Lamina = hueco + 0.4 (4 in) por cada lado.
  const HX0 = -1.2, HX1 = 1.2, HY0 = -1.2, HY1 = 1.4, M4 = 0.4;
  function shot09() {
    const scene = new THREE.Scene(); Dbg(scene);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const cam = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 80);
    const sf = [0.8, 0.62, 0.95, 0.5, 1.0, 0.55];
    DboxAt(-1.62, -1.22, -4.2, 4.6, -0.3, 0, shade(L.rep(tStud, 1, 4), sf), scene);   // montantes
    DboxAt(1.22, 1.62, -4.2, 4.6, -0.3, 0, shade(L.rep(tStud, 1, 4), sf), scene);
    DboxAt(-1.22, 1.22, HY1, 1.85, -0.3, 0, shade(tStudH, sf), scene);               // dintel
    DboxAt(-1.22, 1.22, -1.55, HY0, -0.3, 0, shade(tStudH, sf), scene);              // alfeizar
    for (const x of [-0.7, 0, 0.7]) DboxAt(x - 0.13, x + 0.13, -4.2, -1.55, -0.3, 0, shade(L.rep(tStud, 1, 2), sf), scene);   // patas
    for (const x of [-0.6, 0.6]) DboxAt(x - 0.13, x + 0.13, 1.85, 4.6, -0.3, 0, shade(L.rep(tStud, 1, 2), sf), scene);
    // hueco oscuro detras
    L.plane(2.4, 2.6, L.basic(null, 0x05080f), 0, 0.1, -0.31, scene);
    // moldura fina blanca alrededor del hueco
    const trimM = L.basic(L.rep(tTrim, 2, 0.3), 0xffffff);
    L.box(2.64, 0.12, 0.05, trimM, 0, HY1 + 0.06, 0.03, scene); L.box(2.64, 0.12, 0.05, trimM, 0, HY0 - 0.06, 0.03, scene);
    L.box(0.12, 2.6, 0.05, trimM, HX0 - 0.06, 0.1, 0.03, scene); L.box(0.12, 2.6, 0.05, trimM, HX1 + 0.06, 0.1, 0.03, scene);
    // lamina (semitransparente como la ref para ver el marco detras)
    const plyM = L.basic(L.rep(tPly, 1.5, 1.8), 0xd8a070, { transparent: true, opacity: 0.72 });
    const ply = L.box(2.4 + 2 * M4, 2.6 + 2 * M4, 0.06, plyM, 0, 0.1, 0.1, scene);
    const T = 19.8, tFour = Wd('four', 20)[1] - T, tEvery = Wd('every', 21)[1] - T, tScrew = Wd('screw', 23)[1] - T,
      tStuds = Wd("studs", 24)[1] - T, tTrimW = Wd('trim', 24.5)[1] - T, tHole = Wd('hole', 21)[1] - T;
    // posiciones de tornillo: sobre montantes, dintel y alfeizar (fuera del hueco)
    const SCR = [];
    for (const y of [-1.25, -0.55, 0.15, 0.85, 1.55]) { SCR.push([-1.42, y]); SCR.push([1.42, y]); }
    for (const x of [-0.6, 0.6]) { SCR.push([x, 1.62]); SCR.push([x, -1.38]); }
    return {
      scene, camera: cam,
      update(lt) {
        const k = lt / 5.75;
        cam.position.set(0.08 - 0.12 * k, 0.3, 10.2 - 0.6 * k); cam.lookAt(0.02 - 0.06 * k, 0.15, 0); cam.updateProjectionMatrix();
        void ply;
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, P = (x, y, z = 0.14) => scr(cam, x, y, z);
        // contorno discontinuo del hueco (dentro de la lamina) en cuanto se dice "hole"
        if (lt > tHole - 0.9) {
          const p0 = P(HX0, HY1), p1 = P(HX1, HY0), col = mixHex('#000000', '#e8e8ec', fadeIn(lt, tHole - 0.9, 0.3));
          c.fillStyle = col;
          for (let x = p0[0]; x <= p1[0]; x++) if ((x >> 2) % 2 === 0) { c.fillRect(x, p0[1], 1, 1); c.fillRect(x, p1[1], 1, 1); }
          for (let y = p0[1]; y <= p1[1]; y++) if ((y >> 2) % 2 === 0) { c.fillRect(p0[0], y, 1, 1); c.fillRect(p1[0], y, 1, 1); }
          if (lt < tScrew) Dlabel(o, 'THE HOLE', (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 40, '#e8e8ec', null, [0.5, 1], fadeIn(lt, tHole - 0.9, 0.3));
        }
        // cotas +4 in: lado derecho en "four", los 4 en "every"
        const dim = (side, k) => {
          if (k <= 0) return;
          const col = mixHex('#000000', '#f0c040', k);
          let a0, a1, lx, ly;
          if (side === 'R') { a0 = P(HX1, 0.1); a1 = P(HX1 + M4, 0.1); lx = a1[0] + 26; ly = a1[1] - 34; }
          if (side === 'L') { a0 = P(HX0, 0.1); a1 = P(HX0 - M4, 0.1); lx = a1[0] - 6; ly = a1[1] + 58; }
          if (side === 'T') { a0 = P(0.45, HY1); a1 = P(0.45, HY1 + M4); lx = a1[0] + 64; ly = a1[1] - 10; }
          if (side === 'B') { a0 = P(-0.45, HY0); a1 = P(-0.45, HY0 - M4); lx = a1[0] - 40; ly = a1[1] + 30; }
          Dline(c, a0[0], a0[1], a1[0], a1[1], col); Dline(c, a0[0], a0[1] + 1, a1[0], a1[1] + 1, col);
          // topes de la cota
          const vx = a1[0] - a0[0], vy = a1[1] - a0[1], n = Math.hypot(vx, vy) || 1, nx = -vy / n * 4, ny = vx / n * 4;
          for (const p of [a0, a1]) Dline(c, p[0] - nx, p[1] - ny, p[0] + nx, p[1] + ny, col);
          Dlabel(o, '+4 in', lx, ly, '#f0c040', [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2], [0.5, 0.5], k, { dot: false });
        };
        if (lt > tFour) dim('R', fadeIn(lt, tFour));
        if (lt > tEvery) { dim('T', fadeIn(lt, tEvery)); dim('L', fadeIn(lt, tEvery + 0.1)); dim('B', fadeIn(lt, tEvery + 0.2)); }
        // puntos de tornillo (aparecen en cadena desde "screw")
        SCR.forEach(([x, y], i) => {
          const ti = tScrew + i * 0.05; if (lt < ti) return;
          const p = P(x, y), pop = lt - ti < 0.1 ? 2 : 0;
          c.fillStyle = '#103010'; c.fillRect(p[0] - 2, p[1] - 2, 5, 5); c.fillStyle = '#58e058'; c.fillRect(p[0] - 1, p[1] - 1, 3, 3);
          Dring(c, p[0], p[1], 5 + pop, '#58e058');
        });
        if (lt > tStuds) Dlabel(o, 'THE WALL\n(STUD)', 82, 560, '#58d058', P(-1.42, -2.6, 0), [0.5, 0], fadeIn(lt, tStuds));
        if (lt > tTrimW) {
          const k = fadeIn(lt, tTrimW, 0.12), p = P(HX1 + 0.06, -0.75, 0.06);
          Dcross(c, p[0], p[1], 9, '#ff2a20', ease(tTrimW, tTrimW + 0.15, lt));
          Dlabel(o, 'THE TRIM', 282, 520, '#ee4a48', [p[0] + 2, p[1] + 10], [0.5, 0], k);
        }
      },
    };
  }

  // ==================== 11: corte cenital, lamina dentro / fuera ====================
  // Plano XY de cara a camara: arriba = FUERA, abajo = DENTRO. Fila de arriba: lamina por DENTRO (cara interior del muro,
  // atornillada); fila de abajo: lamina por FUERA (contra la cara exterior). Bloques de hormigon gris con el hueco en medio.
  function shot11() {
    const scene = new THREE.Scene(); Dbg(scene);
    const cam = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 80);
    const RU = 2.55, RD = -3.15, BH = 0.7, GX = 0.85;   // centro (y) de cada fila; alto del muro; mitad del hueco
    const blockF = [0.8, 0.7, 1.0, 0.55, 0.88, 0.6];
    for (const yc of [RU, RD]) for (const s of [-1, 1]) {
      const x0 = s < 0 ? -2.4 : GX, x1 = s < 0 ? -GX : 2.4;
      DboxAt(x0, x1, yc - BH / 2, yc + BH / 2, -0.5, 0.25, shade(L.rep(tConc, 1.4, 0.5), blockF), scene);
    }
    const plyF = [L.rep(tPlyEdge, 0.2, 1), L.rep(tPlyEdge, 0.2, 1), L.rep(tBoard, 2.5, 0.3), L.rep(tBoard, 2.5, 0.3), L.rep(tBoard, 2.5, 0.3), L.rep(tBoard, 2.5, 0.3)];
    const mkSheet = () => { const g = new THREE.Group(); scene.add(g); DboxAt(-1.45, 1.45, -0.06, 0.06, -0.45, 0.2, plyF.map((t, i) => [t, [0.85, 0.7, 1, 0.6, 0.95, 0.6][i]]), g); g.visible = false; return g; };
    const sIn = mkSheet(), sOut = mkSheet();
    const scM = L.basic(null, 0xf0f0f4, XR), scH = L.basic(null, 0xd03020, XR);
    const screws = [];
    for (const [yc, dir] of [[RU, 1], [RD, -1]]) for (const x of [-1.2, 1.2]) {   // tornillos: suben al muro (fila sup.) o bajan (inf.)
      const g = new THREE.Group(); scene.add(g); g.visible = false;
      const yFace = yc + (dir > 0 ? -BH / 2 : BH / 2);
      const sh = L.box(0.035, 0.38, 0.035, scM, x, yFace + dir * 0.06, 0.26, g); sh.renderOrder = 10;
      const hd = L.box(0.12, 0.04, 0.04, scH, x, yFace - dir * 0.17, 0.26, g); hd.renderOrder = 11;
      g.userData = { dir }; screws.push(g);
    }
    const T = 28.15, tIn = Wd('inside', 30)[1] - T, tPush1 = Wd('push', 31)[1] - T, tScr = Wd('screws', 32)[1] - T,
      tOut = Wd('outside', 33)[1] - T, tPush2 = Wd('push', 33.5)[1] - T, tWall = Wd('wall', 34.5)[1] - T, tWhich = Wd('which', 28.5)[1] - T;
    let popIn = 0, pressOut = 0;
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), k = lt / 7.45;
        cam.position.set(0, 2.6 - 0.2 * k, 11.2 - 0.3 * k); cam.lookAt(0, 0.0, 0); cam.updateProjectionMatrix();
        // DENTRO: entra en "inside", en "push" se despega de los tornillos y cae hacia la casa
        sIn.visible = lt > tIn;
        const inY = RU - BH / 2 - 0.07;
        popIn = ease(tPush1 + 0.15, tPush1 + 0.55, q);
        sIn.position.set(0, inY - 0.6 * (1 - ease(tIn, tIn + 0.3, q)) - 0.55 * popIn, 0);
        sIn.rotation.z = -0.13 * popIn;
        screws[0].visible = screws[1].visible = lt > tIn + 0.2;
        for (const s of [screws[0], screws[1]]) s.position.y = 0;
        // FUERA: entra en "outside" desde arriba; en "push" se aprieta contra el muro (solo un golpe de 0.03)
        sOut.visible = lt > tOut;
        const outY = RD + BH / 2 + 0.07;
        pressOut = lt > tPush2 + 0.2 && lt < tPush2 + 0.36 ? 1 : 0;
        sOut.position.set(0, outY + 0.6 * (1 - ease(tOut, tOut + 0.3, q)) - 0.02 * pressOut, 0);
        screws[2].visible = screws[3].visible = lt > tOut + 0.2;
        for (const s of [screws[2], screws[3]]) s.position.y = sOut.position.y - outY;
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, q = L.q15(lt), P = (x, y, z = 0.25) => scr(cam, x, y, z);
        // flechas rojas de empuje desde fuera (arriba) de cada fila; en "push" bajan por el hueco hasta la lamina
        const rows = [
          { yc: RU, push: tPush1, end: () => (sIn.visible ? sIn.position.y + 0.07 : RU - BH / 2), dx: [-0.55, 0, 0.55] },
          { yc: RD, push: tPush2, end: () => (sOut.visible ? sOut.position.y + 0.07 : RD + BH / 2), dx: [-0.55, 0, 0.55] },
        ];
        for (const r of rows) {
          const beat = 0.5 + 0.5 * Math.sin(q * Math.PI * 2 * 2.2), g = ease(r.push, r.push + 0.3, q);
          for (const x of r.dx) {
            const top = P(x, r.yc + BH / 2 + 1.25), rest = P(x, r.yc + BH / 2 + 0.2), hit = P(x, r.end());
            const y1 = rest[1] + (hit[1] - rest[1]) * g - 2 + 2 * beat;
            Darrow(c, top[0], top[1] + 2 * beat, top[0], y1, 9, 22, 18, '#ff2a12', '#d81a08');
          }
        }
        // INSIDE
        if (lt > tIn) {
          const p = P(1.4, sIn.position.y, 0.2);
          Dlabel(o, 'INSIDE', 296, 92, '#ee4a48', [p[0], p[1]], [0.5, 1], fadeIn(lt, tIn));
        }
        if (lt > tScr) {
          const cx = P(0, RU - 0.05)[0], cy = P(0, RU - 0.05)[1];
          Dcross(c, cx, cy, 20, '#ff2a20', ease(tScr, tScr + 0.18, lt));
          Dlabel(o, 'ONLY THE\nSCREWS HOLD', 280, 300, '#ee4a48', P(1.2, RU - BH / 2 - 0.2), [0.3, 0], fadeIn(lt, tScr));
        }
        // OUTSIDE
        if (lt > tOut) {
          const p = P(-1.4, sOut.position.y, 0.2);
          Dlabel(o, 'OUTSIDE', 70, 440, '#58d058', [p[0], p[1]], [0.5, 1], fadeIn(lt, tOut));
        }
        if (lt > tPush2 + 0.2) {   // contacto: la lamina carga sobre el muro (destello verde en las juntas)
          const k = Math.max(0, 1 - (lt - tPush2 - 0.2) / 0.6);
          if (k > 0) for (const s of [-1, 1]) { const a0 = P(s * 2.2, RD + BH / 2), a1 = P(s * 1.0, RD + BH / 2); c.fillStyle = mixHex('#000000', '#58ff58', k); c.fillRect(Math.min(a0[0], a1[0]), a0[1] - 1, Math.abs(a1[0] - a0[0]), 3); }
        }
        if (lt > tWall) {
          const p = P(0, RD - 0.05);
          Dcheck(c, p[0], p[1], 18, '#40e040', ease(tWall, tWall + 0.2, lt));
          Dlabel(o, 'THE WALL\nHOLDS IT', 282, 600, '#58d058', P(1.7, RD - BH / 2), [0.3, 0], fadeIn(lt, tWall));
        }
        void tWhich; void popIn;
      },
    };
  }

  return { '05_diag_nail': shot05(), '08_examine': shot08(), '09_diag_frame': shot09(), '11_diag_side': shot11() };
}

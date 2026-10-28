import { reText as bitText } from '../refont.js';
// sets/rooms.js — planos 08-10 (salon cenital: sofa contra la puerta, el sofa resbala; primer plano "friction") y
// 20-22 (otra sala: ventana con tablas, zombis tras el cristal). Contrato: SETS.md. Prefijo propio: R*.
export async function shots(ctx) {
  const { L, TL } = ctx;
  const { THREE } = L;
  const R = L.rng(1313);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mouthAt = (tg, base) => { const m = TL.mouth[Math.floor(tg * 15)]; return m === 'A' ? 'talkA' : m === 'O' ? 'talkO' : base; };

  // ---------- texturas PS1 dibujadas en codigo ----------
  const tParquet = L.cvs(64, 64, (c, w, h) => {   // espiga (chevron): columnas de 8 px, tablillas inclinadas alternas
    const r = L.rng(5); const sh = [];
    for (let i = 0; i < 400; i++) sh.push(0.78 + r() * 0.34);
    const img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const col = Math.floor(x / 8), lx = x % 8, s = col % 2 ? 1 : -1;
      const v = y + s * lx + 64, st = Math.floor(v / 4), ly = ((v % 4) + 4) % 4;
      const k = sh[(col * 37 + st * 11) % 400] * (0.94 + 0.08 * ((x * 7 + y * 3) % 5 === 0)) * (lx === 0 || ly === 0 ? 0.62 : 1);
      const i = (y * w + x) * 4; img.data[i] = 168 * k; img.data[i + 1] = 98 * k; img.data[i + 2] = 46 * k; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const tWall = L.cvs(64, 64, (c, w, h) => {   // papel pintado crema con ornamentos marrones (anillos + rizos)
    c.fillStyle = '#c9b48e'; c.fillRect(0, 0, w, h);
    const r = L.rng(9); for (let i = 0; i < 260; i++) { c.fillStyle = r() < 0.5 ? '#bfa983' : '#d2bf9a'; c.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1); }
    c.strokeStyle = '#7d5c3a'; c.lineWidth = 1.4;
    for (const [x, y] of [[16, 18], [48, 50]]) {
      c.beginPath(); c.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fillStyle = '#7d5c3a'; c.fill();
      c.beginPath(); c.moveTo(x - 9, y + 9); c.quadraticCurveTo(x - 12, y + 2, x - 7, y - 2); c.stroke();
      c.beginPath(); c.moveTo(x + 9, y - 9); c.quadraticCurveTo(x + 12, y - 2, x + 7, y + 2); c.stroke();
    }
    c.fillStyle = '#6f8a5a'; for (const [x, y] of [[40, 14], [8, 46], [30, 34]]) c.fillRect(x, y, 2, 2);
  });
  const tDoor = L.cvs(64, 128, (c, w, h) => {   // cuero marron oscuro capitone en rombos + tachuelas de laton + marco de tachuelas
    c.fillStyle = '#3e1a10'; c.fillRect(0, 0, w, h);
    const dx = 10, dy = 12;
    for (let j = -1; j < h / dy + 1; j++) for (let i = -1; i < w / dx + 1; i++) {
      const x = i * dx + (j % 2 ? dx / 2 : 0), y = j * dy;
      c.fillStyle = '#5a2716'; c.beginPath(); c.moveTo(x, y - dy / 2 + 1); c.lineTo(x + dx / 2 - 1, y); c.lineTo(x, y + dy / 2 - 1); c.lineTo(x - dx / 2 + 1, y); c.fill();
      c.fillStyle = '#6c311c'; c.fillRect(x - 1, y - 3, 2, 2);
    }
    for (let j = -1; j < h / dy + 1; j++) for (let i = -1; i < w / dx + 1; i++) { const x = i * dx + (j % 2 ? 0 : dx / 2), y = j * dy + dy / 2; c.fillStyle = '#c9a24e'; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
    c.fillStyle = '#2a0f08'; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4); c.fillRect(0, 0, 4, h); c.fillRect(w - 4, 0, 4, h);
    c.fillStyle = '#d4ad58'; for (let y = 2; y < h; y += 4) { c.fillRect(1, y, 1, 1); c.fillRect(w - 2, y, 1, 1); } for (let x = 2; x < w; x += 4) { c.fillRect(x, 1, 1, 1); c.fillRect(x, h - 2, 1, 1); }
    c.fillStyle = '#d8c79a'; c.fillRect(27, 30, 11, 7); c.fillStyle = '#3a2a18'; c.font = '6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('13', 32.5, 33.8);
  });
  const tTrim = L.cvs(16, 64, (c, w, h) => { c.fillStyle = '#6a3a1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a5028'; c.fillRect(3, 0, 3, h); c.fillStyle = '#4a2410'; c.fillRect(11, 0, 2, h); });
  const tRug = L.cvs(64, 96, (c, w, h) => {   // alfombra roja con borde azul marino y medallon en rombo crema/amarillo/azul
    c.fillStyle = '#a3222a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b2450'; c.fillRect(0, 0, w, 7); c.fillRect(0, h - 7, w, 7); c.fillRect(0, 0, 7, h); c.fillRect(w - 7, 0, 7, h);
    c.fillStyle = '#e8dcc0'; for (let x = 3; x < w; x += 6) { c.fillRect(x, 2, 2, 2); c.fillRect(x, h - 4, 2, 2); } for (let y = 3; y < h; y += 6) { c.fillRect(2, y, 2, 2); c.fillRect(w - 4, y, 2, 2); }
    c.fillStyle = '#e2b13a'; for (let x = 6; x < w; x += 6) { c.fillRect(x, 5, 1, 1); c.fillRect(x, h - 6, 1, 1); }
    c.fillStyle = '#e8dcc0'; c.fillRect(8, 8, w - 16, 1); c.fillRect(8, h - 9, w - 16, 1); c.fillRect(8, 8, 1, h - 16); c.fillRect(w - 9, 8, 1, h - 16);
    const cx = w / 2, cy = h / 2, rings = [[1.0, '#1b2450'], [0.86, '#e8dcc0'], [0.74, '#e2b13a'], [0.62, '#1b2450'], [0.5, '#a3222a'], [0.38, '#e8dcc0'], [0.26, '#1b2450'], [0.14, '#e2b13a']];
    for (const [k, col] of rings) { c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy - 34 * k); c.lineTo(cx + 22 * k, cy); c.lineTo(cx, cy + 34 * k); c.lineTo(cx - 22 * k, cy); c.fill(); }
    c.fillStyle = '#2f7a8a'; for (const [x, y] of [[14, 16], [w - 16, 16], [14, h - 18], [w - 16, h - 18]]) { c.fillRect(x, y, 3, 3); c.fillRect(x - 2, y + 1, 7, 1); c.fillRect(x + 1, y - 2, 1, 7); }
    c.fillStyle = '#e2b13a'; for (const [x, y] of [[cx - 2, 12], [cx - 2, h - 15]]) c.fillRect(x, y, 4, 3);
  });
  const tFabric = L.cvs(32, 32, (c, w, h) => { const r = L.rng(3); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.88 + r() * 0.2 - ((x + y) % 4 === 0) * 0.05; c.fillStyle = hex([40 * k, 92 * k, 168 * k]); c.fillRect(x, y, 1, 1); } });
  const tWood = (base, seed) => L.cvs(32, 32, (c, w, h) => { const r = L.rng(seed); for (let y = 0; y < h; y++) { const k0 = 0.85 + r() * 0.25; for (let x = 0; x < w; x++) { const k = k0 * (0.93 + 0.12 * Math.sin(x * 0.7 + y * 0.15 + r())); c.fillStyle = hex(base.map((v) => v * k)); c.fillRect(x, y, 1, 1); } } });
  const tDark = tWood([70, 40, 24], 4), tBoard = tWood([132, 118, 98], 6), tSill = tWood([110, 92, 70], 8);
  const tGuitar = L.cvs(32, 32, (c, w, h) => { const g = c.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, '#c0602a'); g.addColorStop(0.7, '#8a2c12'); g.addColorStop(1, '#3a0e06'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const tNight = L.cvs(32, 64, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1630'); g.addColorStop(0.6, '#173058'); g.addColorStop(1, '#0c1830'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#081024'; for (let x = 0; x < w; x++) { const t = 40 + Math.round(4 * Math.sin(x * 0.9) + 3 * Math.sin(x * 2.3)); c.fillRect(x, t, 1, h - t); }
  });
  const tWallDark = L.cvs(32, 32, (c, w, h) => { const r = L.rng(12); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.85 + r() * 0.2; c.fillStyle = hex([58 * k, 44 * k, 34 * k]); c.fillRect(x, y, 1, 1); } });

  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);

  // ---------- puerta "13" acolchada (version sencilla del salon) ----------
  function Rdoor(parent, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    const leaf = B(0.92, 2.04, 0.06, lam(tDoor), 0, 1.02, 0.03, g);
    const trim = lam(L.rep(tTrim, 1, 3));
    B(0.1, 2.16, 0.05, trim, -0.51, 1.08, 0.03, g); B(0.1, 2.16, 0.05, trim, 0.51, 1.08, 0.03, g); B(1.12, 0.1, 0.05, trim, 0, 2.11, 0.03, g);
    const metal = lam(null, 0x9a9690);
    B(0.04, 0.04, 0.06, metal, 0.36, 1.0, 0.09, g); B(0.13, 0.025, 0.025, metal, 0.31, 1.0, 0.12, g); B(0.05, 0.05, 0.02, metal, 0.36, 1.14, 0.07, g);
    return { g, leaf };
  }

  // ---------- sofa azul (el respaldo mira a +Z: ella empuja desde ahi) + guitarra ----------
  const SW = 2.0, SD = 0.88, BACK_TOP = 0.9;
  // texturas del sofa (usuario: mas textura low poly): tejido azul con trama y sombreado, costuras/ribete, capitone con botones
  const weave = (c, w, h, r, base) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let x = (y & 1); x < w; x += 2) { c.fillStyle = r() < 0.5 ? 'rgba(10,20,60,0.22)' : 'rgba(120,150,220,0.12)'; c.fillRect(x, y, 1, 1); }
    for (let k = 0; k < w * h / 24; k++) { c.fillStyle = 'rgba(8,14,40,0.35)'; c.fillRect(r() * w | 0, r() * h | 0, 1, 1); }   // pelusa/manchas
  };
  const tSeat = L.cvs(64, 32, (c) => { const r = L.rng(41); weave(c, 64, 32, r, '#2c56a8');
    const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,30,0.35)'); c.fillStyle = g; c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#16306a'; c.fillRect(0, 0, 64, 1); c.fillRect(0, 31, 64, 1); c.fillRect(0, 0, 1, 32); c.fillRect(63, 0, 1, 32);
    c.fillStyle = '#5a82d0'; for (let x = 2; x < 62; x += 3) { c.fillRect(x, 2, 1, 1); c.fillRect(x, 29, 1, 1); } });   // pespunte
  const tBack = L.cvs(64, 32, (c) => { const r = L.rng(42); weave(c, 64, 32, r, '#2a50a0');
    for (const bx of [10, 32, 54]) for (const by of [9, 22]) { c.fillStyle = 'rgba(6,14,44,0.55)'; c.fillRect(bx - 4, by, 9, 1); c.fillRect(bx, by - 4, 1, 9); c.fillStyle = '#132a5e'; c.fillRect(bx - 1, by - 1, 3, 3); c.fillStyle = '#5c86d6'; c.fillRect(bx - 1, by - 1, 1, 1); }
    const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,30,0.3)'); c.fillStyle = g; c.fillRect(0, 0, 64, 32);
    c.fillStyle = '#16306a'; c.fillRect(0, 0, 64, 1); c.fillRect(0, 31, 64, 1); });
  const tArm = L.cvs(32, 32, (c) => { const r = L.rng(43); weave(c, 32, 32, r, '#2a52a2');
    c.fillStyle = 'rgba(160,190,250,0.22)'; c.fillRect(0, 0, 32, 6); c.fillStyle = '#16306a'; c.fillRect(0, 7, 32, 1); c.fillStyle = 'rgba(0,0,30,0.35)'; c.fillRect(0, 24, 32, 8); });
  const tBase = L.cvs(64, 16, (c) => { const r = L.rng(44); weave(c, 64, 16, r, '#1f4088'); c.fillStyle = '#10265a'; c.fillRect(0, 0, 64, 2); c.fillStyle = 'rgba(0,0,20,0.4)'; c.fillRect(0, 10, 64, 6);
    c.fillStyle = '#3a64b8'; for (let x = 0; x < 64; x += 4) c.fillRect(x, 13, 2, 3); });   // faldon con pliegues
  function Rcouch() {
    const g = new THREE.Group(), fSeat = lam(tSeat), fBack = lam(tBack), fArm = lam(tArm), fBase = lam(L.rep(tBase, 2, 1)), fab = fArm, leg = lam(null, 0x2a1a10);
    B(SW, 0.26, SD, fBase, 0, 0.21, 0, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.06, 0.08, 0.06, leg, sx * (SW / 2 - 0.08), 0.04, sz * (SD / 2 - 0.08), g);
    B(SW / 2 - 0.2, 0.12, SD - 0.24, fSeat, -(SW / 4 - 0.1), 0.4, -0.1, g); B(SW / 2 - 0.2, 0.12, SD - 0.24, fSeat, SW / 4 - 0.1, 0.4, -0.1, g);
    B(SW, 0.3, 0.12, fBase, 0, 0.5, SD / 2 - 0.06, g);                                         // armazon del respaldo
    for (const k of [-1, 0, 1]) { const cu = B(SW / 3 - 0.16, 0.34, 0.16, fBack, k * (SW / 3 - 0.13), BACK_TOP - 0.22, SD / 2 - 0.15, g); cu.rotation.x = -0.12; }   // 3 cojines de respaldo
    B(SW - 0.36, 0.06, 0.2, fArm, 0, BACK_TOP - 0.03, SD / 2 - 0.1, g);                       // canto superior
    for (const sx of [-1, 1]) { B(0.2, 0.3, SD, fArm, sx * (SW / 2 - 0.1), 0.49, 0, g); const roll = B(0.24, 0.08, SD + 0.02, fArm, sx * (SW / 2 - 0.1), 0.66, 0, g); roll.rotation.z = sx * 0.12; }
    const pil = B(0.4, 0.12, 0.34, fBack, SW / 2 - 0.42, 0.55, 0.12, g); pil.rotation.set(0.5, 0.6, 0.2);
    // guitarra acustica tumbada en el asiento, el mastil hacia la izquierda
    const gu = new THREE.Group(); gu.position.set(0.2, 0.5, -0.12); gu.rotation.y = 0.12; g.add(gu);
    const body = lam(tGuitar), dark = L.basic(null, 0x120604), neck = lam(null, 0x3a1e0e), mtl = lam(null, 0xc8c0b0);
    const b1 = cyl(0.19, 0.19, 0.08, 12, body, 0.12, 0, 0, gu); b1.scale.z = 0.95;
    cyl(0.15, 0.15, 0.08, 12, body, -0.14, 0, 0, gu);
    cyl(0.055, 0.055, 0.01, 10, dark, -0.04, 0.041, 0, gu);
    B(0.5, 0.025, 0.055, neck, -0.5, 0.02, 0, gu); B(0.13, 0.025, 0.08, neck, -0.81, 0.02, 0, gu);
    B(0.9, 0.006, 0.03, mtl, -0.32, 0.045, 0, gu);
    return g;
  }

  // ---------- salon (planos 08 y 09) ----------
  function Rliving() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x120c08);
    scene.add(new THREE.HemisphereLight(0xffe2c0, 0x5a3a24, 1.6));
    const key = new THREE.DirectionalLight(0xffd8a8, 1.4); key.position.set(-2, 6, 3); scene.add(key);
    const WZ = -3.0;
    const floor = L.plane(8, 9, lam(L.rep(tParquet, 10, 11)), 0, 0, WZ + 4.5, scene, 0, -Math.PI / 2);
    L.plane(8, 3.2, lam(L.rep(tWall, 8, 3.2)), 0, 1.6, WZ, scene);
    B(8, 0.09, 0.03, lam(tDark), 0, 0.045, WZ + 0.015, scene);
    const door = Rdoor(scene, 0.05, WZ);
    // estanteria con frascos a la derecha de la puerta (ref 13.0-15.9)
    const sh = new THREE.Group(); sh.position.set(1.55, 0, WZ + 0.22); scene.add(sh);
    const wd = lam(tDark); B(0.06, 1.8, 0.4, wd, -0.4, 0.9, 0, sh); B(0.06, 1.8, 0.4, wd, 0.4, 0.9, 0, sh); B(0.86, 1.8, 0.03, wd, 0, 0.9, -0.19, sh);
    for (let k = 0; k < 5; k++) { B(0.8, 0.03, 0.38, wd, 0, 0.05 + k * 0.42, 0, sh); for (let j = 0; j < 4; j++) Rjar(sh, -0.28 + j * 0.19, 0.065 + k * 0.42, 0.03, 0.06, 0.13, k * 5 + j); }
    // calavera en la pared (decoracion del pasillo de la ref)
    const sk = L.mesh(new THREE.SphereGeometry(0.11, 6, 5), lam(null, 0x2a2c30), 0.95, 1.55, WZ + 0.1, scene); sk.scale.set(0.85, 1, 0.8);
    const rug = L.plane(1.9, 2.8, lam(tRug), 0.05, 0.006, -0.35, scene, 0, -Math.PI / 2);
    const couch = Rcouch(); scene.add(couch);
    const ch = L.hero(); scene.add(ch.root); ch.root.rotation.y = Math.PI;
    const camera = new THREE.PerspectiveCamera(54, L.LW / L.LH, 0.05, 60);
    const cam = (lt, shake = 0) => { camera.position.set(0.25 + shake * 0.03, 3.75, 0.35); camera.lookAt(0.12, 0.4, -2.05 + shake * 0.02); };
    return { scene, camera, cam, couch, ch, door, WZ, floor, rug };
  }
  function Rjar(parent, x, y, z, r, h, seed) {
    const rr = L.rng(seed + 50), lab = L.cvs(16, 16, (c) => {
      const cols = [['#e8e4d0', '#3a7a3a'], ['#d8d0b0', '#b03020'], ['#e0e0d8', '#2a5a8a'], ['#c8b890', '#6a8a2a']][Math.floor(rr() * 4)];
      c.fillStyle = '#5a6a40'; c.fillRect(0, 0, 16, 16); c.fillStyle = cols[0]; c.fillRect(0, 4, 16, 8); c.fillStyle = cols[1]; c.fillRect(2, 6, 12, 2); c.fillRect(3, 9, 8, 1);
    });
    return cyl(r, r, h, 8, lam(lab), x, y + h / 2, z, parent);
  }
  // First Aid Spray (copia del modelo de Markus Darius, itch.io: lata octogonal crema, bandas verdes, cruz verde, FIRST-AID, flor roja detras)
  const tSpray = L.cvs(64, 64, (c) => {
    c.fillStyle = '#bdbab2'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 4) { c.fillStyle = y % 8 ? '#c4c1b8' : '#b6b3aa'; c.fillRect(0, y, 64, 2); }
    c.fillStyle = '#dfe2c8'; c.fillRect(0, 14, 64, 36);
    c.fillStyle = '#2e9a50'; c.fillRect(0, 13, 64, 2); c.fillRect(0, 49, 64, 2);
    c.fillStyle = '#2e9a50'; c.fillRect(8, 19, 4, 12); c.fillRect(4, 23, 12, 4);   // cruz verde (delante)
    c.font = 'bold 6px monospace'; c.textBaseline = 'top'; c.fillText('FIRST-AID', 0, 38); c.fillText('FIRST-AID', 32, 38);
    c.fillStyle = '#2e9a50'; c.fillRect(40, 19, 4, 12); c.fillRect(36, 23, 12, 4);   // cruz (detras)
    c.fillStyle = '#d0504c'; c.fillRect(39, 32, 6, 6); c.fillRect(38, 33, 8, 4); c.fillStyle = '#f0e8e0'; c.fillRect(41, 33, 2, 4); c.fillRect(40, 34, 4, 2);
  });
  tSpray.wrapS = THREE.RepeatWrapping;
  const mRim = lam(null, 0x7a6e6a), mCap = lam(null, 0xd8d6d0), mNoz = lam(null, 0x2a2a2c);
  function Rspray(parent, x, y, z, ry = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const r = 0.032, h = 0.13;
    cyl(r * 1.12, r * 1.12, 0.012, 8, mRim, 0, 0.006, 0, g);
    cyl(r, r, h, 8, lam(tSpray), 0, 0.012 + h / 2, 0, g);
    cyl(r * 1.12, r * 1.12, 0.01, 8, mRim, 0, 0.012 + h, 0, g);
    cyl(r * 0.45, r, 0.03, 8, mCap, 0, 0.017 + h + 0.015, 0, g);
    B(0.014, 0.016, 0.014, mNoz, 0, 0.017 + h + 0.038, 0, g);
    return g;
  }
  // macetas de hierbas RE (verde / roja / amarilla): maceta de barro + hojas en planos cruzados
  const leafTex = (col, dark) => L.cvs(32, 32, (c) => {
    const rr = L.rng(col.length * 7 + dark.charCodeAt(1));
    for (let k = 0; k < 7; k++) {
      const x = 4 + rr() * 24, y = 4 + rr() * 16, w = 5 + rr() * 4, hh = 8 + rr() * 6;
      c.fillStyle = dark; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2 + 1, hh / 2 + 1, (rr() - 0.5) * 0.9, 0, 7); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2, hh / 2, (rr() - 0.5) * 0.9, 0, 7); c.fill();
    }
    c.fillStyle = '#3a5a20'; for (let k = 0; k < 5; k++) c.fillRect(8 + k * 4, 22, 2, 10);   // tallos
  });
  const HERBS = { green: leafTex('#3aa035', '#1c5a1a'), red: leafTex('#c42a22', '#6a1210'), yellow: leafTex('#e0c22a', '#8a6a10') };
  const mPot = lam(null, 0x9a5a34), mSoil = lam(null, 0x3a2414);
  function Rherb(parent, x, y, z, kind) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    cyl(0.05, 0.036, 0.07, 8, mPot, 0, 0.035, 0, g); cyl(0.054, 0.054, 0.012, 8, mPot, 0, 0.068, 0, g);
    cyl(0.046, 0.046, 0.004, 8, mSoil, 0, 0.072, 0, g);
    const m = lam(HERBS[kind], 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) L.plane(0.13, 0.13, m, 0, 0.07 + 0.06, 0, g, k * Math.PI / 3);
    return g;
  }
  // hands on the couch back: push_heavy pone las palmas ~0.47 m delante de la raiz (medido en el render)
  const HAND_FWD = 0.47;

  // ---------- 08_couch: entra por abajo y empuja el sofa hasta la puerta ----------
  const LV = Rliving();
  const C0 = new THREE.Vector3(-0.45, 0, -0.95), C1 = new THREE.Vector3(0.05, 0, LV.WZ + SD / 2 + 0.04), CROT0 = 0.1;
  const behind = (c) => c.z + SD / 2 + HAND_FWD;   // raiz de Ava detras del respaldo
  function couchAt08(lt) { const k = ease(0.6, 1.9, lt); return { x: L.lerp(C0.x, C1.x, k), z: L.lerp(C0.z, C1.z, k), ry: CROT0 * (1 - k) }; }
  const s08 = {
    scene: LV.scene, camera: LV.camera,
    update(lt) {
      LV.cam(lt); LV.door.leaf.position.z = 0.03;
      const c = couchAt08(lt); LV.couch.position.set(c.x, 0, c.z); LV.couch.rotation.y = c.ry;
      const zA = behind(c), q = L.q15(lt);
      let segs, x = c.x, z;
      if (q < 0.55) { const k = q / 0.55; z = L.lerp(zA + 0.75, zA, k); x = L.lerp(c.x + 0.15, c.x, k); segs = [L.seg('walk', 0, { loop: true })]; }
      else { z = zA; segs = [L.seg('walk', -10, { loop: true }), L.seg('push_heavy', 0.55, { loop: true, fade: 0.2 })]; }
      LV.ch.root.position.set(x, 0, z); LV.ch.root.rotation.y = Math.PI + c.ry;
      LV.ch.pose(lt, segs, null);
    },
  };
  // ---------- 09_slide: el sofa resbala hacia atras (empujan desde fuera) y la tira ----------
  const FB = (() => { try { L.hero().pose(0, [L.seg('fall_back', 0)], null); return 'fall_back'; } catch { return 'surprised'; } })();   // TODO: quitar el fallback cuando fall_back este siempre en el GLB
  const s09 = {
    scene: LV.scene, camera: LV.camera,
    update(lt) {
      const bang = lt > 0.12 && lt < 0.45 ? Math.sin((lt - 0.12) * 60) * (1 - (lt - 0.12) / 0.33) : 0;
      LV.cam(lt, bang); LV.door.leaf.position.z = 0.03 + Math.max(0, bang) * 0.05;
      const slide = 0.5 * L.smooth(clamp01((lt - 0.15) / 0.35));
      LV.couch.position.set(C1.x - slide * 0.08, 0, C1.z + slide); LV.couch.rotation.y = -0.06 * slide;
      const push = 0.5 * L.smooth(clamp01((lt - 0.15) / 0.35)) + 0.25 * L.smooth(clamp01((lt - 0.3) / 0.4));
      LV.ch.root.position.set(C1.x + 0.35 * L.smooth(clamp01((lt - 0.2) / 0.5)), 0, behind(C1) + push);
      LV.ch.root.rotation.y = Math.PI - 0.35 * L.smooth(clamp01((lt - 0.2) / 0.5));
      LV.ch.pose(lt, [L.seg('push_heavy', -2.5, { loop: true }), L.seg(FB, 0.15, { fade: 0.07 })], null);
    },
  };

  // ---------- 10_friction: primer plano, sala oscura con estanteria (libros, frascos) ----------
  function Rfriction() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0907);
    scene.add(new THREE.HemisphereLight(0xd8c0a0, 0x2a1c14, 0.9));
    const key = new THREE.DirectionalLight(0xffe0bc, 1.5); key.position.set(-1.2, 2.2, 3); scene.add(key);
    L.plane(6, 3, lam(L.rep(tWallDark, 6, 3)), 0, 1.5, -1.5, scene);
    const sh = new THREE.Group(); sh.position.set(-0.75, 0, -1.05); scene.add(sh);
    const wd = lam(tDark, 0.8);
    B(0.06, 2.1, 0.36, wd, -0.6, 1.05, 0, sh); B(0.06, 2.1, 0.36, wd, 0.6, 1.05, 0, sh); B(1.26, 2.1, 0.03, wd, 0, 1.05, -0.17, sh); B(1.26, 0.06, 0.38, wd, 0, 2.1, 0, sh);
    const ITEMS = ['spray', 'green', 'red', 'spray', 'yellow', 'green', 'spray', 'red', 'yellow']; let nIt = 0;
    const r = L.rng(21), bookCols = [0x6a2018, 0x1e3a5a, 0x2e4a24, 0x7a5a20, 0x4a2a40, 0x8a7a5a];
    for (let k = 0; k < 5; k++) {
      const y = 0.06 + k * 0.42; B(1.14, 0.03, 0.34, wd, 0, y, 0, sh);
      let x = -0.54;
      while (x < 0.5) {
        if (r() < 0.35) {   // pedido del usuario: sprays de primeros auxilios y hierbas verde/roja/amarilla en vez de frascos
          const it = ITEMS[nIt++ % ITEMS.length];
          if (it === 'spray') { Rspray(sh, x + 0.04, y + 0.015, 0.03, -0.4 + r() * 0.8); x += 0.1; }
          else { Rherb(sh, x + 0.055, y + 0.015, 0.03, it); x += 0.13; }
        }
        else { const bw = 0.03 + r() * 0.03, bh = 0.2 + r() * 0.1; const b = B(bw, bh, 0.24, lam(null, bookCols[Math.floor(r() * bookCols.length)]), x + bw / 2, y + 0.015 + bh / 2, 0.02, sh); b.rotation.z = r() < 0.15 ? 0.15 : 0; x += bw + 0.005; }
      }
    }
    const ch = L.hero(); scene.add(ch.root);
    const camera = new THREE.PerspectiveCamera(42, L.LW / L.LH, 0.05, 30);
    camera.position.set(-0.16, 1.22, 1.3); camera.lookAt(-0.16, 1.3, 0);
    return { scene, camera, ch };
  }
  const FR = Rfriction();
  const s10 = {
    scene: FR.scene, camera: FR.camera,
    update(lt) {
      // usuario: mas cute y mirando a camara: encoge los hombros en "care" y guina un ojo con sonrisa en "feelings"
      const tg = 16.5 + lt, WT = (w) => (TL.words.find((x) => x[0] === w) || [0, 99])[1] - 16.5;
      const tCare = WT('care') - 0.15, tFeel = WT('feelings'), blink = lt > 0.7 && lt < 0.8;
      const eyes = lt > tFeel + 0.1 ? 'wink' : blink ? 'blink' : 'open', mouth = lt > tFeel + 0.45 ? 'smile' : mouthAt(tg, 'smile');
      FR.ch.pose(lt, [L.seg('idle', 0, { loop: true, speed: 0.6 }), L.seg('shrug', tCare, { speed: 0.8, fade: 0.2 })], [[-99, eyes, mouth]]);
      FR.ch.lookAt(FR.camera, 1, 40);
    },
  };

  // ---------- 20-22: sala con la ventana tapiada, zombis detras ----------
  async function Rzombie(name, clipName, { h = 1.8, rotY = 0, tex = null } = {}) {
    const g = await L.loadModel(`models/${name}.glb`);
    const root = L.ps1Clone(g.scene);
    if (tex) { const t = await L.loadTex(tex, 256); t.flipY = false; t.needsUpdate = true; root.traverse((o) => { if (o.isMesh) { o.material.map = t; o.material.color.set(0xffffff); o.material.needsUpdate = true; } }); }   // el GLB de thin-zombie no trae la textura
    // nada del zombi entra en la sala: recorte contra el plano de la pared de la ventana (z = -1.3); su ataque metia un brazo
    window.__fx.renderer.localClippingEnabled = true;
    const clip0 = [new THREE.Plane(new THREE.Vector3(0, 0, -1), -1.32)];
    root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.clippingPlanes = clip0; }); });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k; root.rotation.y = rotY;
    const mixer = new THREE.AnimationMixer(root), clip = THREE.AnimationClip.findByName(g.animations, clipName), act = mixer.clipAction(clip); act.play();
    let hip = null; root.traverse((o) => { if (!hip && o.isSkinnedMesh) hip = o.skeleton.bones[0]; });   // sin root motion: las caderas no avanzan (no atraviesan la pared)
    const hip0 = hip.position.clone();
    return { root: wrap, set(t) { act.time = ((t % clip.duration) + clip.duration) % clip.duration; mixer.update(0); hip.position.copy(hip0); } };
  }
  async function Rwindow() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0c14);
    scene.add(new THREE.HemisphereLight(0xffe6c8, 0x403028, 1.25));
    const key = new THREE.DirectionalLight(0xffe2c0, 1.5); key.position.set(-1.5, 2.5, 3); scene.add(key);
    const moon = new THREE.PointLight(0x7aa0ff, 7, 4, 1.2); moon.position.set(0.3, 2.4, -2.6); scene.add(moon);
    const WZ = -1.3, X0 = -1.05, X1 = 1.05, Y0 = 1.1, Y1 = 2.2;
    const wall = lam(L.rep(tWall, 1, 1)), wpanel = (w, h, x, y) => { const t = L.rep(tWall, w * 1.6, h * 1.6); return L.plane(w, h, lam(t), x, y, WZ, scene); };
    wpanel(3, 1.0, -0.6, 2.6); wpanel(3, Y0, -0.6, Y0 / 2); wpanel(1.5, Y1 - Y0, X0 - 0.75, (Y0 + Y1) / 2); wpanel(1.5, Y1 - Y0, X1 + 0.75, (Y0 + Y1) / 2); void wall;
    // marco, travesano central, alfeizar
    const fr = lam(tSill, 0.75);
    B(X1 - X0 + 0.12, 0.08, 0.14, fr, 0, Y1 + 0.02, WZ - 0.04, scene); B(0.08, Y1 - Y0, 0.14, fr, X0, (Y0 + Y1) / 2, WZ - 0.04, scene); B(0.08, Y1 - Y0, 0.14, fr, X1, (Y0 + Y1) / 2, WZ - 0.04, scene);
    B(0.06, Y1 - Y0, 0.08, fr, 0.02, (Y0 + Y1) / 2, WZ - 0.08, scene);
    B(X1 - X0 + 0.3, 0.05, 0.3, lam(tSill), 0, Y0 - 0.02, WZ + 0.06, scene);
    // cristal (tinte azul muy leve) y noche detras
    L.plane(X1 - X0, Y1 - Y0, L.basic(null, 0x6080b0, { transparent: true, opacity: 0.1, depthWrite: false }), 0, (Y0 + Y1) / 2, WZ - 0.1, scene);
    L.plane(8, 5, L.basic(L.rep(tNight, 3, 1)), 0, 1.8, -4.5, scene);
    // tablas clavadas en diagonal por dentro
    const boardM = lam(tBoard), nail = L.basic(null, 0x2a2a2a);
    const board = (xa, ya, xb, yb, w = 0.16) => {
      const len = Math.hypot(xb - xa, yb - ya), b = B(len, w, 0.035, boardM, (xa + xb) / 2, (ya + yb) / 2, WZ + 0.035, scene); b.rotation.z = Math.atan2(yb - ya, xb - xa);
      for (const u of [0.05, 0.95]) B(0.02, 0.02, 0.01, nail, xa + (xb - xa) * u, ya + (yb - ya) * u, WZ + 0.055, scene);
      return b;
    };
    board(-1.15, 1.62, 1.15, 2.08, 0.17); board(-0.1, 1.24, 1.15, 1.5, 0.14);
    // planta en el alfeizar (derecha)
    const pot = lam(null, 0x5a3420), leaf = lam(null, 0x3a6a2a, { side: THREE.DoubleSide });
    const pg = new THREE.Group(); pg.position.set(0.42, Y0 + 0.005, WZ + 0.08); scene.add(pg);
    cyl(0.1, 0.075, 0.15, 8, pot, 0, 0.075, 0, pg); cyl(0.105, 0.105, 0.025, 8, pot, 0, 0.15, 0, pg);
    const rl = L.rng(33);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, l = L.mesh(new THREE.PlaneGeometry(0.035, 0.32), leaf, 0, 0.3, 0, pg); l.rotation.set(0, a, 0); l.rotateX(0.35 + rl() * 0.5); l.position.set(Math.sin(a) * 0.06, 0.28, Math.cos(a) * 0.06); }
    // zombis fuera (detras del cristal, mirando a la sala)
    const zs = [
      [await Rzombie('city-zombie', 'Zombie_Attack', { h: 1.8 }), -0.62, -2.15, 0.15, 0.8, 0.0],
      [await Rzombie('thin-zombie', 'attack2', { h: 1.85, tex: 'tex/thin_zombie.png' }), 0.45, -2.0, -0.2, 1.0, 0.55],
      [await Rzombie('hazmat-zombie', 'zombie_fight', { h: 1.75 }), 0.1, -2.15, 0.0, 0.9, 1.1],
    ];
    for (const [z, x, zz, ry] of zs) { z.root.position.set(x, 0, zz); z.root.rotation.y = ry; scene.add(z.root); }
    const ch = L.hero(); ch.root.position.set(-0.12, 0, 0); scene.add(ch.root);
    const camera = new THREE.PerspectiveCamera(42, L.LW / L.LH, 0.05, 30);
    camera.position.set(-0.04, 1.36, 1.55); camera.lookAt(-0.04, 1.3, 0);
    return { scene, camera, ch, zs };
  }
  const WN = await Rwindow();
  const zombiesAt = (show, lt) => { for (const [z, , , , sp, off] of WN.zs) { z.root.visible = show; if (show) z.set(lt * sp + off); } };
  const s20 = {
    scene: WN.scene, camera: WN.camera,
    update(lt) {
      zombiesAt(false, lt);
      const tg = 39.6 + lt, SC = 1.15;
      const segs = [L.seg('idle', 0, { loop: true }), L.seg('scratch_head', SC, { from: 0.33, fade: 0.27 })];
      WN.ch.pose(lt, segs, [[-99, 'happy', mouthAt(tg, 'smile')]]);
    },
  };
  const s21 = {
    scene: WN.scene, camera: WN.camera,
    update(lt) {
      zombiesAt(true, lt + 2.6);
      const tg = 42.2 + lt;
      const eyes = lt < 0.45 ? 'happy' : lt < 0.62 ? 'open' : lt < 1.2 ? 'surprised' : 'sad';
      const base = lt < 0.45 ? 'smile' : lt < 1.2 ? 'gasp' : 'frown';
      WN.ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.4 })], [[-99, eyes, mouthAt(tg, base)]]);
    },
    overlay(lt, dt, a, o) {
      if (lt < 0.45) { o.tctx.fillStyle = `rgba(246,246,242,${0.85 * (1 - lt / 0.45)})`; o.tctx.fillRect(0, 0, L.LW, L.LH); }
    },
  };
  const s22 = {
    scene: WN.scene, camera: WN.camera,
    update(lt) {
      zombiesAt(true, lt + 5.2);
      const tg = 44.8 + lt;
      WN.ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 1.0, speed: 0.7 })], [[-99, lt < 0.12 ? 'half' : 'blink', mouthAt(tg, 'frown')]]);
    },
  };

  return { '08_couch': s08, '09_slide': s09, '10_friction': s10, '20_proud': s20, '21_windows': s21, '22_next': s22 };
}

import { reText as bitText, reWidth as textWidth } from '../refont.js';
// sets/screens.js (ep3 comisaria) — pantallas de RE sin HUD ni gamma (film.js NOHUD/DARK): 06 carga de puerta, 08 ITEM casi
// vacio (pistola en EXAMINE, 15 balas), 10 cuentas del agua (garrafa + cisternas = 11 dias), 15 FILE "DUTY LOG" con sellos
// LOST, 19 menu YES/NO + tarjeta final. Contrato: SETS.md; tiempos de ../shotlist.md. Prefijo propio: S*.
// Las palabras van fijas aqui (copiadas de timeline.json) para que imagen y SCREENS_SFX usen los mismos tiempos.
const SW = {
  good: 13.65, bad: 17.35, one: 19.09, pistol: 19.2, fifteen: 19.74,
  five: 26.75, four: 27.62, six: 28.81, eleven: 29.43, seven: 30.71,
  log: 47.56, every: 48.08, status: 50.11, lost: 50.47,
  do: 60.86, you: 61.12, open: 61.22, the: 61.38, door: 61.52, comment: 61.82, yes: 62.06, no: 62.48, most: 63.39,
};
const T06 = 13.5, T08 = 17.2, T10 = 25.75, T15 = 46.7, T19 = 60.7, FOLLOW = 65.2;
const ROW_GAP = 0.14, STAMP_GAP = 0.11, KEY_RATE = 14;
const TYPE_LINE = 'DAY 2 — YOU DECIDE.';
const Q_WORDS = [['DO', SW.do], ['YOU', SW.you], ['OPEN', SW.open], ['THE', SW.the], ['DOOR?', SW.door]];

// ---------- sonidos (s globales) para el mezclador ----------
export const SCREENS_SFX = (() => {
  const s = [];
  // 06 puerta: cerrojo, chirrido largo mientras se abre, golpe de la puerta al cerrarse detras (justo antes del corte)
  s.push([13.52, 'door_unlock'], [13.68, 'door_creak'], [15.2, 'door_slam']);
  // 08 ITEM
  s.push([17.2, 'menu_open'], [17.45, 'item_select'], [17.55, 'item_lift'], [SW.one, 'examine_text'], [SW.fifteen, 'counter_blink']);
  // 10 cuentas: garrafa, 4 cisternas una a una, +6, total, ayuda con check
  s.push([SW.five, 'item_pop'], [SW.five, 'label']);
  for (let i = 0; i < 4; i++) s.push([+(SW.four + i * 0.08).toFixed(2), 'item_pop']);
  s.push([SW.four, 'label'], [SW.six, 'label'], [SW.eleven, 'total'], [SW.seven, 'label'], [SW.seven + 0.05, 'check']);
  // 15 FILE: hoja, 6 lineas, cabecera STATUS, 6 sellos LOST (VICKERS el ultimo)
  s.push([T15, 'file_open']);
  for (let i = 0; i < 6; i++) s.push([+(SW.every + i * ROW_GAP).toFixed(2), 'paper_tick']);
  s.push([SW.status, 'label']);
  for (let i = 0; i < 6; i++) s.push([+(SW.lost + i * STAMP_GAP).toFixed(2), 'stamp']);
  // 19 menu: palabra a palabra, comentario, cursor YES / NO, maquina de escribir (una tecla por letra), FOLLOW
  s.push([T19 + 0.1, 'menu_open']);
  for (const [, t] of Q_WORDS) s.push([t, 'ui_tick']);
  s.push([SW.comment, 'label'], [SW.yes, 'cursor_move'], [SW.no, 'cursor_move']);
  [...TYPE_LINE].forEach((ch, i) => { if (ch !== ' ') s.push([+(SW.most + (i + 1) / KEY_RATE).toFixed(3), 'type_key']); });
  s.push([FOLLOW, 'label']);
  return s.sort((a, b) => a[0] - b[0]);
})();

export async function shots(ctx) {
  const { L, examine } = ctx;
  const { THREE, LW, LH } = L;
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * L.clamp01(k)).toString(16).padStart(2, '0')).join('');
  const fadeIn = (lt, t0, d = 0.15) => L.clamp01((lt - t0) / d);
  const scr = (cam, x, y, z) => L.toScreen(cam, x, y, z);
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  // aparicion con rebote (escala): 0 antes, 1.25 -> 1
  const pop = (lt, t0) => (lt < t0 ? 0 : lt < t0 + 0.07 ? 1.25 * (lt - t0) / 0.07 : 1 + 0.25 * Math.max(0, 1 - (lt - t0 - 0.07) / 0.1));

  // ---------- texturas / cajas (copiado del ep2 diagrams.js) ----------
  const Swood = (seed, base, dark, vertical = false, freq = 0.55, w0 = 64, h0 = 64) => L.cvs(w0, h0, (c, w, h) => {
    const r = L.rng(seed), ph = []; for (let i = 0; i < 128; i++) ph.push(r() * 6.28);
    const A = hexRGB(base), B = hexRGB(dark), img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = vertical ? y : x, v = vertical ? x : y;
      const s = Math.sin((v + 2.2 * Math.sin(u * 0.098 + ph[v % 7]) + 1.2 * Math.sin(u * 0.29 + ph[(v >> 3) % 64])) * freq);
      let k = s > 0.55 ? 0.85 : s > 0.1 ? 0.45 : 0.08; k += (r() - 0.5) * 0.18; k = Math.min(1, Math.max(0, k));
      const i = (y * w + x) * 4; for (let j = 0; j < 3; j++) img.data[i + j] = A[j] + (B[j] - A[j]) * k; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const Sbox = (w, h, d, faces, x, y, z, parent) => L.mesh(new THREE.BoxGeometry(w, h, d), faces.map(([t, c, e]) => L.basic(t, c, e || {})), x, y, z, parent);
  const SboxAt = (x0, x1, y0, y1, z0, z1, faces, parent) => Sbox(x1 - x0, y1 - y0, z1 - z0, faces, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent);
  const shade = (t, f = [0.8, 0.7, 0.95, 0.55, 1.0, 0.6]) => f.map((k) => [t, k]);
  const lamC = (c) => L.lam(null, c, { flatShading: true });
  const cyl = (r0, r1, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r0, r1, h, n), m, x, y, z, p);

  // ---------- dibujo 2D: lineas, check, paneles RE2 (copiado de diagrams.js / banner.js) ----------
  function Sline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 2000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  const LHT = 13, PX = 6, PY = 5;
  function Slabel(c, text, cx, cy, col, tgt, at = [0.5, 0], k = 1, { fg = '#f4f4f4', sc = 1 } = {}) {
    if (k <= 0) return;
    const lines = text.split('\n'), lh = sc >= 2 ? 17 : LHT;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc)));
    const w = Math.round(tw + 2 * PX), h = lines.length * lh + 2 * PY - 1, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', fg, k);
    if (tgt) { Sline(c, x + at[0] * (w - 1), y + at[1] * (h - 1), tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + PY + lh / 2 - 0.5 + i * lh, sc, fc, { outline: null }));
  }
  function Sthick(c, pts, col, wd = 3) { for (let i = 1; i < pts.length; i++) for (let a = -(wd >> 1); a <= wd >> 1; a++) for (let b = -(wd >> 1); b <= wd >> 1; b++) Sline(c, pts[i - 1][0] + a, pts[i - 1][1] + b, pts[i][0] + a, pts[i][1] + b, col); }
  const Scheck = (c, x, y, r, col, k = 1) => { const g = L.smooth(k); const p0 = [x - r, y], p1 = [x - r * 0.35, y + r * 0.65], p2 = [x + r, y - r * 0.8];
    if (g <= 0) return;
    if (g < 0.4) Sthick(c, [p0, [p0[0] + (p1[0] - p0[0]) * g / 0.4, p0[1] + (p1[1] - p0[1]) * g / 0.4]], col);
    else { const h = (g - 0.4) / 0.6; Sthick(c, [p0, p1, [p1[0] + (p2[0] - p1[0]) * h, p1[1] + (p2[1] - p1[1]) * h]], col); } };
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  function bevel(c, x, y, w, h, base = '#5a5e6a', hi = '#b4b8c4', lo = '#22242c') {
    rect(c, x, y, w, h, base);
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (let yy = y + 2; yy < y + h - 2; yy += 2) c.fillRect(x + 1, yy, w - 2, 1);
    rect(c, x, y, w, 1, hi); rect(c, x, y, 1, h, hi); rect(c, x, y + h - 1, w, 1, lo); rect(c, x + w - 1, y, 1, h, lo);
  }
  function inset(c, x, y, w, h, fill = '#060a16') { rect(c, x - 1, y - 1, w + 2, h + 2, '#16181e'); rect(c, x, y, w, h, fill); rect(c, x, y + h, w, 1, '#8a8e9a'); rect(c, x + w, y, 1, h + 1, '#8a8e9a'); }
  function slot(c, x, y, w, h) {
    inset(c, x, y, w, h, '#0a1024');
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(70,90,150,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(80,110,180,0.10)'; for (let yy = y + 2; yy < y + h; yy += 3) c.fillRect(x, yy, w, 1);
  }
  // menu lateral RE2 (EQUIP / USE / CHECK / COMBINE)
  function sideMenu(c, sel, mx = 262, my = 30) {
    const items = ['EQUIP', 'USE', 'CHECK', 'COMBINE'], mw = 86, mh = 14, H = items.length * mh + 8;
    c.fillStyle = 'rgba(6,10,16,0.92)'; c.fillRect(mx, my, mw, H);
    c.fillStyle = '#8a90a8'; c.fillRect(mx, my, mw, 1); c.fillRect(mx, my + H - 1, mw, 1); c.fillRect(mx, my, 1, H); c.fillRect(mx + mw - 1, my, 1, H);
    items.forEach((s, i) => {
      const y = my + 4 + i * mh, on = s === sel;
      if (on) { c.fillStyle = '#284a8a'; c.fillRect(mx + 3, y, mw - 6, mh - 1); c.fillStyle = '#ffe048'; c.fillRect(mx + 5, y + 4, 3, 5); }
      bitText(c, s, mx + 12 + textWidth(s, 1) / 2, y + 7, 1, on ? '#ffffff' : '#7a8098', { outline: null });
    });
  }

  // ==================== 06: pantalla de carga de puerta ====================
  // Negro; puerta de madera de 4 cuarterones con pomo de laton en su marco, muro de piedra casi negro. Bisagra a la
  // izquierda: la hoja se abre HACIA camara mientras la camara avanza al hueco negro (corte en el negro a la armeria).
  function shot06() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dl = new THREE.DirectionalLight(0xffe2b8, 2.0); dl.position.set(1.2, 2.2, 3.5); scene.add(dl);
    const cam = new THREE.PerspectiveCamera(40, LW / LH, 0.05, 40);
    const R = L.rng(606);
    // hoja: 64x128, veta vertical + 4 cuarterones con bisel pintado + rozaduras
    const grain = Swood(61, '#6a3a1c', '#3a1c0c', true, 0.5, 64, 128);
    const tDoor = L.cvs(64, 128, (c) => {
      c.drawImage(grain.image, 0, 0);
      const pan = (x, y, w, h) => {
        c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(255,220,170,0.28)'; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h);       // bisel con luz arriba-izq
        c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
        c.fillStyle = 'rgba(255,220,170,0.12)'; c.fillRect(x + 5, y + 5, w - 10, h - 10);               // cuarteron elevado
        c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 5, y + h - 6, w - 10, 1); c.fillRect(x + w - 6, y + 5, 1, h - 10);
      };
      pan(7, 8, 22, 52); pan(35, 8, 22, 52); pan(7, 68, 22, 52); pan(35, 68, 22, 52);
      c.fillStyle = 'rgba(20,8,2,0.5)'; for (let k = 0; k < 40; k++) c.fillRect(R() * 64 | 0, R() * 128 | 0, 1 + (R() * 4 | 0), 1);   // rozaduras
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 118, 64, 10);                                                                  // mugre abajo
    });
    const tEdge = Swood(62, '#5a2e14', '#2e1608', true, 0.7);
    const tJamb = Swood(63, '#4a2812', '#26140a', true, 0.6);
    const tStone = L.cvs(64, 64, (c, w, h) => {   // sillares oscuros
      const r = L.rng(64), img = c.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const joint = y % 16 === 0 || (x + (Math.floor(y / 16) % 2) * 16) % 32 === 0;
        const v = joint ? 14 : 44 + (r() - 0.5) * 22; const i = (y * w + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.95; img.data[i + 2] = v * 0.9; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
    });
    const tFloor = L.cvs(32, 32, (c) => { c.fillStyle = '#2a2622'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#1a1714'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32); c.fillStyle = '#34302a'; c.fillRect(16, 16, 16, 16); c.fillRect(0, 0, 16, 16); c.fillStyle = '#1a1714'; c.fillRect(0, 16, 32, 1); c.fillRect(16, 0, 1, 32); });
    const stoneM = L.lam(L.rep(tStone, 2, 2)), stoneM2 = L.lam(L.rep(tStone, 1, 1));
    L.box(2.6, 4.6, 0.3, stoneM, -1.92, 2.3, -0.2, scene); L.box(2.6, 4.6, 0.3, stoneM, 1.92, 2.3, -0.2, scene);
    L.box(1.24, 2.2, 0.3, stoneM2, 0, 3.32, -0.2, scene);
    L.plane(6, 8, L.lam(L.rep(tFloor, 10, 14)), 0, 0, 1.5, scene, 0, -Math.PI / 2);
    // marco
    const jM = L.lam(tJamb), jMh = L.lam(L.rep(tJamb, 1, 0.3));
    L.box(0.1, 2.24, 0.34, jM, -0.57, 1.12, -0.18, scene); L.box(0.1, 2.24, 0.34, jM, 0.57, 1.12, -0.18, scene);
    L.box(1.24, 0.12, 0.36, jMh, 0, 2.22, -0.18, scene);
    // detras del hueco: negro absoluto (umbral apenas visible)
    L.plane(1.04, 2.16, L.basic(null, 0x000000), 0, 1.08, -0.34, scene);
    L.box(1.04, 0.03, 0.3, L.lam(null, 0x2a1a10), 0, 0.015, -0.18, scene);
    // hoja (pivote en la bisagra)
    const hinge = new THREE.Group(); hinge.position.set(-0.52, 0, -0.06); scene.add(hinge);
    const fM = L.lam(tDoor), eM = L.lam(tEdge);
    L.mesh(new THREE.BoxGeometry(1.04, 2.16, 0.07), [eM, eM, eM, eM, fM, fM], 0.52, 1.08, 0, hinge);
    const brass = lamC(0xc89a3a), brassD = lamC(0x7a5a1c);
    for (const s of [1, -1]) {   // pomo y bocallave a los dos lados
      cyl(0.045, 0.045, 0.02, 8, brassD, 0.92, 1.02, s * 0.045, hinge).rotation.x = Math.PI / 2;
      cyl(0.016, 0.016, 0.05, 6, brass, 0.92, 1.02, s * 0.07, hinge).rotation.x = Math.PI / 2;
      L.mesh(new THREE.SphereGeometry(0.042, 6, 4), brass, 0.92, 1.02, s * 0.11, hinge);
      L.box(0.05, 0.12, 0.012, brass, 0.92, 0.88, s * 0.041, hinge); L.box(0.012, 0.035, 0.014, lamC(0x0a0604), 0.92, 0.875, s * 0.042, hinge);
    }
    for (const y of [0.3, 1.86]) L.box(0.03, 0.16, 0.08, brassD, 0.0, y, 0, hinge);   // bisagras
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), push = ease(0.0, 1.8, lt);
        cam.position.set(0.02, 1.12 - 0.05 * push, 3.6 - 3.2 * push);
        cam.lookAt(0.0, 1.06, -1.0); cam.updateProjectionMatrix();
        hinge.rotation.y = -1.85 * ease(0.15, 1.55, q);
      },
    };
  }

  // ==================== 08: ITEM casi vacio, pistola en EXAMINE ====================
  const pg = await L.loadModel('models/pistol-retro.glb');
  function shot08() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1.5, 3, 2); scene.add(dl);
    const cam = new THREE.PerspectiveCamera(40, LW / LH, 0.05, 60);
    const inv = new THREE.Group(); scene.add(inv); inv.position.set(0, 0, -0.35);
    const tCase = Swood(34, '#2a1a12', '#1a100a', false, 0.5);
    const tSlot = L.cvs(32, 32, (c) => {
      c.fillStyle = '#0e2a1a'; c.fillRect(0, 0, 32, 32);
      c.fillStyle = '#123a24'; for (let y = 4; y < 30; y += 3) c.fillRect(3, y, 26, 1);
      c.fillStyle = '#06120a'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32);
      c.fillStyle = '#58b07c'; c.fillRect(1, 1, 30, 2); c.fillRect(1, 1, 2, 30);
      c.fillStyle = '#04100a'; c.fillRect(1, 29, 30, 2); c.fillRect(29, 1, 2, 30);
      c.fillStyle = '#2c6e48'; c.fillRect(3, 3, 26, 1); c.fillRect(3, 3, 1, 26);
    });
    SboxAt(-1.75, 1.75, -0.3, -0.02, -2.25, 2.25, shade(tCase, [0.6, 0.5, 0.8, 0.3, 0.7, 0.4]), inv);
    L.plane(3.2, 4.0, L.lam(L.rep(tSlot, 4, 5)), 0, -0.01, 0, inv, 0, -Math.PI / 2);
    for (const [x0, x1, z0, z1] of [[-1.75, 1.75, -2.25, -2.0], [-1.75, 1.75, 2.0, 2.25], [-1.75, -1.6, -2.25, 2.25], [1.6, 1.75, -2.25, 2.25]])
      SboxAt(x0, x1, -0.02, 0.12, z0, z1, shade(tCase, [0.7, 0.55, 0.9, 0.3, 0.8, 0.45]), inv);
    for (const s of [-1, 1]) SboxAt(s * 1.75 - 0.03, s * 1.75 + 0.03, 0.12, 0.15, -2.25, 2.25, [0.8, 0.8, 1, 0.5, 0.9, 0.6].map((k) => [null, new THREE.Color(0xb08a3a).multiplyScalar(k)]), inv);
    // pistola: casillas col 0-1, fila 0 (centro x -0.8, z -1.6)
    const gun = L.ps1Clone(pg.scene, { lit: true });
    { const b = new THREE.Box3().setFromObject(gun), s = b.getSize(new THREE.Vector3()); gun.scale.multiplyScalar(1.35 / Math.max(s.x, s.y, s.z));
      const c = new THREE.Box3().setFromObject(gun).getCenter(new THREE.Vector3()); gun.position.sub(c); }
    gun.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.emissive) m.emissive.setHex(0x4a4e58); }); });
    const prof = new THREE.Group(); prof.add(gun); prof.rotation.set(0, Math.PI / 2, 0);   // perfil hacia +z (banner.js)
    const tilt = new THREE.Group(); tilt.add(prof);
    const gunG = new THREE.Group(); gunG.add(tilt); inv.add(gunG);
    let blinkOn = true;
    return {
      scene, camera: cam,
      update(lt, t) {
        const q = L.q15(lt);
        cam.position.set(0, 8.6, 6.4); cam.lookAt(0, 0, 0.55); cam.updateProjectionMatrix();
        // se levanta de su casilla (seleccionada) y gira despacio delante de la camara
        const up = ease(0.35, 1.0, q) * (1 - ease(2.2, 2.75, q));   // EXAMINE breve: vuelve a su casilla y queda plana y alineada antes de "bullets" (19.95)
        gunG.position.set(-0.8 + 0.6 * up, 0.08 + 1.38 * up, -1.5 + 1.9 * up); gunG.scale.setScalar(1 - 0.12 * up);
        tilt.rotation.x = -Math.PI / 2 + (Math.PI / 2 - 0.62) * up;
        gunG.rotation.y = up * 0.55 * Math.sin((q - 0.35) * 1.3);
        blinkOn = !(t >= SW.fifteen && t < SW.fifteen + 0.8 && Math.floor((t - SW.fifteen) / 0.1) % 2 === 1);
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, P = (x, z, y = 0.02) => scr(cam, x, y, z - 0.35), q = L.q15(lt), t = T08 + lt;
        // cursor parpadeante sobre la casilla de la pistola
        const col = Math.floor(q * 4) % 2 === 0 ? '#ffe048' : '#b08418';
        if (lt > 0.25) {
          const k = [P(-1.6, -2.0), P(0, -2.0), P(0, -1.2), P(-1.6, -1.2)];
          for (let i = 0; i < 4; i++) { const p0 = k[i], p1 = k[(i + 1) % 4]; for (const d of [0, 1]) Sline(c, p0[0] + d, p0[1] + d, p1[0] + d, p1[1] + d, col); }
          for (const p of k) { c.fillStyle = col; c.fillRect(p[0] - 2, p[1] - 2, 5, 5); }
        }
        // contador de balas en verde RE (parpadea en "fifteen", luego queda brillante)
        if (blinkOn) {
          const p = P(-0.05, -1.25, 0.0), hot = t >= SW.fifteen;
          bitText(c, '15', p[0] - textWidth('15', 2) / 2 - 3, p[1] - 9, 2, hot ? '#c8ffb8' : '#9cf09c', { outline: '#000000' });
        }
        if (t >= SW.fifteen && blinkOn) {   // eco grande junto al arma: "15"
          const g = P(0.8, -1.6, 0.0);   // eco grande sobre las casillas vacias a la derecha de la pistola
          bitText(c, '15', g[0], g[1], 3, '#9cf09c', { outline: '#021006' });
        }
        sideMenu(c, 'CHECK');
        bitText(c, 'ITEMS', 40, 37, 1, '#9cf09c', { outline: null });
        examine(o, Math.max(0, t - SW.one), 'HANDGUN  x1', "15 rounds. That's it.");
      },
    };
  }

  // ==================== 10: cuentas del agua (ITEM/RE) ====================
  // Camara ortografica en pixeles (1 u = 1 px de 360x640): fondo pintado (paneles RE2) en un plano, iconos 3D encima,
  // textos encima de todo. 5 GAL (five), 4 x 1.6 GAL (four), +6 (six), = 11 DAYS (eleven), HELP: 7 DAYS + check (seven).
  const J = { x: 70, y: 76, w: 92, h: 96 };                       // casilla de la garrafa
  const TK = [0, 1, 2, 3].map((i) => ({ x: 26 + i * 79, y: 214, w: 71, h: 62 }));   // casillas de las cisternas
  function shot10() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1, 1.6, 2); scene.add(dl);
    const cam = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); cam.position.set(0, 0, 500); cam.lookAt(0, 0, 0);
    const W = (px, py) => [px - LW / 2, LH / 2 - py];
    const tBg = L.cvs(LW, LH, (c) => {
      const g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
      c.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) c.fillRect(0, y, LW, 1);
      // barra de titulo
      bevel(c, 14, 30, 332, 22, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 18, 34, 324, 14, '#04060e');
      // panel de la garrafa
      bevel(c, J.x - 6, J.y - 6, J.w + 12, J.h + 12); slot(c, J.x, J.y, J.w, J.h);
      // panel de las cisternas
      bevel(c, 18, 206, 324, 78); for (const s of TK) slot(c, s.x, s.y, s.w, s.h);
    });
    L.plane(LW, LH, L.basic(tBg), 0, 0, -400, scene);
    // GARRAFA azul de 5 gal (dispensador): cilindro con costillas, hombro, cuello, tapon
    const R = L.rng(1010);
    const tJug = L.cvs(64, 64, (c) => {
      c.fillStyle = '#2f78c8'; c.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 9) { c.fillStyle = '#5aa0e8'; c.fillRect(0, y, 64, 2); c.fillStyle = '#1e5498'; c.fillRect(0, y + 7, 64, 1); }   // costillas
      c.fillStyle = 'rgba(210,235,255,0.35)'; for (let k = 0; k < 40; k++) c.fillRect(R() * 64 | 0, R() * 64 | 0, 1 + (R() * 5 | 0), 1);
      c.fillStyle = 'rgba(160,210,255,0.45)'; c.fillRect(0, 24, 64, 14);   // agua vista por dentro
      c.fillStyle = '#e8e4d8'; c.fillRect(20, 26, 24, 10); c.fillStyle = '#1a3a7a'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('5 GAL', 32, 31);
    });
    const jug = new THREE.Group(); scene.add(jug);
    const jM = L.lam(tJug), jM2 = lamC(0x2a6ab8), capM = lamC(0xe8e8e0);
    cyl(30, 30, 52, 10, jM, 0, 0, 0, jug);
    cyl(12, 30, 16, 10, jM2, 0, 34, 0, jug);
    cyl(10, 11, 10, 8, jM2, 0, 47, 0, jug);
    cyl(12, 12, 8, 8, capM, 0, 55, 0, jug);
    cyl(29, 30, 4, 10, lamC(0x1e5498), 0, -27, 0, jug);
    { const [x, y] = W(J.x + J.w / 2, J.y + J.h / 2 + 10); jug.position.set(x, y, 0); }
    // CISTERNA de vater (porcelana blanca, tapa, palanca cromada)
    const tPorc = L.cvs(32, 32, (c) => { c.fillStyle = '#eceae2'; c.fillRect(0, 0, 32, 32); c.fillStyle = 'rgba(160,160,150,0.35)'; for (let k = 0; k < 18; k++) c.fillRect(R() * 32 | 0, R() * 32 | 0, 1 + (R() * 3 | 0), 1); c.fillStyle = 'rgba(120,150,170,0.25)'; c.fillRect(0, 26, 32, 6); });
    const pM = L.lam(tPorc), pM2 = lamC(0xd8d6ce), chrome = lamC(0xb8c0c8);
    const tanks = TK.map((s, i) => {
      const g = new THREE.Group(); scene.add(g);
      L.box(46, 30, 20, pM, 0, 0, 0, g);                 // deposito
      L.box(50, 5, 24, pM2, 0, 17, 0, g);                // tapa
      L.box(10, 3, 3, chrome, -14, 9, 11.5, g); cyl(2.2, 2.2, 3, 6, chrome, -19, 9, 11, g).rotation.x = Math.PI / 2;   // palanca
      L.box(8, 8, 8, pM2, 0, -18, -2, g);                // tubo a la taza
      const [x, y] = W(s.x + s.w / 2, s.y + s.h / 2 + 4); g.position.set(x, y, 0); g.userData.ph = i * 0.9;
      return g;
    });
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), t = T10 + lt;
        const pj = pop(t, SW.five);
        jug.scale.setScalar(Math.max(0.001, pj)); jug.visible = pj > 0;
        jug.rotation.set(0.22, -0.5 + 0.35 * Math.sin(q * 0.9), 0.04);
        tanks.forEach((g, i) => {
          const p = pop(t, SW.four + i * 0.08); g.visible = p > 0; g.scale.setScalar(Math.max(0.001, p));
          g.rotation.set(0.32, -0.55 + 0.25 * Math.sin(q * 0.9 + g.userData.ph), 0);
        });
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = T10 + lt;
        bitText(c, 'WATER   1 GAL / PERSON / DAY', LW / 2, 41, 1, '#9cf09c', { outline: null });
        if (t >= SW.five) Slabel(c, '5 GAL', 262, J.y + J.h / 2, '#5aa0e8', [J.x + J.w + 6, J.y + J.h / 2], [0, 0.5], fadeIn(t, SW.five, 0.1), { sc: 2 });
        if (t >= SW.five) bitText(c, 'WATER COOLER', 262, J.y + J.h / 2 + 24, 1, '#7a8098', { outline: null });
        bitText(c, 'TOILET TANKS', 70, 196, 1, t >= SW.four ? '#c8ccd8' : '#3a3e52', { outline: null });
        if (t >= SW.four) Slabel(c, '4 x 1.6 GAL', 118, 306, '#e8e8ec', [118, 284], [0.5, 0], fadeIn(t, SW.four, 0.1), { sc: 2 });
        if (t >= SW.six) { const s = pop(t, SW.six); bitText(c, '+6', 286, 306 - 4 * (s - 1), 3, '#ffd23f', { outline: '#140c00' }); }
        if (t >= SW.eleven) {
          const k = fadeIn(t, SW.eleven, 0.12);
          c.fillStyle = mixHex('#000000', '#58d058', k); c.fillRect(40, 330, 280, 2);
          bitText(c, '5 + 6', 180, 346, 2, mixHex('#000000', '#c8ccd8', k), { outline: null });
          const s = pop(t, SW.eleven); bitText(c, '= 11 DAYS', 180, 374 - 3 * (s - 1), 3, '#62f05a', { outline: '#021006' });
        }
        if (t >= SW.seven) {
          const k = fadeIn(t, SW.seven, 0.1), x0 = 112;
          left(c, 'HELP: 7 DAYS', x0, 470, 2, mixHex('#000000', '#ececec', k));
          Scheck(c, x0 + textWidth('HELP: 7 DAYS', 2) + 22, 468, 10, '#40e040', ease(SW.seven + 0.05, SW.seven + 0.3, t));
        }
      },
    };
  }

  // ==================== 15: FILE "DUTY LOG — NIGHT SHIFT" con sellos LOST ====================
  const OFF = [['Sgt. M. HARLAN', 'PTL-3'], ['Ofc. R. ORTIZ', 'DESK'], ['Ofc. D. KOWALSKI', 'PTL-1'], ['Det. J. PRICE', 'DET.'], ['Ofc. T. NAKAMURA', 'PTL-2'], ['Ofc. B. VICKERS', 'FRONT']];
  const PXL = 28, PYT = 60, PW = 304, PH = 330, ROW0 = 196, ROWH = 30, INK = '#2a2016';
  function shot15() {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    const cam = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10);
    // hoja envejecida (pintada una vez): papel amarillento, manchas de cafe, pliegue, bordes gastados, renglones
    const R = L.rng(1515);
    const paper = document.createElement('canvas'); paper.width = PW; paper.height = PH;
    { const c = paper.getContext('2d'), img = c.createImageData(PW, PH);
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
        const e = Math.min(x, y, PW - 1 - x, PH - 1 - y), edge = e < 10 ? (10 - e) * 5 : 0, n = (R() - 0.5) * 16 + (y % 2 ? -2 : 0);
        const fold = Math.abs(y - PH * 0.52) < 1 ? -26 : 0, i = (y * PW + x) * 4;
        img.data[i] = 214 + n - edge + fold; img.data[i + 1] = 198 + n - edge * 1.2 + fold; img.data[i + 2] = 156 + n - edge * 1.6 + fold; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      for (let k = 0; k < 3; k++) { const x = 40 + R() * 220, y = 40 + R() * 340, r = 14 + R() * 18; c.strokeStyle = 'rgba(120,80,30,0.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.stroke(); c.fillStyle = 'rgba(140,100,40,0.08)'; c.fill(); }
      c.fillStyle = 'rgba(80,60,30,0.25)'; for (let k = 0; k < 60; k++) c.fillRect(R() * PW | 0, R() * PH | 0, 1, 1);
      for (let k = 0; k < 8; k++) c.clearRect(R() < 0.5 ? 0 : PW - 2, R() * PH | 0, 2, 3 + R() * 6);   // mordidas del borde
      c.fillStyle = 'rgba(70,90,140,0.22)'; for (let i = 0; i < 7; i++) c.fillRect(14, ROW0 - PYT + 14 + i * ROWH - ROWH, PW - 28, 1);   // renglones
    }
    // sello LOST (pintado una vez, tinta irregular)
    const stamp = document.createElement('canvas'); stamp.width = 66; stamp.height = 24;
    { const c = stamp.getContext('2d'), r = L.rng(77); c.fillStyle = '#c41c16';
      c.fillRect(0, 0, 66, 2); c.fillRect(0, 22, 66, 2); c.fillRect(0, 0, 2, 24); c.fillRect(64, 0, 2, 24);
      c.fillRect(3, 3, 60, 1); c.fillRect(3, 20, 60, 1); c.fillRect(3, 3, 1, 18); c.fillRect(62, 3, 1, 18);
      bitText(c, 'LOST', 33, 12, 2, '#c41c16', { outline: null });
      for (let k = 0; k < 60; k++) c.clearRect(r() * 66 | 0, r() * 24 | 0, 1 + (r() * 2 | 0), 1);   // huecos de tinta
    }
    return {
      scene, camera: cam,
      update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = T15 + lt, prevS = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
        // cabecera FILE (pestana RE)
        bevel(c, 14, 30, 332, 22, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 18, 34, 324, 14, '#04060e');
        bitText(c, 'FILE', 40, 41, 1, '#9cf09c', { outline: null }); bitText(c, 'DUTY LOG', 300, 41, 1, '#c8ccd8', { outline: null });
        // la hoja entra deslizando un poco desde abajo
        const sl = Math.round(16 * (1 - ease(0, 0.3, lt))), Y = PYT + sl;
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 4, Y + 4, PW, PH);
        c.drawImage(paper, PXL, Y);
        const dy = sl;
        bitText(c, 'CITY POLICE DEPARTMENT', LW / 2, 86 + dy, 1, INK, { outline: null });
        bitText(c, 'DUTY LOG — NIGHT SHIFT', LW / 2, 106 + dy, 2, INK, { outline: null });
        bitText(c, 'OCT 28   20:00 - 06:00', LW / 2, 126 + dy, 1, '#5a4a34', { outline: null });
        rect(c, PXL + 16, 138 + dy, PW - 32, 1, INK);
        left(c, 'OFFICER', 46, 156 + dy, 1, INK); left(c, 'UNIT', 166, 156 + dy, 1, INK);
        const stOn = t >= SW.status;
        left(c, 'STATUS', 240, 156 + dy, 1, stOn ? '#a81810' : INK);
        if (stOn) rect(c, 238, 164 + dy, Math.round((textWidth('STATUS', 1) + 4) * ease(SW.status, SW.status + 0.15, t)), 2, '#a81810');
        rect(c, PXL + 16, 170 + dy, PW - 32, 1, INK);
        OFF.forEach(([name, unit], i) => {
          const tr = SW.every + i * ROW_GAP; if (t < tr) return;
          const k = fadeIn(t, tr, 0.08), y = ROW0 + i * ROWH + dy, col = mixHex('#d6c69c', INK, k);
          left(c, `${i + 1}. ${name}`, 40, y, 1, col); left(c, unit, 166, y, 1, col);
          c.fillStyle = mixHex('#d6c69c', '#8a7a5a', k); for (let x = 238; x < 314; x += 3) c.fillRect(x, y + 6, 2, 1);   // hueco del estado
          const ts = SW.lost + i * STAMP_GAP; if (t < ts) return;
          // sello: cae grande y se asienta, un poco girado
          const u = L.clamp01((t - ts) / 0.06), s = 1.7 - 0.7 * u, rot = [-0.06, 0.05, -0.03, 0.07, -0.05, 0.04][i];
          c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.translate(277, y + [0, 1, -1, 1, 0, -1][i]); c.rotate(rot); c.scale(s, s);
          c.drawImage(stamp, -33, -12); c.restore();
        });
        if (t >= SW.every + 6 * ROW_GAP) { left(c, 'Watch Cmdr.', 46, 368 + dy, 1, '#4a3a26'); Sline(c, 120, 374 + dy, 220, 370 + dy, '#3a2a60'); Sline(c, 120, 375 + dy, 220, 371 + dy, '#3a2a60'); }
        c.imageSmoothingEnabled = prevS;
      },
    };
  }

  // ==================== 19: menu YES / NO + tarjeta final ====================
  // ---------- VICKERS en 3D (copiado de sets/hall.js: city-zombie con uniforme azul marino, gorra de plato, placa y VICKERS) ----------
  const cityG = await L.loadModel('models/city-zombie.glb');
  const Spx = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const Srgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  function shot19() {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const BG = 0x0a1222;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 6, 22);
    const cam = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 40);
    // luces: farola azul detras (contraluz), relleno muy bajo desde el vestibulo oscuro
    scene.add(new THREE.HemisphereLight(0x5a70a8, 0x1a1a24, 0.9));
    const street = new THREE.PointLight(0xc8dcff, 10, 10, 1); street.position.set(1.4, 3.4, -2.6); scene.add(street);
    const rim = new THREE.DirectionalLight(0x9ab8ff, 1.8); rim.position.set(-1.5, 4, -6); rim.target.position.set(0.5, 1.4, 0); scene.add(rim, rim.target);
    const fill = new THREE.DirectionalLight(0x8aa0d0, 0.9); fill.position.set(0.3, 2, 5); fill.target.position.set(0.5, 1.5, -0.5); scene.add(fill, fill.target);
    // calle: asfalto mojado, fachadas oscuras, farola con su lampara encendida
    const tAsph = L.cvs(32, 32, (c) => { const r = L.rng(191); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 14 - 7; Spx(c, x, y, Srgb(22 + n, 26 + n, 36 + n)); } for (let k = 0; k < 6; k++) Spx(c, r() * 30 | 0, r() * 30 | 0, '#4a5a7a', 3, 1); });
    L.plane(14, 12, L.lam(L.rep(tAsph, 8, 7)), 0, 0, -6, scene, 0, -Math.PI / 2);
    const tBld = L.cvs(32, 64, (c) => { Spx(c, 0, 0, '#141a28', 32, 64); for (let y = 4; y < 64; y += 12) for (let x = 3; x < 32; x += 10) Spx(c, x, y, (x * 7 + y) % 5 === 0 ? '#3a4a6a' : '#0a0e18', 6, 7); });
    L.box(14, 9, 0.5, L.lam(L.rep(tBld, 4, 1.3)), 0, 4.5, -9, scene);
    const mPole = L.lam(null, 0x2a3040);
    L.box(0.1, 3.6, 0.1, mPole, 1.9, 1.8, -3.2, scene); L.box(0.6, 0.06, 0.06, mPole, 1.62, 3.6, -3.2, scene);
    L.mesh(new THREE.SphereGeometry(0.12, 6, 4), L.basic(null, 0xe8f0ff), 1.36, 3.5, -3.2, scene);
    // halo de la farola en la lluvia detras de el: recorta la silueta
    const tHalo = L.cvs(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(150,185,255,0.9)'); g.addColorStop(0.5, 'rgba(70,100,170,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    L.plane(4.2, 4.2, L.basic(tHalo, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), 0.95, 2.2, -3.0, scene);
    // puertas de cristal (z = 0): marco metalico, 2 hojas + cristaleras laterales, travesanos, tiradores
    const mFr = L.lam(null, 0x2a3242), mHd = L.lam(null, 0x9aa4b8);
    for (const x of [-1.62, -0.82, 0, 0.82, 1.62]) L.box(0.07, 3.2, 0.08, mFr, x, 1.6, 0, scene);
    L.box(3.3, 0.1, 0.08, mFr, 0, 3.15, 0, scene); L.box(3.3, 0.07, 0.08, mFr, 0, 2.45, 0, scene); L.box(3.3, 0.14, 0.08, mFr, 0, 0.07, 0, scene); L.box(3.3, 0.06, 0.08, mFr, 0, 1.0, 0, scene);
    for (const x of [-0.12, 0.12]) L.box(0.03, 0.55, 0.04, mHd, x, 1.15, 0.07, scene);
    const tGlass = L.cvs(32, 64, (c) => { c.clearRect(0, 0, 32, 64); Spx(c, 0, 0, 'rgba(150,180,230,0.10)', 32, 64); const r = L.rng(192); for (let k = 0; k < 40; k++) Spx(c, r() * 32 | 0, r() * 64 | 0, 'rgba(200,220,255,0.35)', 1, 1 + (r() * 3 | 0)); for (let k = 0; k < 6; k++) Spx(c, r() * 32 | 0, 0, 'rgba(180,200,240,0.18)', 1, 64); });
    L.plane(3.24, 3.1, L.basic(null, 0x8aa8d0, { transparent: true, opacity: 0.07, depthWrite: false }), 0, 1.6, 0.02, scene); void tGlass;
    // ---- Vickers ----
    const navyTex = L.cvs(32, 64, (c) => {
      const r = L.rng(32);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 10 - 5; Spx(c, x, y, Srgb(30 + n, 40 + n, 70 + n)); }
      for (let x = 0; x < 32; x += 16) Spx(c, x + 7, 0, '#121a30', 1, 32);
      for (let x = 0; x < 32; x += 16) { Spx(c, x + 2, 8, '#18223e', 4, 2); Spx(c, x + 10, 8, '#18223e', 4, 2); Spx(c, x + 8, 4, '#a0a0a8'); Spx(c, x + 8, 12, '#a0a0a8'); Spx(c, x + 8, 20, '#a0a0a8'); }
      for (let k = 0; k < 5; k++) Spx(c, Math.floor(r() * 30), 14 + Math.floor(r() * 16), '#3a0c0c', 2 + Math.floor(r() * 2), 1 + Math.floor(r() * 3));
      for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 - 4; Spx(c, x, y, Srgb(20 + n, 26 + n, 46 + n)); }
      Spx(c, 0, 32, '#0c0c0e', 32, 3); Spx(c, 14, 32, '#9a8a50', 3, 3); for (let x = 0; x < 32; x += 16) Spx(c, x + 3, 36, '#3a4a7a', 1, 28);
    });
    navyTex.wrapS = THREE.RepeatWrapping; navyTex.wrapT = THREE.ClampToEdgeWrapping;
    const skinT = L.rep(L.cvs(32, 32, (c) => {
      const r = L.rng(33);
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; Spx(c, x, y, Srgb(138 + n, 150 + n, 152 + n)); }
      for (let k = 0; k < 14; k++) Spx(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
    }), 1, 1);
    const tPlate = L.cvs(64, 16, (c, w, h) => {
      Spx(c, 0, 0, '#6a5420', w, h); Spx(c, 1, 1, '#d8bc60', w - 2, h - 2); Spx(c, 1, 1, '#f4e098', w - 2, 2); Spx(c, 1, h - 3, '#a08030', w - 2, 2);
      c.fillStyle = '#141008'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VICKERS', w / 2, h / 2 + 1);
    });
    const tShield = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.fillStyle = '#d8bc60'; c.beginPath(); c.moveTo(8, 0); c.lineTo(15, 3); c.lineTo(14, 10); c.lineTo(8, 15); c.lineTo(2, 10); c.lineTo(1, 3); c.closePath(); c.fill(); c.fillStyle = '#806020'; c.beginPath(); c.arc(8, 7, 3, 0, 7); c.fill(); Spx(c, 4, 1, '#f8e8a8', 8, 1); });
    cityG.scene.traverse((o) => {   // el GLB no trae UVs utiles -> UV planares (camisa arriba, pantalon abajo), como hall.js
      if (!o.isMesh || o.userData.Suv) return; o.userData.Suv = 1; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
        else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    });
    const root = L.ps1Clone(cityG.scene);
    root.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || '';
      o.material = n.includes('Outfit') ? L.lam(navyTex) : n.includes('Body') ? L.lam(skinT, 0x3a4048) : L.lam(null, 0x6a2a20); o.material.side = THREE.DoubleSide; });
    const wrap = new THREE.Group(); wrap.add(root); scene.add(wrap); root.updateMatrixWorld(true);
    { const bb = new THREE.Box3().setFromObject(root), k = 1.86 / (bb.max.y - bb.min.y); root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k; }
    const mixer = new THREE.AnimationMixer(root), idle = mixer.clipAction(THREE.AnimationClip.findByName(cityG.animations, 'Zombie_Idle')); idle.play();
    let hip = null; const meshes = []; root.traverse((o) => { if (o.isSkinnedMesh) { if (!hip) hip = o.skeleton.bones[0]; meshes.push(o); } });
    const hip0 = hip.position.clone();
    const bone = (re) => { let b = null; root.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
    const hR = bone(/(hand.?R|RightHand)$/), head = bone(/(^head|Head)$/) || bone(/spine.?006$/);
    const pose = (tt) => { idle.time = tt % idle.getClip().duration; mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; wrap.updateMatrixWorld(true); };
    const attachAt = (b, obj, Mw) => { b.add(obj); b.updateMatrixWorld(true); b.matrixWorld.clone().invert().multiply(Mw).decompose(obj.position, obj.quaternion, obj.scale); };
    const capG = new THREE.Group(), eyes = new THREE.Group();
    {
      wrap.position.set(0, 0, 0); pose(0.6);
      const hd = head.getWorldPosition(V()), topB = bone(/HeadTop_End$/), tp = topB ? topB.getWorldPosition(V()) : hd.clone().add(V(0, 0.2, 0)); void tp;
      const pts = []; for (const m of meshes) { const p = V(), n = m.geometry.attributes.position.count; for (let i = 0; i < n; i++) { m.getVertexPosition(i, p); pts.push(p.clone().applyMatrix4(m.matrixWorld)); } }
      const frontAt = (x, y, r = 0.025) => { let z = -9; for (const q of pts) if (Math.abs(q.x - x) < r && Math.abs(q.y - y) < r && q.z > z) z = q.z; return z; };
      let crown = -9; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.05 && Math.abs(q.z - hd.z) < 0.08 && q.y > crown) crown = q.y;
      let noseZ = -9, noseY = hd.y; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.012 && q.y > hd.y && q.y < crown && q.z > noseZ) { noseZ = q.z; noseY = q.y; }
      const mNavy = L.lam(null, 0x1a2244), mBlk = L.lam(null, 0x0c0c0e), mGold = L.lam(null, 0xd8b850);
      let sx = 0, sz = 0, sn = 0; for (const q of pts) if (q.y > crown - 0.07 && Math.abs(q.x - hd.x) < 0.15 && Math.abs(q.z - hd.z) < 0.2) { sx += q.x; sz += q.z; sn++; }
      const cx = sn ? sx / sn : hd.x, cz = sn ? sz / sn : hd.z;
      let hw = 0, hdp = 0; for (const q of pts) if (q.y > crown - 0.09 && q.y < crown - 0.04 && Math.abs(q.z - cz) < 0.14 && Math.abs(q.x - cx) < 0.14) { hw = Math.max(hw, Math.abs(q.x - cx)); hdp = Math.max(hdp, Math.abs(q.z - cz)); }
      const R = Math.min(0.1, Math.max(0.07, hw || 0.085)), DZ = Math.min(1.25, Math.max(1.0, (hdp || R) / R));
      const cylG = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
      const band = L.mesh(cylG(R * 1.04, R * 1.04, 0.032), mBlk, 0, 0.016, 0, capG);
      const crownM = L.mesh(cylG(R * 1.2, R * 1.05, 0.038), mNavy, 0, 0.051, 0, capG);
      const dome = L.mesh(new THREE.SphereGeometry(R * 1.2, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), mNavy, 0, 0.07, 0, capG); dome.scale.y = 0.18;
      for (const m of [band, crownM, dome]) m.scale.z = DZ;
      L.mesh(cylG(R * 1.045, R * 1.045, 0.006), mGold, 0, 0.033, 0, capG).scale.z = DZ;
      const visor = L.mesh(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.008, 10, 1, false, -Math.PI / 2, Math.PI), mBlk, 0, 0.004, R * DZ * 0.55, capG);
      visor.scale.z = 0.75; visor.rotation.x = 0.38;
      L.box(0.028, 0.03, 0.006, mGold, 0, 0.05, R * 1.13 * DZ, capG).rotation.x = -0.15;
      attachAt(head, capG, new THREE.Matrix4().setPosition(V(cx, crown - 0.055, cz)));
      const mEye = L.basic(null, 0xb8bcb4);   // ojos blancos apagados bajo la visera
      for (const s of [-1, 1]) L.mesh(new THREE.PlaneGeometry(0.026, 0.012), mEye, s * 0.032, 0, 0, eyes);
      { const ez = Math.max(frontAt(hd.x + 0.032, noseY + 0.03, 0.012), frontAt(hd.x - 0.032, noseY + 0.03, 0.012));
        attachAt(head, eyes, new THREE.Matrix4().setPosition(V(hd.x, noseY + 0.03, ez + 0.004))); }
      const sp = bone(/Spine2$/), s2 = sp.getWorldPosition(V());
      const by = s2.y + 0.04, bxL = s2.x + 0.085, bxR = s2.x - 0.085, zz = Math.max(frontAt(bxL, by + 0.03, 0.03), frontAt(bxR, by, 0.03));
      const gp = new THREE.Group(); gp.add(L.plane(0.1, 0.026, L.basic(tPlate), 0, 0, 0, null));
      const gs = new THREE.Group(); gs.add(L.plane(0.06, 0.06, L.basic(tShield, 0xffffff, { alphaTest: 0.5 }), 0, 0, 0, null));
      attachAt(sp, gp, new THREE.Matrix4().makeTranslation(s2.x - (bxL - s2.x), by, zz + 0.02));
      attachAt(sp, gs, new THREE.Matrix4().makeTranslation(bxL, by + 0.035, zz + 0.02));
    }
    function aimBone(b, tip, target) {
      const bp = b.getWorldPosition(V()), cur = tip.getWorldPosition(V()).sub(bp).normalize(), want = target.clone().sub(bp).normalize();
      const qW = new THREE.Quaternion().setFromUnitVectors(cur, want), bw = b.getWorldQuaternion(new THREE.Quaternion()), pw = b.parent.getWorldQuaternion(new THREE.Quaternion());
      b.quaternion.copy(pw.invert().multiply(qW.multiply(bw))); b.updateMatrixWorld(true);
    }
    const fore = hR.parent, arm = fore.parent; const qa = arm.quaternion.clone(), qf = fore.quaternion.clone();
    const CX = 0.71;   // de pie tras la hoja derecha, quieto, esperando
    const upd = (lt) => {
      const q = L.q15(lt);
      cam.position.set(0.2, 1.5, 2.4); cam.lookAt(0.2, 1.9, 0); cam.updateProjectionMatrix();
      arm.quaternion.copy(qa); fore.quaternion.copy(qf);
      wrap.position.set(CX, 0, -0.5); wrap.rotation.set(0, 0, 0.012 * Math.sin(q * 0.9));   // vaiven minimo
      pose(0.6 + 0.12 * Math.sin(q * 0.7));
      const hp = head.getWorldPosition(V()), tgt = V(hp.x - 0.36, hp.y + 0.02, -0.04);   // mano apoyada en el cristal a la altura de la cara
      aimBone(arm, hR, tgt); aimBone(fore, hR, tgt); wrap.updateMatrixWorld(true);
    };
    // vineta 2D (encima del 3D, debajo del menu)
    const vign = document.createElement('canvas'); vign.width = LW; vign.height = LH;
    { const c = vign.getContext('2d'), v = c.createRadialGradient(LW / 2, 300, 90, LW / 2, 320, 430); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, LW, LH); }
    const R = L.rng(1919), RAIN = Array.from({ length: 70 }, () => [R() * LW, R() * LH, 6 + R() * 10, 260 + R() * 160]);
    const PXa = 16, PYa = 108, PWa = 328, PHa = 182;
    return {
      scene, camera: cam,
      update(lt) { upd(lt); },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = T19 + lt, q = L.q15(lt);
        c.drawImage(vign, 0, 0);
        c.fillStyle = 'rgba(120,150,210,0.35)';
        for (const [x, y, len, sp] of RAIN) { const yy = ((y + q * sp) % (LH + 40)) - 20, xx = Math.round(x - (yy / LH) * 12); c.fillRect(xx, Math.round(yy), 1, Math.round(len)); }
        // panel RE: translucido oscuro con borde biselado fino
        const kp = fadeIn(lt, 0, 0.2);
        c.fillStyle = `rgba(4,8,18,${0.86 * kp})`; c.fillRect(PXa, PYa, PWa, PHa);
        c.fillStyle = '#8a90a8'; c.fillRect(PXa, PYa, PWa, 1); c.fillRect(PXa, PYa, 1, PHa);
        c.fillStyle = '#2a2e3e'; c.fillRect(PXa, PYa + PHa - 1, PWa, 1); c.fillRect(PXa + PWa - 1, PYa, 1, PHa);
        c.strokeStyle = '#3a3e52'; c.strokeRect(PXa + 3.5, PYa + 3.5, PWa - 7, PHa - 7);
        // pregunta en dos lineas, palabra a palabra (cada linea anclada a la izquierda: no baila)
        const L1 = 'DO YOU OPEN', L2 = 'THE DOOR?';
        const w1 = Q_WORDS.slice(0, 3).filter(([, tw]) => t >= tw).map(([w]) => w).join(' ');
        const w2 = Q_WORDS.slice(3).filter(([, tw]) => t >= tw).map(([w]) => w).join(' ');
        if (w1) left(c, w1, Math.round(LW / 2 - textWidth(L1, 3) / 2), 146, 3, '#ececec', { outline: '#000000' });
        if (w2) left(c, w2, Math.round(LW / 2 - textWidth(L2, 3) / 2), 184, 3, '#ececec', { outline: '#000000' });
        // opciones grandes + cursor amarillo
        if (t >= SW.door) {
          const k = fadeIn(t, SW.door, 0.12), xs = [LW / 2 - 70, LW / 2 + 70], OYb = 250;
          const sel = t >= SW.no ? 1 : t >= SW.yes ? 0 : -1;
          ['YES', 'NO'].forEach((s, i) => bitText(c, s, xs[i], OYb, 3, mixHex('#000000', i === sel ? '#ffe048' : '#b8b8b8', k), { outline: '#000000' }));
          if (sel >= 0) {
            const ts = sel ? SW.no : SW.yes, cx = Math.round(xs[sel] - textWidth(sel ? 'NO' : 'YES', 3) / 2 - 22 + (t - ts < 0.08 ? -4 : 0)), on = Math.floor((t - ts) * 4) % 2 === 0;
            c.fillStyle = '#000000'; for (let i = 0; i < 11; i++) c.fillRect(cx + i - 1, OYb - 12 + i, 2, 25 - 2 * i);
            c.fillStyle = on ? '#ffe048' : '#c89a20'; for (let i = 0; i < 10; i++) c.fillRect(cx + i, OYb - 11 + i, 1, 23 - 2 * i);
          }
        }
        // COMMENT + flecha grande que bota (encima de la banda de subtitulos)
        if (t >= SW.comment) {
          const k = fadeIn(t, SW.comment, 0.1), b = Math.round(3 * Math.abs(Math.sin((t - SW.comment) * 5))), col = mixHex('#000000', '#ffd23f', k);
          const w = textWidth('COMMENT', 3), x = LW / 2 - 12;
          bitText(c, 'COMMENT', x, 366, 3, col, { outline: '#000000' });
          const ax = Math.round(x + w / 2 + 18), ay = 350 + b;
          c.fillStyle = '#000000'; c.fillRect(ax - 3, ay - 1, 7, 15); for (let i = 0; i < 9; i++) c.fillRect(ax - 9 + i, ay + 13 + i, 19 - 2 * i, 2);
          c.fillStyle = col; c.fillRect(ax - 2, ay, 5, 13); for (let i = 0; i < 8; i++) c.fillRect(ax - 8 + i, ay + 13 + i, 17 - 2 * i, 1);
        }
        // maquina de escribir: una tecla por letra (Courier), bajo la banda de subtitulos
        if (t >= SW.most) {
          const n = Math.floor((t - SW.most) * KEY_RATE); c.font = 'bold 26px "Courier New", monospace'; c.textBaseline = 'middle'; c.textAlign = 'left';
          const xw = Math.round(LW / 2 - c.measureText(TYPE_LINE).width / 2), s = TYPE_LINE.slice(0, n);
          c.fillStyle = '#000000'; c.fillText(s, xw + 2, 472); c.fillStyle = '#e8e4dc'; c.fillText(s, xw, 470);
        }
        if (t >= FOLLOW) bitText(c, 'FOLLOW AVA RESTFIELD!', LW / 2, 524, 2, '#ececec', { outline: '#000000' });
      },
    };
  }

  return { '06_door': shot06(), '08_item': shot08(), '10_math': shot10(), '15_log': shot15(), '19_choice': shot19() };
}

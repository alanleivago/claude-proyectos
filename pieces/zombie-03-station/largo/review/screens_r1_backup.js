import { reText as bitText, reWidth as textWidth } from '../refont.js';
// sets/screens.js (LARGO 16:9) — pantallas de RE sin HUD ni gamma (film.js las trata como "dark"):
//   ITEM/SUPPLIES con panel de TOTALES: 05_hook_items, 26_item_pistol (pistola en EXAMINE), 35_item_water (contador 5->11->51),
//   41_item_dog (RIBBON en EXAMINE, perro 3D de sets/dog.js si existe), 66_item_final (LIGHTS: ON rojo);
//   puertas de carga RE: 23_door_armory (metal), 33_door_basement (madera + escaleras abajo), 62_door_radio;
//   diagramas: 27_db (barras dB), 32_tanks (garrafa + cisternas, NO FLUSHING), 42_hearing (mapa cenital, circulos de oido);
//   56_duty_log (FILE con sellos LOST), 69_choice (menu YES/NO + DAY 2 a maquina + FOLLOW).
// Contrato: ../SETS.md. TODOS los tiempos salen de plan(ctx) (palabras de la voz); nada fijo a nivel de modulo. Prefijo S*.
const ROW_GAP = 0.14, STAMP_GAP = 0.08;
const TYPE_LINE = 'DAY 2 — YOU DECIDE.';
const OFF = [['Sgt. M. HARLAN', 'PTL-3'], ['Ofc. R. ORTIZ', 'DESK'], ['Ofc. D. KOWALSKI', 'PTL-1'], ['Det. J. PRICE', 'DET.'], ['Ofc. T. NAKAMURA', 'PTL-2'], ['Ofc. B. VICKERS', 'FRONT']];

// ---------- anclas (s globales) de cada pantalla, compartidas por shots() y sfx() ----------
function plan(ctx) {
  const { at, endOf, T, CUTS, TL } = ctx;
  const filmEnd = TL.words[TL.words.length - 1][2] + 5;
  const end = (id) => { const i = CUTS.findIndex((c) => c[0] === id); return i >= 0 && i + 1 < CUTS.length ? CUTS[i + 1][1] : filmEnd; };
  const sh = (id) => ({ t0: T[id], t1: end(id), dur: end(id) - T[id] });
  const P = {
    s05: { ...sh('05_hook_items'), dog: at('h5', 'dog'), fifteen: at('h5', 'fifteen'), lock: endOf('h5', 'bullets') },
    s23: sh('23_door_armory'), s33: sh('33_door_basement'), s62: sh('62_door_radio'),
    s26: { ...sh('26_item_pistol'), one: at('m5', 'one'), pistol: at('m5', 'pistol'), fifteen: at('m5', 'fifteen') },
    s27: { ...sh('27_db'), mm: at('m6', 'nine'), hundred: at('m6', 'hundred'), sixty: at('m6', 'sixty'), louder: at('m7', 'louder'), jet: at('m7', 'jet'), right: at('m7', 'right') },
    s32: { ...sh('32_tanks'), water: at('w4', 'water'), five: at('w4', 'five'), four: at('w4', 'four'), six: at('w5', 'six'), flushes: at('w5', 'flushes') },
    s35: { ...sh('35_item_water'), f51: at('w8', 0), f51e: endOf('w8', 0), days: at('w8', 'days'), seven: at('w8', 'seven') },
    s41: { ...sh('41_item_dog'), ribbon: at('k6', 'ribbon'), better: at('k6', 'better') },
    s42: { ...sh('42_hearing'), dog: at('k7', 'dog'), hear: at('k7', 'hear'), some: at('k7', 'some'), four: at('k7', 'four'), farther: at('k7', 'farther') },
    s56: { ...sh('56_duty_log'), every: at('n8', 'every'), status: at('n9', 'status'), lost: at('n9', 'lost'), vickers: at('n10', 'vickers') },
    s66: { ...sh('66_item_final'), dog: at('f1', 'dog'), fifteen: at('f1', 'fifteen'), f51: at('f1', 'fifty'), light: at('f1', 'light'), on: at('f1', -1) },
    s69: { ...sh('69_choice'), q: ['do', 'you', 'open', 'the', 'door'].map((w) => at('f5', w)), comment: at('f5', 'comment'), yes: at('f5', 'yes'), no: at('f5', 'no'), most: at('f6', 'most'), follow: endOf('f6', -1) + 1.5 },
  };
  // derivados
  P.s26.lift = P.s26.pistol - 0.25;
  P.s41.lift = Math.max(P.s41.ribbon + 0.35, P.s41.better - 0.3);
  P.s56.hl = P.s56.vickers < P.s56.t1 - 0.1 ? P.s56.vickers : Math.min(P.s56.t1 - 0.2, P.s56.lost + 5 * STAMP_GAP + 0.06);   // 'Vickers' cae ya en el plano 57
  for (const k of ['s23', 's33', 's62']) { const d = P[k]; d.open0 = d.t0 + Math.min(0.12, d.dur * 0.1); d.open1 = d.t0 + d.dur * 0.78; }
  return P;
}
// contador del agua de 35: 5 (inicio) -> 11 -> 51 durante la palabra "fifty-one"
function waterRoll(p, t) {
  const u = (t - p.f51) / Math.max(0.2, p.f51e - p.f51);
  if (u <= 0) return 5;
  if (u < 0.3) return Math.round(5 + 6 * u / 0.3);
  if (u < 0.45) return 11;
  return Math.min(51, Math.round(11 + 40 * (u - 0.45) / 0.55));
}

// ---------- sonidos (s globales) para el mezclador ----------
export function sfx(ctx) {
  const P = plan(ctx), s = [], f3 = (x) => Math.round(x * 1000) / 1000;
  const door = (d, metal) => { s.push([d.t0 + 0.02, 'door_unlock'], [d.open0, metal ? 'door_creak_metal' : 'door_creak']); if (d.dur > 1.5) s.push([d.t1 - 0.12, 'door_slam']); };
  // 05 avance ITEM
  { const p = P.s05; s.push([p.t0 + 0.02, 'menu_open'], [p.dog, 'item_pop'], [p.dog, 'label'], [p.fifteen, 'item_pop'], [p.fifteen, 'counter_tick'], [p.lock, 'lock_clunk']); }
  door(P.s23, true);
  // 26 pistola
  { const p = P.s26; s.push([p.t0 + 0.02, 'menu_open'], [p.t0 + 0.2, 'cursor_move'], [p.lift - 0.05, 'item_select'], [p.lift, 'item_lift'], [p.one, 'examine_text'], [p.fifteen, 'counter_tick'], [p.fifteen, 'label']); }
  // 27 dB: pantalla, etiqueta 9 mm, barra que sube (ticks), etiqueta jet + barra, +20 dB
  { const p = P.s27; s.push([p.t0 + 0.02, 'menu_open'], [p.mm, 'label'], [p.hundred, 'bar_rise']);
    for (let t = p.hundred; t < p.sixty; t += 2 / 15) s.push([f3(t), 'counter_tick']);
    s.push([p.sixty, 'label'], [p.louder, 'label'], [p.jet, 'bar_rise'], [p.jet + 0.45, 'label'], [p.right, 'label']); }
  // 32 cuentas del agua
  { const p = P.s32; s.push([p.t0 + 0.02, 'menu_open'], [p.five, 'item_pop'], [p.five, 'label']);
    for (let i = 0; i < 4; i++) s.push([f3(p.four + i * 0.08), 'item_pop']);
    s.push([p.four, 'label'], [p.six, 'label'], [p.flushes, 'stamp']); }
  door(P.s33, false);
  // 35 agua: contador rodando (un tick por cambio a 15 fps), 51 DAYS, ayuda con check
  { const p = P.s35; s.push([p.t0 + 0.02, 'menu_open']); let last = 5;
    for (let t = p.f51; t <= p.f51e + 0.01; t += 1 / 15) { const v = waterRoll(p, t); if (v !== last) { s.push([f3(t), 'counter_tick']); last = v; } }
    s.push([p.days, 'label'], [p.seven, 'label'], [p.seven + 0.05, 'check']); }
  // 41 perro
  { const p = P.s41; s.push([p.t0 + 0.02, 'menu_open'], [p.ribbon, 'item_pop'], [p.ribbon, 'label'], [p.lift - 0.05, 'item_select'], [p.lift, 'item_lift'], [p.lift + 0.1, 'examine_text']); }
  // 42 mapa de oido
  { const p = P.s42; s.push([p.t0 + 0.02, 'menu_open'], [p.t0 + 0.15, 'ping'], [p.dog, 'item_pop'], [p.some, 'label'], [p.four, 'ring_expand'], [p.four + 0.45, 'label']); }
  // 56 FILE: hoja, 6 lineas, cabecera STATUS, 6 sellos LOST, VICKERS resaltado
  { const p = P.s56; s.push([p.t0 + 0.02, 'file_open']);
    for (let i = 0; i < 6; i++) s.push([f3(p.every + i * ROW_GAP), 'paper_tick']);
    s.push([p.status, 'label']);
    for (let i = 0; i < 6; i++) s.push([f3(p.lost + i * STAMP_GAP), 'stamp']);
    s.push([p.hl, 'label']); }
  door(P.s62, true);
  // 66 ITEM final
  { const p = P.s66; s.push([p.t0 + 0.02, 'menu_open'], [p.dog, 'item_pop'], [p.fifteen, 'item_pop'], [p.fifteen, 'counter_tick'], [p.f51, 'item_pop'], [p.f51, 'counter_tick'], [p.light, 'label'], [p.on, 'alarm_beep']); }
  // 69 menu
  { const p = P.s69, kr = ctx.KEY_RATE; s.push([p.t0 + 0.05, 'menu_open']);
    for (const t of p.q) s.push([t, 'ui_tick']);
    s.push([p.comment, 'label'], [p.yes, 'cursor_move'], [p.no, 'cursor_move']);
    [...TYPE_LINE].forEach((ch, i) => { if (ch !== ' ') s.push([f3(p.most + (i + 1) / kr), 'type_key']); });
    s.push([p.follow, 'label']); }
  return s.map(([t, n]) => [f3(t), n]).sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, examine } = ctx;
  const { THREE, LW, LH } = L;
  const P = plan(ctx);
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * L.clamp01(k)).toString(16).padStart(2, '0')).join('');
  const fadeIn = (lt, t0, d = 0.15) => L.clamp01((lt - t0) / d);
  const left = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, o);
  const right = (c, s, x, y, sc, col, o = { outline: null }) => bitText(c, s, x - textWidth(s, sc) / 2, y, sc, col, o);
  const pop = (t, t0) => (t < t0 ? 0 : t < t0 + 0.07 ? 1.25 * (t - t0) / 0.07 : 1 + 0.25 * Math.max(0, 1 - (t - t0 - 0.07) / 0.1));
  const W = (px, py) => [px - LW / 2, LH / 2 - py];   // pixel -> mundo de la camara ortografica

  // ---------- texturas / cajas ----------
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
  const lamC = (c) => L.lam(null, c, { flatShading: true });
  const cyl = (r0, r1, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r0, r1, h, n), m, x, y, z, p);
  const noiseTex = (seed, w, h, base, amp, extra) => L.cvs(w, h, (c) => {
    const r = L.rng(seed), A = hexRGB(base), img = c.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const n = (r() - 0.5) * amp; for (let j = 0; j < 3; j++) img.data[i * 4 + j] = A[j] + n; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0); if (extra) extra(c, r, w, h);
  });

  // ---------- dibujo 2D: lineas, check, paneles RE2 ----------
  function Sline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 3000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
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
  function bgGrad(c) {
    const g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
    c.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) c.fillRect(0, y, LW, 1);
  }
  const titleBar = (c) => { bevel(c, 12, 10, 616, 26, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 16, 14, 608, 18, '#04060e'); };
  // pixel art desde mapa de caracteres
  function pixmap(rows, pal) { const cv = document.createElement('canvas'); cv.width = rows[0].length; cv.height = rows.length; const c = cv.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x, y, 1, 1); } })); return cv; }
  const blit = (c, cv, cx, cy, k, sx = 1) => { const p = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false; const w = cv.width * k * sx, h = cv.height * k;
    if (Math.abs(w) >= 1) { c.save(); c.translate(Math.round(cx), Math.round(cy)); c.scale(sx < 0 ? -1 : 1, 1); c.drawImage(cv, Math.round(-Math.abs(w) / 2), Math.round(-h / 2), Math.round(Math.abs(w)), Math.round(h)); c.restore(); } c.imageSmoothingEnabled = p; };
  const DOG_ICON = pixmap([
    '..k........k..',
    '.kk........kk.',
    '.kek......kek.',
    '.keek....keek.',
    '.kttkkkkkkttk.',
    '..kttttttttk..',
    '..tkwtttttwkt.',
    '..ttkttttktt..',
    '..tttttttttt..',
    '...ttckkcttt..',
    '...tcknnkct...',
    '....ckkkkc....',
    '.....cccc.....',
  ], { k: '#1e1a16', e: '#7a4c20', t: '#b8803c', w: '#f0ece0', c: '#cfa262', n: '#0e0c0a' });
  const LOCK_ICON = pixmap([
    '...kkkkk...',
    '..k.....k..',
    '.k.......k.',
    '.k.......k.',
    'yyyyyyyyyyy',
    'yhhhhhhhhhy',
    'yhhhkkkhhhy',
    'yhhhkkkhhhy',
    'yhhhhkhhhhy',
    'yhhhhkhhhhy',
    'yyyyyyyyyyy',
  ], { k: '#9aa4b8', y: '#7a5a1c', h: '#c89a3a' });
  const PISTOL_ICON = pixmap([
    '.kkkkkkkkkkkkk',
    'kgggggggggggggk',
    'kkkkkkkkkkkkkk.',
    '....kkk.k......',
    '....kkkkk......',
    '...kkkk........',
    '...kkkk........',
    '..kkkk.........',
  ], { k: '#c8ccd8', g: '#6a6e7a' });
  const JET_ICON = pixmap([
    '..........kk..........',
    '..........kkk.........',
    'kk........kkkk........',
    'kkk.......kkkkk.......',
    'kkkkkkkkkkkkkkkkkkkkk.',
    'kkkkkkkkkkkkkkkkkkkkkk',
    '.......kkkkkkk........',
    '.......kkkkk..........',
    '.......kkk............',
  ], { k: '#c8ccd8' });

  // ---------- modelos ----------
  const pg = await L.loadModel('models/pistol-retro.glb');
  function makePistol() {   // pistola en perfil hacia +z, longitud max = 1
    const gun = L.ps1Clone(pg.scene, { lit: true });
    { const b = new THREE.Box3().setFromObject(gun), s = b.getSize(new THREE.Vector3()); gun.scale.multiplyScalar(1 / Math.max(s.x, s.y, s.z));
      const c = new THREE.Box3().setFromObject(gun).getCenter(new THREE.Vector3()); gun.position.sub(c); }
    gun.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.emissive) m.emissive.setHex(0x4a4e58); }); });
    const prof = new THREE.Group(); prof.add(gun); prof.rotation.set(0, Math.PI / 2, 0);
    const g = new THREE.Group(); g.add(prof); return g;
  }
  const R0 = L.rng(1010);
  const tJug = L.cvs(64, 64, (c) => {
    c.fillStyle = '#2f78c8'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 9) { c.fillStyle = '#5aa0e8'; c.fillRect(0, y, 64, 2); c.fillStyle = '#1e5498'; c.fillRect(0, y + 7, 64, 1); }
    c.fillStyle = 'rgba(210,235,255,0.35)'; for (let k = 0; k < 40; k++) c.fillRect(R0() * 64 | 0, R0() * 64 | 0, 1 + (R0() * 5 | 0), 1);
    c.fillStyle = 'rgba(160,210,255,0.45)'; c.fillRect(0, 24, 64, 14);
    c.fillStyle = '#e8e4d8'; c.fillRect(20, 26, 24, 10); c.fillStyle = '#1a3a7a'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('5 GAL', 32, 31);
  });
  function makeJug() {   // garrafa azul de 5 gal, en pixeles (~88 de alto), centrada
    const jug = new THREE.Group(), inner = new THREE.Group(); jug.add(inner); inner.position.y = -16;
    const jM = L.lam(tJug), jM2 = lamC(0x2a6ab8), capM = lamC(0xe8e8e0);
    cyl(30, 30, 52, 10, jM, 0, 0, 0, inner); cyl(12, 30, 16, 10, jM2, 0, 34, 0, inner); cyl(10, 11, 10, 8, jM2, 0, 47, 0, inner);
    cyl(12, 12, 8, 8, capM, 0, 55, 0, inner); cyl(29, 30, 4, 10, lamC(0x1e5498), 0, -27, 0, inner);
    return jug;
  }
  // perro 3D (sets/dog.js de otro agente): import dinamico con plan B
  let loadDog = null;
  try { ({ loadDog } = await import('./dog.js')); } catch (e) { console.warn('screens: sin dog.js -> placeholder (' + e + ')'); }
  async function makeDog() { if (!loadDog) return null; try { return await loadDog(L); } catch (e) { console.warn('screens: loadDog fallo -> placeholder (' + e + ')'); return null; } }

  // ==================== ITEM / SUPPLIES (05 26 35 41 66) ====================
  // Camara ortografica en pixeles 640x360: fondo pintado (paneles RE2), 6 casillas a la izquierda (HANDGUN, RIBBON, WATER, ...),
  // panel de TOTALES a la derecha, caja EXAMINE de film.js abajo (y 232-294). Subtitulo libre (y 290-330).
  const SL = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 24 + (i % 3) * 126, y: 50 + Math.floor(i / 3) * 90, w: 118, h: 82 }));
  const slotC = (i) => [SL[i].x + SL[i].w / 2, SL[i].y + SL[i].h / 2 + 4];
  const TP = { x: 406, y: 44, w: 220, h: 186 };
  const EXC = [200, 136];   // centro del EXAMINE sobre la rejilla
  const tItemBg = L.cvs(LW, LH, (c) => {
    bgGrad(c); titleBar(c);
    bevel(c, 14, 42, 384, 188); for (const s of SL) slot(c, s.x, s.y, s.w, s.h);
    bevel(c, TP.x, TP.y - 2, TP.w, TP.h + 2); inset(c, TP.x + 6, TP.y + 26, TP.w - 12, TP.h - 34, '#040812');
    c.fillStyle = 'rgba(80,110,180,0.10)'; for (let y = TP.y + 28; y < TP.y + TP.h - 8; y += 3) c.fillRect(TP.x + 6, y, TP.w - 12, 1);
  });
  function itemShot(cfg) {
    const { t0 } = cfg;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1, 1.6, 2); scene.add(dl);
    const cam = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -2000, 2000); cam.position.set(0, 0, 900); cam.lookAt(0, 0, 0);
    const bgM = L.basic(tItemBg); L.plane(LW, LH, bgM, 0, 0, -800, scene);   // se oscurece durante el EXAMINE
    const objs = {};
    if (cfg.gun !== undefined) { const g = makePistol(); scene.add(g); objs.gun = g; }
    if (cfg.water !== undefined) { const j = makeJug(); scene.add(j); objs.water = j; }
    const dog3 = cfg.dog3 || null; if (dog3) { scene.add(dog3.root); }
    const ex = cfg.exam;
    const exUp = (t) => (ex ? ease(ex.t, ex.t + 0.4, t) : 0);
    return {
      scene, camera: cam,
      update(lt) {
        const t = t0 + lt, q = L.q15(lt), up = exUp(t);
        bgM.color.setScalar(1 - 0.55 * up);
        if (objs.gun) {
          const p = pop(t, cfg.gun), g = objs.gun, isEx = ex && ex.kind === 'gun', u = isEx ? up : 0, [sx, sy] = slotC(0);
          g.visible = p > 0; const [x, y] = W(sx + (EXC[0] - sx) * u, sy - 2 + (EXC[1] - sy + 2) * u);
          g.position.set(x, y, 200 * u); g.scale.setScalar(Math.max(0.001, p) * (96 + 140 * u));
          g.rotation.set(0.25 + 0.15 * u, -0.35 + (isEx && t > ex.t ? 0.95 * Math.sin(L.q15(t - ex.t) * 1.5) * u : 0), 0.05);
        }
        if (objs.water) {
          const p = pop(t, cfg.water), j = objs.water, [sx, sy] = slotC(2);
          j.visible = p > 0; const [x, y] = W(sx, sy); j.position.set(x, y, 0); j.scale.setScalar(Math.max(0.001, p) * 0.78);
          j.rotation.set(0.22, -0.5 + 0.35 * Math.sin(q * 0.9), 0.04);
        }
        if (dog3) {
          const [sx, sy] = slotC(1), u = up; const [x, y] = W(sx + (EXC[0] - sx) * u, sy + 26 + (EXC[1] + 74 - sy - 26) * u);
          dog3.root.visible = u > 0.02; dog3.root.position.set(x, y, 300);
          dog3.root.scale.setScalar(Math.max(0.001, 50 + 110 * u));
          dog3.root.rotation.set(0.18, 1.1 + (t > ex.t ? 0.9 * Math.sin(L.q15(t - ex.t) * 1.3) : 0), 0);
          dog3.update(lt, 'stand', { wag: 1 });
        }
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = t0 + lt, up = exUp(t), dimk = 1 - 0.65 * up;
        const dc = (col) => mixHex('#000000', col, dimk);
        bitText(c, 'ITEMS', 52, 23, 2, '#9cf09c', { outline: null });
        right(c, cfg.title || 'SUPPLIES', 612, 23, 2, '#c8ccd8');
        // casillas: nombre arriba, cantidad en verde abajo a la derecha
        const named = [['HANDGUN', cfg.gun, cfg.gunCount], ['RIBBON', cfg.dog, cfg.dogCount], ['WATER', cfg.water, cfg.waterCount]];
        named.forEach(([nm, ta, cnt], i) => {
          if (ta === undefined || ta === null || t < ta) return;
          const s = SL[i], k = fadeIn(t, ta, 0.1);
          left(c, nm, s.x + 5, s.y + 9, 1, dc(mixHex('#000000', '#c8ccd8', k)));
          const n = cnt ? cnt(t) : null; if (n) right(c, n, s.x + s.w - 5, s.y + s.h - 11, 2, dc('#9cf09c'), { outline: '#000000' });
        });
        // icono 2D del perro en su casilla
        if (cfg.dog !== undefined && cfg.dog !== null && t >= cfg.dog) {
          const [sx, sy] = slotC(1), p = pop(t, cfg.dog); if (!(dog3 && up > 0.02)) blit(c, DOG_ICON, sx, sy, Math.max(1, Math.round(4 * p)), 1);
          if (up > 0.02 && !dog3) { // placeholder del EXAMINE sin modelo 3D: icono grande que "gira" (escala x = coseno)
            blit(c, DOG_ICON, EXC[0], EXC[1], Math.round(4 + 6 * up), Math.cos(L.q15(t - ex.t) * 1.6) || 0.01);
          }
        }
        // candado "?"
        if (cfg.lock !== undefined && t >= cfg.lock) {
          const [sx, sy] = slotC(2), p = pop(t, cfg.lock);
          blit(c, LOCK_ICON, sx - 14, sy, Math.max(1, Math.round(4 * p)));
          bitText(c, '?', sx + 30, sy, 3, '#ffe048', { outline: '#000000' });
        }
        // cursor amarillo parpadeante sobre la casilla elegida
        if (cfg.sel && t >= cfg.sel[1]) {
          const s = SL[cfg.sel[0]], col = Math.floor((t - cfg.sel[1]) * 4) % 2 === 0 ? '#ffe048' : '#b08418';
          for (const d of [0, 1]) { c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(s.x - 3.5 - d, s.y - 3.5 - d, s.w + 7 + 2 * d, s.h + 7 + 2 * d); }
          for (const [x, y] of [[s.x - 4, s.y - 4], [s.x + s.w + 3, s.y - 4], [s.x - 4, s.y + s.h + 3], [s.x + s.w + 3, s.y + s.h + 3]]) { c.fillStyle = col; c.fillRect(x - 2, y - 2, 5, 5); }
        }
        // TOTALES
        bitText(c, 'TOTALS', TP.x + TP.w / 2, TP.y + 11, 2, '#9cf09c', { outline: null });
        cfg.rows.forEach(([label, fn, ta], i) => {
          if (ta !== undefined && t < ta) return;
          const y = TP.y + 50 + i * 36, v = fn(t), kk = ta !== undefined ? fadeIn(t, ta, 0.1) : 1;
          if (i) { c.fillStyle = '#1a2440'; c.fillRect(TP.x + 12, y - 18, TP.w - 24, 1); }
          left(c, label, TP.x + 12, y, 2, mixHex('#000000', '#c8ccd8', kk));
          if (!v) { right(c, '--', TP.x + TP.w - 14, y, 3, '#3a4058'); return; }
          const flash = L.clamp01((t - v.tc) / 0.35), col = mixHex('#ffffff', v.col || '#62f05a', flash);
          const bob = t - v.tc < 0.07 ? -3 : 0;
          let xr = TP.x + TP.w - 14;
          if (v.unit) { right(c, v.unit, xr, y + 4, 2, mixHex('#000000', col, 0.85)); xr -= textWidth(v.unit, 2) + 5; }
          right(c, v.txt, xr, y + bob, 3, col, { outline: '#000000' });
          if (v.icon) blit(c, v.icon, xr - textWidth(v.txt, 3) - 24, y, 3);
        });
        if (cfg.extra) cfg.extra(c, t);
        if (ex && t >= ex.text) examine(o, t - ex.text, ex.title, ex.body);
      },
    };
  }
  const val = (txt, tc, more = {}) => ({ txt, tc, ...more });
  const after = (ta, v) => (t) => (t >= ta ? v : null);

  // ==================== puertas de carga RE (23 26 62) ====================
  // Negro; puerta en su marco, muro casi negro. Bisagra a la izquierda: la hoja se abre HACIA camara mientras la camara avanza
  // al hueco oscuro. Todo escalado a la duracion del plano (open0..open1 de plan()).
  const tStone = L.cvs(64, 64, (c, w, h) => {
    const r = L.rng(64), img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const joint = y % 16 === 0 || (x + (Math.floor(y / 16) % 2) * 16) % 32 === 0;
      const v = joint ? 14 : 44 + (r() - 0.5) * 22; const i = (y * w + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.95; img.data[i + 2] = v * 0.9; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const tBlock = L.cvs(64, 64, (c, w, h) => {   // bloques de hormigon pintados (armeria)
    const r = L.rng(65), img = c.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const joint = y % 16 === 0 || (x + (Math.floor(y / 16) % 2) * 16) % 32 === 0;
      const v = joint ? 30 : 62 + (r() - 0.5) * 14; const i = (y * w + x) * 4; img.data[i] = v * 0.92; img.data[i + 1] = v * 0.96; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  const tPlaster = noiseTex(66, 64, 64, '#3e4a40', 12, (c) => { c.fillStyle = '#2a3228'; c.fillRect(0, 40, 64, 24); c.fillStyle = '#5a6a58'; c.fillRect(0, 40, 64, 2); });
  const tFloor = L.cvs(32, 32, (c) => { c.fillStyle = '#2a2622'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#1a1714'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32); c.fillStyle = '#34302a'; c.fillRect(16, 16, 16, 16); c.fillRect(0, 0, 16, 16); c.fillStyle = '#1a1714'; c.fillRect(0, 16, 32, 1); c.fillRect(16, 0, 1, 32); });
  const sign = (txt, bg, fg) => L.cvs(64, 16, (c) => { c.fillStyle = '#0c0c0e'; c.fillRect(0, 0, 64, 16); c.fillStyle = bg; c.fillRect(1, 1, 62, 14); bitText(c, txt, 32, 8, 1, fg, { outline: null }); });
  function doorShot(kind, d) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); scene.fog = new THREE.Fog(0x000000, 3.4, 7.5);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dl = new THREE.DirectionalLight(kind === 'metal' ? 0xd8e4ff : 0xffe2b8, 2.0); dl.position.set(1.2, 2.2, 3.5); scene.add(dl);
    const cam = new THREE.PerspectiveCamera(40, LW / LH, 0.05, 40);
    const R = L.rng(kind === 'metal' ? 2323 : kind === 'wood' ? 3333 : 6262);
    let tDoor, tEdge, wallT, signT;
    if (kind === 'wood') {
      const grain = Swood(61, '#6a3a1c', '#3a1c0c', true, 0.5, 64, 128);
      tDoor = L.cvs(64, 128, (c) => {
        c.drawImage(grain.image, 0, 0);
        const pan = (x, y, w, h) => {
          c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x, y, w, h);
          c.fillStyle = 'rgba(255,220,170,0.28)'; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h);
          c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
          c.fillStyle = 'rgba(255,220,170,0.12)'; c.fillRect(x + 5, y + 5, w - 10, h - 10);
          c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 5, y + h - 6, w - 10, 1); c.fillRect(x + w - 6, y + 5, 1, h - 10);
        };
        pan(7, 8, 22, 52); pan(35, 8, 22, 52); pan(7, 68, 22, 52); pan(35, 68, 22, 52);
        c.fillStyle = 'rgba(20,8,2,0.5)'; for (let k = 0; k < 40; k++) c.fillRect(R() * 64 | 0, R() * 128 | 0, 1 + (R() * 4 | 0), 1);
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 118, 64, 10);
      });
      tEdge = Swood(62, '#5a2e14', '#2e1608', true, 0.7); wallT = tStone; signT = sign('BASEMENT', '#c8b47a', '#2a1a0a');
    } else if (kind === 'metal') {
      tDoor = noiseTex(2301, 64, 128, '#4c5560', 16, (c, r) => {
        c.fillStyle = '#3a424c'; c.fillRect(0, 0, 64, 3); c.fillRect(0, 125, 64, 3); c.fillRect(0, 0, 3, 128); c.fillRect(61, 0, 3, 128);
        for (const y of [30, 64, 98]) { c.fillStyle = '#5e6874'; c.fillRect(3, y, 58, 4); c.fillStyle = '#2a3038'; c.fillRect(3, y + 4, 58, 1); }
        c.fillStyle = '#8a94a0'; for (let y = 6; y < 124; y += 10) { c.fillRect(5, y, 2, 2); c.fillRect(57, y, 2, 2); }
        c.fillStyle = '#d8b020'; c.fillRect(10, 40, 44, 16); c.fillStyle = '#141414'; for (let x = 10; x < 54; x += 6) c.fillRect(x, 40, 3, 16);
        c.fillStyle = '#e8e2c8'; c.fillRect(14, 43, 36, 10); bitText(c, 'ARMORY', 32, 48, 1, '#141414', { outline: null });
        c.fillStyle = 'rgba(90,40,20,0.45)'; for (let k = 0; k < 50; k++) c.fillRect(r() * 64 | 0, r() * 128 | 0, 1 + (r() * 3 | 0), 1 + (r() * 3 | 0));   // oxido
      });
      tEdge = noiseTex(2302, 16, 64, '#3a424c', 10); wallT = tBlock; signT = sign('ARMORY', '#d8b020', '#141414');
    } else {
      tDoor = noiseTex(6201, 64, 128, '#4a5a4c', 12, (c, r) => {
        c.fillStyle = '#0c1210'; c.fillRect(18, 14, 28, 34); c.fillStyle = '#26323a'; c.fillRect(20, 16, 24, 30);   // ventanuco de cristal armado
        c.fillStyle = 'rgba(160,180,170,0.35)'; for (let x = 20; x < 44; x += 4) c.fillRect(x, 16, 1, 30); for (let y = 16; y < 46; y += 4) c.fillRect(20, y, 24, 1);
        c.fillStyle = '#e4e0d0'; c.fillRect(14, 54, 36, 12); bitText(c, 'RADIO', 32, 60, 1, '#141414', { outline: null });
        c.fillStyle = '#3a4a3c'; c.fillRect(0, 100, 64, 28); c.fillStyle = '#6a7a68'; c.fillRect(0, 100, 64, 1);   // placa de patadas
        c.fillStyle = 'rgba(20,24,20,0.5)'; for (let k = 0; k < 40; k++) c.fillRect(r() * 64 | 0, r() * 128 | 0, 1 + (r() * 3 | 0), 1);
      });
      tEdge = noiseTex(6202, 16, 64, '#3a4a3c', 10); wallT = tPlaster; signT = sign('RADIO ROOM', '#1a1a1a', '#e8e4d8');
    }
    const wallM = L.lam(L.rep(wallT, 2, 2)), wallM2 = L.lam(L.rep(wallT, 1, 1));
    L.box(2.6, 4.6, 0.3, wallM, -1.92, 2.3, -0.2, scene); L.box(2.6, 4.6, 0.3, wallM, 1.92, 2.3, -0.2, scene);
    L.box(1.24, 2.2, 0.3, wallM2, 0, 3.32, -0.2, scene);
    L.plane(6, 8, L.lam(L.rep(tFloor, 10, 14)), 0, 0, 1.5, scene, 0, -Math.PI / 2);
    L.plane(0.86, 0.22, L.basic(signT), 0, 2.52, -0.04, scene);
    const tJamb = kind === 'wood' ? Swood(63, '#4a2812', '#26140a', true, 0.6) : noiseTex(2303, 16, 64, kind === 'metal' ? '#2e343c' : '#34403a', 10);
    const jM = L.lam(tJamb), jMh = L.lam(L.rep(tJamb, 1, 0.3));
    L.box(0.1, 2.24, 0.34, jM, -0.57, 1.12, -0.18, scene); L.box(0.1, 2.24, 0.34, jM, 0.57, 1.12, -0.18, scene);
    L.box(1.24, 0.12, 0.36, jMh, 0, 2.22, -0.18, scene);
    // detras del hueco
    if (kind === 'wood') {   // escalera de madera que baja a oscuras
      const stepT = Swood(331, '#4a2c16', '#24140a', false, 0.6), sM = L.lam(stepT), sideM = L.lam(L.rep(tStone, 2, 2));
      L.box(1.04, 0.05, 0.42, sM, 0, -0.025, -0.4, scene);
      for (let i = 0; i < 12; i++) { const top = -0.18 * (i + 1), z = -0.75 - 0.28 * i; L.box(1.0, 0.05, 0.3, sM, 0, top - 0.025, z, scene); L.box(1.0, 0.18, 0.03, L.lam(null, 0x1a0e06), 0, top + 0.065, z + 0.15, scene); }
      for (const s of [-1, 1]) L.box(0.08, 5, 4.4, sideM, s * 0.56, 0, -2.5, scene);
      L.box(1.2, 0.08, 4.4, L.lam(null, 0x14100c), 0, 2.2, -2.5, scene);
      // pasamanos a la derecha
      const rail = L.box(0.05, 0.05, 3.8, L.lam(null, 0x3a2210), 0.46, -0.1, -2.0, scene); rail.rotation.x = -Math.atan2(0.18, 0.28);
      const bulb = new THREE.PointLight(0xffc888, 3.0, 3.2, 2); bulb.position.set(0, 1.9, -0.7); scene.add(bulb);
    } else {
      L.plane(1.04, 2.16, L.basic(null, 0x000000), 0, 1.08, -0.34, scene);
      if (kind === 'radio') {   // en la oscuridad: LED rojo ON AIR y dial verde muy tenues
        L.plane(0.012, 0.012, L.basic(null, 0xff2a1a, { fog: false }), 0.18, 1.0, -0.33, scene);
        L.plane(0.05, 0.01, L.basic(null, 0x2a7a3a, { fog: false }), -0.05, 0.97, -0.33, scene);
      }
    }
    L.box(1.04, 0.03, 0.3, L.lam(null, kind === 'metal' ? 0x30343a : 0x2a1a10), 0, 0.015, -0.18, scene);
    // hoja (pivote en la bisagra)
    const hinge = new THREE.Group(); hinge.position.set(-0.52, 0, -0.06); scene.add(hinge);
    const fM = L.lam(tDoor), eM = L.lam(tEdge);
    L.mesh(new THREE.BoxGeometry(1.04, 2.16, kind === 'metal' ? 0.09 : 0.07), [eM, eM, eM, eM, fM, fM], 0.52, 1.08, 0, hinge);
    if (kind === 'metal') {   // manilla de palanca + cerradura
      const steel = lamC(0xa8b0bc), dark = lamC(0x22262c);
      for (const s of [1, -1]) { L.box(0.06, 0.16, 0.02, dark, 0.92, 1.02, s * 0.055, hinge); L.box(0.2, 0.035, 0.035, steel, 0.84, 1.06, s * 0.08, hinge); }
      for (const y of [0.3, 1.08, 1.86]) L.box(0.04, 0.18, 0.1, dark, 0.0, y, 0, hinge);
    } else {
      const brass = lamC(kind === 'wood' ? 0xc89a3a : 0xa8a8a0), brassD = lamC(kind === 'wood' ? 0x7a5a1c : 0x5a5a56);
      for (const s of [1, -1]) {
        cyl(0.045, 0.045, 0.02, 8, brassD, 0.92, 1.02, s * 0.045, hinge).rotation.x = Math.PI / 2;
        cyl(0.016, 0.016, 0.05, 6, brass, 0.92, 1.02, s * 0.07, hinge).rotation.x = Math.PI / 2;
        L.mesh(new THREE.SphereGeometry(0.042, 6, 4), brass, 0.92, 1.02, s * 0.11, hinge);
      }
      for (const y of [0.3, 1.86]) L.box(0.03, 0.16, 0.08, brassD, 0.0, y, 0, hinge);
    }
    const deep = kind === 'wood';
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), t = d.t0 + q, u = L.smooth(lt / d.dur);
        if (deep) {   // entra por la puerta y baja la vista a la escalera
          const u2 = ease(0.55, 1.0, lt / d.dur);
          cam.position.set(0.02, 1.12 - 0.05 * u - 0.25 * u2, 3.6 - 3.0 * u - 1.2 * u2);
          cam.lookAt(0.0, 1.06 - 1.6 * u2, -1.0 - 1.4 * u2);
          scene.fog.near = 3.4 - 2.8 * u2; scene.fog.far = 7.5 - 4.9 * u2;   // la escalera se hunde en el negro
        } else {
          cam.position.set(0.02, 1.12 - 0.05 * u, 3.6 - 3.3 * u); cam.lookAt(0.0, 1.06, -1.0);
        }
        cam.updateProjectionMatrix();
        hinge.rotation.y = -1.85 * ease(d.open0, d.open1, t);
      },
      overlay(lt, dt, a, o) {   // sale del negro
        const k = 1 - L.clamp01(lt / Math.max(0.08, Math.min(0.35, d.dur * 0.15)));
        if (k > 0) { o.tctx.fillStyle = `rgba(0,0,0,${k})`; o.tctx.fillRect(0, 0, LW, LH); }
      },
    };
  }

  // ==================== 27: barras dB ====================
  function shot27() {
    const p = P.s27, scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e);
    const cam = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10);
    const bg = document.createElement('canvas'); bg.width = LW; bg.height = LH; { const c = bg.getContext('2d'); bgGrad(c); titleBar(c); bevel(c, 60, 44, 520, 238); inset(c, 66, 50, 508, 226, '#040812'); }
    const BASE = 250, K = 0.95, AX = 150, B1 = [196, 110], B2 = [400, 110], yOf = (db) => BASE - db * K;
    const bar = (c, x, w, db, top, bot, hi) => {
      if (db <= 0) return; const y = Math.round(yOf(db)), h = BASE - y;
      for (let yy = 0; yy < h; yy += 2) { c.fillStyle = mixHex(bot, top, yy / Math.max(1, h)); c.fillRect(x, BASE - yy - 2, w, 2); }
      rect(c, x, y, w, 2, hi); rect(c, x, y, 2, h, hi); rect(c, x + w - 2, y, 2, h, '#00000080');
    };
    return {
      scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.drawImage(bg, 0, 0);
        bitText(c, 'HOW LOUD?', 80, 23, 2, '#9cf09c', { outline: null }); right(c, 'DECIBELS (dB)', 612, 23, 2, '#c8ccd8');
        // rejilla cada 20 dB
        for (let db = 0; db <= 180; db += 20) { const y = Math.round(yOf(db)); c.fillStyle = db ? '#16203a' : '#8a90a8'; c.fillRect(AX, y, 400, 1); right(c, String(db), AX - 6, y, 1, '#6a7290'); }
        // 9 mm: etiqueta en "nine", barra que sube de "hundred" a "sixty" con el numero rodando
        if (t >= p.mm) { const k = fadeIn(t, p.mm, 0.1); blit(c, PISTOL_ICON, B1[0] + 4, 266, 2); left(c, '9 mm SHOT', B1[0] + 24, 266, 2, mixHex('#000000', '#ececec', k)); }
        const g = t >= p.sixty ? 1 : ease(p.hundred, p.sixty, t), db1 = Math.round(160 * g);
        if (t >= p.hundred) {
          bar(c, B1[0], B1[1], db1, '#ff6a40', '#7a1408', '#ffb090');
          const col = t >= p.sixty ? mixHex('#ffffff', '#ff6a40', (t - p.sixty) / 0.35) : '#c8ccd8';
          bitText(c, `${db1} dB`, B1[0] + B1[1] / 2, yOf(db1) - 20 + (t >= p.sixty && t - p.sixty < 0.07 ? -3 : 0), 3, col, { outline: '#000000' });
        }
        if (t >= p.louder && t < p.jet + 0.5) { const k = fadeIn(t, p.louder, 0.1); bitText(c, 'VS', 353, 160, 3, mixHex('#000000', '#ffd23f', k * (1 - ease(p.jet + 0.2, p.jet + 0.5, t))), { outline: null }); }
        // jet: barra en "jet" hasta 140
        if (t >= p.jet) {
          const k = fadeIn(t, p.jet, 0.1), g2 = ease(p.jet, p.jet + 0.45, t), db2 = Math.round(140 * g2);
          bar(c, B2[0], B2[1], db2, '#9ab8e8', '#1e2c50', '#d8e4ff');
          blit(c, JET_ICON, B2[0] + 2, 266, 1.5); left(c, 'JET TAKEOFF', B2[0] + 22, 266, 2, mixHex('#000000', '#ececec', k));
          bitText(c, `${db2} dB`, B2[0] + B2[1] / 2, yOf(db2) - 20, 3, g2 >= 1 ? '#9ab8e8' : '#c8ccd8', { outline: '#000000' });
        }
        // la barra del 9 mm pasa a la del jet: linea discontinua a 140 y +20 dB en rojo
        if (t >= p.right) {
          const k = ease(p.right, p.right + 0.3, t), y = Math.round(yOf(140)), x1 = B2[0] + B2[1];
          c.fillStyle = '#ffd23f'; for (let x = B1[0] - 4; x < B1[0] - 4 + (x1 - B1[0] + 8) * k; x += 6) c.fillRect(x, y, 3, 2);
          if (k >= 1) {
            const xb = B1[0] + B1[1] + 8, y0 = Math.round(yOf(160)); c.fillStyle = '#ff4030'; c.fillRect(xb + 5, y0, 3, y - y0); c.fillRect(xb, y0, 8, 2); c.fillRect(xb, y - 1, 8, 2);
            left(c, '+20', xb + 14, (y0 + y) / 2, 3, '#ff4030', { outline: '#000000' });
          }
        }
      },
    };
  }

  // ==================== 32: garrafa + cisternas, NO FLUSHING ====================
  const J32 = { x: 26, y: 54, w: 132, h: 140 };
  const TK32 = [0, 1, 2, 3].map((i) => ({ x: 186 + i * 108, y: 54, w: 100, h: 140 }));
  function shot32() {
    const p = P.s32, scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1, 1.6, 2); scene.add(dl);
    const cam = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); cam.position.set(0, 0, 500); cam.lookAt(0, 0, 0);
    const tBg = L.cvs(LW, LH, (c) => {
      bgGrad(c); titleBar(c);
      bevel(c, J32.x - 8, 42, J32.w + 16, 160); slot(c, J32.x, J32.y, J32.w, J32.h);
      bevel(c, 178, 42, 446, 160); for (const s of TK32) slot(c, s.x, s.y, s.w, s.h);
    });
    L.plane(LW, LH, L.basic(tBg), 0, 0, -400, scene);
    const jug = makeJug(); scene.add(jug); { const [x, y] = W(J32.x + J32.w / 2, J32.y + J32.h / 2 + 8); jug.position.set(x, y, 0); }
    const R = L.rng(3232);
    const tPorc = L.cvs(32, 32, (c) => { c.fillStyle = '#eceae2'; c.fillRect(0, 0, 32, 32); c.fillStyle = 'rgba(160,160,150,0.35)'; for (let k = 0; k < 18; k++) c.fillRect(R() * 32 | 0, R() * 32 | 0, 1 + (R() * 3 | 0), 1); c.fillStyle = 'rgba(120,150,170,0.25)'; c.fillRect(0, 26, 32, 6); });
    const pM = L.lam(tPorc), pM2 = lamC(0xd8d6ce), chrome = lamC(0xb8c0c8);
    const tanks = TK32.map((s, i) => {
      const g = new THREE.Group(); scene.add(g);
      L.box(46, 30, 20, pM, 0, 0, 0, g); L.box(50, 5, 24, pM2, 0, 17, 0, g);
      L.box(10, 3, 3, chrome, -14, 9, 11.5, g); cyl(2.2, 2.2, 3, 6, chrome, -19, 9, 11, g).rotation.x = Math.PI / 2;
      L.box(8, 8, 8, pM2, 0, -18, -2, g);
      const [x, y] = W(s.x + s.w / 2, s.y + s.h / 2 + 6); g.position.set(x, y, 0); g.userData.ph = i * 0.9;
      return g;
    });
    const stamp = document.createElement('canvas'); stamp.width = 240; stamp.height = 56;
    { const c = stamp.getContext('2d'), r = L.rng(3277); c.fillStyle = '#d42018';
      c.fillRect(0, 0, 240, 4); c.fillRect(0, 52, 240, 4); c.fillRect(0, 0, 4, 56); c.fillRect(236, 0, 4, 56);
      bitText(c, 'NO FLUSHING', 120, 28, 3, '#d42018', { outline: null });
      for (let k = 0; k < 160; k++) c.clearRect(r() * 240 | 0, r() * 56 | 0, 1 + (r() * 3 | 0), 1 + (r() * 2 | 0)); }
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), t = p.t0 + lt;
        const pj = pop(t, p.five); jug.visible = pj > 0; jug.scale.setScalar(Math.max(0.001, pj) * 1.25);
        jug.rotation.set(0.22, -0.5 + 0.35 * Math.sin(q * 0.9), 0.04);
        tanks.forEach((g, i) => { const pp = pop(t, p.four + i * 0.08); g.visible = pp > 0; g.scale.setScalar(Math.max(0.001, pp) * 1.6); g.rotation.set(0.32, -0.55 + 0.25 * Math.sin(q * 0.9 + g.userData.ph), 0); });
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt;
        bitText(c, 'WATER', 56, 23, 2, '#9cf09c', { outline: null }); right(c, '1 GAL / PERSON / DAY', 612, 23, 2, '#c8ccd8');
        bitText(c, 'WATER COOLER', J32.x + J32.w / 2, 64, 1, t >= p.water ? '#c8ccd8' : '#3a3e52', { outline: null });
        bitText(c, 'TOILET TANKS', 401, 64, 1, t >= p.four ? '#c8ccd8' : '#3a3e52', { outline: null });
        if (t >= p.five) { const s = pop(t, p.five); bitText(c, '5 GAL', J32.x + J32.w / 2, 232 - 3 * (s - 1), 3, '#5aa0e8', { outline: '#000000' }); }
        if (t >= p.four) { const s = pop(t, p.four); bitText(c, '4 x 1.6 GAL', 380, 232 - 3 * (s - 1), 3, '#ececec', { outline: '#000000' }); }
        if (t >= p.six) { const s = pop(t, p.six); bitText(c, '+6', 580, 232 - 4 * (s - 1), 3, '#ffd23f', { outline: '#140c00' }); }
        if (t >= p.flushes) {   // sello: cae grande y se asienta, girado, sobre las cisternas
          const u = L.clamp01((t - p.flushes) / 0.07), s = 1.8 - 0.8 * u;
          c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.translate(401, 126); c.rotate(-0.1); c.scale(s, s); c.imageSmoothingEnabled = false; c.drawImage(stamp, -120, -28); c.restore();
        }
      },
    };
  }

  // ==================== 42: mapa cenital, circulos de oido ====================
  function shot42() {
    const p = P.s42, scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e);
    const cam = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10);
    const CX = 320, CY = 160, RY = 24, RD = 96;
    const map = document.createElement('canvas'); map.width = LW; map.height = LH;
    { const c = map.getContext('2d'), r = L.rng(4242);
      bgGrad(c); titleBar(c);
      rect(c, 14, 42, 612, 238, '#0c111e');
      // calles
      c.fillStyle = '#262c3a'; for (const x of [92, 236, 404, 548]) c.fillRect(x, 42, 22, 238); for (const y of [92, 220]) c.fillRect(14, y, 612, 22);
      c.fillStyle = '#6a6440'; for (const x of [102, 246, 414, 558]) for (let y = 46; y < 280; y += 12) c.fillRect(x, y, 2, 6); for (const y of [102, 230]) for (let x = 18; x < 626; x += 12) c.fillRect(x, y, 6, 2);
      // manzanas con edificios
      const xs = [[14, 92], [114, 236], [258, 404], [426, 548], [570, 626]], ys = [[42, 92], [114, 220], [242, 280]];
      for (const [x0, x1] of xs) for (const [y0, y1] of ys) {
        rect(c, x0 + 4, y0 + 4, x1 - x0 - 8, y1 - y0 - 8, '#121a2c');
        for (let k = 0; k < 3; k++) { const w = 14 + r() * 26, h = 10 + r() * 18, x = x0 + 6 + r() * Math.max(1, x1 - x0 - 12 - w), y = y0 + 6 + r() * Math.max(1, y1 - y0 - 12 - h);
          rect(c, x | 0, y | 0, w | 0, h | 0, '#1c2640'); rect(c, x | 0, y | 0, w | 0, 1, '#2c3a5c'); }
      }
      // la comisaria
      rect(c, 270, 122, 120, 90, '#1a2a4a'); c.fillStyle = '#8aa0d0'; c.fillRect(270, 122, 120, 1); c.fillRect(270, 211, 120, 1); c.fillRect(270, 122, 1, 90); c.fillRect(389, 122, 1, 90);
      c.fillStyle = '#2a3a60'; c.fillRect(276, 128, 108, 78);
      bitText(c, 'POLICE', 330, 200, 1, '#8aa0d0', { outline: null });
    }
    const ring = (c, x, y, r, col, a) => {
      c.fillStyle = col; const n = Math.max(24, Math.round(r * 1.2));
      c.globalAlpha = a * 0.16; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); c.globalAlpha = a;
      for (let i = 0; i < n; i++) { const an = (i / n) * 6.283; if (i % 3 === 2) continue; c.fillRect(Math.round(x + r * Math.cos(an)) - 1, Math.round(y + r * Math.sin(an)) - 1, 3, 3); }
      c.globalAlpha = 1;
    };
    const Z = [[390, 108], [256, 222], [400, 214], [214, 120], [470, 70]];
    return {
      scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.drawImage(map, 0, 0);
        bitText(c, 'MAP', 44, 23, 2, '#9cf09c', { outline: null }); right(c, 'STATION BLOCK', 612, 23, 2, '#c8ccd8');
        const rd = t < p.four ? RY : RY + (RD - RY) * ease(p.four, p.four + 0.5, t);
        // zombis (puntos rojos); se encienden cuando el circulo del perro los alcanza
        Z.forEach(([x, y]) => { const hit = t >= p.dog && Math.hypot(x - CX, y - CY) <= rd + 2; c.fillStyle = hit ? '#ff4030' : '#6a2620'; c.fillRect(x - 3, y - 3, 7, 7); if (hit) { c.fillStyle = '#ffd0c0'; c.fillRect(x - 1, y - 1, 3, 3); } });
        // circulo del perro (verde), crece 4x en "four"
        if (t >= p.dog) {
          const k = fadeIn(t, p.dog, 0.15); ring(c, CX, CY, rd, '#62f05a', k);
          blit(c, DOG_ICON, CX + 14, CY + 8, 2);
          if (t >= p.four + 0.45) { const s = pop(t, p.four + 0.45); bitText(c, 'DOG  x4', CX, CY - RD - 14 - 3 * (s - 1), 3, '#62f05a', { outline: '#000000' }); }
          else bitText(c, 'DOG', CX + 38, CY + 8, 2, mixHex('#000000', '#62f05a', k), { outline: '#000000' });
        }
        // YOU (azul) desde el inicio
        { const k = fadeIn(lt, 0.1, 0.2); ring(c, CX, CY, RY, '#4fd6ff', k); c.fillStyle = '#4fd6ff'; c.fillRect(CX - 3, CY - 3, 6, 6);
          bitText(c, 'YOU', CX, CY - RY - 9, 2, mixHex('#000000', '#4fd6ff', k), { outline: '#000000' }); }
        if (t >= p.some) { const k = fadeIn(t, p.some, 0.15); left(c, '* SOME SOUNDS', 448, 268, 2, mixHex('#000000', '#c8ccd8', k)); }
      },
    };
  }

  // ==================== 56: FILE "DUTY LOG — NIGHT SHIFT" con sellos LOST ====================
  const PXL = 86, PYT = 12, PW = 468, PH = 276, ROW0 = 130, ROWH = 24, INK = '#2a2016';
  function shot56() {
    const p = P.s56, scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    const cam = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10);
    const R = L.rng(1515);
    const paper = document.createElement('canvas'); paper.width = PW; paper.height = PH;
    { const c = paper.getContext('2d'), img = c.createImageData(PW, PH);
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
        const e = Math.min(x, y, PW - 1 - x, PH - 1 - y), edge = e < 10 ? (10 - e) * 5 : 0, n = (R() - 0.5) * 16 + (y % 2 ? -2 : 0);
        const fold = Math.abs(x - PW * 0.52) < 1 ? -22 : 0, i = (y * PW + x) * 4;
        img.data[i] = 214 + n - edge + fold; img.data[i + 1] = 198 + n - edge * 1.2 + fold; img.data[i + 2] = 156 + n - edge * 1.6 + fold; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      for (let k = 0; k < 3; k++) { const x = 40 + R() * 300, y = 40 + R() * 200, r = 14 + R() * 18; c.strokeStyle = 'rgba(120,80,30,0.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.stroke(); c.fillStyle = 'rgba(140,100,40,0.08)'; c.fill(); }
      c.fillStyle = 'rgba(80,60,30,0.25)'; for (let k = 0; k < 60; k++) c.fillRect(R() * PW | 0, R() * PH | 0, 1, 1);
      for (let k = 0; k < 8; k++) c.clearRect(R() < 0.5 ? 0 : PW - 2, R() * PH | 0, 2, 3 + R() * 6);
      c.fillStyle = 'rgba(70,90,140,0.22)'; for (let i = 0; i < 7; i++) c.fillRect(14, ROW0 - PYT + 12 + i * ROWH - ROWH, PW - 28, 1);
    }
    const stamp = document.createElement('canvas'); stamp.width = 66; stamp.height = 24;
    { const c = stamp.getContext('2d'), r = L.rng(77); c.fillStyle = '#c41c16';
      c.fillRect(0, 0, 66, 2); c.fillRect(0, 22, 66, 2); c.fillRect(0, 0, 2, 24); c.fillRect(64, 0, 2, 24);
      c.fillRect(3, 3, 60, 1); c.fillRect(3, 20, 60, 1); c.fillRect(3, 3, 1, 18); c.fillRect(62, 3, 1, 18);
      bitText(c, 'LOST', 33, 12, 2, '#c41c16', { outline: null });
      for (let k = 0; k < 60; k++) c.clearRect(r() * 66 | 0, r() * 24 | 0, 1 + (r() * 2 | 0), 1); }
    const XN = PXL + 22, XU = PXL + 250, XS = PXL + 346;
    return {
      scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt, prevS = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
        // pestana FILE a la izquierda
        bevel(c, 8, 12, 70, 26, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 12, 16, 62, 18, '#04060e');
        bitText(c, 'FILE', 43, 25, 2, '#9cf09c', { outline: null });
        const sl = Math.round(16 * (1 - ease(0, 0.3, lt))), dy = sl;
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(PXL + 5, PYT + 5 + dy, PW, PH);
        c.drawImage(paper, PXL, PYT + dy);
        bitText(c, 'CITY POLICE DEPARTMENT', LW / 2, 27 + dy, 1, INK, { outline: null });
        bitText(c, 'DUTY LOG — NIGHT SHIFT', LW / 2, 56 + dy, 3, INK, { outline: null });
        bitText(c, 'OCT 28   20:00 - 06:00', LW / 2, 86 + dy, 1, '#5a4a34', { outline: null });
        rect(c, PXL + 14, 96 + dy, PW - 28, 1, INK);
        left(c, 'OFFICER', XN, 106 + dy, 1, INK); left(c, 'UNIT', XU, 106 + dy, 1, INK);
        const stOn = t >= p.status;
        left(c, 'STATUS', XS, 106 + dy, 1, stOn ? '#a81810' : INK);
        if (stOn) rect(c, XS - 2, 114 + dy, Math.round((textWidth('STATUS', 1) + 4) * ease(p.status, p.status + 0.15, t)), 2, '#a81810');
        rect(c, PXL + 14, 118 + dy, PW - 28, 1, INK);
        OFF.forEach(([name, unit], i) => {
          const tr = p.every + i * ROW_GAP; if (t < tr) return;
          const k = fadeIn(t, tr, 0.08), y = ROW0 + i * ROWH + dy, col = mixHex('#d6c69c', INK, k);
          if (i === 5 && t >= p.hl) {   // VICKERS resaltado (rotulador amarillo + caja roja)
            const w = ease(p.hl, p.hl + 0.1, t); c.fillStyle = 'rgba(255,214,40,0.55)'; c.fillRect(XN - 4, y - 9, Math.round((XS - XN - 8) * w), 18);
            if (w >= 1) { c.strokeStyle = '#c41c16'; c.lineWidth = 2; c.strokeRect(XN - 6, y - 11, XS + 76 - XN, 22); }
          }
          left(c, `${i + 1}. ${name}`, XN, y, 2, col); left(c, unit, XU, y, 2, col);
          c.fillStyle = mixHex('#d6c69c', '#8a7a5a', k); for (let x = XS; x < XS + 66; x += 3) c.fillRect(x, y + 7, 2, 1);
          const ts = p.lost + i * STAMP_GAP; if (t < ts) return;
          const u = L.clamp01((t - ts) / 0.06), s = 1.7 - 0.7 * u, rot = [-0.06, 0.05, -0.03, 0.07, -0.05, 0.04][i];
          c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.translate(XS + 34, y + [0, 1, -1, 1, 0, -1][i]); c.rotate(rot); c.scale(s, s);
          c.drawImage(stamp, -33, -12); c.restore();
        });
        if (t >= p.every + 6 * ROW_GAP) { left(c, 'Watch Cmdr.', XN, 274 + dy, 1, '#4a3a26'); Sline(c, XN + 74, 278 + dy, XN + 174, 274 + dy, '#3a2a60'); Sline(c, XN + 74, 279 + dy, XN + 174, 275 + dy, '#3a2a60'); }
        c.imageSmoothingEnabled = prevS;
      },
    };
  }

  // ==================== 69: menu YES / NO + tarjeta final (VICKERS tras el cristal, de sets/hall.js) ====================
  const cityG = await L.loadModel('models/city-zombie.glb');
  const Spx = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const Srgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  function shot69() {
    const p = P.s69, KR = ctx.KEY_RATE;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const BG = 0x0a1222;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 6, 22);
    const cam = new THREE.PerspectiveCamera(42, LW / LH, 0.05, 40);
    scene.add(new THREE.HemisphereLight(0x5a70a8, 0x1a1a24, 0.9));
    const street = new THREE.PointLight(0xc8dcff, 10, 10, 1); street.position.set(1.4, 3.4, -2.6); scene.add(street);
    const rim = new THREE.DirectionalLight(0x9ab8ff, 1.8); rim.position.set(-1.5, 4, -6); rim.target.position.set(0.5, 1.4, 0); scene.add(rim, rim.target);
    const fill = new THREE.DirectionalLight(0x8aa0d0, 0.9); fill.position.set(0.3, 2, 5); fill.target.position.set(0.5, 1.5, -0.5); scene.add(fill, fill.target);
    const tAsph = L.cvs(32, 32, (c) => { const r = L.rng(191); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 14 - 7; Spx(c, x, y, Srgb(22 + n, 26 + n, 36 + n)); } for (let k = 0; k < 6; k++) Spx(c, r() * 30 | 0, r() * 30 | 0, '#4a5a7a', 3, 1); });
    L.plane(14, 12, L.lam(L.rep(tAsph, 8, 7)), 0, 0, -6, scene, 0, -Math.PI / 2);
    const tBld = L.cvs(32, 64, (c) => { Spx(c, 0, 0, '#141a28', 32, 64); for (let y = 4; y < 64; y += 12) for (let x = 3; x < 32; x += 10) Spx(c, x, y, (x * 7 + y) % 5 === 0 ? '#3a4a6a' : '#0a0e18', 6, 7); });
    L.box(14, 9, 0.5, L.lam(L.rep(tBld, 4, 1.3)), 0, 4.5, -9, scene);
    const mPole = L.lam(null, 0x2a3040);
    L.box(0.1, 3.6, 0.1, mPole, 1.9, 1.8, -3.2, scene); L.box(0.6, 0.06, 0.06, mPole, 1.62, 3.6, -3.2, scene);
    L.mesh(new THREE.SphereGeometry(0.12, 6, 4), L.basic(null, 0xe8f0ff), 1.36, 3.5, -3.2, scene);
    const tHalo = L.cvs(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(150,185,255,0.9)'); g.addColorStop(0.5, 'rgba(70,100,170,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    L.plane(4.2, 4.2, L.basic(tHalo, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), 0.95, 2.2, -3.0, scene);
    const mFr = L.lam(null, 0x2a3242), mHd = L.lam(null, 0x9aa4b8);
    for (const x of [-2.44, -1.62, -0.82, 0, 0.82, 1.62, 2.44]) L.box(0.07, 3.2, 0.08, mFr, x, 1.6, 0, scene);
    for (const [y, h] of [[3.15, 0.1], [2.45, 0.07], [0.07, 0.14], [1.0, 0.06]]) L.box(4.95, h, 0.08, mFr, 0, y, 0, scene);
    for (const x of [-0.12, 0.12]) L.box(0.03, 0.55, 0.04, mHd, x, 1.15, 0.07, scene);
    L.plane(4.9, 3.1, L.basic(null, 0x8aa8d0, { transparent: true, opacity: 0.07, depthWrite: false }), 0, 1.6, 0.02, scene);
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
    cityG.scene.traverse((o) => {
      if (!o.isMesh || o.userData.Suv) return; o.userData.Suv = 1; const g = o.geometry, pp = g.attributes.position, uv = new Float32Array(pp.count * 2), n = o.material.name || '';
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i);
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
      const hd = head.getWorldPosition(V());
      const pts = []; for (const m of meshes) { const q = V(), n = m.geometry.attributes.position.count; for (let i = 0; i < n; i++) { m.getVertexPosition(i, q); pts.push(q.clone().applyMatrix4(m.matrixWorld)); } }
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
      const mEye = L.basic(null, 0xb8bcb4);
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
    const CX = 0.95;   // de pie tras la cristalera derecha, a la derecha del panel
    const upd = (lt) => {
      const q = L.q15(lt);
      cam.position.set(0.05, 1.6, 2.3); cam.lookAt(0.05, 1.7, 0); cam.updateProjectionMatrix();
      arm.quaternion.copy(qa); fore.quaternion.copy(qf);
      wrap.position.set(CX, 0, -0.5); wrap.rotation.set(0, -0.15, 0.012 * Math.sin(q * 0.9));
      pose(0.6 + 0.12 * Math.sin(q * 0.7));
      const hp = head.getWorldPosition(V()), tgt = V(hp.x - 0.36, hp.y + 0.02, -0.04);
      aimBone(arm, hR, tgt); aimBone(fore, hR, tgt); wrap.updateMatrixWorld(true);
    };
    const vign = document.createElement('canvas'); vign.width = LW; vign.height = LH;
    { const c = vign.getContext('2d'), v = c.createRadialGradient(LW / 2, 180, 120, LW / 2, 180, 420); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, LW, LH); }
    const R = L.rng(1919), RAIN = Array.from({ length: 90 }, () => [R() * LW, R() * LH, 6 + R() * 10, 200 + R() * 120]);
    const PXa = 84, PYa = 18, PWa = 340, PHa = 168;
    const Q = ['DO', 'YOU', 'OPEN', 'THE', 'DOOR?'];
    return {
      scene, camera: cam,
      update(lt) { upd(lt); },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt, q = L.q15(lt);
        c.drawImage(vign, 0, 0);
        c.fillStyle = 'rgba(120,150,210,0.35)';
        for (const [x, y, len, sp] of RAIN) { const yy = ((y + q * sp) % (LH + 40)) - 20, xx = Math.round(x - (yy / LH) * 12); c.fillRect(xx, Math.round(yy), 1, Math.round(len)); }
        const kp = fadeIn(lt, 0, 0.2);
        c.fillStyle = `rgba(4,8,18,${0.86 * kp})`; c.fillRect(PXa, PYa, PWa, PHa);
        c.fillStyle = '#8a90a8'; c.fillRect(PXa, PYa, PWa, 1); c.fillRect(PXa, PYa, 1, PHa);
        c.fillStyle = '#2a2e3e'; c.fillRect(PXa, PYa + PHa - 1, PWa, 1); c.fillRect(PXa + PWa - 1, PYa, 1, PHa);
        c.strokeStyle = '#3a3e52'; c.strokeRect(PXa + 3.5, PYa + 3.5, PWa - 7, PHa - 7);
        const mid = PXa + PWa / 2, L1 = 'DO YOU OPEN', L2 = 'THE DOOR?';
        const w1 = Q.slice(0, 3).filter((w, i) => t >= p.q[i]).join(' '), w2 = Q.slice(3).filter((w, i) => t >= p.q[3 + i]).join(' ');
        if (w1) left(c, w1, Math.round(mid - textWidth(L1, 3) / 2), 50, 3, '#ececec', { outline: '#000000' });
        if (w2) left(c, w2, Math.round(mid - textWidth(L2, 3) / 2), 90, 3, '#ececec', { outline: '#000000' });
        if (t >= p.q[4]) {
          const k = fadeIn(t, p.q[4], 0.12), xs = [mid - 70, mid + 70], OYb = 146;
          const sel = t >= p.no ? 1 : t >= p.yes ? 0 : -1;
          ['YES', 'NO'].forEach((s, i) => bitText(c, s, xs[i], OYb, 3, mixHex('#000000', i === sel ? '#ffe048' : '#b8b8b8', k), { outline: '#000000' }));
          if (sel >= 0) {
            const ts = sel ? p.no : p.yes, cx = Math.round(xs[sel] - textWidth(sel ? 'NO' : 'YES', 3) / 2 - 22 + (t - ts < 0.08 ? -4 : 0)), on = Math.floor((t - ts) * 4) % 2 === 0;
            c.fillStyle = '#000000'; for (let i = 0; i < 11; i++) c.fillRect(cx + i - 1, OYb - 12 + i, 2, 25 - 2 * i);
            c.fillStyle = on ? '#ffe048' : '#c89a20'; for (let i = 0; i < 10; i++) c.fillRect(cx + i, OYb - 11 + i, 1, 23 - 2 * i);
          }
        }
        // COMMENT + flecha que bota
        if (t >= p.comment) {
          const k = fadeIn(t, p.comment, 0.1), b = Math.round(3 * Math.abs(Math.sin((t - p.comment) * 5))), col = mixHex('#000000', '#ffd23f', k);
          const w = textWidth('COMMENT', 3), x = mid - 14;
          bitText(c, 'COMMENT', x, 212, 3, col, { outline: '#000000' });
          const ax = Math.round(x + w / 2 + 18), ay = 198 + b;
          c.fillStyle = '#000000'; c.fillRect(ax - 3, ay - 1, 7, 15); for (let i = 0; i < 9; i++) c.fillRect(ax - 9 + i, ay + 13 + i, 19 - 2 * i, 2);
          c.fillStyle = col; c.fillRect(ax - 2, ay, 5, 13); for (let i = 0; i < 8; i++) c.fillRect(ax - 8 + i, ay + 13 + i, 17 - 2 * i, 1);
        }
        // maquina de escribir: una tecla por letra (Courier)
        if (t >= p.most) {
          const n = Math.floor((t - p.most) * KR); c.font = 'bold 26px "Courier New", monospace'; c.textBaseline = 'middle'; c.textAlign = 'left';
          const xw = Math.round(mid - c.measureText(TYPE_LINE).width / 2), s = TYPE_LINE.slice(0, n);
          c.fillStyle = '#000000'; c.fillText(s, xw + 2, 258); c.fillStyle = '#e8e4dc'; c.fillText(s, xw, 256);
        }
        if (t >= p.follow) { const s = pop(t, p.follow); bitText(c, 'FOLLOW AVA RESTFIELD!', LW / 2, 312 - 3 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); }
      },
    };
  }

  // ==================== montaje ====================
  const out = {};
  // 05 avance: RIBBON en "dog", HANDGUN 15 en "fifteen", candado ? en la 3a casilla
  { const p = P.s05;
    out['05_hook_items'] = itemShot({ t0: p.t0, gun: p.fifteen, gunCount: after(p.fifteen, '15'), dog: p.dog, dogCount: after(p.dog, 'x1'), lock: p.lock, title: 'BY SUNRISE...',
      rows: [['BULLETS', after(p.fifteen, val('15', p.fifteen))], ['WATER', () => null], ['RIBBON', after(p.dog, val('x1', p.dog, { icon: DOG_ICON }))]] }); }
  out['23_door_armory'] = doorShot('metal', P.s23);
  // 26 pistola en EXAMINE
  { const p = P.s26;
    out['26_item_pistol'] = itemShot({ t0: p.t0, gun: -1e9, gunCount: after(p.fifteen, '15'), sel: [0, p.t0 + 0.2],
      exam: { kind: 'gun', t: p.lift, text: p.one, title: 'HANDGUN  x1', body: "9 mm. 15 rounds. That's it." },
      rows: [['BULLETS', after(p.fifteen, val('15', p.fifteen))], ['WATER', () => null], ['RIBBON', () => null]] }); }
  out['27_db'] = shot27();
  out['32_tanks'] = shot32();
  out['33_door_basement'] = doorShot('wood', P.s33);
  // 35 agua: contador 5 -> 11 -> 51, 51 DAYS, HELP: 7 DAYS con check
  { const p = P.s35;
    const wv = (t) => { let tc = p.t0; for (let tt = p.f51; tt <= t && tt <= p.f51e + 0.01; tt += 1 / 15) if (waterRoll(p, tt) !== waterRoll(p, tt - 1 / 15)) tc = tt; return val(String(waterRoll(p, t)), tc, { unit: 'GAL', col: '#5aa0e8' }); };
    out['35_item_water'] = itemShot({ t0: p.t0, gun: -1e9, gunCount: () => '15', water: -1e9, waterCount: (t) => waterRoll(p, t) + 'G',
      rows: [['BULLETS', () => val('15', -9)], ['WATER', wv], ['RIBBON', () => null], ['   HELP', after(p.seven, val('7', p.seven, { unit: 'DAYS', col: '#ececec' })), p.seven]],
      extra(c, t) {
        const u = (t - p.f51) / Math.max(0.2, p.f51e - p.f51), parts = [['5', -1], [' + 6', 0.15], [' + 40', 0.45]];
        let s = ''; for (const [ps, uu] of parts) if (u >= uu || uu < 0) s += ps;
        left(c, s, 26, 254, 3, '#c8ccd8', { outline: '#000000' });
        if (t >= p.days) { const sp = pop(t, p.days); left(c, '= 51 DAYS', 26 + textWidth('5 + 6 + 40', 3) + 12, 254 - 3 * (sp - 1), 3, '#62f05a', { outline: '#021006' }); }
        if (t >= p.seven) Scheck(c, TP.x + 24, TP.y + 50 + 3 * 36, 8, '#40e040', ease(p.seven + 0.05, p.seven + 0.3, t));
      } }); }
  // 41 RIBBON en EXAMINE (perro 3D si hay dog.js)
  const dog41 = await makeDog();
  { const p = P.s41;
    out['41_item_dog'] = itemShot({ t0: p.t0, gun: -1e9, gunCount: () => '15', water: -1e9, waterCount: () => '51G', dog: p.ribbon, dogCount: after(p.ribbon, 'x1'), dog3: dog41, sel: [1, p.ribbon + 0.1],
      exam: { kind: 'dog', t: p.lift, text: p.lift + 0.1, title: 'RIBBON — K-9 PARTNER', body: 'Better than any alarm.' },
      rows: [['BULLETS', () => val('15', -9)], ['WATER', () => val('51', -9, { unit: 'GAL', col: '#5aa0e8' })], ['RIBBON', after(p.ribbon, val('x1', p.ribbon, { icon: DOG_ICON }))]] }); }
  out['42_hearing'] = shot42();
  out['56_duty_log'] = shot56();
  out['62_door_radio'] = doorShot('radio', P.s62);
  // 66 final: cada valor en su palabra; LIGHTS: OFF -> ON (rojo) en "on"
  { const p = P.s66;
    out['66_item_final'] = itemShot({ t0: p.t0, gun: p.fifteen, gunCount: after(p.fifteen, '15'), water: p.f51, waterCount: after(p.f51, '51G'), dog: p.dog, dogCount: after(p.dog, 'x1'), title: 'NIGHT 1',
      rows: [['BULLETS', after(p.fifteen, val('15', p.fifteen))], ['WATER', after(p.f51, val('51', p.f51, { unit: 'GAL', col: '#5aa0e8' }))], ['RIBBON', after(p.dog, val('x1', p.dog, { icon: DOG_ICON }))],
        ['LIGHTS', (t) => (t >= p.on ? val('ON', p.on, { col: Math.floor((t - p.on) * 4) % 2 ? '#c41c16' : '#ff4030' }) : val('OFF', p.light, { col: '#62f05a' })), p.light]] }); }
  out['69_choice'] = shot69();
  return out;
}

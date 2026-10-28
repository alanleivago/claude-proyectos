// film.js — remake plano a plano de "How to properly barricade a door" (ref fuentes/zombie-ref/ref.mp4) con Ava Bread.
// Plano = { t0, hard, scene, camera, update(lt, t), overlay(lt, dt, a, o), fx }. Tiempos GLOBALES salvo lt (local).
// Los decorados viven en sets/*.js (cada uno exporta shots(ctx) -> {id: shot}); aqui: tiempos, HUD, subtitulos,
// YOU DIED, EXAMINE, destello y tarjeta final. Lista de planos: ../shotlist.md.
import * as L from './lib.js';
import { reText as bitText, reWidth } from './refont.js';
const { THREE, LW, LH } = L;

export const SHOTS = [];
export const HEADER = null;   // el usuario pidio quitar la cabecera
export let CAPS = [];
export let TL = null;

// ---------- subtitulos: palabras de la voz, en mayusculas, palabras funcion pegadas a la siguiente, color por palabra ----------
const GLUE = new Set(['the', 'a', 'but', 'so', 'is', 'are', 'of', 'to', 'and', 'oh']);
const COLOR = {
  zombies: '#ff7b2e', tiny: '#ffd23f', screws: '#ffd23f', 'the stud': '#8cff5a', bones: '#8cff5a', 'the bones': '#8cff5a', 'the hinges': '#8cff5a',
  friction: '#4fd6ff', 'the floor': '#4fd6ff', push: '#ff4030', 'the harder': '#ff9a2e', congratulations: '#ffd23f', properly: '#ffb030',
  windows: '#ff4a2e', 'to break': '#ff6040', fudge: '#ffd23f', 'oh fudge': '#ffd23f',
};
function buildCaps(words) {
  const W = words.map((w) => ({ s: w[1], e: w[2], p: w[3], txt: w[0].replace(/^-/, '') }));
  for (let i = 0; i < W.length - 1; i++) if (W[i].txt === '3' && W[i + 1].txt === 'inch') { W[i].txt = '3-inch'; W[i].e = W[i + 1].e; W.splice(i + 1, 1); }
  const out = [];
  for (let i = 0; i < W.length; i++) {
    const a = W[i], b = W[i + 1];
    let txt = a.txt, e = a.e;
    if (GLUE.has(a.txt) && b && b.p === a.p && b.s - a.e < 0.35 && (a.txt + b.txt).length <= 12) { txt = a.txt + ' ' + b.txt; e = b.e; i++; }
    out.push([a.s, e, txt.toUpperCase(), COLOR[txt] || COLOR[txt.split(' ').pop()] || null]);
  }
  return out;
}

// ---------- HUD: mezcla del ECG del remake con el panel de estado de RE2 (Ref ava bread/re2-health.webp) ----------
// marco gris metalico biselado, placa con el nombre (DOOR, como "LEON"), pantalla verde oscura con lineas horizontales,
// electro del color del estado, estado en la fuente RE (Fine / Caution / Danger) y "CONDITION" debajo.
const HUDC = { FINE: ['#62f05a', 'Fine'], CAUTION: ['#e2c62c', 'Caution'], DANGER: ['#f03a26', 'Danger'] };
export function hud(o, t, state) {
  const c = o.tctx, x = 8, y = 44, w = 118, h = 66;
  // marco
  c.fillStyle = 'rgba(96,100,110,0.94)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,0.10)'; for (let yy = y + 2; yy < y + h - 2; yy += 2) c.fillRect(x + 1, yy, w - 2, 1);   // cepillado
  c.fillStyle = '#b8bcc6'; c.fillRect(x, y, w, 1); c.fillRect(x, y, 1, h);
  c.fillStyle = '#34363e'; c.fillRect(x, y + h - 1, w, 1); c.fillRect(x + w - 1, y, 1, h);
  // placa del nombre
  c.fillStyle = '#141c4a'; c.fillRect(x + 4, y + 3, 40, 12); c.fillStyle = '#5a5e70'; c.fillRect(x + 4, y + 15, 40, 1);
  bitText(c, 'DOOR', x + 24, y + 9, 1, '#c8e0c0', { outline: null });
  // pantalla
  const sx = x + 4, sy = y + 18, sw = w - 8, sh = 34;
  c.fillStyle = '#04140a'; c.fillRect(sx, sy, sw, sh);
  c.fillStyle = '#0f4a1a'; for (let yy = sy + 3; yy < sy + sh - 1; yy += 4) c.fillRect(sx + 1, yy, sw - 2, 1);
  c.fillStyle = '#2fb83c'; c.fillRect(sx, sy, sw, 1); c.fillRect(sx, sy + sh - 1, sw, 1); c.fillRect(sx, sy, 1, sh); c.fillRect(sx + sw - 1, sy, 1, sh);
  const [col, word] = HUDC[state], speed = state === 'DANGER' ? 2.6 : state === 'CAUTION' ? 1.7 : 1.1;
  const base = sy + 15, n = sw - 8, head = Math.floor((t * 46) % n);
  let prev = null;
  for (let i = 0; i < n; i++) {
    const ph = ((i / n) * 2.0 - t * speed) % 1; const u = ph < 0 ? ph + 1 : ph;
    let v = 0;
    if (u > 0.30 && u < 0.33) v = -2; else if (u > 0.40 && u < 0.43) v = 8; else if (u > 0.43 && u < 0.46) v = -10; else if (u > 0.46 && u < 0.49) v = 5; else if (u > 0.6 && u < 0.66) v = -2;
    if (state === 'DANGER' && u > 0.7 && u < 0.74) v = -7;
    const fade = ((i - head + n) % n) / n;                 // el trazo se apaga detras del cabezal (barrido del monitor)
    c.fillStyle = col; c.globalAlpha = 0.35 + 0.65 * (1 - fade);
    const yy = base + v, yp = prev ?? yy, lo = Math.min(yy, yp), hi = Math.max(yy, yp);
    c.fillRect(sx + 4 + i, lo, 1, hi - lo + 2); prev = yy;
  }
  c.globalAlpha = 1; c.fillStyle = '#f4fff0'; c.fillRect(sx + 4 + head, base - 1, 2, 3);
  // estado (fuente RE) abajo a la derecha de la pantalla, sobre su placa oscura
  c.fillStyle = '#071c0c'; c.fillRect(sx + sw - 50, sy + sh - 15, 48, 13);
  bitText(c, word, sx + sw - 26, sy + sh - 8, 1, col, { outline: '#020a04' });
  // CONDITION
  bitText(c, 'CONDITION', x + 34, y + h - 7, 1, '#b4bac4', { outline: null });
}
/** estado del HUD segun el tiempo global (ref: FINE 3.7, DANGER 6.2, CAUTION 26.8, FINE 37.0) */
export function hudState(t) { return t < 6.77 ? 'FINE' : t < 26.8 ? 'DANGER' : t < 37.0 ? 'CAUTION' : 'FINE'; }

// ---------- YOU DIED (Resident Evil clasico: letras rojas con chorreones de sangre, la imagen anterior se tine de rojo) ----------
const youCv = document.createElement('canvas'); youCv.width = LW; youCv.height = 120; const youCtx = youCv.getContext('2d', { willReadFrequently: true });
let youMask = null;
function youDiedMask() {
  if (youMask) return youMask;
  const c = youCtx; c.clearRect(0, 0, LW, 120);
  c.font = 'bold 50px "Times New Roman", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
  c.save(); c.translate(LW / 2, 60); c.scale(1, 1.15); c.fillText('YOU DIED', 0, 0); c.restore();
  const d = c.getImageData(0, 0, LW, 120).data; youMask = new Uint8Array(LW * 120);
  for (let i = 0; i < LW * 120; i++) youMask[i] = d[i * 4 + 3] > 120 ? 1 : 0;
  return youMask;
}
export function youDied(o, lt, { again = false, y0 = 270 } = {}) {
  const c = o.tctx, m = youDiedMask(), R = L.rng(77);
  const a = L.smooth(lt / 0.5);
  // letras: rojo sangre con borde oscuro y brillo arriba
  const img = c.getImageData(0, y0 - 60, LW, 120);
  const H = 120;
  for (let yy = 1; yy < H - 1; yy++) for (let xx = 1; xx < LW - 1; xx++) {
    const i = yy * LW + xx; if (!m[i]) { if (m[i - 1] || m[i + 1] || m[i - LW] || m[i + LW]) { const k = i * 4; img.data[k] = 30 * a; img.data[k + 1] = 0; img.data[k + 2] = 0; img.data[k + 3] = 255 * a; } continue; }
    const k = i * 4, top = !m[i - LW] || !m[i - 2 * LW];
    img.data[k] = (top ? 238 : 178 + 30 * ((xx + yy) % 3 === 0)) * a; img.data[k + 1] = (top ? 40 : 8) * a; img.data[k + 2] = (top ? 30 : 6) * a; img.data[k + 3] = 255 * a;
  }
  c.putImageData(img, 0, y0 - 60);
  // chorreones: bajan desde el borde inferior de las letras, crecen con el tiempo
  for (let k = 0; k < 26; k++) {
    const xx = 30 + Math.floor(R() * (LW - 60)); let yb = -1;
    for (let yy = H - 2; yy > 0; yy--) if (m[yy * LW + xx]) { yb = yy; break; }
    if (yb < 0) continue;
    const len = (6 + R() * 34) * L.smooth((lt - 0.2 - R() * 0.6) / 1.6), w = R() < 0.3 ? 2 : 1;
    c.fillStyle = `rgba(150,4,4,${a})`; c.fillRect(xx, y0 - 60 + yb, w, len);
    if (len > 4) { c.fillStyle = `rgba(190,10,10,${a})`; c.fillRect(xx - 1 + (w === 1 ? 0 : 0), y0 - 60 + yb + len - 1, w + 1, 2); }
  }
  if (again && lt > 0.5) bitText(o.tctx, '...AGAIN.', LW / 2, y0 + 44, 1, '#d8d8d8', { outline: null });
  if (lt > 0.9) bitText(o.tctx, 'CONTINUE?   >YES   NO', LW / 2, y0 + (again ? 84 : 70), 1, '#d0d0d0', { outline: null });
}

// ---------- EXAMINE (inventario RE): caja abajo, texto que se escribe ----------
export function examine(o, lt, title, body) {
  const c = o.tctx, x = 20, y = 440, w = 320, h = 62;   // ref: la caja esta a ~y 440
  const lft = (s, xx, yy, col) => bitText(o.tctx, s, xx + reWidth(s, 1) / 2, yy, 1, col, { outline: null });   // texto alineado a la izquierda
  lft('EXAMINE', x, y - 8, '#9aa0b0');
  c.fillStyle = 'rgba(6,8,16,0.9)'; c.fillRect(x, y, w, h);
  c.strokeStyle = '#8a90a8'; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); c.strokeStyle = '#3a3e52'; c.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  c.fillStyle = '#8a90a8'; c.fillRect(x + 4, y + 18, w - 8, 1);
  const n1 = Math.floor(lt * 24), n2 = Math.floor((lt - title.length / 24) * 30);
  c.font = '10px Pixelify'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const tl = title.slice(0, n1); if (tl) lft(tl, x + 8, y + 10, '#e8e8f0');
  if (n2 > 0) { const lines = body.split('\n'); let left = n2; lines.forEach((ln, k) => { const s = ln.slice(0, Math.max(0, left)); left -= ln.length; if (s) lft(s, x + 8, y + 31 + k * 13, '#c8c8d0'); }); }
}

// ---------- plano de relleno (mientras un decorado no existe) ----------
function placeholder(id, t0, color, note) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(color);
  const camera = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 100); camera.position.set(0, 1.4, 4); camera.lookAt(0, 1.2, 0);
  return { id, t0, scene, camera, update() {}, overlay(lt, dt, a, o) { o.pixelText(`#${id}`, LW / 2, 160, 16, '#ffffff', 2, 1); if (note) o.pixelText(note, LW / 2, 190, 9, '#dddddd', 1, 0, { bold: 0 }); } };
}
function blackShot(id, t0, draw) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 100);
  return { id, t0, hard: true, scene, camera, update() {}, overlay: draw };
}

// ---------- 23: tarjeta final: ventana tapiada girando (examinar objeto) + NEXT: / WINDOWS. / AVA BREAD ----------
function endCard(id, t0) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(30, LW / LH, 0.1, 50); camera.position.set(0, 0, 6.2); camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.75)); const dl = new THREE.DirectionalLight(0xfff2dc, 1.6); dl.position.set(2, 3, 4); scene.add(dl);
  const win = new THREE.Group(); scene.add(win); win.position.set(0, 0.2, 0); win.scale.setScalar(0.62);   // pegada al texto de abajo
  // texturas PS1 pintadas en codigo (64 px, nearest): marco con pintura blanca desconchada, cristal sucio y agrietado,
  // tablas con veta, nudos y extremos oscuros, clavos oxidados
  const R = L.rng(5150);
  const frameT = L.cvs(64, 64, (c) => {
    c.fillStyle = '#6a4a2c'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 3) { c.fillStyle = R() < 0.5 ? '#5a3c22' : '#7a5634'; c.fillRect(0, y, 64, 1); }
    c.fillStyle = '#cfc8b4'; for (let k = 0; k < 70; k++) { const x = R() * 64 | 0, y = R() * 64 | 0, w = 2 + R() * 9 | 0, h = 1 + R() * 3 | 0; c.fillRect(x, y, w, h); }
    c.fillStyle = '#a8a08a'; for (let k = 0; k < 40; k++) c.fillRect(R() * 64 | 0, R() * 64 | 0, 1 + R() * 4 | 0, 1);
    c.fillStyle = '#3a2614'; for (let k = 0; k < 18; k++) c.fillRect(R() * 64 | 0, R() * 64 | 0, 1, 2 + R() * 4 | 0);
  });
  const glassT = L.cvs(64, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 64, 64); g.addColorStop(0, '#24384e'); g.addColorStop(1, '#0e1826'); c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#5e7e9c'; for (let i = 0; i < 18; i++) c.fillRect(8 + i, 6 + i, 3, 1); c.fillStyle = '#3e5a78'; for (let i = 0; i < 10; i++) c.fillRect(14 + i, 6 + i, 2, 1);
    c.fillStyle = 'rgba(120,100,70,0.55)'; for (let k = 0; k < 90; k++) c.fillRect(R() * 64 | 0, 40 + R() * 24 | 0, 1 + R() * 3 | 0, 1);   // mugre abajo
    c.strokeStyle = '#a8c0d8'; c.lineWidth = 1; c.beginPath(); c.moveTo(44, 20); c.lineTo(52, 30); c.lineTo(50, 44); c.moveTo(52, 30); c.lineTo(62, 33); c.moveTo(44, 20); c.lineTo(36, 26); c.stroke();
  });
  const plankT = (seed, tone) => L.cvs(64, 16, (c) => {
    const r = L.rng(seed); c.fillStyle = tone; c.fillRect(0, 0, 64, 16);
    for (let y = 1; y < 15; y += 2) { c.fillStyle = r() < 0.5 ? 'rgba(70,40,18,0.45)' : 'rgba(210,160,100,0.25)'; c.fillRect(r() * 10 | 0, y, 40 + r() * 24 | 0, 1); }
    c.fillStyle = '#4a2c14'; c.fillRect(0, 0, 64, 1); c.fillRect(0, 15, 64, 1); c.fillRect(0, 0, 2, 16); c.fillRect(62, 0, 2, 16);
    const kx = 18 + r() * 28 | 0; c.fillStyle = '#3e2410'; c.fillRect(kx, 6, 4, 3); c.fillStyle = '#6a4220'; c.fillRect(kx - 2, 5, 8, 1); c.fillRect(kx - 2, 9, 8, 1);
    c.fillStyle = '#2a1a0c'; c.fillRect(4, 7, 1, 1); c.fillRect(59, 8, 1, 1);
  });
  const mf = L.lam(frameT), mg = L.lam(glassT, 0xffffff, { side: THREE.DoubleSide }), mn = L.lam(L.cvs(4, 4, (c) => { c.fillStyle = '#5a4a40'; c.fillRect(0, 0, 4, 4); c.fillStyle = '#9a8a7a'; c.fillRect(1, 1, 1, 1); }));
  const W = 1.5, H = 1.9, T = 0.12, D = 0.16;
  L.box(W, T, D, mf, 0, H / 2, 0, win); L.box(W, T, D, mf, 0, -H / 2, 0, win); L.box(T, H, D, mf, -W / 2, 0, 0, win); L.box(T, H, D, mf, W / 2, 0, 0, win);
  L.box(0.06, H, 0.08, mf, 0, 0, 0, win); L.box(W, 0.06, 0.08, mf, 0, 0.1, 0, win);   // parteluz en cruz
  L.box(W - 0.1, H - 0.1, 0.02, mg, 0, 0, -0.02, win);
  L.box(W + 0.2, 0.09, D + 0.1, mf, 0, -H / 2 - 0.08, 0.04, win);                     // alfeizar
  [[0.55, 0.22, 0.04, '#9a6c40'], [-0.05, -0.18, -0.06, '#86603a'], [-0.62, 0.1, 0.05, '#a47648']].forEach(([y, r, dx, tone], i) => {   // tablas clavadas, algo torcidas
    const p = L.box(W + 0.35, 0.22, 0.06, L.lam(plankT(91 + i * 7, tone)), dx, y, D / 2 + 0.04 + i * 0.004, win); p.rotation.z = r;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const n = L.box(0.045, 0.045, 0.03, mn, 0, 0, 0.04, p); n.position.set(sx * (W / 2 + 0.05), sy * 0.05, 0.04); }
  });
  return { id, t0, hard: true, scene, camera,
    update(lt) { const q = L.q15(lt); win.rotation.y = -0.65 + q * 0.5; win.rotation.x = 0.14 + 0.05 * Math.sin(q * 1.3); },
    overlay(lt, dt, a, o) {   // ref: texto a maquina, mas abajo para dejar sitio a la ventana
      const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
      const n = Math.floor(lt * 14); c.font = '15px "Courier New", monospace'; c.fillStyle = '#e8e4dc'; c.fillText('NEXT:'.slice(0, n), LW / 2, 432);   // maquina de escribir (gusto del usuario)
      if (lt > 0.6) { c.font = 'bold 32px "Courier New", monospace'; c.fillStyle = '#d8281c'; c.fillText('WINDOWS.'.slice(0, Math.floor((lt - 0.6) * 12)), LW / 2, 466); }
      if (lt > 1.5) bitText(c, 'AVA BREAD', LW / 2, 528, 2, '#ececec', { outline: null });
    } };
}

// destello 03 sin corte: sube sobre el plano de la cerradura, se sostiene y se abre sobre el diagrama (ref: ovalo blanco con bordes grises)
function flash(o, t) {
  const k = t < 3.4 ? 0 : t < 3.75 ? L.smooth((t - 3.4) / 0.35) : t < 3.95 ? 1 : t < 4.45 ? 1 - L.smooth((t - 3.95) / 0.5) : 0;
  if (k <= 0) return;
  const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.5, LW * 0.2, LW / 2, LH * 0.5, LH * 0.62);
  g.addColorStop(0, `rgba(252,250,246,${0.95 * k})`); g.addColorStop(0.6, `rgba(236,234,230,${0.92 * k})`); g.addColorStop(1, `rgba(150,148,146,${0.85 * k})`);
  c.fillStyle = g; c.fillRect(0, 0, LW, LH);
}

// tiempos de corte (s, globales) = los de la referencia (la voz se coloco en los mismos tiempos)
export const CUTS = [
  ['01_hero', 0.0], ['02_lock', 2.0], ['03_flash', 3.7], ['04_diag_screws', 4.0], ['05_door_wide', 8.7], ['06_breach', 10.2],
  ['07_died', 11.0], ['08_couch', 12.7], ['09_slide', 15.2], ['10_friction', 16.5], ['11_died2', 19.6], ['12_examine', 21.0],
  ['13_lock_screw', 23.8], ['14_hinges', 25.0], ['15_diag_stud', 26.0], ['16_house', 29.1], ['17_wedge', 32.0], ['18_diag_bar', 34.6],
  ['19_congrats', 38.0], ['20_proud', 39.6], ['21_windows', 42.2], ['22_next', 44.8], ['23_end', 46.4],
];
export const END = 49.0;
// huecos quitados (pedido del usuario), en multiplos de corchea a 111 BPM para no romper la musica; mix.py quita los mismos
export const CUTS_T = [[5.95, 5.95 + 3 * 30 / 111], [18.98, 18.98 + 2 * 30 / 111]];   // tras "two tiny screws" y tras "feelings"
export const warp = (t) => { for (const [a, b] of CUTS_T) if (t >= a) t += b - a; return t; };
const CUT_LEN = CUTS_T.reduce((s, [a, b]) => s + b - a, 0);

export async function loadAll() {
  await L.loadHero();
  TL = await (await fetch('timeline.json')).json();
  CAPS = buildCaps(TL.words);
  const ctx = { L, TL, hud, hudState, youDied, examine, CUTS };
  const built = {};
  const QS = L.QS;
  for (const mod of (QS.get('sets') ?? 'hall,diagrams,rooms,closeups').split(',').filter(Boolean)) {
    try { const m = await import(`./sets/${mod}.js`); Object.assign(built, await m.shots(ctx)); }
    catch (e) { if (!String(e).includes('Failed to fetch')) throw e; }
  }
  // 03: destello blanco sobre el plano de la cerradura (ref 3.7-4.0: imagen quemada casi blanca)
  if (built['02_lock'] && !built['03_flash']) {
    const b = built['02_lock'], d = 3.7 - 2.0;
    built['03_flash'] = { scene: b.scene, camera: b.camera, update: (lt, t) => b.update(d + lt, t),
      overlay: null };
  }
  // YOU DIED: la ultima imagen del plano anterior se congela, se tine de rojo y se funde a negro (RE1/RE2)
  const died = (prev, freeze, again, keep) => ({ scene: prev.scene, camera: prev.camera, update: (lt, t) => prev.update(freeze, t),
    overlay(lt, dt, a, o) {
      const c = o.tctx, k = L.smooth(lt / 0.45);
      c.fillStyle = `rgba(120,0,0,${0.55 * (1 - k)})`; c.fillRect(0, 0, LW, LH);
      c.fillStyle = `rgba(0,0,0,${Math.min(keep, 0.35 + k)})`; c.fillRect(0, 0, LW, LH);
      youDied(o, lt - 0.15, { again });
    } });
  if (built['06_breach'] && !built['07_died']) built['07_died'] = died(built['06_breach'], 0.78, false, 0.86);   // ref: el fondo se sigue viendo
  if (built['10_friction'] && !built['11_died2']) built['11_died2'] = died(built['10_friction'], 3.0, true, 0.86);
  const t0s = Object.fromEntries(CUTS);
  for (const [id, t0] of CUTS) {
    let s = built[id];
    if (!s) {
      if (id === '23_end') s = endCard(id, t0);
      else if (id === '07_died') s = blackShot(id, t0, (lt, dt, a, o) => youDied(o, lt));
      else if (id === '11_died2') s = blackShot(id, t0, (lt, dt, a, o) => youDied(o, lt, { again: true }));
      else s = placeholder(id, t0, 0x202028, 'sin decorado');
    }
    s.id = id; s.t0 = t0; if (s.hard === undefined) s.hard = true;
    SHOTS.push(s);
  }
  // HUD sobre todos los planos desde el destello (3.7 s) salvo los negros
  const NOHUD = new Set(['01_hero', '02_lock', '07_died', '11_died2', '12_examine', '23_end']);
  for (const s of SHOTS) {
    const own = s.overlay;
    s.overlay = (lt, dt, a, o) => { if (own) own(lt, dt, a, o); flash(o, s.t0 + lt); if (!NOHUD.has(s.id) && s.t0 >= 3.7) hud(o, s.t0 + lt, hudState(s.t0 + lt)); };
  }
  window.FILM = { dur: END - CUT_LEN, frames: Math.round((END - CUT_LEN) * 30) };
}

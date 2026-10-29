// film.js — ep2 de Ava Bread: remake de "How to properly barricade a window" (ref fuentes/zombie-ref2/ref.mp4), guion mejorado.
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
  fudge: '#ffd23f', 'oh fudge': '#ffd23f', window: '#ff7b2e', 'the movies': '#ff7b2e', 'the gaps': '#ff4030', twice: '#ff4030',
  plywood: '#ffb030', 'no gaps': '#8cff5a', inches: '#ffd23f', 'the wall': '#8cff5a', studs: '#8cff5a', 'the trim': '#ff4030', twelve: '#ffd23f',
  inside: '#ff4030', outside: '#8cff5a', nope: '#ff4030', brace: '#4fd6ff', 'the floor': '#4fd6ff', 'the door': '#ffffff', water: '#4fd6ff',
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
export const HUD_T0 = 2.3;   // ep2 v2: aparece de golpe con el corte al plano 02 (el usuario no quiso la animacion de entrada)
export function hud(o, t, state) {
  if (t < HUD_T0) return;
  const c = o.tctx, x = 8, y = 44, w = 118, h = 66;
  // marco
  c.fillStyle = 'rgba(96,100,110,0.94)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,0.10)'; for (let yy = y + 2; yy < y + h - 2; yy += 2) c.fillRect(x + 1, yy, w - 2, 1);   // cepillado
  c.fillStyle = '#b8bcc6'; c.fillRect(x, y, w, 1); c.fillRect(x, y, 1, h);
  c.fillStyle = '#34363e'; c.fillRect(x, y + h - 1, w, 1); c.fillRect(x + w - 1, y, 1, h);
  // placa del nombre
  c.fillStyle = '#141c4a'; c.fillRect(x + 4, y + 3, 40, 12); c.fillStyle = '#5a5e70'; c.fillRect(x + 4, y + 15, 40, 1);
  bitText(c, 'WINDOW', x + 24, y + 9, 1, '#c8e0c0', { outline: null });
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
/** estado del HUD segun el tiempo global (ref2: CAUTION 5.4, DANGER 7.1, CAUTION 28.2, FINE en 'the door') */
export function hudState(t) { return t < 5.4 ? 'FINE' : t < 7.4 ? 'CAUTION' : t < 28.2 ? 'DANGER' : t < 44.2 ? 'CAUTION' : 'FINE'; }

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

// ---------- 20: tarjeta final: bidon de agua girando (examinar objeto) + NEXT: / WATER. / AVA BREAD ----------
function endCard(id, t0) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(30, LW / LH, 0.1, 50); camera.position.set(0, 0, 6.2); camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8)); const dl = new THREE.DirectionalLight(0xfff2dc, 1.7); dl.position.set(2, 3, 4); scene.add(dl);
  const jug = new THREE.Group(); scene.add(jug); jug.position.set(0, 0.25, 0); jug.scale.setScalar(0.62);
  // bidon de plastico azul de 20 L (texturas PS1 de 64 px pintadas en codigo): costillas, rozaduras, etiqueta WATER, tapon blanco
  const R = L.rng(2020);
  const bodyT = L.cvs(64, 64, (c) => {
    c.fillStyle = '#2a64b8'; c.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 8) { c.fillStyle = '#3a7ad0'; c.fillRect(x, 0, 2, 64); c.fillStyle = '#1e4c90'; c.fillRect(x + 6, 0, 1, 64); }   // costillas
    c.fillStyle = 'rgba(200,220,255,0.35)'; for (let k = 0; k < 40; k++) c.fillRect(R() * 64 | 0, R() * 64 | 0, 1 + R() * 5 | 0, 1);      // rozaduras
    c.fillStyle = 'rgba(20,30,50,0.4)'; for (let k = 0; k < 25; k++) c.fillRect(R() * 64 | 0, 44 + R() * 20 | 0, 1 + R() * 3 | 0, 1);  // mugre abajo
    c.fillStyle = '#e8e4d8'; c.fillRect(8, 22, 48, 18); c.fillStyle = '#1a3a7a'; c.fillRect(8, 22, 48, 2); c.fillRect(8, 38, 48, 2);       // etiqueta
    c.fillStyle = '#1a3a7a'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WATER', 32, 31);
    c.fillStyle = '#4aa0e8'; for (let i = 0; i < 4; i++) c.fillRect(12 + i * 2, 33 - i, 1, 1);
  });
  const sideT = L.cvs(32, 64, (c) => { c.fillStyle = '#245aa8'; c.fillRect(0, 0, 32, 64); c.fillStyle = '#3a7ad0'; for (let y = 4; y < 64; y += 10) c.fillRect(0, y, 32, 2); c.fillStyle = 'rgba(200,220,255,0.3)'; for (let k = 0; k < 20; k++) c.fillRect(R() * 32 | 0, R() * 64 | 0, 1 + R() * 4 | 0, 1); });
  const capT = L.cvs(16, 16, (c) => { c.fillStyle = '#e8e8e0'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#a8a8a0'; for (let x = 0; x < 16; x += 3) c.fillRect(x, 0, 1, 16); });
  const mb = L.lam(bodyT), ms = L.lam(sideT), mc = L.lam(capT), mh = L.lam(null, 0x1e4c90);
  const body = L.box(1.3, 1.6, 0.75, [ms, ms, ms, ms, mb, mb], 0, 0, 0, jug);
  L.box(1.1, 0.12, 0.6, ms, 0, 0.86, 0, jug);                                   // hombro
  L.box(0.18, 0.22, 0.18, mc, 0.38, 1.02, 0, jug);                              // tapon
  L.box(0.62, 0.1, 0.16, mh, -0.18, 1.18, 0, jug); L.box(0.1, 0.3, 0.16, mh, -0.45, 1.0, 0, jug); L.box(0.1, 0.3, 0.16, mh, 0.09, 1.0, 0, jug);   // asa
  const drop = L.box(0.08, 0.12, 0.08, L.basic(null, 0x6ab8ff), 0.38, 0.9, 0, jug);   // gota que cae del tapon
  return { id, t0, hard: true, scene, camera,
    update(lt) { const q = L.q15(lt); jug.rotation.y = -0.6 + q * 0.5; jug.rotation.x = 0.12 + 0.05 * Math.sin(q * 1.3); const k = (q * 0.8) % 1; drop.position.set(0.38, 0.9 - 2.2 * k * k, 0.0); drop.visible = k < 0.9; },
    overlay(lt, dt, a, o) {   // texto a maquina (gusto del usuario): una letra por tecla, AVA BREAD con el sonido por defecto
      const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
      const n = Math.floor(lt * 14); c.font = '15px "Courier New", monospace'; c.fillStyle = '#e8e4dc'; c.fillText('NEXT:'.slice(0, n), LW / 2, 432);
      if (lt > 0.6) { c.font = 'bold 32px "Courier New", monospace'; c.fillStyle = '#3aa0f0'; c.fillText('WATER.'.slice(0, Math.floor((lt - 0.6) * 12)), LW / 2, 466); }
      if (lt > 1.5) bitText(c, 'FOLLOW AVA RESTFIELD!', LW / 2, 528, 2, '#ececec', { outline: null });   // ep2: el personaje pasa a llamarse Ava Restfield
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
  ['01_hero', 0.0], ['02_nail', 2.3], ['03_fail', 5.4], ['04_hand', 7.4], ['05_diag_nail', 9.3], ['06_friction', 11.5],
  ['07_died', 14.55], ['08_examine', 17.2], ['09_diag_frame', 19.8], ['10_drill', 25.55], ['11_diag_side', 28.15],
  ['12_look', 35.6], ['13_horde', 37.1], ['14_nope', 39.2], ['15_brace', 40.9], ['16_congrats', 44.6], ['17_pipe', 48.55],
  ['18_fudge', 49.3], ['19_spray', 50.7], ['20_end', 52.6],
];
export const END = 55.1;
// huecos quitados (pedido del usuario en ep1: nada de esperas), en corcheas a 111 BPM; mix.py quita los mismos
export const CUTS_T = [[16.0, 16.0 + 3 * 30 / 111]];   // YOU DIED mas corto (el usuario no quiere esperas)
export const warp = (t) => { for (const [a, b] of CUTS_T) if (t >= a) t += b - a; return t; };
const CUT_LEN = CUTS_T.reduce((s, [a, b]) => s + b - a, 0);

// ep2 (usuario: 'se ven un poco oscuros'): gamma < 1 en el post sobre los planos 3D
const LIFT = Number(L.QS.get('gamma') ?? 0.8);
const DARK = new Set(['05_diag_nail', '07_died', '08_examine', '09_diag_frame', '11_diag_side', '20_end']);
export async function loadAll() {
  await L.loadHero();
  TL = await (await fetch('timeline.json')).json();
  CAPS = buildCaps(TL.words);
  const ctx = { L, TL, hud, hudState, youDied, examine, CUTS };
  const built = {};
  const QS = L.QS;
  for (const mod of (QS.get('sets') ?? 'room,closeups,diagrams,outside').split(',').filter(Boolean)) {
    try { const m = await import(`./sets/${mod}.js`); Object.assign(built, await m.shots(ctx)); }
    catch (e) { if (!String(e).includes('Failed to fetch')) throw e; }
  }
  // 03: destello blanco sobre el plano de la cerradura (ref 3.7-4.0: imagen quemada casi blanca)
  // YOU DIED: la ultima imagen del plano anterior se congela, se tine de rojo y se funde a negro (RE1/RE2)
  const died = (prev, freeze, again, keep) => ({ scene: prev.scene, camera: prev.camera, update: (lt, t) => prev.update(freeze, t),
    overlay(lt, dt, a, o) {
      const c = o.tctx, k = L.smooth(lt / 0.45);
      c.fillStyle = `rgba(120,0,0,${0.55 * (1 - k)})`; c.fillRect(0, 0, LW, LH);
      c.fillStyle = `rgba(0,0,0,${Math.min(keep, 0.35 + k)})`; c.fillRect(0, 0, LW, LH);
      youDied(o, lt - 0.15, { again });
    } });
  if (built['06_friction'] && !built['07_died']) built['07_died'] = died(built['06_friction'], 3.0, true, 0.86);   // '...AGAIN.' (el ep1 ya murio una vez)
  const t0s = Object.fromEntries(CUTS);
  for (const [id, t0] of CUTS) {
    let s = built[id];
    if (!s) {
      if (id === '20_end') s = endCard(id, t0);
      else if (id === '07_died') s = blackShot(id, t0, (lt, dt, a, o) => youDied(o, lt, { again: true }));
      else s = placeholder(id, t0, 0x202028, 'sin decorado');
    }
    s.id = id; s.t0 = t0; if (s.hard === undefined) s.hard = true;
    if (s.gamma === undefined) s.gamma = DARK.has(id) ? 1 : LIFT;   // ep2: planos 3D mas claros; diagramas y negros igual
    SHOTS.push(s);
  }
  // HUD sobre todos los planos desde el destello (3.7 s) salvo los negros
  const NOHUD = new Set(['07_died', '08_examine', '20_end']);
  for (const s of SHOTS) {
    const own = s.overlay;
    s.overlay = (lt, dt, a, o) => { if (own) own(lt, dt, a, o); if (!NOHUD.has(s.id)) hud(o, s.t0 + lt, hudState(s.t0 + lt)); };
  }
  window.FILM = { dur: END - CUT_LEN, frames: Math.round((END - CUT_LEN) * 30) };
}

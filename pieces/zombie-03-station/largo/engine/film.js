// film.js — LARGO 16:9 de Ava Restfield: "Zombie Outbreak: 1 Night Locked Inside a Police Station" (guion ../guion.md, 12
// capitulos, noche 1 hora a hora). Copia del motor del corto aprobado (pieces/zombie-03-station/engine) pasado a 640x360 x3.
// Plano = { t0, hard, scene, camera, update(lt, t), overlay(lt, dt, a, o), fx }. Tiempos GLOBALES salvo lt (local).
// NUEVO en el largo: los cortes se anclan a PALABRAS de la voz (toma + indice de palabra) en vez de segundos fijos, asi la
// voz se puede regenerar sin rehacer los decorados. ctx.at('g3', 'tempered') -> inicio de esa palabra (s globales).
// Lista de planos: ../shotlist.md. Decorados: sets/*.js (contrato SETS.md).
import * as L from './lib.js';
import { reText as bitText, reWidth } from './refont.js';
const { THREE, LW, LH } = L;

export const SHOTS = [];
export const HEADER = null;   // el usuario pidio quitar la cabecera
export let CAPS = [];
export let TL = null;

// ---------- anclas en la voz ----------
// TL.takes = ids de toma en orden; TL.words = [texto, inicio, fin, nToma(1..), palabraOriginal]
let WBY = null;
function index() { WBY = {}; for (const w of TL.words) { const id = TL.takes[w[3] - 1]; (WBY[id] = WBY[id] || []).push(w); } }
const normW = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
/** inicio (s) de la palabra k de la toma (k numero: 0.., negativos desde el final; k texto: primera palabra que empieza asi) */
export function at(take, k = 0, which = 1) {
  const ws = WBY[take]; if (!ws) throw new Error('toma ' + take);
  let w;
  if (typeof k === 'number') w = ws[k < 0 ? ws.length + k : k];
  else w = ws.find((x) => normW(x[4]).startsWith(normW(k)) || normW(x[0]).startsWith(normW(k)));
  if (!w) throw new Error(`palabra ${k} en ${take}`);
  return which === 1 ? w[1] : w[2];
}
export const endOf = (take, k = -1) => at(take, k, 2);
export const words = (take) => WBY[take];

// ---------- subtitulos: palabras de la voz, en mayusculas, palabras funcion pegadas a la siguiente, color por palabra ----------
const GLUE = new Set(['the', 'a', 'but', 'so', 'is', 'are', 'of', 'to', 'and', 'oh']);
const Y = '#ffd23f', R = '#ff4030', G = '#8cff5a', B = '#4fd6ff', O = '#ff7b2e';
const COLOR = {
  zombies: O, nine: Y, police: B, station: B, 'the safest': G, "isn't": R, dog: G, fifteen: Y, bullets: Y,
  seven: Y, lights: Y, gate: Y, 'no one': R, cough: R, glass: R, tempered: R, never: R, lobby: R, 'the lobby': R, benches: Y, three: Y,
  good: G, armory: G, 'the armory': G, bad: R, pistol: O, decibels: R, sixty: Y, bell: R, last: R, water: B, gallon: B, fema: B, five: Y, six: Y,
  forty: Y, heater: B, 'fifty-one': G, smile: G, ribbon: G, 'k-9': B, four: Y, growls: R, listen: G, generator: O, monoxide: R, sleepy: R,
  off: Y, save: G, typewriter: G, fourteen: Y, knocks: O, badge: Y, password: R, lost: R, vickers: R, eight: Y, twenty: R, light: Y, itself: R,
  fudge: Y, 'oh fudge': Y, tape: O, you: null, yes: G, no: R, two: Y, department: B,
};
function buildCaps(words) {
  const W = words.map((w) => ({ s: w[1], e: w[2], p: w[3], txt: w[0].replace(/^-/, '') }));
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
export let HUD_T0 = 0;   // largo: aparece de golpe con el corte al 2o plano (02_gate)
export function hud(o, t, state) {
  if (t < HUD_T0) return;
  const c = o.tctx, x = 8, y = 8, w = 118, h = 66;   // largo 16:9: arriba a la izquierda (118 px de 640 = mas pequeno relativo)
  // marco
  c.fillStyle = 'rgba(96,100,110,0.94)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,0.10)'; for (let yy = y + 2; yy < y + h - 2; yy += 2) c.fillRect(x + 1, yy, w - 2, 1);   // cepillado
  c.fillStyle = '#b8bcc6'; c.fillRect(x, y, w, 1); c.fillRect(x, y, 1, h);
  c.fillStyle = '#34363e'; c.fillRect(x, y + h - 1, w, 1); c.fillRect(x + w - 1, y, 1, h);
  // placa del nombre
  c.fillStyle = '#141c4a'; c.fillRect(x + 4, y + 3, 40, 12); c.fillStyle = '#5a5e70'; c.fillRect(x + 4, y + 15, 40, 1);
  bitText(c, 'STATION', x + 24, y + 9, 1, '#c8e0c0', { outline: null });
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
/** estado del HUD: CAUTION en "it isn't", FINE con las provisiones, CAUTION con el golpe en el cristal, DANGER en "Vickers" */

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
export function youDied(o, lt, { again = false, y0 = 150 } = {}) {
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
  const c = o.tctx, x = 120, y = 232, w = 400, h = 62;   // largo 16:9: caja encima del subtitulo
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

// ---------- estado del HUD por tramos (anclado a palabras) ----------
let HUDSPANS = [];
export function hudState(t) { let s = 'FINE'; for (const [t0, st] of HUDSPANS) if (t >= t0) s = st; return s; }

// ---------- tarjeta de capitulo: hora a maquina (una tecla por letra) sobre negro, como la hoja de guardado de RE ----------
export const KEY_RATE = 14, SUB_RATE = 24;   // teclas/s de la hora y de la linea DAY 1 — POLICE STATION
function chapterCard(id, t0, hour, chapterNo) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 100);
  const sub = 'DAY 1  —  POLICE STATION';
  return { id, t0, hard: true, scene, camera, card: { hour, sub }, update() {},
    overlay(lt, dt, a, o) {
      const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba(232,226,214,0.06)'; for (let y = 110; y < 250; y += 2) c.fillRect(140, y, 360, 1);   // papel apenas
      const n = Math.floor(lt * KEY_RATE);
      c.font = 'bold 64px "Courier New", monospace'; c.fillStyle = '#ece6da'; c.fillText(hour.slice(0, n), LW / 2, 162);
      const n2 = Math.floor((lt - hour.length / KEY_RATE - 0.1) * SUB_RATE);
      if (n2 > 0) { c.font = 'bold 18px "Courier New", monospace'; c.fillStyle = '#a8a49c'; c.fillText(sub.slice(0, n2), LW / 2, 214); }
      if (Math.floor(lt * 2.5) % 2 === 0) { c.font = 'bold 64px "Courier New", monospace'; c.fillStyle = '#ece6da'; c.fillRect(LW / 2 + c.measureText(hour.slice(0, n)).width / 2 + 4, 186, 26, 4); }   // cursor
    } };
}

// ---------- plano de relleno (mientras un decorado no existe) ----------
function placeholder(id, t0, color, note) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(color);
  const camera = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 100); camera.position.set(0, 1.4, 4); camera.lookAt(0, 1.2, 0);
  return { id, t0, scene, camera, update() {}, overlay(lt, dt, a, o) { o.pixelText(`#${id}`, LW / 2, 120, 16, '#ffffff', 2, 1); if (note) o.pixelText(note.slice(0, 90), LW / 2, 150, 9, '#dddddd', 1, 0, { bold: 0 }); } };
}

export let CUTS = [];          // [[id, t0]] resueltos
export let END = 0;
export const CUTS_T = [];      // la voz ya va sin huecos muertos (assemble.py)
export const warp = (t) => { for (const [a, b] of CUTS_T) if (t >= a) t += b - a; return t; };

const LIFT = Number(L.QS.get('gamma') ?? 0.8);
export const FILM_SFX = [];    // sonidos propios de film.js (tarjetas a maquina)
export async function loadAll() {
  await L.loadHero();
  TL = await (await fetch('timeline.json')).json(); index();
  CAPS = buildCaps(TL.words);
  const LIST = await (await fetch('shots.json')).json();
  // tiempos: cada plano empieza en su palabra (+offset); cada capitulo con hora abre con su tarjeta a maquina, que empieza
  // 0.15 s despues de la ultima palabra del capitulo anterior y dura >= 1.3 s (el 1er plano del capitulo espera a la tarjeta)
  const chFirst = {}; for (const [ch, hour, t] of TL.chapters) chFirst[ch] = { hour, t };
  const takeCh = {}; { let cur = null; const ids = TL.takes; const chOfTake = TL.takeChapter || {}; for (const id of ids) takeCh[id] = chOfTake[id]; }
  const cuts = []; let chNo = 0;
  for (const [id, set, an, note] of LIST) {
    const [take, k = 0, off = 0] = an; let t0 = at(take, k) - 0.08 + off;   // corte un pelin antes del sonido de la palabra
    const ch = takeCh[take];
    if (ch && chFirst[ch] && chFirst[ch].hour && !chFirst[ch].done) {
      chFirst[ch].done = true; chNo++;
      const prevEnd = TL.words.filter((w) => w[1] < at(take, 0) - 0.01).reduce((m, w) => Math.max(m, w[2]), 0);
      const tc = Math.max(prevEnd + 0.15, at(take, 0) - 1.6); cuts.push([`card_${ch}`, 'card', tc, chFirst[ch].hour]);   // v2: una pausa larga (la llave en el menu) se queda en el plano anterior
      t0 = Math.max(t0, tc + 1.9);   // la tarjeta se lee entera (hora + linea DAY 1)
    }
    cuts.push([id, set, t0, note]);
  }
  CUTS = cuts.map((c) => [c[0], c[2]]);
  END = TL.words[TL.words.length - 1][2] + 10.0;   // cierre: menu YES/NO + FOLLOW AVA RESTFIELD!
  const T = Object.fromEntries(CUTS);
  const tk = (take, k = 0) => at(take, k);
  HUDSPANS = [[0, 'FINE'], [tk('h4'), 'CAUTION'], [tk('a1'), 'FINE'], [tk('g9'), 'CAUTION'], [tk('m1'), 'FINE'], [tk('k1'), 'CAUTION'], [tk('k3'), 'FINE'],
    [tk('p3'), 'CAUTION'], [tk('p8'), 'FINE'], [tk('n1'), 'CAUTION'], [tk('n10', 'vickers'), 'DANGER']];
  HUD_T0 = T['02_gate'];
  const ctx = { L, TL, hud, hudState, youDied, examine, CUTS, T, at, endOf, words, KEY_RATE };
  window.CTX = ctx;
  const built = {};
  const sets = [...new Set(LIST.map((s) => s[1]))];
  for (const mod of (L.QS.get('sets') ?? sets.join(',')).split(',').filter(Boolean)) {
    try { const m = await import(`./sets/${mod}.js`); Object.assign(built, await m.shots(ctx)); }
    catch (e) { if (!String(e).includes('Failed to fetch') && !String(e).includes('Importing a module script failed')) throw e; console.warn('set ' + mod + ': ' + e); }
  }
  for (const [id, set, t0, note] of cuts) {
    let s;
    if (set === 'card') {
      s = chapterCard(id, t0, note);
      // una tecla por letra en el frame en que aparece (la letra i se ve cuando floor(lt*rate) > i)
      [...note].forEach((chr, i) => { if (chr !== ' ') FILM_SFX.push([+(t0 + (i + 1) / KEY_RATE).toFixed(3), 'type_key']); });
      const sub = s.card.sub, ts = t0 + note.length / KEY_RATE + 0.1;
      FILM_SFX.push([+(ts - 0.04).toFixed(3), 'type_return']);
      [...sub].forEach((chr, i) => { if (chr !== ' ') FILM_SFX.push([+(ts + (i + 1) / SUB_RATE).toFixed(3), 'type_key_soft']); });
    } else s = built[id] || placeholder(id, t0, 0x202028, `[${set}] ${note}`);
    s.id = id; s.t0 = t0; s.set = set; if (s.hard === undefined) s.hard = true;
    const dark = set === 'screens' || set === 'card';
    if (s.gamma === undefined) s.gamma = dark ? 1 : LIFT;
    s.nohud = s.nohud ?? dark;
    SHOTS.push(s);
  }
  for (const s of SHOTS) {
    const own = s.overlay;
    s.overlay = (lt, dt, a, o) => { if (own) own(lt, dt, a, o); if (!s.nohud && !(s.hudOff && s.hudOff(lt))) hud(o, s.t0 + lt, hudState(s.t0 + lt)); };
  }
  window.FILM = { dur: END, frames: Math.round(END * 30), cuts: CUTS };
  window.shotAt = (t) => { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].t0) i++; return SHOTS[i].id; };
}

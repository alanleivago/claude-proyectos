import { reText as bitText, reWidth as textWidth } from '../refont.js';
// sets/screens.js (LARGO 16:9) — pantallas de RE sin HUD ni gamma (film.js las trata como "dark"):
//   ITEM/SUPPLIES con panel de TOTALES: 05_hook_items, 26_item_pistol (pistola en EXAMINE), 35_item_water (contador 5->11->51),
//   41_item_dog (RIBBON en EXAMINE, perro 3D de sets/dog.js si existe), 66_item_final (LIGHTS: ON rojo);
//   puertas de carga RE: 23_door_armory (metal), 33_door_basement (madera + escaleras abajo), 62_door_radio;
//   diagramas: 27_db (barras dB), 32_tanks (garrafa + cisternas, NO FLUSHING), 42_hearing (mapa cenital, circulos de oido);
//   56_duty_log (FILE con sellos LOST), 69_choice (menu YES/NO + DAY 2 a maquina + SUBSCRIBE).
// Contrato: ../SETS.md. TODOS los tiempos salen de plan(ctx) (palabras de la voz); nada fijo a nivel de modulo. Prefijo S*.
const ROW_GAP = 0.14, STAMP_GAP = 0.08;
const TYPE_LINE = 'DAY 2 — YOU DECIDE.';
// ---------- letra a mano en pixel (sin fuentes del sistema): glifos de trazos propios, temblor determinista, se escribe por
// longitud de trazo. Unidades: mayusculas 0..6, x-height 3..6, linea base 6, descendentes hasta 8. [ancho, trazos...]
const SH_O = [[1.2, 0], [0, 1.4], [0, 4.6], [1.2, 6], [2.8, 6], [4, 4.6], [4, 1.4], [2.8, 0], [1.2, 0]];
const SH_P = [[0, 6], [0, 0], [2.6, 0], [3.4, 0.8], [3.4, 2.4], [2.6, 3.2], [0, 3.2]];
const SH_BOWL = [[3, 4], [2, 3], [1, 3], [0, 4], [0, 5], [1, 6], [2, 6], [3, 5]];
const SH_G = {
  a: [3, [[3, 3.6], [2, 3], [1, 3], [0, 4], [0, 5.2], [1, 6], [2, 6], [3, 5]], [[3, 3], [3, 6]]],
  b: [3, [[0, 0], [0, 6]], [[0, 4], [1, 3], [2, 3], [3, 4], [3, 5], [2, 6], [1, 6], [0, 5]]],
  c: [3, [[3, 3.6], [2, 3], [1, 3], [0, 4], [0, 5], [1, 6], [2, 6], [3, 5.4]]],
  d: [3, [[3, 0], [3, 6]], SH_BOWL],
  e: [3, [[0, 4.5], [3, 4.5], [3, 4], [2, 3], [1, 3], [0, 4], [0, 5], [1, 6], [2, 6], [3, 5.4]]],
  f: [2.8, [[2.8, 0.5], [2, 0], [1.3, 0.4], [1, 1.4], [1, 6]], [[0, 3], [2.4, 3]]],
  g: [3, [[3, 4], [2, 3], [1, 3], [0, 4], [0, 5], [1, 5.8], [2, 5.8], [3, 5]], [[3, 3], [3, 7.2], [2, 8], [1, 8], [0, 7.3]]],
  h: [3, [[0, 0], [0, 6]], [[0, 4], [1, 3], [2, 3], [3, 4], [3, 6]]],
  i: [1, [[0.5, 3], [0.5, 6]], [[0.5, 1.5], [0.6, 1.7]]],
  j: [2, [[1.5, 3], [1.5, 7.2], [0.8, 8], [0, 7.6]], [[1.5, 1.5], [1.6, 1.7]]],
  k: [3, [[0, 0], [0, 6]], [[3, 3], [0, 4.8]], [[1, 4.2], [3, 6]]],
  l: [1.5, [[0.5, 0], [0.5, 5.5], [1.2, 6]]],
  m: [4, [[0, 3], [0, 6]], [[0, 4], [1, 3], [2, 4], [2, 6]], [[2, 4], [3, 3], [4, 4], [4, 6]]],
  n: [3, [[0, 3], [0, 6]], [[0, 4], [1, 3], [2, 3], [3, 4], [3, 6]]],
  o: [3, [[1, 3], [0, 4], [0, 5], [1, 6], [2, 6], [3, 5], [3, 4], [2, 3], [1, 3]]],
  p: [3, [[0, 3], [0, 8]], [[0, 4], [1, 3], [2, 3], [3, 4], [3, 5], [2, 6], [1, 6], [0, 5]]],
  q: [3, [[3, 3], [3, 8], [3.6, 7.6]], SH_BOWL],
  r: [2.5, [[0, 3], [0, 6]], [[0, 4.3], [1, 3.2], [2.4, 3]]],
  s: [3, [[3, 3.4], [2, 3], [1, 3], [0, 3.6], [0.4, 4.3], [2.6, 4.7], [3, 5.4], [2, 6], [1, 6], [0, 5.6]]],
  t: [2.5, [[1, 1], [1, 5.5], [1.6, 6], [2.4, 5.7]], [[0, 3], [2.4, 3]]],
  u: [3, [[0, 3], [0, 5], [1, 6], [2, 6], [3, 5]], [[3, 3], [3, 6]]],
  v: [3, [[0, 3], [1.5, 6], [3, 3]]],
  w: [4, [[0, 3], [1, 6], [2, 4], [3, 6], [4, 3]]],
  x: [3, [[0, 3], [3, 6]], [[3, 3], [0, 6]]],
  y: [3, [[0, 3], [0, 5], [1, 6], [2, 6], [3, 5]], [[3, 3], [3, 7.2], [2, 8], [1, 8], [0, 7.4]]],
  z: [3, [[0, 3], [3, 3], [0, 6], [3, 6]]],
  A: [4, [[0, 6], [2, 0], [4, 6]], [[0.8, 4], [3.2, 4]]],
  B: [3.6, [[0, 6], [0, 0], [2.5, 0], [3.3, 0.7], [3.3, 2.2], [2.5, 3], [0, 3]], [[2.5, 3], [3.6, 3.8], [3.6, 5.2], [2.7, 6], [0, 6]]],
  C: [3.8, [[3.8, 1], [3, 0], [1.2, 0], [0, 1.4], [0, 4.6], [1.2, 6], [3, 6], [3.8, 5]]],
  D: [3.6, [[0, 0], [0, 6], [2.2, 6], [3.6, 4.6], [3.6, 1.4], [2.2, 0], [0, 0]]],
  E: [3.4, [[3.4, 0], [0, 0], [0, 6], [3.4, 6]], [[0, 3], [2.6, 3]]],
  F: [3.4, [[3.4, 0], [0, 0], [0, 6]], [[0, 3], [2.6, 3]]],
  G: [3.8, [[3.8, 1], [3, 0], [1.2, 0], [0, 1.4], [0, 4.6], [1.2, 6], [3, 6], [3.8, 5], [3.8, 3.5], [2.2, 3.5]]],
  H: [3.6, [[0, 0], [0, 6]], [[3.6, 0], [3.6, 6]], [[0, 3], [3.6, 3]]],
  I: [2, [[1, 0], [1, 6]], [[0, 0], [2, 0]], [[0, 6], [2, 6]]],
  J: [3, [[3, 0], [3, 4.8], [2, 6], [1, 6], [0, 5]]],
  K: [3.6, [[0, 0], [0, 6]], [[3.4, 0], [0, 3.6]], [[1.2, 2.6], [3.6, 6]]],
  L: [3.2, [[0, 0], [0, 6], [3.2, 6]]],
  M: [4.4, [[0, 6], [0, 0], [2.2, 3.8], [4.4, 0], [4.4, 6]]],
  N: [3.6, [[0, 6], [0, 0], [3.6, 6], [3.6, 0]]],
  O: [4, SH_O], Q: [4, SH_O, [[2.4, 4.4], [4.2, 6.4]]],
  P: [3.4, SH_P], R: [3.6, SH_P, [[1.6, 3.2], [3.6, 6]]],
  S: [3.5, [[3.4, 0.8], [2.6, 0], [1, 0], [0, 0.9], [0, 2.2], [1, 3], [2.6, 3.1], [3.5, 3.9], [3.5, 5.1], [2.6, 6], [1, 6], [0, 5.2]]],
  T: [4, [[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [3.6, [[0, 0], [0, 4.8], [1.1, 6], [2.5, 6], [3.6, 4.8], [3.6, 0]]],
  V: [4, [[0, 0], [2, 6], [4, 0]]],
  W: [4.8, [[0, 0], [1.2, 6], [2.4, 2], [3.6, 6], [4.8, 0]]],
  X: [3.6, [[0, 0], [3.6, 6]], [[3.6, 0], [0, 6]]],
  Y: [4, [[0, 0], [2, 3]], [[4, 0], [2, 3], [2, 6]]],
  Z: [3.6, [[0, 0], [3.6, 0], [0, 6], [3.6, 6]]],
  0: [3, [[1, 0], [0, 1.2], [0, 4.8], [1, 6], [2, 6], [3, 4.8], [3, 1.2], [2, 0], [1, 0]]],
  1: [1.6, [[0.2, 1.2], [1.2, 0], [1.2, 6]]],
  2: [3.2, [[0, 1], [1, 0], [2.2, 0], [3, 1], [3, 2.2], [0, 6], [3.2, 6]]],
  3: [3.2, [[0, 0.6], [1, 0], [2.2, 0], [3, 0.9], [3, 2], [2, 2.9], [1, 2.9]], [[2, 2.9], [3.2, 3.9], [3.2, 5.1], [2.2, 6], [1, 6], [0, 5.3]]],
  4: [3.4, [[2.6, 6], [2.6, 0], [0, 4], [3.4, 4]]],
  5: [3.2, [[3, 0], [0.3, 0], [0, 2.8], [1.6, 2.4], [2.6, 2.6], [3.2, 3.6], [3.2, 5], [2.2, 6], [1, 6], [0, 5.3]]],
  6: [3.2, [[2.8, 0.4], [1.6, 0], [0.4, 1], [0, 3], [0, 4.8], [1, 6], [2.2, 6], [3.2, 5], [3.2, 3.8], [2.2, 3], [1, 3], [0, 3.8]]],
  7: [3.2, [[0, 0], [3.2, 0], [1.2, 6]]],
  8: [3.2, [[1.6, 3], [0.4, 2.2], [0.4, 0.8], [1.2, 0], [2.2, 0], [3, 0.8], [3, 2.2], [1.6, 3], [0.2, 4], [0.2, 5.2], [1.1, 6], [2.3, 6], [3.2, 5.2], [3.2, 4], [1.6, 3]]],
  9: [3.2, [[3, 2.2], [2.2, 3], [1, 3], [0, 2.2], [0, 0.9], [1, 0], [2.2, 0], [3, 1], [3, 4], [2.4, 5.6], [1.4, 6], [0.4, 5.6]]],
  '.': [0.8, [[0.3, 5.7], [0.5, 6]]], ',': [1, [[0.7, 5.6], [0.2, 7]]], '-': [2.2, [[0, 3.8], [2.2, 3.6]]], '—': [4, [[0, 3.8], [4, 3.6]]],
  "'": [0.8, [[0.5, 0], [0.3, 1.4]]], '!': [1, [[0.5, 0], [0.5, 4.4]], [[0.5, 5.7], [0.6, 6]]], ':': [1, [[0.4, 3.1], [0.5, 3.4]], [[0.4, 5.7], [0.5, 6]]],
  '?': [3, [[0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [1.5, 3.2], [1.5, 4.3]], [[1.5, 5.7], [1.6, 6]]], '=': [3, [[0, 3], [3, 3]], [[0, 4.6], [3, 4.6]]],
  '/': [2.4, [[2.4, 0], [0, 6.4]]], ' ': [2.2],
};
const SH_SP = 1.1, SH_SLANT = 0.16;
const SHjit = (s, i, j) => { const v = Math.sin(s * 127.1 + i * 311.7 + j * 74.7) * 43758.5453; return v - Math.floor(v) - 0.5; };
/** ancho en px de un texto a mano con unidad u */
export function SHwidth(s, u) { let w = 0; for (const ch of s) w += ((SH_G[ch] || SH_G[' '])[0] + SH_SP) * u; return w - SH_SP * u; }
/** escribe s con linea base en (x, y), unidad u (px), color col; k 0..1 = parte escrita (por longitud de trazo); seed = temblor */
export function SHhand(c, s, x, y, u, col, k = 1, seed = 1, thick = 2) {
  const strokes = []; let cx = 0, tot = 0;
  [...s].forEach((ch, i) => {
    const g = SH_G[ch] || SH_G[' '], wob = SHjit(seed, i, 99) * 0.25;
    for (let j = 1; j < g.length; j++) {
      const pts = g[j].map(([px, py], n) => {
        const jx = SHjit(seed, i * 7 + j, n) * 0.32, jy = SHjit(seed + 3, i * 7 + j, n) * 0.32 + wob;
        return [x + (cx + px + jx + (6 - py) * SH_SLANT) * u, y + (py - 6 + jy) * u + Math.sin((cx + px) * 0.21 + seed) * 0.6];
      });
      let len = 0; for (let n = 1; n < pts.length; n++) len += Math.hypot(pts[n][0] - pts[n - 1][0], pts[n][1] - pts[n - 1][1]);
      strokes.push([pts, Math.max(1, len)]); tot += Math.max(1, len);
    }
    cx += g[0] + SH_SP;
  });
  let left = tot * Math.min(1, Math.max(0, k)); c.fillStyle = col;
  for (const [pts] of strokes) {
    if (left <= 0) break;
    for (let n = 1; n < pts.length && left > 0; n++) {
      const [x0, y0] = pts[n - 1], [x1, y1] = pts[n], sl = Math.hypot(x1 - x0, y1 - y0), f = Math.min(1, left / Math.max(0.001, sl)), steps = Math.max(1, Math.ceil(sl * f * 1.5));
      for (let q = 0; q <= steps; q++) { const a = (q / steps) * f, th = thick + (SHjit(seed + 9, n, q) > 0.38 ? 1 : 0); c.fillRect(Math.round(x0 + (x1 - x0) * a - th / 2), Math.round(y0 + (y1 - y0) * a - th / 2), th, th); }
      left -= sl;
    }
  }
}
const OFF = [['Sgt. M. HARLAN', 'PTL-3'], ['Ofc. R. ORTIZ', 'DESK'], ['Ofc. D. KOWALSKI', 'PTL-1'], ['Det. J. PRICE', 'DET.'], ['Ofc. T. NAKAMURA', 'PTL-2'], ['Ofc. B. VICKERS', 'FRONT']];

// ---------- anclas (s globales) de cada pantalla, compartidas por shots() y sfx() ----------
function plan(ctx) {
  const { at, endOf, T, CUTS, TL } = ctx;
  const filmEnd = TL.words[TL.words.length - 1][2] + 5;
  const end = (id) => { const i = CUTS.findIndex((c) => c[0] === id); return i >= 0 && i + 1 < CUTS.length ? CUTS[i + 1][1] : filmEnd; };
  const sh = (id) => ({ t0: T[id], t1: end(id), dur: end(id) - T[id] });
  const F5B = TL.takes.includes('f5b') ? 'f5b' : 'f5';   // 'Comment yes or no' (toma f5b en la voz nueva)
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
    s66: { ...sh('66_item_final'), dog: at('f1', 'dog'), fifteen: at('f1', 'fifteen'), f51: at('f1', 'fifty'), clover: at('f1', 'clover'), light: at('f1', 'light'), on: at('f1', -1) },
    s36d: { ...sh('36d_item_food'), twenty: at('fo3', 0), candy: at('fo3', 1), nine: at('fo3', 4), chips: at('fo3', 7), candy2: at('fo3', 9), two: at('fo3', 13), calories: at('fo3', 17),
      roughly: at('fo3', 20), half: at('fo3', 24), food: at('fo3', 27), water: at('fo4', 'water'), first: at('fo4', 'first') },
    s36e: { ...sh('36e_threes'), rule: at('fo4', 'rule'), threes: at('fo4', 'threes'), three1: at('fo5', 1), days: at('fo5', 2), water: at('fo5', 4), three2: at('fo5', 7),
      weeks: at('fo5', 8), food: at('fo5', 10), foodE: endOf('fo5', 10) },
    s43: { ...sh('43c_busy'), every: at('ph2', 'every'), call: at('ph2', 'call'), rings: at('ph2', 'rings'), busy: at('ph2', 'busy'), city: at('ph2', 'city'), same: at('ph2', 'same'),
      text: at('ph3', 2), fcc: at('ph3', 5), text2: at('ph3', 8), through: at('ph3', 11), call2: at('ph3', 14), less: at('ph3', 20), network: at('ph3', 23) },
    s48e: { ...sh('48e_steel'), sound: at('c4', 6), steel: at('c4', 9), fifteen: at('c4', 12), faster: at('c4', 14), air: at('c4', 17), hits: at('c4', 21), bars: at('c4', 23), rings: at('c4', 27) },
    s48m: { ...sh('48m_note'), paper: at('q1', 'paper'), note: at('q1', 'note'), sergeant: at('q1', 'sergeant'), set: at('q1', 'set'), evidence: at('q1', 'evidence'), locker: at('q1', 'locker'),
      match: at('q1', 'match'), broadcast: at('q1', 'broadcast'), d1: at('q2', 0), rules: at('q2', 1), d2: at('q2', 2) },
    s48n: { ...sh('48n_puzzle'), know: at('q3', 'know'), seven1: at('q3', -3), three: at('q3', -2), seven2: at('q3', -1), click: at('q4', 0) },
    s48o: { ...sh('48o_key'), inside: at('q4', 'inside'), little: at('q4', 'little'), brass: at('q4', 'brass'), key: at('q4', 'key'), shaped: at('q4', 'shaped'), clover: at('q4', 'clover') },
    s48q: { ...sh('48q_bac'), awake: at('z2', 1), h24: at('z2', 3), cdc: at('z2', 6), impaired: at('z2', 11), alcohol: at('z2', 17), point: at('z2', 19), oh: endOf('z2', 21),
      over: at('z2', 24), legal: at('z2', 26), limit: at('z2', 27) },
    s49: { ...sh('49b_map'), map: at('mp1', 'map'), two: at('mp1', 'two'), safe: at('mp1', 'safe'), front: at('mp1', 'front'), back: at('mp1', 'back'), chained: at('mp1', 'chained'),
      roof: at('mp2', 'roof'), ladder: at('mp2', 'ladder'), third: at('mp2', 'third'), plan: at('mp2', 'plan') },
    s69: { ...sh('69_choice'), q: ['do', 'you', 'open', 'the', 'door'].map((w) => at('f5', w)), comment: at(F5B, 'comment'), yes: at(F5B, 'yes'), no: at(F5B, 'no'), most: at('f6', 'most'), follow: endOf('f6', -1) + 1.5 },
  };
  // derivados
  P.s26.lift = P.s26.pistol - 0.25;
  P.s41.lift = Math.max(P.s41.ribbon + 0.35, P.s41.better - 0.3);
  // 56: VICKERS resaltado >= 1 s dentro del plano ('Vickers' cae ya en el plano 57): sellos LOST mas rapidos si hace falta
  { const p = P.s56; p.hl = p.vickers <= p.t1 - 1.05 ? p.vickers : Math.min(p.lost + 5 * STAMP_GAP + 0.06, p.t1 - 1.05);
    p.gap = Math.max(0.03, Math.min(STAMP_GAP, (p.hl - 0.02 - p.lost) / 5)); }
  for (const k of ['s23', 's33', 's62']) { const d = P[k]; d.open0 = d.t0 + Math.min(0.12, d.dur * 0.1); d.open1 = d.t0 + d.dur * 0.78; }
  // 23 armeria (~2 s): sale del negro, la manilla baja (clac), la hoja se abre lenta y la camara entra hasta el umbral
  { const d = P.s23; d.latch = d.t0 + 0.3; d.open0 = d.t0 + 0.45; d.open1 = d.t0 + d.dur * 0.86; }
  // 62 radio: llave del trebol entra en 'clover/key', gira en 'run', la puerta se abre en 'radio'
  { const d = P.s62; d.ins0 = Math.max(d.t0 + 0.15, ctx.at('l5', 'clover') - 0.05); d.ins1 = Math.max(d.ins0 + 0.3, ctx.endOf('l5', 'key') - 0.05);
    d.turn0 = Math.max(d.ins1 + 0.05, ctx.at('l5', 'run') - 0.1); d.turn1 = d.turn0 + 0.25; d.back0 = d.turn1 + 0.1;
    d.open0 = Math.max(d.back0 + 0.1, ctx.at('l5', 'radio') - 0.1); d.open1 = Math.min(d.t1 - 0.1, d.open0 + 0.9); }
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
  const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const door = (d, metal) => { s.push([d.t0 + 0.02, 'door_unlock'], [d.open0, metal ? 'door_creak_metal' : 'door_creak']); if (d.dur > 1.5) s.push([d.t1 - 0.12, 'door_slam']); };
  // pantalla ITEM: abrir menu + cursor en cada seleccion + pop/contador en cada objeto que entra
  const inv = (p, sel, pops) => { s.push([p.t0 + 0.02, 'menu_open']); for (const t of sel) if (t > p.t0 + 0.05) s.push([t, 'cursor_move']); for (const [t, n] of pops) s.push([t, n]); };
  // 05 avance ITEM
  { const p = P.s05; inv(p, [p.dog, p.fifteen], [[p.dog, 'item_pop'], [p.dog, 'dog_tag_jingle'], [p.fifteen, 'item_pop'], [p.fifteen, 'counter_tick'], [p.lock, 'lock_clunk']]); }
  // 23 armeria: manilla (clac), cerrojo, chirrido metalico lento
  { const d = P.s23; s.push([d.latch, 'door_unlock'], [d.latch + 0.05, 'door_handle'], [d.open0, 'door_creak_metal'], [d.t1 - 0.1, 'door_thud']); }
  // 26 pistola
  { const p = P.s26; inv(p, [p.pistol], [[p.pistol, 'item_pop'], [p.pistol, 'gun_handle'], [p.fifteen, 'counter_tick'], [p.fifteen, 'label']]); }
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
  { const p = P.s35; inv(p, [], [[p.t0 + 0.05, 'water_slosh']]); let last = 5;
    for (let t = p.f51; t <= p.f51e + 0.01; t += 1 / 15) { const v = waterRoll(p, t); if (v !== last) { s.push([f3(t), 'counter_tick']); last = v; } }
    const u = (x) => p.f51 + x * Math.max(0.2, p.f51e - p.f51); s.push([u(0.15), 'label'], [u(0.45), 'label'], [p.days, 'label'], [p.seven, 'label'], [p.seven + 0.05, 'check']); }
  // 36d comida
  { const p = P.s36d; inv(p, [p.twenty, p.chips, p.candy2, p.water], [[p.twenty, 'item_pop'], [p.twenty, 'wrapper_crinkle'], [p.twenty, 'counter_tick'], [p.nine, 'item_pop'], [p.nine, 'chips_bag'], [p.nine, 'counter_tick'],
      [p.two, 'label'], [p.half, 'label'], [p.half, 'counter_tick'], [p.water, 'water_slosh'], [p.first, 'label']]); }
  // 36e regla de los tres
  { const p = P.s36e; s.push([p.t0 + 0.02, 'menu_open'], [p.threes, 'label'], [p.three1, 'item_pop'], [p.days, 'bar_rise'], [p.water, 'water_drop'], [p.three2, 'item_pop'], [p.weeks, 'bar_rise'], [p.food, 'wrapper_crinkle'], [p.foodE + 0.05, 'check']); }
  // 41 perro
  { const p = P.s41; inv(p, [p.ribbon], [[p.ribbon, 'item_pop'], [p.ribbon, 'dog_tag_jingle'], [p.better, 'label']]); }
  // 42 mapa de oido
  { const p = P.s42; s.push([p.t0 + 0.02, 'menu_open'], [p.t0 + 0.15, 'ping'], [p.dog, 'item_pop'], [p.some, 'label'], [p.four, 'ring_expand'], [p.four + 0.45, 'label']); }
  // 43c red saturada: llamada, tono de ocupado, ciudad, SMS que pasa, FCC, barras
  { const p = P.s43; s.push([p.t0 + 0.02, 'menu_open'], [p.call, 'phone_dial'], [p.rings, 'phone_ring'], [p.busy, 'phone_busy'], [p.busy + 0.4, 'phone_busy'], [p.busy + 0.8, 'phone_busy']);
    for (let i = 3; i < 14; i++) s.push([f3(p.city + (i - 3) * 0.04), 'ui_tick']);
    s.push([p.text, 'sms_send'], [p.text + 1.3, 'sms_receive'], [p.text + 1.32, 'check'], [p.fcc, 'stamp'], [p.call2, 'bar_rise'], [p.less, 'label'], [p.network, 'label']); }
  // 48e acero vs aire
  { const p = P.s48e; s.push([p.t0 + 0.02, 'menu_open'], [p.sound, 'label'], [p.steel, 'bar_rise'], [p.fifteen, 'label'], [p.air, 'bar_rise'], [p.hits, 'metal_clang'], [p.rings, 'metal_ring'], [p.rings, 'label']); }
  // 48m nota manuscrita: hoja, cabecera, una tanda de rasgueo de boli por linea
  { const p = P.s48m; s.push([p.t0 + 0.02, 'file_open'], [p.t0 + 0.02, 'paper_slide'], [p.note, 'label']);
    for (const [a, b] of [[p.set, p.locker + 0.3], [p.match, p.broadcast + 0.35], [p.d1, p.d1 + 0.22], [p.rules, p.rules + 0.25], [p.d2, p.d2 + 0.22], [p.d2 + 0.25, p.d2 + 0.6]])
      for (let t = a; t < b - 0.02; t += 0.22) s.push([f3(t), 'pen_scribble']);
    s.push([p.d2 + 0.25, 'pen_scribble']); }
  // 48n puzle: un clic por cada paso de rodillo, cerradura, puerta
  { const p = P.s48n; s.push([p.t0 + 0.02, 'menu_open']);
    for (const [tw, v] of [[p.seven1, 7], [p.three, 3], [p.seven2, 7]]) { const a = tw - 0.16, b = tw + 0.1; let last = 0;
      for (let t = a; t <= b + 0.001; t += 1 / 60) { const d = Math.floor(v * sm((t - a) / (b - a)) + 1e-6); if (d !== last) { s.push([f3(t), 'dial_tick']); last = d; } } }
    s.push([p.seven1, 'cursor_move'], [p.three, 'cursor_move'], [p.seven2, 'cursor_move'], [p.seven2 + 0.12, 'check'], [p.click, 'lock_click'], [p.click + 0.03, 'door_unlock'], [p.click + 0.06, 'door_creak_metal']); }
  // 48o llave
  { const p = P.s48o; inv(p, [p.clover], [[p.t0 + 0.05, 'item_pop'], [p.t0 + 0.05, 'key_jingle'], [p.key, 'label'], [p.clover, 'item_pop'], [p.clover, 'key_jingle'], [p.clover, 'label']]); }
  // 48q alcohol en sangre
  { const p = P.s48q; s.push([p.t0 + 0.02, 'menu_open'], [p.awake, 'clock_tick'], [p.h24, 'label'], [p.cdc, 'stamp'], [p.impaired, 'label'], [p.alcohol, 'label'], [p.point, 'bar_rise']);
    let last = 0; for (let t = p.point; t <= p.oh + 0.01; t += 1 / 30) { const v = Math.floor(10 * sm((t - p.point) / (p.oh - p.point)) + 1e-6); if (v !== last) { s.push([f3(t), 'counter_tick']); last = v; } }
    s.push([p.legal, 'label'], [p.limit, 'alarm_beep']); }
  // 49b mapa
  { const p = P.s49; s.push([p.t0 + 0.02, 'map_open']); for (let i = 0; i < 4; i++) s.push([f3(p.t0 + 0.1 + i * 0.12), 'ui_tick']);
    s.push([p.map, 'map_blink'], [p.safe, 'map_blink'], [p.front, 'stamp'], [p.back, 'label'], [p.chained, 'chain_rattle'], [p.roof, 'map_blink'], [p.ladder, 'map_blink'], [p.plan, 'label'], [p.plan + 0.3, 'map_blink']); }
  // 56 FILE: hoja, 6 lineas, cabecera STATUS, 6 sellos LOST, VICKERS resaltado
  { const p = P.s56; s.push([p.t0 + 0.02, 'file_open']);
    for (let i = 0; i < 6; i++) s.push([f3(p.every + i * ROW_GAP), 'paper_tick']);
    s.push([p.status, 'label']);
    for (let i = 0; i < 6; i++) s.push([f3(p.lost + i * p.gap), 'stamp']);
    s.push([p.hl, 'marker_squeak']); }
  // 62 radio: la llave entra, gira, cerrojo, la puerta se abre
  { const d = P.s62; s.push([d.ins0, 'key_insert'], [d.turn0, 'key_turn'], [d.turn1, 'door_unlock'], [d.open0, 'door_creak']); }
  // 66 ITEM final
  { const p = P.s66; inv(p, [p.dog, p.fifteen, p.f51, p.clover, p.light], [[p.dog, 'dog_tag_jingle'], [p.fifteen, 'counter_tick'], [p.f51, 'water_slosh'], [p.f51, 'counter_tick'], [p.clover, 'key_jingle'], [p.light, 'label'], [p.on, 'light_switch_on'], [p.on + 0.02, 'fluorescent_buzz'], [p.on + 0.05, 'alarm_beep']]); }
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
  // textura NEGRA pintada en codigo, proyectada de lado sobre las piezas del GLB (coords locales de malla: x largo, cano en -x,
  // empunadura en +x; y grosor; z alto, +z abajo). Filas 0-95 = vista lateral; filas 96-127 = caras de arriba/abajo (y = grosor).
  const PB = { x0: -24.84, x1: 25.68, z0: -13.03, z1: 17.83, y: 2.75 };
  const tGun = L.cvs(128, 128, (c) => {
    const r = L.rng(919), X = (x) => Math.round((x - PB.x0) / (PB.x1 - PB.x0) * 128), Z = (z) => Math.round((z - PB.z0) / (PB.z1 - PB.z0) * 96);
    const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    const noise = (x, y, w, h, cols, n) => { for (let k = 0; k < n; k++) { c.fillStyle = cols[(r() * cols.length) | 0]; c.fillRect(x + ((r() * w) | 0), y + ((r() * h) | 0), 1, 1); } };
    R(0, 0, 128, 96, '#121316'); noise(0, 0, 128, 96, ['#0a0b0d', '#1a1c20'], 900);                       // armazon de polimero negro
    const sy0 = Z(-13.03), sy1 = Z(-5.9);                                                                  // corredera (pavonado)
    R(0, sy0, 128, sy1 - sy0, '#1e2026'); noise(0, sy0, 128, sy1 - sy0, ['#16181c', '#262a31', '#2c3038'], 500);
    R(0, sy0, 128, 1, '#0c0d10'); R(0, sy0 + 1, 128, 1, '#7a808c'); R(0, sy0 + 2, 128, 1, '#454a54');       // arista superior gastada
    R(0, sy1 - 2, 128, 1, '#4a505a'); R(0, sy1 - 1, 128, 1, '#08090b');                                     // arista inferior
    for (let x = X(12.5); x < X(21.5); x += 3) { R(x, sy0 + 4, 1, sy1 - sy0 - 7, '#050506'); R(x + 1, sy0 + 4, 1, sy1 - sy0 - 7, '#5c626e'); }   // estrias traseras
    for (let x = X(-21); x < X(-16.5); x += 3) { R(x, sy0 + 5, 1, sy1 - sy0 - 9, '#050506'); R(x + 1, sy0 + 5, 1, sy1 - sy0 - 9, '#4a505a'); }   // estrias delanteras
    R(X(-2), sy0 + 3, X(7) - X(-2), 4, '#060607'); R(X(-2), sy0 + 7, X(7) - X(-2), 1, '#5a606a');           // ventana de expulsion
    R(X(-1), sy0 + 9, 6, 2, '#8a909c'); for (let i = 0; i < 4; i++) R(X(2) + i * 3, sy0 + 9, 2, 2, '#6a707a');  // marcas grabadas
    R(0, sy0, 2, sy1 - sy0, '#565c66'); R(126, sy0, 2, sy1 - sy0, '#454a54');                               // bocacha / trasera gastadas
    const fy = sy1, gy0 = Z(0.5);                                                                          // armazon: riel bajo el cano
    for (let x = X(-22); x < X(-8); x += 4) R(x, fy + 4, 2, 2, '#050506');
    R(0, fy, 128, 1, '#2e323a');
    const gx0 = X(10.2), gx1 = X(24.4), gy1 = Z(15.5);                                                     // cachas texturizadas
    R(gx0, gy0, gx1 - gx0, gy1 - gy0, '#191b1f');
    for (let y = gy0 + 2; y < gy1 - 2; y++) for (let x = gx0 + 2; x < gx1 - 2; x++) if ((x + y) % 2 === 0) R(x, y, 1, 1, (x * 7 + y * 3) % 5 ? '#0a0b0c' : '#2c2f35');
    R(gx0, gy0, gx1 - gx0, 1, '#3c4048'); R(gx0, gy0, 1, gy1 - gy0, '#3c4048'); R(gx1 - 1, gy0, 1, gy1 - gy0, '#2a2d33'); R(gx0, gy1 - 1, gx1 - gx0, 1, '#2a2d33');
    R(X(12), gy0 + 2, 5, 4, '#3a3e46'); R(X(13), gy0 + 3, 3, 2, '#14161a');                                // tornillo de la cacha
    R(X(9.5), Z(15.8), X(25) - X(9.5), 96 - Z(15.8), '#2a2e35'); R(X(9.5), Z(15.8), X(25) - X(9.5), 1, '#6a707c');   // base del cargador
    R(X(3.8), Z(-3.8), X(6) - X(3.8), Z(1.5) - Z(-3.8), '#4a4f58');                                         // gatillo (metal)
    R(X(8), Z(-4.5), 3, 3, '#5a606a');                                                                      // retenida
    R(0, 96, 128, 32, '#1a1c21'); noise(0, 97, 128, 30, ['#121417', '#262a30'], 300);                      // cara superior
    R(0, 96, 128, 2, '#6e7480'); R(0, 126, 128, 2, '#565c66');                                              // aristas laterales gastadas
    for (let x = X(12.5); x < X(21.5); x += 3) R(x, 99, 1, 26, '#060607');
    R(X(-2), 101, X(7) - X(-2), 20, '#08090a');
  });
  function pistolUV(geo) {   // proyeccion lateral (y caras de arriba/abajo a la banda inferior)
    const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const u = (p.getX(i) - PB.x0) / (PB.x1 - PB.x0), top = n && Math.abs(n.getZ(i)) > 0.7;
      uv[i * 2] = u;
      uv[i * 2 + 1] = top ? (32 - (p.getY(i) + PB.y) / (2 * PB.y) * 32) / 128 : 1 - ((p.getZ(i) - PB.z0) / (PB.z1 - PB.z0)) * 96 / 128;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  function makePistol() {   // pistola en perfil hacia +z, longitud max = 1
    const gun = L.ps1Clone(pg.scene, { lit: true });
    const mGun = L.lam(tGun, 0xffffff, { side: THREE.DoubleSide, emissive: 0x0a0c12 }), mSight = L.lam(null, 0x3a3e46, { flatShading: true });
    const meshes = []; gun.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) { o.geometry = o.geometry.clone(); pistolUV(o.geometry); o.material = mGun;
      if (/toppart/i.test(o.name)) {   // miras (coords de malla): delantera fina, trasera en U
        L.box(1.4, 1.0, 1.8, mSight, -20.6, 0, -13.85, o);
        for (const s of [-1, 1]) L.box(1.8, 0.9, 1.9, mSight, 21.0, s * 0.95, -13.9, o);
      } }
    { const b = new THREE.Box3().setFromObject(gun), s = b.getSize(new THREE.Vector3()); gun.scale.multiplyScalar(1 / Math.max(s.x, s.y, s.z));
      const c = new THREE.Box3().setFromObject(gun).getCenter(new THREE.Vector3()); gun.position.sub(c); }
    const prof = new THREE.Group(); prof.add(gun); prof.rotation.set(0, Math.PI / 2, 0);
    const g = new THREE.Group(); g.add(prof);
    const rim = new THREE.DirectionalLight(0x9ab4ff, 3.0); rim.position.set(0.3, 1, 0.15); g.add(rim, rim.target);   // luz de contorno fria (aristas de arriba)
    const und = new THREE.DirectionalLight(0x6a7ca8, 1.6); und.position.set(-0.2, -1, 0.3); g.add(und, und.target);   // y de abajo (guardamonte, base)
    return g;
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

  // ==================== ITEM: pantalla de estado de RE2 (05 26 35 36d 41 48o 66) ====================
  // Arriba: retrato de Ava (3D), CONDITION (el HUD de film.js x1.25, mismo estado), EQUIP (pistola + municion), pestanas
  // FILE / MAP / ITEM / EXIT. Centro: visor EXAMINE (objeto 3D vivo + TOTALES) y 8 casillas 2x4 con iconos 3D y contadores
  // verdes. Abajo (y 240-284): caja de nombre/descripcion. Subtitulo libre (y 290-330). Iconos/retrato: render aparte (Sgrab,
  // como banner.js grab()). Casillas fijas: 0 spray, 1 hierba, 2 agua, 3 chocolatinas, 4 patatas, 5 nota, 6 llave, 7 RIBBON.
  const Sren = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
  Sren.setPixelRatio(1); Sren.outputColorSpace = THREE.SRGBColorSpace;
  function Sgrab(scene, cam, w, h) {
    Sren.setSize(w, h, false); Sren.setClearColor(0x000000, 0); Sren.render(scene, cam);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(Sren.domElement, 0, 0); return cv;
  }
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  function Snorm(obj) {   // centrado en el origen, tamano max = 1
    const inner = new THREE.Group(), outer = new THREE.Group(); inner.add(obj); outer.add(inner); outer.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(inner, true), s = b.getSize(V3()), c = b.getCenter(V3());
    obj.position.sub(c); inner.scale.setScalar(1 / Math.max(s.x, s.y, s.z)); return outer;
  }
  const Slight = (sc) => { sc.add(new THREE.AmbientLight(0xffffff, 1.0)); const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(-1, 1.6, 2); sc.add(dl); };
  function Sicon(obj, w, h, rot, fill = 0.92) {
    const sc = new THREE.Scene(); Slight(sc); obj.rotation.set(...rot); sc.add(obj); obj.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(obj, true), c = b.getCenter(V3()), s = b.getSize(V3());
    const half = Math.max(s.x / 2, (s.y / 2) * w / h) / fill;
    const cam = new THREE.OrthographicCamera(-half, half, half * h / w, -half * h / w, -10, 10); cam.position.set(c.x, c.y, c.z + 5); cam.lookAt(c); cam.updateMatrixWorld();
    const cv = Sgrab(sc, cam, w, h); sc.remove(obj); return cv;
  }
  // ---- objetos (todos con tamano max 1) ----
  const tSpray = L.cvs(64, 64, (c) => {
    c.fillStyle = '#bdbab2'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 4) { c.fillStyle = y % 8 ? '#c4c1b8' : '#b6b3aa'; c.fillRect(0, y, 64, 2); }
    c.fillStyle = '#dfe2c8'; c.fillRect(0, 14, 64, 36); c.fillStyle = '#2e9a50'; c.fillRect(0, 13, 64, 2); c.fillRect(0, 49, 64, 2);
    for (const x0 of [4, 36]) { c.fillStyle = '#2e9a50'; c.fillRect(x0 + 4, 19, 4, 12); c.fillRect(x0, 23, 12, 4); }
    c.fillStyle = '#d0504c'; c.fillRect(39, 32, 6, 6); c.fillRect(38, 33, 8, 4); c.fillStyle = '#f0e8e0'; c.fillRect(41, 33, 2, 4); c.fillRect(40, 34, 4, 2);
  });
  tSpray.wrapS = THREE.RepeatWrapping;
  function makeSpray() {
    const g = new THREE.Group(), r = 0.032, h = 0.13, mRim = lamC(0x7a6e6a);
    cyl(r * 1.12, r * 1.12, 0.012, 8, mRim, 0, 0.006, 0, g); cyl(r, r, h, 8, L.lam(tSpray), 0, 0.012 + h / 2, 0, g);
    cyl(r * 1.12, r * 1.12, 0.01, 8, mRim, 0, 0.012 + h, 0, g); cyl(r * 0.45, r, 0.03, 8, lamC(0xd8d6d0), 0, 0.032 + h, 0, g);
    L.box(0.014, 0.016, 0.014, lamC(0x2a2a2c), 0, 0.055 + h, 0, g); return Snorm(g);
  }
  const tLeaf = L.cvs(32, 32, (c) => {
    const rr = L.rng(77);
    for (let k = 0; k < 7; k++) { const x = 4 + rr() * 24, y = 4 + rr() * 16, w = 5 + rr() * 4, hh = 8 + rr() * 6, a = (rr() - 0.5) * 0.9;
      c.fillStyle = '#1c5a1a'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2 + 1, hh / 2 + 1, a, 0, 7); c.fill();
      c.fillStyle = '#3aa035'; c.beginPath(); c.ellipse(x, y + hh / 2, w / 2, hh / 2, a, 0, 7); c.fill(); }
    c.fillStyle = '#3a5a20'; for (let k = 0; k < 5; k++) c.fillRect(8 + k * 4, 22, 2, 10);
  });
  function makeHerb() {
    const g = new THREE.Group();
    cyl(0.05, 0.036, 0.07, 8, lamC(0x9a5a34), 0, 0.035, 0, g); cyl(0.054, 0.054, 0.012, 8, lamC(0x9a5a34), 0, 0.068, 0, g);
    cyl(0.046, 0.046, 0.004, 8, lamC(0x3a2414), 0, 0.072, 0, g);
    const lm = L.lam(tLeaf, 0xffffff, { alphaTest: 0.5, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) L.plane(0.13, 0.13, lm, 0, 0.13, 0, g, k * Math.PI / 3);
    return Snorm(g);
  }
  const tCandy = L.cvs(64, 32, (c) => {
    c.fillStyle = '#b8241a'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#7a120c'; c.fillRect(0, 0, 64, 3); c.fillRect(0, 29, 64, 3);
    c.fillStyle = '#f0c838'; c.fillRect(0, 9, 64, 14); c.fillStyle = '#5a2a10'; c.fillRect(0, 10, 64, 12);
    bitText(c, 'CHOCO', 32, 16, 1, '#f8e8c0', { outline: null });
  });
  function makeCandy() {
    const g = new THREE.Group(), w = lamC(0xb8241a), lab = L.lam(tCandy);
    L.mesh(new THREE.BoxGeometry(1, 0.28, 0.12), [w, w, w, w, lab, lab], 0, 0, 0, g);
    for (const s of [-1, 1]) L.box(0.07, 0.24, 0.035, lamC(0xc8c0b0), s * 0.535, 0, 0, g);   // pliegues del envoltorio
    return Snorm(g);
  }
  const tChips = L.cvs(48, 64, (c) => {
    c.fillStyle = '#e8b018'; c.fillRect(0, 0, 48, 64); c.fillStyle = '#c42a18'; c.fillRect(0, 20, 48, 22);
    c.fillStyle = '#f4d860'; c.beginPath(); c.ellipse(24, 52, 12, 7, 0.3, 0, 7); c.fill(); c.fillStyle = '#c89020'; c.fillRect(18, 50, 3, 2); c.fillRect(27, 53, 3, 2);
    bitText(c, 'CHIPS', 24, 31, 1, '#fff4d0', { outline: null });
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(6, 4, 3, 14);
  });
  function makeChips() {
    const g = new THREE.Group(), y = lamC(0xd8a014), lab = L.lam(tChips);
    L.mesh(new THREE.BoxGeometry(0.7, 0.92, 0.2), [y, y, y, y, lab, lab], 0, 0, 0, g);
    for (const s of [-1, 1]) L.box(0.72, 0.07, 0.06, lamC(0xb8860e), 0, s * 0.49, 0, g);
    return Snorm(g);
  }
  const tNote = L.cvs(64, 48, (c) => {
    const r = L.rng(4848); c.fillStyle = '#e8dcbc'; c.fillRect(0, 0, 64, 48);
    c.fillStyle = 'rgba(120,100,60,0.25)'; for (let k = 0; k < 30; k++) c.fillRect(r() * 64 | 0, r() * 48 | 0, 1, 1);
    c.fillStyle = '#2a3a8a'; for (let y = 8; y < 42; y += 7) { let x = 5; while (x < 56) { const w = 3 + (r() * 9 | 0); c.fillRect(x, y + (r() < 0.3 ? 1 : 0), w, 1); x += w + 2; } }
    c.fillStyle = '#9a8a6a'; c.fillRect(31, 0, 1, 48);
  });
  function makeNote() {
    const g = new THREE.Group(), m = L.lam(tNote, 0xffffff, { side: THREE.DoubleSide });
    const half = (u0, x, ry) => { const geo = new THREE.PlaneGeometry(0.5, 0.75); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, u0 + uv.getX(i) * 0.5);
      const ms = L.mesh(geo, m, 0, 0, 0, null), p = new THREE.Group(); p.add(ms); ms.position.x = x; p.rotation.y = ry; g.add(p); };
    half(0, -0.25, 0.28); half(0.5, 0.25, -0.28); return Snorm(g);
  }
  function makeKey() {   // llave de laton con cabeza de trebol (4 hojas)
    const g = new THREE.Group(), br = L.lam(null, 0xd8a640, { flatShading: true }), brD = lamC(0x8a6420), bx = -0.4;
    for (const a of [45, 135, 225, 315]) { const r = a * Math.PI / 180; cyl(0.115, 0.115, 0.05, 10, br, bx + Math.cos(r) * 0.12, Math.sin(r) * 0.12, 0, g).rotation.x = Math.PI / 2; }
    cyl(0.07, 0.07, 0.06, 8, brD, bx, 0, 0, g).rotation.x = Math.PI / 2;   // centro grabado
    cyl(0.03, 0.03, 0.065, 6, br, bx, 0, 0, g).rotation.x = Math.PI / 2;
    L.box(0.05, 0.12, 0.07, brD, -0.2, 0, 0, g);                          // collar
    L.box(0.66, 0.07, 0.05, br, 0.12, 0, 0, g);                           // cana
    L.box(0.09, 0.13, 0.05, br, 0.38, -0.09, 0, g); L.box(0.06, 0.08, 0.05, br, 0.24, -0.07, 0, g);   // dientes
    return Snorm(g);
  }
  function makeBulb() {
    const g = new THREE.Group(), glass = L.basic(null, 0x4a4e58);   // apagada (gris) hasta setOn(true)
    L.mesh(new THREE.SphereGeometry(0.3, 8, 6), glass, 0, 0.15, 0, g);
    const fil = L.mesh(new THREE.BoxGeometry(0.16, 0.03, 0.03), L.basic(null, 0x1a1a1e), 0, 0.12, 0.31, g);
    cyl(0.14, 0.14, 0.22, 8, lamC(0xb0b4bc), 0, -0.25, 0, g); cyl(0.06, 0.06, 0.06, 6, lamC(0x2a2a2c), 0, -0.39, 0, g);
    const o = Snorm(g); o.userData.setOn = (on) => { glass.color.setHex(on ? 0xfff0a0 : 0x4a4e58); fil.material.color.setHex(on ? 0xffffff : 0x1a1a1e); }; return o;
  }
  const ITEMS = {
    gun: { name: 'HANDGUN', make: () => Snorm(makePistol()), rot: [0.2, -0.35, 0.05], size: 150, icon: [120, 56, [0.15, -0.3, 0.05]] },
    spray: { name: 'FIRST AID SPRAY', make: makeSpray, rot: [0.25, 0, 0.35], size: 110, icon: [104, 42, [0.3, 0.5, Math.PI / 2 - 0.25]] },
    herb: { name: 'GREEN HERB', make: makeHerb, rot: [0.3, 0, 0], size: 110, icon: [104, 42, [0.45, 0.3, 0]] },
    water: { name: 'WATER', make: () => Snorm(makeJug()), rot: [0.22, -0.5, 0.04], size: 110, icon: [104, 42, [0.22, -0.5, 0.04]] },
    candy: { name: 'CANDY BAR', make: makeCandy, rot: [0.35, -0.3, 0.1], size: 150, icon: [104, 42, [0.45, -0.25, 0.12]] },
    chips: { name: 'CHIPS', make: makeChips, rot: [0.2, -0.35, 0.05], size: 115, icon: [104, 42, [0.25, -0.35, 0.05]] },
    note: { name: "MARLA'S NOTE", make: makeNote, rot: [0.25, 0, 0.05], size: 130, icon: [104, 42, [0.5, 0, 0.1]] },
    key: { name: 'CLOVER KEY', make: makeKey, rot: [0.3, -0.2, 0.25], size: 150, icon: [104, 42, [0.35, -0.2, 0.15]] },
    bulb: { name: 'LIGHTS', make: makeBulb, rot: [0.1, 0, 0], size: 100 },
    dog: { name: 'RIBBON', rot: [0.18, 1.1, 0], size: 150 },
  };
  const SLOTK = ['spray', 'herb', 'water', 'candy', 'chips', 'note', 'key', 'dog'];
  const ICON = {};
  for (const k of Object.keys(ITEMS)) if (ITEMS[k].icon) { const [w, h, r] = ITEMS[k].icon; ICON[k] = Sicon(ITEMS[k].make(), w, h, r); }
  { const d = await makeDog(); if (d) { d.update(0, 'stand', { wag: 0 }); const g = new THREE.Group(); g.add(d.root); ICON.dog = Sicon(g, 104, 42, [0.25, 1.25, 0]); } else ICON.dog = null; }
  // retratos (como el de banner.js): media sonrisa y preocupada
  function Sportrait(eyes, mouth, w, h) {
    const sc = new THREE.Scene(); sc.add(new THREE.AmbientLight(0xffffff, 1.1));
    const kl = new THREE.DirectionalLight(0xfff2e0, 1.8); kl.position.set(-1.2, 1.6, 2.5); sc.add(kl);
    const ch = L.hero(); sc.add(ch.root); ch.shadow.visible = false;
    ch.pose(0, L.still('idle', 0), [[-99, eyes, mouth]]); ch.root.updateMatrixWorld(true);
    const head = V3(); ch.bone.getObjectByName('Head').getWorldPosition(head);
    const cam = new THREE.PerspectiveCamera(17, w / h, 0.05, 20); cam.position.set(head.x + 0.1, head.y + 0.03, head.z + 1.6); cam.lookAt(head.x, head.y, head.z); cam.updateMatrixWorld();
    ch.lookAt(cam, 1, 40); return Sgrab(sc, cam, w, h);
  }
  const PORT = { smile: Sportrait('open', 'smile', 58, 62), worried: Sportrait('surprised', 'frown', 58, 62) };
  Sren.dispose();
  // ---- maqueta 2D ----
  const IV = { por: [8, 8, 66, 84], cond: [78, 8], equip: [230, 8, 150, 84], tabs: [384, 8, 244, 22], view: [8, 96, 372, 140], grid: [384, 34, 244, 202], desc: [8, 240, 620, 44] };
  const GS = (i) => ({ x: 389 + (i % 2) * 119, y: 39 + Math.floor(i / 2) * 49, w: 115, h: 45 });
  const EQS = { x: 249, y: 12, w: 127, h: 76 };
  const VC = [110, 166];   // centro del objeto del EXAMINE
  function Stabs(c, active) {
    const [x0, y0, w0, h0] = IV.tabs; bevel(c, x0, y0, w0, h0, '#3c4050', '#9aa0b4', '#14161c');
    ['FILE', 'MAP', 'ITEM', 'EXIT'].forEach((s, i) => {
      const x = x0 + 3 + i * 60, on = s === active;
      rect(c, x, y0 + 3, 58, h0 - 6, on ? '#2a4c94' : '#10142a');
      if (on) { rect(c, x, y0 + 3, 58, 1, '#9ab8ff'); rect(c, x, y0 + h0 - 4, 58, 1, '#9ab8ff'); }
      bitText(c, s, x + 29, y0 + h0 / 2, 2, on ? '#ffffff' : '#8a90a8', { outline: null });
    });
  }
  const tInvBg = L.cvs(LW, LH, (c) => {
    bgGrad(c);
    { const [x, y, w, h] = IV.por; bevel(c, x, y, w, h); rect(c, x + 3, y + 3, w - 6, 16, '#141c4a'); rect(c, x + 3, y + 19, w - 6, 1, '#8a90a8'); inset(c, x + 4, y + 22, 58, 59, '#1a2848');
      const g = c.createLinearGradient(0, y + 22, 0, y + 81); g.addColorStop(0, '#3a5a9a'); g.addColorStop(1, '#0c1430'); c.fillStyle = g; c.fillRect(x + 4, y + 22, 58, 59);
      bitText(c, 'AVA', x + w / 2, y + 11, 2, '#e8eef8', { outline: null }); }
    { const [x, y, w, h] = IV.equip; bevel(c, x, y, w, h); rect(c, x + 3, y + 3, 15, h - 6, '#141c4a');
      'EQUIP'.split('').forEach((ch, i) => bitText(c, ch, x + 10, y + 13 + i * 15, 2, '#c8d0e8', { outline: null })); slot(c, EQS.x, EQS.y, EQS.w, EQS.h); }
    Stabs(c, 'ITEM');
    { const [x, y, w, h] = IV.view; bevel(c, x, y, w, h); inset(c, x + 4, y + 4, w - 8, h - 8, '#040812');
      c.fillStyle = 'rgba(80,110,180,0.08)'; for (let yy = y + 6; yy < y + h - 4; yy += 3) c.fillRect(x + 4, yy, w - 8, 1);
      rect(c, 206, y + 8, 1, h - 16, '#2a3450'); }
    { const [x, y, w, h] = IV.grid; bevel(c, x, y, w, h); for (let i = 0; i < 8; i++) { const s = GS(i); slot(c, s.x, s.y, s.w, s.h); } }
    { const [x, y, w, h] = IV.desc; bevel(c, x, y, w, h, '#2c3040', '#7a8094', '#0c0e14'); inset(c, x + 4, y + 4, w - 8, h - 8, '#04060e'); }
  });
  const ecgCv = document.createElement('canvas'); ecgCv.width = 140; ecgCv.height = 90; const ecgO = { tctx: ecgCv.getContext('2d') };
  const Sdraw = (c, cv, cx, cy, k = 1) => { if (!cv) return; const w = Math.round(cv.width * k), h = Math.round(cv.height * k); if (w < 1 || h < 1) return; c.drawImage(cv, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h); };
  const cursorBox = (c, s, t, ts) => {
    const col = Math.floor((t - ts) * 4) % 2 === 0 ? '#ffe048' : '#b08418';
    for (const d of [0, 1]) { c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(s.x - 2.5 - d, s.y - 2.5 - d, s.w + 5 + 2 * d, s.h + 5 + 2 * d); }
    for (const [x, y] of [[s.x - 3, s.y - 3], [s.x + s.w + 2, s.y - 3], [s.x - 3, s.y + s.h + 2], [s.x + s.w + 2, s.y + s.h + 2]]) { c.fillStyle = col; c.fillRect(x - 2, y - 2, 5, 5); }
  };
  // segmentos de texto [[txt, col], ...] alineados a la izquierda
  const segs = (c, parts, x, y, sc) => { for (const [s, col] of parts) { if (!s) continue; left(c, s, x, y, sc, col, { outline: '#000000' }); x += textWidth(s, sc) + (sc >= 2 ? 6 : 4); } };
  /**
   * cfg: t0; have {itemKey: t}; count {itemKey: (t)->txt|null}; lock6 (t del candado ?); face 'smile'|'worried'
   * sel [[t, itemKey|null, name, body]] (body: txt | [[txt,col]] | (t)->eso; name: idem); desc0 [name, body] antes del primer sel
   * rows [[label, (t)->val|null, ta]] (TOTALES); title; extra(c, t); dogs {itemKey: dog3}
   */
  function invShot(cfg) {
    const { t0 } = cfg;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e); Slight(scene);
    const cam = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -2000, 2000); cam.position.set(0, 0, 900); cam.lookAt(0, 0, 0);
    L.plane(LW, LH, L.basic(tInvBg), 0, 0, -800, scene);
    const live = {};
    for (const [, k] of cfg.sel) if (k && !live[k]) {
      if (k === 'dog') { const d = cfg.dog3; if (!d) continue; const g = new THREE.Group(); g.add(d.root); scene.add(g); live.dog = g; g.userData.dog = d; }
      else { const o = ITEMS[k].make(); scene.add(o); live[k] = o; }
      live[k].visible = false;
    }
    const curSel = (t) => { let s = null; for (const e of cfg.sel) if (t >= e[0]) s = e; return s; };
    const ev = (v, t) => (typeof v === 'function' ? v(t) : v);
    return {
      scene, camera: cam,
      update(lt) {
        const t = t0 + lt, s = curSel(t);
        for (const [k, o] of Object.entries(live)) {
          const on = s && s[1] === k; o.visible = on; if (!on) continue;
          const it = ITEMS[k], u = t - s[0], p = pop(t, s[0]), q = L.q15(u);
          const [x, y] = W(VC[0], VC[1] + (k === 'dog' ? 40 : 0));
          o.position.set(x, y, 300); o.scale.setScalar(Math.max(0.001, p) * it.size * (k === 'dog' ? 0.62 : 1));
          o.rotation.set(it.rot[0], it.rot[1] + 0.9 * Math.sin(q * 1.4), it.rot[2]);
          if (o.userData.dog) o.userData.dog.update(lt, 'stand', { wag: 1 });
          if (o.userData.setOn) o.userData.setOn(cfg.bulbOn !== undefined && t >= cfg.bulbOn);
        }
      },
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = t0 + lt, prevS = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
        // retrato + CONDITION (HUD de film.js)
        c.save(); c.beginPath(); c.rect(IV.por[0] + 4, IV.por[1] + 22, 58, 59); c.clip(); Sdraw(c, PORT[cfg.face || 'smile'], IV.por[0] + 33, IV.por[1] + 52); c.restore();
        ecgO.tctx.clearRect(0, 0, 140, 90); ctx.hud(ecgO, t, ctx.hudState(t)); c.drawImage(ecgCv, 8, 8, 118, 66, IV.cond[0], IV.cond[1], 148, 83);
        // EQUIP: pistola + municion
        const hg = cfg.have.gun;
        if (hg !== undefined && t >= hg) {
          Sdraw(c, ICON.gun, EQS.x + EQS.w / 2, EQS.y + EQS.h / 2 - 4, pop(t, hg));
          const n = cfg.count.gun && cfg.count.gun(t); if (n) right(c, n, EQS.x + EQS.w - 5, EQS.y + EQS.h - 11, 2, '#9cf09c', { outline: '#000000' });
        }
        // casillas
        SLOTK.forEach((k, i) => {
          const s = GS(i), ta = cfg.have[k];
          if (k === 'dog') { c.strokeStyle = '#8a7030'; c.lineWidth = 1; c.strokeRect(s.x + 1.5, s.y + 1.5, s.w - 3, s.h - 3); }
          if (ta === undefined || t < ta) {
            if (i === 6 && cfg.lock6 !== undefined && t >= cfg.lock6) { const p = pop(t, cfg.lock6); blit(c, LOCK_ICON, s.x + s.w / 2 - 14, s.y + s.h / 2, Math.max(1, Math.round(3 * p))); bitText(c, '?', s.x + s.w / 2 + 20, s.y + s.h / 2, 3, '#ffe048', { outline: '#000000' }); }
            return;
          }
          const n = cfg.count[k] && cfg.count[k](t); Sdraw(c, ICON[k], s.x + s.w / 2 - (n ? 12 : 0), s.y + s.h / 2, pop(t, ta));
          if (k === 'dog') left(c, 'K-9', s.x + 4, s.y + 10, 2, '#d8b860', { outline: '#000000' });
          if (n) right(c, n, s.x + s.w - 4, s.y + s.h - 9, 2, '#9cf09c', { outline: '#000000' });
        });
        // cursor + descripcion
        const s = curSel(t);
        if (s) {
          const k = s[1];
          if (k === 'gun') cursorBox(c, EQS, t, s[0]); else if (k && SLOTK.includes(k) && t >= (cfg.have[k] ?? -1e9)) cursorBox(c, GS(SLOTK.indexOf(k)), t, s[0]);
        }
        const [nm, body] = s ? [s[2], s[3]] : (cfg.desc0 || ['', '']);
        const nmv = ev(nm, t), bv = ev(body, t);
        if (nmv) (Array.isArray(nmv) ? segs(c, nmv, 22, 253, 2) : left(c, nmv, 22, 253, 2, '#ffffff', { outline: '#000000' }));
        if (bv) (Array.isArray(bv) ? segs(c, bv, 22, 272, 2) : left(c, bv, 22, 272, 2, '#c8ccd8', { outline: '#000000' }));
        // TOTALES (mitad derecha del visor)
        const X0 = 216, X1 = 370, n = cfg.rows.length, RH = Math.min(22, Math.floor(104 / n));
        bitText(c, cfg.title || 'TOTALS', (X0 + X1) / 2, 112, 2, '#9cf09c', { outline: null });
        cfg.rows.forEach(([label, fn, ta], i) => {
          const y = 130 + i * RH + (RH - 20) / 2, v = fn(t), on = ta === undefined || t >= ta;
          if (i) { c.fillStyle = '#1a2440'; c.fillRect(X0, y - RH / 2, X1 - X0, 1); }
          left(c, label, X0, y, 2, on ? '#c8ccd8' : '#4a5068', { outline: null });
          if (!v) { right(c, '--', X1, y, 2, '#3a4058', { outline: null }); return; }
          const flash = L.clamp01((t - v.tc) / 0.35), col = mixHex('#ffffff', v.col || '#62f05a', flash), bob = t - v.tc < 0.07 ? -2 : 0;
          let xr = X1;
          if (v.unit) { right(c, v.unit, xr, y, 2, mixHex('#000000', col, 0.85), { outline: '#000000' }); xr -= textWidth(v.unit, 2) + 5; }
          right(c, v.txt, xr, y + bob, 2, col, { outline: '#000000' });
        });
        if (cfg.extra) cfg.extra(c, t);
        // bombilla encendida: halo rojo/amarillo (solo desde 'on')
        if (cfg.bulbOn !== undefined && t >= cfg.bulbOn && s && s[1] === 'bulb') {
          const u = t - cfg.bulbOn, fl = u < 0.12 ? 1.5 - u / 0.24 : 1 + 0.08 * (Math.floor(u * 4) % 2), [gx, gy] = VC, rr = 70 * fl;
          c.save(); c.beginPath(); c.rect(IV.view[0] + 4, IV.view[1] + 4, 198, IV.view[3] - 8); c.clip(); c.globalCompositeOperation = 'lighter';
          const g = c.createRadialGradient(gx, gy - 12, 6, gx, gy - 12, rr); g.addColorStop(0, 'rgba(255,240,150,0.85)'); g.addColorStop(0.35, 'rgba(255,170,40,0.45)'); g.addColorStop(0.7, 'rgba(220,40,20,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.fillRect(gx - rr, gy - 12 - rr, rr * 2, rr * 2);
          c.fillStyle = 'rgba(255,220,120,0.9)'; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, r0 = 50, r1 = 50 + 12 * fl; Sthick(c, [[gx + Math.cos(an) * r0, gy - 12 + Math.sin(an) * r0], [gx + Math.cos(an) * r1, gy - 12 + Math.sin(an) * r1]], '#ffd23f', 3); }
          c.restore();
        }
        c.imageSmoothingEnabled = prevS;
      },
    };
  }
  const val = (txt, tc, more = {}) => ({ txt, tc, ...more });
  const after = (ta, v) => (t) => (t >= ta ? v : null);
  const steps = (...pairs) => (t) => { let v = pairs[0][1]; for (const [ta, vv] of pairs) if (t >= ta) v = vv; return v; };   // [[t, v], ...]

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
  const sign = (txt, bg, fg) => L.cvs(128, 32, (c) => { c.fillStyle = '#0c0c0e'; c.fillRect(0, 0, 128, 32); c.fillStyle = bg; c.fillRect(2, 2, 124, 28); bitText(c, txt, 64, 16, 2, fg, { outline: null }); });
  // textura de puerta x2 (nearest) + rotulo nitido en refont sc 2 encima
  const S2x = (tex, draw) => L.cvs(tex.image.width * 2, tex.image.height * 2, (c, w, h) => { c.imageSmoothingEnabled = false; c.drawImage(tex.image, 0, 0, w, h); draw(c); });
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
      tDoor = S2x(tDoor, (c) => { c.fillStyle = '#3a2208'; c.fillRect(20, 66, 88, 28); c.fillStyle = '#c89a3a'; c.fillRect(22, 68, 84, 24); c.fillStyle = '#e8c070'; c.fillRect(22, 68, 84, 2);
        c.fillStyle = '#5a3a10'; for (const x of [25, 101]) c.fillRect(x, 79, 2, 2); bitText(c, 'BASEMENT', 64, 80, 2, '#2a1a0a', { outline: null }); });
      tEdge = Swood(62, '#5a2e14', '#2e1608', true, 0.7); wallT = tStone; signT = sign('BASEMENT', '#c8b47a', '#2a1a0a');
    } else if (kind === 'metal') {
      tDoor = noiseTex(2301, 64, 128, '#4c5560', 16, (c, r) => {
        c.fillStyle = '#3a424c'; c.fillRect(0, 0, 64, 3); c.fillRect(0, 125, 64, 3); c.fillRect(0, 0, 3, 128); c.fillRect(61, 0, 3, 128);
        for (const y of [30, 64, 98]) { c.fillStyle = '#5e6874'; c.fillRect(3, y, 58, 4); c.fillStyle = '#2a3038'; c.fillRect(3, y + 4, 58, 1); }
        c.fillStyle = '#8a94a0'; for (let y = 6; y < 124; y += 10) { c.fillRect(5, y, 2, 2); c.fillRect(57, y, 2, 2); }
        c.fillStyle = '#d8b020'; c.fillRect(10, 40, 44, 16); c.fillStyle = '#141414'; for (let x = 10; x < 54; x += 6) c.fillRect(x, 40, 3, 16);
        c.fillStyle = '#e8e2c8'; c.fillRect(12, 42, 40, 12);
        c.fillStyle = 'rgba(90,40,20,0.45)'; for (let k = 0; k < 50; k++) c.fillRect(r() * 64 | 0, r() * 128 | 0, 1 + (r() * 3 | 0), 1 + (r() * 3 | 0));   // oxido
      });
      tDoor = S2x(tDoor, (c) => { c.fillStyle = '#e8e2c8'; c.fillRect(26, 86, 76, 20); bitText(c, 'ARMORY', 64, 96, 2, '#141414', { outline: null }); });
      tEdge = noiseTex(2302, 16, 64, '#3a424c', 10); wallT = tBlock; signT = sign('ARMORY', '#d8b020', '#141414');
    } else {
      tDoor = noiseTex(6201, 64, 128, '#4a5a4c', 12, (c, r) => {
        c.fillStyle = '#0c1210'; c.fillRect(18, 14, 28, 34); c.fillStyle = '#26323a'; c.fillRect(20, 16, 24, 30);   // ventanuco de cristal armado
        c.fillStyle = 'rgba(160,180,170,0.35)'; for (let x = 20; x < 44; x += 4) c.fillRect(x, 16, 1, 30); for (let y = 16; y < 46; y += 4) c.fillRect(20, y, 24, 1);
        c.fillStyle = '#e4e0d0'; c.fillRect(12, 53, 40, 14);
        c.fillStyle = '#3a4a3c'; c.fillRect(0, 100, 64, 28); c.fillStyle = '#6a7a68'; c.fillRect(0, 100, 64, 1);   // placa de patadas
        c.fillStyle = 'rgba(20,24,20,0.5)'; for (let k = 0; k < 40; k++) c.fillRect(r() * 64 | 0, r() * 128 | 0, 1 + (r() * 3 | 0), 1);
      });
      tDoor = S2x(tDoor, (c) => { c.fillStyle = '#e4e0d0'; c.fillRect(26, 108, 76, 24); bitText(c, 'RADIO', 64, 120, 2, '#141414', { outline: null }); });
      tEdge = noiseTex(6202, 16, 64, '#3a4a3c', 10); wallT = tPlaster; signT = sign('RADIO ROOM', '#1a1a1a', '#e8e4d8');
    }
    const wallM = L.lam(L.rep(wallT, 2, 2)), wallM2 = L.lam(L.rep(wallT, 1, 1));
    L.box(2.6, 4.6, 0.3, wallM, -1.92, 2.3, -0.2, scene); L.box(2.6, 4.6, 0.3, wallM, 1.92, 2.3, -0.2, scene);
    L.box(1.24, 2.2, 0.3, wallM2, 0, 3.32, -0.2, scene);
    L.plane(6, 8, L.lam(L.rep(tFloor, 10, 14)), 0, 0, 1.5, scene, 0, -Math.PI / 2);
    L.plane(0.86, 0.215, L.basic(signT), 0, 2.42, -0.04, scene);
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
      // abajo: muro de fondo + bombilla tenue para que los peldanos se lean sin perder lo oscuro
      L.box(1.2, 3.2, 0.08, sideM, 0, -1.0, -4.62, scene);
      L.mesh(new THREE.SphereGeometry(0.035, 6, 4), L.basic(null, 0xffd8a0, { fog: false }), 0, -0.55, -4.54, scene);
      const low = new THREE.PointLight(0xffb070, 2.6, 4.2, 1.6); low.position.set(0, -0.6, -4.3); scene.add(low);
      const mid = new THREE.PointLight(0xffb070, 1.2, 3.0, 1.8); mid.position.set(0, 0.6, -2.2); scene.add(mid);
    } else {
      // sala detras del hueco, en penumbra (no un negro plano)
      const rM = L.lam(L.rep(kind === 'metal' ? tBlock : tPlaster, 2, 2));
      for (const s of [-1, 1]) L.box(0.08, 3, 4, rM, s * 1.5, 1.5, -2.4, scene);
      L.box(3.2, 3, 0.08, rM, 0, 1.5, -4.2, scene); L.box(3.2, 0.08, 4, L.lam(null, 0x101012), 0, 2.6, -2.4, scene);
      L.plane(3.2, 4, L.lam(L.rep(tFloor, 5, 6)), 0, 0.002, -2.4, scene, 0, -Math.PI / 2);
      const lamp = new THREE.PointLight(kind === 'metal' ? 0xb8c8ff : 0xffd8a0, 3.2, 4.5, 1.5); lamp.position.set(0.2, 2.3, -2.6); scene.add(lamp);
      if (kind === 'metal') {   // armero vacio (siluetas de rifles que ya no estan) + taquillas, una abierta
        const tRack = L.cvs(64, 32, (c) => { c.fillStyle = '#3a2a1a'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#5a4630';
          for (let x = 6; x < 64; x += 11) { c.fillRect(x, 4, 4, 24); c.fillRect(x - 1, 22, 6, 4); } c.fillStyle = '#9a9aa0'; for (let x = 7; x < 64; x += 11) c.fillRect(x, 3, 2, 2); });
        L.box(1.5, 0.8, 0.04, L.lam(tRack), -0.1, 1.45, -4.12, scene);
        const tLock = noiseTex(2311, 32, 64, '#5a6470', 14, (c) => { c.fillStyle = '#3a424c'; for (let y = 6; y < 20; y += 3) c.fillRect(8, y, 16, 1); c.fillStyle = '#2a3038'; c.fillRect(0, 0, 1, 64); c.fillRect(31, 0, 1, 64); c.fillStyle = '#9aa4b0'; c.fillRect(24, 30, 3, 6); });
        const lkM = L.lam(tLock);
        for (let i = 0; i < 3; i++) L.box(0.4, 1.8, 0.45, lkM, 1.22, 0.9, -1.4 - i * 0.48, scene).rotation.y = -Math.PI / 2;
        const dr = new THREE.Group(); dr.position.set(1.0, 0, -1.18); dr.rotation.y = 1.2; scene.add(dr); L.box(0.02, 1.7, 0.42, lkM, 0, 0.9, -0.21, dr);
      } else {   // mesa de radio: transmisor con diales, LED rojo ON AIR, grabadora
        const tTx = L.cvs(64, 32, (c) => { c.fillStyle = '#2a2e2a'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#0c120c'; c.fillRect(4, 4, 30, 12); c.fillStyle = '#3ac85a'; c.fillRect(6, 9, 26, 1); c.fillRect(18, 6, 1, 8);
          c.fillStyle = '#c8c8c0'; for (const x of [42, 52]) { c.beginPath(); c.arc(x, 10, 4, 0, 7); c.fill(); } c.fillStyle = '#ff2a1a'; c.fillRect(56, 22, 4, 4); c.fillStyle = '#888'; for (let x = 6; x < 40; x += 6) c.fillRect(x, 22, 3, 5); });
        L.box(1.5, 0.06, 0.7, L.lam(null, 0x3a2a1c), 0.2, 0.76, -3.7, scene);
        for (const [x, z] of [[-0.5, -3.4], [0.9, -3.4], [-0.5, -4.0], [0.9, -4.0]]) L.box(0.05, 0.76, 0.05, L.lam(null, 0x2a2018), x, 0.38, z, scene);
        L.mesh(new THREE.BoxGeometry(0.7, 0.45, 0.4), [lamC(0x2a2e2a), lamC(0x2a2e2a), lamC(0x34383a), lamC(0x1a1c1a), L.basic(tTx), lamC(0x2a2e2a)], 0.3, 1.02, -3.8, scene);
        L.box(0.3, 0.1, 0.2, lamC(0x1c1c20), -0.3, 0.84, -3.6, scene);
        L.plane(0.04, 0.04, L.basic(null, 0xff2a1a, { fog: false }), 0.55, 1.12, -3.59, scene);
      }
    }
    L.box(1.04, 0.03, 0.3, L.lam(null, kind === 'metal' ? 0x30343a : 0x2a1a10), 0, 0.015, -0.18, scene);
    // hoja (pivote en la bisagra)
    const hinge = new THREE.Group(); hinge.position.set(-0.52, 0, -0.06); scene.add(hinge); const levers = [];
    const fM = L.lam(tDoor), eM = L.lam(tEdge);
    L.mesh(new THREE.BoxGeometry(1.04, 2.16, kind === 'metal' ? 0.09 : 0.07), [eM, eM, eM, eM, fM, fM], 0.52, 1.08, 0, hinge);
    if (kind === 'metal') {   // manilla de palanca + cerradura
      const steel = lamC(0xa8b0bc), dark = lamC(0x22262c);
      for (const s of [1, -1]) { L.box(0.06, 0.16, 0.02, dark, 0.92, 1.02, s * 0.055, hinge);
        const lv = new THREE.Group(); lv.position.set(0.92, 1.06, s * 0.08); hinge.add(lv); L.box(0.2, 0.035, 0.035, steel, -0.08, 0, 0, lv); levers.push(lv); }
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
    // radio: placa de cerradura de laton con un trebol grabado + la llave del trebol (entra, gira, la puerta se abre)
    let keyG = null, keyM = null;
    const LOCKP = [0.92, 0.84, 0.037];
    if (kind === 'radio') {
      const tPlate = L.cvs(32, 64, (c) => {
        c.fillStyle = '#6a5018'; c.fillRect(0, 0, 32, 64); c.fillStyle = '#c09440'; c.fillRect(1, 1, 30, 62); c.fillStyle = '#e0bc68'; c.fillRect(1, 1, 30, 2); c.fillRect(1, 1, 2, 62);
        c.fillStyle = '#8a6420'; c.fillRect(1, 61, 30, 2); c.fillRect(29, 1, 2, 62);
        c.strokeStyle = '#4a3208'; c.lineWidth = 1.5; for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) { c.beginPath(); c.arc(16 + dx, 20 + dy, 4.6, 0, 7); c.stroke(); }
        c.beginPath(); c.moveTo(16, 24); c.lineTo(19, 31); c.stroke();
        c.fillStyle = '#1a1206'; c.beginPath(); c.arc(16, 42, 3.5, 0, 7); c.fill(); c.fillRect(14, 42, 4, 10);
        c.fillStyle = '#4a3208'; for (const [x, y] of [[16, 5], [16, 59]]) c.fillRect(x - 1, y - 1, 3, 3);
      });
      L.plane(0.07, 0.14, L.basic(tPlate), LOCKP[0], LOCKP[1], LOCKP[2], hinge);
      keyG = new THREE.Group(); keyG.position.set(LOCKP[0], LOCKP[1] - 0.0175, LOCKP[2] + 0.001); hinge.add(keyG);   // en el ojo de la cerradura
      keyM = makeKey(); keyM.scale.setScalar(0.095); keyM.rotation.set(0, Math.PI / 2, 0); keyG.add(keyM);
    }
    const deep = kind === 'wood';
    const CLOSE = [V3(0.53, 0.9, 0.2), V3(0.4, 0.82, -0.02)], FAR = [V3(0.02, 1.1, 2.6), V3(0.0, 1.06, -1.0)];
    return {
      scene, camera: cam,
      update(lt) {
        const q = L.q15(lt), t = d.t0 + q, u = L.smooth(lt / d.dur);
        if (deep) {   // entra por la puerta y baja la vista a la escalera
          const u2 = ease(0.55, 1.0, lt / d.dur);
          cam.position.set(0.02, 1.12 - 0.05 * u - 0.25 * u2, 3.6 - 3.0 * u - 1.2 * u2);
          cam.lookAt(0.0, 1.06 - 1.6 * u2, -1.0 - 1.4 * u2);
          scene.fog.near = 3.4 - 2.8 * u2; scene.fog.far = 7.5 - 4.9 * u2;   // la escalera se hunde en el negro
        } else if (kind === 'metal') {   // empuje lento hasta el umbral
          cam.position.set(0.02, 1.12 - 0.06 * u, 3.6 - 2.5 * u); cam.lookAt(0.0, 1.06, -1.0);
          for (const lv of levers) lv.rotation.z = 0.55 * (ease(d.latch, d.latch + 0.1, t) - ease(d.open0 + 0.25, d.open0 + 0.5, t));
        } else {   // radio: primer plano de la cerradura, llave entra y gira, la camara se aleja y la puerta se abre
          const k = ease(d.back0, d.open1, t), push = 0.04 * L.clamp01(lt / Math.max(0.3, d.back0 - d.t0));
          cam.position.copy(CLOSE[0]).lerp(FAR[0], k); cam.position.z -= push * (1 - k);
          cam.lookAt(CLOSE[1].clone().lerp(FAR[1], k));
          keyG.visible = t >= d.ins0 - 0.02;
          keyM.position.z = 0.12 * (1 - ease(d.ins0, d.ins1, t)) - 0.02;
          keyG.rotation.z = -Math.PI / 2 * ease(d.turn0, d.turn1, t);
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
        bitText(c, 'WATER COOLER', J32.x + J32.w / 2, 64, 2, t >= p.water ? '#c8ccd8' : '#3a3e52', { outline: null });
        bitText(c, 'TOILET TANKS', 401, 64, 2, t >= p.four ? '#c8ccd8' : '#3a3e52', { outline: null });
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
      bitText(c, 'POLICE', 330, 198, 2, '#8aa0d0', { outline: null });
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
        bitText(c, 'CITY POLICE DEPARTMENT', LW / 2, 28 + dy, 2, INK, { outline: null });
        bitText(c, 'DUTY LOG — NIGHT SHIFT', LW / 2, 56 + dy, 3, INK, { outline: null });
        bitText(c, 'OCT 28   20:00 - 06:00', LW / 2, 85 + dy, 2, '#5a4a34', { outline: null });
        rect(c, PXL + 14, 96 + dy, PW - 28, 1, INK);
        left(c, 'OFFICER', XN, 107 + dy, 2, INK); left(c, 'UNIT', XU, 107 + dy, 2, INK);
        const stOn = t >= p.status;
        left(c, 'STATUS', XS, 107 + dy, 2, stOn ? '#a81810' : INK);
        if (stOn) rect(c, XS - 2, 114 + dy, Math.round((textWidth('STATUS', 2) + 4) * ease(p.status, p.status + 0.15, t)), 2, '#a81810');
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
          const ts = p.lost + i * p.gap; if (t < ts) return;
          const u = L.clamp01((t - ts) / 0.06), s = 1.7 - 0.7 * u, rot = [-0.06, 0.05, -0.03, 0.07, -0.05, 0.04][i];
          c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.translate(XS + 34, y + [0, 1, -1, 1, 0, -1][i]); c.rotate(rot); c.scale(s, s);
          c.drawImage(stamp, -33, -12); c.restore();
        });
        if (t >= p.every + 6 * ROW_GAP) { left(c, 'Watch Cmdr.', XN, 272 + dy, 2, '#4a3a26'); SHhand(c, 'M. Harlan', XN + 100, 278 + dy, 2.6, '#3a2a60', 1, 56, 2); }
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
        if (t >= p.follow) { const s = pop(t, p.follow); bitText(c, 'SUBSCRIBE!', LW / 2, 312 - 3 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); }
      },
    };
  }

  // ==================== ronda 2: diagramas nuevos ====================
  const Sscreen = (draw) => { const cv = document.createElement('canvas'); cv.width = LW; cv.height = LH; const c = cv.getContext('2d'); bgGrad(c); titleBar(c); if (draw) draw(c); return cv; };
  const Sflat = () => { const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070e); return [scene, new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10)]; };
  const DROP = (() => { const cv = document.createElement('canvas'); cv.width = 20; cv.height = 28; const c = cv.getContext('2d');
    c.fillStyle = '#0a1a40'; c.beginPath(); c.moveTo(10, 0); c.bezierCurveTo(12, 8, 20, 13, 20, 19); c.arc(10, 18, 10, 0.1, Math.PI - 0.1); c.bezierCurveTo(0, 13, 8, 8, 10, 0); c.fill();
    c.fillStyle = '#3c9cff'; c.beginPath(); c.moveTo(10, 2); c.bezierCurveTo(12, 9, 18, 13, 18, 19); c.arc(10, 18, 8, 0.1, Math.PI - 0.1); c.bezierCurveTo(2, 13, 8, 9, 10, 2); c.fill();
    c.fillStyle = '#c8e8ff'; c.fillRect(5, 16, 2, 5); c.fillRect(6, 13, 2, 2); return cv; })();
  const Sblink = (t, t0, hz = 3) => t >= t0 && Math.floor((t - t0) * hz * 2) % 2 === 0;
  const Sdash = (c, x0, y0, x1, y1, col, on = 5, off = 4, ph = 0, wd = 2) => {
    const L2 = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L2, uy = (y1 - y0) / L2; c.fillStyle = col;
    for (let s = -((ph % (on + off)) + (on + off)) % (on + off); s < L2; s += on + off) { const a = Math.max(0, s), b = Math.min(L2, s + on); if (b <= a) continue;
      for (let d = a; d < b; d += 1) c.fillRect(Math.round(x0 + ux * d) - (wd >> 1), Math.round(y0 + uy * d) - (wd >> 1), wd, wd); }
  };

  // ---------- 36e: RULE OF THREES ----------
  function shot36e() {
    const p = P.s36e, [scene, cam] = Sflat();
    const CW = [[40, 50, 270, 156], [330, 50, 270, 156]];
    const bg = Sscreen((c) => { for (const [x, y, w, h] of CW) { bevel(c, x, y, w, h); inset(c, x + 5, y + 5, w - 10, h - 10, '#040812'); } bevel(c, 40, 214, 560, 70); inset(c, 45, 219, 550, 60, '#040812'); });
    const DX = 160, D0 = 150, DPX = 400 / 21;   // eje de dias
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.drawImage(bg, 0, 0); c.imageSmoothingEnabled = false;
        if (t >= p.rule) { left(c, 'RULE OF THREES', 26, 23, 2, '#9cf09c', { outline: null }); right(c, 'SURVIVAL', 612, 23, 2, '#c8ccd8'); }
        const card = (i, t3, tu, unit, ti, tw, what, col) => {
          const [x, y, w] = CW[i], cx = x + w / 2;
          if (t >= p.threes && t < t3) bitText(c, '?', cx, y + 74, 3, '#2a3450', { outline: null });
          if (t >= ti) { const s = pop(t, ti); if (i === 0) blit(c, DROP, x + 52, y + 74, Math.round(3 * s)); else Sdraw(c, ICON.candy, x + 50, y + 74, 0.7 * s); }
          if (t >= t3) { const s = pop(t, t3); bitText(c, '3', cx + 24 - (t >= tu ? 30 : 0), y + 70 - 3 * (s - 1), 3, col, { outline: '#000000' }); }
          if (t >= tu) left(c, unit, cx + 14, y + 70, 3, mixHex('#000000', col, fadeIn(t, tu, 0.1)), { outline: '#000000' });
          if (t >= tw) bitText(c, what, cx, y + 126, 2, mixHex('#000000', '#ececec', fadeIn(t, tw, 0.12)), { outline: '#000000' });
        };
        card(0, p.three1, p.days, 'DAYS', p.water, p.water, 'WITHOUT WATER', '#4fb4ff');
        card(1, p.three2, p.weeks, 'WEEKS', p.food, p.food, 'WITHOUT FOOD', '#ffd23f');
        // eje de dias a escala: 3 dias vs 21 dias
        if (t >= p.days) {
          left(c, 'DAYS', 52, 238, 2, '#8a90a8', { outline: null });
          for (let d = 0; d <= 21; d += 7) { const x = Math.round(DX + d * DPX); rect(c, x, 230, 1, 44, '#1a2440'); bitText(c, String(d), x, 226 + 50, 1, '#6a7290', { outline: null }); }
          const g1 = ease(p.days, p.days + 0.35, t), w1 = Math.round(3 * DPX * g1);
          rect(c, DX, 238, w1, 12, '#3c9cff'); rect(c, DX, 238, w1, 2, '#c8e8ff'); blit(c, DROP, DX - 30, 244, 1);
          if (t >= p.weeks) { const g2 = ease(p.weeks, p.weeks + 0.5, t), w2 = Math.round(21 * DPX * g2); rect(c, DX, 256, w2, 12, '#e8b018'); rect(c, DX, 256, w2, 2, '#fff0a0'); Sdraw(c, ICON.candy, DX - 30, 262, 0.3); }
        }
        // el agua primero: marco amarillo + 1st
        const tf = p.foodE + 0.05;
        if (t >= tf) { const [x, y, w, h] = CW[0], col = Sblink(t, tf, 2) ? '#ffe048' : '#b08418'; c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);
          const s = pop(t, tf); bitText(c, '1ST', x + w - 30, y + 24 - 3 * (s - 1), 3, '#ffe048', { outline: '#000000' }); }
      } };
  }

  // ---------- 43c: torre de telefonia saturada; el SMS pasa ----------
  function shot43() {
    const p = P.s43, [scene, cam] = Sflat(), R = L.rng(4343);
    const TW = [320, 96], PH = [86, 168], MOM = [586, 84];
    const HOUSES = [[452, 128], [500, 168], [548, 140], [470, 214], [530, 232], [596, 196], [440, 260], [508, 96], [560, 276], [606, 140], [418, 176], [590, 250], [452, 84], [540, 196]];
    const house = (c, x, y, col, roof = '#4a5068') => { rect(c, x - 9, y - 6, 18, 12, col); c.fillStyle = roof; for (let i = 0; i < 10; i++) c.fillRect(x - 10 + i, y - 7 - i * 0.7 | 0, 21 - 2 * i, 1); rect(c, x - 2, y, 4, 6, '#0a0e18'); };
    const bg = Sscreen((c) => {
      inset(c, 14, 42, 612, 244, '#060a18');
      // torre de celosia
      const top = TW[1], bot = 236; c.fillStyle = '#8a90a8';
      Sthick(c, [[TW[0] - 26, bot], [TW[0], top]], '#8a90a8', 2); Sthick(c, [[TW[0] + 26, bot], [TW[0], top]], '#8a90a8', 2);
      for (let y = top + 16; y < bot; y += 18) { const k = (y - top) / (bot - top), hw = 26 * k; Sline(c, TW[0] - hw, y, TW[0] + hw * 0.8, y + 18, '#5a6078'); Sline(c, TW[0] + hw, y, TW[0] - hw * 0.8, y + 18, '#5a6078'); }
      for (const s of [-1, 1]) rect(c, TW[0] + s * 12 - 2, top - 2, 5, 16, '#c8ccd8');
      bitText(c, 'CELL TOWER', TW[0], 252, 2, '#8a90a8', { outline: null });
      for (const [x, y] of HOUSES) house(c, x, y, '#2a3450');
      house(c, MOM[0], MOM[1], '#3a4a2a', '#5a6a40');
    });
    const phone = (c, x, y) => { rect(c, x - 12, y - 22, 24, 44, '#0c0e14'); rect(c, x - 11, y - 21, 22, 42, '#2a2e3a'); rect(c, x - 8, y - 16, 16, 26, '#1c3a6a'); rect(c, x - 3, y + 14, 6, 3, '#5a6078'); };
    const path = [[PH[0] + 14, PH[1] - 12], [TW[0], TW[1] + 4], [MOM[0] - 10, MOM[1] - 4]];
    const along = (k) => { const a = path[0], b = path[1], d = path[2], l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(d[0] - b[0], d[1] - b[1]), s = k * (l1 + l2);
      return s < l1 ? [a[0] + (b[0] - a[0]) * s / l1, a[1] + (b[1] - a[1]) * s / l1] : [b[0] + (d[0] - b[0]) * (s - l1) / l2, b[1] + (d[1] - b[1]) * (s - l1) / l2]; };
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt, q = L.q15(lt); c.drawImage(bg, 0, 0);
        left(c, 'PHONE NETWORK', 26, 23, 2, '#9cf09c', { outline: null }); right(c, '12:00 AM', 612, 23, 2, '#c8ccd8');
        // lineas de la ciudad: 3 al principio, todas en 'city'
        const busy = t >= p.busy;
        HOUSES.forEach(([x, y], i) => {
          const ti = i < 3 ? p.t0 : p.city + (i - 3) * 0.04; if (t < ti) return;
          Sdash(c, x, y - 8, TW[0] + 4, TW[1] + 8, busy ? '#d02a1e' : '#4a5068', 4, 3, q * 30 + i * 3, busy ? 2 : 1);
          if (busy && i >= 3) { const s = pop(t, ti); bitText(c, '!', x, y - 17 - 2 * (s - 1), 2, '#ff4030', { outline: '#000000' }); }
        });
        phone(c, PH[0], PH[1]); bitText(c, 'YOU', PH[0], PH[1] + 38, 2, '#4fd6ff', { outline: '#000000' });
        bitText(c, 'MOM', MOM[0], MOM[1] + 19, 2, '#b8e070', { outline: '#000000' });
        // tu llamada
        if (t >= p.call) {
          Sdash(c, path[0][0], path[0][1], path[1][0], path[1][1], busy ? '#ff4030' : '#ffd23f', 6, 4, q * 40, 3);
          if (!busy) left(c, 'CALLING...', PH[0] - 34, PH[1] - 42, 2, '#ffd23f', { outline: '#000000' });
          if (t >= p.rings && !busy) for (let k = 0; k < 2; k++) { const r = 18 + ((q - (p.rings - p.t0)) * 40 + k * 10) % 20; c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.beginPath(); c.arc(PH[0], PH[1] - 6, r, -0.9, 0.9); c.stroke(); }
        }
        if (busy) {
          const s = pop(t, p.busy), mx = (path[0][0] + path[1][0]) / 2, my = (path[0][1] + path[1][1]) / 2;
          Sthick(c, [[mx - 8, my - 8], [mx + 8, my + 8]], '#ff4030', 3); Sthick(c, [[mx - 8, my + 8], [mx + 8, my - 8]], '#ff4030', 3);
          bitText(c, 'BUSY', PH[0], PH[1] - 44 - 3 * (s - 1), 3, '#ff4030', { outline: '#000000' });
          if (Sblink(t, p.busy, 2)) { rect(c, TW[0] - 3, TW[1] - 10, 7, 7, '#ff4030'); }
          bitText(c, 'NETWORK FULL', TW[0], 66, 2, Sblink(t, p.busy, 1.5) ? '#ff4030' : '#a02018', { outline: '#000000' });
        }
        if (t >= p.city) { const k = fadeIn(t, p.city, 0.15); bitText(c, 'WHOLE CITY CALLING', 520, 54, 2, mixHex('#000000', '#ff8070', k), { outline: '#000000' }); }
        // el SMS: canal fino verde + sobre que viaja
        if (t >= p.text) {
          const k = ease(p.text, p.text + 1.3, t); c.globalAlpha = 0.9;
          Sdash(c, path[0][0], path[0][1] + 8, path[1][0] + 2, path[1][1] + 12, '#40e040', 2, 2, 0, 1); Sdash(c, path[1][0] + 2, path[1][1] + 12, path[2][0], path[2][1] + 8, '#40e040', 2, 2, 0, 1); c.globalAlpha = 1;
          const [ex, ey] = along(k); rect(c, Math.round(ex) - 8, Math.round(ey) + 2, 16, 11, '#0c2a0c'); rect(c, Math.round(ex) - 7, Math.round(ey) + 3, 14, 9, '#62f05a');
          Sline(c, ex - 7, ey + 3, ex, ey + 8, '#0c2a0c'); Sline(c, ex + 7, ey + 3, ex, ey + 8, '#0c2a0c');
          left(c, 'TEXT', PH[0] + 18, PH[1] + 4, 2, '#62f05a', { outline: '#000000' });
          if (k >= 1) { Scheck(c, MOM[0] - 24, MOM[1], 6, '#62f05a', ease(p.text + 1.3, p.text + 1.5, t)); }
        }
        // FCC
        if (t >= p.fcc) { const s = pop(t, p.fcc); bevel(c, 24, 48, 190, 52, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 28, 52, 182, 44, '#04060e');
          bitText(c, 'FCC', 60, 74 - 2 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); left(c, 'A TEXT CAN', 96, 65, 2, '#ececec', { outline: null }); left(c, 'GET THROUGH', 96, 83, 2, '#62f05a', { outline: null }); }
        // ancho de banda: llamada vs texto
        if (t >= p.call2) {
          const g = ease(p.call2, p.call2 + 0.3, t); left(c, 'CALL', 30, 252, 2, '#ff8070', { outline: '#000000' }); rect(c, 82, 245, Math.round(180 * g), 13, '#d02a1e'); rect(c, 82, 245, Math.round(180 * g), 2, '#ff9a8a');
          if (t >= p.less) { left(c, 'TEXT', 30, 272, 2, '#62f05a', { outline: '#000000' }); const g2 = ease(p.less, p.less + 0.15, t); rect(c, 82, 266, Math.max(1, Math.round(6 * g2)), 13, '#40e040');
            if (t >= p.network) left(c, 'WAY LESS NETWORK', 96, 272, 2, mixHex('#000000', '#62f05a', fadeIn(t, p.network, 0.12)), { outline: '#000000' }); }
        }
      } };
  }

  // ---------- 48e: sonido en acero vs aire ----------
  function shot48e() {
    const p = P.s48e, [scene, cam] = Sflat();
    const BX = 130, BW = 470, k = BW / 19550;   // pies/s (unidades US)
    const bg = Sscreen((c) => { bevel(c, 14, 44, 612, 140); inset(c, 19, 49, 602, 130, '#040812'); bevel(c, 14, 190, 612, 96); inset(c, 19, 195, 602, 86, '#060a14'); });
    const BARS = [40, 52, 64, 76, 88, 100];
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt, q = L.q15(lt); c.drawImage(bg, 0, 0);
        left(c, 'SPEED OF SOUND', 26, 23, 2, '#9cf09c', { outline: null }); right(c, 'FEET / SECOND', 612, 23, 2, '#c8ccd8');
        const row = (y, label, tl, tv, v, txt, col, hi) => {
          if (t < tl) return; left(c, label, 32, y, 2, mixHex('#000000', '#ececec', fadeIn(t, tl, 0.1)), { outline: '#000000' });
          if (t < tv) return; const g = ease(tv, tv + (v > 1000 ? 0.45 : 0.15), t), w = Math.max(2, Math.round(v * k * g));
          rect(c, BX, y - 11, w, 22, col); rect(c, BX, y - 11, w, 2, hi); rect(c, BX + w - 2, y - 11, 2, 22, '#00000080');
          const tx = txt, tw2 = textWidth(tx, 2); if (w > tw2 + 20) right(c, tx, BX + w - 8, y, 2, '#ffffff', { outline: '#000000' }); else left(c, tx, BX + w + 8, y, 2, '#ffffff', { outline: '#000000' });
        };
        row(86, 'STEEL', p.sound, p.steel, 19550, '~19,550 ft/s', '#8a9ab8', '#d8e4ff');
        row(146, 'AIR', p.sound, p.air, 1125, '1,125 ft/s', '#4fb4ff', '#c8e8ff');
        if (t >= p.fifteen) { const s = pop(t, p.fifteen); bitText(c, '>15x FASTER', 440, 146 - 3 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); }
        // celda: barrotes de acero en un corte del edificio
        bitText(c, 'CELL 3', 78, 205, 2, '#8a90a8', { outline: null });
        const hit = t >= p.hits ? Math.max(0, 1 - (t - p.hits) / 0.4) : 0, shake = hit > 0 ? Math.round(Math.sin(q * 60) * 2 * hit) : 0;
        rect(c, 30, 214, 96, 3, '#6a7290'); rect(c, 30, 272, 96, 3, '#6a7290');
        for (const x of BARS) rect(c, x + shake, 216, 4, 56, hit > 0.4 ? '#ffffff' : '#9aa4b8');
        // planta del edificio: tabiques y pasillos
        c.fillStyle = '#2a3450'; for (const x of [160, 260, 360, 460, 560]) c.fillRect(x, 204, 2, 72); c.fillRect(140, 204, 474, 2); c.fillRect(140, 274, 474, 2);
        if (t >= p.hits) { const s = pop(t, p.hits); bitText(c, 'CLANG!', 214, 230 - 3 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); }
        // anillos: el edificio entero suena
        if (t >= p.rings) {
          c.save(); c.beginPath(); c.rect(19, 195, 602, 86); c.clip();
          for (let i = 0; i < 5; i++) { const r = ((t - p.rings) * 520 - i * 70); if (r < 4) continue; c.strokeStyle = `rgba(255,210,63,${Math.max(0, 1 - r / 600)})`; c.lineWidth = 2; c.beginPath(); c.arc(72, 244, r, -1.2, 1.2); c.stroke(); }
          c.restore();
          const s = pop(t, p.rings); bitText(c, 'THE WHOLE BUILDING RINGS', 420, 252 - 3 * (s - 1), 2, '#ffd23f', { outline: '#000000' });
        }
      } };
  }

  // ---------- 48m: FILE nota manuscrita del sargento ----------
  function shot48m() {
    const p = P.s48m, scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); const cam = new THREE.PerspectiveCamera(45, LW / LH, 0.05, 10);
    const NX = 110, NY = 18, NW = 420, NH = 258, R = L.rng(4949);
    const paper = document.createElement('canvas'); paper.width = NW; paper.height = NH;
    { const c = paper.getContext('2d'), img = c.createImageData(NW, NH);
      for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) {
        const e = Math.min(x, y, NW - 1 - x, NH - 1 - y), edge = e < 8 ? (8 - e) * 5 : 0, n = (R() - 0.5) * 14, fold = Math.abs(y - NH / 2) < 1 ? -26 : Math.abs(y - NH / 2) < 3 ? -8 : 0, i = (y * NW + x) * 4;
        img.data[i] = 226 + n - edge + fold; img.data[i + 1] = 214 + n - edge * 1.2 + fold; img.data[i + 2] = 176 + n - edge * 1.6 + fold; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0); c.fillStyle = 'rgba(70,90,150,0.25)'; for (let y = 54; y < NH - 10; y += 34) c.fillRect(16, y, NW - 32, 1);
      c.fillStyle = 'rgba(160,40,30,0.3)'; c.fillRect(48, 0, 1, NH);
      // perforaciones de archivador: solo en el margen izquierdo (antes de la raya roja), nunca sobre el texto
      for (const hy of [44, NH - 44]) { c.fillStyle = 'rgba(120,100,70,0.6)'; c.beginPath(); c.arc(24, hy + 1, 9, 0, 6.3); c.fill(); c.fillStyle = '#000000'; c.beginPath(); c.arc(24, hy, 8, 0, 6.3); c.fill(); } }
    const INKC = '#1e2a78';
    // letra a mano propia (SHhand), linea base sobre las rayas de la hoja (54 + 34 k). [texto, x, base, unidad, t0, t1, seed]
    const LINES = [['Set the evidence locker', 62, 88, 3.6, p.set, p.locker + 0.3, 11], ['to match the broadcast.', 62, 122, 3.6, p.match, p.broadcast + 0.35, 12],
      ['DAYS', 64, 190, 4.4, p.d1, p.d1 + 0.22, 13], ['- RULES', 0, 190, 4.4, p.rules, p.rules + 0.25, 14], ['- DAYS.', 0, 190, 4.4, p.d2, p.d2 + 0.22, 15],
      ['— Sgt. M. Harlan', 0, 232, 3.4, p.d2 + 0.25, p.d2 + 0.6, 16]];
    // la linea clave se encoge para dejar margen claro (>= 36 px) al borde derecho de la hoja
    const UD = 4.4 * Math.min(1, (NW - 36 - 64) / ([2, 3, 4].reduce((w, i) => w + SHwidth(LINES[i][0], 4.4), 0) + 2 * 4.4 * 2.6));
    { let x = 64; for (const i of [2, 3, 4]) { LINES[i][3] = UD; LINES[i][1] = x; x += SHwidth(LINES[i][0], UD) + UD * 2.6; } LINES[5][1] = NW - 40 - SHwidth(LINES[5][0], 3.4); }
    const ULW = LINES[4][1] + SHwidth(LINES[4][0], UD) - 60;
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.imageSmoothingEnabled = false;
        bevel(c, 8, 12, 70, 26, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 12, 16, 62, 18, '#04060e'); bitText(c, 'FILE', 43, 25, 2, '#9cf09c', { outline: null });
        if (t >= p.note) { const k = fadeIn(t, p.note, 0.12); bitText(c, "SERGEANT'S", 574, 70, 2, mixHex('#000000', '#c8ccd8', k), { outline: null }); bitText(c, 'NOTE', 574, 90, 2, mixHex('#000000', '#c8ccd8', k), { outline: null }); }
        const dy = Math.round(14 * (1 - ease(0, 0.3, lt)));
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(NX + 5, NY + 5 + dy, NW, NH); c.drawImage(paper, NX, NY + dy);
        for (const [s, x, y, u, ta, tb, seed] of LINES) {
          if (t < ta) continue; const k = L.clamp01((L.q15(t - ta) + 1 / 15) / Math.max(0.1, tb - ta));
          SHhand(c, s, NX + x, NY + y + dy, u, INKC, k, seed, u > 3.6 ? 3 : 2);
        }
        // subrayado de la clave (rojo, a mano)
        if (t >= p.d2 + 0.25) { const k = ease(p.d2 + 0.25, p.d2 + 0.45, t); Sthick(c, [[NX + 62, NY + 200 + dy], [NX + 62 + ULW * k, NY + 197 + dy]], '#a81810', 2); }
      } };
  }

  // ---------- 48n: puzle RE — taquilla de pruebas, 3 rodillos 7-3-7 ----------
  function shot48n() {
    const p = P.s48n, [scene, cam] = Sflat();
    const FW = 300, FH = 236, FX = 170, FY = 44;
    const ROLL = [[p.seven1, 7], [p.three, 3], [p.seven2, 7]].map(([tw, v]) => ({ t0: tw - 0.16, t1: tw + 0.1, v, tw }));
    const digit = (i, t) => { const r = ROLL[i]; if (t < r.t0) return 0; return r.v * ease(r.t0, r.t1, t); };
    const front = document.createElement('canvas'); front.width = FW; front.height = FH; const fc = front.getContext('2d');
    const steel = (() => { const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; const c = cv.getContext('2d'), r = L.rng(4848), img = c.createImageData(FW, FH);
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const n = (r() - 0.5) * 12 + Math.sin(x * 0.7) * 2, i = (y * FW + x) * 4; img.data[i] = 84 + n; img.data[i + 1] = 92 + n; img.data[i + 2] = 104 + n; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0); rect(c, 0, 0, FW, 2, '#b4bccc'); rect(c, 0, 0, 2, FH, '#b4bccc'); rect(c, 0, FH - 2, FW, 2, '#1a1e26'); rect(c, FW - 2, 0, 2, FH, '#1a1e26');
      c.fillStyle = '#c8ccd8'; for (const [x, y] of [[10, 10], [FW - 12, 10], [10, FH - 12], [FW - 12, FH - 12]]) { c.fillRect(x, y, 3, 3); }
      for (let y = 168; y < 220; y += 6) rect(c, 40, y, 220, 2, '#3a404c');   // rejilla de ventilacion
      rect(c, 86, 14, 128, 24, '#2a1a12'); rect(c, 87, 15, 126, 22, '#d8cfa8'); bitText(c, 'EVIDENCE', 150, 26, 2, '#5a1208', { outline: null });
      rect(c, FW - 34, 100, 14, 44, '#2a2e36'); rect(c, FW - 32, 102, 10, 40, '#a8b0bc');   // tirador
      return cv; })();
    const drawFront = (t) => {
      const c = fc; c.drawImage(steel, 0, 0);
      bevel(c, 50, 54, 200, 96, '#3c4050', '#9aa0b4', '#14161c');
      for (let i = 0; i < 3; i++) {
        const x = 62 + i * 62, y = 62, w = 52, h = 80, d = digit(i, t), base = Math.floor(d), fr = d - base;
        inset(c, x, y, w, h, '#0c0c10'); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        for (let k = -1; k <= 2; k++) { const v = ((base + k) % 10 + 10) % 10, yy = y + h / 2 + (k - fr) * 44; rect(c, x + 3, yy - 20, w - 6, 40, '#e8e4d8'); bitText(c, String(v), x + w / 2, yy, 3, '#141414', { outline: null }); }
        const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); c.fillStyle = g; c.fillRect(x, y, w, h);
        c.restore();
        const done = t >= ROLL[i].t1; if (done && t >= p.seven2 + 0.12) { c.strokeStyle = '#62f05a'; c.lineWidth = 2; c.strokeRect(x - 2, y - 2, w + 4, h + 4); }
      }
    };
    const memo = (c, x, y, title, lines) => { bevel(c, x, y, 152, 28 + lines.length * 20, '#2c3040', '#7a8094', '#0c0e14'); inset(c, x + 4, y + 4, 144, 20 + lines.length * 20, '#04060e');
      bitText(c, title, x + 76, y + 14, 2, '#8a90a8', { outline: null }); rect(c, x + 10, y + 24, 132, 1, '#2a3450'); lines.forEach(([s, col], i) => bitText(c, s, x + 76, y + 37 + i * 20, 2, col, { outline: '#000000' })); };
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.imageSmoothingEnabled = false;
        bgGrad(c); titleBar(c); left(c, 'EVIDENCE LOCKER', 26, 23, 2, '#9cf09c', { outline: null }); right(c, 'ENTER CODE', 612, 23, 2, '#c8ccd8');
        // memoria del jugador: la emision de la radio y la nota (la pista es justa)
        const cur = t >= p.seven2 ? 2 : t >= p.three ? 1 : t >= p.seven1 ? 0 : -1, hl = (on) => (on ? '#ffe048' : '#8a8e9a');
        memo(c, 10, 50, 'RADIO (9:15 PM)', [['HELP ARRIVES', '#c8ccd8'], ['IN 7 DAYS', hl(cur === 0 || cur === 2)], ['3 RULES', hl(cur === 1)]]);
        memo(c, 10, 164, "SGT'S NOTE", [['DAYS - RULES', '#c8ccd8'], ['- DAYS', '#c8ccd8']]);
        // hueco de la taquilla (detras de la puerta): balda y la llave del trebol
        rect(c, FX, FY, FW, FH, '#07080c'); rect(c, FX + 10, FY + 150, FW - 20, 4, '#2a2e36'); Sdraw(c, ICON.key, FX + 150, FY + 138, 0.6);
        // puerta: se abre en 'Click' (bisagra a la izquierda, perspectiva por cizalla)
        drawFront(t); const ang = 1.35 * ease(p.click, p.click + 0.45, t), cs = Math.cos(ang), sn = Math.sin(ang);
        c.save(); c.translate(FX, FY); c.transform(Math.max(0.02, cs), -0.22 * sn, 0, 1, 0, 0); c.drawImage(front, 0, 0); c.restore();
        // cursor de rodillo (flechas)
        if (t < p.click) { const i = Math.max(0, cur < 0 ? 0 : t >= ROLL[cur].t1 && cur < 2 ? cur + 1 : cur), x = FX + 62 + i * 62 + 26, col = Sblink(t, p.t0, 2) ? '#ffe048' : '#b08418';
          c.fillStyle = col; for (let k = 0; k < 7; k++) { c.fillRect(x - 7 + k, FY + 50 - k, 15 - 2 * k, 1); c.fillRect(x - 7 + k, FY + 154 + k, 15 - 2 * k, 1); } }
        if (t >= p.click) { const s = pop(t, p.click); bitText(c, 'CLICK', 560, 150 - 4 * (s - 1), 3, '#ffe048', { outline: '#000000' }); }
      } };
  }

  // ---------- 48q: 24 h despierto = BAC 0.10 % ----------
  function shot48q() {
    const p = P.s48q, [scene, cam] = Sflat();
    const CX0 = 380, CX1 = 600, Y0 = 250, Y1 = 92, yOf = (b) => Math.round(Y0 - (b / 0.12) * (Y0 - Y1));
    const bg = Sscreen((c) => { bevel(c, 14, 44, 270, 242); inset(c, 19, 49, 260, 232, '#040812'); bevel(c, 300, 44, 326, 242); inset(c, 305, 49, 316, 232, '#040812'); });
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt; c.drawImage(bg, 0, 0);
        left(c, 'NO SLEEP', 26, 23, 2, '#9cf09c', { outline: null }); right(c, 'BLOOD ALCOHOL (BAC)', 612, 23, 2, '#c8ccd8');
        // reloj de 24 h
        const cx = 150, cy = 140, r = 62, g = ease(p.awake, p.h24 + 0.35, t);
        c.fillStyle = '#0c1430'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
        if (g > 0) { c.fillStyle = '#6a2a9a'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r - 3, -Math.PI / 2, -Math.PI / 2 + g * 2 * Math.PI); c.closePath(); c.fill(); }
        c.strokeStyle = '#c8ccd8'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
        for (let h = 0; h < 24; h++) { const an = h / 24 * 6.283 - 1.5708, l = h % 6 ? 4 : 9; Sline(c, cx + Math.cos(an) * (r - l), cy + Math.sin(an) * (r - l), cx + Math.cos(an) * (r - 1), cy + Math.sin(an) * (r - 1), '#c8ccd8'); }
        { const an = g * 6.283 - 1.5708; Sthick(c, [[cx, cy], [cx + Math.cos(an) * (r - 12), cy + Math.sin(an) * (r - 12)]], '#ffd23f', 3); }
        if (t >= p.h24) { const s = pop(t, p.h24); bitText(c, '24 H AWAKE', cx, 236 - 3 * (s - 1), 3, '#ffd23f', { outline: '#000000' }); }
        if (t >= p.impaired) { const k = fadeIn(t, p.impaired, 0.12); bitText(c, '=', 292, 150, 3, mixHex('#000000', '#ececec', k), { outline: '#000000' }); }
        // grafico BAC
        for (let b = 0; b <= 0.12001; b += 0.02) { const y = yOf(b); rect(c, CX0 - 6, y, CX1 - CX0 + 6, 1, b ? '#16203a' : '#8a90a8'); right(c, b.toFixed(2), CX0 - 10, y, 1, '#6a7290', { outline: null }); }
        const BXa = 440, BWa = 90;
        if (t >= p.alcohol) { const k = fadeIn(t, p.alcohol, 0.12); bitText(c, 'BLOOD ALCOHOL', BXa + BWa / 2, 268, 2, mixHex('#000000', '#ececec', k), { outline: null }); }
        if (t >= p.point) {
          const gb = ease(p.point, p.oh, t), b = 0.1 * gb, y = yOf(b), over = t >= p.limit;
          rect(c, BXa, y, BWa, Y0 - y, '#c8a040'); rect(c, BXa, y, BWa, 2, '#ffe8a0');
          if (over) { const y8 = yOf(0.08); rect(c, BXa, y, BWa, y8 - y, Sblink(t, p.limit, 2) ? '#ff4030' : '#c41c16'); }
          bitText(c, (gb >= 1 ? '0.10' : (Math.floor(b * 100 + 1e-6) / 100).toFixed(2)) + '%', BXa + BWa / 2, y - 18, 3, over ? '#ff4030' : '#ffd23f', { outline: '#000000' });
        }
        if (t >= p.legal) { const k = ease(p.legal, p.legal + 0.2, t), y = yOf(0.08); c.fillStyle = '#ff4030'; for (let x = CX0; x < CX0 + (CX1 - CX0) * k; x += 8) c.fillRect(x, y - 1, 5, 3);
          if (k >= 1) { bitText(c, 'LEGAL', 577, y - 25, 2, '#ff8070', { outline: '#000000' }); bitText(c, 'LIMIT', 577, y - 10, 2, '#ff8070', { outline: '#000000' }); bitText(c, '0.08', 577, y + 13, 2, '#ff4030', { outline: '#000000' }); } }
        if (t >= p.limit) { const s = pop(t, p.limit); bitText(c, 'OVER', BXa - 30, yOf(0.09) - 3 * (s - 1), 2, '#ff4030', { outline: '#000000' }); }
        if (t >= p.cdc) { const s = pop(t, p.cdc); bevel(c, 190, 54, 84, 28, '#2c3040', '#7a8094', '#0c0e14'); bitText(c, 'CDC', 232, 68 - 2 * (s - 1), 2, '#ffffff', { outline: '#000000' }); }
      } };
  }

  // ---------- 49b: MAPA RE2 de la comisaria ----------
  function shot49() {
    const p = P.s49, [scene, cam] = Sflat();
    const PX = (i) => 10 + i * 157, PY = 38, PWm = 150, PHm = 210;
    const FLOORS = ['1F', '2F', '3F', 'ROOF'];
    // salas [x, y, w, h, etiqueta] en coordenadas del panel (zona 6..144 x 26..204)
    const ROOMS = [
      [[42, 140, 66, 60, 'LOBBY'], [8, 100, 34, 40], [108, 100, 34, 40], [42, 104, 66, 32], [8, 58, 34, 38, 'K-9'], [108, 58, 34, 38], [42, 30, 66, 30, 'CELLS'], [56, 62, 38, 38], [108, 28, 34, 26, 'SAFE']],
      [[8, 28, 60, 52, 'RECORDS'], [72, 28, 70, 40], [72, 72, 70, 50], [8, 84, 60, 56], [42, 144, 66, 56], [108, 144, 34, 40, 'SAFE'], [8, 144, 30, 40]],
      [[8, 28, 70, 60, 'RADIO'], [82, 28, 60, 40], [82, 72, 60, 56, 'STORAGE'], [8, 92, 70, 52], [8, 148, 134, 52]],
      [[14, 32, 122, 166]],
    ];
    const SAFE = [[0, 8], [1, 5]], LADDER = [2, 43, 118], HATCH = [3, 75, 118];
    const bg = Sscreen((c) => {
      c.fillStyle = '#04060e'; c.fillRect(0, 0, LW, 36); Stabs(c, 'MAP');
      for (let i = 0; i < 4; i++) { const x = PX(i); bevel(c, x, PY, PWm, PHm); inset(c, x + 4, PY + 4, PWm - 8, PHm - 8, '#03050c');
        c.fillStyle = 'rgba(60,90,160,0.12)'; for (let y = PY + 6; y < PY + PHm - 4; y += 3) c.fillRect(x + 4, y, PWm - 8, 1); }
      bevel(c, 10, 252, 620, 34, '#2c3040', '#7a8094', '#0c0e14'); inset(c, 14, 256, 612, 26, '#04060e');
    });
    const room = (c, i, [x, y, w, h, lab], fill, line) => { const X = PX(i) + x, Y = PY + y; rect(c, X, Y, w, h, fill); c.strokeStyle = line; c.lineWidth = 1; c.strokeRect(X + 0.5, Y + 0.5, w - 1, h - 1);
      if (lab) bitText(c, lab, X + w / 2, Y + h / 2, 2, '#e8eef8', { outline: '#000000' }); };
    return { scene, camera: cam, update() {},
      overlay(lt, dt, a, o) {
        const c = o.tctx, t = p.t0 + lt, q = L.q15(lt); c.drawImage(bg, 0, 0);
        left(c, 'CITY POLICE STATION', 16, 20, 2, '#9cf09c', { outline: null });
        FLOORS.forEach((f, i) => {
          const tf = p.t0 + 0.1 + i * 0.12; if (t < tf) return;
          const k = fadeIn(t, tf, 0.12); bitText(c, f, PX(i) + PWm / 2, PY + 15, 2, mixHex('#000000', '#ffffff', k), { outline: null });
          ROOMS[i].forEach((r, j) => {
            const safe = SAFE.some(([fi, ri]) => fi === i && ri === j) && t >= p.safe;
            if (i === 3) { const on = t >= p.roof, bl = Sblink(t, p.roof, 2.5); room(c, i, [...r.slice(0, 4), on ? 'ROOF' : ''], on ? (bl ? '#6a5a10' : '#3a3410') : '#16264a', on ? '#ffe048' : '#5a7ab8'); return; }
            room(c, i, safe ? [...r.slice(0, 4), 'SAFE'] : r[4] === 'SAFE' ? r.slice(0, 4) : r, safe ? (Sblink(t, p.safe, 1.5) ? '#1e7a2a' : '#16601e') : '#1e3a7a', safe ? '#8af08a' : '#7aa0e8');
          });
        });
        // YOU: sala segura del 2F (la de la maquina de escribir)
        if (t >= p.map && Sblink(t, p.map, 2)) { const X = PX(1) + 108 + 17, Y = PY + 144 + 30; rect(c, X - 3, Y - 3, 7, 7, '#ff4030'); }
        // puertas delanteras: X roja
        if (t >= p.front) { const X = PX(0) + 75, Y = PY + 200, s = pop(t, p.front); Sthick(c, [[X - 10 * s, Y - 10 * s], [X + 10 * s, Y + 10 * s]], '#ff4030', 3); Sthick(c, [[X - 10 * s, Y + 10 * s], [X + 10 * s, Y - 10 * s]], '#ff4030', 3);
          bitText(c, 'FRONT', X + 40, Y - 6, 2, '#ff6050', { outline: '#000000' }); }
        // verja trasera: cadena
        if (t >= p.back) { const X = PX(0) + 75, Y = PY + 30; rect(c, X - 12, Y - 2, 24, 4, '#c8a040'); }
        if (t >= p.chained) { const X = PX(0) + 75, Y = PY + 30, n = Math.round(6 * ease(p.chained, p.chained + 0.25, t));
          for (let k = 0; k < n; k++) { c.strokeStyle = k % 2 ? '#c8ccd8' : '#8a90a8'; c.lineWidth = 2; c.strokeRect(X - 22 + k * 7.5, Y - 4 + (k % 2) * 2, 8, 6); }
          bitText(c, 'GATE', X - 50, Y + 2, 2, '#ff6050', { outline: '#000000' }); }
        // escalera 3F -> azotea
        if (t >= p.ladder) { const [fi, x, y] = LADDER, X = PX(fi) + x, Y = PY + y, on = Sblink(t, p.ladder, 2.5); c.fillStyle = on ? '#ffe048' : '#a08018';
          c.fillRect(X - 8, Y - 14, 2, 28); c.fillRect(X + 6, Y - 14, 2, 28); for (let k = -10; k <= 10; k += 5) c.fillRect(X - 8, Y + k, 16, 2);
          bitText(c, 'LADDER', X, Y + 26, 2, '#ffe048', { outline: '#000000' }); }
        if (t >= p.plan) { const [fi, x, y] = LADDER, X0 = PX(fi) + x + 12, [hf, hx, hy] = HATCH, X1 = PX(hf) + hx - 12, Y = PY + y, k = ease(p.plan, p.plan + 0.3, t);
          Sdash(c, X0, Y, X0 + (X1 - X0) * k, Y, '#ffe048', 6, 4, -q * 30, 3);
          if (k >= 1) { c.fillStyle = '#ffe048'; for (let i = 0; i < 7; i++) c.fillRect(X1 + i - 6, Y - 6 + i, 1, 13 - 2 * i); }
          const s = pop(t, p.plan); bitText(c, 'PLAN B', PX(3) + PWm / 2, PY + 115 - 3 * (s - 1), 3, '#ffe048', { outline: '#000000' }); }
        // leyenda
        const leg = [[p.safe, '#1e9a2a', 'SAFE ROOM'], [p.front, '#ff4030', 'NO EXIT'], [p.roof, '#ffe048', 'PLAN B'], [p.map, '#ff4030', 'YOU']];
        let lx = 26; for (const [ta, col, s] of leg) { if (t < ta) { lx += 150; continue; } rect(c, lx, 263, 12, 12, col); left(c, s, lx + 18, 269, 2, '#ececec', { outline: '#000000' }); lx += 150; }
      } };
  }

  // ==================== montaje ====================
  const out = {};
  const OLD = -1e9, GAL = (n) => n + ' GAL';
  const RED = '#ff4030', YEL = '#ffd23f', GRN = '#62f05a', WHT = '#ffffff', GRY = '#c8ccd8';
  const dogFor = async (sel) => (sel.some((e) => e[1] === 'dog') ? makeDog() : null);
  // 05 avance: RIBBON en "dog", HANDGUN 15 en "fifteen", candado ? en la casilla de la llave
  { const p = P.s05, sel = [[p.dog, 'dog', 'RIBBON', 'One dog.'], [p.fifteen, 'gun', 'HANDGUN', 'Fifteen bullets.']];
    out['05_hook_items'] = invShot({ t0: p.t0, have: { dog: p.dog, gun: p.fifteen }, count: { gun: after(p.fifteen, '15'), dog: after(p.dog, 'x1') }, lock6: p.lock,
      sel, dog3: await dogFor(sel), desc0: ['BY SUNRISE...', ''], title: 'BY SUNRISE',
      rows: [['RIBBON', after(p.dog, val('x1', p.dog))], ['BULLETS', after(p.fifteen, val('15', p.fifteen))], ['???', after(p.lock, val('?', p.lock, { col: YEL })), p.lock]] }); }
  out['23_door_armory'] = doorShot('metal', P.s23);
  // 26 pistola: casi vacio ("and that's it")
  { const p = P.s26;
    out['26_item_pistol'] = invShot({ t0: p.t0, have: { gun: p.pistol }, count: { gun: after(p.fifteen, '15') },
      sel: [[p.pistol, 'gun', 'HANDGUN', (t) => (t >= p.fifteen ? [['9 mm.', GRY], ['15 rounds.', GRN], ["That's it.", GRY]] : '9 mm.')]], desc0: ['ARMORY', 'Someone found it first.'],
      rows: [['BULLETS', after(p.fifteen, val('15', p.fifteen))], ['WATER', () => null], ['FOOD', () => null], ['RIBBON', () => null]] }); }
  out['27_db'] = shot27();
  out['32_tanks'] = shot32();
  out['33_door_basement'] = doorShot('wood', P.s33);
  // 35 agua: contador 5 -> 11 -> 51, 51 DAYS, HELP: 7 DAYS con check
  { const p = P.s35, u = (t) => (t - p.f51) / Math.max(0.2, p.f51e - p.f51);
    const wv = (t) => { let tc = p.t0; for (let tt = p.f51; tt <= t && tt <= p.f51e + 0.01; tt += 1 / 15) if (waterRoll(p, tt) !== waterRoll(p, tt - 1 / 15)) tc = tt; return val(String(waterRoll(p, t)), tc, { unit: 'GAL', col: '#5aa0e8' }); };
    out['35_item_water'] = invShot({ t0: p.t0, have: { gun: OLD, spray: OLD, herb: OLD, water: OLD }, count: { gun: () => '15', water: (t) => GAL(waterRoll(p, t)) },
      sel: [[p.t0, 'water', (t) => [['WATER', WHT], [GAL(waterRoll(p, t)), '#5aa0e8']], (t) => [['5', GRY], [u(t) >= 0.15 ? '+ 6' : '', GRY], [u(t) >= 0.45 ? '+ 40' : '', GRY], [t >= p.days ? '= 51 DAYS' : '', GRN]]]],
      rows: [['BULLETS', () => val('15', -9)], ['WATER', wv], ['FOOD', () => null], ['HELP', after(p.seven, val('7', p.seven, { unit: 'DAYS', col: '#ececec' })), p.seven]],
      extra(c, t) { if (t >= p.seven) Scheck(c, 286, 130 + 3 * 22 + 1, 6, '#40e040', ease(p.seven + 0.05, p.seven + 0.3, t)); } }); }
  // 36d comida: CANDY x20 en 'twenty', CHIPS x9 en 'nine', 250 cal, = 2.5 DAYS en 'half'; el agua primero
  { const p = P.s36d, sel = [[p.twenty, 'candy', 'CANDY BAR', (t) => (t >= p.candy ? 'From the vending machine.' : '')], [p.chips, 'chips', 'CHIPS', 'Nine bags.'],
      [p.candy2, 'candy', (t) => [['20 BARS', WHT], [t >= p.two ? 'x 250 CAL' : '', YEL], [t >= p.calories ? '= 5,000 CAL' : '', YEL]],
        (t) => [[t >= p.roughly ? '@ 2,000 CAL/DAY' : '', GRY], [t >= p.half ? '= 2.5 DAYS' : '', GRN], [t >= p.half ? '+ CHIPS' : '', GRY]]],
      [p.water, 'water', [['WATER', WHT], ['51 GAL', '#5aa0e8']], (t) => [['Water comes', GRY], [t >= p.first ? 'FIRST.' : '', YEL]]]];
    out['36d_item_food'] = invShot({ t0: p.t0, have: { gun: OLD, spray: OLD, herb: OLD, water: OLD, candy: p.twenty, chips: p.nine },
      count: { gun: () => '15', water: () => '51 GAL', candy: after(p.twenty, 'x20'), chips: after(p.nine, 'x9') }, sel, desc0: ['BREAK ROOM', 'Two vending machines.'],
      rows: [['BULLETS', () => val('15', -9)], ['WATER', () => val('51', -9, { unit: 'GAL', col: '#5aa0e8' })], ['CANDY', after(p.twenty, val('x20', p.twenty)), p.twenty],
        ['FOOD', after(p.half, val('2.5', p.half, { unit: 'DAYS' })), p.half], ['+ CHIPS', after(p.nine, val('x9', p.nine)), p.nine]] }); }
  out['36e_threes'] = shot36e();
  // 41 RIBBON entra (perro 3D en el EXAMINE)
  { const p = P.s41, sel = [[p.ribbon, 'dog', 'RIBBON  K-9 PARTNER', (t) => (t >= p.better ? 'Better than any alarm.' : '')]];
    out['41_item_dog'] = invShot({ t0: p.t0, have: { gun: OLD, spray: OLD, herb: OLD, water: OLD, candy: OLD, chips: OLD, dog: p.ribbon },
      count: { gun: () => '15', water: () => '51 GAL', candy: () => 'x19', chips: () => 'x9', dog: after(p.ribbon, 'x1') }, sel, dog3: await dogFor(sel), desc0: ['K-9 UNIT', ''],
      rows: [['BULLETS', () => val('15', -9)], ['WATER', () => val('51', -9, { unit: 'GAL', col: '#5aa0e8' })], ['CANDY', () => val('x19', -9)], ['FOOD', () => val('2.5', -9, { unit: 'DAYS' })], ['RIBBON', after(p.ribbon, val('x1', p.ribbon)), p.ribbon]] }); }
  out['42_hearing'] = shot42();
  out['43c_busy'] = shot43();
  out['48e_steel'] = shot48e();
  out['48m_note'] = shot48m();
  out['48n_puzzle'] = shot48n();
  // 48o EXAMINE: la llave del trebol gira y entra en su casilla en 'clover'
  { const p = P.s48o, sel = [[p.t0, 'key', (t) => (t >= p.clover ? 'CLOVER KEY' : t >= p.key ? 'KEY' : '???'),
      (t) => [[t >= p.little ? 'Small' : '', GRY], [t >= p.brass ? 'brass key' : '', GRY], [t >= p.shaped ? 'shaped like a' : '', GRY], [t >= p.clover ? 'clover.' : '', GRN], [t >= p.clover ? 'Opens the radio room.' : '', YEL]]],
      [p.clover, 'key', 'CLOVER KEY', [['Small brass key shaped like a', GRY], ['clover.', GRN], ['Opens the radio room.', YEL]]]];
    out['48o_key'] = invShot({ t0: p.t0, have: { gun: OLD, spray: OLD, herb: OLD, water: OLD, candy: OLD, chips: OLD, note: OLD, dog: OLD, key: p.clover },
      count: { gun: () => '15', water: () => '51 GAL', candy: () => 'x17', chips: () => 'x9', dog: () => 'x1' }, sel,
      rows: [['BULLETS', () => val('15', -9)], ['WATER', () => val('51', -9, { unit: 'GAL', col: '#5aa0e8' })], ['RIBBON', () => val('x1', -9)], ['NOTE', () => val('x1', -9)], ['KEY', after(p.clover, val('CLOVER', p.clover, { col: '#e8c050' })), p.clover]] }); }
  out['48q_bac'] = shot48q();
  out['49b_map'] = shot49();
  out['56_duty_log'] = shot56();
  out['62_door_radio'] = doorShot('radio', P.s62);
  // 66 final: el cursor recorre cada objeto en su palabra; LIGHTS: OFF -> ON (rojo) en "on"
  { const p = P.s66, sel = [[p.dog, 'dog', 'RIBBON', 'A dog.'], [p.fifteen, 'gun', 'HANDGUN', [['Fifteen bullets.', GRY]]], [p.f51, 'water', [['WATER', WHT], ['51 GAL', '#5aa0e8']], 'Fifty-one gallons.'],
      [p.clover, 'key', 'CLOVER KEY', 'Small brass key shaped like a clover. Opens the radio room.'], [p.light, 'bulb', (t) => [['LIGHTS:', WHT], [t >= p.on ? 'ON' : 'OFF', t >= p.on ? RED : GRN]], (t) => [['Every light in the building', GRY], [t >= p.on ? 'is ON.' : '', RED]]]];
    out['66_item_final'] = invShot({ t0: p.t0, face: 'worried', have: { gun: OLD, spray: OLD, herb: OLD, water: OLD, candy: OLD, chips: OLD, note: OLD, key: OLD, dog: OLD },
      count: { gun: after(p.fifteen, '15'), water: after(p.f51, '51 GAL'), candy: () => 'x17', chips: () => 'x9', dog: after(p.dog, 'x1') }, sel, dog3: await dogFor(sel), desc0: ['RIGHT NOW...', ''], title: 'NIGHT 1', bulbOn: p.on,
      rows: [['RIBBON', after(p.dog, val('x1', p.dog)), p.dog], ['BULLETS', after(p.fifteen, val('15', p.fifteen)), p.fifteen], ['WATER', after(p.f51, val('51', p.f51, { unit: 'GAL', col: '#5aa0e8' })), p.f51],
        ['KEY', after(p.clover, val('CLOVER', p.clover, { col: '#e8c050' })), p.clover],
        ['LIGHTS', (t) => (t >= p.on ? val('ON', p.on, { col: Math.floor((t - p.on) * 4) % 2 ? '#c41c16' : RED }) : t >= p.light ? val('OFF', p.light, { col: GRN }) : null), p.light]] }); }
  out['69_choice'] = shot69();
  return out;
}

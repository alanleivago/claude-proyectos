// sets/p3screens.js — LARGO 3 ("Day 3"): pantallas RE dibujadas por nosotros (fondo azul con lineas, barra biselada, fuente
// RE), mismo estilo que p2screens.js. FILEs con un dato real cada uno (CDC monoxido y fiebre, Ejercito pace count, OSHA H2S,
// NWS 6 in, regla de la mano en la pared, hipotermia 25x, seco->caliente, ARRL 146.52), MAPA de 1920 + plan, ITEM (mapa,
// estrella polar, llave de plata) y hoja de guardado DAY 3 · 12:30 AM · SEWERS. Todo aparece en su palabra (ctx.at).
import { reText as bitText, reWidth as textWidth } from '../refont.js';

export function sfx() { return []; }

export async function shots(ctx) {
  const { L } = ctx, { THREE, LW, LH } = L;
  const at = (tk, k = 0) => ctx.at(tk, k);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const bevel = (c, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(c, x, y, f, w, h); px(c, x, y, hi, w, 1); px(c, x, y, hi, 1, h); px(c, x, y + h - 1, lo, w, 1); px(c, x + w - 1, y, lo, 1, h); };
  const bg = (c) => { const g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); c.fillStyle = g; c.fillRect(0, 0, LW, LH); c.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) c.fillRect(0, y, LW, 1); };
  const head = (c, a, b) => { bevel(c, 14, 10, LW - 28, 20); px(c, 18, 13, '#04060e', LW - 36, 14); bitText(c, a, 24 + textWidth(a, 1) / 2, 20, 1, '#9cf09c', { outline: null }); bitText(c, b, LW - 24 - textWidth(b, 1) / 2, 20, 1, '#c8ccd8', { outline: null }); };
  const stamp = (c, txt, x, y, col, k, rot = -0.08, sc = 2) => { if (k <= 0) return; const s = 1 + 0.6 * (1 - k), w = textWidth(txt, sc) + 20; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = k; c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(-w / 2, -14, w, 28); bitText(c, txt, 0, 0, sc, col, { outline: '#000' }); c.restore(); c.globalAlpha = 1; };
  const K = (tk, w, d = 0.12) => (t) => ease(at(tk, w) - 0.08, at(tk, w) + d, t);
  const fadeTxt = (c, k, s, x, y, sc, col) => { if (k <= 0) return; c.globalAlpha = k; bitText(c, s, x, y, sc, col, { outline: '#000' }); c.globalAlpha = 1; };
  const src = (c, s) => bitText(c, s, LW - 24 - textWidth(s, 1) / 2, 338, 1, '#6a7080', { outline: null });
  const blank = () => { const s = new THREE.Scene(); s.background = new THREE.Color(0x03050a); return [s, new THREE.PerspectiveCamera(45, LW / LH, 0.1, 10)]; };
  const out = {};
  const screen = (id, draw) => { const [scene, camera] = blank(); out[id] = { scene, camera, update() {}, overlay(lt, dt, a, o) { const c = o.tctx; bg(c); draw(c, out[id].t0 + lt, lt); } }; };
  // ---- iconos pixel (dibujados por nosotros)
  const icon = {
    map: (c, x, y) => { px(c, x - 20, y - 14, '#d8c8a0', 40, 28); c.strokeStyle = '#b02010'; c.lineWidth = 2; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(x - 14, y + 6); c.bezierCurveTo(x - 4, y - 8, x + 4, y + 8, x + 14, y - 6); c.stroke(); c.setLineDash([]); px(c, x - 20, y - 14, '#8a6a3a', 1, 28); px(c, x + 6, y - 14, '#b8a880', 1, 28); },
    star: (c, x, y) => { c.fillStyle = '#ffe890'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 16; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); px(c, x - 2, y - 2, '#ffffff', 4, 4); },
    key: (c, x, y) => { c.strokeStyle = '#d8dce4'; c.lineWidth = 3; c.beginPath(); c.arc(x - 10, y, 7, 0, 7); c.stroke(); px(c, x - 3, y - 1, '#d8dce4', 22, 3); px(c, x + 12, y + 2, '#d8dce4', 3, 6); px(c, x + 16, y + 2, '#d8dce4', 3, 4); px(c, x - 12, y - 2, '#ffffff', 2, 2); },
    gun: (c, x, y) => { px(c, x - 14, y - 6, '#1a1a1e', 26, 8); px(c, x - 14, y + 2, '#1a1a1e', 8, 12); px(c, x - 12, y - 5, '#5a5a62', 22, 1); },
    water: (c, x, y) => { px(c, x - 10, y - 12, '#4fa0e8', 20, 24); px(c, x - 4, y - 18, '#e8e8e8', 8, 6); px(c, x - 8, y - 6, '#9ad0ff', 4, 12); },
    beans: (c, x, y) => { for (let k = 0; k < 3; k++) { const xx = x - 18 + k * 18; px(c, xx - 7, y - 10, '#c8a040', 14, 22); px(c, xx - 7, y - 4, '#7a2a1a', 14, 9); px(c, xx - 7, y - 10, '#e8e8e0', 14, 2); } },
    torch: (c, x, y) => { px(c, x - 16, y - 4, '#1a1a1e', 24, 8); px(c, x + 8, y - 7, '#2a2a2e', 8, 14); px(c, x + 16, y - 5, '#fff6c0', 2, 10); },
  };
  /** ITEM: casillas a la izquierda (aparecen en su palabra), panel de totales a la derecha, EXAMINE del ultimo */
  const itemScreen = (id, items, totals, ex) => screen(id, (c, t) => {
    head(c, 'ITEMS', 'DAY 3 - SUPPLIES');
    items.forEach(([lab, ic, tk, w], i) => { const x = 40 + (i % 3) * 98, y = 52 + Math.floor(i / 3) * 78; bevel(c, x, y, 88, 68, '#0e1424'); const k = tk ? K(tk, w)(t) : 1; if (k <= 0) return;
      c.globalAlpha = k; icon[ic](c, x + 44, y + 28); bitText(c, lab, x + 44, y + 58, 1, '#e8e8ec', { outline: '#000' }); c.globalAlpha = 1; if (tk && t < at(tk, w) + 0.5) { c.strokeStyle = '#ffe048'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 86, 66); } });
    bevel(c, 360, 52, 252, 146, '#0a1020'); bitText(c, 'TOTALS', 486, 64, 1, '#9cf09c', { outline: null });
    totals.forEach(([lab, val, col], i) => { bitText(c, lab, 372 + textWidth(lab, 1) / 2, 86 + i * 18, 1, '#c8ccd8', { outline: null }); bitText(c, val, 600 - textWidth(val, 1) / 2, 86 + i * 18, 1, col, { outline: null }); });
    if (ex) ctx.examine({ tctx: c }, t - out[id].t0, ex[0], ex[1]);
  });

  // ---------- 6:10 PM: monoxido (CDC) ----------
  screen('14_co', (c, t, lt) => { head(c, 'FILE', 'GENERATOR EXHAUST');
    // generador: bastidor rojo + tubo de escape con nubes grises que se mueven
    bevel(c, 60, 150, 150, 90, '#7a1a14', '#c84a3a', '#3a0a08'); px(c, 72, 166, '#2a2a2e', 70, 50); px(c, 150, 170, '#d8b020', 40, 16); for (let k = 0; k < 4; k++) px(c, 70 + k * 40, 240, '#1a1a1c', 10, 14);
    px(c, 200, 160, '#3a3a3e', 30, 8);
    for (let k = 0; k < 7; k++) { const u = ((lt * 0.35 + k / 7) % 1), x = 236 + u * 210, y = 160 - u * 60 + Math.sin(k * 2 + lt) * 6; c.globalAlpha = 0.45 * (1 - u); c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(x, y, 8 + u * 22, 0, 7); c.fill(); }
    c.globalAlpha = 1; bitText(c, 'CO', 360, 120, 3, '#ff4030', { outline: '#000' });
    fadeTxt(c, K('l8', 'see')(t), 'NO COLOR', 500, 80, 2, '#e8e8ec');
    fadeTxt(c, K('l8', 'smell')(t), 'NO SMELL', 500, 112, 2, '#e8e8ec');
    stamp(c, 'NEVER RUN IT INDOORS', 450, 200, '#ff4030', K('l8', 'closed')(t), -0.05, 2);
    fadeTxt(c, K('l8', 'sleep')(t), 'KILLS YOU IN YOUR SLEEP', 450, 250, 1, '#ff7b2e'); src(c, 'CDC'); });
  // ---------- 7:00 PM: fiebre (CDC) ----------
  screen('19_fever', (c, t, lt) => { head(c, 'FILE', 'FEVER AFTER A BITE');
    const val = 98.6 + (101.4 - 98.6) * ease(at('m1', 'over') - 0.2, at('m1', 'one') + 0.4, t);
    bevel(c, 70, 70, 120, 220, '#101822'); px(c, 122, 90, '#e8e8ec', 16, 160); const top = 250 - (val - 95) / 9 * 150; px(c, 125, top, '#ff4030', 10, 250 - top); c.fillStyle = '#ff4030'; c.beginPath(); c.arc(130, 262, 16, 0, 7); c.fill();
    for (let f = 96; f <= 104; f += 2) { const y = 250 - (f - 95) / 9 * 150; px(c, 142, y, '#9aa0b0', 8, 1); bitText(c, String(f), 166, y, 1, '#9aa0b0', { outline: null }); }
    bitText(c, val.toFixed(1) + ' F', 400, 100, 3, val > 100.4 ? '#ff4030' : '#e8e8ec', { outline: '#000' });
    const yl = 250 - (100.4 - 95) / 9 * 150; c.setLineDash([4, 3]); c.strokeStyle = '#ffd23f'; c.beginPath(); c.moveTo(100, yl); c.lineTo(230, yl); c.stroke(); c.setLineDash([]); bitText(c, '100.4', 210, yl - 8, 1, '#ffd23f', { outline: null });
    fadeTxt(c, K('m1', 'fever')(t), 'FEVER = 100.4 F OR MORE', 410, 160, 1, '#ffd23f');
    stamp(c, 'AFTER A BITE: SPREADING', 410, 230, '#ff4030', K('m2', 'spreading')(t), -0.05, 1); src(c, 'CDC'); });
  // ---------- 8:30 PM: plan + mapa 1920 + pace count ----------
  const oldMap = (c, t, marks) => { const R = L.rng(5); c.fillStyle = '#d8c8a0'; c.fillRect(30, 40, LW - 60, LH - 70); for (let k = 0; k < 600; k++) { c.fillStyle = `rgba(120,90,50,${0.05 + R() * 0.1})`; c.fillRect(30 + R() * (LW - 60), 40 + R() * (LH - 70), 2, 1); }
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(40 + k * 66, 50); c.lineTo(40 + k * 66 + 10, LH - 40); c.stroke(); } for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(40, 70 + k * 56); c.lineTo(LW - 40, 72 + k * 56); c.stroke(); }
    c.fillStyle = 'rgba(70,110,150,0.6)'; c.beginPath(); c.moveTo(30, 250); c.bezierCurveTo(200, 230, 400, 290, LW - 30, 260); c.lineTo(LW - 30, 300); c.bezierCurveTo(400, 330, 200, 270, 30, 290); c.fill();
    c.font = 'italic 9px Georgia, serif'; c.fillStyle = '#4a2a10'; c.fillText('CITY OF   —   1920', 50, 60);
    const box = (x, y, w, h, lab) => { px(c, x, y, '#6a3a1a', w, h); px(c, x + 2, y + 2, '#c8b080', w - 4, h - 4); c.fillStyle = '#3a1a08'; c.font = 'bold 8px Georgia, serif'; c.fillText(lab, x + 4, y + h + 10); };
    box(110, 110, 60, 40, 'POLICE STA.'); box(470, 180, 70, 44, 'COURTHOUSE'); px(c, 520, 240, '#4a3a2a', 60, 8);
    for (const [kind, k] of marks) { if (k <= 0) continue; c.globalAlpha = k;
      if (kind === 'tunnel') { c.setLineDash([6, 4]); c.strokeStyle = '#b02010'; c.lineWidth = 3; c.beginPath(); c.moveTo(140, 150); c.bezierCurveTo(250, 200, 380, 160, 500, 200); c.stroke(); c.setLineDash([]); bitText(c, 'TUNNEL', 320, 190, 1, '#b02010', { outline: null }); }
      if (kind === 'bridge') bitText(c, 'RIVER BRIDGE', 550, 230, 1, '#2a4a8a', { outline: null });
      if (kind === 'heli') { const x = 560, y = 214; px(c, x - 14, y - 3, '#1a1a1a', 22, 7); px(c, x + 6, y - 1, '#1a1a1a', 14, 3); px(c, x - 22, y - 7, '#1a1a1a', 38, 1); bitText(c, 'DAWN', x, y - 18, 1, '#b02010', { outline: null }); }
      if (kind === 'horde') { const R2 = L.rng(9); for (let n = 0; n < 60; n++) { const x = 60 + R2() * 520, y = 80 + R2() * 150; if (Math.abs(x - 140) < 40 && Math.abs(y - 130) < 30) continue; c.fillStyle = '#7a1a10'; c.fillRect(x, y, 3, 3); } bitText(c, 'STREETS: FULL', 320, 96, 1, '#b02010', { outline: null }); }
      if (kind === 'q') { bitText(c, '? METERS', 300, 160, 2, '#b02010', { outline: null }); }
      c.globalAlpha = 1; } };
  screen('23_plan', (c, t) => { head(c, 'MAP', 'THE PLAN'); oldMap(c, t, [['bridge', K('p1', 'bridge')(t)], ['heli', K('p1', 'dawn')(t)], ['horde', K('p1', 'streets')(t)]]); });
  screen('25_map1920', (c, t) => { head(c, 'MAP', "MARLA'S MAP - 1920"); oldMap(c, t, [['bridge', 1], ['heli', 1], ['tunnel', K('p3', 'tunnel')(t)], ['q', K('p3', 'idea')(t)]]); stamp(c, 'SO YOU COUNT', LW / 2, 316, '#62f05a', K('p3', 'count')(t), -0.04, 2); });
  screen('26_pace', (c, t, lt) => { head(c, 'FILE', 'PACE COUNT');
    // huellas que avanzan: izquierda/derecha; cada 2 = 1 pace (contador)
    const n = Math.floor(lt * 3.2); for (let i = 0; i < Math.min(n, 14); i++) { const x = 50 + i * 38, y = i % 2 ? 110 : 132, col = i % 2 ? '#c8ccd8' : '#9aa0b0'; c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 7, 11, 0, 0, 7); c.fill(); px(c, x - 4, y - 18, col, 8, 5); if (i % 2) bitText(c, String((i + 1) / 2), x, 154, 1, '#ffd23f', { outline: null }); }
    fadeTxt(c, K('p4', 'two')(t), '2 STEPS = 1 PACE', 200, 200, 2, '#e8e8ec');
    fadeTxt(c, K('p4', 'sixty-five')(t), '~65 PACES', 470, 200, 2, '#ffd23f');
    fadeTxt(c, K('p5', 'hundred')(t), '= 100 METERS', 470, 236, 2, '#62f05a');
    stamp(c, 'US ARMY LAND NAVIGATION', LW / 2, 300, '#4fd6ff', K('p5', 'soldiers')(t), -0.04, 1); src(c, 'US ARMY (FM 3-25.26)'); });
  itemScreen('27_item_map', [['HAND MAP', 'map', 'p5', 'soldiers'], ['HANDGUN 15', 'gun'], ['FLASHLIGHT', 'torch'], ['WATER', 'water'], ['BEANS', 'beans']],
    [['BULLETS', '15', '#ffd23f'], ['RIBBON', 'x1', '#62f05a'], ['MARLA', 'BITTEN', '#ff4030'], ['PACES', '0', '#e8e8ec']], ['HAND MAP', "Marla's map from 1920.\nThe tunnel ends at the courthouse."]);
  // ---------- 10:00 PM: gas de alcantarilla (OSHA) ----------
  screen('42_gas', (c, t, lt) => { head(c, 'FILE', 'SEWER GAS (H2S)');
    // nariz + barra de concentracion que sube; el "olor" sube y luego CAE a cero cuando la concentracion es alta
    const conc = ease(at('s4', 'suddenly') - 0.3, at('s4', 'means') + 0.2, t), smell = conc < 0.55 ? conc / 0.55 : Math.max(0, 1 - (conc - 0.55) / 0.12);
    bevel(c, 60, 70, 60, 200, '#101822'); px(c, 72, 260 - 180 * conc, '#9ad040', 36, 180 * conc); bitText(c, 'GAS', 90, 284, 1, '#9ad040', { outline: null });
    bevel(c, 150, 70, 60, 200, '#101822'); px(c, 162, 260 - 180 * smell, '#ff7b2e', 36, 180 * smell); bitText(c, 'SMELL', 180, 284, 1, '#ff7b2e', { outline: null });
    fadeTxt(c, K('s3', 'sewer')(t), 'ROTTEN EGGS = H2S', 430, 80, 2, '#9ad040');
    fadeTxt(c, K('s4', 'goes')(t), 'SMELL GONE SUDDENLY?', 430, 130, 2, '#ffd23f');
    fadeTxt(c, K('s4', 'nose')(t), 'YOUR NOSE STOPPED WORKING', 430, 170, 1, '#ff7b2e');
    stamp(c, 'CLIMB OUT. FAST.', 430, 230, '#ff4030', K('s4', 'climb')(t), -0.05, 2); src(c, 'OSHA'); });
  screen('45_six_old', (c, t, lt) => { head(c, 'FILE', 'MOVING WATER');
    // corte lateral: agua que corre (lineas que se desplazan), silueta de una persona, regla de 6 in
    px(c, 40, 250, '#3a3428', LW - 80, 40); const wl = 250 - 26 * ease(at('s5', 'six') - 0.2, at('s5', 'inches') + 0.3, t);
    px(c, 40, wl, '#2a5a8a', LW - 80, 250 - wl); c.fillStyle = '#9ad0ff'; for (let k = 0; k < 14; k++) { const x = 40 + ((k * 47 + lt * 120) % (LW - 100)); c.fillRect(x, wl + 4 + (k % 3) * 6, 22, 2); }
    const fall = ease(at('s5', 'knock') - 0.1, at('s5', 'feet') + 0.3, t); c.save(); c.translate(300, 250); c.rotate(fall * 1.1); px(c, -8, -110, '#e8b080', 16, 18); px(c, -12, -92, '#6a4a2a', 24, 44); px(c, -12, -48, '#1a1a1e', 10, 48); px(c, 2, -48, '#1a1a1e', 10, 48); c.restore();
    px(c, 500, 172, '#e8e8ec', 4, 78); for (let k = 0; k <= 6; k++) px(c, 504, 250 - k * 13, '#e8e8ec', k % 3 ? 4 : 8, 1); bitText(c, '6 IN', 540, 220, 2, '#ffd23f', { outline: '#000' });
    stamp(c, '6 INCHES CAN KNOCK YOU DOWN', LW / 2, 100, '#ff4030', K('s5', 'knock')(t), -0.04, 1); src(c, 'NWS - TURN AROUND, DON\'T DROWN'); });
  // ---------- 11:30 PM: laberinto, mano derecha en la pared ----------
  screen('69_maze', (c, t, lt) => { head(c, 'FILE', 'LOST IN A MAZE');
    const G = 9, S = 30, X0 = 185, Y0 = 50, R = L.rng(31);
    // laberinto fijo: muros
    const W = []; for (let y = 0; y <= G; y++) for (let x = 0; x < G; x++) if (y === 0 || y === G || R() < 0.32) W.push([x, y, 1]);
    for (let x = 0; x <= G; x++) for (let y = 0; y < G; y++) if ((x === 0 && y !== 7) || (x === G && y !== 1) || R() < 0.32) W.push([x, y, 0]);
    c.fillStyle = '#3a4a6a'; for (const [x, y, h] of W) { if (h) c.fillRect(X0 + x * S - 1, Y0 + y * S - 1, S + 2, 3); else c.fillRect(X0 + x * S - 1, Y0 + y * S - 1, 3, S + 2); }
    bitText(c, 'YOU', X0 - 26, Y0 + 7.5 * S, 1, '#62f05a', { outline: null }); bitText(c, 'EXIT', X0 + G * S + 28, Y0 + 1.5 * S, 1, '#ffd23f', { outline: null });
    // camino de la mano derecha (pre-calculado como recorrido por muros: aqui una polilinea que recorre el borde derecho)
    const P = [[-0.5, 7.5], [0.5, 7.5], [0.5, 8.5], [2.5, 8.5], [2.5, 6.5], [3.5, 6.5], [3.5, 8.5], [6.5, 8.5], [6.5, 5.5], [8.5, 5.5], [8.5, 3.5], [6.5, 3.5], [6.5, 1.5], [9.5, 1.5]];
    const k = ease(at('o4', 'put') - 0.1, at('o4', 'exit') + 0.2, t), tot = P.length - 1, upto = k * tot;
    c.strokeStyle = '#62f05a'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= Math.floor(upto) && i < P.length; i++) { const [x, y] = P[i]; i ? c.lineTo(X0 + x * S, Y0 + y * S) : c.moveTo(X0 + x * S, Y0 + y * S); }
    if (upto < tot) { const i = Math.floor(upto), f = upto - i, [ax, ay] = P[i], [bx, by] = P[i + 1]; c.lineTo(X0 + (ax + (bx - ax) * f) * S, Y0 + (ay + (by - ay) * f) * S); } c.stroke();
    fadeTxt(c, K('o4', 'hand')(t), 'RIGHT HAND ON THE WALL', 90, 120, 1, '#62f05a'); fadeTxt(c, K('o4', 'never')(t), 'NEVER LET GO', 90, 140, 1, '#ffd23f');
    stamp(c, 'WALL FOLLOWER RULE', LW / 2, 334, '#4fd6ff', K('o4', 'sooner')(t), -0.03, 1); });
  // ---------- 12:30 AM: guardado ----------
  screen('77_save', (c, t) => { c.fillStyle = '#000'; c.fillRect(0, 0, LW, LH);
    if (t < at('v5', 'save') + 0.2) { bevel(c, 170, 120, 300, 70, '#0a1020'); bitText(c, 'WILL YOU SAVE YOUR GAME?', LW / 2, 140, 1, '#e8e8ec', { outline: null }); bitText(c, '> YES       NO', LW / 2, 166, 1, Math.floor(t * 4) % 2 ? '#c89a20' : '#ffe048', { outline: null }); return; }
    const lines = [['DAY 3', 'v5', 'day'], ['12:30 AM', 'v6', 0], ['SEWERS', 'v6', 'sewers']]; c.font = 'bold 30px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ece6da';
    lines.forEach(([s, tk, w], i) => { const n = Math.floor((t - at(tk, w) + 0.15) * 24); if (n > 0) c.fillText(s.slice(0, n), LW / 2, 110 + i * 46); });
    if (t > at('v6', 'sewers') + 0.6) { c.font = 'bold 14px "Courier New", monospace'; c.fillStyle = '#a8a49c'; c.fillText('DAY 3  ·  12:30 AM  ·  SEWERS', LW / 2, 262); } });
  // ---------- 1:40 AM: hipotermia ----------
  screen('81_heat_old', (c, t, lt) => { head(c, 'FILE', 'WET + COLD');
    // dos siluetas: aire (calor sale despacio) / agua (25 flechas)
    const fig = (x, col) => { px(c, x - 10, 90, '#e8b080', 20, 22); px(c, x - 16, 112, col, 32, 60); px(c, x - 14, 172, '#1a1a1e', 12, 60); px(c, x + 2, 172, '#1a1a1e', 12, 60); };
    fig(170, '#6a4a2a'); fig(470, '#6a4a2a'); px(c, 440, 172, 'rgba(60,120,200,0.55)', 60, 60);
    bitText(c, 'AIR', 170, 260, 2, '#c8ccd8', { outline: '#000' }); bitText(c, 'WATER', 470, 260, 2, '#4fd6ff', { outline: '#000' });
    const arrow = (x, y, dx, col) => { px(c, x, y, col, dx, 2); px(c, x + dx - 3, y - 2, col, 3, 6); };
    if (Math.floor(lt * 2) % 2 === 0) arrow(196, 140, 24, '#ff7b2e');
    const k = K('f4', 'twenty-five')(t); if (k > 0) for (let i = 0; i < 25; i++) { const a = (i / 25) * Math.PI * 2, r = 46 + ((lt * 60 + i * 7) % 30); c.globalAlpha = k; px(c, 470 + Math.cos(a) * r, 150 + Math.sin(a) * r * 0.9, '#ff7b2e', 3, 3); c.globalAlpha = 1; }
    stamp(c, '~25x FASTER', 470, 60, '#ff4030', k, -0.05, 2);
    fadeTxt(c, K('f4', 'wet')(t), 'WET CLOTHES = HYPOTHERMIA BEFORE MORNING', LW / 2, 300, 1, '#ffd23f'); });
  itemScreen('84_item_star', [['HAND MAP', 'map'], ['HANDGUN 15', 'gun'], ['FLASHLIGHT', 'torch'], ['NORTH STAR', 'star', 'f6', 'north']],
    [['BULLETS', '15', '#ffd23f'], ['RIBBON', 'x1', '#62f05a'], ['MARLA', 'GONE', '#ff4030'], ['RIVER', 'NORTH', '#4fd6ff']], ['NORTH STAR', 'The two stars at the end of the\nBig Dipper point straight to it.']);
  // ---------- 3:15 AM: seco primero ----------
  screen('107_cold_rule', (c, t, lt) => { head(c, 'FILE', 'FIRST RULE OF COLD');
    bevel(c, 80, 80, 200, 150, '#0a1828'); bevel(c, 360, 80, 200, 150, '#281408');
    fadeTxt(c, Math.max(0.3, K('y7', 'dry')(t)), '1. GET DRY', 180, 110, 2, '#4fd6ff'); fadeTxt(c, Math.max(0.3, K('y7', 'warm')(t)), '2. GET WARM', 460, 110, 2, '#ff7b2e');
    { c.globalAlpha = t > at('y7', 'dry') ? 1 : 0.35; for (let k = 0; k < 6; k++) px(c, 130 + k * 18, 150 + ((lt * 40 + k * 13) % 50), '#4fa0e8', 3, 6); px(c, 140, 190, '#b82020', 80, 24); bitText(c, 'CURTAIN', 180, 202, 1, '#f0e0d0', { outline: null }); c.globalAlpha = 1; }
    { const kw = t > at('y7', 'warm') ? 1 : 0.35; c.globalAlpha = kw; px(c, 405, 210, '#5a3a1a', 100, 8); for (let k = 0; k < 4; k++) px(c, 410 + k * 24, 214, '#3a2410', 18, 6); for (let k = 0; k < 5; k++) { const h = 20 + 14 * Math.abs(Math.sin(lt * 5 + k)); c.fillStyle = k % 2 ? '#ffb030' : '#ff6020'; c.beginPath(); c.moveTo(420 + k * 18, 210); c.lineTo(429 + k * 18, 210 - h); c.lineTo(438 + k * 18, 210); c.fill(); } c.globalAlpha = 1; bitText(c, 'FIRE', 460, 160, 1, '#ffb070', { outline: null }); }
    px(c, 296, 150, '#e8e8ec', 50, 4); px(c, 340, 144, '#e8e8ec', 6, 16);
    stamp(c, 'IN THAT ORDER', LW / 2, 290, '#62f05a', K('y7', 'order')(t), -0.04, 2); });
  itemScreen('117_item_key', [['HAND MAP', 'map'], ['HANDGUN 15', 'gun'], ['FLASHLIGHT', 'torch'], ['NORTH STAR', 'star'], ['SILVER KEY', 'key', 'z9', 'key']],
    [['BULLETS', '15', '#ffd23f'], ['RIBBON', 'x1', '#62f05a'], ['KEYS', '1', '#e8e8ec'], ['DOOR', 'LOCKED', '#ff4030']], ['SILVER KEY', 'Was in the lock of that door.\nA small "A" on the bow.']);
  // ---------- 4:40 AM: 146.52 (ARRL) ----------
  screen('120_freq', (c, t, lt) => { head(c, 'FILE', 'THE CALLING CHANNEL');
    bevel(c, 100, 70, 440, 120, '#1a1408', '#8a7040', '#0a0804'); px(c, 116, 86, '#0a1a0a', 408, 64);
    const digits = '146.52', nShow = Math.max(0, Math.min(6, Math.floor((t - at('r4', 0)) * 5)));
    c.font = 'bold 44px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5aff6a'; c.fillText(digits.slice(0, nShow).padEnd(6, '-'), 300, 120); c.font = 'bold 16px "Courier New", monospace'; c.fillText('MHz', 470, 132);
    for (let i = 0; i < 40; i++) px(c, 120 + i * 10, 168, i % 5 ? '#6a5a30' : '#c8a850', 2, i % 5 ? 6 : 12);
    const kn = 120 + 400 * ease(at('r4', 0), at('r4', 'two') + 0.3, t); px(c, kn - 1, 160, '#ff4030', 3, 26);
    stamp(c, 'NATIONAL SIMPLEX CALLING FREQUENCY', LW / 2, 240, '#4fd6ff', K('r4', 'calling')(t), -0.03, 1);
    fadeTxt(c, K('r3', 'every')(t), 'EVERY HAM KNOWS IT', LW / 2, 284, 1, '#ffd23f'); src(c, 'ARRL'); });
  return out;
}

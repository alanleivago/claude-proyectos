// sets/p2screens.js — LARGO 2: pantallas RE dibujadas por nosotros (sin HUD; film.js no las aclara). Fondo azul con lineas,
// barra de titulo biselada, todo en la fuente RE. ITEM/SUPPLIES (TRASH BAGS x20, CANNED BEANS x8, SIGNAL MIRROR, final),
// diagramas (codigo de golpes 7-3-7, combustible, cubo-inodoro, agua para dos, latas, estacion sobre la de 1920, sonido en
// la piedra, mordida 15 min, tres de cualquier cosa + espejo 10 mi), el MAPA de 1920 que se va llenando, FILEs a mano
// (cuaderno de Marla, nota del helicoptero), hoja de guardado DAY 2 · 12:30 PM · OLD STATION, retratos de "lo que tienes".
// Todo aparece en su palabra (ctx.at). Contrato: ../SETS.md.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

export function sfx() { return []; }

export async function shots(ctx) {
  const { L } = ctx, { THREE, LW, LH } = L;
  const at = (tk, k = 0) => ctx.at(tk, k), endOf = (tk, k = -1) => ctx.endOf(tk, k);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const bevel = (c, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(c, x, y, f, w, h); px(c, x, y, hi, w, 1); px(c, x, y, hi, 1, h); px(c, x, y + h - 1, lo, w, 1); px(c, x + w - 1, y, lo, 1, h); };
  const bg = (c) => { const g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); c.fillStyle = g; c.fillRect(0, 0, LW, LH); c.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) c.fillRect(0, y, LW, 1); };
  const head = (c, a, b) => { bevel(c, 14, 10, LW - 28, 20); px(c, 18, 13, '#04060e', LW - 36, 14); bitText(c, a, 24 + textWidth(a, 1) / 2, 20, 1, '#9cf09c', { outline: null }); bitText(c, b, LW - 24 - textWidth(b, 1) / 2, 20, 1, '#c8ccd8', { outline: null }); };
  const stamp = (c, txt, x, y, col, k, rot = -0.08, sc = 2) => { if (k <= 0) return; const s = 1 + 0.6 * (1 - k), w = textWidth(txt, sc) + 20; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = k; c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(-w / 2, -14, w, 28); bitText(c, txt, 0, 0, sc, col, { outline: '#000' }); c.restore(); c.globalAlpha = 1; };
  const K = (tk, w, d = 0.12) => (t) => ease(at(tk, w) - 0.08, at(tk, w) + d, t);
  const blank = () => { const s = new THREE.Scene(); s.background = new THREE.Color(0x03050a); return [s, new THREE.PerspectiveCamera(45, LW / LH, 0.1, 10)]; };
  const out = {};
  const screen = (id, draw) => { const [scene, camera] = blank(); out[id] = { scene, camera, update() {}, overlay(lt, dt, a, o) { const c = o.tctx; bg(c); draw(c, out[id].t0 + lt, lt); } }; };
  // ---- iconos pixel (dibujados por nosotros)
  const icon = {
    bags: (c, x, y) => { c.fillStyle = '#16161a'; c.beginPath(); c.ellipse(x, y + 6, 16, 18, 0, 0, 7); c.fill(); px(c, x - 4, y - 16, '#16161a', 8, 6); px(c, x - 6, y - 18, '#e8e8e0', 12, 2); px(c, x - 8, y, '#3a3a44', 3, 10); },
    beans: (c, x, y) => { for (let k = 0; k < 3; k++) { const xx = x - 18 + k * 18; px(c, xx - 7, y - 10, '#c8a040', 14, 22); px(c, xx - 7, y - 4, '#7a2a1a', 14, 9); px(c, xx - 7, y - 10, '#e8e8e0', 14, 2); px(c, xx + 3, y + 4, '#f0e8a0', 6, 4); } },
    mirror: (c, x, y) => { px(c, x - 12, y - 14, '#222', 24, 28); px(c, x - 10, y - 12, '#cfe0f0', 20, 24); px(c, x - 8, y - 10, '#ffffff', 5, 10); },
    water: (c, x, y) => { px(c, x - 10, y - 12, '#4fa0e8', 20, 24); px(c, x - 4, y - 18, '#e8e8e8', 8, 6); px(c, x - 8, y - 6, '#9ad0ff', 4, 12); },
    key: (c, x, y) => { c.strokeStyle = '#d8b850'; c.lineWidth = 3; for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]]) { c.beginPath(); c.arc(x - 10 + dx, y + dy, 4, 0, 7); c.stroke(); } px(c, x - 4, y - 1, '#d8b850', 18, 3); px(c, x + 8, y + 2, '#d8b850', 3, 5); },
    gun: (c, x, y) => { px(c, x - 14, y - 6, '#1a1a1e', 26, 8); px(c, x - 14, y + 2, '#1a1a1e', 8, 12); px(c, x - 12, y - 5, '#5a5a62', 22, 1); },
    dog: (c, x, y) => { px(c, x - 14, y - 4, '#8a5a2a', 24, 10); px(c, x + 6, y - 12, '#8a5a2a', 10, 10); px(c, x + 8, y - 16, '#3a2410', 3, 5); px(c, x - 12, y + 6, '#3a2410', 3, 8); px(c, x + 4, y + 6, '#3a2410', 3, 8); px(c, x - 16, y - 6, '#3a2410', 4, 3); },
    seat: (c, x, y) => { px(c, x - 10, y - 14, '#c02020', 6, 22); px(c, x - 10, y + 4, '#c02020', 20, 6); px(c, x + 8, y + 8, '#c02020', 3, 8); },
  };
  /** ITEM: casillas a la izquierda (aparecen en su palabra), panel de totales a la derecha, EXAMINE del ultimo */
  const itemScreen = (id, items, totals, ex) => screen(id, (c, t) => {
    head(c, 'ITEMS', 'DAY 2 - SUPPLIES');
    items.forEach(([lab, ic, tk, w], i) => { const x = 40 + (i % 3) * 98, y = 52 + Math.floor(i / 3) * 78; bevel(c, x, y, 88, 68, '#0e1424'); const k = K(tk, w)(t); if (k <= 0) return;
      c.globalAlpha = k; icon[ic](c, x + 44, y + 28); bitText(c, lab, x + 44, y + 58, 1, '#e8e8ec', { outline: '#000' }); c.globalAlpha = 1; if (t < at(tk, w) + 0.5) { c.strokeStyle = '#ffe048'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, 86, 66); } });
    bevel(c, 360, 52, 252, 146, '#0a1020'); bitText(c, 'TOTALS', 486, 64, 1, '#9cf09c', { outline: null });
    totals.forEach(([lab, val, col, tk, w], i) => { const k = tk ? K(tk, w)(t) : 1; if (k <= 0) return; c.globalAlpha = k; bitText(c, lab, 372 + textWidth(lab, 1) / 2, 86 + i * 18, 1, '#c8ccd8', { outline: null }); bitText(c, val, 600 - textWidth(val, 1) / 2, 86 + i * 18, 1, col, { outline: null }); c.globalAlpha = 1; });
    if (ex) ctx.examine({ tctx: c }, t - out[id].t0, ex[0], ex[1]);
  });
  // ---------- gancho: codigo de golpes ----------
  screen('05_code', (c, t) => { head(c, 'FILE', 'THE KNOCKS');
    const groups = [['h6', 'seven', 7, 'DAYS'], ['h7', 0, 3, 'RULES'], ['h8', 0, 7, 'DAYS']];
    groups.forEach(([tk, w, n, lab], g) => { const t0 = at(tk, w), y = 92 + g * 70; for (let i = 0; i < n; i++) { const on = t >= t0 + i * 0.12; const x = 140 + i * 40; c.fillStyle = on ? '#ff7b2e' : '#1a2030'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); if (on) { px(c, x - 4, y - 5, '#ffd0a0', 4, 3); } }
      if (t >= t0) bitText(c, String(n), 90, y, 3, '#ffd23f', { outline: '#000' }); const kl = ease(at('h9', 'days') - 0.1 + g * 0.35, at('h9', 'days') + 0.1 + g * 0.35, t); if (kl > 0) { c.globalAlpha = kl; bitText(c, lab, 520, y, 2, '#8cff5a', { outline: '#000' }); c.globalAlpha = 1; } });
    stamp(c, 'HE REMEMBERS THE CODE', LW / 2, 312, '#ff4030', K('h10', 'code')(t), -0.05, 1); });
  // ---------- combustible ----------
  screen('14_fuel_old', (c, t) => { head(c, 'FILE', 'GENERATOR FUEL');
    bevel(c, 40, 50, 140, 200, '#101822'); const lvl = 0.5; px(c, 60, 70 + 160 * (1 - lvl), '#d8a020', 100, 160 * lvl); px(c, 60, 70, '#1a2030', 100, 160 * (1 - lvl)); bitText(c, 'TANK 1/2', 110, 262, 1, '#ffd23f', { outline: null });
    const k1 = K('g4', 'half', 0.15)(t); if (k1 > 0) { c.globalAlpha = k1; bitText(c, '-0.5 GAL / HOUR', 400, 70, 2, '#ff7b2e', { outline: '#000' }); c.globalAlpha = 1; }
    const k2 = K('g4', 'dead')(t); if (k2 > 0) { c.globalAlpha = k2; bevel(c, 230, 96, 360, 50, '#200808', '#ff4030', '#400'); bitText(c, 'ALWAYS ON: DEAD BY TONIGHT', 410, 121, 1, '#ff4030', { outline: null }); c.globalAlpha = 1; }
    const k3 = K('g4', 'one')(t); if (k3 > 0) { c.globalAlpha = k3; bevel(c, 230, 160, 360, 50, '#082008', '#62f05a', '#040'); bitText(c, '1 HOUR A DAY: FRIDGE + RADIO', 410, 178, 1, '#62f05a', { outline: null }); c.globalAlpha = 1; }
    stamp(c, '= MORE THAN A WEEK', 410, 240, '#62f05a', K('g4', 'week')(t), -0.06, 2); });
  // ---------- cubo-inodoro ----------
  screen('24_bucket_diag', (c, t) => { head(c, 'FILE', 'NO POWER = NO FLUSHING');
    const X = 140, Y = 180; c.fillStyle = '#d8a020'; c.beginPath(); c.moveTo(X - 60, Y - 70); c.lineTo(X + 60, Y - 70); c.lineTo(X + 48, Y + 60); c.lineTo(X - 48, Y + 60); c.fill();
    const steps = [['BUCKET', 'w3', 'bucket', '#d8a020'], ['2 TRASH BAGS', 'w3', 'two', '#9aa0b0'], ['DRY LAYER', 'w3', 'dry', '#8a5a2a'], ['TIE IT OFF', 'w3', 'tie', '#e8e8e0'], ['PUT IT OUTSIDE', 'w3', 'outside', '#62f05a']];
    if (t >= at('w3', 'two')) { c.fillStyle = '#16161a'; c.beginPath(); c.moveTo(X - 66, Y - 76); c.lineTo(X + 66, Y - 76); c.lineTo(X + 44, Y + 56); c.lineTo(X - 44, Y + 56); c.fill(); }
    if (t >= at('w3', 'dry')) { px(c, X - 50, Y - 20, '#5a3a20', 100, 26); for (let k = 0; k < 30; k++) px(c, X - 48 + (k * 37) % 96, Y - 18 + (k * 13) % 22, '#8a6a40', 2, 2); }
    if (t >= at('w3', 'tie')) { px(c, X - 10, Y - 92, '#16161a', 20, 18); px(c, X - 14, Y - 84, '#e8e8e0', 28, 3); }
    steps.forEach(([lab, tk, w, col], i) => { const k = K(tk, w)(t); if (k <= 0) return; c.globalAlpha = k; bitText(c, (i + 1) + '. ' + lab, 300 + textWidth((i + 1) + '. ' + lab, 1) / 2, 80 + i * 26, 1, col, { outline: '#000' }); c.globalAlpha = 1; });
    const kl = K('w3', 'litter')(t); if (kl > 0) { c.globalAlpha = kl; bitText(c, 'CAT LITTER / SAWDUST / COFFEE', 440, 220, 1, '#c8a060', { outline: '#000' }); c.globalAlpha = 1; }
    stamp(c, 'READY.GOV CHECKLIST', 440, 262, '#4fd6ff', K('w3', 'checklist')(t), -0.05, 1); });
  itemScreen('25_item_bags', [['TRASH BAGS x20', 'bags', 'w4', 'trash'], ['ZIP TIES', 'key', 'w4', 'ties']],
    [['BULLETS', '15', '#ffd23f'], ['WATER', '51 GAL', '#4fd6ff'], ['RIBBON', 'x1', '#62f05a'], ['TRASH BAGS', '20', '#e8e8ec', 'w4', 'trash']], ['TRASH BAGS', 'Bucket toilet: two bags,\nsomething dry, tie it off.']);
  // ---------- agua para dos ----------
  screen('39_water_math', (c, t) => { head(c, 'FILE', 'WATER MATH');
    bitText(c, '51 GAL', 140, 100, 3, '#4fd6ff', { outline: '#000' }); bitText(c, '1 PERSON = 51 DAYS', 140, 140, 1, '#c8ccd8', { outline: null });
    const k = K('d5', 'two', 0.15)(t); if (k > 0) { c.globalAlpha = k; bitText(c, '2 PEOPLE x 1 GAL/DAY', 440, 100, 2, '#ffd23f', { outline: '#000' }); c.globalAlpha = 1; }
    const k2 = K('d6', 'became')(t); if (k2 > 0) { c.strokeStyle = '#ff4030'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, 140); c.lineTo(220, 140); c.stroke(); stamp(c, '= 25 DAYS', 440, 190, '#62f05a', K('d6', 'twenty')(t), -0.05, 3); } });
  // ---------- latas ----------
  screen('44_cans', (c, t) => { head(c, 'FILE', 'CANNED FOOD CHECK');
    const can = (x, y, kind) => { px(c, x - 22, y - 30, '#b8a060', 44, 60); px(c, x - 22, y - 12, '#7a2a1a', 44, 24); px(c, x - 22, y - 30, '#e8e8e0', 44, 3); px(c, x - 22, y + 27, '#e8e8e0', 44, 3);
      if (kind === 'b') { c.fillStyle = '#b8a060'; c.beginPath(); c.ellipse(x, y - 30, 24, 10, 0, Math.PI, 0); c.fill(); } if (kind === 'l') { for (let k = 0; k < 6; k++) px(c, x + 10, y + 30 + k * 6, '#7a6a3a', 3, 4); } if (kind === 'r') for (let k = 0; k < 18; k++) px(c, x - 20 + (k * 17) % 40, y - 26 + (k * 29) % 54, '#8a4a1a', 4, 3); };
    [['BULGING', 'b', 'bulging'], ['LEAKING', 'l', 'leaking'], ['RUSTED', 'r', 'rusted']].forEach(([lab, kd, w], i) => { const x = 110 + i * 150, k = K('f6', w)(t); can(x, 140, kd); if (k > 0) { c.globalAlpha = k; bitText(c, lab, x, 200, 1, '#ff4030', { outline: '#000' }); c.strokeStyle = '#ff4030'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 28, 104); c.lineTo(x + 28, 176); c.moveTo(x + 28, 104); c.lineTo(x - 28, 176); c.stroke(); c.globalAlpha = 1; } });
    stamp(c, 'OTHERWISE: GOOD FOR YEARS', LW / 2, 262, '#62f05a', K('f6', 'years')(t), -0.05, 2); bitText(c, 'USDA', LW - 40, 330, 1, '#6a7080', { outline: null }); });
  itemScreen('45_item_beans', [['TRASH BAGS x20', 'bags', 'w4', 'trash'], ['BEANS x8', 'beans', 'f3', 'eight'], ['GRANOLA', 'water', 'f3', 'granola']],
    [['BULLETS', '15', '#ffd23f'], ['WATER', '25 DAYS', '#4fd6ff'], ['CANNED BEANS', '8', '#e8e8ec', 'f6', 0], ['PEOPLE', '2', '#ff7b2e']], ['CANNED BEANS', 'Not bulging, not leaking,\nnot rusted: good for years.']);
  // ---------- estacion sobre la de 1920 ----------
  screen('52_layers', (c, t) => { head(c, 'FILE', 'UNDER THE STATION');
    px(c, 0, 150, '#3a2a1a', LW, 210); for (let k = 0; k < 60; k++) px(c, (k * 53) % LW, 160 + (k * 37) % 190, '#4a3a2a', 3, 2);
    bevel(c, 180, 50, 280, 100, '#4a5868'); for (let i = 0; i < 6; i++) px(c, 200 + i * 44, 70, '#d8c890', 20, 14); bitText(c, 'POLICE STATION', 320, 128, 1, '#e8e8ec', { outline: null });
    const k = K('k7', 'old')(t); if (k > 0) { c.globalAlpha = k; bevel(c, 190, 190, 260, 80, '#6a5a48', '#9a8a70', '#3a2a1a'); for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) px(c, 196 + j * 42, 200 + i * 14, '#5a4a38', 38, 10); bitText(c, 'OLD STATION', 320, 284, 1, '#ffd23f', { outline: '#000' }); c.globalAlpha = 1; }
    stamp(c, '1920', 540, 230, '#ffd23f', K('k7', 'nineteen')(t), 0.1, 3); stamp(c, 'NEVER FILLED IN', 320, 330, '#ff7b2e', K('k8', 'filled')(t), -0.04, 1); });
  // ---------- mapa de 1920 (se va llenando) ----------
  const oldMap = (c, t, marks) => { const R = L.rng(5); c.fillStyle = '#d8c8a0'; c.fillRect(30, 40, LW - 60, LH - 70); for (let k = 0; k < 600; k++) { c.fillStyle = `rgba(120,90,50,${0.05 + R() * 0.1})`; c.fillRect(30 + R() * (LW - 60), 40 + R() * (LH - 70), 2, 1); }
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(40 + k * 66, 50); c.lineTo(40 + k * 66 + 10, LH - 40); c.stroke(); } for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(40, 70 + k * 56); c.lineTo(LW - 40, 72 + k * 56); c.stroke(); }
    c.fillStyle = 'rgba(70,110,150,0.6)'; c.beginPath(); c.moveTo(30, 250); c.bezierCurveTo(200, 230, 400, 290, LW - 30, 260); c.lineTo(LW - 30, 300); c.bezierCurveTo(400, 330, 200, 270, 30, 290); c.fill();
    c.font = 'italic 9px Georgia, serif'; c.fillStyle = '#4a2a10'; c.fillText('CITY OF   —   1920', 50, 60);
    const box = (x, y, w, h, lab) => { px(c, x, y, '#6a3a1a', w, h); px(c, x + 2, y + 2, '#c8b080', w - 4, h - 4); c.fillStyle = '#3a1a08'; c.font = 'bold 8px Georgia, serif'; c.fillText(lab, x + 4, y + h + 10); };
    box(110, 110, 60, 40, 'POLICE STA.'); box(470, 180, 70, 44, 'COURTHOUSE');
    for (const [kind, k] of marks) { if (k <= 0) continue; c.globalAlpha = k;
      if (kind === 'tunnel') { c.setLineDash([6, 4]); c.strokeStyle = '#b02010'; c.lineWidth = 3; c.beginPath(); c.moveTo(140, 150); c.bezierCurveTo(250, 200, 380, 160, 500, 200); c.stroke(); c.setLineDash([]); bitText(c, 'TUNNEL', 320, 190, 1, '#b02010', { outline: null }); }
      if (kind === 'bridge') { px(c, 520, 240, '#4a3a2a', 60, 8); bitText(c, 'RIVER BRIDGE', 550, 230, 1, '#2a4a8a', { outline: null }); }
      if (kind === 'roof') { bitText(c, 'ROOF = PLAN B', 140, 92, 1, '#2a6a2a', { outline: null }); }
      if (kind === 'gate') { bitText(c, 'BACK GATE: CHAINED', 140, 172, 1, '#b02010', { outline: null }); }
      if (kind === 'cell4') { c.strokeStyle = '#b02010'; c.lineWidth = 2; c.beginPath(); c.arc(150, 130, 14, 0, 7); c.stroke(); bitText(c, 'CELL 4', 200, 130, 1, '#b02010', { outline: null }); }
      c.globalAlpha = 1; } };
  screen('54_old_map', (c, t) => { head(c, 'MAP', 'OLD STATION - 1920'); oldMap(c, t, [['tunnel', K('o1', 'tunnel')(t)], ['bridge', K('o2', 'bridge')(t)]]); });
  screen('60_map_check', (c, t) => { head(c, 'MAP', 'CHECK BEFORE YOU SAVE'); oldMap(c, t, [['tunnel', K('s2', 'tunnel')(t)], ['bridge', 1], ['roof', K('s2', 'roof')(t)], ['gate', K('s2', 'gate')(t)]]); });
  screen('89_tunnel_map', (c, t) => { head(c, 'MAP', 'THE ONLY SAFE WAY'); oldMap(c, t, [['tunnel', 1], ['bridge', 1], ['cell4', K('e3', 'cell')(t)]]); stamp(c, 'ONLY HE KNOWS THE WAY', LW / 2, 330, '#ff7b2e', K('e3', 'knows')(t), -0.04, 1); });
  // ---------- FILE a mano ----------
  const paper = (c, lines, t, t0, rate = 18, font = 'italic 15px "Segoe Script", "Comic Sans MS", cursive', col = '#1a1a4a') => { c.save(); c.translate(LW / 2, LH / 2 + 10); c.rotate(-0.02);
    c.fillStyle = '#e8dcbc'; c.fillRect(-200, -130, 400, 250); c.fillStyle = 'rgba(90,60,30,0.25)'; for (let y = -100; y < 120; y += 22) c.fillRect(-180, y, 360, 1);
    c.font = font; c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; let n = Math.max(0, Math.floor((t - t0) * rate)); lines.forEach((s, i) => { const v = s.slice(0, Math.max(0, n)); n -= s.length; if (v) c.fillText(v, -170, -90 + i * 32); }); c.restore(); };
  screen('56_notebook', (c, t) => { head(c, 'FILE', "MARLA'S NOTEBOOK"); paper(c, ['Day 1, 3:30 AM.', 'Lit up the building.', "If anyone's alive out there,", "they'll see it.", '                         - M.'], t, at('o6', 0) - 0.2, 16); });
  screen('86_note', (c, t) => { head(c, 'FILE', 'NOTE FROM THE TUBE'); paper(c, ['BRIDGE.', 'DAY 3.', 'DAWN.', 'ONE SEAT.'], t, at('c5', 0), 9, 'bold 26px "Courier New", monospace', '#1a1a1a'); stamp(c, 'ONE SEAT', 520, 300, '#ff4030', K('c5', 'seat')(t), 0.1, 2); });
  // ---------- guardado ----------
  screen('61_save', (c, t, lt) => { const c2 = c; c2.fillStyle = '#000'; c2.fillRect(0, 0, LW, LH);
    if (t < at('s3', 'save') + 0.2) { bevel(c2, 170, 120, 300, 70, '#0a1020'); bitText(c2, 'WILL YOU SAVE YOUR GAME?', LW / 2, 140, 1, '#e8e8ec', { outline: null }); bitText(c2, '> YES       NO', LW / 2, 166, 1, Math.floor(t * 4) % 2 ? '#c89a20' : '#ffe048', { outline: null }); return; }
    const lines = [['DAY 2', 's3', 'two'], ['12:30 PM', 's4', 0], ['OLD STATION', 's4', 'old']]; c2.font = 'bold 30px "Courier New", monospace'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = '#ece6da';
    lines.forEach(([s, tk, w], i) => { const n = Math.floor((t - at(tk, w) + 0.15) * 24); if (n > 0) c2.fillText(s.slice(0, n), LW / 2, 110 + i * 46); });
    if (t > at('s4', 'old') + 0.6) { c2.font = 'bold 14px "Courier New", monospace'; c2.fillStyle = '#a8a49c'; c2.fillText('DAY 2  ·  12:30 PM  ·  OLD STATION', LW / 2, 262); } });
  // ---------- tunel: sonido ----------
  screen('64_sound_diag', (c, t) => { head(c, 'FILE', 'SOUND IN A STONE TUNNEL');
    px(c, 30, 120, '#4a4a44', LW - 60, 20); px(c, 30, 220, '#4a4a44', LW - 60, 20); for (let k = 0; k < 40; k++) { px(c, 30 + k * 15, 120, '#5a5a52', 13, 8); px(c, 30 + k * 15, 230, '#5a5a52', 13, 8); }
    px(c, 70, 170, '#e8b080', 10, 30); bitText(c, 'YOU', 75, 214, 1, '#62f05a', { outline: null }); px(c, 560, 168, '#5a7a5a', 12, 34); bitText(c, '?', 566, 158, 2, '#ff4030', { outline: null });
    const k = K('u3', 'bounce', 0.2)(t); if (k > 0) { c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.beginPath(); let x = 85, y = 185, dir = -1; c.moveTo(x, y); for (let i = 0; i < 9; i++) { x += 54 * Math.min(1, k * 2); y = dir < 0 ? 142 : 218; dir *= -1; c.lineTo(x, y); } c.stroke(); }
    stamp(c, 'IT HEARS YOU FIRST', LW / 2, 300, '#ff4030', K('u3', 'hears')(t), -0.04, 2); });
  // ---------- mordida ----------
  screen('73_wash_diag', (c, t) => { head(c, 'FILE', 'FIRST AID: BITES');
    const k1 = K('m4', 'water')(t), k2 = K('m4', 'soap')(t); if (k1 > 0) { c.globalAlpha = k1; icon.water(c, 140, 120); bitText(c, 'WATER', 140, 160, 1, '#4fd6ff', { outline: null }); c.globalAlpha = 1; }
    if (k2 > 0) { c.globalAlpha = k2; px(c, 240, 108, '#f0a8c0', 36, 24); bitText(c, 'SOAP', 258, 160, 1, '#f0a8c0', { outline: null }); c.globalAlpha = 1; }
    const tf = at('m4', 'fifteen'), left = t < tf ? 900 : Math.max(0, 900 - (t - tf) * 120); if (t >= tf - 0.1) { bevel(c, 360, 90, 220, 80, '#041008', '#2fb83c', '#020'); bitText(c, `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`, 470, 122, 4, '#62f05a', { outline: '#000' }); bitText(c, 'SCRUB 15 FULL MINUTES', 470, 158, 1, '#c8f0c0', { outline: null }); }
    stamp(c, 'WHAT DOCTORS SAY (WHO)', LW / 2, 260, '#4fd6ff', K('m4', 'doctors')(t), -0.04, 1); });
  // ---------- señal ----------
  screen('78_signal_diag', (c, t) => { head(c, 'FILE', 'DISTRESS SIGNALS');
    [['FIRES', 'fires'], ['WHISTLES', 'whistles'], ['FLASHES', 'flashes']].forEach(([lab, w], i) => { const k = K('r5', w)(t), y = 80 + i * 48; if (k <= 0) return; c.globalAlpha = k; for (let j = 0; j < 3; j++) { c.fillStyle = ['#ff7b2e', '#e8e8e8', '#ffe048'][i]; c.beginPath(); c.arc(80 + j * 34, y, 11, 0, 7); c.fill(); } bitText(c, '3 ' + lab, 260, y, 1, '#e8e8ec', { outline: null }); c.globalAlpha = 1; });
    stamp(c, '3 OF ANYTHING = SOS', 450, 90, '#ff4030', K('r4', 'three')(t), -0.06, 1);
    const k = K('r5', 'mirror', 0.2)(t); if (k > 0) { c.globalAlpha = k; icon.mirror(c, 360, 260); c.strokeStyle = '#ffe048'; c.lineWidth = 2; c.beginPath(); c.moveTo(372, 250); c.lineTo(600, 180); c.stroke(); px(c, 590, 172, '#9ab0c8', 24, 8); bitText(c, '~10 MILES', 490, 230, 2, '#ffe048', { outline: '#000' }); bitText(c, 'NO NOISE', 490, 260, 1, '#62f05a', { outline: null }); c.globalAlpha = 1; } });
  itemScreen('81_item_mirror', [['TRASH BAGS x20', 'bags', 'w4', 'trash'], ['BEANS x8', 'beans', 'f3', 'eight'], ['SIGNAL MIRROR', 'mirror', 'r10', 0]],
    [['BULLETS', '15', '#ffd23f'], ['WATER', '25 DAYS', '#4fd6ff'], ['CANNED BEANS', '8', '#e8e8ec'], ['SIGNAL MIRROR', 'x1', '#ffe048', 'r10', 0]], ['SIGNAL MIRROR', 'From a locker. Three flashes\nat the sky, then wait.']);
  // ---------- lo que tienes ----------
  screen('88_whatyougot_old', (c, t) => { head(c, 'FILE', "WHAT YOU'VE GOT");
    [['RIBBON', 'SAVED YOUR LIFE', 'dog', '#62f05a', 'ribbon'], ['MARLA', 'BITTEN', null, '#ff4030', 'marla'], ['DUTCH', 'CELL 4', null, '#ff7b2e', 'dutch']].forEach(([n, sub, ic, col, w], i) => {
      const x = 110 + i * 210, k = K('e1', w)(t); bevel(c, x - 80, 60, 160, 200, '#0e1424'); if (k <= 0) return; c.globalAlpha = k;
      if (ic) icon.dog(c, x, 140); else { const skin = n === 'MARLA' ? '#e0c0a8' : '#a07050'; px(c, x - 18, 100, skin, 36, 40); px(c, x - 20, 92, n === 'MARLA' ? '#a8a6a0' : '#1a1410', 40, 12); px(c, x - 30, 140, n === 'MARLA' ? '#33384a' : '#d86020', 60, 70); if (n === 'MARLA') px(c, x + 14, 160, '#a01818', 16, 30); px(c, x - 9, 114, '#111', 5, 5); px(c, x + 5, 114, '#111', 5, 5); }
      bitText(c, n, x, 232, 2, '#e8e8ec', { outline: '#000' }); bitText(c, sub, x, 252, 1, col, { outline: null }); c.globalAlpha = 1; });
    stamp(c, 'ONE SEAT', LW / 2, 316, '#ff4030', K('e2', 'tunnel')(t), -0.04, 2); });
  itemScreen('96_item_final', [['RIBBON x1', 'dog', 'x1', 'dog'], ['HANDGUN 15', 'gun', 'x1', 'fifteen'], ['WATER', 'water', 'x1', 'twenty'], ['CLOVER KEY', 'key', 'x1', 'clover'], ['SIGNAL MIRROR', 'mirror', 'x1', 'signal'], ['1 SEAT', 'seat', 'x1', 'seat']],
    [['BULLETS', '15', '#ffd23f'], ['WATER', '25 DAYS', '#4fd6ff', 'x1', 'twenty'], ['SEATS', '1', '#ff4030', 'x1', 'seat'], ['LIGHTS', 'ON', '#ff4030', 'x2', 'lights']], null);
  return out;
}

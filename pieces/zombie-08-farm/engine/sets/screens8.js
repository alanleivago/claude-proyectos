// sets/screens8.js — ep8 LARGO "The Last Farm": RE-style screens with no set (film.js treats them as dark, no HUD):
// phone alert, RE maps (farm / roads / crowds / noise rings / hearing), well cutaway, dependency diagram, grid clock,
// water tally, Ready.gov FILE, ITEM screen (supplies), MEDICINE 0, typewriter save, end card PART 2 + SUBSCRIBE!.
// Everything on the 640x360 text canvas except the rotating 3D items. Times = words of the voice (ctx.at). Prefix-free module.
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';

export async function shots(ctx) {
  const { L, T, at } = ctx;
  const { THREE, LW, LH } = L;
  const W = (take, k = 0) => at(take, k);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const txt = (c, s, x, y, sc = 2, col = '#ffffff', ol = null) => bitText(c, s, x, y, sc, col, { outline: ol });
  const lft = (c, s, x, y, sc = 2, col = '#ffffff') => bitText(c, s, x + textWidth(s, sc) / 2, y, sc, col, { outline: null });
  const typed = (s, t, t0, rate = 22) => s.slice(0, Math.max(0, Math.floor((t - t0) * rate)));
  const bevel = (c, x, y, w, h, f = '#141826', hi = '#7a8094', lo = '#06080c') => { px(c, x, y, f, w, h); px(c, x, y, hi, w, 1); px(c, x, y, hi, 1, h); px(c, x, y + h - 1, lo, w, 1); px(c, x + w - 1, y, lo, 1, h); };
  const ortho = () => { const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0); return c; };
  const lit = (s) => { s.add(new THREE.AmbientLight(0xffffff, 1.1)); const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(-1, 1.6, 2); s.add(d); };
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const out = {};
  const blank = (id, ov, col = 0x05070e, scene3d) => { const s = scene3d || new THREE.Scene(); s.background = new THREE.Color(col); out[id] = { scene: s, camera: ortho(), update() {}, overlay: (lt, dt, a, o) => ov(o.tctx, T[id] + lt, lt, o) }; return out[id]; };
  const label = (c, s, x, y, col, t, tw, sc = 2) => { if (t < tw) return; const k = Math.min(1, (t - tw) / 0.12), w = textWidth(s, sc) + 14; c.globalAlpha = k; px(c, x - w / 2, y - 11, 'rgba(6,8,14,0.85)', w, 22); px(c, x - w / 2, y - 11, col, w, 1); px(c, x - w / 2, y + 10, col, w, 1); txt(c, s, x, y, sc, col); c.globalAlpha = 1; };

  // ---------- RE map base (dark navy blocks, cyan outlines like the RE2 map) ----------
  const MAP = { farm: [170, 200], town: [520, 140], nb: [[90, 120], [250, 300], [330, 90], [80, 290]] };
  function mapBase(c, t, { title = 'MAP', roadsHot = 0 } = {}) {
    px(c, 0, 0, '#040814', LW, LH); for (let y = 0; y < LH; y += 3) px(c, 0, y, 'rgba(40,70,140,0.08)', LW, 1);
    bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, title, 16, 17, 2, '#9ab0d8');
    c.strokeStyle = '#1a2a4a'; for (let x = 20; x < LW; x += 40) { c.beginPath(); c.moveTo(x + 0.5, 34); c.lineTo(x + 0.5, LH - 6); c.stroke(); } for (let y = 40; y < LH; y += 40) { c.beginPath(); c.moveTo(6, y + 0.5); c.lineTo(LW - 6, y + 0.5); c.stroke(); }
    // roads: county roads from every farm toward the highway, the highway into town
    const hot = roadsHot; c.lineWidth = 3; c.strokeStyle = hot > 0 ? `rgb(${120 + 120 * hot},${80 - 40 * hot},60)` : '#4a5a7a';
    const R = [[[90, 120], [300, 150]], [[80, 290], [300, 150]], [[250, 300], [300, 150]], [[330, 90], [300, 150]], [[300, 150], [520, 140]]];
    for (const [[a, b], [x, y]] of R) { c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); }
    c.lineWidth = 1; c.strokeStyle = '#8a7a5a'; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(MAP.farm[0], MAP.farm[1]); c.lineTo(MAP.farm[0] + 46, MAP.farm[1] - 26); c.stroke(); c.setLineDash([]);
    // town block
    px(c, 486, 108, '#1a2a4e', 70, 62); c.strokeStyle = '#4fd6ff'; c.strokeRect(486.5, 108.5, 70, 62); for (let i = 0; i < 9; i++) px(c, 492 + (i % 3) * 21, 114 + Math.floor(i / 3) * 18, '#2a3a64', 14, 12);
    txt(c, 'TOWN', 521, 182, 2, '#9ab0d8');
    // neighbours
    for (const [x, y] of MAP.nb) { px(c, x - 5, y - 4, '#2a3a64', 10, 8); c.strokeStyle = '#6a7ab0'; c.strokeRect(x - 4.5, y - 3.5, 9, 7); }
    // the farm (green: you)
    const [fx, fy] = MAP.farm; px(c, fx - 22, fy - 16, '#0e2a1a', 44, 32); c.strokeStyle = '#58d07c'; c.strokeRect(fx - 21.5, fy - 15.5, 43, 31); px(c, fx - 6, fy - 6, '#58d07c', 8, 7); px(c, fx + 6, fy - 4, '#d84030', 10, 8);
    if (Math.floor(t * 3) % 2 === 0) px(c, fx - 3, fy - 3, '#c8ffd8', 3, 3);
    txt(c, 'YOUR FARM', fx, fy + 26, 2, '#8cff5a');
  }
  const carDots = (c, t, t0, n, col = '#ffd23f') => { const R = [[[90, 120], [300, 150]], [[80, 290], [300, 150]], [[250, 300], [300, 150]], [[330, 90], [300, 150]], [[300, 150], [520, 140]]];
    for (let i = 0; i < n; i++) { const r = R[i % R.length], u = ((t - t0) * 0.12 + i * 0.137) % 1; if (t < t0 + i * 0.05) continue; const stop = r === R[4] ? Math.min(u, 0.55 + (i % 7) * 0.06) : u; const x = r[0][0] + (r[1][0] - r[0][0]) * stop, y = r[0][1] + (r[1][1] - r[0][1]) * stop; px(c, x - 1, y - 1, col, 3, 3); } };

  // ---------- 02: phone alert (upright, level) ----------
  blank('02_phone', (c, t) => {
    px(c, 0, 0, '#0a0c10', LW, LH); const x = 232, y = 14, w = 176, h = 336; // phone body
    px(c, x - 6, y - 6, '#1a1c22', w + 12, h + 12); px(c, x - 6, y - 6, '#3a3e48', w + 12, 2); px(c, x, y, '#10223a', w, h);
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2a4a7a'); g.addColorStop(1, '#0a1428'); c.fillStyle = g; c.fillRect(x, y, w, h);
    px(c, x + w / 2 - 16, y + 6, '#05060a', 32, 6);
    txt(c, '6:42', x + w / 2, y + 52, 6, '#f0f4ff'); txt(c, 'TUESDAY', x + w / 2, y + 84, 2, '#c8d4f0');
    const ta = W('h2', 'zombie') - 0.25; if (t > ta) { const k = ease(ta, ta + 0.25, t), yy = y + 104 + (1 - k) * -40;
      px(c, x + 8, yy, '#e8e8ec', w - 16, 150); px(c, x + 8, yy, '#c82a1a', w - 16, 22); txt(c, 'EMERGENCY ALERT', x + w / 2, yy + 11, 2, '#ffffff');
      if (t > W('h2', 'zombie')) { txt(c, 'ZOMBIE OUTBREAK', x + w / 2, yy + 40, 2, '#c82a1a'); txt(c, 'DAY 1', x + w / 2, yy + 60, 2, '#c82a1a'); }
      if (t > W('h2', 'shelter')) txt(c, 'Shelter in place', x + w / 2, yy + 90, 2, '#202020');
      if (t > W('h2', 'avoid')) { txt(c, 'Avoid populated', x + w / 2, yy + 114, 2, '#202020'); txt(c, 'areas', x + w / 2, yy + 132, 2, '#202020'); } }
  });
  // ---------- 10: RE map of the farm ----------
  blank('10_map', (c, t) => { mapBase(c, t, { title: 'MAP — COUNTY' });
    label(c, 'NEIGHBOR: 2 MI', 90, 96, '#ffd23f', t, W('a3', 'neighbor')); c.strokeStyle = '#ffd23f'; if (t > W('a3', 'two')) { c.setLineDash([3, 2]); c.beginPath(); c.moveTo(170, 200); c.lineTo(92, 124); c.stroke(); c.setLineDash([]); }
    label(c, 'GRAVEL ROAD', 250, 160, '#c8b890', t, W('a3', 'gravel')); if (t > W('a3', 'gate')) { px(c, 214, 172, '#ffd23f', 6, 3); label(c, 'GATE', 262, 252, '#ffd23f', t, W('a3', 'gate')); } });
  // ---------- 16: everybody else ----------
  blank('16_everybody', (c, t) => { mapBase(c, t, { title: 'MAP — COUNTY' }); for (const [x, y] of MAP.nb) if (t > W('b3', 'everybody')) { px(c, x + 6, y - 2, '#ffd23f', 3, 3); }
    label(c, 'EVERYONE HAS THE SAME IDEA', 320, 62, '#ffd23f', t, W('b3', 'everybody')); });
  // ---------- 17: roads fill up toward town ----------
  blank('17_jam_map', (c, t) => { const hot = ease(W('b4', 'filling'), W('b5', 'town') + 0.5, t); mapBase(c, t, { title: 'MAP — COUNTY', roadsHot: hot }); carDots(c, t, W('b4', 'filling'), 60);
    if (t > W('b5', 'toward')) { const k = (Math.sin(t * 8) + 1) / 2; c.strokeStyle = `rgba(255,64,48,${0.5 + 0.5 * k})`; c.lineWidth = 2; c.strokeRect(480.5, 102.5, 82, 74); c.lineWidth = 1; label(c, 'EVERYONE → TOWN', 520, 220, '#ff4030', t, W('b5', 'toward')); } });
  // ---------- 21: FARM RULE #1 memo (FILE) ----------
  blank('21_rule1', (c, t) => { px(c, 0, 0, '#05070e', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, 'FILE', 16, 17, 2, '#9ab0d8');
    const x = 150, y = 42, w = 340, h = 296; px(c, x + 4, y + 4, '#000', w, h); px(c, x, y, '#e4dcc4', w, h); for (let yy = y + 50; yy < y + h; yy += 18) px(c, x + 10, yy, '#c8bea4', w - 20, 1); px(c, x + 30, y, '#d89a8a', 1, h);
    const ink = '#2a2420'; if (t > W('b9', 'farm')) txt(c, 'FARM RULE #1', x + w / 2, y + 26, 3, '#a8201a');
    if (t > W('b9', 'stay')) { txt(c, 'STAY AWAY FROM', x + w / 2, y + 74, 2, ink); txt(c, 'POPULATION CENTERS', x + w / 2, y + 94, 2, ink); }
    [['towns', 'TOWNS'], ['highways', 'HIGHWAYS'], ['gas', 'GAS STATIONS'], ['shelters', 'SHELTERS']].forEach(([w_, s], i) => { if (t > W('b9', w_)) { lft(c, '- ' + s, x + 60, y + 140 + i * 26, 2, ink); } }); });
  // ---------- 22: crowds ----------
  blank('22_crowds', (c, t) => { mapBase(c, t, { title: 'MAP — COUNTY', roadsHot: 1 }); carDots(c, t, T['22_crowds'] - 10, 60);
    if (t > W('b10', 'crowds')) { const k = ease(W('b10', 'crowds'), W('b10', 'crowds') + 1.2, t); const g = c.createRadialGradient(520, 140, 4, 520, 140, 80 * k); g.addColorStop(0, 'rgba(255,40,30,0.75)'); g.addColorStop(1, 'rgba(255,40,30,0)'); c.fillStyle = g; c.fillRect(420, 40, 200, 200);
      const g2 = c.createRadialGradient(400, 145, 2, 400, 145, 40 * k); g2.addColorStop(0, 'rgba(255,40,30,0.6)'); g2.addColorStop(1, 'rgba(255,40,30,0)'); c.fillStyle = g2; c.fillRect(340, 90, 120, 110); label(c, 'CROWDS', 520, 230, '#ff4030', t, W('b10', 'crowds')); } });
  // ---------- 20b: town empty by noon (b8b) ----------
  blank('20b_store', (c, t) => { mapBase(c, t, { title: 'MAP — COUNTY', roadsHot: 0.6 }); carDots(c, t, T['20b_store'] - 6, 40);
    label(c, 'STORES: EMPTY BY NOON', 520, 220, '#ff4030', t, W('b8b', 'empty')); label(c, 'YOU: STUCK HERE', 410, 110, '#ffd23f', t, W('b8b', 'stuck')); if (t > W('b8b', 'stuck')) { px(c, 405, 140, '#ffd23f', 5, 5); } });
  // ---------- 26: well cutaway ----------
  blank('26_well', (c, t) => { px(c, 0, 0, '#05070e', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, 'WELL — CROSS SECTION', 16, 17, 2, '#9ab0d8');
    const g0 = 90; const sky = c.createLinearGradient(0, 30, 0, g0); sky.addColorStop(0, '#3a5a8a'); sky.addColorStop(1, '#8ab0d0'); c.fillStyle = sky; c.fillRect(6, 30, LW - 12, g0 - 30);
    px(c, 6, g0, '#4a7a2a', LW - 12, 6); for (let i = 0; i < 4; i++) px(c, 6, g0 + 6 + i * 62, ['#6a4a2e', '#5a4030', '#4a3a30', '#3a3634'][i], LW - 12, 62);
    const r = L.rng(5); for (let k = 0; k < 160; k++) px(c, 6 + r() * (LW - 12), g0 + 8 + r() * 250, '#00000033', 2, 2);
    px(c, 6, 226, '#1a3a6a', LW - 12, 128); for (let x = 6; x < LW - 6; x += 8) px(c, x, 226, '#4a7ab0', 4, 1); txt(c, 'GROUND WATER', 120, 250, 2, '#8ac0f0');
    px(c, 120, 52, '#e8e4d8', 70, 38); px(c, 112, 44, '#3a2a2a', 86, 10); txt(c, 'HOUSE', 155, 72, 1, '#2a2420');
    const x = 330; px(c, x - 4, g0 - 14, '#9aa0a8', 8, 14); px(c, x - 3, g0, '#8a9098', 6, 236 - g0); px(c, x - 1, g0, '#c8d0d8', 2, 236 - g0);
    px(c, 190, 76, '#8a9098', x - 190, 3);
    const py = 236; px(c, x - 8, py, '#3a6ad0', 16, 30); px(c, x - 8, py, '#8ab0ff', 16, 2);
    label(c, 'ELECTRIC PUMP', x + 110, py + 14, '#ffd23f', t, W('w2', 'electric')); c.strokeStyle = '#ffd23f'; if (t > W('w2', 'electric')) { c.beginPath(); c.moveTo(x + 10, py + 14); c.lineTo(x + 50, py + 14); c.stroke(); }
    if (t > W('w2', 'well')) { const u = ((t * 1.2) % 1); for (let k = 0; k < 6; k++) { const yy = py - ((u + k / 6) % 1) * (py - g0); px(c, x - 1, yy, '#4fd6ff', 2, 4); } } });
  // ---------- 27/28: dependency chain ----------
  const BOX = [['GRID', 'grid', 80], ['HOUSE', 'house', 240], ['PUMP', 'pump', 400], ['WATER', 'water', 560]];
  const icon = (c, k, x, y, col) => { if (k === 0) { for (let i = 0; i < 30; i++) px(c, x - 1 + (i % 2), y - 16 + i, col, 2, 1); px(c, x - 12, y - 10, col, 24, 2); px(c, x - 9, y - 2, col, 18, 2); px(c, x - 7, y + 14, col, 2, 2); px(c, x + 5, y + 14, col, 2, 2); }
    if (k === 1) { px(c, x - 12, y - 2, col, 24, 16); for (let i = 0; i < 12; i++) px(c, x - 12 + i, y - 2 - i, col, 24 - 2 * i, 1); px(c, x - 3, y + 6, '#05070e', 6, 8); }
    if (k === 2) { px(c, x - 4, y - 16, col, 8, 30); px(c, x - 8, y + 6, col, 16, 10); px(c, x - 2, y - 20, col, 4, 4); }
    if (k === 3) { for (let i = 0; i < 18; i++) { const w = Math.min(i, 18 - i * 0.5) * 1.2 + 2; px(c, x - w / 2, y - 14 + i, col, w, 1); } } };
  const chainShot = (id, cut) => blank(id, (c, t) => { px(c, 0, 0, '#05070e', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, cut ? 'NO POWER' : 'HOW YOUR WATER WORKS', 16, 17, 2, cut ? '#ff4030' : '#9ab0d8');
    const tOff = cut ? W('w4', 'power') : 1e9, tStop = cut ? W('w5', 'pump') : 1e9, tW = cut ? W('w5', 'water') : 1e9;
    BOX.forEach(([s, w_, x], i) => { const shown = cut || t > W('w3', w_) - 0.05; if (!shown) return; const dead = (i === 0 && t > tOff) || (i === 1 && t > tOff + 0.4) || (i === 2 && t > tStop) || (i === 3 && t > tW);
      const col = dead ? '#5a2a2a' : ['#ffd23f', '#e8e4d8', '#4fd6ff', '#4fd6ff'][i]; bevel(c, x - 56, 120, 112, 110, '#0e1424'); icon(c, i, x, 160, col); txt(c, s, x, 210, 2, col);
      if (i < 3) { const ok = !dead; const ax = x + 58; for (let k = 0; k < 6; k++) px(c, ax + k * 8, 174, ok && Math.floor(t * 6 + k) % 6 < 3 ? '#8cff5a' : '#2a3a2a', 5, 3); px(c, ax + 44, 170, ok ? '#8cff5a' : '#2a3a2a', 3, 11); }
      if (dead && i === 0) { c.strokeStyle = '#ff4030'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 40, 130); c.lineTo(x + 40, 222); c.moveTo(x + 40, 130); c.lineTo(x - 40, 222); c.stroke(); c.lineWidth = 1; } });
    if (cut && t > tW) label(c, 'NO POWER = NO WATER', LW / 2, 280, '#ff4030', t, tW); });
  chainShot('27_diag', false); chainShot('28_cut', true);
  // ---------- 29: grid clock ----------
  blank('29_clock', (c, t) => { px(c, 0, 0, '#05070e', LW, LH); const t0 = W('w7', 'clock'); const left = Math.max(0, 3599 - Math.max(0, t - t0) * 41);
    txt(c, 'GRID FAILURE IN', LW / 2, 100, 2, '#9ab0d8'); const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(Math.floor(left % 60)).padStart(2, '0');
    const col = t > t0 ? '#ff4030' : '#5a2a2a'; bevel(c, 170, 130, 300, 90, '#0a0404', '#5a2020', '#000'); txt(c, `${mm}:${ss}`, LW / 2, 176, 8, col);
    label(c, 'MAYBE AN HOUR', LW / 2, 240, '#ffd23f', t, W('w7', 'maybe')); label(c, 'FILL EVERYTHING', LW / 2, 266, '#4fd6ff', t, W('w7', 'fill')); });
  // ---------- 33: water tally ----------
  blank('33_total', (c, t) => { px(c, 0, 0, '#05070e', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, 'WATER', 16, 17, 2, '#4fd6ff');
    [['BATHTUB', 40], ['10 JUGS + 4 BUCKETS', 30], ['WATER HEATER', 40]].forEach(([s, v], i) => { lft(c, s, 160, 100 + i * 40, 2, '#c8d0e0'); txt(c, `${v} GAL`, 460, 100 + i * 40, 2, '#ffffff'); });
    px(c, 150, 210, '#4fd6ff', 340, 2); const k = ease(W('w11', 0), W('w11', -1), t); txt(c, `${Math.round(110 * k)} GAL`, LW / 2, 250, 5, '#4fd6ff'); });
  // ---------- 34: Ready.gov FILE ----------
  blank('34_ready', (c, t) => { px(c, 0, 0, '#05070e', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, 'FILE', 16, 17, 2, '#9ab0d8');
    const x = 120, y = 50, w = 400, h = 250; px(c, x + 4, y + 4, '#000', w, h); px(c, x, y, '#e4dcc4', w, h); for (let yy = y + 50; yy < y + h; yy += 18) px(c, x + 10, yy, '#c8bea4', w - 20, 1);
    if (t > W('w12', 'ready')) txt(c, 'READY.GOV', x + w / 2, y + 26, 3, '#1a3a8a');
    if (t > W('w12', 'one')) txt(c, '1 GALLON / PERSON / DAY', x + w / 2, y + 80, 2, '#2a2420');
    if (t > W('w12', 'drinking')) txt(c, '(DRINKING + WASHING)', x + w / 2, y + 104, 2, '#6a6050');
    if (t > W('w12', 'alone')) { txt(c, '110 GAL = 110 DAYS', x + w / 2, y + 160, 3, '#1a6a2a'); txt(c, 'MORE THAN 3 MONTHS', x + w / 2, y + 196, 2, '#1a6a2a'); } });
  function farmMap(c, cx, cy, k) {   // cx,cy = the house on screen, k = px per m
    const P = (x, z) => [cx + x * k, cy + z * k]; const rect = (x, z, w, d, f, st, name) => { const [a, b] = P(x - w / 2, z - d / 2); px(c, a, b, f, w * k, d * k); c.strokeStyle = st; c.strokeRect(Math.round(a) + 0.5, Math.round(b) + 0.5, Math.round(w * k), Math.round(d * k)); if (name) txt(c, name, a + w * k / 2, b + d * k / 2, 1, '#e8f0e8'); };
    for (let i = 0; i < 90; i++) { const x = ((i * 37) % 160) - 80, z = ((i * 53) % 140) - 50; if (Math.abs(x) < 30 && z < 25 && z > -32) continue; const [a, b] = P(x, z); px(c, a, b, '#1e4a1e', 3, 4); }
    { const [a, b] = P(-2, 20), [e, f] = P(2, 70); px(c, a, b, '#6a6048', e - a, f - b); }
    rect(0, 0, 10, 8, '#d8d4c4', '#ffffff', null); { const [hx, hy] = P(0, 0); txt(c, 'HOUSE', hx, hy, 1, '#202020'); } rect(-20, -4, 12, 16, '#8a2a20', '#ff8070', 'BARN'); rect(-9.75, 4, 6.5, 12, '#2a3a1a', '#8cff5a', 'PEN'); rect(13, -3, 4, 3, '#6a6a6a', '#c8c8c8', 'SHED');
    { const [a, b] = P(-30, -14); c.fillStyle = '#a8a8b0'; c.beginPath(); c.arc(a, b, 3 * k, 0, 7); c.fill(); txt(c, 'SILO', a, b - 3 * k - 6, 1, '#e8f0e8'); }
    { const [a, b] = P(9, 7); c.fillStyle = '#4fd6ff'; c.beginPath(); c.arc(a, b, Math.max(2, 0.9 * k), 0, 7); c.fill(); }
    { const [a, b] = P(-24, -27); c.fillStyle = '#2a5a8a'; c.beginPath(); c.ellipse(a, b, 7 * k, 5 * k, 0, 0, 7); c.fill(); txt(c, 'POND', a, b, 1, '#c8e0f0'); }
    { const [a, b] = P(0, 70); if (b < LH - 4) { px(c, a - 3 * k, b, '#ffd23f', 6 * k, 2); txt(c, 'GATE', a, b + 8, 1, '#ffd23f'); } } }
  // ---------- 41: generator noise rings (top-down) ----------
  blank('41_rings', (c, t) => { px(c, 0, 0, '#06120a', LW, LH); for (let y = 0; y < LH; y += 3) px(c, 0, y, 'rgba(60,140,60,0.06)', LW, 1); bevel(c, 6, 6, LW - 12, 22, '#0a1a10'); lft(c, 'MAP — FARM', 16, 17, 2, '#9ad8a0');
    const cx = 230 - 11.3 * 3.4, cy = 200 - 0.4 * 3.4; farmMap(c, cx, cy, 3.4); px(c, 228, 197, '#ff7b2e', 6, 6); txt(c, 'GENERATOR', 250, 214, 1, '#ff7b2e');
    const S = 0.19;   // px per ft (650 ft ring ~ 124 px)
    label(c, '70 dB @ 23 FT', 520, 60, '#ff7b2e', t, W('g4', 'seventy'));
    const cx0 = 230, cy0 = 200; [[150, 54], [300, 48], [650, 41]].forEach(([m, db], i) => { const tw = i === 0 ? W('g5', 'double') : i === 1 ? W('g5', 'six') : W('g6', 'fifty'); if (t < tw) return; const r = m * S; const k = ease(tw, tw + 0.4, t);
      c.strokeStyle = ['#ffd23f', '#ff9a3a', '#ff4030'][i]; c.setLineDash([4, 3]); c.beginPath(); c.arc(cx0 + 3, cy0, r * k, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      label(c, `${m} FT  ${db} dB`, cx0 + 3 + r * 0.72, cy0 - r * 0.72, ['#ffd23f', '#ff9a3a', '#ff4030'][i], t, tw + 0.3); });
    label(c, '-6 dB PER DOUBLING', 520, 92, '#ffffff', t, W('g5', 'six')); label(c, '~ A LIBRARY', 520, 124, '#4fd6ff', t, W('g6', 'library')); });
  // ---------- 53: hearing (you vs dog) ----------
  blank('53_hearing', (c, t) => { px(c, 0, 0, '#06120a', LW, LH); bevel(c, 6, 6, LW - 12, 22, '#0a1a10'); lft(c, 'MAP — FARM', 16, 17, 2, '#9ad8a0');
    const cx = 320, cy = 200; farmMap(c, cx, cy, 3.2);
    const t1 = W('n7', 'dog'), t2 = W('n7', 'four'); c.strokeStyle = '#4fd6ff'; c.beginPath(); c.arc(cx, cy, 34 * ease(t1 - 0.3, t1, t), 0, Math.PI * 2); c.stroke(); label(c, 'YOU', cx, cy - 48, '#4fd6ff', t, t1 - 0.2);
    if (t > t2) { const r = 136 * ease(t2, t2 + 0.8, t); c.strokeStyle = '#8cff5a'; c.setLineDash([4, 3]); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); label(c, 'RIBBON  x4', cx + 150, cy - 110, '#8cff5a', t, t2 + 0.4); } });

  // ---------- ITEM screen (RE2): 3D items rotate in the slots ----------
  const itemScene = new THREE.Scene(); itemScene.background = new THREE.Color(0x05070e); lit(itemScene);
  const SL = [[40, 44], [190, 44], [40, 126], [190, 126], [40, 208], [190, 208]];   // slot top-left (140x80)
  const P2 = (x, y) => [x - LW / 2, LH / 2 - y];
  const ITEMS = [['water', 'WATER', '110 GAL', ['i2', 'water'], 160], ['can', 'FOOD', '34 DAYS', ['i3', 'food'], 380], ['__freezer', 'FREEZER', '2 DAYS', ['i3b', 'freezer'], 1], ['jerrycan', 'DIESEL', '22 GAL', ['i4', 'diesel'], 120], ['feedsack', 'ANIMAL FEED', '26 DAYS', ['i5', 'animal'], 70], [null, 'MEDICINE', '0', ['i6', 'medicine'], 0]];
  const icons = [];
  for (let i = 0; i < ITEMS.length; i++) { const [n, , , , sc] = ITEMS[i]; const g = new THREE.Group(); if (n === '__freezer') { const fz = new THREE.Group(); L.box(56, 34, 30, L.lam(null, 0xe8ecf0), 0, 0, 0, fz); L.box(57, 4, 31, L.lam(null, 0xb8c0c8), 0, 17, 0, fz); L.box(10, 3, 2, L.lam(null, 0x8a9098), 0, 10, 16, fz); L.box(40, 2, 1, L.lam(null, 0x4fa0d8), 0, -4, 15.6, fz); g.add(fz); }
    else if (n) { const o = await prop(n); const bb = new THREE.Box3().setFromObject(o); o.position.y = -(bb.max.y + bb.min.y) / 2; g.add(o); }
    else { const sp = makeSpray(L); g.add(sp); }
    g.scale.setScalar(n ? sc : 220); const [X, Y] = P2(SL[i][0] + 40, SL[i][1] + 42); g.position.set(X, Y, 0); g.rotation.x = 0.3; itemScene.add(g); icons.push(g); }
  const slot = (c, x, y, w, h, col = '#58b07c') => { px(c, x, y, 'rgba(14,42,26,0.25)', w, h); for (let yy = y + 3; yy < y + h - 2; yy += 3) px(c, x + 2, yy, 'rgba(18,58,36,0.35)', w - 4, 1); px(c, x, y, col, w, 1); px(c, x, y, col, 1, h); px(c, x, y + h - 1, '#04100a', w, 1); px(c, x + w - 1, y, '#04100a', 1, h); };
  const itemShot = (id, med) => { out[id] = { scene: itemScene, camera: ortho(), update(lt) { const t = T[id] + lt; icons.forEach((g, i) => { const tw = W(...ITEMS[i][3]); const on = med ? (i < 5 || false) : t > tw - 0.05; g.visible = on && !(i === 5); g.children[0] && (g.children[0].rotation.y = 0.5 + lt * 0.8 + i); });
        icons[5].visible = med && t < W('i7', 'zero'); if (icons[5].visible) icons[5].children[0].traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) { m.transparent = true; m.opacity = 0.35; } }); },
      overlay(lt, dt, a, o) { const c = o.tctx, t = T[id] + lt; c.clearRect(0, 0, LW, LH);
        bevel(c, 6, 6, LW - 12, 22, '#0a1020'); lft(c, 'ITEM — DAY 1 SUPPLIES', 16, 17, 2, '#9ab0d8');
        ITEMS.forEach(([n, name, val, tw], i) => { const [x, y] = SL[i], on = med || t > W(...tw) - 0.05; const red = i === 5;
          slot(c, x, y, 140, 74, red && med ? '#d84030' : '#58b07c'); if (!on) return; c.globalAlpha = 1; lft(c, name, x + 6, y + 10, 1, '#c8e0c8'); txt(c, val, x + 108, y + 62, 2, red ? '#ff4030' : '#ffffff', '#000'); });
        // right panel: description of the newest item
        let cur = -1; ITEMS.forEach((it, i) => { if (t > W(...it[3])) cur = i; }); bevel(c, 350, 44, 270, 238, '#0a0e18');
        if (cur >= 0) { const [, name, val] = ITEMS[cur]; txt(c, name, 485, 90, 3, cur === 5 ? '#ff4030' : '#ffd23f'); txt(c, val, 485, 140, 5, cur === 5 ? '#ff4030' : '#ffffff');
          const note = ['FROM THE TUB, JUGS, HEATER', 'IF YOU LIKE CANNED BEANS', 'FULL FREEZER, DOOR SHUT', 'MANY 20-MIN REFILLS', 'HAY, CORN, LAYER FEED', 'NO FIRST AID SPRAY'][cur]; txt(c, note, 485, 200, 1, '#a8b0c0'); }
        if (med && t > W('i7', 'zero')) { const [x, y] = SL[5]; c.strokeStyle = '#ff4030'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 10, y + 8); c.lineTo(x + 130, y + 66); c.moveTo(x + 130, y + 8); c.lineTo(x + 10, y + 66); c.stroke(); c.lineWidth = 1;
          if (Math.floor(t * 4) % 2 === 0) txt(c, 'NO FIRST AID SPRAY', 485, 250, 2, '#ff4030'); } } }; };
  itemShot('64_item', false); itemShot('65_medicine', true);
  // ---------- 67: typewriter save ----------
  blank('67_save', (c, t) => { px(c, 0, 0, '#030303', LW, LH); const t0 = W('i10', 'save') - 0.3;
    c.fillStyle = 'rgba(232,226,214,0.05)'; for (let y = 110; y < 260; y += 2) c.fillRect(120, y, 400, 1);
    c.font = 'bold 34px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ece6da'; c.fillText(typed('DAY 1 — THE FARM', t, t0, 14), LW / 2, 170);
    if (t > t0 + 1.6) { c.font = 'bold 16px "Courier New", monospace'; c.fillStyle = '#a8a49c'; c.fillText(typed('GAME SAVED.', t, t0 + 1.6, 18), LW / 2, 220); }
    if (Math.floor(t * 2.5) % 2 === 0) { c.fillStyle = '#ece6da'; c.fillRect(LW / 2 + c.measureText(typed('DAY 1 — THE FARM', t, t0, 14)).width / 2 + 4, 186, 18, 3); } });
  // ---------- 74: end card (rotating textured barn + PART 2 + SUBSCRIBE!), v2: real boards/roof/door, text above the subtitle line ----------
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x020203); lit(s); const g = new THREE.Group(); s.add(g);
    const tB = L.cvs(32, 32, (c) => { const r = L.rng(3); for (let x = 0; x < 32; x++) for (let y = 0; y < 32; y++) px(c, x, y, `rgb(${150 + (x % 6 === 0 ? -55 : 0) + (r() - 0.5) * 20 | 0},${32 + (r() - 0.5) * 10 | 0},26)`); });
    const tR = L.cvs(32, 32, (c) => { const r = L.rng(4); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) px(c, x, y, x % 6 < 2 ? '#6a6e76' : `rgb(${86 + (r() - 0.5) * 14 | 0},${88 + (r() - 0.5) * 14 | 0},${94 + (r() - 0.5) * 14 | 0})`); });
    const tD = L.cvs(32, 32, (c) => { px(c, 0, 0, '#8a2a20', 32, 32); for (let k = 0; k < 32; k++) { px(c, k, k, '#e8e4d8', 2, 1); px(c, 31 - k, k, '#e8e4d8', 2, 1); } px(c, 0, 0, '#e8e4d8', 32, 2); px(c, 0, 30, '#e8e4d8', 32, 2); px(c, 0, 0, '#e8e4d8', 2, 32); px(c, 30, 0, '#e8e4d8', 2, 32); });
    const red = L.lam(L.rep(tB, 3, 2)), roof = L.lam(L.rep(tR, 3, 2), 0xffffff, { side: THREE.DoubleSide });
    L.box(60, 34, 76, red, 0, 0, 0, g);
    const sh = new THREE.Shape(); sh.moveTo(-34, 0); sh.lineTo(34, 0); sh.lineTo(0, 24); sh.lineTo(-34, 0); const prism = new THREE.ExtrudeGeometry(sh, { depth: 80, bevelEnabled: false }); prism.translate(0, 0, -40);   // triangular roof, ridge along z
    L.mesh(prism, roof, 0, 17, 0, g);
    for (const z of [-15, 15]) L.box(1, 28, 28, L.lam(tD), 30.6, -3, z * 0 + (z < 0 ? -15 : 15) * 0.95, g);
    L.box(0.8, 28, 3, L.lam(null, 0x050404), 30.9, -3, 0, g);   // the gap between the leaves (ajar)
    L.box(1, 12, 12, L.lam(null, 0x120c08), 30.6, 22, 0, g);   // hay loft
    g.position.set(0, 96, 0); g.scale.setScalar(1.25);
    out['74_end'] = { scene: s, camera: ortho(), update(lt) { g.rotation.set(0.25, 0.6 + lt * 0.5, 0); },
      overlay(lt, dt, a, o) { const c = o.tctx; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = 'bold 20px "Courier New", monospace'; c.fillStyle = '#a8a49c'; c.fillText(typed('PART 2:', lt, 0.3, 14), LW / 2, 172);
        c.font = 'bold 26px "Courier New", monospace'; c.fillStyle = '#ece6da'; c.fillText(typed('SOMETHING IN THE BARN', lt, 1.0, 16), LW / 2, 204);
        if (lt > 2.6) txt(c, 'SUBSCRIBE!', LW / 2, 248, 4, '#ff4030', '#000'); } }; }
  return out;
}

export function sfx(ctx) {
  const { T, at } = ctx, W = (k, w = 0) => at(k, w), E = [], p = (t, n) => E.push([t, n]);
  p(W('h2', 'zombie') - 0.25, 'phone_alert'); for (const w of ['zombie', 'shelter', 'avoid']) p(W('h2', w), 'label');
  p(T['10_map'], 'map_open'); for (const w of ['neighbor', 'gravel', 'gate']) p(W('a3', w), 'label'); p(W('b3', 'everybody'), 'map_blink');
  p(W('b4', 'filling'), 'car_horns_far'); p(W('b5', 'toward'), 'label_pop_danger');
  p(T['21_rule1'], 'file_open'); p(W('b9', 'farm'), 'stamp'); for (const w of ['stay', 'towns', 'highways', 'gas', 'shelters']) p(W('b9', w), 'file_line'); p(W('b10', 'crowds'), 'label_pop_danger');
  p(W('w2', 'electric'), 'label'); for (const w of ['grid', 'house', 'pump', 'water']) p(W('w3', w), 'file_line');
  p(W('w4', 'power'), 'power_down_hum'); p(W('w5', 'pump'), 'label_pop_danger'); p(W('w5', 'water'), 'label_pop_danger');
  for (let t = W('w7', 'clock'); t < W('w7', 'clock') + 4; t += 0.25) p(t, 'clock_tick_fast'); p(W('w7', 'maybe'), 'label'); p(W('w7', 'fill'), 'label');
  for (let t = W('w11', 0); t < W('w11', -1); t += 0.08) p(t, 'counter_tick');
  p(T['34_ready'], 'file_open'); for (const w of ['one', 'drinking', 'alone']) p(W('w12', w), 'file_line');
  p(W('g4', 'seventy'), 'label'); p(W('g5', 'double'), 'ring_expand'); p(W('g5', 'six'), 'ring_expand'); p(W('g6', 'fifty'), 'ring_expand'); p(W('g6', 'library'), 'label');
  p(W('n7', 'dog') - 0.2, 'sound_ring'); p(W('n7', 'four'), 'ring_expand');
  p(T['64_item'], 'menu_open'); for (const [k, w] of [['i2', 'water'], ['i3', 'food'], ['i3b', 'freezer'], ['i4', 'diesel'], ['i5', 'animal'], ['i6', 'medicine']]) p(W(k, w), 'item_pop');
  p(W('i7', 'zero'), 'stamp_x'); p(W('i7', 'zero') + 0.05, 'alarm_beep');
  { const t0 = W('i10', 'save') - 0.3; [...'DAY 1 - THE FARM'].forEach((c, i) => { if (c !== ' ') p(t0 + (i + 1) / 14, 'type_key'); }); p(t0 + 1.6, 'type_return'); p(t0 + 2.4, 'save_chime'); }
  p(T['74_end'] + 0.05, 'menu_open'); p(W('x8', 'one'), 'cursor_move'); p(W('x8', 'two'), 'cursor_move'); p(W('x8', 'comment'), 'label'); p(ctx.endOf('x8', -1) + 0.6, 'label');
  p(W('b8b', 'empty'), 'label_pop_danger'); p(W('b8b', 'stuck'), 'label');
  return E.filter((e) => Number.isFinite(e[0]));
}

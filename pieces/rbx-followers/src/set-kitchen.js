// rbx-followers KITCHEN set: small suburban kitchen at night, the dad's notes on the fridge.
// Room x -10..10, z -8..8, floor y 0, ceiling y 12. Fridge against the back wall (z=-8) at x=-5; its door face at z=-6.6.
// Counters + subway tiles + upper cabinets along the back wall, window over the sink (night blue), warm pendant lamp, table.
'use strict';
SETS.kitchen = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng } = RBX, { V, texPair, noiseOver, woodPlanks, box, rb } = KIT, PI = Math.PI;
  const scene = new T.Scene(); scene.background = new T.Color('#05070f');
  const X0 = -10, X1 = 10, Z0 = -8, Z1 = 8, RH = 12;
  const add = (...o) => { o.forEach((m) => scene.add(m)); return o[0]; };
  const SM = (c, r = 0.6, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const wall = texPair(512, (g, hg, S) => { g.fillStyle = '#e8c87a'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.12, 16, 4);   // mustard wallpaper, cream pinstripes + tiny lemons
    for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(255,248,220,0.6)'; g.fillRect(k * S / 8, 0, 5, S); }
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const x = i * S / 8 + 32, y = j * S / 8 + (i % 2 ? 32 : 0); g.fillStyle = '#f6e04a'; g.beginPath(); g.ellipse(x, y, 10, 7, 0.5, 0, 7); g.fill(); g.fillStyle = '#5a9a3a'; g.beginPath(); g.ellipse(x + 8, y - 7, 5, 2.5, -0.6, 0, 7); g.fill(); } });
  const tiles = texPair(512, (g, hg, S) => { g.fillStyle = '#8f8a80'; g.fillRect(0, 0, S, S); hg.fillStyle = '#303030'; hg.fillRect(0, 0, S, S); const r = rng(8), rows = 8, cols = 4, th = S / rows, tw = S / cols;
    for (let row = 0; row < rows; row++) for (let k = -1; k <= cols; k++) { const x = k * tw + (row % 2 ? tw / 2 : 0), y = row * th, t = 0.9 + r() * 0.12; g.fillStyle = `rgb(${240 * t},${246 * t},${244 * t})`; g.fillRect(x + 3, y + 3, tw - 6, th - 6); hg.fillStyle = '#e0e0e0'; hg.fillRect(x + 3, y + 3, tw - 6, th - 6); } });
  const floor = texPair(512, (g, hg, S) => { const n = 8, q = S / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#2a3a5a' : '#efe8d8'; g.fillRect(i * q, j * q, q, q); hg.fillStyle = '#c0c0c0'; hg.fillRect(i * q + 2, j * q + 2, q - 4, q - 4); } noiseOver(g, S, S, 9, 0.12, 16, 4); });
  const M = { wall: pbr(wall.c, wall.h, { rough: 0.85, bump: 2, repeat: [1 / 6, 1 / 6] }), tile: pbr(tiles.c, tiles.h, { rough: 0.25, bump: 3, repeat: [1 / 3, 1 / 3] }), floor: pbr(floor.c, floor.h, { rough: 0.4, bump: 2, repeat: [1 / 8, 1 / 8] }),
    cab: pbr(woodPlanks(512, 61, { rows: 3, tones: ['#4f7a6a', '#4a7262', '#558070'] }).c, null, { rough: 0.6 }), top: SM('#e8e2d6', 0.3), steel: SM('#c6c9cc', 0.25, 0.85), dark: SM('#2a2622', 0.7),
    fridge: new T.MeshPhysicalMaterial({ color: '#e8f0f2', roughness: 0.22, clearcoat: 0.8 }), trim: SM('#f6f2e8', 0.5), table: pbr(woodPlanks(512, 57, { rows: 4, tones: ['#8a4e26', '#7e4620', '#94562c'] }).c, null, { rough: 0.6 }) };
  // shell
  add(box(X1 - X0, 0.4, Z1 - Z0, M.floor, 0, -0.2, 0, true), box(X1 - X0, 0.4, Z1 - Z0, M.trim, 0, RH + 0.2, 0, true));
  add(box(X1 - X0, RH, 0.4, M.wall, 0, RH / 2, Z0 - 0.2, true), box(0.4, RH, Z1 - Z0, M.wall, X0 - 0.2, RH / 2, 0, true), box(0.4, RH, Z1 - Z0, M.wall, X1 + 0.2, RH / 2, 0, true), box(X1 - X0, RH, 0.4, M.wall, 0, RH / 2, Z1 + 0.2, true));
  add(box(X1 - X0, 0.6, 0.2, M.trim, 0, 0.3, Z0 + 0.1));
  // counters along the back wall (x -2..10), sink under the window, stove, backsplash, upper cabinets
  const CT = 3.3; add(box(12, CT - 0.3, 2.4, M.cab, 4, (CT - 0.3) / 2, Z0 + 1.2, true), box(12.2, 0.3, 2.6, M.top, 4, CT - 0.15, Z0 + 1.3));
  for (let x = -1.5; x <= 9.5; x += 2.2) add(box(0.06, 2.4, 0.04, M.dark, x, 1.6, Z0 + 2.42), rb(0.12, 0.5, 0.1, 0.04, M.steel, x - 0.5, 2.4, Z0 + 2.48));
  add(box(12, 3.4, 0.1, M.tile, 4, CT + 1.7, Z0 + 0.05, true));
  [-1.6, 1.0, 7.0, 9.0].forEach((x) => add(box(2.4, 2.8, 1.4, M.cab, x + 0.2, 8.6, Z0 + 0.7, true)));
  const win = { x: 4, y: 6.3, w: 4.2, h: 3.4 };   // window over the sink: night outside (deep blue + a lit window across the street)
  const wt = KIT.textTex(512, 420, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1440'); gr.addColorStop(1, '#2a3a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#060a1e'; g.fillRect(0, h * 0.55, w, h); g.beginPath(); g.moveTo(60, h * 0.55); g.lineTo(200, h * 0.3); g.lineTo(340, h * 0.55); g.fill(); g.fillStyle = '#ffb45a'; g.fillRect(150, h * 0.62, 50, 44); g.fillRect(240, h * 0.62, 50, 44);
    g.fillStyle = '#f4f0ff'; g.beginPath(); g.arc(420, 70, 26, 0, 7); g.fill(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect((i * 97) % w, (i * 53) % (h * 0.5), 2, 2); } });
  add(box(win.w, win.h, 0.1, new T.MeshBasicMaterial({ map: wt, toneMapped: false, color: new T.Color(1.3, 1.3, 1.5) }), win.x, win.y, Z0 + 0.12));
  add(box(win.w + 0.4, 0.25, 0.3, M.trim, win.x, win.y + win.h / 2, Z0 + 0.2), box(win.w + 0.8, 0.25, 0.6, M.trim, win.x, win.y - win.h / 2, Z0 + 0.3), box(0.15, win.h, 0.2, M.trim, win.x, win.y, Z0 + 0.2), box(win.w, 0.15, 0.2, M.trim, win.x, win.y, Z0 + 0.2));
  add(box(2.6, 0.12, 1.6, M.steel, win.x, CT + 0.01, Z0 + 1.3)); const tap = new T.Mesh(new T.TorusGeometry(0.4, 0.07, 8, 16, PI), M.steel); tap.position.set(win.x, CT + 0.5, Z0 + 0.5); add(tap);
  add(box(2.4, 0.15, 2.0, M.dark, 8.4, CT + 0.08, Z0 + 1.3)); [[7.8, -0.6], [9.0, -0.6], [7.8, 0.5], [9.0, 0.5]].forEach(([x, dz]) => { const b = new T.Mesh(new T.TorusGeometry(0.32, 0.06, 6, 16), SM('#1a1a1a', 0.5)); b.rotation.x = PI / 2; b.position.set(x, CT + 0.18, Z0 + 1.3 + dz); add(b); });
  // lunchbox + cereal + mugs on the counter
  add(rb(1.2, 0.9, 0.7, 0.12, SM('#2F7BF5', 0.4), 1.2, CT + 0.45, Z0 + 1.6)); add(box(0.9, 1.4, 0.35, SM('#e8b830', 0.6), -0.8, CT + 0.7, Z0 + 0.8));
  ['#d23a2a', '#f4f2ee'].forEach((c, i) => { const m = new T.Mesh(new T.CylinderGeometry(0.22, 0.2, 0.45, 14), SM(c, 0.4)); m.position.set(6 + i * 0.6, CT + 0.23, Z0 + 1.8); add(m); });
  // the FRIDGE (x=-5, against the back wall): retro mint, chrome handles, magnets; on the door: today's note on top of a stack of older notes
  const FX = -5.2, FZ = Z0 + 1.4, FW = 3.0, FH = 8.4, FD = 2.6; add(rb(FW, FH, FD, 0.3, M.fridge, FX, FH / 2 + 0.1, FZ));
  const front = FZ + FD / 2 + 0.01; add(box(FW - 0.2, 0.06, 0.04, M.dark, FX, 5.7, front));
  [[7.2, 1.0], [3.4, 2.2]].forEach(([y, h]) => add(rb(0.16, h, 0.18, 0.05, M.steel, FX + FW / 2 - 0.35, y, front + 0.12)));
  const hand = '"Segoe Print", "Comic Sans MS", cursive';
  const noteTex = (lines, o = {}) => KIT.textTex(400, 440, (g, w, h) => { g.fillStyle = o.bg || '#fff3a8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,120,200,0.35)'; g.lineWidth = 2; for (let y = 70; y < h; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#1a2a6a'; g.font = `700 ${o.fs || 34}px ${hand}`; lines.forEach((l, i) => g.fillText(l, 24, 60 + i * 46)); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(120,90,30,0.18)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const NOTE = ["Dinner's in the", 'oven. Love you.', '', "Don't look back,", 'kiddo. Whatever\'s', "behind you, I've", 'got it.', '       - Dad'];
  const OLD = [['Math test! You', 'got this.', '', "Don't look back,", 'kiddo...'], ['Pizza money in', 'the jar.', '', "Don't look back,", 'kiddo...'], ['Happy birthday', 'champ!!', '', "Don't look back,", 'kiddo...'], ['Lights off by 9.', '', "Don't look back,", 'kiddo...']];
  const notes = new T.Group(); scene.add(notes); const r = rng(77);
  OLD.forEach((l, i) => { const p = new T.Mesh(new T.PlaneGeometry(1.25, 1.38), new T.MeshStandardMaterial({ map: noteTex(l, { bg: ['#ffe9a0', '#ffd0dc', '#d8f0c8', '#cfe4ff'][i] }), roughness: 0.9 }));
    p.position.set(FX + (i % 2 ? 0.55 : -0.6), [7.2, 6.9, 4.6, 4.2][i], front + 0.012 + i * 0.002); p.rotation.z = (r() - 0.5) * 0.3; notes.add(p); });
  const main = new T.Mesh(new T.PlaneGeometry(1.4, 1.54), new T.MeshStandardMaterial({ map: noteTex(NOTE, { fs: 31 }), roughness: 0.9 })); main.position.set(FX - 0.05, 6.15, front + 0.03); main.rotation.z = 0.04; notes.add(main);
  const mag = (x, y, c) => { const m = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.1, 16), SM(c, 0.3)); m.rotation.x = PI / 2; m.position.set(x, y, front + 0.06); notes.add(m); };
  mag(FX - 0.05, 6.98, '#d23a2a'); mag(FX - 0.6, 7.94, '#2f6fd1'); mag(FX + 0.55, 7.64, '#3c9a4a'); mag(FX - 0.6, 5.36, '#e8b830'); mag(FX + 0.55, 4.96, '#b04ad2');
  // little drawing: a kid with a tall hi-vis guy far behind (only the kid is coloured in)
  const dr = KIT.textTex(320, 260, (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f6fd1'; g.lineWidth = 6; g.beginPath(); g.arc(90, 90, 26, 0, 7); g.stroke(); g.beginPath(); g.moveTo(90, 116); g.lineTo(90, 190); g.moveTo(60, 140); g.lineTo(120, 140); g.moveTo(90, 190); g.lineTo(66, 236); g.moveTo(90, 190); g.lineTo(114, 236); g.stroke();
    g.fillStyle = '#c0392b'; g.font = 'bold 40px "Comic Sans MS"'; g.fillText('ME', 150, 120); g.fillStyle = '#9a9a9a'; g.font = 'bold 60px "Comic Sans MS"'; g.fillText('?', 250, 110); });
  const dp = new T.Mesh(new T.PlaneGeometry(1.1, 0.9), new T.MeshStandardMaterial({ map: dr, roughness: 0.9 })); dp.position.set(FX + 0.3, 2.6, front + 0.012); dp.rotation.z = -0.05; notes.add(dp); mag(FX + 0.3, 3.0, '#e07a1f');
  // table + chairs (front right), a plate covered with foil
  add(box(5, 0.3, 3.4, M.table, 4.5, 3.0, 3.5, true)); [[-2.2, -1.4], [2.2, -1.4], [-2.2, 1.4], [2.2, 1.4]].forEach(([x, z]) => add(box(0.3, 2.9, 0.3, M.table, 4.5 + x, 1.45, 3.5 + z)));
  add(new T.Mesh(new T.CylinderGeometry(0.8, 0.8, 0.06, 20), SM('#f4f2ee', 0.3))).position.set(4.0, 3.2, 3.2); add(new T.Mesh(new T.SphereGeometry(0.7, 16, 8, 0, PI * 2, 0, PI / 2), SM('#d8dce0', 0.25, 0.9))).position.set(4.0, 3.2, 3.2);
  // lights: warm pendant over the table, cool moon through the window, a dim fridge glow
  const pend = new T.Group(); pend.position.set(1.0, RH, 1.0); scene.add(pend); const cord = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 3, 6), M.dark); cord.position.y = -1.5; pend.add(cord);
  const shade = new T.Mesh(new T.ConeGeometry(1.0, 0.9, 20, 1, true), new T.MeshStandardMaterial({ color: '#c0392b', roughness: 0.5, side: T.DoubleSide })); shade.position.y = -3.3; pend.add(shade);
  const bulb = new T.Mesh(new T.SphereGeometry(0.28, 12, 8), new T.MeshBasicMaterial({ color: new T.Color(4, 3, 1.8), toneMapped: false })); bulb.position.y = -3.6; pend.add(bulb);
  const L = new T.PointLight('#ffb870', 90, 26, 2); L.position.set(1.0, RH - 3.8, 1.0); L.castShadow = true; L.shadow.mapSize.set(2048, 2048); L.shadow.bias = -0.002; scene.add(L);
  const moon = new T.DirectionalLight('#7a90ff', 1.6); moon.position.set(4, 14, -30); moon.target.position.set(0, 0, 4); scene.add(moon, moon.target);
  scene.add(new T.HemisphereLight('#5a6aaa', '#2a1a10', 0.7));
  const fl = new T.PointLight('#cfe8ff', 6, 8, 2); fl.position.set(FX, 6, front + 2.5); scene.add(fl);
  scene.traverse((m) => { if (m.isMesh) { m.castShadow = !(m.material.isMeshBasicMaterial || m.material.transparent); m.receiveShadow = true; } });
  return { scene, grade: 'night', fridge: { x: FX, y: 6.15, z: front }, views: { wide: { p: [6, 7, 7.5], l: [-3, 4.5, -6], fov: 60 } } };
};

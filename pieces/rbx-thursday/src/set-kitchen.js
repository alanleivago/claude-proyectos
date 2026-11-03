// rbx-thursday KITCHEN set: open kitchen + dining room, ground floor, night. Boarded front window (levels 1-3),
// wall calendar (November, THURSDAY column) with 3 marker states, wall clock, tower of coffee mugs, step stool for Dad.
'use strict';
SETS.kitchen = async function (ctx) {
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const { V, texPair, noiseOver, woodPlanks, box, rb, wm, shadow } = KIT;
  const X0 = -10, X1 = 10, Z0 = -8, Z1 = 8, RH = 12, WT = 0.6;
  const WIN = { x0: -6.5, x1: -1.5, y0: 3, y1: 8 }, WCX = (WIN.x0 + WIN.x1) / 2;
  const DOOR = { x0: 2.2, x1: 5.8, y1: 8.5 };
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#02030a');

  // ---------------- textures ----------------
  const wallpaperT = texPair(512, (g, hg, S) => {   // teal damask-ish: cream pin stripes + 4-petal flowers in a lattice
    g.fillStyle = '#2b5a66'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 7, 0.16, 16, 4);
    for (let k = 0; k < 4; k++) { const x = k * S / 4; g.fillStyle = 'rgba(70,120,128,0.55)'; g.fillRect(x + 50, 0, 28, S); g.fillStyle = 'rgba(232,214,170,0.55)'; g.fillRect(x + 2, 0, 4, S); hg.fillStyle = '#a0a0a0'; hg.fillRect(x + 2, 0, 4, S); }
    const flower = (x, y, s) => { for (let a = 0; a < 4; a++) { const an = a * Math.PI / 2 + Math.PI / 4; g.fillStyle = '#e2c98c'; g.beginPath(); g.ellipse(x + Math.cos(an) * s * 0.55, y + Math.sin(an) * s * 0.55, s * 0.5, s * 0.26, an, 0, 7); g.fill(); hg.fillStyle = '#d0d0d0'; hg.beginPath(); hg.ellipse(x + Math.cos(an) * s * 0.55, y + Math.sin(an) * s * 0.55, s * 0.5, s * 0.26, an, 0, 7); hg.fill(); }
      g.fillStyle = '#b5523a'; g.beginPath(); g.arc(x, y, s * 0.22, 0, 7); g.fill(); };
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * S / 4 + 64 + (j % 2 ? 0 : 0), y = j * S / 4 + (i % 2 ? 64 : 0); flower(x, y, 20); for (const ox of [-S, S]) flower(x, y + ox, 20); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(226,201,140,0.7)'; g.beginPath(); g.arc(i * S / 4 + 20, j * S / 8 + 32, 3, 0, 7); g.fill(); }
    const n = tnoise(4, 128), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = im.data[i * 4] * 0.85 + n((i % S) / S, Math.floor(i / S) / S) * 38; hg.putImageData(im, 0, 0);
  });
  const floorT = woodPlanks(1024, 33, { rows: 6, knots: 30, tones: ['#a8682f', '#9a5c28', '#b4743a', '#8e5224', '#a26530'] });
  const plankTs = [0, 1, 2].map((k) => woodPlanks(512, 41 + k, { rows: 1, tones: [['#6b3a20', '#7a4627', '#5e3219'][k]], knots: 5 }));
  const darkWoodT = woodPlanks(512, 51, { rows: 4, tones: ['#5a2f17', '#4f2813', '#633519', '#56301a'] });
  const tableT = woodPlanks(512, 57, { rows: 4, tones: ['#7a4322', '#6e3b1d', '#834a26', '#74401f'], knots: 6 });
  const tileT = texPair(512, (g, hg, S) => {   // cream subway tiles
    g.fillStyle = '#8f8a80'; g.fillRect(0, 0, S, S); hg.fillStyle = '#303030'; hg.fillRect(0, 0, S, S);
    const r = rng(8), rows = 8, cols = 4, th = S / rows, tw = S / cols;
    for (let row = 0; row < rows; row++) for (let k = -1; k <= cols; k++) { const x = k * tw + (row % 2 ? tw / 2 : 0), y = row * th, t = 0.9 + r() * 0.12;
      const gr = g.createLinearGradient(0, y, 0, y + th); gr.addColorStop(0, `rgb(${236 * t},${228 * t},${206 * t})`); gr.addColorStop(1, `rgb(${214 * t},${204 * t},${180 * t})`); g.fillStyle = gr; g.fillRect(x + 3, y + 3, tw - 6, th - 6);
      hg.fillStyle = '#b0b0b0'; hg.fillRect(x + 3, y + 3, tw - 6, th - 6); hg.fillStyle = '#c8c8c8'; hg.fillRect(x + 8, y + 8, tw - 16, th - 16); }
    noiseOver(g, S, S, 9, 0.12, 16, 3);
  });
  const graniteT = texPair(512, (g, hg, S) => { g.fillStyle = '#2e3230'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 4, 0.5, 8, 5); const r = rng(21);
    for (let i = 0; i < 2600; i++) { const x = r() * S, y = r() * S, c = r(); g.fillStyle = c < 0.5 ? 'rgba(200,190,170,0.55)' : c < 0.8 ? 'rgba(10,10,10,0.7)' : 'rgba(150,110,80,0.6)'; g.fillRect(x, y, 1 + r() * 3, 1 + r() * 3); } });
  const plasterT = texPair(256, (g, hg, S) => { g.fillStyle = '#c9c2b0'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.25, 8, 4); const n = tnoise(6, 64), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 100 + n((i % S) / S, Math.floor(i / S) / S) * 60; hg.putImageData(im, 0, 0); });
  const cabDoorT = texPair(256, (g, hg, S) => {   // painted shaker door: frame + recessed panel
    g.fillStyle = '#d6c9a6'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 12, 0.14, 8, 3);
    g.fillStyle = 'rgba(70,55,30,0.35)'; g.fillRect(36, 36, S - 72, 6); g.fillRect(36, 36, 6, S - 72); g.fillStyle = 'rgba(255,250,235,0.35)'; g.fillRect(36, S - 42, S - 72, 6); g.fillRect(S - 42, 36, 6, S - 72);
    hg.fillStyle = '#e0e0e0'; hg.fillRect(0, 0, S, S); hg.fillStyle = '#707070'; hg.fillRect(40, 40, S - 80, S - 80); hg.fillStyle = '#000'; hg.fillRect(0, 0, S, 3); hg.fillRect(0, S - 3, S, 3); hg.fillRect(0, 0, 3, S); hg.fillRect(S - 3, 0, 3, S);
  });
  const rugT = texPair(1024, (g, hg, S, Hh) => {
    const band = (x0, y0, x1, y1, c) => { g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
    band(0, 0, S, Hh, '#1d2f6b'); band(36, 36, S - 36, Hh - 36, '#d9a43a'); band(60, 60, S - 60, Hh - 60, '#2c4f8a');
    for (let x = 60; x < S - 60; x += 40) { g.fillStyle = '#d9a43a'; g.beginPath(); g.moveTo(x, 60); g.lineTo(x + 20, 90); g.lineTo(x + 40, 60); g.fill(); g.beginPath(); g.moveTo(x, Hh - 60); g.lineTo(x + 20, Hh - 90); g.lineTo(x + 40, Hh - 60); g.fill(); }
    const diamond = (cx, cy, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath(); g.fill(); };
    diamond(S / 2, Hh / 2, 330, 230, '#9b2320'); diamond(S / 2, Hh / 2, 290, 196, '#f1e6c8'); diamond(S / 2, Hh / 2, 220, 150, '#1d2f6b'); diamond(S / 2, Hh / 2, 120, 84, '#d9a43a'); diamond(S / 2, Hh / 2, 50, 36, '#9b2320');
    [[150, 150], [S - 150, 150], [150, Hh - 150], [S - 150, Hh - 150]].forEach(([x, y]) => { diamond(x, y, 60, 60, '#9b2320'); diamond(x, y, 30, 30, '#f1e6c8'); });
    noiseOver(g, S, Hh, 78, 0.22, 16, 3);
    const n = tnoise(8, 300), hm = hg.getImageData(0, 0, S, Hh); for (let y = 0; y < Hh; y++) for (let x = 0; x < S; x++) { hm.data[(y * S + x) * 4] = 90 + n(x / S, y / Hh) * 120; } hg.putImageData(hm, 0, 0);
  }, { h: 720 });
  const cardT = texPair(256, (g, hg, S) => { g.fillStyle = '#b48a55'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 14, 0.25, 16, 3); for (let y = 0; y < S; y += 6) { hg.fillStyle = y % 12 ? '#909090' : '#707070'; hg.fillRect(0, y, S, 3); }
    g.fillStyle = 'rgba(205,190,150,0.8)'; g.fillRect(S / 2 - 22, 0, 44, S); });
  const leatherT = (c, seed) => texPair(256, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); noiseOver(g, S, S, seed, 0.35, 32, 4); g.strokeStyle = 'rgba(255,240,210,0.35)'; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(14, 14, S - 28, S - 28); g.setLineDash([]); const n = tnoise(seed, 200), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 100 + n((i % S) / S, Math.floor(i / S) / S) * 80; hg.putImageData(im, 0, 0); });
  const doorT = texPair(256, (g, hg) => { g.drawImage(darkWoodT.c, 0, 0, 256, 512); [[28, 24, 88, 140], [140, 24, 88, 140], [28, 190, 88, 140], [140, 190, 88, 140], [28, 356, 88, 130], [140, 356, 88, 130]].forEach(([x, y, w, h]) => { g.strokeStyle = 'rgba(30,12,4,0.85)'; g.lineWidth = 5; g.strokeRect(x, y, w, h); g.strokeStyle = 'rgba(200,140,90,0.3)'; g.lineWidth = 2; g.strokeRect(x + 6, y + 6, w - 12, h - 12); hg.fillStyle = '#606060'; hg.fillRect(x, y, w, h); hg.fillStyle = '#909090'; hg.fillRect(x + 8, y + 8, w - 16, h - 16); }); }, { h: 512 });
  const nightSky = (() => {
    const c = cnv(1024, 1024), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1024);
    gr.addColorStop(0, '#3a5fe0'); gr.addColorStop(0.7, '#7d9cff'); gr.addColorStop(1, '#a9c2ff'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    const r = rng(3); for (let i = 0; i < 260; i++) { g.fillStyle = '#ffffff'; const s = r() < 0.1 ? 3 : 2; g.fillRect(r() * 1024, r() * 700, s, s); }
    // town rooftops with warm windows along the bottom
    g.fillStyle = '#0c1440'; let x = 0; while (x < 1024) { const w = 60 + r() * 90, h = 120 + r() * 140; g.fillRect(x, 1024 - h, w, h); g.beginPath(); g.moveTo(x - 8, 1024 - h); g.lineTo(x + w / 2, 1024 - h - 50 - r() * 30); g.lineTo(x + w + 8, 1024 - h); g.fill();
      for (let k = 0; k < 3; k++) if (r() < 0.45) { g.fillStyle = '#ffb35a'; g.fillRect(x + 10 + r() * (w - 30), 1024 - h + 30 + r() * (h - 60), 12, 14); g.fillStyle = '#0c1440'; }
      x += w + 6 + r() * 20; }
    return tex(c);
  })();

  const M = {
    wall: pbr(wallpaperT.c, wallpaperT.h, { rough: 0.9, bump: 2, repeat: [1 / 3, 1 / 3] }),
    floor: pbr(floorT.c, floorT.h, { rough: 0.45, bump: 4, repeat: [1 / 8, 1 / 8] }),
    planks: plankTs.map((t) => pbr(t.c, t.h, { rough: 0.8, bump: 4 })),
    dark: pbr(darkWoodT.c, darkWoodT.h, { rough: 0.6, bump: 3 }),
    table: pbr(tableT.c, tableT.h, { rough: 0.4, bump: 3 }),
    tile: pbr(tileT.c, tileT.h, { rough: 0.22, bump: 3, repeat: [1 / 3, 1 / 3] }),
    granite: pbr(graniteT.c, graniteT.h, { rough: 0.3, bump: 1 }),
    cab: pbr(cabDoorT.c, cabDoorT.h, { rough: 0.55, bump: 2 }),
    cabBody: new THREE.MeshStandardMaterial({ color: '#cbbd98', roughness: 0.6 }),
    plaster: pbr(plasterT.c, plasterT.h, { rough: 0.95, bump: 1.5, repeat: [1 / 4, 1 / 4] }),
    trim: new THREE.MeshStandardMaterial({ color: '#e2dccb', roughness: 0.6 }),
    rug: pbr(rugT.c, rugT.h, { rough: 1, bump: 1.2, nscale: 0.5 }),
    card: pbr(cardT.c, cardT.h, { rough: 0.9, bump: 2 }),
    door: pbr(doorT.c, doorT.h, { rough: 0.55, bump: 3 }),
    steel: new THREE.MeshStandardMaterial({ color: '#b9bec4', roughness: 0.28, metalness: 0.9 }),
    iron: new THREE.MeshStandardMaterial({ color: '#232326', roughness: 0.5, metalness: 0.7 }),
    copper: new THREE.MeshStandardMaterial({ color: '#c46f3c', roughness: 0.3, metalness: 0.95 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c9a35a', roughness: 0.3, metalness: 0.9 }),
    nail: new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: 0.4, metalness: 0.8 }),
    black: new THREE.MeshStandardMaterial({ color: '#121214', roughness: 0.35 }),
    fridge: new THREE.MeshPhysicalMaterial({ color: '#bfe0d2', roughness: 0.25, clearcoat: 0.7 }),
    shell: new THREE.MeshStandardMaterial({ color: '#0b0e1c', roughness: 1 }),
  };
  const room = new THREE.Group(); scene.add(room);
  const add = (...o) => { o.forEach((k) => room.add(k)); return o[0]; };
  const worldPlane = (w, h, mat) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h); return new THREE.Mesh(g, mat); };

  // ---------------- shell ----------------
  (function shell() {
    const sh = new THREE.Shape(); sh.moveTo(X0, -0.5); sh.lineTo(X1, -0.5); sh.lineTo(X1, RH); sh.lineTo(X0, RH); sh.closePath();
    const hole = (x0, y0, x1, y1) => { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); sh.holes.push(p); };
    hole(WIN.x0, WIN.y0, WIN.x1, WIN.y1); hole(DOOR.x0, 0, DOOR.x1, DOOR.y1);
    const front = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }), M.wall); front.position.z = Z0 - WT; add(front);
    const back = worldPlane(X1 - X0, RH, M.wall); back.position.set(0, RH / 2, Z1); back.rotation.y = Math.PI; add(back);
    const left = worldPlane(Z1 - Z0, RH, M.wall); left.position.set(X0, RH / 2, 0); left.rotation.y = Math.PI / 2; add(left);
    const right = worldPlane(Z1 - Z0, RH, M.wall); right.position.set(X1, RH / 2, 0); right.rotation.y = -Math.PI / 2; add(right);
    const fl = worldPlane(X1 - X0, Z1 - Z0, M.floor); fl.rotation.x = -Math.PI / 2; add(fl);
    const ce = worldPlane(X1 - X0, Z1 - Z0, M.plaster); ce.rotation.x = Math.PI / 2; ce.position.y = RH; add(ce);
    // outer shells so the moon only comes in through the window gaps
    add(box(0.5, RH + 1, 18, M.shell, X0 - 0.3, RH / 2, 0), box(0.5, RH + 1, 18, M.shell, X1 + 0.3, RH / 2, 0), box(22, 0.5, 18, M.shell, 0, RH + 0.3, 0), box(22, RH + 1, 0.5, M.shell, 0, RH / 2, Z1 + 0.3));
    // baseboards, chair rail, crown moulding on all walls
    const run = (len, x, z, ry, skipFrom, skipTo) => {
      const pieces = skipFrom === undefined ? [[-len / 2, len / 2]] : [[-len / 2, skipFrom], [skipTo, len / 2]];
      pieces.forEach(([a, b]) => { const w = b - a, c = (a + b) / 2, o = V(Math.cos(ry) * c, 0, -Math.sin(ry) * c);
        const bb = box(w, 0.6, 0.14, M.trim, x + o.x, 0.3, z + o.z); bb.rotation.y = ry; add(bb);
        const bt = box(w, 0.08, 0.2, M.trim, x + o.x, 0.62, z + o.z); bt.rotation.y = ry; add(bt); });
      const cr = box(len, 0.4, 0.22, M.trim, x, RH - 0.2, z); cr.rotation.y = ry; add(cr);
      const cr2 = box(len, 0.14, 0.36, M.trim, x, RH - 0.5, z); cr2.rotation.y = ry; add(cr2);
    };
    run(20, 0, Z0 + 0.07, 0, DOOR.x0, DOOR.x1); run(20, 0, Z1 - 0.07, 0); run(16, X0 + 0.07, 0, Math.PI / 2); run(16, X1 - 0.07, 0, Math.PI / 2);
    // chair rail + wainscot panels on the dining (right) wall and front wall right part
    add(box(0.16, 0.18, 16, M.trim, X1 - 0.08, 3.4, 0));
    for (let z = -7; z <= 7; z += 2.33) { add(box(0.06, 2.2, 1.8, M.trim, X1 - 0.05, 1.95, z)); }
    // ceiling beams
    for (let k = 0; k < 5; k++) add(box(20, 0.55, 0.6, M.dark, 0, RH - 0.28, -6 + k * 3.4));
    // window: trim + sill + glass panes behind
    const T = 0.32, zf = Z0 + 0.1;
    add(box(WIN.x1 - WIN.x0 + 2 * T, T, 0.2, M.trim, WCX, WIN.y1 + T / 2, zf), box(T, WIN.y1 - WIN.y0, 0.2, M.trim, WIN.x0 - T / 2, (WIN.y0 + WIN.y1) / 2, zf), box(T, WIN.y1 - WIN.y0, 0.2, M.trim, WIN.x1 + T / 2, (WIN.y0 + WIN.y1) / 2, zf));
    add(box(WIN.x1 - WIN.x0 + 2 * T + 0.4, 0.2, 0.7, M.trim, WCX, WIN.y0 - 0.1, Z0 + 0.25), box(WIN.x1 - WIN.x0 + 0.2, 0.3, 0.12, M.trim, WCX, WIN.y0 - 0.35, Z0 + 0.1));
    add(box(0.12, WIN.y1 - WIN.y0, 0.12, M.trim, WCX, (WIN.y0 + WIN.y1) / 2, Z0 - 0.35), box(WIN.x1 - WIN.x0, 0.12, 0.12, M.trim, WCX, (WIN.y0 + WIN.y1) / 2, Z0 - 0.35));
    // curtains pushed to the sides of the window
    const curtM = pbr(texPair(256, (g, hg, S) => { g.fillStyle = '#8c2f2a'; g.fillRect(0, 0, S, S); for (let x = 0; x < S; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(0.5, 'rgba(255,220,200,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = gr; g.fillRect(x, 0, 32, S); hg.fillStyle = gr; } for (let y = 0; y < S; y += 40) { g.fillStyle = 'rgba(230,190,120,0.5)'; g.fillRect(0, y, S, 4); } }).c, null, { rough: 0.95 });
    [-1, 1].forEach((s) => { const c = rb(1.0, 6.4, 0.35, 0.15, curtM, WCX + s * (WIN.x1 - WIN.x0) / 2 + s * 0.85, 5.6, Z0 + 0.45); add(c); });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.6, 10), M.brass); rod.rotation.z = Math.PI / 2; rod.position.set(WCX, 8.85, Z0 + 0.45); add(rod);
    // front door with frame, knob, peephole, chain
    const door = box(DOOR.x1 - DOOR.x0 - 0.1, DOOR.y1 - 0.05, 0.25, [M.dark, M.dark, M.dark, M.dark, M.door, M.door], (DOOR.x0 + DOOR.x1) / 2, (DOOR.y1 - 0.05) / 2, Z0 - 0.2); add(door);
    const dc = (DOOR.x0 + DOOR.x1) / 2;
    add(box(DOOR.x1 - DOOR.x0 + 0.8, 0.4, 0.22, M.trim, dc, DOOR.y1 + 0.2, Z0 + 0.1), box(0.4, DOOR.y1, 0.22, M.trim, DOOR.x0 - 0.2, DOOR.y1 / 2, Z0 + 0.1), box(0.4, DOOR.y1, 0.22, M.trim, DOOR.x1 + 0.2, DOOR.y1 / 2, Z0 + 0.1));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), M.brass); knob.position.set(DOOR.x1 - 0.55, 4.1, Z0 + 0.05); add(knob);
    add(box(0.25, 0.7, 0.08, M.brass, DOOR.x1 - 0.55, 4.25, Z0 - 0.04));
    const dead = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 14), M.brass); dead.rotation.x = Math.PI / 2; dead.position.set(DOOR.x1 - 0.55, 5.0, Z0 + 0.0); add(dead);
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 10), M.steel); l.position.set(DOOR.x1 - 0.95 - i * 0.11, 5.6 - Math.sin(i / 5 * Math.PI) * 0.22, Z0 + 0.03); l.rotation.y = i % 2 ? Math.PI / 2 : 0; add(l); }
    const peep = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), M.brass); peep.rotation.x = Math.PI / 2; peep.position.set(dc, 6.4, Z0 + 0.0); add(peep);
    // two boards across the door too
    [[6.2, 0.12], [3.0, -0.1]].forEach(([y, rz], i) => { const p = box(DOOR.x1 - DOOR.x0 + 1.0, 0.55, 0.12, wm(M.planks[i], [1 / 4, 1]), dc, y, Z0 + 0.12); p.rotation.z = rz; add(p); });
    // doormat
    const matT = KIT.textTex(512, 256, (g, w, h) => { g.fillStyle = '#7a5a34'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)'; g.fillRect(0, y, w, 2); } g.strokeStyle = '#3b2814'; g.lineWidth = 10; g.strokeRect(16, 16, w - 32, h - 32); g.fillStyle = '#3b2814'; g.font = 'bold 110px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HOME', w / 2, h / 2 + 6); });
    const mat = new THREE.Mesh(RBX.rbox(3.0, 0.06, 1.5, 0.03), new THREE.MeshStandardMaterial({ map: matT, roughness: 1 })); mat.position.set(dc, 0.03, Z0 + 1.2); add(mat);
  })();

  // ---------------- kitchen run on the left wall (x=-10), z -7.6..1 ----------------
  (function kitchen() {
    const KZ0 = -7.6, KZ1 = 1.0, KD = 2.2, cx = X0 + KD / 2, TOP = 3.2;
    const zs = []; for (let z = KZ0; z < KZ1 - 0.1; z += 1.72) zs.push(z + 0.86);
    // base cabinets with shaker doors, drawers, handles, toe kick
    add(box(KD - 0.15, 0.4, KZ1 - KZ0, M.black, cx - 0.1, 0.2, (KZ0 + KZ1) / 2));
    add(box(KD - 0.1, TOP - 0.55, KZ1 - KZ0, M.cabBody, cx - 0.05, 0.4 + (TOP - 0.55) / 2, (KZ0 + KZ1) / 2));
    zs.forEach((z, i) => {
      const d = box(0.1, 1.6, 1.62, M.cab, X0 + KD + 0.0, 1.32, z); add(d);
      const dr = box(0.1, 0.62, 1.62, M.cab, X0 + KD + 0.0, 2.55, z); add(dr);
      add(box(0.1, 0.06, 0.6, M.steel, X0 + KD + 0.1, 2.55, z), box(0.1, 0.6, 0.06, M.steel, X0 + KD + 0.1, 1.75, z + (i % 2 ? -0.6 : 0.6)));
    });
    add(box(KD + 0.15, 0.22, KZ1 - KZ0 + 0.2, M.granite, cx + 0.05, TOP - 0.04, (KZ0 + KZ1) / 2));
    // backsplash tiles
    const bs = worldPlane(KZ1 - KZ0, 3.0, M.tile); bs.position.set(X0 + 0.02, TOP + 1.5, (KZ0 + KZ1) / 2); bs.rotation.y = Math.PI / 2; add(bs);
    // upper cabinets (skip over the stove where the hood is)
    const UY = 7.9, stoveZ = -2.4, sinkZ = -5.4;
    zs.forEach((z, i) => { if (Math.abs(z - stoveZ) < 1.2) return; add(box(1.3, 3.0, 1.66, M.cabBody, X0 + 0.65, UY, z), box(0.08, 2.8, 1.56, M.cab, X0 + 1.33, UY, z), box(0.08, 0.5, 0.06, M.steel, X0 + 1.4, UY - 1.0, z + (i % 2 ? -0.6 : 0.6))); });
    add(box(1.5, 0.25, KZ1 - KZ0 + 0.1, M.trim, X0 + 0.75, UY + 1.62, (KZ0 + KZ1) / 2));
    // under-cabinet light strip (practical)
    const stripM = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.4, 1.6) });
    add(box(0.12, 0.05, KZ1 - KZ0 - 0.4, stripM, X0 + 1.1, UY - 1.53, (KZ0 + KZ1) / 2));
    // stove + oven + range hood
    add(box(KD, TOP - 0.4, 1.9, M.steel, cx, 0.4 + (TOP - 0.4) / 2 - 0.2, stoveZ));
    add(box(0.06, 1.3, 1.5, M.black, X0 + KD + 0.02, 1.4, stoveZ), box(0.12, 0.08, 1.3, M.steel, X0 + KD + 0.12, 2.25, stoveZ));
    add(box(KD, 0.12, 1.9, M.black, cx, TOP + 0.02, stoveZ));
    [[-0.45, -0.45], [-0.45, 0.45], [0.45, -0.45], [0.45, 0.45]].forEach(([dx, dz]) => { const b = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 20), M.iron); b.rotation.x = Math.PI / 2; b.position.set(cx + dx, TOP + 0.12, stoveZ + dz); add(b); const b2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 6, 14), M.iron); b2.rotation.x = Math.PI / 2; b2.position.copy(b.position); add(b2); });
    for (let k = 0; k < 4; k++) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), M.black); kn.rotation.z = Math.PI / 2; kn.position.set(X0 + KD + 0.1, 2.75, stoveZ - 0.6 + k * 0.4); add(kn); }
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.55, 20), new THREE.MeshStandardMaterial({ color: '#c0392b', roughness: 0.35 })); pot.position.set(cx + 0.45, TOP + 0.4, stoveZ - 0.45); add(pot);
    const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), M.steel); kettle.scale.y = 0.8; kettle.position.set(cx - 0.4, TOP + 0.38, stoveZ + 0.45); add(kettle);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.3, 1.2, 4, 1), M.steel); hood.rotation.y = Math.PI / 4; hood.scale.set(1, 1, 1); hood.position.set(X0 + 1.0, 7.4, stoveZ); add(hood);
    add(box(0.9, 3.4, 0.9, M.steel, X0 + 0.5, 9.7, stoveZ));
    const hoodLight = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3, 1.6) })); hoodLight.rotation.x = Math.PI / 2; hoodLight.position.set(X0 + 1.2, 6.78, stoveZ); add(hoodLight);
    // sink + faucet + window-less: dish rack
    add(box(KD - 0.6, 0.06, 1.5, M.steel, cx + 0.05, TOP + 0.09, sinkZ), box(KD - 0.8, 0.05, 1.3, new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.3, metalness: 0.8 }), cx + 0.05, TOP + 0.1, sinkZ));
    const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 10), M.steel); fp.position.set(X0 + 0.45, TOP + 0.75, sinkZ); add(fp);
    const fs = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI), M.steel); fs.position.set(X0 + 0.8, TOP + 1.4, sinkZ); add(fs);
    fs.position.set(X0 + 0.8, TOP + 1.4, sinkZ); fs.rotation.set(0, 0, 0);
    const rackZ = sinkZ + 1.3; add(box(1.2, 0.08, 1.0, M.steel, cx + 0.1, TOP + 0.13, rackZ));
    for (let k = 0; k < 5; k++) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), new THREE.MeshStandardMaterial({ color: k % 2 ? '#e8e2d4' : '#4a7fb5', roughness: 0.3 })); pl.rotation.x = Math.PI / 2; pl.rotation.z = 0.2; pl.position.set(cx + 0.1, TOP + 0.55, rackZ - 0.35 + k * 0.17); add(pl); }
    // hanging pans on a rail between sink and stove
    const railZ0 = sinkZ + 0.6, railZ1 = stoveZ - 1.0, ry = 5.9;
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, railZ1 - railZ0 + 1.0, 8), M.brass); rail.rotation.x = Math.PI / 2; rail.position.set(X0 + 0.3, ry, (railZ0 + railZ1) / 2); add(rail);
    [[0.55, M.copper], [0.42, M.iron], [0.36, M.copper]].forEach(([r, m], i) => {
      const z = railZ0 + 0.1 + i * 0.75, pan = new THREE.Group(); pan.position.set(X0 + 0.38, ry - 0.1, z); add(pan);
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 10), M.brass); pan.add(hook);
      const handle = box(0.06, 0.9, 0.12, m, 0, -0.55, 0); pan.add(handle);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 0.18, 22), m); body.rotation.z = Math.PI / 2; body.position.set(0.05, -1.0 - r, 0); pan.add(body);
    });
    // utensils crock, knife block, toaster, coffee maker, jars, fruit bowl, bread box
    const crock = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.7, 16), new THREE.MeshStandardMaterial({ color: '#d8cfbd', roughness: 0.4 })); crock.position.set(X0 + 0.6, TOP + 0.45, stoveZ + 1.4); add(crock);
    for (let k = 0; k < 5; k++) { const u = box(0.06, 1.0, 0.12, k % 2 ? M.dark : M.steel, X0 + 0.55 + (k - 2) * 0.06, TOP + 0.95, stoveZ + 1.4 + (k - 2) * 0.05); u.rotation.z = (k - 2) * 0.12; add(u); }
    const kb = box(0.5, 0.8, 0.5, M.dark, X0 + 0.5, TOP + 0.5, -0.4); kb.rotation.z = -0.25; add(kb);
    for (let k = 0; k < 4; k++) add(box(0.08, 0.3, 0.06, M.black, X0 + 0.62 + k * 0.03, TOP + 1.0, -0.6 + k * 0.13));
    add(rb(0.8, 0.7, 1.1, 0.12, new THREE.MeshStandardMaterial({ color: '#c6c9cc', roughness: 0.25, metalness: 0.8 }), X0 + 0.8, TOP + 0.45, -6.95));
    // coffee maker (busy: pot half full)
    add(box(0.9, 1.5, 0.9, M.black, X0 + 0.6, TOP + 0.85, 0.4), box(0.9, 0.25, 0.95, M.black, X0 + 0.6, TOP + 1.65, 0.4));
    const carafe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.55, 16), new THREE.MeshPhysicalMaterial({ color: '#3a1f10', roughness: 0.05, transmission: 0, clearcoat: 1 })); carafe.position.set(X0 + 1.1, TOP + 0.4, 0.4); add(carafe);
    const cmLed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 1, 0.6) })); cmLed.position.set(X0 + 1.06, TOP + 1.45, 0.65); add(cmLed);
    ['#b04a2a', '#d8a440', '#5b8a4a'].forEach((c, i) => { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.7 - i * 0.1, 16), new THREE.MeshPhysicalMaterial({ color: '#e8eef0', roughness: 0.1, transparent: true, opacity: 0.55 })); j.position.set(X0 + 0.45, TOP + 0.45 - i * 0.05, -3.9 + i * 0.55); add(j); const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.45 - i * 0.08, 14), new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })); fill.position.copy(j.position); fill.position.y -= 0.08; add(fill); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 16), M.dark); lid.position.copy(j.position); lid.position.y += (0.7 - i * 0.1) / 2; add(lid); });
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2f5f8a', roughness: 0.3, side: THREE.DoubleSide })); bowl.position.set(cx + 0.2, TOP + 0.6, -0.9 + 0.0); bowl.position.set(cx + 0.25, TOP + 0.62, -1.0 + 0.0); add(bowl);
    [['#d23a2a', 0.18], ['#e8b830', 0.17], ['#d23a2a', 0.18], ['#e07a1f', 0.17], ['#6fa83a', 0.16]].forEach(([c, r], i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })); f.position.set(cx + 0.25 + Math.cos(i * 1.3) * 0.25, TOP + 0.4 + (i > 3 ? 0.2 : 0), -1.0 + Math.sin(i * 1.3) * 0.25); add(f); });
    // dish towel on the oven handle
    add(rb(0.06, 0.9, 0.6, 0.03, pbr(texPair(128, (g) => { g.fillStyle = '#f0ece2'; g.fillRect(0, 0, 128, 128); for (let k = 0; k < 128; k += 24) { g.fillStyle = '#c0392b'; g.fillRect(k, 0, 8, 128); g.fillRect(0, k, 128, 8); } }).c, null, { rough: 1 }), X0 + KD + 0.16, 1.85, stoveZ - 0.3));
  })();

  // ---------------- fridge (x=-10, z 4..6.6) with magnets + kids' drawings ----------------
  (function fridge() {
    const fz = 5.4, fx = X0 + 1.4;
    add(rb(2.6, 8.6, 2.6, 0.25, M.fridge, fx, 4.35, fz));
    add(box(0.06, 0.05, 2.4, M.black, fx + 1.31, 5.9, fz));
    [[7.2, 1.0], [3.6, 2.2]].forEach(([y, h]) => add(rb(0.14, h, 0.16, 0.05, M.steel, fx + 1.38, y, fz - 0.95)));
    add(box(2.2, 0.35, 2.2, M.black, fx, 0.15, fz));
    const paperM = [], drawings = [
      (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c0392b'; g.lineWidth = 7; g.strokeRect(50, 150, 150, 120); g.beginPath(); g.moveTo(40, 150); g.lineTo(125, 80); g.lineTo(210, 150); g.stroke(); g.strokeStyle = '#7a4a1f'; g.lineWidth = 9; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(90, 180 + k * 18); g.lineTo(160, 176 + k * 18); g.stroke(); }
        g.strokeStyle = '#222'; g.lineWidth = 5; [[230, 220], [262, 230], [290, 240]].forEach(([x, y], i) => { g.beginPath(); g.arc(x - 30, y - 30 - i * 3, 12 - i * 2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 30, y - 18); g.lineTo(x - 30, y + 20); g.moveTo(x - 42, y); g.lineTo(x - 18, y); g.stroke(); });
        g.fillStyle = '#2f6fd1'; g.font = 'bold 34px "Comic Sans MS", cursive'; g.fillText('MY FAMLY', 40, 330); },
      (g, w, h) => { g.fillStyle = '#e9f0fb'; g.fillRect(0, 0, w, h); g.fillStyle = '#16205a'; g.fillRect(0, 0, w, h * 0.7); g.fillStyle = '#9a9a9a'; g.beginPath(); g.arc(w / 2, 130, 90, 0, 7); g.fill(); g.fillStyle = '#ff8a1a'; g.beginPath(); g.arc(w / 2 - 32, 115, 18, 0, 7); g.arc(w / 2 + 32, 115, 18, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, 160, 36, 0.2, Math.PI - 0.2); g.stroke();
        g.fillStyle = '#c0392b'; g.font = 'bold 36px "Comic Sans MS", cursive'; g.textAlign = 'center'; g.fillText('DONT LOOK', w / 2, h - 50); },
      (g, w, h) => { g.fillStyle = '#fff6d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2b51c'; g.beginPath(); g.arc(70, 70, 40, 0, 7); g.fill(); g.strokeStyle = '#f2b51c'; g.lineWidth = 6; for (let a = 0; a < 8; a++) { g.beginPath(); g.moveTo(70 + Math.cos(a) * 50, 70 + Math.sin(a) * 50); g.lineTo(70 + Math.cos(a) * 70, 70 + Math.sin(a) * 70); g.stroke(); }
        g.fillStyle = '#3c9a4a'; g.fillRect(0, h - 90, w, 90); ['#d23a2a', '#b04ad2', '#2f6fd1'].forEach((c, i) => { g.strokeStyle = '#3c9a4a'; g.lineWidth = 5; g.beginPath(); g.moveTo(80 + i * 80, h - 90); g.lineTo(80 + i * 80, h - 170); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(80 + i * 80, h - 180, 22, 0, 7); g.fill(); });
        g.fillStyle = '#d23a2a'; g.font = 'bold 54px "Comic Sans MS", cursive'; g.fillText('PIP 4', 140, 120); },
      (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9bb4d8'; g.lineWidth = 2; for (let y = 60; y < h; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#222'; g.font = 'bold 30px "Comic Sans MS", cursive';
        ['GROCERY', '- milk', '- COFFEE', '- COFFEE', '- nails', '- more COFFEE'].forEach((t, i) => g.fillText(t, 26, 52 + i * 34 + (i ? 20 : 0))); },
    ];
    const spots = [[0.55, 7.0, -0.45, 0.06], [-0.55, 6.6, 0.5, -0.08], [0.55, 4.3, -0.5, -0.05], [-0.5, 4.0, 0.45, 0.07]];
    drawings.forEach((d, i) => { const t = KIT.textTex(320, 400, d), p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
      const [dz, y, , rz] = spots[i]; p.position.set(fx + 1.32, y, fz + dz); p.rotation.set(0, Math.PI / 2, rz); add(p); });
    const magC = ['#d23a2a', '#2f6fd1', '#e8b830', '#3c9a4a', '#b04ad2', '#e07a1f'], r = rng(44);
    spots.forEach(([dz, y], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 14), new THREE.MeshStandardMaterial({ color: magC[i], roughness: 0.3 })); m.rotation.z = Math.PI / 2; m.position.set(fx + 1.36, y + 0.55, fz + dz); add(m); });
    for (let i = 0; i < 12; i++) { const m = rb(0.08, 0.18 + r() * 0.12, 0.16 + r() * 0.14, 0.03, new THREE.MeshStandardMaterial({ color: magC[i % 6], roughness: 0.35 }), fx + 1.35, 1.6 + r() * 7.0, fz - 1.0 + r() * 2.0); m.rotation.x = (r() - 0.5) * 0.6; add(m); }
    // stuff on top of the fridge: cereal boxes, basket
    add(box(1.0, 1.3, 0.4, pbr(texPair(128, (g) => { g.fillStyle = '#e8b830'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#c0392b'; g.fillRect(10, 20, 108, 34); g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText('O-RINGS', 14, 46); g.fillStyle = '#f5e6c0'; g.beginPath(); g.arc(64, 92, 24, 0, 7); g.fill(); }).c, null, { rough: 0.6 }), fx - 0.3, 9.3, fz - 0.6));
    add(rb(1.4, 0.6, 1.0, 0.1, M.dark, fx, 8.95, fz + 0.6));
  })();

  // ---------------- calendar (x=-10 wall, between counters and fridge) ----------------
  const CAL = { w: 1.9, h: 2.75, z: 2.65, y: 5.6 };
  const calC = cnv(1024, 1482), calTex = tex(calC);
  function drawCalendar(n) {
    const g = calC.getContext('2d'), W = 1024, H = 1482;
    g.fillStyle = '#f6f1e4'; g.fillRect(0, 0, W, H);
    // picture half: a lighthouse at sunset (stock calendar photo feel)
    const ph = 520, gr = g.createLinearGradient(0, 0, 0, ph); gr.addColorStop(0, '#f08a4b'); gr.addColorStop(0.6, '#f6c46a'); gr.addColorStop(1, '#3b6f9a'); g.fillStyle = gr; g.fillRect(40, 70, W - 80, ph - 70);
    g.fillStyle = '#ffe6a6'; g.beginPath(); g.arc(700, 330, 70, 0, 7); g.fill(); g.fillStyle = '#2a4f78'; g.fillRect(40, 380, W - 80, ph - 380);
    g.fillStyle = '#3b3b3b'; g.beginPath(); g.moveTo(40, ph); g.lineTo(40, 400); g.lineTo(300, 430); g.lineTo(480, ph); g.fill();
    g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(190, 420); g.lineTo(230, 200); g.lineTo(270, 200); g.lineTo(300, 425); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(205, 290, 80, 34); g.fillRect(215, 360, 75, 34); g.fillStyle = '#ffeaa0'; g.fillRect(222, 165, 56, 40); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(212, 168); g.lineTo(250, 130); g.lineTo(288, 168); g.fill();
    // binding + hole
    g.fillStyle = '#9a9a9a'; for (let x = 120; x < W - 100; x += 46) g.fillRect(x, 18, 14, 46); g.fillStyle = '#1b1b1b'; g.beginPath(); g.arc(W / 2, 40, 14, 0, 7); g.fill();
    // month title
    g.fillStyle = '#1d2f6b'; g.font = 'bold 110px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('NOVEMBER', W / 2, ph + 125);
    // grid: Thursday column wider
    const cols = [1, 1, 1, 1, 2.0, 1, 1], tot = cols.reduce((a, b) => a + b), gx = 40, gw = W - 80, gy = ph + 160, hh = 80, rh = (H - gy - hh - 40) / 5;
    const xs = [gx]; cols.forEach((c) => xs.push(xs[xs.length - 1] + (c / tot) * gw));
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THURSDAY', 'FRI', 'SAT'];
    g.fillStyle = '#1d2f6b'; g.fillRect(gx, gy, gw, hh);
    g.fillStyle = 'rgba(200,60,40,0.12)'; g.fillRect(xs[4], gy + hh, xs[5] - xs[4], rh * 5);
    names.forEach((t, i) => { g.fillStyle = '#ffffff'; g.font = `bold ${i === 4 ? 46 : 32}px Arial, sans-serif`; g.textBaseline = 'middle'; g.fillText(t, (xs[i] + xs[i + 1]) / 2, gy + hh / 2 + 2); });
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; for (let r = 0; r <= 5; r++) { g.beginPath(); g.moveTo(gx, gy + hh + r * rh); g.lineTo(gx + gw, gy + hh + r * rh); g.stroke(); } xs.forEach((x) => { g.beginPath(); g.moveTo(x, gy); g.lineTo(x, gy + hh + rh * 5); g.stroke(); });
    const cell = (d) => { const k = d - 1, c = k % 7, r = Math.floor(k / 7); return { x: xs[c], y: gy + hh + r * rh, w: xs[c + 1] - xs[c], h: rh, c }; };
    for (let d = 1; d <= 30; d++) { const c = cell(d); g.fillStyle = c.c === 4 ? '#b0231c' : '#2a2a2a'; g.font = `bold ${c.c === 4 ? 64 : 46}px Georgia, serif`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(String(d), c.x + 12, c.y + 8); }
    // hand-made marker strokes (wobbly)
    const r = rng(7 + n);
    const wobblyEllipse = (cx, cy, rx, ry, color, wd, loops = 1, seed = 0) => { g.strokeStyle = color; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      const steps = 60 * loops; for (let i = 0; i <= steps; i++) { const a = (i / 60) * Math.PI * 2 + 0.3 + seed, k = 1 + (Math.sin(a * 3 + seed * 5) * 0.04) + i / steps * 0.08 * loops; const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
    const red = 'rgba(214,28,28,0.92)';
    if (n >= 1) { wobblyEllipse((xs[4] + xs[5]) / 2, gy + hh / 2, (xs[5] - xs[4]) / 2 + 22, hh / 2 + 26, red, 14, 1.15, 0.2); }
    // crossed-off past days
    const xOff = (d) => { const c = cell(d); g.strokeStyle = 'rgba(30,30,30,0.75)'; g.lineWidth = 6; g.beginPath(); g.moveTo(c.x + 14, c.y + 14); g.lineTo(c.x + c.w - 14, c.y + c.h - 14); g.moveTo(c.x + c.w - 14, c.y + 14); g.lineTo(c.x + 14, c.y + c.h - 14); g.stroke(); };
    if (n >= 2) { for (let d = 1; d <= 11; d++) if (d !== 5) xOff(d); const c = cell(5); wobblyEllipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 6, c.h / 2 - 6, red, 9, 1, 1); }
    if (n >= 2) { const c = cell(12); wobblyEllipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 4, c.h / 2 - 4, red, 11, 1, 2); wobblyEllipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 + 8, c.h / 2 + 6, red, 10, 1, 3.3);
      g.fillStyle = red; g.font = 'bold 84px "Marker Felt", "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!!', c.x + c.w * 0.68, c.y + c.h * 0.58); }
    if (n >= 3) { for (let d = 12; d <= 25; d++) if (d !== 12 && d !== 19) xOff(d); const c = cell(19); for (let k = 0; k < 3; k++) wobblyEllipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 6 + k * 6, c.h / 2 - 6 + k * 5, red, 9, 1, k * 1.7);
      g.fillStyle = red; g.font = 'bold 80px "Marker Felt", "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!!!', c.x + c.w * 0.68, c.y + c.h * 0.58);
      const l = cell(26); g.strokeStyle = 'rgba(10,10,12,0.95)'; g.lineCap = 'round'; g.lineWidth = 16; g.beginPath(); let px = l.x + 10, py = l.y + 12; g.moveTo(px, py);
      for (let i = 0; i < 26; i++) { px = l.x + 10 + (i % 2 ? l.w - 20 : 0) + (r() - 0.5) * 20; py = l.y + 12 + (i / 25) * (l.h - 24) + (r() - 0.5) * 10; g.lineTo(px, py); } g.stroke();
      for (let i = 0; i < 12; i++) { g.lineWidth = 12; g.beginPath(); g.moveTo(l.x + 10 + r() * l.w * 0.3, l.y + 10 + r() * l.h); g.lineTo(l.x + l.w * 0.7 + r() * l.w * 0.3 - 10, l.y + r() * l.h); g.stroke(); }
      // big "NO" spilling out of the cell
      g.save(); g.translate(l.x + l.w / 2, l.y + l.h / 2 + 6); g.rotate(-0.12); g.fillStyle = '#0b0b0d'; g.strokeStyle = '#f6f1e4'; g.lineWidth = 10; g.font = 'bold 150px "Marker Felt", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText('NO', 0, 0); g.fillText('NO', 0, 0); g.restore(); }
    // paper grain
    const n2 = fbm(91, 8, 4), im = g.getImageData(0, 0, W, H); for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const i = (y * W + x) * 4, k = 1 + (n2(x / W, y / H) - 0.5) * 0.08; im.data[i] *= k; im.data[i + 1] *= k; im.data[i + 2] *= k; } g.putImageData(im, 0, 0);
    calTex.needsUpdate = true;
  }
  drawCalendar(1);
  (function calendar() {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, CAL.h), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.85 }));
    p.position.set(X0 + 0.06, CAL.y, CAL.z); p.rotation.y = Math.PI / 2; add(p);
    add(box(0.04, CAL.h + 0.06, CAL.w + 0.06, new THREE.MeshStandardMaterial({ color: '#d9d2bf', roughness: 0.9 }), X0 + 0.03, CAL.y - 0.02, CAL.z));
    const nl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), M.nail); nl.rotation.z = Math.PI / 2; nl.position.set(X0 + 0.1, CAL.y + CAL.h / 2 - 0.08, CAL.z); add(nl);
    // red marker hanging on a string next to it
    const mk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), new THREE.MeshStandardMaterial({ color: '#c81e1e', roughness: 0.4 })); mk.position.set(X0 + 0.12, CAL.y + 0.4, CAL.z + CAL.w / 2 + 0.3); add(mk);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 4), M.black); str.position.set(X0 + 0.1, CAL.y + 1.05, CAL.z + CAL.w / 2 + 0.15); str.rotation.x = 0.35; add(str);
    // small family photo + key hooks below
    add(box(0.08, 0.9, 1.2, M.dark, X0 + 0.05, 3.6, CAL.z + 0.0));
    for (let k = 0; k < 4; k++) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 10, Math.PI), M.brass); h.position.set(X0 + 0.15, 3.35, CAL.z - 0.4 + k * 0.27); h.rotation.y = Math.PI / 2; h.rotation.z = Math.PI; add(h); }
    for (let k = 0; k < 2; k++) add(box(0.04, 0.3, 0.12, M.brass, X0 + 0.2, 3.1, CAL.z - 0.4 + k * 0.54));
  })();

  // ---------------- wall clock (front wall between window and door) ----------------
  const CLK = { x: 0.35, y: 9.0, z: Z0 + 0.12, r: 0.9 };
  const clock = new THREE.Group(); clock.position.set(CLK.x, CLK.y, CLK.z); add(clock);
  (function buildClock() {
    const fT = KIT.textTex(512, 512, (g, w) => { g.fillStyle = '#f4eedc'; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 6; g.beginPath(); g.arc(256, 256, 236, 0, 7); g.stroke();
      for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; g.lineWidth = i % 5 ? 3 : 9; g.beginPath(); g.moveTo(256 + Math.sin(a) * (i % 5 ? 222 : 206), 256 - Math.cos(a) * (i % 5 ? 222 : 206)); g.lineTo(256 + Math.sin(a) * 232, 256 - Math.cos(a) * 232); g.stroke(); }
      g.fillStyle = '#1a1a1a'; g.font = 'bold 60px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; g.fillText(String(i), 256 + Math.sin(a) * 172, 260 - Math.cos(a) * 172); } });
    const face = new THREE.Mesh(new THREE.CircleGeometry(CLK.r, 48), new THREE.MeshStandardMaterial({ map: fT, roughness: 0.5 })); face.position.z = 0.14; clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(CLK.r + 0.06, 0.1, 10, 48), new THREE.MeshStandardMaterial({ color: '#7a1f1a', roughness: 0.35 })); rim.position.z = 0.12; clock.add(rim);
    const back = new THREE.Mesh(new THREE.CylinderGeometry(CLK.r + 0.05, CLK.r + 0.05, 0.16, 40), new THREE.MeshStandardMaterial({ color: '#5a1612', roughness: 0.5 })); back.rotation.x = Math.PI / 2; back.position.z = 0.04; clock.add(back);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(CLK.r, 40), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transparent: true, opacity: 0.12, clearcoat: 1 })); glass.position.z = 0.24; clock.add(glass);
    const hand = (len, wd, z) => { const piv = new THREE.Group(); piv.position.z = z; const m = box(wd, len, 0.025, M.black, 0, len / 2 - 0.08, 0); piv.add(m); clock.add(piv); return piv; };
    clock.userData.h = hand(CLK.r * 0.55, 0.09, 0.16); clock.userData.m = hand(CLK.r * 0.82, 0.06, 0.18); clock.userData.s = hand(CLK.r * 0.85, 0.018, 0.2); clock.userData.s.children[0].material = new THREE.MeshStandardMaterial({ color: '#c0392b' });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), M.brass); cap.rotation.x = Math.PI / 2; cap.position.z = 0.22; clock.add(cap);
  })();
  function setClock(h, m, s = 0) { const u = clock.userData; u.m.rotation.z = -(m / 60) * Math.PI * 2; u.h.rotation.z = -((h % 12) / 12 + m / 720) * Math.PI * 2; u.s.rotation.z = -(s / 60) * Math.PI * 2; }
  setClock(3, 0, 7);

  // ---------------- dining: table (3,0,2), 4 chairs, mugs, lamp ----------------
  const TB = { x: 3, z: 2, w: 5.4, d: 3.2, top: 3.3 };
  (function dining() {
    add(rb(TB.w, 0.22, TB.d, 0.06, M.table, TB.x, TB.top - 0.11, TB.z));
    add(box(TB.w - 0.6, 0.4, TB.d - 0.6, M.dark, TB.x, TB.top - 0.42, TB.z));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, TB.top - 0.2, 10), M.dark); l.position.set(TB.x + sx * (TB.w / 2 - 0.4), (TB.top - 0.2) / 2, TB.z + sz * (TB.d / 2 - 0.4)); add(l); });
    // runner + placemats
    const runT = KIT.textTex(128, 512, (g, w, h) => { g.fillStyle = '#efe7d2'; g.fillRect(0, 0, w, h); g.fillStyle = '#9b2320'; for (let y = 0; y < h; y += 40) g.fillRect(0, y, w, 10); g.fillStyle = '#1d2f6b'; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h); });
    const run = new THREE.Mesh(new THREE.BoxGeometry(TB.w - 0.6, 0.02, 0.9), new THREE.MeshStandardMaterial({ map: runT, roughness: 1 })); run.geometry.rotateY(0); run.position.set(TB.x, TB.top + 0.01, TB.z); add(run);
    // chair: seat top at 2
    const cushM = pbr(texPair(128, (g, hg, S) => { g.fillStyle = '#9b2320'; g.fillRect(0, 0, S, S); for (let k = 0; k < S; k += 16) { g.fillStyle = 'rgba(255,230,190,0.25)'; g.fillRect(k, 0, 3, S); g.fillRect(0, k, S, 3); } }).c, null, { rough: 1 });
    const chair = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; add(c);
      c.add(rb(1.9, 0.18, 1.7, 0.05, M.dark, 0, 1.75, 0), rb(1.7, 0.2, 1.5, 0.1, cushM, 0, 1.92, 0));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => c.add(box(0.16, 1.7, 0.16, M.dark, sx * 0.8, 0.85, sz * 0.7)));
      [-0.8, 0.8].forEach((sx) => c.add(box(0.16, 2.6, 0.16, M.dark, sx, 3.1, -0.78)));
      c.add(box(1.76, 0.35, 0.12, M.dark, 0, 4.25, -0.78)); for (let k = -1; k <= 1; k++) c.add(box(0.14, 1.9, 0.08, M.dark, k * 0.45, 3.1, -0.78)); return c; };
    chair(TB.x - 1.2, TB.z - 2.2, 0); chair(TB.x + 1.2, TB.z - 2.2, 0); chair(TB.x - 1.2, TB.z + 2.2, Math.PI); const c4 = chair(TB.x + 1.5, TB.z + 2.5, Math.PI + 0.35);
    // sugar bowl, newspaper, phone, napkin holder
    const sugar = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 10), new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 0.3 })); sugar.scale.y = 0.8; sugar.position.set(TB.x + 1.9, TB.top + 0.2, TB.z + 0.2); add(sugar);
    const newsT = KIT.textTex(512, 360, (g, w, h) => { g.fillStyle = '#e9e4d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = 'bold 58px Georgia, serif'; g.textAlign = 'center'; g.fillText('IT CAME LOWER', w / 2, 70); g.font = '22px Georgia, serif'; g.fillText('The Daily Thursday  ·  Nov edition', w / 2, 104);
      g.fillStyle = '#555'; g.beginPath(); g.arc(130, 210, 70, 0, 7); g.fill(); g.fillStyle = '#ff8a1a'; g.beginPath(); g.arc(108, 200, 10, 0, 7); g.arc(152, 200, 10, 0, 7); g.fill(); g.fillStyle = '#777'; for (let y = 140; y < h - 20; y += 16) g.fillRect(230, y, 250, 7); for (let y = 290; y < h - 10; y += 16) g.fillRect(30, y, 190, 7); });
    const np = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 1.05), [M.trim, M.trim, new THREE.MeshStandardMaterial({ map: newsT, roughness: 0.9 }), M.trim, M.trim, M.trim]); np.position.set(TB.x + 1.3, TB.top + 0.03, TB.z + 0.75); np.rotation.y = 0.3; add(np);
    const nh = box(0.6, 0.5, 0.25, M.steel, TB.x + 2.0, TB.top + 0.25, TB.z - 0.7); add(nh); add(box(0.5, 0.42, 0.12, new THREE.MeshStandardMaterial({ color: '#f4f0e6', roughness: 1 }), TB.x + 2.0, TB.top + 0.3, TB.z - 0.7));
    // hanging lamp over the table (warm practical, casts shadows)
    const LY = 9.2, lx = TB.x, lz = TB.z;
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, RH - LY - 0.5, 6), M.black); cord.position.set(lx, (RH + LY + 0.5) / 2, lz); add(cord);
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 16), M.brass); canopy.position.set(lx, RH - 0.06, lz); add(canopy);
    const shadeM = new THREE.MeshStandardMaterial({ color: '#2f5a3e', roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 1.25, 1.0, 32, 1, true), shadeM); shade.position.set(lx, LY, lz); shade.userData.noShadow = true; add(shade);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 1.23, 0.98, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#ffe2b0', emissive: new THREE.Color('#ffb060'), emissiveIntensity: 2.5, side: THREE.BackSide })); inner.position.copy(shade.position); inner.userData.noShadow = true; add(inner);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.3, 16), M.brass); top.position.set(lx, LY + 0.6, lz); add(top);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 6.5, 3) })); bulb.position.set(lx, LY - 0.35, lz); bulb.userData.noShadow = true; add(bulb);
  })();
  const lampL = new THREE.PointLight('#ffae5a', 150, 0, 2); lampL.position.set(TB.x, 8.75, TB.z); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -0.003; lampL.shadow.radius = 4; lampL.shadow.camera.near = 0.3; scene.add(lampL);

  // mug tower: stacks of mismatched mugs (props.setMugs(n) shows the first n)
  const mugs = new THREE.Group(); add(mugs);
  (function buildMugs() {
    const cols = ['#e8e2d4', '#c0392b', '#2f6fd1', '#e8b830', '#3c9a4a', '#f0f0f0', '#1d2f6b', '#e07a1f', '#b04ad2', '#d8cfbd'];
    const mats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }));
    const coffee = new THREE.MeshStandardMaterial({ color: '#2a140a', roughness: 0.1 });
    const bodyG = new THREE.CylinderGeometry(0.2, 0.18, 0.42, 18, 1, true), botG = new THREE.CircleGeometry(0.18, 18), handleG = new THREE.TorusGeometry(0.11, 0.035, 6, 12, Math.PI * 1.3);
    const innerG = new THREE.CylinderGeometry(0.185, 0.17, 0.4, 18, 1, true), coffeeG = new THREE.CircleGeometry(0.185, 18);
    const r = rng(77), list = [];
    const mug = (x, y, z, ry, flip, k) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; if (flip) g.rotation.x = Math.PI;
      const m = mats[k % mats.length], b = new THREE.Mesh(bodyG, m); b.position.y = 0.21; g.add(b);
      const ib = new THREE.Mesh(innerG, new THREE.MeshStandardMaterial({ color: '#3a2416', roughness: 0.5, side: THREE.BackSide })); ib.position.y = 0.22; g.add(ib);
      const bt = new THREE.Mesh(botG, m); bt.rotation.x = Math.PI / 2; bt.position.y = 0.005; g.add(bt);
      if (!flip) { const cf = new THREE.Mesh(coffeeG, coffee); cf.rotation.x = -Math.PI / 2; cf.position.y = 0.3; g.add(cf); }
      const hd = new THREE.Mesh(handleG, m); hd.position.set(0.2, 0.22, 0); hd.rotation.z = -Math.PI * 0.65; g.add(hd);
      g.rotation.z += (r() - 0.5) * 0.05; mugs.add(g); list.push(g); return g; };
    // three leaning towers + a pyramid base near Mom's place
    const base = [[TB.x + 0.1, TB.z - 0.35], [TB.x + 0.6, TB.z - 0.5], [TB.x + 0.35, TB.z - 0.0]];
    let k = 0; const H = [8, 6, 5];
    for (let level = 0; level < 9; level++) base.forEach(([x, z], ci) => { if (level >= H[ci]) return; const flip = level % 2 === 1; const y = TB.top + level * 0.43 + (flip ? 0.43 : 0); mug(x + (r() - 0.5) * 0.05 + level * 0.012 * (ci - 1), y, z + (r() - 0.5) * 0.05, r() * 6, flip, k++); });
    for (let i = 0; i < 9; i++) { const a = i * 0.8, rr = 0.75 + r() * 0.35; mug(TB.x + 0.35 + Math.cos(a) * rr * 1.2, TB.top, TB.z - 0.2 + Math.sin(a) * rr * 0.55, r() * 6, false, k++); }
    mugs.userData.list = list;
  })();
  function setMugs(n) { mugs.userData.list.forEach((m, i) => { m.visible = i < n; }); }

  // ---------------- step stool for Dad + hammer + nails + spare planks ----------------
  const DAD = { x: WCX, z: Z0 + 1.35 };
  (function dadSpot() {
    const st = new THREE.Group(); st.position.set(DAD.x, 0, DAD.z); add(st);
    st.add(rb(2.4, 0.18, 1.5, 0.05, M.planks[1], 0, 0.91, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = box(0.18, 0.9, 0.18, M.planks[0], sx * 1.0, 0.45, sz * 0.58); l.rotation.z = -sx * 0.06; st.add(l); });
    st.add(box(2.1, 0.12, 0.12, M.planks[0], 0, 0.35, 0.58), box(2.1, 0.12, 0.12, M.planks[0], 0, 0.35, -0.58));
    // spare planks leaning on the wall, a toolbox, nails on the floor
    [[-8.6, 0.15], [-8.2, 0.22], [-7.9, 0.1]].forEach(([x, rz], i) => { const p = box(0.7, 6.0, 0.12, M.planks[i], x, 2.95, Z0 + 0.35 + i * 0.12); p.rotation.z = rz; p.rotation.x = -0.06; add(p); });
    add(rb(1.6, 0.8, 0.8, 0.06, new THREE.MeshStandardMaterial({ color: '#b0231c', roughness: 0.45, metalness: 0.3 }), -0.2, 0.4, Z0 + 1.0));
    add(box(1.0, 0.1, 0.1, M.steel, -0.2, 0.9, Z0 + 1.0));
    const r = rng(9); for (let i = 0; i < 14; i++) { const nl = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5), M.steel); nl.rotation.set(Math.PI / 2, 0, r() * 6); nl.position.set(DAD.x - 1.5 + r() * 3, 0.03, DAD.z + 0.8 + r() * 1.3); add(nl); }
    const hammer = new THREE.Group(); hammer.position.set(DAD.x + 1.6, 0.06, DAD.z + 1.2); hammer.rotation.y = 0.6; add(hammer);
    hammer.add(box(1.0, 0.1, 0.12, M.planks[1], 0, 0, 0)); const hh = box(0.16, 0.14, 0.42, M.iron, 0.5, 0.02, 0); hammer.add(hh);
  })();

  // ---------------- boards over the front window (levels 0-3) ----------------
  const boards = { 1: new THREE.Group(), 2: new THREE.Group(), 3: new THREE.Group() };
  Object.values(boards).forEach((g) => add(g));
  const gaps = [];
  const nailM = M.nail, nailG = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10);
  const plank = (grp, L, h, cx, cy, z, rz, k, nails = true) => { const p = box(L, h, 0.13, wm(M.planks[k % 3], [L / 4, 1]), cx, cy, z); p.rotation.z = rz; grp.add(p);
    if (nails) [-1, 1].forEach((s) => { const nl = new THREE.Mesh(nailG, nailM); nl.rotation.x = Math.PI / 2; nl.position.set(cx + Math.cos(rz) * s * (L / 2 - 0.25), cy + Math.sin(rz) * s * (L / 2 - 0.25), z + 0.08); grp.add(nl); }); return p; };
  (function buildBoards() {
    const r = rng(17), n = 6, span = WIN.y1 - WIN.y0, ph = (span - 0.1) / n - 0.24; let y = WIN.y0 + 0.05;
    for (let i = 0; i < n; i++) { const h = ph + (r() - 0.5) * 0.08, L = WIN.x1 - WIN.x0 + 1.0 + r() * 0.3; plank(boards[1], L, h, WCX + (r() - 0.5) * 0.25, y + h / 2, Z0 + 0.32, (r() - 0.5) * 0.03, i);
      const gap = 0.2 + r() * 0.1; if (i < n - 1) gaps.push([y + h + gap / 2, gap]); y += h + gap; }
    const diag = Math.hypot(WIN.x1 - WIN.x0, span) + 0.6, a = Math.atan2(span, WIN.x1 - WIN.x0);
    plank(boards[2], diag, 0.62, WCX, (WIN.y0 + WIN.y1) / 2, Z0 + 0.48, a, 3); plank(boards[2], diag, 0.62, WCX, (WIN.y0 + WIN.y1) / 2, Z0 + 0.62, -a, 4);
    plank(boards[2], 3.0, 0.5, WCX - 1.9, (WIN.y0 + WIN.y1) / 2, Z0 + 0.5, Math.PI / 2 + 0.05, 5);
    // level 3: a criss-cross mountain nailed every way, sticking out past the frame
    for (let i = 0; i < 26; i++) { const L = 3.0 + r() * 4.0, rz = (r() - 0.5) * Math.PI, cx = WCX + (r() - 0.5) * 5.0, cy = (WIN.y0 + WIN.y1) / 2 + (r() - 0.5) * 4.6;
      plank(boards[3], L, 0.4 + r() * 0.25, cx, cy, Z0 + 0.75 + i * 0.055, rz, i); }
    for (let i = 0; i < 5; i++) plank(boards[3], 6.5 + r(), 0.55, WCX + (r() - 0.5), WIN.y0 + 0.6 + i * 1.0, Z0 + 2.2 + i * 0.05, (r() - 0.5) * 0.4, i + 2);
    // a couple of planks on the floor at level 3 + bent nails
    plank(boards[3], 4.5, 0.5, WCX + 1.5, 0.1, Z0 + 2.6, 0, 1, false).rotation.set(-Math.PI / 2, 0, 0.4);
  })();
  // sky + rooftops behind the window, and the Watcher (props.watcher) far out
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: nightSky })); sky.position.set(WCX, 6, Z0 - 14); add(sky);
  const watcher = new THREE.Group(); watcher.position.set(WCX + 1, 16, Z0 - 13); add(watcher);
  (function buildWatcher() {
    const mT = texPair(256, (g, hg, S) => { g.fillStyle = '#9a9a96'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 31, 0.6, 8, 5); const r = rng(5); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(60,60,60,0.4)'; g.beginPath(); g.arc(r() * S, r() * S, 4 + r() * 14, 0, 7); g.fill(); } });
    const s = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 20), new THREE.MeshBasicMaterial({ map: tex(mT.c), color: new THREE.Color(0.8, 0.85, 1.0) })); watcher.add(s);
    [-1.6, 1.6].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 3.2, 0.6) })); e.position.set(x, 0.8, 4.4); watcher.add(e); });
  })();
  watcher.visible = false;

  // ---------------- suitcases + boxes by the door, coat rack ----------------
  (function byTheDoor() {
    const sc = (w, h, d, c, seed, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; add(g); const m = pbr(leatherT(c, seed).c, leatherT(c, seed).h, { rough: 0.6, bump: 1.5 });
      g.add(rb(w, h, d, 0.12, m, 0, h / 2, 0)); [-w * 0.3, w * 0.3].forEach((dx) => g.add(box(0.14, h + 0.02, d + 0.03, new THREE.MeshStandardMaterial({ color: '#3a2214', roughness: 0.7 }), dx, h / 2, 0)));
      const hd = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 12, Math.PI), M.black); hd.position.set(0, h + 0.02, 0); g.add(hd); return g; };
    sc(2.0, 1.6, 0.8, '#8a2f22', 3, 7.0, Z0 + 1.0, 0.1); sc(1.6, 1.3, 0.7, '#1f4f6e', 5, 7.1, Z0 + 1.1, -0.15).position.y = 1.6; sc(1.2, 2.2, 0.7, '#b07a2e', 7, 8.8, Z0 + 1.4, 0.4);
    const bx = (w, h, d, x, y, z, ry, label) => { const m = box(w, h, d, M.card, x, y + h / 2, z); m.rotation.y = ry; add(m); if (label) { const t = KIT.textTex(256, 128, (g, W, H) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, W, H); g.fillStyle = '#1a1a1a'; g.font = 'bold 56px "Marker Felt", "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, W / 2, H / 2); });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.4), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9 })); p.position.set(0, 0, d / 2 + 0.01); m.add(p); } };
    bx(1.6, 1.3, 1.4, 8.6, 0, -4.2, -0.2, 'KITCHEN'); bx(1.3, 1.1, 1.2, 8.7, 1.3, -4.3, 0.15, 'PIP TOYS'); bx(1.4, 1.0, 1.3, 6.9, 0, -4.6, 0.5, 'MUGS');
    // coat rack (standing) with coats + hats + umbrella
    const cr = new THREE.Group(); cr.position.set(8.9, 0, -2.4); add(cr);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7.4, 10), M.dark); pole.position.y = 3.7; cr.add(pole);
    for (let k = 0; k < 3; k++) { const f = box(1.2, 0.12, 0.14, M.dark, 0, 0.1, 0); f.rotation.y = k * Math.PI / 3; cr.add(f); }
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, hk = box(0.6, 0.08, 0.08, M.dark, Math.cos(a) * 0.3, 7.0, Math.sin(a) * 0.3); hk.rotation.y = -a; hk.rotation.z = 0.5; cr.add(hk); }
    const coat = (c, a, len) => { const m = pbr(texPair(128, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.4, 16, 4); }).c, null, { rough: 0.95 }); const co = rb(1.1, len, 0.5, 0.2, m, Math.cos(a) * 0.55, 7.0 - len / 2, Math.sin(a) * 0.55); co.rotation.y = -a + Math.PI / 2; cr.add(co); };
    coat('#5a3a22', 0.4, 3.6); coat('#2c3e66', 0.4 + Math.PI, 3.0); coat('#8a2f22', 0.4 + Math.PI / 2, 2.6);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.4, 16), M.black); hat.position.set(0, 7.65, 0); cr.add(hat); const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 20), M.black); brim.position.set(0, 7.45, 0); cr.add(brim);
    const umb = new THREE.Mesh(new THREE.ConeGeometry(0.22, 2.8, 8), new THREE.MeshStandardMaterial({ color: '#c0392b', roughness: 0.6 })); umb.position.set(0.6, 1.5, 0.3); umb.rotation.z = 0.15; cr.add(umb);
    // shoes on a little mat
    for (let k = 0; k < 4; k++) add(rb(0.45, 0.35, 1.0, 0.12, k % 2 ? M.black : new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 0.6 }), 2.4 + k * 0.55, 0.18, Z0 + 2.0 + (k % 2) * 0.1));
  })();

  // ---------------- right wall (x=10): sideboard, plates, pictures, radiator ----------------
  (function rightWall() {
    add(rb(1.8, 3.2, 6.0, 0.06, M.dark, X1 - 0.9, 1.6, 2.0));
    for (let k = 0; k < 3; k++) add(box(0.08, 2.2, 1.8, M.table, X1 - 1.82, 1.5, 0.0 + k * 2.0), new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), M.brass).translateX(X1 - 1.9).translateY(1.5).translateZ(0.6 + k * 2.0));
    add(rb(1.2, 3.4, 5.6, 0.04, M.dark, X1 - 0.6, 4.9, 2.0));
    add(box(1.1, 0.12, 5.4, M.table, X1 - 0.6, 5.0, 2.0), box(1.1, 0.12, 5.4, M.table, X1 - 0.6, 6.0, 2.0));
    const plateM = ['#e8e2d4', '#4a7fb5', '#e8e2d4', '#c0392b', '#e8e2d4'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3 }));
    for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 24), plateM[k]); p.rotation.z = Math.PI / 2 - 0.25; p.position.set(X1 - 0.6, 5.5, -0.2 + k * 1.05); add(p); const p2 = p.clone(); p2.position.y = 6.5; add(p2); }
    // lamp on the sideboard (small warm practical, no shadow)
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 0.7, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#f0d8a8', emissive: new THREE.Color('#ffb060'), emissiveIntensity: 2.2, side: THREE.DoubleSide })); sl.position.set(X1 - 0.9, 3.65 + 0.3, -0.4); /* on top of the cabinet section */ sl.position.set(X1 - 0.9, 3.0 + 0.0, 5.6); add(sl);
    // pictures on the right wall above
    const pics = [[8.5, -4.5, 2.0, 1.6, '#3d7a3a'], [8.8, 5.6, 1.6, 2.0, '#7a3a8a'], [9.5, 0.8, 1.4, 1.4, '#2f6fd1']];
    pics.forEach(([y, z, w, h, c], i) => { const t = KIT.textTex(256, 256, (g) => { g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, 256, 256); g.fillStyle = c; g.fillRect(0, 160, 256, 96); g.fillStyle = '#e8a33a'; g.beginPath(); g.arc(70 + i * 40, 80, 30, 0, 7); g.fill(); g.fillStyle = '#5a2a1a'; g.fillRect(140, 100, 60, 60); });
      add(box(0.1, h + 0.2, w + 0.2, M.dark, X1 - 0.06, y, z)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 })); p.position.set(X1 - 0.12, y, z); p.rotation.y = -Math.PI / 2; add(p); });
    // radiator
    for (let k = 0; k < 10; k++) add(rb(0.4, 2.2, 0.22, 0.08, new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.5, metalness: 0.3 }), X1 - 0.35, 1.3, -6.0 + k * 0.3));
    // potted plant in the corner
    const potM = new THREE.MeshStandardMaterial({ color: '#b5582a', roughness: 0.8 }), pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 1.1, 18), potM); pot.position.set(X1 - 1.0, 0.55, Z1 - 1.2); add(pot);
    const leafM = new THREE.MeshStandardMaterial({ color: '#2f6a2c', roughness: 0.7 });
    for (let k = 0; k < 9; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), leafM); l.scale.set(0.5, 1.6, 0.25); const a = k * 0.7; l.position.set(X1 - 1.0 + Math.cos(a) * 0.4, 1.9 + (k % 3) * 0.4, Z1 - 1.2 + Math.sin(a) * 0.4); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); add(l); }
  })();

  // rug under the table
  const rug = new THREE.Mesh(RBX.rbox(9, 0.06, 6.4, 0.03), M.rug); rug.position.set(TB.x, 0.03, TB.z); add(rug);
  // back wall (z=8): archway to the hall + framed mirror (seldom seen; keeps reflections plausible)
  add(box(3.6, 8.6, 0.1, new THREE.MeshStandardMaterial({ color: '#05060e', roughness: 1 }), -5.0, 4.3, Z1 - 0.06), box(4.2, 0.4, 0.25, M.trim, -5.0, 8.8, Z1 - 0.1), box(0.3, 8.6, 0.25, M.trim, -6.95, 4.3, Z1 - 0.1), box(0.3, 8.6, 0.25, M.trim, -3.05, 4.3, Z1 - 0.1));

  shadow(room);
  room.traverse((m) => { if (m.userData.noShadow) m.castShadow = false; if (m.isMesh && m.material && (m.material.isMeshBasicMaterial || m.material.transparent)) { m.castShadow = false; m.receiveShadow = false; } });
  [sky].forEach((m) => { m.castShadow = m.receiveShadow = false; });
  mugs.traverse((m) => { m.castShadow = true; });

  // ---------------- lights ----------------
  const hemi = new THREE.HemisphereLight('#3a52c0', '#2a1a20', 2.0); scene.add(hemi);
  const moonDir = V(0.12, -0.42, 1).normalize();
  const moon = new THREE.DirectionalLight('#9ab4ff', 18); moon.position.copy(V(WCX, 4, -4).addScaledVector(moonDir, -30)); moon.target.position.set(WCX, 4, -4);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 }); moon.shadow.bias = -0.0003; moon.shadow.normalBias = 0.02; moon.shadow.radius = 1;
  scene.add(moon, moon.target);
  const fill = new THREE.PointLight('#5068c8', 18, 0, 2); fill.position.set(0, 9, 5); scene.add(fill);
  const underCab = new THREE.PointLight('#ffb870', 22, 0, 2); underCab.position.set(X0 + 1.4, 5.8, -3.3); scene.add(underCab);
  const hoodL = new THREE.PointLight('#ffc888', 10, 0, 2); hoodL.position.set(X0 + 1.2, 6.4, -2.4); scene.add(hoodL);
  const sideL = new THREE.PointLight('#ffa860', 14, 0, 2); sideL.position.set(X1 - 1.4, 3.6, 5.6); scene.add(sideL);
  // beams through the gaps + haze, dust
  const bmat = RBX.beamMat('#8fb0ff', 0.11), hmat = RBX.beamMat('#7d9cff', 0.006), beams = new THREE.Group(); scene.add(beams);
  gaps.forEach(([y, gap]) => { const L = (y + 0.5) / -moonDir.y; beams.add(RBX.beam(V(WCX, y, Z0 + 0.25), moonDir, WIN.x1 - WIN.x0 - 0.1, gap * 1.8, L * 1.05, bmat)); });
  beams.add(RBX.beam(V(WCX, (WIN.y0 + WIN.y1) / 2, Z0 + 0.25), moonDir, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 12, hmat));
  (function dust() {
    const r = rng(5), N = 320, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const t = r() * 12, p = V(WIN.x0 + r() * (WIN.x1 - WIN.x0), WIN.y0 + r() * (WIN.y1 - WIN.y0), Z0 + 0.4).addScaledVector(moonDir, t); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    beams.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.03, map: tex(c), color: new THREE.Color(1.6, 1.9, 3.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 })));
  })();

  // ---------------- state ----------------
  function setBoards(level) {
    boards[1].visible = level >= 1; boards[2].visible = level >= 2; boards[3].visible = level >= 3;
    bmat.uniforms.k.value = level >= 3 ? 0.035 : level === 2 ? 0.08 : 0.11; beams.visible = level >= 1;
    moon.intensity = level >= 3 ? 9 : level === 0 ? 26 : 18;
  }
  setBoards(1);
  function setCalendar(n) { drawCalendar(n); }

  return {
    scene, grade: 'night',
    marks: {
      p_dad: { p: [DAD.x, 1.0, DAD.z], ry: Math.PI },
      p_mom: { p: [TB.x - 1.2, 0, TB.z - 2.2], ry: 0, sit: true },
      p_door: { p: [4, 0, Z0 + 2.2], ry: 0 },
      cam_calendar: { p: [X0 + 2.5, CAL.y - 0.45, CAL.z], l: [X0, CAL.y - 0.45, CAL.z] },
      cam_clock: { p: [CLK.x, CLK.y - 0.6, Z0 + 2.6], l: [CLK.x, CLK.y, Z0] },
      cam_window: { p: [WCX + 1, 4.5, 3], l: [WCX, 5.5, Z0] },
      cam_mom: { p: [TB.x + 0.3, 4.6, TB.z + 5.0], l: [TB.x - 1.0, 4.3, TB.z - 1.5] },
    },
    props: { boards1: boards[1], boards2: boards[2], boards3: boards[3], beams, mugs, clock, calendar: calTex, watcher, lamp: lampL, moon, setBoards, setCalendar, setClock, setMugs },
    mood(name) {
      if (name === 'night') { setBoards(1); setCalendar(1); setClock(3, 0, 7); setMugs(999); }
      if (name === 'more') { setBoards(2); setCalendar(2); }
      if (name === 'late') { setBoards(3); setCalendar(3); setClock(3, 0, 7); setMugs(999); }
    },
    views: {
      wide: { p: [5.0, 10.8, 7.6], l: [-4.0, 2.2, -4.0], fov: 76, mood: 'night' },
      dad_low: { p: [WCX + 3.2, 0.7, Z0 + 9.0], l: [WCX, 5.4, Z0], fov: 58, mood: 'more' },
      window3: { p: [WCX + 1.5, 4.8, 3.5], l: [WCX, 5.6, Z0], fov: 62, mood: 'late' },
      mom_mugs: { p: [TB.x + 0.8, 6.0, TB.z + 5.6], l: [TB.x - 0.7, 4.3, TB.z - 1.6], fov: 52, mood: 'late' },
      calendar1: { p: [X0 + 3.0, CAL.y - 0.2, CAL.z], l: [X0, CAL.y - 0.2, CAL.z], fov: 62, mood: 'night' },
      calendar3: { p: [X0 + 3.0, CAL.y - 0.2, CAL.z], l: [X0, CAL.y - 0.2, CAL.z], fov: 62, mood: 'late' },
      clock: { p: [CLK.x, CLK.y - 0.2, Z0 + 4.8], l: [CLK.x, CLK.y, Z0], fov: 45, mood: 'late' },
    },
  };
};

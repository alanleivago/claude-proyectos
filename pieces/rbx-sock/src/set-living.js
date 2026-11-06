// rbx-sock LIVING ROOM + STAIRCASE: cosy suburban living room (couch, rug, coffee table, TV, lamps, pictures, plants),
// floor vent at the base of the back wall, golden retriever on his bed, carpeted staircase along the right wall up to a landing,
// wet sock-shaped footprints climbing the stairs (toggle), front door + coat rack, 40 new sock packs (toggle).
'use strict';
SETS.living = async function (ctx) {
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const { V, texPair, noiseOver, woodPlanks, box, rb, wm, shadow } = KIT;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  const room = new THREE.Group(); scene.add(room);
  const add = (...o) => { o.forEach((k) => room.add(k)); return o[0]; };
  const X0 = -12, X1 = 12, Z0 = -10, ZF = 18, RH = 12, WT = 0.6, SX = 8.6;        // SX: stair zone x SX..X1
  const WIN = { x0: -6.6, x1: 0.6, y0: 4.8, y1: 10.0 };                             // back window above the couch
  const VENT = { x0: 2.7, x1: 4.5, y0: 0.32, y1: 1.22 }, VCX = (VENT.x0 + VENT.x1) / 2;
  const SWIN = { z0: -3.4, z1: -0.4, y0: 9.6, y1: 14.6 };                           // stair window (right wall)
  const DOOR = { z0: 7.2, z1: 10.8, y1: 8.5 };
  const NST = 12, RISE = 0.8, LAND = (NST + 1) * RISE;                              // treads i=0..11, landing top 10.4
  const tTop = (i) => (i + 1) * RISE, tFront = (i) => 4 - i, SCX = (SX + X1) / 2;
  const railY = (z) => RISE * (5 - z) + 2.9;

  // ---------------- textures ----------------
  const wallT = texPair(512, (g, hg, S) => {   // warm cream wallpaper: soft stripes + leaf sprigs
    g.fillStyle = '#dcc795'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 7, 0.12, 16, 4);
    for (let k = 0; k < 4; k++) { const x = k * S / 4; g.fillStyle = 'rgba(196,170,112,0.45)'; g.fillRect(x + 40, 0, 48, S); g.fillStyle = 'rgba(255,248,225,0.5)'; g.fillRect(x + 36, 0, 3, S); g.fillRect(x + 89, 0, 3, S); hg.fillStyle = '#9a9a9a'; hg.fillRect(x + 36, 0, 3, S); hg.fillRect(x + 89, 0, 3, S); }
    const sprig = (x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = '#6f7a45'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, s); g.quadraticCurveTo(3, 0, 0, -s); g.stroke();
      [[-1, -0.4], [1, 0], [-1, 0.4], [1, 0.75]].forEach(([d, t]) => { g.fillStyle = '#7d8a4f'; g.beginPath(); g.ellipse(d * s * 0.32, t * s - s * 0.25, s * 0.34, s * 0.13, d * 0.6, 0, 7); g.fill(); });
      g.fillStyle = '#b8563c'; g.beginPath(); g.arc(0, -s, s * 0.18, 0, 7); g.fill(); g.restore();
      hg.fillStyle = '#b8b8b8'; hg.beginPath(); hg.arc(x, y, s * 0.6, 0, 7); hg.fill(); };
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) sprig(i * S / 4 + 64 + 64 * (j % 2), j * S / 4 + 64, 22, (j % 2 ? 0.3 : -0.3));
    const n = tnoise(4, 128), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = im.data[i * 4] * 0.8 + n((i % S) / S, Math.floor(i / S) / S) * 45; hg.putImageData(im, 0, 0);
  });
  const wainT = texPair(256, (g, hg, S, Hh) => {   // white painted wainscot: one raised panel per 2 units, 3.6 tall
    g.fillStyle = '#e9e4d6'; g.fillRect(0, 0, S, Hh); noiseOver(g, S, Hh, 12, 0.1, 8, 3);
    hg.fillStyle = '#c8c8c8'; hg.fillRect(0, 0, S, Hh);
    const x = 26, y = 70, w = S - 52, h = Hh - 150;
    g.fillStyle = 'rgba(90,80,60,0.28)'; g.fillRect(x, y, w, 7); g.fillRect(x, y, 7, h); g.fillStyle = 'rgba(255,255,250,0.6)'; g.fillRect(x, y + h - 7, w, 7); g.fillRect(x + w - 7, y, 7, h);
    hg.fillStyle = '#606060'; hg.fillRect(x, y, w, h); hg.fillStyle = '#a0a0a0'; hg.fillRect(x + 14, y + 14, w - 28, h - 28);
  }, { h: 460 });
  const floorT = woodPlanks(1024, 37, { rows: 6, knots: 26, tones: ['#c99a5e', '#bd8c52', '#d2a468', '#b58450', '#c4955a'] });
  const darkWoodT = woodPlanks(512, 53, { rows: 4, tones: ['#5a2f17', '#4f2813', '#633519', '#56301a'] });
  const midWoodT = woodPlanks(512, 59, { rows: 3, tones: ['#8a5228', '#7d4822', '#94592b'], knots: 4 });
  const rugT = texPair(1024, (g, hg, S, Hh) => {   // persian: navy field, red medallion, cream border with vine
    g.fillStyle = '#7d1e1c'; g.fillRect(0, 0, S, Hh);
    const band = (m, c) => { g.fillStyle = c; g.fillRect(m, m, S - 2 * m, Hh - 2 * m); };
    band(0, '#2a1a2c'); band(18, '#e8d7b0'); band(30, '#7d1e1c'); band(96, '#e8d7b0'); band(108, '#1f2f5e');
    const r = rng(41);
    for (let x = 50; x < S - 30; x += 46) for (const y of [63, Hh - 63]) { g.fillStyle = '#d9a43a'; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.fillStyle = '#1f2f5e'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.fillStyle = '#3d6b45'; g.beginPath(); g.ellipse(x + 23, y, 9, 4, 0.5, 0, 7); g.fill(); }
    for (let y = 100; y < Hh - 80; y += 46) for (const x of [63, S - 63]) { g.fillStyle = '#d9a43a'; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.fillStyle = '#1f2f5e'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    for (let i = 0; i < 160; i++) { const x = 130 + r() * (S - 260), y = 130 + r() * (Hh - 260); g.fillStyle = ['#e8d7b0', '#c94a2c', '#d9a43a', '#3d6b45'][i % 4]; g.beginPath(); g.ellipse(x, y, 6, 3, r() * 3, 0, 7); g.fill(); }
    const lobe = (cx, cy, rx, ry, c) => { g.fillStyle = c; g.beginPath(); for (let k = 0; k <= 64; k++) { const a = (k / 64) * Math.PI * 2, rr = 1 + 0.12 * Math.cos(a * 8); g.lineTo(cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr); } g.fill(); };
    lobe(S / 2, Hh / 2, 300, 200, '#e8d7b0'); lobe(S / 2, Hh / 2, 276, 180, '#9b2320'); lobe(S / 2, Hh / 2, 200, 128, '#1f2f5e'); lobe(S / 2, Hh / 2, 120, 78, '#d9a43a'); lobe(S / 2, Hh / 2, 64, 40, '#9b2320');
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.fillStyle = '#e8d7b0'; g.beginPath(); g.ellipse(S / 2 + Math.cos(a) * 160, Hh / 2 + Math.sin(a) * 104, 22, 10, a, 0, 7); g.fill(); }
    [[190, 190], [S - 190, 190], [190, Hh - 190], [S - 190, Hh - 190]].forEach(([x, y]) => { lobe(x, y, 60, 50, '#9b2320'); lobe(x, y, 34, 28, '#e8d7b0'); lobe(x, y, 14, 12, '#1f2f5e'); });
    noiseOver(g, S, Hh, 79, 0.24, 16, 3);
    const n = tnoise(9, 320), hm = hg.getImageData(0, 0, S, Hh); for (let y = 0; y < Hh; y++) for (let x = 0; x < S; x++) hm.data[(y * S + x) * 4] = 90 + n(x / S, y / Hh) * 120; hg.putImageData(hm, 0, 0);
  }, { h: 720 });
  const couchF = RBX.fleece(512, 512, '#4f6f8f', 11);
  { const r = rng(12); for (let i = 0; i < 40; i++) { couchF.g.fillStyle = 'rgba(20,30,45,0.08)'; couchF.g.beginPath(); couchF.g.ellipse(r() * 512, r() * 512, 20 + r() * 40, 8 + r() * 20, r() * 3, 0, 7); couchF.g.fill(); } }
  const plaidT = (base, a, b, seed) => texPair(256, (g, hg, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    [[a, 0, 60, 0.55], [a, 128, 60, 0.55], [b, 40, 10, 0.8], [b, 168, 10, 0.8], ['#f3ead2', 92, 4, 0.7], ['#f3ead2', 220, 4, 0.7]].forEach(([c, o, w, al]) => { g.globalAlpha = al; g.fillStyle = c; g.fillRect(o, 0, w, S); g.fillRect(0, o, S, w); });
    g.globalAlpha = 1; noiseOver(g, S, S, seed, 0.18, 32, 3);
    for (let y = 0; y < S; y += 4) { hg.fillStyle = y % 8 ? '#a0a0a0' : '#606060'; hg.fillRect(0, y, S, 2); }
  });
  const throwT = plaidT('#a8322c', '#5c1612', '#e2b54a', 21), bedT = plaidT('#3f5a3a', '#26361f', '#c9a04a', 22);
  const pillowT = texPair(256, (g, hg, S) => { g.fillStyle = '#d9a43a'; g.fillRect(0, 0, S, S); g.strokeStyle = '#f6ecd4'; g.lineWidth = 10;
    for (let k = -S; k < 2 * S; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, 64); g.lineTo(k, 128); g.lineTo(k + 64, 192); g.lineTo(k, 256); g.stroke(); } noiseOver(g, S, S, 24, 0.2, 16, 3); });
  const runnerT = texPair(256, (g, hg, S) => { g.fillStyle = '#d2c3a2'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#8e1f22'; g.fillRect(8, 0, 20, S); g.fillRect(S - 28, 0, 20, S); g.fillStyle = '#1f2f5e'; g.fillRect(34, 0, 6, S); g.fillRect(S - 40, 0, 6, S);
    for (let y = 0; y < S; y += 32) { g.fillStyle = 'rgba(142,31,34,0.18)'; g.beginPath(); g.moveTo(S / 2, y); g.lineTo(S / 2 + 18, y + 16); g.lineTo(S / 2, y + 32); g.lineTo(S / 2 - 18, y + 16); g.fill(); }
    noiseOver(g, S, S, 31, 0.25, 32, 3); for (let x = 0; x < S; x += 4) { hg.fillStyle = x % 8 ? '#b0b0b0' : '#505050'; hg.fillRect(x, 0, 2, S); } });
  const plasterT = texPair(256, (g, hg, S) => { g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.12, 8, 4); const n = tnoise(6, 64), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 100 + n((i % S) / S, Math.floor(i / S) / S) * 60; hg.putImageData(im, 0, 0); });
  const cabDoorT = texPair(256, (g, hg, S) => { g.drawImage(midWoodT.c, 0, 0, S, S); g.strokeStyle = 'rgba(30,12,4,0.7)'; g.lineWidth = 6; g.strokeRect(30, 30, S - 60, S - 60); g.strokeStyle = 'rgba(230,180,120,0.3)'; g.lineWidth = 2; g.strokeRect(38, 38, S - 76, S - 76);
    hg.fillStyle = '#d0d0d0'; hg.fillRect(0, 0, S, S); hg.fillStyle = '#707070'; hg.fillRect(34, 34, S - 68, S - 68); });
  const doorT = texPair(256, (g, hg) => { g.fillStyle = '#7a2a22'; g.fillRect(0, 0, 256, 512); noiseOver(g, 256, 512, 14, 0.15, 16, 3);
    [[28, 150, 88, 150], [140, 150, 88, 150], [28, 330, 88, 150], [140, 330, 88, 150]].forEach(([x, y, w, h]) => { g.strokeStyle = 'rgba(30,8,4,0.8)'; g.lineWidth = 6; g.strokeRect(x, y, w, h); g.strokeStyle = 'rgba(255,190,170,0.25)'; g.lineWidth = 2; g.strokeRect(x + 7, y + 7, w - 14, h - 14); hg.fillStyle = '#606060'; hg.fillRect(x, y, w, h); hg.fillStyle = '#a0a0a0'; hg.fillRect(x + 10, y + 10, w - 20, h - 20); });
    [0, 1, 2].forEach((k) => { g.fillStyle = '#9fc4e8'; g.fillRect(36 + k * 64, 34, 52, 84); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(40 + k * 64, 38, 14, 76); g.strokeStyle = '#3a120c'; g.lineWidth = 5; g.strokeRect(36 + k * 64, 34, 52, 84); }); }, { h: 512 });

  // outside: one card per mood (sky + fence + trees + neighbour house)
  function skyTex(mode) {
    const c = cnv(1024, 1024), g = c.getContext('2d'), r = rng(5), gr = g.createLinearGradient(0, 0, 0, 1024);
    const P = { day: ['#4f97f0', '#bfe0ff', '#4c8a3c', '#2f5e2a', '#c9b48a', '#ffffff'], evening: ['#3a3d8c', '#ff9d5c', '#2c3a2a', '#1c2a1e', '#5a4a40', '#ffb0a0'], night: ['#050c34', '#1c3a96', '#0c1636', '#08102a', '#141c3a', '#3a4a8a'] }[mode];
    gr.addColorStop(0, P[0]); gr.addColorStop(0.75, P[1]); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    if (mode === 'night') { for (let i = 0; i < 220; i++) { g.fillStyle = '#ffffff'; const s = r() < 0.1 ? 3 : 2; g.fillRect(r() * 1024, r() * 640, s, s); } g.fillStyle = '#eef2ff'; g.beginPath(); g.arc(760, 220, 46, 0, 7); g.fill(); }
    else for (let i = 0; i < 7; i++) { g.fillStyle = mode === 'day' ? 'rgba(255,255,255,0.85)' : 'rgba(255,190,170,0.6)'; const x = r() * 1024, y = 80 + r() * 300; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + k * 34, y + Math.sin(k) * 10, 30 + r() * 20, 0, 7); g.fill(); } }
    g.fillStyle = P[4]; g.fillRect(560, 560, 340, 300); g.beginPath(); g.moveTo(540, 560); g.lineTo(730, 430); g.lineTo(920, 560); g.fill();   // neighbour house
    [[600, 620], [780, 620]].forEach(([x, y]) => { g.fillStyle = mode === 'day' ? '#9fc4e8' : '#ffb35a'; g.fillRect(x, y, 70, 80); });
    for (let i = 0; i < 9; i++) { const x = i * 130 + r() * 40, y = 640 + r() * 80, rr = 90 + r() * 60; g.fillStyle = i % 2 ? P[2] : P[3]; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.beginPath(); g.arc(x + rr * 0.6, y + 30, rr * 0.7, 0, 7); g.fill(); }
    g.fillStyle = P[3]; g.fillRect(0, 780, 1024, 244);
    for (let x = 0; x < 1024; x += 44) { g.fillStyle = mode === 'night' ? '#2a2e44' : mode === 'evening' ? '#7a6050' : '#e8e0cc'; g.fillRect(x, 760, 34, 200); g.beginPath(); g.moveTo(x, 760); g.lineTo(x + 17, 736); g.lineTo(x + 34, 760); g.fill(); }
    g.fillRect(0, 800, 1024, 16); g.fillRect(0, 900, 1024, 16);
    return tex(c);
  }
  const SKY = { day: skyTex('day'), evening: skyTex('evening'), night: skyTex('night') };
  const envT = (() => { const c = cnv(512, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#46506e'); gr.addColorStop(0.5, '#1c2030'); gr.addColorStop(1, '#100c0a'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    [[120, 70, 60, 50], [330, 80, 36, 60]].forEach(([x, y, w, h]) => { g.fillStyle = '#e4ecff'; g.fillRect(x, y, w, h); }); const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t; })();

  const M = {
    wall: pbr(wallT.c, wallT.h, { rough: 0.9, bump: 2, repeat: [1 / 3, 1 / 3] }),
    wain: pbr(wainT.c, wainT.h, { rough: 0.55, bump: 3, repeat: [1 / 2, 1 / 3.6] }),
    floor: pbr(floorT.c, floorT.h, { rough: 0.42, bump: 4, repeat: [1 / 6, 1 / 6] }),
    dark: pbr(darkWoodT.c, darkWoodT.h, { rough: 0.5, bump: 3 }),
    mid: pbr(midWoodT.c, midWoodT.h, { rough: 0.45, bump: 3 }),
    rug: pbr(rugT.c, rugT.h, { rough: 1, bump: 1.2, nscale: 0.5 }),
    couch: pbr(couchF.c, couchF.h, { rough: 0.95, bump: 3, repeat: [1.5, 1.5] }),
    throw: pbr(throwT.c, throwT.h, { rough: 0.95, bump: 3, repeat: [1, 1] }),
    dogbed: pbr(bedT.c, bedT.h, { rough: 0.95, bump: 3, repeat: [2, 2] }),
    pillow: pbr(pillowT.c, null, { rough: 0.9 }),
    runner: pbr(runnerT.c, runnerT.h, { rough: 1, bump: 3 }),
    plaster: pbr(plasterT.c, plasterT.h, { rough: 0.95, bump: 1.5, repeat: [1 / 4, 1 / 4] }),
    cab: pbr(cabDoorT.c, cabDoorT.h, { rough: 0.5, bump: 2 }),
    door: pbr(doorT.c, doorT.h, { rough: 0.45, bump: 3 }),
    trim: new THREE.MeshStandardMaterial({ color: '#efeadc', roughness: 0.45 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c9a35a', roughness: 0.3, metalness: 0.9, envMap: envT }),
    grille: new THREE.MeshStandardMaterial({ color: '#d6d2c8', roughness: 0.35, metalness: 0.6, envMap: envT, envMapIntensity: 0.6 }),
    duct: new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.4, metalness: 0.7 }),
    hole: new THREE.MeshBasicMaterial({ color: '#000000' }),
    black: new THREE.MeshStandardMaterial({ color: '#121214', roughness: 0.3 }),
    shell: new THREE.MeshStandardMaterial({ color: '#0b0e1c', roughness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe0ff', roughness: 0.05, transparent: true, opacity: 0.12, envMap: envT }),
    leaf: new THREE.MeshStandardMaterial({ color: '#2f6a2c', roughness: 0.6 }), leaf2: new THREE.MeshStandardMaterial({ color: '#4a8a36', roughness: 0.6 }),
    pot: new THREE.MeshStandardMaterial({ color: '#b5582a', roughness: 0.8 }), potW: new THREE.MeshPhysicalMaterial({ color: '#e9e4da', roughness: 0.3, clearcoat: 0.5 }),
  };
  const ch = (par, m) => { par.add(m); return m; };
  const colM = {}, col = (c, r = 0.6) => colM[c + r] || (colM[c + r] = new THREE.MeshStandardMaterial({ color: c, roughness: r }));

  // walls with holes (extruded: caps get world UVs)
  function holeWall(L, H, holes, mat) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.closePath();
    holes.forEach(([a0, b0, a1, b1]) => { const p = new THREE.Path(); p.moveTo(a0, b0); p.lineTo(a0, b1); p.lineTo(a1, b1); p.lineTo(a1, b0); p.closePath(); sh.holes.push(p); });
    return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }), mat);
  }
  // sweep a 2D cross-section (x,y) along z (cloth over furniture), with wrinkles
  function drape(pts, z0, z1, mat, amp = 0.05, seed = 1) {
    const cur = new THREE.CatmullRomCurve3(pts.map(([x, y]) => V(x, y, 0))), NU = 48, NZ = 20, L = cur.getLength(), pos = [], uv = [], idx = [];
    for (let i = 0; i <= NU; i++) { const t = i / NU, p = cur.getPointAt(t), tg = cur.getTangentAt(t), nx = -tg.y, ny = tg.x;
      for (let j = 0; j <= NZ; j++) { const z = z0 + (z1 - z0) * j / NZ, w = amp * (Math.sin(z * 4.1 + t * 9 + seed) + 0.6 * Math.sin(z * 9.3 - t * 5)) * Math.sin(Math.PI * Math.min(1, t * 1.2));
        pos.push(p.x + nx * w, p.y + ny * w, z); uv.push(t * L / 2.2, (z - z0) / 2.2); } }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NZ; j++) { const a = i * (NZ + 1) + j, b = a + NZ + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G.setIndex(idx); G.computeVertexNormals();
    const m = new THREE.Mesh(G, mat.clone()); m.material.side = THREE.DoubleSide; return m;
  }
  function plant(x, y, z, s = 1, seed = 1, potM = M.pot) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); room.add(g);
    ch(g, new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 1.1, 18), potM)).position.y = 0.55;
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16), col('#3a2414', 1)); soil.position.y = 1.06; g.add(soil);
    const r = rng(seed);
    for (let k = 0; k < 13; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), k % 3 ? M.leaf : M.leaf2), a = k * 2.4 + r(); l.scale.set(0.45, 1.5 + r() * 0.5, 0.18); const rr = 0.25 + r() * 0.35;
      l.position.set(Math.cos(a) * rr, 1.7 + (k % 4) * 0.35 + r() * 0.2, Math.sin(a) * rr); l.rotation.set(Math.sin(a) * 0.7, a, Math.cos(a) * 0.7); g.add(l); }
    return g;
  }
  function frame(w, h, draw, mat = M.dark) {
    const g = new THREE.Group(), t = KIT.textTex(256, Math.round(256 * h / w), (gg, W2, H2) => draw(gg, W2, H2));
    g.add(box(w + 0.3, h + 0.3, 0.12, mat, 0, 0, 0)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.35 })); p.position.z = 0.07; g.add(p);
    return g;
  }

  // ---------------- shell: floor, walls, ceilings ----------------
  { const fl = new THREE.PlaneGeometry(X1 - X0, ZF + 12); const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (X1 - X0), uv.getY(i) * (ZF + 12));
    const f = new THREE.Mesh(fl, M.floor); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, (ZF - 12) / 2); add(f); }
  // back wall (window + vent holes)
  const back = holeWall(SX - X0, RH, [[WIN.x0 - X0, WIN.y0, WIN.x1 - X0, WIN.y1], [VENT.x0 - X0, VENT.y0, VENT.x1 - X0, VENT.y1]], M.wall); back.position.set(X0, 0, Z0 - WT); add(back);
  // left wall (plane + shell)
  { const L = ZF - Z0, g = new THREE.PlaneGeometry(L, RH), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L, uv.getY(i) * RH);
    const m = new THREE.Mesh(g, M.wall); m.rotation.y = Math.PI / 2; m.position.set(X0, RH / 2, (Z0 + ZF) / 2); add(m); add(box(0.5, RH, L + 2, M.shell, X0 - 0.26, RH / 2, (Z0 + ZF) / 2)); }
  // right wall (stair window + front door), 22 tall for the stairwell
  const right = holeWall(ZF + 12, 22, [[SWIN.z0 + 12, SWIN.y0, SWIN.z1 + 12, SWIN.y1], [DOOR.z0 + 12, 0.02, DOOR.z1 + 12, DOOR.y1]], M.wall); right.rotation.y = -Math.PI / 2; right.position.set(X1 + WT, 0, -12); add(right);
  // stair zone back wall, side closure behind the living back wall, upper wall + bulkhead, ceilings
  add(box(X1 - SX + 0.6, 22, WT, M.wall, SCX, 11, -12 - WT / 2, true), box(0.6, 22, 2.4, M.shell, SX - 0.3, 11, -11.25));
  add(box(0.4, 10, 16, M.wall, SX - 0.2, 17, -4, true), box(X1 - SX, 10, 0.4, M.wall, SCX, 17, 4.2, true));
  add(box(SX - X0 + 0.4, 0.5, ZF - Z0 + 1, M.plaster, (X0 + SX) / 2, RH + 0.25, (Z0 + ZF) / 2, true), box(X1 - SX, 0.5, ZF - 4, M.plaster, SCX, RH + 0.25, (4 + ZF) / 2, true), box(X1 - SX + 1, 0.5, 17, M.plaster, SCX, 22.25, -4));
  room.children.forEach((m) => { if (m.material === M.plaster) { m.material = wm(M.plaster, [1 / 4, 1 / 4]); } });
  // crown moulding + baseboards + wainscot + chair rail (living room)
  const crown = (len, x, z, ry) => { const c = box(len, 0.45, 0.25, M.trim, x, RH - 0.22, z); c.rotation.y = ry; add(c); const c2 = box(len, 0.15, 0.4, M.trim, x, RH - 0.5, z); c2.rotation.y = ry; add(c2); };
  crown(SX - X0, (X0 + SX) / 2, Z0 + 0.12, 0); crown(ZF - Z0, X0 + 0.12, (Z0 + ZF) / 2, Math.PI / 2); crown(ZF - 4, X1 - 0.12, (4 + ZF) / 2, Math.PI / 2);
  const wainRun = (x0, x1, z, rot) => { const L = x1 - x0, c = (x0 + x1) / 2, mk = (o) => { if (rot) { o.rotation.y = Math.PI / 2; } add(o); };
    const pos = (d) => rot ? [z + d, 0, c] : [c, 0, z + d];
    const w = box(L, 3.6, 0.1, wm(M.wain, [1 / 2, 1 / 3.6]), 0, 1.8, 0, true); w.position.set(pos(0.05)[0], 1.8, pos(0.05)[2]); mk(w);
    const rail = box(L, 0.2, 0.2, M.trim, 0, 3.65, 0); rail.position.set(pos(0.1)[0], 3.65, pos(0.1)[2]); mk(rail);
    const bb = box(L, 0.55, 0.18, M.trim, 0, 0.275, 0); bb.position.set(pos(0.12)[0], 0.275, pos(0.12)[2]); mk(bb); };
  wainRun(X0, VENT.x0 - 0.2, Z0, false); wainRun(VENT.x1 + 0.2, SX - 0.3, Z0, false);
  add(box(VENT.x1 - VENT.x0 + 0.4, 3.6 - VENT.y1 - 0.2, 0.1, wm(M.wain, [1 / 2, 1 / 3.6]), VCX, (VENT.y1 + 0.2 + 3.6) / 2, Z0 + 0.05, true), box(VENT.x1 - VENT.x0 + 0.4, 0.2, 0.2, M.trim, VCX, 3.65, Z0 + 0.1));
  wainRun(Z0, ZF, X0, true);
  wainRun(4.3, DOOR.z0 - 0.3, X1, true); wainRun(DOOR.z1 + 0.3, ZF, X1, true);
  // the right-wall runs were placed at x = X1 + d: mirror their offset inward
  room.children.forEach((m) => { if (m.rotation.y === Math.PI / 2 && m.position.x > X1) m.position.x = X1 - (m.position.x - X1); });

  // ---------------- back window: trim, muntins, sill, curtains, sky ----------------
  { const T = 0.3, zf = Z0 + 0.1, cx = (WIN.x0 + WIN.x1) / 2, cy = (WIN.y0 + WIN.y1) / 2, w = WIN.x1 - WIN.x0, h = WIN.y1 - WIN.y0;
    add(box(w + 2 * T, T, 0.2, M.trim, cx, WIN.y1 + T / 2, zf), box(T, h, 0.2, M.trim, WIN.x0 - T / 2, cy, zf), box(T, h, 0.2, M.trim, WIN.x1 + T / 2, cy, zf));
    add(box(w + 2 * T + 0.4, 0.2, 0.7, M.trim, cx, WIN.y0 - 0.1, Z0 + 0.25), box(w + 2 * T, 0.3, 0.12, M.trim, cx, WIN.y0 - 0.35, zf));
    for (let k = 1; k < 4; k++) add(box(0.1, h, 0.12, M.trim, WIN.x0 + k * w / 4, cy, Z0 - 0.3));
    add(box(w, 0.1, 0.12, M.trim, cx, cy, Z0 - 0.3), box(w, h, 0.02, M.glass, cx, cy, Z0 - 0.32));
    add(box(w + 3.6, 0.12, 0.12, M.brass, cx, WIN.y1 + 0.9, Z0 + 0.45)); [-1, 1].forEach((s) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), M.brass); k.position.set(cx + s * (w / 2 + 1.85), WIN.y1 + 0.9, Z0 + 0.45); add(k); });
    const curT = texPair(256, (g, hg, S) => { g.fillStyle = '#b85a3c'; g.fillRect(0, 0, S, S); for (let x = 0; x < S; x += 32) { g.fillStyle = 'rgba(255,220,180,0.25)'; g.fillRect(x, 0, 6, S); } noiseOver(g, S, S, 44, 0.2, 16, 3); });
    const curM = pbr(curT.c, null, { rough: 0.95 });
    [-1, 1].forEach((s) => { const geo = new THREE.PlaneGeometry(1.8, WIN.y1 + 0.9 - 2.6, 30, 10), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.16 * Math.sin(x * 7.5) + 0.08); } geo.computeVertexNormals();
      const c = new THREE.Mesh(geo, curM.clone()); c.material.side = THREE.DoubleSide; c.position.set(cx + s * (w / 2 + 0.9), 2.6 + (WIN.y1 + 0.9 - 2.6) / 2, Z0 + 0.45); add(c); });
  }
  const skyM = new THREE.MeshBasicMaterial({ map: SKY.day }), sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), skyM); sky.position.set(-3, 7, Z0 - 7); add(sky);
  const sky2 = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), skyM); sky2.rotation.y = -Math.PI / 2; sky2.position.set(X1 + 7, 13, -2); add(sky2);
  // stair window trim
  { const T = 0.3, xf = X1 - 0.1, cz = (SWIN.z0 + SWIN.z1) / 2, cy = (SWIN.y0 + SWIN.y1) / 2, w = SWIN.z1 - SWIN.z0, h = SWIN.y1 - SWIN.y0;
    add(box(0.2, T, w + 2 * T, M.trim, xf, SWIN.y1 + T / 2, cz), box(0.2, T, w + 2 * T, M.trim, xf, SWIN.y0 - T / 2, cz), box(0.2, h, T, M.trim, xf, cy, SWIN.z0 - T / 2), box(0.2, h, T, M.trim, xf, cy, SWIN.z1 + T / 2));
    add(box(0.12, h, 0.1, M.trim, X1 + 0.3, cy, cz), box(0.12, 0.1, w, M.trim, X1 + 0.3, cy, cz), box(0.02, h, w, M.glass, X1 + 0.32, cy, cz)); }

  // ---------------- vent (wall base) ----------------
  const vent = new THREE.Group(); add(vent);
  { const w = VENT.x1 - VENT.x0, h = VENT.y1 - VENT.y0, cy = (VENT.y0 + VENT.y1) / 2;
    vent.add(box(w, h, 0.04, M.hole, VCX, cy, Z0 - WT - 1.0));
    vent.add(box(w, 0.04, WT + 1, M.duct, VCX, VENT.y0, Z0 - (WT + 1) / 2), box(w, 0.04, WT + 1, M.duct, VCX, VENT.y1, Z0 - (WT + 1) / 2), box(0.04, h, WT + 1, M.duct, VENT.x0, cy, Z0 - (WT + 1) / 2), box(0.04, h, WT + 1, M.duct, VENT.x1, cy, Z0 - (WT + 1) / 2));
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.85 })); dark.position.set(VCX, cy, Z0 - 0.35); vent.add(dark);
    vent.add(box(w + 0.1, 0.06, 0.6, M.duct, VCX, 0.03, Z0 + 0.1)); }
  const grille = new THREE.Group(); grille.position.set(VCX, (VENT.y0 + VENT.y1) / 2, Z0 + 0.05); vent.add(grille);
  { const w = VENT.x1 - VENT.x0 + 0.3, h = VENT.y1 - VENT.y0 + 0.3;
    grille.add(box(w, 0.15, 0.06, M.grille, 0, h / 2 - 0.075, 0), box(w, 0.15, 0.06, M.grille, 0, -h / 2 + 0.075, 0), box(0.15, h, 0.06, M.grille, -w / 2 + 0.075, 0, 0), box(0.15, h, 0.06, M.grille, w / 2 - 0.075, 0, 0));
    for (let k = 0; k < 5; k++) { const s = box(w - 0.3, 0.1, 0.03, M.grille, 0, -h / 2 + 0.24 + k * 0.17, 0.0); s.rotation.x = -0.75; grille.add(s); }
    [-1, 1].forEach((sx) => { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), M.duct); sc.rotation.x = Math.PI / 2; sc.position.set(sx * (w / 2 - 0.08), 0, 0.04); grille.add(sc); });
    grille.position.z = Z0 + 0.13; }

  // ---------------- couch ----------------
  const CX = -3.4, CZ = -8.2, couch = new THREE.Group(); add(couch);
  { const W = 9.4, cm = M.couch;
    couch.add(rb(W, 0.95, 3.4, 0.12, cm, CX, 1.12, CZ));
    couch.add(rb(W, 2.6, 0.8, 0.15, cm, CX, 2.6, CZ - 1.3));
    [-1, 1].forEach((s) => couch.add(rb(0.9, 1.65, 3.5, 0.25, cm, CX + s * (W / 2 - 0.45), 2.2, CZ + 0.02)));
    [-2.55, 0, 2.55].forEach((dx, i) => { const c = rb(2.5, 0.6, 2.6, 0.22, cm, CX + dx, 1.88, CZ + 0.35); c.rotation.y = (i - 1) * 0.01; couch.add(c);
      const bc = rb(2.5, 2.1, 0.85, 0.3, cm, CX + dx, 3.1, CZ - 0.78); bc.rotation.x = -0.14; couch.add(bc); });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.07, 0.65, 10), M.dark); l.position.set(CX + sx * (W / 2 - 0.3), 0.325, CZ + sz * 1.45); couch.add(l); });
    // throw pillows
    [[-3.3, 0.5, M.pillow], [3.2, -0.45, col('#a8322c', 0.9)]].forEach(([dx, rz, m]) => { const p = rb(1.5, 1.4, 0.45, 0.22, m, CX + dx, 2.75, CZ - 0.25); p.rotation.set(-0.25, 0, rz); couch.add(p); });
    // throw blanket over the left arm
    const ax = CX - W / 2 + 0.45; couch.add(drape([[ax + 1.6, 2.22], [ax + 0.6, 2.35], [ax + 0.05, 3.08], [ax - 0.45, 2.95], [ax - 0.55, 2.0], [ax - 0.55, 1.2]], CZ - 0.9, CZ + 1.3, M.throw, 0.05, 2));
  }
  // under the couch: dust bunnies, a toy car, coins, a crayon, a remote
  { const dust = RBX.plushMat('#8d8a86', '#cfcac2', 9, 1);
    [[-5.8, -8.6], [-2.2, -9.0], [-0.4, -8.0], [-4.0, -7.6]].forEach(([x, z], i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.22 + i * 0.03, 12, 8), dust); d.scale.y = 0.5; d.position.set(x, 0.1, z); add(d); });
    const car = new THREE.Group(); car.position.set(-1.6, 0, -7.3); car.rotation.y = 0.7; add(car); car.add(rb(0.7, 0.22, 0.38, 0.06, col('#d23a2a', 0.3), 0, 0.2, 0), rb(0.38, 0.18, 0.34, 0.05, col('#d23a2a', 0.3), -0.05, 0.38, 0));
    [[-0.22, 0.2], [0.22, 0.2], [-0.22, -0.2], [0.22, -0.2]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), M.black); w.rotation.x = Math.PI / 2; w.position.set(x, 0.09, z); car.add(w); });
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14), M.brass); c.position.set(-3.6 + i * 0.35, 0.01, -8.4 + (i % 2) * 0.3); add(c); }
    const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), col('#2f6fd1', 0.5)); cr.rotation.set(0, 0, Math.PI / 2); cr.position.set(-5.0, 0.04, -7.2); cr.rotation.y = 0.4; add(cr);
    const rem = rb(0.3, 0.1, 0.9, 0.04, M.black, -2.9, 0.05, -8.8); rem.rotation.y = 0.5; add(rem);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), col('#e23a3a', 0.35)); ball.position.set(-4.4, 0.26, -8.9); add(ball);
    const brick = rb(0.5, 0.28, 0.25, 0.03, col('#2f6fd1', 0.3), -3.5, 0.14, -7.9); brick.rotation.y = 0.9; add(brick); [-0.12, 0.12].forEach((dx) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 10), brick.material); st.position.set(dx, 0.17, 0); brick.add(st); });
    const dino = new THREE.Group(); dino.position.set(-2.2, 0, -7.6); dino.rotation.y = -0.6; add(dino); dino.add(rb(0.5, 0.3, 0.25, 0.08, col('#3c9a4a', 0.5), 0, 0.3, 0), rb(0.2, 0.32, 0.18, 0.06, col('#3c9a4a', 0.5), 0.22, 0.52, 0), rb(0.26, 0.16, 0.18, 0.05, col('#3c9a4a', 0.5), 0.33, 0.68, 0));
    [[-0.15, 0.08], [0.12, 0.08], [-0.15, -0.08], [0.12, -0.08]].forEach(([x, z]) => dino.add(box(0.08, 0.2, 0.08, col('#3c9a4a', 0.5), x, 0.1, z)));
    const paper = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), col('#f1ece0', 0.9)); paper.position.set(-4.9, 0.16, -8.0); add(paper);
    // shadow catcher: dark gradient under the couch
    const sc = cnv(128, 128), sg = sc.getContext('2d'), gr = sg.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, 128, 128);
    const ao = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 4.4), new THREE.MeshBasicMaterial({ map: tex(sc), transparent: true, depthWrite: false })); ao.rotation.x = -Math.PI / 2; ao.position.set(CX, 0.012, CZ); add(ao); }

  // ---------------- rug, coffee table, TV wall, shelves, lamps, plants ----------------
  const rug = new THREE.Mesh(RBX.rbox(12, 0.06, 8.4, 0.03), M.rug); rug.position.set(CX + 0.4, 0.03, -3.6); add(rug);
  const TB = { x: CX + 0.2, z: -2.6 };
  { add(rb(4.8, 0.25, 2.3, 0.06, M.mid, TB.x, 1.75, TB.z), rb(4.4, 0.15, 1.9, 0.04, M.mid, TB.x, 0.55, TB.z));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => add(box(0.22, 1.65, 0.22, M.dark, TB.x + sx * 2.2, 0.83, TB.z + sz * 0.95)));
    const mag = (c, x, z, ry, y) => { const m = box(1.1, 0.06, 1.4, col(c, 0.5), x, y, z); m.rotation.y = ry; add(m); };
    mag('#2f6fd1', TB.x - 1.4, TB.z + 0.1, 0.2, 1.9); mag('#e8b830', TB.x - 1.3, TB.z, -0.15, 1.96); mag('#d23a2a', TB.x + 0.6, TB.z, 0.3, 0.66); mag('#3c9a4a', TB.x + 0.5, TB.z + 0.1, -0.2, 0.72);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.5, 16), M.potW); mug.position.set(TB.x + 1.6, 2.12, TB.z + 0.4); add(mug);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), col('#3f7f8f', 0.3)); bowl.material.side = THREE.DoubleSide; bowl.position.set(TB.x + 0.3, 2.45, TB.z - 0.2); add(bowl);
    ['#e85a2a', '#e8b830', '#c8262c'].forEach((c, i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), col(c, 0.4)); f.position.set(TB.x + 0.1 + i * 0.22, 2.1, TB.z - 0.2 + (i % 2) * 0.2); add(f); });
    const rem = rb(0.3, 0.1, 0.9, 0.04, M.black, TB.x + 1.0, 1.92, TB.z - 0.5); rem.rotation.y = -0.4; add(rem); }
  // TV cabinet + TV on the left wall
  const TVZ = -0.2;
  { add(rb(1.7, 2.3, 7.2, 0.06, M.mid, X0 + 0.95, 1.15, TVZ));
    [-2.7, -0.9, 0.9, 2.7].forEach((dz) => { const d = box(0.06, 1.7, 1.7, M.cab, X0 + 1.83, 1.25, TVZ + dz); add(d); const k = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.brass); k.position.set(X0 + 1.9, 1.6, TVZ + dz + (dz < 0 ? 0.65 : -0.65)); add(k); });
    add(box(0.5, 0.2, 1.4, M.black, X0 + 0.8, 2.4, TVZ), box(0.25, 0.7, 0.3, M.black, X0 + 0.8, 2.75, TVZ), box(0.3, 3.7, 6.4, M.black, X0 + 0.8, 5.0, TVZ));
    const sc = cnv(256, 160), sg = sc.getContext('2d'), gr = sg.createLinearGradient(0, 0, 256, 160); gr.addColorStop(0, '#2a3038'); gr.addColorStop(0.45, '#0c0e12'); gr.addColorStop(1, '#050608'); sg.fillStyle = gr; sg.fillRect(0, 0, 256, 160);
    sg.fillStyle = 'rgba(255,255,255,0.05)'; sg.beginPath(); sg.moveTo(30, 0); sg.lineTo(110, 0); sg.lineTo(40, 160); sg.lineTo(-40, 160); sg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 3.45), new THREE.MeshStandardMaterial({ map: tex(sc), roughness: 0.15, metalness: 0.2, envMap: envT, envMapIntensity: 0.4 })); scr.rotation.y = Math.PI / 2; scr.position.set(X0 + 0.96, 5.0, TVZ); add(scr);
    add(rb(0.35, 0.3, 3.6, 0.05, M.black, X0 + 1.4, 2.45, TVZ));                          // soundbar
    add(rb(1.0, 0.25, 1.2, 0.04, col('#e9e9ec', 0.3), X0 + 1.0, 2.43, TVZ + 2.8));          // console
    ['#c8262c', '#2f4f9b', '#e8b830', '#3c9a4a'].forEach((c, i) => add(box(1.0, 0.18, 1.3 - i * 0.1, col(c, 0.6), X0 + 1.0, 2.39 + i * 0.18, TVZ - 3.0)));
    plant(X0 + 1.0, 2.3, TVZ - 3.0 + 0.2, 0.5, 4, M.potW).position.y = 3.02;
    // frames above the TV
    const fam = frame(2.4, 1.8, (g, w, h) => { g.fillStyle = '#9fc4e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a9a4a'; g.fillRect(0, h * 0.7, w, h * 0.3);
      [['#F28A1E', 50, 1.0], ['#c94f7a', 100, 1.15], ['#3d6fd1', 160, 1.2], ['#ffd332', 210, 0.75]].forEach(([c, x, s]) => { const hh = 70 * s; g.fillStyle = c; g.fillRect(x - 16 * s, h * 0.72 - hh, 32 * s, hh * 0.6); g.fillStyle = '#EFCFA8'; g.fillRect(x - 11 * s, h * 0.72 - hh - 24 * s, 22 * s, 22 * s); g.fillStyle = '#222'; g.fillRect(x - 6 * s, h * 0.72 - hh - 16 * s, 3, 3); g.fillRect(x + 3 * s, h * 0.72 - hh - 16 * s, 3, 3); });
      g.fillStyle = '#d79a45'; g.fillRect(232, h * 0.66, 18, 14); });
    fam.rotation.y = Math.PI / 2; fam.position.set(X0 + 0.07, 8.6, TVZ - 1.7); add(fam);
    const land = frame(1.6, 2.0, (g, w, h) => { g.fillStyle = '#f4c27a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e86a3a'; g.beginPath(); g.arc(w / 2, h * 0.4, 40, 0, 7); g.fill(); g.fillStyle = '#3a5a8a'; g.fillRect(0, h * 0.6, w, h * 0.4); g.fillStyle = '#2a3a5a'; g.beginPath(); g.moveTo(0, h * 0.6); g.lineTo(80, h * 0.35); g.lineTo(160, h * 0.6); g.fill(); }, col('#d9b45a', 0.3));
    land.rotation.y = Math.PI / 2; land.position.set(X0 + 0.07, 8.4, TVZ + 1.4); add(land); }
  // bookcase (left wall, front)
  { const BZ = 7.0, BX = X0 + 0.65; add(box(1.2, 7.6, 4.2, M.dark, BX, 3.8, BZ));
    const bc = ['#c8262c', '#2f4f9b', '#e8b830', '#3c9a4a', '#6b4a8a', '#e9e3d6', '#b5582a', '#1f2f5e'], r = rng(77);
    for (let s = 0; s < 5; s++) { const y = 0.35 + s * 1.45; add(box(1.0, 0.1, 4.0, M.mid, BX + 0.12, y, BZ)); if (s === 4) continue; let z = BZ - 1.85;
      while (z < BZ + 1.7) { const t = 0.15 + r() * 0.2, h = 0.8 + r() * 0.45, b = box(0.8, h, t, col(bc[Math.floor(r() * 8)], 0.7), BX + 0.15, y + 0.05 + h / 2, z + t / 2); if (r() < 0.1) b.rotation.x = 0.25; add(b); z += t + 0.02; if (r() < 0.12) z += 0.4; } } }
  // floor lamp (front-left) + side table with table lamp (left of the couch)
  const shadeM = new THREE.MeshStandardMaterial({ color: '#e8d2a8', roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color('#ffb060'), emissiveIntensity: 0 });
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.9, 0.7) });
  { const fx = X0 + 1.4, fz = 3.8; add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 20), M.brass)).position.set(fx, 0.06, fz);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.4, 8), M.brass)).position.set(fx, 3.7, fz);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 1.3, 28, 1, true), shadeM); sh.position.set(fx, 7.7, fz); add(sh);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), bulbM)).position.set(fx, 7.5, fz); }
  const STX = CX - 5.6, STZ = -8.6;
  { add(rb(1.8, 2.3, 1.8, 0.06, M.mid, STX, 1.15, STZ), box(1.6, 0.04, 0.02, M.black, STX, 1.7, STZ + 0.91));
    const kn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), M.brass); kn.position.set(STX, 1.95, STZ + 0.92); add(kn);
    const lb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), new THREE.MeshPhysicalMaterial({ color: '#3f7f8f', roughness: 0.2, clearcoat: 0.7 })); lb.scale.y = 1.2; lb.position.set(STX, 2.85, STZ); add(lb);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), M.brass)).position.set(STX, 3.6, STZ);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 1.0, 28, 1, true), shadeM); sh.position.set(STX, 4.15, STZ); add(sh);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), bulbM)).position.set(STX, 3.95, STZ);
    const ph = frame(0.6, 0.8, (g, w, h) => { g.fillStyle = '#f6e3b0'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd332'; g.fillRect(70, 150, 120, 180); g.fillStyle = '#EFCFA8'; g.fillRect(95, 70, 70, 70); }, M.brass); ph.position.set(STX + 0.5, 2.75, STZ + 0.3); ph.rotation.set(-0.15, 0.3, 0); add(ph); }
  plant(X0 + 1.1, 0, Z0 + 1.1, 1.5, 3);
  plant(X0 + 1.2, 0, 10.8, 1.2, 8);
  // ceiling light
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 24), M.brass)).position.set(CX, RH - 0.06, -2);
  const domeM = new THREE.MeshStandardMaterial({ color: '#f4ead6', roughness: 0.3, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0, transparent: true, opacity: 0.95 });
  { const d = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), domeM); d.position.set(CX, RH - 0.12, -2); add(d); }
  // pictures on the back wall
  { const a = frame(1.8, 2.2, (g, w, h) => { g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, w, h); g.fillStyle = '#3d7a3a'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#c25a2a'; g.fillRect(60, 150, 90, 80); g.fillStyle = '#7a2a1a'; g.beginPath(); g.moveTo(48, 152); g.lineTo(105, 100); g.lineTo(162, 152); g.fill(); g.fillStyle = '#e8a33a'; g.beginPath(); g.arc(200, 60, 26, 0, 7); g.fill(); });
    a.position.set(-10.0, 7.2, Z0 + 0.08); add(a);
    const b = frame(1.4, 1.4, (g, w, h) => { g.fillStyle = '#2f4f9b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd332'; g.beginPath(); g.ellipse(128, 150, 70, 50, 0, 0, 7); g.fill(); g.beginPath(); g.arc(178, 92, 36, 0, 7); g.fill(); g.fillStyle = '#f28a1e'; g.beginPath(); g.moveTo(208, 92); g.lineTo(240, 100); g.lineTo(208, 108); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(186, 84, 6, 0, 7); g.fill(); }, col('#e9e3d6', 0.4));
    b.position.set(3.7, 6.6, Z0 + 0.08); add(b);
    const c = frame(1.0, 1.3, (g, w, h) => { g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8262c'; g.font = 'bold 70px "Marker Felt", "Comic Sans MS", sans-serif'; g.textAlign = 'center'; g.fillText('HOME', 128, 190); g.fillStyle = '#3c9a4a'; g.beginPath(); g.arc(128, 90, 40, 0, 7); g.fill(); }, M.dark);
    c.position.set(5.6, 8.3, Z0 + 0.08); add(c); }
  // toys + pouf on the rug
  { const toyC = ['#d23a2a', '#2f6fd1', '#e8b830', '#3c9a4a'];
    [[1.2, -0.6, 0.3], [1.9, -0.3, 1.1], [1.5, 0.3, 0.6]].forEach(([x, z, ry], i) => { const b = rb(0.55, 0.55, 0.55, 0.06, col(toyC[i], 0.5), x, 0.34, z); b.rotation.y = ry; add(b); });
    const pouf = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.3, 24), M.dogbed); pouf.position.set(-8.3, 0.7, -3.0); add(pouf); }

  // ---------------- dog bed + golden retriever (blocky) ----------------
  const DOG = { x: 6.35, z: -7.0 };
  { const bed = new THREE.Group(); bed.position.set(DOG.x, 0, DOG.z); add(bed);
    bed.add(rb(3.3, 0.45, 2.7, 0.2, M.dogbed, 0, 0.23, 0));
    const rimG = new THREE.TorusGeometry(1.0, 0.33, 12, 32); const rim = new THREE.Mesh(rimG, M.dogbed); rim.rotation.x = Math.PI / 2; rim.scale.set(1.45, 1.15, 1); rim.position.y = 0.5; bed.add(rim);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.3, 20), new THREE.MeshStandardMaterial({ color: '#b9bec4', roughness: 0.25, metalness: 0.9, envMap: envT })); bowl.position.set(DOG.x - 2.3, 0.15, DOG.z + 1.6); add(bowl);
    const bone = new THREE.Group(); bone.position.set(DOG.x + 0.9, 0.1, DOG.z + 1.9); bone.rotation.y = 0.6; add(bone); bone.add(rb(0.7, 0.14, 0.16, 0.06, col('#f1e6c8', 0.5), 0, 0.07, 0)); [-1, 1].forEach((s) => [-1, 1].forEach((t) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), col('#f1e6c8', 0.5)); k.position.set(s * 0.36, 0.08, t * 0.08); bone.add(k); })); }
  const dog = (function makeDog() {
    const g = new THREE.Group(); g.name = 'dog';
    const fur = RBX.plushMat('#eab060', '#ffe6b0', 17, 1), furD = RBX.plushMat('#cf8a3e', '#f6cc90', 18, 1), furL = RBX.plushMat('#f4d6a0', '#fff4dc', 19, 1);
    const faceC = cnv(256, 128), fg = faceC.getContext('2d'), faceT = tex(faceC);
    const faceM = new THREE.MeshStandardMaterial({ map: faceT, transparent: true, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2 });
    function setFace(n) { fg.clearRect(0, 0, 256, 128);
      if (n === 'closed') { fg.strokeStyle = '#1a120c'; fg.lineWidth = 7; fg.lineCap = 'round'; [70, 186].forEach((x) => { fg.beginPath(); fg.arc(x, 56, 18, 0.2, Math.PI - 0.2); fg.stroke(); }); }
      else if (n === 'happy') { fg.strokeStyle = '#1a120c'; fg.lineWidth = 8; fg.lineCap = 'round'; [70, 186].forEach((x) => { fg.beginPath(); fg.arc(x, 76, 20, Math.PI + 0.3, -0.3); fg.stroke(); }); }
      else { [70, 186].forEach((x) => { fg.fillStyle = '#1a120c'; fg.beginPath(); fg.ellipse(x, 64, 20, n === 'wide' ? 30 : 24, 0, 0, 7); fg.fill(); fg.fillStyle = '#ffffff'; fg.beginPath(); fg.arc(x + 7, 54, 7, 0, 7); fg.fill(); fg.beginPath(); fg.arc(x - 6, 74, 3, 0, 7); fg.fill(); });
        if (n === 'sad') { fg.strokeStyle = '#6a3a14'; fg.lineWidth = 6; fg.beginPath(); fg.moveTo(42, 28); fg.lineTo(90, 36); fg.moveTo(214, 28); fg.lineTo(166, 36); fg.stroke(); } }
      faceT.needsUpdate = true; }
    setFace('open');
    const body = rb(1.6, 1.15, 2.7, 0.35, fur, 0, 1.03, -0.15, 10); g.add(body);
    g.add(rb(1.1, 0.5, 1.5, 0.2, furL, 0, 0.72, 0.3));                                     // chest fluff
    const head = new THREE.Group(); head.position.set(0, 1.85, 1.35); g.add(head);
    head.add(rb(1.15, 1.0, 1.05, 0.3, fur, 0, 0, 0, 10));
    head.add(rb(0.64, 0.48, 0.9, 0.18, furL, 0, -0.26, 0.8));                              // snout
    const nose = rb(0.26, 0.17, 0.12, 0.06, new THREE.MeshPhysicalMaterial({ color: '#1a1210', roughness: 0.25, clearcoat: 1 }), 0, -0.08, 1.24); head.add(nose);
    const mouth = box(0.3, 0.03, 0.02, col('#3a1e10', 0.6), 0, -0.4, 1.255); head.add(mouth);
    const tongue = rb(0.24, 0.06, 0.3, 0.03, col('#e86a7a', 0.4), 0, -0.52, 1.12); tongue.rotation.x = 0.5; tongue.visible = false; head.add(tongue);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), faceM); face.position.set(0, 0.12, 0.528); head.add(face);
    [-1, 1].forEach((s) => { const e = rb(0.28, 0.85, 0.6, 0.12, furD, s * 0.66, -0.15, -0.05, 8); e.rotation.z = s * 0.12; head.add(e); });
    const brow = rb(0.9, 0.12, 0.08, 0.04, furD, 0, 0.42, 0.5); head.add(brow);
    // collar + tag
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.08, 8, 24), col('#c8262c', 0.5)); collar.position.set(0, 1.45, 0.95); collar.rotation.x = Math.PI / 2 - 0.5; g.add(collar);
    const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), M.brass); tag.rotation.x = Math.PI / 2 - 0.3; tag.position.set(0, 0.98, 1.38); g.add(tag);
    // front legs stretched forward (lying), back legs folded
    [-1, 1].forEach((s) => { g.add(rb(0.42, 0.38, 1.5, 0.15, fur, s * 0.42, 0.2, 1.4)); g.add(rb(0.46, 0.3, 0.5, 0.12, furL, s * 0.42, 0.16, 2.2));
      g.add(rb(0.55, 0.85, 1.25, 0.25, fur, s * 0.68, 0.62, -0.95)); g.add(rb(0.45, 0.28, 0.65, 0.12, furL, s * 0.62, 0.15, -0.35)); });
    // tail curled along the bed
    const tail = new THREE.Group(); tail.position.set(0.3, 0.7, -1.45); g.add(tail);
    for (let k = 0; k < 5; k++) { const seg = rb(0.34 - k * 0.03, 0.32 - k * 0.03, 0.45, 0.12, k > 2 ? furL : fur, 0.18 * k, -0.08 * k, -0.25 - 0.08 * k); seg.rotation.y = 0.35 * k; tail.add(seg); }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = m !== face; m.receiveShadow = true; } });
    g.userData = { head, body, tail, tongue, setFace(n) { setFace(n); tongue.visible = n === 'happy'; } };
    return g;
  })();
  dog.position.set(DOG.x, 0.38, DOG.z + 0.1); dog.rotation.y = -0.55; add(dog);

  // ---------------- staircase ----------------
  const stair = new THREE.Group(); add(stair);
  { const W = X1 - SX, RW = 2.3;
    for (let i = 0; i < NST; i++) { const T = tTop(i), zf = tFront(i);
      stair.add(box(W, T - 0.12, 1.0, M.trim, SCX, (T - 0.12) / 2, zf - 0.5));
      stair.add(box(W, 0.12, 1.12, M.dark, SCX, T - 0.06, zf - 0.44));
      stair.add(box(RW, 0.05, 1.04, M.runner, SCX, T + 0.025, zf - 0.48));
      stair.add(box(RW, RISE - 0.14, 0.05, M.runner, SCX, T - 0.12 - (RISE - 0.14) / 2, zf + 0.03));
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, RW + 0.2, 8), M.brass); rod.rotation.z = Math.PI / 2; rod.position.set(SCX, T + 0.07, zf - 0.95); stair.add(rod); }
    // landing
    stair.add(box(W, 0.4, 4.0, M.dark, SCX, LAND - 0.2, -10), box(W, LAND - 0.4, 4.0, M.shell, SCX, (LAND - 0.4) / 2, -10));
    stair.add(box(W, RISE - 0.14, 0.05, M.runner, SCX, LAND - 0.12 - (RISE - 0.14) / 2, -7.97), box(RW, 0.05, 4.0, wm(M.runner, [1, 4]), SCX, LAND + 0.025, -10));
    // side panel (stringer filled to the floor), living-room face
    const sh = new THREE.Shape(); [[4.25, 0], [4.25, RISE * 0.75 + 0.3], [-8, RISE * 13 + 0.3], [-12, RISE * 13 + 0.3], [-12, 0]].forEach(([u, v], k) => k ? sh.lineTo(u, v) : sh.moveTo(u, v)); sh.closePath();
    const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }), wm(M.wain, [1 / 2, 1 / 3.6])); panel.rotation.y = -Math.PI / 2; panel.position.set(SX, 0, 0); stair.add(panel);
    // stringer cap along the slope
    const len = Math.hypot(12.25, RISE * 12.25), cap = box(0.4, 0.2, len, M.trim, SX - 0.15, 0, 0); cap.position.set(SX - 0.15, (RISE * 0.75 + 0.3 + RISE * 13 + 0.3) / 2 + 0.1, (4.25 - 8) / 2); cap.rotation.x = Math.atan2(RISE * 12.25, 12.25); stair.add(cap);
    // newel post, balusters, handrail
    const NX = SX + 0.22; stair.add(box(0.5, 4.4, 0.5, M.dark, NX, 2.2, 4.35), box(0.62, 0.25, 0.62, M.dark, NX, 4.5, 4.35)); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), M.dark); ball.position.set(NX, 4.8, 4.35); stair.add(ball);
    for (let i = 0; i < NST; i++) [0.25, 0.7].forEach((d) => { const z = tFront(i) - d, y0 = tTop(i), y1 = railY(z); stair.add(box(0.11, y1 - y0, 0.11, M.trim, NX, (y0 + y1) / 2, z)); });
    const z1 = 4.1, z2 = -8.2, y1 = railY(z1), y2 = railY(z2), rl = Math.hypot(z1 - z2, y2 - y1), rail = new THREE.Mesh(RBX.rbox(0.24, 0.2, rl, 0.08, 6), M.dark);
    rail.position.set(NX, (y1 + y2) / 2 + 0.1, (z1 + z2) / 2); rail.rotation.x = Math.atan2(y2 - y1, z1 - z2); stair.add(rail);
    for (let z = -8.4; z > -10.2; z -= 0.45) stair.add(box(0.11, 3.0, 0.11, M.trim, NX, LAND + 1.5, z)); stair.add(box(0.24, 0.2, 2.2, M.dark, NX, LAND + 3.0, -9.3));
    // upper landing: hall door ajar + picture + night light
    stair.add(box(3.4, 8.0, 0.2, M.trim, SCX, LAND + 4.0, -11.85)); stair.add(box(2.6, 7.4, 0.12, M.hole, SCX, LAND + 3.7, -11.8));
    const ud = box(0.2, 7.3, 2.5, M.door, SCX - 1.2, LAND + 3.65, -10.6); ud.rotation.y = 0.35; stair.add(ud);
    // pictures stepping up the stairwell wall
    [[2.5, 4.2, 'sun'], [-0.8, 6.8, 'dog'], [-5.5, 10.4, 'sea'], [1.8, 15.4, 'kid']].forEach(([z, y, k], i) => {
      const f = frame(1.3, 1.6, (g, w, h) => { const bgc = { sun: '#f4c27a', dog: '#9fc4e8', sea: '#7ab8d8', kid: '#f4dcdc' }[k]; g.fillStyle = bgc; g.fillRect(0, 0, w, h);
        if (k === 'sun') { g.fillStyle = '#e86a3a'; g.beginPath(); g.arc(128, 120, 50, 0, 7); g.fill(); }
        if (k === 'dog') { g.fillStyle = '#d8994a'; g.fillRect(70, 130, 120, 90); g.fillRect(150, 90, 70, 70); g.fillStyle = '#b87632'; g.fillRect(146, 100, 18, 50); }
        if (k === 'sea') { g.fillStyle = '#2f4f9b'; g.fillRect(0, h * 0.6, w, h * 0.4); g.fillStyle = '#fff'; g.fillRect(110, 120, 8, 60); g.beginPath(); g.moveTo(118, 120); g.lineTo(160, 170); g.lineTo(118, 170); g.fill(); }
        if (k === 'kid') { g.fillStyle = '#ffd332'; g.fillRect(90, 160, 76, 100); g.fillStyle = '#EFCFA8'; g.fillRect(100, 96, 56, 56); } }, i % 2 ? M.dark : col('#d9b45a', 0.3));
      f.rotation.y = -Math.PI / 2; f.position.set(X1 - 0.07, y + 1.2, z); stair.add(f); });
  }

  // ---------------- wet sock footprints (stairs + hall floor) ----------------
  const fpTex = (() => { const c = cnv(128, 256), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 128, 256);
    g.filter = 'blur(3px)'; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(64, 66, 44, 56, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(64, 192, 34, 46, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(24, 80); g.quadraticCurveTo(40, 140, 34, 190); g.lineTo(94, 190); g.quadraticCurveTo(92, 140, 106, 80); g.fill(); g.filter = 'none';
    g.globalCompositeOperation = 'multiply'; for (let y = 20; y < 240; y += 9) { g.fillStyle = 'rgba(150,150,150,1)'; g.fillRect(0, y, 128, 3); } g.globalCompositeOperation = 'source-over';
    const r = rng(6); for (let i = 0; i < 14; i++) { const a = r() * 7, d = 60 + r() * 10; g.fillStyle = '#fff'; g.beginPath(); g.arc(64 + Math.cos(a) * d * 0.8, 128 + Math.sin(a) * d * 1.6, 2 + r() * 4, 0, 7); g.fill(); }
    const t = tex(c, {}); return t; })();
  const fpEnv = (() => { const c = cnv(256, 128), g = c.getContext('2d'); g.fillStyle = '#05070e'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#8fa8e0'; g.fillRect(180, 30, 14, 20); const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t; })();
  const fpM = new THREE.MeshPhysicalMaterial({ color: '#0b0d12', roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, alphaMap: fpTex, transparent: true, opacity: 0.92, depthWrite: false, envMap: fpEnv, envMapIntensity: 1.0, polygonOffset: true, polygonOffsetFactor: -4 });
  const footprints = new THREE.Group(); add(footprints);
  const fpGeo = new THREE.PlaneGeometry(0.62, 1.0); fpGeo.rotateX(-Math.PI / 2);
  const fp = (x, y, z, ry, s = 1) => { const m = new THREE.Mesh(fpGeo, fpM); m.position.set(x, y, z); m.rotation.y = ry; m.scale.setScalar(s); m.renderOrder = 2; footprints.add(m); };
  [13.6, 12.4, 11.2, 10.0, 8.8, 7.6, 6.4, 5.2].forEach((z, k) => fp(SCX + (k % 2 ? 0.42 : -0.42) - 0.1 * Math.sin(k), 0.012, z, Math.PI + 0.05 * (k % 2 ? -1 : 1)));
  for (let i = 0; i < NST; i++) fp(SCX + (i % 2 ? -0.42 : 0.42), tTop(i) + 0.075, tFront(i) - 0.5, Math.PI + (i % 2 ? 0.06 : -0.06), 0.95);
  [-8.6, -9.6, -10.6].forEach((z, k) => fp(SCX + (k % 2 ? -0.42 : 0.42), LAND + 0.075, z, Math.PI));
  // drips between steps
  const dripM = new THREE.MeshPhysicalMaterial({ color: '#0b0d12', roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.85, envMap: fpEnv });
  { const r = rng(91), dg = new THREE.SphereGeometry(0.05, 8, 6); for (let i = 0; i < NST; i++) for (let k = 0; k < 3; k++) { const d = new THREE.Mesh(dg, dripM); d.scale.y = 0.3; d.position.set(SCX + (r() - 0.5) * 1.6, tTop(i) + 0.07, tFront(i) - r() * 0.9); footprints.add(d); } }
  footprints.visible = false;

  // ---------------- front door + coat rack ----------------
  { const cz = (DOOR.z0 + DOOR.z1) / 2, w = DOOR.z1 - DOOR.z0;
    add(box(0.25, DOOR.y1 - 0.1, w - 0.1, M.door, X1 + 0.3, (DOOR.y1 - 0.1) / 2 + 0.05, cz));
    add(box(0.25, 0.35, w + 0.8, M.trim, X1 - 0.08, DOOR.y1 + 0.17, cz), box(0.25, DOOR.y1, 0.4, M.trim, X1 - 0.08, DOOR.y1 / 2, DOOR.z0 - 0.2), box(0.25, DOOR.y1, 0.4, M.trim, X1 - 0.08, DOOR.y1 / 2, DOOR.z1 + 0.2));
    add(box(0.9, 0.08, w, M.dark, X1 + 0.1, 0.04, cz));
    const kn = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), M.brass); kn.position.set(X1 + 0.08, 3.6, DOOR.z1 - 0.5); add(kn);
    add(box(0.1, 0.5, 0.25, M.brass, X1 + 0.15, 4.4, DOOR.z1 - 0.5));
    const matT = KIT.textTex(256, 160, (g, W2, H2) => { g.fillStyle = '#8a5a2c'; g.fillRect(0, 0, W2, H2); for (let y = 0; y < H2; y += 4) { g.fillStyle = y % 8 ? 'rgba(0,0,0,0.12)' : 'rgba(255,220,160,0.1)'; g.fillRect(0, y, W2, 2); } g.fillStyle = '#2a1a0c'; g.font = 'bold 64px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('HOME', 128, 104); g.strokeStyle = '#2a1a0c'; g.lineWidth = 6; g.strokeRect(10, 10, 236, 140); });
    const mat = new THREE.Mesh(RBX.rbox(3.0, 0.05, 1.9, 0.02), pbr(matT.image, null, { rough: 1 })); mat.rotation.y = Math.PI / 2; mat.position.set(X1 - 1.4, 0.025, cz); add(mat);
    // coat rack
    const RZ = 13.6; add(box(0.15, 0.5, 3.6, M.dark, X1 - 0.08, 6.6, RZ));
    const coats = [['#2f4f9b', 0], ['#c8262c', 1], ['#F28A1E', 2], ['#3c9a4a', 3]];
    coats.forEach(([c, k]) => { const z = RZ - 1.35 + k * 0.9; const hk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), M.brass); hk.rotation.z = Math.PI / 2 - 0.4; hk.position.set(X1 - 0.3, 6.65, z); add(hk);
      if (k < 3) { const cm = pbr(RBX.fleece(256, 256, c, 30 + k).c, RBX.fleece(256, 256, c, 30 + k).h, { rough: 0.9, bump: 2 }); const coat = rb(0.6, 3.2 - k * 0.5, 0.85, 0.25, cm, X1 - 0.45, 6.5 - (3.2 - k * 0.5) / 2, z); coat.rotation.z = 0.04; add(coat); add(rb(0.65, 0.5, 0.9, 0.2, cm, X1 - 0.45, 6.35, z)); }
      else { const scarf = rb(0.2, 2.6, 0.5, 0.08, M.throw, X1 - 0.35, 5.35, z); add(scarf); } });
    // bench + boots + umbrella
    add(rb(1.4, 0.25, 3.2, 0.05, M.mid, X1 - 0.8, 2.0, RZ), box(1.2, 1.9, 0.2, M.mid, X1 - 0.8, 0.95, RZ - 1.4), box(1.2, 1.9, 0.2, M.mid, X1 - 0.8, 0.95, RZ + 1.4));
    [[RZ - 0.8, '#3a2414'], [RZ - 0.3, '#3a2414'], [RZ + 0.5, '#e8b830'], [RZ + 1.0, '#e8b830']].forEach(([z, c]) => { add(rb(0.9, 0.9, 0.4, 0.12, col(c, 0.4), X1 - 1.0, 0.45, z)); add(rb(0.45, 0.3, 0.4, 0.1, col(c, 0.4), X1 - 1.35, 0.15, z)); });
    const um = new THREE.Mesh(new THREE.ConeGeometry(0.28, 3.0, 8), col('#1f3a68', 0.5)); um.position.set(X1 - 0.6, 1.6, RZ + 2.3); um.rotation.z = 0.1; add(um); }

  // ---------------- 40 new sock packs (toggle) ----------------
  const sockPacks = new THREE.Group(); sockPacks.visible = false; add(sockPacks);
  { const kinds = ['duck', 'dots', 'stripe', 'knit', 'argyle', 'star'], packG = RBX.rbox(0.85, 0.14, 1.45, 0.04, 6);
    const topM = {}; kinds.forEach((k) => { const sm = SOCKS.mat(k), c = cnv(128, 256), g = c.getContext('2d'); g.drawImage(sm.map.image, 0, 0, 128, 256);
      g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, 128, 70); g.fillStyle = '#c8262c'; g.fillRect(0, 56, 128, 10); g.fillStyle = '#1f2f5e'; g.font = 'bold 30px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('SOCKS', 64, 34); g.font = 'bold 16px sans-serif'; g.fillText('3 PAIRS', 64, 52);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo(10, 80); g.lineTo(40, 80); g.lineTo(18, 250); g.lineTo(0, 250); g.fill();
      topM[k] = new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15 }); });
    const r = rng(404); let n = 0;
    const stack = (x, y0, z, cnt, ry0) => { for (let k = 0; k < cnt; k++) { const kind = kinds[Math.floor(r() * kinds.length)], sm = SOCKS.mat(kind), mats = [sm, sm, topM[kind], sm, sm, sm];
      const m = new THREE.Mesh(packG, mats); m.position.set(x + (r() - 0.5) * 0.12, y0 + 0.07 + k * 0.145, z + (r() - 0.5) * 0.12); m.rotation.y = ry0 + (r() - 0.5) * 0.4; m.castShadow = m.receiveShadow = true; sockPacks.add(m); n++; } };
    stack(TB.x - 1.6, 1.875, TB.z - 0.35, 6, 0.1); stack(TB.x - 0.6, 1.875, TB.z + 0.3, 7, -0.3); stack(TB.x + 0.5, 1.875, TB.z - 0.4, 6, 0.5); stack(TB.x + 1.6, 1.875, TB.z + 0.25, 5, -0.2);
    stack(TB.x + 3.2, 0, TB.z + 0.4, 6, 0.2); stack(TB.x + 3.3, 0, TB.z - 1.0, 4, 0.9); stack(TB.x - 3.2, 0, TB.z + 0.8, 5, -0.5);
    sockPacks.userData.count = n; }

  // ---------------- lights ----------------
  shadow(room);
  room.traverse((m) => { if (m.isMesh && m.material && (m.material.isMeshBasicMaterial || m.material.transparent)) { m.castShadow = false; m.receiveShadow = m.material === fpM; } });
  [shadeM].forEach(() => room.traverse((m) => { if (m.material === shadeM || m.material === domeM) m.castShadow = false; }));
  const hemi = new THREE.HemisphereLight('#cfe0ff', '#8a6a4a', 2.4); scene.add(hemi);
  const sunDir = V(-0.42, -0.62, 0.66).normalize();
  const sun = new THREE.DirectionalLight('#ffe2b0', 10); sun.position.copy(V(0, 4, -2).addScaledVector(sunDir, -40)); sun.target.position.set(0, 4, -2);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 90 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const tableL = new THREE.PointLight('#ffae55', 0, 0, 2); tableL.position.set(STX, 3.9, STZ); tableL.castShadow = true; tableL.shadow.mapSize.set(1024, 1024); tableL.shadow.bias = -0.002; tableL.shadow.radius = 4; scene.add(tableL);
  const floorL = new THREE.PointLight('#ffb060', 0, 0, 2); floorL.position.set(X0 + 1.4, 7.4, 3.8); scene.add(floorL);
  const ceilL = new THREE.PointLight('#ffd9a0', 0, 0, 2); ceilL.position.set(CX, RH - 1.2, -2); scene.add(ceilL);
  const fill = new THREE.PointLight('#ffffff', 0, 0, 2); fill.position.set(0, 8, 8); scene.add(fill);
  const stairFill = new THREE.PointLight('#5068c8', 0, 0, 2); stairFill.position.set(SCX, 14, 0); scene.add(stairFill);
  const moonSpot = new THREE.SpotLight('#a8c0ff', 0, 0, 0.55, 0.7, 2); moonSpot.position.set(X1 + 1.5, (SWIN.y0 + SWIN.y1) / 2, (SWIN.z0 + SWIN.z1) / 2); moonSpot.target.position.set(SCX - 0.3, 4.5, 0.5); scene.add(moonSpot, moonSpot.target);
  const ventGlow = new THREE.PointLight('#5068c8', 0, 6, 2); ventGlow.position.set(VCX, 0.8, Z0 + 1.0); scene.add(ventGlow);
  const bmat = RBX.beamMat('#ffe0b0', 0.05), beams = new THREE.Group(); scene.add(beams);
  beams.add(RBX.beam(V((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, Z0 - 0.2), sunDir, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 12, bmat));
  beams.add(RBX.beam(V(X1 - 0.2, (SWIN.y0 + SWIN.y1) / 2, (SWIN.z0 + SWIN.z1) / 2), sunDir, SWIN.z1 - SWIN.z0, SWIN.y1 - SWIN.y0, 9, bmat));
  beams.children.forEach((b) => { b.renderOrder = 10; });
  // dust motes
  (function dust() { const r = rng(5), N = 260, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = V(WIN.x0 + r() * (WIN.x1 - WIN.x0), WIN.y0 + r() * (WIN.y1 - WIN.y0), Z0 + 0.4).addScaledVector(sunDir, r() * 10); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    beams.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.03, map: tex(c), color: new THREE.Color(2.0, 1.8, 1.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }))); })();

  function lamps(on) { const k = on ? 1 : 0; tableL.intensity = 70 * k; floorL.intensity = 60 * k; ceilL.intensity = 35 * k; shadeM.emissiveIntensity = 1.6 * k; domeM.emissiveIntensity = 1.4 * k; bulbM.color.setRGB(on ? 8 : 1, on ? 5.5 : 0.95, on ? 2.6 : 0.85); }
  function setFootprints(on) { footprints.visible = !!on; }
  function setPacks(on) { sockPacks.visible = !!on; }
  function mood(name) {
    setPacks(name === 'packs'); setFootprints(name === 'midnight'); if (name === 'midnight') name = 'night';
    if (name === 'day' || name === 'packs') { skyM.map = SKY.day; skyM.color.setScalar(1.1); hemi.color.set('#cfe0ff'); hemi.groundColor.set('#8a6a4a'); hemi.intensity = 2.4; sun.color.set('#ffe2b0'); sun.intensity = 10; lamps(false); fill.color.set('#fff2e0'); fill.intensity = 30; stairFill.intensity = 0; moonSpot.intensity = 0; ventGlow.intensity = 0;
      bmat.uniforms.col.value.set('#ffe0b0'); bmat.uniforms.k.value = 0.05; beams.visible = true; fpM.envMapIntensity = 0.8; }
    if (name === 'evening') { skyM.map = SKY.evening; skyM.color.setScalar(0.8); hemi.color.set('#6a6fb0'); hemi.groundColor.set('#3a2418'); hemi.intensity = 0.9; sun.color.set('#ff9a5a'); sun.intensity = 2.5; lamps(true); fill.color.set('#ffb070'); fill.intensity = 8; stairFill.intensity = 0; moonSpot.intensity = 0; ventGlow.intensity = 0; beams.visible = false; fpM.envMapIntensity = 0.8; }
    if (name === 'night') { skyM.map = SKY.night; skyM.color.setScalar(1); hemi.color.set('#3a52c0'); hemi.groundColor.set('#2a1a20'); hemi.intensity = 2.2; sun.color.set('#9ab4ff'); sun.intensity = 16; lamps(false); fill.color.set('#5068c8'); fill.intensity = 22; stairFill.intensity = 30; moonSpot.intensity = 900; ventGlow.intensity = 0;
      bmat.uniforms.col.value.set('#8fb0ff'); bmat.uniforms.k.value = 0.035; beams.visible = true; fpM.envMapIntensity = 1.0; }
    skyM.needsUpdate = true;
  }
  mood('day');

  return {
    scene, grade: 'day',
    marks: {
      p_couch_sit: { p: [CX + 2.55, 0.1, CZ + 0.55], ry: 0, sit: true },     // Pip seated / lying on the right seat (seat top ≈ 2.15)
      p_couch_floor: { p: [CX, 0, -5.3], ry: Math.PI },                       // kneeling/standing in front of the couch, facing it
      p_hero_floor: { p: [0.6, 0, -2.4], ry: 2.76 },                           // hero on the rug watching the vent
      p_mom: { p: [TB.x + 3.0, 0, TB.z + 1.9], ry: -0.5 },                    // Mom next to the coffee table with the sock packs
      p_stairs_bottom: { p: [SCX + 0.9, 0, 5.6], ry: Math.PI },                     // at the foot of the stairs looking up
      p_door: { p: [X1 - 2.2, 0, 9.0], ry: -Math.PI / 2 },
      m_vent: { p: [VCX, 0, Z0 + 0.05] }, m_vent_mouth: { p: [VCX, (VENT.y0 + VENT.y1) / 2, Z0 + 0.1] },
      m_sock_start: { p: [CX + 2.4, 0.06, -6.2] },                            // where the sock drops off the couch onto the rug
      m_dog: { p: [DOG.x, 0.38, DOG.z + 0.1], ry: -0.55 }, m_dog_head: { p: [DOG.x + 0.97, 2.23, DOG.z + 1.4] },
      m_couch: { p: [CX, 0, CZ] }, m_under_couch: { p: [CX, 0.3, CZ] },
      m_stairs_bottom: { p: [SCX, 0, 4.4] }, m_stairs_top: { p: [SCX, LAND, -9.0] },
      m_table: { p: [TB.x, 1.875, TB.z] }, m_tv: { p: [X0 + 0.96, 5.0, TVZ] },
    },
    props: { moonSpot, couch, vent, ventGrille: grille, dog, footprints, setFootprints, sockPacks, setPacks, lamps, tableLamp: tableL, sun, sky, skyMat: SKY, beams, stair, SX, LAND, tTop, tFront },
    mood,
    views: {
      wide: { p: [3.0, 7.5, 16.5], l: [-2.0, 3.6, -6.0], fov: 62, mood: 'day' },
      under: { p: [CX + 0.6, 0.22, -5.9], l: [CX - 0.4, 0.32, -9.8], fov: 50, mood: 'day' },
      dog: { p: [3.3, 3.3, -0.9], l: [DOG.x + 0.4, 1.3, DOG.z], fov: 46, mood: 'evening' },
      vent: { p: [0.3, 0.35, -4.4], l: [VCX, 0.7, Z0], fov: 56, mood: 'night', grade: 'night' },
      pip_couch: { p: [CX + 1.2, 5.2, 0.2], l: [CX + 2.4, 2.6, CZ], fov: 50, mood: 'night', grade: 'night' },
      stairs_low: { p: [SCX - 0.5, 4.4, 7.8], l: [SCX, 5.8, -4.0], fov: 62, mood: 'midnight', grade: 'night' },
      stairs_top: { p: [SCX + 0.2, 17.5, -6.5], l: [SCX, 4.0, 1.5], fov: 58, mood: 'midnight', grade: 'night' },
      mom_packs: { p: [5.5, 5.4, 6.4], l: [TB.x + 0.8, 2.4, TB.z - 0.6], fov: 52, mood: 'packs' },
      door: { p: [3.0, 5.2, 15.5], l: [X1 - 1, 4.0, 9.5], fov: 55, mood: 'evening', grade: 'sunset' },
    },
  };
};

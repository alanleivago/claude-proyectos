// rbx-sock laundry room (basement): front-loading DRYER (glass porthole, perforated drum, console knob + display, glows orange),
// WASHER, laundry CHUTE outlet from the ceiling (hinged flap) over a basket of socks, round FLOOR DRAIN, shelves with detergent,
// drying line with odd socks, exposed pipes, bare bulb + pull chain, high window, water heater, utility sink, wooden stairs.
'use strict';
SETS.laundry = async function (ctx) {
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const { V, shadow, texPair, noiseOver, box, rb, wm } = KIT;
  const RX = 8, RZ = 6, RH = 11;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#020309');
  const add = (...o) => { o.forEach((k) => scene.add(k)); return o[0]; };
  const rr = rng(101);

  // ---------------- env map for chrome / glass ----------------
  let envMap = null;
  if (ctx && ctx.renderer) {
    const pm = new THREE.PMREMGenerator(ctx.renderer), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: '#25272b', side: THREE.BackSide })));
    [[0, 8, 0, '#fff0d0', 5], [-8, 3, -4, '#9ab4ff', 2.5], [8, 2, 5, '#ffb070', 2], [3, 1, -8, '#ffffff', 1.5]].forEach(([x, y, z, c, k]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
    envMap = pm.fromScene(es, 0.03).texture;
  }
  const envMats = [];
  const envd = (m, k = 0.8) => { if (envMap) { m.envMap = envMap; m.envMapIntensity = k; m.userData.envK = k; envMats.push(m); } return m; };

  // ---------------- textures ----------------
  // painted cinder block: tile = 2.6 units (2 blocks x 4 courses)
  const blockT = texPair(512, (g, hg, S) => {
    const r = rng(11), rows = 4, cols = 2, bh = S / rows, bw = S / cols, mo = 8;
    g.fillStyle = '#8f9488'; g.fillRect(0, 0, S, S); hg.fillStyle = '#2a2a2a'; hg.fillRect(0, 0, S, S);
    for (let row = 0; row < rows; row++) for (let k = -1; k <= cols; k++) {
      const x = k * bw + (row % 2 ? bw / 2 : 0), y = row * bh, t = 0.93 + r() * 0.1;
      g.fillStyle = `rgb(${186 * t | 0},${192 * t | 0},${176 * t | 0})`; g.fillRect(x + mo / 2, y + mo / 2, bw - mo, bh - mo);
      g.fillStyle = 'rgba(255,255,245,0.12)'; g.fillRect(x + mo / 2, y + mo / 2, bw - mo, 4);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + mo / 2, y + bh - mo / 2 - 4, bw - mo, 4);
      const hgr = hg.createLinearGradient(0, y, 0, y + bh); hgr.addColorStop(0, '#9a9a9a'); hgr.addColorStop(0.08, '#bdbdbd'); hgr.addColorStop(0.92, '#b8b8b8'); hgr.addColorStop(1, '#8a8a8a');
      hg.fillStyle = hgr; hg.fillRect(x + mo / 2, y + mo / 2, bw - mo, bh - mo);
    }
    noiseOver(g, S, S, 13, 0.22, 8, 4); noiseOver(g, S, S, 14, 0.12, 64, 2);
    // pits in the block face
    for (let i = 0; i < 900; i++) { const x = r() * S, y = r() * S, s = 0.8 + r() * 2.2; g.fillStyle = 'rgba(70,72,64,0.5)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); hg.fillStyle = '#505050'; hg.beginPath(); hg.arc(x, y, s, 0, 7); hg.fill(); }
    // peeling paint patches (grey concrete under)
    for (let i = 0; i < 5; i++) { const x = r() * S, y = r() * S; g.fillStyle = '#6f6e66'; hg.fillStyle = '#7a7a7a'; g.beginPath(); hg.beginPath();
      for (let a = 0; a < 12; a++) { const ang = (a / 12) * Math.PI * 2, rad = 6 + r() * 16; g.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad * 0.7); hg.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad * 0.7); }
      g.fill(); hg.fill(); g.strokeStyle = 'rgba(235,235,220,0.6)'; g.lineWidth = 1.5; g.stroke(); }
    // water streaks
    for (let i = 0; i < 7; i++) { const x = r() * S, w = 3 + r() * 8, gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, 'rgba(90,80,50,0)'); gr.addColorStop(0.5, 'rgba(90,80,50,0.18)'); gr.addColorStop(1, 'rgba(90,80,50,0.05)'); g.fillStyle = gr; g.fillRect(x, 0, w, S); }
  });
  // concrete floor: tile = 8 units, slab joints, cracks, stains, aggregate
  const floorT = texPair(1024, (g, hg, S) => {
    const r = rng(23), n1 = fbm(24, 4, 5), n2 = fbm(25, 16, 3), im = g.createImageData(S, S), d = im.data, hm = hg.createImageData(S, S), h = hm.data;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S, a = n1(u, v), b = n2(u, v), k = 0.78 + a * 0.32 + (b - 0.5) * 0.12, i = (y * S + x) * 4;
      d[i] = 128 * k; d[i + 1] = 124 * k; d[i + 2] = 116 * k; d[i + 3] = 255; h[i] = h[i + 1] = h[i + 2] = 120 + b * 40; h[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0);
    for (let i = 0; i < 6000; i++) { const x = r() * S, y = r() * S, c = r() < 0.5 ? 'rgba(40,38,34,0.45)' : 'rgba(200,196,186,0.35)'; g.fillStyle = c; g.fillRect(x, y, 1.5 + r() * 2, 1.5 + r() * 2); }
    // stains (oil, rust, water rings)
    for (let i = 0; i < 14; i++) { const x = r() * S, y = r() * S, s = 30 + r() * 120, gr = g.createRadialGradient(x, y, 0, x, y, s); const c = r() < 0.4 ? '60,40,20' : r() < 0.5 ? '35,32,30' : '110,70,35';
      gr.addColorStop(0, `rgba(${c},${0.18 + r() * 0.2})`); gr.addColorStop(0.8, `rgba(${c},${0.12 + r() * 0.1})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); }
    for (let i = 0; i < 4; i++) { const x = r() * S, y = r() * S, s = 25 + r() * 40; g.strokeStyle = 'rgba(70,55,35,0.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, s, s * (0.8 + r() * 0.3), r() * 3, 0, 7); g.stroke(); }
    // cracks
    for (let i = 0; i < 7; i++) { let x = r() * S, y = r() * S, a = r() * 7; const L = 30 + r() * 60; g.strokeStyle = 'rgba(25,22,20,0.85)'; hg.strokeStyle = '#000'; g.lineWidth = 1.2 + r() * 1.5; hg.lineWidth = 3; g.beginPath(); hg.beginPath(); g.moveTo(x, y); hg.moveTo(x, y);
      for (let k = 0; k < L; k++) { a += (r() - 0.5) * 0.8; x += Math.cos(a) * 5; y += Math.sin(a) * 5; g.lineTo(x, y); hg.lineTo(x, y); } g.stroke(); hg.stroke(); }
    // slab joints at the tile edges
    g.fillStyle = 'rgba(30,28,25,0.9)'; g.fillRect(0, 0, S, 5); g.fillRect(0, 0, 5, S); hg.fillStyle = '#000'; hg.fillRect(0, 0, S, 7); hg.fillRect(0, 0, 7, S);
  });
  const enamelT = texPair(256, (g, hg, S) => {
    g.fillStyle = '#ebe7dc'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 31, 0.08, 8, 3);
    const r = rng(32); for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(120,115,100,${0.15 + r() * 0.2})`; g.lineWidth = 0.8; const x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 10); g.stroke(); }
    for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(140,80,30,${0.2 + r() * 0.3})`; g.beginPath(); g.arc(r() * S, r() * S, 1 + r() * 2.5, 0, 7); g.fill(); }
  });
  const perfT = texPair(256, (g, hg, S) => {
    g.fillStyle = '#a9adb0'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y++) { g.fillStyle = `rgba(${y % 3 ? 255 : 0},${y % 3 ? 255 : 0},${y % 3 ? 255 : 0},0.04)`; g.fillRect(0, y, S, 1); }
    noiseOver(g, S, S, 41, 0.15, 4, 3);
    const n = 6, c = S / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5 + (j % 2) * 0.5) * c, y = (j + 0.5) * c;
      [-S, 0, S].forEach((o) => { g.fillStyle = '#1b1c1e'; g.beginPath(); g.arc(x + o, y, 5, 0, 7); g.fill(); hg.fillStyle = '#000'; hg.beginPath(); hg.arc(x + o, y, 7, 0, 7); hg.fill(); hg.fillStyle = '#d0d0d0'; hg.beginPath(); hg.arc(x + o, y, 10, 0, 7); hg.lineWidth = 2; hg.strokeStyle = '#c0c0c0'; hg.stroke(); }); }
  });
  const galvT = texPair(512, (g, hg, S) => {   // galvanized spangle + seams + rivets
    g.fillStyle = '#9ea3a6'; g.fillRect(0, 0, S, S); const r = rng(51);
    for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, s = 10 + r() * 30, t = 0.85 + r() * 0.3; g.fillStyle = `rgba(${150 * t | 0},${156 * t | 0},${160 * t | 0},0.55)`; g.beginPath();
      for (let a = 0; a < 6; a++) { const ang = a + r() * 0.8; g.lineTo(x + Math.cos(ang) * s, y + Math.sin(ang) * s); } g.fill(); }
    noiseOver(g, S, S, 52, 0.25, 8, 4);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(230,235,240,${0.2 + r() * 0.3})`; g.lineWidth = 0.8; const x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 30); g.stroke(); }
    g.fillStyle = 'rgba(40,40,40,0.7)'; g.fillRect(0, S / 2 - 3, S, 6); hg.fillStyle = '#000'; hg.fillRect(0, S / 2 - 4, S, 8); hg.fillStyle = '#b0b0b0'; hg.fillRect(0, S / 2 + 4, S, 14);
    for (let x = 16; x < S; x += 42) { g.fillStyle = '#7a7e80'; g.beginPath(); g.arc(x, S / 2 + 14, 5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x - 1.5, S / 2 + 12.5, 2, 0, 7); g.fill(); hg.fillStyle = '#fff'; hg.beginPath(); hg.arc(x, S / 2 + 14, 6, 0, 7); hg.fill(); }
    for (let i = 0; i < 6; i++) { const x = r() * S, y = r() * S, gr = g.createLinearGradient(0, y, 0, y + 120); gr.addColorStop(0, 'rgba(110,70,30,0.35)'); gr.addColorStop(1, 'rgba(110,70,30,0)'); g.fillStyle = gr; g.fillRect(x, y, 4 + r() * 6, 120); }
  });
  const woodT = KIT.woodPlanks(512, 61, { rows: 3, tones: ['#8a6a44', '#7a5a38', '#93714a'], knots: 6 });
  const darkWoodT = KIT.woodPlanks(512, 62, { rows: 4, tones: ['#4a3626', '#3f2e20', '#54402c'], knots: 8 });
  const subfloorT = KIT.woodPlanks(512, 63, { rows: 6, tones: ['#6a5238', '#5c4630', '#735a3e', '#614b33'] });

  const M = {
    wall: pbr(blockT.c, blockT.h, { rough: 0.92, bump: 3, repeat: [1 / 2.6, 1 / 2.6] }),
    floor: pbr(floorT.c, floorT.h, { rough: 0.75, bump: 2.5, repeat: [1 / 8, 1 / 8] }),
    enamel: pbr(enamelT.c, enamelT.h, { rough: 0.32, bump: 0.6 }),
    wood: pbr(woodT.c, woodT.h, { rough: 0.7, bump: 3 }),
    dark: pbr(darkWoodT.c, darkWoodT.h, { rough: 0.75, bump: 3 }),
    sub: pbr(subfloorT.c, subfloorT.h, { rough: 0.85, bump: 3, repeat: [1 / 5, 1 / 5] }),
    galv: pbr(galvT.c, galvT.h, { rough: 0.42, bump: 2 }),
    chrome: envd(new THREE.MeshStandardMaterial({ color: '#d8dadc', roughness: 0.18, metalness: 1 }), 1.0),
    steel: envd(new THREE.MeshStandardMaterial({ color: '#8a8e92', roughness: 0.4, metalness: 0.9 }), 0.6),
    iron: new THREE.MeshStandardMaterial({ color: '#2a2726', roughness: 0.6, metalness: 0.7 }),
    copper: envd(new THREE.MeshStandardMaterial({ color: '#c0703c', roughness: 0.35, metalness: 1 }), 0.6),
    black: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#2a2c2e', roughness: 0.85, side: THREE.DoubleSide }),
    pvc: new THREE.MeshStandardMaterial({ color: '#d8d8d2', roughness: 0.5 }),
    ceil: new THREE.MeshStandardMaterial({ color: '#15131a', roughness: 1 }),
    void: new THREE.MeshBasicMaterial({ color: '#010101' }),
  };
  M.galv.metalness = 0.45; M.galv.roughness = 0.45; envd(M.galv, 0.5);
  const enam = (rep) => envd(wm(M.enamel, rep), 0.35);

  // ---------------- room shell ----------------
  const WIN = { x0: -6.0, x1: -2.6, y0: 8.0, y1: 10.4 };
  {
    const sh = new THREE.Shape(); sh.moveTo(-RX - 0.5, 0); sh.lineTo(RX + 0.5, 0); sh.lineTo(RX + 0.5, RH + 0.5); sh.lineTo(-RX - 0.5, RH + 0.5); sh.closePath();
    const hole = new THREE.Path(); hole.moveTo(WIN.x0, WIN.y0); hole.lineTo(WIN.x0, WIN.y1); hole.lineTo(WIN.x1, WIN.y1); hole.lineTo(WIN.x1, WIN.y0); hole.closePath(); sh.holes.push(hole);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: false }), M.wall); back.position.z = -RZ - 0.35; add(back);
    const wallM = wm(M.wall, [1 / 2.6, 1 / 2.6]);
    add(box(0.7, RH + 0.5, 2 * RZ + 1.4, wallM, -RX - 0.35, (RH + 0.5) / 2, 0, true), box(0.7, RH + 0.5, 2 * RZ + 1.4, wallM, RX + 0.35, (RH + 0.5) / 2, 0, true));
    add(box(2 * RX + 1.4, RH + 0.5, 0.7, wallM, 0, (RH + 0.5) / 2, RZ + 0.35, true));
    // floor with the drain hole (ShapeGeometry UVs = world units)
    const fs = new THREE.Shape(); fs.moveTo(-RX, -RZ); fs.lineTo(RX, -RZ); fs.lineTo(RX, RZ); fs.lineTo(-RX, RZ); fs.closePath();
    const dh = new THREE.Path(); dh.absarc(0, -0.5, 0.78, 0, Math.PI * 2, true); fs.holes.push(dh);
    const fl = new THREE.Mesh(new THREE.ShapeGeometry(fs, 48), M.floor); fl.rotation.x = -Math.PI / 2; add(fl);
    // ceiling: subfloor + joists, stairwell opening (x -4.6..2.2, z 3.2..6)
    const sub = (w, d, x, z) => add(box(w, 0.3, d, wm(M.sub, [1 / 5, 1 / 5]), x, RH + 0.15, z, true));
    sub(2 * RX, 2 * RZ - 2.8, 0, -1.4); sub(RX - 2.2, 2.8, (RX + 2.2) / 2, RZ - 1.4); sub(RX - 4.6, 2.8, (-RX - 4.6) / 2, RZ - 1.4);
    for (let x = -RX + 0.8; x < RX; x += 1.75) { const inHole = x > -4.6 && x < 2.2; const d = inHole ? 2 * RZ - 2.8 : 2 * RZ; add(box(0.35, 0.8, d, wm(M.wood, [1, 0.25]), x, RH - 0.4, -RZ + d / 2, true)); }
    add(box(2 * RX, 0.8, 0.4, M.wood, 0, RH - 0.4, RZ - 2.8));
    // stairwell shaft above the opening + warm door slit at the top
    add(box(6.8, 6, 0.3, M.ceil, -1.2, RH + 3, RZ - 2.95), box(0.3, 6, 3, M.ceil, -4.75, RH + 3, RZ - 1.4), box(0.3, 6, 3, M.ceil, 2.35, RH + 3, RZ - 1.4), box(7, 0.3, 3, M.ceil, -1.2, RH + 4.5, RZ - 1.4));
    // grime band along the wall bottoms
    const gc = cnv(16, 128), gg = gc.getContext('2d'), ggr = gg.createLinearGradient(0, 0, 0, 128); ggr.addColorStop(0, 'rgba(40,32,20,0)'); ggr.addColorStop(0.6, 'rgba(45,36,22,0.35)'); ggr.addColorStop(0.92, 'rgba(30,24,15,0.7)'); ggr.addColorStop(1, 'rgba(20,16,10,0.85)'); gg.fillStyle = ggr; gg.fillRect(0, 0, 16, 128);
    const gm = new THREE.MeshStandardMaterial({ map: tex(gc), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
    [[2 * RX, 0, -RZ + 0.01, 0], [2 * RZ, -RX + 0.01, 0, Math.PI / 2], [2 * RZ, RX - 0.01, 0, -Math.PI / 2]].forEach(([w, x, z, ry]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.8), gm); p.position.set(x, 0.9, z); p.rotation.y = ry; p.userData.noShadow = true; add(p); });
  }
  // floor decals: stains + the wet ring around the drain
  const decal = (s, x, z, draw, op = 1) => { const c = cnv(256, 256), g = c.getContext('2d'); draw(g); const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true, opacity: op, depthWrite: false, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -3 })); m.rotation.x = -Math.PI / 2; m.rotation.z = rr() * 6; m.position.set(x, 0.005, z); m.userData.noShadow = true; m.castShadow = false; return add(m); };
  const blob = (g, col, a) => { const r = rng(Math.floor(rr() * 1e6)); g.fillStyle = `rgba(${col},${a})`; g.beginPath(); for (let k = 0; k < 24; k++) { const ang = (k / 24) * Math.PI * 2, rad = 80 + r() * 40; g.lineTo(128 + Math.cos(ang) * rad, 128 + Math.sin(ang) * rad); } g.fill(); g.filter = 'none'; };
  const wet = decal(5.2, 0, 0.5, (g) => { const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, 'rgba(30,26,22,0.75)'); gr.addColorStop(0.55, 'rgba(35,30,25,0.45)'); gr.addColorStop(0.75, 'rgba(40,34,26,0.25)'); gr.addColorStop(1, 'rgba(40,34,26,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(90,60,30,0.4)'; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.stroke(); });
  wet.material.roughness = 0.15;
  [[-1.6, 1.5, 2.2, '60,45,25', 0.4], [3.4, -1.0, 1.8, '30,28,26', 0.45], [-5.0, 3.0, 2.6, '90,60,30', 0.3], [1.8, -2.0, 1.4, '40,36,30', 0.5]].forEach(([x, z, s, c, a]) => decal(s, x, z, (g) => blob(g, c, a)));

  // ---------------- appliance builder (dryer / washer) ----------------
  const FZ = -2.5, DEP = 2.8, AW = 3.0, AH = 3.0, Y0 = 0.14, DY = 1.5;
  function appliance(cx, o) {
    const g = new THREE.Group(); g.position.set(cx, 0, FZ - DEP / 2); add(g);
    const bm = enam([1 / 3, 1 / 3]);
    g.add(box(0.1, AH, DEP, bm, -AW / 2 + 0.05, Y0 + AH / 2, 0, true), box(0.1, AH, DEP, bm, AW / 2 - 0.05, Y0 + AH / 2, 0, true), box(AW, AH, 0.1, bm, 0, Y0 + AH / 2, -DEP / 2 + 0.05));
    g.add(rb(AW + 0.04, 0.14, DEP + 0.04, 0.05, bm, 0, Y0 + AH + 0.02, 0));
    // front panel with the porthole hole
    const sh = new THREE.Shape(); sh.moveTo(-AW / 2 + 0.03, 0.32); sh.lineTo(AW / 2 - 0.03, 0.32); sh.lineTo(AW / 2 - 0.03, AH - 0.03); sh.lineTo(-AW / 2 + 0.03, AH - 0.03); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(0, DY, 1.02, 0, Math.PI * 2, true); sh.holes.push(hole);
    const fp = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 48 }), enam([1 / 3, 1 / 3])); fp.position.set(0, Y0, DEP / 2 - 0.1); g.add(fp);
    g.add(box(AW - 0.1, 0.3, 0.08, M.iron, 0, Y0 + 0.17, DEP / 2 - 0.12));   // kick plate
    for (let k = 0; k < 7; k++) g.add(box(AW - 0.5, 0.025, 0.02, M.black, 0, Y0 + 0.08 + k * 0.035 + 0.04, DEP / 2 - 0.07));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, Y0, 12), M.rubber); f.position.set(sx * (AW / 2 - 0.25), Y0 / 2, sz * (DEP / 2 - 0.25)); g.add(f); });
    // rubber boot between the panel and the drum
    const boot = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.97, 0.32, 48, 1, true), M.rubber); boot.rotation.x = Math.PI / 2; boot.position.set(0, Y0 + DY, DEP / 2 - 0.22); g.add(boot);
    // drum
    const drumM = pbr(perfT.c, perfT.h, { rough: 0.35, bump: 2.5, repeat: [7, 2] }); drumM.metalness = 0.85; drumM.side = THREE.BackSide; envd(drumM, 0.45);
    drumM.emissive = new THREE.Color(o.glow || '#ff6a14'); drumM.emissiveMap = drumM.map; drumM.emissiveIntensity = 0;
    const drum = new THREE.Group(); drum.position.set(0, Y0 + DY, DEP / 2 - 0.38 - 1.05); g.add(drum);
    const dc = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.97, 2.1, 48, 1, true), drumM); dc.rotation.x = Math.PI / 2; drum.add(dc);
    const backM = drumM.clone(); backM.side = THREE.FrontSide; backM.map = drumM.map.clone(); backM.map.repeat.set(2, 2); backM.map.needsUpdate = true; backM.emissiveMap = backM.map;
    const db = new THREE.Mesh(new THREE.CircleGeometry(0.97, 48), backM); db.position.z = -1.05; drum.add(db);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.12, 24), M.steel); hub.rotation.x = Math.PI / 2; hub.position.z = -1.0; drum.add(hub);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2, bf = rb(0.22, 0.26, 1.9, 0.06, M.steel, Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0); bf.rotation.z = a + Math.PI / 2; drum.add(bf); }
    (o.socks || []).forEach(([kind, a, z, ry], i) => { const s = SOCKS.one(kind, 0.42); s.position.set(Math.cos(a) * 0.72, Math.sin(a) * 0.72, z); s.rotation.set(0.3 * i, ry, a + Math.PI / 2 + 1.2); drum.add(s); });
    if (o.laundry) o.laundry.forEach(([c, a, z, s]) => { const m = rb(s, s * 0.45, s * 0.8, s * 0.2, new THREE.MeshStandardMaterial({ color: c, roughness: 1 }), Math.cos(a) * 0.68, Math.sin(a) * 0.68, z); m.rotation.z = a + Math.PI / 2; drum.add(m); });
    const dLamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#3a3020' })); dLamp.position.set(0, 0.9, 0.7); drum.add(dLamp);
    // door (hinge on the left; open = rotation.y negative)
    const door = new THREE.Group(); door.position.set(-1.18, Y0 + DY, DEP / 2 + 0.05); g.add(door);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.15, 16, 64), envd(new THREE.MeshPhysicalMaterial({ color: o.ring || '#e9e6de', roughness: 0.3, clearcoat: 0.8 }), 0.4)); ring.position.x = 1.18; ring.scale.z = 0.8; door.add(ring);
    const cr = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 12, 64), M.chrome); cr.position.set(1.18, 0, 0.1); door.add(cr);
    const glassM = envd(new THREE.MeshPhysicalMaterial({ color: o.glass || '#cfe0ea', roughness: 0.05, transparent: true, opacity: o.glassOp ?? 0.18, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }), 1.2);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(1.4, 40, 12, 0, Math.PI * 2, 0, 0.75), glassM); gl.rotation.x = -Math.PI / 2; gl.position.set(1.18, 0, 1.4 * Math.cos(0.75) + 0.08); gl.userData.noShadow = true; door.add(gl);   // bowl bulging into the drum
    const hd = rb(0.22, 0.75, 0.24, 0.08, M.chrome, 1.18 + 1.1, 0, 0.14); door.add(hd);
    door.add(box(0.12, 0.35, 0.2, M.steel, -0.02, 0.62, -0.05), box(0.12, 0.35, 0.2, M.steel, -0.02, -0.62, -0.05));
    // console (back of the top)
    const con = new THREE.Group(); con.position.set(0, Y0 + AH + 0.09, -DEP / 2 + 0.36); g.add(con);
    con.add(rb(AW, 0.8, 0.6, 0.08, enam([1 / 3, 1 / 3]), 0, 0.4, 0));
    con.add(box(AW - 0.06, 0.12, 0.66, M.chrome, 0, 0.78, 0));
    const face = KIT.textTex(1024, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.panel || '#d9d3c4'); gr.addColorStop(1, '#bdb6a6'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2a2a2a'; c.font = 'bold 30px Arial, sans-serif'; c.textAlign = 'center';
      const L = o.labels || ['NORMAL', 'DELICATE', 'HEAVY', 'TIMED', 'AIR', 'WRINKLE'];
      L.forEach((t, i) => { const a = -2.4 + (i / (L.length - 1)) * 1.8 + (i >= 3 ? 1.2 : 0), x = 250 + Math.cos(a) * 105, y = 128 + Math.sin(a) * 105 + 10; c.font = 'bold 18px Arial'; c.fillText(t, x, y); });
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; c.fillRect(250 + Math.cos(a) * 84 - 2, 128 + Math.sin(a) * 84 - 2, 4, 4); }
      c.font = 'italic bold 40px Georgia, serif'; c.fillStyle = o.brandC || '#9a1c1c'; c.fillText(o.brand || 'DRYMASTER', 520, 92);
      c.font = 'bold 16px Arial'; c.fillStyle = '#444'; c.fillText('START', 820, 212); c.fillText('TEMP', 900, 212); c.fillText(o.sub || 'HEAVY DUTY  ·  7.0 CU FT', 520, 132);
      c.strokeStyle = '#333'; c.lineWidth = 3; c.strokeRect(612, 160, 160, 70); });
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(AW - 0.14, 0.7), new THREE.MeshStandardMaterial({ map: face, roughness: 0.4 })); fm.position.set(0, 0.4, 0.305); con.add(fm);
    const knob = new THREE.Group(); knob.position.set(-AW / 2 + 0.07 + (250 / 1024) * (AW - 0.14), 0.4, 0.33); con.add(knob);
    const kb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.16, 32), M.chrome); kb.rotation.x = Math.PI / 2; knob.add(kb);
    const kc = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32), new THREE.MeshStandardMaterial({ color: '#f1efe8', roughness: 0.3 })); kc.rotation.x = Math.PI / 2; kc.position.z = 0.09; knob.add(kc);
    knob.add(box(0.05, 0.3, 0.06, M.black, 0, 0, 0.12)); knob.add(box(0.03, 0.09, 0.02, new THREE.MeshBasicMaterial({ color: '#c01818' }), 0, 0.11, 0.155));
    knob.rotation.z = -0.7;
    // display
    const dispC = (lit) => KIT.textTex(256, 112, (c, w, h) => { c.fillStyle = lit ? '#000000' : '#151816'; c.fillRect(0, 0, w, h);
      c.font = 'bold 76px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (lit) { c.shadowColor = o.disp || '#ff5a1e'; c.shadowBlur = 14; c.fillStyle = o.disp || '#ff5a1e'; c.fillText(o.time || '0:47', w / 2, h / 2 + 4); c.font = 'bold 18px Arial'; c.fillText('DRY', 40, 20); }
      else { c.fillStyle = '#20251f'; c.fillText('8:88', w / 2, h / 2 + 4); } });
    const dispM = new THREE.MeshStandardMaterial({ map: dispC(false), emissiveMap: dispC(true), emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0, roughness: 0.15 });
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.24), dispM); disp.position.set(-AW / 2 + 0.07 + (692 / 1024) * (AW - 0.14), 0.4 - 0.04, 0.315); con.add(disp);
    const btnM = new THREE.MeshStandardMaterial({ color: '#f3f1ea', roughness: 0.35 }), ledM = new THREE.MeshBasicMaterial({ color: '#2a1410' });
    [820, 900].forEach((px) => { const b = rb(0.18, 0.18, 0.08, 0.04, btnM, -AW / 2 + 0.07 + (px / 1024) * (AW - 0.14), 0.47, 0.32); con.add(b); });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), ledM); led.position.set(-AW / 2 + 0.07 + (860 / 1024) * (AW - 0.14), 0.62, 0.32); con.add(led);
    // badge + sticker
    const badge = KIT.textTex(256, 64, (c, w, h) => { c.fillStyle = '#c8ccd0'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; c.font = 'bold italic 36px Georgia, serif'; c.textAlign = 'center'; c.fillText(o.brand || 'DRYMASTER', w / 2, 46); });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), envd(new THREE.MeshStandardMaterial({ map: badge, roughness: 0.3, metalness: 0.6 }), 0.6)); bg.position.set(0, Y0 + 0.45, DEP / 2 + 0.015); g.add(bg);
    const stk = KIT.textTex(256, 160, (c, w, h) => { c.fillStyle = '#f2c81c'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.fillRect(6, 6, w - 12, 34); c.fillStyle = '#f2c81c'; c.font = 'bold 26px Arial'; c.textAlign = 'center'; c.fillText('WARNING', w / 2, 33); c.fillStyle = '#111'; c.font = 'bold 22px Arial'; c.fillText(o.warn1 || 'CLEAN LINT', w / 2, 82); c.fillText(o.warn2 || 'EVERY LOAD', w / 2, 112); });
    const sk = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshStandardMaterial({ map: stk, roughness: 0.5 })); sk.position.set(AW / 2 - 0.5, Y0 + AH - 0.35, DEP / 2 + 0.015); sk.rotation.z = 0.04; g.add(sk);
    // lint filter slot on the top (dryer only)
    if (o.lint) { g.add(box(1.2, 0.03, 0.35, M.black, 0, Y0 + AH + 0.1, DEP / 2 - 0.45)); g.add(box(0.3, 0.06, 0.12, M.steel, 0, Y0 + AH + 0.12, DEP / 2 - 0.45)); }
    return { g, drum, drumM, backM, door, knob, dispM, led, ledM, glassM, dLamp, world: (x, y, z) => g.localToWorld(V(x, y, z)) };
  }
  const dryer = appliance(-1.7, { lint: true, socks: [['grey', -1.4, 0.4, 0.4], ['stripe', -2.1, -0.3, 1.2], ['dots', -0.9, -0.6, 2.4]], laundry: [['#4a6fa8', -1.7, -0.2, 0.7], ['#d8d2c2', -1.1, 0.1, 0.6]] });
  const washer = appliance(1.7, { brand: 'AQUAWASH', brandC: '#1d4f9a', disp: '#46d0ff', time: '12', glass: '#7fa8c0', glassOp: 0.35, ring: '#dfe3e6', panel: '#d3d7da', labels: ['COLD', 'WARM', 'HOT', 'RINSE', 'SPIN', 'SOAK'], sub: 'FRONT LOAD  ·  ECO', warn1: 'DO NOT', warn2: 'OVERLOAD', laundry: [['#8a3a3a', -1.6, 0.2, 0.75], ['#e8e2d0', -1.2, -0.4, 0.7], ['#3a5a3a', -2.0, -0.6, 0.6]] });
  washer.knob.rotation.z = 0.4;
  // bundle of power cords + outlet on the back wall, dryer vent duct (ribbed foil) into the wall
  {
    const ductM = envd(new THREE.MeshStandardMaterial({ color: '#c9c9c4', roughness: 0.35, metalness: 0.9 }), 0.7);
    const curve = new THREE.CatmullRomCurve3([V(-2.2, 2.6, -5.35), V(-2.4, 4.0, -5.55), V(-2.9, 5.2, -5.6), V(-3.2, 6.0, -5.75), V(-3.3, 6.4, -6.0)]);
    const tg = new THREE.TubeGeometry(curve, 60, 0.38, 20, false), p = tg.attributes.position, n = tg.attributes.normal;
    for (let i = 0; i < p.count; i++) { const ring = Math.floor(i / 21), k = 0.05 * Math.sin(ring * 1.6); p.setXYZ(i, p.getX(i) + n.getX(i) * k, p.getY(i) + n.getY(i) * k, p.getZ(i) + n.getZ(i) * k); } tg.computeVertexNormals();
    add(new THREE.Mesh(tg, ductM));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24), M.steel); cap.rotation.x = Math.PI / 2; cap.position.set(-3.3, 6.4, -5.95); add(cap);
    const outT = KIT.textTex(64, 96, (c) => { c.fillStyle = '#ece8dc'; c.fillRect(0, 0, 64, 96); c.fillStyle = '#222'; [[22, 28], [42, 28], [22, 62], [42, 62]].forEach(([x, y]) => c.fillRect(x - 3, y - 7, 6, 14)); });
    const out = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.08), new THREE.MeshStandardMaterial({ map: outT, roughness: 0.5 })); out.position.set(0, 4.6, -RZ + 0.04); add(out);
    add(box(0.12, 6.4, 0.12, M.steel, 0, 7.95, -RZ + 0.08));   // conduit up to the ceiling
    const cord = (a, b) => add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, V((a.x + b.x) / 2, a.y - 0.6, (a.z + b.z) / 2), b]), 16, 0.045, 6), M.black));
    cord(V(-0.4, 3.0, -5.35), V(-0.12, 4.4, -5.9)); cord(V(0.6, 3.0, -5.35), V(0.12, 4.4, -5.9));
  }
  // things on top of the machines
  {
    const basket2 = rb(1.4, 0.5, 0.9, 0.1, new THREE.MeshStandardMaterial({ color: '#e8e2d0', roughness: 1 }), 1.3, Y0 + AH + 0.34, -3.3); basket2.rotation.y = 0.2; add(basket2);   // folded towels
    add(rb(1.3, 0.3, 0.85, 0.1, new THREE.MeshStandardMaterial({ color: '#c96a4a', roughness: 1 }), 1.32, Y0 + AH + 0.74, -3.28));
    const sheets = KIT.textTex(256, 160, (c, w, h) => { c.fillStyle = '#7ac4e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 54px Arial'; c.textAlign = 'center'; c.fillText('FLUFF', w / 2, 70); c.font = 'bold 22px Arial'; c.fillText('DRYER SHEETS', w / 2, 110); c.fillStyle = '#f6e04a'; c.beginPath(); c.arc(210, 130, 18, 0, 7); c.fill(); });
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.5), [M.pvc, M.pvc, M.pvc, M.pvc, new THREE.MeshStandardMaterial({ map: sheets, roughness: 0.6 }), M.pvc]); sb.position.set(-2.4, Y0 + AH + 0.37, -2.95); sb.rotation.y = 0.15; add(sb);
    const lone = SOCKS.lying('argyle', 0.5, 0.8); lone.position.set(-1.0, Y0 + AH + 0.09, -2.9); add(lone);   // one lonely sock on the dryer
    const lintBall = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshStandardMaterial({ color: '#9a9aa2', roughness: 1 })); lintBall.scale.set(1.4, 0.5, 1); lintBall.position.set(-1.3, Y0 + AH + 0.14, -3.4); add(lintBall);
  }

  // ---------------- shelves (back wall above the machines + left wall unit) ----------------
  const bottles = [];
  const labelTex = {};
  const lbl = (name, bgc, fg) => labelTex[name] || (labelTex[name] = KIT.textTex(256, 256, (c, w, h) => { c.fillStyle = bgc; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(w / 2, h * 0.5, w * 0.42, h * 0.3, 0, 0, 7); c.fill();
    c.fillStyle = fg; c.font = `bold ${name.length > 5 ? 52 : 64}px Arial Black, Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h * 0.47); c.font = 'bold 20px Arial'; c.fillText('ULTRA', w / 2, h * 0.68); }));
  function bottle(x, y, z, ry, s, col, name, fg) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s);
    const plastic = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.3, clearcoat: 0.5 });
    g.add(rb(0.8, 1.2, 0.5, 0.15, plastic, 0, 0.6, 0));
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.25, 16), plastic); neck.position.set(-0.18, 1.3, 0); g.add(neck);
    const capm = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 16), new THREE.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.4 })); capm.position.set(-0.18, 1.48, 0); g.add(capm);
    const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16, Math.PI), plastic); hnd.position.set(0.15, 1.18, 0); g.add(hnd);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), new THREE.MeshStandardMaterial({ map: lbl(name, col, fg), roughness: 0.5 })); lb.position.set(0, 0.6, 0.256); g.add(lb);
    bottles.push(g); return add(g);
  }
  function jug(x, y, z, ry, s) {   // bleach jug
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s);
    const w = new THREE.MeshStandardMaterial({ color: '#f2f1ec', roughness: 0.45 });
    g.add(rb(0.65, 1.3, 0.65, 0.18, w, 0, 0.65, 0)); const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), new THREE.MeshStandardMaterial({ color: '#2a62c8', roughness: 0.4 })); cp.position.set(0, 1.4, 0); g.add(cp);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ map: lbl('BLEACH', '#2a62c8', '#1a3c88'), roughness: 0.5 })); lb.position.set(0, 0.6, 0.33); g.add(lb); return add(g);
  }
  function powderBox(x, y, z, ry, s, col, name) {
    const t = KIT.textTex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h / 2, 90, 0, 7); c.fill(); c.fillStyle = col; c.font = 'bold 60px Arial Black, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2); c.fillStyle = '#ffde3a'; c.fillRect(0, 210, w, 30); });
    const sm = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 }), m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.55), [sm, sm, sm, sm, new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }), sm]);
    m.position.set(x, y + 0.55 * s, z); m.rotation.y = ry; m.scale.setScalar(s); return add(m);
  }
  {
    // back wall shelf above the machines
    const SY = 6.3; add(rb(7.6, 0.18, 1.1, 0.03, M.wood, 0, SY, -RZ + 0.6));
    [-3.2, 0, 3.2].forEach((x) => { add(box(0.1, 0.8, 0.9, M.iron, x, SY - 0.5, -RZ + 0.5)); });
    bottle(-3.2, SY + 0.09, -5.4, 0.1, 1, '#e8562a', 'SUDZ', '#c03810'); bottle(-2.3, SY + 0.09, -5.45, -0.15, 0.9, '#2f8fd8', 'BRITE', '#1a5aa0');
    powderBox(-1.2, SY + 0.09, -5.5, 0.05, 1, '#e8862a', 'TIDAL'); jug(-0.1, SY + 0.09, -5.45, 0.3, 1);
    bottle(0.9, SY + 0.09, -5.4, 0.2, 0.85, '#7cc04a', 'FRESH', '#3a7a1a'); bottle(1.8, SY + 0.09, -5.5, -0.3, 0.9, '#a050c8', 'LAVNDR', '#6a2a90');
    // "LOST SOCKS" box with socks spilling over the edge
    const lt = KIT.textTex(512, 256, (c, w, h) => { c.fillStyle = '#b8894e'; c.fillRect(0, 0, w, h); KIT.noiseOver(c, w, h, 71, 0.25, 8, 3); c.fillStyle = '#1a1a1a'; c.font = 'bold 84px "Marker Felt", "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.fillText('LOST', w / 2, 110); c.fillText('SOCKS', w / 2, 205); c.fillStyle = 'rgba(220,210,180,0.8)'; c.fillRect(0, 0, w, 18); });
    const card = new THREE.MeshStandardMaterial({ color: '#b8894e', roughness: 0.9 });
    const lbx = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.95), [card, card, card, card, new THREE.MeshStandardMaterial({ map: lt, roughness: 0.9 }), card]); lbx.position.set(3.0, SY + 0.54, -5.45); add(lbx);
    [['fadestripe', 2.6, 0.2], ['star', 3.1, -0.4], ['knit', 3.5, 0.6]].forEach(([k, x, ry]) => { const s = SOCKS.one(k, 0.45); s.position.set(x, SY + 1.0, -5.2); s.rotation.set(-1.1, ry, 0.2); add(s); });
    // left wall shelving unit (steel uprights + wooden boards)
    const LX = -RX + 0.65, Z0 = -1.6, Z1 = 2.6;
    [Z0, Z1].forEach((z) => [-0.55, 0.55].forEach((dx) => add(box(0.12, 8.2, 0.12, M.steel, LX + dx, 4.1, z))));
    [0.6, 2.9, 5.2, 7.5].forEach((y) => add(rb(1.25, 0.14, Z1 - Z0 + 0.4, 0.02, M.wood, LX, y, (Z0 + Z1) / 2)));
    powderBox(LX, 0.67, -0.9, Math.PI / 2, 1.1, '#2a9a5a', 'CLEAN'); powderBox(LX, 0.67, 0.25, Math.PI / 2 + 0.2, 1.1, '#e8862a', 'TIDAL');
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.95, 24), new THREE.MeshStandardMaterial({ color: '#c8c8c0', roughness: 0.4, metalness: 0.6 })); bucket.position.set(LX, 1.15, 1.6); add(bucket);
    bottle(LX, 2.97, -1.0, Math.PI / 2, 0.9, '#e8562a', 'SUDZ', '#c03810'); bottle(LX, 2.97, -0.1, Math.PI / 2 - 0.2, 0.9, '#2f8fd8', 'BRITE', '#1a5aa0'); jug(LX, 2.97, 0.8, Math.PI / 2, 0.9); bottle(LX, 2.97, 1.8, Math.PI / 2 + 0.3, 0.8, '#f2c81c', 'SUNNY', '#a07a00');
    const towelC = ['#e8e2d0', '#c96a4a', '#5a8ac0', '#e8e2d0', '#7aa86a'];
    towelC.forEach((c, i) => add(rb(1.0, 0.24, 1.1, 0.1, new THREE.MeshStandardMaterial({ color: c, roughness: 1 }), LX, 5.4 + i * 0.25, -0.9 + (i % 2) * 0.05)));
    towelC.slice(0, 3).forEach((c, i) => add(rb(1.0, 0.24, 1.1, 0.1, new THREE.MeshStandardMaterial({ color: c, roughness: 1 }), LX, 5.4 + i * 0.25, 0.5)));
    const cans = ['#8a3a2a', '#3a5a8a', '#c8c8c0']; cans.forEach((c, i) => { const cn = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.6, 20), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.7 })); cn.position.set(LX, 7.87, -1.0 + i * 0.75); add(cn); });
    const flash = rb(0.3, 0.3, 0.9, 0.08, new THREE.MeshStandardMaterial({ color: '#c8202a', roughness: 0.4 }), LX, 5.36, 1.8); add(flash);
    const sc = KIT.textTex(256, 256, (c, w, h) => { c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.fillText('XMAS', w / 2, 110); c.fillText('LIGHTS', w / 2, 160); });
    const card2 = new THREE.MeshStandardMaterial({ color: '#b8894e', roughness: 0.9 }); const xb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.95, 1.0), [new THREE.MeshStandardMaterial({ map: sc, roughness: 0.9 }), card2, card2, card2, card2, card2]); xb.position.set(LX, 8.05, 1.9); add(xb);
  }

  // ---------------- water heater (back-left corner) ----------------
  let pilotM;
  {
    const hx = -6.4, hz = -4.5, ht = 6.8;
    const hwT = KIT.textTex(512, 512, (c, w, h) => { c.fillStyle = '#d9d2bc'; c.fillRect(0, 0, w, h); KIT.noiseOver(c, w, h, 81, 0.12, 8, 3);
      c.fillStyle = '#2a4a8a'; c.fillRect(160, 120, 190, 120); c.fillStyle = '#fff'; c.font = 'bold 34px Arial'; c.textAlign = 'center'; c.fillText('HOT', 255, 170); c.fillText('WATER', 255, 212);
      for (let i = 0; i < 8; i++) { const gr = c.createLinearGradient(0, 380, 0, 512); gr.addColorStop(0, 'rgba(120,70,30,0)'); gr.addColorStop(1, 'rgba(120,70,30,0.5)'); c.fillStyle = gr; c.fillRect(i * 64 + 10, 380, 14, 132); } });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, ht, 40), envd(new THREE.MeshStandardMaterial({ map: hwT, roughness: 0.45, metalness: 0.2 }), 0.3)); tank.position.set(hx, ht / 2 + 0.2, hz); tank.rotation.y = -2.0; add(tank);
    const top = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 10, 0, Math.PI * 2, 0, 0.5), M.steel); top.scale.y = 0.6; top.position.set(hx, ht + 0.2, hz); add(top);
    add(box(2.4, 0.2, 2.4, M.iron, hx, 0.1, hz));
    [[-0.45, '#2a62c8'], [0.45, '#c82a2a']].forEach(([dx, c]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, RH - ht, 12), M.copper); p.position.set(hx + dx, ht + (RH - ht) / 2 + 0.2, hz); add(p);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); band.position.set(hx + dx, ht + 1.2, hz); add(band); });
    const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, RH - ht, 16), M.galv); flue.position.set(hx, ht + (RH - ht) / 2 + 0.3, hz - 0.1); add(flue);
    // access panel + pilot window (tiny orange glow)
    const ang = 0.55, px = hx + Math.sin(ang) * 1.16, pz = hz + Math.cos(ang) * 1.16;
    const panel = box(0.7, 0.55, 0.05, M.iron, px, 0.9, pz); panel.rotation.y = ang; add(panel);
    pilotM = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.4, 0.3) }); const pw = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), pilotM); pw.position.set(hx + Math.sin(ang) * 1.2, 0.9, hz + Math.cos(ang) * 1.2); pw.rotation.y = ang; add(pw);
    const valve = rb(0.4, 0.3, 0.3, 0.05, new THREE.MeshStandardMaterial({ color: '#c8202a', roughness: 0.4 }), hx + Math.sin(ang + 0.4) * 1.25, 1.4, hz + Math.cos(ang + 0.4) * 1.25); valve.rotation.y = ang + 0.4; add(valve);
  }

  // ---------------- window (high, back wall) ----------------
  let skyMat;
  {
    const zf = -RZ + 0.02, T = 0.18, cxw = (WIN.x0 + WIN.x1) / 2, cyw = (WIN.y0 + WIN.y1) / 2;
    add(box(WIN.x1 - WIN.x0 + 2 * T, T, 0.3, M.dark, cxw, WIN.y1 + T / 2, zf), box(WIN.x1 - WIN.x0 + 2 * T, T, 0.3, M.dark, cxw, WIN.y0 - T / 2, zf));
    add(box(T, WIN.y1 - WIN.y0, 0.3, M.dark, WIN.x0 - T / 2, cyw, zf), box(T, WIN.y1 - WIN.y0, 0.3, M.dark, WIN.x1 + T / 2, cyw, zf));
    add(box(0.1, WIN.y1 - WIN.y0, 0.12, M.dark, cxw, cyw, -RZ - 0.2));
    add(box(WIN.x1 - WIN.x0 + 0.5, 0.12, 0.3, M.dark, cxw, WIN.y0 - 0.06, -RZ + 0.05));
    const grime = KIT.textTex(256, 128, (c, w, h) => { c.fillStyle = 'rgba(200,210,200,0.15)'; c.fillRect(0, 0, w, h); const r = rng(91); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(90,85,60,${0.1 + r() * 0.25})`; c.beginPath(); c.arc(r() * w, h - r() * r() * h, 4 + r() * 18, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(240,240,240,0.35)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { const x = r() * w; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 30, h); c.stroke(); } });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0), new THREE.MeshStandardMaterial({ map: grime, transparent: true, roughness: 0.3, depthWrite: false })); glass.position.set(cxw, cyw, -RZ - 0.25); glass.userData.noShadow = true; add(glass);
    // window well outside: dirt, grass, sky
    const wellC = cnv(512, 384), wg = wellC.getContext('2d'); { const gr = wg.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#9cc4f0'); gr.addColorStop(0.45, '#d8e8f4'); gr.addColorStop(0.46, '#4a7a34'); gr.addColorStop(0.6, '#3a5a26'); gr.addColorStop(0.62, '#5a4632'); gr.addColorStop(1, '#3a2c1e'); wg.fillStyle = gr; wg.fillRect(0, 0, 512, 384);
      const r = rng(92); for (let i = 0; i < 260; i++) { const x = r() * 512, y = 176 + r() * 60; wg.strokeStyle = r() < 0.5 ? '#2e5a22' : '#6a9a3a'; wg.lineWidth = 2; wg.beginPath(); wg.moveTo(x, y); wg.lineTo(x + (r() - 0.5) * 12, y - 20 - r() * 30); wg.stroke(); }
      for (let i = 0; i < 40; i++) { wg.fillStyle = `rgba(30,22,14,${0.3 + r() * 0.4})`; wg.beginPath(); wg.arc(r() * 512, 250 + r() * 130, 3 + r() * 8, 0, 7); wg.fill(); } }
    skyMat = new THREE.MeshBasicMaterial({ map: tex(wellC) }); const well = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4), skyMat); well.position.set(cxw, cyw + 0.3, -RZ - 1.8); add(well);
  }

  // ---------------- laundry chute outlet (from the ceiling) + basket ----------------
  const CH = { x: 5.4, z: -4.85, y0: 7.4, w: 1.9 };
  const chuteFlap = new THREE.Group();
  {
    const gm = () => wm(M.galv, [1 / 2.5, 1 / 2.5]), yc = (CH.y0 + RH) / 2, hh = RH - CH.y0, hw = CH.w / 2;
    add(box(0.08, hh, CH.w, gm(CH.w, hh), CH.x - hw, yc, CH.z, true), box(0.08, hh, CH.w, gm(CH.w, hh), CH.x + hw, yc, CH.z, true), box(CH.w, hh, 0.08, gm(CH.w, hh), CH.x, yc, CH.z - hw, true));
    const OP = { y0: 7.6, y1: 9.25 };
    add(box(CH.w, RH - OP.y1, 0.08, gm(CH.w, RH - OP.y1), CH.x, (RH + OP.y1) / 2, CH.z + hw, true));
    add(box(CH.w + 0.1, 0.1, CH.w + 0.1, M.galv, CH.x, CH.y0 + 0.05, CH.z));
    add(box(CH.w - 0.1, 0.05, CH.w - 0.2, M.void, CH.x, 8.5, CH.z - 0.1));   // dark inside
    const inner = new THREE.Mesh(new THREE.BoxGeometry(CH.w - 0.18, hh, CH.w - 0.18), new THREE.MeshStandardMaterial({ color: '#0a0a0c', roughness: 1, side: THREE.BackSide })); inner.position.set(CH.x, yc, CH.z); add(inner);
    // collar where it meets the ceiling + seam bands + rivets
    add(box(CH.w + 0.4, 0.3, CH.w + 0.4, M.galv, CH.x, RH - 0.15, CH.z));
    [8.0, 9.3, 10.2].forEach((y) => { add(box(CH.w + 0.06, 0.08, CH.w + 0.06, M.steel, CH.x, y, CH.z)); });
    const rivG = new THREE.SphereGeometry(0.04, 8, 6); [9.45, 10.35].forEach((y) => { for (let k = -2; k <= 2; k++) { const m = new THREE.Mesh(rivG, M.steel); m.position.set(CH.x + k * 0.35, y, CH.z + hw + 0.05); add(m); } });
    // hand-stencilled label
    const lt = KIT.textTex(256, 96, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(30,30,30,0.85)'; c.font = 'bold 40px "Stencil", "Arial Black", Arial'; c.textAlign = 'center'; c.fillText('LAUNDRY', w / 2, 46); c.font = 'bold 24px Arial'; c.fillText('KEEP CLOSED', w / 2, 82); });
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.56), new THREE.MeshStandardMaterial({ map: lt, transparent: true, roughness: 0.5 })); lab.position.set(CH.x, 10.0, CH.z + hw + 0.06); add(lab);
    // the flap: hinge along the top edge of the opening (rotation.x negative = swings out toward +z)
    chuteFlap.position.set(CH.x, OP.y1, CH.z + hw + 0.07); add(chuteFlap);
    const fh = OP.y1 - OP.y0 + 0.08, fl = box(CH.w + 0.04, fh, 0.06, gm(CH.w, fh), 0, -fh / 2, 0, true); chuteFlap.add(fl);
    chuteFlap.add(box(CH.w + 0.08, 0.1, 0.1, M.steel, 0, -fh + 0.05, 0.03));   // bottom lip
    const hingeP = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, CH.w + 0.1, 12), M.steel); hingeP.rotation.z = Math.PI / 2; chuteFlap.add(hingeP);
    const pull = rb(0.5, 0.1, 0.12, 0.04, M.chrome, 0, -fh + 0.3, 0.08); chuteFlap.add(pull);
    for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(rivG, M.steel); m.position.set(k * (hw - 0.12), -0.2 - j * 0.6, 0.04); chuteFlap.add(m); }
    // a sock tip caught under the flap
      }
  // big laundry basket under the chute
  {
    const BX = CH.x - 0.1, BZ = -3.75;
    const holeT = cnv(256, 128), hg = holeT.getContext('2d'); hg.fillStyle = '#fff'; hg.fillRect(0, 0, 256, 128); hg.fillStyle = '#000';
    for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { const x = 6 + i * 32, y = 20 + j * 34; hg.beginPath(); hg.roundRect ? hg.roundRect(x, y, 20, 22, 6) : hg.rect(x, y, 20, 22); hg.fill(); }
    const am = tex(holeT, { srgb: false }); am.wrapS = am.wrapT = THREE.RepeatWrapping; am.repeat.set(5, 1);
    const bm = new THREE.MeshStandardMaterial({ color: '#3a78c0', roughness: 0.45, alphaMap: am, alphaTest: 0.5, side: THREE.DoubleSide });
    const bk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.35, 2.1, 48, 1, true), bm); bk.position.set(BX, 1.15, BZ); add(bk);
    const bb = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.3, 0.12, 40), new THREE.MeshStandardMaterial({ color: '#3a78c0', roughness: 0.5 })); bb.position.set(BX, 0.12, BZ); add(bb);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.1, 10, 48), new THREE.MeshStandardMaterial({ color: '#2f68b0', roughness: 0.4 })); rim.rotation.x = Math.PI / 2; rim.position.set(BX, 2.2, BZ); add(rim);
    // clothes heap inside, socks on top
    const fab = ['#e8e2d0', '#8a3a3a', '#5a8ac0', '#d8b04a', '#4a4a52', '#c96a4a', '#7aa86a'], r = rng(7);
    for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = r() * 0.9, s = 0.7 + r() * 0.5, m = rb(s, s * 0.45, s * 0.8, s * 0.2, new THREE.MeshStandardMaterial({ color: fab[i % fab.length], roughness: 1 }), BX + Math.cos(a) * d, 1.4 + r() * 0.75, BZ + Math.sin(a) * d); m.rotation.set(r() - 0.5, r() * 6, r() - 0.5); add(m); }
    [['stripe', 0.3, 0.2, 0.4], ['dino', -0.5, 0.4, 2.1], ['knit2', 0.4, -0.5, 4.0], ['gym', -0.2, -0.3, 1.2], ['dots', 0.8, 0.6, 5.2]].forEach(([k, dx, dz, ry]) => { const s = SOCKS.lying(k, 0.5, ry); s.position.set(BX + dx, 2.32, BZ + dz); add(s); });
    const hang = SOCKS.one('red', 0.5); hang.position.set(BX + 1.45, 2.3, BZ + 0.6); hang.rotation.set(0, 1.2, -0.25); add(hang);
    [['grey2', BX - 1.9, BZ + 1.2, 0.6], ['pizza', BX + 0.6, BZ + 2.2, 2.4]].forEach(([k, x, z, ry]) => { const s = SOCKS.lying(k, 0.5, ry); s.position.set(x, 0, z); add(s); });
  }

  // ---------------- floor drain ----------------
  const drain = new THREE.Group(); drain.position.set(0, 0, 0.5); add(drain);
  const drainLight = new THREE.PointLight('#ff7a2a', 0, 3, 2);
  {
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.6, 1.4, 40, 1, true), new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.6, metalness: 0.5, side: THREE.BackSide })); pit.position.y = -0.7; drain.add(pit);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshPhysicalMaterial({ color: '#05070a', roughness: 0.05, clearcoat: 1 })); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -1.2; drain.add(bottom);
    const hole2 = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), M.void); hole2.rotation.x = -Math.PI / 2; hole2.position.y = -1.19; drain.add(hole2);
    const gc = cnv(512, 512), g = gc.getContext('2d'), ac = cnv(512, 512), a = ac.getContext('2d');
    g.fillStyle = '#4a4440'; g.fillRect(0, 0, 512, 512); KIT.noiseOver(g, 512, 512, 111, 0.6, 8, 4);
    const rr2 = rng(112); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${130 + rr2() * 40},${60 + rr2() * 20},20,${0.3 + rr2() * 0.3})`; g.beginPath(); g.arc(rr2() * 512, rr2() * 512, 6 + rr2() * 26, 0, 7); g.fill(); }
    g.fillStyle = '#d0c8b8'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.globalAlpha = 0.45; g.fillText('DRAIN', 256, 248); g.globalAlpha = 1;
    a.fillStyle = '#fff'; a.beginPath(); a.arc(256, 256, 256, 0, 7); a.fill(); a.fillStyle = '#000';
    for (let k = 0; k < 3; k++) { const r0 = 80 + k * 58, r1 = r0 + 40; for (let s = 0; s < 12 + k * 4; s++) { const ang = (s / (12 + k * 4)) * Math.PI * 2, da = Math.PI / (14 + k * 4); a.beginPath(); a.arc(256, 256, r1, ang - da, ang + da); a.arc(256, 256, r0, ang + da, ang - da, true); a.closePath(); a.fill(); } }
    a.fillStyle = '#fff'; a.fillRect(160, 220, 192, 40);
    const gm = new THREE.MeshStandardMaterial({ map: tex(gc), alphaMap: tex(ac, { srgb: false }), alphaTest: 0.5, roughness: 0.55, metalness: 0.7, side: THREE.DoubleSide }); envd(gm, 0.4);
    const grate = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.06, 48), [new THREE.MeshStandardMaterial({ color: '#3a3430', roughness: 0.6, metalness: 0.7 }), gm, gm]); grate.position.y = 0.0; drain.add(grate);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.07, 10, 48), new THREE.MeshStandardMaterial({ color: '#3e3630', roughness: 0.5, metalness: 0.8 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; drain.add(ring);
    [0, 1, 2, 3].forEach((k) => { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), M.steel); const ang = k * Math.PI / 2 + 0.785; sc.position.set(Math.cos(ang) * 0.62, 0.035, Math.sin(ang) * 0.62); drain.add(sc); });
    drainLight.position.set(0, -0.8, 0); drain.add(drainLight);
    drain.userData.grate = grate;
  }

  // ---------------- drying line with odd socks ----------------
  {
    const LZ = -1.0, Y = 8.6, sag = 0.55, yAt = (x) => Y - sag * (1 - (x / (RX - 0.2)) ** 2);
    const pts = []; for (let x = -RX + 0.2; x <= RX - 0.2 + 1e-6; x += 0.8) pts.push(V(x, yAt(x), LZ));
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.03, 6), new THREE.MeshStandardMaterial({ color: '#d8d0bc', roughness: 0.9 })));
    [-RX + 0.15, RX - 0.15].forEach((x) => { const hk = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12), M.steel); hk.position.set(x, Y + 0.05, LZ); hk.rotation.y = Math.PI / 2; add(hk); });
    const pinM = new THREE.MeshStandardMaterial({ color: '#c8a070', roughness: 0.7 }), springM = M.steel;
    const hung = [['dino', -6.0], ['grandpa', -4.6], ['argyle', -3.1], ['baby', -1.2], ['green', 0.6], ['oat', 2.4], ['star', 3.9], ['fadestripe', 5.6]];
    hung.forEach(([k, x], i) => { const y = yAt(x), s = SOCKS.one(k, 0.6); s.position.set(x, y - 0.04, LZ); s.rotation.set(0, (i % 2 ? 1 : -1) * (1.2 + rr() * 0.6), (rr() - 0.5) * 0.08); add(s);
      const pin = new THREE.Group(); pin.position.set(x, y, LZ); add(pin); [-0.04, 0.04].forEach((dz) => pin.add(box(0.07, 0.38, 0.06, pinM, 0, 0.0, dz))); pin.add(box(0.1, 0.06, 0.16, springM, 0, 0.04, 0)); });
    // a T-shirt and a towel hang too
    const cloth = (w, h, c, x) => { const geo = new THREE.PlaneGeometry(w, h, 10, 10), p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const px = p.getX(k), py = p.getY(k); p.setZ(k, 0.06 * Math.sin(px * 4 + py * 2)); } geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, roughness: 1, side: THREE.DoubleSide })); m.position.set(x, yAt(x) - h / 2, LZ); add(m); };
    cloth(1.3, 1.6, '#c94a3a', -7.1); cloth(1.2, 1.9, '#e8e2d0', 7.0);
  }

  // ---------------- pipes ----------------
  {
    const pipe = (a, b, r, m) => { const d = b.clone().sub(a), L = d.length(), p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 14), m); p.position.copy(a).add(b).multiplyScalar(0.5); p.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return add(p); };
    pipe(V(-RX, 10.25, -5.55), V(RX, 10.25, -5.55), 0.09, M.copper); pipe(V(-RX, 10.0, -5.25), V(RX, 10.0, -5.25), 0.09, M.copper);
    pipe(V(-RX, 10.4, -3.2), V(RX, 10.4, -3.2), 0.24, M.iron);   // cast-iron main under the joists
    pipe(V(7.45, 0, -5.55), V(7.45, RH, -5.55), 0.32, M.iron);   // drain stack
    pipe(V(7.45, 10.4, -3.2), V(7.45, 10.4, -5.55), 0.24, M.iron);
    const hub = (x, y, z, r, rot) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 16), M.iron); h.position.set(x, y, z); if (rot) h.rotation.z = Math.PI / 2; add(h); };
    hub(7.45, 3.0, -5.55, 0.38); hub(7.45, 7.0, -5.55, 0.38); [-6, -2, 2, 6].forEach((x) => hub(x, 10.4, -3.2, 0.29, true));
    // hangers
    for (let x = -7; x < 8; x += 2.5) { add(box(0.05, 0.7, 0.05, M.steel, x, 10.6, -5.4)); add(box(0.05, 0.6, 0.05, M.steel, x + 0.6, 10.7, -3.2)); }
    // copper drops to the washer valves
    pipe(V(1.0, 10.0, -5.25), V(1.0, 4.6, -5.25), 0.07, M.copper); pipe(V(2.4, 10.25, -5.55), V(2.4, 4.6, -5.55), 0.07, M.copper);
    [[1.0, -5.25, '#2a62c8'], [2.4, -5.55, '#c82a2a']].forEach(([x, z, c]) => { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })); v.rotation.x = Math.PI / 2; v.position.set(x, 4.6, z + 0.15); add(v); });
    const hose = (a, b) => add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, V(a.x, a.y - 1.2, a.z + 0.15), V(b.x, b.y + 0.4, b.z - 0.1), b]), 20, 0.07, 8), M.black));
    hose(V(1.0, 4.5, -5.15), V(1.3, 2.4, -5.3)); hose(V(2.4, 4.5, -5.45), V(2.1, 2.4, -5.3));
    // red valve wheel on the main copper
    const vw = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 20), new THREE.MeshStandardMaterial({ color: '#c8202a', roughness: 0.4, metalness: 0.4 })); vw.position.set(-3.6, 10.0, -4.95); add(vw);
    for (let k = 0; k < 3; k++) { const s = box(0.04, 0.5, 0.04, vw.material, -3.6, 10.0, -4.95); s.rotation.z = k * 1.05; add(s); }
    // electrical: junction box on a joist + cable
    add(rb(0.5, 0.5, 0.3, 0.04, M.steel, 0.0, 10.4, -5.7));
  }

  // ---------------- bare bulb with pull chain ----------------
  const BULB = V(0.2, 9.55, -0.4);
  const bulbM = new THREE.MeshStandardMaterial({ color: '#fff6e0', emissive: new THREE.Color('#ffd28a'), emissiveIntensity: 6, roughness: 0.1, transparent: true, opacity: 0.95 });
  const bulbLight = new THREE.PointLight('#ffc27a', 120, 0, 2);
  {
    add(box(0.35, 0.12, 0.35, M.iron, BULB.x, RH - 0.06, BULB.z));
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, RH - 0.12 - (BULB.y + 0.55), 6), M.black); cord.position.set(BULB.x, (RH - 0.12 + BULB.y + 0.55) / 2, BULB.z); add(cord);
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.4, 16), new THREE.MeshStandardMaterial({ color: '#1e1c1a', roughness: 0.5 })); sock.position.set(BULB.x, BULB.y + 0.4, BULB.z); add(sock);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), bulbM); bulb.scale.y = 1.25; bulb.position.copy(BULB); bulb.castShadow = false; bulb.userData.noShadow = true; add(bulb);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.15, 12), M.steel); neck.position.set(BULB.x, BULB.y + 0.25, BULB.z); add(neck);
    const fil = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 6, 2) })); fil.position.copy(BULB); add(fil); bulbM.userData.fil = fil;
    // bead chain
    const beadG = new THREE.SphereGeometry(0.025, 6, 4), beads = new THREE.InstancedMesh(beadG, M.chrome, 60), mm = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) { mm.makeTranslation(BULB.x + 0.16, BULB.y + 0.35 - i * 0.045, BULB.z); beads.setMatrixAt(i, mm); } add(beads);
    const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), M.chrome); bob.position.set(BULB.x + 0.16, BULB.y + 0.35 - 60 * 0.045 - 0.05, BULB.z); add(bob);
    bulbLight.position.copy(BULB); bulbLight.castShadow = true; bulbLight.shadow.mapSize.set(1024, 1024); bulbLight.shadow.bias = -0.002; bulbLight.shadow.radius = 3; add(bulbLight);
  }

  // ---------------- utility sink, mop bucket, stairs, clutter ----------------
  {
    const SX = RX - 1.1, SZ = 1.2;
    const sinkM = new THREE.MeshStandardMaterial({ color: '#b8b8b0', roughness: 0.45 });
    add(rb(1.9, 1.2, 2.4, 0.12, sinkM, SX, 3.2, SZ));
    add(box(1.6, 0.05, 2.1, new THREE.MeshStandardMaterial({ color: '#4a4a46', roughness: 0.3 }), SX, 3.82, SZ));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => add(box(0.12, 2.6, 0.12, sinkM, SX + sx * 0.8, 1.3, SZ + sz * 1.05)));
    const fpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 10), M.copper); fpipe.position.set(RX - 0.15, 4.5, SZ); add(fpipe);
    const spout = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI), M.chrome); spout.position.set(RX - 0.5, 4.9, SZ); spout.rotation.y = 0; add(spout);
    const rag = rb(0.9, 0.08, 0.6, 0.04, new THREE.MeshStandardMaterial({ color: '#c8b070', roughness: 1 }), SX - 0.6, 3.86, SZ - 0.8); rag.rotation.z = 0.5; add(rag);
    const mb = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.65, 1.1, 24), new THREE.MeshStandardMaterial({ color: '#f2c81c', roughness: 0.4 })); mb.position.set(SX - 1.6, 0.55, SZ + 2.2); add(mb);
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.68, 24), new THREE.MeshPhysicalMaterial({ color: '#4a4a3a', roughness: 0.05, clearcoat: 1 })); water.rotation.x = -Math.PI / 2; water.position.set(SX - 1.6, 0.9, SZ + 2.2); add(water);
    const mop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 8), M.wood); mop.position.set(RX - 0.5, 3.0, SZ + 2.6); mop.rotation.z = 0.12; add(mop);
    const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.7, 12), new THREE.MeshStandardMaterial({ color: '#d8d0b8', roughness: 1 })); mh.position.set(RX - 0.88, 0.35, SZ + 2.6); add(mh);
    // stairs along the front wall, rising toward -x into the ceiling opening
    const N = 13, rise = RH / N, run = 0.9, x0 = 6.8, zc = RZ - 1.4, sw = 2.6;
    for (let i = 0; i < N - 1; i++) { const x = x0 - i * run, y = (i + 1) * rise; add(box(run + 0.12, 0.16, sw, wm(M.wood, [0.5, 0.5]), x, y - 0.08, zc, true)); add(box(0.06, rise, sw - 0.1, M.dark, x + run / 2, y - rise / 2, zc)); }
    const len = Math.hypot((N - 1) * run, RH), ang = Math.atan2(RH, (N - 1) * run);
    [zc - sw / 2 - 0.08, zc + sw / 2 + 0.08].forEach((z) => { const s = box(len + 0.6, 0.6, 0.16, M.dark, x0 - ((N - 1) * run) / 2 + 0.3, RH / 2 - 0.2, z); s.rotation.z = -ang; add(s); });
    const rail = box(len, 0.14, 0.14, M.wood, x0 - ((N - 1) * run) / 2, RH / 2 + 2.8, zc - sw / 2 - 0.1); rail.rotation.z = -ang; add(rail);
    for (let i = 0; i < N - 2; i += 2) { const x = x0 - i * run, y = (i + 1) * rise; add(box(0.1, 3.0, 0.1, M.wood, x, y + 1.4, zc - sw / 2 - 0.1)); }
    // boxes under the stairs
    const cbM = new THREE.MeshStandardMaterial({ color: '#b08850', roughness: 0.9 }), tape = new THREE.MeshStandardMaterial({ color: '#d8c49a', roughness: 0.5 });
    [[3.8, 0, 4.6, 1.6, 1.2, 0.2], [5.4, 0, 4.4, 1.4, 1.5, -0.1], [4.6, 1.2, 4.6, 1.2, 0.9, 0.4], [6.6, 0, 4.8, 1.0, 0.8, 0.3]].forEach(([x, y, z, s, h, ry]) => { const b = rb(s, h, s * 0.9, 0.04, cbM, x, y + h / 2, z); b.rotation.y = ry; add(b); const t = box(s + 0.01, 0.02, 0.18, tape, x, y + h + 0.005, z); t.rotation.y = ry; add(t); });
    // sock on the bottom step + one under the washer
    const s1 = SOCKS.lying('mail', 0.5, 1.6); s1.position.set(x0, rise, zc + 0.6); add(s1);
    const s2 = SOCKS.lying('grey', 0.45, 0.3); s2.position.set(2.6, 0, -2.3); add(s2);
    // rag rug in front of the machines
    const rugT = KIT.textTex(512, 256, (c, w, h) => { const cs = ['#8a3a3a', '#d8c49a', '#3a5a8a', '#6a8a4a', '#c96a4a']; for (let y = 0; y < h; y += 10) { c.fillStyle = cs[(y / 10) % 5 | 0]; c.fillRect(0, y, w, 10); } KIT.noiseOver(c, w, h, 121, 0.4, 32, 3); });
    const rug = new THREE.Mesh(RBX.rbox(5.2, 0.05, 1.6, 0.02), new THREE.MeshStandardMaterial({ map: rugT, roughness: 1 })); rug.position.set(0, 0.025, -1.45); add(rug);
  }

  // ---------------- lights ----------------
  shadow(scene);
  scene.traverse((m) => { if (m.isMesh && (m.userData.noShadow || (m.material && (m.material.transparent || m.material.isMeshBasicMaterial)))) m.castShadow = false; });
  const hemi = new THREE.HemisphereLight('#c8b8a0', '#3a3028', 1.4); add(hemi);
  const winDir = V(0.5, -1.4, 1).normalize();
  const sun = new THREE.DirectionalLight('#fff0d8', 6); const wc = V((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -RZ);
  sun.target.position.copy(wc).addScaledVector(winDir, 8); sun.position.copy(wc).addScaledVector(winDir, -14);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; add(sun, sun.target);
  const fill = new THREE.PointLight('#5070d0', 0, 0, 2); fill.position.set(2, 7, 4); add(fill);
  const bmat = RBX.beamMat('#ffe8c0', 0.12); const beam = RBX.beam(wc.clone().add(V(0, 0, 0.1)), winDir, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 11, bmat); add(beam);
  // dryer glow (no shadows): one inside the cavity, one just in front of the door
  const dGlowIn = new THREE.PointLight('#ff7a2a', 0, 4, 2); dGlowIn.position.copy(dryer.world(0, Y0 + DY, DEP / 2 - 0.6)); add(dGlowIn);
  const dGlow = new THREE.PointLight('#ff6a1e', 0, 9, 2); dGlow.position.copy(dryer.world(0, Y0 + DY, DEP / 2 + 0.7)); add(dGlow);
  const pilot = new THREE.PointLight('#ff8a30', 0, 3, 2); pilot.position.set(-5.7, 0.9, -3.5); add(pilot);
  // flashlight (no shadow): shots aim it with setFlashlight(on, from, to)
  const flashlight = new THREE.SpotLight('#fff4dc', 0, 14, 0.38, 0.55, 2); add(flashlight, flashlight.target);
  // dust
  {
    const r = rng(5), N = 220, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = V(WIN.x0 + r() * (WIN.x1 - WIN.x0), WIN.y0 + r() * (WIN.y1 - WIN.y0), -RZ + 0.3).addScaledVector(winDir, r() * 8); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    var dustM = new THREE.PointsMaterial({ size: 0.03, map: tex(c), color: new THREE.Color(2, 1.8, 1.5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 });
    add(new THREE.Points(g, dustM));
  }

  // ---------------- state ----------------
  function setDryer(on, k = 1) {
    const v = on ? k : 0;
    dryer.drumM.emissiveIntensity = 0.55 * v; dryer.backM.emissiveIntensity = 0.45 * v; dryer.dispM.emissiveIntensity = 2.6 * v;
    dryer.ledM.color.set(on ? new THREE.Color(6, 1.2, 0.3) : new THREE.Color('#2a1410')); dryer.dLamp.material.color.set(on ? new THREE.Color(8, 4, 1.2) : new THREE.Color('#3a3020'));
    dryer.glassM.emissive = new THREE.Color('#ff7a2a'); dryer.glassM.emissiveIntensity = 0.12 * v;
    dGlowIn.intensity = 14 * v; dGlow.intensity = 12 * v;
  }
  function setBulb(on) { bulbLight.intensity = on ? 120 : 0; bulbM.emissiveIntensity = on ? 6 : 0; bulbM.color.set(on ? '#fff6e0' : '#8a8a80'); bulbM.userData.fil.material.color.set(on ? new THREE.Color(10, 6, 2) : new THREE.Color('#3a3020')); }
  function setFlashlight(on, from = [-1.7, 3.6, -0.6], to = [-1.7, 1.6, -3.6]) { flashlight.intensity = on ? 35 : 0; flashlight.position.set(...from); flashlight.target.position.set(...to); flashlight.target.updateMatrixWorld(); }
  function mood(name) {
    setDryer(false); setFlashlight(false); drainLight.intensity = 0;
    if (name === 'day') {
      setBulb(true); hemi.color.set('#c8b8a0'); hemi.groundColor.set('#3a3028'); hemi.intensity = 1.3; sun.color.set('#fff0d8'); sun.intensity = 7; fill.intensity = 0;
      bmat.uniforms.col.value.set('#ffe8c0'); bmat.uniforms.k.value = 0.12; skyMat.color.setScalar(1.6); pilot.intensity = 0.6; dustM.color.setRGB(2, 1.8, 1.5);
      envMats.forEach((m) => { m.envMapIntensity = m.userData.envK; });
    } else {
      setBulb(false); hemi.color.set('#46559a'); hemi.groundColor.set('#100c14'); hemi.intensity = name === 'midnight' ? 0.45 : 0.8; sun.color.set('#86a2ff'); sun.intensity = name === 'midnight' ? 6 : 12; fill.color.set('#7f95e0'); fill.intensity = name === 'midnight' ? 10 : 28;
      bmat.uniforms.col.value.set('#7d9cff'); bmat.uniforms.k.value = name === 'midnight' ? 0.06 : 0.1; skyMat.color.setRGB(0.12, 0.16, 0.42); pilot.intensity = 1.6; dustM.color.setRGB(1.2, 1.5, 2.6);
      envMats.forEach((m) => { m.envMapIntensity = m.userData.envK * 0.25; });
      if (name === 'midnight') setDryer(true);
      if (name === 'search') setFlashlight(true);
    }
  }
  mood('day');

  const dryerDoorW = dryer.world(0, Y0 + DY, DEP / 2 + 0.15), washerDoorW = washer.world(0, Y0 + DY, DEP / 2 + 0.15);
  const P = (v) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)];
  return {
    scene, grade: 'night', mood,
    marks: {
      p_mom_dryer: { p: [-1.7, 0, -0.9], ry: Math.PI },          // standing/kneeling in front of the dryer, looking into the door
      p_hero_drain: { p: [-3.4, 0, 2.4], ry: Math.PI * 0.8 },   // someone standing near the drain
      m_dryer: { p: P(dryerDoorW) }, m_washer: { p: P(washerDoorW) },
      m_drain: { p: [0, 0.03, 0.5] },
      m_chute: { p: [CH.x, 8.4, CH.z + CH.w / 2 + 0.1] },
      m_basket: { p: [CH.x - 0.1, 2.3, -3.75] }, m_bulb: { p: [BULB.x, BULB.y, BULB.z] }, m_window: { p: [-4.3, 9.2, -RZ] }, m_stairs_bottom: { p: [6.8, 0.85, RZ - 1.4] },
      cam_dryer_close: { p: [1.4, 1.3, -0.6], l: [-1.7, 1.65, -2.5], fov: 44 },
      cam_dryer_inside: { p: [-1.7, 1.55, -3.55], l: [-1.7, 3.8, 1.5], fov: 62 },
      cam_drain_low: { p: [1.5, 0.35, 2.7], l: [0, 0.05, 0.4], fov: 50 },
      cam_drain_top: { p: [0.2, 4.5, 1.1], l: [0, 0, 0.5], fov: 45 },
      cam_chute: { p: [2.6, 3.6, 1.2], l: [5.4, 7.4, -4.0], fov: 52 },
      cam_wide: { p: [5.0, 5.8, 2.7], l: [-1.6, 3.0, -4.6], fov: 64 },
    },
    props: {
      dryer: dryer.g, dryerDrum: dryer.drum, dryerDoor: dryer.door, dryerKnob: dryer.knob, washer: washer.g, washerDrum: washer.drum, washerDoor: washer.door,
      chuteFlap, drain, drainLight, flashlight, bulbLight, sun, beam,
      setDryer, setBulb, setFlashlight,
      setDryerSpin: (a) => { dryer.drum.rotation.z = a; },
      setChute: (open) => { chuteFlap.rotation.x = -open; },
    },
    views: {
      wide: { p: [5.0, 5.8, 2.7], l: [-1.6, 3.0, -4.6], fov: 64, mood: 'day', grade: 'day' },
      dryer_search: { p: [1.4, 1.3, -0.6], l: [-1.7, 1.65, -2.5], fov: 44, mood: 'search' },
      dryer_inside: { p: [-1.7, 1.55, -3.55], l: [-1.7, 3.8, 1.5], fov: 62, mood: 'search' },
      drain_night: { p: [1.5, 0.35, 2.7], l: [0, 0.05, 0.4], fov: 50, mood: 'night' },
      midnight: { p: [1.2, 2.6, 2.4], l: [-1.7, 1.8, -2.5], fov: 50, mood: 'midnight' },
      chute: { p: [2.6, 3.6, 1.2], l: [5.4, 7.4, -4.0], fov: 52, mood: 'night' },
      top: { p: [0.5, 10.4, 1.5], l: [0.3, 0, 1.0], fov: 80, mood: 'night' },
      reverse: { p: [-4.5, 6.5, -3.0], l: [3.0, 3.0, 3.5], fov: 62, mood: 'day', grade: 'day' },
    },
  };
};

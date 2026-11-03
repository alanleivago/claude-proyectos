// rbx-thursday STREET set: suburban Bloxburg street (our house, Grandma's porch jungle, bank clock, church bell tower).
// Road along x (-120..120), north houses face +z at z=-16, south houses face -z at z=+16. See SETS.md for the contract.
'use strict';
SETS.street = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng, fbm, tnoise } = RBX, { texPair, noiseOver, uvBox, V } = KIT;
  const scene = new T.Scene(), props = { boards: [], shingles: [], ladders: null }, marks = {};
  const RY = -0.35;   // road top (sidewalks, lawns, porches at 0)
  const PI = Math.PI;

  // ---------- helpers ----------
  const SM = (o) => new T.MeshStandardMaterial(o);
  const BX = (w, h, d, m, x, y, z, par = scene) => { const me = new T.Mesh(uvBox(new T.BoxGeometry(w, h, d), w, h, d), m); me.position.set(x, y, z); par.add(me); return me; };
  const RB = (w, h, d, r, m, x, y, z, par = scene) => { const me = new T.Mesh(RBX.rbox(w, h, d, r, 8), m); me.position.set(x, y, z); par.add(me); return me; };
  const CY = (rt, rb_, h, m, x, y, z, par = scene, seg = 16) => { const me = new T.Mesh(new T.CylinderGeometry(rt, rb_, h, seg), m); me.position.set(x, y, z); par.add(me); return me; };
  const planeW = (w, h) => { const g = new T.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h); return g; };
  const INST = new Map(), _q = new T.Quaternion(), _e = new T.Euler();
  const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new T.Matrix4().compose(new T.Vector3(x, y, z), _q.clone().setFromEuler(_e.set(rx, ry, rz)), new T.Vector3(sx, sy, sz));
  function inst(key, geo, mat, m4, col, parent = scene) { let L = INST.get(key); if (!L) INST.set(key, L = { geo, mat, ms: [], cs: [], parent }); L.ms.push(m4); L.cs.push(col || null); }
  function flushInst() { INST.forEach((L) => { const im = new T.InstancedMesh(L.geo, L.mat, L.ms.length); L.ms.forEach((m, i) => im.setMatrixAt(i, m)); if (L.cs.some((c) => c)) L.cs.forEach((c, i) => im.setColorAt(i, c || new T.Color(1, 1, 1))); im.castShadow = !L.mat.userData.noCast; im.receiveShadow = true; L.parent.add(im); }); }
  const C = (h) => new T.Color(h);

  // ---------- textures ----------
  const asphaltT = texPair(512, (g, hg, S) => {
    g.fillStyle = '#35363c'; g.fillRect(0, 0, S, S); const r = rng(3);
    for (let i = 0; i < 16000; i++) { const x = r() * S, y = r() * S, s = 0.7 + r() * 1.8, v = 38 + r() * 75; g.fillStyle = `rgb(${v},${v},${v * 1.06})`; g.fillRect(x, y, s, s); hg.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`; hg.fillRect(x, y, s, s); }
    noiseOver(g, S, S, 5, 0.55, 4, 4);
    for (let k = 0; k < 4; k++) { const x = r() * S, y = r() * S, w = 60 + r() * 120, h = 30 + r() * 80; g.fillStyle = 'rgba(20,20,24,0.45)'; g.fillRect(x, y, w, h); }
    g.strokeStyle = 'rgba(12,12,14,0.9)'; hg.strokeStyle = '#000'; g.lineWidth = 1.6; hg.lineWidth = 2.5;
    for (let k = 0; k < 6; k++) { let x = r() * S, y = r() * S; g.beginPath(); hg.beginPath(); g.moveTo(x, y); hg.moveTo(x, y); for (let j = 0; j < 14; j++) { x += (r() - 0.5) * 36; y += (r() - 0.5) * 36; g.lineTo(x, y); hg.lineTo(x, y); } g.stroke(); hg.stroke(); }
  });
  const concreteT = texPair(512, (g, hg, S) => {
    g.fillStyle = '#bab6ad'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 7, 0.32, 8, 5); const r = rng(8);
    for (let i = 0; i < 4000; i++) { const x = r() * S, y = r() * S, v = r() < 0.5 ? 90 : 215; g.fillStyle = `rgba(${v},${v},${v},0.3)`; g.fillRect(x, y, 1.5, 1.5); }
    for (let i = 0; i < 7; i++) { const x = r() * S, y = r() * S, rad = 20 + r() * 60, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(70,64,52,0.2)'); gr.addColorStop(1, 'rgba(70,64,52,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    const hn = tnoise(9, 64), hm = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) hm.data[i * 4] = hm.data[i * 4 + 1] = hm.data[i * 4 + 2] = 120 + hn((i % S) / S, Math.floor(i / S) / S) * 40; hg.putImageData(hm, 0, 0);
    [0, S / 2].forEach((p) => { g.fillStyle = 'rgba(55,52,46,0.9)'; g.fillRect(p - 2, 0, 4, S); g.fillRect(0, p - 2, S, 4); hg.fillStyle = '#000'; hg.fillRect(p - 3, 0, 6, S); hg.fillRect(0, p - 3, S, 6); });
    g.strokeStyle = 'rgba(50,46,40,0.7)'; g.lineWidth = 1.2; let x = S * 0.7, y = S * 0.1; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 10; j++) { x += (r() - 0.4) * 18; y += r() * 20; g.lineTo(x, y); } g.stroke();
  });
  const grassT = texPair(512, (g, hg, S) => {
    g.fillStyle = '#4c8a33'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 11, 0.55, 4, 4); const r = rng(12);
    const cs = ['#5f9c3c', '#3f7428', '#6eac46', '#4a8030', '#80b852', '#386823', '#93c45c'];
    g.lineWidth = 1.3; hg.lineWidth = 1.3;
    for (let i = 0; i < 14000; i++) { const x = r() * S, y = r() * S, l = 3 + r() * 7, a = -PI / 2 + (r() - 0.5) * 1.0, ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
      g.strokeStyle = cs[(r() * cs.length) | 0]; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); hg.strokeStyle = `rgba(255,255,255,${0.3 + r() * 0.5})`; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(ex, ey); hg.stroke(); }
  });
  const sidingT = texPair(512, (g, hg, S) => {
    const n = 8, lh = S / n;
    for (let k = 0; k < n; k++) { const y = k * lh, gr = g.createLinearGradient(0, y, 0, y + lh); gr.addColorStop(0, '#f6f4f0'); gr.addColorStop(0.82, '#dedbd4'); gr.addColorStop(1, '#9f9c96'); g.fillStyle = gr; g.fillRect(0, y, S, lh);
      const h2 = hg.createLinearGradient(0, y, 0, y + lh); h2.addColorStop(0, '#303030'); h2.addColorStop(0.92, '#d0d0d0'); h2.addColorStop(1, '#ffffff'); hg.fillStyle = h2; hg.fillRect(0, y, S, lh);
      g.fillStyle = 'rgba(50,46,42,0.6)'; g.fillRect(0, y + lh - 3, S, 3); }
    noiseOver(g, S, S, 22, 0.14, 16, 3); const r = rng(23);
    for (let k = 0; k < n; k++) { const x = r() * S; g.fillStyle = 'rgba(70,66,60,0.6)'; g.fillRect(x, k * lh, 2, lh); hg.fillStyle = '#000'; hg.fillRect(x, k * lh, 3, lh); }
    const gr2 = fbm(24, 32, 3), im = g.getImageData(0, 0, S, S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const k = 0.94 + 0.08 * Math.sin((x / S) * 60 + gr2(x / S, y / S) * 9), i = (y * S + x) * 4; im.data[i] *= k; im.data[i + 1] *= k; im.data[i + 2] *= k; } g.putImageData(im, 0, 0);
  });
  // one shingle course per tile (canvas bottom = butt edge = down-slope)
  const shingleT = texPair(512, (g, hg, S) => {
    g.fillStyle = '#909090'; g.fillRect(0, 0, S, S); const r = rng(31);
    for (let i = 0; i < 22000; i++) { const x = r() * S, y = r() * S, v = 80 + r() * 130; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1.8, 1.8); hg.fillStyle = `rgba(255,255,255,${r() * 0.6})`; hg.fillRect(x, y, 1.8, 1.8); }
    const tabs = 5, tw = S / tabs;
    for (let k = 0; k < tabs; k++) { const t = r(); g.fillStyle = t > 0.5 ? `rgba(255,255,255,${(t - 0.5) * 0.35})` : `rgba(0,0,0,${(0.5 - t) * 0.5})`; g.fillRect(k * tw, 0, tw, S);
      g.fillStyle = 'rgba(15,13,12,0.95)'; g.fillRect(k * tw - 3, S * 0.36, 6, S * 0.64); hg.fillStyle = '#000'; hg.fillRect(k * tw - 5, S * 0.36, 10, S * 0.64); }
    const gr = g.createLinearGradient(0, 0, 0, S * 0.3); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S * 0.3);
    g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, S - 7, S, 7); hg.fillStyle = '#000'; hg.fillRect(0, S - 6, S, 6);
  });
  const brickRT = KIT.bricks(512, 11, { color: '#a1452f' }), brickTT = KIT.bricks(512, 12, { color: '#c39463', mortar: '#8a8378' }), brickDT = KIT.bricks(512, 13, { color: '#7c3426' });
  const stoneT = KIT.bricks(512, 41, { color: '#a7a194', mortar: '#d3cdc0', rows: 6, cols: 3 });
  const boardT = KIT.woodPlanks(512, 51, { rows: 4, tones: ['#c09a6c', '#a88660', '#caa676', '#9c7c58'], knots: 14 });
  const porchT = KIT.woodPlanks(512, 52, { rows: 6, tones: ['#a8693a', '#9a5f33', '#b0703d'], knots: 10 });
  const deckT = KIT.woodPlanks(256, 53, { rows: 4, tones: ['#3a2a20', '#33251c', '#402e22'] });
  const trimT = texPair(256, (g, hg, S) => { g.fillStyle = '#ecebe6'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 3, 0.16, 8, 4); const n = tnoise(4, 32); const im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = 120 + n((i % S) / S, Math.floor(i / S) / S) * 25; hg.putImageData(im, 0, 0); });
  const leafPair = (seed, base, cols, S = 256) => texPair(S, (g, hg) => { g.fillStyle = base; g.fillRect(0, 0, S, S); hg.fillStyle = '#202020'; hg.fillRect(0, 0, S, S); const r = rng(seed);
    for (let i = 0; i < S * 6; i++) { const x = r() * S, y = r() * S, a = r() * 7, s = 2.5 + r() * 5; g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(x, y, s, s * 0.55, a, 0, 7); g.fill(); hg.fillStyle = `rgb(${120 + r() * 135 | 0},0,0)`; hg.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.6})`; hg.beginPath(); hg.ellipse(x, y, s, s * 0.55, a, 0, 7); hg.fill(); } });
  const hedgeT = leafPair(61, '#24521f', ['#2f6a28', '#3d7d2f', '#4a8f36', '#285a22', '#5aa040']);
  const oakT = leafPair(62, '#2a5a24', ['#3a7a2e', '#4b8c34', '#5f9e3c', '#2f6626', '#6aa844']);
  const pineT = texPair(256, (g, hg, S) => { g.fillStyle = '#1d3f26'; g.fillRect(0, 0, S, S); const r = rng(63); g.lineWidth = 1.5; hg.lineWidth = 1.5;
    for (let i = 0; i < 3500; i++) { const x = r() * S, y = r() * S, l = 4 + r() * 8, a = PI / 2 + (r() - 0.5) * 1.4; g.strokeStyle = ['#2b5a33', '#356a3a', '#1f4a2a', '#467a44'][(r() * 4) | 0]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); hg.strokeStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); hg.stroke(); } });
  const barkT = texPair(256, (g, hg, S) => { g.fillStyle = '#5a3f2c'; g.fillRect(0, 0, S, S); const r = rng(64); for (let i = 0; i < 160; i++) { const x = r() * S, w = 2 + r() * 5; g.fillStyle = `rgba(${r() < 0.5 ? '30,18,10' : '120,95,70'},${0.3 + r() * 0.4})`; g.fillRect(x, 0, w, S); hg.fillStyle = r() < 0.5 ? '#000' : '#fff'; hg.fillRect(x, 0, w, S); } noiseOver(g, S, S, 65, 0.3, 8, 4); });
  const doorT = texPair(256, (g, hg, S, H) => { g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, S, H); noiseOver(g, S, H, 66, 0.1, 8, 3);
    [[28, 28, 88, 190], [140, 28, 88, 190], [28, 260, 88, 220], [140, 260, 88, 220]].forEach(([x, y, w, h]) => { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(x + 9, y + 9, w - 18, h - 18); hg.fillStyle = '#202020'; hg.fillRect(x, y, w, h); hg.fillStyle = '#b0b0b0'; hg.fillRect(x + 9, y + 9, w - 18, h - 18); }); }, { h: 512 });
  const louvT = texPair(128, (g, hg, S) => { for (let k = 0; k < 16; k++) { const y = k * S / 16, gr = g.createLinearGradient(0, y, 0, y + S / 16); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8a8a8a'); g.fillStyle = gr; g.fillRect(0, y, S, S / 16); hg.fillStyle = '#fff'; hg.fillRect(0, y, S, S / 32); hg.fillStyle = '#000'; hg.fillRect(0, y + S / 32, S, S / 32); } g.fillStyle = '#bbb'; g.fillRect(0, 0, S, 8); g.fillRect(0, S - 8, S, 8); g.fillRect(0, 0, 8, S); g.fillRect(S - 8, 0, 8, S); });
  // window interiors (warm rooms with curtains), seen in the gaps between the boards
  const roomC = (wall, cur) => { const c = cnv(128, 160), g = c.getContext('2d'), gr = g.createRadialGradient(64, 70, 4, 64, 80, 110); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(0.5, wall); gr.addColorStop(1, '#5a2a10'); g.fillStyle = gr; g.fillRect(0, 0, 128, 160);
    g.fillStyle = cur; g.fillRect(0, 0, 30, 160); g.fillRect(98, 0, 30, 160); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 4; x < 30; x += 7) { g.fillRect(x, 0, 2, 160); g.fillRect(98 + x, 0, 2, 160); } g.fillStyle = cur; g.fillRect(0, 0, 128, 16);
    g.fillStyle = 'rgba(60,25,10,0.7)'; g.fillRect(40, 120, 50, 40); g.beginPath(); g.arc(64, 60, 10, 0, 7); g.fillStyle = '#fff6d0'; g.fill(); return c; };
  const glassM = [roomC('#f0a050', '#9a2a1c'), roomC('#e8b060', '#2a4a8a'), roomC('#f4c070', '#3a6a2a')].map((c) => { const t = tex(c); return SM({ map: t, emissiveMap: t, emissive: C('#ffffff'), emissiveIntensity: 1.6, roughness: 0.12, metalness: 0.1 }); });
  const asphalt = pbr(asphaltT.c, asphaltT.h, { rough: 0.9, bump: 4, repeat: [1 / 10, 1 / 10] });

  // ---------- materials ----------
  const P = (t, o) => pbr(t.c, t.h, o);
  const M = {
    asphalt, conc: P(concreteT, { rough: 0.9, bump: 3, repeat: [1 / 6, 1 / 6] }), grass: P(grassT, { rough: 1, bump: 5, repeat: [1 / 5, 1 / 5] }),
    brickR: P(brickRT, { rough: 0.9, bump: 5, repeat: [1 / 4.5, 1 / 4.5] }), brickT: P(brickTT, { rough: 0.9, bump: 5, repeat: [1 / 4.5, 1 / 4.5] }), brickD: P(brickDT, { rough: 0.9, bump: 5, repeat: [1 / 4.5, 1 / 4.5] }),
    stone: P(stoneT, { rough: 0.92, bump: 5, repeat: [1 / 7, 1 / 7] }), board: P(boardT, { rough: 0.85, bump: 4, repeat: [1 / 6, 1 / 3.6] }),
    porch: P(porchT, { rough: 0.7, bump: 3, repeat: [1 / 6, 1 / 6] }), deck: P(deckT, { rough: 0.9, bump: 2, repeat: [1 / 4, 1 / 4] }),
    trimW: P(trimT, { rough: 0.6, bump: 1, repeat: [1 / 3, 1 / 3] }), hedge: P(hedgeT, { rough: 1, bump: 5 }), bark: P(barkT, { rough: 0.95, bump: 4, repeat: [1, 1] }),
    oak: P(oakT, { rough: 0.95, bump: 4, repeat: [2, 2] }), pine: P(pineT, { rough: 0.95, bump: 4, repeat: [2, 2] }),
    found: P(stoneT, { rough: 0.95, bump: 4, repeat: [1 / 4, 1 / 4] }),
    gutter: SM({ color: '#d8d6d0', roughness: 0.4, metalness: 0.3 }), metal: SM({ color: '#2a3330', roughness: 0.45, metalness: 0.7 }),
    nail: SM({ color: '#45454c', roughness: 0.35, metalness: 0.85 }), brass: SM({ color: '#c9a35a', roughness: 0.3, metalness: 0.85 }),
    soil: SM({ color: '#3a2618', roughness: 1 }), terra: SM({ color: '#b5603a', roughness: 0.8 }), ridge: SM({ color: '#2c2a2c', roughness: 0.85 }),
    paintY: SM({ color: '#e9c13a', roughness: 0.65 }), paintW: SM({ color: '#e8e6e0', roughness: 0.65 }), tyre: SM({ color: '#18181a', roughness: 0.85 }),
    chrome: SM({ color: '#d8dbe0', roughness: 0.18, metalness: 0.95 }), glassCar: new T.MeshPhysicalMaterial({ color: '#1a2633', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55, clearcoat: 1 }),
    seat: SM({ color: '#4a3a30', roughness: 0.8 }), lampGlow: SM({ color: '#ffd9a0', emissive: C('#ffb050'), emissiveIntensity: 4, roughness: 0.4 }),
    bronze: SM({ color: '#b07a34', roughness: 0.32, metalness: 0.6, side: T.DoubleSide }),
  };
  M.oak.flatShading = true; M.pine.flatShading = true; M.hedge.normalScale.set(1.5, 1.5);
  [M.oak, M.pine].forEach((m) => { m.color.set('#ffffff'); });
  const sidingBase = P(sidingT, { rough: 0.72, bump: 3, repeat: [1 / 4, 1 / 4] }), siding = (c) => { const m = sidingBase.clone(); m.color.set(c); return m; };
  const shBase = P(shingleT, { rough: 0.9, bump: 4, repeat: [1 / 4, 1] }), shingle = (c) => { const m = shBase.clone(); m.color.set(c); return m; };
  const doorBase = P(doorT, { rough: 0.45, bump: 2, repeat: [1 / 3.6, 1 / 8] }), doorM = (c) => { const m = doorBase.clone(); m.color.set(c); return m; };
  const louvBase = pbr(louvT.c, louvT.h, { rough: 0.6, bump: 2 }), louv = (c) => { const m = louvBase.clone(); m.color.set(c); return m; };

  // ---------- ground: road, curbs, sidewalks, lawns ----------
  BX(240, 0.4, 12, M.asphalt, 0, RY - 0.2, 0);
  [-1, 1].forEach((s) => {
    BX(240, 0.6, 2.6, M.conc, 0, -0.3, s * 7.7);
    BX(240, 0.75, 0.5, M.conc, 0, -0.355, s * 6.2).material = M.conc;
    const gp = new T.Mesh(planeW(1400, 400), M.grass); gp.rotation.x = -PI / 2; gp.position.set(0, 0, s * (9 + 200)); scene.add(gp);
  });
  // paint: double yellow centre, white edges, crosswalk, parking box
  [-0.22, 0.22].forEach((z) => { const p = new T.Mesh(planeW(240, 0.22), M.paintY); p.rotation.x = -PI / 2; p.position.set(0, RY + 0.012, z); scene.add(p); });
  [-5.4, 5.4].forEach((z) => { for (let x = -118; x < 118; x += 6) { const p = new T.Mesh(planeW(3.4, 0.2), M.paintW); p.rotation.x = -PI / 2; p.position.set(x, RY + 0.012, z); scene.add(p); } });
  for (let z = -5; z <= 5; z += 1.4) { const p = new T.Mesh(planeW(3.4, 0.8), M.paintW); p.rotation.x = -PI / 2; p.position.set(-62, RY + 0.013, z); scene.add(p); }
  [[63.6, -3.4, 0.25, 5], [76.4, -3.4, 0.25, 5], [70, -0.95, 13, 0.25]].forEach(([x, z, w, d]) => { const p = new T.Mesh(planeW(w, d), M.paintW); p.rotation.x = -PI / 2; p.position.set(x, RY + 0.013, z); scene.add(p); });
  { const c = cnv(256, 256), g = c.getContext('2d'); g.fillStyle = '#3c3c40'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#1c1c1e'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke(); for (let k = 0; k < 9; k++) { g.fillStyle = '#26262a'; g.fillRect(28 + k * 23, 40, 9, 176); } g.font = 'bold 26px Georgia'; g.fillStyle = '#56565c'; g.textAlign = 'center'; g.fillText('SEWER', 128, 34);
    const mh = SM({ map: tex(c), roughness: 0.5, metalness: 0.6 }); [[-74, 2.6], [-22, -2.6], [30, 2.6], [88, -2.6], [-104, -2.6]].forEach(([x, z]) => CY(1.15, 1.15, 0.08, mh, x, RY + 0.02, z, scene, 28)); }
  // storm drains
  [-40, 6, 52].forEach((x) => [-1, 1].forEach((s) => { BX(2.4, 0.5, 0.16, M.metal, x, RY + 0.2, s * 5.96); }));

  // ---------- instanced little things ----------
  const tuftG = new T.ConeGeometry(0.22, 0.7, 5); tuftG.translate(0, 0.3, 0);
  const tuftM = SM({ color: '#ffffff', roughness: 1 }), tr = rng(91);
  for (let i = 0; i < 2600; i++) { const x = -118 + tr() * 236, s = tr() < 0.5 ? -1 : 1, z = s * (9.2 + tr() * 30); if (Math.abs(z) > 14.5 && Math.abs(z) < 36 && tr() < 0.75) continue;
    inst('tuft', tuftG, tuftM, M4(x, 0, z, (tr() - 0.5) * 0.4, tr() * 6, (tr() - 0.5) * 0.4, 0.8 + tr(), 0.6 + tr() * 0.9, 0.8 + tr()), C(['#3f7a2a', '#5a9a3a', '#4d8a30', '#6aa848'][(tr() * 4) | 0])); }
  const flowerG = new T.IcosahedronGeometry(0.15, 1), flowerM = SM({ color: '#ffffff', roughness: 0.7 });
  const FLC = ['#e84a5f', '#f6c445', '#f08ab8', '#ffffff', '#9a6ad8', '#ff8a3a'].map(C);

  // ---------- windows (with boards) ----------
  const nailG = new T.CylinderGeometry(0.06, 0.06, 0.06, 8); nailG.rotateX(PI / 2);
  let winSeed = 1;
  function windowAt(par, x, yc, w, h, o = {}) {
    const z = o.z || 0, r = rng(winSeed++ * 13 + 7);
    const gl = new T.Mesh(new T.PlaneGeometry(w, h), o.glass || glassM[(winSeed + (o.gi || 0)) % 3]); gl.position.set(x, yc, z + 0.04); gl.userData.noCast = true; par.add(gl);
    BX(0.14, h, 0.1, M.trimW, x, yc, z + 0.1, par); BX(w, 0.14, 0.1, M.trimW, x, yc + h * 0.08, z + 0.1, par);
    const t = 0.38;
    BX(t, h, 0.32, M.trimW, x - w / 2 - t / 2, yc, z + 0.16, par); BX(t, h, 0.32, M.trimW, x + w / 2 + t / 2, yc, z + 0.16, par);
    BX(w + 2 * t, t, 0.32, M.trimW, x, yc + h / 2 + t / 2, z + 0.16, par);
    BX(w + 2 * t + 0.5, 0.24, 0.75, M.trimW, x, yc - h / 2 - 0.12, z + 0.36, par);
    BX(w + 2 * t + 0.45, 0.32, 0.5, M.trimW, x, yc + h / 2 + t + 0.16, z + 0.24, par);
    if (o.shut) [-1, 1].forEach((s) => BX(w * 0.44, h + 0.3, 0.15, o.shut, x + s * (w / 2 + t + w * 0.22 + 0.06), yc, z + 0.1, par));
    if (o.box) { BX(w + 0.6, 0.7, 0.9, o.box, x, yc - h / 2 - 0.6, z + 0.6, par); for (let k = 0; k < 9; k++) inst('fl', flowerG, flowerM, par.matrixWorld.clone().multiply(M4(x - w / 2 + 0.1 + r() * w, yc - h / 2 - 0.12 + r() * 0.25, z + 0.4 + r() * 0.5)), FLC[(r() * 6) | 0]); }
    // boards
    const bg = new T.Group(); par.add(bg); props.boards.push(bg);
    const n = Math.max(3, Math.round((h + 0.4) / 1.1)), bh = (h + 0.4 - (n - 1) * 0.2) / n, nails = [];
    let y = yc - h / 2 - 0.2;
    for (let i = 0; i < n; i++) { const L = w + 1.1 + r() * 0.5, hh = bh + (r() - 0.5) * 0.12, cx = x + (r() - 0.5) * 0.35, rz = (r() - 0.5) * 0.06;
      const p = BX(L, hh, 0.16, M.board, cx, y + hh / 2, z + 0.48, bg); p.rotation.z = rz;
      [-1, 1].forEach((s) => nails.push(M4(cx + s * (L / 2 - 0.3), y + hh / 2 + s * Math.sin(rz) * (L / 2 - 0.3) + (r() - 0.5) * 0.1, z + 0.58)));
      y += hh + 0.12 + r() * 0.16; }
    if (r() < 0.4) { const L = Math.hypot(w, h) + 0.5, s = r() < 0.5 ? 1 : -1, p = BX(L, 0.75, 0.16, M.board, x, yc, z + 0.66, bg); p.rotation.z = s * Math.atan2(h, w); nails.push(M4(x, yc, z + 0.76)); }
    const im = new T.InstancedMesh(nailG, M.nail, nails.length); nails.forEach((m, i) => im.setMatrixAt(i, m)); bg.add(im);
    return gl;
  }

  // ---------- sloped roof surfaces (real shingle courses) ----------
  // a slope whose low edge (eave) is P0, rising along up=(0,sin a,-f cos a), width RW centred at cx
  function slope(par, cx, RW, P0, a, Ls, f, shM) {
    const up = V(0, Math.sin(a), -f * Math.cos(a)), n = V(0, Math.cos(a), f * Math.sin(a));
    const deck = BX(RW, 0.35, Ls, M.deck, 0, 0, 0, par); deck.position.copy(P0).addScaledVector(up, Ls / 2).addScaledVector(n, -0.18); deck.position.x = cx; deck.rotation.x = f * a;
    const N = Math.ceil((Ls - 0.25) / 0.72);
    for (let i = 0; i < N; i++) { const s = Math.min(i * 0.72 + 0.5, Ls - 0.5), row = BX(RW + 0.02, 0.09, 1.0, shM, 0, 0, 0, par);
      row.position.copy(P0).addScaledVector(up, s).addScaledVector(n, 0.1); row.position.x = cx + (i % 2) * 0.4 - 0.2; if (f > 0) row.rotation.x = a - 0.1; else row.rotation.set(-(a - 0.1), PI, 0); }
    return { P0: P0.clone().setX(cx), up, n, a, Ls, surf: (x, s, lift = 0.22) => P0.clone().addScaledVector(up, s).addScaledVector(n, lift).setX(x) };
  }
  function gableRoof(g, W, D, H1, Rr, shM, wallM, OH = 1.2, side = 0.9) {
    const a = Math.atan2(Rr, D / 2), Ls = Math.hypot(Rr, D / 2) + OH / Math.cos(a), RW = W + 2 * side, y0 = H1 - OH * Math.tan(a);
    const fr = slope(g, 0, RW, V(0, y0, OH), a, Ls, 1, shM); slope(g, 0, RW, V(0, y0, -D - OH), a, Ls, -1, shM);
    [fr, { up: V(0, Math.sin(a), Math.cos(a)), n: V(0, Math.cos(a), -Math.sin(a)), P0: V(0, y0, -D - OH) }].forEach((sl, k) => {
      [-1, 1].forEach((sx) => { const rk = BX(0.3, 0.6, Ls, M.trimW, 0, 0, 0, g); rk.position.copy(sl.P0).addScaledVector(sl.up, Ls / 2).addScaledVector(sl.n, -0.08); rk.position.x = sx * (RW / 2 + 0.13); rk.rotation.x = k ? -a : a; });
      const zf = sl.P0.z; BX(RW + 0.55, 0.6, 0.24, M.trimW, 0, y0 - 0.22, zf + (k ? -0.05 : 0.05), g); BX(RW + 0.55, 0.36, 0.42, M.gutter, 0, y0 - 0.5, zf + (k ? -0.3 : 0.3), g);
      BX(RW, 0.15, OH, M.trimW, 0, y0 - 0.45, k ? -D - OH / 2 : OH / 2, g);   // soffit
    });
    RB(RW + 0.3, 0.42, 1.05, 0.18, M.ridge, 0, H1 + Rr + 0.2, -D / 2, g);
    const sh = new T.Shape([new T.Vector2(0, H1), new T.Vector2(D, H1), new T.Vector2(D / 2, H1 + Rr)]);
    const gg = new T.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false }); gg.rotateY(PI / 2);
    [-1, 1].forEach((s) => { const m = new T.Mesh(gg, wallM); m.position.x = s > 0 ? W / 2 - 0.4 : -W / 2; g.add(m);
      const vent = BX(0.2, 1.6, 1.4, M.trimW, s * (W / 2 + 0.05), H1 + Rr * 0.45, -D / 2, g); });
    return fr;
  }

  // ---------- houses ----------
  const houses = {};
  function house(o) {
    const north = o.side > 0, g = new T.Group(); g.position.set(o.X, 0, north ? -16 : 16); g.rotation.y = north ? 0 : PI; scene.add(g); g.updateMatrixWorld();
    const W = o.w, D = 18, H1 = 16, dx = o.door || 0, por = o.porch, base = por && por.h ? por.h : 0, r = rng(o.X * 7 + 101);
    BX(W, H1, D, o.wall, 0, H1 / 2, -D / 2, g);
    BX(W + 0.5, 0.9, D + 0.5, M.found, 0, 0.45, -D / 2, g);
    if (!por) BX(W + 0.25, 0.42, 0.32, M.trimW, 0, 8.9, 0.1, g);
    [-1, 1].forEach((s) => BX(0.6, H1, 0.6, M.trimW, s * W / 2, H1 / 2, 0, g));
    const rf = gableRoof(g, W, D, H1, 5, o.roof, o.wall);
    if (o.chim) { const cx = o.chim * (W / 2 + 1.3); BX(2.6, H1 + 7.5, 3.2, o.chimM || M.brickR, cx, (H1 + 7.5) / 2, -D * 0.55, g); BX(3.1, 0.4, 3.7, M.found, cx, H1 + 7.7, -D * 0.55, g); BX(3.0, 1.2, 3.6, o.chimM || M.brickR, cx, 6.5, -D * 0.55, g);
      [-0.5, 0.5].forEach((dz) => CY(0.35, 0.4, 1.1, M.terra, cx, H1 + 8.4, -D * 0.55 + dz, g, 10)); }
    // door
    const dm = doorM(o.doorC || '#7a2a22');
    BX(3.6, 8, 0.3, dm, dx, base + 4, 0.08, g);
    BX(4.7, 0.5, 0.4, M.trimW, dx, base + 8.25, 0.16, g); [-1, 1].forEach((s) => BX(0.5, 8, 0.4, M.trimW, dx + s * 2.05, base + 4, 0.16, g));
    const kb = new T.Mesh(new T.SphereGeometry(0.18, 12, 8), M.brass); kb.position.set(dx + 1.25, base + 3.8, 0.35); g.add(kb);
    BX(1.2, 0.3, 0.1, M.brass, dx, base + 5.6, 0.26, g);
    [-1, 1].forEach((s) => { RB(0.55, 0.85, 0.55, 0.12, M.lampGlow, dx + s * 2.95, base + 6.3, 0.45, g).userData.noCast = true; BX(0.75, 0.15, 0.75, M.metal, dx + s * 2.95, base + 6.8, 0.45, g); BX(0.2, 0.5, 0.3, M.metal, dx + s * 2.95, base + 6.1, 0.15, g); });
    if (!por) BX(5.6, 0.3, 2.4, M.conc, dx, -0.13, 1.2, g);
    // windows
    const sh = o.shutC ? louv(o.shutC) : null;
    (o.gw || [-5, 5]).forEach((x, i) => windowAt(g, x, base + (o.gy || 4.6), o.gww || 3.6, 4.4, { shut: sh, gi: i, box: o.flowerBox ? M.porch : null }));
    (o.uw || [-5, 0, 5]).forEach((u, i) => { const [x, yc, w, h] = Array.isArray(u) ? u : [u, 12.4, 3.4, 4.2]; windowAt(g, x, yc, w, h, { shut: sh, gi: i + 1 }); });
    // porch
    let pz = 2.4;
    if (por) {
      const pw = por.w, pd = por.d, ph = por.h || 0, px = por.x || 0, top = por.top; pz = pd;
      if (ph > 0) { BX(pw, ph, pd, M.porch, px, ph / 2, pd / 2, g); BX(pw + 0.3, 0.2, pd + 0.3, M.trimW, px, ph - 0.16, pd / 2 + 0.05, g);
        for (let k = 0; k < 3; k++) BX(4.6, ph * (3 - k) / 3, 0.9, M.porch, dx, ph * (3 - k) / 6, pd + 0.45 + k * 0.9, g); pz = pd + 2.7;
        // railing with balusters
        const rail = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0), cxr = (x0 + x1) / 2, czr = (z0 + z1) / 2;
          const tp = BX(L, 0.25, 0.4, M.trimW, cxr, ph + 3.1, czr, g); tp.rotation.y = -ang; const bt = BX(L, 0.2, 0.3, M.trimW, cxr, ph + 0.45, czr, g); bt.rotation.y = -ang;
          for (let t = 0.35; t < L - 0.2; t += 0.55) inst('bal', balG, M.trimW, g.matrixWorld.clone().multiply(M4(x0 + (x1 - x0) * t / L, ph + 1.75, z0 + (z1 - z0) * t / L))); };
        rail(px - pw / 2 + 0.3, pd - 0.3, dx - 2.4, pd - 0.3); rail(dx + 2.4, pd - 0.3, px + pw / 2 - 0.3, pd - 0.3);
        rail(px - pw / 2 + 0.3, 0.5, px - pw / 2 + 0.3, pd - 0.3); rail(px + pw / 2 - 0.3, 0.5, px + pw / 2 - 0.3, pd - 0.3);
        // lattice skirt
        BX(pw, ph, 0.1, M.deck, px, ph / 2, pd + 0.02, g);
      } else BX(pw, 0.3, pd, M.conc, px, -0.13, pd / 2, g);
      const cols = [px - pw / 2 + 0.5, px + pw / 2 - 0.5]; if (pw > 14) cols.push(dx - 2.8, dx + 2.8);
      cols.forEach((x) => { RB(0.75, top - ph, 0.75, 0.12, M.trimW, x, ph + (top - ph) / 2, pd - 0.45, g); BX(1.1, 0.5, 1.1, M.trimW, x, ph + 0.25, pd - 0.45, g); BX(1.05, 0.35, 1.05, M.trimW, x, top - 0.2, pd - 0.45, g); });
      BX(pw + 0.4, 0.7, 0.7, M.trimW, px, top + 0.35, pd - 0.45, g);
      const lowY = top + 0.7, rise = por.wallY - lowY, b = Math.atan2(rise, pd + 0.6);
      g.userData.porchRoof = slope(g, px, pw + 1.2, V(px, lowY, pd + 0.6), b, Math.hypot(rise, pd + 0.6) + 0.1, 1, o.roof);
      BX(pw + 1.4, 0.45, 0.2, M.trimW, px, lowY - 0.1, pd + 0.66, g);
      const cl = RB(0.7, 0.5, 0.7, 0.2, M.lampGlow, px + (dx - px) + 0.0, top + 0.2, pd / 2, g); cl.userData.noCast = true;
    }
    // front yard: path, hedges, flower beds, fence, mailbox
    const yz0 = pz, yz1 = 7.0; BX(3.2, 0.3, yz1 - yz0, M.conc, dx, -0.12, (yz0 + yz1) / 2, g);
    const bedX = (o.gw || [-5, 5]);
    bedX.forEach((x) => { if (por && Math.abs(x - (por.x || 0)) < por.w / 2) return; BX(5.2, 0.35, 1.6, M.soil, x, 0.1, 1.4, g);
      for (let k = 0; k < 3; k++) RB(1.5, 1.4 + r() * 0.5, 1.3, 0.55, M.hedge, x - 1.7 + k * 1.7, 0.85, 1.4, g);
      for (let k = 0; k < 14; k++) inst('fl', flowerG, flowerM, g.matrixWorld.clone().multiply(M4(x - 2.4 + r() * 4.8, 1.6 + r() * 0.6, 2.0 + r() * 0.4)), FLC[(r() * 6) | 0]); });
    if (o.fence) { const pick = (x0, x1) => { for (let x = x0; x <= x1; x += 0.62) inst('pick', pickG, M.trimW, g.matrixWorld.clone().multiply(M4(x, 1.15, 6.7))); const L = x1 - x0, cx = (x0 + x1) / 2; BX(L, 0.25, 0.12, M.trimW, cx, 0.7, 6.62, g); BX(L, 0.25, 0.12, M.trimW, cx, 1.8, 6.62, g); };
      pick(-11.5, dx - 1.9); pick(dx + 1.9, 11.5); [-11.6, dx - 1.9, dx + 1.9, 11.6].forEach((x) => RB(0.4, 2.8, 0.4, 0.06, M.trimW, x, 1.4, 6.7, g)); }
    else for (let x = -11; x < 11; x += 2.2) if (Math.abs(x - dx) > 2.6) RB(2.3, 1.7 + r() * 0.4, 1.4, 0.6, M.hedge, x, 0.9, 6.6, g);
    const mx = dx + 3.4; BX(0.3, 3.4, 0.3, M.porch, mx, 1.7, 6.0, g); const mb = RB(0.95, 1.0, 1.7, 0.4, o.mailM || SM({ color: '#4a6a9a', roughness: 0.4, metalness: 0.3 }), mx, 3.75, 6.0, g);
    BX(0.08, 0.8, 0.25, SM({ color: '#d8302a', roughness: 0.5 }), mx + 0.52, 4.2, 5.7, g);
    houses[o.name || o.X] = { g, rf, o, W, north };
    return houses[o.name || o.X];
  }
  const balG = new T.BoxGeometry(0.18, 2.5, 0.18), pickG = new T.BoxGeometry(0.36, 2.3, 0.1);
  { const pp = pickG.attributes.position; for (let i = 0; i < pp.count; i++) if (pp.getY(i) > 1 && Math.abs(pp.getX(i)) > 0.1) pp.setY(i, 0.9); pickG.computeVertexNormals(); }

  const slate = '#5a5d66';
  // north side (faces +z, front at z=-16)
  house({ X: -72, side: 1, w: 15, wall: siding('#c9b48c'), roof: shingle('#6a5246'), chim: -1, gw: [-4.5, 4.5], uw: [-4.5, 4.5], doorC: '#2c4a6a', fence: true });
  house({ X: -48, side: 1, w: 16, wall: siding('#9fbf9c'), roof: shingle('#5e4a42'), chim: -1, shutC: '#2e4a32', doorC: '#c8a040', fence: true, uw: [-5, 0, 5],
    porch: { w: 9, d: 5.5, h: 0, top: 7.6, wallY: 8.6, x: -1 }, door: -1, gw: [-5.6, 4.8] });
  house({ name: 'grandma', X: -24, side: 1, w: 16, wall: siding('#ead690'), roof: shingle('#8a4a36'), chim: 1, doorC: '#3a6a4a', shutC: '#5a7a4a', uw: [[-4.6, 13.2, 3.2, 3.8], [4.6, 13.2, 3.2, 3.8]],
    porch: { w: 15, d: 8, h: 1.0, top: 9.2, wallY: 10.7 }, gw: [-4.8, 4.8] });
  house({ name: 'ours', X: 0, side: 1, w: 18, wall: M.brickR, chimM: M.brickD, roof: shingle(slate), chim: -1, doorC: '#2a5a8a', shutC: '#26303e', gw: [-5], uw: [[-5, 12.2, 3.4, 4.2], [4, 11.5, 4.5, 5]],
    porch: { w: 17, d: 6.6, h: 0, top: 7.5, wallY: 8.85 }, fence: true });
  house({ X: 24, side: 1, w: 15, wall: siding('#8fb4d8'), roof: shingle('#3e3e46'), chim: 1, shutC: '#f0f0ea', doorC: '#e8e4dc', gw: [-4, 4], uw: [-4, 4], flowerBox: true });
  house({ X: 48, side: 1, w: 16, wall: M.brickT, chimM: M.brickT, roof: shingle('#5e3b2c'), chim: 1, doorC: '#4a2a1a', gw: [-5, 5], porch: { w: 8, d: 5, h: 0, top: 7.6, wallY: 8.6 }, fence: true });
  // south side (faces -z, front at z=+16)
  house({ X: -60, side: -1, w: 15, wall: siding('#b8c4d0'), roof: shingle('#4a4a52'), chim: 1, gw: [-4.5, 4.5], uw: [-4.5, 4.5], doorC: '#8a2a2a' });
  house({ X: -36, side: -1, w: 16, wall: siding('#ece6d8'), roof: shingle('#47505e'), chim: -1, shutC: '#2e5a3a', doorC: '#2e5a3a', fence: true, porch: { w: 10, d: 5.5, h: 0, top: 7.6, wallY: 8.6 } });
  house({ X: -12, side: -1, w: 16, wall: siding('#dc9478'), roof: shingle('#4a3a34'), chim: 1, doorC: '#f2efe6', gw: [-5, 5], uw: [-5, 5], flowerBox: true });
  house({ X: 12, side: -1, w: 16, wall: siding('#aaa4c8'), roof: shingle('#3e3a4a'), chim: -1, shutC: '#3a3458', doorC: '#d8b040', fence: true });
  house({ X: 36, side: -1, w: 16, wall: M.brickD, chimM: M.brickD, roof: shingle('#56565e'), chim: 1, doorC: '#1e3a2a', gw: [-5, 5], porch: { w: 9, d: 5, h: 0, top: 7.6, wallY: 8.6 } });
  house({ X: 60, side: -1, w: 15, wall: siding('#d8c8a8'), roof: shingle('#5a4038'), chim: -1, gw: [-4.5, 4.5], uw: [-4.5, 4.5], doorC: '#3a4a7a', fence: true });

  // ---------- OUR roof: chalk GO AWAY + loose shingles ----------
  const ours = houses.ours, og = ours.g, rf = ours.rf;   // og at (0,0,-16), no rotation: local = world - (0,0,-16)
  const chalkInfo = {};
  const chalkTex = KIT.textTex(2048, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.font = '900 340px "Arial Black", "Arial", sans-serif'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const txt = 'GO AWAY', tw = g.measureText(txt).width + 6 * 30, r = rng(5); let x = (w - tw) / 2; const by = 420;
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const ch of txt) { const cw = g.measureText(ch).width; if (ch !== ' ') { const rot = (r() - 0.5) * 0.12, dy = (r() - 0.5) * 30;
        g.save(); g.translate(x + cw / 2, by + dy); g.rotate(rot);
        for (let k = 0; k < 9; k++) { g.strokeStyle = `rgba(248,248,240,${0.16 + r() * 0.14})`; g.lineWidth = 14 + r() * 14; g.strokeText(ch, -cw / 2 + (r() - 0.5) * 14, (r() - 0.5) * 14); }
        g.fillStyle = 'rgba(248,248,240,0.35)'; g.fillText(ch, -cw / 2, 0); g.restore(); if (ch === 'Y') { chalkInfo.u = (x + cw / 2) / w; chalkInfo.v = (by + dy) / h; } }
      x += cw + 30; }
    // scribble underline + smudges
    g.strokeStyle = 'rgba(248,248,240,0.4)'; g.lineWidth = 12; g.beginPath(); g.moveTo(w * 0.12, 470); for (let k = 0; k <= 12; k++) g.lineTo(w * 0.12 + k * w * 0.064, 470 + (r() - 0.5) * 18); g.stroke();
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 22000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.6})`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 1 + r() * 2); } g.globalCompositeOperation = 'source-over';
  });
  chalkTex.anisotropy = 16;
  const CPW = 17, CPH = 4.25, CS = 4.9;   // chalk plane size + centre distance up the slope from the eave edge
  const chalk = new T.Mesh(new T.PlaneGeometry(CPW, CPH), SM({ map: chalkTex, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, emissive: C('#ffffff'), emissiveMap: chalkTex, emissiveIntensity: 0.08 }));
  chalk.position.copy(rf.surf(-0.5, CS, 0.27)); chalk.rotation.x = -(PI / 2 - rf.a); chalk.userData.noCast = true; chalk.renderOrder = 5; og.add(chalk); props.chalk = chalk;
  { const sr = rng(77), lm = shingle('#6c707a');
    for (let i = 0; i < 9; i++) { const x = -7.5 + sr() * 15, s = i % 3 ? 7.6 + sr() * 3 : 0.4 + sr() * 2, p = new T.Mesh(uvBox(new T.BoxGeometry(1.0, 0.09, 0.95), 1.0, 0.09, 0.95), lm);
      p.position.copy(rf.surf(x, s, 0.26 + sr() * 0.04)); p.rotation.set(rf.a - 0.12 - sr() * 0.1, (sr() - 0.5) * 0.3, (sr() - 0.5) * 0.1); og.add(p); props.shingles.push(p); p.userData.rest = { p: p.position.clone(), r: p.rotation.clone() }; } }

  // ---------- Grandma's porch jungle ----------
  const gm = houses.grandma.g;   // at (-24,0,-16)
  const leafTex = (draw, w = 256, h = 256) => { const c = cnv(w, h), g = c.getContext('2d'); draw(g, w, h); const t = tex(c); return t; };
  const monsT = leafTex((g, w, h) => { g.fillStyle = '#2f7d34'; g.beginPath(); g.moveTo(128, 250); g.bezierCurveTo(-10, 210, -10, 30, 128, 8); g.bezierCurveTo(266, 30, 266, 210, 128, 250); g.fill();
    g.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 5; k++) { const y = 50 + k * 38; [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(128 + s * 30, y + 8); g.lineTo(128 + s * 140, y - 14); g.lineTo(128 + s * 140, y + 2); g.lineTo(128 + s * 36, y + 16); g.fill(); g.beginPath(); g.ellipse(128 + s * 22, y + 20, 5, 9, 0, 0, 7); g.fill(); }); }
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, 'rgba(120,200,90,0.35)'); gr.addColorStop(1, 'rgba(0,30,0,0.3)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#9ad87a'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 250); g.lineTo(128, 14); g.stroke(); g.lineWidth = 1.5; for (let k = 0; k < 7; k++) { [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(128, 60 + k * 26); g.lineTo(128 + s * 100, 40 + k * 26); g.stroke(); }); } });
  const fernT = leafTex((g, w, h) => { g.strokeStyle = '#4a8a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(32, h); g.lineTo(32, 4); g.stroke();
    for (let y = 8; y < h - 6; y += 9) { const l = 28 * Math.sin((y / h) * PI) + 4; g.fillStyle = y % 18 ? '#4f9a34' : '#3c8228'; [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(32 + s * l * 0.55, y + 2, l * 0.55, 3.6, s * 0.35, 0, 7); g.fill(); }); } }, 64, 256);
  const leafMat = (t, c) => SM({ map: t, alphaTest: 0.5, side: T.DoubleSide, roughness: 0.55, color: C(c || '#ffffff') });
  const monsM = leafMat(monsT), fernM = leafMat(fernT), fernM2 = leafMat(fernT, '#b8e090');
  const monsG = new T.PlaneGeometry(2.6, 2.8); monsG.translate(0, 1.4, 0);
  const fernG = new T.PlaneGeometry(0.75, 3.2, 1, 6); fernG.translate(0, 1.6, 0); { const p = fernG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -0.09 * y * y); } fernG.computeVertexNormals(); }
  const stemM = SM({ color: '#4a8a30', roughness: 0.7 });
  const pot = (par, x, y, z, r, h, m) => { m = m || M.terra; CY(r, r * 0.78, h, m, x, y + h / 2, z, par, 20); CY(r * 1.08, r * 1.08, h * 0.16, m, x, y + h * 0.92, z, par, 20); CY(r * 0.95, r * 0.95, 0.06, M.soil, x, y + h * 0.95, z, par, 16); return y + h * 0.95; };
  const pr = rng(303);
  function monstera(par, x, y, z, s = 1, potM) { const t = pot(par, x, y, z, 0.9 * s, 1.5 * s, potM); for (let k = 0; k < 8; k++) { const a = (k / 8) * PI * 2 + pr() * 0.5, tilt = 0.5 + pr() * 0.6, L = (1.2 + pr() * 1.4) * s;
      const st = CY(0.05, 0.06, L, stemM, 0, 0, 0, par, 5); st.position.set(x + Math.sin(a) * L * 0.35, t + L * 0.45, z + Math.cos(a) * L * 0.35); st.rotation.set(Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6);
      const lf = new T.Mesh(monsG, monsM); lf.position.set(x + Math.sin(a) * L * 0.7, t + L * 0.85, z + Math.cos(a) * L * 0.7); lf.rotation.set(0, a, 0); lf.rotateX(tilt); lf.scale.setScalar(s * (0.8 + pr() * 0.4)); par.add(lf); } }
  function fern(par, x, y, z, s = 1, potM, hang) { const t = hang ? y : pot(par, x, y, z, 0.75 * s, 1.2 * s, potM); for (let k = 0; k < 16; k++) { const a = (k / 16) * PI * 2 + pr() * 0.3, f = new T.Mesh(fernG, k % 3 ? fernM : fernM2);
      f.position.set(x, t, z); f.rotation.set(0, a, 0); f.rotateX((hang ? 1.5 : 0.55) + pr() * 0.6); f.scale.setScalar(s * (0.7 + pr() * 0.5)); par.add(f); } }
  function bloom(par, x, y, z, s = 1, potM) { const t = pot(par, x, y, z, 0.7 * s, 1.1 * s, potM); RB(1.7 * s, 1.3 * s, 1.7 * s, 0.6 * s, M.hedge, x, t + 0.5 * s, z, par);
    for (let k = 0; k < 40; k++) { const a = pr() * 7, rr = pr() * 0.85 * s; inst('fl', flowerG, flowerM, par.matrixWorld.clone().multiply(M4(x + Math.cos(a) * rr, t + 0.6 * s + pr() * 0.65 * s, z + Math.sin(a) * rr, 0, 0, 0, 0.9, 0.9, 0.9)), FLC[(pr() * 6) | 0]); } }
  function snake(par, x, y, z) { const t = pot(par, x, y, z, 0.55, 1.0, SM({ color: '#e8e2d4', roughness: 0.4 })); for (let k = 0; k < 9; k++) { const b = BX(0.32, 1.6 + pr() * 1.3, 0.06, SM({ color: k % 2 ? '#3a6a2c' : '#5a8a3a', roughness: 0.6 }), x + (pr() - 0.5) * 0.6, 0, z + (pr() - 0.5) * 0.6, par); b.position.y = t + b.geometry.parameters.height / 2; b.rotation.set((pr() - 0.5) * 0.3, pr() * 3, (pr() - 0.5) * 0.3); } }
  const glazeB = SM({ color: '#2f6a9a', roughness: 0.3 }), glazeY = SM({ color: '#e0b84a', roughness: 0.35 }), glazeW = SM({ color: '#efe9dc', roughness: 0.3 });
  const PF = 1.0;   // porch floor
  monstera(gm, -6.0, PF, 2.0, 1.15); monstera(gm, 6.2, PF, 1.8, 1.0, glazeB); monstera(gm, -6.3, PF, 6.6, 0.85, glazeW);
  fern(gm, -3.6, PF, 1.2, 1.1); fern(gm, 3.2, PF, 1.1, 1.0, glazeY); fern(gm, 6.4, PF, 5.0, 0.9);
  bloom(gm, -4.5, PF, 6.8, 0.9, glazeY); monstera(gm, -6.6, PF, 4.3, 1.3, glazeY); fern(gm, 6.6, PF, 3.3, 1.2, glazeW); bloom(gm, -1.8, PF, 7.3, 0.7, glazeB); fern(gm, 6.3, 4.4, 0.3, 0.7); monstera(gm, 5.0, PF, 7.0, 0.7, glazeW); bloom(gm, 4.6, PF, 6.9, 0.8); snake(gm, -2.0, PF, 0.9); snake(gm, 2.4, PF, 0.9);
  bloom(gm, 4.0, 4.4, 7.65, 0.55); bloom(gm, -6.2, 4.4, 7.65, 0.55, glazeB);   // on the railing
  [-4.5, 4.5].forEach((x) => { const hy = 7.4; CY(0.02, 0.02, 1.8, M.metal, x, hy + 1.0, 4.0, gm, 4); CY(0.6, 0.35, 0.6, SM({ color: '#8a6a3a', roughness: 0.9 }), x, hy - 0.2, 4.0, gm, 14); fern(gm, x, hy, 4.0, 0.7, null, true); });
  // the hero pot (grandma waters it) + tiny cactus
  const gPot = new T.Group(); gPot.position.set(1.8, PF, 5.6); gm.add(gPot); gPot.updateMatrixWorld(); props.grandmaPot = gPot; monstera(gPot, 0, 0, 0, 0.75, glazeB);
  const cac = new T.Group(); cac.position.set(3.4, PF, 5.4); gm.add(cac); props.cactus = cac;
  BX(0.9, 1.3, 0.9, M.porch, 0, 0.65, 0, cac); pot(cac, 0, 1.3, 0, 0.3, 0.45, glazeY);
  const cacM = SM({ color: '#4c8c4a', roughness: 0.55 }); const cb = new T.Mesh(new T.CapsuleGeometry(0.17, 0.32, 6, 12), cacM); cb.position.set(0, 1.97, 0); cac.add(cb);
  const arm = new T.Mesh(new T.CapsuleGeometry(0.08, 0.14, 4, 8), cacM); arm.position.set(0.2, 2.0, 0); arm.rotation.z = -0.5; cac.add(arm);
  const fl = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), SM({ color: '#ff6fa8', roughness: 0.5 })); fl.position.set(0, 2.38, 0); cac.add(fl);
  // rocking chair
  { const rc = new T.Group(); rc.position.set(-3.6, PF, 3.4); rc.rotation.y = 0.35; gm.add(rc); const wd = M.porch;
    [-0.9, 0.9].forEach((x) => { const rg = new T.TorusGeometry(3.2, 0.1, 6, 20, 0.85); rg.rotateZ(-PI / 2 - 0.425); rg.rotateY(PI / 2); const rk = new T.Mesh(rg, wd); rk.position.set(x, 3.3, 0); rc.add(rk);
      BX(0.16, 1.6, 0.16, wd, x, 1.0, 0.8, rc); BX(0.16, 4.0, 0.16, wd, x, 2.2, -0.9, rc).rotation.x = -0.15; BX(0.18, 0.16, 1.9, wd, x, 2.9, 0.05, rc); });
    BX(2.0, 0.2, 1.9, wd, 0, 1.85, 0, rc); for (let k = 0; k < 5; k++) BX(0.24, 2.4, 0.1, wd, -0.7 + k * 0.35, 3.2, -0.95, rc).rotation.x = -0.15; BX(2.1, 0.3, 0.16, wd, 0, 4.3, -1.15, rc);
    RB(1.8, 0.3, 1.6, 0.14, SM({ color: '#c0503a', roughness: 0.95 }), 0, 2.07, 0.05, rc); }
  // doormat + watering can stand-in pot cluster on the steps
  BX(3, 0.06, 1.8, SM({ color: '#8a6a3a', roughness: 1 }), 0, PF + 0.03, 1.4, gm);
  pot(gm, -2.6, PF, 7.4, 0.4, 0.6, glazeW); pot(gm, 2.6, 0, 9.6, 0.5, 0.8); fern(gm, 2.6, 0, 9.6, 0.6, null); bloom(gm, -2.6, 0, 9.8, 0.6);

  // ---------- clocks ----------
  const clockTex = (roman) => KIT.textTex(512, 512, (g) => { g.fillStyle = '#f1e8cf'; g.beginPath(); g.arc(256, 256, 255, 0, 7); g.fill();
    const gr = g.createRadialGradient(256, 256, 60, 256, 256, 256); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,70,30,0.25)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = '#1c1c1c'; g.lineWidth = 12; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(256, 256, 200, 0, 7); g.stroke();
    for (let i = 0; i < 60; i++) { const a = (i / 60) * PI * 2, r0 = i % 5 ? 222 : 208; g.lineWidth = i % 5 ? 3 : 8; g.beginPath(); g.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); g.lineTo(256 + Math.sin(a) * 236, 256 - Math.cos(a) * 236); g.stroke(); }
    const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; g.fillStyle = '#1c1c1c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = roman ? 'bold 46px Georgia' : 'bold 64px Georgia';
    for (let k = 0; k < 12; k++) { const a = (k / 12) * PI * 2; g.save(); g.translate(256 + Math.sin(a) * 160, 256 - Math.cos(a) * 160); if (roman) g.rotate(a); g.fillText(roman ? R[k] : String(k || 12), 0, 0); g.restore(); } });
  function clock(par, x, y, z, R, ry, frameM, roman) {
    const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); const ft = clockTex(roman);
    const face = new T.Mesh(new T.CircleGeometry(R, 48), SM({ map: ft, emissiveMap: ft, emissive: C('#ffe9b0'), emissiveIntensity: 0, roughness: 0.5 })); face.position.z = 0.02; g.add(face);
    const rim = new T.Mesh(new T.TorusGeometry(R, R * 0.08, 10, 48), frameM); rim.position.z = 0.06; g.add(rim);
    const drum = new T.Mesh(new T.CylinderGeometry(R * 1.05, R * 1.05, 0.5, 48), frameM); drum.rotation.x = PI / 2; drum.position.z = -0.25; g.add(drum);
    const handM = SM({ color: '#141414', roughness: 0.4, metalness: 0.4 }), mk = (L, wd) => { const p = new T.Group(); p.position.z = 0.16; const h = new T.Mesh(RBX.rbox(wd, L, 0.08, 0.03, 4), handM); h.position.y = L / 2 - R * 0.08; p.add(h); g.add(p); return p; };
    const hp = mk(R * 0.52, R * 0.09), mp = mk(R * 0.8, R * 0.06); const pin = new T.Mesh(new T.SphereGeometry(R * 0.07, 10, 8), M.brass); pin.position.z = 0.22; g.add(pin);
    g.userData = { face, set: (h, m) => { mp.rotation.z = -(m / 60) * PI * 2; hp.rotation.z = -(((h % 12) + m / 60) / 12) * PI * 2; } };
    return g;
  }

  // ---------- office / bank (x=72 north) ----------
  { const g = new T.Group(); g.position.set(72, 0, -16); scene.add(g); g.updateMatrixWorld(); const W = 26, D = 20;
    const stoneTrim = P(stoneT, { rough: 0.85, bump: 2, repeat: [1 / 3, 1 / 3] });
    BX(W, 10, D, M.stone, 0, 5, -D / 2, g); BX(W, 20, D, M.brickT, 0, 20, -D / 2, g);
    BX(W + 1.2, 1.0, D + 1.2, stoneTrim, 0, 10.3, -D / 2, g); BX(W + 1.8, 1.4, D + 1.8, stoneTrim, 0, 30.4, -D / 2, g); BX(W + 0.6, 2.2, D + 0.6, M.brickT, 0, 32.2, -D / 2, g); BX(W + 1.0, 0.4, D + 1.0, stoneTrim, 0, 33.4, -D / 2, g);
    for (let x = -W / 2 - 0.6; x <= W / 2 + 0.6; x += 0.9) inst('dent', new T.BoxGeometry(0.45, 0.5, 0.45), stoneTrim, g.matrixWorld.clone().multiply(M4(x, 29.5, 0.55)));
    [[-10, 15], [-5.6, 15], [5.6, 15], [10, 15], [-10, 24], [-5.6, 24], [5.6, 24], [10, 24]].forEach(([x, y], i) => windowAt(g, x, y, 2.8, 5, { gi: i }));
    [-10, 10].forEach((x, i) => windowAt(g, x, 4.8, 3.6, 5.4, { gi: i + 2 }));
    [-4.6, -1.6, 1.6, 4.6].forEach((x) => { RB(1.15, 9, 1.15, 0.2, stoneTrim, x, 4.9, 1.6, g); BX(1.6, 0.5, 1.6, stoneTrim, x, 0.25, 1.6, g); BX(1.6, 0.5, 1.6, stoneTrim, x, 9.4, 1.6, g); });
    BX(11.4, 1.6, 1.8, stoneTrim, 0, 10.4, 1.6, g);
    const sign = KIT.textTex(1024, 128, (c, w, h) => { c.fillStyle = '#1f3a2c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d9b860'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#e8c870'; c.font = 'bold 80px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TOWN  BANK  &  OFFICES', w / 2, h / 2 + 4); });
    const sp = new T.Mesh(new T.PlaneGeometry(11, 1.35), SM({ map: sign, roughness: 0.4, emissive: C('#ffffff'), emissiveMap: sign, emissiveIntensity: 0.25 })); sp.position.set(0, 10.4, 2.52); g.add(sp);
    const dg = glassM[0]; BX(4.6, 7.6, 0.2, dg, 0, 3.8, 0.05, g); BX(5.2, 0.4, 0.4, M.brass, 0, 7.8, 0.15, g); [-2.45, 0, 2.45].forEach((x) => BX(0.25, 7.6, 0.35, M.brass, x, 3.8, 0.15, g));
    BX(14, 0.3, 3.4, stoneTrim, 0, -0.13, 1.7, g);
    const oc = clock(g, 0, 18.6, 0.35, 3.2, 0, SM({ color: '#2a2a2a', roughness: 0.35, metalness: 0.7 }), false); props.officeClock = oc; props.setOfficeClock = (h, m) => oc.userData.set(h, m); oc.userData.set(8, 59);
    // "reserved" sign on the sidewalk + parking meter
    const rs = KIT.textTex(256, 320, (c, w, h) => { c.fillStyle = '#f4f2ec'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1d4a8a'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#1d4a8a'; c.textAlign = 'center'; c.font = 'bold 50px Arial'; c.fillText('RESERVED', w / 2, 90); c.font = 'bold 42px Arial'; c.fillStyle = '#c02020'; c.fillText('MR. ORTEGA', w / 2, 170); c.fillStyle = '#1d4a8a'; c.font = 'bold 30px Arial'; c.fillText('8:59 AM', w / 2, 240); });
    CY(0.1, 0.1, 6, M.metal, -6, 3, 9.0, g, 8); const rsp = new T.Mesh(new T.PlaneGeometry(1.8, 2.25), SM({ map: rs, roughness: 0.5, side: T.DoubleSide })); rsp.position.set(-6, 5.2, 9.12); g.add(rsp);
    // shrubs in planters
    [-8, 8].forEach((x) => { BX(3.6, 1.2, 1.6, stoneTrim, x, 0.6, 1.4, g); RB(3.2, 1.6, 1.3, 0.6, M.hedge, x, 1.8, 1.4, g); });
  }

  // ---------- church (tower at 60,0,-70) ----------
  { const g = new T.Group(); g.position.set(60, 0, -70); scene.add(g); g.updateMatrixWorld();
    const stT = P(stoneT, { rough: 0.85, bump: 2, repeat: [1 / 3, 1 / 3] });
    BX(10, 30, 10, M.stone, 0, 15, 0, g); BX(11, 2, 11, stT, 0, 1, 0, g); BX(10.8, 0.8, 10.8, stT, 0, 18, 0, g); BX(11, 0.9, 11, stT, 0, 30.2, 0, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => BX(1.6, 18, 1.6, M.stone, sx * 5.2, 9, sz * 5.2, g));
    // belfry: corner piers + arches, open
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => BX(2.0, 8.4, 2.0, M.stone, sx * 4.0, 34.9, sz * 4.0, g));
    const archG = new T.TorusGeometry(3.0, 0.55, 8, 20, PI);
    [[0, 4.4, 0], [0, -4.4, 0], [4.4, 0, PI / 2], [-4.4, 0, PI / 2]].forEach(([x, z, ry]) => { const a = new T.Mesh(archG, stT); a.position.set(x, 35.8, z); a.rotation.y = ry; g.add(a); const sp = BX(9.6, 2.3, 0.9, M.stone, 0, 38.0, 0, g); sp.position.set(x, 38.0, z); sp.rotation.y = ry; const sl = BX(8.6, 0.6, 1.1, stT, x, 31.6, z, g); sl.rotation.y = ry; });
    BX(11.6, 1.0, 11.6, stT, 0, 39.6, 0, g);
    const spire = new T.Mesh(new T.ConeGeometry(7.6, 8.5, 4, 1), shingle('#3c4a58')); spire.rotation.y = PI / 4; spire.position.y = 44.35; g.add(spire);
    const gold = SM({ color: '#e0b84a', roughness: 0.3, metalness: 0.9 }); BX(0.3, 3.4, 0.3, gold, 0, 49.6, 0, g); BX(1.6, 0.3, 0.3, gold, 0, 50.4, 0, g);
    // bell on a yoke
    BX(9.0, 0.7, 0.7, M.porch, 0, 37.9, 0, g);
    const bell = new T.Group(); bell.position.set(0, 37.55, 0); g.add(bell); props.bell = bell;
    const prof = [[0, 0], [0.55, 0], [0.85, -0.25], [0.95, -1.0], [1.05, -1.9], [1.3, -2.6], [1.75, -3.15], [1.95, -3.45], [1.8, -3.5], [1.55, -3.3]].map(([r, y]) => new T.Vector2(r, y - 0.35));
    const bm = new T.Mesh(new T.LatheGeometry(prof, 36), M.bronze); bell.add(bm);
    const crown = new T.Mesh(new T.TorusGeometry(0.3, 0.1, 6, 12), M.bronze); crown.position.y = -0.1; bell.add(crown);
    const clap = new T.Mesh(new T.SphereGeometry(0.35, 12, 8), M.metal); clap.position.y = -3.2; bell.add(clap); CY(0.06, 0.06, 2.6, M.metal, 0, -1.9, 0, bell, 6);
    const belfryL = new T.PointLight('#ffb870', 60, 30, 2); belfryL.position.set(0, 33, 0); g.add(belfryL); props.belfryLight = belfryL;
    // clocks on the street face (+z) and the west face (-x)
    const cf = SM({ color: '#2b2622', roughness: 0.4, metalness: 0.6 });
    const ck1 = clock(g, 0, 24.5, 5.05, 3.3, 0, cf, true), ck2 = clock(g, -5.05, 24.5, 0, 3.3, -PI / 2, cf, true); props.churchClock = ck1; props.churchClocks = [ck1, ck2];
    props.setChurchClock = (h, m) => { ck1.userData.set(h, m); ck2.userData.set(h, m); }; props.setChurchClock(12, 0);
    // door + rose
    const dm = doorM('#5a2e1a'); BX(4, 7.5, 0.4, dm, 0, 3.75, 5.1, g); const da = new T.Mesh(new T.CircleGeometry(2, 20, 0, PI), dm); da.position.set(0, 7.5, 5.32); g.add(da);
    // stained glass
    const sgT = KIT.textTex(128, 256, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); const cols = ['#d83a3a', '#3a6ad8', '#e8c040', '#3aa84a', '#9a4ad8']; const r = rng(9); for (let y = 0; y < h; y += 26) for (let x = 0; x < w; x += 32) { c.fillStyle = cols[(r() * 5) | 0]; c.fillRect(x + 3, y + 3, 26, 20); } });
    const sgM = SM({ map: sgT, emissiveMap: sgT, emissive: C('#ffffff'), emissiveIntensity: 1.2, roughness: 0.2 }); props.churchGlass = sgM;
    // nave
    BX(16, 14, 32, M.stone, 0, 7, -21, g); const nr = new T.Group(); nr.position.z = -5; g.add(nr); gableRoof(nr, 16, 32, 14, 8, shingle('#3c4a58'), M.stone, 0.8, 0.6);
    for (let k = 0; k < 5; k++) [-1, 1].forEach((s) => { const w = new T.Mesh(new T.PlaneGeometry(2.2, 6), sgM); w.position.set(s * 8.03, 7.5, -10 - k * 5.5); w.rotation.y = s * PI / 2; g.add(w); BX(0.3, 6.6, 2.8, stT, s * 8.05, 7.5, -10 - k * 5.5, g).scale.set(1, 1, 1); w.position.x = s * 8.22; });
    // churchyard: low stone wall + gravestones
    BX(30, 1.6, 0.8, M.stone, 0, 0.8, 12, g); for (let k = 0; k < 10; k++) { const gs = RB(1.2, 1.8 + (k % 3) * 0.3, 0.35, 0.2, stT, -12 + (k % 5) * 6 + (k > 4 ? 3 : 0), 0.9, 8 - (k > 4 ? 4 : 0), g); gs.rotation.z = (k % 2 - 0.5) * 0.12; }
  }

  // ---------- cars (rounded cartoon) ----------
  function car(col, o = {}) {
    const g = new T.Group(), k = 1.4; g.scale.setScalar(k);
    const paint = new T.MeshPhysicalMaterial({ color: col, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    RB(8.0, 1.7, 3.8, 0.75, paint, 0, 1.4, 0, g);
    [-2.55, 2.55].forEach((x) => RB(2.5, 1.0, 3.95, 0.48, paint, x, 1.75, 0, g));
    RB(4.1, 0.34, 3.4, 0.16, paint, -0.3, 4.15, 0, g);
    [[1.55, 0.35], [-2.2, -0.25]].forEach(([x, lean]) => [-1.55, 1.55].forEach((z) => { const p = RB(0.28, 2.0, 0.26, 0.1, paint, x, 3.15, z, g); p.rotation.z = lean; }));
    const ws = new T.Mesh(new T.PlaneGeometry(3.2, 2.0), M.glassCar); ws.position.set(1.85, 3.15, 0); ws.rotation.set(0, PI / 2, 0); ws.rotateX(-0.35); g.add(ws);
    const rw = new T.Mesh(new T.PlaneGeometry(3.2, 1.9), M.glassCar); rw.position.set(-2.45, 3.15, 0); rw.rotation.set(0, -PI / 2, 0); rw.rotateX(-0.25); g.add(rw);
    [-1, 1].forEach((s) => [[0.7, 1.9], [-1.25, 1.6]].forEach(([x, w], i) => { if (o.openWindow && s < 0 && i === 0) return; const p = new T.Mesh(new T.PlaneGeometry(w, 1.75), M.glassCar); p.position.set(x, 3.1, s * 1.68); p.rotation.y = s > 0 ? 0 : PI; g.add(p); }));
    BX(0.12, 1.9, 0.2, paint, -0.3, 3.1, 1.66, g); BX(0.12, 1.9, 0.2, paint, -0.3, 3.1, -1.66, g);
    [-1, 1].forEach((s) => { RB(1.2, 1.5, 1.2, 0.25, M.seat, 0.3, 2.4, s * 0.85, g).rotation.z = 0.05; RB(0.3, 1.8, 1.2, 0.15, M.seat, -0.35, 3.0, s * 0.85, g).rotation.z = 0.15; });
    RB(1.0, 1.4, 3.0, 0.25, M.seat, -1.6, 2.6, 0, g); BX(1.2, 0.9, 3.3, SM({ color: '#2a2a2e', roughness: 0.6 }), 1.55, 2.6, 0, g);
    const sw = new T.Mesh(new T.TorusGeometry(0.42, 0.07, 6, 18), M.tyre); sw.position.set(1.05, 3.05, -0.85); sw.rotation.y = PI / 2; sw.rotateX(0.4); g.add(sw);
    const wG = new T.CylinderGeometry(0.85, 0.85, 0.75, 22), hubG = new T.CylinderGeometry(0.42, 0.42, 0.8, 14);
    [-2.55, 2.55].forEach((x) => [-1.6, 1.6].forEach((z) => { const w = new T.Mesh(wG, M.tyre); w.rotation.x = PI / 2; w.position.set(x, 0.85, z); g.add(w); const h = new T.Mesh(hubG, M.chrome); h.rotation.x = PI / 2; h.position.set(x, 0.85, z); g.add(h); }));
    [-1.25, 1.25].forEach((z) => { const hl = new T.Mesh(new T.SphereGeometry(0.36, 14, 10), M.lampGlow); hl.position.set(3.85, 1.85, z); hl.scale.x = 0.6; g.add(hl); RB(0.2, 0.45, 0.8, 0.08, SM({ color: '#c01818', emissive: C('#ff2010'), emissiveIntensity: 1.5 }), -4.0, 1.85, z * 1.08, g); });
    RB(0.5, 0.5, 3.9, 0.22, M.chrome, 4.05, 0.95, 0, g); RB(0.5, 0.5, 3.9, 0.22, M.chrome, -4.05, 0.95, 0, g); RB(0.15, 0.6, 1.6, 0.08, SM({ color: '#1a1a1a' }), 4.0, 1.5, 0, g);
    const lid = new T.Group(); lid.position.set(-2.55, 2.27, 0); g.add(lid); RB(1.6, 0.2, 3.5, 0.1, paint, -0.8, 0, 0, lid); g.userData.lid = lid;
    g.userData.seat = V(0.3, 1.45, -0.85).multiplyScalar(k);   // driver seat (local, scaled): left side (-z)
    return g;
  }
  const place = (c, x, z, ry) => { c.position.set(x, RY, z); c.rotation.y = ry; scene.add(c); c.updateMatrixWorld(); return c; };
  const ortega = place(car('#e2b13a', { openWindow: true }), 70, -3.4, 0); props.ortegaCar = ortega;
  const pk1 = place(car('#3a7ad0'), -38, 3.4, PI), pk2 = place(car('#d84a3a'), 50, -3.4, 0);
  place(car('#4aa86a'), -82, 3.4, PI); place(car('#e8e4dc'), -56, -3.4, 0); place(car('#8a5ad0'), 26, 3.4, PI); place(car('#2c3e5a'), 98, 3.4, PI);
  // packing: open trunks + suitcases
  const packing = new T.Group(); scene.add(packing); props.packing = packing;
  { const cs = ['#c03a3a', '#2a5a9a', '#e8a030', '#3a8a5a', '#6a4a8a', '#d86a9a'], r = rng(55);
    [[pk1, -1], [pk2, 1]].forEach(([c, dir]) => { const bx = c.position.x - dir * 6.4;
      for (let i = 0; i < 4; i++) { const w = 2.2 + r() * 0.8, h = 1.6 + r() * 0.9, s = RB(w, h, 0.9, 0.2, SM({ color: cs[(r() * 6) | 0], roughness: 0.55 }), bx - dir * (i % 2) * 1.6, RY + h / 2, c.position.z + (i < 2 ? -1.4 : 1.4) * (dir), packing); s.rotation.y = r() * 0.6; RB(0.8, 0.25, 0.25, 0.1, M.metal, 0, h / 2 + 0.12, 0, s); }
      const box2 = RB(2.4, 1.2, 1.8, 0.1, SM({ color: '#b08a5a', roughness: 0.9 }), c.position.x - dir * 4.6, RY + 3.4, c.position.z, packing); });
    props.setPacking = (on) => { packing.visible = on; [pk1, pk2].forEach((c) => { c.userData.lid.rotation.z = on ? -1.75 : 0; }); }; props.setPacking(true); }

  // ---------- street lamps, hydrant, bins, signs ----------
  const lampLights = [], lampGlowM = M.lampGlow;
  [[-84, -1], [-36, -1], [12, -1], [60, -1], [108, -1], [-108, 1], [-60, 1], [-12, 1], [36, 1], [84, 1]].forEach(([x, s]) => {
    const z = s * 6.9, gp = new T.Group(); gp.position.set(x, 0, z); scene.add(gp);
    CY(0.5, 0.65, 0.8, M.metal, 0, 0.4, 0, gp, 10); CY(0.16, 0.22, 10.5, M.metal, 0, 5.6, 0, gp, 10); CY(0.32, 0.32, 0.3, M.metal, 0, 10.8, 0, gp, 10);
    const head = RB(1.0, 1.5, 1.0, 0.3, lampGlowM, 0, 11.7, 0, gp); head.userData.noCast = true;
    const cap = new T.Mesh(new T.ConeGeometry(1.0, 0.8, 8), M.metal); cap.position.y = 12.8; gp.add(cap); const fin = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), M.metal); fin.position.y = 13.3; gp.add(fin);
    [-1, 1].forEach((k) => BX(0.08, 1.5, 0.08, M.metal, k * 0.5, 11.7, 0.5, gp));
    if (Math.abs(x) <= 62) { const L = new T.PointLight('#ffb468', 700, 70, 2); L.position.set(x, 11.4, z); scene.add(L); lampLights.push(L); }
  });
  { const hy = SM({ color: '#c8281e', roughness: 0.5 }); const hx = -11, hz = -9.5; CY(0.4, 0.45, 1.8, hy, hx, 0.9, hz, scene, 12); const hc = new T.Mesh(new T.SphereGeometry(0.45, 12, 8, 0, PI * 2, 0, PI / 2), hy); hc.position.set(hx, 1.8, hz); scene.add(hc); BX(1.4, 0.35, 0.35, hy, hx, 1.2, hz, scene); CY(0.2, 0.2, 0.3, M.brass, hx, 2.3, hz, scene, 8); }
  [[-18, -8.6, '#2a5a3a'], [-16.6, -8.6, '#2a4a8a'], [30, 8.6, '#2a5a3a'], [-44, 8.6, '#2a4a8a']].forEach(([x, z, c]) => { const b = RB(1.3, 2.6, 1.3, 0.2, SM({ color: c, roughness: 0.5 }), x, 1.3, z); RB(1.45, 0.25, 1.45, 0.1, SM({ color: c, roughness: 0.5 }), x, 2.65, z); });
  { const st = KIT.textTex(512, 128, (c, w, h) => { c.fillStyle = '#1f6a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#fff'; c.font = 'bold 70px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MAPLE  ST', w / 2, h / 2 + 4); });
    CY(0.12, 0.12, 10, M.metal, -65, 5, -6.9, scene, 8); const sp = new T.Mesh(new T.BoxGeometry(4, 1, 0.1), [M.metal, M.metal, M.metal, M.metal, SM({ map: st }), SM({ map: st })]); sp.position.set(-65, 9.6, -6.9); scene.add(sp);
    const so = KIT.textTex(256, 256, (c, w, h) => { c.fillStyle = '#c01a1a'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4; c.lineTo(128 + Math.cos(a) * 124, 128 + Math.sin(a) * 124); } c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 76px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STOP', 128, 132); });
    const sg = new T.Mesh(new T.CircleGeometry(1.1, 8), SM({ map: so, side: T.DoubleSide, roughness: 0.4 })); sg.position.set(-65, 7.6, -6.75); sg.rotation.z = PI / 8; scene.add(sg); }

  // ---------- trees ----------
  const trunkG = new T.CylinderGeometry(0.32, 0.5, 1, 7); trunkG.translate(0, 0.5, 0);
  const coneG = new T.ConeGeometry(1, 1, 9, 2); coneG.translate(0, 0.5, 0); { const p = coneG.attributes.position, r = rng(4); for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.05 && p.getY(i) < 0.95) { p.setX(i, p.getX(i) * (0.9 + r() * 0.25)); p.setZ(i, p.getZ(i) * (0.9 + r() * 0.25)); } coneG.computeVertexNormals(); }
  const blobG = new T.IcosahedronGeometry(1, 1); { const p = blobG.attributes.position, r = rng(6); for (let i = 0; i < p.count; i++) { const k = 0.88 + r() * 0.24; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); } blobG.computeVertexNormals(); }
  const trT = rng(808), green = (b) => { const c = C(b); c.offsetHSL((trT() - 0.5) * 0.04, 0, (trT() - 0.5) * 0.12); return c; };
  function pine(x, z, s) { inst('trunk', trunkG, M.bark, M4(x, 0, z, 0, trT() * 6, 0, s * 1.4, 7 * s, s * 1.4)); const col = green('#cfe0cf');
    for (let k = 0; k < 4; k++) inst('cone', coneG, M.pine, M4(x, (4 + k * 5.2) * s, z, 0, trT() * 6, 0, (6.6 - k * 1.45) * s, (8.5 - k * 0.6) * s, (6.6 - k * 1.45) * s), col); }
  function oak(x, z, s) { inst('trunk', trunkG, M.bark, M4(x, 0, z, 0, trT() * 6, 0, s * 2, 12 * s, s * 2)); const col = green('#d8e8c8');
    [[0, 17, 0, 6.5], [-3.6, 14.5, 1, 4.8], [3.6, 15, -1, 5], [0.5, 13.5, 3.3, 4.6], [-0.6, 14, -3.4, 4.6], [0, 21.5, 0, 4.4]].forEach(([dx, dy, dz, r]) => inst('blob', blobG, M.oak, M4(x + dx * s, dy * s, z + dz * s, trT(), trT(), trT(), r * s, r * s * 0.9, r * s), col)); }
  for (let side of [-1, 1]) for (let row = 0; row < 4; row++) for (let x = -124; x < 124; x += 9 + trT() * 6) {
    const z = side * (40 + row * 13 + trT() * 8), xx = x + trT() * 4; if (side < 0 && xx > 40 && xx < 82 && z < -50 && z > -112) continue; if (side < 0 && xx > 56 && xx < 90 && z > -44) continue;
    const s = 0.85 + trT() * 0.35; (trT() < 0.55 ? pine : oak)(xx, z, s); }
  [[-60, -12.5], [-36, -12.6], [-12.4, -12.6], [12.6, -12.6], [-84, -12.6], [-48, 12.6], [-24, 12.6], [24, 12.6], [48, 12.6], [-84, 12.6], [84, -12.6]].forEach(([x, z]) => oak(x, z, 0.78 + trT() * 0.1));
  [[-14, -30], [16, -32], [-40, -33], [-64, -31], [-28, 32], [4, 33], [28, 31], [-52, 32]].forEach(([x, z]) => pine(x, z, 0.9 + trT() * 0.2));

  // ---------- finale extras: string lights + ladders ----------
  const stringLights = new T.Group(); scene.add(stringLights); props.stringLights = stringLights;
  const bulbG = new T.SphereGeometry(0.17, 8, 6), wireM = SM({ color: '#141414', roughness: 0.8 });
  const bulbMs = ['#ffcf7a', '#ff6a5a', '#7ad0ff', '#9aff7a', '#ffd84a'].map((c) => { const m = new T.MeshBasicMaterial({ color: C(c).multiplyScalar(6) }); m.userData.noCast = true; return m; });
  const sag = (a, b, n, d) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a.clone().lerp(b, t).add(V(0, -d * Math.sin(t * PI), 0))); }
    const tb = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), n * 2, 0.03, 4), wireM); tb.userData.noCast = true; stringLights.add(tb);
    pts.forEach((p, i) => { if (i > 0 && i < n) inst('bulb' + (i % 5), bulbG, bulbMs[i % 5], M4(p.x, p.y - 0.2, p.z), null, stringLights); }); };
  const NX = [-48, -24, 0, 24, 48], SX = [-60, -36, -12, 12, 36, 60];
  const zz = []; NX.forEach((x, i) => { zz.push(V(x, 15.2, -14.6)); if (SX[i + 1] !== undefined) zz.push(V(SX[i + 1], 15.2, 14.6)); });
  for (let i = 0; i < zz.length - 1; i++) sag(zz[i], zz[i + 1], 26, 2.6);
  NX.slice(0, -1).forEach((x, i) => sag(V(x + 8.5, 15.0, -14.6), V(NX[i + 1] - 8.5, 15.0, -14.6), 8, 0.8));
  const warmPts = [-30, 0, 30].map((x) => { const L = new T.PointLight('#ffb070', 0, 60, 2); L.position.set(x, 12, 0); scene.add(L); return L; });
  // ladders lean on every house front (children of the houses); props.ladders = { visible } toggle + list
  const ladderList = [];
  { const lw = SM({ color: '#c8a060', roughness: 0.7 }), lm = SM({ color: '#b8bcc4', roughness: 0.35, metalness: 0.8 });
    Object.values(houses).forEach((h, i) => { const lg = new T.Group(); h.g.add(lg); const lx = h.o.name === 'ours' ? -7.6 : (i % 2 ? 1 : -1) * (h.W / 2 - 2.2);
      const L = 17.2, ang = Math.atan2(2.6, 16); lg.position.set(lx, 0, 3.6); lg.rotation.x = -ang; const m = i % 2 ? lm : lw;
      [-0.85, 0.85].forEach((x) => BX(0.22, L, 0.32, m, x, L / 2, 0, lg)); for (let y = 0.8; y < L; y += 1.0) BX(1.7, 0.16, 0.18, m, 0, y, 0, lg);
      ladderList.push(lg); }); }
  props.ladders = { list: ladderList, get visible() { return ladderList[0].visible; }, set visible(v) { ladderList.forEach((c) => { c.visible = v; }); } };

  // ---------- sky: dome, stars, heavy clouds, sun ----------
  const skyTex = (stops) => { const c = cnv(8, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); stops.forEach(([t, col]) => gr.addColorStop(t, col)); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); return tex(c); };
  const SKY = {
    night: skyTex([[0, '#020418'], [0.3, '#081250'], [0.47, '#1a2e8a'], [0.52, '#2b3f9a'], [0.6, '#0c1240'], [1, '#04061a']]),
    sunset: skyTex([[0, '#1a1650'], [0.3, '#5a3a8a'], [0.42, '#d86a6a'], [0.49, '#ffb060'], [0.52, '#ffd890'], [0.6, '#5a3a4a'], [1, '#1a1020']]),
    day: skyTex([[0, '#2f6ad8'], [0.3, '#5a92ea'], [0.47, '#a8cdf6'], [0.52, '#dcecfa'], [0.6, '#8aa8c0'], [1, '#4a5a6a']]),
  };
  const dome = new T.Mesh(new T.SphereGeometry(950, 32, 24), new T.MeshBasicMaterial({ map: SKY.night, side: T.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -10; scene.add(dome);
  const stars = (() => { const r = rng(8), N = 1800, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const th = r() * PI * 2, ph = Math.acos(0.06 + r() * 0.94), R = 900; pos.set([R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th)], i * 3); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); return new T.Points(g, new T.PointsMaterial({ size: 1.7, sizeAttenuation: false, color: C('#ffffff').multiplyScalar(2.2), fog: false, depthWrite: false })); })(); scene.add(stars);
  const cloudTexs = [1, 2, 3].map((seed) => { const c = cnv(512, 256), g = c.getContext('2d'), r = rng(seed * 17);
    for (let i = 0; i < 70; i++) { const x = 70 + r() * 372, y = 90 + r() * 90 - Math.sin(((x - 70) / 372) * PI) * 40, rad = 25 + r() * 60 * Math.sin(((x - 70) / 372) * PI + 0.2);
      const gr = g.createRadialGradient(x, y - rad * 0.3, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.55, 'rgba(200,205,215,0.75)'); gr.addColorStop(1, 'rgba(120,125,140,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
    const sh = g.createLinearGradient(0, 60, 0, 230); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(40,40,60,0.85)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(0, 0, 512, 256); return tex(c); });
  const cloudMs = cloudTexs.map((t) => new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, color: C('#2a3058') }));
  const clouds = new T.Group(); scene.add(clouds); props.clouds = clouds;
  { const r = rng(404); for (let i = 0; i < 34; i++) { const az = r() * PI * 2, el = 0.2 + r() * 0.7, d = 560 + r() * 300, w = 200 + r() * 200;
      const p = V(Math.cos(az) * Math.cos(el) * d, Math.sin(el) * d + 40, Math.sin(az) * Math.cos(el) * d); const m = new T.Mesh(new T.PlaneGeometry(w, w * 0.45), cloudMs[i % 3]); m.position.copy(p); m.lookAt(0, 0, 0); m.renderOrder = -5; clouds.add(m); } }
  const sunDisc = new T.Mesh(new T.CircleGeometry(30, 32), new T.MeshBasicMaterial({ color: C('#ffd38a').multiplyScalar(5), fog: false })); scene.add(sunDisc);

  // ---------- lights ----------
  const hemi = new T.HemisphereLight('#3d55c8', '#161226', 1); scene.add(hemi);
  const key = new T.DirectionalLight('#a8bcff', 3); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -125, right: 125, top: 110, bottom: -110, near: 1, far: 700 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; key.shadow.radius = 2;
  key.target.position.set(10, 0, -14); scene.add(key, key.target);
  const fogC = C('#0d1748'); scene.fog = new T.FogExp2(fogC, 0.0045); scene.background = C('#04061a');
  const lampSconce = M.lampGlow;

  // ---------- shadows ----------
  flushInst();
  scene.traverse((m) => { if (!m.isMesh) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material; const nb = mt.isMeshBasicMaterial || mt.transparent || m.userData.noCast || mt.userData.noCast; m.castShadow = !nb; m.receiveShadow = !mt.isMeshBasicMaterial; });
  dome.receiveShadow = false; clouds.traverse((m) => { m.receiveShadow = false; m.castShadow = false; });

  // ---------- moods ----------
  const setBoards = (on) => props.boards.forEach((b) => { b.visible = on; }); props.setBoards = setBoards;
  const setGlass = (k, col = '#ffffff') => glassM.forEach((m) => { m.emissiveIntensity = k; m.color.set(col); });
  function sunAt(dir, d = 400) { key.position.copy(key.target.position).addScaledVector(dir.clone().normalize(), d); }
  let current = 'night';
  function mood(name) {
    current = name; const night = name === 'night' || name === 'finale';
    dome.material.map = SKY[night ? 'night' : name]; stars.visible = night; sunDisc.visible = !night;
    setBoards(name !== 'finale'); props.stringLights.visible = name === 'finale'; props.ladders.visible = name === 'finale'; warmPts.forEach((L) => { L.intensity = name === 'finale' ? 900 : 0; });
    lampLights.forEach((L) => { L.intensity = night ? 700 : name === 'sunset' ? 160 : 0; }); lampGlowM.emissiveIntensity = night ? 4 : name === 'sunset' ? 1.6 : 0.05;
    props.belfryLight.intensity = night ? 60 : 0; props.churchGlass.emissiveIntensity = night ? 1.2 : 0.15;
    [props.officeClock, ...props.churchClocks].forEach((c) => { c.userData.face.material.emissiveIntensity = night ? 0.35 : 0; });
    if (name === 'night') { hemi.color.set('#3d55c8'); hemi.groundColor.set('#161226'); hemi.intensity = 0.9; key.color.set('#a8bcff'); key.intensity = 2.6; sunAt(V(0.35, 1, 0.55)); fogC.set('#0d1748'); scene.fog.density = 0.0045; setGlass(2.4); cloudMs.forEach((m) => m.color.set('#3c4678')); }
    if (name === 'finale') { hemi.color.set('#4a5ad0'); hemi.groundColor.set('#2a1a20'); hemi.intensity = 1.1; key.color.set('#b0c0ff'); key.intensity = 2.2; sunAt(V(0.35, 1, 0.55)); fogC.set('#121a4a'); scene.fog.density = 0.0038; setGlass(3.2); cloudMs.forEach((m) => m.color.set('#30365e')); }
    if (name === 'sunset') { hemi.color.set('#ff9a78'); hemi.groundColor.set('#30203a'); hemi.intensity = 1.0; key.color.set('#ffa050'); key.intensity = 6; sunAt(V(-1, 0.16, 0.38)); fogC.set('#c87a6a'); scene.fog.density = 0.0035; setGlass(0.7); cloudMs.forEach((m) => m.color.set('#8a4e5e'));
      sunDisc.position.copy(V(-1, 0.07, 0.3).normalize().multiplyScalar(900)); sunDisc.lookAt(0, 0, 0); }
    if (name === 'day') { hemi.color.set('#cfe2ff'); hemi.groundColor.set('#6a7a50'); hemi.intensity = 1.8; key.color.set('#fff2dc'); key.intensity = 5.5; sunAt(V(0.45, 1, 0.7)); fogC.set('#b8cfe6'); scene.fog.density = 0.0028; setGlass(0.02, '#7e8ea2'); cloudMs.forEach((m) => m.color.set('#f4f6fa'));
      sunDisc.position.copy(V(0.45, 1, 0.7).normalize().multiplyScalar(900)); sunDisc.lookAt(0, 0, 0); }
    scene.background = fogC;
  }
  mood('night');

  // ---------- marks ----------
  const W2 = (h, v) => h.g.localToWorld(v.clone());
  const mk = (name, v, ry, sit) => { marks[name] = { p: [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)], ry }; if (sit) marks[name].sit = true; };
  mk('p_sidewalk_a', V(-30, 0, 7.6), PI / 2); mk('p_sidewalk_b', V(-16, 0, 8.0), -PI / 2); mk('p_sidewalk_c', V(9, 0, -7.6), PI / 2); mk('p_sidewalk_d', V(22, 0, -8.0), -PI / 2);
  mk('p_mailman', V(-7, 0, -7.7), PI / 2); mk('p_pizza', V(12, 0, 14.3), 0); mk('p_dad_window', V(-5, 0, -14.1), PI);
  mk('p_neigh_1', V(20, 0, -14.2), PI); mk('p_neigh_2', V(-30.8, RY, 3.4), -PI / 2); mk('p_neigh_3', V(-12, 0, 14.3), 0); mk('p_neigh_4', V(41.4, RY, -3.4), PI / 2);
  mk('p_grandma', W2(houses.grandma, V(1.8, PF, 3.6)), 0); mk('p_ortega_car', V(70, RY, -3.4), 0);
  ortega.updateMatrixWorld(); { const s = ortega.localToWorld(V(0.3, 1.45, -0.85)); mk('p_ortega_driver', V(s.x, s.y - 2, s.z), PI / 2, true); }
  mk('p_ortega_office', V(72, 0, -13.2), PI);
  { const s = rf.surf(-4, 10.2, 0.22); mk('p_roof_sit', W2(ours, V(s.x, s.y - 2, s.z)), 0, true); }
  { const lx = (chalkInfo.u - 0.5) * CPW - 0.5, ly = (0.5 - chalkInfo.v) * CPH, s = rf.surf(lx, CS + ly - 0.55, 0.22); mk('p_roof_chalk', W2(ours, s), 0); props.chalkYEnd = marks.p_roof_chalk.p; }
  { const pr2 = og.userData.porchRoof, s = pr2.surf(4, pr2.Ls - 1.3, 0.2); mk('p_window_out', W2(ours, s), 0); }
  [['-48', -3], ['24', 2], ['48', -2], ['-36', 0], ['12', 2], ['36', -1]].forEach(([k, x], i) => { const h = houses[k], s = h.rf.surf(x, 4.2, 0.22); mk('p_roof_' + (i + 1), W2(h, V(s.x, s.y - 2, s.z)), h.north ? 0 : PI, true); });
  props.houses = houses;

  // ---------- views (vertical self-check cameras) ----------
  const views = {
    aerial: { p: [-14, 74, 30], l: [4, 2, -14], fov: 52, mood: 'night' },
    sidewalk_low: { p: [-3, 0.7, 8.4], l: [-3, 13, -12], fov: 64, mood: 'night' },
    house_front: { p: [3, 5.2, 16], l: [0, 10.5, -16], fov: 60, mood: 'sunset', grade: 'sunset' },
    grandma_porch: { p: [-28, 7, 2], l: [-23, 3.6, -12], fov: 55, mood: 'day', grade: 'day' },
    roof_go_away: { p: [0.5, 48, -9], l: [0, 19, -20.5], fov: 44, mood: 'night' },
    church_long: { p: [20, 22, 12], l: [60, 34, -70], fov: 18, mood: 'night' },
    office_clock: { p: [80, 2.5, 8], l: [72, 16, -16], fov: 46, mood: 'day', grade: 'day' },
    finale_wide: { p: [-46, 20, 1], l: [0, 12, -4], fov: 55, mood: 'finale' },
    roof_slope: { p: [10, 18, -9], l: [-3, 19.5, -22], fov: 58, mood: 'night' },
  };
  return { scene, grade: 'night', marks, props, mood, views, reset() { mood('night'); props.chalk.visible = true; props.setPacking(true); props.setOfficeClock(8, 59); props.setChurchClock(12, 0); props.bell.rotation.set(0, 0, 0); props.shingles.forEach((s) => { s.position.copy(s.userData.rest.p); s.rotation.copy(s.userData.rest.r); }); } };
};

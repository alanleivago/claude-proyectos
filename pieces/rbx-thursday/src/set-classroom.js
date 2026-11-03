// rbx-thursday CLASSROOM set: daytime school room, sun through blinds (left wall), chalkboard with redrawable chalk,
// wall bell, cork board of kids' "THE WATCHER" drawings, 4x3 student desk combos. Registers SETS.classroom.
'use strict';
(function () {
  SETS.classroom = async function (ctx) {
    const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
    const { texPair, noiseOver, woodPlanks, box, rb, wm, V, shadow } = KIT;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#bcd6f2');
    const X0 = -12, X1 = 12, Z0 = -10, Z1 = 10, RH = 12;
    const sunDir = V(1, -0.62, 0.32).normalize();          // travel direction of the sunlight (from the windows, x=-12)
    const props = {}, marks = {};
    const add = (...o) => { o.forEach((k) => scene.add(k)); return o[0]; };
    const std = (color, rough = 0.6, metal = 0, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, o));
    const cyl = (rt, rbm, h, mat, x, y, z, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rbm, h, seg), mat); m.position.set(x, y, z); return m; };
    const FONT = "'Chalkboard SE','Marker Felt','Comic Sans MS',cursive";

    // ---------------- textures ----------------
    const T = {};
    // painted cinder block: 512 px = 4x4 units, blocks 2 x 0.667
    const block = (col, seed) => texPair(512, (g, hg, S) => {
      g.fillStyle = col; g.fillRect(0, 0, S, S); noiseOver(g, S, S, seed, 0.12, 24, 4); noiseOver(g, S, S, seed + 1, 0.06, 6, 3);
      const rows = 6, bh = S / rows, bw = S / 2;
      for (let r = 0; r < rows; r++) { const y = r * bh; g.fillStyle = 'rgba(90,80,60,0.28)'; g.fillRect(0, y - 2, S, 4); hg.fillStyle = '#303030'; hg.fillRect(0, y - 3, S, 6);
        for (let k = 0; k < 3; k++) { const x = k * bw + (r % 2 ? bw / 2 : 0); g.fillRect(x - 2, y, 4, bh); hg.fillRect(x - 3, y, 6, bh); } }
      const n = tnoise(seed + 4, 96), hm = hg.getImageData(0, 0, S, S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (hm.data[i] > 100) hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 120 + n(x / S, y / S) * 70; } hg.putImageData(hm, 0, 0);
    });
    T.wall = block('#efe2c2', 31); T.wallF = block('#cfdcc0', 37);
    // VCT floor tiles: 512 = 3x3 tiles (1.5 units)
    T.floor = texPair(512, (g, hg, S) => {
      const r = rng(41), n = 3, c = S / n, cols = ['#e6dcc6', '#ded2b8', '#e9e1cf', '#d9ccb0'];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 3 === 0 && i === 1 ? '#b9a785' : cols[Math.floor(r() * 4)]; g.fillRect(i * c, j * c, c, c); }
      for (let k = 0; k < 2600; k++) { g.fillStyle = ['rgba(120,100,70,0.5)', 'rgba(255,255,255,0.5)', 'rgba(90,110,100,0.35)'][k % 3]; g.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 2); }
      noiseOver(g, S, S, 43, 0.14, 8, 4);
      g.fillStyle = 'rgba(70,60,45,0.55)'; hg.fillStyle = '#202020'; for (let i = 0; i <= n; i++) { g.fillRect(i * c - 1, 0, 2, S); g.fillRect(0, i * c - 1, S, 2); hg.fillRect(i * c - 2, 0, 4, S); hg.fillRect(0, i * c - 2, S, 4); }
    });
    // acoustic ceiling tiles: 512 = 2x2 tiles (2 units)
    T.ceil = texPair(512, (g, hg, S) => {
      g.fillStyle = '#ece9e2'; g.fillRect(0, 0, S, S); const r = rng(51);
      for (let k = 0; k < 5000; k++) { g.fillStyle = `rgba(110,100,90,${0.2 + r() * 0.35})`; const x = r() * S, y = r() * S; g.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 1.5); hg.fillStyle = '#404040'; hg.fillRect(x, y, 2, 2); }
      noiseOver(g, S, S, 52, 0.08, 6, 3);
      g.fillStyle = '#f7f7f4'; hg.fillStyle = '#f0f0f0'; for (let i = 0; i <= 2; i++) { g.fillRect(i * S / 2 - 6, 0, 12, S); g.fillRect(0, i * S / 2 - 6, S, 12); hg.fillRect(i * S / 2 - 6, 0, 12, S); hg.fillRect(0, i * S / 2 - 6, S, 12); }
      g.fillStyle = 'rgba(80,80,80,0.35)'; for (let i = 0; i <= 2; i++) { g.fillRect(i * S / 2 + 6, 0, 2, S); g.fillRect(0, i * S / 2 + 6, S, 2); }
    });
    T.maple = woodPlanks(512, 61, { rows: 4, tones: ['#d9ae74', '#cfa266', '#e2b982', '#c99b5e'], noSeams: true });
    T.oak = woodPlanks(512, 63, { rows: 6, tones: ['#9a6434', '#8c5a2c', '#a56c3a', '#875226', '#94602f'], knots: 6 });
    T.dark = woodPlanks(512, 65, { rows: 3, noSeams: true, tones: ['#6a3c1c', '#5c3318', '#734220', '#62381a'] });
    T.cork = texPair(512, (g, hg, S) => {
      g.fillStyle = '#b98a55'; g.fillRect(0, 0, S, S); const r = rng(71);
      for (let k = 0; k < 9000; k++) { const t = r(); g.fillStyle = t < 0.5 ? 'rgba(120,80,40,0.55)' : t < 0.8 ? 'rgba(215,170,110,0.6)' : 'rgba(80,50,25,0.6)'; const x = r() * S, y = r() * S, s = 1 + r() * 3.5; g.fillRect(x, y, s, s * (0.6 + r())); hg.fillStyle = t < 0.5 ? '#606060' : '#b0b0b0'; hg.fillRect(x, y, s, s); }
      noiseOver(g, S, S, 72, 0.2, 10, 4);
    });
    T.locker = texPair(256, (g, hg, W, H) => {
      g.fillStyle = '#3c6fb5'; g.fillRect(0, 0, W, H); noiseOver(g, W, H, 81, 0.1, 8, 3);
      g.strokeStyle = 'rgba(20,35,70,0.6)'; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); hg.strokeStyle = '#303030'; hg.lineWidth = 8; hg.strokeRect(8, 8, W - 16, H - 16);
      [[60, 4], [H - 150, 4]].forEach(([y0, n]) => { for (let i = 0; i < n; i++) { g.fillStyle = '#11192c'; g.fillRect(70, y0 + i * 22, W - 140, 9); hg.fillStyle = '#000'; hg.fillRect(68, y0 + i * 22 - 2, W - 136, 13); } });
      g.fillStyle = '#c9cfd6'; g.fillRect(W / 2 - 34, 190, 68, 36); g.fillStyle = '#222'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText(String(100 + Math.floor(Math.random() * 99)), W / 2, 218);
      const r = rng(83); for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(230,235,245,${0.15 + r() * 0.3})`; g.lineWidth = 1; g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 10); g.stroke(); }
    }, { h: 1024 });
    T.glossy = (c) => std(c, 0.45);
    const M = {
      wall: pbr(T.wall.c, T.wall.h, { rough: 0.85, bump: 2 }), wallF: pbr(T.wallF.c, T.wallF.h, { rough: 0.85, bump: 2 }),
      floor: pbr(T.floor.c, T.floor.h, { rough: 0.32, bump: 2 }), ceil: pbr(T.ceil.c, T.ceil.h, { rough: 0.95, bump: 2 }),
      maple: pbr(T.maple.c, T.maple.h, { rough: 0.38, bump: 1.5 }), oak: pbr(T.oak.c, T.oak.h, { rough: 0.5, bump: 2 }), dark: pbr(T.dark.c, T.dark.h, { rough: 0.55, bump: 2 }),
      cork: pbr(T.cork.c, T.cork.h, { rough: 0.95, bump: 3 }), locker: pbr(T.locker.c, T.locker.h, { rough: 0.42, bump: 2 }),
      trim: std('#f1ece2', 0.5), metal: std('#9aa3ad', 0.32, 0.75), steel: std('#5b6670', 0.35, 0.7), brass: std('#c79a3e', 0.28, 0.9),
      rubber: std('#2d2620', 0.7), glass: new THREE.MeshStandardMaterial({ color: '#d8ecff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.14, depthWrite: false }),
      blind: std('#f2eee4', 0.55), paper: std('#f6f3ea', 0.85), black: std('#1a1a1a', 0.5),
    };
    M.locker.metalness = 0.35;
    const W = (m, w, h) => wm(m, [w, h]);   // world-UV repeat helper

    // ---------------- shell ----------------
    const room = new THREE.Group(); scene.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), W(M.floor, 24 / 4.5, 20 / 4.5)); floor.rotation.x = -Math.PI / 2; room.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), W(M.ceil, 6, 5)); ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; room.add(ceil);
    room.add(box(26, 1, 22, M.trim, 0, RH + 0.5, 0));   // slab above (casts)
    const wallBox = (w, h, d, mat, x, y, z) => room.add(box(w, h, d, wm(mat, [1 / 4, 1 / 4]), x, y, z, true));
    // front (z=-10), back (z=10), right (x=12)
    wallBox(24, RH, 0.6, M.wallF, 0, RH / 2, Z0 - 0.3); wallBox(24, RH, 0.6, M.wall, 0, RH / 2, Z1 + 0.3); wallBox(0.6, RH, 21, M.wall, X1 + 0.3, RH / 2, 0);
    // left wall (x=-12) with three windows, z [-8.5,-3.5] [-2.5,2.5] [3.5,8.5], y 3..10
    const WINS = [-6, 0, 6], WY0 = 3, WY1 = 10, WW = 5;
    wallBox(0.6, WY0, 21, M.wall, X0 - 0.3, WY0 / 2, 0); wallBox(0.6, RH - WY1, 21, M.wall, X0 - 0.3, (RH + WY1) / 2, 0);
    [[-10.5, -8.5], [-3.5, -2.5], [2.5, 3.5], [8.5, 10.5]].forEach(([a, b]) => wallBox(0.6, WY1 - WY0, b - a, M.wall, X0 - 0.3, (WY0 + WY1) / 2, (a + b) / 2));
    // wainscot (oak panels) + chair rail + baseboard on front/back/right walls
    const wains = (len, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; room.add(g);
      g.add(box(len, 3.0, 0.12, W(M.oak, len / 4, 0.8), 0, 1.5, 0.06, true));
      for (let u = -len / 2 + 1.2; u < len / 2 - 0.6; u += 2.4) g.add(box(2.0, 1.9, 0.05, W(M.oak, 0.5, 0.5), u, 1.65, 0.14, true));
      g.add(box(len, 0.22, 0.22, M.dark, 0, 3.08, 0.12), box(len, 0.5, 0.2, M.dark, 0, 0.25, 0.12), box(len, 0.25, 0.2, M.trim, 0, RH - 0.13, 0.1));
    };
    wains(24, 0, Z1, Math.PI); wains(20, X1, 0, -Math.PI / 2); wains(24, 0, Z0, 0);
    // left wall: baseboard + crown + window trims, sills, glass, mullions, blinds
    room.add(box(0.2, 0.5, 20, M.dark, X0 + 0.1, 0.25, 0), box(0.2, 0.25, 20, M.trim, X0 + 0.1, RH - 0.13, 0));
    room.add(box(0.12, 3.0, 20, W(M.oak, 5, 0.8), X0 + 0.06, 1.5, 0, true));
    const slatGeo = new THREE.BoxGeometry(0.03, 0.2, WW - 0.1);
    WINS.forEach((zc, wi) => {
      const z0 = zc - WW / 2, z1 = zc + WW / 2;
      room.add(box(0.28, 0.3, WW + 0.6, M.trim, X0 + 0.12, WY1 + 0.15, zc), box(0.28, WY1 - WY0, 0.3, M.trim, X0 + 0.12, (WY0 + WY1) / 2, z0 - 0.15), box(0.28, WY1 - WY0, 0.3, M.trim, X0 + 0.12, (WY0 + WY1) / 2, z1 + 0.15));
      room.add(box(0.9, 0.18, WW + 0.8, M.trim, X0 + 0.15, WY0 - 0.02, zc));
      // reveal sides (inside the wall thickness)
      room.add(box(0.6, 0.1, WW, M.trim, X0 - 0.3, WY0 + 0.05, zc), box(0.6, 0.1, WW, M.trim, X0 - 0.3, WY1 - 0.05, zc));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(WW, WY1 - WY0), M.glass); gl.rotation.y = Math.PI / 2; gl.position.set(X0 - 0.35, (WY0 + WY1) / 2, zc); gl.userData.noShadow = true; room.add(gl);
      // mullions: 2 vertical + 1 transom
      [-WW / 6, WW / 6].forEach((dz) => room.add(box(0.14, WY1 - WY0, 0.14, M.trim, X0 - 0.35, (WY0 + WY1) / 2, zc + dz * 1.5)));
      room.add(box(0.14, 0.14, WW, M.trim, X0 - 0.35, 7.6, zc));
      // venetian blinds: head rail, slats lowered to bottom yb, tilted half-open -> stripes
      const yb = [6.2, 5.4, 6.8][wi], g = new THREE.Group(); room.add(g);
      g.add(box(0.3, 0.3, WW + 0.2, M.blind, X0 + 0.2, WY1 - 0.15, zc));
      for (let y = WY1 - 0.4; y > yb; y -= 0.21) { const s = new THREE.Mesh(slatGeo, M.blind); s.position.set(X0 + 0.2, y, zc); s.rotation.z = 0.75; g.add(s); }
      g.add(box(0.12, 0.08, WW, M.blind, X0 + 0.2, yb - 0.04, zc));
      [-1.6, 0, 1.6].forEach((dz) => g.add(box(0.01, WY1 - yb, 0.01, M.paper, X0 + 0.16, (WY1 + yb) / 2, zc + dz)));
      const cord = cyl(0.015, 0.015, 3.0, M.paper, X0 + 0.25, yb - 0.6, z1 - 0.2, 4); g.add(cord);
      g.add(cyl(0.05, 0.04, 0.18, M.paper, X0 + 0.25, yb - 2.1, z1 - 0.2, 8));
      // radiator under each window
      const rad = new THREE.Group(); rad.position.set(X0 + 0.55, 0, zc); room.add(rad);
      for (let k = -2.0; k <= 2.0; k += 0.22) rad.add(rb(0.45, 2.2, 0.12, 0.05, std('#ece6d8', 0.45, 0.3), 0, 1.35, k));
      rad.add(box(0.3, 0.12, 4.4, M.steel, 0, 0.45, 0));
    });
    // outside: sky, grass, trees, fence (no shadows)
    const out = new THREE.Group(); scene.add(out);
    const skyC = cnv(64, 256), sg = skyC.getContext('2d'), sgr = sg.createLinearGradient(0, 0, 0, 256); sgr.addColorStop(0, '#5f9cf0'); sgr.addColorStop(0.65, '#a9cdf6'); sgr.addColorStop(1, '#eef6ff'); sg.fillStyle = sgr; sg.fillRect(0, 0, 64, 256);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(140, 60), new THREE.MeshBasicMaterial({ map: tex(skyC) })); sky.material.color.setScalar(1.25); sky.rotation.y = Math.PI / 2; sky.position.set(-60, 20, 0); out.add(sky);
    const grass = texPair(256, (g, hg, S) => { g.fillStyle = '#5f9a3c'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 91, 0.35, 12, 4); const r = rng(92); for (let k = 0; k < 3000; k++) { g.fillStyle = r() < 0.5 ? 'rgba(130,190,80,0.6)' : 'rgba(50,90,30,0.6)'; g.fillRect(r() * S, r() * S, 1, 3); } });
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(60, 120), pbr(grass.c, grass.h, { rough: 0.95, repeat: [15, 30] })); gm.rotation.x = -Math.PI / 2; gm.position.set(-42.5, -0.6, 0); out.add(gm);
    const leafM = [std('#4f8f37', 0.9), std('#3f7a2c', 0.9), std('#6aa646', 0.9)], trunkM = std('#6b4a2e', 0.9);
    const rT = rng(95);
    for (let i = 0; i < 14; i++) { const x = -26 - rT() * 14, z = -30 + i * 4.6 + rT() * 2, s = 2.5 + rT() * 2.5;
      out.add(cyl(0.35, 0.5, 6, trunkM, x, 2.4, z, 8));
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s * (0.6 + rT() * 0.4), 1), leafM[k % 3]); b.position.set(x + (rT() - 0.5) * s, 6 + rT() * s, z + (rT() - 0.5) * s); out.add(b); } }
    for (let z = -20; z <= 20; z += 1.2) out.add(box(0.1, 2.2, 0.1, M.metal, -18, 0.5, z)); out.add(box(0.1, 0.1, 40, M.metal, -18, 1.6, 0));
    out.add(box(8, 6, 14, std('#b5553c', 0.9), -40, 2.4, -14)); out.add(box(8.6, 0.6, 14.6, std('#6b6b6b', 0.8), -40, 5.6, -14));   // the gym across the yard

    // ---------------- ceiling: fluorescent panels ----------------
    const panC = cnv(128, 256), pg = panC.getContext('2d'); pg.fillStyle = '#fffaf0'; pg.fillRect(0, 0, 128, 256); pg.fillStyle = '#d8d4cc';
    for (let i = 1; i < 4; i++) pg.fillRect(i * 32 - 2, 0, 4, 256); for (let j = 1; j < 8; j++) pg.fillRect(0, j * 32 - 2, 128, 4);
    const panM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, map: tex(panC), emissive: new THREE.Color('#fff4e2'), emissiveMap: tex(panC), emissiveIntensity: 2.4 });
    const panels = [];
    [-6, 0, 6].forEach((x) => [-5, 4].forEach((z) => { room.add(box(2.2, 0.14, 4.2, M.metal, x, RH - 0.07, z)); const p = box(1.9, 0.04, 3.9, panM, x, RH - 0.16, z); p.userData.noShadow = true; room.add(p); panels.push(p); }));

    // ---------------- chalkboard ----------------
    const BW = 2048, BH = 768, BWU = 12, BHU = 4.5, BY = 5.9;   // board 12 x 4.5 units, centre y
    const boardC = cnv(BW, BH), bg0 = cnv(BW, BH);
    (function boardBG() {
      const g = bg0.getContext('2d'); g.fillStyle = '#2c4a37'; g.fillRect(0, 0, BW, BH); noiseOver(g, BW, BH, 101, 0.22, 10, 4);
      const r = rng(103);
      // eraser smudges: wide soft arcs
      g.lineCap = 'round'; for (let k = 0; k < 70; k++) { const x = r() * BW, y = r() * BH, R = 60 + r() * 220; g.strokeStyle = `rgba(220,235,225,${0.025 + r() * 0.045})`; g.lineWidth = 30 + r() * 60; g.beginPath(); g.arc(x, y, R, r() * 6, r() * 6 + 1 + r() * 2); g.stroke(); }
      // old, half-erased writing
      g.font = `64px ${FONT}`; g.fillStyle = 'rgba(230,240,230,0.09)'; [['7 x 8 = 56', 120, 160], ['2 + 2 = 4', 1500, 640], ['spelling: CLOUD', 1430, 150], ['12 / 3 = 4', 160, 640], ['MATH p.42', 160, 420]].forEach(([t, x, y]) => g.fillText(t, x, y));
      // dust along the bottom edge
      const gr = g.createLinearGradient(0, BH - 110, 0, BH); gr.addColorStop(0, 'rgba(230,240,230,0)'); gr.addColorStop(1, 'rgba(230,240,230,0.18)'); g.fillStyle = gr; g.fillRect(0, BH - 110, BW, 110);
      // corner doodles: date, star, smiley
      g.font = `52px ${FONT}`; g.fillStyle = 'rgba(245,245,235,0.75)'; g.fillText('DATE: THURSDAY', 60, 80);
      g.strokeStyle = 'rgba(250,225,120,0.7)'; g.lineWidth = 6; KIT.star(g, 1880, 120, 60); g.stroke();
      g.strokeStyle = 'rgba(250,160,190,0.6)'; g.beginPath(); g.arc(1850, 380, 55, 0, 7); g.stroke(); g.beginPath(); g.arc(1850, 395, 30, 0.3, 2.8); g.stroke(); g.fillStyle = 'rgba(250,160,190,0.6)'; g.fillRect(1830, 360, 8, 14); g.fillRect(1864, 360, 8, 14);
    })();
    const boardTex = tex(boardC); boardTex.anisotropy = 16;
    function chalkLine(g, text, x, y, size, seed, color) {
      const r = rng(seed), tmp = cnv(BW, Math.ceil(size * 1.8)), t = tmp.getContext('2d'); t.font = `${size}px ${FONT}`; t.fillStyle = color; t.textBaseline = 'middle';
      let cx = 0; for (const ch of text) { t.save(); t.translate(cx, size * 0.9 + (r() - 0.5) * size * 0.08); t.rotate((r() - 0.5) * 0.08); t.fillText(ch, 0, 0); t.restore(); cx += t.measureText(ch).width * (0.96 + r() * 0.06); }
      // chalk tooth: punch random holes
      t.globalCompositeOperation = 'destination-out'; for (let k = 0; k < cx * size * 0.05; k++) { t.fillStyle = `rgba(0,0,0,${0.4 + r() * 0.6})`; t.fillRect(r() * cx, r() * size * 1.8, 1 + r() * 2.5, 1 + r() * 1.5); }
      g.save(); g.globalAlpha = 0.28; g.filter = 'blur(5px)'; g.drawImage(tmp, x, y - size * 0.9); g.restore();
      g.drawImage(tmp, x, y - size * 0.9); return cx;
    }
    // lines[]: first = title (bigger, underlined); a line of 1-2 chars (e.g. "?") is drawn huge. Optional {text,color} objects.
    function setBoard(lines) {
      const g = boardC.getContext('2d'); g.drawImage(bg0, 0, 0);
      const AX = 624, AW = 800, AY0 = 70, AY1 = BH - 70;
      const items = []; let size = 84;
      const layout = (sz) => { const tm = cnv(8, 8).getContext('2d'); items.length = 0; let h = 0;
        lines.forEach((L, i) => { const o = typeof L === 'string' ? { text: L } : L, big = o.text.trim().length <= 2, s = big ? sz * 2.6 : i === 0 ? sz * 1.2 : sz; tm.font = `${s}px ${FONT}`;
          const words = o.text.split(' '); let cur = '';
          const push = (t) => { items.push({ t, s, i, color: o.color || (i === 0 ? '#fbf6e0' : '#f2f2ea'), big }); h += s * 1.18; };
          words.forEach((w) => { const tr = cur ? cur + ' ' + w : w; if (tm.measureText(tr).width > AW && cur) { push(cur); cur = w; } else cur = tr; }); push(cur); if (i === 0) h += sz * 0.3; });
        return h; };
      while (layout(size) > AY1 - AY0 && size > 30) size -= 4;
      let y = AY0; items.forEach((it, k) => { y += it.s * 1.05; const tm = g; tm.font = `${it.s}px ${FONT}`;
        const x = it.i === 0 || it.big ? AX + (AW - tm.measureText(it.t).width) / 2 : AX + (it.t.match(/^\d\./) ? 0 : 50);
        const w = chalkLine(g, it.t, x, y - it.s * 0.35, it.s, 200 + k * 17, it.color);
        if (it.i === 0 && (k === items.length - 1 || items[k + 1].i !== 0)) { const r = rng(7 + k); g.strokeStyle = 'rgba(250,240,200,0.85)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 10, y + 22); for (let u = 0; u <= 1.001; u += 0.1) g.lineTo(x - 10 + u * (w + 20), y + 22 + Math.sin(u * 9) * 3 + (r() - 0.5) * 4); g.stroke(); y += size * 0.3; }
        y += it.s * 0.13; });
      boardTex.needsUpdate = true;
    }
    setBoard(['THURSDAY RULES', '1. HEAR THE BELL → HEAD ON DESK', '2. COUNT TO 1000', "3. DON'T LOOK UP"]);
    const boardM = new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.92, emissive: new THREE.Color('#ffffff'), emissiveMap: boardTex, emissiveIntensity: 0.05 });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(BWU, BHU), boardM); board.position.set(0, BY, Z0 + 0.12); room.add(board);
    props.board = board; props.setBoard = setBoard; board.userData.setBoard = setBoard;
    // frame, tray, chalk, eraser
    const fr = W(M.oak, 3, 0.3);
    room.add(box(BWU + 0.5, 0.25, 0.22, fr, 0, BY + BHU / 2 + 0.12, Z0 + 0.12, true), box(0.25, BHU + 0.5, 0.22, fr, -BWU / 2 - 0.12, BY, Z0 + 0.12, true), box(0.25, BHU + 0.5, 0.22, fr, BWU / 2 + 0.12, BY, Z0 + 0.12, true));
    room.add(box(BWU + 0.5, 0.12, 0.55, fr, 0, BY - BHU / 2 - 0.08, Z0 + 0.3, true), box(BWU + 0.5, 0.18, 0.08, fr, 0, BY - BHU / 2 - 0.02, Z0 + 0.55, true));
    const rC = rng(111), chalkM = [std('#f6f4ec', 0.95), std('#f3e27a', 0.95), std('#f2a6c4', 0.95), std('#9fd2f2', 0.95)];
    for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.35 + rC() * 0.3, 8), chalkM[i % 4]); c.rotation.z = Math.PI / 2; c.rotation.y = (rC() - 0.5) * 0.6; c.position.set(-5 + rC() * 10, BY - BHU / 2 + 0.03, Z0 + 0.32); room.add(c); }
    [[-2.6, 0.1], [3.9, -0.2]].forEach(([x, a]) => { const e = new THREE.Group(); e.position.set(x, BY - BHU / 2 + 0.03, Z0 + 0.32); e.rotation.y = a; e.add(box(0.95, 0.14, 0.32, std('#3c3c44', 1), 0, 0.07, 0), box(0.95, 0.12, 0.32, M.oak, 0, 0.2, 0)); room.add(e); });
    // alphabet strip above the board
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', abcCol = ['#e3483c', '#f2a63a', '#3fa35a', '#3d7ad6', '#9b59c9'];
    for (let i = 0; i < 26; i++) { const c = KIT.textTex(96, 96, (g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = abcCol[i % 5]; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = abcCol[i % 5]; g.font = 'bold 56px Arial'; g.textAlign = 'center'; g.fillText(abc[i] + abc[i].toLowerCase(), w / 2, 68); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), std('#fff', 0.8, 0, { map: c })); m.position.set(-8.4 + i * 0.672, 8.95, Z0 + 0.04); room.add(m); }

    // ---------------- clock ----------------
    const clock = new THREE.Group(); clock.position.set(0, 10.35, Z0 + 0.05); room.add(clock);
    const faceT = KIT.textTex(256, 256, (g) => { g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#151515'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let h = 1; h <= 12; h++) { const a = (h / 12) * Math.PI * 2; g.fillText(String(h), 128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); }
      for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2; g.fillRect(128 + Math.sin(a) * 118 - 1, 128 - Math.cos(a) * 118 - 1, k % 5 ? 2 : 5, k % 5 ? 2 : 5); } });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.09, 10, 40), std('#222', 0.35, 0.3)); rim.position.z = 0.1; clock.add(rim);
    const cf = new THREE.Mesh(new THREE.CircleGeometry(0.78, 40), std('#fff', 0.5, 0, { map: faceT })); cf.position.z = 0.08; clock.add(cf);
    const hand = (len, w, mat, z) => { const p = new THREE.Group(); p.position.z = z; const m = box(w, len, 0.02, mat, 0, len / 2 - 0.08, 0); p.add(m); clock.add(p); return p; };
    const clockH = hand(0.42, 0.07, M.black, 0.12), clockM = hand(0.62, 0.05, M.black, 0.13), clockS = hand(0.66, 0.015, std('#d22', 0.5), 0.14);
    clockH.rotation.z = -((1 + 50 / 60) / 12) * Math.PI * 2; clockM.rotation.z = -(50 / 60) * Math.PI * 2; clockS.rotation.z = -1.2;
    const glassC = new THREE.Mesh(new THREE.CircleGeometry(0.8, 40), new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: 0.02, transparent: true, opacity: 0.08, clearcoat: 1 })); glassC.position.z = 0.17; glassC.userData.noShadow = true; clock.add(glassC);
    props.clock = clock; props.clockHour = clockH; props.clockMin = clockM; props.clockSec = clockS;

    // ---------------- bell (right wall) ----------------
    const bell = new THREE.Group(); bell.position.set(X1 - 0.02, 8.2, -3.6); bell.rotation.y = -Math.PI / 2; room.add(bell);
    const bellRed = new THREE.MeshPhysicalMaterial({ color: '#c3231c', roughness: 0.22, metalness: 0.55, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    bell.add(rb(0.95, 1.25, 0.12, 0.05, M.brass, 0, -0.15, 0.06));                // mounting plate
    bell.add(rb(0.55, 0.45, 0.35, 0.06, std('#2b2b2e', 0.4, 0.6), 0, -0.55, 0.25));  // motor box
    [[-0.32, 0.25], [0.32, 0.25], [-0.32, -0.6], [0.32, -0.6]].forEach(([x, y]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.metal); s.position.set(x, y, 0.13); bell.add(s); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), bellRed); dome.rotation.x = Math.PI / 2; dome.scale.set(1, 0.6, 1); dome.position.set(0, 0.15, 0.14); bell.add(dome);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.045, 10, 48), bellRed); lip.position.set(0, 0.15, 0.15); bell.add(lip);
    const nut = cyl(0.12, 0.12, 0.12, M.brass, 0, 0.15, 0.66, 16); nut.rotation.x = Math.PI / 2; bell.add(nut);
    const striker = new THREE.Group(); striker.position.set(0, -0.55, 0.45); bell.add(striker);
    const arm = cyl(0.03, 0.03, 0.75, M.brass, 0, 0.36, 0.2, 8); arm.rotation.x = 0.5; striker.add(arm);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), M.brass); ball.position.set(0, 0.68, 0.38); striker.add(ball);
    const wire = cyl(0.025, 0.025, 2.6, M.black, 0, 1.6, 0.03, 6); bell.add(wire);
    props.bell = bell; props.bellStriker = striker; bell.userData.striker = striker;
    // door on the right wall (front), with wired-glass slot
    const door = new THREE.Group(); door.position.set(X1 - 0.03, 0, -7.4); door.rotation.y = -Math.PI / 2; room.add(door);
    door.add(box(3.4, 8.0, 0.2, W(M.oak, 1, 2), 0, 4.0, 0.08, true));
    door.add(box(3.9, 0.35, 0.3, M.trim, 0, 8.15, 0.12), box(0.3, 8.1, 0.3, M.trim, -1.85, 4.05, 0.12), box(0.3, 8.1, 0.3, M.trim, 1.85, 4.05, 0.12));
    door.add(box(0.75, 2.6, 0.04, std('#bcd6e8', 0.1, 0.2, { emissive: new THREE.Color('#9cbcd8'), emissiveIntensity: 0.5 }), -0.9, 5.4, 0.2), box(0.95, 2.8, 0.06, M.steel, -0.9, 5.4, 0.18));
    door.add(cyl(0.12, 0.12, 0.3, M.metal, 1.2, 3.6, 0.25, 12).rotateX(Math.PI / 2), box(0.5, 0.08, 0.1, M.metal, 1.05, 3.6, 0.42));
    door.add(box(1.6, 0.25, 0.12, std('#2a7a3a', 0.5, 0, { emissive: new THREE.Color('#33ff77'), emissiveIntensity: 0.4 }), 0, 8.7, 0.12));
    const exitT = KIT.textTex(256, 64, (g) => { g.fillStyle = '#1e6a32'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#e8ffe8'; g.font = 'bold 48px Arial'; g.textAlign = 'center'; g.fillText('EXIT', 128, 50); });
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.22), new THREE.MeshBasicMaterial({ map: exitT, color: new THREE.Color(1.6, 1.6, 1.6) })); ex.position.set(0, 8.7, 0.19); door.add(ex);

    // ---------------- flag (front-right corner, angled pole) ----------------
    const flagT = KIT.textTex(384, 220, (g, w, h) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f6f2ea' : '#b8282c'; g.fillRect(0, (i * h) / 13, w, h / 13 + 1); } g.fillStyle = '#273a7a'; g.fillRect(0, 0, w * 0.42, (h * 7) / 13); g.fillStyle = '#fff'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { KIT.star(g, 14 + c * 26 + (r % 2) * 13, 14 + r * 22, 6); g.fill(); } });
    const fg = new THREE.Group(); fg.position.set(10.6, 8.6, Z0 + 0.25); fg.rotation.z = 0.55; fg.rotation.y = 0.35; room.add(fg);
    fg.add(cyl(0.05, 0.05, 4.2, M.brass, 0, 2.0, 0, 8)); const top = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), M.brass); top.position.y = 4.15; fg.add(top);
    const flGeo = new THREE.PlaneGeometry(2.4, 1.4, 20, 4); { const p = flGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 1.2; p.setZ(i, Math.sin(x * 2.4) * 0.12 * x / 2.4); p.setY(i, p.getY(i) - x * 0.35); } flGeo.computeVertexNormals(); }
    const flag = new THREE.Mesh(flGeo, std('#fff', 0.85, 0, { map: flagT, side: THREE.DoubleSide })); flag.position.set(-1.2, 3.25, 0); flag.rotation.z = -0.55; fg.add(flag);
    room.add(box(0.3, 0.5, 0.3, M.brass, 10.6, 8.6, Z0 + 0.15));

    // ---------------- posters ----------------
    const poster = (w, h, pw, ph, draw, x, y, z, ry, rz = 0) => { const t = KIT.textTex(pw, ph, draw); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std('#fff', 0.55, 0, { map: t })); m.position.set(x, y, z); m.rotation.set(0, ry, rz); room.add(m); return m; };
    const tackOn = (m) => m;
    poster(2.6, 3.4, 260, 340, (g, w, h) => { g.fillStyle = '#ffd84a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8473c'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('BE', w / 2, 90); g.fillText('KIND', w / 2, 160); g.fillStyle = '#3b8de0'; g.beginPath(); g.arc(w / 2, 245, 60, 0, 7); g.fill(); g.fillStyle = '#111'; g.fillRect(w / 2 - 25, 225, 12, 18); g.fillRect(w / 2 + 13, 225, 12, 18); g.strokeStyle = '#111'; g.lineWidth = 7; g.beginPath(); g.arc(w / 2, 250, 32, 0.4, 2.7); g.stroke(); g.strokeStyle = '#e8473c'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }, -8.8, 6.2, Z0 + 0.03, 0, 0.03);
    poster(2.6, 3.4, 260, 340, (g, w, h) => { g.fillStyle = '#eaf4ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4e9c'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('TIMES TABLE', w / 2, 38); g.font = 'bold 17px Arial';
      for (let i = 1; i <= 10; i++) for (let j = 1; j <= 10; j++) { g.fillStyle = (i + j) % 2 ? '#fff' : '#cfe3ff'; g.fillRect(20 + (j - 1) * 22, 55 + (i - 1) * 27, 22, 27); g.fillStyle = i === 1 || j === 1 ? '#c8302a' : '#123'; g.fillText(String(i * j), 31 + (j - 1) * 22, 75 + (i - 1) * 27); } }, 8.8, 6.2, Z0 + 0.03, 0, -0.02);
    poster(4.2, 2.6, 420, 260, (g, w, h) => { g.fillStyle = '#0d1840'; g.fillRect(0, 0, w, h); const r = rng(5); for (let k = 0; k < 120; k++) { g.fillStyle = '#fff'; g.fillRect(r() * w, r() * h, 1.5, 1.5); } g.fillStyle = '#ffcc33'; g.beginPath(); g.arc(-30, h / 2, 90, 0, 7); g.fill();
      [['#b0a090', 6], ['#e8c070', 9], ['#3d8de0', 10], ['#d0502a', 8], ['#d8a870', 24], ['#e8d090', 20], ['#90d8e8', 14], ['#4060e0', 14]].forEach(([c, s], i) => { g.fillStyle = c; g.beginPath(); g.arc(80 + i * 44, h / 2 + Math.sin(i) * 30, s, 0, 7); g.fill(); });
      g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('OUR SOLAR SYSTEM', w / 2, 40); }, X1 - 0.03, 8.4, 4.2, -Math.PI / 2);
    poster(2.4, 2.4, 240, 240, (g, w, h) => { g.fillStyle = '#8ed16a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText('RAISE YOUR', w / 2, 60); g.fillText('HAND!', w / 2, 100); g.fillStyle = '#f2c79a'; g.fillRect(w / 2 - 22, 120, 44, 90); g.fillRect(w / 2 - 22, 110, 9, 30); g.fillRect(w / 2 - 9, 102, 9, 30); g.fillRect(w / 2 + 4, 104, 9, 30); g.fillRect(w / 2 + 16, 112, 8, 28); }, X1 - 0.03, 8.6, 8.2, -Math.PI / 2, 0.04);
    poster(1.9, 2.5, 190, 250, (g, w, h) => { g.fillStyle = '#fff3d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d2551e'; g.font = 'bold 28px Arial'; g.textAlign = 'center'; g.fillText('WEATHER', w / 2, 36); g.fillStyle = '#ffc21f'; g.beginPath(); g.arc(w / 2, 100, 36, 0, 7); g.fill(); g.fillStyle = '#9ac6ee'; g.beginPath(); g.arc(60, 190, 26, 0, 7); g.arc(95, 180, 32, 0, 7); g.arc(130, 192, 24, 0, 7); g.fill(); g.fillStyle = '#333'; g.font = '20px Arial'; g.fillText('TODAY: SUNNY', w / 2, 240); }, X0 + 0.03, 6.6, -3.0, Math.PI / 2);
    poster(5.2, 2.8, 520, 280, (g, w, h) => { g.fillStyle = '#9fd0f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#6cb35a'; [[90, 90, 70, 50], [150, 190, 40, 60], [270, 80, 50, 40], [290, 170, 40, 55], [400, 110, 80, 50], [450, 210, 40, 25]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x, y, a, b, 0.3, 0, 7); g.fill(); }); g.strokeStyle = '#5c3a1a'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#123'; g.font = 'bold 22px Arial'; g.fillText('THE WORLD', 20, 30); }, 5.5, 9.6, Z1 - 0.03, Math.PI);

    // ---------------- teacher desk ----------------
    const td = new THREE.Group(); td.position.set(0, 0, -7); room.add(td);
    td.add(rb(6.2, 0.22, 2.6, 0.05, W(M.dark, 1.5, 0.7), 0, 3.6, 0));
    [-1, 1].forEach((s) => { td.add(rb(1.9, 3.5, 2.4, 0.04, W(M.dark, 0.5, 0.9), s * 2.05, 1.75, 0));
      for (let k = 0; k < 3; k++) { td.add(rb(1.65, 0.95, 0.08, 0.03, W(M.oak, 0.4, 0.25), s * 2.05, 0.65 + k * 1.05, -1.22)); td.add(box(0.5, 0.08, 0.1, M.brass, s * 2.05, 0.85 + k * 1.05, -1.3)); } });
    td.add(box(2.3, 2.6, 0.1, W(M.dark, 0.6, 0.6), 0, 2.2, 1.12, true));   // modesty panel (kids' side)
    // apple
    const apple = new THREE.Group(); apple.position.set(-2.2, 3.71, 0.5); td.add(apple);
    const ap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#c41d1d', roughness: 0.3, clearcoat: 0.7 })); ap.scale.set(1, 0.9, 1); ap.position.y = 0.27; apple.add(ap);
    apple.add(cyl(0.02, 0.025, 0.18, std('#4a2e16', 0.8), 0.02, 0.6, 0, 6)); const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 6), std('#3f9a32', 0.6)); leaf.scale.set(1.4, 0.2, 0.6); leaf.position.set(0.1, 0.62, 0); leaf.rotation.z = 0.5; apple.add(leaf);
    props.apple = apple;
    // stack of books
    const bookCols = ['#2f5fb3', '#b8322a', '#2f8a4a', '#e0a12a', '#6b3c9a', '#1f6d77', '#c4562a', '#384a5a'];
    const bookM = bookCols.map((c) => std(c, 0.6)), pageM = std('#efe8d6', 0.9);
    const book = (w, h, d, ci, x, y, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.add(rb(w, h, d, 0.02, bookM[ci % bookM.length], 0, 0, 0), box(w - 0.08, h * 0.8, d + 0.01, pageM, 0.04, 0, 0)); return g; };
    [[1.6, 0.25, 1.1, 0], [1.4, 0.22, 1.0, 1], [1.5, 0.3, 1.05, 3], [1.2, 0.2, 0.9, 4]].reduce((y, [w, h, d, c], i) => { td.add(book(w, h, d, c, 1.9 + (i % 2) * 0.1, y + h / 2, 0.2, (i - 1.5) * 0.12)); return y + h; }, 3.71);
    // globe
    const globeT = KIT.textTex(512, 256, (g, w, h) => { g.fillStyle = '#3b7fd0'; g.fillRect(0, 0, w, h); g.fillStyle = '#5aa64a'; const r = rng(121); for (let k = 0; k < 16; k++) { g.beginPath(); g.ellipse(r() * w, 40 + r() * (h - 80), 20 + r() * 50, 15 + r() * 40, r() * 3, 0, 7); g.fill(); } g.fillStyle = '#e8d8a0'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(r() * w, 60 + r() * (h - 120), 10 + r() * 20, 8 + r() * 14, 0, 0, 7); g.fill(); } g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo((i * w) / 12, 0); g.lineTo((i * w) / 12, h); g.stroke(); } });
    const globe = new THREE.Group(); globe.position.set(2.4, 3.71, -0.6); td.add(globe);
    globe.add(cyl(0.35, 0.42, 0.12, M.dark, 0, 0.06, 0, 20), cyl(0.04, 0.04, 0.4, M.brass, 0, 0.3, 0, 8));
    const gs = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 20), new THREE.MeshPhysicalMaterial({ map: globeT, roughness: 0.3, clearcoat: 0.5 })); gs.position.y = 1.15; gs.rotation.z = 0.41; gs.rotation.y = 2; globe.add(gs);
    const mer = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 6, 40, Math.PI * 1.2), M.brass); mer.position.y = 1.15; mer.rotation.z = 0.41 - Math.PI * 0.1; globe.add(mer);
    props.globe = globe;
    // mug of pencils, papers, nameplate
    const mug = cyl(0.2, 0.18, 0.45, std('#e8e2d0', 0.3), -0.8, 3.94, -0.5, 16); td.add(mug);
    const pM = [std('#f2c12e', 0.6), std('#d33', 0.6), std('#36c', 0.6)]; for (let i = 0; i < 5; i++) { const p = cyl(0.025, 0.025, 0.85, pM[i % 3], -0.8 + (i - 2) * 0.05, 4.25, -0.5 + ((i % 2) - 0.5) * 0.08, 6); p.rotation.z = (i - 2) * 0.12; td.add(p); }
    for (let i = 0; i < 6; i++) { const s = box(1.1, 0.012, 1.4, M.paper, 0.3, 3.72 + i * 0.012, 0.3); s.rotation.y = (i - 3) * 0.06; td.add(s); }
    const npT = KIT.textTex(256, 64, (g) => { g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#d8b766'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.fillText('MRS. HALE', 128, 44); });
    const np = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), std('#fff', 0.4, 0.2, { map: npT })); np.position.set(-0.3, 3.92, 1.05); np.rotation.x = -0.35; td.add(np); td.add(box(1.5, 0.35, 0.18, M.dark, -0.3, 3.88, 0.96));
    // teacher chair (behind the desk)
    const tc = new THREE.Group(); tc.position.set(-0.4, 0, -9.0); tc.rotation.y = 0.2; room.add(tc);
    tc.add(rb(2.0, 0.4, 1.9, 0.15, std('#2a2d33', 0.8), 0, 2.0, 0), rb(2.0, 2.4, 0.35, 0.15, std('#2a2d33', 0.8), 0, 3.5, -0.8), cyl(0.08, 0.08, 1.4, M.steel, 0, 1.1, 0, 8));
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2, l = box(1.1, 0.12, 0.16, M.steel, Math.cos(a) * 0.55, 0.3, Math.sin(a) * 0.55); l.rotation.y = -a; tc.add(l); }
    // waste bin with paper balls
    const bin = new THREE.Group(); bin.position.set(4.0, 0, -6.2); room.add(bin);
    bin.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.48, 1.5, 24, 1, true), std('#2f6fb8', 0.5, 0, { side: THREE.DoubleSide })).translateY(0.75), cyl(0.48, 0.48, 0.04, std('#2f6fb8', 0.5), 0, 0.02, 0, 24));
    const ballM = std('#f1eee6', 0.9); [[0.1, 1.35, 0.1], [-0.2, 1.3, -0.1], [0.15, 1.28, -0.25], [0.9, 0.18, 0.4], [-0.7, 0.18, 0.7]].forEach(([x, y, z]) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), ballM); b.position.set(x, y, z); b.rotation.set(x * 7, y * 5, z * 3); bin.add(b); });

    // ---------------- student desks (desk + chair combos) ----------------
    const COLS = [-7.5, -2.5, 2.5, 7.5], ROWS = [-2, 2.5, 7];
    const edgeM = std('#5a4632', 0.55), deskTopM = [edgeM, edgeM, W(M.maple, 2.8 / 4, 2.0 / 4), M.steel, edgeM, edgeM];
    const seatMs = ['#e0662a', '#2f6cc4', '#3b9a4c', '#d03a3a'].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.38, clearcoat: 0.3 }));
    const tube = (r, h, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 10), M.metal); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); return m; };
    const nbT = [0, 1, 2].map((k) => KIT.textTex(128, 160, (g, w, h) => { g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8fb2e0'; g.lineWidth = 1.5; for (let y = 22; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = '#e07a7a'; g.beginPath(); g.moveTo(18, 0); g.lineTo(18, h); g.stroke(); g.strokeStyle = '#555'; g.lineWidth = 1.2; const r = rng(130 + k); for (let y = 34; y < h - 20; y += 12) { g.beginPath(); g.moveTo(24, y); let x = 24; while (x < w - 10 - r() * 30) { x += 4 + r() * 8; g.lineTo(x, y - r() * 4); } g.stroke(); } }));
    const sheetM = nbT.map((t) => std('#fff', 0.8, 0, { map: t }));
    const packCols = ['#d64a4a', '#3a6fd0', '#f0b030', '#7a4ac0', '#2a9a7a', '#e46aa0', '#3c3c44'];
    const backpack = (ci) => { const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: packCols[ci % packCols.length], roughness: 0.75, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') });
      g.add(rb(1.2, 1.5, 0.6, 0.22, m, 0, 0.75, 0), rb(0.9, 0.6, 0.3, 0.12, m, 0, 0.5, 0.38), box(0.92, 0.04, 0.05, M.black, 0, 0.82, 0.52));
      [-0.35, 0.35].forEach((x) => g.add(box(0.14, 1.2, 0.08, M.black, x, 0.85, -0.32))); g.add(box(0.5, 0.08, 0.08, M.black, 0, 1.55, 0)); return g; };
    const rD = rng(141);
    COLS.forEach((x, ci) => ROWS.forEach((z, ri) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); room.add(g);   // local -z = front (towards the board)
      const sm = seatMs[(ci + ri * 2) % 4];
      // chair: seat top at 1.5 (thighs rest on it), back behind the torso
      g.add(rb(2.2, 0.16, 1.9, 0.07, sm, 0, 1.42, -0.35));
      const back = rb(2.2, 1.4, 0.14, 0.07, sm, 0, 3.25, 0.78); back.rotation.x = -0.08; g.add(back);
      [-0.95, 0.95].forEach((sx) => { g.add(tube(0.065, 1.34, sx, 0.67, 0.45), tube(0.065, 1.34, sx, 0.67, -1.1), tube(0.055, 1.9, sx, 2.3, 0.72, -0.05), tube(0.05, 1.6, sx, 0.08, -0.32, Math.PI / 2)); });
      g.add(box(1.8, 0.04, 1.3, M.steel, 0, 0.55, -0.35)); [-0.88, 0.88].forEach((sx) => g.add(box(0.03, 0.25, 1.3, M.steel, sx, 0.66, -0.35)));
      // desk: top surface at 3.3, spans z -0.8..-2.8
      g.add(box(2.8, 0.14, 2.0, deskTopM, 0, 3.23, -1.8));
      g.add(box(2.84, 0.1, 2.04, M.rubber, 0, 3.15, -1.8));
      g.add(box(2.5, 0.04, 1.7, M.steel, 0, 2.66, -1.95), box(2.5, 0.48, 0.04, M.steel, 0, 2.88, -2.78)); [-1.25, 1.25].forEach((sx) => g.add(box(0.04, 0.48, 1.7, M.steel, sx, 2.88, -1.95)));
      [-1.25, 1.25].forEach((sx) => { [-1.0, -2.6].forEach((sz) => g.add(tube(0.07, 2.6, sx, 1.3, sz), tube(0.055, 0.9, sx, 2.65, sz))); g.add(tube(0.05, 1.7, sx, 0.08, -1.8, Math.PI / 2)); });
      g.add(tube(0.05, 1.5, 1.05, 0.95, -1.75, Math.PI / 2));   // combo bar chair -> desk
      // books inside the book box + clutter on top
      g.add(book(1.0, 0.18, 1.3, ci + ri, -0.5, 2.78, -2.0), book(0.9, 0.15, 1.2, ci + ri + 3, 0.6, 2.76, -2.0, 0.1));
      const k = rD();
      if (k < 0.7) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.1), sheetM[Math.floor(rD() * 3)]); s.rotation.x = -Math.PI / 2; s.rotation.z = (rD() - 0.5) * 0.5; s.position.set(-0.4 + rD() * 0.5, 3.305, -1.9); g.add(s); }
      if (rD() < 0.8) { const p = cyl(0.03, 0.03, 0.75, pM[Math.floor(rD() * 3)], 0.6, 3.335, -1.6 - rD() * 0.6, 6); p.rotation.z = Math.PI / 2; p.rotation.y = rD() * 3; g.add(p); }
      if (rD() < 0.45) g.add(book(0.9, 0.12, 1.15, ci * 3 + ri, 0.75, 3.37, -2.1, (rD() - 0.5) * 0.4));
      if (rD() < 0.5) { const e = rb(0.3, 0.1, 0.16, 0.03, std('#f19bb0', 0.8), -0.9, 3.35, -1.2); e.rotation.y = rD(); g.add(e); }
      // backpack hanging on the chair back or on the floor
      const bp = backpack(ci * 3 + ri); if (rD() < 0.5) { bp.position.set(0, 1.7, 1.15); bp.rotation.x = 0.08; } else { bp.position.set(1.55, 0, 0.2 + rD() * 0.4); bp.rotation.set(-0.2, -1.4 + rD(), 0); } g.add(bp);
      marks[`p_desk_${ci + 1}_${ri + 1}`] = { p: [x, 0, z], ry: Math.PI, sit: true };
    }));
    marks.p_hero = Object.assign({}, marks.p_desk_3_2);
    marks.p_teacher = { p: [-3.6, 0, -8.3], ry: 0.25 };
    marks.p_stare_a = { p: [-0.75, 0, 0.25], ry: Math.PI / 2 };
    marks.p_stare_b = { p: [0.75, 0, 0.25], ry: -Math.PI / 2 };

    // ---------------- lockers (right wall) ----------------
    const lockW = 1.45, lockN = 7, lz0 = -1.3;
    for (let i = 0; i < lockN; i++) { const z = lz0 + i * lockW + lockW / 2, g = new THREE.Group(); g.position.set(X1 - 0.75, 0, z); room.add(g);
      g.add(box(1.4, 6.6, lockW - 0.04, M.locker, 0, 3.6, 0)); const dm = M.locker.clone(); dm.map = M.locker.map.clone(); dm.map.offset.set((i * 0.37) % 1, 0); dm.map.needsUpdate = true;
      const dr = new THREE.Mesh(new THREE.PlaneGeometry(lockW - 0.16, 6.4), M.locker); dr.rotation.y = -Math.PI / 2; dr.position.set(-0.705, 3.6, 0); g.add(dr);
      g.add(box(0.1, 0.7, 0.14, M.metal, -0.75, 3.7, lockW / 2 - 0.3), box(0.12, 0.25, 0.25, M.black, -0.78, 3.4, lockW / 2 - 0.3));
      if (i % 3 === 1) { const st = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), std(['#ffd23a', '#ff6ab0', '#6ae0ff'][i % 3], 0.5)); st.rotation.y = -Math.PI / 2; st.position.set(-0.72, 4.6 + (i % 2) * 0.6, -0.2); g.add(st); } }
    room.add(box(1.5, 0.5, lockN * lockW, std('#2a2e36', 0.7), X1 - 0.75, 0.25, lz0 + (lockN * lockW) / 2), box(1.5, 0.12, lockN * lockW, M.steel, X1 - 0.75, 6.96, lz0 + (lockN * lockW) / 2));

    // ---------------- back wall: cork board with drawings, bookshelf, cubbies ----------------
    const CB = { x0: -11.4, x1: -1.6, y0: 3.5, y1: 9.3 };
    const cbW = CB.x1 - CB.x0, cbH = CB.y1 - CB.y0, cbx = (CB.x0 + CB.x1) / 2, cby = (CB.y0 + CB.y1) / 2, zb = Z1 - 0.06;
    room.add(box(cbW, cbH, 0.1, W(M.cork, cbW / 4, cbH / 4), cbx, cby, zb, true));
    room.add(box(cbW + 0.4, 0.2, 0.2, M.metal, cbx, CB.y1 + 0.1, zb - 0.05), box(cbW + 0.4, 0.2, 0.2, M.metal, cbx, CB.y0 - 0.1, zb - 0.05), box(0.2, cbH + 0.4, 0.2, M.metal, CB.x0 - 0.1, cby, zb - 0.05), box(0.2, cbH + 0.4, 0.2, M.metal, CB.x1 + 0.1, cby, zb - 0.05));
    // cut-paper banner letters "THE WATCHER" above the board
    'THE WATCHER'.split('').forEach((ch, i) => { if (ch === ' ') return; const c = KIT.textTex(96, 96, (g, w, h) => { g.fillStyle = abcCol[i % 5]; g.font = `bold 84px ${FONT}`; g.textAlign = 'center'; g.fillText(ch, w / 2, 80); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), std('#fff', 0.8, 0, { map: c, transparent: true, alphaTest: 0.3 })); m.position.set(cbx - 4.0 + i * 0.8, 10.05 + Math.sin(i * 1.7) * 0.06, Z1 - 0.03); m.rotation.set(0, Math.PI, Math.sin(i * 2.3) * 0.12); room.add(m); });
    // kids' crayon drawings of THE WATCHER, all different
    function drawing(k) {
      const Wd = 256, Hd = 300, c = cnv(Wd, Hd), g = c.getContext('2d'), r = rng(500 + k * 31);
      const papers = ['#fbfaf4', '#f6efd9', '#dbe9f7', '#f8dbe4', '#fbf0b8', '#e2f1d8', '#fbfaf4'];
      g.fillStyle = papers[k % papers.length]; g.fillRect(0, 0, Wd, Hd);
      const crayon = ['#1b1b1b', '#e2312b', '#f28a1e', '#f5d02a', '#2f9a3d', '#2a5fd0', '#7d3fb8', '#6b4220', '#ec6aa8', '#8a8a8a'];
      const pick = () => crayon[Math.floor(r() * crayon.length)];
      const stroke = (pts, col, w = 5) => { for (let p = 0; p < 2; p++) { g.strokeStyle = col; g.globalAlpha = 0.75; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => { const jx = x + (r() - 0.5) * 3, jy = y + (r() - 0.5) * 3; i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); }); g.stroke(); } g.globalAlpha = 1; };
      const circ = (x, y, rx, ry = rx, n = 26) => { const p = []; const a0 = r() * 6; for (let i = 0; i <= n + 2; i++) { const a = a0 + (i / n) * Math.PI * 2, w = 1 + (r() - 0.5) * 0.08; p.push([x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]); } return p; };
      const scrib = (pathFn, col, dens = 3.2, ang = r() * 3) => { g.save(); g.beginPath(); pathFn(); g.clip(); g.strokeStyle = col; g.globalAlpha *= 0.55 + r() * 0.25; g.lineWidth = 3.5; g.beginPath(); const ca = Math.cos(ang), sa = Math.sin(ang); for (let t = -400; t < 400; t += dens * (0.7 + r() * 0.6)) { const x0 = 128 + ca * t - sa * 400, y0 = 150 + sa * t + ca * 400, x1 = 128 + ca * t + sa * 400, y1 = 150 + sa * t - ca * 400; g.moveTo(x0, y0); g.lineTo(x1, y1); } g.stroke(); g.restore(); };
      const fillCirc = (x, y, rx, ry, col) => scrib(() => g.ellipse(x, y, rx, ry, 0, 0, 7), col);
      const eye = (x, y, s, irisCol = '#f28a1e') => { fillCirc(x, y, s, s * 0.8, '#ffffff'); stroke(circ(x, y, s, s * 0.8), '#1b1b1b', 3); fillCirc(x + (r() - 0.5) * s * 0.4, y, s * 0.45, s * 0.45, irisCol); g.fillStyle = '#111'; g.beginPath(); g.arc(x, y, s * 0.18, 0, 7); g.fill(); };
      // sky + ground
      if (r() < 0.4) { g.save(); g.globalAlpha = 0.45; scrib(() => g.rect(0, 0, Wd, 200), ['#7fb2f0', '#2a3a8a', '#9a9ad8', '#1b1b1b'][Math.floor(r() * 4)], 6); g.restore(); }
      scrib(() => g.rect(0, 238, Wd, 70), '#3e9a3c', 3);
      // tiny house or stick kid at the bottom
      if (r() < 0.5) { const hx = 30 + r() * 150; scrib(() => g.rect(hx, 205, 46, 38), pick(), 5); stroke([[hx - 6, 207], [hx + 23, 182], [hx + 52, 207]], '#e2312b', 5); }
      else { const hx = 40 + r() * 170; stroke(circ(hx, 205, 9), '#1b1b1b', 3); stroke([[hx, 214], [hx, 238], [hx - 9, 252]], '#1b1b1b', 3); stroke([[hx, 238], [hx + 9, 252]], '#1b1b1b', 3); stroke([[hx - 12, 224], [hx + 12, 224]], '#1b1b1b', 3); }
      const cx = 128 + (r() - 0.5) * 30, cy = 112 + (r() - 0.5) * 20, S = 64 + r() * 18, type = k % 15, ec = r() < 0.7 ? '#f28a1e' : pick();
      switch (type) {
        case 0: { // storm cloud with angry eyes + rain
          scrib(() => { g.ellipse(cx - 40, cy, 45, 35, 0, 0, 7); g.ellipse(cx + 10, cy - 20, 55, 42, 0, 0, 7); g.ellipse(cx + 50, cy + 5, 40, 32, 0, 0, 7); }, '#8a8a8a');
          eye(cx - 25, cy, 15, ec); eye(cx + 25, cy, 15, ec); stroke([[cx - 45, cy - 22], [cx - 10, cy - 12]], '#1b1b1b', 5); stroke([[cx + 45, cy - 22], [cx + 10, cy - 12]], '#1b1b1b', 5);
          for (let i = 0; i < 9; i++) { const x = cx - 70 + i * 17; stroke([[x, cy + 45], [x - 6, cy + 70]], '#2a5fd0', 3); } break; }
        case 1: { // one giant eye with lashes and red veins
          scrib(() => g.ellipse(cx, cy, S * 1.4, S * 0.8, 0, 0, 7), '#ffffff'); stroke(circ(cx, cy, S * 1.4, S * 0.8), '#1b1b1b', 5);
          for (let i = 0; i < 7; i++) { const a = r() * 6; stroke([[cx + Math.cos(a) * S * 1.2, cy + Math.sin(a) * S * 0.6], [cx + Math.cos(a) * S * 0.6, cy + Math.sin(a) * S * 0.35]], '#e2312b', 2); }
          fillCirc(cx, cy, S * 0.5, S * 0.5, ec); g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy, S * 0.22, 0, 7); g.fill();
          for (let i = 0; i < 9; i++) { const a = Math.PI + 0.3 + (i / 8) * (Math.PI - 0.6); stroke([[cx + Math.cos(a) * S * 1.35, cy + Math.sin(a) * S * 0.75], [cx + Math.cos(a) * S * 1.7, cy + Math.sin(a) * S * 1.15]], '#1b1b1b', 4); } break; }
        case 2: { // spider moon
          for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2, kx = cx + Math.cos(a) * S * 1.4, ky = cy + Math.sin(a) * S * 1.1; stroke([[cx + Math.cos(a) * S * 0.8, cy + Math.sin(a) * S * 0.8], [kx, ky - 20], [kx + Math.cos(a) * 25, ky + 25]], '#1b1b1b', 5); }
          fillCirc(cx, cy, S * 0.85, S * 0.85, '#d8d8c8'); stroke(circ(cx, cy, S * 0.85), '#6b6b6b', 4); eye(cx - 20, cy - 8, 12, ec); eye(cx + 20, cy - 8, 12, ec); stroke([[cx - 22, cy + 25], [cx - 8, cy + 18], [cx + 8, cy + 25], [cx + 22, cy + 18]], '#1b1b1b', 4); break; }
        case 3: { // ghost
          scrib(() => { g.moveTo(cx - S, cy + S); g.lineTo(cx - S, cy); g.arc(cx, cy, S, Math.PI, 0); g.lineTo(cx + S, cy + S); for (let i = 0; i < 4; i++) g.lineTo(cx + S - (i + 0.5) * (S / 2), cy + S - (i % 2 ? 0 : 20)); }, '#ffffff', 5);
          stroke([[cx - S, cy + S], [cx - S, cy], ...circ(cx, cy, S, S, 20).slice(10, 21).map(([x, y]) => [x, Math.min(y, cy)]), [cx + S, cy + S]], '#1b1b1b', 4);
          eye(cx - 22, cy - 5, 13, ec); eye(cx + 22, cy - 5, 13, ec); stroke(circ(cx, cy + 32, 12, 16), '#1b1b1b', 4); break; }
        case 4: { // grumpy face
          fillCirc(cx, cy, S, S * 0.95, '#f5d02a'); stroke(circ(cx, cy, S, S * 0.95), '#f28a1e', 5);
          eye(cx - 25, cy - 10, 13, ec); eye(cx + 25, cy - 10, 13, ec); stroke([[cx - 45, cy - 38], [cx - 10, cy - 24]], '#1b1b1b', 7); stroke([[cx + 45, cy - 38], [cx + 10, cy - 24]], '#1b1b1b', 7);
          stroke([[cx - 28, cy + 35], [cx, cy + 24], [cx + 28, cy + 35]], '#1b1b1b', 6); break; }
        case 5: { // grey moon face with teeth (closest to the real thing)
          fillCirc(cx, cy, S * 1.05, S * 1.05, '#9a9a9a'); for (let i = 0; i < 5; i++) stroke(circ(cx + (r() - 0.5) * S, cy + (r() - 0.5) * S, 6 + r() * 8), '#6b6b6b', 3);
          eye(cx - 26, cy - 15, 16, '#f28a1e'); eye(cx + 26, cy - 15, 16, '#f28a1e');
          scrib(() => g.rect(cx - 38, cy + 20, 76, 24), '#ffffff', 4); stroke([[cx - 38, cy + 20], [cx + 38, cy + 20], [cx + 38, cy + 44], [cx - 38, cy + 44], [cx - 38, cy + 20]], '#1b1b1b', 3); for (let i = 1; i < 6; i++) stroke([[cx - 38 + i * 12.7, cy + 20], [cx - 38 + i * 12.7, cy + 44]], '#1b1b1b', 2); break; }
        case 6: { // octopus in the sky
          for (let i = 0; i < 6; i++) { const x0 = cx - 40 + i * 16, pts = []; for (let t = 0; t <= 6; t++) pts.push([x0 + Math.sin(t + i) * 10, cy + 30 + t * 13]); stroke(pts, '#7d3fb8', 8); }
          fillCirc(cx, cy, S * 0.9, S * 0.75, '#7d3fb8'); eye(cx - 20, cy, 12, ec); eye(cx + 20, cy, 12, ec); break; }
        case 7: { // giant hand coming out of clouds
          fillCirc(cx, cy + 15, 30, 40, '#f2c79a'); for (let i = 0; i < 4; i++) fillCirc(cx - 24 + i * 16, cy - 32, 7, 22, '#f2c79a'); fillCirc(cx + 34, cy + 5, 20, 8, '#f2c79a');
          stroke(circ(cx, cy + 15, 30, 40), '#6b4220', 3); eye(cx, cy + 15, 12, ec);
          scrib(() => { g.ellipse(cx - 50, cy - 70, 55, 25, 0, 0, 7); g.ellipse(cx + 40, cy - 75, 60, 28, 0, 0, 7); }, '#8a8a8a'); break; }
        case 8: { // blob with many eyes
          scrib(() => { g.moveTo(cx - S, cy + 20); g.bezierCurveTo(cx - S * 1.4, cy - S, cx + S * 1.4, cy - S * 1.2, cx + S, cy + 20); g.bezierCurveTo(cx + S * 0.5, cy + S, cx - S * 0.5, cy + S * 0.7, cx - S, cy + 20); }, '#2f9a3d');
          for (let i = 0; i < 6; i++) eye(cx - 45 + (i % 3) * 45, cy - 18 + Math.floor(i / 3) * 34, 9 + r() * 6, ec); break; }
        case 9: { // black sun with rays
          for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; stroke([[cx + Math.cos(a) * S * 0.9, cy + Math.sin(a) * S * 0.9], [cx + Math.cos(a) * S * 1.5, cy + Math.sin(a) * S * 1.5]], '#1b1b1b', 5); }
          fillCirc(cx, cy, S * 0.85, S * 0.85, '#1b1b1b'); eye(cx - 20, cy - 6, 12, ec); eye(cx + 20, cy - 6, 12, ec); break; }
        case 10: { // giant cat face
          scrib(() => { g.moveTo(cx - S, cy - 10); g.lineTo(cx - S * 0.9, cy - S * 1.2); g.lineTo(cx - S * 0.3, cy - S * 0.7); g.lineTo(cx + S * 0.3, cy - S * 0.7); g.lineTo(cx + S * 0.9, cy - S * 1.2); g.lineTo(cx + S, cy - 10); g.ellipse(cx, cy, S, S * 0.75, 0, 0, Math.PI); }, '#f28a1e');
          eye(cx - 24, cy - 8, 13, '#2f9a3d'); eye(cx + 24, cy - 8, 13, '#2f9a3d'); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) stroke([[cx + s * 18, cy + 18 + i * 5], [cx + s * 70, cy + 8 + i * 12]], '#1b1b1b', 2); break; }
        case 11: { // tornado with eyes
          for (let i = 0; i < 8; i++) stroke(circ(cx + Math.sin(i) * 8, cy - 55 + i * 18, S * (1.1 - i * 0.12), 9), '#6b6b6b', 6); eye(cx - 18, cy - 20, 10, ec); eye(cx + 18, cy - 20, 10, ec); break; }
        case 12: { // UFO jellyfish
          fillCirc(cx, cy - 10, S, S * 0.45, '#2a5fd0'); fillCirc(cx, cy - 30, S * 0.45, S * 0.35, '#7fd8f0'); for (let i = 0; i < 5; i++) stroke([[cx - 40 + i * 20, cy + 20], [cx - 50 + i * 25, cy + 80]], '#f5d02a', 4); eye(cx, cy - 32, 11, ec); break; }
        case 13: { // pure dark scribble with question marks
          scrib(() => g.ellipse(cx, cy, S * 1.2, S, 0, 0, 7), '#1b1b1b', 4, 0.6); scrib(() => g.ellipse(cx, cy, S * 1.2, S, 0, 0, 7), '#1b1b1b', 5, 2.2);
          eye(cx - 25, cy, 9, ec); eye(cx + 25, cy, 9, ec); g.fillStyle = '#e2312b'; g.font = `bold 40px ${FONT}`; g.fillText('???', cx - 35, cy + S + 40); break; }
        default: { // square robot head
          scrib(() => g.rect(cx - S * 0.8, cy - S * 0.7, S * 1.6, S * 1.4), '#8a8a8a'); stroke([[cx - S * 0.8, cy - S * 0.7], [cx + S * 0.8, cy - S * 0.7], [cx + S * 0.8, cy + S * 0.7], [cx - S * 0.8, cy + S * 0.7], [cx - S * 0.8, cy - S * 0.7]], '#1b1b1b', 4);
          stroke([[cx, cy - S * 0.7], [cx, cy - S * 1.1]], '#1b1b1b', 4); fillCirc(cx, cy - S * 1.15, 8, 8, '#e2312b'); eye(cx - 22, cy - 10, 14, ec); eye(cx + 22, cy - 10, 14, ec); stroke([[cx - 25, cy + 25], [cx + 25, cy + 25]], '#1b1b1b', 5); }
      }
      // title + kid name
      g.globalAlpha = 0.85; g.fillStyle = pick() === '#f5d02a' ? '#e2312b' : pick(); g.font = `bold ${22 + Math.floor(r() * 8)}px ${FONT}`; g.textAlign = 'center';
      const titles = ['THE WATCHER', 'the watcher', 'WATCHER!!', 'THE WACHER', 'DONT LOOK', 'THE WATCHR', 'IT SEES U', 'THE WATCHER :('];
      g.save(); g.translate(128, r() < 0.5 ? 30 : 285); g.rotate((r() - 0.5) * 0.12); g.fillText(titles[Math.floor(r() * titles.length)], 0, 0); g.restore();
      const names = ['Maya', 'Leo', 'Sam', 'Zoe', 'Eli', 'Ava', 'Noah', 'Lily', 'Max', 'Ruby', 'Ben', 'Ivy', 'Jay', 'Mia', 'Tom'];
      g.font = `15px ${FONT}`; g.fillStyle = '#333'; g.textAlign = 'right'; g.fillText('by ' + names[k % names.length], Wd - 10, Hd - 8); g.globalAlpha = 1;
      // crayon tooth: break up the wax with paper grain
      const n = tnoise(600 + k, 90), im = g.getImageData(0, 0, Wd, Hd), d = im.data, pc = new THREE.Color(papers[k % papers.length]); pc.convertLinearToSRGB();
      const P = [pc.r * 255, pc.g * 255, pc.b * 255];
      for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) { const i = (y * Wd + x) * 4, t = n(x / Wd, y / Hd); if (t > 0.68) { const f = Math.min(0.8, (t - 0.68) * 2.2); d[i] += (P[0] - d[i]) * f; d[i + 1] += (P[1] - d[i + 1]) * f; d[i + 2] += (P[2] - d[i + 2]) * f; } }
      g.putImageData(im, 0, 0);
      return c;
    }
    const drawings = new THREE.Group(); room.add(drawings);
    const pinM = ['#e2312b', '#2a5fd0', '#f5d02a', '#2f9a3d'].map((c) => std(c, 0.3, 0.1)), pinGeo = new THREE.SphereGeometry(0.06, 10, 8);
    const DC = 9, DR = 5, dw = cbW / DC, dh = cbH / DR, rP = rng(700);
    for (let j = 0; j < DR; j++) for (let i = 0; i < DC; i++) {
      const k = j * DC + i, c = drawing(k), m = new THREE.Mesh(new THREE.PlaneGeometry(dw * 0.88, dw * 0.88 * (300 / 256)), std('#fff', 0.85, 0, { map: tex(c) }));
      const h = dw * 0.88 * (300 / 256), y = CB.y1 - dh * (j + 0.5) + (rP() - 0.5) * 0.08;
      m.position.set(CB.x1 - dw * (i + 0.5) + (rP() - 0.5) * 0.08, y, zb - 0.06 - k * 0.0004); m.rotation.set(0, Math.PI, (rP() - 0.5) * 0.12); drawings.add(m);
      [-1, 1].forEach((sx) => { const pin = new THREE.Mesh(pinGeo, pinM[(k + sx + 2) % 4]); pin.position.set(m.position.x + sx * (dw * 0.44 - 0.08), y + h / 2 - 0.08, zb - 0.12); drawings.add(pin); });
    }
    props.drawings = drawings;
    // bookshelf (x 0..5) and cubbies (x 6..11)
    const shelf = new THREE.Group(); shelf.position.set(2.6, 0, Z1 - 0.65); room.add(shelf);
    const sw = 5.2, sh = 5.6;
    shelf.add(box(sw, sh, 0.1, M.oak, 0, sh / 2, 0.55), box(0.18, sh, 1.2, M.oak, -sw / 2, sh / 2, 0), box(0.18, sh, 1.2, M.oak, sw / 2, sh / 2, 0), box(sw, 0.18, 1.2, M.oak, 0, sh, 0));
    const bookGeo = new THREE.BoxGeometry(1, 1, 1), rB = rng(800);
    [0.15, 1.5, 2.85, 4.2].forEach((y, si) => { shelf.add(box(sw, 0.14, 1.15, M.oak, 0, y, 0)); let x = -sw / 2 + 0.2; while (x < sw / 2 - 0.4) { const w = 0.14 + rB() * 0.16, h = 0.8 + rB() * 0.4; if (rB() < 0.08) { x += 0.4; continue; } const b = new THREE.Mesh(bookGeo, bookM[Math.floor(rB() * bookM.length)]); b.scale.set(w, h, 0.8 + rB() * 0.2); b.position.set(x + w / 2, y + 0.07 + h / 2, 0.05); if (rB() < 0.1) b.rotation.z = 0.25; shelf.add(b); x += w + 0.02; } });
    // potted plant on top of the shelf
    const pot = (s, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); g.add(cyl(0.45 * s, 0.33 * s, 0.8 * s, std('#b75a34', 0.8), 0, 0.4 * s, 0, 16), cyl(0.48 * s, 0.48 * s, 0.12 * s, std('#a54e2c', 0.8), 0, 0.78 * s, 0, 16));
      const lm = [std('#3f8a32', 0.6), std('#58a83e', 0.6)], rr = rng(Math.floor(x * 100 + z)); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.35 * s, 10, 6), lm[i % 2]); l.scale.set(0.45, 0.12, 1.2); const a = (i / 9) * Math.PI * 2; l.position.set(Math.cos(a) * 0.35 * s, (0.95 + rr() * 0.6) * s, Math.sin(a) * 0.35 * s); l.rotation.set(0.3 + rr() * 0.6, -a, 0); g.add(l); } return g; };
    shelf.add(pot(1, 1.6, sh + 0.09, 0));
    room.add(pot(2.1, X0 + 1.3, 0, Z0 + 1.2));   // big floor plant front-left corner
    [-6, 0, 6].forEach((z, i) => room.add(pot(0.6, X0 + 0.25, WY0 + 0.07, z + 1.6 - i * 0.8)));   // window-sill plants
    const cub = new THREE.Group(); cub.position.set(8.7, 0, Z1 - 0.75); room.add(cub);
    const cw = 5.4, ch = 4.6, nC = 4, nR = 3, rC2 = rng(900), binCols = ['#e3483c', '#3d7ad6', '#3fa35a', '#f2a63a'];
    cub.add(box(cw, ch, 0.1, M.maple, 0, ch / 2, 0.65));
    for (let i = 0; i <= nC; i++) cub.add(box(0.12, ch, 1.3, M.maple, -cw / 2 + (i * cw) / nC, ch / 2, 0));
    for (let j = 0; j <= nR; j++) cub.add(box(cw, 0.12, 1.3, M.maple, 0, 0.2 + (j * (ch - 0.2)) / nR, 0));
    for (let i = 0; i < nC; i++) for (let j = 0; j < nR; j++) { const x = -cw / 2 + (i + 0.5) * (cw / nC), y = 0.26 + (j * (ch - 0.2)) / nR, t = rC2();
      if (t < 0.45) { const bp = backpack(i + j * 4 + 2); bp.scale.setScalar(0.8); bp.position.set(x, y, 0.05); bp.rotation.y = Math.PI + (rC2() - 0.5) * 0.4; cub.add(bp); }
      else if (t < 0.85) cub.add(rb(1.1, 0.9, 1.0, 0.08, std(binCols[(i + j) % 4], 0.5), x, y + 0.45, 0)); }
    // pencil sharpener on the front wall near the door
    room.add(rb(0.45, 0.5, 0.5, 0.06, M.metal, 10.7, 4.2, Z0 + 0.3)); room.add(cyl(0.05, 0.05, 0.4, M.black, 10.95, 4.3, Z0 + 0.35, 8).rotateZ(Math.PI / 2));

    // ---------------- lights ----------------
    shadow(scene);
    scene.traverse((m) => { if (m.isMesh && (m.userData.noShadow || (m.material && (m.material.isMeshBasicMaterial || m.material.transparent)))) m.castShadow = false; });
    out.traverse((m) => { if (m.isMesh) m.castShadow = false; });
    const hemi = new THREE.HemisphereLight('#fff2df', '#9a8a70', 1.3); scene.add(hemi);
    const sun = new THREE.DirectionalLight('#ffd9a6', 14); const sc = V(-1, 3, 0); sun.position.copy(sc).addScaledVector(sunDir, -40); sun.target.position.copy(sc);
    sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 10, far: 80 }); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; sun.shadow.radius = 2;
    scene.add(sun, sun.target);
    const fl = [];
    [[-6, -1], [0, -1], [6, -1], [0, 7]].forEach(([x, z]) => { const p = new THREE.PointLight('#fff1dc', 70, 0, 2); p.position.set(x, 10.6, z); scene.add(p); fl.push(p); });
    const bounce = new THREE.PointLight('#ffcf98', 30, 0, 2); bounce.position.set(-5, 0.6, 0); scene.add(bounce);   // sunlit floor bounce
    // sun shafts + dust
    const bmat = RBX.beamMat('#ffe2b0', 0.05);
    WINS.forEach((zc, wi) => { const yb = [6.2, 5.4, 6.8][wi]; scene.add(RBX.beam(V(X0 - 0.2, (WY0 + yb) / 2, zc), sunDir, WW, (yb - WY0) * 0.8, 13, bmat)); });
    (function dust() {
      const r = rng(5), N = 500, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { const zc = WINS[i % 3], p = V(X0, WY0 + r() * 6, zc + (r() - 0.5) * WW).addScaledVector(sunDir, r() * 14); pos.set([p.x, p.y, p.z], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.03, map: tex(c), color: new THREE.Color(2.4, 2.1, 1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 })));
    })();

    function mood(name) {
      const on = name !== 'dim';
      panels.forEach((p) => { p.material.emissiveIntensity = on ? 2.4 : 0.0; }); fl.forEach((p) => { p.intensity = on ? 70 : 0; });
      sun.intensity = name === 'dim' ? 6 : 14; hemi.intensity = name === 'dim' ? 0.6 : 1.05;
    }
    mood('day');

    const views = {
      wide: { p: [10.2, 8.6, 9.4], l: [-2.5, 4.2, -6], fov: 62 },
      high: { p: [3.0, 11.4, 9.6], l: [-0.5, 0, -2.0], fov: 72 },
      desk: { p: [5.7, 4.7, 0.0], l: [2.5, 3.8, 1.1], fov: 42 },
      bell: { p: [8.6, 7.3, -2.0], l: [11.8, 8.0, -3.6], fov: 45 },
      drawings: { p: [-6.1, 6.4, 6.0], l: [-6.1, 6.4, 10], fov: 50 },
      board: { p: [0.3, 6.0, 2.0], l: [0, 5.95, -10], fov: 42 },
      stare: { p: [0.4, 4.4, -5.4], l: [0, 3.7, 0.25], fov: 56 },
    };
    return { scene, grade: 'day', marks, props, mood, views };
  };
})();
